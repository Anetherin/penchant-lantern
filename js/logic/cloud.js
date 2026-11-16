'use strict';
/* =====================================================================
   CLOUD SYNC (Cloudflare Workers + R2)
   Optional per-user cloud sync for named save slots and permanent
   character images (n_* / npc_*). Images sync on demand only.
   ===================================================================== */
const DEFAULT_CLOUD = { url:'', secret:'', autoSave:true, autoMilestone:true, syncLib:false };
let CLOUD = Object.assign({}, DEFAULT_CLOUD, store.get(KEY_CLOUD) || {});
const CLOUD_STATE = { connected:false, busy:false, lastErr:'', manifest:{imgs:{}, thumbs:{}}, saves:{slots:{}, extras:{}} };
let CLOUD_CMP = null;

const saveCloudConfig = () => store.set(KEY_CLOUD, CLOUD);
const cloudBase = () => String(CLOUD.url || '').trim().replace(/\/+$/, '');
const cloudReady = () => !!(cloudBase() && CLOUD.secret);
const isPermImgId = id => !!id && (id.startsWith('n_') || id.startsWith('npc_') || (CLOUD.syncLib && typeof LIB !== 'undefined' && LIB.some(w => w.id === id)));
const keyOwnerId = key => String(key || '').split('|')[0];
const fmtBytes = b => b >= 1048576 ? (b/1048576).toFixed(1) + ' MB' : Math.max(1, Math.round((b||0)/1024)) + ' KB';
const fmtTime = ts => ts ? new Date(ts).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : '—';

async function cloudReq(path, opts = {}){
  const base = cloudBase();
  if(!base || !CLOUD.secret) throw new Error('Cloud sync is not configured.');
  const headers = Object.assign({ Authorization: 'Bearer ' + CLOUD.secret }, opts.headers || {});
  const res = await fetch(base + path, Object.assign({}, opts, { headers }));
  if(res.status === 401) throw new Error('Invalid sync passphrase.');
  if(!res.ok && res.status !== 404){
    let msg = `HTTP ${res.status}`;
    try{ const j = await res.json(); if(j && j.error) msg = j.error; }catch(e){}
    throw new Error(msg);
  }
  return res;
}

async function ensureLocalImgMeta(key, dataUrl){
  if(IMG_META[key] && IMG_META[key].hash) return IMG_META[key];
  const info = await sha256DataUrl(dataUrl);
  const meta = { hash: info.hash, bytes: info.bytes, updatedAt: Date.now() };
  await imgMetaPut(key, meta);
  return meta;
}

function cloudImgStatus(key, id, hasLocal){
  if(!cloudReady() || !isPermImgId(id)) return null;
  if(!hasLocal) return { code:'none', label:'No img', cls:'none' };
  const r = (CLOUD_STATE.manifest.imgs || {})[key];
  if(!r) return { code:'no_cloud', label:'No cloud', cls:'none' };
  const m = IMG_META[key];
  if(!m || !m.hash) return { code:'checking', label:'Checking…', cls:'none' };
  if(m.hash === r.hash) return { code:'synced', label:'Synced', cls:'synced' };
  return { code:'different', label:'Different', cls:'diff' };
}

function renderCloudImgUI(box, key, id, hasLocal){
  const pill = box.querySelector('[data-sync-pill]');
  const st = cloudImgStatus(key, id, hasLocal);
  if(pill){
    if(!st){ pill.style.display = 'none'; }
    else { pill.style.display = ''; pill.className = 'sync-pill ' + st.cls; pill.textContent = st.label; }
  }
  const pushBtn = box.querySelector('[data-cloud-push]');
  if(pushBtn) pushBtn.style.display = (st && hasLocal && st.code === 'no_cloud') ? '' : 'none';
  const clrBoth = box.querySelector('[data-cloud-clear]');
  if(clrBoth) clrBoth.style.display = (cloudReady() && isPermImgId(id) && !!(CLOUD_STATE.manifest.imgs||{})[key]) ? '' : 'none';
}

