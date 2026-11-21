'use strict';
/* ---------- Image gallery ----------
   Browse a lady's saved images (Settings → Images, or 🖼 Gallery on her sheet). Two views:
   - Checklist: her sheet scenes (sheetScenes) for one outfit, one expression (client services) and one dress level,
     marking which have a saved image and which are missing; missing ones can be generated one by one or all at once.
   - All saved: every image saved for her (local, plus the cloud manifest for permanent characters), filterable by outfit.
   Images are keyed `id|scene|cloth|look` (imgKey in imagegen.js); the outfit part of the look is `o:<outfit>:...`.
   Generation runs through a floating tray (#galTray) outside the modal, so the plugin's frame survives re-renders and
   closing the gallery. */
let GAL = {id:null, view:'check', outfit:'', expr:'', cloth:'auto', group:'all', missing:false, savedOutfit:'*', keys:[]};
const GAL_EXPR_LABEL = {bored:'Bored', professional:'Professional', into:'Into it', lost:'Lost in it', flustered:'Flustered', smug:'Smug', teasing:'Teasing', tender:'Tender', fierce:'Fierce', languid:'Languid'};
const galExprs = () => Object.keys(SNIP_EXPR).filter(k => !k.startsWith('_'));
const galExprLabel = e => GAL_EXPR_LABEL[e] || (e.charAt(0).toUpperCase() + e.slice(1));
// Outfit choices: what she can wear (her own + the house stock) and her own custom outfit.
function galOutfits(w){
  const out = ownedOutfits(w).map(k => [k, WARDROBE[k].label]);
  if(w.customOutfit) out.push(['custom', 'Her own outfit']);
  return out;
}
const galOutfitLabel = k => k==='custom' ? 'Her own outfit' : (WARDROBE[k] ? WARDROBE[k].label : k);
// A stand-in for her wearing outfit k everywhere (work, service, off duty), so imgKey / buildPrompt picture that outfit.
function galLady(w, k){
  if(!k) return w;
  const jo = Object.assign({}, w.jobOutfit || {}); if(w.job) jo[w.job] = k==='custom' ? '' : k;
  return Object.assign({}, w, {outfit:k, svcOutfit:k, jobOutfit:jo});
}
const galCloud = id => typeof cloudReady==='function' && cloudReady() && typeof isPermImgId==='function' && isPermImgId(id);
const galHas = (key, id) => IMGKEYS.has(key) || (galCloud(id) && !!(CLOUD_STATE.manifest.imgs||{})[key]);
const galLocal = key => IMGKEYS.has(key);
// Scene groups for the checklist filter.
const galGroupOf = s => /^act:/.test(s) ? 'client' : /^(samact:|sam_|date_|shower|walkin)/.test(s) ? 'sam' : 'general';
const GAL_GROUPS = {all:'All scenes', general:'General', client:'Client services', sam:'With Sam'};
// The scene key a checklist row stands for: client services carry the chosen expression the way the report writes them.
const galScene = (s, expr) => expr && /^act:/.test(s) ? `${s}~${expr}~` : s;
function galRows(w){
  const lw = galLady(w, GAL.outfit);
  return sheetScenes(w).filter(s => GAL.group==='all' || galGroupOf(s)===GAL.group).map(s0 => {
    const scene = galScene(s0, GAL.expr), withSam = /^sam/.test(scene);
    const levels = GAL.cloth==='auto' ? CLOTH.map(c=>c.id).filter(c=>clothOK(lw, c, withSam)) : [GAL.cloth];
    const def = GAL.cloth==='auto' ? defaultCloth(lw, scene) : GAL.cloth;
    // a saved image at the default level first, then any other level (Sam scenes roll theirs)
    const order = [def, ...levels.filter(c=>c!==def)];
    const hit = order.map(c => imgKey(lw, scene, c)).find(k => galHas(k, w.id));
    return {scene, label:sceneInfo(scene, lw).label, cloth:def, key:hit || imgKey(lw, scene, def), saved:!!hit};
  });
}
// Every image saved for her: local keys, plus cloud ones for permanent characters.
function galSavedKeys(w){
  const p = w.id + '|', ks = new Set([...IMGKEYS].filter(k=>k.startsWith(p)));
  if(galCloud(w.id)) Object.keys(CLOUD_STATE.manifest.imgs||{}).forEach(k=>{ if(k.startsWith(p)) ks.add(k); });
  return [...ks].sort();
}
function galParse(key){
  const [id, scene, cloth, ...rest] = key.split('|'), look = rest.join('|');
  const m = /^o:([^:+]+)/.exec(look);
  return {id, scene, cloth, outfit: m ? m[1] : (look ? '-' : '')};
}
const galSavedOutfitLabel = o => o==='' ? 'Not tracked (older images)' : o==='-' ? 'No outfit (underwear / undressed)' : galOutfitLabel(o);
function galSceneLabel(scene, w){ try{ return sceneInfo(scene, w).label || scene; }catch(e){ return scene; } }
function galExprOf(scene){ const e = sceneParts(scene).expr; return e ? galExprLabel(e) : ''; }

