'use strict';
/* =====================================================================
   DATA: jobs, houses, economy
   ===================================================================== */
const ECON = needData('economy');
const JOBS = ECON.jobs;
// Trust she needs before she'll take a job she doesn't particularly like. Jobs she enjoys need none.
const JOB_TRUST = ECON.jobTrust;
function jobTrust(w, job){
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
  const all = Object.keys(JOBS).filter(j=>j!=='rest'), up = {}, down = {};
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
// Job positions per house (data/economy.json → slots). Courtesans: 2 + bedrooms; attendants: as many as courtesans ('as');
// promoters and maids have no entry and are unlimited.
function slotsFor(h, job){
  const d = ECON.slots[job]; if(!d) return 99;
  if(d.as) return slotsFor(h, d.as);
  const u = h.up || {};
  let n = (d.base||0) + Object.entries(d).filter(([k])=>u[k] && !['base','perSize','perRoom','min','perRooms'].includes(k)).reduce((a,[,v])=>a+v,0) + (d.perSize ? Math.floor(houseSize(h)/d.perSize) : 0);
  if(d.perRoom) n += h.rooms * d.perRoom;
  if(d.perRooms) n += Math.floor(h.rooms / d.perRooms);
  return Math.max(d.min||0, n);
}
const BEDS = ECON.beds;
const FLOOR_REST = ECON.floorRest;
const AMENITY_SIZE = ECON.amenitySize;
const houseSize = h => (HOUSES[h.id].size||9) + (h.annex?3:0);
const roomsUsed = h => h.rooms + (h.quarters||0) + Object.keys(h.up||{}).filter(k=>h.up[k]).reduce((a,k)=>a+(AMENITY_SIZE[k]||1),0);
const bedsFor = h => (h.quarters||0)*2 + (h.extraBeds||0);
const maxExtraBeds = h => (h.quarters||0)*2;   // each staff room fits up to 2 more (bunks, a cot by the window)
const sleepers = h => S.workers.filter(w=>w.house===h.id && w.race!=='spirit');
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
// cls = clientele weights [commoner, adventurer, merchant, noble]
const HOUSES = ECON.houses;
// Sam's past lives: the one he picked at the start, plus one more per New Game+ cycle if he chooses (S.pasts).
const samPasts = () => (typeof S!=='undefined' && S) ? (S.pasts && S.pasts.length ? S.pasts : (S.past ? [S.past] : [])) : [];
const hasPast = k => samPasts().includes(k);
// A per-past variant from a data map ({cook:{...}}): the first of Sam's past lives that has one.
const pastPick = m => { const k = samPasts().find(p=>m && m[p]); return k ? m[k] : null; };
const PASTS = Object.fromEntries(Object.entries(ECON.pasts).map(([k,p])=>[k, Object.assign({}, p, {fx: sam=>Object.entries(p.sam||{}).forEach(([st,n])=>{ sam[st] = (typeof sam[st]==='number' && !['appraisal','appXP'].includes(st)) ? sam[st]+n : Math.max(sam[st]||0, n); })})]));
