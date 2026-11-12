'use strict';
/* =====================================================================
   THE GODDESS — the overarching story (docs/GODDESS.md).
   She brought Sam over. Cycle 1: an intro before the Vane welcome, nothing else. From cycle 2 her tease scenes and
   jealous remarks turn up as weekly events (balance.json → goddess.events: more often each cycle). She never lets Sam
   finish: that would bind her. Once a lady has lived a full maxed life (w.reborn > goddess.fullReborn) the next
   rebirth binds her to Sam: she loses her divinity (goddess.divinity.bindTo), gets her own tab and acts every week on
   the focus you give her (1 action + 1 per divinity.perAction). Sam finishing inside her rebuilds her divinity; at
   full divinity her story ends: she stays if her love is high enough (love.stay), else she leaves.
   Wording and her look: data/goddess.json (GOD). Numbers: data/balance.json → goddess (GB()).
   State: S.goddess (ensureGoddess). Week hooks: goddessPlan() before the houses run, goddessAfter(R) after;
   pushyCheck asks goddessGuard(h).
   ===================================================================== */
const GOD = needData('goddess');
const GB = () => BAL.goddess || {};
const GN = () => GOD.name || 'Seliora';
// One form per race (goddess.json → forms), each its own NPC (npc_goddess_<race>) so pictures are saved per form.
// What never changes (look: hair, eyes, signature, outfit) is the same in every form, so she's always recognizable.
const GOD_FORMS = noMeta(GOD.forms || {human:{}});
const GOD_TRUE = GOD.trueForm && GOD_FORMS[GOD.trueForm] ? GOD.trueForm : Object.keys(GOD_FORMS)[0];
const godNpcId = r => 'npc_goddess_' + r;
Object.entries(GOD_FORMS).forEach(([r, f], i)=>{
  const lk = GOD.look || {};
  const race = RACES[f.race || r] ? (f.race || r) : 'human';
  NPCS[godNpcId(r)] = {id:godNpcId(r), name:GOD.name, race, sub:f.sub || '', age:999, outfit:'custom', customOutfit:f.outfit || lk.outfit || '', under:'plain', imgVar:{},
    seed:7130417 + i*101, lewd:95, trust:100, traits:[], acts:{}, menu:[], counts:{}, body:Object.assign({}, BODY_DEF, f.body || {}),
    design:{build:f.build || '', hairStyle:f.hairStyle || lk.hairStyle || '', hairColor:f.hair || lk.hair || '', eyes:f.eyes || lk.eyes || '', skin:f.skin || lk.skin || '', features:[lk.signature, f.features].filter(Boolean).join(', ')}};
});
const GOD_ID = godNpcId(GOD_TRUE);   // her own form: story scenes before the binding
const GFOCUS = ['indulge','business','watch','tutelage','whim'];
let GNEXT = null, GW = {biz:{}, watch:{}, saved:0};   // GW: this week's effects, rebuilt by goddessPlan()

