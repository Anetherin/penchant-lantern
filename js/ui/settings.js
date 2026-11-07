'use strict';
/* ---------- Settings ---------- */
function viewSettings(){
  const T = Object.assign({}, DEFAULT_CLOTH_TEXT, SET.clothText);
  return `<section class="card"><h2>Image Settings</h2>
    <label class="muted">Style tags<textarea id="s_style">${esc(SET.style)}</textarea></label>
    <label class="muted">Negative prompt<textarea id="s_neg">${esc(SET.negative)}</textarea></label>
    <div class="row">Resolution <select id="s_res">${['512x512','512x768','768x512'].map(r=>`<option ${r===SET.resolution?'selected':''}>${r}</option>`).join('')}</select>
      <label class="chk"><input type="checkbox" id="s_auto" ${SET.autoPortrait?'checked':''}> Auto-generate a portrait when someone has none saved</label>
      <label class="chk"><input type="checkbox" id="s_lib" ${SET.libraryInPool?'checked':''}> Library characters appear as candidates</label></div>
    <div class="row"><button class="primary" onclick="saveSettingsUI()">Save settings</button><span class="muted">Image plugin: ${getPlugin()?'<span class="good">connected</span>':'<span class="warn">not connected</span>'} · Image storage: ${DB?'<span class="good">ready</span>':'<span class="warn">unavailable</span>'}</span></div></section>
  ${Object.keys(GUEST_PACKS).length ? `<section class="card"><h2>Visiting characters</h2><p class="muted">Crossover guests from <code>data/guests.json</code> pass through as candidates now and then. Switch off any packs you don't want.</p>
    <div class="row">${Object.entries(GUEST_PACKS).map(([k,P])=>`<label class="chk"><input type="checkbox" class="s_pack" data-pack="${esc(k)}" ${(SET.packsOff||{})[k]?'':'checked'}> ${esc(P.label||k)} <span class="muted">(${Object.keys(noMeta(P.characters)).length})</span></label>`).join('')}</div>
    <div class="row"><button class="primary" onclick="savePacksUI()">Save</button></div></section>` : ''}
  <section class="card"><h2>Text &amp; Data Files</h2><p class="muted">Scene snippets, clothing wording, services, personalities, AI prompts and flavor lines live in the repo's <code>data/</code> folder. Edit them on GitHub; changes show up a minute or two after you push (reload the page).</p>
    <ul class="muted" style="margin:6px 0 6px 18px">${(window.HOLLOWMERE_DATA||Object.keys(DATA)).map(n=>`<li><code>data/${n}.json</code> ${DATA[n]?'<span class="good">loaded</span>':'<span class="warn">missing</span>'}</li>`).join('')}</ul>
    ${browserEdits().n ? `<p><span class="warn">${browserEdits().n} older edit${browserEdits().n>1?'s':''} saved in this browser still override the files</span> (${browserEdits().what.join(', ')}). Export them merged into the file format, paste into the repo, then clear them here.</p>
    <div class="row"><button onclick="exportEdits()">Export browser edits as JSON</button><button onclick="clearEdits()">Clear browser edits</button></div>` : '<p class="muted">No browser overrides: the files are in charge.</p>'}</section>
  <section class="card"><h2>AI Text</h2><p class="muted">Optional. Uses Perchance's text plugin to write scenes for reports, private time and training, and backstories for generic characters. Only backstories are kept; scenes are written on the spot. Image prompts stay programmatic. Plugin: ${getTextPlugin()?'<span class="good">connected</span>':'<span class="warn">not connected (add <code>ai = {import:ai-text-plugin}</code> to the lists panel)</span>'}</p>
    <div class="row"><label class="chk"><input type="checkbox" id="ai_on" ${SET.ai.on?'checked':''}> Enable AI text buttons (✨)</label>
      <label class="chk"><input type="checkbox" id="ai_auto" ${SET.ai.auto?'checked':''}> Write scenes automatically (private time, training, encounters, date invitations)</label>
      <label class="chk"><input type="checkbox" id="ai_bs" ${SET.ai.autoBackstory!==false?'checked':''}> Write backstories for generic characters automatically</label></div>
    <p class="muted">Prompts and style guidance are in <code>data/ai-prompts.json</code>.</p>
    <div class="row"><button class="primary" onclick="saveAiUI()">Save AI settings</button></div></section>
  <section class="card"><h2>Images</h2><p class="muted">Generated and uploaded images live in this browser. Export them to back up or move them to another browser.</p>
    <div class="row"><button onclick="exportImages()">⬇ Export images</button><button onclick="importImages()">⬆ Import images</button><button onclick="cleanImages()">Clean up unused images</button></div></section>
  <section class="card"><h2>Save File</h2><p class="muted">The game autosaves every week in this browser. Export to back up or move between browsers.</p>
    <div class="row"><button onclick="save();toast('Saved.')">Save now</button><button onclick="exportBox('save')">Export save</button><button onclick="importBox('save')">Import save</button><button onclick="exportBox('lib')">Export library</button><button onclick="importBox('lib')">Import library</button><button onclick="if(confirm('Start over? Your current save will be erased.'))restart()">New game</button></div></section>`;
}
function saveSettingsUI(){
  SET.style = $('#s_style').value; SET.negative = $('#s_neg').value; SET.resolution = $('#s_res').value;
  SET.autoPortrait = $('#s_auto').checked; SET.libraryInPool = $('#s_lib').checked; saveSettings(); toast('Settings saved.');
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
  const data = kind==='save' ? S : kind==='lib' ? LIB : {snippets:SET.snippets, clothText:SET.clothText, customActs:SET.customActs};
  modal(`<h2>Export ${kind}</h2><p class="muted">Copy this text and keep it somewhere safe.</p><textarea id="exp" style="min-height:200px">${esc(JSON.stringify(data))}</textarea>
    <div class="row"><button class="primary" onclick="try{navigator.clipboard.writeText($('#exp').value);toast('Copied.')}catch(e){toast('Select and copy manually.')}">Copy</button><button onclick="dlText($('#exp').value,'hollowmere-${kind}.json')">Download file</button></div>`);
}
function dlText(text, name){
  try{ const blob = new Blob([text],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); }
  catch(e){ toast('Download blocked here. Copy the text instead.'); }
}
function importBox(kind){ modal(`<h2>Import ${kind}</h2><textarea id="imp" style="min-height:200px" placeholder="Paste exported text here"></textarea><div class="row"><button class="primary" onclick="doImport('${kind}')">Import</button></div>`); }
function doImport(kind){
  let d; try{ d = JSON.parse($('#imp').value); }catch(e){ return toast('That text isn\'t valid.'); }
  if(kind==='save'){ if(!d || !Array.isArray(d.workers)) return toast('That doesn\'t look like a save.'); S = migrate(d); SETUP=null; save(); }
  else if(kind==='lib'){ if(!Array.isArray(d)) return toast('That doesn\'t look like a library.'); LIB = d; saveLib(); }
  else { if(typeof d!=='object' || Array.isArray(d)) return toast('That doesn\'t look like snippets.');
    if(d.snippets){ SET.snippets = d.snippets; SET.clothText = d.clothText||{}; SET.customActs = d.customActs||[]; } else SET.snippets = d; saveSettings(); }
  closeModal(); toast('Imported.'); render();
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
async function cleanImages(){
  const keep = new Set([...S.workers, ...S.candidates, ...LIB].map(w=>w.id).concat(Object.keys(NPCS)));
  const imgs = await idbAll('imgs'); let n=0;
  for(const k of Object.keys(imgs)){ const id=k.split('|')[0]; if(!keep.has(id) && !id.startsWith('n_')){ await imgDel(k); n++; } }
  const th = await idbAll('thumbs');
  for(const k of Object.keys(th)){ if(!keep.has(k) && !k.startsWith('n_')){ await idbReq('thumbs','readwrite',s=>s.delete(k)); delete THUMBS[k]; } }
  toast(`Removed ${n} unused images.`);
}
