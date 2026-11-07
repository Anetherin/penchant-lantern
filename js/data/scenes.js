'use strict';
/* =====================================================================
   DATA: scenes
   ===================================================================== */
const SCENE_DATA = needData('scenes');
// Dates (data/dates.json); each brings its own image scene, date_<key>.
const DATES = noMeta(needData('dates'));
const SCENES = Object.assign({}, SCENE_DATA.scenes);
Object.entries(DATES).forEach(([k,d])=>{ SCENES['date_'+k] = Object.assign({label:'Date: '+d.label, sam:true}, d.image||{}); });
SCENES.job_companion = SCENES.companion;
function getActs(){ return ACTS.concat(SET.customActs||[]); }
const actById = id => getActs().find(a=>a.id===id);
const actLabel = id => { const a = actById(id); return a ? a.label : id; };
// pose wording for a service in a context (client / sam / duo), picked from the service's variants (services.json → image)
function actPose(id, ctx){
  const a = actById(id) || {}, I = a.image || {}, list = [].concat(I[ctx] || I.client || a.comp || 'intimate moment').filter(Boolean);
  return pick(list.length ? list : ['intimate moment']);
}
function sceneInfo(k, w){
  const h = w && S ? houseOf(w) : null, HD = h ? HOUSES[h.id] : null;
  if(k.startsWith('act:')){ const a=actById(k.slice(4)); return {label:'Client: '+actLabel(k.slice(4)), comp:actPose(k.slice(4),'client'), setting:ROOM_SETTING(h), client:SCENE_DATA.clientPhrase, snip:'act_'+k.slice(4)}; }
  if(k.startsWith('duo:')){ const [, id, oid, dyn] = k.split(':'), a = actById(id), o = findAny(oid);
    const D = dyn && typeof BONDS!=='undefined' ? (BONDS.dynamics[dyn]||{}) : {};
    return {label:'Sam & two: '+actLabel(id), pov:true, sam:true, comp:[actPose(id,'duo'), SCENE_DATA.duoPhrase, D.prompt].filter(Boolean).join(', '),
      setting:SCENE_DATA.samRoom, snip:'act_'+id, snip2:'duo',
      client: o ? `the second woman: ${charDesc(o)}, ${clothText(o, defaultCloth(o, 'samact:'+id), 'samact:'+id)}` : ''}; }
  if(k.startsWith('samact:')){ const a=actById(k.slice(7)); return {label:'Sam: '+actLabel(k.slice(7)), pov:true, sam:true, comp:actPose(k.slice(7),'sam'), setting:SCENE_DATA.samRoom, snip:'act_'+k.slice(7)}; }
  const sc = Object.assign({}, SCENES[k] || SCENES.portrait);
  if(sc.house && HD) sc.setting = sc.setting + ', ' + HD.setting;
  return sc;
}
function ROOM_SETTING(h){
  const t = h ? h.tier : 0;
  const R = SCENE_DATA.rooms; return R[Math.min(t, R.length-1)] + (h ? ', ' + HOUSES[h.id].setting : '');
}
