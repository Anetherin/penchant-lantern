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
const samLog = t => S.samWeek.acts.push(t);
const xpNeed = l => 60 + 40*l;
const apMax = () => 3 + ((S.sam.lvl||1)>=5?1:0) + ((S.sam.lvl||1)>=10?1:0);
function samGainXP(n){
  S.sam.xp = (S.sam.xp||0) + n; S.sam.lvl = S.sam.lvl || 1;
  while(S.sam.xp >= xpNeed(S.sam.lvl)){
    S.sam.xp -= xpNeed(S.sam.lvl); S.sam.lvl++;
    ['charm','business','strength','technique'].forEach(k=>samStat(k,2));
    if(S.sam.lvl===5 || S.sam.lvl===10) S.ap++;
    note(`⬆ Sam reached level ${S.sam.lvl}! All stats +2${S.sam.lvl===5||S.sam.lvl===10?', and +1 action per week':''}.`);
  }
}
function samXP(n){
  S.sam.appXP += n;
  const lv = S.sam.appXP>=200 ? 3 : S.sam.appXP>=60 ? 2 : 1;
  if(lv > S.sam.appraisal){ S.sam.appraisal = lv; note(`[Appraisal] leveled up to Lv ${lv}! ${lv===2?'Exact stats and lewdness are now visible.':'Hidden traits and everyone\'s preferences are now visible.'}`); }
}
function samStat(k,n){ S.sam[k] = clamp(S.sam[k]+n); }
function samWork(kind){
  if(!useAP(25)) return;
  let title='', text='';
  if(kind==='bartend'){
    const inc = Math.round((30 + S.sam.charm*1.2 + rnd(0,25)) * (S.past==='bartender'?1.5:1)); S.gold += inc; S.samWeek.income += inc; samStat('charm',2);
    title='Behind the Bar'; text=`Sam pours drinks all evening. ${S.past==='bartender'?'Old habits: he flips a bottle and the whole room cheers.':'He over-explains the menu to everyone, but people seem to find it charming.'}\n\n+${fmt(inc)} · Charm +2`;
    samLog(`Tended bar (+${fmt(inc)})`);
  } else if(kind==='security'){
    S.samWeek.security += 20 + S.sam.strength; samStat('strength',2);
    title='On Watch'; text=`Sam makes the rounds of every house, looking as stern as a thin man in a hoodie can. Nobody starts anything, which he decides to count as a win.\n\nSecurity bonus in all houses this week · Strength +2`;
    samLog('Stood watch');
  } else if(kind==='books'){
    S.samWeek.books = true; samStat('business',2);
    title='Doing the Books'; text=`Sam rebuilds the ledger as a spreadsheet, by hand, on parchment. The staff watch with a mix of horror and respect.\n\nUpkeep reduced this week · Business +2`;
    samLog('Did the books');
  } else if(kind==='scout'){
    addCandidates(2, 1.1 + S.sam.business/400); samXP(10); samStat('charm',1);
    title='Scouting'; text=`Sam walks the market and the guild hall, quietly using [Appraisal] on anyone who looks like they might want a job.\n\n+2 candidates · Appraisal XP +10`;
    samLog('Scouted for recruits');
  }
  save(); render(); showResult(title, text);
}
function samRest(){
  if(S.ap<=0) return toast('No actions left this week.');
  S.ap--; S.sam.energy = Math.min(100, S.sam.energy+50); samLog('Rested'); save(); render();
  const v = restVisitor();
  if(v) return restEncounter(v);
  showResult('Nap Time', 'Sam takes a long nap. In his dreams, a truck honks at him. He wakes up and decides not to think about it.\n\nEnergy +50');
}
function samChat(id){
  const w = findW(id); if(!w || !useAP(15)) return;
  const m = pm(w,'chat'), tg = gainTrust(w, rnd(1.5,3.5) * (has(w,'Romantic')?1.4:1) * (has(w,'Shy')?1.2:1) * m);
  w.mood = clamp(w.mood + 4*m - (m<1?3:0)); samStat('charm',1); samXP(5); samLog(`Chatted with ${w.name}`); checkUnlocks();
  save(); render(); closeModal();
  const topic = ET('chat', NAMED[w.key] && Object.values(NAMED[w.key].bonds||{}).some(x=>x.kind==='home') || ['yui','natsuki','kanako','mio'].includes(w.key) ? 'home' : 'topics');
  showResult(`Chatting with ${w.name}`, `Sam and ${w.name} talk ${topic}.${pNote(w,'chat')}\n\nTrust +${tg.toFixed(1)}`, w.id, null, {kind:'chat', scene:'casual', situation:topic, auto:true});
}
// Date types live in data/dates.json (DATES is defined in js/data/scenes.js).
const dateFor = (k) => { const d = DATES[k]; return Object.assign({}, d, (d.past && d.past[S.past]) || {}); };
const dateText = (d, w) => [d.intro, pick(d.lines||[''])].filter(Boolean).join(' ').replace(/\{name\}/g, w.name);
function dateMenu(id){
  const w = findW(id); if(!w) return;
  modal(`<h2>Take ${esc(w.name)} out</h2><p class="muted">Dates build trust and mood. What she enjoys depends on her personality. A great date at high trust might not end at her door.</p>
    <table>${Object.entries(DATES).map(([k,d])=>{ const c = dateFor(k).cost, m = pm(w,d.like);
      return `<tr><td><b>${d.label}</b>${m>1?' <span class="good">♥ she\'d love this</span>':m<1?' <span class="warn">not her thing</span>':''}</td><td>${c?fmt(c):'free'}</td><td class="muted">${d.energy} energy</td><td><button class="sm" onclick="samDate('${id}','${k}')" ${S.gold<c?'disabled':''}>Go</button></td></tr>`; }).join('')}</table>
    <div class="row"><button onclick="openSheet('${id}')">Back</button></div>`);
}
function samDate(id, k){
  const w = findW(id); if(!w || !DATES[k]) return; const d = dateFor(k);
  const cost = d.cost||0;
  if(S.gold<cost) return toast('Not enough gold.');
  if(!useAP(d.energy)) return; S.gold -= cost;
  const m = pm(w,d.like), tg = gainTrust(w, d.trust * (has(w,'Romantic')?1.4:1) * (d.trustMult||1) * m);
  w.mood = clamp(w.mood + d.mood*m - (m<1?3:0)); w.dates++;
  if(d.restores) w.energy = clamp(w.energy + d.restores, 0, maxEnergy(w));
  if(d.greedyMood && has(w,'Greedy')) w.mood = clamp(w.mood + d.greedyMood);
  samStat('charm',1); samXP(5); samLog(`${d.label} with ${w.name}`); checkUnlocks();
  save(); render(); closeModal();
  const sparks = w.trust>=60 && w.mood>=70 && m>=1 && getActs().some(a=>canSam(w,a.id)) && Math.random() < 0.35 + Math.max(0, w.lust-50)/100;
  const txt = dateText(d, w) + pNote(w, d.like==='private'?'private':d.like) + `\n\n${cost?'−'+fmt(cost)+' · ':''}Trust +${tg.toFixed(1)}${d.restores?' · She feels rested':''}`;
  modal(`<h2>${esc(d.label)} with ${esc(w.name)}</h2><div id="resImg"></div><p class="story">${esc(txt)}</p>
    ${sparks?`<div id="propAi"><p class="story pink">On the way back, ${esc(w.name)} slips her hand into Sam's and doesn't let go. At her door, she hesitates. "...Do you want to come in?"</p></div>`:''}
    <div class="row">${sparks?`<button class="primary" onclick="privateMenu('${id}',true)">Go inside (private time, no extra action)</button><button onclick="closeModal()">Say goodnight</button>`:`<button class="primary" onclick="closeModal()">OK</button>`}</div>`);
  showImg('resImg', w.id, 'date_'+k);
  if(sparks && SET.ai.on && getTextPlugin()) aiWrite('propAi', 'proposition', w.id, {scene:'date_'+k, date:d.label.toLowerCase(), forSam:true});
}
function samGift(id){
  const w = findW(id); if(!w) return; if(S.gold<60) return toast('A nice gift costs 60g.');
  if(!useAP(10)) return; S.gold -= 60;
  const m = pm(w,'gift'), mg = Math.round((has(w,'Greedy') ? 20 : 12) * m);
  w.mood = clamp(w.mood+mg); gainTrust(w, 1.5*m); samXP(3); samLog(`Gave ${w.name} a gift`); checkUnlocks();
  save(); render(); closeModal();
  showResult('A Gift', `Sam gives ${w.name} ${pick(GIFTS)}. ${ET('gift', has(w,'Greedy')?'greedy':'normal')}${pNote(w,'gift')}\n\n−60g · Mood +${mg}`, w.id, 'portrait');
}
function samTrain(id){
  const w = findW(id); if(!w) return;
  const sel = $('#trainSel'); const k = sel ? sel.value : 'service';
  const tm = (S.past==='massage' ? 1.3 : 1) * pm(w,'train');
  if(k.startsWith('act:')){
    const act = k.slice(4); if(!canSam(w,act)) return toast(`${w.name} isn't comfortable with that yet.`);
    if(!useAP(25)) return;
    const g = (6 + S.sam.technique/20) * tm;
    const hot = lustBonus(w, BAL.lust.bonus.trainMult), ld = spendLust(w, BAL.lust.drop.train);
    growAct(w, act, g); w.lewd = clamp(w.lewd + 1.5*lewdMult(w)); w.energy = clamp(w.energy-12, 0, maxEnergy(w));
    if(w.dislike===act) w.mood = clamp(w.mood-4);
    samStat('technique',2); samXP(5); w.privateCount++; w._samTime=(w._samTime||0)+1; samLog(`Practiced ${actLabel(act)} with ${w.name}`); checkUnlocks();
    save(); render(); closeModal();
    return showResult(`Practice: ${actLabel(act)}`, `${w.name} decides Sam's education is a shared project. They practice ${actLabel(act).toLowerCase()} until both of them are confident in the technique. Sam takes notes afterward. She finds this hilarious.${hot?'\n\n'+hot:''}\n\n${actLabel(act)} skill +${Math.round(g)} · Lewdness + · Lust −${ld} · Sam's Technique +2`, w.id, 'samact:'+act, {kind:'train', act, scene:'samact:'+act, forSam:true});
  }
  if(!useAP(25)) return;
  const map = {service:'charm', dance:'charm', bar:'charm', combat:'strength', manage:'business'};
  const sk = map[k] || 'charm', g = (4 + S.sam[sk]/25) * tm;
  grow(w, k, g); gainTrust(w, 1); w.energy = clamp(w.energy-10, 0, maxEnergy(w)); if(pm(w,'train')<1) w.mood = clamp(w.mood-3); samStat(sk,1); samXP(5); samLog(`Trained ${w.name} in ${TECH_LABEL[k]}`);
  save(); render(); closeModal();
  showResult(`Training: ${TECH_LABEL[k]}`, `Sam and ${w.name} spend the afternoon on ${TECH_LABEL[k].toLowerCase()}. Sam takes detailed notes, as is tradition.${pNote(w,'train')}\n\n${TECH_LABEL[k]} +${Math.round(g)}`, w.id, 'sam_training', {kind:'train', label:TECH_LABEL[k].toLowerCase(), scene:'sam_training'});
}
function privateMenu(id, free){
  const w = findW(id); if(!w) return;
  const opts = getActs().filter(a=>canSam(w,a.id));
  if(!opts.length) return toast(`${w.name} isn't comfortable with that yet.`);
  const kp = knowsPrefs(w);
  modal(`<h2>Private time with ${esc(w.name)}</h2><p class="muted">What she's comfortable with, with you. ${kp?'★ = her favorite.':''}</p>
    <div class="row">${opts.map(a=>`<button onclick="samPrivate('${id}','${a.id}',${free?'true':'false'})">${esc(a.label)}${kp&&w.fav===a.id?' ★':''}${samStance(w,a.id)==='ask'?' ~':''}</button>`).join('')}</div>
    <p class="muted">~ = she'll do it for Sam, but it's a stretch for her (less mood, more lewdness).</p>
    <div class="row"><button onclick="${free?'closeModal()':`openSheet('${id}')`}">Back</button></div>`);
}
function samPrivate(id, act, free){
  const w = findW(id); if(!w) return;
  if(!canSam(w,act)) return toast(`${w.name} isn't comfortable with that yet.`);
  if(free){ if(S.sam.energy<15) return toast('Sam is too tired.'); S.sam.energy -= 15; } else if(!useAP(30)) return;
  const text = privateCore(w, act);
  checkUnlocks(); save(); render(); closeModal();
  showResult(`Private Time with ${w.name}`, text, w.id, 'samact:'+act, {kind:'private', act, scene:'samact:'+act, forSam:true});
}
// Shared effects of private time with Sam (used by the action, encounters, and reckless nights). Returns the story text.
function privateCore(w, act){
  const stretch = samStance(w,act)==='ask';
  const fromLewd = !stretch && w.lewd >= w.trust;
  const hot = lustBonus(w), ld = spendLust(w, BAL.lust.drop.private);
  growAct(w, act, (4 + S.sam.technique/20) * (S.past==='massage'?1.3:1));
  if(stretch){ w.lewd = clamp(w.lewd + 4*lewdMult(w)); } else if(fromLewd) w.lewd = clamp(w.lewd + 2*lewdMult(w)); else gainTrust(w, 2);
  w.mood = clamp(w.mood + (stretch?1:6)*pm(w,'private') + (w.fav===act?6:0) - (w.dislike===act?6:0)); w.energy = clamp(w.energy-15, 0, maxEnergy(w));
  if(w.lovers===act) gainTrust(w, 2);
  samStat('technique',3); samXP(5); w.privateCount++; w._samTime = (w._samTime||0) + 1;
  samLog(`Private time with ${w.name} [${actLabel(act)}]`);
  let text;
  if(S.sam.first){
    S.sam.first = false;
    text = `${w.name} takes Sam's hand and leads him upstairs. It becomes clear about four seconds in that his previous-life experience in this department is exactly zero.\n\n${w.name} looks absolutely delighted about this.\n\nThe door closes.`;
  } else if(w.privateCount===1){
    text = `${w.name} has clearly been thinking about this. She pulls Sam into her room before he can finish saying hello.\n\nThe door closes.`;
  } else {
    text = pick([`${w.name} drags Sam off for a "lesson." He takes notes afterward. She finds this hilarious.`,
      `A quiet evening, a locked door, and a "do not disturb" sign that the neighbors would later call unnecessary given the noise.`,
      `${w.name} insists Sam needs more practice. Sam, a diligent student, does not argue.`,
      `By the time they come downstairs, everyone has very carefully decided not to look at them.`]);
  }
  if(w.lovers===act) text += `\n\n${w.name} wouldn't do this with a client. With Sam, it's different.`;
  if(w.fav===act && knowsPrefs(w)) text += `\n\n(Her favorite. She's in a very good mood afterward.)`;
  text += pNote(w,'private');
  if(stretch) text += `\n\n(This was a stretch for ${w.name}. She did it for Sam, and it's a little less of a stretch now.)`;
  if(hot) text += `\n\n${hot}`;
  text += `\n\n[${actLabel(act)}] skill + · ${stretch||fromLewd?'Lewdness':'Trust'} + · Lust −${ld} · Sam's Technique +3`;
  return text;
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
  const B = BAL.breakup, starter = w.key && w.key===S.partner;
  w.traits = w.traits.filter(t=>t!=='Devoted'); w.exLover = true; w.rekindleWk = S.week; w.neglect = 0;
  w.mood = clamp(w.mood + B.mood); w.trust = clamp(w.trust + B.trust * (has(w,'Loyal') ? 0.5 : 1));
  if(!starter){ w.isPartner = false; w.wage = wageFor(w); w.contract = 12; }
  samLog(`Ended things with ${w.name}`); save(); render(); closeModal();
  showResult(`${w.name}`, flavor('breakup', w) + `\n\n(No longer Devoted. Mood ${B.mood}, trust ${Math.round(B.trust*(has(w,'Loyal')?0.5:1))}.${starter?' She still works without wages.':` She now draws a wage of ${fmt(w.wage)}/wk on a 12-week contract.`})`, w.id, 'portrait', {kind:'breakup', wid:w.id});
}
function rekindle(id){
  const w = findW(id), B = BAL.breakup; if(!w || !w.exLover || has(w,'Devoted')) return;
  if(w.trust < B.rekindleTrust) return toast(`${w.name} isn't ready for that conversation.`);
  if(S.week - (w.rekindleWk||0) < B.rekindleCooldown) return toast(`Too soon. Give her a few more weeks.`);
  if(!useAP(15)) return;
  w.rekindleWk = S.week;
  const yes = Math.random() < B.rekindleChance + (w.mood-50)/200 + (has(w,'Romantic')?0.1:0);
  if(yes){ w.traits.push('Devoted'); w.exLover = false; w.isPartner = true; w.wage = 0; w.contract = 999; w.mood = clamp(w.mood+10); }
  else w.mood = clamp(w.mood-3);
  samLog(`Asked ${w.name} to try again`); save(); render(); closeModal();
  showResult(yes ? `${w.name}, Again` : `Not Yet`, flavor(yes ? 'rekindle_yes' : 'rekindle_no', w) + (yes ? `\n\n(${w.name} is Sam's lover again.)` : ''), w.id, yes ? 'sam_date' : 'portrait');
}
