'use strict';
/* =====================================================================
   CLIENT SELECTION, SERVICES, ESCALATIONS & PROPOSITION HANDLING
   ===================================================================== */
function pickClass(h, screen=0){
  const p = h.price, cw = HOUSES[h.id].cls, WT = (BAL.clients && BAL.clients.wait) || {}, pr = housePrestige(h);
  const ws = [
    Math.max(3, 55 - 8*p - pr*0.35) * (screen > 0 ? Math.max(0.5, 1 - screen * (WT.screenTrimLow ?? 0.25)) : 1),
    30 + guildDraw() + Math.max(0, 45 - pr)*0.2,
    (10 + 4*p + pr*0.25) * (screen > 0 ? 1 + screen * (WT.screenMerchant ?? 0.3) : 1),
    (Math.max(1, 2 + 4*p + Math.max(0, pr - 20)*0.45) * (hasGuildPerk('silvertongue') ? 1.1 : 1)) * (screen > 0 ? 1 + screen * (WT.screenNoble ?? 0.55) : 1)
  ];
  // pick a tier (economy.json → tiers, same order as the houses' cls weights), then a class within it by `share`
  const tier = weighted(TIERS, (t,i)=>ws[i]*cw[i]*(t==='merchant'&&h.bonus&&h.bonus.merchant||1));
  return weighted(CLASSES.filter(c=>c.tier===tier), c=>c.share ?? 1);
}
const SVC = BAL.svc;
// How the report phrases a service (services.json → ask): what HE asks for ("asked for oral") vs what SHE does when she's the one offering ("she offered to go down on him").
const askClient = id => { const a = actById(id); return (a && a.ask && a.ask.client) || 'for ' + actLabel(id).toLowerCase(); };
const askLady = id => { const a = actById(id); return (a && a.ask && a.ask.lady) || 'offered ' + actLabel(id).toLowerCase(); };
// Pilgrims and clerics fill the chapel: visitors x (1 + sum of (their share of this week's courtesan clients) x (visitorClass - 1)).
function chapelClassMul(X, C){
  const vc = C.visitorClass; if(!vc || !X.clsTot) return 1;
  return 1 + Object.keys(vc).reduce((a, k) => a + (X.clsN[k]||0) / X.clsTot * (vc[k] - 1), 0);
}
const cStamina = (cls, client) => clamp(((cls && cls.stamina) ?? 1) * cMul(client, 'stamina'), 0.25, 2.2);
function pickWant(cls, w, client, list){
  const acts = (list || getActs()).filter(a=>!w || !actBanned(w, a.id));
  if(!acts.length) return null;
  return weighted(acts, a=>{
    const tierW = cls.tier==='commoner' ? clamp(60/(a.price + 25), 0.72, 1.25) : cls.tier==='noble' ? clamp((a.price + 20)/70, 0.8, 1.35) : 1;
    return cWantMul(client, a) * tierW * (a.want ?? 1) * ((cls.wants||{})[a.id] ?? 1);
  }).id;
}
// The service stat term of quality (services.json → stats): weighted average of her 0-100 stats over the service's `stats`; none listed = charm.
function svcStat(w, act){
  const A = actById(act), st = A && A.stats, ks = st ? Object.keys(st) : [];
  if(!ks.length) return s100(statOf(w,'charm'));
  const tot = ks.reduce((a,k)=>a+st[k],0) || 1;
  return ks.reduce((a,k)=>a + s100(statOf(w,k))*st[k], 0) / tot;
}
function qualityOf(w, act){
  if(!act) return (s100(w.tech.service)*0.5 + s100(statOf(w,'beauty'))*0.25 + s100(statOf(w,'charm'))*0.25)/100;
  return (s100(actSkill(w,act))*0.45 + s100(statOf(w,'beauty'))*0.25 + s100(statOf(w,'charm'))*0.15 + svcStat(w,act)*0.15)/100 * fxSub(w,'actQuality',act);
}
// Convex fee curve from qualityOf (0..1+): novices barely cover costs while veterans and raised stats drive house profit.
function feeQualMult(q){
  const I = BAL.income || {};
  return (I.qualFloor ?? 0.6) + (I.qualSlope ?? 0.9) * Math.pow(Math.max(0, q), I.qualPow ?? 1);
}
// How good this client is at it: 0.3-1.4 around his class's mean (data/economy.json → classes.tech). Regulars keep theirs.
function clientTech(cls, reg, client){
  if(reg && reg.tech !== undefined) return reg.tech;
  const t = clamp((cls.tech ?? 0.85) + (Math.random()+Math.random()-1)*0.55 + cAdd(client,'tech'), SVC.techMin, SVC.techMax);
  if(reg) reg.tech = t;
  return t;
}
// Her expression during a service: bored / professional / into it / lost in it; personality can shift it (personalities.json → expr).
function exprFor(w, act, reluct){
  const k = restless(w) ? 'lost' : (reluct || w.lust < LUST_LOW) ? 'bored' : (w.lust >= LUST_EAGER || isFav(w,act)) ? 'into' : 'professional';
  const m = (PERS[w.personality]||{}).expr;
  return (m && m[k]) || k;
}
// Free samples on the street and a madame/attendant stepping in for swamped courtesans say so before the service.
const SAMPLE_LIGHT = ['kiss','massage_give','manual_give','breast_give','oral_give'];
// Per-encounter bookkeeping for the report: what the client paid (everything she earned for him, encores included) and
// how she came out of it. encSnap before, encFx(w, pr, s0, e) after; writes e.fee and e.d {energy, mood, lust, lewd, pop, skill}.
const encSnap = (w, pr, act) => ({e:w.energy, m:w.mood, l:w.lust||0, lw:w.lewd||0, p:w.popularity||0, g:pr.earned||0});
function encFx(w, pr, s0, e){
  const r1 = v => Math.round(v*10)/10, d = {energy:r1(w.energy - s0.e), mood:r1(w.mood - s0.m), lust:r1((w.lust||0) - s0.l), lewd:r1((w.lewd||0) - s0.lw), pop:r1((w.popularity||0) - s0.p)};
  e.fee = Math.round((pr.earned||0) - s0.g); e.d = Object.fromEntries(Object.entries(d).filter(([,v])=>v)); return e;
}
function hlTextBase(w, e){
  const fem = e.csex==='f', AC = id => fem ? askClientFem(id) : askClient(id), AL = id => fem ? askLadyFem(id) : askLady(id);
  const who0 = e.reg ? `${e.reg}, one of the regulars,` : clientWho(e.cls), N = w.name;
  const who = e.csex && !e.reg ? femClientWho(e.cls, e.csex) : who0;
  const more = e.more ? ` She wanted more afterward and ${AL(e.more)}.` : '';
  const encTxt = e.encore && e.csex==='f' ? ' She wanted another round, and her client was happy to oblige.' : e.encore ? ' ' + flavor(e.encoreKind==='client_unfin' ? 'client_round_unfin' : e.encoreKind==='client_second' ? 'client_round' : 'encore', w) : e.roundDeclined ? ' ' + flavor('round_declined', w) : '';
  if(e.sample) return flavor('sample_act', w, {act: actLabel(e.act).toLowerCase(), lady: AL(e.act)});
  if(e.coveredFor){
    const lead = flavor('covered_for', w, {for: e.coveredFor});
    return `${lead} ${cap(who)} had asked ${AC(e.want)}. ${(actById(e.act)&&actById(e.act).report&&actById(e.act).report.length) ? pick(actById(e.act).report) : ''}${encTxt}${more}`;
  }
  if(e.step){
    const role = e.step==='madame' ? 'the madame' : 'an attendant', lead = flavor('step_lead', w, {role});
    if(!e.want) return `${lead} ${cap(who)} got her company over wine in the lounge instead of a courtesan's.`;
    if(e.act) return `${lead} ${cap(who)} asked ${AC(e.want)}, and ${e.outcome==='alt' ? `she ${AL(e.act)} instead.` : `she saw to it herself.`}${(actById(e.act)&&actById(e.act).report&&actById(e.act).report.length) ? ' ' + pick(actById(e.act).report) : ''}${encTxt}${more}`;
    return `${lead} ${cap(who)} asked ${AC(e.want)}, but that was more than she'd step in for; he settled for her company.`;
  }
  if(e.self) return `${flavor('self_prop', w)}${e.act ? ` She ${AL(e.act)}, and he didn't need asking twice.${encTxt}${more}` : ' This time he politely passed.'}`;
  if(e.bathWork){
    const lead = e.bathFirst ? `${cap(who)} came to the bathhouse for a massage, and things escalated in the steam: she ${AL(e.act)}.` : `${cap(who)} soaked in the bathhouse with ${N}, who ${AL(e.act)}.`;
    return `${lead} ${flavor('client_yes_bath', w)}${encTxt}${more}`;
  }
  if(e.where==='chapel'){   // keepers offer rather than get propositioned (week.js staffProps)
    const where = PROP_WHERE.chapel;
    if(e.act) return `${cap(who)} lingered after prayers ${where}, and ${N} ${askLady(e.act)}. ${flavor('prop_chapel', w)}${encTxt}${more}`;
    return `${cap(who)} lingered after prayers ${where}, hoping for more than a blessing. ${N} gave him only the blessing.`;
  }
  if(e.where){
    const where = PROP_WHERE[e.where];
    if(e.act){
      const how = e.where==='chapel' ? flavor('prop_chapel', w) : e.where==='bath' ? flavor('prop_bath', w) : e.ctx==='exhib' ? flavor('prop_exhib', w) : e.outcome==='alt' ? `She ${AL(e.act)} instead, and he took it.` : 'She thought about it for exactly one second, then took his hand and led him upstairs.';
      return `${cap(who)} propositioned ${N} ${where}, asking ${AC(e.want)}. ${how}${encTxt}${more}`;
    }
    return `${cap(who)} propositioned ${N} ${where}, asking ${AC(e.want)}. She turned him down.`;
  }
  // a solo reverse possession with a client is its own encounter: the possession (plus any follow-up service), not the service he asked for (report.js groups it alone)
  if(e.possess && e.act){
    const asked = AC(e.want || e.act), lead = e.where ? `${cap(who)} propositioned ${N} ${PROP_WHERE[e.where]}, asking ${asked}.` : `${cap(who)} came for ${N} and asked ${asked}.`;
    if(e.csex==='f' && e.mate){   // a woman client rides along inside her while she takes a housemate to bed (possessMate; flavor enc_possess_fem_*)
      const m = findAny(e.mate), mn = m ? m.name : 'a housemate';
      return `${lead} ${flavor('enc_possess_fem_' + e.possess, w, {other: mn})}${encTxt}${more}`;
    }
    return `${lead} ${flavor('enc_possess_' + e.possess, w)}${encTxt}${more}`;
  }
  const extra = [e.adapt && flavor('enc_adapt', w, e.adapt), e.lantern && flavor('enc_lantern_angel', w), e.heat && e.note!=='drained' && e.note!=='frustrated' && flavor('enc_beast_heat', w)].filter(Boolean).join(' ');
  const tail = extra ? ' ' + extra : '';
  if(!e.want) return `${cap(who)} spent the evening with ${N} in the lounge: wine, conversation, and a lot of laughing. ${flavor('client_company', w)}${tail}`;
  if(e.outcome==='yes'){
    const desc = e.csex ? clientPairLine(e.act, N, e.csex) : (e.ctx==='exhib' || e.ctx==='bath') ? flavor('client_yes_' + e.ctx, w) : ((actById(e.act)&&actById(e.act).report&&actById(e.act).report.length) ? pick(actById(e.act).report) : flavor('client_yes', w));
    return `${cap(who)} came for ${N} and asked ${AC(e.act)}. ${desc}${encTxt}${more}${tail}`;
  }
  if(e.outcome==='alt'){
    const altEnd = (e.altDiff||0) >= 2 ? 'and he reluctantly settled for it' : e.altDiff === 0 ? 'and he was happy to take that instead' : 'and he happily took it';
    return `${cap(who)} asked ${N} ${AC(e.want)}. She said no to that, but ${AL(e.act)} instead, ${altEnd}.${encTxt}${more}${tail}`;
  }
  return `${cap(who)} asked ${N} ${AC(e.want)}. She politely declined, and he settled for her company over a bottle of wine.`;
}
// A woman client (clients.women): the same report, her pronouns, and the service told as two women (services.json → pair.fem;
// a futanari client: pair.futa). {name} = the lady, {partner} = her client.
function hlText(w, e){
  const t = hlTextBase(w, e);
  return e.csex ? toHer(t) : t;
}
const toHer = t => String(t).replace(/\b(he|him|his|himself|man|gentleman)\b/gi, m => { const map = {he:'she', him:'her', his:'her', himself:'herself', man:'woman', gentleman:'lady'}, r = map[m.toLowerCase()]; return m[0]===m[0].toUpperCase() ? r[0].toUpperCase() + r.slice(1) : r; });
function clientPairLine(act, name, sex){
  const P = (((actById(act)||{}).pair)||{})[sex==='futa' ? 'futa' : 'fem'] || [];
  if(!P.length) return '';
  const l = pick(P).replace(/\{name\}/g, name).replace(/\{partner\}/g, 'her client');
  return l[0].toUpperCase() + l.slice(1);
}
// people.json → clientsFem by the class's tier; a futanari client is the same woman with 'futanari' in front
function femClientWho(clsId, sex){
  const c = CLASSES.find(x=>x.id===clsId), L = ((needData('people').clientsFem)||{})[c ? c.tier : 'commoner'] || ['a woman'];
  const d = pick(L); return sex==='futa' ? d.replace(/^(an?)\s+/i, 'a futanari ') : d;
}
const askClientFem = id => { const a = actById(id); return (a && a.ask && (a.ask.clientFem || a.ask.client)) || 'for ' + actLabel(id).toLowerCase(); };
const askLadyFem = id => { const a = actById(id); return (a && a.ask && a.ask.ladyFem) || toHer(askLady(id)); };
// One service for one client, from her side: mood, lust (per service, technique, favorites), demon feeding, expression.
// o = {tech, reluct, pr, h}. Returns {note, expr, frustrated, fed, drained}.
// How good it is for HER (her lust drop, whether she's left frustrated). Normally that is his technique. A service she leads
// (services.json selfLed: cowgirl) goes at her pace, so her own skill at it sets a floor; one he leads (techLed: doggy) swings
// harder on his technique, in both directions.
function actTech(w, a, t){
  let tech = t ?? 0.85;
  if(a.techLed) tech = Math.max(0.1, 0.85 + (tech - 0.85) * a.techLed);
  if(a.selfLed) tech = Math.max(tech, 0.6 + 0.6 * s100(actSkill(w, a.id))/100);
  return tech;
}
function serveAct(w, a, o){
  const B = BAL.lust, act = a.id, pr = o.pr, fav = isFav(w,act), dis = isDislike(w,act), reck = restless(w), eager = w.lust >= LUST_EAGER;
  const expr = exprFor(w, act, o.reluct);
  let frustrated = false, fed = 0, drained = false;
  const tech = actTech(w, a, o.tech);
  if(o.reluct){ moodAdd(w, -2); pr.reluct = (pr.reluct||0)+1; }
  if(fav){ moodAdd(w, 1.5); pr.favN = (pr.favN||0)+1; }
  if(dis){ moodAdd(w, -2.5); pr.disN = (pr.disN||0)+1; }
  if(eager && !o.reluct){ moodAdd(w, B.bonus.clientMood); pr.eagerN = (pr.eagerN||0)+1; }
  if(a.lust === undefined) spendLust(w, B.drop.client + (fav ? B.drop.fav : 0));
  else if(a.lust >= 0){   // giving, kissing, massages: with a client it's work, not foreplay. Only an insatiable lady (svcLustBuild fx) gets worked up by it.
    if(fxHas(w,'svcLustBuild')){ w.lust += a.lust * (0.4 + w.lewd/100) * (fav?1.5:1) * (dis?0.6:1) * fxMul(w,'lustBuild'); fitLust(w); }
  } else {
    const k = tech * (fav?1.5:1) * (dis?0.6:1) * fxSub(w,'actQuality',act);
    frustrated = !!a.finish && tech * (w.lust/60) < SVC.frustrateAt;
    if(frustrated){ w.lust += SVC.frustrateLust; fitLust(w); moodAdd(w, -1); pr.frustN = (pr.frustN||0)+1; }
    else spendLust(w, -a.lust * k);
  }
  if(a.energyBack && w.race!=='demon') w.energy += a.energyBack;   // demons only feed on desire
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

/* ---------- jobs, propositions & rough clients (docs/OVERHAUL.md §5-6) ---------- */
// Reputation gains get harder as the house grows: max(gainMin, gainBase - rep/gainDiv). Losses are unchanged.
const repGain = (h, n) => n > 0 ? n * housePerkVal(h, 'repGain', 1) * shrineMult(h, 'perRep') * townMul('rep', 1, h) * Math.max(BAL.rep.gainMin, BAL.rep.gainBase - h.rep/BAL.rep.gainDiv) : n;
function repAdd(h, n){ h.rep = clamp(h.rep + repGain(h, n)); }
// Each accepted proposition costs a non-must lady 8% of her main job's output that week (max 50%); chapel keepers aren't penalized.
// A night ended by an unhandled pushy client costs her 1/nights of the week's output (balance.json → props.nights).
const nightMult = pr => Math.max(0, 1 - (pr.nightsLost||0) / (BAL.props.nights || 6));
function outputMult(w, pr){
  if((JOBS[w.job] && JOBS[w.job].must) || w.job==='chapel') return nightMult(pr);
  return Math.max(1 - BAL.props.maxPenalty, 1 - BAL.props.penalty * (pr.accProp||0)) * nightMult(pr);
}
// Courtesans work out of the mood; everyone else turns heavier services down below lust.low.
const moodFree = w => w.job === 'courtesan';
// Demons feed on finished services (a kiss is a small sip). Received massages don't restore a demon's energy (serveAct). w.feedOnly = null (off) |
// a % of her max energy (below it she only takes services that feed her) | 'always'. Set on her sheet (setFeedOnly).
const demonFeeds = id => { const A = actById(id); return !!A && (!!A.finish || A.kind==='kiss'); };
function feedOnly(w, id){
  if(w.race!=='demon' || !w.feedOnly || demonFeeds(id)) return false;
  return w.feedOnly==='always' || w.energy < maxEnergy(w) * (+w.feedOnly||0) / 100;
}
const nim = (w, id) => feedOnly(w, id) || (!moodFree(w) && notInMood(w, id));
// A demon's hunger works like lust when it comes to propositions: drive = lust + missing energy share x svc.demon.hungerDrive.
// It lowers the bar for her to proposition clients herself and raises her odds of accepting (it doesn't make her reckless).
const demonHunger = w => w.race==='demon' ? clamp(1 - w.energy / maxEnergy(w), 0, 1) * (SVC.demon.hungerDrive ?? 60) : 0;
const propDrive = w => (w.lust||0) + demonHunger(w);
// Energy floor for a service: a demon can always afford one that feeds her (it pays her back).
const energyOK = (w, id, floor) => w.race==='demon' && demonFeeds(id) ? w.energy >= actCost(w, id) : w.energy - actCost(w, id) > maxEnergy(w) * floor;
// Menu used for must-offer staff: her menu, or what she's comfortable with if she never set one.
const offeredMenu = w => w.menu.length ? w.menu : getActs().filter(a=>clientStance(w,a.id)==='yes').map(a=>a.id);
// Would she take this proposition? Returns {kind:'yes'|'alt'|'no', act, why}.
// Propositions are always active and decided by her willingness (lust, mood, traits, and her job's proposition expectations).
// Shared negotiation: pick a fallback service on or below the client's desired price, preferring same-tier sidegrades over steep downgrades.
function negotiateAlt(w, want, okFn, baseChance, client){
  const W = actById(want); if(!W) return null;
  const wt = W.tier || 1;
  const cands = getActs().filter(A => A.id !== want && okFn(A.id) && A.price <= W.price);
  if(!cands.length) return null;
  cands.sort((a,b) => {
    const da = Math.max(0, wt - (a.tier||1)), db = Math.max(0, wt - (b.tier||1));
    if(da !== db) return da - db;
    const fa = isFav(w, a.id) ? 1 : 0, fb = isFav(w, b.id) ? 1 : 0;
    if(fa !== fb) return fb - fa;
    return b.price - a.price;
  });
  const A = cands[0], diff = Math.max(0, wt - (A.tier||1));
  const pen = diff === 0 ? 0.12 : diff === 1 ? -0.12 : -0.35;
  const tPen = diff >= 2 && client && cHas(client,'thirsty') ? -0.1 : 0;
  return Math.random() < clamp(baseChance + pen + tPen, 0.05, 0.95) ? {act:A.id, diff} : null;
}
function propDecide(w, want, X){
  const BP = BAL.props, must = !!(JOBS[w.job] && JOBS[w.job].must), reck = restless(w) && !has(w,'Devoted');
  let chance;
  if(must) chance = 1;
  else {
    const dr = propDrive(w), jb = (BP.jobBonus||{})[w.job] ?? 0, minMood = (BP.jobMood||{})[w.job] ?? 45;
    if(!reck && dr < LUST_EAGER && w.mood < minMood) return {kind:'no', why:'nomood'};
    chance = clamp(BP.acceptBase + jb + (dr - BP.acceptLustMid)/100 + (w.mood - 50)*0.004 + fxAdd(w,'willing')/100 + (dr >= LUST_EAGER ? BP.acceptEager : 0) + (reck ? BP.acceptReckless : 0), 0.02, 0.95);
  }
  if(Math.random() >= chance) return {kind:'no', why:'declined'};
  const menu = must ? offeredMenu(w) : w.menu, ok = id => menu.includes(id) && canClient(w,id) && !nim(w,id) && !tooTiredFor(w,id) && energyOK(w, id, 0.2);
  if(want && ok(want)) return {kind:'yes', act:want};
  if(want && menu.includes(want) && nim(w,want)) return {kind:'no', why:'nomood'};
  const alt = negotiateAlt(w, want, ok, BP.alt);
  if(alt) return {kind:'alt', act:alt.act, diff:alt.diff};
  return {kind:'no', why:'declined'};
}
// Execute an extra round/escalation act cleanly without duplicating fee/energy/room logic.
function execExtraAct(X, w, A, o, id2, feeMult, countKey){
  const B = actById(id2), pr = X.R.per[w.id], ecost = actCost(w, id2);
  if(!B || (!o.noRoom && !X.roomOK(w))) return null;
  const fee2 = o.inc > 0 ? Math.round(o.inc * (B.price / Math.max(1, A.price)) * feeMult) : 0;
  if(fee2){ X.hr.income += fee2; X.R.led[o.led] += fee2; pr.earned += fee2; }
  w.energy -= ecost; if(!o.noRoom) X.useRoom(w);
  pr.acts[id2] = (pr.acts[id2]||0)+1; growAct(w, id2, 0.5); lewdUp(w, 0.25, svcLewdCap(id2,'client'));
  if(countKey) countUp(w, countKey);
  const s2 = serveAct(w, B, {tech:o.tech, reluct:false, pr, h:X.h});
  return {id:id2, drained:s2.drained};
}
// Client proposes a second round or escalation when he didn't finish (unserviced / poor service) or still has stamina for round 2.
function clientProposeRound(X, w, A, o, guyUnfin, poorFinish){
  const SR = SVC.secondRound || {}, stam = cStamina(o.cls, o.client);
  const baseP = guyUnfin ? (poorFinish ? (SR.unfinChance ?? 0.5)*0.85 : (SR.unfinChance ?? 0.5)) : (SR.finChance ?? 0.14);
  if(Math.random() >= clamp(baseP * stam, 0.02, 0.9)) return null;
  if(!o.noRoom && !X.roomOK(w)) return null;
  const menu = offeredMenu(w);
  const okId = id => canClient(w,id) && !nim(w,id) && !tooTiredFor(w,id) && energyOK(w, id, 0.15);
  let pool = menu.filter(id => { const B = actById(id); return B && (!A.finish ? B.finish : true) && okId(id); });
  if(!pool.length) pool = menu.filter(id => id!==A.id && okId(id));
  if(!pool.length) return guyUnfin ? {accepted:false, guyUnfin:true, satAdj: SR.declineSat ?? -6} : null;
  const id2 = (!A.finish && o.cls) ? (pickWant(o.cls, w, o.client, pool.map(actById)) || pick(pool))
    : (pool.includes(A.id) && Math.random()<0.65) ? A.id : pick(pool);
  const eFrac = w.energy / Math.max(1, maxEnergy(w)), lFrac = (w.lust || 0) / 100;
  const highLE = w.lust >= LUST_EAGER && eFrac >= 0.5;
  let acc;
  if(guyUnfin){
    acc = highLE
      ? clamp(0.85 + lFrac*0.1 + fxAdd(w,'willing')/300, 0.8, 0.98)
      : clamp(0.22 + lFrac*0.42 + (eFrac - 0.3)*0.45 + (w.mood - 50)/220 + (isFav(w,id2)?0.15:0) - (isDislike(w,id2)?0.25:0) + fxAdd(w,'willing')/150 - (poorFinish ? (SR.poorPen ?? 0.18) : 0), 0.05, 0.85);
  } else {
    acc = highLE ? 0.95 : clamp(0.45 + lFrac*0.35 + (eFrac - 0.3)*0.4 + (w.mood - 50)/250 + fxAdd(w,'willing')/150, 0.15, 0.95);
  }
  if(o.reluct && guyUnfin && !highLE) acc *= 0.7;
  if(Math.random() >= acc) return guyUnfin ? {accepted:false, guyUnfin:true, satAdj: SR.declineSat ?? -6} : null;
  const ex = execExtraAct(X, w, A, o, id2, SR.fee ?? 0.7, 'encore');
  if(!ex) return null;
  return {accepted:true, guyUnfin, id:ex.id, drained:ex.drained, kind: guyUnfin ? 'client_unfin' : 'client_second', satAdj: SR.acceptSat ?? 6};
}
// One service for one client: growth, energy, room, her side (serveAct), escalations when either didn't finish, and restless encores.
// o = {tech, reluct, inc, ecost, led, client, cls, q, noRoom}.
function runService(X, w, A, o){
  const pr = X.R.per[w.id], act = A.id, stam = cStamina(o.cls, o.client);
  pr.acts[act] = (pr.acts[act]||0)+1; growAct(w, act, 0.7); lewdUp(w, o.reluct?0.6:0.3, svcLewdCap(act,'client'));
  w.energy -= o.ecost; if(!o.noRoom){ X.useRoom(w); if(has(w,'Exhibitionist') && X.hr){ X.hr.exhibActs++; if(X.hr.roomsUsed >= X.hr.roomCap) X.hr.exhibFullActs++; } }
  const reck0 = restless(w), qv = o.q ?? qualityOf(w, act);
  const poorFinish = !!A.finish && qv < (SVC.poorFinishAt ?? 0.42) && Math.random() < 0.75;
  const guyUnfin = !A.finish || poorFinish;
  const ser = serveAct(w, A, {tech:o.tech, reluct:o.reluct, pr, h:X.h});
  let note = ser.note, encore = null, encoreKind = null, roundDeclined = false, satAdj = 0;
  const more = askMore(X, w, A, o, ser);
  if(more && more.drained) note = 'drained';
  if(!more){
    const cr = clientProposeRound(X, w, A, o, guyUnfin, poorFinish);
    if(cr){
      satAdj += cr.satAdj || 0;
      if(cr.accepted){ encore = cr.id; encoreKind = cr.kind; if(cr.drained) note = 'drained'; }
      else if(cr.guyUnfin) roundDeclined = true;
    }
  }
  if(!more && !encore && !roundDeclined && A.finish && reck0 && w.lust >= LUST_EAGER && (o.noRoom || X.roomOK(w)) && Math.random() < (SVC.encoreBase + fxAdd(w,'encore')) * clamp(stam, 0.5, 1.5)){
    const ids = offeredMenu(w).filter(id=>canClient(w,id) && !nim(w,id) && !tooTiredFor(w,id) && energyOK(w,id,0.15));
    if(ids.length){
      const a2id = (ids.includes(act) && Math.random()<0.5) ? act : pick(ids);
      const ex = execExtraAct(X, w, A, o, a2id, SVC.encoreFee, 'encore');
      if(ex){ encore = ex.id; encoreKind = 'lady'; if(ex.drained) note = 'drained'; }
    }
  }
  if(encore) countUp(w, 'encore');   // Encore Favorite (earnable.json)
  if(note === 'drained' && !X.h.up.sigil && X.hr) X.hr.demonDrains++;
  return {ser, note, encore, encoreKind, roundDeclined, reck0, more: more ? more.id : null, satAdj};
}
// Race shift effects: spirit reverse possession (solo_futa with a man or futanari client, plain solo with a woman, or futa x fem housemate) and android per-client appearance adaptation.
function spiritPossess(X, w, client, pr){
  const S0 = SVC.spirit || {};
  if(w.race!=='spirit' || (w.lewd||0) < (S0.possessLewd ?? 35)) return null;
  const fan = cHas(client,'adventurous') || cHas(client,'thrillSeeker') || cHas(client,'exotic');
  const req = client && Math.random() < (S0.possessClientReq ?? 0.16) * (fan ? 1.8 : 1);
  const sug = !req && Math.random() < (S0.possessSuggest ?? 0.24) * (has(w,'Shy') ? 0.35 : (has(w,'Eager') || restless(w)) ? 1.4 : 1);
  if(!req && !sug) return null;
  let react;
  if(req) react = Math.random() < 0.85 ? 'like' : 'ok';
  else {
    const likeC = (S0.possessLike ?? 0.45) * (fan ? 1.45 : 1);
    const freakC = (S0.possessFreak ?? 0.25) * ((cHas(client,'prude')||cHas(client,'shy')) ? 1.8 : fan ? 0.2 : 1);
    const r = Math.random();
    react = r < likeC ? 'like' : r < likeC + freakC ? 'freak' : 'ok';
  }
  // with a woman client there's nothing to borrow: the spirit takes the client inside herself instead, and the client rides
  // along through an ordinary tryst between the spirit and a willing housemate (possessMate). No housemate free: no possession.
  let mate = null;
  if(clientSex(client)==='f'){ mate = possessMate(X, w); if(!mate) return null; }
  else pr.possessed = (pr.possessed||0) + 1;
  lewdUp(w, 0.5, 95);
  const out = react==='like' ? {react, feeMult: S0.possessLikeFee ?? 1.35, satAdd: S0.possessLikeSat ?? 18}
    : react==='freak' ? {react, feeMult: S0.possessFreakFee ?? 0.75, satAdd: S0.possessFreakSat ?? -22}
    : {react, feeMult: S0.possessOkFee ?? 1.1, satAdd: S0.possessOkSat ?? 5};
  return mate ? Object.assign(out, mate) : out;
}
// The housemate for a woman client's reverse possession: an ordinary yuri tryst, asked and paid like a yuri night
// (balance.json → yuri: lewd + clients.women.gap unless Sapphic/Bisexual, lewdGain, bond), at a fraction of its energy and lust
// since it's one client's hour, not a night (svc.spirit.mateShare). Returns {mate, mateAct} or null.
const POSS_MATE_ACTS = ['kiss','manual_give','manual_get','breast_get','breast_give','oral_get','oral_give','missionary','cowgirl','doggy'];
function possessMate(X, w){
  const Y = BAL.yuri || {}, S0 = SVC.spirit || {}, k = S0.mateShare ?? 0.5, need = o => (Y.lewd ?? 40) + orientGap(o, 'f');
  if((w.lewd||0) < need(w)) return null;
  const pool = ((X && X.W) || []).filter(o=>o!==w && !has(o,'Devoted') && !has(o,'Modest') && (o.lewd||0) >= need(o) && o.energy >= maxEnergy(o) * 0.2);
  if(!pool.length) return null;
  const o = weighted(pool, x=>1 + Math.max(0, bondV(w, x)) / (Y.bondWeight ?? 20) + (x.lust||0) / 100);
  const top = Math.min(w.lewd - orientGap(w,'f'), o.lewd - orientGap(o,'f'));
  const acts = POSS_MATE_ACTS.filter(id=>{ const A = actById(id), f = id.replace(/_(give|get)$/, (m,k)=>k==='give'?'_get':'_give'), oAct = actById(f) ? f : id; return A && A.pair && (A.pair.fem||[]).length && (A.th||0) <= top && !actBanned(w,id) && !actBanned(o,oAct); });
  const act = acts.length ? weighted(acts, id=>1 + (actById(id).th||0)/20) : 'kiss';
  o.energy = Math.max(0, o.energy - (Y.energy ?? 12) * k); spendLust(o, (Y.lust ?? 40) * k); moodAdd(o, Y.mood ?? 3);
  lewdUp(o, Y.lewdGain ?? 0.5, Y.lewdCap ?? 90); addBond(w, o, (Y.bond ?? 6) * k);
  return {mate:o.id, mateAct:act};
}
function androidAdapt(w, client, pr){
  const A = SVC.android || {}; if(w.race!=='android') return null;
  const c = cHas(client,'customizer') ? 1 : (cHas(client,'connoisseur')||cHas(client,'romantic')) ? (A.adaptFanChance ?? 0.85) : (A.adaptChance ?? 0.55);
  if(Math.random() >= c) return null;
  const hair = pick(HAIR_COLORS.filter(x=>x!==(w.design&&w.design.hairColor)) || HAIR_COLORS) || 'silver';
  const eyes = pick(EYES.filter(x=>x!==(w.design&&w.design.eyes)) || EYES) || 'amber';
  const bks = Object.keys(bodyOpts('height')), fgs = Object.keys(bodyOpts('figure')), bss = Object.keys(bodyOpts('bust'));
  const body = `${bks.length ? pick(bks) : 'average'}, ${fgs.length ? pick(fgs) : 'curvy'} with a ${bss.length ? pick(bss) : 'full'} chest`;
  if(pr) pr.adapted = (pr.adapted||0) + 1;
  return {adapt: {hair, eyes, body}, feeMult: A.adaptFee ?? 1.18, satAdd: A.adaptSat ?? 10};
}
// A spirit still worked up after a reverse possession with a man or futanari client (pr.possessed), or just worked up, brings
// the borrowed cock to a willing housemate: the futa tryst, lewder than a yuri night (balance.json → svc.spirit.pairLewd,
// pairLewdGain; + pairFutaExtra and pairFutaLewdGain unless she's a Futa Lover; women also need clients.women.gap unless
// Sapphic/Bisexual). A woman client's possession already had its housemate (possessMate).
function spiritPairShift(h, W, R){
  const S0 = SVC.spirit || {}, acts = ['missionary','cowgirl','doggy','oral_give','oral_get','manual_give','manual_get','breast_give','breast_get'];
  W.forEach(w=>{
    const pr = R.per[w.id];
    if(w.race!=='spirit' || pr.solo || pr.yuri || w.job==='rest' || has(w,'Devoted') || has(w,'Modest')) return;
    if((w.lewd||0) < (S0.pairLewd ?? 45) || (!pr.possessed && (w.lust||0) < LUST_EAGER)) return;
    if(Math.random() >= (S0.pairChance ?? 0.4)) return;
    const need = o => (S0.pairLewd ?? 45) + orientGap(o, 'f') + (has(o,'Futa Lover') ? 0 : (S0.pairFutaExtra ?? 10));
    const pool = W.filter(o=>o!==w && !R.per[o.id].solo && !R.per[o.id].yuri && !has(o,'Modest') && !has(o,'Devoted') && (o.lewd||0) >= need(o));
    if(!pool.length) return;
    const o = weighted(pool, x=>1 + Math.max(0, bondV(w, x))/25 + (has(x,'Futa Lover') ? 1 : 0));
    const lim = Math.min(w.lewd||0, o.lewd||0) + 15;
    const choices = acts.filter(id=>{ const A = actById(id); return A && A.pair && A.pair.futa && (A.th||0) <= lim && !actBanned(w,id) && !actBanned(o,id); });
    const act = pick(choices.length ? choices : ['missionary']), A = actById(act);
    w.energy = clamp(w.energy - (S0.pairEnergy ?? 14)*0.5, 0, maxEnergy(w)); o.energy = clamp(o.energy - (S0.pairEnergy ?? 14)*0.5, 0, maxEnergy(o));
    spendLust(w, S0.pairLust ?? 30); spendLust(o, (S0.pairLust ?? 30)*0.7);
    const gain = S0.pairLewdGain ?? 0.8, oGain = has(o,'Futa Lover') ? gain : (S0.pairFutaLewdGain ?? 1.2);
    moodAdd(w, 4); moodAdd(o, 4); lewdUp(w, gain, 95); lewdUp(o, oGain, 95); addBond(w, o, S0.pairBond ?? 10);
    const pLine = A && A.pair && A.pair.futa && A.pair.futa.length ? pick(A.pair.futa).replace(/\{name\}/g, o.name).replace(/\{partner\}/g, w.name) : '';
    const text = [flavor('spirit_pair_futa', w, {other: o.name}), pLine].filter(Boolean).join(' ');
    R.hl.push({wid:w.id, text, act, scene:`pair:${act}:selffuta:${o.id}`, pairFuta:true, spiritFuta:true});
  });
}
// After a service that didn't satisfy her (built lust or left her frustrated), a willing lady may propose escalating to a finishing/lust-spending service.
function askMore(X, w, A, o, ser){
  const M = SVC.askMore, ladyUnfin = (A.lust ?? -1) >= 0 || !!(ser && ser.frustrated);
  if(!M || !ladyUnfin || w.lewd < M.lewd || w.lust < (ser && ser.frustrated ? LUST_LOW : LUST_EAGER)) return null;
  const stam = clamp(cStamina(o.cls, o.client), 0.4, 1.5);
  if(Math.random() >= (M.chance + (ser && ser.frustrated ? 0.2 : 0) + fxAdd(w,'encore')*0.5) * stam) return null;
  if(!o.noRoom && !X.roomOK(w)) return null;
  const ok = id => canClient(w,id) && !nim(w,id) && !tooTiredFor(w,id) && energyOK(w, id, 0.15);
  let ids = offeredMenu(w).filter(id => { const B = actById(id); return B && (B.lust ?? -1) < 0 && ok(id); });
  if(!ids.length) ids = offeredMenu(w).filter(id => { const B = actById(id); return B && B.finish && id!==A.id && ok(id); });
  if(!ids.length) return null;
  const id = pickFav(w, ids) || pick(ids), ex = execExtraAct(X, w, A, o, id, M.fee, 'askedMore');
  if(!ex) return null;
  X.R.per[w.id].moreN = (X.R.per[w.id].moreN||0) + 1;
  return ex;
}
// After she says no, a pushy client may try to force the issue (non-graphic). Security power (house) vs a roll; else Sam, if he is
// around; else nobody. She may first talk him down (wits .6 + charm .4, props.talkDown). Returns 'talked' | 'security' | 'sam' | 'samfail' | 'none' | null (he took no for an answer).
function pushyCheck(X, w, cls, pr, client){
  const BP = BAL.props, chance = clamp(((cls.pushy||0) + (cls.reckless||0)*0.5 + X.barN*BAL.jobs.barReckless + cAdd(client,'pushy',X)) * cMul(client,'pushyMult',X) * incenseMul(w,'pushy') * townMul('pushy', 1, X.h), 0, BP.maxPushy);
  if(Math.random() >= chance) return null;
  const h = X.h, hr = X.hr; let res;
  countUp(w,'rowdy'); pr.pushy = (pr.pushy||0)+1; hr.pushy.total++;
  if(goddessGuard(h)){ res = 'security'; moodAdd(w, 2); }   // the goddess was watching this house (goddess.js)
  else if(Math.random() < (s100(statOf(w,'wits'))*0.6 + s100(statOf(w,'charm'))*0.4)/100 * (BP.talkDown ?? 0.35)){ res = 'talked'; moodAdd(w, BP.talkMood ?? -2); }
  else if(X.secPow > rnd(BP.securityRoll[0], BP.securityRoll[1])){ res = 'security'; moodAdd(w, BP.secMood); }
  // security couldn't handle it and Sam is around: someone runs to fetch him, and he steps in there and then
  else if(S.sam.energy >= BP.samEnergyMin) res = samRescue(w, h);
  else { res = 'none'; moodAdd(w, -BP.noneMood); h.rep = clamp(h.rep - BP.noneRep); }
  if(res==='security' || res==='sam') countUp(w,'rescued');
  if(res==='none' || res==='samfail') endNight(X, w, pr);   // nobody stopped him: she's done for the night
  hr.pushy[res]++; (pr.notes = pr.notes||[]).push(flavor('pushy_'+res, w));
  return res;
}
// Her night is over: no more clients tonight (escorts), 1/nights off her job's output (outputMult), a little Health, and she
// skips the rest of tonight's offers.
function endNight(X, w, pr){
  pr.nightsLost = (pr.nightsLost||0) + 1; X.hr.nightsLost = (X.hr.nightsLost||0) + 1;
  pr.nightOver = true;   // no more clients or offers for her tonight (simHouse's night loop)
  w.health = clamp(w.health - (BAL.props.nightHealth ?? 4));   // it shook her up
}
// Sam answers a call for help (Strength + Charm/2 + roll vs props.samCheck; standing watch this week helps at his house).
function samRescue(w, h){
  const BP = BAL.props;
  if(S.sam.strength + S.sam.charm/2 + rnd(0, BP.samRoll) + (samAtHouse(h) && S.samWeek.security ? (BP.watchBonus ?? 15) : 0) + (hasGuildPerk('pitfighter') ? 10 : 0) >= BP.samCheck){
    moodAdd(w, BP.samMood); gainTrust(w, BP.samTrust); S.sam.energy = Math.max(0, S.sam.energy - BP.samCost); return 'sam'; }
  S.sam.energy = Math.max(0, S.sam.energy - BP.failCost); h.rep = clamp(h.rep - BP.failRep); moodAdd(w, -BP.failMood); minorTrust(w); return 'samfail';
}
