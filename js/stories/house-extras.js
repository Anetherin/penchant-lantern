'use strict';
// Extra house chapters: a new chapter 2 (fun or risky) and an epilogue (chapter 5) per house.
const STORY_REP = [0,10,18,26,35];
const RES = (h, e) => { const R = resident(h); if(R) applyEff(R, e); };
const houseStaff = h => S.workers.filter(w=>w.house===h.id);
const STORY_EXTRA = {
  lantern:{hintMid:'Mira could use a night off.', hintEnd:'The Lantern has an anniversary coming up.',
    mid:h=>({who:RID(h), scene:'bath', text:`It is three in the morning. You push the bathhouse door open and find ${RN(h)} soaking up to her shoulders, with a glass of wine and a romance novel. She doesn't even look up. "Twelve years I've run this place. This is my first uninterrupted bath in four of them."`, choices:[
      {label:'Back out with an apology', fx(){ RES(h,{t:2}); storyAdvance(h,20); return '"Close the door on your way out, dear."'; }},
      {label:'Bring her a refill', fx(){ const R=resident(h); RES(h,{t:3, m:8}); storyAdvance(h,20); if(R && (R.intim||0)>=2 && canSam(R, bestSamAct(R)||'')) return housePrivate(R, ['missionary','oral_give','manual_give','kiss'], `She sets the book aside as you pour, hooks a wet ankle behind your knee, and murmurs, "Come here, Sam. The bath's warm and everybody's asleep."`, 'After hours in the bathhouse, Mira pulls Sam into the warm water.', '', 'bath'); return 'She toasts you without opening her eyes. "You might work out after all, Sam."'; }},
      {label:'Ask what she\'s reading', fx(){ RES(h,{m:4, l:3}); storyAdvance(h,20); return 'She tells you. In detail. With dramatic readings. You leave enlightened and red to the ears.'; }}]}),
    end:h=>({who:RID(h), scene:'job_madame', text:`${RN(h)} wants to do it properly. "A speech from the owner, at the very least," she says. "Or we open the doors and feed the whole street. Your choice, Sam. You're the one paying."`, choices:[
      check('Give a speech','Charm',S.sam.charm,45, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+6); houseStaff(h).forEach(w=>moodAdd(w, 10)); return 'Short, warm, and only one joke that falls flat. There isn\'t a dry eye in the lounge. Everyone here is in a great mood.'; }, ()=>{ storyAdvance(h,40); h.rep=clamp(h.rep+2); return 'It runs long. Very long. The applause at the end is mostly relief, but it\'s still applause.'; }),
      pay('Throw an open party', 400, h, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+8); h.bonus.demand=(h.bonus.demand||1)*1.1; return 'Half of Old Town shows up. Business is permanently up (+10% clients).'; })]})},
  castle:{hintMid:'Cecile has opinions about your manners.', hintEnd:'The castle hasn\'t hosted a ball in twenty years.',
    mid:h=>({who:RID(h), scene:'job_maid', text:`${RN(h)} has decided the owner of Castle Rosenhal cannot hold a teacup like that. Lessons begin immediately. There will be a test.`, choices:[
      check('Pass the etiquette test','Charm',S.sam.charm,40, ()=>{ RES(h,{t:4}); h.rep=clamp(h.rep+3); storyAdvance(h,20); return '"Acceptable." From Cecile, that is a standing ovation.'; }, ()=>{ RES(h,{m:-3}); storyAdvance(h,10); return 'Cecile sighs the sigh of a woman who has watched three owners fail this exact test.'; }),
      {label:'Try to make her laugh instead', fx(){ RES(h,{m:6, t:-1}); storyAdvance(h,20); return 'She does not laugh. The corner of her mouth twitches. The staff talk about it for a week.'; }}]}),
    end:h=>({who:storyNpc('seraphine'), scene:'portrait', text:'Castle Rosenhal hasn\'t hosted a ball in twenty years. Seraphine and Cecile have already drawn up a guest list. It is very long. It is very expensive.', choices:[
      pay('Host the Rosenhal Ball', 600, h, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+10); S.rep=clamp(S.rep+3); h.bonus.demand=(h.bonus.demand||1)*1.15; houseStaff(h).forEach(w=>moodAdd(w, 10)); return 'The ball is the talk of the kingdom. The nobles are back to stay (+15% clients, +renown).'; }),
      {label:'Not this season', fx(){ storyRetry(h); return 'Seraphine sighs theatrically. "Next season, then."'; }}]})},
  onsen:{hintMid:'Someone mixed up the bath schedule.', hintEnd:'The first snow is coming.',
    mid:h=>({who:RID(h), scene:'bath_invite', text:`A mix-up on the bath schedule: you walk into the outdoor spring and find ${RN(h)} already soaking up to her collarbone. She just waves you in. "It's a hot spring, not a crime scene. Get in."`, choices:[
      {label:'Sit (at a respectful distance)', fx(){ RES(h,{t:4, m:5}); storyAdvance(h,20); return 'You talk until the stars come out. It\'s the most relaxed you\'ve been since the truck.'; }},
      {label:'Flee', fx(){ RES(h,{m:-2}); storyAdvance(h,10); return 'She laughs so hard she slips under the water.'; }},
      {label:'Slide in close beside her', fx(){ const R=resident(h); if(R && (R.intim||0)>=1 && (R.lewd>=35 || (R.intim||0)>=2) && bestSamAct(R)){ storyAdvance(h,20); return housePrivate(R, ['missionary','oral_give','breast_give','manual_give','kiss'], `"Bold," ${RN(h)} purrs as the mist curls over your shoulders, sliding straight against your chest in the hot water.`, 'In the outdoor hot spring after hours, Tsubaki closes the distance between them.', '', 'bath'); } if(R && R.lewd>=40){ RES(h,{m:6, l:3}); storyAdvance(h,20); return 'She raises an eyebrow, then scoots close enough that her warm thigh brushes yours under the mist. "Bold. Next time, maybe."'; } RES(h,{t:-4, m:-6}); storyAdvance(h,10); return 'She very pointedly moves to the other side of the spring. Awkward.'; }}]}),
    end:h=>({who:RID(h), scene:'bath', text:`First snow on the mountain. ${RN(h)} insists everyone take the night off to watch it fall from the hot spring.`, choices:[
      {label:'Close for the night', fx(){ storyAdvance(h,60); houseStaff(h).forEach(w=>{ w.energy=maxEnergy(w); moodAdd(w, 10); }); if((h.beds||0)<3){ h.beds=(h.beds||0)+1; } return `Everyone rests. Grateful regulars chip in for new futons (staff beds upgraded to ${BEDS[h.beds].label}).`; }}]})},
  hollow:{hintMid:'Vesper has an experiment in mind.', hintEnd:'There\'s a grave somewhere in the overgrown garden.',
    mid:h=>{ const R=resident(h), rev=R && (R.intim||0)>=1; return {who:RID(h), scene:'casual', text: rev ? `${RN(h)} corners you in the upstairs hall, eyes bright with mischief. "A proper spectral reverse-possession," she announces, gesturing toward your belt. "I keep my body, borrow your cock, and test how much sensation transfers across the veil. Ines threatened to salt the stairs if I tried it on a guest first."` : `${RN(h)} corners you in the upstairs hall, drifting three inches off the rug with wicked curiosity. "They say a spirit can borrow a living man's heat across the veil," she murmurs, fingers trailing cold along your jaw. "Just a small test first, since you haven't quite handed me the rest of yourself yet."`, choices:[
      {label: rev ? 'Let her' : 'Humor her experiment', fx(){ storyAdvance(h,20); if(rev && R){ const S0=SVC.spirit||{}; const ld=spendLust(R, S0.pairLust||30); lewdUp(R, 3, 95); moodAdd(R, 8); gainTrust(R, 5); R.energy=clamp(R.energy-10, 0, maxEnergy(R)); samStat('technique', 2); R.privateCount++; R._samTime=(R._samTime||0)+1; countUp(R, 'privateSam'); S.sam.energy=Math.max(0,S.sam.energy-15); const text = `Her cool fingers brush your chest and pull the heat straight out of your hips into hers. She spends an hour parading in front of the pier glass, stroking the thick, twitching cock between her thighs until she comes across the floorboards—leaving you breathless, weak-kneed, and thoroughly outclassed by three-hundred-year-old smugness.\n\nLewdness + · Trust + · Mood + · Lust −${ld} · Sam's Technique +2`; return {text, img:{wid:R.id, scene:'sam_spirit_futa'}, ai:{kind:'private', wid:R.id, scene:'sam_spirit_futa', forSam:true, spiritFuta:true}}; } RES(h,{t:4, m:8, l:3}); return 'She presses her translucent lips over yours for one shiver-cold, electric heartbeat, then gasps and floats backward through the banister, glowing bright violet. "Oh. That worked better than I thought."'; }},
      {label:'Politely refuse', fx(){ RES(h,{m:-4}); storyAdvance(h,10); return '"Spoilsport," she sniffs, and walks through a wall.'; }},
      {label:'Make a joke about her being dead', fx(){ RES(h,{t:-8, m:-12}); storyAdvance(h,10); return 'Every mirror in the house cracks at once. She doesn\'t speak to you for a week. Ines, quietly: "That was a bad one."'; }}]}; },
    end:h=>({who:RID(h), scene:'portrait', text:`${RN(h)} looks at the stone for a long time. "So that's where I've been," she says. Then, softly: "If I wanted to, I could go now."`, choices:[
      {label:'Ask her to stay', fx(){ RES(h,{t:8, m:10}); h.bonus.demand=(h.bonus.demand||1)*1.2; storyAdvance(h,60); return '"Someone has to haunt you properly." She stays, and the manor feels warmer for it (+20% clients).'; }},
      {label:'Tell her it\'s her choice', fx(){ RES(h,{t:12, m:6}); h.bonus.demand=(h.bonus.demand||1)*1.2; storyAdvance(h,60); return 'She thinks about it for a long time. Then she takes your hand, as much as a ghost can. "I choose here." (+20% clients)'; }}]})},
  tankard:{hintMid:'The sailors are restless.', hintEnd:'The first barrel is nearly ready.',
    mid:h=>({who:RID(h), scene:'job_bartender', text:'By the second verse both crews are on their feet, and the first chair is already in the air.', choices:[
      check('Wade in','Strength',SSTR(h),40, ()=>{ RES(h,{t:4}); h.rep=clamp(h.rep+3); storyAdvance(h,20); return 'You end the brawl mostly by accident, standing in the middle and refusing to fall over. The dock talks about it for weeks.'; }, ()=>{ S.sam.energy=Math.max(0,S.sam.energy-30); RES(h,{m:4}); storyAdvance(h,10); return `${RN(h)} drags you out of the pile by your collar, laughing her head off.`; }),
      {label:`Let ${RN(h)} handle it`, fx(){ RES(h,{t:2, m:6}); S.gold-=50; storyAdvance(h,20); return 'She handles it with a barstool. Damages: 50g. Worth it.'; }},
      {label:'Hide behind the bar', fx(){ RES(h,{t:-5, m:-4}); storyAdvance(h,10); return `${RN(h)} notices. ${RN(h)} remembers.`; }}]}),
    end:h=>({who:RID(h), scene:'job_bartender', text:`The first barrel of Ironsong ale in years is tapped at the Tankard. ${RN(h)} is crying into it and pretending she isn't.`, choices:[
      {label:'Ship it to every house you own', fx(){ S.flags.ironsong=true; storyAdvance(h,60); return 'Ironsong ale flows in every house (bar income +15% everywhere).'; }},
      {label:'Keep it Tankard-exclusive', fx(){ h.bonus.bar=(h.bonus.bar||1)*1.2; h.rep=clamp(h.rep+6); storyAdvance(h,60); return 'People cross the whole city for a pint (Tankard bar income +20% more, +house popularity).'; }}]})},
  pavilion:{hintMid:'Rehearsals are underway.', hintEnd:'The Moonlily Festival is coming.',
    mid:h=>({who:RID(h), scene:'job_dancer', text:`"It's only twisted," ${RN(h)} says, before you can ask. She tries to stand and can't. The premiere is in three days.`, choices:[
      {label:'Postpone and let her rest', fx(){ const R=resident(h); if(R) R.energy=maxEnergy(R); RES(h,{t:6, m:4}); h.rep=clamp(h.rep-1); storyAdvance(h,20); return 'The premiere slips a week. She heals fully, and she doesn\'t forget that you chose her over the schedule.'; }},
      {label:'Ask her to dance through it', fx(){ RES(h,{t:-6, m:-10}); h.rep=clamp(h.rep+2); storyAdvance(h,10); return 'She does. Perfectly. She doesn\'t look at you once afterward.'; }},
      {label:'Massage the ankle yourself', fx(){ const R=resident(h); if(hasPast('massage')){ RES(h,{t:6, m:8}); storyAdvance(h,20); if(R && (R.intim||0)>=1 && bestSamAct(R)) return housePrivate(R, ['kiss','manual_give','oral_give','missionary'], `Old skills settle right into your hands. By the time the knot eases from her ankle, ${RN(h)} isn't letting your wrist go—tugging you onto the rehearsal cushions with flushed cheeks.`, 'In the rehearsal hall after evening practice, Sylphine draws Sam down beside her.'); return 'Old skills. It\'s good as new by morning, and she\'s looking at you differently.'; } RES(h,{t:3, m:3}); storyAdvance(h,20); return 'You have no idea what you\'re doing. She appreciates the effort anyway.'; }}]}),
    end:h=>({who:storyNpc('ilyana'), scene:'portrait', text:`Ilyana sets her cup down. "Open the gate this year," she says. "Let the quarter dance in here, under the lanterns, with ${RN(h)} on the stage. It will cost you. I think it is worth it."`, choices:[
      pay('Sponsor the festival', 300, h, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+8); houseStaff(h).forEach(w=>{ moodAdd(w, 8); w.popularity=clamp(w.popularity+5); }); return 'The Pavilion glows all night. Every dancer\'s popularity climbs.'; }),
      {label:'Not this year', fx(){ storyRetry(h); return 'Ilyana nods serenely. "Next year, then."'; }}]})},
  veil:{hintMid:'Zaria has a wager in mind.', hintEnd:'Vharra and Zaria have unfinished business.',
    mid:h=>({who:RID(h), scene:'job_courtesan', text:`${RN(h)} bets you can't survive one night working the Veil's floor yourself: greeting, pouring, keeping the peace, the works.`, choices:[
      check('Take the bet','Charm',S.sam.charm,45, ()=>{ const R=resident(h); RES(h,{t:6, m:6}); S.gold+=150; storyAdvance(h,20); if(R && (R.intim||0)>=2 && bestSamAct(R)) return housePrivate(R, ['oral_give','cowgirl','missionary','kiss'], `You survive. Barely. ${RN(h)} tosses a pouch of 150g onto the bar, then locks the back parlor door and pushes you onto the velvet settee. "Winner's privilege, darling. I collect in person."`, 'After hours behind the Veil, Zaria settles a wager privately with Sam.', 'Winnings: +150g.'); return 'You survive. Barely. Zaria pays up, impressed: +150g.'; }, ()=>{ RES(h,{m:8, l:2}); storyAdvance(h,20); return 'You last until midnight. Zaria collects her winnings—your pride—and kisses your cheek.'; }),
      {label:'Decline', fx(){ RES(h,{m:-3}); storyAdvance(h,10); return '"Boring," she pouts.'; }}]}),
    end:h=>({who:RID(h), scene:'casual', text:'You sit down in the third seat and pick up the deck. Two demons with two hundred years of grudge between them watch your hands.', choices:[
      check('Deal fairly and keep the peace','Business',S.sam.business,45, ()=>{ storyAdvance(h,60); houseStaff(h).forEach(w=>moodAdd(w, 10)); h.rep=clamp(h.rep+5); return 'A draw, somehow. They shake hands. The whole Veil exhales. (Staff mood way up.)'; }, ()=>{ storyAdvance(h,40); RES(h,{m:-5}); return 'Zaria loses. She sulks for a week. But the feud is over.'; }),
      {label:'Cheat for Zaria', fx(){ RES(h,{t:6, m:10}); h.rep=clamp(h.rep+2); storyAdvance(h,60); return 'Zaria wins. Vharra absolutely knows, and respects it.'; }}]})},
  wayfarer:{hintMid:'A mysterious traveler has arrived.', hintEnd:'The merchant guild is watching.',
    mid:h=>({who:RID(h), scene:'job_reception', text:`The cloaked woman asks ${RN(h)} for a room and "absolute discretion." She puts a coin on the desk before anyone has told her the price.`, choices:[
      {label:'Give her the best room, on the house', fx(){ S.flags.traveler=true; S.gold-=40; RES(h,{t:3}); storyAdvance(h,20); return 'She thanks you quietly and leaves before dawn. Bettina has a feeling about this.'; }},
      {label:'Charge her triple', fx(){ S.gold+=120; RES(h,{t:-3}); storyAdvance(h,20); return `She pays without blinking: +120g. ${RN(h)} disapproves.`; }}]}),
    end:h=>({who:RID(h), scene:'job_reception', text:'The merchant guild offers the Wayfarer an exclusive charter: every guild caravan stops here first.', choices:[
      S.flags.traveler ? {label:'Accept (the guildmaster\'s wife insists it\'s free)', fx(){ h.bonus.charter=60; storyAdvance(h,60); return 'The cloaked traveler was the guildmaster\'s wife. The charter is free: +60g every week.'; }}
        : pay('Buy the charter', 500, h, ()=>{ h.bonus.charter=60; storyAdvance(h,60); return 'The guild caravans arrive like clockwork: +60g every week.'; }),
      {label:'Not yet', fx(){ storyRetry(h); return 'The offer stands, for now.'; }}]})},
  sanctuary:{hintMid:'Caelia has a late confession for you.', hintEnd:'The Lantern Quarter holds its Candlemas.',
    mid:h=>({who:RID(h), scene:'job_chapel', text:`After bells fade, ${RN(h)} pats the seat beside her inside the velvet confessional. "You spend every week listening to everyone else's troubles, Sam. Tell the priestess one selfish wish."`, choices:[
      {label:'Wish for her to take a night off', fx(){ RES(h,{t:5, m:8}); storyAdvance(h,20); return 'Her wings flutter lightly against the wood screen. "Greedy boy," she whispers—and smiles all week.'; }},
      {label:'Tell her the truth of what you want', fx(){ const R=resident(h); RES(h,{t:4, l:4}); storyAdvance(h,20); if(R && (R.intim||0)>=2 && bestSamAct(R)) return housePrivate(R, ['oral_give','manual_give','missionary','kiss'], `Caelia shuts the velvet curtain behind you, halo burning warm gold in the tight space as she slides straight into your lap. "Then take your penance, Sam."`, 'Inside the velvet confessional after bells, Caelia closes the curtain with Sam.', '', 'chapel'); return '"Already sitting beside me," Caelia purrs, grazing your knuckles with bright halo-warm fingers.'; }}]}),
    end:h=>({who:RID(h), scene:'casual', text:`"A free vigil," ${RN(h)} says. "For the whole ward, here, until sunrise. Food and candles, and nobody turned away." She sets the crown on your head. "Or we keep the velvet rope up and give the regulars a quiet night. You choose."`, choices:[
      pay('Sponsor the Candlemas Vigil', 350, h, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+8); houseStaff(h).forEach(w=>moodAdd(w, 8)); return 'Hymns and laughter echo down the quarter until dawn. The Cloister\'s name is spoken with reverence—and fond grins.'; }),
      {label:'Keep the doors velvet-roped for regulars', fx(){ storyAdvance(h,60); h.rep=clamp(h.rep+4); h.bonus.demand=(h.bonus.demand||1)*1.1; return 'Exclusive candlelight suites draw steady crowds (+10% clients).'; }}]})},
  atelier:{hintMid:'Nadia wants to fine-tune the parlor acoustics.', hintEnd:'An exhibition of clockwork art comes to Hollowmere.',
    mid:h=>({who:RID(h), scene:'casual', text:`"Time the interval between pulses," ${RN(h)} says, kneeling at the open vent. "When I tell you, put one drop of oil on the third joint. One drop, Sam, not two."`, choices:[
      check('Calibrate by ear','Technique',S.sam.technique,45, ()=>{ RES(h,{t:5, m:6}); storyAdvance(h,20); return 'The conduits settle into a warm low thrum that relaxes every room upstairs.'; }, ()=>{ RES(h,{m:3}); storyAdvance(h,10); return 'A pipe whistles loudly before settling down. Nadia laughs—rare and genuine.'; }),
      {label:'Compliment how she looks in the brass glow', fx(){ RES(h,{t:3, m:7, l:2}); storyAdvance(h,20); return 'Her cheek panels flush soft rose gold. "Anomaly noted, Sam."'; }}]}),
    end:h=>({who:RID(h), scene:'portrait', text:`${RN(h)} turns from the window. "I can open the suites and unveil the divan for all of them. Or the doors stay shut, and it remains something only our patrons have seen. I find that I have a preference. I would still like to hear yours."`, choices:[
      pay('Host the Guild Showcase', 400, h, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+7); h.bonus.demand=(h.bonus.demand||1)*1.12; return 'Merchants and inventors leave fascinated and generous (+12% clients).'; }),
      {label:'Keep it private for patrons only', fx(){ storyAdvance(h,60); h.rep=clamp(h.rep+4); houseStaff(h).forEach(w=>moodAdd(w, 8)); return 'Regulars pack the salon all month.'; }}]})}
};
Object.entries(STORY_EXTRA).forEach(([k,x])=>{ const st = STORIES[k]; st.beats.splice(1,0,x.mid); st.beats.push(x.end); st.hint.splice(1,0,x.hintMid); st.hint.push(x.hintEnd); });

// A chapter as the event the player sees: the beat from STORIES (choice page, checks, effects) plus its lead-in pages from
// data/housestories/ (prose only: {first}/{name} = the resident, {house}, {loc}). The lead-in is pictured with the resident
// unless the chapter is already hers or the page says who:"ev"; a house without its resident just gets the choice page.
const HSTORY = noMeta(needData('housestories'));
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
  return `<section class="card"><h2>📖 ${esc(st.title)} <span class="muted">(${Math.min(b,st.beats.length)}/${st.beats.length})</span></h2>${done?'<span class="good">Complete!</span>':`<div class="muted">${esc(st.hint[b])}</div><div class="muted">Next chapter: ${h.rep<need?`needs this house's popularity at ${need} (now ${Math.round(h.rep)})`:'coming soon'}.</div>`}</section>`;
}
