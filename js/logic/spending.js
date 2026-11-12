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
// Tutoring for a whole group at once (Sam tab → Errands). Groups follow the roster order (rosterRank in ui/core.js), plus houses and jobs.
let TUT_ALL = null;
function tutorGroups(){
  const G = [['all','Everyone'],['perm','Permanent: house ladies, partners & story characters'],['r0','House ladies'],['r1','Partners'],['r2','Other story characters'],['r3','Guests'],['r4','Generic ladies']];
  if(S.houses.length > 1) S.houses.forEach(h=>G.push(['h:'+h.id, 'Everyone at '+h.name]));
  [...new Set(S.workers.map(w=>w.job))].filter(j=>JOBS[j]).forEach(j=>G.push(['j:'+j, 'Job: '+JOBS[j].label]));
  return G;
}
function tutorGroupList(g){
  return S.workers.filter(w=>g==='all' || (g==='perm' && rosterRank(w) <= 2) || (g[0]==='r' && g.length===2 && rosterRank(w)===+g[1])
    || (g.startsWith('h:') && w.house===g.slice(2)) || (g.startsWith('j:') && w.job===g.slice(2)));
}
function tutorAllMenu(){ TUT_ALL = TUT_ALL || {g:'all', focus:'job', tier:Object.keys(BAL.tutor.tiers)[0]}; tutorAllDraw(); }
function tutorAllSet(k, v){ if(!TUT_ALL) return; TUT_ALL[k] = v; tutorAllDraw(); }
function tutorAllDraw(){
  const A = TUT_ALL, list = tutorGroupList(A.g), T = BAL.tutor, on = S.workers.filter(w=>TUTOR_FOCUS[w.tutor]);
  const sel = (k, opts) => `<select onchange="tutorAllSet('${k}',this.value)">${opts.map(([v,l])=>`<option value="${v}" ${A[k]===v?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
  const cost = A.focus ? list.reduce((a,w)=>a + tutorCost(w, A.tier), 0) : 0;
  modal(`<h2>📚 Tutoring for everyone</h2><p class="muted">Sets the same tutor for a whole group (you can still change each lady on her sheet). Fees are paid at the end of each week; a lady is skipped if the purse can't cover her.</p>
    <div class="row"><label>Who ${sel('g', tutorGroups())}</label></div>
    <div class="row"><label>Focus ${sel('focus', [['','None (stop tutoring)'], ...Object.entries(TUTOR_FOCUS)])}</label>
      <label>Tutor ${sel('tier', Object.entries(T.tiers).map(([k,t])=>[k, t.label]))}</label></div>
    <p>${list.length ? list.map(w=>esc(w.name.split(' ')[0])).join(', ') : '<span class="muted">Nobody in this group.</span>'}</p>
    <p class="muted">${A.focus ? `${list.length} lad${list.length===1?'y':'ies'} · ${fmt(cost)}/wk for this group.` : 'Their tutoring stops.'} Right now ${on.length} lad${on.length===1?'y has':'ies have'} a tutor (${fmt(on.reduce((a,w)=>a+tutorCost(w),0))}/wk).</p>
    <div class="row"><button class="primary" ${list.length?'':'disabled'} onclick="tutorAllApply()">Apply</button><button onclick="TUT_ALL=null;closeModal()">Back</button></div>`);
}
function tutorAllApply(){
  const A = TUT_ALL; if(!A) return; const list = tutorGroupList(A.g);
  list.forEach(w=>{ w.tutor = TUTOR_FOCUS[A.focus] ? A.focus : null; if(BAL.tutor.tiers[A.tier]) w.tutorTier = A.tier; });
  toast(A.focus ? `Tutors booked for ${list.length} lad${list.length===1?'y':'ies'}.` : `Tutoring stopped for ${list.length} lad${list.length===1?'y':'ies'}.`);
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
const giftCost = (w, k) => Math.round(BAL.gifts.tiers[k].cost * (1 + BAL.gifts.weekStep * giftsThisWeek(w)) * cycleMul(BAL.gifts.perCycle));
function giftMenu(id){
  const w = findW(id); if(!w) return;
  const G = BAL.gifts, mode = giftMode(), n = giftsThisWeek(w);
  if(mode==='locked') return toast('Buying her gifts opens up once the debt is paid off.');
  const cap = houseTrustCap(w) < 100 && w.trust >= houseTrustCap(w);
  modal(`<h2>A Gift for ${esc(titled(w))}</h2><p class="muted">Trust ${tShow(w.trust)}${cap ? ` <span class="warn">(held at ${tShow(houseTrustCap(w))} until her house's story moves on)</span>` : ''} · Mood ${Math.round(w.mood)}${n ? ` · ${n} gift${n>1?'s':''} this week (each one more costs ${Math.round(G.weekStep*100)}% more)` : ''}${mode==='action' ? ` · each gift takes one of Sam's actions (${G.energy} energy)` : ''}</p>
    <div class="row">${Object.entries(G.tiers).map(([k,t])=>{ const c = giftCost(w,k); return `<button onclick="buyGift('${w.id}','${k}')" ${S.gold<c?'disabled':''}>${esc(t.label)} · ${fmt(c)}</button>`; }).join('')}</div>
    <div class="row"><button onclick="openSheet('${w.id}')">Back</button></div>`);
}
function buyGift(id, k){
  const w = findW(id), G = BAL.gifts, t = G.tiers[k]; if(!w || !t) return;
  const mode = giftMode(), cost = giftCost(w, k);
  if(mode==='locked') return toast('Buying her gifts opens up once the debt is paid off.');
  if(S.gold < cost) return toast('Not enough gold.');
  if(mode==='action' && !useAP(G.energy)) return;
  S.gold -= cost;
  if(w._giftWk !== S.week){ w._giftWk = S.week; w._giftN = 0; } w._giftN++;
  const m = pm(w,'gift') * (has(w,'Greedy') ? G.greedy : 1);
  const tg = gainTrust(w, t.trust * m); moodAdd(w, Math.round(t.mood * m)); w.mood = clamp(w.mood);
  countUp(w, 'gifts'); samLog(`Bought ${w.name} a gift (${t.label.toLowerCase()})`); checkUnlocks();
  const line = flavor('gift_'+k, w, {gift: pick(GIFTS)}) || `Sam buys ${w.name} a gift.`;
  save(); render();
  modal(`<h2>${esc(t.label)} for ${esc(w.name)}</h2><p class="story">${esc(line)}${esc(pNote(w,'gift'))}</p><p class="muted">−${fmt(cost)} · Trust ${tDelta(tg)} · Mood +${Math.round(t.mood*m)}</p>
    <div class="row"><button onclick="giftMenu('${w.id}')">Another gift…</button><button class="primary" onclick="openSheet('${w.id}')">Back to her</button></div>`);
}
