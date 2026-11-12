'use strict';
/* =====================================================================
   UI
   ===================================================================== */
function modal(html, opts={}){
  MODAL_LOCK = !!opts.lock;
  const b = $('#modalBox'); b.className = 'modal-box' + (opts.wide?' wide':'');
  b.innerHTML = (MODAL_LOCK?'':'<button class="xbtn" onclick="closeModal()">✕</button>') + html;
  $('#modal').classList.remove('hidden');
}
function closeModal(){ $('#modal').classList.add('hidden'); MODAL_LOCK=false; SHEET=null; }
function toast(t){ const box=$('#toast'); while(box.children.length>=4) box.firstChild.remove(); const d=document.createElement('div'); d.textContent=t; box.appendChild(d); setTimeout(()=>d.remove(), 3400); }
// next (optional): {label, onclick} replaces OK with a button that leads on (e.g. a date's invitation after its 🔥 scene).
function showResult(title, text, wid, scene, ai, next){
  const sw = wid && scene && findAny(wid), rolled = !(ai&&ai.cloth) && sw ? samSceneCloth(sw, scene) : null;   // one dress level for the picture and the AI text
  if(rolled && ai) ai = Object.assign({}, ai, {cloth:rolled});
  modal(`<h2>${esc(title)}</h2>${wid&&scene?`<div id="resImg"></div>`:''}<p class="story">${esc(text)}</p>${ai&&SET.ai.on?`<div id="resAi"></div>`:''}<div class="row">${ai?aiBtn('resAi', ai.kind, wid, ai):''}${next?`<button class="primary" onclick="${next.onclick}">${esc(next.label)}</button>`:`<button class="primary" onclick="closeModal()">OK</button>`}</div>`, next ? {lock:true} : {});
  $('#modal').scrollTop = 0;
  if(wid && scene) showImg('resImg', wid, scene, (ai&&ai.cloth)||rolled||null);
  if(ai && SET.ai.on && SET.ai.auto) aiWrite('resAi', ai.kind, wid, ai);
}
const HAIR_HEX = {black:'#3a3a44','dark brown':'#5a3d2b',chestnut:'#7b4a2c',auburn:'#8e3b23',red:'#b8342c',copper:'#c4672e',blonde:'#e3c56a','honey blonde':'#d9a94e','platinum blonde':'#efe6c8',silver:'#cfd3dc',white:'#f2f2f2','ash grey':'#9a9a9a',pink:'#f0a0c0',lavender:'#b9a2e0',teal:'#3fa9a0','deep blue':'#3a5bb0',crimson:'#a3203a'};
const hairHex = w => HAIR_HEX[((w.design&&w.design.hairColor)||'').toLowerCase()] || '#b99';
const initials = n => String(n||'?').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
const raceLabel = w => (RACES[w.race]||RACES.human).label + (w.sub?` (${w.sub})`:'');
// v / max fills the bar; max is HER ceiling (max energy, lust max, house-gated trust...), so a full bar means she's at her limit.
// note: extra tooltip text (why the ceiling is lower).
function bar(label, v, max, cls, note){ max = Math.max(1, Math.round(max)); const p = Math.round(clamp(v/max*100)); return `<div class="bar ${cls}" title="${label}: ${Math.round(v)}/${max}${note?' · '+note:''}"><span style="width:${p}%"></span><em>${label} ${Math.round(v)}/${max}</em></div>`; }
// Trust bar on the 0-1000 display scale, capped by her house story while it's unfinished.
// Trust as a stat cell (no bar): x10 like the others, with the house-story cap if one applies.
function trustCell(w){ const g = houseGate(w); return `<div${g?` title="Capped at ${tShow(g.cap)} by ${esc(g.house.name)}'s story until it moves on"`:''}><span>TRUST</span><b>${tShow(w.trust)}${g?` <span class="muted">/${tShow(g.cap)}</span>`:''}</b></div>`; }
const lustBar = (w, label) => bar(label || 'Lust', w.lust, lustProfile(w).max, 'p');
function knows(w, employee){ return S.sam.appraisal>=2 || (employee && w.trust>=30); }
function knowsPrefs(w){ return S.sam.appraisal>=3 || w.trust>=40; }
function grade(v){ return v>=85?'S':v>=70?'A':v>=55?'B':v>=40?'C':v>=25?'D':'E'; }
// stats and skills run 0-1000; grades use the 0-100 scale
function sv(w, v, employee){ return knows(w,employee) ? `${Math.round(v)}<span class="muted" style="font-size:.7em">/${statCap()}</span>` : grade(s100(v)); }
// a stat cell: effective value (trained + race/trait/clothing bonus) and, when known, a small muted +N with the sources in a tooltip
function statCell(w, k, employee, label){
  const b = Math.round(statBonus(w, k)), e = statOf(w, k), known = knows(w, employee);
  const tip = known && b ? ` title="${esc(statBonusTip(w, k))}"` : '';
  return `<div${tip}><span>${label}</span><b>${sv(w, e, employee)}${known && b ? ` <span class="muted" style="font-size:.7em">${b>0?'+':'-'}${Math.abs(b)}</span>` : ''}</b></div>`;
}
const isGuest = w => !!(w && w.key && NAMED[w.key] && NAMED[w.key].role==='drifter');
const nameBadge = w => isGuest(w) ? `<span class="tag guest" title="Visiting guest${NAMED[w.key].pack && GUEST_PACKS[NAMED[w.key].pack] ? ' · '+esc(GUEST_PACKS[NAMED[w.key].pack].label||NAMED[w.key].pack) : ''}">☄</span>` : (w && w.named ? '<span class="tag">★</span>' : '');
function traitTags(w){ return (w.reborn?`<span class="tag act" title="${esc(rebornDesc(w))}">♻ Reincarnated${w.reborn>1?' ×'+w.reborn:''}</span> `:'') + (w.unique?`<span class="tag act" title="${esc(w.unique.desc||'')}">★ ${esc(w.unique.name)}</span> `:'') + (w.ngPerks||[]).map(t=>`<span class="tag act" title="${esc(TRAITS[t]?TRAITS[t].desc:'')}">✦ ${esc(t)}</span>`).join(' ') + ' ' + (w.traits||[]).filter(t=>!TRAITS[t]||!TRAITS[t].hidden||S.sam.appraisal>=3).map(t=>`<span class="tag ${TRAITS[t]&&TRAITS[t].hidden?'hid':''} ${TRAITS[t]&&TRAITS[t].story?'act':''}" title="${esc(TRAITS[t]?TRAITS[t].desc:'')}">${esc(t)}</span>`).join(' '); }
function jobOptions(w){ return Object.entries(JOBS).map(([k,J])=>{ const why = k===w.job ? null : canDo(w,k); return `<option value="${k}" ${k===w.job?'selected':''} ${why?'disabled':''}>${why?'🔒 ':''}${J.label}</option>`; }).join(''); }
function houseTabs(withAll){
  return `<div class="hsel">${withAll?`<button class="sm ${ROSTER_FILTER==='all'?'on':''}" onclick="ROSTER_FILTER='all';render()">All houses</button>`:''}${S.houses.map(h=>`<button class="sm ${(S.cur===h.id && (!withAll||ROSTER_FILTER!=='all'))?'on':''}" onclick="S.cur='${h.id}';ROSTER_FILTER='cur';render()">${esc(h.name)} <span class="muted">(${S.workers.filter(w=>w.house===h.id).length})</span></button>`).join('')}${S.houses.length>1?`<button class="sm" title="Move this house left" onclick="moveHouse(S.cur,-1)" ${S.houses[0].id===S.cur?'disabled':''}>◀</button><button class="sm" title="Move this house right" onclick="moveHouse(S.cur,1)" ${S.houses[S.houses.length-1].id===S.cur?'disabled':''}>▶</button>`:''}</div>`;
}
function renderHeader(){
  const nd = nextDue();
  $('#hdr').innerHTML = `<div class="brand">🏮 Hollowmere Nights</div><div class="hstats">
    <span>📅 Week <b>${S.week}</b></span><span>💰 <b>${fmt(S.gold)}</b></span><span>⭐ Renown <b>${Math.round(S.rep)}</b></span>
    <span>📜 <b>${fmt(nd.amount)}</b> due wk ${nd.week}${nd.week===S.week?' <span class="warn">(this week!)</span>':''}</span>
    <span>⚡ Sam Lv <b>${S.sam.lvl||1}</b> · AP <b>${S.ap}/${apMax()}</b></span>${cycleTag()?`<span class="tag act">${cycleTag()}</span>`:''}${S.won?'<button class="sm primary" onclick="startNGPlus()">✦ New Game+</button>':''}<button class="sm" onclick="if(confirm('Start a new game? Your current save will be erased.'))restart()">↻ New game</button></div>`;
}
const TABS = [['house','🏠 Houses'],['roster','👥 Roster'],['recruit','📝 Recruit'],['sam','🧑 Sam'],['upgrades','🔨 Upgrades'],['creator','✏️ Creator'],['log','📖 Log'],['settings','⚙️ Settings']];
function render(){
  if(!S) return;
  renderHeader();
  const tabs = goddessActive() ? [...TABS.slice(0,4), ['goddess','✨ '+GN()], ...TABS.slice(4)] : TABS;
  if(TAB==='goddess' && !goddessActive()) TAB = 'sam';
  $('#tabs').innerHTML = tabs.map(([k,l])=>`<button class="${TAB===k?'on':''}" onclick="TAB='${k}';render()">${l}</button>`).join('');
  const v = {house:viewHouse, roster:viewRoster, recruit:viewRecruit, sam:viewSam, goddess:viewGoddess, upgrades:viewUpgrades, creator:viewCreator, log:viewLog, settings:viewSettings}[TAB];
  $('#view').innerHTML = v();
  $('#endBtn').disabled = S.over;
}
function regularsCard(h){
  const rs = (S.regulars||[]).filter(r=>r.house===h.id);
  if(!rs.length) return '';
  return `<section class="card"><h2>Regulars</h2>${rs.map(r=>{ const q = regQuirk(r), f = r.fav && findW(r.fav);
    return `<div style="margin:4px 0"><b>${esc(r.name)}</b> <span class="tag" title="${esc(q.desc)}">${esc(q.label)}</span> <span class="muted">${(CLASSES.find(c=>c.id===r.cls)||{}).label||''} · ${r.visits} visit${r.visits===1?'':'s'} · spent ${fmt(r.spent)}${f?` · asks for <b>${esc(f.name)}</b>`:''}${r.loyalty<=-2?' · <span class="warn">losing interest</span>':''}</span></div>`; }).join('')}</section>`;
}
// Tidiness (h.tidy 0-100): label and colour class by tier (balance.json → tidy).
function tidyTier(h){ const T = BAL.tidy, t = h.tidy ?? T.start; return t >= T.high ? 'high' : t < T.bad ? 'bad' : t < T.low ? 'low' : 'ok'; }
const tidyLabel = h => ({high:'spotless: reputation, mood, rest and clients all benefit a little', ok:'presentable', low:'getting shabby: reputation, mood, rest and clients suffer', bad:'a mess: reputation, mood, rest and clients suffer badly'})[tidyTier(h)];
const tidyCls = h => ({high:'good', ok:'', low:'warn', bad:'warn'})[tidyTier(h)];
function feastCard(h){
  const n = S.workers.filter(w=>w.house===h.id).length, done = h.feastWk === S.week;
  return `<section class="card"><h2>Throw a feast</h2><div class="row">${BAL.feast.tiers.map(t=>`<button ${done||!n||S.gold<t.cost*n?'disabled':''} onclick="throwFeast('${t.id}')">${esc(t.label)} · ${fmt(t.cost*n)}</button>`).join('')}</div>${done?'<p class="muted">Already feasted this week.</p>':'<p class="muted">Once a week per house, no action. Trust and mood for every lady living here.</p>'}</section>`;
}
function viewHouse(){
  const h = curH(), D = HOUSES[h.id], nd = nextDue();
  const amen = Object.keys(UPGRADES).filter(k=>h.up[k]).map(k=>UPGRADES[k].label).join(', ') || 'none';
  const staff = Object.entries(JOBS).map(([k,J])=>{ const ws=S.workers.filter(w=>w.house===h.id && w.job===k); return ws.length?`<div><b>${J.label}</b>: ${ws.map(w=>esc(w.name)).join(', ')}</div>`:''; }).join('');
  const L = S.lastReport, lh = L && L.houses ? L.houses.find(x=>x.id===h.id) : null;
  return `${houseTabs(false)}<section class="card"><h2>${esc(h.name)} <span class="tag house">${D.loc}</span></h2><p class="muted">${D.desc}</p><div class="grid2">
      <div>Reputation: <b>${Math.round(h.rep)}</b></div><div>Building: <b>${roomsUsed(h)}/${houseSize(h)}</b> rooms used</div>
      <div>Bedrooms: <b>${h.rooms}</b> · ${ROOM_NAMES[h.tier]} · <span title="Room services per week: ${BAL.rooms.perRoom} per bedroom">${h.rooms*BAL.rooms.perRoom} sessions/wk${lh&&lh.roomCap?` (last week ${lh.roomsUsed}/${lh.roomCap})`:''}</span>${housingShort(h)?` · <span class="warn" title="Expected comfort ${housingExpect(h)} (beds and bedroom tier, 0-3) at this reputation; yours is ${housingComfort(h)}. Staff lose mood each week.">Staff expect better beds/rooms at this reputation</span>`:''}</div>
      <div>Tidiness: <b class="${tidyCls(h)}">${Math.round(h.tidy ?? BAL.tidy.start)}</b> <span class="muted">${tidyLabel(h)}</span></div><div>Staff beds: <b>${sleepers(h).length}/${bedsFor(h)}</b> · ${BEDS[h.beds||0].label}${sleepers(h).length>bedsFor(h)?' <span class="warn">(not enough!)</span>':''}</div>
      <div>Pricing: <select onchange="setPrice(+this.value)">${PRICES.map((p,i)=>`<option value="${i}" ${i===h.price?'selected':''}>${p.label}</option>`).join('')}</select></div>
      <div>Amenities: ${amen}</div>${D.minPop?`<div class="muted">Standard: escorts need popularity ${D.minPop}+</div>`:''}
      <div class="muted">Clientele: ${TIERS.map((t,i)=>D.cls[i]>=1.3?`<b>${TIER_LABEL(t)}s ↑</b>`:D.cls[i]<=0.5?`${TIER_LABEL(t)}s ↓`:'').filter(Boolean).join(', ')||'balanced'}</div></div>
      <p class="muted">Higher prices earn more per client but draw fewer of them, unless reputation is high.</p></section>
    ${feastCard(h)}
    ${storyCard(h)}
    ${regularsCard(h)}
    <section class="card"><h2>Positions</h2>${h.up.classroom ? `<div class="row">📚 Classroom subject ${teachSelect(h, S.workers.find(w=>w.house===h.id && w.job==='teacher'))}</div>` : ''}<div class="grid2">${Object.entries(JOBS).filter(([k])=>k!=='rest').map(([k,J])=>{ const ws=S.workers.filter(w=>w.house===h.id && w.job===k), mx=slotsFor(h,k); return mx||ws.length?`<div><b>${J.label}</b> <span class="muted">${ws.length}/${mx}</span>${ws.length?': '+ws.map(w=>esc(w.name)).join(', '):''}</div>`:''; }).join('')}
      ${S.workers.filter(w=>w.house===h.id && w.job==='rest').length?`<div><b>Resting</b>: ${S.workers.filter(w=>w.house===h.id && w.job==='rest').map(w=>esc(w.name)).join(', ')}</div>`:''}</div></section>
    <section class="card"><h2>Debt to the Vane Credit House</h2>
      <div>Remaining: <b>${fmt(S.debt.remaining)}</b> · Next payment: <b>${fmt(nd.amount)}</b> at the end of week ${nd.week} ${nd.week===S.week?'<span class="warn">(this week!)</span>':''}</div>
      <div>Strikes: ${'❌'.repeat(S.debt.strikes)}${'▫️'.repeat(Math.max(0,BAL.debt.strikes-S.debt.strikes))}</div>
      <div class="row"><input id="payamt" type="number" min="1" placeholder="Amount"><button onclick="payExtra()">Pay extra</button>${S.debt.remaining>0 && S.gold>=S.debt.remaining ? `<button class="primary" onclick="if(confirm('Pay off the whole debt (${fmt(S.debt.remaining)})?'))payOffDebt()">Pay off in full (${fmt(S.debt.remaining)})</button>` : ''}</div></section>
    <section class="card"><h2>Last Week</h2>${lh?`<div class="grid2"><div>Clients here: <b>${lh.served}</b>${lh.turned?` (${lh.turned} turned away)`:''}</div><div>Income here: <b>${fmt(lh.income)}</b> · Upkeep <b>${fmt(lh.upkeep)}</b></div><div>Satisfaction: <b>${Math.round(lh.avgSat)}</b>${lh.promoDraw?` · promoter draw <b>+${Math.round(lh.promoDraw)}</b>`:''}</div><div>All houses net: <b>${fmt(L.income-L.wages-L.upkeep-(L.recharge||0)-(L.tutor||0))}</b></div></div><div class="row"><button onclick="showReport(S.lastReport,false)">📋 Full report</button></div>`:'<span class="muted">No report yet. Assign jobs, then End Week.</span>'}</section>`;
}
function workerCard(w, showHouse){
  const wl = knows(w,true) ? lShow(w.lewd) : '?';
  const menu = JOBS[w.job] && (JOBS[w.job].must || w.offDuty==='on') ? (w.menu.length ? w.menu.map(a=>`<span class="tag act">${esc(actLabel(a))}</span>`).join('') : '<span class="muted">No services on menu</span>') : '';
  return `<div class="wcard" onclick="openSheet('${w.id}')">${avatarHTML(w)}
    <div class="winfo"><div class="wname">${esc(titled(w))}${nameBadge(w)}${w.isPartner?' <span class="tag act">♥ Partner</span>':''}${showHouse?` <span class="tag house">${esc(houseOf(w).name)}</span>`:''}</div>
      <div class="muted">${raceLabel(w)} · ${esc(w.personality)}</div>
      ${bar('Energy',w.energy,maxEnergy(w),'e')}${bar('Mood',w.mood,100,'m')}${knows(w,true)?lustBar(w):''}${w.health<100?bar('Health',w.health,100,'h'):''}
      <div class="row" onclick="event.stopPropagation()"><select onchange="setJob('${w.id}',this.value)">${jobOptions(w)}</select>
      <span class="muted">Lewd ${wl}${w.prevJob?' · 😴 auto-resting':''}</span><span class="muted">· ${isFree(w)?'no wage':fmt(w.wage)+'/wk'}</span></div><div>${menu}</div></div></div>`;
}
// "This week" at a glance: who needs attention before you end the week.
function agendaHTML(){
  const nm = w => `<a href="#" onclick="openSheet('${w.id}');return false">${esc(w.name.split(' ')[0])}</a>`;
  const list = (ws) => ws.map(nm).join(', ');
  const W = S.workers, lines = [];
  const waiting = W.filter(w=>has(w,'Devoted') && restless(w));
  const restlessL = W.filter(w=>!has(w,'Devoted') && restless(w));
  const worn = W.filter(w=>w.job!=='rest' && w.energy < maxEnergy(w)*0.3);
  const unhappy = W.filter(w=>w.mood < 25);
  const ending = W.filter(w=>!isFree(w) && !w.locked && w.contract<=2);
  const neglected = W.filter(w=>has(w,'Devoted') && !w._samTime && (w.neglect||0) >= Math.max(1, BAL.lovers.neglectWeeks-1));   // time with Sam this week clears it (w.neglect itself resets at the week's end)
  if(waiting.length) lines.push(`💗 Waiting for Sam: ${list(waiting)}`);
  if(neglected.length) lines.push(`💔 Feeling neglected: ${list(neglected)}`);
  if(restlessL.length) lines.push(`🔥 Restless: ${list(restlessL)}`);
  if(worn.length) lines.push(`😴 Worn out: ${list(worn)}`);
  if(unhappy.length) lines.push(`😠 Unhappy: ${list(unhappy)}`);
  if(ending.length) lines.push(`📜 Contract ending: ${ending.map(w=>`${nm(w)} (${w.contract} wk)`).join(', ')}`);
  lines.push(`🧑 Sam: ${S.ap} action${S.ap===1?'':'s'} left · energy ${Math.round(S.sam.energy)}`);
  return `<section class="card agenda"><h3 style="margin:0 0 4px">This week</h3>${lines.map(l=>`<div>${l}</div>`).join('')}</section>`;
}
let ROSTER_VIEW = {type:'all', lust:'all', trust:'all', sort:''};
function setRosterView(k, v){ ROSTER_VIEW[k] = v; render(); }
function rosterType(w){
  const n = w.key && NAMED[w.key];
  if(!n) return 'generic';
  if(n.role==='drifter') return 'guest';
  return 'story';   // partners, house residents, story and guild ladies: everyone written into the game's own story
}
function rosterFilterBar(){
  const R = ROSTER_VIEW, sel = (k, opts) => `<select onchange="setRosterView('${k}',this.value)">${opts.map(o=>`<option value="${o[0]}" ${R[k]===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select>`;
  return `<div class="row">
    <label>Type ${sel('type', [['all','All'],['generic','Generic'],['guest','Guest'],['story','Story']])}</label>
    <label>Lust ${sel('lust', [['all','All'],['eager','Restless / eager'],['low','Low']])}</label>
    <label>Trust ${sel('trust', [['all','All'],['high',`High (Trust ${tShow(70)}+)`],['mid',`Mid (Trust ${tShow(30)}-${tShow(70)-1})`],['low',`Low (under ${tShow(30)})`]])}</label>
    <label>Sort ${sel('sort', [['','Default'],['trust','Trust'],['lust','Lust'],['lewd','Lewdness'],['popularity','Popularity']])}</label></div>`;
}
function rosterFiltered(list){
  const R = ROSTER_VIEW;
  let out = list.filter(w=>{
    if(R.type!=='all' && rosterType(w)!==R.type) return false;
    if(R.lust==='eager' && !(w.lust>=LUST_EAGER)) return false;
    if(R.lust==='low' && !(w.lust<BAL.lust.low)) return false;
    const t = w.trust||0;
    if(R.trust==='high' && t<70) return false;
    if(R.trust==='mid' && (t<30 || t>=70)) return false;
    if(R.trust==='low' && t>=30) return false;
    return true;
  });
  if(R.sort) out = out.slice().sort((a,b)=>(b[R.sort]||0)-(a[R.sort]||0));
  return out;
}
function viewRoster(){
  const all = ROSTER_FILTER==='all', base = all ? S.workers : S.workers.filter(w=>w.house===curH().id), list = rosterFiltered(base);
  const empty = base.length ? '<span class="muted">Nobody matches these filters.</span>' : '<span class="muted">No one works here. Visit Recruit, or move someone over from her sheet.</span>';
  return `${houseTabs(true)}${agendaHTML()}<section class="card"><h2>Roster (${list.length})</h2><p class="muted">Tap someone to open her status window, services, wardrobe and images.</p>
    ${rosterFilterBar()}
    <div class="grid">${list.map(w=>workerCard(w, all)).join('') || empty}</div></section>`;
}
function viewRecruit(){
  const cards = S.candidates.map(c=>`<div class="wcard" style="cursor:default">${avatarHTML(c)}
    <div class="winfo"><div class="wname">${esc(titled(c))}${nameBadge(c)}${c.friend?' <span class="tag act">♻ old friend</span>':''}${ARCS[c.key]?' <span class="tag act">♥ story</span>':''}</div>
    <div class="muted">${raceLabel(c)} · ${esc(c.personality)} · Style: ${c.style}</div><div>${traitTags(c)}</div>
    <div class="sgrid" style="margin:6px 0">${STAT_KEYS.map(k=>statCell(c,k,false,STAT_SHORT[k]||k.slice(0,4).toUpperCase())).join('')}<div><span>LEWD</span><b>${S.sam.appraisal>=2?lShow(c.lewd):'?'}</b></div><div><span>BEST</span><b>${TECH_LABEL[TECH_KEYS.reduce((a,k)=>c.tech[k]>c.tech[a]?k:a,'service')]}</b></div><div><span>BODY</span><b>${esc(bodyLabel(c))}</b></div></div>
    <div class="row"><span>Wage <b>${fmt(c.wage)}</b>/wk · Signing <b>${fmt(c.signing||0)}</b></span></div>
    ${raceBlock(c, curH())?`<div class="warn">${esc(raceBlock(c, curH()))}</div>`:''}<div class="row"><button class="primary" onclick="hire('${c.id}')" ${raceBlock(c, curH())?'disabled':''}>Hire for ${esc(curH().name)}</button><button onclick="openCand('${c.id}')">Details</button></div></div></div>`).join('');
  return `${houseTabs(false)}<section class="card"><h2>Candidates</h2><p class="muted">New faces arrive each week. Hires join the selected house. Sam's [Appraisal] Lv ${S.sam.appraisal} ${S.sam.appraisal<2?'shows letter grades only.':'shows exact stats.'}</p><div class="grid">${cards||'<span class="muted">Nobody this week.</span>'}</div></section>`;
}
function openCand(id){
  const c = S.candidates.find(x=>x.id===id); if(!c) return;
  modal(`<div class="sheet"><div><div id="sheetImg"></div></div>
    <div class="status"><h3>[ STATUS ] ${esc(c.name)}</h3><div class="muted">${raceLabel(c)} · Age ${c.age} · ${esc(c.personality)} · Style: ${c.style}</div><p class="story" id="bs_${c.id}">${esc(c.backstory)}</p>${SET.ai.on&&!c.named?`<button class="sm" onclick="aiBackstory('bs_${c.id}','${c.id}')">✨ Write a backstory</button>`:''}<div>${traitTags(c)}</div>
    <div class="muted">Wears: ${esc(getOutfit(c).label)}</div></div></div>`, {wide:true});
  showImg('sheetImg', c.id, 'portrait', 'dressed', SET.autoPortrait ? 'auto' : undefined);
  if(SET.ai.on && SET.ai.autoBackstory!==false && !c.named && !c.aiBackstory && getTextPlugin()){ c.aiBackstory = true; aiBackstory('bs_'+c.id, c.id); }
}
