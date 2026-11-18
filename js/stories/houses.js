'use strict';
/* =====================================================================
   HOUSE STORYLINES — one unique story per house: three chapters here, plus a
   lighter second chapter and an epilogue from house-extras.js (five in all).
   Chapters trigger as the house's popularity grows (STORY_REP in house-extras.js).
   A failed check just means the chapter comes back a few weeks later.
   All chapter text lives in data/housestories/ (lead-in pages, choice page, hint, labels, results; fetched with HT()
   below); the checks, costs and effects stay here.
   ===================================================================== */
// data/housestories/: per house id one entry per chapter {pages, hint, text, choices:{id:{label, res|win|lose|...}}}, plus
// titles{} and common{}. HT(h, b, path, vars) = text at a dotted path of chapter b (a list picks one at random); {resident},
// {first}, {house}, {loc} are filled automatically, anything else comes from vars. HC(path, vars) = same for common{}.
const HSTORY = noMeta(needData('housestories'));
const storyTitle = id => (HSTORY.titles || {})[id] || id;
const storyHints = id => (HSTORY[id] || []).map(c => c.hint || '');
function textFill(t, ctx, vars){
  if(Array.isArray(t)) t = t[Math.floor(Math.random()*t.length)];
  if(typeof t !== 'string') return '';
  return t.replace(/\{(\w+)\}/g, (m, k) => vars && vars[k] !== undefined ? vars[k] : ctx && ctx[k] !== undefined ? ctx[k] : m);
}
function HT(h, b, path, vars){
  let t = (HSTORY[h.id] || [])[b]; path.split('.').forEach(k => { t = t == null ? t : t[k]; });
  const R = resident(h);
  return textFill(t, {resident:RN(h), first:R ? R.name.split(' ')[0] : '', house:h.name, loc:(HOUSES[h.id]||{}).loc || 'Hollowmere'}, vars);
}
function HC(path, vars){ let t = HSTORY.common; path.split('.').forEach(k => { t = t == null ? t : t[k]; }); return textFill(t, null, vars); }
const pct = (v,dc) => clamp(Math.round(55 + (v + ((S&&S.sam.lvl)||1)*2 - 2 - dc)*1.4), 15, 95);
const rollP = p => Math.random()*100 < p;
const resident = h => S.workers.find(w=>w.key===HOUSES[h.id].npc);
const secOf = h => Math.max(0, ...S.workers.filter(w=>w.house===h.id && w.job==='security').map(w=>s100(w.tech.combat) + s100(statOf(w,'strength'))*0.3 + fxAdd(w,'security')));
function storyAdvance(h, xp=40){
  h.story.beat++; h.story.wk = S.week; samGainXP(xp);
  if(houseStoryDone(h)){ const R = resident(h); if(R) EV_NOTES.push(...awardTitles(R, 'house', h.id)); }   // data/titles.json → house
}
const storyGap = h => BAL.houseGate.gap[Math.min(h.story.beat, BAL.houseGate.gap.length-1)];
// A failed check comes back after houseGate.retry weeks (the wait check is week - story.wk >= gap, so shift wk by the difference).
function storyRetry(h){ h.story.wk = S.week + BAL.houseGate.retry - storyGap(h); }
function check(label, stat, val, dc, win, lose){ const p = pct(val,dc); return {label:`${label} [${stat} ${p}%]`, fx(){ return rollP(p) ? win() : lose(); }}; }
function pay(label, cost, h, win){ return {label:`${label} (${fmt(cost)})`, fx(){ if(S.gold<cost){ storyRetry(h); return HC('cantAfford'); } S.gold-=cost; return win(); }}; }
function freeResident(h){ const R = resident(h); if(!R) return ''; R.free = true; R.wage = 0; R.contract = 999; R.trust = clamp(R.trust+15); if(!has(R,'Loyal')) R.traits.push('Loyal'); return HC('freeResident', {name:R.name}); }
function joinNamed(key, h, free){
  if(isHired(key)) return '';
  const w = rebirthNamed(makeNamed(key)); w.house = h.id; w.locked = h.id; w.contract = 999; w.trust = clamp(w.trust+20);
  if(free){ w.free = true; w.wage = 0; w.contract = 999; }
  S.workers.push(w); assignStart(w, NAMED[key].job); delete NPCS['n_'+key]; checkUnlocks(true);
  return HC(free ? 'joinsFree' : 'joins', {name:w.name, house:h.name});
}
// Ladies a house story brings in for good (joinNamed in its last beat): house id -> [key, free]. NG+ treats them like the
// house's resident: they come back with a kept house whose story is done (ngplus.js houseLadies / residentHouse).
const STORY_JOINS = {castle:['seraphine', true], hollow:['ines', false], pavilion:['ilyana', true], veil:['vharra', false]};
const RN = h => { const R = resident(h); return R ? R.name : 'the staff'; };
const RID = h => { const R = resident(h); return R ? R.id : null; };
const SSTR = h => Math.max(S.sam.strength, secOf(h));
function housePrivate(R, acts, lead, situation, extra, ctx){
  const list = Array.isArray(acts) ? acts : [acts];
  const ok = R ? list.filter(id=>canSam(R, id) && samStance(R, id)!=='no') : [];
  const act = R && (ok[0] || bestSamAct(R));
  if(!R || !act) return lead + (extra ? `\n\n${extra}` : '');
  const text = privateCore(R, act, {lead}) + (extra ? `\n\n${extra}` : '');
  const sc = 'samact:'+act + (ctx ? '~~'+ctx : '');
  return {text, img:{wid:R.id, scene:sc}, ai:{kind:'private', wid:R.id, act, scene:sc, forSam:true, situation: actSituation(R, act, situation)}};
}
const STORIES = {
  lantern:{title:storyTitle('lantern'), hint:storyHints('lantern'), beats:[
    h=>({who:'npc_silas', text:HT(h,0,'text'), choices:[
      pay(HT(h,0,'choices.pay.label'), 200, h, ()=>{ storyAdvance(h,20); return HT(h,0,'choices.pay.res'); }),
      check(HT(h,0,'choices.throw.label'),'Strength',SSTR(h),35, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+2); return HT(h,0,'choices.throw.win'); }, ()=>{ S.sam.energy=Math.max(0,S.sam.energy-30); storyRetry(h); return HT(h,0,'choices.throw.lose'); }),
      check(HT(h,0,'choices.talk.label'),'Charm',S.sam.charm,38, ()=>{ storyAdvance(h); return HT(h,0,'choices.talk.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.talk.lose'); })]}),
    h=>({who:RID(h), scene:'job_madame', text:HT(h,2,'text'), choices:[
      check(HT(h,2,'choices.self.label'),'Business',S.sam.business,45, ()=>{ S.gold+=600; storyAdvance(h); return HT(h,2,'choices.self.win'); }, ()=>{ storyRetry(h); return HT(h,2,'choices.self.lose'); }),
      check(HT(h,2,'choices.delegate.label'),'Management',resident(h)?s100(resident(h).tech.manage):0,50, ()=>{ S.gold+=600; storyAdvance(h); return HT(h,2,'choices.delegate.win'); }, ()=>{ storyRetry(h); return HT(h,2,'choices.delegate.lose'); })]}),
    h=>({who:'npc_silas', text:HT(h,3,'text'), choices:[
      check(HT(h,3,'choices.watch.label'),'Business',S.sam.business,55, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+5); return HT(h,3,'choices.watch.win') + freeResident(h); }, ()=>{ storyRetry(h); return HT(h,3,'choices.watch.lose'); }),
      check(HT(h,3,'choices.door.label'),'Strength',SSTR(h),60, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+5); return HT(h,3,'choices.door.win') + freeResident(h); }, ()=>{ S.sam.energy=0; storyRetry(h); return HT(h,3,'choices.door.lose'); }),
      check(HT(h,3,'choices.deal.label'),'Charm',S.sam.charm,55, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+5); return HT(h,3,'choices.deal.win') + freeResident(h); }, ()=>{ storyRetry(h); return HT(h,3,'choices.deal.lose'); })]})
  ]},
  castle:{title:storyTitle('castle'), hint:storyHints('castle'), beats:[
    h=>({who:storyNpc('seraphine'), text:HT(h,0,'text'), choices:[
      {label:HT(h,0,'choices.stay.label'), fx(){ storyAdvance(h); return HT(h,0,'choices.stay.res'); }},
      check(HT(h,0,'choices.tea.label'),'Charm',S.sam.charm,40, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+2); return HT(h,0,'choices.tea.win'); }, ()=>{ storyAdvance(h); return HT(h,0,'choices.tea.lose'); })]}),
    h=>({who:'npc_gerhardt', text:HT(h,2,'text'), choices:[
      check(HT(h,2,'choices.humiliate.label'),'Charm',S.sam.charm,55, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+4); return HT(h,2,'choices.humiliate.win'); }, ()=>{ storyRetry(h); return HT(h,2,'choices.humiliate.lose'); }),
      pay(HT(h,2,'choices.buy.label'), 1500, h, ()=>{ storyAdvance(h); return HT(h,2,'choices.buy.res'); }),
      check(HT(h,2,'choices.escort.label'),'Strength',SSTR(h),60, ()=>{ storyAdvance(h); h.rep=clamp(h.rep-2); return HT(h,2,'choices.escort.win'); }, ()=>{ storyRetry(h); return HT(h,2,'choices.escort.lose'); })]}),
    h=>({who:storyNpc('seraphine'), text:HT(h,3,'text'), choices:[
      {label:HT(h,3,'choices.welcome.label'), fx(){ storyAdvance(h,60); h.rep=clamp(h.rep+5); return HT(h,3,'choices.welcome.res') + joinNamed('seraphine', h, true); }}]})
  ]},
  onsen:{title:storyTitle('onsen'), hint:storyHints('onsen'), beats:[
    h=>({who:RID(h), scene:'job_bath', text:HT(h,0,'text'), choices:[
      check(HT(h,0,'choices.hike.label'),'Strength',S.sam.strength,30, ()=>{ storyAdvance(h); return HT(h,0,'choices.hike.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.hike.lose'); }),
      check(HT(h,0,'choices.regulars.label'),'Charm',S.sam.charm,34, ()=>{ storyAdvance(h); return HT(h,0,'choices.regulars.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.regulars.lose'); })]}),
    h=>({who:'npc_kurogane', text:HT(h,2,'text'), choices:[
      check(HT(h,2,'choices.claim.label'),'Business',S.sam.business,50, ()=>{ storyAdvance(h); return HT(h,2,'choices.claim.win'); }, ()=>{ storyRetry(h); return HT(h,2,'choices.claim.lose'); }),
      check(HT(h,2,'choices.dam.label'),'Strength',SSTR(h),55, ()=>{ storyAdvance(h); return HT(h,2,'choices.dam.win'); }, ()=>{ storyRetry(h); return HT(h,2,'choices.dam.lose'); }),
      check(HT(h,2,'choices.share.label'),'Charm',S.sam.charm,50, ()=>{ storyAdvance(h); return HT(h,2,'choices.share.win'); }, ()=>{ storyRetry(h); return HT(h,2,'choices.share.lose'); })]}),
    h=>({who:RID(h), scene:'job_bath', text:HT(h,3,'text'), choices:[
      pay(HT(h,3,'choices.festival.label'), 300, h, ()=>{ storyAdvance(h,60); h.bonus.demand = 1.25; h.rep=clamp(h.rep+5); return HT(h,3,'choices.festival.res') + freeResident(h); }),
      {label:HT(h,3,'choices.later.label'), fx(){ storyRetry(h); return HT(h,3,'choices.later.res'); }}]})
  ]},
  hollow:{title:storyTitle('hollow'), hint:storyHints('hollow'), beats:[
    h=>({who:storyNpc('ines'), text:HT(h,0,'text'), choices:[
      check(HT(h,0,'choices.bar.label'),'Strength',S.sam.strength,32, ()=>{ storyAdvance(h); return HT(h,0,'choices.bar.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.bar.lose'); }),
      check(HT(h,0,'choices.wait.label'),'Charm',S.sam.charm,36, ()=>{ storyAdvance(h); return HT(h,0,'choices.wait.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.wait.lose'); }),
      {label:HT(h,0,'choices.try.label'), fx(){ storyAdvance(h); const R=resident(h); if(R) R.trust=clamp(R.trust-5); return HT(h,0,'choices.try.res'); }}]}),
    h=>({who:RID(h), scene:'casual', text:HT(h,2,'text'), choices:[
      S.sam.appraisal>=2 ? {label:HT(h,2,'choices.appraisal.label'), fx(){ storyAdvance(h); return HT(h,2,'choices.appraisal.res'); }}
        : check(HT(h,2,'choices.archives.label'),'Business',S.sam.business,50, ()=>{ storyAdvance(h); return HT(h,2,'choices.archives.win'); }, ()=>{ storyRetry(h); return HT(h,2,'choices.archives.lose'); })]}),
    h=>({who:storyNpc('ines'), text:HT(h,3,'text'), choices:[
      {label:HT(h,3,'choices.welcome.label'), fx(){ storyAdvance(h,60); h.rep=clamp(h.rep+4); return HT(h,3,'choices.welcome.res') + freeResident(h) + joinNamed('ines', h, false); }}]})
  ]},
  tankard:{title:storyTitle('tankard'), hint:storyHints('tankard'), beats:[
    h=>({who:'npc_borgrum', text:HT(h,0,'text'), choices:[
      {label:HT(h,0,'choices.host.label'), fx(){ storyAdvance(h); return HT(h,0,'choices.host.res'); }},
      {label:HT(h,0,'choices.talkdown.label'), fx(){ const R=resident(h); if(R) moodAdd(R, -10); storyRetry(h); return HT(h,0,'choices.talkdown.res'); }}]}),
    h=>({who:RID(h), scene:'job_bartender', text:HT(h,2,'text'), choices:[
      pay(HT(h,2,'choices.moonhops.label'), 200, h, ()=>{ h.story.prep = 20; storyAdvance(h); return HT(h,2,'choices.moonhops.res'); }),
      {label:HT(h,2,'choices.trust.label'), fx(){ storyAdvance(h); return HT(h,2,'choices.trust.res'); }}]}),
    h=>{ const R=resident(h), v=(R?s100(R.tech.bar):30)+(h.story.prep||0)+S.sam.charm/4; return {who:'npc_borgrum', text:HT(h,3,'text'), choices:[
      check(HT(h,3,'choices.raise.label'),HT(h,3,'choices.raise.stat'),v,70, ()=>{ storyAdvance(h,60); h.bonus.bar = 1.5; h.rep=clamp(h.rep+6); return HT(h,3,'choices.raise.win') + freeResident(h); }, ()=>{ h.rep=clamp(h.rep+2); storyRetry(h); return HT(h,3,'choices.raise.lose'); })]}; }
  ]},
  pavilion:{title:storyTitle('pavilion'), hint:storyHints('pavilion'), beats:[
    h=>({who:storyNpc('ilyana'), text:HT(h,0,'text'), choices:[
      check(HT(h,0,'choices.talk.label'),'Charm',S.sam.charm,40, ()=>{ storyAdvance(h); return HT(h,0,'choices.talk.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.talk.lose'); }),
      check(HT(h,0,'choices.dance.label'),'Dance',resident(h)?s100(resident(h).tech.dance):30,55, ()=>{ storyAdvance(h); return HT(h,0,'choices.dance.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.dance.lose'); })]}),
    h=>({who:'npc_valois', text:HT(h,2,'text'), choices:[
      check(HT(h,2,'choices.premiere.label'),'Dance',(resident(h)?s100(resident(h).tech.dance):30)+(h.up.stage?10:0),70, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+5); return HT(h,2,'choices.premiere.win'); }, ()=>{ h.rep=clamp(h.rep-2); storyRetry(h); return HT(h,2,'choices.premiere.lose'); })]}),
    h=>({who:storyNpc('ilyana'), text:HT(h,3,'text'), choices:[
      {label:HT(h,3,'choices.welcome.label'), fx(){ storyAdvance(h,60); h.bonus.demand = 1.15; return HT(h,3,'choices.welcome.res') + joinNamed('ilyana', h, true); }}]})
  ]},
  veil:{title:storyTitle('veil'), hint:storyHints('veil'), beats:[
    h=>({who:storyNpc('vharra'), text:HT(h,0,'text'), choices:[
      pay(HT(h,0,'choices.pay.label'), 400, h, ()=>{ storyAdvance(h,20); return HT(h,0,'choices.pay.res'); }),
      check(HT(h,0,'choices.flirt.label'),'Charm',S.sam.charm,55, ()=>{ storyAdvance(h); return HT(h,0,'choices.flirt.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.flirt.lose'); }),
      check(HT(h,0,'choices.refuse.label'),'Strength',SSTR(h),55, ()=>{ storyAdvance(h); return HT(h,0,'choices.refuse.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.refuse.lose'); })]}),
    h=>({who:RID(h), scene:'job_security', text:HT(h,2,'text'), choices:[
      check(HT(h,2,'choices.hold.label'),'Security',secOf(h)+S.sam.strength/3,55, ()=>{ storyAdvance(h); return HT(h,2,'choices.hold.win'); }, ()=>{ h.rep=clamp(h.rep-3); storyRetry(h); return HT(h,2,'choices.hold.lose'); })]}),
    h=>({who:storyNpc('vharra'), text:HT(h,3,'text'), choices:[
      {label:HT(h,3,'choices.hire.label'), fx(){ storyAdvance(h,60); h.bonus.upkeep = 0.7; return HT(h,3,'choices.hire.res') + joinNamed('vharra', h, false) + freeResident(h); }}]})
  ]},
  wayfarer:{title:storyTitle('wayfarer'), hint:storyHints('wayfarer'), beats:[
    h=>({who:RID(h), scene:'job_reception', text:HT(h,0,'text'), choices:[
      pay(HT(h,0,'choices.guards.label'), 300, h, ()=>{ storyAdvance(h); return HT(h,0,'choices.guards.res'); }),
      check(HT(h,0,'choices.ride.label'),'Strength',S.sam.strength,40, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+2); return HT(h,0,'choices.ride.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.ride.lose'); })]}),
    h=>({who:RID(h), scene:'job_reception', text:HT(h,2,'text'), choices:[
      check(HT(h,2,'choices.network.label'),'Hospitality',resident(h)?s100(resident(h).tech.service):30,55, ()=>{ storyAdvance(h); return HT(h,2,'choices.network.win'); }, ()=>{ storyRetry(h); return HT(h,2,'choices.network.lose'); }),
      check(HT(h,2,'choices.money.label'),'Business',S.sam.business,50, ()=>{ storyAdvance(h); return HT(h,2,'choices.money.win'); }, ()=>{ storyRetry(h); return HT(h,2,'choices.money.lose'); })]}),
    h=>({who:'npc_oskar', text:HT(h,3,'text'), choices:[
      check(HT(h,3,'choices.storm.label'),'Strength',SSTR(h)+10,60, ()=>{ storyAdvance(h,60); h.bonus.merchant = 1.3; h.rep=clamp(h.rep+5); return HT(h,3,'choices.storm.win') + freeResident(h); }, ()=>{ storyRetry(h); return HT(h,3,'choices.storm.lose'); }),
      check(HT(h,3,'choices.work.label'),'Charm',S.sam.charm,60, ()=>{ storyAdvance(h,60); h.bonus.merchant = 1.3; h.rep=clamp(h.rep+5); return HT(h,3,'choices.work.win') + freeResident(h); }, ()=>{ storyRetry(h); return HT(h,3,'choices.work.lose'); })]})
  ]},
  sanctuary:{title:storyTitle('sanctuary'), hint:storyHints('sanctuary'), beats:[
    h=>({who:RID(h), scene:'job_chapel', text:HT(h,0,'text'), choices:[
      check(HT(h,0,'choices.precedent.label'),'Business',S.sam.business,45, ()=>{ storyAdvance(h); return HT(h,0,'choices.precedent.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.precedent.lose'); }),
      pay(HT(h,0,'choices.donate.label'), 300, h, ()=>{ storyAdvance(h); return HT(h,0,'choices.donate.res'); })]}),
    h=>({who:RID(h), scene:'casual', text:HT(h,2,'text'), choices:[
      check(HT(h,2,'choices.mystique.label'),'Charm',S.sam.charm,50, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+4); return HT(h,2,'choices.mystique.win'); }, ()=>{ storyRetry(h); return HT(h,2,'choices.mystique.lose'); })]}),
    h=>({who:RID(h), scene:'job_chapel', text:HT(h,3,'text'), choices:[
      check(HT(h,3,'choices.confession.label'),'Charm',S.sam.charm,55, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+6); return HT(h,3,'choices.confession.win') + freeResident(h); }, ()=>{ storyRetry(h); return HT(h,3,'choices.confession.lose'); })]})
  ]},
  atelier:{title:storyTitle('atelier'), hint:storyHints('atelier'), beats:[
    h=>({who:RID(h), scene:'casual', text:HT(h,0,'text'), choices:[
      S.sam.appraisal>=2 ? {label:HT(h,0,'choices.appraisal.label'), fx(){ storyAdvance(h); return HT(h,0,'choices.appraisal.res'); }}
        : check(HT(h,0,'choices.conduit.label'),'Technique',S.sam.technique,45, ()=>{ storyAdvance(h); return HT(h,0,'choices.conduit.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.conduit.lose'); })]}),
    h=>({who:'npc_thackery', scene:'portrait', text:HT(h,2,'text'), choices:[
      check(HT(h,2,'choices.law.label'),'Business',S.sam.business,55, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+4); return HT(h,2,'choices.law.win'); }, ()=>{ storyRetry(h); return HT(h,2,'choices.law.lose'); }),
      pay(HT(h,2,'choices.patent.label'), 500, h, ()=>{ storyAdvance(h); return HT(h,2,'choices.patent.res'); })]}),
    h=>({who:RID(h), scene:'portrait', text:HT(h,3,'text'), choices:[
      {label:HT(h,3,'choices.toast.label'), fx(){ storyAdvance(h,60); h.rep=clamp(h.rep+5); return HT(h,3,'choices.toast.res') + freeResident(h); }}]})
  ]}
};
