'use strict';
/* =====================================================================
   EFFECT ENGINE
   One merged effect map per lady, from: her traits (data/traits.json), race + beastkin sub (data/races.json),
   body (data/body.json), her personal unique trait (w.unique, copied from characters/guests data) and
   New Game+ perks (w.ngPerks, ids in traits.json). Vocabulary: see the _readme in data/traits.json.
     fxList(w)         -> array of fx objects
     fxMul(w,key)      -> product of numeric values (default 1)
     fxAdd(w,key)      -> sum (default 0)
     fxHas(w,key)      -> any truthy
     fxSub(w,key,id)   -> keyed maps, e.g. fxSub(w,'actQuality','breast_give') -> product
     fxArr(w,key)      -> merged list (actBan)
   Everything that isn't a simple number (Modest, Devoted, Oblivious, Shy/Eager exclusivity, demon feeding,
   android recharging...) stays in code and reads has(w,...) / w.race.
   ===================================================================== */
const FX_CACHE = new WeakMap();
const bodyOf = w => Object.assign({}, BODY_DEF, (w && w.body) || {});
const raceOf = w => RACES[w && w.race] || RACES.human;
// Reincarnated: every New Game+ a lady carries over adds a stack (w.reborn). balance.json → ngplus.reborn.
function rebornFx(w){
  const n = w.reborn||0, R = (BAL.ngplus||{}).reborn; if(!n || !R) return null;
  return {trustGain: 1 + (R.trust||0)*n, skillGain: 1 + (R.skill||0)*n, statGain: 1 + (R.stat||0)*n, lewdGain: 1 + (R.lewd||0)*n};
}
const rebornDesc = w => { const f = rebornFx(w); return f ? `Carried over ${w.reborn} time${w.reborn>1?'s':''}: trust grows ×${f.trustGain.toFixed(2)}, skills ×${f.skillGain.toFixed(2)}, stats ×${f.statGain.toFixed(2)}, lewdness ×${f.lewdGain.toFixed(2)} as fast.` : ''; };
function fxSig(w){ return [w.race, w.sub, (w.traits||[]).join('|'), JSON.stringify(w.body||null), w.unique ? w.unique.name+'/'+JSON.stringify(w.unique.fx||null) : '', (w.ngPerks||[]).join('|'), w.reborn||0].join('~'); }
function fxList(w){
  if(!w) return [];
  const sig = fxSig(w), c = FX_CACHE.get(w);
  if(c && c.sig === sig && c.wk === (typeof S!=='undefined' && S ? S.week : 0)) return c.list;
  const list = [], add = f => { if(f && typeof f==='object') list.push(f); };
  (w.traits||[]).forEach(t => add(TRAITS[t] && TRAITS[t].fx));
  (w.ngPerks||[]).forEach(t => add(TRAITS[t] && TRAITS[t].fx));
  const rb = rebornFx(w); if(rb) add(rb);
  const R = raceOf(w); add(R.fx);
  const sd = w.race==='beastkin' ? subData(w.race, w.sub) : null; if(sd) add(sd.fx);
  const b = bodyOf(w); BODY_KEYS.forEach(k => { const o = bodyOpts(k)[b[k]]; if(o) add(o.fx); });
  if(w.unique) add(w.unique.fx);
  FX_CACHE.set(w, {sig, wk: (typeof S!=='undefined' && S ? S.week : 0), list});
  return list;
}
function fxMul(w, key){ let m = 1; fxList(w).forEach(f => { if(typeof f[key]==='number') m *= f[key]; }); return m; }
function fxAdd(w, key){ let a = 0; fxList(w).forEach(f => { if(typeof f[key]==='number') a += f[key]; }); return a; }
function fxHas(w, key){ return fxList(w).some(f => !!f[key]); }
function fxSub(w, key, id){ let m = 1; fxList(w).forEach(f => { const o = f[key]; if(o && typeof o==='object' && typeof o[id]==='number') m *= o[id]; }); return m; }
function fxArr(w, key){ const out = []; fxList(w).forEach(f => { if(Array.isArray(f[key])) out.push(...f[key]); }); return out; }
const actBanned = (w, id) => fxArr(w, 'actBan').includes(actKey(id));

/* ---------- bodies ---------- */
function rollBody(race){
  const skew = (BODY.raceSkew||{})[race] || {}, out = {};
  BODY_KEYS.forEach(k => { const o = bodyOpts(k), ids = Object.keys(o);
    out[k] = ids.length ? weighted(ids, id => Math.max(0.01, (o[id].weight ?? 1) + (((skew[k]||{})[id]) || 0))) : BODY_DEF[k]; });
  return out;
}
const bodyText = w => { const b = bodyOf(w); return BODY_KEYS.map(k => (bodyOpts(k)[b[k]]||{}).img || '').filter(Boolean).join(', '); };
const bodyLabel = w => { const b = bodyOf(w); return BODY_KEYS.map(k => (bodyOpts(k)[b[k]]||{}).label || b[k]).join(' · '); };

