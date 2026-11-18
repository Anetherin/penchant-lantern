'use strict';
/* =====================================================================
   NEW GAME+ HOUSES — storylines for houses that only appear from cycle 2.
   Same rules as js/stories/houses.js (chapters unlock with the house's reputation).
   ===================================================================== */
Object.assign(NPCS, {
  npc_ashby:{id:'npc_ashby', male:true, name:'Commodore Ashby Vell', seed:2218, look:'a lean, silver-haired air-navy commodore in an immaculate blue greatcoat with gold epaulettes and a cold, tidy smile'},
  npc_harbormaster:{id:'npc_harbormaster', male:true, name:'Harbormaster Quill', seed:3319, look:'a stout, balding harbormaster with ink-stained fingers, a brass spyglass and a nervous habit of polishing it'},
  npc_foreman:{id:'npc_foreman', male:true, name:'Foreman Krag', seed:4412, look:'a broad-shouldered dwarven mason with a soot-dusted beard, leather measuring tape, and a heavy brass plumb line'}
});
STORIES.skyhook = {title:storyTitle('skyhook'), hint:storyHints('skyhook'), beats:[
  h=>({who:RID(h), scene:'job_bartender', text:HT(h,0,'text'), choices:[
    check(HT(h,0,'choices.open.label'),'Technique',S.sam.technique,35, ()=>{ S.gold+=400; storyAdvance(h); return HT(h,0,'choices.open.win'); }, ()=>{ S.sam.energy=Math.max(0,S.sam.energy-20); storyRetry(h); return HT(h,0,'choices.open.lose'); }),
    {label:HT(h,0,'choices.deal.label'), fx(){ const R=resident(h); if(R){ moodAdd(R, -3); gainTrust(R,2); } storyAdvance(h,20); return HT(h,0,'choices.deal.res'); }}]}),
  h=>({who:RID(h), scene:'casual', text:HT(h,1,'text'), choices:[
    {label:HT(h,1,'choices.go.label'), fx(){ const R=resident(h); if(R){ gainTrust(R,8); moodAdd(R, 10); R.energy=clamp(R.energy-30,0,maxEnergy(R)); } S.gold+=300; storyAdvance(h); return HT(h,1,'choices.go.res'); }},
    check(HT(h,1,'choices.retire.label'),'Charm',S.sam.charm,45, ()=>{ h.rep=clamp(h.rep+3); storyAdvance(h); return HT(h,1,'choices.retire.win'); }, ()=>{ storyRetry(h); return HT(h,1,'choices.retire.lose'); })]}),
  h=>({who:'npc_ashby', text:HT(h,2,'text'), choices:[
    pay(HT(h,2,'choices.license.label'), 900, h, ()=>{ storyAdvance(h,40); h.bonus.demand=(h.bonus.demand||1)*1.1; return HT(h,2,'choices.license.res'); }),
    check(HT(h,2,'choices.paperwork.label'),'Business',S.sam.business,55, ()=>{ storyAdvance(h,40); h.rep=clamp(h.rep+3); return HT(h,2,'choices.paperwork.win'); }, ()=>{ storyRetry(h); return HT(h,2,'choices.paperwork.lose'); })]}),
  h=>({who:RID(h), scene:'portrait', text:HT(h,3,'text'), choices:[
    check(HT(h,3,'choices.helm.label'),'Strength',S.sam.strength,45, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+6); return HT(h,3,'choices.helm.win') + freeResident(h); }, ()=>{ storyRetry(h); return HT(h,3,'choices.helm.lose'); }),
    {label:HT(h,3,'choices.alone.label'), fx(){ storyAdvance(h,60); h.rep=clamp(h.rep+4); const R=resident(h); if(R) gainTrust(R,6); return HT(h,3,'choices.alone.res') + freeResident(h); }}]})
]};
STORIES.pearl = {title:storyTitle('pearl'), hint:storyHints('pearl'), beats:[
  h=>({who:RID(h), scene:'job_bath', text:HT(h,0,'text'), choices:[
    check(HT(h,0,'choices.dive.label'),'Strength',S.sam.strength,40, ()=>{ storyAdvance(h); return HT(h,0,'choices.dive.win'); }, ()=>{ S.sam.energy=Math.max(0,S.sam.energy-30); storyRetry(h); return HT(h,0,'choices.dive.lose'); }),
    check(HT(h,0,'choices.ask.label'),'Charm',S.sam.charm,45, ()=>{ storyAdvance(h); const R=resident(h); if(R) gainTrust(R,3); return HT(h,0,'choices.ask.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.ask.lose'); })]}),
  h=>({who:'npc_harbormaster', text:HT(h,1,'text'), choices:[
    pay(HT(h,1,'choices.lease.label'), 800, h, ()=>{ storyAdvance(h,40); return HT(h,1,'choices.lease.res'); }),
    check(HT(h,1,'choices.read.label'),'Business',S.sam.business,50, ()=>{ storyAdvance(h,40); S.gold+=250; return HT(h,1,'choices.read.win'); }, ()=>{ storyRetry(h); return HT(h,1,'choices.read.lose'); })]}),
  h=>({who:RID(h), scene:'portrait', text:HT(h,2,'text'), choices:[
    {label:HT(h,2,'choices.free.label'), fx(){ const R=resident(h); if(R){ gainTrust(R,8); moodAdd(R, 8); } storyAdvance(h); return HT(h,2,'choices.free.res'); }},
    {label:HT(h,2,'choices.alone.label'), fx(){ const R=resident(h); if(R){ gainTrust(R,5); moodAdd(R, 10); } storyAdvance(h); return HT(h,2,'choices.alone.res'); }}]}),
  h=>({who:RID(h), scene:'job_bath', text:HT(h,3,'text'), choices:[
    pay(HT(h,3,'choices.pearls.label'), 1500, h, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+6); return HT(h,3,'choices.pearls.res') + freeResident(h); }),
    check(HT(h,3,'choices.bell.label'),'Charm',S.sam.charm,60, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+6); return HT(h,3,'choices.bell.win') + freeResident(h); }, ()=>{ S.sam.energy=0; storyRetry(h); return HT(h,3,'choices.bell.lose'); })]})
]};
STORIES.foundry = {title:storyTitle('foundry'), hint:storyHints('foundry'), beats:[
  h=>({who:RID(h), scene:'casual', text:HT(h,0,'text'), choices:[
    check(HT(h,0,'choices.brace.label'),'Strength',S.sam.strength,40, ()=>{ storyAdvance(h); if((h.damaged||0)>0) h.damaged--; return HT(h,0,'choices.brace.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.brace.lose'); }),
    pay(HT(h,0,'choices.crew.label'), 450, h, ()=>{ storyAdvance(h); if((h.damaged||0)>0) h.damaged--; return HT(h,0,'choices.crew.res'); })]}),
  h=>({who:'npc_foreman', text:HT(h,1,'text'), choices:[
    check(HT(h,1,'choices.bargain.label'),'Business',S.sam.business,50, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+3); return HT(h,1,'choices.bargain.win'); }, ()=>{ storyRetry(h); return HT(h,1,'choices.bargain.lose'); })]}),
  h=>({who:RID(h), scene:'job_security', text:HT(h,2,'text'), choices:[
    check(HT(h,2,'choices.rebuild.label'),'Technique',S.sam.technique,45, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+4); if((h.damaged||0)>0) h.damaged--; return HT(h,2,'choices.rebuild.win'); }, ()=>{ storyRetry(h); return HT(h,2,'choices.rebuild.lose'); })]}),
  h=>({who:RID(h), scene:'portrait', text:HT(h,3,'text'), choices:[
    {label:HT(h,3,'choices.raise.label'), fx(){ storyAdvance(h,60); h.rep=clamp(h.rep+6); h.bonus.demand=(h.bonus.demand||1)*1.12; return HT(h,3,'choices.raise.res') + freeResident(h); }}]})
]};
STORIES.conservatory = {title:storyTitle('conservatory'), hint:storyHints('conservatory'), beats:[
  h=>({who:RID(h), scene:'casual', text:HT(h,0,'text'), choices:[
    check(HT(h,0,'choices.adjust.label'),'Technique',S.sam.technique,40, ()=>{ storyAdvance(h); return HT(h,0,'choices.adjust.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.adjust.lose'); })]}),
  h=>({who:RID(h), scene:'job_host', text:HT(h,1,'text'), choices:[
    check(HT(h,1,'choices.charm.label'),'Charm',S.sam.charm,55, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+4); return HT(h,1,'choices.charm.win'); }, ()=>{ storyRetry(h); return HT(h,1,'choices.charm.lose'); })]}),
  h=>({who:RID(h), scene:'casual', text:HT(h,2,'text'), choices:[
    pay(HT(h,2,'choices.resin.label'), 600, h, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+4); return HT(h,2,'choices.resin.res'); }),
    check(HT(h,2,'choices.blend.label'),'Wits',S.sam.wits||S.sam.business,50, ()=>{ storyAdvance(h); return HT(h,2,'choices.blend.win'); }, ()=>{ storyRetry(h); return HT(h,2,'choices.blend.lose'); })]}),
  h=>({who:RID(h), scene:'portrait', text:HT(h,3,'text'), choices:[
    {label:HT(h,3,'choices.breathe.label'), fx(){ const R=resident(h); storyAdvance(h,60); h.rep=clamp(h.rep+6); h.bonus.demand=(h.bonus.demand||1)*1.12; const base=HT(h,3,'choices.breathe.base'); if(R && (R.intim||0)>=2 && bestSamAct(R)) return housePrivate(R, ['missionary','oral_give','kiss'], HT(h,3,'choices.breathe.lead',{base}), HT(h,3,'choices.breathe.situation'), freeResident(h).trim()); return base + freeResident(h); }}]})
]};
STORIES.lyceum = {title:storyTitle('lyceum'), hint:storyHints('lyceum'), beats:[
  h=>({who:RID(h), scene:'casual', text:HT(h,0,'text'), choices:[
    check(HT(h,0,'choices.review.label'),'Charm',S.sam.charm,50, ()=>{ storyAdvance(h); return HT(h,0,'choices.review.win'); }, ()=>{ storyRetry(h); return HT(h,0,'choices.review.lose'); })]}),
  h=>({who:RID(h), scene:'portrait', text:HT(h,1,'text'), choices:[
    check(HT(h,1,'choices.prove.label'),'Business',S.sam.business,55, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+5); return HT(h,1,'choices.prove.win'); }, ()=>{ storyRetry(h); return HT(h,1,'choices.prove.lose'); })]}),
  h=>({who:RID(h), scene:'casual', text:HT(h,2,'text'), choices:[
    pay(HT(h,2,'choices.mirrors.label'), 700, h, ()=>{ storyAdvance(h); return HT(h,2,'choices.mirrors.res'); }),
    {label:HT(h,2,'choices.hall.label'), fx(){ storyAdvance(h); return HT(h,2,'choices.hall.res'); }}]}),
  h=>({who:RID(h), scene:'portrait', text:HT(h,3,'text'), choices:[
    {label:HT(h,3,'choices.tuition.label'), fx(){ const R=resident(h); storyAdvance(h,60); h.rep=clamp(h.rep+6); h.bonus.demand=(h.bonus.demand||1)*1.12; const base=HT(h,3,'choices.tuition.base'); if(R && (R.intim||0)>=2 && bestSamAct(R)) return housePrivate(R, ['cowgirl','oral_give','kiss'], HT(h,3,'choices.tuition.lead',{base}), HT(h,3,'choices.tuition.situation'), freeResident(h).trim()); return base + freeResident(h); }}]})
]};
