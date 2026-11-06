'use strict';
/* =====================================================================
   CHANCE ENCOUNTERS & RECKLESS NIGHTS
   - Late-night visits: ladies who aren't seeing clients this week (resting or on staff jobs),
     with enough trust, lewdness and lust, may come looking for Sam.
   - Rest visits: when Sam rests, someone may join him.
   - Reckless nights: when lust runs very high, a lewd lady acts on it, either pulling Sam
     away (draining his energy) or freelancing with clients off the books.
   Every outcome is consensual; "reckless" means impulsive, not unwilling.
   ===================================================================== */
const bestSamAct = w => (w.fav && canSam(w,w.fav) && samStance(w,w.fav)==='yes') ? w.fav
  : (getActs().filter(a=>samStance(w,a.id)==='yes').sort((a,b)=>b.th-a.th)[0] || getActs().find(a=>canSam(w,a.id)) || {}).id;
const idleForClients = w => JOBS[w.job] && JOBS[w.job].cat!=='escort';
function canVisit(w, trustMin, lewdMin, lustMin){
  return w.trust>=trustMin && w.lewd>=lewdMin && w.lust>=lustMin && w.energy>=maxEnergy(w)*0.3 && !!bestSamAct(w);
}
// one shared result: run privateCore without spending an action
function encounterResult(w, act, intro, kind, situation, drain){
  if(drain) S.sam.energy = Math.max(0, S.sam.energy - drain);
  const text = intro + '\n\n' + privateCore(w, act);
  w.lust = clamp(w.lust - 25);
  samLog(`${kind==='reckless'?'Swept off by':'A visit from'} ${w.name}`);
  return {text, img:{wid:w.id, scene:'samact:'+act}, ai:{kind, wid:w.id, act, scene:'samact:'+act, forSam:true, situation}};
}

/* ---------- Sam rests ---------- */
function restVisitor(){
  const c = S.workers.filter(w=>canVisit(w, 55, 40, 40));
  if(!c.length || Math.random() > 0.35) return null;
  return weighted(c, w=>w.trust + w.lust);
}
function restEncounter(w){
  const act = bestSamAct(w);
  modal(`<h2>Nap Time... Interrupted</h2><div id="resImg"></div>
    <p class="story">Sam is halfway to sleep when the door creaks. ${esc(w.name)} slips in, closes it behind her, and sits on the edge of the bed. "You looked lonely," she says. She does not look like she came here to sleep.</p>
    <div id="resAi"></div>
    <div class="row"><button class="primary" onclick="restAccept('${w.id}','${act}')">Make room for her</button><button onclick="restDecline('${w.id}')">"I really do need the nap"</button></div>`);
  showImg('resImg', w.id, 'casual');
}
function restAccept(id, act){
  const w = findW(id); if(!w) return;
  const out = encounterResult(w, act, `${w.name} curls up next to him. The nap does not happen. Sam does not mind.`, 'encounter', 'Sam was trying to take a nap; she slipped into his room uninvited.', 10);
  checkUnlocks(); save(); render();
  showResult(`A Visit from ${w.name}`, out.text + '\n\n(Sam still got some rest: Energy +40 overall)', w.id, out.img.scene, out.ai);
}
function restDecline(id){
  const w = findW(id); if(!w) return;
  w.mood = clamp(w.mood - 2); save(); render();
  showResult('Nap Time', `${w.name} pouts, then tucks the blanket around him and leaves. Sam sleeps like a rock.\n\nEnergy +50`);
}

/* ---------- weekly ---------- */
function queueEncounters(){
  let used = 0;
  // reckless nights first (very high lust)
  shuffle(S.workers).forEach(w=>{
    if(used>=1 || w.lust < LUST_HIGH || w.lewd < 50 || Math.random() > 0.35) return;
    used++; const id = w.id; EVQ.push(()=>evReckless(findW(id)));
  });
  // late-night visits from ladies who weren't seeing clients
  const c = S.workers.filter(w=>idleForClients(w) && canVisit(w, 60, 45, 55));
  if(c.length && used<2 && Math.random() < 0.12 + 0.05*c.length){ const w = pick(c), id = w.id; EVQ.push(()=>evLateVisit(findW(id))); }
}
function evLateVisit(w){
  if(!w || !canVisit(w, 60, 45, 40)) return null;
  const act = bestSamAct(w);
  return {title:'A Knock After Midnight', who:w.id, scene:'casual', text:pick([
      `Sam is doing the books by candlelight when ${w.name} knocks. She hasn't seen a single client all week, and she's clearly been thinking about something. "Busy?"`,
      `${w.name} appears in Sam's doorway in her nightclothes, holding two cups of tea she clearly has no intention of drinking.`,
      `A note slides under Sam's door: "Still awake? Come find out." It's in ${w.name}'s handwriting.`]),
    choices:[
      {label:'Let her in', fx(){ return encounterResult(w, act, `${w.name} doesn't wait for an answer. The candle burns all the way down.`, 'encounter', 'Late at night, she came to his door on her own initiative.'); }},
      {label:'Not tonight', fx(){ w.mood = clamp(w.mood-4); w.lust = clamp(w.lust-5); return `${w.name} smiles a little ruefully. "Your loss, boss."`; }}]};
}
function evReckless(w){
  if(!w || w.lust < LUST_HIGH-10) return null;
  const act = bestSamAct(w), h = houseOf(w);
  if(act && w.trust>=40 && Math.random()<0.55){
    return {title:`${w.name} Can't Wait`, who:w.id, scene:'casual', text:`${w.name} has been restless for days, and tonight she's done waiting. She catches Sam in the hallway between errands, pushes him into the nearest storeroom, and locks the door behind them.`,
      choices:[
        {label:'Go along with it', fx(){ return encounterResult(w, act, `It is not quick. Sam emerges much later, extremely tired. (Sam's energy −35)`, 'reckless', 'She ambushed Sam in a storeroom after days of pent-up desire.', 35); }},
        {label:'"Not here, not now"', fx(){ w.mood = clamp(w.mood-6); w.lust = clamp(w.lust-8); return `${w.name} lets him go with a frustrated groan. She is going to be distracted all week.`; }}]};
  }
  // freelancing: took clients off the books
  const n = ri(2,4), cut = Math.round(n * rnd(15,30) * (1 + (h?h.rep:10)/100));
  return {title:`${w.name} Freelances`, who:w.id, scene:'companion', text:`On her night off, ${w.name} got restless, went down to the lounge, and quietly took ${n} clients of her own choosing. Off the books. She's back now, glowing, slightly guilty, and holding out an envelope: ${fmt(cut)}.`,
    choices:[
      {label:'Take the money and let it slide', fx(){ S.gold += cut; w.energy = clamp(w.energy-25, 0, maxEnergy(w)); w.lust = clamp(w.lust-45); w.mood = clamp(w.mood+6); if(h) h.rep = clamp(h.rep-1); return {text:`+${fmt(cut)}. She's thrilled. One of the clients complained about the "irregular service," though (−1 reputation).`, ai:{kind:'reckless', wid:w.id, scene:'companion', situation:`on her night off she slipped down to the lounge and took ${n} clients of her own choosing, off the books.`}}; }},
      {label:'Talk to her about it', fx(){ S.gold += cut; w.energy = clamp(w.energy-25, 0, maxEnergy(w)); w.lust = clamp(w.lust-45); gainTrust(w, 2); w.mood = clamp(w.mood-3); return `+${fmt(cut)}. Sam explains why the house needs to know who's where. She listens. She also asks to work more evenings.`; }}]};
}
