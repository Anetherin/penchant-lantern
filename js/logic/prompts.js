'use strict';
/* =====================================================================
   IMAGE PROMPTS
   ===================================================================== */
function raceLook(w, scene){ const ed = typeof effDesign==='function' ? effDesign(w, scene) : (w&&w.design)||{}; if(ed.raceLook) return ed.raceLook; const sd = w.sub ? subData(w.race, w.sub) : null; if(sd && sd.look) return sd.look; if(w.race==='beastkin') return (w.sub||'fox')+' beastkin woman'; return (RACES[w.race]||RACES.human).look || 'woman'; }
// keepOn (data/characters.json): something she won't take off until trust reaches keepOn.trust.
// With aside:true it's a garment, so the rest of her clothes get pulled aside at most.
function keepOnRule(w){ const k = w.key && NAMED[w.key] && NAMED[w.key].keepOn; return k && w.trust < (k.trust||90) ? k : null; }
// A bathing scene (scenes.json / dates.json image: "bath": true, "towel": true, act:*~~bath, or context date_* with bath:true).
function isBathScene(scene){
  if(!scene) return false;
  const P = sceneParts(scene);
  if((P.base.startsWith('act:') || P.base.startsWith('samact:')) && (P.ctx==='bath' || (typeof gTeaseIsBath==='function' && gTeaseIsBath(P.ctx)) || (typeof isoIsBath==='function' && isoIsBath(P.ctx)))) return true;
  const sc = SCENES[P.base] || SCENES[P.base.split('.')[0]];
  return !!((sc && (sc.bath || sc.towel)) || (P.ctx && isBathScene(P.ctx)));
}
// A swimming scene (dates.json image: "swim": true). Not a bath scene: no towel, stays where it is.
const isSwimScene = scene => { const sc = scene && SCENES[sceneBase(scene)]; return !!(sc && sc.swim); };
// Invitations, dates and other posed pictures (scenes.json / dates.json image "undress" or "tease": true): she's showing off for Sam,
// so she poses and teases rather than looking pulled apart. Not bath, robe or mishap scenes (caught off guard) or services.
const TEASE_POSES = (needData('snippets').poses || {}).tease || [];
function teaseScene(scene){
  if(!scene || isSvcScene(scene) || isBathScene(scene)) return false;
  const b = sceneBase(scene), sc = SCENES[b];
  if(!sc || sc.robe || sc.tease === false || /^(shower|walkin|enc_jealous|enc_reckless|enc_waiting)$/.test(b)) return false;
  return !!(sc.undress || sc.tease);
}
function clothText(w, cloth, scene){
  const keep = keepOnRule(w);
  if(keep) return clothTextBase(w, keep.aside && cloth!=='dressed' ? 'aside' : cloth, scene, keep.aside) + ', still keeping ' + keep.item + ' on';
  return clothTextBase(w, cloth, scene);
}
function clothTextBase(w, cloth, scene, noTowel){
  if(cloth==='aside'){
    const T = Object.assign({}, DEFAULT_CLOTH_TEXT, Object.fromEntries(Object.entries(SET.clothText||{}).filter(([k,v])=>v)));
    const ut = underText(w, scene);
    return ((!ut && T.aside_commando) || T.aside || T.partial || T.dressed).replace(/\{outfit\}/g, outfitText(w, scene)).replace(/\{underwear\}/g, ut || 'bare skin, nothing underneath');
  }
  // Swim scenes: with a bath-compatible outfit (swimsuit...) she swims in it instead of clothes or underwear (nude stays nude)
  if(cloth!=='nude' && swimOutfit(w, scene)){
    return outfitText(w, scene);
  }
  // Bath scenes: only bath-compatible outfits (wardrobe.json "bath": true) stay on; otherwise a white towel or nothing (never "partial" street clothes).
  if(!noTowel && isBathScene(scene)){
    if(cloth==='dressed' && getOutfit(w, scene).bath) return outfitText(w, scene);
    if(cloth!=='nude') return 'wrapped only in a white towel';
  }
  const T = Object.assign({}, DEFAULT_CLOTH_TEXT, Object.fromEntries(Object.entries(SET.clothText||{}).filter(([k,v])=>v)));
  let t = T[cloth];
  if(!t && cloth==='nude') t = T.partial;
  const ut = underText(w, scene);
  const sc = scene && SCENES[sceneBase(scene)];
  // night-visit scenes (scenes.json robe:true): a robe over her undergarments, loosely tied (partial) or hanging open (under)
  if(sc && sc.robe && (cloth==='under' || cloth==='partial')) return (cloth==='partial' ? T.robe_loose : T.robe_open).replace(/\{underwear\}/g, ut || 'bare skin, nothing underneath');
  // Modest ladies during intimate scenes: clothes pulled aside rather than removed
  // (a dressed Modest lady giving a massage or a kiss just stays dressed: only services that bare her or a partial level pull things aside)
  if(has(w,'Modest') && (cloth==='partial' || (cloth==='dressed' && exposedAct(sceneAct(scene)))) && isSvcScene(scene)){
    t = (!ut && T.aside_commando) || T.aside || t;
  }
  // posed scenes (invitations, dates: image undress / tease): teasing wording instead of dishevelled clothes (snippets.json → clothing.*_tease)
  if(cloth!=='dressed' && teaseScene(scene) && T[cloth + '_tease']) t = T[cloth + '_tease'];
  return (t||T.dressed).replace(/\{outfit\}/g, outfitText(w, scene)).replace(/\{underwear\}/g, ut || 'bare skin, nothing underneath');
}
// Her body in one phrase: height, build + figure, bust (the build word from her design and the body figure used to be two separate,
// sometimes clashing, phrases). A build word the figure already says is dropped, and so is a height the build already says ("very tall").
// The figure words the build already says are dropped from the figure too ("tall and curvy" + "curvy figure" → "tall and curvy figure").
// The average options have no wording (body.json img ""), so an average bust or height adds nothing; noBust leaves the bust out
// (services that put it up front with the pose: services.json → image.bust).
function bodyDesc(w, scene, noBust){
  const b = bodyOf(w, scene), img = k => ((bodyOpts(k)[b[k]]||{}).img || '').trim(), d = effDesign(w, scene);
  const build = (d.build||'').trim(), words = s => s.toLowerCase().split(/[^a-z]+/).filter(x=>x.length>2);
  let height = img('height'), fig = img('figure');
  if(height && build && words(height).every(x=>words(build).includes(x))) height = '';
  const extra = build && !words(build).every(x=>words(fig).includes(x)) ? build : '';
  if(extra && fig) fig = fig.split(/\s+/).filter(x=>!words(build).includes(x.toLowerCase())).join(' ') || 'figure';
  const figure = [extra, fig || (extra ? 'figure' : '')].filter(Boolean).join(' ').replace(/,\s*$/, '');
  return [height, figure, !noBust && img('bust')].filter(Boolean).join(', ');
}
// her bust wording on its own (empty for an average bust), for poses that are about her breasts
const bustText = (w, scene) => ((bodyOpts('bust')[bodyOf(w, scene).bust]||{}).img || '').trim();
// Hair, eyes and skin read as one phrase each. A colour with a tail ("black with glowing gold tips", "bronze that glows faintly")
// keeps the noun next to the colour ("black hair with glowing gold tips"); the style follows the colour ("crimson hair, loose waves").
const TAIL = /\s+(?=(with|that|which|fading|streaked|tipped|like|shot)\b)|,\s*/i;
function nounPhrase(val, noun){
  const v = String(val||'').trim(); if(!v) return '';
  const m = v.split(TAIL); if(m.length < 2) return `${v} ${noun}`;
  const i = v.search(TAIL); return `${v.slice(0, i).trim()} ${noun} ${v.slice(i).replace(/^,\s*/, ', ').trim()}`.replace(/\s+,/g, ',');
}
function hairText(d){
  const c = nounPhrase(d.hairColor, 'hair'), s = (d.hairStyle||'').trim();
  if(!c) return s ? `${s} hair` : '';
  return s ? `${c}, ${s}` : c;
}
// Accessories (character design.accessories + outfit.accessories): shown based on w.accState (or each item's default accState: dressed / under / always / off).
function accVisible(st, cloth, scene, w){
  if(st==='off') return false;
  if(st==='dressed') return cloth==='dressed' && !(isBathScene(scene) && !getOutfit(w, scene).bath);
  if(st==='under') return cloth!=='nude';
  return true;
}
function accessoryText(w, cloth, scene){
  const d = (w && w.design) || {}, o = (w && w.outfit && getOutfit(w, scene)) || {};
  const da = (d.accessories || d.gear || '').trim(), oa = (o.accessories || '').trim();
  const dOn = da && accVisible(itemAccState(w, da, d.accState || (d.gear && !d.accessories ? 'dressed' : undefined)), cloth, scene, w);
  const oOn = oa && accVisible(itemAccState(w, oa, o.accState), cloth, scene, w);
  const overlap = dOn && oOn && (/glasses|spectacles|monocle/i.test(da) && /glasses|spectacles|monocle/i.test(oa));
  return [dOn ? da : '', (oOn && !overlap) ? oa : ''].filter(Boolean).join(', ');
}
// features: permanent physical traits or items never taken off. accessories: worn items controlled by accState.
function featureText(w, cloth, scene){
  const d = effDesign(w, scene), P = typeof PEOPLE!=='undefined' ? PEOPLE : {}, f = (d.features||'').trim();
  const skip = (P.featureSkip||[]).includes(f);
  return [!skip ? f : '', accessoryText(w, cloth, scene)].filter(Boolean).join(', ');
}
// Pubic hair wording (snippets.json → clothing.pubic; {hair} = her hair color, design.pubic overrides it for one lady).
function pubicText(w, scene){
  const d = effDesign(w, scene);
  if(d.pubic) return d.pubic;
  const t = ((SET.clothText||{}).pubic || DEFAULT_CLOTH_TEXT.pubic || 'natural {hair} pubic hair');
  const hc = String(d.hairColor||'').split(TAIL)[0].trim();   // just the colour: "black with glowing gold tips" → "black"
  return t.replace(/\{hair\}/g, hc).replace(/\s{2,}/g,' ').trim();
}
// features without accessories: the second woman in a two-women picture keeps what makes her recognizable (ears, horns,
// markings) but not her jewellery, which only lengthens the prompt and gets drawn on the wrong woman
function featureOnly(w, scene){ const d = effDesign(w, scene), f = (d.features||'').trim(), P = typeof PEOPLE!=='undefined' ? PEOPLE : {}; return (P.featureSkip||[]).includes(f) ? '' : f; }
// opt.noAcc: see featureOnly. opt.noBust: the bust goes up front with the pose instead (services.json → image.bust). opt.futa: she is the futanari in a
// two-women scene, so her look names her one ("beautiful adult elf futanari") instead of "woman".
function charDesc(w, cloth, scene, opt){
  const d = effDesign(w, scene), o = opt || {};
  let look = raceLook(w, scene);
  if(o.futa) look = /\bwoman\b/i.test(look) ? look.replace(/\bwoman\b/i, 'futanari') : look + ' futanari';
  return [`beautiful adult ${look}`, hairText(d), d.eyes && nounPhrase(d.eyes, 'eyes'),
    d.skin && nounPhrase(d.skin, 'skin'), bodyDesc(w, scene, o.noBust), o.noAcc ? featureOnly(w, scene) : featureText(w, cloth || 'dressed', scene)].filter(Boolean).join(', ');
}
// A flat-chested lady's nude wording says chest, not breasts.
const chestFix = (w, scene, t) => bodyOf(w, scene).bust==='flat' ? String(t).replace(/\bbare breasts\b/gi, 'bare flat chest') : t;
// Her clothes as one phrase, pubic hair filled in, and named for services that show her bare between the legs.
function clothesFor(w, cloth, scene){
  const act = sceneAct(scene);
  let c = clothText(w, cloth, scene).replace(/\{pubic\}/g, pubicText(w, scene));
  if(act && exposedAct(act) && cloth!=='dressed' && !/pubic|hairy/i.test(c)) c += (cloth==='under' ? ', panties pulled aside, ' : ', ') + pubicText(w, scene);
  return chestFix(w, scene, c);
}
// The other woman in a scene with two (duo, pair) is as dressed as the scene, at most as far as she is comfortable with.
function matchCloth(o, cloth, scene){
  const ix = x => CLOTH.findIndex(y=>y.id===x), mine = ix(cloth), hers = ix(defaultCloth(o, scene));
  let c = CLOTH[Math.max(0, mine < 0 ? hers : Math.min(mine, hers))].id;
  if(c==='under' && o.under==='none') c = 'partial';
  return c;
}
// Two women in one picture (pair: / cpair: without Sam, duo: threesomes with him): no outfits, which only lengthen the prompt
// and get swapped between the two. Each woman is in her underwear, or nude when the scene is nude or she wears none
// (scenes.json → pairCloth: false turns this off).
const pairScene = scene => /^(c?pair|duo):/.test(sceneBase(scene)) && SCENE_DATA.pairCloth !== false;
const pairCloth = (w, c) => c==='nude' || w.under==='none' ? 'nude' : 'under';
// One person's block: label, look, clothes (and whatever else follows), with repeats inside it removed.
const personBlock = (label, bits) => dedupeSegs((label ? label + ': ' : '') + bits.filter(Boolean).join(', '));
// Drops repeated comma segments (case-insensitive) and every "pov" tag after the first. Used per block, never across two
// people's blocks: both of them can be "completely nude".
function dedupeSegs(t){
  const seen = new Set(); let pov = false;
  return String(t||'').split(/,\s*/).filter(s=>{ const k = s.trim().toLowerCase().replace(/[.\s]+$/,''); if(!k) return false;
    if(k==='pov'){ if(pov) return false; pov = true; return true; }
    if(seen.has(k)) return false; seen.add(k); return true; }).join(', ');
}
// act_<id> snippets now live on the service (image.extra); older browser edits still win
const getSnippet = k => { const a = k.startsWith('act_') && actById(k.slice(4)); const t = (SET.snippets[k] || (a && a.image && a.image.extra) || SCENE_SNIPPETS[k] || '').trim(); return isTodo(t) ? '' : t; };
// Services whose picture shows her bare between the legs (services.json → image.exposed); pubic hair is named for those
// unless the clothing wording already covers it.
const exposedAct = id => !!(((actById(id)||{}).image||{}).exposed);
function sceneAct(sceneKey){ const b = sceneBase(sceneKey); return b.startsWith('act:') ? b.slice(4) : /^(samact|duo|pair|cpair|demo|samfc):/.test(b) ? b.split(':')[1] : null; }
// Safety net: Perchance reads {…} in a prompt as its own syntax and complains, so a placeholder that slipped through unfilled
// is dropped and any stray brace removed.
const promptSafe = t => cleanText(String(t).replace(/\{\w*\}/g, '').replace(/[{}]/g, ''));
function buildPrompt(w, sceneKey, cloth){
  if(w.male) return promptSafe([SET.style, 'adult man', w.look, 'upper body portrait, looking at viewer', 'dramatic lighting'].join(', '));
  if(w.fclient) return fclientPrompt(w, sceneKey, cloth);
  cloth = cloth || defaultCloth(w, sceneKey);
  if(pairScene(sceneKey)) cloth = pairCloth(w, cloth);
  const sc = sceneInfo(sceneKey, w, cloth);
  const act = sceneAct(sceneKey), svc = isSvcScene(sceneKey), PP = SCENE_DATA.people || {}, base = sceneBase(sceneKey);
  const clothes = clothesFor(w, cloth, sceneKey);
  const parts = [SET.style];
  // intimate scenes lead with who is in the picture and what they're doing: image models weigh the start of a prompt most, and a long
  // description first lets the pose drift to whatever the model draws most often
  if(svc){
    const n = sc.people ? PP[sc.people] : base.startsWith('orgy:') ? (PP.orgy||'').replace('{n}', base.slice(5).split(',').length) : base.startsWith('duo:') ? PP.duo : base.startsWith('pair:') ? (PP['pair_' + base.split(':')[2].replace('selffuta','futa')] || PP.pair_fem) : base.startsWith('cpair:') ? (PP['pair_' + base.split(':')[2]] || PP.pair_fem) : base.startsWith('demo:') ? PP.demo : sc.pov ? PP.pov : sc.client ? PP.client : PP.solo;
    const duo = /^(duo|pair|cpair|orgy):/.test(base);   // a duo's "client" is the second woman's full description: it goes after hers
    // services about her breasts (services.json → image.bust) name her bust right after the pose, where the model ties it to the act
    const bustUp = act && ((actById(act)||{}).image||{}).bust ? bustText(w, sceneKey) : '';
    // the head-count tags already say pov; the pov snippet at the end sets the framing
    const lead = dedupeSegs([n, !duo && sc.client, sc.comp, bustUp, sc.snip && getSnippet(sc.snip), sc.snip2 && getSnippet(sc.snip2)].filter(Boolean).join(', '));
    // her block (label, look, clothes, extra, expression) stays together so the expression isn't read as the other woman's
    const me = personBlock(sc.selfTag, [charDesc(w, cloth, sceneKey, {noBust: !!bustUp, futa: !!sc.selfFuta}), clothes, sc.selfExtra, sc.expr]);
    parts.push(lead, ...(duo && sc.otherFirst ? [sc.client, me] : [me, duo && sc.client]), dedupeSegs([sc.setting, sc.pov && getSnippet('pov')].filter(Boolean).join(', ')));
    // one woman: nothing needs saying twice anywhere ("bare breasts" in the pose and her clothes). Two: only inside each block.
    const all = parts.filter(Boolean).join(', ');
    return promptSafe(stripTodo(duo ? all : dedupeSegs(all)));
  }
  if(sc.pov) parts.push("first-person POV, from the viewer's perspective");
  parts.push(charDesc(w, cloth, sceneKey), clothes);
  if(sc.sam && !sc.pov) parts.push('together with ' + SAM_DESC);
  if(sc.client) parts.push(sc.client);
  // pose, expression (scene override, or her default expression, or portrait fallback) and the scene's own wording, then where it happens
  const ed = effDesign(w, sceneKey), defExpr = (ed.expression||'').trim();
  const mishap = /^(shower|walkin|enc_jealous|enc_reckless|enc_waiting)$/.test(base);
  const expr = sc.expr || (!mishap ? defExpr : '') || (base==='portrait' ? 'gentle smile' : '');
  const comp = (defExpr && !mishap && sc.comp) ? sc.comp.replace(/,\s*(gentle|friendly|cheerful|patient|attentive)\s+smile$/i, '') : sc.comp;
  parts.push(comp, cloth!=='dressed' && teaseScene(sceneKey) && TEASE_POSES.length ? pick(TEASE_POSES) : '', expr);
  if(sc.snip) parts.push(getSnippet(sc.snip));
  if(sc.snip2) parts.push(getSnippet(sc.snip2));
  parts.push(sc.setting);
  if(sc.pov) parts.push(getSnippet('pov'));
  return promptSafe(stripTodo(dedupeSegs(parts.filter(Boolean).join(', '))));
}
// Sam with a woman client on the Floor (samfc:<service>:<look>:<house id>): his POV, like his own scenes, with her look from scenes.json →
// femClients and clothes by the service's tier (femClientTier). The house's room is the setting.
function fclientCloth(sceneKey){ const id = sceneBase(sceneKey).split(':')[1], c = ((SCENE_DATA.femClientTier||{})[actTier(id)]) || 'dressed'; return c==='under' && exposedAct(id) ? 'nude' : c; }   // bared services (image.exposed) show her nude
function fclientPrompt(w, sceneKey, cloth){
  const id = sceneBase(sceneKey).split(':')[1], PP = SCENE_DATA.people || {}, c = cloth || fclientCloth(sceneKey);
  const hid = sceneBase(sceneKey).split(':')[3], h = (S && S.houses && (S.houses.find(x=>x.id===hid) || S.houses[0])) || null, wear = (SCENE_DATA.femClientCloth||{})[c] || '';
  const lead = dedupeSegs([PP.pov, actPose(id, 'sam'), getSnippet('act_'+id)].filter(Boolean).join(', '));
  const her = dedupeSegs(['beautiful adult woman, a client', w.look, c==='dressed' ? 'in an elegant evening dress' : wear, exprText('into', id)].filter(Boolean).join(', '));
  return promptSafe(stripTodo([SET.style, lead, her, dedupeSegs([ROOM_SETTING(h), getSnippet('pov')].join(', '))].filter(Boolean).join(', ')));
}