function openGallery(id){
  const w = (id && findW(id)) || findW(GAL.id) || S.workers[0]; if(!w){ toast('No ladies yet.'); return; }
  if(GAL.id !== w.id){ GAL.outfit = ''; GAL.savedOutfit = '*'; }
  GAL.id = w.id; ensureWorker(w);
  if(GAL.outfit && !galOutfits(w).some(o=>o[0]===GAL.outfit)) GAL.outfit = '';
  renderGallery();
}
function galSet(k, v){ GAL[k] = v; renderGallery(); }
function renderGallery(){
  const w = findW(GAL.id); if(!w) return;
  const ladies = rosterOrder(S.workers.slice());
  const cur = outfitKey(w), curLbl = galOutfitLabel(cur);
  const sel = (k, opts, v) => `<select onchange="galSet('${k}',this.value)">${opts.map(([val,l])=>`<option value="${esc(val)}" ${val===v?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
  const head = `<h2>🖼 Image gallery</h2>
    <div class="row"><select onchange="openGallery(this.value)">${ladies.map(x=>`<option value="${x.id}" ${x.id===w.id?'selected':''}>${esc(titled(x))} (${galSavedKeys(x).length})</option>`).join('')}</select>
      <button class="sm" onclick="openSheet('${w.id}')">← Her sheet</button>
      <button class="sm ${GAL.view==='check'?'primary':''}" onclick="galSet('view','check')">Checklist</button>
      <button class="sm ${GAL.view==='saved'?'primary':''}" onclick="galSet('view','saved')">All saved</button></div>`;
  GAL.keys = [];
  let body = '';
  if(GAL.view==='check'){
    const rows = galRows(w), miss = rows.filter(r=>!r.saved), shown = GAL.missing ? miss : rows;
    body = `<div class="row">
        👗 ${sel('outfit', [['', 'Current ('+curLbl+')'], ...galOutfits(w).filter(o=>o[0]!==cur)], GAL.outfit)}
        🙂 ${sel('expr', [['', 'Expression: none'], ...galExprs().map(e=>[e, galExprLabel(e)])], GAL.expr)}
        ${sel('cloth', [['auto', 'Dress: any saved / default'], ...CLOTH.map(c=>[c.id, c.label])], GAL.cloth)}
        ${sel('group', Object.entries(GAL_GROUPS), GAL.group)}
        <label class="chk"><input type="checkbox" ${GAL.missing?'checked':''} onchange="galSet('missing',this.checked)"> Missing only</label></div>
      <div class="row"><span class="muted">${rows.length - miss.length} / ${rows.length} saved${GAL.expr?` · the expression applies to client services only`:''}</span>
        ${miss.length ? `<button class="sm primary" onclick="galGenMissing()">🎨 Generate missing (${miss.length})</button>` : ''}</div>
      <div class="galgrid">${shown.map(r => galTile(w, r.key, r.label, r.saved, {scene:r.scene, cloth:r.cloth, outfit:GAL.outfit})).join('') || '<p class="muted">Nothing missing here.</p>'}</div>`;
  } else {
    const all = galSavedKeys(w).map(k=>Object.assign({key:k}, galParse(k)));
    const outs = [...new Set(all.map(x=>x.outfit))];
    const shown = GAL.savedOutfit==='*' ? all : all.filter(x=>x.outfit===GAL.savedOutfit);
    body = `<div class="row">👗 ${sel('savedOutfit', [['*', `Any outfit (${all.length})`], ...outs.map(o=>[o, `${galSavedOutfitLabel(o)} (${all.filter(x=>x.outfit===o).length})`])], GAL.savedOutfit)}</div>
      <div class="galgrid">${shown.map(x => galTile(w, x.key, galSceneLabel(x.scene, w) + (galExprOf(x.scene)?' · '+galExprOf(x.scene):''), true, {sub:`${(CLOTH.find(c=>c.id===x.cloth)||{label:x.cloth}).label} · ${galSavedOutfitLabel(x.outfit)}`})).join('') || '<p class="muted">No saved images for her yet.</p>'}</div>`;
  }
  modal(head + body, {wide:true});
  SHEET = null;
  galLoadThumbs();
}
// One tile: the image (loaded lazily) or a "missing" placeholder with a Generate button.
function galTile(w, key, label, saved, o){
  const i = GAL.keys.push(Object.assign({key, wid:w.id}, o)) - 1;
  const busy = GAL_GEN.cur && GAL_GEN.cur.key===key || GAL_GEN.q.some(j=>j.key===key);
  const pic = saved ? `<div class="galimg" data-gi="${i}" onclick="galView(${i})"><span class="muted">${galLocal(key)?'…':'☁'}</span></div>`
    : `<div class="galimg miss"><span class="muted">${busy?'⏳ queued':'Missing'}</span></div>`;
  return `<div class="galtile">${pic}<div class="galcap">${esc(label)}${o.sub?`<br><span class="muted">${esc(o.sub)}</span>`:''}</div>
    ${saved ? '' : `<button class="sm" ${busy?'disabled':''} onclick="galGenOne(${i})">🎨 Generate</button>`}</div>`;
}
// Load the visible tiles' images (local first, then the cloud for permanent characters).
let GAL_IO = null;
function galLoadThumbs(){
  const tiles = document.querySelectorAll('#modalBox .galimg[data-gi]');
  const load = async el => {
    const g = GAL.keys[+el.dataset.gi]; if(!g || el.dataset.done) return; el.dataset.done = '1';
    let d = await imgGet(g.key);
    if(!d && galCloud(g.wid)){ try{ d = await cloudFetchImg(g.key, 'img'); }catch(e){} }
    if(el.isConnected) el.innerHTML = d ? `<img src="${d}" alt="" loading="lazy">` : '<span class="muted">Not found</span>';
  };
  if(GAL_IO) GAL_IO.disconnect();
  if('IntersectionObserver' in window){
    GAL_IO = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ GAL_IO.unobserve(e.target); load(e.target); } }), {root:$('#modal'), rootMargin:'300px'});
    tiles.forEach(t => GAL_IO.observe(t));
  } else tiles.forEach(load);
}
// Full-size view on the second modal layer, with the usual image actions.
async function galView(i){
  const g = GAL.keys[i]; if(!g) return; const w = findW(g.wid); if(!w) return;
  let d = await imgGet(g.key);
  if(!d && galCloud(g.wid)){ try{ d = await cloudFetchImg(g.key, 'img'); }catch(e){} }
  if(!d){ toast('Couldn\'t load that image.'); return; }
  const P = galParse(g.key), canRegen = !!g.scene;
  modal2(`<h3>${esc(galSceneLabel(P.scene, w))}${galExprOf(P.scene)?' · '+esc(galExprOf(P.scene)):''}</h3>
    <div class="muted">${esc((CLOTH.find(c=>c.id===P.cloth)||{label:P.cloth}).label)} · ${esc(galSavedOutfitLabel(P.outfit))}</div>
    <div class="imgbox" style="margin-top:6px"><img src="${d}" alt=""></div>
    <div class="row"><button class="sm" onclick="downloadImg(GAL.keys[${i}].key,'${esc(w.name).replace(/'/g,'')}')">⬇ Save file</button>
      <button class="sm" onclick="useAvatar(GAL.keys[${i}].key,'${w.id}')">👤 Avatar</button>
      ${canRegen ? `<button class="sm" onclick="closeModal2();galGenOne(${i},true)">🎨 Regenerate</button>` : ''}
      <button class="sm" onclick="galDelete(${i})">🗑 Delete local copy</button></div>
    <details class="prompt"><summary class="muted">Key</summary><code style="word-break:break-all">${esc(g.key)}</code></details>`);
}
async function galDelete(i){
  const g = GAL.keys[i]; if(!g || !confirm('Clear this image from local browser cache?' + (galCloud(g.wid)?' (The cloud copy stays.)':''))) return;
  await imgDel(g.key); closeModal2(); renderGallery();
}

