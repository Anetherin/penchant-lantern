'use strict';
/* ---------- Character sheet ---------- */
function sheetScenes(w){
  const out = ['portrait','casual'];
  if(SCENES['job_'+w.job] && w.job!=='rest' && w.job!=='companion') out.push('job_'+w.job);
  out.push('companion');
  if(houseOf(w).up.bath) out.push('bath');
  out.push('sam_date', ...Object.keys(DATES).map(k=>'date_'+k), 'sam_training','shower','walkin');
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
  const rows = getActs().map(a=>{
    const cst = clientStance(w,a.id), sst = samStance(w,a.id), cc = cst!=='no', on = w.menu.includes(a.id);
    const pref = kp ? (w.fav===a.id?' <span title="Favorite" class="good">★</span>':'') + (w.dislike===a.id?' <span title="Dislikes" class="warn">✗</span>':'') + (w.lovers===a.id?' <span title="Lovers only: with clients only if very lewd" class="pink">♥</span>':'') : '';
    return `<tr><td>${esc(a.label)}${pref}</td><td>${sv(w,actSkill(w,a.id),true)}</td>
      <td>${cst==='no'&&kp&&w.lovers===a.id?'<span class="pink">♥ lovers</span>':STANCE[cst]}${k?` <span class="muted">${Math.round(inclination(w,a.id)-(w.lovers===a.id?30:0))}/${a.th}${cst==='ask'?'':cst==='no'&&inclination(w,a.id)-(w.lovers===a.id?30:0)>=a.th-ASK_BAND?` (trust ${trustNeed(a.th-inclination(w,a.id)+(w.lovers===a.id?30:0))})`:''}</span>`:''}</td>
      <td>${STANCE[sst]}</td>
      <td><input type="checkbox" ${on?'checked':''} ${cc?'':'disabled'} onchange="toggleMenu('${w.id}','${a.id}',this.checked)"></td></tr>`;
  }).join('');
  const cl = comfortCloth(w,false,true), cs = comfortCloth(w,true,true);
  const o = getOutfit(w), u = getUnder(w);
  const anySam = getActs().some(a=>canSam(w,a.id));
  const arcTxt = ARCS[w.key] ? `<div class="pink">♥ Story: ${(w.arc||0)>=ARCS[w.key].length ? 'Lovers' : `chapter ${w.arc||0}/${ARCS[w.key].length}${(w.arc||0)<ARCS[w.key].length?` <span class="muted">(next: ${ARCS[w.key][w.arc||0].title})</span>`:''}`}${!w.arc&&w.trust<40?' <span class="muted">(begins once she trusts Sam: 40)</span>':''}</div>` : '';
  box.innerHTML = `<div class="status"><h3>[ STATUS ] ${esc(w.name)}</h3>
    <div class="muted">${raceLabel(w)} · Age ${w.age} · ${esc(w.personality)} · Style: ${w.style} · ♥ ${sw(w.favColor)}${w.favColor}</div>
    <p class="story" style="margin:6px 0" id="bs_${w.id}">${esc(w.backstory)}</p>${SET.ai.on&&!w.named?`<button class="sm" onclick="if(confirm('Replace her backstory with a new AI-written one?'))aiBackstory('bs_${w.id}','${w.id}')">✨ Rewrite backstory</button>`:''}<div>${traitTags(w)}</div>${arcTxt}${(()=>{ if(!S.workers.includes(w)) return ''; seedBonds(); const bl = bondLines(w); return bl.length ? `<div class="muted">🤝 ${bl.map(esc).join(' · ')}</div>` : ''; })()}
    <div class="sgrid" style="margin-top:8px">${STAT_KEYS.map(s=>`<div><span>${s.toUpperCase()}</span><b>${sv(w,w.stats[s],true)}</b></div>`).join('')}</div>
    <div class="sgrid" style="margin-top:6px">${TECH_KEYS.map(s=>`<div><span>${TECH_LABEL[s].toUpperCase()}</span><b>${sv(w,w.tech[s],true)}</b></div>`).join('')}<div><span>POPULARITY</span><b>${Math.round(w.popularity)}</b></div></div>
    <div style="margin-top:8px">${bar('Energy',w.energy,maxEnergy(w),'e')}${bar('Mood',w.mood,100,'m')}${bar('Trust',w.trust,100,'t')}${k?bar('Lewdness',w.lewd,100,'l'):'<div class="muted">Lewdness: ? (Appraisal Lv 2 or more trust)</div>'}${k?bar('Lust ('+lustLabel(w)+')',w.lust,100,'p'):''}${bar('Health',w.health,100,'h')}</div>
    <div class="muted" style="margin-top:6px">Race perk: <b>${RACE_PERK[w.race]?RACE_PERK[w.race].label:''}</b>: ${RACE_PERK[w.race]?RACE_PERK[w.race].desc:''}</div>
    <div class="muted">Comfortable up to: <b>${CLOTH.find(c=>c.id===cl).label}</b> with clients · <b>${CLOTH.find(c=>c.id===cs).label}</b> with Sam${has(w,'Modest')?`<br><span class="pink">Modest:</span> ${esc(flavor('modest', w))}`:''}</div>
    ${persLine(w)}${(HOUSES[houseOf(w).id].minPop||0) > w.popularity ? `<div class="warn">⚠️ Below ${esc(houseOf(w).name)}'s standard (popularity ${HOUSES[houseOf(w).id].minPop}). Escort clients pay less and complain.</div>`:''}</div>
    <div class="row" style="margin-top:8px">👗 <b>${esc(o.label)}</b>${usesColor(o)?` ${sw(w.outColor)}${w.outColor}`:''} · 🩲 ${esc(u.label)}${w.under!=='none'&&usesColor(u)?` ${sw(w.underColor)}${w.underColor}`:''} <button class="sm" onclick="openWardrobe('${w.id}')">Wardrobe</button></div>
    <h3 style="margin-top:10px">Services</h3>
    <table><tr><th>Service</th><th>Skill</th><th>Clients</th><th>Sam</th><th>Menu</th></tr>${rows}</table>
    <div class="muted" style="font-size:12px">✓ she enjoys it · ~ she'll do it because she trusts Sam (costs mood; lewdness grows faster) · ✗ a line she won't cross yet. Numbers: her inclination / the service's line.<br>${kp?'★ favorite (mood +) · <span class="warn">✗</span> after a name = dislikes (mood −) · ♥ lovers only':'Her preferences show at trust 40 or Appraisal Lv 3.'} · Menu = what she offers clients.</div>
    <label class="chk" style="margin-top:4px"><input type="checkbox" ${w.offDuty?'checked':''} onchange="setOffDuty('${w.id}',this.checked)"> Accepts propositions (for menu services) while working other jobs</label>
    <label class="chk"><input type="checkbox" ${w.autoRest?'checked':''} onchange="setAutoRest('${w.id}',this.checked)"> Auto-rest when worn out (below 35% energy), back to work at 85%</label>
    <div class="row" style="margin-top:10px">Job <select onchange="setJob('${w.id}',this.value)">${jobOptions(w)}</select>
      ${w.locked?`<span class="tag house">🏠 Bound to ${esc(H(w.locked)?H(w.locked).name:'')}</span>`:''}${S.houses.length>1&&!w.locked?`House <select onchange="setHouse('${w.id}',this.value)">${S.houses.map(h=>`<option value="${h.id}" ${h.id===w.house?'selected':''}>${esc(h.name)}</option>`).join('')}</select>`:''}</div>
    <div class="row">${isFree(w)?`<span class="pink">${w.isPartner?'♥ Partner':'★ Devoted to the house'}: works without wages</span>`:`Wage <input type="number" value="${w.wage}" onchange="setWage('${w.id}',this.value)"> <span class="muted">(fair: ~${fmt(wageFor(w))}) · ${w.locked?'No contract (bound to the house)':'Contract '+w.contract+' wk'}</span>`}</div>
    <p class="muted" style="margin:2px 0">${esc(JOBS[w.job].desc)}</p>
    <h3 style="margin-top:10px">Time with Sam <span class="muted">(${S.ap} AP left)</span></h3>
    <div class="row"><button onclick="samChat('${w.id}')">💬 Chat</button><button onclick="dateMenu('${w.id}')">🌙 Date…</button><button onclick="samGift('${w.id}')">🎁 Gift (60g)</button></div>
    <div class="row"><select id="trainSel">${TECH_KEYS.map(s=>`<option value="${s}">${TECH_LABEL[s]}</option>`).join('')}${getActs().filter(a=>canSam(w,a.id)).map(a=>`<option value="act:${a.id}">Practice: ${esc(a.label)}</option>`).join('')}</select><button onclick="samTrain('${w.id}')">📚 Train</button>
      <button onclick="privateMenu('${w.id}')" ${anySam?'':'disabled title="She isn\'t comfortable with that yet."'}>🕯️ Private time</button></div>
    <div class="row"><button onclick="editWorker('${w.id}')">✏️ Edit design</button>${w.isPartner||w.locked?'':`<button onclick="dismiss('${w.id}')">Dismiss</button>`}${has(w,'Devoted')?`<button onclick="endLovers('${w.id}')">💔 End things</button>`:''}${w.exLover&&!has(w,'Devoted')?`<button onclick="rekindle('${w.id}')" ${w.trust<BAL.breakup.rekindleTrust?`disabled title="She needs trust ${BAL.breakup.rekindleTrust}+"`:''}>💞 Ask her back</button>`:''}</div>`;
}
function persLine(w){
  const P = PERS[w.personality];
  if(!P) return `<div class="muted">Custom personality: no special likes or dislikes.</div>`;
  const J = a => a.map(j=>JOBS[j]?JOBS[j].label:j).join(', ');
  return `<div class="muted">Jobs she'll do now: ${Object.keys(JOB_TRUST).filter(j=>w.trust>=jobTrust(w,j)).map(j=>JOBS[j].label).join(', ')||'none yet'}</div><div class="muted">Likes: <b>${P.likes.map(a=>ACT_WORD[a]).join(', ')}</b>${P.dislikes.length?` · Dislikes: <b>${P.dislikes.map(a=>ACT_WORD[a]).join(', ')}</b>`:''} · Enjoys working as: ${J(P.jobsUp)} · Dislikes: ${J(P.jobsDown)}</div>`;
}
function viewSam(){
  const s = S.sam;
  return `<section class="card"><div class="status"><h3>[ STATUS ] Sam Takahashi</h3>
      <div class="muted">Human · Reincarnated · Former ${PASTS[S.past]?PASTS[S.past].label.toLowerCase():'office worker'} · Owner of ${S.houses.map(h=>esc(h.name)).join(', ')}</div>
      <p style="margin:6px 0">Nice guy, mild nerd, recently hit by a truck. Somehow in the pleasure-house business.${s.first?' Has never so much as held hands.':''}</p>
      <div class="sgrid">${['charm','business','strength','technique'].map(k=>`<div><span>${k.toUpperCase()}</span><b>${Math.round(s[k])}</b></div>`).join('')}<div><span>APPRAISAL</span><b>Lv ${s.appraisal}</b></div><div><span>APP. XP</span><b>${s.appXP}</b></div></div>
      <div style="margin-top:8px">${bar('Energy',s.energy,100,'e')}${bar('XP to Lv '+((s.lvl||1)+1),s.xp||0,xpNeed(s.lvl||1),'t')}</div><div>Level <b>${s.lvl||1}</b> · Actions left this week: <b>${S.ap}/${apMax()}</b> <span class="muted">(+1 action at levels 5 and 10)</span></div>
      ${S.samWeek.acts.length?`<div class="muted">This week: ${S.samWeek.acts.map(esc).join(' · ')}</div>`:''}
      ${PASTS[S.past]?`<div class="muted">Past life: ${PASTS[S.past].desc}</div>`:''}</div></section>
    <section class="card"><h2>Work</h2>
      <div class="row"><button onclick="samWork('bartend')">🍺 Tend bar</button><button onclick="samWork('security')">🛡️ Stand watch</button><button onclick="samWork('books')">📒 Do the books</button><button onclick="samWork('scout')">🔍 Scout recruits</button></div>
      <p class="muted">Tend bar earns gold now (Charm). Watch reduces trouble in every house (Strength). Books cut upkeep (Business). Scouting adds candidates and Appraisal XP.</p></section>
    <section class="card"><h2>Errands</h2><div class="row"><button onclick="samGuild()">⚔️ Adventurers' Guild</button><button onclick="samRest()">😴 Rest (+50 energy)</button></div></section>
    <section class="card"><h2>Spend Time with Someone</h2><div class="grid">${S.workers.map(w=>workerCard(w, S.houses.length>1)).join('')}</div></section>`;
}
function viewUpgrades(){
  const h = curH(), D = HOUSES[h.id];
  const card = (k,label,desc,cost,done) => `<div class="wcard" style="cursor:default"><div class="winfo"><div class="wname">${label}</div><div class="muted">${desc}</div>
    <div class="row">${done?'<span class="good">✓ Built</span>':`<button onclick="buyUpgrade('${k}')" ${S.gold<cost?'disabled':''}>Buy · ${fmt(cost)}</button>`}</div></div></div>`;
  const props = Object.entries(HOUSES).filter(([k])=>!H(k)).map(([k,P])=>{ const locked = P.premium && ((S.sam.lvl||1) < P.level || S.rep < P.renown);
    return `<div class="wcard" style="cursor:default">${miniNamedAvatar(P.npc)}<div class="winfo"><div class="wname">${P.name} <span class="tag house">${P.loc}</span>${P.premium?' <span class="tag act">Premium</span>':''}</div><div class="muted">${P.desc}</div>
    <div class="muted">Comes with ${NAMED[P.npc].name}${isHired(P.npc)?' (already with you)':''} · Rooms ${P.rooms} · Upkeep ~${fmt(P.upkeep+15*P.rooms)}/wk${P.minPop?` · Escorts should have popularity ${P.minPop}+`:''}</div>
    ${P.premium?`<div class="${locked?'warn':'good'}">Requires Sam level ${P.level} (now ${S.sam.lvl||1}) and renown ${P.renown} (now ${Math.round(S.rep)})</div>`:''}
    <div class="row"><button onclick="buyHouse('${k}')" ${S.gold<P.cost||locked?'disabled':''}>Buy · ${fmt(P.cost)}</button></div></div></div>`; }).join('');
  return `${houseTabs(false)}<section class="card"><h2>Upgrades: ${esc(h.name)} <span class="muted">(${roomsUsed(h)}/${houseSize(h)} rooms)</span></h2><div class="grid">
    ${card('room',`Add Bedroom (${h.rooms})`,'One courtesan per bedroom. Takes 1 room. +12g/wk.',upgradeCost(h,'room'),false)}
    ${card('quarters',`Add Staff Quarters (${h.quarters||0})`,'Sleeps 2 staff. Without a bed, staff sleep on the floor (poor rest, −mood). Takes 1 room. +6g/wk.',upgradeCost(h,'quarters'),false)}
    ${card('roomTier',`Refurbish Bedrooms (${ROOM_NAMES[h.tier]})`,'Higher service prices and satisfaction. Changes room scenes.',upgradeCost(h,'roomTier'),h.tier>=3)}
    ${card('beds',`Better Beds (${BEDS[h.beds||0].label})`,`Staff recover more energy. Next: ${BEDS[Math.min(3,(h.beds||0)+1)].label} (rest ${BEDS[Math.min(3,(h.beds||0)+1)].rest}). Proper beds keep a lady even at about 3–4 clients a week.`,upgradeCost(h,'beds'),(h.beds||0)>=3)}
    ${card('annex','Build an Annex','+3 rooms of space. +30g/wk.',upgradeCost(h,'annex'),!!h.annex)}
    ${Object.entries(UPGRADES).map(([k,u])=>card(k,`${u.label} <span class="muted">(${AMENITY_SIZE[k]} room${AMENITY_SIZE[k]>1?'s':''})</span>`,`${u.desc} (${D.up[k]?'built in':u.upkeep+'g/wk upkeep'})`,upgradeCost(h,k),!!h.up[k])).join('')}</div>
    <p class="muted">Each construction project raises prices on the next by 12% (${S.built||0} built so far). Upkeep also rises with a house's reputation.</p>
    <p>Space used: <b>${roomsUsed(h)}/${houseSize(h)}</b> rooms</p>
    <p class="muted">Outfits and undergarments are bought per lady, from her sheet → Wardrobe.</p></section>
    <section class="card"><h2>Properties for Sale</h2><p class="muted">Each house has its own clientele, reputation, staff, and resident.</p><div class="grid">${props||'<span class="muted">You own every house in Hollowmere!</span>'}</div></section>`;
}
function miniNamedAvatar(key){ const id='n_'+key; return THUMBS[id] ? `<div class="avatar"><img src="${THUMBS[id]}" alt=""></div>` : `<div class="avatar" style="background:${HAIR_HEX[(NAMED[key].design.hairColor||'').toLowerCase()]||'#b99'}">${esc(initials(NAMED[key].name))}</div>`; }
function viewLog(){ return `<section class="card"><h2>Log</h2><div class="loglist">${S.log.map(l=>`<div><span class="muted">Wk ${l.wk}</span> · ${esc(l.t)}</div>`).join('')}</div></section>`; }
