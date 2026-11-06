'use strict';
/* =====================================================================
   NEW GAME SETUP
   ===================================================================== */
function startSetup(){
  SETUP = {step:0, past:null, house:null, partner:null, offers: Object.keys(HOUSES).filter(k=>HOUSES[k].starter), prev:{}};
  Object.keys(NAMED).forEach(k=>{ if(NAMED[k].role==='house' || NAMED[k].role==='partner'){ const w = makeNamed(k, NAMED[k].role==='partner'); SETUP.prev[w.id] = w; } });
  $('#hdr').innerHTML = `<div class="brand">🏮 Hollowmere Nights</div>`; $('#tabs').innerHTML=''; $('#view').innerHTML=''; $('#endBtn').disabled = true;
  setupView();
}
function setupPick(k,v){ SETUP[k]=v; setupView(); }
function setupNav(d){ SETUP.step = Math.max(0, Math.min(3, SETUP.step+d)); setupView(); }
function setupReroll(){ if(SETUP.rerolled) return; SETUP.rerolled=true; SETUP.house=null; SETUP.offers = shuffle(Object.keys(HOUSES)).slice(0,4); setupView(); }
function previewBtn(key){ const id='n_'+key; return `<button class="sm" onclick="event.stopPropagation();showImg('pv_${key}','${id}','portrait','dressed',THUMBS['${id}']?undefined:'auto')">🎨 Portrait</button><div id="pv_${key}" style="max-width:260px" onclick="event.stopPropagation()"></div>`; }
function miniAvatar(key){ const w = SETUP.prev['n_'+key]; return w ? avatarHTML(w) : ''; }
function setupView(){
  const st = SETUP.step;
  const steps = ['Past life','House','Partner','Begin'];
  const nav = `<div class="row muted">${steps.map((s,i)=>i===st?`<b class="pink">${i+1}. ${s}</b>`:`${i+1}. ${s}`).join(' → ')}</div>`;
  let body = '', ok = false;
  if(st===0){
    body = `<h2>Who was Sam, before the truck?</h2><div class="grid">${Object.entries(PASTS).map(([k,p])=>`<div class="pick ${SETUP.past===k?'sel':''}" onclick="setupPick('past','${k}')"><b>${p.label}</b><div class="muted">${p.desc}</div></div>`).join('')}</div>`;
    ok = !!SETUP.past;
  } else if(st===1){
    body = `<h2>Which deed is in Sam's hand?</h2><p class="muted">Each house has its own clientele, debt, features, resident, and storyline. You can buy the others later, and premium houses unlock as Sam's level and renown grow.</p>
      <div class="grid">${SETUP.offers.map(k=>{ const D=HOUSES[k], n=NAMED[D.npc]; return `<div class="pick ${SETUP.house===k?'sel':''}" onclick="setupPick('house','${k}')">
        <b>${D.name}</b> <span class="tag house">${D.loc}</span><div class="muted">${D.desc}</div>
        <div style="margin-top:4px">Debt <b>${fmt(D.debt)}</b> · Rooms ${D.rooms} (${ROOM_NAMES[D.tier]}) ${Object.keys(D.up).map(u=>`<span class="tag">${UPGRADES[u].label}</span>`).join('')}</div>
        <div class="muted">Clientele: ${CLASSES.map((c,i)=>D.cls[i]>=1.3?`<b>${c.label}s ↑</b>`:D.cls[i]<=0.5?`${c.label}s ↓`:'').filter(Boolean).join(', ')||'balanced'}</div>
        <div class="row" style="margin-top:6px">${miniAvatar(D.npc)}<div><b>${n.name}</b> · ${JOBS[n.job].label}<div class="muted">${esc(n.personality)}</div></div></div>${previewBtn(D.npc)}</div>`; }).join('')}</div>
`;
    ok = !!SETUP.house;
  } else if(st===2){
    body = `<h2>Who's at Sam's side?</h2><p class="muted">Your partner works without wages and already trusts Sam. Each has her own romance story. The others may turn up later looking for paid work.</p>
      <div class="grid">${PARTNERS.map(k=>{ const n=NAMED[k]; return `<div class="pick ${SETUP.partner===k?'sel':''}" onclick="setupPick('partner','${k}')">
        <div class="row">${miniAvatar(k)}<div><b>${n.name}</b> <span class="muted">${RACES[n.race].label}${n.sub?' ('+n.sub+')':''} · ${esc(n.personality)}</span><div class="muted">Trust ${n.partnerTrust} · Lewdness ${n.partnerLewd??n.lewd} · ${JOBS[n.job].label} · ${n.traits.join(', ')}</div></div></div>
        <div style="margin-top:4px">${esc(n.partnerStory)}</div>${previewBtn(k)}</div>`; }).join('')}</div>`;
    ok = !!SETUP.partner;
  } else {
    const D = HOUSES[SETUP.house], n = NAMED[D.npc], p = NAMED[SETUP.partner];
    body = `<h2>Ready?</h2><div class="card"><b>Sam Takahashi</b>, former ${PASTS[SETUP.past].label.toLowerCase()}.<br>Owner of <b>${D.name}</b> (${D.loc}), along with its debt of ${fmt(D.debt)}.<br>${n.name} runs things there as ${JOBS[n.job].label.toLowerCase()}.<br>At his side: <b>${p.name}</b>.</div>`;
    ok = true;
  }
  modal(`${nav}${body}<div class="row" style="margin-top:12px">${st>0?'<button onclick="setupNav(-1)">← Back</button>':''}${st<3?`<button class="primary" onclick="setupNav(1)" ${ok?'':'disabled'}>Next →</button>`:`<button class="primary" onclick="setupBegin()">Begin</button>`}</div>`, {lock:true, wide:true});
}
function setupBegin(){
  const cfg = {past:SETUP.past, house:SETUP.house, partner:SETUP.partner};
  SETUP = null; newGame(cfg); TAB='house'; render(); showIntro();
}
