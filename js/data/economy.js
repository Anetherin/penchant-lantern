'use strict';
/* =====================================================================
   DATA: jobs, houses, economy
   ===================================================================== */
const ECON = needData('economy');
const JOBS = ECON.jobs;
// Trust she needs before she'll take a job she doesn't particularly like. Jobs she enjoys need none.
const JOB_TRUST = ECON.jobTrust;
function jobTrust(w, job){
  const P = PERS[w.personality]||{jobsUp:[],jobsDown:[]};
  if(P.jobsUp.includes(job)) return 0;
  return (JOB_TRUST[job]||0) + (P.jobsDown.includes(job)?15:0);
}
// Job positions per house. Escort slots: courtesans need a bedroom each; companions need lounge space.
function slotsFor(h, job){
  if(job==='courtesan') return h.rooms;
  const d = ECON.slots[job]; if(!d) return 99;
  const u = h.up || {};
  return (d.base||0) + Object.entries(d).filter(([k])=>u[k] && !['base','perSize'].includes(k)).reduce((a,[,n])=>a+n,0) + (d.perSize ? Math.floor(houseSize(h)/d.perSize) : 0);
}
const BEDS = ECON.beds;
const FLOOR_REST = ECON.floorRest;
const AMENITY_SIZE = ECON.amenitySize;
const houseSize = h => (HOUSES[h.id].size||9) + (h.annex?3:0);
const roomsUsed = h => h.rooms + (h.quarters||0) + Object.keys(h.up||{}).filter(k=>h.up[k]).reduce((a,k)=>a+(AMENITY_SIZE[k]||1),0);
const bedsFor = h => (h.quarters||0)*2;
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
const PASTS = Object.fromEntries(Object.entries(ECON.pasts).map(([k,p])=>[k, Object.assign({}, p, {fx: sam=>Object.entries(p.sam||{}).forEach(([st,n])=>{ sam[st] = (typeof sam[st]==='number' && !['appraisal','appXP'].includes(st)) ? sam[st]+n : Math.max(sam[st]||0, n); })})]));
