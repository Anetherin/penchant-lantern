'use strict';
/* =====================================================================
   WEEK RESOLUTION
   ===================================================================== */
function pickClass(h){
  const p = h.price, cw = HOUSES[h.id].cls;
  const ws = [Math.max(3,50-10*p), 30 + (S.flags.guild?8:0), 15+4*p+(h.up.lounge?6:0), Math.max(1, 5+4*p+h.rep/10+(h.up.lounge?6:0))];
  return weighted(CLASSES, c=>{ const i=CLASSES.indexOf(c); return ws[i]*cw[i]*(c.id==='merchant'&&h.bonus&&h.bonus.merchant||1); });
}
function pickWant(cls){ return weighted(getActs(), a=>(cls.id==='commoner' ? 90/a.price : cls.id==='noble' ? a.price/80 : 1) * (a.id==='caress'?0.6:1) * ((cls.wants||{})[a.id] ?? 1)).id; }
function qualityOf(w, act){ return act ? (actSkill(w,act)*0.5 + w.stats.beauty*0.3 + w.stats.charm*0.2)/100 : (w.tech.service*0.5 + w.stats.beauty*0.25 + w.stats.charm*0.25)/100; }
function hlText(w, e){
  const who = e.reg ? `${e.reg}, one of the regulars,` : pick(CLIENT_DESC[e.cls]), N = w.name, lab = e.want ? actLabel(e.want) : '';
  if(e.where){
    const where = PROP_WHERE[e.where];
    if(e.act) return `${cap(who)} propositioned ${N} ${where}, asking for ${lab}. She thought about it for exactly one second, then took his hand and led him upstairs.`;
    return `${cap(who)} propositioned ${N} ${where}, asking for ${lab}. She turned him down${w.offDuty?'':' (she isn\'t taking propositions on this job)'}.`;
  }
  if(!e.want) return `${cap(who)} spent the evening with ${N} in the lounge: wine, conversation, and a lot of laughing. ${flavor('client_company', w)}`;
  if(e.outcome==='yes') return `${cap(who)} asked for ${N}, and for ${lab}. ${(actById(e.act)&&actById(e.act).report&&actById(e.act).report.length) ? pick(actById(e.act).report) : flavor('client_yes', w)}`;
  if(e.outcome==='alt') return `${cap(who)} asked ${N} for ${lab}. She said no to that, but offered ${actLabel(e.act)} instead, and he happily took it.`;
  return `${cap(who)} asked ${N} for ${lab}. She politely declined, and he settled for her company over a bottle of wine.`;
}
// How one client service went for her: mood, lust, and a note for the report. Returns the note key.
function clientMood(w, act, reluct, pr){
  const B = BAL.lust, eager = w.lust >= LUST_EAGER;
  if(reluct){ w.mood -= 2; pr.reluct = (pr.reluct||0)+1; }
  if(w.fav===act){ w.mood += 1.5; pr.favN = (pr.favN||0)+1; }
  if(w.dislike===act){ w.mood -= 2.5; pr.disN = (pr.disN||0)+1; }
  if(eager && !reluct){ w.mood += B.bonus.clientMood; pr.eagerN = (pr.eagerN||0)+1; }
  spendLust(w, B.drop.client + (w.fav===act ? B.drop.fav : 0));
  return w.fav===act ? 'fav' : reluct ? 'stretch' : w.dislike===act ? 'dislike' : eager ? 'eager' : null;
}
const ENC_NOTE = k => k ? flavor('enc_'+k) : '';
const CLS_LABEL = id => ((CLASSES.find(c=>c.id===id)||{}).label || id);
// one compact line per visit, for the full list in the report
function encLine(e){
  const who = e.reg ? `${e.reg} (regular)` : cap(CLS_LABEL(e.cls)), where = e.where ? ` ${PROP_WHERE[e.where]}` : '';
  const what = !e.want ? 'company and wine' : e.outcome==='yes' ? actLabel(e.act) : e.outcome==='alt' ? `${actLabel(e.act)} (asked for ${actLabel(e.want)})` : `asked for ${actLabel(e.want)}, declined`;
  return {t:`${who}${where}: ${what}.`, note: e.note ? ENC_NOTE(e.note) : '', good: ['fav','eager','glow'].includes(e.note), bad: ['dislike','stretch','flat'].includes(e.note)};
}
function simHouse(h, R){
  const HD = HOUSES[h.id], W = S.workers.filter(w=>w.house===h.id), P = PRICES[h.price];
  const hr = {id:h.id, name:h.name, income:0, served:0, turned:0, sat:0, upkeep:0};
  const byJob = j => W.filter(w=>w.job===j);
  const mad = byJob('madame')[0];
  const madF = mad ? (0.5 + (mad.tech.manage + mad.stats.charm)/200) * ob(mad,'madame') : 0;
  const recF = byJob('reception').reduce((a,w)=>a + (0.3 + (w.tech.service + w.stats.charm)/250)*ob(w,'reception'), 0);
  const danceDraw = byJob('dancer').reduce((a,w)=>a + (1 + w.popularity/30 + w.tech.dance/50)*ob(w,'dancer'), 0);
  let secPow = byJob('security').reduce((a,w)=>a + (w.tech.combat + w.stats.strength*0.5 + (has(w,'Former Adventurer')?20:0))*ob(w,'security'), 0);
  if(h.up.guard) secPow *= 1.8;
  secPow += S.samWeek.security;
  const repEff = h.rep*0.75 + S.rep*0.25;
  let demand = (10 + repEff*0.4 + (h.up.lounge?4:0) + danceDraw*1.5) * HD.demand * (P.demand + (h.price>=2 ? repEff/250 : 0)) * (1 + 0.25*recF) * rnd(0.85,1.15);
  if(HD.haunted) demand *= 0.45 + Math.min(1, h.rep/40)*0.8;
  demand *= (h.bonus&&h.bonus.demand) || 1;
  demand = W.length ? Math.max(1, Math.round(demand)) : 0;
  const escorts = W.filter(w=>JOBS[w.job].cat==='escort');
  const capc = {}; escorts.forEach(w=>capc[w.id] = 10);
  // max lust: some ladies spend part of a night alone instead (costs energy, fewer clients)
  W.forEach(w=>{
    if(w.lust < LUST_HIGH || has(w,'Devoted') || Math.random() >= soloChance(w)) return;   // lovers wait for Sam
    const pr = R.per[w.id]; pr.solo = true;
    w.energy = Math.max(0, w.energy - Math.round(maxEnergy(w)*BAL.solo.energyCost)); spendLust(w, BAL.solo.lustDrop); w.mood = clamp(w.mood + 3);
    if(capc[w.id]!==undefined) capc[w.id] = Math.min(capc[w.id], BAL.solo.clientCap);
    R.hl.push({wid:w.id, text:flavor('solo', w), act:null, scene:'solo', noAi:true});
  });
  const roomM = ROOM_MULT[h.tier];
  const regs = demand ? regularsVisiting(h) : []; let bestNew = null;
  for(let i=0;i<demand;i++){
    const avail = escorts.filter(w=>R.per[w.id].served < capc[w.id]);
    if(!avail.length){ hr.turned++; continue; }
    const reg = regs.shift() || null, fw = reg && avail.find(x=>x.id===reg.fav);   // regulars ask for their favorite
    const w = fw || weighted(avail, x=>5+appeal(x)), cls = reg ? (CLASSES.find(c=>c.id===reg.cls)||pickClass(h)) : pickClass(h), pr = R.per[w.id];
    if(w.race!=='demon' && w.energy < maxEnergy(w)*0.2){ hr.turned++; continue; }  // she stops taking clients when she's running on empty
    const want = Math.random() < (w.job==='courtesan'?0.85:0.3) ? pickWant(cls) : null;
    let act = null, outcome = 'comp';
    if(want){
      pr.props++;
      if(w.menu.includes(want) && canClient(w,want) && !notInMood(w,want)){ act = want; outcome='yes'; pr.acc++; }
      else if(notInMood(w,want)){ pr.notMood = (pr.notMood||0)+1; outcome='no'; pr._nm = true; }
      else {
        const alt = w.menu.filter(id=>canClient(w,id) && !notInMood(w,id) && actById(id) && actById(id).price<=actById(want).price).sort((a,b)=>actById(b).price-actById(a).price)[0];
        if(alt && Math.random()<0.55){ act = alt; outcome='alt'; pr.acc++; } else outcome='no';
      }
    }
    const reluct = act && clientStance(w,act)==='ask', ecost = actCost(w, act);
    const q = qualityOf(w, act) * (reluct?0.85:1);
    let cm = cls.mult * ob(w, cls.id);
    if(cls.id==='adventurer' && has(w,'Former Adventurer')) cm *= 1.3;
    if(cls.id==='noble') cm *= (has(w,'Elegant')?1.3:1) * (0.7 + w.stats.refinement/170);
    const base = act ? actById(act).price * roomM * ob(w,'courtesan') : 20 * ob(w,'companion');
    const below = Math.max(0, (HD.minPop||0) - w.popularity);
    const inc = Math.round(base * P.mult * (0.6+q*0.9) * cm * (1+madF*0.15) * (has(w,'Ambitious')?1.1:1) * (1+recF*0.05) * (below?0.75:1) * (reg ? (regQuirk(reg).tip||1) : 1) * BAL.income.escort);
    const sat = clamp(- below*0.5 + q*100 + 6 + rnd(-15,15) + h.tier*5 - (h.price-1)*6 + (h.up.bath?4:0) + recF*4 + (outcome==='yes'?8:outcome==='alt'?3:outcome==='no'?-8:0));
    pr.satSum = (pr.satSum||0) + sat; if(sat<30) pr.low = (pr.low||0)+1;
    hr.income += inc; R.led.escort += inc; pr.served++; pr.earned += inc; hr.served++; hr.sat += sat;
    w.popularity = clamp(w.popularity + (sat-45)/50);
    let note = null;
    if(act){
      pr.acts[act] = (pr.acts[act]||0)+1; growAct(w, act, 0.7); w.lewd = clamp(w.lewd + (reluct?0.6:0.3)*lewdMult(w));
      w.energy -= ecost;
      note = clientMood(w, act, reluct, pr);
    } else { pr.comp++; grow(w,'service',0.5); w.energy -= ecost; }
    if(!note) note = outcome==='no' ? (pr._nm ? 'nomood' : 'declined') : sat>=80 ? 'glow' : sat<30 ? 'flat' : null;
    pr._nm = false;
    pr.enc.push({cls:cls.id, want, act, outcome, reg: reg ? reg.name : null, note, sat:Math.round(sat)});
    if(reg) regAfter(reg, w, sat, inc); else if(sat>=75 && (!bestNew || sat>bestNew.sat)) bestNew = {sat, w, cls};
  }
  maybeNewRegular(h, bestNew, R);
  const visitors = hr.served + hr.turned*0.5 + danceDraw*2;
  W.forEach(w=>{
    const j = w.job, pr = R.per[w.id];
    if(j==='bartender'){ const inc = Math.round((h.up.bar?1:0.5) * (10+visitors*1.5) * (0.5+(w.tech.bar+w.stats.charm)/200) * (has(w,'Party Animal')?1.2:1) * (w.race==='dwarf'?1.15:1) * (S.flags.ironsong?1.15:1) * ob(w,'bartender') * ((h.bonus&&h.bonus.bar)||1)); hr.income+=inc; R.led.bar+=inc; pr.earned+=inc; grow(w,'bar',2); }
    if(j==='dancer'){ const inc = Math.round((12+w.popularity*0.8) * (0.5+w.tech.dance/100) * Math.sqrt(P.mult) * (has(w,'Exhibitionist')?1.2:1) * ob(w,'dancer')); hr.income+=inc; R.led.dance+=inc; pr.earned+=inc; w.popularity=clamp(w.popularity+2); w.lewd=clamp(w.lewd + 0.5*(has(w,'Exhibitionist')?3:1)*lewdMult(w)); grow(w,'dance',2); }
    if(j==='bath'){ const inc = Math.round((8+visitors*1.2) * (0.5+(w.tech.service+w.stats.beauty)/200) * ob(w,'bath')); hr.income+=inc; R.led.bath+=inc; pr.earned+=inc; grow(w,'service',1.5); w.lewd=clamp(w.lewd+0.5*lewdMult(w)); }
    if(j==='maid'){ h.rep = clamp(h.rep + (0.4 + w.tech.service/150)*ob(w,'maid')); grow(w,'service',1.5); }
    if(j==='security'){ grow(w,'combat',1.5); w.trust = clamp(w.trust+0.3); }
    if(j==='madame') grow(w,'manage',2);
    if(j==='reception') grow(w,'service',2);
    if(JOBS[j].cat==='staff') w.energy -= JOBS[j].energy;
    if(JOBS[j].cat!=='escort' || !pr.served){ const t = flavor('job_'+j, w); if(t) R.hl.push({wid:w.id, text:t, act:null, scene:'job_'+j, noAi:true, job:true}); }
    if(PROP_RATE[j]){
      const n = Math.round(visitors * PROP_RATE[j] * (0.4 + appeal(w)/100) * ob(w,'propose') * rnd(0.6,1.4));
      for(let i=0;i<n;i++){
        const cls = pickClass(h), want = pickWant(cls); pr.props++;
        const ok = w.offDuty && w.menu.includes(want) && canClient(w,want) && !notInMood(w,want) && w.energy - actCost(w,want) > maxEnergy(w)*0.2;
        if(ok){
          const inc = Math.round(actById(want).price * P.mult * 0.8 * (0.6+qualityOf(w,want)*0.9) * cls.mult * BAL.income.escort);
          pr.acc++; pr.acts[want]=(pr.acts[want]||0)+1; pr.earned+=inc; hr.income+=inc; R.led.offduty+=inc;
          w.energy -= actCost(w,want); w.lewd = clamp(w.lewd+0.3*lewdMult(w)); growAct(w,want,0.7);
        }
        const note = ok ? clientMood(w, want, clientStance(w,want)==='ask', pr) : null;
        pr.enc.push({cls:cls.id, want, act: ok?want:null, outcome: ok?'yes':'no', where:j, note});
      }
    }
  });
  if(W.length && Math.random() < clamp((0.12 + demand/120 - secPow/250) * (HD.trouble||1), 0.03, 0.6)) EVQ.push(()=>evIncident(h));
  if(HD.haunted && Math.random()<0.15) EVQ.push(()=>evHaunt(h));
  let up = HD.upkeep + 12*h.rooms + 6*(h.quarters||0) + h.tier*20 + (h.beds||0)*4*bedsFor(h) + (h.extraBeds||0)*3 + (h.annex?30:0) + Object.keys(h.up).filter(k=>h.up[k] && !HD.up[k]).reduce((a,k)=>a+(UPGRADES[k].upkeep||0), 0);
  if(S.samWeek.books) up = Math.round(up * (1 - (0.1 + S.sam.business*0.003)));
  up = Math.round(up * ((h.bonus&&h.bonus.upkeep)||1) * (1 + h.rep/150));
  hr.upkeep = up;
  if(h.bonus && h.bonus.charter){ hr.income += h.bonus.charter; R.led.bar += h.bonus.charter; }
  const avg = hr.served ? hr.sat/hr.served : 50;
  if(W.length) h.rep = clamp(h.rep + (avg-50)/12 + (hr.turned>3 ? -0.5 : 0));
  // who has a bed tonight
  let beds = bedsFor(h); hr.floor = [];
  S.workers.filter(w=>w.house===h.id && w.race!=='spirit').sort((a,b)=>(b.isPartner||b.locked?1:0)-(a.isPartner||a.locked?1:0)).forEach(w=>{ if(beds>0){ beds--; w._bed = BEDS[h.beds||0].rest; } else { w._bed = FLOOR_REST; hr.floor.push(w.name); } });
  hr.avgSat = avg; hr.rep = h.rep;
  return hr;
}
function endWeek(){
  if(!S || S.over || EVQ.length) return;
  closeModal();
  S.workers.forEach(ensureWorker);
  const R = {v3:true, v5:true, week:S.week, lines:[], per:{}, hl:[], houses:[], income:0, wages:0, upkeep:0, served:0, turned:0,
    led:{escort:0, offduty:0, bar:0, dance:0, bath:0, sam:S.samWeek.income}, samActs:S.samWeek.acts.slice()};
  S.workers.forEach(w=>R.per[w.id]={id:w.id, name:w.name, job:w.job, house:w.house, served:0, comp:0, acts:{}, props:0, acc:0, earned:0, e0:Math.round(w.energy), m0:Math.round(w.mood), l0:Math.round(w.lust||0), enc:[], why:[]});
  const log = t => R.lines.push(t);
  let satSum = 0;
  S.houses.forEach(h=>{ const hr = simHouse(h, R); R.houses.push(hr); R.income += hr.income; R.upkeep += hr.upkeep; R.served += hr.served; R.turned += hr.turned; satSum += hr.sat; });
  R.wages = S.workers.reduce((a,w)=>a+(isFree(w)?0:w.wage), 0);
  S.gold += R.income - R.wages - R.upkeep;

  const leaving = [], renew = [];
  S.workers.forEach(w=>{
    const pr = R.per[w.id], h = houseOf(w);
    const mad = S.workers.find(x=>x.house===w.house && x.job==='madame');
    // Sleep: bed quality x how much of the week she had to herself. No recovery while working.
    const mx = maxEnergy(w), spent = Math.max(0, pr.e0 - w.energy), freeFrac = clamp(1 - spent/mx, 0.1, 1, );
    let rest = (w._bed ?? BEDS[h.beds||0].rest);
    rest *= (w.race==='dwarf'?1.25:1) * (w.race==='beastkin'?1.15:1) * (w.race==='demon'?0.75:1) * (has(w,'Night Owl')?1.15:1);
    let rec = w.job==='rest' ? rest*1.6 + (h.up.bath?10:0) : rest*(0.75 + 0.25*freeFrac);
    if(w.race==='spirit') rec = w.job==='rest' ? 55 : 30;
    w.energy += rec; pr.slept = w._bed===FLOOR_REST ? 'floor' : w.race==='spirit' ? 'spirit' : BEDS[h.beds||0].label;
    const why = (t, good) => pr.why.push({t, good});
    if(pr.favN) why('got to do her favorite', true);
    if(pr.eagerN) why('was in the mood for her clients', true);
    if(pr.disN) why('had to do things she dislikes', false);
    if(pr.reluct) why('did a few things as a favor', false);
    if(w.job==='rest'){ w.mood += 8; w.health += 15; why('a week off', true); }
    w.health = clamp(w.health+5);
    if(w._bed===FLOOR_REST && w.race!=='spirit'){ w.mood -= 3; why('slept on the floor', false); }
    w.mood += (BAL.mood.restingPoint + (has(w,'Loyal')?5:0) + (has(w,'Devoted')?10:0) - w.mood) * BAL.mood.drift * (w.race==='elf'?0.5:1);
    const work = pr.served + pr.acc - pr.comp*0.4, over = work - BAL.mood.overworkAt;
    if(over>0){ w.mood -= over*(has(w,'Lazy')?5:2.5); why(over>3 ? 'badly overworked' : 'a bit overworked', false); }
    if(!isFree(w) && w.wage < wageFor(w)*0.9){ w.mood -= 4; why('feels underpaid', false); }
    const P = PERS[w.personality]; if(P){ if(P.jobsUp.includes(w.job)){ w.mood += 3; why('likes her job', true); } else if(P.jobsDown.includes(w.job)){ w.mood -= 3; why("doesn't like her job", false); } }
    if(mad && w!==mad) w.mood += 3;
    if(h.up.bath) w.mood += 3;
    if(S.past==='cook') w.mood += 2;
    const o = getOutfit(w); if(o.style===w.style){ w.mood += 3; why('loves her outfit', true); }
    if(usesColor(o) && w.outColor===w.favColor) w.mood += 2;
    if(w.under!=='none' && usesColor(getUnder(w)) && w.underColor===w.favColor) w.mood += 1;
    if(has(w,'Greedy') && pr.earned>250){ w.mood += 4; why('made good money', true); }
    if(w.energy <= 5){ w.health -= 15; w.mood -= 10; why('exhausted', false); log(`⚠️ ${w.name} is exhausted. Give her some rest.`); }
    w.energy = clamp(w.energy, 0, maxEnergy(w)); w.mood = clamp(w.mood); w.health = clamp(w.health);
    if(has(w,'Devoted')) w.mood = Math.max(w.mood, 45);
    if(w.mood>65) w.trust += 0.5;
    if(w.mood<30 && !has(w,'Loyal') && !isFree(w)) w.trust -= 2;
    w.trust = clamp(w.trust);
    if(w.health<30 && w.job!=='rest'){ w.job='rest'; log(`🤒 ${w.name} is unwell and will rest next week.`); }
    if(w.job!=='rest' && w.trust < jobTrust(w,w.job) - 5){ log(`${w.name} doesn't trust Sam enough to keep working as ${JOBS[w.job].label} and stepped down.`); w.job='rest'; delete w.prevJob; }
    const dropped = w.menu.filter(a=>!canClient(w,a));
    if(dropped.length){ w.menu = w.menu.filter(a=>canClient(w,a)); log(`${w.name} took ${dropped.map(actLabel).join(', ')} off her menu for now.`); }
    if(w.job==='courtesan' && !getActs().some(a=>canClient(w,a.id))){ w.job='companion'; log(`${w.name} asked to go back to companion work for now.`); }
    if(!wardrobeOK(w,w.outfit)){ w.outfit = w.owned.find(k=>wardrobeOK(w,k)) || w.outfit; log(`${w.name} changed into something she's more comfortable in.`); }
    if(!underOK(w,w.under)){ w.under='plain'; }
    // auto-rest
    if(w.autoRest){
      if(w.job!=='rest' && w.energy < maxEnergy(w)*0.35){ w.prevJob = w.job; w.job = 'rest'; log(`😴 ${w.name} is worn out and will rest next week.`); }
      else if(w.job==='rest' && w.prevJob && w.energy >= maxEnergy(w)*0.85){ const pj = w.prevJob; delete w.prevJob; if(!canDo(w,pj)){ w.job = pj; log(`💪 ${w.name} is rested and back to work as ${JOBS[pj].label}.`); } }
    }
    // how she took the week's clients, by personality (data/personalities.json goodNight/badNight, flavor good_night/bad_night)
    if(pr.served >= 2){
      const avg = pr.satSum/pr.served, P = PERS[w.personality]||{};
      const kind = avg>=72 && !pr.low ? 'good' : (pr.low>=2 || avg<38) ? 'bad' : null;
      if(kind){ w.mood = clamp(w.mood + (kind==='good' ? (P.goodNight??3) : (P.badNight??-3))); pr.night = kind; why(kind==='good' ? 'her clients loved her' : 'difficult clients', kind==='good');
        if(Math.random()<0.6) R.hl.push({wid:w.id, text:flavor(kind+'_night', w), act:null, scene:'casual'}); }
    }
    // lust builds up, and is spent by services and time with Sam
    // (services and Sam's time already spent it as they happened; see spendLust)
    w.lust = w.lust + lustProfile(w).build; fitLust(w);
    if(w._samTime) why('spent time with Sam', true);
    if(has(w,'Devoted') && !w._samTime && w.lust >= LUST_HIGH){ why('missed Sam', false); w.mood = clamp(w.mood - BAL.lovers.missedMood); pr.missed = true; }
    if(has(w,'Devoted')) w.neglect = w._samTime ? 0 : (w.neglect||0) + 1;   // weeks in a row without Sam
    w._samTime = 0; pr.lust = Math.round(w.lust);
    pr.e1 = Math.round(w.energy); pr.m1 = Math.round(w.mood);
    w.earnedLast = pr.earned;
    if(w.mood<15 && !has(w,'Loyal') && !isFree(w) && !w.locked && !has(w,'Devoted')){ w.unhappy=(w.unhappy||0)+1; if(w.unhappy>=2) leaving.push(w); else log(`😠 ${w.name} is miserable. If nothing changes, she'll leave.`); }
    else w.unhappy = 0;
    if(!isFree(w) && !w.locked){ w.contract--; if(w.contract<=0 && !leaving.includes(w)) renew.push(w); }
    const enc = pr.enc.slice().sort(()=>Math.random()-0.5).sort((a,b)=>(b.act?2:b.want?0:1)+(b.reg?2:0)-(a.act?2:a.want?0:1)-(a.reg?2:0));
    enc.slice(0,2).forEach(e=>R.hl.push({wid:w.id, text:hlText(w,e) + (e.note ? ' ' + ENC_NOTE(e.note) : ''), act:e.act||null, cls:e.cls, scene: e.act ? 'act:'+e.act : e.where ? 'job_'+e.where : 'companion'}));
    pr.encAll = pr.enc.map(e=>encLine(e)); delete pr.enc;
    // romance arcs
    if(ARCS[w.key] && (w.arc||0) < ARCS[w.key].length){
      const i = w.arc||0, need = [40,48,56,64,72,82][i], gap = i===0 ? 1 : i<3 ? 2 : 3;
      const extra = i===2 ? (w.dates>=1 || w.privateCount>=1) : i===4 ? (w.dates>=2) : i===5 ? (w.privateCount>=2) : true;
      if(w.trust>=need && S.week-(w.arcWk||0) >= gap && extra){ const at = i; EVQ.push(()=> (w.arc||0)===at ? evArc(w) : null); }
    }
  });
  leaving.forEach(w=>{ S.workers = S.workers.filter(x=>x!==w); log(`🚪 ${w.name} packed her things and left.`); addLog(`${w.name} quit.`); });

  (R.houses||[]).forEach(hr=>{ if(hr.floor && hr.floor.length) log(`🛏️ ${hr.name} is short on beds: ${hr.floor.join(', ')} slept on the floor. Build staff quarters or add staff beds.`); });
  R.avgSat = R.served ? satSum/R.served : 50;
  const avgRep = S.houses.reduce((a,h)=>a+h.rep,0)/S.houses.length, maxRep = Math.max(...S.houses.map(h=>h.rep));
  S.rep = clamp(S.rep + ((maxRep*0.6 + avgRep*0.4) - S.rep)*0.35 + S.houses.length*0.1);
  R.rep = S.rep;

  S.houses.forEach(h=>{
    const st = STORIES[h.id]; if(!st || !h.story || h.story.beat>=st.beats.length) return;
    const need = STORY_REP[h.story.beat]||0, gap = h.story.beat===0 ? 2 : 3;
    if(S.week - Math.max(h.since||1, h.story.wk||0) >= gap && h.rep>=need){ const b = h.story.beat; EVQ.push(()=>{ if(h.story.beat!==b) return null; const ev = st.beats[b](h); if(ev) ev.title = `${st.title} (${b+1}/${st.beats.length})`; return ev; }); }
  });
  seedBonds(); driftBonds();
  queueEncounters();
  renew.forEach(w=>EVQ.push(()=>evRenew(w)));
  if(Math.random()<0.6){ const ev = pickRandomEvent(); if(ev) EVQ.push(ev); }
  if(S.flags.poachCD>0) S.flags.poachCD--;

  if(debtWeek()%4===0){
    const nd = nextDue();
    if(nd.amount>0){
      if(S.gold >= nd.amount){
        S.gold -= nd.amount; S.debt.remaining -= nd.amount; S.debt.carry = 0;
        log(`📜 Paid ${fmt(nd.amount)} to the Vane Credit House. Remaining: ${fmt(S.debt.remaining)}.`);
      } else {
        S.debt.strikes++; const pen = Math.round(nd.amount*0.1);
        S.debt.carry = Math.min(S.debt.remaining + pen, nd.amount + pen); S.debt.remaining += pen;
        log(`❌ Missed a debt payment! Strike ${S.debt.strikes}/3. A ${fmt(pen)} penalty was added.`);
        EVQ.push(evStrike);
      }
    }
  }
  if(R.income - R.wages - R.upkeep > 0) samGainXP(Math.min(30, Math.round((R.income - R.wages - R.upkeep)/60)));
  S.week++; S.ap = apMax(); S.sam.energy = Math.min(100, S.sam.energy + 40 + (S.past==='gym'?20:0));
  S.samWeek = {security:0, books:false, income:0, acts:[]};
  refreshCandidates();
  checkUnlocks(false, R.lines);
  S.lastReport = R;
  addLog(`Week ${R.week}: income ${fmt(R.income)}, wages ${fmt(R.wages)}, upkeep ${fmt(R.upkeep)}.`);
  save(); render();
  showReport(R, true);
}
function showReport(R, fromWeek){
  if(!R) return;
  const net = R.income - R.wages - R.upkeep;
  const L = R.led;
  const ledger = [['Escort fees',L.escort],['Off-duty propositions',L.offduty],['Bar',L.bar],['Stage',L.dance],['Bathhouse',L.bath]].filter(x=>x[1]).map(([k,v])=>`<tr><td>${k}</td><td class="good">+${fmt(v)}</td></tr>`).join('')
    + `<tr><td>Wages</td><td class="warn">−${fmt(R.wages)}</td></tr><tr><td>Upkeep</td><td class="warn">−${fmt(R.upkeep)}</td></tr>`
    + (L.sam?`<tr><td class="muted">Sam's bar shifts (already in your purse)</td><td class="good">+${fmt(L.sam)}</td></tr>`:'')
    + `<tr><th>Net</th><th class="${net>=0?'good':'warn'}">${fmt(net)}</th></tr>`;
  const houseRows = (R.houses||[]).map(h=>`<tr><td>${esc(h.name)}</td><td>${h.served}${h.turned?` <span class="warn">(+${h.turned} turned away)</span>`:''}</td><td>${fmt(h.income)}</td><td>${fmt(h.upkeep)}</td><td>${Math.round(h.avgSat)}</td><td>${Math.round(h.rep)}</td></tr>`).join('');
  const blocks = (R.houses||[]).map(hh=>{
    const ps = Object.values(R.per).filter(p=>p.house===hh.id);
    if(!ps.length) return '';
    return `<h3 style="margin-top:12px">${esc(hh.name)}</h3>` + ps.map(p=>{
      const w = findAny(p.id) || {id:p.id, name:p.name};
      const svc = Object.entries(p.acts).map(([id,n])=>`<span class="tag act">${esc(actLabel(id))} ×${n}</span>`).join('') + (p.comp?`<span class="tag">Companionship ×${p.comp}</span>`:'');
      const hls = R.hl.map((h,i)=>({h,i})).filter(x=>x.h.wid===p.id).map(({h,i})=>`<div class="hl">${esc(h.text)} ${findAny(p.id)?`<button class="sm" onclick="showImg('hl${i}','${p.id}','${h.scene}',null,'auto')">🎨</button>${h.noAi?'':aiBtn('hla'+i,'scene',p.id,{act:h.act,cls:h.cls,scene:h.scene})}`:''}<div id="hla${i}"></div><div id="hl${i}" class="hlimg"></div></div>`).join('')
        + (p.encAll && p.encAll.length > 2 ? `<details class="enc"><summary>All ${p.encAll.length} encounters</summary>${p.encAll.map(e=>`<div>${esc(e.t)}${e.note?` <span class="${e.good?'good':e.bad?'warn':'muted'}">${esc(e.note)}</span>`:''}</div>`).join('')}</details>` : '');
      return `<div class="rep-w"><div class="head">${w.design?avatarHTML(w):''}<div><b>${esc(p.name)}</b> · ${JOBS[p.job]?JOBS[p.job].label:p.job}${p.earned?` · earned <b>${fmt(p.earned)}</b>`:''}
        <div class="muted">${p.served?`${p.served} client${p.served>1?'s':''} · `:''}${p.props?`propositioned ${p.props}× · accepted ${p.acc} · `:''}${p.reluct?`<span class="pink">${p.reluct} as a favor</span> · `:''}${p.notMood?`<span class="warn">not in the mood ×${p.notMood}</span> · `:''}Energy ${p.e0}→${p.e1} · Mood ${p.m0}→${p.m1}${p.why&&p.why.length?` <span class="muted">(${p.why.map(x=>`<span class="${x.good?'good':'warn'}">${esc(x.t)}</span>`).join(', ')})</span>`:''}${p.slept?` · slept: ${p.slept}`:''}${p.solo?' · <span class="pink">a night to herself</span>':''}${p.missed?' · <span class="warn">missed Sam</span>':''}${p.night==='good'?' · <span class="good">great week</span>':p.night==='bad'?' · <span class="warn">rough week</span>':''}${p.lust!==undefined?` · lust ${p.l0!==undefined?p.l0+'→':''}${p.lust}`:''}</div>
        <div>${svc}</div></div></div>${hls}</div>`;
    }).join('');
  }).join('');
  modal(`<h2>Week ${R.week} Report</h2>
    <div class="grid2"><div>Clients served: <b>${R.served}</b>${R.turned?` <span class="warn">(${R.turned} turned away; more staff or rooms needed)</span>`:''}</div>
      <div>Avg. satisfaction: <b>${Math.round(R.avgSat)}</b> · Renown: <b>${Math.round(R.rep)}</b></div></div>
    <div class="grid2"><div><h3 style="margin-top:10px">Ledger</h3><table>${ledger}</table></div>
      <div><h3 style="margin-top:10px">Houses</h3><table><tr><th>House</th><th>Clients</th><th>Income</th><th>Upkeep</th><th>Sat.</th><th>Rep</th></tr>${houseRows}</table></div></div>
    ${R.samActs&&R.samActs.length?`<h3 style="margin-top:10px">Sam's week</h3><div class="muted">${R.samActs.map(esc).join(' · ')}</div>`:''}
    ${R.lines.length?`<h3 style="margin-top:10px">Notes</h3>${R.lines.map(l=>`<div>${esc(l)}</div>`).join('')}`:''}
    ${blocks || '<p class="muted">Nobody worked this week.</p>'}
    <div class="row" style="margin-top:12px"><button class="primary" onclick="closeModal();${fromWeek?'runQueue()':''}">Continue</button></div>`, {lock:!!fromWeek, wide:true});
}
