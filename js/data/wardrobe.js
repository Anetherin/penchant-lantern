'use strict';
/* =====================================================================
   DATA: wardrobe
   ===================================================================== */
const WARDROBE_DATA = needData('wardrobe');
const CLOTH = [
  {id:'dressed', label:'Dressed',          lv:0},
  {id:'partial', label:'Partly undressed', lv:15},
  {id:'under',   label:'Undergarments',    lv:30},
  {id:'nude',    label:'Undressed',        lv:55}
];
// Generic base outfits: every non-named lady starts with one. Also buyable. {color} = her chosen color.
const BASE_OUTFITS = WARDROBE_DATA.base;
const SHOP_OUTFITS = WARDROBE_DATA.shop;
// Job uniforms: an outfit with "uniform":"<job>" is worn automatically on that job and never rolled for generic ladies.
const UNIFORMS = {}; Object.entries(BASE_OUTFITS).forEach(([k,o])=>{ if(o.uniform) UNIFORMS[o.uniform] = k; });
const plainBase = () => Object.keys(BASE_OUTFITS).filter(k=>!BASE_OUTFITS[k].uniform);
// Signature outfits for named characters live with them in data/characters.json (outfits).
// sig_ = starting outfit, sp_ = unlocks at trust 60 (or as a lover), or at its own "unlock" trust if set.
const SIG_OUTFITS = {};
Object.entries(charData()).forEach(([k,c])=>Object.entries(c.outfits||{}).forEach(([ok,o])=>{ SIG_OUTFITS[ok] = Object.assign({owner:k}, o); }));
const WARDROBE = Object.assign({}, BASE_OUTFITS, SHOP_OUTFITS, SIG_OUTFITS);
const UNDER = WARDROBE_DATA.under;
const BONUS_LABEL = {maid:'Maid',promoter:'Promoter',attendant:'Attendant',bartender:'Bar',propose:'Propositions',security:'Security',adventurer:'Adventurer clients',noble:'Noble clients',merchant:'Merchant clients',commoner:'Commoner clients',dancer:'Dance',bath:'Bath',courtesan:'Courtesan',madame:'Madame'};
const bonusText = b => Object.entries(b||{}).map(([k,v])=>`${BONUS_LABEL[k]||k} +${Math.round((v-1)*100)}%`).join(', ') || '—';
