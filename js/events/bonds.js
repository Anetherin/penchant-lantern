'use strict';
/* =====================================================================
   BONDS BETWEEN THE LADIES
   S.bonds["idA|idB"] = {v: -100..100, kind?, from?}  (from = mentor's id for one-way kinds)
   Events and shared scenes are defined in data/bonds.json; this file checks requirements and applies effects.
   ===================================================================== */
const BONDS = needData('bonds');
const bkey = (a,b) => [a.id,b.id].sort().join('|');
const bondOf = (a,b) => (S.bonds||{})[bkey(a,b)] || {v:0};
const bondV = (a,b) => bondOf(a,b).v;
function addBond(a, b, n){
  if(!a || !b || a===b || !n) return;
  S.bonds = S.bonds || {}; const k = bkey(a,b), o = S.bonds[k] || (S.bonds[k] = {v:0});
  o.v = Math.max(-100, Math.min(100, o.v + n));
}
// named ladies' starting bonds (characters.json → bonds), applied once both are on the roster
function seedBonds(){
  S.bonds = S.bonds || {};
  S.workers.forEach(a=>{ const seeds = a.key && NAMED[a.key] && NAMED[a.key].bonds; if(!seeds) return;
    Object.entries(seeds).forEach(([ok, s])=>{ const b = S.workers.find(x=>x.key===ok); if(!b) return;
      const k = bkey(a,b); if(S.bonds[k] && S.bonds[k].seeded) return;
      S.bonds[k] = {v: s.v||0, seeded:true}; if(s.kind){ S.bonds[k].kind = s.kind; S.bonds[k].from = a.id; } }); });
}
// weekly drift: housemates warm up (or grate on each other); bonds between ladies in different houses fade slowly
function driftBonds(){
  const D = BONDS.drift, W = S.workers;
  for(let i=0;i<W.length;i++) for(let j=i+1;j<W.length;j++){
    const a = W[i], b = W[j];
    if(a.house===b.house){
      let n = D.sameHouse * Math.random();
      if(BONDS.warm.includes(a.personality) && BONDS.warm.includes(b.personality)) n += D.warmPair;
      if(BONDS.prickly.includes(a.personality) && BONDS.prickly.includes(b.personality)) n += D.pricklyPair;
      addBond(a, b, n);
    } else { const o = bondOf(a,b); if(o.v && !o.kind) addBond(a, b, o.v>0 ? -D.decayDifferentHouse : D.decayDifferentHouse); }
  }
}
// how she's connected to the others, for her sheet
function bondLines(w){
  const out = [];
  S.workers.forEach(o=>{ if(o===w) return; const b = bondOf(w,o);
    if(b.kind && BONDS.kinds[b.kind]){ const K = BONDS.kinds[b.kind]; out.push(`${b.from===w.id ? K.from : K.to} ${o.name}`); }
    const L = BONDS.labels.find(l=>(l.min!==undefined && b.v>=l.min) || (l.max!==undefined && b.v<=l.max));
    if(L && !(b.kind && b.v>=0)) out.push(`${L.label} ${o.name}`);
  });
  return out;
}

