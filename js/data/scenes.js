'use strict';
/* =====================================================================
   DATA: scenes
   ===================================================================== */
const SCENE_DATA = needData('scenes');
// Dates (data/dates.json); each brings its own image scene, date_<key>.
const DATES = noMeta(needData('dates'));
const SCENES = Object.assign({}, SCENE_DATA.scenes);
Object.entries(DATES).forEach(([k,d])=>{ if(d.image) SCENES['date_'+k] = Object.assign({label:'Date: '+d.label, sam:true}, d.image||{}); });
// nude spicy variants with their own image (date_<key>_sp<i>), registered up front so they survive a reload
Object.entries(DATES).forEach(([k,d])=>(d.spicy||[]).forEach((sp,i)=>{ if(!sp.nude || !sp.image || !sp.image.comp) return; const di = d.image || {}, im = {label:d.label+': '+sp.label, comp:sp.image.comp, setting:sp.image.setting || di.setting, sam:true}; ['undress','bath','away','swim'].forEach(f=>{ if(di[f] != null) im[f] = di[f]; }); SCENES['date_'+k+'_sp'+i] = im; }));
// One-off image scenes for story moments (arc beats, events, firsts): {comp, setting} plus the usual flags (sam, pov,
// house, towel). Registered under a stable key so the picture is saved per moment; they don't show in the sheet's picker.
function dynScene(key, img){ if(!img || !img.comp) return null; SCENES[key] = Object.assign({label:'Story: '+(img.label||key)}, img); return key; }
// One list, sorted by tier then th; custom services merge in by their tier. (Cached; rebuilt when customActs changes.)
function actTierOf(a){ return a.tier || (a.th < 30 ? 1 : a.th < 50 ? 2 : 3); }
function getActs(){
  const ca = SET.customActs || [];
  if(getActs.ref !== ca || getActs.n !== ca.length){
    getActs.ref = ca; getActs.n = ca.length;
    getActs.list = ACTS.concat(ca).sort((a,b)=>(actTierOf(a)-actTierOf(b)) || (a.th-b.th));
  }
  return getActs.list;
}
const actById = id => { id = actKey(id); return getActs().find(a=>a.id===id); };
const actLabel = id => { const a = actById(id); return a ? a.label : id; };
// pose wording for a service in a context (client / sam / duo), picked from the service's variants (services.json → image)
function actPose(id, ctx){
  const a = actById(id) || {}, I = a.image || {}, list = [].concat(I[ctx] || I.client || a.comp || 'intimate moment').filter(x=>x && !isTodo(x));
  return pick(list.length ? list : ['intimate moment']);
}
// a Sam scene started on a date ('samact:<act>~~date_<key>') happens where the date was
// ctx is 'date_<key>' or 'date_<key>.<i>' (i = spicy variant index; its image can add to or replace the pose, and move the setting)
function dateCtx(ctx){ const m = /^date_([^.]+)(?:\.(\d+))?$/.exec(ctx||''); if(!m || !DATES[m[1]]) return null; const d = DATES[m[1]], sp = m[2] != null ? (d.spicy||[])[+m[2]] : null; return {d, sp: sp && sp.image ? sp : null}; }
const dateSetting = ctx => { const c = dateCtx(ctx); return (c && ((c.sp && c.sp.image.setting) || (c.d.image && c.d.image.setting))) || SCENE_DATA.samRoom; };
function svcExpr(w, id, P, withSam){
  const e = (P && P.expr) || (w && typeof exprFor==='function' ? exprFor(w, id, id ? (withSam ? samStance(w,id)==='ask' : clientStance(w,id)==='ask') : false) : '');
  return exprText(e, id);
}
function sceneInfo(k, w){
  const h = w && S ? houseOf(w) : null, HD = h ? HOUSES[h.id] : null, P = sceneParts(k); k = P.base;
  if(k.startsWith('act:')){ const id = k.slice(4); return {label:'Client: '+actLabel(id), comp:actPose(id,'client'), setting:P.ctx==='sample' ? (SCENE_DATA.sampleStreet || 'a lantern-lit street outside the house at night, a quiet doorway alcove') + (HD ? ', ' + HD.setting : '') : ROOM_SETTING(h), client:SCENE_DATA.clientPhrase, snip:'act_'+id, expr:svcExpr(w, id, P, false)}; }
  if(k.startsWith('duo:')){ const [, id, oid, dyn] = k.split(':'), a = actById(id), o = findAny(oid);
    const D = dyn && typeof BONDS!=='undefined' ? (BONDS.dynamics[dyn]||{}) : {};
    return {label:'Sam & two: '+actLabel(id), pov:true, sam:true, comp:[actPose(id,'duo'), SCENE_DATA.duoPhrase, D.prompt].filter(Boolean).join(', '),
      setting:SCENE_DATA.samRoom, snip:'act_'+id, snip2:'duo', expr:svcExpr(w, id, P, true),
      client: o ? (()=>{ const oc = defaultCloth(o, 'samact:'+id); return `the second woman: ${charDesc(o, oc, 'samact:'+id)}, ${clothText(o, oc, 'samact:'+id).replace(/\{pubic\}/g, pubicText(o, 'samact:'+id))}`; })() : ''}; }
  // two women together (the goddess with a lady): pair:<service>:<fem|futa>:<other id>; poses from services.json image.fem / image.futa
  if(k.startsWith('pair:')){ const [, id, mode, oid] = k.split(':'), o = findAny(oid);
    return {label:'Two women: '+actLabel(id), comp:actPose(id, mode==='futa' ? 'futa' : 'fem'), setting:ROOM_SETTING(h), snip:'act_'+id, expr:svcExpr(w, id, P, true),
      client: o ? (()=>{ const oc = defaultCloth(o, k); return `the other woman: ${charDesc(o, oc, k)}, ${clothText(o, oc, k).replace(/\{pubic\}/g, pubicText(o, k))}`; })() : ''}; }
  // Sam's demonstration class: seen from the room, Sam is the man, the other ladies watch (scenes.json → demoRoom / people.demo)
  // group nights (sam.js samOrgy): the first lady in full, the others briefly (scenes.json → orgyPose / orgyRoom / people.orgy)
  if(k.startsWith('orgy:')){ const os = k.slice(5).split(',').map(findAny).filter(o=>o && w && o.id!==w.id);
    const short = o => { const d = effDesign(o, k); return `${raceLook(o, k)}, ${[d.hairStyle, d.hairColor].filter(Boolean).join(' ')} hair, ${bodyDesc(o, k)}, ${clothText(o, defaultCloth(o, k), k).replace(/\{pubic\}/g, pubicText(o, k))}`; };
    return {label:'A night together', pov:true, sam:true, comp:pick([].concat(SCENE_DATA.orgyPose || ['the women crowded around the viewer on the bed, pov'])), setting:SCENE_DATA.orgyRoom || SCENE_DATA.samRoom, expr:svcExpr(w, null, P, true),
      client: os.length ? 'the other women: ' + os.map(short).join('; ') : ''}; }
  if(k.startsWith('demo:')){ const id = k.slice(5); return {label:'Demonstration: '+actLabel(id), sam:true, comp:actPose(id,'demo'), client:'the man is ' + SAM_LOOK, setting:SCENE_DATA.demoRoom || 'a candlelit parlor, other women watching', snip:'act_'+id, expr:svcExpr(w, id, P, true)}; }
  if(k.startsWith('samact:')){ const id = k.slice(7), a=actById(id); return {label:'Sam: '+actLabel(id), pov:true, sam:true, comp:(()=>{ const c = dateCtx(P.ctx), pose = actPose(id,'sam'), si = c && c.sp && c.sp.image; return si && si.comp ? (si.replace ? si.comp : pose + ', ' + si.comp) : pose; })(), setting:(typeof gTeaseSetting==='function' && gTeaseSetting(P.ctx)) || dateSetting(P.ctx), snip:'act_'+id, expr:svcExpr(w, id, P, true)}; }
  const sc = Object.assign({}, SCENES[k] || SCENES.portrait);
  // bath scenes at home happen in the house's bathhouse when it has one (scenes.json → bathhouse); "away" keeps its own place
  if((sc.bath || sc.towel) && !sc.away && h && h.up && h.up.bath){ sc.setting = SCENE_DATA.bathhouse || sc.setting; sc.house = true; }
  if(sc.house && HD) sc.setting = sc.setting + ', ' + HD.setting;
  return sc;
}
function ROOM_SETTING(h){
  const t = h ? h.tier : 0;
  const R = SCENE_DATA.rooms; return R[Math.min(t, R.length-1)] + (h ? ', ' + HOUSES[h.id].setting : '');
}
