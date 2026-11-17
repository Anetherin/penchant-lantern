'use strict';
/* =====================================================================
   NEW GAME SETUP
   ===================================================================== */
function startSetup(){
  SETUP = {step:-1, cloudFilter:'all', editCloud:false, past:null, house:null, partner:null, offers: Object.keys(HOUSES).filter(k=>HOUSES[k].starter), prev:{}};
  Object.keys(NAMED).forEach(k=>{ if(NAMED[k].role==='house' || (NAMED[k].role==='partner' && partnerOffered(k))){ const w = makeNamed(k, NAMED[k].role==='partner'); SETUP.prev[w.id] = w; } });
  $('#hdr').innerHTML = `<div class="brand">🏮 Hollowmere Nights</div>`; $('#tabs').innerHTML=''; $('#view').innerHTML=''; $('#endBtn').disabled = true;
  setupView();
}
function setupPick(k,v){ SETUP[k]=v; setupView(); }
function setupNav(d){ SETUP.step = Math.max(-1, Math.min(3, SETUP.step+d)); setupView(); }
function previewBtn(key){ const id='n_'+key; return `<button class="sm" onclick="event.stopPropagation();showImg('pv_${key}','${id}','portrait','dressed',THUMBS['${id}']?undefined:'auto')">🎨 Portrait</button><div id="pv_${key}" style="max-width:260px" onclick="event.stopPropagation()"></div>`; }
function miniAvatar(key){ const w = SETUP.prev['n_'+key]; return w ? avatarHTML(w) : ''; }
function setupCloudCard(){
  if(typeof cloudReady !== 'function') return '';
  if(CLOUD_STATE.busy){
    return `<section class="card"><h3>☁ Remote Cloud Sync</h3><p class="muted">Connecting and authenticating with your cloud server…</p></section>`;
  }
  if(!CLOUD_STATE.connected || SETUP.editCloud){
    const errHtml = CLOUD_STATE.lastErr ? `<p class="warn" style="margin:4px 0 8px">Authentication failed: ${esc(CLOUD_STATE.lastErr)}</p>` : '';
    return `<section class="card">
      <h3>☁ Remote Cloud Sync</h3>
      <p class="muted">Enter your remote cloud details to authenticate and load your online saves or NG+ saves, or skip to start a fresh game.</p>
      ${errHtml}
      <div class="form">
        <label>Worker URL <input id="setup_c_url" value="${esc(CLOUD.url||'')}" placeholder="https://hollowmere-sync.you.workers.dev" onkeydown="if(event.key==='Enter')setupCloudConnect()"></label>
        <label>Sync passphrase <input id="setup_c_secret" type="password" value="${esc(CLOUD.secret||'')}" placeholder="Your SYNC_SECRET" onkeydown="if(event.key==='Enter')setupCloudConnect()"></label>
      </div>
      <div class="row" style="margin-top:8px">
        <button class="primary" onclick="setupCloudConnect()">${CLOUD_STATE.connected ? 'Reconnect' : 'Authenticate &amp; Load Saves'}</button>
        ${SETUP.editCloud && CLOUD_STATE.connected ? `<button onclick="SETUP.editCloud=false;setupView()">Cancel</button>` : ''}
        ${CLOUD.secret ? `<button onclick="setupCloudDisconnect()">Clear passphrase</button>` : ''}
      </div>
    </section>`;
  }
  const all = cloudSlotsSorted('all'), full = cloudSlotsSorted('full'), ngp = cloudSlotsSorted('ngplus');
  const f = SETUP.cloudFilter || 'all';
  const shown = f === 'full' ? full : f === 'ngplus' ? ngp : all;
  const ex = (CLOUD_STATE.saves && CLOUD_STATE.saves.extras) || {};
  return `<section class="card">
    <div class="row" style="justify-content:space-between;margin-top:0">
      <h3 style="margin:0">☁ Online Saves &amp; NG+ Saves <span class="sync-pill synced">Authenticated</span></h3>
      <div class="row" style="margin:0">
        <button class="sm" onclick="setupCloudRefresh()">↻ Refresh</button>
        <button class="sm" onclick="SETUP.editCloud=true;setupView()">Cloud details</button>
      </div>
    </div>
    ${all.length ? `
      <div class="row">
        <button class="sm ${f==='all'?'on':''}" onclick="SETUP.cloudFilter='all';setupView()">All (${all.length})</button>
        <button class="sm ${f==='full'?'on':''}" onclick="SETUP.cloudFilter='full';setupView()">Online Saves (${full.length})</button>
        <button class="sm ${f==='ngplus'?'on':''}" onclick="SETUP.cloudFilter='ngplus';setupView()">NG+ Saves (${ngp.length})</button>
      </div>
      ${cloudSavesTableHTML(shown, { empty: f==='ngplus' ? 'No NG+ saves found in cloud.' : f==='full' ? 'No full saves found in cloud.' : 'No cloud saves found.' })}
    ` : '<p class="muted">Authenticated! No online saves or NG+ saves found on this server yet.</p>'}
    ${(ex.settings || ex.library) ? `<div class="row muted" style="margin-top:8px;font-size:12px">
      Cloud data:
      ${ex.settings ? `<button class="sm" onclick="cloudPullExtra('settings')">Pull Settings (${esc(fmtTime(ex.settings))})</button>` : ''}
      ${ex.library ? `<button class="sm" onclick="cloudPullExtra('library')">Pull Library (${esc(fmtTime(ex.library))})</button>` : ''}
    </div>` : ''}
  </section>`;
}
async function setupCloudConnect(){
  const url = $('#setup_c_url') ? $('#setup_c_url').value : CLOUD.url;
  const secret = $('#setup_c_secret') ? $('#setup_c_secret').value : CLOUD.secret;
  CLOUD.url = String(url || '').trim().replace(/\/+$/, '');
  CLOUD.secret = String(secret || '').trim();
  saveCloudConfig();
  if(!cloudReady()) return toast('Enter both Worker URL and passphrase.');
  CLOUD_STATE.busy = true;
  setupView();
  const ok = await cloudConnectWith(CLOUD.url, CLOUD.secret, false);
  if(ok){
    if(SETUP) SETUP.editCloud = false;
    toast('Authenticated with cloud sync!');
  }
  if(SETUP) setupView();
}
async function setupCloudRefresh(){
  CLOUD_STATE.busy = true;
  setupView();
  const ok = await cloudRefresh(false);
  CLOUD_STATE.busy = false;
  if(ok) toast('Cloud saves refreshed.');
  if(SETUP) setupView();
}
function setupCloudDisconnect(){
  cloudDisconnect();
  if(SETUP) SETUP.editCloud = false;
  toast('Cloud passphrase cleared.');
  setupView();
}
function setupView(){
  const st = SETUP.step;
  if(st===-1){
    modal(`<h2>🏮 Hollowmere Nights</h2>
      <p class="muted">No local save found in this browser. Connect to remote Cloud Sync to load your online saves or NG+ saves, import a local file, or start a new game.</p>
      ${setupCloudCard()}
      <div class="row" style="margin-top:12px;justify-content:space-between">
        <div class="row" style="margin:0"><span class="muted">Local save:</span><button class="sm" onclick="importSaveFile()">Load save file</button><button class="sm" onclick="importBox('save')">Paste save</button></div>
        <button class="primary" onclick="setupNav(1)">Start New Game →</button>
      </div>`, {lock:true, wide:true});
    return;
  }
  const steps = ['Past life','House','Partner','Begin'];
  const nav = `<div class="row muted">${steps.map((s,i)=>i===st?`<b class="pink">${i+1}. ${s}</b>`:`${i+1}. ${s}`).join(' → ')}</div>`;
  let body = '', ok = false;
  if(st===0){
    body = `<h2>Who was Sam, before the truck?</h2><div class="grid">${Object.entries(PASTS).map(([k,p])=>`<div class="pick ${SETUP.past===k?'sel':''}" onclick="setupPick('past','${k}')"><b>${p.label}</b><div class="muted">${p.desc}</div></div>`).join('')}</div>`;
    body += `<div class="row muted" style="margin-top:10px">Have a save (or an NG+ save) from somewhere else? <button class="sm" onclick="importSaveFile()">Load save file</button><button class="sm" onclick="importBox('save')">Paste save</button>${typeof cloudOpenSlotsModal==='function' ? `<button class="sm" onclick="cloudOpenSlotsModal()">☁ Cloud saves</button>` : ''}</div>`;
    ok = !!SETUP.past;
  } else if(st===1){
    body = `<h2>Which deed is in Sam's hand?</h2><p class="muted">Each house has its own clientele, debt, features, resident, and storyline. You can buy the others later, and premium houses unlock as Sam's level and renown grow.</p>
      <div class="grid">${SETUP.offers.map(k=>{ const D=HOUSES[k], n=NAMED[D.npc]; return `<div class="pick ${SETUP.house===k?'sel':''}" onclick="setupPick('house','${k}')">
        <b>${D.name}</b> <span class="tag house">${D.loc}</span><div class="muted">${D.desc}</div>
        ${D.perk?`<div class="good" style="margin-top:4px">✦ <b>${esc(D.perk.label)}:</b> ${esc(D.perk.desc)}</div>`:''}
        <div style="margin-top:4px">Debt <b>${fmt(houseDebt(k))}</b> · Class <b>${D.prestige ?? 50}</b> (${prestigeTier(D.prestige ?? 50).label}) · Rooms ${D.rooms} (${ROOM_NAMES[D.tier]}) ${Object.keys(D.up).map(u=>`<span class="tag">${UPGRADES[u].label}</span>`).join('')}</div>
        <div class="muted">Clientele: ${TIERS.map((t,i)=>D.cls[i]>=1.3?`<b>${TIER_LABEL(t)}s ↑</b>`:D.cls[i]<=0.5?`${TIER_LABEL(t)}s ↓`:'').filter(Boolean).join(', ')||'balanced'}</div>
        <div class="row" style="margin-top:6px">${miniAvatar(D.npc)}<div><b>${esc(titled(n))}</b> · ${JOBS[n.job].label}<div class="muted">${esc(n.personality)}</div></div></div>${previewBtn(D.npc)}</div>`; }).join('')}</div>
`;
    ok = !!SETUP.house;
  } else if(st===2){
    body = `<h2>Who's at Sam's side?</h2><p class="muted">Your partner works without wages and already trusts Sam. Each has her own romance story. The others may turn up later looking for paid work.</p>
      <div class="grid">${PARTNERS.filter(partnerOffered).map(k=>{ const n=NAMED[k]; return `<div class="pick ${SETUP.partner===k?'sel':''}" onclick="setupPick('partner','${k}')">
        <div class="row">${miniAvatar(k)}<div><b>${esc(titled(n))}</b> <span class="muted">${RACES[n.race].label}${n.sub?' ('+n.sub+')':''} · ${esc(n.personality)}</span><div class="muted">Trust ${tShow(n.partnerTrust)} · Lewdness ${lShow(n.partnerLewd??n.lewd)} · ${JOBS[n.job].label} · ${n.traits.join(', ')}</div></div></div>
        <div style="margin-top:4px">${esc(n.partnerBlurb || n.partnerStory)}</div>${previewBtn(k)}</div>`; }).join('')}</div>`;
    ok = !!SETUP.partner;
  } else {
    const D = HOUSES[SETUP.house], n = NAMED[D.npc], p = NAMED[SETUP.partner];
    body = `<h2>Ready?</h2><div class="card"><b>Sam Takahashi</b>, former ${PASTS[SETUP.past].label.toLowerCase()}.<br>Owner of <b>${D.name}</b> (${D.loc}), along with its debt of ${fmt(houseDebt(SETUP.house))}.<br>${n.name} runs things there as ${JOBS[n.job].label.toLowerCase()}.<br>At his side: <b>${p.name}</b>.</div>
      <div class="row" style="margin-top:8px"><label class="muted">Save name <input id="setup_save_name" value="${esc(SETUP.cloudName || D.name)}" placeholder="e.g. Main Run" oninput="SETUP.cloudName=this.value"></label></div>`;
    ok = true;
  }
  modal(`${nav}${body}<div class="row" style="margin-top:12px"><button onclick="setupNav(-1)">← Back</button>${st<3?`<button class="primary" onclick="setupNav(1)" ${ok?'':'disabled'}>Next →</button>`:`<button class="primary" onclick="setupBegin()">Begin</button>`}</div>`, {lock:true, wide:true});
}
function setupBegin(){
  const nm = ($('#setup_save_name') && $('#setup_save_name').value) || SETUP.cloudName || '';
  const cfg = {past:SETUP.past, house:SETUP.house, partner:SETUP.partner, cloudName:nm};
  SETUP = null; newGame(cfg); TAB='house'; render(); goddessIntro(showIntro);
}
