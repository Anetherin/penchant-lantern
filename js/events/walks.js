'use strict';
/* =====================================================================
   WALKS AROUND HOLLOWMERE
   Sam's walk action (samWalk): discover unchosen partners (and guest
   characters once all partners are found), run into the goddess in
   disguise, have casual encounters that raise Technique, or catch
   rest / coin / flavor events around town.
   ===================================================================== */
const WALKS = needData('walks');

const walkSetting = ctx => {
  const m = /^walk_(.+)$/.exec(ctx || '');
  if(!m) return null;
  const sc = (WALKS.casual || []).find(x => x.id === m[1]);
  return sc ? sc.setting || null : null;
};

const inCandidates = key => S.candidates.some(c => c.key === key);
const openWalkPartners = () => PARTNERS.filter(k => !isHired(k) && !inCandidates(k) && partnerOffered(k));
const openWalkGuests = () => Object.keys(NAMED).filter(k => NAMED[k].role === 'drifter' && !isHired(k) && !inCandidates(k) && !(SET.packsOff || {})[NAMED[k].pack]);
const openWalkExLovers = () => Object.keys(NAMED).filter(k => S.lives && S.lives[k] && S.lives[k].wasLover && !isHired(k) && !inCandidates(k) && !(SET.packsOff || {})[NAMED[k].pack]);

function walkFill(text, vars){
  return String(text ?? '').replace(/\{(\w+)\}/g, (m, k) => vars[k] !== undefined ? String(vars[k]) : m);
}

function walkShopOutfit(){
  const pool = Object.keys(SHOP_OUTFITS || {}).filter(k => !WARDROBE[k].uniform && !WARDROBE[k].owner && !S.houseWardrobe.includes(k));
  return pool.length ? pick(pool) : null;
}

function walkEligibleEvents(cat){
  return (WALKS.events || []).filter(e => {
    if(e.cat !== cat) return false;
    if(e.needRegular && !(S.regulars || []).length) return false;
    if(e.needWorker && !S.workers.length) return false;
    if(e.id === 'peddler_trunk' && !walkShopOutfit()) return false;
    return true;
  });
}

function samWalk(){
  const B = BAL.walk || {}, W = ((S.ngppCycle || 0) > 0 && B.ngppWeights) ? Object.assign({}, B.weights, B.ngppWeights) : (B.weights || {});
  if(!useAP(samWorkCost(B.energy ?? 15))) return;
  const partners = openWalkPartners(), guests = openWalkGuests(), exLovers = openWalkExLovers();
  const g = G();
  const opts = [];
  if(exLovers.length) opts.push({cat:'exlover', w:(W.partner ?? 3.5) + 1.2});
  if(partners.length) opts.push({cat:'partner', w:(W.partner ?? 3.5) + (W.partnerPity ?? 1.5) * (S.flags.walkNoPartner || 0)});
  else if(guests.length) opts.push({cat:'guest', w:W.guest ?? 3.0});
  if(!g.left) opts.push({cat:'goddess', w: g.bound ? (W.goddessBound ?? 0.9) : (W.goddess ?? 2.5)});
  if((WALKS.casual || []).length) opts.push({cat:'casual', w:W.casual ?? 2.2});
  ['rest','coin','flavor'].forEach(cat => {
    if(walkEligibleEvents(cat).length) opts.push({cat:cat, w:W[cat] ?? 1.6});
  });

  const picked = opts.length ? weighted(opts, o => o.w).cat : 'rest';
  if(picked === 'partner' || picked === 'exlover') S.flags.walkNoPartner = 0;
  else if(partners.length) S.flags.walkNoPartner = (S.flags.walkNoPartner || 0) + 1;
  S.flags.walks = (S.flags.walks || 0) + 1;

  let ev = null;
  if(picked === 'exlover') ev = walkRecruitEvent(pick(exLovers), true);
  else if(picked === 'partner') ev = walkPartnerEvent(partners);
  else if(picked === 'guest') ev = walkGuestEvent(guests);
  else if(picked === 'goddess') ev = walkGoddessEvent();
  else if(picked === 'casual') ev = walkCasualEvent();
  else ev = walkMiscEvent(picked);

  samLog('Took a walk around Hollowmere');
  save(); render();
  if(ev) showEvent(ev);
}

