# Balance lab notes

Made with `tools/lab` (see `tools/lab/README.md`); rerun any spec with `node tools/lab/lab.mjs <spec>` (available specs live in `tools/lab/exp/`).
Results below use the lab's fixed policy player (`tools/lab/bot.js`) and 12–16 paired seeds unless noted. Δ figures are paired means; "±" is the 95% CI.

> [!NOTE]
> The lab's default player changed on 2026-11-16 (security when incidents pile up, a second maid when tidiness sags, decor/drinks after the debt, better picks for support roles) and `winWeek`/`gold26` were replaced by `weeksToWin`/`worth20`. Use `"policy": {"preset": "legacy"}` to compare against the old player.
>
> Pass 1 (2026-11-10) and Pass 2 (2026-11-11) were measured **before** the later queue/security/crowding overhaul, house class/prestige system, and Cycle-1 / NG+ debt rebalance in `balance.json` and `economy.json`. Re-run the specs in `tools/lab/exp/` (`houses-all`, `jobs-all`, `ngplus-houses`, `ngpp`, `pricing-campaign`, `amenities`, `sam-actions-campaign`, `races`) for current numbers.

## Intent checks: first pass (2026-11-16, `check.mjs --quick`, 6 seeds, adaptive bot)

`node tools/lab/check.mjs` tests the design intents in `tools/lab/checks.json` (edit the thresholds there). Quick-run results, to be confirmed with a full run (12–16 seeds):

| check | result | what it showed |
|---|---|---|
| cycle1-winnable | PASS | every run clears the debt, ~30 weeks |
| tidiness-neutral-70 | PASS | 60 vs 70: no difference (both in the neutral band) |
| tidiness-penalty-below-30 | PASS mid / UNSURE late | tidiness 25 costs ~430 g/week (more than 10%) |
| promoter-pays | **FAIL** | a promoter **loses** money early (−144 Lantern, −195 Manor) and in the mid-game Manor: she draws extra clients (+13/wk) the house can't seat, so turn-aways jump (1 → 8.6/wk) and popularity drops. Promoter draw may need to scale with free capacity, or turn-aways hurt less early |
| security-stops-incidents | WARN | security cuts incidents, but late-game she costs ~90 g/week (not significant) |
| demons-top-courtesans | **FAIL** | as all-courtesan houses, demons rank #8 of 12 mid-game and #2 late; androids, wolves and foxes lead mid |
| demons-poor-off-service | PASS | demons lose more than humans when moved to promoter/bartender/host/security |
| sam-actions-balanced | FAIL (noisy) | security, rounds and dates ~3.7 weeks slower than bartending; within noise at 6 seeds, recheck at full size |
| ngplus-a-bit-harder | **FAIL** | some NG+ runs end in game over (0 lovers: 17%, 3 lovers: 33%) |
| ngplus-lovers-speed-up | **FAIL** | carrying more lovers is **slower**: 3 lovers +8.8 weeks vs 0; lover debt (`loverDebt`, `perLover`) seems to outgrow what they bring |
| ngplus-slow-climb | WARN | later cycles are not longer than cycle 2 |
| ngpp-harder-still | WARN | NG++ runs mostly end in game over (5 of 6). Partly the bot: it stops looking for staff at 6 ladies in NG++, and income stays ~100 g/week. Fix the bot before reading this as balance |
| cheap-houses-pay-off-faster / premium-houses-earn-more-later | PASS | starters pay off faster; premium houses earn more post-debt (`houses-plateau`) |

Also found while building the checks: decor/drinks bought during the debt delay cycle-1 payoff by ~3.4 weeks for +300 g/week late-game net, so they don't pay back before the debt is due (the bot now buys them only after the debt is cleared).

### Follow-ups (2026-11-16, 8–10 seeds)
- **Bot fills every bed now.** Lantern still tops out at ~10 ladies (its 9 rooms are the limit, not the old cap). Bed-quality upgrades: +205 g/week late-game for ~1 week slower payoff.
- **Demon settings barely matter.** In all-demon courtesan houses, Feeding only (<50% or always), auto-stud at 60 lust and the Binding Sigil change weekly takings by −22…+60 g (none significant); auto-stud lowers what each demon nets (stud fees). Demons beat humans by a little (+48 mid, +21 late).
- **Androids are the outlier, not demons weak.** All-android houses earn +211 (mid) / +465 (late) a week over all-demon ones, and serve far more clients: they need no bed, so the same house holds more of them. Look at android capacity (or bed-free races generally) before buffing demons.

