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
const GUEST_VISITS = Object.assign({chance:0.3, stayWeeks:2, cooldownWeeks:8, pity:0.1, maxChance:0.8}, (DATA.guests||{}).visits);
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
function exprText(e, act){ if(!e) return ''; return [SNIP_EXPR[e], (SNIP_EXPR_ACT[actKey(act||'')]||{})[e]].filter(x=>x && !isTodo(x)).join(', '); }
// AI text prompts (data/ai-prompts.json). {placeholders} are filled from the game.
const AI_FILE = needData('ai-prompts');
const DEFAULT_AI_TPL = Object.fromEntries(Object.entries(noMeta(AI_FILE)).filter(([k,v])=>k!=='guidance' && typeof v==='string'));
// Tuning numbers (data/balance.json).
const BAL = needData('balance');
// Short random text lines (data/flavor.json).
const FLAVOR = noMeta(needData('flavor'));
const DEFAULT_SETTINGS = {
  style: "anime style, detailed fantasy illustration, isekai, soft cinematic lighting, high quality",
  negative: "child, minor, teen, loli, young-looking, school uniform, lowres, bad anatomy, extra fingers, watermark, text, signature",
  resolution: "512x768", autoPortrait: true, autoImg: true, imgHidden: false, libraryInPool: true, packsOff: {},
  snippets: {}, clothText: {}, customActs: [],
  ai: {on:true, auto:true, autoBackstory:true, guidance:'', tpl:{}}
};
const SAM_DESC = "a young adult Japanese man in his mid-twenties, short dark brown hair, thin build, kind and slightly awkward expression, grey hoodie under a simple traveler's cloak";
