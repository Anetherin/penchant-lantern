'use strict';
/* =====================================================================
   CHARACTER LOGIC
   ===================================================================== */
const maxEnergy = w => Math.max(20, Math.round(60 + s100(w.stats.stamina)*0.6 + fxAdd(w,'maxEnergy')));
// energy can be banked above max (energyBank fx); it is simply spent first
const energyCap = w => maxEnergy(w) + fxAdd(w,'energyBank');
// Energy per client: depends on the service, her stamina, and how she feels about it.
function actCost(w, act){
  let c = act ? ((actById(act)||{}).energy || 10) : 5;
  c *= 1.2 - s100(w.stats.stamina)/250;
  if(act){ if(w.fav===act) c *= 0.75; if(w.dislike===act) c *= 1.35; if(clientStance(w,act)==='ask') c *= 1.25; }
  c *= fxMul(w,'actEnergy') * (act ? fxSub(w,'actEnergyBy',act) : 1);
  return Math.max(1, c);
}
const clientCost = w => actCost(w, null) * 1.8;
const appeal = w => s100(w.stats.beauty)*0.4 + s100(w.stats.charm)*0.3 + w.popularity*0.5 + fxAdd(w,'appeal');
// Lewdness gain with diminishing returns: each source has a cap. Full gain below cap - band, half at the cap, nothing by cap + band.
function lewdUp(w, n, cap){
  const L = BAL.lewd, c = cap ?? L.softCap, t = Math.max(0, Math.min(1, (c + L.band - w.lewd) / (2*L.band)));
  const boost = w.lewd < L.lowBoostBelow ? L.lowBoost : 1;          // shy beginners move a bit faster
  const g = n * lewdMult(w) * t * boost; w.lewd = clamp(w.lewd + g); return g;
}
const svcLewdCap = (id, who) => ((actById(id)||{}).th ?? 30) + BAL.lewd.capOver[who];   // who: 'sam' | 'client'
const lewdMult = w => fxMul(w,'lewdGain') * ((PERS[w.personality]||{}).lewd || 1) * ((S && HOUSES[(houseOf(w)||{}).id]||{}).lewdBoost || 1);
const isFree = w => !!(w.isPartner || w.free);
// Trust from Sam's attention: personality, race, and diminishing returns near the top.
function gainTrust(w, n){ const b = w.trust, g = n * pTrust(w) * (n>0 ? fxMul(w,'trustGain') : 1) * (n>0 ? Math.max(0.15, 1 - w.trust/140) : 1); w.trust = clamp(w.trust + g); capTrust(w); return w.trust - b; }
// The least any activity with Sam builds (balance.json → trust.minor), so nothing they do together is wasted.
const minorTrust = (w, mult=1) => gainTrust(w, (BAL.trust ? BAL.trust.minor : 0.3) * mult);
// House-gated progress (docs/OVERHAUL.md §7): a lady who comes with a house (role 'house') can't trust Sam beyond
// 35 + 15 x the house story's beat until that story is done (no cap if her house has no story or is complete).
function houseGate(w){
  if(typeof S==='undefined' || !S || !w || !w.key || !NAMED[w.key] || NAMED[w.key].role!=='house') return null;
  const hid = Object.keys(HOUSES).find(k=>HOUSES[k].npc===w.key), st = hid && typeof STORIES!=='undefined' ? STORIES[hid] : null;
  const h = hid && S.houses.find(x=>x.id===hid);
  if(!st || !h || !h.story || h.story.beat >= st.beats.length) return null;
  return {house:h, beat:h.story.beat, cap:BAL.houseGate.base + BAL.houseGate.perBeat*h.story.beat};
}
const houseTrustCap = w => { const g = houseGate(w); return g ? g.cap : 100; };
function capTrust(w){ const c = houseTrustCap(w); if(w.trust > c) w.trust = c; return w.trust; }
function enforceTrustCaps(){ if(typeof S!=='undefined' && S && S.workers) S.workers.forEach(capTrust); }
const moodMod = w => (w.mood-50)/10;
// CONSENT MODEL
// inclination = her own appetite for a service (lewdness + likes + mood). That decides what she enjoys.
// Up to 25 below a service's line, she'll do it because Sam asked, if she trusts him enough (costs mood).
// Further below that is a line she won't cross, whatever her trust.
const ASK_BAND = 25;
function inclination(w,id){ return w.lewd + comfortOf(w,id) + fxAdd(w,'willing') + moodMod(w); }
const trustNeed = gap => Math.round(40 + gap*2);
// Courtesans have the lowest comfort lines (balance.json → jobs.courtesanTh points lower). job defaults to her current one.
const jobTh = (w, job) => (job || w.job)==='courtesan' ? BAL.jobs.courtesanTh : 0;
function clientStance(w,id,job){
  const a = actById(id); if(!a || actBanned(w,id)) return 'no';
  const inc = inclination(w,id) - (w.lovers===id ? 30 : 0), th = a.th - jobTh(w, job);
  if(inc >= th) return 'yes';
  if(inc >= th - ASK_BAND && w.trust >= trustNeed(th - inc)) return 'ask';
  return 'no';
}
function samLean(w,id){ return inclination(w,id) + w.trust*0.3 + (w.lovers===id && w.trust>=40 ? 15 : 0) + (has(w,'Devoted')?20:0) - (has(w,'Oblivious')?45:0); }
function samStance(w,id){
  const a = actById(id); if(!a || actBanned(w,id)) return 'no';
  if(has(w,'Oblivious') && actKey(id)!=='kiss') return 'no';
  const inc = samLean(w,id);
  if(inc >= a.th) return 'yes';
  if(inc >= a.th - ASK_BAND && w.trust >= trustNeed(a.th - inc) - 10) return 'ask';
  return 'no';
}
function comfortOf(w,id){ id = actKey(id); const a = w.acts&&w.acts[id]; return (a?a.comfort:0) + (w.fav===id?10:0) - (w.dislike===id?15:0); }
const canClient = (w,id) => clientStance(w,id) !== 'no';
// How far past the line a service is with Sam (services.json → tier). She has to have crossed that line with him first
// (w.intim, raised by her firsts: js/events/firsts.js). samStance is still her comfort; this is whether it's happened yet.
const actTier = id => actTierOf(actById(id) || {th:0});
const crossed = (w,id) => actTier(id) <= (w.intim||0);
const canSam = (w,id) => crossed(w,id) && samStance(w,id) !== 'no';
const STANCE = {yes:'<span class="good" title="She enjoys this">✓</span>', ask:'<span class="pink" title="She\'ll do it because she trusts Sam, but it costs her mood">~</span>', no:'<span class="muted" title="A line she won\'t cross yet">✗</span>'};
const actSkill = (w,id) => (w.acts&&w.acts[actKey(id)]) ? w.acts[actKey(id)].skill : 0;

