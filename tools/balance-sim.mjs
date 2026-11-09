// Balance simulation (no game files touched). Usage: node tools/balance-sim.mjs [A|B|AB] [runsA] [runsB]
// Experiment A: per-house 52-week economy with a fixed bot. Experiment B: per-race courtesan groups, 20 weeks.
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require(process.env.PLAYWRIGHT_PATH || '/opt/node-tools/node_modules/playwright'); }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const argv = process.argv.slice(2); let PATCH = null; const pi = argv.indexOf('--patch');
if (pi >= 0) { PATCH = JSON.parse(fs.readFileSync(argv[pi+1], 'utf8')); argv.splice(pi, 2); }
const MODE = argv[0] || 'AB', RA = +argv[1] || 8, RB = +argv[2] || 6;
const OUTF = PATCH ? 'balance-sim.patched.out.json' : 'balance-sim.out.json';
const TYPES = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const server = http.createServer((q, r) => {
  if (q.url === '/favicon.ico') { r.writeHead(204); return r.end(); }
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r);
}).listen(0);
const PORT = server.address().port;
const browser = await pw.chromium.launch({ args:['--no-proxy-server'], executablePath: process.env.CHROME || '/usr/bin/google-chrome' });

const COMMON = `
function deepMerge(t, p){ for (const k of Object.keys(p)) { if (p[k] && typeof p[k] === 'object' && !Array.isArray(p[k]) && t[k] && typeof t[k] === 'object') deepMerge(t[k], p[k]); else t[k] = p[k]; } }
function applyPatch(P){ if (P.houses) deepMerge(HOUSES, P.houses); if (P.races) deepMerge(RACES, P.races); if (P.economy) deepMerge(ECON, P.economy); if (P.balance) deepMerge(BAL, P.balance); }
const sleep0 = () => new Promise(r => setTimeout(r, 0));
async function boot(){ await new Promise(r => { const t = setInterval(() => { if (typeof SETUP !== 'undefined' && (SETUP || S)) { clearInterval(t); r(); } }, 50); }); }
function resolveEvents(){ let g = 0; while ((EVQ.length || CUR_EV) && g < 40) { if (CUR_EV) { evChoice(CUR_EV.title === 'Contract Renewal' ? 0 : Math.floor(Math.random()*CUR_EV.choices.length)); CUR_EV = null; } closeModal(); runQueue(); g++; } closeModal(); }
function restLogic(){   // rest at <30% energy, back to work at >60%
  S.workers.forEach(w => {
    const mx = maxEnergy(w), isRest = w.job === 'rest';
    if (!isRest && w.energy < mx*0.30) { w.job = 'rest'; w._rw = (w._rw||0); }
    else if (isRest && w.energy > mx*0.60 || (isRest && !w._wasRest)) {
      for (const j of (w._order || ['courtesan','promoter','attendant','bartender','maid'])) { if (!canDo(w, j)) { w.job = j; break; } }
    }
    w._wasRest = true;
  });
}
`;

