// Smoke test: loads the game (split version via index.html, and the built single file),
// starts a new game and plays N weeks with a simple bot, failing on any page error.
// Usage: node tools/smoke.mjs [weeks]      (needs `playwright`; set CHROME=/path/to/chrome if needed)
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require(process.env.PLAYWRIGHT_PATH || 'playwright'); }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const WEEKS = +process.argv[2] || 30;

const BOT = `async (weeks) => {
  await new Promise(r => { const t = setInterval(() => { if (typeof SETUP !== 'undefined' && (SETUP || S)) { clearInterval(t); r(); } }, 50); });
  store.del(KEY_SAVE); EVQ = []; CUR_EV = null;
  newGame({past:'salaryman', house:'lantern', partner:'kaede'}); closeModal();
  for (let i = 0; i < weeks && !S.over; i++) {
    const p = S.workers.find(w => w.isPartner);
    if (p && S.ap > 0) { samDate(p.id, 'walk'); closeModal(); }
    if (S.ap > 0) { samWork('rounds'); closeModal(); }
    if (S.ap > 0) { samRest(); closeModal(); }
    if (i === 1) { S.gold = Math.max(S.gold, 9000); buyUpgrade('suite'); buySamUp('notebook'); closeModal(); }
    throwFeast(BAL.feast.tiers[0].id); closeModal();
    if (i === 2) { setTutor(S.workers[0].id, 'job'); if (S.workers[1]) { setTutor(S.workers[1].id, 'weak'); setTutorTier(S.workers[1].id, 'master'); } closeModal(); }
    if (i === 3) { const m = BAL.gifts.beforeDebt; BAL.gifts.beforeDebt = 'action'; giftMenu(S.workers[0].id); buyGift(S.workers[0].id, 'trinket'); BAL.gifts.beforeDebt = 'free'; buyGift(S.workers[0].id, 'jewel'); BAL.gifts.beforeDebt = m; closeModal(); }
    endWeek(); closeModal();
    let g = 0; while ((EVQ.length || CUR_EV) && g < 25) { if (CUR_EV) { evChoice(Math.floor(Math.random()*CUR_EV.choices.length)); CUR_EV = null; } closeModal(); runQueue(); g++; } closeModal();
    S.gold = Math.max(S.gold, 2000); S.debt.strikes = 0;
    S.workers.forEach(w => { if (w.job === 'rest' && !w.prevJob && w.energy > maxEnergy(w)*0.6) { for (const j of ['courtesan','promoter','attendant','bartender','maid']) { if (!canDo(w, j)) { setJob(w.id, j); break; } } } });
    for (const t of TABS) { TAB = t[0]; render(); }
    openSheet(S.workers[0].id); openWardrobe(S.workers[0].id); closeModal();
  }
  return { week: S.week, workers: S.workers.length, gold: Math.round(S.gold) };
}`;

// tiny static server: the split version fetches data/*.json, which browsers block on file://
import http from 'node:http';
const TYPES = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const server = http.createServer((q, r) => {
  if (q.url === '/favicon.ico') { r.writeHead(204); return r.end(); }
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r);
}).listen(0);
const PORT = server.address().port;
const browser = await pw.chromium.launch(Object.assign({args:['--no-proxy-server']}, process.env.CHROME ? { executablePath: process.env.CHROME } : {}));
let failed = false;
for (const target of ['index.html', 'dist/hollowmere-nights.html']) {
  const file = path.join(root, target);
  if (!fs.existsSync(file)) { console.log(`skip ${target} (not built)`); continue; }
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('dialog', d => d.accept());
  await page.goto(`http://localhost:${PORT}/${target}`);
  const res = await page.evaluate(`(${BOT})(${WEEKS})`);
  console.log(`${target}: reached week ${res.week}, ${res.workers} workers, ${res.gold}g. ${errors.length ? 'ERRORS:\n  ' + errors.slice(0, 8).join('\n  ') : 'no errors'}`);
  if (errors.length) failed = true;
  await page.close();
}
await browser.close(); server.close();
process.exit(failed ? 1 : 0);
