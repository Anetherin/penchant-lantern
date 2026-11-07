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
  const text = intro + '\n\n' + privateCore(w, act);   // privateCore spends her lust
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
  let used = queueRegularDrama() ? 1 : 0;
  // lovers at high lust come looking for Sam (they wait for him rather than going it alone)
  const lovers = S.workers.filter(w=>has(w,'Devoted') && w.lust>=LUST_HIGH && w.energy>=maxEnergy(w)*0.2 && bestSamAct(w));
  if(lovers.length && Math.random() < 0.75){ const id = pick(lovers).id; used++; EVQ.push(()=>evLoverWaiting(findW(id))); }
  // two or more lovers: jealousy when one is left out
  if(used<2) used += queueLoverDynamics();
  // something between two of the ladies (data/bonds.json: events and shared scenes)
  if(used<2) used += queueBondEvents();
  // reckless nights (very high lust)
  shuffle(S.workers).forEach(w=>{
    if(used>=1 || has(w,'Devoted') || w.lust < LUST_HIGH || w.lewd < 50 || Math.random() > 0.35) return;
    used++; const id = w.id; EVQ.push(()=>evReckless(findW(id)));
  });
  // late-night visits from ladies who weren't seeing clients
  const c = S.workers.filter(w=>idleForClients(w) && canVisit(w, 60, 45, 55));
  if(c.length && used<2 && Math.random() < 0.12 + 0.05*c.length){ const w = pick(c), id = w.id; EVQ.push(()=>evLateVisit(findW(id))); }
}
function evLateVisit(w){
  if(!w || !canVisit(w, 60, 45, 40)) return null;
  const act = bestSamAct(w);
  return {title:'A Knock After Midnight', who:w.id, scene:'casual', text:flavor('late_visit', w),
    choices:[
      {label:'Let her in', fx(){ return encounterResult(w, act, `${w.name} doesn't wait for an answer. The candle burns all the way down.`, 'encounter', 'Late at night, she came to his door on her own initiative.'); }},
      {label:'Not tonight', fx(){ w.mood = clamp(w.mood-4); w.lust = clamp(w.lust-5); return `${w.name} smiles a little ruefully. "Your loss, boss."`; }}]};
}
function evLoverWaiting(w){
  if(!w || !has(w,'Devoted')) return null;
  const act = bestSamAct(w); if(!act) return null;
  return {title:`${w.name} Has Been Waiting`, who:w.id, scene:'casual', text:flavor('lover_waiting', w),
    choices:[
      {label:'Go to her', fx(){ return encounterResult(w, act, flavor('lover_reunion', w), 'encounter', 'She is his lover and had been waiting for him all week; she came to his room.'); }},
      {label:'"Tomorrow, I promise"', fx(){ w.mood = clamp(w.mood-5); w.lust = clamp(w.lust-5); return `${w.name} sighs and kisses his cheek. "You'd better mean it."`; }}]};
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

/* ---------- lovers: jealousy & harmony ---------- */
const PRICKLY = ['Proud and sharp-tongued','Hot-blooded and competitive','Mysterious and aloof'];
function queueLoverDynamics(){
  const L = S.workers.filter(w=>has(w,'Devoted'));
  if(L.length < 2) return 0;
  const left = L.filter(w=>(w.neglect||0) >= BAL.lovers.neglectWeeks).sort((a,b)=>b.neglect-a.neglect)[0], fav = L.filter(w=>!w.neglect);
  if(left && fav.length && Math.random() < BAL.lovers.jealousyChance){ const a = left.id, b = pick(fav).id; EVQ.push(()=>evLoverJealous(findW(a), findW(b))); return 1; }
  return 0;
}
function evLoverJealous(w, o){
  if(!w || !o) return null;
  const easy = (!PRICKLY.includes(w.personality) && !PRICKLY.includes(o.personality) && w.trust>=85 && o.trust>=85) || bondV(w,o) >= 40;
  return {title:`${w.name} Feels Left Out`, who:w.id, scene:'casual', text:flavor('lover_jealous', w, {other:o.name}),
    choices:[
      {label:'Make it up to her (−20 energy, 40g)', fx(){ S.sam.energy = Math.max(0, S.sam.energy-20); S.gold -= 40; w.neglect = 0; w.mood = clamp(w.mood+8); gainTrust(w,2); w._samTime = (w._samTime||0)+1; return `Sam takes ${w.name} out for the evening and doesn't talk about work once. She forgives him somewhere around dessert.`; }},
      {label:`Talk to her and ${o.name} together`, fx(){
        if(easy){ gainTrust(w,2); gainTrust(o,2); addBond(w, o, 10); w.neglect = 0; w.mood = clamp(w.mood+4); o.mood = clamp(o.mood+2); return `It's awkward for about five minutes. Then ${o.name} laughs, ${w.name} laughs, and the three of them end up drafting a schedule. It has a lot of hearts on it.`; }
        w.mood = clamp(w.mood-5); o.mood = clamp(o.mood-4); addBond(w, o, -10); return `That went badly. ${w.name} and ${o.name} are now very politely not speaking to each other, or to Sam.`; }},
      {label:'Let it blow over', fx(){ addBond(w, o, -6); w.mood = clamp(w.mood-8); w.trust = clamp(w.trust-3); return `${w.name} stops bringing it up. That's worse.`; }}]};
}
