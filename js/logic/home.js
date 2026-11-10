/* Sam's home (which house he sleeps in, his bed, home upgrades) and house feasts. Tuning: balance.json → samHome, samUps, feast. */
const samHouse = () => H(S.samHome) || H(homeHouse()) || S.houses[0];
const hasSamUp = k => !!(S.samUps && S.samUps[k]);
function samUpFx(key){
  let n = 0, any = false;
  Object.keys(BAL.samUps||{}).forEach(k=>{ if(!hasSamUp(k)) return; const v = (BAL.samUps[k].fx||{})[key]; if(typeof v==='number') n += v; else if(v) any = true; });
  return key==='reach' ? any : n;
}
const samReach = () => !!(samUpFx('reach') || hasBoon('clone'));
const nearSam = w => samReach() || !!(w && w.house === samHouse().id);
const hasSuite = h => !!(h && h.up && h.up.suite);
const samBedTier = () => Math.min(3, (samHouse().beds||0) + (hasSuite(samHouse()) ? 1 : 0) + (samUpFx('bedTier')||0));
const samBedRest = () => BEDS[samBedTier()].rest;
const samRecover = base => Math.round(base * samBedRest() / BAL.samHome.ref);
function moveSam(id){
  const h = H(id); if(!h) return;
  if(h.id === samHouse().id) return;
  if(S.flags.samMovedWk === S.week) return toast('Sam already moved this week.');
  S.samHome = h.id; S.flags.samMovedWk = S.week;
  toast(`Sam now sleeps at ${h.name}.`); save(); render();
}
function buySamUp(k){
  const u = BAL.samUps[k]; if(!u || hasSamUp(k)) return;
  if(S.gold < u.cost) return toast('Not enough gold.');
  S.gold -= u.cost; S.samUps = S.samUps || {}; S.samUps[k] = true;
  toast(`Bought: ${u.label}`); save(); render();
}
function throwFeast(tierId){
  const h = curH(), t = BAL.feast.tiers.find(x=>x.id===tierId); if(!h || !t) return;
  if(h.feastWk === S.week) return toast('This house already feasted this week.');
  const L = S.workers.filter(w=>w.house===h.id);
  if(!L.length) return toast('Nobody lives here to feast.');
  const total = t.cost * L.length;
  if(S.gold < total) return toast('Not enough gold.');
  S.gold -= total; h.feastWk = S.week;
  let tr = 0;
  L.forEach(w=>{ tr += gainTrust(w, t.trust); moodAdd(w, t.mood); });
  addLog(`🍽️ ${t.label} at ${h.name} (${L.length} ladies, −${fmt(total)})`);
  samLog(`Threw a ${t.label.toLowerCase()} at ${h.name}`);
  save(); render();
  showResult(t.label, `${t.text.replace(/\{house\}/g, h.name)}\n\n${L.length} ladies · Trust ${tDelta(tr/L.length)} each · Mood +${t.mood} each · −${fmt(total)}`);
}
