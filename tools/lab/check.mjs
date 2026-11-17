// Intent checks: runs the experiments named in checks.json and tests each design intent against the results.
// Usage: node tools/lab/check.mjs [--only id,id] [--quick] [--reuse] [--runs N] [--conc N]
//   --quick  6 seeds per experiment (smoke-level; CIs get wide, so "sig" checks may come out UNSURE)
//   --reuse  use tools/lab/out/<experiment>.json from an earlier run when it exists (same spec), instead of re-running
// Exit code 1 if any non-soft check FAILS. Report: stdout + tools/lab/out/checks.md.
//
// checks.json: { "checks": [ { "id", "intent", "exp": <spec name or inline spec>, "runs"?, "soft"?, "expect": [ ... ] } ] }
// Each expectation picks variants by name ("*" = every variant except the bases; "prefix*" = names starting with prefix)
// and one metric (any column from report.mjs: total, net, perLady, weeksToWin, ngWeeks, ngRatio, unhandled, ...):
//   {"delta": "no promoter", "metric": "total", "lt": 0}          paired Δ vs that variant's base (same seeds)
//   {"mean": "base", "metric": "winRate", "gte": 0.9}              variant mean
//   {"compare": ["demon · promoter"], "to": ["human · promoter"], "metric": "total", "lt": 0}   mean(A) - mean(B)
//   {"compareDelta": ["demon · promoter"], "to": ["human · promoter"], "metric": "total", "lt": 0}  each one's paired Δ vs its own base, then A − B
//   {"rank": "late · demon", "among": "late · *", "metric": "perLady", "top": 1}               A is in the top N of the group
// Comparisons: lt, lte, gt, gte (vs a number, "-10%" of the base mean, or "@metric" = the same variant's mean of another metric), abs (|x| <= n), pct (|Δ| <= n % of the base mean), between [lo, hi].
// "sig": true on lt/gt makes it strict: the 95% CI must also clear the bound (paired Δ only), else it reports UNSURE.
// "soft": true on a check (or an expectation) reports WARN instead of FAIL: an aim, not a rule.
import fs from 'node:fs';
import path from 'node:path';
import { runSpec, loadSpec, expand, here } from './run.mjs';
import { metrics, mean, ci } from './report.mjs';

const argv = process.argv.slice(2), opt = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) { const k = argv[i].slice(2); opt[k] = (argv[i + 1] && !argv[i + 1].startsWith('--')) ? argv[++i] : true; }
const CK = JSON.parse(fs.readFileSync(opt.file || path.join(here, 'checks.json'), 'utf8')).checks;
const only = opt.only ? String(opt.only).split(',') : null;
const checks = CK.filter(c => !only || only.includes(c.id));

// run each experiment once, even if several checks use it
const cache = new Map();
async function getExp(c){
  const spec = loadSpec(c.exp), runs = +(opt.runs || (opt.quick ? 6 : c.runs || spec.runs || 12)), key = spec.name + '#' + runs;
  if (cache.has(key)) return cache.get(key);
  const f = path.join(here, 'out', spec.name + '.json');
  if (opt.reuse && fs.existsSync(f)) { const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (JSON.stringify(d.spec) === JSON.stringify(spec) && d.runs >= runs) { const r = { spec, results: d.results, variants: d.variants || expand(spec), reused: true }; cache.set(key, r); return r; } }
  const r = await runSpec(spec, { runs, conc: opt.conc, quiet: !!opt.quiet, 'no-cache': opt['no-cache'] }); cache.set(key, r); return r;
}

