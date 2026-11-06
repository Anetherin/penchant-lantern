'use strict';
/* =====================================================================
   DATA: wardrobe
   ===================================================================== */
const CLOTH = [
  {id:'dressed', label:'Dressed',          lv:0},
  {id:'partial', label:'Partly undressed', lv:15},
  {id:'under',   label:'Undergarments',    lv:30},
  {id:'nude',    label:'Undressed',        lv:55}
];
// Generic base outfits: every non-named lady starts with one. Also buyable. {color} = her chosen color.
const BASE_OUTFITS = {
  b_corset:  {label:'Corset & long skirt',      style:'Elegant',   cost:80,  lewd:0,  prompt:'a {color} corset and long flowing skirt', bonus:{companion:1.05, noble:1.05}},
  b_peasant: {label:'Off-shoulder blouse',      style:'Cute',      cost:60,  lewd:0,  prompt:'an off-shoulder white peasant blouse and a {color} skirt', bonus:{commoner:1.1}},
  b_wrap:    {label:'Silk wrap dress',          style:'Exotic',    cost:80,  lewd:0,  prompt:'a {color} silk wrap dress', bonus:{merchant:1.08}},
  b_leather: {label:'Leather vest & trousers',  style:'Sporty',    cost:80,  lewd:0,  prompt:'a {color} leather vest and fitted trousers', bonus:{security:1.1, adventurer:1.05}},
  b_robe:    {label:'Loose silk robe',          style:'Revealing', cost:90,  lewd:20, prompt:'a loosely tied {color} silk robe', bonus:{courtesan:1.06}},
  b_velvet:  {label:'Velvet dress',             style:'Elegant',   cost:100, lewd:0,  prompt:'a {color} velvet dress', bonus:{noble:1.08}},
  b_halter:  {label:'Halter top & shorts',      style:'Sporty',    cost:60,  lewd:10, prompt:'a {color} halter top and short shorts', bonus:{bartender:1.08}},
  b_lace:    {label:'Lace-trimmed dress',       style:'Cute',      cost:70,  lewd:0,  prompt:'a {color} lace-trimmed dress', bonus:{reception:1.08}}
};
const SHOP_OUTFITS = {
  maid:     {label:'Maid uniform',       cost:120, style:'Cute',      lewd:0,  prompt:'a classic black maid dress with white apron and frilled headband', bonus:{maid:1.3, reception:1.1}},
  barmaid:  {label:'Barmaid dirndl',     cost:150, style:'Cute',      lewd:10, prompt:'a low-cut {color} barmaid dirndl with a laced bodice', bonus:{bartender:1.25, propose:1.2}},
  armor:    {label:'Leather armor',      cost:180, style:'Sporty',    lewd:0,  prompt:'fitted light leather armor with a short {color} cape', bonus:{security:1.3, adventurer:1.15}},
  gown:     {label:'Evening gown',       cost:300, style:'Elegant',   lewd:0,  prompt:'a luxurious floor-length {color} evening gown and fine jewelry', bonus:{noble:1.25, companion:1.1}},
  qipao:    {label:'Silk qipao',         cost:220, style:'Exotic',    lewd:15, prompt:'a high-slit embroidered {color} silk qipao', bonus:{merchant:1.2, companion:1.1}},
  silks:    {label:'Dancer\'s silks',    cost:240, style:'Exotic',    lewd:25, prompt:'flowing sheer {color} dancer\'s silks with gold coin jewelry', bonus:{dancer:1.3, propose:1.1}},
  yukata:   {label:'Bath yukata',        cost:140, style:'Elegant',   lewd:10, prompt:'a loosely tied {color} cotton yukata', bonus:{bath:1.25}},
  bunny:    {label:'Bunny hostess suit', cost:260, style:'Revealing', lewd:30, prompt:'a {color} bunny hostess suit with bunny-ear headband and fishnet stockings', bonus:{companion:1.2, bartender:1.1, propose:1.2}},
  negligee: {label:'Sheer negligee',     cost:320, style:'Revealing', lewd:50, prompt:'a sheer {color} silk negligee', bonus:{courtesan:1.25, propose:1.3}}
};
// Signature outfits for named characters live with them in data/characters.json (outfits).
// sig_ = starting outfit, sp_ = unlocks at trust 60 (or as a lover).
const SIG_OUTFITS = {};
Object.entries(noMeta(needData('characters'))).forEach(([k,c])=>Object.entries(c.outfits||{}).forEach(([ok,o])=>{ SIG_OUTFITS[ok] = Object.assign({owner:k}, o); }));
const WARDROBE = Object.assign({}, BASE_OUTFITS, SHOP_OUTFITS, SIG_OUTFITS);
const UNDER = {
  plain:  {label:'Plain cotton',        cost:0,  lewd:0,  style:'Cute',      prompt:'simple {color} cotton underwear', bonus:{}},
  lace:   {label:'Lace set',            cost:50, lewd:10, style:'Elegant',   prompt:'{color} lace lingerie', bonus:{courtesan:1.04}},
  silk:   {label:'Silk set',            cost:70, lewd:15, style:'Elegant',   prompt:'{color} silk lingerie', bonus:{noble:1.05}},
  sports: {label:'Sports wrap',         cost:40, lewd:0,  style:'Sporty',    prompt:'a {color} sports bandeau and fitted shorts', bonus:{security:1.05, adventurer:1.04}},
  corset: {label:'Corset & stockings',  cost:90, lewd:30, style:'Revealing', prompt:'a {color} corset with garter belt and stockings', bonus:{courtesan:1.08}},
  sheer:  {label:'Sheer set',           cost:80, lewd:40, style:'Revealing', prompt:'sheer {color} lingerie', bonus:{propose:1.1, courtesan:1.05}},
  none:   {label:'None (commando)',     cost:0,  lewd:45, style:'Revealing', prompt:'', bonus:{propose:1.15}}
};
const BONUS_LABEL = {maid:'Maid',reception:'Reception',bartender:'Bar',propose:'Propositions',security:'Security',adventurer:'Adventurer clients',noble:'Noble clients',merchant:'Merchant clients',commoner:'Commoner clients',companion:'Companion',dancer:'Dance',bath:'Bath',courtesan:'Courtesan',madame:'Madame'};
const bonusText = b => Object.entries(b||{}).map(([k,v])=>`${BONUS_LABEL[k]||k} +${Math.round((v-1)*100)}%`).join(', ') || '—';
