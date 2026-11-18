# Purpose
This file is for big ideas when I have a fresh batch of Claude usage.

## Content
- Make sure we have good amounts of traits, personalities, perks, titles, etc for both ladies and customers and that there's plenty for every stat, skill, job, appearance factor, etc and that nothing stands out as useless or redundant.
- Is the gameplay well rounded? Anything thta adds bloat or conversely should be fleshed out? any additional systems we could add to improve the game?


## Houses
- Check the balance of the houses against one another and NG Plus house balance. Cheaper houses should be less revenue generating eventually but enable a faster payoff.


## New Game Plus
- Check the balance. Ideally difficulty slowly increases and is fairly well balanced no how many girls you bring over. NG++ should be harder still. but not via taking a super long time to progress.


## Races
- Check the balance. 1They don't necessarily need to all be balanced for every activity. demons may be the strongest courtesans but should still be risky in less proposition friendly roles, and require more maintenance there (or just waste time propositioning customers instead of actually working). Humans are the default all arounders who are easy to raise. 


## Services
- Check the lewdness thresholds for acts (especially with Sam) and make sure everything makes sense.


## Story
- All non guest characters should have fully fleshed out stories.
- Check the tone and length of various stories, arcs, and bonds.


## Week structure (done 2026-11-17, branch feat/week-nights-focus)
- The week stays the turn. A turn is **a rest day, then six work nights**: Sam's actions (dates, private time, walks, scouting, rounds, guild visits) happen on the rest day, when the ladies are off too; his work moves to a weekly **focus** that runs during the six nights. Say so explicitly in the UI ("3 actions left today", "End the week", report = the six nights).
- **Clients per night instead of per week.** Each night a courtesan takes up to her nightly cap (1-3 from Stamina; can go higher as stat caps rise in NG+, plus trait/race bonuses), limited by energy. After each night a small rest calculation (bed quality, how hard the night was) gives back some energy, so a strong lady can sustain her cap and a tired one tapers off. The full sleep recovery stays at week's end. Replaces the flat `capc = 10` in `simHouse`; an unhandled pushy client then costs exactly one night's clients (replaces `props.nightCap`). Rebalance with the lab afterward: every income number shifts.
- Still open: internal keys that say "night" for something weekly (`goodNight`/`badNight`), and a pass over flavor text that calls the whole turn a day.