### Lover debt (2026-11-16, `ngplus-lover-debt`, 8 seeds)
Weeks to clear the first NG+ cycle by lovers carried (1 / 3 / 5): current 34 / 43 / 42 · flat `loverDebt` only 31 / 32 / 30 · `perLover` multiplier only 33 / 34 / 42 · neither 32 / 31 / 28.
**Changed:** `ngplus.perLover` 0.08 → 0, keeping the flat 1,500 per lover. Carrying lovers is now close to neutral, so there's no need to grind walks for more.
Still open: carrying **no** lover is much harder (56 weeks, 20% win failures, 30% game over in that run) than carrying one, whatever the debt rule. The gap comes from starting short-staffed, not from the debt.

### Android charging (2026-11-16, `android-fees`, 8 seeds, all-android courtesan houses vs wolf-beastkin)
Androids' edge is capacity: they take no bed, so a full house fits more of them (late game they served 34 clients/week vs 21). Charging fees scale with how many there are, so fees are the right lever.
Δ weekly total vs wolf houses (mid / late): fee 15 + 0.4/energy (old) +11 / +482 · 0.8 −35 / +322 · 1.2 −14 / +198 · 1.6 −47 / +166 · 1.2 + fee 30 −92 / +99.
**Changed:** `svc.android` fee 15 → 25, perEnergy 0.4 → 1.2 (between the last two rows). Demons sit at −200 / +16 on the same scale.

### Energy & fatigue (2026-11-16, campaign, 6 seeds)
Before: support staff netted +20 to +40 energy a week on Proper beds and never rested; courtesans sat at about −1 a week and rested 0% of the time, so energy barely mattered.
**Changed:** `balance.json → rest` (new): working recovery bed x (`work` 0.7 + `workFree` 0.25 x unspent share) (was 0.75 + 0.25), plus `fatigue` (each working week adds 0.1 + spent/max; recovery x (1 − 0.1 x fatigue), floor 0.4; auto-rest at a 35% cut; a week off clears it). Staff job energy raised (madame 26, promoter/maid 28–30, attendant 22, security/bartender 30, dancer 32, bath 24, teacher 30, chapel 20, host 26). Dwarves `energyRec` 1.25 → 1.4 and `fatigue` 0.4. Androids recharge what they used every working week (fee per energy). Spirits `workRec` 36 → 30.
Result (bot): courtesans and staff now take a week off every ~6–10 weeks (dwarves rarely); cycle-1 win 28 → ~34 weeks (fatigue off: 30, fatigue 0.12/auto-rest 0.4: 39). Resting earlier is more efficient than grinding (a rest week recovers bed x 1.6).

## Current tuning highlights (`balance.json` / `economy.json`)
- **Queue, security & crowding (`clients.wait`, `clients.crowd`, `clients.host`):** overflow clients wait instead of vanishing immediately (`waitBuf` from door, hosts, bar, stage); Wits-based security screens client value/traits (`screenMerchant`, `screenNoble`, `screenTrimLow`, `screenSafe`) and Charm/Charisma caps excess overflow cleanly; `crowd.perSpace` (5) caps comfortable capacity before satisfaction/bail/rep penalties.
- **House class & popularity (`prestige`):** house `rep` is **House Popularity**; `h.prestige` (`0–100`) tracks **House Class** toward a structural target (tier, beds, decor, drinks, price, amenities, tidiness, attendants, leadership) plus operational shifts. Low prestige favors demand and propositions; high prestige attracts merchants/nobles and raises quality/amenity expectations.
- **NG+ & Cycle-1 debt (`debt`, `ngplus`):** Cycle 1 uses `13` payments every `4` weeks (`ramp: 8`); NG+ trims up to 1 payment / 0.75 ramp per cycle (`minPayments: 11`, `minRamp: 4`) and adds `debtShare: 0.9`, `perCycle: 0.35`, `keptHouseShare: 0.25`, `perLover: 0` (was 0.08 until 2026-11-16), `loverDebt: 1500` (`perKeptHouse: 0`).
- **Tidiness & Promoters (`tidy`, `jobs`):** `tidy.high: 80`, `low: 50`, `bad: 30`, `maidEase: 35`, `maidMax: 1.5`; promoters draw `2 + (Charisma + Hospitality)/15` (`promoterLowRep: 0.4`, `promoterStack: 0.6`, `promoterRep: 0.03`), and free samples shift `h.prestige` vs the promoter's polish.

