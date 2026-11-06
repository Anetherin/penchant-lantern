'use strict';
/* =====================================================================
   PLAYER COMMANDS
   ===================================================================== */
function canDo(w, job){
  const J = JOBS[job]; if(!J) return 'Unknown job.';
  const h = houseOf(w);
  if(job!=='rest' && w.health<30) return `${w.name} is too unwell to work.`;
  if(job!=='rest' && w.trust < jobTrust(w,job)) return `${w.name} doesn't trust Sam enough for that yet (needs trust ${jobTrust(w,job)}).`;
  if(job==='courtesan' && !getActs().some(a=>canClient(w,a.id))) return `${w.name} isn't comfortable with that yet.`;
  if(J.needs && !h.up[J.needs]) return `${h.name} needs a ${UPGRADES[J.needs].label}.`;
  const used = S.workers.filter(x=>x!==w && x.house===h.id && x.job===job).length, max = slotsFor(h, job);
  if(used >= max) return job==='courtesan' ? `No free bedrooms in ${h.name}.` : `No open ${J.label} positions in ${h.name} (${max}).`;
  return null;
}
function setJob(id, job){
  const w = findW(id); if(!w) return;
  const msg = canDo(w, job);
  if(msg) toast(msg); else {
    w.job = job;
    if((job==='courtesan'||job==='companion') && !w.menu.length){ w.menu = getActs().filter(a=>clientStance(w,a.id)==='yes').map(a=>a.id); if(w.menu.length) toast(`${w.name}'s menu: ${w.menu.map(actLabel).join(', ')}. Add "~" favors on her sheet.`); }
    save();
  }
  render(); refreshSheetInfo();
}
function setHouse(id, hid){
  const w = findW(id); if(!w || !H(hid)) return;
  if(w.locked && w.locked!==hid) return toast(`${w.name} belongs to ${H(w.locked).name}.`);
  w.house = hid; if(canDo(w, w.job)) w.job = 'rest';
  note(`${w.name} moves to ${H(hid).name}.`); save(); render(); refreshSheetInfo();
}
function toggleMenu(id, act, on){
  const w = findW(id); if(!w) return;
  if(on && !canClient(w,act)) return toast(`${w.name} won't do that with clients.`);
  w.menu = w.menu.filter(x=>x!==act); if(on) w.menu.push(act);
  save(); refreshSheetInfo();
}
function setAutoRest(id, on){ const w=findW(id); if(!w) return; w.autoRest=!!on; if(!on) delete w.prevJob; save(); refreshSheetInfo(); }
function setOffDuty(id, on){ const w=findW(id); if(!w) return; w.offDuty=!!on; save(); refreshSheetInfo(); }
function setWage(id, v){ const w=findW(id); if(!w) return; if(isFree(w)) return toast(`${w.name} won't take a wage from you.`); w.wage=Math.max(0,Math.round(+v||0)); save(); refreshSheetInfo(); renderHeader(); }
function setPrice(i){ curH().price = i; save(); render(); }
function hire(id){
  const c = S.candidates.find(x=>x.id===id); if(!c) return;
  if(S.gold < c.signing) return toast('Not enough gold for the signing bonus.');
  S.gold -= c.signing; S.candidates = S.candidates.filter(x=>x!==c);
  delete c.signing; c.job='rest'; c.contract=12; c.keep=false; c.seen={}; c.house = curH().id;
  S.workers.push(c); checkUnlocks(true); samXP(3);
  note(`${c.name} joins ${curH().name}.`); save(); render();
  if(SET.ai.on && SET.ai.auto && !c.named && !c.aiBackstory){ c.aiBackstory = true; const tmp = document.createElement('div'); tmp.id='aiTmp'; tmp.style.display='none'; document.body.appendChild(tmp); aiBackstory('aiTmp', c.id).then(()=>tmp.remove()); }
}
function dismiss(id){
  const w = findW(id); if(!w) return;
  if(w.isPartner) return toast(`${w.name} is your partner. She isn't going anywhere.`);
  if(w.locked) return toast(`${w.name} belongs to ${H(w.locked)?H(w.locked).name:'her house'}. She isn't going anywhere.`);
  if(!confirm(`Dismiss ${w.name}? This can't be undone.`)) return;
  S.workers = S.workers.filter(x=>x!==w);
  S.workers.forEach(o=>o.trust=clamp(o.trust-2));
  addLog(`${w.name} was let go. The others noticed.`); closeModal(); save(); render();
}
// Every construction project makes the next one pricier (permits, contractors who've noticed you have money...).
function upgradeCost(h, k){
  const infl = 1 + 0.12*(S.built||0);
  if(k==='room') return Math.round((250 + h.rooms*220) * infl);
  if(k==='quarters') return Math.round((200 + (h.quarters||0)*160) * infl);
  if(k==='roomTier') return Math.round((ROOM_TIER_COST[h.tier]||0) * infl);
  if(k==='beds') return Math.round((BEDS[Math.min(3,(h.beds||0)+1)].cost) * Math.max(1,h.quarters||1) * infl);
  if(k==='annex') return Math.round(2500 * infl);
  return Math.round((UPGRADES[k]?UPGRADES[k].cost:0) * infl);
}
function buyUpgrade(k){
  const h = curH(); let cost = upgradeCost(h,k), need = 0;
  if(k==='room'||k==='quarters') need = 1;
  else if(k==='roomTier'){ if(h.tier>=3) return toast('Bedrooms are already opulent.'); }
  else if(k==='beds'){ if((h.beds||0)>=3) return toast('Already the best beds in town.'); }
  else if(k==='annex'){ if(h.annex) return toast('Already expanded.'); }
  else { if(h.up[k]) return; need = AMENITY_SIZE[k]||1; }
  if(need && roomsUsed(h) + need > houseSize(h)) return toast(`${h.name} is out of space (${roomsUsed(h)}/${houseSize(h)} rooms used).`);
  if(S.gold < cost) return toast('Not enough gold.');
  S.gold -= cost; S.built = (S.built||0) + 1;
  if(k==='room'){ h.rooms++; note(`${h.name}: a new bedroom is ready. (${h.rooms} total)`); }
  else if(k==='quarters'){ h.quarters=(h.quarters||0)+1; note(`${h.name}: new staff quarters. Beds for ${bedsFor(h)}.`); }
  else if(k==='roomTier'){ h.tier++; note(`${h.name}: bedrooms refurbished to ${ROOM_NAMES[h.tier]}.`); }
  else if(k==='beds'){ h.beds=(h.beds||0)+1; note(`${h.name}: staff now sleep on ${BEDS[h.beds].label.toLowerCase()}.`); }
  else if(k==='annex'){ h.annex=true; note(`${h.name}: annex built (+3 rooms of space).`); }
  else { h.up[k]=true; note(`${h.name}: ${UPGRADES[k].label} built.`); }
  save(); render();
  if(k==='bar' && !S.flags.hilde && !isHired('hilde')){ S.flags.hilde=true; EVQ.push(evHilde); runQueue(); }
}
function buyHouse(id){
  const D = HOUSES[id]; if(!D || H(id)) return;
  if(D.premium && ((S.sam.lvl||1) < D.level || S.rep < D.renown)) return toast(`${D.name} won't sell to Sam yet. Needs Sam level ${D.level} and renown ${D.renown}.`);
  if(S.gold < D.cost) return toast('Not enough gold.');
  if(!confirm(`Buy ${D.name} for ${fmt(D.cost)}?`)) return;
  S.gold -= D.cost; S.houses.push(makeHouse(id)); S.cur = id;
  note(`You now own ${D.name}!`);
  if(!isHired(D.npc)){
    const n = makeNamed(D.npc); n.house = id; n.locked = id; n.contract = 999; n.job = canDo(n, NAMED[D.npc].job) ? 'companion' : NAMED[D.npc].job;
    S.workers.push(n); checkUnlocks(true);
    EVQ.push(()=>({title:`${D.name}`, who:n.id, scene:'portrait', text:`${n.name} is waiting at the door when Sam arrives with the deed.\n\n${n.backstory}\n\nShe comes with the place.`, choices:[{label:'Welcome aboard', fx(){ n.trust=clamp(n.trust+5); return ''; }}]}));
  }
  save(); render(); runQueue();
}
function payExtra(){
  const el = $('#payamt'); const amt = Math.floor(+((el&&el.value)||0));
  if(amt<=0) return toast('Enter an amount.');
  if(amt > S.gold) return toast('You don\'t have that much.');
  const a = Math.min(amt, S.debt.remaining);
  S.gold -= a; S.debt.remaining -= a; S.debt.carry = Math.max(0, S.debt.carry - a);
  note(`Paid ${fmt(a)} toward the debt.`); save(); render(); checkEnd();
}
