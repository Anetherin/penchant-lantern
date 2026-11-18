'use strict';
// Extra house chapters: a new chapter 2 (fun or risky) and an epilogue (chapter 5) per house.
const STORY_REP = [0,10,18,26,35];
const RES = (h, e) => { const R = resident(h); if(R) applyEff(R, e); };
const houseStaff = h => S.workers.filter(w=>w.house===h.id);
const STORY_EXTRA = {
  lantern:{mid:h=>({who:RID(h), scene:'bath', text:HT(h,1,'text'), choices:[
      {label:HT(h,1,'choices.back.label'), fx(){ RES(h,{t:2}); storyAdvance(h,20); return HT(h,1,'choices.back.res'); }},
      {label:HT(h,1,'choices.refill.label'), fx(){ const R=resident(h); RES(h,{t:3, m:8}); storyAdvance(h,20); if(R && (R.intim||0)>=2 && canSam(R, bestSamAct(R)||'')) return housePrivate(R, ['missionary','oral_give','manual_give','kiss'], HT(h,1,'choices.refill.lead'), HT(h,1,'choices.refill.situation'), '', 'bath'); return HT(h,1,'choices.refill.res'); }},
      {label:HT(h,1,'choices.book.label'), fx(){ RES(h,{m:4, l:3}); storyAdvance(h,20); return HT(h,1,'choices.book.res'); }}]}),
    end:h=>({who:RID(h), scene:'job_madame', text:HT(h,4,'text'), choices:[
      check(HT(h,4,'choices.speech.label'),'Charm',S.sam.charm,45, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+6); houseStaff(h).forEach(w=>moodAdd(w, 10)); return HT(h,4,'choices.speech.win'); }, ()=>{ storyAdvance(h,40); h.rep=clamp(h.rep+2); return HT(h,4,'choices.speech.lose'); }),
      pay(HT(h,4,'choices.party.label'), 400, h, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+8); h.bonus.demand=(h.bonus.demand||1)*1.1; return HT(h,4,'choices.party.res'); })]})},
  castle:{mid:h=>({who:RID(h), scene:'job_maid', text:HT(h,1,'text'), choices:[
      check(HT(h,1,'choices.etiquette.label'),'Charm',S.sam.charm,40, ()=>{ RES(h,{t:4}); h.rep=clamp(h.rep+3); storyAdvance(h,20); return HT(h,1,'choices.etiquette.win'); }, ()=>{ RES(h,{m:-3}); storyAdvance(h,10); return HT(h,1,'choices.etiquette.lose'); }),
      {label:HT(h,1,'choices.laugh.label'), fx(){ RES(h,{m:6, t:-1}); storyAdvance(h,20); return HT(h,1,'choices.laugh.res'); }}]}),
    end:h=>({who:storyNpc('seraphine'), scene:'portrait', text:HT(h,4,'text'), choices:[
      pay(HT(h,4,'choices.ball.label'), 600, h, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+10); S.rep=clamp(S.rep+3); h.bonus.demand=(h.bonus.demand||1)*1.15; houseStaff(h).forEach(w=>moodAdd(w, 10)); return HT(h,4,'choices.ball.res'); }),
      {label:HT(h,4,'choices.later.label'), fx(){ storyRetry(h); return HT(h,4,'choices.later.res'); }}]})},
  onsen:{mid:h=>({who:RID(h), scene:'bath_invite', text:HT(h,1,'text'), choices:[
      {label:HT(h,1,'choices.sit.label'), fx(){ RES(h,{t:4, m:5}); storyAdvance(h,20); return HT(h,1,'choices.sit.res'); }},
      {label:HT(h,1,'choices.flee.label'), fx(){ RES(h,{m:-2}); storyAdvance(h,10); return HT(h,1,'choices.flee.res'); }},
      {label:HT(h,1,'choices.slide.label'), fx(){ const R=resident(h); if(R && (R.intim||0)>=1 && (R.lewd>=35 || (R.intim||0)>=2) && bestSamAct(R)){ storyAdvance(h,20); return housePrivate(R, ['missionary','oral_give','breast_give','manual_give','kiss'], HT(h,1,'choices.slide.lead'), HT(h,1,'choices.slide.situation'), '', 'bath'); } if(R && R.lewd>=40){ RES(h,{m:6, l:3}); storyAdvance(h,20); return HT(h,1,'choices.slide.tease'); } RES(h,{t:-4, m:-6}); storyAdvance(h,10); return HT(h,1,'choices.slide.rebuff'); }}]}),
    end:h=>({who:RID(h), scene:'bath', text:HT(h,4,'text'), choices:[
      {label:HT(h,4,'choices.close.label'), fx(){ storyAdvance(h,60); houseStaff(h).forEach(w=>{ w.energy=maxEnergy(w); moodAdd(w, 10); }); if((h.beds||0)<3){ h.beds=(h.beds||0)+1; } return HT(h,4,'choices.close.res',{bed:BEDS[h.beds].label}); }}]})},
  hollow:{mid:h=>{ const R=resident(h), rev=R && (R.intim||0)>=1; return {who:RID(h), scene:'casual', text: rev ? HT(h,1,'text.intimate') : HT(h,1,'text.plain'), choices:[
      {label: rev ? HT(h,1,'choices.let.label.intimate') : HT(h,1,'choices.let.label.plain'), fx(){ storyAdvance(h,20); if(rev && R){ const S0=SVC.spirit||{}; const ld=spendLust(R, S0.pairLust||30); lewdUp(R, 3, 95); moodAdd(R, 8); gainTrust(R, 5); R.energy=clamp(R.energy-10, 0, maxEnergy(R)); samStat('technique', 2); R.privateCount++; R._samTime=(R._samTime||0)+1; countUp(R, 'privateSam'); S.sam.energy=Math.max(0,S.sam.energy-15); const text = HT(h,1,'choices.let.intimate',{lust:ld}); return {text, img:{wid:R.id, scene:'sam_spirit_futa'}, ai:{kind:'private', wid:R.id, scene:'sam_spirit_futa', forSam:true, spiritFuta:true}}; } RES(h,{t:4, m:8, l:3}); return HT(h,1,'choices.let.plain'); }},
      {label:HT(h,1,'choices.refuse.label'), fx(){ RES(h,{m:-4}); storyAdvance(h,10); return HT(h,1,'choices.refuse.res'); }},
      {label:HT(h,1,'choices.joke.label'), fx(){ RES(h,{t:-8, m:-12}); storyAdvance(h,10); return HT(h,1,'choices.joke.res'); }}]}; },
    end:h=>({who:RID(h), scene:'portrait', text:HT(h,4,'text'), choices:[
      {label:HT(h,4,'choices.stay.label'), fx(){ RES(h,{t:8, m:10}); h.bonus.demand=(h.bonus.demand||1)*1.2; storyAdvance(h,60); return HT(h,4,'choices.stay.res'); }},
      {label:HT(h,4,'choices.choice.label'), fx(){ RES(h,{t:12, m:6}); h.bonus.demand=(h.bonus.demand||1)*1.2; storyAdvance(h,60); return HT(h,4,'choices.choice.res'); }}]})},
  tankard:{mid:h=>({who:RID(h), scene:'job_bartender', text:HT(h,1,'text'), choices:[
      check(HT(h,1,'choices.wade.label'),'Strength',SSTR(h),40, ()=>{ RES(h,{t:4}); h.rep=clamp(h.rep+3); storyAdvance(h,20); return HT(h,1,'choices.wade.win'); }, ()=>{ S.sam.energy=Math.max(0,S.sam.energy-30); RES(h,{m:4}); storyAdvance(h,10); return HT(h,1,'choices.wade.lose'); }),
      {label:HT(h,1,'choices.delegate.label'), fx(){ RES(h,{t:2, m:6}); S.gold-=50; storyAdvance(h,20); return HT(h,1,'choices.delegate.res'); }},
      {label:HT(h,1,'choices.hide.label'), fx(){ RES(h,{t:-5, m:-4}); storyAdvance(h,10); return HT(h,1,'choices.hide.res'); }}]}),
    end:h=>({who:RID(h), scene:'job_bartender', text:HT(h,4,'text'), choices:[
      {label:HT(h,4,'choices.ship.label'), fx(){ S.flags.ironsong=true; storyAdvance(h,60); return HT(h,4,'choices.ship.res'); }},
      {label:HT(h,4,'choices.keep.label'), fx(){ h.bonus.bar=(h.bonus.bar||1)*1.2; h.rep=clamp(h.rep+6); storyAdvance(h,60); return HT(h,4,'choices.keep.res'); }}]})},
  pavilion:{mid:h=>({who:RID(h), scene:'job_dancer', text:HT(h,1,'text'), choices:[
      {label:HT(h,1,'choices.postpone.label'), fx(){ const R=resident(h); if(R) R.energy=maxEnergy(R); RES(h,{t:6, m:4}); h.rep=clamp(h.rep-1); storyAdvance(h,20); return HT(h,1,'choices.postpone.res'); }},
      {label:HT(h,1,'choices.dance.label'), fx(){ RES(h,{t:-6, m:-10}); h.rep=clamp(h.rep+2); storyAdvance(h,10); return HT(h,1,'choices.dance.res'); }},
      {label:HT(h,1,'choices.massage.label'), fx(){ const R=resident(h); if(hasPast('massage')){ RES(h,{t:6, m:8}); storyAdvance(h,20); if(R && (R.intim||0)>=1 && bestSamAct(R)) return housePrivate(R, ['kiss','manual_give','oral_give','missionary'], HT(h,1,'choices.massage.lead'), HT(h,1,'choices.massage.situation')); return HT(h,1,'choices.massage.skilled'); } RES(h,{t:3, m:3}); storyAdvance(h,20); return HT(h,1,'choices.massage.unskilled'); }}]}),
    end:h=>({who:storyNpc('ilyana'), scene:'portrait', text:HT(h,4,'text'), choices:[
      pay(HT(h,4,'choices.sponsor.label'), 300, h, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+8); houseStaff(h).forEach(w=>{ moodAdd(w, 8); w.popularity=clamp(w.popularity+5); }); return HT(h,4,'choices.sponsor.res'); }),
      {label:HT(h,4,'choices.later.label'), fx(){ storyRetry(h); return HT(h,4,'choices.later.res'); }}]})},
  veil:{mid:h=>({who:RID(h), scene:'job_courtesan', text:HT(h,1,'text'), choices:[
      check(HT(h,1,'choices.bet.label'),'Charm',S.sam.charm,45, ()=>{ const R=resident(h); RES(h,{t:6, m:6}); S.gold+=150; storyAdvance(h,20); if(R && (R.intim||0)>=2 && bestSamAct(R)) return housePrivate(R, ['oral_give','cowgirl','missionary','kiss'], HT(h,1,'choices.bet.lead'), HT(h,1,'choices.bet.situation'), HT(h,1,'choices.bet.extra')); return HT(h,1,'choices.bet.win'); }, ()=>{ RES(h,{m:8, l:2}); storyAdvance(h,20); return HT(h,1,'choices.bet.lose'); }),
      {label:HT(h,1,'choices.decline.label'), fx(){ RES(h,{m:-3}); storyAdvance(h,10); return HT(h,1,'choices.decline.res'); }}]}),
    end:h=>({who:RID(h), scene:'casual', text:HT(h,4,'text'), choices:[
      check(HT(h,4,'choices.deal.label'),'Business',S.sam.business,45, ()=>{ storyAdvance(h,60); houseStaff(h).forEach(w=>moodAdd(w, 10)); h.rep=clamp(h.rep+5); return HT(h,4,'choices.deal.win'); }, ()=>{ storyAdvance(h,40); RES(h,{m:-5}); return HT(h,4,'choices.deal.lose'); }),
      {label:HT(h,4,'choices.cheat.label'), fx(){ RES(h,{t:6, m:10}); h.rep=clamp(h.rep+2); storyAdvance(h,60); return HT(h,4,'choices.cheat.res'); }}]})},
  wayfarer:{mid:h=>({who:RID(h), scene:'job_reception', text:HT(h,1,'text'), choices:[
      {label:HT(h,1,'choices.room.label'), fx(){ S.flags.traveler=true; S.gold-=40; RES(h,{t:3}); storyAdvance(h,20); return HT(h,1,'choices.room.res'); }},
      {label:HT(h,1,'choices.charge.label'), fx(){ S.gold+=120; RES(h,{t:-3}); storyAdvance(h,20); return HT(h,1,'choices.charge.res'); }}]}),
    end:h=>({who:RID(h), scene:'job_reception', text:HT(h,4,'text'), choices:[
      S.flags.traveler ? {label:HT(h,4,'choices.accept.label'), fx(){ h.bonus.charter=60; storyAdvance(h,60); return HT(h,4,'choices.accept.res'); }}
        : pay(HT(h,4,'choices.buy.label'), 500, h, ()=>{ h.bonus.charter=60; storyAdvance(h,60); return HT(h,4,'choices.buy.res'); }),
      {label:HT(h,4,'choices.later.label'), fx(){ storyRetry(h); return HT(h,4,'choices.later.res'); }}]})},
  sanctuary:{mid:h=>({who:RID(h), scene:'job_chapel', text:HT(h,1,'text'), choices:[
      {label:HT(h,1,'choices.night-off.label'), fx(){ RES(h,{t:5, m:8}); storyAdvance(h,20); return HT(h,1,'choices.night-off.res'); }},
      {label:HT(h,1,'choices.truth.label'), fx(){ const R=resident(h); RES(h,{t:4, l:4}); storyAdvance(h,20); if(R && (R.intim||0)>=2 && bestSamAct(R)) return housePrivate(R, ['oral_give','manual_give','missionary','kiss'], HT(h,1,'choices.truth.lead'), HT(h,1,'choices.truth.situation'), '', 'chapel'); return HT(h,1,'choices.truth.res'); }}]}),
    end:h=>({who:RID(h), scene:'casual', text:HT(h,4,'text'), choices:[
      pay(HT(h,4,'choices.sponsor.label'), 350, h, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+8); houseStaff(h).forEach(w=>moodAdd(w, 8)); return HT(h,4,'choices.sponsor.res'); }),
      {label:HT(h,4,'choices.velvet.label'), fx(){ storyAdvance(h,60); h.rep=clamp(h.rep+4); h.bonus.demand=(h.bonus.demand||1)*1.1; return HT(h,4,'choices.velvet.res'); }}]})},
  atelier:{mid:h=>({who:RID(h), scene:'casual', text:HT(h,1,'text'), choices:[
      check(HT(h,1,'choices.calibrate.label'),'Technique',S.sam.technique,45, ()=>{ RES(h,{t:5, m:6}); storyAdvance(h,20); return HT(h,1,'choices.calibrate.win'); }, ()=>{ RES(h,{m:3}); storyAdvance(h,10); return HT(h,1,'choices.calibrate.lose'); }),
      {label:HT(h,1,'choices.compliment.label'), fx(){ RES(h,{t:3, m:7, l:2}); storyAdvance(h,20); return HT(h,1,'choices.compliment.res'); }}]}),
    end:h=>({who:RID(h), scene:'portrait', text:HT(h,4,'text'), choices:[
      pay(HT(h,4,'choices.showcase.label'), 400, h, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+7); h.bonus.demand=(h.bonus.demand||1)*1.12; return HT(h,4,'choices.showcase.res'); }),
      {label:HT(h,4,'choices.private.label'), fx(){ storyAdvance(h,60); h.rep=clamp(h.rep+4); houseStaff(h).forEach(w=>moodAdd(w, 8)); return HT(h,4,'choices.private.res'); }}]})}
};
Object.entries(STORY_EXTRA).forEach(([k,x])=>{ const st = STORIES[k]; st.beats.splice(1,0,x.mid); st.beats.push(x.end); });

