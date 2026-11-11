'use strict';
/* =====================================================================
   PLAYER COMMANDS
   ===================================================================== */
function canDo(w, job){
  const J = JOBS[job]; if(!J) return 'Unknown job.';
  const h = houseOf(w);
  if(J.race && w.race!==J.race) return `Only ${(RACES[J.race]||{label:J.race}).label.toLowerCase()}s can work as ${J.label}.`;
  if(job!=='rest' && w.health<30) return `${w.name} is too unwell to work.`;
  if(job!=='rest' && w.trust < jobTrust(w,job)) return `${w.name} doesn't trust Sam enough for that yet (needs trust ${tShow(jobTrust(w,job))}).`;
  if(job==='courtesan' && !getActs().some(a=>clientStance(w,a.id,'courtesan')!=='no')) return `${w.name} isn't comfortable with that yet.`;
  if(J.needs && !h.up[J.needs]) return `${h.name} needs a ${UPGRADES[J.needs].label}.`;
  const used = S.workers.filter(x=>x!==w && x.house===h.id && x.job===job).length, max = slotsFor(h, job);
  if(used >= max) return `No open ${J.label} positions in ${h.name} (${max}).`;
  return null;
}
// Jobs that offer a service menu (courtesans, and the must-offer staff roles).
const MENU_JOBS = ['courtesan','dancer','bath','host'];
// First job she can actually take: her preference, then the open-ended ones.
function safeJob(w, pref){ for(const j of [pref,'courtesan','promoter','attendant','maid']) if(j && JOBS[j] && !canDo(w,j)) return j; return 'rest'; }
function setJob(id, job){
  const w = findW(id); if(!w) return;
  const msg = canDo(w, job);
  if(msg) toast(msg); else {
    w.job = job;
    if(MENU_JOBS.includes(job) && !w.menu.length){ w.menu = getActs().filter(a=>clientStance(w,a.id)==='yes').map(a=>a.id); if(w.menu.length) toast(`${w.name}'s menu: ${w.menu.map(actLabel).join(', ')}. Add "~" favors on her sheet.`); }
    save();
  }
  render(); refreshSheetInfo();
}
function setHouse(id, hid){
  const w = findW(id); if(!w || !H(hid)) return;
  if(w.locked && w.locked!==hid) return toast(`${w.name} belongs to ${H(w.locked).name}.`);
  const rb = raceBlock(w, H(hid)); if(rb) return toast(rb);
  w.house = hid; if(canDo(w, w.job)) w.job = 'rest';
  note(`${w.name} moves to ${H(hid).name}.`); save(); render(); refreshSheetInfo();
}
function toggleMenu(id, act, on){
  const w = findW(id); if(!w) return;
  if(on && !canClient(w,act)) return toast(`${w.name} won't do that with clients.`);
  w.menu = w.menu.filter(x=>x!==act); if(on) w.menu.push(act);
  save(); refreshSheetInfo();
}
// Service outfit and dress level (sheet → wardrobe): how she looks in service images. Visual only.
function setSvcOutfit(id, k){ const w=findW(id); if(!w) return; w.svcOutfit = k || ''; save(); refreshSheetInfo(); sheetImg(); }
function setSvcLevel(id, k){ const w=findW(id); if(!w) return; w.svcLevel = k || 'auto'; save(); refreshSheetInfo(); fillCloth(); sheetImg(); }
function setAutoRest(id, on){ const w=findW(id); if(!w) return; w.autoRest=!!on; if(!on) delete w.prevJob; save(); refreshSheetInfo(); }
function setOffDuty(id, v){ const w=findW(id); if(!w) return; w.offDuty = v==='on'||v===true ? 'on' : v==='off'||v===false ? 'off' : 'ask'; save(); refreshSheetInfo(); }
function setTeachSkill(hid, v){ const h = H(hid); if(!h) return; h.teachSkill = v || null; save(); render(); refreshSheetInfo(); }
function setSamples(id, on){ const w=findW(id); if(!w) return; if(on && has(w,'Modest')) return toast(`${w.name} is too modest for handing out samples.`); w.samples=!!on; save(); refreshSheetInfo(); }
function setWage(id, v){ const w=findW(id); if(!w) return; if(isFree(w)) return toast(`${w.name} won't take a wage from you.`); w.wage=Math.max(0,Math.round(+v||0)); save(); refreshSheetInfo(); renderHeader(); }
function setPrice(i){ curH().price = i; save(); render(); }
function hire(id){
  const c = S.candidates.find(x=>x.id===id); if(!c) return;
  const rb = raceBlock(c, curH()); if(rb) return toast(rb);
  if(S.gold < c.signing) return toast('Not enough gold for the signing bonus.');
  S.gold -= c.signing; S.candidates = S.candidates.filter(x=>x!==c);
  delete c.signing; c.job='rest'; c.contract=12; c.keep=false; c.seen={}; c.house = curH().id;
  S.workers.push(c); checkUnlocks(true); samXP(3);
  note(`${c.name} joins ${curH().name}.`); save(); render();
  if(SET.ai.on && SET.ai.autoBackstory!==false && !c.named && !c.aiBackstory){ c.aiBackstory = true; const tmp = document.createElement('div'); tmp.id='aiTmp'; tmp.style.display='none'; document.body.appendChild(tmp); aiBackstory('aiTmp', c.id).then(()=>tmp.remove()); }
}
function dismiss(id){
  const w = findW(id); if(!w) return;
  if(w.isPartner) return toast(`${w.name} is your partner. She isn't going anywhere.`);
  if(w.locked) return toast(`${w.name} belongs to ${H(w.locked)?H(w.locked).name:'her house'}. She isn't going anywhere.`);
  if(!confirm(`Dismiss ${w.name}? This can't be undone.`)) return;
  stashCloset(w); S.workers = S.workers.filter(x=>x!==w);
  S.workers.forEach(o=>o.trust=clamp(o.trust-2));
  addLog(`${w.name} was let go. The others noticed.`); closeModal(); save(); render();
}
// Repeating the same kind of build gets pricier (count across all houses): permits, contractors who've noticed you have money...
// Bedrooms, staff quarters and extra beds also scale with how many this house already has.
function upgradeCost(h, k){
  const infl = 1 + 0.12*((S.builtBy||{})[k]||0);
  let base;
  if(k==='room') base = 250 + h.rooms*220;
  else if(k==='quarters') base = 200 + (h.quarters||0)*160;
  else if(k==='roomTier') base = ROOM_TIER_COST[h.tier]||0;
  else if(k==='beds') base = BEDS[Math.min(3,(h.beds||0)+1)].cost * Math.max(1,bedsFor(h)/2);
  else if(k==='extraBed') base = 80 + (h.extraBeds||0)*60 + (BEDS[h.beds||0].cost||0)*0.25;
  else if(k==='annex') base = 2500;
  else if(k==='decor') base = (DECOR[Math.min(3,(h.decor||0)+1)]||{}).cost || 0;
  else if(k==='drinks') base = (DRINKS[Math.min(3,(h.drinks||0)+1)]||{}).cost || 0;
  else base = UPGRADES[k] ? UPGRADES[k].cost : 0;
  // Workshop: the markup (inflation) is trimmed by h.wsDisc, never below the base price
  const disc = h.up && h.up.workshop ? clamp(h.wsDisc||0, 0, 1) : 0;
  return Math.round(base + base*(infl-1)*(1-disc));
}
function buyUpgrade(k){
  const h = curH(); let cost = upgradeCost(h,k), need = 0;
  if(k==='room'||k==='quarters') need = 1;
  else if(k==='roomTier'){ if(h.tier>=3) return toast('Bedrooms are already opulent.'); }
  else if(k==='beds'){ if((h.beds||0)>=3) return toast('Already the best beds in town.'); }
  else if(k==='annex'){ if(h.annex) return toast('Already expanded.'); }
  else if(k==='decor'){ if((h.decor||0)>=3) return toast('The house is already as grand as it gets.'); }
  else if(k==='drinks'){ if(!h.up.bar) return toast('The drinks menu needs a Bar first.'); if((h.drinks||0)>=3) return toast('The bar already pours the best in Hollowmere.'); }
  else if(k==='extraBed'){ if((h.extraBeds||0) >= maxExtraBeds(h)) return toast('The staff rooms are full. Add staff quarters first.'); }
  else { if(h.up[k]) return; need = AMENITY_SIZE[k] ?? 1; const nd = UPGRADES[k] && UPGRADES[k].needs; if(nd && !h.up[nd]) return toast(`${UPGRADES[k].label} needs a ${UPGRADES[nd].label} first.`); }
  if(need && roomsUsed(h) + need > houseSize(h)) return toast(`${h.name} is out of space (${roomsUsed(h)}/${houseSize(h)} rooms used).`);
  if(S.gold < cost) return toast('Not enough gold.');
  S.gold -= cost; h.spent = (h.spent||0) + cost; h.wsDisc = 0; S.built = (S.built||0) + 1; S.builtBy = S.builtBy||{}; S.builtBy[k] = (S.builtBy[k]||0) + 1;
  if(k==='room'){ h.rooms++; note(`${h.name}: a new bedroom is ready. (${h.rooms} total)`); }
  else if(k==='quarters'){ h.quarters=(h.quarters||0)+1; note(`${h.name}: new staff quarters. Beds for ${bedsFor(h)}.`); }
  else if(k==='roomTier'){ h.tier++; note(`${h.name}: bedrooms refurbished to ${ROOM_NAMES[h.tier]}.`); }
  else if(k==='beds'){ h.beds=(h.beds||0)+1; note(`${h.name}: staff now sleep on ${BEDS[h.beds].label.toLowerCase()}.`); }
  else if(k==='extraBed'){ h.extraBeds=(h.extraBeds||0)+1; note(`${h.name}: another bed squeezed into the staff rooms. Beds for ${bedsFor(h)}.`); }
  else if(k==='annex'){ h.annex=true; note(`${h.name}: annex built (+3 rooms of space).`); }
  else if(k==='decor'){ h.decor=(h.decor||0)+1; note(`${h.name}: redecorated (${DECOR[h.decor].label}).`); }
  else if(k==='drinks'){ h.drinks=(h.drinks||0)+1; note(`${h.name}: the bar now serves ${DRINKS[h.drinks].label.toLowerCase()}.`); }
  else if(k==='incense'){ h.up[k]=true; h.incense='calm'; note(`${h.name}: ${UPGRADES[k].label} built.`); }
  else { h.up[k]=true; note(`${h.name}: ${UPGRADES[k].label} built.`); }
  save(); render();
  if(k==='bar' && !S.flags.hilde && !isHired('hilde')){ S.flags.hilde=true; EVQ.push(evHilde); runQueue(); }
}
// Demolish (balance.json → demolish): knocks down a built amenity, or the last bedroom / staff quarters above the house's starting count.
// Costs share x the item's base price (no inflation), lowers h.spent by that base price (improvement value for NG+), never refunds.
function demolishInfo(h, k){
  const D = HOUSES[h.id], share = BAL.demolish.share;
  let base = 0, why = '';
  if(k==='room'){ base = 250 + (h.rooms-1)*220; if(h.rooms <= D.rooms) why = 'These are the rooms the house started with.'; }
  else if(k==='quarters'){ base = 200 + ((h.quarters||0)-1)*160; if((h.quarters||0) <= D.quarters) why = 'These are the quarters the house started with.'; }
  else if(UPGRADES[k]){
    base = UPGRADES[k].cost; const jobOf = {bath:'bath', stage:'dancer', bar:'bartender', chapel:'chapel', classroom:'teacher'}[k];
    if(!h.up[k]) why = 'Not built.';
    else if((D.up||{})[k]) why = `${UPGRADES[k].label} came with the house.`;
    else if(k==='bar' && (h.drinks||0) > 0) why = `The Bar's drinks menu (${DRINKS[h.drinks].label}) is stocked above the standard house ale, so the Bar can't be torn out.`;
    else if(jobOf && S.workers.some(w=>w.house===h.id && w.job===jobOf)) why = `Someone still works as ${JOBS[jobOf].label} here. Move her to another job first.`;
  } else why = 'Unknown.';
  return {base, cost:Math.round(base*share), ok:!why, why};
}
function demolish(k){
  const h = curH(), I = demolishInfo(h, k);
  if(!I.ok) return toast(I.why);
  if(S.gold < I.cost) return toast('Not enough gold to pay the demolition crew.');
  const label = k==='room' ? 'a bedroom' : k==='quarters' ? 'a set of staff quarters' : `the ${UPGRADES[k].label}`;
  if(!confirm(`Demolish ${label} in ${h.name}? It costs ${fmt(I.cost)} and nothing is refunded.`)) return;
  S.gold -= I.cost; h.spent = Math.max(0, (h.spent||0) - I.base);
  if(k==='room') h.rooms--;
  else if(k==='quarters'){ h.quarters--; h.extraBeds = Math.min(h.extraBeds||0, maxExtraBeds(h)); }
  else delete h.up[k];
  note(`${h.name}: ${label} demolished (${fmt(I.cost)}).`);
  save(); render();
}
// A house gets pricier with every one you already own (balance.json → houses.priceStep).
const houseCost = id => Math.round(HOUSES[id].cost * (1 + BAL.houses.priceStep * Math.max(0, S.houses.length - 1)));
function setIncense(mode){ const h = curH(); if(!h.up.incense || !['calm','aphro'].includes(mode)) return; h.incense = mode; save(); render(); }
function buyHouse(id){
  const D = HOUSES[id]; if(!D || H(id) || !houseOffered(id)) return;
  if(D.premium && ((S.sam.lvl||1) < D.level || S.rep < D.renown)) return toast(`${D.name} won't sell to Sam yet. Needs Sam level ${D.level} and renown ${D.renown}.`);
  const cost = houseCost(id);
  if(S.gold < cost) return toast('Not enough gold.');
  if(!confirm(`Buy ${D.name} for ${fmt(cost)}?${S.houses.length>1 ? ` (base ${fmt(D.cost)}, +${Math.round(BAL.houses.priceStep*100)}% for each house you already own beyond the first)` : ''}`)) return;
  S.gold -= cost; S.houses.push(makeHouse(id)); S.cur = id;
  note(`You now own ${D.name}!`);
  if(!isHired(D.npc)){
    const n = makeNamed(D.npc); n.house = id; n.locked = id; n.contract = 999; n.job = safeJob(n, NAMED[D.npc].job); if(MENU_JOBS.includes(n.job)) n.menu = getActs().filter(a=>clientStance(n,a.id)==='yes').map(a=>a.id);
    S.workers.push(n); checkUnlocks(true);
    EVQ.push(()=>({title:`${D.name}`, who:n.id, scene:'portrait', text:`${n.name} is waiting at the door when Sam arrives with the deed.\n\n${n.backstory}\n\nShe comes with the place.`, choices:[{label:'Welcome aboard', fx(){ n.trust=clamp(n.trust+5); return ''; }}]}));
  }
  save(); render(); runQueue();
}
// Pay the whole remaining debt at once: same win flow as the last regular payment (checkEnd sets S.won).
function payOffDebt(){
  const r = S.debt.remaining; if(r<=0 || S.gold < r) return toast('Not enough gold to pay it off.');
  S.gold -= r; S.debt.remaining = 0; S.debt.carry = 0;
  note(`Paid off the debt in full (${fmt(r)}).`); save(); render(); checkEnd();
}
function payExtra(){
  const el = $('#payamt'); const amt = Math.floor(+((el&&el.value)||0));
  if(amt<=0) return toast('Enter an amount.');
  if(amt > S.gold) return toast('You don\'t have that much.');
  const a = Math.min(amt, S.debt.remaining);
  S.gold -= a; S.debt.remaining -= a; S.debt.carry = Math.max(0, S.debt.carry - a);
  note(`Paid ${fmt(a)} toward the debt.`); save(); render(); checkEnd();
}