function ensureGoddess(){
  if(!S) return null;
  const B = GB(), J = B.mood || {};
  const d = {met:false, bound:false, boundCycle:0, love:0, jealousy:0, mood:J.base ?? 55, divinity:100, focus:'indulge', form:'auto',
    shape:'auto', autoShape:GOD_TRUE, teases:[], evWk:0, roster:0, ending:null, left:false, nights:0, finishes:0, last:[], lastNight:0, claimWk:0};
  const g = S.goddess = S.goddess || {};
  Object.keys(d).forEach(k=>{ if(g[k] === undefined) g[k] = d[k]; });   // in place: callers keep their reference
  if(g.form === 'feminine') g.form = 'fem';
  return g;
}
const G = () => ensureGoddess() || {};
// The form she's in now: before the binding always her own; after it the one you picked, or this week's (auto, rolled in goddessPlan).
const godForm = () => { const g = G(); if(!g.bound) return GOD_TRUE; const f = g.shape==='auto' ? g.autoShape : g.shape; return GOD_FORMS[f] ? f : GOD_TRUE; };
const godId = () => godNpcId(godForm());
const goddessActive = () => { const g = G(); return !!(g.bound && !g.left); };
// t: a string or a list (one picked); ctx fills {goddess}, {sam}, {house}, {partner}, {past}, {lady}, {n}, {names}, {cycle}
function gtxt(t, ctx={}){
  if(Array.isArray(t)) t = t.length ? pick(t) : '';
  const c = Object.assign({goddess:GN(), sam:'Sam', cycle:(S&&S.cycle)||1}, ctx);
  return String(t||'').replace(/\{(\w+)\}/g, (m,k)=> c[k]!==undefined ? String(c[k]) : m);
}
const gpara = (...xs) => xs.filter(Boolean).join('\n\n');
const jTier = () => { const j = G().jealousy||0, T = GB().jealousy||{}; return j >= (T.high ?? 60) ? 'high' : j >= (T.mid ?? 30) ? 'mid' : 'low'; };
const dTier = () => { const d = G().divinity||0; return d >= 70 ? 'high' : d >= 35 ? 'mid' : 'low'; };
// Fully reincarnated: lived (or living) a life at the maximum carry. min = the reborn stacks that counts.
const fullAt = () => GB().fullReborn ?? 4;
const rebornFull = (min = fullAt()) => [...(S.workers||[]), ...(S.alumni||[])].filter(w=>(w.reborn||0) >= min);
// Her power: base + divinity, times a bonus for every fully reincarnated lady (more for each life past full).
function goddessPower(){
  const P = GB().power || {}, g = G();
  const reb = rebornFull().reduce((a,w)=>a + 1 + ((w.reborn||0) - fullAt()), 0);
  return ((P.base ?? 0.5) + (P.perDiv ?? 0.01) * (g.divinity||0)) * (1 + (P.perReborn ?? 0.1) * reb);
}
const goddessActions = () => 1 + Math.floor((G().divinity||0) / ((GB().divinity||{}).perAction || 25));

/* ---------- scenes (modal with her picture) ---------- */
function gScene(title, text, img, btn, next){
  GNEXT = next || null;
  const sc = img ? (typeof img === 'string' ? img : dynScene('goddess_' + (img.key || title.replace(/\W+/g,'_').toLowerCase()), img)) : 'portrait';
  modal(`<h2>${esc(title)}</h2><div id="gImg"></div><p class="story">${esc(text)}</p><div class="row"><button class="primary" onclick="gNext()">${esc(btn || 'Continue')}</button></div>`, {lock:true});
  $('#modal').scrollTop = 0;
  showImg('gImg', godId(), sc || 'portrait');
}
function gNext(){ const n = GNEXT; GNEXT = null; closeModal(); if(typeof n === 'function') n(); else render(); }

/* ---------- cycle 1: the intro, before Marguerite's welcome ---------- */
function goddessIntro(next){
  const g = G(); g.met = true; g.roster = S.workers.length;
  const I = GOD.intro || {}, h = S.houses[0], p = S.workers.find(w=>w.isPartner), P = ((NAMED[S.partner]||{}).goddess) || {};
  const ctx = {house: h ? h.name : 'the house', partner: p ? p.name.split(' ')[0] : 'someone', past: PASTS[S.past] ? PASTS[S.past].label.toLowerCase() : 'office worker'};
  const text = gpara(gtxt(I.open, ctx), gtxt(((PASTS[S.past]||{}).goddess||{}).intro, ctx), gtxt(h && (HOUSES[h.id]||{}).goddess, ctx), gtxt(P.hand, ctx), gtxt(P.comment, ctx), gtxt(I.close, ctx));
  save();
  gScene(I.title || 'Before the truck stops ringing', text, I.image, I.button || '…', next);
}

