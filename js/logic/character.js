'use strict';
/* =====================================================================
   CHARACTER LOGIC
   ===================================================================== */
const maxEnergy = w => Math.round(60 + w.stats.stamina*0.6 + (has(w,'Tough')?20:0) + (w.race==='dwarf'?25:0) + (w.race==='dragonkin'?15:0));
// Energy per client: depends on the service, her stamina, and how she feels about it.
function actCost(w, act){
  let c = act ? ((actById(act)||{}).energy || 10) : 5;
  c *= 1.2 - w.stats.stamina/250;
  if(act){ if(w.fav===act) c *= 0.75; if(w.dislike===act) c *= 1.35; if(clientStance(w,act)==='ask') c *= 1.25; }
  if(w.race==='demon') c *= 0.5;
  return Math.max(1, c);
}
const clientCost = w => actCost(w, null) * 1.8;
const appeal = w => w.stats.beauty*0.4 + w.stats.charm*0.3 + w.popularity*0.5;
const lewdMult = w => (has(w,'Shy') ? 0.5 : has(w,'Eager') ? 1.25 : 1) * (w.race==='beastkin'?1.15:1) * ((PERS[w.personality]||{}).lewd || 1) * ((S && HOUSES[(houseOf(w)||{}).id]||{}).lewdBoost || 1);
const isFree = w => !!(w.isPartner || w.free);
// Trust from Sam's attention: personality, race, and diminishing returns near the top.
function gainTrust(w, n){ const g = n * pTrust(w) * (w.race==='human'?1.15:1) * (n>0 ? Math.max(0.15, 1 - w.trust/140) : 1); w.trust = clamp(w.trust + g); return g; }
const moodMod = w => (w.mood-50)/10;
// CONSENT MODEL
// inclination = her own appetite for a service (lewdness + likes + mood). That decides what she enjoys.
// Up to 25 below a service's line, she'll do it because Sam asked, if she trusts him enough (costs mood).
// Further below that is a line she won't cross, whatever her trust.
const ASK_BAND = 25;
function inclination(w,id){ return w.lewd + comfortOf(w,id) + (has(w,'Eager')?8:0) - (has(w,'Shy')?5:0) + moodMod(w); }
const trustNeed = gap => Math.round(40 + gap*2);
function clientStance(w,id){
  const a = actById(id); if(!a) return 'no';
  const inc = inclination(w,id) - (w.lovers===id ? 30 : 0);
  if(inc >= a.th) return 'yes';
  if(inc >= a.th - ASK_BAND && w.trust >= trustNeed(a.th - inc)) return 'ask';
  return 'no';
}
function samLean(w,id){ return inclination(w,id) + w.trust*0.3 + (w.lovers===id && w.trust>=40 ? 15 : 0) + (has(w,'Devoted')?20:0) - (has(w,'Oblivious')?45:0); }
function samStance(w,id){
  const a = actById(id); if(!a) return 'no';
  if(has(w,'Oblivious') && id!=='caress') return 'no';
  const inc = samLean(w,id);
  if(inc >= a.th) return 'yes';
  if(inc >= a.th - ASK_BAND && w.trust >= trustNeed(a.th - inc) - 10) return 'ask';
  return 'no';
}
function comfortOf(w,id){ const a = w.acts&&w.acts[id]; return (a?a.comfort:0) + (w.fav===id?10:0) - (w.dislike===id?15:0); }
const canClient = (w,id) => clientStance(w,id) !== 'no';
const canSam = (w,id) => samStance(w,id) !== 'no';
const STANCE = {yes:'<span class="good" title="She enjoys this">✓</span>', ask:'<span class="pink" title="She\'ll do it because she trusts Sam, but it costs her mood">~</span>', no:'<span class="muted" title="A line she won\'t cross yet">✗</span>'};
const actSkill = (w,id) => (w.acts&&w.acts[id]) ? w.acts[id].skill : 0;

