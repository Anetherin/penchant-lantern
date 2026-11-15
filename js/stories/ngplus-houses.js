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
STORIES.skyhook = {title:'Contraband Winds', hint:[
  'Something is hidden in the Skyhook\'s cellar.',
  'Rinna\'s old first mate is in port.',
  'The air navy has noticed the Skyhook.',
  'Rinna has one last flight in her.'], beats:[
  h=>({who:RID(h), scene:'job_bartender', text:`A crate in the Skyhook's cellar is ticking. ${RN(h)} looks at it, then at you, with the expression of a captain who knows exactly how it got there. "So. Funny story. I may have agreed to hold that for someone in, ah, 1180."`, choices:[
    check('Open it carefully','Technique',S.sam.technique,35, ()=>{ S.gold+=400; storyAdvance(h); return 'Inside: a clockwork navigation engine, very old, very valuable, and very much not ticking down to anything. A collector buys it the same evening. +400g'; }, ()=>{ S.sam.energy=Math.max(0,S.sam.energy-20); storyRetry(h); return 'A spring goes off in your face. Nothing explodes, but nobody\'s brave enough to try again this week.'; }),
    {label:`Make ${RN(h)} deal with her own crate`, fx(){ const R=resident(h); if(R){ moodAdd(R, -3); gainTrust(R,2); } storyAdvance(h,20); return `${RN(h)} grumbles, hauls it to the cliff edge and drops it into the clouds. "There. Problem solved." Somewhere below, something goes "bong."`; }}]}),
  h=>({who:RID(h), scene:'casual', text:`A grizzled sky-sailor named Tobbin walks into the Skyhook and salutes ${RN(h)}. "Captain. The old crew's back together. One last run, and we need you at the helm."\n\n${RN(h)} doesn't answer right away. She looks at you.`, choices:[
    {label:'"Go. The Skyhook will be here when you get back."', fx(){ const R=resident(h); if(R){ gainTrust(R,8); moodAdd(R, 10); R.energy=clamp(R.energy-30,0,maxEnergy(R)); } S.gold+=300; storyAdvance(h); return `She's gone four days. She comes back windburned, grinning, with 300g of "honest" salvage and a story she won't stop telling. "Thanks, boss. I needed that."`; }},
    check('Talk Tobbin into retiring here instead','Charm',S.sam.charm,45, ()=>{ h.rep=clamp(h.rep+3); storyAdvance(h); return 'Tobbin takes one look at the bar, the view, and the free drinks, and decides retirement sounds nice. He becomes the Skyhook\'s most loyal (and loudest) regular.'; }, ()=>{ storyRetry(h); return 'Tobbin laughs and says he\'ll ask again next time he\'s in port.'; })]}),
  h=>({who:'npc_ashby', text:`Commodore Ashby Vell of the air navy inspects the Skyhook with a white glove. "Unlicensed moorings, undeclared cargo, and a proprietor with... colorful history. I could close this place by morning, Mr. Takahashi. Or we could discuss a license."`, choices:[
    pay('Buy the license', 900, h, ()=>{ storyAdvance(h,40); h.bonus.demand=(h.bonus.demand||1)*1.1; return 'Ashby stamps the papers with obvious disappointment. Licensed moorings bring licensed ships: the Skyhook gets busier.'; }),
    check('Find a hole in his paperwork','Business',S.sam.business,55, ()=>{ storyAdvance(h,40); h.rep=clamp(h.rep+3); return 'The moorings predate the navy\'s charter by thirty years. Ashby reads your brief twice and leaves without a word. The regulars talk about it for weeks.'; }, ()=>{ storyRetry(h); return 'Ashby smiles. "I\'ll be back with an inspector."'; })]}),
  h=>({who:RID(h), scene:'portrait', text:`${RN(h)} has spent months fixing the wreck the Skyhook was built around. Tonight she wants to see if it flies.\n\n"Just once. Just to the edge of the clouds. You're coming with me."`, choices:[
    check('Take the helm together','Strength',S.sam.strength,45, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+6); return `The old ship groans off its cradle and climbs, wobbling, into the sunset. The whole dock cheers. When you land, ${RN(h)} kisses the deck, then you, then the deck again.\n\n"Keep my wages. A captain doesn't charge her own crew."` + freeResident(h); }, ()=>{ storyRetry(h); return 'A rope snaps. The ship settles back into its cradle with a sad creak. "Next week," Rinna says. "We\'ll get her up."'; }),
    {label:'Let her fly it alone', fx(){ storyAdvance(h,60); h.rep=clamp(h.rep+4); const R=resident(h); if(R) gainTrust(R,6); return `You watch from the cliff as ${RN(h)} takes the old ship around the harbor once and brings her home. She's crying a little when she lands, and pretends it's the wind.` + freeResident(h); }}]})
]};
STORIES.pearl = {title:'The Drowned Bell', hint:[
  'Guests hear something under the grotto at night.',
  'The harbormaster wants a word about the Grotto\'s lease.',
  'Maris has been keeping a secret.',
  'The Drowned Bell is waiting.'], beats:[
  h=>({who:RID(h), scene:'job_bath', text:`At midnight, every pearl in the Grotto dims at once, and a bell tolls somewhere deep under the water. Guests flee in their towels. ${RN(h)} just keeps folding linens. "It does that," she says. "Ignore it."`, choices:[
    check('Dive in and look','Strength',S.sam.strength,40, ()=>{ storyAdvance(h); return 'Far below the tide pools, you glimpse a huge bronze bell, green with age, chained to the rock. You surface gasping. Maris won\'t meet your eyes.'; }, ()=>{ S.sam.energy=Math.max(0,S.sam.energy-30); storyRetry(h); return 'The water is far colder and deeper than it looks. You surface empty-handed and shivering.'; }),
    check(`Ask ${RN(h)} about it`,'Charm',S.sam.charm,45, ()=>{ storyAdvance(h); const R=resident(h); if(R) gainTrust(R,3); return `"There is a bell," ${RN(h)} admits at last. "I was asked to keep it quiet. I have, mostly."`; }, ()=>{ storyRetry(h); return `${RN(h)} tells you it's the tide. Then that it's a ghost. Then that it's none of your business.`; })]}),
  h=>({who:'npc_harbormaster', text:`Harbormaster Quill polishes his spyglass. "The Grotto sits on harbor land, Mr. Takahashi. The old lease says whoever owns it keeps 'the Bell' silent. Guests are complaining. If it rings again, the guild takes the Grotto back."`, choices:[
    pay('Pay to have the lease rewritten', 800, h, ()=>{ storyAdvance(h,40); return 'Quill strikes out the clause with visible relief. "Between us, nobody\'s known what it meant for a century."'; }),
    check('Read the lease properly','Business',S.sam.business,50, ()=>{ storyAdvance(h,40); S.gold+=250; return 'The lease also says the harbor owes the Grotto keeper "a pearl\'s weight in silver yearly." It hasn\'t been paid in a century. Quill pays the first installment, sweating. +250g'; }, ()=>{ storyRetry(h); return 'The lease is written in archaic Harbor Cant. You need more time.'; })]}),
  h=>({who:RID(h), scene:'portrait', text:`${RN(h)} finally tells you the truth. Three hundred years ago she made a bargain with the sea: the Grotto, its warmth and its pearls, in exchange for staying to keep the Bell asleep. She has never left the harbor since.\n\n"I don't regret it. But I'd like to see a forest again, someday."`, choices:[
    {label:'"Then we find a way to set you free."', fx(){ const R=resident(h); if(R){ gainTrust(R,8); moodAdd(R, 8); } storyAdvance(h); return `${RN(h)} looks at you for a long moment. "You really mean that." It isn't a question.`; }},
    {label:'"You don\'t have to carry this alone anymore."', fx(){ const R=resident(h); if(R){ gainTrust(R,5); moodAdd(R, 10); } storyAdvance(h); return `For the first time you've seen, ${RN(h)} laughs without hiding it.`; }}]}),
  h=>({who:RID(h), scene:'job_bath', text:`The Bell is ringing again, louder each night. ${RN(h)} stands at the edge of the deepest pool. "The bargain can be ended, if someone takes the Bell's toll in my place: a gift the sea will accept."`, choices:[
    pay('Offer the sea a fortune in pearls', 1500, h, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+6); return `The pearls sink, glowing, into the dark. The Bell tolls once more, softly, then never again. ${RN(h)} walks out of the harbor and up into the hills the next morning, and comes back that evening with an armful of wildflowers.\n\n"I'm staying," she says. "By choice, this time. Keep my wages."` + freeResident(h); }),
    check('Ring the Bell yourself, and bargain','Charm',S.sam.charm,60, ()=>{ storyAdvance(h,60); h.rep=clamp(h.rep+6); return `You dive, ring the Bell with both fists, and somehow talk the sea into a better deal: the Grotto stays warm, the pearls keep glowing, and ${RN(h)} is free to come and go as she likes.\n\nShe stays. "Someone has to keep an eye on you. Keep my wages."` + freeResident(h); }, ()=>{ S.sam.energy=0; storyRetry(h); return 'The sea is not in a bargaining mood. You are fished out of the pool half-frozen.'; })]})
]};
STORIES.foundry = {title:'Raising the Rafters', hint:[
  'The west wing timbers groan every time the wind blows.',
  'An old dwarven mason has an eye on Ironwood Hall.',
  'Locked doors hide the hall\'s sunken hearth.',
  'Ironwood Hall is ready for its grand reopening.'], beats:[
  h=>({who:RID(h), scene:'casual', text:`Rain drips cleanly into three strategically placed buckets along Ironwood Hall's upper gallery. ${RN(h)} tosses you a pry bar. "Half these rooms were walled shut to duck taxes twenty years back. Help me pull a beam down?"`, choices:[
    check('Brace the main beam together','Strength',S.sam.strength,40, ()=>{ storyAdvance(h); if((h.damaged||0)>0) h.damaged--; return 'Timber snaps straight into place. You pry open one sealed wing on the spot (-1 damaged room)!'; }, ()=>{ storyRetry(h); return 'The rusted iron bolt refuses to budge tonight.'; }),
    pay('Hire a roofing crew', 450, h, ()=>{ storyAdvance(h); if((h.damaged||0)>0) h.damaged--; return 'Shingles go up before nightfall and one sealed wing opens up (-1 damaged room).'; })]}),
  h=>({who:'npc_foreman', text:`Foreman Krag thumps a boot against the stone hearth. "I built half the foundries on this street, lad. That sunken flue can heat eighteen rooms easy—if you clear the slag and pay union timber rates."`, choices:[
    check('Bargain down timber costs','Business',S.sam.business,50, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+3); return 'Krag respects a hard ledger. He clears the flue himself and knocks a discount off every plank.'; }, ()=>{ storyRetry(h); return 'Krag shakes his beard slowly and walks out whistling.'; })]}),
  h=>({who:RID(h), scene:'job_security', text:`With the cellar cleared, ${RN(h)} uncovers an intact dwarven forge-boiler beneath the stairs—warm enough to steam towels and dry timber twice as fast.`, choices:[
    check('Rebuild the boiler manifold','Technique',S.sam.technique,45, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+4); if((h.damaged||0)>0) h.damaged--; return 'Steam hisses smoothly through brass pipes. Another sealed room unlatches (-1 damaged room)!'; }, ()=>{ storyRetry(h); return 'A gasket blows warm soot in both your faces. Try again next week.'; })]}),
  h=>({who:RID(h), scene:'portrait', text:`The great hall finally gleams with oiled oak and hung iron lanterns. ${RN(h)} leans on her maul, exhausted and grinning ear to ear. "She's loud, she's huge, and she's ours, boss."`, choices:[
    {label:'Raise a tankard to Ironwood Hall', fx(){ storyAdvance(h,60); h.rep=clamp(h.rep+6); h.bonus.demand=(h.bonus.demand||1)*1.12; return `Half of Foundry Row pours in to celebrate (+12% clients). ${RN(h)} waves off her ledger. "Keep my pay. Nobody walks out on work she built with her own two hands."` + freeResident(h); }}]})
]};
STORIES.conservatory = {title:'Night-Blooming Blend', hint:[
  'An exotic orchid cutting refuses to bloom.',
  'A rival perfumer tries to poach Maren\'s recipes.',
  'The conservatory vents need a rare resin.',
  'The moon-orchid is about to open.'], beats:[
  h=>({who:RID(h), scene:'casual', text:`Mist drifts warm beneath the vaulted glass. ${RN(h)} kneels beside an unopened black-crimson bud, fox tail curled anxiously over her ankles. "Night-blooming dusk orchid," she murmurs. "One drop of nectar doubles any censer's pull—if we keep it alive."`, choices:[
    check('Adjust the glasshouse humidity by hand','Technique',S.sam.technique,40, ()=>{ storyAdvance(h); return 'Condensation clears cleanly off the panes. The petals stir open a fraction.'; }, ()=>{ storyRetry(h); return 'Too damp—two leaves curl back before you open the louvers.'; })]}),
  h=>({who:RID(h), scene:'job_host', text:`A merchant from the Spice Guild corners ${RN(h)} in the lounge, sliding a heavy pouch across the table for her censer notebooks. She tilts her fox ears back toward you, waiting.`, choices:[
    check('Out-charm the guild buyer into becoming a patron','Charm',S.sam.charm,55, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+4); return 'He leaves the gold anyway—for a private table every Friday instead.'; }, ()=>{ storyRetry(h); return 'He snaps his briefcase shut and threatens to undercut your resin suppliers.'; })]}),
  h=>({who:RID(h), scene:'casual', text:`All five censers need fresh myrrh and lotus resin before the Conservatory's seasonal salon. ${RN(h)} holds up a shipping manifest with an apologetic twitch of her ears.`, choices:[
    pay('Import a full crate of temple resin', 600, h, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+4); return 'Sweet golden smoke fills every suite to the rafters.'; }),
    check('Mix a custom house blend with Maren','Wits',S.sam.wits||S.sam.business,50, ()=>{ storyAdvance(h); return 'Your improvised amber-orchid blend lingers three times longer than guild stock.'; }, ()=>{ storyRetry(h); return 'A smoky cough drives you both out onto the terrace until sunset.'; })]}),
  h=>({who:RID(h), scene:'portrait', text:`Midnight strikes and the black-crimson dusk orchid unfurls completely under the glass dome, flooding the Conservatory with warm, dizzying sweetness. ${RN(h)} presses close against your arm, grinning.`, choices:[
    {label:'Let the glasshouse breathe', fx(){ const R=resident(h); storyAdvance(h,60); h.rep=clamp(h.rep+6); h.bonus.demand=(h.bonus.demand||1)*1.12; const base=`Patrons linger past dawn (+12% clients). ${RN(h)} tucks an orchid behind your ear. "No wages from me, darling—you helped bloom the best room in town."`; if(R && (R.intim||0)>=2 && bestSamAct(R)) return housePrivate(R, ['sex_vaginal','oral_give','kiss'], `${base} Once the last guest steps out onto the terrace, she pulls you down beneath the blooming glass dome.`, 'Beneath the blooming midnight orchid in the glasshouse conservatory, Maren pulls Sam down beside her.', freeResident(h).trim()); return base + freeResident(h); }}]})
]};
STORIES.lyceum = {title:'Final Examination', hint:[
  'Former students want a private salon.',
  'The Academy board disputes your charter.',
  'Vivienne writes an advanced curriculum.',
  'Graduation night at the Velvet Lyceum.'], beats:[
  h=>({who:RID(h), scene:'casual', text:`Gilded mirrors double the candlelight inside ${h.name}'s empty lecture hall. ${RN(h)} taps a riding crop lightly against an oak lectern. "Word got back to my former patronesses. Either we polish our salon's standards tonight, or society calls us a common brothel."`, choices:[
    check('Review the etiquette ledger with her','Charm',S.sam.charm,50, ()=>{ storyAdvance(h); return 'She lowers the crop with a faint smile. "Better. You don\'t embarrass easily, Sam."'; }, ()=>{ storyRetry(h); return 'Professor Vivienne marks a crisp red X beside your posture.'; })]}),
  h=>({who:RID(h), scene:'portrait', text:`Three Academy governors arrive to contest your use of the name "Lyceum." They expect flustered apologies; ${RN(h)} pours four glasses of plum wine and leaves the negotiation to you.`, choices:[
    check('Prove the deed carries legacy naming rights','Business',S.sam.business,55, ()=>{ storyAdvance(h); h.rep=clamp(h.rep+5); return 'One governor turns pale at the original founders\' clause; the other two immediately ask about private membership.'; }, ()=>{ storyRetry(h); return 'They adjourn in icy silence. Prepare stronger paperwork.'; })]}),
  h=>({who:RID(h), scene:'casual', text:`With high society mollified, ${RN(h)} asks you to co-sign an advanced evening syllabus—requiring imported velvet drapes and full-length gilded mirrors in every practice booth.`, choices:[
    pay('Outfit the mirror suites', 700, h, ()=>{ storyAdvance(h); return 'Every suite shines like a noble salon. Clients notice immediately.'; }),
    {label:'Start with the main hall first', fx(){ storyAdvance(h); return 'Vivienne arches one eyebrow, nods slowly, and drills the staff twice as hard anyway.'; }}]}),
  h=>({who:RID(h), scene:'portrait', text:`The Velvet Lyceum's first open soirée ends in applause and discreet envelopes stuffed with gold. ${RN(h)} removes her spectacles, polishes one lens, and locks the salon door behind the last carriage.`, choices:[
    {label:'Accept her private tuition', fx(){ const R=resident(h); storyAdvance(h,60); h.rep=clamp(h.rep+6); h.bonus.demand=(h.bonus.demand||1)*1.12; const base=`Nobles book out next month on the spot (+12% clients). ${RN(h)} slips her contract into the desk drawer. "Keep my wages, Sam. Consider it a scholarship."`; if(R && (R.intim||0)>=2 && bestSamAct(R)) return housePrivate(R, ['domme','sex_ride','oral_give','kiss'], `${base} Locking the gilded mirror suite behind you, Vivienne taps the edge of the velvet desk with a knowing smile.`, 'After the Velvet Lyceum premiere, Vivienne locks the salon door with Sam.', freeResident(h).trim()); return base + freeResident(h); }}]})
]};
