'use strict';
/* =====================================================================
   HOUSE STAFF HELPERS (classroom teaching, attendant pairing & stand-ins); called from simHouse / endWeek
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
// Attendants follow the courtesans (run before the houses each week, before R.per is taken). Each week starts from scratch:
// last week's stand-ins and idle-resting attendants go back to attending, then, house by house, if more attendants are working
// than courtesans: spare attendants first stand in as courtesans for the ones resting or away (the most skilled and willing
// first: the madame's pick), as many as there are absent courtesans; anyone still spare takes the week off (w.idleRest,
// keeping her position). Stand-ins (w.standIn) don't hold a courtesan position, so the absent courtesan can always return.
// Only ladies with auto-rest on are moved, and only if they're fit to work (not tired / worn down).
function standInScore(w){
  const ok = getActs().filter(a=>clientStance(w,a.id,'courtesan')==='yes');
  return ok.length*40 + ok.reduce((m,a)=>Math.max(m, (w.acts[a.id]||{}).skill||0), 0)*0.5 + (w.lewd||0)*3 + (w.popularity||0);
}
function canStandIn(w){
  return w.autoRest && w.trust >= jobTrust(w,'courtesan') && !wornDown(w) && w.energy >= maxEnergy(w)*0.5
    && getActs().some(a=>clientStance(w,a.id,'courtesan')!=='no');
}
function syncAttendants(){
  const lines = [], was = new Map();
  S.workers.forEach(w=>{
    if(w.standIn && w.job==='courtesan'){ was.set(w.id, 'standIn'); w.job = 'attendant'; }
    else if(w.idleRest && w.job==='rest' && w.prevJob==='attendant'){ was.set(w.id, 'idle'); w.job = 'attendant'; delete w.prevJob; }
    delete w.standIn; delete w.idleRest;
  });
  S.houses.forEach(h=>{
    const ws = S.workers.filter(w=>w.house===h.id);
    const courts = ws.filter(w=>w.job==='courtesan').length, atts = ws.filter(w=>w.job==='attendant');
    let spare = atts.length - courts; if(spare <= 0) return;
    const absent = S.workers.filter(w=>w.house===h.id && ((w.job==='rest' && w.prevJob==='courtesan') || (w.job==='guild' && w.gPrev==='courtesan'))).length;
    const subs = atts.filter(canStandIn).sort((a,b)=>standInScore(b) - standInScore(a)).slice(0, Math.min(absent, spare));
    subs.forEach(a=>{
      a.job = 'courtesan'; a.standIn = true; spare--;
      if(!a.menu.length) a.menu = getActs().filter(x=>clientStance(a,x.id)==='yes').map(x=>x.id);
      if(was.get(a.id)!=='standIn') lines.push(`🎀 ${a.name} stands in as a courtesan at ${h.name} while a courtesan is away.`);
    });
    if(spare <= 0) return;
    const ap = attendantPairs(h);
    atts.filter(a=>a.job==='attendant' && !ap.byAtt.has(a.id) && a.autoRest).forEach(a=>{
      a.prevJob = 'attendant'; a.job = 'rest'; a.idleRest = true;
      if(was.get(a.id)!=='idle') lines.push(`🎀 ${a.name} has no courtesan to attend at ${h.name} this week and takes the time off.`);
    });
  });
  S.workers.forEach(w=>{ if(was.has(w.id) && w.job==='attendant') lines.push(`🎀 ${w.name} is back to attending at ${houseOf(w).name}.`); });
  return lines;
}
