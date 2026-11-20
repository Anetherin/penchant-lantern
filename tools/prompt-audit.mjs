// Image prompt audit: builds buildPrompt() output for every scene family (client, Sam, duo, two women fem/futa/selffuta,
// women clients, demo, orgy, solo, portraits, tease/story scenes) across a cast that covers every bust/height/figure option,
// several races and named ladies, at every dress level, then lints them. Seeded, so runs are comparable before/after a change.
//
// Usage: node tools/prompt-audit.mjs [--seed N] [--out file.md] [--json file.json] [--only pair,cpair] [--strict]
//   --only   limit to scene families (portrait, act, samact, duo, pair_fem, pair_futa, pair_selffuta, cpair_fem, cpair_futa, demo, orgy, solo, story)
//   --strict exit 1 on any lint error (warnings never fail)
// Needs playwright (same lookup as tools/smoke.mjs; CHROME=/path/to/chrome for a custom browser).
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
const require = createRequire(import.meta.url);
let pw;
for (const m of ['playwright', process.env.PLAYWRIGHT_PATH, '/opt/node-tools/node_modules/playwright', path.resolve(process.execPath, '../../lib/node_modules/playwright')]) {
  if (!m) continue;
  try { pw = require(m); break; } catch {}
}
if (!pw) throw new Error('Cannot find module playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const SEED = +arg('seed', 7), OUT = arg('out', path.join(root, 'tools/prompt-audit.out.md')), JSON_OUT = arg('json', ''), ONLY = (arg('only', '') || '').split(',').filter(Boolean);
const STRICT = process.argv.includes('--strict');

// ---------------------------------------------------------------- in-page generator
const GEN = `async ({only}) => {
  await new Promise(r => { const t = setInterval(() => { if (typeof SETUP !== 'undefined' && (SETUP || S)) { clearInterval(t); r(); } }, 50); });
  store.del(KEY_SAVE); EVQ = []; CUR_EV = null;
  newGame({past:'salaryman', house:'lantern', partner:'kaede'}); closeModal();
  const h = S.houses[0];
  // cast: generics forced through every body option and a spread of races, plus named ladies and the goddess
  const cast = [];
  const gen = (race, body, extra) => { const w = genWorker({race}); w.body = Object.assign({}, w.body, body); Object.assign(w, extra||{}); w.house = h.id; w.lewd = 100; w.trust = 100; w.intim = 3; S.workers.push(w); cast.push(w); return w; };
  const BO = {bust:bodyOpts('bust'), height:bodyOpts('height'), figure:bodyOpts('figure')};
  const busts = Object.keys(BO.bust || {}), heights = Object.keys(BO.height || {}), figs = Object.keys(BO.figure || {});
  const races = Object.keys(RACES);
  busts.forEach((b, i) => gen(races[i % races.length], {bust:b, height:heights[i % heights.length], figure:figs[i % figs.length]}));
  figs.forEach((f, i) => gen(races[(i + 3) % races.length], {bust:busts[(i + 2) % busts.length], height:heights[(i + 1) % heights.length], figure:f}));
  const spirit = races.includes('spirit') ? gen('spirit', {bust:'small'}) : null;
  const modest = gen('human', {bust:'large'}, {traits:['Modest']});
  const commando = gen('elf', {bust:'medium'}, {under:'none'});
  const named = S.workers.filter(w => w.named).slice(0, 3); named.forEach(w => { w.lewd = 100; w.trust = 100; w.intim = 3; cast.push(w); });
  const god = typeof godId === 'function' ? findAny(godId()) : null;
  const acts = getActs().filter(a => !a.custom).map(a => a.id);
  const CL = ['dressed','partial','under','nude'];
  const out = [];
  const fam = k => { const b = sceneBase(k); if (b.startsWith('pair:')) return 'pair_' + b.split(':')[2]; if (b.startsWith('cpair:')) return 'cpair_' + b.split(':')[2]; if (b.startsWith('ddate_')) return 'ddate'; const p = b.split(':')[0]; return /^(act|samact|duo|demo|orgy)$/.test(p) ? p : b === 'solo' ? 'solo' : b === 'portrait' ? 'portrait' : 'story'; };
  const add = (w, k, cloth, note) => { if (only.length && !only.includes(fam(k))) return; let p; try { p = buildPrompt(w, k, cloth); } catch (e) { p = 'THROW: ' + e.message; }
    const b = (w.body || {}); out.push({fam:fam(k), who:w.name + ' (' + (w.race || 'client') + (w.sub ? '/' + w.sub : '') + ')', body:[b.bust, b.height, b.figure].join('/'), scene:k, cloth:cloth || 'default', note:note||'', prompt:p}); };
  const other = cast[1], third = cast[2];
  cast.forEach((w, ci) => {
    add(w, 'portrait');
    // story-ish scenes: whatever scenes.json defines that isn't a service scene, a few per lady
    Object.keys(SCENES).filter(k => !isSvcScene(k)).filter((k, i) => (i + ci) % 6 === 0).forEach(k => add(w, k));
    acts.forEach((a, ai) => {
      const o = w === other ? cast[0] : other;
      // dress levels rotate per lady so every service is seen at every level across the cast
      const D = (actById(a) || {}).dress || {}, lo = Math.max(0, CL.indexOf(D.min || 'dressed')), cl = CL[Math.max(lo, (ai + ci) % 4)];   // never below the service's own minimum
      add(w, 'act:' + a, cl); add(w, 'samact:' + a, cl);
      if (ci < 4) { add(w, 'duo:' + a + ':' + o.id, cl); add(w, 'pair:' + a + ':fem:' + o.id, cl); add(w, 'cpair:' + a + ':fem', cl); add(w, 'cpair:' + a + ':futa', cl); add(w, 'demo:' + a, cl); }
      if (ci < 4 && god) add(w, 'pair:' + a + ':futa:' + god.id, cl);
      if (w === spirit) add(w, 'pair:' + a + ':selffuta:' + o.id, cl);
    });
    if (ci < 2) Object.keys(DOUBLE_DATES).forEach(k => add(w, 'ddate_' + k + '~~with:' + other.id));
    if (ci < 3) add(w, 'orgy:' + [w.id, other.id, third.id].join(','));
    if (ci < 3) add(w, 'solo');
  });
  return {out, god: god ? god.name : null, n: cast.length};
}`;

// ---------------------------------------------------------------- lints
const SEGS = p => p.split(/,\s*/).map(s => s.trim().toLowerCase()).filter(Boolean);
const count = (p, re) => (p.match(re) || []).length;
// rough CLIP/T5 token estimate: ~1.3 tokens per word plus punctuation
const tokens = p => Math.round(p.split(/\s+/).filter(Boolean).length * 1.3 + count(p, /[,.:;]/g));
function lint(r) {
  const p = r.prompt, L = [], err = (c, m) => L.push({lvl:'error', c, m}), warn = (c, m) => L.push({lvl:'warn', c, m});
  if (p.startsWith('THROW')) { err('throw', p); return L; }
  if (/[{}]/.test(p)) err('brace', 'stray brace');
  if (/\bundefined\b|\bnull\b|\bNaN\b/.test(p)) err('undef', 'undefined/null in prompt');
  if (/,\s*,|\s{2,}/.test(p)) warn('spacing', 'empty segment or double space');
  // repeats inside one block (scene lead, a woman's labelled block, the setting); two women can both be "completely nude"
  p.split(/\b(?:the (?:first|second|other) woman|the woman|the futanari|the other women):|;/i).forEach(b => { const seen = {};
    SEGS(b).forEach(s => { if (s.length > 3) seen[s] = (seen[s] || 0) + 1; });
    Object.entries(seen).filter(([, n]) => n > 1).forEach(([s]) => warn('dup', `repeated segment "${s}"`)); });
  const twoWomen = /^(pair|cpair)/.test(r.fam);
  if (twoWomen && /\b(man|men|male|his|him|viewer|1boy|boy)\b/i.test(p.replace(/\b(woman|women|human|humanoid)\b/gi, ''))) err('man-leak', 'a man / viewer appears in a two-women picture: ' + (p.match(/[^,]*\b(man|male|his|him|viewer|1boy)\b[^,]*/i) || [''])[0].trim());
  if (r.fam === 'pair_fem' && /penis|futanari|cock|shaft/i.test(p)) err('futa-leak', 'penis wording in a fem pair');
  if (/^pair_(futa|selffuta)|cpair_futa/.test(r.fam) && !/futanari/i.test(p)) err('futa-missing', 'no futanari in a futa scene');
  if (/^(pair|cpair|duo)/.test(r.fam)) {
    const labels = count(p, /\b(the other woman|the first woman|the second woman|the woman|the futanari):/gi);
    if (labels < 2 && !/cpair/.test(r.fam)) warn('labels', `only ${labels} labelled woman block(s)`);
  }
  if (r.fam === 'duo' && !/2girls/.test(p)) err('heads', 'duo without 2girls');
  if (r.fam === 'ddate' && /~~with:/.test(r.scene) && !(/the first woman:/.test(p) && /the second woman:/.test(p) && /the man:/.test(p))) err('labels', 'double date without all three labelled');
  if (count(p, /\bpov\b/gi) > 2) warn('pov', `"pov" ${count(p, /\bpov\b/gi)}x`);
  const blocks = p.split(/\b(?:the (?:first|second|other) woman|the woman|the futanari|the other women):|;/i);
  const busts = Math.max(...blocks.map(b => count(b, /\b(breasts?|chest|bust|cleavage)\b/gi))); if (busts > 3) warn('bust', `breasts/chest named ${busts}x in one block`);
  if (/average sized breasts/i.test(p)) warn('avg-bust', 'average bust spelled out');
  if (r.cloth === 'dressed' && /\b(nude|naked|bare breasts|pubic)\b/i.test(p) && !/pulled aside|pushed aside/i.test(p)) warn('dress-clash', 'dressed but nude wording');
  if (/\bhair hair\b|\beyes eyes\b|\bskin skin\b/i.test(p)) warn('stutter', 'doubled noun');
  const t = tokens(p); if (t > 230) warn('long', `~${t} tokens`);
  if (/\b(she|her)\b/i.test(p) && /^(pair|cpair)/.test(r.fam)) { const n = count(p, /\b(she|her)\b/gi); if (n > 4) warn('pronoun', `"her/she" ${n}x in a two-women prompt (ambiguous)`); }
  if (/\bTODO\b/.test(p)) err('todo', 'TODO in prompt');
  return L;
}

// ---------------------------------------------------------------- run
const TYPES = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const server = http.createServer((q, r) => {
  if (q.url === '/favicon.ico') { r.writeHead(204); return r.end(); }
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r);
}).listen(0);
const browser = await pw.chromium.launch(Object.assign({args:['--no-proxy-server']}, process.env.CHROME ? { executablePath: process.env.CHROME } : {}));
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => d.accept());
await page.addInitScript(seed => { let a = seed >>> 0; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }, SEED);
await page.goto(`http://localhost:${server.address().port}/index.html`);
const res = await page.evaluate(`(${GEN})(${JSON.stringify({only: ONLY})})`);
await browser.close(); server.close();

