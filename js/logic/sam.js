'use strict';
/* =====================================================================
   SAM
   ===================================================================== */
function useAP(cost=20){
  if(S.over) return false;
  if(S.ap<=0){ toast('Sam is out of actions this week. End the week to continue.'); return false; }
  if(S.sam.energy<cost){ toast('Sam is too tired. Have him rest, or end the week.'); return false; }
  S.ap--; S.sam.energy -= cost; samGainXP(6); return true;
}
// Do the books: share of upkeep cut this week (Business, the ledger tool, and the office worker's spreadsheet habit). Capped at 60%.
const booksCut = () => Math.min(0.6, 0.1 + S.sam.business*0.003 + samUpFx('books') + (hasPast('salaryman') ? 0.1 : 0));
const samLog = t => S.samWeek.acts.push(t);
const xpNeed = l => 60 + 40*l;
const apMax = () => 3 + Math.floor((S.sam.lvl||1)/5) + (hasBoon('ap')?1:0);   // +1 action every 5 levels (5, 10, 15, 20...)
// Sam's stats (0-100). Each also works passively (balance.json → sam.bonus, x stat/100): Charm → trust the ladies gain (gainTrust),
// Business → house income (endWeek), Strength → security in every house (simHouse) and weekly recovery, Wits → stat training and
// Appraisal XP, Technique → service skills he teaches and how much he satisfies (samRelease).
const SAM_STATS = ['charm','business','strength','wits','technique'];
const samBonus = (k, stat=k) => 1 + (((BAL.sam||{}).bonus||{})[k] || 0) * ((typeof S!=='undefined' && S && S.sam ? S.sam[stat] : 0) || 0) / 100;
const SAM_BONUS_TIP = {charm:'More trust from everything the ladies do with him', business:'Every house earns more', strength:'Keeps trouble away in every house; recovers more energy each week', wits:'Stat training goes further; Appraisal XP', technique:'Service practice goes further; leaves her more satisfied'};
function samBonusLine(){
  const p = k => Math.round((samBonus(k) - 1)*100), B = (BAL.sam||{}).bonus||{};
  return `<br>Always on: Charm +${p('charm')}% trust gained · Business +${p('business')}% house income · Strength +${Math.round((S.sam.strength||0)*(B.security||0))} security everywhere, +${Math.round((samBonus('rest','strength')-1)*100)}% weekly recovery · Wits +${p('wits')}% stat training and Appraisal XP · Technique: better service practice.`;
}
// Max energy grows with each New Game+ cycle (balance.json → sam.energyPerCycle).
const samMaxEnergy = () => 100 + ((BAL.sam||{}).energyPerCycle || 0) * Math.max(0, ((typeof S!=='undefined' && S ? S.cycle : 1) || 1) - 1);
const samEnergyAdd = n => { S.sam.energy = clamp(S.sam.energy + n, 0, samMaxEnergy()); };
function samGainXP(n){
  S.sam.xp = (S.sam.xp||0) + n; S.sam.lvl = S.sam.lvl || 1;
  while(S.sam.xp >= xpNeed(S.sam.lvl)){
    S.sam.xp -= xpNeed(S.sam.lvl); S.sam.lvl++;
    SAM_STATS.forEach(k=>samStat(k,BAL.sam.perLevel));
    const apUp = S.sam.lvl % 5 === 0; if(apUp) S.ap++;
    note(`⬆ Sam reached level ${S.sam.lvl}! All stats +${BAL.sam.perLevel}${apUp?', and +1 action per week':''}.`);
  }
}
function samXP(n){
  S.sam.appXP += Math.round(n * samBonus('wits'));
  const lv = S.sam.appXP>=200 ? 3 : S.sam.appXP>=60 ? 2 : 1;
  if(lv > S.sam.appraisal){ S.sam.appraisal = lv; note(`[Appraisal] leveled up to Lv ${lv}! ${lv===2?'Exact stats and lewdness are now visible.':'Hidden traits and everyone\'s preferences are now visible.'}`); }
}
function samStat(k,n){ S.sam[k] = clamp((S.sam[k]||0)+n, 0, samCap()); }
const lessonMul = () => (hasPast('massage') ? 1.15 : 1) * (hasPast('tutor') ? 1.2 : 1) * (1 + samUpFx('lesson'));
function samWork(kind){
  if(!useAP(25)) return;
  let title='', text='';
  if(kind==='bartend'){
    const inc = Math.round((30 + S.sam.charm*1.2 + rnd(0,25)) * (hasPast('bartender')?1.5:1) * (1 + samUpFx('bartend'))); S.gold += inc; S.samWeek.income += inc; samStat('charm',2);
    title='Behind the Bar'; text=`Sam pours drinks all evening. ${hasPast('bartender')?'Old habits: he flips a bottle and the whole room cheers.':'He over-explains the menu to everyone, but people seem to find it charming.'}\n\n+${fmt(inc)} · Charm +2`;
    samLog(`Tended bar (+${fmt(inc)})`);
  } else if(kind==='security'){
    const sec = Math.round((20 + S.sam.strength) * (1 + samUpFx('watch'))); S.samWeek.security += sec; samStat('strength',2);
    title='On Watch'; text=`Sam makes the rounds of every house, looking as stern as a thin man in a hoodie can. Nobody starts anything, which he decides to count as a win.\n\nSecurity bonus +${sec} in all houses this week · Strength +2`;
    samLog('Stood watch');
  } else if(kind==='books'){
    S.samWeek.books = true; samStat('business',2); samStat('wits',1);
    title='Doing the Books'; text=`Sam rebuilds the ledger as a spreadsheet, by hand, on parchment. The staff watch with a mix of horror and respect.\n\nUpkeep reduced by ${Math.round(booksCut()*100)}% this week · Business +2 · Wits +1`;
    samLog('Did the books');
  } else if(kind==='rounds'){
    // a word with everyone: small trust and mood for every lady in every house (balance.json → sam.rounds*)
    const B = BAL.sam, rm = 1 + samUpFx('rounds'), rt = B.roundsTrust * rm, rmood = B.roundsMood * rm; let n = 0;
    S.workers.forEach(w=>{ gainTrust(w, rt); moodAdd(w, rmood); n++; });
    samStat('charm',1);
    title='Making the Rounds'; text=`Sam walks through every house with a notebook, asking everyone how they're doing and actually writing down the answers. A leaky window gets fixed, someone's favorite tea gets restocked, and the whole staff notices that he noticed.\n\n${n} ladies: trust ${tDelta(rt)}, mood +${Math.round(rmood*10)/10} · Charm +1`;
    samLog('Made the rounds');
  } else if(kind==='lesson'){
    // skill class: everyone working learns her own job's skill (Hospitality for jobs without one); madames and teachers also a little of every other skill
    const SM = {service:'charm', dance:'charm', bar:'charm', combat:'strength', manage:'business'}, GROW = {service:'charm', dance:'agility', bar:'charm', combat:'strength', manage:'refinement'};
    const who = S.workers.filter(w=>w.job!=='rest'), base = BAL.sam.lessonShare * lessonMul(), by = {}, broad = (BAL.train.broad||{}).lesson ?? 0.3;
    who.forEach(w=>{ const k = trainSkillOf(w), g = (4 + S.sam[SM[k]]/25) * base, m = pm(w,'train') * fxMul(w,'learn');
      grow(w, k, g * m); if(broadJob(w)) TECH_KEYS.forEach(o=>{ if(o!==k) grow(w, o, g * m * broad); });
      statXP(w, GROW[k] || 'charm', g*0.4); minorTrust(w); countUp(w, 'lessons'); (by[k] = by[k] || []).push(w.name); });
    const ks = Object.keys(by); Array.from(new Set(ks.map(k=>SM[k]))).forEach(st=>samStat(st, ks.length > 1 ? 1 : 2));
    title = 'Skill Class'; text = who.length ? `Sam gathers the staff for an afternoon of lessons, a table for each trade. He brought handouts. Nobody asked for handouts.\n\n${ks.map(k=>`${TECH_LABEL[k]}: ${by[k].join(', ')}`).join('\n')}${who.some(broadJob)?'\n(The madame and teachers drift between tables and pick up a little of everything.)':''}\n\nSam's ${Array.from(new Set(ks.map(k=>cap(SM[k])))).join(', ')} +${ks.length > 1 ? 1 : 2}` : `Sam sets out chairs and handouts. Everyone is off resting. He reads the handout to himself.`;
    samLog(`Held a skill class${who.length?` (${who.length})`:''}`);
  } else if(kind==='statclass'){
    // stat class: everyone working trains the stats her job uses (madames and teachers: all of them), at lessons.stat.share of one-on-one coaching
    const ST = BAL.train.stat || {}, who = S.workers.filter(w=>w.job!=='rest');
    const g = ((ST.base ?? 12) + (S.sam.wits||0) * (ST.perWits ?? 0.2)) * samBonus('wits') * (ST.spread ?? 0.5) * ((BAL.lessons||{}).stat||{}).share * lessonMul();
    who.forEach(w=>{ const m = pm(w,'train') * fxMul(w,'learn'); trainStatsOf(w).forEach(([k,wt])=>statXP(w, k, g * wt * m)); minorTrust(w); countUp(w, 'lessons'); });
    samStat('wits', 2);
    title = 'Stat Class'; text = who.length ? `Sam turns the common room into a training hall for the afternoon: a posture corner, a mirror corner, a table of ledgers turned into arithmetic drills, and a stretch of floor for anyone who needs to run. Everyone works on what her job asks of her.\n\n${who.length} ladies trained · Sam's Wits +2` : `Sam sets up stations for a stat class. Everyone is off resting. He does the stretches himself.`;
    samLog(`Held a stat class${who.length?` (${who.length})`:''}`);
  } else if(kind==='scout'){
    const nc = 2 + Math.round(samUpFx('scout')); addCandidates(nc, 1.1 + S.sam.business/400); samXP(10); samStat('charm',1); samStat('wits',1);
    title='Scouting'; text=`Sam walks the market and the guild hall, quietly using [Appraisal] on anyone who looks like they might want a job.\n\n+${nc} candidates · Appraisal XP +${Math.round(10*samBonus('wits'))} · Wits +1`;
    samLog('Scouted for recruits');
  }
  save(); render(); showResult(title, text);
}
function samRest(){
  if(S.ap<=0) return toast('No actions left this week.');
  S.ap--; const nap = samRecover(BAL.samHome.nap); samEnergyAdd(nap); samLog('Rested'); save(); render();
  const v = restVisitor();
  if(v) return restEncounter(v);
  showResult('Nap Time', 'Sam takes a long nap. In his dreams, a truck honks at him. He wakes up and decides not to think about it.\n\nEnergy +'+nap);
}
function samChat(id){
  const w = findW(id), d = DATES.chat; if(!w || !useAP(d.energy)) return;
  const m = pmAny(w,d.like), tg = gainTrust(w, d.trust * rnd(0.6,1.4) * (has(w,'Romantic')?1.4:1) * (has(w,'Shy')?1.2:1) * m);
  moodAdd(w, d.mood*m - (m<1?3:0)); samStat('charm',1); samXP(5); samLog(`Chatted with ${w.name}`); checkUnlocks();
  save(); render(); closeModal();
  const topic = ET('chat', NAMED[w.key] && Object.values(NAMED[w.key].bonds||{}).some(x=>x.kind==='home') || ['yui','natsuki','kanako','akari','lara','ella','emily'].includes(w.key) ? 'home' : (S.cycle||1)>=2 && Math.random()<0.3 ? 'ng' : 'topics');
  showResult(`Chatting with ${w.name}`, `Sam and ${w.name} talk ${topic}.\n\nTrust ${tDelta(tg)}`, w.id, null);
}
// a short line for the service itself, used after encounter and first-time openings (flavor.json → private_act)
const actLine = (act, w) => { const L = byAct(FLAVOR.private_act, act); return L && L.length ? pick(L).replace(/\{name\}/g, w ? w.name : 'she') : ''; };
// The turn a moment takes, naming the service (flavor.json → act_turn), so a scene that opened on a kiss says so when it becomes a massage.
const actTurn = (act, w) => { const L = byAct(FLAVOR.act_turn, act); return L && L.length ? pick(L).replace(/\{name\}/g, w.name) : ''; };
// One-on-one skill training opening (flavor.json → train_skill, keyed by TECH skill; _default as fallback). {skill} = the skill's name.
const trainSkillLine = (w, k) => { const L = (FLAVOR.train_skill||{})[k] || (FLAVOR.train_skill||{})._default || []; return (L.length ? pick(L) : `Sam walks {name} through the trade the hands-on way, {skill} first.`).replace(/\{name\}/g, w.name).replace(/\{skill\}/g, TECH_LABEL[k].toLowerCase()); };
// What actually happens, for AI text: appended to the moment's situation.
const actSituation = (w, act, base) => [base, act ? `What actually happens: ${w.name} ${askLady(act)}${(actById(act)||{}).kind==='kiss' ? '' : ` (${actLabel(act).toLowerCase()})`}; the text should lead into that.` : ''].filter(Boolean).join(' ');
// Date types live in data/dates.json (DATES is defined in js/data/scenes.js). Chat is the first one.
const dateFor = (k) => { const d = DATES[k]; return Object.assign({}, d, (d.past && pastPick(d.past)) || {}); };
const dateText = (d, w) => [d.intro, pick(d.lines||[''])].filter(Boolean).join(' ').replace(/\{name\}/g, w.name);
const dateListed = (w, d) => !(d.needsUp && !(houseOf(w).up||{})[d.needsUp]) && !(d.needsIntim && (w.intim||0) < d.needsIntim);
// a short "what it raises" hint built from the date's data
function dateRaises(d){
  const cp = s => s.charAt(0).toUpperCase() + s.slice(1), o = [];
  Object.keys(d.stats||{}).forEach(k=>o.push(cp(k))); Object.keys(d.skills||{}).forEach(k=>o.push(TECH_LABEL[k]||cp(k)));
  if(d.sam) Object.keys(d.sam).forEach(k=>o.push('Sam: '+cp(k)));
  if(d.pop) o.push('Popularity'); if(d.lust) o.push('Lust'); if(d.lewd) o.push('Lewdness'); if(d.restores) o.push('Rest'); if(d.gift) o.push('Gift'); if(d.spicy) o.push('🔥');
  return o.join(', ');
}
function dateMenu(id){
  const w = findW(id); if(!w) return;
  modal(`<h2>Take ${esc(w.name)} out</h2><p class="muted">Dates build trust and mood. What she enjoys depends on her personality. A great date at high trust might not end at her door.</p>
    <table>${Object.entries(DATES).filter(([k,d])=>dateListed(w,d)).map(([k,d])=>{ const c = dateFor(k).cost, m = pmAny(w,d.like), r = dateRaises(d);
      return `<tr><td><b>${d.label}</b>${m>1?' <span class="good">♥ she\'d love this</span>':m<1?' <span class="warn">not her thing</span>':''}${r?`<br><span class="muted">${esc(r)}</span>`:''}</td><td>${c?fmt(c):'free'}</td><td class="muted">${d.energy} energy</td><td><button class="sm" onclick="${d.special==='chat'?`samChat('${id}')`:`samDate('${id}','${k}')`}" ${S.gold<c?'disabled':''}>Go</button></td></tr>`; }).join('')}</table>
    <div class="row"><button onclick="openSheet('${id}')">Back</button></div>`);
}
// Daring variants offered on a date (dates.json → spicy). With acts: the one she'd do (favorite, else the highest-th she's keen on, else the first she's comfortable with).
function spicyAct(w, sp){
  const ok = (sp.acts||[]).filter(a=>canSam(w,a)); if(!ok.length) return null;
  if(w.fav && ok.includes(w.fav)) return w.fav;
  const yes = ok.filter(a=>samStance(w,a)==='yes').sort((a,b)=>((actById(b)||{}).th||0) - ((actById(a)||{}).th||0));
  return yes[0] || ok[0];
}
const spicyOK = (w, sp) => w.lewd >= sp.lewd && (sp.nude ? comfortCloth(w, true, false)==='nude' : !!spicyAct(w, sp));
const spicyBtns = (id, k, list) => list.map(([sp,i])=>`<button onclick="samSpicy('${id}','${k}',${i})">🔥 ${esc(sp.label)}</button>`).join('');
function samDate(id, k){
  const w = findW(id); if(!w || !DATES[k]) return; const d = dateFor(k);
  if(d.special==='chat') return samChat(id);
  const cost = d.cost||0;
  if(S.gold<cost) return toast('Not enough gold.');
  if(!dateListed(w, d)) return toast(d.needsUp ? `${houseOf(w).name} needs a ${(UPGRADES[d.needsUp]||{label:d.needsUp}).label}.` : `${w.name} and Sam aren't there yet.`);
  if(!useAP(d.energy)) return; S.gold -= cost;
  const m = pmAny(w,d.like), tg = gainTrust(w, d.trust * (has(w,'Romantic')?1.4:1) * (d.trustMult||1) * m);
  moodAdd(w, d.mood*m - (m<1?3:0)); w.dates++;
  const lg = d.lewd ? lewdUp(w, d.lewd * (m>1 ? 1.25 : m<1 ? 0.6 : 1), d.lewdCap) : 0;
  if(d.lust){ w.lust += d.lust * fxMul(w,'lustBuild'); fitLust(w); }
  if(d.restores) w.energy = clamp(w.energy + d.restores, 0, maxEnergy(w));
  if(d.greedyMood && has(w,'Greedy')) moodAdd(w, d.greedyMood);
  Object.entries(d.stats||{}).forEach(([s,n])=>statXP(w, s, n));
  Object.entries(d.skills||{}).forEach(([s,n])=>grow(w, s, n));
  if(d.pop) w.popularity = clamp(w.popularity + d.pop);
  if(d.gift) countUp(w,'gifts');
  let trinket = '';
  if(d.trinket && Math.random() < d.trinket){ moodAdd(w, 5); countUp(w,'gifts'); trinket = `\n\nSam picks up ${pick(GIFTS)} for her on the way.`; }
  Object.entries(d.sam||{charm:1}).forEach(([s,n])=>samStat(s, n)); samXP(5); samLog(`${d.label} with ${w.name}`); checkUnlocks();
  save(); render(); closeModal();
  // a good date can end with her next first (when she's ready), or an invitation inside (once they're past that)
  const anyAct = getActs().some(a=>canSam(w,a.id));
  const first = m>=1 && w.mood>=60 && firstReadyAny(w) && Math.random() < 0.5 + Math.max(0, w.lust-50)/100;
  const nightIn = !first && d.special==='nightin' && anyAct;
  const spicy = !first && !nightIn && m>=1 && w.mood>=55 ? (d.spicy||[]).map((sp,i)=>[sp,i]).filter(([sp])=>spicyOK(w,sp)).slice(0,2) : [];
  // with 🔥 options the evening goes in two steps: the daring variant or calling it there, then (if it sparks) the invitation
  const twoStep = spicy.length > 0;
  DATE_AFTER = twoStep ? {id, k, m} : null;
  const sparks = nightIn || (!first && !twoStep && dateSparks(w, m));
  const txt = dateText(d, w) + trinket + `\n\n${cost?'−'+fmt(cost)+' · ':''}Trust ${tDelta(tg)}${lg>0?' · Lewdness +':''}${d.restores?' · She feels rested':''}`;
  const inviteTxt = nightIn ? `The fire burns low. ${w.name} looks up at Sam, and doesn't look away.` : dateAfterTxt(d, 'invite', w);
  modal(`<h2>${esc(d.label)} with ${esc(w.name)}</h2><div id="resImg"></div><p class="story">${esc(txt)}</p>
    ${sparks?`<div id="invImg"></div><div id="propAi"><p class="story pink">${esc(inviteTxt)}</p></div>`:''}
    ${first?`<p class="story pink">On the way back, something has shifted between them. ${esc(w.name)} keeps finding reasons to stand a little closer.</p>`:''}
    <div class="row">${first?`<button class="primary" onclick="firstFromDate('${id}')">♥ See where it goes</button><button onclick="closeModal()">Say goodnight</button>`
      :twoStep?`${spicyBtns(id,k,spicy)}<button class="primary" onclick="dateHome('${id}')">${esc(dateAfter(d).label)}</button>`
      :sparks?`<button class="primary" onclick="privateMenu('${id}',true)">Go inside (private time, no extra action)</button><button onclick="closeModal()">Say goodnight</button>`
      :`<button class="primary" onclick="closeModal()">OK</button>`}</div>`, twoStep ? {lock:true} : {});
  showImg('resImg', w.id, 'date_'+k);
  if(sparks) dateInviteFx(w, d);
}
// The second step after a date with 🔥 options (dates.json → _after): does the evening spark? Rolled when Sam gets there,
// so a daring detour (more lust) can tip it. Same odds as a plain date otherwise.
let DATE_AFTER = null;
const DATE_AFTER_TXT = needData('dates')._after || {};
const dateAfter = d => DATE_AFTER_TXT[d && d.home ? 'home' : 'away'] || {label:'Head home'};
const dateAfterTxt = (d, key, w) => { const t = dateAfter(d)[key]; return String((Array.isArray(t) ? pick(t) : t) || '').replace(/\{name\}/g, w.name); };
const dateSparks = (w, m) => w.trust>=60 && w.mood>=70 && m>=1 && getActs().some(a=>canSam(w,a.id)) && Math.random() < 0.35 + Math.max(0, w.lust-50)/100;
function dateInviteFx(w, d){
  showImg('invImg', w.id, 'invite');
  if(SET.ai.on && SET.ai.auto && getTextPlugin()) aiWrite('propAi', 'proposition', w.id, {scene:'invite', date:d.label.toLowerCase(), forSam:true});
}
// the invitation screen: private time or goodnight
function dateInvite(w, d){
  modal(`<h2>${esc(d.label)} with ${esc(w.name)}</h2><div id="invImg"></div><div id="propAi"><p class="story pink">${esc(dateAfterTxt(d, 'invite', w))}</p></div>
    <div class="row"><button class="primary" onclick="privateMenu('${w.id}',true)">${d.home?'Go up with her':'Go inside'} (private time, no extra action)</button><button onclick="closeModal()">Say goodnight</button></div>`);
  dateInviteFx(w, d);
}
// "Head home" / "Leave it there": the invitation if the evening sparks, otherwise a quiet goodnight
function dateHome(id){
  const A = DATE_AFTER, w = findW(id); DATE_AFTER = null;
  if(!w || !A || A.id !== id) return closeModal();
  const d = DATES[A.k];
  if(dateSparks(w, A.m)) return dateInvite(w, d);
  closeModal(); toast(dateAfterTxt(d, 'home', w));
}
// after the 🔥 variant's scene: on to the invitation, if the evening sparks
function dateAfterSpicy(id){
  const A = DATE_AFTER, w = findW(id); DATE_AFTER = null;
  if(!w || !A || A.id !== id) return closeModal();
  dateInvite(w, DATES[A.k]);
}
// A daring variant on a date (costs Sam 12 energy, no action). Only through canSam: privateCore for acts, a nude scene otherwise.
function samSpicy(id, k, i){
  const w = findW(id), d = DATES[k], sp = d && (d.spicy||[])[i]; if(!w || !sp) return;
  if(!spicyOK(w, sp)) return toast(`${w.name} isn't up for that.`);
  if(S.sam.energy < 12) return toast('Sam is too tired.');
  S.sam.energy -= 12;
  const lead = sp.lead.replace(/\{name\}/g, w.name), act = sp.nude ? null : spicyAct(w, sp), label = sp.label.toLowerCase() + ' on a date (' + d.label.toLowerCase() + ')';
  let text, scene, ai;
  if(act){
    text = privateCore(w, act, {lead, turn: (sp.acts||[]).length > 1}); lewdUp(w, sp.gain, sp.cap); scene = 'samact:'+act+'~~date_'+k+(sp.image ? '.'+i : '');
    ai = {kind:'private', act, scene, forSam:true, situation:label};
  } else {
    lewdUp(w, sp.gain, sp.cap); moodAdd(w, 4); w.lust += 6; fitLust(w); minorTrust(w); text = lead; scene = 'date_'+k;
    if(sp.image && sp.image.comp){ const di = d.image || {}, im = {comp:sp.image.comp, setting:sp.image.setting || di.setting, sam:true}; ['undress','bath','away','swim'].forEach(f=>{ if(di[f] != null) im[f] = di[f]; }); scene = dynScene('date_'+k+'_sp'+i, Object.assign(im, {label:d.label+': '+sp.label})) || scene; }
    ai = {kind:'private', scene, forSam:true, situation:label, cloth:'nude'};
  }
  if(Math.random() < (sp.risk||0)){
    if(has(w,'Exhibitionist')){ moodAdd(w, 5); lewdUp(w, 2, 95); text += `\n\nSomeone saw. ${w.name} looks far too pleased about it.`; }
    else { moodAdd(w, -5); text += `\n\nSomeone nearly walks in on them. ${w.name} is mortified, and laughing about it by the time they get home.`; }
    repAdd(houseOf(w), 0.5);
  }
  samLog(`${sp.label} with ${w.name} (${d.label})`); checkUnlocks(); save(); render(); closeModal();
  // the evening may not be over: if it sparks, the result screen leads on to the invitation; otherwise it ends here
  const A = DATE_AFTER && DATE_AFTER.id===id && DATE_AFTER.k===k ? DATE_AFTER : null;
  const more = A && dateSparks(w, A.m);
  if(!more){ DATE_AFTER = null; text += '\n\n' + dateAfterTxt(d, 'home', w); }
  showResult(`${sp.label}: ${w.name}`, text, w.id, scene, ai, more ? {label:'Continue ♥', onclick:`dateAfterSpicy('${id}')`} : null);
}
// One-on-one training (balance.json → train). Two kinds:
//  stats  - Sam coaches one of her 8 stats (STAT_KEYS; never popularity, lust or lewdness). Scales with his Wits (samBonus('wits')).
//  skills - Hospitality or a service she's comfortable with; scales with his Technique, costs more energy, and warms her up:
//           lust rises (services that spend lust spend it instead) and lewdness creeps up, but only below a threshold.
// One-on-one training (balance.json → train), no pickers: 'stat' coaches every stat her job uses, 'skill' every trade skill
// (her job's at full strength), 'service' practices every service she does with Sam.
const trainSkillOf = w => { const k = (JOBS[w.job]||{}).skill; return TECH_KEYS.includes(k) ? k : 'service'; };
// Madames and teachers (balance.json → train.broad) pick up a bit of everything: every stat, every skill.
const broadJob = w => (((BAL.train||{}).broad||{}).jobs||[]).includes(w.job);
const trainStatsOf = w => { const B = (BAL.train.stat||{}).byJob || {}, own = Object.entries(B[w.job] || B.default || {}).filter(([k])=>STAT_KEYS.includes(k));
  if(!broadJob(w)) return own; const o = Object.fromEntries(own); return STAT_KEYS.map(k=>[k, o[k] ?? (BAL.train.broad.stat ?? 0.4)]); };
