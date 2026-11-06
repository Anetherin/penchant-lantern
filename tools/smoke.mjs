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
    if (S.ap > 0) { samRest(); closeModal(); }
    endWeek(); closeModal();
    let g = 0; while ((EVQ.length || CUR_EV) && g < 25) { if (CUR_EV) { evChoice(Math.floor(Math.random()*CUR_EV.choices.length)); CUR_EV = null; } closeModal(); runQueue(); g++; } closeModal();
    S.gold = Math.max(S.gold, 2000); S.debt.strikes = 0;
    S.workers.forEach(w => { if (w.job === 'rest' && !w.prevJob && w.energy > maxEnergy(w)*0.6) { for (const j of ['courtesan','companion','bartender','maid']) { if (!canDo(w, j)) { setJob(w.id, j); break; } } } });
    for (const t of TABS) { TAB = t[0]; render(); }
    openSheet(S.workers[0].id); openWardrobe(S.workers[0].id); closeModal();
  }
  return { week: S.week, workers: S.workers.length, gold: Math.round(S.gold) };
}`;

const browser = await pw.chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
let failed = false;
for (const target of ['index.html', 'dist/hollowmere-nights.html']) {
  const file = path.join(root, target);
  if (!fs.existsSync(file)) { console.log(`skip ${target} (not built)`); continue; }
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('dialog', d => d.accept());
  await page.goto('file://' + file);
  const res = await page.evaluate(`(${BOT})(${WEEKS})`);
  console.log(`${target}: reached week ${res.week}, ${res.workers} workers, ${res.gold}g. ${errors.length ? 'ERRORS:\n  ' + errors.slice(0, 8).join('\n  ') : 'no errors'}`);
  if (errors.length) failed = true;
  await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