function walkWorkerSummary(c){
  const jobLabel = (JOBS[c.job] || {}).label || c.job;
  const raceLabel = (RACES[c.race] || {}).label || c.race;
  const sign = c.wasLover ? 'no signing bonus' : `signing ${fmt(c.signing)}`;
  return `${titled(c)} (${raceLabel}${c.sub ? ', ' + c.sub : ''} · prefers ${jobLabel} · ${sign})`;
}

function walkHireChoices(c, h, opts={}){
  const rb = raceBlock(c, h), choices = [];
  if(!rb && S.gold >= c.signing){
    choices.push({
      label: c.signing > 0 ? `Hire her for ${h.name} (−${fmt(c.signing)})` : c.wasLover ? `Welcome her back to ${h.name} (free)` : `Invite her into ${h.name} (free)`,
      fx(){
        if(S.gold < c.signing) return 'Not enough gold for the signing bonus.';
        S.gold -= c.signing; delete c.signing; c.job = 'rest'; c.contract = 12; c.keep = false; c.seen = {}; c.house = h.id;
        if((S.ngppCycle||0) > 0 && (c.wasLover || (c.reborn||0) > 0 || (c.key && NAMED[c.key] && NAMED[c.key].role==='partner'))) c.reMet = (c.reMet || 0) + 1;
        if(opts.onHire) opts.onHire(c);
        delete NPCS[c.id]; S.workers.push(c);
        if(typeof applyAutoTutor === 'function') applyAutoTutor(c);
        if(typeof applyAutoWardrobe === 'function') applyAutoWardrobe(c);
        checkUnlocks(true); samXP(3);
        addLog(`${c.name} met Sam on a walk and joined ${h.name}.`);
        let msg = (opts.hireRes || `${c.name} shakes your hand and falls into step beside you back to ${h.name}.`) + ` (${c.name} hired!)`;
        if(c.wasLover && goddessActive()){
          const jGain = (GB().jealousy || {}).perExLover ?? 6;
          G().jealousy = clamp((G().jealousy || 0) + jGain);
          const gl = WALKS.goddessExLover && WALKS.goddessExLover.length ? walkFill(pick(WALKS.goddessExLover), {goddess:GN(), name:c.name}) : '';
          if(gl) msg += `\n\n${gl} (${GN()}'s jealousy +${jGain})`;
        }
        return msg;
      }
    });
  }
  choices.push({
    label: `Invite her to apply (${opts.candNote || 'Candidates'})`,
    fx(){
      delete NPCS[c.id];
      if(!opts.candCheck || opts.candCheck()){
        if(opts.onCand) opts.onCand(c);
        S.candidates.push(c);
        addLog(`Met ${c.name} on a walk. (Candidates)`);
      }
      return (opts.candRes || `${c.name} agrees to drop by ${h.name} when she has a free hour.`) + ` (${c.name} added to Candidates${rb ? ' — note: ' + rb : ''}.)`;
    }
  });
  choices.push({
    label: opts.passLabel || 'Chat awhile and wish her well',
    fx(){
      delete NPCS[c.id]; samStat('charm', 1);
      return (opts.passRes || `You share a pleasant few minutes talking before letting ${c.name} get back to her afternoon.`) + ' (Charm +1)';
    }
  });
  return choices;
}

