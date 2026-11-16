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
    if (h && staffIn(h).length < P.maxStaff) return 0;
  }
  if (ch[0] && /^Hire her for /.test(ch[0].label || '')) {
    const h = curH(), candIdx = ch.findIndex(c => /to apply|Candidates/.test(c.label || ''));
    if (h && staffIn(h).length < P.maxStaff && sleepers(h).length < bedsFor(h) && S.gold >= reserveGold() + 300) return 0;
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
  maxStaff: 10,          // per house
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
  samDefault: 'bartend', // what Sam does with spare AP: bartend | security | books | scout | rounds | lesson | statclass | trainStat | trainSkill | trainService | demo | date | rest
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
  teachSkill: null       // if set and house has classroom, set teachSkill
};
let P = Object.assign({}, LAB.POLICY);

function reserveGold(){
  const LR = S.lastReport, upk = LR ? LR.upkeep + LR.wages : 150;
  let due = 0; try { const nd = nextDue(); if (nd.amount > 0 && nd.week - S.week <= 2) due = nd.amount; } catch (e) {}
  return P.reserve + upk + due;
}
function jobOrder(h, cnt){
  const T = staffIn(h).length >= P.targetsAt ? (P.targets || {}) : {}, need = Object.keys(T).filter(j => cnt(j) < T[j]);
  return ['bath', 'dancer', 'bartender', ...need, 'courtesan', 'attendant', 'promoter', 'maid']; }
