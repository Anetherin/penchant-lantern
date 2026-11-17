// Balance lab engine: runSpec(spec, opt) plays every (variant, seed) in headless Chrome and returns the results.
// Used by lab.mjs (CLI) and check.mjs (intent checks). See tools/lab/README.md.
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import { report } from './report.mjs';
const require = createRequire(import.meta.url);
let pw;
for (const m of ['playwright', process.env.PLAYWRIGHT_PATH, '/opt/node-tools/node_modules/playwright', path.resolve(process.execPath, '../../lib/node_modules/playwright')]) {
  if (!m) continue;
  try { pw = require(m); break; } catch {}
}
if (!pw) throw new Error('Cannot find module playwright');
export const here = path.dirname(new URL(import.meta.url).pathname), root = path.resolve(here, '../..');

// spec name / path -> spec object (name filled in)
export function loadSpec(ref){
  if (typeof ref === 'object') { const s = JSON.parse(JSON.stringify(ref)); s.name = s.name || 'inline'; return s; }
  let f = ref; if (!fs.existsSync(f)) f = path.join(here, 'exp', String(ref).replace(/\.json$/, '') + '.json');
  const spec = JSON.parse(fs.readFileSync(f, 'utf8')); spec.name = spec.name || path.basename(f, '.json'); return spec;
}

// variants: explicit list, plus `each` = cartesian product of dot-path values applied to every listed variant
const setPath = (o, p, v) => { const ks = p.split('.'); let t = o; ks.slice(0, -1).forEach(k => { t = t[k] = t[k] && typeof t[k] === 'object' ? t[k] : {}; }); t[ks.at(-1)] = v; };
const clone = o => JSON.parse(JSON.stringify(o));
export function expand(spec, only){
  let vs = (spec.variants || [{ name: 'base' }]).map(clone);
  for (const [p, vals] of Object.entries(spec.each || {})) {
    vs = vs.flatMap(v => vals.map(val => { const n = clone(v); const label = typeof val === 'object' ? (val.name || JSON.stringify(val)) : String(val); if (typeof val === 'object' && val.name) { val = clone(val); delete val.name; }
      setPath(n, p, val); n.name = (v.name && v.name !== 'base' || Object.keys(spec.each).length > 1 ? (v.name === 'base' ? '' : v.name + ' ') : '') + label; n.name = n.name.trim() || label; return n; })); }
  if (spec.baseline !== false && !vs.some(v => v.name === 'base') && spec.each) vs.unshift({ name: 'base' });
  // `by`: run the whole set once per value (e.g. per house); deltas are taken against that group's base
  for (const [p, vals] of Object.entries(spec.by || {})) {
    vs = vals.flatMap(val => vs.map(v => { const n = clone(v); setPath(n, p, val); n.group = (v.group != null ? v.group + ' · ' : '') + String(val); n.name = val + ' · ' + v.name; return n; })); }
  if (only) { const keep = String(only).split(','); vs = vs.filter(v => keep.some(k => v.name.endsWith(k)) || v.name.endsWith('base')); }
  return vs;
}
const jobFor = (spec, v, seed) => ({ seed, scenario: v.scenario || spec.scenario || 'campaign', start: Object.assign({}, spec.start, v.start), weeks: v.weeks || spec.weeks,
  policy: Object.assign({}, spec.policy, v.policy), phasePolicy: (spec.phasePolicy || v.phasePolicy) ? Object.assign({}, spec.phasePolicy, v.phasePolicy) : null, phases: Object.assign({}, spec.phases, v.phases), patch: v.patch || spec.patch, patchAt: v.patchAt || spec.patchAt || 'phase',
  mutate: Object.assign({}, spec.mutate, v.mutate), ng: Object.assign({}, spec.ng, v.ng), maxWarm: v.maxWarm || spec.maxWarm, cycles: v.cycles || spec.cycles, stopOnWin: v.stopOnWin ?? spec.stopOnWin });