const BOT_A = `async (houseId, weeks) => {
  ${COMMON}
  await boot();
  if (window.__PATCH) applyPatch(window.__PATCH);
  store.del(KEY_SAVE); EVQ = []; CUR_EV = null;
  newGame({past:'salaryman', house:houseId, partner:'kaede'}); closeModal();
  const h = S.houses[0], HD = HOUSES[houseId];
  const stat = { cost:HD.cost, debt:HD.debt, upkeep:HD.upkeep, size:HD.size, rooms:HD.rooms, quarters:HD.quarters, beds:HD.beds, demand:HD.demand };
  const wk0 = {rooms:h.rooms, quarters:h.quarters, beds:h.beds, size:houseSize(h), debt:S.debt.total, upkeepStat:HD.upkeep, demand:HD.demand, cls:HD.cls, hauntRep:HD.hauntRep, haunted:HD.haunted};
  const DG = {n:0, led:{}, cls:{}, upkeep:0, wages:0, income:0, served:0, turned:0, short:0, sat:0, repDelta:0, sam:0, accProps:0, selfProps:0, escorts:0, roomCap:0, roomsUsed:0, byAct:0};
  const _pc = window.pickClass; if (!window.__pcw) { window.__pcw = true; window.pickClass = function(hh){ const c = _pc.apply(this, arguments); if (window.__CLS) window.__CLS[c.id] = (window.__CLS[c.id]||0)+1; return c; }; }
  const HQ = []; const snaps = {}, weekly = [], CP = [4,8,13,26,39,52]; let paidWeek = null, overWeek = null, hired = 0, quartersBought = 0, roomsBought = 0, bedsBought = 0, floorSum = 0;
  const AMEN = [['bath','bath'],['dancer','stage'],['bartender','bar']];
  const cnt = j => S.workers.filter(x => x.job === j).length;
  const wantAmen = j => { const up = AMEN.find(a => a[0] === j); return up && h.up[up[1]]; };
  const assign = w => { for (const j of ['bath','dancer','bartender','courtesan','promoter','attendant','maid']) {
      if (AMEN.some(a => a[0] === j)) { if (!wantAmen(j) || cnt(j) >= 1) continue; }
      if (!canDo(w, j)) { setJob(w.id, j); closeModal(); if (w.job === j) return; } } };
  function jobs(){
    S.workers.forEach(w => { const mx = maxEnergy(w);
      if (w.job !== 'rest' && w.energy < mx*0.30) w.job = 'rest'; });
    // amenity roles first, from anyone rested enough (else a working non-amenity lady)
    for (const [j] of AMEN) { if (!wantAmen(j) || cnt(j) >= 1) continue;
      const pool = S.workers.filter(w => !AMEN.some(a => a[0] === w.job) && !canDo(w, j));
      pool.sort((a,b) => (a.job==='rest'?0:1) - (b.job==='rest'?0:1) || b.energy - a.energy);
      if (pool.length && (pool[0].job !== 'rest' || pool[0].energy > maxEnergy(pool[0])*0.6)) { setJob(pool[0].id, j); closeModal(); } }
    S.workers.forEach(w => { if (w.job === 'rest' && w.energy > maxEnergy(w)*0.6) assign(w); });
  }
  for (let i = 0; i < weeks && !S.over; i++) {
    const LR = S.lastReport, hr0 = LR && LR.houses.find(x => x.id === h.id);
    const upk = LR ? LR.upkeep + LR.wages : 150, reserve = 300 + upk;
    // more bedrooms when clients were turned away / rooms were short
    if (hr0 && (hr0.turned > 0 || hr0.short) && roomsUsed(h) + 1 <= houseSize(h) && S.gold >= upgradeCost(h,'room') + reserve) { const r0 = h.rooms; buyUpgrade('room'); closeModal(); if (h.rooms > r0) roomsBought++; }
    for (let g = 0; g < 6; g++) {
      const beds = bedsFor(h), sl = sleepers(h).length;
      if (S.workers.length >= 10) break;
      if (sl >= beds) {
        if ((h.extraBeds||0) < maxExtraBeds(h) && S.gold > reserve + upgradeCost(h,'extraBed')) { buyUpgrade('extraBed'); closeModal(); bedsBought++; continue; }
        if (roomsUsed(h)+1 <= houseSize(h) && S.gold > reserve + upgradeCost(h,'quarters') + 150) { const q0 = h.quarters; buyUpgrade('quarters'); closeModal(); if (h.quarters > q0) quartersBought++; continue; }
        break;
      }
      const c = S.candidates.filter(x => !raceBlock(x, h) && S.gold - x.signing >= reserve).sort((a,b)=>a.signing-b.signing)[0];
      if (!c) break;
      HQ.push({q:STAT_KEYS.reduce((a,k)=>a+s100(c.stats[k]),0)/6, wage:c.wage, sign:c.signing}); hire(c.id); hired++; closeModal();
    }
    jobs();
    let g2 = 0; while (S.ap > 0 && g2++ < 6) { if (S.sam.energy >= 25) samWork('bartend'); else samRest(); closeModal(); }
    const wk = S.week; const rep0 = h.rep; window.__CLS = {};
    endWeek(); closeModal(); resolveEvents();
    const R = S.lastReport;
    const net = R.income - R.wages - R.upkeep - (R.recharge||0);
    floorSum += R.houses.reduce((a,x)=>a+(x.floor?x.floor.length:0),0);
    weekly.push({wk, net:Math.round(net)});
    if (wk >= 10 && wk <= 30) { const hh = R.houses[0]; DG.n++; for (const k in R.led) DG.led[k] = (DG.led[k]||0) + R.led[k]; for (const k in window.__CLS) DG.cls[k] = (DG.cls[k]||0) + window.__CLS[k];
      DG.upkeep += R.upkeep; DG.wages += R.wages; DG.income += R.income; DG.served += hh.served; DG.turned += hh.turned; DG.short += hh.short; DG.sat += hh.avgSat; DG.repDelta += h.rep - rep0; DG.accProps += hh.accProps; DG.selfProps += hh.selfProps; DG.escorts += S.workers.filter(x=>x.job==='courtesan').length; for (const x of S.workers) DG['job.'+x.job] = (DG['job.'+x.job]||0)+1; DG.trustAvg = (DG.trustAvg||0) + S.workers.reduce((a,x)=>a+x.trust,0)/S.workers.length; DG.rested = (DG.rested||0)+0; DG.roomCap += hh.roomCap; DG.roomsUsed += hh.roomsUsed; DG.sam += R.led.sam; }
    if (S.debt.remaining <= 0 && paidWeek === null) paidWeek = wk;
    if (CP.includes(wk)) snaps[wk] = { gold:Math.round(S.gold), debt:Math.round(S.debt.remaining), rep:Math.round(h.rep*10)/10, staff:S.workers.length, income:Math.round(R.income), net:Math.round(net), turned:R.turned, rooms:h.rooms };
    if (S.over) overWeek = wk;
  }
  return { DG, beat:h.story.beat, bonus:h.bonus, rep52:h.rep, HQ, wk0, stat, snaps, weekly, paidWeek, overWeek, strikes:S.debt.strikes, hired, quartersBought, roomsBought, bedsBought, floorSum, finalRooms:h.rooms };
}`;