function tryJob(w, j){ if (canDo(w, j)) return false; setJob(w.id, j); quiet(); return w.job === j; }
function manageJobs(h){
  const mine = staffIn(h), cnt = j => mine.filter(x => x.job === j).length;
  mine.forEach(w => { if (w.job !== 'rest' && w.energy < maxEnergy(w) * 0.30) w.job = 'rest'; });
  // locked ladies (job experiments) go back to their job as soon as they're rested
  // locked ladies (job experiments) take their job whenever they can; until then they're assigned like everyone else
  mine.forEach(w => { if (!w._lock || w.job === w._lock) return; const rested = w.job !== 'rest' || w.energy > maxEnergy(w) * 0.6; if (!rested) return;
    const was = w.job; w.job = 'rest'; if (!tryJob(w, w._lock)) { if (w._force) w.job = w._lock; else w.job = was; } });
  const free = w => !w._lock || w.job !== w._lock;
  // one lady on each amenity job the house has (from anyone rested and not locked)
  for (const j of Object.keys(AMEN)) { if (!h.up[AMEN[j]] || cnt(j) >= 1 || j === 'chapel' || j === 'teacher') continue;
    const pool = mine.filter(w => free(w) && !AMEN[w.job] && !canDo(w, j));
    pool.sort((a, b) => (a.job === 'rest' ? 0 : 1) - (b.job === 'rest' ? 0 : 1) || b.energy - a.energy);
    if (pool.length && (pool[0].job !== 'rest' || pool[0].energy > maxEnergy(pool[0]) * 0.6)) tryJob(pool[0], j); }
  mine.forEach(w => { if (!free(w) || w.job !== 'rest' || w.energy <= maxEnergy(w) * 0.6) return;
    for (const j of jobOrder(h, cnt)) { if (AMEN[j] && (!h.up[AMEN[j]] || cnt(j) >= 1)) continue; if (tryJob(w, j)) return; } });
  if (P.fillTargets && staffIn(h).length >= P.targetsAt) {
    const T = P.targets || {};
    for (const [j, want] of Object.entries(T)) {
      if (!JOBS[j] || cnt(j) >= want) continue;
      const pool = mine.filter(w => free(w) && w.job !== j && !AMEN[w.job] && (!JOBS[j].needs || h.up[JOBS[j].needs]));
      pool.sort((a, b) => (a.job === 'rest' ? 0 : 1) - (b.job === 'rest' ? 0 : 1) || b.energy - a.energy);
      for (const w of pool) {
        if (cnt(j) >= want) break;
        const was = w.job; w.job = 'rest';
        if (!tryJob(w, j)) w.job = was;
      }
    }
  }
  if (P.resort) { const T = staffIn(h).length >= P.targetsAt ? (P.targets || {}) : {};
    mine.forEach(w => { if (!free(w) || !['promoter', 'maid', 'attendant'].includes(w.job) || cnt(w.job) <= (T[w.job] || 0)) return;
      const was = w.job; w.job = 'rest'; if (!tryJob(w, 'courtesan')) w.job = was; }); }
}
function hireScore(c){ return P.hire === 'best' ? STAT_KEYS.reduce((a, k) => a + s100(c.stats[k]), 0) / Math.max(50, c.signing) : -c.signing; }
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
  if (P.decor && (h.decor || 0) < P.decor && S.gold >= upgradeCost(h, 'decor') + reserveGold()) { buyUpgrade('decor'); quiet(); }
  if (P.drinks && h.up.bar && (h.drinks || 0) < P.drinks && S.gold >= upgradeCost(h, 'drinks') + reserveGold()) { buyUpgrade('drinks'); quiet(); }
  if (staffIn(h).some(w => w.race === 'demon') && !h.up.sigil && S.gold >= upgradeCost(h, 'sigil') + reserveGold()) { buyUpgrade('sigil'); quiet(); }
  if (P.cut != null) staffIn(h).forEach(w => { if (!isFree(w) && w.cut !== P.cut) w.cut = P.cut; });
  if (P.tutor) staffIn(h).forEach(w => { w.tutor = P.tutor; w.tutorTier = P.tutorTier || 'tutor'; });
  if (P.hireRace) { const R = P.hireRace.split('/'), need = (RACES[R[0]] || {}).needs;
    if (need && !h.up[need] && S.gold >= upgradeCost(h, need) + P.reserve) { buyUpgrade(need); quiet(); } S.candidates = S.candidates.filter(c => c.race === R[0] && (!R[1] || c.sub === R[1]));
    while (S.candidates.length < 3) { let c, t = 0; do { c = genWorker({ race: R[0] }); } while (R[1] && c.sub !== R[1] && ++t < 200); c.signing = signingFor(c); S.candidates.push(c); } }
  for (let g = 0; g < 6; g++) {
    if (staffIn(h).length >= P.maxStaff) break;
    if (sleepers(h).length >= bedsFor(h)) { if (!P.beds) break;
      if ((h.extraBeds || 0) < maxExtraBeds(h) && S.gold > reserveGold() + upgradeCost(h, 'extraBed')) { buyUpgrade('extraBed'); quiet(); continue; }
      if (roomsUsed(h) + 1 <= houseSize(h) && S.gold > reserveGold() + upgradeCost(h, 'quarters') + 150) { buyUpgrade('quarters'); quiet(); continue; }
      break; }
    const c = S.candidates.filter(x => !raceBlock(x, h) && S.gold - x.signing >= reserveGold()).sort((a, b) => hireScore(b) - hireScore(a))[0];
    if (!c) break; hire(c.id); quiet();
  }
  manageJobs(h);
}
let trainI = 0;
function samSpare(){
  const k = P.samDefault, earners = S.workers.filter(w => w.job === 'courtesan' || (JOBS[w.job] || {}).must);
  const pickW = () => { const L = (earners.length ? earners : S.workers); return L[(trainI++) % L.length]; };
  if (k === 'rest') return samRest();
  if (k === 'lesson' || k === 'statclass') return samWork(k);
  if (k === 'trainStat') { const w = pickW(); return w ? samTrain(w.id, 'stat') : samWork('bartend'); }
  if (k === 'trainSkill') { const w = pickW(); return w ? samTrain(w.id, 'skill') : samWork('bartend'); }
  if (k === 'trainService') { const L = S.workers.filter(w => getActs().some(a => canSam(w, a.id))); const w = L[(trainI++) % (L.length || 1)];
    return w ? samTrain(w.id, 'service') : samWork('bartend'); }
  if (k === 'demo') { const w = S.workers.find(w => demoAct(w) && demoOpen(w)); return w ? samDemo(w.id) : samWork('bartend'); }
  if (k === 'walk') return samWalk();
  if (k === 'orgy') { const O = BAL.orgy || {}, ws = staffIn(homeH()).filter(w => !orgyWhy(w)).slice(0, O.max ?? 5);
    if (ws.length >= (O.min ?? 2) && S.sam.energy >= orgyCost(ws.length)) { orgyMenu(); ws.forEach(w => orgyPick(w.id)); samOrgy(); return; }
    return samWork('bartend'); }
  if (k === 'date') { const w = S.workers.slice().sort((a, b) => a.trust - b.trust)[0]; if (!w) return samWork('bartend'); return samDate(w.id, 'walk'); }
  return samWork(k);
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
    if (!rounds && S.sam.energy >= 25 && S.workers.some(w => nearSam(w) && w.trust < P.roundsTrust)) { samWork('rounds'); rounds = true; }
    else if (P.partnerDates && !dated && p && S.ap >= 2 && S.sam.energy >= 40) { try { samDate(p.id, 'walk'); } catch (e) {} dated = true; }
    else if ((S.ngppCycle || 0) > 0 && P.ngppWalk !== false && walks < 2 && S.sam.energy >= (((BAL.walk || {}).energy ?? 15) + 5) && S.houses.some(h => staffIn(h).length < Math.min(P.maxStaff, 6))) { samWalk(); walks++; }
    else if (P.scoutWhenShort && S.sam.energy >= 25 && S.houses.some(h => staffIn(h).length < P.scoutWhenShort) && S.candidates.filter(c => S.gold - c.signing >= P.reserve).length < 2) samWork('scout');
    else if (S.sam.energy >= 35) { try { samSpare(); } catch (e) { samWork('bartend'); } }
    else samRest();
    quiet(); resolveEvents();
  }
}
// one week of play; returns the metrics row
function playWeek(){
  for (const h of S.houses.slice().sort((a, b) => staffIn(a).length - staffIn(b).length)) manageHouse(h);
  S.cur = S.houses[0].id; samTurn(); resolveEvents();
  if (P.payOff && !S.won && S.debt.remaining > 0 && S.gold >= S.debt.remaining + reserveGold()) { try { payOffDebt(); } catch (e) {} quiet(); resolveEvents(); }
  const before = new Set(S.workers.map(w => w.id)), wk = S.week, strikes0 = S.debt.strikes;
  const who = Object.fromEntries(S.workers.map(w => [w.id, { race: w.race, sub: w.sub, key: w.key, free: w.free, wage: w.wage }]));
  endWeek(); quiet(); resolveEvents();
  const R = S.lastReport; if (!R || R.week !== wk) return null;
  const left = [...before].filter(id => !S.workers.some(w => w.id === id)).length;
  const per = Object.values(R.per).map(p => { const w = who[p.id] || {};
    return { race: w.race || '?', sub: w.sub || '', job: p.job, earned: Math.round(p.earned || 0), wage: w.free ? 0 : (w.wage || 0), served: p.served || 0, key: w.key || null, house: p.house }; });
  const hs = R.houses.map(x => ({ id: x.id, served: x.served, turned: x.turned, sat: Math.round((x.avgSat || 0) * 10) / 10, rooms: x.roomsUsed, cap: x.roomCap,
    prestige: Math.round((x.prestige ?? housePrestige(H(x.id))) * 10) / 10,
    tidy: Math.round(x.tidy), promo: Math.round((x.promoDraw || 0) * 10) / 10, pushy: x.pushy ? Object.assign({}, x.pushy) : null, lost: x.nightsLost || 0, demand: x.demand || 0, maidAdd: Math.round((x.maidAdd || 0) * 10) / 10, tidy0: Math.round(x.tidy0), visitors: x.visitors || 0,
    jobs: Object.fromEntries(Object.entries(Object.values(R.per).filter(p => p.house === x.id).reduce((a, p) => (a[p.job] = (a[p.job] || 0) + 1, a), {}))) }));
  const W = S.workers, avg = f => W.length ? W.reduce((a, w) => a + f(w), 0) / W.length : 0;
  return { wk, cycle: S.cycle || 1, gold: Math.round(S.gold), debt: Math.round(S.debt.remaining), net: Math.round(R.income - R.wages - R.upkeep - (R.recharge || 0) - (R.cuts || 0) - (R.tutor || 0)),
    income: Math.round(R.income), wages: Math.round(R.wages), upkeep: Math.round(R.upkeep), sam: Math.round(R.led.sam || 0), rep: Math.round(homeH().rep * 10) / 10, prestige: Math.round(housePrestige(homeH()) * 10) / 10,
    staff: W.length, served: R.served, turned: R.turned, sat: hs.length ? hs[0].sat : 0, missed: S.debt.strikes > strikes0 ? 1 : 0, strikes: S.debt.strikes,
    mood: Math.round(avg(w => w.mood)), trust: Math.round(avg(w => w.trust)), left, houses: hs, per, over: !!S.over, won: !!S.won };
}

