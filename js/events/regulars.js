'use strict';
/* =====================================================================
   REGULAR CLIENTS
   Named men who keep coming back to a house, usually for one favorite lady.
   Numbers and all the words are in data/regulars.json; the choice logic is here.
   ===================================================================== */
const REG = needData('regulars');
const regQuirk = r => REG.quirks[r.quirk] || {label:r.quirk, desc:'', tip:1, drama:0};
const regFill = (t, r, w, extra={}) => String(Array.isArray(t) ? pick(t) : t||'').replace(/\{(\w+)\}/g, (m,k)=>{
  const c = Object.assign({regular:r ? r.name : '', name:w ? w.name : 'her', house: r && S.houses.find(h=>h.id===r.house) ? S.houses.find(h=>h.id===r.house).name : 'the house'}, extra);
  return c[k]!==undefined ? String(c[k]) : m;
});
function regName(){
  const used = (S.regulars||[]).map(r=>r.name); let n, t=0;
  do { n = pick(REG.names.first) + ' ' + pick(REG.names.last); t++; } while(used.includes(n) && t<30);
  return n;
}
// this week's visiting regulars for a house
function regularsVisiting(h){ return (S.regulars||[]).filter(r=>r.house===h.id && Math.random() < (REG.visitChance ?? 0.6)); }
// after a regular's visit: loyalty, favorite, and whether he keeps coming
function regAfter(r, w, sat, inc){
  r.visits++; r.spent += inc;
  if(sat >= 60){ r.loyalty = Math.min(10, r.loyalty + 1); if(!r.fav || (r.fav!==w.id && sat>=85 && Math.random()<0.3)) r.fav = w.id; }
  else if(sat < 30){ r.loyalty -= 2; }
  if(r.loyalty <= -4){ S.regulars = S.regulars.filter(x=>x!==r); addLog(`${r.name} has stopped coming to ${S.houses.find(h=>h.id===r.house).name}.`); }
}
// a great visit may turn a client into a regular
function maybeNewRegular(h, best, R){
  S.regulars = S.regulars || [];
  if(!best || S.regulars.filter(r=>r.house===h.id).length >= (REG.maxPerHouse ?? 4) || Math.random() > 0.3) return;
  const r = {id:uid(), name:regName(), cls:best.cls.id, house:h.id, fav:best.w.id, visits:1, loyalty:2, spent:0, quirk:pick(Object.keys(REG.quirks)), since:S.week};
  S.regulars.push(r);
  R.hl.push({wid:best.w.id, text:regFill(REG.events.new, r, best.w), act:null, scene:'companion'});
}

/* ---------- drama ---------- */
function queueRegularDrama(){
  const c = (S.regulars||[]).filter(r=>r.fav && findW(r.fav) && REG.events[r.quirk] && Math.random() < (regQuirk(r).drama||0));
  if(!c.length) return false;
  const r = pick(c); EVQ.push(()=>evRegular(r.id)); return true;
}
function evRegular(rid){
  const r = (S.regulars||[]).find(x=>x.id===rid), w = r && findW(r.fav); if(!r || !w) return null;
  const E = REG.events[r.quirk], h = S.houses.find(x=>x.id===r.house) || houseOf(w);
  const F = (t, extra) => regFill(t, r, w, extra);
  const base = {title:F(E.title), who:w.id, scene:'companion'};
  if(r.quirk==='generous'){
    const g = ri(60,160);
    return Object.assign(base, {text:F(E.text,{gold:fmt(g)}), choices:[
      {label:'Let her keep it', fx(){ w.mood = clamp(w.mood+8); gainTrust(w,2); return F(E.keep); }},
      {label:'Sell it for the house', fx(){ S.gold += g; w.mood = clamp(w.mood-3); return F(E.split,{gold:fmt(g)}); }}]});
  }
  if(r.quirk==='jealous'){
    const g = ri(80,200);
    return Object.assign(base, {text:F(E.text), choices:[
      {label:`Take his money (${fmt(g)})`, fx(){ S.gold += g; w.mood = clamp(w.mood-3); r.loyalty++; return F(E.pay,{gold:fmt(g)}); }},
      {label:'"She isn\'t yours"', fx(){ r.loyalty -= 3; gainTrust(w,2); if(r.loyalty<=-4) S.regulars = S.regulars.filter(x=>x!==r); return F(E.refuse); }},
      {label:'Let her handle it', fx(){ w.energy = clamp(w.energy-10, 0, maxEnergy(w)); r.loyalty++; return F(E.calm); }}]});
  }
  if(r.quirk==='lingering'){
    const g = ri(40,110), sec = S.workers.some(x=>x.house===r.house && x.job==='security');
    const ch = [
      {label:`Bill him for the night (${fmt(g)})`, fx(){ S.gold += g; w.energy = clamp(w.energy-15, 0, maxEnergy(w)); return F(E.charge,{gold:fmt(g)}); }},
      {label:'Let it go', fx(){ S.gold += Math.round(g/3); w.energy = clamp(w.energy-15, 0, maxEnergy(w)); w.mood = clamp(w.mood-2); r.loyalty++; return F(E.letit); }}];
    if(sec) ch.splice(1, 0, {label:'Have security walk him out', fx(){ r.loyalty -= 2; gainTrust(w,1); return F(E.escort); }});
    return Object.assign(base, {text:F(E.text), choices:ch});
  }
  if(r.quirk==='smitten'){
    const g = Math.round(Math.max(300, (w.wage||20)*30 + w.popularity*8));
    const stays = has(w,'Devoted') || w.isPartner || w.locked || w.trust >= 60 || Math.random() < 0.6;
    return Object.assign(base, {text:F(E.text,{gold:fmt(g)}), choices:[
      {label:'Let her decide', fx(){
        S.regulars = S.regulars.filter(x=>x!==r);
        if(stays){ gainTrust(w,4); w.mood = clamp(w.mood+4); return F(E.stays); }
        S.gold += g; S.workers = S.workers.filter(x=>x.id!==w.id); return F(E.goes,{gold:fmt(g)}); }},
      {label:'Refuse the offer', fx(){ S.regulars = S.regulars.filter(x=>x!==r); w.mood = clamp(w.mood-2); return F(E.refuse); }}]});
  }
  if(r.quirk==='talker'){
    return Object.assign(base, {text:F(E.text), choices:[
      {label:'Buy him a drink', fx(){ if(h) h.rep = clamp(h.rep+2); w.popularity = clamp(w.popularity+3); return F(E.thanks); }}]});
  }
  return null;
}
