'use strict';
function getPlugin(){
  const P = window.PL_PLUGINS; if(P && typeof P.t2i === 'function') return P.t2i;
  try{ if(typeof t2i === 'function') return t2i; }catch(e){}
  if(typeof window.t2i === 'function') return window.t2i;
  return null;
}
function extractUrl(d){
  if(!d) return null;
  if(typeof d==='string') return /^(data:image|blob:|https?:)/.test(d) ? d : null;
  for(const k of ['dataUrl','dataURL','imageDataUrl','imageUrl','url','src']) if(typeof d[k]==='string' && /^(data:image|blob:|https?:)/.test(d[k])) return d[k];
  for(const k of ['canvas','imageCanvas']) if(d[k] && d[k].toDataURL){ try{ return d[k].toDataURL('image/jpeg',0.92); }catch(e){} }
  if(d.image && d.image.src) return d.image.src;
  return null;
}
function findAny(id){
  if(SETUP && SETUP.prev && SETUP.prev[id]) return SETUP.prev[id];
  if(!S) return null;
  return S.workers.find(w=>w.id===id) || S.candidates.find(w=>w.id===id) || NPCS[id] || LIB.find(w=>w.id===id) || null;
}
// Transformed Lantern Angels (like Anael or awakened generics; not Caelia whose base data is already lantern, and not npc_ goddess forms)
// keep separate saved images and avatars from their plain angel form.
const isLanternVariant = w => !!(w && typeof isLanternAngel==='function' && isLanternAngel(w) && !String(w.id||'').startsWith('npc_') && !(w.key && NAMED[w.key] && NAMED[w.key].sub === 'lantern'));
const thumbId = w => isLanternVariant(w) ? w.id + ':lantern' : (w ? w.id : '');
// Images are saved per scene + clothing state + what she's wearing, so each outfit gets its own pictures.
function lookKey(w, cloth, scene){
  if(w.male || !w.outfit) return '';
  const ok = outfitKey(w, scene), go = getOutfit(w, scene) || {};
  const o = `o:${ok}:`, fc = favColorOf(w, scene);
  const u = w.under==='none' ? 'u:none' : `u:${w.under}:${usesColor(getUnder(w))?fc:''}`;
  const oLooks = !!(go.hairStyle || go.hairColor || go.eyes || go.skin || go.body || go.features || go.raceLook || (go.accessories && accVisible(itemAccState(w, go.accessories, go.accState), cloth, scene, w)));
  let base = cloth==='nude' ? (oLooks ? o+'nude' : '-') : cloth==='under' ? (oLooks ? o+'+'+u : u) : cloth==='partial' ? o+'+'+u : o;
  if(w.accState && w.accState!=='auto'){
    const curA = accessoryText(w, cloth, scene), defA = accessoryText(Object.assign({}, w, {accState:'auto'}), cloth, scene);
    if(curA !== defA) base += (curA ? '+acc' : '-acc');
  }
  if(isLanternVariant(w)) base += '+lantern';
  return base;
}
const imgKey = (w,scene,cloth) => { const l = lookKey(w,cloth,scene); return `${w.id}|${scene}|${cloth}` + (l?'|'+l:''); };
const legacyKey = (w,scene,cloth) => `${w.id}|${scene}|${cloth}`;
function imgCountFor(w, prefix){ let n=0; const p1 = `${w.id}|`; IMGKEYS.forEach(k=>{ if(k.startsWith(p1) && k.includes('|'+prefix)) n++; }); return n; }
async function saveImage(key, url, w, scene){
  const small = await shrink(url, 768, 0.88);
  if(!small){ toast('Couldn\'t read that image to save it. Download it, then use ⬆ Upload.'); return false; }
  await imgPut(key, small);
  if(typeof sha256DataUrl === 'function'){
    try{ const info = await sha256DataUrl(small); await imgMetaPut(key, {hash:info.hash, bytes:info.bytes, updatedAt:Date.now()}); }catch(e){}
  }
  const tid = w ? thumbId(w) : '';
  if(w && w.id!=='draft' && (scene==='portrait' || !THUMBS[tid])) await setThumb(tid, small);
  return true;
}
// mode: 'new' = regenerate now; 'auto' = generate if nothing's saved; 'manual' = only on request; 'local_only' = skip remote pull & auto-gen.
// Left out, it follows Settings (SET.autoImg). The weekly report passes 'auto' only when its 🎨 button is pressed.
// Any image can be hidden; hidden boxes show a "Show image" button and don't generate (SET.imgHidden = start hidden).
// Pictures by service (Settings, or the picker on a lady's report page): SET.svcImg[key] = 'show' (saved ones only) | 'gen' (generate if
// none is saved) | 'hide' (start hidden) | 'fold' (hidden, and folded away on the report); no entry = default. Keys are service ids
// (actKey) or the report's other kinds (SVC_IMG_CATS). The report always uses them; elsewhere only with SET.svcImgAll.
const SVC_IMG_CATS = {companion:'Company only', job:'At work', solo:'A night to herself', casual:'Other moments', spirit:'Reverse possession'};
const SVC_IMG_MODES = {'':'Default', show:'Show saved', gen:'Generate', hide:'Hide picture', fold:'Fold away'};
function svcImgKey(scene){
  const a = sceneAct(scene); if(a) return actKey(a);
  const b = sceneBase(scene);
  return b==='solo' ? 'solo' : /^job_/.test(b) ? 'job' : b==='companion' ? 'companion' : b==='casual' ? 'casual' : /spirit_futa$/.test(b) ? 'spirit' : null;
}
function svcImgMode(scene, where){ if(where!=='report' && !SET.svcImgAll) return ''; const k = svcImgKey(scene); return (k && (SET.svcImg||{})[k]) || ''; }
function setSvcImg(key, mode){ SET.svcImg = SET.svcImg || {}; if(mode) SET.svcImg[key] = mode; else delete SET.svcImg[key]; saveSettings(); }
const svcImgLabel = k => SVC_IMG_CATS[k] || actLabel(k);
async function showImg(boxId, id, scene, cloth, mode){
  const box = $('#'+boxId); const w = findAny(id); if(!box || !w) return;
  cloth = cloth || samSceneCloth(w, scene) || defaultCloth(w, scene);   // Sam scenes roll their dress level once, here; the buttons below keep it
  const skipRemote = mode === 'local_only';
  const sm = mode===undefined ? svcImgMode(scene) : '';   // a per-service setting overrides the global ones (SET.svcImgAll)
  if(mode===undefined) mode = sm==='gen' ? 'auto' : sm==='show' ? 'manual' : SET.autoImg===false ? 'manual' : 'auto';
  if(mode==='manual' || mode==='local_only') mode = undefined;
  const A0 = `'${boxId}','${id}','${scene}','${cloth}'`;
  if(box.dataset.hide ? box.dataset.hide==='1' : (sm==='hide' || sm==='fold') ? true : (sm==='show' || sm==='gen') ? false : !!SET.imgHidden){
    box.dataset.key = '';
    if(box.dataset.ext){ box.innerHTML = ''; syncImgBtn(boxId); return; }   // an outside button (weekly report) does the showing
    box.innerHTML = `<div class="row imgshow"><button class="sm" onclick="toggleImg(${A0},false)">🖼 Show image</button></div>`; return;
  }
  let key = imgKey(w, scene, cloth);
  box.dataset.key = key; syncImgBtn(boxId);
  const prompt = buildPrompt(w, scene, cloth);
  let saved = mode==='new' ? null : await imgGet(key), legacy = false;
  if(!saved && mode!=='new' && !isLanternVariant(w) && key!==legacyKey(w,scene,cloth)){ saved = await imgGet(legacyKey(w,scene,cloth)); if(saved){ legacy = true; } }
  const cloudPerm = typeof cloudReady==='function' && cloudReady() && isPermImgId(id);
  if(!saved && mode!=='new' && !skipRemote && cloudPerm && (CLOUD_STATE.manifest.imgs||{})[key]){
    box.innerHTML = `<div class="imgbox"><div class="imgph">Loading from cloud…</div></div>`;
    try{ saved = await cloudFetchImg(key, 'img'); }catch(e){}
  }
  if(box.dataset.key !== key || !box.isConnected) return;   // the modal moved on while we were loading
  const newKey = key; if(legacy) key = legacyKey(w,scene,cloth);
  box.innerHTML = '';
  const wrap = document.createElement('div'); wrap.className='imgbox'; box.appendChild(wrap);
  const A = `'${boxId}','${id}','${scene}','${cloth}'`;
  if(saved){ wrap.innerHTML = `<img src="${saved}" alt="">` + (legacy?`<div class="imgph small">Saved before outfits were tracked. Regenerate to save one for her current outfit.</div>`:''); }
  else if(mode==='new' || mode==='auto'){ generateInto(wrap, w, newKey, prompt, scene, mode==='new', boxId, id, cloth); }
  else wrap.innerHTML = `<div class="imgph">No saved image for this scene yet.</div>`;
  const bar = document.createElement('div'); bar.className='row';
  const clrLbl = cloudPerm ? '🗑 Local' : '🗑';
  bar.innerHTML = `<button class="sm" onclick="toggleImg(${A},true)" title="Hide this image">🙈 Hide</button><button class="sm" onclick="showImg(${A},'new')">🎨 ${saved?'Regenerate':'Generate'}</button>
    <button class="sm" onclick="uploadImg(${A})">⬆ Upload</button>
    ${saved?`<button class="sm" onclick="downloadImg('${key}','${esc(w.name).replace(/'/g,'')}')">⬇ Save file</button>${id!=='draft'?`<button class="sm" onclick="useAvatar('${key}','${id}')">👤 Avatar</button>`:''}<button class="sm" onclick="deleteImg('${key}',${A})" title="Clear local cached image">${clrLbl}</button>`:''}`
    + (cloudPerm ? `<span class="sync-pill none" data-sync-pill></span><button class="sm" data-cloud-push style="display:none" onclick="cloudPushBoxImg(${A})" title="Upload this image to Cloudflare R2">↑ Push</button><button class="sm" onclick="cloudCheckImg(${A})" title="Check cloud status and compare if different">⇄ Check</button><button class="sm" data-cloud-clear style="display:none" onclick="deleteImgBoth('${key}',${A})" title="Delete from both local cache and cloud">🗑☁</button>` : '');
  box.appendChild(bar);
  if(cloudPerm){
    renderCloudImgUI(box, key, id, !!saved);
    if(saved && (!IMG_META[key] || !IMG_META[key].hash)){
      ensureLocalImgMeta(key, saved).then(()=>{ if(box.isConnected && box.dataset.key===newKey) renderCloudImgUI(box, key, id, true); }).catch(()=>{});
    }
  }
  const det = document.createElement('details'); det.className='prompt'; if(!getPlugin()&&!saved) det.open = true;
  det.innerHTML = `<summary class="muted">Prompt</summary><textarea readonly>${esc(prompt)}</textarea>`;
  const cb = document.createElement('button'); cb.className='sm'; cb.textContent='Copy prompt';
  cb.onclick = ()=>{ try{ navigator.clipboard.writeText(prompt); toast('Prompt copied.'); }catch(e){ toast('Select the text and copy manually.'); } };
  det.appendChild(cb); box.appendChild(det);
}
function generateInto(wrap, w, key, prompt, scene, reroll, boxId, id, cloth){
  const plug = getPlugin();
  if(!plug){ wrap.innerHTML = `<div class="imgph">🎨 Image generator not connected.<br>In Perchance, add <code>t2i = {import:text-to-image-plugin}</code> to the lists panel.<br>You can still ⬆ Upload an image, or copy the prompt.</div>`; return; }
  w.imgVar = w.imgVar || {};
  if(reroll) w.imgVar[key] = (w.imgVar[key]||0) + 1;
  const seed = ((w.seed||1) + (w.imgVar[key]||0)*7919) % 2147483647;
  let done = false;
  const onFinish = async (data)=>{
    if(done) return; const url = extractUrl(data); if(!url) return; done = true;
    if(await saveImage(key, url, w, scene)){ toast('Image saved.'); const b=$('#'+boxId); if(b && b.dataset.key===key) showImg(boxId, id, scene, cloth); }
  };
  try{
    const r = plug({prompt, negativePrompt:SET.negative, seed, resolution:SET.resolution, onFinish});
    const html = (r && typeof r==='object' && 'evaluateItem' in r) ? r.evaluateItem : String(r);
    wrap.innerHTML = html + `<div class="imgph small">Generating… it saves automatically when finished. If it doesn't, use the image's own download button, then ⬆ Upload.</div>`;
  }catch(e){ wrap.innerHTML = `<div class="imgph">Image plugin error: ${esc(e.message)}</div>`; }
  if(S && w.id!=='draft') save();
}
function uploadImg(boxId, id, scene, cloth){
  const inp = $('#upFile'); inp.value='';
  inp.onchange = ()=>{ const f = inp.files[0]; if(!f) return; const fr = new FileReader();
    fr.onload = async ()=>{ const w=findAny(id); if(!w) return; if(await saveImage(imgKey(w,scene,cloth), fr.result, w, scene)){ toast('Image saved.'); showImg(boxId,id,scene,cloth); } };
    fr.readAsDataURL(f); };
  inp.click();
}
async function downloadImg(key, name){ const d = await imgGet(key); if(!d) return; const a=document.createElement('a'); a.href=d; a.download=`${name||'image'}-${key.split('|').slice(1).join('-').replace(/[^a-z0-9-]/gi,'_')}.jpg`; document.body.appendChild(a); a.click(); a.remove(); }
async function useAvatar(key, id){ const d = await imgGet(key); if(!d) return; const w = findAny(id); const tid = /\+lantern\b/.test(key) ? id + ':lantern' : (w ? thumbId(w) : id); await setThumb(tid, d); toast('Avatar updated.'); }
async function deleteImg(key, boxId, id, scene, cloth){ if(!confirm('Clear this image from local browser cache?')) return; await imgDel(key); showImg(boxId,id,scene,cloth,'local_only'); }
async function deleteImgBoth(key, boxId, id, scene, cloth){
  if(!confirm('Delete this image from BOTH this device and Cloudflare R2? It won\'t regenerate automatically.')) return;
  await imgDel(key);
  if(typeof cloudReady==='function' && cloudReady()){
    try{ await cloudDeleteImg(key, 'img'); }catch(e){ toast('Cloud delete failed: ' + e.message); }
  }
  toast('Image cleared locally and from cloud.');
  showImg(boxId, id, scene, cloth, 'local_only');
}
// A button outside the image box (weekly report highlights): "Show image" turns into "Hide image" once the image is up.
function syncImgBtn(boxId){ const b = $('#'+boxId+'_t'), box = $('#'+boxId); if(b && box) b.textContent = box.dataset.key ? '🙈 Hide image' : '🖼 Show image'; }
function setRepHide(box, id, scene, hide){
  if(!box || !box.dataset.ext) return;
  if(typeof REPV!=='undefined' && REPV){ REPV.hide = REPV.hide || {}; if(hide) REPV.hide[id+'|'+scene] = 1; else delete REPV.hide[id+'|'+scene]; }
  if(typeof S!=='undefined' && S){ S.repHide = S.repHide || {}; if(hide) S.repHide[id+'|'+scene] = 1; else delete S.repHide[id+'|'+scene]; save(); }
}
function toggleImgBtn(boxId, id, scene){ const box = $('#'+boxId); if(!box) return; const shown = !!box.dataset.key; box.dataset.hide = shown ? '1' : '0'; setRepHide(box, id, scene, shown); showImg(boxId, id, scene, null, shown ? 'manual' : 'auto'); }
function toggleImg(boxId, id, scene, cloth, hide){ const box = $('#'+boxId); if(!box) return; box.dataset.hide = hide ? '1' : '0'; setRepHide(box, id, scene, !!hide); showImg(boxId, id, scene, cloth, hide ? 'manual' : undefined); }
function avatarHTML(w){ const t = THUMBS[thumbId(w)]; return t ? `<div class="avatar"><img src="${t}" alt=""></div>` : `<div class="avatar" style="background:${hairHex(w)}">${esc(initials(w.name))}</div>`; }
