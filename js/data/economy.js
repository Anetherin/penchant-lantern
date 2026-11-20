'use strict';
/* =====================================================================
   DATA: jobs, houses, economy
   ===================================================================== */
const ECON = needData('economy');
const JOBS = ECON.jobs;
// Trust she needs before she'll take a job she doesn't particularly like. Jobs she enjoys need none.
const JOB_TRUST = ECON.jobTrust;
function jobTrust(w, job){
  if(typeof isVessel==='function' && isVessel(w) && vesselStage(w) < 1) return Math.min(JOB_TRUST[job]||0, 20);
  if(jobLikes(w).includes(job)) return 0;
  return (JOB_TRUST[job]||0) + (jobDislikes(w).includes(job)?15:0);
}
// Job preferences belong to each lady. Named ones have their own (characters.json / guests.json → jobs: {likes, dislikes});
// everyone else rolls a set once: personality and traits tilt the odds, but there's real randomness (balance.json → jobPrefs).
const jobLikes = w => w.jobLikes || (PERS[w.personality]||{}).jobsUp || [];
const jobDislikes = w => w.jobDislikes || (PERS[w.personality]||{}).jobsDown || [];
function rollJobPrefs(w){
  const D = w.key && NAMED[w.key] && NAMED[w.key].jobs; delete w.jobs;
  if(D){ w.jobLikes = (D.likes||[]).filter(j=>JOBS[j]); w.jobDislikes = (D.dislikes||[]).filter(j=>JOBS[j] && !w.jobLikes.includes(j)); return; }
  const B = BAL.jobPrefs, P = PERS[w.personality]||{jobsUp:[],jobsDown:[]}, R = w.key ? seededRng(hashStr(w.key+':jobs')) : Math.random;
  const all = Object.keys(JOBS).filter(j=>j!=='rest' && !(JOBS[j].race && JOBS[j].race!==w.race)), up = {}, down = {};
  all.forEach(j=>{ up[j] = B.base; down[j] = B.base*0.6; });
  P.jobsUp.forEach(j=>{ if(up[j]!==undefined) up[j] += B.personality; });
  P.jobsDown.forEach(j=>{ if(down[j]!==undefined) down[j] += B.personality; });
  (w.traits||[]).forEach(t=>{ const T = B.traits[t]; if(!T) return; (T.up||[]).forEach(j=>up[j] += B.trait); (T.down||[]).forEach(j=>down[j] += B.trait); });
  if(w.job && up[w.job]!==undefined) up[w.job] += B.ownJob;
  const roll = (W, max) => all.map(j=>({j, r: R() / Math.max(0.01, W[j])})).filter(x=>x.r < 1).sort((a,b)=>a.r-b.r).slice(0, max).map(x=>x.j);
  const net = {}; all.forEach(j=>{ net[j] = up[j] - (down[j] - B.base*0.6) * 0.8; });   // what she's inclined against is less likely to be a favorite
  let L = roll(net, B.maxLikes);
  if(!L.length) L = [all.slice().sort((a,b)=>up[b]-up[a] || R()-0.5)[0]];
  const Dl = roll(down, B.maxDislikes).filter(j=>!L.includes(j));
  w.jobLikes = L; w.jobDislikes = Dl;
}
// Job positions per house (data/economy.json → slots). Courtesans: 4 (+1 with a madame, +1 more per 200 of her madame score: 6 at 1000);
// attendants: one per courtesan working in the house ('byJob'); promoters and maids have no entry and are unlimited.
function madameScore(w){
  return (w.tech.manage||0)*0.5 + statOf(w,'wits')*0.2 + statOf(w,'charm')*0.175 + statOf(w,'charisma')*0.125;
}
function slotsFor(h, job){
  const d = ECON.slots[job]; if(!d) return 99;
  if(d.as) return slotsFor(h, d.as);
  if(d.byJob) return (typeof S!=='undefined' && S) ? S.workers.filter(w=>w.house===h.id && (w.job===d.byJob || (w.job==='rest' && w.prevJob===d.byJob))).length : 0;   // a resting lady keeps her positions open
  const u = h.up || {};
  let n = (d.base||0) + Object.entries(d).filter(([k])=>u[k] && !['base','perSize','perRoom','min','perRooms','madame','madameBase','madameStep','byJob'].includes(k)).reduce((a,[,v])=>a+v,0) + (d.perSize ? Math.floor(houseSize(h)/d.perSize) : 0);
  if((d.madame || d.madameBase) && typeof S!=='undefined' && S){
    const m = S.workers.find(w=>w.house===h.id && (w.job==='madame' || (w.job==='rest' && w.prevJob==='madame')));   // an auto-resting madame keeps her positions open
    if(m) n += (d.madameBase ?? d.madame ?? 1) + (d.madameStep ? Math.floor(madameScore(m) / d.madameStep) : 0);
  }
  if(d.perRoom) n += h.rooms * d.perRoom;
  if(d.perRooms) n += Math.floor(h.rooms / d.perRooms);
  return Math.max(d.min||0, n);
}
const BEDS = ECON.beds;
const FLOOR_REST = ECON.floorRest;
const AMENITY_SIZE = ECON.amenitySize;
const DRINKS = ECON.drinks;
const houseBaseSize = h => {
  const D = (h && HOUSES[h.id]) || {};
  if(D.ngppOnly){
    const B = BAL.ngplus || {}, lvl = Math.max(1, (h && h.ngppLevel) || (typeof S!=='undefined' && S && S.ngppCycle) || 1);
    return (B.ngppRoomStart ?? 10) + (B.ngppRoomStep ?? 5) * (lvl - 1);
  }
  return D.size || 9;
};
const houseSize = h => Math.max(0, houseBaseSize(h) + (h.annex?3:0) - (h.damaged||0));
const roomsUsed = h => h.rooms + (h.quarters||0) + Object.keys(h.up||{}).filter(k=>h.up[k]).reduce((a,k)=>a+(AMENITY_SIZE[k] ?? 1),0);
const bedsFor = h => (h.quarters||0)*2 + (h.extraBeds||0);
const maxExtraBeds = h => (h.quarters||0)*2;   // each staff room fits up to 2 more (bunks, a cot by the window)
const sleepers = h => S.workers.filter(w=>w.house===h.id && !['spirit','android'].includes(w.race));
const RACE_PERK = ECON.racePerks;
const PROP_RATE = ECON.propRate;
const PROP_WHERE = ECON.propWhere;
const UPGRADES = ECON.upgrades;
const ROOM_MULT = ECON.roomMult;
const ROOM_NAMES = ECON.roomNames;
const ROOM_TIER_COST = ECON.roomTierCost;
const PRICES = ECON.prices;
const CLASSES = ECON.classes;
const CLIENT_DESC = needData('people').clients;
// Client tiers (economy.json → tiers): the four groups houses' `cls` weights [commoner, adventurer, merchant, noble] index. Each class has a tier.
const TIERS = ECON.tiers;
const TIER_LABEL = id => ((CLASSES.find(c=>c.id===id)||{}).label || id);
const clsTier = id => ((CLASSES.find(c=>c.id===id)||{}).tier || id);
// Report wording for an anonymous client of a class (people.json → clients, else "a laborer").
const clientWho = id => { const d = CLIENT_DESC[id]; return d && d.length ? pick(d) : 'a ' + TIER_LABEL(id).toLowerCase(); };
const HOUSES = ECON.houses;
const PRESTIGE_TIERS = [
  {min:80, id:'prestigious', label:'Prestigious'},
  {min:65, id:'refined',     label:'Refined'},
  {min:45, id:'respectable', label:'Respectable'},
  {min:25, id:'casual',      label:'Casual'},
  {min:0,  id:'rowdy',       label:'Rowdy'}
];
const housePrestige = h => { const D = h && HOUSES[h.id]; return h && h.prestige != null ? h.prestige : (D && D.prestige != null ? D.prestige : 50); };
// Refinement pays off as a house goes upscale (balance.json → refine). refK: 0 at or below refine.from, 1 at class 100.
// refScore: her Refinement around 50, like client stat tastes (-0.5..1). refMul(w, h, k) = 1 + refine[k] x refScore x refK.
const refK = h => { const from = (BAL.refine||{}).from ?? 35; return clamp((housePrestige(h) - from) / (100 - from), 0, 1); };
const refScore = w => clamp((s100(statOf(w,'refinement')) - 50)/50, -0.5, 1);
const refMul = (w, h, k) => 1 + (((BAL.refine||{})[k]) || 0) * refScore(w) * refK(h);
const prestigeTier = v => PRESTIGE_TIERS.find(t => (v ?? 50) >= t.min) || PRESTIGE_TIERS[PRESTIGE_TIERS.length - 1];
// Sam's past lives: the one he picked at the start, plus one more per New Game+ cycle if he chooses (S.pasts).
const samPasts = () => (typeof S!=='undefined' && S) ? (S.pasts && S.pasts.length ? S.pasts : (S.past ? [S.past] : [])) : [];
const hasPast = k => samPasts().includes(k);
// A per-past variant from a data map ({cook:{...}}): the first of Sam's past lives that has one.
const pastPick = m => { const k = samPasts().find(p=>m && m[p]); return k ? m[k] : null; };
const PASTS = Object.fromEntries(Object.entries(ECON.pasts).map(([k,p])=>[k, Object.assign({}, p, {fx: sam=>Object.entries(p.sam||{}).forEach(([st,n])=>{ sam[st] = (typeof sam[st]==='number' && !['appraisal','appXP'].includes(st)) ? sam[st]+n : Math.max(sam[st]||0, n); })})]));
