'use strict';
// Extra house chapters: a new chapter 2 (fun or risky) and an epilogue (chapter 5) per house.
const STORY_REP = [0,10,18,26,35];
const RES = (h, e) => { const R = resident(h); if(R) applyEff(R, e); };
const houseStaff = h => S.workers.filter(w=>w.house===h.id);
const STORY_EXTRA = {
  lantern:{hintMid:'Mira could use a night off.', hintEnd:'The Lantern has an anniversary coming up.',
    mid:h=>({who:RID(h), scene:'shower', text:`Sam, half-asleep, wanders into the bathhouse at three in the morning and finds ${RN(h)} soaking with a glass of wine and a romance novel. She doesn't even look up. "Twelve years I've run this place. This is my first uninterrupted bath in four of them."`, choices:[
      {label:'Back out with an apology', fx(){ RES(h,{t:2}); storyAdvance(h,20); return '"Close the door on your way out, dear."'; }},
      {label:'Bring her a refill', fx(){ RES(h,{t:3, m:8}); storyAdvance(h,20); return 'She toasts him without opening her eyes. "You might work out after all."'; }},
      {label:'Ask what she\'s reading', fx(){ RES(h,{m:4, l:3}); storyAdvance(h,20); return 'She tells him. In detail. With dramatic readings. He leaves enlightened and red to the ears.'; }}]}),
    end:h=>({who:RID(h), scene:'job_madame', text:`${h.name} turns fifty years old. Regulars, rivals, even a very nervous Silas Grieve send flowers. ${RN(h)} wants to do it properly.`, choices:[
      check('Give a speech','Charm',S.sam.charm,45, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+6); houseStaff(h).forEach(w=>w.mood=clamp(w.mood+10)); return 'Short, warm, and only one joke that falls flat. There isn\'t a dry eye in the lounge. Everyone here is in a great mood.'; }, ()=>{ storyAdvance(h,40); h.rep=clamp(h.rep+2); return 'It runs long. Very long. The applause at the end is mostly relief, but it\'s still applause.'; }),
      pay('Throw an open party', 400, h, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+8); h.bonus.demand=(h.bonus.demand||1)*1.1; return 'Half of Old Town shows up. Business is permanently up (+10% clients).'; })]})},
  castle:{hintMid:'Cecile has opinions about Sam\'s manners.', hintEnd:'The castle hasn\'t hosted a ball in twenty years.',
    mid:h=>({who:RID(h), scene:'job_maid', text:`${RN(h)} has decided the owner of Castle Rosenhal cannot hold a teacup like that. Lessons begin immediately. There will be a test.`, choices:[
      check('Pass the etiquette test','Charm',S.sam.charm,40, ()=>{ RES(h,{t:4}); h.rep=clamp(h.rep+3); storyAdvance(h,20); return '"Acceptable." From Cecile, that is a standing ovation.'; }, ()=>{ RES(h,{m:-3}); storyAdvance(h,10); return 'Cecile sighs the sigh of a woman who has watched three owners fail this exact test.'; }),
      {label:'Try to make her laugh instead', fx(){ RES(h,{m:6, t:-1}); storyAdvance(h,20); return 'She does not laugh. The corner of her mouth twitches. The staff talk about it for a week.'; }}]}),
    end:h=>({who:storyNpc('seraphine'), scene:'portrait', text:'Castle Rosenhal hasn\'t hosted a ball in twenty years. Seraphine and Cecile have already drawn up a guest list. It is very long. It is very expensive.', choices:[
      pay('Host the Rosenhal Ball', 600, h, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+10); S.rep=clamp(S.rep+3); h.bonus.demand=(h.bonus.demand||1)*1.15; houseStaff(h).forEach(w=>w.mood=clamp(w.mood+10)); return 'The ball is the talk of the kingdom. The nobles are back to stay (+15% clients, +renown).'; }),
      {label:'Not this season', fx(){ storyRetry(h); return 'Seraphine sighs theatrically. "Next season, then."'; }}]})},
  onsen:{hintMid:'Someone mixed up the bath schedule.', hintEnd:'The first snow is coming.',
    mid:h=>({who:RID(h), scene:'shower', text:`A mix-up on the bath schedule: Sam walks into the outdoor spring and finds ${RN(h)} already in it. She just waves him in. "It's a hot spring, not a crime scene. Sit."`, choices:[
      {label:'Sit (at a respectful distance)', fx(){ RES(h,{t:4, m:5}); storyAdvance(h,20); return 'They talk until the stars come out. It\'s the most relaxed Sam has been since the truck.'; }},
      {label:'Flee', fx(){ RES(h,{m:-2}); storyAdvance(h,10); return 'She laughs so hard she slips under the water.'; }},
      {label:'Sit (not such a respectful distance)', fx(){ const R=resident(h); if(R && R.lewd>=40){ RES(h,{m:6, l:3}); storyAdvance(h,20); return 'She raises an eyebrow, then scoots closer. "Bold. I like it."'; } RES(h,{t:-4, m:-6}); storyAdvance(h,10); return 'She very pointedly moves to the other side of the spring. Awkward.'; }}]}),
    end:h=>({who:RID(h), scene:'bath', text:`First snow on the mountain. ${RN(h)} insists everyone take the night off to watch it fall from the hot spring.`, choices:[
      {label:'Close for the night', fx(){ storyAdvance(h,60); houseStaff(h).forEach(w=>{ w.energy=maxEnergy(w); w.mood=clamp(w.mood+10); }); if((h.beds||0)<3){ h.beds=(h.beds||0)+1; } return `Everyone rests. Grateful regulars chip in for new futons (staff beds upgraded to ${BEDS[h.beds].label}).`; }}]})},
  hollow:{hintMid:'Vesper has an experiment in mind.', hintEnd:'There\'s a grave somewhere in the overgrown garden.',
    mid:h=>({who:RID(h), scene:'casual', text:`${RN(h)} wants to try possessing Sam, "just to see what it's like." Ines is horrified.`, choices:[
      {label:'Let her', fx(){ RES(h,{t:5, m:8}); S.sam.energy=Math.max(0,S.sam.energy-20); storyAdvance(h,20); return 'Sam spends an hour walking very elegantly and humming three-hundred-year-old songs. He remembers none of it. Everyone else remembers all of it.'; }},
      {label:'Politely refuse', fx(){ RES(h,{m:-4}); storyAdvance(h,10); return '"Spoilsport," she sniffs, and walks through a wall.'; }},
      {label:'Make a joke about her being dead', fx(){ RES(h,{t:-8, m:-12}); storyAdvance(h,10); return 'Every mirror in the house cracks at once. She doesn\'t speak to him for a week. Ines, quietly: "That was a bad one."'; }}]}),
    end:h=>({who:RID(h), scene:'portrait', text:`Sam and ${RN(h)} find her grave at last, under three centuries of ivy in the garden. "If I wanted to," she says softly, "I could go now."`, choices:[
      {label:'Ask her to stay', fx(){ RES(h,{t:8, m:10}); h.bonus.demand=(h.bonus.demand||1)*1.2; storyAdvance(h,60); return '"Someone has to haunt you properly." She stays, and the manor feels warmer for it (+20% clients).'; }},
      {label:'Tell her it\'s her choice', fx(){ RES(h,{t:12, m:6}); h.bonus.demand=(h.bonus.demand||1)*1.2; storyAdvance(h,60); return 'She thinks about it for a long time. Then she takes his hand, as much as a ghost can. "I choose here." (+20% clients)'; }}]})},
  tankard:{hintMid:'The sailors are restless.', hintEnd:'The first barrel is nearly ready.',
    mid:h=>({who:RID(h), scene:'job_bartender', text:'Two rival ship crews decide the Tankard is the place to settle a very old feud. Chairs are already in the air.', choices:[
      check('Wade in','Strength',SSTR(h),40, ()=>{ RES(h,{t:4}); h.rep=clamp(h.rep+3); storyAdvance(h,20); return 'Sam ends the brawl mostly by accident, standing in the middle and refusing to fall over. The dock talks about it for weeks.'; }, ()=>{ S.sam.energy=Math.max(0,S.sam.energy-30); RES(h,{m:4}); storyAdvance(h,10); return `${RN(h)} drags Sam out of the pile by his collar, laughing her head off.`; }),
      {label:`Let ${RN(h)} handle it`, fx(){ RES(h,{t:2, m:6}); S.gold-=50; storyAdvance(h,20); return 'She handles it with a barstool. Damages: 50g. Worth it.'; }},
      {label:'Hide behind the bar', fx(){ RES(h,{t:-5, m:-4}); storyAdvance(h,10); return `${RN(h)} notices. ${RN(h)} remembers.`; }}]}),
    end:h=>({who:RID(h), scene:'job_bartender', text:`The first barrel of Ironsong ale in years is tapped at the Tankard. ${RN(h)} is crying into it and pretending she isn't.`, choices:[
      {label:'Ship it to every house you own', fx(){ S.flags.ironsong=true; storyAdvance(h,60); return 'Ironsong ale flows in every house (bar income +15% everywhere).'; }},
      {label:'Keep it Tankard-exclusive', fx(){ h.bonus.bar=(h.bonus.bar||1)*1.2; h.rep=clamp(h.rep+6); storyAdvance(h,60); return 'People cross the whole city for a pint (Tankard bar income +20% more, +reputation).'; }}]})},
  pavilion:{hintMid:'Rehearsals are underway.', hintEnd:'The Moonlily Festival is coming.',
    mid:h=>({who:RID(h), scene:'job_dancer', text:`${RN(h)} twists her ankle in rehearsal, three days before the season's big premiere.`, choices:[
      {label:'Postpone and let her rest', fx(){ const R=resident(h); if(R) R.energy=maxEnergy(R); RES(h,{t:6, m:4}); h.rep=clamp(h.rep-1); storyAdvance(h,20); return 'The premiere slips a week. She heals fully, and she doesn\'t forget that he chose her over the schedule.'; }},
      {label:'Ask her to dance through it', fx(){ RES(h,{t:-6, m:-10}); h.rep=clamp(h.rep+2); storyAdvance(h,10); return 'She does. Perfectly. She doesn\'t look at Sam once afterward.'; }},
      {label:'Massage the ankle yourself', fx(){ if(S.past==='massage'){ RES(h,{t:6, m:8}); storyAdvance(h,20); return 'Old skills. It\'s good as new by morning, and she\'s looking at him differently.'; } RES(h,{t:3, m:3}); storyAdvance(h,20); return 'He has no idea what he\'s doing. She appreciates the effort.'; }}]}),
    end:h=>({who:storyNpc('ilyana'), scene:'portrait', text:'The Moonlily Festival: one night a year, the lilies glow and the whole Elven Quarter dances. Ilyana asks whether the Pavilion will host.', choices:[
      pay('Sponsor the festival', 300, h, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+8); houseStaff(h).forEach(w=>{ w.mood=clamp(w.mood+8); w.popularity=clamp(w.popularity+5); }); return 'The Pavilion glows all night. Every dancer\'s popularity climbs.'; }),
      {label:'Not this year', fx(){ storyRetry(h); return 'Ilyana nods serenely. "Next year, then."'; }}]})},
  veil:{hintMid:'Zaria has a wager in mind.', hintEnd:'Vharra and Zaria have unfinished business.',
    mid:h=>({who:RID(h), scene:'job_courtesan', text:`${RN(h)} bets Sam he can't survive one night working the Veil's floor himself: greeting, pouring, keeping the peace, the works.`, choices:[
      check('Take the bet','Charm',S.sam.charm,45, ()=>{ RES(h,{t:6, m:6}); S.gold+=150; storyAdvance(h,20); return 'He survives. Barely. Zaria pays up, impressed: +150g.'; }, ()=>{ RES(h,{m:8, l:2}); storyAdvance(h,20); return 'He lasts until midnight. Zaria collects her winnings (his dignity) and kisses his cheek.'; }),
      {label:'Decline', fx(){ RES(h,{m:-3}); storyAdvance(h,10); return '"Boring," she pouts.'; }}]}),
    end:h=>({who:RID(h), scene:'casual', text:'Vharra and Zaria have been feuding for two hundred years over something neither will explain. They agree to settle it, finally, over cards. Sam is asked to deal.', choices:[
      check('Deal fairly and keep the peace','Business',S.sam.business,45, ()=>{ storyAdvance(h,60); houseStaff(h).forEach(w=>w.mood=clamp(w.mood+10)); h.rep=clamp(h.rep+5); return 'A draw, somehow. They shake hands. The whole Veil exhales. (Staff mood way up.)'; }, ()=>{ storyAdvance(h,40); RES(h,{m:-5}); return 'Zaria loses. She sulks for a week. But the feud is over.'; }),
      {label:'Cheat for Zaria', fx(){ RES(h,{t:6, m:10}); h.rep=clamp(h.rep+2); storyAdvance(h,60); return 'Zaria wins. Vharra absolutely knows, and respects it.'; }}]})},
  wayfarer:{hintMid:'A mysterious traveler has arrived.', hintEnd:'The merchant guild is watching.',
    mid:h=>({who:RID(h), scene:'job_reception', text:`A cloaked woman asks ${RN(h)} for a room and "absolute discretion." Her boots are far too fine for a traveler.`, choices:[
      {label:'Give her the best room, on the house', fx(){ S.flags.traveler=true; S.gold-=40; RES(h,{t:3}); storyAdvance(h,20); return 'She thanks them quietly and leaves before dawn. Bettina has a feeling about this.'; }},
      {label:'Charge her triple', fx(){ S.gold+=120; RES(h,{t:-3}); storyAdvance(h,20); return `She pays without blinking: +120g. ${RN(h)} disapproves.`; }}]}),
    end:h=>({who:RID(h), scene:'job_reception', text:'The merchant guild offers the Wayfarer an exclusive charter: every guild caravan stops here first.', choices:[
      S.flags.traveler ? {label:'Accept (the guildmaster\'s wife insists it\'s free)', fx(){ h.bonus.charter=60; storyAdvance(h,60); return 'The cloaked traveler was the guildmaster\'s wife. The charter is free: +60g every week.'; }}
        : pay('Buy the charter', 500, h, ()=>{ h.bonus.charter=60; storyAdvance(h,60); return 'The guild caravans arrive like clockwork: +60g every week.'; }),
      {label:'Not yet', fx(){ storyRetry(h); return 'The offer stands, for now.'; }}]})}
};
Object.entries(STORY_EXTRA).forEach(([k,x])=>{ const st = STORIES[k]; st.beats.splice(1,0,x.mid); st.beats.push(x.end); st.hint.splice(1,0,x.hintMid); st.hint.push(x.hintEnd); });

function storyCard(h){
  const st = STORIES[h.id]; if(!st || !h.story) return '';
  const b = h.story.beat, done = b>=st.beats.length;
  const need = STORY_REP[b]||0;
  return `<section class="card"><h2>📖 ${esc(st.title)} <span class="muted">(${Math.min(b,st.beats.length)}/${st.beats.length})</span></h2>${done?'<span class="good">Complete!</span>':`<div class="muted">${esc(st.hint[b])}</div><div class="muted">Next chapter: ${h.rep<need?`needs this house's reputation at ${need} (now ${Math.round(h.rep)})`:'coming soon'}.</div>`}</section>`;
}
