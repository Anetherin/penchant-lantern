'use strict';
/* =====================================================================
   DATA: scenes
   ===================================================================== */
const SCENE_DATA = needData('scenes');
// Dates (data/dates.json); each brings its own image scene, date_<key>.
const DATES_RAW = needData('dates');
const DATES = noMeta(DATES_RAW);
const DOUBLE_DATES = DATES_RAW._double || {};
const SCENES = Object.assign({}, SCENE_DATA.scenes);
Object.entries(DATES).forEach(([k,d])=>{ if(d.image) SCENES['date_'+k] = Object.assign({label:'Date: '+d.label, sam:true}, d.image||{}); });
Object.entries(DOUBLE_DATES).forEach(([k,d])=>{ if(d.image) SCENES['ddate_'+k] = Object.assign({label:'Double date: '+d.label, sam:true}, d.image||{}); });
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
// with a woman client (clients.women): her name for it (services.json → femLabel), and who it was with; a futanari client keeps the label
const actLabelFor = (id, sex) => { const a = actById(id); if(!a || !sex || sex==='m') return actLabel(id); return sex==='futa' ? a.label + ' · futanari client' : (a.femLabel || a.label) + ' · woman client'; };
// Sam's side of a service (services.json → samLabel): his menus and summaries say who does what to whom.
const samActLabel = id => { const a = actById(id); return a ? (a.samLabel || a.label) : id; };
// pose wording for a service in a context (client / sam / duo), picked from the service's variants (services.json → image)
function actPose(id, ctx){
  const a = actById(id) || {}, I = a.image || {}, list = [].concat(I[ctx] || I.client || a.comp || 'intimate moment').filter(x=>x && !isTodo(x));
  return pick(list.length ? list : ['intimate moment']);
}
// a Sam scene started on a date ('samact:<act>~~date_<key>') happens where the date was
// ctx is 'date_<key>' or 'date_<key>.<i>' (i = spicy variant index; its image can add to or replace the pose, and move the setting)
function dateCtx(ctx){ const m = /^date_([^.]+)(?:\.(\d+))?$/.exec(ctx||''); if(!m || !DATES[m[1]]) return null; const d = DATES[m[1]], sp = m[2] != null ? (d.spicy||[])[+m[2]] : null; return {d, sp: sp && sp.image ? sp : null}; }
const dateSetting = ctx => { const c = dateCtx(ctx); return (c && ((c.sp && c.sp.image.setting) || (c.d.image && c.d.image.setting))) || SCENE_DATA.samRoom; };
function samCtxSetting(ctx, h){
  if(!ctx) return null;
  const HD = h ? HOUSES[h.id] : null, hs = HD ? ', ' + HD.setting : '';
  if(ctx==='bath') return (h && h.up && h.up.bath ? SCENE_DATA.bathhouse : SCENES.bath.setting) + hs;
  if(ctx==='storeroom') return (SCENES.enc_reckless && SCENES.enc_reckless.setting) || SCENE_DATA.samRoom;
  if(ctx==='exhib') return (SCENE_DATA.exhibSetting || 'semi-public alcove off the lounge') + hs;
  if(ctx==='chapel') return (SCENE_DATA.chapelSetting || 'candlelit chapel vestry') + hs;
  return null;
}
// noAct: leave out the service's own expression lines (snippets.json, written for scenes with a man), e.g. for two women together
function svcExpr(w, id, P, withSam, noAct){
  const e = (P && P.expr) || (w && typeof exprFor==='function' ? exprFor(w, id, id ? (withSam ? samStance(w,id)==='ask' : clientStance(w,id)==='ask') : false) : '');
  return exprText(e, noAct ? null : id);
}
function sceneInfo(k, w, cloth){
  const h = w && S ? houseOf(w) : null, HD = h ? HOUSES[h.id] : null, P = sceneParts(k); k = P.base;
  if(k.startsWith('act:')){
    const id = k.slice(4), bath = P.ctx==='bath';
    const setting = P.ctx==='sample' ? (SCENE_DATA.sampleStreet || 'a lantern-lit street outside the house at night, a quiet doorway alcove') + (HD ? ', ' + HD.setting : '')
      : bath ? (h && h.up && h.up.bath ? SCENE_DATA.bathhouse : SCENES.bath.setting) + (HD ? ', ' + HD.setting : '')
      : P.ctx==='exhib' ? (SCENE_DATA.exhibSetting || 'semi-public alcove off the lounge') + (HD ? ', ' + HD.setting : '')
      : P.ctx==='chapel' ? (SCENE_DATA.chapelSetting || 'candlelit chapel vestry') + (HD ? ', ' + HD.setting : '')
      : ROOM_SETTING(h);
    return {label:'Client: '+actLabel(id), comp:actPose(id,'client'), setting, client:SCENE_DATA.clientPhrase, snip:'act_'+id, expr:svcExpr(w, id, P, false), bath, towel:bath};
  }
  // Sam with two ladies: both labelled (the poses say "one ... the other"), the second as dressed as the first (cloth) at most
  if(k.startsWith('duo:')){ const [, id, oid, dyn] = k.split(':'), o = findAny(oid);
    const D = dyn && typeof BONDS!=='undefined' ? (BONDS.dynamics[dyn]||{}) : {}, pose = actPose(id,'duo'), sk = 'samact:'+id;
    const extra = /\b(two women|both|the other|ones?\b)/i.test(pose) ? '' : SCENE_DATA.duoPhrase;   // the pose already says there are two
    return {label:'Sam & two: '+actLabel(id), pov:true, sam:true, comp:[pose, extra, D.prompt].filter(Boolean).join(', '),
      setting:SCENE_DATA.samRoom, snip:'act_'+id, snip2:'duo', expr:svcExpr(w, id, P, true), selfTag:'the first woman',
      client: o ? (()=>{ const oc = cloth ? matchCloth(o, cloth, sk) : defaultCloth(o, sk); return personBlock('the second woman', [charDesc(o, oc, sk, {noAcc:true}), clothesFor(o, oc, sk)]); })() : ''}; }
  // two women together: pair:<service>:<fem|futa|selffuta>:<other id>; poses from services.json image.fem / image.futa.
  // fem = both women; futa = the other one is the futanari (the goddess with a lady); selffuta = she is (a spirit using a borrowed cock).
  // Futa poses are written with the service's {name} as "the woman" and {partner} as "the futanari". Each woman is labelled and the
  // futanari is described first, right after the head-count tags, so the model keeps track of who has the penis.
  // The service's own snippet is skipped when it names a man (missionary's "man on top"), which would pull one into the picture.
  if(k.startsWith('pair:')){ const [, id, mode, oid] = k.split(':'), o = findAny(oid), futa = mode==='futa' || mode==='selffuta';
    const ex = getSnippet('act_'+id), desc = (x, f) => { const c = cloth ? matchCloth(x, cloth, k) : defaultCloth(x, k); return [charDesc(x, c, k, {futa:f, noAcc:true}), clothesFor(x, c, k)]; };
    const base = {label:'Two women: '+actLabel(id), comp:actPose(id, futa ? 'futa' : 'fem'), setting:ROOM_SETTING(h), snip:/\bman\b/i.test(ex) ? null : 'act_'+id, expr:svcExpr(w, id, P, true, true)};
    if(!futa) return Object.assign(base, {selfTag:'the woman', client: o ? personBlock('the other woman', desc(o)) : ''});
    const F = SCENE_DATA.futaPhrase || 'erect penis';
    return mode==='selffuta' ? Object.assign(base, {selfTag:'the futanari', selfFuta:true, selfExtra:F, client: o ? personBlock('the woman', desc(o)) : ''})
      : Object.assign(base, {selfTag:'the woman', otherFirst:true, client: o ? personBlock('the futanari', [...desc(o, true), F]) : ''}); }
  // a woman client with her (clients.women): cpair:<service>:<fem|futa>, posed like two women together, the client from scenes.json → femClients,
  // dressed like the scene (scenes.json → femClientCloth)
  if(k.startsWith('cpair:')){ const [, id, mode] = k.split(':'), futa = mode==='futa', ex = getSnippet('act_'+id), look = pick([].concat(SCENE_DATA.femClients || ['a woman']));
    const cc = ((SCENE_DATA.femClientCloth||{})[cloth || 'dressed']) || '';
    const base = {label:(futa ? 'Futanari client: ' : 'Woman client: ') + actLabel(id), comp:actPose(id, futa ? 'futa' : 'fem'), setting:ROOM_SETTING(h), snip:futa && !/\bman\b/i.test(ex) ? 'act_'+id : null, expr:svcExpr(w, id, P, true, true)};   // two women: the fem pose replaces the service's own (penis) snippet
    if(!futa) return Object.assign(base, {selfTag:'the woman', client:personBlock('the other woman', [look, cc])});
    return Object.assign(base, {selfTag:'the woman', otherFirst:true, client:personBlock('the futanari', [look.replace(/\bwoman\b/, 'futanari'), cc, SCENE_DATA.futaPhrase || 'erect penis'])}); }
  // Sam's demonstration class: seen from the room, Sam is the man, the other ladies watch (scenes.json → demoRoom / people.demo)
  // group nights (sam.js samOrgy): the first lady in full, the others briefly (scenes.json → orgyPose / orgyRoom / people.orgy)
  if(k.startsWith('orgy:')){ const os = k.slice(5).split(',').map(findAny).filter(o=>o && w && o.id!==w.id);
    const short = o => { const d = effDesign(o, k); return [raceLook(o, k), hairText(d), d.skin && nounPhrase(d.skin, 'skin'), bodyDesc(o, k), d.features, clothesFor(o, defaultCloth(o, k), k)].filter(Boolean).join(', '); };
    return {label:'A night together', pov:true, sam:true, comp:pick([].concat(SCENE_DATA.orgyPose || ['the women crowded around the viewer on the bed, pov'])), setting:SCENE_DATA.orgyRoom || SCENE_DATA.samRoom, expr:svcExpr(w, null, P, true),
      client: os.length ? 'the other women: ' + os.map(short).join('; ') : ''}; }
  if(k.startsWith('demo:')){ const id = k.slice(5); return {label:'Demonstration: '+actLabel(id), sam:true, comp:actPose(id,'demo'), client:'the man is ' + SAM_LOOK, setting:SCENE_DATA.demoRoom || 'a candlelit parlor, other women watching', snip:'act_'+id, expr:svcExpr(w, id, P, true)}; }
  // 'again' / 'again_<ctx>': another round (evAgain), pictured with scenes.json → againPhrase in the first round's place
  if(k.startsWith('samact:')){ const id = k.slice(7), a=actById(id), ag = /^again(?:_|$)/.test(P.ctx), cx = ag ? P.ctx.replace(/^again_?/, '') : P.ctx;
    return {label:'Sam: '+actLabel(id), pov:true, sam:true, comp:(()=>{ const c = dateCtx(cx), pose = actPose(id,'sam'), si = c && c.sp && c.sp.image; return [si && si.comp ? (si.replace ? si.comp : pose + ', ' + si.comp) : pose, ag ? (SCENE_DATA.againPhrase || 'second round') : ''].filter(Boolean).join(', '); })(), setting:(typeof gTeaseSetting==='function' && gTeaseSetting(cx)) || (typeof isoSetting==='function' && isoSetting(cx)) || (typeof walkSetting==='function' && walkSetting(cx)) || samCtxSetting(cx, h) || dateSetting(cx), snip:'act_'+id, expr:svcExpr(w, id, P, true)}; }
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