## Historical baseline: Pass 2 (2026-11-11, pre-queue/prestige/debt overhaul)

Snapshot comparison from `tools/lab` on the 2026-11-11 tuning (security `endNight` + on-the-spot Sam rescue, diminishing maid tidiness, promoter low-rep boost, `8 + Technique×0.08` skill training, `debt.ngplus.fewer/flatter: 0`):

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

Sam's spare action over cycle 1 (`sam-actions-campaign`, Δ weeks vs bartending at 33): stat class +0.5, skill class +0.7, books +1, scouting/napping +1.8, dates +2, stat coaching +2.5, rounds +3, skill training +3.4, service practice +4.2, demonstrations +4.4.
What a stat point was worth (`stat-value`): +5 to every stat on every lady ≈ +220/wk mid; Beauty and Stamina ≈ 2.5g/wk per point, Charm ~1.2.

### Open questions to re-check after recent changes
1. **Support jobs vs courtesan slot:** stacking multiple support ladies beyond the first maid/promoter/host/attendant still trades away courtesan slot revenue (`jobs-all`, `roles-comp`).
2. **House and NG+ balance:** re-benchmark all 15 standard/NG+ houses (`houses-all`, `ngplus-houses`, `ngpp`) after the Cycle-1 / NG+ debt and `prestige` changes.
3. **Race & amenity balance:** re-check `races`, `amenities`, `sanctuary-chapel`, and `demon-sigil` under the current queue/prestige rules.

### Nights & Sam's focus (2026-11-17, campaign, 10-12 seeds)
The week now runs as six nights plus a rest day: per-night client caps (`nights`: 1 + Stamina/50, demons +1), sleep after every night (`rest.night`), the rest day (`rest.restDay`) instead of `rest.work/workFree`, Health wear per night (`rest.wear.nightBase/nightPerSpent`). Sam's bar/watch/books/classes moved from actions to a weekly focus (`focus`).
Cycle-1 win on main (after the energy rework) was ~53 weeks at 12 seeds (win rate 0.9). With nights: rest.night 0.25 / restDay 0.5 → 26 weeks; 0.10 / 0.30 → 45; 0.13 / 0.40 with perStamina 50 → **36 weeks, win rate 1.0** (chosen; close to the ~34 the energy rework aimed for). Courtesans serve ~7 clients a week (main: ~4.7).