const BOT_B = `async (race, sub, weeks, nLadies) => {
  ${COMMON}
  await boot();
  if (window.__PATCH) applyPatch(window.__PATCH);
  store.del(KEY_SAVE); EVQ = []; CUR_EV = null;
  newGame({past:'salaryman', house:'lantern', partner:'kaede'}); closeModal();
  const h = S.houses[0];
  S.workers = []; S.candidates = [];            // clean slate: only the test group
  h.up.tether = true; h.up.charger = true; h.rep = +(window.__REP||60); h.rooms = 8; h.quarters = 5; h.beds = 1;
  const group = [];
  for (let i = 0; i < nLadies; i++) {
    let w, tries = 0;
    do { w = genWorker({race}); tries++; } while (sub && w.sub !== sub && tries < 400);
    w.signingCost = signingFor(w); w.house = 'lantern'; w.contract = 999; w.keep = true; w.trust = 100; w.job = 'rest';
    S.workers.push(w);
    w._order = ['courtesan'];
    const msg = canDo(w, 'courtesan');
    if (!msg) { w.job = 'courtesan'; if (!w.menu.length) w.menu = getActs().filter(a=>clientStance(w,a.id)==='yes').map(a=>a.id); }
    else { w.job = 'courtesan'; w.menu = getActs().filter(a=>clientStance(w,a.id)!=='no').map(a=>a.id); w._forced = msg; }   // forced: she is not comfortable with anything yet
    w.stat0 = Object.fromEntries(STAT_KEYS.map(k=>[k, s100(w.stats[k])])); w.lewd0 = w.lewd; w.beauty0 = s100(w.stats.beauty);
    group.push(w);
  }
  const rows = group.map(w => ({id:w.id, race:w.race, sub:w.sub, sign:w.signingCost, wage:w.wage, stats:w.stat0, lewd0:Math.round(w.lewd0), forced:w._forced||'', menu0:w.menu.length, weeks:[]}));
  for (let wk = 1; wk <= weeks; wk++) {
    S.gold = 100000; S.debt.strikes = 0; S.debt.remaining = 1e9;
    // lantern bots: rest logic on the group only
    group.forEach(w => { if (!S.workers.includes(w)) return; const mx = maxEnergy(w);
      if (w.job !== 'rest' && w.energy < mx*0.30) w.job = 'rest';
      else if (w.job === 'rest' && w.energy > mx*0.60 && !canDo(w,'courtesan')) w.job = 'courtesan'; });
    const startJob = Object.fromEntries(group.map(w => [w.id, w.job]));
    endWeek(); closeModal(); resolveEvents();
    const R = S.lastReport;
    group.forEach((w, i) => { const pr = R.per[w.id]; if (!pr) { rows[i].weeks.push(null); return; }
      rows[i].weeks.push({job:startJob[w.id], earned:Math.round(pr.earned), wage:w.wage, served:pr.served, props:pr.props||0, notMood:pr.notMood||0, reluct:pr.reluct||0, e0:pr.e0, e1:Math.round(w.energy), mood:Math.round(w.mood), lust:Math.round(w.lust||0), here:S.workers.includes(w)}); });
    if (S.workers.length < group.length) { /* someone left; keep going */ }
  }
  return { rows, houseIncome: null, left: group.filter(w=>!S.workers.includes(w)).length };
}`;

