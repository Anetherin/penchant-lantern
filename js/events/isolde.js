'use strict';
/* =====================================================================
   ISOLDE THORNE — Sam's rival at the Velvet Thorn (wording data/isolde.json, numbers balance.json → isolde).
   Beats in order: taunt → visit → price war → wager → truce (first night) → lovers. After the truce Sam can visit her on the
   rest day, and she turns up at his house when he stays away. She never joins: she runs her own house.
   S.isolde = {stage (index into ISO_BEATS; 5 = truce done, 6 = lovers), wk (week of the last beat), best (furthest stage in any
   cycle: later cycles need less renown and use the 'again' texts), desire, nights, wins, truce, lovers, lastNight, visitWk, lastId}
   ===================================================================== */
const ISO = needData('isolde');
const ISO_ID = 'npc_isolde';
const ISO_BEATS = ['taunt', 'visit', 'pricewar', 'wager', 'truce', 'lovers'];
const ISB = () => BAL.isolde || {};
function iso(){
  if(!S.isolde) S.isolde = {stage:0, wk:0, best:0, desire:0, nights:0, wins:0, truce:false, lovers:false, lastNight:0, visitWk:-99, lastId:null};
  return S.isolde;
}
function isoT(v, V){ if(Array.isArray(v)) v = pick(v); return String(v ?? '').replace(/\{(\w+)\}/g, (m,k)=>V && V[k]!==undefined ? String(V[k]) : m); }
const isoVars = extra => Object.assign({house: ((S.houses||[]).find(h=>h.id===S.home) || S.houses[0] || {}).name || 'your house'}, extra || {});
// a beat she already got past in an earlier cycle reads as half-remembered
const isoBeatText = (k, V) => { const B = ISO.beats[k], I = iso(); return isoT(I.best > ISO_BEATS.indexOf(k) && B.again ? B.again : B.text, V); };
function isoAdvance(){ const I = iso(); I.stage++; I.wk = S.week; I.best = Math.max(I.best||0, I.stage); }
const isoDesire = n => { const I = iso(); I.desire = clamp((I.desire||0) + n); };
// the ready beat (or null): far enough into the cycle, gap weeks since the last one, enough town renown
function isoBeatReady(){
  const I = iso(), B = ISB(), k = ISO_BEATS[I.stage];
  if(!k || k==='lovers') return null;
  if(debtWeek() < (B.firstWeek ?? 5)) return null;
  if(I.stage > 0 && S.week - I.wk < (B.gap ?? 3)) return null;
  const need = (B.renown||{})[k] || 0, mult = (I.best||0) > I.stage ? (B.again ?? 0.6) : 1;
  if(S.rep < need * mult) return null;
  if(k==='pricewar' && S.townEv) return null;   // waits for the town to quiet down
  if(k==='wager' && !isoWagerLady()) return null;
  return k;
}
const isoLoversReady = () => { const I = iso(), L = ISB().lovers || {}; return I.stage===5 && !I.lovers && (I.desire||0) >= (L.desire ?? 60) && (I.nights||0) >= (L.nights ?? 4) && S.week - I.wk >= (ISB().gap ?? 3); };
// the lady Sam puts up for the wager: best showcase at the moment
const isoShow = w => s100(statOf(w,'charisma'))*0.4 + s100(statOf(w,'beauty'))*0.4 + (w.popularity||0)*0.2;
const isoWagerLady = () => S.workers.filter(w=>w.job!=='rest' && w.job!=='guild').sort((a,b)=>isoShow(b)-isoShow(a))[0] || null;

/* ---------- weekly (endWeek, after the town events) ---------- */
function isoldeWeek(R){
  const I = iso(), B = ISB();
  const k = isoBeatReady();
  if(k){ EVQ.push(()=>isoBeatReady()===k ? evIsoldeBeat(k) : null); }
  else if(isoLoversReady()) EVQ.push(()=>isoLoversReady() ? evIsoldeLovers() : null);
  else if(I.stage >= 5){
    const C = B.comes || {}, since = S.week - Math.max(I.lastNight||0, I.visitWk||0, I.wk||0);
    if(since >= (C.after ?? 4) && Math.random() < (C.chance ?? 0.3)) EVQ.push(()=>evIsoldeNight('comes'));
  }
  if(I.lovers){
    const F = B.referral || {};
    if(Math.random() < (F.chance ?? 0.25)){ const g = Math.round((F.base ?? 80) * (1 + (F.perCycle ?? 0.25) * ((S.cycle||1) - 1))); S.gold += g; R.lines.push(isoT(ISO.referral, isoVars({gold:fmt(g)}))); }
  }
}
// a new cycle (NG+ / NG++): the world starts over, she only half-remembers (best keeps how far it went)
function isoNewCycle(){
  const I = iso(); I.best = Math.max(I.best||0, I.stage||0);
  Object.assign(I, {stage:0, wk:0, desire:0, nights:0, truce:false, lovers:false, lastNight:0, visitWk:-99, lastId:null});
}