/* ---------- wardrobe logic ---------- */
// Scene keys can carry extras after the base: 'act:oral_give~lost_in_it~prop' (~expression, ~context). sceneParts splits them.
function sceneParts(k){ const p = String(k||'').split('~'); return {base:p[0], expr:p[1]||'', ctx:p[2]||''}; }
const sceneBase = k => sceneParts(k).base;
const isSvcScene = k => /^(act:|samact:|duo:|solo$)/.test(sceneBase(k));
// The outfit shown in a scene: her service outfit (sheet → wardrobe) in service scenes, otherwise her work outfit.
function outfitKey(w, scene){
  const k = w.svcOutfit; if(scene && k && isSvcScene(scene) && (k==='custom' ? w.customOutfit : (WARDROBE[k] && ownsOutfit(w,k)))) return k;
  // a job outfit (w.jobOutfit[job]) or the job's uniform (wardrobe.json → uniform) is worn at work, never in service scenes
  if(!(scene && isSvcScene(scene)) && w.job){
    const jo = w.jobOutfit && w.jobOutfit[w.job]; if(jo && WARDROBE[jo]) return jo;
    const u = UNIFORMS[w.job]; if(u && !(w.jobOutfit && w.jobOutfit[w.job]===''))  return u;
  }
  return w.outfit;
}
function getOutfit(w, scene){ const ok = outfitKey(w, scene); if(ok==='custom') return {label:'Her own outfit', style:w.style, prompt:w.customOutfit||'an elegant dress', bonus:{}, custom:true}; return WARDROBE[ok] || BASE_OUTFITS.b_corset; }
function getUnder(w){ if(w.under==='custom') return {label:'Custom', prompt:w.customUnder||'simple lace underwear', bonus:{}, style:w.style}; return UNDER[w.under] || UNDER.plain; }
const usesColor = o => /\{color\}/.test(o.prompt||'');
function outfitText(w, scene){ return getOutfit(w, scene).prompt.replace(/\{color\}/g, w.outColor||'black'); }
function underText(w){ return w.under==='none' ? null : getUnder(w).prompt.replace(/\{color\}/g, w.underColor||'white'); }
function ob(w,k){ return ((getOutfit(w).bonus||{})[k]||1) * ((getUnder(w).bonus||{})[k]||1); }
// sp_ outfits unlock at trust 60 (600 as shown) (or as a lover); an outfit with its own "unlock" needs that trust, lover or not.
function spTrust(w){ const o = WARDROBE['sp_'+w.key]; return (o && o.unlock) || 60; }
function spUnlocked(w,k){ const o = WARDROBE['sp_'+w.key]; return (o && o.unlock) ? w.trust>=o.unlock : (w.trust>=60 || has(w,'Devoted')); }
function wardrobeAvail(w){
  return Object.entries(WARDROBE).filter(([k,o])=>!o.owner || o.owner===w.key);
}
// Ownership: her own pieces (gifts, signatures) plus the shared house wardrobe (S.houseWardrobe / S.houseUnder).
const houseStock = () => (typeof S!=='undefined' && S && S.houseWardrobe) || [];
const houseUnderStock = () => (typeof S!=='undefined' && S && S.houseUnder) || [];
const ownsOutfit = (w,k) => (w.owned||[]).includes(k) || houseStock().includes(k);
const ownsUnder = (w,k) => (w.ownedUnder||[]).includes(k) || houseUnderStock().includes(k);
const ownedOutfits = w => Array.from(new Set([...(w.owned||[]), ...houseStock()])).filter(k=>WARDROBE[k]);
const outfitCost = o => Math.max(0, Math.round((o.cost||0) * BAL.wardrobe.costMult));
function wardrobeOK(w,k){ const o = k==='custom' ? {lewd:0} : WARDROBE[k]; return !!o && clothLimit(w,false) >= (o.lewd||0); }
function underOK(w,k){ return !!UNDER[k] && clothLimit(w,false) >= UNDER[k].lewd || k==='custom'; }

