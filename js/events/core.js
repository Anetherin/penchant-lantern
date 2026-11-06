'use strict';
/* =====================================================================
   EVENTS
   ===================================================================== */
function runQueue(){
  if(!EVQ.length){ CUR_EV=null; render(); checkEnd(); return; }
  let ev = null; try{ ev = EVQ.shift()(); }catch(e){ console.warn('event skipped', e); ev = null; }
  if(!ev) return runQueue();
  showEvent(ev);
}
function showEvent(ev){
  CUR_EV = ev;
  modal(`<h2>${esc(ev.title)}</h2>${ev.who?`<div id="evImg"></div>`:''}
    <p class="story">${esc(ev.text)}</p><div id="evRes"></div>
    <div class="row" id="evChoices">${ev.choices.map((c,i)=>`<button ${i===0?'class="primary"':''} onclick="evChoice(${i})">${esc(c.label)}</button>`).join('')}</div>`, {lock:true});
  if(ev.who) showImg('evImg', ev.who, ev.scene||'portrait', ev.cloth);
}
function evChoice(i){
  const ev = CUR_EV; if(!ev) return;
  const res = ev.choices[i].fx() || '';
  checkUnlocks(); save(); render();
  $('#evChoices').innerHTML = `<button class="primary" onclick="closeModal();runQueue()">Continue</button>`;
  $('#evRes').innerHTML = res ? `<p class="story"><i>${esc(res)}</i></p>` : '';
}
