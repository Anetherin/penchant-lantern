'use strict';
/* =====================================================================
   SPENDING: paid tutors and bought gifts (balance.json → tutor, gifts)
   ===================================================================== */
const cycleMul = per => 1 + (per || 0) * Math.max(0, ((S && S.cycle) || 1) - 1);

/* ---------- Tutoring: a weekly fee per lady, no actions ---------- */
// w.tutor = null | 'weak' | 'job' (focus), w.tutorTier = a key of tutor.tiers (default the first).
const TUTOR_FOCUS = {weak:'Weakest areas', job:'Her job'};
const tutorTier = w => { const T = BAL.tutor.tiers; return T[w.tutorTier] ? w.tutorTier : Object.keys(T)[0]; };
const tutorCost = (w, tier) => Math.round(BAL.tutor.cost * BAL.tutor.tiers[tier || tutorTier(w)].cost * cycleMul(BAL.tutor.perCycle));
// What a week of lessons covers: {stats: [[key, weight]], skills: [[key, mult]], svcs: [service ids]}
function tutorPlan(w, focus){
  const T = BAL.tutor;
  if((focus || w.tutor) === 'weak'){
    const st = STAT_KEYS.slice().sort((a,b)=>statOf(w,a)-statOf(w,b)).slice(0, T.weakStats).map(k=>[k,1]);
    const sk = TECH_KEYS.slice().sort((a,b)=>(w.tech[a]||0)-(w.tech[b]||0)).slice(0, T.weakSkills).map(k=>[k,1]);
    return {stats:st, skills:sk, svcs:[]};
  }
  const main = trainSkillOf(w), oth = broadJob(w) ? (BAL.train.broad.skillOthers ?? 0.6) : T.others;
  return {stats:trainStatsOf(w), skills:TECH_KEYS.map(k=>[k, k===main ? 1 : oth]),
    svcs: MENU_JOBS.includes(w.job) ? (w.menu||[]).filter(id=>w.acts[actKey(id)]) : []};
}
const tutorSummary = w => { const p = tutorPlan(w);
  return [p.stats.map(([k])=>cap(k)).join(', '), p.skills.filter(([,m])=>m>=1).map(([k])=>TECH_LABEL[k]).join(', '), p.svcs.length ? p.svcs.map(actLabel).join(', ') : ''].filter(Boolean).join(' · '); };
