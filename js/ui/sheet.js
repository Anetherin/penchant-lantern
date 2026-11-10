'use strict';
/* ---------- Character sheet ---------- */
function sheetScenes(w){
  const out = ['portrait','casual'];
  if(SCENES['job_'+w.job] && w.job!=='rest') out.push('job_'+w.job);
  out.push('companion');
  if(houseOf(w).up.bath) out.push('bath');
  out.push('sam_date', ...Object.keys(DATES).filter(k=>DATES[k].image).map(k=>'date_'+k), 'sam_training','shower','walkin');
  getActs().forEach(a=>{ if(canClient(w,a.id)) out.push('act:'+a.id); });
  getActs().forEach(a=>{ if(canSam(w,a.id)) out.push('samact:'+a.id); });
  return out;
}
function openSheet(id){
  const w = findW(id); if(!w) return; ensureWorker(w);
  const scenes = sheetScenes(w);
  modal(`<div class="sheet"><div>
      <div class="row"><select id="sceneSel" onchange="fillCloth();sheetImg()">${scenes.map(s=>`<option value="${s}">${esc(sceneInfo(s,w).label)}</option>`).join('')}</select>
      <select id="clothSel" onchange="sheetImg()"></select></div>
      <div id="sheetImg"></div></div>
    <div id="sheetInfo"></div></div>`, {wide:true});
  $('#modal').scrollTop = 0;
  SHEET = id;
  fillCloth(); refreshSheetInfo();
  sheetImg(SET.autoPortrait ? 'auto' : undefined);
}
function fillCloth(){
  const w = findW(SHEET); const s = $('#sceneSel'), c = $('#clothSel'); if(!w||!s||!c) return;
  const scene = s.value, withSam = scene.startsWith('sam'), def = defaultCloth(w, scene);
  c.innerHTML = CLOTH.map(x=>{ const ok = clothOK(w,x.id,withSam); return `<option value="${x.id}" ${x.id===def?'selected':''} ${ok?'':'disabled'}>${ok?'':'🔒 '}${x.label}${x.id==='under'&&w.under==='none'?' (none worn)':''}</option>`; }).join('');
}
function sheetImg(mode){ const s=$('#sceneSel'), c=$('#clothSel'); if(!s||!SHEET) return; showImg('sheetImg', SHEET, s.value, c&&c.value, mode); }
function refreshSheetInfo(){
  if(!SHEET) return; const w = findW(SHEET); const box = $('#sheetInfo'); if(!w || !box) return;
  const k = knows(w,true), kp = knowsPrefs(w);
  const rows = getActs().filter(a=>!actBanned(w,a.id)).map(a=>{
    const cst = clientStance(w,a.id), sst = samStance(w,a.id), cc = cst!=='no', on = w.menu.includes(a.id);
    const pref = kp ? (w.fav===a.id?' <span title="Favorite" class="good">★</span>':'') + (w.dislike===a.id?' <span title="Dislikes" class="warn">✗</span>':'') + (w.lovers===a.id?' <span title="Lovers only: with clients only if very lewd" class="pink">♥</span>':'') : '';
    return `<tr><td>${esc(a.label)}${pref}</td><td>${sv(w,actSkill(w,a.id),true)}</td>
      <td>${cst==='no'&&kp&&w.lovers===a.id?'<span class="pink">♥ lovers</span>':STANCE[cst]}${k?` <span class="muted" title="Her willingness (lewdness + comfort) / what this service needs, on the same 0-1000 scale as Lewdness.">${lShow(inclination(w,a.id)-(w.lovers===a.id?30:0))}/${lShow(a.th)}${cst==='ask'?'':cst==='no'&&inclination(w,a.id)-(w.lovers===a.id?30:0)>=a.th-ASK_BAND?` (trust ${tShow(trustNeed(a.th-inclination(w,a.id)+(w.lovers===a.id?30:0)))})`:''}</span>`:''}</td>
      <td>${sst!=='no' && !crossed(w,a.id) ? `<span class="muted" title="She'd be comfortable with it, but she and Sam haven't crossed that line yet">🔒</span>` : STANCE[sst]}</td>
      <td><input type="checkbox" ${on?'checked':''} ${cc?'':'disabled'} onchange="toggleMenu('${w.id}','${a.id}',this.checked)"></td></tr>`;
  }).join('');
  const cl = comfortCloth(w,false,true), cs = comfortCloth(w,true,true);
  const o = getOutfit(w), u = getUnder(w);
  const anySam = getActs().some(a=>canSam(w,a.id));
  const arcTxt = ARCS[w.key] ? `<div class="pink">♥ Story: ${(w.arc||0)>=ARCS[w.key].length ? 'Lovers' : `chapter ${w.arc||0}/${ARCS[w.key].length}${(w.arc||0)<ARCS[w.key].length?` <span class="muted">(next: ${ARCS[w.key][w.arc||0].title})</span>`:''}`}${!w.arc&&w.trust<BAL.arcs.need[0]?` <span class="muted">(begins once she trusts Sam: ${tShow(BAL.arcs.need[0])})</span>`:''}</div>` : '';
  box.innerHTML = `<div class="status"><h3>[ STATUS ] ${esc(w.name)}</h3>
    <div class="muted">${raceLabel(w)} · Age ${w.age} · ${esc(w.personality)} · Style: ${w.style} · ♥ ${sw(w.favColor)}${w.favColor}</div>
    <p class="story" style="margin:6px 0" id="bs_${w.id}">${esc(w.backstory)}</p>${SET.ai.on&&!w.named?`<button class="sm" onclick="if(confirm('Replace her backstory with a new AI-written one?'))aiBackstory('bs_${w.id}','${w.id}')">✨ Rewrite backstory</button>`:''}<div>${traitTags(w)}</div>${arcTxt}${firstsLine(w)}${(()=>{ if(!S.workers.includes(w)) return ''; seedBonds(); const bl = bondLines(w); return bl.length ? `<div class="muted">🤝 ${bl.map(esc).join(' · ')}</div>` : ''; })()}
    <div class="muted">Body: ${esc(bodyLabel(w))}${w.unique?` · <span class="pink" title="${esc(w.unique.desc||'')}">★ ${esc(w.unique.name)}</span>`:''}</div>
    <div class="sgrid" style="margin-top:8px">${STAT_KEYS.map(s=>`<div><span>${s.toUpperCase()}</span><b>${sv(w,w.stats[s],true)}</b></div>`).join('')}</div>
    <div class="sgrid" style="margin-top:6px">${TECH_KEYS.map(s=>`<div><span>${TECH_LABEL[s].toUpperCase()}</span><b>${sv(w,w.tech[s],true)}</b></div>`).join('')}<div><span>POPULARITY</span><b>${Math.round(w.popularity)}</b></div>${trustCell(w)}<div title="${k?'':'Appraisal Lv 2 or more trust'}"><span>LEWDNESS</span><b>${k?lShow(w.lewd):'?'}</b></div></div>
    <div style="margin-top:8px">${bar('Energy',w.energy,maxEnergy(w),'e')}${bar('Mood',w.mood,100,'m')}${k?lustBar(w, 'Lust ('+lustLabel(w)+')'):''}${bar('Health',w.health,100,'h')}</div>
    <div class="muted" style="margin-top:6px">Race perk: <b>${RACE_PERK[w.race]?RACE_PERK[w.race].label:''}</b>: ${RACE_PERK[w.race]?RACE_PERK[w.race].desc:''}</div>
    <div class="muted">Comfortable up to: <b>${CLOTH.find(c=>c.id===cl).label}</b> with clients · <b>${CLOTH.find(c=>c.id===cs).label}</b> with Sam${has(w,'Modest')?`<br><span class="pink">Modest:</span> ${esc(flavor('modest', w))}`:''}</div>
    ${persLine(w)}${(HOUSES[houseOf(w).id].minPop||0) > w.popularity ? `<div class="warn">⚠️ Below ${esc(houseOf(w).name)}'s standard (popularity ${HOUSES[houseOf(w).id].minPop}). Escort clients pay less and complain.</div>`:''}</div>
    <div class="row" style="margin-top:8px">👗 <b>${esc(o.label)}</b>${usesColor(o)?` ${sw(w.outColor)}${w.outColor}`:''} · 🩲 ${esc(u.label)}${w.under!=='none'&&usesColor(u)?` ${sw(w.underColor)}${w.underColor}`:''} <button class="sm" onclick="openWardrobe('${w.id}')">Wardrobe</button></div>
    <div class="row" title="How she looks in service images (visual only). The dress level can't go past what she's comfortable with.">🎀 Service outfit <select onchange="setSvcOutfit('${w.id}',this.value)"><option value="">Same as work</option>${ownedOutfits(w).map(k=>`<option value="${k}" ${w.svcOutfit===k?'selected':''}>${esc(WARDROBE[k].label)}</option>`).join('')}${w.customOutfit?`<option value="custom" ${w.svcOutfit==='custom'?'selected':''}>Her own outfit</option>`:''}</select>
      Dress level <select onchange="setSvcLevel('${w.id}',this.value)"><option value="auto">Auto</option>${CLOTH.map(c=>{ const ok = clothOK(w,c.id,true); return `<option value="${c.id}" ${(w.svcLevel||'auto')===c.id?'selected':''} ${ok?'':'disabled'}>${ok?'':'🔒 '}${c.label}</option>`; }).join('')}</select></div>
    <h3 style="margin-top:10px">Services</h3>
    <table><tr><th>Service</th><th>Skill</th><th>Clients</th><th>Sam</th><th>Menu</th></tr>${rows}</table>
    <div class="muted" style="font-size:12px">✓ she enjoys it · 🔒 (Sam) she'd be fine with it, but they haven't gotten that far yet · ~ she'll do it because she trusts Sam (costs mood; lewdness grows faster) · ✗ a line she won't cross yet. Numbers: her inclination / the service's line (on the 0-1000 Lewdness scale; Skill is out of 1000 too).<br>${kp?'★ favorite (mood +) · <span class="warn">✗</span> after a name = dislikes (mood −) · ♥ lovers only':'Her preferences show at trust 400 or Appraisal Lv 3.'} · Menu = what she offers clients.</div>
    <div class="row" style="margin-top:4px" title="Clients may proposition her for menu services. Courtesans, dancers and bath attendants always serve them. Others: On = usually accepts, Ask me = she decides (lust and mood), Off = no (unless she is reckless). Each accepted proposition costs ${Math.round(BAL.props.penalty*100)}% of her main job's output (max ${Math.round(BAL.props.maxPenalty*100)}%).">Open to propositions ${JOBS[w.job].must ? '<span class="muted">always (this job offers its menu)</span>' : `<select onchange="setOffDuty('${w.id}',this.value)"><option value="on" ${w.offDuty==='on'?'selected':''}>On</option><option value="ask" ${w.offDuty==='ask'?'selected':''}>Ask me</option><option value="off" ${w.offDuty==='off'?'selected':''}>Off</option></select>`}</div>
    ${w.job==='teacher' ? `<div class="row">Subject ${teachSelect(houseOf(w), w)}</div>` : ''}
    ${w.job==='promoter' ? `<label class="chk"><input type="checkbox" ${w.samples&&!has(w,'Modest')?'checked':''} ${has(w,'Modest')?'disabled':''} onchange="setSamples('${w.id}',this.checked)"> Hand out free samples (bigger draw, tiring, can cheapen the house)${has(w,'Modest')?' <span class="muted">· too modest</span>':''}</label>` : ''}
    <label class="chk"><input type="checkbox" ${w.autoRest?'checked':''} onchange="setAutoRest('${w.id}',this.checked)"> Auto-rest when worn out (below 35% energy), back to work at 85%</label>
    <div class="row" style="margin-top:10px">Job <select onchange="setJob('${w.id}',this.value)">${jobOptions(w)}</select>
      ${w.locked?`<span class="tag house">🏠 Bound to ${esc(H(w.locked)?H(w.locked).name:'')}</span>`:''}${S.houses.length>1&&!w.locked?`House <select onchange="setHouse('${w.id}',this.value)">${S.houses.map(h=>`<option value="${h.id}" ${h.id===w.house?'selected':''}>${esc(h.name)}</option>`).join('')}</select>`:''}</div>
    <div class="row">${isFree(w)?`<span class="pink">${w.isPartner?'♥ Partner':'★ Devoted to the house'}: works without wages</span>`:`Wage <input type="number" value="${w.wage}" onchange="setWage('${w.id}',this.value)"> <span class="muted">(fair: ~${fmt(wageFor(w))}) · ${w.locked?'No contract (bound to the house)':'Contract '+w.contract+' wk'}</span>`}</div>
    <p class="muted" style="margin:2px 0">${esc(JOBS[w.job].desc)}</p>
    <h3 style="margin-top:10px">Time with Sam <span class="muted">(${S.ap} AP left)</span></h3>
    <div class="row"><button onclick="dateMenu('${w.id}')">🌙 Date / spend time…</button>${w.race==='demon'&&S.workers.includes(w)?`<button onclick="hireStud('${w.id}')" ${S.gold<SVC.demon.studCost||w._stud===S.week?'disabled':''} title="Pay a willing professional to be her meal for the night: lots of energy, no harm to anyone. Once a week.">🌹 Hire a stud (${fmt(SVC.demon.studCost)})</button>`:''}</div>
    <div class="row"><select id="trainSel"><option value="service">${TECH_LABEL.service}</option>${getActs().filter(a=>canSam(w,a.id)).map(a=>`<option value="act:${a.id}">Practice: ${esc(a.label)}</option>`).join('')}</select><button onclick="samTrain('${w.id}')">📚 Train</button>
      <button onclick="privateMenu('${w.id}')" ${anySam?'':`disabled title="${(w.intim||0)===0?'She and Sam haven\'t crossed that line yet.':'She isn\'t comfortable with that yet.'}"`}>🕯️ Private time</button></div>
    <div class="row"><button onclick="editWorker('${w.id}')">✏️ Edit design</button>${w.isPartner||w.locked?'':`<button onclick="dismiss('${w.id}')">Dismiss</button>`}${has(w,'Devoted')?`<button onclick="endLovers('${w.id}')">💔 End things</button>`:''}${w.exLover&&!has(w,'Devoted')?`<button onclick="rekindle('${w.id}')" ${w.trust<BAL.breakup.rekindleTrust?`disabled title="She needs trust ${tShow(BAL.breakup.rekindleTrust)}+"`:''}>💞 Ask her back</button>`:''}</div>`;
}
function persLine(w){
  const J = a => a.map(j=>JOBS[j]?JOBS[j].label:j).join(', ') || 'nothing in particular';
  return `<div class="muted">Jobs she'll do now: ${Object.keys(JOB_TRUST).filter(j=>w.trust>=jobTrust(w,j)).map(j=>JOBS[j].label).join(', ')||'none yet'}</div><div class="muted">Enjoys working as: <b>${J(jobLikes(w))}</b>${jobDislikes(w).length?` · Would rather not: <b>${J(jobDislikes(w))}</b>`:''}</div>`;
}
// Everything Sam carries: his past lives, New Game+ perks, and the cycle he's on.
function samPerksHTML(){
  const P = samPasts().filter(k=>PASTS[k]), B = (S.boons||[]).filter(k=>NG_BOONS[k]);
  const tag = (t, d) => `<span class="tag act" title="${esc(d)}">${t}</span>`;
  const tags = [...P.map(k=>tag('✧ '+esc(PASTS[k].label), PASTS[k].desc)), ...B.map(k=>tag('✦ '+esc(NG_BOONS[k].label), NG_BOONS[k].desc))];
  if(!tags.length) return '';
  return `<div style="margin-top:6px">${tags.join(' ')}</div>` + P.map(k=>`<div class="muted">Past life (${esc(PASTS[k].label)}): ${PASTS[k].desc}</div>`).join('') + B.map(k=>`<div class="muted">${esc(NG_BOONS[k].label)}: ${NG_BOONS[k].desc}</div>`).join('');
}
function viewSam(){
  const s = S.sam;
  return `<section class="card"><div class="status"><h3>[ STATUS ] Sam Takahashi</h3>
      <div class="muted">Human · Reincarnated${(S.cycle||1)>1?` ×${S.cycle}`:''} · Former ${samPasts().filter(k=>PASTS[k]).map(k=>PASTS[k].label.toLowerCase()).join(', ')||'office worker'} · Owner of ${S.houses.map(h=>esc(h.name)).join(', ')}</div>
      <p style="margin:6px 0">Nice guy, mild nerd, recently hit by a truck. Somehow in the pleasure-house business.${s.first?' Has never so much as held hands.':''}</p>
      <div class="sgrid">${['charm','business','strength','technique'].map(k=>`<div><span>${k.toUpperCase()}</span><b>${Math.round(s[k])}</b></div>`).join('')}<div><span>APPRAISAL</span><b>Lv ${s.appraisal}</b></div><div><span>APP. XP</span><b>${s.appXP}</b></div></div>
      <div style="margin-top:8px">${bar('Energy',s.energy,100,'e')}${bar('XP to Lv '+((s.lvl||1)+1),s.xp||0,xpNeed(s.lvl||1),'t')}</div><div>Level <b>${s.lvl||1}</b> · Actions left this week: <b>${S.ap}/${apMax()}</b> <span class="muted">(+1 action at levels 5 and 10)</span></div>
      ${S.samWeek.acts.length?`<div class="muted">This week: ${S.samWeek.acts.map(esc).join(' · ')}</div>`:''}
      ${samPerksHTML()}</div></section>
    <section class="card"><h2>Work</h2>
      <div class="row"><button onclick="samWork('bartend')">🍺 Tend bar</button><button onclick="samWork('security')">🛡️ Stand watch</button><button onclick="samWork('books')">📒 Do the books</button><button onclick="samWork('scout')">🔍 Scout recruits</button><button onclick="samWork('rounds')">🚶 Make the rounds</button></div>
      <div class="row"><select id="lessonSel">${TECH_KEYS.map(s=>`<option value="${s}">${TECH_LABEL[s]}</option>`).join('')}</select><button onclick="samWork('lesson')">🎓 Hold a lesson</button></div>
      <p class="muted">Tend bar earns gold now (Charm). Watch reduces trouble in every house (Strength). Books cut upkeep (Business). Scouting adds candidates and Appraisal XP. Rounds: a little trust and mood for every lady. Lessons train everyone whose job uses that skill (one-on-one training is for services).</p></section>
    <section class="card"><h2>Errands</h2><div class="row"><button onclick="samGuild()">⚔️ Adventurers' Guild</button><button onclick="samRest()">😴 Rest (+${samRecover(BAL.samHome.nap)} energy)</button></div></section>
    ${samHomeCard()}
    <section class="card"><h2>Spend Time with Someone</h2><div class="grid">${S.workers.map(w=>workerCard(w, S.houses.length>1)).join('')}</div></section>`;
}
function sleepInRow(sh){
  const L = S.workers.filter(w=>sleepInOK(w)), cur = sleepInLady();
  return `<div class="row"><div style="flex:1">Shares his bed: <select onchange="setSleepIn(this.value)"><option value="">Nobody</option>${L.map(w=>`<option value="${w.id}" ${cur&&cur.id===w.id?'selected':''}>${esc(w.name)}</option>`).join('')}</select>
    <div class="muted">One lady of this house (trust ${tShow(BAL.sleepIn.trust)}+) sleeps in the Owner's Suite: a little trust and mood each week, both rest better, and now and then she has ideas of her own. Changing is free, once a week.</div></div></div>`;
}
function samHomeCard(){
  const sh = samHouse(), tier = samBedTier();
  const upRow = ([k,u])=>`<div class="row"><div style="flex:1"><b>${esc(u.label)}</b> <span class="muted">${esc(u.desc)}${u.carry?'':' (left behind in New Game+)'}</span></div>${hasSamUp(k)?'<span class="tag act">✓ Owned</span>':`<button ${S.gold<u.cost?'disabled':''} onclick="buySamUp('${k}')">Buy · ${fmt(u.cost)}</button>`}</div>`;
  const all = Object.entries(BAL.samUps), ups = all.filter(([k,u])=>!u.tool).map(upRow).join(''), tools = all.filter(([k,u])=>u.tool).map(upRow).join('');
  const suite = hasSuite(sh);
  return `<section class="card"><h2>Home</h2>
    <div>Sam sleeps at <b>${esc(sh.name)}</b>${S.houses.length>1?` <select onchange="moveSam(this.value)">${S.houses.map(h=>`<option value="${h.id}" ${h.id===sh.id?'selected':''}>${esc(h.name)}</option>`).join('')}</select>`:''}</div>
    <div>Bed: <b>${BEDS[tier].label}</b>${suite?' (+1 from the Owner\'s Suite)':''} · Weekly recovery: <b>+${samRecover(BAL.samHome.weekly) + (samUpFx('weekly')||0)}</b> energy</div>
    <p class="muted">Late-night visits only come from ladies of this house${samReach()?' (not now: a Teleport Circle lets every house reach him)':''}. Moving is free, once a week.</p>${suite?'':`<p class="muted">Tip: build an Owner's Suite in ${esc(sh.name)} (House tab → Upgrades) for a better bed.</p>`}${suite?sleepInRow(sh):''}${ups}${tools?`<h3 style="margin:10px 0 4px">Tools of the trade</h3>${tools}`:''}</section>`;
}
function teachSelect(h, t){
  const cur = h.teachSkill && (TECH_LABEL[h.teachSkill] || actById(h.teachSkill)) ? h.teachSkill : '';
  return `<select onchange="setTeachSkill('${h.id}',this.value)"><option value="">Auto (${t ? esc(subjectLabel(teachSubject(h, t))) : 'her best skill'})</option>${TECH_KEYS.map(k=>`<option value="${k}" ${cur===k?'selected':''}>${TECH_LABEL[k]}</option>`).join('')}${getActs().map(a=>`<option value="${a.id}" ${cur===a.id?'selected':''}>${esc(a.label)}</option>`).join('')}</select>`;
}
function viewUpgrades(){
  const h = curH(), D = HOUSES[h.id];
  const dem = (k,built) => { const I = demolishInfo(h,k); return (built && I.ok) ? `<button style="font-size:12px;padding:3px 8px" title="Costs ${Math.round(BAL.demolish.share*100)}% of the base price; nothing is refunded." onclick="demolish('${k}')" ${S.gold<I.cost?'disabled':''}>Demolish · ${fmt(I.cost)}</button>` : ''; };
  const card = (k,label,desc,cost,done,canDem,extra,blocked) => `<div class="wcard" style="cursor:default"><div class="winfo"><div class="wname">${label}</div><div class="muted">${desc}</div>
    <div class="row">${done?'<span class="good">✓ Built</span>':`<button onclick="buyUpgrade('${k}')" ${S.gold<cost||blocked?'disabled':''}>Buy · ${fmt(cost)}</button>`}${dem(k, canDem)}${extra||''}</div></div></div>`;
  const sizeTxt = k => { const n = AMENITY_SIZE[k] ?? 1; return n ? `${n} room${n>1?'s':''}` : 'no room'; };
  const incSel = h.up.incense ? `<select onchange="setIncense(this.value)" title="Burner mode">${[['calm','Calm'],['aphro','Aphrodisiac']].map(([m,l])=>`<option value="${m}" ${(h.incense||'calm')===m?'selected':''}>${l}</option>`).join('')}</select>` : '';
  const wsLine = h.up.workshop ? `<p class="muted">Workshop discount: <b>${Math.round(clamp(h.wsDisc||0,0,1)*100)}%</b> of the markup${S.workers.some(w=>w.house===h.id&&w.race==='dwarf')?'':' (no dwarf lives here, so it is not growing)'}.</p>` : '';
  const dt = Math.min(3,(h.decor||0)+1), drt = Math.min(3,(h.drinks||0)+1), DR = BAL.amenities.drinks, dk = h.drinks||0;
  const props = Object.entries(HOUSES).filter(([k])=>!H(k) && houseOffered(k)).map(([k,P])=>{ const locked = P.premium && ((S.sam.lvl||1) < P.level || S.rep < P.renown);
    return `<div class="wcard" style="cursor:default">${miniNamedAvatar(P.npc)}<div class="winfo"><div class="wname">${P.name} <span class="tag house">${P.loc}</span>${P.premium?' <span class="tag act">Premium</span>':''}${P.ngplus?' <span class="tag act">✦ NG+</span>':''}</div><div class="muted">${P.desc}</div>
    <div class="muted">Comes with ${NAMED[P.npc].name}${isHired(P.npc)?' (already with you)':''} · Rooms ${P.rooms} · Upkeep ~${fmt(P.upkeep+15*P.rooms)}/wk${P.minPop?` · Escorts should have popularity ${P.minPop}+`:''}</div>
    ${P.premium?`<div class="${locked?'warn':'good'}">Requires Sam level ${P.level} (now ${S.sam.lvl||1}) and renown ${P.renown} (now ${Math.round(S.rep)})</div>`:''}
    <div class="row"><button onclick="buyHouse('${k}')" ${S.gold<houseCost(k)||locked?'disabled':''}>Buy · ${fmt(houseCost(k))}</button>${S.houses.length>1?`<span class="muted">base ${fmt(P.cost)} +${Math.round(BAL.houses.priceStep*100*(S.houses.length-1))}% for the ${S.houses.length} houses you own</span>`:''}</div></div></div>`; }).join('');
  return `${houseTabs(false)}<section class="card"><h2>Upgrades: ${esc(h.name)} <span class="muted">(${roomsUsed(h)}/${houseSize(h)} rooms)</span></h2><div class="grid">
    ${card('room',`Add Bedroom (${h.rooms})`,'One courtesan per bedroom. Takes 1 room. +12g/wk.',upgradeCost(h,'room'),false,h.rooms>D.rooms)}
    ${card('quarters',`Add Staff Quarters (${h.quarters||0})`,'Sleeps 2 staff. Without a bed, staff sleep on the floor (poor rest, −mood). Takes 1 room. +6g/wk.',upgradeCost(h,'quarters'),false,(h.quarters||0)>D.quarters)}
    ${card('extraBed',`Add a Staff Bed (${bedsFor(h)} beds)`,`One more bed in the staff rooms, no extra space needed. Up to 2 extra per staff room (${h.extraBeds||0}/${maxExtraBeds(h)}). A bit cramped, but better than the floor. +3g/wk.`,upgradeCost(h,'extraBed'),(h.extraBeds||0)>=maxExtraBeds(h))}
    ${card('roomTier',`Refurbish Bedrooms (${ROOM_NAMES[h.tier]})`,'Higher service prices and satisfaction. Changes room scenes.',upgradeCost(h,'roomTier'),h.tier>=3)}
    ${card('beds',`Better Beds (${BEDS[h.beds||0].label})`,`Staff recover more energy. Next: ${BEDS[Math.min(3,(h.beds||0)+1)].label} (rest ${BEDS[Math.min(3,(h.beds||0)+1)].rest}). Proper beds keep a lady even at about 3–4 clients a week.`,upgradeCost(h,'beds'),(h.beds||0)>=3)}
    ${card('annex','Build an Annex','+3 rooms of space. +30g/wk.',upgradeCost(h,'annex'),!!h.annex)}
    ${card('decor',`Décor (${DECOR[h.decor||0].label}) <span class="muted">(no room)</span>`,`${DECOR[h.decor||0].desc} ${(h.decor||0)>=3?'':`Next: ${DECOR[dt].label}, clients ×${BAL.amenities.decor.demand[dt]} (now ×${BAL.amenities.decor.demand[h.decor||0]}). ${DECOR[dt].desc}`} (+${BAL.amenities.decor.upkeep}g/wk per tier)`,upgradeCost(h,'decor'),(h.decor||0)>=3)}
    ${card('drinks',`Drinks (${DRINKS[dk].label}) <span class="muted">(no room)</span>`,`${DRINKS[dk].desc} ${dk>=3?'':`Next: ${DRINKS[drt].label}, bartender income ×${DR.bar[drt]} (now ×${DR.bar[dk]}), the bar's proposition boost ×${DR.props[drt]} (now ×${DR.props[dk]}). ${DRINKS[drt].desc}`} ${h.up.bar?'':'<span class="warn">Needs a Bar first.</span> '}(${DR.upkeep[dk]}g/wk now${dk>=3?'':`, ${DR.upkeep[drt]}g/wk next`})`,upgradeCost(h,'drinks'),dk>=3,false,'',!h.up.bar)}
    ${Object.entries(UPGRADES).map(([k,u])=>{ const nd = u.needs && !h.up[u.needs] ? u.needs : null; return card(k,`${u.label} <span class="muted">(${sizeTxt(k)})</span>`,`${u.race?`<span class="tag act">for ${esc((RACES[u.race]||{label:u.race}).label.toLowerCase())}s</span> `:''}${u.desc}${nd?` <span class="warn">Needs a ${esc(UPGRADES[nd].label)} first.</span>`:''} (${D.up[k]?'built in':u.upkeep+'g/wk upkeep'})`,upgradeCost(h,k),!!h.up[k],!!h.up[k],k==='incense'?incSel:'',!!nd); }).join('')}</div>
    ${wsLine}
    <p class="muted">Building the same thing again costs 12% more each time (counted across all your houses); bedrooms, quarters and beds also scale with how many this house has. Upkeep also rises with a house's reputation. Demolishing something you built costs ${Math.round(BAL.demolish.share*100)}% of its base price (nothing is refunded); what a house started with stays.</p>
    <p>Space used: <b>${roomsUsed(h)}/${houseSize(h)}</b> rooms</p>
    <p class="muted">Outfits and undergarments are bought per lady, from her sheet → Wardrobe.</p></section>
    <section class="card"><h2>Properties for Sale</h2><p class="muted">Each house has its own clientele, reputation, staff, and resident.</p><div class="grid">${props||'<span class="muted">You own every house in Hollowmere!</span>'}</div></section>`;
}
function miniNamedAvatar(key){ const id='n_'+key; return THUMBS[id] ? `<div class="avatar"><img src="${THUMBS[id]}" alt=""></div>` : `<div class="avatar" style="background:${HAIR_HEX[(NAMED[key].design.hairColor||'').toLowerCase()]||'#b99'}">${esc(initials(NAMED[key].name))}</div>`; }
function viewLog(){ return `<section class="card"><h2>Log</h2><div class="loglist">${S.log.map(l=>`<div><span class="muted">Wk ${l.wk}</span> · ${esc(l.t)}</div>`).join('')}</div></section>`; }
