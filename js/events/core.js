'use strict';
/* =====================================================================
   EVENTS
   ===================================================================== */
let EV_AFTER = null;
function runQueue(){
  EV_AFTER = null;
  if(!EVQ.length){ CUR_EV=null; render(); checkEnd(); return; }
  let ev = null; try{ ev = EVQ.shift()(); }catch(e){ console.warn('event skipped', e); ev = null; }
  if(!ev) return runQueue();
  showEvent(ev);
}
// ev.pre: optional pages shown before the choices ([{text, btn, scene}]; the goddess's teases: her arrival, then Sam
// wondering). They are display only: evChoice works from any page, so test drains that pick choices directly skip them.
function showEvent(ev){
  EV_AFTER = null;
  CUR_EV = ev;
  const pg = ev.pre && ev.pre.length ? ev.pre[0] : null;
  const aside = (pg ? pg.aside : ev.aside) || '';
  modal(`<h2>${esc(ev.title)}</h2>${ev.who?`<div id="evImg"></div>`:''}
    <p class="muted" id="evAside" style="font-style:italic;margin-bottom:8px;${aside?'':'display:none'}">${esc(aside)}</p>
    <p class="story" id="evText">${esc(pg ? pg.text : ev.text)}</p><div id="evRes"></div>
    <div class="row" id="evChoices">${pg ? `<button class="primary" onclick="evPre()">${esc(pg.btn || 'Continue')}</button>` : evButtons(ev)}</div>`, {lock:true});
  if(ev.who) showImg('evImg', ev.who, (pg && pg.scene) || ev.scene || 'portrait', ev.cloth);
}
const evButtons = ev => ev.choices.map((c,i)=>`<button ${i===0?'class="primary"':''} onclick="evChoice(${i})">${esc(c.label)}</button>`).join('');
// next pre-page, or the event's own text and choices (the picture changes only if the page names another scene)
function evPre(){
  const ev = CUR_EV; if(!ev || !ev.pre || !ev.pre.length) return;
  const was = ev.pre.shift(), pg = ev.pre[0];
  const aside = (pg ? pg.aside : ev.aside) || '';
  const ae = $('#evAside'); if(ae){ ae.textContent = aside; ae.style.display = aside ? '' : 'none'; }
  $('#evText').textContent = pg ? pg.text : ev.text;
  $('#evChoices').innerHTML = pg ? `<button class="primary" onclick="evPre()">${esc(pg.btn || 'Continue')}</button>` : evButtons(ev);
  const sc = (pg && pg.scene) || ev.scene || 'portrait';
  if(ev.who && sc !== ((was && was.scene) || ev.scene || 'portrait')) showImg('evImg', ev.who, sc, ev.cloth);
  $('#modal').scrollTop = 0;
}
function evContinue(){
  const after = EV_AFTER; EV_AFTER = null;
  CUR_EV = null; closeModal();
  if(typeof after === 'function') after();
  else runQueue();
}
function evChoice(i){
  const ev = CUR_EV; if(!ev) return;
  EV_NOTES = [];
  const out = ev.choices[i].fx() || '';
  const isObj = out && typeof out==='object';
  let res = isObj ? (out.text||'') : out;
  const aside = isObj ? (out.aside||'') : '';
  EV_AFTER = isObj && typeof out.after==='function' ? out.after : (typeof ev.after==='function' ? ev.after : null);
  if(EV_NOTES.length){ res = (res ? res + '\n\n' : '') + EV_NOTES.join('\n'); EV_NOTES = []; }
  checkUnlocks(); save(); render();
  $('#evChoices').innerHTML = `${out.ai?aiBtn('evAi', out.ai.kind, out.ai.wid, out.ai):''}<button class="primary" onclick="evContinue()">Continue</button>`;
  $('#evRes').innerHTML = (res ? `<p class="story"><i>${esc(res)}</i></p>` : '') + (aside ? `<p class="muted" style="font-style:italic;margin-top:8px">${esc(aside)}</p>` : '') + (out.ai?'<div id="evAi"></div>':'') + (out.img?'<div id="evResImg"></div>':'');
  if(out.img) showImg('evResImg', out.img.wid, out.img.scene, out.img.cloth);
  if(out.ai && SET.ai.on && SET.ai.auto) aiWrite('evAi', out.ai.kind, out.ai.wid, out.ai);
}
