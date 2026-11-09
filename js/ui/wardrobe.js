'use strict';
/* ---------- Wardrobe ---------- */
function buyOutfit(id, k){
  const w=findW(id), o=WARDROBE[k]; if(!w||!o) return;
  if(ownsOutfit(w,k)) return;
  if(o.owner) return toast(spUnlocked(w) ? 'Already unlocked.' : `Unlocks at trust ${tShow(spTrust(w))}.`);
  const cost = outfitCost(o);
  if(S.gold < cost) return toast('Not enough gold.');
  S.gold -= cost; S.houseWardrobe.push(k);   // outfits Sam buys go to the shared house wardrobe
  if(o.style===w.style){ moodAdd(w, 6); w.trust=clamp(w.trust+2); }
  if(wardrobeOK(w,k)) w.outfit = k;
  note(`Bought ${o.label} for the house wardrobe${wardrobeOK(w,k)?`; ${w.name} is wearing it`:''}.${o.style===w.style?' She loves it.':''}`); save(); render(); openWardrobe(id);
}
function equipOutfit(id, k){
  const w=findW(id); if(!w) return;
  if(!wardrobeOK(w,k)) return toast(`${w.name} isn't comfortable wearing that yet.`);
  w.outfit = k; save(); openWardrobe(id);
}
function buyUnder(id, k){
  const w=findW(id), u=UNDER[k]; if(!w||!u) return;
  if(!ownsUnder(w,k)){ const c = outfitCost(u); if(S.gold < c) return toast('Not enough gold.'); if(!underOK(w,k)) return toast(`${w.name} isn't comfortable with that yet.`); S.gold -= c; S.houseUnder.push(k); }
  if(!underOK(w,k)) return toast(`${w.name} isn't comfortable with that yet.`);
  w.under = k; save(); render(); openWardrobe(id);
}
// Gift a piece from the house wardrobe to a lady: it becomes hers, and it counts as a gift (mood, trust, Greedy / gift-likers).
function giftHouseItem(id, kind, k){
  const w=findW(id); if(!w) return;
  const list = kind==='under' ? S.houseUnder : S.houseWardrobe, o = kind==='under' ? UNDER[k] : WARDROBE[k];
  if(!o || !list.includes(k)) return;
  if(!useAP(10)) return;
  list.splice(list.indexOf(k), 1);
  if(kind==='under') w.ownedUnder.push(k); else w.owned.push(k);
  const m = pm(w,'gift'), match = o.style===w.style, mg = Math.round((has(w,'Greedy') ? 20 : 12) * m * (match ? 1.25 : 1));
  moodAdd(w, mg); gainTrust(w, 1.5*m*(match ? 1.25 : 1)); countUp(w,'gifts'); samXP(3); samLog(`Gave ${w.name} ${o.label}`); checkUnlocks();
  note(`Sam gave ${w.name} ${o.label}. ${match?'It suits her style. ':''}Mood +${mg}.${pNote(w,'gift')}`); save(); render(); openWardrobe(id);
}
function setColor(id, which, c){ const w=findW(id); if(!w) return; w[which]=c; save(); openWardrobe(id); }
function openWardrobe(id){
  const w=findW(id); if(!w) return;
  const cur = getOutfit(w), cu = getUnder(w);
  const colorSel = (which, val) => `<select onchange="setColor('${id}','${which}',this.value)">${COLOR_KEYS.map(c=>`<option value="${c}" ${c===val?'selected':''}>${c}${c===w.favColor?' ♥':''}</option>`).join('')}</select>`;
  const rows = wardrobeAvail(w).map(([k,o])=>{
    const owned = ownsOutfit(w,k), wearing = w.outfit===k, ok = wardrobeOK(w,k), inHouse = S.houseWardrobe.includes(k) && !w.owned.includes(k);
    let act;
    if(wearing) act = '<span class="good">Wearing</span>';
    else if(owned) act = `<button class="sm" onclick="equipOutfit('${id}','${k}')" ${ok?'':'disabled title="Not comfortable yet"'}>Wear</button>`;
    else if(o.owner) act = `<span class="muted">${spUnlocked(w)?'':'🔒 trust '+tShow(spTrust(w))}</span>`;
    else act = `<button class="sm" onclick="buyOutfit('${id}','${k}')" ${S.gold<outfitCost(o)?'disabled':''}>Buy ${fmt(outfitCost(o))}</button>`;
    if(inHouse) act += ` <button class="sm" onclick="giftHouseItem('${id}','outfit','${k}')" title="Give it to her to keep. Counts as a gift (10 energy)">🎁 Gift</button>`;
    const tag = o.owner ? (k.startsWith('sig_')?' <span class="tag">Signature</span>':' <span class="tag">Special</span>') : (BASE_OUTFITS[k]?' <span class="muted">(basic)</span>':'');
    const n = imgCountFor(w, `o:${k}:`);
    return `<tr><td>${esc(o.label)}${tag}${inHouse||(S.houseWardrobe.includes(k)&&w.owned.includes(k))?' <span class="tag house" title="In the shared house wardrobe">🏠 house</span>':''}${o.lewd?` <span class="muted">(lewd ${lShow(o.lewd)}+)</span>`:''}${n?` <span class="tag hid" title="Saved images with this outfit">📷 ${n}</span>`:''}</td><td>${o.style===w.style?'<b class="good">'+o.style+'</b>':o.style}</td><td class="muted">${bonusText(o.bonus)}</td><td>${act}</td></tr>`;
  }).join('') + (w.customOutfit ? `<tr><td>Her own outfit <span class="muted">(custom)</span></td><td>—</td><td class="muted">—</td><td>${w.outfit==='custom'?'<span class="good">Wearing</span>':`<button class="sm" onclick="equipOutfit('${id}','custom')">Wear</button>`}</td></tr>` : '');
  const urows = Object.entries(UNDER).map(([k,u])=>{
    const owned = ownsUnder(w,k), wearing = w.under===k, ok = underOK(w,k), inHouse = S.houseUnder.includes(k) && !w.ownedUnder.includes(k);
    const act = (wearing ? '<span class="good">Wearing</span>' : `<button class="sm" onclick="buyUnder('${id}','${k}')" ${(!owned && S.gold<outfitCost(u)) || !ok ?'disabled':''} ${ok?'':'title="Not comfortable yet"'}>${owned||!u.cost?'Wear':'Buy '+fmt(outfitCost(u))}</button>`)
      + (inHouse ? ` <button class="sm" onclick="giftHouseItem('${id}','under','${k}')" title="Give it to her to keep. Counts as a gift (10 energy)">🎁 Gift</button>` : '');
    const n = imgCountFor(w, `u:${k}`);
    return `<tr><td>${esc(u.label)}${u.lewd?` <span class="muted">(lewd ${lShow(u.lewd)}+)</span>`:''}${n?` <span class="tag hid" title="Saved images with these undergarments">📷 ${n}</span>`:''}</td><td>${u.style===w.style?'<b class="good">'+u.style+'</b>':u.style}</td><td class="muted">${bonusText(u.bonus)}</td><td>${act}</td></tr>`;
  }).join('');
  modal(`<h2>${esc(w.name)}'s Wardrobe</h2>
    <p class="muted">Outfits Sam buys go to the shared house wardrobe: any lady can wear them when she's comfortable, and he can gift a piece to her for keeps. Style: <b>${w.style}</b> · Favorite color: ${sw(w.favColor)}<b>${w.favColor}</b>. Wearing her style and her favorite color keeps her happier each week. 📷 = saved images with that item (images are saved per outfit and color).</p>
    <div class="row"><b>Outfit:</b> ${esc(cur.label)} ${usesColor(cur)?`· Color ${colorSel('outColor', w.outColor)}`:'<span class="muted">(fixed colors)</span>'}</div>
    <div class="row"><b>Undergarments:</b> ${esc(cu.label)} ${w.under!=='none'&&usesColor(cu)?`· Color ${colorSel('underColor', w.underColor)}`:''}</div>
    <h3>Outfits</h3><table><tr><th>Outfit</th><th>Style</th><th>Bonuses</th><th></th></tr>${rows}</table>
    <h3 style="margin-top:10px">Undergarments</h3><table><tr><th>Item</th><th>Style</th><th>Bonuses</th><th></th></tr>${urows}</table>
    <div class="row"><button class="primary" onclick="openSheet('${id}')">Back to her sheet</button></div>`, {wide:true});
}
