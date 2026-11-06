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
function makeHouse(id){ const D = HOUSES[id]; return {id, name:D.name, rooms:D.rooms, quarters:D.quarters, beds:D.beds, tier:D.tier, up:clone(D.up), price:1, rep:D.rep, since:S?S.week:1, story:{beat:0,wk:0}, bonus:{}}; }
function newGame(cfg){
  const HD = HOUSES[cfg.house];
  S = { v:5, week:1, gold:600, rep:HD.rep, ap:3, cur:cfg.house, past:cfg.past, partner:cfg.partner,
    houses:[makeHouse(cfg.house)],
    sam:{energy:100, charm:20, business:35, strength:15, technique:0, appraisal:1, appXP:0, first:true, lvl:1, xp:0},
    samWeek:{security:0, books:false, income:0, acts:[]},
    debt:{total:HD.debt, remaining:HD.debt, carry:0, strikes:0},
    workers:[], candidates:[], log:[],
    flags:{guild:0, hilde:false, taunt:false, poachCD:0, partnerCD:3}, lastReport:null, over:false, won:false };
  S.houses.forEach(h=>{ h.since = 1; h.story = {beat:0,wk:0}; });
  PASTS[cfg.past].fx(S.sam);
  const npc = makeNamed(HD.npc); npc.house = cfg.house; npc.locked = cfg.house; npc.contract = 999; npc.trust = clamp(npc.trust+10);
  const p = makeNamed(cfg.partner, true); p.house = cfg.house;
  S.workers.push(npc, p);
  assignStart(npc, NAMED[HD.npc].job); assignStart(p, NAMED[cfg.partner].job==='courtesan' || JOBS[npc.job].cat!=='escort' ? (NAMED[cfg.partner].job==='courtesan'?'courtesan':'companion') : (['bartender','dancer','bath'].includes(NAMED[cfg.partner].job) ? NAMED[cfg.partner].job : 'companion'));
  refreshCandidates();
  checkUnlocks(true);
  addLog(`Sam Takahashi wakes up in Hollowmere with a deed to ${HD.name}, a debt, and a status window only he can see.`);
  save();
}
function assignStart(w, job){
  w.job = 'rest';
  if(canDo(w, job)) job = 'companion';
  w.job = job;
  if(job==='courtesan' || job==='companion') w.menu = getActs().filter(a=>clientStance(w,a.id)==='yes').map(a=>a.id);
}
function migrate(s){
  if(!s.houses){
    s.houses = [{id:'lantern', name:HOUSES.lantern.name, rooms:s.rooms||2, tier:s.roomTier||0, up:s.up||{}, price:s.price??1, rep:s.rep||10}];
    s.cur = 'lantern'; s.past = s.past || 'salaryman';
    (s.workers||[]).forEach(w=>{ w.house='lantern'; if(w.id==='n_mira'||w.id==='n_kaede'||w.id==='n_hilde'||w.id==='n_rhoswen'||w.id==='n_hanna'){ w.key=w.id.slice(2); } });
    s.debt.total = s.debt.total || 15470;
    delete s.rooms; delete s.roomTier; delete s.up; delete s.price;
  }
  if(s.v<5) s.lastReport = null;
  if(s.v<6) s.built = s.built || 0;
  if(s.v<7){
    (s.workers||[]).concat(s.candidates||[]).forEach(w=>{ if(w.key && ['kaede','yui','nerys','elowen','adelheid','marisol','natsuki','kanako','mio'].includes(w.key)) w.arc = [0,1,3,6][w.arc||0] ?? 0; });
    s.houses.forEach(h=>{ if(h.story) h.story.beat = [0,2,3,4][h.story.beat] ?? h.story.beat; });
  }
  s.v = 9; s.flags = Object.assign({partnerCD:3}, s.flags||{});
  s.sam.lvl = s.sam.lvl || 1; s.sam.xp = s.sam.xp || 0;
  s.houses.forEach(h=>{ h.since = h.since || 1; h.story = h.story || {beat:0,wk:0}; h.bonus = h.bonus || {};
    if(h.quarters===undefined){ h.quarters = Math.max(HOUSES[h.id].quarters, Math.ceil((s.workers||[]).filter(w=>w.house===h.id).length/2)); h.beds = HOUSES[h.id].beds; }
    (s.workers||[]).forEach(w=>{ if(w.key===HOUSES[h.id].npc){ w.locked = h.id; w.house = h.id; } }); });
  s.samWeek = Object.assign({security:0,books:false,income:0,acts:[]}, s.samWeek||{}); if(!s.samWeek.acts) s.samWeek.acts=[];
  (s.workers||[]).concat(s.candidates||[]).forEach(w=>{ if(w.key && NAMED[w.key] && (!w.outfit || w.outfit==='custom' || !WARDROBE[w.outfit])){ w.outfit='sig_'+w.key; w.owned=Array.from(new Set([...(w.owned||[]),'sig_'+w.key])); } ensureWorker(w); if(!w.house) w.house = s.houses[0].id; });
  if(s.lastReport && !s.lastReport.v5) s.lastReport = null;
  return s;
}
function save(){ if(S) store.set(KEY_SAVE, S); }
function saveSettings(){ store.set(KEY_SET, SET); }
function saveLib(){ store.set(KEY_LIB, LIB); }
function addLog(t){ S.log.unshift({wk:S.week, t}); if(S.log.length>250) S.log.length=250; }
function note(t){ addLog(t); toast(t); }
const findW = id => S.workers.find(w=>w.id===id);

function refreshCandidates(extra=0, quality=1){
  S.candidates = S.candidates.filter(c=>c.keep);
  const bonus = S.houses.reduce((a,h)=>a+(HOUSES[h.id].recruit||0),0);
  for(let i=0;i<3+extra+bonus;i++){ const c = genWorker({quality: quality*(0.85 + S.rep/200 + ((S.sam.lvl||1)-1)*0.02)}); c.signing = signingFor(c); S.candidates.push(c); }
  if(SET.libraryInPool && LIB.length && Math.random()<0.25){
    const src = pick(LIB);
    if(!allNames().includes(src.name)){ const c = ensureWorker(clone(src)); c.id=uid(); c.keep=false; c.signing=signingFor(c); S.candidates.push(c); }
  }
  // other partners occasionally turn up looking for work (paid, normal trust, still have their story)
  if(S.flags.partnerCD>0) S.flags.partnerCD--;
  else if(Math.random()<0.35){
    const open = PARTNERS.filter(k=>!isHired(k));
    if(open.length){ const k = pick(open); const c = makeNamed(k); c.signing = signingFor(c); S.candidates.push(c); S.flags.partnerCD = 5; addLog(`${c.name} is looking for work. (Candidates)`); }
  }
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
function nextDue(){
  const wk = S.week%4===0 ? S.week : Math.ceil(S.week/4)*4;
  const inst = Math.round((220+130*(wk/4)) * S.debt.total/15470);
  const amount = wk>=52 ? S.debt.remaining : Math.min(S.debt.remaining, inst + S.debt.carry);
  return {week:wk, amount};
}
