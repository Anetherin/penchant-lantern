'use strict';
/* =====================================================================
   USER CONFIG
   Editable text and numbers live in data/*.json (loaded by loader.js into window.PL_DATA).
   ===================================================================== */
const DATA = window.PL_DATA || {};
function needData(k){ if(!DATA[k]) throw new Error(`data/${k}.json didn't load.`); return DATA[k]; }
const noMeta = o => Object.fromEntries(Object.entries(o||{}).filter(([k])=>!k.startsWith('_')));
// Service categories (data/services.json). Custom ones added in old versions of Settings still work.
const ACTS = needData('services').services;
// Your own scene text, appended to the generated prompt (data/snippets.json → scenes).
const SCENE_SNIPPETS = noMeta(needData('snippets').scenes);
// Clothing state wording (data/snippets.json → clothing). {outfit} and {underwear} are filled in from her wardrobe.
const DEFAULT_CLOTH_TEXT = noMeta(needData('snippets').clothing);
// AI text templates (data/ai-templates.json). {placeholders} are filled from the game.
const AI_FILE = needData('ai-templates');
const DEFAULT_AI_TPL = Object.fromEntries(Object.entries(noMeta(AI_FILE)).filter(([k])=>k!=='guidance'));
// Short random text lines (data/flavor.json).
const FLAVOR = noMeta(needData('flavor'));
const DEFAULT_SETTINGS = {
  style: "anime style, detailed fantasy illustration, isekai, soft cinematic lighting, high quality",
  negative: "child, minor, teen, loli, young-looking, school uniform, lowres, bad anatomy, extra fingers, watermark, text, signature",
  resolution: "512x768", autoPortrait: true, libraryInPool: true,
  snippets: {}, clothText: {}, customActs: [],
  ai: {on:true, auto:true, autoBackstory:true, guidance:'', tpl:{}}
};
const SAM_DESC = "a young adult Japanese man in his mid-twenties, short dark brown hair, thin build, kind and slightly awkward expression, grey hoodie under a simple traveler's cloak";
