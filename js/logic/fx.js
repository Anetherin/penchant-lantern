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
/* ---------- stat bonus layer ----------
   w.stats is her TRAINED base (capped by clampK, grown by statXP, reset by New Game+). Race / beastkin-sub mods, fx.stats (traits,
   perks...) and the stats on her worn outfit and underwear are a live bonus on top (0-100 scale x SKL) that may exceed statCap().
   Every gameplay read of a stat goes through statOf(). Nothing statBonus calls may read statOf. */
const wornStat = (it, k) => (it && it.stats && typeof it.stats[k]==='number') ? it.stats[k] : 0;
function statBonus(w, k){
  if(!w) return 0;
  let n = 0;
  fxList(w).forEach(f => { if(f.stats && typeof f.stats[k]==='number') n += f.stats[k]; });
  const R = RACES[w.race], SD = w.race==='beastkin' ? subData(w.race, w.sub) : null;
  if(R && R.mods && typeof R.mods[k]==='number') n += R.mods[k];
  if(SD && SD.mods && typeof SD.mods[k]==='number') n += SD.mods[k];
  n += wornStat(getOutfit(w), k) + wornStat(getUnder(w), k);
  return n * SKL;
}
// [[label, amount on the 1000 scale], ...] for the tooltip; the sources match statBonus
function statBonusParts(w, k){
  const out = [], add = (label, v) => { if(typeof v==='number' && v) out.push([label, v*SKL]); };
  if(!w) return out;
  const fxs = f => f && f.stats ? f.stats[k] : 0;
  (w.traits||[]).forEach(t => add(t, fxs(TRAITS[t] && TRAITS[t].fx)));
  (w.ngPerks||[]).forEach(t => add(t, fxs(TRAITS[t] && TRAITS[t].fx)));
  const rb = rebornFx(w); if(rb) add('Reincarnated', fxs(rb));
  const R = RACES[w.race], SD = w.race==='beastkin' ? subData(w.race, w.sub) : null;
  if(R){ add(R.label || w.race, R.mods && R.mods[k]); add(R.label || w.race, fxs(R.fx)); }
  if(SD){ add(SD.label || w.sub, SD.mods && SD.mods[k]); add(SD.label || w.sub, fxs(SD.fx)); }
  const b = bodyOf(w); BODY_KEYS.forEach(bk => { const o = bodyOpts(bk)[b[bk]]; if(o) add('Body', fxs(o.fx)); });
  if(w.unique) add(w.unique.name || 'Unique', fxs(w.unique.fx));
  const o = getOutfit(w), u = getUnder(w);
  add('Outfit', wornStat(o, k)); add('Underwear', wornStat(u, k));
  return out;
}
const statOf = (w, k) => Math.max(0, ((w && w.stats && w.stats[k]) || 0) + statBonus(w, k));
const statBonusTip = (w, k) => statBonusParts(w, k).map(([l, v]) => `${l} ${v>0?'+':''}${Math.round(v)}`).join(', ');
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
function moodAdd(w, n){ const before = w.mood; let d = n * fxMul(w, 'moodDelta'); if(d < 0) d *= madameShield(w) * fxMul(w, 'moodLoss'); w.mood = clamp(w.mood + d); return w.mood - before; }
// Sleep/rest recovery multiplier from fx, plus the house's amenities (garden; balance.json → amenities).
function restMult(w){
  let m = fxMul(w, 'energyRec');
  const h = (typeof S!=='undefined' && S) ? houseOf(w) : null;
  if(h && h.up && h.up.garden) m *= 1 + BAL.amenities.garden.rest * gardenMult(w);
  return m;
}
/* ---------- amenity helpers (data/balance.json → amenities) ---------- */
// The garden's effect is doubled for elves.
const gardenMult = w => w.race==='elf' ? BAL.amenities.garden.elfMult : 1;
// Incense burner: mode 'calm' | 'aphro' of the lady's house (null without one). Beastkin feel it more strongly.
function incenseMode(w){ const h = (typeof S!=='undefined' && S && w && w.house) ? houseOf(w) : null; return (h && h.up && h.up.incense) ? (h.incense || 'calm') : null; }
// Multiplier for key ('pushy', 'lust', 'prop') from her house's incense: the factor's distance from 1, times her strength.
function incenseMul(w, key){
  const A = BAL.amenities.incense, m = incenseMode(w), f = m && A[m] ? A[m][key] : undefined; if(f === undefined) return 1;
  return Math.max(0.1, 1 + (f - 1) * (w.race==='beastkin' ? A.beastMult : 1));
}
// The same for the house as a whole (client trouble, incidents): no race involved.
function incenseHouseMul(h, key){ const A = BAL.amenities.incense, m = h && h.up && h.up.incense ? (h.incense || 'calm') : null, f = m && A[m] ? A[m][key] : undefined; return f === undefined ? 1 : f; }
// True when her house burns calming incense (a refusal from Sam stings less; see refusalHit).
const incenseCalmsRefusal = w => incenseMode(w) === 'calm';
// Aphrodisiac incense: extra lewdness counted only for service-comfort checks (never stored).
function lewdBoost(w){ return incenseMode(w) === 'aphro' ? BAL.amenities.incense.lewdDrop * (w.race==='beastkin' ? BAL.amenities.incense.beastMult : 1) : 0; }
// Binding Sigil: demons in a house with one take this share of the usual energy from Sam.
function sigilDrain(w){ const h = (typeof S!=='undefined' && S && w && w.house) ? houseOf(w) : null; return h && h.up && h.up.sigil ? BAL.amenities.sigil.samDrain : 1; }
// Candidates of a race turn up more often while its house amenity (Tethering Stone: spirits, Charging Alcove: androids) stands in ANY house.
function raceDraw(race){
  const k = {spirit:'tether', android:'charger'}[race];
  return (k && typeof S!=='undefined' && S && S.houses && S.houses.some(h=>h.up && h.up[k])) ? BAL.amenities.raceDraw : 1;
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
  if(e.stat){ const v = w.stats && w.stats[e.stat]!==undefined ? s100(statOf(w, e.stat)) : w.tech && w.tech[e.stat]!==undefined ? s100(w.tech[e.stat]) : (w[e.stat]||0); return v >= (e.at||0); }
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
// Class lookups for ladies' bonuses (classBonus / classLike / outfit bonus are keyed by the old four ids = tiers): the class id first, then its tier.
function fxSubC(w, key, cls){
  let m = 1; fxList(w).forEach(f => { const o = f[key]; if(!o || typeof o!=='object') return; const v = typeof o[cls.id]==='number' ? o[cls.id] : o[cls.tier]; if(typeof v==='number') m *= v; });
  return m;
}
function obC(w, cls){ const a = ob(w, cls.id); return a !== 1 || cls.tier === cls.id ? a : ob(w, cls.tier); }
// Her client reaction to her race (races.json → client): 'like' (enthusiast), 'dislike' (put off) or null.
// A client with traits (balance.json → clients.traits) likes some ladies more: raises her like chance. `c` is a client object from makeClient or nothing.
function raceReact(w, clsId, c){
  const R = raceOf(w), sd = w.race==='beastkin' ? subData(w.race, w.sub) : null, C = Object.assign({}, R.client||{}, (sd && sd.client) || {});
  const CL = C.classLike || {};
  let like = (CL[clsId] ?? CL[clsTier(clsId)]) ?? C.like ?? 0; const dis = C.dislike ?? 0, r = Math.random();
  if(c && c.traits) c.traits.forEach(t => { if(traitFits(t, w)) like = Math.max(like, t.like ?? 0); });
  return r < like ? 'like' : r < like + dis ? 'dislike' : null;
}

// Client traits (balance.json → clients.traits): every non-regular client rolls 1-3 (traitCount odds), weighted by trait w x the class's
// traits weight, without replacement, skipping excl in either direction. Regulars get none (client = null everywhere).
function makeClient(h, cls){
  const C = BAL.clients, T = C.traits, odds = C.traitCount || [1], tr = [];
  let r = Math.random(), n = 1; for(let i=0;i<odds.length;i++){ r -= odds[i]; if(r <= 0){ n = i + 1; break; } n = i + 1; }
  let keys = Object.keys(T);
  while(tr.length < n && keys.length){
    const k = weighted(keys, x => (T[x].w ?? 1) * ((cls.traits||{})[x] ?? 1));
    tr.push(Object.assign({id:k}, T[k]));
    keys = keys.filter(x => x!==k && !(T[k].excl||[]).includes(x) && !(T[x].excl||[]).includes(k));
  }
  return {cls, traits: tr};
}
const boozeFactor = X => X && X.barN ? 1 + (X.h.drinks||0) * BAL.clients.boozeDrinks : 0;
// Combine one key over his traits (X gives the bar for the booze parts): fee/prop/tips/compFee/pushyMult multiply, pushy/rowdy/selfAccept add.
function cMul(c, key, X){
  let m = 1; if(!c) return m; const f = boozeFactor(X);
  c.traits.forEach(t => { if(t[key] != null) m *= t[key]; if(key==='prop' && f && t.booze && t.booze.prop != null) m *= 1 + (t.booze.prop - 1) * f; });
  return m;
}
function cAdd(c, key, X){
  let a = 0; if(!c) return a; const f = boozeFactor(X);
  c.traits.forEach(t => { a += t[key] || 0; if(f && t.booze) a += (t.booze[key] || 0) * f; });
  return a;
}
const cQual = (c, q) => c ? c.traits.reduce((m, t) => t.qualityFee ? m * (t.qualityFee[0] + q * t.qualityFee[1]) : m, 1) : 1;
// Does her race (or 'race:sub'), a trait of hers or her restlessness match what this trait likes?
function traitFits(t, w){
  const L = t.likes; if(!L) return false;
  return (L.races||[]).some(x => x===w.race || x===w.race+':'+w.sub) || (L.traits||[]).some(x => has(w, x)) || (!!L.restless && restless(w));
}
const clientDraw = (c, w) => c ? c.traits.reduce((m, t) => traitFits(t, w) ? m * (t.draw ?? 1) : m, 1) : 1;
// Count a client's traits into the house report and the week's average tips multiplier.
function noteClient(X, c){
  if(!c) return; X.tipN = (X.tipN||0) + 1; X.tipSum = (X.tipSum||0) + cMul(c, 'tips', X);
  c.traits.forEach(t => { if(t.hidden) return; const o = X.hr.ctraits = X.hr.ctraits || {}; o[t.id] = (o[t.id]||0) + 1; });
}
// Extra client trait helpers. cHas: has a trait with this key; cJob: x his chance to proposition staff of a job; cPatience: + chance to wait (incl. booze part);
// cOpen: openness to a host's warm-up on a 0-1 scale (base 0.3 + the 'open' keys).
const cHas = (c, key) => !!c && c.traits.some(t => t[key]);
const cJob = (c, job) => c ? c.traits.reduce((m, t) => t.jobProp && t.jobProp[job] != null ? m * t.jobProp[job] : m, 1) : 1;
const cPatience = (c, X) => cAdd(c, 'patience', X);
const cOpen = c => 0.3 + cAdd(c, 'open');
// Report segment: " · clients: 5 rowdy, 9 drinker" (top 3 traits by count).
function ctraitsLine(hr){
  const T = (BAL.clients && BAL.clients.traits) || {}, a = Object.keys(hr.ctraits||{}).sort((x,y)=>hr.ctraits[y]-hr.ctraits[x]).slice(0,3);
  return a.length ? ` · clients: ${a.map(k=>hr.ctraits[k]+' '+String((T[k]&&T[k].label)||k).toLowerCase()).join(', ')}` : '';
}
