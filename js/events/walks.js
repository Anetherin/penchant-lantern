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
  const B = BAL.walk || {}, W = B.weights || {};
  if(!useAP(samWorkCost(B.energy ?? 15))) return;
  const partners = openWalkPartners(), guests = openWalkGuests();
  const g = G();
  const opts = [];
  if(partners.length) opts.push({cat:'partner', w:(W.partner ?? 3.5) + (W.partnerPity ?? 1.5) * (S.flags.walkNoPartner || 0)});
  else if(guests.length) opts.push({cat:'guest', w:W.guest ?? 3.0});
  if(!g.left) opts.push({cat:'goddess', w: g.bound ? (W.goddessBound ?? 0.9) : (W.goddess ?? 2.5)});
  if((WALKS.casual || []).length) opts.push({cat:'casual', w:W.casual ?? 2.2});
  ['rest','coin','flavor'].forEach(cat => {
    if(walkEligibleEvents(cat).length) opts.push({cat:cat, w:W[cat] ?? 1.6});
  });

  const picked = opts.length ? weighted(opts, o => o.w).cat : 'rest';
  if(picked === 'partner') S.flags.walkNoPartner = 0;
  else if(partners.length) S.flags.walkNoPartner = (S.flags.walkNoPartner || 0) + 1;
  S.flags.walks = (S.flags.walks || 0) + 1;

  let ev = null;
  if(picked === 'partner') ev = walkPartnerEvent(partners);
  else if(picked === 'guest') ev = walkGuestEvent(guests);
  else if(picked === 'goddess') ev = walkGoddessEvent();
  else if(picked === 'casual') ev = walkCasualEvent();
  else ev = walkMiscEvent(picked);

  samLog('Took a walk around Hollowmere');
  save(); render();
  if(ev) showEvent(ev);
}

function walkRecruitEvent(key, isPartner){
  const N = NAMED[key];
  const c = isPartner ? rebirthNamed(makeNamed(key)) : makeNamed(key);
  c.signing = signingFor(c);
  NPCS[c.id] = c;

  const h = curH(), rb = raceBlock(c, h);
  const opener = isPartner
    ? ((WALKS.partnerOpeners || {})[key] || walkFill((WALKS.partnerOpeners || {}).default || 'You run into {name}.', {name:c.name, backstory:N.backstory || ''}))
    : walkFill(WALKS.guestIntro || 'You run into {name}. {backstory}', {name:c.name, backstory:N.backstory || ''});
  const pitch = isPartner && N.partnerStory ? `\n\n${N.partnerStory}` : '';
  const jobLabel = (JOBS[c.job] || {}).label || c.job;
  const raceLabel = (RACES[c.race] || {}).label || c.race;
  const info = `\n\n${titled(c)} (${raceLabel}${c.sub ? ', ' + c.sub : ''} · prefers ${jobLabel} · signing ${fmt(c.signing)})`;

  const choices = [];
  if(!rb && S.gold >= c.signing){
    choices.push({
      label: `Hire her for ${h.name} (−${fmt(c.signing)})`,
      fx(){
        if(S.gold < c.signing) return 'Not enough gold for the signing bonus.';
        S.gold -= c.signing; delete c.signing; c.job = 'rest'; c.contract = 12; c.keep = false; c.seen = {}; c.house = h.id;
        if(!isPartner){ (S.flags.guestSeen = S.flags.guestSeen || {})[key] = S.week; S.flags.lastGuest = S.week; }
        delete NPCS[c.id]; S.workers.push(c);
        if(typeof applyAutoTutor === 'function') applyAutoTutor(c);
        if(typeof applyAutoWardrobe === 'function') applyAutoWardrobe(c);
        checkUnlocks(true); samXP(3);
        addLog(`${c.name} met Sam on a walk and joined ${h.name}.`);
        return `${c.name} shakes your hand and falls into step beside you back to ${h.name}. (${c.name} hired!)`;
      }
    });
  }
  choices.push({
    label: `Invite her to apply (${isPartner ? 'stays in Candidates' : 'Candidates'})`,
    fx(){
      delete NPCS[c.id];
      if(!isHired(key) && !inCandidates(key)){
        if(isPartner){ c.keep = true; }
        else { c.keep = false; c.stay = GUEST_VISITS.stayWeeks; (S.flags.guestSeen = S.flags.guestSeen || {})[key] = S.week; S.flags.lastGuest = S.week; }
        S.candidates.push(c);
        addLog(`Met ${c.name} on a walk. (Candidates)`);
      }
      return `${c.name} agrees to drop by ${h.name} when she has a free hour. (${c.name} added to Candidates${rb ? ' — note: ' + rb : ''}.)`;
    }
  });
  choices.push({
    label: 'Chat awhile and wish her well',
    fx(){
      delete NPCS[c.id]; samStat('charm', 1);
      return `You share a pleasant few minutes talking before letting ${c.name} get back to her afternoon. (Charm +1)`;
    }
  });

  return {
    title: isPartner ? `A Chance Meeting: ${c.name}` : `A Visitor in Town: ${c.name}`,
    who: c.id,
    scene: 'portrait',
    text: opener + pitch + info,
    choices
  };
}

const walkPartnerEvent = list => walkRecruitEvent(pick(list), true);
const walkGuestEvent = list => walkRecruitEvent(pick(list), false);

function walkGoddessEvent(){
  const g = G(), GW = WALKS.goddess || {};
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
        const phase = g.knows ? 'game' : 'stranger';
        const act = c.resIn ? gDistractAct({id:T.id, phase, distract:0.75}, c) : null;
        if(act) EVQ.unshift(() => evGoddessDistract(T, c, act, fk, ctx));
        return gtxt(act && c.resIn ? c.resIn : c.res, ctx);
      }
    }))
  };
}

function walkCasualEvent(){
  const C = (BAL.walk || {}).casual || {};
  const sc = pick(WALKS.casual || []); if(!sc) return walkMiscEvent('rest');
  const npc = genWorker({quality:1.05});
  const actPool = (sc.acts || ['kiss']).filter(id => actById(id));
  const actId = pick(actPool.length ? actPool : ['kiss']);
  const act = actById(actId) || {th:10, label:'Kiss'};
  npc.lewd = Math.max(npc.lewd || 0, (act.th || 10) + 12);
  npc.trust = Math.max(npc.trust || 0, 65);
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
