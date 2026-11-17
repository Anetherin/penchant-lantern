'use strict';
/* =====================================================================
   ADVENTURERS' GUILD (docs/GUILD.md; data/guild/: base, text, scenes, ranks)
   S.guild: {joined, rank, merit, fame, board:[offer], active:[contract], done:{type:n}, samDone:{type:n}, next}
   offer/contract: {uid, type, gold, weeks}; a taken contract adds {prog, due, wk}. Ladies on it: job 'guild' + w.gc = uid
   (w.gPrev = the job she goes back to). Sam: his weekly focus {kind:'guild', topic:uid}. S.guildPerks: Sam's perks, kept for good.
   Hooks: guildWeek(R) in endWeek after the houses run (simHouse skips ladies on contracts), guildNewWeek() after S.week++,
   guildDraw() in pickClass, guildTabHTML() for the Guild tab.
   ===================================================================== */
const GDATA = DATA.guild || {};
const GB = GDATA;                                   // numbers (base.json) live at the top level
const GCON = noMeta(GDATA.contracts);
const GLEVELS = GDATA.levels || [{id:'copper', label:'Copper', merit:0}];
const GTXT = GDATA.text || {}, GGEN = GDATA.generic || {}, GITEMS = noMeta(GDATA.items);
const GSCN = (GDATA.scenes && typeof GDATA.scenes === 'object') ? GDATA.scenes : {};
const GBEATS = ((GDATA.ranks || {}).beats) || [];
const GPERKS = noMeta(GDATA.perks);
// what each rank brings along (ranks.json tells the story; this is the mechanics)
const GUILD_UNLOCKS = {1:{recruit:'rhoswen', item:'pass'}, 2:{recruit:'hanna'}, 3:{recruit:'vesna'}, 4:{recruit:'brunhild'}};

function GLD(){
  if(!S.guild) S.guild = {joined:false, rank:0, merit:0, fame:0, board:[], active:[], done:{}, samDone:{}, next:1};
  return S.guild;
}
const guildOn = () => !!(S && S.guild && S.guild.joined);
const hasGuildPerk = k => !!(S && (S.guildPerks||[]).includes(k));
const guildRankLabel = (r = GLD().rank) => (GLEVELS[r] || GLEVELS[GLEVELS.length-1]).label;
const guildActiveMax = () => { const b = GB.board || {}; return (b.active ?? 1) + Math.floor((b.activePerRank ?? 0.5) * GLD().rank) + (hasGuildPerk('delver') ? 1 : 0); };
const guildBoardSize = () => { const b = GB.board || {}; return (b.size ?? 3) + Math.floor((b.perRank ?? 0.5) * GLD().rank); };
const gFill = (t, o={}) => String(Array.isArray(t) ? pick(t) : (t||'')).replace(/\{(\w+)\}/g, (m, k) => o[k] != null ? o[k] : m);
const gText = (type, k) => { const T = GTXT[type] || {}; return (T[k] && T[k].length) ? T[k] : (GGEN[k] || []); };
const gNames = ws => ws.map(w=>w.name.split(' ')[0]).join(', ').replace(/, ([^,]*)$/, ' and $1');
// Adventurer/mercenary client draw at every house (services.js pickClass): a little for joining, more with fame.
const guildDraw = () => guildOn() ? ((GB.fame||{}).base ?? 6) + GLD().fame * ((GB.fame||{}).draw ?? 0.25) : 0;

