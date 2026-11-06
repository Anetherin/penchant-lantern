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
  const out = ev.choices[i].fx() || '';
  const res = typeof out==='object' ? (out.text||'') : out;
  checkUnlocks(); save(); render();
  $('#evChoices').innerHTML = `${out.ai?aiBtn('evAi', out.ai.kind, out.ai.wid, out.ai):''}<button class="primary" onclick="closeModal();runQueue()">Continue</button>`;
  $('#evRes').innerHTML = (res ? `<p class="story"><i>${esc(res)}</i></p>` : '') + (out.ai?'<div id="evAi"></div>':'') + (out.img?'<div id="evResImg"></div>':'');
  if(out.img) showImg('evResImg', out.img.wid, out.img.scene, out.img.cloth);
  if(out.ai && SET.ai.on && SET.ai.auto) aiWrite('evAi', out.ai.kind, out.ai.wid, out.ai);
}
