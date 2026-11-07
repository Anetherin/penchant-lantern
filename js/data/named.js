'use strict';
/* =====================================================================
   NAMED CHARACTERS (all originals)
   role: 'house' (comes with a house), 'partner' (starter choice / recruitable), 'story', 'guild', 'drifter' (turns up among candidates; data/guests.json entries are drifters)
   ===================================================================== */
// Named characters live in data/characters.json.
const NAMED = Object.fromEntries(Object.entries(charData()).map(([k,c])=>{ const {outfits, ...rest} = c; return [k, rest]; }));
const PARTNERS = Object.keys(NAMED).filter(k=>NAMED[k].role==='partner');
/* ARCS: partner romance arcs, loaded from data/arcs.json in js/stories/partners.js. */
let ARCS;