// ---------- phases ----------
// early: from week 1 (no upgrades, at most 4 ladies: house lady, partner, 1-2 generics)
// mid:   home house has `midStaff` ladies; late: the home house is out of space (rooms full)
LAB.PHASES = { midStaff: 5 };
const PHASE = {
  early: () => true,
  mid: () => staffIn(homeH()).length >= LAB.PHASES.midStaff,
  late: () => roomsUsed(homeH()) >= houseSize(homeH())
};
const EARLY_POLICY = { maxStaff: 4, upgrades: false, rooms: false };

// ---------- mutations (applied at phase start, after the reseed) ----------
function generics(n){ const g = staffIn(homeH()).filter(w => !w.key).sort((a, b) => String(a.id).localeCompare(String(b.id))); return n === 'all' || n == null ? g : g.slice(0, n); }
function raceLewd(race, sub){ const sd = subData(race, sub); return ((RACES[race].mods || {}).lewd || 0) + ((sd && sd.mods || {}).lewd || 0); }
function setRace(w, race, sub){
  if (race === 'beastkin' && !sub) sub = Object.keys(RACES.beastkin.subs || {})[0];
  w.lewd = clamp(w.lewd - raceLewd(w.race, w.sub) + raceLewd(race, sub)); w.race = race; w.sub = sub || undefined;
  try { raceFit(w); } catch (e) {}
  w.wage = wageFor(w);
}
LAB.mutate = M => { if (!M) return {};
  const info = {};
  if (M.trust != null) S.workers.forEach(w => w.trust = clamp(w.trust + M.trust));
  if (M.minTrust != null) S.workers.forEach(w => w.trust = Math.max(w.trust, M.minTrust));
  if (M.race) { const [r, s] = M.race.split('/'); const who = generics(M.raceWho ?? 'all'); who.forEach(w => setRace(w, r, s)); info.raced = who.length; }
  if (M.job) { const h = homeH(), J = JOBS[M.job]; if (J && J.needs && !h.up[J.needs]) { h.up[J.needs] = true; info.granted = J.needs; }
    const who = M.jobWho === 'everyone' ? staffIn(h).filter(w => !w.isPartner && !w.locked) : generics(M.jobWho ?? 2);
    who.forEach(w => { w._lock = M.job; w._force = !!M.force; if (!canDo(w, M.job) || M.force) w.job = M.job; }); info.locked = who.length; }
  if (M.statAll) S.workers.forEach(w => STAT_KEYS.forEach(k => { w.stats[k] = clampK(w.stats[k] + M.statAll * SKL); }));   // +N (0-100 scale) to every stat
  if (M.stat) S.workers.forEach(w => Object.entries(M.stat).forEach(([k, n]) => { w.stats[k] = clampK(w.stats[k] + n * SKL); }));
  if (M.skillAll) S.workers.forEach(w => { TECH_KEYS.forEach(k => { w.tech[k] = clampK((w.tech[k] || 0) + M.skillAll * SKL); }); Object.values(w.acts || {}).forEach(a => { a.skill = clampK((a.skill || 0) + M.skillAll * SKL); }); });
  if (M.gold != null) S.gold += M.gold;
  if (M.rep != null) homeH().rep = M.rep;
  if (M.prestige != null) homeH().prestige = M.prestige;
  if (M.sam) Object.entries(M.sam).forEach(([k, v]) => { S.sam[k] = (S.sam[k] || 0) + v; });
  if (M.upgrades) M.upgrades.forEach(k => { homeH().up[k] = true; });
  if (M.incense) { homeH().up.incense = true; homeH().incense = M.incense; }
  if (M.bindGoddess) { const g = G(); g.bound = true; g.left = false; g.divinity = M.divinity ?? 5; g.love = M.love ?? 70; }
  return info;
};