async function cloudRefresh(silent){
  if(!cloudReady()){ CLOUD_STATE.connected = false; return false; }
  try{
    const [mr, sr] = await Promise.all([cloudReq('/imgs/manifest'), cloudReq('/saves')]);
    CLOUD_STATE.manifest = (mr.ok ? await mr.json() : {imgs:{}, thumbs:{}}) || {imgs:{}, thumbs:{}};
    CLOUD_STATE.manifest.imgs = CLOUD_STATE.manifest.imgs || {};
    CLOUD_STATE.manifest.thumbs = CLOUD_STATE.manifest.thumbs || {};
    CLOUD_STATE.saves = (sr.ok ? await sr.json() : {slots:{}, extras:{}}) || {slots:{}, extras:{}};
    CLOUD_STATE.saves.slots = CLOUD_STATE.saves.slots || {};
    CLOUD_STATE.connected = true;
    CLOUD_STATE.lastErr = '';
    return true;
  }catch(e){
    CLOUD_STATE.connected = false;
    CLOUD_STATE.lastErr = e.message || 'Connection failed';
    if(!silent) toast('Cloud sync error: ' + CLOUD_STATE.lastErr);
    return false;
  }
}

async function cloudFetchImg(key, type='img'){
  const res = await cloudReq(`/imgs/item?k=${encodeURIComponent(key)}&type=${type}`);
  if(res.status === 404) return null;
  const blob = await res.blob();
  const dataUrl = await blobToDataUrl(blob);
  const hash = res.headers.get('X-Img-Hash') || (await sha256Hex(await blob.arrayBuffer()));
  const updatedAt = Number(res.headers.get('X-Img-Updated') || Date.now());
  const meta = { hash, bytes: blob.size, updatedAt };
  if(type === 'thumb'){
    THUMBS[key] = dataUrl;
    await idbReq('thumbs', 'readwrite', s => s.put(dataUrl, key));
    await imgMetaPut('thumb:' + key, meta);
    CLOUD_STATE.manifest.thumbs[key] = meta;
    if(S) render();
  } else {
    await imgPut(key, dataUrl);
    await imgMetaPut(key, meta);
    CLOUD_STATE.manifest.imgs[key] = meta;
    const id = keyOwnerId(key);
    if(!THUMBS[id] && CLOUD_STATE.manifest.thumbs[id]) cloudFetchImg(id, 'thumb').catch(()=>{});
  }
  return dataUrl;
}

async function cloudPushImg(key, type='img'){
  const dataUrl = type === 'thumb' ? THUMBS[key] : await imgGet(key);
  if(!dataUrl) throw new Error('No local image found.');
  const info = await sha256DataUrl(dataUrl);
  const res = await cloudReq(`/imgs/item?k=${encodeURIComponent(key)}&type=${type}`, {
    method: 'PUT',
    headers: { 'Content-Type': info.blob.type || 'image/jpeg', 'X-Img-Hash': info.hash },
    body: info.blob,
  });
  const out = await res.json();
  const meta = { hash: out.hash || info.hash, bytes: out.bytes || info.bytes, updatedAt: out.updatedAt || Date.now() };
  if(type === 'thumb'){
    await imgMetaPut('thumb:' + key, meta);
    CLOUD_STATE.manifest.thumbs[key] = meta;
  } else {
    await imgMetaPut(key, meta);
    CLOUD_STATE.manifest.imgs[key] = meta;
    const id = keyOwnerId(key);
    if(THUMBS[id]){
      const tm = IMG_META['thumb:' + id], rt = CLOUD_STATE.manifest.thumbs[id];
      if(!rt || (tm && tm.hash !== rt.hash)) cloudPushImg(id, 'thumb').catch(()=>{});
    }
  }
  return meta;
}

async function cloudDeleteImg(key, type='img'){
  await cloudReq(`/imgs/item?k=${encodeURIComponent(key)}&type=${type}`, { method: 'DELETE' });
  if(type === 'thumb') delete CLOUD_STATE.manifest.thumbs[key];
  else delete CLOUD_STATE.manifest.imgs[key];
}

async function cloudPushBoxImg(boxId, id, scene, cloth){
  const box = $('#' + boxId), key = box && box.dataset.key;
  if(!box || !key) return;
  try{
    toast('Uploading image…');
    await cloudPushImg(key, 'img');
    toast('Image uploaded to cloud.');
    renderCloudImgUI(box, key, id, true);
  }catch(e){
    toast('Upload failed: ' + e.message);
  }
}