function walkRecruitEvent(key, isPartner){
  const N = NAMED[key];
  const c = rebirthNamed(makeNamed(key));
  c.signing = (c.wasLover || (isPartner && (S.ngppCycle || 0) > 0)) ? 0 : signingFor(c);
  NPCS[c.id] = c;

  const h = curH(), ngpp = (S.ngppCycle || 0) > 0, tier = Math.min(2, c.reMet || 0);
  const isReturning = ngpp && (c.wasLover || (c.reborn || 0) > 0);
  const custom = (WALKS.partnerMemoryLines || {})[key];
  const memOpener = isReturning
    ? (Array.isArray(custom) && custom[tier] ? custom[tier]
      : (N.ngplus && WALKS.isekaiMemoryTiers && WALKS.isekaiMemoryTiers[tier]) ? WALKS.isekaiMemoryTiers[tier]
      : (WALKS.exLoverMemoryTiers && WALKS.exLoverMemoryTiers[tier]) ? WALKS.exLoverMemoryTiers[tier] : null)
    : null;
  const fVars = {name:c.name, house:h.name, backstory:N.backstory || ''};
  const opener = memOpener ? walkFill(memOpener, fVars)
    : c.wasLover && WALKS.exLoverOpeners && WALKS.exLoverOpeners.length
      ? walkFill(pick(WALKS.exLoverOpeners), fVars)
      : isPartner
        ? walkFill((WALKS.partnerOpeners || {})[key] || (WALKS.partnerOpeners || {}).default || 'You run into {name}.', fVars)
        : walkFill(WALKS.guestIntro || 'You run into {name}. {backstory}', fVars);
  const pitch = isPartner && N.partnerStory && !isReturning ? `\n\n${N.partnerStory}` : '';
  const markGuest = () => { if(!isPartner){ (S.flags.guestSeen = S.flags.guestSeen || {})[key] = S.week; S.flags.lastGuest = S.week; } };
  const customHire = (WALKS.partnerMemoryHire || {})[key];
  const memHire = isReturning
    ? (Array.isArray(customHire) && customHire[tier] ? customHire[tier]
      : (N.ngplus && WALKS.isekaiMemoryHire && WALKS.isekaiMemoryHire[tier]) ? WALKS.isekaiMemoryHire[tier]
      : (WALKS.exLoverMemoryHire && WALKS.exLoverMemoryHire[tier]) ? WALKS.exLoverMemoryHire[tier] : null)
    : null;
  const hireRes = memHire ? walkFill(memHire, fVars)
    : c.wasLover && WALKS.exLoverHireRes && WALKS.exLoverHireRes.length
      ? walkFill(pick(WALKS.exLoverHireRes), fVars) : null;
  const PI = (WALKS.partnerIntros || {})[key] || {};
  const GP = typeof GOD !== 'undefined' && GOD && GOD.partnerIntros ? GOD.partnerIntros[key] : null;
  const imgSpec = PI.image || (GP && GP.image) || null;
  const sc = imgSpec ? (dynScene('walk_' + key, imgSpec) || 'portrait') : 'portrait';
  const gNote = isReturning && !G().left && (N.goddess && N.goddess.comment) ? `\n\n(${gtxt(N.goddess.comment, {partner: c.name.split(' ')[0], house: h.name, goddess: GN()})})` : '';
  const preOpen = PI.open ? walkFill(PI.open, fVars) : (GP && GP.arrival ? walkFill(GP.arrival, {name:c.name, first:c.name.split(' ')[0], house:h.name, loc:h.loc||'', goddess:GN(), sam:'Sam'}) : '');
  const pre = preOpen ? [{text: `${preOpen}${isReturning ? gNote : ''}`, btn: `Step closer to ${c.name.split(' ')[0]}`, scene: sc}] : undefined;

  return {
    title: c.wasLover ? `A Familiar Face: ${c.name}` : isPartner ? `A Chance Meeting: ${c.name}` : `A Visitor in Town: ${c.name}`,
    who: c.id,
    scene: sc,
    pre,
    text: `${opener}${pitch}\n\n${walkWorkerSummary(c)}`,
    choices: walkHireChoices(c, h, {
      hireRes,
      candNote: isPartner ? 'stays in Candidates' : 'Candidates',
      candCheck: () => !isHired(key) && !inCandidates(key),
      onHire: markGuest,
      onCand: () => { if(isPartner || c.wasLover){ c.keep = true; } else { c.keep = false; c.stay = GUEST_VISITS.stayWeeks; markGuest(); } }
    })
  };
}

