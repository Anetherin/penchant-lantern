'use strict';
/* ---------- Intro + init ---------- */
function showIntro(){
  const h = S.houses[0], D = HOUSES[h.id];
  modal(`<h2>The Deed & the Debt</h2><div id="introImg"></div><p class="story">The last thing you remember is a truck horn.

Now you're standing in a town beneath two moons, clutching the deed to ${esc(D.name)} in ${esc(D.loc)}, with a glowing window floating at the corner of your vision:

[ Unique Skill: Appraisal Lv ${S.sam.appraisal} ]

Marguerite Vane adjusts her monocle and informs you the deed comes with its previous owner's debt: ${fmt(S.debt.remaining)} to the Vane Credit House, payable every four weeks. Three missed payments and everything reverts to them.</p>
<p class="muted">How to play: assign jobs in Roster, set prices in Houses, spend Sam's rest-day actions, pick his focus for the week, then Work the Nights. Each week is a rest day and six work nights; the ladies sleep off a little after every night and more on the rest day (mind the beds). Lewdness sets what she enjoys; Trust decides how far past that she'll go with Sam, and some lines wait for the right moment.</p>
<div class="row"><button class="primary" onclick="closeModal();queueStarterIntros();runQueue()">Continue</button></div>`, {lock:true});
  showImg('introImg', 'npc_marguerite', 'portrait');
}
async function init(){
  await idbOpen();
  const th = await idbAll('thumbs'); THUMBS = th || {};
  IMG_META = (await idbAll('meta')) || {};
  IMGKEYS = new Set((await imgKeysAll()) || []);
  // the saved library was 0-100 before the 0-1000 stats change
  if(store.get('gilded_lantern_libv') !== 13){ LIB.forEach(w=>{ scaleWorker(w); migrateWorker(w); }); saveLib(); store.set('gilded_lantern_libv', 13); }
  else LIB.forEach(migrateWorker);   // idempotent: picks up renamed service ids
  // saved images keyed by an old service id ('act:oral', 'samact:paizuri', ...) move to the new id
  for(const k of [...IMGKEYS]){ const nk = actKeyScene(k); if(nk!==k && !IMGKEYS.has(nk)){ const v = await imgGet(k); if(v){ await imgPut(nk, v); await imgDel(k); } } }
  S = store.get(KEY_SAVE);
  const old = S;
  if(S && Array.isArray(S.workers) && saveTooOld(S)){   // keep the old save aside rather than overwriting it, and start fresh
    store.set(KEY_SAVE + '_old', S); setTimeout(()=>toast(tooOldMsg(old) + ' It was kept aside; a new game starts.'), 500); }
  if(!S || !Array.isArray(S.workers) || saveTooOld(S)){ S = null; startSetup(); }
  else { migrate(S); save(); render(); if(S.ngSeed && S.won) startNGPlus(); }
  if(typeof cloudInit === 'function') cloudInit();
}
init();
