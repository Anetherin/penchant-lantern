// Turns lab results into per-run metrics and a markdown report (variant means, paired deltas vs base, race/job tables).
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN;
const sd = a => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)); };
const ci = a => a.length > 1 ? 1.96 * sd(a) / Math.sqrt(a.length) : NaN;
const f = (x, d = 0) => Number.isFinite(x) ? (Math.abs(x) >= 1000 ? Math.round(x).toLocaleString('en-US') : x.toFixed(d)) : '–';

// metrics of one run (over its measured weeks)
export function metrics(r){
  const W = r.weeks || [], last = W.at(-1) || {}, first = W[0] || {};
  const m = { weeks: W.length };
  if (!W.length) return m;
  const avg = k => mean(W.map(x => x[k]));
  Object.assign(m, { total: mean(W.map(x => x.net + x.sam)), net: avg('net'), income: avg('income'), wages: avg('wages'), upkeep: avg('upkeep'), sam: avg('sam'), served: avg('served'), turned: avg('turned'), sat: avg('sat'),
    mood: avg('mood'), trust: last.trust, gold: last.gold, debt: last.debt, rep: last.rep, repGain: last.rep - (first.rep - 0), staff: last.staff,
    missed: W.reduce((a, x) => a + x.missed, 0), left: W.reduce((a, x) => a + x.left, 0), over: last.over ? 1 : 0, won: last.won ? 1 : 0 });
  // money made per working generic lady-week (earned - wage)
  const per = W.flatMap(x => x.per || []).filter(p => p.job !== 'rest' && !p.key);
  m.perLady = mean(per.map(p => p.earned - p.wage));
  if (last.won) m.winWeek = last.wk;
  const ph = r.phases || {};
  if (r.scenario === 'campaign' || r.scenario === 'ngplus') {
    m.midAt = ph.mid ?? NaN; m.lateAt = ph.late ?? NaN;
    const seg = (a, b) => mean(W.filter(x => x.wk >= a && x.wk < b).map(x => x.net));
    m.netEarly = seg(0, ph.mid ?? 1e9); m.netMid = ph.mid ? seg(ph.mid, ph.late ?? 1e9) : NaN; m.netLate = ph.late ? seg(ph.late, 1e9) : NaN;
    const at = k => (W.find(x => x.wk === k) || {}).gold; m.gold13 = at(13); m.gold26 = at(26); m.gold52 = at(52);
    if (r.info && r.info.ng) { m.ngDebt = r.info.ng.debtTotal; m.ngStaff = r.info.ng.staff; m.c1won = r.info.c1won; m.lovers = r.info.ng.lovers; }
  }
  return m;
}
// race / job breakdown, pooled over runs: per lady-week while working
function breakdown(runs, key){
  const B = {};
  runs.forEach(r => (r.weeks || []).forEach(x => (x.per || []).forEach(p => { if (p.job === 'rest' && key === 'job') return;
    if (key === 'race' && p.key) return;   // races: generic ladies only (named ones have hand-made stats)
    if (key === 'named' && !p.key) return;
    const k = key === 'race' ? (p.sub ? p.race + '/' + p.sub : p.race) : key === 'named' ? p.key : p.job; const b = B[k] = B[k] || { lw: 0, work: 0, earned: 0, wage: 0, served: 0, gen: 0 };
    b.lw++; if (p.job !== 'rest') b.work++; b.earned += p.earned; b.wage += p.wage; b.served += p.served; if (!p.key) b.gen++; })));
  return Object.entries(B).map(([k, b]) => ({ k, lw: b.lw, rest: 1 - b.work / b.lw, earned: b.earned / b.lw, wage: b.wage / b.lw, net: (b.earned - b.wage) / b.lw, served: b.served / b.lw, gen: b.gen / b.lw }))
    .sort((a, b) => b.net - a.net);
}

const COLS = {
  campaign: ['winWeek', 'midAt', 'lateAt', 'netEarly', 'netMid', 'netLate', 'gold26', 'gold52', 'missed', 'rep', 'staff', 'sat', 'left', 'over'],
  ngplus: ['c1won', 'lovers', 'ngDebt', 'ngStaff', 'winWeek', 'net', 'missed', 'gold', 'staff', 'sat', 'left', 'over'],
  phase: ['total', 'net', 'sam', 'income', 'wages', 'perLady', 'gold', 'repGain', 'served', 'turned', 'sat', 'mood', 'left', 'missed']
};
const DELTA = { campaign: ['winWeek', 'netMid', 'netLate', 'gold26'], ngplus: ['winWeek', 'net', 'gold'], phase: ['total', 'net', 'perLady', 'repGain', 'sat', 'left'] };