const mean = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : NaN;
const r1 = x => Math.round(x*10)/10;
async function newPage() {
  const page = await browser.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
  await page.goto(`http://localhost:${PORT}/index.html`); page.errors = errors; if (PATCH) await page.evaluate(`window.__PATCH=${JSON.stringify(PATCH)}`); if (process.env.REP) await page.evaluate(`window.__REP=${+process.env.REP}`); if (process.env.NLADIES) await page.evaluate(`window.__NL=${+process.env.NLADIES}`); return page;
}
const out = {};
if (MODE.includes('A')) {
  const HOUSES = (process.env.HOUSES || 'lantern,castle,onsen,hollow,tankard,pavilion,veil,wayfarer').split(',');
  out.A = {};
  for (const hid of HOUSES) {
    const runs = [];
    for (let i = 0; i < RA; i++) {
      const page = await newPage();
      try { runs.push(await page.evaluate(`(${BOT_A})('${hid}', 52)`)); } catch (e) { console.error(hid, 'run failed', e.message.slice(0,200)); }
      if (page.errors.length) console.error(hid, 'page errors', page.errors.slice(0,2));
      await page.close();
    }
    const sum = { diag:(()=>{ const o = {}; const N = runs.reduce((a,r)=>a+r.DG.n,0)||1; const add = (t,k,v)=>t[k]=(t[k]||0)+v;
      runs.forEach(r=>{ for (const [k,v] of Object.entries(r.DG)) { if (k==='led'||k==='cls') for (const [a,b] of Object.entries(v)) add(o,k+'.'+a,b); else if (k!=='n') add(o,k,v); } });
      for (const k in o) o[k] = Math.round(o[k]/N*10)/10; o.beatMean = r1(mean(runs.map(r=>r.beat))); o.bonus = runs.map(r=>JSON.stringify(r.bonus)).filter((v,i,a)=>a.indexOf(v)===i).join(';'); o.feePerSvc = Math.round((o['led.escort']||0)/Math.max(1,o.served)*10)/10; return o; })(), hq:(()=>{ const a=runs.flatMap(r=>r.HQ); const m=k=>a.length?Math.round(a.reduce((x,y)=>x+y[k],0)/a.length*10)/10:0; return {n:a.length, q:m('q'), wage:m('wage'), sign:m('sign')}; })(), g52med:(()=>{ const v=runs.map(r=>(r.snaps[52]||{}).gold).filter(x=>x!==undefined).sort((a,b)=>a-b); return v.length?(v[(v.length-1>>1)]+v[v.length>>1])/2:null; })(), stat: runs[0] && runs[0].stat, wk0: runs[0] && runs[0].wk0, n: runs.length, over: runs.filter(r=>r.overWeek).map(r=>r.overWeek), paid: runs.filter(r=>r.paidWeek).map(r=>r.paidWeek), checkpoints:{}, netAt:{}, hired:r1(mean(runs.map(r=>r.hired))), quarters:r1(mean(runs.map(r=>r.quartersBought))), roomsBought:r1(mean(runs.map(r=>r.roomsBought))), bedsBought:r1(mean(runs.map(r=>r.bedsBought))), floorPerWeek:r1(mean(runs.map(r=>r.floorSum/52))) };
    for (const wk of [4,8,13,26,39,52]) {
      const s = runs.map(r => r.snaps[wk]).filter(Boolean);
      const f = k => s.length ? `${r1(mean(s.map(x=>x[k])))} [${Math.min(...s.map(x=>x[k]))}..${Math.max(...s.map(x=>x[k]))}]` : 'n/a(over)';
      sum.checkpoints[wk] = { n:s.length, gold:f('gold'), debt:f('debt'), rep:f('rep'), staff:f('staff'), income:f('income'), net:f('net'), turned:f('turned') };
    }
    for (const wk of [5,15,30]) { const v = runs.map(r => (r.weekly.find(x=>x.wk===wk)||{}).net).filter(x=>x!==undefined); sum.netAt[wk] = v.length ? `${r1(mean(v))} [${Math.min(...v)}..${Math.max(...v)}]` : 'n/a'; }
    out.A[hid] = sum; console.error('A done', hid);
  }
}
if (MODE.includes('B')) {
  const GROUPS_ALL = [['human',''],['elf',''],['beastkin',''],['beastkin','fox'],['beastkin','cat'],['beastkin','wolf'],['beastkin','rabbit'],['beastkin','dragon'],['demon',''],['dwarf',''],['spirit',''],['angel',''],['android','']];
  const GROUPS = process.env.GROUPS ? GROUPS_ALL.filter(g => process.env.GROUPS.split(',').includes(g[1] ? g[0]+'/'+g[1] : g[0])) : GROUPS_ALL;
  out.B = {};
  for (const [race, sub] of GROUPS) {
    const label = sub ? `${race}/${sub}` : race, ladies = [];
    for (let i = 0; i < RB; i++) {
      const page = await newPage();
      try { const r = await page.evaluate(`(${BOT_B})('${race}','${sub}', 20, ${+process.env.NLADIES||6})`); ladies.push(...r.rows); } catch (e) { console.error(label, 'run failed', e.message.slice(0,200)); }
      if (page.errors.length) console.error(label, 'page errors', page.errors.slice(0,2));
      await page.close();
    }
    // beastkin aggregate (no sub filter) is the natural weighted mix
    const W = ladies.flatMap(l => l.weeks.filter(Boolean));
    const per = k => r1(mean(W.map(x=>x[k])));
    const earned = per('earned'), wage = per('wage');
    const st = {}; for (const k of Object.keys((ladies[0]||{stats:{}}).stats)) st[k] = r1(mean(ladies.map(l=>l.stats[k])));
    out.B[label] = { ladies: ladies.length, sign: Math.round(mean(ladies.map(l=>l.sign))), wage0: Math.round(mean(ladies.map(l=>l.wage))), earned, wage, net: r1(earned - wage),
      restShare: r1(100*W.filter(x=>x.job==='rest').length/W.length), e1: per('e1'), mood: per('mood'), lust: per('lust'), served: per('served'), notMood: per('notMood'), reluct: per('reluct'),
      forced: ladies.filter(l=>l.forced).length, lewd0: r1(mean(ladies.map(l=>l.lewd0))), stats: st,
      earnedWhenWorking: r1(mean(W.filter(x=>x.job!=='rest').map(x=>x.earned))) };
    console.error('B done', label);
  }
}
fs.writeFileSync(path.join(root, 'tools', OUTF), JSON.stringify(out));
if (out.A) { const m = (c,wk,k) => c[wk][k].split(' ')[0];
  for (const [hid,s] of Object.entries(out.A)) console.log('wk0', hid, JSON.stringify(s.wk0));
  console.log('house | net5/15/30 | gold13/26/52 | rep52 | net52 | turned52 | staff52 | roomsBought | qtrs+beds | over | paid');
  for (const [hid, s] of Object.entries(out.A)) { const c = s.checkpoints, n = s.netAt;
    console.log([hid, [5,15,30].map(w=>n[w].split(' ')[0]).join('/'), [13,26,52].map(w=>m(c,w,'gold')).join('/'), m(c,52,'rep'), m(c,52,'net'), m(c,52,'turned'), m(c,52,'staff'), 'med52gold='+s.g52med, 'hired q/wage/sign='+s.hq.q+'/'+s.hq.wage+'/'+s.hq.sign, s.roomsBought, s.quarters+'+'+s.bedsBought, s.over.length?s.over.join(','):'-', s.paid.length+'/'+s.n].join(' | ')); } }
if (out.B) console.log(JSON.stringify(out.B));
await browser.close(); server.close();
