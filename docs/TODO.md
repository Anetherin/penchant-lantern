# Purpose
This file is for big ideas when I have a fresh batch of Claude usage.

## Content
- Make sure we have good amounts of traits, personalities, perks, titles, etc for both ladies and customers and that there's plenty for every stat, skill, job, appearance factor, etc and that nothing stands out as useless or redundant.
- Is the gameplay well rounded? Anything thta adds bloat or conversely should be fleshed out? any additional systems we could add to improve the game?
- Event/encounter scenes should either reflect the girls clothes or the image prompt should use the clothing (etc) from the description of the scene
- More variety of events in general 
- Bath attendants scenes should probably be in the baths. exhibitionist scenes should be in the open. Make sure scenes and descriptions line up in general.

## Houses
- Check the balance of the houses against one another and NG Plus house balance.
- Cheaper houses should payoff sooner even if more expensive houses generate more income long term. Might need to look into the payoff schedule which probably needs to be more aggressive in NG Plus.




## New Game Plus
- [x] NG++ Soft Reset post-Cycle 5 (once Seliora is bound / binding): soft reset to The Lantern Shrine (`shrine`, room cap starting at 5 and +5 per NG++ cycle, house-wide bonus scaled by total Reincarnations of working staff), reset Sam's level to 1 while keeping boons/pasts/challenge perks/energy & raised caps, reset houses/upgrades/stories/lover stories once on NG++1 (house upgrades & stories persist in `S.ngppHouses` afterwards without cycle scaling, paid when re-buying), keep prior characters' reincarnated stacks & NG+ perks in `S.lives`/`S.alumni` (returning lovers/partners in NG++ remember Sam progressively across re-recruitments), and choose a new Bound Vessel from `GOD_FORMS` that starts empty and awakens in stages as Sam fills her up.
  - [ ] Write custom 3-tier per-partner re-recruit memory lines in `data/walks.json → partnerMemoryLines` (replacing generic `exLoverMemoryTiers` / `isekaiMemoryTiers` fallbacks).
- [x] Cycle Variables & Cycle Challenges: rolled per cycle (`cycleVars` / `cycleChallenges` in `data/balance.json`) unlocking permanent perks in `S.challengePerks`.
- [x] Standard NG+ cost scaling: loan scales by cycle #, optional kept houses (`perKeptHouse`, `keptHouseShare`), and carried lovers (`perLover`, `loverDebt`).


## Races
- They don't necessarily need to all be balanced for every activity. demons may be the strongest courtesans but should still be risky in less proposition friendly roles, and require more maintenance there (or just waste time propositioning customers instead of actually working). Humans are the default all arounders who are easy to raise. 


## Services
- Check the lewdness thresholds for acts (especially with Sam) and make sure everything makes sense.
- If there's a reasonably competent Madame and/or attendant, courtesans being overworked should be quite rare

## Story
- All non guest characters should have fully fleshed out stories 
- The isekai characters should feel like people Sam knows from home moreso than inhabitants of this world
- Certain characters should call Sam by different names (boss is more generic and probably not suitable for most isekai girls)
- Stories are expanded from current and take current physical progress into account 
- Some (like bath scenes) should lead into a service scene depending on what the girl is comfortable with
- Check the tone and length of various stories, arcs, and bonds.