export function report(spec, variants, results, stamp){
  const sc = spec.scenario || 'campaign', kind = COLS[sc] ? sc : 'phase';
  const cols = spec.columns || COLS[kind], dcols = spec.delta || DELTA[kind];
  const M = {}; for (const v of variants) M[v.name] = results[v.name].map(r => ({ seed: r.seed, r, m: r.unreached || r.error ? null : metrics(r) }));
  const L = [];
  L.push(`# ${spec.name}`, '', `${spec.desc || ''}`, '', `scenario **${sc}** · ${stamp.runs} seeds from ${stamp.seed0} · ${stamp.secs}s · ${stamp.at.slice(0, 16)}`, '');
  const errs = Object.entries(M).flatMap(([k, a]) => a.filter(x => x.r.error || x.r.pageErrors).map(x => `${k} s${x.seed}: ${x.r.error || x.r.pageErrors.join(' | ')}`));
  if (errs.length) L.push('**Errors:**', ...errs.slice(0, 8).map(e => '- ' + e.slice(0, 300)), '');
  // means
  L.push(`| variant | n | ${cols.join(' | ')} |`, `|---|---|${cols.map(() => '---').join('|')}|`);
  for (const v of variants) { const ok = M[v.name].filter(x => x.m), un = M[v.name].length - ok.length;
    L.push(`| ${v.name} | ${ok.length}${un ? ` (+${un} unreached)` : ''} | ${cols.map(c => { const a = ok.map(x => x.m[c]).filter(Number.isFinite); return a.length ? f(mean(a), Math.abs(mean(a)) < 10 ? 1 : 0) + (a.length < ok.length ? `ⁿ${a.length}` : '') : '–'; }).join(' | ')} |`); }
  // paired deltas vs base
  const bname = M.base ? 'base' : variants[0].name;
  const baseOf = v => v.group != null ? (variants.find(x => x.group === v.group && x.name.endsWith('base')) || {}).name : bname;
  if (variants.length > 1 && dcols.length) {
    L.push('', `Paired Δ vs ${spec.by ? "each group's base" : `**${bname}**`} (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):`, '', `| variant | ${dcols.map(c => 'Δ ' + c).join(' | ')} |`, `|---|${dcols.map(() => '---').join('|')}|`);
    for (const v of variants) { const bn = baseOf(v); if (!bn || v.name === bn) continue; const base = M[bn];
      L.push(`| ${v.name} | ${dcols.map(c => { const d = M[v.name].map(x => { const b = base.find(y => y.seed === x.seed); return x.m && b && b.m && Number.isFinite(x.m[c]) && Number.isFinite(b.m[c]) ? x.m[c] - b.m[c] : null; }).filter(x => x !== null);
        if (!d.length) return '–'; const mu = mean(d), e = ci(d), s = `${mu >= 0 ? '+' : ''}${f(mu, 1)} ± ${f(e, 1)}`; return Number.isFinite(e) && Math.abs(mu) > e ? `**${s}**` : s; }).join(' | ')} |`); }
  }
  // breakdowns
  for (const key of spec.breakdown || ['race', 'job']) {
    const show = spec.breakdownFor || [bname];
    for (const vn of show) { if (!results[vn]) continue; const rows = breakdown(results[vn].filter(r => !r.unreached && !r.error), key); if (!rows.length) continue;
      L.push('', `Per ${key === 'race' ? 'race (generic ladies)' : key} (${vn}; per lady-week, pooled; earned = her own ledger, not what she draws in for others):`, '', `| ${key} | lady-weeks | rest% | earned | wage | net | served |`, '|---|---|---|---|---|---|---|');
      rows.forEach(x => L.push(`| ${x.k} | ${x.lw} | ${f(100 * x.rest)} | ${f(x.earned)} | ${f(x.wage)} | ${f(x.net)} | ${f(x.served, 1)} |`)); }
  }
  L.push('');
  return L.join('\n');
}
