'use strict';
/* =====================================================================
   LINGERING: pressure to be reborn once the debt is paid (balance.json → linger, wording goddess/linger.json → linger).
   After a grace period every week past payoff is a linger level. Stages (each opens with a goddess scene, then a weekly
   report line): wane (Sam's max energy shrinks), tithe (she burns a share of the gold above a floor), recall (every few
   weeks a Devoted lover who isn't this cycle's partner sleeps in the lantern until New Game+; S.lingerTaken).
   State: S.wonWk (week the debt was paid), S.lingerSeen [stages announced], S.lingerTaken [workers], S.lingerRecallWk.
   Hooks: checkEnd sets S.wonWk; samMaxEnergy subtracts lingerEnergyCut(); endWeek calls lingerWeek(R);
   startNGPlus calls lingerWake(); ngSeed carries S.lingerTaken.
   ===================================================================== */
const LB = () => BAL.linger || {off:true};
const LT = () => (GOD.linger || {});
function lingerGrace(){ const B = LB(); return Math.max(B.graceMin ?? 4, (B.graceBase ?? 8) - (B.graceCycle ?? 1) * Math.max(0, ((S && S.cycle) || 1) - 1)); }
function lingerLevel(){
  if(!S || !S.won || LB().off) return 0;
  if(S.wonWk === undefined) S.wonWk = S.week;   // saves from before this existed: the clock starts now
  return Math.max(0, S.week - S.wonWk - lingerGrace());
}
const lingerOn = stage => { const f = (LB()[stage] || {}).from; return f !== undefined && lingerLevel() >= f; };
function lingerEnergyCut(){ const W = LB().wane || {}; return lingerOn('wane') ? Math.min(W.max ?? 42, (W.perLevel ?? 6) * (lingerLevel() - (W.from ?? 1) + 1)) : 0; }
function lingerPct(){ const T = LB().tithe || {}; return lingerOn('tithe') ? Math.min(T.max ?? 0.35, (T.base ?? 0.05) + (T.perLevel ?? 0.03) * (lingerLevel() - (T.from ?? 2))) : 0; }
const lingerFloor = () => { const T = LB().tithe || {}; return Math.round((T.floor ?? 3000) * (1 + (T.floorCycle ?? 0.5) * Math.max(0, (S.cycle || 1) - 1))); };
// which voice she speaks in: a dream before the reveal, herself after it, bound, or gone (the lantern alone)
function lingerVoice(){ const g = G(); return g.left ? 'gone' : g.bound ? 'bound' : g.knows ? 'known' : 'dream'; }
function lingerText(stage, ctx){ const T = (LT()[stage] || {}).text || {}; return gtxt(T[lingerVoice()] || T.known || '', ctx); }
const lingerCandidates = () => S.workers.filter(w=>has(w,'Devoted') && w.key !== S.partner && w.job !== 'guild' && !isVessel(w));
function lingerEvent(stage, ctx, res){
  const T = LT()[stage] || {}, sc = T.image ? dynScene('goddess_' + (T.image.key || 'linger_' + stage), T.image) : 'portrait';
  const gone = lingerVoice()==='gone';
  return {title: gtxt(T.title || '', ctx), who: gone ? null : godId(), scene: sc,
    text: lingerText(stage, ctx), choices:[{label: gtxt(T.btn || 'Wake up', ctx), fx(){ return res || ''; }}]};
}
function lingerWeek(R){
  const L = lingerLevel(); if(!L) return;
  S.lingerSeen = S.lingerSeen || [];
  const RP = LT().report || {}, announce = (stage, ctx) => { if(!S.lingerSeen.includes(stage)){ S.lingerSeen.push(stage); const res = '(' + gtxt(RP[stage] || '', ctx).replace(/^🏮\s*/, '') + ' New Game+ ends it.)'; EVQ.push(()=>lingerEvent(stage, ctx, res)); } };
  if(lingerOn('wane')){
    const cut = lingerEnergyCut(); S.sam.energy = Math.min(S.sam.energy, samMaxEnergy());
    announce('wane', {energy:cut}); R.lines.push(gtxt(RP.wane || '', {energy:cut}));
  }
  if(lingerOn('tithe')){
    const pct = lingerPct(), over = Math.max(0, S.gold - lingerFloor()), take = Math.round(over * pct);
    if(take > 0){ S.gold -= take; R.lingerTithe = take; announce('tithe', {gold:fmt(take), pct:Math.round(pct*100)}); R.lines.push(gtxt(RP.tithe || '', {gold:fmt(take), pct:Math.round(pct*100)})); }
  }
  const RC = LB().recall || {};
  if(lingerOn('recall') && S.week - (S.lingerRecallWk || -99) >= (RC.every ?? 3)){
    const list = lingerCandidates();
    if(list.length){
      const w = pick(list); S.lingerRecallWk = S.week;
      if(S.sleepIn === w.id) S.sleepIn = null;
      S.workers = S.workers.filter(x=>x !== w); (S.lingerTaken = S.lingerTaken || []).push(w);
      const ctx = {lady: w.name.split(' ')[0], wid: w.id};
      addLog(`🏮 ${w.name} sleeps in the lantern until the next cycle.`);
      R.lines.push(gtxt(RP.recall || '', ctx));
      EVQ.push(()=>lingerEvent('recall', ctx, `(${w.name} sleeps in the lantern until New Game+. She still carries over as Sam's lover.)`));
    }
  }
  if((S.lingerTaken||[]).length) R.lines.push(gtxt(RP.kept || '', {names: S.lingerTaken.map(w=>w.name.split(' ')[0]).join(', ')}));
}
// Less waiting once the debt is paid (balance.json → linger.waitMul): story gaps (romance arcs, epilogues, house chapters,
// firsts with Sam) shrink, so finishing everyone's stories before the rebirth doesn't mean idling for weeks.
const paidGap = g => (S && (S.won || (S.debt && S.debt.remaining <= 0))) ? Math.max(0, Math.floor(g * (LB().waitMul ?? 0.5))) : g;
// New Game+: everyone sleeping in the lantern comes back to the roster (still Devoted, so they carry over like any lover).
function lingerWake(){
  if(S && (S.lingerTaken||[]).length){ S.workers.push(...S.lingerTaken); S.lingerTaken = []; }
  if(S){ S.lingerSeen = []; delete S.lingerRecallWk; }
}
// Sam tab: what lingering is costing, and what comes next.
function lingerCard(){
  if(!S || !S.won || LB().off) return '';
  const B = LB(), L = lingerLevel(), wk = S.week - (S.wonWk ?? S.week), grace = lingerGrace();
  const taken = (S.lingerTaken||[]).map(w=>esc(w.name.split(' ')[0])).join(', ');
  const next = !L ? `Grace: ${grace - wk} more week${grace - wk === 1 ? '' : 's'} before the lantern starts to gutter.`
    : !lingerOn('tithe') ? `From level ${B.tithe.from}: a share of the gold above ${fmt(lingerFloor())} burns away each week.`
    : !lingerOn('recall') ? `From level ${B.recall.from}: every ${B.recall.every} weeks a lover (not this cycle's partner) sleeps in the lantern until New Game+.` : '';
  return `<section class="card"><h2>🏮 Lingering</h2><div class="muted">Debt paid ${wk} week${wk===1?'':'s'} ago${L ? ` · <span class="warn">level ${L}</span>` : ''}.${lingerOn('wane') ? ` Max energy −${lingerEnergyCut()}.` : ''}${lingerOn('tithe') ? ` ${Math.round(lingerPct()*100)}% of gold above ${fmt(lingerFloor())} burns each week.` : ''}${taken ? ` Sleeping in the lantern: ${taken}.` : ''}</div>${next ? `<div class="muted">${next}</div>` : ''}<p class="muted">The longer Sam stays past his life, the more it costs. New Game+ resets it and wakes everyone.</p></section>`;
}
