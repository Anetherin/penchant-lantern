'use strict';
/* =====================================================================
   SAM
   ===================================================================== */
function useAP(cost=20){
  if(S.over) return false;
  if(S.ap<=0){ toast('Sam is out of rest-day actions. Work the nights to continue.'); return false; }
  if(S.sam.energy<cost){ toast('Sam is too tired. Have him rest, or work the nights.'); return false; }
  S.ap--; S.sam.energy -= cost; samGainXP(6); return true;
}
// Do the books: share of upkeep cut this week (Business, the ledger tool, and the office worker's spreadsheet habit). Capped at 60%.
const booksCut = () => Math.min(0.6, 0.1 + S.sam.business*0.003 + samUpFx('books') + (hasPast('salaryman') ? 0.1 : 0) + (hasChallengePerk('iron_ledger') ? 0.08 : 0));
const samLog = t => S.samWeek.acts.push(t);
const xpNeed = l => 60 + 40*l;
const apMax = () => 3 + Math.floor((S.sam.lvl||1)/5) + (hasBoon('ap')?1:0) + (hasChallengePerk('starlight_debt')?1:0);   // +1 action every 5 levels (5, 10, 15, 20...)
// Sam's stats (0-100). Each also works passively (balance.json → sam.bonus, x stat/100): Charm → trust the ladies gain (gainTrust, at Sam's house unless samReach),
// Business → Office focus and town deals (no passive income), Strength → Watch focus security, guild contracts and weekly recovery, Wits → stat training and
// Appraisal XP, Technique → service skills he teaches and how much he satisfies (samRelease).
const SAM_STATS = ['charm','business','strength','wits','technique'];
const samBonus = (k, stat=k) => 1 + (((BAL.sam||{}).bonus||{})[k] || 0) * ((typeof S!=='undefined' && S && S.sam ? S.sam[stat] : 0) || 0) / 100;
const SAM_BONUS_TIP = {charm:'More trust from everything the ladies do with him (at his house without Reach)', business:'Office focus: cuts upkeep and pairs clients; better deals in town and in stories', strength:'Watch focus and guild contracts; recovers more energy each week', wits:'Stat training goes further; Appraisal XP', technique:'Service practice goes further; leaves her more satisfied'};
function samBonusLine(){
  const p = k => Math.round((samBonus(k) - 1)*100), B = (BAL.sam||{}).bonus||{}, where = samReach() ? 'every house' : (typeof samHouse==='function' && samHouse() ? esc(samHouse().name) : 'his house');
  return `<br>Always on: Charm +${p('charm')}% trust gained (${where}) · Strength +${Math.round((samBonus('rest','strength')-1)*100)}% weekly recovery · Wits +${p('wits')}% stat training and Appraisal XP · Technique: better service practice.`;
}
// Walk/event gold payouts vary randomly around base and scale gently with the relevant Sam stat.
function samGold(base, stat='business', spread=0.2){
  const v = Math.max(0, (typeof S!=='undefined' && S && S.sam ? S.sam[stat] : 0) || 0);
  return Math.max(1, Math.round(base * rnd(1 - spread, 1 + spread) * (0.8 + v / 160)));
}
// Max energy grows with each New Game+ cycle (balance.json → sam.energyPerCycle).
const samMaxEnergy = () => 100 + ((BAL.sam||{}).energyPerCycle || 0) * Math.max(0, ((typeof S!=='undefined' && S ? S.cycle : 1) || 1) - 1) + (hasChallengePerk('iron_ledger') ? 15 : 0) + townAdd('samEnergy', 0) - (typeof lingerEnergyCut==='function' ? lingerEnergyCut() : 0);
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
const samWorkCost = (base=25) => Math.max(5, base - samUpFx('workEnergy'));
const samTrainCost = (base=20) => Math.max(5, base - samUpFx('trainEnergy'));
const samDateCost = (base=15) => Math.max(4, base - samUpFx('dateEnergy'));
const samPrivCost = (base=15, free=false) => Math.max(4, base - Math.round(samUpFx('privEnergy') * (free ? 0.5 : 1)));
function samWork(kind){
  if(!['rounds','scout'].includes(kind)) return;   // bar, watch, books and classes are a weekly focus now (focus.js)
  if(!useAP(samWorkCost(25))) return;
  let title='', text='';
  if(kind==='rounds'){
    // a word with everyone: small trust and mood for ladies at Sam's house (every house with the Teleport Circle)
    const B = BAL.sam, rm = 1 + samUpFx('rounds'), rt = B.roundsTrust * rm, rmood = B.roundsMood * rm; let n = 0;
    S.workers.filter(nearSamV).forEach(w=>{ gainTrust(w, rt); moodAdd(w, rmood); n++; });
    samStat('charm',1);
    title='Making the Rounds'; text=`You walk through ${samVisitReach()?'every house':samHouse().name} with a notebook, asking everyone how they're doing and actually writing down the answers. A leaky window gets fixed, someone's favorite tea gets restocked, and the whole staff notices that you noticed.\n\n${n} ladies: trust ${tDelta(rt)}, mood +${Math.round(rmood*10)/10} · Sam's Charm +1`;
    samLog('Made the rounds');
  } else if(kind==='scout'){
    const nc = 2 + Math.round(samUpFx('scout')), ng = addCandidates(nc, 1.1 + S.sam.business/400); samXP(10); samStat('charm',1); samStat('wits',1);   // guests can turn up like in the weekly refresh (candBatch)
    title='Scouting'; text=`You walk the market and the guild hall, quietly using [Appraisal] on anyone who looks like they might want a job.${ng?` One of them isn't from around here.`:''}\n\n+${nc} candidates${ng?` (${ng} guest${ng>1?'s':''})`:''} · Appraisal XP +${Math.round(10*samBonus('wits'))} · Sam's Wits +1`;
    samLog('Scouted for recruits');
  }
  save(); render(); showResult(title, text);
}
function samRest(){
  if(S.ap<=0) return toast('No actions left this week.');
  S.ap--; const nap = samRecover(BAL.samHome.nap); samEnergyAdd(nap); samLog('Rested'); save(); render();
  const v = restVisitor();
  if(v) return restEncounter(v);
  showResult('Nap Time', 'You take a long nap. In your dreams, a truck honks at you. You wake up and decide not to think about it.\n\nEnergy +'+nap);
}
function samChat(id){
  const w = findW(id), d = DATES.chat; if(!w || !useAP(samDateCost(d.energy))) return;
  const m = pmAny(w,d.like), tg = gainTrust(w, d.trust * rnd(0.6,1.4) * (hasPast('support') ? 1.2 : 1) * (has(w,'Romantic')?1.4:1) * (has(w,'Shy')?1.2:1) * m);
  moodAdd(w, d.mood*m - (m<1?3:0)); w._samTime = (w._samTime||0) + 1; samStat('charm',1); samXP(5); samLog(`Chatted with ${w.name}`); checkUnlocks();
  save(); render(); closeModal();
  const topic = ET('chat', NAMED[w.key] && Object.values(NAMED[w.key].bonds||{}).some(x=>x.kind==='home') || ['yui','natsuki','kanako','akari','lara','ella','emily'].includes(w.key) ? 'home' : (S.cycle||1)>=2 && Math.random()<0.3 ? 'ng' : 'topics');
  showResult(`Chatting with ${w.name}`, `You and ${w.name} talk ${topic}.\n\nTrust ${tDelta(tg)}`, w.id, null);
}
// a short line for the service itself, used after encounter and first-time openings (flavor.json → private_act)
const actLine = (act, w) => { const L = byAct(FLAVOR.private_act, act); return L && L.length ? pick(L).replace(/\{name\}/g, w ? w.name : 'she') : ''; };
// The turn a moment takes, naming the service (flavor.json → act_turn), so a scene that opened on a kiss says so when it becomes a massage.
const actTurn = (act, w) => { const L = byAct(FLAVOR.act_turn, act); return L && L.length ? pick(L).replace(/\{name\}/g, w.name) : ''; };
// One-on-one skill training opening (flavor.json → train_skill, keyed by TECH skill; _default as fallback). {skill} = the skill's name.
const trainSkillLine = (w, k) => { const L = (FLAVOR.train_skill||{})[k] || (FLAVOR.train_skill||{})._default || []; return (L.length ? pick(L) : `Sam walks {name} through the trade the hands-on way, {skill} first.`).replace(/\{name\}/g, w.name).replace(/\{skill\}/g, TECH_LABEL[k].toLowerCase()); };
// What actually happens, for AI text: appended to the moment's situation.
const actSituation = (w, act, base) => [base, act ? `What actually happens: ${w.name} ${askLady(act)}${(actById(act)||{}).kind==='kiss' ? '' : ` (${actLabel(act).toLowerCase()})`}; the text should lead into that.` : ''].filter(Boolean).join(' ');
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
  const T = BAL.train || {}, tm = pm(w,'train'), learn = fxMul(w,'learn') * housePerkVal(houseOf(w), 'trainMult', 1);
  // warming up: a little lust and lewdness, the lewdness only while she's below the threshold (lewdCap, 0-100)
  const SK = T.skill || {}, lewdCap = (T.service||{}).lewdCap ?? 50;
  const warm = (lust, lewd, cap) => { const l0 = w.lust; w.lust += lust * (0.4 + w.lewd/100) * fxMul(w,'lustBuild'); fitLust(w); if(w.lewd < lewdCap) lewdUp(w, lewd, Math.min(cap, lewdCap)); return Math.round(w.lust - l0); };
  if(mode==='stat'){
    const ST = T.stat || {}, list = trainStatsOf(w);
    if(!useAP(samTrainCost(ST.energy ?? 20))) return;
    const g = ((ST.base ?? 12) + (S.sam.wits||0) * (ST.perWits ?? 0.2)) * samBonus('wits') * tm * learn * (hasPast('tutor') ? 1.2 : 1) * (ST.spread ?? 0.5);
    const got = list.map(([k,wt])=>{ const v0 = w.stats[k]; statXP(w, k, g*wt); return `${cap(k)} +${Math.round(w.stats[k] - v0)}`; });
    minorTrust(w); w.energy = clamp(w.energy - (ST.herEnergy ?? 10), 0, maxEnergy(w)); if(tm<1) moodAdd(w, -3);
    samStat('wits',1); samXP(5); samLog(`Coached ${w.name}`);
    save(); render(); closeModal();
    const k0 = (list.slice().sort((a,b)=>b[1]-a[1])[0]||['charm'])[0];
    const line = pick((((typeof FLAVOR!=='undefined' && FLAVOR.train_stat) || {})[k0]) || ['']).replace(/\{name\}/g, w.name);
    return showResult(`Coaching ${w.name}`, `${line || `You and ${w.name} spend the afternoon working on what her job asks of her.`} You take detailed notes, as is tradition.${pNote(w,'train')}\n\n${got.join(' · ')} · Sam's Wits +1`, w.id, 'sam_training', {kind:'train', label:k0, scene:'sam_training'});
  }
  const tq = (S.sam.technique||0), tm2 = (hasPast('massage') ? 1.3 : 1) * tm * learn;
  if(mode==='service'){
    const SV = T.service || {}, acts = getActs().filter(a=>canSam(w,a.id) && w.acts[actKey(a.id)]);
    if(!acts.length) return toast((w.intim||0)===0 ? `${w.name} and Sam haven't crossed that line yet.` : `${w.name} isn't comfortable with that yet.`);
    if(!useAP(samTrainCost(SV.energy ?? 30))) return;
    const g = ((SV.base ?? 6) + tq * (SV.perTech ?? 0.05)) * tm2 * (SV.share ?? 0.4), hot = lustBonus(w, BAL.lust.bonus.trainMult);
    acts.forEach(a=>{ growAct(w, a.id, g * (isFav(w,a.id) ? 1.25 : 1)); if(isDislike(w,a.id)) moodAdd(w, -2); });
    const lu = warm(SV.svcLust ?? 6, SV.lewd ?? 2, Math.max(...acts.map(a=>svcLewdCap(a.id,'sam'))));
    const tgp = minorTrust(w); statXP(w, 'stamina', 1.5); countUp(w, 'privateSam');
    w.energy = clamp(w.energy-(SV.herEnergy ?? 16), 0, maxEnergy(w));
    samStat('technique',2); samXP(5); w.privateCount++; w._samTime=(w._samTime||0)+1; samLog(`Practiced with ${w.name}`); checkUnlocks();
    save(); render(); closeModal();
    const show = acts.find(a=>isFav(w,a.id)) || acts[acts.length-1], sl = actLine(show.id, w);
    return showResult(`Practice with ${w.name}`, `${flavor('train_service', w) || `${w.name} decides Sam's education is a shared project.`}${sl ? '\n\n'+sl : ''}${hot?'\n\n'+hot:''}\n\n${acts.map(a=>actLabel(a.id)).join(', ')}: skill +${Math.round(g*SKL)} each · Lust +${lu}${w.lewd < lewdCap ? ' · Lewdness +' : ''} · Trust ${tDelta(tgp)} · Sam's Technique +2`, w.id, 'samact:'+show.id, {kind:'train', act:show.id, scene:'samact:'+show.id, forSam:true});
  }
  // every trade skill, hands-on: her job's skill (Hospitality without one) at full strength, the rest x skill.others
  if(!useAP(samTrainCost(SK.energy ?? 30))) return;
  const main = trainSkillOf(w), g = ((SK.base ?? 4) + tq*(SK.perTech ?? 0.04)) * tm2, oth = broadJob(w) ? (T.broad.skillOthers ?? 0.6) : (SK.others ?? 0.35);
  const got = TECH_KEYS.map(k=>{ const v0 = w.tech[k]; grow(w, k, g * (k===main ? 1 : oth)); return `${TECH_LABEL[k]} +${Math.round(w.tech[k]-v0)}`; });
  statXP(w, 'charm', g*0.6); gainTrust(w, 1);
  w.energy = clamp(w.energy-(SK.herEnergy ?? 14), 0, maxEnergy(w)); if(tm<1) moodAdd(w, -3); samStat('technique',1); samXP(5); samLog(`Trained ${w.name}`);
  save(); render(); closeModal();
  showResult(`Training ${w.name}`, `${trainSkillLine(w, main)} You take detailed notes, as is tradition.${pNote(w,'train')}\n\n${got.join(' · ')} · Sam's Technique +1`, w.id, 'sam_training', {kind:'train', label:TECH_LABEL[main].toLowerCase(), scene:'sam_training'});
}
function privateMenu(id, free){
  const w = findW(id); if(!w) return;
  const opts = getActs().filter(a=>canSam(w,a.id));
  const canPossess = w.race==='spirit' && (w.intim||0)>=1 && (w.lewd||0) >= ((SVC.spirit||{}).possessLewd ?? 35);
  if(!opts.length && !canPossess) return toast((w.intim||0)===0 ? `${w.name} and Sam haven't crossed that line yet.` : `${w.name} isn't comfortable with that yet.`);
  const kp = knowsPrefs(w), vAw = isVessel(w) && vesselStage(w) < 3;
  modal(`<h2>Private time with ${esc(w.name)}</h2><p class="muted">What she's comfortable with, with you, as far as you two have gone (${esc(stageName(w.intim)||'nothing yet')}). ${kp?'★ = her favorite.':''}${vAw ? ` 💧 = fills ${w.name} faster (${vesselLabel(w)}).` : ''}</p>
    <div class="row">${opts.map(a=>`<button onclick="samPrivate('${id}','${a.id}',${free?'true':'false'})">${esc(samActLabel(a.id))}${kp&&isFav(w,a.id)?' ★':''}${samStance(w,a.id)==='ask'?' ~':''}${vAw && gNightKind(a.id)==='inside' ? ' 💧' : ''}</button>`).join('')}${canPossess?`<button onclick="spiritSamMenu('${id}',${free?'true':'false'})">👻 Reverse-possess Sam…</button>`:''}</div>
    <p class="muted">~ = she'll do it for Sam, but it's a stretch for her (less mood, more lewdness).</p>
    <div class="row"><button onclick="${free?'closeModal()':`openSheet('${id}')`}">Back</button></div>`);
}
function spiritSamPool(w){
  const minL = (SVC.spirit||{}).pairLewd ?? 45, extra = (SVC.spirit||{}).pairFutaExtra ?? 10;
  return S.workers.filter(o=>o.id!==w.id && (samVisitReach() || o.house===w.house) && !has(o,'Modest') && (o.lewd||0) >= minL + orientGap(o,'f') + (has(o,'Futa Lover') ? 0 : extra));
}
function spiritSamActs(w, o){
  const lim = o ? Math.min(w.lewd||0, o.lewd||0) + 15 : (w.lewd||0) + 20;
  const acts = ['missionary','cowgirl','doggy','oral_give','oral_get','manual_give','manual_get','breast_give','breast_get'].filter(a=>{
    const A = actById(a);
    return A && A.pair && A.pair.futa && (A.th||0) <= lim && !actBanned(w,a) && (!o || !actBanned(o,a));
  });
  return acts.length ? acts : ['manual_give'];
}
function spiritSamMenu(id, free){
  const w = findW(id); if(!w) return;
  const pool = spiritSamPool(w);
  modal(`<h2>👻 Reverse Possession — ${esc(w.name)}</h2>
    <p class="story">${esc(w.name)} shifts closer with a wicked grin—keeping her own body while borrowing your cock so you can watch her use it. Just the two of you, or invite a willing housemate to share?</p>
    <div class="row"><button class="primary" onclick="spiritSamSolo('${id}',${free?'true':'false'})">Just you and ${esc(w.name)}</button>
      ${pool.map(o=>`<button onclick="spiritSamPairMenu('${id}','${o.id}',${free?'true':'false'})">Invite ${esc(o.name)}</button>`).join('')}
    </div>
    ${pool.length ? '' : '<p class="muted">No housemates nearby are lewd and open enough to share tonight.</p>'}
    <div class="row"><button onclick="privateMenu('${id}',${free?'true':'false'})">Back</button></div>`);
}
function spiritSamSpendCost(free){
  if(free){ const c = samPrivCost(15, true); if(S.sam.energy<c){ toast('Sam is too tired.'); return false; } S.sam.energy -= c; return true; }
  return useAP(samPrivCost(25, false));
}
function spiritSamSolo(id, free){
  const w = findW(id), S0 = SVC.spirit || {}; if(!w || !spiritSamSpendCost(free)) return;
  const ld = spendLust(w, S0.pairLust ?? 30);
  lewdUp(w, 3, 95); moodAdd(w, 6); gainTrust(w, 2); statXP(w, 'stamina', 0.8);
  w.energy = clamp(w.energy - 10, 0, maxEnergy(w));
  samStat('technique', 2); samXP(5); w.privateCount++; w._samTime = (w._samTime||0) + 1; countUp(w, 'privateSam');
  samLog(`Reverse-possessed Sam (${w.name})`);
  const line = flavor('spirit_sam_futa', w) || `${w.name} keeps her own pale body while claiming your cock, stroking herself hard right in front of you while you watch.`;
  const text = `${line}\n\nLewdness + · Trust + · Mood + · Lust −${ld} · Sam's Technique +2`;
  checkUnlocks(); save(); render(); closeModal();
  showResult(`Private Time with ${w.name}`, text, w.id, 'sam_spirit_futa', {kind:'private', scene:'sam_spirit_futa', forSam:true, spiritFuta:true});
}
function spiritSamPairMenu(id, oid, free){
  const w = findW(id), o = findW(oid); if(!w || !o) return;
  const acts = spiritSamActs(w, o);
  modal(`<h2>👻 ${esc(w.name)} &amp; ${esc(o.name)}</h2>
    <p class="story">${esc(o.name)} steps into the room and looks twice as delighted once she realizes what ${esc(w.name)} has borrowed from you.</p>
    <div class="row">${acts.map(a=>`<button class="primary" onclick="spiritSamPair('${id}','${oid}','${a}',${free?'true':'false'})">${esc(actLabel(a))}</button>`).join('')}</div>
    <div class="row"><button onclick="spiritSamMenu('${id}',${free?'true':'false'})">Back</button></div>`);
}
function spiritSamPair(id, oid, act, free){
  const w = findW(id), o = findW(oid), S0 = SVC.spirit || {}; if(!w || !o || !spiritSamSpendCost(free)) return;
  const ldW = spendLust(w, S0.pairLust ?? 30), ldO = spendLust(o, (S0.pairLust ?? 30)*0.7);
  lewdUp(w, 2, 95); lewdUp(o, 2, 95); moodAdd(w, 6); moodAdd(o, 6); gainTrust(w, 2); gainTrust(o, 2);
  addBond(w, o, S0.pairBond ?? 10);
  w.energy = clamp(w.energy - 10, 0, maxEnergy(w)); o.energy = clamp(o.energy - 10, 0, maxEnergy(o));
  w.privateCount++; w._samTime = (w._samTime||0) + 1; countUp(w, 'privateSam');
  samXP(5); samLog(`${w.name} reverse-possessed Sam with ${o.name} [${actLabel(act)}]`);
  const A = actById(act);
  const pLine = A && A.pair && A.pair.futa && A.pair.futa.length ? pick(A.pair.futa).replace(/\{name\}/g, o.name).replace(/\{partner\}/g, w.name) : '';
  const open = flavor('spirit_pair_futa', w, {other:o.name});
  const text = `${[open, pLine].filter(Boolean).join('\n\n')}\n\n${w.name} & ${o.name}: Bond + · Trust + · Mood + · Lust −${ldW} / −${ldO}`;
  const scene = `pair:${act}:selffuta:${o.id}`;
  checkUnlocks(); save(); render(); closeModal();
  showResult(`${w.name} & ${o.name}`, text, w.id, scene, {kind:'private', act, with:o.id, scene, forSam:true, spiritFuta:true});
}
function samPrivate(id, act, free){
  const w = findW(id); if(!w) return;
  if(!canSam(w,act)) return toast(`${w.name} isn't comfortable with that yet.`);
  const A = actById(act)||{}, recv = A.kind==='receive' || (A.kind==='massage' && !!A.energyBack);   // receiving services: Sam does the work, and tires less
  if(free){ const c = samPrivCost(recv ? 8 : 15, true); if(S.sam.energy<c) return toast('Sam is too tired.'); S.sam.energy -= c; } else if(!useAP(samPrivCost(recv ? 15 : 30, false))) return;
  const acts = [];
  const l0 = w.lust, text = privateCore(w, act, {acts});
  const again = wantsAgain(w, l0);   // still worked up, she may want another round (js/events/encounters.js)
  checkUnlocks(); save(); render(); closeModal();
  const scenes = acts.map(a => 'samact:' + a);
  showResult(`Private Time with ${w.name}`, text, w.id, scenes.length > 1 ? scenes : scenes[0], {kind:'private', act, scene:scenes[0], forSam:true},
    again ? {label:'Continue', onclick:`EVQ.unshift(()=>evAgain(findW('${w.id}')));runQueue()`} : undefined);
}
// Shared effects of private time with Sam (used by the action, encounters, firsts and reckless nights). Returns the story text.
// o.lead: the moment's own opening (encounters, firsts); it replaces the generic lines, and a short line for the service follows.
function privateCore(w, act, o={}){
  if(o.acts) o.acts.push(act);
  const stretch = samStance(w,act)==='ask', A = actById(act) || {}, recv = A.kind==='receive' || (A.kind==='massage' && !!A.energyBack);
  const over = Math.max(0, Math.round((A.th||0) - inclination(w, act)));
  const pushed = stretch || over > 0;
  const fromLewd = !pushed && w.lewd >= w.trust;
  const builds = (A.lust ?? 0) > 0, spends = (A.lust ?? 0) < 0;   // positive lust builds desire; negative spends it; 0 (massages) is neutral
  const hot = lustBonus(w);
  let ld = 0;
  if(builds){ const l0 = w.lust; w.lust += Math.max(2, A.lust*3) * (0.4 + w.lewd/100) * fxMul(w,'lustBuild'); fitLust(w); ld = -Math.round(w.lust - l0); }
  else if(spends) ld = spendLust(w, BAL.lust.drop.private * (recv ? 1.8 : 1) * samRelease());   // receiving: a big drop in her lust; Sam's technique decides how much
  growAct(w, act, (4 + S.sam.technique/20) * (hasPast('massage')?1.3:1)); statXP(w, 'stamina', 0.8); countUp(w, 'privateSam');
  const cap = o.cap != null ? Math.min(svcLewdCap(act,'sam') + (pushed ? BAL.lewd.stretchCap : 0), o.cap) : svcLewdCap(act,'sam') + (pushed ? BAL.lewd.stretchCap : 0);
  const tier = actTier(act);
  let lg = 0;
  if(pushed){ lg = lewdUp(w, (stretch?4:3) + Math.min(4, Math.floor(over/8)), cap); stretch ? minorTrust(w) : minorTrust(w, 2); }
  else { lg = lewdUp(w, tier >= 3 ? 3.5 : tier === 2 ? 2.5 : 1.5, cap); if(fromLewd) minorTrust(w, 2); else gainTrust(w, 2); }
  moodAdd(w, (stretch?1:6)*pm(w,'private') + (isFav(w,act)?6:0) - (isDislike(w,act)?6:0));
  w.energy = clamp(w.energy - (recv ? 6 : 15) + (A.energyBack && w.race!=='demon' ? A.energyBack : 0), 0, maxEnergy(w));
  let fed = '';
  if(w.race==='demon' && A.finish){ w.energy = clamp(w.energy + SVC.demon.samGain, 0, maxEnergy(w)); S.sam.energy = Math.max(0, S.sam.energy - Math.round(SVC.demon.samExtra * sigilDrain(w))); fed = `\n\n(${w.name} fed on him. Sam is much more tired than usual. Energy +${SVC.demon.samGain} for her.)`; }
  if(w.race==='demon' && A.kind==='kiss'){   // a kiss is a small sip; an eager demon draws harder
    const D = SVC.demon, deep = w.lust >= LUST_EAGER, g = D.kissSam + (deep ? D.kissSamDraw : 0);
    w.energy = clamp(w.energy + g, 0, maxEnergy(w)); S.sam.energy = Math.max(0, S.sam.energy - (deep ? Math.round(D.kissSamCost * sigilDrain(w)) : 0));
    fed = `\n\n(${w.name} drinks a little of him with every kiss${deep ? ', and tonight she drinks deep. Sam is a bit lightheaded afterward' : ''}. Energy +${g} for her.)`; }
  if(isLovers(w,act)) gainTrust(w, 2);
  samStat('technique',3); samXP(5); w.privateCount++; w._samTime = (w._samTime||0) + 1;
  samLog(`Private time with ${w.name} [${samActLabel(act)}]`);
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
  if(isLovers(w,act) && !o.first) text += `\n\n${w.name} wouldn't do this with a client. With you, it's different.`;
  if(has(w,'Sapphic') && actTier(act) >= 2) text += `\n\n${flavor('private_sapphic', w)}`;   // mostly into women: Sam is her exception
  if(isFav(w,act) && knowsPrefs(w)) text += `\n\n(Her favorite. She's in a very good mood afterward.)`;
  text += pNote(w,'private');
  if(stretch) text += `\n\n(This was a stretch for ${w.name}. She did it for Sam, and it's a little less of a stretch now.)`;
  if(hot) text += `\n\n${hot}`;
  text += fed;
  text += fillVessel(w, act);
  text += `\n\n[${actLabel(act)}] skill + · ${lg >= 0.3 ? 'Lewdness + · ' : ''}Trust + · Lust ${ld < 0 ? '+'+(-ld) : ld > 0 ? '−'+ld : '—'} · Sam's Technique +3`;
  // worked up by it, she may want more: something that actually spends it, if they've crossed that far
  if(builds && !o.more && w.lust >= LUST_EAGER && w.lewd >= SVC.askMore.lewd){
    const ids = getActs().filter(a=>(a.lust ?? -1) < 0 && canSam(w, a.id)).map(a=>a.id);
    if(ids.length){ const id2 = ids.find(id=>isLovers(w,id)) || pickFav(w,ids) || pick(ids);
      const l1 = w.lust;
      text += '\n\n— Round two —\n\n' + privateCore(w, id2, {lead:`${w.name} isn't done. She pulls you closer and tells you, quietly and very clearly, what she wants next.`, more:true, acts:o.acts});
      text += `\n\n(${samActLabel(act)} got her worked up (lust +${-ld}); the second round, ${samActLabel(id2).toLowerCase()}, is what spent it (lust −${Math.round(l1 - w.lust)}).)`; }
  }
  return text;
}
// Demons: Sam pays for a stud for the night, so she can feed her fill without anyone getting hurt (once a week).
function applyStud(w){
  const D = SVC.demon; if(!w || w.race!=='demon' || w._stud===S.week || S.gold < D.studCost) return null;
  S.gold -= D.studCost; w._stud = S.week;
  const g = Math.min(D.studGain, maxEnergy(w) - w.energy);
  w.energy = clamp(w.energy + D.studGain, 0, maxEnergy(w));
  const ld = spendLust(w, D.studLust); moodAdd(w, 4); gainTrust(w, 1);
  return {g: Math.round(g), ld, cost: D.studCost};
}
function autoStuds(R){
  const hired = [];
  S.workers.forEach(w=>{
    if(w.race!=='demon' || !w.autoStud || w._stud===S.week) return;
    if(w.autoStud!=='always' && (w.lust||0) < +w.autoStud) return;
    const r = applyStud(w); if(!r) return;
    hired.push(w.name);
    if(R && R.per && R.per[w.id]) R.per[w.id].notes.push(`Auto-stud (−${fmt(r.cost)}, E +${r.g}, Lust −${r.ld})`);
    if(R && R.hl) R.hl.push({wid:w.id, text:`${w.name} spent the night with an auto-hired stud (−${fmt(r.cost)}).`, act:null, scene:'casual', noAi:true});
  });
  if(hired.length && R && R.lines) R.lines.push(`🌙 Auto-studs booked for ${hired.join(', ')}.`);
}
function hireStud(id){
  const w = findW(id), D = SVC.demon; if(!w || w.race!=='demon') return;
  if(w._stud===S.week) return toast(`${w.name} has already had her night this week.`);
  if(S.gold < D.studCost) return toast('Not enough gold.');
  const r = applyStud(w); if(!r) return;
  samLog(`Paid for a stud for ${w.name}`); save(); render(); closeModal();
  showResult('A Night Off the Menu', pick([
    `You quietly book ${w.name} a night with a broad-shouldered professional from across town who knows exactly what he's signing up for and is paid accordingly. She comes down to breakfast radiant. He leaves at noon, cheerful and very, very sleepy.`,
    `You find ${w.name} a willing stud for the night: a retired gladiator with stamina to spare and a fee to match. Nobody gets drained into a faint, nobody's reputation suffers, and ${w.name} hums all the next morning.`]) + `\n\nEnergy +${r.g} · Lust −${r.ld} · Mood + · Trust + · −${fmt(r.cost)}`, w.id, 'casual', null);
}
const guildHas = k => isHired(k) || S.candidates.some(c=>c.key===k);
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