/* ---------- the board ---------- */
function guildOffer(type){
  const C = GCON[type], g = GLD(), gm = cycleMul((GB.gold||{}).perCycle) * (hasGuildPerk('delver') ? 1.1 : 1);
  return {uid:'gc'+(g.next++), type, gold:Math.round(rnd(C.gold[0], C.gold[1]) * gm / 10) * 10, weeks:C.weeks};
}
function guildRefreshBoard(){
  const g = GLD(), types = Object.keys(GCON).filter(k=>GCON[k].rank <= g.rank);
  if(!types.length) return;
  g.board = []; g.boardWk = S.week;
  // the newest rank's contracts turn up a little more often; every type at most twice
  for(let i=0; i<guildBoardSize(); i++){
    const t = weighted(types.filter(k=>g.board.filter(o=>o.type===k).length < 2), k=>1 + (GCON[k].rank === g.rank ? 0.6 : 0));
    if(t) g.board.push(guildOffer(t));
  }
}
function guildNewWeek(){ if(guildOn()) guildRefreshBoard(); }
function takeContract(uid){
  const g = GLD(), i = g.board.findIndex(o=>o.uid===uid); if(i < 0) return;
  if(g.active.length >= guildActiveMax()) return toast(`The guild only trusts a ${guildRankLabel()} with ${guildActiveMax()} contract${guildActiveMax()>1?'s':''} at a time.`);
  const o = g.board.splice(i, 1)[0];
  g.active.push(Object.assign(o, {prog:0, wk:S.week, due:S.week + o.weeks - 1}));
  toast(`Took the ${GCON[o.type].label}. Send a party before week ${o.due + 1}.`); save(); render();
}
function dropContract(uid){
  const g = GLD(), c = g.active.find(x=>x.uid===uid); if(!c) return;
  if(!confirm(`Give up the ${GCON[c.type].label}? It counts as a failed contract.`)) return;
  guildEnd(c, false, null); save(); render();
}

/* ---------- parties ---------- */
const guildContract = uid => GLD().active.find(c=>c.uid===uid);
const samOnContract = c => !!(c && S.samFocus && S.samFocus.kind==='guild' && S.samFocus.topic===c.uid);
const guildParty = c => S.workers.filter(w=>w.job==='guild' && w.gc===c.uid);
const guildSlotsLeft = c => GCON[c.type].slots - guildParty(c).length - (samOnContract(c) ? 1 : 0);
const onContract = w => !!(w && w.job==='guild');
function guildCanJoin(w){
  if(!guildOn()) return 'Sam has to register at the Adventurers\' Guild first.';
  if(!GLD().active.some(c=>guildSlotsLeft(c) > 0)) return 'No contract with a free place (take one on the Guild tab).';
  return null;
}
function assignGuild(uid, wid){
  const c = guildContract(uid), w = findW(wid); if(!c || !w) return;
  if(w.job==='guild' && w.gc===uid) return;
  if(guildSlotsLeft(c) <= 0) return toast(`The party is full (${GCON[c.type].slots}, Sam included).`);
  const no = canDo(w, 'guild'); if(no) return toast(no);
  if(w.job!=='guild') w.gPrev = w.job==='rest' ? (w.prevJob || null) : w.job;
  w.job = 'guild'; w.gc = uid; delete w.prevJob;
  save(); render(); refreshSheetInfo();
}
function guildRelease(w){
  if(!w) return;
  const back = w.gPrev; delete w.gc; delete w.gPrev; w.job = 'rest';
  if(back && JOBS[back] && !canDo(w, back)) w.job = back;
}
function unassignGuild(wid){ const w = findW(wid); if(!w || w.job!=='guild') return; guildRelease(w); save(); render(); refreshSheetInfo(); }
function samJoinContract(uid){
  const c = guildContract(uid); if(!c) return;
  if(samOnContract(c)) { setFocus(S.samFocus.prev || 'office'); return; }
  if(guildSlotsLeft(c) <= 0) return toast('The party is full.');
  const f = samFocus(); if(f.kind!=='guild') f.prev = f.kind;
  f.kind = 'guild'; f.topic = uid; save(); render();
}
// the job picker on her sheet: pick which contract
function guildJobMenu(wid){
  const w = findW(wid); if(!w) return;
  const no = canDo(w, 'guild'); if(no) return toast(no);
  const open = GLD().active.filter(c=>guildSlotsLeft(c) > 0);
  if(open.length === 1) return assignGuild(open[0].uid, wid);
  modal(`<h2>Which contract?</h2><div class="row">${open.map(c=>`<button onclick="closeModal();assignGuild('${c.uid}','${wid}')">${GCON[c.type].icon} ${esc(GCON[c.type].label)} (${guildSlotsLeft(c)} left)</button>`).join('')}</div><div class="row"><button onclick="closeModal()">Never mind</button></div>`);
}

