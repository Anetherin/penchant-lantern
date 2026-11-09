'use strict';
/* ---------- Creator ---------- */
function editWorker(id){ const w=findW(id); if(!w) return; EDIT={id}; CDRAFT=clone(w); closeModal(); TAB='creator'; render(); }
function cancelEdit(){ EDIT=null; CDRAFT=null; render(); }
function dl(id, arr){ return `<datalist id="${id}">${arr.map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`; }
function viewCreator(){
  if(!CDRAFT) CDRAFT = genWorker({race:'human'});
  const d = ensureWorker(CDRAFT), D = d.design || {};
  const f = (id,label,val,list) => `<label>${label}<input id="${id}" value="${esc(val)}" ${list?`list="${list}"`:''}></label>`;
  const num = (id,label,val,max=100) => `<label>${label}<input id="${id}" type="number" min="0" ${max?`max="${max}"`:''} value="${Math.round(val||0)}"></label>`;
  const actSel = (id,label,val) => `<label>${label}<select id="${id}"><option value="">None</option>${getActs().map(a=>`<option value="${a.id}" ${a.id===val?'selected':''}>${esc(a.label)}</option>`).join('')}</select></label>`;
  const colSel = (id,label,val) => `<label>${label}<select id="${id}">${COLOR_KEYS.map(c=>`<option ${c===val?'selected':''}>${c}</option>`).join('')}</select></label>`;
  const outOpts = Object.entries(WARDROBE).filter(([k,o])=>!o.owner || o.owner===d.key).map(([k,o])=>`<option value="${k}" ${k===d.outfit?'selected':''}>${esc(o.label)}</option>`).join('') + `<option value="custom" ${d.outfit==='custom'?'selected':''}>Custom text →</option>`;
  const unOpts = Object.entries(UNDER).map(([k,u])=>`<option value="${k}" ${k===d.under?'selected':''}>${esc(u.label)}</option>`).join('') + `<option value="custom" ${d.under==='custom'?'selected':''}>Custom text →</option>`;
  return `<section class="card"><h2>${EDIT?'Edit Character':'Character Creator'}</h2>
    <p class="muted">Make any character: recruitable, named, or a library template. All characters are adults; ages below a race's minimum are raised automatically.</p>
    <div class="form">
      ${f('c_name','Name',d.name)}
      <label>Race<select id="c_race" onchange="$('#c_subw').style.display=this.value==='beastkin'?'':'none'">${Object.entries(RACES).map(([k,r])=>`<option value="${k}" ${k===d.race?'selected':''}>${r.label}</option>`).join('')}</select></label>
      <label id="c_subw" style="${d.race==='beastkin'?'':'display:none'}">Beast type<input id="c_sub" value="${esc(d.sub||'fox')}" list="dl_sub"></label>
      ${num('c_age','Age',d.age,0)}
      ${f('c_build','Build',D.build,'dl_build')}${f('c_hairStyle','Hair style',D.hairStyle,'dl_hs')}${f('c_hairColor','Hair color',D.hairColor,'dl_hc')}
      ${f('c_eyes','Eyes',D.eyes,'dl_eyes')}${f('c_skin','Skin',D.skin,'dl_skin')}${f('c_features','Distinctive features',D.features,'dl_feat')}
      ${f('c_pers','Personality',d.personality,'dl_pers')}
      <label>Clothing style<select id="c_style">${STYLES.map(s=>`<option ${s===d.style?'selected':''}>${s}</option>`).join('')}</select></label>
      ${colSel('c_fcol','Favorite color',d.favColor)}
    </div>
    <h3 style="margin-top:10px">Clothes</h3><div class="form">
      <label>Outfit<select id="c_out">${outOpts}</select></label>${f('c_outc','Custom outfit text',d.customOutfit||'')}${colSel('c_ocol','Outfit color',d.outColor||'black')}
      <label>Undergarments<select id="c_un">${unOpts}</select></label>${f('c_unc','Custom undergarment text',d.customUnder||'')}${colSel('c_ucol','Undergarment color',d.underColor||'white')}
    </div>
    <label class="muted" style="display:block;margin-top:8px">Backstory<textarea id="c_back">${esc(d.backstory)}</textarea></label>
    <div style="margin-top:8px"><b>Traits</b><br>${Object.keys(TRAITS).filter(t=>!TRAITS[t].story).map(t=>`<label class="chk"><input type="checkbox" class="c_trait" value="${esc(t)}" ${(d.traits||[]).includes(t)?'checked':''}>${esc(t)}</label>`).join('')}</div>
    <h3 style="margin-top:10px">Body</h3><div class="form">${BODY_KEYS.map(k=>`<label>${cap(k)}<select id="c_b_${k}">${Object.entries(bodyOpts(k)).map(([id,o])=>`<option value="${id}" ${bodyOf(d)[k]===id?'selected':''}>${esc(o.label)}</option>`).join('')}</select></label>`).join('')}</div>
    <h3 style="margin-top:10px">Stats</h3><div class="form">${STAT_KEYS.map(k=>num('c_s_'+k,cap(k)+' /1000',d.stats[k],1000)).join('')}</div>
    <h3>Skills</h3><div class="form">${TECH_KEYS.map(k=>num('c_t_'+k,TECH_LABEL[k]+' /1000',d.tech[k],1000)).join('')}
      ${num('c_pop','Popularity',d.popularity)}${num('c_lewd','Lewdness',d.lewd)}${num('c_trust','Trust (0-1000)',tShow(d.trust),1000)}</div>
    <h3>Service preferences</h3><div class="form">${actSel('c_fav','Favorite',d.fav)}${actSel('c_dis','Dislikes',d.dislike)}${actSel('c_lov','Lovers only',d.lovers)}</div>
    <div class="form" style="margin-top:6px">${getActs().map(a=>num('c_a_'+a.id,a.label+' skill /1000',actSkill(d,a.id),1000)).join('')}</div>
    <label class="chk" style="margin-top:8px"><input type="checkbox" id="c_named" ${d.named?'checked':''}> Named character (★, stays in the candidate pool until hired)</label>
    <div class="row" style="margin-top:10px"><button onclick="creatorRandom()">🎲 Randomize</button><button onclick="creatorPreview()">🎨 Preview portrait</button>
      ${EDIT?`<button class="primary" onclick="creatorSaveEdit()">Save changes</button><button onclick="cancelEdit()">Cancel</button>`:`<button class="primary" onclick="creatorAdd('roster')">Add to roster</button><button onclick="creatorAdd('pool')">Add to candidates</button><button onclick="creatorAdd('lib')">Save to library</button>`}</div>
    <div id="c_img" style="max-width:360px"></div>
    ${dl('dl_sub',subNames('beastkin'))}${dl('dl_build',BUILDS)}${dl('dl_hs',HAIR_STYLES)}${dl('dl_hc',HAIR_COLORS)}${dl('dl_eyes',EYES)}${dl('dl_skin',SKINS.concat(DEMON_SKINS))}${dl('dl_feat',FEATURES)}${dl('dl_pers',PERSONALITIES)}
  </section>
  <section class="card"><h2>Library (${LIB.length})</h2><p class="muted">Saved characters, shared across save files. ${SET.libraryInPool?'They sometimes show up as candidates.':''}</p>
    ${LIB.map((w,i)=>`<div class="row"><b>${esc(w.name)}</b> <span class="muted">${raceLabel(w)}</span>
      <button class="sm" onclick="libTo(${i},'pool')">To candidates</button><button class="sm" onclick="libTo(${i},'roster')">To roster</button><button class="sm" onclick="libLoad(${i})">Load into creator</button><button class="sm" onclick="libDel(${i})">Delete</button></div>`).join('') || '<span class="muted">Empty.</span>'}</section>`;
}
function readCreator(){
  const g = id => { const e=$('#'+id); return e ? e.value : ''; };
  const race = RACES[g('c_race')] ? g('c_race') : 'human', R = RACES[race];
  const w = CDRAFT ? clone(CDRAFT) : genWorker({race});
  w.race = race; w.sub = race==='beastkin' ? (cleanText(g('c_sub'))||'fox') : '';
  w.age = Math.max(R.age[0], parseInt(g('c_age'))||R.age[0]);
  w.name = cleanText(g('c_name')) || genName(race, w.sub);
  w.design = {build:cleanText(g('c_build')), hairStyle:cleanText(g('c_hairStyle')), hairColor:cleanText(g('c_hairColor')), eyes:cleanText(g('c_eyes')), skin:cleanText(g('c_skin')), features:cleanText(g('c_features'))};
  w.personality = cleanText(g('c_pers')) || pick(PERSONALITIES);
  w.backstory = cleanText(g('c_back'));
  w.style = g('c_style') || w.style; w.favColor = g('c_fcol') || w.favColor;
  w.outfit = g('c_out') || w.outfit; w.customOutfit = cleanText(g('c_outc')); w.outColor = g('c_ocol') || w.outColor;
  if(w.outfit==='custom' && !w.customOutfit) w.customOutfit = 'an elegant dress';
  if(w.outfit!=='custom' && !w.owned.includes(w.outfit)) w.owned.push(w.outfit);
  w.under = g('c_un') || w.under; w.customUnder = cleanText(g('c_unc')); w.underColor = g('c_ucol') || w.underColor;
  if(w.under==='custom' && !w.customUnder) w.customUnder = 'simple lace underwear';
  if(w.under!=='custom' && !w.ownedUnder.includes(w.under)) w.ownedUnder.push(w.under);
  w._mr = 1; w.traits = [...document.querySelectorAll('.c_trait:checked')].map(x=>x.value).concat((w.traits||[]).filter(t=>TRAITS[t]&&TRAITS[t].story));
  STAT_KEYS.forEach(k=>w.stats[k]=clampK(parseInt(g('c_s_'+k))||0));
  TECH_KEYS.forEach(k=>w.tech[k]=clampK(parseInt(g('c_t_'+k))||0));
  w.body = Object.assign({}, bodyOf(w), Object.fromEntries(BODY_KEYS.map(k=>[k, g('c_b_'+k) || bodyOf(w)[k]])));
  w.popularity = clamp(parseInt(g('c_pop'))||0); w.lewd = clamp(parseInt(g('c_lewd'))||0); w.trust = clamp((parseInt(g('c_trust'))||0)/TRUST_SHOW);
  w.fav = g('c_fav')||null; w.dislike = g('c_dis')||null; w.lovers = g('c_lov')||null;
  if(w.dislike && w.dislike===w.fav) w.dislike = null;
  ensureWorker(w);
  getActs().forEach(a=>{ const v=parseInt(g('c_a_'+a.id)); if(!isNaN(v)) w.acts[a.id].skill = clampK(v); });
  w.named = !!($('#c_named')&&$('#c_named').checked); w.keep = w.named;
  return w;
}
function creatorRandom(){ CDRAFT = genWorker(); render(); }
function creatorPreview(){ const id = CDRAFT ? CDRAFT.id : null; CDRAFT = readCreator(); if(id) CDRAFT.id = id; render(); const real = CDRAFT.id; CDRAFT.id='draft'; showImg('c_img','draft','portrait','dressed','auto').then(()=>{ if(CDRAFT) CDRAFT.id = real; }); }
function finalize(w){ w.id=uid(); w.wage=wageFor(w); w.energy=maxEnergy(w); w.mood=60; w.health=100; w.contract=12; w.job='rest'; w.seen={}; w.unhappy=0; w.privateCount=0; w.menu=[]; w.house=curH().id; delete w.key; delete w.isPartner; return w; }
function creatorAdd(dest){
  const w = finalize(readCreator());
  if(dest==='roster'){ const rb = raceBlock(w, curH()); if(rb) return toast(rb); S.workers.push(w); checkUnlocks(true); note(`${w.name} added to ${curH().name}.`); }
  else if(dest==='pool'){ w.signing = signingFor(w); w.keep = true; S.candidates.push(w); note(`${w.name} added to candidates.`); }
  else { LIB.push(w); saveLib(); note(`${w.name} saved to the library.`); }
  CDRAFT = null; save(); render();
}
function creatorSaveEdit(){
  const t = findW(EDIT.id); if(!t){ cancelEdit(); return; }
  const w = readCreator();
  ['name','race','sub','age','design','personality','backstory','traits','stats','tech','body','popularity','lewd','trust','named','style','fav','dislike','lovers','acts','favColor','outfit','customOutfit','outColor','under','customUnder','underColor','owned','ownedUnder'].forEach(k=>t[k]=clone(w[k]===undefined?null:w[k]));
  t.energy = Math.min(t.energy, maxEnergy(t)); t.menu = t.menu.filter(a=>canClient(t,a));
  EDIT = null; CDRAFT = null; checkUnlocks(); save(); note(`${t.name} updated. (Saved images keep their old look; regenerate them to update.)`); TAB='roster'; render();
}
function libTo(i, dest){ const w = finalize(ensureWorker(clone(LIB[i]))); if(dest==='roster'){ const rb = raceBlock(w, curH()); if(rb) return toast(rb); S.workers.push(w); checkUnlocks(true); } else { w.signing=signingFor(w); w.keep=true; S.candidates.push(w); } note(`${w.name} added to ${dest==='roster'?curH().name:'candidates'}.`); save(); render(); }
function libLoad(i){ EDIT=null; CDRAFT = ensureWorker(clone(LIB[i])); render(); }
function libDel(i){ if(!confirm(`Delete ${LIB[i].name} from the library?`)) return; LIB.splice(i,1); saveLib(); render(); }
