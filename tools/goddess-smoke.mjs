// Goddess smoke test: plays 5 cycles of NG+ to her binding, every focus, nights until her ending. Usage: node tools/goddess-smoke.mjs [weeks per cycle]
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
  const out = [];
  newGame({past:'salaryman', house:'lantern', partner:'nerys'}); closeModal();
  goddessIntro(showIntro); if (!S.goddess.met) throw new Error('intro did not mark met'); gNext(); closeModal();
  const drain = () => { let g = 0; while ((EVQ.length || CUR_EV) && g < 40) { if (CUR_EV) { if (String(CUR_EV.who).startsWith('npc_goddess')) out.push('ev:' + CUR_EV.title); evChoice(Math.floor(Math.random()*CUR_EV.choices.length)); CUR_EV = null; } closeModal(); runQueue(); g++; } closeModal(); };
  const play = n => { for (let i = 0; i < n && !S.over; i++) { if (S.ap > 0) { samWork('rounds'); closeModal(); } endWeek(); closeModal(); drain(); S.gold = Math.max(S.gold, 3000); S.debt.strikes = 0; } };
  const ng = () => {
    S.won = true; S.workers.forEach(w => { if (!w.traits.includes('Devoted')) w.traits.push('Devoted'); });
    startNGPlus(); NGS.partner = 'none'; NGS.boon = Object.keys(NG_BOONS).find(k => !(S.boons||[]).includes(k)) || null; NGS.house = NGS.offers[0] || null; NGS.past = 'none';
    carriedLovers().forEach(w => { const p = NG_PERKS().find(t => !(w.ngPerks||[]).includes(t)); if (p) NGS.perks[w.id] = p; });
    ngBegin(); let k = 0; while (GNEXT && k < 5) { gNext(); k++; } closeModal();
  };
  play(weeks);
  const evC1 = out.length;
  for (let c = 2; c <= 5; c++) { ng(); play(weeks); }
  out.push('cycle ' + S.cycle + ' bound=' + S.goddess.bound + ' jealousy=' + Math.round(S.goddess.jealousy) + ' love=' + Math.round(S.goddess.love) + ' teases=' + S.goddess.teases.length + ' maxReborn=' + Math.max(...S.workers.map(w=>w.reborn||0)));
  ng();   // cycle 6: binding
  if (!S.goddess.bound) throw new Error('not bound at cycle ' + S.cycle);
  TAB = 'goddess'; render(); if (!document.querySelector('#view').innerHTML.includes('Guidance')) throw new Error('no goddess tab');
  for (const f of GFOCUS) { setGFocus(f); play(3); }
  setGShape('demon'); TAB = 'goddess'; render(); out.push('form ' + godId());
  setGForm('futa'); play(2);
  out.push('before nights: over=' + S.over + ' won=' + S.won + ' ap=' + S.ap + ' active=' + goddessActive());
  const l0 = S.goddess.love; play(6); out.push('neglect 6 weeks: love ' + Math.round(l0) + ' -> ' + Math.round(S.goddess.love));
  const pr = Object.keys(GOD_FORMS).map(r => buildPrompt(NPCS[godNpcId(r)], 'samact:cowgirl') && r).join(',') + ' ' + buildPrompt(NPCS[godNpcId('beastkin')], 'portrait'); out.push('prompt ok: ' + String(pr && (pr.prompt || pr)).slice(0, 700));
  out.push('svc line: ' + gSvcLine('kiss', 'futa', 'Mira') + ' | ' + gSvcLine('doggy', 'futa', 'Mira'));
  goddessNightMenu(); closeModal(); S.ap = 3; S.sam.energy = 100; goddessNight('kiss'); closeModal(); goddessNight('oral_give'); closeModal();
  let n = 0; while (!S.goddess.ending && n < 60) { S.ap = 3; S.sam.energy = 100; goddessNight(pick(['cowgirl','missionary','doggy'])); closeModal(); drain(); n++; if (n % 2 === 0) play(1); }
  out.push('after bind: div=' + Math.round(S.goddess.divinity) + ' ending=' + S.goddess.ending + ' love=' + Math.round(S.goddess.love) + ' nights=' + S.goddess.nights + ' power=' + goddessPower().toFixed(2));
  out.push('lastReport goddess lines: ' + (S.lastReport.lines||[]).filter(l=>l.startsWith('✨')).length);
  ng(); play(2);
  out.push('cycle1 goddess events: ' + evC1);
  return { week: S.week, workers: S.workers.length, gold: Math.round(S.gold), out };
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
  console.log(res.out.join('\n')); console.log(`${target}: reached week ${res.week}, ${res.workers} workers, ${res.gold}g. ${errors.length ? 'ERRORS:\n  ' + errors.slice(0, 8).join('\n  ') : 'no errors'}`);
  if (errors.length) failed = true;
  await page.close();
}
await browser.close(); server.close();
process.exit(failed ? 1 : 0);
