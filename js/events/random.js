'use strict';
function evHaunt(h){
  const v = S.workers.find(w=>w.key==='vesper');
  return {title:`${h.name}: Things That Go Bump`, who: v?v.id:null, scene:'casual', text: pick([
    'Every candle in the east wing lights itself at midnight. Three guests faint. Four ask if they can book that room again.',
    'A portrait in the hallway has started winking at guests. Business is up.',
    'Something rearranged all the furniture in the lounge overnight. Into a much better layout, honestly.']),
    choices:[{label:'Lean into it', fx(){ h.rep=clamp(h.rep+2); return 'Word spreads. Thrill-seekers line up. +reputation.'; }},
             {label:'Call an exorcist (60g)', fx(){ if(S.gold<60) return 'You can\'t afford one.'; S.gold-=60; if(v) v.trust=clamp(v.trust-5); return v?`The exorcist leaves in tears. ${v.name} is offended you asked.`:'The exorcist leaves in tears.'; }}]};
}
function pickRandomEvent(){ const opts = RANDOM_EVENTS.filter(e=>e.ok()); if(!opts.length) return null; const e = weighted(opts, e=>e.w); return ()=> e.ok() ? e.make() : null; }
const anyW = f => S.workers.filter(f);
const RANDOM_EVENTS = [
  {w:3, ok:()=>anyW(w=>w.mood<55 && w.job!=='rest').length>0, make(){
    const w = pick(anyW(x=>x.mood<55 && x.job!=='rest'));
    return {title:'A Small Request', who:w.id, scene:'casual', text:`${w.name} catches Sam in the hallway. "Could I take a few days off? I'm running on fumes."`, choices:[
      {label:'Of course', fx(){ w.energy=clamp(w.energy+30,0,maxEnergy(w)); w.mood=clamp(w.mood+10); w.trust=clamp(w.trust+5); return `${w.name} looks relieved. "Thanks, boss."`; }},
      {label:'Not this week', fx(){ const soft = ['Warm and motherly','Shy but earnest','Laid-back and lazy'].includes(w.personality); w.trust=clamp(w.trust-(soft?3:6)); w.mood=clamp(w.mood-5); return soft ? `${w.name} says she understands. She looks very tired.` : `${w.name} nods stiffly and goes back to work.`; }}]};
  }},
  {w:2, ok:()=>S.rep>=20 && anyW(w=>w.stats.refinement>=45 && w.energy>=30).length>0, make(){
    const w = weighted(anyW(x=>x.stats.refinement>=45 && x.energy>=30), x=>x.stats.refinement);
    const pay = Math.round(150 + w.stats.refinement*3 + S.rep*2);
    return {title:'A Noble Invitation', who:w.id, scene:'companion', text:`A messenger in house livery requests ${w.name}'s company for a private dinner at a nobleman's estate. The offered fee: ${fmt(pay)}.`, choices:[
      {label:'Ask her if she wants to go', fx(){ if(w.lewd>=15 || w.trust>=30){ S.gold+=pay; w.popularity=clamp(w.popularity+5); w.energy=clamp(w.energy-25,0,maxEnergy(w)); S.rep=clamp(S.rep+2); return `${w.name} agrees and returns the next morning with the fee and a smug smile. +${fmt(pay)}, +renown.`; } w.trust=clamp(w.trust+2); return `${w.name} politely passes. Sam sends regrets. She appreciates being asked.`; }},
      {label:'Decline politely', fx(){ S.rep=clamp(S.rep-1); return 'The messenger sniffs and leaves.'; }}]};
  }},
  {w:2, ok:()=>S.flags.guild>=1 && anyW(w=>w.job!=='rest' && w.energy>=30).length>0, make(){
    const w = weighted(anyW(x=>x.job!=='rest' && x.energy>=30), x=>x.stats.charm+x.popularity);
    const pay = Math.round(rnd(120,240) * (1+S.rep/150));
    return {title:'Guild Celebration', who:w.id, scene:'companion', text:`Hanna sends word: a party just cleared a dungeon floor and wants company for their victory feast. They asked for ${w.name} by name. Fee: ${fmt(pay)}.`, choices:[
      {label:`Send ${w.name}`, fx(){ S.gold+=pay; w.energy=clamp(w.energy-20,0,maxEnergy(w)); w.popularity=clamp(w.popularity+4); w.mood=clamp(w.mood+5); return `It goes great. ${w.name} comes back with the fee and three new admirers. +${fmt(pay)}.`; }},
      {label:'Pass this time', fx(){ return 'Hanna sends back a sad-face doodle.'; }}]};
  }},
  {w:2, ok:()=>S.week>=5 && !S.flags.taunt, make(){
    S.flags.taunt = true;
    return {title:'The Velvet Thorn', who:'npc_isolde', scene:'portrait', text:`A tall demon woman in red velvet sweeps into the lobby and looks around like she's pricing the furniture. "Lady Isolde Thorne, of the Velvet Thorn. I came to see what the newcomer bought." Her gaze settles on Sam's hoodie. "...Charming."`, choices:[
      {label:'Banter back', fx(){ if(S.sam.charm + rnd(0,50) > 40){ S.rep=clamp(S.rep+3); samStat('charm',2); return 'Sam lands a surprisingly good comeback. Isolde laughs despite herself. Word gets around. +renown.'; } S.rep=clamp(S.rep-1); return 'Sam\'s comeback arrives about ten seconds late. Isolde is already gone.'; }},
      {label:'Stay polite', fx(){ return '"We\'ll see how long you last," she says, and leaves.'; }}]};
  }},
  {w:2, ok:()=>S.week>=10 && S.rep>=30 && !S.flags.poachCD && anyW(w=>w.trust<50 && !has(w,'Loyal') && !isFree(w) && !w.locked).length>0, make(){
    S.flags.poachCD = 8;
    const w = pick(anyW(x=>x.trust<50 && !has(x,'Loyal') && !isFree(x) && !x.locked));
    return {title:'An Offer from the Thorn', who:w.id, scene:'portrait', text:`${w.name} admits Isolde Thorne offered her a position at the Velvet Thorn, with better pay. She hasn't decided.`, choices:[
      {label:'Offer a raise (+30%)', fx(){ w.wage=Math.round(w.wage*1.3); w.trust=clamp(w.trust+5); return `${w.name} stays. "Okay. You actually value me. Noted."`; }},
      {label:'Talk it through', fx(){ if(Math.random() < (w.trust+w.mood)/130){ w.trust=clamp(w.trust+8); return `They talk for an hour. ${w.name} decides she'd rather stay.`; } S.workers=S.workers.filter(x=>x!==w); addLog(`${w.name} left for the Velvet Thorn.`); return `${w.name} hugs Sam goodbye. She's going.`; }},
      {label:'Let her choose', fx(){ if(Math.random() < w.trust/60+0.2) return `${w.name} turns Isolde down.`; S.workers=S.workers.filter(x=>x!==w); addLog(`${w.name} left for the Velvet Thorn.`); return `${w.name} takes the offer.`; }}]};
  }},
  {w:2, ok:()=>true, make(){
    const g = ri(40,150);
    return {title:'Lucky Break', text:pick([`A regular leaves a coin purse "as a tip." It holds ${fmt(g)}.`,`Sam finds ${fmt(g)} hidden behind a loose brick in the cellar. The old owner had secrets.`,`A merchant pays ${fmt(g)} for the ugliest painting in the house. Nobody asks why.`]), choices:[{label:'Nice', fx(){ S.gold+=g; return ''; }}]};
  }},
  {w:1.5, ok:()=>S.gold>=200, make(){
    const fee = Math.max(30, Math.round(S.gold*0.1));
    return {title:'The Inspector', text:`A city inspector with a clipboard announces Sam owes "licensing fees." He says ${fmt(fee)}, but he sounds like he's improvising.`, choices:[
      {label:`Pay ${fmt(fee)}`, fx(){ S.gold-=fee; return 'He leaves satisfied.'; }},
      {label:'Argue the paperwork', fx(){ if(S.sam.business + rnd(0,60) > 55){ samStat('business',2); return 'Sam cites three ordinances that don\'t exist with total confidence. The inspector leaves, confused. No fee.'; } const f=Math.round(fee*2); S.gold-=f; S.rep=clamp(S.rep-2); return `It does not go well. ${fmt(f)} and a lecture.`; }}]};
  }},
  {w:1.5, ok:()=>S.workers.length>=2, make(){
    const [a,b] = [...S.workers].sort(()=>Math.random()-0.5);
    return {title:'Friends', who:a.id, scene:'casual', text:`${a.name} and ${b.name} have started taking their breaks together. Things feel a bit warmer.`, choices:[{label:'Good to hear', fx(){ a.mood=clamp(a.mood+8); b.mood=clamp(b.mood+8); return ''; }}]};
  }},
  {w:1.5, ok:()=>anyW(w=>w.trust>=60 && !ARCS[w.key]).length>0, make(){
    const w = pick(anyW(x=>x.trust>=60 && !ARCS[x.key]));
    return {title:'A Quiet Moment', who:w.id, scene:'sam_date', text:`${w.name} finds Sam on the back steps after closing and sits next to him. "You know, you're not what I expected. In a good way."`, choices:[{label:'Stay and talk', fx(){ w.trust=clamp(w.trust+3); w.mood=clamp(w.mood+5); samStat('charm',1); return 'They watch the two moons rise.'; }}]};
  }},
  {w:1.5, ok:()=>anyW(w=>w.lewd>=45 && w.trust>=25 && w.privateCount===0).length>0, make(){
    const w = pick(anyW(x=>x.lewd>=45 && x.trust>=25 && x.privateCount===0));
    return {title:'A Knock at the Door', who:w.id, scene:'casual', text:`Late at night there's a knock on Sam's door. It's ${w.name}, leaning on the frame. "So I hear the new boss has never... you know." She grins. "That's just sad. Want a tour?"`, choices:[
      {label:'Let her in', fx(){ w.privateCount++; w.lewd=clamp(w.lewd+3); w.mood=clamp(w.mood+8); samStat('technique',3); if(S.sam.first){ S.sam.first=false; return `${w.name} turns out to be a patient and extremely amused teacher. Sam turns out to be a quick study. The door closes.`; } return 'The door closes.'; }},
      {label:'Politely decline', fx(){ w.trust=clamp(w.trust+2); return `${w.name} laughs. "Offer stands, boss."`; }}]};
  }},
  {w:2, ok:()=>anyW(w=>!isFree(w) && (has(w,'Ambitious')||has(w,'Greedy')) && w.wage < wageFor(w)*0.95).length>0, make(){
    const w = pick(anyW(x=>!isFree(x) && (has(x,'Ambitious')||has(x,'Greedy')) && x.wage < wageFor(x)*0.95)); const nw = wageFor(w);
    return {title:'Raise Request', who:w.id, scene:'portrait', text:`${w.name} plants herself in front of Sam's desk. "I'm worth more than ${fmt(w.wage)} a week, and we both know it. ${fmt(nw)}."`, choices:[
      {label:`Agree (${fmt(nw)}/wk)`, fx(){ w.wage=nw; w.trust=clamp(w.trust+3); w.mood=clamp(w.mood+5); return `"Pleasure doing business."`; }},
      {label:'Refuse', fx(){ const pr = ['Proud and sharp-tongued','Hot-blooded and competitive'].includes(w.personality) ? 2 : 1; w.mood=clamp(w.mood-8*pr); w.trust=clamp(w.trust-4*pr); return pr>1 ? `${w.name} stares at Sam for a long, cold moment. She won't forget this.` : `${w.name} leaves without a word.`; }}]};
  }}
];
function evIncident(h){
  const sec = S.workers.find(w=>w.house===h.id && w.job==='security');
  const ch = [
    {label:'Sam steps in', fx(){ if(S.sam.strength + S.sam.charm/2 + rnd(0,60) > 60){ h.rep=clamp(h.rep+2); samStat('strength',1); return 'Sam talks him down. Mostly by being so polite it\'s confusing. +reputation.'; } S.sam.energy=Math.max(0,S.sam.energy-30); h.rep=clamp(h.rep-1); return 'Sam takes a punch, then the drunk falls asleep on his own. Sam gets a black eye and a lot of sympathy.'; }},
    {label:'Pay for the damage', fx(){ const c=ri(60,120); S.gold-=c; return `Broken chairs and a cracked mirror: ${fmt(c)}.`; }}
  ];
  if(sec) ch.unshift({label:`Let ${sec.name} handle it`, fx(){ sec.trust=clamp(sec.trust+3); h.rep=clamp(h.rep+1); return `${sec.name} throws him out in about four seconds. The regulars applaud.`; }});
  return {title:`Trouble at ${h.name}`, who:sec?sec.id:null, scene:'job_security', text:'A drunk adventurer starts shoving furniture and shouting about a refund for a service he never actually paid for.', choices:ch};
}
function evRenew(w){
  if(!S.workers.includes(w) || isFree(w) || w.locked) return null;
  const bonus = Math.round(w.wage*2);
  return {title:'Contract Renewal', who:w.id, scene:'portrait', text:`${w.name}'s contract is up. Renewing for 12 weeks costs a ${fmt(bonus)} bonus.`, choices:[
    {label:`Renew (${fmt(bonus)})`, fx(){ if(S.gold<bonus){ w.contract=4; return 'You can\'t afford it right now. She agrees to stay on for 4 more weeks while you sort it out.'; }
      const ok = has(w,'Loyal') || Math.random() < clamp((w.trust + w.mood/2)/70, 0.2, 1);
      if(ok){ S.gold-=bonus; w.contract=12; return `${w.name} signs again.`; }
      w.contract=2; return `${w.name} hesitates. "I need a better offer." (She'll stay 2 more weeks. Try a raise or spending time with her.)`; }},
    {label:`Raise +20% and renew (${fmt(bonus)})`, fx(){ if(S.gold<bonus){ w.contract=4; return 'You can\'t afford it right now. She\'ll stay 4 more weeks.'; } if(w.mood<20){ w.contract=2; return 'She\'s too unhappy to commit. Two more weeks.'; } S.gold-=bonus; w.wage=Math.round(w.wage*1.2); w.contract=12; w.trust=clamp(w.trust+4); return `${w.name} signs with a grin.`; }},
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
    modal(`<h2>Debt Paid! 🎉</h2><p class="story">Marguerite Vane stamps the final receipt. "Paid in full. I confess, Mr. Takahashi, I had money on you failing." She almost smiles.\n\nEverything you've built is yours, free and clear. (You can keep playing.)</p><div class="row"><button class="primary" onclick="closeModal()">Keep playing</button></div>`);
  }
}
function restart(){ store.del(KEY_SAVE); EVQ=[]; S=null; closeModal(); TAB='house'; startSetup(); }
