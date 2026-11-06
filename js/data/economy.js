'use strict';
/* =====================================================================
   DATA: jobs, houses, economy
   ===================================================================== */
const JOBS = {
  rest:      {label:'Rest',           cat:'rest',  desc:'Recover energy, health and mood.'},
  madame:    {label:'Madame',         cat:'staff', energy:20, skill:'manage',  desc:'Raises everyone\'s mood and escort income in her house.'},
  reception: {label:'Receptionist',   cat:'staff', energy:15, skill:'service', desc:'More clients and better matches.'},
  security:  {label:'Security',       cat:'staff', energy:20, skill:'combat',  desc:'Prevents trouble. Builds trust.'},
  bartender: {label:'Bartender',      cat:'staff', energy:20, skill:'bar',     desc:'Sells drinks. Half as good without a Bar. Gets propositioned.'},
  dancer:    {label:'Dancer',         cat:'staff', energy:25, skill:'dance',   needs:'stage', desc:'Draws crowds; builds popularity. Gets propositioned a lot.'},
  bath:      {label:'Bath Attendant', cat:'staff', energy:20, skill:'service', needs:'bath', desc:'Tends the bathhouse. Gets propositioned constantly.'},
  maid:      {label:'Maid',           cat:'staff', energy:15, skill:'service', desc:'Keeps the house spotless (+reputation).'},
  companion: {label:'Companion',      cat:'escort', desc:'Drinks and company in the lounge. No room needed. Clients may ask for more; she accepts anything on her menu.'},
  courtesan: {label:'Courtesan',      cat:'escort', room:true, desc:'Advertises her service menu. Uses a room.'}
};
// Trust she needs before she'll take a job she doesn't particularly like. Jobs she enjoys need none.
const JOB_TRUST = {companion:15, courtesan:30, bartender:10, reception:15, maid:5, security:20, dancer:25, bath:25, madame:40};
function jobTrust(w, job){
  const P = PERS[w.personality]||{jobsUp:[],jobsDown:[]};
  if(P.jobsUp.includes(job)) return 0;
  return (JOB_TRUST[job]||0) + (P.jobsDown.includes(job)?15:0);
}
// Job positions per house. Escort slots: courtesans need a bedroom each; companions need lounge space.
function slotsFor(h, job){
  const u = h.up || {};
  return {madame:1, reception:1, security:1+(u.guard?2:0), bartender:u.bar?2:1, dancer:u.stage?2:0, bath:u.bath?2:0,
    maid:1+Math.floor(houseSize(h)/6), companion:2+(u.lounge?3:0), courtesan:h.rooms, rest:99}[job] ?? 99;
}
const BEDS = [{label:'Straw cots',rest:30,cost:0},{label:'Proper beds',rest:42,cost:400},{label:'Feather beds',rest:55,cost:1000},{label:'Luxury beds',rest:70,cost:2200}];
const FLOOR_REST = 18;
const AMENITY_SIZE = {bar:1, stage:1, guard:1, lounge:1, bath:2};
const houseSize = h => (HOUSES[h.id].size||9) + (h.annex?3:0);
const roomsUsed = h => h.rooms + (h.quarters||0) + Object.keys(h.up||{}).filter(k=>h.up[k]).reduce((a,k)=>a+(AMENITY_SIZE[k]||1),0);
const bedsFor = h => (h.quarters||0)*2;
const sleepers = h => S.workers.filter(w=>w.house===h.id && w.race!=='spirit');
const RACE_PERK = {
  human:{label:'Adaptable', desc:'Trust and skills grow 15% faster.'},
  elf:{label:'Long-lived', desc:'Mood changes slowly, for better and worse.'},
  beastkin:{label:'Simple needs', desc:'Asks for 25% lower wages, recovers 15% more energy, and her lewdness grows 15% faster.'},
  demon:{label:'Feeds on desire', desc:'Services cost her half the energy: she feeds on desire. Sleep does less for her.'},
  dwarf:{label:'Hardy', desc:'+25 max energy and recovers 25% more from rest. Bartends 15% better. Expects 10% higher wages.'},
  spirit:{label:'Incorporeal', desc:'Needs no bed. Recovers a steady amount every week, anywhere.'}
};
const PROP_RATE = {bartender:0.07, dancer:0.10, bath:0.15, reception:0.03, maid:0.03};
const PROP_WHERE = {bartender:'at the bar', dancer:'after her set on stage', bath:'in the bathhouse', reception:'at the front desk', maid:'in the hallway'};
const UPGRADES = {
  bar:    {label:'Bar',        cost:500,  upkeep:20, desc:'Full bartender income.'},
  stage:  {label:'Stage',      cost:900,  upkeep:25, desc:'Unlocks the Dancer job.'},
  guard:  {label:'Guard Post', cost:400,  upkeep:10, desc:'Security is much more effective.'},
  lounge: {label:'Lounge',     cost:1100, upkeep:25, desc:'+3 clients/week, more wealthy guests.'},
  bath:   {label:'Bathhouse',  cost:1400, upkeep:30, desc:'+mood, +satisfaction. Unlocks Bath Attendant job and bath scenes.'}
};
const ROOM_MULT = [1, 1.25, 1.6, 2.1];
const ROOM_NAMES = ['Shabby','Comfortable','Lavish','Opulent'];
const ROOM_TIER_COST = [600, 1500, 3500];
const PRICES = [
  {label:'Cheap',mult:0.7,demand:1.3},{label:'Fair',mult:1.0,demand:1.0},{label:'Premium',mult:1.4,demand:0.8},
  {label:'Luxury',mult:1.9,demand:0.6},{label:'Exclusive',mult:2.6,demand:0.42}];
