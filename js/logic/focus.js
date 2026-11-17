'use strict';
/* =====================================================================
   SAM'S WEEKLY FOCUS (balance.json → focus)
   A week is a rest day (Sam's actions: dates, walks, rounds, scouting...) and six work nights. During the nights Sam works one
   focus at his house (every house with samReach). It costs focus.cost energy when the week ends; with less energy left it runs
   at that share (a tired Sam does a tired job). 'rest' takes the week off instead and gives energy back.
   Hooks: samFocusRun() at the start of endWeek (before the houses run); simHouse reads focusOn(kind, h).
   ===================================================================== */
const FOCUS = {
  office:  {icon:'📒', label:'Office',   desc:'Cuts upkeep (Business). Matches clients with the right courtesan and attendants with the right courtesans, like a madame: most of a madame\'s effect where there is none (or she\'s resting), a little on top of hers. No income.'},
  floor:   {icon:'🍺', label:'Floor',    desc:'Works the bar and the lounge: income where there is a bar (Charm), happier clients who wait less restlessly, and a little mood and trust for the ladies.'},
  watch:   {icon:'🛡️', label:'Watch',    desc:'Security all week (Strength), his step-in bonus every night, and more trust: the ladies feel safe with him around.'},
  guild:   {icon:'⚔️', label:'Guild',    desc:'Goes out on a guild contract with (or instead of) the ladies: pick it on the Guild tab. He is away all week, so none of the at-house work happens.'},
  classes: {icon:'🎓', label:'Classes',  desc:'Afternoon classes for everyone working: a skill class (her job\'s skill) or a stat class (the stats her job uses). Auto alternates.'},
  rest:    {icon:'🛌', label:'Off duty', desc:'Takes the week easy: no work, energy back instead.'}
};
const FOCUS_TOPICS = {auto:'Auto', skill:'Skill class', stat:'Stat class'};
const samFocus = () => (S.samFocus && FOCUS[S.samFocus.kind]) ? S.samFocus : (S.samFocus = {kind:'office', topic:'auto'});
// where his focus is worked: away on a contract, at every house (Speaking Stones / Shadow Clone), or at his own
const samFocusCost = () => samFocus().kind==='rest' ? 0 : Math.max(5, ((BAL.focus||{}).cost ?? 25) - samUpFx('workEnergy') - (samFocus().kind==='guild' ? (hasGuildPerk('roadwise') ? 10 : 0) + (hasPast('courier') ? 5 : 0) : 0));
function setFocus(kind, topic){
  const f = samFocus();
  if(kind==='guild'){ if(!guildOn()) return toast('Sam has to register at the Adventurers\' Guild first.'); TAB = 'guild'; return render(); }   // the contract is picked on the Guild tab
  if(FOCUS[kind]){ if(f.kind==='guild') f.topic = 'auto'; f.kind = kind; } if(FOCUS_TOPICS[topic]) f.topic = topic; save(); render(); }
// How hard Sam worked this focus this week at house h (0-1), or 0 if it's another focus or he isn't there.
const focusOn = (kind, h) => (S.samWeek && S.samWeek.focus === kind && (!h || samAtHouse(h))) ? (S.samWeek.focusEff || 0) : 0;
// Sam as a madame (Office): the madame formula with his Business for her Management, Wits and Charm (balance.json → focus.office).
const samMadF = () => 0.5 + ((S.sam.business||0) + (S.sam.wits||0)*0.4 + (S.sam.charm||0)*0.6) / 200;

// Skill class: everyone working near Sam learns her own job's skill (Hospitality for jobs without one); madames and teachers a little of every skill.
function samSkillClass(mult){
  const SM = {service:'charm', dance:'charm', bar:'charm', combat:'strength', manage:'business'}, GROW = {service:'charm', dance:'agility', bar:'charm', combat:'strength', manage:'refinement'};
  const who = S.workers.filter(w=>w.job!=='rest' && nearSam(w)), base = BAL.sam.lessonShare * lessonMul() * mult, by = {}, broad = (BAL.train.broad||{}).lesson ?? 0.3;
  who.forEach(w=>{ const k = trainSkillOf(w), g = (4 + S.sam[SM[k]]/25) * base, m = pm(w,'train') * fxMul(w,'learn');
    grow(w, k, g * m); if(broadJob(w)) TECH_KEYS.forEach(o=>{ if(o!==k) grow(w, o, g * m * broad); });
    statXP(w, GROW[k] || 'charm', g*0.4); minorTrust(w); countUp(w, 'lessons'); (by[k] = by[k] || []).push(w.name); });
  const ks = Object.keys(by); Array.from(new Set(ks.map(k=>SM[k]))).forEach(st=>samStat(st, (ks.length > 1 ? 1 : 2) * Math.min(1, mult)));
  return who.length ? `skill classes for ${who.length} (${ks.map(k=>TECH_LABEL[k]).join(', ')})` : 'skill classes, but nobody was working';
}
// Stat class: everyone working near Sam trains the stats her job uses (madames and teachers: all of them).
function samStatClass(mult){
  const ST = BAL.train.stat || {}, who = S.workers.filter(w=>w.job!=='rest' && nearSam(w));
  const g = ((ST.base ?? 12) + (S.sam.wits||0) * (ST.perWits ?? 0.2)) * samBonus('wits') * (ST.spread ?? 0.5) * ((BAL.lessons||{}).stat||{}).share * lessonMul() * mult;
  who.forEach(w=>{ const m = pm(w,'train') * fxMul(w,'learn'); trainStatsOf(w).forEach(([k,wt])=>statXP(w, k, g * wt * m)); minorTrust(w); countUp(w, 'lessons'); });
  samStat('wits', 2 * Math.min(1, mult));
  return who.length ? `stat classes for ${who.length}` : 'stat classes, but nobody was working';
}

