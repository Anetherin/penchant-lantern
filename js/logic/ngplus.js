'use strict';
/* =====================================================================
   NEW GAME+
   Unlocks once the debt is paid (docs/OVERHAUL.md §9). Sam keeps ONLY his home house (rooms, tier, upgrades, beds,
   story progress), his level and stats. Of the ladies only Devoted lovers come along: they draw wages again, their
   stats / tech / act skills reset (named: to their data values, generic: 50%), popularity goes to 0, and each picks one
   NG+ perk (traits.json ngPerk). Everyone else leaves (named ones return to their pools, fresh). Sam picks a new
   partner from those not carried over (ngplus partners are offered from cycle 2) and a perk of his own.
   New debt = home debt x debtShare (+perCycle) + improvementsValue x improveShare. Other houses are sold toward it;
   NG+ houses can be bought during the cycle (houseOffered). Tuning: data/balance.json → ngplus.
   ===================================================================== */
let NGS = null;
const isNGHouse = k => !!(HOUSES[k]||{}).ngplus;
const houseOffered = k => !isNGHouse(k) || (S && (S.cycle||1) >= 2);
// NG+ partners (characters.json ngplus) are only offered from cycle 2: not in the first new-game choice, not as walk-ins.
const partnerOffered = k => !(NAMED[k]||{}).ngplus || !!(S && (S.cycle||1) >= 2);
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
// What was spent on the home house's rooms, tiers, quarters, beds, annex and upgrades (tracked in h.spent by buyUpgrade).
const improvementsValue = h => Math.round((h && h.spent) || 0);
// Lovers (Devoted) are the only ladies who carry over.
const carriedLovers = () => S.workers.filter(w=>has(w,'Devoted'));
const NG_PERKS = () => Object.keys(TRAITS).filter(t=>TRAITS[t].ngPerk);
function ngNumbers(boon){
  const B = BAL.ngplus, og = homeHouse(), cyc = (S.cycle||1) + 1, impr = improvementsValue(H(og));
  let base = HOUSES[og].debt * B.debtShare * (1 + B.perCycle*Math.max(0, cyc-2)), extra = impr * B.improveShare;
  let debt = base + extra;
  if(boon==='grace') debt *= 0.85;
  debt = Math.round(debt);
  const sold = S.houses.filter(h=>h.id!==og), sale = Math.round(sold.reduce((a,h)=>a + HOUSES[h.id].cost*B.saleValue, 0));
  const funds = Math.max(0, S.gold) + sale;
  const toDebt = Math.min(Math.max(0, funds - B.purse), Math.round(debt/2));   // savings can cover up to half
  const purse = funds - toDebt + (boon==='purse' ? 2500 : 0);
  return {debt, base:Math.round(base), impr, extra:Math.round(extra), sold, sale, toDebt, purse, remaining: debt - toDebt, cycle: cyc};
}
function startNGPlus(){
  if(!S || !S.won) return toast('New Game+ unlocks once the debt is paid off.');
  NGS = {step:0, partner:null, boon:null, perks:{}};
  ngView();
}
function ngPick(k, v){ NGS[k] = v; ngView(); }
function ngPerkPick(wid, v){ if(v) NGS.perks[wid] = v; else delete NGS.perks[wid]; ngView(); }
const ngSteps = () => ['New partner', 'Sam\'s perk', ...(carriedLovers().length ? ['Lovers\' perks'] : []), 'Begin'];
function ngNav(d){ NGS.step = Math.max(0, Math.min(ngSteps().length-1, NGS.step + d)); ngView(); }
function ngView(){
  const st = NGS.step, og = homeHouse(), steps = ngSteps(), cur = steps[st], lovers = carriedLovers();
  const nav = `<div class="row muted">${steps.map((s,i)=>i===st?`<b class="pink">${i+1}. ${s}</b>`:`${i+1}. ${s}`).join(' → ')}</div>`;
  let body = '', ok = false;
  if(cur==='New partner'){
    const carried = new Set(lovers.map(w=>w.key).filter(Boolean)), free = PARTNERS.filter(k=>!carried.has(k));   // cycle 2+: NG+ partners included
    body = `<h2>A new partner</h2><p class="muted">Only Sam's lovers come with him, and they'll work for wages now. Pick someone new to start this chapter at his side. Partners marked ✦ come from Sam's old world and only arrive in New Game+.</p>
      <div class="grid">${free.map(k=>{ const n = NAMED[k]; return `<div class="pick ${NGS.partner===k?'sel':''}" onclick="ngPick('partner','${k}')">
        <b>${n.ngplus?'✦ ':''}${n.name}</b> <span class="muted">${RACES[n.race].label}${n.sub?' ('+n.sub+')':''} · ${esc(n.personality)}</span><div class="muted">Trust ${n.partnerTrust} · ${JOBS[n.job].label} · ${n.traits.join(', ')}</div>
        <div style="margin-top:4px">${esc(n.partnerStory)}</div></div>`; }).join('')}
        <div class="pick ${NGS.partner==='none'?'sel':''}" onclick="ngPick('partner','none')"><b>No one new</b><div class="muted">Sam starts this chapter with ${lovers.length?'his lovers':'no one at his side'}.</div></div></div>`;
    ok = !!NGS.partner;
  } else if(cur==='Sam\'s perk'){
    const taken = S.boons||[];
    body = `<h2>What did Sam learn last time?</h2><p class="muted">Perks stack across cycles; each can be taken once.</p>
      <div class="grid">${Object.entries(NG_BOONS).map(([k,b])=>{ const got = taken.includes(k); return `<div class="pick ${NGS.boon===k?'sel':''}" ${got?'style="opacity:.5"':`onclick="ngPick('boon','${k}')"`}><b>${b.label}</b>${got?' <span class="tag">taken</span>':''}<div class="muted">${b.desc}</div></div>`; }).join('')}</div>`;
    ok = !!NGS.boon || Object.keys(NG_BOONS).every(k=>taken.includes(k));
  } else if(cur==='Lovers\' perks'){
    body = `<h2>What stays with them</h2><p class="muted">Each lover carries one perk into the new chapter. A perk can be taken once per lady and stacks across cycles.</p>
      ${lovers.map(w=>{ const left = NG_PERKS().filter(t=>!(w.ngPerks||[]).includes(t)), cp = NGS.perks[w.id];
        return `<div class="card"><b>${esc(w.name)}</b> <span class="muted">${esc(w.personality)} · trust ${Math.round(w.trust)}${(w.ngPerks||[]).length?' · has: '+w.ngPerks.join(', '):''}</span>
          <div class="row"><select onchange="ngPerkPick('${w.id}',this.value)"><option value="">Choose a perk…</option>${left.map(t=>`<option value="${esc(t)}" ${cp===t?'selected':''}>${esc(t)}</option>`).join('')}</select></div>
          <div class="muted">${cp ? esc(TRAITS[cp].desc||'') : (left.length ? '' : 'She has every perk already.')}</div></div>`; }).join('')}`;
    ok = lovers.every(w=>NGS.perks[w.id] || !NG_PERKS().some(t=>!(w.ngPerks||[]).includes(t)));
  } else {
    const N = ngNumbers(NGS.boon), HDo = HOUSES[og];
    const leaving = S.workers.filter(w=>!lovers.includes(w));
    body = `<h2>Ready for round ${N.cycle}?</h2><div class="card">
      <b>Keeps:</b> ${esc(HDo.name)} with its rooms, upgrades and story, Sam's level, stats and Appraisal, the regulars there, your gold (see purse) and your image library.<br>
      <b>Lovers who stay:</b> ${lovers.length ? lovers.map(w=>`${esc(w.name)}${NGS.perks[w.id]?` (${esc(NGS.perks[w.id])})`:''}`).join(', ') + '. They draw wages again; their skills and popularity start over, but what they feel for Sam stays.' : 'none. Only Devoted lovers come along.'}<br>
      <b>Leaving:</b> ${leaving.length ? `${leaving.length} ladies (${leaving.slice(0,8).map(w=>esc(w.name)).join(', ')}${leaving.length>8?', …':''}). Named ones can be met again, fresh.` : 'no one.'}<br>
      <b>New:</b> ${NGS.partner&&NGS.partner!=='none'?`${esc(NAMED[NGS.partner].name)} at Sam's side`:'no new partner'}${NGS.boon?`. Perk: <b>${NG_BOONS[NGS.boon].label}</b>`:''}. ✦ houses (and more) can be bought during the cycle.<br>
      ${N.sold.length?`<b>Sold to the Credit House:</b> ${N.sold.map(h=>esc(h.name)).join(', ')} (${fmt(N.sale)}).<br>`:''}
      <b>Debt:</b> ${fmt(N.debt)} (${esc(HDo.name)} ${fmt(N.base)} + your improvements ${fmt(N.impr)} × ${BAL.ngplus.improveShare} = ${fmt(N.extra)})${N.toDebt?`, minus ${fmt(N.toDebt)} paid from savings now = <b>${fmt(N.remaining)}</b>`:''}, due over 52 weeks.<br>
      <b>Purse:</b> ${fmt(N.purse)}</div>`;
    ok = true;
  }
  modal(`${nav}${body}<div class="row" style="margin-top:12px">${st>0?'<button onclick="ngNav(-1)">← Back</button>':'<button onclick="NGS=null;closeModal()">Not yet</button>'}${st<steps.length-1?`<button class="primary" onclick="ngNav(1)" ${ok?'':'disabled'}>Next →</button>`:`<button class="primary" onclick="ngBegin()">Begin New Game+</button>`}</div>`, {lock:true, wide:true});
}
// A carried lady starts over: stats, tech and act skills back to her starting values (named: from her data, same
// conversion as makeNamed; generic: half of what she has), popularity 0. Trust, Devoted, intim, firsts, arc and bonds stay.
function ngReset(w){
  if(w.key && NAMED[w.key]){
    const f = makeNamed(w.key);
    STAT_KEYS.forEach(k=>{ w.stats[k] = f.stats[k]; }); TECH_KEYS.forEach(k=>{ w.tech[k] = f.tech[k]; });
    Object.keys(w.acts||{}).forEach(id=>{ if(f.acts[id]) w.acts[id].skill = f.acts[id].skill; });
  } else {
    STAT_KEYS.forEach(k=>{ w.stats[k] = clampK(Math.round(w.stats[k]*0.5)); }); TECH_KEYS.forEach(k=>{ w.tech[k] = clampK(Math.round((w.tech[k]||0)*0.5)); });
    Object.values(w.acts||{}).forEach(a=>{ a.skill = clampK(Math.round(a.skill*0.5)); });
  }
  w.popularity = 0; w.arcWk = 0; w.earnedLast = 0; w.energy = maxEnergy(w);
}
function ngBegin(){
  const C = NGS; if(!C || !C.boon && !Object.keys(NG_BOONS).every(k=>(S.boons||[]).includes(k))) return;
  const B = BAL.ngplus, og = homeHouse(), HDo = HOUSES[og], N = ngNumbers(C.boon), lovers = carriedLovers();
  if(lovers.some(w=>!C.perks[w.id] && NG_PERKS().some(t=>!(w.ngPerks||[]).includes(t)))) return;
  S.home = og; S.cycle = N.cycle;   // set first: generics rolled from here on can get ngOnly traits
  // lovers: wages again, perk, reset
  lovers.forEach(w=>{
    const p = C.perks[w.id]; if(p){ w.ngPerks = [...(w.ngPerks||[]), p]; }
    w.isPartner = false; w.free = false; w.contract = 12; w.house = og; if(w.locked && w.locked!==og) w.locked = null;
    ngReset(w);
    w.wage = wageFor(w);
  });
  // everyone else leaves; named ladies go back to their pools, fresh (isHired is false for them again)
  const ids = new Set(lovers.map(w=>w.id));
  S.workers = lovers; S.candidates = [];
  S.bonds = Object.fromEntries(Object.entries(S.bonds||{}).filter(([k])=>k.split('|').every(id=>ids.has(id))));
  S.regulars = (S.regulars||[]).filter(r=>r.house===og);
  S.houses = S.houses.filter(h=>h.id===og);
  S.workers.forEach(w=>{ w.house = og; });
  // the home house's resident comes with the house: if she isn't a carried lover she's back, fresh
  if(!isHired(HDo.npc)){ const npc = makeNamed(HDo.npc); npc.house = og; npc.locked = og; npc.contract = 999; assignStart(npc, NAMED[HDo.npc].job); S.workers.push(npc); }
  S.cur = og;
  if(C.partner && C.partner!=='none'){
    const p = makeNamed(C.partner, true); p.house = og;
    if(C.boon==='devotion'){ p.trust = clamp(p.trust+15); p.lewd = clamp(p.lewd+10); }
    S.workers.push(p); assignStart(p, ['courtesan','bartender','dancer','bath'].includes(NAMED[C.partner].job) ? NAMED[C.partner].job : 'courtesan');
    S.partner = C.partner;
  }
  S.partners = Array.from(new Set([...(S.partners||[]).filter(k=>S.workers.some(w=>w.key===k)), ...(C.partner && C.partner!=='none' ? [C.partner] : [])]));
  const h0 = H(og); if(C.boon==='renown') h0.rep = clamp(h0.rep + 10);
  // Sam, money, debt
  if(B.samKeep < 1) ['charm','business','strength','technique'].forEach(k=>S.sam[k] = Math.round(S.sam[k]*B.samKeep));
  S.boons = S.boons || []; if(C.boon && !S.boons.includes(C.boon)) S.boons.push(C.boon);
  if(C.boon==='renown') S.rep = clamp(S.rep + 15);
  S.gold = N.purse;
  S.debt = {total:N.remaining, remaining:N.remaining, carry:0, strikes:0, start:S.week-1};
  S.won = false; S.over = false; S.lastReport = null; EVQ = [];
  S.flags.partnerCD = 3; S.ap = apMax();
  refreshCandidates(C.boon==='recruit' ? 3 : 0, C.boon==='recruit' ? 1.15 : 1);
  checkUnlocks(true);
  addLog(`New Game+ (cycle ${S.cycle}): Sam keeps ${HDo.name} and takes on a new debt of ${fmt(N.debt)}.`);
  NGS = null; save(); TAB = 'house'; render();
  modal(`<h2>${esc(HDo.name)}</h2><p class="story">Marguerite Vane slides a fresh contract across the desk. "Paying off one house was impressive, Mr. Takahashi. Let's see you do it again, with a little less sentiment." She almost smiles again. It's starting to worry him.\n\nSam keeps ${esc(HDo.name)}${lovers.length?` and ${lovers.map(w=>esc(w.name)).join(', ')}`:''}. Everyone else has gone their own way. The new debt is ${fmt(N.remaining)}, due over the next 52 weeks.</p><div class="row"><button class="primary" onclick="closeModal()">Let's go</button></div>`);
}
