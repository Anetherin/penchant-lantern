'use strict';
/* =====================================================================
   USER CONFIG
   Editable text and numbers live in data/*.json (loaded by loader.js into window.PL_DATA).
   ===================================================================== */
const DATA = window.PL_DATA || {};
function needData(k){ if(!DATA[k]) throw new Error(`data/${k}.json didn't load.`); return DATA[k]; }
const noMeta = o => Object.fromEntries(Object.entries(o||{}).filter(([k])=>!k.startsWith('_')));
// Named characters (data/characters.json) plus visiting guests (data/guests.json packs, role 'drifter').
function charData(){
  if(charData.c) return charData.c;
  const out = Object.assign({}, noMeta(needData('characters')));
  Object.entries(noMeta((DATA.guests||{}).packs)).forEach(([p,P])=>Object.entries(noMeta(P.characters)).forEach(([k,c])=>{ out[k] = Object.assign({role:'drifter', pack:p}, c); }));
  return charData.c = out;
}
const GUEST_PACKS = noMeta((DATA.guests||{}).packs);
const GUEST_VISITS = Object.assign({chance:0.5, reborn:0.25, ngppPerSlot:true, stayWeeks:2, cooldownWeeks:8, maxChance:0.8}, (DATA.guests||{}).visits);
// Service categories (data/services.json). Custom ones added in old versions of Settings still work.
const ACTS = needData('services').services;
// Old service ids -> current ones (services come in _give/_get pairs). Old data/saves that use them keep working through these.
const ACT_ALIAS = {caress:'kiss', manual:'manual_give', oral:'oral_give', paizuri:'breast_give'};
const ACT_ALIAS_REV = Object.fromEntries(Object.entries(ACT_ALIAS).map(([o,n])=>[n,o]));
const actKey = id => ACT_ALIAS[id] || id;
// a per-service lookup into a data map (flavor, dynamics...), falling back to the old id
const byAct = (map, id) => (map||{})[id] ?? (map||{})[ACT_ALIAS_REV[id]];
// Saved image keys / scene keys that still carry an old service id ('act:oral~lost', 'duo:paizuri:b', ...)
const ACT_ALIAS_RE = new RegExp('((?:^|[|])(?:act|samact|duo):)(' + Object.keys(ACT_ALIAS).join('|') + ')(?=[~:|]|$)');
const actKeyScene = k => String(k).replace(ACT_ALIAS_RE, (m, p, id) => p + ACT_ALIAS[id]);
// Your own scene text, appended to the generated prompt (data/snippets.json → scenes).
const SCENE_SNIPPETS = noMeta(needData('snippets').scenes);
// Clothing state wording (data/snippets.json → clothing). {outfit} and {underwear} are filled in from her wardrobe.
const DEFAULT_CLOTH_TEXT = noMeta(needData('snippets').clothing);
// Face wording for how she's taking a service (data/snippets.json → expressions / expressionsByAct). TODO placeholders are skipped.
const SNIP_EXPR = noMeta(needData('snippets').expressions||{}), SNIP_EXPR_ACT = noMeta(needData('snippets').expressionsByAct||{});
const isTodo = s => /^\s*TODO/i.test(String(s||''));
const stripTodo = s => String(s||'').split(',').filter(x=>!isTodo(x)).join(',');
// The general mood line plus the service's own line. A general piece that repeats the service line, or describes the same
// part of her face (two smiles, two sets of eyes), is dropped: one face, one description.
const EXPR_FACE = ['smile','smirk','grin','eyes','gaze','glance','blush','lips','face','expression'];
function exprText(e, act){
  if(!e) return '';
  const g = SNIP_EXPR[e], a = (SNIP_EXPR_ACT[actKey(act||'')]||{})[e], ok = x => x && !isTodo(x);
  if(!ok(a)) return ok(g) ? g : '';
  if(!ok(g)) return a;
  const al = a.toLowerCase(), faces = EXPR_FACE.filter(f => new RegExp('\\b' + f).test(al));
  const keep = g.split(/,\s*/).filter(s => { const sl = s.trim().toLowerCase(); return sl && !al.includes(sl) && !faces.some(f => new RegExp('\\b' + f).test(sl)); });
  return [...keep, a].join(', ');
}
// AI text prompts (data/ai-prompts.json). {placeholders} are filled from the game.
const AI_FILE = needData('ai-prompts');
const DEFAULT_AI_TPL = Object.fromEntries(Object.entries(noMeta(AI_FILE)).filter(([k,v])=>k!=='guidance' && typeof v==='string'));
// Tuning numbers (data/balance.json).
const BAL = needData('balance');
// Short random text lines (data/flavor.json).
const FLAVOR = noMeta(needData('flavor'));
const DEFAULT_SETTINGS = {
  style: "4k anime style, masterpiece, high detailed quality",
  negative: "child, minor, loli, young-looking, lowres, bad anatomy, extra fingers, watermark, text, signature",
  resolution: "512x768", autoPortrait: true, autoImg: true, imgHidden: false, repImg: true, svcImg: {}, svcImgAll: false, libraryInPool: true, packsOff: {}, silly: false,
  snippets: {}, clothText: {}, customActs: [],
  ai: {on:true, auto:false, autoBackstory:true, guidance:'', tpl:{}, v:2}
};
const SAM_LOOK = "a young adult Japanese man in his mid-twenties, short dark brown hair, thin build, kind and slightly awkward expression";   // Sam without clothes (intimate scenes)
const SAM_DESC = SAM_LOOK + ", grey hoodie under a simple traveler's cloak";