/* ---------- power & risk ---------- */
function gWeighted(src, weights){
  let sw = 0, sv = 0;
  Object.entries(weights||{}).forEach(([k,wt])=>{ sv += wt * src(k); sw += wt; });
  return sw ? sv / sw : 0;
}
function ladyGuildPower(w, C){
  const P = GB.power || {};
  const all = Object.assign({}, C.stats||{}), tech = C.tech||{};
  let sw = 0, sv = 0;
  Object.entries(all).forEach(([k,wt])=>{ sv += wt * s100(statOf(w,k)); sw += wt; });
  Object.entries(tech).forEach(([k,wt])=>{ sv += wt * s100(w.tech[k]||0); sw += wt; });
  const base = sw ? sv / sw : 0, ef = clamp(w.energy / Math.max(1, maxEnergy(w)), P.energyFloor ?? 0.4, 1);
  return base * ef * fxMul(w, 'guild') * (hasPast('courier') ? 1.15 : 1);
}
const samGuildPower = C => gWeighted(k=>S.sam[k]||0, C.sam) * ((GB.power||{}).samMult ?? 1) * (S.samWeek.focusEff||0) * (hasPast('courier') ? 1.15 : 1);
function guildHurtChance(C, avg, samThere, w){
  const SF = GB.safety || {};
  let p = C.risk * Math.max(SF.min ?? 0.25, 1 - avg / (SF.div ?? 160));
  if(samThere) p *= (SF.sam ?? 0.85) * (hasGuildPerk('slayer') ? 0.6 : 1);
  if(w) p *= fxMul(w, 'guildSafe');
  return p;
}