async function cloudCheckImg(boxId, id, scene, cloth){
  if(!cloudReady()) return toast('Connect cloud sync in Settings first.');
  const box = $('#' + boxId), w = findAny(id);
  if(!box || !w) return;
  const key = box.dataset.key || imgKey(w, scene, cloth);
  try{
    const res = await cloudReq(`/imgs/meta?k=${encodeURIComponent(key)}&type=img`);
    const remote = res.status === 404 ? { exists: false } : await res.json();
    const localUrl = await imgGet(key);

    if(!remote.exists){
      delete CLOUD_STATE.manifest.imgs[key];
      renderCloudImgUI(box, key, id, !!localUrl);
      return toast(localUrl ? 'Not in cloud yet. Use ↑ Upload to save it.' : 'No image locally or in cloud.');
    }

    if(!localUrl){
      toast('Pulling image from cloud…');
      await cloudFetchImg(key, 'img');
      toast('Image pulled from cloud.');
      return showImg(boxId, id, scene, cloth);
    }

    const lm = await ensureLocalImgMeta(key, localUrl);
    if(lm.hash === remote.hash){
      CLOUD_STATE.manifest.imgs[key] = { hash: remote.hash, bytes: remote.bytes, updatedAt: remote.updatedAt };
      renderCloudImgUI(box, key, id, true);
      return toast('Synced — local image matches cloud.');
    }

    const imgRes = await cloudReq(`/imgs/item?k=${encodeURIComponent(key)}&type=img`);
    if(!imgRes.ok) return toast('Could not fetch cloud image.');
    const blob = await imgRes.blob();
    const remoteDataUrl = await blobToDataUrl(blob);
    const remoteObjUrl = URL.createObjectURL(blob);
    cloudOpenCompare({ boxId, id, scene, cloth, key, localUrl, localMeta: lm, remoteObjUrl, remoteDataUrl, remote });
  }catch(e){
    toast('Cloud check failed: ' + e.message);
  }
}

function cloudOpenCompare(cmp){
  CLOUD_CMP = cmp;
  modal2(`<h2>Compare Local vs. Cloud Image</h2>
    <p class="muted">The image stored in Cloudflare R2 differs from the one cached on this device. Choose which version to keep:</p>
    <div class="cmp-grid">
      <div class="cmp-card">
        <b>This Device (Local)</b>
        <img src="${cmp.localUrl}" alt="Local image">
        <div class="muted">${fmtBytes(cmp.localMeta.bytes)} · saved ${fmtTime(cmp.localMeta.updatedAt)}</div>
        <button class="primary" onclick="cloudResolveDiff('push')">Keep Local &amp; Overwrite Cloud</button>
      </div>
      <div class="cmp-card">
        <b>Cloud (R2)</b>
        <img src="${cmp.remoteObjUrl}" alt="Cloud image">
        <div class="muted">${fmtBytes(cmp.remote.bytes)} · updated ${fmtTime(cmp.remote.updatedAt)}</div>
        <button class="primary" onclick="cloudResolveDiff('pull')">Use Cloud &amp; Replace Local</button>
      </div>
    </div>
    <div class="row"><button onclick="closeModal2()">Cancel</button></div>`, () => {
      if(CLOUD_CMP && CLOUD_CMP.remoteObjUrl) URL.revokeObjectURL(CLOUD_CMP.remoteObjUrl);
      CLOUD_CMP = null;
    });
}

async function cloudResolveDiff(action){
  const cmp = CLOUD_CMP;
  if(!cmp) return closeModal2();
  try{
    if(action === 'push'){
      toast('Uploading local image to cloud…');
      await cloudPushImg(cmp.key, 'img');
      toast('Cloud image updated.');
    } else if(action === 'pull'){
      await imgPut(cmp.key, cmp.remoteDataUrl);
      const meta = { hash: cmp.remote.hash, bytes: cmp.remote.bytes, updatedAt: cmp.remote.updatedAt };
      await imgMetaPut(cmp.key, meta);
      CLOUD_STATE.manifest.imgs[cmp.key] = meta;
      const w = findAny(cmp.id);
      if(w && cmp.id !== 'draft' && (cmp.scene === 'portrait' || !THUMBS[cmp.id])) await setThumb(cmp.id, cmp.remoteDataUrl);
      toast('Local image replaced with cloud copy.');
    }
    closeModal2();
    showImg(cmp.boxId, cmp.id, cmp.scene, cmp.cloth);
  }catch(e){
    toast('Sync failed: ' + e.message);
  }
}

