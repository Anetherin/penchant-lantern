'use strict';
/* =====================================================================
   DATA: characters
   ===================================================================== */
const STAT_KEYS = ['beauty','charm','refinement','stamina','strength','agility'];
const TECH_KEYS = ['service','dance','bar','combat','manage'];
const TECH_LABEL = {service:'Hospitality',dance:'Dance',bar:'Bartending',combat:'Combat',manage:'Management'};
const PEOPLE = needData('people');
const STYLES = ['Elegant','Cute','Exotic','Sporty','Revealing'];
const COLORS = needData('wardrobe').colors;
const COLOR_KEYS = Object.keys(COLORS);
const sw = c => `<span class="swatch" style="background:${COLORS[c]||'#888'}"></span>`;

const RACES = PEOPLE.races;
const NAMES = PEOPLE.names;
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

const TRAITS = {
  'Shy':{desc:'Lewdness grows slowly; trust grows faster; less comfortable undressing.'},
  'Eager':{desc:'+10 willingness; lewdness grows faster.'},
  'Ambitious':{desc:'+10% escort income; expects higher pay.'},
  'Party Animal':{desc:'Bonus as bartender or dancer.'},
  'Former Adventurer':{desc:'Strong at security; adventurers love her.'},
  'Elegant':{desc:'Nobles pay more for her company.'},
  'Lazy':{desc:'Mood drops faster when overworked.'},
  'Tough':{desc:'+20 max energy.'},
  'Romantic':{desc:'Time with Sam builds trust faster.'},
  'Greedy':{desc:'Gifts and good earnings please her more; expects higher pay.'},
  'Loyal':{desc:'Rarely loses trust; hard to poach.'},
  'Exhibitionist':{desc:'Dancing raises lewdness faster; comfortable with less clothing.', hidden:true},
  'Night Owl':{desc:'Recovers energy faster.', hidden:true},
  'Modest':{desc:'Would rather keep her clothes on: they get pulled aside instead. Lewdness (and trust, with Sam) still brings more of them off.', personal:true},
  'Devoted':{desc:'Sam\'s lover. Never leaves; more willing with Sam; mood stays up.', story:true},
  'Oblivious':{desc:'Thinks of Sam as the boy from next door. Far less willing with him until her story moves along.', story:true}
};
// Personalities live in data/personalities.json (see PERS above).
const ACT_WORD = {chat:'chats',dinner:'dinners',gift:'gifts',train:'training',private:'private time',walk:'walks',theater:'the theater'};
function pm(w,a){ const P = PERS[w.personality]; if(!P) return 1; return P.likes.includes(a) ? 1.5 : P.dislikes.includes(a) ? 0.5 : 1; }
const pTrust = w => (PERS[w.personality]||{}).trust || 1;
const pNote = (w,a) => pm(w,a)>1 ? `\n\n(${w.name} loves ${ACT_WORD[a]}.)` : pm(w,a)<1 ? `\n\n(${w.name} isn't big on ${ACT_WORD[a]}. It went okay, but not great.)` : '';
const has = (w,t) => (w.traits||[]).includes(t);