/* ---------- the week (endWeek) ---------- */
// Ladies whose contract is gone (finished, dropped, NG+) go back to their old job.
function guildTidy(){
  const live = new Set(GLD().active.map(c=>c.uid));
  S.workers.forEach(w=>{ if((w.job==='guild' || (w.job==='rest' && w.prevJob==='guild')) && !live.has(w.gc)){ if(w.job==='rest') delete w.prevJob; else guildRelease(w); } });
  const f = S.samFocus; if(f && f.kind==='guild' && !live.has(f.topic)){ f.kind = f.prev && FOCUS[f.prev] && f.prev!=='guild' ? f.prev : 'office'; f.topic = 'auto'; }
}
function guildWeek(R){
  if(!guildOn()) return;
  const g = GLD(), WK = GB.weekly || {}, cap = hasGuildPerk('captain') ? 1.5 : 1, parties = [];
  R.guild = R.guild || [];
  g.active.slice().forEach(c=>{
    const C = GCON[c.type]; if(!C){ g.active = g.active.filter(x=>x!==c); return; }
    const ladies = guildParty(c), sam = samOnContract(c) && (S.samWeek.focusEff||0) > 0;
    if(ladies.length || sam){
      const pw = ladies.map(w=>ladyGuildPower(w, C)), sp = sam ? samGuildPower(C) : 0;
      let total = pw.reduce((a,x)=>a+x, 0) + sp;
      if(sam && hasGuildPerk('roadwise')) total *= 1.1;
      c.prog = (c.prog||0) + total;
      const avg = total / (ladies.length + (sam ? 1 : 0));
      const hurt = [];
      ladies.forEach(w=>{
        const pr = R.per[w.id] || {};
        w.energy = clamp(w.energy - (C.energy ?? 35), 0, maxEnergy(w));
        w.health = clamp(w.health - (C.wear ?? 2) * fxMul(w,'fatigue'));
        Object.entries(C.stats||{}).forEach(([k,wt])=>statXP(w, k, (WK.statXP ?? 0.6) * wt * cap));
        Object.entries(C.tech||{}).forEach(([k,wt])=>grow(w, k, (WK.combat ?? 1.2) * wt * cap));
        gainTrust(w, (WK.trust ?? 0.4) * cap); countUp(w, 'guildWeeks');
        if(Math.random() < guildHurtChance(C, avg, sam, w)){
          const n = ri(C.hurt[0], C.hurt[1]); w.health = clamp(w.health - n); moodAdd(w, -4); hurt.push(w);
          R.lines.push(`🩹 ${gFill(gText(c.type,'hurt'), {name:w.name})} (Health −${n})`);
          (pr.why = pr.why || []).push({t:'hurt on a guild contract', good:false});
        } else (pr.why = pr.why || []).push({t:`on the ${C.label}`, good:true});
        pr.guild = C.label;
      });
      if(sam){
        samGainXP(WK.samXP ?? 6);
        const top = Object.entries(C.sam||{}).sort((a,b)=>b[1]-a[1])[0]; if(top) samStat(top[0], 1.5 * (S.samWeek.focusEff||0));
        if(Math.random() < guildHurtChance(C, avg, true) * 0.6){ const n = ri(10, 20); S.sam.energy = Math.max(0, S.sam.energy - n); R.lines.push(`🩹 Sam took a knock on the ${C.label} (energy −${n}).`); }
      }
      const who = [...ladies.map(w=>w.name.split(' ')[0]), ...(sam ? ['Sam'] : [])];
      R.lines.push(`${C.icon} ${gFill(gText(c.type,'week'), {party:gNames(ladies.length ? ladies : [{name:'Sam'}]) + (sam && ladies.length ? ' and Sam' : '')})} (${Math.min(100, Math.round(c.prog / C.work * 100))}%)`);
      parties.push({c, C, ladies, sam, who});
    }
    if(c.prog >= C.work) guildEnd(c, true, R, ladies, sam);
    else if(S.week >= c.due) guildEnd(c, false, R, ladies, sam);
  });
  guildScenes(parties);
  g.fame = Math.max(0, g.fame - ((GB.fame||{}).decay ?? 0.5));
}
// A contract ends: rewards or the penalty, the party goes home, the result is told as an event.
function guildEnd(c, ok, R, ladies, sam){
  const g = GLD(), C = GCON[c.type], D = GB.done || {}, cap = hasGuildPerk('captain') ? 1.5 : 1;
  ladies = ladies || guildParty(c); sam = sam ?? samOnContract(c);
  g.active = g.active.filter(x=>x!==c);
  let body = '', tag = '';
  if(ok){
    S.gold += c.gold; if(R){ R.income += c.gold; R.led.guild = (R.led.guild||0) + c.gold; }
    g.merit += C.merit; g.fame = Math.min((GB.fame||{}).max ?? 100, g.fame + (C.fame||0));
    g.done[c.type] = (g.done[c.type]||0) + 1;
    ladies.forEach(w=>{ gainTrust(w, (D.trust ?? 2) * cap); moodAdd(w, D.mood ?? 6); w.popularity = clamp(w.popularity + (C.pop||0));
      Object.entries(C.stats||{}).forEach(([k,wt])=>statXP(w, k, (D.statXP ?? 1.2) * wt * cap)); Object.entries(C.tech||{}).forEach(([k,wt])=>grow(w, k, (D.combat ?? 2) * wt * cap));
      countUp(w, 'guildDone'); });
    if(sam){ g.samDone[c.type] = (g.samDone[c.type]||0) + 1; samXP(10); }
    body = gFill(gText(c.type, sam ? 'doneSam' : 'done'), {party:gNames(ladies.length ? ladies : [{name:'Sam'}])});
    tag = `+${fmt(c.gold)} · Merit +${C.merit} (${guildRankLabel()})${C.fame ? ` · Guild fame +${C.fame}` : ''}${C.pop && ladies.length ? ` · Popularity +${C.pop}` : ''}${ladies.length ? ' · Trust +' : ''}`;
    if(C.item && BAL.samUps[C.item] && !hasSamUp(C.item)){ S.samUps = S.samUps || {}; S.samUps[C.item] = true; body += `\n\n${gFill(GITEMS[C.item] || `Sam earned the ${BAL.samUps[C.item].label}.`)}`; tag += ` · New tool: ${BAL.samUps[C.item].label}`; }
    if(R) R.lines.push(`✅ ${C.icon} ${C.label} complete: +${fmt(c.gold)}, merit +${C.merit}.`);
    guildPerkCheck(); guildRankCheck();
  } else {
    const F = GB.fail || {};
    g.merit = Math.max(GLEVELS[g.rank].merit, g.merit - (F.merit ?? 5)); g.fame = Math.max(0, g.fame - (F.fame ?? 3));
    ladies.forEach(w=>{ w.trust = clamp(w.trust - (F.trust ?? 1)); moodAdd(w, -4); });
    body = gFill(gText(c.type, 'fail'), {party:gNames(ladies.length ? ladies : [{name:'Sam'}])}) || `The ${C.label} ran out of time.`;
    tag = `Merit −${F.merit ?? 5} · Guild fame −${F.fame ?? 3}`;
    if(R) R.lines.push(`❌ ${C.icon} ${C.label} failed.`);
  }
  ladies.forEach(guildRelease);
  if(sam){ const f = samFocus(); f.kind = f.prev && FOCUS[f.prev] && f.prev!=='guild' ? f.prev : 'office'; f.topic = 'auto'; }
  if(R && body){ const who = (ladies[0]||{}).id, title = `${C.icon} ${C.label}: ${ok ? 'done' : 'failed'}`, text = `${body}\n\n${tag}`;
    EVQ.push(()=>({title, who, scene:'casual', text, choices:[{label:'Good work', fx(){ return ''; }}]})); }
}
function guildPerkCheck(){
  const g = GLD(); S.guildPerks = S.guildPerks || [];
  Object.entries(GPERKS).forEach(([k,P])=>{
    if(S.guildPerks.includes(k)) return;
    const n = P.need || {}; let ok = false;
    if(n.rank != null) ok = g.rank >= n.rank;
    else if(n.contract) ok = [].concat(n.contract).reduce((a,t)=>a + (g.samDone[t]||0), 0) >= (n.sam ?? 1);
    if(ok){ S.guildPerks.push(k); addLog(`⚔️ Sam earned a guild perk: ${P.label}. ${P.desc}`); toast(`⚔️ New guild perk: ${P.label}`); }
  });
}
function guildRankCheck(){
  const g = GLD();
  while(g.rank < GLEVELS.length - 1 && g.merit >= GLEVELS[g.rank + 1].merit){
    g.rank++; const r = g.rank; addLog(`⚔️ Sam's guild rank: ${guildRankLabel(r)}.`);
    EVQ.push(()=>guildBeatEvent(r));
  }
  guildPerkCheck();
}

