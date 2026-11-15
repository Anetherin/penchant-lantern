'use strict';
/* =====================================================================
   DEDICATED INTRO SCENES
   House arrivals (starter, NG+, and buyHouse), partner introductions
   (starter and NG+), and the NG++ Shrine + Bound Vessel awakening.
   Wording & images live in data/goddess/intros.json (read via GOD.*).
   ===================================================================== */
function introNgppTier(w){
  if(!S || !w || !((S.ngppCycle||0) > 0 && (w.wasLover || (w.reborn||0) > 0))) return -1;
  return Math.min(2, Math.max(0, (w.reMet || 1) - 1));
}
function introFill(txt, ctx){
  return String(txt||'').replace(/\{(\w+)\}/g, (m,k)=> ctx[k]!==undefined ? String(ctx[k]) : m);
}
function introHouseEvent(h, w, opts={}){
  if(!h) return null;
  const D = HOUSES[h.id] || {}, HI = (GOD && GOD.houseIntros && GOD.houseIntros[h.id]) || {};
  const name = w ? w.name : 'the empty hall';
  const ctx = {house: h.name || D.name, loc: D.loc || 'Hollowmere', name, first: name.split(' ')[0], goddess: GN(), sam: 'Sam', cycle: S.cycle || 1};
  const baseScene = HI.image ? (dynScene('intro_house_' + h.id, HI.image) || 'portrait') : 'portrait';
  const tier = w ? introNgppTier(w) : -1;
  const memLine = tier >= 0 && Array.isArray(HI.ngpp) && HI.ngpp[tier] ? `\n\n${introFill(HI.ngpp[tier], ctx)}` : '';
  const openPage = HI.arrival ? introFill(opts.alreadyHired ? (HI.reopen || HI.arrival) : HI.arrival, ctx) : `You step across the threshold of ${h.name} in ${ctx.loc}.`;
  const note = opts.purchased ? goddessHouseNote(h.id) : (D.goddess && !G().left ? `\n\n${gtxt(D.goddess, ctx)}` : '');
  const jNote = opts.jNote || '';
  let greet = '';
  if(opts.alreadyHired && w){
    greet = `${w.name} is already behind the counter when you unlock the main doors, shaking her head with a warm grin. "Took you long enough to bring the rest of the street together, Sam."`;
  } else if(w){
    greet = HI.greet ? introFill(HI.greet, ctx) : `${w.name} is waiting inside.\n\n${w.backstory}`;
    if(!HI.greet && w.backstory) greet += `\n\n${w.backstory}`;
    else if(HI.showBackstory !== false && w.backstory) greet += `\n\n${w.backstory}`;
  } else {
    greet = D.desc || `The lanterns burn low across the empty floor, waiting for your first night of business.`;
  }
  const chList = Array.isArray(HI.choices) && HI.choices.length ? HI.choices : [{label:'Step inside and take the keys', t:4, m:5, res:`${name} nods, sizing you up with fresh curiosity. The house settles warmly around you both.`}];
  return {
    title: w ? `${h.name} — ${w.name}` : h.name,
    who: w ? w.id : godId(),
    scene: w ? baseScene : 'portrait',
    pre: opts.noPre ? undefined : [{text: `${openPage}${note}`, btn: w ? `Meet ${ctx.first}` : 'Look around', scene: baseScene}],
    text: `${greet}${memLine}${jNote}`,
    choices: chList.map(c=>({
      label: introFill(c.label, ctx),
      fx(){
        if(w){
          if(c.t) gainTrust(w, c.t);
          if(c.m) moodAdd(w, c.m);
          if(c.l) w.lewd = clamp((w.lewd||0) + c.l);
        }
        return introFill(c.res || '', ctx);
      }
    }))
  };
}
function introPartnerEvent(p, opts={}){
  if(!p) return null;
  const PI = (GOD && GOD.partnerIntros && GOD.partnerIntros[p.key]) || {};
  const N = NAMED[p.key] || {}, PG = N.goddess || {};
  const h = S.houses[0], ctx = {name: p.name, first: p.name.split(' ')[0], house: h ? h.name : 'the house', goddess: GN(), sam: 'Sam', cycle: S.cycle || 1};
  const sc = PI.image ? (dynScene('intro_partner_' + p.key, PI.image) || 'portrait') : 'portrait';
  const gTouch = !G().left && (PI.goddess || PG.comment) ? `\n\n${introFill(PI.goddess || PG.comment, {partner: ctx.first, house: ctx.house, goddess: GN()})}` : '';
  const open = PI.arrival ? introFill(PI.arrival, ctx) : `${p.name} stands beside you beneath the double moon.`;
  const voice = PI.greet ? introFill(PI.greet, ctx) : (N.partnerStory || p.backstory || '');
  const back = PI.note ? `\n\n${introFill(PI.note, ctx)}` : (N.partnerStory && PI.greet ? `\n\n${N.partnerStory}` : '');
  const chList = Array.isArray(PI.choices) && PI.choices.length ? PI.choices : [
    {label:`Glad you're here, ${ctx.first}`, t:4, m:6, res:`${ctx.first} exhales and settles closer. For the first time tonight, neither of you feels quite so lost.`},
    {label:'Let her catch her breath first', t:3, m:4, res:`${ctx.first} gives you a small, grateful nod and takes in the lantern-lit street beside you.`}
  ];
  return {
    title: `${p.name}`,
    who: p.id,
    scene: sc,
    pre: [{text: `${open}${gTouch}`, btn: `Talk with ${ctx.first}`, scene: sc}],
    text: `${voice}${back}`,
    choices: chList.map(c=>({
      label: introFill(c.label, ctx),
      fx(){
        if(c.t) gainTrust(p, c.t);
        if(c.m) moodAdd(p, c.m);
        if(c.l) p.lewd = clamp((p.lewd||0) + c.l);
        return introFill(c.res || '', ctx);
      }
    }))
  };
}
function introShrineEvent(h){
  if(!h) return null;
  const SI = (GOD && GOD.shrineIntro) || {};
  const ctx = {house: h.name, goddess: GN(), cycle: S.cycle || 1, ngpp: S.ngppCycle || 1};
  const sc = SI.image ? (dynScene('intro_shrine', SI.image) || 'portrait') : 'portrait';
  return {
    title: `${h.name}`,
    who: godId(),
    scene: sc,
    pre: SI.arrival ? [{text: introFill(SI.arrival, ctx), btn: 'Step up to the shrine', scene: sc}] : undefined,
    text: introFill(SI.text || `Lanternlight pools softly across ${h.name}, carrying the faint warm memory of cycles before this one.`, ctx),
    choices: [{
      label: introFill(SI.button || 'Light the first lantern', ctx),
      fx(){ G().mood = clamp((G().mood||55) + 4); return introFill(SI.res || 'The wick catches in warm amber, and the Shrine hums awake.', ctx); }
    }]
  };
}
function introVesselEvent(vessel){
  if(!vessel) return null;
  const VI = (GOD && GOD.vesselIntro) || {};
  const ctx = {name: vessel.name, goddess: GN(), house: (H(vessel.house)||{}).name || 'the Shrine'};
  const sc = VI.image ? (dynScene('intro_vessel', VI.image) || 'portrait') : 'portrait';
  return {
    title: `${vessel.name}`,
    who: vessel.id,
    scene: sc,
    pre: VI.arrival ? [{text: introFill(VI.arrival, ctx), btn: 'Meet her gaze', scene: sc}] : undefined,
    text: introFill(VI.text || `${vessel.name} watches you from beneath a pale hood, silent and unformed, waiting to become whoever your cycles ask her to be.`, ctx),
    choices: [{
      label: introFill(VI.button || 'Offer her your hand', ctx),
      fx(){ gainTrust(vessel, 5); moodAdd(vessel, 6); return introFill(VI.res || 'Her cool fingers close gently over yours—an anchor before the town even wakes.', ctx); }
    }]
  };
}
function queueStarterIntros(){
  const h = S.houses[0], D = HOUSES[h.id], npc = D && D.npc ? S.workers.find(w=>w.key===D.npc) : null;
  const p = S.workers.find(w=>w.isPartner);
  if(h) EVQ.push(()=>introHouseEvent(h, npc, {starter:true}));
  if(p && (!npc || p.id !== npc.id)) EVQ.push(()=>introPartnerEvent(p, {starter:true}));
}
function queueNgPlusIntros(newHouse, newPartner){
  if(newHouse){
    const D = HOUSES[newHouse.id], npc = D && D.npc ? S.workers.find(w=>w.key===D.npc) : null;
    EVQ.push(()=>introHouseEvent(newHouse, npc, {ngplus:true}));
  }
  if(newPartner) EVQ.push(()=>introPartnerEvent(newPartner, {ngplus:true}));
}
function queueNgppIntros(shrine, vessel){
  if(shrine) EVQ.push(()=>introShrineEvent(shrine));
  if(vessel) EVQ.push(()=>introVesselEvent(vessel));
}