// Runs at the start of endWeek: pays the energy, applies what happens up front, and leaves flags for simHouse. Returns the report line.
function samFocusRun(){
  const F = BAL.focus || {}, f = samFocus(), k = f.kind, sw = S.samWeek, D = FOCUS[k];
  sw.focus = k;
  if(k==='rest'){ const g = Math.round(samRecover(F.restEnergy ?? 30)); samEnergyAdd(g); sw.focusEff = 1; return `${D.icon} Sam took the week off (energy +${g}).`; }
  const cost = samFocusCost(), eff = cost ? clamp(S.sam.energy / cost, 0, 1) : 1;
  S.sam.energy = Math.max(0, S.sam.energy - cost); sw.focusEff = eff;
  if(eff <= 0.05){ sw.focusEff = 0; return `😴 Sam was too worn out to work this week (${D.label}).`; }
  const where = samReach() ? 'every house' : samHouse().name, tired = eff < 1 ? ` (tired: ${Math.round(eff*100)}% effort)` : '';
  const near = S.workers.filter(nearSam);
  samGainXP(Math.round((F.xp ?? 8) * eff));
  let what = '';
  if(k==='watch'){
    const W = F.watch || {}, sec = Math.round((20 + S.sam.strength) * (1 + samUpFx('watch')) * (W.mult ?? 1) * (hasGuildPerk('pitfighter') ? 1.25 : 1) * eff);
    sw.security += sec; samStat('strength', 2*eff);
    near.forEach(w=>gainTrust(w, (W.trust ?? 1) * eff));
    what = `stood watch (security +${sec}, the ladies trust him a little more)`;
  } else if(k==='office'){
    sw.books = true; sw.booksEff = eff; samStat('business', 2*eff); samStat('wits', eff);
    what = `ran the office (upkeep −${Math.round(booksCut()*eff*100)}%, matched clients and attendants${S.houses.some(h=>samAtHouse(h) && S.workers.some(w=>w.house===h.id && w.job==='madame')) ? ' alongside the madame' : ''})`;
  } else if(k==='floor'){
    const Fl = F.floor || {}; let inc = 0;
    S.houses.filter(h=>samAtHouse(h) && h.up.bar).forEach(h=>{
      inc += Math.round(((Fl.base ?? 30) + S.sam.charm * (Fl.perCharm ?? 1.2) + rnd(0,25)) * (Fl.nights ?? 4) * (hasPast('bartender')?1.5:1) * (1 + samUpFx('bartend')) * (hasGuildPerk('silvertongue') ? 1.15 : 1) * (hasChallengePerk('iron_ledger') ? 1.15 : 1) * eff); });
    if(inc){ S.gold += inc; sw.income += inc; }
    near.forEach(w=>{ moodAdd(w, (Fl.mood ?? 1) * eff); gainTrust(w, (Fl.trust ?? 0.3) * eff); });
    samStat('charm', 2*eff);
    what = `worked the floor (${inc ? `+${fmt(inc)} at the bar, ` : 'no bar, '}happier clients and staff)`;
  } else if(k==='classes'){
    const topic = f.topic==='auto' ? (S.week % 2 ? 'skill' : 'stat') : f.topic, mult = ((F.classes||{}).mult ?? 2.5) * eff;
    what = 'held ' + (topic==='stat' ? samStatClass(mult) : samSkillClass(mult));
  } else if(k==='guild'){
    const c = guildContract(f.topic);
    samLog(`${D.label} focus`);
    return c ? `${D.icon} Sam went out on the ${GCON[c.type].label}${tired}.` : `${D.icon} Sam had no contract to work.`;
  }
  samLog(`${D.label} focus`);
  return `${D.icon} Sam ${what} at ${esc(where)}${tired}.`;
}

// Sam's sheet: the focus picker.
function focusCardHTML(){
  const f = samFocus(), cost = samFocusCost(), where = samReach() ? 'every house' : esc(samHouse().name);
  const btn = k => k==='guild' && !guildOn() ? '' : `<button class="${f.kind===k?'primary':''}" onclick="setFocus('${k}')" title="${esc(FOCUS[k].desc)}">${FOCUS[k].icon} ${FOCUS[k].label}</button>`;
  const gc = f.kind==='guild' ? guildContract(f.topic) : null;
  const topic = gc ? `<div class="row">On contract: <b>${GCON[gc.type].icon} ${esc(GCON[gc.type].label)}</b></div>` : f.kind==='classes' ? `<div class="row">Classes: <select onchange="setFocus('classes', this.value)">${Object.entries(FOCUS_TOPICS).map(([k,l])=>`<option value="${k}" ${f.topic===k?'selected':''}>${l}</option>`).join('')}</select></div>` : '';
  const short = cost && S.sam.energy < cost ? ` <span class="warn">Sam has ${Math.round(S.sam.energy)} energy left: he'll work at ${Math.round(S.sam.energy/cost*100)}%.</span>` : '';
  return `<section class="card"><h2>This Week's Work</h2>
    <div class="row">${Object.keys(FOCUS).map(btn).join('')}</div>${topic}
    <p class="muted"><b>${FOCUS[f.kind].icon} ${FOCUS[f.kind].label}:</b> ${esc(FOCUS[f.kind].desc)} ${cost ? `Costs ${cost} energy when the week ends${f.kind==='guild' ? '' : `, at ${where}`}.` : ''}${short}</p></section>`;
}
