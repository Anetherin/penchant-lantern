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
const RANDOM_EVENTS = [
  {w:3, ok:()=>anyW(w=>w.mood<55 && w.job!=='rest').length>0, make(){
    const w = pick(anyW(x=>x.mood<55 && x.job!=='rest')), V = {name:w.name};
    return {title:ET('dayoff','title',V), who:w.id, scene:evImg('dayoff','casual'), text:ET('dayoff','text',V), choices:[
      {label:ET('dayoff','yes','label',V), fx(){ w.energy=clamp(w.energy+30,0,maxEnergy(w)); moodAdd(w, 10); w.trust=clamp(w.trust+5); return ET('dayoff','yes','res',V); }},
      {label:ET('dayoff','no','label',V), fx(){ const soft = ['Warm and motherly','Shy but earnest','Laid-back and lazy'].includes(w.personality); w.trust=clamp(w.trust-(soft?3:6)); moodAdd(w, -5); return ET('dayoff','no', soft?'resSoft':'res', V); }}]};
  }},
  {w:2, ok:()=>S.rep>=20 && anyW(w=>s100(w.stats.refinement)>=45 && w.energy>=30).length>0, make(){
    const w = weighted(anyW(x=>s100(x.stats.refinement)>=45 && x.energy>=30), x=>s100(x.stats.refinement));
    const pay = Math.round(150 + s100(w.stats.refinement)*3 + S.rep*2), V = {name:w.name, gold:fmt(pay)};
    return {title:ET('noble','title',V), who:w.id, scene:evImg('noble','companion'), text:ET('noble','text',V), choices:[
      {label:ET('noble','ask','label',V), fx(){ if(w.lewd>=15 || w.trust>=30){ S.gold+=pay; w.popularity=clamp(w.popularity+5); w.energy=clamp(w.energy-25,0,maxEnergy(w)); S.rep=clamp(S.rep+2); return ET('noble','ask','res',V); } w.trust=clamp(w.trust+2); return ET('noble','ask','pass',V); }},
      {label:ET('noble','decline','label',V), fx(){ S.rep=clamp(S.rep-1); return ET('noble','decline','res',V); }}]};
  }},
  {w:2, ok:()=>S.flags.guild>=1 && anyW(w=>w.job!=='rest' && w.energy>=30).length>0, make(){
    const w = weighted(anyW(x=>x.job!=='rest' && x.energy>=30), x=>s100(x.stats.charm)+x.popularity);
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
];
// she asks for a raise once her skills have outgrown her wage
function underpaid(w){ const B = BAL.wages; return !isFree(w) && w.wage < wageFor(w) * ((has(w,'Ambitious')||has(w,'Greedy')) ? B.askAtAmbitious : B.askAt); }
function evIncident(h){
  const sec = S.workers.find(w=>w.house===h.id && w.job==='security'), c = ri(60,120), V = {house:h.name, guard: sec ? sec.name : '', gold:fmt(c)};
  const ch = [
    {label:ET('incident','sam','label',V), fx(){ if(S.sam.strength + S.sam.charm/2 + rnd(0,60) > 60){ h.rep=clamp(h.rep+2); samStat('strength',1); return ET('incident','sam','win',V); } S.sam.energy=Math.max(0,S.sam.energy-30); h.rep=clamp(h.rep-1); return ET('incident','sam','lose',V); }},
    {label:ET('incident','pay','label',V), fx(){ S.gold-=c; return ET('incident','pay','res',V); }}
  ];
  if(sec) ch.unshift({label:ET('incident','guard','label',V), fx(){ sec.trust=clamp(sec.trust+3); h.rep=clamp(h.rep+1); return ET('incident','guard','res',V); }});
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
    text: s>=3 ? `Marguerite Vane adjusts her monocle. "Three strikes, Mr. Takahashi. Your properties now belong to the Credit House."` : `Marguerite Vane adjusts her monocle. "You've missed a payment, Mr. Takahashi. Strike ${s} of three. The shortfall carries over, with interest. I'd hate to see you on the street. Truly."`,
    choices:[{label: s>=3?'...':'Understood', fx(){ return ''; }}]};
}
function evHilde(){
  const h = makeNamed('hilde'); NPCS[h.id] = h;
  return {title:'A Dwarf at the Bar', who:h.id, scene:'portrait', text:`The new bar isn't even finished when a red-braided dwarf walks in, inspects the taps, and declares them adequate. "Hilde Ironsong. I need a bar, you have a bar. I'll work for wages. No bonus."`, choices:[
    {label:'Hire her on the spot', fx(){ h.job='bartender'; h.contract=12; h.house=curH().id; S.workers.push(h); delete NPCS[h.id]; checkUnlocks(true); return 'Hilde rolls up her sleeves. The bar is open.'; }},
    {label:'Maybe later', fx(){ h.signing=0; S.candidates.push(h); delete NPCS[h.id]; return 'She leaves her name at the front desk. (Added to candidates.)'; }}]};
}
function checkEnd(){
  if(!S) return;
  if(S.debt.strikes>=3 && !S.over){
    S.over = true; save();
    modal(`<h2>Game Over</h2><p class="story">The Credit House takes the deeds. Sam is out on the street with a hoodie, a status window, and a lot of feelings.\n\nYou lasted ${S.week-1} weeks.</p><div class="row"><button class="primary" onclick="restart()">New game</button></div>`, {lock:true});
  } else if(S.debt.remaining<=0 && !S.won){
    S.won = true; save();
    modal(`<h2>Debt Paid! 🎉</h2><p class="story">Marguerite Vane stamps the final receipt. "Paid in full. I confess, Mr. Takahashi, I had money on you failing." She almost smiles.\n\nEverything you've built is yours, free and clear.\n\nNew Game+ is now unlocked: keep ${HOUSES[homeHouse()].name}, your partner and your progress, and take on a second house with a bigger debt. You can start it now or any time later from the top bar.</p><div class="row"><button onclick="closeModal()">Keep playing</button><button class="primary" onclick="startNGPlus()">New Game+…</button></div>`);
  }
}
function restart(){ store.del(KEY_SAVE); EVQ=[]; S=null; closeModal(); TAB='house'; startSetup(); }