/* ---------- requirements ---------- */
function bondReqOK(w, r){
  r = r || {};
  if(r.devoted!==undefined && has(w,'Devoted')!==r.devoted) return false;
  if(r.trustMin!==undefined && w.trust < r.trustMin) return false;
  if(r.lewdMin!==undefined && w.lewd < r.lewdMin) return false;
  if(r.moodMin!==undefined && w.mood < r.moodMin) return false;
  if(r.moodBelow!==undefined && w.mood >= r.moodBelow) return false;
  if(r.lustMin!==undefined && (w.lust||0) < r.lustMin) return false;
  if(r.energyBelow!==undefined && w.energy >= maxEnergy(w)*r.energyBelow) return false;
  if(r.energyAbove!==undefined && w.energy < maxEnergy(w)*r.energyAbove) return false;
  if(r.working && w.job==='rest') return false;
  if(r.intimate && !bestSamAct(w)) return false;
  return r.energyBelow!==undefined || w.energy >= maxEnergy(w)*0.15;
}
function bondPairOK(d, a, b){
  if(a===b) return false;
  if(d.sameHouse!==false && a.house!==b.house) return false;
  const o = bondOf(a,b);
  if(d.bondMin!==undefined && o.v < d.bondMin) return false;
  if(d.bondMax!==undefined && o.v > d.bondMax) return false;
  if(d.dynamic==='lesson' && !getActs().some(x=>canSam(a,x.id) && canSam(b,x.id) && actSkill(a,x.id) > actSkill(b,x.id))) return false;
  if(d.kind){ if(o.kind!==d.kind) return false; if(d.kind==='mentor' && o.from!==a.id) return false; }
  return bondReqOK(a, d.a) && bondReqOK(b, d.b);
}
function bondCandidates(list){
  const out = [];
  list.forEach(d=>S.workers.forEach(a=>S.workers.forEach(b=>{ if(bondPairOK(d,a,b)) out.push({d, a, b}); })));
  return out;
}
// one bond event or shared scene per week at most
function queueBondEvents(){
  const pools = [];
  if(Math.random() < BONDS.sharedChance) pools.push(BONDS.shared);
  if(Math.random() < BONDS.eventChance) pools.push(BONDS.events);
  for(const list of pools){
    const c = bondCandidates(list); if(!c.length) continue;
    const p = weighted(c, x=>x.d.weight||1), id = p.d.id, ai = p.a.id, bi = p.b.id, shared = list===BONDS.shared;
    EVQ.push(()=>evBond(id, ai, bi, shared)); return 1;
  }
  return 0;
}

/* ---------- the event ---------- */
const bondFill = (t, a, b) => String(Array.isArray(t) ? pick(t) : (t||'')).replace(/\{a\}/g, a.name).replace(/\{b\}/g, b.name);
function evBond(id, aId, bId, shared){
  const d = (shared ? BONDS.shared : BONDS.events).find(x=>x.id===id), a = findW(aId), b = findW(bId);
  if(!d || !a || !b || !bondPairOK(d, a, b)) return null;
  const choices = [];
  d.choices.filter(c=>!c.needsGold || S.gold >= c.needsGold).forEach(c=>{
    if(!c.acts) return choices.push({label:bondFill(c.label, a, b), fx(){ return applyBondChoice(c, a, b, d); }});
    // one choice per service both of them will do with Sam
    duoActs(a, b).filter(act=>d.dynamic!=='lesson' || actSkill(a,act) > actSkill(b,act)).forEach(act=>{
      const st = [a,b].filter(w=>samStance(w,act)==='ask').map(w=>w.name.split(' ')[0]);
      choices.push({label: actLabel(act) + (st.length ? ` (a stretch for ${st.join(' and ')})` : ''), fx(){ return applyBondChoice(c, a, b, d, act); }});
    });
  });
  if(!choices.length) return null;
  return {title:bondFill(d.title, a, b), who:a.id, scene:d.scene||'casual', text:bondFill(d.text, a, b), choices};
}
function bondFx(w, e, partner){
  if(!e) return;
  if(e.mood) moodAdd(w, e.mood);
  if(e.trust) { if(e.trust>0) gainTrust(w, e.trust); else w.trust = clamp(w.trust + e.trust); }
  if(e.lewd) w.lewd = clamp(w.lewd + e.lewd);
  if(e.lust) w.lust = clamp((w.lust||0) + e.lust);
  if(e.energy) w.energy = clamp(w.energy + e.energy, 0, maxEnergy(w));
  if(e.popularity) w.popularity = clamp(w.popularity + e.popularity);
  if(e.grow) Object.entries(e.grow).forEach(([k,n])=>grow(w, k, n));
  if(e.lesson && partner){ const act = bestSamAct(partner) || partner.fav; if(act && w.acts[act]) growAct(w, act, 6); }
}
// services both will do with Sam, best-liked first
const duoActs = (a, b) => getActs().filter(x=>canSam(a,x.id) && canSam(b,x.id)).map(x=>x.id)
  .sort((x,y)=>((samStance(a,y)==='yes')+(samStance(b,y)==='yes')) - ((samStance(a,x)==='yes')+(samStance(b,x)==='yes')));