/* ---------- rank beats & recruits ---------- */
function guildNpc(){
  const hired = S.workers.find(w=>w.key==='hanna'); if(hired) return hired.id;
  if(!NPCS.npc_hanna){ const h = makeNamed('hanna'); h.id = 'npc_hanna'; NPCS.npc_hanna = h; }
  return 'npc_hanna';
}
function guildRecruit(key){
  if(!NAMED[key] || guildHas(key)) return null;
  const r = rebirthNamed(makeNamed(key)); r.signing = r.wasLover ? 0 : key==='hanna' ? 40 : signingFor(r); r.keep = true;
  S.candidates.push(r); addLog(`${r.name} is waiting among the candidates.`); return r;
}
function guildBeatEvent(rank){
  const B = GBEATS.find(b=>b.rank===rank), U = GUILD_UNLOCKS[rank] || {};
  const r = U.recruit ? guildRecruit(U.recruit) : null;
  let note = '';
  if(U.item && BAL.samUps[U.item] && !hasSamUp(U.item)){ S.samUps = S.samUps || {}; S.samUps[U.item] = true; note += `\nNew tool: ${BAL.samUps[U.item].label}. ${BAL.samUps[U.item].desc}`; }
  if(r) note += `\n${r.name} has been added to your candidates.`;
  else if(U.recruit && NAMED[U.recruit] && isHired(U.recruit)) note += `\n(${NAMED[U.recruit].name} already works for you.)`;
  if(rank > 0) note = `\nGuild rank: ${guildRankLabel(rank)}. The board offers more, and ${guildActiveMax()} contract${guildActiveMax()>1?'s':''} can run at once.` + note;
  save();
  if(!B) return {title:`Guild rank: ${guildRankLabel(rank)}`, who:r ? r.id : guildNpc(), scene:'portrait', text:note.trim(), choices:[{label:'Continue', fx(){ return ''; }}]};
  const who = r ? r.id : guildNpc();
  return {title:B.title, who, scene:'portrait', pre:(B.pages||[]).map(t=>({text:t, btn:'Continue', who:guildNpc()})), text:`${B.end||''}\n${note}`.trim(),
    choices:[{label:B.btn || 'Continue', fx(){ return ''; }}]};
}