## Sam's weekly focus (done 2026-11-17; Guild focus waits for the guild pass)
Sam picks one focus per week (costs a share of his weekly energy, so a hard week leaves less for the rest day). He never unlocks a second one. Moving work out of actions: bartending, watch, books, skill class and stat class stop being action buttons; rounds and scouting stay rest-day actions. Demonstration stays a rest-day action as it is (decided 2026-11-17).
- **Office:** cuts upkeep (the current books), no direct income. Works as a madame: pairs courtesans with clients and attendants with the right courtesans (a share of a madame's effect normally, most of it when the house's madame is off or missing).
- **Floor:** income if the house has a bar (bartending), keeps waiting clients happy, small mood and trust boost for the ladies.
- **Watch:** the current watch bonus plus his step-in rescue bonus all week, and a larger trust boost (the ladies feel safe).
- **Classes:** skill or stat class (pick the topic or Auto), current lesson math.
- **Guild:** works a contract (below). He's away, so none of the at-house effects apply that week.
- Goddess idea: post-binding she could grant extra focus-like help; unlike Sam she can actually take clients herself. Future/low priority: a small number of female clients interested in women (would let Sam's focus or the goddess serve them).

## Adventurers' Guild (first pass done 2026-11-17, branch feat/guild-contracts; see docs/GUILD.md)
- Done: quest board, ranks Copper→Mithril, 9 contract types, ladies' `guild` job + Sam's Guild focus, multi-week progress, injuries (Health), gold/merit/fame/popularity rewards, Sam's tools from contracts, 6 Sam perks, rank beats (Rhoswen, Hanna, new Vesna and Brunhild), party scenes (duo, trio, pair, lustbloom yuri), Seasoned Adventurer earnable trait, courier past life.
- Outfits: 9 guild-only outfits (first clear of each contract, Bronze rank tabard) plus a chance of a shop outfit on every completion.
- Contract numbers are fine for now (2026-11-17). Vesna and Brunhild have bond events now (data/bonds.json p_vesna_*, p_brunhild_*). Still open: more contract types and scenes per tag; Vesna/Brunhild after-stories; whether rank should carry partially into NG+.
- Turn the guild into a quest board with ranks instead of a three-visit recruit button. Sam takes contracts through his **Guild** focus; ladies take them as their **job** for the week (Combat, Strength, Agility, plus Wits/Charm/Refinement for some). Sam and ladies can also go together.
- Contract types: caravan escort, dungeon porter, arena bout, monster hunt, bodyguard at a noble's ball (courtesan skills count). Each has a rank, checks, party slots, a reward and a risk. Possibly multi-week contracts (a progress bar the party fills each week); still to decide.
- Sam + a lady with enough trust and lust on the same contract unlocks exclusive scenes (campfire, shared tent, after a fight) and trust/bond gains.
- A bad roll injures whoever went. This is the one thing that would give Health a purpose (injured = rests until healed; chapel / bathhouse speed it up). If the quest board doesn't happen, drop Health entirely.
- Rewards: gold, unique outfits, guild rank, a boost to adventurer and mercenary clients. **Sam's items come mostly from contracts** (see Sam's items); some items persist into NG+, plus a couple of guild perks.
- Each rank-up is a story beat with a girl in it: Hanna at the desk, Rhoswen, then party members Sam rescued, outbid or impressed. Former Adventurer / Brawler / Shield-Sister ladies should get an edge.
- Still to design: the contract list and checks per rank, how rank progresses, which items/perks come from where, which carry into NG+.

## Isolde (rival) (done 2026-11-17, branch feat/isolde-bonds-housetext)
- Storyline in js/events/isolde.js + data/isolde.json (numbers balance.json → isolde): taunt → tour of the Velvet Thorn → price war (a town event) → festival wager → truce (first night) → lovers. Beats need town renown and a few weeks between them. After the truce Sam can visit her on the rest day (Errands) and she turns up if he stays away; nights are rough and competitive (let her lead / take control / make it a contest). She never joins. Poaching stops after the truce; once lovers, the Thorn sends overflow some weeks.
- NG+ carries her story over (unfinished ones continue); NG+ cycles after it's finished get her games, repeatable wagers (cards, Demonfire, rooftop race, last one standing, repeat clients, owner's night). NG++ restarts it every NG++ cycle: déjà vu (1), an attraction she resents (2), openly hungry (3+).
- Still open: more nights (especially lovers ones), rival events tied to her house's standing against Sam's, a goddess reaction to her.

## Town events (done 2026-11-17, branch chore/cleanup-mid-cycle-events)
- The NG+ cycle variables are now town events: every 4-7 weeks, in any cycle (cycle 1 too), one runs for 2-3 weeks with an announcement page and a header chip (`balance.json → townEvents`, wording `events.json → townEvents`). Effects were raised a bit since they no longer last a whole cycle; Crimson Nights lost its debt part. Lab: `town-events`.
- Still open: more events (the Isolde price war and festival wager could be town events), choices on the announcement page, and events tied to one house instead of the whole town.
- The Returners' Circle (cycle 3+) now brings a visiting guest instead of an NG+ partner, so partners only come from walks and partner picks.

## Sam's items (done 2026-11-17)
- Teleport Circle split into Speaking Stones (focus + passive reach) and the Circle (visits reach); Shadow Clone = the Stones' half. The tool items now come from guild contracts (first clear) or the Iron rank-up; the shop keeps the coffee maker, notebook, Stones and Circle.
