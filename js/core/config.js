'use strict';
/* =====================================================================
   USER CONFIG
   ===================================================================== */
// Your own scene text, appended to the generated prompt. Settings → Scene Snippets overrides these.
// Keys: act_<serviceId> for each service category, "pov" (added to every Sam/POV scene), "bath".
const SCENE_SNIPPETS = {
  act_caress:"", act_manual:"", act_oral:"", act_paizuri:"",
  act_missionary:"", act_cowgirl:"", act_doggy:"",
  pov:"", bath:"", mishap:""
};
// Service categories. th = lewdness needed for her to enjoy it (trust can stretch her up to 25 below), price = base fee. Add more in Settings → Services.
const ACTS = [
  {id:'caress',     label:'Kissing & touching', th:25, price:24, energy:6,  comp:'embracing and kissing passionately'},
  {id:'manual',     label:'Manual',             th:32, price:32, energy:7,  comp:'intimate moment'},
  {id:'oral',       label:'Oral',               th:42, price:44, energy:9,  comp:'intimate moment'},
  {id:'paizuri',    label:'Paizuri',            th:45, price:46, energy:9,  comp:'intimate moment'},
  {id:'missionary', label:'Missionary',         th:52, price:58, energy:11, comp:'intimate moment, lying on the bed'},
  {id:'cowgirl',    label:'Cowgirl',            th:56, price:64, energy:12, comp:'intimate moment, on the bed'},
  {id:'doggy',      label:'Doggy',              th:60, price:64, energy:12, comp:'intimate moment, on the bed'}
];
// Clothing states, in order. {outfit} and {underwear} are filled in from her wardrobe.
const DEFAULT_CLOTH_TEXT = {
  dressed: "wearing {outfit}",
  partial: "wearing {outfit}, partially undressed, clothes loosened and slipping off to show {underwear}",
  under:   "wearing only {underwear}",
  nude:    ""   // fill in yourself; empty falls back to "partial"
};
const DEFAULT_SETTINGS = {
  style: "anime style, detailed fantasy illustration, isekai, soft cinematic lighting, high quality",
  negative: "child, minor, teen, loli, young-looking, school uniform, lowres, bad anatomy, extra fingers, watermark, text, signature",
  resolution: "512x768", autoPortrait: true, libraryInPool: true,
  snippets: {}, clothText: {}, customActs: [],
  ai: {on:false, auto:false, guidance:'', tpl:{}}
};
// AI text templates (Perchance ai-text-plugin). {placeholders} are filled from the game. Edit in Settings → AI Text.
const DEFAULT_AI_TPL = {
  scene: "Write a short scene (about 120 words, third person, past tense) for a fantasy isekai pleasure-house game. {name} is a {race} working at {house}: {appearance}. She is wearing {clothing}. Personality: {personality}. Her client: {client}. Service: {service}, which is {stance}. Setting: {setting}. {guidance} All characters are consenting adults. Output only the scene.",
  private: "Write a short scene (about 150 words, third person, past tense) for a fantasy isekai pleasure-house game. Sam Takahashi is a kind, slightly nerdy young man reincarnated from Japan who now runs {house}. {name} is a {race}: {appearance}. She is wearing {clothing}. Personality: {personality}. Their relationship: {relationship} (her trust in Sam: {trust}/100). They spend private time together: {service}, which for her is {stance}. Setting: {setting}. {guidance} Both are consenting adults. Output only the scene.",
  train: "Write a short scene (about 120 words, third person, past tense) for a fantasy isekai pleasure-house game. Sam Takahashi, a kind, nerdy young man from another world, helps {name} ({race}, {personality}) practice {service}. Their relationship: {relationship}. Setting: {setting}. Include Sam taking notes, which she finds funny. {guidance} Both are consenting adults. Output only the scene.",
  backstory: "Write a 3-4 sentence backstory for {name}, a {age}-year-old {race} woman in a fantasy world who has just taken a job at a pleasure house in the frontier town of Hollowmere. Appearance: {appearance}. Personality: {personality}. Traits: {traits}. Why she came: {hook}. Third person, no lists, no title. Output only the backstory."
};
const SAM_DESC = "a young adult Japanese man in his mid-twenties, short dark brown hair, thin build, kind and slightly awkward expression, grey hoodie under a simple traveler's cloak";
