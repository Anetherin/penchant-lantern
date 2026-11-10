// NG+ vs cycle-1 difficulty sim. Usage: node tools/ngplus-sim.mjs [runs=3] [conc=3] ; env HOUSES=lantern,tankard,wayfarer BOONS=purse,ap
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require(process.env.PLAYWRIGHT_PATH || '/opt/node-tools/node_modules/playwright'); }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const RUNS = +process.argv[2] || 3, CONC = +process.argv[3] || 3;
const OUT = process.env.OUT || path.join(os.tmpdir(), 'ngplus-sim.out.json');
const TYPES = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const server = http.createServer((q, r) => {
  if (q.url === '/favicon.ico') { r.writeHead(204); return r.end(); }
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r);
}).listen(0);
const PORT = server.address().port;
const browser = await pw.chromium.launch({ args:['--no-proxy-server'], executablePath: process.env.CHROME || '/usr/bin/google-chrome' });

const BOT = `async (houseId, boon, maxWeeks) => {
  async function boot(){ await new Promise(r => { const t = setInterval(() => { if (typeof SETUP !== 'undefined' && (SETUP || S)) { clearInterval(t); r(); } }, 50); }); }
  function resolveEvents(){ let g = 0; while ((EVQ.length || CUR_EV) && g < 40) { if (CUR_EV) { evChoice(CUR_EV.title === 'Contract Renewal' ? 0 : Math.floor(Math.random()*CUR_EV.choices.length)); CUR_EV = null; } closeModal(); runQueue(); g++; } closeModal(); }
  const AMEN = [['bath','bath'],['dancer','stage'],['bartender','bar']];
  const CP = [4,8,13,26,39,52];
  async function cycle(label, maxWeeks){
    const start = { debt:S.debt.total, gold:Math.round(S.gold), samLvl:S.sam.lvl||1, workers:S.workers.length, houses:S.houses.map(h=>h.id), cycle:S.cycle||1, week0:S.week };
    const weekly = [], snaps = {}, pays = [], staff = [];
    let endWeekNo = null, hired = 0, bought = 0;
    const cnt = (h, j) => S.workers.filter(x => x.house === h.id && x.job === j).length;
    const wantAmen = (h, j) => { const up = AMEN.find(a => a[0] === j); return up && h.up[up[1]]; };
    const assign = (h, w) => { for (const j of ['bath','dancer','bartender','courtesan','promoter','attendant','maid']) {
        if (AMEN.some(a => a[0] === j)) { if (!wantAmen(h, j) || cnt(h, j) >= 1) continue; }
        if (!canDo(w, j)) { setJob(w.id, j); closeModal(); if (w.job === j) return; } } };
    function jobs(h){
      const mine = S.workers.filter(w => w.house === h.id);
      mine.forEach(w => { if (w.job !== 'rest' && w.energy < maxEnergy(w)*0.30) w.job = 'rest'; });
      for (const [j] of AMEN) { if (!wantAmen(h, j) || cnt(h, j) >= 1) continue;
        const pool = mine.filter(w => !AMEN.some(a => a[0] === w.job) && !canDo(w, j));
        pool.sort((a,b) => (a.job==='rest'?0:1) - (b.job==='rest'?0:1) || b.energy - a.energy);
        if (pool.length && (pool[0].job !== 'rest' || pool[0].energy > maxEnergy(pool[0])*0.6)) { setJob(pool[0].id, j); closeModal(); } }
      mine.forEach(w => { if (w.job === 'rest' && w.energy > maxEnergy(w)*0.6) assign(h, w); });
    }
    for (let i = 0; i < maxWeeks && !S.over && !S.won; i++) {
      const LR = S.lastReport;
      const upk = LR ? LR.upkeep + LR.wages : 150, reserve = 300 + upk;
      for (const h of S.houses.slice()) {
        S.cur = h.id;
        const hr0 = LR && LR.houses.find(x => x.id === h.id);
        if (hr0 && (hr0.turned > 0 || hr0.short) && roomsUsed(h) + 1 <= houseSize(h) && S.gold >= upgradeCost(h,'room') + reserve) { buyUpgrade('room'); closeModal(); bought++; }
        for (let g = 0; g < 6; g++) {
          const beds = bedsFor(h), sl = sleepers(h).length;
          if (S.workers.filter(w => w.house === h.id).length >= 10) break;
          if (sl >= beds) {
            if ((h.extraBeds||0) < maxExtraBeds(h) && S.gold > reserve + upgradeCost(h,'extraBed')) { buyUpgrade('extraBed'); closeModal(); bought++; continue; }
            if (roomsUsed(h)+1 <= houseSize(h) && S.gold > reserve + upgradeCost(h,'quarters') + 150) { buyUpgrade('quarters'); closeModal(); bought++; continue; }
            break;
          }
          const c = S.candidates.filter(x => !raceBlock(x, h) && S.gold - x.signing >= reserve).sort((a,b)=>a.signing-b.signing)[0];
          if (!c) break;
          hire(c.id); hired++; closeModal();
        }
        jobs(h);
      }
      S.cur = S.houses[0].id;
      let g2 = 0; while (S.ap > 0 && g2++ < 6) { if (S.sam.energy >= 25) samWork('bartend'); else samRest(); closeModal(); }
      const wk = i + 1, dw = debtWeek();
      let due = null;
      if (dw % BAL.debt.every === 0) { const nd = nextDue(); if (nd.amount > 0) due = { amount:nd.amount, n:nd.n, strikes0:S.debt.strikes, rem0:S.debt.remaining }; }
      endWeek();
      if (due) {   // gold right after endWeek (before event choices): paid -> add the payment back; missed -> unchanged
        const paid = S.debt.strikes === due.strikes0;
        const before = Math.round(S.gold + (paid ? due.amount : 0));
        pays.push({ wk, n:due.n, amount:due.amount, gold:before, margin:before - due.amount, paid });
      }
      closeModal(); resolveEvents();
      const R = S.lastReport;
      const net = R.income - R.wages - R.upkeep - (R.recharge||0);
      weekly.push(Math.round(net));
      if (CP.includes(wk) || wk%13===0) { snaps[wk] = { gold:Math.round(S.gold), debt:Math.round(S.debt.remaining), staff:S.workers.length, net:Math.round(net), strikes:S.debt.strikes }; }
      if (wk % 8 === 0) staff.push([wk, S.workers.length]);
      if (S.over || S.won) endWeekNo = wk;
    }
    const won = !!S.won, over = !!S.over, finished = won || over, weeksPlayed = weekly.length;
    const minM = (arr) => arr.length ? Math.min(...arr.map(p => p.margin)) : null;
    const early = pays.filter(p => p.n <= 5);
    return { label, start, weekly, snaps, pays, staff, won, over, finished, endWeek:endWeekNo, strikesEnd:S.debt.strikes, weeksPlayed, hired, bought,
      misses: pays.filter(p => !p.paid).length, minMarginEarly:minM(early), minMarginAll:minM(pays), goldEnd:Math.round(S.gold), peakNet: weekly.length ? Math.max(...weekly) : null };
  }
  await boot();
  store.del(KEY_SAVE); EVQ = []; CUR_EV = null;
  newGame({past:'salaryman', house:houseId, partner:'kaede'}); closeModal();
  const c1 = await cycle('c1', maxWeeks);
  if (!c1.won) return { c1, note: c1.over ? 'c1 game over' : 'c1 not finished' };
  closeModal();
  const goldAtWin = Math.round(S.gold);
  startNGPlus();
  const before = { lovers: carriedLovers().length, devoted: S.workers.filter(w=>has(w,'Devoted')).length, workers: S.workers.length, homeImpr: improvementsValue(H(homeHouse())), houses: S.houses.map(h=>h.id), goldAtWin };
  const free = PARTNERS.filter(k => !carriedLovers().some(w=>w.key===k));
  NGS.partner = free[0] || 'none'; NGS.boon = boon; NGS.house = NGS.offers[0] || null; NGS.past = 'none';
  carriedLovers().forEach(w => { const p = NG_PERKS().find(t => !(w.ngPerks||[]).includes(t)); if (p) NGS.perks[w.id] = p; });
  const N = ngNumbers(NGS.boon, NGS.house); before.N = {debt:N.debt, house:N.house, base:N.base, impr:N.impr, extra:N.extra, purse:N.purse, sale:N.sale};
  before.partner = NGS.partner; before.newHouse = NGS.house; before.offers = NGS.offers.slice();
  ngBegin(); closeModal(); resolveEvents();
  before.cycleAfter = S.cycle; before.housesAfter = S.houses.map(h=>h.id); before.workersAfter = S.workers.length;
  const c2 = await cycle('c2', maxWeeks);
  return { c1, c2, before };
}`;

async function one(hid, boon) {
  const page = await browser.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
  page.on('console', m => { if (m.type()==='error') errors.push('console: '+m.text().slice(0,200)); });
  await page.goto(`http://localhost:${PORT}/index.html`);
  let res; try { res = await page.evaluate(`(${BOT})('${hid}','${boon}',70)`); } catch (e) { res = { error: e.message.slice(0,400) }; }
  res.errors = errors; res.house = hid; res.boon = boon;
  await page.close(); return res;
}
const HS = (process.env.HOUSES || 'lantern,tankard,wayfarer').split(','), BS = (process.env.BOONS || 'ap').split(',');
const jobs = []; for (const h of HS) for (const b of BS) for (let i = 0; i < RUNS; i++) jobs.push([h, b]);
const results = []; let idx = 0; const t0 = Date.now();
await Promise.all(Array.from({length: CONC}, async () => { while (idx < jobs.length) { const [h, b] = jobs[idx++]; const r = await one(h, b); results.push(r); fs.writeFileSync(OUT, JSON.stringify(results)); console.error(`done ${h}/${b} (${results.length}/${jobs.length}) ${Math.round((Date.now()-t0)/1000)}s ${r.error||''}`); } }));
await browser.close(); server.close();
