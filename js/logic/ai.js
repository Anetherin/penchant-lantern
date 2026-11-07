'use strict';
/* ---------- AI text (optional) ---------- */
function getTextPlugin(){
  const P = window.PL_PLUGINS; if(P && typeof P.ai === 'function') return P.ai;
  try{ if(typeof ai === 'function') return ai; }catch(e){}
  if(typeof window.ai === 'function') return window.ai;
  return null;
}
const aiTpl = k => (SET.ai.tpl[k] && SET.ai.tpl[k].trim()) || DEFAULT_AI_TPL[k];
function aiCtx(w, x={}){
  const scene = x.scene || 'portrait', cloth = x.cloth || defaultCloth(w, scene);
  const rel = has(w,'Devoted') ? 'lovers' : w.isPartner ? 'close companions, with feelings between them' : w.trust>=60 ? 'close and trusting' : w.trust>=30 ? 'friendly employer and employee' : 'new employer and employee, still a little guarded';
  const o = x.other ? findAny(x.other) : null;
  return {
    dynamic: x.dynamic || '', other: o ? o.name : '', otherDesc: o ? `${raceLabel(o).toLowerCase()}, ${cleanText(charDesc(o).split(', ').slice(1).join(', '))}, ${(o.personality||'').toLowerCase()}` : '',
    name:w.name, race:raceLabel(w).toLowerCase(), age:w.age, appearance:cleanText(charDesc(w).split(', ').slice(1).join(', ')),
    clothing:cleanText(clothText(w, cloth, scene)), outfit:outfitText(w), personality:(w.personality||'').toLowerCase(),
    traits:(w.traits||[]).join(', ')||'none', trust:Math.round(w.trust), lewd:Math.round(w.lewd), mood:Math.round(w.mood),
    service: x.act ? (actById(x.act)&&actById(x.act).desc ? `${actLabel(x.act)} (${actById(x.act).desc})` : actLabel(x.act)) : (x.label || 'drinks and conversation'),
    stance: x.act ? ((x.forSam ? samStance(w,x.act) : clientStance(w,x.act))==='ask' ? 'a stretch for her: she does it because she trusts Sam, a little past her comfort zone' : 'something she genuinely enjoys') : 'easy and pleasant for her',
    client: x.cls ? pick(CLIENT_DESC[x.cls]) : 'a regular client', setting: sceneInfo(scene, w).setting,
    house: S ? houseOf(w).name : 'the pleasure house', relationship: rel, date: x.date||'a date', situation: x.situation||'', lust: lustLabel ? ({restless:'restless with desire', eager:'eager', content:'in a good mood', 'not in the mood':'calm'})[lustLabel(w)] : 'in a good mood', guidance: SET.ai.guidance||AI_FILE.guidance||'', hook: x.hook || pick(HOOKS), backstory: w.backstory||''
  };
}
const fillTpl = (t, c) => t.replace(/\{(\w+)\}/g, (m,k)=> c[k]!==undefined ? String(c[k]) : m);
const YOUTH_TEST = new RegExp(YOUTH_RE.source, 'i');
async function aiWrite(boxId, kind, wid, x={}){
  const box = $('#'+boxId), w = findAny(wid); if(!box || !w) return;
  const plug = getTextPlugin();
  if(!plug){ box.innerHTML = `<div class="muted">AI text isn't connected. In Perchance, add <code>ai = {import:ai-text-plugin}</code> to the lists panel.</div>`; return; }
  const instruction = fillTpl(aiTpl(kind), aiCtx(w, x));
  box.innerHTML = `<div class="hl story muted">Writing…</div>`;
  const out = box.firstChild; let full = '';
  try{
    const r = plug({instruction, onChunk:(d)=>{ full = (d && d.fullTextSoFar!==undefined) ? d.fullTextSoFar : full + ((d&&d.textChunk)||''); out.classList.remove('muted'); out.textContent = full; }});
    const res = await r;
    let text = typeof res==='string' ? res : (res && (res.text || res.generatedText || res.output)) || full;
    text = String(text||'').trim();
    if(!text){ out.textContent = 'Nothing came back. Try again.'; return null; }
    if(YOUTH_TEST.test(text)){ out.textContent = 'That generation was discarded (it described someone as young). Try again.'; return null; }
    out.classList.remove('muted'); out.textContent = text;
    return text;
  }catch(e){ out.textContent = 'AI text error: ' + e.message; return null; }
}
async function aiBackstory(boxId, wid){
  const w = findAny(wid); if(!w) return;
  const text = await aiWrite(boxId, 'backstory', wid);
  if(text){ w.backstory = text; if(S) save(); toast('Backstory saved.'); }
}
const aiBtn = (boxId, kind, wid, x) => SET.ai.on ? `<button class="sm" onclick='aiWrite("${boxId}","${kind}","${wid}",${JSON.stringify(x||{}).replace(/'/g,"&#39;")})'>✨ Write it</button>` : '';
