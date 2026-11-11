# Balance pass: first lab results (2026-11-10)

Made with `tools/lab` (see `tools/lab/README.md`); rerun any line with `node tools/lab/lab.mjs <spec>`.
Everything below uses the lab's default player (Lantern, Kaede, salaryman unless varied), 12–16 paired seeds.
These are comparisons under one fixed player, not absolute truths. Δ figures are paired means; "±" is the 95% CI.

## Baselines (Lantern, cycle 1)

| phase | starts | net/wk (house) | + Sam | notes |
|---|---|---|---|---|
| early (≤4 ladies, no upgrades) | wk 1 | ~760 | — | courtesans ~520/wk each; Kaede carries it |
| mid (5 ladies) | wk ~6 | ~1,080 | ~1,230 | |
| late (rooms full) | wk ~15 | ~1,580 | ~1,820 | |
| debt cleared (pays off early) | wk ~33 | | | 0 missed payments, 0 game overs |

NG+ (Lantern kept + Wayfarer, Seasoned Owner): new debt ~62k, ~4 ladies to start, cycle 2 cleared at ~wk 67 (≈2x cycle 1).

## Findings worth acting on

1. **Starting houses spread 18–34 weeks to clear.** Veil (wk 18), Pavilion (20), Castle (25) are far easier than
   Lantern/Onsen/Hollow/Tankard (33–34) because their debt is smaller and income isn't. Castle also has the best
   late game by far (+1,200/wk vs Lantern). Onsen and Tankard have the weakest mid/late (−300 to −760/wk). (`houses`)
2. **Demons underperform everywhere** (−130/wk mid, −480/wk late when the house's generics are demons; demon-only
   hiring: +12.5 weeks to clear, 20% game overs). Cause: they get no energy from sleep (35% on rest) and burn
   `svc.demon.hunger` every working week, refuelling only by finishing services, so any demon in a non-service job
   (maid, promoter, bartender, attendant) drains and sits out long rests. Other races sit within about ±120/wk. (`races`, `races-hire`)
3. **Support jobs are worth far less than a courtesan.** Moving 2 more ladies into promoter/maid/security/host costs
   250–350/wk; attendant ~150; bartender/dancer/bath ~50–100 (bath gives +6 satisfaction). Keeping 0, 1 or 2
   maids/promoters barely changes income (differences inside the noise). A promoter's or maid's indirect value is
   currently near zero at the margin. (`jobs`, `support`)
4. **NG+ house choice can end the run.** Onsen, Tankard, Skyhook and Pearl as the new house lead to game overs in
   60–70% of runs; Castle (−11 weeks) and Veil (−12) are the clear best; taking no new house beats Wayfarer by 5 weeks.
   The premium NG+ houses (Skyhook 75k, Pearl 85k debt) are traps for this player. (`ngplus-houses`)
5. **NG+ boons are lopsided.** Deep Pockets (−7.6 weeks, +730/wk) and Friends at the Guild (−5.5, +480/wk) dominate;
   Lenient Lender is weak (−2.3 weeks) for what it promises; Renown, Fated Meeting, Old Loyalties, Vivid Memories and
   Shadow Clone show no measurable effect for this player (some need play it doesn't do). (`ngplus-boons`)
6. **Partners:** Nerys is the strongest in both cycles (cycle-1 mid +290/wk; NG+ −7 weeks, +710/wk). Adelheid is the
   weakest start (+14.5 weeks to clear, −490/wk late); Marisol and Lirael +6 weeks. In NG+, Lara and Akari add little;
   no partner at all costs ~420/wk. (`partners`, `ngplus-partners`)
7. **Sam's pasts are close**, with salaryman the strongest for this player (Business → income bonus). Gym is the weakest
   (+3.5 weeks). Otaku and Tutor produce *identical* games here because they only touch Wits/training/Appraisal,
   which the lab player never uses; they need a training-focused policy to evaluate. (`pasts`, `ngplus-pasts`)

## Not covered yet (the player doesn't do these)

One-on-one training, lessons, scouting, feasts, decor/drinks tiers, classroom/chapel, dates with anyone but the partner,
madame focus choices, multiple houses in cycle 1. Add policy options in `tools/lab/bot.js` to cover them.
