'use strict';
/* =====================================================================
   NEW GAME+
   Unlocks once the debt is paid. Sam keeps his original house (with its staff, upgrades
   and story progress), his partner and lovers, his level and stats. He picks a new house
   (NG+ only houses included), a new partner and a perk; the new debt combines both houses.
   Other houses he bought are sold toward the new debt. Tuning: data/balance.json → ngplus.
   ===================================================================== */
let NGS = null;
const isNGHouse = k => !!(HOUSES[k]||{}).ngplus;
const houseOffered = k => !isNGHouse(k) || (S && (S.cycle||1) >= 2);
const hasBoon = k => !!(S && S.boons && S.boons.includes(k));
const cycleTag = () => S && (S.cycle||1) > 1 ? `NG+${S.cycle>2 ? S.cycle-1 : ''}` : '';
const homeHouse = () => S.home || S.houses[0].id;
const NG_BOONS = {
  purse:   {label:'Deep Pockets', desc:'Start with 2,500g extra in hand.'},
  ap:      {label:'Seasoned Owner', desc:'+1 action every week, for good.'},
  renown:  {label:'A Name in Hollowmere', desc:'+15 renown, and the new house opens with +10 reputation.'},
  recruit: {label:'Friends at the Guild', desc:'3 extra candidates now; signing bonuses are 25% cheaper from now on.'},
  grace:   {label:'Lenient Lender', desc:'The new debt is 15% smaller.'},
  devotion:{label:'Old Flame', desc:'Your new partner starts with +15 trust and +10 lewdness.'}
};
function ngNumbers(houseKey, boon){
  const B = BAL.ngplus, og = homeHouse(), cyc = (S.cycle||1) + 1;
  let debt = (HOUSES[og].debt + HOUSES[houseKey].debt) * B.debtShare * (1 + B.perCycle*Math.max(0, cyc-2));
  if(boon==='grace') debt *= 0.85;
  debt = Math.round(debt);
  const sold = S.houses.filter(h=>h.id!==og), sale = Math.round(sold.reduce((a,h)=>a + HOUSES[h.id].cost*B.saleValue, 0));
  const funds = Math.max(0, S.gold) + sale;
  const toDebt = Math.min(Math.max(0, funds - B.purse), Math.round(debt/2));   // savings can cover up to half
  const purse = funds - toDebt + (boon==='purse' ? 2500 : 0);
  return {debt, sold, sale, toDebt, purse, remaining: debt - toDebt, cycle: cyc};
}
function startNGPlus(){
  if(!S || !S.won) return toast('New Game+ unlocks once the debt is paid off.');
  NGS = {step:0, house:null, partner:null, boon:null};
  ngView();
}
function ngPick(k, v){ NGS[k] = v; ngView(); }
function ngNav(d){ NGS.step = Math.max(0, Math.min(3, NGS.step + d)); ngView(); }
function ngView(){
  const st = NGS.step, og = homeHouse(), steps = ['New house','New partner','Perk','Begin'];
  const nav = `<div class="row muted">${steps.map((s,i)=>i===st?`<b class="pink">${i+1}. ${s}</b>`:`${i+1}. ${s}`).join(' → ')}</div>`;
  let body = '', ok = false;
  if(st===0){
    const offers = Object.keys(HOUSES).filter(k=>k!==og);
    body = `<h2>A new deed</h2><p class="muted">You keep ${esc(HOUSES[og].name)}. Pick a second house to start again with. Houses marked ✦ only appear in New Game+.</p>
      <div class="grid">${offers.map(k=>{ const D = HOUSES[k], n = NAMED[D.npc], N = ngNumbers(k, NGS.boon); return `<div class="pick ${NGS.house===k?'sel':''}" onclick="ngPick('house','${k}')">
        <b>${D.ngplus?'✦ ':''}${D.name}</b> <span class="tag house">${D.loc}</span>${H(k)?' <span class="tag">you own it</span>':''}<div class="muted">${D.desc}</div>
        <div style="margin-top:4px">Combined debt <b>${fmt(N.debt)}</b> · Rooms ${D.rooms} (${ROOM_NAMES[D.tier]}) ${Object.keys(D.up).map(u=>`<span class="tag">${UPGRADES[u].label}</span>`).join('')}</div>
        <div class="row" style="margin-top:6px"><div><b>${n.name}</b> · ${JOBS[n.job].label}<div class="muted">${esc(n.personality)}</div></div></div></div>`; }).join('')}</div>`;
    ok = !!NGS.house;
  } else if(st===1){
    const free = PARTNERS.filter(k=>!isHired(k));
    body = `<h2>A new partner</h2><p class="muted">Your current partner and lovers stay with you, with everything they've built with Sam. Pick someone new to start this chapter with.</p>
      <div class="grid">${free.map(k=>{ const n = NAMED[k]; return `<div class="pick ${NGS.partner===k?'sel':''}" onclick="ngPick('partner','${k}')">
        <b>${n.name}</b> <span class="muted">${RACES[n.race].label}${n.sub?' ('+n.sub+')':''} · ${esc(n.personality)}</span><div class="muted">Trust ${n.partnerTrust} · ${JOBS[n.job].label} · ${n.traits.join(', ')}</div>
        <div style="margin-top:4px">${esc(n.partnerStory)}</div></div>`; }).join('')}
        <div class="pick ${NGS.partner==='none'?'sel':''}" onclick="ngPick('partner','none')"><b>No one new</b><div class="muted">${free.length?'Sam starts this chapter with the people he already has.':'Everyone is already with you.'}</div></div></div>`;
    ok = !!NGS.partner;
  } else if(st===2){
    const taken = S.boons||[];
    body = `<h2>What did Sam learn last time?</h2><p class="muted">Perks stack across cycles; each can be taken once.</p>
      <div class="grid">${Object.entries(NG_BOONS).map(([k,b])=>{ const got = taken.includes(k); return `<div class="pick ${NGS.boon===k?'sel':''}" ${got?'style="opacity:.5"':`onclick="ngPick('boon','${k}')"`}><b>${b.label}</b>${got?' <span class="tag">taken</span>':''}<div class="muted">${b.desc}</div></div>`; }).join('')}</div>`;
    ok = !!NGS.boon || Object.keys(NG_BOONS).every(k=>taken.includes(k));
  } else {
    const N = ngNumbers(NGS.house, NGS.boon), D = HOUSES[NGS.house];
    const leaving = S.workers.filter(w=>N.sold.some(h=>h.id===w.house) && !w.isPartner && !has(w,'Devoted'));
    body = `<h2>Ready for round ${N.cycle}?</h2><div class="card">
      <b>Keeps:</b> ${esc(HOUSES[homeHouse()].name)} with everyone working there, every partner and lover, Sam's level, stats and Appraisal, your regulars there, and your image library.<br>
      <b>New:</b> ${esc(D.name)} and ${esc(NAMED[D.npc].name)}${NGS.partner&&NGS.partner!=='none'?`, with ${esc(NAMED[NGS.partner].name)} at Sam's side`:''}${NGS.boon?`. Perk: <b>${NG_BOONS[NGS.boon].label}</b>`:''}.<br>
      ${N.sold.length?`<b>Sold to the Credit House:</b> ${N.sold.map(h=>esc(h.name)).join(', ')} (${fmt(N.sale)})${leaving.length?`. Leaving with them: ${leaving.map(w=>esc(w.name)).join(', ')}`:''}.<br>`:''}
      <b>Debt:</b> ${fmt(N.debt)}${N.toDebt?`, minus ${fmt(N.toDebt)} paid from savings now = <b>${fmt(N.remaining)}</b>`:''}, due over 52 weeks.<br>
      <b>Purse:</b> ${fmt(N.purse)}</div>`;
    ok = true;
  }
  modal(`${nav}${body}<div class="row" style="margin-top:12px">${st>0?'<button onclick="ngNav(-1)">← Back</button>':'<button onclick="NGS=null;closeModal()">Not yet</button>'}${st<3?`<button class="primary" onclick="ngNav(1)" ${ok?'':'disabled'}>Next →</button>`:`<button class="primary" onclick="ngBegin()">Begin New Game+</button>`}</div>`, {lock:true, wide:true});
}
function ngBegin(){
  const C = NGS; if(!C || !C.house) return;
  const B = BAL.ngplus, og = homeHouse(), N = ngNumbers(C.house, C.boon);
  S.home = og;
  // sell the other houses; their staff leave unless they're Sam's
  const soldIds = new Set(N.sold.map(h=>h.id));
  const leaving = S.workers.filter(w=>soldIds.has(w.house) && !w.isPartner && !has(w,'Devoted'));
  S.workers = S.workers.filter(w=>!leaving.includes(w));
  S.workers.forEach(w=>{ if(soldIds.has(w.house)) w.house = og; if(w.locked && soldIds.has(w.locked)) w.locked = og; w.arcWk = 0; });
  S.regulars = (S.regulars||[]).filter(r=>!soldIds.has(r.house));
  S.houses = S.houses.filter(h=>h.id===og);
  // the new house
  const nh = makeHouse(C.house); nh.since = S.week; if(C.boon==='renown') nh.rep = clamp(nh.rep + 10);
  S.houses.push(nh); S.cur = C.house;
  const HD = HOUSES[C.house];
  if(!isHired(HD.npc)){ const npc = makeNamed(HD.npc); npc.house = C.house; npc.locked = C.house; npc.contract = 999; npc.trust = clamp(npc.trust+10); S.workers.push(npc); assignStart(npc, NAMED[HD.npc].job); }
  if(C.partner && C.partner!=='none'){
    const p = makeNamed(C.partner, true); p.house = C.house;
    if(C.boon==='devotion'){ p.trust = clamp(p.trust+15); p.lewd = clamp(p.lewd+10); }
    S.workers.push(p); assignStart(p, NAMED[C.partner].job==='courtesan' ? 'courtesan' : ['bartender','dancer','bath'].includes(NAMED[C.partner].job) ? NAMED[C.partner].job : 'companion');
    S.partners = Array.from(new Set([...(S.partners||[S.partner]), C.partner])); S.partner = C.partner;
  }
  // Sam, money, debt
  if(B.samKeep < 1) ['charm','business','strength','technique'].forEach(k=>S.sam[k] = Math.round(S.sam[k]*B.samKeep));
  S.boons = S.boons || []; if(C.boon && !S.boons.includes(C.boon)) S.boons.push(C.boon);
  if(C.boon==='renown') S.rep = clamp(S.rep + 15);
  if(C.boon==='recruit') addCandidates(3, 1.15);
  S.gold = N.purse;
  S.debt = {total:N.remaining, remaining:N.remaining, carry:0, strikes:0, start:S.week-1};
  S.cycle = N.cycle; S.won = false; S.over = false; S.lastReport = null; EVQ = [];
  S.flags.partnerCD = 3; S.ap = apMax();
  addLog(`New Game+ (cycle ${S.cycle}): Sam takes on ${HD.name} and a new debt of ${fmt(N.debt)}.`);
  NGS = null; save(); TAB = 'house'; render();
  modal(`<h2>${esc(HD.name)}</h2><p class="story">Marguerite Vane slides a fresh contract across the desk. "Paying off one house was impressive, Mr. Takahashi. Let's see you carry two." She almost smiles again. It's starting to worry him.\n\nSam owns ${esc(HOUSES[og].name)} and ${esc(HD.name)}. The new debt is ${fmt(N.remaining)}, due over the next 52 weeks.</p><div class="row"><button class="primary" onclick="closeModal()">Let's go</button></div>`);
}
