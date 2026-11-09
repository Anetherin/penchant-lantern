'use strict';
/* =====================================================================
   FIRSTS WITH SAM
   Each lady crosses lines with Sam at her own pace. Until she has, private time with him only offers services up to
   the tier she's reached (services.json → tier; canSam in js/logic/character.js). Clients are unaffected.
   - pace (fast / normal / slow): trust she needs for each stage and weeks between them (data/firsts.json → paces)
   - path: the stages her firsts reach, in order. [1,2,3] = a kiss, then hands & mouth, then everything;
     [1,3] = a kiss, then everything; [3] = straight to everything in one night.
   - init: once she's ready she makes the move herself instead of waiting for Sam.
   Her comfort (samStance) still has to allow it. A lady who's pent up (lust at max) can push past her own pace.
   Named ladies have their own scenes (firsts.json → characters, keyed by stage); everyone else uses the templates,
   which have variations by personality and traits.
   When it happens: at the end of a good date, from "Take the next step" on her sheet, or at the end of the week.
   ===================================================================== */
const FIRSTS = needData('firsts');
const FIRST_CHARS = noMeta(FIRSTS.characters), FIRST_TPL = noMeta(FIRSTS.templates);
const firstPace = w => FIRSTS.paces[(w.firsts||{}).pace] || FIRSTS.paces.normal;
const stageName = s => (FIRSTS.stages[s]||{}).label || '';
const pentUp = w => restless(w);
const fillF = (t, w) => String(t||'').replace(/\{name\}/g, w.name).replace(/\{N\}/g, w.name).replace(/\{house\}/g, (S && houseOf(w)) ? houseOf(w).name : 'the house');

// Named ladies: their own pace/path. Guests: rolled once from personality and traits, the same every game (seeded by key).
// Generic ladies: rolled at random (firsts.json → roll).
function firstsProfile(w){
  const C = w.key && FIRST_CHARS[w.key];
  if(C && C.path) return {pace:C.pace||'normal', path:C.path.slice(), init:!!C.init};
  const R = w.key ? seededRng(hashStr(w.key+':firsts')) : Math.random, P = FIRSTS.roll;
  const wpick = o => { const e = Object.entries(o).filter(([,v])=>v>0); let t = e.reduce((a,[,v])=>a+v,0)*R(); for(const [k,v] of e){ t -= v; if(t<=0) return k; } return e[0][0]; };
  const pace = Object.assign({}, P.pace), path = Object.assign({}, P.path);
  const mods = [...(w.traits||[]), w.personality].map(m=>P.mods[m]).filter(Boolean);
  mods.forEach(M=>{ Object.entries(M.pace||{}).forEach(([k,v])=>pace[k]=(pace[k]||0)+v); Object.entries(M.path||{}).forEach(([k,v])=>path[k]=(path[k]||0)+v); });
  if(w.lewd>=60) pace.fast += 1; else if(w.lewd<20) pace.slow += 1;
  const init = P.init + mods.reduce((a,M)=>a+(M.init||0),0);
  return {pace:wpick(pace), path:wpick(path).split(',').map(Number), init: R() < init};
}
function firstNext(w){ return ((w.firsts||{}).path||[1,2,3]).find(s=>s>(w.intim||0)) || null; }
// services at that stage she'd be comfortable with, with Sam
const tierActs = (w, s) => getActs().filter(a=>actTier(a.id)===s && samStance(w,a.id)!=='no');
// Why she isn't ready for her next first (null = she is). pent: she's restless enough to push past her own pace.
function firstBlock(w, pent){
  const s = firstNext(w); if(!s) return 'done';
  if(!tierActs(w,s).length) return 'comfort';
  const need = firstPace(w).trust[s-1] - (pent ? FIRSTS.pentTrust : 0);
  if(w.trust < need) return 'trust';
  if(w.firstHold && S.week < w.firstHold) return 'wait';
  if(!pent && S.week - (w.intimWk ?? -99) < firstPace(w).gap) return 'wait';
  return null;
}
const firstReady = (w, pent) => !!S && S.workers.includes(w) && !firstBlock(w, pent);
const firstReadyAny = w => firstReady(w) || (pentUp(w) && firstReady(w, true));