// variants with the same start/policy/phases (and patches only at the phase) share the warm-up: run it once, snapshot, reuse
const warmKey = j => (j.patchAt === 'start' && j.patch) || j.scenario === 'campaign' || j.scenario === 'early' ? null : JSON.stringify([j.seed, j.scenario === 'plateau' ? 'plateau' : j.scenario, j.start, j.policy, j.phases, j.maxWarm]);

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
// seeded Math.random, installed before any game script runs
const RNG = `(() => { let a = 1; window.__labSeed = s => { a = s || 1; }; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();`;

// opt: { runs, conc, seed, weeks, only, quiet, write (default true) }
export async function runSpec(specIn, opt = {}){
  const spec = loadSpec(specIn);
  const RUNS = +(opt.runs || spec.runs || 10), CONC = +(opt.conc || spec.conc || 2), SEED0 = +(opt.seed || spec.seed || 1);
  if (opt.weeks) spec.weeks = +opt.weeks;
  const variants = expand(spec, opt.only);
  const server = http.createServer((q, r) => {
    if (q.url === '/favicon.ico') { r.writeHead(204); return r.end(); }
    const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  }).listen(0);
  const PORT = server.address().port;
  const chromeBin = process.env.CHROME || (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);
  const browser = await pw.chromium.launch({ args: ['--no-proxy-server'], ...(chromeBin ? { executablePath: chromeBin } : {}) });
  const BOT = fs.readFileSync(path.join(here, 'bot.js'), 'utf8');
  async function runJob(job){
    const page = await browser.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
    await page.addInitScript(RNG);
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.waitForFunction(() => typeof SETUP !== 'undefined' && (SETUP || S), null, { timeout: 30000 });
    await page.addScriptTag({ content: BOT });
    let res; try { res = await page.evaluate(j => LAB.run(j), job); } catch (e) { res = { seed: job.seed, error: e.message.slice(0, 500) }; }
    await page.close();
    if (errors.length) res.pageErrors = [...new Set(errors)].slice(0, 5);
    return res;
  }
  const t0 = Date.now(), results = Object.fromEntries(variants.map(v => [v.name, []])), queue = [];
  for (let s = SEED0; s < SEED0 + RUNS; s++) variants.forEach(v => queue.push({ v, seed: s }));
  let done = 0; const total = queue.length, pending = new Map();   // warm key -> promise of snapshot (first job of that key makes it)
  const report1 = (v, out) => { done++;
    if (!opt.quiet) process.stderr.write(`\r${spec.name} ${done}/${total} ${Math.round((Date.now() - t0) / 1000)}s ${v.name} s${out.seed}${out.error ? ' ERROR ' + out.error.slice(0, 120) : ''}${out.pageErrors ? ' pageErrors:' + out.pageErrors[0].slice(0, 80) : ''}      `); };
  async function worker(){
    while (queue.length) {
      const { v, seed } = queue.shift(), job = jobFor(spec, v, seed), key = warmKey(job);
      if (key) {
        if (pending.has(key)) { const snap = await pending.get(key); if (snap) job.snap = snap; }
        else { let res; pending.set(key, new Promise(r => res = r)); job.wantSnap = true;
          const out = await runJob(job); res(out.snap || null); delete out.snap; results[v.name].push(out); report1(v, out); continue; }
      }
      const out = await runJob(job); delete out.snap; results[v.name].push(out); report1(v, out);
    }
  }
  try { await Promise.all(Array.from({ length: CONC }, worker)); }
  finally { await browser.close(); server.close(); }
  if (!opt.quiet) process.stderr.write('\n');
  const stamp = { name: spec.name, at: new Date().toISOString(), runs: RUNS, seed0: SEED0, secs: Math.round((Date.now() - t0) / 1000), spec };
  const md = report(spec, variants, results, stamp);
  if (opt.write !== false) { const outDir = path.join(here, 'out'); fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, spec.name + '.json'), JSON.stringify({ ...stamp, variants, results }));
    fs.writeFileSync(path.join(outDir, spec.name + '.md'), md); }
  return { spec, variants, results, stamp, md };
}
