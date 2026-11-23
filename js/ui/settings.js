'use strict';
/* ---------- Settings ---------- */
function viewSettings(){
  const T = Object.assign({}, DEFAULT_CLOTH_TEXT, SET.clothText);
  return `<section class="card"><h2>Image Settings</h2>
    <label class="muted">Style tags<textarea id="s_style">${esc(SET.style)}</textarea></label>
    <label class="muted">Negative prompt<textarea id="s_neg">${esc(SET.negative)}</textarea></label>
    <div class="row">Resolution <select id="s_res">${['512x512','512x768','768x512'].map(r=>`<option ${r===SET.resolution?'selected':''}>${r}</option>`).join('')}</select>
      <label class="chk"><input type="checkbox" id="s_autoImg" ${SET.autoImg!==false?'checked':''}> Auto-generate images for scenes, events and sheets when none is saved (the weekly report only generates when you press 🎨)</label>
      <label class="chk"><input type="checkbox" id="s_auto" ${SET.autoPortrait?'checked':''}> Always auto-generate portraits, even with the option above off</label>
      <label class="chk"><input type="checkbox" id="s_imgHidden" ${SET.imgHidden?'checked':''}> Start with images hidden (press 🖼 Show image to see one)</label>
      <label class="chk"><input type="checkbox" id="s_repImg" ${SET.repImg!==false?'checked':''}> Weekly report: on a lady's page, show encounters that already have a saved image</label>
      <label class="chk"><input type="checkbox" id="s_lib" ${SET.libraryInPool?'checked':''}> Library characters appear as candidates</label>
      <label class="chk"><input type="checkbox" id="s_autoRenew" ${SET.autoRenew!==false?'checked':''}> Auto-renew contracts at the going rate when a lady is sure to sign (unsure ones, or bonuses you can't afford, still ask)</label></div>
    <div class="row"><button class="primary" onclick="saveSettingsUI()">Save settings</button><span class="muted">Image plugin: ${getPlugin()?'<span class="good">connected</span>':'<span class="warn">not connected</span>'} · Image storage: ${DB?'<span class="good">ready</span>':'<span class="warn">unavailable</span>'}</span></div></section>
  ${svcImgCard()}
  ${typeof sillyCard === 'function' ? sillyCard() : ''}
  ${Object.keys(GUEST_PACKS).length ? `<section class="card"><h2>Visiting characters</h2><p class="muted">Crossover guests from <code>data/guests/</code> (one file per pack) pass through as candidates now and then. Switch off any packs you don't want.</p>
    <div class="row">${Object.entries(GUEST_PACKS).map(([k,P])=>`<label class="chk"><input type="checkbox" class="s_pack" data-pack="${esc(k)}" ${(SET.packsOff||{})[k]?'':'checked'}> ${esc(P.label||k)} <span class="muted">(${Object.keys(noMeta(P.characters)).length})</span></label>`).join('')}</div>
    <div class="row"><button class="primary" onclick="savePacksUI()">Save</button></div></section>` : ''}
  <section class="card"><h2>Text &amp; Data Files</h2><p class="muted">Scene snippets, clothing wording, services, personalities, AI prompts and flavor lines live in the repo's <code>data/</code> folder. Edit them on GitHub; changes show up a minute or two after you push (reload the page).</p>
    <ul class="muted" style="margin:6px 0 6px 18px">${(window.HOLLOWMERE_DATA||Object.keys(DATA)).map(n=>`<li><code>data/${n}${(window.HOLLOWMERE_DATA_DIRS||[]).includes(n)?'/':'.json'}</code> ${DATA[n]?'<span class="good">loaded</span>':'<span class="warn">missing</span>'}</li>`).join('')}</ul>
    ${browserEdits().n ? `<p><span class="warn">${browserEdits().n} older edit${browserEdits().n>1?'s':''} saved in this browser still override the files</span> (${browserEdits().what.join(', ')}). Export them merged into the file format, paste into the repo, then clear them here.</p>
    <div class="row"><button onclick="exportEdits()">Export browser edits as JSON</button><button onclick="clearEdits()">Clear browser edits</button></div>` : '<p class="muted">No browser overrides: the files are in charge.</p>'}</section>
  <section class="card"><h2>AI Text</h2><p class="muted">Optional. Uses Perchance's text plugin to write scenes for reports, private time and training, and backstories for generic characters. Only backstories are kept; scenes are written on the spot. Image prompts stay programmatic. Plugin: ${getTextPlugin()?'<span class="good">connected</span>':'<span class="warn">not connected (add <code>ai = {import:ai-text-plugin}</code> to the lists panel)</span>'}</p>
    <div class="row"><label class="chk"><input type="checkbox" id="ai_on" ${SET.ai.on?'checked':''}> Enable AI text buttons (✨)</label>
      <label class="chk"><input type="checkbox" id="ai_auto" ${SET.ai.auto?'checked':''}> Write scenes automatically (off by default: the ✨ button writes one on request)</label>
      <label class="chk"><input type="checkbox" id="ai_bs" ${SET.ai.autoBackstory!==false?'checked':''}> Write backstories for generic characters automatically</label></div>
    <p class="muted">Prompts and style guidance are in <code>data/ai-prompts.json</code>.</p>
    <div class="row"><button class="primary" onclick="saveAiUI()">Save AI settings</button></div></section>
  <section class="card"><h2>Images</h2><p class="muted">Generated and uploaded images live in this browser. Export them to back up or move them to another browser.</p>
    <div class="row"><button onclick="openGallery()">🖼 Browse images</button><button onclick="exportImages()">⬇ Export images</button><button onclick="importImages()">⬆ Import images</button><button onclick="cleanImages()">Clean up unused images</button></div></section>
  <section class="card"><h2>Save File</h2><p class="muted">The game autosaves every week in this browser. Each playthrough has its own save name so multiple runs stay separate in cloud sync and exports.</p>
    <div class="row"><label class="muted">Run name <input id="s_runName" value="${esc(S.cloudName || '')}" placeholder="Main Run"></label><button onclick="renameCurrentRun()">Rename run</button></div>
    <div class="row"><button onclick="save();toast('Saved.')">Save now</button><button onclick="exportBox('save')">Export save</button>${S.won?'<button onclick="exportBox(\'ngplus\')" title="Only what New Game+ carries; loading it opens the New Game+ setup">Export NG+ save</button>':''}<button onclick="importBox('save')">Import save</button><button onclick="importSaveFile()">Import save file</button><button onclick="exportBox('lib')">Export library</button><button onclick="importBox('lib')">Import library</button><button onclick="if(confirm('Start over? Your current save will be erased.'))restart()">New game</button></div></section>
  ${typeof viewCloudSettings === 'function' ? viewCloudSettings() : ''}`;
}
function saveSettingsUI(){
  SET.style = $('#s_style').value; SET.negative = $('#s_neg').value; SET.resolution = $('#s_res').value;
  SET.autoPortrait = $('#s_auto').checked; SET.autoImg = $('#s_autoImg').checked; SET.imgHidden = $('#s_imgHidden').checked; SET.repImg = $('#s_repImg').checked; SET.libraryInPool = $('#s_lib').checked; SET.autoRenew = $('#s_autoRenew').checked; saveSettings(); toast('Settings saved.');
}
// Pictures by service (SET.svcImg, js/logic/imagegen.js): one choice per service and per kind of report entry.
function svcImgCard(){
  const keys = [...ACTS.slice().sort((a,b)=>(a.tier||1)-(b.tier||1)).map(a=>a.id), ...Object.keys(SVC_IMG_CATS)];
  const cur = SET.svcImg || {}, n = Object.keys(cur).length;
  const row = k => `<label class="muted" style="display:flex;gap:6px;align-items:center;justify-content:space-between">${esc(svcImgLabel(k))}${SVC_IMG_CATS[k]?' <span class="muted">(entry)</span>':''}<select class="s_svcimg" data-k="${esc(k)}">${Object.entries(SVC_IMG_MODES).map(([m,l])=>`<option value="${m}" ${m===(cur[k]||'')?'selected':''}>${l}</option>`).join('')}</select></label>`;
  return `<section class="card"><h2>Pictures by service</h2>
    <p class="muted">What a lady's weekly report page does with each kind of encounter when you open it. <b>Default</b> follows the report option above (show saved pictures), <b>Show saved</b> shows a saved picture but never generates, <b>Generate</b> makes one if none is saved, <b>Hide picture</b> keeps it behind 🖼, <b>Fold away</b> also folds the entry shut. You can change these from the picker beside each entry on the report too.</p>
    <label class="chk"><input type="checkbox" id="s_svcImgAll" ${SET.svcImgAll?'checked':''}> Use these everywhere (private time, events, dates and other scenes), not just the report</label>
    <div class="row">Set all: ${Object.entries(SVC_IMG_MODES).map(([m,l])=>`<button class="sm" onclick="document.querySelectorAll('.s_svcimg').forEach(s=>s.value='${m}')">${l}</button>`).join('')}</div>
    <details${n?' open':''}><summary>${n ? `${n} custom setting${n>1?'s':''}` : 'All on default'}</summary><div class="grid2" style="margin-top:6px">${keys.map(row).join('')}</div></details>
    <div class="row"><button class="primary" onclick="saveSvcImgUI()">Save picture settings</button></div></section>`;
}
function saveSvcImgUI(){
  SET.svcImg = {}; document.querySelectorAll('.s_svcimg').forEach(el=>{ if(el.value) SET.svcImg[el.dataset.k] = el.value; });
  SET.svcImgAll = $('#s_svcImgAll').checked; saveSettings(); toast('Picture settings saved.'); render();
}
function savePacksUI(){
  SET.packsOff = {}; document.querySelectorAll('.s_pack').forEach(el=>{ if(!el.checked) SET.packsOff[el.dataset.pack] = true; });
  saveSettings(); toast('Visiting characters saved.');
}
function saveAiUI(){
  SET.ai.on = $('#ai_on').checked; SET.ai.auto = $('#ai_auto').checked; SET.ai.autoBackstory = $('#ai_bs').checked;
  saveSettings(); toast('AI settings saved.'); render();
}
// Older versions kept snippets/templates in the browser. They still override the data files until cleared.
function browserEdits(){
  const nz = o => Object.entries(o||{}).filter(([k,v])=>v && String(v).trim());
  const sn = nz(SET.snippets), cl = nz(SET.clothText), tp = nz(SET.ai.tpl), g = (SET.ai.guidance||'').trim(), ca = SET.customActs||[];
  const what = [sn.length&&`${sn.length} scene snippet${sn.length>1?'s':''}`, cl.length&&'clothing wording', (tp.length||g)&&'AI prompts', ca.length&&`${ca.length} custom service${ca.length>1?'s':''}`].filter(Boolean);
  return {n: sn.length + cl.length + tp.length + (g?1:0) + ca.length, what, sn, cl, tp, g, ca};
}
function exportEdits(){
  const e = browserEdits(), out = {};
  const snAct = e.sn.filter(([k])=>k.startsWith('act_')), snOther = e.sn.filter(([k])=>!k.startsWith('act_'));
  if(snOther.length || e.cl.length) out['data/snippets.json'] = Object.assign({}, DATA.snippets, {scenes:Object.assign({}, DATA.snippets.scenes, Object.fromEntries(snOther)), clothing:Object.assign({}, DATA.snippets.clothing, Object.fromEntries(e.cl))});
  if(e.tp.length || e.g) out['data/ai-prompts.json'] = Object.assign({}, DATA['ai-prompts'], Object.fromEntries(e.tp), e.g?{guidance:e.g}:{});
  if(e.ca.length || snAct.length){ const sv = JSON.parse(JSON.stringify(DATA.services.services.concat(e.ca)));
    snAct.forEach(([k,v])=>{ const a = sv.find(x=>x.id===k.slice(4)); if(a){ a.image = a.image || {}; a.image.extra = v; } });
    out['data/services.json'] = Object.assign({}, DATA.services, {services: sv}); }
  const txt = Object.entries(out).map(([k,v])=>`===== ${k} (replace the whole file) =====\n${JSON.stringify(v,null,2)}`).join('\n\n');
  modal(`<h2>Your browser edits</h2><p class="muted">Each block is the full file with your edits merged in. Paste it over that file in the repo, push, then come back and clear the browser edits.</p><textarea id="exp" style="min-height:260px">${esc(txt)}</textarea>
    <div class="row"><button class="primary" onclick="try{navigator.clipboard.writeText($('#exp').value);toast('Copied.')}catch(e){toast('Select and copy manually.')}">Copy</button><button onclick="dlText($('#exp').value,'hollowmere-browser-edits.txt')">Download file</button></div>`);
}
function clearEdits(){
  if(!confirm('Clear the snippets, clothing wording, AI prompts and custom services saved in this browser? The data files take over. Export first if you haven\'t.')) return;
  SET.snippets = {}; SET.clothText = {}; SET.ai.tpl = {}; SET.ai.guidance = ''; SET.customActs = []; saveSettings(); toast('Cleared. The data files are in charge now.'); render();
}
function exportBox(kind){
  const data = kind==='save' ? S : kind==='ngplus' ? ngSeed() : kind==='lib' ? LIB : {snippets:SET.snippets, clothText:SET.clothText, customActs:SET.customActs};
  if(!data) return toast('New Game+ unlocks once the debt is paid off.');
  const fname = kind==='ngplus' ? `ngplus-c${(S.cycle||1)+1}` : kind;
  modal(`<h2>Export ${kind==='ngplus'?'NG+ save':kind}</h2><p class="muted">${kind==='ngplus'?'Only what New Game+ carries forward: your lovers, old friends, kept houses, Sam and his perks. Import it any time (even on a fresh browser) to go straight to the New Game+ setup.':'Copy this text and keep it somewhere safe.'}</p><textarea id="exp" style="min-height:200px">${esc(JSON.stringify(data, kind==='lib' ? undefined : saveReplacer))}</textarea>
    <div class="row"><button class="primary" onclick="try{navigator.clipboard.writeText($('#exp').value);toast('Copied.')}catch(e){toast('Select and copy manually.')}">Copy</button><button onclick="dlText($('#exp').value,'hollowmere-${fname}.json')">Download file</button></div>`);
}
function dlText(text, name){
  try{ const blob = new Blob([text],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); }
  catch(e){ toast('Download blocked here. Copy the text instead.'); }
}
function importBox(kind){ modal(`<h2>Import ${kind}</h2><textarea id="imp" style="min-height:200px" placeholder="Paste exported text here (a full save or an NG+ save)"></textarea><div class="row">${SETUP?'<button onclick="setupView()">← Back</button>':''}<button class="primary" onclick="doImport('${kind}')">Import</button></div>`, {lock:!!SETUP}); }
function importSaveFile(){
  const inp = $('#upJson'); inp.value='';
  inp.onchange = ()=>{ const f=inp.files[0]; if(!f) return; const fr=new FileReader();
    fr.onload = ()=>doImport('save', String(fr.result));
    fr.onerror = ()=>toast('Couldn\'t read that file.');
    fr.readAsText(f); };
  inp.click();
}
function doImport(kind, text){
  let d; try{ d = JSON.parse(text ?? $('#imp').value); }catch(e){ return toast('That text isn\'t valid.'); }
  if(kind==='save'){ if(!d || !Array.isArray(d.workers)) return toast('That doesn\'t look like a save.'); if(saveTooOld(d)) return toast(tooOldMsg(d)); S = migrate(d); SETUP=null; save(); }
  else if(kind==='lib'){ if(!Array.isArray(d)) return toast('That doesn\'t look like a library.'); LIB = d; LIB.forEach(w=>{ if(w.stats && Math.max(...Object.values(w.stats))<=100){ scaleWorker(w); } migrateWorker(w); }); saveLib(); }
  else { if(typeof d!=='object' || Array.isArray(d)) return toast('That doesn\'t look like snippets.');
    if(d.snippets){ SET.snippets = d.snippets; SET.clothText = d.clothText||{}; SET.customActs = d.customActs||[]; } else SET.snippets = d; saveSettings(); }
  closeModal(); toast('Imported.'); render();
  if(kind==='save' && S.ngSeed && S.won) startNGPlus();   // an NG+ save goes straight to the New Game+ setup
}
async function exportImages(){
  const imgs = await idbAll('imgs'), thumbs = await idbAll('thumbs');
  const n = Object.keys(imgs).length; if(!n) return toast('No saved images yet.');
  dlText(JSON.stringify({imgs, thumbs}), `hollowmere-images-wk${S.week}.json`);
  toast(`Exported ${n} images.`);
}
function importImages(){
  const inp = $('#upJson'); inp.value='';
  inp.onchange = ()=>{ const f=inp.files[0]; if(!f) return; const fr=new FileReader();
    fr.onload = async ()=>{ let d; try{ d=JSON.parse(fr.result); }catch(e){ return toast('That file isn\'t valid.'); }
      let n=0; for(const [k,v] of Object.entries(d.imgs||{})){ await imgPut(k,v); n++; }
      for(const [k,v] of Object.entries(d.thumbs||{})){ await idbReq('thumbs','readwrite',s=>s.put(v,k)); THUMBS[k]=v; }
      toast(`Imported ${n} images.`); render(); };
    fr.readAsText(f); };
  inp.click();
}
function renameCurrentRun(){
  const v = ($('#s_runName') && $('#s_runName').value || '').trim();
  if(!v) return toast('Enter a run name.');
  ensureCloudRun(S);
  S.cloudName = v.slice(0, 80);
  save();
  toast(`Run renamed to "${S.cloudName}".`);
  if(cloudReady() && CLOUD_STATE.saves.slots[S.cloudId]){
    cloudSaveSlot(S.cloudId, S.cloudName, 'full', S, { baseUpdatedAt: S.cloudSyncedAt || 0 }).catch(()=>{});
  }
}
function viewCloudSettings(){
  const ready = cloudReady(), conn = CLOUD_STATE.connected;
  const slots = cloudSlotsSorted('all');
  const stats = cloudLocalPermStats();
  const statusHtml = !ready ? '<span class="muted">not configured</span>'
    : conn ? '<span class="good">connected</span>'
    : `<span class="warn">error${CLOUD_STATE.lastErr?': '+esc(CLOUD_STATE.lastErr):''}</span>`;
  return `<section class="card"><h2>Cloud Sync (Cloudflare R2)</h2>
    <p class="muted">Sync named save runs, cycle-end/NG+ snapshots, and permanent character images (<code>n_*</code> / <code>npc_*</code>) via your own Cloudflare Worker + R2 bucket. Images sync on demand only. Status: ${statusHtml}</p>
    <div class="form">
      <label>Worker URL <input id="c_url" value="${esc(CLOUD.url||'')}" placeholder="https://hollowmere-sync.you.workers.dev"></label>
      <label>Sync passphrase <input id="c_secret" type="password" value="${esc(CLOUD.secret||'')}" placeholder="Your SYNC_SECRET"></label>
    </div>
    <div class="row">
      <label class="chk"><input type="checkbox" id="c_autoSave" ${CLOUD.autoSave!==false?'checked':''}> Auto-save active run at the end of each week</label>
      <label class="chk"><input type="checkbox" id="c_autoMile" ${CLOUD.autoMilestone!==false?'checked':''}> Auto-snapshot NG+ seed when the debt is paid (refreshed when you start New Game+)</label>
      <label class="chk"><input type="checkbox" id="c_syncLib" ${CLOUD.syncLib?'checked':''}> Include Library characters in cloud image sync</label>
    </div>
    <div class="row">
      <button class="primary" onclick="saveCloudUI()">Save &amp; Connect</button>
      ${ready?`<button onclick="refreshCloudUI()">↻ Refresh</button>`:''}
    </div>
    ${conn ? `
    ${CLOUD_STATE.conflictRemote ? `<p class="warn"><b>Cloud sync conflict:</b> A newer cloud save (${cloudCycleLabel(CLOUD_STATE.conflictRemote)} · Wk ${CLOUD_STATE.conflictRemote.week||1}, saved ${esc(fmtTime(CLOUD_STATE.conflictRemote.updatedAt))}) exists. Auto-save is paused to protect it. <button class="sm" onclick="cloudOpenConflictModal(CLOUD_STATE.conflictRemote,'manual')">Resolve Conflict…</button></p>` : ''}
    <h3 style="margin-top:12px">Cloud Saves</h3>
    <div class="row">
      <button class="primary" onclick="cloudSaveCurrentRun()">Save "${esc(S.cloudName||'Current Run')}" to Cloud</button>
      <button onclick="cloudNewSnapshotPrompt()">+ New Named Snapshot</button>
    </div>
    ${cloudSavesTableHTML(slots, { manage: true, empty: 'No cloud saves yet.' })}
    <div class="row" style="margin-top:8px">
      <button class="sm" onclick="cloudPushExtra('settings')">Push Settings</button>
      <button class="sm" onclick="cloudPullExtra('settings')">Pull Settings</button>
      <button class="sm" onclick="cloudPushExtra('library')">Push Library</button>
      <button class="sm" onclick="cloudPullExtra('library')">Pull Library</button>
    </div>
    <h3 style="margin-top:12px">Cloud Images (Permanent Characters)</h3>
    <p class="muted">Local permanent images: <b>${stats.localPerm}</b> (${stats.synced} synced · ${stats.diff} different · ${stats.unsynced} not in cloud) · Total in R2: <b>${stats.remoteTotal}</b></p>
    <div class="row">
      <button onclick="cloudBatchPushImages()">↑ Upload unsynced permanent images</button>
      <button onclick="cloudPullAllThumbs()">⬇ Pull all portraits</button>
      <button onclick="cloudRebuildManifest()" title="Rebuild manifest from R2 objects">Rebuild manifest</button>
      <button onclick="cloudClearLocalCache()">Clear local image cache</button>
    </div>` : ''}</section>`;
}
async function saveCloudUI(){
  CLOUD.autoSave = $('#c_autoSave') ? $('#c_autoSave').checked : true;
  CLOUD.autoMilestone = $('#c_autoMile') ? $('#c_autoMile').checked : true;
  CLOUD.syncLib = $('#c_syncLib') ? $('#c_syncLib').checked : false;
  const url = $('#c_url') ? $('#c_url').value : CLOUD.url;
  const secret = $('#c_secret') ? $('#c_secret').value : CLOUD.secret;
  if(!String(url||'').trim() || !String(secret||'').trim()){
    CLOUD.url = String(url||'').trim().replace(/\/+$/, '');
    CLOUD.secret = String(secret||'').trim();
    saveCloudConfig();
    CLOUD_STATE.connected = false;
    toast('Cloud settings saved.');
    return render();
  }
  toast('Connecting to Cloudflare Worker…');
  const ok = await cloudConnectWith(url, secret, false);
  if(ok) toast('Connected to Cloudflare R2!');
  render();
}
async function refreshCloudUI(){
  toast('Refreshing cloud state…');
  const ok = await cloudRefresh(false);
  if(ok) toast('Cloud state refreshed.');
  render();
}
async function cloudSaveCurrentRun(){
  if(!S) return;
  ensureCloudRun(S);
  try{
    toast('Saving run to cloud…');
    await cloudSaveSlot(S.cloudId, S.cloudName, 'full', S, { baseUpdatedAt: S.cloudSyncedAt || 0 });
    save();
    toast(`Saved "${S.cloudName}" to cloud.`);
    render();
  }catch(e){
    if(e.conflict && e.remote){
      CLOUD_STATE.saves.slots[S.cloudId] = e.remote;
      cloudOpenConflictModal(e.remote, 'manual');
      render();
      return;
    }
    toast('Cloud save failed: ' + e.message);
  }
}
function cloudNewSnapshotPrompt(){
  if(!S) return;
  const defName = `${S.cloudName || 'Run'} · C${S.cycle||1} Wk${S.week}`;
  modal(`<h2>New Cloud Snapshot</h2>
    <div class="form">
      <label>Snapshot name <input id="snap_name" value="${esc(defName)}"></label>
      ${S.won ? `<label>Snapshot type <select id="snap_kind"><option value="full">Full save</option><option value="ngplus">NG+ seed (opens NG+ wizard)</option></select></label>` : ''}
    </div>
    <div class="row" style="margin-top:10px"><button class="primary" onclick="doCloudNewSnapshot()">Save Snapshot</button><button onclick="closeModal()">Cancel</button></div>`);
}
async function doCloudNewSnapshot(){
  const name = ($('#snap_name') && $('#snap_name').value || '').trim();
  if(!name) return toast('Enter a snapshot name.');
  const kind = ($('#snap_kind') && $('#snap_kind').value) || 'full';
  const slotId = 'snap_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
  try{
    await cloudSaveSlot(slotId, name, kind, null, { force: true });
    closeModal();
    toast(`Saved snapshot "${name}".`);
    if(TAB === 'settings') render();
  }catch(e){
    toast('Snapshot failed: ' + e.message);
  }
}
async function cloudOpenSlotsModal(){
  if(!cloudReady()){
    modal(`<h2>Connect Cloud Sync</h2>
      <p class="muted">Enter your Cloudflare Worker URL and sync passphrase to load a cloud save on this device.</p>
      <div class="form">
        <label>Worker URL <input id="cm_url" value="${esc(CLOUD.url||'')}" placeholder="https://hollowmere-sync.you.workers.dev"></label>
        <label>Sync passphrase <input id="cm_secret" type="password" value="${esc(CLOUD.secret||'')}" placeholder="Your SYNC_SECRET"></label>
      </div>
      <div class="row" style="margin-top:10px"><button class="primary" onclick="connectFromSetupModal()">Connect &amp; Load Saves</button>${SETUP?'<button onclick="setupView()">← Back</button>':'<button onclick="closeModal()">Close</button>'}</div>`, {lock:!!SETUP});
    return;
  }
  await cloudRefresh(false);
  const slots = cloudSlotsSorted('all');
  modal(`<h2>Load Cloud Save</h2>
    ${cloudSavesTableHTML(slots)}
    <div class="row" style="margin-top:10px">${SETUP?'<button onclick="setupView()">← Back</button>':'<button onclick="closeModal()">Close</button>'}</div>`, {lock:!!SETUP, wide:true});
}
async function connectFromSetupModal(){
  const ok = await cloudConnectWith($('#cm_url') && $('#cm_url').value, $('#cm_secret') && $('#cm_secret').value, false);
  if(ok) cloudOpenSlotsModal();
}
async function cleanImages(){
  const keep = new Set([...S.workers, ...S.candidates, ...LIB].map(w=>w.id).concat(Object.keys(NPCS)));
  const imgs = await idbAll('imgs'); let n=0;
  for(const k of Object.keys(imgs)){ const id=k.split('|')[0]; if(!keep.has(id) && !id.startsWith('n_')){ await imgDel(k); n++; } }
  const th = await idbAll('thumbs');
  for(const k of Object.keys(th)){ if(!keep.has(k) && !k.startsWith('n_')){ await idbReq('thumbs','readwrite',s=>s.delete(k)); delete THUMBS[k]; } }
  toast(`Removed ${n} unused images.`);
}