const CLASSES = [{id:'commoner',label:'Commoner',mult:0.5},{id:'adventurer',label:'Adventurer',mult:0.8},{id:'merchant',label:'Merchant',mult:1.2},{id:'noble',label:'Noble',mult:2.0}];
const CLIENT_DESC = needData('people').clients;
// cls = clientele weights [commoner, adventurer, merchant, noble]
const HOUSES = {
  lantern: {size:9, quarters:1, beds:1, name:'The Gilded Lantern', loc:'Old Town', npc:'mira', rooms:2, tier:0, up:{}, demand:1.0, cls:[1,1,1,1], upkeep:40, debt:15000, cost:6000, rep:10, starter:true,
    desc:'A classic pleasure house: red velvet, paper lanterns, and a madame who knows everyone in town. Balanced clientele.',
    setting:'red velvet and gold-trimmed fantasy pleasure house'},
  castle:  {size:14, quarters:2, beds:2, name:'Castle Rosenhal', loc:'Noble Hill', npc:'cecile', rooms:2, tier:1, up:{lounge:true}, demand:0.7, cls:[0.15,0.4,1.4,2.6], upkeep:90, debt:21000, cost:14000, rep:15, premium:true, level:6, renown:40, minPop:40,
    desc:'A crumbling hilltop manor turned discreet retreat for the wealthy. Few guests, very deep pockets, very high standards.',
    setting:'grand old castle chamber with tall windows and faded tapestries'},
  onsen:   {size:9, quarters:1, beds:1, name:'Steamveil Onsen', loc:'Mountain Road', npc:'tsubaki', rooms:2, tier:0, up:{bath:true}, demand:1.1, cls:[0.7,1.9,0.8,0.4], upkeep:70, debt:17000, cost:9000, rep:8, starter:true,
    desc:'Hot springs on the road to the dungeons. Tired adventurers, cheap sake, and a lot of steam.',
    setting:'wooden onsen inn with paper screens and rising steam'},
  hollow:  {size:12, quarters:2, beds:1, name:'Hollowmere Manor', loc:'Edge of Town', npc:'vesper', rooms:3, tier:1, up:{}, demand:0.8, cls:[0.6,1.3,1,1.3], upkeep:25, debt:9000, cost:3500, rep:3, haunted:true, starter:true,
    desc:'Dirt cheap because it\'s haunted. The ghost is part of the staff now. Customers barely trickle in at first, but thrill-seekers flock once its reputation grows.',
    setting:'gothic manor room with candelabras, cobwebs and moonlight'},
  tankard: {size:5, quarters:1, beds:0, name:'The Rusty Tankard', loc:'The Docks', npc:'hilde', rooms:1, tier:0, up:{bar:true}, demand:1.5, cls:[2.2,1.3,0.5,0.05], upkeep:25, debt:8000, cost:2500, rep:8, starter:true,
    desc:'A tiny tavern with rooms upstairs. Cheap, loud, always busy. Nobles do not come here.',
    setting:'cramped tavern room above a dockside bar'},
  pavilion:{size:10, quarters:1, beds:2, name:'Moonlit Pavilion', loc:'Elven Quarter', npc:'sylphine', rooms:2, tier:1, up:{stage:true}, demand:0.8, cls:[0.3,0.8,1.3,1.7], upkeep:60, debt:16000, cost:10000, rep:12, premium:true, level:4, renown:30, minPop:30,
    desc:'A garden pavilion of music and moon-lilies. Refined, artistic, unhurried.',
    setting:'elven garden pavilion with moon-lilies and silk drapes'},
  veil:    {size:10, quarters:1, beds:0, name:'The Crimson Veil', loc:'Underdistrict', npc:'zaria', rooms:3, tier:0, up:{}, demand:1.2, cls:[1,1.5,1,0.6], upkeep:45, debt:13000, cost:9000, rep:6, lewdBoost:1.3, trouble:1.5, premium:true, level:5, renown:25, minPop:20,
    desc:'A demon-run den beneath the streets. Anything goes, within reason. Trouble walks in often. Staff get bolder here.',
    setting:'dim underground den with crimson silk and red lanterns'},
  wayfarer:{size:9, quarters:2, beds:1, name:'Wayfarer\'s Rest', loc:'The Crossroads', npc:'bettina', rooms:2, tier:0, up:{}, demand:1.0, cls:[1,0.9,1.8,0.5], upkeep:40, debt:12000, cost:6000, rep:10, recruit:1, starter:true,
    desc:'A caravan inn where every road meets. Merchants, travelers, gossip, and a steady stream of job-seekers.',
    setting:'cozy roadside inn room with a crackling hearth'}
};
const PASTS = {
  salaryman:{label:'Office worker', desc:'Spreadsheets were his life. Business +20; doing the books saves more.', fx:s=>{ s.business+=20; }},
  bartender:{label:'Part-time bartender', desc:'He can make a cocktail out of anything. Charm +12; tending bar earns 50% more.', fx:s=>{ s.charm+=12; }},
  gym:{label:'Gym regular', desc:'Thin, but surprisingly strong. Strength +20; recovers more energy.', fx:s=>{ s.strength+=20; }},
  otaku:{label:'Isekai otaku', desc:'He has read this story a hundred times. Appraisal starts at Lv 2.', fx:s=>{ s.appraisal=2; s.appXP=60; }},
  cook:{label:'Line cook', desc:'Staff meals and home cooking. Dinners are free; everyone +2 mood each week.', fx:s=>{ s.charm+=4; }},
  massage:{label:'Massage therapist', desc:'Good hands, zero experience otherwise. Technique +15; training is more effective.', fx:s=>{ s.technique+=15; }}
};
