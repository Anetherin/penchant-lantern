'use strict';
/* =====================================================================
   WEEK RESOLUTION
   ===================================================================== */
function pickClass(h){
  const p = h.price, cw = HOUSES[h.id].cls;
  const ws = [Math.max(3,50-10*p), 30 + (S.flags.guild?8:0), 15+4*p+(h.up.lounge?6:0), Math.max(1, 5+4*p+h.rep/10+(h.up.lounge?6:0))];
  return weighted(CLASSES, c=>{ const i=CLASSES.indexOf(c); return ws[i]*cw[i]*(c.id==='merchant'&&h.bonus&&h.bonus.merchant||1); });
}
const SVC = BAL.svc;
// How the report phrases a service (services.json → ask): what HE asks for ("asked for oral") vs what SHE does when she's the one offering ("she offered to go down on him").
const askClient = id => { const a = actById(id); return (a && a.ask && a.ask.client) || 'for ' + actLabel(id).toLowerCase(); };
const askLady = id => { const a = actById(id); return (a && a.ask && a.ask.lady) || 'offered ' + actLabel(id).toLowerCase(); };
function pickWant(cls, w){ return weighted(getActs().filter(a=>!w || !actBanned(w, a.id)), a=>(cls.id==='commoner' ? 90/a.price : cls.id==='noble' ? a.price/80 : 1) * (a.want ?? 1) * ((cls.wants||{})[a.id] ?? 1)).id; }
function qualityOf(w, act){
  if(!act) return (s100(w.tech.service)*0.5 + s100(w.stats.beauty)*0.25 + s100(w.stats.charm)*0.25)/100;
  return (s100(actSkill(w,act))*0.5 + s100(w.stats.beauty)*0.3 + s100(w.stats.charm)*0.2)/100 * fxSub(w,'actQuality',act);
}
// How good this client is at it: 0.3-1.4 around his class's mean (data/economy.json → classes.tech). Regulars keep theirs.
function clientTech(cls, reg){
  if(reg && reg.tech !== undefined) return reg.tech;
  const t = clamp((cls.tech ?? 0.85) + (Math.random()+Math.random()-1)*0.55, SVC.techMin, SVC.techMax);
  if(reg) reg.tech = t;
  return t;
}
// Her expression during a service: bored / professional / into it / lost in it; personality can shift it (personalities.json → expr).
const EXPR_LABEL = {bored:'bored', professional:'professional', into:'into it', lost:'lost in it', flustered:'flustered', smug:'smug'};
function exprFor(w, act, reluct){
  const k = restless(w) ? 'lost' : (reluct || w.lust < LUST_LOW) ? 'bored' : (w.lust >= LUST_EAGER || w.fav===act) ? 'into' : 'professional';
  const m = (PERS[w.personality]||{}).expr;
  return (m && m[k]) || k;
}
function hlText(w, e){
  const who = e.reg ? `${e.reg}, one of the regulars,` : pick(CLIENT_DESC[e.cls]), N = w.name;
  const more = e.more ? ` She was in the mood for more afterward, and ${askLady(e.more)}.` : '';
  if(e.self) return `${flavor('self_prop', w)}${e.act ? ` She ${askLady(e.act)}, and he didn't need asking twice.${more}` : ' This time he politely passed.'}`;
  if(e.where){
    const where = PROP_WHERE[e.where];
    if(e.act) return `${cap(who)} propositioned ${N} ${where}, asking ${askClient(e.want)}. ${e.outcome==='alt' ? `She ${askLady(e.act)} instead, and he took it.` : 'She thought about it for exactly one second, then took his hand and led him upstairs.'}${more}`;
    return `${cap(who)} propositioned ${N} ${where}, asking ${askClient(e.want)}. She turned him down${(w.offDuty==='off' && !(JOBS[w.job]||{}).must)?' (she isn\'t open to propositions)':''}.`;
  }
  if(!e.want) return `${cap(who)} spent the evening with ${N} in the lounge: wine, conversation, and a lot of laughing. ${flavor('client_company', w)}`;
  if(e.outcome==='yes') return `${cap(who)} came for ${N} and asked ${askClient(e.act)}. ${(actById(e.act)&&actById(e.act).report&&actById(e.act).report.length) ? pick(actById(e.act).report) : flavor('client_yes', w)}${e.encore ? ' ' + flavor('encore', w) : ''}${more}`;
  if(e.outcome==='alt') return `${cap(who)} asked ${N} ${askClient(e.want)}. She said no to that, but ${askLady(e.act)} instead, and he happily took it.${more}`;
  return `${cap(who)} asked ${N} ${askClient(e.want)}. She politely declined, and he settled for her company over a bottle of wine.`;
}
// One service for one client, from her side: mood, lust (per service, technique, favorites), demon feeding, expression.
// o = {tech, reluct, pr, h}. Returns {note, expr, frustrated, fed, drained}.
function serveAct(w, a, o){
  const B = BAL.lust, act = a.id, pr = o.pr, fav = w.fav===act, dis = w.dislike===act, reck = restless(w), eager = w.lust >= LUST_EAGER;
  const expr = exprFor(w, act, o.reluct);
  let frustrated = false, fed = 0, drained = false;
  if(o.reluct){ moodAdd(w, -2); pr.reluct = (pr.reluct||0)+1; }
  if(fav){ moodAdd(w, 1.5); pr.favN = (pr.favN||0)+1; }
  if(dis){ moodAdd(w, -2.5); pr.disN = (pr.disN||0)+1; }
  if(eager && !o.reluct){ moodAdd(w, B.bonus.clientMood); pr.eagerN = (pr.eagerN||0)+1; }
  if(a.lust === undefined) spendLust(w, B.drop.client + (fav ? B.drop.fav : 0));
  else if(a.lust >= 0){   // giving, kissing, massages: with a client it's work, not foreplay. Only an insatiable lady (svcLustBuild fx) gets worked up by it.
    if(fxHas(w,'svcLustBuild')){ w.lust += a.lust * (0.4 + w.lewd/100) * (fav?1.5:1) * (dis?0.6:1) * fxMul(w,'lustBuild'); fitLust(w); }
  } else {
    const k = (o.tech ?? 0.85) * (fav?1.5:1) * (dis?0.6:1) * fxSub(w,'actQuality',act);
    frustrated = !!a.finish && (o.tech ?? 0.85) * (w.lust/60) < SVC.frustrateAt;
    if(frustrated){ w.lust += SVC.frustrateLust; fitLust(w); moodAdd(w, -1); pr.frustN = (pr.frustN||0)+1; }
    else spendLust(w, -a.lust * k);
  }
  if(a.energyBack) w.energy += a.energyBack;
  if(a.mood) moodAdd(w, a.mood);
  if(w.race==='demon' && a.finish){
    fed = reck ? SVC.demon.feedReckless : SVC.demon.feed; w.energy += fed;
    if(reck){ drained = true; pr.drains = (pr.drains||0)+1; if(o.h && !(o.h.up && o.h.up.sigil)) o.h.rep = clamp(o.h.rep - SVC.demon.repDrain); }
  }
  if(w.race==='demon' && a.kind==='kiss'){ fed += SVC.demon.kissFeed; w.energy += SVC.demon.kissFeed; }   // a kiss is a small sip
  countUp(w,'svc'); countUp(w,'svcByAct.'+act); if(a.kind==='massage') countUp(w,'massage');
  const note = drained ? 'drained' : frustrated ? 'frustrated' : fav ? 'fav' : o.reluct ? 'stretch' : dis ? 'dislike' : eager ? 'eager' : null;
  return {note, expr, frustrated, fed, drained};
}
const ENC_NOTE = k => k ? flavor('enc_'+k) : '';
const CLS_LABEL = id => ((CLASSES.find(c=>c.id===id)||{}).label || id);