/* ---------- the beats ---------- */
function evIsoldeBeat(k){
  const B = ISO.beats[k], V = isoVars(), I = iso(), BB = ISB();
  const ev = (choices, extra) => Object.assign({title:isoT(B.title, V), who:ISO_ID, scene:'portrait', text:isoBeatText(k, V), choices}, extra||{});
  if(k==='taunt') return ev([
    {label:B.banter.label, fx(){ isoAdvance(); if(S.sam.charm + rnd(0,50) > 40){ S.rep = clamp(S.rep+3); samStat('charm',2); isoDesire(3); return isoT(B.banter.win, V); } return isoT(B.banter.lose, V); }},
    {label:B.polite.label, fx(){ isoAdvance(); return isoT(B.polite.res, V); }}]);
  if(k==='visit') return ev([
    {label:B.compliment.label, fx(){ isoAdvance(); isoDesire(3); return isoT(B.compliment.res, V); }},
    {label:`${B.needle.label} [Wits]`, fx(){ isoAdvance(); if(S.sam.wits + rnd(0,50) > 45){ S.rep = clamp(S.rep+2); isoDesire(5); samStat('wits',1); return isoT(B.needle.win, V); } return isoT(B.needle.lose, V); }},
    {label:B.challenge.label, fx(){ isoAdvance(); isoDesire(4); return isoT(B.challenge.res, V); }}], {scene:'casual'});
  if(k==='pricewar'){
    const wk = BB.warWeeks ?? 3, war = id => startTownEvent(id, wk);
    return ev([
      {label:B.match.label, fx(){ isoAdvance(); war('price_war_match'); return isoT(B.match.res, V); }},
      {label:B.hold.label, fx(){ isoAdvance(); war('price_war_hold'); return isoT(B.hold.res, V); }},
      {label:`${B.confront.label} [Business]`, fx(){ isoAdvance(); if(S.sam.business + rnd(0,60) > 55){ samStat('business',2); isoDesire(4); return isoT(B.confront.win, V); } war('price_war_hold'); return isoT(B.confront.lose, V); }}]);
  }
  if(k==='wager'){
    const W = BB.wager || {}, lady = isoWagerLady(), stake = W.gold ?? 500;
    const VV = Object.assign({}, V, {lady:lady.name.split(' ')[0], stake:fmt(stake), gold:fmt(stake)});
    const won = () => isoShow(lady) > (W.base ?? 50) + (W.perCycle ?? 6) * ((S.cycle||1) - 1) + rnd(-(W.spread ?? 30), W.spread ?? 30);
    const glory = () => { S.rep = clamp(S.rep + (W.renown ?? 3)); lady.popularity = clamp((lady.popularity||0) + 5); moodAdd(lady, 8); };
    const ch = [];
    if(S.gold >= stake) ch.push({label:isoT(B.gold.label, VV), fx(){ isoAdvance(); if(won()){ S.gold += stake; glory(); return isoT(B.gold.win, VV); } S.gold -= stake; moodAdd(lady, -4); return isoT(B.gold.lose, VV); }});
    ch.push({label:isoT(B.kiss.label, VV), fx(){ isoAdvance(); if(won()){ glory(); isoDesire(8); return isoT(B.kiss.win, VV); } isoDesire(10); return isoT(B.kiss.lose, VV); }});
    ch.push({label:B.decline.label, fx(){ isoAdvance(); return isoT(B.decline.res, VV); }});
    return ev(ch, {text:isoBeatText(k, VV)});
  }
  if(k==='truce') return ev([
    {label:B.kiss.label, fx(){ I.truce = true; isoAdvance(); return isoNightResult(ISO.nights.find(n=>n.id==='desk') || ISO.nights[0], isoT(B.kiss.res, V) + '\n\n' + isoT(B.first, V), {how:'truce'}); }},
    {label:B.leave.label, fx(){ I.truce = true; I.wk = S.week; samLog(isoT(ISO.log.truce)); return isoT(B.leave.res, V); }}], {scene:'casual'});
  return null;
}
function evIsoldeLovers(){
  const B = ISO.beats.lovers, V = isoVars(), I = iso();
  const done = () => { I.lovers = true; isoAdvance(); samLog(isoT(ISO.log.lovers)); };
  return {title:isoT(B.title, V), who:ISO_ID, scene:'sam_date', text:isoT(B.text, V), choices:[
    {label:B.join.label, fx(){ done(); return isoT(B.join.res, V); }},
    {label:B.stay.label, fx(){ done(); return isoT(B.stay.res, V); }}]};
}

