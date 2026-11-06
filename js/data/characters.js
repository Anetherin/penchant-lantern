'use strict';
/* =====================================================================
   DATA: characters
   ===================================================================== */
const STAT_KEYS = ['beauty','charm','refinement','stamina','strength','agility'];
const TECH_KEYS = ['service','dance','bar','combat','manage'];
const TECH_LABEL = {service:'Hospitality',dance:'Dance',bar:'Bartending',combat:'Combat',manage:'Management'};
const STYLES = ['Elegant','Cute','Exotic','Sporty','Revealing'];
const COLORS = {black:'#222',white:'#eee',ivory:'#efe6c8',red:'#c22',crimson:'#a3203a',burgundy:'#6d1a2c',pink:'#f0a0c0',lavender:'#b9a2e0',purple:'#6a3d9a',navy:'#1f2f5a','sky blue':'#7fb7e6',teal:'#2f9a90',emerald:'#1f8a4c',gold:'#d9a94e',silver:'#c8ccd4',brown:'#6b4a2e'};
const COLOR_KEYS = Object.keys(COLORS);
const sw = c => `<span class="swatch" style="background:${COLORS[c]||'#888'}"></span>`;

const RACES = {
  human:   {label:'Human',    age:[21,34],  look:'human woman', mods:{charm:5}},
  elf:     {label:'Elf',      age:[90,380], look:'elf woman with long pointed ears', mods:{refinement:10,beauty:5,stamina:-5}},
  beastkin:{label:'Beastkin', age:[20,32],  look:null, mods:{stamina:10,agility:5,refinement:-5}, subs:['fox','cat','wolf','rabbit']},
  demon:   {label:'Demon',    age:[110,320],look:'demon woman with small curved horns and a slender spade-tipped tail', mods:{charm:5,lewd:15}},
  dwarf:   {label:'Dwarf',    age:[45,140], look:'stocky, muscular dwarf woman with mature features and strong shoulders', mods:{strength:15,stamina:5,beauty:-5}},
  spirit:  {label:'Spirit',   age:[150,600],look:'ghostly spirit woman with a faint pale glow and softly translucent edges', mods:{charm:5,refinement:5,strength:-10}, rare:true}
};
const NAMES = {
  human:{f:['Elena','Brigid','Tessa','Lorna','Celia','Ada','Rosalind','Nell','Vera','Odette','Margo','Juna','Sabine','Corinne','Delphine','Imogen'],l:['Hale','Marlowe','Crane','Fenwick','Dunmore','Rook','Varga','Lisle','Ashby','Corwin']},
  elf:{f:['Ithriel','Saelis','Lirien','Aelwen','Nymira','Thalia','Elaria','Sylvaine','Faelith','Ysolde'],l:['Moonwhisper','Starfall','Dawnleaf','of the Silverbough','Windsong']},
  beastkin:{f:['Rin','Suzu','Mika','Tama','Hotaru','Nyra','Fenna','Riko','Ayla','Kiri','Momo','Sable']},
  demon:{f:['Vexa','Morrigan','Zariel','Nyx','Belphine','Seraxa','Ilvara','Ksenia','Malira','Ophra']},
  dwarf:{f:['Brunna','Dagny','Thora','Ingrid','Gunnhild','Sigrun','Halla','Astrid'],l:['Stonebrew','Copperhand','Anvilheart','Deepbraid','Emberforge']},
  spirit:{f:['Lenore','Morwen','Isabeau','Ophelie','Wynne']}
};
const BUILDS = ['slender','curvy','athletic','voluptuous','toned','tall and lean','soft and curvy','statuesque'];
const HAIR_STYLES = ['long straight','long wavy','shoulder-length','bob-cut','high ponytail','braided','messy','side-swept','long curly','pixie-cut','half-up'];
const HAIR_COLORS = ['black','dark brown','chestnut','auburn','red','copper','blonde','honey blonde','platinum blonde','silver','white','ash grey','pink','lavender','teal','deep blue','crimson'];
const EYES = ['amber','green','emerald','blue','ice-blue','violet','grey','brown','golden','crimson','heterochromatic blue and gold'];
const SKINS = ['fair','pale','porcelain','olive','tan','sun-kissed','brown','dark brown'];
const DEMON_SKINS = ['lavender-tinted','ash-grey','pale blue-tinted'];
const FEATURES = ['a beauty mark under one eye','light freckles','a small scar on her cheek','an elegant tattoo on her shoulder','gold hoop earrings','a velvet choker','a confident smirk','long eyelashes','a flower in her hair','a thin scar across her arm','painted nails','an ornate hair pin'];
const PERSONALITIES = ['Cheerful and teasing','Calm and elegant','Shy but earnest','Proud and sharp-tongued','Laid-back and lazy','Bold and flirtatious','Bookish and curious','Warm and motherly','Mysterious and aloof','Hot-blooded and competitive'];
const HOOKS = ['a failed merchant venture left her looking for steady coin','her adventuring party disbanded and she wanted a change','she ran from an arranged marriage','she wants to save enough to open her own tea house','she is simply curious about the work, and the pay is good','she lost her position in a noble household','she sends money home to her family','she loves the nightlife and the people','she is searching for a missing sister and needs coin and contacts','she got bored of farm life'];
const GIFTS = ['a silk ribbon','a bottle of elven wine','a hand-drawn sketch (it is not good)','a hair comb from the market','a small music box','a box of honey cakes','a pair of earrings'];

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
  'Devoted':{desc:'Sam\'s lover. Never leaves; more willing with Sam; mood stays up.', story:true},
  'Oblivious':{desc:'Thinks of Sam as the boy from next door. Far less willing with him until her story moves along.', story:true}
};
// Personalities: what she enjoys doing with Sam, and which jobs she likes or dislikes.
// likes/dislikes: chat, dinner, gift, train, private. trust = multiplier on trust Sam earns. lewd = lewdness growth.
const PERS = {
  'Cheerful and teasing':       {likes:['chat','gift','walk'], dislikes:['train','theater'],   jobsUp:['bartender','companion','reception'], jobsDown:['maid','security'], trust:1.1, lewd:1.05},
  'Calm and elegant':           {likes:['dinner','train','theater'], dislikes:['walk'],    jobsUp:['madame','companion','dancer'],      jobsDown:['bartender','maid'], trust:1.0, lewd:0.95},
  'Shy but earnest':            {likes:['chat','train','walk'], dislikes:['dinner'],  jobsUp:['maid','reception'],                 jobsDown:['dancer','courtesan'], trust:1.2, lewd:0.85},
  'Proud and sharp-tongued':    {likes:['gift','theater'],  dislikes:['chat','walk'],    jobsUp:['madame','security','courtesan'],    jobsDown:['maid'], trust:0.85, lewd:1.0},
  'Laid-back and lazy':         {likes:['chat','private'],  dislikes:['train','walk'],   jobsUp:['companion','bath'],                 jobsDown:['security','maid'], trust:1.0, lewd:1.05},
  'Bold and flirtatious':       {likes:['private','dinner'],dislikes:['train'],   jobsUp:['courtesan','dancer','bartender'],   jobsDown:['maid','reception'], trust:1.0, lewd:1.2},
  'Bookish and curious':        {likes:['train','chat','theater'], dislikes:['gift'],    jobsUp:['reception','madame'],               jobsDown:['security','dancer'], trust:1.05, lewd:1.0},
  'Warm and motherly':          {likes:['dinner','chat','walk'], dislikes:[],          jobsUp:['madame','bath','maid'],             jobsDown:['security'], trust:1.1, lewd:0.95},
  'Mysterious and aloof':       {likes:['gift','private','theater'], dislikes:['chat'],    jobsUp:['dancer','companion'],               jobsDown:['reception'], trust:0.8, lewd:1.0},
  'Hot-blooded and competitive':{likes:['train','dinner'],  dislikes:['gift','theater'],    jobsUp:['security','bartender','dancer'],    jobsDown:['reception','maid'], trust:1.0, lewd:1.05}
};
const ACT_WORD = {chat:'chats',dinner:'dinners',gift:'gifts',train:'training',private:'private time',walk:'walks',theater:'the theater'};
function pm(w,a){ const P = PERS[w.personality]; if(!P) return 1; return P.likes.includes(a) ? 1.5 : P.dislikes.includes(a) ? 0.5 : 1; }
const pTrust = w => (PERS[w.personality]||{}).trust || 1;
const pNote = (w,a) => pm(w,a)>1 ? `\n\n(${w.name} loves ${ACT_WORD[a]}.)` : pm(w,a)<1 ? `\n\n(${w.name} isn't big on ${ACT_WORD[a]}. It went okay, but not great.)` : '';
const has = (w,t) => (w.traits||[]).includes(t);