// ---------- NG+ ----------
// 'best' new house = first offered in this order (from the ngplus-houses lab results)
LAB.HOUSE_RANK = ['veil', 'castle', 'hollow', 'wayfarer', 'lantern', 'sanctuary', 'atelier', 'pavilion', 'onsen', 'tankard', 'conservatory', 'lyceum', 'foundry', 'skyhook', 'pearl'];
// exactly n Devoted lovers going into NG+ (partner first, then by trust); exactly n generic "old friends" (trust 100)
function setLovers(n){
  S.workers.forEach(w => { if (has(w, 'Devoted')) w.traits = w.traits.filter(t => t !== 'Devoted'); });
  S.workers.slice().sort((a, b) => (b.isPartner ? 1 : 0) - (a.isPartner ? 1 : 0) || b.trust - a.trust).slice(0, n)
    .forEach(w => { w.traits.push('Devoted'); w.isPartner = true; w.wage = 0; w.contract = 999; });
}
function setFriends(n){
  const G = S.workers.filter(w => !w.key && !has(w, 'Devoted')).sort((a, b) => b.trust - a.trust);
  G.forEach((w, i) => { w.favorite = i < n; if (i < n) w.trust = 100; else if (w.trust >= 100) w.trust = 99; });
}
function enterNG(ng){
  ng = ng || {};
  if (ng.lovers != null) setLovers(ng.lovers);
  if (ng.friends != null) setFriends(ng.friends);
  if (ng.bindGoddess) { const g = G(); g.bound = true; g.left = false; g.divinity = ng.divinity ?? 5; g.love = ng.love ?? 70; }
  startNGPlus(); quiet();
  if (ng.cycleVar != null) NGS.cycleVar = ng.cycleVar === 'none' ? null : ng.cycleVar;
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
  if (ng.keep === 'home') Object.keys(NGS.keep).forEach(k => NGS.keep[k] = false);
  carriedLovers().forEach(w => { const p = (ng.perk && NG_PERKS().includes(ng.perk) && !(w.ngPerks || []).includes(ng.perk)) ? ng.perk : NG_PERKS().find(t => !(w.ngPerks || []).includes(t)); if (p) NGS.perks[w.id] = p;
    if (ng.romance) NGS.romance[w.id] = ng.romance; });
  const info = { ngpp: !!NGS.ngpp, cycleVar: NGS.cycleVar, challenge: NGS.challenge, lovers: carriedLovers().length, partner: NGS.partner, boon: NGS.boon, past: NGS.past, newHouse: NGS.house, offers: NGS.offers.slice() };
  try { const N = ngNumbers(NGS.boon, NGS.house); info.debt = Math.round(N.debt); info.ngppCycle = N.ngppCycle || 0; } catch (e) {}
  ngBegin(); quiet(); resolveEvents();
  if (ng.cycleVar === 'none') delete S.cycleVar;
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
  P = Object.assign({}, LAB.POLICY, J.policy || {});
  Object.assign(LAB.PHASES, J.phases || {});
  if (J.patch && J.patchAt === 'start') LAB.applyPatch(J.patch);
  store.del(KEY_SAVE); EVQ = []; CUR_EV = null; NGS = null; SETUP = null;
  const st = Object.assign({ house: 'lantern', partner: 'kaede', past: 'salaryman' }, J.start || {});
  const sc = J.scenario, warmCap = J.maxWarm || (sc === 'ngplus' ? 160 : 104);
  const track = () => { for (const k of ['mid', 'late']) if (!out.phases[k] && PHASE[k]()) out.phases[k] = S.week; };
  if (J.snap) LAB.restore(J.snap);
  else {
    LAB.reseed(J.seed);
    newGame({ past: st.past, house: st.house, partner: st.partner }); quiet();
    // warm-up: play the baseline policy until the phase starts
    if (sc === 'mid' || sc === 'late') { while (!PHASE[sc]() && !S.over && S.week <= warmCap) { playWeek(); } }
    if (sc === 'ngplus') { while (!S.won && !S.over && S.week <= warmCap) { const r = playWeek(); track(); } out.info.c1won = S.won ? S.week - 1 : null; }
  }
  out.info.entry = S.week;
  if (S.over || (sc === 'ngplus' && !S.won) || ((sc === 'mid' || sc === 'late') && !PHASE[sc]())) { out.unreached = true; out.info.week = S.week; return out; }
  if (J.wantSnap) out.snap = LAB.snapshot();
  // from here on every variant shares one random stream
  LAB.reseed((J.seed * 7919 + 17) >>> 0);
  if (J.patch && J.patchAt !== 'start') LAB.applyPatch(J.patch);
  if (sc === 'early') P = Object.assign({}, LAB.POLICY, EARLY_POLICY, J.policy || {});
  if (J.phasePolicy) Object.assign(P, J.phasePolicy);
  const W = J.weeks || (sc === 'campaign' || sc === 'ngplus' ? 104 : 12), C = sc === 'ngplus' ? (J.cycles || 1) : 1;
  out.info.cyc = [];
  for (let c = 0; c < C; c++) {
    if (sc === 'ngplus') { if (c > 0 && !S.won) break; const ng = enterNG(J.ng); if (c === 0) out.info.ng = ng; out.info.cyc.push(Object.assign(ng, { cycle: S.cycle, start: S.week })); }
    if (c === 0) out.info.mut = LAB.mutate(J.mutate);
    const w0 = S.week;
    for (let i = 0; i < W && !S.over; i++) {
      const r = playWeek(); if (!r) { out.info.stalled = S.week; break; }
      out.weeks.push(r); track();
      if (S.won && J.stopOnWin !== false) break;
    }
    if (sc === 'ngplus') Object.assign(out.info.cyc.at(-1), { len: S.won ? S.week - w0 : null, won: !!S.won, over: !!S.over, staffEnd: S.workers.length,
      lovers: S.workers.filter(w => has(w, 'Devoted')).length, friendsEnd: S.workers.filter(w => !w.key && w.trust >= 100).length });
  }
  out.info.end = { week: S.week, won: !!S.won, over: !!S.over, houses: S.houses.map(h => ({ id: h.id, rooms: h.rooms, size: houseSize(h), used: roomsUsed(h), up: Object.keys(h.up).filter(k => h.up[k]) })) };
  return out;
};
})();
