'use strict';
/* ---------- Intro + init ---------- */
function showIntro(){
  const h = S.houses[0], D = HOUSES[h.id], npc = S.workers.find(w=>w.key===D.npc), p = S.workers.find(w=>w.isPartner);
  modal(`<h2>Welcome to Hollowmere</h2><p class="story">The last thing Sam Takahashi remembers is a truck horn.

Now he's in a world with two moons, holding the deed to ${D.name} in ${D.loc}, and a glowing window only he can see:

[ Unique Skill: Appraisal Lv ${S.sam.appraisal} ]

A woman with a monocle informs him the deed comes with its previous owner's debt: ${fmt(S.debt.remaining)} to the Vane Credit House, payable every four weeks. Three missed payments and everything is theirs.

${npc?npc.name+' is waiting inside. She came with the building and isn\'t sure what to make of him yet.':''}
${p?p.name+' is at his side. '+NAMED[p.key].partnerStory:''}</p>
<p class="muted">How to play: assign jobs in Roster, set prices in Houses, spend Sam's actions each week, then End Week. Ladies only recover energy when they sleep, so mind the beds, and they'll auto-rest when worn out. Each lady's Lewdness decides what she enjoys; her Trust in Sam decides how far past that she'll go when he asks, and some lines she won't cross yet. More houses are for sale in Upgrades.</p>
<div class="row"><button class="primary" onclick="closeModal()">Let's go</button></div>`, {lock:true});
}
async function init(){
  await idbOpen();
  const th = await idbAll('thumbs'); THUMBS = th || {};
  IMGKEYS = new Set((await imgKeysAll()) || []);
  // the saved library was 0-100 before the 0-1000 stats change
  if(store.get('gilded_lantern_libv') !== 13){ LIB.forEach(w=>{ scaleWorker(w); migrateWorker(w); }); saveLib(); store.set('gilded_lantern_libv', 13); }
  else LIB.forEach(migrateWorker);   // idempotent: picks up renamed service ids
  // saved images keyed by an old service id ('act:oral', 'samact:paizuri', ...) move to the new id
  for(const k of [...IMGKEYS]){ const nk = actKeyScene(k); if(nk!==k && !IMGKEYS.has(nk)){ const v = await imgGet(k); if(v){ await imgPut(nk, v); await imgDel(k); } } }
  S = store.get(KEY_SAVE);
  if(!S || !Array.isArray(S.workers)){ S = null; startSetup(); }
  else { migrate(S); save(); render(); if(S.ngSeed && S.won) startNGPlus(); }
}
init();