function samTrain(id, mode='skill'){
  const w = findW(id); if(!w) return;
  const T = BAL.train || {}, tm = pm(w,'train'), learn = fxMul(w,'learn');
  // warming up: a little lust and lewdness, the lewdness only while she's below the threshold (lewdCap, 0-100)
  const SK = T.skill || {}, lewdCap = (T.service||{}).lewdCap ?? 50;
  const warm = (lust, lewd, cap) => { const l0 = w.lust; w.lust += lust * (0.4 + w.lewd/100) * fxMul(w,'lustBuild'); fitLust(w); if(w.lewd < lewdCap) lewdUp(w, lewd, Math.min(cap, lewdCap)); return Math.round(w.lust - l0); };
  if(mode==='stat'){
    const ST = T.stat || {}, list = trainStatsOf(w);
    if(!useAP(ST.energy ?? 20)) return;
    const g = ((ST.base ?? 12) + (S.sam.wits||0) * (ST.perWits ?? 0.2)) * samBonus('wits') * tm * learn * (hasPast('tutor') ? 1.2 : 1) * (ST.spread ?? 0.5);
    const got = list.map(([k,wt])=>{ const v0 = w.stats[k]; statXP(w, k, g*wt); return `${cap(k)} +${Math.round(w.stats[k] - v0)}`; });
    minorTrust(w); w.energy = clamp(w.energy - (ST.herEnergy ?? 10), 0, maxEnergy(w)); if(tm<1) moodAdd(w, -3);
    samStat('wits',1); samXP(5); samLog(`Coached ${w.name}`);
    save(); render(); closeModal();
    const k0 = (list.slice().sort((a,b)=>b[1]-a[1])[0]||['charm'])[0];
    const line = pick((((typeof FLAVOR!=='undefined' && FLAVOR.train_stat) || {})[k0]) || ['']).replace(/\{name\}/g, w.name);
    return showResult(`Coaching ${w.name}`, `${line || `Sam and ${w.name} spend the afternoon working on what her job asks of her.`} Sam takes detailed notes, as is tradition.${pNote(w,'train')}\n\n${got.join(' · ')} · Sam's Wits +1`, w.id, 'sam_training', {kind:'train', label:k0, scene:'sam_training'});
  }
  const tq = (S.sam.technique||0), tm2 = (hasPast('massage') ? 1.3 : 1) * tm * learn;
  if(mode==='service'){
    const SV = T.service || {}, acts = getActs().filter(a=>canSam(w,a.id) && w.acts[actKey(a.id)]);
    if(!acts.length) return toast((w.intim||0)===0 ? `${w.name} and Sam haven't crossed that line yet.` : `${w.name} isn't comfortable with that yet.`);
    if(!useAP(SV.energy ?? 30)) return;
    const g = ((SV.base ?? 6) + tq * (SV.perTech ?? 0.05)) * tm2 * (SV.share ?? 0.4), hot = lustBonus(w, BAL.lust.bonus.trainMult);
    acts.forEach(a=>{ growAct(w, a.id, g * (w.fav===a.id ? 1.25 : 1)); if(w.dislike===a.id) moodAdd(w, -2); });
    const lu = warm(SV.svcLust ?? 6, SV.lewd ?? 2, Math.max(...acts.map(a=>svcLewdCap(a.id,'sam'))));
    const tgp = minorTrust(w); statXP(w, 'stamina', 1.5); countUp(w, 'privateSam');
    w.energy = clamp(w.energy-(SV.herEnergy ?? 16), 0, maxEnergy(w));
    samStat('technique',2); samXP(5); w.privateCount++; w._samTime=(w._samTime||0)+1; samLog(`Practiced with ${w.name}`); checkUnlocks();
    save(); render(); closeModal();
    const show = acts.find(a=>a.id===w.fav) || acts[acts.length-1], sl = actLine(show.id, w);
    return showResult(`Practice with ${w.name}`, `${flavor('train_service', w) || `${w.name} decides Sam's education is a shared project.`}${sl ? '\n\n'+sl : ''}${hot?'\n\n'+hot:''}\n\n${acts.map(a=>a.label).join(', ')}: skill +${Math.round(g*SKL)} each · Lust +${lu}${w.lewd < lewdCap ? ' · Lewdness +' : ''} · Trust ${tDelta(tgp)} · Sam's Technique +2`, w.id, 'samact:'+show.id, {kind:'train', act:show.id, scene:'samact:'+show.id, forSam:true});
  }
  // every trade skill, hands-on: her job's skill (Hospitality without one) at full strength, the rest x skill.others
  if(!useAP(SK.energy ?? 30)) return;
  const main = trainSkillOf(w), g = ((SK.base ?? 4) + tq*(SK.perTech ?? 0.04)) * tm2, oth = broadJob(w) ? (T.broad.skillOthers ?? 0.6) : (SK.others ?? 0.35);
  const got = TECH_KEYS.map(k=>{ const v0 = w.tech[k]; grow(w, k, g * (k===main ? 1 : oth)); return `${TECH_LABEL[k]} +${Math.round(w.tech[k]-v0)}`; });
  statXP(w, 'charm', g*0.6); gainTrust(w, 1);
  w.energy = clamp(w.energy-(SK.herEnergy ?? 14), 0, maxEnergy(w)); if(tm<1) moodAdd(w, -3); samStat('technique',1); samXP(5); samLog(`Trained ${w.name}`);
  save(); render(); closeModal();
  showResult(`Training ${w.name}`, `${trainSkillLine(w, main)} Sam takes detailed notes, as is tradition.${pNote(w,'train')}\n\n${got.join(' · ')} · Sam's Technique +1`, w.id, 'sam_training', {kind:'train', label:TECH_LABEL[main].toLowerCase(), scene:'sam_training'});
}
// Demonstration class (balance.json → lessons.demo): Sam and a partner show the others how it's done. She has to be open to an
// audience (lewdness >= openLewd or Exhibitionist, never Modest) and the service goes through canSam/bestSamAct like any time with Sam.
function demoAct(w){ return bestSamAct(w) || null; }
function demoOpen(w){ const D = (BAL.lessons||{}).demo || {}; if(has(w,'Modest')) return false; return has(w,'Exhibitionist') || w.lewd >= (D.openLewd ?? 45); }
function demoMenu(){
  const D = (BAL.lessons||{}).demo || {};
  const ok = S.workers.filter(w=>demoAct(w) && demoOpen(w)), shy = S.workers.filter(w=>demoAct(w) && !demoOpen(w));
  modal(`<h2>A Demonstration</h2><p class="muted">Sam and a partner show the staff how it's done. Everyone watching learns that service and gets worked up; she does her favorite (or the furthest they've gone). She has to be comfortable with an audience. Repeat partners may develop a taste for it. (${D.energy ?? 30} energy)</p>
    ${ok.length ? `<div class="row">${ok.map(w=>`<button onclick="samDemo('${w.id}')">${esc(titled(w))} · ${esc(actLabel(demoAct(w)))}</button>`).join('')}</div>` : '<p>Nobody is ready for an audience yet.</p>'}
    ${shy.length ? `<p class="muted">Not in front of everyone: ${shy.map(w=>esc(w.name)+(has(w,'Modest')?' (modest)':'')).join(', ')}</p>` : ''}
    <div class="row"><button onclick="closeModal()">Back</button></div>`);
}
function samDemo(id){
  const w = findW(id), D = (BAL.lessons||{}).demo || {}; if(!w) return;
  const act = demoAct(w); if(!act || !demoOpen(w)) return toast(`${w.name} isn't up for that.`);
  if(!useAP(D.energy ?? 30)) return;
  const text = privateCore(w, act, {lead: flavor('demo_lead', w)});
  countUp(w, 'demos'); lewdUp(w, 1, svcLewdCap(act,'client') + 10);
  const g = (6 + (S.sam.technique||0)/20) * (D.watchSkill ?? 0.5) * lessonMul(), cap0 = svcLewdCap(act,'client'), watchers = S.workers.filter(o=>o!==w);
  let warm = 0;
  watchers.forEach(o=>{
    growAct(o, act, g * pm(o,'train') * fxMul(o,'learn'));
    if(has(o,'Modest')){ moodAdd(o, D.modestMood ?? -3); return; }
    o.lust += (D.watchLust ?? 8) * (0.4 + o.lewd/100) * fxMul(o,'lustBuild'); fitLust(o); lewdUp(o, D.watchLewd ?? 1.5, cap0); countUp(o, 'lessons'); warm++;
  });
  samStat('technique', 2); samStat('charm', 1); samLog(`Demonstration with ${w.name} [${actLabel(act)}]`);
  checkUnlocks(); save(); render(); closeModal();
  showResult(`A Demonstration: ${actLabel(act)}`, `${text}\n\n${flavor('demo_watch', w)}\n\n${watchers.length} watched and learned ${actLabel(act).toLowerCase()} (+${Math.round(g*SKL)} each)${warm?` · ${warm} got rather worked up (lust, lewdness)`:''}${watchers.length>warm?` · the modest ones spent it staring at the ceiling`:''} · Sam's Technique +2`, w.id, 'demo:'+act, {kind:'private', act, scene:'demo:'+act, forSam:true, situation:`a demonstration lesson: she and Sam show the other ladies of the house how it's done while they watch`});
}
// Group nights (balance.json → orgy): one action, Sam's energy per lady, 2-5 ladies from one house (any house, unless samReach()).
// Each lady goes through canSam/bestSamAct and privateCore like any private time; every pair bonds; longer text and several pictures.
let ORGY = null;
const orgyCost = n => { const O = BAL.orgy || {}; return Math.round((O.perGirl ?? 20) * n + (O.ramp ?? 0) * n * (n-1) / 2); };
function orgyOpen(w){ const O = BAL.orgy || {}; return !has(w,'Modest') && (w.lewd >= (O.openLewd ?? 50) || has(w,'Exhibitionist') || w.lust >= LUST_EAGER); }
function orgyWhy(w){ const O = BAL.orgy || {};
  if(!orgyAct(w)) return (w.intim||0)===0 ? "she and Sam haven't crossed that line" : "not comfortable with Sam yet";
  if(has(w,'Modest')) return 'too modest to share'; if(!orgyOpen(w)) return 'not ready to share him';
  if(w.energy < (O.minEnergy ?? 15)) return 'too tired'; return ''; }
// what she does on a group night: her favorite if it goes past the first tier, else her lovers-only one or a pick from the furthest tier she's comfortable with
function orgyAct(w){ const ok = id => id && canSam(w,id) && samStance(w,id)==='yes';
  if(ok(w.fav) && actTier(w.fav) >= 2) return w.fav;
  const all = getActs().filter(a=>ok(a.id)); if(!all.length) return bestSamAct(w);
  const top = Math.max(...all.map(actTierOf)), pool = all.filter(a=>actTierOf(a)===top);
  return (ok(w.lovers) && pool.some(a=>a.id===w.lovers)) ? w.lovers : pick(pool).id; }
function orgyMenu(){ ORGY = {sel:[]}; orgyDraw(); }
function orgyPick(id){ if(!ORGY) return; const O = BAL.orgy || {}, i = ORGY.sel.indexOf(id);
  if(i >= 0) ORGY.sel.splice(i, 1);
  else { const w = findW(id), first = ORGY.sel[0] && findW(ORGY.sel[0]);
    if(first && !samReach() && first.house !== w.house) ORGY.sel = [];   // one house at a time without reach
    if(ORGY.sel.length >= (O.max ?? 5)) return toast(`${O.max ?? 5} is plenty. More than plenty.`);
    ORGY.sel.push(id); }
  orgyDraw(); }
function orgyDraw(){
  const O = BAL.orgy || {}, sel = ORGY.sel, n = sel.length, cost = orgyCost(n), first = sel[0] && findW(sel[0]);
  const btn = w => { const why = orgyWhy(w), on = sel.includes(w.id), other = first && !samReach() && first.house !== w.house;
    return `<button class="${on?'primary':''}" ${why?`disabled title="${esc(why)}"`:''} onclick="orgyPick('${w.id}')" ${other?'style="opacity:.6"':''}>${on?'✓ ':''}${esc(titled(w))}${why?` <span class="muted">(${esc(why)})</span>`:''}</button>`; };
  const houses = S.houses.map(h=>{ const ws = S.workers.filter(w=>w.house===h.id && (orgyAct(w) || (w.intim||0) > 0)); return ws.length ? `<h3 style="margin-top:8px">${esc(h.name)}</h3><div class="row">${ws.map(btn).join('')}</div>` : ''; }).join('');
  modal(`<h2>Gather the girls</h2><p class="muted">One night, ${O.min ?? 2}-${O.max ?? 5} ladies. Each does the furthest she's comfortable with (or her favorite) with Sam (spending her lust), and everyone gets closer to everyone. ${samReach()?'Sam can bring them together from any house.':'All from one house (picking someone from another house starts over).'} One action; ${O.perGirl ?? 20} of Sam's energy per lady.</p>
    ${houses || '<p>Nobody is there yet with Sam.</p>'}
    <div class="row" style="margin-top:10px"><button class="primary" ${n < (O.min ?? 2) || S.sam.energy < cost || S.ap <= 0 ? 'disabled' : ''} onclick="samOrgy()">🔥 Tonight (${n} · ${cost} energy${S.sam.energy < cost ? ', Sam is too tired' : ''})</button><button onclick="ORGY=null;closeModal()">Back</button></div>`);
}
function samOrgy(){
  const O = BAL.orgy || {}, ws = (ORGY ? ORGY.sel : []).map(findW).filter(w=>w && !orgyWhy(w));
  if(ws.length < (O.min ?? 2)) return toast('Not enough company for that.');
  if(!samReach() && ws.some(w=>w.house !== ws[0].house)) return toast('They need to be in the same house.');
  if(!useAP(orgyCost(ws.length))) return;
  ORGY = null;
  const first = ws[0], names = ws.map(w=>w.name.split(' ')[0]), list = names.length > 1 ? names.slice(0,-1).join(', ') + ' and ' + names[names.length-1] : names[0];
  const C = {names:list, first:names[0], house:houseOf(first).name};
  const beats = ws.map(w=>{ const act = orgyAct(w), line = privateCore(w, act, {lead:''});
    lewdUp(w, O.lewd ?? 2, svcLewdCap(act,'sam') + (O.lewdCapPlus ?? 10)); moodAdd(w, O.mood ?? 4); countUp(w, 'orgies');
    return {w, act, text: line + (has(w,'Devoted') ? '\n\n' + flavor('orgy_lover', w) : '')}; });
  for(let i=0;i<ws.length;i++) for(let j=i+1;j<ws.length;j++) addBond(ws[i], ws[j], O.bond ?? 6);
  const pairs = []; const P = ws.slice().sort(()=>Math.random()-0.5);
  for(let i=0;i+1<P.length && pairs.length<2;i+=2) pairs.push(flavor('orgy_pair', P[i], {a:P[i].name.split(' ')[0], b:P[i+1].name.split(' ')[0]}));
  samLog(`A night with ${list}`); checkUnlocks(); save(); render();
  const scene = 'orgy:' + ws.map(w=>w.id).join(',');
  modal(`<h2>A Night with ${esc(list)}</h2><div id="resImg"></div>
    <p class="story">${esc(flavor('orgy_lead', first, C))}</p>
    ${beats.map((b,i)=>`<h3 style="margin-top:10px">${esc(b.w.name)} <span class="muted">· ${esc(actLabel(b.act))}</span></h3><p class="story">${esc(b.text)}</p><button class="sm" id="og${i}_t" onclick="toggleImgBtn('og${i}','${b.w.id}','samact:${b.act}')">🖼 Show image</button><div id="og${i}" class="hlimg" data-ext="1"></div>`).join('')}
    ${pairs.length ? `<p class="story">${esc(pairs.join(' '))}</p>` : ''}
    <p class="story">${esc(flavor('orgy_end', first, C))}</p>
    <p class="muted">Everyone: lust spent, lewdness +, mood + · Bonds +${O.bond ?? 6} between every pair · ${orgyCost(ws.length)} of Sam's energy</p>
    ${SET.ai.on?'<div id="resAi"></div>':''}<div class="row">${aiBtn('resAi','private',first.id,{act:beats[0].act, scene, forSam:true, situation:`a night together: Sam with ${list} all at once`})}<button class="primary" onclick="closeModal()">OK</button></div>`);
  $('#modal').scrollTop = 0; showImg('resImg', first.id, scene);
}
function privateMenu(id, free){
  const w = findW(id); if(!w) return;
  const opts = getActs().filter(a=>canSam(w,a.id));
  if(!opts.length) return toast((w.intim||0)===0 ? `${w.name} and Sam haven't crossed that line yet.` : `${w.name} isn't comfortable with that yet.`);
  const kp = knowsPrefs(w);
  modal(`<h2>Private time with ${esc(w.name)}</h2><p class="muted">What she's comfortable with, with you, as far as you two have gone (${esc(stageName(w.intim)||'nothing yet')}). ${kp?'★ = her favorite.':''}</p>
    <div class="row">${opts.map(a=>`<button onclick="samPrivate('${id}','${a.id}',${free?'true':'false'})">${esc(a.label)}${kp&&w.fav===a.id?' ★':''}${samStance(w,a.id)==='ask'?' ~':''}</button>`).join('')}</div>
    <p class="muted">~ = she'll do it for Sam, but it's a stretch for her (less mood, more lewdness).</p>
    <div class="row"><button onclick="${free?'closeModal()':`openSheet('${id}')`}">Back</button></div>`);
}
function samPrivate(id, act, free){
  const w = findW(id); if(!w) return;
  if(!canSam(w,act)) return toast(`${w.name} isn't comfortable with that yet.`);
  const recv = (actById(act)||{}).kind==='receive';   // receiving services: Sam does the work, and tires less
  if(free){ const c = recv ? 8 : 15; if(S.sam.energy<c) return toast('Sam is too tired.'); S.sam.energy -= c; } else if(!useAP(recv ? 15 : 30)) return;
  const text = privateCore(w, act);
  checkUnlocks(); save(); render(); closeModal();
  showResult(`Private Time with ${w.name}`, text, w.id, 'samact:'+act, {kind:'private', act, scene:'samact:'+act, forSam:true});
}
// Shared effects of private time with Sam (used by the action, encounters, firsts and reckless nights). Returns the story text.
// o.lead: the moment's own opening (encounters, firsts); it replaces the generic lines, and a short line for the service follows.
function privateCore(w, act, o={}){
  const stretch = samStance(w,act)==='ask', A = actById(act) || {}, recv = A.kind==='receive';
  const fromLewd = !stretch && w.lewd >= w.trust;
  const builds = (A.lust ?? -1) >= 0;   // giving, kissing, massages: she isn't the one being pleased, so her lust rises (more the lewder she is)
  const hot = lustBonus(w);
  let ld;
  if(builds){ const l0 = w.lust; w.lust += Math.max(2, A.lust*3) * (0.4 + w.lewd/100) * fxMul(w,'lustBuild'); fitLust(w); ld = -Math.round(w.lust - l0); }
  else ld = spendLust(w, BAL.lust.drop.private * (recv ? 1.8 : 1) * samRelease());   // receiving: a big drop in her lust; Sam's technique decides how much
  growAct(w, act, (4 + S.sam.technique/20) * (hasPast('massage')?1.3:1)); statXP(w, 'stamina', 0.8); countUp(w, 'privateSam');
  if(stretch){ lewdUp(w, 4, svcLewdCap(act,'sam') + BAL.lewd.stretchCap); minorTrust(w); } else if(fromLewd){ lewdUp(w, 2, svcLewdCap(act,'sam')); minorTrust(w, 2); } else gainTrust(w, 2);
  moodAdd(w, (stretch?1:6)*pm(w,'private') + (w.fav===act?6:0) - (w.dislike===act?6:0)); w.energy = clamp(w.energy-(recv ? 6 : 15), 0, maxEnergy(w));
  let fed = '';
  if(w.race==='demon' && A.finish){ w.energy = clamp(w.energy + SVC.demon.samGain, 0, maxEnergy(w)); S.sam.energy = Math.max(0, S.sam.energy - Math.round(SVC.demon.samExtra * sigilDrain(w))); fed = `\n\n(${w.name} fed on him. Sam is much more tired than usual. Energy +${SVC.demon.samGain} for her.)`; }
  if(w.race==='demon' && A.kind==='kiss'){   // a kiss is a small sip; an eager demon draws harder
    const D = SVC.demon, deep = w.lust >= LUST_EAGER, g = D.kissSam + (deep ? D.kissSamDraw : 0);
    w.energy = clamp(w.energy + g, 0, maxEnergy(w)); S.sam.energy = Math.max(0, S.sam.energy - (deep ? Math.round(D.kissSamCost * sigilDrain(w)) : 0));
    fed = `\n\n(${w.name} drinks a little of him with every kiss${deep ? ', and tonight she drinks deep. Sam is a bit lightheaded afterward' : ''}. Energy +${g} for her.)`; }
  if(w.lovers===act) gainTrust(w, 2);
  samStat('technique',3); samXP(5); w.privateCount++; w._samTime = (w._samTime||0) + 1;
  samLog(`Private time with ${w.name} [${actLabel(act)}]`);
  let text;
  if(o.lead!==undefined){
    text = [o.lead, o.turn === false ? '' : actTurn(act, w), actLine(act, w)].filter(Boolean).join('\n\n');
    if(S.sam.first && actTier(act)>=2){ S.sam.first = false; text += `\n\n${pick(FLAVOR.sam_first._default).replace(/\{name\}/g, w.name)}`; }
  } else {
    // plain private time: an opening (flavor.json → private_first_sam / private_first / private_open), the turn it takes, then the service's own line
    const firstSam = S.sam.first && actTier(act)>=2; if(firstSam) S.sam.first = false;
    const open = flavor(firstSam ? 'private_first_sam' : w.privateCount===1 ? 'private_first' : 'private_open', w);
    text = [open, actTurn(act, w), actLine(act, w)].filter(Boolean).join('\n\n');
  }
  if(w.lovers===act && !o.first) text += `\n\n${w.name} wouldn't do this with a client. With Sam, it's different.`;
  if(w.fav===act && knowsPrefs(w)) text += `\n\n(Her favorite. She's in a very good mood afterward.)`;
  text += pNote(w,'private');
  if(stretch) text += `\n\n(This was a stretch for ${w.name}. She did it for Sam, and it's a little less of a stretch now.)`;
  if(hot) text += `\n\n${hot}`;
  text += fed;
  text += `\n\n[${actLabel(act)}] skill + · ${stretch||fromLewd?'Lewdness + · Trust +':'Trust +'} · Lust ${ld < 0 ? '+'+(-ld) : '−'+ld} · Sam's Technique +3`;
  // worked up by it, she may want more: something that actually spends it, if they've crossed that far
  if(builds && !o.more && w.lust >= LUST_EAGER && w.lewd >= SVC.askMore.lewd){
    const ids = getActs().filter(a=>(a.lust ?? -1) < 0 && canSam(w, a.id)).map(a=>a.id);
    if(ids.length){ const id2 = ids.includes(w.lovers) ? w.lovers : ids.includes(w.fav) ? w.fav : pick(ids);
      text += '\n\n' + privateCore(w, id2, {lead:`${w.name} isn't done. She pulls Sam closer and tells him, quietly and very clearly, what she wants next.`, more:true}); }
  }
  return text;
}
// Demons: Sam pays for a stud for the night, so she can feed her fill without anyone getting hurt (once a week).
function hireStud(id){
  const w = findW(id), D = SVC.demon; if(!w || w.race!=='demon') return;
  if(w._stud===S.week) return toast(`${w.name} has already had her night this week.`);
  if(S.gold < D.studCost) return toast('Not enough gold.');
  S.gold -= D.studCost; w._stud = S.week;
  const g = Math.min(D.studGain, maxEnergy(w) - w.energy); w.energy = clamp(w.energy + D.studGain, 0, maxEnergy(w)); const ld = spendLust(w, D.studLust); moodAdd(w, 4); gainTrust(w, 1);
  samLog(`Paid for a stud for ${w.name}`); save(); render(); closeModal();
  showResult('A Night Off the Menu', pick([
    `Sam quietly books ${w.name} a night with a broad-shouldered professional from across town who knows exactly what he's signing up for and is paid accordingly. She comes down to breakfast radiant. He leaves at noon, cheerful and very, very sleepy.`,
    `Sam finds ${w.name} a willing stud for the night: a retired gladiator with stamina to spare and a fee to match. Nobody gets drained into a faint, nobody's reputation suffers, and ${w.name} hums all the next morning.`]) + `\n\nEnergy +${Math.round(g)} · Lust −${ld} · Mood + · Trust + · −${fmt(D.studCost)}`, w.id, 'casual', null);
}
function samGuild(){
  if(!useAP(20)) return;
  const g = S.flags.guild; let text='', wid=null, scene=null;
  if(g===0){
    S.flags.guild = 1; text = `A freckled receptionist practically vaults the counter when she hears what Sam does for a living. "You own a pleasure house? I'm Hanna! Parties come back from dungeons with full purses and nowhere to spend them. Let's talk."\n\nGuild contracts unlocked.`;
    const h = makeNamed('hanna'); h.id='npc_hanna'; NPCS.npc_hanna = h; wid='npc_hanna'; scene='portrait';
  } else if(g===1 && !isHired('rhoswen')){
    S.flags.guild = 2; const r = makeNamed('rhoswen'); r.signing = signingFor(r); S.candidates.push(r);
    text = `Hanna leans in. "So. There's an elf. Very proper, very lost, asking about work in places elves do NOT ask about. I may have mentioned you."\n\nRhoswen has been added to your candidates.`; wid = r.id; scene='portrait';
  } else if(g>=1 && g<3 && S.rep>=30 && !isHired('hanna')){
    S.flags.guild = 3; const h = makeNamed('hanna'); h.signing = 40; S.candidates.push(h);
    text = `Hanna slides her resignation letter across the counter to her own supervisor, then turns to Sam. "Your reception desk is a disgrace and I have opinions. When do I start?"\n\nHanna has been added to your candidates.`; wid = h.id; scene='portrait';
  } else {
    if(g===1) S.flags.guild = 2;
    addCandidates(1, 1.1); samXP(6);
    text = S.flags.guild===2 ? `Hanna gives Sam the week's gossip and points out a promising job-seeker. "Come back when you've got a better reputation. I have... reasons."\n\n+1 candidate` : `Hanna points out a promising job-seeker and fills Sam in on the week's gossip.\n\n+1 candidate`;
  }
  samXP(4); samLog('Visited the Adventurers\' Guild'); save(); render();
  showResult('The Adventurers\' Guild', text, wid, scene);
}

/* ---------- ending things / trying again ---------- */
function endLovers(id){
  const w = findW(id); if(!w || !has(w,'Devoted')) return;
  if(!confirm(`End things with ${w.name}? She'll stay on at the house, but it will hurt.`)) return;
  const B = BAL.breakup, starter = w.key && (S.partners||[S.partner]).includes(w.key);
  w.traits = w.traits.filter(t=>t!=='Devoted'); w.exLover = true; w.rekindleWk = S.week; w.neglect = 0;
  moodAdd(w, B.mood); w.trust = clamp(w.trust + B.trust * (has(w,'Loyal') ? 0.5 : 1));
  if(!starter){ w.isPartner = false; w.wage = wageFor(w); w.contract = 12; }
  samLog(`Ended things with ${w.name}`); save(); render(); closeModal();
  showResult(`${w.name}`, flavor('breakup', w) + `\n\n(No longer Devoted. Mood ${B.mood}, trust ${tDelta(B.trust*(has(w,'Loyal')?0.5:1))}.${starter?' She still works without wages.':` She now draws a wage of ${fmt(w.wage)}/wk on a 12-week contract.`})`, w.id, 'portrait', {kind:'breakup', wid:w.id});
}
function rekindle(id){
  const w = findW(id), B = BAL.breakup; if(!w || !w.exLover || has(w,'Devoted')) return;
  if(w.trust < B.rekindleTrust) return toast(`${w.name} isn't ready for that conversation.`);
  if(S.week - (w.rekindleWk||0) < B.rekindleCooldown) return toast(`Too soon. Give her a few more weeks.`);
  if(!useAP(15)) return;
  w.rekindleWk = S.week;
  const yes = Math.random() < B.rekindleChance + (w.mood-50)/200 + (has(w,'Romantic')?0.1:0);
  if(yes){ w.traits.push('Devoted'); w.exLover = false; w.isPartner = true; w.wage = 0; w.contract = 999; moodAdd(w, 10); }
  else moodAdd(w, -3);
  samLog(`Asked ${w.name} to try again`); save(); render(); closeModal();
  showResult(yes ? `${w.name}, Again` : `Not Yet`, flavor(yes ? 'rekindle_yes' : 'rekindle_no', w) + (yes ? `\n\n(${w.name} is Sam's lover again.)` : ''), w.id, yes ? 'sam_date' : 'portrait');
}
