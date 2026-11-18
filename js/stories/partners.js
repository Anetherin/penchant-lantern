'use strict';
// Romance arcs live in data/arcs.json (beats, choices and their effects). The final beat makes her Sam's lover (Devoted).
ARCS = noMeta(needData('arcs'));
// Turn a choice's declarative effects into trust/mood/lewd changes, applying the side effects (gold, Sam stats, etc.).
function resolveCond(w, cond){
  return Object.entries(cond).every(([k,v])=>{
    if(k==='canAct') return (Array.isArray(v)?v:[v]).some(id=>canSam(w, id));
    if(k==='canNext') return firstNext(w)===v && tierActs(w, v).length>0;
    if(k==='ngpp') return ((S&&S.ngppCycle)||0) >= v;
    return (w[k]||0) >= v;
  });
}
function resolveEff(w, c){
  let e = Object.assign({}, c);
  if(e.if && !resolveCond(w, e.if)) e = Object.assign({}, e.else||{});
  if(e.gold && e.gold < 0 && S.gold < -e.gold) return Object.assign({}, e.cantAfford || {res:"You can't afford that right now."});
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
function arcNgppTier(w){
  if(!S || !((S.ngppCycle||0) > 0 && (w.wasLover || (w.reborn||0) > 0))) return -1;
  return Math.min(2, Math.max(0, (w.reMet || 1) - 1));
}
function pickArcAct(w, pool, pref){
  const list = pref ? (Array.isArray(pref)?pref:[pref]).map(id=>pool.find(a=>a.id===id)).filter(Boolean) : [];
  if(list.length) return list[0].id;
  const ok = pool.filter(a=>samStance(w, a.id)!=='no');
  const chosen = ok.find(a=>isFav(w, a.id)) || ok.sort((a,b)=>b.th-a.th)[0] || pool[0];
  return chosen ? chosen.id : null;
}
function resolveArcBeat(w, base){
  let b = Object.assign({}, base), hasIntimOverride = false;
  if(base.byIntim){
    const ks = Object.keys(base.byIntim).map(Number).filter(n=>!Number.isNaN(n) && n <= (w.intim||0)).sort((a,b)=>b-a);
    for(const k of ks){
      if(k > 0 && !getActs().some(a=>actTier(a.id)<=k && canSam(w, a.id))) continue;
      // a variant's image is laid over the beat's (so it can give just a new comp / cloth / wear); without one, no story picture
      const v = base.byIntim[String(k)], img = v.image ? Object.assign({}, base.image || {}, v.image) : null;
      Object.assign(b, v);
      if(img) b.image = img; else delete b.image;
      hasIntimOverride = true;
      break;
    }
  }
  if(!hasIntimOverride && (b.scene==='shower' || b.scene==='walkin') && (w.intim||0) >= FIRSTS.relaxedAt){
    b = relaxedMishap(w, b);
  }
  const tier = arcNgppTier(w);
  if(tier >= 0 && b.ngpp){
    const isArr = Array.isArray(b.ngpp);
    const line = isArr ? b.ngpp[tier] : (b.ngpp.tiers && b.ngpp.tiers[tier]);
    const mode = isArr ? 'append' : (b.ngpp.mode || 'append');
    if(line){
      if(mode==='replace') b.text = line;
      else if(mode==='prepend') b.text = `${line}\n\n${b.text}`;
      else b.text = `${b.text}\n\n${line}`;
    }
  }
  return b;
}
function evArc(w){
  const beats = ARCS[w.key]; if(!beats || !S.workers.includes(w)) return null;
  const i = w.arc||0; if(i>=beats.length) return null;
  const last = i===beats.length-1;
  const b = resolveArcBeat(w, beats[i]);
  let scene = b.scene, cloth = b.cloth;
  if(b.image && scene!=='final') scene = dynScene(`arc_${w.key}_${i}_${w.intim||0}`, b.image) || scene;
  // the last beat crosses her next line with Sam if she's comfortable with it; the picture shows the furthest she'd go
  const nx = last ? firstNext(w) : null, nxOk = nx && tierActs(w, nx).length;
  if(scene==='final'){ const top = nxOk ? nx : (w.intim||0), pool = getActs().filter(a=>actTier(a.id)<=top && samStance(w,a.id)!=='no');
    const act = (pool.find(a=>isFav(w,a.id)) || pool.sort((x,y)=>y.th-x.th)[0] || {id:'kiss'}).id; scene = 'samact:'+act; cloth = undefined; }
  return {title:`${w.name}: ${b.title} (${i+1}/${beats.length})`, who:w.id, scene, cloth, text:b.text,
    choices: b.choices.map(c=>({label:fillF(c.label, w), fx(){
      const e = resolveEff(w, c);
      applyEff(w, e);
      let res = String(e.res||'').replace(/\{N\}/g, w.name);
      w.arcWk = S.week;
      if(e.hold) return res;
      w.arc = i+1; samGainXP(last?40:15);
      let outImg = null, outAi = null, ranPrivate = false;
      const sctx = (b.scene==='bath' || b.scene==='shower') ? '~~bath' : '';
      const crossStage = !last && e.cross ? firstNext(w) : null;
      if(crossStage && (e.cross === true || e.cross === crossStage)){
        const tPool = tierActs(w, crossStage);
        const cAct = pickArcAct(w, tPool, e.acts || e.act);
        if(cAct){
          w.intim = crossStage; w.intimWk = S.week;
          res = privateCore(w, cAct, {lead: res || `${w.name} pulls you close.`, first:true});
          res += `\n\n♥ ${w.name} and Sam: ${stageName(crossStage)}.`;
          addLog(`${w.name} and Sam: ${stageName(crossStage)}.`);
          outImg = {wid:w.id, scene:'samact:'+cAct+sctx};
          outAi = {kind:'arc', wid:w.id, act:cAct, scene:outImg.scene, forSam:true, situation: actSituation(w, cAct, e.situation || b.title)};
          ranPrivate = true;
        }
      } else if(!last && (e.private || e.acts || e.act)){
        const eligible = getActs().filter(a=>canSam(w, a.id));
        const pAct = pickArcAct(w, eligible, e.acts || e.act);
        if(pAct){
          res = privateCore(w, pAct, {lead: res || `${w.name} closes the distance between you.`});
          outImg = {wid:w.id, scene:'samact:'+pAct+sctx};
          outAi = {kind:'arc', wid:w.id, act:pAct, scene:outImg.scene, forSam:true, situation: actSituation(w, pAct, e.situation || b.title)};
          ranPrivate = true;
        } else if(e.fallbackRes){
          res = String(e.fallbackRes).replace(/\{N\}/g, w.name);
        }
      }
      if(w.arc>=4 && has(w,'Oblivious')){ w.traits = w.traits.filter(t=>t!=='Oblivious'); res += `\n\n(Something has changed in the way ${w.name} looks at Sam. Oblivious removed.)`; }
      if(last && nxOk){ w.intim = nx; w.intimWk = S.week; }
      if(last){
        const fPool = getActs().filter(a=>actTier(a.id)<=(w.intim||0) && canSam(w, a.id));
        const fAct = pickArcAct(w, fPool, e.acts || e.act);
        if(fAct){
          const lead = res || fillF(b.goLead || `${w.name} pulls you into her arms as the door clicks shut behind you both.`, w);
          res = privateCore(w, fAct, {lead, first: !!nxOk});
          outImg = {wid:w.id, scene:'samact:'+fAct};
          outAi = {kind:'arc', wid:w.id, act:fAct, scene:outImg.scene, forSam:true, situation: actSituation(w, fAct, b.title)};
          ranPrivate = true;
        } else {
          w.privateCount++; if(S.sam.first) S.sam.first=false;
        }
        if(nxOk){ res += `${res?'\n\n':''}♥ ${w.name} and Sam: ${stageName(nx)}.`; addLog(`${w.name} and Sam: ${stageName(nx)}.`); }
        if(!has(w,'Devoted')) w.traits.push('Devoted'); w.isPartner = true; w.wage = 0; w.contract = 999;
        res = (res?res+'\n\n':'') + `${w.name} is now Sam's lover. (Devoted: never leaves, works without wages, more willing with Sam, and her mood stays up.)`;
        const tl = awardTitles(w, 'arc', w.key); if(tl.length) res += '\n\n' + tl.join('\n');
      }
      if(ranPrivate || outImg) return {text:res, img:outImg, ai:outAi};
      return res;
    }}))};
}
