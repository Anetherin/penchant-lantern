'use strict';
/* =====================================================================
   GAME STATE
   ===================================================================== */
const NPCS = {
  npc_marguerite:{id:'npc_marguerite', name:'Marguerite Vane', race:'human', sub:'', age:38,
    design:{build:'tall and lean',hairStyle:'severe bun',hairColor:'black',eyes:'steel-grey',skin:'pale',features:'a monocle and thin red lips'}, outfit:'custom', customOutfit:'a tailored black coat with silver buttons', under:'plain', imgVar:{}, seed:4417021, lewd:0, trust:0, traits:[]},
  npc_isolde:{id:'npc_isolde', name:'Lady Isolde Thorne', race:'demon', sub:'', age:260,
    design:{build:'statuesque',hairStyle:'long curly',hairColor:'crimson',eyes:'violet',skin:'ash-grey',features:'gold cuffs on her horns'}, outfit:'custom', customOutfit:'a black and red velvet gown', under:'plain', imgVar:{}, seed:8812230, lewd:0, trust:0, traits:[]}
};
Object.assign(NPCS, {
  npc_silas:{id:'npc_silas', male:true, name:'Silas Grieve', seed:5512, look:'a broad-shouldered man in his forties with a scarred jaw, slicked-back black hair, an expensive dark coat and a menacing smile'},
  npc_gerhardt:{id:'npc_gerhardt', male:true, name:'Baron Gerhardt Kessel', seed:6613, look:'a pompous middle-aged baron with a waxed mustache, too many rings, and a fur-trimmed coat'},
  npc_kurogane:{id:'npc_kurogane', male:true, name:'Master Kurogane', seed:7714, look:'a stern older innkeeper with a grey topknot and a black haori bearing a golden crane crest'},
  npc_borgrum:{id:'npc_borgrum', male:true, name:'Borgrum the Hill Giant', seed:8815, look:'an enormous hill giant with a braided beard, a barrel-sized tankard and a booming grin'},
  npc_valois:{id:'npc_valois', male:true, name:'Maestro Valois', seed:9916, look:'a thin, elegant elven critic with a monocle, a feathered quill and a disdainful expression'},
  npc_oskar:{id:'npc_oskar', male:true, name:'Red Oskar', seed:1017, look:'a rugged bandit chief with a red beard, an eyepatch and a battered leather coat'}
});
function storyNpc(key){ const id='n_'+key; if(!NPCS[id]) NPCS[id] = makeNamed(key); return id; }
const H = id => S.houses.find(h=>h.id===id);
const curH = () => H(S.cur) || S.houses[0];
const houseOf = w => (S && (H(w.house) || S.houses[0])) || null;
function makeHouse(id){ const D = HOUSES[id]; return {id, name:D.name, rooms:D.rooms, quarters:D.quarters, beds:D.beds, tier:D.tier, up:clone(D.up), tidy:BAL.tidy.start, price:1, rep:D.rep, since:S?S.week:1, story:{beat:0,wk:0}, bonus:{}, spent:0, decor:0, drinks:0, teachSkill:null, wsDisc:0, incense:'calm'}; }
function newGame(cfg){
  const HD = HOUSES[cfg.house];
  S = { v:30, samHome:cfg.house, samUps:{}, starters:[cfg.house], houseWardrobe:[], houseUnder:[], closets:{}, week:1, gold:600, rep:HD.rep, ap:3, cur:cfg.house, home:cfg.house, cycle:1, boons:[], past:cfg.past, pasts:[cfg.past], partner:cfg.partner, partners:[cfg.partner],
    houses:[makeHouse(cfg.house)],
    sam:{energy:100, ...BAL.sam.base, appraisal:1, appXP:0, first:true, lvl:1, xp:0},
    samWeek:{security:0, books:false, income:0, acts:[]},
    debt:{total:HD.debt, remaining:HD.debt, carry:0, strikes:0},
    workers:[], candidates:[], alumni:[], log:[],
    flags:{guild:0, hilde:false, taunt:false, poachCD:0, partnerCD:3}, lastReport:null, over:false, won:false };
  S.houses.forEach(h=>{ h.since = 1; h.story = {beat:0,wk:0}; });
  PASTS[cfg.past].fx(S.sam);
  const npc = makeNamed(HD.npc); npc.house = cfg.house; npc.locked = cfg.house; npc.contract = 999; npc.trust = clamp(npc.trust+10);
  const p = makeNamed(cfg.partner, true); p.house = cfg.house;
  S.workers.push(npc, p);
  assignStart(npc, NAMED[HD.npc].job); assignStart(p, ['courtesan','bartender','dancer','bath'].includes(NAMED[cfg.partner].job) ? NAMED[cfg.partner].job : 'courtesan');
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
function migrateWorker(w){
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
function migrate(s){
  s.alumni = s.alumni || [];
  const ov = s.v || 0;
  if(!s.houses){
    s.houses = [{id:'lantern', name:HOUSES.lantern.name, rooms:s.rooms||2, tier:s.roomTier||0, up:s.up||{}, price:s.price??1, rep:s.rep||10}];
    s.cur = 'lantern'; s.past = s.past || 'salaryman';
    (s.workers||[]).forEach(w=>{ w.house='lantern'; if(w.id==='n_mira'||w.id==='n_kaede'||w.id==='n_hilde'||w.id==='n_rhoswen'||w.id==='n_hanna'){ w.key=w.id.slice(2); } });
    s.debt.total = s.debt.total || 15470;
    delete s.rooms; delete s.roomTier; delete s.up; delete s.price;
  }
  if(s.v<5) s.lastReport = null;
  if(s.v<6) s.built = s.built || 0;
  if(s.v<7){   // the partners that had arcs when v7 shipped ('mio' is what old saves carry; the data key is now 'akari'; later partners never existed in v<7 saves)
    (s.workers||[]).concat(s.candidates||[],s.alumni||[]).forEach(w=>{ if(w.key && ['kaede','yui','nerys','elowen','adelheid','marisol','natsuki','kanako','mio','akari'].includes(w.key)) w.arc = [0,1,3,6][w.arc||0] ?? 0; });
    s.houses.forEach(h=>{ if(h.story) h.story.beat = [0,2,3,4][h.story.beat] ?? h.story.beat; });
  }
  if(ov < 13) (s.workers||[]).concat(s.candidates||[],s.alumni||[]).forEach(scaleWorker);
  (s.workers||[]).concat(s.candidates||[],s.alumni||[]).forEach(migrateWorker);
  if(ov < 14) s.lastReport = null;
  s.pasts = Array.isArray(s.pasts) && s.pasts.length ? s.pasts : (s.past ? [s.past] : []);
  if(s.samUps && s.samUps.suite){ delete s.samUps.suite; const sh = (s.houses||[]).find(h=>h.id===(s.samHome||s.home)) || (s.houses||[])[0]; if(sh){ sh.up = sh.up || {}; sh.up.suite = true; } }
  s.starters = s.starters || [s.home || (s.houses[0]||{}).id];
  if(ov < 21){   // the Lounge is gone (Castle Rosenhal and the Pearl Grotto no longer start with one): refund what was paid for it once; bartenders need a Bar now
    s.houses.forEach(h=>{ if(h.up && h.up.lounge){ delete h.up.lounge; if(!['castle','pearl'].includes(h.id)){ s.gold = (s.gold||0) + 1100; h.spent = Math.max(0, (h.spent||0) - 1100); (s.log = s.log||[]).unshift({wk:s.week, t:`${h.name}: the Lounge was removed from the game. The 1,100g it cost has been refunded.`}); } } });
    (s.workers||[]).forEach(w=>{ const h = s.houses.find(x=>x.id===w.house); if(w.job==='bartender' && h && !(h.up||{}).bar) w.job = 'rest'; });
  }
  if(ov < 22){   // amenity rework: Moon Garden -> Garden, Grooming Den -> Incense Burner, Forge Hearth -> Workshop
    const REN = {grove:'garden', den:'incense', hearth:'workshop'};
    s.houses.forEach(h=>{ h.up = h.up || {}; Object.keys(REN).forEach(o=>{ if(h.up[o]){ delete h.up[o]; h.up[REN[o]] = true; } }); });
    if(s.builtBy) Object.keys(REN).forEach(o=>{ if(s.builtBy[o]){ s.builtBy[REN[o]] = (s.builtBy[REN[o]]||0) + s.builtBy[o]; delete s.builtBy[o]; } });
  }
  if(ov < 23){   // Wine Cellar -> tiered Drinks upgrade (h.drinks 0-3); classroom + teacher
    s.houses.forEach(h=>{ h.up = h.up || {}; if(h.up.cellar){ delete h.up.cellar; h.drinks = 2; } });
    if(s.builtBy && s.builtBy.cellar){ s.builtBy.drinks = (s.builtBy.drinks||0) + s.builtBy.cellar; delete s.builtBy.cellar; }
  }
  s.houses.forEach(h=>{ if(h.drinks===undefined) h.drinks = 0; if(h.teachSkill===undefined) h.teachSkill = null; });
  s.houses.forEach(h=>{ if(h.decor===undefined) h.decor = 0; if(h.wsDisc===undefined) h.wsDisc = 0; if(!h.incense) h.incense = 'calm'; });
  if(ov < 24){   // race/sub stat mods and the Elegant / Former Adventurer / Tough boosts are a live bonus now (statBonus): take back what creation baked in
    (s.workers||[]).concat(s.candidates||[],s.alumni||[]).forEach(w=>{
      if(!w || !w.stats || w.key) return;   // named and guest ladies were never given the mods; creator-made ones start from a genWorker draft (baked values pre-filled in the form), so they're treated as generic too
      const R = RACES[w.race], SD = w.race==='beastkin' ? subData(w.race, w.sub) : null, tr = t => (w.traits||[]).includes(t);
      STAT_KEYS.forEach(k=>{
        let d = ((R && R.mods && R.mods[k]) || 0) * SKL + ((SD && SD.mods && SD.mods[k]) || 0) * SKL;
        if(k==='refinement' && tr('Elegant')) d += 100;
        if(k==='strength' && tr('Former Adventurer')) d += 100;
        if(k==='stamina' && tr('Tough')) d += 100;
        w.stats[k] = Math.max(0, Math.round(w.stats[k] - d));
      });
    });
  }
  if(ov < 27){   // Charisma and Wits (docs/STATS.md): named ladies take their data values, everyone else starts from charm / refinement + her personality lean
    (s.workers||[]).concat(s.candidates||[],s.alumni||[]).forEach(w=>{
      if(!w || !w.stats) return;
      const D = w.key && NAMED[w.key], add = [];
      Object.entries(STAT_FALLBACK).forEach(([k,f])=>{
        if(w.stats[k]!==undefined) return;
        const dv = D && D.stats && D.stats[k];
        if(dv!==undefined) w.stats[k] = clampK(dv*SKL + ri(0,SKL-1)); else { w.stats[k] = w.stats[f] || 0; add.push(k); }
      });
      if(add.length) persLean(w, add);
    });
  }
  if(ov < 28){   // Sam's Wits (sam.base.wits + perLevel per level); reincarnated ladies' wages pick up ngplus.rebornWage per life
    if(s.sam && s.sam.wits===undefined) s.sam.wits = Math.min(100, (BAL.sam.base.wits||0) + BAL.sam.perLevel * ((s.sam.lvl||1) - 1));
    (s.workers||[]).concat(s.candidates||[], s.alumni||[]).forEach(w=>raceFit(w));   // race appearance rules (races.json → design, body.json → raceBan)
    (s.workers||[]).concat(s.alumni||[]).forEach(w=>{ if(w && w.reborn && w.wage > 0 && !w.free && !w.isPartner) w.wage = Math.round(w.wage * (1 + (BAL.ngplus.rebornWage||0) * w.reborn)); });
  }
  if(ov < 29){   // design.gear split off design.features (data), the Great Fairy got a name (Cotera, title Great Fairy), closets for leaving ladies
    (s.workers||[]).concat(s.candidates||[], s.alumni||[]).forEach(w=>{
      const D = w && w.key && NAMED[w.key] && NAMED[w.key].design; if(!D || !w.design) return;
      if(D.gear && !w.design.gear && (w.design.features||'').includes(D.gear.split(' ').slice(-2).join(' '))){ w.design.gear = D.gear; w.design.features = D.features || ''; }
      if(w.key==='great_fairy' && w.name==='The Great Fairy'){ w.name = NAMED[w.key].name; w.title = NAMED[w.key].title; delete w.titleId; }
    });
  }
  s.closets = s.closets || {};
  if(ov < 30){ s.goddess = s.goddess || {met:(s.cycle||1) > 1}; }   // the goddess (goddess.js): an old NG+ save has met her already
  s.v = 30; s.samUps = s.samUps || {}; s.houseWardrobe = s.houseWardrobe || []; s.houseUnder = s.houseUnder || []; s.home = s.home || (s.houses[0]||{}).id; s.samHome = s.samHome || s.home || (s.houses[0]||{}).id; s.cycle = s.cycle || 1; s.boons = s.boons || []; s.partners = s.partners || (s.partner ? [s.partner] : []);
  s.regulars = s.regulars || []; s.bonds = s.bonds || {}; s.flags = Object.assign({partnerCD:3}, s.flags||{});
  s.sam.lvl = s.sam.lvl || 1; s.sam.xp = s.sam.xp || 0;
  s.houses.forEach(h=>{ if(h.tidy===undefined) h.tidy = BAL.tidy.start; h.since = h.since || 1; h.story = h.story || {beat:0,wk:0}; h.bonus = h.bonus || {}; if(h.spent===undefined) h.spent = 0;
    Object.keys(HOUSES[h.id].up||{}).forEach(k=>{ if(!h.up[k]) h.up[k] = true; });   // built-in amenities added to a house later (e.g. Hollowmere's Tethering Stone)
    if(h.quarters===undefined){ h.quarters = Math.max(HOUSES[h.id].quarters, Math.ceil((s.workers||[]).filter(w=>w.house===h.id).length/2)); h.beds = HOUSES[h.id].beds; }
    (s.workers||[]).forEach(w=>{ if(w.key===HOUSES[h.id].npc){ w.locked = h.id; w.house = h.id; } }); });
  s.samWeek = Object.assign({security:0,books:false,income:0,acts:[]}, s.samWeek||{}); if(!s.samWeek.acts) s.samWeek.acts=[];
  (s.workers||[]).concat(s.candidates||[],s.alumni||[]).forEach(w=>{ if(w.key && NAMED[w.key] && (!w.outfit || w.outfit==='custom' || !WARDROBE[w.outfit])){ w.outfit='sig_'+w.key; w.owned=Array.from(new Set([...(w.owned||[]),'sig_'+w.key])); } ensureWorker(w); if(!w.house) w.house = s.houses[0].id; });
  if(s.lastReport && !s.lastReport.v5) s.lastReport = null;
  return s;
}
function save(){ if(S){ enforceTrustCaps(); store.set(KEY_SAVE, S); } }
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
  // other partners occasionally turn up looking for work (paid, normal trust, still have their story)
  if(S.flags.partnerCD>0) S.flags.partnerCD--;
  else if(Math.random()<0.35){
    const open = PARTNERS.filter(k=>!isHired(k) && partnerOffered(k));   // NG+ partners only turn up from cycle 2
    if(open.length){ const k = pick(open); const c = makeNamed(k); c.signing = signingFor(c); S.candidates.push(c); S.flags.partnerCD = 5; addLog(`${c.name} is looking for work. (Candidates)`); }
  }
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
  c.keep = true; c.friend = true; c.signing = signingFor(c); S.candidates.push(c);
  addLog(`${c.name} remembers you from another life and is looking for work. (Candidates)`);
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
    if(w.key && WARDROBE['sp_'+w.key] && spUnlocked(w) && !w.seen.sp){ w.seen.sp=true; if(!w.owned.includes('sp_'+w.key)) w.owned.push('sp_'+w.key); if(!silent) msgs.push(`${w.name} unlocked her special outfit: ${WARDROBE['sp_'+w.key].label}.`); }
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
