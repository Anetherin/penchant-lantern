// Goddess smoke test: plays 5 cycles of NG+ to her binding, every focus, nights until her ending. Usage: node tools/goddess-smoke.mjs [weeks per cycle]
// starts a new game and plays N weeks with a simple bot, failing on any page error.
// Usage: node tools/smoke.mjs [weeks]      (needs `playwright`; set CHROME=/path/to/chrome if needed)
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let pw;
for (const m of ['playwright', process.env.PLAYWRIGHT_PATH, '/opt/node-tools/node_modules/playwright', path.resolve(process.execPath, '../../lib/node_modules/playwright')]) {
  if (!m) continue;
  try { pw = require(m); break; } catch {}
}
if (!pw) throw new Error('Cannot find module playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEEKS = +process.argv[2] || 30;

const BOT = `async (weeks) => {
  await new Promise(r => { const t = setInterval(() => { if (typeof SETUP !== 'undefined' && (SETUP || S)) { clearInterval(t); r(); } }, 50); });
  store.del(KEY_SAVE); EVQ = []; CUR_EV = null;
  const out = [];
  newGame({past:'salaryman', house:'lantern', partner:'nerys'}); closeModal();
  goddessIntro(showIntro); if (!S.goddess.met) throw new Error('intro did not mark met'); gNext(); closeModal();
  const drain = () => { let g = 0; while ((EVQ.length || CUR_EV) && g < 40) { if (CUR_EV) { if (String(CUR_EV.who).startsWith('npc_goddess')) out.push('ev:c' + S.cycle + ' ' + CUR_EV.who.slice(12) + ' ' + CUR_EV.title); evChoice(Math.floor(Math.random()*CUR_EV.choices.length)); CUR_EV = null; } closeModal(); runQueue(); g++; } closeModal(); };
  const play = n => { for (let i = 0; i < n && !S.over; i++) { if (S.ap > 0) { samWork('rounds'); closeModal(); } endWeek(); closeModal(); drain(); S.gold = Math.max(S.gold, 3000); S.debt.strikes = 0; } };
  const ng = () => {
    S.won = true; S.workers.forEach(w => { if (!w.traits.includes('Devoted')) w.traits.push('Devoted'); });
    startNGPlus(); NGS.partner = 'none'; NGS.boon = Object.keys(NG_BOONS).find(k => !(S.boons||[]).includes(k)) || null; NGS.house = NGS.offers[0] || null; NGS.past = 'none';
    carriedLovers().forEach(w => { const p = NG_PERKS().find(t => !(w.ngPerks||[]).includes(t)); if (p) NGS.perks[w.id] = p; });
    ngBegin(); let k = 0; while (GNEXT && k < 5) { gNext(); k++; } closeModal(); drain();
  };
  play(weeks);
  const evC1 = out.length;
  const w0 = S.workers[0], w0id = w0.id;
  w0.neglect = 5; w0.unhappy = 1; w0.health = 45; w0.mood = 25; w0.energy = 10; S.sam.energy = 10; w0._stud = S.week; w0._giftWk = S.week; w0._giftN = 2; w0._again = S.week; w0._samTime = 1; w0.firstHold = S.week + 3; w0.intimWk = S.week; w0.rekindleWk = S.week;
  S.houses[0].tidy = 20; S.houses[0].feastWk = S.week; S.houses[0].lastFlow = {promo:5,turned:3,served:2};
  S.samWeek.acts = ['Private time']; S.flags.samMovedWk = S.week; S.flags.sleepInWk = S.week; S.luxWk = {wk:S.week, n:{a:1}};
  iso().rivalWk = S.week; iso().visitWk = S.week;
  ng();
  const w0r = findW(w0id);
  if (!w0r || w0r.neglect !== 0 || w0r.unhappy !== 0 || w0r.health !== 100 || w0r.mood < 70 || w0r._stud !== undefined || w0r._giftWk !== undefined || w0r._again !== undefined || w0r._samTime !== 0 || w0r.firstHold !== 0 || w0r.intimWk !== undefined || w0r.rekindleWk !== undefined) throw new Error('ngReset did not clear worker neglect/cycle state');
  if (S.sam.energy !== samMaxEnergy() || !S.workers.every(w => w.energy === maxEnergy(w)) || !(S.alumni||[]).every(w => w.energy === maxEnergy(w))) throw new Error('ng+ did not reset energy to max for everyone');
  if (S.houses[0].tidy !== BAL.tidy.start || S.houses[0].feastWk !== undefined || S.houses[0].lastFlow !== undefined) throw new Error('ngBegin did not reset house cycle state');
  if (S.samWeek.acts.length || S.flags.samMovedWk !== undefined || S.flags.sleepInWk !== undefined || S.luxWk !== undefined || iso().rivalWk !== 0 || iso().visitWk !== -99) throw new Error('ngCycleReset did not clear cycle state');
  play(weeks);
  for (let c = 3; c <= 5; c++) { ng(); play(weeks); }
  const preIso = evGoddessIsolde('pre');
  if (!preIso || !preIso.choices || !preIso.choices.length) throw new Error('evGoddessIsolde(pre) failed before binding');
  preIso.choices[0].fx(); drain();
  out.push('cycle ' + S.cycle + ' bound=' + S.goddess.bound + ' jealousy=' + Math.round(S.goddess.jealousy) + ' love=' + Math.round(S.goddess.love) + ' teases=' + S.goddess.teases.length + ' knows=' + !!S.goddess.knows + ' maxReborn=' + Math.max(...S.workers.map(w=>w.reborn||0)));
  ng();   // cycle 6: binding
  if (!S.goddess.bound) throw new Error('not bound at cycle ' + S.cycle);
  TAB = 'goddess'; render(); if (!document.querySelector('#view').innerHTML.includes('Guidance')) throw new Error('no goddess tab');
  const j0 = S.goddess.jealousy, m0 = S.goddess.mood; S.goddess.jealousy = 0; S.goddess.mood = 80;
  setGFocus('clients'); play(1);
  if (!S.lastReport || !S.lastReport.godClients) throw new Error('bound goddess clients focus produced no godClients report');
  setGFocus('focus'); setFocus('office'); play(1); setFocus('classes'); play(1);
  S.goddess.jealousy = j0; S.goddess.mood = m0;
  const bFirst = evGoddessIsolde('first');
  if (!bFirst || !bFirst.choices || !bFirst.choices.length) throw new Error('evGoddessIsolde(first) failed');
  bFirst.choices[0].fx();
  const bRepeat = evGoddessIsolde('repeat');
  if (!bRepeat || !bRepeat.choices || !bRepeat.choices.length) throw new Error('evGoddessIsolde(repeat) failed');
  bRepeat.choices[0].fx();
  out.push('goddess isolde ok: seen=' + S.goddess.isoldeSeen);
  for (const f of GFOCUS) { setGFocus(f); play(3); }
  setGShape('demon'); TAB = 'goddess'; render(); out.push('form ' + godId());
  setGForm('futa'); play(2);
  out.push('before nights: over=' + S.over + ' won=' + S.won + ' ap=' + S.ap + ' active=' + goddessActive());
  const l0 = S.goddess.love; play(6); out.push('neglect 6 weeks: love ' + Math.round(l0) + ' -> ' + Math.round(S.goddess.love));
  const fKeys = Object.keys(GOD_FORMS), prAll = fKeys.every(r => !!buildPrompt(NPCS[godNpcId(r)], 'samact:cowgirl')) && !!buildPrompt(NPCS[godNpcId('fox')], 'portrait');
  if (!prAll) throw new Error('empty form prompt');
  out.push('prompt ok: ' + fKeys.join(','));
  const pp = buildPrompt(S.workers[0] || NPCS[godNpcId('elf')], 'pair:oral_give:futa:' + godNpcId('cat'));
  const sl1 = gSvcLine('kiss', 'futa', 'Mira'), sl2 = gSvcLine('doggy', 'futa', 'Mira');
  if (!pp || !sl1 || !sl2) throw new Error('empty pair prompt or svc line');
  out.push('pair+svc ok: pair=' + String(pp.prompt || pp).length + 'c lines=' + sl1.length + '/' + sl2.length + 'c');
  goddessNightMenu(); closeModal(); S.ap = 3; S.sam.energy = 100; goddessNight('kiss'); closeModal(); goddessNight('oral_give'); closeModal();
  let n = 0; while (!S.goddess.ending && n < 60) { S.ap = 3; S.sam.energy = 100; goddessNight(pick(['cowgirl','missionary','doggy'])); closeModal(); drain(); n++; if (n % 2 === 0) play(1); }
  out.push('after bind: div=' + Math.round(S.goddess.divinity) + ' ending=' + S.goddess.ending + ' love=' + Math.round(S.goddess.love) + ' nights=' + S.goddess.nights + ' power=' + goddessPower().toFixed(2));
  out.push('lastReport goddess lines: ' + (S.lastReport.lines||[]).filter(l=>l.startsWith('✨')).length);
  S.goddess.lastNight = S.week - 6; S.goddess.claimWk = S.week - 1; S.goddess.isoldePending = true; S.goddess.last = ['old']; S.samFocus = {kind:'guild', topic:'x'}; S.sam.energy = 10;
  ng();
  if (S.goddess.lastNight !== S.week || S.goddess.claimWk !== 0 || S.goddess.isoldePending !== false || S.goddess.last.length || S.samFocus.kind === 'guild') throw new Error('bound goddess/focus did not reset across NG+');
  if (S.sam.energy !== samMaxEnergy() || !S.workers.every(w => w.energy === maxEnergy(w)) || !(S.alumni||[]).every(w => w.energy === maxEnergy(w))) throw new Error('ng++ did not reset energy to max for everyone');
  out.push('ng+ reset ok');
  play(2);
  if (GOD_FORMS.angel.sub !== 'lantern') throw new Error('GOD_FORMS.angel is not lantern');
  const sh = S.houses[0], pow0 = goddessPower();
  const lAng = makeNamed('caelia', false); lAng.house = sh.id; lAng.job = 'chapel'; S.workers.push(lAng);
  if (sh.up.chapel && goddessPower() <= pow0) throw new Error('goddessPower did not scale from Lantern Angel + Lantern Chapel');
  const an = makeNamed('anael', false); an.house = sh.id; an.sub = 'lantern'; an.lantern = true; applyLanternAnael(an); an.traits.push('Devoted'); S.workers.push(an);
  if (!evGoddessAnaelLantern() || !evGoddessCaelia()) throw new Error('missing bound lantern events');
  evGoddessAnaelLantern().choices[0].fx(); evGoddessCaelia().choices[0].fx();
  S.won = true; startNGPlus();
  if (!lanternCarryCandidates().length) throw new Error('lanternCarryCandidates missing Lantern Anael');
  NGS.boon = Object.keys(NG_BOONS).find(k => !(S.boons||[]).includes(k)) || 'purse'; NGS.past = 'none';
  carriedLovers().forEach(w => { const p = NG_PERKS().find(t => !(w.ngPerks||[]).includes(t)); if (p) NGS.perks[w.id] = p; });
  ngLanternPick('anael', 'keep'); ngBegin(); while (GNEXT) gNext(); closeModal(); drain();
  const rebLA = rebirthNamed(makeNamed('anael'));
  if (!isLanternAngel(rebLA) || rebLA.lewd < ((SVC.angel||{}).lanternLewd ?? 60)) throw new Error('kept Lantern Anael did not preserve lantern or min lewd');
  S.workers.push(rebLA); if (!rebLA.traits.includes('Devoted')) rebLA.traits.push('Devoted');
  S.won = true; startNGPlus(); NGS.boon = Object.keys(NG_BOONS).find(k => !(S.boons||[]).includes(k)) || 'purse'; NGS.past = 'none';
  carriedLovers().forEach(w => { const p = NG_PERKS().find(t => !(w.ngPerks||[]).includes(t)); if (p) NGS.perks[w.id] = p; });
  ngLanternPick('anael', 'reset'); ngBegin(); while (GNEXT) gNext(); closeModal(); drain();
  const rebReset = rebirthNamed(makeNamed('anael'));
  if (isLanternAngel(rebReset)) throw new Error('reset Anael still carried Lantern form');
  out.push('lantern goddess + Anael carry/reset ok');
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
for (const target of ['index.html']) {
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
