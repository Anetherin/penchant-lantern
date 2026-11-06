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
// Signature outfits for named characters: sig_ = starting outfit, sp_ = unlocks at trust 60 (or as a lover).
const SIG_OUTFITS = {
  sig_mira:{owner:'mira', label:'Hostess gown', style:'Elegant', prompt:'an elegant burgundy dress with a black lace shawl', bonus:{madame:1.3, companion:1.1}},
  sp_mira:{owner:'mira', label:'Midnight silk gown', style:'Elegant', prompt:'a midnight-blue silk gown with a plunging back and sapphire jewelry', bonus:{noble:1.3, courtesan:1.15}},
  sig_cecile:{owner:'cecile', label:'Head maid uniform', style:'Elegant', prompt:'a long black head-maid dress with crisp white apron and a ring of brass keys', bonus:{maid:1.4, reception:1.15}},
  sp_cecile:{owner:'cecile', label:'Off-duty corset dress', style:'Elegant', prompt:'a dark green corset dress with lace sleeves', bonus:{noble:1.2, companion:1.15}},
  sig_tsubaki:{owner:'tsubaki', label:'Onsen yukata', style:'Elegant', prompt:'an indigo yukata with a red obi, sleeves tied back', bonus:{bath:1.35}},
  sp_tsubaki:{owner:'tsubaki', label:'Festival kimono', style:'Exotic', prompt:'a vivid festival kimono patterned with camellias', bonus:{companion:1.2, merchant:1.15}},
  sig_vesper:{owner:'vesper', label:'Mourning gown', style:'Elegant', prompt:'an antique black lace mourning gown with a sheer veil', bonus:{noble:1.15, dancer:1.15}},
  sp_vesper:{owner:'vesper', label:'Spectral silks', style:'Revealing', prompt:'flowing translucent pale silks that drift like smoke', bonus:{dancer:1.3, propose:1.2}},
  sig_hilde:{owner:'hilde', label:'Brewmaster\'s bodice', style:'Cute', prompt:'a laced brown bodice, rolled linen sleeves and a leather apron', bonus:{bartender:1.3}},
  sp_hilde:{owner:'hilde', label:'Festival dirndl', style:'Cute', prompt:'a bright green festival dirndl with a low-cut bodice', bonus:{bartender:1.2, propose:1.2, commoner:1.15}},
  sig_sylphine:{owner:'sylphine', label:'Moonpetal dress', style:'Exotic', prompt:'a flowing white dress of layered petal-shaped silk', bonus:{dancer:1.3}},
  sp_sylphine:{owner:'sylphine', label:'Starlight silks', style:'Revealing', prompt:'sheer midnight silks embroidered with tiny silver stars', bonus:{dancer:1.2, noble:1.2}},
  sig_zaria:{owner:'zaria', label:'Crimson harness dress', style:'Revealing', prompt:'a crimson dress with a strappy black leather harness', bonus:{courtesan:1.2, adventurer:1.1}},
  sp_zaria:{owner:'zaria', label:'Infernal regalia', style:'Revealing', prompt:'black and gold infernal regalia with a high collar and very little else', bonus:{courtesan:1.3, propose:1.2}},
  sig_bettina:{owner:'bettina', label:'Innkeeper\'s apron dress', style:'Cute', prompt:'a sturdy blue dress with a flour-dusted white apron', bonus:{reception:1.3, merchant:1.1}},
  sp_bettina:{owner:'bettina', label:'Sunday best', style:'Elegant', prompt:'a fitted plum dress with a cameo brooch', bonus:{companion:1.2, merchant:1.2}},
  sig_kaede:{owner:'kaede', label:'Adventurer\'s leathers', style:'Sporty', prompt:'a fitted leather vest, wrap skirt and arm guards', bonus:{security:1.25, adventurer:1.2}},
  sp_kaede:{owner:'kaede', label:'Shrine maiden garb', style:'Exotic', prompt:'a red and white shrine maiden outfit with detached sleeves', bonus:{companion:1.2, noble:1.1}},
  sig_yui:{owner:'yui', label:'Office clothes from Earth', style:'Elegant', prompt:'a white button-up blouse, grey pencil skirt, black tights and thin-framed glasses', bonus:{reception:1.2, merchant:1.2}},
  sp_yui:{owner:'yui', label:'Adventurer "cosplay"', style:'Sporty', prompt:'a deliberately cliché fantasy adventurer outfit with a short cape and thigh-high boots', bonus:{adventurer:1.25, propose:1.15}},
  sig_nerys:{owner:'nerys', label:'Succubus attire', style:'Revealing', prompt:'a black leather corset, thigh-high boots and long gloves', bonus:{courtesan:1.2, propose:1.2}},
  sp_nerys:{owner:'nerys', label:'"Disguise": librarian', style:'Elegant', prompt:'a prim high-collared librarian dress and glasses, barely hiding her horns', bonus:{noble:1.2, companion:1.2}},
  sig_elowen:{owner:'elowen', label:'Healer\'s robes', style:'Elegant', prompt:'soft white healer\'s robes with green embroidery and a satchel of herbs', bonus:{companion:1.1, reception:1.1}},
  sp_elowen:{owner:'elowen', label:'Forest silk dress', style:'Exotic', prompt:'a light leaf-green silk dress woven with tiny flowers', bonus:{noble:1.2, companion:1.2}},
  sig_adelheid:{owner:'adelheid', label:'Retainer\'s half-plate', style:'Sporty', prompt:'polished silver half-plate armor over a blue tabard bearing a sun crest', bonus:{security:1.4}},
  sig_natsuki:{owner:'natsuki', label:'Veteran adventurer gear', style:'Sporty', prompt:'a worn blue scarf, fitted leather armor and a katana at her hip', bonus:{security:1.3, adventurer:1.2}},
  sp_natsuki:{owner:'natsuki', label:'Summer festival yukata', style:'Cute', prompt:'a bright orange summer festival yukata with a goldfish pattern', bonus:{companion:1.2, commoner:1.15}},
  sig_kanako:{owner:'kanako', label:'Snack-bar mama outfit', style:'Elegant', prompt:'a fitted wine-red cocktail dress with a cardigan over her shoulders', bonus:{bartender:1.25, companion:1.1}},
  sp_kanako:{owner:'kanako', label:'Date-night dress', style:'Elegant', prompt:'a sleek black off-shoulder dress she bought "just in case"', bonus:{companion:1.2, noble:1.15}},
  sig_mio:{owner:'mio', label:'Hoodie and shorts', style:'Cute', prompt:'an oversized pink hoodie, denim shorts and sneakers', bonus:{commoner:1.15, propose:1.1}},
  sp_mio:{owner:'mio', label:'"Grown-up" outfit', style:'Revealing', prompt:'a daring black lace-up dress she picked out to prove a point', bonus:{courtesan:1.2, propose:1.2}},
  sig_seraphine:{owner:'seraphine', label:'Faded court silks', style:'Elegant', prompt:'an old-fashioned but immaculate gold-embroidered court dress, slightly faded', bonus:{noble:1.35, companion:1.1}},
  sp_seraphine:{owner:'seraphine', label:'Rosenhal ball gown', style:'Elegant', prompt:'a breathtaking crimson ball gown with the Rosenhal rose crest', bonus:{noble:1.3, madame:1.2}},
  sig_ilyana:{owner:'ilyana', label:'Patroness robes', style:'Elegant', prompt:'layered silver-grey elven robes with moon-lily embroidery', bonus:{madame:1.3, noble:1.15}},
  sp_ilyana:{owner:'ilyana', label:'Moonsilk gown', style:'Revealing', prompt:'a gown of shimmering moonsilk that is more light than fabric', bonus:{noble:1.3, courtesan:1.15}},
  sig_ines:{owner:'ines', label:'Ghost-hunter\'s coat', style:'Sporty', prompt:'a long black hunter\'s coat with silver buckles and a bandolier of charms', bonus:{security:1.35}},
  sp_ines:{owner:'ines', label:'Duelist\'s outfit', style:'Sporty', prompt:'a silver-trimmed duelist\'s jacket, white shirt and tall boots', bonus:{adventurer:1.2, security:1.2}},
  sig_vharra:{owner:'vharra', label:'Landlord\'s silks', style:'Revealing', prompt:'draped emerald silks with heavy gold chains and rings', bonus:{courtesan:1.2, merchant:1.2}},
  sp_vharra:{owner:'vharra', label:'Underdistrict regalia', style:'Revealing', prompt:'black and emerald infernal regalia with a jeweled collar', bonus:{courtesan:1.3, propose:1.2}},
  sp_adelheid:{owner:'adelheid', label:'Off-duty doublet', style:'Sporty', prompt:'a fitted navy doublet, white shirt open at the collar, and riding boots', bonus:{companion:1.15, adventurer:1.2}},
  sig_marisol:{owner:'marisol', label:'Merchant\'s daughter dress', style:'Cute', prompt:'a practical but pretty mustard-yellow dress with a ledger tucked under her arm', bonus:{merchant:1.2, reception:1.1}},
  sp_marisol:{owner:'marisol', label:'Heiress gown', style:'Elegant', prompt:'a gold-trimmed heiress gown she swore she would never wear', bonus:{noble:1.25, madame:1.2}},
  sig_hanna:{owner:'hanna', label:'Guild uniform', style:'Cute', prompt:'a neat guild uniform with a short blue cape', bonus:{reception:1.25, adventurer:1.15}},
  sig_rhoswen:{owner:'rhoswen', label:'Court gown', style:'Elegant', prompt:'a flowing pale-green silk court gown', bonus:{noble:1.3, dancer:1.1}}
};
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