const fmt = x => Number.isFinite(x) ? (Math.abs(x) >= 100 ? Math.round(x).toLocaleString('en-US') : x.toFixed(Math.abs(x) < 10 ? 2 : 1)) : '–';
function evaluate(E0, exp){ let E = E0;
  const M = {}; for (const [vn, rs] of Object.entries(exp.results)) M[vn] = rs.map(r => ({ seed: r.seed, m: r.unreached || r.error ? null : metrics(r) }));
  const V = exp.variants, names = Object.keys(M), isBase = n => n === 'base' || n.endsWith('· base');
  const pick = sel => [].concat(sel).flatMap(s => s === '*' ? names.filter(n => !isBase(n)) : s.endsWith('*') ? names.filter(n => n.startsWith(s.slice(0, -1)) && !isBase(n)) : [s]);
  const baseOf = n => { const v = V.find(x => x.name === n); if (v && v.group != null) return (V.find(x => x.group === v.group && isBase(x.name)) || {}).name; return names.includes('base') ? 'base' : names[0]; };
  const vals = (n, k) => (M[n] || []).filter(x => x.m && Number.isFinite(x.m[k])).map(x => x.m[k]);
  const out = [];
  // bounds: a number, "-10%" (of the base mean), or "@metric" (the same variant's mean of another metric)
  const B = (k, base, n) => { const b = E[k]; if (typeof b !== 'string') return b; if (b.endsWith('%')) return Math.abs(base) * parseFloat(b) / 100; if (b.startsWith('@')) return mean(vals(n, b.slice(1))); return +b; };
  const test = (label, x, e, base, n) => {
    E = Object.assign({}, E0); for (const k of ['lt', 'lte', 'gt', 'gte']) if (E[k] != null) E[k] = B(k, base, n);
    let ok, sure = true; const lo = Number.isFinite(e) ? x - e : x, hi = Number.isFinite(e) ? x + e : x;
    if (!Number.isFinite(x)) return out.push({ label, res: 'NO DATA', val: '–' });
    // sig: a pass also needs the CI to clear the bound (else UNSURE); a mean on the wrong side is a FAIL either way
    if (E.lt != null) { ok = x < E.lt; if (E.sig) sure = !ok || hi < E.lt; }
    else if (E.lte != null) ok = x <= E.lte;
    else if (E.gt != null) { ok = x > E.gt; if (E.sig) sure = !ok || lo > E.gt; }
    else if (E.gte != null) ok = x >= E.gte;
    else if (E.abs != null) ok = Math.abs(x) <= E.abs;
    else if (E.pct != null) ok = Math.abs(x) <= Math.abs(base) * E.pct / 100;
    else if (E.between) ok = x >= E.between[0] && x <= E.between[1];
    const val = fmt(x) + (Number.isFinite(e) ? ' ± ' + fmt(e) : '') + (E.pct != null && Number.isFinite(base) ? ` (${fmt(100 * x / base)}% of ${fmt(base)})` : '');
    out.push({ label, res: !sure ? 'UNSURE' : ok ? 'PASS' : (E.soft ? 'WARN' : 'FAIL'), val });
  };
  const want = (E => E.lt != null ? `< ${E.lt}` : E.lte != null ? `≤ ${E.lte}` : E.gt != null ? `> ${E.gt}` : E.gte != null ? `≥ ${E.gte}` : E.abs != null ? `|x| ≤ ${E.abs}` : E.pct != null ? `|Δ| ≤ ${E.pct}%` : E.between ? `in [${E.between}]` : '')(E0);
  if (E.delta) for (const n of pick(E.delta)) { const b = baseOf(n); if (!M[n] || !M[b]) { out.push({ label: `Δ ${E.metric} ${n}`, res: 'NO DATA', val: '–' }); continue; }
    const d = M[n].map(x => { const y = M[b].find(z => z.seed === x.seed); return x.m && y && y.m && Number.isFinite(x.m[E.metric]) && Number.isFinite(y.m[E.metric]) ? x.m[E.metric] - y.m[E.metric] : null; }).filter(x => x !== null);
    test(`Δ ${E.metric}: ${n} vs ${b} ${want}`, mean(d), ci(d), mean(vals(b, E.metric))); }
  if (E.mean) for (const n of pick(E.mean)) { const a = vals(n, E.metric); test(`${E.metric}: ${n} ${want}`, mean(a), NaN, NaN, n); }
  // compareDelta: mean paired Δ of A (vs its base) minus mean paired Δ of B (vs its base): "where does this race lose more than that one"
  const pd = n => { const b = baseOf(n); if (!M[n] || !M[b]) return NaN; return mean(M[n].map(x => { const y = M[b].find(z => z.seed === x.seed); return x.m && y && y.m ? x.m[E.metric] - y.m[E.metric] : NaN; }).filter(Number.isFinite)); };
  if (E.compareDelta) { const A = pick(E.compareDelta), Bn = pick(E.to); test(`Δ${E.metric}: [${A.join(', ')}] − Δ[${Bn.join(', ')}] ${want}`, mean(A.map(pd)) - mean(Bn.map(pd)), NaN, NaN); }
  if (E.compare) { const A = pick(E.compare), B = pick(E.to), ma = mean(A.map(n => mean(vals(n, E.metric)))), mb = mean(B.map(n => mean(vals(n, E.metric))));
    test(`${E.metric}: [${A.join(', ')}] − [${B.join(', ')}] ${want}`, ma - mb, NaN, mb); }
  if (E.rank) { const pool = pick(E.among).concat(pick(E.rank)).filter((x, i, a) => a.indexOf(x) === i), sc = pool.map(n => [n, mean(vals(n, E.metric))]).filter(x => Number.isFinite(x[1])).sort((a, b) => b[1] - a[1]);
    for (const n of pick(E.rank)) { const i = sc.findIndex(x => x[0] === n), top = E.top || 1;
      out.push({ label: `${E.metric}: ${n} in top ${top} of ${sc.length}`, res: i < 0 ? 'NO DATA' : i < top ? 'PASS' : (E.soft ? 'WARN' : 'FAIL'), val: i < 0 ? '–' : `#${i + 1} (${fmt(sc[i][1])}; #1 ${sc[0][0]} ${fmt(sc[0][1])})` }); } }
  return out;
}

const L = ['# Balance intent checks', '', `${new Date().toISOString().slice(0, 16)} · ${opt.quick ? 'quick (6 seeds)' : 'full'}`, ''], tally = {};
for (const c of checks) {
  const exp = await getExp(c); const rows = c.expect.flatMap(E => evaluate(Object.assign({ soft: c.soft }, E), exp));
  const worst = ['FAIL', 'WARN', 'UNSURE', 'NO DATA', 'PASS'].find(r => rows.some(x => x.res === r)) || 'PASS';
  tally[worst] = (tally[worst] || 0) + 1;
  L.push(`## ${worst} · ${c.id}${c.soft ? ' (soft)' : ''}`, '', c.intent, '', `experiment \`${exp.spec.name}\`${exp.reused ? ' (reused)' : ''}`, '', '| result | check | value |', '|---|---|---|', ...rows.map(r => `| ${r.res} | ${r.label} | ${r.val} |`), '');
  process.stderr.write(`\n${worst.padEnd(7)} ${c.id}\n`);
}
L.splice(3, 0, Object.entries(tally).map(([k, n]) => `**${k}** ${n}`).join(' · '), '');
const md = L.join('\n'); fs.mkdirSync(path.join(here, 'out'), { recursive: true }); fs.writeFileSync(path.join(here, 'out', 'checks.md'), md); console.log(md);
process.exit(tally.FAIL ? 1 : 0);
