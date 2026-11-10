'use strict';
/* =====================================================================
   DATA: characters
   ===================================================================== */
const STAT_KEYS = ['beauty','charm','charisma','refinement','wits','stamina','strength','agility'];
const STAT_SHORT = {beauty:'BEAU',charm:'CHRM',charisma:'CHAR',refinement:'REFI',wits:'WITS',stamina:'STAM',strength:'STR',agility:'AGIL'};
// stats added after a lady's data was written fall back to an older stat (docs/STATS.md)
const STAT_FALLBACK = {charisma:'charm', wits:'refinement'};
const TECH_KEYS = ['service','dance','bar','combat','manage'];
const TECH_LABEL = {service:'Hospitality',dance:'Dance',bar:'Bartending',combat:'Combat',manage:'Management'};
const PEOPLE = needData('people');
const STYLES = ['Elegant','Cute','Exotic','Sporty','Revealing'];
const COLORS = needData('wardrobe').colors;
const COLOR_KEYS = Object.keys(COLORS);
const sw = c => `<span class="swatch" style="background:${COLORS[c]||'#888'}"></span>`;

// Races live in data/races.json (people.json → races is only a fallback for older data).
const RACE_FILE = DATA.races || {};
const RACES = RACE_FILE.races ? noMeta(RACE_FILE.races) : PEOPLE.races;
const NAMES = PEOPLE.names;
// Bodies (data/body.json): w.body = {bust, height, figure}
const BODY = needData('body');
const BODY_KEYS = ['bust','height','figure'];
const BODY_DEF = Object.assign({bust:'medium', height:'average', figure:'slim'}, BODY.defaults);
const bodyOpts = k => noMeta(BODY[k]||{});
// Beastkin sub-types (races.json → beastkin.subs; a plain list also works). Named ladies may have free-text subs (cheetah...).
const subNames = race => { const s = (RACES[race]||{}).subs; return Array.isArray(s) ? s : Object.keys(s||{}); };
const subData = (race, sub) => { const s = (RACES[race]||{}).subs; return (s && !Array.isArray(s) && s[sub]) || null; };
const BUILDS = PEOPLE.builds;
const HAIR_STYLES = PEOPLE.hairStyles;
const HAIR_COLORS = PEOPLE.hairColors;
const EYES = PEOPLE.eyes;
const SKINS = PEOPLE.skins;
const DEMON_SKINS = PEOPLE.demonSkins;
const FEATURES = PEOPLE.features;
const PERS = noMeta(needData('personalities'));
const PERSONALITIES = Object.keys(PERS);
const HOOKS = PEOPLE.hooks;
const GIFTS = PEOPLE.gifts;

// Traits live in data/traits.json (desc, fx, flags). The effect engine (js/logic/fx.js) reads their fx.
const TRAIT_FILE = needData('traits');
const TRAITS = noMeta(TRAIT_FILE.traits);
const EARN_CHANCE = TRAIT_FILE.earnChance ?? 0.35;
// Personalities live in data/personalities.json (see PERS above).
const ACT_WORD = {chat:'chats',dinner:'dinners',gift:'gifts',train:'training',private:'private time',walk:'walks',theater:'the theater'};
function pm(w,a){ const P = PERS[w.personality]; if(!P) return 1; return P.likes.includes(a) ? 1.5 : P.dislikes.includes(a) ? 0.5 : 1; }
// A date may list several likes: she counts it as liked if any is liked, disliked only if all are.
function pmAny(w,a){ const l = [].concat(a); if(l.length===1) return pm(w,l[0]); const v = l.map(x=>pm(w,x)); return v.some(x=>x>1) ? 1.5 : v.every(x=>x<1) ? 0.5 : 1; }
const likeId = (w,a) => { const l = [].concat(a); return l.find(x=>pm(w,x)>1) || l[0]; };
const pTrust = w => (PERS[w.personality]||{}).trust || 1;
// Only the "not big on it" note remains (no "loves X" line). Dates don't use it at all: the date menu already shows what she'd love.
const pNote = (w,a) => (a = likeId(w,a), pm(w,a)<1 ? `\n\n(${w.name} isn't big on ${ACT_WORD[a]}. It went okay, but not great.)` : '');
const has = (w,t) => (w.traits||[]).includes(t);