const walkPartnerEvent = list => walkRecruitEvent(pick(list), true);
const walkGuestEvent = list => walkRecruitEvent(pick(list), false);

function walkGoddessEvent(){
  const g = G(), GW = WALKS.goddess || {}, B = BAL.walk || {};
  if(!g.bound){
    const fresh = gFresh().filter(gEligible);
    const mainOdds = gOverdue() > 0 ? 1 : (B.mainGoddessChance ?? 0.75);
    if(fresh.length && Math.random() < mainOdds){
      const mainEv = evGoddess();
      if(mainEv){
        g.evWk = S.week;
        if(fresh[0].id !== 'st_ride'){
          const lead = 'Later that night, after you get back from your walk:\n\n';
          if(mainEv.pre && mainEv.pre.length) mainEv.pre[0].text = lead + mainEv.pre[0].text;
          else mainEv.text = lead + mainEv.text;
        }
        return mainEv;
      }
    }
  }

  const fk = gDisguise(), F = GOD_FORMS[fk] || {};
  const ctx = {alias:F.alias || GN(), form:F.desc || 'a woman', race:(F.label || '').toLowerCase(), house:curH().name, sam:'Sam', goddess:GN()};

  if(g.bound){
    const T = pick(GW.bound || []); if(!T) return walkMiscEvent('rest');
    const sc = T.image ? dynScene('walk_gb_' + T.id + '_' + fk, T.image) : 'portrait';
    return {
      title: gtxt(T.title, ctx), who: godNpcId(fk), scene: sc, text: gtxt(T.text, ctx),
      choices: (T.choices || []).map(c => ({
        label: gtxt(c.label, ctx),
        fx(){
          if(c.gold && S.gold < -c.gold) return 'You check your pockets and come up short.';
          if(c.gold) S.gold += c.gold;
          g.love = clamp((g.love || 0) + (c.love || 0));
          g.jealousy = clamp((g.jealousy || 0) + (c.jealousy || 0));
          g.mood = clamp((g.mood || 0) + (c.mood || 0));
          if(c.energy) samEnergyAdd(c.energy);
          return gtxt(c.res, ctx);
        }
      }))
    };
  }

  const all = GW.disguise || [];
  const fit = all.filter(t => (!t.unknown || !g.knows) && (!t.needKnows || g.knows));
  const T = pick(fit.length ? fit : all); if(!T) return walkMiscEvent('rest');
  const sc = T.image ? dynScene('walk_g_' + T.id + '_' + fk, T.image) : 'portrait';
  const pre = T.intro ? [{text: gtxt(T.intro, ctx), btn: 'Continue'}] : null;
  const body = T.intro ? gtxt(T.wonder || '', ctx) : gtxt(T.text || '', ctx);
  return {
    title: gtxt(T.title, ctx), who: godNpcId(fk), scene: sc, pre, text: body,
    choices: (T.choices || [{label:'…'}]).map(c => ({
      label: gtxt(c.label, ctx),
      fx(){
        g.met2 = (g.met2 || 0) + 1;
        g.love = clamp((g.love || 0) + (c.love || 0));
        g.jealousy = clamp((g.jealousy || 0) + (c.jealousy || 0));
        if(c.energy) samEnergyAdd(c.energy);
        const act = c.resIn ? gDistractAct(T, c) : null;
        if(act) EVQ.unshift(() => evGoddessDistract(T, c, act, fk, ctx));
        return gtxt(act && c.resIn ? c.resIn : c.res, ctx);
      }
    }))
  };
}

