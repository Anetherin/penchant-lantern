'use strict';
/* =====================================================================
   DATA: scenes
   ===================================================================== */
const SCENES = {
  portrait:     {label:'Portrait', comp:'upper body portrait, looking at viewer, gentle smile', setting:'warm softly blurred background'},
  casual:       {label:'Casual', comp:'full body, relaxed pose', setting:'cozy lounge, warm lantern light', house:true},
  job_madame:   {label:'Work: Madame', comp:'standing confidently holding a ledger', setting:'elegant reception hall', house:true},
  job_reception:{label:'Work: Reception', comp:'smiling behind a polished wooden counter, welcoming guests', setting:'lantern-lit entrance hall', house:true},
  job_security: {label:'Work: Security', comp:'standing guard with arms crossed, short sword at her hip', setting:'doorway at night', house:true},
  job_bartender:{label:'Work: Bar', comp:'pouring drinks behind the bar, playful wink', setting:'lively fantasy tavern bar, bottles on shelves, warm light'},
  job_dancer:   {label:'Work: Stage', comp:'dancing gracefully on a small stage, dynamic pose, flowing fabric', setting:'candlelit stage, audience in silhouette'},
  job_bath:     {label:'Work: Bathhouse', comp:'attending guests, carrying towels, cheeky smile', setting:'steamy tiled fantasy bathhouse'},
  job_maid:     {label:'Work: Maid', comp:'tidying up with a feather duster, cheerful', setting:'polished hallway', house:true},
  companion:    {label:'Companion', comp:'sitting close beside a well-dressed client, sharing wine, flirtatious smile', setting:'private booth in a lounge', client:'with a well-dressed adult man', house:true},
  job_courtesan:{label:'Work: Courtesan', comp:'lounging invitingly, alluring smile', setting:'velvet lounge, warm candlelight', house:true},
  bath:         {label:'Bath', snip:'bath', comp:'relaxing in a steaming bath', setting:'tiled fantasy bathhouse, steam everywhere'},
  shower:       {label:'Mishap: Caught bathing', snip:'mishap', comp:'startled, clutching a towel to her chest, deeply blushing, wet hair', setting:'steamy wooden washroom'},
  walkin:       {label:'Mishap: Walked in on Sam', snip:'mishap', comp:'standing frozen in a doorway, hand over her mouth, wide-eyed and blushing, peeking through her fingers', setting:'steamy wooden washroom'},
  sam_date:     {label:'With Sam: Date', sam:true, comp:'sharing a meal at a candlelit table, laughing together', setting:'small cozy fantasy restaurant'},
  sam_training: {label:'With Sam: Training', sam:true, comp:'practicing together, Sam taking notes in a notebook', setting:'practice room', house:true}
};
SCENES.job_companion = SCENES.companion;
function getActs(){ return ACTS.concat(SET.customActs||[]); }
const actById = id => getActs().find(a=>a.id===id);
const actLabel = id => { const a = actById(id); return a ? a.label : id; };
function sceneInfo(k, w){
  const h = w && S ? houseOf(w) : null, HD = h ? HOUSES[h.id] : null;
  if(k.startsWith('act:')){ const a=actById(k.slice(4)); return {label:'Client: '+actLabel(k.slice(4)), comp:(a&&a.comp)||'intimate moment', setting:ROOM_SETTING(h), client:'with an adult male client', snip:'act_'+k.slice(4)}; }
  if(k.startsWith('samact:')){ const a=actById(k.slice(7)); return {label:'Sam: '+actLabel(k.slice(7)), pov:true, sam:true, comp:((a&&a.comp)||'intimate moment')+', looking at the viewer', setting:'Sam\'s modest bedroom lit by a single lantern', snip:'act_'+k.slice(7)}; }
  const sc = Object.assign({}, SCENES[k] || SCENES.portrait);
  if(sc.house && HD) sc.setting = sc.setting + ', ' + HD.setting;
  return sc;
}
function ROOM_SETTING(h){
  const t = h ? h.tier : 0;
  return ['a small shabby room with a creaky bed and a single candle','a comfortable private room with warm lamplight','a lavish bedroom with silk sheets and candlelight','an opulent suite with a canopy bed and rich fabrics'][t] + (h ? ', ' + HOUSES[h.id].setting : '');
}
