// Balance lab: in-page library, injected into the game by tools/lab/lab.mjs after the game has booted.
// Defines window.LAB. Plain script, uses the game's globals. Nothing here is loaded by the game itself.
//
// One run = LAB.run(job): start (new game or snapshot) -> warm up with the baseline policy until the scenario's
// phase begins -> reseed the RNG (so every variant shares the same random stream from here) -> apply the variant
// (patch, mutations, NG+ choices) -> play `weeks` measured weeks -> return per-week metrics.
(function(){
const LAB = window.LAB = {};

// ---------- RNG (Math.random is replaced by tools/lab/lab.mjs before the game loads) ----------
LAB.reseed = s => window.__labSeed(s >>> 0);

// ---------- patches ----------
function deepMerge(t, p){ for (const k of Object.keys(p)) { if (p[k] && typeof p[k] === 'object' && !Array.isArray(p[k]) && t[k] && typeof t[k] === 'object') deepMerge(t[k], p[k]); else t[k] = p[k]; } }
// patch keys: balance (BAL), economy (ECON: houses, jobs, upgrades, classes, pasts...), races, traits, characters (NAMED)
LAB.applyPatch = P => { if (!P) return;
  const T = { balance: BAL, economy: ECON, races: RACES, traits: TRAITS, characters: NAMED, houses: HOUSES };
  for (const [k, v] of Object.entries(P)) { if (!T[k]) throw new Error('unknown patch key ' + k); deepMerge(T[k], v); } };

// ---------- helpers ----------
const homeH = () => S.houses[0];
const staffIn = h => S.workers.filter(w => w.house === h.id);
const AMEN = { bath: 'bath', dancer: 'stage', bartender: 'bar', chapel: 'chapel', teacher: 'classroom' };
function quiet(){ closeModal(); }
function chooseDefaultEvent(CUR_EV){
  const t = CUR_EV.title || '', ch = CUR_EV.choices || [];
  if (t === 'Contract Renewal') return 0;
  // Walk recruit events: always take free hires if room/policy allows; otherwise apply or hire if flush
  if (ch[0] && /Invite her into|Welcome her back/.test(ch[0].label || '')) {
    const h = curH();
    if (h && staffIn(h).length < cap()) return 0;
  }
  if (ch[0] && /^Hire her for /.test(ch[0].label || '')) {
    const h = curH(), candIdx = ch.findIndex(c => /to apply|Candidates/.test(c.label || ''));
    if (h && staffIn(h).length < cap() && sleepers(h).length < bedsFor(h) && S.gold >= reserveGold() + 300) return 0;
    if (candIdx >= 0) return candIdx;
  }
  return Math.floor(Math.random() * ch.length);
}
function resolveEvents(){ let g = 0;
  while ((EVQ.length || CUR_EV) && g < 60) { if (CUR_EV) {
      if (!document.querySelector('#evChoices')) showEvent(CUR_EV);   // an action closed the event's modal: put it back
      const pickI = LAB.choose ? LAB.choose(CUR_EV) : null;
      evChoice(pickI ?? chooseDefaultEvent(CUR_EV)); CUR_EV = null; }
    quiet(); runQueue(); g++; }
  quiet(); }

// ---------- policy (the "player") ----------
// Defaults are a sensible, not optimal, player. Experiments override any field (spec "policy").
LAB.POLICY = {
  maxStaff: null,        // per house; null = keep hiring until every bed is taken and no room is left for more staff quarters
  rooms: true,           // buy bedrooms when clients were turned away / rooms ran short
  beds: true,            // buy extra beds / staff quarters to fit hires
  upgrades: true,        // buy amenities from `amenities` (in order, one per house per week)
  amenities: ['bar', 'garden', 'stage', 'bath', 'guard'],
  amenityStaff: 5,       // only start on amenities once the house has this many ladies
  hire: 'cheapest',      // 'cheapest' | 'best' (stat sum per signing gold)
  hireRace: null,        // only hire this race (candidates are topped up with that race: a "tether everything" test)
  reserve: 300,          // keep this much gold on top of last week's costs and an upcoming debt payment
  roundsTrust: 35,       // Sam makes the rounds when any lady is below this trust
  partnerDates: true,    // one date a week with the partner while AP allows (builds toward Devoted -> NG+ carries)
  walkPartners: true,    // one walk a week (cycle 1 and NG+) while this cycle's walk partners aren't all found (balance.json → walk.partnerCycleMax): a real player walks to find partners
  samDefault: 'rest',    // what Sam does with spare rest-day AP: scout | rounds | date | walk | orgy | trainStat | trainSkill | trainService | demo | rest
  focus: 'auto',         // Sam's weekly focus: office | floor | watch | classes | rest | auto (watch after unhandled trouble, office without a madame, floor with a bar, else office)
  focusTopic: 'auto',    // classes: auto | skill | stat
  // Adventurers' Guild (js/logic/guild.js). Numbers are a first pass: expect to tune contract gold/work/risk in data/guild/base.json.
  guild: 'auto',         // 'auto': register once the home house has guildAt ladies, then keep up to guildContracts contracts staffed; false = never
  guildAt: 4,
  guildContracts: 1,     // contracts running at once (also capped by the guild's own limit for Sam's rank)
  guildLadies: 2,        // at most this many ladies away on contracts at a time (they earn nothing at the house that week)
  guildPick: 'support',  // who goes: 'support' (non-courtesans first, then the weakest earners) | 'fighters' (best contract power, any job)
  guildSam: 'auto',      // 'auto': Sam joins a contract only when the ladies alone wouldn't finish it in time; true = whenever a contract has room; false = never
  guildEarnCap: 1.25,    // only send ladies whose best of the last 4 working weeks is at most this x the contract's day rate (a top courtesan stays home)
  goddessGuild: true,    // bound Seliora takes the Guild work focus while a contract is running
  guildPartners: true,   // partners can go too (the earnings cap still keeps a partner who earns well at home; Adelheid-style fighters go)
  guildSpare: true,      // never send the madame or a house's only maid/security/attendant/promoter/host (false = old behaviour)
  guildSafety: 1.15,     // take/staff a contract only if projected progress x weeks left >= remaining work x this
  payOff: true,
  scoutWhenShort: 4,     // Sam scouts instead of his spare action while a house has fewer ladies than this and few candidates are affordable          // pay the whole debt as soon as gold covers it plus the reserve
  targets: { maid: 1, promoter: 1 }, // support staff kept per house once it has `targetsAt` ladies; everyone else courtesan-first
  targetsAt: 5,
  fillTargets: false,    // if true, actively reassign non-amenity staff to fill unmet `targets`
  resort: true,          // every week, move surplus promoters/maids/attendants up to courtesan when they qualify
  repair: true,          // repair damaged rooms (e.g. Ironwood Hall) when out of space or turning clients away
  incense: null,         // if set and house has incense burner, switch to this blend
  decor: 0,              // target decor tier (0-3)
  drinks: 0,             // target drinks tier (0-3, requires bar)
  price: null,           // if set (0-4), keep house price at this tier
  cut: null,             // if set ('base' or 0..0.9), set profit cut for workers in house
  tutor: null,           // if set ('weak'|'job'), set tutor focus for workers
  tutorTier: 'tutor',
  teachSkill: null,      // if set and house has classroom, set teachSkill
  bedTier: 'auto',       // 'auto': upgrade staff bed quality (better rest) when flush, up to Feather beds during the debt and Luxury after; a number = target tier (0-3); false = never
  demonFeedOnly: null,   // demons' "Feeding only" setting: null (off) | % of max energy below which she only takes services that feed her | 'always'
  demonAutoStud: null,   // demons' auto-stud lust threshold: null (off) | lust level | 'always'
  // adaptive play (a sensible player reacts to the weekly report; set any of these to false/0 for the old fixed player)
  security: 'auto',      // 'auto': keep 1 security lady once the house has `targetsAt` ladies and averaged >= secWhen incidents/week (last 3 weeks); true = always; false = never
  secWhen: 1,
  tidyFloor: 55,         // keep a second maid while tidiness (3-week average) is below this; 0 = off
  classUpkeep: 'afterDebt', // 'afterDebt' | true | false: when flush (gold >= flushMul x cost + reserve), buy the next decor tier, then drinks tier (needs the bar), once the house has amenityStaff ladies.
                         // Default waits for the debt to be cleared: in cycle 1 it cost ~3.4 weeks of payoff for +300/wk late net (2026-11-16).
  flushMul: 3,
  samples: false,        // opt-in: non-Modest promoters hand out free samples
  syncMenu: false,       // opt-in: keep MENU_JOBS workers' w.menu synced with acts where clientStance === 'yes'
  fixedStaff: false,     // opt-in: cap maxStaff at home house staff count when measured phase starts (suppresses bedless capacity edge)
  hireFriends: false     // opt-in: prioritize hiring returning reborn alumni/friends when affordable
};
// the fixed player the Pass 1/2 numbers in docs/BALANCE.md were measured with: spec "policy": {"preset": "legacy"}
LAB.PRESETS = { legacy: { security: false, tidyFloor: 0, classUpkeep: false, maxStaff: 10, bedTier: false, guild: false, walkPartners: false, guildSpare: false, guildPartners: false }, noGuild: { guild: false } };
// base, then each override's preset (if it names one) under that override's own fields
const withPreset = (base, ...os) => os.reduce((acc, o) => Object.assign(acc, (o && o.preset && LAB.PRESETS[o.preset]) || {}, o || {}), Object.assign({}, base));
let P = Object.assign({}, LAB.POLICY);
const cap = () => P.maxStaff ?? Infinity;

function reserveGold(){
  const LR = S.lastReport, upk = LR ? LR.upkeep + LR.wages : 150;
  let due = 0; try { const nd = nextDue(); if (nd.amount > 0 && nd.week - S.week <= 2) due = nd.amount; } catch (e) {}
  return P.reserve + upk + due;
}
// house history from the lab's weekly rows (kept in S so snapshots carry it): [{pushy, tidy}], newest last
const hist = h => ((S._lab || {}).hist || {})[h.id] || [];
const avgOf = (a, f) => a.length ? a.reduce((x, y) => x + f(y), 0) / a.length : 0;
function targetsFor(h){
  if (staffIn(h).length < P.targetsAt) return {};
  const T = Object.assign({}, P.targets || {}), H3 = hist(h).slice(-3);
  if (P.security === true || (P.security === 'auto' && H3.length && avgOf(H3, x => x.pushy) >= P.secWhen)) T.security = Math.max(T.security || 0, 1);
  if (P.tidyFloor && H3.length && avgOf(H3, x => x.tidy) < P.tidyFloor) T.maid = Math.max(T.maid || 0, 2);
  return T;
}
// who to move into a support role: suited to it (the stats the sim reads, docs/STATS.md) and not one of the top earners; partners last
const st = (w, k) => s100(statOf(w, k)), tk = (w, k) => s100((w.tech || {})[k] || 0);
const FIT = { promoter: w => st(w, 'charisma') + st(w, 'charm') * 0.5, maid: w => st(w, 'agility') + st(w, 'stamina') * 0.5,
  security: w => tk(w, 'combat') + st(w, 'strength') * 0.3 + st(w, 'agility') * 0.25 + st(w, 'wits') * 0.3, host: w => st(w, 'charm') + st(w, 'refinement'),
  attendant: w => st(w, 'refinement') + st(w, 'charm'), madame: w => tk(w, 'manage') + st(w, 'wits'), teacher: w => st(w, 'wits') + st(w, 'charisma') };
function supportScore(w, j){ const per = ((S.lastReport || {}).per || {})[w.id], earned = per ? per.earned || 0 : 0;
  return (FIT[j] ? FIT[j](w) : 50) / (1 + earned / 300) - (w.isPartner ? 1000 : 0); }
function jobOrder(h, cnt){
  const T = targetsFor(h), need = Object.keys(T).filter(j => cnt(j) < T[j]);
  return ['bath', 'dancer', 'bartender', ...need, 'courtesan', 'attendant', 'promoter', 'maid']; }
function tryJob(w, j){ if (canDo(w, j)) return false; setJob(w.id, j); quiet(); return w.job === j; }
function manageJobs(h){
  const mine = staffIn(h), cnt = j => mine.filter(x => x.job === j).length;
  mine.forEach(w => { if (w.job !== 'rest' && w.job !== 'guild' && w.energy < maxEnergy(w) * 0.30) w.job = 'rest'; });
  // locked ladies (job experiments) go back to their job as soon as they're rested
  // locked ladies (job experiments) take their job whenever they can; until then they're assigned like everyone else
  mine.forEach(w => { if (!w._lock || w.job === w._lock) return; const rested = w.job !== 'rest' || w.energy > maxEnergy(w) * 0.6; if (!rested) return;
    const was = w.job; w.job = 'rest'; if (!tryJob(w, w._lock)) { if (w._force) w.job = w._lock; else w.job = was; } });
  const free = w => (!w._lock || w.job !== w._lock) && w.job !== 'guild';
  // one lady on each amenity job the house has (from anyone rested and not locked)
  for (const j of Object.keys(AMEN)) { if (!h.up[AMEN[j]] || cnt(j) >= 1 || j === 'chapel' || j === 'teacher') continue;
    const pool = mine.filter(w => free(w) && !AMEN[w.job] && !canDo(w, j));
    pool.sort((a, b) => (a.job === 'rest' ? 0 : 1) - (b.job === 'rest' ? 0 : 1) || b.energy - a.energy);
    if (pool.length && (pool[0].job !== 'rest' || pool[0].energy > maxEnergy(pool[0]) * 0.6)) tryJob(pool[0], j); }
  mine.forEach(w => { if (!free(w) || w.job !== 'rest' || w.energy <= maxEnergy(w) * 0.6) return;
    for (const j of jobOrder(h, cnt)) { if (AMEN[j] && (!h.up[AMEN[j]] || cnt(j) >= 1)) continue; if (tryJob(w, j)) return; } });
  if (P.fillTargets && staffIn(h).length >= P.targetsAt) {
    const T = targetsFor(h);
    for (const [j, want] of Object.entries(T)) {
      if (!JOBS[j] || cnt(j) >= want) continue;
      const pool = mine.filter(w => free(w) && w.job !== j && !AMEN[w.job] && (!JOBS[j].needs || h.up[JOBS[j].needs]) && !(T[w.job] && cnt(w.job) <= T[w.job]));
      pool.sort((a, b) => supportScore(b, j) - supportScore(a, j));
      for (const w of pool) {
        if (cnt(j) >= want) break;
        const was = w.job; w.job = 'rest';
        if (!tryJob(w, j)) w.job = was;
      }
    }
  }
  if (P.resort) { const T = targetsFor(h);
    mine.forEach(w => { if (!free(w) || !['promoter', 'maid', 'attendant', 'security'].includes(w.job) || cnt(w.job) <= (T[w.job] || 0)) return;
      const was = w.job; w.job = 'rest'; if (!tryJob(w, 'courtesan')) w.job = was; }); }
  if (P.syncMenu) {
    mine.forEach(w => { if (MENU_JOBS.includes(w.job)) getActs().forEach(a => { if (clientStance(w, a.id) === 'yes' && !w.menu.includes(a.id)) w.menu.push(a.id); }); });
  }
}
function hireScore(c){ return (P.hireFriends && c.friend ? 10000 : 0) + (P.hire === 'best' ? STAT_KEYS.reduce((a, k) => a + s100(c.stats[k]), 0) / Math.max(50, c.signing) : -c.signing); }
function manageHouse(h){
  S.cur = h.id; const LR = S.lastReport, hr0 = LR && LR.houses.find(x => x.id === h.id);
  if (P.price != null && h.price !== P.price) h.price = P.price;
  if (P.repair && h.damaged > 0 && (roomsUsed(h) >= houseSize(h) || (hr0 && (hr0.turned > 0 || hr0.short))) && S.gold >= upgradeCost(h, 'repair') + reserveGold()) { buyUpgrade('repair'); quiet(); }
  if (P.rooms && hr0 && (hr0.turned > 0 || hr0.short) && roomsUsed(h) + 1 <= houseSize(h) && S.gold >= upgradeCost(h, 'room') + reserveGold()) { buyUpgrade('room'); quiet(); }
  if (P.upgrades && staffIn(h).length >= P.amenityStaff) {
    for (const k of P.amenities) { if (h.up[k] || !UPGRADES[k]) continue; const need = AMENITY_SIZE[k] ?? 1;
      if (roomsUsed(h) + need > houseSize(h)) continue; if (S.gold < upgradeCost(h, k) * 1.2 + reserveGold()) break;
      buyUpgrade(k); quiet(); break; } }
  if (h.up.incense && P.incense && h.incense !== P.incense) { setIncense(P.incense); quiet(); }
  if (h.up.classroom && P.teachSkill && h.teachSkill !== P.teachSkill) { setTeachSkill(h.id, P.teachSkill); quiet(); }
  if (P.classUpkeep && (P.classUpkeep !== 'afterDebt' || S.won || S.debt.remaining <= 0) && staffIn(h).length >= P.amenityStaff) {
    const flush = k => S.gold >= upgradeCost(h, k) * P.flushMul + reserveGold();
    if ((h.decor || 0) < 3 && flush('decor')) { buyUpgrade('decor'); quiet(); }
    else if (h.up.bar && (h.drinks || 0) < 3 && flush('drinks')) { buyUpgrade('drinks'); quiet(); } }
  if (P.bedTier !== false && P.bedTier != null && staffIn(h).length >= P.amenityStaff) {
    const want = P.bedTier === 'auto' ? (S.won || S.debt.remaining <= 0 ? 3 : 2) : +P.bedTier;
    if ((h.beds || 0) < want && S.gold >= upgradeCost(h, 'beds') * (P.bedTier === 'auto' ? P.flushMul : 1) + reserveGold()) { buyUpgrade('beds'); quiet(); } }
  staffIn(h).forEach(w => { if (w.race !== 'demon') return; if (P.demonFeedOnly != null) w.feedOnly = P.demonFeedOnly; if (P.demonAutoStud != null) w.autoStud = P.demonAutoStud; });
  if (P.decor && (h.decor || 0) < P.decor && S.gold >= upgradeCost(h, 'decor') + reserveGold()) { buyUpgrade('decor'); quiet(); }
  if (P.drinks && h.up.bar && (h.drinks || 0) < P.drinks && S.gold >= upgradeCost(h, 'drinks') + reserveGold()) { buyUpgrade('drinks'); quiet(); }
  if (staffIn(h).some(w => w.race === 'demon') && !h.up.sigil && S.gold >= upgradeCost(h, 'sigil') + reserveGold()) { buyUpgrade('sigil'); quiet(); }
  if (P.cut != null) staffIn(h).forEach(w => { if (!isFree(w) && w.cut !== P.cut) w.cut = P.cut; });
  if (P.tutor) staffIn(h).forEach(w => { w.tutor = P.tutor; w.tutorTier = P.tutorTier || 'tutor'; });
  if (P.hireRace) { const R = P.hireRace.split('/'), need = (RACES[R[0]] || {}).needs;
    if (need && !h.up[need] && S.gold >= upgradeCost(h, need) + P.reserve) { buyUpgrade(need); quiet(); } S.candidates = S.candidates.filter(c => c.race === R[0] && (!R[1] || c.sub === R[1]));
    while (S.candidates.length < 3) { let c, t = 0; do { c = genWorker({ race: R[0] }); } while (R[1] && c.sub !== R[1] && ++t < 200); c.signing = signingFor(c); S.candidates.push(c); } }
  for (let g = 0; g < 6; g++) {
    if (staffIn(h).length >= cap()) break;
    if (sleepers(h).length >= bedsFor(h)) { if (!P.beds) break;
      if ((h.extraBeds || 0) < maxExtraBeds(h) && S.gold > reserveGold() + upgradeCost(h, 'extraBed')) { buyUpgrade('extraBed'); quiet(); continue; }
      if (roomsUsed(h) + 1 <= houseSize(h) && S.gold > reserveGold() + upgradeCost(h, 'quarters') + 150) { buyUpgrade('quarters'); quiet(); continue; }
      break; }
    const c = S.candidates.filter(x => !raceBlock(x, h) && S.gold - x.signing >= reserveGold()).sort((a, b) => hireScore(b) - hireScore(a))[0];
    if (!c) break; hire(c.id); quiet();
  }
  if (P.samples) staffIn(h).forEach(w => { if (w.job === 'promoter' && !has(w, 'Modest')) w.samples = true; });
  manageJobs(h);
}
let trainI = 0;
function samSpare(){
  const k = P.samDefault, earners = S.workers.filter(w => w.job === 'courtesan' || (JOBS[w.job] || {}).must);
  const pickW = () => { const L = (earners.length ? earners : S.workers); return L[(trainI++) % L.length]; };
  if (k === 'rest') return samRest();
  if (k === 'trainStat') { const w = pickW(); return w ? samTrain(w.id, 'stat') : samRest(); }
  if (k === 'trainSkill') { const w = pickW(); return w ? samTrain(w.id, 'skill') : samRest(); }
  if (k === 'trainService') { const L = S.workers.filter(w => getActs().some(a => canSam(w, a.id))); const w = L[(trainI++) % (L.length || 1)];
    return w ? samTrain(w.id, 'service') : samRest(); }
  if (k === 'demo') { const w = S.workers.find(w => demoAct(w) && demoOpen(w)); return w ? samDemo(w.id) : samRest(); }
  if (k === 'walk') return samWalk();
  if (k === 'orgy') { const O = BAL.orgy || {}, ws = staffIn(homeH()).filter(w => !orgyWhy(w)).slice(0, O.max ?? 5);
    if (ws.length >= (O.min ?? 2) && S.sam.energy >= orgyCost(ws.length)) { orgyMenu(); ws.forEach(w => orgyPick(w.id)); samOrgy(); return; }
    return samRest(); }
  if (k === 'date') { const w = S.workers.slice().sort((a, b) => a.trust - b.trust)[0]; if (!w) return samRest(); return samDate(w.id, 'walk'); }
  return samWork(k);
}
// ---------- Adventurers' Guild ----------
// what she earns at home: the best of her last few working weeks (a rest or guild week doesn't make a top courtesan look cheap)
const gEarn = w => { const h = (((S._lab || {}).earn) || {})[w.id]; if (h && h.length) return Math.max(...h); const per = ((S.lastReport || {}).per || {})[w.id]; return per ? per.earned || 0 : 0; };
// support ladies the house can't spare: the madame, and the only maid/security/attendant/promoter/host of her house
const gSpare = w => w.job !== 'madame' && (!['maid', 'security', 'attendant', 'promoter', 'host'].includes(w.job) || S.workers.filter(x => x.house === w.house && x.job === w.job).length > 1);
// a contract's day rate, roughly (base.json perWeek x rank bonus): a lady who earns clearly more at home stays home
const gRate = C => { const pw = C.perWeek || [0, 0]; return (pw[0] + pw[1]) / 2 * cycleMul((GDB.gold || {}).perCycle) * (1 + ((GDB.pay || {}).rankRate ?? 0.08) * GLD().rank); };
function guildPool(C){
  const L = S.workers.filter(w => gEarn(w) <= gRate(C) * (P.guildEarnCap ?? 1.25) && w.job !== 'guild' && !w._lock && (P.guildPartners !== false || !w.isPartner) && w.trust >= jobTrust(w, 'guild') && w.energy >= maxEnergy(w) * 0.6 && w.health >= 50 && !AMEN[w.job] && (P.guildSpare === false || gSpare(w)));
  const score = w => P.guildPick === 'fighters' ? ladyGuildPower(w, C) : ladyGuildPower(w, C) - (w.job === 'courtesan' ? 40 : 0) - gEarn(w) / 20;
  return L.sort((a, b) => score(b) - score(a));
}
const guildAway = () => S.workers.filter(w => w.job === 'guild').length;
// Projected weekly progress of a party (ladies + optionally Sam at full effort).
const gProj = (C, ws, sam) => ws.reduce((a, w) => a + ladyGuildPower(w, C), 0) + (sam ? gWeighted(k => S.sam[k] || 0, C.sam) : 0);
function manageGuild(){
  if (!P.guild || typeof guildOn !== 'function') return;
  if (!guildOn()){
    if (staffIn(homeH()).length >= (P.guildAt ?? 4) && S.ap > 0 && S.sam.energy >= 30){ samGuild(); quiet(); resolveEvents(); }
    return;
  }
  const g = GLD(), room = () => Math.min(P.guildContracts ?? 1, guildActiveMax()) - g.active.length;
  // take the best-paying offer the available ladies (plus Sam, if allowed) can finish in time
  if (room() > 0 && guildAway() < (P.guildLadies ?? 2)){
    const best = g.board.map(o => { const C = GCON[o.type], pool = guildPool(C).slice(0, Math.min(C.slots - (P.guildSam ? 1 : 0), (P.guildLadies ?? 2) - guildAway()));
        const proj = gProj(C, pool, P.guildSam !== false && C.slots > pool.length); return { o, C, ok: proj * o.weeks >= C.work * (P.guildSafety ?? 1.15), val: o.gold / o.weeks + (o.rate || 0) * Math.max(1, pool.length) }; })
      .filter(x => x.ok).sort((a, b) => b.val - a.val)[0];
    if (best){ takeContract(best.o.uid); quiet(); }
  }
  // staff every active contract until it's projected to finish
  for (const c of g.active){
    const C = GCON[c.type], left = Math.max(0, C.work - (c.prog || 0)), wl = Math.max(1, c.due - S.week + 1);
    const need = () => gProj(C, guildParty(c), false) * wl < left * (P.guildSafety ?? 1.15);
    for (const w of guildPool(C)){ if (!need() || guildSlotsLeft(c) <= (P.guildSam === true ? 1 : 0) || guildAway() >= (P.guildLadies ?? 2)) break; assignGuild(c.uid, w.id); quiet(); }
  }
}
// Sam goes on a contract (his focus) when the policy wants him there; returns true if he did.
function guildFocus(){
  if (!P.guild || P.guildSam === false || typeof guildOn !== 'function' || !guildOn()) return false;
  for (const c of GLD().active){
    const C = GCON[c.type], left = Math.max(0, C.work - (c.prog || 0)), wl = Math.max(1, c.due - S.week + 1);
    if (samOnContract(c)) return true;
    const short = gProj(C, guildParty(c), false) * wl < left * (P.guildSafety ?? 1.15);
    if (guildSlotsLeft(c) > 0 && (P.guildSam === true || short)){ samJoinContract(c.uid); return true; }
  }
  return false;
}
function pickFocus(){
  if (guildFocus()) return;
  const k = P.focus || 'auto';
  if (k !== 'auto') return setFocus(k, P.focusTopic);
  const h = samHouse(), hr = S.lastReport && (S.lastReport.houses || []).find(x => x.id === h.id);
  const fails = hr && hr.pushy ? (hr.pushy.none || 0) + (hr.pushy.samfail || 0) : 0;
  if (fails >= 2) return setFocus('watch');
  if (!S.workers.some(w => w.house === h.id && w.job === 'madame')) return setFocus('office');
  if (h.up.bar) return setFocus('floor');
  return setFocus('office');
}
function samTurn(){
  let rounds = false, dated = false, goddessDone = false, walks = 0, g = 0;
  while (S.ap > 0 && g++ < 8) {
    const p = S.workers.find(w => w.isPartner);
    const gg = typeof goddessActive === 'function' && goddessActive() ? G() : null;
    const nightCost = ((BAL.goddess || {}).night || {}).cost ?? 10;
    const negAfter = ((BAL.goddess || {}).neglect || {}).after ?? 3;
    const needGoddess = !goddessDone && gg && S.sam.energy >= nightCost && (
      S.week - (gg.lastNight || 0) >= Math.max(1, negAfter - 1) ||
      (gg.claimWk && (gg.lastNight || 0) < gg.claimWk) ||
      (gg.jealousy || 0) >= 30
    );
    if (needGoddess) {
      const act = getActs().find(a => gNightKind(a.id) === 'inside');
      if (act) { goddessNight(act.id); goddessDone = true; quiet(); resolveEvents(); continue; }
    }
    const wB = BAL.walk || {};
    if (P.walkPartners && !walks && !(S.ngppCycle > 0) && (S.flags.walkPartners || 0) < (wB.partnerCycleMax ?? 3) && typeof openWalkPartners === 'function' && openWalkPartners().length && S.sam.energy >= (wB.energy ?? 15) + 10) { samWalk(); walks++; }
    else if (!rounds && S.sam.energy >= 25 && S.workers.some(w => nearSam(w) && w.trust < P.roundsTrust)) { samWork('rounds'); rounds = true; }
    else if (P.partnerDates && !dated && p && S.ap >= 2 && S.sam.energy >= 40) { try { samDate(p.id, 'walk'); } catch (e) {} dated = true; }
    else if ((S.ngppCycle || 0) > 0 && P.ngppWalk !== false && walks < 2 && S.sam.energy >= (((BAL.walk || {}).energy ?? 15) + 5) && S.houses.some(h => staffIn(h).length < Math.min(cap(), P.ngppWalkUntil ?? 10))) { samWalk(); walks++; }
    else if (P.scoutWhenShort && S.sam.energy >= 25 && S.houses.some(h => staffIn(h).length < P.scoutWhenShort) && S.candidates.filter(c => S.gold - c.signing >= P.reserve).length < 2) samWork('scout');
    else if (S.sam.energy >= 35) { try { samSpare(); } catch (e) { samRest(); } }
    else samRest();
    quiet(); resolveEvents();
  }
}
// one week of play; returns the metrics row
function playWeek(){
  for (const h of S.houses.slice().sort((a, b) => staffIn(a).length - staffIn(b).length)) manageHouse(h);
  S.cur = S.houses[0].id; manageGuild();
  if (P.goddessGuild !== false && typeof goddessActive === 'function' && goddessActive() && GFOCUS.includes('guild')) { const g = G(); if (guildOn() && GLD().active.length) { if (g.focus !== 'guild') { g._labPrev = g.focus; g.focus = 'guild'; } } else if (g.focus === 'guild') g.focus = g._labPrev || 'indulge'; }   // bound Seliora works guild contracts while one runs
  samTurn(); pickFocus(); quiet(); resolveEvents();
  if (P.payOff && !S.won && S.debt.remaining > 0 && S.gold >= S.debt.remaining + reserveGold()) { try { payOffDebt(); } catch (e) {} quiet(); resolveEvents(); }
  const HOLD = (S._lab || {}).hold || {}; if (HOLD.tidy != null) S.houses.forEach(h => { h.tidy = HOLD.tidy; });
  const before = new Set(S.workers.map(w => w.id)), wk = S.week, strikes0 = S.debt.strikes;
  const who = Object.fromEntries(S.workers.map(w => [w.id, { race: w.race, sub: w.sub, key: w.key, free: w.free, wage: w.wage, tested: !!w._labTested }]));
  endWeek(); quiet(); resolveEvents();
  const R = S.lastReport; if (!R || R.week !== wk) return null;
  const left = [...before].filter(id => !S.workers.some(w => w.id === id)).length;
  const per = Object.values(R.per).map(p => { const w = who[p.id] || {};
    return { race: w.race || '?', sub: w.sub || '', job: p.job, earned: Math.round(p.earned || 0), wage: w.free ? 0 : (w.wage || 0), recharge: Math.round(p.recharge || 0), served: p.served || 0, key: w.key || null, house: p.house, tested: !!w.tested }; });
  const hs = R.houses.map(x => ({ id: x.id, served: x.served, turned: x.turned, sat: Math.round((x.avgSat || 0) * 10) / 10, rooms: x.roomsUsed, cap: x.roomCap,
    roomsUsed: x.roomsUsed || 0, roomCap: x.roomCap || 0, accProps: x.accProps || 0, exhibActs: x.exhibActs || 0, crowdOver: x.crowdOver || 0,
    prestige: Math.round((x.prestige ?? housePrestige(H(x.id))) * 10) / 10,
    tidy: Math.round(x.tidy), promo: Math.round((x.promoDraw || 0) * 10) / 10, pushy: x.pushy ? Object.assign({}, x.pushy) : null, incidents: x.incidents ? Object.assign({}, x.incidents) : null, damage: x.damage || 0, lost: x.nightsLost || 0, demand: x.demand || 0, maidAdd: Math.round((x.maidAdd || 0) * 10) / 10, tidy0: Math.round(x.tidy0), visitors: x.visitors || 0,
    jobs: Object.fromEntries(Object.entries(Object.values(R.per).filter(p => p.house === x.id).reduce((a, p) => (a[p.job] = (a[p.job] || 0) + 1, a), {}))) }));
  const L = S._lab = S._lab || {}; L.hist = L.hist || {}; L.earn = L.earn || {};
  Object.values(R.per).forEach(p => { if (p.job === 'rest' || p.job === 'guild') return; const a = L.earn[p.id] = L.earn[p.id] || []; a.push(Math.round(p.earned || 0)); if (a.length > 4) a.shift(); });
  hs.forEach(x => { const a = L.hist[x.id] = L.hist[x.id] || []; a.push({ pushy: x.pushy ? x.pushy.total : 0, tidy: x.tidy }); if (a.length > 3) a.shift(); });
  const W = S.workers, avg = f => W.length ? W.reduce((a, w) => a + f(w), 0) / W.length : 0;
  const perList = Object.values(R.per);
  const restPct = perList.length ? Math.round(1000 * perList.filter(p => p.job === 'rest').length / perList.length) / 10 : 0;
  const statAvg = Math.round(10 * avg(w => STAT_KEYS.reduce((s, k) => s + s100(statOf(w, k)), 0) / STAT_KEYS.length)) / 10;
  const skillAvg = Math.round(10 * avg(w => TECH_KEYS.reduce((s, k) => s + s100((w.tech || {})[k] || 0), 0) / TECH_KEYS.length)) / 10;
  const rebornSum = W.filter(w => w.job !== 'rest').reduce((a, w) => a + (w.reborn || 0), 0);
  return { wk, cycle: S.cycle || 1, gold: Math.round(S.gold), debt: Math.round(S.debt.remaining), net: Math.round(R.income - R.wages - R.upkeep - (R.recharge || 0) - (R.cuts || 0) - (R.tutor || 0)),
    income: Math.round(R.income), wages: Math.round(R.wages), upkeep: Math.round(R.upkeep), cuts: Math.round(R.cuts || 0), recharge: Math.round(R.recharge || 0),
    restPct, statAvg, skillAvg, rebornSum,
    sam: Math.round(R.led.sam || 0), guild: Math.round(R.led.guild || 0), partners: (S.flags && S.flags.walkPartners) || 0, grank: (S.guild && S.guild.rank) || 0, gaway: Object.values(R.per).filter(p => p.job === 'guild').length, rep: Math.round(homeH().rep * 10) / 10, prestige: Math.round(housePrestige(homeH()) * 10) / 10,
    staff: W.length, served: R.served, turned: R.turned, sat: hs.length ? hs[0].sat : 0, missed: S.debt.strikes > strikes0 ? 1 : 0, strikes: S.debt.strikes,
    mood: Math.round(avg(w => w.mood)), trust: Math.round(avg(w => w.trust)), left, houses: hs, per, over: !!S.over, won: !!S.won };
}

// ---------- phases ----------
// early: from week 1 (no upgrades, at most 4 ladies: house lady, partner, 1-2 generics)
// early4: from the week the home house reaches 4 ladies (before upgrades/rooms)
// mid:   home house has `midStaff` ladies; late: the home house is out of space (rooms full)
LAB.PHASES = { earlyStaff: 4, midStaff: 5 };
const PHASE = {
  early: () => true,
  early4: () => staffIn(homeH()).length >= (LAB.PHASES.earlyStaff || 4),
  mid: () => staffIn(homeH()).length >= LAB.PHASES.midStaff,
  late: () => roomsUsed(homeH()) >= houseSize(homeH())
};
const EARLY_POLICY = { maxStaff: 4, upgrades: false, rooms: false };
// plateau: cycle 1 played to the win (shared warm-up), then `weeks` (default 26) post-debt weeks: what the built-up house earns

// ---------- mutations (applied at phase start, after the reseed) ----------
function generics(n){ const g = staffIn(homeH()).filter(w => !w.key).sort((a, b) => String(a.id).localeCompare(String(b.id))); return n === 'all' || n === 'generics' || n == null ? g : g.slice(0, n); }   // 'generics' = all of them (was slicing to 0)
function raceLewd(race, sub){ const sd = subData(race, sub); return ((RACES[race].mods || {}).lewd || 0) + ((sd && sd.mods || {}).lewd || 0); }
function setRace(w, race, sub, opts){
  if (race === 'beastkin' && !sub) sub = Object.keys(RACES.beastkin.subs || {})[0];
  w.lewd = clamp(w.lewd - raceLewd(w.race, w.sub) + raceLewd(race, sub)); w.race = race; w.sub = sub || undefined;
  w.lantern = (race === 'angel' && sub === 'lantern');
  if (opts && opts.keepNonLantern && race === 'angel' && !sub) w.lanternDecided = true;
  try { raceFit(w); } catch (e) {}
  w.energy = Math.min(w.energy, maxEnergy(w));
  fitLust(w);
  w.wage = wageFor(w);
}
function syncWorkerMenu(w, job){
  if (!MENU_JOBS.includes(job || w.job)) return;
  getActs().forEach(a => { if (clientStance(w, a.id, job) === 'yes' && !w.menu.includes(a.id)) w.menu.push(a.id); });
}
LAB.mutate = M => { if (!M) return {};
  const info = {};
  if (M.trust != null) S.workers.forEach(w => w.trust = clamp(w.trust + M.trust));
  if (M.minTrust != null) S.workers.forEach(w => w.trust = Math.max(w.trust, M.minTrust));
  const raceWho = M.race ? generics(M.raceWho ?? 'all') : [];
  if (M.otherRace) {
    const [or, os] = M.otherRace.split('/'), others = generics('all').filter(w => !raceWho.includes(w));
    others.forEach(w => setRace(w, or, os, { keepNonLantern: !!M.keepNonLantern }));
    const oneed = (RACES[or] || {}).needs; if (oneed && !homeH().up[oneed]) homeH().up[oneed] = true;
    if (!M.raceNew) P.hireRace = M.otherRace;
    info.otherRaced = others.length;
  }
  if (M.race) { const [r, s] = M.race.split('/'); raceWho.forEach(w => { w._labTested = true; setRace(w, r, s, { keepNonLantern: !!M.keepNonLantern }); }); info.raced = raceWho.length;
    const need = (RACES[r] || {}).needs; if (need && !homeH().up[need]) { homeH().up[need] = true; info.grantedRace = need; }   // e.g. a Tethering Stone for spirits
    if (M.raceNew) P.hireRace = M.race; }   // later hires in the measured weeks are that race too
  let traitTargets = [];
  if (M.addTrait) {
    const ts = [].concat(M.addTrait);
    traitTargets = M.traitWho === 'courtesans' ? staffIn(homeH()).filter(w => w.job === 'courtesan')
      : typeof M.traitWho === 'number' ? staffIn(homeH()).filter(w => w.job === 'courtesan').concat(generics('all')).filter((w, i, a) => a.indexOf(w) === i).slice(0, M.traitWho)
      : generics(M.traitWho ?? 2);
    traitTargets.forEach(w => {
      if (ts.includes('Exhibitionist')) w.traits = w.traits.filter(t => t !== 'Modest');
      ts.forEach(t => { if (!w.traits.includes(t)) w.traits.push(t); });
    });
    info.traited = traitTargets.length;
  }
  if (M.minLewd != null) {
    const lewdTargets = traitTargets.length ? traitTargets : (M.race || M.raceWho != null) ? raceWho : staffIn(homeH());
    lewdTargets.forEach(w => { w.lewd = Math.max(w.lewd, M.minLewd); });
  }
  if (M.job) { const h = homeH(), J = JOBS[M.job]; if (J && J.needs && !h.up[J.needs]) { h.up[J.needs] = true; info.granted = J.needs; }
    let who = M.jobWho === 'everyone' ? staffIn(h).filter(w => !w.isPartner && !w.locked) : generics(M.jobWho ?? 2);
    // jobFill: too few generics (e.g. an early house: resident + partner only) -> fill up with other non-partner ladies (the house resident first)
    if (M.jobFill && typeof M.jobWho === 'number' && who.length < M.jobWho) who = who.concat(staffIn(h).filter(w => !w.isPartner && !who.includes(w))).slice(0, M.jobWho);
    if (M.job === 'madame') {
      staffIn(h).filter(w => w.job === 'madame' && !who.includes(w)).forEach(w => { w.job = safeJob(w, 'courtesan'); syncWorkerMenu(w); });
    }
    if (M.job === 'chapel' && (M.clearJob || staffIn(h).filter(w => w.job === 'chapel' && !who.includes(w)).length + who.length > slotsFor(h, 'chapel'))) {
      staffIn(h).filter(w => w.job === 'chapel' && !who.includes(w)).forEach(w => { w.job = safeJob(w, 'courtesan'); syncWorkerMenu(w); });
    }
    who.forEach(w => { w._labTested = true; w._lock = M.job; w._force = !!M.force; if (!canDo(w, M.job) || M.force) w.job = M.job; if (M.syncMenu || (MENU_JOBS.includes(M.job) && !w.menu.length)) syncWorkerMenu(w, M.job); }); info.locked = who.length; }
  if (M.statAll) S.workers.forEach(w => STAT_KEYS.forEach(k => { w.stats[k] = clampK(w.stats[k] + M.statAll * SKL); }));   // +N (0-100 scale) to every stat
  if (M.stat) S.workers.forEach(w => Object.entries(M.stat).forEach(([k, n]) => { w.stats[k] = clampK(w.stats[k] + n * SKL); }));
  if (M.skillAll) S.workers.forEach(w => { TECH_KEYS.forEach(k => { w.tech[k] = clampK((w.tech[k] || 0) + M.skillAll * SKL); }); Object.values(w.acts || {}).forEach(a => { a.skill = clampK((a.skill || 0) + M.skillAll * SKL); }); });
  if (M.gold != null) S.gold += M.gold;
  if (M.rep != null) homeH().rep = M.rep;
  if (M.prestige != null) homeH().prestige = M.prestige;
  if (M.sam) Object.entries(M.sam).forEach(([k, v]) => { S.sam[k] = (S.sam[k] || 0) + v; });
  if (M.upgrades) M.upgrades.forEach(k => { homeH().up[k] = true; });
  if (M.noIncense) homeH().up.incense = false;
  if (M.incense) { homeH().up.incense = true; homeH().incense = M.incense; }
  if (M.decor != null) homeH().decor = M.decor;
  if (M.drinks != null) { if (M.drinks > 0) homeH().up.bar = true; homeH().drinks = M.drinks; }
  if (M.bedTier != null) homeH().beds = M.bedTier;
  if (M.bindGoddess) { const g = G(); g.bound = true; g.left = false; g.divinity = M.divinity ?? 5; g.love = M.love ?? 70; }
  if (M.holdTidy != null) { S._lab = S._lab || {}; (S._lab.hold = S._lab.hold || {}).tidy = M.holdTidy; info.holdTidy = M.holdTidy; }   // every house's tidiness is reset to this before each measured week
  if (M.syncMenu) staffIn(homeH()).forEach(w => syncWorkerMenu(w));
  return info;
};

// ---------- NG+ ----------
// 'best' new house = first offered in this order (from the ngplus-houses lab results)
LAB.HOUSE_RANK = ['veil', 'castle', 'hollow', 'wayfarer', 'lantern', 'sanctuary', 'atelier', 'pavilion', 'onsen', 'tankard', 'conservatory', 'lyceum', 'foundry', 'skyhook', 'pearl'];
// exactly n Devoted lovers going into NG+ (reborn stacks first, then partner, then by trust); synthesize generics if staff < n
function setLovers(n){
  while (S.workers.length < n) {
    const w = genWorker({ quality: 1 });
    w.house = homeHouse(); w.job = safeJob(w, 'courtesan'); w.trust = 100;
    ensureWorker(w); S.workers.push(w);
  }
  const picked = S.workers.slice().sort((a, b) => (b.reborn || 0) - (a.reborn || 0) || (b.isPartner ? 1 : 0) - (a.isPartner ? 1 : 0) || b.trust - a.trust).slice(0, n);
  S.workers.forEach(w => { if (has(w, 'Devoted')) w.traits = w.traits.filter(t => t !== 'Devoted'); });
  picked.forEach(w => { w.traits.push('Devoted'); w.isPartner = true; w.wage = 0; w.contract = 999; w.trust = 100; });   // a real Devoted lover has maxed trust; her training is whatever she actually got
}
function setFriends(n){
  const G = S.workers.filter(w => !w.key && !has(w, 'Devoted')).sort((a, b) => b.trust - a.trust);
  G.forEach((w, i) => { w.favorite = i < n; if (i < n) w.trust = 100; else if (w.trust >= 100) w.trust = 99; });
}
const KEEP_SYNTH_ORDER = ['wayfarer', 'hollow', 'onsen', 'tankard', 'lantern', 'foundry', 'skyhook', 'conservatory', 'pearl', 'lyceum', 'veil', 'sanctuary', 'pavilion', 'atelier', 'castle'];
function ensureKeepTarget(keepSpec){
  if (keepSpec == null) return null;
  const cyc = S.cycle || 1;
  const target = keepSpec === 'home' ? 1 : keepSpec === '1x' ? cyc : keepSpec === '2x' ? 2 * cyc : +keepSpec;
  if (!Number.isFinite(target) || target < 1) return null;
  let have = S.houses.filter(h => h.id === homeHouse() || keepable(h)).length;
  for (const k of KEEP_SYNTH_ORDER) {
    if (have >= target) break;
    const D = HOUSES[k]; if (!D || H(k) || D.ngppOnly || (D.ngplus && cyc < 2)) continue;
    const h = makeHouse(k); h.rooms += 2; h.quarters += 1;
    h.spent = Math.round(Math.max(2000, (homeH().spent || 3500) * 0.5));
    if (STORIES[k]) h.story = { beat: STORIES[k].beats.length, wk: S.week };
    S.starters = Array.from(new Set([...(S.starters || []), k]));
    S.houses.push(h);
    if (D.npc && !isHired(D.npc)) {
      const npc = makeNamed(D.npc); npc.house = k; npc.locked = k; npc.contract = 999;
      assignStart(npc, NAMED[D.npc].job); S.workers.push(npc);
    }
    have++;
  }
  return target;
}
function addGuestAlumni(spec){
  if (!spec) return;
  const list = Array.isArray(spec) ? spec : [spec], B = BAL.ngplus || {};
  for (const item of list) {
    const cnt = item.count || 0, stacks = item.stacks || 1;
    const sh = Math.max(B.carry || 0.1, Math.min(B.carryMax ?? 0.5, (B.carryPer ?? 0.1) * stacks));
    for (let i = 0; i < cnt; i++) {
      const pool = Object.keys(NAMED).filter(k => NAMED[k].role === 'drifter' && !isHired(k));
      if (!pool.length) break;
      const k = pick(pool), w = makeNamed(k);
      STAT_KEYS.forEach(sk => { w.stats[sk] = clampK(Math.round(w.stats[sk] + sh * 180 * stacks)); });
      TECH_KEYS.forEach(tk => { w.tech[tk] = clampK(Math.round(w.tech[tk] + sh * 180 * stacks)); });
      Object.values(w.acts || {}).forEach(a => { a.skill = clampK(Math.round((a.skill || 0) + sh * 120 * stacks)); });
      w.reborn = stacks; w.free = false; w.isPartner = false; w.locked = null; w.job = 'rest';
      w.contract = 12; w.house = homeHouse(); w.seen = {}; w.wage = wageFor(w); w.signing = signingFor(w);
      S.alumni = [...(S.alumni || []), w];
    }
  }
  if (!S.candidates.some(c => c.friend)) inviteFriend(true);
}
function applyNgppPrep(prep){
  S.cycle = Math.max(1, (prep.cycle || 5) - 1);
  if (prep.boons) S.boons = Array.from(new Set([...(S.boons || []), ...prep.boons]));
  if (prep.pasts) prep.pasts.forEach(pk => { if (PASTS[pk] && !hasPast(pk)) { S.pasts = [...samPasts(), pk]; PASTS[pk].fx(S.sam); } });
  const g = G(); g.bound = true; g.left = false; g.divinity = prep.divinity ?? 25; g.love = prep.love ?? 75;
  if (prep.priorLovers > 0) {
    setLovers(prep.priorLovers);
    const stacksBefore = Math.max(0, (prep.loverStacks || 3) - 1), perks = NG_PERKS();
    carriedLovers().forEach(w => { w.reborn = Math.max(w.reborn || 0, stacksBefore); w.ngPerks = perks.slice(0, Math.min(perks.length, stacksBefore)); });
  }
}
function enterNG(ng, isFirst){
  ng = ng || {};
  if (isFirst && ng.ngppPrep) applyNgppPrep(ng.ngppPrep);
  if (ng.loversPerCycle != null) setLovers(Math.max(0, Math.round(ng.loversPerCycle * (S.cycle || 1))));
  else if (ng.lovers != null) setLovers(ng.lovers);
  if (ng.friends != null) setFriends(ng.friends);
  if (ng.bindGoddess) { const g = G(); g.bound = true; g.left = false; g.divinity = ng.divinity ?? 5; g.love = ng.love ?? 70; }
  const keepTarget = ng.keepHouses != null ? ensureKeepTarget(ng.keepHouses) : null;
  startNGPlus(); quiet();
  if (ng.challenge != null) NGS.challenge = ng.challenge;
  if (ng.vesselForm != null && NGS.ngpp) NGS.vesselForm = ng.vesselForm;
  const free = PARTNERS.filter(k => !S.workers.some(w => w.key === k));
  NGS.partner = NGS.ngpp ? 'none' : (ng.partner && ng.partner !== 'auto' ? ng.partner : (free.find(k => NAMED[k].ngplus) || free[0] || 'none'));
  const taken = S.boons || [], want = Array.isArray(ng.boon) ? ng.boon[(S.cycle || 1) - 1] : ng.boon;
  NGS.boon = [want || 'ap', 'purse', 'recruit', 'ap', 'memory', 'loyal', 'grace', 'renown', 'devotion', 'clone'].find(k => k && NG_BOONS[k] && !taken.includes(k)) || null;
  NGS.past = ng.past || 'none';
  if (Array.isArray(ng.house)) ng = Object.assign({}, ng, { house: ng.house[(S.cycle || 1) - 1] ?? 'auto' });
  if (ng.house && !['none', 'auto', 'best'].includes(ng.house) && H(ng.house)) ng = Object.assign({}, ng, { house: 'auto' });   // already owned
  if (!NGS.ngpp) {
    if (ng.house === 'none') NGS.house = null;
    else if (ng.house && ng.house !== 'auto' && ng.house !== 'best') { if (!NGS.offers.includes(ng.house)) NGS.offers.push(ng.house); NGS.house = ng.house; }
    else if (ng.house === 'best') { const R = LAB.HOUSE_RANK; NGS.house = NGS.offers.slice().sort((a, b) => (R.indexOf(a) + 99) % 99 - (R.indexOf(b) + 99) % 99)[0] || null; }
    else NGS.house = NGS.offers[0] || null;
  }
  if (ng.keep === 'home' || keepTarget === 1) Object.keys(NGS.keep).forEach(k => NGS.keep[k] = false);
  else if (keepTarget != null) {
    const opt = optionalHouses();
    opt.forEach((h, i) => { NGS.keep[h.id] = i < keepTarget - 1; });
  }
  carriedLovers().forEach(w => { const p = (ng.perk && NG_PERKS().includes(ng.perk) && !(w.ngPerks || []).includes(ng.perk)) ? ng.perk : NG_PERKS().find(t => !(w.ngPerks || []).includes(t)); if (p) NGS.perks[w.id] = p;
    if (ng.romance) NGS.romance[w.id] = ng.romance; });
  const info = { ngpp: !!NGS.ngpp, challenge: NGS.challenge, lovers: carriedLovers().length, loversIn: carriedLovers().length, partner: NGS.partner, boon: NGS.boon, past: NGS.past, newHouse: NGS.house, offers: NGS.offers.slice() };
  try { const N = ngNumbers(NGS.boon, NGS.house); info.debt = Math.round(N.debt); info.ngppCycle = N.ngppCycle || 0; } catch (e) {}
  ngBegin(); quiet(); resolveEvents();
  if (isFirst) {
    const ga = ng.guestAlumni || (ng.ngppPrep && ng.ngppPrep.guestAlumni);
    if (ga) addGuestAlumni(ga);
  }
  info.houses = S.houses.map(h => h.id); info.staff = S.workers.length; info.debtTotal = Math.round(S.debt.total);
  return info;
}

// ---------- snapshots ----------
LAB.snapshot = () => JSON.stringify(S);
LAB.restore = snap => { S = migrate(JSON.parse(snap)); EVQ = []; CUR_EV = null; NGS = null; quiet(); };

// ---------- the run ----------
// job: {seed, scenario, start:{house,partner,past}, weeks, policy, patch, patchAt:'start'|'phase', mutate, ng, maxWarm, snap, wantSnap}
LAB.run = async (J) => {
  const out = { seed: J.seed, scenario: J.scenario, weeks: [], phases: {}, info: {} };
  P = withPreset(LAB.POLICY, J.policy || {});
  Object.assign(LAB.PHASES, J.phases || {});
  if (J.patch && J.patchAt === 'start') LAB.applyPatch(J.patch);
  store.del(KEY_SAVE); EVQ = []; CUR_EV = null; NGS = null; SETUP = null;
  const st = Object.assign({ house: 'lantern', partner: 'kaede', past: 'salaryman' }, J.start || {});
  const sc = J.scenario, warmCap = J.maxWarm || (sc === 'ngplus' ? 160 : 104);
  const track = () => { for (const k of ['mid', 'late']) if (!out.phases[k] && PHASE[k]()) out.phases[k] = S.week; };
  if (J.snap) { LAB.restore(J.snap); const I = J.snapInfo || {}; Object.assign(out.phases, I.phases || {}); if (I.c1won !== undefined) out.info.c1won = I.c1won; }
  else {
    LAB.reseed(J.seed);
    if (sc === 'early' || sc === 'early4') P = withPreset(LAB.POLICY, EARLY_POLICY, J.policy || {});
    newGame({ past: st.past, house: st.house, partner: st.partner }); quiet();
    // warm-up: play the baseline policy until the phase starts
    if (sc === 'early4' || sc === 'mid' || sc === 'late') { while (!PHASE[sc]() && !S.over && S.week <= warmCap) { playWeek(); } }
    if (sc === 'ngplus' || sc === 'plateau') { while (!S.won && !S.over && S.week <= warmCap) { const r = playWeek(); track(); } out.info.c1won = S.won ? S.week - 1 : null; }
  }
  out.info.entry = S.week;
  if (S.over || ((sc === 'ngplus' || sc === 'plateau') && !S.won) || ((sc === 'early4' || sc === 'mid' || sc === 'late') && !PHASE[sc]())) { out.unreached = true; out.info.week = S.week; return out; }
  if (J.wantSnap) { out.snap = LAB.snapshot(); out.snapInfo = { phases: Object.assign({}, out.phases), c1won: out.info.c1won }; }
  // from here on every variant shares one random stream
  LAB.reseed((J.seed * 7919 + 17) >>> 0);
  if (J.patch && J.patchAt !== 'start') LAB.applyPatch(J.patch);
  if (sc === 'early' || sc === 'early4') P = withPreset(LAB.POLICY, EARLY_POLICY, J.policy || {});
  // phase experiments: no partner walks in the measured weeks (a partner joining mid-measurement is noise); the warm-up still walks
  if (['early', 'early4', 'mid', 'late'].includes(sc) && !(J.policy && 'walkPartners' in J.policy)) P = withPreset(P, { walkPartners: false });
  if (J.phasePolicy) P = withPreset(P, J.phasePolicy);
  if (P.fixedStaff) P.maxStaff = staffIn(homeH()).length;
  const W = J.weeks || (sc === 'campaign' || sc === 'ngplus' ? 104 : sc === 'plateau' ? 26 : 12), C = sc === 'ngplus' ? (J.cycles || 1) : 1;
  out.info.cyc = []; out.info.cap = W;
  for (let c = 0; c < C; c++) {
    if (sc === 'ngplus') { if (c > 0 && !S.won) break; const ng = enterNG(J.ng, c === 0); if (c === 0) out.info.ng = ng; out.info.cyc.push(Object.assign(ng, { cycle: S.cycle, start: S.week })); }
    if (c === 0) out.info.mut = LAB.mutate(J.mutate);
    const w0 = S.week, wStartIdx = out.weeks.length, startReborn = S.workers.reduce((a, w) => a + (w.reborn || 0), 0), startHouses = S.houses.length;
    for (let i = 0; i < W && !S.over; i++) {
      const r = playWeek(); if (!r) { out.info.stalled = S.week; break; }
      out.weeks.push(r); track();
      if (S.won && J.stopOnWin !== false && sc !== 'plateau') break;
    }
    if (sc === 'ngplus') {
      const cw = out.weeks.slice(wStartIdx), segMean = (arr, k) => arr.length ? arr.reduce((a, x) => a + (x[k] || 0), 0) / arr.length : NaN;
      const hMean = arr => arr.length ? arr.reduce((a, x) => a + ((x.net || 0) - (x.guild || 0)), 0) / arr.length : NaN;
      Object.assign(out.info.cyc.at(-1), {
        len: S.won ? S.week - w0 : null, won: !!S.won, over: !!S.over, staffEnd: S.workers.length,
        lovers: S.workers.filter(w => has(w, 'Devoted')).length, friendsEnd: S.workers.filter(w => !w.key && w.trust >= 100).length,
        houses: startHouses, reborn0: startReborn, rebornAvg: segMean(cw, 'rebornSum'),
        cfE: segMean(cw.slice(0, 8), 'net'), cfM: segMean(cw.slice(8, 20), 'net'), cfL: segMean(cw.slice(20), 'net'),
        cfHE: hMean(cw.slice(0, 8)), cfHM: hMean(cw.slice(8, 20)), cfHL: hMean(cw.slice(20)), chNet: hMean(cw),
        cNet: segMean(cw, 'net'), cIncome: segMean(cw, 'income'), cWages: segMean(cw, 'wages'), cUpkeep: segMean(cw, 'upkeep'),
        cCuts: segMean(cw, 'cuts'), cGuild: segMean(cw, 'guild'), cMissed: cw.reduce((a, x) => a + (x.missed || 0), 0)
      });
    }
  }
  out.info.end = { week: S.week, won: !!S.won, over: !!S.over, houses: S.houses.map(h => ({ id: h.id, rooms: h.rooms, size: houseSize(h), used: roomsUsed(h), up: Object.keys(h.up).filter(k => h.up[k]) })) };
  return out;
};
})();