function clothLimit(w, withSam){ return w.lewd + fxAdd(w,'wardrobe') + (withSam ? w.trust*0.35 + (has(w,'Devoted')?20:0) - (has(w,'Oblivious')?30:0) : (w.trust>=60?8:0)); }
function clothOK(w,c,withSam){
  if(c==='under' && w.under==='none') return false;
  return clothLimit(w,withSam) >= CLOTH.find(x=>x.id===c).lv;
}
function maxCloth(w, withSam){ return [...CLOTH].reverse().find(c=>clothOK(w,c.id,withSam)).id; }
// Modest ladies would rather keep their clothes on: during intimate scenes their comfort line sits w.modesty
// points lower (clothes pulled aside at worst). Lewdness still pushes it down, and with Sam, trust does too.
function comfortCloth(w, withSam, intimate){
  if(!has(w,'Modest')) return maxCloth(w, withSam);
  const lim = clothLimit(w, withSam) - (w.modesty||30) + (withSam ? w.trust*0.25 : 0);
  const c = ([...CLOTH].reverse().find(x=>lim>=x.lv && !(x.id==='under' && w.under==='none'))||CLOTH[0]).id;
  return intimate && c==='dressed' ? 'partial' : c;
}
// How undressed she is in a service scene. dress.min (services.json) is the least she'll show; kissing and massage stay
// dressed until her lewdness reaches dress.fullAt; propositions at night and reckless nights start at "partly undressed".
// Her own choice (w.svcLevel: dressed / partial / under / nude) wins, capped by what she's comfortable with. Visual only.
function actCloth(w, id, withSam, ctx){
  const ix = x => CLOTH.findIndex(y=>y.id===x), a = actById(id) || {}, D = a.dress || {};
  const cap = comfortCloth(w, withSam, true);
  let lv = ix(cap);
  const m = Math.max(0, ix(D.min || a.minCloth || 'dressed'));
  if(m === 0){ if(D.fullAt !== undefined && w.lewd < D.fullAt) lv = 0; }
  else {
    lv = Math.max(lv, Math.min(m, has(w,'Modest') ? 1 : (clothOK(w, CLOTH[m].id, withSam) ? m : 1)));
    if(lv === 3 && D.fullAt !== undefined && w.lewd < D.fullAt) lv = 2;
  }
  if(ctx==='prop' || ctx==='reckless') lv = Math.max(lv, 1);
  if(w.svcLevel && w.svcLevel!=='auto' && ix(w.svcLevel) >= 0) lv = Math.min(ix(w.svcLevel), ix(cap));
  return CLOTH[Math.max(0, lv)].id;
}
function defaultCloth(w, scene){
  const P = sceneParts(scene), base = P.base;
  if(base.startsWith('act:')) return actCloth(w, base.split(':')[1], false, P.ctx);
  if(base.startsWith('samact:') || base.startsWith('duo:')) return actCloth(w, base.split(':')[1], true);
  if(base==='solo') return comfortCloth(w, false, true);
  if(base==='bath') return clothOK(w,'nude',false) ? 'nude' : 'dressed';
  // invitations and the like (scenes.json / dates.json image "undress": "partial" | "under"): as far as that, within her comfort with Sam
  const U = (SCENES[base]||{}).undress;
  if(U){ const ix = x => CLOTH.findIndex(y=>y.id===x), cap = comfortCloth(w, true, false), lv = Math.min(ix(U), ix(cap)); return CLOTH[Math.max(0, lv)].id; }
  return 'dressed';
}
function wageFor(w){
  if(isFree(w)) return 0;
  const st = STAT_KEYS.reduce((a,k)=>a+s100(w.stats[k]),0)/6;
  const tc = Math.max(...TECH_KEYS.map(k=>s100(w.tech[k]||0)), ...Object.values(w.acts||{}).map(a=>s100(a.skill)*0.8));
  const sd = w.race==='beastkin' ? subData(w.race, w.sub) : null;
  return Math.round((8 + st*0.3 + tc*0.2 + w.popularity*0.3 + (has(w,'Ambitious')?8:0) + (has(w,'Greedy')?6:0)) * ((sd && sd.wage) ?? raceOf(w).wage ?? 1));
}
function signingFor(w){ return Math.max(60, Math.round(w.wage * rnd(5,8) * (0.9 + (S?S.rep:10)/150) * (hasBoon('recruit')?0.75:1))); }
// Skills work in 1000-units: n is the old 0-100 amount (x SKL), with a diminishing curve (1 - v/1300).
function grow(w,k,n){ n *= SKL * fxMul(w,'skillGain') * trainBonus(w); w.tech[k] = clampK((w.tech[k]||0) + n*(1 - (w.tech[k]||0)/1300)); }
function growAct(w,id,n){ id = actKey(id); if(!w.acts[id]) return; n *= SKL * fxMul(w,'skillGain') * trainBonus(w); const s=w.acts[id].skill; w.acts[id].skill = clampK(s + n*(1 - s/1300)); }
function allNames(){ return S ? [...S.workers, ...S.candidates].map(w=>w.name) : []; }
function genName(race, sub){
  const R = RACES[race] || {}, n = R.names || NAMES[race] || NAMES.human, SL = ((subData(race, sub)||{}).names||{}).l; let name, t=0;
  // last names (or titles): the race's list, or half the time the beastkin sub's own list
  const lastPool = () => (SL && SL.length && (!(n.l && n.l.length) || Math.random()<0.5)) ? SL : n.l;
  do { const L = lastPool(); name = pick(n.f) + (L && L.length && (R.alwaysLast || Math.random()<0.8) ? ' '+pick(L) : ''); t++; } while(allNames().includes(name) && t<25);
  return name;
}

