// Story check: plays every scripted intro, walk meeting, romance arc and after-story through every page and choice
// (plus the Lantern Angel decision), and fails on
// page errors, leftover {placeholders}, "undefined"/"null"/"NaN" in shown text, empty pages, or broken structure.
// Covers what tools/smoke.mjs never reaches (it only starts as Kaede at the Gilded Lantern and picks random choices).
// Usage: node tools/story-check.mjs [--words]      (--words prints a word count per partner intro and arc)
// Needs `playwright`; set CHROME=/path/to/chrome if needed.
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
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const WORDS = process.argv.includes('--words');

const CHECK = `async () => {
  await new Promise(r => { const t = setInterval(() => { if (typeof SETUP !== 'undefined' && (SETUP || S)) { clearInterval(t); r(); } }, 50); });
  const bad = [], words = {};
  const wc = s => String(s || '').split(/\\s+/).filter(Boolean).length;
  // text the player reads: no raw placeholders, no stringified holes
  const look = (where, t, need) => {
    const s = String(t === undefined || t === null ? '' : t);
    if (need && !s.trim()) bad.push(where + ': empty');
    const ph = s.match(/\\{[A-Za-z_]\\w*\\}/g); if (ph) bad.push(where + ': raw ' + [...new Set(ph)].join(' '));
    if (/\\b(undefined|NaN)\\b|\\[object Object\\]/.test(s)) bad.push(where + ': ' + s.match(/\\b(undefined|NaN)\\b|\\[object Object\\]/)[0]);
    return wc(s);
  };
  const fresh = (house, partner) => { store.del(KEY_SAVE); EVQ = []; CUR_EV = null; newGame({past:'salaryman', house, partner}); closeModal(); G().met = true; };
  const outText = o => (o && typeof o === 'object') ? o.text : o;
  const starters = Object.keys(HOUSES).filter(k => !HOUSES[k].ngplus && !HOUSES[k].ngppOnly);

  // 1. cycle-1 opening: her intro with every answer, then the Vane welcome
  fresh(starters[0], PARTNERS[0]); G().met = false;
  for (let i = 0; i < (GOD.intro.choices || []).length; i++) {
    goddessIntro(() => {}); if (!S.goddess.met) bad.push('goddess intro: did not mark met');
    look('goddess intro open', document.querySelector('#gIntroOpen').textContent, true);
    gIntroPick(i); look('goddess intro answer ' + i, document.querySelector('#gIntroRes').textContent, true); gNext(); closeModal();
  }
  showIntro(); look('Vane welcome', document.querySelector('#modalBox').textContent, true); closeModal();

  // 2. every partner's intro (in a different starter house each), every page and every choice
  PARTNERS.forEach((k, n) => {
    fresh(starters[n % starters.length], k);
    const p = S.workers.find(w => w.isPartner); if (!p) { bad.push('intro ' + k + ': no partner in the new game'); return; }
    const PI = (GOD.partnerIntros || {})[k];
    if (!PI) bad.push('intro ' + k + ': no entry in goddess/partner-intros.json (falls back to the generic lines)');
    const ev0 = introPartnerEvent(p); let n0 = 0;
    if (!ev0.pre || ev0.pre.length < 2) bad.push('intro ' + k + ': fewer than 2 lead-in pages');
    (ev0.pre || []).forEach((pg, i) => { n0 += look('intro ' + k + ' page ' + (i + 1), pg.text, true); look('intro ' + k + ' page ' + (i + 1) + ' button', pg.btn, true); });
    n0 += look('intro ' + k + ' greet', ev0.text, true);
    if (ev0.choices.length < 2) bad.push('intro ' + k + ': fewer than 2 choices');
    let nc = 0, ng = 0;
    ev0.choices.forEach((c0, i) => {
      const ev = introPartnerEvent(p), t0 = p.trust; look('intro ' + k + ' choice ' + i + ' label', ev.choices[i].label, true);
      const out = ev.choices[i].fx(); nc += look('intro ' + k + ' choice ' + i, outText(out), true);
      if (!(p.trust > t0)) bad.push('intro ' + k + ' choice ' + i + ': no trust gained');
      if (typeof out.after !== 'function') bad.push('intro ' + k + ' choice ' + i + ': no goddess aside');
      else { out.after(); ng = look('intro ' + k + ' goddess aside', document.querySelector('#modalBox .story').textContent, true); GNEXT = null; closeModal(); }
    });
    // shown for real once: pages advance with evPre and the choices appear on the last page
    showEvent(introPartnerEvent(p)); let g = 0; while (CUR_EV.pre && CUR_EV.pre.length && g++ < 9) evPre();
    if (!document.querySelector('#evChoices button[onclick^="evChoice"]')) bad.push('intro ' + k + ': choices not shown after the pages');
    CUR_EV = null; closeModal();
    if (PI && PI.image && /\\b(hair|haired|blonde|brunette|ponytail|braid|halo|horns|(red|grey|gray|blue|green|violet|amber|gold|golden|dark|silver|white|black|brown|copper)[- ](eyes|eyed|ears|tail|wings))\\b/i.test(PI.image.comp)) bad.push('intro ' + k + ': image.comp describes her look (the code adds it): ' + PI.image.comp);
    words[k] = {intro: n0, choices: Math.round(nc / ev0.choices.length), aside: ng};
  });

  // 3. every house's arrival scene with its resident
  for (const hid of Object.keys(HOUSES)) {
    if (HOUSES[hid].ngppOnly) continue;
    fresh(starters.includes(hid) ? hid : starters[0], PARTNERS[0]);
    let h = H(hid); if (!h) { S.gold = 1e7; S.cycle = 2; try { buyHouse(hid); } catch (e) { bad.push('house ' + hid + ': buyHouse threw ' + e.message); } EVQ = []; CUR_EV = null; closeModal(); h = H(hid); }
    if (!h) continue;
    const npc = HOUSES[hid].npc ? S.workers.find(w => w.key === HOUSES[hid].npc) : null;
    const ev0 = introHouseEvent(h, npc, {starter:true}); if (!ev0) { bad.push('house ' + hid + ': no intro event'); continue; }
    (ev0.pre || []).forEach((pg, i) => look('house ' + hid + ' page ' + (i + 1), pg.text, true)); look('house ' + hid + ' greet', ev0.text, true);
    ev0.choices.forEach((c0, i) => { const ev = introHouseEvent(h, npc, {starter:true}); look('house ' + hid + ' choice ' + i + ' label', ev.choices[i].label, true); const out = ev.choices[i].fx(); look('house ' + hid + ' choice ' + i, outText(out), false);
      if (out && typeof out.after === 'function') { out.after(); look('house ' + hid + ' goddess note', document.querySelector('#modalBox .story').textContent, true); GNEXT = null; closeModal(); } });
  }

  // 4. romance arcs and after-stories: every beat at every intimacy stage, every choice
  const runBeats = (kind, key, w, beats, evOf, idx) => {
    let total = 0;
    for (let i = 0; i < beats.length; i++) for (let intim = 0; intim <= 3; intim++) {
      const set = () => { w[idx] = i; w.intim = intim; w.trust = 100; w.lewd = 100; w.mood = 80; w.energy = maxEnergy(w); S.gold = 1e6; S.sam.energy = 100; };
      set(); let ev0; try { ev0 = evOf(w); } catch (e) { bad.push(kind + ' ' + key + ' beat ' + (i + 1) + ' intim ' + intim + ': threw ' + e.message); continue; }
      if (!ev0) { bad.push(kind + ' ' + key + ' beat ' + (i + 1) + ': no event'); continue; }
      const n = look(kind + ' ' + key + ' beat ' + (i + 1) + ' intim ' + intim, ev0.text, true); if (intim === 0) total += n;
      if (!ev0.choices.length) bad.push(kind + ' ' + key + ' beat ' + (i + 1) + ': no choices');
      for (let c = 0; c < ev0.choices.length; c++) {
        set(); let out; try { const ev = evOf(w); look(kind + ' ' + key + ' beat ' + (i + 1) + ' label ' + c, ev.choices[c].label, true); out = ev.choices[c].fx(); }
        catch (e) { bad.push(kind + ' ' + key + ' beat ' + (i + 1) + ' intim ' + intim + ' choice ' + c + ': threw ' + e.message); continue; }
        look(kind + ' ' + key + ' beat ' + (i + 1) + ' intim ' + intim + ' choice ' + c, outText(out), false);
      }
    }
    return total;
  };
  for (const key of Object.keys(ARCS)) {
    const isP = PARTNERS.includes(key); fresh(starters[0], isP ? key : PARTNERS[0]);
    let w = S.workers.find(x => x.key === key); if (!w) { w = makeNamed(key, false); w.house = S.houses[0].id; S.workers.push(w); }
    const n = runBeats('arc', key, w, ARCS[key], evArc, 'arc');
    if (!has(w, 'Devoted')) bad.push('arc ' + key + ': the last beat did not make her a lover');
    words[key] = Object.assign(words[key] || {}, {arcBeats: ARCS[key].length, arcWords: n});
  }
  for (const key of Object.keys(AFTER_STORIES)) {
    fresh(starters[0], PARTNERS[0]);
    let w = S.workers.find(x => x.key === key); if (!w) { w = makeNamed(key, false); w.house = S.houses[0].id; S.workers.push(w); }
    runBeats('after', key, w, AFTER_STORIES[key], evAfterStory, 'after');
  }
  // 5. coverage: every lady the game writes itself has a story of her own
  for (const [k, n] of Object.entries(NAMED)) {
    if (n.role === 'partner' && !ARCS[k]) bad.push('coverage: partner ' + k + ' has no romance arc');
    if (n.role === 'guild' && !ARCS[k]) bad.push('coverage: guild lady ' + k + ' has no arc');
    if ((n.role === 'house' || n.role === 'story') && !AFTER_STORIES[k]) bad.push('coverage: ' + n.role + ' lady ' + k + ' has no after-story');
  }
  // 6. walk meetings: every partner met on a walk (first meeting), each hire choice
  for (const k of PARTNERS) {
    fresh(starters[0], PARTNERS.find(x => x !== k)); S.gold = 1e6;
    const WI = (WALKS.partnerIntros || {})[k]; if (!WI) { bad.push('walk ' + k + ': no entry in walks.json partnerIntros'); continue; }
    const ev0 = walkRecruitEvent(k, true);
    if (!ev0.pre || !ev0.pre.length) bad.push('walk ' + k + ': no opening page');
    (ev0.pre || []).forEach(pg => look('walk ' + k + ' open', pg.text, true)); look('walk ' + k + ' story', ev0.text, true); look('walk ' + k + ' aside', ev0.aside, false);
    ev0.choices.forEach((c0, i) => { const ev = walkRecruitEvent(k, true); look('walk ' + k + ' choice ' + i, outText(ev.choices[i].fx()), true); S.workers = S.workers.filter(w => w.key !== k); S.candidates = (S.candidates || []).filter(w => w.key !== k); });
    if (WI.image && /\b(hair|haired|blonde|brunette|ponytail|braid|halo|horns|(red|grey|gray|blue|green|violet|amber|gold|golden|dark|silver|white|black|brown|copper)[- ](eyes|eyed|ears|tail|wings))\b/i.test(WI.image.comp)) bad.push('walk ' + k + ': image.comp describes her look: ' + WI.image.comp);
  }
  // 7. Lantern Angels: trusted -> she asks; untrusted + easygoing -> takes it herself; untrusted + reserved -> holds, then asks once she trusts Sam
  const angel = (pers, trust, lewd) => { fresh(starters[0], PARTNERS[0]); let w, t = 0; do { w = genWorker({race:'angel'}); } while (w.sub && ++t < 300);
    w.sub = ''; w.lantern = false; w.lanternDecided = false; w.personality = pers; w.traits = w.traits.filter(x => x !== 'Modest'); w.trust = trust; w.lewd = lewd; w.house = S.houses[0].id; w.job = 'rest'; w.contract = 50; S.workers.push(w);
    S.gold = 1e6; endWeek(); closeModal(); return w; };
  const LL = SVC.angel.lanternLewd, LT = SVC.angel.lanternTrust;
  const easy = Object.keys(PERS).find(k => (PERS[k].lewd ?? 1) >= 1.1), shy = Object.keys(PERS).find(k => (PERS[k].lewd ?? 1) < 0.9);
  let a = angel(easy, LT + 20, LL + 2);
  if (a.sub === 'lantern' || !a.lanternDecided) bad.push('lantern: a trusting angel should ask Sam first');
  else { const ev = evLanternAsk(a); look('lantern ask', ev.text, true); ['accept.label','refuse.label'].forEach((k, i) => look('lantern ' + k, ev.choices[i].label, true)); look('lantern accept', outText(ev.choices[0].fx()), true); if (a.sub !== 'lantern') bad.push('lantern: accepting did not transform her');
    a.sub = ''; a.lantern = false; look('lantern refuse', outText(evLanternAsk(a).choices[1].fx()), true); if (a.sub === 'lantern') bad.push('lantern: refusing still transformed her'); }
  a = angel(easy, LT - 30, LL + 2); if (a.sub !== 'lantern') bad.push('lantern: an easygoing angel with low trust should take it on her own');
  a = angel(shy, LT - 30, LL + 2); if (a.sub === 'lantern' || a.lanternDecided) bad.push('lantern: a reserved angel with low trust should hold to her vows and stay undecided');
  EVQ = []; CUR_EV = null; a.trust = LT + 20; a.lewd = Math.max(a.lewd, LL + 2); endWeek(); closeModal(); if (!a.lanternDecided || a.sub === 'lantern') bad.push('lantern: a reserved angel should ask once she trusts Sam');
  a = angel(shy, LT - 30, LL + (SVC.angel.lanternOwn ?? 15) + 2); if (a.sub !== 'lantern') bad.push('lantern: a reserved angel far past the threshold should give in on her own');
  store.del(KEY_SAVE);
  return {bad, words, partners: PARTNERS.length, arcs: Object.keys(ARCS).length, afters: Object.keys(AFTER_STORIES).length};
}`;

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
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', d => d.accept());
await page.goto(`http://localhost:${server.address().port}/index.html`);
let res;
try { res = await page.evaluate(`(${CHECK})()`); } catch (e) { errors.push('check crashed: ' + e.message); res = {bad: [], words: {}}; }
await browser.close(); server.close();
if (WORDS) { console.log('key        intro  choice  aside  arc beats/words'); for (const [k, w] of Object.entries(res.words)) console.log(k.padEnd(10), String(w.intro ?? '-').padStart(5), String(w.choices ?? '-').padStart(7), String(w.aside ?? '-').padStart(6), '  ', w.arcBeats ? `${w.arcBeats}/${w.arcWords}` : '-'); }
const all = [...errors.map(e => 'page error: ' + e), ...res.bad];
console.log(all.length ? `story-check: ${all.length} problem${all.length > 1 ? 's' : ''}\n  ` + all.slice(0, 60).join('\n  ') + (all.length > 60 ? `\n  ... and ${all.length - 60} more` : '')
  : `story-check: ok (${res.partners} partner intros, ${res.arcs} arcs, ${res.afters} after-stories, every page and choice)`);
process.exit(all.length ? 1 : 0);
