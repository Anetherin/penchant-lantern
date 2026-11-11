# Balance pass: lab results

Made with `tools/lab` (see `tools/lab/README.md`); rerun any line with `node tools/lab/lab.mjs <spec>`.
Everything uses the lab's default player (Lantern, Kaede, salaryman unless varied), 12–16 paired seeds.
These are comparisons under one fixed player, not absolute truths. Δ figures are paired means; "±" is the 95% CI.

## Pass 2 (2026-11-11): support jobs, Sam's actions, NG+

Changes (all numbers in `balance.json`):
- **Security:** an unhandled pushy client (nobody there, or Sam's step-in fails) **ends her night**: a courtesan loses
  `props.nightCap` (2) clients of the week, anyone else 1/`props.nights` (6) of her output and that share of her
  propositions. Sam steps in **on the spot** during the week (+`watchBonus` if he stood watch), so the report already
  shows it; the after-report "Trouble downstairs" event is gone.
- **Tidiness:** maid gain x (100 − tidiness)/`maidEase` (35, max ×1.5): one maid holds a mid house at ~65–70 instead of
  pinning 100. Bands: ≥80 small bonus, 50–80 neutral, <50 shabby, **<30 a mess** (−1.5 rep/week, −6 mood, rest ×0.9,
  −10 client satisfaction, −20% demand).
- **Promoter:** draw 3 + (Charisma + Hospitality)/15, ×(1 + (1 − rep/60)) while the house is little known, 2nd/3rd
  promoter ×0.6^k, word of mouth +0.03 rep per client drawn.
- **Training** (re-checked on the no-picker training + classes from main): one-on-one skill training 8 + Technique×0.08
  (was 4 + Technique/25), her energy 6 (was 14). Stat coaching kept as designed (multi-stat by job).
- **NG+ loan:** keeps cycle 1's payment shape (`debt.ngplus.fewer/flatter` 0; was fewer, flatter, front-loaded payments
  each cycle) and grows through `ngplus.debtShare` 0.9 (was 0.7) and `perCycle` 0.35 (was 0.2).

Results:

| | before | after |
|---|---|---|
| Manor (Hollowmere) cycle 1 | 33 wks, mid 1,220/wk | 29 wks, mid 1,560/wk |
| first promoter vs none (mid / late) | ≈ −30 / −100 | +110 / +275 per week |
| no maid (mid tidiness / rep gain over 12 wks) | 54 / 3 | 28 / 2, demand −20% once <30 |
| unhandled incidents per week | 1.3 (after-report event) | 0.3–0.4, each ends a night |
| one-on-one skill training over a campaign | +8.3 wks vs bartending, worse than napping | +3.4 wks, like rounds/demos |
| NG+ cycle 2 with 0 / 1 / 3 / 5 lovers | 60% game over / 34 / 33 / 29 wks | 42 / 36 / 35 / 32 wks, no game overs |
| NG+ cycles 2-5, every house kept | 34, 26, then 70% game over at cycle 4 | 35, 29, 36, 33 wks; ≤10% game over |
| NG+ cycles 2-5, home house only | 34, 32, 34, 34 | 35, 38, 39, 40 wks |
| NG+ boons spread | −7.6 (Deep Pockets) … +1.6 wks | −0.8 … +4.2 wks |

Sam's spare action over a whole cycle 1 (`sam-actions-campaign`, Δ weeks to clear vs bartending at 33): stat class
+0.5, skill class +0.7, books +1, scouting/napping +1.8, dates +2, stat coaching +2.5, rounds +3, skill training +3.4
(was +8.3 before this pass), service practice +4.2, demonstrations +4.4. Practice/demos also build lust, lewdness and
intimacy, which the lab player doesn't value. Money actions win
on speed, the others trade 2–3 weeks for trust, skills and stats (which also carry into NG+). Over 12-week windows
(`sam-actions`), books ≈ bartending (books cuts upkeep ~40%), and security/scouting only pay when there are incidents
or open beds.

What a stat point is worth (`stat-value`): +5 to every stat on every lady ≈ +220/week mid; per lady-point Beauty and
Stamina ≈ 2.5g/week, Charm ~1.2, Wits/Refinement/Agility/Strength near 0 for income, Charisma ≈ 0 (now feeds promoters).

## Still open

1. **Support jobs vs a courtesan.** The first maid/promoter now clearly earns its place, but moving two *more* ladies
   into promoter/maid/security/host still costs 200–470/wk (a courtesan nets ~475/wk). A courtesan slot is the
   bottleneck. If you want support roles closer to that, raise what each does per house size rather than per lady.
2. **NG+ trap houses:** with the new loan, Skyhook (80% game over) and Pearl (40%) as the cycle-2 house, and Tankard
   (30%), are still traps for this player; Veil (28 wks) and Castle (30) are easiest. Skyhook/Pearl debt is 45k/55k
   before the per-cycle scaling.
3. **Starting houses** spread 16 (Veil) to 34 (Onsen) weeks; Onsen and Tankard have the weakest mid/late game.
4. **Demons** (by design) are strongest as courtesans and weak elsewhere: −200/wk mid, −500/wk late if every generic is
   one. Spirits/androids came out strong after this pass (+240 to +380/wk late when every generic is one); unexplained.
5. NG+ cycle 3 is the easiest one when you keep every house (29 wks vs 35/36 around it): the third house arrives
   with residents and upgrades but its debt only joins at the next cycle.

## Pass 1 (2026-11-10), before the changes above

- Starting houses spread 18–34 weeks to clear; Castle best late game, Onsen/Tankard weakest.
- Partners: Nerys strongest in both cycles; Adelheid weakest start (+14.5 wks), Marisol/Lirael +6.
- Sam's pasts: salaryman strongest for this player; Otaku and Tutor need training play to show anything.
- (The pass 1 note that NG+ took "~65 weeks" was a lab bug: it reported the absolute week. Cycle 2 took ~34.)