const dynLine = (dyn, act, a, b) => { const D = (BONDS.dynamics||{})[dyn] || {}; return bondFill(String(byAct(D, act) || D._default || ''), a, b).replace(/\{act\}/g, actLabel(act||'')); };
// what the bond dynamic adds on top of the choice's own effects
function dynamicFx(dyn, act, a, b){
  const fn = w => w.name.split(' ')[0];
  if(dyn==='collaborative'){ addBond(a, b, 6); [a,b].forEach(w=>{ if(w.fav===act) moodAdd(w, 4); }); return ''; }
  if(dyn==='competitive'){
    const sa = s100(actSkill(a,act)) + rnd(0,25), sb = s100(actSkill(b,act)) + rnd(0,25), C = BONDS.competition || {};
    if(Math.abs(sa-sb) < 8){ addBond(a, b, 8); return C.close || ''; }
    const [W, L] = sa > sb ? [a,b] : [b,a]; moodAdd(W, 5); moodAdd(L, -3); growAct(L, act, 3); addBond(a, b, -4);
    return String(C.win||'').replace(/\{w\}/g, fn(W)).replace(/\{l\}/g, fn(L));
  }
  if(dyn==='lesson'){ growAct(b, act, 8); growAct(a, act, 2); addBond(a, b, 5); return `(${fn(b)} improves at ${actLabel(act)}.)`; }
  if(dyn==='curious'){ gainTrust(b, 5); if(samStance(b,act)==='ask') lewdUp(b, 3, svcLewdCap(act,'sam') + BAL.lewd.stretchCap); addBond(a, b, 6); return ''; }
  return '';
}
function applyBondChoice(c, a, b, d, chosenAct){
  if(c.roll!==undefined && Math.random() >= c.roll && c.else) c = Object.assign({}, c.else);
  if(c.gold) S.gold += c.gold;
  if(c.rep){ const h = houseOf(a); if(h) h.rep = clamp(h.rep + c.rep); }
  if(c.samEnergy) S.sam.energy = clamp(S.sam.energy + c.samEnergy);
  if(c.sam) Object.entries(c.sam).forEach(([k,n])=>samStat(k, n));
  bondFx(a, c.a, b); bondFx(b, c.b, a);
  if(c.bond) addBond(a, b, c.bond);
  let text = bondFill(c.res, a, b), img = null, ai = null;
  const dyn = chosenAct && d.dynamic;
  if(dyn){ const line = dynLine(dyn, chosenAct, a, b); if(line) text = line + '\n\n' + text; }
  if(c.private && c.private.length){
    const notes = c.private.map(r=>{ const w = r==='a' ? a : b, act = chosenAct || bestSamAct(w); if(!act || !canSam(w,act)) return ''; const t = privateCore(w, act); return `${w.name.split(' ')[0]}: ${t.split('\n\n').pop()}`; }).filter(Boolean);
    if(dyn){ const extra = dynamicFx(dyn, chosenAct, a, b); if(extra) text += '\n\n' + extra; }
    if(notes.length) text += '\n\n' + notes.join('\n');
    samLog(`A night with ${a.name} and ${b.name}`);
    const act = chosenAct || bestSamAct(a);
    if(act){ const sc = chosenAct ? `duo:${act}:${b.id}${dyn?':'+dyn:''}` : 'samact:'+act; img = {wid:a.id, scene:sc};
      if(d.ai) ai = {kind:d.ai, wid:a.id, other:b.id, act, scene:sc, forSam:true, dynamic: dyn ? ((BONDS.dynamics[dyn]||{}).prompt||'') : ''}; }
  } else if(d.ai){ ai = {kind:d.ai, wid:a.id, other:b.id, scene:d.scene||'casual'}; }
  return {text, img, ai};
}