/* ---------- New Game+: her word at every rebirth; the binding at the first one after a lady's full life ---------- */
const bindReady = () => !G().bound && rebornFull(fullAt() + 1).length > 0;
// info: {weeks, planned, house, partner, past, lovers:[names]} from ngBegin, captured before the reset
function goddessRebirth(info, next){
  const g = G(), R = GOD.rebirth || {}, J = GB().jealousy || {};
  g.met = true;
  if(!g.bound) g.jealousy = clamp((g.jealousy||0) + (J.perLover ?? 4) * (info.lovers||[]).length + (J.perCycle ?? 6));
  g.roster = S.workers.length;
  if(bindReady()) return goddessBind(info, next);
  if(g.bound && !g.left){   // after the binding: a short word, then on with it
    save(); return gScene(R.boundTitle || `${GN()}`, gpara(gtxt(R.bound && R.bound[dTier()], info), gtxt(info.house && (HOUSES[info.house]||{}).goddess, {house: info.house ? HOUSES[info.house].name : ''})), R.image, 'Continue', next);
  }
  if(g.left){ if(next) next(); return; }
  const pace = info.weeks && info.planned ? (info.weeks <= info.planned * 0.75 ? 'fast' : info.weeks >= info.planned ? 'slow' : 'steady') : 'steady';
  const P = ((NAMED[info.partner]||{}).goddess) || {}, pn = info.partner && NAMED[info.partner] ? NAMED[info.partner].name.split(' ')[0] : '';
  const ctx = {house: info.house && HOUSES[info.house] ? HOUSES[info.house].name : '', partner: pn, n: (info.lovers||[]).length, names: (info.lovers||[]).join(', '),
    past: info.past && PASTS[info.past] ? PASTS[info.past].label.toLowerCase() : ''};
  const text = gpara(gtxt(R.open, ctx), gtxt(R[pace], ctx), (info.lovers||[]).length ? gtxt(R.lovers, ctx) : gtxt(R.alone, ctx),
    info.past && info.past!=='none' ? gtxt(((PASTS[info.past]||{}).goddess||{}).again, ctx) : '',
    info.house ? gtxt((HOUSES[info.house]||{}).goddess, ctx) : '', pn ? gpara(gtxt(P.hand, ctx), gtxt(P.comment, ctx)) : '',
    gtxt((R.jealous||{})[jTier()], ctx), gtxt(R.close, ctx));
  save();
  gScene(gtxt(R.title || 'Again, {sam}?', ctx), text, R.image, 'Wake up', next);
}
function goddessBind(info, next){
  const g = G(), B = GB(), T = GOD.binding || {};
  g.bound = true; g.knows = true; g.boundCycle = S.cycle; g.lastNight = S.week; g.divinity = (B.divinity||{}).bindTo ?? 5;
  g.love = clamp((g.love||0) + ((B.love||{}).bind ?? 10)); g.jealousy = Math.round((g.jealousy||0) * 0.4); g.finishes = (g.finishes||0) + 1;
  addLog(`${GN()} is bound to Sam. Her divinity is gone, for now.`);
  const ladies = rebornFull(fullAt() + 1).map(w=>w.name.split(' ')[0]);
  const ctx = {names: ladies.join(', '), lady: ladies[0] || 'her', house: info && info.house && HOUSES[info.house] ? HOUSES[info.house].name : ''};
  save();
  gScene(T.title || 'Bound', gpara(gtxt(T.text, ctx), gtxt(T.after, ctx)), T.image, T.button || 'Stay with her', ()=>{ TAB = 'goddess'; if(next) next(); else render(); });
}
// A house she has something to say about (bought mid-cycle): appended to the deed event from cycle 2 on.
function goddessHouseNote(id){
  const t = (HOUSES[id]||{}).goddess; if(!t || ((S.cycle||1) < 2 && !G().bound) || G().left) return '';
  return `\n\nSomewhere behind Sam, a warm voice: ${gtxt(t, {house: HOUSES[id].name})}`;
}