/* ---------- wardrobe logic ---------- */
function getOutfit(w){ if(w.outfit==='custom') return {label:'Her own outfit', style:w.style, prompt:w.customOutfit||'an elegant dress', bonus:{}, custom:true}; return WARDROBE[w.outfit] || BASE_OUTFITS.b_corset; }
function getUnder(w){ if(w.under==='custom') return {label:'Custom', prompt:w.customUnder||'simple lace underwear', bonus:{}, style:w.style}; return UNDER[w.under] || UNDER.plain; }
const usesColor = o => /\{color\}/.test(o.prompt||'');
function outfitText(w){ return getOutfit(w).prompt.replace(/\{color\}/g, w.outColor||'black'); }
function underText(w){ return w.under==='none' ? null : getUnder(w).prompt.replace(/\{color\}/g, w.underColor||'white'); }
function ob(w,k){ return ((getOutfit(w).bonus||{})[k]||1) * ((getUnder(w).bonus||{})[k]||1); }
// sp_ outfits unlock at trust 60 (or as a lover); an outfit with its own "unlock" needs that trust, lover or not.
function spTrust(w){ const o = WARDROBE['sp_'+w.key]; return (o && o.unlock) || 60; }
function spUnlocked(w,k){ const o = WARDROBE['sp_'+w.key]; return (o && o.unlock) ? w.trust>=o.unlock : (w.trust>=60 || has(w,'Devoted')); }
function wardrobeAvail(w){
  return Object.entries(WARDROBE).filter(([k,o])=>!o.owner || o.owner===w.key);
}
function wardrobeOK(w,k){ const o = k==='custom' ? {lewd:0} : WARDROBE[k]; return !!o && clothLimit(w,false) >= (o.lewd||0); }
function underOK(w,k){ return !!UNDER[k] && clothLimit(w,false) >= UNDER[k].lewd || k==='custom'; }

function clothLimit(w, withSam){ return w.lewd + (has(w,'Exhibitionist')?15:0) - (has(w,'Shy')?10:0) + (withSam ? w.trust*0.35 + (has(w,'Devoted')?20:0) - (has(w,'Oblivious')?30:0) : (w.trust>=60?8:0)); }
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
// a service's minCloth (services.json) raises the default up to "partly undressed" always, further only if she's comfortable
function actCloth(w, id, withSam){
  const c = comfortCloth(w, withSam, true), a = actById(id) || {}, ix = x => CLOTH.findIndex(y=>y.id===x);
  const m = ix(a.minCloth || 'dressed'); if(m < 0) return c;
  return CLOTH[Math.max(ix(c), Math.min(m, has(w,'Modest') ? 1 : (clothOK(w, CLOTH[m].id, withSam) ? m : 1)))].id;
}
function defaultCloth(w, scene){
  if(scene.startsWith('act:')) return actCloth(w, scene.split(':')[1], false);
  if(scene.startsWith('samact:') || scene.startsWith('duo:')) return actCloth(w, scene.split(':')[1], true);
  if(scene==='solo') return comfortCloth(w, false, true);
  if(scene==='bath') return clothOK(w,'nude',false) ? 'nude' : 'dressed';
  return 'dressed';
}
function wageFor(w){
  if(isFree(w)) return 0;
  const st = STAT_KEYS.reduce((a,k)=>a+w.stats[k],0)/6;
  const tc = Math.max(...TECH_KEYS.map(k=>w.tech[k]||0), ...Object.values(w.acts||{}).map(a=>a.skill*0.8));
  return Math.round((8 + st*0.3 + tc*0.2 + w.popularity*0.3 + (has(w,'Ambitious')?8:0) + (has(w,'Greedy')?6:0)) * (w.race==='beastkin'?0.75:w.race==='dwarf'?1.1:w.race==='dragonkin'?1.15:1));
}
function signingFor(w){ return Math.max(60, Math.round(w.wage * rnd(5,8) * (0.9 + (S?S.rep:10)/150) * (hasBoon('recruit')?0.75:1))); }
function grow(w,k,n){ n *= (w.race==='human'?1.15:1); w.tech[k] = clamp((w.tech[k]||0) + n*(1 - (w.tech[k]||0)/130)); }
function growAct(w,id,n){ if(!w.acts[id]) return; n *= (w.race==='human'?1.15:1); const s=w.acts[id].skill; w.acts[id].skill = clamp(s + n*(1 - s/130)); }
function allNames(){ return S ? [...S.workers, ...S.candidates].map(w=>w.name) : []; }
function genName(race){ const n = NAMES[race]; let name, t=0; do { name = pick(n.f) + (n.l && Math.random()<0.8 ? ' '+pick(n.l) : ''); t++; } while(allNames().includes(name) && t<25); return name; }

