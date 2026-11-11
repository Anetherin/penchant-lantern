'use strict';
/* =====================================================================
   NEW GAME+
   Unlocks once the debt is paid (docs/OVERHAUL.md §9). Sam always keeps his home house; the starter house of each cycle and any house whose
   story is finished stay too unless he lets them go on the "Houses" step (NGS.keep) (rooms, tier, upgrades, beds, story progress) and his level; his stats and Appraisal are rebuilt (balance.json → ngplus.samReset). No gold carries over (purse = new-game gold). Of the ladies only Devoted lovers come along: they draw wages again, their
   stats / tech / act skills reset (named: to their data values, generic: 50%), popularity goes to 0, and each picks one
   NG+ perk (traits.json ngPerk). Non-lover guests and generic ladies at maxed trust become "old friends" (ngFriends): they get a Reincarnated
   stack but no perk, wait in S.alumni and turn up among the candidates as EXTRA entries (inviteFriend in state.js; balance.json → ngplus.friends).
   Everyone else leaves (named ones return to their pools, fresh). Sam picks a new
   partner from those not carried over (ngplus partners are offered from cycle 2) and a perk of his own.
   New debt = home debt x debtShare (+perCycle) + improvementsValue (all kept houses) x improveShare. Other houses are sold toward it;
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
// Houses that stay with Sam in New Game+: his home, the starter house of every cycle (S.starters), and any house whose story is finished.
const houseStoryDone = h => !!(h && STORIES[h.id] && h.story && h.story.beat >= STORIES[h.id].beats.length);
// The home house always stays; every other qualifying house (starter or story done) is an optional carry, chosen on the "Houses" step (NGS.keep, default true).
const keepable = h => (S.starters||[]).includes(h.id) || houseStoryDone(h);
const optionalHouses = () => S.houses.filter(h=>h.id!==homeHouse() && keepable(h));
const keptHouse = h => h.id===homeHouse() || (keepable(h) && !(NGS && NGS.keep && NGS.keep[h.id]===false));
const keptWhy = h => h.id===homeHouse() ? 'home' : (S.starters||[]).includes(h.id) ? 'starter' : 'story complete';
const NG_BOONS = {
  purse:   {label:'Deep Pockets', desc:'Start with 2,500g extra in hand.'},
  ap:      {label:'Seasoned Owner', desc:'+1 action every week, for good.'},
  renown:  {label:'A Name in Hollowmere', desc:'+15 renown, and the new house opens with +10 reputation.'},
  recruit: {label:'Friends at the Guild', desc:'3 extra candidates now; signing bonuses are 25% cheaper from now on.'},
  grace:   {label:'Lenient Lender', desc:'The new debt is 15% smaller.'},
  devotion:{label:'Fated Meeting', desc:'Your new partner starts with +15 trust and +10 lewdness.'},
  loyal:   {label:'Old Loyalties', desc:'Ladies who come back from a past life ask only half the usual raise for each life.'},
  memory:  {label:'Vivid Memories', desc:'Ladies who carry over keep 15% more of the skills and stats they built (still at most 65%).'},
  clone:   {label:'Shadow Clone', desc:'Sam learned to be in two places at once. Ladies from every house can find him at night, not just the house he sleeps in.'}
};
// What was spent on the home house's rooms, tiers, quarters, beds, annex and upgrades (tracked in h.spent by buyUpgrade).
const improvementsValue = h => Math.round((h && h.spent) || 0);
// Lovers (Devoted) are the only ladies who carry over.
const carriedLovers = () => S.workers.filter(w=>has(w,'Devoted'));
// Old friends: non-lover guests (role 'drifter') and generic ladies at max trust. They come back as extra candidates (S.alumni), reborn but without a perk.
function ngFriends(){
  const F = BAL.ngplus.friends || {}, L = carriedLovers();
  return S.workers.filter(w=>!L.includes(w) && !w.isPartner && w.trust >= (F.trust ?? 100) && ((!w.key && F.generics) || (isGuest(w) && F.guests)));
}
const NG_PERKS = () => Object.keys(TRAITS).filter(t=>TRAITS[t].ngPerk);
// House residents (HOUSES[id].npc) working for Sam whose house he keeps: they come back with it, reincarnated (no perk). Lovers are carried as lovers instead.
// keep(h): which houses count (the NG+ save keeps every keepable house; the wizard asks keptHouse).
const residentHouse = (w, keep) => w.key ? S.houses.find(h=>keep(h) && (HOUSES[h.id]||{}).npc===w.key) : null;
const ngResidents = (keep = keptHouse) => S.workers.filter(w=>!has(w,'Devoted') && residentHouse(w, keep));
function ngNumbers(boon, house){
  if(house===undefined && NGS) house = NGS.house;
  const B = BAL.ngplus, og = homeHouse(), cyc = (S.cycle||1) + 1, impr = S.houses.filter(keptHouse).reduce((a,h)=>a + improvementsValue(h), 0);
  let base = HOUSES[og].debt * B.debtShare * (1 + B.perCycle*Math.max(0, cyc-2)), extra = impr * B.improveShare;
  const nh = house && HOUSES[house] ? HOUSES[house].debt * (B.newHouseShare ?? 1) * (1 + B.perCycle*Math.max(0, cyc-2)) : 0;
  let debt = base + extra + nh;
  if(boon==='grace') debt *= 0.85;
  debt = Math.round(debt);
  const sold = S.houses.filter(h=>!keptHouse(h)), sale = Math.round(sold.reduce((a,h)=>a + HOUSES[h.id].cost*B.saleValue, 0));   // surrendered houses reduce the debt; no gold changes hands
  const purse = B.purse + (boon==='purse' ? 2500 : 0);   // savings stay behind
  return {gross:debt, debt:Math.max(0, debt - sale), house:Math.round(nh), base:Math.round(base), impr, extra:Math.round(extra), sold, sale, purse, cycle: cyc};
}
// NG+ save: a trimmed copy of a won game holding only what New Game+ can carry (Devoted lovers, old friends, alumni, the
// bonds between them, houses (kept ones carry, the rest count for the sale credit), Sam, pasts, boons, samUps, wardrobe).
// Nothing is chosen yet: loading it opens the NG+ wizard (S.ngSeed), so one file can start the next cycle again and again.
function ngSeed(){
  if(!S || !S.won) return null;
  const kh = new Set([homeHouse(), ...S.houses.filter(keepable).map(h=>h.id)]);
  const s = clone(S), keep = new Set([...carriedLovers(), ...ngFriends(), ...ngResidents(h=>kh.has(h.id))].map(w=>w.id));
  s.workers = s.workers.filter(w=>keep.has(w.id));
  const ids = new Set([...keep, ...(s.alumni||[]).map(w=>w.id)]);
  s.bonds = Object.fromEntries(Object.entries(s.bonds||{}).filter(([k])=>k.split('|').every(id=>ids.has(id))));
  s.regulars = (s.regulars||[]).filter(r=>kh.has(r.house));
  if(s.sleepIn && !keep.has(s.sleepIn)) s.sleepIn = null;
  s.candidates = []; s.lastReport = null; s.samWeek = {security:0, books:false, income:0, acts:[]};
  s.log = [{wk:s.week, t:`New Game+ save: cycle ${s.cycle||1} cleared.`}];
  s.ngSeed = true;
  return s;
}
function startNGPlus(){
  if(!S || !S.won) return toast('New Game+ unlocks once the debt is paid off.');
  NGS = {step:0, partner:null, keep:Object.fromEntries(optionalHouses().map(h=>[h.id,true])), boon:null, perks:{}, romance:{}, house:null, past:null,
    offers: shuffle(Object.keys(HOUSES).filter(k=>!H(k) && !HOUSES[k].premium && (!isNGHouse(k) || (S.cycle||1)+1 >= 2))).slice(0, BAL.ngplus.houseOffers||4)};
  ngView();
}
function ngKeep(id){ if(!NGS || !NGS.keep || !optionalHouses().some(h=>h.id===id)) return; NGS.keep[id] = NGS.keep[id]===false; ngView(); }
function ngPick(k, v){ NGS[k] = v; ngView(); }
function ngPerkPick(wid, v){ if(v) NGS.perks[wid] = v; else delete NGS.perks[wid]; ngView(); }
// per lover: 'keep' (default) = still his lover (Devoted, her story and firsts kept), 'reset' = the romance starts over (ngRomanceReset). Trust resets either way.
const ngRomance = (C, w) => ((C && C.romance) || {})[w.id] === 'reset' ? 'reset' : 'keep';
function ngRomancePick(wid, v){ (NGS.romance = NGS.romance || {})[wid] = v === 'reset' ? 'reset' : 'keep'; ngView(); }
const pastsLeft = () => Object.keys(PASTS).filter(k=>!hasPast(k));
const ngSteps = () => ['New partner', ...(optionalHouses().length ? ['Houses'] : []), ...(NGS && NGS.offers.length ? ['New house'] : []), 'Sam\'s perk', ...(pastsLeft().length ? ['Another past life'] : []), ...(carriedLovers().length ? ['Lovers\' perks'] : []), 'Begin'];
function ngNav(d){ NGS.step = Math.max(0, Math.min(ngSteps().length-1, NGS.step + d)); ngView(); }
function ngView(){
  const st = NGS.step, og = homeHouse(), steps = ngSteps(), cur = steps[st], lovers = carriedLovers();
  const nav = `<div class="row muted">${steps.map((s,i)=>i===st?`<b class="pink">${i+1}. ${s}</b>`:`${i+1}. ${s}`).join(' → ')}</div>`;
  let body = '', ok = false;
  if(cur==='New partner'){
    const carried = new Set(lovers.map(w=>w.key).filter(Boolean)), free = PARTNERS.filter(k=>!carried.has(k));   // cycle 2+: NG+ partners included
    body = `<h2>A new partner</h2><p class="muted">Sam's lovers come with him, and they'll work for wages now (guests and ladies who trust him completely may look him up again later). Pick someone new to start this chapter at his side. Partners marked ✦ come from Sam's old world and only arrive in New Game+.</p>
      <div class="grid">${free.map(k=>{ const n = NAMED[k]; return `<div class="pick ${NGS.partner===k?'sel':''}" onclick="ngPick('partner','${k}')">
        <b>${n.ngplus?'✦ ':''}${esc(titled(n))}</b> <span class="muted">${RACES[n.race].label}${n.sub?' ('+n.sub+')':''} · ${esc(n.personality)}</span><div class="muted">Trust ${tShow(n.partnerTrust)} · ${JOBS[n.job].label} · ${n.traits.join(', ')}</div>
        <div style="margin-top:4px">${esc(n.partnerStory)}</div></div>`; }).join('')}
        <div class="pick ${NGS.partner==='none'?'sel':''}" onclick="ngPick('partner','none')"><b>No one new</b><div class="muted">Sam starts this chapter with ${lovers.length?'his lovers':'no one at his side'}.</div></div></div>`;
    ok = !!NGS.partner;
  } else if(cur==='Houses'){
    const B = BAL.ngplus;
    body = `<h2>Which houses stay?</h2><p class="muted">${esc(HOUSES[og].name)} is Sam's home and always stays. These others can come along or be surrendered to the Credit House. Kept houses keep their rooms, upgrades, story and resident; what Sam spent on their improvements adds ${Math.round(B.improveShare*100)}% of its value to the new debt. Tap a house to switch.</p>
      <div class="grid">${optionalHouses().map(h=>{ const on = NGS.keep[h.id]!==false, v = improvementsValue(h); return `<div class="pick ${on?'sel':''}" onclick="ngKeep('${h.id}')">
        <b>${esc(h.name)}</b> <span class="tag ${on?'house':''}">${on?'Keep':'Surrender'}</span> <span class="muted">${keptWhy(h)}</span>
        <div class="muted">Improvements ${fmt(v)} · adds ${fmt(Math.round(v*B.improveShare))} to the new debt</div>
        <div style="margin-top:4px">${on?'Keeps its rooms, upgrades, story and resident.':'Handed back to the Credit House; its resident and regulars go too.'}</div></div>`; }).join('')}</div>`;
    ok = true;
  } else if(cur==='New house'){
    body = `<h2>A new deed</h2><p class="muted">The Credit House is happy to finance a second property. Sam keeps his home house, his starter houses and any house whose story is finished, and takes on one more; its full listed debt${(S.cycle||1)+1>2?` (plus ${Math.round(BAL.ngplus.perCycle*((S.cycle||1)-1)*100)}% for each cycle past the first)`:''} joins the new loan, and its resident comes with it. ✦ houses only appear in New Game+.</p>
      <div class="grid">${NGS.offers.map(k=>{ const D = HOUSES[k], n = NAMED[D.npc]; return `<div class="pick ${NGS.house===k?'sel':''}" onclick="ngPick('house','${k}')">
        <b>${D.ngplus?'✦ ':''}${D.name}</b> <span class="tag house">${D.loc}</span><div class="muted">${D.desc}</div>
        <div style="margin-top:4px">Adds ${fmt(ngNumbers(null, k).house)} debt · Rooms ${D.rooms} · ${n?esc(n.name)+' comes with it':''}</div></div>`; }).join('')}</div>`;
    ok = !!NGS.house;
  } else if(cur==='Another past life'){
    body = `<h2>Another life remembered</h2><p class="muted">Something from a life before the last one surfaces. Sam can add one more past life (its bonuses stack with what he already has), or keep things as they are.</p>
      <div class="grid">${pastsLeft().map(k=>{ const p = PASTS[k]; return `<div class="pick ${NGS.past===k?'sel':''}" onclick="ngPick('past','${k}')"><b>${p.label}</b><div class="muted">${p.desc}</div></div>`; }).join('')}
        <div class="pick ${NGS.past==='none'?'sel':''}" onclick="ngPick('past','none')"><b>Nothing new</b><div class="muted">Sam stays who he is.</div></div></div>
      <p class="muted">Already: ${samPasts().map(k=>PASTS[k]?PASTS[k].label:k).join(', ')}</p>`;
    ok = !!NGS.past;
  } else if(cur==='Sam\'s perk'){
    const taken = S.boons||[];
    body = `<h2>What did Sam learn last time?</h2><p class="muted">Perks stack across cycles; each can be taken once.</p>
      <div class="grid">${Object.entries(NG_BOONS).map(([k,b])=>{ const got = taken.includes(k); return `<div class="pick ${NGS.boon===k?'sel':''}" ${got?'style="opacity:.5"':`onclick="ngPick('boon','${k}')"`}><b>${b.label}</b>${got?' <span class="tag">taken</span>':''}<div class="muted">${b.desc}</div></div>`; }).join('')}</div>`;
    ok = !!NGS.boon || Object.keys(NG_BOONS).every(k=>taken.includes(k));
  } else if(cur==='Lovers\' perks'){
    body = `<h2>What stays with them</h2><p class="muted">Each lover carries one perk into the new chapter. A perk can be taken once per lady and stacks across cycles. Her trust starts over either way; choose whether she stays Sam's lover (her story and firsts with him kept) or their romance begins again from the first chapter.</p>
      ${lovers.map(w=>{ const left = NG_PERKS().filter(t=>!(w.ngPerks||[]).includes(t)), cp = NGS.perks[w.id];
        return `<div class="card"><b>${esc(w.name)}</b> <span class="muted">${esc(w.personality)} · trust ${tShow(w.trust)}${(w.ngPerks||[]).length?' · has: '+w.ngPerks.join(', '):''}</span>
          <div class="row"><select onchange="ngRomancePick('${w.id}',this.value)"><option value="keep" ${ngRomance(NGS,w)==='keep'?'selected':''}>♥ Stay lovers</option><option value="reset" ${ngRomance(NGS,w)==='reset'?'selected':''}>↺ Start the romance over</option></select>
            <select onchange="ngPerkPick('${w.id}',this.value)"><option value="">Choose a perk…</option>${left.map(t=>`<option value="${esc(t)}" ${cp===t?'selected':''}>${esc(t)}</option>`).join('')}</select></div>
          <div class="muted">${cp ? esc(TRAITS[cp].desc||'') : (left.length ? '' : 'She has every perk already.')}</div></div>`; }).join('')}`;
    ok = lovers.every(w=>NGS.perks[w.id] || !NG_PERKS().some(t=>!(w.ngPerks||[]).includes(t)));
  } else {
    const N = ngNumbers(NGS.boon), HDo = HOUSES[og];
    const friends = ngFriends(), residents = ngResidents(), leaving = S.workers.filter(w=>!lovers.includes(w) && !friends.includes(w) && !residents.includes(w));
    body = `<h2>Ready for round ${N.cycle}?</h2><div class="card">
      <b>Keeps:</b> ${S.houses.filter(keptHouse).map(h=>`${esc(h.name)} (${keptWhy(h)})`).join(', ')}, each with its rooms, upgrades and story (its reputation starts over, keeping ${Math.round((BAL.ngplus.carry||0)*100)}% of what it had gained), Sam's level${BAL.ngplus.samReset.stats||BAL.ngplus.samReset.appraisal?'':', stats and Appraisal'}, the regulars there and your image library. Your savings stay behind.<br>
      ${BAL.ngplus.samReset.stats||BAL.ngplus.samReset.appraisal?`<b>Sam:</b> keeps his level (Lv ${S.sam.lvl||1}); ${[BAL.ngplus.samReset.stats&&'training and story stat gains',BAL.ngplus.samReset.appraisal&&'Appraisal'].filter(Boolean).join(' and ')} start over${BAL.ngplus.samReset.stats&&BAL.ngplus.carry?` (he keeps ${Math.round(BAL.ngplus.carry*100)}% of his trained stats)`:''}.<br>`:''}
      <b>Lovers who stay:</b> ${lovers.length ? lovers.map(w=>`${esc(w.name)}${NGS.perks[w.id]?` (${esc(NGS.perks[w.id])})`:''}${ngRomance(NGS,w)==='reset'?' ↺ starting over':' ♥ still his lover'}`).join(', ') + '. They draw wages again (' + Math.round((BAL.ngplus.rebornWage||0)*100) + '% more for each life carried over); their skills, popularity, trust and lewdness start over, keeping ' + carryTxt() + ' of the skills and stats they\'d built (Reincarnated makes the climb back faster). A lover starting over begins her story with Sam again at the first chapter, firsts included.' : 'none. Only Devoted lovers come along.'}<br>
      ${residents.length?`<b>Back with their houses:</b> ${residents.map(w=>esc(w.name)).join(', ')}. They start over like the lovers (no perk), with a Reincarnated stack and the same wage rise.<br>`:''}
      ${friends.length?`<b>Old friends:</b> ${friends.map(w=>esc(w.name)).join(', ')}. They'll look Sam up again (Recruit), with a Reincarnated stack, keeping ${carryTxt()} of what they'd built and asking ${Math.round((BAL.ngplus.rebornWage||0)*100)}% more pay per life.<br>`:''}
      <b>Leaving:</b> ${leaving.length ? `${leaving.length} ladies (${leaving.slice(0,8).map(w=>esc(w.name)).join(', ')}${leaving.length>8?', …':''}). Named ones can be met again, fresh.` : 'no one.'}<br>
      ${NGS.house?`<b>New house:</b> ${esc(HOUSES[NGS.house].name)} with ${esc((NAMED[HOUSES[NGS.house].npc]||{}).name||'its resident')}.<br>`:''}
      ${NGS.past&&NGS.past!=='none'?`<b>Another past life:</b> ${esc(PASTS[NGS.past].label)}.<br>`:''}
      <b>Reincarnated:</b> every lady who stays gains a stack (faster trust, lewdness, skill and stat growth; wages ${Math.round((BAL.ngplus.rebornWage||0)*100)}% higher per stack).<br>
      <b>Sam:</b> max energy ${100 + (BAL.sam.energyPerCycle||0)*(N.cycle-1)}.<br>
      <b>Higher ceiling:</b> stats and skills can now reach ${BAL.ngplus.cap.base + BAL.ngplus.cap.perCycle*(N.cycle-1)} (Sam's ${(BAL.ngplus.cap.base + BAL.ngplus.cap.perCycle*(N.cycle-1))/SKL}).<br>
      <b>New:</b> ${NGS.partner&&NGS.partner!=='none'?`${esc(NAMED[NGS.partner].name)} at Sam's side`:'no new partner'}${NGS.boon?`. Perk: <b>${NG_BOONS[NGS.boon].label}</b>`:''}. ✦ houses (and more) can be bought during the cycle.<br>
      ${N.sold.length?`<b>${N.sale?'Sold to the Credit House':'Surrendered to the Credit House'}:</b> ${N.sold.map(h=>esc(h.name)).join(', ')}${N.sale?` (${fmt(N.sale)}, off the debt)`:''}.<br>`:''}
      <b>Debt:</b> ${fmt(N.debt)} (${esc(HDo.name)} ${fmt(N.base)} + your improvements ${fmt(N.impr)} × ${BAL.ngplus.improveShare} = ${fmt(N.extra)}${N.house?` + ${esc(HOUSES[NGS.house].name)} ${fmt(N.house)}`:''})${N.sale?`, minus ${fmt(N.sale)} for the sold houses`:''}, due over ${ngPlan(N.cycle).payments*BAL.debt.every} weeks (the Credit House wants it faster each cycle).<br>
      <b>Purse:</b> ${fmt(N.purse)} (starting purse; your savings stay behind)</div>`;
    ok = true;
  }
  modal(`${nav}${body}<div class="row" style="margin-top:12px">${st>0?'<button onclick="ngNav(-1)">← Back</button>':'<button onclick="NGS=null;closeModal()">Not yet</button>'}${st<steps.length-1?`<button class="primary" onclick="ngNav(1)" ${ok?'':'disabled'}>Next →</button>`:`<button class="primary" onclick="ngBegin()">Begin New Game+</button>`}</div>`, {lock:true, wide:true});
}
// A carried lady starts over: stats, tech and act skills back to her starting values (named: from her data, same
// conversion as makeNamed; generic: half of what she has), popularity 0, and trust and lewdness back to where she began
// (named: her data values; generic: w.base0 from when she was rolled, or balance.json → ngplus.baseTrust/baseLewd for old saves).
// Her Reincarnated stacks make the climb back faster. Titles and bonds stay; a lover's romance resets separately (ngRomanceReset).
// carryShare(w) of what she gained above that starting value stays with her (stats, job skills, service skills; not trust/lewdness).
// Call after S.cycle is raised, so clampK already allows the new cycle's higher ceiling.
// The share grows with her lives: carryPer x the life she's entering (2nd life 20%...), at most carryMax; carry is the floor (and Sam's share).
const carryShare = w => { const B = BAL.ngplus, m = hasBoon('memory') || (NGS && NGS.boon==='memory') ? 0.15 : 0; return Math.max(B.carry||0, Math.min((B.carryMax ?? 0.5) + m, (B.carryPer ?? B.carry ?? 0) * ((w && w.reborn || 0) + 1) + m)); };
const carryTxt = () => { const B = BAL.ngplus; const m = hasBoon('memory') || (NGS && NGS.boon==='memory'); return `${Math.round((B.carryPer ?? B.carry ?? 0)*100)}% per life she's lived, up to ${Math.round((B.carryMax ?? 0.5)*100)}%${m ? ', +15% from Vivid Memories' : ''}`; };
const ngCarry = (now, start, sh) => clampK(Math.round(start + (sh ?? BAL.ngplus.carry ?? 0) * Math.max(0, (now||0) - start)));
// NG+ loan schedule (balance.json → debt.ngplus): each cycle past the first has fewer payments and a flatter ramp, so the money is due sooner.
function ngPlan(cyc){
  const D = BAL.debt, G = D.ngplus || {}, k = Math.max(0, (cyc||2) - 1);
  return {payments: Math.max(G.minPayments ?? D.payments, D.payments - (G.fewer||0)*k), ramp: Math.max(G.minRamp ?? 1, D.ramp - (G.flatter||0)*k)};
}
function ngReset(w){
  const B = BAL.ngplus, sh = carryShare(w), ngC = (a,b) => ngCarry(a, b, sh);
  if(w.key && NAMED[w.key]){
    const f = makeNamed(w.key);
    STAT_KEYS.forEach(k=>{ w.stats[k] = ngC(w.stats[k], f.stats[k]); }); TECH_KEYS.forEach(k=>{ w.tech[k] = ngC(w.tech[k], f.tech[k]); });
    Object.keys(w.acts||{}).forEach(id=>{ if(f.acts[id]) w.acts[id].skill = ngC(w.acts[id].skill, f.acts[id].skill); });
    w.trust = f.trust; w.lewd = f.lewd;
  } else {
    const half = v => Math.round((v||0)*0.5);
    STAT_KEYS.forEach(k=>{ w.stats[k] = ngC(w.stats[k], half(w.stats[k])); }); TECH_KEYS.forEach(k=>{ w.tech[k] = ngC(w.tech[k], half(w.tech[k])); });
    Object.values(w.acts||{}).forEach(a=>{ a.skill = ngC(a.skill, half(a.skill)); });
    const b = w.base0 || {}; w.trust = b.trust ?? (B.baseTrust ?? 15); w.lewd = Math.min(w.lewd, b.lewd ?? (B.baseLewd ?? 25));
  }
  w.lust = Math.min(w.lust||0, LUST_EAGER);
  w.popularity = 0; w.arcWk = 0; w.earnedLast = 0; w.energy = maxEnergy(w);
}
// A carried lover's romance starts over (when the player picks 'reset' for her on the perks step): no longer Devoted, her arc back to chapter 0,
// firsts back to the start (w.intim 0; her path is fixed by her data), and the counters her arc checks (dates, private time).
// A data trait the arc removes (Oblivious) comes back. Titles she earned stay, so replaying the arc can't grant its title twice.
function ngRomanceReset(w){
  w.traits = (w.traits||[]).filter(t=>t!=='Devoted');
  if(ARCS[w.key]) w.arc = 0;
  w.intim = 0; delete w.intimWk; w.firstHold = 0;
  w.privateCount = 0; w.dates = 0; w.exLover = false; w.neglect = 0; delete w.rekindleWk;
  const D = w.key && NAMED[w.key];
  if(D && (D.traits||[]).includes('Oblivious') && !has(w,'Oblivious')) w.traits.push('Oblivious');
  if(S.sleepIn === w.id) S.sleepIn = null;
}
function ngBegin(){
  const C = NGS; if(!C || !C.boon && !Object.keys(NG_BOONS).every(k=>(S.boons||[]).includes(k))) return;
  const B = BAL.ngplus, og = homeHouse(), HDo = HOUSES[og], N = ngNumbers(C.boon, C.house), lovers = carriedLovers(), friends = ngFriends();
  if(lovers.some(w=>!C.perks[w.id] && NG_PERKS().some(t=>!(w.ngPerks||[]).includes(t)))) return;
  const keptIds = new Set(S.houses.filter(keptHouse).map(h=>h.id));   // before S.houses is trimmed
  S.home = og; S.cycle = N.cycle;   // set first: generics rolled from here on can get ngOnly traits
  S.boons = S.boons || []; if(C.boon && !S.boons.includes(C.boon)) S.boons.push(C.boon);   // early, so Old Loyalties / Vivid Memories apply to this cycle's carries
  // lovers: wages again, perk, reset
  lovers.forEach(w=>{
    const p = C.perks[w.id]; if(p){ w.ngPerks = [...(w.ngPerks||[]), p]; }
    w.isPartner = false; w.free = false; w.contract = 12; if(!keptIds.has(w.house)) w.house = og; if(w.locked && w.locked!==w.house) w.locked = null;
    ngReset(w); if(ngRomance(C, w)==='reset') ngRomanceReset(w); w.reborn = (w.reborn||0) + 1;
    w.wage = wageFor(w); if(w.job!=='rest') w.job = safeJob(w, w.job);
  });
  // residents of kept houses: back with their house, reincarnated (no perk); one freed by her house story stays wage-free
  const residents = ngResidents();
  residents.forEach(w=>{
    const hid = residentHouse(w, keptHouse).id;
    ngReset(w); w.reborn = (w.reborn||0) + 1; w.isPartner = false; w.house = hid; w.locked = hid; w.contract = 999;
    w.wage = w.free ? 0 : wageFor(w); if(w.job!=='rest') w.job = safeJob(w, w.job);
  });
  // everyone else leaves; named ladies go back to their pools, fresh (isHired is false for them again)
  const ids = new Set([...lovers, ...residents].map(w=>w.id));
  friends.forEach(w=>{   // old friends wait in S.alumni; hire() sets job, contract, house and seen when she is signed again
    ngReset(w); w.reborn = (w.reborn||0) + 1; w.free = false; w.isPartner = false; w.locked = null; w.job = 'rest'; w.contract = 12; w.house = og; w.seen = {}; w.wage = wageFor(w);
  });
  S.alumni = [...(S.alumni||[]), ...friends];
  S.workers = [...lovers, ...residents]; S.candidates = [];
  // bonds between two ladies who both reincarnate (lovers, old friends, alumni still waiting) carry over, faded to
  // ngplus.bonds.keep of their value (kind kept); everything else is dropped. b.past counts the lives it has survived.
  const BK = B.bonds || {}, reborn = new Set([...ids, ...(S.alumni||[]).map(w=>w.id), ...friends.map(w=>w.id)]);
  S.bonds = Object.fromEntries(Object.entries(S.bonds||{}).filter(([k])=>k.split('|').every(id=>reborn.has(id))).map(([k,o])=>{
    const n = Object.assign({}, o, {v: Math.round((o.v||0) * (BK.keep ?? 0.5)), past: (o.past||0) + 1});
    if(o.seeded) n.v = Math.max(n.v, seedBondV(k));   // a bond written into their data never fades below that
    if(BK.kinds === false) delete n.kind;
    return [k, n]; }).filter(([,o])=>o.v || o.kind));
  S.regulars = (S.regulars||[]).filter(r=>keptIds.has(r.house));
  S.houses = S.houses.filter(h=>keptIds.has(h.id));
  // kept houses keep rooms, upgrades and story; their reputation goes back to the house's starting value plus ngplus.carry of what it had gained
  S.houses.forEach(h=>{ const D = HOUSES[h.id]; if(D) h.rep = Math.round(D.rep + (B.carry||0) * Math.max(0, (h.rep||0) - D.rep)); });
  // each kept house's resident comes with the house: if she wasn't working for Sam she's back, fresh
  S.houses.forEach(h=>{ const D = HOUSES[h.id]; if(D && D.npc && !isHired(D.npc)){ const npc = makeNamed(D.npc); npc.house = h.id; npc.locked = h.id; npc.contract = 999; assignStart(npc, NAMED[D.npc].job); S.workers.push(npc); } });
  S.cur = og;
  // the new house and its resident
  if(C.house && HOUSES[C.house] && !H(C.house)){
    const D = HOUSES[C.house]; S.houses.push(makeHouse(C.house)); H(C.house).since = S.week; S.starters = [...(S.starters||[]), C.house];
    if(!isHired(D.npc)){ const n = makeNamed(D.npc); n.house = C.house; n.locked = C.house; n.contract = 999; assignStart(n, NAMED[D.npc].job); S.workers.push(n); }
  }
  // another past life
  if(C.past && C.past!=='none' && PASTS[C.past] && !hasPast(C.past)){ S.pasts = [...samPasts(), C.past]; PASTS[C.past].fx(S.sam); }
  if(C.partner && C.partner!=='none'){
    const p = makeNamed(C.partner, true); p.house = og;
    if(C.boon==='devotion'){ p.trust = clamp(p.trust+15); p.lewd = clamp(p.lewd+10); }
    S.workers.push(p); assignStart(p, ['courtesan','bartender','dancer','bath'].includes(NAMED[C.partner].job) ? NAMED[C.partner].job : 'courtesan');
    S.partner = C.partner;
  }
  S.partners = Array.from(new Set([...(S.partners||[]).filter(k=>S.workers.some(w=>w.key===k)), ...(C.partner && C.partner!=='none' ? [C.partner] : [])]));
  const h0 = H(og); if(C.boon==='renown') h0.rep = clamp(h0.rep + 10);
  // Sam, money, debt
  const samOld = Object.fromEntries(Object.keys(BAL.sam.base).map(k=>[k, S.sam[k]||0]));
  if(B.samReset.stats){   // base + perLevel x (lvl-1), then every past life's bonuses again
    const lv = (S.sam.lvl||1) - 1; Object.entries(BAL.sam.base).forEach(([k,v])=>{ S.sam[k] = clamp(v + BAL.sam.perLevel*lv, 0, samCap()); });
  }
  if(B.samReset.appraisal){ S.sam.appraisal = 1; S.sam.appXP = 0; }
  if(B.samReset.stats || B.samReset.appraisal) samPasts().forEach(k=>{ if(PASTS[k]) PASTS[k].fx(S.sam); });
  if(B.samReset.stats) Object.keys(samOld).forEach(k=>{ S.sam[k] = clamp(Math.round(S.sam[k] + (B.carry||0)*Math.max(0, samOld[k] - S.sam[k])), 0, samCap()); });   // he keeps ngplus.carry of what he'd trained
  // Sam's own things (balance.json → samUps): the ones without carry stay behind; he sleeps at his home house again
  S.samUps = Object.fromEntries(Object.entries(S.samUps||{}).filter(([k,v])=>v && (BAL.samUps[k]||{}).carry)); S.samHome = og;
  S.boons = S.boons || []; if(C.boon && !S.boons.includes(C.boon)) S.boons.push(C.boon);
  if(C.boon==='renown') S.rep = clamp(S.rep + 15);
  S.gold = N.purse;
  S.debt = Object.assign({total:N.debt, remaining:N.debt, carry:0, strikes:0, start:S.week-1}, ngPlan(N.cycle));
  S.won = false; S.over = false; S.lastReport = null; EVQ = []; delete S.ngSeed;
  S.flags.partnerCD = 3; S.ap = apMax();
  refreshCandidates(C.boon==='recruit' ? 3 : 0, C.boon==='recruit' ? 1.15 : 1);
  inviteFriend(true);   // the first week already shows an old friend
  checkUnlocks(true);
  addLog(`New Game+ (cycle ${S.cycle}): Sam keeps ${HDo.name} and takes on a new debt of ${fmt(N.debt)}.`);
  NGS = null; save(); TAB = 'house'; render();
  modal(`<h2>${esc(HDo.name)}</h2><p class="story">Marguerite Vane slides a fresh contract across the desk. "Paying off one house was impressive, Mr. Takahashi. Let's see you do it again, with a little less sentiment." She almost smiles again. It's starting to worry him.\n\nSam keeps ${esc(HDo.name)}${C.house?`, takes on ${esc(HOUSES[C.house].name)}`:''}${lovers.length?` and ${lovers.map(w=>esc(w.name)).join(', ')}`:''}. Everyone else has gone their own way. The new debt is ${fmt(N.debt)}, due over the next ${S.debt.payments*BAL.debt.every} weeks.</p><div class="row"><button class="primary" onclick="closeModal()">Let's go</button></div>`);
}
