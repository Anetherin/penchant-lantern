'use strict';
/* =====================================================================
   GAME STATE
   ===================================================================== */
// A house's base debt (economy.json → houses.<id>.debt) x balance.json → debt.houseMult. Cycle 1 starts with it; NG+ shares are built from it too.
// Cycle 1's starting debt: the house's, less a partner's partnerDebtCut (named data, e.g. Marisol talks the Credit House down).
const startDebt = (house, partner) => Math.round(houseDebt(house) * (1 - (((typeof NAMED!=='undefined' && NAMED[partner]) || {}).partnerDebtCut || 0)));
const houseDebt = id => Math.round(((HOUSES[id]||{}).debt || 0) * ((BAL.debt||{}).houseMult ?? 1));
const NPCS = {
  npc_marguerite:{id:'npc_marguerite', name:'Marguerite Vane', race:'human', sub:'', age:38,
    design:{build:'tall and lean',hairStyle:'severe bun',hairColor:'black',eyes:'steel-grey',skin:'pale',features:'thin red lips',accessories:'a silver monocle',expression:'a cool, appraising gaze'}, outfit:'custom', customOutfit:'a tailored black coat with silver buttons', under:'plain', imgVar:{}, seed:4417021, lewd:0, trust:0, traits:[]},
  npc_isolde:{id:'npc_isolde', name:'Lady Isolde Thorne', race:'demon', sub:'', age:260,
    design:{build:'statuesque',hairStyle:'long curly',hairColor:'crimson',eyes:'violet',skin:'ash-grey',features:'long curved horns and a slender spade-tipped tail',accessories:'gold cuffs on her horns',expression:'an aristocratic, haughty smile'}, outfit:'custom', customOutfit:'a black and red velvet gown', under:'plain', imgVar:{}, seed:8812230, lewd:0, trust:0, traits:[]}
};
Object.assign(NPCS, {
  npc_silas:{id:'npc_silas', male:true, name:'Silas Grieve', seed:5512, look:'a broad-shouldered man in his forties with a scarred jaw, slicked-back black hair, an expensive dark coat and a menacing smile'},
  npc_gerhardt:{id:'npc_gerhardt', male:true, name:'Baron Gerhardt Kessel', seed:6613, look:'a pompous middle-aged baron with a waxed mustache, too many rings, and a fur-trimmed coat'},
  npc_kurogane:{id:'npc_kurogane', male:true, name:'Master Kurogane', seed:7714, look:'a stern older innkeeper with a grey topknot and a black haori bearing a golden crane crest'},
  npc_borgrum:{id:'npc_borgrum', male:true, name:'Borgrum the Hill Giant', seed:8815, look:'an enormous hill giant with a braided beard, a barrel-sized tankard and a booming grin'},
  npc_valois:{id:'npc_valois', male:true, name:'Maestro Valois', seed:9916, look:'a thin, elegant elven critic with a monocle, a feathered quill and a disdainful expression'},
  npc_thackery:{id:'npc_thackery', male:true, name:'Master Artificer Thackery', seed:2120, look:'a stiff, grey-whiskered guild artificer in a leather master\'s apron over a waistcoat, brass loupe pushed up on his forehead, a sour pinched expression'},
  npc_oskar:{id:'npc_oskar', male:true, name:'Red Oskar', seed:1017, look:'a rugged bandit chief with a red beard, an eyepatch and a battered leather coat'}
});
function storyNpc(key){ const id='n_'+key; if(!NPCS[id]) NPCS[id] = makeNamed(key); return id; }
const H = id => S.houses.find(h=>h.id===id);
const curH = () => H(S.cur) || S.houses[0];
const houseOf = w => (S && (H(w.house) || S.houses[0])) || null;
function makeHouse(id){ const D = HOUSES[id], h = {id, name:D.name, rooms:D.rooms, quarters:D.quarters, beds:D.beds, tier:D.tier, up:clone(D.up), damaged:D.damaged||0, tidy:BAL.tidy.start, price:1, rep:D.rep, prestige:D.prestige ?? 50, since:S?S.week:1, story:{beat:0,wk:0}, bonus:{}, spent:0, decor:0, drinks:0, teachSkill:null, wsDisc:0, incense:'calm'}; if(D.ngppOnly) h.ngppLevel = Math.max(1, (S && S.ngppCycle) || 1); return h; }
function snapshotNgppHouse(h){
  return {rooms:h.rooms, quarters:h.quarters, beds:h.beds, extraBeds:h.extraBeds||0, tier:h.tier, up:clone(h.up||{}), damaged:h.damaged||0, annex:!!h.annex, decor:h.decor||0, drinks:h.drinks||0, incense:h.incense||'calm', spent:Math.round(h.spent||0), story:clone(h.story||{beat:0,wk:0})};
}
function restoreNgppHouse(h, snap){
  if(!h || !snap) return h;
  ['rooms','quarters','beds','extraBeds','tier','damaged','annex','decor','drinks','incense','spent'].forEach(k=>{ if(snap[k]!==undefined) h[k] = snap[k]; });
  if(snap.up) h.up = clone(snap.up);
  if(snap.story) h.story = clone(snap.story);
  return h;
}
function ngppSavedCost(id){
  if(!S || !(S.ngppCycle > 0) || !S.ngppHouses || !S.ngppHouses[id]) return 0;
  return Math.round((S.ngppHouses[id].spent || 0) * ((BAL.ngplus && BAL.ngplus.improveShare) ?? 1));
}
function newGame(cfg){
  const HD = HOUSES[cfg.house];
  S = { v:41, samFocus:{kind:'office', topic:'auto'}, cloudId: cfg.cloudId || ('run_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6)), cloudName: (cfg.cloudName || '').trim() || HD.name, localSavedAt: Date.now(), cloudSyncedAt: 0, samHome:cfg.house, samUps:{}, starters:[cfg.house], houseWardrobe:[], houseUnder:[], closets:{}, week:1, gold:600, rep:HD.rep, ap:3, cur:cfg.house, home:cfg.house, cycle:1, ngppCycle:0, ngppHouses:{}, townEv:null, townEvNext:(BAL.townEvents||{}).firstWeek ?? 4, challenge:null, challengePerks:[], vessels:[], boons:[], past:cfg.past, pasts:[cfg.past], partner:cfg.partner, partners:[cfg.partner],
    houses:[makeHouse(cfg.house)],
    sam:{energy:100, ...BAL.sam.base, appraisal:1, appXP:0, first:true, lvl:1, xp:0},
    samWeek:{security:0, books:false, income:0, acts:[]},
    debt:{total:startDebt(cfg.house, cfg.partner), remaining:startDebt(cfg.house, cfg.partner), carry:0, strikes:0},
    workers:[], candidates:[], alumni:[], log:[],
    flags:{taunt:false, poachCD:0}, lastReport:null, over:false, won:false };
  S.houses.forEach(h=>{ h.since = 1; h.story = {beat:0,wk:0}; });
  PASTS[cfg.past].fx(S.sam);
  const npc = makeNamed(HD.npc); npc.house = cfg.house; npc.locked = cfg.house; npc.contract = 999; npc.trust = clamp(npc.trust+10);
  const p = makeNamed(cfg.partner, true); p.house = cfg.house;
  S.workers.push(npc, p);
  assignStart(npc, NAMED[HD.npc].job); assignStart(p, ['courtesan','bartender','dancer','bath'].includes(NAMED[cfg.partner].job) ? NAMED[cfg.partner].job : 'courtesan');
  if(NAMED[cfg.partner].startGuild && typeof GLD==='function'){ const g = GLD(); g.joined = true; g.rank = Math.max(g.rank || 0, NAMED[cfg.partner].startGuildRank || 0); g.merit = Math.max(g.merit || 0, ((GDB.levels||[])[g.rank]||{}).merit || 0); guildRefreshBoard(); for(let r=0; r<=g.rank; r++) EVQ.push(()=>guildBeatEvent(r)); }   // she brings Sam to the Adventurers' Guild on day one (named data startGuild / startGuildRank; the skipped rank beats still play, so their unlocks arrive)
  refreshCandidates();
  checkUnlocks(true);
  addLog(`Sam Takahashi wakes up in Hollowmere with a deed to ${HD.name}, a debt, and a status window only he can see.`);
  save();
}
function assignStart(w, job){
  w.job = 'rest';
  job = safeJob(w, job);
  w.job = job;
  if(MENU_JOBS.includes(job)) w.menu = getActs().filter(a=>clientStance(w,a.id)==='yes').map(a=>a.id);
}
// Older saves: stats, skills and service skills were 0-100 and are now 0-1000; caress became kiss, manual/oral/paizuri became
// manual_give/oral_give/breast_give; dragonkin became beastkin (dragon).
function scaleWorker(w){
  const K = v => clampK((v||0)*SKL + ri(0,SKL-1));
  STAT_KEYS.forEach(k=>{ if(w.stats) w.stats[k] = K(w.stats[k]); }); TECH_KEYS.forEach(k=>{ if(w.tech) w.tech[k] = K(w.tech[k]); });
  Object.values(w.acts||{}).forEach(a=>{ a.skill = K(a.skill); });
}
// Traits and NG+ perks renamed or merged in v38 (null = dropped). Applied to every lady in a save, whatever its version.
const TRAIT_RENAME = {'Second Breath':'Tough', 'Breathtaking':'Striking', 'Crowd Magnet':'Memorable', 'Velvet Touch':'Bedroom Eyes', 'Lithe Dancer':'Supple',
  'Silver Barker':'Town Crier', 'Fleet Step':'Effortless', 'Second Wind':'Wellspring', 'Born Teacher':'Born Madame'};
const PAST_RENAME = {cook:'planner', otaku:'support'};
function renameTraits(w){ if(w) ['traits','ngPerks'].forEach(k=>{ if(Array.isArray(w[k]) && w[k].some(t=>TRAIT_RENAME[t]!==undefined)) w[k] = Array.from(new Set(w[k].map(t=>TRAIT_RENAME[t]!==undefined ? TRAIT_RENAME[t] : t).filter(Boolean))); }); }
function migrateWorker(w){
  renameTraits(w);
  // old service ids (caress, manual, oral, paizuri) -> current ids, everywhere a lady keys something by service
  Object.entries(ACT_ALIAS).forEach(([o,n])=>{
    if(w.acts && w.acts[o]){ w.acts[n] = w.acts[n] || w.acts[o]; delete w.acts[o]; }
    const sb = w.counts && w.counts.svcByAct; if(sb && sb[o]!==undefined){ sb[n] = (sb[n]||0) + sb[o]; delete sb[o]; }
    if(w.seen) ['c_','s_'].forEach(p=>{ if(w.seen[p+o]!==undefined){ w.seen[p+n] = w.seen[p+n] ?? w.seen[p+o]; delete w.seen[p+o]; } });
  });
  ['fav','dislike','lovers'].forEach(k=>{ if(w[k]) w[k] = actKey(w[k]); });
  if(w.menu) w.menu = Array.from(new Set(w.menu.map(actKey)));
  // titles used to be baked into names ('Professor Juniper'): split them off, and take the data name when it changed
  const ND = w.key && NAMED[w.key];
  if(ND && ND.title && !w.title && typeof w.name==='string' && w.name.startsWith(ND.title+' ')){ w.title = ND.title; w.name = ND.name; }
  if(w.race==='dragonkin'){ w.race = 'beastkin'; w.sub = 'dragon'; }
  // companion became courtesan, reception became promoter
  const JM = {companion:'courtesan', reception:'promoter'};
  if(JM[w.job]) w.job = JM[w.job]; if(JM[w.prevJob]) w.prevJob = JM[w.prevJob];
  ['jobLikes','jobDislikes'].forEach(k=>{ if(Array.isArray(w[k])) w[k] = Array.from(new Set(w[k].map(j=>JM[j]||j))); });
}
// Saves older than SAVE_MIN aren't converted any more (only the last few versions are). Callers check saveTooOld first.
const SAVE_MIN = 36;
const saveTooOld = s => !!s && (s.v || 0) < SAVE_MIN;
const tooOldMsg = s => `That save is from an older version (v${(s && s.v) || 0}) that this build no longer converts (v${SAVE_MIN}+ only).`;
function migrate(s){
  s.alumni = s.alumni || [];
  const ov = s.v || 0;
  (s.workers||[]).concat(s.candidates||[],s.alumni||[]).forEach(migrateWorker);
  s.pasts = Array.isArray(s.pasts) && s.pasts.length ? s.pasts : (s.past ? [s.past] : []);
  s.starters = s.starters || [s.home || (s.houses[0]||{}).id];
  s.houses.forEach(h=>{ if(h.drinks===undefined) h.drinks = 0; if(h.teachSkill===undefined) h.teachSkill = null; });
  s.houses.forEach(h=>{ if(h.decor===undefined) h.decor = 0; if(h.wsDisc===undefined) h.wsDisc = 0; if(!h.incense) h.incense = 'calm'; if(h.damaged===undefined) h.damaged = (HOUSES[h.id]||{}).damaged || 0; });
  s.closets = s.closets || {};
  if(ov < 37){   // house class / prestige
    s.houses.forEach(h=>{ if(h.prestige===undefined) h.prestige = ((HOUSES[h.id]||{}).prestige ?? 50); });
  }
  if(ov < 38){ (s.workers||[]).concat(s.candidates||[], s.alumni||[], Object.values(s.lives||{}), Object.values(s.vessels||{})).forEach(renameTraits); }   // renamed / merged traits and NG+ perks
  if(s.past && PAST_RENAME[s.past]) s.past = PAST_RENAME[s.past];
  if(Array.isArray(s.pasts)) s.pasts = Array.from(new Set(s.pasts.map(k=>PAST_RENAME[k] || k)));
  if(ov < 39 && !s.samFocus) s.samFocus = {kind:'office', topic:'auto'};   // v39: Sam's bar, watch, books and classes became a weekly focus
  if(ov < 40){   // v40: the guild became contracts and ranks; the Teleport Circle split (Speaking Stones = work reach); guild tools are earned, not bought
    const gf = (s.flags||{}).guild || 0;
    if(gf >= 1 && !s.guild){ const r = gf >= 3 ? 2 : gf >= 2 ? 1 : 0, L = ((DATA.guild||{}).levels)||[]; s.guild = {joined:true, rank:r, merit:(L[r]||{}).merit||0, fame:0, board:[], active:[], done:{}, samDone:{}, next:1}; }
    if(s.flags) delete s.flags.guild;
    if(s.samUps && s.samUps.circle) s.samUps.stones = true;   // owners of the old circle keep both halves
  }
  if(ov < 41){   // v41: the NG+ cycle variable became town events that come and go inside every cycle; unused flags dropped
    delete s.cycleVar;
    if(s.townEvNext === undefined) s.townEvNext = (s.week || 1) + ((BAL.townEvents||{}).firstWeek ?? 4);
    if(s.flags){ delete s.flags.partnerCD; delete s.flags.hilde; delete s.flags.walks; delete s.flags.walkNoPartner; }
  }
  s.townEv = s.townEv || null;
  s.guildPerks = s.guildPerks || [];
  s.v = 41; s.samUps = s.samUps || {}; s.houseWardrobe = s.houseWardrobe || []; s.houseUnder = s.houseUnder || []; s.home = s.home || (s.houses[0]||{}).id; s.samHome = s.samHome || s.home || (s.houses[0]||{}).id; s.cycle = s.cycle || 1; s.ngppCycle = s.ngppCycle || 0; s.ngppHouses = s.ngppHouses || {}; s.challenge = s.challenge || null; s.challengePerks = s.challengePerks || []; s.vessels = s.vessels || []; s.boons = s.boons || []; s.partners = s.partners || (s.partner ? [s.partner] : []);
  s.regulars = s.regulars || []; s.bonds = s.bonds || {}; s.flags = s.flags || {};
  s.sam.lvl = s.sam.lvl || 1; s.sam.xp = s.sam.xp || 0;
  s.houses.forEach(h=>{ if(h.tidy===undefined) h.tidy = BAL.tidy.start; if(h.prestige===undefined) h.prestige = ((HOUSES[h.id]||{}).prestige ?? 50); h.since = h.since || 1; h.story = h.story || {beat:0,wk:0}; h.bonus = h.bonus || {}; if(h.spent===undefined) h.spent = 0;
    Object.keys(HOUSES[h.id].up||{}).forEach(k=>{ if(!h.up[k]) h.up[k] = true; });   // built-in amenities added to a house later (e.g. Hollowmere's Tethering Stone)
    if(h.quarters===undefined){ h.quarters = Math.max(HOUSES[h.id].quarters, Math.ceil((s.workers||[]).filter(w=>w.house===h.id).length/2)); h.beds = HOUSES[h.id].beds; }
    (s.workers||[]).forEach(w=>{ if(w.key===HOUSES[h.id].npc){ w.locked = h.id; w.house = h.id; } }); });
  s.samWeek = Object.assign({security:0,books:false,income:0,acts:[]}, s.samWeek||{}); if(!s.samWeek.acts) s.samWeek.acts=[];
  (s.workers||[]).concat(s.candidates||[],s.alumni||[]).forEach(w=>{ if(w.key && NAMED[w.key] && (!w.outfit || w.outfit==='custom' || !WARDROBE[w.outfit])){ w.outfit='sig_'+w.key; w.owned=Array.from(new Set([...(w.owned||[]),'sig_'+w.key])); } ensureWorker(w); if(!w.house) w.house = s.houses[0].id; });
  if(typeof ensureCloudRun === 'function') ensureCloudRun(s);
  if(s.lastReport && !s.lastReport.v5) s.lastReport = null;
  return s;
}
function save(){ if(S){ enforceTrustCaps(); if(typeof ensureCloudRun === 'function') ensureCloudRun(S); S.localSavedAt = Date.now(); store.set(KEY_SAVE, S, saveReplacer); } }
function saveSettings(){ store.set(KEY_SET, SET); }
function saveLib(){ store.set(KEY_LIB, LIB); }
function addLog(t){ S.log.unshift({wk:S.week, t}); if(S.log.length>250) S.log.length=250; }
function note(t){ addLog(t); toast(t); }
const findW = id => S.workers.find(w=>w.id===id);

function refreshCandidates(extra=0, quality=1){
  // guests (drifters) wait stayWeeks among the candidates, then move on
  S.candidates = S.candidates.filter(c=>{
    if(c.friend) return true;
    if(c.key && NAMED[c.key] && NAMED[c.key].role==='drifter'){ if(c.stay===undefined) c.stay = 1; c.keep = false; if(--c.stay>0) return true; addLog(`${c.name} moved on.`); return false; }
    return c.keep;
  });
  const bonus = S.houses.reduce((a,h)=>a+(HOUSES[h.id].recruit||0),0);
  for(let i=0;i<3+extra+bonus;i++){ const c = genWorker({quality: quality*(0.85 + S.rep/200 + ((S.sam.lvl||1)-1)*0.02)}); c.signing = signingFor(c); S.candidates.push(c); }
  if(SET.libraryInPool && LIB.length && Math.random()<0.25){
    const src = pick(LIB);
    if(!allNames().includes(src.name)){ const c = ensureWorker(clone(src)); c.id=uid(); c.keep=false; c.signing=signingFor(c); S.candidates.push(c); }
  }
  inviteFriend(false);
  // Partners are now encountered on walks (js/events/walks.js) rather than appearing in Candidates automatically.
  // drifters / visiting guests (data/guests.json) wander in now and then, stay a while, and can come back later
  const seen = S.flags.guestSeen = S.flags.guestSeen || {}, V = GUEST_VISITS;
  const drift = Object.keys(NAMED).filter(k=>NAMED[k].role==='drifter' && !isHired(k) && !(SET.packsOff||{})[NAMED[k].pack]
    && S.week - (seen[k] ?? -999) >= V.stayWeeks + V.cooldownWeeks);
  // dry spells shorten: each week without a guest adds visits.pity to the chance (at most visits.maxChance)
  const dry = Math.max(0, S.week - (S.flags.lastGuest ?? S.week)), gch = Math.min(V.maxChance ?? 0.8, V.chance + (V.pity ?? 0) * dry);
  if(S.flags.lastGuest === undefined) S.flags.lastGuest = S.week;
  if(drift.length && Math.random()<gch){
    const k = pick(drift), c = makeNamed(k); c.keep = false; c.stay = V.stayWeeks; seen[k] = S.week; S.flags.lastGuest = S.week;
    c.signing = signingFor(c); S.candidates.push(c); addLog(`${c.name} is passing through Hollowmere and looking for work. (Candidates)`);
  }
}
// NG+ old friends (S.alumni): one turns up among the candidates now and then, extra to the normal ones, and stays until hired.
function inviteFriend(force){
  const F = BAL.ngplus.friends || {}, al = S.alumni = S.alumni || [];
  if(!al.length || S.candidates.filter(c=>c.friend).length >= (F.max||2) || !force && Math.random() >= (F.chance ?? 0.5)) return;
  const c = pick(al); S.alumni = al.filter(x=>x!==c);
  c.keep = true; c.friend = true; c.signing = c.wasLover ? 0 : signingFor(c); S.candidates.push(c);
  addLog(`${c.name} ${c.wasLover ? 'still remembers what you shared' : 'remembers you from another life'} and is looking for work. (Candidates)`);
}
function addCandidates(n, quality=1){ for(let i=0;i<n;i++){ const c=genWorker({quality}); c.signing=signingFor(c); S.candidates.push(c); } }
function checkUnlocks(silent, sink){
  const msgs = [];
  S.workers.forEach(w=>{
    ensureWorker(w);
    getActs().forEach(a=>{
      if(canClient(w,a.id) && !w.seen['c_'+a.id]){ w.seen['c_'+a.id]=true; if(!silent) msgs.push(`${w.name} is now open to ${a.label} with clients.`); }
      if(canSam(w,a.id) && !w.seen['s_'+a.id]){ w.seen['s_'+a.id]=true; if(!silent) msgs.push(`${w.name} is now open to ${a.label} with Sam.`); }
    });
    CLOTH.forEach(c=>{ if(c.lv && clothOK(w,c.id,false) && !w.seen['w_'+c.id]){ w.seen['w_'+c.id]=true; if(!silent) msgs.push(`${w.name} is now comfortable ${c.id==='under'?'in her undergarments':c.label.toLowerCase()} for clients.`); } });
    spOutfitsOf(w).forEach(sk=>{
      const seenKey = sk === 'sp_'+w.key ? 'sp' : 'sp_'+sk;
      if(spUnlocked(w, sk) && !w.seen[seenKey]){ w.seen[seenKey]=true; if(!w.owned.includes(sk)) w.owned.push(sk); if(!silent) msgs.push(`${w.name} unlocked her special outfit: ${WARDROBE[sk].label}.`); }
    });
  });
  msgs.forEach(m=>addLog(m));
  if(sink){ msgs.forEach(m=>sink.push('🔓 '+m)); return; }
  if(msgs.length) toast(msgs[0] + (msgs.length>1 ? ` (+${msgs.length-1} more in the Log)` : ''));
}
// Payments (balance.json → debt) every `every` weeks, counted from when this debt started (New Game+ restarts the schedule).
// Payment n is total x share_n; shares ramp linearly from 1 to `ramp` and sum to 1. The last one clears whatever remains.
const debtWeek = () => S.week - (S.debt.start||0);
// NG+ loans can run on a tighter schedule (S.debt.payments / S.debt.ramp, set by ngBegin from balance.json → debt.ngplus); cycle 1 uses debt.payments/ramp.
const debtPlan = () => ({payments: (S && S.debt && S.debt.payments) || BAL.debt.payments, ramp: (S && S.debt && S.debt.ramp) || BAL.debt.ramp});
function debtShares(){ const D = debtPlan(), n = D.payments, w = Array.from({length:n}, (_,i)=> n>1 ? 1 + (D.ramp-1)*i/(n-1) : 1), t = w.reduce((a,b)=>a+b, 0); return w.map(x=>x/t); }
function nextDue(){
  const D = BAL.debt, r = debtWeek(), k = Math.max(1, Math.ceil(r/D.every));
  const amount = k>=debtPlan().payments ? S.debt.remaining : Math.min(S.debt.remaining, Math.round(S.debt.total*debtShares()[k-1]) + S.debt.carry);
  return {week:k*D.every + (S.debt.start||0), amount, n:k};
}