function walkCasualRecruit(npc, sc, actId, baseTrust, origLewd){
  if(!npc) return null;
  const h = curH(), CR = WALKS.casualRecruit || {};
  npc.trust = clamp(Math.round((baseTrust || 10) + 12), 22, 34);
  npc.lewd = Math.max(origLewd || 15, ((actById(actId) || {}).th || 10) + 4);
  npc.intim = Math.max(npc.intim || 0, actTier(actId));
  npc.privateCount = (npc.privateCount || 0) + 1;
  npc.counts = npc.counts || {};
  npc.counts.privateSam = (npc.counts.privateSam || 0) + 1;
  npc.base0 = {trust: npc.trust, lewd: npc.lewd};
  npc.signing = signingFor(npc);
  NPCS[npc.id] = npc;

  const raceLabel = (RACES[npc.race] || {}).label.toLowerCase() || npc.race;
  const V = {name: npc.name, race: raceLabel, house: h.name};
  const noteOrigin = c => { c.backstory = `Met Sam during a walk around Hollowmere. ${c.backstory || ''}`; };

  return {
    title: walkFill(CR.title || `Second Thoughts: ${npc.name}`, V),
    who: npc.id,
    scene: 'portrait',
    text: walkFill(CR.text || `{name} pauses before leaving and asks if you have an opening at {house}.`, V) + `\n\n${walkWorkerSummary(npc)}`,
    choices: walkHireChoices(npc, h, {
      onHire: noteOrigin,
      onCand: noteOrigin,
      hireRes: walkFill(CR.hireRes || `{name} smiles and agrees to come back to {house} with you.`, V),
      candRes: walkFill(CR.candRes || `{name} promises to stop by {house} later this week.`, V),
      passLabel: walkFill(CR.passLabel || 'Keep things casual and wish her well', V),
      passRes: walkFill(CR.passRes || `You share one last smile and let {name} go on her way.`, V)
    })
  };
}

function walkCasualEvent(){
  const C = (BAL.walk || {}).casual || {};
  const sc = pick(WALKS.casual || []); if(!sc) return walkMiscEvent('rest');
  const npc = genWorker({quality:1.05});
  const baseTrust = npc.trust || 10, origLewd = npc.lewd || 15;
  const actPool = (sc.acts || ['kiss']).filter(id => actById(id));
  const actId = pick(actPool.length ? actPool : ['kiss']);
  const act = actById(actId) || {th:10, label:'Kiss'};
  npc.lewd = Math.max(origLewd, (act.th || 10) + 12);
  npc.trust = Math.max(baseTrust, 65);
  NPCS[npc.id] = npc;

  const raceLabel = (RACES[npc.race] || {}).label.toLowerCase() || npc.race;
  const V = {name:npc.name, race:raceLabel, act:act.label.toLowerCase(), house:curH().name};
  const techGain = C.tech ?? 3, charmGain = C.charm ?? 1, extraE = C.extraEnergy ?? 8, passE = C.passEnergy ?? 4;

  return {
    title: walkFill(sc.title, V),
    who: npc.id,
    scene: 'portrait',
    text: walkFill(sc.text, V),
    choices: [
      {
        label: walkFill(sc.goLabel, V),
        fx(){
          if(extraE) S.sam.energy = Math.max(0, S.sam.energy - extraE);
          samStat('technique', techGain);
          if(charmGain) samStat('charm', charmGain);
          if(S.sam.first && actTier(actId) >= 2) S.sam.first = false;
          if((S.sam.technique || 0) >= (C.recruitTech ?? 25)) EVQ.unshift(() => walkCasualRecruit(npc, sc, actId, baseTrust, origLewd));
          const scene = 'samact:' + actId + '~~walk_' + sc.id;
          return {
            text: walkFill(sc.goRes, V) + `\n\n(Sam's Technique +${techGain}${charmGain ? `, Charm +${charmGain}` : ''}${extraE ? `, Energy −${extraE}` : ''})`,
            img: {wid: npc.id, scene}
          };
        }
      },
      {
        label: walkFill(sc.passLabel, V),
        fx(){
          delete NPCS[npc.id];
          if(passE) samEnergyAdd(passE);
          samStat('charm', 1);
          return walkFill(sc.passRes, V) + `\n\n(Charm +1${passE ? `, Energy +${passE}` : ''})`;
        }
      }
    ]
  };
}