function setTutor(id, v){ const w = findW(id); if(!w) return; w.tutor = TUTOR_FOCUS[v] ? v : null; save(); render(); refreshSheetInfo(); }
function setTutorTier(id, v){ const w = findW(id); if(!w || !BAL.tutor.tiers[v]) return; w.tutorTier = v; save(); render(); refreshSheetInfo(); }
function tutorRow(w){
  if(!S.workers.includes(w)) return '';
  const T = BAL.tutor, tiers = Object.entries(T.tiers);
  return `<div class="row" title="A paid tutor works with her every week: no actions needed. The fee is paid at the end of the week (skipped if the purse can't cover it).">📚 Tutoring <select onchange="setTutor('${w.id}',this.value)"><option value="">None</option>${Object.entries(TUTOR_FOCUS).map(([k,l])=>`<option value="${k}" ${w.tutor===k?'selected':''}>${l}</option>`).join('')}</select>
    <select onchange="setTutorTier('${w.id}',this.value)">${tiers.map(([k,t])=>`<option value="${k}" ${tutorTier(w)===k?'selected':''}>${esc(t.label)} · ${fmt(tutorCost(w,k))}/wk</option>`).join('')}</select>
    ${w.tutor ? `<span class="muted">${esc(tutorSummary(w))}</span>` : ''}</div>`;
}
// Tutoring for a whole group at once (Sam tab → Management). Groups follow the roster order (rosterRank in ui/core.js), plus houses and jobs.
let TUT_ALL = null;
function tutorGroups(){
  const G = [['all','Everyone'],['perm','Permanent: story characters & guests'],['story','Story: house ladies, partners & other story characters'],['r0','House ladies'],['r1','Partners'],['r2','Other story characters'],['r3','Guests'],['r4','Generic ladies']];
  if(S.houses.length > 1) S.houses.forEach(h=>G.push(['h:'+h.id, 'Everyone at '+h.name]));
  [...new Set(S.workers.map(w=>w.job))].filter(j=>JOBS[j]).forEach(j=>G.push(['j:'+j, 'Job: '+JOBS[j].label]));
  return G;
}
function tutorGroupMatch(w, g){
  return (!g.includes(':') && rosterTypeIs(w, g)) || (g.startsWith('h:') && w.house===g.slice(2)) || (g.startsWith('j:') && w.job===g.slice(2));
}
function tutorGroupList(g){ return S.workers.filter(w=>tutorGroupMatch(w, g)); }
function applyAutoTutor(w){
  const A = S && S.autoTutor; if(!A || !A.on || !TUTOR_FOCUS[A.focus]) return;
  if(tutorGroupMatch(w, A.g || 'all')){ w.tutor = A.focus; if(BAL.tutor.tiers[A.tier]) w.tutorTier = A.tier; }
}
function tutorAllMenu(){
  const cur = (S && S.autoTutor) || {};
  TUT_ALL = TUT_ALL || {g: cur.g || 'all', focus: cur.focus || 'job', tier: cur.tier || Object.keys(BAL.tutor.tiers)[0], auto: !!cur.on};
  tutorAllDraw();
}
function tutorAllSet(k, v){ if(!TUT_ALL) return; TUT_ALL[k] = v; tutorAllDraw(); }
function tutorAllDraw(){
  const A = TUT_ALL, list = tutorGroupList(A.g), T = BAL.tutor, on = S.workers.filter(w=>TUTOR_FOCUS[w.tutor]);
  const sel = (k, opts) => `<select onchange="tutorAllSet('${k}',this.value)">${opts.map(([v,l])=>`<option value="${v}" ${A[k]===v?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
  const cost = A.focus ? list.reduce((a,w)=>a + tutorCost(w, A.tier), 0) : 0;
  modal(`<h2>📚 Tutoring for everyone</h2><p class="muted">Sets the same tutor for a whole group (you can still change each lady on her sheet). Fees are paid at the end of each week; a lady is skipped if the purse can't cover her.</p>
    <div class="row"><label>Who ${sel('g', tutorGroups())}</label></div>
    <div class="row"><label>Focus ${sel('focus', [['','None (stop tutoring)'], ...Object.entries(TUTOR_FOCUS)])}</label>
      <label>Tutor ${sel('tier', Object.entries(T.tiers).map(([k,t])=>[k, t.label]))}</label></div>
    <label class="chk"><input type="checkbox" ${A.auto?'checked':''} onchange="tutorAllSet('auto',this.checked)"> Apply these tutor settings to new recruits automatically</label>
    <p>${list.length ? list.map(w=>esc(w.name.split(' ')[0])).join(', ') : '<span class="muted">Nobody in this group.</span>'}</p>
    <p class="muted">${A.focus ? `${list.length} lad${list.length===1?'y':'ies'} · ${fmt(cost)}/wk for this group.` : 'Their tutoring stops.'} Right now ${on.length} lad${on.length===1?'y has':'ies have'} a tutor (${fmt(on.reduce((a,w)=>a+tutorCost(w),0))}/wk).</p>
    <div class="row"><button class="primary" ${list.length||A.auto!==!!(S.autoTutor&&S.autoTutor.on)?'':'disabled'} onclick="tutorAllApply()">Apply</button><button onclick="TUT_ALL=null;closeModal()">Back</button></div>`);
}
function tutorAllApply(){
  const A = TUT_ALL; if(!A) return; const list = tutorGroupList(A.g);
  list.forEach(w=>{ w.tutor = TUTOR_FOCUS[A.focus] ? A.focus : null; if(BAL.tutor.tiers[A.tier]) w.tutorTier = A.tier; });
  S.autoTutor = A.auto && TUTOR_FOCUS[A.focus] ? {on:true, g:A.g, focus:A.focus, tier:A.tier} : null;
  toast(A.focus ? `Tutors booked for ${list.length} lad${list.length===1?'y':'ies'}${S.autoTutor?' (and new recruits)':''}.` : `Tutoring stopped for ${list.length} lad${list.length===1?'y':'ies'}.`);
  TUT_ALL = null; save(); closeModal(); render();
}
// Run from endWeek after the purse is settled. Pays each lady's tutor if it can, applies the week's lessons.
function tutorWeek(R){
  const T = BAL.tutor, taught = [], skipped = [];
  R.tutor = 0;
  S.workers.filter(w=>TUTOR_FOCUS[w.tutor]).forEach(w=>{
    const tier = tutorTier(w), cost = tutorCost(w, tier), pr = R.per[w.id];
    if(S.gold < cost){ skipped.push(w.name); return; }
    S.gold -= cost; R.tutor += cost;
    const p = tutorPlan(w), m = T.tiers[tier].gain * fxMul(w,'learn') * pm(w,'train');
    p.stats.forEach(([k,wt])=>statXP(w, k, T.stat * wt * m));
    p.skills.forEach(([k,mul])=>grow(w, k, T.skill * mul * m));
    p.svcs.forEach(id=>growAct(w, id, T.svc * m));
    w.energy = clamp(w.energy - (T.herEnergy||0), 0, energyCap(w)); countUp(w, 'lessons');
    if(pr){ pr.tutor = cost; (pr.notes = pr.notes||[]).push(flavor('tutor_note', w, {tutor: T.tiers[tier].label.toLowerCase()})); }
    taught.push(w.name);
  });
  if(taught.length) R.lines.push(`📚 Tutors worked with ${taught.join(', ')} (${fmt(R.tutor)}).`);
  if(skipped.length) R.lines.push(`📚 Not enough gold for ${skipped.join(', ')}'s tutor${skipped.length>1?'s':''} this week.`);
}

/* ---------- Gifts: gold for trust, repeatable ---------- */
// Before the debt is paid: gifts.beforeDebt = 'locked' | 'action' (each costs one of Sam's actions) | 'free'.
const giftMode = () => (S.won || S.debt.remaining <= 0) ? 'free' : (BAL.gifts.beforeDebt || 'locked');
const giftsThisWeek = w => w._giftWk === S.week ? (w._giftN||0) : 0;
const giftCost = (w, k) => Math.round(BAL.gifts.tiers[k].cost * Math.pow(BAL.gifts.weekMul ?? 2, giftsThisWeek(w)) * cycleMul(BAL.gifts.perCycle));
function giftMenu(id){
  const w = findW(id); if(!w) return;
  const G = BAL.gifts, mode = giftMode(), n = giftsThisWeek(w);
  if(mode==='locked') return toast('Buying her gifts opens up once the debt is paid off.');
  const cap = houseTrustCap(w) < 100 && w.trust >= houseTrustCap(w);
  modal(`<h2>A Gift for ${esc(titled(w))}</h2><p class="muted">Trust ${tShow(w.trust)}${cap ? ` <span class="warn">(held at ${tShow(houseTrustCap(w))} until her house's story moves on)</span>` : ''} · Mood ${Math.round(w.mood)}${n ? ` · ${n} gift${n>1?'s':''} this week (each one more this week costs ×${G.weekMul ?? 2})` : ''}${mode==='action' ? ` · each gift takes one of Sam's actions (${G.energy} energy)` : ''}</p>
    <div class="row">${Object.entries(G.tiers).map(([k,t])=>{ const c = giftCost(w,k); return `<button onclick="buyGift('${w.id}','${k}')" ${S.gold<c?'disabled':''}>${esc(t.label)} · ${fmt(c)}</button>`; }).join('')}</div>
    <div class="row"><button onclick="openSheet('${w.id}')">Back</button></div>`);
}
// One gift: pays, counts toward this week's markup, trust (through gainTrust, so house gates hold) and mood.
function giftCore(w, k, cost){
  const G = BAL.gifts, t = G.tiers[k];
  S.gold -= cost;
  if(w._giftWk !== S.week){ w._giftWk = S.week; w._giftN = 0; } w._giftN++;
  const m = pm(w,'gift') * (has(w,'Greedy') ? G.greedy : 1);
  const tg = gainTrust(w, t.trust * m); moodAdd(w, Math.round(t.mood * m)); w.mood = clamp(w.mood);
  countUp(w, 'gifts');
  return {tg, m};
}
// Gifts for a whole group (Sam tab → Management), same groups as group tutoring. Skips ladies at max trust or held by their house's story.
let GIFT_ALL = null;
const giftRoom = w => w.trust < Math.min(100, houseTrustCap(w));
function giftAllMenu(){
  if(giftMode()==='locked') return toast('Buying gifts opens up once the debt is paid off.');
  GIFT_ALL = GIFT_ALL || {g:'all', tier:Object.keys(BAL.gifts.tiers)[0]}; giftAllDraw();
}
function giftAllSet(k, v){ if(!GIFT_ALL) return; GIFT_ALL[k] = v; giftAllDraw(); }
function giftAllDraw(){
  const A = GIFT_ALL, G = BAL.gifts, group = tutorGroupList(A.g), list = group.filter(giftRoom), full = group.length - list.length;
  const sel = (k, opts) => `<select onchange="giftAllSet('${k}',this.value)">${opts.map(([v,l])=>`<option value="${v}" ${A[k]===v?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
  const cost = list.reduce((a,w)=>a + giftCost(w, A.tier), 0);
  modal(`<h2>🎁 Gifts for everyone</h2><p class="muted">Buys the same gift for every lady in the group who can still grow closer to Sam (not at max trust and not held back by her house's story). Each extra gift for a lady this week costs ×${G.weekMul ?? 2}.${giftMode()==='action' ? ` Takes one of Sam's actions (${G.energy} energy).` : ''}</p>
    <div class="row"><label>Who ${sel('g', tutorGroups())}</label><label>Gift ${sel('tier', Object.entries(G.tiers).map(([k,t])=>[k, t.label]))}</label></div>
    <p>${list.length ? list.map(w=>`${esc(w.name.split(' ')[0])} <span class="muted">(${tShow(w.trust)})</span>`).join(', ') : '<span class="muted">Nobody in this group has room to grow.</span>'}</p>
    <p class="muted">${list.length} lad${list.length===1?'y':'ies'} · ${fmt(cost)} total${full ? ` · ${full} skipped (max trust or held by her house)` : ''}${S.gold < cost ? ' · <span class="warn">not enough gold for all: gifts go out in roster order until the purse runs out</span>' : ''}</p>
    <div class="row"><button class="primary" ${list.length && S.gold >= giftCost(list[0], A.tier) ? '' : 'disabled'} onclick="giftAllApply()">Buy gifts</button><button onclick="GIFT_ALL=null;closeModal()">Back</button></div>`);
}
function giftAllApply(){
  const A = GIFT_ALL; if(!A) return; const G = BAL.gifts, t = G.tiers[A.tier];
  if(giftMode()==='locked') return toast('Buying gifts opens up once the debt is paid off.');
  const list = tutorGroupList(A.g).filter(giftRoom); if(!list.length) return;
  if(giftMode()==='action' && !useAP(G.energy)) return;
  let spent = 0, trust = 0; const got = [], short = [];
  list.forEach(w=>{ const c = giftCost(w, A.tier); if(S.gold < c){ short.push(w.name.split(' ')[0]); return; }
    const {tg} = giftCore(w, A.tier, c); spent += c; trust += tg; got.push(w.name.split(' ')[0]); });
  if(got.length) samLog(`Bought gifts (${t.label.toLowerCase()}) for ${got.length} lad${got.length===1?'y':'ies'}`);
  checkUnlocks(); GIFT_ALL = null; save(); render();
  modal(`<h2>🎁 ${esc(t.label)} for everyone</h2><p>${got.length ? `Sam hands out gifts to ${got.join(', ')}.` : 'Nobody got a gift.'}</p><p class="muted">−${fmt(spent)} · Trust ${tDelta(trust)} in total${short.length ? ` · <span class="warn">ran out of gold before ${short.join(', ')}</span>` : ''}</p>
    <div class="row"><button class="primary" onclick="closeModal()">OK</button></div>`);
}
function buyGift(id, k){
  const w = findW(id), G = BAL.gifts, t = G.tiers[k]; if(!w || !t) return;
  const mode = giftMode(), cost = giftCost(w, k);
  if(mode==='locked') return toast('Buying her gifts opens up once the debt is paid off.');
  if(S.gold < cost) return toast('Not enough gold.');
  if(mode==='action' && !useAP(G.energy)) return;
  const {tg, m} = giftCore(w, k, cost);
  samLog(`Bought ${w.name} a gift (${t.label.toLowerCase()})`); checkUnlocks();
  const line = flavor('gift_'+k, w, {gift: pick(GIFTS)}) || `Sam buys ${w.name} a gift.`;
  save(); render();
  modal(`<h2>${esc(t.label)} for ${esc(w.name)}</h2><p class="story">${esc(line)}${esc(pNote(w,'gift'))}</p><p class="muted">−${fmt(cost)} · Trust ${tDelta(tg)} · Mood +${Math.round(t.mood*m)}</p>
    <div class="row"><button onclick="giftMenu('${w.id}')">Another gift…</button><button class="primary" onclick="openSheet('${w.id}')">Back to her</button></div>`);
}
let WARDROBE_ALL = null;
function wardrobeGroupList(g){
  if(g==='roster'){
    const base = HOUSE_ALL ? S.workers : S.workers.filter(w=>w.house===curH().id);
    return rosterFiltered(base);
  }
  return tutorGroupList(g);
}
function applyAutoWardrobe(w){
  const a = S.autoWardrobe; if(!a || !a.on || !w) return;
  if(a.cut!==undefined && a.cut!=='keep') w.cut = a.cut==='base' ? 'base' : clamp(+a.cut||0, 0, 0.9);
  if(a.autoDress!==undefined && a.autoDress!=='keep') w.autoDress = a.autoDress==='on';
}
function wardrobeAllMenu(fromRoster){
  if(!S.workers.length) return toast('Hire someone first.');
  const gs = tutorGroups();
  WARDROBE_ALL = { fromRoster:!!fromRoster, group: fromRoster ? 'roster' : ((gs[0]||[])[0]||'all'), cut:'keep', autoDress:'keep', autoNew:!!(S.autoWardrobe&&S.autoWardrobe.on) };
  wardrobeAllDraw();
}
function wardrobeAllSet(k, v){ if(!WARDROBE_ALL) return; WARDROBE_ALL[k]=v; wardrobeAllDraw(); }
function wardrobeAllDraw(){
  const A = WARDROBE_ALL; if(!A) return;
  const gs = tutorGroups(), list = wardrobeGroupList(A.group), basePct = Math.round(baselineCut()*100);
  const gOpts = (A.fromRoster ? `<option value="roster" ${A.group==='roster'?'selected':''}>Current Roster filter (${wardrobeGroupList('roster').length})</option>` : '')
    + gs.map(([id,lbl])=>`<option value="${esc(id)}" ${A.group===id?'selected':''}>${esc(lbl)} (${tutorGroupList(id).length})</option>`).join('');
  const cOpts = `<option value="keep" ${A.cut==='keep'?'selected':''}>Don't change</option><option value="base" ${A.cut==='base'?'selected':''}>Default (${basePct}% paid · 0% free)</option>`
    + BAL.wardrobe.cut.options.map(v=>`<option value="${v}" ${A.cut===String(v)?'selected':''}>${Math.round(v*100)}%</option>`).join('');
  const aOpts = `<option value="keep" ${A.autoDress==='keep'?'selected':''}>Don't change</option><option value="on" ${A.autoDress==='on'?'selected':''}>Yes — picks her own outfits</option><option value="off" ${A.autoDress==='off'?'selected':''}>No — Sam chooses</option>`;
  const names = list.slice(0,8).map(w=>esc(w.name.split(' ')[0])).join(', ') + (list.length>8 ? ` +${list.length-8} more` : '');
  const canApply = list.length > 0 && (A.cut!=='keep' || A.autoDress!=='keep');
  modal(`<h2>👗 Profit cuts &amp; wardrobe autonomy</h2><p class="muted">Set profit cuts and self-dressing for a whole group at once. Paid workers' baseline is <b>${basePct}%</b> this cycle (+${Math.round(BAL.wardrobe.cut.perCycle*100)}% per NG+ cycle up to ${Math.round(BAL.wardrobe.cut.maxBase*100)}%); partners and free workers default to 0%. Ladies spend their cut each week on outfits, massages, treats, lessons, grooming, or sending it home.</p>
    <div class="row" style="margin:10px 0">Who <select onchange="wardrobeAllSet('group',this.value)">${gOpts}</select></div>
    <div class="row" style="margin:6px 0">Profit cut <select onchange="wardrobeAllSet('cut',this.value)">${cOpts}</select></div>
    <div class="row" style="margin:6px 0">Chooses own outfits <select onchange="wardrobeAllSet('autoDress',this.value)">${aOpts}</select></div>
    <label class="row" style="margin:8px 0"><input type="checkbox" ${A.autoNew?'checked':''} onchange="wardrobeAllSet('autoNew',this.checked)"> Also apply these defaults to newly hired ladies</label>
    <p class="muted">${list.length ? `${list.length} lad${list.length===1?'y':'ies'}: ${names}` : 'No one matches this group.'}</p>
    <div class="row"><button class="primary" onclick="wardrobeAllApply()" ${canApply?'':'disabled'}>Apply</button><button onclick="WARDROBE_ALL=null;closeModal()">Cancel</button></div>`);
}
function wardrobeAllApply(){
  const A = WARDROBE_ALL; if(!A) return;
  const list = wardrobeGroupList(A.group);
  list.forEach(w=>{
    if(A.cut!=='keep') w.cut = A.cut==='base' ? 'base' : clamp(+A.cut||0, 0, 0.9);
    if(A.autoDress!=='keep') w.autoDress = A.autoDress==='on';
  });
  if(A.autoNew && (A.cut!=='keep' || A.autoDress!=='keep')){
    S.autoWardrobe = Object.assign({on:true}, S.autoWardrobe||{}, A.cut!=='keep'?{cut:A.cut}:{}, A.autoDress!=='keep'?{autoDress:A.autoDress}:{});
    S.autoWardrobe.on = true;
  } else if(!A.autoNew && S.autoWardrobe){ S.autoWardrobe.on = false; }
  WARDROBE_ALL = null; save(); render(); refreshSheetInfo(); closeModal();
  toast(`Updated wardrobe & cut settings for ${list.length} lad${list.length===1?'y':'ies'}.`);
}

/* ---------- Luxuries (balance.json → luxury): money sinks once the debt is paid ---------- */
// Each one doubles in price with every purchase in the same week (house items count per house). span:'cycle' (the tonic)
// keeps counting until the next rebirth instead (S.luxCyc, keyed by S.cycle).
const luxOpen = () => !debtOpen();
const luxSpanCycle = k => ((BAL.luxury||{})[k]||{}).span === 'cycle';
function luxUses(k, h){ const id = h ? k + ':' + h.id : k;
  if(luxSpanCycle(k)) return S.luxCyc && S.luxCyc.cycle === (S.cycle||1) ? (S.luxCyc.n[id]||0) : 0;
  const U = S.luxWk && S.luxWk.wk === S.week ? S.luxWk.n : {}; return U[id] || 0; }
function luxCount(k, h){ const id = h ? k + ':' + h.id : k;
  if(luxSpanCycle(k)){ if(!S.luxCyc || S.luxCyc.cycle !== (S.cycle||1)) S.luxCyc = {cycle:S.cycle||1, n:{}}; S.luxCyc.n[id] = (S.luxCyc.n[id]||0) + 1; return; }
  if(!S.luxWk || S.luxWk.wk !== S.week) S.luxWk = {wk:S.week, n:{}}; S.luxWk.n[id] = (S.luxWk.n[id]||0) + 1; }
function luxCost(k, h, per){ const L = BAL.luxury; return Math.round(L[k].cost * (per || 1) * Math.pow(L[k].mul ?? L.weekMul ?? 2, luxUses(k, h)) * cycleMul(L.perCycle)); }
const luxStaff = h => S.workers.filter(w=>w.house===h.id && w.job!=='guild');
function buyLuxury(k, hid){
  if(!luxOpen()) return toast('Luxuries open up once the debt is paid off.');
  const L = BAL.luxury, h = hid ? H(hid) : null, staff = h ? luxStaff(h) : [];
  const cost = luxCost(k, h, k==='spa' ? staff.length : 1);
  if(k==='spa' && !staff.length) return toast('Nobody here to pamper.');
  if(S.gold < cost) return toast('Not enough gold.');
  S.gold -= cost; luxCount(k, h);
  let msg = '';
  if(k==='tonic'){ samEnergyAdd(samMaxEnergy()); msg = `Sam downs the tonic. It tastes like copper and cinnamon, and he feels ready for anything. (energy full)`; }
  else if(k==='campaign'){ h.rep = clamp(h.rep + L.campaign.rep); msg = `Criers, painted handbills and free wine at the fountain: all of Hollowmere hears about ${h.name}. (popularity +${L.campaign.rep})`; }
  else if(k==='spa'){ staff.forEach(w=>{ w.energy = maxEnergy(w); w.health = clamp(w.health + L.spa.health); }); msg = `Masseuses, hot stones and a whole day off the clock: ${staff.length} lad${staff.length===1?'y':'ies'} at ${h.name} come back glowing. (energy full, Health +${L.spa.health})`; }
  addLog(`💎 ${L[k].label}${h ? ' at ' + h.name : ''} (−${fmt(cost)})`);
  save(); render(); toast(msg + ` −${fmt(cost)}`);
}
/* ---------- Hurry it along (balance.json → luxury.rush): pay to skip a story wait once the debt is paid ---------- */
// Skips only the weeks-to-wait gate of a house chapter, romance arc or epilogue chapter (other conditions still apply;
// the button only shows when the wait is all that's left). Price: cost x markup x (1 + perCycle x (cycle-1)), rounded to 100.
// Each skip multiplies the markup by mul; every week that passes keeps weekDecay of the markup above 1 (0.5: halfway back to
// the base price), and a rebirth resets it (S.rush {cycle, m, wk}). The chapter fires when the week ends.
function rushMarkup(){
  const R = BAL.luxury.rush, r = S.rush; if(!r || r.cycle !== (S.cycle||1)) return 1;
  let m = r.m ?? Math.pow(R.mul ?? 1.5, r.n || 0);   // older saves stored a skip count
  const weeks = Math.max(0, S.week - (r.wk ?? S.week));
  for(let i = 0; i < weeks; i++) m = 1 + (m - 1) * (R.weekDecay ?? 0.5);
  return m;
}
function rushCost(){ const R = BAL.luxury.rush; return Math.round(R.cost * rushMarkup() * cycleMul(R.perCycle) / 100) * 100; }
function rushTarget(kind, id){
  if(kind==='house'){ const h = H(id); return h && h.story && STORIES[h.id] ? {h, gap: storyGap(h), name: h.name} : null; }
  const w = S.workers.find(x=>String(x.id)===String(id)); if(!w) return null;
  if(kind==='arc') return ARCS[w.key] ? {w, gap: paidGap(BAL.arcs.gap[Math.min(w.arc||0, BAL.arcs.gap.length-1)]), name: w.name} : null;
  if(kind==='after') return AFTER_STORIES[w.key] ? {w, gap: paidGap(AFTER_GAPS[Math.min(w.after||0, AFTER_GAPS.length-1)]), name: w.name} : null;
  return null;
}
function rushWait(kind, id){
  if(!luxOpen() || !(BAL.luxury||{}).rush) return toast('That opens up once the debt is paid off.');
  const t = rushTarget(kind, id); if(!t) return;
  const cost = rushCost(); if(S.gold < cost) return toast('Not enough gold.');
  S.gold -= cost; S.rush = {cycle: S.cycle||1, m: rushMarkup() * (BAL.luxury.rush.mul ?? 1.5), wk: S.week};
  const at = S.week - t.gap;
  if(t.h){ t.h.story.wk = Math.min(t.h.story.wk||0, at); t.h.since = Math.min(t.h.since||1, at); }
  else if(kind==='arc') t.w.arcWk = Math.min(t.w.arcWk||0, at);
  else t.w.afterWk = Math.min(t.w.afterWk||0, at);
  const what = kind==='house' ? `${t.name}'s next chapter` : kind==='arc' ? `${t.name}'s next romance chapter` : `${t.name}'s next epilogue chapter`;
  addLog(`⏩ Hurried along ${what} (−${fmt(cost)})`);
  save(); render(); toast(`Gold greases every wheel in Hollowmere. ${what} can happen when the week ends. −${fmt(cost)}`);
}
function rushBtn(kind, id){
  if(!luxOpen() || !(BAL.luxury||{}).rush) return '';
  const c = rushCost();
  return `<button class="sm" ${S.gold < c ? 'disabled' : ''} onclick="rushWait('${kind}','${id}')">⏩ Hurry it along · ${fmt(c)}</button>`;
}
function luxBtn(k, h){
  const L = BAL.luxury, per = k==='spa' && h ? luxStaff(h).length : 1, c = luxCost(k, h, per);
  return `<button ${S.gold < c || !per ? 'disabled' : ''} onclick="buyLuxury('${k}'${h ? `,'${h.id}'` : ''})">💎 ${esc(L[k].label)} · ${fmt(c)}</button>`;
}
function samLuxCard(){
  if(!luxOpen() || !BAL.luxury) return '';
  return `<section class="card"><h2>Luxuries</h2><div class="row">${luxBtn('tonic')}</div><p class="muted">No action needed. ${luxSpanCycle('tonic') ? `Each tonic this cycle raises the next one's price x${BAL.luxury.tonic.mul ?? BAL.luxury.weekMul ?? 2} (it resets at rebirth).` : 'Each one bought this week doubles the next one\'s price.'}</p></section>`;
}
function houseLuxCard(h){
  if(!luxOpen() || !BAL.luxury) return '';
  const L = BAL.luxury;
  return `<section class="card"><h2>Luxuries</h2><div class="row">${luxBtn('campaign', h)}${luxBtn('spa', h)}</div><p class="muted">Campaign: house popularity +${L.campaign.rep}. Spa day: everyone living here back to full energy, Health +${L.spa.health} (priced per lady). No action needed; each repeat at this house this week doubles the price.</p></section>`;
}