function ensureWorker(w){
  w.tech = w.tech || {}; TECH_KEYS.forEach(k=>{ if(w.tech[k]===undefined) w.tech[k]=ri(0,20); });
  w.acts = w.acts || {};
  const base = w.actSkill!==undefined ? w.actSkill : (w.tech.intimacy!==undefined ? w.tech.intimacy : ri(0,25));
  getActs().forEach(a=>{ if(!w.acts[a.id]) w.acts[a.id] = {skill: clamp(Math.round(base*0.8 + (base<10 ? ri(0,10) : ri(8,22)))), comfort: ri(-10,10)}; });
  const ids = getActs().map(a=>a.id).filter(id=>id!=='caress');
  if(w.fav===undefined){ w.fav = pick(ids); if(w.acts[w.fav]) w.acts[w.fav].skill = clamp(w.acts[w.fav].skill+10); }
  if(w.dislike===undefined){ let d=null; if(Math.random()<0.7){ do d=pick(ids); while(d===w.fav); } w.dislike=d; }
  if(w.lovers===undefined){ let l=null; if(Math.random()<0.45){ do l=pick(ids); while(l===w.fav); } w.lovers=l; }
  if(!w.menu) w.menu = [];
  if(w.offDuty===undefined) w.offDuty = false;
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
    else { const b = pick(Object.keys(BASE_OUTFITS).filter(k=>k!=='b_robe' || w.lewd>=20)); w.outfit = b; }
  }
  if(w.outfit && w.outfit!=='custom' && !w.owned.includes(w.outfit)) w.owned.push(w.outfit);
  if(!w.outColor) w.outColor = Math.random()<0.4 ? w.favColor : pick(COLOR_KEYS);
  if(!w.ownedUnder) w.ownedUnder = ['plain'];
  if(!w.under){ if(w.design.underwear){ w.under='custom'; w.customUnder=w.design.underwear; } else w.under = pick(['plain','plain','lace','silk','sports']); }
  if(w.under!=='custom' && !w.ownedUnder.includes(w.under)) w.ownedUnder.push(w.under);
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
  const R = RACES[w.race];
  for(const [k,v] of Object.entries(R.mods)){ if(k==='lewd') w.lewd += v; else if(w.stats[k]!==undefined) w.stats[k] += v; }
  if(has(w,'Elegant')) w.stats.refinement += 10;
  if(has(w,'Former Adventurer')){ w.tech.combat += 25; w.stats.strength += 10; }
  if(has(w,'Party Animal')){ w.tech.bar += 10; w.tech.dance += 10; }
  if(has(w,'Tough')) w.stats.stamina += 10;
  STAT_KEYS.forEach(k=>w.stats[k]=clamp(Math.round(w.stats[k])));
  TECH_KEYS.forEach(k=>w.tech[k]=clamp(Math.round(w.tech[k])));
  w.lewd = clamp(w.lewd);
}
function genWorker(opts={}){
  const race = opts.race || weighted(Object.keys(RACES), r=>({human:40,elf:15,beastkin:25,demon:10,dwarf:10,spirit:2,dragonkin:2}[r]??0));
  const R = RACES[race], q = opts.quality || 1;
  const base = () => clamp(Math.round(rnd(15,55)*q));
  const w = {
    id:uid(), name:genName(race), race, sub: race==='beastkin'?pick(R.subs):'', age:ri(R.age[0],R.age[1]), named:false, keep:false,
    design:{build:pick(BUILDS),hairStyle:pick(HAIR_STYLES),hairColor:pick(HAIR_COLORS),eyes:pick(EYES),
      skin: race==='demon'&&Math.random()<0.4 ? pick(DEMON_SKINS) : pick(SKINS), features:pick(FEATURES)},
    personality:pick(PERSONALITIES), backstory:'', traits:[],
    stats:{beauty:base()+10,charm:base(),refinement:base(),stamina:base(),strength:base(),agility:base()},
    tech:{service:ri(0,30),dance:ri(0,25),bar:ri(0,25),combat:ri(0,20),manage:ri(0,20)}, actSkill:ri(0,25),
    popularity:ri(0,12), lewd:ri(5,60), trust:ri(5,22), mood:ri(52,70), energy:100, health:100,
    wage:0, contract:12, job:'rest', house:null, seed:ri(1,999999999), imgVar:{}, seen:{}, unhappy:0, earnedLast:0, privateCount:0
  };
  const vis = Object.keys(TRAITS).filter(t=>!TRAITS[t].hidden && !TRAITS[t].story && !TRAITS[t].personal);
  const n = Math.random()<0.5 ? 1 : 2;
  while(w.traits.length<n){ const t=pick(vis); if(!w.traits.includes(t) && !(t==='Shy'&&has(w,'Eager')) && !(t==='Eager'&&has(w,'Shy'))) w.traits.push(t); }
  if(Math.random()<0.25) w.traits.push(pick(['Exhibitionist','Night Owl']));
  applyMods(w);
  w.style = w.lewd>45 && Math.random()<0.5 ? 'Revealing' : pick(STYLES.slice(0,4));
  w.favColor = pick(COLOR_KEYS);
  // starting outfit in her style if possible
  const fits = Object.keys(BASE_OUTFITS).filter(k=>BASE_OUTFITS[k].style===w.style && w.lewd>=BASE_OUTFITS[k].lewd);
  w.outfit = fits.length && Math.random()<0.7 ? pick(fits) : pick(Object.keys(BASE_OUTFITS).filter(k=>w.lewd>=BASE_OUTFITS[k].lewd));
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
  Object.assign(w, d); w.acts = {}; w.menu = [];
  w.id = 'n_'+key; w.key = key; w.named = true; w.keep = true; w.sub = d.sub || '';
  w.outfit = 'sig_'+key; w.owned = ['sig_'+key]; w.outColor = null;
  w.ownedUnder = Array.from(new Set(['plain', d.under]));
  w.seed = (hashStr(key)*7 + 12345) % 999999999;
  delete w.role; delete w.partnerTrust; delete w.partnerStory; delete w.partnerLewd;
  if(asPartner){ w.isPartner = true; w.trust = D.partnerTrust; if(D.partnerLewd!==undefined) w.lewd = D.partnerLewd; w.mood = 75; w.backstory = D.partnerStory + '\n\n' + D.backstory; w.contract = 999; }
  else if(D.partnerStory){ w.backstory = D.partnerStory + '\n\n' + D.backstory; }
  if(ARCS[key]) w.arc = 0;
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
function lustLabel(w){ return w.lust>=LUST_HIGH ? 'restless' : w.lust>=LUST_EAGER ? 'eager' : w.lust<LUST_LOW ? 'not in the mood' : 'content'; }
const LUST_EAGER = BAL.lust.eager || 60;
// Her lust profile (data/balance.json → lust): weekly build, how much each act spends, floor and ceiling.
function lustProfile(w){
  const L = BAL.lust, B = L.build, Pf = L.profile, P = PERS[w.personality]||{};
  const T = Object.entries(L.traits||{}).filter(([t])=>has(w,t)).map(([,v])=>v);
  const tm = k => T.reduce((a,t)=>a*(t[k]??1), 1);
  const build = (B.base + w.lewd*B.perLewd + ((has(w,'Eager')||has(w,'Exhibitionist'))?B.eagerTrait:0) + (w.race==='demon'?B.demon:0) + (w.job==='rest'?B.resting:0)) * (P.lustBuild||1) * tm('build');
  const drop = (Pf.dropAtLewd0 + (Pf.dropAtLewd100 - Pf.dropAtLewd0) * w.lewd/100) * tm('drop');
  const floor = Math.min(60, w.lewd*Pf.floorPerLewd + T.reduce((a,t)=>a+(t.floor||0), 0));
  const max = T.reduce((a,t)=>Math.min(a, t.max??100), 100);
  return {build, drop, floor:Math.round(floor), max};
}
const fitLust = w => { const p = lustProfile(w); w.lust = Math.max(Math.min(p.floor, p.max), Math.min(p.max, clamp(w.lust))); return w.lust; };
// Spend lust (a service, private time...). Returns how much it actually went down.
function spendLust(w, base){ const before = w.lust; w.lust = w.lust - base*lustProfile(w).drop; fitLust(w); return Math.round(before - w.lust); }
// Bonus for time with Sam when she's in the mood. Call before spending lust.
function lustBonus(w, mult=1){
  const B = BAL.lust.bonus, b = w.lust>=LUST_HIGH ? B.restless : w.lust>=LUST_EAGER ? B.eager : null;
  if(!b) return '';
  w.mood = clamp(w.mood + b.mood*mult); if(b.trust) gainTrust(w, b.trust*mult);
  return w.lust>=LUST_HIGH ? `${w.name} had been wanting this for days. (Mood +${Math.round(b.mood*mult)}, trust +)` : `${w.name} was very much in the mood. (Mood +${Math.round(b.mood*mult)})`;
}