/* ---------- weekly: before the houses run (her actions) and after (income, events, drift) ---------- */
function goddessPlan(){
  GW = {biz:{}, watch:{}, saved:0, lines:[], hl:[]};
  const g = G(); if(!goddessActive()) return;
  const A = GB().actions || {}, M = GB().mood || {}, p = goddessPower(), n = goddessActions();
  const lines = GW.lines, W = S.workers.filter(w=>w.job!=='rest' || (w.lust||0) > 0);
  const F = GOD.focus || {}, form = () => g.form==='auto' ? pick(['fem','futa']) : g.form;
  if(g.shape==='auto') g.autoShape = pick(Object.keys(GOD_FORMS));   // a new form each week
  for(let i=0; i<n; i++){
    let kind = g.focus;
    const claim = (g.jealousy||0) / ((A.claim||{}).per ?? 150);
    if(Math.random() < claim) kind = 'claim';
    else if((g.mood||0) < (M.ignoreBelow ?? 35) && Math.random() < 0.5) kind = 'whim';
    let mul = 1;
    if(kind==='whim'){ kind = pick(['indulge','business','watch','tutelage']); mul = (A.whim||{}).mult ?? 1.25; }
    const q = p * mul;
    if(kind==='indulge'){
      const I = A.indulge || {}, ladies = W.slice().sort((a,b)=>((b.lust||0) - b.mood/2) - ((a.lust||0) - a.mood/2)).slice(0, I.ladies ?? 2);
      ladies.forEach(w=>{ w.lust = Math.max(0, (w.lust||0) - (I.lust ?? 30) * q); fitLust(w); moodAdd(w, (I.mood ?? 8) * q);
        w.energy = clamp(w.energy + (I.energy ?? 15) * q, 0, maxEnergy(w)); lewdUp(w, (I.lewd ?? 1) * q); countUp(w, 'goddess');
        const f = form(), act = goddessActFor(w, f); if(act) growAct(w, act, (I.practice ?? 2) * q);
        const t = gSvcLine(act, f, w.name.split(' ')[0]) || gtxt(((F.indulge||{})[f]) || (F.indulge||{}).report, {lady:w.name.split(' ')[0]});
        lines.push(t); if(act) GW.hl.push({wid:w.id, text:t, act, scene:`pair:${act}:${f}:${godId()}`, noAi:true}); });
    } else if(kind==='business'){
      const B = A.business || {}, h = pick(S.houses);
      GW.biz[h.id] = (GW.biz[h.id]||0) + (B.income ?? 0.06) * q; repAdd(h, (B.rep ?? 1) * q);
      lines.push(gtxt((F.business||{}).report, {house:h.name}));
    } else if(kind==='watch'){
      const Wt = A.watch || {}, L = S.lastReport, worst = L && L.houses ? L.houses.slice().sort((a,b)=>((b.pushy||{}).total||0) - ((a.pushy||{}).total||0))[0] : null;
      const h = (worst && H(worst.id)) || pick(S.houses);
      GW.watch[h.id] = Math.min(Wt.max ?? 0.9, (GW.watch[h.id]||0) + (Wt.chance ?? 0.5) * q);
      lines.push(gtxt((F.watch||{}).report, {house:h.name}));
    } else if(kind==='tutelage'){
      const T = A.tutelage || {}, pool = S.workers.filter(w=>w.job!=='rest'); if(!pool.length) continue;
      const w = pool.slice().sort((a,b)=>(a.tech[trainSkillOf(a)]||0) - (b.tech[trainSkillOf(b)]||0))[0];
      grow(w, trainSkillOf(w), (T.skill ?? 3) * q); const st = trainStatsOf(w); if(st.length) statXP(w, pick(st)[0], (T.stat ?? 25) * q);
      lines.push(gtxt((F.tutelage||{}).report, {lady:w.name.split(' ')[0], skill:(TECH_LABEL[trainSkillOf(w)]||'her craft').toLowerCase()}));
    } else if(kind==='claim'){
      const C = A.claim || {}, newest = S.workers.filter(w=>!w.isPartner).slice(-3);
      if(Math.random() < 0.5 || !newest.length){
        S.sam.energy = Math.max(0, S.sam.energy - (C.samEnergy ?? 15)); g.jealousy = clamp(g.jealousy - (C.cut ?? 10)); g.love = clamp(g.love + 1);
        lines.push(gtxt((GOD.claim||{}).sam));
      } else {
        const w = pick(newest); g.claimWk = S.week; moodAdd(w, C.mood ?? -4); w.energy = clamp(w.energy - 10, 0, maxEnergy(w)); g.jealousy = clamp(g.jealousy - (C.cut ?? 10) / 2);
        lines.push(gtxt((GOD.claim||{}).lady, {lady:w.name.split(' ')[0]}));
      }
    }
  }
}
// pushyCheck: she was watching this house and steps in before anyone else has to
function goddessGuard(h){ const c = GW.watch && GW.watch[h.id]; if(c && Math.random() < c){ GW.saved++; return true; } return false; }
function goddessAfter(R){
  const g = G(), J = GB().jealousy || {}, M = GB().mood || {};
  // her share of the takings (business focus)
  if(goddessActive()){
    let add = 0; (R.houses||[]).forEach(hr=>{ const b = GW.biz[hr.id]; if(b) add += Math.round(hr.income * b); });
    if(add){ R.income += add; S.gold += add; R.godBiz = add; }
    GW.lines.forEach(t=>R.lines.push(`✨ ${t}`)); GW.hl.forEach(e=>R.hl.push(e));   // her nights with the ladies, with a picture, on their pages
    if(add) R.lines.push(`✨ ${GN()} brought in an extra ${fmt(add)}.`);
    if(GW.saved) R.lines.push(`✨ ${gtxt((GOD.focus||{}).watch && GOD.focus.watch.saved, {n:GW.saved})}`);
    g.last = GW.lines.slice(0, 8);
  }
  if(g.left) return;
  // jealousy: new faces, private time with others, a crowded roster; time fades it a little
  const hires = Math.max(0, S.workers.length - (g.roster||0)); g.roster = S.workers.length;
  const priv = (S.samWeek.acts||[]).filter(a=>/^(Private time|A night with|Swept off|A visit from|Demonstration|Took the next step)/.test(a)).length;
  g.jealousy = clamp((g.jealousy||0) + hires * (J.perHire ?? 3) + priv * (J.perPrivate ?? 1) + Math.max(0, S.workers.length - (J.rosterRef ?? 6)) * (J.perLady ?? 0.15) - (J.decay ?? 2));
  const target = (M.base ?? 55) + (g.love||0) * (M.perLove ?? 0.25) - (g.jealousy||0) * (M.perJealous ?? 0.3);
  g.mood = clamp((g.mood||0) + (target - (g.mood||0)) * (M.drift ?? 0.3));
  // neglect (after the binding): too long without a night costs love and mood; a jealous claim left unanswered costs more
  if(goddessActive()){
    const Ng = GB().neglect || {}, since = S.week - (g.lastNight || S.week);
    if(since >= (Ng.after ?? 3)){ g.love = clamp(g.love - (Ng.love ?? 3)); g.mood = clamp(g.mood - (Ng.mood ?? 5)); R.lines.push(`✨ ${gtxt(GOD.neglect && GOD.neglect.ignored || '{goddess} hasn\'t seen Sam in {n} weeks. She\'s noticed.', {n:since})} (love −${Ng.love ?? 3})`); }
    if(g.claimWk && S.week - g.claimWk >= (Ng.claimWeeks ?? 2)){
      if((g.lastNight||0) < g.claimWk){ g.love = clamp(g.love - (Ng.claimLove ?? 8)); g.mood = clamp(g.mood - (Ng.claimMood ?? 10)); R.lines.push(`✨ ${gtxt(GOD.neglect && GOD.neglect.claim || '{goddess} made a scene and Sam never came to her. That hurt.')} (love −${Ng.claimLove ?? 8})`); }
      g.claimWk = 0;
    }
  }
  // events: none in cycle 1, a little more often each cycle after (before the binding: her teases and remarks)
  const E = GB().events || {};
  if(!g.bound){
    // behind on her story (unseen scenes from earlier cycles): she turns up more often until he has caught up
    const late = gOverdue(), C = E.catchUp || {};
    const ch = Math.min((E.max ?? 0.35) + (late ? (C.max ?? 0.15) : 0), (E.base ?? 0) + (E.perCycle ?? 0.07) * ((S.cycle||1) - 1) + Math.min(C.cap ?? 0.3, late * (C.per ?? 0.05)));
    if(S.week - (g.evWk||0) >= (late ? (C.gap ?? 1) : (E.gap ?? 2)) && Math.random() < ch){ g.evWk = S.week; EVQ.push(evGoddess); }
  } else if(!g.ending && (g.divinity||0) >= ((GB().divinity||{}).max ?? 100)){ EVQ.push(evGoddessEnd); }
  else if(goddessActive() && S.week - (g.evWk||0) >= (E.gap ?? 2) && Math.random() < (E.bound ?? 0.15) * (0.5 + g.jealousy/100)){ g.evWk = S.week; EVQ.push(evGoddessRemark); }
}