/* ---------- small helpers built on fx ---------- */
// Her lust at which she's restless/reckless: shifted by recklessAt, never for noReckless ladies.
const lustHigh = w => fxHas(w, 'noReckless') ? 1e9 : LUST_HIGH + fxAdd(w, 'recklessAt');
const restless = w => w.lust >= lustHigh(w);
// Mood change scaled by moodDelta (events & work). Returns the applied change.
// A madame in her house softens mood losses (balance.json → jobs.madameMoodLoss).
function madameShield(w){
  if(typeof S==='undefined' || !S || !w.house) return 1;
  return S.workers.some(x=>x!==w && x.house===w.house && x.job==='madame') ? BAL.jobs.madameMoodLoss : 1;
}
function moodAdd(w, n){ const before = w.mood; let d = n * fxMul(w, 'moodDelta'); if(d < 0) d *= madameShield(w); w.mood = clamp(w.mood + d); return w.mood - before; }
// Sleep/rest recovery multiplier from fx, plus the house's amenities (hearth for dwarves).
function restMult(w){
  let m = fxMul(w, 'energyRec');
  const h = (typeof S!=='undefined' && S) ? houseOf(w) : null;
  if(h && w.race==='dwarf' && h.up && h.up.hearth) m *= 1.1;
  return m;
}
// Race gating: the upgrade she needs in her house (races.json → needs). Returns a message, or null if fine.
function raceBlock(w, h){
  const need = raceOf(w).needs; if(!need || !h) return null;
  if(h.up && h.up[need]) return null;
  return `${w.name} needs a ${(UPGRADES[need]||{label:need}).label} in ${h.name}.`;
}
// Small natural stat growth from the job she does (1000-unit points). n is in the same units as grow().
function statXP(w, key, n){
  if(!w.stats || w.stats[key]===undefined) return;
  const v = w.stats[key];
  w.stats[key] = clampK(v + n * fxMul(w, 'statGain') * Math.max(0.05, 1 - v/growDen()));
}

/* ---------- counters (w.counts) and developable traits ---------- */
// countUp(w,'svc'), countUp(w,'svcByAct.oral_give'), countUp(w,'jobWeeks.dancer', 1)
function countUp(w, key, n=1){
  w.counts = w.counts || {};
  const p = String(key).split('.'); let o = w.counts;
  for(let i=0;i<p.length-1;i++){ if(typeof o[p[i]]!=='object' || o[p[i]]===null) o[p[i]] = {}; o = o[p[i]]; }
  o[p[p.length-1]] = (o[p[p.length-1]]||0) + n;
  return o[p[p.length-1]];
}
function countOf(w, key){ let o = w.counts || {}; for(const k of String(key).split('.')){ if(o===undefined || o===null) return 0; o = o[k]; } return typeof o==='number' ? o : 0; }
function earnEligible(w, e){
  if(!e) return false;
  if(e.count) return countOf(w, e.count) >= (e.at||1);
  if(e.stat){ const v = w.stats && w.stats[e.stat]!==undefined ? s100(w.stats[e.stat]) : w.tech && w.tech[e.stat]!==undefined ? s100(w.tech[e.stat]) : (w[e.stat]||0); return v >= (e.at||0); }
  if(e.trust!==undefined) return w.trust >= e.trust;
  if(e.lewd!==undefined) return w.lewd >= e.lewd;
  if(e.job) return countOf(w, 'jobWeeks.'+e.job) >= (e.weeks||1);
  if(e.weeks!==undefined) return countOf(w, 'weeksWorked') >= e.weeks;
  return false;
}
// Weekly check: returns the names of traits she developed this week.
function earnCheck(w){
  const got = [];
  Object.keys(TRAITS).forEach(t => {
    const T = TRAITS[t]; if(!T.earn || has(w, t) || got.includes(t)) return;
    if((T.excl||[]).some(x => has(w, x) || got.includes(x))) return;
    if(!earnEligible(w, T.earn) || Math.random() >= EARN_CHANCE) return;
    (w.traits = w.traits||[]).push(t); got.push(t);
  });
  return got;
}
// Her client reaction to her race (races.json → client): 'like' (enthusiast), 'dislike' (put off) or null.
function raceReact(w, clsId){
  const R = raceOf(w), sd = w.race==='beastkin' ? subData(w.race, w.sub) : null, C = Object.assign({}, R.client||{}, (sd && sd.client) || {});
  const like = ((C.classLike||{})[clsId]) ?? C.like ?? 0, dis = C.dislike ?? 0, r = Math.random();
  return r < like ? 'like' : r < like + dis ? 'dislike' : null;
}
