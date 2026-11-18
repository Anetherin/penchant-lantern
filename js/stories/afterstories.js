'use strict';
/* =====================================================================
   NON-PARTNER AFTER-STORIES & JOINER ARCS
   Follow-up personal chapters for house residents (after their house
   story completes) and house-story joiners (seraphine, ilyana, ines,
   vharra). Unlike partners, these never grant Devoted.
   ===================================================================== */
AFTER_STORIES = noMeta(needData('afterstories'));

const AFTER_NEEDS = [42, 58, 72];
const AFTER_GAPS = [1, 2, 2];

function afterHomeId(w){
  if(!w || !w.key) return null;
  for(const hid of Object.keys(HOUSES)){
    if((HOUSES[hid]||{}).npc === w.key) return hid;
    if(typeof STORY_JOINS !== 'undefined' && STORY_JOINS[hid] && STORY_JOINS[hid][0] === w.key) return hid;
  }
  return null;
}
function afterHomeDone(w){
  const hid = afterHomeId(w); if(!hid) return true;
  const h = H(hid); if(!h || !STORIES[hid]) return true;
  return houseStoryDone(h);
}
function afterReady(w){
  const beats = w && AFTER_STORIES[w.key]; if(!beats || !S.workers.includes(w)) return -1;
  const i = w.after || 0; if(i >= beats.length || !afterHomeDone(w) || houseGate(w)) return -1;
  const need = AFTER_NEEDS[Math.min(i, AFTER_NEEDS.length - 1)], gap = paidGap(AFTER_GAPS[Math.min(i, AFTER_GAPS.length - 1)]);
  return (w.trust >= need && S.week - (w.afterWk || 0) >= gap) ? i : -1;
}
function evAfterStory(w){
  const beats = w && AFTER_STORIES[w.key]; if(!beats || !S.workers.includes(w)) return null;
  const i = w.after || 0; if(i >= beats.length) return null;
  const last = i === beats.length - 1;
  const b = resolveArcBeat(w, beats[i]);
  let scene = b.scene || 'casual';
  if(b.image) scene = dynScene(`after_${w.key}_${i}_${w.intim||0}`, b.image) || scene;
  return {
    title: `${w.name}: ${b.title} (${i+1}/${beats.length})`,
    who: w.id, scene, cloth: b.cloth, text: b.text,
    choices: b.choices.map(c=>({
      label: fillF(c.label, w),
      fx(){
        const e = resolveEff(w, c);
        applyEff(w, e);
        let res = String(e.res || '').replace(/\{N\}/g, w.name);
        w.afterWk = S.week;
        if(e.hold) return res;
        w.after = i + 1;
        samGainXP(last ? 25 : 15);
        let outImg = null, outAi = null, ranPrivate = false;
        const sctx = (b.scene === 'bath' || b.scene === 'shower') ? '~~bath' : '';
        if(e.private || e.acts || e.act){
          const eligible = getActs().filter(a=>canSam(w, a.id));
          const pAct = pickArcAct(w, eligible, e.acts || e.act);
          if(pAct && eligible.some(a=>a.id === pAct)){
            res = privateCore(w, pAct, {lead: res || `${w.name} closes the distance between you.`});
            outImg = {wid: w.id, scene: 'samact:' + pAct + sctx};
            outAi = {kind: 'arc', wid: w.id, act: pAct, scene: outImg.scene, forSam: true, situation: actSituation(w, pAct, e.situation || b.title)};
            ranPrivate = true;
          } else if(e.fallbackRes){
            res = String(e.fallbackRes).replace(/\{N\}/g, w.name);
          }
        }
        if(ranPrivate || outImg) return {text: res, img: outImg, ai: outAi};
        return res;
      }
    }))
  };
}
