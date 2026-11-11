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
function sceneInfo(k, w){
  const h = w && S ? houseOf(w) : null, HD = h ? HOUSES[h.id] : null, P = sceneParts(k); k = P.base;
  if(k.startsWith('act:')){ return {label:'Client: '+actLabel(k.slice(4)), comp:actPose(k.slice(4),'client'), setting:P.ctx==='sample' ? (SCENE_DATA.sampleStreet || 'a lantern-lit street outside the house at night, a quiet doorway alcove') + (HD ? ', ' + HD.setting : '') : ROOM_SETTING(h), client:SCENE_DATA.clientPhrase, snip:'act_'+k.slice(4), expr:exprText(P.expr, k.slice(4))}; }
  if(k.startsWith('duo:')){ const [, id, oid, dyn] = k.split(':'), a = actById(id), o = findAny(oid);
    const D = dyn && typeof BONDS!=='undefined' ? (BONDS.dynamics[dyn]||{}) : {};
    return {label:'Sam & two: '+actLabel(id), pov:true, sam:true, comp:[actPose(id,'duo'), SCENE_DATA.duoPhrase, D.prompt].filter(Boolean).join(', '),
      setting:SCENE_DATA.samRoom, snip:'act_'+id, snip2:'duo',
      client: o ? `the second woman: ${charDesc(o)}, ${clothText(o, defaultCloth(o, 'samact:'+id), 'samact:'+id)}` : ''}; }
  if(k.startsWith('samact:')){ const a=actById(k.slice(7)); return {label:'Sam: '+actLabel(k.slice(7)), pov:true, sam:true, comp:(()=>{ const c = dateCtx(P.ctx), pose = actPose(k.slice(7),'sam'), si = c && c.sp && c.sp.image; return si && si.comp ? (si.replace ? si.comp : pose + ', ' + si.comp) : pose; })(), setting:dateSetting(P.ctx), snip:'act_'+k.slice(7)}; }
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
