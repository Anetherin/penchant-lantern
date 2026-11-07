'use strict';
/* =====================================================================
   IMAGE PROMPTS
   ===================================================================== */
function ageLook(w){
  const R = RACES[w.race]||RACES.human;
  if(R.age[1] > 60) return 'appearing to be a mature woman in her mid-twenties';
  if(w.age < 25) return 'in her early-to-mid twenties';
  if(w.age < 30) return 'in her late twenties';
  return 'in her thirties';
}
function raceLook(w){ if(w.race==='beastkin'){ const s=w.sub||'fox'; return `beastkin woman with ${s} ears and a ${s} tail`; } return (RACES[w.race]||RACES.human).look; }
function clothText(w, cloth, scene){
  if(cloth==='dressed' && scene && SCENES[scene] && SCENES[scene].towel) return 'wrapped only in a white towel';
  const T = Object.assign({}, DEFAULT_CLOTH_TEXT, Object.fromEntries(Object.entries(SET.clothText||{}).filter(([k,v])=>v)));
  let t = T[cloth];
  if(!t && cloth==='nude') t = T.partial;
  const ut = underText(w);
  // Modest ladies during intimate scenes: clothes pulled aside rather than removed
  if(has(w,'Modest') && (cloth==='dressed'||cloth==='partial') && /^(act:|samact:|duo:|solo$)/.test(scene||'')){
    t = (!ut && T.aside_commando) || T.aside || t;
  }
  return (t||T.dressed).replace(/\{outfit\}/g, outfitText(w)).replace(/\{underwear\}/g, ut || 'bare skin, nothing underneath');
}
function charDesc(w){
  const d = w.design || {};
  return [`beautiful adult ${raceLook(w)}`, ageLook(w), d.build && `${d.build} build`,
    (d.hairStyle||d.hairColor) && `${d.hairStyle||''} ${d.hairColor||''} hair`, d.eyes && `${d.eyes} eyes`,
    d.skin && `${d.skin} skin`, d.features].filter(Boolean).join(', ');
}
// act_<id> snippets now live on the service (image.extra); older browser edits still win
const getSnippet = k => { const a = k.startsWith('act_') && actById(k.slice(4)); return (SET.snippets[k] || (a && a.image && a.image.extra) || SCENE_SNIPPETS[k] || '').trim(); };
function buildPrompt(w, sceneKey, cloth){
  const sc = sceneInfo(sceneKey, w);
  if(w.male) return cleanText([SET.style, 'adult man', w.look, 'upper body portrait, looking at viewer', 'dramatic lighting'].join(', '));
  cloth = cloth || defaultCloth(w, sceneKey);
  const parts = [SET.style];
  if(sc.pov) parts.push("first-person POV, from the viewer's perspective");
  parts.push(charDesc(w), clothText(w, cloth, sceneKey));
  if(sc.sam && !sc.pov) parts.push('together with ' + SAM_DESC);
  if(sc.client) parts.push(sc.client);
  parts.push(sc.comp, sc.setting);
  if(sc.snip) parts.push(getSnippet(sc.snip));
  if(sc.snip2) parts.push(getSnippet(sc.snip2));
  if(sc.pov) parts.push(getSnippet('pov'));
  return cleanText(parts.filter(Boolean).join(', '));
}