/* ---------- Named runs & multi-slot cloud saves ---------- */
function ensureCloudRun(s){
  if(!s) return;
  if(!s.cloudId) s.cloudId = 'run_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  if(!s.cloudName) s.cloudName = ((s.houses && s.houses[0] && s.houses[0].name) || 'Main Run');
}

function cloudBuildMeta(data, name, kind, id){
  const h0 = data && data.houses && data.houses[0];
  return {
    id,
    name: String(name || data.cloudName || 'Unnamed Save').trim().slice(0, 80),
    kind: kind || (data.ngSeed ? 'ngplus' : 'full'),
    cycle: data.cycle || 1,
    ngppCycle: data.ngppCycle || 0,
    week: data.week || 1,
    gold: Math.round(data.gold || 0),
    house: h0 ? h0.name : '',
    workers: (data.workers || []).length,
  };
}

async function cloudSaveSlot(slotId, name, kind = 'full', sourceData = null){
  if(!cloudReady()) return null;
  const raw = sourceData || (kind === 'ngplus' ? ngSeed() : S);
  if(!raw) throw new Error(kind === 'ngplus' ? 'New Game+ unlocks once the debt is paid off.' : 'No active game.');
  const payloadObj = JSON.parse(JSON.stringify(raw, saveReplacer));
  const meta = cloudBuildMeta(payloadObj, name, kind, slotId);
  const res = await cloudReq(`/saves/slot?id=${encodeURIComponent(slotId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ meta, data: payloadObj }),
  });
  const out = await res.json();
  CLOUD_STATE.saves.slots[slotId] = out.meta;
  if(S && slotId === S.cloudId) S.cloudSyncedAt = out.meta.updatedAt;
  return out.meta;
}

async function cloudAutoSave(){
  if(!cloudReady() || !CLOUD.autoSave || !S) return;
  ensureCloudRun(S);
  try{
    await cloudSaveSlot(S.cloudId, S.cloudName, 'full', S);
    store.set(KEY_SAVE, S, saveReplacer);
  }catch(e){
    CLOUD_STATE.lastErr = e.message;
  }
}

async function cloudSaveMilestone(){
  if(!cloudReady() || !CLOUD.autoMilestone || !S || !S.won) return;
  ensureCloudRun(S);
  const seed = ngSeed();
  if(!seed) return;
  const slotId = `${S.cloudId}_c${S.cycle||1}_ngp`;
  const name = `${S.cloudName} · Cycle ${S.cycle||1} Clear (NG+)`;
  try{
    await cloudSaveSlot(slotId, name, 'ngplus', seed);
  }catch(e){}
}

async function cloudLoadSlot(slotId){
  try{
    toast('Loading save from cloud…');
    const res = await cloudReq(`/saves/slot?id=${encodeURIComponent(slotId)}`);
    if(!res.ok) return toast('Cloud save not found.');
    const pkg = await res.json();
    const d = pkg && pkg.data;
    if(!d || !Array.isArray(d.workers)) return toast('Invalid cloud save.');
    if(!d.cloudId) d.cloudId = slotId;
    if(!d.cloudName && pkg.meta && pkg.meta.name) d.cloudName = pkg.meta.name;
    d.cloudSyncedAt = (pkg.meta && pkg.meta.updatedAt) || Date.now();
    S = migrate(d);
    SETUP = null;
    save();
    closeModal();
    toast(`Loaded "${S.cloudName}".`);
    render();
    if(S.ngSeed && S.won) startNGPlus();
  }catch(e){
    toast('Could not load save: ' + e.message);
  }
}

async function cloudExportSlot(slotId){
  try{
    const res = await cloudReq(`/saves/slot?id=${encodeURIComponent(slotId)}`);
    if(!res.ok) return toast('Save slot not found.');
    const pkg = await res.json();
    const name = ((pkg.meta && pkg.meta.name) || slotId).toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
    dlText(JSON.stringify(pkg.data), `hollowmere-${name}.json`);
  }catch(e){
    toast('Export failed: ' + e.message);
  }
}

async function cloudOverwriteSlot(slotId){
  const cur = CLOUD_STATE.saves.slots[slotId];
  if(!cur) return;
  const kind = cur.kind === 'ngplus' && S && S.won ? 'ngplus' : 'full';
  if(!confirm(`Overwrite cloud slot "${cur.name}" with your current ${kind === 'ngplus' ? 'NG+ seed' : 'save'}?`)) return;
  try{
    await cloudSaveSlot(slotId, cur.name, kind);
    toast(`Updated "${cur.name}".`);
    if(TAB === 'settings') render();
  }catch(e){
    toast('Save failed: ' + e.message);
  }
}

async function cloudRenameSlot(slotId){
  const cur = CLOUD_STATE.saves.slots[slotId];
  if(!cur) return;
  const next = prompt('New save name:', cur.name || '');
  if(!next || !next.trim()) return;
  try{
    const res = await cloudReq(`/saves/slot?id=${encodeURIComponent(slotId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: next.trim() }),
    });
    const out = await res.json();
    CLOUD_STATE.saves.slots[slotId] = out.meta;
    if(S && S.cloudId === slotId){ S.cloudName = next.trim(); save(); }
    toast('Save renamed.');
    if(TAB === 'settings') render();
  }catch(e){
    toast('Rename failed: ' + e.message);
  }
}

