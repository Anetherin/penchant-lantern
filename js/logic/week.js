'use strict';
/* =====================================================================
   WEEK RESOLUTION (classroom, simulation & endWeek; services in services.js, UI in ui/report.js)
   ===================================================================== */
// Classroom: the teacher's subject is h.teachSkill (a TECH_KEYS skill or a service id); null/invalid = her best tech skill.
// Every other lady in the house who is behind her gains floor(gap x amenities.classroom.rate x teacher x learner) (humans x humanMult), capped by clampK.
// teacher = (base + Management x manageW + Wits x witsW) x outfit/job bonus x teach fx x her output; learner = learnBase + Wits x learnWits, x learn fx.
const teachPower = (t, pr) => { const C = BAL.amenities.classroom; return (C.base + s100(t.tech.manage)/100*C.manageW + s100(statOf(t,'wits'))/100*(C.witsW ?? C.refW)) * ob(t,'teacher') * jb0(t,'teacher') * fxMul(t,'teach') * (pr ? outputMult(t, pr) : 1); };
const learnPower = w => { const C = BAL.amenities.classroom; return (C.learnBase + s100(statOf(w,'wits'))/100*(C.learnWits ?? C.learnRef)) * fxMul(w,'learn') * (w.race==='human' ? C.humanMult : 1); };
const jb0 = (w, j) => fxSub(w, 'jobBonus', j);
// Subjects (h.teachSkill): a TECH skill, 'stat:<key>', a service id, or a set: 'set:skills' | 'set:stats' | 'set:services' | 'set:all' | 'job:<job>'
// (that job's stats and skill, plus services for menu jobs). A set splits the class: each subject gets rate x n^-setExp.
// Services need a lewd enough teacher: her lewdness (0-100) >= the service's th + classroom.svcLewd (teachLewd), and she must know it.
const teachLewd = id => ((actById(id)||{}).th || 0) + (BAL.amenities.classroom.svcLewd ?? 0);
const canTeachSvc = (t, id) => !!actById(id) && !actBanned(t, id) && t.acts && !!t.acts[actKey(id)] && (t.lewd||0) >= teachLewd(id);
const subjectLabel = k => TECH_LABEL[k] || (k.startsWith('stat:') ? cap(k.slice(5)) : actById(k) ? actLabel(k) : k);
const subjectSkill = (w, k) => TECH_LABEL[k] ? (w.tech[k]||0) : k.startsWith('stat:') ? statOf(w, k.slice(5)) : (w.acts && w.acts[actKey(k)] ? w.acts[actKey(k)].skill : null);
const TEACH_SETS = {'set:skills':'All skills', 'set:stats':'All stats', 'set:services':'All services she can teach', 'set:all':'Everything'};
function teachSetLabel(k){ return TEACH_SETS[k] || (k && k.startsWith('job:') && JOBS[k.slice(4)] ? JOBS[k.slice(4)].label + ' set' : subjectLabel(k||'')); }
function teachJobSet(t, j){
  const B = (BAL.train.stat||{}).byJob || {}, st = Object.keys(B[j] || B.default || {}).filter(k=>STAT_KEYS.includes(k)).map(k=>'stat:'+k);
  const sk = (JOBS[j]||{}).skill, out = [...st, TECH_KEYS.includes(sk) ? sk : 'service'];
  if(MENU_JOBS.includes(j)) getActs().forEach(a=>{ if(canTeachSvc(t, a.id)) out.push(actKey(a.id)); });
  return out;
}
function teachList(h, t){
  const k = h.teachSkill, svcs = () => getActs().filter(a=>canTeachSvc(t, a.id)).map(a=>actKey(a.id));
  if(k==='set:skills') return TECH_KEYS.slice();
  if(k==='set:stats') return STAT_KEYS.map(x=>'stat:'+x);
  if(k==='set:services'){ const v = svcs(); if(v.length) return v; }
  else if(k==='set:all') return [...TECH_KEYS, ...STAT_KEYS.map(x=>'stat:'+x), ...svcs()];
  else if(k && k.startsWith('job:') && JOBS[k.slice(4)]) return teachJobSet(t, k.slice(4));
  else if(k && (TECH_LABEL[k] || (k.startsWith('stat:') && STAT_KEYS.includes(k.slice(5))))) return [k];
  else if(k && canTeachSvc(t, k)) return [actKey(k)];
  return [TECH_KEYS.reduce((a,x)=>(t.tech[x]||0) > (t.tech[a]||0) ? x : a, TECH_KEYS[0])];   // auto, or a subject she can't teach (yet)
}
// What the class covers this week (label for the report and the picker's "Auto").
function classroomTeach(h, W, t, tpr, R, hr){
  const C = BAL.amenities.classroom, L = teachList(h, t), split = Math.pow(L.length, -(C.setExp ?? 0.5)), tp = teachPower(t, tpr), label = L.length > 1 ? teachSetLabel(h.teachSkill) : subjectLabel(L[0]);
  let n = 0, gain = 0;
  W.forEach(w=>{
    if(w===t) return; let got = 0;
    statXP(w, 'wits', C.learnXP ?? 0.3);
    L.forEach(k=>{
      const cur = subjectSkill(w, k); if(cur === null || (!TECH_LABEL[k] && !k.startsWith('stat:') && actBanned(w, k))) return;
      const isStat = k.startsWith('stat:'), gap = Math.max(0, subjectSkill(t, k) - cur);
      const raw = (gap * C.rate + (isStat ? (C.statFlat || 0) : 0)) * split * tp * learnPower(w) * housePerkVal(h, 'trainMult', 1);
      const d = isStat ? Math.round(raw) : Math.floor(raw); if(d <= 0) return;
      if(TECH_LABEL[k]){ const nv = clampK(w.tech[k] + d); got += nv - w.tech[k]; w.tech[k] = nv; }
      else if(isStat){ const s = k.slice(5), o = w.stats[s]||0, nv = clampK(o + d); got += nv - o; w.stats[s] = nv; }
      else { const A = w.acts[actKey(k)], nv = clampK(A.skill + d); got += nv - A.skill; A.skill = nv; }
    });
    if(got <= 0) return;
    const pr = R.per[w.id]; pr.learned = got; pr.why.push({t:`${t.name} taught her ${label.toLowerCase()}`, good:true}); n++; gain += got; countUp(w, 'lessons');
  });
  L.forEach(k=>{ const g = (k.startsWith('stat:') ? (C.teacherStatGrow ?? C.teacherGrow) : C.teacherGrow) * split; if(TECH_LABEL[k]) grow(t, k, g); else if(k.startsWith('stat:')) statXP(t, k.slice(5), g); else growAct(t, k, g); });
  moodAdd(t, C.mood); gainTrust(t, C.trust); tpr.taught = n; if(n) countUp(t, 'taught', n); tpr.why.push({t:'taught the class', good:true});
  hr.classroom = {teacher:t.name, subject:label, n, gain};
}
function attQFor(x, pr){
  const J = BAL.jobs || {};
  return clamp((s100(x.tech.service)*J.attendantSkillW + s100(statOf(x,'charm'))*J.attendantCharmW + s100(statOf(x,'wits'))*(J.attendantWitsW ?? J.attendantRefW))/100 * ob(x,'attendant') * fxSub(x,'jobBonus','attendant') * refMul(x, houseOf(x), 'attendant') * (pr ? outputMult(x, pr) : 1), 0, J.attendantQMax || 2);
}
function attendantPairs(h, R){
  const J = BAL.jobs || {}, ws = S.workers.filter(w=>w.house===h.id);
  const courts = ws.filter(w=>w.job==='courtesan').sort((a,b)=>b.popularity-a.popularity);
  const atts = ws.filter(w=>w.job==='attendant').sort((a,b)=>attQFor(b, R && R.per[b.id]) - attQFor(a, R && R.per[a.id]));
  const hasMad = ws.some(w=>w.job==='madame') || focusOn('office', h) > 0;   // Sam's Office focus pairs them too
  const byCourt = new Map(), byAtt = new Map();
  if(hasMad && courts.length && atts.length){
    const n = Math.min(courts.length, atts.length), pairs = [];
    courts.forEach(c=>atts.forEach(a=>{
      const bv = typeof bondV==='function' ? bondV(c, a) : 0;
      const score = bv * 10 + attQFor(a, R && R.per[a.id]) * 5 + c.popularity * 0.05;
      pairs.push({c, a, score});
    }));
    pairs.sort((x,y)=>y.score - x.score);
    for(const p of pairs){
      if(byCourt.size >= n) break;
      if(!byCourt.has(p.c.id) && !byAtt.has(p.a.id)){ byCourt.set(p.c.id, p.a); byAtt.set(p.a.id, p.c); }
    }
  }else{
    courts.slice(0, atts.length).forEach((c,i)=>{ byCourt.set(c.id, atts[i]); byAtt.set(atts[i].id, c); });
  }
  return {byCourt, byAtt, courts:courts.length, atts:atts.length, attSorted:atts};
}
// Amenity & quarters elegance score (0..5+) evaluated against a house's prestige expectations.
function houseAmenityScore(h, tidy0){
  const TY = BAL.tidy, U = h.up || {};
  let s = (h.tier||0)*0.8 + (h.beds||0)*0.25 + (h.decor||0)*0.55 + (U.bar ? (1 + (h.drinks||0)*0.25)*0.45 : 0);
  s += (U.bath?0.45:0) + (U.garden?0.35:0) + (U.stage?0.3:0) + (U.guard?0.2:0) + (U.classroom?0.25:0) + (U.suite?0.2:0);
  s += tidy0 >= TY.high ? 0.45 : tidy0 < TY.bad ? -0.8 : tidy0 < TY.low ? -0.35 : 0;
  return s;
}
// Move house class/prestige (0-100) toward its structural target plus this week's operational shifts.
function updatePrestige(h, hr, W, R, info){
  const PR = BAL.prestige, HD = HOUSES[h.id], TY = BAL.tidy;
  const p0 = housePrestige(h), reasons = [];
  const note = (text, delta) => { if(Math.abs(delta) >= 0.05) reasons.push({t:text, d:delta}); };
  if(!PR || !W.length){ h.prestige = p0; hr.prestige = p0; hr.prestigeDelta = 0; hr.prestigeReasons = reasons; return; }
  const U = h.up || {};
  let target = (HD.prestige ?? 50) + ((h.tier||0) - 1)*(PR.tierPer ?? 5) + ((h.beds||0) - 1)*(PR.bedPer ?? 3)
    + (h.decor||0)*(PR.decorPer ?? 3.5) + (U.bar ? ((h.drinks||0) - 0.5)*(PR.drinksPer ?? 3) : 0) + (h.price - 1)*(PR.pricePer ?? 4)
    + (U.garden?3:0) + (U.bath?2:0) + (U.classroom?3:0) + (U.stage?2:0) + (U.guard?2:0) + (U.suite?2:0) + (info.angelChapel?4:0);
  target += hr.tidy0 >= TY.high ? (PR.tidyHigh ?? 4) : hr.tidy0 < TY.bad ? (PR.tidyBad ?? -10) : hr.tidy0 < TY.low ? (PR.tidyLow ?? -4) : 0;
  let op = 0;
  // Every working courtesan having a dedicated attendant elevates the house's tone
  if(info.courts > 0){
    const cov = Math.min(1, info.ownAtts / info.courts);
    if(info.ownAtts >= info.courts){ target += (PR.attAllTarget ?? 6); op += (PR.attAllDirect ?? 1); note('every courtesan had an attendant', PR.attAllDirect ?? 1); }
    else if(cov > 0){ target += cov * (PR.attPartialTarget ?? 4); }
  }
  // Charming & charismatic madame and hosts elevate prestige
  if(info.leaders.length){
    const avgPoise = info.leaders.reduce((a,w)=>a + (s100(statOf(w,'charm')) + s100(statOf(w,'charisma')))/2, 0) / info.leaders.length;
    target += clamp((avgPoise - (PR.leadNeutral ?? 45)) / (PR.leadDiv ?? 10) * info.leaders.length, -4, PR.leadTargetCap ?? 9);
    if(avgPoise > (PR.leadDirectAt ?? 55)){
      const ld = Math.min(PR.leadDirectCap ?? 1.2, (avgPoise - (PR.leadDirectAt ?? 55)) / (PR.leadDirectDiv ?? 25));
      op += ld; note('charming/charismatic madame & hosts', ld);
    }
  }
  // Tidy / shabby direct weekly nudge
  if(hr.tidy0 >= TY.high){ op += 0.4; note('spotless house', 0.4); }
  else if(hr.tidy0 < TY.bad){ op -= 1.5; note('filthy house', -1.5); }
  else if(hr.tidy0 < TY.low){ op -= 0.5; note('shabby house', -0.5); }
  // Less classy events & habits
  if(hr.exhibActs){
    const exPen = Math.min(PR.exhibActCap ?? 3.5, hr.exhibActs * Math.abs(PR.exhibAct ?? 0.35))
      + Math.min(PR.exhibFullCap ?? 3.0, (hr.exhibFullActs||0) * Math.abs(PR.exhibFullAct ?? 0.45));
    op -= exPen; note(hr.exhibFullActs ? 'open exhibitionism with rooms full' : 'exhibitionist acts', -exPen);
  }
  if(hr.samplesPrestige){
    const sp = clamp(hr.samplesPrestige, -(PR.samplesCap ?? 4), PR.samplesGainCap ?? 2.2);
    op += sp; note(sp > 0 ? 'classy street samples above house standing' : 'cheap street samples below house class', sp);
  }
  if(hr.fullFluff){
    const fp = Math.min(PR.fullFluffCap ?? 3.5, hr.fullFluff * Math.abs(PR.fullFluff ?? 0.5));
    op -= fp; note('hosts fluffing while rooms were full', -fp);
  }
  if(hr.left){ const lp = Math.min(PR.leaveCap ?? 2, hr.left * Math.abs(PR.leave ?? 0.25)); op -= lp; note('clients walked out', -lp); }
  if(hr.crowdOver > 0){ const cp = Math.min(PR.crowdCap ?? 2, hr.crowdOver * Math.abs(PR.crowdPer ?? 0.15)); op -= cp; note('overcrowding', -cp); }
  const pFail = ((hr.pushy&&hr.pushy.samfail)||0) + ((hr.pushy&&hr.pushy.none)||0);
  if(pFail){ const pp = Math.min(PR.pushyCap ?? 2.4, pFail * Math.abs(PR.pushyFail ?? 0.6)); op -= pp; note('unhandled pushy clients', -pp); }
  if(hr.demonDrains){ const dp = hr.demonDrains * Math.abs(PR.demonDrain ?? 0.4); op -= dp; note('unshielded demon drain', -dp); }
  if(hr.served > 0) op += clamp((hr.sat/hr.served - 52) / (PR.satDriftDiv ?? 20), -(PR.satDriftCap ?? 1.5), PR.satDriftCap ?? 1.5);
  target = clamp(target, 0, 100);
  h.prestige = clamp(p0 + (target - p0) * (PR.driftRate ?? 0.18) * (hasPast('concierge') ? 1.3 : 1) + op);
  hr.prestige = h.prestige; hr.prestigeDelta = h.prestige - p0; hr.prestigeReasons = reasons;
}
// Her client limit for one night (balance.json → nights): base + Stamina / perStamina (+ nightCap fx), at least min, at most max.
// The fraction is rolled each night, so 2.4 means 2 most nights and 3 some nights.
function nightCapOf(w){
  const N = BAL.nights || {}, raw = (N.base ?? 1) + s100(statOf(w,'stamina')) / (N.perStamina ?? 40) + fxAdd(w,'nightCap');
  const c = Math.floor(raw) + (Math.random() < raw - Math.floor(raw) ? 1 : 0);
  return clamp(c, N.min ?? 1, N.max ?? 6);
}
// Spread a weekly count over the nights: night k gets its even share, the remainder lands on random nights (deterministic per call order).
function splitShare(total, nights, k){
  const base = Math.floor(total / nights), rem = total - base * nights;
  return base + (rem > 0 && Math.random() < rem / nights ? 1 : 0);
}
// After each work night everyone who worked sleeps (balance.json → rest.night): bed rest x Strength recovery x tidiness x rest.night,
// cut by fatigue. A night's work wears a little on Health (rest.wear.nightBase + nightPerSpent x share of her energy spent tonight).
// Demons don't sleep (they feed); androids plug in and charge to full (paid at the week's end, endWeek).
function nightRest(h, W, R, hr){
  const RB = BAL.rest || {}, WR = RB.wear || {}, tfx = hr.tidyFx;
  W.forEach(w=>{
    if(w.job==='rest' || w.race==='demon') return;
    const pr = R.per[w.id], mx = maxEnergy(w), spent = Math.max(0, (pr.nE0 ?? w.energy) - w.energy);
    if(w.energy < mx*0.25) pr.lowNights = (pr.lowNights||0) + 1;
    if(w.race==='android'){ const got = Math.max(0, mx - w.energy); w.energy += got; pr.charged = (pr.charged||0) + got; return; }
    let rec = (w._bed ?? BEDS[h.beds||0].rest) * restMult(w) * (tfx ? tfx.rec : 1) * (RB.night ?? 0.25);
    if(WR.per){ rec *= 1 - fatigueCut(w); w.health = clamp(w.health - ((WR.nightBase ?? 0.3) + (WR.nightPerSpent ?? 1.2) * spent/mx) * fxMul(w,'fatigue')); }
    const e0 = w.energy; if(w.energy < mx) w.energy = Math.min(mx, w.energy + rec);
    pr.eNight = (pr.eNight||0) + (w.energy - e0);
  });
}
function simHouse(h, R){
  const HD = HOUSES[h.id], W = S.workers.filter(w=>w.house===h.id && w.job!=='guild'), P = PRICES[h.price], J = BAL.jobs, BP = BAL.props, TY = BAL.tidy, PR = BAL.prestige || {};
  const pr0 = housePrestige(h), lowF = clamp((50 - pr0)/50, 0, 1), highF = clamp((pr0 - 50)/50, 0, 1);
  const amenScore = houseAmenityScore(h, h.tidy ?? TY.start), expAmen = (pr0/100) * (PR.amenExpectMax ?? 3.2), expQ = (PR.qualBase ?? 0.25) + (pr0/100) * (PR.qualPerPrestige ?? 0.4);
  const hr = {id:h.id, name:h.name, income:0, served:0, turned:0, sat:0, upkeep:0, short:0, roomsUsed:0, roomCap:h.rooms*BAL.rooms.perRoom, tidy0:h.tidy ?? TY.start, tidy:h.tidy ?? TY.start, tidyFx:null,
    prestige0:pr0, prestige:pr0, prestigeDelta:0, prestigeReasons:[], exhibActs:0, exhibFullActs:0, fullFluff:0, samplesPrestige:0, demonDrains:0,
    promoDraw:0, selfProps:0, accProps:0, stepIn:0, waited:0, left:0, stopped:0, guestsIn:0, crowdCap:0, crowdOver:0, hosted:{ent:0, warm:0, fin:0}, pushy:{total:0, talked:0, security:0, sam:0, samfail:0, none:0, samcall:0}, calls:[]};
  const byJob = j => W.filter(w=>w.job===j);
  const jb = (w, j) => fxSub(w, 'jobBonus', j);
  // the madame matches clients to the lady whose menu fits; Sam's Office focus does it too (most of her effect alone, a little on top of hers)
  const FO = (BAL.focus||{}).office || {}, offE = focusOn('office', h), samMad = offE ? samMadF() * offE : 0;
  const mad = byJob('madame')[0], mgmt = !!mad || samMad > 0;
  const madF = samMad * (mad ? (FO.withMadame ?? 0.2) : (FO.share ?? 0.7)) + (mad ? (0.5 + (s100(mad.tech.manage) + s100(statOf(mad,'wits'))*0.4 + s100(statOf(mad,'charm'))*0.35 + s100(statOf(mad,'charisma'))*0.25)/200) * ob(mad,'madame') * jb(mad,'madame') * refMul(mad, h, 'madame') : 0);
  const danceDraw = byJob('dancer').reduce((a,w)=>a + (1 + w.popularity/30 + s100(w.tech.dance)/50)*ob(w,'dancer')*jb(w,'dancer'), 0) * housePerkVal(h, 'danceMult', 1);
  const secs = byJob('security');
  const atSam = samAtHouse(h), samSec = atSam ? S.samWeek.security : 0;
  let secPow = secs.reduce((a,w)=>a + (s100(w.tech.combat) + s100(statOf(w,'strength'))*0.3 + s100(statOf(w,'agility'))*0.25 + fxAdd(w,'security'))*ob(w,'security')*jb(w,'security'), 0);
  if(h.up.guard) secPow *= 1.8;
  if(atSam) secPow += samSec;   // Sam only adds security on his Watch focus (focus.js), at his house unless samReach()
  // Wits-based screening (client value + calmer traits) and Charm/Charisma-based poise at the door (smaller stop penalty)
  const secScreenRaw = secs.reduce((a,w)=>a + (s100(statOf(w,'wits'))*0.65 + s100(statOf(w,'charisma'))*0.2 + s100(w.tech.combat)*0.15)/100 * ob(w,'security') * jb(w,'security'), 0);
  const secScreen = clamp(secScreenRaw * (h.up.guard ? 1.2 : 1) + (samSec > 0 ? (S.sam.wits||0)/250 : 0), 0, 1.5);
  const secGraceRaw = secs.length
    ? secs.reduce((a,w)=>Math.max(a, (s100(statOf(w,'charm'))*0.5 + s100(statOf(w,'charisma'))*0.5)/100 * ob(w,'security') * jb(w,'security')), 0)
    : (samSec > 0 ? clamp((S.sam.charm||0)/100, 0, 1) : 0);
  const secGrace = clamp(secGraceRaw + (secs.length && h.up.guard ? 0.1 : 0), 0, 1);
  const barN = h.up.bar ? byJob('bartender').length : 0, attendants = byJob('attendant');
  const floorE = focusOn('floor', h), floorSat = floorE * (((BAL.focus||{}).floor||{}).sat ?? 4);   // Sam working the floor: happier clients, calmer waits
  // attendants (balance.json → jobs.attendant*): her quality = Hospitality / Charm / Wits x outfit/job bonus x output. With a madame, bonded pairs match first.
  const ap = attendantPairs(h, R), ownAttMap = ap.byCourt, attSorted = ap.attSorted;
  const attAvg = attSorted.length ? attSorted.reduce((a,x)=>a+attQFor(x, R.per[x.id]),0)/attSorted.length : 0;
  const attHelp = w => w.job!=='courtesan' ? 0 : ownAttMap.has(w.id) ? attQFor(ownAttMap.get(w.id), R.per[ownAttMap.get(w.id).id]) : attAvg * J.attendantShared;
  const barBoost = 1 + Math.min(barN, J.barPropsMax) * J.barProps * (BAL.amenities.drinks.props[h.drinks||0] ?? 1);   // the bar loosens purses and inhibitions (balance.json → jobs.barProps, amenities.drinks.props)
  const X = {h, hr, R, P, secPow, barN, mgmt, rowdySum:0, rowdyN:0, expectMiss:0, unsat:0, repSat:0, gossipRep:0, hosts:[]};
  // A thirsty client who ends up unserved (turned away, refused, left): house reputation drops; viaSat = the satisfaction hit is applied to his own visit instead.
  const thirstyMiss = (c, viaSat) => { if(!cHas(c,'thirsty')) return; const T = BAL.clients.thirsty; h.rep = clamp(h.rep - T.rep); if(!viaSat) X.unsat += T.sat; hr.thirstyMiss = (hr.thirstyMiss||0) + 1; };
  X.roomOK = w => has(w,'Exhibitionist') || hr.roomsUsed < hr.roomCap;
  X.useRoom = w => { if(!has(w,'Exhibitionist')) hr.roomsUsed++; };
  hr.tidyFx = hr.tidy0 >= TY.high ? TY.fx.high : hr.tidy0 < TY.bad ? TY.fx.bad : hr.tidy0 < TY.low ? TY.fx.low : null;
  const repEff = h.rep*0.75 + S.rep*0.25, DM = BAL.demand || {};
  const priceEff = Math.max(repEff, pr0 * (PR.priceEffWeight ?? 0.85));
  const priceDem = P.demand * (P.repReq ? clamp(priceEff / P.repReq, DM.priceRepMulMin ?? 0.15, DM.priceRepMulMax ?? 1.15) : 1);
  let dBase = ((DM.base ?? 5) + repEff*(DM.perRep ?? 0.5) + danceDraw*(DM.danceMult ?? 1.5)) * HD.demand * priceDem * rnd(0.85,1.15);
  if(HD.haunted) dBase *= 0.45 + Math.min(1, h.rep/(HD.hauntRep||40))*0.8;
  dBase *= (h.bonus&&h.bonus.demand) || 1;
  dBase *= BAL.amenities.decor.demand[h.decor||0] ?? 1;
  dBase *= 1 + lowF * (PR.lowDemandBonus ?? 0.25);
  dBase *= ((hr.tidyFx && hr.tidyFx.demand) || 1) * cycleVarMul('demand', 1);   // word gets around about a shabby house (balance.json → tidy.fx.*.demand)
  const v0 = W.length ? Math.max(1, Math.round(dBase)) + danceDraw*2 : 0;   // expected visitors, for proposition rates
  const escorts = W.filter(w=>JOBS[w.job].cat==='escort');
  // Nights (balance.json → nights): the week is six work nights. Each night every escort takes up to her nightly cap (nightCapOf, Stamina-based),
  // limited by energy, then sleeps (nightRest: bed x Strength recovery, a little wear on Health). capc holds tonight's cap.
  const NIGHTS = BP.nights || 6, capc = {}; X.capc = capc; X.night = 0;
  W.forEach(w=>{ const pr = R.per[w.id]; pr.nServed = 0; pr.nightOver = false; if(escorts.includes(w)) pr.cap = 0; });
  // max lust: some ladies spend part of a night alone instead (costs energy, fewer clients)
  W.forEach(w=>{
    if(!restless(w) || has(w,'Devoted') || Math.random() >= soloChance(w)) return;   // lovers wait for Sam
    const pr = R.per[w.id]; pr.solo = true;
    w.energy = Math.max(0, w.energy - Math.round(maxEnergy(w)*BAL.solo.energyCost)); spendLust(w, BAL.solo.lustDrop); moodAdd(w, 3);
    pr.soloNight = ri(0, NIGHTS-1);   // one night of the week she spends alone instead of with clients
    R.hl.push({wid:w.id, text:flavor('solo', w), act:null, scene:'solo', noAi:true});
  });
  const roomM = ROOM_MULT[h.tier];
  const propInc = (w, id, cls, c) => { const q = qualityOf(w,id); return Math.round(actById(id).price * P.mult * BP.propFee * feeQualMult(q) * cls.mult * fxMul(w,'clientFee') * incenseMul(w,'clientFee') * BAL.income.escort * cMul(c,'fee',X,w) * cQual(c,q) * cycleVarMul('prop', 1) * (cls.tier==='rich' ? cycleVarMul('richFee', 1) : 1) * shrineMult(h, 'perFee')); };

  // --- propositions to staff (courtesans are asked through the main flow below)
  const propN = {};   // weekly offers per lady, spread over the nights
  W.forEach(w=>{
    const j = w.job, rate = PROP_RATE[j]; if(!rate) return;
    const pr = R.per[w.id], must = !!JOBS[j].must;
    propN[w.id] = Math.round(v0 * rate * barBoost * housePerkVal(h, 'propMult', 1) * (1 + lowF * (PR.lowPropRate ?? 0.45)) * fxMul(w,'propRate') * incenseMul(w,'prop') * (0.4 + appeal(w)/100) * ob(w,'propose') * rnd(0.6,1.4));
  });
  const staffProps = (w, n) => {
    const j = w.job, pr = R.per[w.id], must = !!JOBS[j].must;
    for(let i=0;i<n && !pr.nightOver;i++){
      const cls = pickClass(h), client = makeClient(h, cls); if(Math.random() > clamp((cls.prop ?? 1) * cMul(client,'prop',X) * cJob(client,j), 0, 1)) continue; noteClient(X, client);
      const s0 = encSnap(w, pr), want = pickWant(cls, w, client), expects = j==='attendant' && Math.random() < BP.attendantExpect; pr.props++;
      const dec = propDecide(w, want, X), e = {cls:cls.id, want, act:null, outcome:'no', where:j, note:null, expr:null, ctx:'prop'};
      if(dec.kind === 'no'){
        if(dec.why==='nomood'){ pr.notMood = (pr.notMood||0)+1; e.note = 'nomood'; }
        if(expects){ X.expectMiss++; pr.expectMiss = (pr.expectMiss||0)+1; e.note = 'expect'; }
        const pu = pushyCheck(X, w, cls, pr, client); if(pu) e.note = 'pushy_'+pu;
        thirstyMiss(client, true);
        if(pr.nightOver) break;   // her night ended: tonight's other offers never reach her
      } else if(!X.roomOK(w)){ hr.turned++; hr.short++; pr.noRoom = (pr.noRoom||0)+1; e.note = 'noroom'; thirstyMiss(client); }
      else if(j==='chapel'){
        const A = actById(dec.act), reluct = clientStance(w,dec.act)==='ask', C = BAL.amenities.chapel, rm = w.race==='angel' ? 1 : (C.nonAngelMult ?? 0.5), cm = housePerkVal(h, 'chapelMult', 1);
        const coin = Math.round((HD.chapelPropCoin || 0) * rm * cm);
        pr.acc++; hr.accProps++; pr.chapelProps = (pr.chapelProps||0)+1; repAdd(h, (C.propRep ?? 0.45) * rm * cm);
        if(coin){ hr.income += coin; R.led.chapel += coin; pr.earned += coin; hr.chapel = (hr.chapel||0) + coin; }
        const rs = runService(X, w, A, {tech:clientTech(cls,null,client), reluct, inc:coin, ecost:actCost(w,dec.act), led:'chapel', client, cls, q:qualityOf(w,dec.act)*(reluct?0.85:1)});
        if(!reluct && w.lust < LUST_EAGER && !restless(w)){ moodAdd(w, -BP.reluctantMood); pr.grudging = (pr.grudging||0)+1; }
        e.act = dec.act; e.outcome = dec.kind; e.chapelProp = true; e.ctx = 'chapel'; e.lantern = w.race==='angel' && w.sub==='lantern' && Math.random()<0.45; e.note = rs.note; e.expr = rs.ser.expr; e.encore = rs.encore; e.encoreKind = rs.encoreKind; e.roundDeclined = rs.roundDeclined; e.more = rs.more;
      } else {
        const A = actById(dec.act), reluct = clientStance(w,dec.act)==='ask', sp = spiritPossess(X, w, client, pr), ad = androidAdapt(w, client, pr);
        const inc = Math.round(propInc(w, dec.act, cls, client) * (sp ? sp.feeMult : 1) * (ad ? ad.feeMult : 1));
        hr.income += inc; R.led.offduty += inc; pr.earned += inc; pr.acc++; hr.accProps++; if(!must) pr.accProp = (pr.accProp||0)+1; if(j==='host') pr.hostProps = (pr.hostProps||0)+1;
        const rs = runService(X, w, A, {tech:clientTech(cls,null,client), reluct, inc, ecost:actCost(w,dec.act), led:'offduty', client, cls, q:qualityOf(w,dec.act)*(reluct?0.85:1)});
        if(!must && !reluct && w.lust < LUST_EAGER && !restless(w)){ moodAdd(w, -BP.reluctantMood); pr.grudging = (pr.grudging||0)+1; }
        e.act = dec.act; e.outcome = dec.kind; e.note = rs.note; e.expr = rs.ser.expr; e.encore = rs.encore; e.encoreKind = rs.encoreKind; e.roundDeclined = rs.roundDeclined; e.more = rs.more; e.possess = sp ? sp.react : null; e.adapt = ad ? ad.adapt : null; e.spiritFuta = !!sp; e.lantern = w.race==='angel' && w.sub==='lantern' && Math.random()<0.45; e.heat = (w.race==='beastkin' && restless(w));
        e.ctx = j==='bath' ? 'bath' : has(w,'Exhibitionist') ? 'exhib' : (rs.reck0 ? 'reckless' : 'prop');
      }
      pr.enc.push(encFx(w, pr, s0, e));
    }
  };
  // --- restless ladies proposition clients themselves (1-3 extra encounters; lovers wait for Sam)
  const reckN = {};   // nights her restlessness gets the better of her (one entry per encounter)
  W.forEach(w=>{
    const pr = R.per[w.id];
    if(w.job==='rest' || (!restless(w) && propDrive(w) < lustHigh(w)) || has(w,'Devoted') || pr.solo) return;   // demons: hunger counts toward it (propDrive), and a starving one is reckless anyway
    reckN[w.id] = Array.from({length: ri(BP.recklessMin, BP.recklessMax)}, ()=>ri(0, NIGHTS-1));
  });
  const reckless = (w, n) => {
    const pr = R.per[w.id]; if(pr.nightOver) return;
    const must = !!JOBS[w.job].must, hungry = w.race==='demon' && w.lust < lustHigh(w);   // her hunger, not her lust, got her here
    for(let i=0;i<n && !pr.nightOver;i++){
      let ids = offeredMenu(w).filter(id=>canClient(w,id) && actById(id) && !feedOnly(w,id) && energyOK(w, id, 0.2));
      if(hungry && ids.some(demonFeeds)) ids = ids.filter(demonFeeds);   // a hungry demon goes looking for a meal
      if(!ids.length) break;
      const f = pickFav(w, ids), id = (f && Math.random()<0.5) ? f : pick(ids), cls = pickClass(h), client = makeClient(h, cls), e = {cls:cls.id, want:id, act:null, outcome:'no', self:true, note:null, expr:null, ctx:'reckless'}, s0 = encSnap(w, pr);
      pr.props++; hr.selfProps++; R.selfProps++; noteClient(X, client);
      if(Math.random() < clamp(BP.selfAccept + appeal(w)/250 + cAdd(client,'selfAccept',X), 0.3, 0.97) && X.roomOK(w)){
        const A = actById(id), sp = spiritPossess(X, w, client, pr), ad = androidAdapt(w, client, pr);
        const inc = Math.round(propInc(w, id, cls, client) * (sp ? sp.feeMult : 1) * (ad ? ad.feeMult : 1));
        hr.income += inc; R.led.offduty += inc; pr.earned += inc; pr.acc++; hr.accProps++; if(!must && w.job!=='chapel') pr.accProp = (pr.accProp||0)+1;
        const rs = runService(X, w, A, {tech:clientTech(cls,null,client), reluct:false, inc, ecost:actCost(w,id), led:'offduty', client, cls, q:qualityOf(w,id)});
        e.act = id; e.outcome = 'yes'; e.note = rs.note; e.expr = rs.ser.expr; e.encore = rs.encore; e.encoreKind = rs.encoreKind; e.roundDeclined = rs.roundDeclined; e.more = rs.more; e.possess = sp ? sp.react : null; e.adapt = ad ? ad.adapt : null; e.spiritFuta = !!sp; e.lantern = w.race==='angel' && w.sub==='lantern' && Math.random()<0.45; e.heat = (w.race==='beastkin' && restless(w));
        e.ctx = w.job==='bath' ? 'bath' : w.job==='chapel' ? 'chapel' : has(w,'Exhibitionist') ? 'exhib' : 'reckless';
      }
      pr.enc.push(encFx(w, pr, s0, e));
    }
  };
  // --- promoters draw clients (free samples: bigger draw, but it tires her and shows in the house's name)
  // (balance.json → jobs: promoterBase/Div; x (1 + promoterLowRep x (1 - rep/promoterRepRef)) for a house that isn't known yet;
  //  each further promoter x promoterStack; word of mouth: repAdd(promoterRep x draw))
  let promoDraw = 0;
  const lowRepM = 1 + (J.promoterLowRep || 0) * Math.max(0, 1 - h.rep / (J.promoterRepRef || 60));
  byJob('promoter').map(w=>({w, q:s100(statOf(w,'charisma')) + s100(w.tech.service)})).sort((a,b)=>b.q-a.q).forEach(({w}, k)=>{
    const pr = R.per[w.id], samples = w.samples && !has(w,'Modest');
    let d = (J.promoterBase + (s100(statOf(w,'charisma')) + s100(w.tech.service))/J.promoterDiv) * ob(w,'promoter') * jb(w,'promoter') * fxMul(w,'promote') * outputMult(w, pr) * lowRepM * Math.pow(J.promoterStack ?? 1, k);
    if(samples){
      d *= J.samplesDraw; w.energy -= J.samplesEnergy; pr.samples = true;
      // the samples are real (light) services from her client menu, given away on the street: no fee, no room, but they count as services
      const sIds = offeredMenu(w).filter(id=>SAMPLE_LIGHT.includes(id) && actById(id) && canClient(w,id) && !nim(w,id) && !actBanned(w,id));
      let sN = 0, qSum = 0;
      for(let k = ri(J.samplesMin ?? 1, J.samplesMax ?? 3); k>0 && sIds.length; k--){
        const f = pickFav(w, sIds), id = (f && Math.random()<0.5) ? f : pick(sIds), A = actById(id);
        if(w.energy - actCost(w, id)*0.5 < maxEnergy(w)*0.2) break;
        const s0 = encSnap(w, pr), qId = qualityOf(w, id);
        w.energy -= actCost(w, id)*0.5; growAct(w, id, 0.3); lewdUp(w, 0.2, svcLewdCap(id,'client'));
        const ser = serveAct(w, A, {tech:0.8, reluct:false, pr, h});
        pr.samp = pr.samp || {}; pr.samp[id] = (pr.samp[id]||0) + 1; sN++; qSum += qId;
        w.popularity = clamp(w.popularity + (J.samplesPop ?? 0.8) * (0.5 + qId));   // the street remembers the girl who gave it away
        pr.enc.push(encFx(w, pr, s0, {cls:pickClass(h).id, act:id, outcome:'yes', sample:true, note:ser.note, expr:ser.expr, ctx:'sample'}));
      }
      if(!sN){ spendLust(w, J.samplesLust); w.popularity = clamp(w.popularity + (J.samplesPopTease ?? 0.3)); }   // nothing on her menu light enough: smiles and teasing only
      const qEff = sN ? qSum / sN : qualityOf(w), ladyClass = clamp(qEff * 70 + s100(statOf(w,'refinement')) * 0.15 + (w.popularity||0) * 0.2, 0, 100);
      const sp = clamp(((ladyClass - pr0) / (PR.samplesDiv ?? 25)) * (sN ? 1 : 0.6), -(PR.samplesNegCap ?? 3), PR.samplesPosCap ?? 1.8);
      hr.samplesPrestige += sp;
      if(Math.abs(sp) >= 0.15) (pr.notes = pr.notes||[]).push(flavor(sp > 0 ? 'job_samples_rep_good' : 'job_samples_rep_bad', w));
    }
    pr.draw = d; promoDraw += d * priceDem; countUp(w,'promo', Math.max(1, Math.round(d * priceDem)));
    if(J.promoterRep) repAdd(h, d * priceDem * J.promoterRep);
  });
  hr.promoDraw = promoDraw;
  const demand = W.length ? Math.max(1, Math.round(dBase + promoDraw)) : 0;

  // --- the main client flow: escorts (courtesans), with the madame and attendants stepping in when they are swamped
  const helpers = [mad, ...attendants].filter(Boolean), helperOK = x => x.energy >= maxEnergy(x)*J.stepInMinEnergy && (R.per[x.id].served < J.stepInCap) && !R.per[x.id].nightOver;
  const avl = x => !R.per[x.id].nightOver && R.per[x.id].nServed < capc[x.id] && (x.race==='demon' || x.energy >= maxEnergy(x)*0.2);
  const regs = demand ? regularsVisiting(h) : []; let bestNew = null;
  // hosts (clients.host): capacity per week = perWeek x (1 + service skill/100 x skillPer x 10) x outfit/job bonus x outputMult, minus propCost per accepted proposition
  const WT = BAL.clients.wait, CR = BAL.clients.crowd || {}, HS = BAL.clients.host, HOST_LIGHT = ['kiss','massage_give','manual_give','oral_give','breast_give'];
  const crowdCap = Math.max(10, houseSize(h) * (CR.perSpace ?? 5)); hr.crowdCap = crowdCap;
  let nGuests = 0;   // tonight's guests; crowding is judged as if every night of the week were like tonight (crowdCap is a weekly figure)
  const crowdOverNow = () => Math.max(0, nGuests*NIGHTS - crowdCap);
  const crowdSatNow = () => { const ov = crowdOverNow(); return ov > 0 ? Math.min(CR.satCap ?? 45, ov * (CR.satPer ?? 0.45) + ov * ov * (CR.satQuad ?? 0.025)) : 0; };
  const barBt = barN ? byJob('bartender')[0] : null, dancers = byJob('dancer');
  X.hosts = byJob('host').filter(w=>!R.per[w.id].solo && w.energy >= maxEnergy(w)*0.2).map(w=>{ const pr = R.per[w.id];
    const cap = Math.max(0, HS.perWeek * (1 + s100(w.tech.service)/100 * HS.skillPer * 10) * ob(w,'host') * jb(w,'host') * outputMult(w,pr) - (pr.hostProps||0) * HS.propCost);
    return {w, pr, ent:0, warm:0, fin:0, cap, maxCap: cap}; });
  const hostOK = x => x.cap >= 0.5 && x.w.energy >= maxEnergy(x.w)*0.2;
  const waitBuf = (WT.doorQueue ?? 2) + X.hosts.filter(hostOK).length * (WT.hostQueue ?? 4) + (barBt ? (WT.barQueue ?? 2) : 0) + (dancers.length ? (WT.stageQueue ?? 2) : 0);
  let secStopLeft = (secs.length || samSec > 0) ? Math.round(((secs.length ? (WT.secStopBase ?? 8) : 0) + secPow / (WT.secStopDiv ?? 15)) * (h.up.guard ? 1.4 : 1)) : 0;
  let overflowEntered = 0;
  // how comfortable it is to wait here (offsets unattended walkout risk)
  const comfortNow = () => (h.up.garden ? WT.garden : 0) + WT.decorPer*(h.decor||0) + (hr.tidy0 >= TY.high ? WT.tidy : 0) + (h.up.bath ? WT.bath : 0) + (barBt ? WT.bar : 0) + (dancers.length ? WT.stage : 0) + WT.hostPer * X.hosts.filter(hostOK).length + floorE * (WT.bar ?? 0);
  // waiting clients spend at open bars/stages, which sometimes keeps them occupied and content
  const loungeHelp = (client, cls) => {
    let barHelped = false, danceHelped = false;
    const cDrop = crowdOverNow() * (CR.calmPer ?? 0.015);
    if(barBt){
      const sp = Math.round(WT.barSpend * cls.mult * cMul(client,'fee',X) * (BAL.amenities.drinks.bar[h.drinks||0] ?? 1));
      hr.income += sp; R.led.bar += sp; R.per[barBt.id].earned += sp;
      if(Math.random() < clamp((WT.barCalm ?? 0.45) + (h.drinks||0) * (WT.barDrinksCalm ?? 0.1) - cDrop, 0, 0.85)) barHelped = true;
    }
    if(dancers.length){
      const sp = Math.round(WT.stageSpend * cMul(client,'stageSpend') * cls.mult * cMul(client,'fee',X));
      hr.income += sp; R.led.dance += sp; R.per[dancers[0].id].earned += sp;
      if(Math.random() < clamp((WT.danceCalm ?? 0.5) + Math.min(2, dancers.length - 1) * (WT.danceExtraCalm ?? 0.12) - cDrop, 0, 0.85)) danceHelped = true;
    }
    return {barHelped, danceHelped};
  };
  // host warm-up (takes an open room if one is free, else in the lounge): returns avg quality if any fluff happened, else 0
  const hostFluff = (hx, client, cls, maxActs) => {
    const hw = hx.w, hpr = hx.pr;
    if(cOpen(client) < HS.fluffOpen) return 0;
    const ids = offeredMenu(hw).filter(id=>HOST_LIGHT.includes(id) && actById(id) && canClient(hw,id) && !actBanned(hw,id) && !feedOnly(hw,id));
    let done = 0, qSum = 0;
    for(let k=maxActs; k>0 && ids.length && hx.cap >= 1; k--){
      const f = pickFav(hw, ids), id = (f && Math.random()<0.5) ? f : pick(ids), ec = actCost(hw, id);
      if(hw.energy - ec < maxEnergy(hw)*0.2) break;
      const aq = qualityOf(hw, id);
      const fee = Math.round(HS.fluffFee * actById(id).price * P.mult * feeQualMult(aq) * cls.mult * cMul(client,'fee',X,hw) * incenseMul(hw,'clientFee') * BAL.income.escort);
      hr.income += fee; R.led.host += fee; hpr.earned += fee; hw.energy -= ec; hx.cap -= 1; hw.lust = Math.min(100, (hw.lust||0) + HS.lust); fitLust(hw);
      hpr.acts[id] = (hpr.acts[id]||0) + 1; growAct(hw, id, 0.3); done++; qSum += aq;
    }
    if(done){
      hx.warm++; hr.hosted.warm++; countUp(hw, 'warm');
      if(!has(hw,'Exhibitionist') && hr.roomsUsed < hr.roomCap) hr.roomsUsed++;
      else if(has(hw,'Exhibitionist')){ hr.exhibActs++; if(hr.roomsUsed >= hr.roomCap) hr.exhibFullActs++; }
      else hr.fullFluff++;
      return qSum / done;
    }
    return 0;
  };
  // host finishes a waiting guest herself if he's willing and a room is open
  const hostTryFinish = (hx, client, cls, want) => {
    const hw = hx.w, hpr = hx.pr;
    if(!want || hx.cap < HS.finishCost || Math.random() >= clamp(cAdd(client,'acceptHost'), 0, 1)) return false;
    const dec = propDecide(hw, want, X);
    if(dec.kind === 'no' || !X.roomOK(hw)) return false;
    const s0 = encSnap(hw, hpr), A = actById(dec.act), reluct = clientStance(hw,dec.act)==='ask', q = qualityOf(hw, dec.act) * (reluct?0.85:1), inc = Math.round(propInc(hw, dec.act, cls, client) * HS.finishShare);
    hx.cap -= HS.finishCost; hx.fin++; hr.hosted.fin++; hpr.props++; hpr.acc++; hr.accProps++;
    hr.income += inc; R.led.host += inc; hpr.earned += inc;
    const rs = runService(X, hw, A, {tech:clientTech(cls,null,client), reluct, inc, ecost:actCost(hw,dec.act), led:'host', client, cls, q});
    const fs = clamp(q*100 + 6 + rnd(-15,15) + h.tier*5 - (h.price-1)*6 + (h.up.bath?4:0) + (HD.sat||0) + 8 + cAdd(client,'satAdd') + cStatSat(client, hw, statPrefScore(client, hw, cls)) + (rs.satAdj || 0) - crowdSatNow());
    hr.served++; hr.sat += fs; X.repSat += fs - 50; hw.popularity = clamp(hw.popularity + (fs-45)/50);
    if(cHas(client,'gossip')) X.gossipRep += (fs-50) * BAL.clients.gossip.rep * cMul(client,'gossip');
    hpr.enc.push(encFx(hw, hpr, s0, {cls:cls.id, want, act:dec.act, outcome:dec.kind==='alt'?'alt':'yes', where:'host', note:rs.note, expr:rs.ser.expr, encore:rs.encore, encoreKind:rs.encoreKind, roundDeclined:rs.roundDeclined, more:rs.more, ctx:has(hw,'Exhibitionist')?'exhib':'prop', sat:Math.round(fs)}));
    return true;
  };
  // excess guests when ladies/rooms are full: security may hold the door cleanly, else everyone enters and waits
  const handleOverflow = (cls, client, want) => {
    if(secStopLeft > 0 && overflowEntered >= waitBuf){ hr.stopped++; secStopLeft--; hr.turned++; return; }
    hr.waited++; overflowEntered++;
    const hx = X.hosts.filter(hostOK).sort((a,b)=>b.cap-a.cap)[0];
    if(hx){
      if(hostTryFinish(hx, client, cls, want)) return;
      hx.cap -= 0.5; hx.ent++; hr.hosted.ent++; countUp(hx.w, 'hosted');
      const fq = hx.cap >= 2 ? hostFluff(hx, client, cls, 1) : 0;
      X.repSat += fq ? 6 : 2;
      return;
    }
    const {barHelped, danceHelped} = loungeHelp(client, cls);
    if(barHelped || danceHelped) return;
    hr.left++; hr.turned++; X.unsat += WT.leaveSat; thirstyMiss(client);
  };
  const serveClient = reg => {
    if(secStopLeft > 0 && nGuests*NIGHTS >= crowdCap){ hr.stopped++; secStopLeft--; hr.turned++; return; }
    const cls = reg ? (CLASSES.find(c=>c.id===reg.cls)||pickClass(h, secScreen)) : pickClass(h, secScreen), client = reg ? null : makeClient(h, cls, secScreen);
    const overBefore = crowdOverNow();
    hr.guestsIn++; nGuests++;
    if(overBefore > 0 && !reg && Math.random() < clamp(overBefore * (CR.bailPer ?? 0.015) - cPatience(client, X)*0.5, 0, CR.bailMax ?? 0.65)){ hr.left++; hr.turned++; X.unsat += WT.leaveSat; thirstyMiss(client); return; }
    let pool = escorts.filter(avl), helper = false;
    if(!pool.length){ pool = helpers.filter(helperOK); helper = true; }
    if(!pool.length){ handleOverflow(cls, client, reg ? null : pickWant(cls, null, client)); return; }
    const fw = reg && pool.find(x=>x.id===reg.fav);   // regulars ask for their favorite
    noteClient(X, client); (X.clsN = X.clsN || {})[cls.id] = (X.clsN[cls.id]||0) + 1; X.clsTot = (X.clsTot||0) + 1;
    X.rowdySum += (cls.rowdy||0) + cAdd(client,'rowdy',X); X.rowdyN++;
    const lightOK = (x, id) => !helper || x.job==='attendant' || actTierOf(actById(id)) <= 1;
    const menuOf = x => helper ? offeredMenu(x) : x.menu;
    const fits = (x, id) => menuOf(x).includes(id) && canClient(x,id) && !nim(x,id) && !tooTiredFor(x,id) && energyOK(x, id, 0.15) && lightOK(x, id);
    const thirsty = cHas(client,'thirsty');
    const wantsIt = thirsty || Math.random() < Math.min(1, (helper ? J.propWant.other : J.propWant.courtesan) * barBoost * cMul(client,'prop',X) * (1 + lowF * (PR.lowPropWant ?? 0.35)));
    // With a madame the client is matched: she scores the free ladies for him (willingness, skill at his want, his likes/draw, balanced load) and picks the best.
    // Without one he takes whoever is free: appeal and draw count only to the power clients.nativeMatch.
    const matchMode = mgmt && !helper && !fw, nm = BAL.clients.nativeMatch ?? 1;
    const matchScore = (x, wnt) => {
      const can = wnt && fits(x, wnt), sk = wnt ? (0.7 + qualityOf(x, wnt) * 0.8) : 1;
      const load = capc[x.id] ? (R.per[x.id].nServed / capc[x.id]) : 0;
      return (5+appeal(x)) * clientDraw(client,x,cls) * (x.race==='android' ? ((SVC.android||{}).adaptDraw ?? 1.2) : 1) * (can ? 4 * sk : 1) * (1.15 - load * 0.35);
    };
    const choose = (list, wnt) => matchMode ? list.reduce((b,x)=>matchScore(x,wnt) > matchScore(b,wnt) ? x : b, list[0])
      : weighted(list, x=>Math.pow((5+appeal(x)) * clientDraw(client, x, cls) * (x.race==='android' ? ((SVC.android||{}).adaptDraw ?? 1.2) : 1), nm));
    let w, want = null, matched = false;
    if(matchMode){ want = wantsIt ? pickWant(cls, null, client) : null; w = choose(pool, want); matched = !!want && fits(w,want); }
    else { w = fw || choose(pool); want = wantsIt ? pickWant(cls, w, client) : null; }
    // clients who are fans of her kind, or put off by it (data/races.json → client)
    let react = raceReact(w, cls.id, client);
    if(react==='dislike' && !reg && Math.random() < SVC.raceDislikeSwitch){
      const alt = pool.filter(x=>x!==w);
      if(alt.length){ w = choose(alt, want); react = raceReact(w, cls.id, client); if(react==='dislike') react = null; matched = matchMode && !!want && fits(w,want); }
    }
    // her best match may be busy (chance rises with her load past clients.wait.busyAt): instead of turning away, everyone waits; hosts, bars & dancers help calm them
    let waited = false, waitAdj = floorSat, fluffed = false, fluffQ = 0;
    if(!helper){
      const load = capc[w.id] ? R.per[w.id].nServed / capc[w.id] : 0;
      const alt = pool.filter(x=>x!==w);
      if((alt.length || load >= 0.65) && Math.random() < clamp((load - WT.busyAt) / (1 - WT.busyAt), 0, 1)){ waited = true; hr.waited++; }
    }
    if(waited){
      const {barHelped, danceHelped} = loungeHelp(client, cls);
      const hx = X.hosts.filter(hostOK).sort((a,b)=>b.cap-a.cap)[0];
      if(hx){
        if(hostTryFinish(hx, client, cls, want)) return;
        // she keeps him company (wait.sat is cancelled, he leaves happier), and warms up an open-minded client with a light service, never to the finish
        hx.cap -= 1; hx.ent++; hr.hosted.ent++; countUp(hx.w, 'hosted');
        const hw = hx.w;
        waitAdj += HS.sat * (0.6 + s100(statOf(hw,'charm'))/125) * refMul(hw, h, 'host') + HS.satSkill * qualityOf(hw, null) * cMul(client,'hostLike');
        const fq = hostFluff(hx, client, cls, ri(1, HS.fluffMax));
        if(fq > 0){ fluffed = true; fluffQ = fq; waitAdj += HS.fluffSat + HS.fluffSkill * fluffQ; }
      } else if(barHelped || danceHelped){
        waitAdj += WT.soothedSat ?? -3;
      } else {
        const leaveOdds = clamp((WT.waitLeaveBase ?? 0.45) - cPatience(client, X) - comfortNow()*0.35 + crowdOverNow()*(CR.calmPer ?? 0.015), 0.12, 0.9);
        if(Math.random() < leaveOdds){ hr.left++; hr.turned++; X.unsat += WT.leaveSat; thirstyMiss(client); return; }
        waitAdj += WT.sat;   // nobody calmed him down, though he stuck it out
      }
    } else if(!helper && cOpen(client) >= HS.fluffOpen){
      // idle host greets and warms up incoming guests in the foyer when she has spare capacity above reserve for waiters
      const hx = X.hosts.filter(x => hostOK(x) && x.cap >= Math.max(4, x.maxCap * 0.45)).sort((a,b)=>b.cap-a.cap)[0];
      if(hx){
        const fq = hostFluff(hx, client, cls, 1);
        if(fq > 0){ hx.ent++; hr.hosted.ent++; countUp(hx.w, 'hosted'); fluffed = true; fluffQ = fq; waitAdj += HS.fluffSat + HS.fluffSkill * fq; }
      }
    }
    let pr = R.per[w.id], s0 = encSnap(w, pr), act = null, outcome = 'comp', altDiff = 0, coveredFor = null;
    if(want){
      let coverAtt = null;
      if(!helper && w.job==='courtesan' && !fits(w,want) && !feedOnly(w,want)){
        const candAtts = ownAttMap.has(w.id) ? [ownAttMap.get(w.id), ...attSorted.filter(a=>a!==ownAttMap.get(w.id))] : attSorted;
        coverAtt = candAtts.find(a => !R.per[a.id].solo && R.per[a.id].served < (J.attendantCoverCap ?? 4) && offeredMenu(a).includes(want) && canClient(a,want) && !nim(a,want) && !tooTiredFor(a,want) && energyOK(a,want,0.2) && X.roomOK(a)) || null;
      }
      if(coverAtt){
        if(typeof addBond==='function') addBond(w, coverAtt, J.attendantCoverBond ?? 2);
        coveredFor = w.name; w = coverAtt; pr = R.per[w.id]; s0 = encSnap(w, pr); helper = true;
        pr.props++; pr.acc++; pr.covered = (pr.covered||0)+1;
        (pr.coveredForNames = pr.coveredForNames||[]).push(coveredFor);
        act = want; outcome = 'yes';
      } else {
        pr.props++;
        if(fits(w,want)){ act = want; outcome='yes'; pr.acc++; }
        else if(feedOnly(w,want)){ pr.fedOnly = (pr.fedOnly||0)+1; outcome='no'; }   // a demon saving herself for services that feed her
        else if(nim(w,want)){ pr.notMood = (pr.notMood||0)+1; outcome='no'; pr._nm = true; }
        else {
          const alt = negotiateAlt(w, want, id=>fits(w, id), moodFree(w) ? BP.altMust : BP.alt, client);
          if(alt){ act = alt.act; altDiff = alt.diff; outcome='alt'; pr.acc++; } else outcome='no';
        }
      }
    }
    if(act && !X.roomOK(w)){ pr.acc--; pr.props--; pr.noRoom = (pr.noRoom||0)+1; hr.short++; handleOverflow(cls, client, want); return; }   // short on rooms
    if(helper && !coveredFor){ hr.stepIn++; pr.stepIn = (pr.stepIn||0)+1; }
    const reluct = act && clientStance(w,act)==='ask', ecost = actCost(w, act) * Math.max(J.attendantEnergyMin, 1 - attHelp(w) * J.attendantEnergyPer) * (fluffed ? (HS.fluffEnergyMult ?? 0.8) : 1), A = act ? actById(act) : null;
    const tech = clientTech(cls, reg, client);
    let q = qualityOf(w, act) * (reluct?0.85:1);
    if(fluffed){ const fScale = (HS.fluffEffBase ?? 0.65) + (HS.fluffEffSkill ?? 0.45) * clamp(fluffQ, 0, 1.2); q += ((HS.fluffQBase ?? 0.08) + (HS.fluffQGap ?? 0.48) * Math.max(0, 1 - q)) * fScale; }
    let cm = cls.mult * obC(w, cls) * fxSubC(w,'classBonus',cls);
    const sp = statPrefScore(client, w, cls);   // his stat taste (traits + class; regulars: class only)
    cm *= 1 + BAL.clients.statPref.fee * sp;
    const base = act ? actById(act).price * roomM * ob(w,'courtesan') : 20 * ob(w,'courtesan');
    const below = Math.max(0, (HD.minPop||0) - w.popularity);
    const spPoss = act ? spiritPossess(X, w, client, pr) : null, adShift = androidAdapt(w, client, pr);
    const houseFeeMult = (HD.feeMult || 1) * ((HD.classFee && (HD.classFee[cls.id] ?? HD.classFee[cls.tier])) || 1) * shrineMult(h, 'perFee') * (cls.tier==='rich' ? cycleVarMul('richFee', 1) : 1);
    const rich = cls.tier==='merchant' || cls.tier==='noble', qualMet = q >= expQ, amenMet = amenScore >= expAmen;
    const prestigeFeeMult = ((highF > 0 && rich && qualMet && amenMet) ? 1 + highF * (PR.richFeeBonus ?? 0.18) : 1) * (!act && highF > 0 ? 1 + highF * (PR.highCompFee ?? 0.45) : 1);
    const inc = Math.round(base * P.mult * feeQualMult(q) * cm * (1+madF*0.15) * fxMul(w,'clientFee') * incenseMul(w,'clientFee') * jb(w,w.job) * (react==='like' ? SVC.raceLikeFee : 1) * (below?0.75:1) * (reg ? (regQuirk(reg).tip||1) : 1) * cMul(client,'fee',X,w) * (act ? cQual(client,q) : cMul(client,'compFee',X)) * (spPoss ? spPoss.feeMult : 1) * (adShift ? adShift.feeMult : 1) * houseFeeMult * prestigeFeeMult * refMul(w, h, 'fee') * BAL.income.escort);
    const altSat = outcome==='alt' ? (altDiff === 0 ? (BP.sidegradeSat ?? 5) : altDiff >= 2 ? (BP.downgradeSat ?? -4) : 3) : 0;
    const amenSat = Math.min(5, amenScore*2) - Math.max(0, expAmen - amenScore)*(PR.amenMissSat ?? 6) + (highF > 0 && amenScore > expAmen ? Math.min(PR.amenSurplusCap ?? 8, (amenScore - expAmen)*(PR.amenSurplusSat ?? 2.5))*highF : 0);
    const qualSat = -Math.max(0, expQ - q)*((PR.qualMissSatBase ?? 10) + (pr0/100)*(PR.qualMissSatPer ?? 24)) + (highF > 0 && rich && qualMet ? highF * (PR.richSatBonus ?? 12) : 0);
    const actionSat = outcome==='no' ? -lowF*(PR.lowActionMissSat ?? 10) : outcome==='comp' ? (highF*(PR.highCompSat ?? 6) - lowF*(PR.lowCompSat ?? 4)) : 0;
    const isThrill = !!client && client.traits.some(t => t.id==='thrillSeeker');
    const exhibSat = (act && has(w,'Exhibitionist')) ? (pr0 >= 50 && rich && !isThrill ? -((pr0 - 45)/55)*(PR.exhibNobleSat ?? 8) : (pr0 < 40 || cHas(client,'rowdy') || thirsty || isThrill) ? (PR.exhibRowdySat ?? 3) : 0) : 0;
    const sat0 = clamp(- below*0.5 - Math.max(0, repEff - BAL.clients.pickFrom)*BAL.clients.pickPer + q*100 + 6 + rnd(-15,15) + ((BAL.refine||{}).sat||0) * refScore(w) * refK(h) + amenSat + qualSat + actionSat + exhibSat - (h.price-1)*6*(1 - highF*(PR.priceTolCut ?? 0.55)) + (HD.sat||0) + incenseAdd(w,'sat') + ((hr.tidyFx && hr.tidyFx.sat) || 0) + attHelp(w) * J.attendantSatPer + (matched && outcome==='yes' ? J.madameMatchSat : 0) + (outcome==='yes'?8:outcome==='alt'?altSat:outcome==='no'?-8:0)
      + (fxSubC(w,'classBonus',cls)-1)*SVC.classBonusSat + (react==='like' ? SVC.raceLikeSat : react==='dislike' ? SVC.raceDislikeSat : 0)
      + waitAdj - crowdSatNow() + cAdd(client,'satAdd') + cStatSat(client, w, sp) + (spPoss ? spPoss.satAdd : 0) + (adShift ? adShift.satAdd : 0) + (thirsty && outcome==='no' ? BAL.clients.thirsty.sat : 0));
    if(thirsty && outcome==='no') thirstyMiss(client, true);
    hr.income += inc; R.led.escort += inc; pr.served++; pr.nServed++; pr.earned += inc; hr.served++;
    let note = null, ser = null, encore = null, encoreKind = null, roundDeclined = false, reck0 = false, more = null, heat = false, satAdj = 0;
    if(act){
      const rs = runService(X, w, A, {tech, reluct, inc, ecost, led:'escort', client, cls, q});
      ser = rs.ser; note = rs.note; encore = rs.encore; encoreKind = rs.encoreKind; roundDeclined = rs.roundDeclined; reck0 = rs.reck0; more = rs.more; heat = (w.race==='beastkin' && reck0); satAdj = rs.satAdj || 0;
      if(moodFree(w) && notInMood(w, act)){ moodAdd(w, -1); pr.offMood = (pr.offMood||0)+1; }   // she worked it anyway
    } else { pr.comp++; grow(w,'service',0.5); w.energy -= ecost; }
    const sat = clamp(sat0 + satAdj);
    pr.satSum = (pr.satSum||0) + sat; if(sat<30) pr.low = (pr.low||0)+1;
    if(cHas(client,'gossip')) X.gossipRep += (sat-50) * BAL.clients.gossip.rep * cMul(client,'gossip');
    hr.sat += sat;
    const popD = (sat-45)/50; w.popularity = clamp(w.popularity + (popD > 0 ? popD * housePerkVal(h, 'popGain', 1) : popD));
    let pu = null;
    if(outcome==='no' && want) pu = pushyCheck(X, w, cls, pr, client);
    if(!note) note = pu ? 'pushy_'+pu : outcome==='no' ? (pr._nm ? 'nomood' : 'declined') : react==='like' ? 'like' : react==='dislike' ? 'put_off' : sat>=80 ? 'glow' : sat<30 ? 'flat' : null;
    pr._nm = false;
    const lantern = !!act && w.race==='angel' && w.sub==='lantern' && Math.random()<0.45;
    const ctx = has(w,'Exhibitionist') ? 'exhib' : (reck0 ? 'reckless' : '');
    const e = {cls:cls.id, want, act, outcome, altDiff: outcome==='alt'?altDiff:undefined, reg: reg ? reg.name : null, note, sat:Math.round(sat), expr: ser ? ser.expr : null, react, encore, encoreKind, roundDeclined, more, possess: spPoss ? spPoss.react : null, adapt: adShift ? adShift.adapt : null, spiritFuta: !!spPoss, lantern, heat, ctx, step: helper && !coveredFor ? w.job : undefined, coveredFor};
    pr.enc.push(encFx(w, pr, s0, e));
    if(reg) regAfter(reg, w, sat, inc); else if(sat>=75 && (!bestNew || sat>bestNew.sat)) bestNew = {sat, w, cls, regM: cMul(client,'regular') * ((act && actById(act).regular) || 1)};
  };
  // --- the six nights: offers to staff, restless ladies, then the client flow; everyone sleeps after
  const regsN = Array.from({length:NIGHTS}, ()=>[]); regs.forEach(r=>regsN[ri(0, NIGHTS-1)].push(r));
  let crowdSum = 0;
  for(let night=0; night<NIGHTS; night++){
    X.night = night; nGuests = 0;
    W.forEach(w=>{ const pr = R.per[w.id]; pr.nServed = 0; pr.nE0 = w.energy; pr.nightOver = pr.soloNight === night;
      if(escorts.includes(w)){ capc[w.id] = pr.nightOver ? 0 : nightCapOf(w); pr.cap += capc[w.id]; } });
    W.forEach(w=>{ const n = splitShare(propN[w.id]||0, NIGHTS, night); if(n) staffProps(w, n); });
    W.forEach(w=>{ const n = (reckN[w.id]||[]).filter(x=>x===night).length; if(n) reckless(w, n); });
    const nd = splitShare(demand, NIGHTS, night);   // regulars are part of the night's demand, as before
    for(let i=0; i<nd; i++) serveClient(regsN[night].shift() || null);
    crowdSum += crowdOverNow();
    nightRest(h, W, R, hr);
  }
  maybeNewRegular(h, bestNew, R);
  // R.per[].cap: her client limit summed over the week's nights (report: what kept her from seeing more)
  hr.demand = demand;
  hr.crowdOver = Math.round(crowdSum / NIGHTS);
  if(hr.crowdOver > 0) X.unsat -= hr.crowdOver * (CR.unsatPer ?? 2);
  const visitors = hr.served + overflowEntered*0.5 + danceDraw*2;
  // --- staff output (reduced by the propositions she accepted this week, unless it's a must-offer role)
  let maidAdd = 0;
  // one attendant per courtesan: the most popular courtesans get theirs first (balance.json → jobs.attendantOwn*)
  const bathers = Math.round((hr.served + overflowEntered*0.5) * J.bathShare), baths = byJob('bath');
  W.forEach(w=>{
    const j = w.job, pr = R.per[w.id], om = outputMult(w, pr);
    if(j==='bartender'){ const bm = housePerkVal(h, 'barMult', 1); const inc = Math.round(((J.barBase + visitors*J.barPerVisitor) * (0.5+(s100(w.tech.bar)+s100(statOf(w,'charisma')))/200) * (1 + J.barAgil * s100(statOf(w,'agility'))/100) * jb(w,'bartender') * (S.flags.ironsong?1.15:1) * ob(w,'bartender') * ((h.bonus&&h.bonus.bar)||1) * (BAL.amenities.drinks.bar[h.drinks||0] ?? 1) * om + visitors * (J.barTips||0) * (0.5 + w.popularity/100) * (0.5 + s100(statOf(w,'charisma'))/100) * om * fxMul(w,'tips') * (X.tipN ? X.tipSum / X.tipN : 1)) * bm); hr.income+=inc; R.led.bar+=inc; pr.earned+=inc; grow(w,'bar',2); statXP(w,'charisma',1.5); statXP(w,'agility',0.3); countUp(w,'bar',Math.max(1,Math.round(visitors/8))); }
    if(j==='dancer'){
      const dm = housePerkVal(h, 'danceMult', 1);
      const tips = Math.round(visitors * J.tipsBase * (0.5 + w.popularity/100) * (0.5 + s100(statOf(w,'charisma'))/100) * Math.sqrt(P.mult) * ob(w,'dancer') * dm * fxMul(w,'tips'));
      const inc = Math.round((12+w.popularity*0.8) * (0.5+s100(w.tech.dance)/100) * (0.8 + s100(statOf(w,'agility'))/250) * Math.sqrt(P.mult) * jb(w,'dancer') * ob(w,'dancer') * dm) + tips;
      hr.income+=inc; R.led.dance+=inc; pr.earned+=inc; w.popularity=clamp(w.popularity+(2+(s100(statOf(w,'agility'))>=60?1:0))*housePerkVal(h,'popGain',1)); repAdd(h, J.danceRep * (0.5 + w.popularity/100)); lewdUp(w, 0.5*(has(w,'Exhibitionist')?3:1), has(w,'Exhibitionist') ? BAL.lewd.danceExhib : BAL.lewd.dance); grow(w,'dance',2); statXP(w,'agility',1); statXP(w,'charisma',0.5); statXP(w,'beauty',1); countUp(w,'dance',Math.max(1,Math.round(visitors/8))); }
    if(j==='bath'){
      const bm = housePerkVal(h, 'bathMult', 1);
      const inc = Math.round((8+visitors*1.2) * (0.5+(s100(w.tech.service)+s100(statOf(w,'beauty')))/200) * jb(w,'bath') * ob(w,'bath') * bm); hr.income+=inc; R.led.bath+=inc; pr.earned+=inc; grow(w,'service',1.5); lewdUp(w, 0.5, BAL.lewd.bath); statXP(w,'stamina',1); statXP(w,'charm',1);
      // non-regulars start with a massage (no room needed); regulars and most bathers hope for more, escalating if she's willing and able
      const M = actById('massage_give'), nb = Math.min(J.bathCap, Math.round(bathers / Math.max(1, baths.length)));
      const joins = M && clientStance(w, M.id)==='yes' && w.lewd >= J.bathJoinLewd;
      const bathRegPool = (S.regulars||[]).filter(r=>r.fav===w.id), menu = offeredMenu(w);
      const bathActs = getActs().filter(a=>a.id!=='massage_give' && a.id!=='massage_get' && !actBanned(w, a.id));
      for(let k=0;k<nb;k++){
        const reg = bathRegPool.length && Math.random()<0.25 ? pick(bathRegPool) : null;
        const cls = reg ? (CLASSES.find(c=>c.id===reg.cls)||pickClass(h)) : pickClass(h), client = reg ? null : makeClient(h, cls), tech = clientTech(cls, reg, client);
        const s0 = encSnap(w, pr);
        let didMassage = false, feeM = 0, serM = null, act2 = null, want2 = null, ser2 = null;
        if(!reg && M && !actBanned(w, M.id) && w.energy - actCost(w, M.id) >= maxEnergy(w)*0.15){
          feeM = Math.round(M.price * P.mult * feeQualMult(qualityOf(w, M.id)) * cls.mult * fxMul(w,'clientFee') * incenseMul(w,'clientFee') * BAL.income.escort * (joins ? J.bathJoinFee : 1) * bm);
          hr.income += feeM; R.led.bath += feeM; pr.earned += feeM; w.energy -= actCost(w, M.id); pr.acts[M.id] = (pr.acts[M.id]||0)+1; growAct(w, M.id, 0.4);
          serM = serveAct(w, M, {tech, reluct:false, pr, h});
          if(joins) pr.bathJoin = (pr.bathJoin||0)+1;
          didMassage = true;
        }
        if(bathActs.length && (reg || Math.random() < (J.bathMoreChance ?? 0.75) * clamp(cStamina(cls, client), 0.65, 1.35))){
          want2 = pickWant(cls, w, client, bathActs);
          const canDo = id => menu.includes(id) && canClient(w,id) && !nim(w,id) && !tooTiredFor(w,id) && energyOK(w, id, 0.15);
          act2 = want2 && canDo(want2) ? want2 : null;
          if(!act2 && want2){ const alt = negotiateAlt(w, want2, canDo, BP.alt, client); if(alt) act2 = alt.act; }
          if(act2){
            const A2 = actById(act2), reluct = clientStance(w,act2)==='ask';
            const fee2 = Math.round(A2.price * P.mult * feeQualMult(qualityOf(w,act2)) * cls.mult * fxMul(w,'clientFee') * incenseMul(w,'clientFee') * BAL.income.escort * (joins ? J.bathJoinFee : 1) * bm);
            hr.income += fee2; R.led.bath += fee2; pr.earned += fee2; w.energy -= actCost(w, act2);
            pr.acts[act2] = (pr.acts[act2]||0)+1; growAct(w, act2, 0.5); lewdUp(w, reluct?0.5:0.25, svcLewdCap(act2,'client'));
            ser2 = serveAct(w, A2, {tech, reluct, pr, h});
            pr.moreN = (pr.moreN||0)+1; pr.bathMore = (pr.bathMore||0)+1;
          } else if(didMassage && joins){
            askMore(X, w, M, {tech, inc:feeM, led:'bath', noRoom:true, client, cls, q:qualityOf(w, M.id)}, null);
          }
        }
        if(didMassage || act2){
          const usedAct = act2 || M.id, serU = ser2 || serM || {};
          pr.enc.push(encFx(w, pr, s0, {cls:cls.id, reg:reg?reg.name:null, want:want2||usedAct, act:usedAct, bathFirst:didMassage && !!act2, outcome:'yes', where:'bath', bathWork:true, note:serU.note||null, expr:serU.expr||null, ctx:'bath'}));
        }
      }
    }
    if(j==='maid'){ const add = (TY.maidBase + s100(w.tech.service)*TY.maidPerSkill + s100(statOf(w,'agility'))*TY.maidPerAgil) * ob(w,'maid') * jb(w,'maid') * fxMul(w,'tidy') * om; maidAdd += add; pr.tidied = add; grow(w,'service',1.5); statXP(w,'stamina',1.5); statXP(w,'agility',0.3); }
    if(j==='chapel'){   // tends visitors; willing propositions earn extra reputation and chapel donations instead of service fees (balance.json → amenities.chapel)
      const C = BAL.amenities.chapel, cm = housePerkVal(h, 'chapelMult', 1), rm = w.race==='angel' ? 1 : (C.nonAngelMult ?? 0.5), propBoost = 1 + Math.min(C.propDonMax ?? 1, (pr.chapelProps||0) * (C.propDonBonus ?? 0.25)), cb = jb(w,'chapel') * ob(w,'chapel') * rm, don = Math.round(visitors * chapelClassMul(X, C) * C.donation * (0.5 + s100(statOf(w,'charm'))/100) * refMul(w, h, 'chapel') * cb * propBoost * cm * om);
      hr.income += don; R.led.chapel += don; pr.earned += don; pr.tended = Math.round(visitors * chapelClassMul(X, C)); hr.chapel = (hr.chapel||0) + don;
      repAdd(h, C.rep * cb * cm); w.popularity = clamp(w.popularity + C.pop * rm * housePerkVal(h, 'popGain', 1)); moodAdd(w, C.mood); gainTrust(w, C.trust); grow(w,'service',1); statXP(w,'charm',1); statXP(w,'refinement',0.5 + 0.5*refK(h)); pr.why.push({t:'tended the chapel', good:true});
      if(pr.chapelProps) pr.why.push({t:`accepted ${pr.chapelProps} chapel offering${pr.chapelProps>1?'s':''}`, good:true});
    }
    if(j==='teacher'){ classroomTeach(h, W, w, pr, R, hr); statXP(w,'wits',1.5); }
    if(j==='security'){ grow(w,'combat',1.5); w.trust = clamp(w.trust+0.3); statXP(w,'agility',0.5); statXP(w,'strength',0.5); statXP(w,'wits',0.5); statXP(w,'charisma',0.3); }
    if(j==='madame'){ grow(w,'manage',2); statXP(w,'wits',1); statXP(w,'refinement',0.5); statXP(w,'charisma',0.5); }
    if(j==='promoter'){ grow(w,'service',2); statXP(w,'charisma',1.5); }
    if(j==='host'){ grow(w,'service',1.5); statXP(w,'charm',1.5); statXP(w,'refinement',0.5*refK(h)); const hx = X.hosts.find(x=>x.w===w);
      if(hx && (hx.ent || hx.fin)){ pr.host = {ent:hx.ent, warm:hx.warm, fin:hx.fin}; (pr.notes = pr.notes||[]).push(`${w.name} kept ${hx.ent} waiting client${hx.ent===1?'':'s'} company${hx.warm?`, warmed up ${hx.warm}`:''}${hx.fin?`, finished ${hx.fin}`:''}.`); pr.why.push({t:'kept the lounge company', good:true}); } }
    if(j==='attendant'){ grow(w,'service',1.5); statXP(w,'charm',1); statXP(w,'wits',1); statXP(w,'refinement',0.5*refK(h)); }
    if(j==='courtesan' && pr.served){ statXP(w,'stamina', Math.min(3, pr.served*0.4)); statXP(w,'refinement', Math.min(1, pr.served*0.15) * refK(h)); }
    if(j==='courtesan' && ownAttMap.has(w.id)){ const a = ownAttMap.get(w.id), f = 0.5 + attQFor(a, R.per[a.id])/2, bv = typeof bondV==='function' ? bondV(w, a) : 0;
      moodAdd(w, Math.round(J.attendantOwnMood*f)); gainTrust(w, J.attendantOwnTrust*f + bv*(J.attendantBondTrustPer ?? 0.008));
      if(typeof addBond==='function') addBond(w, a, J.attendantOwnBond ?? 2);
      pr.why.push({t:`${a.name} attended her`, good:true}); }
    if(j==='attendant'){ const c = [...ownAttMap].find(([,a])=>a===w); if(c){ const cw = W.find(x=>x.id===c[0]); if(cw) (pr.notes = pr.notes||[]).push(`${w.name} attended ${cw.name}.`); } }
    if(pr.covered){ const names = Array.from(new Set(pr.coveredForNames||[])).join(', '); (pr.notes = pr.notes||[]).push(`${w.name} covered ${pr.covered} service${pr.covered>1?'s':''}${names?' for '+names:''}.`); }
    const ah = attHelp(w);
    pr._overTol = BAL.mood.overworkAt + (madF ? madF*(J.madameOverworkAdd ?? 2.5) : 0) + Math.min(1.5, ah)*(J.attendantOverworkAdd ?? 2);
    pr._overShield = Math.min(0.85, (madF ? Math.min(0.7, madF*(J.madameOverworkShield ?? 0.45)) : 0) + Math.min(0.55, ah*(J.attendantOverworkShield ?? 0.35)));
    if(JOBS[j].cat==='staff') w.energy -= JOBS[j].energy;
    if(pr.stepIn){ const did = Object.entries(pr.acts).map(([id,n])=>`${actLabel(id).toLowerCase()}${n>1?' ×'+n:''}`).join(', ');
      (pr.notes = pr.notes||[]).push(flavor('stepped_in', w, {n: pr.stepIn, clients: pr.stepIn===1 ? 'one client' : pr.stepIn+' clients', did: did ? ` (${did})` : ' (company only)'})); }
    if(pr.expectMiss) (pr.notes = pr.notes||[]).push(flavor('expect_miss', w));
    if(JOBS[j].cat!=='escort' || !pr.served){ const t = flavor(j==='promoter' && pr.samples ? 'job_promoter_samples' : j==='bath' && pr.bathJoin ? (pr.moreN ? 'job_bath_more' : 'job_bath_joined') : j==='rest' && w.race==='demon' ? 'job_rest_demon' : 'job_'+j, w); if(t) R.hl.push({wid:w.id, text:t, act:null, scene:'job_'+j, noAi:true, job:true}); }
  });
  if(h.up.chapel && byJob('chapel').length && !W.some(x=>x.race==='angel' && ['chapel','host','security','maid'].includes(x.job))){
    const C = BAL.amenities.chapel; X.unsat += Math.abs(C.noAngelSat ?? -8); repAdd(h, C.noAngelRep ?? -0.5);
    R.lines.push(`🕯️ Visitors to ${h.name}'s chapel were disappointed not to see an angel in the chapel or on the floor.`);
  }
  if(h.up.chapel && byJob('chapel').some(x=>x.race==='angel')) hr.chapelMood = BAL.amenities.chapel.angelHouseMood ?? 0;
  spiritPairShift(h, W, R);
  // --- tidiness: room services and visitors make a mess, maids clean it up
  // maids pull toward clean with diminishing returns: x (100 - tidiness)/maidEase, at most maidMax (balance.json → tidy)
  if(W.length){ const ease = clamp((100 - hr.tidy0) / (TY.maidEase || 50), 0, TY.maidMax || 1.5); maidAdd *= ease;
    h.tidy = clamp(hr.tidy0 - (TY.perService*hr.roomsUsed + TY.perVisitor*visitors) * (h.up.laundry ? BAL.amenities.laundry.decay : 1) * (hasPast('concierge') ? 0.8 : 1) + maidAdd); hr.tidy = h.tidy; hr.maidAdd = maidAdd; }
  const rowdyF = X.rowdyN ? clamp(X.rowdySum / X.rowdyN / 0.07, 0.5, 2) : 1;
  if(W.length && Math.random() < clamp((0.12 + demand/120 + (hr.left||0)*(WT.leaveIncident ?? 0.035) + (hr.crowdOver||0)*(CR.incidentPer ?? 0.005) - secPow/250) * (HD.trouble||1) * rowdyF * (1 + barN*J.barRowdy) * incenseHouseMul(h,'pushy'), 0.03, 0.6)) EVQ.push(()=>evIncident(h));
  if(HD.haunted && Math.random()<0.15) EVQ.push(()=>evHaunt(h));
  let up = HD.upkeep + (HD.ngppOnly ? 15 * Math.max(0, (h.ngppLevel||1) - 1) : 0) + 12*h.rooms + 6*(h.quarters||0) + h.tier*20 + (h.beds||0)*4*bedsFor(h) + (h.extraBeds||0)*3 + (h.annex?30:0) + (h.decor||0)*BAL.amenities.decor.upkeep + (h.up.bar ? (BAL.amenities.drinks.upkeep[h.drinks||0]||0) : 0) + Object.keys(h.up).filter(k=>h.up[k] && !HD.up[k]).reduce((a,k)=>a+(UPGRADES[k].upkeep||0), 0);
  if(atSam && S.samWeek.books) up = Math.round(up * (1 - booksCut() * (S.samWeek.booksEff ?? 1)));
  up = Math.round(up * ((h.bonus&&h.bonus.upkeep)||1) * (1 + h.rep/150) * cycleVarMul('upkeep', 1) * (hasChallengePerk('ahead_of_time') ? 0.9 : 1));
  hr.upkeep = up;
  if(h.bonus && h.bonus.charter){ hr.income += h.bonus.charter; R.led.bar += h.bonus.charter; }
  // travelers' room & board (economy.json → houses.<id>.lodging), grows with reputation
  if(HD.lodging){ const l = Math.round(HD.lodging * (1 + h.rep/50)); hr.income += l; R.led.bar += l; }
  const avg = hr.served ? hr.sat/hr.served : 50;
  // reputation: each lady's clients move it by (sat-50)/12 per client share, scaled by her rep fx. Gains are slower in a famous house.
  if(W.length){
    const tot = Math.max(1, hr.served);
    const part = W.reduce((a,w)=>{ const pr = R.per[w.id]; return a + (pr.served ? (pr.satSum - 50*pr.served)/tot/12 * fxMul(w,'rep') : 0); }, 0);
    repAdd(h, part + (X.unsat + X.repSat)/tot/12 + X.gossipRep);
    if(hr.left && WT.leaveRep) h.rep = clamp(h.rep - hr.left * WT.leaveRep);
    if(hr.crowdOver > 0) h.rep = clamp(h.rep - (hr.crowdOver * (CR.repPer ?? 0.18) + hr.crowdOver * hr.crowdOver * (CR.repQuad ?? 0.008)));
    if(hr.stopped && WT.secStopRep) h.rep = clamp(h.rep - hr.stopped * WT.secStopRep * Math.max(0.25, 1 - (WT.secGraceCut ?? 0.7) * secGrace));
    if(X.expectMiss) h.rep = clamp(h.rep + X.expectMiss * BP.expectSat / 12 / tot);
    if(hr.tidyFx) repAdd(h, hr.tidyFx.rep);
  }
  // workshop: each dwarf living here (any job) trims the markup on the next build in this house
  if(h.up.workshop) h.wsDisc = Math.min(1, (h.wsDisc||0) + W.filter(w=>w.race==='dwarf').length * BAL.amenities.workshop.perDwarf);
  // who has a bed tonight
  let beds = bedsFor(h); hr.floor = [];
  S.workers.filter(w=>w.house===h.id && !['spirit','android'].includes(w.race)).sort((a,b)=>(b.isPartner||b.locked?1:0)-(a.isPartner||a.locked?1:0)).forEach(w=>{ if(beds>0){ beds--; w._bed = BEDS[h.beds||0].rest; } else { w._bed = FLOOR_REST; hr.floor.push(w.name); } });
  hr.avgSat = avg; hr.rep = h.rep;
  updatePrestige(h, hr, W, R, {
    courts: byJob('courtesan').length,
    ownAtts: ownAttMap.size,
    leaders: [mad, ...X.hosts.map(x=>x.w)].filter(Boolean),
    angelChapel: !!(h.up.chapel && byJob('chapel').some(x=>x.race==='angel'))
  });
  return hr;
}
function endWeek(){
  if(!S || S.over || EVQ.length) return;
  closeModal();
  S.workers.forEach(ensureWorker);
  goddessPlan();   // her actions this week (goddess.js), before the houses run
  guildTidy();     // guild.js: ladies (and Sam's focus) on contracts that ended go back to work
  const focusLine = samFocusRun();   // Sam's weekly focus (focus.js): pays its energy, sets what simHouse reads
  const R = {v3:true, v5:true, v6:true, week:S.week, lines:[], per:{}, hl:[], houses:[], income:0, wages:0, upkeep:0, recharge:0, cuts:0, served:0, turned:0, left:0, stopped:0, selfProps:0,
    led:{escort:0, offduty:0, bar:0, dance:0, bath:0, chapel:0, host:0, guild:0, sam:S.samWeek.income}, samActs:S.samWeek.acts.slice()};
  S.workers.forEach(w=>R.per[w.id]={id:w.id, name:w.name, job:w.job, prevJob:w.job==='rest' ? w.prevJob : undefined, house:w.house, served:0, comp:0, acts:{}, props:0, acc:0, earned:0, e0:Math.round(w.energy), m0:Math.round(w.mood), l0:Math.round(w.lust||0), enc:[], why:[], notes:[],
    t0:w.trust||0, lw0:w.lewd||0, p0:w.popularity||0, st0:Object.assign({}, w.stats), tk0:Object.assign({}, w.tech), ak0:Object.fromEntries(Object.entries(w.acts||{}).map(([k,a])=>[k, a.skill||0]))});
  const log = t => R.lines.push(t);
  if(focusLine) log(focusLine);
  autoFeasts(R);   // home.js: houses set to feast automatically, before the work week
  autoStuds(R);    // sam.js: auto-hire studs for demons whose lust meets their threshold
  let satSum = 0;
  S.houses.forEach(h=>{ const hr = simHouse(h, R); R.houses.push(hr); R.income += hr.income; R.upkeep += hr.upkeep; R.served += hr.served; R.turned += hr.turned; R.left += hr.left||0; R.stopped += hr.stopped||0; satSum += hr.sat; });
  guildWeek(R);   // guild.js: contract progress, injuries, rewards (adds to R.income)
  R.perkBonus = Math.round(R.income * ((hasChallengePerk('lean_house') ? 0.1 : 0) + (hasChallengePerk('starlight_debt') ? 0.15 : 0)));
  R.income += R.perkBonus;
  R.wages = S.workers.reduce((a,w)=>a+(isFree(w)?0:w.wage), 0);
  S.workers.forEach(w=>{ const pr = R.per[w.id], cut = workerCut(w), cg = pr.earned>0 && cut>0 ? Math.round(pr.earned * cut) : 0; pr.cut = cg; if(cg){ w.purse = (w.purse||0) + cg; R.cuts += cg; } });
  S.gold += R.income - R.wages - R.upkeep - R.cuts;
  tutorWeek(R);

  const leaving = [], renew = [];
  S.workers.forEach(w=>{
    const pr = R.per[w.id], h = houseOf(w), hrw = R.houses.find(x=>x.id===w.house), tfx = hrw && hrw.tidyFx;
    const mad = S.workers.find(x=>x.house===w.house && x.job==='madame');
    // The rest day (balance.json → rest): workers already slept after each night (nightRest); the day off adds rest.restDay x her bed.
    // A week off (job 'rest') sleeps the whole week instead: rest.week x bed, plus the bath.
    const mx = maxEnergy(w);
    let rest = (w._bed ?? BEDS[h.beds||0].rest);
    rest *= restMult(w) * (tfx ? tfx.rec : 1);
    const RB = BAL.rest || {};   // balance.json → rest
    let rec = w.job==='rest' ? rest*(RB.week ?? 1.6) + (h.up.bath ? (RB.bath ?? 10) : 0) : rest*(RB.restDay ?? 0.5);
    // wear (balance.json → rest.wear): each work night costs a little Health (nightRest), and a worn-down lady recovers less (fatigueCut).
    // A week off heals it. Demons (they feed) and androids (they charge) don't wear down this way.
    const WR = RB.wear || {};
    if(w.job!=='rest' && !['demon','android'].includes(w.race) && WR.per){ const cut = fatigueCut(w); rec *= 1 - cut; pr.fatigue = Math.round(cut*100); }
    if(w.race==='demon') rec = w.job==='rest' ? rec*(SVC.demon.restMult ?? 0.7) : -SVC.demon.hunger;   // demons don't sleep and burn hunger every working week: they feed on desire instead (serveAct); on a week off, on men in town
    if(w.race==='demon' && w.job==='rest' && restless(w) && Math.random() < SVC.demon.restDrainChance){   // a restless one can overdo it, and the town notices
      S.rep = clamp(S.rep - SVC.demon.restRepDrain); pr.drains = (pr.drains||0)+1; (pr.notes = pr.notes||[]).push(flavor('rest_demon_drain', w));
      log(`😈 ${w.name} fed a little too hard on her week off. Talk around town is not kind (reputation −${SVC.demon.restRepDrain}).`); }
    const e0 = w.energy;
    if(w.race==='android') rec = Math.max(rec, maxEnergy(w) - w.energy);   // androids plug in every night and charge to full (for a fee, counted with the nights' charging)
    pr.eWork = Math.round(pr.e0 - e0 + (pr.eNight||0) + (pr.charged||0)); w.energy += rec; pr.eRec = Math.round(w.energy - e0); pr.eNight = Math.round((pr.eNight||0) + (pr.charged||0)); pr.slept = w._bed===FLOOR_REST ? 'floor' : w.race==='spirit' ? 'spirit' : w.race==='android' ? 'charging' : w.race==='demon' ? 'none' : BEDS[h.beds||0].label;
    if(w.race==='android'){ const got = Math.max(0, Math.min(w.energy, energyCap(w)) - e0) + (pr.charged||0), A = SVC.android;
      if(got > 0){ const fee = Math.round((A.fee + A.perEnergy*got) * (h.up.charger ? 1 - A.chargerDiscount : 1) * housePerkVal(h, 'chargeMult', 1)); S.gold -= fee; R.recharge += fee; pr.recharge = fee; } }
    const why = (t, good) => pr.why.push({t, good});
    if(w.job!=='rest'){ countUp(w,'weeksWorked'); countUp(w,'jobWeeks.'+w.job); }
    if(pr.favN) why('got to do her favorite', true);
    if(pr.eagerN) why('was in the mood for her clients', true);
    if(pr.disN) why('had to do things she dislikes', false);
    if(pr.reluct) why('did a few things as a favor', false);
    if(w.job==='rest'){ moodAdd(w, 8); w.health += (RB.wear||{}).restHeal ?? 15; why('a week off', true); }
    if((pr.fatigue||0) >= 20) why(`worn down from weeks without a break (health ${Math.round(w.health)}, recovery −${pr.fatigue}%)`, false);
    if(h.up.garden) w.health += BAL.amenities.garden.health * gardenMult(w);   // the garden mends a little wear every week
    w.health = clamp(w.health);
    if(w._bed===FLOOR_REST && !['spirit','android'].includes(w.race)){ moodAdd(w, -3); why('slept on the floor', false); }
    else if(housingShort(h) && !['spirit','android','demon'].includes(w.race)){ moodAdd(w, -BAL.quarters.moodPer*housingShort(h)); why('expects better quarters in a house of this prestige', false); }
    if(!(isVessel(w) && vesselStage(w) < 1)) w.mood += (BAL.mood.restingPoint + fxAdd(w,'moodRest') + (has(w,'Loyal')?5:0) + (has(w,'Devoted')?10:0) - w.mood) * BAL.mood.drift * fxMul(w,'moodDrift');
    if(cycleVarAdd('mood', 0)) moodAdd(w, cycleVarAdd('mood', 0));
    const extraAcc = Math.max(0, pr.acc - Math.max(0, pr.served - pr.comp));
    const work = pr.served + extraAcc - pr.comp*0.4, tol = pr._overTol ?? BAL.mood.overworkAt, shield = pr._overShield ?? 0;
    const over = Math.max(0, work - tol) * (1 - shield);
    if(over >= 0.8){ moodAdd(w, -over*(has(w,'Lazy')?5:2.5)); why(over>3 ? 'badly overworked' : 'a bit overworked', false); }
    if(!isFree(w) && w.wage < wageFor(w)*0.9){ moodAdd(w, -4); why('feels underpaid', false); }
    if(jobLikes(w).includes(w.job)){ moodAdd(w, 3); why('likes her job', true); } else if(jobDislikes(w).includes(w.job)){ moodAdd(w, -3); why("doesn't like her job", false); }
    if(mad && w!==mad) moodAdd(w, 3);
    if(tfx){ moodAdd(w, tfx.mood); why(tfx.mood > 0 ? 'a spotless house' : 'a grubby house', tfx.mood > 0); }
    if(pr.accProp && !(JOBS[w.job]||{}).must && w.job!=='chapel') why(`propositions took ${Math.round((1-outputMult(w,pr))*100)}% of her work time`, false);
    if(pr.noRoom) why('no free room for a client', false);
    if(pr.offMood) why('worked while not in the mood', false);
    if(h.up.bath) moodAdd(w, 3);
    Object.keys(h.up).forEach(k=>{ const u = UPGRADES[k]; if(h.up[k] && u && u.race===w.race && u.mood) moodAdd(w, u.mood); });   // race houses (tether, chapel)
    if(h.up.garden) moodAdd(w, BAL.amenities.garden.mood * gardenMult(w));
    const houseMood = housePerkVal(h, 'moodRest', 0) + incenseAdd(w, 'mood') + ((hrw && hrw.chapelMood) || 0);
    if(houseMood) moodAdd(w, houseMood);
    const o = getOutfit(w); if(o.style===w.style){ moodAdd(w, 3); why('loves her outfit', true); }
    if(has(w,'Greedy') && pr.earned>250){ moodAdd(w, 4); why('made good money', true); }
    if(pr.earned > 0 && !isFree(w)){
      const cut = workerCut(w), base = baselineCut(), C = BAL.wardrobe.cut, gm = has(w,'Greedy') ? C.greedyMult : 1;
      if(cut < base){
        const ratio = (base - cut) / Math.max(0.05, base);
        moodAdd(w, -Math.max(1, Math.round(C.moodPenalty * ratio * gm)));
        w.trust -= Math.max(0.2, +(C.trustPenalty * ratio).toFixed(2));
        why(cut <= 0 ? 'no profit cut' : 'small profit cut', false);
      }
    }
    if(w.autoDress && autoDressPool(w).length > 1){
      const AD = BAL.wardrobe.autoDress;
      moodAdd(w, AD.mood); w.trust += AD.trust * fxMul(w,'trustGain');
      why('chooses her own clothes', true);
    }
    if(w.energy <= 5 && w.race!=='demon'){ w.health -= 15; moodAdd(w, -10); why('exhausted', false); log(`⚠️ ${w.name} is exhausted. Give her some rest.`); }
    let boughtOutfit = false;
    // Spend weekly profit cut (using up the budget each week unless saving briefly for an outfit within reach)
    const spendBudget = (budget, noOutfit) => {
      if(budget <= 0) return;
      const act = cutSpendPick(w, budget, pr.cut||0, noOutfit);
      if(act === 'outfit'){
        const {afford} = wantedOutfits(w, budget);
        if(afford.length){
          const [bk, bo] = pick(afford), bc = outfitCost(bo);
          w.owned = w.owned || []; if(!w.owned.includes(bk)) w.owned.push(bk);
          if(w.autoDress || !wardrobeOK(w, w.outfit)) w.outfit = bk;
          boughtOutfit = true;
          moodAdd(w, bo.style===w.style ? 5 : 2);
          why(`bought ${bo.label}`, true);
          log(`🛍️ ${w.name} spent ${fmt(bc)} from her cut on ${bo.label}${w.outfit===bk?' and put it on':''}.`);
          pr.notes.push(`Bought ${bo.label} (${fmt(bc)})`);
          const left = budget - bc;
          w.purse = 0;
          if(left >= 5) spendBudget(left, true);
          return;
        }
        w.purse = budget;
        pr.notes.push(`Saved ${fmt(budget)} toward an outfit`);
        return;
      }
      w.purse = 0;
      if(act === 'massage'){
        const eg = Math.round(clamp(budget / 5, 4, 28));
        w.energy += eg;
        why('got a massage', true);
        pr.notes.push(`Spent ${fmt(budget)} on a massage (+${eg} energy)`);
      } else if(act === 'nice'){
        const mg = Math.round(clamp(budget / 9, 2, 12)), tg = +(clamp(budget / 110, 0.15, 1.5)).toFixed(2);
        moodAdd(w, mg); w.trust += tg * fxMul(w,'trustGain');
        why('treated herself to nice things', true);
        pr.notes.push(`Bought herself nice things (${fmt(budget)}: +mood, +trust)`);
      } else if(act === 'fling'){
        const mg = Math.round(clamp(budget / 10, 2, 10)), ld = spendLust(w, Math.round(clamp(budget / 4, 6, 32)));
        moodAdd(w, mg);
        why('went out for a good time', true);
        pr.notes.push(`Spent ${fmt(budget)} on a night out with a guy (lust −${ld}, +mood)`);
      } else if(act === 'lessons'){
        const xp = clamp(+(budget / 45).toFixed(2), 0.35, 2.2), sts = trainStatsOf(w).slice(0, 2);
        if(sts.length){ const tot = sts.reduce((a,x)=>a+x[1],0)||1; sts.forEach(([k,wt])=>statXP(w, k, xp*(wt/tot))); }
        else statXP(w, 'charm', xp);
        why('paid for extra lessons', true);
        pr.notes.push(`Paid ${fmt(budget)} for extra lessons (+stats)`);
      } else if(act === 'treat'){
        const mates = S.workers.filter(x=>x!==w && x.house===w.house), other = pick(mates);
        if(other){
          const bg = Math.round(clamp(budget / 30, 1, 3));
          addBond(w, other, bg); moodAdd(w, 2); moodAdd(other, 2); w.trust += 0.2 * fxMul(w,'trustGain');
          why(`treated ${other.name.split(' ')[0]}`, true);
          pr.notes.push(`Treated ${other.name.split(' ')[0]} (${fmt(budget)}: +bond, +mood)`);
        }
      } else if(act === 'pamper'){
        const xp = clamp(+(budget / 65).toFixed(2), 0.25, 1.4), pg = clamp(+(budget / 110).toFixed(1), 0.2, 1.4);
        statXP(w, pick(['beauty','charm']), xp); w.popularity = clamp(w.popularity + pg); moodAdd(w, 2);
        why('spent on grooming & scent', true);
        pr.notes.push(`Salon & grooming (${fmt(budget)}: +stat, +popularity)`);
      } else {
        const temple = has(w,'Devout') || w.personality==='Devout and serene';
        pr.notes.push(temple ? `Tithed ${fmt(budget)} to her temple` : `Sent ${fmt(budget)} home`);
      }
    };
    if((w.purse||0) > 0) spendBudget(Math.round(w.purse), false);
    w.energy = clamp(w.energy, 0, energyCap(w)); w.mood = clamp(w.mood); w.health = clamp(w.health);
    if(w.race==='demon' && w.energy <= 5 && w.job!=='rest') log(`${w.name} is running on fumes. She needs clients to feed on, or time off.`);
    if(has(w,'Devoted')) w.mood = Math.max(w.mood, 45);
    if(w.mood>65) w.trust += 0.5 * fxMul(w,'trustGain');
    if(w.mood<30 && !has(w,'Loyal') && !isFree(w)) w.trust -= 2;
    w.trust = clamp(w.trust); capTrust(w);
    if(w.health<30 && w.job!=='rest'){ w.job='rest'; log(`🤒 ${w.name} is unwell and will rest next week.`); }
    if(w.job!=='rest' && w.trust < jobTrust(w,w.job) - 5){ log(`${w.name} doesn't trust Sam enough to keep working as ${JOBS[w.job].label} and stepped down.`); w.job='rest'; delete w.prevJob; }
    const dropped = w.menu.filter(a=>!canClient(w,a));
    if(dropped.length){ w.menu = w.menu.filter(a=>canClient(w,a)); log(`${w.name} took ${dropped.map(actLabel).join(', ')} off her menu for now.`); }
    if(w.job==='courtesan' && !getActs().some(a=>canClient(w,a.id))){ w.job = safeJob(w, 'attendant'); log(`${w.name} isn't comfortable offering services right now and moved to ${(JOBS[w.job]||{label:'rest'}).label} work.`); }
    if(!wardrobeOK(w,w.outfit)){ w.outfit = ownedOutfits(w).find(k=>wardrobeOK(w,k)) || w.outfit; log(`${w.name} changed into something she's more comfortable in.`); }
    if(!underOK(w,w.under)){ w.under='plain'; }
    if(!boughtOutfit && w.autoDress && autoDressPool(w).length > 1){
      const np = autoDressPick(w);
      if(np && np !== w.outfit){
        w.outfit = np;
        pr.notes && pr.notes.push(`Dressed herself in ${WARDROBE[np].label}`);
      }
    }
    // auto-rest
    if(w.autoRest){
      if(w.job!=='rest' && (w.energy < maxEnergy(w)*0.35 || wornDown(w))){ log(`😴 ${w.name} is ${w.energy < maxEnergy(w)*0.35 ? 'worn out' : 'worn down after weeks without a break'} and will rest next week.`); w.prevJob = w.job; w.job = 'rest'; }
      else if(w.job==='rest' && w.prevJob && w.energy >= maxEnergy(w)*0.85){ const pj = w.prevJob; delete w.prevJob; const no = canDo(w,pj); if(!no){ w.job = pj; log(`💪 ${w.name} is rested and back to work as ${JOBS[pj].label}.`); } else log(`${w.name} is rested but can't go back to ${JOBS[pj].label} (${no}) Give her a job.`); }
    }
    // how she took the week's clients, by personality (data/personalities.json goodNight/badNight, flavor good_night/bad_night)
    if(pr.served >= 2){
      const avg = pr.satSum/pr.served, P = PERS[w.personality]||{};
      const kind = avg>=72 && !pr.low ? 'good' : (pr.low>=2 || avg<38) ? 'bad' : null;
      if(kind){ moodAdd(w, kind==='good' ? (P.goodNight??3) : (P.badNight??-3)); pr.night = kind; why(kind==='good' ? 'her clients loved her' : 'difficult clients', kind==='good');
        if(Math.random()<0.6) R.hl.push({wid:w.id, text:flavor(kind+'_night', w), act:null, scene:'casual'}); }
    }
    // lust builds up, and is spent by services and time with Sam
    // (services and Sam's time already spent it as they happened; see spendLust)
    w.lust = w.lust + lustProfile(w).build; fitLust(w);
    if(w._samTime) why('spent time with Sam', true);
    if(has(w,'Devoted') && !w._samTime && restless(w)){ why('missed Sam', false); moodAdd(w, -BAL.lovers.missedMood); pr.missed = true; }
    if(has(w,'Devoted')) w.neglect = w._samTime ? 0 : (w.neglect||0) + 1;   // weeks in a row without Sam
    w._samTime = 0; pr.lust = Math.round(w.lust);
    pr.e1 = Math.round(w.energy); pr.m1 = Math.round(w.mood);
    // what changed this week (report: house and lady pages drill into it)
    pr.t1 = w.trust||0; pr.lw1 = w.lewd||0; pr.p1 = w.popularity||0;
    const dif = (a, b) => Object.fromEntries(Object.keys(b||{}).map(k=>[k, Math.round(((b[k] && b[k].skill!==undefined ? b[k].skill : b[k])||0) - ((a||{})[k]||0))]).filter(([,v])=>v));
    pr.dStats = dif(pr.st0, w.stats); pr.dTech = dif(pr.tk0, w.tech); pr.dActs = dif(pr.ak0, w.acts);
    pr.lowE = JOBS[w.job] && JOBS[w.job].cat==='escort' && pr.cap!==undefined && pr.served < pr.cap && (pr.lowNights||0) > 0;
    delete pr.st0; delete pr.tk0; delete pr.ak0;
    w.earnedLast = pr.earned;
    if(w.mood<15 && !has(w,'Loyal') && !isFree(w) && !w.locked && !has(w,'Devoted')){ w.unhappy=(w.unhappy||0)+1; if(w.unhappy>=2) leaving.push(w); else log(`😠 ${w.name} is miserable. If nothing changes, she'll leave.`); }
    else w.unhappy = 0;
    if(!isFree(w) && !w.locked){ w.contract--; if(w.contract<=0 && !leaving.includes(w)) renew.push(w); }
    const enc = pr.enc.slice().sort(()=>Math.random()-0.5).sort((a,b)=>(b.act?2:b.want?0:1)+(b.reg?2:0)-(a.act?2:a.want?0:1)-(a.reg?2:0));
    // every encounter goes in the report (her own page lists them all); the first two are her highlights on the house page (more: false)
    pr.encN = enc.length; pr.encSum = enc.reduce((a,e)=>{ a[e.act ? 'svc' : e.want && e.outcome==='no' ? 'no' : 'comp']++; return a; }, {svc:0, no:0, comp:0});
    enc.slice(0,30).forEach((e,i)=>R.hl.push({wid:w.id, text:hlText(w,e) + (e.note ? ' ' + ENC_NOTE(e.note) : ''), act:e.act||null, cls:e.cls, note:e.note||null, more:i>=2, fee:e.fee, d:e.d, sat:e.sat, outcome:e.outcome, where:e.where||null, chapelProp:!!e.chapelProp, sample:!!e.sample, adapt:!!e.adapt, spiritFuta:!!e.spiritFuta, beastHeat:!!e.heat, scene: e.act ? 'act:'+e.act+'~'+(e.expr||'')+'~'+(e.ctx||'') : e.where ? 'job_'+e.where : 'companion'}));
    delete pr.enc;
    earnCheck(w).forEach(t=>{ log(`✨ ${w.name} has developed a knack: ${t}. ${TRAITS[t].desc}`); addLog(`${w.name} developed the trait ${t}.`); });
    titleCheck(w).forEach(log);
    // Lantern Angel: once her lewdness reaches lanternLewd the Lamplighter's sanction is hers to take.
    // With enough trust (lanternTrust) she asks Sam first. Otherwise her personality decides: an easygoing one
    // (personality lewd multiplier >= 1, not Modest) takes it on her own; a reserved one holds to her vows until
    // she trusts Sam enough to ask, or her lewdness climbs lanternOwn past the threshold and she stops resisting.
    const AN = SVC.angel || {}, LL = AN.lanternLewd ?? 60;
    if(w.race==='angel' && w.sub!=='lantern' && !w.lanternDecided && w.lewd >= LL){
      const wid = w.id;
      if(w.trust >= (AN.lanternTrust ?? 50)){ w.lanternDecided = true; EVQ.push(()=>evLanternAsk(findW(wid))); }
      else if((((PERS[w.personality]||{}).lewd ?? 1) >= 1 && !has(w,'Modest')) || w.lewd >= LL + (AN.lanternOwn ?? 15)){
        w.lanternDecided = true; w.sub = 'lantern'; w.lantern = true; fitLust(w); moodAdd(w, AN.lanternAutoMood ?? 6);
        log(`🕯️ ${w.name} took the Pleasure Lantern's sanction on her own and became a Lantern Angel.`);
        EVQ.push(()=>evLanternSelf(findW(wid)));
      } else if(!w.lanternHeld){
        w.lanternHeld = true;
        log(`🕯️ ${w.name} feels the Pleasure Lantern's pull and is holding to her vows for now. She may ask Sam about it once she trusts him more (trust ${tShow(AN.lanternTrust ?? 50)}).`);
      }
    }
    // romance arcs
    if(ARCS[w.key] && (w.arc||0) < ARCS[w.key].length && !houseGate(w)){
      const i = w.arc||0, A = BAL.arcs, need = A.need[i], gap = A.gap[i];
      const extra = i===2 ? ((w.dates||0)>=A.dates[2] || (w.privateCount||0)>=1) : i===4 ? (w.dates||0)>=A.dates[4] : i===5 ? (w.privateCount||0)>=A.private[5] : true;
      if(w.trust>=need && S.week-(w.arcWk||0) >= gap && extra){ const at = i; EVQ.push(()=> (w.arc||0)===at ? evArc(w) : null); }
    } else if(typeof afterReady==='function'){
      const ai = afterReady(w);
      if(ai >= 0){ EVQ.push(()=> (w.after||0)===ai ? evAfterStory(w) : null); }
    }
  });
  leaving.forEach(w=>{ stashCloset(w); S.workers = S.workers.filter(x=>x!==w); log(`🚪 ${w.name} packed her things and left.`); addLog(`${w.name} quit.`); });

  (R.houses||[]).forEach(hr=>{
    if(hr.short) log(`🚪 ${flavor('rooms_short', null, {house:hr.name})} (${hr.short} client${hr.short>1?'s':''} couldn't get a room; ${hr.roomsUsed}/${hr.roomCap} room sessions used.)`);
    if(hr.crowdOver) log(`👥 ${hr.name} was overcrowded (${hr.guestsIn}/${hr.crowdCap} guests inside — +${hr.crowdOver} over house capacity; satisfaction, popularity and prestige suffered).`);
    const T = BAL.tidy, tk = hr.tidy >= T.high ? 'high' : hr.tidy < T.bad ? 'bad' : hr.tidy < T.low ? 'low' : null;
    if(tk) log(`${tk==='high'?'✨':'🧹'} ${flavor('tidy_'+tk, null, {house:hr.name})} (tidiness ${Math.round(hr.tidy)})`);
    if(hr.classroom) log(`📚 Classroom: ${hr.classroom.teacher} taught ${hr.classroom.subject.toLowerCase()} to ${hr.classroom.n} lad${hr.classroom.n===1?'y':'ies'}.`);
    const pu = hr.pushy; if(pu && pu.total) log(`⚠️ ${hr.name}: ${pu.total} pushy client${pu.total>1?'s':''}${hr.nightsLost?` (${hr.nightsLost} night${hr.nightsLost>1?'s':''} cut short)`:''}. ${[pu.talked&&`talked down ${pu.talked}×`, pu.security&&`security walked ${pu.security} out`, pu.sam&&`Sam stepped in ${pu.sam}×`, pu.samfail&&`Sam's attempt went badly ${pu.samfail}×`, pu.samcall&&`security needed Sam ${pu.samcall}× (your call)`, pu.none&&`nobody was there ${pu.none}×`].filter(Boolean).join(', ')}.`);
  });
  (R.houses||[]).forEach(hr=>{ if(hr.floor && hr.floor.length) log(`🛏️ ${hr.name} is short on beds: ${hr.floor.join(', ')} slept on the floor. Build staff quarters or add staff beds.`); });
  R.avgSat = R.served ? satSum/R.served : 50;
  const avgRep = S.houses.reduce((a,h)=>a+h.rep,0)/S.houses.length, maxRep = Math.max(...S.houses.map(h=>h.rep));
  S.rep = clamp(S.rep + ((maxRep*0.6 + avgRep*0.4) - S.rep)*0.35 + S.houses.length*0.1);
  R.rep = S.rep;

  S.houses.forEach(h=>{
    const st = STORIES[h.id]; if(!st || !h.story || h.story.beat>=st.beats.length) return;
    const need = STORY_REP[h.story.beat]||0, gap = storyGap(h);
    if(S.week - Math.max(h.since||1, h.story.wk||0) >= gap && h.rep>=need){ const b = h.story.beat; EVQ.push(()=> h.story.beat!==b ? null : houseStoryEvent(h, b)); }
  });
  seedBonds(); driftBonds();
  sleepInWeek(R);
  goddessAfter(R);
  queueEncounters();
  // auto-renew (setting, on by default): a lady who'll certainly sign again does so at her going rate, bonus paid if Sam can afford it;
  // anyone unsure, or a bonus he can't cover, still gets the renewal event
  renew.forEach(w=>{ const a = SET.autoRenew !== false ? autoRenew(w) : null; if(a) R.lines.push(a); else EVQ.push(()=>evRenew(w)); });
  if(Math.random()<0.6){ const ev = pickRandomEvent(); if(ev) EVQ.push(ev); }
  if(S.flags.poachCD>0) S.flags.poachCD--;

  if(debtWeek()%BAL.debt.every===0){
    const nd = nextDue();
    if(nd.amount>0){
      if(S.gold >= nd.amount){
        S.gold -= nd.amount; S.debt.remaining -= nd.amount; S.debt.carry = 0;
        log(`📜 Paid ${fmt(nd.amount)} to the Vane Credit House. Remaining: ${fmt(S.debt.remaining)}.`);
      } else {
        S.debt.strikes++; const pen = Math.round(nd.amount*BAL.debt.penalty);
        S.debt.carry = Math.min(S.debt.remaining + pen, nd.amount + pen); S.debt.remaining += pen;
        log(`❌ Missed a debt payment! Strike ${S.debt.strikes}/${BAL.debt.strikes}. A ${fmt(pen)} penalty was added.`);
        EVQ.push(evStrike);
      }
    }
  }
  const netXp = R.income - R.wages - R.upkeep - (R.cuts||0);
  if(netXp > 0) samGainXP(Math.min(30, Math.round(netXp/60)));
  S.week++; S.ap = apMax(); samEnergyAdd(samRecover(BAL.samHome.weekly) * samBonus('rest','strength') + (samUpFx('weekly')||0) + (hasPast('gym')?20:0));
  S.samWeek = {security:0, books:false, income:0, acts:[], focus:null, focusEff:0};
  refreshCandidates();
  guildNewWeek();   // guild.js: a fresh board
  checkUnlocks(false, R.lines);
  S.lastReport = R;
  addLog(`Week ${R.week}: income ${fmt(R.income)}, wages ${fmt(R.wages)}, upkeep ${fmt(R.upkeep)}${R.cuts?`, cuts ${fmt(R.cuts)}`:''}${R.recharge?`, recharging ${fmt(R.recharge)}`:''}${R.tutor?`, tutors ${fmt(R.tutor)}`:''}.`);
  save(); render();
  if(typeof cloudAutoSave === 'function') cloudAutoSave();
  showReport(R, true);
}