/* ---------- generation queue ---------- */
const GAL_GEN = {q:[], cur:null, done:0, total:0};
function galJob(i, reroll){
  const g = GAL.keys[i]; if(!g) return null;
  const w = findW(g.wid); if(!w) return null;
  // All saved view: regenerate the same scene/dress level in the outfit that key was saved for (if she still has it)
  if(!g.scene){ const P = galParse(g.key); const o = P.outfit && P.outfit!=='-' && galOutfits(w).some(x=>x[0]===P.outfit) ? P.outfit : '';
    return {wid:w.id, scene:P.scene, cloth:P.cloth, outfit:o, key:g.key, reroll:true}; }
  return {wid:w.id, scene:g.scene, cloth:g.cloth, outfit:g.outfit||'', key:g.key, reroll:!!reroll};
}
function galGenOne(i, reroll){
  if(!getPlugin()){ toast('Image generator not connected (see the Prompt box on any image).'); return; }
  const j = galJob(i, reroll); if(!j) return; galEnqueue([j]);
}
function galGenMissing(){
  if(!getPlugin()){ toast('Image generator not connected (see the Prompt box on any image).'); return; }
  const w = findW(GAL.id); if(!w) return;
  const miss = galRows(w).filter(r=>!r.saved).map(r=>({wid:w.id, scene:r.scene, cloth:r.cloth, outfit:GAL.outfit, key:r.key}))
    .filter(j => !(GAL_GEN.cur && GAL_GEN.cur.key===j.key) && !GAL_GEN.q.some(x=>x.key===j.key));
  if(!miss.length){ toast('Already queued.'); return; }
  if(miss.length > 3 && !confirm(`Generate ${miss.length} images one after another? You can stop the queue from the tray.`)) return;
  galEnqueue(miss);
}
function galEnqueue(jobs){
  GAL_GEN.q.push(...jobs); GAL_GEN.total += jobs.length;
  galTray(); if(!GAL_GEN.cur) galNext();
  if(!$('#modal').classList.contains('hidden') && document.querySelector('#modalBox .galgrid')) renderGallery();
}
function galStop(){ GAL_GEN.total -= GAL_GEN.q.length; GAL_GEN.q = []; toast('Queue cleared; the image in progress still finishes.'); galTray(); }
function galTray(html){
  let t = $('#galTray');
  if(!GAL_GEN.cur && !GAL_GEN.q.length){ if(t) t.remove(); GAL_GEN.done = 0; GAL_GEN.total = 0; return; }
  if(!t){ t = document.createElement('div'); t.id = 'galTray'; t.className = 'galtray'; t.innerHTML = '<div class="galtray-head"></div><div class="galtray-frame"></div>'; document.body.appendChild(t); }
  const c = GAL_GEN.cur, w = c && findW(c.wid);
  t.querySelector('.galtray-head').innerHTML = `<b>🎨 ${GAL_GEN.done + 1} / ${GAL_GEN.total}</b> <span class="muted">${w?esc(w.name.split(' ')[0])+': ':''}${c?esc(galSceneLabel(c.scene, w)):''}</span>
    <span class="row" style="margin:0">${GAL_GEN.q.length?`<button class="sm" onclick="galStop()">Stop queue</button>`:''}<button class="sm" onclick="galSkip()" title="Give up on this one and move on">Skip</button></span>`;
  if(html !== undefined) t.querySelector('.galtray-frame').innerHTML = html;
}
let GAL_TIMER = null;
function galSkip(){ if(GAL_GEN.cur){ GAL_GEN.cur.dead = true; galFinish(false); } }
function galFinish(ok){
  clearTimeout(GAL_TIMER);
  GAL_GEN.cur = null; GAL_GEN.done++;
  if(!$('#modal').classList.contains('hidden') && document.querySelector('#modalBox .galgrid')) renderGallery();
  galNext();
}
function galNext(){
  const j = GAL_GEN.q.shift();
  if(!j){ GAL_GEN.cur = null; galTray(); return; }
  const w0 = findW(j.wid), plug = getPlugin();
  if(!w0 || !plug){ GAL_GEN.done++; return galNext(); }
  ensureWorker(w0);
  const w = galLady(w0, j.outfit), key = imgKey(w, j.scene, j.cloth), prompt = buildPrompt(w, j.scene, j.cloth);
  if(!j.reroll && IMGKEYS.has(key)){ GAL_GEN.done++; return galNext(); }   // saved meanwhile
  w0.imgVar = w0.imgVar || {};
  if(j.reroll) w0.imgVar[key] = (w0.imgVar[key]||0) + 1;
  const seed = ((w0.seed||1) + (w0.imgVar[key]||0)*7919) % 2147483647;
  GAL_GEN.cur = j;
  const onFinish = async data => {
    if(GAL_GEN.cur !== j || j.dead) return; const url = extractUrl(data); if(!url) return;
    j.dead = true;
    // a picture in another outfit doesn't replace her avatar; one in her current outfit counts like any other
    const ok = await saveImage(key, url, j.outfit && j.outfit!==outfitKey(w0, j.scene) ? null : w0, j.scene);
    if(ok) toast(`Saved: ${w0.name.split(' ')[0]} · ${galSceneLabel(j.scene, w)}`);
    galFinish(ok);
  };
  try{
    const r = plug({prompt, negativePrompt:SET.negative, seed, resolution:SET.resolution, onFinish});
    galTray((r && typeof r==='object' && 'evaluateItem' in r) ? r.evaluateItem : String(r));
  }catch(e){ toast('Image plugin error: ' + e.message); GAL_GEN.cur = null; GAL_GEN.done++; return galNext(); }
  GAL_TIMER = setTimeout(() => { if(GAL_GEN.cur===j){ j.dead = true; toast('An image took too long; moving on.'); galFinish(false); } }, 5*60*1000);
  if(S) save();
}
