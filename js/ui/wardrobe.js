'use strict';
/* ---------- Wardrobe ---------- */
function buyOutfit(id, k){
  const w=findW(id), o=WARDROBE[k]; if(!w||!o) return;
  if(w.owned.includes(k)) return;
  if(o.owner) return toast(spUnlocked(w) ? 'Already unlocked.' : `Unlocks at trust ${spTrust(w)}.`);
  if(S.gold < o.cost) return toast('Not enough gold.');
  S.gold -= o.cost; w.owned.push(k);
  if(o.style===w.style){ moodAdd(w, 6); w.trust=clamp(w.trust+2); }
  if(wardrobeOK(w,k)) w.outfit = k;
  note(`Bought ${o.label} for ${w.name}.${o.style===w.style?' She loves it.':''}`); save(); render(); openWardrobe(id);
}
function equipOutfit(id, k){
  const w=findW(id); if(!w) return;
  if(!wardrobeOK(w,k)) return toast(`${w.name} isn't comfortable wearing that yet.`);
  w.outfit = k; save(); openWardrobe(id);
}
function buyUnder(id, k){
  const w=findW(id), u=UNDER[k]; if(!w||!u) return;
  if(!w.ownedUnder.includes(k)){ if(S.gold < u.cost) return toast('Not enough gold.'); S.gold -= u.cost; w.ownedUnder.push(k); }
  if(!underOK(w,k)) return toast(`${w.name} isn't comfortable with that yet.`);
  w.under = k; save(); render(); openWardrobe(id);
}
function setColor(id, which, c){ const w=findW(id); if(!w) return; w[which]=c; save(); openWardrobe(id); }
function openWardrobe(id){
  const w=findW(id); if(!w) return;
  const cur = getOutfit(w), cu = getUnder(w);
  const colorSel = (which, val) => `<select onchange="setColor('${id}','${which}',this.value)">${COLOR_KEYS.map(c=>`<option value="${c}" ${c===val?'selected':''}>${c}${c===w.favColor?' ♥':''}</option>`).join('')}</select>`;
  const rows = wardrobeAvail(w).map(([k,o])=>{
    const owned = w.owned.includes(k), wearing = w.outfit===k, ok = wardrobeOK(w,k);
    let act;
    if(wearing) act = '<span class="good">Wearing</span>';
    else if(owned) act = `<button class="sm" onclick="equipOutfit('${id}','${k}')" ${ok?'':'disabled title="Not comfortable yet"'}>Wear</button>`;
    else if(o.owner) act = `<span class="muted">${spUnlocked(w)?'':'🔒 trust '+spTrust(w)}</span>`;
    else act = `<button class="sm" onclick="buyOutfit('${id}','${k}')" ${S.gold<o.cost?'disabled':''}>Buy ${fmt(o.cost)}</button>`;
    const tag = o.owner ? (k.startsWith('sig_')?' <span class="tag">Signature</span>':' <span class="tag">Special</span>') : (BASE_OUTFITS[k]?' <span class="muted">(basic)</span>':'');
    const n = imgCountFor(w, `o:${k}:`);
    return `<tr><td>${esc(o.label)}${tag}${o.lewd?` <span class="muted">(lewd ${o.lewd}+)</span>`:''}${n?` <span class="tag hid" title="Saved images with this outfit">📷 ${n}</span>`:''}</td><td>${o.style===w.style?'<b class="good">'+o.style+'</b>':o.style}</td><td class="muted">${bonusText(o.bonus)}</td><td>${act}</td></tr>`;
  }).join('') + (w.customOutfit ? `<tr><td>Her own outfit <span class="muted">(custom)</span></td><td>—</td><td class="muted">—</td><td>${w.outfit==='custom'?'<span class="good">Wearing</span>':`<button class="sm" onclick="equipOutfit('${id}','custom')">Wear</button>`}</td></tr>` : '');
  const urows = Object.entries(UNDER).map(([k,u])=>{
    const owned = w.ownedUnder.includes(k), wearing = w.under===k, ok = underOK(w,k);
    const act = wearing ? '<span class="good">Wearing</span>' : `<button class="sm" onclick="buyUnder('${id}','${k}')" ${(!owned && S.gold<u.cost) || !ok ?'disabled':''} ${ok?'':'title="Not comfortable yet"'}>${owned||!u.cost?'Wear':'Buy '+fmt(u.cost)}</button>`;
    const n = imgCountFor(w, `u:${k}`);
    return `<tr><td>${esc(u.label)}${u.lewd?` <span class="muted">(lewd ${u.lewd}+)</span>`:''}${n?` <span class="tag hid" title="Saved images with these undergarments">📷 ${n}</span>`:''}</td><td>${u.style===w.style?'<b class="good">'+u.style+'</b>':u.style}</td><td class="muted">${bonusText(u.bonus)}</td><td>${act}</td></tr>`;
  }).join('');
  modal(`<h2>${esc(w.name)}'s Wardrobe</h2>
    <p class="muted">Style: <b>${w.style}</b> · Favorite color: ${sw(w.favColor)}<b>${w.favColor}</b>. Wearing her style and her favorite color keeps her happier each week. 📷 = saved images with that item (images are saved per outfit and color).</p>
    <div class="row"><b>Outfit:</b> ${esc(cur.label)} ${usesColor(cur)?`· Color ${colorSel('outColor', w.outColor)}`:'<span class="muted">(fixed colors)</span>'}</div>
    <div class="row"><b>Undergarments:</b> ${esc(cu.label)} ${w.under!=='none'&&usesColor(cu)?`· Color ${colorSel('underColor', w.underColor)}`:''}</div>
    <h3>Outfits</h3><table><tr><th>Outfit</th><th>Style</th><th>Bonuses</th><th></th></tr>${rows}</table>
    <h3 style="margin-top:10px">Undergarments</h3><table><tr><th>Item</th><th>Style</th><th>Bonuses</th><th></th></tr>${urows}</table>
    <div class="row"><button class="primary" onclick="openSheet('${id}')">Back to her sheet</button></div>`, {wide:true});
}