/* ---------- before the binding: teases (in order, gated by cycle) and jealous remarks ---------- */
// Before the binding she turns up in disguise: another race's form each time (same hair, eyes and skin), going by an alias.
// teases (goddess.json): story scenes play in file order, each once, from minCycle on. maxCycle is when a scene is
// "due": a story scene missed by then stays available (and makes her turn up more often, gOverdue) so the story
// always moves forward. repeat: true ones are filler, gated by minCycle-maxCycle, and only play once every story
// scene unlocked so far has been seen.
// form: 'disguise' (any form but her own), 'true', or a form key. reveal: true = Sam has worked it out (g.knows).
const gKnowOK = t => (!t.needKnows || G().knows) && (!t.unknown || !G().knows);
const gEligible = t => t.repeat ? (t.minCycle||1) <= (S.cycle||1) && (t.maxCycle||99) >= (S.cycle||1) && gKnowOK(t)
                                : (t.minCycle||1) <= (S.cycle||1) && gKnowOK(t);
// unseen story scenes, in order (minCycle reached, not yet seen); the next one is the first eligible
const gFresh = () => (GOD.teases||[]).filter(t=>!t.repeat && !(G().teases||[]).includes(t.id) && (t.minCycle||1) <= (S.cycle||1));
// how many story scenes are past due (their maxCycle is behind the current cycle)
const gOverdue = () => gFresh().filter(t=>(t.maxCycle||99) < (S.cycle||1)).length;
function gDisguise(){ const ks = Object.keys(GOD_FORMS).filter(k=>k!==GOD_TRUE), g = G(); const k = pick(ks.filter(x=>x!==g.lastDisguise).length ? ks.filter(x=>x!==g.lastDisguise) : ks); g.lastDisguise = k; return k; }
function evGoddess(){
  const g = G(); if(g.bound || g.left) return null;
  const all = GOD.teases || [], pending = gFresh(), fresh = pending.filter(gEligible), rep = all.filter(t=>t.repeat && gEligible(t));
  const canRemark = (S.cycle||1) >= (GOD.remarksFrom ?? 3) && (GOD.remarks||{})[jTier()];
  // story first; filler (and remarks) only once every unlocked story scene has played
  const T = fresh[0] || (!pending.length && rep.length && Math.random() < 0.7 ? pick(rep) : null);
  if(!T) return canRemark ? evGoddessRemark() : null;
  const fk = T.form==='true' ? GOD_TRUE : GOD_FORMS[T.form] ? T.form : gDisguise(), F = GOD_FORMS[fk] || {};
  const ctx = {house:curH().name, n:S.workers.length, alias:F.alias || GN(), form:F.desc || 'a woman', race:(F.label||'').toLowerCase(), times:(g.met2||0)};
  const sc = T.image ? dynScene('goddess_' + T.id + (T.form==='disguise' ? '_' + fk : ''), T.image) : 'portrait';
  return {title: gtxt(T.title, ctx), who:godNpcId(fk), scene:sc, text: gtxt(T.text, ctx), choices:(T.choices||[{label:'…'}]).map(c=>({label:gtxt(c.label, ctx), fx(){
    if(!T.repeat) g.teases = [...(g.teases||[]), T.id];
    g.met2 = (g.met2||0) + 1; if(T.reveal || c.reveal) g.knows = true;
    g.love = clamp((g.love||0) + (c.love||0)); g.jealousy = clamp((g.jealousy||0) + (c.jealousy||0));
    if(c.energy) samEnergyAdd(c.energy);
    return gtxt(c.res, ctx);
  }}))};
}
function evGoddessRemark(){
  const g = G(); if(g.left) return null;
  const R = (GOD.remarks||{})[jTier()] || []; if(!R.length) return null;
  const r = pick(R), newest = S.workers[S.workers.length-1];
  if(!g.bound && (S.cycle||1) < (GOD.remarksFrom ?? 3)) return null;
  const ctx = {lady: newest ? newest.name.split(' ')[0] : 'her', n: S.workers.length, house: curH().name};
  return {title: `${GN()}`, who:godId(), scene:'portrait', text: gtxt(r.text || r, ctx), choices:(r.choices || GOD.remarkChoices || [{label:'…'}]).map(c=>({label:gtxt(c.label), fx(){
    g.love = clamp((g.love||0) + (c.love||0)); g.jealousy = clamp((g.jealousy||0) + (c.jealousy||0)); return gtxt(c.res, ctx); }}))};
}
// The end of her story: full divinity again. She stays if she loves him enough; otherwise she goes.
function evGoddessEnd(){
  const g = G(); if(g.ending || !g.bound) return null;
  const stay = (g.love||0) >= ((GB().love||{}).stay ?? 70), E = (GOD.ending||{})[stay ? 'stay' : 'leave'] || {};
  return {title: gtxt(E.title || (stay ? 'She stays' : 'She goes')), who:godId(), scene: E.image ? dynScene('goddess_end_' + (stay?'stay':'leave'), E.image) : 'portrait', text: gtxt(E.text),
    choices:[{label: gtxt(E.button || '…'), fx(){ g.ending = stay ? 'stay' : 'leave'; if(!stay){ g.left = true; if(TAB==='goddess') TAB = 'sam'; }
      addLog(stay ? `${GN()} is whole again, and chose to stay.` : `${GN()} is whole again, and gone.`); return gtxt(E.res); }}]};
}