function ensureWorker(w){
  w.tech = w.tech || {}; TECH_KEYS.forEach(k=>{ if(w.tech[k]===undefined) w.tech[k]=ri(0,200); });
  w.acts = w.acts || {};
  const base = w.actSkill!==undefined ? w.actSkill : (w.tech.intimacy!==undefined ? s100(w.tech.intimacy) : ri(0,25));   // actSkill is a 0-100 seed value
  getActs().forEach(a=>{ if(!w.acts[a.id]) w.acts[a.id] = {skill: clampK(Math.round(base*0.8 + (base<10 ? ri(0,10) : ri(8,22)))*SKL + ri(0,SKL-1)), comfort: ri(-10,10)}; });
  ['fav','dislike','lovers'].forEach(k=>{ if(w[k]) w[k] = actKey(w[k]); });
  if(w.menu) w.menu = Array.from(new Set(w.menu.map(actKey)));
  const ids = getActs().map(a=>a.id).filter(id=>id!=='kiss');
  if(w.fav===undefined){ w.fav = pick(ids); if(w.acts[w.fav]) w.acts[w.fav].skill = clampK(w.acts[w.fav].skill+100); }
  if(w.dislike===undefined){ let d=null; if(Math.random()<0.7){ do d=pick(ids); while(d===w.fav); } w.dislike=d; }
  if(w.lovers===undefined){ let l=null; if(Math.random()<0.45){ do l=pick(ids); while(l===w.fav); } w.lovers=l; }
  if(!w.menu) w.menu = [];
  // firsts with Sam (js/events/firsts.js): her pace and path, and how far they've gone. Older saves where they'd
  // already been together count as having crossed every line.
  if(!w.firsts || !Array.isArray(w.firsts.path)) w.firsts = firstsProfile(w);
  if(w.intim===undefined) w.intim = (w.privateCount>0 || has(w,'Devoted')) ? Math.max(...w.firsts.path) : 0;
  if(!w.jobLikes) rollJobPrefs(w);
  // "Open to propositions": 'on' | 'ask' | 'off' (old saves stored true/false). Must-offer jobs ignore it.
  if(w.offDuty===undefined) w.offDuty = 'ask'; else if(w.offDuty===true) w.offDuty = 'on'; else if(w.offDuty===false) w.offDuty = 'off';
  if(w.samples===undefined) w.samples = false;
  if(!['training','management','care'].includes(w.madameFocus)) w.madameFocus = 'management';
  if(!w.body) w.body = rollBody(w.race);
  w.counts = w.counts || {};
  if(!w.style) w.style = pick(STYLES);
  if(!w.favColor) w.favColor = pick(COLOR_KEYS);
  // Modest: rolled once per lady from her personality (data/personalities.json → modest)
  if(w._lt===undefined){ w._lt = 1; w.traits = w.traits||[]; if(!w.named){ const tc = BAL.lust.traitChance||{}, r = Math.random();
    if(r < (tc['Insatiable']||0)) w.traits.push('Insatiable'); else if(r < (tc['Insatiable']||0) + (tc['Slow to Warm']||0)) w.traits.push('Slow to Warm'); } }
  if(w._mr===undefined){ w._mr = 1; if(!has(w,'Modest') && !has(w,'Exhibitionist') && Math.random() < ((PERS[w.personality]||{}).modest||0)) (w.traits = w.traits||[]).push('Modest'); }
  if(has(w,'Modest') && w.modesty===undefined) w.modesty = ri(20,45);
  w.design = w.design || {};
  // wardrobe migration / defaults
  if(!w.owned) w.owned = [];
  if(!w.outfit || (w.outfit!=='custom' && !WARDROBE[w.outfit])){
    if(w.design.outfit){ w.outfit='custom'; w.customOutfit=w.design.outfit; }
    else { const b = pick(plainBase().filter(k=>k!=='b_robe' || w.lewd>=20)); w.outfit = b; }
  }
  if(w.outfit && w.outfit!=='custom' && !ownsOutfit(w,w.outfit)) w.owned.push(w.outfit);
  if(!w.outColor) w.outColor = Math.random()<0.4 ? w.favColor : pick(COLOR_KEYS);
  if(!w.ownedUnder) w.ownedUnder = ['plain'];
  if(!w.under){ if(w.design.underwear){ w.under='custom'; w.customUnder=w.design.underwear; } else w.under = pick(['plain','plain','lace','silk','sports']); }
  if(w.under!=='custom' && !ownsUnder(w,w.under)) w.ownedUnder.push(w.under);
  if(!w.underColor) w.underColor = Math.random()<0.4 ? w.favColor : pick(COLOR_KEYS);
  delete w.design.outfit; delete w.design.underwear;
  if(!w.imgVar) w.imgVar = {};
  if(!w.seen) w.seen = {};
  if(w.privateCount===undefined) w.privateCount = 0;
  if(w.dates===undefined) w.dates = 0;
  if(w.autoRest===undefined) w.autoRest = true;
  if(w.lust===undefined) w.lust = clamp(Math.round(30 + w.lewd*0.4 + ri(-10,10)));
  if(JOBS[w.job]===undefined) w.job = (w.job==='intimate'||w.job==='specialty') ? 'courtesan' : 'rest';
  return w;
}
function applyMods(w){
  const R = RACES[w.race], SD = w.race==='beastkin' ? subData(w.race, w.sub) : null;
  // race and sub mods are on the 0-100 scale; stats and skills run 0-1000
  [R.mods, SD && SD.mods].forEach(M=>Object.entries(M||{}).forEach(([k,v])=>{ if(k==='lewd') w.lewd += v; else if(w.stats[k]!==undefined) w.stats[k] += v*SKL; }));
  if(has(w,'Elegant')) w.stats.refinement += 100;
  if(has(w,'Former Adventurer')){ w.tech.combat += 250; w.stats.strength += 100; }
  if(has(w,'Party Animal')){ w.tech.bar += 100; w.tech.dance += 100; }
  if(has(w,'Tough')) w.stats.stamina += 100;
  STAT_KEYS.forEach(k=>w.stats[k]=clampK(Math.round(w.stats[k])));
  TECH_KEYS.forEach(k=>w.tech[k]=clampK(Math.round(w.tech[k])));
  w.lewd = clamp(w.lewd);
}
function genWorker(opts={}){
  const race = opts.race || weighted(Object.keys(RACES), r=>RACES[r].weight ?? 0);
  const R = RACES[race], q = opts.quality || 1;
  const K = v => Math.round(v)*SKL + ri(0,SKL-1);   // a 0-100 value as 0-1000
  const base = () => clampK(K(rnd(15,55)*q));
  const sub = race==='beastkin' ? weighted(subNames(race), x=>(subData(race,x)||{}).weight ?? 1) : '';
  const w = {
    id:uid(), name:genName(race, sub), race, sub, age:ri(...((subData(race,sub)||{}).age || R.age)), named:false, keep:false, body:rollBody(race), counts:{},
    design:{build:pick(BUILDS),hairStyle:pick(HAIR_STYLES),hairColor:pick(HAIR_COLORS),eyes:pick(EYES),
      skin: race==='demon'&&Math.random()<0.4 ? pick(DEMON_SKINS) : pick(SKINS), features:pick(FEATURES)},
    personality:pick(PERSONALITIES), backstory:'', traits:[],
    stats:{beauty:clampK(base()+100),charm:base(),refinement:base(),stamina:base(),strength:base(),agility:base()},
    tech:{service:K(ri(0,30)),dance:K(ri(0,25)),bar:K(ri(0,25)),combat:K(ri(0,20)),manage:K(ri(0,20))}, actSkill:ri(0,25),
    popularity:ri(0,12), lewd:ri(5,60), trust:ri(5,22), mood:ri(52,70), energy:100, health:100,
    wage:0, contract:12, job:'rest', house:null, seed:ri(1,999999999), imgVar:{}, seen:{}, unhappy:0, earnedLast:0, privateCount:0
  };
  const vis = Object.keys(TRAITS).filter(t=>TRAITS[t].gen && !TRAITS[t].ngOnly && !TRAITS[t].hidden && !TRAITS[t].story && !TRAITS[t].personal);
  const n = Math.random()<0.5 ? 1 : 2, clash = t => (TRAITS[t].excl||[]).some(x=>has(w,x)) || w.traits.some(x=>((TRAITS[x]||{}).excl||[]).includes(t));
  while(w.traits.length<n){ const t=pick(vis); if(!w.traits.includes(t) && !clash(t)) w.traits.push(t); }
  // from New Game+ cycle 2, generics can arrive with an ngOnly trait (one at 35%)
  if(S && (S.cycle||1) >= 2 && Math.random() < 0.35){ const ng = Object.keys(TRAITS).filter(t=>TRAITS[t].gen && TRAITS[t].ngOnly && !w.traits.includes(t)); if(ng.length) w.traits.push(pick(ng)); }
  if(Math.random()<0.25) w.traits.push(pick(['Exhibitionist','Night Owl']));
  applyMods(w);
  w.style = w.lewd>45 && Math.random()<0.5 ? 'Revealing' : pick(STYLES.slice(0,4));
  w.favColor = pick(COLOR_KEYS);
  // starting outfit in her style if possible
  const fits = plainBase().filter(k=>BASE_OUTFITS[k].style===w.style && w.lewd>=BASE_OUTFITS[k].lewd);
  w.outfit = fits.length && Math.random()<0.7 ? pick(fits) : pick(plainBase().filter(k=>w.lewd>=BASE_OUTFITS[k].lewd));
  if(w.lewd>=45 && Math.random()<0.15){ w.under='none'; w.ownedUnder=['plain','none']; }
  ensureWorker(w);
  w.backstory = `${w.name} came to Hollowmere because ${pick(HOOKS)}.`;
  w.wage = wageFor(w); w.energy = maxEnergy(w);
  return w;
}
function makeNamed(key, asPartner){
  const D = NAMED[key];
  const w = genWorker({race:D.race});
  const d = clone(D);
  Object.assign(w, d); w.acts = {}; w.menu = []; w.counts = {};
  // character data is on the familiar 0-100 scale; stats and skills run 0-1000
  const K = v => Math.round(v)*SKL + ri(0,SKL-1);
  STAT_KEYS.forEach(k=>{ w.stats[k] = clampK(K(d.stats[k] ?? 30)); }); TECH_KEYS.forEach(k=>{ w.tech[k] = clampK(K((d.tech||{})[k] ?? 10)); });
  w.body = Object.assign({}, BODY_DEF, d.body || {});   // named ladies: from data, default medium / average / slim
  if(d.unique) w.unique = clone(d.unique);
  ['fav','dislike','lovers'].forEach(k=>{ if(w[k]) w[k] = actKey(w[k]); });
  w.id = 'n_'+key; w.key = key; w.named = true; w.keep = true; w.sub = d.sub || '';
  w.outfit = 'sig_'+key; w.owned = ['sig_'+key]; w.outColor = null;
  w.ownedUnder = Array.from(new Set(['plain', d.under]));
  w.seed = (hashStr(key)*7 + 12345) % 999999999;
  delete w.role; delete w.partnerTrust; delete w.partnerStory; delete w.partnerLewd;
  if(asPartner){ w.isPartner = true; w.trust = D.partnerTrust; if(D.partnerLewd!==undefined) w.lewd = D.partnerLewd; w.mood = 75; w.backstory = D.partnerStory + '\n\n' + D.backstory; w.contract = 999; }
  else if(D.partnerStory){ w.backstory = D.partnerStory + '\n\n' + D.backstory; }
  if(ARCS[key]) w.arc = 0;
  delete w.jobLikes; delete w.jobDislikes; delete w.firsts; delete w.intim;   // rolled for the generic base; hers come from her data
  ensureWorker(w);
  w.wage = wageFor(w); w.energy = maxEnergy(w);
  return w;
}
const isHired = key => S && (S.workers.some(w=>w.key===key) || S.candidates.some(w=>w.key===key));