// A chapter as the event the player sees: the beat from STORIES (choice page, checks, effects) plus its lead-in pages from
// data/housestories/ (prose only: {first}/{name} = the resident, {house}, {loc}). The lead-in is pictured with the resident
// unless the chapter is already hers or the page says who:"ev"; a house without its resident just gets the choice page.
// (HSTORY itself and HT(), which fetches every other chapter text, are defined at the top of houses.js.)
function houseStoryEvent(h, b){
  const st = STORIES[h.id]; if(!st || !st.beats[b]) return null;
  const ev = st.beats[b](h); if(!ev) return null;
  ev.title = `${st.title} (${b+1}/${st.beats.length})`;
  const D = (HSTORY[h.id]||[])[b], R = resident(h);
  if(D && R && Array.isArray(D.pages) && D.pages.length){
    const ctx = {name:R.name, first:R.name.split(' ')[0], house:h.name, loc:(HOUSES[h.id]||{}).loc || 'Hollowmere'};
    const own = ev.who === R.id;
    ev.pre = D.pages.map(pg=>{
      const o = typeof pg === 'string' ? {text:pg} : pg, evWho = own || o.who === 'ev';
      return {text:introFill(o.text, ctx), btn:o.btn || 'Continue', who: evWho ? ev.who : R.id, scene:o.scene || (evWho ? (ev.scene || 'portrait') : 'casual')};
    });
  }
  return ev;
}
function storyCard(h){
  const st = STORIES[h.id]; if(!st || !h.story) return '';
  const b = h.story.beat, done = b>=st.beats.length;
  const need = STORY_REP[b]||0;
  return `<section class="card"><h2>📖 ${esc(st.title)} <span class="muted">(${Math.min(b,st.beats.length)}/${st.beats.length})</span></h2>${done?'<span class="good">Complete!</span>':`<div class="muted">${esc(st.hint[b])}</div>${reqLine('Next chapter needs', [need > 0 && [h.rep >= need, `house popularity ${need}${h.rep < need ? ` (now ${Math.round(h.rep)})` : ''}`], waitItem(Math.max(h.since||1, h.story.wk||0), storyGap(h))].filter(Boolean))}`}</section>`;
}