// Which scene: hers if she has one for this stage, else a template. A jump (from nothing straight past the first kiss)
// uses the "jump" templates; "pent_" templates are for when she can't wait any longer.
function firstData(w, s, pent){
  const C = w.key && FIRST_CHARS[w.key];
  if(C && C.events){
    if(pent && C.pent && C.pent[s]) return {d:C.pent[s], key:`first_${w.key}_${s}_p`};
    if(C.events[s]) return {d:C.events[s], key:`first_${w.key}_${s}`};
  }
  const base = (w.intim||0)===0 && s>1 ? 'jump' : String(s);
  const list = (pent && FIRST_TPL['pent_'+base]) || FIRST_TPL[base] || FIRST_TPL['1'];
  const fits = list.map((v,i)=>({v,i})).filter(({v})=>(!v.pers || v.pers.includes(w.personality)) && (!v.traits || v.traits.some(t=>has(w,t))) && (!v.race || v.race.includes(w.race)));
  const p = weighted(fits.length ? fits : list.map((v,i)=>({v,i})), x=>(x.v.pers||x.v.traits||x.v.race) ? 3 : 1);
  return {d:p.v, key:`first_t_${pent&&FIRST_TPL['pent_'+base]?'pent_':''}${base}_${p.i}`};
}
// the service shown when the line is crossed: hers if the scene names one, else her favorite at that stage, else the gentlest
function firstAct(w, s, d){
  const acts = tierActs(w, s);
  if(d && d.act && acts.some(a=>a.id===d.act)) return d.act;
  return (acts.find(a=>a.id===w.fav) || acts.slice().sort((a,b)=>a.th-b.th)[0] || {}).id;
}
function firstEvent(w, how){
  const s = firstNext(w); if(!s) return null;
  const pent = how==='pent', {d, key} = firstData(w, s, pent), act = firstAct(w, s, d);
  if(!act) return null;
  return {title:`♥ ${fillF(d.title, w)}`, who:w.id, scene: dynScene(key, d.image) || 'casual', text: fillF(d.text, w),
    choices:[
      {label: fillF(d.go || FIRSTS.defaults.go, w), fx(){ return firstCross(w, s, act, d); }},
      {label: fillF(d.wait || FIRSTS.defaults.wait, w), fx(){
        w.firstHold = S.week + FIRSTS.holdWeeks; gainTrust(w, 1);
        if(pent){ moodAdd(w, -4); w.lust = clamp(w.lust - 10); }
        return fillF(d.waitRes || FIRSTS.defaults.waitRes, w); }}]};
}
function firstCross(w, s, act, d){
  const from = w.intim||0;
  w.intim = s; w.intimWk = S.week; w.firstHold = 0; samGainXP(12);
  const text = privateCore(w, act, {lead: fillF(d.goRes, w), first:true});
  const opened = getActs().filter(a=>actTier(a.id)>from && actTier(a.id)<=s).map(a=>a.label);
  addLog(`${w.name} and Sam: ${stageName(s)}.`);
  return {text: text + `\n\n♥ ${w.name} and Sam: ${stageName(s)}. Private time with her can now include ${opened.join(', ')}, as far as she's comfortable.`,
    img:{wid:w.id, scene:'samact:'+act},
    ai:{kind:'encounter', wid:w.id, act, scene:'samact:'+act, forSam:true, situation: d.situation || FIRSTS.stages[s].situation}};
}

/* ---------- when it happens ---------- */
function firstFromDate(id){ const w = findW(id); if(!w) return closeModal(); const ev = firstEvent(w, pentUp(w) && !firstReady(w) ? 'pent' : 'date'); if(!ev) return closeModal(); showEvent(ev); }
function firstFromSheet(id){
  const w = findW(id); if(!w) return;
  if(!firstReadyAny(w)) return toast(`${w.name} isn't ready for that yet.`);
  if(!useAP(20)) return;
  samLog(`Took the next step with ${w.name}`); save(); render();
  const ev = firstEvent(w, firstReady(w) ? 'sheet' : 'pent'); if(ev) showEvent(ev); else closeModal();
}
// End of the week: at most one. Someone at the end of her rope first, then ladies who make the move, then the rest.
function queueFirsts(){
  const C = FIRSTS.chance, ws = shuffle(S.workers.filter(w=>firstNext(w)));
  let pickd = null;
  for(const w of ws){ if(pentUp(w) && firstReady(w, true) && Math.random() < C.pent){ pickd = [w, 'pent']; break; } }
  if(!pickd) for(const w of ws){ if(firstReady(w) && Math.random() < (w.firsts.init ? C.init : C.week)){ pickd = [w, 'week']; break; } }
  if(!pickd) return 0;
  const id = pickd[0].id, how = pickd[1];
  EVQ.push(()=>{ const x = findW(id); return x && (how==='pent' ? firstReady(x, true) : firstReady(x)) ? firstEvent(x, how) : null; });
  return 1;
}
// Bath and walk-in story beats once she and Sam are well past being embarrassed (firsts.json → relaxed).
function relaxedMishap(w, b){
  const walk = b.scene==='walkin', F = FIRSTS.relaxed[walk ? 'walkin' : 'shower'];
  return {title:b.title, scene: walk ? 'bath_walkin_relaxed' : 'bath_invite', text: fillF(pick(F.text), w), choices: F.choices};
}

/* ---------- sheet ---------- */
function firstsLine(w){
  if(!S.workers.includes(w) || !w.firsts) return '';
  const cur = w.intim||0, s = firstNext(w), blk = s ? firstBlock(w, pentUp(w)) : 'done';
  const steps = w.firsts.path.map(x=>`<span class="${x<=cur?'pink':'muted'}">${x<=cur?'♥':'♡'} ${esc(stageName(x))}</span>`).join(' → ');
  const kp = knowsPrefs(w), k = knows(w, true), P = firstPace(w);
  const why = !s ? '' : {comfort:`She isn't comfortable going that far with Sam yet.`,
    trust:`She needs to trust Sam more first${k?` (${tShow(P.trust[s-1])}${pentUp(w)?`, or ${tShow(P.trust[s-1]-FIRSTS.pentTrust)} while she's this restless`:''})`:''}.`,
    wait:'Give it a little time.'}[blk] || '';
  return `<div style="margin-top:4px">With Sam: ${steps}${kp?` <span class="muted">(${w.firsts.pace} pace${w.firsts.init?', makes the first move':''})</span>`:''}</div>`
    + (s ? (blk ? `<div class="muted">Next: ${esc(stageName(s))}. ${why}</div>` : `<div class="pink">${pentUp(w)&&!firstReady(w)?`She's restless enough not to wait.`:`She's ready for the next step.`} <button class="sm" onclick="firstFromSheet('${w.id}')">♥ Take the next step</button> <span class="muted">(1 action)</span></div>`) : '');
}
