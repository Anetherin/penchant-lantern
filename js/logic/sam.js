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
const apMax = () => 3 + ((S.sam.lvl||1)>=5?1:0) + ((S.sam.lvl||1)>=10?1:0) + (hasBoon('ap')?1:0);
function samGainXP(n){
  S.sam.xp = (S.sam.xp||0) + n; S.sam.lvl = S.sam.lvl || 1;
  while(S.sam.xp >= xpNeed(S.sam.lvl)){
    S.sam.xp -= xpNeed(S.sam.lvl); S.sam.lvl++;
    ['charm','business','strength','technique'].forEach(k=>samStat(k,BAL.sam.perLevel));
    if(S.sam.lvl===5 || S.sam.lvl===10) S.ap++;
    note(`⬆ Sam reached level ${S.sam.lvl}! All stats +${BAL.sam.perLevel}${S.sam.lvl===5||S.sam.lvl===10?', and +1 action per week':''}.`);
  }
}
function samXP(n){
  S.sam.appXP += n;
  const lv = S.sam.appXP>=200 ? 3 : S.sam.appXP>=60 ? 2 : 1;
  if(lv > S.sam.appraisal){ S.sam.appraisal = lv; note(`[Appraisal] leveled up to Lv ${lv}! ${lv===2?'Exact stats and lewdness are now visible.':'Hidden traits and everyone\'s preferences are now visible.'}`); }
}
function samStat(k,n){ S.sam[k] = clamp(S.sam[k]+n, 0, samCap()); }
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
    S.samWeek.books = true; samStat('business',2);
    title='Doing the Books'; text=`Sam rebuilds the ledger as a spreadsheet, by hand, on parchment. The staff watch with a mix of horror and respect.\n\nUpkeep reduced by ${Math.round((0.1 + S.sam.business*0.003 + samUpFx('books'))*100)}% this week · Business +2`;
    samLog('Did the books');
  } else if(kind==='rounds'){
    // a word with everyone: small trust and mood for every lady in every house (balance.json → sam.rounds*)
    const B = BAL.sam, rm = 1 + samUpFx('rounds'), rt = B.roundsTrust * rm, rmood = B.roundsMood * rm; let n = 0;
    S.workers.forEach(w=>{ gainTrust(w, rt); moodAdd(w, rmood); n++; });
    samStat('charm',1);
    title='Making the Rounds'; text=`Sam walks through every house with a notebook, asking everyone how they're doing and actually writing down the answers. A leaky window gets fixed, someone's favorite tea gets restocked, and the whole staff notices that he noticed.\n\n${n} ladies: trust ${tDelta(rt)}, mood +${Math.round(rmood*10)/10} · Charm +1`;
    samLog('Made the rounds');
  } else if(kind==='lesson'){
    // a class for everyone whose job uses this skill (individual training is for services only)
    const sel = $('#lessonSel'), k = sel ? sel.value : 'service', map = {service:'charm', dance:'charm', bar:'charm', combat:'strength', manage:'business'}, sk = map[k] || 'charm';
    const who = S.workers.filter(w=>w.job!=='rest' && (JOBS[w.job]||{}).skill===k);
    const g = (4 + S.sam[sk]/25) * BAL.sam.lessonShare * (hasPast('massage') ? 1.15 : 1) * (1 + samUpFx('lesson'));
    who.forEach(w=>{ grow(w, k, g * pm(w,'train')); statXP(w, ({service:'charm', dance:'agility', bar:'charm', combat:'strength', manage:'refinement'})[k] || 'charm', g*0.4); minorTrust(w); });
    samStat(sk,2);
    title=`A Lesson: ${TECH_LABEL[k]}`; text = who.length ? `Sam gathers ${who.map(w=>w.name).join(', ')} for an afternoon on ${TECH_LABEL[k].toLowerCase()}. He brought handouts. Nobody asked for handouts.\n\n${TECH_LABEL[k]} +${Math.round(g*SKL)} each · Sam's ${cap(sk)} +2` : `Sam sets out chairs and handouts for a lesson on ${TECH_LABEL[k].toLowerCase()}. Nobody whose job uses it turns up. He reads the handout to himself.`;
    samLog(`Taught a lesson in ${TECH_LABEL[k]}${who.length?` (${who.length})`:''}`);
  } else if(kind==='scout'){
    const nc = 2 + Math.round(samUpFx('scout')); addCandidates(nc, 1.1 + S.sam.business/400); samXP(10); samStat('charm',1);
    title='Scouting'; text=`Sam walks the market and the guild hall, quietly using [Appraisal] on anyone who looks like they might want a job.\n\n+${nc} candidates · Appraisal XP +10`;
    samLog('Scouted for recruits');
  }
  save(); render(); showResult(title, text);
}
function samRest(){
  if(S.ap<=0) return toast('No actions left this week.');
  S.ap--; const nap = samRecover(BAL.samHome.nap); S.sam.energy = Math.min(100, S.sam.energy+nap); samLog('Rested'); save(); render();
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
const actLine = act => { const L = byAct(FLAVOR.private_act, act); return L && L.length ? pick(L) : ''; };
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
  const sparks = nightIn || (!first && w.trust>=60 && w.mood>=70 && m>=1 && anyAct && Math.random() < 0.35 + Math.max(0, w.lust-50)/100);
  const spicy = !first && m>=1 && w.mood>=55 ? (d.spicy||[]).map((sp,i)=>[sp,i]).filter(([sp])=>spicyOK(w,sp)).slice(0,2) : [];
  const txt = dateText(d, w) + trinket + `\n\n${cost?'−'+fmt(cost)+' · ':''}Trust ${tDelta(tg)}${lg>0?' · Lewdness +':''}${d.restores?' · She feels rested':''}`;
  const inviteTxt = nightIn ? `The fire burns low. ${w.name} looks up at Sam, and doesn't look away.` : `On the way back, ${w.name} slips her hand into Sam's and doesn't let go. At her door, she hesitates. "...Do you want to come in?"`;
  modal(`<h2>${esc(d.label)} with ${esc(w.name)}</h2><div id="resImg"></div><p class="story">${esc(txt)}</p>
    ${sparks?`<div id="invImg"></div><div id="propAi"><p class="story pink">${esc(inviteTxt)}</p></div>`:''}
    ${first?`<p class="story pink">On the way back, something has shifted between them. ${esc(w.name)} keeps finding reasons to stand a little closer.</p>`:''}
    <div class="row">${first?`<button class="primary" onclick="firstFromDate('${id}')">♥ See where it goes</button><button onclick="closeModal()">Say goodnight</button>`:sparks?`<button class="primary" onclick="privateMenu('${id}',true)">Go inside (private time, no extra action)</button>${spicyBtns(id,k,spicy)}<button onclick="closeModal()">Say goodnight</button>`:`${spicyBtns(id,k,spicy)}<button class="primary" onclick="closeModal()">OK</button>`}</div>`);
  showImg('resImg', w.id, 'date_'+k);
  if(sparks) showImg('invImg', w.id, 'invite');
  if(sparks && SET.ai.on && getTextPlugin()) aiWrite('propAi', 'proposition', w.id, {scene:'invite', date:d.label.toLowerCase(), forSam:true});
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
    text = privateCore(w, act, {lead}); lewdUp(w, sp.gain, sp.cap); scene = 'samact:'+act+'~~date_'+k+(sp.image ? '.'+i : '');
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
  showResult(`${sp.label}: ${w.name}`, text, w.id, scene, ai);
}
function samTrain(id){
  const w = findW(id); if(!w) return;
  const sel = $('#trainSel'); const k = sel ? sel.value : 'service';
  const tm = (hasPast('massage') ? 1.3 : 1) * pm(w,'train');
  if(k.startsWith('act:')){
    const act = k.slice(4); if(!canSam(w,act)) return toast(`${w.name} isn't comfortable with that yet.`);
    if(!useAP(25)) return;
    const g = (6 + S.sam.technique/20) * tm;
    const hot = lustBonus(w, BAL.lust.bonus.trainMult), A = actById(act) || {};
    // giving services, kissing, massages build her lust (she isn't the one being pleased); the rest spend it
    let ld; if((A.lust ?? -1) >= 0){ const l0 = w.lust; w.lust += Math.max(2, A.lust*3) * (0.4 + w.lewd/100) * fxMul(w,'lustBuild'); fitLust(w); ld = -Math.round(w.lust - l0); } else ld = spendLust(w, BAL.lust.drop.train * samRelease());
    const tgp = minorTrust(w);
    growAct(w, act, g); statXP(w, 'stamina', 1); countUp(w, 'privateSam'); lewdUp(w, 1.5, svcLewdCap(act,'sam')); w.energy = clamp(w.energy-12, 0, maxEnergy(w));
    if(w.dislike===act) moodAdd(w, -4);
    samStat('technique',2); samXP(5); w.privateCount++; w._samTime=(w._samTime||0)+1; samLog(`Practiced ${actLabel(act)} with ${w.name}`); checkUnlocks();
    save(); render(); closeModal();
    return showResult(`Practice: ${actLabel(act)}`, `${w.name} decides Sam's education is a shared project. They practice ${actLabel(act).toLowerCase()} until both of them are confident in the technique. Sam takes notes afterward. She finds this hilarious.${hot?'\n\n'+hot:''}\n\n${actLabel(act)} skill +${Math.round(g*SKL)} · Lewdness + · Lust ${ld>=0?'−'+ld:'+'+(-ld)} · Trust ${tDelta(tgp)} · Sam's Technique +2`, w.id, 'samact:'+act, {kind:'train', act, scene:'samact:'+act, forSam:true});
  }
  if(!useAP(25)) return;
  const map = {service:'charm', dance:'charm', bar:'charm', combat:'strength', manage:'business'};
  const sk = map[k] || 'charm', g = (4 + S.sam[sk]/25) * tm;
  grow(w, k, g); statXP(w, ({service:'charm', dance:'agility', bar:'charm', combat:'strength', manage:'refinement'})[k] || 'charm', g*0.6); gainTrust(w, 1); w.energy = clamp(w.energy-10, 0, maxEnergy(w)); if(pm(w,'train')<1) moodAdd(w, -3); samStat(sk,1); samXP(5); samLog(`Trained ${w.name} in ${TECH_LABEL[k]}`);
  save(); render(); closeModal();
  showResult(`Training: ${TECH_LABEL[k]}`, `Sam and ${w.name} spend the afternoon on ${TECH_LABEL[k].toLowerCase()}. Sam takes detailed notes, as is tradition.${pNote(w,'train')}\n\n${TECH_LABEL[k]} +${Math.round(g*SKL)}`, w.id, 'sam_training', {kind:'train', label:TECH_LABEL[k].toLowerCase(), scene:'sam_training'});
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
    text = [o.lead, actLine(act)].filter(Boolean).join('\n\n');
    if(S.sam.first && actTier(act)>=2){ S.sam.first = false; text += `\n\n${pick(FLAVOR.sam_first._default).replace(/\{name\}/g, w.name)}`; }
  } else if(S.sam.first && actTier(act)>=2){
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