### Adventurers' Guild (2026-11-17, not yet measured)
- New: guild contracts (`data/guild/base.json`), the bot's guild player (`tools/lab/bot.js`, on by default) and `tools/lab/exp/guild.json`. Business no longer adds passive income and Strength no longer adds passive security, so earlier income numbers shift (mostly at Sam's house).
- To tune: contract `gold` vs what the same ladies earn at home (a contract should pay a bit more than a week of support-staff work, less than a good courtesan's week, plus rank/items/outfits), `work`/`weeks` (most contracts finishable by 1-2 average early ladies, hunts/delves/wyverns need a real party), `risk`/`hurt` (injuries should sting but not bench people for long), `levels` merit pacing (Silver mid cycle 1, Gold late, Mithril maybe NG+), and fame's client draw.

### Round 2 changes after the first guild lab run (2026-11-17, not yet measured)
Results of the first run: `temp-balance-results.md`. Changes:
- Guild pay: purse + day rate per member per week worked (about a support lady's week, under a courtesan's), plus up to ~+75% for fitting traits/titles/Sam perks, finishing early and overshooting; the ladies' shares count as their earnings. Goal: contracts net positive vs. keeping her home on support work.
- Ladies earn more (`income.escort` 1.25 → 1.4), upkeep is up (`houses.upkeepMult` 1.25) so the Office focus matters more. Business stays without passive income; if Office still trails Classes/Floor after this, give Office some income back.
- Classes focus 2.5 → 2.0; NG+ `loverDebt` 1500 → 1200.
- Promoters only fill spare capacity (`jobs.promoterCapUse`, `promoterOverflow`): the first run showed a promoter losing money and popularity because her extra clients were turned away (samples were off).
- New night incidents (`incidents`): without security a house now loses some gold, tidiness, satisfaction and popularity each week, so Watch and the security job have something to stop.
- Group nights and demonstrations are flavor; don't tune them for pace (drop them from `sam-actions-balanced` or loosen its band).
Rerun: `c1-baseline` (expect ~36-40 weeks again), `guild.json`, `sam-focus`, `security-value`, `promoter-value`, `ngplus-carry`.

### Round 3 (2026-11-17, not yet measured)
Round 2 results: `temp-balance-results.md` (cycle 1 back to 36.9 weeks; guild neutral on pace but −580/wk late; Floor fastest, Classes slow; NG+ lovers now −18 weeks and 0-2 lovers rarely win).
- Guild: `minPower` per contract (members under it add much less), delve/wyvern 5 slots and more work, day rates x (1 + 0.08 x rank), board leans toward Sam's rank. NG+ keeps rank and merit (first NG++ resets once). Bot only sends ladies who earned at most 1.25x the day rate (`guildEarnCap`).
- Floor `nights` 4 → 3.4; Classes 2.0 → 2.2; NG+ `debtShare` 0.9 → 0.8 and `loverDebt` 1200 → 1700.
- Promoter and security checks now compare the lady working vs. the same lady idle (`mutate job rest` vs `promoter`/`security`): she should earn about a wage (Δtotal > 40). The security check counts night incidents too (`trouble` = unhandled pushy + unhandled incidents; also `incidents`, `incHandled`, `damage`). Incident frequency unchanged on purpose.
- Walks: `walk.partnerByFound` [14, 0.6, 0.6] (first partner in a walk or two, later ones ~10 walks each with pity 0.15 up to 8), coin weight 1 → 0.7, flavor 1.8 → 2.4, seven new flavor/rest events.
Rerun: `check.mjs`, `guild.json`, `sam-focus`, `ngplus-carry`, `sam-actions-campaign`.
- Walks (revised): `walk.partnerOdds` [0.3, 0.1, 0.05] = chance per walk by partners already found this cycle, hard cap `partnerCycleMax` 3 (15 partners over five cycles leaves someone to pick every cycle); NG++ always `ngppPartnerOdds` 0.3, no cap. Measure with `tools/lab/exp/walk-partners.json` (`partners` column).

### Round 4 (2026-11-17, not yet measured)
Round 3 results: `temp-balance-results.md` (7 PASS · 5 FAIL · 2 WARN). What the failures turned out to be:
- **`promoter-pays` 0 ± 0 was a lab bug:** the check runs in the `early` scenario, where the house has only its resident and the partner, and `mutate.job` only picked generics, so nobody was moved. New `mutate.jobFill` fills up with other non-partner ladies (the resident first); the check uses it.
- **`demons-top-courtesans`:** `perLady` ignored androids' charging fees and skipped rest weeks (androids never rest, so they looked better per week). It now subtracts `recharge` and counts every lady-week. Demons were already #2 by a hair mid (46.0 vs rabbits 47.2); recheck before touching demons.
- **Nerys is the big outlier (found in a tooling run, 3 seeds):** as a partner she earns 3-5k a week from week 1 (Kaede: 350-600) and the cycle is cleared in ~12-15 weeks. Demon night cap +1 and half-cost services, Exhibitionist (serves without a room), Eager, lewd 82 from the start: she serves 15-18 clients a week, all at top-tier services. This is very likely also why `walk` is −6.6 weeks in `sam-actions-balanced` (walks find her). **Changed:** Nerys starts without Exhibitionist and at lewd 65 (was 82), and has `cutFloor: 0.3`: she keeps at least the cycle's baseline cut + 30% of her earnings (50% in cycle 1, rising with `wardrobe.cut.perCycle`) until she's Devoted (`cutFloor()` in `character.js`, shown on her sheet). She stays the easy-mode partner, just not a debt-clearing machine. `tools/lab/exp/nerys.json` compares her against Kaede (the old variants patch back the old numbers for reference).
- **Bot finds partners now:** `policy.walkPartners` (default on): one walk a week in cycle 1 / NG+ while this cycle's walk partners aren't all found (phase experiments turn it off for the measured weeks). Before, the bot only walked in NG++, so cycle-1 numbers had no walk partners at all. Expect faster cycle 1 (and Nerys swings) until her fix lands.
- **Guild net −180 mid / −670 late was mostly the bot:** it judged a lady by last week's earnings only, so a top courtesan coming off a rest week (earned 0) got sent out, and it would pull a house's only maid/security. Now `gEarn` = best of her last 4 working weeks, and `policy.guildSpare` keeps the madame and any house's only maid/security/attendant/promoter/host home.
- **NG+ ratio 0.93:** `ngplus.debtShare` 0.8 → 0.9 (round 2 had 0.9 with ratio 1.47, but lover debt was 1200 then, 1700 now).
- **Office still trails** (+1.9 wks, −122 late): Office now lifts every reached house's takings by `officeMul()` = `focus.office.incomeBase` 0.03 + `perBusiness` 0.0005 x Business (max `incomeMax` 0.12; ≈ +5.75% at Business 55), shown as "Office (the books)" in the report ledger.
- **Overwork mood:** `mood.overworkAt` 4 → 8. It was tuned for ~4.7 clients a week; with the six-night week courtesans serve ~7, so every courtesan was "overworked" every week (−7.5 mood, Lazy −15). Energy is the real brake now.
- `cheap-houses-pay-off-faster` (+7.5) and `ngpp-harder-still` (+35 wks): no cause found from the summary alone. `houses-all` now prints guild/partner columns and `ngpp` has no-guild variants; please paste the full tables next time.

### Trait / perk / boon audit (2026-11-17)
- Fixed: **Encore Favorite** could never be earned (nothing counted `encore`; `services.js` now does). **Iron Ledger** described Tend Bar / Do the Books (now Office/Floor focus). **Eager Student** mentioned the madame's coaching (removed). **Exhibitionist**, **Shy** and **Wellspring** descriptions now match what they do. NG+ boon **Friends at the Guild** renamed **Friends in Town** (it's about candidates, not the Adventurers' Guild).
- **Health:** the existing `fatigue` fx (Health wear from work nights and guild contracts) is now on traits: Hardy 0.85, Iron Stamina 0.8 (lost its max energy, so it's no longer a copy of Tough), Effortless 0.9, Unyielding Frame 0.8, Delicate 1.15.
- **Uniqueness pass** (no two traits share the exact same effect set any more, except opposites like Sensitive/Guarded and NG+ perks that are bigger versions of a common trait): Old Flame (lust floor instead of willingness), Borrowed Memories (learn), Supple (cheaper doggy/cowgirl), Poised & Polished (+rep), Confidante (mood, not trust: she's already at 90), Close Companion (willingness), Tireless (recovery), Pitch Perfect (regulars), Town Crier (rep), Unflappable (mood losses + security), Practiced Kisses (propositions), Quiet Grace (rep), Crowd Favorite (tips), Practiced Charmer (encore), House Proud (mood), House Sister (mood losses), Steady Hostess (rep), Life of the Lounge (propositions), Hollowmere Star (regulars).
- Demonstrations do teach: the lady gets the private-time service growth and +1 lewdness, every watcher near Sam gets service skill (Sam's Technique x `lessons.demo.watchSkill`), lust and lewdness (modest ones lose a little mood instead). They're "flavor" only for pacing, so Exhibitionist via 3 demos stays.
- Open: Exhibitionist's no-room serving still stacks hard with demons (generic demons rarely start that lewd, so it's mostly a Nerys problem, now gone from her start).