/* ---------- her tab (after the binding) ---------- */
function setGFocus(k){ if(GFOCUS.includes(k)){ G().focus = k; save(); render(); } }
function setGShape(k){ if(k==='auto' || GOD_FORMS[k]){ G().shape = k; save(); render(); } }
function setGForm(k){ if(['auto','fem','futa'].includes(k)){ G().form = k; save(); render(); } }
/* ---------- nights with Sam: a service, as herself ---------- */
// Her line with a lady: services.json → pair.fem / pair.futa of that service ({name} = the lady, {partner} = the goddess).
function gSvcLine(act, ctx, lady){
  const P = ((actById(act)||{}).pair||{})[ctx]; if(!P || !P.length) return '';
  return pick(P).replace(/\{name\}/g, lady).replace(/\{partner\}/g, GN());
}
// Which service she shares with a lady: in her female form only tier 1-2; the lady's favorite if it fits, else the furthest the lady is comfortable with.
function goddessActFor(w, form){
  const top = form==='futa' ? 3 : 2, ok = getActs().filter(a=>actTier(a.id) <= top && (a.th||0) <= (w.lewd||0) + 15);
  if(!ok.length) return null;
  if(w.fav && ok.some(a=>a.id===w.fav)) return w.fav;
  return ok.sort((a,b)=>(b.th||0)-(a.th||0))[0].id;
}
// What a night does: 'inside' (a finishing tier-3 service) restores everything, 'outside' (he finishes, not inside her) a little, 'none' upsets her.
const gNightKind = act => { const A = actById(act) || {}; return A.finish ? (actTier(act) >= 3 ? 'inside' : 'outside') : 'none'; };
function goddessNightMenu(){
  if(!goddessActive()) return;
  const lab = {inside:'✨ divinity', outside:'he finishes', none:'she won\'t like it'};
  modal(`<h2>A night with ${esc(GN())}</h2><p class="muted">She'll do anything. She only gets her divinity back when Sam finishes inside her; anything that leaves her wanting costs her mood and love.</p>
    <div class="row" style="flex-wrap:wrap">${getActs().map(a=>{ const k = gNightKind(a.id); return `<button ${k==='inside'?'class="primary"':''} onclick="goddessNight('${a.id}')">${esc(a.label)} <span class="muted">(${lab[k]})</span></button>`; }).join('')}</div>`);
}
function goddessNight(act){
  const g = G(), N = GB().night || {}, D = GB().divinity || {}, L = GB().love || {}; if(!goddessActive() || !actById(act)) return;
  if(!useAP(N.cost ?? 10)) return;
  const kind = gNightKind(act), before = g.divinity||0, l0 = g.love||0;
  let back = 0;
  if(kind==='inside'){
    back = Math.round((N.restore ?? 20) + (N.perDiv ?? 0.3) * before);
    g.divinity = Math.min(D.max ?? 100, before + (D.finish ?? 3)); g.finishes = (g.finishes||0) + 1;
    g.love = clamp(l0 + (L.night ?? 2)); g.mood = clamp((g.mood||0) + (N.mood ?? 8)); g.jealousy = clamp((g.jealousy||0) - ((GB().jealousy||{}).nightCut ?? 15));
  } else if(kind==='outside'){
    back = Math.round((N.restore ?? 20) / 2);
    g.love = clamp(l0 + (L.outside ?? 0.5)); g.mood = clamp((g.mood||0) + (N.outsideMood ?? -2)); g.jealousy = clamp((g.jealousy||0) - ((GB().jealousy||{}).nightCut ?? 15) / 2);
  } else {
    g.love = clamp(l0 - (N.noneLove ?? 2)); g.mood = clamp((g.mood||0) - (N.noneMood ?? 8));
  }
  if(back) samEnergyAdd(back);
  g.nights = (g.nights||0) + 1; g.lastNight = S.week; if(g.claimWk && kind!=='none') g.claimWk = 0;
  samLog(`Night with ${GN()} [${actLabel(act)}]`); samStat('technique', 2); samXP(5);
  const nt = GOD.night || {}, ctx = {act: actLabel(act).toLowerCase()};
  const res = kind==='inside' ? `Sam's energy +${back} · ${GN()}'s divinity ${Math.round(before)} → ${Math.round(g.divinity)} · love +`
    : kind==='outside' ? `Sam's energy +${back} · no divinity this time; she noticed.` : `No divinity, and she's not pleased (mood and love −).`;
  const txt = gpara(gtxt((nt.open||{})[dTier()], ctx), actLine(act, {name:GN()}), gtxt(nt[kind==='inside' ? 'inside' : kind==='outside' ? 'outside' : 'unhappy'] || nt.finish, ctx), res);
  save(); render();
  showResult(`A night with ${GN()}`, txt, godId(), 'samact:' + act);
  if(g.divinity >= (D.max ?? 100) && !g.ending){ EVQ.push(evGoddessEnd); }
}
function viewGoddess(){
  const g = G(), F = GOD.focus || {}, B = GB(), next = (B.divinity||{}).perAction || 25;
  const cell = (l, v) => `<div><span>${l}</span><b>${v}</b></div>`;
  return `<section class="card"><h2>✨ ${esc(GN())} <span class="muted">${esc(GOD.title||'')}</span></h2>
      <div class="row"><div id="gPort" style="max-width:260px"></div><div style="flex:1">
      <p class="muted">${esc(gtxt(GOD.tabBlurb || ''))}</p>
      ${bar('Divinity', g.divinity||0, (B.divinity||{}).max ?? 100, 't')}${bar('Love', g.love||0, 100, 'p')}${bar('Jealousy', g.jealousy||0, 100, 'h')}${bar('Mood', g.mood||0, 100, 'm')}
      <div class="sgrid">${cell('ACTIONS / WEEK', goddessActions())}${cell('POWER', '×'+goddessPower().toFixed(2))}${cell('FULLY REBORN', rebornFull().length)}${cell('NIGHTS', g.nights||0)}</div>
      <p class="muted">${goddessActions() < 5 ? `Next action at divinity ${Math.ceil(((g.divinity||0)+1)/next)*next}. ` : ''}Every fully reincarnated lady (and every life past that) makes her stronger. With the ladies she takes over their services herself. A jealous ${esc(GN())} sometimes goes her own way; an unhappy one ignores your guidance.</p>
      <button class="sm" onclick="showImg('gPort','${godId()}','portrait')">🎨 Portrait</button></div></div></section>
    <section class="card"><h2>Guidance</h2><p class="muted">You can't tell a goddess what to do. You can tell her what you'd like. She picks what she actually does each week.</p>
      <div class="grid">${GFOCUS.map(k=>{ const f = F[k]||{}; return `<div class="pick ${g.focus===k?'sel':''}" onclick="setGFocus('${k}')"><b>${esc(f.label||k)}</b><div class="muted">${esc(f.desc||'')}</div></div>`; }).join('')}</div>
      <div class="row" style="margin-top:8px">Her form: <select onchange="setGShape(this.value)"><option value="auto" ${g.shape==='auto'?'selected':''}>A different one each week</option>${Object.entries(GOD_FORMS).map(([k,f])=>`<option value="${k}" ${g.shape===k?'selected':''}>${esc(f.label||k)}</option>`).join('')}</select>
      &nbsp;With the ladies she's <select onchange="setGForm(this.value)">${[['auto','as she pleases'],['fem','a woman'],['futa','something more']].map(([k,l])=>`<option value="${k}" ${g.form===k?'selected':''}>${l}</option>`).join('')}</select></div></section>
    <section class="card"><h2>Sam and ${esc(GN())}</h2><div class="row"><button class="primary" onclick="goddessNightMenu()">🌙 Spend the night…</button></div>
      <p class="muted">When Sam finishes inside her, a night restores his energy, rebuilds her divinity and raises her love and mood. Leave her wanting and she sulks. ${(()=>{ const n = S.week - (g.lastNight||S.week), a = (B.neglect||{}).after ?? 3; return n >= a - 1 ? `<span class="warn">It's been ${n} week${n===1?'':'s'}; she won't wait much longer.</span>` : 'She loses love if Sam stays away too long (or ignores her after she makes a jealous scene).'; })()}</p></section>
    ${(g.last||[]).length ? `<section class="card"><h2>Last week</h2>${g.last.map(t=>`<div>✨ ${esc(t)}</div>`).join('')}</section>` : ''}`;
}
