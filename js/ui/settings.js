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
  <section class="card"><h2>Scene Snippets</h2><p class="muted">Your own text, appended to the prompt for that scene. Empty slots use the default prompt only. Saved in this browser, separate from your save file.</p>
    ${getActs().map(a=>`<label class="muted" style="display:block;margin:6px 0">Service: ${esc(a.label)} <code>act_${a.id}</code><textarea id="snip_act_${a.id}">${esc(SET.snippets['act_'+a.id]||'')}</textarea></label>`).join('')}
    <label class="muted" style="display:block;margin:6px 0">All POV scenes with Sam <code>pov</code><textarea id="snip_pov">${esc(SET.snippets.pov||'')}</textarea></label>
    <label class="muted" style="display:block;margin:6px 0">Bath <code>bath</code><textarea id="snip_bath">${esc(SET.snippets.bath||'')}</textarea></label>
    <label class="muted" style="display:block;margin:6px 0">Story mishaps (shower / walk-in) <code>mishap</code><textarea id="snip_mishap">${esc(SET.snippets.mishap||'')}</textarea></label>
    <h3>Clothing states</h3><p class="muted"><code>{outfit}</code> and <code>{underwear}</code> are replaced with what she's wearing (commando becomes "bare skin, nothing underneath"). "Undressed" falls back to "Partly undressed" while empty.</p>
    ${CLOTH.map(c=>`<label class="muted" style="display:block;margin:6px 0">${c.label} <span class="muted">(lewd ${c.lv}+)</span><textarea id="cloth_${c.id}">${esc(T[c.id]||'')}</textarea></label>`).join('')}
    <div class="row"><button class="primary" onclick="saveSnippetsUI()">Save snippets</button><button onclick="exportBox('snippets')">Export snippets</button><button onclick="importBox('snippets')">Import snippets</button></div></section>
  <section class="card"><h2>Services</h2><p class="muted">Built-in categories are set in the code (ACTS). Add your own here; everyone gets a random skill and comfort level for them.</p>
    ${(SET.customActs||[]).map((a,i)=>`<div class="row"><b>${esc(a.label)}</b> <span class="muted">needs ${a.th} · ${fmt(a.price)}</span><button class="sm" onclick="delAct(${i})">Remove</button></div>`).join('')}
    <div class="row"><input id="na_label" placeholder="Label"><input id="na_th" type="number" placeholder="Lewdness line (e.g. 65)"><input id="na_price" type="number" placeholder="Price (e.g. 130)"><button onclick="addAct()">Add category</button></div></section>
  <section class="card"><h2>AI Text</h2><p class="muted">Optional. Uses Perchance's text plugin to write scenes for reports, private time and training, and backstories for generic characters. Only backstories are kept; scenes are written on the spot. Image prompts stay programmatic. Plugin: ${getTextPlugin()?'<span class="good">connected</span>':'<span class="warn">not connected (add <code>ai = {import:ai-text-plugin}</code> to the lists panel)</span>'}</p>
    <div class="row"><label class="chk"><input type="checkbox" id="ai_on" ${SET.ai.on?'checked':''}> Enable AI text buttons (✨)</label>
      <label class="chk"><input type="checkbox" id="ai_auto" ${SET.ai.auto?'checked':''}> Write scenes automatically (private time, training, encounters, date invitations)</label>
      <label class="chk"><input type="checkbox" id="ai_bs" ${SET.ai.autoBackstory!==false?'checked':''}> Write backstories for generic characters automatically</label></div>
    <label class="muted" style="display:block;margin:6px 0">Style guidance <span class="muted">(inserted as {guidance}: tone, length, how descriptive, etc.)</span><textarea id="ai_guid">${esc(SET.ai.guidance||'')}</textarea></label>
    ${Object.keys(DEFAULT_AI_TPL).map(k=>`<label class="muted" style="display:block;margin:6px 0">Template: <b>${k}</b> <button class="sm" onclick="$('#ai_t_${k}').value=DEFAULT_AI_TPL['${k}']">Reset</button><textarea id="ai_t_${k}" style="min-height:90px">${esc(aiTpl(k))}</textarea></label>`).join('')}
    <p class="muted">Placeholders: {name} {race} {age} {appearance} {clothing} {outfit} {personality} {traits} {trust} {lewd} {mood} {service} {stance} {client} {setting} {house} {relationship} {guidance} {hook} {backstory} {date} {situation} {lust}</p>
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
function saveAiUI(){
  SET.ai.on = $('#ai_on').checked; SET.ai.auto = $('#ai_auto').checked; SET.ai.autoBackstory = $('#ai_bs').checked; SET.ai.guidance = $('#ai_guid').value;
  Object.keys(DEFAULT_AI_TPL).forEach(k=>{ const v = $('#ai_t_'+k).value; SET.ai.tpl[k] = (v.trim()===DEFAULT_AI_TPL[k]) ? '' : v; });
  saveSettings(); toast('AI settings saved.'); render();
}
function saveSnippetsUI(){
  getActs().forEach(a=>{ const e=$('#snip_act_'+a.id); if(e) SET.snippets['act_'+a.id]=e.value; });
  ['pov','bath','mishap'].forEach(k=>{ const e=$('#snip_'+k); if(e) SET.snippets[k]=e.value; });
  CLOTH.forEach(c=>{ const e=$('#cloth_'+c.id); if(e) SET.clothText[c.id] = e.value===DEFAULT_CLOTH_TEXT[c.id] ? '' : e.value; });
  saveSettings(); toast('Snippets saved.');
}
function addAct(){
  const label = cleanText($('#na_label').value), th = clamp(parseInt($('#na_th').value)||60), price = Math.max(10, parseInt($('#na_price').value)||100);
  if(!label) return toast('Give it a label.');
  const id = 'c' + hashStr(label + Date.now()).toString(36);
  SET.customActs.push({id, label, th, price, energy:11, comp:'intimate moment'}); saveSettings();
  S.workers.concat(S.candidates).forEach(ensureWorker); save(); toast(`${label} added.`); render();
}
function delAct(i){ if(!confirm('Remove this category?')) return; const a = SET.customActs.splice(i,1)[0]; saveSettings(); S.workers.forEach(w=>{ w.menu=w.menu.filter(x=>x!==a.id); }); save(); render(); }
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
