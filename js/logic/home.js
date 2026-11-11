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

/* ---------- Owner's Suite sleep-in (balance.json → sleepIn): one lady shares Sam's bed ---------- */
function sleepInOK(w){
  const B = BAL.sleepIn; if(!w || !B) return false;
  return hasSuite(samHouse()) && w.house === samHouse().id && w.trust >= B.trust && w.health >= 30;
}
const sleepInLady = () => { const w = S.sleepIn ? findW(S.sleepIn) : null; return w && sleepInOK(w) ? w : null; };
function setSleepIn(id){
  id = id || null;
  if((S.sleepIn||null) === id) return;
  if(S.flags.sleepInWk === S.week) return toast('Already changed this week.');
  const w = id ? findW(id) : null;
  if(id && !sleepInOK(w)) return toast('She is not able to share the suite.');
  S.sleepIn = id; S.flags.sleepInWk = S.week;
  toast(w ? `${w.name} shares the Owner's Suite.` : 'Sam sleeps alone.'); save(); render();
}
// called once from endWeek: the weekly effect, or clear her if she no longer qualifies
function sleepInWeek(R){
  if(!S.sleepIn) return;
  const w = findW(S.sleepIn), B = BAL.sleepIn;
  if(!w || !sleepInOK(w)){ S.sleepIn = null; R.lines.push(`💤 ${w ? w.name : 'Nobody'} no longer shares Sam's bed.`); return; }
  gainTrust(w, B.trustGain); moodAdd(w, B.mood);
  w.energy = Math.min(energyCap(w), w.energy + B.rest);
  samEnergyAdd(B.samRest);
  R.lines.push(`💤 ${w.name} shared the Owner's Suite with Sam (trust up, mood +${B.mood}, both rested).`);
}
function evSleepIn(w, morning){
  if(!w || !sleepInOK(w)) return null;
  const act = needSamAct(w); if(!act) return null;
  const drain = morning ? 5 : 10;
  return {title: morning ? 'Good Morning' : 'A Long Evening', who:w.id, scene: morning ? 'enc_rest' : 'enc_late', text: flavor(morning ? 'sleepin_morning' : 'sleepin_evening', w),
    choices:[
      {label: morning ? 'Let the morning wait' : 'Stay up with her', fx(){ return encounterResult(w, act, morning ? `The house can manage without him for a while longer.` : `The lamp goes out much later than planned.`, 'encounter', morning ? 'Sam and she share a bed in the Owner\'s Suite; she woke him in the morning with ideas of her own.' : 'Sam and she share a bed in the Owner\'s Suite; as they turned in for the night she proposed something else.', drain); }},
      {label: morning ? '"Let me sleep a bit"' : '"Let\'s just sleep tonight"', fx(){ refusalHit(w, 2); w.lust = clamp(w.lust-3); return `${w.name} sighs against his shoulder, then settles in anyway.` + refusalNote(w); }}]};
}
