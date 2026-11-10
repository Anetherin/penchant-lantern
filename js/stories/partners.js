'use strict';
// Romance arcs live in data/arcs.json (beats, choices and their effects). The final beat makes her Sam's lover (Devoted).
ARCS = noMeta(needData('arcs'));
// Turn a choice's declarative effects into trust/mood/lewd changes, applying the side effects (gold, Sam stats, etc.).
function resolveEff(w, c){
  let e = Object.assign({}, c);
  if(e.if){ const ok = Object.entries(e.if).every(([k,v])=>(w[k]||0) >= v); if(!ok) e = Object.assign({}, e.else||{}); }
  if(e.gold && e.gold < 0 && S.gold < -e.gold) return Object.assign({}, e.cantAfford || {res:"Sam can't afford that right now."});
  if(e.gold) S.gold += e.gold;
  if(e.sam) Object.entries(e.sam).forEach(([k,v])=>samStat(k, v));
  if(e.energy==='full') w.energy = maxEnergy(w); else if(typeof e.energy==='number') w.energy = clamp(w.energy + e.energy, 0, maxEnergy(w));
  if(e.health) w.health = clamp(w.health + e.health);
  if(e.grow) Object.entries(e.grow).forEach(([k,v])=>grow(w, k, v));
  return e;
}
function applyEff(w, e){
  if(e.t) w.trust = clamp(w.trust + e.t);
  if(e.m) moodAdd(w, e.m);
  if(e.l) w.lewd = clamp(w.lewd + e.l);
}
function evArc(w){
  const beats = ARCS[w.key]; if(!beats || !S.workers.includes(w)) return null;
  const i = w.arc||0; if(i>=beats.length) return null;
  let b = beats[i]; const last = i===beats.length-1;
  // bath / walk-in beats once they're well past being embarrassed about it (firsts.json → relaxed)
  if((b.scene==='shower' || b.scene==='walkin') && (w.intim||0) >= FIRSTS.relaxedAt) b = relaxedMishap(w, b);
  let scene = b.scene, cloth = b.cloth;
  if(b.image && scene!=='final') scene = dynScene(`arc_${w.key}_${i}`, b.image) || scene;
  // the last beat crosses her next line with Sam if she's comfortable with it; the picture shows the furthest she'd go
  const nx = last ? firstNext(w) : null, nxOk = nx && tierActs(w, nx).length;
  if(scene==='final'){ const top = nxOk ? nx : (w.intim||0), pool = getActs().filter(a=>actTier(a.id)<=top && samStance(w,a.id)!=='no');
    const act = (pool.find(a=>a.id===w.fav) || pool.sort((x,y)=>y.th-x.th)[0] || {id:'kiss'}).id; scene = 'samact:'+act; cloth = undefined; }
  return {title:`${w.name}: ${b.title} (${i+1}/${beats.length})`, who:w.id, scene, cloth, text:b.text,
    choices: b.choices.map(c=>({label:fillF(c.label, w), fx(){
      const e = resolveEff(w, c);
      applyEff(w, e);
      let res = String(e.res||'').replace(/\{N\}/g, w.name);
      w.arcWk = S.week;
      if(e.hold) return res;
      w.arc = i+1; samGainXP(last?40:15);
      if(w.arc>=4 && has(w,'Oblivious')){ w.traits = w.traits.filter(t=>t!=='Oblivious'); res += `\n\n(Something has changed in the way ${w.name} looks at Sam. Oblivious removed.)`; }
      if(last && nxOk){ w.intim = nx; w.intimWk = S.week; res += `${res?'\n\n':''}♥ ${w.name} and Sam: ${stageName(nx)}.`; addLog(`${w.name} and Sam: ${stageName(nx)}.`); }
      if(last){ w.privateCount++; if(S.sam.first) S.sam.first=false; if(!has(w,'Devoted')) w.traits.push('Devoted'); w.isPartner = true; w.wage = 0; w.contract = 999;
        res = (res?res+'\n\n':'') + `${w.name} is now Sam's lover. (Devoted: never leaves, works without wages, more willing with Sam, and her mood stays up.)`;
        const tl = awardTitles(w, 'arc', w.key); if(tl.length) res += '\n\n' + tl.join('\n'); }
      return res;
    }}))};
}
