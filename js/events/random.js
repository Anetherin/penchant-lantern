'use strict';
/* Random events. When they happen and what the choices do is here; the words are in data/events.json. */
const EVT = needData('events');
// text from events.json: ET('noble','ask','res', {name:..., gold:...}) — lists pick one at random
function ET(...path){
  const vars = (typeof path[path.length-1]==='object') ? path.pop() : {};
  let t = path.reduce((o,k)=>o && o[k], EVT);
  if(Array.isArray(t)) t = pick(t);
  return String(t ?? '').replace(/\{(\w+)\}/g, (m,k)=> vars[k]!==undefined ? String(vars[k]) : m);
}
function evHaunt(h){
  const v = S.workers.find(w=>w.key==='vesper'), V = {house:h.name, ghost: v ? v.name : ''};
  return {title:ET('haunt','title',V), who: v?v.id:null, scene:evImg('haunt','casual'), text:ET('haunt','text',V),
    choices:[{label:ET('haunt','lean','label',V), fx(){ h.rep=clamp(h.rep+2); return ET('haunt','lean','res',V); }},
             {label:ET('haunt','exorcist','label',V), fx(){ if(S.gold<60) return ET('haunt','exorcist','broke',V); S.gold-=60; if(v) v.trust=clamp(v.trust-5); return v ? ET('haunt','exorcist','resGhost',V) : ET('haunt','exorcist','res',V); }}]};
}
// an event's own picture, if events.json gives it one (image: {comp, setting, sam}); otherwise the fallback scene
const evImg = (k, fallback) => dynScene('ev_'+k, (EVT[k]||{}).image) || fallback;
function pickRandomEvent(){ const opts = RANDOM_EVENTS.filter(e=>e.ok()); if(!opts.length) return null; const e = weighted(opts, e=>e.w); return ()=> e.ok() ? e.make() : null; }
const anyW = f => S.workers.filter(f);
// An outfit from the catalogue that fits her style and that she doesn't have yet (or any other if none fits).
function eventOutfit(w){
  const all = Object.keys(Object.assign({}, BASE_OUTFITS, SHOP_OUTFITS)).filter(k=>!WARDROBE[k].uniform && !WARDROBE[k].owner && !ownsOutfit(w,k));
  const fit = all.filter(k=>WARDROBE[k].style===w.style);
  const pool = fit.length ? fit : all; return pool.length ? pick(pool) : null;
}
// "Someone gave her an outfit" events (events.json outfit_market / outfit_regular / outfit_friend / outfit_made).
function evOutfit(kind){
  const w = pick(anyW(x=>eventOutfit(x))), k = eventOutfit(w), o = WARDROBE[k];
  const mates = anyW(x=>x!==w && x.house===w.house), other = mates.length ? pick(mates) : null;
  const V = {name:w.name, outfit:o.label, other: other ? other.name : 'a friend'}, key = 'outfit_'+kind;
  return {title:ET(key,'title',V), who:w.id, scene:evImg(key,'casual'), text:ET(key,'text',V), choices:[
    {label:ET(key,'keep','label',V), fx(){ w.owned.push(k); countUp(w,'gifts'); moodAdd(w, o.style===w.style ? 10 : 6); gainTrust(w, 1); return ET(key,'keep','res',V); }},
    {label:ET(key,'share','label',V), fx(){ if(!S.houseWardrobe.includes(k)) S.houseWardrobe.push(k); moodAdd(w, 3); return ET(key,'share','res',V); }}]};
}
const OUTFIT_EVENTS = ['market','regular','friend','made'].map(kind => ({w:BAL.wardrobe.eventChance, ok:()=>anyW(x=>eventOutfit(x)).length>0 && (kind!=='friend' || S.workers.some(a=>S.workers.some(b=>a!==b && a.house===b.house))), make:()=>evOutfit(kind)}));
// Events that can grant a title (data/titles.json; wording events.json → title_patron / title_fair / title_arena).
// One title event at a time across all three (S.flags.titleCD).
const titleFree = () => !(S.flags.titleCD > S.week);
const lacks = (w, id) => !(w.titles||[]).includes(id);
const patronOK = w => lacks(w,'lady') && s100(statOf(w,'refinement'))>=60 && w.popularity>=50;
const fairOK = w => lacks(w,'festival') && w.popularity>=35 && w.job!=='rest';
const arenaOK = w => lacks(w,'champion') && (s100(w.tech.combat||0) + s100(statOf(w,'strength')))/2 >= 50 && w.energy>=40;
const withTitle = (txt, line) => line ? txt + '\n\n' + line : txt;
const TITLE_EVENTS = [
  {w:1, ok:()=>titleFree() && S.week>=12 && S.rep>=40 && anyW(patronOK).length>0, make(){
    S.flags.titleCD = S.week + 10;
    const w = weighted(anyW(patronOK), x=>s100(statOf(x,'refinement'))+x.popularity), g = ri(150,300), V = {name:w.name, house:houseOf(w).name, gold:fmt(g)};
    return {title:ET('title_patron','title',V), who:w.id, scene:evImg('title_patron','portrait'), text:ET('title_patron','text',V), choices:[
      {label:ET('title_patron','accept','label',V), fx(){ moodAdd(w, 8); repAdd(houseOf(w), 1); return withTitle(ET('title_patron','accept','res',V), giveTitle(w,'lady')); }},
      {label:ET('title_patron','decline','label',V), fx(){ S.gold += g; moodAdd(w, 3); return ET('title_patron','decline','res',V); }}]};
  }},
  {w:1.2, ok:()=>titleFree() && S.week>=8 && anyW(fairOK).length>0, make(){
    S.flags.titleCD = S.week + 10;
    const w = weighted(anyW(fairOK), x=>x.popularity + s100(statOf(x,'charisma'))), fee = 50, V = {name:w.name, gold:fmt(fee)};
    return {title:ET('title_fair','title',V), who:w.id, scene:evImg('title_fair','casual'), text:ET('title_fair','text',V), choices:[
      {label:ET('title_fair','enter','label',V), fx(){
        if(S.gold < fee) return 'Sam can\'t cover the entry fee.'; S.gold -= fee;
        const odds = clamp((s100(statOf(w,'charisma')) + s100(statOf(w,'beauty')) + w.popularity) / 300 + fxAdd(w,'appeal')/40, 0.15, 0.85);
        if(Math.random() < odds){ w.popularity = clamp(w.popularity+6); moodAdd(w, 10); repAdd(houseOf(w), 2); return withTitle(ET('title_fair','enter','win',V), giveTitle(w,'festival')); }
        w.popularity = clamp(w.popularity+2); moodAdd(w, 2); return ET('title_fair','enter','lose',V); }},
      {label:ET('title_fair','skip','label',V), fx(){ return ET('title_fair','skip','res',V); }}]};
  }},
  {w:1, ok:()=>titleFree() && S.week>=10 && anyW(arenaOK).length>0, make(){
    S.flags.titleCD = S.week + 10;
    const w = weighted(anyW(arenaOK), x=>s100(x.tech.combat||0)+s100(statOf(x,'strength'))), prize = ri(200,400), V = {name:w.name, gold:fmt(prize)};
    return {title:ET('title_arena','title',V), who:w.id, scene:evImg('title_arena','casual'), text:ET('title_arena','text',V), choices:[
      {label:ET('title_arena','fight','label',V), fx(){
        w.energy = clamp(w.energy-30, 0, maxEnergy(w));
        const odds = clamp((s100(w.tech.combat||0) + s100(statOf(w,'strength')) + s100(statOf(w,'agility'))) / 270, 0.15, 0.85);
        if(Math.random() < odds){ S.gold += prize; w.popularity = clamp(w.popularity+5); moodAdd(w, 10); grow(w,'combat',3); return withTitle(ET('title_arena','fight','win',V), giveTitle(w,'champion')); }
        moodAdd(w, -4); grow(w,'combat',2); return ET('title_arena','fight','lose',V); }},
      {label:ET('title_arena','pass','label',V), fx(){ moodAdd(w, -2); return ET('title_arena','pass','res',V); }}]};
  }}
];
// New Game+ (cycle 2+): word spreads that people come back (events.json → returners). Flags are per cycle.
const cyc = () => (S && S.cycle) || 1;
const RET = (...a) => ET('returners', ...a);
const ngPartnerOpen = () => PARTNERS.filter(k=>NAMED[k].ngplus && !isHired(k));
const RETURNER_EVENTS = [
  {w:2, ok:()=>cyc()>=2 && S.flags.rumorCy!==cyc() && debtWeek()>=3, make(){
    S.flags.rumorCy = cyc();
    const hw = S.workers.find(x=>x.key==='hanna'); if(!hw && !NPCS.npc_hanna && !isHired('hanna')){ const h = makeNamed('hanna'); h.id = 'npc_hanna'; NPCS.npc_hanna = h; }
    return {title:RET('rumor','title'), who: hw ? hw.id : NPCS.npc_hanna ? 'npc_hanna' : null, scene:dynScene('ret_rumor', EVT.returners.rumor.image) || 'portrait', text:RET('rumor','text'), choices:[
      {label:RET('rumor','listen','label'), fx(){ S.rep = clamp(S.rep+2); return RET('rumor','listen','res'); }},
      {label:RET('rumor','deflect','label'), fx(){ return RET('rumor','deflect','res'); }}]};
  }},
  {w:1.5, ok:()=>cyc()>=2 && !(S.flags.dejaCD>S.week) && anyW(w=>w.reborn && !w.dejaTold).length>0, make(){
    S.flags.dejaCD = S.week + 6;
    const w = pick(anyW(x=>x.reborn && !x.dejaTold)), V = {name:w.name};
    return {title:RET('deja','title',V), who:w.id, scene:dynScene('ret_deja', EVT.returners.deja.image) || 'casual', text:RET('deja','text',V), choices:[
      {label:RET('deja','truth','label',V), fx(){ w.dejaTold = true; gainTrust(w, 4); moodAdd(w, 6); return RET('deja','truth','res',V); }},
      {label:RET('deja','smile','label',V), fx(){ moodAdd(w, 3); return RET('deja','smile','res',V); }}]};
  }},
  {w:1, ok:()=>cyc()>=2 && !(S.flags.familiarCD>S.week), make(){
    S.flags.familiarCD = S.week + 8;
    const g = Math.round(rnd(80,200) * (1 + 0.25*(cyc()-2))), V = {gold:fmt(g)};
    return {title:RET('familiar','title',V), text:RET('familiar','text',V), choices:[
      {label:RET('familiar','ok','label',V), fx(){ S.gold += g; return ''; }}]};
  }},
  {w:2, ok:()=>cyc()>=2 && S.flags.lampCy!==cyc() && anyW(w=>w.key==='anael').length>0, make(){
    S.flags.lampCy = cyc();
    const w = anyW(x=>x.key==='anael')[0], V = {name:w.name, cycle:cyc()};
    return {title:RET('lamp','title',V), who:w.id, scene:dynScene('ret_lamp', EVT.returners.lamp.image) || 'sam_date', text:RET('lamp','text',V), choices:[
      {label:RET('lamp','stay','label',V), fx(){ gainTrust(w, 5); moodAdd(w, 6); return RET('lamp','stay','res',V); }},
      {label:RET('lamp','ask','label',V), fx(){ gainTrust(w, 2); samStat('charm', 1); return RET('lamp','ask','res',V); }}]};
  }},
  {w:2, ok:()=>cyc()>=3 && !S.flags.circle && debtWeek()>=4, make(){
    S.flags.circle = true;
    return {title:RET('circle','title'), text:RET('circle','text'), choices:[
      {label:RET('circle','join','label'), fx(){ S.rep = clamp(S.rep+4); const open = ngPartnerOpen(); if(open.length){ const c = makeNamed(pick(open)); c.signing = signingFor(c); S.candidates.push(c); addLog(`${c.name} found Sam through the Returners' Circle. (Candidates)`); } return RET('circle','join','res'); }},
      {label:RET('circle','visit','label'), fx(){ S.sam.energy = Math.min(100, S.sam.energy+20); return RET('circle','visit','res'); }}]};
  }}
];
const RANDOM_EVENTS = [
  {w:3, ok:()=>anyW(w=>w.mood<55 && w.job!=='rest').length>0, make(){
    const w = pick(anyW(x=>x.mood<55 && x.job!=='rest')), V = {name:w.name};
    return {title:ET('dayoff','title',V), who:w.id, scene:evImg('dayoff','casual'), text:ET('dayoff','text',V), choices:[
      {label:ET('dayoff','yes','label',V), fx(){ w.energy=clamp(w.energy+30,0,maxEnergy(w)); moodAdd(w, 10); w.trust=clamp(w.trust+5); return ET('dayoff','yes','res',V); }},
      {label:ET('dayoff','no','label',V), fx(){ const soft = ['Warm and motherly','Shy but earnest','Laid-back and lazy'].includes(w.personality); w.trust=clamp(w.trust-(soft?3:6)); moodAdd(w, -5); return ET('dayoff','no', soft?'resSoft':'res', V); }}]};
  }},
  {w:2, ok:()=>S.rep>=20 && anyW(w=>s100(statOf(w,'refinement'))>=45 && w.energy>=30).length>0, make(){
    const w = weighted(anyW(x=>s100(statOf(x,'refinement'))>=45 && x.energy>=30), x=>s100(statOf(x,'refinement')));
    const pay = Math.round(150 + s100(statOf(w,'refinement'))*3 + S.rep*2), V = {name:w.name, gold:fmt(pay)};
    return {title:ET('noble','title',V), who:w.id, scene:evImg('noble','companion'), text:ET('noble','text',V), choices:[
      {label:ET('noble','ask','label',V), fx(){ if(w.lewd>=15 || w.trust>=30){ S.gold+=pay; w.popularity=clamp(w.popularity+5); w.energy=clamp(w.energy-25,0,maxEnergy(w)); S.rep=clamp(S.rep+2); return ET('noble','ask','res',V); } w.trust=clamp(w.trust+2); return ET('noble','ask','pass',V); }},
      {label:ET('noble','decline','label',V), fx(){ S.rep=clamp(S.rep-1); return ET('noble','decline','res',V); }}]};
  }},
  {w:2, ok:()=>S.flags.guild>=1 && anyW(w=>w.job!=='rest' && w.energy>=30).length>0, make(){
    const w = weighted(anyW(x=>x.job!=='rest' && x.energy>=30), x=>s100(statOf(x,'charisma'))+x.popularity);
    const pay = Math.round(rnd(120,240) * (1+S.rep/150)), V = {name:w.name, gold:fmt(pay)};
    return {title:ET('guild','title',V), who:w.id, scene:evImg('guild','companion'), text:ET('guild','text',V), choices:[
      {label:ET('guild','send','label',V), fx(){ S.gold+=pay; w.energy=clamp(w.energy-20,0,maxEnergy(w)); w.popularity=clamp(w.popularity+4); moodAdd(w, 5); return ET('guild','send','res',V); }},
      {label:ET('guild','pass','label',V), fx(){ return ET('guild','pass','res',V); }}]};
  }},
  {w:2, ok:()=>S.week>=5 && !S.flags.taunt, make(){
    S.flags.taunt = true;
    return {title:ET('taunt','title'), who:'npc_isolde', scene:'portrait', text:ET('taunt','text'), choices:[
      {label:ET('taunt','banter','label'), fx(){ if(S.sam.charm + rnd(0,50) > 40){ S.rep=clamp(S.rep+3); samStat('charm',2); return ET('taunt','banter','win'); } S.rep=clamp(S.rep-1); return ET('taunt','banter','lose'); }},
      {label:ET('taunt','polite','label'), fx(){ return ET('taunt','polite','res'); }}]};
  }},
  {w:2, ok:()=>S.week>=10 && S.rep>=30 && !S.flags.poachCD && anyW(w=>w.trust<50 && !has(w,'Loyal') && !isFree(w) && !w.locked).length>0, make(){
    S.flags.poachCD = 8;
    const w = pick(anyW(x=>x.trust<50 && !has(x,'Loyal') && !isFree(x) && !x.locked)), V = {name:w.name};
    const leave = () => { S.workers=S.workers.filter(x=>x!==w); addLog(`${w.name} left for the Velvet Thorn.`); };
    return {title:ET('poach','title',V), who:w.id, scene:evImg('poach','portrait'), text:ET('poach','text',V), choices:[
      {label:ET('poach','raise','label',V), fx(){ w.wage=Math.round(w.wage*1.3); w.trust=clamp(w.trust+5); return ET('poach','raise','res',V); }},
      {label:ET('poach','talk','label',V), fx(){ if(Math.random() < (w.trust+w.mood)/130){ w.trust=clamp(w.trust+8); return ET('poach','talk','stay',V); } leave(); return ET('poach','talk','go',V); }},
      {label:ET('poach','choose','label',V), fx(){ if(Math.random() < w.trust/60+0.2) return ET('poach','choose','stay',V); leave(); return ET('poach','choose','go',V); }}]};
  }},
  {w:2, ok:()=>true, make(){
    const g = ri(40,150), V = {gold:fmt(g)};
    return {title:ET('lucky','title',V), text:ET('lucky','text',V), choices:[{label:ET('lucky','ok','label',V), fx(){ S.gold+=g; return ''; }}]};
  }},
  {w:1.5, ok:()=>S.gold>=200, make(){
    const fee = Math.max(30, Math.round(S.gold*0.1)), f = Math.round(fee*2), V = {gold:fmt(fee), fine:fmt(f)};
    return {title:ET('inspector','title',V), text:ET('inspector','text',V), choices:[
      {label:ET('inspector','pay','label',V), fx(){ S.gold-=fee; return ET('inspector','pay','res',V); }},
      {label:ET('inspector','argue','label',V), fx(){ if(S.sam.business + rnd(0,60) > 55){ samStat('business',2); return ET('inspector','argue','win',V); } S.gold-=f; S.rep=clamp(S.rep-2); return ET('inspector','argue','lose',V); }}]};
  }},
  {w:1.5, ok:()=>S.workers.some(a=>S.workers.some(b=>a!==b && a.house===b.house)), make(){
    const a = pick(S.workers.filter(x=>S.workers.some(y=>y!==x && y.house===x.house))), b = pick(S.workers.filter(y=>y!==a && y.house===a.house)), V = {name:a.name, other:b.name};
    return {title:ET('friends','title',V), who:a.id, scene:evImg('friends','casual'), text:ET('friends','text',V), choices:[{label:ET('friends','ok','label',V), fx(){ moodAdd(a, 8); moodAdd(b, 8); addBond(a, b, 10); return ''; }}]};
  }},
  {w:1.5, ok:()=>anyW(w=>w.trust>=60 && !ARCS[w.key]).length>0, make(){
    const w = pick(anyW(x=>x.trust>=60 && !ARCS[x.key])), V = {name:w.name};
    return {title:ET('quiet','title',V), who:w.id, scene:evImg('quiet','sam_date'), text:ET('quiet','text',V), choices:[{label:ET('quiet','stay','label',V), fx(){ w.trust=clamp(w.trust+3); moodAdd(w, 5); samStat('charm',1); return ET('quiet','stay','res',V); }}]};
  }},
  {w:2.5, ok:()=>anyW(underpaid).length>0, make(){
    const w = pick(anyW(underpaid)); const nw = wageFor(w), V = {name:w.name, wage:fmt(w.wage), newWage:fmt(nw)};
    return {title:ET('raise','title',V), who:w.id, scene:evImg('raise','portrait'), text:ET('raise','text',V), choices:[
      {label:ET('raise','agree','label',V), fx(){ w.wage=nw; w.trust=clamp(w.trust+3); moodAdd(w, 5); return ET('raise','agree','res',V); }},
      {label:ET('raise','refuse','label',V), fx(){ const pr = ['Proud and sharp-tongued','Hot-blooded and competitive'].includes(w.personality) ? 2 : 1; moodAdd(w, -(8*pr)); w.trust=clamp(w.trust-4*pr); return ET('raise','refuse', pr>1?'resProud':'res', V); }}]};
  }}
].concat(OUTFIT_EVENTS, RETURNER_EVENTS, TITLE_EVENTS);
// she asks for a raise once her skills have outgrown her wage
function underpaid(w){ const B = BAL.wages; return !isFree(w) && w.wage < wageFor(w) * ((has(w,'Ambitious')||has(w,'Greedy')) ? B.askAtAmbitious : B.askAt); }
function evIncident(h){
  const sec = S.workers.find(w=>w.house===h.id && w.job==='security'), c = ri(60,120), V = {house:h.name, guard: sec ? sec.name : '', gold:fmt(c)};
  const ch = [
    {label:ET('incident','sam','label',V), fx(){ if(S.sam.strength + S.sam.charm/2 + rnd(0,60) > 60){ repAdd(h, 2); samStat('strength',1); return ET('incident','sam','win',V); } S.sam.energy=Math.max(0,S.sam.energy-30); h.rep=clamp(h.rep-1); return ET('incident','sam','lose',V); }},
    {label:ET('incident','pay','label',V), fx(){ S.gold-=c; return ET('incident','pay','res',V); }}
  ];
  if(sec) ch.unshift({label:ET('incident','guard','label',V), fx(){ sec.trust=clamp(sec.trust+3); repAdd(h, 1); return ET('incident','guard','res',V); }});
  return {title:ET('incident','title',V), who:sec?sec.id:null, scene:'job_security', text:ET('incident','text',V), choices:ch};
}
// How keen she is to stay (0-1), from trust and mood. See data/balance.json → renewal.
function renewWill(w, boost=0){ const B = BAL.renewal; return (w.trust*0.6 + w.mood*0.4)/100 + (has(w,'Loyal')?B.loyal:0) + boost; }
function renewFee(w, wage, s){ const B = BAL.renewal; return s >= B.freeAt ? 0 : Math.round(wage * B.feeWeeks * Math.pow((B.freeAt - s)/B.freeAt, 1.2)); }
// odds she says yes: certain above refuseBelow, falling toward 15% at zero
const renewOdds = s => { const B = BAL.renewal; return s >= B.refuseBelow ? 1 : 0.15 + 0.85*Math.max(0,s)/B.refuseBelow; };
function evRenew(w){
  if(!S.workers.includes(w) || isFree(w) || w.locked) return null;
  const B = BAL.renewal, market = Math.max(w.wage, wageFor(w)), raised = Math.round(market*(1+B.raise));
  const s = renewWill(w), s2 = renewWill(w, B.raiseBoost), fee = renewFee(w, market, s), fee2 = renewFee(w, raised, s2);
  const odds = has(w,'Loyal') ? 1 : renewOdds(s), odds2 = has(w,'Loyal') ? 1 : renewOdds(s2);
  const mood = s >= B.freeAt ? `${w.name} is happy here and wants to stay. She'll sign again without a bonus.` : s >= B.refuseBelow ? `${w.name} is open to staying, for a signing bonus.` : `${w.name} has been thinking about leaving. She might not sign at all.`;
  const pay = market > w.wage ? ` Her going rate has risen to ${fmt(market)}/wk (she's on ${fmt(w.wage)}/wk now).` : '';
  const sign = (wage, f, od, extra) => () => {
    if(S.gold < f){ w.contract=4; return 'You can\'t afford it right now. She agrees to stay on for 4 more weeks while you sort it out.'; }
    if(Math.random() >= od){ w.contract=2; moodAdd(w, -3); return `${w.name} shakes her head. "I don't think so." (She'll stay 2 more weeks. Spend time with her, or make a better offer.)`; }
    S.gold -= f; w.wage = wage; w.contract = 12; if(extra) extra();
    return `${w.name} signs again${f?'':', and waves off the bonus'}. (${fmt(wage)}/wk for 12 weeks${f?`, −${fmt(f)}`:''})`;
  };
  const oddsTxt = o => o < 1 ? `, ~${Math.round(o*100)}% she agrees` : '';
  return {title:'Contract Renewal', who:w.id, scene:'portrait', text:`${w.name}'s contract is up.${pay}\n\n${mood}`, choices:[
    {label:`Renew at ${fmt(market)}/wk (${fee?fmt(fee)+' bonus':'free'}${oddsTxt(odds)})`, fx: sign(market, fee, odds)},
    {label:`Offer a raise: ${fmt(raised)}/wk (${fee2?fmt(fee2)+' bonus':'free'}${oddsTxt(odds2)})`, fx: sign(raised, fee2, odds2, ()=>{ w.trust=clamp(w.trust+4); moodAdd(w, 4); })},
    {label:'Let her go', fx(){ S.workers=S.workers.filter(x=>x!==w); addLog(`${w.name}'s contract ended.`); return `${w.name} says goodbye.`; }}]};
}
function evStrike(){
  const s = S.debt.strikes;
  return {title:'A Visit from the Vane Credit House', who:'npc_marguerite', scene:'portrait',
    text: s>=(BAL.debt.strikes||3) ? `Marguerite Vane adjusts her monocle. "Three strikes, Mr. Takahashi. Your properties now belong to the Credit House."` : `Marguerite Vane adjusts her monocle. "You've missed a payment, Mr. Takahashi. Strike ${s} of three. The shortfall carries over, with interest. I'd hate to see you on the street. Truly."`,
    choices:[{label: s>=(BAL.debt.strikes||3)?'...':'Understood', fx(){ return ''; }}]};
}
function evHilde(){
  const h = makeNamed('hilde'); NPCS[h.id] = h;
  return {title:'A Dwarf at the Bar', who:h.id, scene:'portrait', text:`The new bar isn't even finished when a red-braided dwarf walks in, inspects the taps, and declares them adequate. "Hilde Ironsong. I need a bar, you have a bar. I'll work for wages. No bonus."`, choices:[
    {label:'Hire her on the spot', fx(){ h.job='bartender'; h.contract=12; h.house=curH().id; S.workers.push(h); delete NPCS[h.id]; checkUnlocks(true); return 'Hilde rolls up her sleeves. The bar is open.'; }},
    {label:'Maybe later', fx(){ h.signing=0; S.candidates.push(h); delete NPCS[h.id]; return 'She leaves her name at the front desk. (Added to candidates.)'; }}]};
}
function checkEnd(){
  if(!S) return;
  if(S.debt.strikes>=(BAL.debt.strikes||3) && !S.over){
    S.over = true; save();
    modal(`<h2>Game Over</h2><p class="story">The Credit House takes the deeds. Sam is out on the street with a hoodie, a status window, and a lot of feelings.\n\nYou lasted ${S.week-1} weeks.</p><div class="row"><button class="primary" onclick="restart()">New game</button></div>`, {lock:true});
  } else if(S.debt.remaining<=0 && !S.won){
    S.won = true; save();
    modal(`<h2>Debt Paid! 🎉</h2><p class="story">Marguerite Vane stamps the final receipt. "Paid in full. I confess, Mr. Takahashi, I had money on you failing." She almost smiles.\n\nEverything you've built is yours, free and clear.\n\nNew Game+ is now unlocked: keep ${HOUSES[homeHouse()].name}, your partner and your progress, and take on a second house with a bigger debt. You can start it now or any time later from the top bar.</p><div class="row"><button onclick="closeModal()">Keep playing</button><button onclick="exportBox('ngplus')" title="Only what New Game+ carries; load it any time to start the next cycle again">Export NG+ save</button><button class="primary" onclick="startNGPlus()">New Game+…</button></div>`);
  }
}
function restart(){ store.del(KEY_SAVE); EVQ=[]; S=null; closeModal(); TAB='house'; startSetup(); }
