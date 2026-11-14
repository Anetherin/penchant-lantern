'use strict';
/* =====================================================================
   IMAGE PROMPTS
   ===================================================================== */
function raceLook(w, scene){ const ed = typeof effDesign==='function' ? effDesign(w, scene) : (w&&w.design)||{}; if(ed.raceLook) return ed.raceLook; if(w.race==='beastkin'){ const s=w.sub||'fox', sd = subData('beastkin', s); if(sd && sd.look) return sd.look; return `beastkin woman with ${s} ears and a ${s} tail`; } return (RACES[w.race]||RACES.human).look; }
// keepOn (data/characters.json): something she won't take off until trust reaches keepOn.trust.
// With aside:true it's a garment, so the rest of her clothes get pulled aside at most.
function keepOnRule(w){ const k = w.key && NAMED[w.key] && NAMED[w.key].keepOn; return k && w.trust < (k.trust||90) ? k : null; }
// A bathing scene (scenes.json / dates.json image: "bath": true, or the older "towel": true).
const isBathScene = scene => { const sc = scene && SCENES[sceneBase(scene)]; return !!(sc && (sc.bath || sc.towel)); };
// A swimming scene (dates.json image: "swim": true). Not a bath scene: no towel, stays where it is.
const isSwimScene = scene => { const sc = scene && SCENES[sceneBase(scene)]; return !!(sc && sc.swim); };
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
  // Bath scenes: only bath-compatible outfits (wardrobe.json "bath": true) stay on; otherwise a towel, her underwear, or nothing.
  if(!noTowel && isBathScene(scene)){
    const T0 = Object.assign({}, DEFAULT_CLOTH_TEXT, Object.fromEntries(Object.entries(SET.clothText||{}).filter(([k,v])=>v)));
    if(cloth==='dressed' && getOutfit(w, scene).bath) return outfitText(w, scene);
    if(cloth==='dressed' || cloth==='partial') return cloth==='partial' && getOutfit(w, scene).bath ? (T0.partial||'').replace(/\{outfit\}/g, outfitText(w, scene)).replace(/\{underwear\}/g, underText(w, scene) || 'bare skin, nothing underneath') : 'wrapped only in a white towel';
  }
  const T = Object.assign({}, DEFAULT_CLOTH_TEXT, Object.fromEntries(Object.entries(SET.clothText||{}).filter(([k,v])=>v)));
  let t = T[cloth];
  if(!t && cloth==='nude') t = T.partial;
  const ut = underText(w, scene);
  // Modest ladies during intimate scenes: clothes pulled aside rather than removed
  if(has(w,'Modest') && (cloth==='dressed'||cloth==='partial') && isSvcScene(scene)){
    t = (!ut && T.aside_commando) || T.aside || t;
  }
  return (t||T.dressed).replace(/\{outfit\}/g, outfitText(w, scene)).replace(/\{underwear\}/g, ut || 'bare skin, nothing underneath');
}
// Her body in one phrase: height, build + figure, bust (the build word from her design and the body figure used to be two separate,
// sometimes clashing, phrases). A build word the figure already says is dropped, and so is a height the build already says ("very tall").
function bodyDesc(w, scene){
  const b = bodyOf(w, scene), img = k => ((bodyOpts(k)[b[k]]||{}).img || '').trim(), d = effDesign(w, scene);
  const build = (d.build||'').trim(), fig = img('figure'), words = s => s.toLowerCase().split(/[^a-z]+/).filter(x=>x.length>2);
  let height = img('height');
  if(height && build && words(height).every(x=>words(build).includes(x))) height = '';
  const extra = build && !words(build).every(x=>words(fig).includes(x)) ? build : '';
  const figure = [extra, fig || (extra ? 'figure' : '')].filter(Boolean).join(' ').replace(/,\s*$/, '');
  return [height, figure, img('bust')].filter(Boolean).join(', ');
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
  return t.replace(/\{hair\}/g, (d.hairColor||'').trim()).replace(/\s{2,}/g,' ').trim();
}
function charDesc(w, cloth, scene){
  const d = effDesign(w, scene);
  return [`beautiful adult ${raceLook(w, scene)}`,
    (d.hairStyle||d.hairColor) && `${d.hairStyle||''} ${d.hairColor||''} hair`, d.eyes && `${d.eyes} eyes`,
    d.skin && `${d.skin} skin`, bodyDesc(w, scene), featureText(w, cloth || 'dressed', scene)].filter(Boolean).join(', ');
}
// act_<id> snippets now live on the service (image.extra); older browser edits still win
const getSnippet = k => { const a = k.startsWith('act_') && actById(k.slice(4)); const t = (SET.snippets[k] || (a && a.image && a.image.extra) || SCENE_SNIPPETS[k] || '').trim(); return isTodo(t) ? '' : t; };
// Services whose picture shows her bare between the legs (services.json → image.exposed); pubic hair is named for those
// unless the clothing wording already covers it.
const exposedAct = id => !!(((actById(id)||{}).image||{}).exposed);
function sceneAct(sceneKey){ const b = sceneBase(sceneKey); return b.startsWith('act:') ? b.slice(4) : /^(samact|duo|pair|demo):/.test(b) ? b.split(':')[1] : null; }
function buildPrompt(w, sceneKey, cloth){
  const sc = sceneInfo(sceneKey, w);
  if(w.male) return cleanText([SET.style, 'adult man', w.look, 'upper body portrait, looking at viewer', 'dramatic lighting'].join(', '));
  cloth = cloth || defaultCloth(w, sceneKey);
  const act = sceneAct(sceneKey), svc = isSvcScene(sceneKey), PP = SCENE_DATA.people || {};
  let clothes = clothText(w, cloth, sceneKey).replace(/\{pubic\}/g, pubicText(w, sceneKey));
  if(act && exposedAct(act) && cloth!=='dressed' && !/pubic|hairy/i.test(clothes)) clothes += (cloth==='under' ? ', panties pulled aside, ' : ', ') + pubicText(w, sceneKey);
  const parts = [SET.style];
  // intimate scenes lead with who is in the picture and what they're doing: image models weigh the start of a prompt most, and a long
  // description first lets the pose drift to whatever the model draws most often
  if(svc){
    const n = sceneBase(sceneKey).startsWith('orgy:') ? (PP.orgy||'').replace('{n}', sceneBase(sceneKey).slice(5).split(',').length) : sceneBase(sceneKey).startsWith('duo:') ? PP.duo : sceneBase(sceneKey).startsWith('pair:') ? (PP['pair_' + sceneBase(sceneKey).split(':')[2]] || PP.pair_fem) : sceneBase(sceneKey).startsWith('demo:') ? PP.demo : sc.pov ? PP.pov : sc.client ? PP.client : PP.solo;
    const duo = /^(duo|pair|orgy):/.test(sceneBase(sceneKey));   // a duo's "client" is the second woman's full description: it goes after hers
    parts.push(n, sc.pov && "first-person POV, from the viewer's perspective", !duo && sc.client, sc.comp, sc.snip && getSnippet(sc.snip), sc.snip2 && getSnippet(sc.snip2));
    parts.push(charDesc(w, cloth, sceneKey), clothes, duo && sc.client, sc.expr, sc.setting);
    if(sc.pov) parts.push(getSnippet('pov'));
    return cleanText(stripTodo(parts.filter(Boolean).join(', ')));
  }
  if(sc.pov) parts.push("first-person POV, from the viewer's perspective");
  parts.push(charDesc(w, cloth, sceneKey), clothes);
  if(sc.sam && !sc.pov) parts.push('together with ' + SAM_DESC);
  if(sc.client) parts.push(sc.client);
  // pose, expression (scene override, or her default expression, or portrait fallback) and the scene's own wording, then where it happens
  const ed = effDesign(w, sceneKey), defExpr = (ed.expression||'').trim(), base = sceneBase(sceneKey);
  const mishap = /^(shower|walkin|enc_jealous|enc_reckless|enc_waiting)$/.test(base);
  const expr = sc.expr || (!mishap ? defExpr : '') || (base==='portrait' ? 'gentle smile' : '');
  const comp = (defExpr && !mishap && sc.comp) ? sc.comp.replace(/,\s*(gentle|friendly|cheerful|patient|attentive)\s+smile$/i, '') : sc.comp;
  parts.push(comp, expr);
  if(sc.snip) parts.push(getSnippet(sc.snip));
  if(sc.snip2) parts.push(getSnippet(sc.snip2));
  parts.push(sc.setting);
  if(sc.pov) parts.push(getSnippet('pov'));
  return cleanText(stripTodo(parts.filter(Boolean).join(', ')));
}
