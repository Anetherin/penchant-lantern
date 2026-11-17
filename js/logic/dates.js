'use strict';
/* =====================================================================
   DATES, DOUBLE DATES, DEMONSTRATIONS & GROUP NIGHTS
   ===================================================================== */
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
  const dbl = has(w,'Devoted') && doublePartners(w).length > 0;
  modal(`<h2>Take ${esc(w.name)} out</h2><p class="muted">Dates build trust and mood. What she enjoys depends on her personality. A great date at high trust might not end at her door.</p>
    <table>${Object.entries(DATES).filter(([k,d])=>dateListed(w,d)).map(([k,d])=>{ const c = dateFor(k).cost, m = pmAny(w,d.like), r = dateRaises(d);
      return `<tr><td><b>${d.label}</b>${m>1?' <span class="good">♥ she\'d love this</span>':m<1?' <span class="warn">not her thing</span>':''}${r?`<br><span class="muted">${esc(r)}</span>`:''}</td><td>${c?fmt(c):'free'}</td><td class="muted">${samDateCost(d.energy)} energy</td><td><button class="sm" onclick="${d.special==='chat'?`samChat('${id}')`:`samDate('${id}','${k}')`}" ${S.gold<c?'disabled':''}>Go</button></td></tr>`; }).join('')}</table>
    <div class="row">${dbl?`<button onclick="doubleDateMenu('${id}')">💞 Double date…</button>`:''}<button onclick="openSheet('${id}')">Back</button></div>`);
}
const doublePartners = w => S.workers.filter(o=>o.id!==w.id && has(o,'Devoted')).sort((a,b)=>bondV(w,b)-bondV(w,a));
const doubleBondTag = (a, b) => { const v = Math.round(bondV(a,b)), L = BONDS.labels.find(l=>(l.min!==undefined && v>=l.min) || (l.max!==undefined && v<=l.max)); return L ? `${L.label} ${b.name} (${v})` : `Bond ${v}`; };
function doubleDateMenu(id, pid){
  const w = findW(id), ps = w ? doublePartners(w) : []; if(!w || !ps.length) return dateMenu(id);
  const o = (pid && ps.find(p=>p.id===pid)) || ps[0];
  const tabs = ps.map(p=>`<button class="sm ${p.id===o.id?'primary':''}" onclick="doubleDateMenu('${w.id}','${p.id}')">${esc(p.name)} <span class="muted">(${Math.round(bondV(w,p))})</span></button>`).join(' ');
  const rows = Object.entries(DOUBLE_DATES).filter(([,d])=>dateListed(w,d) || dateListed(o,d)).map(([k,d])=>{
    const fw = pmAny(w,d.like), fo = pmAny(o,d.like);
    const fit = [fw>1?`${w.name} ♥`:fw<1?`${w.name} meh`:'', fo>1?`${o.name} ♥`:fo<1?`${o.name} meh`:''].filter(Boolean).join(' · ');
    return `<tr><td><b>${d.label}</b>${fit?` <span class="muted">(${esc(fit)})</span>`:''}<br><span class="muted">Trust + · Mood + · Bond +${d.bond}${d.lust?' · Lust +':''}</span></td><td>${fmt(d.cost)}</td><td class="muted">${samDateCost(d.energy)} energy</td><td><button class="sm" onclick="doubleDateRun('${w.id}','${o.id}','${k}')" ${S.gold<d.cost?'disabled':''}>Go</button></td></tr>`;
  }).join('');
  modal(`<h2>Double date: ${esc(w.name)} &amp; ${esc(o.name)}</h2><p class="muted">Take two of your lovers out together. Builds trust, mood, and their bond with each other — and if both are in the mood afterward, the night need not end early.</p>${ps.length>1?`<div class="row" style="margin-bottom:8px">${tabs}</div>`:`<div class="muted" style="margin-bottom:8px">${esc(doubleBondTag(w,o))}</div>`}<table>${rows}</table><div class="row"><button onclick="dateMenu('${w.id}')">Back</button></div>`);
}
function doubleDateRun(id, oid, dk){
  const w = findW(id), o = findW(oid), d = DOUBLE_DATES[dk]; if(!w || !o || !d) return;
  if(S.gold < d.cost) return toast('Not enough gold.');
  if(!useAP(samDateCost(d.energy))) return;
  S.gold -= d.cost;
  [w, o].forEach(x=>{
    const m = pmAny(x, d.like);
    gainTrust(x, Math.max(0.5, d.trust * m * (0.9 + Math.random()*0.25)));
    moodAdd(x, Math.round(d.mood * m));
    if(d.lust) fitLust(x, d.lust);
    if(d.lewd) lewdUp(x, Math.round(d.lewd * (m>1?1.3:1)), d.lewdCap||45);
    checkUnlocks(x);
  });
  const bv = addBond(w, o, d.bond);
  const acts = duoActs(w, o);
  const spark = acts.length && w.mood>=45 && o.mood>=45 && ((w.lust||0)>=25 || (o.lust||0)>=25 || bv>=20);
  const body = `${bondFill(d.intro, w, o)}\n\n${bondFill(d.lines, w, o)}\n\nTrust + · Mood + · ${doubleBondTag(w, o)} · −${fmt(d.cost)}`;
  samLog(`Double date (${d.label}): ${w.name} & ${o.name}`);
  save(); render(); closeModal();
  if(!spark) return showResult(`${d.label}: ${w.name} & ${o.name}`, body, w.id, 'ddate_'+dk);
  const lead = d.threesomeLead && d.threesomeLead.length ? bondFill(d.threesomeLead, w, o) : `${w.name} and ${o.name} linger together outside your door, clearly reluctant for the evening to end.`;
  modal(`<h2>${esc(d.label)}: ${esc(w.name)} &amp; ${esc(o.name)}</h2><div id="ddImg"></div><p class="story">${esc(body + '\n\n' + lead)}</p><div class="row"><button class="primary" onclick="doubleThreesomeMenu('${w.id}','${o.id}')">🔥 Invite them to your bed (${samPrivCost(12,true)} energy)</button><button onclick="closeModal()">Goodnight</button></div>`, {lock:true});
  showImg('ddImg', w.id, 'ddate_'+dk);
}
function doubleThreesomeMenu(id, oid){
  const w = findW(id), o = findW(oid), acts = w && o ? duoActs(w, o) : [];
  if(!w || !o || !acts.length) return closeModal();
  const need = samPrivCost(12, true);
  const btns = acts.map(a=>`<button class="sm" onclick="doubleThreesomeRun('${w.id}','${o.id}','${a}')">${esc(samActLabel(a))}</button>`).join(' ');
  modal(`<h2>Late Night Together: ${esc(w.name)} &amp; ${esc(o.name)}</h2><p class="muted">Both of your lovers are wide awake and willing. Pick what the three of you share tonight (Sam takes ${need} energy, no action).</p><div class="row">${btns}</div><div class="row"><button onclick="closeModal()">Never mind</button></div>`);
}
function doubleThreesomeRun(id, oid, act){
  const w = findW(id), o = findW(oid); if(!w || !o) return closeModal();
  const need = samPrivCost(12, true);
  if(S.sam.energy < need) return toast('Sam is too tired.');
  S.sam.energy -= need;
  const lead1 = `Behind the latched door, ${w.name} and ${o.name} waste no time shucking their clothes and pulling you onto the bed—warm hands, slick mouths, and soft breasts pressing against you from both sides.`;
  const t1 = privateCore(w, act, {lead:lead1, turn:false});
  const t2 = privateCore(o, act, {lead:`${o.name} presses right in beside her, trading breaths and kisses as the two of them share you without an ounce of jealousy.`, turn:false});
  addBond(w, o, 6);
  samStat('technique', 3); samXP(6);
  samLog(`Shared night with ${w.name} & ${o.name} [${samActLabel(act)}]`);
  save(); render(); closeModal();
  showResult(`Three in One Bed (${samActLabel(act)})`, `${t1}\n\n${t2}\n\n${doubleBondTag(w, o)}`, w.id, 'duo:'+act+':'+o.id);
}
// Daring variants offered on a date (dates.json → spicy). With acts: the one she'd do (favorite, else the highest-th she's keen on, else the first she's comfortable with).
function spicyAct(w, sp){
  const ok = (sp.acts||[]).filter(a=>canSam(w,a)); if(!ok.length) return null;
  const fav = pickFav(w, ok); if(fav) return fav;
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
  if(!useAP(samDateCost(d.energy))) return; S.gold -= cost;
  const m = pmAny(w,d.like), tg = gainTrust(w, d.trust * (hasPast('support') ? 1.2 : 1) * (has(w,'Romantic')?1.4:1) * (d.trustMult||1) * m);
  moodAdd(w, d.mood*m - (m<1?3:0)); w.dates++; w._samTime = (w._samTime||0) + 1;   // a date counts as time with Sam (lovers' neglect)
  const lg = d.lewd ? lewdUp(w, d.lewd * (m>1 ? 1.25 : m<1 ? 0.6 : 1), d.lewdCap) : 0;
  if(d.lust){ w.lust += d.lust * fxMul(w,'lustBuild'); fitLust(w); }
  if(d.restores) w.energy = clamp(w.energy + d.restores, 0, maxEnergy(w));
  if(d.greedyMood && has(w,'Greedy')) moodAdd(w, d.greedyMood);
  Object.entries(d.stats||{}).forEach(([s,n])=>statXP(w, s, n));
  Object.entries(d.skills||{}).forEach(([s,n])=>grow(w, s, n));
  if(d.pop) w.popularity = clamp(w.popularity + d.pop);
  if(d.gift) countUp(w,'gifts');
  let trinket = '';
  if(d.trinket && Math.random() < d.trinket){ moodAdd(w, 5); countUp(w,'gifts'); trinket = `\n\nYou pick up ${pick(GIFTS)} for her on the way.`; }
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
  const inviteTxt = nightIn ? `The fire burns low. ${w.name} looks up at you, and doesn't look away.` : dateAfterTxt(d, 'invite', w);
  modal(`<h2>${esc(d.label)} with ${esc(w.name)}</h2><div id="resImg"></div><p class="story">${esc(txt)}</p>
    ${sparks?`<div id="invImg"></div><div id="propAi"><p class="story pink">${esc(inviteTxt)}</p></div>`:''}
    ${first?`<p class="story pink">On the way back, something has shifted between you. ${esc(w.name)} keeps finding reasons to stand a little closer.</p>`:''}
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
  const lead = String(Array.isArray(sp.lead) ? pick(sp.lead) : sp.lead).replace(/\{name\}/g, w.name), act = sp.nude ? null : spicyAct(w, sp), label = sp.label.toLowerCase() + ' on a date (' + d.label.toLowerCase() + ')';
  let text, scene, ai;
  if(act){
    text = privateCore(w, act, {lead, turn: (sp.acts||[]).length > 1, cap: sp.cap}); lewdUp(w, sp.gain, sp.cap); scene = 'samact:'+act+'~~date_'+k+(sp.image ? '.'+i : '');
    ai = {kind:'private', act, scene, forSam:true, situation:label};
  } else {
    lewdUp(w, sp.gain, sp.cap); moodAdd(w, 4); w.lust += 6; fitLust(w); minorTrust(w); text = lead; scene = 'date_'+k;
    if(sp.image && sp.image.comp){ const di = d.image || {}, im = {comp:sp.image.comp, setting:sp.image.setting || di.setting, sam:true}; ['undress','bath','away','swim'].forEach(f=>{ if(di[f] != null) im[f] = di[f]; }); scene = dynScene('date_'+k+'_sp'+i, Object.assign(im, {label:d.label+': '+sp.label})) || scene; }
    ai = {kind:'private', scene, forSam:true, situation:label, cloth:'nude'};
  }
  if(Math.random() < (sp.risk||0)){
    if(has(w,'Exhibitionist')){ moodAdd(w, 5); lewdUp(w, 2, 95); text += `\n\nSomeone saw. ${w.name} looks far too pleased about it.`; }
    else { moodAdd(w, -5); text += `\n\nSomeone nearly walks in on you. ${w.name} is mortified, and laughing about it by the time you get home.`; }
    repAdd(houseOf(w), 0.5);
  }
  samLog(`${sp.label} with ${w.name} (${d.label})`); checkUnlocks(); save(); render(); closeModal();
  // the evening may not be over: if it sparks, the result screen leads on to the invitation; otherwise it ends here
  const A = DATE_AFTER && DATE_AFTER.id===id && DATE_AFTER.k===k ? DATE_AFTER : null;
  const more = A && dateSparks(w, A.m);
  if(!more){ DATE_AFTER = null; text += '\n\n' + dateAfterTxt(d, 'home', w); }
  showResult(`${sp.label}: ${w.name}`, text, w.id, scene, ai, more ? {label:'Continue ♥', onclick:`dateAfterSpicy('${id}')`} : null);
}
// Demonstration class (balance.json → lessons.demo): Sam and a partner show the others how it's done. She has to be open to an
// audience (lewdness >= openLewd or Exhibitionist, never Modest) and the service goes through canSam/bestSamAct like any time with Sam.
function demoAct(w){ return bestSamAct(w) || null; }
function demoOpen(w){ const D = (BAL.lessons||{}).demo || {}; if(has(w,'Modest')) return false; return has(w,'Exhibitionist') || w.lewd >= (D.openLewd ?? 45); }
function demoMenu(){
  const D = (BAL.lessons||{}).demo || {}, pool = S.workers.filter(nearSam);
  const ok = pool.filter(w=>demoAct(w) && demoOpen(w)), shy = pool.filter(w=>demoAct(w) && !demoOpen(w));
  modal(`<h2>A Demonstration</h2><p class="muted">Sam and a partner show the staff ${samReach()?'across every house':`at ${esc(samHouse().name)}`} how it's done. Everyone watching learns that service and gets worked up; she does her favorite (or the furthest they've gone). She has to be comfortable with an audience. Repeat partners may develop a taste for it. (${samTrainCost(D.energy ?? 30)} energy)</p>
    ${ok.length ? `<div class="row">${ok.map(w=>`<button onclick="samDemo('${w.id}')">${esc(titled(w))} · ${esc(actLabel(demoAct(w)))}</button>`).join('')}</div>` : '<p>Nobody here is ready for an audience yet.</p>'}
    ${shy.length ? `<p class="muted">Not in front of everyone: ${shy.map(w=>esc(w.name)+(has(w,'Modest')?' (modest)':'')).join(', ')}</p>` : ''}
    <div class="row"><button onclick="closeModal()">Back</button></div>`);
}
function samDemo(id){
  const w = findW(id), D = (BAL.lessons||{}).demo || {}; if(!w) return;
  if(!nearSam(w)) return toast(`${w.name} is at another house.`);
  const act = demoAct(w); if(!act || !demoOpen(w)) return toast(`${w.name} isn't up for that.`);
  if(!useAP(samTrainCost(D.energy ?? 30))) return;
  const text = privateCore(w, act, {lead: flavor('demo_lead', w)});
  countUp(w, 'demos'); lewdUp(w, 1, svcLewdCap(act,'client') + 10);
  const g = (6 + (S.sam.technique||0)/20) * (D.watchSkill ?? 0.5) * lessonMul(), cap0 = svcLewdCap(act,'client'), watchers = S.workers.filter(o=>o!==w && nearSam(o));
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
const orgyCost = n => { const O = BAL.orgy || {}, per = Math.max(8, (O.perGirl ?? 20) - samUpFx('orgyEnergy')); return Math.round(per * n + (O.ramp ?? 0) * n * (n-1) / 2); };
function orgyOpen(w){ const O = BAL.orgy || {}; return !has(w,'Modest') && (w.lewd >= (O.openLewd ?? 50) || has(w,'Exhibitionist') || w.lust >= LUST_EAGER); }
function orgyWhy(w){ const O = BAL.orgy || {};
  if(!orgyAct(w)) return (w.intim||0)===0 ? "she and Sam haven't crossed that line" : canSam(w,'kiss') && !getActs().some(a=>actTierOf(a) >= (O.minTier ?? 2) && canSam(w,a.id)) ? 'only kisses and massages with Sam so far' : "not comfortable with Sam yet";
  if(has(w,'Modest')) return 'too modest to share'; if(!orgyOpen(w)) return 'not ready to share him';
  if(w.energy < (O.minEnergy ?? 15)) return 'too tired'; return ''; }
// what she does on a group night: her favorite if it goes past the first tier, else her lovers-only one or a pick from the furthest tier she's comfortable with.
// Nothing below orgy.minTier (kisses and massages are too tame for it): without such a service she can't join.
function orgyAct(w){ const mt = (BAL.orgy||{}).minTier ?? 2, ok = id => id && canSam(w,id) && samStance(w,id)==='yes' && actTier(id) >= mt;
  const fav = actArr(w.fav).find(ok); if(fav) return fav;
  const all = getActs().filter(a=>ok(a.id)); if(!all.length){ const b = bestSamAct(w); return b && actTier(b) >= mt ? b : null; }
  const top = Math.max(...all.map(actTierOf)), pool = all.filter(a=>actTierOf(a)===top), lv = pool.find(a=>isLovers(w,a.id));
  return lv ? lv.id : pick(pool).id; }
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
    return `<button class="${on?'primary':''}" ${why?`disabled title="${esc(why)}"`:''} onclick="orgyPick('${w.id}')" ${other?'style="opacity:.6"':''}>${on?'✓ ':''}${esc(titled(w))} <span class="muted" title="Lust: ${esc(lustLabel(w))}">🔥${knows(w,true) ? `${Math.round(w.lust||0)}/${Math.round(lustProfile(w).max)}` : '?'}</span>${why?` <span class="muted">(${esc(why)})</span>`:''}</button>`; };
  const houses = S.houses.map(h=>{ const ws = S.workers.filter(w=>w.house===h.id && (orgyAct(w) || (w.intim||0) > 0)); return ws.length ? `<h3 style="margin-top:8px">${esc(h.name)}</h3><div class="row">${ws.map(btn).join('')}</div>` : ''; }).join('');
  modal(`<h2>Gather the girls</h2><p class="muted">One night, ${O.min ?? 2}-${O.max ?? 5} ladies. Each does the furthest she's comfortable with (or her favorite) with Sam (spending her lust), and everyone gets closer to everyone. ${samReach()?'Sam can bring them together from any house.':'All from one house (picking someone from another house starts over).'} One action; ${O.perGirl ?? 20} of Sam's energy per lady.</p>
    ${houses || '<p>Nobody is there yet with Sam.</p>'}
    <div class="row" style="margin-top:10px"><button class="primary" ${n < (O.min ?? 2) || S.sam.energy < cost || S.ap <= 0 ? 'disabled' : ''} onclick="samOrgy()">🔥 Tonight (${n} · ${cost} energy${S.sam.energy < cost ? ', Sam is too tired' : ''})</button><button onclick="ORGY=null;closeModal()">Back</button></div>`);
}
// Fem/fem act for two bonded ladies in an orgy: uses services with pair.fem + image.fem.
function orgyFemAct(a, b){
  const pref = ['oral_give','oral_get','manual_give','manual_get','breast_give','breast_get','kiss'];
  const ok = id => {
    const A = actById(id);
    return A && A.pair && A.pair.fem && A.pair.fem.length && A.image && A.image.fem && A.image.fem.length && !actBanned(a, id) && !actBanned(b, id);
  };
  const comfy = pref.filter(id => ok(id) && canSam(a, id) && canSam(b, id));
  if(comfy.length) return pick(comfy);
  const open = pref.filter(id => ok(id) && Math.min(inclination(a, id), inclination(b, id)) >= ((actById(id)||{}).th||0) - 10);
  if(open.length) return pick(open);
  return ok('kiss') ? 'kiss' : null;
}
function orgyFemText(act, a, b){
  const F = FLAVOR.orgy_fem || {}, list = (F[act] && F[act].length) ? F[act] : (F._default || []);
  const na = a.name.split(' ')[0], nb = b.name.split(' ')[0];
  if(list.length) return pick(list).replace(/\{a\}/g, na).replace(/\{b\}/g, nb);
  const P = ((actById(act)||{}).pair||{}).fem || [];
  return P.length ? pick(P).replace(/\{name\}/g, na).replace(/\{partner\}/g, nb) : '';
}
function samOrgy(){
  const O = BAL.orgy || {}, ws = (ORGY ? ORGY.sel : []).map(findW).filter(w=>w && !orgyWhy(w));
  if(ws.length < (O.min ?? 2)) return toast('Not enough company for that.');
  if(!samReach() && ws.some(w=>w.house !== ws[0].house)) return toast('They need to be in the same house.');
  if(!useAP(orgyCost(ws.length))) return;
  ORGY = null;
  const first = ws[0], names = ws.map(w=>w.name.split(' ')[0]), list = names.length > 1 ? names.slice(0,-1).join(', ') + ' and ' + names[names.length-1] : names[0];
  const C = {names:list, first:names[0], house:houseOf(first).name};
  // Check bonded pairs before applying this night's bond gain so high-bond pairs trigger fem/fem scenes.
  const femPairs = [], usedFem = new Set(), candPairs = [];
  for(let i=0;i<ws.length;i++) for(let j=i+1;j<ws.length;j++){
    const v = bondV(ws[i], ws[j]);
    if(v >= (O.femBond ?? 25)) candPairs.push({a:ws[i], b:ws[j], v});
  }
  candPairs.sort((x,y)=>y.v - x.v + (Math.random()-0.5)*10);
  candPairs.forEach(({a, b})=>{
    if(femPairs.length >= 2 || usedFem.has(a.id) || usedFem.has(b.id)) return;
    const act = orgyFemAct(a, b); if(!act) return;
    usedFem.add(a.id); usedFem.add(b.id);
    addBond(a, b, O.femBondBonus ?? 3); moodAdd(a, 2); moodAdd(b, 2);
    femPairs.push({a, b, act, text: orgyFemText(act, a, b)});
  });
  const beats = ws.map(w=>{ const act = orgyAct(w), line = privateCore(w, act, {lead:''});
    lewdUp(w, O.lewd ?? 2, svcLewdCap(act,'sam') + (O.lewdCapPlus ?? 10)); moodAdd(w, O.mood ?? 4); countUp(w, 'orgies');
    spendLust(w, O.lustAfter ?? 20);   // the whole night spends her, whatever she did with Sam
    return {w, act, text: line + (has(w,'Devoted') ? '\n\n' + flavor('orgy_lover', w) : '')}; });
  for(let i=0;i<ws.length;i++) for(let j=i+1;j<ws.length;j++) addBond(ws[i], ws[j], O.bond ?? 6);
  const pairs = []; const P = ws.filter(w=>!usedFem.has(w.id)).sort(()=>Math.random()-0.5);
  for(let i=0;i+1<P.length && pairs.length + femPairs.length < 2; i+=2) pairs.push(flavor('orgy_pair', P[i], {a:P[i].name.split(' ')[0], b:P[i+1].name.split(' ')[0]}));
  samLog(`A night with ${list}`); checkUnlocks(); save(); render();
  const scene = 'orgy:' + ws.map(w=>w.id).join(',');
  modal(`<h2>A Night with ${esc(list)}</h2><div id="resImg"></div>
    <p class="story">${esc(flavor('orgy_lead', first, C))}</p>
    ${beats.map((b,i)=>`<h3 style="margin-top:10px">${esc(b.w.name)} <span class="muted">· ${esc(actLabel(b.act))}</span></h3><p class="story">${esc(b.text)}</p><button class="sm" id="og${i}_t" onclick="toggleImgBtn('og${i}','${b.w.id}','samact:${b.act}')">🖼 Show image</button><div id="og${i}" class="hlimg" data-ext="1"></div>`).join('')}
    ${femPairs.map((fp,i)=>`<h3 style="margin-top:10px">${esc(fp.a.name.split(' ')[0])} &amp; ${esc(fp.b.name.split(' ')[0])} <span class="muted">· ${esc(actLabel(fp.act))} (bond)</span></h3><p class="story">${esc(fp.text)}</p><button class="sm" id="ogf${i}_t" onclick="toggleImgBtn('ogf${i}','${fp.a.id}','pair:${fp.act}:fem:${fp.b.id}')">🖼 Show image</button><div id="ogf${i}" class="hlimg" data-ext="1"></div>`).join('')}
    ${pairs.length ? `<p class="story">${esc(pairs.join(' '))}</p>` : ''}
    <p class="story">${esc(flavor('orgy_end', first, C))}</p>
    <p class="muted">Everyone: lust spent, lewdness +, mood + · Bonds +${O.bond ?? 6} between every pair${femPairs.length?` (+${O.femBondBonus ?? 3} extra for bonded pairs)`:''} · ${orgyCost(ws.length)} of Sam's energy</p>
    ${SET.ai.on?'<div id="resAi"></div>':''}<div class="row">${aiBtn('resAi','private',first.id,{act:beats[0].act, scene, forSam:true, situation:`a night together: Sam with ${list} all at once`})}<button class="primary" onclick="closeModal()">OK</button></div>`);
  $('#modal').scrollTop = 0; showImg('resImg', first.id, scene);
}
