'use strict';
// Romance arcs: six beats each. Choices shift trust (t), mood (m) and lewdness (l).
// Beat 2 is a "mishap" (shower / walk-in), beat 4 a conflict where choices can really hurt.
// The final beat makes her Sam's lover (Devoted). Its image uses her private POV scene.
const C = (label, eff, res) => ({label, eff: typeof eff==='function' ? eff : Object.assign({}, eff, res!==undefined?{res}:{})});
const stay = (res) => C('Stay with her', {t:5, m:8}, res || 'Something between them shifts, just a little.');
const light = (res) => C('Keep it light', {t:1, m:2}, res || '{N} smiles. Maybe next time.');
const finale = () => [C('Say yes', {t:6, m:12}, ''), C('Not yet', {t:1, m:-3, hold:true}, '{N} nods. "I can wait. Don\'t make it too long."')];
ARCS = {
  kaede:[
    {title:'Opening Up', scene:'sam_date', text:"Kaede drags Sam onto the roof with two stolen bottles of wine. \"Back in my party, nobody ever had my back. Then this skinny guy in a hoodie jumps in front of a goblin for me.\" She bumps his shoulder. \"Idiot.\" She doesn't move away.", choices:[stay(), light()]},
    {title:'Wrong Door', scene:'shower', text:"Sam opens the washroom door and finds Kaede mid-towel, every hair on her tail standing straight up.", choices:[
      C('Apologize and bolt', {t:1, m:-2}, 'Kaede laughs about it for ten straight minutes. Through the door. Loudly.'),
      C('Compliment her', w=> w.lewd>=40 ? {t:2, m:6, l:3, res:'She grins, not bothering with the towel very hard. "Smooth, boss."'} : {t:-2, m:-4, res:'"GET OUT." The towel hits him in the face.'}),
      C('Stand there like an idiot', {m:3, l:2}, '"Take a picture, it lasts longer." Sam has no idea how she knows that phrase.')]},
    {title:'Getting Closer', scene:'casual', text:"Kaede shows up at Sam's door with a bandaged hand and a grin, from sparring \"for fun.\" While he patches her up, her tail keeps brushing his arm. Neither of them mentions it.", choices:[stay(), light()]},
    {title:'The Old Party', scene:'portrait', text:"Kaede's old party leader turns up at the bar: a new contract, a deep dungeon, and a spot for her if she wants it. Kaede looks at Sam and waits.", choices:[
      C('"Go, if it\'s what you want."', {t:4, m:-4}, 'She stays. Later she grumbles: "You weren\'t supposed to make it easy."'),
      C('"Stay. Please."', {t:6, m:6}, 'Kaede turns the leader down without even looking at him.'),
      C('Say nothing', {t:-6, m:-10}, 'She leaves for two days without a word. When she comes back, she doesn\'t mention it. Neither does he. It sits between them for a while.')]},
    {title:'Rooftops', scene:'sam_date', text:"Kaede teaches Sam to run the rooftops of Hollowmere at night. He is very, very bad at it.", choices:[
      C('Keep trying', w=>{ samStat('strength',1); return {t:3, m:6, res:'By the end of the night he makes one jump cleanly. She cheers loud enough to wake the street.'}; }),
      C('Fake a sprained ankle so she carries you', {m:8, l:2}, 'She sees right through it. She carries him anyway, the whole way home.')]},
    {title:'Together', scene:'final', text:"After closing, Kaede corners Sam in the kitchen. \"I'm bad at this, so I'll just say it. I'm not going anywhere. Not for the money. For you.\" Her ears are bright red. She takes his hand and leads him upstairs, and the door closes behind them.", choices:finale()}
  ],
  yui:[
    {title:'Opening Up', scene:'sam_date', text:"Yui finds Sam on the back steps with two cups of something that is almost, but not quite, coffee. They talk about home for hours: trains, convenience stores, the vending machine on the 4th floor. She cries a little. So does he.", choices:[stay(), light()]},
    {title:'Bath Time Budget Meeting', scene:'walkin', text:"Hunting for the ledger, Yui walks straight into the washroom while Sam is in the tub. She does not leave. She stares fixedly at the ceiling. Then the floor. Then the ceiling again.", choices:[
      C('"Could you pass me a towel?"', {t:2, m:3}, 'She throws it directly at his face and flees.'),
      C('Act completely casual', {m:5, l:2}, 'She stammers through the entire weekly budget review, right there, without once looking down. It\'s honestly impressive.'),
      C('Yell', {t:-2, m:-3}, 'She flees, mortified, and avoids him for three days.')]},
    {title:'Getting Closer', scene:'casual', text:"Yui reveals she's been \"recreating\" instant ramen in the kitchen for a month. It is terrible. They eat all of it. \"Remember when you covered my shift that time?\" she asks. \"I liked you before the truck, you know.\"", choices:[stay(), light()]},
    {title:'The Way Home', scene:'portrait', text:"A traveling mage claims he can send otherworlders home. Yui shows Sam the flyer with shaking hands. \"If it's real... would you go?\"", choices:[
      C('"I\'d stay. This is home now."', {t:5, m:5}, 'She lets out a breath she\'s been holding for a week.'),
      C('"I don\'t know."', {t:-3, m:-8}, 'Honest. It still hurts. She nods and doesn\'t bring it up again.'),
      C('"Only if you came with me."', {t:7, m:8}, 'She laughs and wipes her eyes. (The mage turns out to be a fraud. Neither of them is disappointed.)')]},
    {title:'Festival Night', scene:'sam_date', text:"Yui drags Sam to the harvest festival and wins him a prize at the ring toss: a deeply ugly stuffed wyvern. She insists he carry it all night.", choices:[
      C('Wear it like a hat, proudly', {m:9, t:2}, 'She laughs so hard she has to sit down.'),
      C('Win her one back', {t:3, m:6}, 'It takes eleven tries. She keeps the slightly-less-ugly griffin on her desk forever.')]},
    {title:'Together', scene:'final', text:"Yui takes Sam's hand under the table during the staff meeting and doesn't let go. Afterward, in the empty office: \"Second life. Second chance. I'm not wasting this one being shy.\" She kisses him, and pulls him toward her room.", choices:finale()}
  ],
  nerys:[
    {title:'Opening Up', scene:'sam_date', text:"Nerys complains, at length, that the contract makes her feel it when Sam is sad. \"It's very inconvenient. Stop being sad.\" She sits next to him until he isn't.", choices:[stay(), light()]},
    {title:'Oops', scene:'shower', text:"Sam opens the washroom door to find Nerys lounging in the tub, very obviously waiting. \"Oops,\" she says, not moving at all.", choices:[
      C('Leave politely', {t:3, m:-3}, 'She looks almost disappointed. Almost.'),
      C('Call her bluff and sit down on the stool', {l:3, m:8}, 'For once, SHE is the one who goes red. She recovers quickly. Mostly.'),
      C('Toss her a towel', {m:2}, 'She catches it with her tail and drapes it over his head instead.')]},
    {title:'Getting Closer', scene:'casual', text:"Sam finds Nerys reading a romance novel in the lounge. She hides it in a panic, then throws a pillow at him. Later he finds it on his bed with a page dog-eared and a note: \"For research.\"", choices:[stay(), light()]},
    {title:'Leash', scene:'portrait', text:"A demon noble mocks Nerys in front of the whole lounge for being \"leashed to a human.\" She laughs it off. That night, she snaps at Sam over nothing.", choices:[
      C('Defend her, publicly, the next day', {t:6, m:6}, 'Sam has the demon noble thrown out. Nerys pretends not to care. Her tail gives her away.'),
      C('Let her handle it', {m:-4}, 'She does, loudly. Then sulks for days.'),
      C('Offer to break the contract', {t:-8, m:-12}, 'She goes very still. "You want me gone?" It takes him a long, miserable hour to fix that.')]},
    {title:'Night Market', scene:'sam_date', text:"Nerys drags Sam to the Underdistrict night market and buys him every cursed snack she can find.", choices:[
      C('Eat everything she hands you', {m:9, t:2}, 'One of them makes his ears glow for an hour. She has never been happier.'),
      C('Buy her a hair ribbon', {t:4, m:6}, 'She acts unimpressed. She wears it every day after.')]},
    {title:'Together', scene:'final', text:"A demon scholar offers to dissolve the contract. Nerys tears up his paperwork in front of him. \"I'll keep it,\" she tells Sam afterward, looking anywhere but at him. \"I've grown... attached.\" Then she looks at him, and stops pretending.", choices:finale()}
  ],
  elowen:[
    {title:'Opening Up', scene:'sam_date', text:"Elowen insists on a \"check-up\" and spends most of it nervously talking about herbs. At the end she admits she's never been this far from home, and that Sam makes it feel less far.", choices:[stay(), light()]},
    {title:'Tea Service', scene:'walkin', text:"Elowen brings herbal tea to Sam's room at exactly the moment he's changing. The tray hits the floor.", choices:[
      C('Laugh it off', {t:3, m:4}, 'She laughs too, eventually, from behind both hands.'),
      C('Apologize profusely', {t:2, m:1}, 'They both apologize to each other for ten minutes.'),
      C('"You\'re a healer. You\'ve seen it all, right?"', w=> w.lewd>=30 ? {m:4, l:3, res:'"Not... all," she says faintly.'} : {m:-4, l:2, res:'She turns red to the tips of her ears and mutters something about anatomy textbooks.'})]},
    {title:'Getting Closer', scene:'casual', text:"They go flower-picking outside the walls \"for medicine.\" Elowen makes him a flower crown. He makes a terrible one back. She wears it all day.", choices:[stay(), light()]},
    {title:'Burnout', scene:'portrait', text:"Elowen has been healing the dock workers for free, every night, for weeks. Today she collapses in the kitchen.", choices:[
      C('Scold her', {t:-4, m:-6}, 'She cries. Not because he\'s wrong.'),
      C('Take care of her for a day', w=>{ w.energy = maxEnergy(w); return {t:7, m:8, res:'Sam makes soup (badly), reads to her (badly), and doesn\'t leave her side. She sleeps for fourteen hours.'}; }),
      C('Fund a free clinic night (150g)', w=>{ if(S.gold<150) return {t:2, m:2, res:'You can\'t afford it. She thanks you for trying.'}; S.gold-=150; return {t:6, m:10, res:'One night a week, with help. She hugs him so hard his ribs creak.'}; })]},
    {title:'Starlight', scene:'sam_date', text:"Elowen takes Sam to a hill outside town and names the constellations of her homeland, one by one.", choices:[
      C('Listen to every single one', {t:4, m:7}, 'There are a lot of them. He doesn\'t mind.'),
      C('Make up a constellation for her', {t:3, m:8}, '"The Clumsy Healer." She shoves him. She uses the name forever.')]},
    {title:'Together', scene:'final', text:"Elowen kisses Sam first, very quickly, then hides her face in his shirt. \"Elves live a long time,\" she mumbles. \"I'd like to spend some of it with you.\" She doesn't let go of his hand all the way to her room.", choices:finale()}
  ],
  adelheid:[
    {title:'Opening Up', scene:'sam_date', text:"Adelheid insists on tasting all of Sam's food for poison. Every meal. She eventually admits she has started looking forward to dinner time.", choices:[stay(), light()]},
    {title:'Rain Barrel', scene:'shower', text:"Sam cuts through the training yard and finds Adelheid washing off after practice at the rain barrel. She snaps to attention. With the hand holding the towel.", choices:[
      C('Turn around immediately', {t:3, m:2}, '"Thank you, my lord," she says, in a very small voice.'),
      C('Salute back', {m:6, t:1}, 'She laughs: a real, startled laugh, the first he\'s ever heard from her.'),
      C('Stammer helplessly', {m:3, l:1}, 'They stand there stammering at each other until a goose interrupts.')]},
    {title:'Getting Closer', scene:'casual', text:"Sam finds Adelheid's secret stash of romance novels. Every one is about a knight and her lord. She threatens him with her sword. Then asks, very quietly, if he's read the third one.", choices:[stay(), light()]},
    {title:'The Report', scene:'portrait', text:"The Order demands Adelheid report on \"the sinful nature\" of Sam's business. She's been staring at a blank page for three hours.", choices:[
      C('"Tell them the truth."', {t:6, m:3}, 'She writes three pages: fair wages, rest days, no one here against her will. She reads them twice and seals them with pride.'),
      C('"Could you... leave some things out?"', {t:-8, m:-10}, 'Her face goes hard. "I will not lie, my lord. Not even for you." It\'s a long, cold week.'),
      C('Go to the Order with her', {t:8, m:5}, 'Sam answers their questions himself, politely, for four hours. Adelheid stands beside him the entire time.')]},
    {title:'Swordplay', scene:'sam_training', text:"Adelheid decides her lord must be able to defend himself, and hands Sam a practice sword.", choices:[
      C('Practice until you drop', w=>{ samStat('strength',2); return {t:3, m:6, res:'He drops. Twice. She is quietly, enormously proud.'}; }),
      C('Let her win on purpose', {m:-3}, 'She knows. She hates that. "Again, and properly this time."')]},
    {title:'Together', scene:'final', text:"Adelheid kneels to renew her oath, then stays kneeling. \"My oath was to serve you. I would like to amend it.\" She takes his hand. \"To stand beside you.\" She rises, and doesn't let go.", choices:finale()}
  ],
  marisol:[
    {title:'Opening Up', scene:'sam_date', text:"Marisol shows Sam her father's old ledgers and her own corrections in the margins, years of them. \"He never listened. You actually do.\" It sounds like an accusation. It isn't.", choices:[stay(), light()]},
    {title:'Invoice Ambush', scene:'walkin', text:"Marisol barges into the washroom mid-argument about invoices, sees Sam in the tub, and keeps arguing.", choices:[
      C('Argue back from the tub', {m:6, t:2}, 'He wins, for once. She claims it doesn\'t count.'),
      C('Ask for some privacy', {t:1}, 'She rolls her eyes, leaves the invoice on the stool, and shuts the door. Firmly.'),
      C('Splash her', {m:8, l:2}, 'War is declared. The washroom floods. Mira is not amused.')]},
    {title:'Getting Closer', scene:'casual', text:"Marisol beats Sam at cards four times in a row, then lets him win once, badly. \"I wanted to see your face,\" she says, and laughs until she can't breathe.", choices:[stay(), light()]},
    {title:'A Letter', scene:'portrait', text:"A letter arrives from Marisol's father. He's alive, across the sea, and in debt again. She wants to sell something, anything, to bail him out.", choices:[
      C('"No. He left you with all of this."', {t:-5, m:-8}, '"He\'s not YOUR father." She slams the door. She apologizes the next day; so does he.'),
      C('Send him 300g', w=>{ if(S.gold<300) return {t:2, m:-2, res:'You can\'t spare it. She understands. Mostly.'}; S.gold-=300; return {t:8, m:6, res:'She stares at the coins for a long time. "You didn\'t have to." "I know."'}; }),
      C('Help her write back', {t:5, m:3}, 'It takes all night. The letter says no, kindly. She sleeps better than she has in years.')]},
    {title:'Her Mother', scene:'sam_date', text:"Marisol takes Sam to a small grave on the hill above town. Her mother's. She doesn't say much.", choices:[
      C('Bring flowers', {t:4, m:6}, 'She tells him three stories about her mother on the walk back. She has never told anyone.'),
      C('Just stand with her', {t:5, m:4}, 'After a while she leans against his shoulder.')]},
    {title:'Together', scene:'final', text:"Marisol tears the old deed in half and writes a new one with both their names. \"Partners,\" she says. \"In every sense. Don't make me say it twice.\" Then she kisses him, and says nothing else for a long while.", choices:finale()}
  ],
  natsuki:[
    {title:'Opening Up', scene:'sam_date', text:"Natsuki shows Sam the scar she got her first week here, three years ago, alone. \"I kept thinking: if Sam were here, he'd do something dumb and it'd somehow be fine.\" She laughs. \"Then you showed up and did something dumb.\"", choices:[stay(), light()]},
    {title:'Incoming', scene:'shower', text:"Sam walks into the washroom. Natsuki is in the bath. A bar of soap is already in the air at adventurer speed.", choices:[
      C('Duck', {m:4}, 'He doesn\'t duck fast enough. She feels terrible. She laughs anyway.'),
      C('Take it like a man', {t:2, m:6}, 'Direct hit. "Nice reflexes, hero," she says, sinking up to her nose in the water.'),
      C('Apologize through the door', {t:2}, '"Knock next time, idiot!" She sounds like she\'s grinning.')]},
    {title:'Getting Closer', scene:'casual', text:"They find a stall selling something almost like taiyaki. Natsuki buys ten. Halfway through the fifth she goes quiet. \"Back home I always figured I'd end up with you someday. Dumb, right?\" She doesn't look at him.", choices:[stay(), light()]},
    {title:'Solo Run', scene:'portrait', text:"Natsuki took a dangerous dungeon contract without telling anyone. She comes back three days later with a broken arm and a sack of gold.", choices:[
      C('Yell at her', {t:-4, m:-8}, '"You don\'t get to disappear on me twice!" It comes out wrong. They don\'t talk for a while.'),
      C('Patch her up, quietly', w=>{ w.health = clamp(w.health+20); return {t:6, m:6, res:'He doesn\'t say anything. He doesn\'t have to. She leans her head against his.'}; }),
      C('Make her promise', {t:4, m:2}, '"Next time, you come with me," she says. "Deal?"')]},
    {title:'Fireworks', scene:'sam_date', text:"Natsuki bribes an alchemist to make fireworks \"like the summer festival back home.\" They watch from the town wall.", choices:[
      C('Hold her hand', {t:4, m:8}, 'Her hand is shaking. Then it isn\'t.'),
      C('Tell her you missed her, all three years', {t:6, m:6}, 'She punches his arm. Then she cries. Then she laughs.')]},
    {title:'Together', scene:'final', text:"Natsuki kicks Sam's door open at dawn, red-faced, sword still on her hip. \"I spent three years here thinking I'd never see you again. I'm not wasting another day.\" She kicks the door shut behind her.", choices:finale()}
  ],
  kanako:[
    {title:'Opening Up', scene:'sam_date', text:"Kanako ruffles Sam's hair and calls him \"Sammy\" in front of the whole staff. Again. Later she finds him on the back steps. \"You've grown up a lot, haven't you? When did that happen?\"", choices:[stay(), light()]},
    {title:'Shampoo', scene:'walkin', text:"Kanako walks in on Sam in the bath, doesn't blink, sets the shampoo on the edge of the tub, and keeps chatting about the bar schedule, like it's nothing.", choices:[
      C('Insist she leave', {t:2}, '"So shy!" she giggles, and goes.'),
      C('Act just as casual', {m:5, l:2}, 'She falters. Just a little. Her eyes flick down, then away. Interesting.'),
      C('"I\'m a grown man, Kanako."', {t:3, m:-2}, 'She stops mid-sentence. Looks at him. Leaves without a word.')]},
    {title:'Getting Closer', scene:'casual', text:"A drunk client gets grabby with Kanako and Sam steps in without thinking. Afterward she's quiet for a long time. \"Since when do you protect me?\" She doesn't ruffle his hair. She just looks at him, like she's seeing him for the first time.", choices:[stay(), light()]},
    {title:'Matchmaker', scene:'portrait', text:"Kanako has found Sam \"a nice girl\" and set up a dinner. She's very proud of herself.", choices:[
      C('Go on the date to make her happy', {t:-3, m:-6}, 'She asks how it went. Twice. She doesn\'t seem happy with either answer.'),
      C('"It\'s always been you. You know that."', {t:5, m:-4}, 'Kanako opens her mouth, closes it, and leaves. She doesn\'t sleep that night. Neither does he.'),
      C('Politely refuse', {t:2}, '"You\'re impossible," she sighs. She looks relieved.')]},
    {title:'Last Call', scene:'sam_date', text:"Kanako finds a bar that's almost like a snack bar back home and takes Sam there, just the two of them. There's a lute, and a very drunk bard willing to lend it.", choices:[
      C('Sing, badly', {m:9, t:3}, 'She joins in. They are both terrible. It\'s the best night either of them has had in this world.'),
      C('Ask her to sing', {t:4, m:6}, 'Her voice is soft. She sings the whole song looking at him.')]},
    {title:'Together', scene:'final', text:"Kanako corners Sam in the kitchen, flustered for once in her life. \"I spent six years telling myself you were the boy next door. You're not. You haven't been for a long time.\" She kisses him, laughs at her own blush, and kisses him again.", choices:finale()}
  ],
  mio:[
    {title:'Opening Up', scene:'sam_date', text:"Mio admits she followed Sam and her brother to the crosswalk that day just to say hi. \"So technically, the truck is your fault.\" She grins. \"I forgive you.\"", choices:[stay(), light()]},
    {title:'What a Coincidence', scene:'shower', text:"Mio is in the bath. She is obviously waiting. \"Oh no. Sam. You've caught me. What a coincidence.\"", choices:[
      C('Leave', {t:1, m:-4}, '"Coward!" she yells after him.'),
      C('"You\'re Kenta\'s sister."', {t:-2, m:-6}, '"I KNOW whose sister I am." A sponge hits the door as it closes.'),
      C('Laugh', {m:5, t:2}, 'She tries to stay offended. She can\'t.')]},
    {title:'Getting Closer', scene:'casual', text:"Mio insists on trying every job in the house and is bad at all of them. She is completely undeterred. \"I'm going to be useful to you. Watch me.\"", choices:[stay(), light()]},
    {title:'Useless', scene:'portrait', text:"A client complains about Mio. Loudly. Later Sam finds her crying in the linen closet. \"I'm useless. I'm just the kid sister who followed you here.\"", choices:[
      C('"You don\'t have to do this. You can quit."', {t:-6, m:-10}, '"That\'s not what I wanted you to say." She doesn\'t come out for an hour.'),
      C('Train her yourself', w=>{ grow(w,'service',6); return {t:6, m:6, res:'Every evening for a week. She gets better. She gets a lot better.'}; }),
      C('Tell her about your own failures', {t:5, m:8}, 'He has many. By the end she\'s laughing through her tears.')]},
    {title:'Drama Date', scene:'sam_date', text:"Mio demands a \"proper date, like in the dramas\": umbrella in the rain, a dramatic run to the station (there is no station), the works.", choices:[
      C('Commit to every cliché', {m:10, t:3}, 'He even trips into her arms at the end. On purpose. She nearly dies of happiness.'),
      C('Do it your own way', {t:4, m:5}, 'A walk, a bakery, a quiet bench. "...Okay," she admits. "This is better."')]},
    {title:'Together', scene:'final', text:"Mio climbs onto the roof where Sam is hiding from paperwork. \"I've had a crush on you for years, and I'm done keeping it to myself. I'm a grown woman and I know what I want. It's you.\" This time, Sam doesn't climb down.", choices:finale()}
  ]
};
function applyEff(w, e){
  if(e.t) w.trust = clamp(w.trust + e.t);
  if(e.m) w.mood = clamp(w.mood + e.m);
  if(e.l) w.lewd = clamp(w.lewd + e.l);
}
function evArc(w){
  const beats = ARCS[w.key]; if(!beats || !S.workers.includes(w)) return null;
  const i = w.arc||0; if(i>=beats.length) return null;
  const b = beats[i], last = i===beats.length-1;
  let scene = b.scene, cloth = b.cloth;
  if(scene==='final'){ const act = (w.fav && canSam(w,w.fav)) ? w.fav : (getActs().find(a=>canSam(w,a.id))||{id:'caress'}).id; scene = 'samact:'+act; cloth = undefined; }
  return {title:`${w.name}: ${b.title} (${i+1}/${beats.length})`, who:w.id, scene, cloth, text:b.text,
    choices: b.choices.map(c=>({label:c.label, fx(){
      const e = typeof c.eff==='function' ? c.eff(w) : c.eff;
      applyEff(w, e);
      let res = String(e.res||'').replace(/\{N\}/g, w.name);
      w.arcWk = S.week;
      if(e.hold) return res;
      w.arc = i+1; samGainXP(last?40:15);
      if(w.arc>=4 && has(w,'Oblivious')){ w.traits = w.traits.filter(t=>t!=='Oblivious'); res += `\n\n(Something has changed in the way ${w.name} looks at Sam. Oblivious removed.)`; }
      if(last){ w.privateCount++; if(S.sam.first) S.sam.first=false; if(!has(w,'Devoted')) w.traits.push('Devoted'); w.isPartner = true; w.wage = 0; w.contract = 999;
        res = (res?res+'\n\n':'') + `${w.name} is now Sam's lover. (Devoted: never leaves, works without wages, more willing with Sam, and her mood stays up.)`; }
      return res;
    }}))};
}