/* ---------- jobs, propositions & rough clients (docs/OVERHAUL.md §5-6) ---------- */
// Reputation gains get harder as the house grows: max(gainMin, gainBase - rep/gainDiv). Losses are unchanged.
const repGain = (h, n) => n > 0 ? n * Math.max(BAL.rep.gainMin, BAL.rep.gainBase - h.rep/BAL.rep.gainDiv) : n;
function repAdd(h, n){ h.rep = clamp(h.rep + repGain(h, n)); }
// Each accepted proposition costs a non-must lady 8% of her main job's output that week (max 50%).
const outputMult = (w, pr) => (JOBS[w.job] && JOBS[w.job].must) ? 1 : Math.max(1 - BAL.props.maxPenalty, 1 - BAL.props.penalty*(pr.accProp||0));
// Courtesans work out of the mood; everyone else turns heavier services down below lust.low.
const moodFree = w => w.job === 'courtesan';
const nim = (w, id) => !moodFree(w) && notInMood(w, id);
// Menu used for must-offer staff: her menu, or what she's comfortable with if she never set one.
const offeredMenu = w => w.menu.length ? w.menu : getActs().filter(a=>clientStance(w,a.id)==='yes').map(a=>a.id);
// Would she take this proposition? Returns {kind:'yes'|'alt'|'no', act, why}.
function propDecide(w, want, X){
  const BP = BAL.props, must = !!(JOBS[w.job] && JOBS[w.job].must), reck = restless(w) && !has(w,'Devoted'), mode = w.offDuty || 'ask';
  let chance;
  if(must) chance = 1;
  else if(mode==='on') chance = BP.onChance;
  else if(mode==='off') chance = reck ? BP.offSlip : 0;
  else chance = clamp(BP.acceptBase + (w.lust - BP.acceptLustMid)/100 + fxAdd(w,'willing')/100 + (w.lust >= LUST_EAGER ? BP.acceptEager : 0) + (reck ? BP.acceptReckless : 0), 0.02, 0.95);
  if(Math.random() >= chance) return {kind:'no', why:'declined'};
  const menu = must ? offeredMenu(w) : w.menu, ok = id => menu.includes(id) && canClient(w,id) && !nim(w,id) && w.energy - actCost(w,id) > maxEnergy(w)*0.2;
  if(want && ok(want)) return {kind:'yes', act:want};
  if(want && menu.includes(want) && nim(w,want)) return {kind:'no', why:'nomood'};
  const alt = menu.filter(id=>ok(id) && actById(id) && actById(want) && actById(id).price <= actById(want).price).sort((a,b)=>actById(b).price-actById(a).price)[0];
  if(alt && Math.random() < BP.alt) return {kind:'alt', act:alt};
  return {kind:'no', why:'declined'};
}
// One service for one client: growth, energy, room, her side (serveAct), and an encore for a restless lady. Used by escorts,
// propositions and reckless self-propositions alike. o = {tech, reluct, inc, ecost, led}.
function runService(X, w, A, o){
  const pr = X.R.per[w.id], act = A.id, hr = X.hr;
  pr.acts[act] = (pr.acts[act]||0)+1; growAct(w, act, 0.7); lewdUp(w, o.reluct?0.6:0.3, svcLewdCap(act,'client'));
  w.energy -= o.ecost; X.useRoom(w);
  const reck0 = restless(w);
  const ser = serveAct(w, A, {tech:o.tech, reluct:o.reluct, pr, h:X.h});
  let note = ser.note, encore = null;
  const more = askMore(X, w, A, o);
  if(more && more.drained) note = 'drained';
  if(!more && A.finish && reck0 && w.lust >= LUST_EAGER && X.roomOK(w) && Math.random() < SVC.encoreBase + fxAdd(w,'encore')){
    const ids = offeredMenu(w).filter(id=>canClient(w,id) && !nim(w,id)), a2id = (!ids.length || (ids.includes(act) && Math.random()<0.5)) ? act : pick(ids), A2 = actById(a2id);
    const fee2 = Math.round(o.inc * (A2.price/A.price) * SVC.encoreFee);
    hr.income += fee2; X.R.led[o.led] += fee2; pr.earned += fee2; w.energy -= actCost(w, a2id); X.useRoom(w);
    pr.acts[a2id] = (pr.acts[a2id]||0)+1; countUp(w,'encore'); encore = a2id;
    const s2 = serveAct(w, A2, {tech:o.tech, reluct:false, pr, h:X.h}); if(s2.drained) note = 'drained';
  }
  return {ser, note, encore, reck0, more: more ? more.id : null};
}
// After a service that built her lust (giving, kissing, massages), a lady in the mood may ask the client for more: a heavier service from
// her menu that actually spends it. o.noRoom: it happens where she already is (the baths). Returns {id, drained} or null.
function askMore(X, w, A, o){
  const M = SVC.askMore;
  if(!M || (A.lust ?? -1) < 0 || w.lust < LUST_EAGER || w.lewd < M.lewd || Math.random() >= M.chance + fxAdd(w,'encore')*0.5) return null;
  if(!o.noRoom && !X.roomOK(w)) return null;
  const ids = offeredMenu(w).filter(id=>{ const B = actById(id); return B && (B.lust ?? -1) < 0 && canClient(w,id) && !nim(w,id) && w.energy - actCost(w,id) > maxEnergy(w)*0.15; });
  if(!ids.length) return null;
  const id = (w.fav && ids.includes(w.fav)) ? w.fav : pick(ids), B = actById(id), pr = X.R.per[w.id];
  const fee = Math.round(o.inc * (B.price/A.price) * M.fee);
  X.hr.income += fee; X.R.led[o.led] += fee; pr.earned += fee; w.energy -= actCost(w, id); if(!o.noRoom) X.useRoom(w);
  pr.acts[id] = (pr.acts[id]||0)+1; growAct(w, id, 0.5); countUp(w,'askedMore'); pr.moreN = (pr.moreN||0)+1;
  const s2 = serveAct(w, B, {tech:o.tech, reluct:false, pr, h:X.h});
  return {id, drained: s2.drained};
}
// After she says no, a pushy client may try to force the issue (non-graphic). Security power (house) vs a roll; else Sam, if he is
// around; else nobody. Returns 'security' | 'sam' | 'samfail' | 'none' | null (he took no for an answer).
function pushyCheck(X, w, cls, pr){
  const BP = BAL.props, chance = clamp((cls.pushy||0) + (cls.reckless||0)*0.5 + X.barN*BAL.jobs.barReckless, 0, BP.maxPushy);
  if(Math.random() >= chance) return null;
  const h = X.h, hr = X.hr; let res;
  countUp(w,'rowdy'); pr.pushy = (pr.pushy||0)+1; hr.pushy.total++;
  if(X.secPow > rnd(BP.securityRoll[0], BP.securityRoll[1])){ res = 'security'; moodAdd(w, BP.secMood); }
  else if(S.sam.energy >= BP.samEnergyMin){
    // security couldn't handle it and Sam is around: someone runs to fetch him. What he does is the player's call
    // (an event after the report, see pushyEvent); until then the incident is 'samcall'.
    res = 'samcall'; (hr.calls = hr.calls||[]).push({wid:w.id, cls:cls.id||null, h:h.id});
  } else { res = 'none'; moodAdd(w, -BP.noneMood); h.rep = clamp(h.rep - BP.noneRep); }
  if(res==='security' || res==='sam') countUp(w,'rescued');
  hr.pushy[res]++; (pr.notes = pr.notes||[]).push(flavor('pushy_'+res, w));
  return res;
}
// Sam's answer to the pushy clients security couldn't handle this week (one event for all of them).
function samStepIn(c){
  const BP = BAL.props, w = findW(c.wid), h = H(c.h); if(!w || !h) return null;
  if(S.sam.energy >= BP.samEnergyMin && S.sam.strength + S.sam.charm/2 + rnd(0, BP.samRoll) >= BP.samCheck){
    moodAdd(w, BP.samMood); gainTrust(w, BP.samTrust); S.sam.energy = Math.max(0, S.sam.energy - BP.samCost); countUp(w,'rescued'); return 'sam'; }
  S.sam.energy = Math.max(0, S.sam.energy - BP.failCost); h.rep = clamp(h.rep - BP.failRep); moodAdd(w, -BP.failMood); minorTrust(w); return 'samfail';
}
function pushyEvent(calls){
  const BP = BAL.props, names = Array.from(new Set(calls.map(c=>(findW(c.wid)||{}).name).filter(Boolean)));
  if(!names.length) return null;
  const n = calls.length, fee = (BP.watchFee||40) * n, first = findW(calls[0].wid);
  const stay = c => { const w = findW(c.wid), h = H(c.h); if(!w || !h) return; moodAdd(w, -BP.noneMood); h.rep = clamp(h.rep - BP.noneRep); };
  return {title:'Trouble downstairs', who: first ? first.id : null, scene:'portrait',
    text:`${n>1?`${n} times this week, a`:'A'} client got pushy with ${names.join(', ')}, and security couldn't handle it. Someone came running to fetch Sam.${S.samWeek.security?'':' (Sam wasn\'t standing watch.)'}

Sam's Strength ${Math.round(S.sam.strength)}, Charm ${Math.round(S.sam.charm)}, energy ${Math.round(S.sam.energy)}.`,
    choices:[
      {label:'Step in yourself', fx(){ const r = calls.map(samStepIn), ok = r.filter(x=>x==='sam').length, bad = r.filter(x=>x==='samfail').length;
        return `${ok?`Sam settled it ${ok>1?ok+' times':''} himself. ${names.length>1?'They':'She'} won't forget it.`:''}${bad?` ${bad>1?bad+' times':'Once'} it went badly: a loud scene and a bad story about the house.`:''}`.trim(); }},
      {label:`Call the town watch (${fmt(fee)})`, fx(){ if(S.gold < fee){ calls.forEach(stay); return 'Sam can\'t cover the fee. By the time anyone comes, it\'s over. She got away from him, shaken.'; }
        S.gold -= fee; calls.forEach(c=>{ const h = H(c.h); if(h) h.rep = clamp(h.rep - (BP.watchRep ?? 0.5)); const w = findW(c.wid); if(w) minorTrust(w); });
        return `−${fmt(fee)}. The watch hauls him off. Not the house's proudest moment, but nobody got hurt.`; }},
      {label:'Let her handle it', fx(){ calls.forEach(stay); return `${names.join(', ')} got away from him, shaken. Word gets around that nobody came.`; }}
    ]};
}
// The madame coaches her courtesans: if she is clearly more popular (balance.json → jobs.madamePopGap), every service skill
// (and Service) she is better at grows by madameCoach x the gap, rounded down (1000-unit skills: 1% of a 300-point gap = +3).
function madameCoach(mad, w, pr){
  const J = BAL.jobs; if(mad===w || mad.popularity < w.popularity + J.madamePopGap) return;
  let n = 0;
  Object.keys(w.acts||{}).forEach(id=>{ const m = mad.acts && mad.acts[id]; if(!m) return; const d = Math.floor((m.skill - w.acts[id].skill) * J.madameCoach); if(d > 0){ w.acts[id].skill = clampK(w.acts[id].skill + d); n++; } });
  const ds = Math.floor(((mad.tech.service||0) - (w.tech.service||0)) * J.madameCoach); if(ds > 0){ w.tech.service = clampK(w.tech.service + ds); n++; }
  if(n){ pr.coached = n; pr.why.push({t:`${mad.name} coached her`, good:true}); }
}
function simHouse(h, R){
  const HD = HOUSES[h.id], W = S.workers.filter(w=>w.house===h.id), P = PRICES[h.price], J = BAL.jobs, BP = BAL.props, TY = BAL.tidy;
  const hr = {id:h.id, name:h.name, income:0, served:0, turned:0, sat:0, upkeep:0, short:0, roomsUsed:0, roomCap:h.rooms*BAL.rooms.perRoom, tidy0:h.tidy ?? TY.start, tidy:h.tidy ?? TY.start, tidyFx:null,
    promoDraw:0, selfProps:0, accProps:0, stepIn:0, pushy:{total:0, security:0, sam:0, samfail:0, none:0, samcall:0}, calls:[]};
  const byJob = j => W.filter(w=>w.job===j);
  const jb = (w, j) => fxSub(w, 'jobBonus', j);
  const mad = byJob('madame')[0], mgmt = !!mad;   // the madame matches clients to the lady whose menu fits
  const madF = mad ? (0.5 + (s100(mad.tech.manage) + s100(mad.stats.charm))/200) * ob(mad,'madame') * jb(mad,'madame') : 0;
  const danceDraw = byJob('dancer').reduce((a,w)=>a + (1 + w.popularity/30 + s100(w.tech.dance)/50)*ob(w,'dancer')*jb(w,'dancer'), 0);
  let secPow = byJob('security').reduce((a,w)=>a + (s100(w.tech.combat) + s100(w.stats.strength)*0.5 + fxAdd(w,'security'))*ob(w,'security')*jb(w,'security'), 0);
  if(h.up.guard) secPow *= 1.8;
  secPow += S.samWeek.security;
  const barN = h.up.bar ? byJob('bartender').length : 0, attendants = byJob('attendant'), attM = attendants.length ? J.attendantEnergy : 1;
  const X = {h, hr, R, P, secPow, barN, mgmt, rowdySum:0, rowdyN:0, expectMiss:0};
  X.roomOK = w => has(w,'Exhibitionist') || hr.roomsUsed < hr.roomCap;
  X.useRoom = w => { if(!has(w,'Exhibitionist')) hr.roomsUsed++; };
  hr.tidyFx = hr.tidy0 >= TY.high ? TY.fx.high : hr.tidy0 < TY.bad ? TY.fx.bad : hr.tidy0 < TY.low ? TY.fx.low : null;
  const repEff = h.rep*0.75 + S.rep*0.25;
  let dBase = (10 + repEff*0.4 + (h.up.lounge?4:0) + danceDraw*1.5) * HD.demand * (P.demand + (h.price>=2 ? repEff/250 : 0)) * rnd(0.85,1.15);
  if(HD.haunted) dBase *= 0.45 + Math.min(1, h.rep/(HD.hauntRep||40))*0.8;
  dBase *= (h.bonus&&h.bonus.demand) || 1;
  const v0 = W.length ? Math.max(1, Math.round(dBase)) + danceDraw*2 : 0;   // expected visitors, for proposition rates
  const escorts = W.filter(w=>JOBS[w.job].cat==='escort');
  const capc = {}; escorts.forEach(w=>capc[w.id] = 10);
  // max lust: some ladies spend part of a night alone instead (costs energy, fewer clients)
  W.forEach(w=>{
    if(!restless(w) || has(w,'Devoted') || Math.random() >= soloChance(w)) return;   // lovers wait for Sam
    const pr = R.per[w.id]; pr.solo = true;
    w.energy = Math.max(0, w.energy - Math.round(maxEnergy(w)*BAL.solo.energyCost)); spendLust(w, BAL.solo.lustDrop); moodAdd(w, 3);
    if(capc[w.id]!==undefined) capc[w.id] = Math.min(capc[w.id], BAL.solo.clientCap);
    R.hl.push({wid:w.id, text:flavor('solo', w), act:null, scene:'solo', noAi:true});
  });
  const roomM = ROOM_MULT[h.tier];
  const propInc = (w, id, cls) => Math.round(actById(id).price * P.mult * BP.propFee * (0.6+qualityOf(w,id)*0.9) * cls.mult * fxMul(w,'clientFee') * BAL.income.escort);

  // --- propositions to staff (courtesans are asked through the main flow below)
  W.forEach(w=>{
    const j = w.job, rate = PROP_RATE[j]; if(!rate) return;
    const pr = R.per[w.id], must = !!JOBS[j].must;
    const n = Math.round(v0 * rate * (1 + barN*J.barProp) * fxMul(w,'propRate') * (0.4 + appeal(w)/100) * ob(w,'propose') * rnd(0.6,1.4));
    for(let i=0;i<n;i++){
      const cls = pickClass(h); if(Math.random() > (cls.prop ?? 1)) continue;
      const want = pickWant(cls, w), expects = j==='attendant' && Math.random() < BP.attendantExpect; pr.props++;
      const dec = propDecide(w, want, X), e = {cls:cls.id, want, act:null, outcome:'no', where:j, note:null, expr:null, ctx:'prop'};
      if(dec.kind === 'no'){
        if(dec.why==='nomood'){ pr.notMood = (pr.notMood||0)+1; e.note = 'nomood'; }
        if(expects){ X.expectMiss++; pr.expectMiss = (pr.expectMiss||0)+1; e.note = 'expect'; }
        const pu = pushyCheck(X, w, cls, pr); if(pu) e.note = 'pushy_'+pu;
      } else if(!X.roomOK(w)){ hr.turned++; hr.short++; pr.noRoom = (pr.noRoom||0)+1; e.note = 'noroom'; }
      else {
        const A = actById(dec.act), reluct = clientStance(w,dec.act)==='ask', inc = propInc(w, dec.act, cls);
        hr.income += inc; R.led.offduty += inc; pr.earned += inc; pr.acc++; hr.accProps++; if(!must) pr.accProp = (pr.accProp||0)+1;
        const rs = runService(X, w, A, {tech:clientTech(cls,null), reluct, inc, ecost:actCost(w,dec.act), led:'offduty'});
        if(!must && !reluct && w.lust < LUST_EAGER && !restless(w)){ moodAdd(w, -BP.reluctantMood); pr.grudging = (pr.grudging||0)+1; }
        e.act = dec.act; e.outcome = dec.kind; e.note = rs.note; e.expr = rs.ser.expr; e.encore = rs.encore; e.more = rs.more; if(rs.reck0) e.ctx = 'reckless';
      }
      pr.enc.push(e);
    }
  });
  // --- restless ladies proposition clients themselves (1-3 extra encounters; lovers wait for Sam)
  W.forEach(w=>{
    const pr = R.per[w.id];
    if(w.job==='rest' || !restless(w) || has(w,'Devoted') || pr.solo) return;
    const must = !!JOBS[w.job].must, n = ri(BP.recklessMin, BP.recklessMax);
    for(let i=0;i<n;i++){
      const ids = offeredMenu(w).filter(id=>canClient(w,id) && actById(id) && w.energy - actCost(w,id) > maxEnergy(w)*0.2);
      if(!ids.length) break;
      const id = (w.fav && ids.includes(w.fav) && Math.random()<0.5) ? w.fav : pick(ids), cls = pickClass(h), e = {cls:cls.id, want:id, act:null, outcome:'no', self:true, note:null, expr:null, ctx:'reckless'};
      pr.props++; hr.selfProps++; R.selfProps++;
      if(Math.random() < clamp(BP.selfAccept + appeal(w)/250, 0.3, 0.95) && X.roomOK(w)){
        const A = actById(id), inc = propInc(w, id, cls);
        hr.income += inc; R.led.offduty += inc; pr.earned += inc; pr.acc++; hr.accProps++; if(!must) pr.accProp = (pr.accProp||0)+1;
        const rs = runService(X, w, A, {tech:clientTech(cls,null), reluct:false, inc, ecost:actCost(w,id), led:'offduty'});
        e.act = id; e.outcome = 'yes'; e.note = rs.note; e.expr = rs.ser.expr; e.encore = rs.encore; e.more = rs.more;
      }
      pr.enc.push(e);
    }
  });
  // --- promoters draw clients (free samples: bigger draw, but it tires her and shows in the house's name)
  let promoDraw = 0;
  byJob('promoter').forEach(w=>{
    const pr = R.per[w.id], samples = w.samples && !has(w,'Modest');
    let d = (J.promoterBase + (s100(w.stats.charm) + s100(w.tech.service))/J.promoterDiv) * ob(w,'promoter') * jb(w,'promoter') * fxMul(w,'promote') * outputMult(w, pr);
    if(samples){
      d *= J.samplesDraw; w.energy -= J.samplesEnergy; spendLust(w, J.samplesLust); pr.samples = true;
      const dr = (qualityOf(w) - 0.5) * J.samplesRep; if(dr > 0) repAdd(h, dr); else h.rep = clamp(h.rep + dr);
      if(Math.abs(dr) >= 0.05) (pr.notes = pr.notes||[]).push(flavor(dr > 0 ? 'job_samples_rep_good' : 'job_samples_rep_bad', w));
    }
    pr.draw = d; promoDraw += d; countUp(w,'promo', Math.max(1, Math.round(d)));
  });
  hr.promoDraw = promoDraw;
  const demand = W.length ? Math.max(1, Math.round(dBase + promoDraw)) : 0;

  // --- the main client flow: escorts (courtesans), with the madame and attendants stepping in when they are swamped
  const helpers = [mad, ...attendants].filter(Boolean), helperOK = x => x.energy >= maxEnergy(x)*J.stepInMinEnergy && (R.per[x.id].served < J.stepInCap) && !R.per[x.id].solo;
  const avl = x => R.per[x.id].served < capc[x.id] && (x.race==='demon' || x.energy >= maxEnergy(x)*0.2);
  const regs = demand ? regularsVisiting(h) : []; let bestNew = null;
  for(let i=0;i<demand;i++){
    let pool = escorts.filter(avl), helper = false;
    if(!pool.length){ pool = helpers.filter(helperOK); helper = true; }
    if(!pool.length){ hr.turned++; continue; }
    const reg = regs.shift() || null, fw = reg && pool.find(x=>x.id===reg.fav);   // regulars ask for their favorite
    let w = fw || weighted(pool, x=>5+appeal(x));
    const cls = reg ? (CLASSES.find(c=>c.id===reg.cls)||pickClass(h)) : pickClass(h);
    X.rowdySum += cls.rowdy||0; X.rowdyN++;
    const lightOK = id => !helper || actTierOf(actById(id)) <= 1, fits = (x,id) => x.menu.includes(id) && canClient(x,id) && !nim(x,id) && lightOK(id);
    let want = Math.random() < (helper ? J.propWant.other : J.propWant.courtesan) ? pickWant(cls, w) : null, matched = false;
    // the madame sends the client to the lady whose menu fits
    if(want && mgmt && !helper && !fw){
      if(!fits(w,want)){ const alt = pool.filter(x=>fits(x,want)); if(alt.length) w = weighted(alt, x=>5+appeal(x)); }
      matched = fits(w,want);
    }
    // clients who are fans of her kind, or put off by it (data/races.json → client)
    let react = raceReact(w, cls.id);
    if(react==='dislike' && !reg && Math.random() < SVC.raceDislikeSwitch){
      const alt = pool.filter(x=>x!==w);
      if(alt.length){ w = weighted(alt, x=>5+appeal(x)); react = raceReact(w, cls.id); if(react==='dislike') react = null; if(want && !fits(w,want)) matched = false; }
    }
    const pr = R.per[w.id];
    let act = null, outcome = 'comp';
    if(want){
      pr.props++;
      if(fits(w,want)){ act = want; outcome='yes'; pr.acc++; }
      else if(nim(w,want)){ pr.notMood = (pr.notMood||0)+1; outcome='no'; pr._nm = true; }
      else {
        const alt = w.menu.filter(id=>canClient(w,id) && !nim(w,id) && lightOK(id) && actById(id) && actById(id).price<=actById(want).price).sort((a,b)=>actById(b).price-actById(a).price)[0];
        if(alt && Math.random() < (moodFree(w) ? BP.altMust : BP.alt)){ act = alt; outcome='alt'; pr.acc++; } else outcome='no';
      }
    }
    if(act && !X.roomOK(w)){ pr.acc--; pr.props--; pr.noRoom = (pr.noRoom||0)+1; hr.turned++; hr.short++; continue; }   // short on rooms
    if(helper){ hr.stepIn++; pr.stepIn = (pr.stepIn||0)+1; }
    const reluct = act && clientStance(w,act)==='ask', ecost = actCost(w, act) * (w.job==='courtesan' ? attM : 1), A = act ? actById(act) : null;
    const tech = clientTech(cls, reg);
    const q = qualityOf(w, act) * (reluct?0.85:1);
    let cm = cls.mult * ob(w, cls.id) * fxSub(w,'classBonus',cls.id);
    if(cls.id==='noble') cm *= (0.7 + s100(w.stats.refinement)/170);
    const base = act ? actById(act).price * roomM * ob(w,'courtesan') : 20 * ob(w,'courtesan');
    const below = Math.max(0, (HD.minPop||0) - w.popularity);
    const inc = Math.round(base * P.mult * (0.6+q*0.9) * cm * (1+madF*0.15) * fxMul(w,'clientFee') * jb(w,w.job) * (react==='like' ? SVC.raceLikeFee : 1) * (below?0.75:1) * (reg ? (regQuirk(reg).tip||1) : 1) * BAL.income.escort);
    const sat = clamp(- below*0.5 - Math.max(0, repEff - BAL.clients.pickFrom)*BAL.clients.pickPer + q*100 + 6 + rnd(-15,15) + h.tier*5 - (h.price-1)*6 + (h.up.bath?4:0) + (HD.sat||0) + (w.job==='courtesan' && attendants.length ? J.attendantSat : 0) + (matched && outcome==='yes' ? J.madameMatchSat : 0) + (outcome==='yes'?8:outcome==='alt'?3:outcome==='no'?-8:0)
      + (fxSub(w,'classBonus',cls.id)-1)*SVC.classBonusSat + (react==='like' ? SVC.raceLikeSat : react==='dislike' ? SVC.raceDislikeSat : 0));
    pr.satSum = (pr.satSum||0) + sat; if(sat<30) pr.low = (pr.low||0)+1;
    hr.income += inc; R.led.escort += inc; pr.served++; pr.earned += inc; hr.served++; hr.sat += sat;
    w.popularity = clamp(w.popularity + (sat-45)/50);
    let note = null, ser = null, encore = null, reck0 = false, more = null;
    if(act){
      const rs = runService(X, w, A, {tech, reluct, inc, ecost, led:'escort'});
      ser = rs.ser; note = rs.note; encore = rs.encore; reck0 = rs.reck0; more = rs.more;
      if(moodFree(w) && notInMood(w, act)){ moodAdd(w, -1); pr.offMood = (pr.offMood||0)+1; }   // she worked it anyway
    } else { pr.comp++; grow(w,'service',0.5); w.energy -= ecost; }
    let pu = null;
    if(outcome==='no' && want) pu = pushyCheck(X, w, cls, pr);
    if(!note) note = pu ? 'pushy_'+pu : outcome==='no' ? (pr._nm ? 'nomood' : 'declined') : react==='like' ? 'like' : react==='dislike' ? 'put_off' : sat>=80 ? 'glow' : sat<30 ? 'flat' : null;
    pr._nm = false;
    const e = {cls:cls.id, want, act, outcome, reg: reg ? reg.name : null, note, sat:Math.round(sat), expr: ser ? ser.expr : null, react, encore, more, ctx: reck0 ? 'reckless' : ''};
    pr.enc.push(e);
    if(reg) regAfter(reg, w, sat, inc); else if(sat>=75 && (!bestNew || sat>bestNew.sat)) bestNew = {sat, w, cls};
  }
  maybeNewRegular(h, bestNew, R);
  const visitors = hr.served + hr.turned*0.5 + danceDraw*2;
  // --- staff output (reduced by the propositions she accepted this week, unless it's a must-offer role)
  let maidAdd = 0;
  // one attendant per courtesan: the most popular courtesans get theirs first (balance.json → jobs.attendantOwn*)
  const ownAtt = new Set(byJob('courtesan').sort((a,b)=>b.popularity-a.popularity).slice(0, attendants.length).map(w=>w.id));
  const bathers = Math.round((hr.served + hr.turned*0.5) * J.bathShare), baths = byJob('bath');
  W.forEach(w=>{
    const j = w.job, pr = R.per[w.id], om = outputMult(w, pr);
    if(j==='bartender'){ const inc = Math.round((h.up.bar?1:0.5) * (10+visitors*1.5) * (0.5+(s100(w.tech.bar)+s100(w.stats.charm))/200) * jb(w,'bartender') * (S.flags.ironsong?1.15:1) * ob(w,'bartender') * ((h.bonus&&h.bonus.bar)||1) * om); hr.income+=inc; R.led.bar+=inc; pr.earned+=inc; grow(w,'bar',2); statXP(w,'charm',1.5); countUp(w,'bar',Math.max(1,Math.round(visitors/8))); }
    if(j==='dancer'){
      const tips = Math.round(visitors * J.tipsBase * (0.5 + w.popularity/100) * (0.5 + s100(w.stats.charm)/100) * Math.sqrt(P.mult) * ob(w,'dancer'));
      const inc = Math.round((12+w.popularity*0.8) * (0.5+s100(w.tech.dance)/100) * Math.sqrt(P.mult) * jb(w,'dancer') * ob(w,'dancer')) + tips;
      hr.income+=inc; R.led.dance+=inc; pr.earned+=inc; w.popularity=clamp(w.popularity+2); repAdd(h, J.danceRep * (0.5 + w.popularity/100)); lewdUp(w, 0.5*(has(w,'Exhibitionist')?3:1), has(w,'Exhibitionist') ? BAL.lewd.danceExhib : BAL.lewd.dance); grow(w,'dance',2); statXP(w,'agility',1.5); statXP(w,'beauty',1); countUp(w,'dance',Math.max(1,Math.round(visitors/8))); }
    if(j==='bath'){
      const inc = Math.round((8+visitors*1.2) * (0.5+(s100(w.tech.service)+s100(w.stats.beauty))/200) * jb(w,'bath') * ob(w,'bath')); hr.income+=inc; R.led.bath+=inc; pr.earned+=inc; grow(w,'service',1.5); lewdUp(w, 0.5, BAL.lewd.bath); statXP(w,'stamina',1); statXP(w,'charm',1);
      // always offers bathers a massage (no room needed); comfortable enough, she joins them in the water, and may offer more there
      const M = actById('massage_give'), nb = Math.min(J.bathCap, Math.round(bathers / Math.max(1, baths.length)));
      const joins = M && clientStance(w, M.id)==='yes' && w.lewd >= J.bathJoinLewd;
      if(M && !actBanned(w, M.id)) for(let k=0;k<nb;k++){
        if(w.energy - actCost(w, M.id) < maxEnergy(w)*0.15) break;
        const cls = pickClass(h), tech = clientTech(cls,null), fee = Math.round(M.price * P.mult * (0.6+qualityOf(w, M.id)*0.9) * cls.mult * fxMul(w,'clientFee') * BAL.income.escort * (joins ? J.bathJoinFee : 1));
        hr.income += fee; R.led.bath += fee; pr.earned += fee; w.energy -= actCost(w, M.id); pr.acts[M.id] = (pr.acts[M.id]||0)+1; growAct(w, M.id, 0.4);
        serveAct(w, M, {tech, reluct:false, pr, h});
        if(joins){ pr.bathJoin = (pr.bathJoin||0)+1; askMore(X, w, M, {tech, inc:fee, led:'bath', noRoom:true}); }
      }
    }
    if(j==='maid'){ const add = (TY.maidBase + s100(w.tech.service)*TY.maidPerSkill) * ob(w,'maid') * jb(w,'maid') * fxMul(w,'tidy') * om; maidAdd += add; pr.tidied = add; grow(w,'service',1.5); statXP(w,'stamina',1.5); }
    if(j==='security'){ grow(w,'combat',1.5); w.trust = clamp(w.trust+0.3); statXP(w,'strength',1.5); }
    if(j==='madame'){ grow(w,'manage',2); statXP(w,'refinement',1.5); }
    if(j==='promoter'){ grow(w,'service',2); statXP(w,'charm',1.5); }
    if(j==='attendant'){ grow(w,'service',1.5); statXP(w,'charm',1); statXP(w,'refinement',1); }
    if(j==='courtesan' && pr.served) statXP(w,'stamina', Math.min(3, pr.served*0.4));
    if(j==='courtesan' && mad) madameCoach(mad, w, pr);
    if(j==='courtesan' && ownAtt.has(w.id)){ moodAdd(w, J.attendantOwnMood); gainTrust(w, J.attendantOwnTrust); pr.why.push({t:'has her own attendant', good:true}); }
    if(JOBS[j].cat==='staff') w.energy -= JOBS[j].energy;
    if(pr.stepIn) (pr.notes = pr.notes||[]).push(flavor('stepped_in', w));
    if(pr.expectMiss) (pr.notes = pr.notes||[]).push(flavor('expect_miss', w));
    if(JOBS[j].cat!=='escort' || !pr.served){ const t = flavor(j==='promoter' && pr.samples ? 'job_promoter_samples' : j==='bath' && pr.bathJoin ? (pr.moreN ? 'job_bath_more' : 'job_bath_joined') : j==='rest' && w.race==='demon' ? 'job_rest_demon' : 'job_'+j, w); if(t) R.hl.push({wid:w.id, text:t, act:null, scene:'job_'+j, noAi:true, job:true}); }
  });
  // --- tidiness: room services and visitors make a mess, maids clean it up
  if(W.length){ h.tidy = clamp(hr.tidy0 - TY.perService*hr.roomsUsed - TY.perVisitor*visitors + maidAdd); hr.tidy = h.tidy; hr.maidAdd = maidAdd; }
  const rowdyF = X.rowdyN ? clamp(X.rowdySum / X.rowdyN / 0.07, 0.5, 2) : 1;
  if(W.length && Math.random() < clamp((0.12 + demand/120 - secPow/250) * (HD.trouble||1) * rowdyF * (1 + barN*J.barRowdy), 0.03, 0.6)) EVQ.push(()=>evIncident(h));
  if(HD.haunted && Math.random()<0.15) EVQ.push(()=>evHaunt(h));
  let up = HD.upkeep + 12*h.rooms + 6*(h.quarters||0) + h.tier*20 + (h.beds||0)*4*bedsFor(h) + (h.extraBeds||0)*3 + (h.annex?30:0) + Object.keys(h.up).filter(k=>h.up[k] && !HD.up[k]).reduce((a,k)=>a+(UPGRADES[k].upkeep||0), 0);
  if(S.samWeek.books) up = Math.round(up * (1 - (0.1 + S.sam.business*0.003)));
  up = Math.round(up * ((h.bonus&&h.bonus.upkeep)||1) * (1 + h.rep/150));
  hr.upkeep = up;
  if(h.bonus && h.bonus.charter){ hr.income += h.bonus.charter; R.led.bar += h.bonus.charter; }
  // travelers' room & board (economy.json → houses.<id>.lodging), grows with reputation
  if(HD.lodging){ const l = Math.round(HD.lodging * (1 + h.rep/50)); hr.income += l; R.led.bar += l; }
  const avg = hr.served ? hr.sat/hr.served : 50;
  // reputation: each lady's clients move it by (sat-50)/12 per client share, scaled by her rep fx. Gains are slower in a famous house.
  if(W.length){
    const tot = Math.max(1, hr.served);
    const part = W.reduce((a,w)=>{ const pr = R.per[w.id]; return a + (pr.served ? (pr.satSum - 50*pr.served)/tot/12 * fxMul(w,'rep') : 0); }, 0);
    repAdd(h, part); if(hr.turned>3) h.rep = clamp(h.rep - 0.5);
    if(X.expectMiss) h.rep = clamp(h.rep + X.expectMiss * BP.expectSat / 12 / tot);
    if(hr.tidyFx) repAdd(h, hr.tidyFx.rep);
    if(h.up.chapel && W.some(x=>x.race==='angel' && x.job!=='rest')) repAdd(h, 0.2);
  }
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
  const R = {v3:true, v5:true, v6:true, week:S.week, lines:[], per:{}, hl:[], houses:[], income:0, wages:0, upkeep:0, recharge:0, served:0, turned:0, selfProps:0,
    led:{escort:0, offduty:0, bar:0, dance:0, bath:0, sam:S.samWeek.income}, samActs:S.samWeek.acts.slice()};
  S.workers.forEach(w=>R.per[w.id]={id:w.id, name:w.name, job:w.job, house:w.house, served:0, comp:0, acts:{}, props:0, acc:0, earned:0, e0:Math.round(w.energy), m0:Math.round(w.mood), l0:Math.round(w.lust||0), enc:[], why:[], notes:[]});
  const log = t => R.lines.push(t);
  let satSum = 0;
  S.houses.forEach(h=>{ const hr = simHouse(h, R); R.houses.push(hr); R.income += hr.income; R.upkeep += hr.upkeep; R.served += hr.served; R.turned += hr.turned; satSum += hr.sat; });
  R.wages = S.workers.reduce((a,w)=>a+(isFree(w)?0:w.wage), 0);
  S.gold += R.income - R.wages - R.upkeep;

  const leaving = [], renew = [];
  S.workers.forEach(w=>{
    const pr = R.per[w.id], h = houseOf(w), hrw = R.houses.find(x=>x.id===w.house), tfx = hrw && hrw.tidyFx;
    const mad = S.workers.find(x=>x.house===w.house && x.job==='madame');
    // Sleep: bed quality x how much of the week she had to herself. No recovery while working.
    const mx = maxEnergy(w), spent = Math.max(0, pr.e0 - w.energy), freeFrac = clamp(1 - spent/mx, 0.1, 1, );
    let rest = (w._bed ?? BEDS[h.beds||0].rest);
    rest *= restMult(w) * (tfx ? tfx.rec : 1);
    let rec = w.job==='rest' ? rest*1.6 + (h.up.bath?10:0) : rest*(0.75 + 0.25*freeFrac);
    if(w.race==='spirit') rec = w.job==='rest' ? 55 : 30;
    if(w.race==='demon') rec = w.job==='rest' ? rec*0.35 : -SVC.demon.hunger;   // demons get nothing from sleep and burn energy every working week: they feed on desire instead (serveAct); on a week off, on men in town
    if(w.race==='demon' && w.job==='rest' && restless(w) && Math.random() < SVC.demon.restDrainChance){   // a restless one can overdo it, and the town notices
      S.rep = clamp(S.rep - SVC.demon.restRepDrain); pr.drains = (pr.drains||0)+1; (pr.notes = pr.notes||[]).push(flavor('rest_demon_drain', w));
      log(`😈 ${w.name} fed a little too hard on her week off. Talk around town is not kind (reputation −${SVC.demon.restRepDrain}).`); }
    const e0 = w.energy;
    if(w.race==='android' && w.job==='rest') rec = Math.max(rec, maxEnergy(w) - w.energy);   // resting androids charge to full
    w.energy += rec; pr.slept = w._bed===FLOOR_REST ? 'floor' : w.race==='spirit' ? 'spirit' : w.race==='android' ? 'charging' : w.race==='demon' ? 'none' : BEDS[h.beds||0].label;
    if(w.race==='android'){ const got = Math.max(0, Math.min(w.energy, energyCap(w)) - e0), A = SVC.android;
      if(got > 0){ const fee = Math.round((A.fee + A.perEnergy*got) * (h.up.charger ? 1 - A.chargerDiscount : 1)); S.gold -= fee; R.recharge += fee; pr.recharge = fee; } }
    const why = (t, good) => pr.why.push({t, good});
    if(w.job!=='rest'){ countUp(w,'weeksWorked'); countUp(w,'jobWeeks.'+w.job); }
    if(pr.favN) why('got to do her favorite', true);
    if(pr.eagerN) why('was in the mood for her clients', true);
    if(pr.disN) why('had to do things she dislikes', false);
    if(pr.reluct) why('did a few things as a favor', false);
    if(w.job==='rest'){ moodAdd(w, 8); w.health += 15; why('a week off', true); }
    w.health = clamp(w.health+5);
    if(w._bed===FLOOR_REST && w.race!=='spirit'){ moodAdd(w, -3); why('slept on the floor', false); }
    else if(housingShort(h) && !['spirit','android','demon'].includes(w.race)){ moodAdd(w, -BAL.quarters.moodPer*housingShort(h)); why('expects better quarters in a house this famous', false); }
    w.mood += (BAL.mood.restingPoint + fxAdd(w,'moodRest') + (has(w,'Loyal')?5:0) + (has(w,'Devoted')?10:0) - w.mood) * BAL.mood.drift * fxMul(w,'moodDrift');
    const work = pr.served + pr.acc - pr.comp*0.4, over = work - BAL.mood.overworkAt;
    if(over>0){ moodAdd(w, -over*(has(w,'Lazy')?5:2.5)); why(over>3 ? 'badly overworked' : 'a bit overworked', false); }
    if(!isFree(w) && w.wage < wageFor(w)*0.9){ moodAdd(w, -4); why('feels underpaid', false); }
    if(jobLikes(w).includes(w.job)){ moodAdd(w, 3); why('likes her job', true); } else if(jobDislikes(w).includes(w.job)){ moodAdd(w, -3); why("doesn't like her job", false); }
    if(mad && w!==mad) moodAdd(w, 3);
    if(tfx){ moodAdd(w, tfx.mood); why(tfx.mood > 0 ? 'a spotless house' : 'a grubby house', tfx.mood > 0); }
    if(pr.accProp && !(JOBS[w.job]||{}).must) why(`propositions took ${Math.round((1-outputMult(w,pr))*100)}% of her work time`, false);
    if(pr.noRoom) why('no free room for a client', false);
    if(pr.offMood) why('worked while not in the mood', false);
    if(h.up.bath) moodAdd(w, 3);
    Object.keys(h.up).forEach(k=>{ const u = UPGRADES[k]; if(h.up[k] && u && u.race===w.race && u.mood) moodAdd(w, u.mood); });   // race houses (tether, chapel, grove, den)
    if(hasPast('cook')) moodAdd(w, 2);
    const o = getOutfit(w); if(o.style===w.style){ moodAdd(w, 3); why('loves her outfit', true); }
    if(usesColor(o) && w.outColor===w.favColor) moodAdd(w, 2);
    if(w.under!=='none' && usesColor(getUnder(w)) && w.underColor===w.favColor) moodAdd(w, 1);
    if(has(w,'Greedy') && pr.earned>250){ moodAdd(w, 4); why('made good money', true); }
    if(w.energy <= 5 && w.race!=='demon'){ w.health -= 15; moodAdd(w, -10); why('exhausted', false); log(`⚠️ ${w.name} is exhausted. Give her some rest.`); }
    w.energy = clamp(w.energy, 0, energyCap(w)); w.mood = clamp(w.mood); w.health = clamp(w.health);
    if(w.race==='demon' && w.energy <= 5 && w.job!=='rest') log(`${w.name} is running on fumes. She needs clients to feed on, or time off.`);
    if(has(w,'Devoted')) w.mood = Math.max(w.mood, 45);
    if(w.mood>65) w.trust += 0.5 * fxMul(w,'trustGain');
    if(w.mood<30 && !has(w,'Loyal') && !isFree(w)) w.trust -= 2;
    w.trust = clamp(w.trust); capTrust(w);
    if(w.health<30 && w.job!=='rest'){ w.job='rest'; log(`🤒 ${w.name} is unwell and will rest next week.`); }
    if(w.job!=='rest' && w.trust < jobTrust(w,w.job) - 5){ log(`${w.name} doesn't trust Sam enough to keep working as ${JOBS[w.job].label} and stepped down.`); w.job='rest'; delete w.prevJob; }
    const dropped = w.menu.filter(a=>!canClient(w,a));
    if(dropped.length){ w.menu = w.menu.filter(a=>canClient(w,a)); log(`${w.name} took ${dropped.map(actLabel).join(', ')} off her menu for now.`); }
    if(w.job==='courtesan' && !getActs().some(a=>canClient(w,a.id))){ w.job = safeJob(w, 'attendant'); log(`${w.name} isn't comfortable offering services right now and moved to ${(JOBS[w.job]||{label:'rest'}).label} work.`); }
    if(!wardrobeOK(w,w.outfit)){ w.outfit = ownedOutfits(w).find(k=>wardrobeOK(w,k)) || w.outfit; log(`${w.name} changed into something she's more comfortable in.`); }
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
      if(kind){ moodAdd(w, kind==='good' ? (P.goodNight??3) : (P.badNight??-3)); pr.night = kind; why(kind==='good' ? 'her clients loved her' : 'difficult clients', kind==='good');
        if(Math.random()<0.6) R.hl.push({wid:w.id, text:flavor(kind+'_night', w), act:null, scene:'casual'}); }
    }
    // lust builds up, and is spent by services and time with Sam
    // (services and Sam's time already spent it as they happened; see spendLust)
    w.lust = w.lust + lustProfile(w).build; fitLust(w);
    if(w._samTime) why('spent time with Sam', true);
    if(has(w,'Devoted') && !w._samTime && restless(w)){ why('missed Sam', false); moodAdd(w, -BAL.lovers.missedMood); pr.missed = true; }
    if(has(w,'Devoted')) w.neglect = w._samTime ? 0 : (w.neglect||0) + 1;   // weeks in a row without Sam
    w._samTime = 0; pr.lust = Math.round(w.lust);
    pr.e1 = Math.round(w.energy); pr.m1 = Math.round(w.mood);
    w.earnedLast = pr.earned;
    if(w.mood<15 && !has(w,'Loyal') && !isFree(w) && !w.locked && !has(w,'Devoted')){ w.unhappy=(w.unhappy||0)+1; if(w.unhappy>=2) leaving.push(w); else log(`😠 ${w.name} is miserable. If nothing changes, she'll leave.`); }
    else w.unhappy = 0;
    if(!isFree(w) && !w.locked){ w.contract--; if(w.contract<=0 && !leaving.includes(w)) renew.push(w); }
    const enc = pr.enc.slice().sort(()=>Math.random()-0.5).sort((a,b)=>(b.act?2:b.want?0:1)+(b.reg?2:0)-(a.act?2:a.want?0:1)-(a.reg?2:0));
    enc.slice(0,2).forEach(e=>R.hl.push({wid:w.id, text:hlText(w,e) + (e.note ? ' ' + ENC_NOTE(e.note) : ''), act:e.act||null, cls:e.cls, note:e.note||null, scene: e.act ? 'act:'+e.act+'~'+(e.expr||'')+'~'+(e.ctx||'') : e.where ? 'job_'+e.where : 'companion'}));
    delete pr.enc;
    earnCheck(w).forEach(t=>{ log(`✨ ${w.name} has developed a knack: ${t}. ${TRAITS[t].desc}`); addLog(`${w.name} developed the trait ${t}.`); });
    // romance arcs
    if(ARCS[w.key] && (w.arc||0) < ARCS[w.key].length && !houseGate(w)){
      const i = w.arc||0, A = BAL.arcs, need = A.need[i], gap = A.gap[i];
      const extra = i===2 ? ((w.dates||0)>=A.dates[2] || (w.privateCount||0)>=1) : i===4 ? (w.dates||0)>=A.dates[4] : i===5 ? (w.privateCount||0)>=A.private[5] : true;
      if(w.trust>=need && S.week-(w.arcWk||0) >= gap && extra){ const at = i; EVQ.push(()=> (w.arc||0)===at ? evArc(w) : null); }
    }
  });
  leaving.forEach(w=>{ S.workers = S.workers.filter(x=>x!==w); log(`🚪 ${w.name} packed her things and left.`); addLog(`${w.name} quit.`); });

  (R.houses||[]).forEach(hr=>{
    if(hr.short) log(`🚪 ${flavor('rooms_short', null, {house:hr.name})} (${hr.short} client${hr.short>1?'s':''} turned away; ${hr.roomsUsed}/${hr.roomCap} room sessions used.)`);
    const T = BAL.tidy, tk = hr.tidy >= T.high ? 'high' : hr.tidy < T.bad ? 'bad' : hr.tidy < T.low ? 'low' : null;
    if(tk) log(`${tk==='high'?'✨':'🧹'} ${flavor('tidy_'+tk, null, {house:hr.name})} (tidiness ${Math.round(hr.tidy)})`);
    const pu = hr.pushy; if(pu && pu.total) log(`⚠️ ${hr.name}: ${pu.total} pushy client${pu.total>1?'s':''}. ${[pu.security&&`security walked ${pu.security} out`, pu.sam&&`Sam stepped in ${pu.sam}×`, pu.samfail&&`Sam's attempt went badly ${pu.samfail}×`, pu.samcall&&`security needed Sam ${pu.samcall}× (your call)`, pu.none&&`nobody was there ${pu.none}×`].filter(Boolean).join(', ')}.`);
  });
  { const calls = (R.houses||[]).flatMap(hr=>hr.calls||[]); if(calls.length) EVQ.unshift(()=>pushyEvent(calls)); }
  (R.houses||[]).forEach(hr=>{ if(hr.floor && hr.floor.length) log(`🛏️ ${hr.name} is short on beds: ${hr.floor.join(', ')} slept on the floor. Build staff quarters or add staff beds.`); });
  R.avgSat = R.served ? satSum/R.served : 50;
  const avgRep = S.houses.reduce((a,h)=>a+h.rep,0)/S.houses.length, maxRep = Math.max(...S.houses.map(h=>h.rep));
  S.rep = clamp(S.rep + ((maxRep*0.6 + avgRep*0.4) - S.rep)*0.35 + S.houses.length*0.1);
  R.rep = S.rep;

  S.houses.forEach(h=>{
    const st = STORIES[h.id]; if(!st || !h.story || h.story.beat>=st.beats.length) return;
    const need = STORY_REP[h.story.beat]||0, gap = storyGap(h);
    if(S.week - Math.max(h.since||1, h.story.wk||0) >= gap && h.rep>=need){ const b = h.story.beat; EVQ.push(()=>{ if(h.story.beat!==b) return null; const ev = st.beats[b](h); if(ev) ev.title = `${st.title} (${b+1}/${st.beats.length})`; return ev; }); }
  });
  seedBonds(); driftBonds();
  queueEncounters();
  renew.forEach(w=>EVQ.push(()=>evRenew(w)));
  if(Math.random()<0.6){ const ev = pickRandomEvent(); if(ev) EVQ.push(ev); }
  if(S.flags.poachCD>0) S.flags.poachCD--;

  if(debtWeek()%BAL.debt.every===0){
    const nd = nextDue();
    if(nd.amount>0){
      if(S.gold >= nd.amount){
        S.gold -= nd.amount; S.debt.remaining -= nd.amount; S.debt.carry = 0;
        log(`📜 Paid ${fmt(nd.amount)} to the Vane Credit House. Remaining: ${fmt(S.debt.remaining)}.`);
      } else {
        S.debt.strikes++; const pen = Math.round(nd.amount*BAL.debt.penalty);
        S.debt.carry = Math.min(S.debt.remaining + pen, nd.amount + pen); S.debt.remaining += pen;
        log(`❌ Missed a debt payment! Strike ${S.debt.strikes}/${BAL.debt.strikes}. A ${fmt(pen)} penalty was added.`);
        EVQ.push(evStrike);
      }
    }
  }
  if(R.income - R.wages - R.upkeep > 0) samGainXP(Math.min(30, Math.round((R.income - R.wages - R.upkeep)/60)));
  S.week++; S.ap = apMax(); S.sam.energy = Math.min(100, S.sam.energy + 40 + (hasPast('gym')?20:0));
  S.samWeek = {security:0, books:false, income:0, acts:[]};
  refreshCandidates();
  checkUnlocks(false, R.lines);
  S.lastReport = R;
  addLog(`Week ${R.week}: income ${fmt(R.income)}, wages ${fmt(R.wages)}, upkeep ${fmt(R.upkeep)}${R.recharge?`, recharging ${fmt(R.recharge)}`:''}.`);
  save(); render();
  showReport(R, true);
}
function showReport(R, fromWeek){
  if(!R) return;
  const net = R.income - R.wages - R.upkeep - (R.recharge||0);
  const L = R.led;
  const ledger = [['Escort fees',L.escort],['Propositions',L.offduty],['Bar',L.bar],['Stage',L.dance],['Bathhouse',L.bath]].filter(x=>x[1]).map(([k,v])=>`<tr><td>${k}</td><td class="good">+${fmt(v)}</td></tr>`).join('')
    + `<tr><td>Wages</td><td class="warn">−${fmt(R.wages)}</td></tr><tr><td>Upkeep</td><td class="warn">−${fmt(R.upkeep)}</td></tr>` + (R.recharge ? `<tr><td>Recharging</td><td class="warn">−${fmt(R.recharge)}</td></tr>` : '')
    + (L.sam?`<tr><td class="muted">Sam's bar shifts (already in your purse)</td><td class="good">+${fmt(L.sam)}</td></tr>`:'')
    + `<tr><th>Net</th><th class="${net>=0?'good':'warn'}">${fmt(net)}</th></tr>`;
  const houseRows = (R.houses||[]).map(h=>`<tr><td>${esc(h.name)}</td><td>${h.served}${h.turned?` <span class="warn">(+${h.turned} turned away)</span>`:''}</td><td>${fmt(h.income)}</td><td>${fmt(h.upkeep)}</td><td>${Math.round(h.avgSat)}</td><td>${Math.round(h.rep)}</td></tr>`).join('');
  const houseExtra = (R.houses||[]).filter(h=>h.roomCap!==undefined).map(h=>{ const pu = h.pushy||{};
    return `<div class="muted"><b>${esc(h.name)}</b>: rooms ${h.roomsUsed}/${h.roomCap}${h.short?` <span class="warn">(short on rooms)</span>`:''} · tidiness ${Math.round(h.tidy0)}→<b class="${h.tidy>=BAL.tidy.high?'good':h.tidy<BAL.tidy.low?'warn':''}">${Math.round(h.tidy)}</b>${h.promoDraw?` · promoter draw +${Math.round(h.promoDraw)}`:''}${h.stepIn?` · stepped in for ${h.stepIn}`:''}${h.selfProps?` · restless ladies made ${h.selfProps} proposition${h.selfProps>1?'s':''} themselves`:''}${pu.total?` · pushy clients ${pu.total}: <span class="good">${(pu.security||0)+(pu.sam||0)} handled</span>${(pu.samfail||0)+(pu.none||0)?`, <span class="warn">${(pu.samfail||0)+(pu.none||0)} went badly</span>`:''}`:''}</div>`; }).join('');
  const blocks = (R.houses||[]).map(hh=>{
    const ps = Object.values(R.per).filter(p=>p.house===hh.id);
    if(!ps.length) return '';
    return `<h3 style="margin-top:12px">${esc(hh.name)}</h3>` + ps.map(p=>{
      const w = findAny(p.id) || {id:p.id, name:p.name};
      const svc = Object.entries(p.acts).map(([id,n])=>`<span class="tag act">${esc(actLabel(id))} ×${n}</span>`).join('') + (p.comp?`<span class="tag">Company ×${p.comp}</span>`:'') + (p.draw?`<span class="tag">Draw +${Math.round(p.draw)} clients${p.samples?' (samples)':''}</span>`:'') + (p.tidied?`<span class="tag">Tidied +${Math.round(p.tidied)}</span>`:'') + (p.stepIn?`<span class="tag">Stepped in ×${p.stepIn}</span>`:'') + (p.pushy?`<span class="tag">Pushy clients ×${p.pushy}</span>`:'');
      const hls = R.hl.map((h,i)=>({h,i})).filter(x=>x.h.wid===p.id).map(({h,i})=>`<div class="hl">${esc(h.text)} ${findAny(p.id)?`<button class="sm" id="hl${i}_t" onclick="toggleImgBtn('hl${i}','${p.id}','${h.scene}')">🖼 Show image</button>`:''}<div id="hl${i}" class="hlimg" data-ext="1"></div></div>`).join('')
        ;
      return `<div class="rep-w"><div class="head">${w.design?avatarHTML(w):''}<div><b>${esc(p.name)}</b> · ${JOBS[p.job]?JOBS[p.job].label:p.job}${p.earned?` · earned <b>${fmt(p.earned)}</b>`:''}
        <div class="muted">${p.served?`${p.served} client${p.served>1?'s':''} · `:''}${p.props?`propositioned ${p.props}× · accepted ${p.acc} · `:''}${p.reluct?`<span class="pink">${p.reluct} as a favor</span> · `:''}${p.notMood?`<span class="warn">not in the mood ×${p.notMood}</span> · `:''}${p.noRoom?`<span class="warn">no room ×${p.noRoom}</span> · `:''}Energy ${p.e0}→${p.e1} · Mood ${p.m0}→${p.m1}${p.why&&p.why.length?` <span class="muted">(${p.why.map(x=>`<span class="${x.good?'good':'warn'}">${esc(x.t)}</span>`).join(', ')})</span>`:''}${p.slept?` · slept: ${p.slept}`:''}${p.solo?' · <span class="pink">a night to herself</span>':''}${p.missed?' · <span class="warn">missed Sam</span>':''}${p.night==='good'?' · <span class="good">great week</span>':p.night==='bad'?' · <span class="warn">rough week</span>':''}${p.lust!==undefined?` · lust ${p.l0!==undefined?p.l0+'→':''}${p.lust}`:''}</div>
        <div>${svc}</div>${(p.notes||[]).map(n=>`<div class="muted">${esc(n)}</div>`).join('')}</div></div>${hls}</div>`;
    }).join('');
  }).join('');
  modal(`<h2>Week ${R.week} Report</h2>
    <div class="grid2"><div>Clients served: <b>${R.served}</b>${R.turned?` <span class="warn">(${R.turned} turned away; more staff or rooms needed)</span>`:''}</div>
      <div>Avg. satisfaction: <b>${Math.round(R.avgSat)}</b> · Renown: <b>${Math.round(R.rep)}</b></div></div>
    <div class="grid2"><div><h3 style="margin-top:10px">Ledger</h3><table>${ledger}</table></div>
      <div><h3 style="margin-top:10px">Houses</h3><table><tr><th>House</th><th>Clients</th><th>Income</th><th>Upkeep</th><th>Sat.</th><th>Rep</th></tr>${houseRows}</table></div></div>
    ${houseExtra?`<div style="margin-top:6px">${houseExtra}</div>`:''}
    ${R.samActs&&R.samActs.length?`<h3 style="margin-top:10px">Sam's week</h3><div class="muted">${R.samActs.map(esc).join(' · ')}</div>`:''}
    ${R.lines.length?`<h3 style="margin-top:10px">Notes</h3>${R.lines.map(l=>`<div>${esc(l)}</div>`).join('')}`:''}
    ${blocks || '<p class="muted">Nobody worked this week.</p>'}
    <div class="row" style="margin-top:12px"><button class="primary" onclick="closeModal();${fromWeek?'runQueue()':''}">Continue</button></div>`, {lock:!!fromWeek, wide:true});
}
