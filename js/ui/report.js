'use strict';
/* =====================================================================
   WEEKLY REPORT MODAL
   ===================================================================== */
// Weekly report: three levels. 'all' (every house: ledger, houses, notes, a table of ladies), 'h:<house id>' (that house's numbers and
// each lady's card with her two highlights), 'w:<lady id>' (her card and every encounter she had; saved images show by default, SET.repImg;
// per service SET.svcImg: show saved / generate / hide / fold away, set in Settings or the picker beside each group).
// Wide screens get a side list of views; narrow ones a dropdown (css .rep-nav / .rep-sel).
let REPV = null;
// Ladies in the report follow the roster's order (Filters & sort: default rank, or the chosen sort); anyone who left goes last.
function repPer(R, hid){
  const idx = new Map(S.workers.map((w,i)=>[w.id, i])), live = id => S.workers[idx.get(id)];
  const ps = Object.values(R.per||{}).filter(p=>!hid || p.house===hid), ord = new Map(rosterOrder(ps.map(p=>live(p.id)).filter(Boolean)).map((w,i)=>[w.id, i]));
  const k = ROSTER_VIEW.sort, val = p => { const w = live(p.id); return w && k ? (w[k]||0) : 0; };
  return ps.slice().sort((a,b)=>(k ? val(b)-val(a) : 0) || (ord.get(a.id) ?? 1e9) - (ord.get(b.id) ?? 1e9));
}
// Prev/next buttons for a house or lady page (shown above and below it)
function repPN(R, v){
  const hs = (R.houses||[]).filter(h=>Object.values(R.per||{}).some(p=>p.house===h.id));
  if(v.startsWith('h:')){ const i = hs.findIndex(h=>h.id===v.slice(2)), prev = hs[i-1], next = hs[i+1];
    return `<div class="row rep-pn"><button class="sm" onclick="repGo('all')">← All houses</button>${prev?`<button class="sm" onclick="repGo('h:${prev.id}')">‹ ${esc(prev.name)}</button>`:''}${next?`<button class="sm" onclick="repGo('h:${next.id}')">${esc(next.name)} ›</button>`:''}</div>`; }
  const p = (R.per||{})[v.slice(2)] || Object.values(R.per||{}).find(x=>x.id===v.slice(2)); if(!p) return '';
  const ps = repPer(R, p.house), i = ps.findIndex(x=>x.id===p.id), prev = ps[i-1], next = ps[i+1], h = (R.houses||[]).find(x=>x.id===p.house);
  return `<div class="row rep-pn">${h?`<button class="sm" onclick="repGo('h:${h.id}')">← ${esc(h.name)}</button>`:''}${prev?`<button class="sm" onclick="repGo('w:${prev.id}')">‹ ${esc(prev.name)}</button>`:''}${next?`<button class="sm" onclick="repGo('w:${next.id}')">${esc(next.name)} ›</button>`:''}</div>`;
}
function showReport(R, fromWeek){
  if(!R) return;
  REPV = {R, fromWeek:!!fromWeek, view:'all'};
  const per = repPer(R), hs = (R.houses||[]).filter(h=>per.some(p=>p.house===h.id));
  const navItem = (v, label, cls) => `<button class="rep-tab ${cls||''}" data-v="${esc(v)}" onclick="repGo('${esc(v)}')">${label}</button>`;
  // side list: the houses, and under the house being viewed only that house's ladies (repGo shows/hides them)
  const nav = navItem('all','📊 All houses') + hs.map(h=>navItem('h:'+h.id, '🏠 '+esc(h.name)) + per.filter(p=>p.house===h.id).map(p=>navItem('w:'+p.id, esc(p.name), 'sub" data-h="'+esc(h.id))).join('')).join('');
  const opts = `<option value="all">📊 All houses</option>` + hs.map(h=>`<option value="h:${esc(h.id)}">🏠 ${esc(h.name)}</option>` + per.filter(p=>p.house===h.id).map(p=>`<option value="w:${esc(p.id)}">   · ${esc(p.name)}</option>`).join('')).join('');
  modal(`<h2>Week ${R.week} Report</h2>
    <select class="rep-sel" onchange="repGo(this.value)">${opts}</select>
    <div class="rep"><nav class="rep-nav">${nav}</nav><div class="rep-main" id="repMain"></div></div>
    <div class="row" style="margin-top:12px"><button class="primary" onclick="REPV=null;closeModal();${fromWeek?'runQueue()':''}">Continue</button></div>`, {lock:!!fromWeek, wide:true});
  repGo('all');
}
function repGo(v){
  if(!REPV) return; const R = REPV.R, main = $('#repMain'); if(!main) return;
  REPV.view = v;
  document.querySelectorAll('.rep-tab').forEach(b=>b.classList.toggle('on', b.dataset.v===v));
  const curHid = v.startsWith('h:') ? v.slice(2) : v.startsWith('w:') ? (((R.per||{})[v.slice(2)]||{}).house) : null;
  document.querySelectorAll('.rep-tab.sub').forEach(b=>{ b.style.display = b.dataset.h===curHid ? '' : 'none'; });
  const sel = document.querySelector('.rep-sel'); if(sel) sel.value = v;
  main.innerHTML = v.startsWith('h:') ? repHouse(R, v.slice(2)) : v.startsWith('w:') ? repLady(R, v.slice(2)) : repAll(R);
  main.scrollTop = 0; const m = $('#modal'); if(m && window.innerWidth <= 760) m.scrollTop = 0;
  if(v.startsWith('w:')) repShowSaved(R, v.slice(2));
}
const repLink = (v, label) => `<a href="#" onclick="repGo('${esc(v)}');return false">${label}</a>`;
function repWaitTxt(h, full){
  if(h.left || h.stopped){
    const parts = [];
    if(h.left) parts.push(`${h.left} ${full?'left unhappy':'left'}`);
    if(h.stopped) parts.push(`${h.stopped} ${full?'held at door':'held'}`);
    return parts.join(', ');
  }
  return h.turned ? `${h.turned} turned away` : '';
}
function repHouseExtra(h){
  if(h.roomCap===undefined) return '';
  const pu = h.pushy||{};
  const prTxt = h.prestige!==undefined ? ` · class ${Math.round(h.prestige0??h.prestige)}→<b>${Math.round(h.prestige)}</b> (${prestigeTier(h.prestige).label}${h.prestigeReasons&&h.prestigeReasons.length?`: ${h.prestigeReasons.map(x=>`<span class="${x.d>0?'good':'warn'}">${x.d>0?'+':'−'} ${esc(x.t)}</span>`).join(', ')}`:''})` : '';
  return `rooms ${h.roomsUsed}/${h.roomCap}${h.short?` <span class="warn">(short on rooms)</span>`:''}${h.crowdOver?` · <span class="warn">crowded ${h.guestsIn}/${h.crowdCap}</span>`:''} · tidiness ${Math.round(h.tidy0)}→<b class="${h.tidy>=BAL.tidy.high?'good':h.tidy<BAL.tidy.low?'warn':''}">${Math.round(h.tidy)}</b>${prTxt}${h.promoDraw?` · promoter draw +${Math.round(h.promoDraw)}`:''}${h.stepIn?` · stepped in for ${h.stepIn}`:''}${h.waited||h.left||h.stopped?` · ${[h.waited?`${h.waited} waited`:'',h.left?`${h.left} left`:'',h.stopped?`${h.stopped} held at door`:''].filter(Boolean).join(', ')}`:''}${h.selfProps?` · restless ladies made ${h.selfProps} proposition${h.selfProps>1?'s':''} themselves`:''}${pu.total?` · pushy clients ${pu.total}: <span class="good">${(pu.talked||0)+(pu.security||0)+(pu.sam||0)} handled</span>${(pu.samfail||0)+(pu.none||0)?`, <span class="warn">${(pu.samfail||0)+(pu.none||0)} went badly</span>`:''}`:''}${ctraitsLine(h)}`;
}
function repAll(R){
  const net = R.income - R.wages - R.upkeep - (R.cuts||0) - (R.recharge||0) - (R.tutor||0), L = R.led;
  const ledger = [['Escort fees',L.escort],['Propositions',L.offduty],['Bar',L.bar],['Stage',L.dance],['Bathhouse',L.bath],['Chapel donations',L.chapel],['Hosting',L.host],['Guild contracts',L.guild],['Office (the books)',L.office]].filter(x=>x[1]).map(([k,v])=>`<tr><td>${k}</td><td class="good">+${fmt(v)}</td></tr>`).join('')
    + `<tr><td>Wages</td><td class="warn">−${fmt(R.wages)}</td></tr><tr><td>Upkeep</td><td class="warn">−${fmt(R.upkeep)}</td></tr>` + (R.cuts ? `<tr><td>Profit cuts</td><td class="warn">−${fmt(R.cuts)}</td></tr>` : '') + (R.recharge ? `<tr><td>Recharging</td><td class="warn">−${fmt(R.recharge)}</td></tr>` : '') + (R.tutor ? `<tr><td>Tutors</td><td class="warn">−${fmt(R.tutor)}</td></tr>` : '')
    + (L.sam?`<tr><td class="muted">Sam's bar shifts (already in your purse)</td><td class="good">+${fmt(L.sam)}</td></tr>`:'')
    + `<tr><th>Net</th><th class="${net>=0?'good':'warn'}">${fmt(net)}</th></tr>`;
  const houseRows = (R.houses||[]).map(h=>{ const wt = repWaitTxt(h, false); return `<tr><td>${repLink('h:'+h.id, esc(h.name))}</td><td>${h.served}${wt?` <span class="${h.left?'warn':'muted'}">(${wt})</span>`:''}</td><td>${fmt(h.income)}</td><td>${fmt(h.upkeep)}</td><td>${Math.round(h.avgSat)}</td><td>${Math.round(h.rep)}</td><td>${h.prestige!==undefined?`${Math.round(h.prestige)} <span class="muted">(${prestigeTier(h.prestige).label})</span>`:'—'}</td></tr>`; }).join('');
  const per = repPer(R);
  const ladyRows = (R.houses||[]).map(h=>{ const ps = per.filter(p=>p.house===h.id); if(!ps.length) return '';
    return `<tr><th colspan="6" style="text-align:left">${repLink('h:'+h.id, esc(h.name))}</th></tr>` + ps.map(p=>{ const n = R.hl.filter(x=>x.wid===p.id).length;
      return `<tr><td>${repLink('w:'+p.id, esc(p.name))}</td><td>${esc(jobLabelOf(p))}</td><td>${p.served||0}</td><td>${p.earned?fmt(p.earned):'—'}</td><td>${p.m0}→<span class="${p.m1>=p.m0?'good':'warn'}">${p.m1}</span></td><td>${n?`${n} 📜`:''}${p.night==='good'?' <span class="good">★</span>':p.night==='bad'?' <span class="warn">!</span>':''}</td></tr>`; }).join(''); }).join('');
  const allWt = repWaitTxt(R, true);
  return `<div class="grid2"><div>Clients served: <b>${R.served}</b>${allWt?` <span class="${R.left||(!R.stopped&&R.turned)?'warn':'muted'}">(${allWt}; more staff or rooms needed)</span>`:''}</div>
      <div>Avg. satisfaction: <b>${Math.round(R.avgSat)}</b> · Renown: <b>${Math.round(R.rep)}</b></div></div>
    <div class="grid2"><div><h3 style="margin-top:10px">Ledger</h3><table>${ledger}</table></div>
      <div><h3 style="margin-top:10px">Houses</h3><table><tr><th>House</th><th>Clients</th><th>Income</th><th>Upkeep</th><th>Sat.</th><th>Pop.</th><th>Class</th></tr>${houseRows}</table></div></div>
    ${(R.houses||[]).map(h=>{ const x = repHouseExtra(h); return x ? `<div class="muted"><b>${esc(h.name)}</b>: ${x}</div>` : ''; }).join('')}
    ${(R.samActs&&R.samActs.length) || (R.samFem&&R.samFem.length) ? `<h3 style="margin-top:10px">Sam's week</h3>${R.samActs&&R.samActs.length?`<div class="muted">${R.samActs.map(esc).join(' · ')}</div>`:''}${repSamFem(R)}` : ''}
    ${R.lines.length?`<h3 style="margin-top:10px">Notes</h3>${R.lines.map(l=>`<div>${esc(l)}</div>`).join('')}`:''}
    <h3 style="margin-top:10px">Ladies</h3>${ladyRows ? `<table class="rep-ladies"><tr><th>Name</th><th>Job</th><th>Clients</th><th>Earned</th><th>Mood</th><th></th></tr>${ladyRows}</table>` : '<p class="muted">Nobody worked this week.</p>'}`;
}
// her card: who she is, what she did, how the week went
function repHead(p){
  const w = findAny(p.id) || {id:p.id, name:p.name};
  const svc = Object.entries(p.acts||{}).map(([id,n])=>`<span class="tag act">${esc(actLabel(id))} ×${n}</span>`).join('') + (p.comp?`<span class="tag">Company ×${p.comp}</span>`:'') + (p.draw?`<span class="tag">Draw +${Math.round(p.draw)} clients${p.samples?' (samples)':''}</span>`:'') + Object.entries(p.samp||{}).map(([id,n])=>`<span class="tag act">Free sample: ${esc(actLabel(id))} ×${n}</span>`).join('') + (p.tidied?`<span class="tag">Tidied +${Math.round(p.tidied)}</span>`:'') + (p.tended?`<span class="tag">Tended ~${p.tended} visitors</span>`:'') + (p.taught!==undefined?`<span class="tag">Taught ${p.taught}</span>`:'') + (p.learned?`<span class="tag">Learned +${p.learned}</span>`:'') + (p.stepIn?`<span class="tag">Stepped in ×${p.stepIn}</span>`:'') + (p.pushy?`<span class="tag">Pushy clients ×${p.pushy}</span>`:'');
  return `<div class="head">${w.design?avatarHTML(w):''}<div><b>${esc(p.name)}</b> · ${esc(jobLabelOf(p))}${p.earned?` · earned <b>${fmt(p.earned)}</b>`:''}
    <div class="muted">${p.served?`${p.served} client${p.served>1?'s':''} · `:''}${p.props?`propositioned ${p.props}× · accepted ${p.acc} · `:''}${p.reluct?`<span class="pink">${p.reluct} as a favor</span> · `:''}${p.notMood?`<span class="warn">not in the mood ×${p.notMood}</span> · `:''}${p.noRoom?`<span class="warn">no room ×${p.noRoom}</span> · `:''}${p.eWork===undefined?`Energy ${p.e0}→${p.e1} · Mood ${p.m0}→${p.m1}${p.why&&p.why.length?` <span class="muted">(${p.why.map(x=>`<span class="${x.good?'good':'warn'}">${esc(x.t)}</span>`).join(', ')})</span>`:''}${p.slept?` · slept: ${p.slept}`:''}`:''}${p.solo?' · <span class="pink">a night to herself</span>':''}${p.missed?' · <span class="warn">missed Sam</span>':''}${p.night==='good'?' · <span class="good">great week</span>':p.night==='bad'?' · <span class="warn">rough week</span>':''}${p.lust!==undefined?` · lust ${p.l0!==undefined?p.l0+'→':''}${p.lust}`:''}</div>
    <div>${svc}</div>${(p.notes||[]).map(n=>`<div class="muted">${esc(n)}</div>`).join('')}</div></div>`;
}
// What changed for her this week and why (house and lady pages): mood reasons, energy spent vs slept off, what capped her
// clients, and every stat/skill/service that moved. Older reports (no t1) only get what they recorded.
const sgn = (n, f) => (n>0?'+':n<0?'−':'') + (f ? f(Math.abs(n)) : Math.abs(Math.round(n)));
function repWhy(p){
  const out = [], cls = n => n>0 ? 'good' : n<0 ? 'warn' : '';
  const chg = (label, a, b, f) => { if(a===undefined || b===undefined) return ''; const d = b - a; if(Math.abs(d) < 0.05) return ''; return `${label} <span class="${cls(d)}">${sgn(d, f)}</span>`; };
  const W = (p.why||[]), good = W.filter(x=>x.good).map(x=>esc(x.t)), bad = W.filter(x=>!x.good).map(x=>esc(x.t));
  if(p.m0!==undefined && p.m1!==undefined) out.push(`<div><b>Mood</b> ${p.m0}→<span class="${cls(p.m1-p.m0)}">${p.m1}</span>${bad.length?` · <span class="warn">down: ${bad.join(', ')}</span>`:''}${good.length?` · <span class="good">up: ${good.join(', ')}</span>`:''}${p.disN?` · ${p.disN} service${p.disN>1?'s':''} she dislikes`:''}${p.reluct?` · ${p.reluct} as a favor`:''}${p.grudging?` · ${p.grudging} grudging proposition${p.grudging>1?'s':''}`:''}</div>`);
  if(p.eWork!==undefined) out.push(`<div><b>Energy</b> ${p.e0}→${p.e1} · spent ${p.eWork} working${p.solo?' (and a night alone)':''} · ${p.eNight?`slept off ${p.eNight} between nights, `:''}recovered ${p.eRec} on the ${p.job==='rest'?'week off':'rest day'}${p.slept?` (${esc(p.slept)})`:''}</div>`);
  // clients and what held her back
  const lim = [];
  if(p.cap!==undefined){
    if(p.served >= p.cap) lim.push(`hit her limit of ${p.cap} clients over the nights`);
    else if(p.lowE) lim.push('ran low on energy');
    else if(!p.nightsLost && !p.noRoom) lim.push(`room for ${p.cap - p.served} more, but no more clients picked her`);
  }
  if(p.nightsLost) lim.push(`<span class="warn">${p.nightsLost} night${p.nightsLost>1?'s':''} cut short by a pushy client</span>`);
  if(p.noRoom) lim.push(`<span class="warn">no free room ×${p.noRoom}</span>`);
  if(p.notMood) lim.push(`<span class="warn">not in the mood ×${p.notMood}</span>`);
  if(p.fedOnly) lim.push(`<span class="warn">only feeding services ×${p.fedOnly}</span>`);
  if(p.solo) lim.push('<span class="pink">spent a night alone</span>');
  if(p.accProp && p.job && !(JOBS[p.job]||{}).must) lim.push(`propositions took time from her job (${p.accProp})`);
  const es = p.encSum;
  const cl = p.served || p.props || (es && (es.svc+es.no+es.comp)) ? `${p.served?`${p.served} client${p.served>1?'s':''}`:''}${es?`${p.served?' · ':''}${es.svc} service${es.svc===1?'':'s'}, ${es.comp} company only${es.no?`, ${es.no} turned down`:''}`:''}${p.props?` · propositioned ${p.props}×, accepted ${p.acc}`:''}` : '';
  if(cl || lim.length) out.push(`<div><b>Clients</b> ${cl || 'none'}${lim.length?` · ${lim.join(' · ')}`:''}</div>`);
  // stat/skill/service movement
  const mv = [chg('Trust', p.t0, p.t1, v=>tDelta(v).replace(/^[+-]/,'')), chg('Lewdness', p.lw0, p.lw1, v=>lShow(v)), chg('Popularity', p.p0, p.p1, v=>Math.round(v*10)/10), p.l0!==undefined && p.lust!==undefined ? chg('Lust', p.l0, p.lust) : ''].filter(Boolean);
  const list = (o, lab) => Object.entries(o||{}).map(([k,v])=>`${esc(lab(k))} <span class="${cls(v)}">${sgn(v)}</span>`);
  const sk = [...list(p.dStats, k=>STAT_SHORT[k]||k), ...list(p.dTech, k=>TECH_LABEL[k]||k), ...list(p.dActs, k=>actLabel(k))];
  if(mv.length) out.push(`<div><b>Changes</b> ${mv.join(' · ')}</div>`);
  if(sk.length) out.push(`<div><b>Grew</b> ${sk.join(' · ')}</div>`);
  return out.length ? `<div class="rep-why muted" style="margin:4px 0 6px">${out.join('')}</div>` : '';
}
// One encounter's numbers: what he paid, his satisfaction, and how she came out of it.
function encLine(h){
  const D = h.d || {}, lab = {energy:'energy', mood:'mood', lust:'lust', lewd:'lewdness', pop:'popularity'}, f = {lewd:v=>lShow(v), pop:v=>Math.round(v*10)/10, energy:v=>Math.round(v), mood:v=>Math.round(v*10)/10, lust:v=>Math.round(v)};
  const bits = [];
  if(h.chapelProp) bits.push('left an offering at the chapel');
  else if(h.fee!==undefined) bits.push(h.fee ? `paid <b class="good">${fmt(h.fee)}</b>` : (h.sample ? 'free sample' : 'paid nothing'));
  if(h.sat!==undefined) bits.push(`sat. ${h.sat}`);
  Object.entries(D).forEach(([k,v])=>{ const s = sgn(v, f[k]); if(s.replace(/[+−]/,'')!=='0') bits.push(`${lab[k]||k} <span class="${(k==='energy' ? -v : v) > 0 ? 'good' : 'warn'}">${s}</span>`); });
  return bits.length ? `<div class="muted" style="font-size:12px">${bits.join(' · ')}</div>` : '';
}
// Lady page: her encounters grouped by what happened (one service, company, turned down, job moments), one picture per group.
function repGroups(R, p){
  const here = !!findAny(p.id), G = new Map();
  R.hl.forEach((h,i)=>{ if(h.wid!==p.id) return;
    const k = h.pairFuta ? 'pair' : h.scene==='solo' ? 'solo' : h.scene==='spirit_futa' ? 'poss' : h.act ? 'act:'+h.act+(h.csex ? '@'+h.csex : '') : h.job ? 'job' : h.outcome==='no' ? 'no' : h.where ? 'prop:'+h.where : 'comp';
    if(!G.has(k)) G.set(k, []); G.get(k).push({h,i}); });
  const title = k => k==='pair' ? 'With a housemate (reverse possession)' : k==='poss' ? 'Reverse possession' : k.startsWith('act:') ? actLabelFor(k.slice(4).split('@')[0], k.split('@')[1]) : k==='job' ? 'At work' : k==='solo' ? 'A night to herself' : k==='no' ? 'Turned down' : k.startsWith('prop:') ? 'Propositions that went nowhere' : 'Company only';
  return [...G.entries()].map(([k, list])=>{
    const first = list[0], fee = list.reduce((a,x)=>a+(x.h.fee||0),0), sats = list.filter(x=>x.h.sat!==undefined), avg = sats.length ? Math.round(sats.reduce((a,x)=>a+x.h.sat,0)/sats.length) : null;
    const img = here ? `<button class="sm" id="hl${first.i}_t" onclick="toggleImgBtn('hl${first.i}','${p.id}','${first.h.scene}')">🖼 Show image</button><div id="hl${first.i}" class="hlimg" data-ext="1"></div>` : '';
    const sk = svcImgKey(first.h.scene), sm = sk ? svcImgMode(first.h.scene, 'report') : '';
    const head = `<b>${esc(title(k))}</b>${list.length>1?` ×${list.length}`:''}${fee?` · <span class="good">${fmt(fee)}</span>`:''}${avg!==null?` · avg sat. ${avg}`:''}`;
    const body = list.map(({h})=>`<div class="hl">${esc(h.text)}${encLine(h)}</div>`).join('');
    const box = `<div class="rep-grp" style="margin:8px 0;padding-top:6px;border-top:1px solid rgba(127,127,127,.25)">`;
    if(sm==='fold') return `${box}<details><summary class="muted">${head} ${repImgPick(sk, sm)}</summary>${img}${body}</details></div>`;
    return `${box}<div>${head} ${img} ${sk ? repImgPick(sk, sm) : ''}</div>${body}</div>`;
  }).join('');
}
// Per-service picture setting, right on the lady's page (global: SET.svcImg, same as Settings → Pictures by service).
function repImgPick(key, cur){
  return `<select class="sm rep-imgpick" title="Pictures for every '${esc(svcImgLabel(key))}' entry on lady pages (Settings → Pictures by service)" onclick="event.stopPropagation()" onchange="setSvcImg('${esc(key)}', this.value);repGo(REPV.view)">${Object.entries(SVC_IMG_MODES).map(([m,l])=>`<option value="${m}" ${m===cur?'selected':''}>🖼 ${m?l:`Default (${SET.repImg!==false?'saved':'off'})`}</option>`).join('')}</select>`;
}
function repHouse(R, hid){
  const h = (R.houses||[]).find(x=>x.id===hid); if(!h) return repAll(R);
  const ps = repPer(R, hid), x = repHouseExtra(h), pn = repPN(R, 'h:'+hid);
  return `${pn}<h3>${esc(h.name)}</h3>
    <div class="grid2"><div>Clients: <b>${h.served}</b>${repWaitTxt(h, true)?` <span class="${h.left||(!h.stopped&&h.turned)?'warn':'muted'}">(${repWaitTxt(h, true)})</span>`:''} · Satisfaction <b>${Math.round(h.avgSat)}</b> · Popularity <b>${Math.round(h.rep)}</b> · Class <b>${h.prestige!==undefined?`${Math.round(h.prestige)} (${prestigeTier(h.prestige).label})`:'—'}</b></div><div>Income <b class="good">${fmt(h.income)}</b> · Upkeep <b class="warn">${fmt(h.upkeep)}</b></div></div>
    ${x?`<div class="muted">${x}</div>`:''}
    ${ps.map(p=>{ const n = R.hl.filter(z=>z.wid===p.id).length;
      return `<div class="rep-w">${repHead(p)}${repWhy(p)}<div class="row"><button class="sm" onclick="repGo('w:${p.id}')">📜 ${n ? `Her ${n} encounter${n>1?'s':''}` : 'Her week'} →</button></div></div>`; }).join('') || '<p class="muted">Nobody worked here this week.</p>'}
    <div style="margin-top:10px">${pn}</div>`;
}
function repLady(R, wid){
  const p = (R.per||{})[wid] || Object.values(R.per||{}).find(x=>x.id===wid); if(!p) return repAll(R);
  const hl = repGroups(R, p), pn = repPN(R, 'w:'+p.id);
  return `${pn}
    <div class="rep-w">${repHead(p)}${repWhy(p)}</div>
    <h3 style="margin-top:10px">Her clients</h3>${hl || '<p class="muted">Nothing worth writing down.</p>'}
    <div style="margin-top:10px">${pn}</div>`;
}
// Lady page: an encounter that already has a saved picture shows it straight away (nothing new is generated; 🖼 does that)
async function repShowSaved(R, wid){
  const w = findAny(wid); if(!w) return;
  for(const [i, h] of R.hl.entries()){
    if(h.wid!==wid) continue;
    if((REPV && REPV.hide && REPV.hide[wid+'|'+h.scene]) || (S && S.repHide && S.repHide[wid+'|'+h.scene])) continue;
    const box = $('#hl'+i); if(!box || box.dataset.key) continue;
    const sm = svcImgMode(h.scene, 'report');   // per service: show saved / generate / hide (default: SET.repImg)
    if(sm==='hide' || sm==='fold' || (!sm && SET.repImg === false)) continue;
    if(sm==='gen'){ box.dataset.hide = '0'; await showImg('hl'+i, wid, h.scene, null, 'auto'); if(!REPV || REPV.view!=='w:'+wid) return; continue; }
    const cloth = defaultCloth(w, h.scene);
    if(!(await imgGet(imgKey(w, h.scene, cloth))) && !(await imgGet(legacyKey(w, h.scene, cloth)))) continue;
    if(!REPV || REPV.view!=='w:'+wid || !box.isConnected) return;
    box.dataset.hide = '0'; showImg('hl'+i, wid, h.scene, null, 'manual');
  }
}
// Sam's week: the women who propositioned him on the Floor (week.js samProp → R.samFem), each with her picture (samfc scene)
function repSamFem(R){
  return (R.samFem||[]).map((f, i)=>{
    const L = FLAVOR.floor_woman || {}, lines = [].concat(L[f.act] || L._default || []), hn = (HOUSES[f.h]||{}).name || 'the house';
    const seed = (f.look * 7 + i * 13 + (f.fee||0)) % Math.max(1, lines.length);   // stable per entry, so re-renders keep the same line
    const text = (lines[seed] || '').replace(/\{ask\}/g, ((actById(f.act)||{}).ask||{}).client || 'for company').replace(/\{house\}/g, hn);
    const id = 'samfc'+i, scene = `samfc:${f.act}:${f.look}:${f.h}`;
    return `<div class="hl" style="margin-top:6px">${esc(text)} <span class="muted">· ${esc(samActLabel(f.act))} · <span class="good">${fmt(f.fee)}</span></span>
      <button class="sm" id="${id}_t" onclick="toggleImgBtn('${id}','npc_fclient_${f.look}','${scene}')">🖼 Show image</button><div id="${id}" class="hlimg" data-ext="1"></div></div>`;
  }).join('');
}
