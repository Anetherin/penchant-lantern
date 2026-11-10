'use strict';
/* =====================================================================
   TITLES (data/titles.json)
   A lady holds a list of title ids (w.titles) and goes by one of them (w.titleId); w.title is that title's label,
   kept in sync so titled(w), the AI's {title} and older code keep working. A creator lady may have a custom
   free-text w.title with w.titleId null: shown, no perk. Only the title she goes by adds its fx (fxList in fx.js).
   Titles live on the lady, so a lady carried into New Game+ keeps them.
   ===================================================================== */
const TITLE_FILE = needData('titles');
const TITLES = noMeta(TITLE_FILE.titles);
const TITLE_CHANCE = TITLE_FILE.earnChance ?? 0.5;
// a data / creator title (label or id) -> title id, or null
function titleIdFor(t){
  if(!t) return null; const s = String(t).trim().toLowerCase();
  if(TITLES[s]) return s;
  return Object.keys(TITLES).find(k=>TITLES[k].label.toLowerCase()===s) || null;
}
const titleOf = w => (w && w.titleId && TITLES[w.titleId]) || null;
// Called from ensureWorker (creation and every load): titles from her data, old saves' w.title, keeps titleId valid.
function syncTitles(w){
  w.titles = Array.isArray(w.titles) ? w.titles.filter(t=>TITLES[t]) : [];
  const D = w.key && NAMED[w.key], seed = D && D.title ? titleIdFor(D.title) : null;
  if(seed && !w.titles.includes(seed)) w.titles.unshift(seed);
  if(w.titleId === undefined){   // first time: what she was already called, else her first title
    const t = titleIdFor(w.title);
    if(t && !w.titles.includes(t)) w.titles.push(t);
    w.titleId = t || (w.title ? null : (w.titles[0] || null));
  }
  if(w.titleId && !w.titles.includes(w.titleId)) w.titleId = w.titles[0] || null;
  if(w.titleId) w.title = TITLES[w.titleId].label;
  return w;
}
// Grant a title. She takes it as her own if she goes by nothing yet. Returns the announcement line, or '' if she already had it.
function giveTitle(w, id){
  if(!w || !TITLES[id]) return ''; syncTitles(w);
  if(w.titles.includes(id)) return '';
  w.titles.push(id);
  const T = TITLES[id], adopt = !w.titleId && !w.title;
  if(adopt){ w.titleId = id; w.title = T.label; }
  const shown = T.after ? `${w.name}, ${T.label}` : `${T.label} ${w.name}`;
  addLog(`${w.name} earned the title ${T.label}.`);
  return `👑 ${w.name} has earned a title: ${shown}. ${T.desc}${adopt ? '' : ' (Pick the title she goes by on her sheet.)'}`;
}
function setTitle(id, tid){
  const w = findW(id); if(!w) return; syncTitles(w);
  if(tid==='__custom') return;   // a creator lady's own free-text title: nothing to change
  if(!tid){ w.titleId = null; w.title = undefined; }
  else if(w.titles.includes(tid)){ w.titleId = tid; w.title = TITLES[tid].label; }
  save(); render(); refreshSheetInfo();
}
// earn conditions: the traits' (earnEligible) plus {reborn: n} and {all: [...]}
function titleEarnOK(w, e){
  if(!e) return false;
  if(Array.isArray(e.all)) return e.all.every(x=>titleEarnOK(w, x));
  if(e.reborn!==undefined) return (w.reborn||0) >= e.reborn;
  return earnEligible(w, e);
}
// Titles a finished romance arc (arc: her key) or house story (house: house id) grants. Returns the announcement lines.
const titlesFor = (kind, key) => Object.keys(TITLES).filter(id=>TITLES[id][kind]===key);
const awardTitles = (w, kind, key) => titlesFor(kind, key).map(id=>giveTitle(w, id)).filter(Boolean);
// Lines to show under the current event's result (evChoice clears it before a choice and appends it after): house stories
// grant their title from storyAdvance, which can't add to the choice's own text.
let EV_NOTES = [];
// Weekly (endWeek): titles she has grown into, plus any finished arc / house story whose title she doesn't hold yet
// (her house's story finished before she was hired, or before titles existed). Returns the announcement lines.
function titleCheck(w){
  syncTitles(w);
  const out = Object.keys(TITLES).map(id=>{
    const T = TITLES[id]; if(!T.earn || w.titles.includes(id)) return '';
    if(!titleEarnOK(w, T.earn) || Math.random() >= TITLE_CHANCE) return '';
    return giveTitle(w, id);
  }).filter(Boolean);
  if(w.key && ARCS[w.key] && (w.arc||0) >= ARCS[w.key].length) out.push(...awardTitles(w, 'arc', w.key));
  const hh = w.key && S.houses.find(h=>(HOUSES[h.id]||{}).npc===w.key && houseStoryDone(h));
  if(hh) out.push(...awardTitles(w, 'house', hh.id));
  return out;
}
// Sheet: which title she goes by (when she holds any) and its perk.
function titleRow(w){
  syncTitles(w);
  const T = titleOf(w), custom = !w.titleId && w.title;
  if(!w.titles.length) return custom ? `<div class="muted">👑 ${esc(w.title)} <span class="muted">(her own title, no perk)</span></div>` : '';
  const opts = w.titles.map(id=>`<option value="${id}" ${w.titleId===id?'selected':''}>${esc(TITLES[id].label)}</option>`).join('');
  const all = w.titles.map(id=>`${TITLES[id].label}: ${TITLES[id].desc}`).join('\n');
  return `<div class="row" title="${esc(all)}">👑 Goes by <select onchange="setTitle('${w.id}',this.value)">${custom?`<option value="__custom" selected>${esc(w.title)}</option>`:''}<option value="" ${!w.titleId&&!custom?'selected':''}>no title</option>${opts}</select>
    <span class="muted">${T ? esc(T.desc) : 'Only the title she goes by gives its perk.'}</span></div>`;
}