/* ---------- party scenes ---------- */
const gTags = C => new Set(C.tags||[]);
function gScenePick(list, C){ const t = gTags(C), fit = (list||[]).filter(s=>(s.tags||[]).some(x=>t.has(x))); return pick(fit.length ? fit : (list||[])); }
const gImg = (s, key) => s && s.image && s.image.comp ? dynScene('guild_'+key, s.image) : null;
function guildScenes(parties){
  const SC = GB.scenes || {}; let n = 0;
  shuffle(parties).forEach(p=>{
    if(n >= (SC.maxPerWeek ?? 1) || Math.random() > (SC.chance ?? 0.55)) return;
    const ids = p.ladies.map(w=>w.id), C = p.C, ev = guildSceneFor(p, SC);
    if(ev){ n++; EVQ.push(ev); }
  });
}
// Which scene this party gets (closure re-checks the ladies when it fires).
function guildSceneFor(p, SC){
  const L = p.ladies, C = p.C, bag = [];
  if(p.sam){
    const duo = L.filter(w=>w.trust >= (SC.duoTrust ?? 45));
    for(let i=0;i<L.length;i++) for(let j=i+1;j<L.length;j++){ const a = L[i], b = L[j];
      if(a.trust >= (SC.trioTrust ?? 60) && b.trust >= (SC.trioTrust ?? 60) && bondV(a,b) >= (SC.trioBond ?? 10) && duoActs(a,b).length) bag.push(['trio', a.id, b.id]); }
    duo.forEach(w=>bag.push(['duo', w.id]));
  } else if(L.length >= 2){
    for(let i=0;i<L.length;i++) for(let j=i+1;j<L.length;j++){ const a = L[i], b = L[j];
      if(gTags(C).has('bloom') && yuriOK(a, b, SC)) bag.push(['yuri', a.id, b.id], ['yuri', a.id, b.id]);
      if(bondV(a,b) >= (SC.pairBond ?? 0)) bag.push(['pair', a.id, b.id]); }
  }
  if(!bag.length) return null;
  const [kind, x, y] = pick(bag), label = C.label;
  return () => { const a = findW(x), b = y ? findW(y) : null; if(!a || (y && !b)) return null;
    return kind==='duo' ? gDuo(a, C) : kind==='trio' ? gTrio(a, b, C) : kind==='yuri' ? gYuri(a, b, C) : gPair(a, b, C); };
}
const yuriOK = (a, b, SC) => !has(a,'Modest') && !has(b,'Modest') && (a.lewd||0) >= (SC.yuriLewd ?? 35) && (b.lewd||0) >= (SC.yuriLewd ?? 35) && bondV(a,b) >= (SC.yuriBond ?? 5);
function gPickAct(w, acts, ok){ const L = (acts||[]).map(actKey).filter(ok); if(!L.length) return null; return pickFav(w, L) || pick(L); }
function gDuo(w, C){
  const s = gScenePick(GSCN.duo, C); if(!s) return null;
  const f = t => gFill(t, {N:w.name, C:C.label}), act = gPickAct(w, s.close && s.close.acts, id=>canSam(w,id)), sc = gImg(s, s.id);
  const ch = [{label:f(s.tender.label), fx(){ gainTrust(w, 3); moodAdd(w, 5); return f(s.tender.res) + '\n\nTrust + · Mood +'; }}];
  if(act) ch.unshift({label:f(s.close.label), fx(){ const text = privateCore(w, act, {lead:f(s.close.lead)}); return {text, img:{wid:w.id, scene:'samact:'+act}}; }});
  return {title:f(s.title), who:w.id, scene:sc || 'casual', text:f(s.text), choices:ch};
}
function gTrio(a, b, C){
  const s = gScenePick(GSCN.trio, C); if(!s) return null;
  const f = t => gFill(t, {a:a.name, b:b.name, C:C.label}), both = new Set(duoActs(a,b)), act = gPickAct(a, s.close && s.close.acts, id=>both.has(id)), sc = gImg(s, s.id);
  const ch = [{label:f(s.tender.label), fx(){ [a,b].forEach(w=>{ gainTrust(w, 2); moodAdd(w, 4); }); addBond(a, b, 3); return f(s.tender.res) + `\n\nTrust + · Mood + · ${a.name.split(' ')[0]} & ${b.name.split(' ')[0]} closer`; }}];
  if(act) ch.unshift({label:f(s.close.label), fx(){ const t1 = privateCore(a, act, {lead:f(s.close.lead), turn:false}), t2 = privateCore(b, act, {lead:f(s.close.lead2), turn:false}); addBond(a, b, 6); samLog(`Shared a tent with ${a.name} & ${b.name} [${samActLabel(act)}]`);
    return {text:`${t1}\n\n${t2}`, img:{wid:a.id, scene:'duo:'+act+':'+b.id}}; }});
  return {title:f(s.title), who:a.id, scene:sc || 'casual', text:f(s.text), choices:ch};
}
function gPair(a, b, C){
  const s = gScenePick(GSCN.pair, C); if(!s) return null;
  const f = t => gFill(t, {a:a.name, b:b.name, C:C.label});
  return {title:f(s.title), who:a.id, scene:'casual', text:f(s.text), choices:(s.choices||[]).map(c=>({label:f(c.label), fx(){ const bg = addBond(a, b, c.bond||3); moodAdd(a, c.mood||2); moodAdd(b, c.mood||2); return f(c.res) + `\n\n${a.name.split(' ')[0]} & ${b.name.split(' ')[0]} closer · Mood +`; }}))};
}
function gYuri(a, b, C){
  const s = gScenePick(GSCN.yuri, C); if(!s) return null;
  const f = t => gFill(t, {a:a.name, b:b.name, C:C.label}), lim = Math.min(a.lewd||0, b.lewd||0) + 10;
  const act = gPickAct(a, s.close && s.close.acts, id=>((actById(id)||{}).th||0) <= lim), sc = gImg(s, s.id);
  const ch = [{label:f(s.decline.label), fx(){ addBond(a, b, 3); moodAdd(a, 2); moodAdd(b, 2); return f(s.decline.res) + `\n\n${a.name.split(' ')[0]} & ${b.name.split(' ')[0]} closer`; }}];
  if(act) ch.unshift({label:f(s.close.label), fx(){ addBond(a, b, 8); [a,b].forEach(w=>{ moodAdd(w, 6); lewdUp(w, 2, svcLewdCap(act,'client')); spendLust(w, 30); countUp(w, 'yuri'); });
    return {text:f(s.close.res) + `\n\n${a.name.split(' ')[0]} & ${b.name.split(' ')[0]} much closer · Lewdness + · Lust −`, img:{wid:a.id, scene:`pair:${act}:fem:${b.id}`}}; }});
  return {title:f(s.title), who:a.id, scene:sc || 'casual', text:f(s.text), choices:ch};
}