async function cloudDeleteSlot(slotId){
  const cur = CLOUD_STATE.saves.slots[slotId];
  if(!confirm(`Delete cloud save "${(cur && cur.name) || slotId}"? Your local save is not affected.`)) return;
  try{
    await cloudReq(`/saves/slot?id=${encodeURIComponent(slotId)}`, { method: 'DELETE' });
    delete CLOUD_STATE.saves.slots[slotId];
    toast('Cloud save deleted.');
    if(TAB === 'settings') render();
  }catch(e){
    toast('Delete failed: ' + e.message);
  }
}

async function cloudPushExtra(kind){
  const data = kind === 'settings' ? SET : LIB;
  try{
    await cloudReq(`/saves/extra?kind=${kind}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    CLOUD_STATE.saves.extras[kind] = Date.now();
    toast(`${cap(kind)} saved to cloud.`);
    if(TAB === 'settings') render();
  }catch(e){
    toast('Upload failed: ' + e.message);
  }
}

async function cloudPullExtra(kind){
  try{
    const res = await cloudReq(`/saves/extra?kind=${kind}`);
    if(res.status === 404) return toast(`No ${kind} saved in cloud yet.`);
    const pkg = await res.json();
    if(!pkg || pkg.data === undefined) return toast('Invalid cloud data.');
    if(kind === 'settings'){
      const d = pkg.data;
      SET = Object.assign({}, DEFAULT_SETTINGS, d);
      SET.snippets = Object.assign({}, d.snippets || {});
      SET.clothText = Object.assign({}, d.clothText || {});
      SET.customActs = (d.customActs || []).slice();
      SET.ai = Object.assign({}, DEFAULT_SETTINGS.ai, d.ai || {});
      SET.ai.tpl = Object.assign({}, (d.ai && d.ai.tpl) || {});
      saveSettings();
    } else if(Array.isArray(pkg.data)){
      LIB = pkg.data;
      LIB.forEach(w => { if(w.stats && Math.max(...Object.values(w.stats)) <= 100) scaleWorker(w); migrateWorker(w); });
      saveLib();
    }
    toast(`Loaded ${kind} from cloud.`);
    if(TAB === 'settings') render();
  }catch(e){
    toast('Load failed: ' + e.message);
  }
}

/* ---------- Batch image tools ---------- */
function cloudLocalPermStats(){
  const permKeys = [...IMGKEYS].filter(k => isPermImgId(keyOwnerId(k)));
  const remoteImgs = CLOUD_STATE.manifest.imgs || {};
  let synced = 0, unsynced = 0, diff = 0;
  permKeys.forEach(k => {
    const r = remoteImgs[k], m = IMG_META[k];
    if(!r) unsynced++;
    else if(m && m.hash && m.hash === r.hash) synced++;
    else if(m && m.hash) diff++;
    else unsynced++;
  });
  return { localPerm: permKeys.length, remoteTotal: Object.keys(remoteImgs).length, synced, unsynced, diff };
}

async function cloudBatchPushImages(){
  if(!cloudReady()) return toast('Connect cloud sync first.');
  await cloudRefresh(true);
  const permKeys = [...IMGKEYS].filter(k => isPermImgId(keyOwnerId(k)));
  const toPush = [];
  for(const k of permKeys){
    const r = CLOUD_STATE.manifest.imgs[k];
    if(!r){ toPush.push(k); continue; }
    const u = await imgGet(k);
    if(u){
      const lm = await ensureLocalImgMeta(k, u);
      if(!r.hash) toPush.push(k);
      else if(lm.hash !== r.hash) continue;   // leave differences for manual per-image comparison
    }
  }
  if(!toPush.length) return toast('No missing permanent images to upload.');
  toast(`Uploading ${toPush.length} image${toPush.length===1?'':'s'}…`);
  let done = 0, fail = 0;
  for(const k of toPush){
    try{ await cloudPushImg(k, 'img'); done++; }catch(e){ fail++; }
  }
  toast(`Uploaded ${done} image${done===1?'':'s'}${fail ? ` (${fail} failed)` : ''}.`);
  if(TAB === 'settings') render();
}

async function cloudPullAllThumbs(){
  if(!cloudReady()) return toast('Connect cloud sync first.');
  await cloudRefresh(true);
  const ids = Object.keys(CLOUD_STATE.manifest.thumbs || {}).filter(isPermImgId);
  const need = ids.filter(id => {
    const rt = CLOUD_STATE.manifest.thumbs[id], lt = IMG_META['thumb:' + id];
    return !THUMBS[id] || !lt || (rt && rt.hash && lt.hash !== rt.hash);
  });
  if(!need.length) return toast('All permanent portraits are already cached.');
  let n = 0;
  for(const id of need){
    try{ if(await cloudFetchImg(id, 'thumb')) n++; }catch(e){}
  }
  toast(`Downloaded ${n} portrait${n===1?'':'s'}.`);
  if(TAB === 'settings') render();
}

async function cloudRebuildManifest(){
  if(!cloudReady()) return toast('Connect cloud sync first.');
  try{
    const res = await cloudReq('/imgs/rebuild-manifest', { method: 'POST' });
    const out = await res.json();
    await cloudRefresh(true);
    toast(`Rebuilt manifest: ${out.imgs} images, ${out.thumbs} portraits.`);
    if(TAB === 'settings') render();
  }catch(e){
    toast('Rebuild failed: ' + e.message);
  }
}

async function cloudClearLocalCache(){
  if(!confirm('Clear ALL cached images and thumbnails from this browser? Images saved in Cloudflare R2 will remain safe.')) return;
  for(const k of [...IMGKEYS]) await imgDel(k);
  for(const id of Object.keys(THUMBS)){
    delete THUMBS[id];
    await idbReq('thumbs', 'readwrite', s => s.delete(id));
    await imgMetaDel('thumb:' + id);
  }
  toast('Local image cache cleared.');
  render();
}

async function cloudInit(){
  if(!cloudReady()) return;
  const ok = await cloudRefresh(true);
  if(!ok) return;
  if(S){
    ensureCloudRun(S);
    const slot = CLOUD_STATE.saves.slots[S.cloudId];
    if(slot && slot.updatedAt > Math.max(S.localSavedAt || 0, S.cloudSyncedAt || 0) + 2000 && !SETUP && !MODAL_LOCK){
      modal(`<h2>Newer Cloud Save Available</h2>
        <p>The cloud save for <b>${esc(slot.name)}</b> (Cycle ${slot.cycle}, Week ${slot.week}, saved ${esc(fmtTime(slot.updatedAt))}) is newer than this browser's local save (Week ${S.week}).</p>
        <div class="row"><button class="primary" onclick="cloudLoadSlot('${esc(slot.id)}')">Load Cloud Save</button><button onclick="closeModal()">Keep Local</button></div>`);
    }
  }
  if(TAB === 'settings') render();
}
