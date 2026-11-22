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
const houseOffered = k => !HOUSES[k].ngppOnly && (!isNGHouse(k) || (S && (S.cycle||1) >= 2));
const unboundVesselForms = () => Object.keys(GOD_FORMS).filter(k=>!((S&&S.vessels)||[]).includes(k));
function isNGPPNext(){
  if(!S) return false;
  const g = G(); if(g.left) return false;
  if(g.bound) return true;
  return [...carriedLovers(), ...ngFriends(), ...(S.alumni||[]), ...Object.values(S.lives||{})].some(w=>(w.reborn||0) >= fullAt());
}
// NG+ partners (characters.json ngplus) are only offered from cycle 2: not in the first new-game choice, not as walk-ins.
const partnerOffered = k => !(NAMED[k]||{}).ngplus || !!(S && (S.cycle||1) >= 2);
const hasBoon = k => !!(S && S.boons && S.boons.includes(k));
const cycleTag = () => {
  if(!S) return '';
  if((S.ngppCycle||0) > 0) return `NG++${S.ngppCycle > 1 ? S.ngppCycle : ''}`;
  return (S.cycle||1) > 1 ? `NG+${S.cycle>2 ? S.cycle-1 : ''}` : '';
};
const homeHouse = () => S.home || S.houses[0].id;
// Houses that stay with Sam in New Game+: his home, the starter house of every cycle (S.starters), and any house whose story is finished.
const houseStoryDone = h => !!(h && STORIES[h.id] && h.story && h.story.beat >= STORIES[h.id].beats.length);
// The home house always stays; every other qualifying house (starter or story done) is an optional carry, chosen on the "Houses" step (NGS.keep, default true).
const keepable = h => (S.starters||[]).includes(h.id) || houseStoryDone(h);
const optionalHouses = () => S.houses.filter(h=>h.id!==homeHouse() && keepable(h));
const keptHouse = h => h.id===homeHouse() || (keepable(h) && !(NGS && NGS.keep && NGS.keep[h.id]===false));
const keptWhy = h => h.id===homeHouse() ? 'home' : (S.starters||[]).includes(h.id) ? 'starter' : 'story complete';
const NG_BOONS = {
  purse:   {label:'Deep Pockets', desc:'Start every cycle with 2,500g extra in hand.'},
  ap:      {label:'Seasoned Owner', desc:'+1 action every week, for good.'},
  renown:  {label:'A Name in Hollowmere', desc:'Every cycle starts with +15 renown, and its new house opens with +10 popularity.'},
  recruit: {label:'Friends in Town', desc:'3 extra, better candidates at the start of every cycle; signing bonuses are 25% cheaper for good.'},
  grace:   {label:'Lenient Lender', desc:'Every new debt is 10% smaller, for good.'},
  devotion:{label:'Fated Meeting', desc:'Every new partner, this cycle and after, starts with +15 trust and +10 lewdness.'},
  loyal:   {label:'Old Loyalties', desc:'Ladies who come back from a past life ask only half the usual raise for each life.'},
  memory:  {label:'Vivid Memories', desc:'Ladies who carry over keep 15% more of the skills and stats they built (still at most 65%).'},
  clone:   {label:'Shadow Clone', desc:'Sam learned to be in two places at once. His weekly focus and always-on bonuses reach every house, not just where he sleeps (like the Speaking Stones, for good). Late-night visits still need the Teleport Circle.'}
};
// What was spent on the home house's rooms, tiers, quarters, beds, annex and upgrades (tracked in h.spent by buyUpgrade).
const improvementsValue = h => Math.round((h && h.spent) || 0);
// Lovers (Devoted) are the only ladies who carry over.
const carriedLovers = () => S.workers.filter(w=>has(w,'Devoted'));
// Old friends: non-lover guests (role 'drifter') and favorited generic ladies at max trust (capped at completed cycles). They come back as extra candidates (S.alumni), reborn but without a perk.
function ngFriends(){
  const F = BAL.ngplus.friends || {}, L = carriedLovers();
  const guests = S.workers.filter(w=>!L.includes(w) && !w.isPartner && w.trust >= (F.trust ?? 100) && isGuest(w) && F.guests);
  const gens = F.generics ? S.workers.filter(w=>!L.includes(w) && !w.isPartner && !w.key && w.favorite && w.trust >= (F.trust ?? 100)).slice(0, S.cycle||1) : [];
  return [...guests, ...gens];
}
const NG_PERKS = () => Object.keys(TRAITS).filter(t=>TRAITS[t].ngPerk);
// House residents (HOUSES[id].npc) working for Sam whose house he keeps: they come back with it, reincarnated (no perk). Lovers are carried as lovers instead.
// keep(h): which houses count (the NG+ save keeps every keepable house; the wizard asks keptHouse).
// A house's own ladies: its resident (HOUSES[id].npc) and, once its story is finished, the lady the story brought in (STORY_JOINS).
const storyJoin = h => { const J = STORY_JOINS[h.id]; return J && houseStoryDone(h) ? J : null; };
const houseLadies = h => [(HOUSES[h.id]||{}).npc, (storyJoin(h)||[])[0]].filter(Boolean);
const residentHouse = (w, keep) => w.key ? S.houses.find(h=>keep(h) && houseLadies(h).includes(w.key)) : null;
// Bring back a finished story's lady with her house if she isn't working for Sam (NG+, and once for saves that lost her: migrate v31).
function restoreStoryJoin(h, newLife){
  const J = storyJoin(h); if(!J || isHired(J[0]) || !NAMED[J[0]]) return null;
  const w = rebirthNamed(makeNamed(J[0]), newLife); w.house = h.id; w.locked = h.id; w.contract = 999;
  if(S && (S.ngppCycle||0) > 0 && (w.wasLover || (w.reborn||0) > 0)) w.reMet = (w.reMet||0) + 1;
  if(J[1]){ w.free = true; w.wage = 0; }
  assignStart(w, NAMED[J[0]].job); S.workers.push(w); return w;
}
const ngResidents = (keep = keptHouse) => S.workers.filter(w=>!has(w,'Devoted') && residentHouse(w, keep));
function ngNumbers(boon, house, opts){
  if(house===undefined && NGS) house = NGS.house;
  const B = BAL.ngplus, cyc = (S.cycle||1) + 1;
  const ngpp = opts && opts.ngpp!==undefined ? opts.ngpp : isNGPPNext();
  const chId = opts && opts.challenge!==undefined ? opts.challenge : (NGS && NGS.challenge);
  const ch = chId && CYCLE_CHALLENGES[chId] ? CYCLE_CHALLENGES[chId] : null;
  if(ngpp){
    const ngppCyc = (S.ngppCycle||0) + 1, hk = B.ngppHouse || 'shrine';
    const step = B.ngppStep !== undefined ? B.ngppStep : Math.round((B.ngppDebt ?? 100000) * (B.ngppPerCycle ?? 1));
    const base = (B.ngppDebt ?? 100000) + step * Math.max(0, ngppCyc - 1);
    const savedShrine = ngppCyc >= 2 && S.ngppHouses && S.ngppHouses[hk] ? S.ngppHouses[hk] : null;
    const shrineNow = H(hk);
    const imprRaw = ngppCyc >= 2 ? ((shrineNow && shrineNow.spent) || (savedShrine && savedShrine.spent) || 0) : 0;
    const extra = Math.round(imprRaw * (B.improveShare ?? 1));
    let debt = base + extra;
    if(boon==='grace' || hasBoon('grace')) debt *= 0.9;
    if(hasChallengePerk('ahead_of_time')) debt *= 0.9;
    if(ch && ch.debt) debt *= ch.debt;
    debt = Math.round(debt);
    const purse = Math.round(((B.ngppPurse ?? B.purse) + (boon==='purse' || hasBoon('purse') ? 2500 : 0)) * (ch && ch.purse!==undefined ? ch.purse : 1));
    return {ngpp:true, ngppCycle:ngppCyc, houseKey:hk, gross:debt, debt, house:0, base:Math.round(base), impr:Math.round(imprRaw), extra, keptExtra:0, loverExtra:0, keptCount:0, loverCount:0, scaleMul:1, sold:[], sale:0, purse, cycle:cyc};
  }
  const og = homeHouse(), kept = S.houses.filter(keptHouse), impr = kept.reduce((a,h)=>a + improvementsValue(h), 0);
  const cycMul = 1 + B.perCycle * Math.max(0, cyc - 2);
  const keptOpt = kept.filter(h=>h.id !== og), loverCount = carriedLovers().length;
  const base = houseDebt(og) * B.debtShare * cycMul, extra = impr * B.improveShare;
  const keptExtra = keptOpt.reduce((a,h)=>a + houseDebt(h.id) * (B.keptHouseShare ?? 0.25) * cycMul, 0);
  const loverExtra = loverCount * (B.loverDebt ?? 1800) * cycMul;
  const nh = house && HOUSES[house] ? houseDebt(house) * (B.newHouseShare ?? 1) * cycMul : 0;
  const scaleMul = 1 + keptOpt.length * (B.perKeptHouse ?? 0) + loverCount * (B.perLover ?? 0.22);
  let debt = (base + extra + keptExtra + loverExtra + nh) * scaleMul;
  if(boon==='grace' || hasBoon('grace')) debt *= 0.9;
  if(hasChallengePerk('ahead_of_time')) debt *= 0.9;
  if(ch && ch.debt) debt *= ch.debt;
  debt = Math.round(debt);
  const sold = S.houses.filter(h=>!keptHouse(h)), sale = Math.round(sold.reduce((a,h)=>a + HOUSES[h.id].cost*B.saleValue, 0));   // surrendered houses reduce the debt; no gold changes hands
  const purse = Math.round((B.purse + (boon==='purse' || hasBoon('purse') ? 2500 : 0)) * (ch && ch.purse!==undefined ? ch.purse : 1));   // savings stay behind
  return {ngpp:false, gross:debt, debt:Math.max(0, debt - sale), house:Math.round(nh), base:Math.round(base), impr, extra:Math.round(extra), keptExtra:Math.round(keptExtra), loverExtra:Math.round(loverExtra), keptCount:keptOpt.length, loverCount, scaleMul, sold, sale, purse, cycle:cyc};
}
// NG+ save: a trimmed copy of a won game holding only what New Game+ can carry (Devoted lovers, old friends, alumni, the
// bonds between them, houses (kept ones carry, the rest count for the sale credit), Sam, pasts, boons, samUps, wardrobe).
// Nothing is chosen yet: loading it opens the NG+ wizard (S.ngSeed), so one file can start the next cycle again and again.
function ngSeed(){
  if(!S || !S.won) return null;
  const kh = new Set([homeHouse(), ...S.houses.filter(keepable).map(h=>h.id)]);
  const s = clone(S), keep = new Set([...carriedLovers(), ...(S.lingerTaken||[]), ...ngFriends(), ...ngResidents(h=>kh.has(h.id))].map(w=>w.id));
  s.workers.push(...(s.lingerTaken||[])); s.lingerTaken = []; s.lingerSeen = [];   // lovers sleeping in the lantern carry over too
  s.workers.filter(w=>!keep.has(w.id)).forEach(w=>rememberLife(w, false, s));   // the ones left behind lived a life too (see rememberLife)
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
function ngChallengeOk(k, C){
  if(k==='none') return true;
  const ch = CYCLE_CHALLENGES[k]; if(!ch) return false;
  if(hasChallengePerk(k)) return false;
  const ngpp = C ? !!C.ngpp : isNGPPNext(), g = G(), bound = !!(g.bound && !g.left);
  if(ch.req==='ngpp' && !ngpp) return false;
  if(ch.req==='bound' && !bound) return false;
  if(ch.req==='stay' && !(bound || g.ending==='stay')) return false;
  return true;
}
function startNGPlus(){
  if(!S || !S.won) return toast('New Game+ unlocks once the debt is paid off.');
  lingerWake();   // lovers sleeping in the lantern come back for the rebirth
  const ngpp = isNGPPNext(), unb = unboundVesselForms(), forms = Object.keys(GOD_FORMS);
  const offers = ngpp ? [] : shuffle(Object.keys(HOUSES).filter(k=>!H(k) && !HOUSES[k].premium && !HOUSES[k].ngppOnly && (!isNGHouse(k) || (S.cycle||1)+1 >= 2))).slice(0, BAL.ngplus.houseOffers||4);
  NGS = {step:0, ngpp, partner:ngpp?'none':null, vesselForm: ngpp ? (unb[0] || forms[0]) : null,
    keep:Object.fromEntries(optionalHouses().map(h=>[h.id,true])), boon:null, perks:{}, romance:{}, lantern:{}, house:null, past:null, challenge:'none', offers};
  ngView();
}
function ngKeep(id){ if(!NGS || !NGS.keep || !optionalHouses().some(h=>h.id===id)) return; NGS.keep[id] = NGS.keep[id]===false; ngView(); }
function ngPick(k, v){ NGS[k] = v; ngView(); }
function ngPerkPick(wid, v){ if(v) NGS.perks[wid] = v; else delete NGS.perks[wid]; ngView(); }
// per lover: 'keep' (default) = still his lover (Devoted, her story and firsts kept), 'reset' = the romance starts over (ngRomanceReset). Trust resets either way.
const ngRomance = (C, w) => ((C && C.romance) || {})[w.id] === 'reset' ? 'reset' : 'keep';
function ngRomancePick(wid, v){ (NGS.romance = NGS.romance || {})[wid] = v === 'reset' ? 'reset' : 'keep'; ngView(); }
const ngLanternChoice = (C, key) => ((C && C.lantern) || {})[key] === 'reset' ? 'reset' : 'keep';
function ngLanternPick(key, v){ (NGS.lantern = NGS.lantern || {})[key] = v === 'reset' ? 'reset' : 'keep'; ngView(); }
function lanternCarryCandidates(){
  if(!S) return [];
  const w = (S.workers||[]).find(x=>x.key==='anael' && isLanternAngel(x));
  const l = S.lives && S.lives.anael && (S.lives.anael.lantern || S.lives.anael.sub==='lantern');
  if(!w && !l) return [];
  return [{key:'anael', id: w ? w.id : 'n_anael', name: (w && w.name) || (NAMED.anael && NAMED.anael.name) || 'Anael', worker: w || null}];
}
const pastsLeft = () => Object.keys(PASTS).filter(k=>!hasPast(k));
const ngSteps = () => NGS && NGS.ngpp
  ? ['Bound vessel', 'Sam\'s perk', ...(pastsLeft().length ? ['Another past life'] : []), ...(carriedLovers().length || lanternCarryCandidates().length ? ['Lovers\' perks'] : []), 'Challenge', 'Begin']
  : ['New partner', ...(optionalHouses().length ? ['Houses'] : []), ...(NGS && NGS.offers.length ? ['New house'] : []), 'Sam\'s perk', ...(pastsLeft().length ? ['Another past life'] : []), ...(carriedLovers().length || lanternCarryCandidates().length ? ['Lovers\' perks'] : []), 'Challenge', 'Begin'];
function ngNav(d){ NGS.step = Math.max(0, Math.min(ngSteps().length-1, NGS.step + d)); ngView(); }
function ngView(){
  const st = NGS.step, og = homeHouse(), steps = ngSteps(), cur = steps[st], lovers = carriedLovers();
  const nav = `<div class="row muted">${steps.map((s,i)=>i===st?`<b class="pink">${i+1}. ${s}</b>`:`${i+1}. ${s}`).join(' → ')}</div>`;
  let body = '', ok = false;
  if(cur==='Bound vessel'){
    const seenV = new Set(S.vessels || []), hk = BAL.ngplus.ngppHouse || 'shrine', ngppCyc = (S.ngppCycle||0) + 1;
    const cap = (BAL.ngplus.ngppRoomStart ?? 10) + (BAL.ngplus.ngppRoomStep ?? 5) * Math.max(0, ngppCyc - 1);
    body = `<h2>NG++ Soft Reset — Choose a Bound Vessel</h2><p class="muted">With ${esc(GN())} bound, a deeper cycle opens at <b>${esc(HOUSES[hk].name)}</b> (room cap <b>${cap}</b> on NG++${ngppCyc}). Everything resets to a fresh beginning—houses, savings, Sam's level (keeping boons, past lives, challenge perks, and raised stat caps), and lovers (prior lovers keep their reincarnated stacks and perks if met again). Instead of a partner, choose a bound form to wait in the shrine as an empty vessel—and awaken as Sam fills her up.</p>
      <div class="grid">${Object.entries(GOD_FORMS).map(([k,f])=>{ const done = seenV.has(k); return `<div class="pick ${NGS.vesselForm===k?'sel':''}" onclick="ngPick('vesselForm','${k}')">
        <b>${esc(f.label||k)}</b> ${done?'<span class="tag">awakened before</span>':'<span class="tag house">new form</span>'}
        <div class="muted">${esc(RACES[f.race||k]?.label || f.race || k)}${f.sub?' · '+esc(f.sub):''} · ${esc(f.build||'slender')}</div>
        <div style="margin-top:4px">${esc(f.features || f.outfit || 'Shaped after Seliora, waiting for her own soul to form.')}</div></div>`; }).join('')}</div>`;
    ok = !!NGS.vesselForm;
  } else if(cur==='New partner'){
    const carried = new Set(lovers.map(w=>w.key).filter(Boolean)), free = PARTNERS.filter(k=>!carried.has(k));   // cycle 2+: NG+ partners included
    body = `<h2>A new partner</h2><p class="muted">Sam's lovers come with him, and they'll work for wages now (guests and ladies who trust him completely may look him up again later). Pick someone new to start this chapter at his side. Partners marked ✦ come from Sam's old world and only arrive in New Game+.</p>
      <div class="grid">${free.map(k=>{ const n = NAMED[k]; return `<div class="pick ${NGS.partner===k?'sel':''}" onclick="ngPick('partner','${k}')">
        <b>${n.ngplus?'✦ ':''}${esc(titled(n))}</b> <span class="muted">${RACES[n.race].label}${n.sub?' ('+n.sub+')':''} · ${esc(n.personality)}</span><div class="muted">Trust ${tShow(n.partnerTrust)} · ${JOBS[n.job].label} · ${n.traits.join(', ')}</div>
        <div style="margin-top:4px">${esc(n.partnerBlurb || n.partnerStory)}</div></div>`; }).join('')}
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
        ${D.perk?`<div class="good" style="margin-top:4px">✦ <b>${esc(D.perk.label)}:</b> ${esc(D.perk.desc)}</div>`:''}
        <div style="margin-top:4px">Adds ${fmt(ngNumbers(null, k).house)} debt · Rooms ${D.rooms}${D.damaged?` · ${D.damaged} damaged`:''} · ${n?esc(n.name)+' comes with it':''}</div></div>`; }).join('')}</div>`;
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
    const lCands = lanternCarryCandidates().filter(x => !lovers.some(w => w.key === x.key));
    body = `<h2>What stays with them</h2><p class="muted">${NGS.ngpp ? 'In NG++, prior lovers walk back into the world on their own—they keep their Reincarnated stacks, gain one final perk here, and ask no signing bonus if Sam meets them again.' : 'Each lover carries one perk into the new chapter. A perk can be taken once per lady and stacks across cycles. Her trust starts over either way; choose whether she stays Sam\'s lover (her story and firsts with him kept) or their romance begins again from the first chapter.'}</p>
      ${lovers.map(w=>{ const left = NG_PERKS().filter(t=>!(w.ngPerks||[]).includes(t)), cp = NGS.perks[w.id], isLAnael = w.key==='anael' && isLanternAngel(w);
        return `<div class="card"><b>${esc(w.name)}</b> <span class="muted">${esc(w.personality)} · trust ${tShow(w.trust)}${(w.ngPerks||[]).length?' · has: '+w.ngPerks.join(', '):''}${isLAnael?' · 🕯️ Lantern Angel':''}</span>
          <div class="row">${NGS.ngpp ? '' : `<select onchange="ngRomancePick('${w.id}',this.value)"><option value="keep" ${ngRomance(NGS,w)==='keep'?'selected':''}>♥ Stay lovers</option><option value="reset" ${ngRomance(NGS,w)==='reset'?'selected':''}>↺ Start the romance over</option></select>`}
            ${isLAnael ? `<select onchange="ngLanternPick('anael',this.value)"><option value="keep" ${ngLanternChoice(NGS,'anael')==='keep'?'selected':''}>🕯️ Carry Lantern Angel form</option><option value="reset" ${ngLanternChoice(NGS,'anael')==='reset'?'selected':''}>🕊️ Reset to mortal-vowed angel</option></select>` : ''}
            <select onchange="ngPerkPick('${w.id}',this.value)"><option value="">Choose a perk…</option>${left.map(t=>`<option value="${esc(t)}" ${cp===t?'selected':''}>${esc(t)}</option>`).join('')}</select></div>
          <div class="muted">${cp ? esc(TRAITS[cp].desc||'') : (left.length ? '' : 'She has every perk already.')}</div></div>`; }).join('')}
      ${lCands.map(x=>`<div class="card"><b>${esc(x.name)}</b> <span class="muted">🕯️ Lantern Angel${NGS.ngpp ? ' (walks back into the world next cycle)' : ''}</span>
        <div class="row"><select onchange="ngLanternPick('${x.key}',this.value)"><option value="keep" ${ngLanternChoice(NGS,x.key)==='keep'?'selected':''}>🕯️ Carry Lantern Angel form</option><option value="reset" ${ngLanternChoice(NGS,x.key)==='reset'?'selected':''}>🕊️ Reset to mortal-vowed angel</option></select></div>
        <div class="muted">${ngLanternChoice(NGS,x.key)==='keep' ? 'She keeps her Lantern wings, shameless poise, and Lantern storyline if met again.' : 'She starts over with her original Quiet Lamp vows and story. Any old Lantern pictures stay in your gallery.'}</div></div>`).join('')}`;
    ok = lovers.every(w=>NGS.perks[w.id] || !NG_PERKS().some(t=>!(w.ngPerks||[]).includes(t)));
  } else if(cur==='Challenge'){
    body = `<h2>This cycle's challenge</h2>
      <p class="muted">Optionally bind yourself to a <b>Cycle Challenge</b>. Clear the cycle's debt without breaking its rule to earn a permanent Challenge Perk across all future cycles.</p>
      <div class="grid"><div class="pick ${NGS.challenge==='none'?'sel':''}" onclick="ngPick('challenge','none')"><b>Standard Cycle</b><div class="muted">No extra restriction or challenge reward.</div></div>
        ${Object.entries(CYCLE_CHALLENGES).filter(([k])=>ngChallengeOk(k, NGS) || hasChallengePerk(k)).map(([k,ch])=>{
        const got = hasChallengePerk(k), locked = !got && !ngChallengeOk(k, NGS);
        return `<div class="pick ${NGS.challenge===k?'sel':''}" ${got||locked?'style="opacity:.5"':`onclick="ngPick('challenge','${k}')"`}>
          <b>${esc(ch.label)}</b> ${got?'<span class="tag">earned</span>':''}
          <div class="muted">${esc(ch.desc)}${k==='small_troupe' ? (()=>{ const N0 = ngNumbers(NGS.boon); return ` <b>This cycle: ${(ch.base ?? 6) + (ch.perLover ?? 1) * (N0.loverCount||0) + (ch.perHouse ?? 2) * (N0.keptCount||0)} staff.</b>`; })() : ''}</div>
          <div class="good" style="margin-top:4px">Reward — ${esc(ch.perk)}: ${esc(ch.perkDesc)}</div>
        </div>`; }).join('')}</div>`;
    ok = !!NGS.challenge;
  } else {
    const N = ngNumbers(NGS.boon), HDo = HOUSES[og], ch = CYCLE_CHALLENGES[NGS.challenge] || {};
    if(N.ngpp){
      const hk = N.houseKey || 'shrine', cap = (BAL.ngplus.ngppRoomStart ?? 10) + (BAL.ngplus.ngppRoomStep ?? 5) * Math.max(0, N.ngppCycle - 1);
      const vf = GOD_FORMS[NGS.vesselForm] || {};
      body = `<h2>Ready for NG++${N.ngppCycle} (Cycle ${N.cycle})?</h2><div class="card">
        <b>Soft Reset:</b> starts fresh at <b>${esc(HOUSES[hk].name)}</b> (room cap <b>${cap}</b>; scales income, growth &amp; renown from total Reincarnations working there). Sam returns to Lv 1 (stats reset to base + past lives), keeping his boons, past lives, Challenge Perks, energy (${samMaxEnergy()}), and raised ceiling (${BAL.ngplus.cap.base + BAL.ngplus.cap.perCycle*(N.cycle-1)}). ${N.ngppCycle===1 ? 'All prior house upgrades, house stories, lovers, regulars, and savings reset once here.' : 'Shrine keeps its upgrades &amp; story; other houses keep their NG++ upgrades &amp; stories to unlock when bought (paid without cycle scaling).'}<br>
        <b>Bound Vessel:</b> ${esc(vf.label||NGS.vesselForm)} arrives at ${esc(HOUSES[hk].name)} as an empty vessel—quiet and blank until Sam fills her up.<br>
        <b>Prior lovers (${lovers.length}):</b> lover stories reset; they keep their Reincarnated stacks, final NG+ perks, and slowly awakening memories when met again (no signing bonus; ${esc(GN())} notices).<br>
        ${lanternCarryCandidates().length ? `<b>Anael (Lantern Angel):</b> ${ngLanternChoice(NGS,'anael')==='reset' ? '↺ starts fresh with her Quiet Lamp vows restored (Lantern pictures stay saved).' : '🕯️ carries her Lantern Angel form into the next life.'}<br>` : ''}
        ${NGS.past&&NGS.past!=='none'?`<b>Another past life:</b> ${esc(PASTS[NGS.past].label)}.<br>`:''}
        <b>Challenge:</b> ${esc(ch.label||'Standard Cycle')}${ch.perk?` — reward: <b>${esc(ch.perk)}</b> (${esc(ch.perkDesc||'')})`:''}.<br>
        <b>Debt:</b> ${fmt(N.debt)} ${N.impr ? `(${fmt(N.base)} Shrine loan + ${fmt(N.extra)} saved Shrine upgrades)` : `(NG++${N.ngppCycle} Shrine loan: ${fmt(BAL.ngplus.ngppDebt ?? 100000)} base + ${fmt(BAL.ngplus.ngppStep ?? 100000)} per NG++ cycle)`}, due over ${ngPlan(N.cycle).payments*BAL.debt.every} weeks. <b>Purse:</b> ${fmt(N.purse)}.</div>`;
    } else {
      const friends = ngFriends(), residents = ngResidents(), leaving = S.workers.filter(w=>!lovers.includes(w) && !friends.includes(w) && !residents.includes(w));
      const F = BAL.ngplus.friends || {}, maxGen = S.cycle || 1, genFriends = S.workers.filter(w=>!lovers.includes(w) && !w.isPartner && !w.key && w.trust >= (F.trust ?? 100));
      body = `<h2>Ready for round ${N.cycle}?</h2><div class="card">
        <b>Keeps:</b> ${S.houses.filter(keptHouse).map(h=>`${esc(h.name)} (${keptWhy(h)})`).join(', ')}, each with its rooms, upgrades and story (its popularity starts over, keeping ${Math.round((BAL.ngplus.carry||0)*100)}% of what it had gained), Sam's level${BAL.ngplus.samReset.stats||BAL.ngplus.samReset.appraisal?'':', stats and Appraisal'}, the regulars there and your image library. Your savings stay behind.<br>
        ${BAL.ngplus.samReset.stats||BAL.ngplus.samReset.appraisal?`<b>Sam:</b> keeps his level (Lv ${S.sam.lvl||1}); ${[BAL.ngplus.samReset.stats&&'training and story stat gains',BAL.ngplus.samReset.appraisal&&'Appraisal'].filter(Boolean).join(' and ')} start over${BAL.ngplus.samReset.stats&&BAL.ngplus.carry?` (he keeps ${Math.round(BAL.ngplus.carry*100)}% of his trained stats)`:''}.<br>`:''}
        <b>Lovers who stay:</b> ${lovers.length ? lovers.map(w=>`${esc(w.name)}${NGS.perks[w.id]?` (${esc(NGS.perks[w.id])})`:''}${ngRomance(NGS,w)==='reset'?' ↺ starting over':' ♥ still his lover'}`).join(', ') + '. They draw wages again (' + Math.round((BAL.ngplus.rebornWage||0)*100) + '% more for each life carried over); their skills, popularity, trust and lewdness start over, keeping ' + carryTxt() + ' of the skills and stats they\'d built (Reincarnated makes the climb back faster). A lover starting over begins her story with Sam again at the first chapter, firsts included.' : 'none. Only Devoted lovers come along.'}<br>
        ${residents.length?`<b>Back with their houses:</b> ${residents.map(w=>esc(w.name)).join(', ')}. They start over like the lovers (no perk), with a Reincarnated stack and the same wage rise.<br>`:''}
        ${friends.length?`<b>Old friends:</b> ${friends.map(w=>esc(w.name)).join(', ')}. They'll look Sam up again (Recruit), with a Reincarnated stack, keeping ${carryTxt()} of what they'd built and asking ${Math.round((BAL.ngplus.rebornWage||0)*100)}% more pay per life.<br>`:''}
        ${lanternCarryCandidates().length ? `<b>Anael (Lantern Angel):</b> ${ngLanternChoice(NGS,'anael')==='reset' ? '↺ starts fresh with her Quiet Lamp vows restored (Lantern pictures stay saved).' : '🕯️ carries her Lantern Angel form into the next cycle.'}<br>` : ''}
        ${genFriends.length?`<b>Favorite old friends (up to ${maxGen}):</b> ${genFriends.map(w=>`<button class="sm" onclick="toggleFavorite('${w.id}')">${w.favorite?'★':'☆'} ${esc(w.name)}</button>`).join(' ')} <span class="muted">(favorited generic ladies at max trust reincarnate into Recruit, max ${maxGen} after cycle ${maxGen})</span><br>`:''}
        <b>Leaving:</b> ${leaving.length ? `${leaving.length} ladies (${leaving.slice(0,8).map(w=>esc(w.name)).join(', ')}${leaving.length>8?', …':''}). Named ones can be met again, fresh.` : 'no one.'}<br>
        ${NGS.house?`<b>New house:</b> ${esc(HOUSES[NGS.house].name)} with ${esc((NAMED[HOUSES[NGS.house].npc]||{}).name||'its resident')}.<br>`:''}
        ${NGS.past&&NGS.past!=='none'?`<b>Another past life:</b> ${esc(PASTS[NGS.past].label)}.<br>`:''}
        <b>Reincarnated:</b> every lady who stays gains a stack (faster trust, lewdness, skill and stat growth; wages ${Math.round((BAL.ngplus.rebornWage||0)*100)}% higher per stack).<br>
        <b>Sam:</b> max energy ${100 + (BAL.sam.energyPerCycle||0)*(N.cycle-1)}. <b>Higher ceiling:</b> stats and skills reach ${BAL.ngplus.cap.base + BAL.ngplus.cap.perCycle*(N.cycle-1)} (Sam's ${(BAL.ngplus.cap.base + BAL.ngplus.cap.perCycle*(N.cycle-1))/SKL}).<br>
        <b>Challenge:</b> ${esc(ch.label||'Standard Cycle')}.<br>
        <b>New:</b> ${NGS.partner&&NGS.partner!=='none'?`${esc(NAMED[NGS.partner].name)} at Sam's side`:'no new partner'}${NGS.boon?`. Perk: <b>${NG_BOONS[NGS.boon].label}</b>`:''}. ✦ houses (and more) can be bought during the cycle.<br>
        ${N.sold.length?`<b>${N.sale?'Sold to the Credit House':'Surrendered to the Credit House'}:</b> ${N.sold.map(h=>esc(h.name)).join(', ')}${N.sale?` (${fmt(N.sale)}, off the debt)`:''}.<br>`:''}
        <b>Debt:</b> ${fmt(N.debt)} (${esc(HDo.name)} ${fmt(N.base)} + improvements ${fmt(N.extra)}${N.keptExtra?` + ${N.keptCount} kept houses ${fmt(N.keptExtra)}`:''}${N.loverExtra?` + ${N.loverCount} lovers ${fmt(N.loverExtra)}`:''}${N.house?` + ${esc(HOUSES[NGS.house].name)} ${fmt(N.house)}`:''}${N.scaleMul>1?`, scaled ×${N.scaleMul.toFixed(2)}`:''})${N.sale?`, minus ${fmt(N.sale)} for the sold houses`:''}, due over ${ngPlan(N.cycle).payments*BAL.debt.every} weeks.<br>
        ${N.loverCount && BAL.wardrobe.cut.perLover ? `<b>Profit cuts:</b> paid ladies' baseline ${Math.round((Math.min(BAL.wardrobe.cut.maxBase, BAL.wardrobe.cut.base + Math.max(0, N.cycle - 1) * BAL.wardrobe.cut.perCycle) + N.loverCount * BAL.wardrobe.cut.perLover) * 100)}% (+${Math.round(BAL.wardrobe.cut.perLover*100)}% per lover you bring back).<br>` : ''}
        <b>Purse:</b> ${fmt(N.purse)} (starting purse; your savings stay behind)</div>`;
    }
    ok = true;
  }
  modal(`${nav}${body}<div class="row" style="margin-top:12px">${st>0?'<button onclick="ngNav(-1)">← Back</button>':'<button onclick="NGS=null;closeModal()">Not yet</button>'}${st<steps.length-1?`<button class="primary" onclick="ngNav(1)" ${ok?'':'disabled'}>Next →</button>`:`<button class="primary" onclick="ngBegin()">${NGS.ngpp ? `Begin NG++${ngNumbers(NGS.boon).ngppCycle}` : 'Begin New Game+'}</button>`}</div>`, {lock:true, wide:true});
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
  if(isLanternAngel(w)){
    w.lewd = Math.max(w.lewd, ((BAL.svc && BAL.svc.angel && BAL.svc.angel.lanternLewd) ?? 60));
    if(w.key==='anael') applyLanternAnael(w);
  } else if(w.race==='angel'){
    delete w.lanternDecided; delete w.lanternHeld;
  }
  w.lust = Math.min(w.lust||0, LUST_EAGER);
  w.popularity = 0; w.arcWk = 0; w.afterWk = 0;   // epilogue progress (w.after) stays across lives
  w.earnedLast = 0; w.purse = 0; w.energy = maxEnergy(w);
  w.health = 100; w.mood = Math.max(w.mood || 0, 70);
  w.neglect = 0; w._samTime = 0; w.unhappy = 0; w.firstHold = 0;
  delete w.intimWk; delete w.rekindleWk; delete w.exLover;
  delete w._again; delete w._stud; delete w._giftWk; delete w._giftN; delete w._bed;
  if(w.job === 'guild') w.job = (w.gPrev && w.gPrev !== 'guild') ? w.gPrev : 'rest';
  if(w.job === 'rest' && w.prevJob) w.job = w.prevJob;
  delete w.prevJob; delete w.idleRest; delete w.standIn; delete w.gc; delete w.gPrev;
  if(Array.isArray(w.menu)) w.menu = w.menu.filter(a=>canClient(w,a));
  w.tutor = null; delete w.tutorTier;
}
// Past lives of named ladies (S.lives[key]): what she'd built and how many Reincarnated stacks she has.
//  - At a New Game+ every named lady who walks away is remembered as having lived a life (rememberLife(w)): when she
//    comes back later (her house bought again, a story join, a walk-in) she returns like a resident whose house was
//    kept: ngReset from that snapshot + one more stack.
//  - A reincarnated lady who leaves mid-cycle (stashCloset) is remembered as the same life (rememberLife(w, true)):
//    she comes back as she left, stacks and all, no new stack.
// rebirthNamed(n, newLife): newLife forces a new life even for a same-life entry (a kept house's resident recreated at NG+).
const lifeOf = (w, same, opts={}) => ({name:w.name, reborn: opts.reborn!==undefined ? opts.reborn : (w.reborn||0), same: !!same, needsReset: !!opts.needsReset,
  wasLover: !!(w.wasLover || opts.wasLover), after: w.after || 0, reMet: opts.reMet!==undefined ? opts.reMet : (w.reMet||0), ngPerks: (w.ngPerks||[]).slice(),
  sub: opts.sub !== undefined ? opts.sub : (w.sub || ''), lantern: opts.lantern !== undefined ? !!opts.lantern : !!w.lantern,
  stats: Object.assign({}, w.stats), tech: Object.assign({}, w.tech),
  acts: Object.fromEntries(Object.entries(w.acts||{}).map(([k,a])=>[k, a.skill||0])), titles: (w.titles||[]).slice(), titleId: w.titleId || null,
  romance: opts.romance !== undefined ? opts.romance : romanceOf(w)});
// Named ladies keep their story with Sam across lives: arc chapter, firsts (intimacy stage), the counters her arc checks,
// Devoted, and an Oblivious her arc removed. Non-partners (house residents, story joiners, guild ladies, guests) always do;
// partners only in NG+ (in NG++ they come back through the memory tiers and their romance starts over).
// The first NG++ clears every saved romance once (with the house stories); NG++ lovers are remembered without one.
const keepsRomance = (w, restoring) => !!(w && w.key && NAMED[w.key]) && (NAMED[w.key].role !== 'partner' || !(restoring && (S.ngppCycle||0) > 0));
function romanceOf(w){
  if(!keepsRomance(w)) return null;
  const D = NAMED[w.key];
  return {arc: w.arc||0, intim: w.intim||0, privateCount: w.privateCount||0, dates: w.dates||0, devoted: has(w,'Devoted'),
    noOblivious: (D.traits||[]).includes('Oblivious') && !has(w,'Oblivious')};
}
function restoreRomance(n, R){
  if(!R || !keepsRomance(n, true)) return;
  if(ARCS[n.key]) n.arc = Math.max(n.arc||0, R.arc||0);
  n.intim = Math.max(n.intim||0, R.intim||0);
  n.privateCount = Math.max(n.privateCount||0, R.privateCount||0); n.dates = Math.max(n.dates||0, R.dates||0);
  if(R.devoted && !has(n,'Devoted')) n.traits.push('Devoted');
  if(R.noOblivious) n.traits = n.traits.filter(t=>t!=='Oblivious');
}
function rememberLife(w, same, into, opts){
  if(!w || !w.key || !NAMED[w.key]) return;
  const T = into || S; T.lives = T.lives || {};
  T.lives[w.key] = lifeOf(w, same, opts);
}
function rebirthNamed(n, newLife){
  const L = n && n.key && S.lives && S.lives[n.key]; if(!L) return n;
  STAT_KEYS.forEach(k=>{ if(L.stats[k]!==undefined) n.stats[k] = L.stats[k]; });
  TECH_KEYS.forEach(k=>{ if(L.tech[k]!==undefined) n.tech[k] = L.tech[k]; });
  Object.entries(L.acts||{}).forEach(([k,v])=>{ if(n.acts && n.acts[k]) n.acts[k].skill = v; });
  n.reborn = L.reborn;
  if(L.reMet!==undefined) n.reMet = L.reMet;
  if(L.sub==='lantern' || L.lantern){ n.sub = 'lantern'; n.lantern = true; n.lanternDecided = true; }
  if(!L.same || newLife){ ngReset(n); n.reborn = L.needsReset ? L.reborn : L.reborn + 1; }
  if(isLanternAngel(n)){
    n.lewd = Math.max(n.lewd, ((BAL.svc && BAL.svc.angel && BAL.svc.angel.lanternLewd) ?? 60));
    if(n.key==='anael') applyLanternAnael(n);
  }
  if(L.ngPerks && L.ngPerks.length) n.ngPerks = Array.from(new Set([...(n.ngPerks||[]), ...L.ngPerks]));
  if(L.wasLover) n.wasLover = true;
  if(L.after) n.after = Math.max(n.after || 0, L.after);
  restoreRomance(n, L.romance);
  if(L.titles && L.titles.length){ n.titles = [...new Set([...(n.titles||[]), ...L.titles])]; if(L.titleId) n.titleId = L.titleId; syncTitles(n); }
  n.energy = maxEnergy(n);
  if(!n.free) n.wage = wageFor(n);
  if(n.wasLover) n.signing = 0;
  delete S.lives[n.key];
  return n;
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
function ngCycleReset(){
  S.samWeek = {security:0, books:false, income:0, acts:[], focus:null, focusEff:0};
  S.won = false; S.over = false; S.lastReport = null; EVQ = []; delete S.ngSeed; delete S.wonWk;
  S.lingerSeen = []; delete S.lingerRecallWk;
  S.flags = S.flags || {};
  S.flags.walkPartners = 0; S.flags.poachCD = 0; S.flags.guestSeen = {};
  delete S.flags.samMovedWk; delete S.flags.sleepInWk; delete S.flags.titleCD; delete S.flags.dejaCD; delete S.flags.familiarCD;
  delete S.luxWk;
  townEvReset(); isoNewCycle(); S.ap = apMax(); S.sam.energy = samMaxEnergy();
  (S.workers||[]).forEach(w=>{ w.energy = maxEnergy(w); });
  (S.alumni||[]).forEach(w=>{ w.energy = maxEnergy(w); });
}
function ngBegin(){
  const C = NGS; if(!C || !C.boon && !Object.keys(NG_BOONS).every(k=>(S.boons||[]).includes(k))) return;
  lingerWake();   // ensure lovers sleeping in the lantern are restored even if ngBegin runs directly
  const B = BAL.ngplus, og = homeHouse(), HDo = HOUSES[og], N = ngNumbers(C.boon, C.house, {ngpp:C.ngpp, challenge:C.challenge}), lovers = carriedLovers(), friends = ngFriends();
  if(lovers.some(w=>!C.perks[w.id] && NG_PERKS().some(t=>!(w.ngPerks||[]).includes(t)))) return;
  // refresh the cycle's NG+ snapshot (first taken at payoff) with everything done since, before the rebirth changes S;
  // cloudSaveMilestone builds the seed synchronously, so only the upload runs after this point
  if(!S.ngSeed && typeof cloudSaveMilestone === 'function') cloudSaveMilestone();
  const gInfo = {weeks: S.week - ((S.debt && S.debt.start) || 0), planned: ((S.debt && S.debt.payments) || BAL.debt.payments) * BAL.debt.every, house: N.ngpp ? N.houseKey : C.house, partner:C.partner, past:C.past, lovers: lovers.map(w=>w.name.split(' ')[0]), ngpp: !!N.ngpp, ngppCycle: N.ngppCycle||0};
  S.ngLovers = N.ngpp ? 0 : lovers.length;   // each carried lover raises paid ladies' baseline cut (wardrobe.cut.perLover)
  S.cycle = N.cycle;   // set first: generics rolled from here on can get ngOnly traits and higher ceilings
  S.boons = S.boons || []; if(C.boon && !S.boons.includes(C.boon)) S.boons.push(C.boon);
  S.challenge = C.challenge && C.challenge!=='none' ? C.challenge : null;
  S.flags = S.flags || {}; S.flags.boughtHouse = false;
  { const T = CYCLE_CHALLENGES.small_troupe || {};   // cycle-long challenge tracking (challengeTrack in random.js); Tight Troupe's cap scales with what carried in
    S.chTrack = {weeks:0, tidy:0, maxStaff:0, cap:(T.base ?? 6) + (T.perLover ?? 1) * (N.loverCount||0) + (T.perHouse ?? 2) * (N.keptCount||0)}; }
  if(ngLanternChoice(C, 'anael')==='reset'){
    S.workers.filter(w=>w.key==='anael' && isLanternAngel(w)).forEach(w=>{ w.sub = ''; w.lantern = false; w.lanternDecided = false; w.lanternHeld = false; w.after = 0; resetLanternAnael(w); });
    if(S.lives && S.lives.anael){ S.lives.anael.sub = ''; S.lives.anael.lantern = false; delete S.lives.anael.after; }
  }

  if(N.ngpp){
    const hk = N.houseKey || 'shrine', HDn = HOUSES[hk];
    S.ngppCycle = N.ngppCycle;
    S.home = hk; S.cur = hk; S.samHome = hk;
    // All prior lovers & workers keep their reincarnated stacks and NG+ perks across NG++, but step out of the roster.
    lovers.forEach(w=>{
      const p = C.perks[w.id]; if(p) w.ngPerks = [...(w.ngPerks||[]), p];
      if(w.key && NAMED[w.key]){
        stashCloset(w);
        rememberLife(w, false, S, {reborn:(w.reborn||0)+1, needsReset:true, wasLover:true, romance:null});
      } else {
        ngReset(w); ngRomanceReset(w); w.reborn = (w.reborn||0) + 1; w.wasLover = true;
        w.free = false; w.isPartner = false; w.locked = null; w.job = 'rest'; w.contract = 12; w.house = hk; w.seen = {}; w.wage = wageFor(w);
        S.alumni = [...(S.alumni||[]), w];
      }
    });
    S.workers.filter(w=>!lovers.includes(w)).forEach(w=>{
      if(w.key && NAMED[w.key]){ stashCloset(w); rememberLife(w); }
      else if(friends.includes(w) || (isVessel(w) && vesselStage(w)>=3)){
        ngReset(w); if(has(w,'Devoted')) ngRomanceReset(w); w.reborn = (w.reborn||0) + 1;
        w.free = false; w.isPartner = false; w.locked = null; w.job = 'rest'; w.contract = 12; w.house = hk; w.seen = {}; w.wage = wageFor(w);
        S.alumni = [...(S.alumni||[]), w];
      }
    });
    (S.alumni||[]).forEach(w=>{ w.house = hk; });
    if(N.ngppCycle === 1){
      S.ngppHouses = {};
      Object.values(S.lives||{}).forEach(L=>{ delete L.romance; delete L.after; });   // the first NG++ resets house stories, so the story ladies' romances and epilogues start over once too
    } else {
      S.ngppHouses = S.ngppHouses || {};
      S.houses.forEach(h=>{ S.ngppHouses[h.id] = snapshotNgppHouse(h); });
    }
    S.builtBy = {};
    const shrine = makeHouse(hk); shrine.ngppLevel = N.ngppCycle; shrine.since = S.week;
    if(N.ngppCycle >= 2 && S.ngppHouses[hk]) restoreNgppHouse(shrine, S.ngppHouses[hk]);
    S.houses = [shrine];
    S.starters = [hk]; S.regulars = []; S.bonds = {}; S.sleepIn = null;
    S.partner = null; S.partners = []; S.candidates = [];
    delete S.autoTutor; S.samUps = {};
    // Sam resets cleanly to Lv 1 (keeping pasts, boons, challenge perks, energy & raised stat ceiling)
    S.sam.lvl = 1; S.sam.xp = 0; S.sam.appraisal = 1; S.sam.appXP = 0;
    Object.entries(BAL.sam.base).forEach(([k,v])=>{ S.sam[k] = clamp(v, 0, samCap()); });
    if(C.past && C.past!=='none' && PASTS[C.past] && !hasPast(C.past)) S.pasts = [...samPasts(), C.past];
    samPasts().forEach(k=>{ if(PASTS[k]) PASTS[k].fx(S.sam); });
    const vessel = createBoundVessel(C.vesselForm || unboundVesselForms()[0] || Object.keys(GOD_FORMS)[0], hk);
    S.workers = [vessel];
    if(hasBoon('renown')){ H(hk).rep = clamp(H(hk).rep + 10); S.rep = clamp(S.rep + 15); } else S.rep = HDn.rep;
    S.gold = N.purse;
    S.debt = Object.assign({total:N.debt, remaining:N.debt, carry:0, strikes:0, start:S.week-1}, ngPlan(N.cycle));
    ngCycleReset();
    refreshCandidates(hasBoon('recruit') ? 3 : 0, hasBoon('recruit') ? 1.15 : 1);
    inviteFriend(true); checkUnlocks(true);
    guildNewCycle(true);   // guild.js: the first NG++ resets the guild once
    addLog(`NG++${N.ngppCycle} (Cycle ${S.cycle}): Sam wakes at ${HDn.name} with an empty vessel and a loan of ${fmt(N.debt)}.`);
    queueNgppIntros(shrine, vessel);
    NGS = null; save(); if(typeof cloudAutoSave === 'function') cloudAutoSave(); TAB = 'house'; render();
    const vane = () => { modal(`<h2>${esc(HDn.name)}</h2><div id="ngVaneImg"></div><p class="story">A quieter knock answers when morning arrives. Marguerite Vane sets down a slim black ledger bearing a new seal. "Back to square one, Mr. Takahashi—at least on paper. The Shrine's rooms scale with what you've endured, and whatever that silent companion is, she's yours to shape."\n\nDebt: ${fmt(N.debt)} over the next ${S.debt.payments*BAL.debt.every} weeks. Room cap: ${houseBaseSize(H(hk))}.</p><div class="row"><button class="primary" onclick="closeModal();runQueue()">Enter ${esc(HDn.name)}</button></div>`, {lock:true}); showImg('ngVaneImg', 'npc_marguerite', 'portrait'); };
    return goddessRebirth(gInfo, vane);
  }

  const keptIds = new Set(S.houses.filter(keptHouse).map(h=>h.id));   // before S.houses is trimmed
  S.home = og;
  // lovers: wages again, perk, reset
  lovers.forEach(w=>{
    const p = C.perks[w.id]; if(p){ w.ngPerks = [...(w.ngPerks||[]), p]; }
    w.isPartner = false; w.free = false; w.contract = 12; if(!keptIds.has(w.house)) w.house = og; if(w.locked && w.locked!==w.house) w.locked = null;
    ngReset(w); if(ngRomance(C, w)==='reset') ngRomanceReset(w); w.reborn = (w.reborn||0) + 1;
    w.wage = wageFor(w); if(w.job!=='rest') w.job = safeJob(w, w.job);
    if(Array.isArray(w.menu)){ w.menu = w.menu.filter(a=>canClient(w,a)); if(MENU_JOBS.includes(w.job) && !w.menu.length) w.menu = getActs().filter(a=>clientStance(w,a.id)==='yes').map(a=>a.id); }
  });
  // residents of kept houses: back with their house, reincarnated (no perk); one freed by her house story stays wage-free
  const residents = ngResidents();
  residents.forEach(w=>{
    const hid = residentHouse(w, keptHouse).id;
    ngReset(w); w.reborn = (w.reborn||0) + 1; w.isPartner = false; w.house = hid; w.locked = hid; w.contract = 999;
    w.wage = w.free ? 0 : wageFor(w); if(w.job!=='rest') w.job = safeJob(w, w.job);
    if(Array.isArray(w.menu)){ w.menu = w.menu.filter(a=>canClient(w,a)); if(MENU_JOBS.includes(w.job) && !w.menu.length) w.menu = getActs().filter(a=>clientStance(w,a.id)==='yes').map(a=>a.id); }
  });
  // everyone else leaves; named ladies go back to their pools, fresh (isHired is false for them again)
  const ids = new Set([...lovers, ...residents].map(w=>w.id));
  friends.forEach(w=>{   // old friends wait in S.alumni; hire() sets job, contract, house and seen when she is signed again
    ngReset(w); w.reborn = (w.reborn||0) + 1; w.free = false; w.isPartner = false; w.locked = null; w.job = 'rest'; w.contract = 12; w.house = og; w.seen = {}; w.wage = wageFor(w);
  });
  S.alumni = [...(S.alumni||[]), ...friends];
  S.workers.filter(w=>!ids.has(w.id) && !friends.includes(w)).forEach(w=>{ stashCloset(w); rememberLife(w); });   // the ones walking away keep their clothes for next time
  S.workers = [...lovers, ...residents]; S.candidates = [];
  if(S.sleepIn && !S.workers.some(w=>w.id===S.sleepIn)) S.sleepIn = null;
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
  // kept houses keep rooms, upgrades and story; their popularity goes back to the house's starting value plus ngplus.carry of what it had gained; auto-feasts and auto-tutors reset
  S.houses.forEach(h=>{ const D = HOUSES[h.id]; if(D){ h.rep = Math.round(D.rep + (B.carry||0) * Math.max(0, (h.rep||0) - D.rep)); const dp = D.prestige ?? 50; h.prestige = clamp(Math.round(dp + (B.carry||0) * ((h.prestige ?? dp) - dp))); } h.tidy = BAL.tidy.start; delete h.autoFeast; delete h.feastWk; delete h.lastFlow; });
  delete S.autoTutor;
  // each kept house's resident comes with the house: if she wasn't working for Sam she's back, fresh
  S.houses.forEach(h=>{ const D = HOUSES[h.id]; if(D && D.npc && !isHired(D.npc)){ const npc = rebirthNamed(makeNamed(D.npc), true); npc.house = h.id; npc.locked = h.id; npc.contract = 999; assignStart(npc, NAMED[D.npc].job); S.workers.push(npc); } restoreStoryJoin(h, true); });
  S.cur = og;
  // the new house and its resident
  if(C.house && HOUSES[C.house] && !H(C.house)){
    const D = HOUSES[C.house]; S.houses.push(makeHouse(C.house)); H(C.house).since = S.week; S.starters = [...(S.starters||[]), C.house];
    if(!isHired(D.npc)){ const n = rebirthNamed(makeNamed(D.npc)); n.house = C.house; n.locked = C.house; n.contract = 999; assignStart(n, NAMED[D.npc].job); S.workers.push(n); }
  }
  // another past life
  if(C.past && C.past!=='none' && PASTS[C.past] && !hasPast(C.past)){ S.pasts = [...samPasts(), C.past]; PASTS[C.past].fx(S.sam); }
  if(C.partner && C.partner!=='none'){
    const p = rebirthNamed(makeNamed(C.partner, true)); p.house = og;
    if(hasBoon('devotion')){ p.trust = clamp(p.trust+15); p.lewd = clamp(p.lewd+10); }
    S.workers.push(p); assignStart(p, ['courtesan','bartender','dancer','bath'].includes(NAMED[C.partner].job) ? NAMED[C.partner].job : 'courtesan');
    S.partner = C.partner;
  }
  S.partners = Array.from(new Set([...(S.partners||[]).filter(k=>S.workers.some(w=>w.key===k)), ...(C.partner && C.partner!=='none' ? [C.partner] : [])]));
  const h0 = H(og); if(hasBoon('renown')) h0.rep = clamp(h0.rep + 10);
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
  if(hasBoon('renown')) S.rep = clamp(S.rep + 15);
  S.gold = N.purse;
  S.debt = Object.assign({total:N.debt, remaining:N.debt, carry:0, strikes:0, start:S.week-1}, ngPlan(N.cycle));
  ngCycleReset();
  refreshCandidates(hasBoon('recruit') ? 3 : 0, hasBoon('recruit') ? 1.15 : 1);
  inviteFriend(true);   // the first week already shows an old friend
  checkUnlocks(true);
  guildNewCycle(false);   // guild.js: Sam keeps his rank; the rank's people come back as candidates
  addLog(`New Game+ (cycle ${S.cycle}): Sam keeps ${HDo.name} and takes on a new debt of ${fmt(N.debt)}.`);
  queueNgPlusIntros(C.house && H(C.house), C.partner && C.partner!=='none' ? S.workers.find(w=>w.key===C.partner) : null);
  NGS = null; save(); if(typeof cloudAutoSave === 'function') cloudAutoSave(); TAB = 'house'; render();
  const vane = () => { modal(`<h2>${esc(HDo.name)}</h2><div id="ngVaneImg"></div><p class="story">Marguerite Vane slides a fresh contract across the desk. "Paying off one house was impressive, Mr. Takahashi. Let's see you do it again, with a little less sentiment." She almost smiles again. It's starting to worry you.\n\nYou keep ${esc(HDo.name)}${C.house?`, take on ${esc(HOUSES[C.house].name)}`:''}${lovers.length?` with ${lovers.map(w=>esc(w.name)).join(', ')}`:''}. Everyone else has gone their own way. The new debt is ${fmt(N.debt)}, due over the next ${S.debt.payments*BAL.debt.every} weeks.</p><div class="row"><button class="primary" onclick="closeModal();runQueue()">Continue</button></div>`, {lock:true}); showImg('ngVaneImg', 'npc_marguerite', 'portrait'); };
  goddessRebirth(gInfo, vane);
}