/* ---------- joining (rest-day errand) ---------- */
function samGuild(){
  if(guildOn()) { TAB = 'guild'; return render(); }
  if(!useAP(samWorkCost(20))) return;
  const g = GLD(); g.joined = true; g.rank = 0; guildRefreshBoard();
  samXP(4); samLog('Registered at the Adventurers\' Guild'); save(); render();
  EVQ.push(()=>guildBeatEvent(0)); runQueue();
}
// one-off chat at the desk once joined: a candidate and the gossip (kept from the old guild visits)
function guildChat(){
  if(!useAP(samWorkCost(20))) return;
  addCandidates(1, 1.1 + GLD().rank * 0.05); samXP(6); samLog('Chatted at the guild desk'); save(); render();
  showResult('The Guild Desk', pick([`Hanna gives you the week's gossip, two rumors about the Barrow and one about the guildmaster's bad knee, then taps a name on the noticeboard. "That one's looking for steadier work. Tell her I sent you."`,
    `The hall is loud with a party just back from the Fenwood. You buy a round, listen, and come away with a name and a lot of opinions about moonmoss.`]) + '\n\n+1 candidate', guildNpc(), 'portrait');
}

/* ---------- UI: the Guild tab ---------- */
function guildTabHTML(){
  const g = GLD();
  if(!g.joined) return `<section class="card"><h2>Adventurers' Guild</h2><p class="muted">Sam isn't registered yet. Visit the guild from the Sam tab (a rest-day errand).</p></section>`;
  if(!g.board.length && g.boardWk !== S.week) guildRefreshBoard();   // first look after joining / an old save
  const nx = GLEVELS[g.rank + 1], pct = nx ? Math.round((g.merit - GLEVELS[g.rank].merit) / (nx.merit - GLEVELS[g.rank].merit) * 100) : 100;
  const perks = (S.guildPerks||[]).map(k=>GPERKS[k] ? `<span class="tag act" title="${esc(GPERKS[k].desc)}">${esc(GPERKS[k].label)}</span>` : '').join(' ');
  const lockedPerks = Object.entries(GPERKS).filter(([k])=>!(S.guildPerks||[]).includes(k)).map(([k,P])=>`<span class="tag" title="${esc(P.desc)}">🔒 ${esc(P.label)}</span>`).join(' ');
  const pool = S.workers.filter(w=>!onContract(w) && !canDo(w,'guild'));
  const actCard = c => { const C = GCON[c.type], party = guildParty(c), left = guildSlotsLeft(c), samOn = samOnContract(c), wl = c.due - S.week + 1;
    const est = party.reduce((a,w)=>a + ladyGuildPower(w, C), 0) + (samOn ? gWeighted(k=>S.sam[k]||0, C.sam) : 0);
    return `<div class="card" style="margin:6px 0"><b>${C.icon} ${esc(C.label)}</b> <span class="muted">· ${fmt(c.gold)} · ${wl} week${wl===1?'':'s'} left · party ${GCON[c.type].slots - left}/${C.slots}</span>
      ${bar('Progress', Math.round(c.prog||0), C.work, 't')}
      <div class="muted">${est ? `About ${Math.round(est)} progress a week with this party${est * wl < C.work - (c.prog||0) ? ' <span class="warn">(not enough to finish in time)</span>' : ''}.` : '<span class="warn">Nobody is on it.</span>'} Risk: ${Math.round(guildHurtChance(C, est / Math.max(1, party.length + (samOn?1:0)), samOn) * 100)}% per member a week.</div>
      <div class="row">${party.map(w=>`<button class="sm" onclick="unassignGuild('${w.id}')" title="Send her back to ${esc(w.gPrev && JOBS[w.gPrev] ? JOBS[w.gPrev].label : 'rest')}">✕ ${esc(w.name)}</button>`).join('')}
        <button class="sm ${samOn?'on':''}" onclick="samJoinContract('${c.uid}')" ${!samOn && left<=0 ? 'disabled' : ''} title="Sam's weekly focus: he goes along (away from the houses that week)">${samOn ? '✕ Sam' : '＋ Sam goes'}</button>
        ${left > 0 && pool.length ? `<select onchange="if(this.value)assignGuild('${c.uid}',this.value)"><option value="">＋ Add a lady…</option>${pool.map(w=>`<option value="${w.id}">${esc(w.name)} · ${Math.round(ladyGuildPower(w, C))}${w.energy < maxEnergy(w)*0.4 ? ' · tired' : ''}</option>`).join('')}</select>` : ''}
        <button class="sm" onclick="dropContract('${c.uid}')">Give up</button></div></div>`; };
  const offer = o => { const C = GCON[o.type], full = g.active.length >= guildActiveMax();
    return `<div class="row"><div style="flex:1"><b>${C.icon} ${esc(C.label)}</b> <span class="muted">· ${fmt(o.gold)} · ${o.weeks} week${o.weeks===1?'':'s'} · up to ${C.slots} (Sam included) · merit ${C.merit} · uses ${Object.keys(Object.assign({}, C.stats, C.tech)).join(', ')}${C.item && BAL.samUps[C.item] && !hasSamUp(C.item) ? ` · <span class="pink">first clear: ${esc(BAL.samUps[C.item].label)}</span>` : ''}</span><div class="muted">${esc(C.desc)}</div></div><button ${full?'disabled title="Too many contracts running"':''} onclick="takeContract('${o.uid}')">Take</button></div>`; };
  return `<section class="card"><h2>⚔️ Adventurers' Guild</h2>
      <div>Rank <b>${guildRankLabel()}</b> · Merit ${g.merit}${nx ? ` / ${nx.merit} for ${nx.label}` : ' (highest rank)'} · Fame ${Math.round(g.fame)} <span class="muted">(more adventurer and mercenary clients)</span></div>
      ${nx ? bar('Next rank', pct, 100, 't') : ''}
      <div style="margin-top:6px">Sam's guild perks: ${perks || '<span class="muted">none yet</span>'} ${lockedPerks}</div>
      <p class="muted">Ladies on a contract work it instead of their job for the week (from any house). Sam goes with his Guild focus. Contracts can take several weeks: the party's power fills the bar each week. Injuries cost Health.</p>
      <div class="row"><button onclick="guildChat()" title="A rest-day action: gossip with Hanna and a promising candidate.">🗣️ Chat at the desk</button></div></section>
    <section class="card"><h2>Active Contracts <span class="muted">(${g.active.length}/${guildActiveMax()})</span></h2>${g.active.length ? g.active.map(actCard).join('') : '<p class="muted">None. Take one from the board.</p>'}</section>
    <section class="card"><h2>The Board <span class="muted">(new offers every week)</span></h2>${g.board.length ? g.board.map(offer).join('') : '<p class="muted">Nothing posted this week.</p>'}</section>`;
}
const viewGuild = () => guildTabHTML();