function applyWalkOutcome(o, vars){
  const notes = [];
  if(o.gold){
    S.gold = Math.max(0, S.gold + o.gold);
    notes.push((o.gold > 0 ? '+' : '−') + fmt(Math.abs(o.gold)));
  }
  if(o.energy){
    if(o.energy > 0){ samEnergyAdd(o.energy); notes.push(`Energy +${o.energy}`); }
    else { S.sam.energy = Math.max(0, S.sam.energy + o.energy); notes.push(`Energy −${-o.energy}`); }
  }
  if(o.rep){
    const h = curH();
    repAdd(h, o.rep);
    notes.push(`${h.name} rep +${o.rep}`);
  }
  if(o.sam){
    Object.entries(o.sam).forEach(([k, v]) => {
      samStat(k, v);
      notes.push(`${cap(k)} +${v}`);
    });
  }
  if(o.appXP){
    samXP(o.appXP);
    notes.push(`Appraisal XP +${Math.round(o.appXP * samBonus('wits'))}`);
  }
  if(o.regularLoyalty && vars._reg){
    vars._reg.loyalty = clamp((vars._reg.loyalty || 0) + o.regularLoyalty, 0, 100);
    notes.push(`${vars._reg.name} loyalty +${o.regularLoyalty}`);
  }
  if(o.workerMood && vars._worker){
    moodAdd(vars._worker, o.workerMood);
    notes.push(`${vars._worker.name} mood +${o.workerMood}`);
  }
  if(o.workerTrust && vars._worker){
    const tg = gainTrust(vars._worker, o.workerTrust);
    notes.push(`${vars._worker.name} trust ${tDelta(tg)}`);
  }
  if(o.outfitDiscount){
    const ok = walkShopOutfit();
    if(ok){
      const cost = Math.max(25, Math.round(outfitCost(ok) * o.outfitDiscount));
      if(S.gold < cost) return 'You check your purse and come up short for the clearance price.';
      S.gold -= cost;
      if(!S.houseWardrobe.includes(ok)) S.houseWardrobe.push(ok);
      vars.outfit = WARDROBE[ok].label;
      vars.cost = fmt(cost);
      notes.push(`Added ${WARDROBE[ok].label} (−${fmt(cost)})`);
    }
  }
  const msg = walkFill(o.res, vars);
  return notes.length ? `${msg}\n\n(${notes.join(' · ')})` : msg;
}

function walkMiscEvent(cat){
  const list = walkEligibleEvents(cat);
  const E = pick(list.length ? list : walkEligibleEvents('rest'));
  if(!E) return null;

  const h = curH();
  const reg = E.needRegular && (S.regulars || []).length ? pick(S.regulars) : null;
  const worker = E.needWorker && S.workers.length ? pick(S.workers) : null;
  const vars = {
    house: h.name,
    regular: reg ? reg.name : 'a regular',
    lady: worker ? worker.name : 'a friend',
    _reg: reg,
    _worker: worker
  };

  return {
    title: walkFill(E.title, vars),
    who: worker ? worker.id : null,
    scene: worker ? 'portrait' : null,
    text: walkFill(E.text, vars),
    choices: E.choices.map(c => ({
      label: walkFill(c.label, vars),
      fx(){
        if(c.gold && c.gold < 0 && S.gold < -c.gold) return 'You do not have enough gold for that right now.';
        if(c.check){
          const ch = c.check;
          const pastOk = ch.past && hasPast(ch.past);
          const appOk = ch.app && (S.sam.appraisal || 1) >= ch.app;
          const pass = pastOk || appOk || ((S.sam[ch.stat] || 0) + rnd(0, 45) >= (ch.need || 40));
          return applyWalkOutcome(pass ? c.win : c.lose, vars);
        }
        return applyWalkOutcome(c, vars);
      }
    }))
  };
}