// Lust: her current appetite. It builds every week (faster for lewder ladies) and is spent by
// services and time with Sam. Very high lust can lead to reckless choices; very low lust means
// she isn't in the mood for the heavier services.
const LUST_LOW = BAL.lust.low, LUST_HIGH = BAL.lust.high;
const notInMood = (w, act) => act && w.lust < LUST_LOW && ((actById(act)||{}).energy||10) >= 9;
// At max lust some ladies take care of it themselves (data/personalities.json → solo).
function soloChance(w){ const P = PERS[w.personality]||{}; return Math.max(0.05, Math.min(0.9, (P.solo ?? 0.3) + (has(w,'Shy')?0.15:0) + (has(w,'Modest')?0.1:0) - (has(w,'Eager')?0.15:0) - (has(w,'Exhibitionist')?0.1:0))); }
function lustLabel(w){ return restless(w) ? 'restless' : w.lust>=LUST_EAGER ? 'eager' : w.lust<LUST_LOW ? 'not in the mood' : 'content'; }
const LUST_EAGER = BAL.lust.eager || 60;
// Her lust profile (data/balance.json → lust): weekly build, how much each act spends, floor and ceiling.
function lustProfile(w){
  const L = BAL.lust, B = L.build, Pf = L.profile, P = PERS[w.personality]||{};
  const build = (B.base + w.lewd*B.perLewd + ((has(w,'Eager')||has(w,'Exhibitionist'))?B.eagerTrait:0) + (w.job==='rest'?B.resting:0)) * (P.lustBuild||1) * fxMul(w,'lustBuild');
  const drop = (Pf.dropAtLewd0 + (Pf.dropAtLewd100 - Pf.dropAtLewd0) * w.lewd/100) * fxMul(w,'lustDrop');
  const max = 100 + fxAdd(w,'lustMax');
  const floor = Math.min(60, max, w.lewd*Pf.floorPerLewd + fxAdd(w,'lustFloor'));
  return {build, drop, floor:Math.round(floor), max};
}
const fitLust = w => { const p = lustProfile(w); w.lust = Math.max(Math.min(p.floor, p.max), Math.min(p.max, clamp(w.lust, 0, p.max))); return w.lust; };
// Spend lust (a service, private time...). Returns how much it actually went down.
function spendLust(w, base){ const before = w.lust; w.lust = w.lust - base*lustProfile(w).drop; fitLust(w); return Math.round(before - w.lust); }
// Bonus for time with Sam when she's in the mood. Call before spending lust.
function lustBonus(w, mult=1){
  const B = BAL.lust.bonus, b = restless(w) ? B.restless : w.lust>=LUST_EAGER ? B.eager : null;
  if(!b) return '';
  moodAdd(w, b.mood*mult); if(b.trust) gainTrust(w, b.trust*mult);
  return restless(w) ? `${w.name} had been wanting this for days. (Mood +${Math.round(b.mood*mult)}, trust +)` : `${w.name} was very much in the mood. (Mood +${Math.round(b.mood*mult)})`;
}