const rows = res.out.map(r => Object.assign(r, {lint: lint(r), tok: tokens(r.prompt)}));
const fams = [...new Set(rows.map(r => r.fam))];
const byCode = {};
rows.forEach(r => r.lint.forEach(l => { (byCode[l.lvl + ':' + l.c] = byCode[l.lvl + ':' + l.c] || []).push(r); }));
const md = [`# Image prompt audit (seed ${SEED})`, '', `${rows.length} prompts, ${res.n} ladies${res.god ? ', goddess: ' + res.god : ''}. Page errors: ${errors.length ? errors.slice(0, 5).join(' | ') : 'none'}.`, '',
  '## Summary by family', '', '| family | prompts | avg ~tokens | max | errors | warnings |', '|---|---|---|---|---|---|',
  ...fams.map(f => { const R = rows.filter(r => r.fam === f), e = R.reduce((t, r) => t + r.lint.filter(l => l.lvl === 'error').length, 0), w = R.reduce((t, r) => t + r.lint.filter(l => l.lvl === 'warn').length, 0);
    return `| ${f} | ${R.length} | ${Math.round(R.reduce((t, r) => t + r.tok, 0) / R.length)} | ${Math.max(...R.map(r => r.tok))} | ${e} | ${w} |`; }),
  '', '## Lint findings', '', '| finding | count | example scene | example |', '|---|---|---|---|',
  ...Object.entries(byCode).sort((a, b) => b[1].length - a[1].length).map(([c, R]) => `| ${c} | ${R.length} | \`${R[0].scene}\` | ${R[0].lint.find(l => l.lvl + ':' + l.c === c).m.replace(/\|/g, '/')} |`),
  '', '## Samples (first two per family)', ''];
fams.forEach(f => { md.push(`### ${f}`, ''); rows.filter(r => r.fam === f).slice(0, 2).forEach(r => md.push(`- **${r.who}** · ${r.body} · \`${r.scene}\` · ${r.cloth}${r.lint.length ? ' · ⚠ ' + r.lint.map(l => l.c).join(', ') : ''}`, '', '  > ' + r.prompt, '')); });
fs.writeFileSync(OUT, md.join('\n'));
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(rows, null, 1));
const nErr = rows.reduce((t, r) => t + r.lint.filter(l => l.lvl === 'error').length, 0), nWarn = rows.reduce((t, r) => t + r.lint.filter(l => l.lvl === 'warn').length, 0);
console.log(`${rows.length} prompts · ${nErr} errors · ${nWarn} warnings · page errors ${errors.length} → ${path.relative(root, OUT)}`);
process.exit(STRICT && (nErr || errors.length) ? 1 : 0);