/* ---------- nights (after the truce) ---------- */
// how: 'visit' (Sam goes to the Thorn on the rest day, already paid his action), 'comes' (she turns up at his house)
function isoPickNight(how){
  const I = iso();
  const fits = (ISO.nights||[]).filter(n=>n.lovers==null || !!n.lovers===!!I.lovers);
  // she comes to his house: only the nights set there (comes: true); his visits: the ones at the Thorn
  let L = fits.filter(n=>how==='comes' ? n.comes : !n.comes);
  if(L.length > 1) L = L.filter(n=>n.id!==I.lastId);
  return pick(L.length ? L : ISO.nights);
}
const isoTakeP = () => clamp(Math.round(20 + ((S.sam.strength||0) + (S.sam.technique||0)) / ((ISB().night||{}).checkDiv ?? 1.6)), 10, 90);
const isoContestP = () => clamp(Math.round(20 + (S.sam.technique||0) * 2 / ((ISB().night||{}).checkDiv ?? 1.6)), 10, 90);
function evIsoldeNight(how){
  const I = iso(); if(I.stage < 5) return null;
  const n = isoPickNight(how), V = isoVars(), A = ISO.approach;
  const lead = isoT((ISO.arrive||{})[how==='comes' ? 'comes' : 'visit'], V);
  const pT = isoTakeP(), pC = isoContestP();
  const choices = [
    {label:isoT(A.yield.label, V), fx(){ return isoNightResult(n, isoT(A.yield.res, V), {how, approach:'yield', won:false}); }},
    {label:isoT(A.take.label, {p:pT}), fx(){ const won = Math.random()*100 < pT; return isoNightResult(n, isoT(won ? A.take.win : A.take.lose, V), {how, approach:'take', won, lost:!won}); }},
    {label:isoT(A.contest.label, {p:pC}), fx(){ const won = Math.random()*100 < pC; return isoNightResult(n, isoT(won ? A.contest.win : A.contest.lose, V), {how, approach:'contest', won, lost:!won}); }}];
  if(I.lovers) choices.push({label:isoT(ISO.joinLabel), fx(){ return isoNightResult(n, isoT(ISO.join, V) + '\n\n' + isoT(A.yield.res, V), {how, approach:'yield', won:false}); }});
  return {title:isoT(n.title, V), who:ISO_ID, scene:'sam_date', text:lead + '\n\n' + isoT(n.text, V), choices};
}
// one night's effects and result page: line (the approach or the truce kiss), then the night's finish, with her picture
function isoNightResult(n, line, o){
  const I = iso(), N = ISB().night || {}, D = N.desire || {};
  const cost = (o.how==='visit' ? 0 : (N.samEnergy ?? 30)) + (o.lost ? (N.lostEnergy ?? 15) : 0);
  S.sam.energy = Math.max(0, S.sam.energy - cost);
  samStat('technique', N.technique ?? 1);
  isoDesire(o.approach ? (D[o.approach] ?? 8) : 10);
  if(o.won){ I.wins = (I.wins||0) + 1; if(o.approach==='take') S.rep = clamp(S.rep + (N.renown ?? 1)); }
  I.nights = (I.nights||0) + 1; I.lastNight = S.week; I.lastId = n.id;
  samLog(isoT(ISO.log.night));
  const text = line + (o.how==='truce' ? '' : '\n\n' + isoT(n.finish, isoVars())) + (cost ? `\n\n(Sam's energy −${cost})` : '');
  return {text, img:{wid:ISO_ID, scene:`samact:${n.act}~~iso_${n.id}`}};
}
// image backdrop for her nights (scenes.js samact: chain)
const isoSetting = ctx => { const m = /^iso_(.+)$/.exec(ctx||''); if(!m) return null; const n = (ISO.nights||[]).find(x=>x.id===m[1]); return n ? n.setting : null; };

/* ---------- Sam's rest-day visit ---------- */
const isoCanVisit = () => !!(S && S.isolde && S.isolde.stage >= 5);
function isoVisit(){
  const I = iso(), Vb = ISB().visit || {};
  if(I.stage < 5) return;
  if(S.week - (I.visitWk||-99) < (Vb.cooldown ?? 2)) return toast(`Isolde won't see you again so soon. (Every ${Vb.cooldown ?? 2} weeks.)`);
  if(!useAP(samWorkCost(Vb.energy ?? 30))) return;
  I.visitWk = S.week; save();
  const ev = evIsoldeNight('visit'); if(ev) showEvent(ev);
}
const isoVisitBtn = () => isoCanVisit() ? `<button onclick="isoVisit()" title="${esc(ISO.visitTip||'')}">${esc(ISO.visitLabel||'Visit Isolde')}</button>` : '';
