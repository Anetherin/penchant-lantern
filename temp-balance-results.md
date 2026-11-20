# Balance Audit Results — Round 5 (`2026-11-20`)

- **Branch:** `test/balance-round-5` (cut from `balance/angels-amber-cheap-houses`, commit `cdbdaba`, PR #76)
- **Comparison baseline:** Round-4 audit on `test/balance-audit-2026-11-20` (`8b7ca10`)
- **Date:** `2026-11-20`
- **Environment & runner:** `12` logical cores (`nproc`), Node `v24.12.0`; single-cycle experiments and intent checks ran at `--conc 10`; multi-cycle NG+/NG++ specs (`ngplus-houses-scaling`, `ngplus-lovers-stacking` skipping `0 lovers`, `ngplus-carry`, `ngplus-cycles`, `ngpp`) ran at `--conc 3`.
- **Total experiment runtime:** `6,945s` (~115.8 min cumulative across 26 specs)
- **Changes measured:** House capacity by class (`classCapMul`: `×1.5` at class 0 → `×0.75` at 100), restless ladies' off-the-books clients (`2–4` at half fee `0.5`, costing class above 50 with angels immune), amber incense (`-15%` energy, `+15%` recovery, `-5%` fee), and drifter guests returning reborn (`rebirthNamed`).

---

## Data Check & Smoke

- `npm run check:data`: `OK: 50 scripts, 28 data sets`
- `npm run smoke`: `index.html: reached week 31, 3 workers, 71873g. no errors`
- `node tools/goddess-smoke.mjs`: `index.html: reached week 189, 1 workers, 3713g. no errors`

---

## Intent Checks (`tools/lab/out/checks.md`)

`2026-11-20T21:15 · full` — **PASS** 8 · **FAIL** 2 · **WARN** 4 *(Note: `npm run check` was not run in Round 4 `8b7ca10`, so all 14 rows are fresh baselines for Round 5.)*

### PASS (8)
- **cycle1-winnable** (`c1-baseline`): `winRate: base ≥ 0.95` = `1.00`; `weeksToWin: base in [20,45]` = `29.9`; `missed: base ≤ 0.2` = `0.00`.
- **tidiness-penalty-below-30** (`tidiness`): `Δ total: mid · tidy 25 vs mid · base < -10%` = `-272 ± 96.7`; `Δ total: late · tidy 25 vs late · base < -10%` = `-467 ± 161`; `Δtotal: [mid · tidy 25] − Δ[mid · tidy 45] < 0` = `-92.4`.
- **demons-top-courtesans (soft)** (`races-mixed`): `perLady: mid · demon in top 1 of 6` = `#1 (76.1; #1 mid · demon 76.1)`; `perLady: late · demon in top 1 of 6` = `#1 (152; #1 late · demon 152)`.
- **demons-poor-off-service (soft)** (`race-jobs`): `Δtotal: [demon · promoter] − Δ[human · promoter] < 0` = `-171`; `Δtotal: [demon · bartender] − Δ[human · bartender] < 0` = `-122`; `Δtotal: [demon · host] − Δ[human · host] < 0` = `-225`; `Δtotal: [demon · security] − Δ[human · security] < 0` = `-123`.
- **ngplus-a-bit-harder** (`ngplus-carry`): `ngRatio: base in [1,1.5]` = `1.26`; `winRate: base/1/2/3/5 ≥ 0.85` = `0.92 / 0.96 / 0.92 / 0.96 / 1.00`; `winRate: 0 ≥ 0.75` = `0.92`.
- **ngplus-lovers-neutral** (`ngplus-carry`): `ngWeeks: [3] − [1] |x| ≤ 5` = `-0.04`; `ngWeeks: [5] − [1] |x| ≤ 5` = `-2.25`.
- **cheap-houses-pay-off-faster (soft)** (`houses-all`): `weeksToWin: [lantern, onsen, hollow, tankard, wayfarer] − [castle, pavilion, veil, sanctuary, atelier] < 0` = `-0.53`.
- **premium-houses-earn-more-later** (`houses-plateau`): `net: [castle, pavilion, veil, sanctuary, atelier] − [lantern, onsen, hollow, tankard, wayfarer] > 0` = `5,774`.

### FAIL (2)
- **tidiness-neutral-70** (`tidiness`): `Δ total: mid · tidy 60 vs mid · base |Δ| ≤ 5%` = `0.97 ± 1.90 (0.15% of 653)` (PASS); `Δ total: late · tidy 60 vs late · base |Δ| ≤ 5%` = **`114 ± 144 (7.06% of 1,615)`** (**FAIL**).
- **sam-actions-balanced** (`sam-actions-campaign`): `scout` `1.94 ± 3.54`, `rounds` `0.69 ± 2.89`, `date` `0.06 ± 2.92`, `walk` `1.13 ± 4.35`, `rest` `0.00 ± 0.00`, `trainStat` `-0.44 ± 4.35`, `trainSkill` `1.63 ± 3.53` (all PASS); **`trainService`** = **`5.50 ± 10.1`** (**FAIL**).

### WARN (4)
- **promoter-pays** (`promoter-value`): `Δ total: lantern` `+128 ± 57.7` (PASS), `hollow` `+327 ± 74.3` (PASS); `Δ repGain: lantern` `+2.36 ± 3.39` (PASS), **`hollow`** = **`-1.26 ± 5.18`** (**WARN**).
- **security-stops-incidents** (`security-value`): `Δ trouble: mid` `-0.40 ± 0.11` (PASS), `late` `-0.90 ± 0.18` (PASS); **`Δ total: mid`** = **`-36.5 ± 133`** (**WARN**), `late` `+156 ± 125` (PASS).
- **ngplus-slow-climb (soft)** (`ngplus-cycles`): `c5weeks: all ≥ @c2weeks` = `51.9` (PASS); **`c5weeks: home ≥ @c2weeks`** = **`42.8`** (**WARN**); **`c5over: all ≤ 0.1`** = **`0.25`** (**WARN**); **`c5over: home ≤ 0.1`** = **`0.11`** (**WARN**).
- **ngpp-harder-still (soft)** (`ngpp`): `c2weeks: [ng++ (shrine)] − [ng+ (wayfarer)] > 0` = `38.7` (PASS); **`< 15`** = **`38.7`** (**WARN**).

---

## Round 5 Shifts vs. Round 4 (`8b7ca10`)

### 1. Houses & Class (`houses-all-cf`, `houses-plateau-cf`, `house-class-compete`, `house-class-plateau`, `interactions`)
- **Cycle-1 payoff (`houses-all-cf`):**
  - **Onsen** improved sharply from `45` wks (`0.8` winRate, `0.2` over) in Round 4 to **`33` wks (`1.0` winRate, `0.0` over)** (`houseNet 1,163 -> 1,378`, `served 15 -> 19`).
  - **Veil** sped up (`27 -> 25` wks, `houseNet 4,034 -> 4,781`), **Lantern** (`31 -> 29` wks, `1,264 -> 1,389`), **Hollow** (`38 -> 37` wks, `0.9` winRate), **Tankard** (`33 -> 34` wks, `729 -> 772`), **Wayfarer** (`32 -> 34` wks, `1,578 -> 1,529`).
  - High-class houses slowed from capacity scaling: **Castle** (`30 -> 33` wks, `5,105 -> 4,547`), **Atelier** (`29 -> 35` wks, `5,133 -> 4,278`), **Pavilion** (`36 -> 39` wks, `3,170 -> 2,717`, `0.9` winRate), **Sanctuary** (`32 -> 38` wks, `2,495 -> 2,252`, `0.9` winRate).
- **Post-debt plateau (`houses-plateau-cf`):**
  - **Tankard** `houseNet` rose `2,815 -> 3,203` (`served 30 -> 33`, `turned 22 -> 17`), while **Atelier** (`12,015 -> 8,392`), **Sanctuary** (`9,063 -> 7,104`), **Pavilion** (`11,500 -> 9,501`), and **Hollow** (`7,286 -> 5,332`) came down cleanly.
  - **Castle** stayed essentially unchanged (`14,083 -> 14,368`, `served 35 -> 31`, `prestige 99 -> 92`), leaving the Tankard-to-Castle plateau gap at `4.49×` (`3,203` vs `14,368`, vs `5.00×` / `2,815` vs `14,083` in Round 4).
- **`upscale` vs. `exhib-volume` (`house-class-compete`, `house-class-plateau`):**
  - In `house-class-compete`, `exhib-2` and `exhib-volume` beat `upscale` in **Veil** (`mid`: `5,928` / `5,443` vs `3,655`; `late`: `8,166` / `7,851` vs `7,723`), whereas `upscale` still beats `exhib-volume` in Tankard, Lantern, Pavilion, Sanctuary, and Castle.
  - At **plateau** (`house-class-plateau`), `upscale` still beats `exhib-volume` in all 4 houses (`tankard 5,667 vs 4,263`; `veil 21,080 vs 17,647`; `lantern 9,457 vs 4,756`; `castle 30,564 vs 17,760`).

### 2. Races (`race-courtesan-phases`, `race-bedless-compare`, `race-roles-phases`, `race-roles-houses`)
- **Courtesans (`race-courtesan-phases`):** Demons kept #1 `testedNet` across every phase and house tier (`early4 · tankard` `103` vs `23` base; `mid · lantern` `435` vs `157`; `late · lantern` `720` vs `205`; `late · castle` `346` vs `197`), with `0.0–0.8%` `testedRest`.
- **Support Angels (`race-roles-phases`, `race-roles-houses`):**
  - Plain `angel` flipped to a significant `houseNet` win in `castle-mid · madame` (`+432.8 ± 427.5` vs `-634.0` in Round 4), kept `host · early4` (`+119.8 ± 86.2`, `sat +4.6 ± 2.0`, `repGain +7.0 ± 5.8`), and gained `chapel · late` (`testedNet +24.2 ± 7.9`, `repGain +10.3 ± 4.9`; `Sanctuary` `+26.0 ± 10.9` mid / `+47.2 ± 10.7` late).
  - Plain `angel` still does not beat humans/beastkin/dwarves on `houseNet` across `maid`, `promoter`, `security`, `bartender`, `attendant` (`-161.6 ± 132.3` late), or `teacher` (`skillGain -1.4 ± 0.9`), and `angel/lantern` still leads plain `angel` in `onsen-mid · bath` (`+148.5 ± 80.6`) and `sanctuary` `chapel` `testedNet` (`+45.4` / `+67.1` vs `+26.0` / `+47.2`).

### 3. Incense (`incense-phases`, `incense-niches`, `incense-campaign`)
- **`amber` swung from net-negative in Round 4 to strongly positive across niches, mid/late phases, and campaigns:**
  - **`incense-niches`:** Now wins both straw-cot niches significantly (`tankard-straw +245.3 ± 46.4` `houseNet`, `restPct -6.7 ± 1.9%`; `spirit-courtesans +114.7 ± 77.6` `houseNet`, `restPct -6.5 ± 2.5%`) and `classroom-24w` (`+390.9 ± 241.5`, `skillGain +4.5 ± 2.6`), and stops losing in `veil-nosec` (`+195.8 ± 1,453`) and `beastkin-160` (`+203.5 ± 210.6`, vs `-178.6 ± 108.0` in Round 4).
  - **`incense-phases`:** Significant `houseNet` wins in `early4 · tankard` (`+161.1 ± 87.3`), `early4 · lantern` (`+213.0 ± 96.0`), `mid · tankard` (`+437.1 ± 316.9`), `mid · lantern` (`+256.3 ± 117.7`), `mid · castle` (`+633.3 ± 363.7`, vs `-1,079` in Round 4), `mid · conservatory` (`+605.6 ± 327.9`, vs `-871.4`), `late · tankard` (`+347.6 ± 237.0`), `late · lantern` (`+385.3 ± 236.6`), and `late · conservatory` (`+464.0 ± 345.0`, vs `-803.8`), while `mid/late · veil` neutralized (`-157.4` / `-79.8` vs `-986.7` / `-1,047`). Only `early4 · veil` (`-247.0 ± 212.7`) and `early4 · castle` (`-181.9 ± 150.9`) stayed slightly negative.
  - **`incense-campaign`:** `tankard · amber` (`-4.9 ± 4.5` wks, `cfHE +86.0 ± 78.3`), `lantern · amber` (`-4.8 ± 3.6` wks), and `castle · amber` (`30` wks, `1.0` winRate, `-7.5 ± 12.5` wks vs `51` wks / `+19.6 ± 19.3` in Round 4).

### 4. NG+ Spot Check (`ngplus-houses-scaling`, `ngplus-lovers-stacking` skipping `0 lovers`)
- **`ngplus-houses-scaling`:** Castle C2 `cfHE` and `hNet` came down (`base` `3,312 -> 2,611` `c2cfHE`, `7,857 -> 6,294` `c2hNet`, `c2weeks 40 -> 48`), while Tankard and Lantern stayed close to Round 4 (`home only` remains `-10.5`/`-15.2` C2 wks with `0.0` fails; `1x`/`2x` kept houses escalate C3–C4 to `c4over 0.3–1.0`).
- **`ngplus-lovers-stacking` (`base`, `2x`, `3x`, `4x`):** Retains the Round-4 class polarity—punishing on `tankard` C4 (`4x` `+23.6 ± 23.2` wks, `-1,818 ± 1,303` `c4hNet`), helpful on `lantern` (`3x` `c4over -0.4 ± 0.4`, `4x` `c2hNet +431.9 ± 348.8`), and strongly beneficial on `castle` (`2x–3x` C3 `-33.3`/`-33.1` wks, `4x` `c4over -0.7 ± 0.7`).

---

## Anomalies & `unreached` Runs

- **Runtime errors:** `0` `Errors` and `0` `pageErrors` across all 26 reports.
- **`unreached` runs:** `houses-plateau-cf` (`onsen 2`, `castle 1`, `pavilion 1`, `atelier 1`), `house-class-compete` (`castle · late 1`), `house-class-plateau` (`castle 1`), `incense-phases` (`late · castle 1`), `race-courtesan-phases` (`late · castle 1`; plus walk-partner roster fills leaving `testedNet ⁿ11` in `early4 · tankard` and `ⁿ10` in `early4 · castle`), `race-roles-houses` (`castle-late · host 1`), `houses-plateau` (`onsen 2`, `castle 1`, `pavilion 1`, `atelier 1`), `ngplus-houses-scaling` (`tankard 1`, `castle 1` in Cycle 1), and `ngplus-lovers-stacking` (`tankard 1`, `castle 1` in Cycle 1).

---

## Full Experiment Reports (Verbatim Tables)

### Balance intent checks

2026-11-20T21:15 · full
**PASS** 8 · **FAIL** 2 · **WARN** 4


#### PASS · cycle1-winnable

A sensible player clears the cycle-1 debt without game overs, well inside the 52-week schedule but not trivially fast.

experiment `c1-baseline` (reused)

| result | check | value |
|---|---|---|
| PASS | winRate: base ≥ 0.95 | 1.00 |
| PASS | weeksToWin: base in [20,45] | 29.9 |
| PASS | missed: base ≤ 0.2 | 0.00 |

#### FAIL · tidiness-neutral-70

Tidiness is neutral around 70: holding it at 60 changes little.

experiment `tidiness` (reused)

| result | check | value |
|---|---|---|
| PASS | Δ total: mid · tidy 60 vs mid · base |Δ| ≤ 5% | 0.97 ± 1.90 (0.15% of 653) |
| FAIL | Δ total: late · tidy 60 vs late · base |Δ| ≤ 5% | 114 ± 144 (7.06% of 1,615) |

#### PASS · tidiness-penalty-below-30

Below 30 tidiness there is a noticeable penalty (at least 10% of weekly takings), worse than at 45.

experiment `tidiness` (reused)

| result | check | value |
|---|---|---|
| PASS | Δ total: mid · tidy 25 vs mid · base < -10% | -272 ± 96.7 |
| PASS | Δ total: late · tidy 25 vs late · base < -10% | -467 ± 161 |
| PASS | Δtotal: [mid · tidy 25] − Δ[mid · tidy 45] < 0 | -92.4 |

#### WARN · promoter-pays

A promoter fills empty rooms: in a house with idle rooms (early, Lantern / Hollow), one lady promoting instead of sitting idle brings in more than her keep (about a wage). The popularity part is soft: a house that starts well known (Hollow) grows its name more slowly with a crowd, which is fine (2026-11-17).

experiment `promoter-value` (reused)

| result | check | value |
|---|---|---|
| PASS | Δ total: lantern · +promoter vs lantern · base > 40 | 128 ± 57.7 |
| PASS | Δ total: hollow · +promoter vs hollow · base > 40 | 327 ± 74.3 |
| PASS | Δ repGain: lantern · +promoter vs lantern · base > 0 | 2.36 ± 3.39 |
| WARN | Δ repGain: hollow · +promoter vs hollow · base > 0 | -1.26 ± 5.18 |

#### WARN · security-stops-incidents

Security is a support job that earns her keep: one lady on security instead of sitting idle clearly cuts unhandled trouble (pushy clients + night incidents) and pays back about a wage in what she saves.

experiment `security-value` (reused)

| result | check | value |
|---|---|---|
| PASS | Δ trouble: mid · +security vs mid · base < 0 | -0.40 ± 0.11 |
| PASS | Δ trouble: late · +security vs late · base < 0 | -0.90 ± 0.18 |
| WARN | Δ total: mid · +security vs mid · base > 40 | -36.5 ± 133 |
| PASS | Δ total: late · +security vs late · base > 40 | 156 ± 125 |

#### PASS · demons-top-courtesans (soft)

Demons are meant to be the strongest courtesans. Measured in a mixed house (races-mixed: two ladies of the race among the usual staff), since rare races turn up one or two at a time; all-race houses (races-courtesan) mix in house-level effects and come out within noise late. Soft: an aim, not a rule.

experiment `races-mixed` (reused)

| result | check | value |
|---|---|---|
| PASS | perLady: mid · demon in top 1 of 6 | #1 (76.1; #1 mid · demon 76.1) |
| PASS | perLady: late · demon in top 1 of 6 | #1 (152; #1 late · demon 152) |

#### PASS · demons-poor-off-service (soft)

...but risky where services are rare: moving demons into promoter/bartender/host/security costs more than it does for humans. Soft since 2026-11-17: each race's Δ is taken against that race's own default house, and an all-demon house starts lower than an all-human one, so this comparison flips with small changes. Read it with the racejob breakdown (per-lady earnings by race and job).

experiment `race-jobs` (reused)

| result | check | value |
|---|---|---|
| PASS | Δtotal: [demon · promoter] − Δ[human · promoter] < 0 | -171 |
| PASS | Δtotal: [demon · bartender] − Δ[human · bartender] < 0 | -122 |
| PASS | Δtotal: [demon · host] − Δ[human · host] < 0 | -225 |
| PASS | Δtotal: [demon · security] − Δ[human · security] < 0 | -123 |

#### FAIL · sam-actions-balanced

Sam's spare rest-day actions (except group nights and demonstrations, which are flavor) are roughly balanced: none clears the cycle-1 debt more than ~3 weeks faster or slower than the first one listed. Every variant also takes one partner walk a week (bot walkPartners), so 'walk' measures walking with all spare AP.

experiment `sam-actions-campaign` (reused)

| result | check | value |
|---|---|---|
| PASS | Δ weeksToWin: scout vs base |x| ≤ 3 | 1.94 ± 3.54 |
| PASS | Δ weeksToWin: rounds vs base |x| ≤ 3 | 0.69 ± 2.89 |
| PASS | Δ weeksToWin: date vs base |x| ≤ 3 | 0.06 ± 2.92 |
| PASS | Δ weeksToWin: walk vs base |x| ≤ 3 | 1.13 ± 4.35 |
| PASS | Δ weeksToWin: rest vs base |x| ≤ 3 | 0.00 ± 0.00 |
| PASS | Δ weeksToWin: trainStat vs base |x| ≤ 3 | -0.44 ± 4.35 |
| PASS | Δ weeksToWin: trainSkill vs base |x| ≤ 3 | 1.63 ± 3.53 |
| FAIL | Δ weeksToWin: trainService vs base |x| ≤ 3 | 5.50 ± 10.1 |

#### PASS · ngplus-a-bit-harder

NG+ is harder than cycle 1 (a bit longer is fine): cycle 2 takes 1.0-1.5x as long, with few game overs when lovers come along (≥ 85% wins). Carrying no lovers is meant to be hard (about 3 in 4 wins is fine).

experiment `ngplus-carry` (reused)

| result | check | value |
|---|---|---|
| PASS | ngRatio: base in [1,1.5] | 1.26 |
| PASS | winRate: base ≥ 0.85 | 0.92 |
| PASS | winRate: 1 ≥ 0.85 | 0.96 |
| PASS | winRate: 2 ≥ 0.85 | 0.92 |
| PASS | winRate: 3 ≥ 0.85 | 0.96 |
| PASS | winRate: 5 ≥ 0.85 | 1.00 |
| PASS | winRate: 0 ≥ 0.75 | 0.92 |

#### PASS · ngplus-lovers-neutral

Carrying lovers into NG+ is roughly neutral: one, three or five lovers clear the cycle within ~5 weeks of each other (an NG+ cycle is ~40 weeks; per-seed spread is ±10), so there's no need to grind walks for more.

experiment `ngplus-carry` (reused)

| result | check | value |
|---|---|---|
| PASS | ngWeeks: [3] − [1] |x| ≤ 5 | -0.04 |
| PASS | ngWeeks: [5] − [1] |x| ≤ 5 | -2.25 |

#### WARN · ngplus-slow-climb (soft)

Over several NG+ cycles difficulty rises slowly (later cycles at least as long as cycle 2), without game overs.

experiment `ngplus-cycles` (reused)

| result | check | value |
|---|---|---|
| PASS | c5weeks: all ≥ @c2weeks | 51.9 |
| WARN | c5weeks: home ≥ @c2weeks | 42.8 |
| WARN | c5over: all ≤ 0.1 | 0.25 |
| WARN | c5over: home ≤ 0.1 | 0.11 |

#### WARN · ngpp-harder-still (soft)

NG++ (Lantern Shrine) is harder still than standard NG+, but not by dragging on.

experiment `ngpp` (reused)

| result | check | value |
|---|---|---|
| PASS | c2weeks: [ng++ (shrine)] − [ng+ (wayfarer)] > 0 | 38.7 |
| WARN | c2weeks: [ng++ (shrine)] − [ng+ (wayfarer)] < 15 | 38.7 |

#### PASS · cheap-houses-pay-off-faster (soft)

Starter houses clear the debt faster than premium ones, or at least about as fast (soft: roughly even is fine).

experiment `houses-all` (reused)

| result | check | value |
|---|---|---|
| PASS | weeksToWin: [lantern, onsen, hollow, tankard, wayfarer] − [castle, pavilion, veil, sanctuary, atelier] < 0 | -0.53 |

#### PASS · premium-houses-earn-more-later

...but premium houses earn more once built up (post-debt plateau).

experiment `houses-plateau` (reused)

| result | check | value |
|---|---|---|
| PASS | net: [castle, pavilion, veil, sanctuary, atelier] − [lantern, onsen, hollow, tankard, wayfarer] > 0 | 5,774 |

---

### houses-all-cf

All 10 Cycle-1 houses played from week 1 with early/mid/late fixed-window cashflow (wk 1-8, 9-20, 21+), propositions, and prestige.

scenario **campaign** · 12 seeds from 1 · 88s · 2026-11-20T19:42

| variant | n | weeksToWin | winRate | cfE | cfM | cfL | cfHE | cfHM | cfHL | houseNet | guild | worth13 | worth20 | prestige | served | props | sat | over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| lantern | 12 | 29 | 1.0 | 643 | 1,435 | 2,593 | 602 | 1,290 | 2,327 | 1,389 | 151 | -23,311 | -11,996 | 45 | 24 | 3.7 | 67 | 0.0 |
| onsen | 12 | 33 | 1.0 | 790 | 1,243 | 2,510 | 745 | 1,074 | 2,223 | 1,378 | 175 | -29,008 | -19,887 | 42 | 19 | 3.5 | 72 | 0.0 |
| hollow | 12 | 37 | 0.9 | 459 | 1,847 | 4,539ⁿ11 | 404 | 1,591 | 4,128ⁿ11 | 2,018 | 245 | -43,035ⁿ11 | -29,600ⁿ11 | 56 | 20 | 3.3 | 75 | 0.1 |
| tankard | 12 | 34 | 1.0 | 565 | 730 | 1,287 | 529 | 591 | 1,060 | 772 | 146 | -16,090 | -11,324 | 17 | 21 | 3.6 | 64 | 0.0 |
| wayfarer | 12 | 34 | 1.0 | 848 | 1,435 | 2,990 | 780 | 1,239 | 2,707 | 1,529 | 205 | -30,647 | -19,889 | 44 | 23 | 3.7 | 71 | 0.0 |
| castle | 12 | 33 | 1.0 | 882 | 3,531 | 8,749 | 847 | 3,300 | 8,216 | 4,547 | 300 | -100,012 | -78,697 | 92 | 19 | 3.9 | 75 | 0.0 |
| pavilion | 12 | 39 | 0.9 | 1,056 | 2,312 | 4,905 | 1,011 | 2,167 | 4,602 | 2,717 | 175 | -64,725 | -46,592 | 79 | 20 | 4.2 | 68 | 0.1 |
| veil | 12 | 25 | 1.0 | 2,396 | 5,926 | 7,020ⁿ7 | 2,287 | 5,624 | 6,628ⁿ7 | 4,781 | 260 | -50,708 | -8,187 | 25 | 24 | 4.8 | 80 | 0.0 |
| sanctuary | 12 | 38 | 0.9 | 961 | 1,925 | 4,331 | 939 | 1,723 | 3,944 | 2,252 | 203 | -53,463 | -36,721 | 84 | 18 | 2.9 | 72 | 0.1 |
| atelier | 12 | 35 | 1.0 | 2,012 | 4,472 | 7,941 | 1,938 | 4,150 | 7,432 | 4,278 | 335 | -90,331 | -54,782 | 72 | 24 | 4.2 | 75 | 0.0 |

Paired Δ vs **lantern** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| onsen | +3.6 ± 4.5 | +36.6 ± 257.7 | -329.7 ± 415.1 | **-7,891 ± 5,087** | +0.0 ± 0.0 |
| hollow | +7.8 ± 12.3 | **+689.9 ± 348.7** | **+2,110 ± 392.7** | **-17,596 ± 5,511** | +0.1 ± 0.2 |
| tankard | +4.4 ± 5.1 | -44.8 ± 352.5 | **-1,006 ± 325.6** | +672.1 ± 4,959 | +0.0 ± 0.0 |
| wayfarer | +4.3 ± 5.2 | +189.0 ± 248.5 | +158.1 ± 620.9 | **-7,893 ± 7,438** | +0.0 ± 0.0 |
| castle | **+3.3 ± 3.3** | **+2,586 ± 339.3** | **+6,797 ± 979.4** | **-66,701 ± 7,323** | +0.0 ± 0.0 |
| pavilion | +10.0 ± 11.8 | **+764.6 ± 258.8** | **+2,239 ± 766.4** | **-34,596 ± 11,034** | +0.1 ± 0.2 |
| veil | -4.6 ± 5.7 | **+2,320 ± 706.8** | **+4,561 ± 1,232** | +3,809 ± 20,354 | +0.0 ± 0.0 |
| sanctuary | +8.6 ± 12.7 | **+548.7 ± 343.1** | **+1,594 ± 907.1** | **-24,725 ± 11,365** | +0.1 ± 0.2 |
| atelier | +5.5 ± 6.6 | **+1,961 ± 415.0** | **+3,642 ± 1,585** | **-42,786 ± 19,755** | +0.0 ± 0.0 |

---

### houses-plateau-cf

Post-debt plateau (26 weeks) across all 10 Cycle-1 houses: revenue, upkeep, cuts, propositions, and class.

scenario **plateau** · 12 seeds from 1 · 177s · 2026-11-20T19:45

| variant | n | houseNet | total | net | houseInc | guild | wages | upkeep | cuts | perLady | served | turned | props | sat | prestige | staff |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| lantern | 12 | 3,926 | 4,407 | 4,353 | 6,362 | 427 | 607 | 483 | 1,347 | 267 | 28 | 25 | 6.3 | 81 | 68 | 12 |
| onsen | 10 (+2 unreached) | 3,886 | 4,211 | 4,211 | 6,011 | 325 | 468 | 446 | 1,211 | 256 | 27 | 15 | 4.3 | 82 | 66 | 9.3 |
| hollow | 12 | 5,332 | 5,911 | 5,911 | 8,711 | 579 | 801 | 614 | 1,965 | 349 | 33 | 16 | 11 | 75 | 69 | 16 |
| tankard | 12 | 3,203 | 3,600 | 3,600 | 4,627 | 397 | 489 | 364 | 571 | 169 | 33 | 17 | 5.6 | 73 | 34 | 9.9 |
| wayfarer | 12 | 3,826 | 4,265 | 4,265 | 5,899 | 439 | 523 | 486 | 1,064 | 339 | 33 | 10 | 5.5 | 80 | 66 | 11 |
| castle | 11 (+1 unreached) | 14,368 | 15,173 | 15,173 | 19,869 | 805 | 933 | 910 | 3,657 | 323 | 31 | 9.4 | 8.4 | 82 | 92 | 19 |
| pavilion | 11 (+1 unreached) | 9,501 | 10,219 | 9,911 | 14,675 | 410 | 669 | 620 | 3,884 | 391 | 27 | 19 | 6.5 | 88 | 95 | 12 |
| veil | 12 | 8,717 | 9,340 | 9,340 | 11,460 | 622 | 751 | 395 | 1,597 | 125 | 33 | 18 | 7.2 | 82 | 49 | 17 |
| sanctuary | 12 | 7,104 | 7,454 | 7,454 | 11,018 | 350 | 533 | 589 | 2,791 | 457 | 29 | 13 | 4.7 | 88 | 96 | 10 |
| atelier | 11 (+1 unreached) | 8,392 | 9,033 | 9,033 | 11,310 | 641 | 842 | 692 | 1,289 | 316 | 30 | 18 | 6.4 | 82 | 89 | 16 |

---

### house-class-compete

Low-class vs high-class houses in mid and late game: default vs cheap volume, 2 exhibitionists, exhibitionism + volume, and upscale luxury.

scenario **mid** · 12 seeds from 1 · 224s · 2026-11-20T19:49

| variant | n | houseNet | total | net | houseInc | upkeep | perLady | served | turned | props | exhibActs | crowdOver | sat | prestige | repGain | trouble |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| tankard · mid · base | 12 | 567 | 567 | 567 | 1,054 | 106 | 11 | 15 | 2.3 | 2.2 | 1.2 | 0.0 | 63 | 17 | 6.6 | 0.9 |
| tankard · mid · cheap-volume | 12 | 497 | 497 | 497 | 1,047 | 114 | 1.8 | 16 | 4.8 | 1.3 | 0.9 | 0.1 | 68 | 19 | 9.3 | 1.0 |
| tankard · mid · exhib-2 | 12 | 661 | 661 | 661 | 1,259 | 113 | 23 | 16 | 2.4 | 2.2 | 8.8 | 0.0 | 64 | 8.9 | 11 | 1.0 |
| tankard · mid · exhib-volume | 12 | 712 | 712 | 712 | 1,256 | 133 | 16 | 16 | 2.9 | 3.4 | 7.7 | 0.0 | 64 | 17 | 8.6 | 1.2 |
| tankard · mid · upscale | 12 | 874 | 874 | 874 | 1,505 | 149 | 29 | 12 | 0.9 | 2.5 | 1.6 | 0.1 | 68 | 38 | 19 | 1.0 |
| tankard · late · base | 12 | 1,297 | 1,300 | 1,300 | 2,230 | 145 | 72 | 26 | 4.9 | 4.2 | 1.8 | 0.0 | 62 | 14 | 11 | 0.5 |
| tankard · late · cheap-volume | 12 | 1,301 | 1,304 | 1,304 | 2,103 | 150 | 46 | 28 | 12 | 4.4 | 2.6 | 0.8 | 67 | 19 | 20 | 0.4 |
| tankard · late · exhib-2 | 12 | 1,504 | 1,506 | 1,506 | 2,493 | 149 | 79 | 29 | 5.3 | 4.0 | 13 | 0.1 | 65 | 5.7 | 15 | 0.4 |
| tankard · late · exhib-volume | 12 | 1,617 | 1,620 | 1,620 | 2,461 | 162 | 99 | 28 | 5.9 | 5.9 | 12 | 0.1 | 61 | 14 | 15 | 0.5 |
| tankard · late · upscale | 12 | 1,829 | 1,832 | 1,832 | 2,762 | 169 | 99 | 21 | 2.5 | 4.3 | 2.2 | 0.1 | 64 | 33 | 17 | 0.5 |
| veil · mid · base | 12 | 4,827 | 4,832 | 4,832 | 6,602 | 240 | -5.0 | 26 | 2.8 | 5.1 | 1.2 | 0.0 | 78 | 26 | 12 | 1.5 |
| veil · mid · cheap-volume | 12 | 3,098 | 3,103 | 3,103 | 4,572 | 240 | 1.7 | 27 | 4.8 | 5.4 | 1.3 | 0.0 | 78 | 30 | 15 | 1.6 |
| veil · mid · exhib-2 | 12 | 5,928 | 5,933 | 5,933 | 7,881 | 245 | 1.7 | 31 | 1.9 | 6.4 | 24 | 0.0 | 79 | 16 | 18 | 1.7 |
| veil · mid · exhib-volume | 12 | 5,443 | 5,448 | 5,448 | 7,389 | 258 | 20 | 31 | 1.2 | 7.6 | 24 | 0.0 | 76 | 24 | 14 | 1.7 |
| veil · mid · upscale | 12 | 3,655 | 3,660 | 3,660 | 5,222 | 262 | 9.7 | 14 | 1.6 | 5.4 | 1.3 | 0.0 | 73 | 46 | 4.9 | 1.3 |
| veil · late · base | 12 | 6,230 | 6,247 | 6,247 | 8,194 | 239 | 13 | 30 | 5.8 | 7.2 | 3.0 | 0.0 | 77 | 26 | 18 | 0.6 |
| veil · late · cheap-volume | 12 | 3,667 | 3,683 | 3,683 | 5,239 | 243 | 12 | 32 | 12 | 7.5 | 3.1 | 0.1 | 78 | 31 | 20 | 0.6 |
| veil · late · exhib-2 | 12 | 8,166 | 8,185 | 8,185 | 10,585 | 250 | 21 | 38 | 2.7 | 8.6 | 26 | 0.0 | 78 | 18 | 21 | 0.7 |
| veil · late · exhib-volume | 12 | 7,851 | 7,869 | 7,869 | 10,321 | 268 | 32 | 40 | 2.3 | 8.6 | 26 | 0.0 | 77 | 28 | 22 | 1.0 |
| veil · late · upscale | 12 | 7,723 | 7,742 | 7,742 | 10,245 | 270 | 21 | 25 | 3.3 | 6.9 | 2.5 | 0.0 | 80 | 46 | 20 | 0.4 |
| lantern · mid · base | 12 | 557 | 789 | 557 | 1,181 | 209 | 52 | 16 | 1.7 | 2.8 | 1.6 | 0.0 | 62 | 49 | 6.7 | 0.9 |
| lantern · mid · cheap-volume | 12 | 345 | 550 | 345 | 912 | 208 | 48 | 19 | 2.6 | 2.4 | 2.3 | 0.1 | 65 | 43 | 17 | 0.9 |
| lantern · mid · exhib-2 | 12 | 670 | 855 | 670 | 1,285 | 199 | 50 | 17 | 2.0 | 3.0 | 7.4 | 0.0 | 65 | 41 | 12 | 0.9 |
| lantern · mid · exhib-volume | 12 | 710 | 951 | 710 | 1,424 | 246 | 85 | 19 | 1.6 | 3.7 | 8.6 | 0.0 | 62 | 45 | 18 | 0.8 |
| lantern · mid · upscale | 12 | 983 | 1,284 | 983 | 1,864 | 304 | 110 | 16 | 1.3 | 3.4 | 1.5 | 0.0 | 64 | 71 | 17 | 0.7 |
| lantern · late · base | 12 | 1,756 | 2,013 | 1,767 | 3,045 | 285 | 108 | 27 | 6.2 | 4.6 | 3.3 | 0.3 | 66 | 47 | 17 | 0.4 |
| lantern · late · cheap-volume | 12 | 1,109 | 1,311 | 1,119 | 2,223 | 284 | 81 | 28 | 11 | 5.3 | 3.4 | 2.1 | 70 | 45 | 14 | 0.5 |
| lantern · late · exhib-2 | 12 | 1,844 | 2,046 | 1,855 | 3,149 | 272 | 97 | 30 | 5.7 | 5.3 | 13 | 0.2 | 66 | 38 | 20 | 0.3 |
| lantern · late · exhib-volume | 12 | 1,973 | 2,202 | 1,983 | 3,436 | 303 | 121 | 29 | 6.9 | 6.1 | 11 | 0.3 | 65 | 43 | 21 | 0.2 |
| lantern · late · upscale | 12 | 2,977 | 3,183 | 2,988 | 4,628 | 318 | 150 | 25 | 4.9 | 4.1 | 2.9 | 0.3 | 70 | 68 | 24 | 0.3 |
| pavilion · mid · base | 12 | 2,095 | 2,139 | 2,100 | 3,531 | 218 | 36 | 16 | 3.5 | 3.9 | 0.6 | 0.0 | 70 | 78 | 14 | 0.7 |
| pavilion · mid · cheap-volume | 12 | 1,129 | 1,152 | 1,135 | 2,135 | 219 | 21 | 11 | 6.2 | 4.6 | 0.1 | 0.3 | 65 | 72 | 5.5 | 1.0 |
| pavilion · mid · exhib-2 | 12 | 2,289 | 2,327 | 2,294 | 3,785 | 224 | 39 | 18 | 2.7 | 4.4 | 8.8 | 0.2 | 67 | 71 | 14 | 0.9 |
| pavilion · mid · exhib-volume | 12 | 1,940 | 1,981 | 1,946 | 3,305 | 241 | 49 | 14 | 2.9 | 6.1 | 8.5 | 0.3 | 63 | 68 | 12 | 1.0 |
| pavilion · mid · upscale | 12 | 2,524 | 2,567 | 2,530 | 4,016 | 251 | 74 | 11 | 4.2 | 4.7 | 0.5 | 0.1 | 64 | 93 | 8.1 | 0.7 |
| pavilion · late · base | 12 | 4,246 | 4,522 | 4,259 | 6,527 | 362 | 94 | 26 | 6.9 | 4.5 | 1.0 | 1.1 | 73 | 82 | 16 | 0.3 |
| pavilion · late · cheap-volume | 12 | 2,914 | 3,211 | 2,926 | 4,800 | 384 | 93 | 29 | 13 | 5.2 | 1.3 | 3.2 | 74 | 74 | 15 | 0.3 |
| pavilion · late · exhib-2 | 12 | 4,889 | 5,169 | 4,902 | 7,555 | 374 | 125 | 33 | 4.1 | 5.3 | 14 | 1.2 | 71 | 69 | 21 | 0.3 |
| pavilion · late · exhib-volume | 12 | 4,979 | 5,288 | 4,992 | 7,870 | 410 | 154 | 33 | 4.8 | 7.2 | 15 | 1.2 | 70 | 66 | 23 | 0.5 |
| pavilion · late · upscale | 12 | 6,308 | 6,627 | 6,320 | 9,223 | 425 | 155 | 26 | 5.5 | 5.0 | 0.8 | 1.7 | 75 | 95 | 21 | 0.3 |
| sanctuary · mid · base | 12 | 2,025 | 2,032 | 2,032 | 3,179 | 206 | 41 | 16 | 2.3 | 4.0 | 0.7 | 0.0 | 70 | 81 | 19 | 0.5 |
| sanctuary · mid · cheap-volume | 12 | 1,233 | 1,241 | 1,241 | 2,066 | 213 | 34 | 14 | 3.8 | 3.4 | 0.1 | 0.1 | 73 | 78 | 14 | 0.6 |
| sanctuary · mid · exhib-2 | 12 | 2,170 | 2,178 | 2,178 | 3,332 | 206 | 54 | 18 | 1.9 | 3.4 | 9.6 | 0.0 | 70 | 72 | 20 | 0.6 |
| sanctuary · mid · exhib-volume | 12 | 1,829 | 1,837 | 1,837 | 2,962 | 234 | 53 | 15 | 2.6 | 4.9 | 10 | 0.0 | 68 | 71 | 15 | 0.6 |
| sanctuary · mid · upscale | 12 | 2,194 | 2,202 | 2,202 | 3,039 | 255 | 61ⁿ11 | 13 | 2.6 | 4.3 | 0.2 | 0.0 | 69 | 95 | 18 | 0.5 |
| sanctuary · late · base | 12 | 3,938 | 3,944 | 3,944 | 6,194 | 263 | 113 | 25 | 3.1 | 4.1 | 0.7 | 0.1 | 76 | 82 | 13 | 0.4 |
| sanctuary · late · cheap-volume | 12 | 2,973 | 2,979 | 2,979 | 4,762 | 270 | 109 | 27 | 6.4 | 4.1 | 0.4 | 1.6 | 77 | 78 | 13 | 0.5 |
| sanctuary · late · exhib-2 | 12 | 4,718 | 4,724 | 4,724 | 7,404 | 268 | 128 | 30 | 1.9 | 4.0 | 15 | 0.1 | 76 | 72 | 21 | 0.5 |
| sanctuary · late · exhib-volume | 12 | 4,359 | 4,365 | 4,365 | 7,032 | 280 | 144 | 28 | 4.1 | 5.1 | 14 | 0.2 | 72 | 72 | 17 | 0.4 |
| sanctuary · late · upscale | 12 | 5,705 | 5,711 | 5,711 | 8,605 | 287 | 164 | 24 | 3.0 | 4.2 | 0.3 | 0.2 | 78 | 95 | 17 | 0.3 |
| castle · mid · base | 12 | 3,133 | 3,141 | 3,141 | 4,599 | 245 | 30 | 16 | 1.0 | 2.4 | 0.5 | 0.0 | 75 | 90 | 23 | 0.4 |
| castle · mid · cheap-volume | 12 | 1,906 | 1,914 | 1,914 | 2,722 | 225 | 9.8 | 15 | 1.8 | 2.1 | 0.4 | 0.0 | 75 | 80 | 13 | 0.5 |
| castle · mid · exhib-2 | 12 | 3,374 | 3,382 | 3,382 | 4,846 | 266 | 40 | 19 | 0.6 | 2.5 | 9.0 | 0.0 | 73 | 81 | 25 | 0.4 |
| castle · mid · exhib-volume | 12 | 3,747 | 3,755 | 3,755 | 5,106 | 298 | 74 | 20 | 0.5 | 4.2 | 9.9 | 0.0 | 69 | 75 | 24 | 0.5 |
| castle · mid · upscale | 12 | 4,475 | 4,483 | 4,483 | 6,073 | 325 | 59 | 15 | 0.5 | 3.2 | 1.4 | 0.0 | 73 | 95 | 17 | 0.5 |
| castle · late · base | 11 (+1 unreached) | 9,473 | 9,484 | 9,484 | 13,348 | 417 | 81 | 26 | 5.1 | 7.0 | 3.1 | 0.0 | 77 | 93 | 11 | 0.1 |
| castle · late · cheap-volume | 11 (+1 unreached) | 6,330 | 6,341 | 6,341 | 9,303 | 432 | 77 | 31 | 7.9 | 7.1 | 3.7 | 0.0 | 75 | 81 | 13 | 0.1 |
| castle · late · exhib-2 | 11 (+1 unreached) | 10,565 | 10,576 | 10,576 | 14,768 | 417 | 132 | 33 | 0.9 | 9.0 | 16 | 0.0 | 74 | 82 | 13 | 0.1 |
| castle · late · exhib-volume | 11 (+1 unreached) | 10,278 | 10,288 | 10,288 | 14,320 | 436 | 149 | 35 | 1.3 | 10 | 16 | 0.0 | 71 | 72 | 13 | 0.1 |
| castle · late · upscale | 11 (+1 unreached) | 12,681 | 12,692 | 12,692 | 17,303 | 448 | 119 | 25 | 3.3 | 7.3 | 2.7 | 0.0 | 79 | 95 | 11 | 0.1 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ net | Δ served | Δ props | Δ exhibActs | Δ prestige | Δ sat |
|---|---|---|---|---|---|---|---|
| tankard · mid · cheap-volume | -69.9 ± 185.7 | -69.9 ± 185.7 | +0.9 ± 3.3 | **-0.8 ± 0.6** | **-0.2 ± 0.2** | **+2.8 ± 2.7** | **+5.3 ± 2.8** |
| tankard · mid · exhib-2 | +93.9 ± 324.7 | +93.9 ± 324.7 | +0.3 ± 3.1 | +0.1 ± 0.8 | **+7.6 ± 4.0** | **-7.6 ± 3.7** | +1.9 ± 4.6 |
| tankard · mid · exhib-volume | **+144.9 ± 89.8** | **+144.9 ± 89.8** | +0.5 ± 2.5 | **+1.2 ± 1.1** | **+6.5 ± 2.3** | +0.4 ± 3.0 | +2.0 ± 3.3 |
| tankard · mid · upscale | **+307.2 ± 261.8** | **+307.2 ± 261.8** | **-3.0 ± 2.9** | +0.3 ± 0.6 | +0.4 ± 0.9 | **+21.7 ± 3.5** | +5.0 ± 5.0 |
| tankard · late · cheap-volume | +4.2 ± 188.2 | +4.2 ± 188.2 | **+2.0 ± 1.4** | +0.2 ± 0.6 | **+0.8 ± 0.7** | **+4.6 ± 3.4** | **+4.9 ± 2.3** |
| tankard · late · exhib-2 | +206.9 ± 232.4 | +206.9 ± 232.4 | **+2.5 ± 1.6** | -0.2 ± 0.8 | **+11.4 ± 4.0** | **-8.7 ± 2.8** | +2.6 ± 2.8 |
| tankard · late · exhib-volume | +320.2 ± 403.5 | +320.2 ± 403.5 | +1.6 ± 2.7 | +1.7 ± 1.8 | **+9.8 ± 2.4** | -0.5 ± 3.2 | -0.7 ± 5.6 |
| tankard · late · upscale | **+532.1 ± 181.8** | **+532.2 ± 181.8** | **-4.6 ± 2.5** | +0.1 ± 0.9 | +0.4 ± 0.6 | **+19.0 ± 3.4** | +1.7 ± 3.5 |
| veil · mid · cheap-volume | **-1,729 ± 1,705** | **-1,729 ± 1,705** | +1.0 ± 5.2 | +0.3 ± 1.6 | +0.0 ± 0.7 | +3.2 ± 5.4 | +0.2 ± 10.6 |
| veil · mid · exhib-2 | +1,102 ± 1,594 | +1,102 ± 1,594 | **+5.5 ± 3.4** | +1.3 ± 1.3 | **+22.7 ± 4.3** | **-10.2 ± 4.5** | +1.6 ± 7.2 |
| veil · mid · exhib-volume | +616.7 ± 1,824 | +616.7 ± 1,824 | +5.2 ± 5.8 | **+2.5 ± 1.6** | **+23.2 ± 5.0** | -2.8 ± 4.0 | -1.9 ± 8.6 |
| veil · mid · upscale | -1,171 ± 1,196 | -1,171 ± 1,196 | **-11.7 ± 3.3** | +0.3 ± 1.5 | +0.1 ± 0.7 | **+19.5 ± 3.4** | -5.1 ± 8.1 |
| veil · late · cheap-volume | **-2,563 ± 1,111** | **-2,563 ± 1,111** | **+2.0 ± 1.5** | +0.3 ± 1.1 | +0.1 ± 0.3 | **+5.0 ± 2.1** | +0.8 ± 5.4 |
| veil · late · exhib-2 | **+1,936 ± 827.5** | **+1,938 ± 829.1** | **+8.0 ± 3.3** | **+1.4 ± 0.8** | **+22.7 ± 6.2** | **-8.1 ± 3.6** | +1.3 ± 1.6 |
| veil · late · exhib-volume | **+1,621 ± 717.4** | **+1,622 ± 717.9** | **+10.7 ± 3.7** | **+1.4 ± 0.3** | **+23.0 ± 6.6** | +2.6 ± 2.7 | -0.4 ± 2.1 |
| veil · late · upscale | **+1,492 ± 538.2** | **+1,496 ± 541.0** | **-5.2 ± 1.7** | -0.3 ± 0.6 | **-0.6 ± 0.6** | **+19.9 ± 1.5** | **+2.9 ± 1.9** |
| lantern · mid · cheap-volume | **-212.9 ± 164.2** | **-212.9 ± 164.2** | **+3.7 ± 3.7** | -0.4 ± 0.7 | +0.7 ± 2.1 | **-5.7 ± 5.6** | +3.0 ± 3.7 |
| lantern · mid · exhib-2 | +112.4 ± 117.9 | +112.4 ± 117.9 | +1.1 ± 2.4 | +0.2 ± 0.6 | **+5.8 ± 1.7** | **-8.0 ± 4.7** | +2.7 ± 3.7 |
| lantern · mid · exhib-volume | +152.1 ± 250.0 | +152.1 ± 250.0 | +3.4 ± 3.7 | **+0.9 ± 0.8** | **+7.0 ± 2.0** | -3.5 ± 5.8 | -0.1 ± 5.0 |
| lantern · mid · upscale | **+425.6 ± 234.2** | **+425.6 ± 234.2** | +0.7 ± 3.5 | +0.6 ± 0.8 | -0.1 ± 1.1 | **+21.8 ± 4.3** | +1.5 ± 3.3 |
| lantern · late · cheap-volume | **-647.1 ± 256.2** | **-647.9 ± 257.2** | +1.2 ± 1.4 | **+0.7 ± 0.5** | +0.1 ± 0.5 | -1.9 ± 2.7 | **+4.5 ± 2.4** |
| lantern · late · exhib-2 | +87.4 ± 279.7 | +87.9 ± 278.9 | +2.6 ± 3.1 | +0.7 ± 1.0 | **+9.7 ± 3.8** | **-9.2 ± 3.0** | +0.3 ± 2.0 |
| lantern · late · exhib-volume | +216.4 ± 310.0 | +216.0 ± 310.1 | +1.8 ± 3.3 | **+1.4 ± 0.7** | **+7.8 ± 3.2** | **-3.9 ± 3.0** | -0.3 ± 2.2 |
| lantern · late · upscale | **+1,220 ± 328.8** | **+1,221 ± 328.3** | -1.7 ± 1.8 | -0.5 ± 0.6 | -0.4 ± 1.3 | **+20.7 ± 2.5** | **+4.3 ± 3.0** |
| pavilion · mid · cheap-volume | **-965.6 ± 462.8** | **-965.6 ± 462.8** | **-4.3 ± 3.6** | **+0.8 ± 0.7** | -0.5 ± 0.7 | **-6.2 ± 6.1** | -4.3 ± 7.3 |
| pavilion · mid · exhib-2 | +193.9 ± 357.7 | +193.8 ± 357.6 | +2.2 ± 3.2 | +0.5 ± 0.8 | **+8.1 ± 3.5** | **-7.9 ± 5.1** | -2.7 ± 4.4 |
| pavilion · mid · exhib-volume | -154.2 ± 605.8 | -154.1 ± 605.8 | -1.6 ± 4.6 | **+2.3 ± 1.0** | **+7.9 ± 3.5** | **-10.9 ± 3.2** | -6.7 ± 7.3 |
| pavilion · mid · upscale | +429.5 ± 772.8 | +429.5 ± 772.8 | **-4.8 ± 3.7** | **+0.9 ± 0.7** | -0.1 ± 0.7 | **+14.6 ± 4.4** | -6.0 ± 6.9 |
| pavilion · late · cheap-volume | **-1,332 ± 333.3** | **-1,332 ± 333.3** | **+2.6 ± 1.5** | +0.7 ± 0.9 | +0.3 ± 0.4 | **-7.2 ± 2.7** | +1.0 ± 3.1 |
| pavilion · late · exhib-2 | **+643.4 ± 626.8** | **+643.4 ± 626.8** | **+6.2 ± 3.5** | **+0.8 ± 0.6** | **+13.5 ± 3.2** | **-12.7 ± 3.8** | -1.7 ± 3.9 |
| pavilion · late · exhib-volume | +732.8 ± 820.7 | +732.8 ± 820.8 | **+7.1 ± 3.9** | **+2.7 ± 1.2** | **+14.5 ± 3.5** | **-15.7 ± 5.1** | -2.6 ± 3.4 |
| pavilion · late · upscale | **+2,062 ± 569.6** | **+2,061 ± 569.3** | -0.3 ± 1.7 | +0.5 ± 1.1 | -0.2 ± 0.2 | **+13.6 ± 4.7** | +1.7 ± 3.7 |
| sanctuary · mid · cheap-volume | **-791.4 ± 653.7** | **-791.4 ± 653.7** | -2.0 ± 3.4 | **-0.7 ± 0.6** | -0.6 ± 1.0 | -3.5 ± 5.1 | +2.9 ± 5.7 |
| sanctuary · mid · exhib-2 | +145.5 ± 407.4 | +145.5 ± 407.4 | +1.9 ± 2.2 | **-0.6 ± 0.4** | **+8.9 ± 2.6** | **-9.4 ± 2.4** | -0.3 ± 4.6 |
| sanctuary · mid · exhib-volume | -195.3 ± 602.3 | -195.3 ± 602.3 | -1.2 ± 3.1 | **+0.9 ± 0.7** | **+9.5 ± 2.1** | **-10.5 ± 4.2** | -2.6 ± 6.2 |
| sanctuary · mid · upscale | +169.2 ± 770.5 | +169.4 ± 770.6 | -3.8 ± 4.0 | +0.3 ± 0.7 | -0.5 ± 0.6 | **+13.4 ± 2.6** | -0.8 ± 6.9 |
| sanctuary · late · cheap-volume | **-965.4 ± 317.6** | **-965.4 ± 317.6** | **+1.9 ± 1.5** | -0.0 ± 0.5 | -0.3 ± 0.7 | -4.0 ± 5.5 | +1.4 ± 2.6 |
| sanctuary · late · exhib-2 | **+779.9 ± 346.0** | **+779.8 ± 346.0** | **+4.6 ± 2.0** | -0.1 ± 0.5 | **+14.3 ± 2.9** | **-11.0 ± 3.4** | +0.7 ± 2.3 |
| sanctuary · late · exhib-volume | +420.6 ± 659.4 | +420.6 ± 659.5 | +3.0 ± 3.5 | **+0.9 ± 0.7** | **+13.2 ± 3.5** | **-10.1 ± 2.9** | **-3.1 ± 2.9** |
| sanctuary · late · upscale | **+1,766 ± 603.0** | **+1,766 ± 603.2** | -1.5 ± 1.6 | +0.1 ± 0.6 | -0.4 ± 0.6 | **+12.3 ± 3.1** | **+2.7 ± 1.6** |
| castle · mid · cheap-volume | **-1,227 ± 758.7** | **-1,227 ± 758.7** | -1.0 ± 2.2 | -0.3 ± 1.0 | -0.2 ± 0.3 | **-9.9 ± 4.7** | -0.5 ± 4.5 |
| castle · mid · exhib-2 | +241.9 ± 813.5 | +241.3 ± 813.6 | **+3.2 ± 2.0** | +0.1 ± 0.7 | **+8.5 ± 1.1** | **-8.6 ± 3.7** | -2.4 ± 6.7 |
| castle · mid · exhib-volume | +614.5 ± 1,003 | +614.5 ± 1,003 | **+3.8 ± 2.9** | **+1.7 ± 0.9** | **+9.4 ± 1.4** | **-14.6 ± 4.5** | **-6.0 ± 5.0** |
| castle · mid · upscale | +1,342 ± 1,483 | +1,342 ± 1,483 | -1.3 ± 3.9 | +0.8 ± 0.9 | **+0.9 ± 0.5** | **+4.9 ± 4.1** | -2.4 ± 6.6 |
| castle · late · cheap-volume | **-3,143 ± 795.0** | **-3,143 ± 795.4** | **+4.8 ± 1.3** | +0.1 ± 1.0 | **+0.7 ± 0.7** | **-11.9 ± 3.9** | -1.6 ± 2.7 |
| castle · late · exhib-2 | **+1,092 ± 926.7** | **+1,092 ± 926.7** | **+6.7 ± 2.7** | **+2.0 ± 0.8** | **+13.1 ± 1.8** | **-10.7 ± 3.5** | **-2.9 ± 2.2** |
| castle · late · exhib-volume | +804.5 ± 1,216 | +804.0 ± 1,216 | **+9.2 ± 3.2** | **+3.2 ± 0.8** | **+13.3 ± 2.6** | **-20.8 ± 5.8** | **-6.5 ± 4.1** |
| castle · late · upscale | **+3,208 ± 847.7** | **+3,208 ± 847.5** | -0.8 ± 1.1 | +0.3 ± 0.6 | -0.3 ± 0.5 | **+1.9 ± 1.8** | +1.6 ± 2.0 |

---

### house-class-plateau

Post-debt plateau (20 weeks): can built-up low-class houses compete with high-class houses via volume, propositions, and exhibitionism?

scenario **plateau** · 12 seeds from 1 · 160s · 2026-11-20T19:52

| variant | n | houseNet | total | net | houseInc | upkeep | perLady | served | turned | props | exhibActs | crowdOver | sat | prestige | repGain | trouble |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| tankard · base | 12 | 3,579 | 3,581 | 3,581 | 4,809 | 178 | 152 | 31 | 16 | 5.2 | 3.3 | 2.0 | 73 | 37 | 12 | 0.1 |
| tankard · cheap-volume | 12 | 2,955 | 2,957 | 2,957 | 3,987 | 179 | 85 | 32 | 28 | 5.0 | 3.1 | 3.1 | 78 | 34 | 12 | 0.2 |
| tankard · exhib-2 | 12 | 4,001 | 4,002 | 4,002 | 5,181 | 182 | 203 | 36 | 16 | 6.6 | 15 | 1.6 | 72 | 25 | 12 | 0.2 |
| tankard · exhib-volume | 12 | 4,263 | 4,265 | 4,265 | 5,574 | 200 | 199 | 37 | 17 | 7.6 | 15 | 2.4 | 72 | 26 | 10 | 0.3 |
| tankard · upscale | 12 | 5,667 | 5,669 | 5,669 | 7,609 | 205 | 241 | 24 | 3.3 | 5.1 | 2.7 | 0.2 | 69 | 48 | 22 | 0.3 |
| veil · base | 12 | 9,707 | 9,710 | 9,710 | 12,264 | 255 | 66 | 27 | 22 | 7.8 | 3.3 | 1.1 | 86 | 57 | 16 | 0.2 |
| veil · cheap-volume | 12 | 5,965 | 5,968 | 5,968 | 7,957 | 240 | 38 | 28 | 37 | 8.6 | 3.6 | 2.3 | 88 | 48 | 11 | 0.3 |
| veil · exhib-2 | 12 | 17,498 | 17,501 | 17,501 | 21,187 | 263 | 117 | 47 | 8.8 | 11 | 28 | 1.2 | 86 | 41 | 19 | 0.2 |
| veil · exhib-volume | 12 | 17,647 | 17,651 | 17,651 | 21,144 | 267 | 118 | 47 | 11 | 12 | 28 | 1.7 | 86 | 42 | 17 | 0.3 |
| veil · upscale | 12 | 21,080 | 21,083 | 21,083 | 25,082 | 268 | 103 | 23 | 9.1 | 8.1 | 2.7 | 0.1 | 87 | 65 | 20 | 0.2 |
| lantern · base | 12 | 4,181 | 4,374 | 4,181 | 6,210 | 318 | 207 | 24 | 31 | 6.7 | 3.9 | 3.6 | 82 | 69 | 3.7 | 0.2 |
| lantern · cheap-volume | 12 | 2,638 | 2,830 | 2,638 | 4,334 | 297 | 148 | 25 | 39 | 6.8 | 3.5 | 6.4 | 85 | 62 | -6.6 | 0.2 |
| lantern · exhib-2 | 12 | 4,884 | 5,077 | 4,884 | 7,212 | 315 | 298 | 33 | 23 | 8.4 | 14 | 3.3 | 78 | 55 | 7.2 | 0.1 |
| lantern · exhib-volume | 12 | 4,756 | 4,949 | 4,756 | 7,027 | 333 | 300 | 33 | 23 | 9.5 | 15 | 3.9 | 77 | 52 | 2.8 | 0.2 |
| lantern · upscale | 12 | 9,457 | 9,651 | 9,457 | 12,594 | 368 | 466 | 23 | 11 | 6.2 | 3.2 | 0.8 | 80 | 84 | 16 | 0.2 |
| castle · base | 11 (+1 unreached) | 15,762 | 15,780 | 15,780 | 20,738 | 497 | 188 | 26 | 15 | 9.0 | 3.9 | 0.0 | 86 | 94 | 8.1 | 0.1 |
| castle · cheap-volume | 11 (+1 unreached) | 10,426 | 10,445 | 10,445 | 14,328 | 486 | 159 | 29 | 21 | 9.7 | 4.8 | 1.0 | 85 | 82 | 5.6 | 0.2 |
| castle · exhib-2 | 11 (+1 unreached) | 20,000 | 20,018 | 20,018 | 26,404 | 507 | 365 | 38 | 4.3 | 12 | 18 | 0.1 | 81 | 83 | 12 | 0.1 |
| castle · exhib-volume | 11 (+1 unreached) | 17,760 | 17,778 | 17,778 | 23,948 | 511 | 340 | 39 | 6.3 | 14 | 19 | 0.0 | 79 | 71 | 10 | 0.1 |
| castle · upscale | 11 (+1 unreached) | 30,564 | 30,582 | 30,582 | 38,833 | 527 | 271 | 22 | 4.9 | 9.2 | 2.9 | 0.0 | 90 | 96 | 14 | 0.1 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ net | Δ served | Δ props | Δ exhibActs | Δ prestige | Δ sat |
|---|---|---|---|---|---|---|---|
| tankard · cheap-volume | **-624.3 ± 213.9** | **-624.3 ± 213.9** | +1.2 ± 1.2 | -0.2 ± 0.3 | -0.1 ± 0.5 | **-3.1 ± 2.5** | **+5.2 ± 1.4** |
| tankard · exhib-2 | **+421.5 ± 227.3** | **+421.5 ± 227.3** | **+4.9 ± 4.0** | +1.3 ± 1.4 | **+11.8 ± 2.9** | **-12.9 ± 5.9** | -0.7 ± 2.6 |
| tankard · exhib-volume | **+683.9 ± 385.4** | **+683.9 ± 385.4** | **+5.5 ± 3.6** | **+2.3 ± 1.3** | **+12.0 ± 3.2** | **-11.3 ± 5.5** | -0.4 ± 3.5 |
| tankard · upscale | **+2,088 ± 677.7** | **+2,088 ± 677.7** | **-7.2 ± 2.5** | -0.2 ± 1.0 | -0.6 ± 0.7 | **+10.5 ± 2.6** | -3.4 ± 3.9 |
| veil · cheap-volume | **-3,742 ± 1,171** | **-3,742 ± 1,171** | +0.4 ± 1.1 | **+0.8 ± 0.7** | **+0.3 ± 0.3** | **-9.0 ± 3.9** | +1.2 ± 1.4 |
| veil · exhib-2 | **+7,791 ± 2,693** | **+7,791 ± 2,693** | **+19.8 ± 4.9** | **+2.9 ± 1.3** | **+24.6 ± 6.2** | **-15.4 ± 6.5** | -0.5 ± 1.1 |
| veil · exhib-volume | **+7,941 ± 2,697** | **+7,941 ± 2,697** | **+19.4 ± 5.0** | **+4.2 ± 0.9** | **+24.5 ± 5.6** | **-14.9 ± 6.2** | -0.8 ± 1.5 |
| veil · upscale | **+11,373 ± 2,493** | **+11,373 ± 2,493** | **-4.5 ± 1.2** | +0.3 ± 0.6 | -0.6 ± 0.8 | **+8.8 ± 3.0** | +0.7 ± 1.3 |
| lantern · cheap-volume | **-1,543 ± 396.7** | **-1,543 ± 396.7** | +0.7 ± 1.4 | +0.1 ± 0.3 | **-0.3 ± 0.3** | **-7.0 ± 2.3** | **+3.5 ± 1.3** |
| lantern · exhib-2 | **+703.3 ± 507.9** | **+703.3 ± 507.9** | **+8.5 ± 4.3** | **+1.7 ± 0.6** | **+10.5 ± 3.0** | **-14.3 ± 7.6** | **-3.6 ± 2.2** |
| lantern · exhib-volume | +574.9 ± 590.3 | +574.9 ± 590.3 | **+8.3 ± 3.7** | **+2.8 ± 1.2** | **+10.9 ± 3.9** | **-17.0 ± 7.2** | **-4.8 ± 3.1** |
| lantern · upscale | **+5,276 ± 991.3** | **+5,276 ± 991.3** | -1.8 ± 2.7 | -0.5 ± 0.7 | -0.7 ± 0.7 | **+14.7 ± 2.9** | **-1.9 ± 1.6** |
| castle · cheap-volume | **-5,336 ± 1,181** | **-5,336 ± 1,181** | **+3.5 ± 1.2** | +0.7 ± 0.8 | +1.0 ± 1.0 | **-12.5 ± 3.6** | **-1.2 ± 1.2** |
| castle · exhib-2 | **+4,237 ± 2,688** | **+4,237 ± 2,688** | **+12.0 ± 4.1** | **+2.8 ± 1.0** | **+14.6 ± 3.3** | **-11.4 ± 4.3** | **-5.3 ± 2.0** |
| castle · exhib-volume | +1,997 ± 2,711 | +1,997 ± 2,711 | **+12.6 ± 4.8** | **+5.4 ± 1.4** | **+15.2 ± 4.0** | **-23.2 ± 6.3** | **-7.5 ± 3.0** |
| castle · upscale | **+14,801 ± 2,745** | **+14,801 ± 2,745** | **-3.9 ± 1.5** | +0.2 ± 0.7 | **-0.9 ± 0.8** | +1.9 ± 2.2 | **+3.7 ± 1.9** |

---

### interactions

Choices varied together over a full first cycle: house x partner x Sam's past. Look for a choice whose effect flips or grows with another (e.g. a partner who only shines in one house).

scenario **campaign** · 12 seeds from 1 · 206s · 2026-11-20T19:55

| variant | n | weeksToWin | winRate | netMid | netLate | worth20 | missed | sat | left | over |
|---|---|---|---|---|---|---|---|---|---|---|
| lantern kaede salaryman | 12 | 29 | 1.0 | 829 | 2,208 | -11,996 | 0.0 | 67 | 0.1 | 0.0 |
| lantern kaede gym | 12 | 33 | 1.0 | 753 | 1,813 | -15,662 | 0.0 | 61 | 0.1 | 0.0 |
| lantern nerys salaryman | 12 | 25 | 1.0 | 1,103 | 2,282 | -6,420 | 0.0 | 70 | 0.1 | 0.0 |
| lantern nerys gym | 12 | 27 | 1.0 | 1,175 | 2,317 | -5,373 | 0.0 | 69 | 0.2 | 0.0 |
| lantern adelheid salaryman | 12 | 31 | 1.0 | 757 | 2,222 | -13,379 | 0.1 | 65 | 0.1 | 0.0 |
| lantern adelheid gym | 12 | 40 | 0.9 | 615 | 2,145ⁿ11 | -14,799ⁿ11 | 0.3 | 62 | 0.1 | 0.1 |
| hollow kaede salaryman | 12 | 37 | 0.9 | 1,519 | 4,298ⁿ11 | -29,600ⁿ11 | 0.6 | 75 | 0.2 | 0.1 |
| hollow kaede gym | 12 | 40 | 0.9 | 1,536 | 3,637ⁿ11 | -32,244 | 0.7 | 70 | 0.3 | 0.1 |
| hollow nerys salaryman | 12 | 34 | 0.9 | 1,779 | 5,087ⁿ11 | -22,723ⁿ11 | 0.5 | 78 | 0.1 | 0.1 |
| hollow nerys gym | 12 | 34 | 0.9 | 2,070 | 5,216ⁿ11 | -23,637 | 0.6 | 76 | 0.3 | 0.1 |
| hollow adelheid salaryman | 12 | 29 | 1.0 | 1,450 | 3,704 | -19,469 | 0.0 | 72 | 0.1 | 0.0 |
| hollow adelheid gym | 12 | 30 | 1.0 | 1,231 | 3,625 | -25,391 | 0.0 | 71 | 0.1 | 0.0 |
| tankard kaede salaryman | 12 | 34 | 1.0 | 785 | 1,202 | -11,324 | 0.0 | 64 | 0.5 | 0.0 |
| tankard kaede gym | 12 | 32 | 1.0 | 753 | 1,292 | -11,853 | 0.1 | 64 | 0.3 | 0.0 |
| tankard nerys salaryman | 12 | 25 | 1.0 | 1,127 | 1,921 | -1,874 | 0.0 | 69 | 0.1 | 0.0 |
| tankard nerys gym | 12 | 23 | 1.0 | 1,338 | 2,193 | 3,169 | 0.0 | 74 | 0.1 | 0.0 |
| tankard adelheid salaryman | 12 | 40 | 0.9 | 357 | 1,063ⁿ11 | -11,521ⁿ11 | 0.3 | 58 | 0.1 | 0.1 |
| tankard adelheid gym | 12 | 38 | 0.9 | 437 | 1,211ⁿ11 | -10,798 | 0.3 | 58 | 0.3 | 0.1 |
| castle kaede salaryman | 12 | 33 | 1.0 | 3,415 | 9,005 | -78,697 | 0.1 | 75 | 0.1 | 0.0 |
| castle kaede gym | 12 | 38 | 0.9 | 3,543 | 9,722ⁿ11 | -79,834ⁿ11 | 0.5 | 74 | 0.3 | 0.1 |
| castle nerys salaryman | 12 | 29 | 1.0 | 3,693 | 9,662 | -55,332 | 0.0 | 78 | 0.0 | 0.0 |
| castle nerys gym | 12 | 31 | 1.0 | 3,822 | 8,719 | -68,149 | 0.0 | 75 | 0.1 | 0.0 |
| castle adelheid salaryman | 12 | 31 | 1.0 | 3,030 | 7,829 | -63,356 | 0.0 | 71 | 0.0 | 0.0 |
| castle adelheid gym | 12 | 30 | 1.0 | 3,237 | 7,940 | -60,702 | 0.0 | 74 | 0.0 | 0.0 |

---

### race-courtesan-phases

Courtesan role by race across early4/mid/late and Tankard/Lantern/Castle (2 tested ladies, rest humans, fixed staff count).

scenario **mid** · 12 seeds from 1 · 335s · 2026-11-20T20:15

| variant | n | houseNet | total | net | testedNet | testedServed | testedRest | testedRech | sat | repGain | prestige | staff |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| early4 · tankard · base | 12 | 440 | 440 | 440 | 23ⁿ11 | 2.1ⁿ11 | 4.5ⁿ11 | 0.0ⁿ11 | 61 | -1.7 | 1.7 | 4.2 |
| early4 · tankard · elf | 12 | 450 | 450 | 450 | 23ⁿ11 | 2.3ⁿ11 | 5.3ⁿ11 | 0.0ⁿ11 | 60 | -2.2 | 0.8 | 4.2 |
| early4 · tankard · beastkin/fox | 12 | 478 | 478 | 478 | 35ⁿ11 | 2.5ⁿ11 | 3.4ⁿ11 | 0.0ⁿ11 | 60 | -0.4 | 1.0 | 4.2 |
| early4 · tankard · beastkin/cat | 12 | 493 | 493 | 493 | 40ⁿ11 | 2.7ⁿ11 | 2.3ⁿ11 | 0.0ⁿ11 | 60 | -0.3 | 1.0 | 4.2 |
| early4 · tankard · beastkin/wolf | 12 | 513 | 513 | 513 | 35ⁿ11 | 2.3ⁿ11 | 4.5ⁿ11 | 0.0ⁿ11 | 62 | -0.0 | 0.8 | 4.2 |
| early4 · tankard · beastkin/rabbit | 12 | 468 | 468 | 468 | 41ⁿ11 | 2.4ⁿ11 | 3.8ⁿ11 | 0.0ⁿ11 | 60 | -0.6 | 1.2 | 4.2 |
| early4 · tankard · beastkin/dragon | 12 | 431 | 431 | 431 | 22ⁿ11 | 2.4ⁿ11 | 4.2ⁿ11 | 0.0ⁿ11 | 60 | -0.7 | 1.5 | 4.2 |
| early4 · tankard · demon | 12 | 518 | 518 | 518 | 103ⁿ11 | 3.5ⁿ11 | 0.4ⁿ11 | 0.0ⁿ11 | 62 | 1.8 | 0.4 | 4.2 |
| early4 · tankard · dwarf | 12 | 468 | 468 | 468 | 39ⁿ11 | 2.9ⁿ11 | 1.1ⁿ11 | 0.0ⁿ11 | 60 | -0.9 | 0.8 | 4.2 |
| early4 · tankard · spirit | 12 | 502 | 502 | 502 | 31ⁿ11 | 2.2ⁿ11 | 6.1ⁿ11 | 0.0ⁿ11 | 62 | 2.3 | 1.8 | 4.2 |
| early4 · tankard · angel | 12 | 487 | 487 | 487 | 24ⁿ11 | 2.3ⁿ11 | 4.2ⁿ11 | 0.0ⁿ11 | 60 | 1.0 | 1.2 | 4.2 |
| early4 · tankard · angel/lantern | 12 | 475 | 475 | 475 | 35ⁿ11 | 2.3ⁿ11 | 5.7ⁿ11 | 0.0ⁿ11 | 61 | -1.2 | 1.3 | 4.2 |
| early4 · tankard · android | 12 | 402 | 402 | 402 | 8.0ⁿ11 | 2.6ⁿ11 | 0.0ⁿ11 | 55ⁿ11 | 63 | 2.1 | 1.9 | 4.2 |
| early4 · lantern · base | 12 | 552 | 552 | 552 | 50 | 1.9 | 2.8 | 0.0 | 55 | -5.2 | 33 | 4.1 |
| early4 · lantern · elf | 12 | 533 | 533 | 533 | 58 | 2.1 | 2.8 | 0.0 | 52 | -7.1 | 33 | 4.1 |
| early4 · lantern · beastkin/fox | 12 | 569 | 569 | 569 | 73 | 2.1 | 2.1 | 0.0 | 52 | -8.2 | 33 | 4.1 |
| early4 · lantern · beastkin/cat | 12 | 563 | 563 | 563 | 66 | 2.0 | 2.1 | 0.0 | 53 | -7.8 | 33 | 4.1 |
| early4 · lantern · beastkin/wolf | 12 | 619 | 619 | 619 | 76 | 2.1 | 3.1 | 0.0 | 54 | -5.9 | 34 | 4.1 |
| early4 · lantern · beastkin/rabbit | 12 | 593 | 593 | 593 | 79 | 2.2 | 2.4 | 0.0 | 53 | -7.2 | 33 | 4.1 |
| early4 · lantern · beastkin/dragon | 12 | 512 | 512 | 512 | 52 | 2.1 | 4.5 | 0.0 | 52 | -8.0 | 33 | 4.1 |
| early4 · lantern · demon | 12 | 614 | 614 | 614 | 154 | 3.1 | 0.3 | 0.0 | 52 | -8.9 | 32 | 4.1 |
| early4 · lantern · dwarf | 12 | 516 | 516 | 516 | 69 | 2.3 | 1.0 | 0.0 | 52 | -9.1 | 33 | 4.1 |
| early4 · lantern · spirit | 12 | 588 | 588 | 588 | 69 | 2.1 | 6.6 | 0.0 | 54 | -4.7 | 34 | 4.1 |
| early4 · lantern · angel | 12 | 538 | 538 | 538 | 65 | 2.3 | 1.7 | 0.0 | 53 | -7.6 | 33 | 4.1 |
| early4 · lantern · angel/lantern | 12 | 554 | 554 | 554 | 63 | 2.0 | 3.8 | 0.0 | 55 | -7.2 | 33 | 4.1 |
| early4 · lantern · android | 12 | 514 | 514 | 514 | 60 | 2.5 | 0.3 | 48 | 55 | -3.8 | 33 | 4.1 |
| early4 · castle · base | 12 | 1,866 | 1,866 | 1,866 | 2.3ⁿ11 | 0.5ⁿ11 | 1.1ⁿ11 | 0.0ⁿ11 | 72 | 11 | 74 | 4.8 |
| early4 · castle · elf | 12 | 1,782 | 1,782 | 1,782 | 11ⁿ11 | 0.5ⁿ11 | 0.8ⁿ11 | 0.0ⁿ11 | 72 | 8.8 | 73 | 4.8 |
| early4 · castle · beastkin/fox | 12 | 1,766 | 1,766 | 1,766 | 4.0ⁿ11 | 0.5ⁿ11 | 2.3ⁿ11 | 0.0ⁿ11 | 72 | 12 | 74 | 4.9 |
| early4 · castle · beastkin/cat | 12 | 1,752 | 1,752 | 1,752 | 0.7ⁿ11 | 0.5ⁿ11 | 1.5ⁿ11 | 0.0ⁿ11 | 72 | 12 | 74 | 4.9 |
| early4 · castle · beastkin/wolf | 12 | 1,806 | 1,806 | 1,806 | 12ⁿ11 | 0.7ⁿ11 | 2.7ⁿ11 | 0.0ⁿ11 | 71 | 11 | 73 | 5.0 |
| early4 · castle · beastkin/rabbit | 12 | 1,796 | 1,796 | 1,796 | 17ⁿ11 | 0.7ⁿ11 | 0.8ⁿ11 | 0.0ⁿ11 | 71 | 10 | 74 | 4.8 |
| early4 · castle · beastkin/dragon | 12 | 1,740 | 1,740 | 1,740 | 16ⁿ11 | 0.8ⁿ11 | 1.9ⁿ11 | 0.0ⁿ11 | 71 | 5.3 | 72 | 4.9 |
| early4 · castle · demon | 12 | 1,629 | 1,629 | 1,629 | 86ⁿ11 | 1.2ⁿ11 | 0.0ⁿ11 | 0.0ⁿ11 | 69 | 7.2 | 72 | 4.9 |
| early4 · castle · dwarf | 12 | 1,876 | 1,876 | 1,876 | 8.6ⁿ11 | 0.7ⁿ11 | 0.4ⁿ11 | 0.0ⁿ11 | 71 | 9.7 | 73 | 4.9 |
| early4 · castle · spirit | 12 | 1,738 | 1,738 | 1,738 | 14ⁿ11 | 0.5ⁿ11 | 0.0ⁿ11 | 0.0ⁿ11 | 72 | 7.4 | 74 | 4.8 |
| early4 · castle · angel | 12 | 1,913 | 1,913 | 1,913 | 17ⁿ11 | 0.7ⁿ11 | 1.1ⁿ11 | 0.0ⁿ11 | 71 | 13 | 74 | 4.8 |
| early4 · castle · angel/lantern | 12 | 1,704 | 1,704 | 1,704 | 17ⁿ11 | 0.6ⁿ11 | 1.1ⁿ11 | 0.0ⁿ11 | 72 | 7.7 | 74 | 4.9 |
| early4 · castle · android | 12 | 1,699 | 1,699 | 1,699 | 6.2ⁿ11 | 0.8ⁿ11 | 0.0ⁿ11 | 23ⁿ11 | 72 | 6.5 | 74 | 4.9 |
| mid · tankard · base | 12 | 383 | 383 | 383 | 66 | 4.5 | 4.5 | 0.0 | 54 | -3.1 | 4.7 | 5.4 |
| mid · tankard · elf | 12 | 423 | 423 | 423 | 68 | 4.5 | 5.9 | 0.0 | 56 | -0.0 | 7.4 | 5.4 |
| mid · tankard · beastkin/fox | 12 | 354 | 354 | 354 | 93 | 5.1 | 6.6 | 0.0 | 52 | -2.9 | 5.6 | 5.4 |
| mid · tankard · beastkin/cat | 12 | 370 | 370 | 370 | 88 | 5.3 | 3.8 | 0.0 | 54 | -0.8 | 6.2 | 5.4 |
| mid · tankard · beastkin/wolf | 12 | 435 | 435 | 435 | 98 | 5.0 | 7.3 | 0.0 | 54 | -2.0 | 6.6 | 5.4 |
| mid · tankard · beastkin/rabbit | 12 | 416 | 416 | 416 | 104 | 5.2 | 5.6 | 0.0 | 55 | -0.6 | 6.3 | 5.4 |
| mid · tankard · beastkin/dragon | 12 | 472 | 472 | 472 | 63 | 4.2 | 7.3 | 0.0 | 56 | -2.5 | 2.9 | 5.4 |
| mid · tankard · demon | 12 | 623 | 623 | 623 | 223 | 6.8 | 0.7 | 0.0 | 60 | 3.9 | 4.3 | 5.3 |
| mid · tankard · dwarf | 12 | 446 | 446 | 446 | 82 | 5.1 | 1.7 | 0.0 | 55 | -1.1 | 5.8 | 5.4 |
| mid · tankard · spirit | 12 | 392 | 392 | 392 | 82 | 4.5 | 5.6 | 0.0 | 58 | -0.8 | 9.8 | 5.4 |
| mid · tankard · angel | 12 | 385 | 385 | 385 | 72 | 4.5 | 9.4 | 0.0 | 55 | -2.2 | 6.3 | 5.3 |
| mid · tankard · angel/lantern | 12 | 337 | 337 | 337 | 75 | 4.3 | 8.7 | 0.0 | 55 | -0.3 | 7.2 | 5.4 |
| mid · tankard · android | 12 | 385 | 385 | 385 | 86 | 6.5 | 0.0 | 104 | 61 | 9.6 | 7.8 | 5.4 |
| mid · lantern · base | 12 | 285 | 452 | 285 | 157 | 5.0 | 7.3 | 0.0 | 51 | -2.7 | 40 | 5.2 |
| mid · lantern · elf | 12 | 279 | 425 | 279 | 169 | 4.9 | 4.2 | 0.0 | 52 | -2.5 | 39 | 5.2 |
| mid · lantern · beastkin/fox | 12 | 318 | 472 | 318 | 183 | 5.1 | 5.9 | 0.0 | 51 | -3.2 | 39 | 5.2 |
| mid · lantern · beastkin/cat | 12 | 312 | 448 | 312 | 172 | 5.2 | 4.2 | 0.0 | 50 | -4.6 | 37 | 5.2 |
| mid · lantern · beastkin/wolf | 12 | 369 | 463 | 369 | 174 | 4.9 | 6.6 | 0.0 | 52 | -3.9 | 37 | 5.1 |
| mid · lantern · beastkin/rabbit | 12 | 335 | 481 | 335 | 180 | 4.9 | 4.5 | 0.0 | 53 | -1.6 | 39 | 5.2 |
| mid · lantern · beastkin/dragon | 12 | 356 | 496 | 356 | 168 | 4.8 | 8.3 | 0.0 | 51 | -2.3 | 36 | 5.2 |
| mid · lantern · demon | 12 | 683 | 866 | 683 | 435 | 6.7 | 0.0 | 0.0 | 58 | 5.0 | 37 | 5.2 |
| mid · lantern · dwarf | 12 | 331 | 496 | 331 | 171 | 5.1 | 2.1 | 0.0 | 52 | 0.1 | 39 | 5.2 |
| mid · lantern · spirit | 12 | 331 | 450 | 331 | 160 | 4.8 | 6.3 | 0.0 | 56 | -0.8 | 39 | 5.2 |
| mid · lantern · angel | 12 | 313 | 476 | 313 | 154 | 4.6 | 6.9 | 0.0 | 53 | -1.7 | 38 | 5.2 |
| mid · lantern · angel/lantern | 12 | 332 | 411 | 332 | 168 | 5.0 | 8.3 | 0.0 | 52 | -4.4 | 38 | 5.2 |
| mid · lantern · android | 12 | 491 | 656 | 491 | 341 | 6.9 | 0.0 | 116 | 61 | 11 | 40 | 5.2 |
| mid · castle · base | 12 | 1,904 | 1,909 | 1,909 | 64 | 1.7 | 4.2 | 0.0 | 67 | 12 | 80 | 5.9 |
| mid · castle · elf | 12 | 2,009 | 2,014 | 2,014 | 98 | 1.7 | 1.0 | 0.0 | 71 | 15 | 85 | 5.8 |
| mid · castle · beastkin/fox | 12 | 1,788 | 1,793 | 1,793 | 106 | 2.2 | 2.1 | 0.0 | 66 | 13 | 80 | 5.9 |
| mid · castle · beastkin/cat | 12 | 1,856 | 1,860 | 1,860 | 120 | 2.3 | 1.4 | 0.0 | 65 | 12 | 81 | 5.8 |
| mid · castle · beastkin/wolf | 12 | 1,914 | 1,919 | 1,919 | 115 | 2.2 | 2.4 | 0.0 | 67 | 12 | 80 | 5.8 |
| mid · castle · beastkin/rabbit | 12 | 2,072 | 2,077 | 2,077 | 92 | 1.8 | 1.4 | 0.0 | 69 | 13 | 80 | 5.8 |
| mid · castle · beastkin/dragon | 12 | 2,083 | 2,088 | 2,088 | 112 | 2.3 | 4.5 | 0.0 | 67 | 13 | 81 | 5.8 |
| mid · castle · demon | 12 | 1,943 | 1,948 | 1,948 | 207 | 2.7 | 0.3 | 0.0 | 67 | 13 | 80 | 5.8 |
| mid · castle · dwarf | 12 | 1,930 | 1,934 | 1,934 | 100 | 2.3 | 0.3 | 0.0 | 65 | 12 | 80 | 5.8 |
| mid · castle · spirit | 12 | 2,061 | 2,065 | 2,065 | 81 | 1.8 | 1.0 | 0.0 | 70 | 14 | 84 | 6.0 |
| mid · castle · angel | 12 | 2,063 | 2,067 | 2,067 | 108 | 2.1 | 1.4 | 0.0 | 67 | 13 | 83 | 5.8 |
| mid · castle · angel/lantern | 12 | 1,941 | 1,945 | 1,945 | 117 | 2.1 | 3.1 | 0.0 | 68 | 13 | 81 | 6.0 |
| mid · castle · android | 12 | 2,297 | 2,301 | 2,301 | 140 | 2.4 | 0.0 | 52 | 70 | 19 | 82 | 6.0 |
| late · tankard · base | 12 | 961 | 964 | 964 | 137 | 6.2 | 8.7 | 0.0 | 55 | 5.8 | 11 | 8.8 |
| late · tankard · elf | 12 | 982 | 985 | 985 | 144 | 6.2 | 5.9 | 0.0 | 56 | 2.8 | 10 | 8.8 |
| late · tankard · beastkin/fox | 12 | 1,119 | 1,122 | 1,122 | 171 | 6.7 | 3.5 | 0.0 | 58 | 4.4 | 9.8 | 8.7 |
| late · tankard · beastkin/cat | 12 | 1,130 | 1,132 | 1,132 | 183 | 6.9 | 1.4 | 0.0 | 57 | 6.7 | 9.2 | 8.8 |
| late · tankard · beastkin/wolf | 12 | 1,113 | 1,116 | 1,116 | 166 | 6.5 | 8.4 | 0.0 | 58 | 6.3 | 9.6 | 8.8 |
| late · tankard · beastkin/rabbit | 12 | 1,070 | 1,073 | 1,073 | 182 | 6.8 | 2.8 | 0.0 | 57 | 6.0 | 9.8 | 8.8 |
| late · tankard · beastkin/dragon | 12 | 1,057 | 1,059 | 1,059 | 143 | 5.9 | 16 | 0.0 | 58 | 3.6 | 11 | 8.8 |
| late · tankard · demon | 12 | 1,745 | 1,747 | 1,747 | 589 | 12 | 0.9 | 0.0 | 62 | 11 | 8.8 | 8.8 |
| late · tankard · dwarf | 12 | 1,102 | 1,105 | 1,105 | 178 | 7.0 | 2.8 | 0.0 | 57 | 5.4 | 8.2 | 8.8 |
| late · tankard · spirit | 12 | 1,143 | 1,145 | 1,145 | 178 | 6.3 | 6.6 | 0.0 | 59 | 9.2 | 10 | 8.8 |
| late · tankard · angel | 12 | 978 | 981 | 981 | 145 | 6.1 | 8.0 | 0.0 | 57 | 6.2 | 9.8 | 8.8 |
| late · tankard · angel/lantern | 12 | 1,077 | 1,080 | 1,080 | 147 | 6.0 | 9.0 | 0.0 | 57 | 4.0 | 9.8 | 8.8 |
| late · tankard · android | 12 | 1,555 | 1,557 | 1,557 | 354 | 11 | 0.7 | 173 | 63 | 16 | 8.0 | 8.8 |
| late · lantern · base | 12 | 1,319 | 1,549 | 1,326 | 205 | 5.1 | 5.9 | 0.0 | 61 | 15 | 46 | 10 |
| late · lantern · elf | 12 | 1,313 | 1,530 | 1,320 | 240 | 5.3 | 4.5 | 0.0 | 61 | 14 | 44 | 10 |
| late · lantern · beastkin/fox | 12 | 1,301 | 1,510 | 1,308 | 242 | 5.8 | 3.5 | 0.0 | 59 | 11 | 43 | 10 |
| late · lantern · beastkin/cat | 12 | 1,275 | 1,528 | 1,282 | 257 | 6.1 | 2.1 | 0.0 | 60 | 12 | 44 | 10 |
| late · lantern · beastkin/wolf | 12 | 1,365 | 1,611 | 1,372 | 259 | 5.8 | 4.9 | 0.0 | 60 | 12 | 44 | 10 |
| late · lantern · beastkin/rabbit | 12 | 1,307 | 1,522 | 1,314 | 259 | 5.8 | 2.8 | 0.0 | 60 | 10 | 42 | 10 |
| late · lantern · beastkin/dragon | 12 | 1,362 | 1,530 | 1,368 | 224 | 5.4 | 10 | 0.0 | 60 | 14 | 43 | 10 |
| late · lantern · demon | 12 | 1,761 | 1,969 | 1,768 | 720 | 8.9 | 0.3 | 0.0 | 64 | 14 | 42 | 10 |
| late · lantern · dwarf | 12 | 1,281 | 1,490 | 1,288 | 248 | 5.9 | 2.4 | 0.0 | 60 | 15 | 43 | 10 |
| late · lantern · spirit | 12 | 1,276 | 1,463 | 1,283 | 229 | 5.4 | 3.5 | 0.0 | 61 | 10 | 40 | 10 |
| late · lantern · angel | 12 | 1,218 | 1,418 | 1,225 | 225 | 5.4 | 7.3 | 0.0 | 59 | 11 | 41 | 10 |
| late · lantern · angel/lantern | 12 | 1,311 | 1,515 | 1,318 | 253 | 5.4 | 6.3 | 0.0 | 61 | 13 | 45 | 10 |
| late · lantern · android | 12 | 1,557 | 1,710 | 1,564 | 483 | 7.5 | 0.0 | 132 | 65 | 15 | 39 | 10 |
| late · castle · base | 11 (+1 unreached) | 8,661 | 8,667 | 8,667 | 197 | 2.6 | 0.4 | 0.0 | 74 | 9.8 | 90 | 17 |
| late · castle · elf | 11 (+1 unreached) | 8,965 | 8,971 | 8,971 | 282 | 2.8 | 0.0 | 0.0 | 76 | 9.9 | 89 | 17 |
| late · castle · beastkin/fox | 11 (+1 unreached) | 8,840 | 8,846 | 8,846 | 243 | 3.0 | 0.4 | 0.0 | 74 | 11 | 89 | 17 |
| late · castle · beastkin/cat | 11 (+1 unreached) | 8,837 | 8,843 | 8,843 | 239 | 3.0 | 0.4 | 0.0 | 74 | 8.2 | 90 | 17 |
| late · castle · beastkin/wolf | 11 (+1 unreached) | 8,580 | 8,586 | 8,586 | 288 | 3.4 | 0.4 | 0.0 | 72 | 8.4 | 89 | 17 |
| late · castle · beastkin/rabbit | 11 (+1 unreached) | 8,485 | 8,491 | 8,491 | 274 | 3.2 | 0.4 | 0.0 | 74 | 11 | 88 | 17 |
| late · castle · beastkin/dragon | 11 (+1 unreached) | 8,275 | 8,281 | 8,281 | 245 | 3.1 | 0.4 | 0.0 | 72 | 8.7 | 90 | 17 |
| late · castle · demon | 11 (+1 unreached) | 7,993 | 7,998 | 7,998 | 346 | 3.3 | 0.8 | 0.0 | 74 | 8.2 | 88 | 17 |
| late · castle · dwarf | 11 (+1 unreached) | 8,684 | 8,690 | 8,690 | 235 | 2.9 | 0.4 | 0.0 | 72 | 9.8 | 91 | 17 |
| late · castle · spirit | 11 (+1 unreached) | 8,381 | 8,386 | 8,386 | 206 | 2.5 | 0.0 | 0.0 | 74 | 9.6 | 90 | 17 |
| late · castle · angel | 11 (+1 unreached) | 8,771 | 8,777 | 8,777 | 249 | 2.8 | 0.8 | 0.0 | 74 | 11 | 89 | 17 |
| late · castle · angel/lantern | 11 (+1 unreached) | 8,481 | 8,487 | 8,487 | 271 | 2.8 | 0.8 | 0.0 | 74 | 11 | 89 | 17 |
| late · castle · android | 11 (+1 unreached) | 8,284 | 8,290 | 8,290 | 267 | 3.2 | 0.4 | 62 | 75 | 7.1 | 90 | 17 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ testedNet | Δ testedServed | Δ testedRest | Δ sat |
|---|---|---|---|---|---|
| early4 · tankard · elf | +9.6 ± 45.0 | -0.9 ± 8.8 | +0.2 ± 0.2 | +0.8 ± 3.1 | -1.4 ± 2.1 |
| early4 · tankard · beastkin/fox | +37.9 ± 62.4 | +11.5 ± 14.5 | +0.4 ± 0.5 | -1.1 ± 3.3 | -1.1 ± 1.7 |
| early4 · tankard · beastkin/cat | +52.5 ± 65.3 | **+16.6 ± 7.7** | **+0.6 ± 0.4** | -2.3 ± 2.3 | -0.8 ± 2.7 |
| early4 · tankard · beastkin/wolf | **+72.3 ± 61.3** | +11.6 ± 13.9 | +0.3 ± 0.5 | +0.0 ± 3.1 | +0.7 ± 2.2 |
| early4 · tankard · beastkin/rabbit | +27.5 ± 36.6 | **+17.4 ± 10.6** | **+0.4 ± 0.4** | -0.8 ± 3.1 | -0.9 ± 1.3 |
| early4 · tankard · beastkin/dragon | -9.2 ± 71.2 | -1.4 ± 22.4 | +0.3 ± 0.8 | -0.4 ± 3.4 | -1.6 ± 2.8 |
| early4 · tankard · demon | +78.1 ± 90.9 | **+79.1 ± 53.4** | **+1.5 ± 1.4** | **-4.2 ± 3.1** | +0.6 ± 1.6 |
| early4 · tankard · dwarf | +27.5 ± 56.7 | +15.2 ± 15.9 | **+0.8 ± 0.6** | **-3.4 ± 2.7** | -1.4 ± 1.8 |
| early4 · tankard · spirit | **+61.4 ± 51.3** | +7.9 ± 8.2 | +0.1 ± 0.4 | +1.5 ± 3.0 | +1.0 ± 1.6 |
| early4 · tankard · angel | +46.4 ± 91.8 | +0.0 ± 9.5 | +0.2 ± 0.5 | -0.4 ± 4.2 | -0.9 ± 2.2 |
| early4 · tankard · angel/lantern | +34.2 ± 56.9 | **+11.3 ± 9.7** | +0.2 ± 0.3 | +1.1 ± 1.9 | -0.4 ± 2.1 |
| early4 · tankard · android | -38.3 ± 50.1 | **-15.5 ± 13.2** | **+0.5 ± 0.4** | **-4.5 ± 2.8** | +1.6 ± 2.3 |
| early4 · lantern · elf | -19.1 ± 74.0 | +8.0 ± 16.1 | +0.2 ± 0.4 | -0.0 ± 2.2 | **-2.4 ± 2.0** |
| early4 · lantern · beastkin/fox | +16.5 ± 69.5 | **+23.1 ± 18.7** | +0.2 ± 0.4 | -0.7 ± 2.0 | **-2.4 ± 1.8** |
| early4 · lantern · beastkin/cat | +11.1 ± 65.3 | **+16.1 ± 13.7** | +0.1 ± 0.4 | -0.7 ± 0.9 | **-2.2 ± 1.8** |
| early4 · lantern · beastkin/wolf | +66.4 ± 98.5 | **+25.9 ± 24.1** | +0.2 ± 0.4 | +0.3 ± 1.9 | -1.3 ± 2.1 |
| early4 · lantern · beastkin/rabbit | +41.1 ± 78.6 | **+29.6 ± 15.3** | +0.3 ± 0.3 | -0.3 ± 1.2 | -1.8 ± 1.9 |
| early4 · lantern · beastkin/dragon | -40.6 ± 85.5 | +2.1 ± 12.9 | +0.2 ± 0.3 | +1.7 ± 1.9 | **-2.6 ± 1.5** |
| early4 · lantern · demon | +62.1 ± 62.2 | **+104.3 ± 76.2** | **+1.2 ± 0.8** | **-2.4 ± 1.9** | **-2.7 ± 1.9** |
| early4 · lantern · dwarf | -36.6 ± 53.8 | +18.9 ± 27.3 | +0.4 ± 0.7 | -1.7 ± 2.1 | **-3.2 ± 2.7** |
| early4 · lantern · spirit | +35.2 ± 54.9 | **+19.5 ± 16.2** | +0.2 ± 0.3 | **+3.8 ± 2.7** | -0.4 ± 1.6 |
| early4 · lantern · angel | -14.2 ± 48.2 | +14.8 ± 18.9 | +0.4 ± 0.5 | -1.0 ± 2.3 | **-2.2 ± 1.7** |
| early4 · lantern · angel/lantern | +2.0 ± 49.1 | +13.6 ± 13.9 | +0.1 ± 0.4 | +1.0 ± 2.9 | -0.1 ± 2.0 |
| early4 · lantern · android | -38.2 ± 55.5 | +10.2 ± 29.2 | **+0.6 ± 0.3** | **-2.4 ± 1.9** | +0.3 ± 1.5 |
| early4 · castle · elf | -84.0 ± 230.1 | +8.9 ± 14.5 | +0.0 ± 0.2 | -0.4 ± 1.7 | +0.2 ± 1.9 |
| early4 · castle · beastkin/fox | -100.9 ± 229.4 | +1.7 ± 12.7 | +0.0 ± 0.2 | +1.1 ± 3.5 | -0.2 ± 2.2 |
| early4 · castle · beastkin/cat | -114.0 ± 248.6 | -1.5 ± 8.0 | +0.0 ± 0.1 | +0.4 ± 2.3 | -0.3 ± 2.2 |
| early4 · castle · beastkin/wolf | -60.2 ± 198.5 | +9.5 ± 11.6 | +0.2 ± 0.2 | +1.5 ± 3.0 | -0.8 ± 2.7 |
| early4 · castle · beastkin/rabbit | -70.8 ± 276.2 | +14.7 ± 16.2 | +0.2 ± 0.2 | -0.4 ± 1.7 | -0.8 ± 1.8 |
| early4 · castle · beastkin/dragon | -126.2 ± 220.9 | +13.6 ± 22.1 | +0.3 ± 0.4 | +0.8 ± 2.7 | -1.7 ± 2.0 |
| early4 · castle · demon | -237.3 ± 295.4 | **+83.3 ± 41.7** | **+0.7 ± 0.4** | -1.1 ± 1.6 | **-3.2 ± 2.8** |
| early4 · castle · dwarf | +9.3 ± 196.4 | +6.3 ± 12.2 | **+0.2 ± 0.2** | -0.8 ± 1.5 | -1.3 ± 1.4 |
| early4 · castle · spirit | -128.3 ± 191.4 | +11.8 ± 15.5 | +0.1 ± 0.1 | -1.1 ± 1.6 | +0.2 ± 1.1 |
| early4 · castle · angel | +46.7 ± 270.2 | +14.6 ± 16.0 | **+0.2 ± 0.2** | -0.0 ± 2.2 | -0.8 ± 2.1 |
| early4 · castle · angel/lantern | -162.4 ± 221.6 | +15.0 ± 18.3 | +0.1 ± 0.2 | +0.0 ± 2.2 | -0.5 ± 2.2 |
| early4 · castle · android | -167.8 ± 200.6 | +3.9 ± 24.4 | +0.3 ± 0.3 | -1.1 ± 1.6 | -0.7 ± 1.7 |
| mid · tankard · elf | +40.3 ± 177.0 | +1.1 ± 17.6 | -0.0 ± 0.9 | +1.4 ± 3.5 | +2.5 ± 3.6 |
| mid · tankard · beastkin/fox | -28.6 ± 90.0 | **+26.9 ± 17.2** | **+0.6 ± 0.6** | +2.1 ± 3.6 | -1.2 ± 2.9 |
| mid · tankard · beastkin/cat | -12.6 ± 75.2 | **+21.9 ± 15.4** | **+0.8 ± 0.5** | -0.7 ± 3.5 | +0.1 ± 2.3 |
| mid · tankard · beastkin/wolf | +52.3 ± 83.8 | **+31.4 ± 18.3** | +0.5 ± 0.8 | +2.8 ± 4.4 | +0.8 ± 2.4 |
| mid · tankard · beastkin/rabbit | +32.8 ± 74.7 | **+37.2 ± 17.1** | **+0.7 ± 0.6** | +1.0 ± 3.4 | +1.1 ± 2.0 |
| mid · tankard · beastkin/dragon | +88.9 ± 108.8 | -3.7 ± 11.0 | -0.3 ± 0.6 | +2.8 ± 3.1 | +2.4 ± 3.2 |
| mid · tankard · demon | **+240.1 ± 112.0** | **+156.1 ± 49.3** | **+2.3 ± 1.4** | **-3.8 ± 2.7** | **+6.7 ± 2.1** |
| mid · tankard · dwarf | +63.2 ± 66.0 | +15.1 ± 19.5 | +0.6 ± 0.8 | **-2.8 ± 1.8** | +1.2 ± 2.4 |
| mid · tankard · spirit | +9.0 ± 59.5 | +15.6 ± 21.2 | +0.0 ± 1.0 | +1.0 ± 2.9 | **+4.2 ± 3.1** |
| mid · tankard · angel | +2.4 ± 71.7 | +5.1 ± 11.8 | +0.0 ± 0.7 | **+4.9 ± 3.5** | +1.4 ± 2.3 |
| mid · tankard · angel/lantern | -45.7 ± 64.4 | +8.8 ± 14.1 | -0.1 ± 0.6 | **+4.2 ± 2.7** | +1.9 ± 2.5 |
| mid · tankard · android | +2.1 ± 131.2 | +19.1 ± 34.1 | **+2.0 ± 0.6** | **-4.5 ± 2.9** | **+7.2 ± 2.2** |
| mid · lantern · elf | -6.4 ± 64.7 | +11.1 ± 25.7 | -0.1 ± 0.6 | -3.1 ± 4.2 | +0.2 ± 2.0 |
| mid · lantern · beastkin/fox | +33.0 ± 111.0 | +25.9 ± 26.1 | +0.1 ± 0.6 | -1.4 ± 2.5 | -0.3 ± 2.8 |
| mid · lantern · beastkin/cat | +27.4 ± 76.3 | +14.4 ± 24.8 | +0.2 ± 0.5 | -3.1 ± 3.4 | -1.3 ± 1.9 |
| mid · lantern · beastkin/wolf | +83.8 ± 115.8 | +16.6 ± 21.8 | -0.1 ± 0.7 | -0.7 ± 3.6 | +0.4 ± 1.4 |
| mid · lantern · beastkin/rabbit | +49.8 ± 103.2 | +22.4 ± 30.0 | -0.1 ± 0.8 | -2.8 ± 3.8 | +1.4 ± 1.7 |
| mid · lantern · beastkin/dragon | +70.9 ± 120.1 | +10.8 ± 32.8 | -0.2 ± 0.8 | +1.0 ± 4.0 | +0.0 ± 2.5 |
| mid · lantern · demon | **+398.2 ± 194.8** | **+277.4 ± 128.9** | **+1.7 ± 1.2** | **-7.3 ± 3.5** | **+6.2 ± 2.3** |
| mid · lantern · dwarf | +46.3 ± 118.1 | +13.9 ± 32.8 | +0.1 ± 0.8 | **-5.2 ± 3.5** | +0.3 ± 2.5 |
| mid · lantern · spirit | +45.9 ± 112.5 | +2.1 ± 23.5 | -0.2 ± 0.5 | -1.0 ± 3.2 | **+4.3 ± 2.2** |
| mid · lantern · angel | +28.3 ± 98.4 | -3.7 ± 28.6 | -0.4 ± 0.8 | -0.3 ± 2.6 | +1.2 ± 1.7 |
| mid · lantern · angel/lantern | +47.4 ± 50.1 | +10.3 ± 27.9 | -0.0 ± 0.7 | +1.0 ± 2.7 | +0.3 ± 1.7 |
| mid · lantern · android | **+206.2 ± 158.2** | **+183.6 ± 103.2** | **+1.9 ± 1.1** | **-7.3 ± 3.5** | **+9.5 ± 2.9** |
| mid · castle · elf | +104.8 ± 419.3 | +34.6 ± 40.8 | +0.0 ± 0.6 | **-3.1 ± 3.0** | +3.6 ± 5.6 |
| mid · castle · beastkin/fox | -116.5 ± 288.3 | +42.5 ± 49.0 | +0.5 ± 0.7 | -2.1 ± 2.4 | -1.2 ± 5.5 |
| mid · castle · beastkin/cat | -48.7 ± 491.2 | **+56.3 ± 48.4** | **+0.7 ± 0.6** | -2.8 ± 3.2 | -2.0 ± 4.8 |
| mid · castle · beastkin/wolf | +9.7 ± 481.9 | +51.5 ± 55.0 | +0.5 ± 0.9 | -1.7 ± 2.7 | -0.6 ± 6.1 |
| mid · castle · beastkin/rabbit | +167.6 ± 509.5 | +27.8 ± 37.7 | +0.1 ± 0.5 | -2.8 ± 4.2 | +1.8 ± 4.7 |
| mid · castle · beastkin/dragon | +178.9 ± 405.2 | **+48.2 ± 33.6** | +0.6 ± 0.7 | +0.3 ± 2.3 | -0.7 ± 6.8 |
| mid · castle · demon | +38.7 ± 514.5 | **+143.1 ± 44.5** | **+1.1 ± 0.5** | **-3.8 ± 3.3** | -0.7 ± 5.7 |
| mid · castle · dwarf | +25.3 ± 414.2 | +36.5 ± 37.7 | +0.6 ± 0.7 | **-3.8 ± 3.1** | -2.4 ± 6.4 |
| mid · castle · spirit | +156.2 ± 409.4 | +17.2 ± 22.1 | +0.2 ± 0.5 | **-3.1 ± 2.9** | +2.0 ± 4.9 |
| mid · castle · angel | +158.4 ± 512.8 | **+44.3 ± 42.7** | +0.4 ± 0.6 | -2.8 ± 3.2 | -0.9 ± 6.2 |
| mid · castle · angel/lantern | +36.1 ± 344.7 | +53.2 ± 55.4 | +0.5 ± 0.8 | -1.0 ± 2.7 | +0.5 ± 5.8 |
| mid · castle · android | **+392.7 ± 383.9** | **+76.1 ± 66.9** | +0.8 ± 0.8 | **-4.2 ± 3.3** | +2.9 ± 6.0 |
| late · tankard · elf | +21.3 ± 132.2 | +6.5 ± 18.1 | -0.0 ± 0.4 | -2.8 ± 3.2 | +0.8 ± 1.9 |
| late · tankard · beastkin/fox | +158.4 ± 196.9 | **+34.0 ± 25.3** | +0.5 ± 0.9 | **-5.2 ± 2.3** | +2.7 ± 4.9 |
| late · tankard · beastkin/cat | **+168.7 ± 157.5** | **+46.2 ± 26.0** | **+0.7 ± 0.6** | **-7.3 ± 3.2** | +2.1 ± 3.6 |
| late · tankard · beastkin/wolf | +152.0 ± 185.7 | **+29.4 ± 27.6** | +0.2 ± 0.8 | -0.3 ± 2.9 | +2.6 ± 4.8 |
| late · tankard · beastkin/rabbit | +109.0 ± 125.6 | **+44.5 ± 19.0** | **+0.5 ± 0.3** | **-5.9 ± 3.5** | +2.1 ± 2.4 |
| late · tankard · beastkin/dragon | +95.9 ± 227.0 | +6.2 ± 17.7 | -0.3 ± 0.6 | **+7.6 ± 4.2** | +3.0 ± 4.7 |
| late · tankard · demon | **+783.8 ± 301.6** | **+451.5 ± 180.7** | **+5.9 ± 2.3** | **-7.8 ± 4.1** | **+6.7 ± 3.4** |
| late · tankard · dwarf | +141.1 ± 147.5 | **+40.6 ± 28.4** | +0.8 ± 0.9 | **-5.9 ± 3.5** | +1.6 ± 4.4 |
| late · tankard · spirit | **+181.8 ± 170.2** | **+40.9 ± 23.0** | +0.0 ± 0.4 | -2.1 ± 3.6 | **+4.4 ± 3.4** |
| late · tankard · angel | +17.1 ± 173.2 | +8.0 ± 12.9 | -0.2 ± 0.5 | -0.7 ± 4.5 | +2.2 ± 4.0 |
| late · tankard · angel/lantern | +116.1 ± 188.9 | +9.8 ± 18.2 | -0.2 ± 0.8 | +0.3 ± 3.8 | +2.4 ± 4.7 |
| late · tankard · android | **+593.8 ± 275.8** | **+216.8 ± 134.3** | **+4.7 ± 2.2** | **-8.0 ± 3.8** | **+8.5 ± 4.3** |
| late · lantern · elf | -5.7 ± 112.2 | **+34.9 ± 19.6** | +0.2 ± 0.3 | -1.4 ± 2.7 | +0.1 ± 1.8 |
| late · lantern · beastkin/fox | -17.9 ± 131.5 | **+37.2 ± 20.4** | **+0.7 ± 0.4** | -2.4 ± 2.8 | -1.9 ± 2.3 |
| late · lantern · beastkin/cat | -43.2 ± 103.4 | **+51.8 ± 27.7** | **+1.1 ± 0.5** | **-3.8 ± 3.3** | -1.5 ± 2.2 |
| late · lantern · beastkin/wolf | +46.6 ± 157.4 | **+53.5 ± 22.9** | **+0.7 ± 0.5** | -1.0 ± 3.2 | -1.2 ± 2.4 |
| late · lantern · beastkin/rabbit | -11.8 ± 134.4 | **+54.0 ± 27.4** | **+0.7 ± 0.4** | -3.1 ± 3.9 | -1.1 ± 2.4 |
| late · lantern · beastkin/dragon | +42.9 ± 156.2 | **+18.8 ± 18.2** | **+0.3 ± 0.3** | **+4.5 ± 4.2** | -1.1 ± 1.6 |
| late · lantern · demon | **+442.3 ± 314.7** | **+515.0 ± 191.4** | **+3.9 ± 1.6** | **-5.6 ± 4.2** | **+3.0 ± 2.7** |
| late · lantern · dwarf | -37.4 ± 156.7 | **+42.8 ± 18.2** | **+0.8 ± 0.5** | -3.5 ± 4.2 | -1.1 ± 2.2 |
| late · lantern · spirit | -42.5 ± 157.7 | +24.3 ± 24.6 | +0.3 ± 0.5 | -2.4 ± 4.0 | -0.4 ± 2.7 |
| late · lantern · angel | -100.8 ± 136.2 | +20.2 ± 20.3 | +0.3 ± 0.5 | +1.4 ± 3.9 | **-2.7 ± 2.1** |
| late · lantern · angel/lantern | -7.4 ± 129.4 | **+47.7 ± 21.5** | **+0.3 ± 0.2** | +0.3 ± 1.2 | -0.0 ± 2.2 |
| late · lantern · android | +238.1 ± 241.0 | **+278.2 ± 138.3** | **+2.5 ± 1.3** | **-5.9 ± 4.3** | **+4.1 ± 2.7** |
| late · castle · elf | +304.4 ± 591.4 | **+84.8 ± 57.9** | +0.2 ± 0.4 | -0.4 ± 0.7 | **+2.0 ± 1.9** |
| late · castle · beastkin/fox | +179.7 ± 521.8 | +45.4 ± 64.1 | +0.4 ± 0.7 | +0.0 ± 0.0 | +0.6 ± 3.3 |
| late · castle · beastkin/cat | +176.3 ± 881.0 | +42.1 ± 74.3 | +0.4 ± 0.7 | +0.0 ± 0.1 | +0.1 ± 2.3 |
| late · castle · beastkin/wolf | -80.4 ± 679.0 | **+90.9 ± 68.9** | **+0.8 ± 0.7** | +0.0 ± 0.1 | -1.9 ± 2.1 |
| late · castle · beastkin/rabbit | -175.6 ± 614.8 | **+76.9 ± 53.5** | **+0.6 ± 0.6** | +0.0 ± 0.1 | -0.1 ± 2.1 |
| late · castle · beastkin/dragon | -385.9 ± 729.7 | **+48.2 ± 42.6** | +0.5 ± 0.6 | +0.0 ± 0.0 | -1.4 ± 2.8 |
| late · castle · demon | -668.2 ± 797.6 | **+148.7 ± 110.0** | +0.7 ± 0.9 | +0.4 ± 0.7 | +0.7 ± 3.7 |
| late · castle · dwarf | +23.6 ± 864.5 | **+37.4 ± 30.7** | +0.3 ± 0.4 | +0.0 ± 0.1 | -1.2 ± 2.9 |
| late · castle · spirit | -280.0 ± 749.2 | +8.9 ± 51.4 | -0.1 ± 0.5 | -0.4 ± 0.7 | +0.7 ± 2.5 |
| late · castle · angel | +110.4 ± 569.4 | +51.4 ± 59.8 | +0.2 ± 0.6 | +0.4 ± 0.7 | +0.0 ± 1.9 |
| late · castle · angel/lantern | -179.3 ± 810.2 | **+73.5 ± 64.3** | +0.2 ± 0.6 | +0.4 ± 0.7 | +0.2 ± 3.3 |
| late · castle · android | -376.8 ± 707.7 | +70.1 ± 88.9 | +0.6 ± 0.8 | +0.0 ± 0.1 | +1.7 ± 2.8 |

---

### race-bedless-compare

Bedless & rare races (Spirit, Android, Demon, Angel, Lantern Angel vs Human) with and without the bedless capacity bonus (fixedStaff true vs false) across Lantern, Atelier (-40% android charge), and Hollow (built-in Tether).

scenario **mid** · 12 seeds from 1 · 273s · 2026-11-20T20:19

| variant | n | houseNet | total | net | testedNet | testedServed | testedRest | testedRech | recharge | staff | served | sat |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| true · mid · lantern · base | 12 | 660 | 865 | 662 | 151 | 5.0 | 5.6 | 0.0 | 0.0 | 7.1 | 19 | 56 |
| true · mid · lantern · demon | 12 | 1,077 | 1,350 | 1,079 | 535 | 8.0 | 0.3 | 0.0 | 0.0 | 7.1 | 21 | 60 |
| true · mid · lantern · angel | 12 | 538 | 785 | 540 | 191 | 5.4 | 5.9 | 0.0 | 0.0 | 7.1 | 18 | 57 |
| true · mid · lantern · angel/lantern | 12 | 733 | 947 | 736 | 188 | 5.0 | 6.3 | 0.0 | 0.0 | 7.1 | 18 | 58 |
| true · mid · lantern · spirit | 12 | 729 | 1000 | 732 | 188 | 5.2 | 6.3 | 0.0 | 0.0 | 7.1 | 20 | 59 |
| true · mid · lantern · android | 12 | 867 | 1,087 | 869 | 326 | 6.7 | 0.0 | 114 | 227 | 7.1 | 22 | 63 |
| true · mid · atelier · base | 12 | 2,414 | 2,425 | 2,425 | 136 | 4.6 | 3.5 | 0.0 | 71 | 7.6 | 20 | 58 |
| true · mid · atelier · demon | 12 | 2,732 | 2,743 | 2,743 | 435 | 6.5 | 0.3 | 0.0 | 71 | 7.5 | 23 | 62 |
| true · mid · atelier · angel | 12 | 1,851 | 1,862 | 1,862 | 156 | 4.7 | 5.9 | 0.0 | 68 | 7.6 | 19 | 57 |
| true · mid · atelier · angel/lantern | 12 | 2,635 | 2,646 | 2,646 | 155 | 4.5 | 3.8 | 0.0 | 76 | 7.5 | 21 | 61 |
| true · mid · atelier · spirit | 12 | 2,587 | 2,598 | 2,598 | 145 | 4.3 | 2.1 | 0.0 | 72 | 7.6 | 21 | 63 |
| true · mid · atelier · android | 12 | 2,328 | 2,339 | 2,339 | 285 | 6.0 | 0.0 | 54 | 181 | 7.6 | 22 | 65 |
| true · mid · hollow · base | 12 | 1,326 | 1,328 | 1,328 | 134 | 3.7 | 5.9 | 0.0 | 0.0 | 7.7 | 17 | 62 |
| true · mid · hollow · demon | 12 | 1,640 | 1,642 | 1,642 | 428 | 5.8 | 0.3 | 0.0 | 0.0 | 7.8 | 19 | 64 |
| true · mid · hollow · angel | 12 | 1,383 | 1,386 | 1,386 | 158 | 3.8 | 5.6 | 0.0 | 0.0 | 7.8 | 17 | 63 |
| true · mid · hollow · angel/lantern | 12 | 1,380 | 1,382 | 1,382 | 182 | 4.1 | 5.6 | 0.0 | 0.0 | 7.8 | 18 | 64 |
| true · mid · hollow · spirit | 12 | 1,385 | 1,388 | 1,388 | 173 | 4.2 | 2.1 | 0.0 | 0.0 | 7.8 | 17 | 65 |
| true · mid · hollow · android | 12 | 1,624 | 1,627 | 1,627 | 291 | 5.5 | 0.0 | 87 | 174 | 7.8 | 20 | 68 |
| true · late · lantern · base | 12 | 1,279 | 1,463 | 1,285 | 181 | 5.0 | 5.9 | 0.0 | 0.0 | 10 | 25 | 61 |
| true · late · lantern · demon | 12 | 1,588 | 1,762 | 1,595 | 611 | 8.3 | 0.3 | 0.0 | 0.0 | 10 | 26 | 63 |
| true · late · lantern · angel | 12 | 1,199 | 1,391 | 1,206 | 209 | 5.3 | 7.3 | 0.0 | 0.0 | 10 | 26 | 58 |
| true · late · lantern · angel/lantern | 12 | 1,261 | 1,459 | 1,268 | 221 | 5.2 | 5.9 | 0.0 | 0.0 | 10 | 26 | 61 |
| true · late · lantern · spirit | 12 | 1,256 | 1,436 | 1,263 | 212 | 5.3 | 3.1 | 0.0 | 0.0 | 10 | 27 | 60 |
| true · late · lantern · android | 12 | 1,444 | 1,605 | 1,450 | 404 | 7.1 | 0.0 | 124 | 249 | 10 | 26 | 64 |
| true · late · atelier · base | 12 | 3,949 | 3,960 | 3,960 | 140 | 4.0 | 2.1 | 0.0 | 81 | 14 | 24 | 61 |
| true · late · atelier · demon | 12 | 4,262 | 4,272 | 4,272 | 381 | 5.2 | 0.3 | 0.0 | 78 | 14 | 24 | 68 |
| true · late · atelier · angel | 12 | 4,076 | 4,086 | 4,086 | 156 | 4.1 | 1.4 | 0.0 | 82 | 14 | 25 | 63 |
| true · late · atelier · angel/lantern | 12 | 4,237 | 4,247 | 4,247 | 158 | 3.9 | 3.1 | 0.0 | 80 | 14 | 25 | 64 |
| true · late · atelier · spirit | 12 | 4,075 | 4,085 | 4,085 | 152 | 3.8 | 0.0 | 0.0 | 83 | 14 | 25 | 65 |
| true · late · atelier · android | 12 | 4,301 | 4,311 | 4,311 | 278 | 4.7 | 0.3 | 46 | 173 | 14 | 25 | 69 |
| true · late · hollow · base | 12 | 3,072 | 3,090 | 3,090 | 258 | 5.0 | 2.8 | 0.0 | 0.0 | 15 | 28 | 63 |
| true · late · hollow · demon | 12 | 3,614 | 3,633 | 3,633 | 599 | 6.4 | 0.0 | 0.0 | 0.0 | 15 | 28 | 67 |
| true · late · hollow · angel | 12 | 3,135 | 3,153 | 3,153 | 297 | 5.0 | 2.8 | 0.0 | 0.0 | 15 | 29 | 65 |
| true · late · hollow · angel/lantern | 12 | 3,228 | 3,246 | 3,246 | 295 | 4.9 | 3.5 | 0.0 | 0.0 | 15 | 29 | 65 |
| true · late · hollow · spirit | 12 | 3,020 | 3,038 | 3,038 | 289 | 5.0 | 3.1 | 0.0 | 0.0 | 15 | 29 | 64 |
| true · late · hollow · android | 12 | 3,417 | 3,435 | 3,435 | 450 | 6.2 | 0.7 | 104 | 209 | 15 | 29 | 69 |
| false · mid · lantern · base | 12 | 796 | 1,010 | 799 | 152 | 4.7 | 4.2 | 0.0 | 0.0 | 11 | 22 | 59 |
| false · mid · lantern · demon | 12 | 1,141 | 1,364 | 1,143 | 517 | 7.9 | 0.0 | 0.0 | 0.0 | 9.0 | 23 | 61 |
| false · mid · lantern · angel | 12 | 696 | 980 | 699 | 196 | 5.2 | 4.5 | 0.0 | 0.0 | 10 | 21 | 58 |
| false · mid · lantern · angel/lantern | 12 | 847 | 1,140 | 849 | 201 | 5.0 | 6.9 | 0.0 | 0.0 | 10 | 21 | 61 |
| false · mid · lantern · spirit | 12 | 845 | 1,144 | 847 | 178 | 4.5 | 4.9 | 0.0 | 0.0 | 12 | 24 | 62 |
| false · mid · lantern · android | 12 | 1,038 | 1,308 | 1,040 | 367 | 6.9 | 0.0 | 112 | 225 | 10 | 25 | 66 |
| false · mid · atelier · base | 12 | 5,107 | 5,118 | 5,118 | 108 | 3.1 | 1.0 | 0.0 | 101 | 14 | 24 | 73 |
| false · mid · atelier · demon | 12 | 4,399 | 4,411 | 4,411 | 312 | 4.6 | 0.7 | 0.0 | 89 | 14 | 23 | 75 |
| false · mid · atelier · angel | 12 | 4,464 | 4,475 | 4,475 | 133 | 3.8 | 0.0 | 0.0 | 95 | 14 | 25 | 70 |
| false · mid · atelier · angel/lantern | 12 | 5,003 | 5,014 | 5,014 | 121 | 3.2 | 1.4 | 0.0 | 99 | 14 | 24 | 76 |
| false · mid · atelier · spirit | 12 | 4,027 | 4,039 | 4,039 | 128 | 3.2 | 1.4 | 0.0 | 88 | 13 | 24 | 72 |
| false · mid · atelier · android | 12 | 4,499 | 4,510 | 4,510 | 227 | 4.1 | 0.0 | 40 | 176 | 14 | 25 | 76 |
| false · mid · hollow · base | 12 | 1,938 | 1,941 | 1,941 | 168 | 4.0 | 2.1 | 0.0 | 0.0 | 14 | 22 | 66 |
| false · mid · hollow · demon | 12 | 2,171 | 2,173 | 2,173 | 488 | 5.6 | 0.7 | 0.0 | 0.0 | 13 | 22 | 68 |
| false · mid · hollow · angel | 12 | 1,946 | 1,949 | 1,949 | 184 | 4.0 | 2.8 | 0.0 | 0.0 | 14 | 23 | 66 |
| false · mid · hollow · angel/lantern | 12 | 1,882 | 1,885 | 1,885 | 191 | 3.9 | 1.7 | 0.0 | 0.0 | 14 | 23 | 67 |
| false · mid · hollow · spirit | 12 | 2,060 | 2,063 | 2,063 | 175 | 3.7 | 1.0 | 0.0 | 0.0 | 16 | 23 | 69 |
| false · mid · hollow · android | 12 | 2,320 | 2,322 | 2,322 | 240 | 4.1 | 0.0 | 72 | 144 | 15 | 23 | 73 |
| false · late · lantern · base | 12 | 1,349 | 1,580 | 1,356 | 181 | 4.8 | 4.9 | 0.0 | 0.0 | 11 | 27 | 62 |
| false · late · lantern · demon | 12 | 1,716 | 1,988 | 1,723 | 631 | 7.8 | 0.7 | 0.0 | 0.0 | 11 | 26 | 66 |
| false · late · lantern · angel | 12 | 1,252 | 1,477 | 1,259 | 227 | 5.4 | 5.2 | 0.0 | 0.0 | 11 | 28 | 59 |
| false · late · lantern · angel/lantern | 12 | 1,315 | 1,540 | 1,321 | 214 | 5.1 | 4.5 | 0.0 | 0.0 | 11 | 27 | 61 |
| false · late · lantern · spirit | 12 | 1,541 | 1,775 | 1,547 | 199 | 4.8 | 3.8 | 0.0 | 0.0 | 13 | 29 | 63 |
| false · late · lantern · android | 12 | 1,690 | 1,965 | 1,697 | 456 | 6.7 | 0.0 | 118 | 237 | 13 | 28 | 70 |
| false · late · atelier · base | 12 | 3,944 | 3,954 | 3,954 | 134 | 3.8 | 2.8 | 0.0 | 80 | 14 | 24 | 61 |
| false · late · atelier · demon | 12 | 4,247 | 4,257 | 4,257 | 406 | 5.4 | 0.3 | 0.0 | 77 | 14 | 24 | 68 |
| false · late · atelier · angel | 12 | 4,152 | 4,163 | 4,163 | 145 | 3.9 | 0.7 | 0.0 | 80 | 14 | 25 | 64 |
| false · late · atelier · angel/lantern | 12 | 4,155 | 4,165 | 4,165 | 159 | 3.8 | 3.1 | 0.0 | 81 | 14 | 24 | 65 |
| false · late · atelier · spirit | 12 | 4,477 | 4,487 | 4,487 | 148 | 3.5 | 0.3 | 0.0 | 78 | 16 | 25 | 68 |
| false · late · atelier · android | 12 | 4,521 | 4,531 | 4,531 | 227 | 4.2 | 0.3 | 40 | 158 | 16 | 25 | 71 |
| false · late · hollow · base | 12 | 3,036 | 3,053 | 3,053 | 262 | 4.9 | 3.5 | 0.0 | 0.0 | 15 | 29 | 64 |
| false · late · hollow · demon | 12 | 3,664 | 3,684 | 3,684 | 601 | 6.3 | 0.0 | 0.0 | 0.0 | 15 | 28 | 68 |
| false · late · hollow · angel | 12 | 3,140 | 3,159 | 3,159 | 302 | 5.0 | 2.8 | 0.0 | 0.0 | 15 | 29 | 65 |
| false · late · hollow · angel/lantern | 12 | 3,193 | 3,212 | 3,212 | 291 | 5.0 | 2.8 | 0.0 | 0.0 | 15 | 29 | 64 |
| false · late · hollow · spirit | 12 | 3,512 | 3,531 | 3,531 | 306 | 5.0 | 1.4 | 0.0 | 0.0 | 17 | 31 | 66 |
| false · late · hollow · android | 12 | 3,265 | 3,282 | 3,282 | 457 | 6.1 | 0.7 | 102 | 204 | 17 | 29 | 70 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ net | Δ testedNet | Δ staff | Δ recharge |
|---|---|---|---|---|---|
| true · mid · lantern · demon | **+417.5 ± 164.0** | **+417.5 ± 164.0** | **+383.7 ± 113.2** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · mid · lantern · angel | -121.5 ± 247.6 | -121.5 ± 247.6 | **+40.6 ± 30.8** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · mid · lantern · angel/lantern | +73.7 ± 91.6 | +73.7 ± 91.6 | **+37.3 ± 26.4** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · mid · lantern · spirit | +69.9 ± 79.1 | +69.9 ± 79.1 | **+37.3 ± 31.7** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · mid · lantern · android | **+207.4 ± 147.5** | **+207.4 ± 147.5** | **+174.9 ± 83.0** | +0.0 ± 0.0 | **+227.0 ± 43.5** |
| true · mid · atelier · demon | +318.3 ± 764.4 | +318.3 ± 764.4 | **+299.8 ± 145.5** | -0.1 ± 0.2 | -0.5 ± 5.1 |
| true · mid · atelier · angel | -562.7 ± 748.4 | -562.7 ± 748.4 | **+20.9 ± 18.2** | +0.0 ± 0.0 | -3.8 ± 11.6 |
| true · mid · atelier · angel/lantern | **+221.3 ± 140.2** | **+221.3 ± 140.2** | **+19.1 ± 16.9** | -0.1 ± 0.2 | **+4.7 ± 3.7** |
| true · mid · atelier · spirit | +172.7 ± 1,119 | +172.7 ± 1,119 | +9.3 ± 34.6 | +0.0 ± 0.0 | +0.6 ± 13.3 |
| true · mid · atelier · android | -86.0 ± 601.3 | -86.0 ± 601.3 | **+149.6 ± 80.5** | +0.0 ± 0.0 | **+109.3 ± 28.6** |
| true · mid · hollow · demon | **+314.2 ± 188.8** | **+314.2 ± 188.8** | **+294.2 ± 117.8** | +0.1 ± 0.3 | +0.0 ± 0.0 |
| true · mid · hollow · angel | +57.7 ± 209.2 | +57.7 ± 209.2 | **+24.5 ± 21.7** | +0.2 ± 0.2 | +0.0 ± 0.0 |
| true · mid · hollow · angel/lantern | +54.0 ± 223.5 | +54.0 ± 223.5 | **+48.3 ± 28.5** | +0.1 ± 0.2 | +0.0 ± 0.0 |
| true · mid · hollow · spirit | +59.6 ± 192.3 | +59.6 ± 192.3 | **+38.9 ± 31.7** | +0.1 ± 0.2 | +0.0 ± 0.0 |
| true · mid · hollow · android | **+298.7 ± 287.0** | **+298.7 ± 287.0** | **+157.6 ± 82.8** | +0.1 ± 0.2 | **+173.8 ± 31.5** |
| true · late · lantern · demon | **+309.3 ± 241.2** | **+309.3 ± 241.2** | **+429.9 ± 179.6** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · late · lantern · angel | -79.4 ± 148.1 | -79.4 ± 148.1 | **+28.5 ± 18.1** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · late · lantern · angel/lantern | -17.1 ± 128.8 | -17.1 ± 128.8 | **+40.3 ± 22.3** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · late · lantern · spirit | -22.2 ± 166.7 | -22.2 ± 166.7 | **+31.7 ± 19.7** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · late · lantern · android | +165.0 ± 205.2 | +165.0 ± 205.2 | **+223.1 ± 122.7** | +0.0 ± 0.0 | **+248.6 ± 60.0** |
| true · late · atelier · demon | +312.6 ± 390.0 | +312.6 ± 390.0 | **+241.1 ± 145.4** | +0.0 ± 0.0 | -2.8 ± 5.4 |
| true · late · atelier · angel | +126.2 ± 403.2 | +126.2 ± 403.2 | +16.2 ± 18.1 | +0.0 ± 0.0 | +1.4 ± 6.9 |
| true · late · atelier · angel/lantern | **+287.3 ± 259.2** | **+287.3 ± 259.2** | **+17.4 ± 16.8** | +0.0 ± 0.0 | -1.0 ± 4.1 |
| true · late · atelier · spirit | +125.7 ± 345.1 | +125.7 ± 345.1 | +11.3 ± 31.7 | +0.0 ± 0.0 | +2.2 ± 4.3 |
| true · late · atelier · android | **+351.3 ± 275.1** | **+351.3 ± 275.1** | **+138.1 ± 121.6** | +0.0 ± 0.0 | **+92.7 ± 30.5** |
| true · late · hollow · demon | +542.2 ± 584.0 | +543.3 ± 583.8 | **+340.8 ± 174.5** | -0.1 ± 0.2 | +0.0 ± 0.0 |
| true · late · hollow · angel | +62.6 ± 357.0 | +63.1 ± 357.2 | **+39.0 ± 26.4** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · late · hollow · angel/lantern | +156.1 ± 608.8 | +156.6 ± 608.8 | +36.6 ± 40.6 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · late · hollow · spirit | -51.7 ± 298.3 | -51.2 ± 298.3 | **+31.4 ± 27.4** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · late · hollow · android | +344.8 ± 430.9 | +345.3 ± 430.7 | **+192.0 ± 129.4** | +0.0 ± 0.0 | **+208.8 ± 55.3** |
| false · mid · lantern · demon | **+344.1 ± 181.5** | **+344.1 ± 181.5** | **+365.0 ± 94.8** | **-1.8 ± 1.2** | +0.0 ± 0.0 |
| false · mid · lantern · angel | -100.1 ± 231.0 | -100.1 ± 231.0 | **+44.2 ± 36.2** | -0.8 ± 1.9 | +0.0 ± 0.0 |
| false · mid · lantern · angel/lantern | +50.8 ± 160.9 | +50.8 ± 160.9 | **+48.9 ± 24.8** | -0.6 ± 1.4 | +0.0 ± 0.0 |
| false · mid · lantern · spirit | +48.3 ± 99.0 | +48.3 ± 99.0 | **+25.9 ± 17.0** | +0.9 ± 1.4 | +0.0 ± 0.0 |
| false · mid · lantern · android | **+241.3 ± 180.2** | **+241.3 ± 180.2** | **+215.1 ± 103.3** | -0.5 ± 0.9 | **+224.9 ± 46.4** |
| false · mid · atelier · demon | **-707.4 ± 623.8** | **-707.4 ± 623.8** | **+203.6 ± 132.0** | -0.1 ± 1.4 | **-12.8 ± 7.3** |
| false · mid · atelier · angel | -643.1 ± 1,188 | -643.1 ± 1,188 | +25.0 ± 30.8 | -0.3 ± 0.7 | -6.4 ± 13.8 |
| false · mid · atelier · angel/lantern | -103.7 ± 887.6 | -103.7 ± 887.6 | +12.4 ± 22.8 | -0.6 ± 0.8 | -2.6 ± 11.4 |
| false · mid · atelier · spirit | **-1,079 ± 853.1** | **-1,079 ± 853.1** | +19.5 ± 34.4 | -0.9 ± 1.4 | **-13.0 ± 11.1** |
| false · mid · atelier · android | -607.6 ± 1,016 | -607.6 ± 1,016 | **+119.0 ± 117.4** | -0.5 ± 1.5 | **+74.2 ± 24.7** |
| false · mid · hollow · demon | +233.0 ± 389.9 | +233.0 ± 389.9 | **+320.5 ± 117.8** | -1.1 ± 1.4 | +0.0 ± 0.0 |
| false · mid · hollow · angel | +8.2 ± 283.4 | +8.2 ± 283.4 | +16.9 ± 29.3 | +0.7 ± 1.2 | +0.0 ± 0.0 |
| false · mid · hollow · angel/lantern | -55.8 ± 390.5 | -55.8 ± 390.5 | **+23.8 ± 21.8** | +0.8 ± 1.9 | +0.0 ± 0.0 |
| false · mid · hollow · spirit | +122.1 ± 494.1 | +122.1 ± 494.1 | +7.1 ± 38.0 | **+1.9 ± 1.6** | +0.0 ± 0.0 |
| false · mid · hollow · android | +381.5 ± 569.7 | +381.5 ± 569.7 | +72.0 ± 93.1 | +1.3 ± 1.7 | **+144.2 ± 35.8** |
| false · late · lantern · demon | **+367.7 ± 314.5** | **+367.7 ± 314.5** | **+449.4 ± 180.4** | +0.1 ± 0.2 | +0.0 ± 0.0 |
| false · late · lantern · angel | -96.5 ± 178.4 | -96.5 ± 178.4 | **+45.8 ± 20.9** | +0.1 ± 0.2 | +0.0 ± 0.0 |
| false · late · lantern · angel/lantern | -34.2 ± 122.7 | -34.2 ± 122.7 | **+33.3 ± 19.8** | +0.1 ± 0.2 | +0.0 ± 0.0 |
| false · late · lantern · spirit | +191.8 ± 214.8 | +191.8 ± 214.8 | +18.3 ± 18.4 | **+2.0 ± 0.2** | +0.0 ± 0.0 |
| false · late · lantern · android | **+341.2 ± 262.3** | **+341.2 ± 262.3** | **+275.4 ± 125.8** | **+2.0 ± 0.2** | **+236.9 ± 63.1** |
| false · late · atelier · demon | +302.9 ± 536.0 | +302.9 ± 536.0 | **+272.2 ± 142.8** | +0.1 ± 0.2 | -2.2 ± 4.5 |
| false · late · atelier · angel | +208.1 ± 316.6 | +208.1 ± 316.6 | +11.0 ± 14.2 | +0.1 ± 0.2 | +0.2 ± 6.1 |
| false · late · atelier · angel/lantern | +210.6 ± 358.6 | +210.6 ± 358.6 | **+24.8 ± 20.5** | +0.1 ± 0.2 | +1.0 ± 4.8 |
| false · late · atelier · spirit | +532.5 ± 749.6 | +532.5 ± 749.6 | +14.6 ± 28.6 | **+1.5 ± 0.5** | -1.4 ± 3.4 |
| false · late · atelier · android | +576.9 ± 821.6 | +576.9 ± 821.6 | +93.4 ± 125.8 | **+1.6 ± 0.4** | **+77.9 ± 29.1** |
| false · late · hollow · demon | **+628.4 ± 580.0** | **+630.3 ± 580.8** | **+338.9 ± 182.9** | -0.1 ± 0.2 | +0.0 ± 0.0 |
| false · late · hollow · angel | +104.1 ± 257.2 | +105.3 ± 258.1 | **+39.8 ± 30.0** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| false · late · hollow · angel/lantern | +157.4 ± 567.4 | +158.5 ± 567.9 | **+29.7 ± 29.0** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| false · late · hollow · spirit | **+476.0 ± 394.4** | **+477.2 ± 395.4** | **+44.2 ± 43.6** | **+1.7 ± 0.3** | +0.0 ± 0.0 |
| false · late · hollow · android | +228.7 ± 330.3 | +228.7 ± 330.3 | **+195.6 ± 123.5** | **+1.7 ± 0.3** | **+203.8 ± 49.4** |

---

### race-roles-phases

Every support role by race across early4/mid/late at the Lantern (1 tested lady in role, others humans, fixed staff count).

scenario **mid** · 10 seeds from 1 · 548s · 2026-11-20T20:04

| variant | n | houseNet | total | net | testedNet | testedRest | testedRech | sat | repGain | prestige | tidy | trouble | props |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| maid · early4 · base | 10 | 700 | 700 | 700 | -26 | 2.5 | 0.0 | 62 | 4.6 | 47 | 71 | 0.7 | 1.0 |
| maid · early4 · elf | 10 | 690 | 690 | 690 | -28 | 3.3 | 0.0 | 63 | 2.6 | 47 | 70 | 0.8 | 0.9 |
| maid · early4 · beastkin/fox | 10 | 690 | 690 | 690 | -19 | 3.3 | 0.0 | 60 | 1.7 | 47 | 68 | 0.9 | 1.1 |
| maid · early4 · beastkin/wolf | 10 | 669 | 669 | 669 | -21 | 2.5 | 0.0 | 61 | 0.7 | 47 | 69 | 0.8 | 1.0 |
| maid · early4 · demon | 10 | 648 | 648 | 648 | -20 | 38 | 0.0 | 59 | 2.7 | 43 | 54 | 0.8 | 1.2 |
| maid · early4 · dwarf | 10 | 705 | 705 | 705 | -27 | 0.8 | 0.0 | 61 | 5.2 | 46 | 69 | 0.8 | 0.8 |
| maid · early4 · spirit | 10 | 669 | 669 | 669 | -26 | 8.3 | 0.0 | 60 | -3.3 | 46 | 68 | 0.8 | 0.8 |
| maid · early4 · angel | 10 | 670 | 670 | 670 | -33 | 0.0 | 0.0 | 60 | 2.2 | 47 | 72 | 0.8 | 0.4 |
| maid · early4 · angel/lantern | 10 | 663 | 663 | 663 | -24 | 5.0 | 0.0 | 60 | 1.2 | 46 | 69 | 0.7 | 0.9 |
| maid · early4 · android | 10 | 647 | 647 | 647 | -81 | 0.8 | 54 | 61 | 3.3 | 48 | 72 | 0.7 | 0.7 |
| maid · mid · base | 10 | 386 | 569 | 386 | -25 | 3.3 | 0.0 | 61 | -3.1 | 46 | 71 | 0.8 | 2.7 |
| maid · mid · elf | 10 | 402 | 577 | 402 | -26 | 2.5 | 0.0 | 62 | -1.5 | 46 | 71 | 0.9 | 2.6 |
| maid · mid · beastkin/fox | 10 | 405 | 537 | 405 | -20 | 0.8 | 0.0 | 61 | -1.6 | 46 | 72 | 0.8 | 2.8 |
| maid · mid · beastkin/wolf | 10 | 422 | 573 | 422 | -17 | 0.8 | 0.0 | 62 | 1.0 | 46 | 71 | 0.8 | 2.7 |
| maid · mid · demon | 10 | 378 | 504 | 378 | -20 | 38 | 0.0 | 57 | -3.0 | 42 | 59 | 0.7 | 2.8 |
| maid · mid · dwarf | 10 | 403 | 545 | 403 | -28 | 0.0 | 0.0 | 61 | -1.2 | 46 | 71 | 0.8 | 2.4 |
| maid · mid · spirit | 10 | 405 | 562 | 405 | -26 | 9.2 | 0.0 | 60 | 3.3 | 46 | 69 | 0.8 | 2.6 |
| maid · mid · angel | 10 | 346 | 460 | 346 | -32 | 0.0 | 0.0 | 58 | -7.0 | 45 | 72 | 0.9 | 2.3 |
| maid · mid · angel/lantern | 10 | 390 | 551 | 390 | -23 | 5.8 | 0.0 | 62 | -4.1 | 46 | 70 | 1.0 | 2.7 |
| maid · mid · android | 10 | 303 | 469 | 303 | -82 | 0.0 | 53 | 60 | -3.6 | 45 | 73 | 0.9 | 2.2 |
| maid · late · base | 10 | 1,493 | 1,728 | 1,501 | -27 | 1.7 | 0.0 | 60 | 13 | 44 | 58 | 0.5 | 4.1 |
| maid · late · elf | 10 | 1,481 | 1,739 | 1,489 | -27 | 0.8 | 0.0 | 62 | 14 | 44 | 56 | 0.7 | 4.0 |
| maid · late · beastkin/fox | 10 | 1,537 | 1,802 | 1,545 | -18 | 1.7 | 0.0 | 63 | 14 | 45 | 55 | 0.7 | 4.0 |
| maid · late · beastkin/wolf | 10 | 1,460 | 1,700 | 1,468 | -18 | 2.6 | 0.0 | 62 | 13 | 43 | 57 | 0.6 | 4.2 |
| maid · late · demon | 10 | 1,334 | 1,585 | 1,342 | -22 | 42 | 0.0 | 58 | 6.2 | 39 | 40 | 0.6 | 4.3 |
| maid · late · dwarf | 10 | 1,397 | 1,628 | 1,405 | -26 | 0.8 | 0.0 | 62 | 15 | 44 | 59 | 0.5 | 4.5 |
| maid · late · spirit | 10 | 1,390 | 1,638 | 1,398 | -27 | 1.8 | 0.0 | 63 | 17 | 45 | 61 | 0.6 | 3.8 |
| maid · late · angel | 10 | 1,411 | 1,684 | 1,418 | -30 | 0.8 | 0.0 | 61 | 15 | 46 | 59 | 0.5 | 4.0 |
| maid · late · angel/lantern | 10 | 1,506 | 1,749 | 1,514 | -23 | 1.0 | 0.0 | 63 | 16 | 45 | 58 | 0.5 | 4.1 |
| maid · late · android | 10 | 1,388 | 1,602 | 1,396 | -82 | 0.0 | 55 | 62 | 16 | 44 | 62 | 0.6 | 4.6 |
| promoter · early4 · base | 10 | 684 | 684 | 684 | -28 | 3.3 | 0.0 | 51 | -13 | 27 | 20 | 0.9 | 0.6 |
| promoter · early4 · elf | 10 | 698 | 698 | 698 | -28 | 3.3 | 0.0 | 51 | -13 | 28 | 19 | 0.9 | 0.6 |
| promoter · early4 · beastkin/fox | 10 | 716 | 716 | 716 | -20 | 5.0 | 0.0 | 51 | -12 | 28 | 19 | 0.9 | 1.0 |
| promoter · early4 · beastkin/wolf | 10 | 729 | 729 | 729 | -20 | 5.0 | 0.0 | 52 | -12 | 29 | 19 | 0.8 | 0.9 |
| promoter · early4 · demon | 10 | 591 | 591 | 591 | -22 | 41 | 0.0 | 52 | -9.6 | 30 | 18 | 0.8 | 1.0 |
| promoter · early4 · dwarf | 10 | 656 | 656 | 656 | -27 | 0.8 | 0.0 | 52 | -14 | 28 | 19 | 0.8 | 0.6 |
| promoter · early4 · spirit | 10 | 697 | 697 | 697 | -27 | 9.2 | 0.0 | 53 | -10 | 29 | 19 | 0.7 | 0.7 |
| promoter · early4 · angel | 10 | 664 | 664 | 664 | -32 | 0.0 | 0.0 | 50 | -14 | 28 | 20 | 0.8 | 0.3 |
| promoter · early4 · angel/lantern | 10 | 714 | 714 | 714 | -27 | 5.0 | 0.0 | 51 | -14 | 27 | 20 | 0.9 | 0.8 |
| promoter · early4 · android | 10 | 630 | 630 | 630 | -79 | 0.8 | 51 | 53 | -13 | 28 | 20 | 0.8 | 0.6 |
| promoter · mid · base | 10 | 418 | 522 | 418 | -25 | 5.0 | 0.0 | 58 | -7.5 | 41 | 60 | 0.9 | 2.3 |
| promoter · mid · elf | 10 | 362 | 494 | 362 | -25 | 5.0 | 0.0 | 60 | -5.5 | 43 | 66 | 0.8 | 2.7 |
| promoter · mid · beastkin/fox | 10 | 400 | 527 | 400 | -20 | 0.8 | 0.0 | 60 | -4.2 | 42 | 57 | 0.8 | 2.6 |
| promoter · mid · beastkin/wolf | 10 | 417 | 501 | 417 | -18 | 1.7 | 0.0 | 59 | -7.3 | 40 | 64 | 0.9 | 2.4 |
| promoter · mid · demon | 10 | 395 | 582 | 395 | -17 | 34 | 0.0 | 61 | -6.0 | 41 | 59 | 0.8 | 2.7 |
| promoter · mid · dwarf | 10 | 399 | 511 | 399 | -28 | 0.0 | 0.0 | 62 | -2.3 | 42 | 60 | 0.8 | 2.3 |
| promoter · mid · spirit | 10 | 411 | 552 | 411 | -26 | 8.3 | 0.0 | 62 | -4.9 | 44 | 62 | 0.9 | 2.2 |
| promoter · mid · angel | 10 | 428 | 531 | 428 | -33 | 0.0 | 0.0 | 60 | -6.0 | 41 | 63 | 0.7 | 1.9 |
| promoter · mid · angel/lantern | 10 | 401 | 520 | 401 | -25 | 4.2 | 0.0 | 59 | -9.1 | 40 | 58 | 0.8 | 2.8 |
| promoter · mid · android | 10 | 324 | 479 | 324 | -78 | 0.0 | 53 | 61 | -3.8 | 43 | 61 | 0.9 | 2.2 |
| promoter · late · base | 10 | 1,418 | 1,641 | 1,426 | -22 | 0.0 | 0.0 | 64 | 15 | 44 | 59 | 0.5 | 4.3 |
| promoter · late · elf | 10 | 1,403 | 1,623 | 1,411 | -24 | 0.0 | 0.0 | 63 | 13 | 45 | 60 | 0.5 | 4.3 |
| promoter · late · beastkin/fox | 10 | 1,440 | 1,678 | 1,448 | -21 | 0.9 | 0.0 | 64 | 15 | 44 | 59 | 0.5 | 4.0 |
| promoter · late · beastkin/wolf | 10 | 1,498 | 1,729 | 1,506 | -21 | 0.0 | 0.0 | 64 | 16 | 45 | 59 | 0.5 | 4.3 |
| promoter · late · demon | 10 | 1,385 | 1,626 | 1,393 | -16 | 38 | 0.0 | 63 | 14 | 43 | 58 | 0.5 | 4.4 |
| promoter · late · dwarf | 10 | 1,416 | 1,658 | 1,423 | -29 | 0.8 | 0.0 | 63 | 13 | 43 | 57 | 0.6 | 4.1 |
| promoter · late · spirit | 10 | 1,422 | 1,686 | 1,430 | -27 | 3.5 | 0.0 | 64 | 16 | 45 | 60 | 0.6 | 4.3 |
| promoter · late · angel | 10 | 1,552 | 1,770 | 1,559 | -31 | 0.0 | 0.0 | 63 | 13 | 44 | 59 | 0.6 | 4.0 |
| promoter · late · angel/lantern | 10 | 1,433 | 1,676 | 1,441 | -21 | 1.7 | 0.0 | 63 | 14 | 43 | 57 | 0.4 | 4.3 |
| promoter · late · android | 10 | 1,399 | 1,653 | 1,407 | -79 | 0.0 | 53 | 63 | 15 | 43 | 60 | 0.5 | 4.3 |
| security · early4 · base | 10 | 598 | 598 | 598 | -26 | 5.0 | 0.0 | 53 | -7.4 | 33 | 23 | 0.3 | 0.8 |
| security · early4 · elf | 10 | 575 | 575 | 575 | -27 | 3.3 | 0.0 | 54 | -7.0 | 33 | 24 | 0.2 | 0.9 |
| security · early4 · beastkin/fox | 10 | 564 | 564 | 564 | -19 | 5.0 | 0.0 | 54 | -7.5 | 32 | 23 | 0.4 | 1.2 |
| security · early4 · beastkin/wolf | 10 | 589 | 589 | 589 | -20 | 3.3 | 0.0 | 53 | -7.1 | 33 | 23 | 0.3 | 0.9 |
| security · early4 · demon | 10 | 506 | 506 | 506 | -21 | 41 | 0.0 | 53 | -9.8 | 32 | 22 | 0.4 | 1.1 |
| security · early4 · dwarf | 10 | 558 | 558 | 558 | -29 | 0.8 | 0.0 | 53 | -9.1 | 33 | 24 | 0.3 | 0.7 |
| security · early4 · spirit | 10 | 581 | 581 | 581 | -28 | 13 | 0.0 | 54 | -6.3 | 33 | 24 | 0.4 | 0.9 |
| security · early4 · angel | 10 | 610 | 610 | 610 | -32 | 0.0 | 0.0 | 55 | -6.3 | 32 | 24 | 0.3 | 0.4 |
| security · early4 · angel/lantern | 10 | 617 | 617 | 617 | -27 | 7.5 | 0.0 | 54 | -6.6 | 33 | 22 | 0.3 | 0.9 |
| security · early4 · android | 10 | 531 | 531 | 531 | -82 | 0.8 | 54 | 54 | -6.6 | 34 | 23 | 0.4 | 0.8 |
| security · mid · base | 10 | 335 | 415 | 335 | -25 | 4.2 | 0.0 | 63 | -0.0 | 46 | 70 | 0.3 | 2.5 |
| security · mid · elf | 10 | 321 | 418 | 321 | -27 | 1.7 | 0.0 | 62 | -1.7 | 46 | 70 | 0.3 | 2.1 |
| security · mid · beastkin/fox | 10 | 276 | 423 | 276 | -18 | 2.5 | 0.0 | 66 | 1.8 | 48 | 71 | 0.3 | 3.0 |
| security · mid · beastkin/wolf | 10 | 353 | 481 | 353 | -21 | 0.0 | 0.0 | 65 | -1.2 | 46 | 69 | 0.2 | 3.0 |
| security · mid · demon | 10 | 319 | 461 | 319 | -20 | 40 | 0.0 | 64 | -3.7 | 46 | 69 | 0.6 | 2.6 |
| security · mid · dwarf | 10 | 336 | 453 | 336 | -25 | 0.0 | 0.0 | 64 | 2.7 | 47 | 71 | 0.3 | 2.6 |
| security · mid · spirit | 10 | 319 | 435 | 319 | -26 | 8.3 | 0.0 | 64 | -3.9 | 46 | 70 | 0.4 | 2.5 |
| security · mid · angel | 10 | 277 | 413 | 277 | -32 | 0.0 | 0.0 | 62 | -2.2 | 46 | 70 | 0.4 | 1.9 |
| security · mid · angel/lantern | 10 | 314 | 415 | 314 | -24 | 4.2 | 0.0 | 65 | 2.2 | 47 | 69 | 0.3 | 2.8 |
| security · mid · android | 10 | 301 | 421 | 301 | -81 | 0.0 | 53 | 64 | 2.5 | 47 | 68 | 0.3 | 2.1 |
| security · late · base | 10 | 1,504 | 1,772 | 1,512 | -26 | 1.0 | 0.0 | 63 | 13 | 46 | 56 | 0.1 | 4.6 |
| security · late · elf | 10 | 1,462 | 1,721 | 1,470 | -28 | 1.7 | 0.0 | 63 | 14 | 46 | 60 | 0.1 | 4.5 |
| security · late · beastkin/fox | 10 | 1,544 | 1,778 | 1,552 | -22 | 0.0 | 0.0 | 64 | 14 | 45 | 55 | 0.1 | 4.5 |
| security · late · beastkin/wolf | 10 | 1,455 | 1,685 | 1,463 | -22 | 0.0 | 0.0 | 65 | 18 | 47 | 60 | 0.1 | 4.2 |
| security · late · demon | 10 | 1,474 | 1,698 | 1,482 | -24 | 42 | 0.0 | 63 | 10 | 43 | 55 | 0.4 | 4.7 |
| security · late · dwarf | 10 | 1,516 | 1,771 | 1,524 | -31 | 0.8 | 0.0 | 66 | 17 | 47 | 60 | 0.0 | 4.0 |
| security · late · spirit | 10 | 1,437 | 1,704 | 1,445 | -26 | 1.7 | 0.0 | 64 | 15 | 45 | 59 | 0.3 | 4.0 |
| security · late · angel | 10 | 1,453 | 1,717 | 1,461 | -33 | 0.0 | 0.0 | 64 | 17 | 47 | 60 | 0.1 | 3.8 |
| security · late · angel/lantern | 10 | 1,488 | 1,721 | 1,496 | -27 | 0.8 | 0.0 | 63 | 14 | 45 | 55 | 0.1 | 4.0 |
| security · late · android | 10 | 1,309 | 1,557 | 1,317 | -80 | 0.0 | 55 | 62 | 13 | 44 | 56 | 0.3 | 4.2 |
| bartender · early4 · base | 10 | 470 | 713 | 470 | 11 | 5.0 | 0.0 | 57 | -4.9 | 30 | 22 | 0.8 | 1.0 |
| bartender · early4 · elf | 10 | 441 | 713 | 441 | 12 | 5.8 | 0.0 | 57 | -6.0 | 31 | 21 | 0.8 | 1.1 |
| bartender · early4 · beastkin/fox | 10 | 534 | 746 | 534 | 21 | 5.0 | 0.0 | 57 | -3.9 | 30 | 20 | 0.6 | 0.9 |
| bartender · early4 · beastkin/wolf | 10 | 462 | 702 | 462 | 18 | 2.5 | 0.0 | 57 | -4.8 | 31 | 20 | 0.8 | 0.8 |
| bartender · early4 · demon | 10 | 391 | 628 | 391 | 5.2 | 38 | 0.0 | 56 | -8.8 | 30 | 19 | 0.7 | 1.5 |
| bartender · early4 · dwarf | 10 | 495 | 775 | 495 | 18 | 0.8 | 0.0 | 58 | -1.9 | 31 | 20 | 0.9 | 0.8 |
| bartender · early4 · spirit | 10 | 416 | 640 | 416 | 8.3 | 11 | 0.0 | 55 | -8.6 | 30 | 21 | 0.9 | 1.1 |
| bartender · early4 · angel | 10 | 501 | 739 | 501 | 11 | 0.0 | 0.0 | 58 | -0.5 | 32 | 21 | 0.7 | 0.5 |
| bartender · early4 · angel/lantern | 10 | 514 | 757 | 514 | 17 | 5.8 | 0.0 | 57 | -3.8 | 30 | 20 | 0.8 | 0.9 |
| bartender · early4 · android | 10 | 433 | 646 | 433 | -40 | 0.8 | 52 | 57 | -6.0 | 31 | 22 | 0.8 | 0.8 |
| bartender · mid · base | 10 | 362 | 554 | 362 | 43 | 3.3 | 0.0 | 65 | -7.5 | 47 | 71 | 0.8 | 1.7 |
| bartender · mid · elf | 10 | 331 | 532 | 331 | 44 | 3.3 | 0.0 | 65 | -4.8 | 46 | 73 | 0.8 | 1.9 |
| bartender · mid · beastkin/fox | 10 | 390 | 641 | 390 | 52 | 1.7 | 0.0 | 67 | 1.6 | 49 | 71 | 0.9 | 2.4 |
| bartender · mid · beastkin/wolf | 10 | 360 | 584 | 360 | 53 | 0.8 | 0.0 | 65 | -2.4 | 46 | 70 | 0.9 | 2.4 |
| bartender · mid · demon | 10 | 285 | 426 | 285 | 10 | 38 | 0.0 | 64 | -8.6 | 44 | 70 | 0.8 | 2.8 |
| bartender · mid · dwarf | 10 | 360 | 606 | 360 | 62 | 0.0 | 0.0 | 67 | -1.7 | 47 | 67 | 0.9 | 2.0 |
| bartender · mid · spirit | 10 | 392 | 560 | 392 | 43 | 5.8 | 0.0 | 65 | 0.5 | 47 | 72 | 0.9 | 2.1 |
| bartender · mid · angel | 10 | 303 | 543 | 303 | 48 | 0.0 | 0.0 | 66 | -9.3 | 47 | 70 | 0.7 | 1.9 |
| bartender · mid · angel/lantern | 10 | 398 | 585 | 398 | 54 | 1.7 | 0.0 | 65 | -2.5 | 46 | 69 | 0.9 | 2.4 |
| bartender · mid · android | 10 | 316 | 513 | 316 | -2.2 | 0.0 | 54 | 65 | -1.3 | 47 | 73 | 0.9 | 2.2 |
| bartender · late · base | 10 | 1,285 | 1,532 | 1,293 | 90 | 2.6 | 0.0 | 64 | 12 | 45 | 59 | 0.6 | 4.9 |
| bartender · late · elf | 10 | 1,351 | 1,595 | 1,359 | 87 | 4.5 | 0.0 | 64 | 12 | 45 | 59 | 0.5 | 4.6 |
| bartender · late · beastkin/fox | 10 | 1,333 | 1,575 | 1,341 | 95 | 0.0 | 0.0 | 61 | 12 | 43 | 59 | 0.7 | 4.8 |
| bartender · late · beastkin/wolf | 10 | 1,300 | 1,546 | 1,307 | 84 | 1.0 | 0.0 | 61 | 12 | 43 | 58 | 0.7 | 4.8 |
| bartender · late · demon | 10 | 1,269 | 1,524 | 1,277 | 39 | 40 | 0.0 | 64 | 16 | 46 | 58 | 0.6 | 4.8 |
| bartender · late · dwarf | 10 | 1,331 | 1,576 | 1,338 | 95 | 0.8 | 0.0 | 63 | 12 | 44 | 56 | 0.6 | 4.5 |
| bartender · late · spirit | 10 | 1,221 | 1,476 | 1,228 | 75 | 1.8 | 0.0 | 62 | 11 | 45 | 60 | 0.6 | 4.6 |
| bartender · late · angel | 10 | 1,374 | 1,615 | 1,382 | 81 | 0.0 | 0.0 | 64 | 15 | 46 | 59 | 0.5 | 4.0 |
| bartender · late · angel/lantern | 10 | 1,194 | 1,449 | 1,202 | 85 | 6.1 | 0.0 | 62 | 13 | 45 | 60 | 0.5 | 5.1 |
| bartender · late · android | 10 | 1,151 | 1,402 | 1,159 | 28 | 0.0 | 57 | 61 | 9.1 | 43 | 61 | 0.6 | 4.7 |
| host · early4 · base | 10 | 802 | 802 | 802 | -17 | 38 | 0.0 | 59 | -7.6 | 31 | 18 | 0.7 | 0.8 |
| host · early4 · elf | 10 | 812 | 812 | 812 | -17 | 40 | 0.0 | 60 | -6.5 | 32 | 18 | 0.6 | 0.9 |
| host · early4 · beastkin/fox | 10 | 759 | 759 | 759 | -8.0 | 36 | 0.0 | 59 | -3.2 | 31 | 17 | 0.8 | 1.3 |
| host · early4 · beastkin/wolf | 10 | 773 | 773 | 773 | -6.1 | 34 | 0.0 | 60 | -3.9 | 31 | 18 | 0.8 | 1.1 |
| host · early4 · demon | 10 | 769 | 769 | 769 | -12 | 56 | 0.0 | 59 | -5.9 | 32 | 18 | 0.7 | 1.2 |
| host · early4 · dwarf | 10 | 943 | 943 | 943 | -14 | 25 | 0.0 | 63 | 1.1 | 30 | 17 | 0.8 | 0.9 |
| host · early4 · spirit | 10 | 788 | 788 | 788 | -17 | 41 | 0.0 | 60 | -2.5 | 31 | 19 | 0.8 | 0.9 |
| host · early4 · angel | 10 | 922 | 922 | 922 | -18 | 39 | 0.0 | 64 | -0.6 | 31 | 18 | 0.7 | 0.6 |
| host · early4 · angel/lantern | 10 | 826 | 826 | 826 | -14 | 38 | 0.0 | 60 | -1.3 | 32 | 17 | 0.8 | 0.9 |
| host · early4 · android | 10 | 921 | 921 | 921 | -107 | 0.8 | 115 | 67 | 6.2 | 30 | 16 | 0.9 | 1.5 |
| host · mid · base | 10 | 313 | 420 | 313 | -16 | 34 | 0.0 | 63 | -9.3 | 40 | 59 | 0.7 | 2.7 |
| host · mid · elf | 10 | 335 | 438 | 335 | -16 | 35 | 0.0 | 66 | -1.8 | 43 | 65 | 0.8 | 2.9 |
| host · mid · beastkin/fox | 10 | 412 | 495 | 412 | -6.1 | 35 | 0.0 | 66 | -7.4 | 42 | 58 | 0.7 | 3.3 |
| host · mid · beastkin/wolf | 10 | 337 | 467 | 337 | -7.1 | 30 | 0.0 | 66 | -4.1 | 42 | 57 | 0.8 | 2.6 |
| host · mid · demon | 10 | 341 | 494 | 341 | -6.3 | 52 | 0.0 | 67 | -4.3 | 43 | 64 | 0.7 | 3.0 |
| host · mid · dwarf | 10 | 410 | 559 | 410 | -8.2 | 22 | 0.0 | 68 | 2.2 | 42 | 57 | 0.8 | 3.4 |
| host · mid · spirit | 10 | 317 | 469 | 317 | -18 | 36 | 0.0 | 63 | -3.3 | 41 | 58 | 0.7 | 3.2 |
| host · mid · angel | 10 | 353 | 430 | 353 | -16 | 37 | 0.0 | 66 | -6.1 | 42 | 61 | 0.7 | 2.5 |
| host · mid · angel/lantern | 10 | 377 | 498 | 377 | -13 | 38 | 0.0 | 66 | -5.3 | 43 | 60 | 0.7 | 2.8 |
| host · mid · android | 10 | 351 | 473 | 351 | -104 | 0.0 | 117 | 71 | 2.5 | 38 | 50 | 1.1 | 3.6 |
| host · late · base | 10 | 1,347 | 1,610 | 1,355 | -9.6 | 37 | 0.0 | 65 | 17 | 43 | 57 | 0.4 | 4.5 |
| host · late · elf | 10 | 1,398 | 1,669 | 1,406 | -14 | 37 | 0.0 | 65 | 12 | 42 | 52 | 0.6 | 4.2 |
| host · late · beastkin/fox | 10 | 1,352 | 1,601 | 1,360 | -1.3 | 31 | 0.0 | 64 | 11 | 41 | 52 | 0.5 | 4.7 |
| host · late · beastkin/wolf | 10 | 1,551 | 1,790 | 1,559 | -3.7 | 28 | 0.0 | 67 | 17 | 42 | 58 | 0.6 | 4.4 |
| host · late · demon | 10 | 1,470 | 1,673 | 1,478 | 2.9 | 52 | 0.0 | 66 | 15 | 43 | 61 | 0.5 | 4.8 |
| host · late · dwarf | 10 | 1,401 | 1,642 | 1,409 | -8.6 | 14 | 0.0 | 66 | 16 | 40 | 53 | 0.5 | 4.2 |
| host · late · spirit | 10 | 1,460 | 1,700 | 1,468 | -16 | 36 | 0.0 | 66 | 13 | 42 | 56 | 0.7 | 4.2 |
| host · late · angel | 10 | 1,444 | 1,706 | 1,452 | -10 | 38 | 0.0 | 67 | 17 | 43 | 57 | 0.5 | 4.2 |
| host · late · angel/lantern | 10 | 1,449 | 1,720 | 1,457 | -14 | 35 | 0.0 | 67 | 14 | 45 | 59 | 0.6 | 4.2 |
| host · late · android | 10 | 1,623 | 1,885 | 1,631 | -104 | 0.0 | 127 | 71 | 19 | 39 | 53 | 0.6 | 4.7 |
| attendant · early4 · base | 10 | 531 | 531 | 531 | 11 | 9.2 | 0.0 | 52 | -8.7 | 38 | 22 | 0.7 | 0.9 |
| attendant · early4 · elf | 10 | 566 | 566 | 566 | 8.0 | 7.5 | 0.0 | 54 | -6.6 | 37 | 20 | 0.7 | 0.8 |
| attendant · early4 · beastkin/fox | 10 | 529 | 529 | 529 | 18 | 8.3 | 0.0 | 53 | -6.5 | 36 | 21 | 0.7 | 1.0 |
| attendant · early4 · beastkin/wolf | 10 | 569 | 569 | 569 | 22 | 9.2 | 0.0 | 53 | -5.6 | 36 | 19 | 0.7 | 1.0 |
| attendant · early4 · demon | 10 | 581 | 581 | 581 | 34 | 24 | 0.0 | 55 | -4.8 | 36 | 20 | 0.6 | 1.3 |
| attendant · early4 · dwarf | 10 | 578 | 578 | 578 | 23 | 2.5 | 0.0 | 53 | -6.6 | 38 | 20 | 0.7 | 0.8 |
| attendant · early4 · spirit | 10 | 555 | 555 | 555 | 3.5 | 9.2 | 0.0 | 54 | -4.8 | 37 | 23 | 0.6 | 0.7 |
| attendant · early4 · angel | 10 | 521 | 521 | 521 | 5.8 | 8.3 | 0.0 | 52 | -9.9 | 37 | 21 | 0.7 | 0.4 |
| attendant · early4 · angel/lantern | 10 | 570 | 570 | 570 | 9.7 | 10 | 0.0 | 53 | -5.6 | 37 | 22 | 0.7 | 0.8 |
| attendant · early4 · android | 10 | 537 | 537 | 537 | -26 | 0.8 | 59 | 54 | -3.5 | 36 | 21 | 0.7 | 0.8 |
| attendant · mid · base | 10 | 295 | 422 | 295 | 29 | 34 | 0.0 | 60 | -3.1 | 47 | 64 | 0.8 | 2.1 |
| attendant · mid · elf | 10 | 270 | 381 | 270 | 38 | 32 | 0.0 | 57 | -5.9 | 46 | 63 | 0.8 | 2.0 |
| attendant · mid · beastkin/fox | 10 | 250 | 375 | 250 | 39 | 37 | 0.0 | 60 | -4.4 | 49 | 69 | 0.7 | 2.0 |
| attendant · mid · beastkin/wolf | 10 | 249 | 398 | 249 | 40 | 37 | 0.0 | 60 | -2.5 | 48 | 66 | 0.8 | 2.2 |
| attendant · mid · demon | 10 | 296 | 383 | 296 | 50 | 42 | 0.0 | 60 | -5.1 | 47 | 68 | 0.6 | 2.4 |
| attendant · mid · dwarf | 10 | 301 | 393 | 301 | 47 | 26 | 0.0 | 60 | -0.9 | 50 | 69 | 0.8 | 2.0 |
| attendant · mid · spirit | 10 | 372 | 488 | 372 | 39 | 31 | 0.0 | 61 | 2.0 | 48 | 64 | 0.8 | 2.1 |
| attendant · mid · angel | 10 | 306 | 400 | 306 | 46 | 23 | 0.0 | 58 | -6.7 | 46 | 61 | 0.9 | 2.4 |
| attendant · mid · angel/lantern | 10 | 292 | 397 | 292 | 34 | 33 | 0.0 | 59 | -5.7 | 45 | 63 | 0.7 | 2.2 |
| attendant · mid · android | 10 | 181 | 329 | 181 | 15 | 39 | 48 | 61 | -5.1 | 48 | 72 | 0.7 | 2.2 |
| attendant · late · base | 10 | 1,366 | 1,588 | 1,374 | 45 | 10 | 0.0 | 62 | 12 | 44 | 57 | 0.6 | 4.8 |
| attendant · late · elf | 10 | 1,226 | 1,462 | 1,234 | 59 | 9.3 | 0.0 | 61 | 14 | 45 | 58 | 0.5 | 4.6 |
| attendant · late · beastkin/fox | 10 | 1,336 | 1,577 | 1,344 | 65 | 5.8 | 0.0 | 62 | 11 | 45 | 55 | 0.5 | 4.1 |
| attendant · late · beastkin/wolf | 10 | 1,243 | 1,485 | 1,251 | 82 | 3.3 | 0.0 | 60 | 11 | 45 | 54 | 0.5 | 4.8 |
| attendant · late · demon | 10 | 1,278 | 1,496 | 1,286 | 80 | 29 | 0.0 | 62 | 11 | 45 | 58 | 0.3 | 4.7 |
| attendant · late · dwarf | 10 | 1,343 | 1,586 | 1,351 | 74 | 3.3 | 0.0 | 62 | 11 | 44 | 55 | 0.6 | 4.1 |
| attendant · late · spirit | 10 | 1,346 | 1,588 | 1,354 | 56 | 7.5 | 0.0 | 63 | 14 | 43 | 58 | 0.7 | 4.5 |
| attendant · late · angel | 10 | 1,204 | 1,436 | 1,212 | 57 | 9.2 | 0.0 | 61 | 14 | 45 | 58 | 0.5 | 4.2 |
| attendant · late · angel/lantern | 10 | 1,352 | 1,590 | 1,360 | 65 | 8.5 | 0.0 | 62 | 11 | 45 | 53 | 0.6 | 4.6 |
| attendant · late · android | 10 | 1,315 | 1,537 | 1,323 | 58 | 0.0 | 72 | 64 | 13 | 43 | 55 | 0.6 | 4.4 |
| madame · early4 · base | 10 | 735 | 735 | 735 | -21 | 2.5 | 0.0 | 60 | -3.6 | 29 | 18 | 0.8 | 0.5 |
| madame · early4 · elf | 10 | 746 | 746 | 746 | -19 | 5.8 | 0.0 | 60 | -2.3 | 29 | 19 | 0.8 | 0.7 |
| madame · early4 · beastkin/fox | 10 | 758 | 758 | 758 | -16 | 4.2 | 0.0 | 59 | -5.2 | 29 | 20 | 0.7 | 1.0 |
| madame · early4 · beastkin/wolf | 10 | 748 | 748 | 748 | -16 | 3.3 | 0.0 | 58 | -0.2 | 29 | 19 | 0.7 | 0.8 |
| madame · early4 · demon | 10 | 748 | 748 | 748 | -17 | 38 | 0.0 | 58 | -4.3 | 28 | 17 | 0.7 | 0.9 |
| madame · early4 · dwarf | 10 | 804 | 804 | 804 | -22 | 0.8 | 0.0 | 59 | -2.8 | 29 | 19 | 0.8 | 0.6 |
| madame · early4 · spirit | 10 | 747 | 747 | 747 | -20 | 10 | 0.0 | 59 | -1.6 | 30 | 21 | 0.7 | 0.7 |
| madame · early4 · angel | 10 | 781 | 781 | 781 | -24 | 0.0 | 0.0 | 58 | -1.5 | 29 | 19 | 0.8 | 0.2 |
| madame · early4 · angel/lantern | 10 | 716 | 716 | 716 | -17 | 3.3 | 0.0 | 58 | -3.6 | 29 | 20 | 0.8 | 0.7 |
| madame · early4 · android | 10 | 702 | 702 | 702 | -73 | 0.8 | 52 | 59 | -3.4 | 29 | 20 | 0.7 | 0.6 |
| madame · mid · base | 10 | 354 | 623 | 354 | 21 | 12 | 0.0 | 61 | -5.2 | 40 | 60 | 0.9 | 2.4 |
| madame · mid · elf | 10 | 393 | 655 | 393 | 29 | 13 | 0.0 | 62 | -7.2 | 40 | 60 | 0.9 | 2.7 |
| madame · mid · beastkin/fox | 10 | 328 | 624 | 328 | 30 | 10 | 0.0 | 59 | -3.1 | 40 | 62 | 0.9 | 2.6 |
| madame · mid · beastkin/wolf | 10 | 334 | 640 | 334 | 32 | 6.7 | 0.0 | 59 | -4.5 | 40 | 61 | 0.9 | 2.6 |
| madame · mid · demon | 10 | 388 | 580 | 388 | 6.1 | 38 | 0.0 | 60 | -4.4 | 38 | 54 | 0.8 | 2.6 |
| madame · mid · dwarf | 10 | 338 | 657 | 338 | 24 | 0.0 | 0.0 | 59 | -3.2 | 38 | 58 | 0.9 | 2.9 |
| madame · mid · spirit | 10 | 387 | 638 | 387 | 20 | 20 | 0.0 | 62 | -5.3 | 39 | 57 | 0.9 | 2.1 |
| madame · mid · angel | 10 | 302 | 593 | 302 | 19 | 6.7 | 0.0 | 60 | -5.6 | 40 | 62 | 0.8 | 2.3 |
| madame · mid · angel/lantern | 10 | 389 | 652 | 389 | 25 | 14 | 0.0 | 61 | -2.2 | 40 | 55 | 0.8 | 2.5 |
| madame · mid · android | 10 | 315 | 612 | 315 | -28 | 0.0 | 66 | 62 | -0.0 | 39 | 56 | 0.9 | 2.5 |
| madame · late · base | 10 | 1,171 | 1,675 | 1,179 | 15 | 5.9 | 0.0 | 65 | 14 | 42 | 55 | 0.5 | 5.1 |
| madame · late · elf | 10 | 1,202 | 1,703 | 1,210 | 11 | 6.7 | 0.0 | 65 | 12 | 39 | 54 | 0.6 | 4.6 |
| madame · late · beastkin/fox | 10 | 1,205 | 1,735 | 1,213 | 23 | 1.7 | 0.0 | 65 | 14 | 41 | 56 | 0.5 | 4.6 |
| madame · late · beastkin/wolf | 10 | 1,071 | 1,596 | 1,079 | 28 | 2.5 | 0.0 | 64 | 17 | 42 | 57 | 0.4 | 5.1 |
| madame · late · demon | 10 | 1,294 | 1,601 | 1,302 | 0.0 | 41 | 0.0 | 63 | 13 | 39 | 53 | 0.6 | 4.5 |
| madame · late · dwarf | 10 | 1,199 | 1,732 | 1,207 | 7.6 | 0.8 | 0.0 | 64 | 12 | 39 | 54 | 0.7 | 4.3 |
| madame · late · spirit | 10 | 1,104 | 1,578 | 1,112 | 12 | 11 | 0.0 | 64 | 16 | 40 | 57 | 0.6 | 4.6 |
| madame · late · angel | 10 | 1,138 | 1,654 | 1,146 | 13 | 3.3 | 0.0 | 64 | 12 | 39 | 52 | 0.6 | 4.2 |
| madame · late · angel/lantern | 10 | 1,136 | 1,631 | 1,144 | 15 | 7.6 | 0.0 | 64 | 14 | 41 | 56 | 0.7 | 4.3 |
| madame · late · android | 10 | 1,031 | 1,570 | 1,039 | -40 | 0.0 | 60 | 64 | 11 | 37 | 50 | 0.7 | 4.8 |
| chapel · early4 · base | 10 | 434 | 434 | 434 | -22 | 2.5 | 0.0 | 53 | -12 | 33 | 22 | 0.7 | 0.9 |
| chapel · early4 · elf | 10 | 440 | 440 | 440 | -20 | 4.2 | 0.0 | 55 | -11 | 33 | 23 | 0.8 | 0.8 |
| chapel · early4 · beastkin/fox | 10 | 463 | 463 | 463 | -16 | 1.7 | 0.0 | 55 | -9.7 | 32 | 22 | 0.7 | 1.0 |
| chapel · early4 · beastkin/wolf | 10 | 453 | 453 | 453 | -16 | 0.8 | 0.0 | 53 | -12 | 32 | 21 | 0.8 | 1.0 |
| chapel · early4 · demon | 10 | 429 | 429 | 429 | -19 | 32 | 0.0 | 54 | -11 | 33 | 23 | 0.6 | 1.4 |
| chapel · early4 · dwarf | 10 | 465 | 465 | 465 | -22 | 0.8 | 0.0 | 53 | -7.4 | 33 | 22 | 0.8 | 0.8 |
| chapel · early4 · spirit | 10 | 492 | 492 | 492 | -22 | 2.5 | 0.0 | 54 | -8.0 | 33 | 23 | 0.7 | 0.8 |
| chapel · early4 · angel | 10 | 504 | 504 | 504 | -17 | 0.0 | 0.0 | 54 | -8.6 | 37 | 24 | 0.7 | 0.5 |
| chapel · early4 · angel/lantern | 10 | 538 | 538 | 538 | -7.7 | 3.3 | 0.0 | 52 | -6.0 | 35 | 21 | 0.8 | 1.4 |
| chapel · early4 · android | 10 | 434 | 434 | 434 | -67 | 0.8 | 45 | 54 | -11 | 33 | 23 | 0.8 | 1.0 |
| chapel · mid · base | 10 | 237 | 365 | 237 | -19 | 0.0 | 0.0 | 63 | -5.3 | 45 | 71 | 0.6 | 2.3 |
| chapel · mid · elf | 10 | 208 | 361 | 208 | -17 | 0.8 | 0.0 | 63 | -6.7 | 45 | 69 | 0.7 | 2.7 |
| chapel · mid · beastkin/fox | 10 | 243 | 394 | 243 | -16 | 0.0 | 0.0 | 65 | -1.0 | 46 | 69 | 0.7 | 2.4 |
| chapel · mid · beastkin/wolf | 10 | 300 | 413 | 300 | -14 | 0.0 | 0.0 | 64 | -2.6 | 45 | 67 | 0.7 | 2.5 |
| chapel · mid · demon | 10 | 158 | 307 | 158 | -15 | 24 | 0.0 | 62 | -10 | 42 | 69 | 0.7 | 3.2 |
| chapel · mid · dwarf | 10 | 218 | 351 | 218 | -22 | 0.0 | 0.0 | 63 | -8.9 | 45 | 70 | 0.7 | 2.2 |
| chapel · mid · spirit | 10 | 214 | 324 | 214 | -19 | 0.8 | 0.0 | 61 | -4.7 | 45 | 70 | 0.8 | 2.3 |
| chapel · mid · angel | 10 | 315 | 458 | 315 | -16 | 0.0 | 0.0 | 64 | -2.7 | 48 | 67 | 0.8 | 1.9 |
| chapel · mid · angel/lantern | 10 | 290 | 403 | 290 | -2.7 | 4.2 | 0.0 | 63 | -1.8 | 46 | 65 | 0.8 | 3.0 |
| chapel · mid · android | 10 | 185 | 321 | 185 | -66 | 0.0 | 46 | 62 | -4.1 | 45 | 72 | 0.8 | 2.4 |
| chapel · late · base | 10 | 1,271 | 1,509 | 1,279 | -0.2 | 2.6 | 0.0 | 63 | 8.9 | 44 | 59 | 0.5 | 4.7 |
| chapel · late · elf | 10 | 1,242 | 1,475 | 1,250 | -3.4 | 3.4 | 0.0 | 62 | 11 | 45 | 62 | 0.5 | 4.4 |
| chapel · late · beastkin/fox | 10 | 1,249 | 1,475 | 1,257 | 2.6 | 0.8 | 0.0 | 63 | 14 | 44 | 59 | 0.5 | 4.4 |
| chapel · late · beastkin/wolf | 10 | 1,178 | 1,415 | 1,186 | 3.3 | 0.8 | 0.0 | 61 | 11 | 44 | 59 | 0.6 | 4.7 |
| chapel · late · demon | 10 | 1,355 | 1,590 | 1,363 | -23 | 31 | 0.0 | 64 | 13 | 44 | 58 | 0.7 | 4.6 |
| chapel · late · dwarf | 10 | 1,292 | 1,531 | 1,300 | -4.7 | 0.8 | 0.0 | 63 | 12 | 43 | 59 | 0.6 | 4.7 |
| chapel · late · spirit | 10 | 1,232 | 1,464 | 1,240 | -3.0 | 4.5 | 0.0 | 63 | 10 | 44 | 59 | 0.6 | 4.7 |
| chapel · late · angel | 10 | 1,296 | 1,534 | 1,304 | 24 | 2.5 | 0.0 | 61 | 19 | 47 | 59 | 0.5 | 4.1 |
| chapel · late · angel/lantern | 10 | 1,244 | 1,456 | 1,252 | 28 | 5.2 | 0.0 | 61 | 15 | 44 | 55 | 0.5 | 5.2 |
| chapel · late · android | 10 | 1,218 | 1,454 | 1,226 | -56 | 0.0 | 52 | 63 | 14 | 44 | 59 | 0.6 | 5.0 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ net | Δ testedNet | Δ sat | Δ repGain | Δ trouble |
|---|---|---|---|---|---|---|
| maid · early4 · elf | -9.5 ± 66.2 | -9.5 ± 66.2 | -1.8 ± 3.3 | +1.1 ± 1.5 | -2.0 ± 3.5 | +0.1 ± 0.2 |
| maid · early4 · beastkin/fox | -9.7 ± 81.6 | -9.7 ± 81.6 | **+7.4 ± 5.0** | -1.5 ± 2.4 | -2.9 ± 5.8 | +0.2 ± 0.3 |
| maid · early4 · beastkin/wolf | -31.3 ± 96.0 | -31.3 ± 96.0 | +5.3 ± 5.5 | -0.4 ± 1.8 | -3.9 ± 5.1 | +0.1 ± 0.3 |
| maid · early4 · demon | -52.5 ± 79.5 | -52.5 ± 79.5 | **+5.9 ± 5.1** | **-2.7 ± 1.9** | -1.9 ± 4.7 | +0.1 ± 0.2 |
| maid · early4 · dwarf | +5.1 ± 99.1 | +5.1 ± 99.1 | -1.0 ± 4.5 | -1.1 ± 2.6 | +0.6 ± 4.0 | +0.1 ± 0.2 |
| maid · early4 · spirit | -31.1 ± 69.1 | -31.1 ± 69.1 | -0.1 ± 3.1 | -1.2 ± 1.6 | **-7.9 ± 6.7** | +0.1 ± 0.2 |
| maid · early4 · angel | -30.1 ± 92.0 | -30.1 ± 92.0 | **-6.5 ± 4.9** | **-1.6 ± 1.5** | -2.4 ± 6.3 | +0.1 ± 0.3 |
| maid · early4 · angel/lantern | -36.6 ± 79.6 | -36.6 ± 79.6 | +2.2 ± 2.9 | -1.5 ± 2.0 | -3.5 ± 5.5 | +0.0 ± 0.2 |
| maid · early4 · android | -52.5 ± 86.8 | -52.5 ± 86.8 | **-55.4 ± 4.2** | -0.8 ± 2.1 | -1.3 ± 3.3 | +0.0 ± 0.2 |
| maid · mid · elf | +16.5 ± 75.6 | +16.5 ± 75.6 | -1.2 ± 2.5 | +0.9 ± 2.0 | +1.6 ± 1.8 | +0.1 ± 0.1 |
| maid · mid · beastkin/fox | +18.7 ± 65.2 | +18.7 ± 65.2 | **+5.0 ± 2.8** | +0.4 ± 1.8 | +1.5 ± 3.8 | +0.0 ± 0.2 |
| maid · mid · beastkin/wolf | +36.1 ± 82.4 | +36.1 ± 82.4 | **+7.6 ± 5.3** | +1.5 ± 2.9 | +4.1 ± 5.1 | +0.0 ± 0.1 |
| maid · mid · demon | -7.8 ± 47.7 | -7.8 ± 47.7 | +4.8 ± 5.1 | **-3.6 ± 3.5** | +0.1 ± 7.4 | -0.1 ± 0.3 |
| maid · mid · dwarf | +17.2 ± 92.0 | +17.2 ± 92.0 | **-3.1 ± 2.2** | -0.2 ± 2.4 | +2.0 ± 5.1 | +0.0 ± 0.2 |
| maid · mid · spirit | +18.9 ± 124.7 | +18.9 ± 124.7 | -0.7 ± 3.5 | -0.6 ± 3.6 | +6.4 ± 10.5 | +0.0 ± 0.1 |
| maid · mid · angel | -40.0 ± 62.9 | -40.0 ± 62.9 | **-7.4 ± 5.0** | **-3.2 ± 2.2** | -3.9 ± 4.5 | +0.1 ± 0.1 |
| maid · mid · angel/lantern | +4.3 ± 88.3 | +4.3 ± 88.3 | +2.1 ± 4.2 | +1.4 ± 2.3 | -1.0 ± 6.2 | **+0.2 ± 0.1** |
| maid · mid · android | **-82.8 ± 72.0** | **-82.8 ± 72.0** | **-56.7 ± 4.2** | -0.8 ± 2.8 | -0.5 ± 4.2 | +0.1 ± 0.2 |
| maid · late · elf | -12.5 ± 233.7 | -12.5 ± 233.7 | -0.6 ± 1.6 | +1.6 ± 3.5 | +0.7 ± 3.2 | +0.2 ± 0.3 |
| maid · late · beastkin/fox | +43.8 ± 194.1 | +43.8 ± 194.1 | **+8.3 ± 5.6** | +2.6 ± 3.0 | +0.8 ± 3.9 | +0.1 ± 0.2 |
| maid · late · beastkin/wolf | -33.1 ± 226.8 | -33.1 ± 226.8 | **+8.1 ± 6.7** | +1.5 ± 3.0 | -0.2 ± 3.2 | +0.1 ± 0.2 |
| maid · late · demon | -159.2 ± 223.8 | -159.2 ± 223.8 | +4.2 ± 7.3 | -1.8 ± 4.5 | -7.1 ± 8.0 | +0.0 ± 0.2 |
| maid · late · dwarf | -96.8 ± 218.2 | -96.8 ± 218.2 | +0.3 ± 4.3 | +1.7 ± 2.5 | +1.4 ± 2.6 | -0.0 ± 0.2 |
| maid · late · spirit | -103.9 ± 180.0 | -103.9 ± 180.0 | -0.6 ± 3.0 | **+3.0 ± 2.9** | **+3.6 ± 3.0** | +0.1 ± 0.2 |
| maid · late · angel | -82.9 ± 144.0 | -82.9 ± 144.0 | -3.2 ± 4.4 | +1.2 ± 2.8 | +2.0 ± 3.6 | -0.0 ± 0.3 |
| maid · late · angel/lantern | +12.7 ± 128.7 | +12.7 ± 128.7 | +3.6 ± 5.8 | **+2.6 ± 2.3** | +3.0 ± 3.9 | -0.1 ± 0.2 |
| maid · late · android | -105.8 ± 175.9 | -105.8 ± 175.9 | **-56.0 ± 3.8** | +2.0 ± 3.0 | +2.4 ± 2.9 | +0.1 ± 0.3 |
| promoter · early4 · elf | +13.9 ± 131.9 | +13.9 ± 131.9 | -0.4 ± 3.0 | -0.7 ± 2.1 | +0.2 ± 3.5 | -0.0 ± 0.3 |
| promoter · early4 · beastkin/fox | +32.1 ± 92.6 | +32.1 ± 92.6 | **+7.7 ± 3.3** | -0.6 ± 1.9 | +0.5 ± 2.6 | +0.0 ± 0.2 |
| promoter · early4 · beastkin/wolf | +44.8 ± 79.3 | +44.8 ± 79.3 | **+8.0 ± 3.0** | +0.7 ± 1.8 | +1.4 ± 3.3 | -0.1 ± 0.2 |
| promoter · early4 · demon | -93.1 ± 118.7 | -93.1 ± 118.7 | **+5.9 ± 4.1** | +0.9 ± 3.2 | **+3.4 ± 3.3** | -0.1 ± 0.2 |
| promoter · early4 · dwarf | -27.8 ± 88.2 | -27.8 ± 88.2 | +0.3 ± 3.6 | +0.1 ± 1.8 | -1.4 ± 2.4 | -0.0 ± 0.3 |
| promoter · early4 · spirit | +13.0 ± 150.1 | +13.0 ± 150.1 | +0.6 ± 3.3 | +1.1 ± 2.8 | +2.6 ± 5.1 | -0.2 ± 0.3 |
| promoter · early4 · angel | -19.4 ± 102.6 | -19.4 ± 102.6 | **-4.6 ± 4.3** | -1.6 ± 1.9 | -0.6 ± 2.8 | -0.0 ± 0.2 |
| promoter · early4 · angel/lantern | +30.2 ± 88.1 | +30.2 ± 88.1 | +1.1 ± 2.6 | -0.0 ± 2.8 | -0.8 ± 3.4 | -0.0 ± 0.2 |
| promoter · early4 · android | -53.3 ± 90.5 | -53.3 ± 90.5 | **-51.2 ± 5.0** | +1.1 ± 2.6 | -0.3 ± 2.5 | -0.1 ± 0.2 |
| promoter · mid · elf | -55.9 ± 65.3 | -55.9 ± 65.3 | +0.1 ± 2.8 | +2.0 ± 4.6 | +2.0 ± 4.5 | -0.1 ± 0.2 |
| promoter · mid · beastkin/fox | -17.5 ± 58.5 | -17.5 ± 58.5 | **+4.3 ± 3.3** | +1.4 ± 4.6 | +3.3 ± 7.3 | **-0.2 ± 0.2** |
| promoter · mid · beastkin/wolf | -0.9 ± 46.4 | -0.9 ± 46.4 | **+6.6 ± 6.3** | +0.1 ± 3.0 | +0.2 ± 5.9 | -0.0 ± 0.2 |
| promoter · mid · demon | -22.4 ± 98.8 | -22.4 ± 98.8 | **+7.7 ± 7.7** | +2.6 ± 4.0 | +1.5 ± 4.5 | -0.2 ± 0.2 |
| promoter · mid · dwarf | -19.2 ± 103.8 | -19.2 ± 103.8 | -3.6 ± 4.1 | **+3.2 ± 2.8** | +5.2 ± 8.6 | **-0.2 ± 0.1** |
| promoter · mid · spirit | -6.5 ± 73.4 | -6.5 ± 73.4 | -1.1 ± 4.6 | +3.2 ± 3.8 | +2.6 ± 6.0 | -0.1 ± 0.2 |
| promoter · mid · angel | +10.1 ± 28.7 | +10.1 ± 28.7 | **-7.9 ± 3.9** | +1.6 ± 1.8 | +1.5 ± 5.1 | **-0.2 ± 0.2** |
| promoter · mid · angel/lantern | -17.0 ± 100.9 | -17.0 ± 100.9 | +0.1 ± 4.0 | +0.4 ± 3.9 | -1.6 ± 4.7 | -0.1 ± 0.2 |
| promoter · mid · android | -93.4 ± 95.7 | -93.4 ± 95.7 | **-53.7 ± 3.2** | **+2.7 ± 1.9** | +3.7 ± 3.9 | -0.1 ± 0.1 |
| promoter · late · elf | -14.7 ± 79.1 | -14.7 ± 79.1 | -1.8 ± 1.9 | -0.3 ± 1.0 | -1.7 ± 3.6 | -0.0 ± 0.2 |
| promoter · late · beastkin/fox | +22.6 ± 126.0 | +22.6 ± 126.0 | +1.2 ± 2.0 | +0.6 ± 1.7 | +0.5 ± 4.3 | -0.0 ± 0.2 |
| promoter · late · beastkin/wolf | +80.7 ± 102.0 | +80.7 ± 102.0 | +1.5 ± 3.8 | +0.1 ± 1.7 | +1.3 ± 3.1 | -0.1 ± 0.2 |
| promoter · late · demon | -32.6 ± 91.2 | -32.6 ± 91.2 | +6.5 ± 9.3 | -0.4 ± 1.5 | -0.7 ± 3.4 | -0.0 ± 0.2 |
| promoter · late · dwarf | -2.1 ± 72.8 | -2.1 ± 72.8 | **-6.8 ± 5.2** | -1.1 ± 1.4 | -1.8 ± 4.9 | +0.0 ± 0.2 |
| promoter · late · spirit | +4.0 ± 112.1 | +4.0 ± 112.1 | **-4.6 ± 3.1** | +0.2 ± 0.9 | +0.8 ± 4.3 | +0.1 ± 0.3 |
| promoter · late · angel | +133.9 ± 170.5 | +133.9 ± 170.5 | **-8.8 ± 6.8** | -0.3 ± 2.8 | -1.6 ± 4.0 | +0.0 ± 0.2 |
| promoter · late · angel/lantern | +15.8 ± 126.9 | +15.8 ± 126.9 | +1.3 ± 5.4 | -0.5 ± 1.0 | -0.5 ± 3.7 | -0.1 ± 0.1 |
| promoter · late · android | -18.8 ± 133.2 | -18.8 ± 133.2 | **-56.3 ± 4.8** | -0.1 ± 1.8 | +0.5 ± 2.6 | +0.0 ± 0.2 |
| security · early4 · elf | -22.3 ± 88.9 | -22.3 ± 88.9 | -1.7 ± 2.0 | +0.9 ± 1.3 | +0.4 ± 1.9 | -0.0 ± 0.1 |
| security · early4 · beastkin/fox | -33.4 ± 65.6 | -33.4 ± 65.6 | **+6.4 ± 3.9** | +1.0 ± 1.6 | -0.0 ± 1.9 | +0.1 ± 0.1 |
| security · early4 · beastkin/wolf | -9.1 ± 64.4 | -9.1 ± 64.4 | **+5.7 ± 4.7** | -0.0 ± 2.1 | +0.3 ± 3.1 | +0.1 ± 0.1 |
| security · early4 · demon | **-91.8 ± 78.7** | **-91.8 ± 78.7** | +4.4 ± 5.8 | -0.3 ± 2.0 | **-2.4 ± 2.1** | **+0.1 ± 0.1** |
| security · early4 · dwarf | -40.0 ± 78.5 | -40.0 ± 78.5 | **-3.6 ± 3.1** | +0.4 ± 2.3 | -1.7 ± 2.6 | -0.0 ± 0.1 |
| security · early4 · spirit | -16.4 ± 104.2 | -16.4 ± 104.2 | -2.1 ± 2.1 | +0.8 ± 1.8 | +1.1 ± 2.6 | **+0.1 ± 0.1** |
| security · early4 · angel | +12.1 ± 73.6 | +12.1 ± 73.6 | **-6.6 ± 3.7** | **+2.4 ± 1.4** | +1.2 ± 3.8 | +0.0 ± 0.1 |
| security · early4 · angel/lantern | +19.3 ± 75.7 | +19.3 ± 75.7 | -1.4 ± 1.7 | +1.3 ± 1.5 | +0.8 ± 2.6 | +0.1 ± 0.1 |
| security · early4 · android | -67.2 ± 93.0 | -67.2 ± 93.0 | **-55.8 ± 3.9** | +1.2 ± 2.0 | +0.8 ± 2.1 | +0.1 ± 0.1 |
| security · mid · elf | -14.2 ± 120.1 | -14.2 ± 120.1 | -2.4 ± 2.6 | -1.0 ± 3.1 | -1.7 ± 7.9 | +0.0 ± 0.1 |
| security · mid · beastkin/fox | -59.1 ± 82.6 | -59.1 ± 82.6 | **+7.0 ± 5.3** | +3.5 ± 3.9 | +1.8 ± 8.3 | +0.0 ± 0.1 |
| security · mid · beastkin/wolf | +17.8 ± 73.3 | +17.8 ± 73.3 | +3.8 ± 3.8 | +2.0 ± 3.2 | -1.2 ± 6.8 | -0.1 ± 0.1 |
| security · mid · demon | -16.4 ± 80.5 | -16.4 ± 80.5 | +4.3 ± 4.6 | +0.9 ± 3.9 | -3.6 ± 9.5 | **+0.3 ± 0.2** |
| security · mid · dwarf | +1.0 ± 89.5 | +1.0 ± 89.5 | -0.5 ± 1.8 | +1.5 ± 4.4 | +2.8 ± 8.1 | +0.0 ± 0.1 |
| security · mid · spirit | -16.7 ± 137.4 | -16.7 ± 137.4 | -1.7 ± 2.2 | +1.6 ± 3.8 | -3.9 ± 12.8 | +0.1 ± 0.1 |
| security · mid · angel | -58.2 ± 124.4 | -58.2 ± 124.4 | **-7.5 ± 5.3** | -1.0 ± 5.1 | -2.2 ± 9.7 | +0.1 ± 0.1 |
| security · mid · angel/lantern | -21.4 ± 88.6 | -21.4 ± 88.6 | +0.9 ± 4.4 | +2.0 ± 4.2 | +2.3 ± 12.7 | +0.0 ± 0.1 |
| security · mid · android | -34.4 ± 77.9 | -34.4 ± 77.9 | **-56.4 ± 4.3** | +1.5 ± 3.5 | +2.5 ± 6.7 | +0.0 ± 0.1 |
| security · late · elf | -42.5 ± 130.4 | -42.5 ± 130.4 | -1.4 ± 1.9 | -0.0 ± 2.4 | +1.3 ± 5.4 | -0.0 ± 0.1 |
| security · late · beastkin/fox | +39.9 ± 115.0 | +39.9 ± 115.0 | **+4.4 ± 2.8** | +0.5 ± 2.2 | +0.8 ± 4.0 | +0.0 ± 0.1 |
| security · late · beastkin/wolf | -49.3 ± 70.4 | -49.3 ± 70.4 | **+4.3 ± 2.8** | +1.7 ± 1.9 | +4.5 ± 5.2 | -0.0 ± 0.1 |
| security · late · demon | -30.5 ± 105.2 | -30.5 ± 105.2 | +2.5 ± 4.7 | -0.5 ± 2.1 | -2.9 ± 4.7 | **+0.3 ± 0.1** |
| security · late · dwarf | +11.4 ± 95.4 | +11.4 ± 95.4 | -4.7 ± 5.0 | **+2.2 ± 1.8** | +4.3 ± 5.7 | **-0.0 ± 0.0** |
| security · late · spirit | -66.9 ± 115.7 | -66.9 ± 115.7 | +0.2 ± 5.5 | +0.8 ± 2.2 | +2.3 ± 6.7 | **+0.2 ± 0.1** |
| security · late · angel | -51.4 ± 120.3 | -51.4 ± 120.3 | **-7.2 ± 4.5** | +1.1 ± 1.9 | **+4.3 ± 4.1** | -0.0 ± 0.0 |
| security · late · angel/lantern | -16.5 ± 103.1 | -16.5 ± 103.1 | -1.2 ± 2.3 | +0.2 ± 2.0 | +0.4 ± 2.3 | +0.1 ± 0.1 |
| security · late · android | **-194.9 ± 154.6** | **-194.9 ± 154.6** | **-53.6 ± 4.3** | -1.2 ± 2.5 | -0.5 ± 4.5 | **+0.2 ± 0.2** |
| bartender · early4 · elf | -29.1 ± 50.2 | -29.1 ± 50.2 | +0.5 ± 3.8 | +0.3 ± 1.2 | -1.1 ± 3.0 | -0.0 ± 0.2 |
| bartender · early4 · beastkin/fox | **+64.0 ± 46.3** | **+64.0 ± 46.3** | **+9.1 ± 4.4** | +0.3 ± 1.8 | +1.0 ± 5.1 | **-0.2 ± 0.2** |
| bartender · early4 · beastkin/wolf | -7.9 ± 57.3 | -7.9 ± 57.3 | **+6.8 ± 3.4** | +0.4 ± 1.9 | +0.1 ± 5.1 | -0.0 ± 0.2 |
| bartender · early4 · demon | -78.9 ± 126.7 | -78.9 ± 126.7 | -6.2 ± 8.1 | -0.5 ± 2.9 | -3.9 ± 5.6 | -0.1 ± 0.2 |
| bartender · early4 · dwarf | +24.6 ± 78.1 | +24.6 ± 78.1 | **+6.7 ± 5.2** | +0.9 ± 1.8 | +3.0 ± 4.4 | +0.1 ± 0.2 |
| bartender · early4 · spirit | -54.5 ± 107.9 | -54.5 ± 107.9 | **-3.0 ± 2.7** | -1.9 ± 2.9 | -3.7 ± 6.4 | +0.1 ± 0.2 |
| bartender · early4 · angel | +31.2 ± 105.9 | +31.2 ± 105.9 | -0.7 ± 3.3 | +1.0 ± 1.6 | +4.3 ± 5.9 | -0.1 ± 0.2 |
| bartender · early4 · angel/lantern | +43.7 ± 67.4 | +43.7 ± 67.4 | **+5.8 ± 3.5** | +0.3 ± 1.4 | +1.1 ± 3.5 | -0.1 ± 0.2 |
| bartender · early4 · android | -36.7 ± 87.4 | -36.7 ± 87.4 | **-50.9 ± 6.0** | +0.6 ± 1.8 | -1.1 ± 3.9 | -0.0 ± 0.3 |
| bartender · mid · elf | -30.2 ± 94.8 | -30.2 ± 94.8 | +1.8 ± 6.5 | -0.5 ± 2.8 | +2.7 ± 5.4 | +0.1 ± 0.1 |
| bartender · mid · beastkin/fox | +28.4 ± 114.8 | +28.4 ± 114.8 | +9.3 ± 10.3 | +1.3 ± 3.1 | **+9.1 ± 9.0** | **+0.2 ± 0.1** |
| bartender · mid · beastkin/wolf | -1.8 ± 113.8 | -1.8 ± 113.8 | +10.3 ± 10.6 | -0.1 ± 2.9 | +5.1 ± 8.7 | **+0.1 ± 0.1** |
| bartender · mid · demon | -77.0 ± 107.3 | -77.0 ± 107.3 | **-32.1 ± 15.7** | -1.5 ± 3.9 | -1.1 ± 7.7 | +0.1 ± 0.2 |
| bartender · mid · dwarf | -1.8 ± 101.4 | -1.8 ± 101.4 | **+19.5 ± 11.3** | +1.0 ± 2.1 | +5.8 ± 7.8 | +0.1 ± 0.1 |
| bartender · mid · spirit | +30.5 ± 91.3 | +30.5 ± 91.3 | +0.4 ± 12.6 | -0.2 ± 2.8 | **+8.0 ± 7.7** | **+0.2 ± 0.2** |
| bartender · mid · angel | -58.8 ± 84.5 | -58.8 ± 84.5 | +5.1 ± 10.6 | +0.2 ± 2.5 | -1.8 ± 7.3 | -0.0 ± 0.1 |
| bartender · mid · angel/lantern | +36.7 ± 73.6 | +36.7 ± 73.6 | +11.4 ± 17.9 | -0.1 ± 3.0 | +5.0 ± 9.0 | +0.1 ± 0.2 |
| bartender · mid · android | -45.4 ± 124.2 | -45.4 ± 124.2 | **-44.8 ± 12.2** | -0.4 ± 3.8 | +6.2 ± 9.4 | +0.2 ± 0.2 |
| bartender · late · elf | +65.5 ± 77.8 | +65.5 ± 77.8 | -3.2 ± 7.9 | +0.1 ± 1.0 | -0.1 ± 3.3 | -0.1 ± 0.2 |
| bartender · late · beastkin/fox | +48.3 ± 136.6 | +48.3 ± 136.6 | +4.6 ± 11.7 | -2.6 ± 2.9 | -0.8 ± 4.4 | +0.1 ± 0.2 |
| bartender · late · beastkin/wolf | +14.4 ± 140.3 | +14.4 ± 140.3 | -6.0 ± 9.5 | -2.6 ± 3.4 | -0.8 ± 5.1 | +0.1 ± 0.2 |
| bartender · late · demon | -15.9 ± 122.9 | -15.9 ± 122.9 | **-50.8 ± 14.6** | +0.5 ± 1.8 | +3.4 ± 4.0 | -0.0 ± 0.1 |
| bartender · late · dwarf | +45.4 ± 98.4 | +45.4 ± 98.4 | +5.0 ± 13.0 | -0.9 ± 2.2 | -0.4 ± 5.2 | +0.0 ± 0.1 |
| bartender · late · spirit | **-64.6 ± 41.3** | **-64.6 ± 41.3** | **-14.7 ± 10.9** | **-1.9 ± 1.8** | -1.2 ± 4.2 | -0.0 ± 0.1 |
| bartender · late · angel | +89.3 ± 115.2 | +89.3 ± 115.2 | -9.4 ± 11.1 | +0.7 ± 2.5 | +2.3 ± 3.6 | -0.1 ± 0.2 |
| bartender · late · angel/lantern | **-91.0 ± 80.8** | **-91.0 ± 80.8** | -5.0 ± 14.5 | -1.7 ± 2.5 | +0.4 ± 3.8 | -0.1 ± 0.2 |
| bartender · late · android | **-134.2 ± 107.0** | **-134.2 ± 107.0** | **-61.7 ± 10.5** | -2.8 ± 2.9 | -3.3 ± 4.1 | -0.0 ± 0.2 |
| host · early4 · elf | +10.0 ± 49.2 | +10.0 ± 49.2 | -0.3 ± 2.3 | +0.7 ± 1.5 | +1.2 ± 3.2 | **-0.2 ± 0.1** |
| host · early4 · beastkin/fox | -42.7 ± 70.0 | -42.7 ± 70.0 | **+9.0 ± 3.0** | -0.0 ± 2.0 | +4.4 ± 4.6 | +0.1 ± 0.2 |
| host · early4 · beastkin/wolf | -28.8 ± 71.1 | -28.8 ± 71.1 | **+10.9 ± 3.9** | +0.9 ± 1.8 | +3.7 ± 4.2 | +0.1 ± 0.3 |
| host · early4 · demon | -32.4 ± 105.3 | -32.4 ± 105.3 | **+5.1 ± 4.7** | +0.0 ± 1.8 | +1.7 ± 3.5 | -0.0 ± 0.1 |
| host · early4 · dwarf | **+141.5 ± 83.3** | **+141.5 ± 83.3** | **+3.5 ± 3.0** | **+4.0 ± 1.8** | **+8.7 ± 5.3** | +0.1 ± 0.2 |
| host · early4 · spirit | -13.8 ± 76.1 | -13.8 ± 76.1 | -0.4 ± 4.9 | +0.8 ± 2.8 | +5.2 ± 6.9 | +0.0 ± 0.2 |
| host · early4 · angel | **+119.8 ± 86.2** | **+119.8 ± 86.2** | -1.4 ± 2.2 | **+4.6 ± 2.0** | **+7.0 ± 5.8** | -0.0 ± 0.2 |
| host · early4 · angel/lantern | +24.0 ± 99.4 | +24.0 ± 99.4 | +2.7 ± 3.2 | +0.6 ± 1.6 | **+6.3 ± 5.8** | +0.0 ± 0.2 |
| host · early4 · android | +119.6 ± 135.4 | +119.6 ± 135.4 | **-90.1 ± 2.9** | **+7.4 ± 1.9** | **+13.8 ± 3.4** | +0.1 ± 0.2 |
| host · mid · elf | +21.8 ± 82.9 | +21.8 ± 82.9 | +0.0 ± 4.2 | +2.4 ± 2.9 | +7.5 ± 8.2 | **+0.1 ± 0.1** |
| host · mid · beastkin/fox | +98.3 ± 103.5 | +98.3 ± 103.5 | **+10.1 ± 5.6** | +2.3 ± 3.1 | +1.9 ± 9.2 | -0.1 ± 0.2 |
| host · mid · beastkin/wolf | +24.2 ± 91.2 | +24.2 ± 91.2 | **+9.1 ± 5.0** | **+2.9 ± 2.4** | +5.2 ± 7.2 | +0.0 ± 0.2 |
| host · mid · demon | +27.7 ± 80.7 | +27.7 ± 80.7 | **+10.0 ± 6.0** | **+3.3 ± 2.3** | **+5.1 ± 3.8** | +0.0 ± 0.2 |
| host · mid · dwarf | **+96.5 ± 48.6** | **+96.5 ± 48.6** | **+8.1 ± 5.1** | +4.1 ± 4.5 | **+11.5 ± 10.2** | +0.1 ± 0.2 |
| host · mid · spirit | +3.6 ± 103.4 | +3.6 ± 103.4 | -1.7 ± 2.9 | -0.1 ± 4.1 | +6.1 ± 8.6 | +0.0 ± 0.2 |
| host · mid · angel | +39.8 ± 45.9 | +39.8 ± 45.9 | -0.1 ± 3.6 | +2.5 ± 2.8 | +3.3 ± 5.1 | -0.0 ± 0.2 |
| host · mid · angel/lantern | +63.9 ± 84.6 | +63.9 ± 84.6 | +2.8 ± 6.0 | **+2.5 ± 2.5** | +4.1 ± 9.7 | -0.0 ± 0.2 |
| host · mid · android | +37.4 ± 98.0 | +37.4 ± 98.0 | **-87.5 ± 8.0** | **+7.0 ± 3.4** | **+11.8 ± 9.5** | **+0.3 ± 0.2** |
| host · late · elf | +51.4 ± 99.9 | +51.4 ± 99.9 | **-4.5 ± 3.7** | +0.5 ± 2.1 | **-5.3 ± 5.1** | +0.1 ± 0.3 |
| host · late · beastkin/fox | +5.0 ± 149.1 | +5.0 ± 149.1 | **+8.3 ± 7.1** | -0.6 ± 2.2 | **-6.8 ± 4.9** | +0.1 ± 0.3 |
| host · late · beastkin/wolf | **+204.2 ± 171.0** | **+204.2 ± 171.0** | **+5.9 ± 3.5** | **+2.3 ± 1.6** | -0.5 ± 2.7 | +0.2 ± 0.3 |
| host · late · demon | +123.6 ± 227.0 | +123.6 ± 227.0 | **+12.5 ± 12.4** | +1.1 ± 2.5 | **-2.9 ± 2.7** | +0.1 ± 0.3 |
| host · late · dwarf | +53.9 ± 199.4 | +53.9 ± 199.4 | +1.0 ± 5.0 | +1.5 ± 2.2 | -1.8 ± 3.6 | +0.1 ± 0.3 |
| host · late · spirit | +113.1 ± 168.7 | +113.1 ± 168.7 | -6.2 ± 7.5 | +1.0 ± 1.3 | **-4.5 ± 3.7** | **+0.3 ± 0.2** |
| host · late · angel | +97.0 ± 141.0 | +97.0 ± 141.0 | -0.8 ± 5.3 | **+2.7 ± 1.7** | -0.1 ± 4.5 | +0.1 ± 0.3 |
| host · late · angel/lantern | +101.8 ± 134.3 | +101.8 ± 134.3 | **-4.1 ± 3.7** | **+2.0 ± 1.4** | -3.1 ± 3.6 | +0.1 ± 0.2 |
| host · late · android | **+276.6 ± 163.4** | **+276.6 ± 163.4** | **-94.3 ± 7.1** | **+5.8 ± 2.6** | +1.9 ± 2.8 | +0.2 ± 0.3 |
| attendant · early4 · elf | +34.7 ± 76.1 | +34.7 ± 76.1 | -3.4 ± 16.8 | +1.6 ± 1.8 | +2.1 ± 4.1 | +0.0 ± 0.1 |
| attendant · early4 · beastkin/fox | -2.3 ± 101.2 | -2.3 ± 101.2 | **+6.5 ± 6.3** | +1.0 ± 3.0 | +2.2 ± 5.2 | +0.0 ± 0.2 |
| attendant · early4 · beastkin/wolf | +38.1 ± 58.4 | +38.1 ± 58.4 | +10.6 ± 14.2 | +1.1 ± 2.4 | +3.1 ± 3.9 | -0.0 ± 0.1 |
| attendant · early4 · demon | +50.3 ± 109.8 | +50.3 ± 109.8 | **+22.1 ± 20.7** | +2.5 ± 2.8 | +3.9 ± 3.9 | -0.1 ± 0.2 |
| attendant · early4 · dwarf | +46.7 ± 81.9 | +46.7 ± 81.9 | **+11.2 ± 7.1** | +0.4 ± 3.1 | +2.1 ± 5.2 | +0.0 ± 0.2 |
| attendant · early4 · spirit | +24.3 ± 69.7 | +24.3 ± 69.7 | -7.9 ± 11.5 | +1.5 ± 2.2 | +3.9 ± 4.2 | -0.1 ± 0.2 |
| attendant · early4 · angel | -9.9 ± 79.8 | -9.9 ± 79.8 | -5.7 ± 10.8 | +0.0 ± 1.9 | -1.2 ± 2.8 | +0.0 ± 0.2 |
| attendant · early4 · angel/lantern | +38.9 ± 71.8 | +38.9 ± 71.8 | -1.8 ± 15.4 | +1.0 ± 1.7 | +3.1 ± 4.0 | +0.0 ± 0.2 |
| attendant · early4 · android | +5.7 ± 100.8 | +5.7 ± 100.8 | **-37.9 ± 13.2** | +1.7 ± 2.6 | **+5.2 ± 4.9** | +0.1 ± 0.2 |
| attendant · mid · elf | -25.8 ± 77.1 | -25.8 ± 77.1 | +9.1 ± 9.2 | -3.3 ± 6.6 | -2.8 ± 6.9 | -0.0 ± 0.3 |
| attendant · mid · beastkin/fox | -45.3 ± 77.2 | -45.3 ± 77.2 | +9.9 ± 21.3 | +0.1 ± 6.7 | -1.3 ± 7.1 | -0.0 ± 0.2 |
| attendant · mid · beastkin/wolf | -46.8 ± 84.8 | -46.8 ± 84.8 | +10.5 ± 23.9 | -0.0 ± 8.4 | +0.6 ± 6.2 | +0.1 ± 0.3 |
| attendant · mid · demon | +0.4 ± 59.1 | +0.4 ± 59.1 | +21.2 ± 32.5 | +0.3 ± 5.7 | -2.0 ± 5.8 | -0.1 ± 0.2 |
| attendant · mid · dwarf | +6.1 ± 86.3 | +6.1 ± 86.3 | +18.0 ± 22.1 | -0.1 ± 5.5 | +2.2 ± 7.5 | +0.0 ± 0.2 |
| attendant · mid · spirit | +76.9 ± 89.8 | +76.9 ± 89.8 | +10.0 ± 13.5 | +1.1 ± 4.9 | +5.1 ± 5.9 | -0.0 ± 0.2 |
| attendant · mid · angel | +10.4 ± 82.0 | +10.4 ± 82.0 | +17.2 ± 25.5 | -2.0 ± 3.5 | -3.6 ± 3.7 | +0.1 ± 0.2 |
| attendant · mid · angel/lantern | -3.8 ± 66.2 | -3.8 ± 66.2 | +5.3 ± 7.1 | -0.9 ± 4.4 | -2.6 ± 7.9 | -0.1 ± 0.3 |
| attendant · mid · android | **-113.9 ± 59.2** | **-113.9 ± 59.2** | -14.0 ± 31.4 | +1.1 ± 7.6 | -2.0 ± 8.9 | -0.1 ± 0.2 |
| attendant · late · elf | **-140.1 ± 127.5** | **-140.1 ± 127.5** | **+13.8 ± 9.0** | -1.2 ± 2.3 | +1.6 ± 3.7 | -0.0 ± 0.2 |
| attendant · late · beastkin/fox | -30.1 ± 123.2 | -30.1 ± 123.2 | **+20.5 ± 16.2** | -0.4 ± 2.3 | -1.0 ± 5.5 | -0.1 ± 0.3 |
| attendant · late · beastkin/wolf | **-122.9 ± 120.5** | **-122.9 ± 120.5** | **+37.4 ± 24.3** | **-2.4 ± 1.4** | -1.3 ± 3.9 | -0.0 ± 0.2 |
| attendant · late · demon | -87.9 ± 92.2 | -87.9 ± 92.2 | +35.0 ± 51.3 | -0.3 ± 2.3 | -1.1 ± 7.2 | **-0.2 ± 0.2** |
| attendant · late · dwarf | -22.5 ± 88.7 | -22.5 ± 88.7 | **+29.5 ± 29.2** | -0.5 ± 1.5 | -1.4 ± 3.4 | +0.1 ± 0.2 |
| attendant · late · spirit | -19.4 ± 120.1 | -19.4 ± 120.1 | +10.8 ± 18.1 | +0.5 ± 1.7 | +1.8 ± 4.2 | +0.2 ± 0.3 |
| attendant · late · angel | **-161.6 ± 132.3** | **-161.6 ± 132.3** | +12.0 ± 17.2 | -1.5 ± 2.4 | +2.0 ± 5.4 | -0.0 ± 0.2 |
| attendant · late · angel/lantern | -13.5 ± 118.2 | -13.5 ± 118.2 | **+19.7 ± 12.0** | -0.2 ± 1.8 | -1.0 ± 3.9 | +0.0 ± 0.2 |
| attendant · late · android | -50.6 ± 144.1 | -50.6 ± 144.1 | +12.8 ± 59.1 | +1.6 ± 2.6 | +0.7 ± 3.6 | +0.1 ± 0.2 |
| madame · early4 · elf | +10.4 ± 93.9 | +10.4 ± 93.9 | +2.1 ± 3.7 | -0.0 ± 0.9 | +1.4 ± 3.1 | +0.1 ± 0.2 |
| madame · early4 · beastkin/fox | +23.0 ± 104.6 | +23.0 ± 104.6 | **+4.3 ± 2.5** | -0.8 ± 1.4 | -1.6 ± 3.6 | -0.1 ± 0.2 |
| madame · early4 · beastkin/wolf | +12.9 ± 81.3 | +12.9 ± 81.3 | **+4.8 ± 2.4** | **-1.7 ± 1.4** | **+3.5 ± 3.1** | -0.0 ± 0.2 |
| madame · early4 · demon | +12.4 ± 60.3 | +12.4 ± 60.3 | +4.1 ± 6.2 | -1.7 ± 2.0 | -0.7 ± 2.9 | -0.0 ± 0.2 |
| madame · early4 · dwarf | +68.7 ± 96.0 | +68.7 ± 96.0 | -1.0 ± 3.1 | -0.8 ± 1.5 | +0.8 ± 2.6 | +0.0 ± 0.2 |
| madame · early4 · spirit | +11.5 ± 108.0 | +11.5 ± 108.0 | +1.0 ± 3.3 | -0.1 ± 1.2 | +2.0 ± 2.7 | -0.1 ± 0.1 |
| madame · early4 · angel | +45.6 ± 90.1 | +45.6 ± 90.1 | -2.9 ± 4.6 | -1.6 ± 1.7 | +2.2 ± 2.7 | +0.0 ± 0.2 |
| madame · early4 · angel/lantern | -19.5 ± 133.1 | -19.5 ± 133.1 | +3.8 ± 4.1 | **-1.5 ± 1.5** | +0.0 ± 5.1 | +0.0 ± 0.2 |
| madame · early4 · android | -33.6 ± 86.6 | -33.6 ± 86.6 | **-51.9 ± 3.3** | -0.2 ± 1.5 | +0.3 ± 2.1 | -0.0 ± 0.2 |
| madame · mid · elf | +38.9 ± 124.5 | +38.9 ± 124.5 | **+7.7 ± 4.1** | +0.8 ± 3.8 | -2.0 ± 8.2 | +0.0 ± 0.1 |
| madame · mid · beastkin/fox | -26.0 ± 102.2 | -26.0 ± 102.2 | **+8.5 ± 7.0** | -2.3 ± 4.5 | +2.1 ± 7.7 | +0.1 ± 0.2 |
| madame · mid · beastkin/wolf | -20.7 ± 86.6 | -20.7 ± 86.6 | **+11.3 ± 4.7** | -2.4 ± 3.9 | +0.7 ± 7.8 | +0.1 ± 0.2 |
| madame · mid · demon | +33.5 ± 107.6 | +33.5 ± 107.6 | **-15.0 ± 9.7** | -0.8 ± 3.5 | +0.8 ± 8.0 | -0.0 ± 0.2 |
| madame · mid · dwarf | -15.9 ± 44.9 | -15.9 ± 44.9 | +2.5 ± 9.5 | **-2.4 ± 1.7** | +2.0 ± 4.4 | +0.0 ± 0.2 |
| madame · mid · spirit | +32.8 ± 168.0 | +32.8 ± 168.0 | -1.4 ± 8.5 | +0.5 ± 3.8 | -0.1 ± 7.4 | +0.0 ± 0.2 |
| madame · mid · angel | -52.1 ± 120.2 | -52.1 ± 120.2 | -1.9 ± 7.4 | -1.7 ± 4.0 | -0.4 ± 8.9 | -0.1 ± 0.2 |
| madame · mid · angel/lantern | +35.0 ± 119.8 | +35.0 ± 119.8 | +4.1 ± 9.0 | +0.1 ± 3.6 | +3.0 ± 9.1 | -0.1 ± 0.2 |
| madame · mid · android | -39.1 ± 106.7 | -39.1 ± 106.7 | **-48.8 ± 9.5** | +0.5 ± 3.7 | +5.2 ± 9.5 | +0.0 ± 0.2 |
| madame · late · elf | +30.7 ± 90.1 | +30.7 ± 90.1 | -4.4 ± 8.8 | +0.6 ± 1.3 | -1.8 ± 4.2 | +0.1 ± 0.2 |
| madame · late · beastkin/fox | +33.5 ± 155.1 | +33.5 ± 155.1 | +8.0 ± 11.2 | +0.3 ± 1.4 | +0.6 ± 4.0 | +0.0 ± 0.2 |
| madame · late · beastkin/wolf | **-100.7 ± 92.0** | **-100.7 ± 92.0** | +12.4 ± 12.5 | -0.2 ± 1.4 | **+3.5 ± 3.3** | -0.1 ± 0.3 |
| madame · late · demon | +122.8 ± 145.9 | +122.8 ± 145.9 | **-15.3 ± 10.3** | **-1.9 ± 1.8** | -0.6 ± 3.8 | +0.1 ± 0.3 |
| madame · late · dwarf | +27.6 ± 131.4 | +27.6 ± 131.4 | -7.7 ± 9.4 | -0.1 ± 1.5 | -1.7 ± 4.3 | +0.2 ± 0.3 |
| madame · late · spirit | -67.7 ± 90.9 | -67.7 ± 90.9 | -3.3 ± 5.8 | -0.7 ± 1.9 | +2.1 ± 3.9 | +0.1 ± 0.3 |
| madame · late · angel | -33.3 ± 108.4 | -33.3 ± 108.4 | -2.3 ± 7.9 | -0.5 ± 1.8 | -1.4 ± 6.2 | +0.1 ± 0.3 |
| madame · late · angel/lantern | -35.5 ± 74.5 | -35.5 ± 74.5 | -0.7 ± 11.8 | -0.4 ± 2.2 | +0.1 ± 4.4 | +0.2 ± 0.3 |
| madame · late · android | **-140.0 ± 100.1** | **-140.0 ± 100.1** | **-55.5 ± 10.1** | -0.7 ± 2.0 | -3.1 ± 5.3 | +0.1 ± 0.4 |
| chapel · early4 · elf | +5.8 ± 75.3 | +5.8 ± 75.3 | +1.8 ± 3.3 | +1.6 ± 3.3 | +0.9 ± 3.0 | +0.1 ± 0.1 |
| chapel · early4 · beastkin/fox | +29.5 ± 87.0 | +29.5 ± 87.0 | **+5.7 ± 2.7** | +1.7 ± 2.3 | +2.4 ± 2.5 | -0.0 ± 0.1 |
| chapel · early4 · beastkin/wolf | +19.0 ± 91.2 | +19.0 ± 91.2 | **+6.1 ± 2.6** | +0.1 ± 1.4 | -0.1 ± 2.5 | +0.1 ± 0.1 |
| chapel · early4 · demon | -5.1 ± 75.6 | -5.1 ± 75.6 | +2.8 ± 5.3 | +0.3 ± 2.2 | +1.3 ± 2.0 | **-0.1 ± 0.1** |
| chapel · early4 · dwarf | +31.3 ± 81.9 | +31.3 ± 81.9 | -0.3 ± 2.9 | -0.0 ± 1.3 | **+4.7 ± 2.4** | +0.1 ± 0.2 |
| chapel · early4 · spirit | +57.6 ± 73.9 | +57.6 ± 73.9 | +0.3 ± 1.9 | +1.0 ± 2.3 | **+4.1 ± 2.5** | -0.1 ± 0.2 |
| chapel · early4 · angel | +70.0 ± 91.5 | +70.0 ± 91.5 | **+4.3 ± 3.2** | +0.4 ± 3.3 | **+3.6 ± 3.2** | -0.0 ± 0.2 |
| chapel · early4 · angel/lantern | **+103.9 ± 59.2** | **+103.9 ± 59.2** | **+14.1 ± 4.6** | -1.1 ± 1.6 | **+6.1 ± 1.9** | +0.1 ± 0.2 |
| chapel · early4 · android | +0.2 ± 82.4 | +0.2 ± 82.4 | **-45.0 ± 2.4** | +0.7 ± 2.2 | +1.1 ± 2.5 | +0.1 ± 0.2 |
| chapel · mid · elf | -29.4 ± 58.4 | -29.4 ± 58.4 | +1.9 ± 2.7 | -0.5 ± 3.0 | -1.4 ± 6.7 | +0.1 ± 0.2 |
| chapel · mid · beastkin/fox | +6.0 ± 71.8 | +6.0 ± 71.8 | +3.6 ± 3.8 | +1.6 ± 3.3 | **+4.2 ± 3.8** | +0.1 ± 0.1 |
| chapel · mid · beastkin/wolf | +62.8 ± 67.3 | +62.8 ± 67.3 | **+5.1 ± 4.4** | +0.2 ± 3.2 | +2.7 ± 6.3 | +0.0 ± 0.2 |
| chapel · mid · demon | -78.8 ± 94.3 | -78.8 ± 94.3 | +4.4 ± 5.8 | -1.0 ± 4.3 | -4.9 ± 8.1 | -0.0 ± 0.1 |
| chapel · mid · dwarf | -19.6 ± 74.0 | -19.6 ± 74.0 | **-2.9 ± 2.8** | -0.9 ± 3.2 | -3.6 ± 7.5 | +0.1 ± 0.1 |
| chapel · mid · spirit | -23.1 ± 109.3 | -23.1 ± 109.3 | -0.2 ± 4.0 | -2.0 ± 3.3 | +0.6 ± 5.1 | **+0.2 ± 0.2** |
| chapel · mid · angel | +78.0 ± 116.1 | +78.0 ± 116.1 | +3.0 ± 5.2 | +0.9 ± 3.5 | +2.6 ± 5.9 | +0.1 ± 0.2 |
| chapel · mid · angel/lantern | +53.1 ± 92.9 | +53.1 ± 92.9 | **+16.5 ± 5.9** | -0.8 ± 5.1 | +3.5 ± 8.2 | +0.1 ± 0.2 |
| chapel · mid · android | -51.8 ± 95.6 | -51.8 ± 95.6 | **-46.4 ± 3.9** | -1.1 ± 3.8 | +1.2 ± 6.9 | **+0.1 ± 0.1** |
| chapel · late · elf | -29.0 ± 109.0 | -29.0 ± 109.0 | -3.2 ± 4.7 | -0.8 ± 0.9 | +2.1 ± 3.3 | +0.0 ± 0.2 |
| chapel · late · beastkin/fox | -21.7 ± 95.3 | -21.7 ± 95.3 | +2.8 ± 7.6 | +0.3 ± 1.0 | **+4.9 ± 4.8** | +0.0 ± 0.1 |
| chapel · late · beastkin/wolf | -92.9 ± 136.2 | -92.9 ± 136.2 | +3.5 ± 4.1 | **-1.2 ± 1.0** | +1.8 ± 6.6 | +0.1 ± 0.2 |
| chapel · late · demon | +84.4 ± 210.8 | +84.4 ± 210.8 | **-22.5 ± 9.2** | +1.9 ± 2.8 | +4.2 ± 6.0 | +0.1 ± 0.3 |
| chapel · late · dwarf | +21.5 ± 90.6 | +21.5 ± 90.6 | -4.5 ± 5.1 | +0.9 ± 2.0 | +2.6 ± 6.0 | +0.1 ± 0.2 |
| chapel · late · spirit | -38.4 ± 68.3 | -38.4 ± 68.3 | -2.7 ± 5.3 | +0.1 ± 1.2 | +1.3 ± 5.9 | +0.0 ± 0.1 |
| chapel · late · angel | +25.3 ± 147.2 | +25.3 ± 147.2 | **+24.2 ± 7.9** | -1.2 ± 1.3 | **+10.3 ± 4.9** | -0.0 ± 0.1 |
| chapel · late · angel/lantern | -26.7 ± 86.0 | -26.7 ± 86.0 | **+28.3 ± 8.4** | -1.3 ± 2.7 | +5.9 ± 6.1 | -0.0 ± 0.3 |
| chapel · late · android | -53.1 ± 87.8 | -53.1 ± 87.8 | **-56.1 ± 9.1** | -0.0 ± 1.3 | **+5.5 ± 5.2** | +0.1 ± 0.1 |

---

### race-roles-houses

Specialized house-role synergies by race (Tankard bartender/dancer, Onsen bath, Castle host/attendant/madame, Sanctuary chapel, Lantern classroom teacher).

scenario **mid** · 10 seeds from 1 · 285s · 2026-11-20T20:09

| variant | n | houseNet | total | net | testedNet | testedRest | sat | repGain | prestige | skillGain | statGain |
|---|---|---|---|---|---|---|---|---|---|---|---|
| tankard-mid · bartender · base | 10 | 339 | 339 | 339 | 15 | 4.2 | 60 | -6.7 | 10 | 2.7 | 1.2 |
| tankard-mid · bartender · elf | 10 | 366 | 366 | 366 | 14 | 1.7 | 61 | -7.0 | 11 | 2.4 | 0.6 |
| tankard-mid · bartender · beastkin/fox | 10 | 406 | 406 | 406 | 22 | 1.7 | 61 | -5.6 | 12 | 2.6 | 1.2 |
| tankard-mid · bartender · beastkin/cat | 10 | 397 | 397 | 397 | 22 | 0.8 | 62 | -5.8 | 11 | 2.6 | 1.3 |
| tankard-mid · bartender · beastkin/rabbit | 10 | 378 | 378 | 378 | 20 | 1.7 | 61 | -4.8 | 12 | 2.5 | 1.2 |
| tankard-mid · bartender · beastkin/dragon | 10 | 577 | 577 | 577 | 17 | 0.8 | 65 | -0.2 | 12 | 2.6 | 1.3 |
| tankard-mid · bartender · demon | 10 | 374 | 374 | 374 | -1.2 | 41 | 61 | -6.7 | 11 | 2.2 | 1.2 |
| tankard-mid · bartender · dwarf | 10 | 341 | 341 | 341 | 20 | 0.0 | 59 | -7.0 | 9.2 | 2.6 | 1.2 |
| tankard-mid · bartender · spirit | 10 | 356 | 356 | 356 | 11 | 10 | 61 | -5.4 | 12 | 2.5 | 1.2 |
| tankard-mid · bartender · angel | 10 | 365 | 365 | 365 | 14 | 0.8 | 60 | -6.3 | 12 | 2.5 | 1.2 |
| tankard-mid · bartender · angel/lantern | 10 | 339 | 339 | 339 | 14 | 7.5 | 59 | -6.8 | 10 | 2.5 | 1.2 |
| tankard-mid · bartender · android | 10 | 347 | 347 | 347 | -38 | 0.0 | 61 | -4.0 | 11 | 2.8 | 1.3 |
| tankard-mid · dancer · base | 10 | 540 | 540 | 540 | 29 | 18 | 62 | -1.7 | 13 | 2.1 | 1.2 |
| tankard-mid · dancer · elf | 10 | 578 | 578 | 578 | 25 | 18 | 63 | -0.1 | 14 | 2.3 | 1.4 |
| tankard-mid · dancer · beastkin/fox | 10 | 483 | 483 | 483 | 38 | 9.2 | 61 | -3.2 | 12 | 2.1 | 0.8 |
| tankard-mid · dancer · beastkin/cat | 10 | 579 | 579 | 579 | 41 | 10 | 63 | 0.2 | 13 | 2.4 | 1.4 |
| tankard-mid · dancer · beastkin/rabbit | 10 | 617 | 617 | 617 | 43 | 10 | 63 | 0.1 | 14 | 2.2 | 1.1 |
| tankard-mid · dancer · beastkin/dragon | 10 | 457 | 457 | 457 | 22 | 12 | 60 | -3.2 | 13 | 2.1 | 1.0 |
| tankard-mid · dancer · demon | 10 | 582 | 582 | 582 | 33 | 31 | 64 | -0.9 | 13 | 2.3 | 1.5 |
| tankard-mid · dancer · dwarf | 10 | 573 | 573 | 573 | 32 | 3.3 | 62 | -0.4 | 14 | 2.5 | 1.3 |
| tankard-mid · dancer · spirit | 10 | 489 | 489 | 489 | 23 | 20 | 63 | -1.6 | 14 | 2.1 | 0.9 |
| tankard-mid · dancer · angel | 10 | 557 | 557 | 557 | 27 | 13 | 61 | 1.2 | 14 | 2.0 | 1.0 |
| tankard-mid · dancer · angel/lantern | 10 | 463 | 463 | 463 | 24 | 18 | 61 | -5.7 | 13 | 2.1 | 0.9 |
| tankard-mid · dancer · android | 10 | 409 | 409 | 409 | -25 | 0.0 | 61 | 0.6 | 14 | 2.2 | 1.0 |
| onsen-mid · bath · base | 10 | 324 | 327 | 327 | 45 | 22 | 56 | -3.8 | 38 | 2.7 | 1.0 |
| onsen-mid · bath · elf | 10 | 387 | 390 | 390 | 44 | 25 | 59 | -2.1 | 37 | 2.5 | 1.1 |
| onsen-mid · bath · beastkin/fox | 10 | 437 | 440 | 440 | 71 | 20 | 59 | -1.4 | 40 | 2.6 | 1.2 |
| onsen-mid · bath · beastkin/cat | 10 | 462 | 465 | 465 | 70 | 18 | 60 | 0.2 | 39 | 2.5 | 1.2 |
| onsen-mid · bath · beastkin/rabbit | 10 | 400 | 403 | 403 | 69 | 18 | 58 | -3.2 | 39 | 2.6 | 1.0 |
| onsen-mid · bath · beastkin/dragon | 10 | 438 | 441 | 441 | 62 | 13 | 60 | 1.0 | 39 | 2.7 | 1.1 |
| onsen-mid · bath · demon | 10 | 349 | 352 | 352 | 63 | 33 | 56 | -1.5 | 38 | 2.4 | 1.1 |
| onsen-mid · bath · dwarf | 10 | 454 | 457 | 457 | 65 | 14 | 61 | 3.7 | 39 | 2.6 | 1.2 |
| onsen-mid · bath · spirit | 10 | 532 | 535 | 535 | 37 | 34 | 65 | 3.1 | 41 | 2.5 | 1.2 |
| onsen-mid · bath · angel | 10 | 332 | 335 | 335 | 49 | 21 | 58 | -2.1 | 39 | 2.5 | 1.1 |
| onsen-mid · bath · angel/lantern | 10 | 473 | 476 | 476 | 58 | 25 | 62 | 1.1 | 40 | 2.5 | 1.2 |
| onsen-mid · bath · android | 10 | 477 | 480 | 480 | 17 | 0.0 | 61 | 0.4 | 39 | 2.7 | 1.3 |
| castle-mid · host · base | 10 | 3,492 | 3,497 | 3,497 | -9.0 | 29 | 82 | 22 | 82 | 3.6 | 2.6 |
| castle-mid · host · elf | 10 | 3,317 | 3,322 | 3,322 | -8.8 | 26 | 82 | 23 | 83 | 3.4 | 2.9 |
| castle-mid · host · beastkin/fox | 10 | 2,822 | 2,827 | 2,827 | -1.8 | 22 | 79 | 23 | 82 | 3.5 | 2.7 |
| castle-mid · host · beastkin/cat | 10 | 3,138 | 3,143 | 3,143 | -2.7 | 15 | 82 | 22 | 83 | 3.5 | 2.7 |
| castle-mid · host · beastkin/rabbit | 10 | 2,601 | 2,606 | 2,606 | 1.8 | 20 | 77 | 23 | 83 | 3.3 | 2.5 |
| castle-mid · host · beastkin/dragon | 10 | 3,010 | 3,015 | 3,015 | -8.4 | 23 | 82 | 24 | 85 | 3.4 | 2.5 |
| castle-mid · host · demon | 10 | 2,894 | 2,899 | 2,899 | -2.1 | 48 | 81 | 14 | 83 | 3.0 | 2.0 |
| castle-mid · host · dwarf | 10 | 3,216 | 3,220 | 3,220 | -0.0 | 5.8 | 82 | 18 | 82 | 3.4 | 2.5 |
| castle-mid · host · spirit | 10 | 2,953 | 2,958 | 2,958 | -13 | 30 | 80 | 21 | 84 | 3.5 | 2.8 |
| castle-mid · host · angel | 10 | 3,233 | 3,238 | 3,238 | -11 | 33 | 81 | 24 | 82 | 3.6 | 3.0 |
| castle-mid · host · angel/lantern | 10 | 3,468 | 3,473 | 3,473 | -8.1 | 30 | 81 | 22 | 83 | 3.4 | 2.6 |
| castle-mid · host · android | 10 | 3,093 | 3,098 | 3,098 | -101 | 0.0 | 84 | 23 | 82 | 3.3 | 2.4 |
| castle-late · host · base | 9 (+1 unreached) | 9,210 | 9,217 | 9,217 | -0.6 | 23 | 79 | 13 | 91 | 2.3 | 1.3 |
| castle-late · host · elf | 9 (+1 unreached) | 8,965 | 8,973 | 8,973 | -2.1 | 21 | 79 | 13 | 92 | 2.3 | 1.3 |
| castle-late · host · beastkin/fox | 9 (+1 unreached) | 8,973 | 8,979 | 8,979 | 12 | 16 | 79 | 15 | 91 | 2.3 | 1.3 |
| castle-late · host · beastkin/cat | 9 (+1 unreached) | 10,485 | 10,492 | 10,492 | 11 | 8.8 | 81 | 15 | 92 | 2.2 | 1.1 |
| castle-late · host · beastkin/rabbit | 9 (+1 unreached) | 9,515 | 9,523 | 9,523 | 15 | 13 | 79 | 14 | 93 | 2.2 | 1.3 |
| castle-late · host · beastkin/dragon | 9 (+1 unreached) | 10,327 | 10,334 | 10,334 | -1.9 | 20 | 83 | 12 | 93 | 2.1 | 1.2 |
| castle-late · host · demon | 9 (+1 unreached) | 9,641 | 9,648 | 9,648 | 4.9 | 44 | 79 | 13 | 92 | 2.3 | 1.2 |
| castle-late · host · dwarf | 9 (+1 unreached) | 10,668 | 10,675 | 10,675 | 6.7 | 3.9 | 82 | 11 | 94 | 2.1 | 1.2 |
| castle-late · host · spirit | 9 (+1 unreached) | 9,658 | 9,666 | 9,666 | -5.4 | 26 | 78 | 11 | 92 | 2.1 | 1.1 |
| castle-late · host · angel | 9 (+1 unreached) | 9,997 | 10,004 | 10,004 | -0.8 | 28 | 80 | 13 | 92 | 2.2 | 1.2 |
| castle-late · host · angel/lantern | 9 (+1 unreached) | 9,110 | 9,117 | 9,117 | 5.8 | 23 | 79 | 14 | 92 | 2.2 | 1.2 |
| castle-late · host · android | 9 (+1 unreached) | 9,742 | 9,749 | 9,749 | -100 | 1.4 | 83 | 10 | 93 | 2.2 | 1.1 |
| castle-mid · attendant · base | 10 | 2,704 | 2,708 | 2,708 | 23 | 5.8 | 75 | 16 | 89 | 3.7 | 2.8 |
| castle-mid · attendant · elf | 10 | 2,404 | 2,409 | 2,409 | 32 | 3.3 | 73 | 14 | 87 | 3.5 | 2.6 |
| castle-mid · attendant · beastkin/fox | 10 | 2,507 | 2,512 | 2,512 | 21 | 0.8 | 74 | 23 | 89 | 3.3 | 2.5 |
| castle-mid · attendant · beastkin/cat | 10 | 2,392 | 2,397 | 2,397 | 9.7 | 0.0 | 74 | 23 | 88 | 3.2 | 2.5 |
| castle-mid · attendant · beastkin/rabbit | 10 | 2,276 | 2,281 | 2,281 | 31 | 5.0 | 73 | 11 | 89 | 3.2 | 2.1 |
| castle-mid · attendant · beastkin/dragon | 10 | 2,598 | 2,603 | 2,603 | 4.8 | 0.8 | 73 | 21 | 88 | 3.5 | 2.8 |
| castle-mid · attendant · demon | 10 | 2,395 | 2,400 | 2,400 | 35 | 20 | 75 | 21 | 88 | 3.2 | 2.6 |
| castle-mid · attendant · dwarf | 10 | 2,357 | 2,363 | 2,363 | 1.0 | 0.8 | 75 | 19 | 88 | 3.5 | 2.7 |
| castle-mid · attendant · spirit | 10 | 2,677 | 2,681 | 2,681 | 27 | 2.5 | 75 | 23 | 88 | 3.7 | 2.8 |
| castle-mid · attendant · angel | 10 | 2,501 | 2,505 | 2,505 | 27 | 2.5 | 73 | 18 | 89 | 3.6 | 2.7 |
| castle-mid · attendant · angel/lantern | 10 | 2,703 | 2,709 | 2,709 | 51 | 4.2 | 74 | 22 | 89 | 4.1 | 3.1 |
| castle-mid · attendant · android | 10 | 2,663 | 2,669 | 2,669 | -32 | 2.5 | 74 | 17 | 87 | 3.6 | 2.7 |
| castle-mid · madame · base | 10 | 2,279 | 2,557 | 2,284 | 1.5 | 1.7 | 74 | 18 | 84 | 3.8 | 2.5 |
| castle-mid · madame · elf | 10 | 2,706 | 2,974 | 2,711 | 7.5 | 0.0 | 79 | 23 | 85 | 3.9 | 3.0 |
| castle-mid · madame · beastkin/fox | 10 | 2,739 | 3,040 | 2,743 | 19 | 0.8 | 76 | 19 | 83 | 3.7 | 2.6 |
| castle-mid · madame · beastkin/cat | 10 | 2,579 | 2,883 | 2,584 | 11 | 0.0 | 76 | 21 | 84 | 3.7 | 2.6 |
| castle-mid · madame · beastkin/rabbit | 10 | 2,593 | 2,876 | 2,598 | 12 | 2.5 | 77 | 19 | 86 | 3.9 | 2.9 |
| castle-mid · madame · beastkin/dragon | 10 | 2,189 | 2,461 | 2,195 | -3.3 | 1.7 | 74 | 20 | 84 | 3.3 | 2.1 |
| castle-mid · madame · demon | 10 | 2,405 | 2,603 | 2,409 | -8.7 | 33 | 78 | 20 | 85 | 3.4 | 2.7 |
| castle-mid · madame · dwarf | 10 | 2,410 | 2,695 | 2,415 | 4.1 | 0.0 | 75 | 21 | 86 | 3.8 | 2.7 |
| castle-mid · madame · spirit | 10 | 2,284 | 2,570 | 2,289 | 17 | 2.5 | 76 | 17 | 85 | 3.2 | 2.2 |
| castle-mid · madame · angel | 10 | 2,712 | 2,991 | 2,716 | 12 | 0.0 | 76 | 24 | 85 | 4.0 | 2.8 |
| castle-mid · madame · angel/lantern | 10 | 2,243 | 2,539 | 2,248 | 16 | 1.7 | 75 | 20 | 84 | 3.6 | 2.6 |
| castle-mid · madame · android | 10 | 2,672 | 2,943 | 2,678 | -51 | 0.0 | 80 | 29 | 87 | 4.0 | 2.9 |
| sanctuary-mid · chapel · base | 10 | 2,800 | 2,809 | 2,809 | -2.5ⁿ9 | 0.0ⁿ9 | 80 | 13 | 78 | 2.5 | 1.5 |
| sanctuary-mid · chapel · elf | 10 | 2,816 | 2,825 | 2,825 | 0.0ⁿ9 | 0.0ⁿ9 | 80 | 15 | 78 | 2.5 | 1.7 |
| sanctuary-mid · chapel · beastkin/fox | 10 | 2,550 | 2,560 | 2,560 | 4.3ⁿ9 | 0.0ⁿ9 | 78 | 8.0 | 76 | 2.4 | 1.4 |
| sanctuary-mid · chapel · beastkin/cat | 10 | 2,673 | 2,682 | 2,682 | 2.2ⁿ9 | 0.0ⁿ9 | 80 | 5.8 | 77 | 2.4 | 1.5 |
| sanctuary-mid · chapel · beastkin/rabbit | 10 | 2,526 | 2,535 | 2,535 | 7.6ⁿ9 | 0.0ⁿ9 | 79 | 11 | 78 | 2.5 | 1.5 |
| sanctuary-mid · chapel · beastkin/dragon | 10 | 2,755 | 2,764 | 2,764 | -5.4ⁿ9 | 0.0ⁿ9 | 79 | 6.5 | 76 | 2.4 | 1.5 |
| sanctuary-mid · chapel · demon | 10 | 2,248 | 2,257 | 2,257 | -21ⁿ9 | 28ⁿ9 | 77 | 7.5 | 78 | 2.2 | 1.3 |
| sanctuary-mid · chapel · dwarf | 10 | 2,516 | 2,525 | 2,525 | -5.7ⁿ9 | 0.0ⁿ9 | 79 | 11 | 78 | 2.3 | 1.3 |
| sanctuary-mid · chapel · spirit | 10 | 2,749 | 2,758 | 2,758 | -1.8ⁿ9 | 0.0ⁿ9 | 81 | 13 | 79 | 2.4 | 1.5 |
| sanctuary-mid · chapel · angel | 10 | 2,816 | 2,825 | 2,825 | 24ⁿ9 | 0.0ⁿ9 | 80 | 17 | 83 | 2.6 | 1.5 |
| sanctuary-mid · chapel · angel/lantern | 10 | 2,766 | 2,775 | 2,775 | 43ⁿ9 | 0.0ⁿ9 | 79 | 12 | 79 | 2.4 | 1.6 |
| sanctuary-mid · chapel · android | 10 | 2,659 | 2,668 | 2,668 | -49ⁿ9 | 0.0ⁿ9 | 78 | 9.6 | 80 | 2.4 | 1.4 |
| sanctuary-late · chapel · base | 10 | 4,215 | 4,222 | 4,222 | 15 | 1.7 | 77 | 10 | 81 | 2.2 | 1.6 |
| sanctuary-late · chapel · elf | 10 | 4,245 | 4,252 | 4,252 | 13 | 0.0 | 77 | 9.2 | 82 | 2.2 | 1.6 |
| sanctuary-late · chapel · beastkin/fox | 10 | 4,051 | 4,058 | 4,058 | 20 | 1.7 | 74 | 9.1 | 80 | 2.2 | 1.6 |
| sanctuary-late · chapel · beastkin/cat | 10 | 4,220 | 4,227 | 4,227 | 18 | 0.8 | 77 | 9.6 | 82 | 2.2 | 1.6 |
| sanctuary-late · chapel · beastkin/rabbit | 10 | 4,220 | 4,227 | 4,227 | 23 | 1.7 | 74 | 8.7 | 81 | 2.3 | 1.6 |
| sanctuary-late · chapel · beastkin/dragon | 10 | 4,211 | 4,218 | 4,218 | 8.7 | 1.8 | 77 | 10 | 83 | 2.2 | 1.5 |
| sanctuary-late · chapel · demon | 10 | 3,933 | 3,940 | 3,940 | -22 | 25 | 76 | 11 | 80 | 2.0 | 1.5 |
| sanctuary-late · chapel · dwarf | 10 | 3,959 | 3,966 | 3,966 | 15 | 1.7 | 74 | 8.9 | 79 | 2.1 | 1.4 |
| sanctuary-late · chapel · spirit | 10 | 4,206 | 4,213 | 4,213 | 21 | 0.0 | 75 | 10 | 78 | 2.2 | 1.6 |
| sanctuary-late · chapel · angel | 10 | 4,193 | 4,200 | 4,200 | 62 | 0.8 | 76 | 12 | 85 | 2.3 | 1.6 |
| sanctuary-late · chapel · angel/lantern | 10 | 4,148 | 4,155 | 4,155 | 82 | 0.8 | 75 | 12 | 82 | 2.1 | 1.4 |
| sanctuary-late · chapel · android | 10 | 4,159 | 4,166 | 4,166 | -36 | 0.8 | 75 | 11 | 78 | 2.4 | 1.5 |
| lantern-mid · teacher · base | 10 | 159 | 159 | 159 | -28 | 3.2 | 65 | -8.5 | 44 | 18 | 5.1 |
| lantern-mid · teacher · elf | 10 | 142 | 142 | 142 | -26 | 6.5 | 65 | -6.6 | 48 | 16 | 4.7 |
| lantern-mid · teacher · beastkin/fox | 10 | 196 | 196 | 196 | -21 | 3.2 | 67 | -3.9 | 48 | 17 | 5.1 |
| lantern-mid · teacher · beastkin/cat | 10 | 200 | 200 | 200 | -21 | 2.5 | 67 | -4.5 | 48 | 16 | 4.8 |
| lantern-mid · teacher · beastkin/rabbit | 10 | 226 | 226 | 226 | -19 | 2.5 | 68 | -1.3 | 49 | 17 | 5.4 |
| lantern-mid · teacher · beastkin/dragon | 10 | 221 | 221 | 221 | -34 | 0.6 | 67 | -3.5 | 47 | 17 | 5.0 |
| lantern-mid · teacher · demon | 10 | 241 | 241 | 241 | -21 | 38 | 68 | -2.1 | 50 | 14 | 4.1 |
| lantern-mid · teacher · dwarf | 10 | 162 | 162 | 162 | -28 | 0.0 | 67 | -7.9 | 48 | 17 | 5.1 |
| lantern-mid · teacher · spirit | 10 | 197 | 197 | 197 | -28 | 8.9 | 69 | -1.5 | 50 | 16 | 5.0 |
| lantern-mid · teacher · angel | 10 | 178 | 178 | 178 | -35 | 0.0 | 67 | -5.6 | 49 | 16 | 5.0 |
| lantern-mid · teacher · angel/lantern | 10 | 189 | 189 | 189 | -24 | 6.5 | 67 | -10 | 47 | 15 | 4.6 |
| lantern-mid · teacher · android | 10 | 169 | 169 | 169 | -83 | 0.0 | 68 | -4.7 | 49 | 19 | 5.3 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ net | Δ testedNet | Δ sat | Δ repGain | Δ skillGain |
|---|---|---|---|---|---|---|
| tankard-mid · bartender · elf | +26.8 ± 74.5 | +26.8 ± 74.5 | -0.9 ± 2.0 | +1.1 ± 2.4 | -0.3 ± 1.9 | -0.4 ± 0.6 |
| tankard-mid · bartender · beastkin/fox | +67.1 ± 108.6 | +67.1 ± 108.6 | **+7.4 ± 3.9** | +1.5 ± 4.5 | +1.1 ± 1.2 | -0.2 ± 0.2 |
| tankard-mid · bartender · beastkin/cat | +57.8 ± 91.4 | +57.8 ± 91.4 | **+7.2 ± 3.6** | +2.0 ± 4.0 | +0.9 ± 1.6 | -0.2 ± 0.2 |
| tankard-mid · bartender · beastkin/rabbit | +39.0 ± 93.1 | +39.0 ± 93.1 | **+5.4 ± 3.5** | +1.6 ± 4.6 | +1.9 ± 2.7 | -0.2 ± 0.2 |
| tankard-mid · bartender · beastkin/dragon | +237.8 ± 342.9 | +237.8 ± 342.9 | +2.7 ± 9.9 | +5.0 ± 5.9 | +6.5 ± 9.1 | -0.2 ± 0.2 |
| tankard-mid · bartender · demon | +34.8 ± 63.9 | +34.8 ± 63.9 | **-15.9 ± 5.0** | +1.3 ± 4.8 | +0.0 ± 2.3 | **-0.5 ± 0.2** |
| tankard-mid · bartender · dwarf | +2.2 ± 58.9 | +2.2 ± 58.9 | **+5.6 ± 2.9** | -0.3 ± 4.1 | -0.3 ± 3.2 | **-0.2 ± 0.1** |
| tankard-mid · bartender · spirit | +17.0 ± 63.9 | +17.0 ± 63.9 | **-3.9 ± 2.3** | +1.1 ± 3.2 | +1.3 ± 2.6 | **-0.2 ± 0.2** |
| tankard-mid · bartender · angel | +26.4 ± 42.4 | +26.4 ± 42.4 | -0.8 ± 3.1 | +0.5 ± 2.3 | +0.4 ± 2.8 | **-0.2 ± 0.2** |
| tankard-mid · bartender · angel/lantern | -0.4 ± 79.7 | -0.4 ± 79.7 | -0.5 ± 2.3 | -0.8 ± 4.2 | -0.1 ± 2.1 | **-0.3 ± 0.1** |
| tankard-mid · bartender · android | +7.8 ± 53.6 | +7.8 ± 53.6 | **-52.6 ± 3.6** | +1.3 ± 3.6 | +2.7 ± 4.9 | +0.1 ± 0.2 |
| tankard-mid · dancer · elf | +37.9 ± 166.4 | +37.9 ± 166.4 | **-4.4 ± 2.3** | +1.2 ± 2.7 | +1.7 ± 6.8 | +0.3 ± 0.8 |
| tankard-mid · dancer · beastkin/fox | -56.7 ± 75.2 | -56.7 ± 75.2 | **+9.4 ± 4.1** | -0.6 ± 2.1 | -1.5 ± 4.2 | +0.0 ± 0.3 |
| tankard-mid · dancer · beastkin/cat | +38.5 ± 135.9 | +38.5 ± 135.9 | **+11.8 ± 4.6** | +0.9 ± 3.3 | +1.9 ± 6.5 | +0.3 ± 0.9 |
| tankard-mid · dancer · beastkin/rabbit | +76.7 ± 223.2 | +76.7 ± 223.2 | **+13.8 ± 5.6** | +1.5 ± 2.7 | +1.8 ± 6.7 | +0.1 ± 0.2 |
| tankard-mid · dancer · beastkin/dragon | -83.4 ± 90.6 | -83.4 ± 90.6 | **-6.7 ± 5.8** | -1.6 ± 2.8 | -1.5 ± 4.1 | -0.0 ± 0.3 |
| tankard-mid · dancer · demon | +41.8 ± 237.5 | +41.8 ± 237.5 | +4.2 ± 19.5 | +1.7 ± 5.2 | +0.8 ± 5.5 | +0.3 ± 0.8 |
| tankard-mid · dancer · dwarf | +33.1 ± 202.1 | +33.1 ± 202.1 | +3.3 ± 6.2 | +0.1 ± 3.4 | +1.4 ± 7.2 | +0.4 ± 0.7 |
| tankard-mid · dancer · spirit | -50.9 ± 127.5 | -50.9 ± 127.5 | **-6.3 ± 3.6** | +1.4 ± 3.9 | +0.2 ± 3.8 | +0.1 ± 0.2 |
| tankard-mid · dancer · angel | +16.6 ± 203.6 | +16.6 ± 203.6 | -2.2 ± 2.9 | -0.4 ± 3.7 | +2.9 ± 5.3 | -0.1 ± 0.2 |
| tankard-mid · dancer · angel/lantern | -77.3 ± 146.3 | -77.3 ± 146.3 | **-5.4 ± 4.4** | -1.2 ± 4.4 | -3.9 ± 4.8 | +0.0 ± 0.5 |
| tankard-mid · dancer · android | **-131.1 ± 81.1** | **-131.1 ± 81.1** | **-53.6 ± 3.0** | -0.5 ± 2.2 | +2.4 ± 3.4 | +0.1 ± 0.7 |
| onsen-mid · bath · elf | **+63.0 ± 49.4** | **+63.0 ± 49.4** | -1.2 ± 5.1 | +3.9 ± 4.5 | +1.7 ± 4.5 | **-0.2 ± 0.2** |
| onsen-mid · bath · beastkin/fox | +112.5 ± 203.7 | +112.5 ± 203.7 | **+25.9 ± 8.0** | +3.3 ± 6.4 | +2.4 ± 2.9 | -0.1 ± 0.2 |
| onsen-mid · bath · beastkin/cat | **+137.7 ± 123.4** | **+137.7 ± 123.4** | **+24.7 ± 13.9** | +4.8 ± 5.0 | +4.0 ± 4.6 | **-0.2 ± 0.2** |
| onsen-mid · bath · beastkin/rabbit | +76.2 ± 161.2 | +76.2 ± 161.2 | **+23.6 ± 8.7** | +2.4 ± 5.6 | +0.7 ± 2.7 | -0.1 ± 0.2 |
| onsen-mid · bath · beastkin/dragon | +113.5 ± 208.3 | +113.5 ± 208.3 | +16.9 ± 16.9 | +4.0 ± 8.2 | +4.8 ± 6.7 | -0.1 ± 0.2 |
| onsen-mid · bath · demon | +24.9 ± 107.0 | +24.9 ± 107.0 | +17.6 ± 25.4 | +0.5 ± 4.3 | +2.3 ± 4.9 | **-0.3 ± 0.2** |
| onsen-mid · bath · dwarf | +130.0 ± 260.8 | +130.0 ± 260.8 | **+20.0 ± 17.2** | +5.7 ± 9.1 | **+7.5 ± 5.1** | -0.2 ± 0.2 |
| onsen-mid · bath · spirit | **+207.9 ± 182.2** | **+207.9 ± 182.2** | -8.7 ± 9.6 | **+9.0 ± 6.9** | **+7.0 ± 6.0** | **-0.3 ± 0.2** |
| onsen-mid · bath · angel | +8.1 ± 119.1 | +8.1 ± 119.1 | +4.1 ± 9.8 | +2.6 ± 5.0 | +1.8 ± 3.9 | **-0.2 ± 0.2** |
| onsen-mid · bath · angel/lantern | **+148.5 ± 80.6** | **+148.5 ± 80.6** | **+12.4 ± 6.4** | **+6.0 ± 3.7** | **+4.9 ± 4.2** | **-0.3 ± 0.1** |
| onsen-mid · bath · android | +152.5 ± 194.8 | +152.5 ± 194.8 | **-28.2 ± 28.0** | +5.2 ± 6.9 | +4.3 ± 4.8 | -0.1 ± 0.2 |
| castle-mid · host · elf | -174.8 ± 765.3 | -174.8 ± 765.3 | +0.2 ± 4.7 | +0.6 ± 7.3 | +0.2 ± 9.2 | -0.2 ± 0.5 |
| castle-mid · host · beastkin/fox | **-669.9 ± 528.3** | **-669.9 ± 528.3** | **+7.1 ± 6.9** | -2.7 ± 4.3 | +0.7 ± 7.8 | -0.1 ± 0.5 |
| castle-mid · host · beastkin/cat | -354.0 ± 634.8 | -354.0 ± 634.8 | **+6.3 ± 5.5** | +0.1 ± 4.9 | -0.8 ± 10.5 | -0.1 ± 0.6 |
| castle-mid · host · beastkin/rabbit | **-891.0 ± 696.7** | **-891.0 ± 696.7** | **+10.8 ± 6.2** | -4.5 ± 5.5 | +1.0 ± 7.9 | -0.3 ± 0.6 |
| castle-mid · host · beastkin/dragon | -482.5 ± 1,072 | -481.8 ± 1,072 | +0.5 ± 5.3 | +0.2 ± 6.5 | +1.9 ± 13.0 | -0.2 ± 0.6 |
| castle-mid · host · demon | -597.8 ± 1,110 | -597.8 ± 1,110 | **+6.8 ± 6.5** | -0.3 ± 6.3 | -8.7 ± 16.3 | -0.5 ± 0.6 |
| castle-mid · host · dwarf | -276.3 ± 881.8 | -276.3 ± 881.8 | **+9.0 ± 7.0** | -0.2 ± 6.6 | -4.0 ± 8.6 | -0.2 ± 0.5 |
| castle-mid · host · spirit | -539.3 ± 859.1 | -539.3 ± 859.1 | -4.0 ± 4.1 | -1.5 ± 5.9 | -1.2 ± 9.9 | -0.1 ± 0.4 |
| castle-mid · host · angel | -259.2 ± 1,083 | -259.2 ± 1,083 | -1.8 ± 4.5 | -0.8 ± 6.6 | +1.5 ± 9.4 | +0.1 ± 0.4 |
| castle-mid · host · angel/lantern | -23.9 ± 868.5 | -23.9 ± 868.5 | +0.9 ± 5.6 | -0.5 ± 5.9 | -0.8 ± 11.3 | -0.2 ± 0.5 |
| castle-mid · host · android | -399.1 ± 714.8 | -398.4 ± 714.3 | **-92.3 ± 6.8** | +2.6 ± 5.8 | +0.6 ± 7.8 | -0.2 ± 0.5 |
| castle-late · host · elf | -244.1 ± 1,157 | -244.1 ± 1,157 | -1.5 ± 4.8 | -0.1 ± 2.5 | +0.3 ± 4.8 | +0.0 ± 0.2 |
| castle-late · host · beastkin/fox | -237.0 ± 817.5 | -237.2 ± 817.7 | **+12.3 ± 6.2** | -0.4 ± 2.1 | +2.4 ± 3.6 | +0.0 ± 0.1 |
| castle-late · host · beastkin/cat | +1,276 ± 1,338 | +1,276 ± 1,338 | **+11.8 ± 6.2** | **+2.3 ± 2.1** | +2.2 ± 4.0 | -0.1 ± 0.3 |
| castle-late · host · beastkin/rabbit | +305.9 ± 551.6 | +305.9 ± 551.6 | **+15.6 ± 10.4** | +0.3 ± 2.3 | +1.7 ± 3.8 | -0.1 ± 0.1 |
| castle-late · host · beastkin/dragon | **+1,117 ± 903.7** | **+1,118 ± 903.7** | -1.3 ± 6.4 | **+4.4 ± 1.9** | -0.7 ± 3.6 | -0.2 ± 0.2 |
| castle-late · host · demon | +431.1 ± 1,068 | +431.1 ± 1,068 | +5.5 ± 15.2 | +0.5 ± 3.5 | +0.3 ± 4.3 | -0.0 ± 0.3 |
| castle-late · host · dwarf | **+1,459 ± 1,199** | **+1,459 ± 1,199** | **+7.3 ± 5.5** | **+2.9 ± 2.3** | -1.7 ± 2.3 | -0.2 ± 0.3 |
| castle-late · host · spirit | +448.9 ± 1,544 | +448.9 ± 1,544 | -4.8 ± 6.1 | -1.4 ± 3.6 | -1.8 ± 3.6 | -0.2 ± 0.3 |
| castle-late · host · angel | +787.9 ± 1,327 | +787.7 ± 1,327 | -0.3 ± 8.3 | +0.7 ± 2.4 | +0.5 ± 2.9 | -0.1 ± 0.2 |
| castle-late · host · angel/lantern | -99.5 ± 1,076 | -99.7 ± 1,076 | +6.4 ± 10.4 | +0.4 ± 3.4 | +1.3 ± 4.2 | -0.1 ± 0.3 |
| castle-late · host · android | +532.4 ± 1,213 | +532.4 ± 1,213 | **-99.0 ± 7.0** | **+4.5 ± 1.9** | -2.7 ± 4.6 | -0.1 ± 0.2 |
| castle-mid · attendant · elf | -299.9 ± 532.5 | -299.2 ± 531.9 | +9.4 ± 24.0 | -1.4 ± 4.2 | -2.8 ± 4.4 | -0.2 ± 0.5 |
| castle-mid · attendant · beastkin/fox | -196.2 ± 680.2 | -196.2 ± 680.2 | -2.1 ± 33.2 | -0.9 ± 5.0 | +6.7 ± 12.2 | -0.4 ± 0.6 |
| castle-mid · attendant · beastkin/cat | -311.3 ± 633.7 | -311.3 ± 633.7 | -13.1 ± 27.9 | -0.6 ± 5.3 | +6.7 ± 11.6 | -0.5 ± 0.6 |
| castle-mid · attendant · beastkin/rabbit | -427.7 ± 597.5 | -427.7 ± 597.5 | +8.2 ± 41.2 | -2.1 ± 6.5 | -5.2 ± 7.2 | -0.6 ± 0.6 |
| castle-mid · attendant · beastkin/dragon | -105.7 ± 579.3 | -105.1 ± 578.4 | -18.0 ± 34.0 | -1.4 ± 3.9 | +5.1 ± 11.0 | -0.3 ± 0.5 |
| castle-mid · attendant · demon | -308.6 ± 765.0 | -307.9 ± 764.5 | +12.3 ± 42.4 | +0.2 ± 5.0 | +4.6 ± 11.2 | -0.5 ± 0.7 |
| castle-mid · attendant · dwarf | -346.2 ± 367.9 | -345.5 ± 367.3 | -21.8 ± 34.0 | -0.1 ± 4.8 | +2.8 ± 8.6 | -0.3 ± 0.6 |
| castle-mid · attendant · spirit | -26.9 ± 502.4 | -26.9 ± 502.4 | +4.1 ± 27.1 | +0.4 ± 4.9 | +6.9 ± 14.2 | +0.0 ± 0.4 |
| castle-mid · attendant · angel | -203.1 ± 332.7 | -203.1 ± 332.7 | +3.8 ± 29.6 | -1.9 ± 4.4 | +1.4 ± 6.5 | -0.1 ± 0.6 |
| castle-mid · attendant · angel/lantern | -0.5 ± 485.4 | +0.2 ± 484.4 | +28.1 ± 28.3 | -0.3 ± 4.7 | +6.0 ± 10.5 | +0.3 ± 0.8 |
| castle-mid · attendant · android | -40.2 ± 561.0 | -39.5 ± 560.4 | **-54.6 ± 30.3** | -0.8 ± 2.3 | +0.8 ± 14.4 | -0.1 ± 0.6 |
| castle-mid · madame · elf | +427.6 ± 607.4 | +426.9 ± 607.0 | +6.0 ± 27.4 | **+5.0 ± 4.9** | +5.0 ± 7.5 | +0.1 ± 0.7 |
| castle-mid · madame · beastkin/fox | +459.7 ± 482.7 | +459.0 ± 482.3 | +17.1 ± 19.4 | +1.8 ± 4.6 | +1.3 ± 8.4 | -0.2 ± 0.6 |
| castle-mid · madame · beastkin/cat | +300.2 ± 317.4 | +299.5 ± 316.5 | +10.0 ± 13.6 | +1.8 ± 2.8 | +2.8 ± 4.6 | -0.1 ± 0.6 |
| castle-mid · madame · beastkin/rabbit | +314.6 ± 526.7 | +314.0 ± 526.2 | **+10.3 ± 8.5** | +2.7 ± 5.3 | +1.5 ± 7.0 | +0.0 ± 0.5 |
| castle-mid · madame · beastkin/dragon | -89.4 ± 586.3 | -89.4 ± 586.3 | -4.7 ± 12.0 | +0.3 ± 4.8 | +2.3 ± 7.4 | **-0.6 ± 0.4** |
| castle-mid · madame · demon | +125.7 ± 759.8 | +125.0 ± 759.5 | -10.2 ± 10.5 | +3.5 ± 6.1 | +1.8 ± 8.5 | -0.5 ± 0.5 |
| castle-mid · madame · dwarf | +131.0 ± 383.7 | +130.3 ± 382.6 | +2.6 ± 10.1 | +1.0 ± 3.2 | +2.6 ± 6.4 | -0.1 ± 0.5 |
| castle-mid · madame · spirit | +4.8 ± 463.9 | +4.8 ± 463.9 | +15.7 ± 15.9 | +1.6 ± 6.6 | -1.3 ± 10.9 | -0.6 ± 0.8 |
| castle-mid · madame · angel | **+432.8 ± 427.5** | **+432.1 ± 427.1** | +10.2 ± 19.7 | +1.8 ± 4.0 | +6.1 ± 7.5 | +0.1 ± 0.7 |
| castle-mid · madame · angel/lantern | -35.4 ± 568.1 | -36.1 ± 567.7 | +14.1 ± 23.2 | +1.4 ± 6.0 | +2.1 ± 7.7 | -0.3 ± 0.6 |
| castle-mid · madame · android | **+393.5 ± 383.4** | **+393.5 ± 383.4** | **-52.4 ± 13.2** | **+6.2 ± 3.9** | **+11.4 ± 7.0** | +0.1 ± 0.2 |
| sanctuary-mid · chapel · elf | +15.7 ± 153.0 | +15.7 ± 153.0 | +2.5 ± 3.9 | +0.4 ± 2.6 | +1.6 ± 2.5 | +0.0 ± 0.2 |
| sanctuary-mid · chapel · beastkin/fox | -250.0 ± 459.0 | -250.0 ± 459.0 | +6.8 ± 9.2 | -2.0 ± 4.9 | -5.2 ± 8.2 | -0.0 ± 0.2 |
| sanctuary-mid · chapel · beastkin/cat | -127.2 ± 413.8 | -127.2 ± 413.8 | +4.6 ± 5.5 | +0.1 ± 4.5 | **-7.3 ± 6.0** | -0.1 ± 0.2 |
| sanctuary-mid · chapel · beastkin/rabbit | -274.5 ± 344.9 | -274.5 ± 344.9 | **+10.0 ± 8.7** | -0.7 ± 5.0 | -2.7 ± 12.0 | +0.0 ± 0.2 |
| sanctuary-mid · chapel · beastkin/dragon | -45.0 ± 429.8 | -45.0 ± 429.8 | -2.9 ± 4.7 | -0.9 ± 4.6 | **-6.7 ± 6.5** | -0.1 ± 0.2 |
| sanctuary-mid · chapel · demon | -552.1 ± 677.1 | -552.1 ± 677.1 | **-18.5 ± 5.0** | -2.8 ± 6.0 | -5.7 ± 5.7 | **-0.3 ± 0.2** |
| sanctuary-mid · chapel · dwarf | -284.0 ± 385.6 | -284.0 ± 385.6 | **-3.3 ± 2.4** | -1.0 ± 4.2 | -1.7 ± 5.3 | -0.1 ± 0.3 |
| sanctuary-mid · chapel · spirit | -51.2 ± 384.3 | -51.2 ± 384.3 | +0.7 ± 4.8 | +1.1 ± 4.2 | -0.4 ± 5.1 | -0.1 ± 0.1 |
| sanctuary-mid · chapel · angel | +15.4 ± 594.0 | +15.4 ± 594.0 | **+26.0 ± 10.9** | +0.4 ± 3.0 | +4.0 ± 5.4 | +0.1 ± 0.1 |
| sanctuary-mid · chapel · angel/lantern | -34.4 ± 204.1 | -34.4 ± 204.1 | **+45.4 ± 16.2** | -0.8 ± 3.5 | -1.6 ± 4.6 | -0.1 ± 0.2 |
| sanctuary-mid · chapel · android | -141.1 ± 549.4 | -141.1 ± 549.4 | **-46.8 ± 4.9** | -1.4 ± 3.3 | -3.6 ± 9.4 | -0.1 ± 0.2 |
| sanctuary-late · chapel · elf | +29.8 ± 220.1 | +30.0 ± 220.1 | -2.2 ± 3.0 | -0.1 ± 0.8 | -1.0 ± 2.2 | -0.1 ± 0.1 |
| sanctuary-late · chapel · beastkin/fox | -164.3 ± 337.3 | -164.3 ± 337.3 | +4.8 ± 5.0 | -2.2 ± 2.3 | -1.1 ± 3.6 | -0.0 ± 0.1 |
| sanctuary-late · chapel · beastkin/cat | +5.0 ± 428.2 | +5.0 ± 428.2 | +3.2 ± 7.7 | +0.4 ± 1.4 | -0.6 ± 4.6 | -0.0 ± 0.1 |
| sanctuary-late · chapel · beastkin/rabbit | +5.1 ± 327.1 | +5.1 ± 327.1 | **+7.9 ± 6.6** | -2.2 ± 3.8 | -1.6 ± 2.8 | +0.1 ± 0.2 |
| sanctuary-late · chapel · beastkin/dragon | -4.6 ± 432.7 | -4.6 ± 432.7 | -6.5 ± 7.1 | +0.4 ± 1.4 | +0.2 ± 4.6 | +0.0 ± 0.1 |
| sanctuary-late · chapel · demon | -282.6 ± 733.4 | -282.5 ± 733.5 | **-37.1 ± 11.1** | -1.0 ± 2.5 | +0.5 ± 4.9 | **-0.2 ± 0.1** |
| sanctuary-late · chapel · dwarf | -256.2 ± 465.2 | -256.2 ± 465.2 | -0.4 ± 4.7 | -2.5 ± 3.1 | -1.4 ± 6.7 | **-0.2 ± 0.1** |
| sanctuary-late · chapel · spirit | -9.7 ± 554.6 | -9.7 ± 554.6 | **+6.1 ± 2.6** | **-1.8 ± 1.5** | -0.2 ± 4.1 | +0.0 ± 0.1 |
| sanctuary-late · chapel · angel | -22.0 ± 466.9 | -22.0 ± 466.9 | **+47.2 ± 10.7** | -1.1 ± 2.6 | +2.1 ± 4.9 | +0.0 ± 0.1 |
| sanctuary-late · chapel · angel/lantern | -67.4 ± 369.6 | -67.4 ± 369.6 | **+67.1 ± 9.6** | -1.3 ± 1.4 | +1.5 ± 5.0 | -0.1 ± 0.1 |
| sanctuary-late · chapel · android | -56.6 ± 408.5 | -56.6 ± 408.5 | **-50.7 ± 5.7** | -1.5 ± 2.0 | +0.3 ± 4.4 | **+0.2 ± 0.1** |
| lantern-mid · teacher · elf | -17.7 ± 34.8 | -17.7 ± 34.8 | +2.1 ± 2.8 | +0.4 ± 2.2 | +1.9 ± 6.1 | **-1.7 ± 0.9** |
| lantern-mid · teacher · beastkin/fox | +36.9 ± 70.4 | +36.9 ± 70.4 | **+7.0 ± 3.3** | +2.1 ± 2.3 | **+4.6 ± 2.3** | -1.0 ± 1.1 |
| lantern-mid · teacher · beastkin/cat | +40.3 ± 62.7 | +40.3 ± 62.7 | **+6.6 ± 4.0** | +2.3 ± 2.3 | +4.0 ± 6.1 | **-1.1 ± 0.9** |
| lantern-mid · teacher · beastkin/rabbit | +66.7 ± 69.3 | +66.7 ± 69.3 | **+8.3 ± 4.1** | +3.2 ± 3.8 | **+7.2 ± 6.4** | **-1.0 ± 0.9** |
| lantern-mid · teacher · beastkin/dragon | +61.2 ± 95.2 | +61.2 ± 95.2 | **-6.5 ± 5.3** | +2.3 ± 2.9 | **+5.0 ± 4.1** | -0.9 ± 1.0 |
| lantern-mid · teacher · demon | +81.3 ± 120.7 | +81.3 ± 120.7 | **+7.1 ± 6.3** | +3.4 ± 4.5 | **+6.4 ± 6.4** | **-4.0 ± 1.6** |
| lantern-mid · teacher · dwarf | +2.9 ± 66.5 | +2.9 ± 66.5 | -0.6 ± 3.8 | +1.8 ± 2.7 | +0.6 ± 4.0 | -0.8 ± 1.1 |
| lantern-mid · teacher · spirit | +37.5 ± 73.0 | +37.5 ± 73.0 | -0.6 ± 4.0 | **+3.6 ± 2.8** | **+7.0 ± 3.4** | **-1.6 ± 1.4** |
| lantern-mid · teacher · angel | +18.2 ± 72.7 | +18.2 ± 72.7 | **-7.0 ± 5.5** | +1.7 ± 3.0 | +2.9 ± 5.4 | **-1.4 ± 0.9** |
| lantern-mid · teacher · angel/lantern | +29.7 ± 49.3 | +29.7 ± 49.3 | **+4.3 ± 3.9** | +2.2 ± 2.3 | -1.7 ± 4.7 | **-2.7 ± 1.2** |
| lantern-mid · teacher · android | +9.0 ± 56.5 | +9.0 ± 56.5 | **-54.9 ± 4.4** | **+2.9 ± 1.7** | +3.8 ± 4.2 | +1.0 ± 1.6 |

---

### incense-phases

All 5 incense blends across early4/mid/late and 5 contrasting houses (Tankard, Veil, Lantern, Castle, Conservatory 1.5x).

scenario **mid** · 12 seeds from 1 · 284s · 2026-11-20T20:24

| variant | n | houseNet | total | net | perLady | served | props | sat | mood | trust | repGain | trouble | damage | restPct | statGain | skillGain |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| early4 · tankard · base | 12 | 493 | 493 | 493 | 4.3ⁿ11 | 8.8 | 1.1 | 65 | 80 | 53 | -0.9 | 1.0 | 22 | 11 | 1.3 | 1.7 |
| early4 · tankard · calm | 12 | 511 | 511 | 511 | 5.2ⁿ11 | 9.3 | 1.0 | 64 | 83 | 52 | -0.1 | 0.5 | 10 | 12 | 1.3 | 1.8 |
| early4 · tankard · aphro | 12 | 452 | 452 | 452 | 2.9 | 8.5 | 1.6 | 63 | 81 | 53 | -3.5 | 1.0 | 23 | 12 | 0.8 | 1.3 |
| early4 · tankard · focus | 12 | 489 | 489 | 489 | 1.7 | 8.9 | 1.1 | 64 | 81 | 52 | -4.7 | 0.9 | 16 | 11 | 1.1 | 1.7 |
| early4 · tankard · velvet | 12 | 523 | 523 | 523 | 9.0ⁿ11 | 9.8 | 0.9 | 66 | 81 | 53 | 2.5 | 0.9 | 18 | 11 | 1.4 | 1.8 |
| early4 · tankard · amber | 12 | 655 | 655 | 655 | 1.2ⁿ11 | 11 | 1.0 | 68 | 82 | 52 | 4.7 | 1.1 | 20 | 5.5 | 1.5 | 1.9 |
| early4 · veil · base | 12 | 3,610 | 3,610 | 3,610 | -26 | 16 | 1.3 | 81 | 71 | 50 | 8.4 | 1.6 | 31 | 3.6 | 2.1 | 1.8 |
| early4 · veil · calm | 12 | 3,912 | 3,912 | 3,912 | -28 | 16 | 0.8 | 81 | 74 | 51 | 11 | 0.9 | 20 | 3.5 | 2.3 | 2.1 |
| early4 · veil · aphro | 12 | 3,633 | 3,633 | 3,633 | -25 | 16 | 2.0 | 81 | 72 | 52 | 7.6 | 1.5 | 30 | 6.4 | 2.2 | 2.0 |
| early4 · veil · focus | 12 | 3,612 | 3,612 | 3,612 | -27 | 15 | 1.2 | 82 | 72 | 52 | 8.8 | 1.6 | 31 | 3.1 | 2.1 | 1.9 |
| early4 · veil · velvet | 12 | 3,812 | 3,812 | 3,812 | -27 | 16 | 0.9 | 84 | 72 | 52 | 13 | 1.5 | 30 | 4.2 | 2.2 | 1.7 |
| early4 · veil · amber | 12 | 3,363 | 3,363 | 3,363 | -28 | 16 | 1.2 | 81 | 75 | 51 | 9.1 | 1.5 | 27 | 1.1 | 2.4 | 2.3 |
| early4 · lantern · base | 12 | 531 | 531 | 531 | 28 | 10 | 0.9 | 55 | 81 | 56 | -7.7 | 0.8 | 17 | 13 | 1.1 | 2.0 |
| early4 · lantern · calm | 12 | 559 | 559 | 559 | 26 | 9.9 | 0.6 | 56 | 85 | 56 | -6.8 | 0.3 | 5.5 | 13 | 1.0 | 2.0 |
| early4 · lantern · aphro | 12 | 555 | 555 | 555 | 30 | 10 | 1.2 | 56 | 81 | 57 | -7.4 | 0.6 | 14 | 13 | 1.2 | 2.0 |
| early4 · lantern · focus | 12 | 537 | 537 | 537 | 29 | 9.7 | 0.6 | 56 | 81 | 56 | -5.9 | 0.6 | 16 | 13 | 1.1 | 2.5 |
| early4 · lantern · velvet | 12 | 542 | 542 | 542 | 26 | 10 | 0.7 | 59 | 80 | 56 | -6.7 | 0.8 | 21 | 14 | 1.2 | 2.0 |
| early4 · lantern · amber | 12 | 744 | 744 | 744 | 32 | 12 | 1.1 | 58 | 85 | 57 | -2.8 | 0.7 | 14 | 7.6 | 1.2 | 2.3 |
| early4 · castle · base | 12 | 1,829 | 1,829 | 1,829 | -13ⁿ11 | 10 | 0.9 | 74 | 69 | 57 | 9.9 | 0.3 | 3.7 | 4.2 | 2.5 | 2.4 |
| early4 · castle · calm | 12 | 1,906 | 1,906 | 1,906 | -21ⁿ11 | 10 | 0.4 | 76 | 69 | 55 | 11 | 0.1 | 3.7 | 3.1 | 2.5 | 2.4 |
| early4 · castle · aphro | 12 | 2,072 | 2,072 | 2,072 | -18ⁿ11 | 9.8 | 1.2 | 77 | 68 | 56 | 12 | 0.3 | 8.9 | 5.1 | 2.7 | 2.3 |
| early4 · castle · focus | 12 | 1,957 | 1,957 | 1,957 | -17ⁿ11 | 10 | 0.7 | 77 | 67 | 55 | 14 | 0.3 | 6.3 | 4.0 | 2.7 | 2.6 |
| early4 · castle · velvet | 12 | 1,858 | 1,858 | 1,858 | -9.5ⁿ11 | 10 | 0.8 | 78 | 69 | 58 | 11 | 0.3 | 7.7 | 3.8 | 2.9 | 3.0 |
| early4 · castle · amber | 12 | 1,647 | 1,647 | 1,647 | -26ⁿ11 | 9.7 | 0.8 | 76 | 72 | 56 | 9.8 | 0.3 | 4.9 | 1.6 | 3.2 | 2.9 |
| early4 · conservatory · base | 12 | 1,474 | 1,474 | 1,474 | 39 | 13 | 1.3 | 73 | 76 | 50 | 2.0 | 0.6 | 9.8 | 12 | 1.6 | 2.3 |
| early4 · conservatory · calm | 12 | 1,484 | 1,484 | 1,484 | 41 | 14 | 0.9 | 73 | 79 | 50 | 7.1 | 0.2 | 3.8 | 12 | 1.7 | 2.5 |
| early4 · conservatory · aphro | 12 | 1,458 | 1,458 | 1,458 | 62 | 13 | 1.7 | 72 | 77 | 50 | 5.4 | 0.5 | 10 | 10 | 1.7 | 2.0 |
| early4 · conservatory · focus | 12 | 1,557 | 1,557 | 1,557 | 53 | 13 | 1.1 | 74 | 75 | 51 | 6.5 | 0.5 | 9.6 | 12 | 2.5 | 3.3 |
| early4 · conservatory · velvet | 12 | 1,449 | 1,449 | 1,449 | 41 | 13 | 1.2 | 77 | 75 | 51 | 6.6 | 0.6 | 10 | 12 | 1.7 | 2.2 |
| early4 · conservatory · amber | 12 | 1,998 | 1,998 | 1,998 | 2.1 | 13 | 1.6 | 80 | 78 | 50 | 15 | 0.5 | 7.8 | 6.3 | 2.1 | 2.1 |
| mid · tankard · base | 12 | 567 | 567 | 567 | 11 | 15 | 2.2 | 63 | 83 | 42 | 6.6 | 0.9 | 14 | 7.2 | -1.6 | -1.0 |
| mid · tankard · calm | 12 | 624 | 624 | 624 | 9.3 | 15 | 1.8 | 63 | 85 | 44 | 6.9 | 0.6 | 14 | 8.4 | -1.3 | -0.4 |
| mid · tankard · aphro | 12 | 532 | 532 | 532 | 16 | 14 | 2.7 | 63 | 83 | 42 | 7.2 | 1.0 | 21 | 8.7 | -1.6 | -0.8 |
| mid · tankard · focus | 12 | 672 | 672 | 672 | 7.8 | 15 | 1.9 | 66 | 82 | 42 | 8.9 | 1.1 | 20 | 7.1 | -0.5 | 0.3 |
| mid · tankard · velvet | 12 | 689 | 689 | 689 | 19 | 17 | 2.1 | 66 | 83 | 43 | 8.3 | 0.9 | 21 | 8.1 | -1.5 | -1.1 |
| mid · tankard · amber | 12 | 1,004 | 1,004 | 1,004 | 25 | 22 | 2.0 | 66 | 83 | 40 | 18 | 1.0 | 17 | 3.6 | -1.6 | -1.9 |
| mid · veil · base | 12 | 4,613 | 4,618 | 4,618 | -4.6 | 25 | 5.1 | 78 | 75 | 37 | 12 | 1.4 | 26 | 6.9 | -1.0 | -0.0 |
| mid · veil · calm | 12 | 4,514 | 4,519 | 4,519 | 2.3 | 27 | 4.8 | 76 | 76 | 35 | 12 | 1.1 | 19 | 5.4 | -0.1 | 0.5 |
| mid · veil · aphro | 12 | 4,454 | 4,459 | 4,459 | -5.8 | 24 | 6.7 | 77 | 77 | 36 | 10 | 1.4 | 20 | 8.0 | -0.5 | 0.1 |
| mid · veil · focus | 12 | 3,581 | 3,586 | 3,586 | 7.2 | 25 | 5.2 | 71 | 75 | 37 | 7.1 | 1.1 | 17 | 7.0 | -0.5 | 0.9 |
| mid · veil · velvet | 12 | 4,340 | 4,345 | 4,345 | -4.7 | 23 | 5.3 | 80 | 75 | 38 | 12 | 1.2 | 16 | 7.4 | -0.9 | 0.5 |
| mid · veil · amber | 12 | 4,456 | 4,461 | 4,461 | -3.8 | 25 | 5.4 | 80 | 77 | 37 | 15 | 1.5 | 27 | 3.8 | -1.0 | 0.1 |
| mid · lantern · base | 12 | 553 | 791 | 553 | 45 | 15 | 2.8 | 63 | 83 | 42 | 6.1 | 0.8 | 12 | 9.3 | -1.7 | -0.7 |
| mid · lantern · calm | 12 | 661 | 902 | 661 | 61 | 18 | 2.4 | 62 | 86 | 41 | 15 | 0.6 | 8.5 | 8.6 | -1.5 | -1.5 |
| mid · lantern · aphro | 12 | 585 | 729 | 585 | 50 | 16 | 3.0 | 59 | 82 | 41 | 11 | 0.8 | 9.2 | 9.5 | -1.7 | -0.5 |
| mid · lantern · focus | 12 | 597 | 831 | 597 | 60 | 16 | 2.4 | 63 | 84 | 43 | 11 | 0.8 | 9.0 | 9.4 | -1.2 | -0.2 |
| mid · lantern · velvet | 12 | 686 | 836 | 686 | 57 | 17 | 2.6 | 66 | 81 | 43 | 16 | 0.7 | 12 | 8.0 | -1.4 | -1.3 |
| mid · lantern · amber | 12 | 810 | 1,046 | 810 | 77 | 19 | 3.2 | 65 | 85 | 40 | 24 | 0.7 | 16 | 4.7 | -1.4 | -1.6 |
| mid · castle · base | 12 | 2,948 | 2,956 | 2,956 | 33 | 16 | 2.5 | 74 | 73 | 36 | 24 | 0.4 | 6.9 | 4.3 | -1.6 | -4.4 |
| mid · castle · calm | 12 | 3,577 | 3,585 | 3,585 | 33 | 17 | 1.4 | 75 | 74 | 32 | 22 | 0.3 | 5.2 | 4.7 | -2.3 | -6.5 |
| mid · castle · aphro | 12 | 3,264 | 3,272 | 3,272 | 25 | 15 | 2.9 | 78 | 72 | 36 | 21 | 0.4 | 11 | 4.5 | -0.9 | -4.0 |
| mid · castle · focus | 12 | 2,936 | 2,944 | 2,944 | 53 | 16 | 1.9 | 71 | 72 | 38 | 19 | 0.4 | 2.5 | 4.9 | -1.4 | -4.0 |
| mid · castle · velvet | 12 | 3,280 | 3,287 | 3,287 | 34 | 15 | 2.2 | 80 | 73 | 38 | 24 | 0.4 | 8.0 | 4.5 | -1.2 | -4.3 |
| mid · castle · amber | 12 | 3,581 | 3,589 | 3,589 | 5.8 | 16 | 2.1 | 82 | 74 | 33 | 24 | 0.4 | 9.3 | 2.5 | -2.4 | -6.0 |
| mid · conservatory · base | 12 | 2,010 | 2,010 | 2,010 | 81 | 21 | 4.4 | 73 | 77 | 35 | 19 | 0.7 | 12 | 7.1 | -1.3 | -0.9 |
| mid · conservatory · calm | 12 | 2,298 | 2,298 | 2,298 | 53 | 21 | 2.9 | 75 | 80 | 34 | 19 | 0.3 | 6.0 | 6.4 | -1.0 | -1.0 |
| mid · conservatory · aphro | 12 | 1,874 | 1,874 | 1,874 | 92 | 19 | 6.1 | 73 | 78 | 35 | 12 | 0.6 | 5.0 | 6.6 | -1.3 | -1.5 |
| mid · conservatory · focus | 12 | 2,014 | 2,014 | 2,014 | 70 | 20 | 3.9 | 74 | 75 | 32 | 19 | 0.7 | 14 | 6.5 | -1.6 | -1.2 |
| mid · conservatory · velvet | 12 | 1,899 | 1,899 | 1,899 | 78 | 20 | 4.6 | 76 | 78 | 38 | 17 | 0.8 | 11 | 6.3 | -0.9 | -0.2 |
| mid · conservatory · amber | 12 | 2,615 | 2,615 | 2,615 | 65 | 21 | 5.0 | 77 | 79 | 35 | 21 | 0.8 | 17 | 4.6 | -1.2 | -0.8 |
| late · tankard · base | 12 | 1,301 | 1,304 | 1,304 | 74 | 26 | 4.0 | 62 | 87 | 57 | 11 | 0.5 | 12 | 7.1 | 1.1 | 1.8 |
| late · tankard · calm | 12 | 1,247 | 1,250 | 1,250 | 74 | 26 | 3.4 | 61 | 89 | 56 | 9.1 | 0.3 | 4.5 | 7.2 | 1.0 | 1.6 |
| late · tankard · aphro | 12 | 1,231 | 1,234 | 1,234 | 75 | 25 | 5.4 | 62 | 88 | 57 | 10.0 | 0.5 | 13 | 8.5 | 1.3 | 1.7 |
| late · tankard · focus | 12 | 1,237 | 1,240 | 1,240 | 74 | 26 | 4.1 | 62 | 86 | 56 | 13 | 0.4 | 9.0 | 6.9 | 1.4 | 2.3 |
| late · tankard · velvet | 12 | 1,245 | 1,247 | 1,247 | 72 | 26 | 4.1 | 65 | 87 | 58 | 16 | 0.4 | 6.7 | 7.4 | 1.5 | 1.9 |
| late · tankard · amber | 12 | 1,649 | 1,652 | 1,652 | 91 | 31 | 4.6 | 63 | 88 | 58 | 13 | 0.6 | 17 | 3.0 | 1.3 | 1.8 |
| late · veil · base | 12 | 6,191 | 6,208 | 6,208 | 13 | 29 | 7.5 | 77 | 80 | 42 | 17 | 0.5 | 10 | 6.9 | 2.2 | 3.6 |
| late · veil · calm | 12 | 6,465 | 6,482 | 6,482 | 8.9 | 30 | 6.2 | 79 | 83 | 43 | 19 | 0.4 | 7.6 | 7.0 | 2.2 | 3.7 |
| late · veil · aphro | 12 | 6,122 | 6,138 | 6,138 | 10 | 29 | 9.0 | 78 | 81 | 43 | 17 | 0.7 | 16 | 7.9 | 2.1 | 3.4 |
| late · veil · focus | 12 | 6,380 | 6,397 | 6,397 | 12 | 30 | 7.0 | 78 | 80 | 43 | 17 | 0.5 | 8.3 | 7.5 | 2.2 | 4.0 |
| late · veil · velvet | 12 | 6,219 | 6,235 | 6,235 | 11 | 30 | 8.1 | 80 | 81 | 44 | 16 | 0.7 | 13 | 7.1 | 2.1 | 3.4 |
| late · veil · amber | 12 | 6,112 | 6,128 | 6,128 | 14 | 30 | 7.7 | 80 | 83 | 43 | 17 | 0.6 | 6.9 | 4.7 | 2.2 | 3.6 |
| late · lantern · base | 12 | 1,702 | 1,961 | 1,713 | 101 | 27 | 4.7 | 65 | 86 | 57 | 17 | 0.4 | 7.1 | 5.8 | 1.2 | 1.8 |
| late · lantern · calm | 12 | 1,757 | 1,981 | 1,767 | 105 | 28 | 4.3 | 66 | 87 | 56 | 19 | 0.4 | 9.8 | 6.7 | 1.2 | 1.9 |
| late · lantern · aphro | 12 | 1,728 | 1,900 | 1,739 | 99 | 26 | 5.3 | 65 | 85 | 56 | 18 | 0.3 | 5.8 | 7.5 | 1.3 | 1.7 |
| late · lantern · focus | 12 | 1,847 | 2,052 | 1,857 | 104 | 28 | 4.3 | 66 | 84 | 56 | 20 | 0.4 | 12 | 6.4 | 1.2 | 2.4 |
| late · lantern · velvet | 12 | 1,872 | 2,094 | 1,882 | 106 | 28 | 4.9 | 69 | 86 | 58 | 22 | 0.3 | 7.3 | 7.2 | 1.5 | 2.0 |
| late · lantern · amber | 12 | 2,087 | 2,341 | 2,097 | 99 | 28 | 5.2 | 70 | 87 | 57 | 19 | 0.5 | 10 | 3.0 | 1.1 | 1.8 |
| late · castle · base | 11 (+1 unreached) | 9,126 | 9,136 | 9,136 | 82 | 26 | 7.1 | 76 | 87 | 50 | 12 | 0.2 | 3.2 | 4.7 | 1.2 | 2.1 |
| late · castle · calm | 11 (+1 unreached) | 9,277 | 9,288 | 9,288 | 76 | 27 | 6.3 | 78 | 89 | 50 | 12 | 0.1 | 2.5 | 4.8 | 1.2 | 2.2 |
| late · castle · aphro | 11 (+1 unreached) | 8,756 | 8,768 | 8,768 | 76 | 25 | 8.4 | 77 | 88 | 51 | 11 | 0.1 | 4.1 | 4.8 | 1.3 | 2.1 |
| late · castle · focus | 11 (+1 unreached) | 9,674 | 9,685 | 9,685 | 77 | 26 | 6.8 | 78 | 87 | 51 | 13 | 0.2 | 1.5 | 4.6 | 1.2 | 2.4 |
| late · castle · velvet | 11 (+1 unreached) | 8,852 | 8,863 | 8,863 | 73 | 25 | 7.3 | 81 | 88 | 52 | 13 | 0.2 | 1.2 | 4.7 | 1.2 | 2.1 |
| late · castle · amber | 11 (+1 unreached) | 9,535 | 9,545 | 9,545 | 63 | 25 | 7.1 | 80 | 90 | 51 | 12 | 0.1 | 1.0 | 3.6 | 1.2 | 2.2 |
| late · conservatory · base | 12 | 3,379 | 3,389 | 3,389 | 131 | 26 | 6.8 | 75 | 84 | 46 | 18 | 0.6 | 9.1 | 7.6 | 1.4 | 2.1 |
| late · conservatory · calm | 12 | 3,551 | 3,560 | 3,560 | 125 | 27 | 5.8 | 74 | 87 | 46 | 20 | 0.2 | 2.9 | 7.5 | 1.3 | 2.3 |
| late · conservatory · aphro | 12 | 3,305 | 3,315 | 3,315 | 122 | 24 | 8.6 | 76 | 85 | 47 | 16 | 0.6 | 17 | 8.3 | 1.3 | 2.1 |
| late · conservatory · focus | 12 | 3,391 | 3,400 | 3,400 | 149 | 27 | 6.8 | 73 | 84 | 46 | 18 | 0.6 | 12 | 8.1 | 1.4 | 2.9 |
| late · conservatory · velvet | 12 | 3,511 | 3,521 | 3,521 | 136 | 26 | 7.2 | 78 | 84 | 47 | 20 | 0.5 | 7.1 | 7.8 | 1.3 | 2.1 |
| late · conservatory · amber | 12 | 3,843 | 3,853 | 3,853 | 109 | 24 | 6.9 | 80 | 88 | 47 | 19 | 0.7 | 12 | 4.5 | 1.5 | 2.0 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ net | Δ sat | Δ trouble | Δ restPct | Δ statGain | Δ skillGain |
|---|---|---|---|---|---|---|---|
| early4 · tankard · calm | +17.6 ± 37.3 | +17.6 ± 37.3 | -0.5 ± 1.7 | **-0.5 ± 0.2** | +0.8 ± 1.8 | -0.1 ± 0.1 | +0.1 ± 0.1 |
| early4 · tankard · aphro | -41.3 ± 49.9 | -41.3 ± 49.9 | **-2.1 ± 1.8** | +0.0 ± 0.3 | +0.3 ± 2.2 | -0.6 ± 0.9 | -0.4 ± 0.8 |
| early4 · tankard · focus | -4.8 ± 68.3 | -4.8 ± 68.3 | -0.3 ± 1.7 | -0.0 ± 0.2 | -0.0 ± 1.9 | -0.2 ± 0.5 | -0.0 ± 0.8 |
| early4 · tankard · velvet | +29.5 ± 60.8 | +29.5 ± 60.8 | +1.5 ± 1.8 | -0.1 ± 0.2 | -0.7 ± 1.8 | +0.0 ± 0.1 | +0.1 ± 0.1 |
| early4 · tankard · amber | **+161.1 ± 87.3** | **+161.1 ± 87.3** | **+3.2 ± 1.5** | **+0.1 ± 0.1** | **-5.9 ± 2.7** | +0.2 ± 0.2 | **+0.2 ± 0.2** |
| early4 · veil · calm | +301.3 ± 394.5 | +301.3 ± 394.5 | +0.1 ± 0.9 | **-0.7 ± 0.2** | -0.2 ± 2.0 | +0.3 ± 0.8 | +0.3 ± 1.1 |
| early4 · veil · aphro | +22.8 ± 297.3 | +22.8 ± 297.3 | -0.4 ± 0.9 | -0.1 ± 0.3 | **+2.7 ± 1.6** | +0.1 ± 0.7 | +0.2 ± 1.1 |
| early4 · veil · focus | +1.7 ± 240.1 | +1.7 ± 240.1 | +0.6 ± 0.7 | -0.0 ± 0.2 | -0.5 ± 2.0 | -0.0 ± 0.4 | +0.1 ± 0.9 |
| early4 · veil · velvet | +202.1 ± 366.1 | +202.1 ± 366.1 | **+2.8 ± 1.0** | -0.1 ± 0.3 | +0.5 ± 2.9 | +0.1 ± 0.6 | -0.0 ± 0.9 |
| early4 · veil · amber | **-247.0 ± 212.7** | **-247.0 ± 212.7** | -0.3 ± 0.8 | -0.1 ± 0.1 | **-2.5 ± 1.5** | +0.4 ± 0.4 | +0.5 ± 0.6 |
| early4 · lantern · calm | +28.0 ± 95.8 | +28.0 ± 95.8 | +0.9 ± 1.7 | **-0.5 ± 0.2** | -0.1 ± 2.4 | -0.0 ± 0.2 | -0.0 ± 0.1 |
| early4 · lantern · aphro | +24.2 ± 81.9 | +24.2 ± 81.9 | +0.5 ± 2.7 | **-0.2 ± 0.2** | +0.2 ± 1.8 | +0.1 ± 0.2 | -0.0 ± 0.2 |
| early4 · lantern · focus | +5.8 ± 66.4 | +5.8 ± 66.4 | +0.9 ± 2.1 | -0.2 ± 0.2 | -0.0 ± 1.6 | +0.1 ± 0.2 | **+0.5 ± 0.3** |
| early4 · lantern · velvet | +10.9 ± 86.1 | +10.9 ± 86.1 | **+3.5 ± 2.5** | -0.1 ± 0.2 | +0.7 ± 1.2 | +0.1 ± 0.3 | +0.0 ± 0.3 |
| early4 · lantern · amber | **+213.0 ± 96.0** | **+213.0 ± 96.0** | **+3.0 ± 2.4** | -0.1 ± 0.2 | **-5.3 ± 1.8** | +0.2 ± 0.2 | **+0.3 ± 0.2** |
| early4 · castle · calm | +77.5 ± 260.9 | +77.5 ± 260.9 | +1.7 ± 1.9 | **-0.1 ± 0.1** | -1.1 ± 2.5 | -0.0 ± 0.6 | -0.0 ± 0.4 |
| early4 · castle · aphro | +242.7 ± 300.9 | +242.7 ± 300.9 | **+2.2 ± 2.0** | +0.0 ± 0.1 | +0.9 ± 3.1 | +0.1 ± 0.9 | -0.1 ± 0.6 |
| early4 · castle · focus | +127.7 ± 188.9 | +127.7 ± 188.9 | **+2.4 ± 1.6** | -0.0 ± 0.1 | -0.2 ± 2.7 | +0.2 ± 0.6 | +0.2 ± 0.4 |
| early4 · castle · velvet | +29.3 ± 220.3 | +29.3 ± 220.3 | **+3.5 ± 2.5** | +0.0 ± 0.1 | -0.4 ± 2.3 | +0.4 ± 1.3 | +0.6 ± 1.4 |
| early4 · castle · amber | **-181.9 ± 150.9** | **-181.9 ± 150.9** | **+1.6 ± 1.2** | +0.0 ± 0.1 | **-2.6 ± 1.9** | +0.6 ± 0.8 | +0.5 ± 0.7 |
| early4 · conservatory · calm | +9.6 ± 116.0 | +9.6 ± 116.0 | -0.7 ± 1.6 | **-0.4 ± 0.1** | -0.3 ± 1.9 | +0.1 ± 0.2 | **+0.2 ± 0.2** |
| early4 · conservatory · aphro | -16.8 ± 152.8 | -16.8 ± 152.8 | -1.0 ± 2.2 | -0.0 ± 0.2 | -1.7 ± 3.1 | +0.1 ± 0.4 | -0.3 ± 0.4 |
| early4 · conservatory · focus | **+82.2 ± 64.0** | **+82.2 ± 64.0** | +0.2 ± 1.2 | -0.0 ± 0.1 | -0.3 ± 1.5 | +0.9 ± 1.1 | **+1.0 ± 0.5** |
| early4 · conservatory · velvet | -24.9 ± 94.3 | -24.9 ± 94.3 | **+3.8 ± 1.1** | +0.0 ± 0.2 | -0.3 ± 2.4 | +0.1 ± 0.2 | -0.0 ± 0.2 |
| early4 · conservatory · amber | **+523.2 ± 195.0** | **+523.2 ± 195.0** | **+7.0 ± 2.0** | -0.1 ± 0.1 | **-5.9 ± 2.4** | **+0.5 ± 0.3** | -0.1 ± 0.2 |
| mid · tankard · calm | +56.9 ± 190.1 | +56.9 ± 190.1 | +0.3 ± 3.6 | **-0.3 ± 0.2** | +1.2 ± 1.6 | +0.3 ± 1.3 | +0.6 ± 1.2 |
| mid · tankard · aphro | -35.4 ± 82.0 | -35.4 ± 82.0 | +0.4 ± 2.2 | +0.1 ± 0.2 | +1.6 ± 2.2 | +0.0 ± 1.1 | +0.3 ± 1.4 |
| mid · tankard · focus | +105.0 ± 256.6 | +105.0 ± 256.6 | +3.6 ± 4.3 | **+0.2 ± 0.1** | -0.0 ± 0.9 | **+1.1 ± 1.0** | **+1.3 ± 0.9** |
| mid · tankard · velvet | +121.7 ± 291.6 | +121.7 ± 291.6 | +3.5 ± 4.1 | +0.0 ± 0.2 | +0.9 ± 2.2 | +0.2 ± 0.9 | -0.0 ± 1.4 |
| mid · tankard · amber | **+437.1 ± 316.9** | **+437.1 ± 316.9** | **+3.8 ± 3.8** | +0.1 ± 0.2 | **-3.6 ± 1.5** | +0.0 ± 0.9 | -0.9 ± 1.3 |
| mid · veil · calm | -99.1 ± 1,492 | -99.1 ± 1,492 | -2.6 ± 10.0 | -0.3 ± 0.4 | -1.5 ± 2.7 | +0.9 ± 1.0 | +0.5 ± 0.6 |
| mid · veil · aphro | -158.9 ± 1,549 | -158.9 ± 1,549 | -1.2 ± 10.9 | -0.1 ± 0.5 | +1.1 ± 3.1 | +0.6 ± 0.9 | +0.1 ± 0.9 |
| mid · veil · focus | -1,032 ± 1,652 | -1,032 ± 1,652 | -7.3 ± 11.5 | -0.3 ± 0.4 | +0.1 ± 3.0 | +0.5 ± 1.0 | +0.9 ± 1.0 |
| mid · veil · velvet | -272.9 ± 1,512 | -272.9 ± 1,512 | +1.7 ± 9.7 | -0.3 ± 0.4 | +0.5 ± 3.2 | +0.1 ± 0.9 | +0.5 ± 1.0 |
| mid · veil · amber | -157.4 ± 1,363 | -157.4 ± 1,363 | +2.1 ± 8.3 | +0.1 ± 0.4 | **-3.1 ± 2.0** | +0.0 ± 0.5 | +0.2 ± 0.3 |
| mid · lantern · calm | **+107.9 ± 90.4** | **+107.9 ± 90.4** | -1.0 ± 2.4 | **-0.2 ± 0.2** | -0.7 ± 2.4 | +0.2 ± 0.7 | -0.8 ± 1.0 |
| mid · lantern · aphro | +31.8 ± 122.6 | +31.8 ± 122.6 | **-3.8 ± 3.2** | -0.0 ± 0.1 | +0.2 ± 2.3 | +0.0 ± 1.1 | +0.2 ± 1.4 |
| mid · lantern · focus | +43.5 ± 110.6 | +43.5 ± 110.6 | +0.0 ± 2.0 | -0.1 ± 0.2 | +0.1 ± 2.1 | +0.5 ± 1.1 | +0.5 ± 1.0 |
| mid · lantern · velvet | **+132.1 ± 127.1** | **+132.1 ± 127.1** | +2.3 ± 2.9 | -0.1 ± 0.2 | -1.3 ± 2.4 | +0.3 ± 1.1 | -0.6 ± 1.1 |
| mid · lantern · amber | **+256.3 ± 117.7** | **+256.3 ± 117.7** | +1.4 ± 3.3 | -0.1 ± 0.2 | **-4.5 ± 2.5** | +0.3 ± 1.0 | -1.0 ± 1.3 |
| mid · castle · calm | **+629.0 ± 476.7** | **+629.0 ± 476.7** | +1.4 ± 3.4 | -0.1 ± 0.2 | +0.3 ± 1.5 | -0.7 ± 1.5 | **-2.0 ± 1.7** |
| mid · castle · aphro | +316.0 ± 421.7 | +316.0 ± 421.7 | **+4.1 ± 3.3** | +0.0 ± 0.1 | +0.2 ± 2.1 | +0.7 ± 1.0 | +0.4 ± 1.4 |
| mid · castle · focus | -12.2 ± 447.8 | -12.2 ± 447.8 | -2.5 ± 4.8 | -0.1 ± 0.1 | +0.6 ± 0.9 | +0.2 ± 1.1 | +0.4 ± 1.5 |
| mid · castle · velvet | +332.1 ± 703.1 | +331.5 ± 702.9 | **+5.9 ± 3.3** | -0.0 ± 0.2 | +0.2 ± 1.3 | +0.4 ± 0.9 | +0.1 ± 1.2 |
| mid · castle · amber | **+633.3 ± 363.7** | **+633.3 ± 363.7** | **+7.7 ± 4.0** | -0.0 ± 0.1 | **-1.8 ± 1.4** | -0.8 ± 1.0 | **-1.5 ± 1.2** |
| mid · conservatory · calm | +288.2 ± 531.8 | +288.2 ± 531.8 | +2.2 ± 5.3 | **-0.5 ± 0.2** | -0.7 ± 1.5 | +0.3 ± 1.0 | -0.0 ± 1.0 |
| mid · conservatory · aphro | -135.5 ± 287.6 | -135.5 ± 287.6 | +0.6 ± 2.7 | -0.2 ± 0.2 | -0.4 ± 1.5 | +0.1 ± 1.2 | -0.6 ± 1.3 |
| mid · conservatory · focus | +4.2 ± 308.8 | +4.2 ± 308.8 | +1.7 ± 3.1 | +0.0 ± 0.2 | -0.6 ± 1.0 | -0.3 ± 1.0 | -0.2 ± 0.7 |
| mid · conservatory · velvet | -111.0 ± 274.1 | -111.0 ± 274.1 | **+3.4 ± 2.8** | +0.0 ± 0.2 | -0.7 ± 1.2 | +0.4 ± 0.5 | +0.7 ± 0.8 |
| mid · conservatory · amber | **+605.6 ± 327.9** | **+605.6 ± 327.9** | +4.4 ± 5.1 | +0.1 ± 0.3 | **-2.5 ± 1.3** | +0.2 ± 0.7 | +0.2 ± 1.1 |
| late · tankard · calm | -53.8 ± 194.1 | -53.8 ± 194.1 | -0.6 ± 2.6 | -0.2 ± 0.2 | +0.1 ± 1.2 | -0.2 ± 0.2 | **-0.2 ± 0.2** |
| late · tankard · aphro | -70.1 ± 204.5 | -70.1 ± 204.5 | -0.2 ± 2.9 | +0.0 ± 0.3 | **+1.4 ± 1.3** | +0.1 ± 0.3 | -0.1 ± 0.2 |
| late · tankard · focus | -64.0 ± 105.5 | -64.0 ± 105.5 | +0.1 ± 2.1 | -0.0 ± 0.2 | -0.2 ± 1.0 | **+0.3 ± 0.3** | **+0.4 ± 0.2** |
| late · tankard · velvet | -56.5 ± 148.4 | -56.5 ± 148.4 | **+2.8 ± 2.4** | -0.1 ± 0.2 | +0.4 ± 1.3 | **+0.3 ± 0.3** | +0.0 ± 0.2 |
| late · tankard · amber | **+347.6 ± 237.0** | **+347.7 ± 237.0** | +1.5 ± 3.6 | +0.1 ± 0.4 | **-4.0 ± 1.6** | +0.2 ± 0.3 | -0.1 ± 0.2 |
| late · veil · calm | +274.0 ± 469.7 | +274.0 ± 470.2 | +2.1 ± 2.2 | -0.1 ± 0.3 | +0.1 ± 0.8 | -0.0 ± 0.3 | +0.1 ± 0.4 |
| late · veil · aphro | -69.4 ± 363.1 | -69.9 ± 363.5 | +1.0 ± 1.6 | +0.2 ± 0.2 | **+1.1 ± 1.0** | -0.1 ± 0.2 | **-0.2 ± 0.1** |
| late · veil · focus | +188.8 ± 330.4 | +189.2 ± 331.5 | +0.5 ± 1.0 | -0.1 ± 0.1 | +0.7 ± 0.8 | +0.0 ± 0.5 | +0.3 ± 0.6 |
| late · veil · velvet | +27.3 ± 408.6 | +26.9 ± 409.0 | **+2.8 ± 1.3** | +0.2 ± 0.2 | +0.3 ± 0.8 | -0.1 ± 0.3 | -0.2 ± 0.3 |
| late · veil · amber | -79.8 ± 350.2 | -79.8 ± 350.2 | **+3.2 ± 2.4** | +0.0 ± 0.3 | **-2.2 ± 1.0** | +0.0 ± 0.3 | -0.0 ± 0.3 |
| late · lantern · calm | +55.3 ± 205.8 | +54.3 ± 205.5 | +0.6 ± 2.5 | -0.0 ± 0.1 | +0.8 ± 1.2 | +0.0 ± 0.4 | +0.1 ± 0.3 |
| late · lantern · aphro | +26.0 ± 94.6 | +26.0 ± 94.6 | -0.3 ± 2.1 | -0.1 ± 0.1 | **+1.7 ± 1.5** | +0.0 ± 0.3 | -0.1 ± 0.1 |
| late · lantern · focus | +145.0 ± 210.5 | +144.0 ± 209.5 | +0.4 ± 2.5 | -0.0 ± 0.1 | +0.5 ± 0.8 | -0.0 ± 0.3 | **+0.6 ± 0.2** |
| late · lantern · velvet | **+170.0 ± 116.4** | **+169.0 ± 115.2** | **+3.5 ± 1.7** | -0.0 ± 0.1 | **+1.4 ± 1.1** | +0.3 ± 0.3 | +0.2 ± 0.4 |
| late · lantern · amber | **+385.3 ± 236.6** | **+384.3 ± 236.2** | **+4.5 ± 2.4** | +0.2 ± 0.2 | **-2.8 ± 1.0** | -0.1 ± 0.3 | -0.0 ± 0.3 |
| late · castle · calm | +151.0 ± 798.3 | +152.1 ± 799.5 | +1.9 ± 2.2 | -0.0 ± 0.1 | +0.0 ± 0.6 | +0.0 ± 0.1 | +0.1 ± 0.2 |
| late · castle · aphro | -369.2 ± 639.6 | -368.1 ± 641.2 | +1.0 ± 1.8 | -0.0 ± 0.1 | +0.1 ± 0.6 | **+0.1 ± 0.1** | +0.0 ± 0.2 |
| late · castle · focus | +548.2 ± 676.1 | +549.3 ± 677.6 | +1.8 ± 2.4 | +0.0 ± 0.0 | -0.1 ± 0.6 | -0.0 ± 0.1 | **+0.3 ± 0.1** |
| late · castle · velvet | -273.6 ± 588.2 | -273.1 ± 588.9 | **+4.2 ± 1.8** | +0.0 ± 0.0 | -0.0 ± 0.4 | +0.0 ± 0.1 | +0.0 ± 0.1 |
| late · castle · amber | +409.5 ± 694.5 | +409.5 ± 694.5 | **+4.0 ± 3.1** | -0.1 ± 0.2 | **-1.2 ± 0.6** | +0.1 ± 0.1 | +0.0 ± 0.1 |
| late · conservatory · calm | +171.4 ± 303.6 | +171.7 ± 303.7 | -0.1 ± 3.0 | **-0.4 ± 0.2** | -0.1 ± 1.0 | -0.1 ± 0.2 | +0.2 ± 0.3 |
| late · conservatory · aphro | -74.2 ± 302.1 | -73.9 ± 302.2 | +1.1 ± 3.9 | +0.0 ± 0.2 | +0.7 ± 1.3 | -0.1 ± 0.2 | -0.0 ± 0.3 |
| late · conservatory · focus | +11.3 ± 197.5 | +11.3 ± 197.5 | -1.2 ± 2.9 | +0.0 ± 0.2 | +0.5 ± 1.2 | +0.0 ± 0.3 | **+0.8 ± 0.2** |
| late · conservatory · velvet | +132.1 ± 158.0 | +132.4 ± 158.3 | **+3.5 ± 2.3** | -0.1 ± 0.2 | +0.2 ± 1.0 | -0.0 ± 0.2 | +0.0 ± 0.3 |
| late · conservatory · amber | **+464.0 ± 345.0** | **+464.3 ± 345.0** | **+5.7 ± 2.8** | +0.1 ± 0.2 | **-3.1 ± 1.9** | +0.1 ± 0.2 | -0.1 ± 0.2 |

---

### incense-niches

Targeted niche scenarios for every incense blend: rowdy Veil without security, Tankard on straw cots, Spirits on straw cots, Classroom training, and All-Beastkin (1.6x amplification).

scenario **mid** · 12 seeds from 1 · 120s · 2026-11-20T20:26

| variant | n | houseNet | total | net | perLady | served | props | sat | mood | trust | repGain | trouble | damage | restPct | statGain | skillGain |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| veil-nosec · base | 12 | 4,859 | 4,863 | 4,863 | 1.6 | 26 | 6.0 | 77 | 76 | 41 | 10 | 2.3 | 42 | 7.0 | -0.4 | 0.6 |
| veil-nosec · calm | 12 | 5,285 | 5,289 | 5,289 | 10 | 29 | 5.4 | 77 | 77 | 40 | 13 | 1.5 | 28 | 5.5 | 0.3 | 1.2 |
| veil-nosec · aphro | 12 | 4,929 | 4,933 | 4,933 | 0.0 | 26 | 6.7 | 78 | 78 | 42 | 12 | 2.2 | 33 | 7.8 | -0.0 | 0.8 |
| veil-nosec · focus | 12 | 3,756 | 3,760 | 3,760 | 13 | 26 | 5.8 | 73 | 77 | 42 | 6.3 | 2.3 | 44 | 8.4 | -0.1 | 1.9 |
| veil-nosec · velvet | 12 | 4,376 | 4,380 | 4,380 | 4.0 | 25 | 5.6 | 78 | 77 | 43 | 8.1 | 2.2 | 41 | 7.6 | -0.1 | 1.1 |
| veil-nosec · amber | 12 | 5,055 | 5,059 | 5,059 | 4.5 | 27 | 5.7 | 80 | 78 | 41 | 14 | 2.3 | 42 | 4.2 | -0.5 | 0.9 |
| tankard-straw · base | 12 | 378 | 378 | 378 | 13 | 11 | 1.8 | 59 | 86 | 47 | 2.0 | 0.9 | 17 | 17 | -0.9 | 0.1 |
| tankard-straw · calm | 12 | 516 | 516 | 516 | 9.0 | 13 | 1.3 | 61 | 87 | 46 | 4.5 | 0.6 | 15 | 16 | -1.0 | -0.0 |
| tankard-straw · aphro | 12 | 291 | 291 | 291 | 7.1 | 8.4 | 2.8 | 59 | 86 | 49 | -0.9 | 0.8 | 17 | 19 | -0.5 | 0.7 |
| tankard-straw · focus | 12 | 479 | 479 | 479 | 9.3 | 12 | 1.9 | 61 | 85 | 49 | 5.7 | 0.7 | 15 | 16 | -0.3 | 1.1 |
| tankard-straw · velvet | 12 | 385 | 385 | 385 | 6.9 | 11 | 1.9 | 63 | 84 | 51 | 0.7 | 0.8 | 18 | 18 | -0.4 | 0.8 |
| tankard-straw · amber | 12 | 624 | 624 | 624 | 30 | 18 | 2.3 | 61 | 86 | 45 | 8.4 | 0.8 | 15 | 9.9 | -1.8 | -0.7 |
| spirit-courtesans · base | 12 | 259 | 371 | 259 | 154 | 12 | 2.0 | 54 | 81 | 69 | -4.3 | 0.9 | 12 | 15 | 1.0 | 2.6 |
| spirit-courtesans · calm | 12 | 264 | 367 | 264 | 161 | 13 | 1.4 | 55 | 83 | 68 | 0.0 | 0.6 | 12 | 12 | 1.0 | 2.8 |
| spirit-courtesans · aphro | 12 | 261 | 354 | 261 | 162 | 13 | 2.0 | 54 | 81 | 69 | -1.8 | 0.9 | 18 | 18 | 1.0 | 2.4 |
| spirit-courtesans · focus | 12 | 263 | 368 | 263 | 162 | 12 | 1.8 | 55 | 80 | 67 | -1.7 | 0.9 | 19 | 14 | 1.0 | 3.2 |
| spirit-courtesans · velvet | 12 | 235 | 342 | 235 | 153 | 12 | 2.0 | 57 | 80 | 69 | 0.2 | 0.8 | 16 | 15 | 1.0 | 2.6 |
| spirit-courtesans · amber | 12 | 373 | 453 | 373 | 185 | 14 | 2.1 | 56 | 82 | 69 | 1.0 | 1.0 | 17 | 8.6 | 1.4 | 2.7 |
| classroom-24w · base | 12 | 593 | 593 | 593 | 62 | 16 | 2.2 | 64 | 75 | 60 | 23 | 0.7 | 11 | 9.5 | 4.4 | 19 |
| classroom-24w · calm | 12 | 680 | 680 | 680 | 68 | 16 | 2.6 | 66 | 82 | 68 | 21 | 0.4 | 6.7 | 9.6 | 5.1 | 21 |
| classroom-24w · aphro | 12 | 696 | 696 | 696 | 75 | 16 | 3.2 | 66 | 78 | 68 | 26 | 0.6 | 9.8 | 10 | 5.9 | 22 |
| classroom-24w · focus | 12 | 763 | 763 | 763 | 84 | 18 | 2.5 | 67 | 77 | 65 | 29 | 0.6 | 7.5 | 8.9 | 6.2 | 24 |
| classroom-24w · velvet | 12 | 571 | 571 | 571 | 61 | 16 | 2.4 | 69 | 77 | 68 | 28 | 0.6 | 12 | 8.5 | 4.5 | 20 |
| classroom-24w · amber | 12 | 984 | 984 | 984 | 100 | 18 | 3.6 | 68 | 85 | 69 | 28 | 0.7 | 13 | 5.4 | 5.6 | 24 |
| beastkin-160 · base | 12 | 712 | 896 | 712 | 73 | 18 | 3.8 | 60 | 83 | 46 | 19 | 0.7 | 12 | 8.4 | -1.2 | -0.3 |
| beastkin-160 · calm | 12 | 799 | 974 | 799 | 65 | 19 | 2.7 | 61 | 86 | 44 | 22 | 0.4 | 8.3 | 7.2 | -1.4 | -0.1 |
| beastkin-160 · aphro | 12 | 730 | 946 | 730 | 75 | 19 | 4.2 | 60 | 83 | 44 | 21 | 0.8 | 14 | 8.6 | -1.7 | -1.0 |
| beastkin-160 · focus | 12 | 744 | 958 | 744 | 88 | 21 | 2.8 | 59 | 83 | 44 | 21 | 0.8 | 13 | 6.5 | -1.3 | -0.3 |
| beastkin-160 · velvet | 12 | 780 | 942 | 780 | 83 | 19 | 3.1 | 64 | 83 | 48 | 26 | 0.7 | 12 | 7.8 | -0.6 | -0.1 |
| beastkin-160 · amber | 12 | 916 | 1,172 | 916 | 89 | 22 | 3.4 | 61 | 86 | 45 | 24 | 0.8 | 15 | 3.3 | -1.6 | -0.8 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ net | Δ sat | Δ trouble | Δ restPct | Δ statGain | Δ skillGain |
|---|---|---|---|---|---|---|---|
| veil-nosec · calm | +426.0 ± 1,454 | +426.1 ± 1,454 | -0.6 ± 8.1 | **-0.8 ± 0.2** | -1.5 ± 2.6 | +0.7 ± 0.8 | +0.6 ± 0.9 |
| veil-nosec · aphro | +69.2 ± 1,685 | +69.9 ± 1,685 | +1.1 ± 11.3 | -0.1 ± 0.2 | +0.8 ± 3.6 | +0.4 ± 0.9 | +0.2 ± 1.0 |
| veil-nosec · focus | -1,103 ± 1,723 | -1,103 ± 1,723 | -4.8 ± 9.9 | -0.0 ± 0.2 | +1.4 ± 3.0 | +0.3 ± 0.8 | **+1.3 ± 0.9** |
| veil-nosec · velvet | -483.4 ± 1,670 | -483.4 ± 1,670 | +0.3 ± 10.1 | -0.1 ± 0.3 | +0.6 ± 3.2 | +0.3 ± 0.8 | +0.5 ± 0.8 |
| veil-nosec · amber | +195.8 ± 1,453 | +195.8 ± 1,453 | +2.4 ± 8.2 | -0.1 ± 0.2 | **-2.9 ± 2.5** | -0.1 ± 0.5 | +0.3 ± 0.6 |
| tankard-straw · calm | +137.6 ± 235.4 | +137.6 ± 235.4 | +2.0 ± 3.9 | **-0.3 ± 0.2** | -0.2 ± 2.5 | -0.1 ± 0.8 | -0.2 ± 1.2 |
| tankard-straw · aphro | -87.6 ± 90.1 | -87.6 ± 90.1 | +0.0 ± 2.5 | -0.0 ± 0.2 | **+2.4 ± 2.3** | +0.4 ± 1.2 | +0.5 ± 1.4 |
| tankard-straw · focus | +100.6 ± 195.8 | +100.6 ± 195.8 | +2.6 ± 3.3 | -0.1 ± 0.2 | -0.7 ± 2.1 | +0.6 ± 0.6 | **+1.0 ± 0.5** |
| tankard-straw · velvet | +7.2 ± 103.7 | +7.2 ± 103.7 | **+3.7 ± 2.5** | -0.0 ± 0.2 | +1.4 ± 2.2 | +0.5 ± 1.4 | +0.6 ± 1.4 |
| tankard-straw · amber | **+245.3 ± 46.4** | **+245.3 ± 46.4** | +2.1 ± 2.3 | -0.1 ± 0.2 | **-6.7 ± 1.9** | -0.9 ± 0.9 | **-0.9 ± 0.7** |
| spirit-courtesans · calm | +5.8 ± 37.9 | +5.8 ± 37.9 | +1.2 ± 1.7 | **-0.3 ± 0.2** | **-3.3 ± 1.6** | -0.0 ± 0.2 | +0.2 ± 0.2 |
| spirit-courtesans · aphro | +2.5 ± 46.0 | +2.5 ± 46.0 | +0.4 ± 1.8 | -0.0 ± 0.2 | **+2.5 ± 2.2** | +0.1 ± 0.2 | **-0.1 ± 0.1** |
| spirit-courtesans · focus | +4.9 ± 42.2 | +4.9 ± 42.2 | +1.2 ± 1.7 | +0.1 ± 0.1 | -0.9 ± 1.7 | +0.1 ± 0.2 | **+0.6 ± 0.2** |
| spirit-courtesans · velvet | -23.3 ± 26.6 | -23.3 ± 26.6 | **+3.2 ± 1.2** | -0.1 ± 0.2 | +0.3 ± 2.2 | +0.1 ± 0.2 | +0.0 ± 0.2 |
| spirit-courtesans · amber | **+114.7 ± 77.6** | **+114.7 ± 77.6** | **+1.7 ± 1.4** | +0.1 ± 0.2 | **-6.5 ± 2.5** | **+0.4 ± 0.2** | +0.1 ± 0.2 |
| classroom-24w · calm | +87.4 ± 176.1 | +87.4 ± 176.1 | +2.5 ± 3.6 | **-0.2 ± 0.2** | +0.1 ± 0.8 | +0.7 ± 1.5 | +2.1 ± 2.2 |
| classroom-24w · aphro | +103.3 ± 242.8 | +103.3 ± 242.8 | +2.2 ± 3.2 | -0.1 ± 0.2 | +0.6 ± 1.5 | **+1.5 ± 1.4** | +2.7 ± 2.8 |
| classroom-24w · focus | +170.5 ± 182.2 | +170.5 ± 182.2 | **+2.8 ± 2.1** | -0.1 ± 0.1 | -0.6 ± 1.5 | **+1.8 ± 0.9** | **+4.8 ± 2.2** |
| classroom-24w · velvet | -21.3 ± 155.9 | -21.3 ± 155.9 | **+5.2 ± 2.8** | -0.1 ± 0.1 | -1.1 ± 1.2 | +0.1 ± 1.8 | +1.0 ± 3.7 |
| classroom-24w · amber | **+390.9 ± 241.5** | **+390.9 ± 241.5** | **+4.1 ± 2.6** | +0.0 ± 0.2 | **-4.2 ± 1.6** | **+1.2 ± 1.1** | **+4.5 ± 2.6** |
| beastkin-160 · calm | +86.2 ± 160.5 | +86.2 ± 160.5 | +1.1 ± 2.6 | **-0.3 ± 0.1** | -1.2 ± 2.1 | -0.2 ± 0.8 | +0.2 ± 1.0 |
| beastkin-160 · aphro | +17.5 ± 96.8 | +17.5 ± 96.8 | +0.8 ± 1.5 | +0.0 ± 0.2 | +0.3 ± 2.6 | -0.6 ± 0.8 | -0.7 ± 1.0 |
| beastkin-160 · focus | +32.1 ± 144.0 | +32.1 ± 144.0 | -0.5 ± 2.3 | +0.1 ± 0.2 | **-1.9 ± 1.7** | -0.1 ± 1.1 | +0.1 ± 1.2 |
| beastkin-160 · velvet | +67.2 ± 99.2 | +67.2 ± 99.2 | **+4.4 ± 1.9** | -0.0 ± 0.3 | -0.5 ± 2.1 | +0.6 ± 1.1 | +0.2 ± 1.4 |
| beastkin-160 · amber | +203.5 ± 210.6 | +203.5 ± 210.6 | +1.9 ± 3.4 | +0.1 ± 0.2 | **-5.0 ± 1.5** | -0.4 ± 0.8 | -0.5 ± 0.9 |

---

### incense-campaign

All 5 incense blends over a full Cycle-1 campaign across 4 houses (Tankard, Veil, Lantern, Castle).

scenario **campaign** · 12 seeds from 1 · 210s · 2026-11-20T20:30

| variant | n | weeksToWin | winRate | cfHE | cfHM | cfHL | houseNet | guild | worth20 | rep | sat | trouble | restPct | statEnd | skillEnd | over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| tankard · base | 12 | 32 | 1.0 | 511 | 674 | 1,243 | 781 | 175 | -10,185 | 34 | 64 | 0.8 | 10 | 50 | 26 | 0.0 |
| tankard · calm | 12 | 31 | 1.0 | 594 | 952 | 1,251ⁿ10 | 947 | 162 | -7,669 | 31 | 67 | 0.6 | 10 | 50 | 26 | 0.0 |
| tankard · aphro | 12 | 34 | 0.9 | 479 | 974 | 1,119ⁿ9 | 868 | 167 | -7,786 | 29 | 66 | 0.9 | 11 | 49 | 26 | 0.1 |
| tankard · focus | 12 | 31 | 1.0 | 574 | 678 | 1,562 | 901 | 161 | -9,324 | 33 | 66 | 0.8 | 10 | 49 | 26 | 0.0 |
| tankard · velvet | 12 | 36 | 1.0 | 436 | 502 | 798 | 623 | 167 | -11,759 | 30 | 64 | 0.8 | 11 | 51 | 28 | 0.0 |
| tankard · amber | 12 | 27 | 1.0 | 597 | 1,142 | 1,665ⁿ10 | 1,093 | 208 | -4,447 | 31 | 64 | 1.1 | 5.1 | 50 | 26 | 0.0 |
| veil · base | 12 | 29 | 0.9 | 2,283 | 6,191 | 8,065ⁿ8 | 4,883 | 250 | -2,291 | 45 | 79 | 1.2 | 8.4 | 49 | 25 | 0.1 |
| veil · calm | 12 | 22 | 1.0 | 2,967 | 6,956 | 8,526ⁿ4 | 5,388 | 264 | 10,076 | 50 | 85 | 1.0 | 5.8 | 48 | 23 | 0.0 |
| veil · aphro | 12 | 32 | 0.9 | 2,258 | 5,263 | 5,879ⁿ9 | 4,313 | 266 | -10,716 | 42 | 77 | 1.1 | 9.1 | 49 | 24 | 0.1 |
| veil · focus | 12 | 27 | 1.0 | 2,407 | 5,044 | 6,474ⁿ9 | 4,346 | 267 | -10,502 | 52 | 79 | 1.0 | 7.6 | 48 | 24 | 0.0 |
| veil · velvet | 12 | 22 | 1.0 | 2,740 | 6,617 | 6,692ⁿ5 | 5,309 | 277 | 6,043 | 55 | 85 | 1.2 | 6.2 | 48 | 23 | 0.0 |
| veil · amber | 12 | 27 | 1.0 | 2,109 | 5,297 | 5,381ⁿ9 | 4,267 | 283 | -13,144 | 48 | 81 | 1.2 | 4.8 | 49 | 25 | 0.0 |
| lantern · base | 12 | 32 | 1.0 | 578 | 1,036 | 1,907 | 1,226 | 158 | -14,663 | 54 | 63 | 0.5 | 8.0 | 50 | 26 | 0.0 |
| lantern · calm | 12 | 31 | 1.0 | 649 | 1,168 | 1,893ⁿ11 | 1,282 | 166 | -11,588 | 51 | 65 | 0.4 | 9.1 | 50 | 26 | 0.0 |
| lantern · aphro | 12 | 31 | 1.0 | 625 | 1,382 | 1,654ⁿ10 | 1,285 | 203 | -9,529 | 49 | 66 | 0.6 | 9.4 | 51 | 27 | 0.0 |
| lantern · focus | 12 | 32 | 1.0 | 535 | 1,028 | 1,774 | 1,156 | 178 | -14,187 | 52 | 65 | 0.4 | 9.2 | 52 | 28 | 0.0 |
| lantern · velvet | 12 | 30 | 1.0 | 612 | 1,066 | 2,321 | 1,273 | 178 | -12,271 | 56 | 69 | 0.5 | 8.9 | 50 | 26 | 0.0 |
| lantern · amber | 12 | 27 | 1.0 | 773 | 1,447 | 2,144ⁿ11 | 1,446 | 174 | -8,006 | 47 | 65 | 1.0 | 5.4 | 50 | 25 | 0.0 |
| castle · base | 12 | 38 | 0.9 | 849 | 3,458 | 8,109 | 4,419 | 269 | -78,135 | 67 | 74 | 0.3 | 5.6 | 53 | 24 | 0.1 |
| castle · calm | 12 | 33 | 1.0 | 914 | 3,959 | 7,317 | 4,315 | 310 | -72,206 | 67 | 71 | 0.2 | 5.9 | 53 | 25 | 0.0 |
| castle · aphro | 12 | 33 | 1.0 | 1,023 | 3,657 | 7,158 | 4,274 | 308 | -76,084 | 67 | 73 | 0.3 | 7.0 | 53 | 25 | 0.0 |
| castle · focus | 12 | 32 | 1.0 | 1,052 | 3,905 | 8,590 | 4,688 | 272 | -71,089 | 68 | 73 | 0.3 | 5.1 | 52 | 26 | 0.0 |
| castle · velvet | 12 | 40 | 0.9 | 905 | 2,772 | 7,198ⁿ11 | 3,836 | 283 | -81,899 | 66 | 74 | 0.3 | 6.6 | 54 | 26 | 0.1 |
| castle · amber | 12 | 30 | 1.0 | 810 | 3,793 | 9,929 | 4,970 | 261 | -71,974 | 72 | 79 | 0.4 | 4.7 | 53 | 24 | 0.0 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ cfHE | Δ cfHM | Δ cfHL | Δ houseNet | Δ statEnd | Δ skillEnd | Δ trouble |
|---|---|---|---|---|---|---|---|---|
| tankard · calm | -1.2 ± 4.5 | +82.5 ± 88.3 | +278.2 ± 457.0 | +219.2 ± 635.4 | +165.1 ± 274.3 | -0.2 ± 2.4 | -0.3 ± 3.0 | -0.2 ± 0.2 |
| tankard · aphro | +2.0 ± 12.8 | -32.3 ± 100.7 | +300.3 ± 462.9 | -249.1 ± 815.8 | +86.5 ± 311.9 | -0.7 ± 2.4 | -0.7 ± 2.1 | +0.1 ± 0.3 |
| tankard · focus | -0.7 ± 4.4 | +62.5 ± 104.5 | +3.8 ± 354.0 | +318.0 ± 751.7 | +119.7 ± 223.2 | -0.5 ± 2.2 | +0.0 ± 2.4 | +0.0 ± 0.2 |
| tankard · velvet | **+4.3 ± 3.0** | -75.0 ± 123.9 | -172.1 ± 207.8 | -445.8 ± 488.0 | **-158.7 ± 127.5** | +0.9 ± 2.9 | +1.7 ± 2.7 | +0.0 ± 0.1 |
| tankard · amber | **-4.9 ± 4.5** | **+86.0 ± 78.3** | +468.3 ± 532.3 | +633.2 ± 708.7 | +311.6 ± 318.3 | -0.3 ± 2.9 | -0.3 ± 2.5 | **+0.3 ± 0.3** |
| veil · calm | -6.9 ± 15.2 | **+683.6 ± 558.9** | +765.3 ± 2,145 | -2,696 ± 10,819 | +504.8 ± 1,306 | -1.0 ± 1.9 | -1.9 ± 2.1 | -0.2 ± 0.3 |
| veil · aphro | +3.5 ± 21.4 | -25.0 ± 713.1 | -927.2 ± 2,635 | -1,715 ± 3,337 | -569.8 ± 1,592 | -0.2 ± 1.5 | -0.7 ± 1.9 | -0.1 ± 0.4 |
| veil · focus | -2.3 ± 14.3 | +123.8 ± 606.4 | -1,146 ± 1,805 | -2,221 ± 4,659 | -536.6 ± 1,090 | **-1.0 ± 1.0** | -0.8 ± 1.3 | -0.2 ± 0.4 |
| veil · velvet | -6.4 ± 14.3 | **+456.4 ± 368.6** | +426.4 ± 2,089 | -1,536 ± 2,601 | +425.6 ± 1,119 | -1.0 ± 1.9 | -1.9 ± 2.1 | -0.0 ± 0.4 |
| veil · amber | -2.3 ± 15.3 | -174.1 ± 486.8 | -893.8 ± 2,321 | **-2,086 ± 1,825** | -616.5 ± 1,330 | -0.0 ± 1.8 | -0.3 ± 2.0 | +0.0 ± 0.3 |
| lantern · calm | -1.2 ± 3.9 | +70.9 ± 165.8 | +131.2 ± 426.0 | +54.3 ± 596.2 | +56.2 ± 288.0 | +0.2 ± 1.7 | +0.7 ± 1.8 | -0.1 ± 0.1 |
| lantern · aphro | -1.8 ± 4.1 | +46.8 ± 153.0 | +345.7 ± 588.2 | -340.5 ± 377.7 | +59.6 ± 366.5 | +1.1 ± 2.5 | +1.1 ± 2.6 | +0.1 ± 0.2 |
| lantern · focus | -0.2 ± 4.3 | -42.8 ± 113.0 | -8.2 ± 464.1 | -133.2 ± 460.8 | -69.8 ± 261.1 | **+1.7 ± 1.7** | **+2.6 ± 1.9** | -0.0 ± 0.2 |
| lantern · velvet | -2.4 ± 5.2 | +34.1 ± 135.6 | +30.0 ± 562.9 | +414.1 ± 673.1 | +47.5 ± 305.9 | +0.2 ± 2.2 | +0.4 ± 3.0 | +0.1 ± 0.2 |
| lantern · amber | **-4.8 ± 3.6** | +195.4 ± 198.5 | +410.9 ± 534.9 | +193.3 ± 482.5 | +220.0 ± 301.1 | -0.3 ± 1.7 | -0.2 ± 2.0 | **+0.5 ± 0.2** |
| castle · calm | -5.1 ± 13.1 | +65.3 ± 135.0 | +501.3 ± 1,011 | -792.1 ± 2,715 | -104.1 ± 945.5 | +0.3 ± 1.2 | **+1.5 ± 1.1** | -0.1 ± 0.1 |
| castle · aphro | -4.5 ± 11.4 | **+173.9 ± 110.6** | +199.1 ± 1,056 | -950.6 ± 1,542 | -145.3 ± 682.2 | +0.1 ± 1.4 | **+1.6 ± 1.5** | -0.0 ± 0.1 |
| castle · focus | -6.3 ± 12.8 | **+203.0 ± 156.3** | +446.9 ± 1,192 | +481.0 ± 2,247 | +268.7 ± 903.1 | -0.3 ± 1.0 | **+1.8 ± 1.4** | +0.0 ± 0.1 |
| castle · velvet | +2.3 ± 2.3 | +56.4 ± 160.0 | -685.8 ± 991.5 | -1,457 ± 1,549 | **-582.9 ± 432.7** | +1.0 ± 1.5 | **+1.7 ± 1.6** | -0.0 ± 0.1 |
| castle · amber | -7.5 ± 12.5 | -38.5 ± 77.3 | +335.6 ± 1,180 | +1,820 ± 2,601 | +551.5 ± 974.6 | +0.4 ± 1.0 | +0.3 ± 1.1 | **+0.1 ± 0.1** |

---

### ngplus-houses-scaling

NG+ kept houses scaling across Cycles 2-4: home only (no new), home+new (2 houses), 1x prior+new (2/3/4), and 2x prior+new (3/5/7) across Tankard, Lantern, and Castle.

scenario **ngplus** · 16 seeds from 1 · 1327s · 2026-11-20T20:52

| variant | n | c1won | c2houses | c3houses | c4houses | c2weeks | c3weeks | c4weeks | c2over | c3over | c4over | c2debt | c3debt | c4debt | c2cfHE | c2cfHM | c2cfHL | c3cfHE | c3cfHM | c3cfHL | c4cfHE | c4cfHM | c4cfHL | c2hNet | c3hNet | c4hNet | c2guild | c3guild | c4guild |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| tankard · base | 15 (+1 unreached) | 33 | 2.0 | 2.0 | 2.0 | 34 | 33 | 36 | 0.0 | 0.0 | 0.0 | 75,960 | 101,558 | 135,024 | 432 | 1,869 | 4,003 | 999 | 2,426 | 4,020 | 1,024 | 1,903 | 3,668 | 2,409 | 2,670 | 2,429 | 527 | 962 | 1,287 |
| tankard · home only (no new) | 15 (+1 unreached) | 33 | 1.0 | 1.0 | 1.0 | 24 | 23 | 26 | 0.0 | 0.0 | 0.0 | 32,560 | 48,930 | 65,966 | 394 | 1,146 | 1,996ⁿ12 | 564 | 1,332 | 1,981ⁿ13 | 531 | 1,209 | 1,756 | 1,013 | 1,143 | 1,095 | 401 | 672 | 933 |
| tankard · 1x kept + new | 15 (+1 unreached) | 33 | 2.0 | 3.0ⁿ14 | 4.0ⁿ12 | 39 | 44ⁿ14 | 59ⁿ12 | 0.1 | 0.1ⁿ14 | 0.3ⁿ12 | 75,960 | 134,097ⁿ14 | 199,459ⁿ12 | 426 | 1,814 | 3,871 | 968ⁿ14 | 2,760ⁿ14 | 5,673ⁿ13 | 679ⁿ12 | 2,417ⁿ12 | 6,723ⁿ8 | 2,316 | 3,313ⁿ14 | 2,959ⁿ12 | 523 | 958ⁿ14 | 1,360ⁿ12 |
| tankard · 2x kept + new | 15 (+1 unreached) | 33 | 3.0 | 5.0 | 7.0ⁿ9 | 34 | 65 | 97ⁿ9 | 0.0 | 0.4 | 0.9ⁿ9 | 88,510 | 186,256 | 331,537ⁿ9 | 680 | 2,465 | 5,457 | 564 | 2,045 | 7,856ⁿ9 | -59ⁿ9 | 866ⁿ9 | 9,888ⁿ1 | 3,244 | 3,064 | 712ⁿ9 | 636 | 897 | 1,007ⁿ9 |
| lantern · base | 16 | 34 | 2.0 | 2.0ⁿ15 | 2.0ⁿ15 | 40 | 32ⁿ15 | 35ⁿ15 | 0.1 | 0.0ⁿ15 | 0.0ⁿ15 | 89,052 | 116,188ⁿ15 | 147,704ⁿ15 | 447 | 2,060 | 4,472ⁿ15 | 1,392ⁿ15 | 2,601ⁿ15 | 4,524ⁿ15 | 1,200ⁿ15 | 2,674ⁿ15 | 4,471ⁿ15 | 2,559 | 3,018ⁿ15 | 3,077ⁿ15 | 539 | 974ⁿ15 | 1,304ⁿ15 |
| lantern · home only (no new) | 16 | 34 | 1.0 | 1.0 | 1.0 | 25 | 23 | 27 | 0.0 | 0.0 | 0.0 | 45,327 | 63,539 | 83,802 | 606 | 1,658 | 2,025ⁿ14 | 1,232 | 2,091 | 2,589ⁿ12 | 1,144 | 2,042 | 2,757ⁿ15 | 1,397 | 1,844 | 1,966 | 445 | 743 | 855 |
| lantern · 1x kept + new | 16 | 34 | 2.0 | 3.0ⁿ14 | 4.0ⁿ11 | 44 | 48ⁿ14 | 68ⁿ11 | 0.1 | 0.2ⁿ14 | 0.5ⁿ11 | 89,052 | 147,794ⁿ14 | 232,969ⁿ11 | 444 | 2,070 | 4,419ⁿ14 | 1,149ⁿ14 | 3,069ⁿ14 | 7,023ⁿ11 | 954ⁿ11 | 2,948ⁿ11 | 8,455ⁿ6 | 2,438 | 3,491ⁿ14 | 3,367ⁿ11 | 517 | 955ⁿ14 | 1,105ⁿ11 |
| lantern · 2x kept + new | 16 | 34 | 3.0 | 5.0ⁿ13 | 7.0ⁿ7 | 49 | 69ⁿ13 | 104ⁿ7 | 0.2 | 0.5ⁿ13 | 1.0ⁿ7 | 104,465 | 198,828ⁿ13 | 341,483ⁿ7 | 631 | 2,034 | 5,877ⁿ13 | 585ⁿ13 | 1,718ⁿ13 | 7,458ⁿ8 | -86ⁿ7 | 882ⁿ7 | – | 2,946 | 2,837ⁿ13 | 267ⁿ7 | 597 | 962ⁿ13 | 1,088ⁿ7 |
| castle · base | 15 (+1 unreached) | 33 | 2.0 | 2.0ⁿ11 | 2.0ⁿ9 | 48 | 44ⁿ11 | 31ⁿ9 | 0.3 | 0.2ⁿ11 | 0.0ⁿ9 | 181,445 | 227,395ⁿ11 | 299,728ⁿ9 | 2,611 | 7,308 | 10,326ⁿ10 | 3,037ⁿ11 | 6,809ⁿ11 | 10,341ⁿ9 | 3,782ⁿ9 | 8,697ⁿ9 | 13,039ⁿ9 | 6,294 | 6,235ⁿ11 | 8,953ⁿ9 | 633 | 1,036ⁿ11 | 1,621ⁿ9 |
| castle · home only (no new) | 15 (+1 unreached) | 33 | 1.0 | 1.0ⁿ12 | 1.0ⁿ12 | 40 | 24ⁿ12 | 27ⁿ12 | 0.2 | 0.0ⁿ12 | 0.0ⁿ12 | 137,005 | 183,864ⁿ12 | 233,364ⁿ12 | 2,685 | 6,442 | 7,162ⁿ7 | 6,148ⁿ12 | 9,158ⁿ12 | 6,823ⁿ7 | 4,552ⁿ12 | 8,492ⁿ12 | 8,910ⁿ10 | 5,131 | 7,967ⁿ12 | 7,713ⁿ12 | 611 | 1,094ⁿ12 | 1,459ⁿ12 |
| castle · 1x kept + new | 15 (+1 unreached) | 33 | 2.0 | 3.0ⁿ11 | 4.0ⁿ10 | 48 | 37ⁿ11 | 51ⁿ10 | 0.3 | 0.1ⁿ11 | 0.2ⁿ10 | 181,445 | 263,261ⁿ11 | 365,072ⁿ10 | 2,611 | 7,318 | 10,310ⁿ10 | 3,443ⁿ11 | 9,575ⁿ11 | 14,997ⁿ10 | 2,507ⁿ10 | 6,203ⁿ10 | 14,562ⁿ8 | 6,295 | 9,063ⁿ11 | 7,888ⁿ10 | 640 | 1,113ⁿ11 | 1,552ⁿ10 |
| castle · 2x kept + new | 15 (+1 unreached) | 33 | 3.0 | 5.0ⁿ10 | 7.0ⁿ6 | 54 | 62ⁿ10 | 83ⁿ6 | 0.3 | 0.4ⁿ10 | 0.7ⁿ6 | 195,038 | 328,684ⁿ10 | 491,922ⁿ6 | 2,263 | 6,851 | 14,091ⁿ10 | 2,894ⁿ10 | 6,886ⁿ10 | 15,384ⁿ8 | 1,976ⁿ6 | 5,784ⁿ6 | 20,951ⁿ2 | 6,228 | 7,730ⁿ10 | 6,270ⁿ6 | 593 | 926ⁿ10 | 1,114ⁿ6 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ c2weeks | Δ c3weeks | Δ c4weeks | Δ c2cfHE | Δ c3cfHE | Δ c4cfHE | Δ c2hNet | Δ c3hNet | Δ c4hNet | Δ c4over |
|---|---|---|---|---|---|---|---|---|---|---|
| tankard · home only (no new) | **-10.5 ± 1.8** | **-9.7 ± 2.8** | **-9.9 ± 2.5** | -38.3 ± 190.4 | **-435.0 ± 392.5** | **-493.4 ± 347.8** | **-1,396 ± 228.6** | **-1,527 ± 332.3** | **-1,335 ± 480.3** | +0.0 ± 0.0 |
| tankard · 1x kept + new | +4.3 ± 8.4 | +11.0 ± 13.5 | **+24.1 ± 20.1** | -6.4 ± 12.5 | -83.1 ± 446.1 | -522.5 ± 529.3 | -93.1 ± 182.5 | +595.4 ± 640.4 | +508.1 ± 1,281 | **+0.3 ± 0.3** |
| tankard · 2x kept + new | -0.3 ± 1.9 | **+32.5 ± 17.6** | **+64.0 ± 13.2** | +248.4 ± 338.6 | -434.9 ± 554.2 | **-1,216 ± 563.1** | **+835.2 ± 379.3** | +394.0 ± 1,267 | **-1,895 ± 1,721** | **+0.9 ± 0.2** |
| lantern · home only (no new) | **-15.2 ± 8.8** | **-8.9 ± 2.4** | **-7.2 ± 3.9** | +158.9 ± 207.8 | -100.2 ± 467.1 | -70.4 ± 364.3 | **-1,162 ± 529.2** | **-1,095 ± 368.7** | **-1,126 ± 499.6** | +0.0 ± 0.0 |
| lantern · 1x kept + new | +4.3 ± 8.5 | +16.2 ± 16.5 | **+33.4 ± 21.0** | -2.8 ± 14.4 | -242.8 ± 645.8 | -244.3 ± 856.1 | -121.2 ± 257.3 | +474.6 ± 986.4 | +403.7 ± 1,687 | **+0.5 ± 0.3** |
| lantern · 2x kept + new | +9.4 ± 16.6 | **+35.0 ± 19.5** | **+68.4 ± 3.5** | **+183.9 ± 159.5** | **-856.1 ± 740.6** | **-1,441 ± 648.8** | +386.7 ± 853.8 | +90.4 ± 1,500 | **-3,059 ± 673.0** | **+1.0 ± 0.0** |
| castle · home only (no new) | -7.5 ± 15.3 | **-15.3 ± 14.7** | **-6.0 ± 3.7** | +73.9 ± 787.9 | **+2,814 ± 1,809** | +1,262 ± 2,337 | -1,163 ± 1,374 | +1,746 ± 2,252 | -417.3 ± 2,607 | +0.0 ± 0.0 |
| castle · 1x kept + new | +0.0 ± 0.0 | -7.0 ± 21.0 | **+23.1 ± 22.3** | +0.0 ± 0.0 | +406.0 ± 1,101 | -1,499 ± 1,669 | +0.9 ± 1.7 | **+2,828 ± 1,708** | -1,368 ± 3,990 | +0.3 ± 0.3 |
| castle · 2x kept + new | +5.9 ± 8.3 | +24.1 ± 31.2 | **+59.0 ± 24.8** | -348.5 ± 692.5 | -549.8 ± 2,063 | **-2,273 ± 1,617** | -66.2 ± 1,123 | +902.1 ± 4,603 | -4,386 ± 4,412 | **+0.8 ± 0.4** |

---

### ngplus-lovers-stacking

NG+ lover scaling across Cycles 2-4: 0 vs (1-4)x prior cycles carried lovers with reincarnation stacking, across Tankard, Lantern, and Castle.

scenario **ngplus** · 16 seeds from 1 · 1329s · 2026-11-20T20:52

| variant | n | c1won | c2weeks | c3weeks | c4weeks | c2over | c3over | c4over | c2debt | c3debt | c4debt | c2loversIn | c3loversIn | c4loversIn | c2lovers | c3lovers | c4lovers | c2reborn | c3reborn | c4reborn | c2cfHE | c2cfHM | c2cfHL | c3cfHE | c3cfHM | c3cfHL | c4cfHE | c4cfHM | c4cfHL | c2hNet | c3hNet | c4hNet | c2guild | c3guild | c4guild | c2cuts | c3cuts | c4cuts |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| tankard · base | 15 (+1 unreached) | 33 | 35 | 53 | 59ⁿ11 | 0.0 | 0.3 | 0.4ⁿ11 | 73,960 | 130,448 | 188,776ⁿ11 | 1.0 | 2.0 | 3.0ⁿ11 | 1.5 | 2.8 | 3.4ⁿ11 | 2.0 | 6.3 | 13ⁿ11 | 568 | 2,045 | 3,396 | 466 | 2,236 | 5,882ⁿ12 | 900ⁿ11 | 3,416ⁿ11 | 8,853ⁿ7 | 2,252 | 2,771 | 3,731ⁿ11 | 561 | 918 | 1,105ⁿ11 | 1,166 | 2,172 | 4,106ⁿ11 |
| tankard · 2x lovers | 15 (+1 unreached) | 33 | 39 | 44ⁿ14 | 59ⁿ12 | 0.1 | 0.1ⁿ14 | 0.3ⁿ12 | 75,960 | 134,097ⁿ14 | 199,459ⁿ12 | 2.0 | 4.0ⁿ14 | 6.0ⁿ12 | 2.7 | 4.6ⁿ14 | 6.5ⁿ12 | 2.7 | 8.8ⁿ14 | 19ⁿ12 | 426 | 1,814 | 3,871 | 968ⁿ14 | 2,760ⁿ14 | 5,673ⁿ13 | 679ⁿ12 | 2,417ⁿ12 | 6,500ⁿ8 | 2,316 | 3,313ⁿ14 | 2,867ⁿ12 | 523 | 958ⁿ14 | 1,398ⁿ12 | 1,342 | 3,004ⁿ14 | 4,658ⁿ12 |
| tankard · 3x lovers | 15 (+1 unreached) | 33 | 41 | 49ⁿ14 | 55ⁿ11 | 0.1 | 0.2ⁿ14 | 0.3ⁿ11 | 77,960 | 138,814ⁿ14 | 207,731ⁿ11 | 3.0 | 6.0ⁿ14 | 9.0ⁿ11 | 3.6 | 6.6ⁿ14 | 9.6ⁿ11 | 3.2 | 10ⁿ14 | 23ⁿ11 | 183 | 1,443 | 3,392ⁿ14 | 926ⁿ14 | 2,485ⁿ14 | 5,864ⁿ11 | 610ⁿ11 | 2,731ⁿ11 | 7,472ⁿ8 | 1,926 | 2,986ⁿ14 | 3,484ⁿ11 | 576 | 901ⁿ14 | 1,346ⁿ11 | 1,504 | 3,269ⁿ14 | 6,738ⁿ11 |
| tankard · 4x lovers | 15 (+1 unreached) | 33 | 46 | 51ⁿ13 | 85ⁿ10 | 0.1 | 0.2ⁿ13 | 0.7ⁿ10 | 79,960 | 148,469ⁿ13 | 222,195ⁿ10 | 4.0 | 8.0ⁿ13 | 12ⁿ10 | 4.8 | 8.8ⁿ13 | 13ⁿ10 | 4.0 | 13ⁿ13 | 27ⁿ10 | 315 | 1,380 | 3,462ⁿ13 | 827ⁿ13 | 2,484ⁿ13 | 5,361ⁿ11 | 251ⁿ10 | 1,630ⁿ10 | 5,477ⁿ5 | 1,871 | 2,931ⁿ13 | 1,923ⁿ10 | 526 | 929ⁿ13 | 1,097ⁿ10 | 1,449 | 4,347ⁿ13 | 7,320ⁿ10 |
| lantern · base | 16 | 34 | 37 | 57ⁿ15 | 68ⁿ10 | 0.1 | 0.3ⁿ15 | 0.5ⁿ10 | 87,052 | 143,218ⁿ15 | 216,679ⁿ10 | 1.0 | 2.0ⁿ15 | 3.0ⁿ10 | 1.6 | 2.7ⁿ15 | 3.2ⁿ10 | 2.0 | 5.6ⁿ15 | 13ⁿ10 | 780 | 2,197 | 4,457ⁿ15 | 473ⁿ15 | 2,468ⁿ15 | 6,698ⁿ10 | 1,168ⁿ10 | 3,116ⁿ10 | 8,632ⁿ6 | 2,592 | 2,866ⁿ15 | 3,424ⁿ10 | 605 | 853ⁿ15 | 1,127ⁿ10 | 1,378 | 2,494ⁿ15 | 4,319ⁿ10 |
| lantern · 2x lovers | 16 | 34 | 44 | 48ⁿ14 | 68ⁿ11 | 0.1 | 0.2ⁿ14 | 0.5ⁿ11 | 89,052 | 147,794ⁿ14 | 232,969ⁿ11 | 2.0 | 4.0ⁿ14 | 6.0ⁿ11 | 2.8 | 4.6ⁿ14 | 6.7ⁿ11 | 2.0 | 8.1ⁿ14 | 19ⁿ11 | 444 | 2,070 | 4,419ⁿ14 | 1,149ⁿ14 | 3,069ⁿ14 | 7,023ⁿ11 | 969ⁿ11 | 3,064ⁿ11 | 8,581ⁿ6 | 2,438 | 3,491ⁿ14 | 3,445ⁿ11 | 517 | 955ⁿ14 | 1,130ⁿ11 | 1,654 | 3,317ⁿ14 | 4,823ⁿ11 |
| lantern · 3x lovers | 16 | 34 | 42 | 54ⁿ14 | 51ⁿ10 | 0.1 | 0.3ⁿ14 | 0.2ⁿ10 | 91,052 | 155,008ⁿ14 | 227,318ⁿ10 | 3.0 | 6.0ⁿ14 | 9.0ⁿ10 | 3.6 | 6.5ⁿ14 | 9.7ⁿ10 | 3.0 | 10ⁿ14 | 22ⁿ10 | 723 | 2,106 | 4,518ⁿ14 | 1,120ⁿ14 | 2,909ⁿ14 | 6,959ⁿ10 | 648ⁿ10 | 2,648ⁿ10 | 7,740ⁿ8 | 2,483 | 3,314ⁿ14 | 3,890ⁿ10 | 567 | 879ⁿ14 | 1,523ⁿ10 | 1,876 | 3,737ⁿ14 | 8,469ⁿ10 |
| lantern · 4x lovers | 16 | 34 | 33 | 47 | 63ⁿ13 | 0.0 | 0.2 | 0.4ⁿ13 | 93,052 | 156,567 | 237,394ⁿ13 | 4.0 | 8.0 | 12ⁿ13 | 4.7 | 8.8 | 13ⁿ13 | 4.0 | 13 | 28ⁿ13 | 803 | 2,707 | 4,896 | 1,134 | 3,018 | 6,240ⁿ14 | 1,014ⁿ13 | 2,519ⁿ13 | 7,101ⁿ8 | 3,023 | 3,546 | 3,105ⁿ13 | 587 | 986 | 1,475ⁿ13 | 2,190 | 4,974 | 9,614ⁿ13 |
| castle · base | 15 (+1 unreached) | 33 | 58 | 70ⁿ9 | 87ⁿ4 | 0.4 | 0.6ⁿ9 | 0.8ⁿ4 | 179,445 | 252,821ⁿ9 | 367,428ⁿ4 | 1.0 | 2.0ⁿ9 | 3.0ⁿ4 | 1.4 | 2.4ⁿ9 | 3.3ⁿ4 | 2.9 | 7.0ⁿ9 | 15ⁿ4 | 2,099 | 5,924 | 12,433ⁿ9 | 1,802ⁿ9 | 4,261ⁿ9 | 15,658ⁿ4 | 3,160ⁿ4 | 4,764ⁿ4 | 8,884ⁿ2 | 4,986 | 4,234ⁿ9 | 4,504ⁿ4 | 605 | 710ⁿ9 | 921ⁿ4 | 2,327 | 2,573ⁿ9 | 3,508ⁿ4 |
| castle · 2x lovers | 15 (+1 unreached) | 33 | 48 | 37ⁿ11 | 51ⁿ10 | 0.3 | 0.1ⁿ11 | 0.2ⁿ10 | 181,445 | 263,261ⁿ11 | 360,074ⁿ10 | 2.0 | 4.0ⁿ11 | 6.0ⁿ10 | 2.4 | 4.6ⁿ11 | 6.4ⁿ10 | 3.2 | 9.8ⁿ11 | 20ⁿ10 | 2,611 | 7,318 | 10,310ⁿ10 | 3,443ⁿ11 | 9,575ⁿ11 | 14,982ⁿ10 | 2,526ⁿ10 | 5,983ⁿ10 | 14,405ⁿ8 | 6,295 | 9,056ⁿ11 | 7,763ⁿ10 | 640 | 1,112ⁿ11 | 1,569ⁿ10 | 2,671 | 6,880ⁿ11 | 9,475ⁿ10 |
| castle · 3x lovers | 15 (+1 unreached) | 33 | 45 | 37ⁿ12 | 48ⁿ11 | 0.2 | 0.1ⁿ12 | 0.2ⁿ11 | 183,445 | 266,623ⁿ12 | 377,929ⁿ11 | 3.0 | 6.0ⁿ12 | 9.0ⁿ11 | 3.6 | 6.8ⁿ12 | 9.5ⁿ11 | 3.4 | 12ⁿ12 | 25ⁿ11 | 2,036 | 5,753 | 10,400ⁿ12 | 3,787ⁿ12 | 9,044ⁿ12 | 12,302ⁿ11 | 3,384ⁿ11 | 8,116ⁿ11 | 14,857ⁿ9 | 5,491 | 8,379ⁿ12 | 8,799ⁿ11 | 697 | 1,198ⁿ12 | 1,462ⁿ11 | 3,213 | 7,516ⁿ12 | 13,680ⁿ11 |
| castle · 4x lovers | 15 (+1 unreached) | 33 | 41 | 37ⁿ13 | 44ⁿ12 | 0.1 | 0.1ⁿ13 | 0.1ⁿ12 | 185,445 | 273,579ⁿ13 | 393,830ⁿ12 | 4.0 | 8.0ⁿ13 | 12ⁿ12 | 4.6 | 8.7ⁿ13 | 13ⁿ12 | 4.0 | 14ⁿ13 | 30ⁿ12 | 2,126 | 6,273 | 10,098ⁿ13 | 4,824ⁿ13 | 8,535ⁿ13 | 12,446ⁿ12 | 4,250ⁿ12 | 7,029ⁿ12 | 12,074ⁿ11 | 5,930 | 8,600ⁿ13 | 8,410ⁿ12 | 746 | 1,233ⁿ13 | 1,646ⁿ12 | 4,137 | 9,722ⁿ13 | 18,525ⁿ12 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ c2weeks | Δ c3weeks | Δ c4weeks | Δ c2cfHE | Δ c3cfHE | Δ c4cfHE | Δ c2hNet | Δ c3hNet | Δ c4hNet | Δ c4over |
|---|---|---|---|---|---|---|---|---|---|---|
| tankard · 2x lovers | +3.7 ± 9.6 | -10.2 ± 24.6 | +2.6 ± 26.7 | -142.8 ± 281.6 | +464.2 ± 501.6 | -351.0 ± 660.8 | +64.3 ± 417.8 | +501.6 ± 1,138 | -1,262 ± 1,585 | +0.0 ± 0.4 |
| tankard · 3x lovers | +6.1 ± 9.7 | -4.6 ± 26.6 | +12.6 ± 45.3 | **-384.9 ± 202.9** | +421.9 ± 770.0 | **-875.9 ± 696.0** | -325.6 ± 476.0 | +174.1 ± 1,509 | -1,566 ± 2,476 | +0.1 ± 0.7 |
| tankard · 4x lovers | +10.8 ± 11.6 | -4.8 ± 24.7 | **+23.6 ± 23.2** | **-253.8 ± 194.8** | +439.7 ± 604.7 | **-855.9 ± 590.5** | -380.2 ± 479.0 | +299.1 ± 1,334 | **-1,818 ± 1,303** | +0.3 ± 0.4 |
| lantern · 2x lovers | +6.8 ± 9.1 | -11.3 ± 13.7 | +2.8 ± 32.6 | **-335.8 ± 164.7** | **+787.4 ± 510.7** | -167.0 ± 1,245 | -153.4 ± 420.9 | +774.9 ± 819.3 | -198.0 ± 2,699 | +0.0 ± 0.5 |
| lantern · 3x lovers | +5.2 ± 15.3 | -0.8 ± 21.9 | -25.9 ± 27.8 | -57.7 ± 345.7 | **+660.4 ± 569.5** | -347.0 ± 934.6 | -108.3 ± 682.7 | +395.6 ± 1,422 | +963.1 ± 2,382 | **-0.4 ± 0.4** |
| lantern · 4x lovers | -4.4 ± 8.9 | -8.9 ± 18.0 | -11.7 ± 30.7 | +23.2 ± 247.7 | **+659.2 ± 640.9** | +62.3 ± 939.1 | **+431.9 ± 348.8** | +585.0 ± 1,030 | -41.0 ± 2,446 | -0.2 ± 0.4 |
| castle · 2x lovers | -9.7 ± 11.7 | **-33.3 ± 25.1** | -32.5 ± 65.0 | +512.4 ± 633.2 | +1,864 ± 2,278 | -1,564 ± 4,892 | **+1,309 ± 1,015** | **+5,001 ± 2,962** | +2,861 ± 7,746 | -0.5 ± 1.0 |
| castle · 3x lovers | -12.8 ± 15.0 | **-33.1 ± 26.9** | -35.5 ± 42.5 | -63.1 ± 441.9 | **+2,284 ± 1,768** | -375.4 ± 4,154 | +505.1 ± 1,383 | **+4,440 ± 4,187** | +3,846 ± 5,589 | -0.5 ± 0.6 |
| castle · 4x lovers | -16.1 ± 16.7 | -31.9 ± 36.9 | -41.0 ± 47.1 | +27.4 ± 787.1 | **+2,897 ± 2,831** | -37.2 ± 6,172 | +944.0 ± 1,651 | +4,471 ± 5,395 | +2,369 ± 4,500 | **-0.7 ± 0.7** |

---

### c1-baseline



scenario **campaign** · 16 seeds from 1 · 11s · 2026-11-20T20:53

| variant | n | weeksToWin | winRate | midAt | lateAt | netEarly | netMid | netLate | worth13 | worth20 | missed | rep | staff | sat | left | over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | 16 | 30 | 1.0 | 3.8 | 15 | 609 | 861 | 2,207 | -23,211 | -12,889 | 0.0 | 58 | 11 | 67 | 0.1 | 0.0 |

Per job (base; per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| job | lady-weeks | rest% | earned | wage | rech | net | served |
|---|---|---|---|---|---|---|---|
| courtesan | 1234 | 0 | 827 | 39 | 0 | 788 | 8.3 |
| dancer | 222 | 0 | 327 | 32 | 0 | 295 | 0.0 |
| madame | 199 | 0 | 222 | 46 | 0 | 175 | 1.8 |
| bartender | 425 | 0 | 168 | 38 | 0 | 129 | 0.0 |
| guild | 266 | 0 | 152 | 37 | 0 | 115 | 0.0 |
| attendant | 349 | 0 | 105 | 35 | 0 | 70 | 1.9 |
| security | 188 | 0 | 29 | 27 | 0 | 2 | 0.0 |
| maid | 498 | 0 | 13 | 29 | 0 | -16 | 0.0 |
| promoter | 426 | 0 | 2 | 41 | 0 | -39 | 0.0 |

Per race (generic ladies) (base; per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| race | lady-weeks | rest% | earned | wage | rech | net | served |
|---|---|---|---|---|---|---|---|
| demon | 52 | 4 | 471 | 44 | 0 | 427 | 7.4 |
| beastkin/rabbit | 118 | 2 | 167 | 30 | 0 | 137 | 2.5 |
| beastkin/wolf | 142 | 4 | 150 | 30 | 0 | 121 | 1.5 |
| beastkin/fox | 125 | 1 | 141 | 28 | 0 | 113 | 2.7 |
| beastkin/cat | 91 | 1 | 144 | 32 | 0 | 112 | 2.3 |
| human | 1376 | 4 | 126 | 35 | 0 | 91 | 2.4 |
| dwarf | 129 | 2 | 102 | 35 | 0 | 67 | 1.0 |
| elf | 222 | 2 | 86 | 36 | 0 | 50 | 0.4 |
| angel | 18 | 0 | 0 | 43 | 0 | -43 | 0.0 |

---

### tidiness

Tidiness held at a fixed level for every measured week (base = 70, meant to be neutral). Intent: 60-90 close to neutral, a noticeable penalty below 30. 'free' lets it drift as normal.

scenario **mid** · 16 seeds from 1 · 57s · 2026-11-20T20:53

| variant | n | total | net | tidy | served | sat | repGain | mood | left |
|---|---|---|---|---|---|---|---|---|---|
| mid · base | 16 | 653 | 550 | 72 | 14 | 62 | 8.0 | 81 | 0.0 |
| mid · tidy 90 | 16 | 747 | 610 | 85 | 15 | 67 | 14 | 86 | 0.0 |
| mid · tidy 60 | 16 | 654 | 551 | 66 | 15 | 62 | 8.1 | 81 | 0.0 |
| mid · tidy 45 | 16 | 474 | 374 | 58 | 12 | 56 | -2.0 | 79 | 0.0 |
| mid · tidy 25 | 16 | 381 | 285 | 43 | 10 | 47 | -11 | 68 | 0.0 |
| mid · free | 16 | 647 | 563 | 69 | 15 | 62 | 9.2 | 81 | 0.0 |
| late · base | 16 | 1,615 | 1,509 | 66 | 27 | 64 | 17 | 86 | 0.0 |
| late · tidy 90 | 16 | 1,806 | 1,693 | 79 | 27 | 68 | 22 | 89 | 0.0 |
| late · tidy 60 | 16 | 1,729 | 1,616 | 61 | 27 | 65 | 18 | 87 | 0.0 |
| late · tidy 45 | 16 | 1,474 | 1,354 | 51 | 25 | 61 | 14 | 82 | 0.1 |
| late · tidy 25 | 16 | 1,148 | 1,042 | 34 | 21 | 53 | -7.8 | 72 | 0.1 |
| late · free | 16 | 1,555 | 1,439 | 60 | 26 | 63 | 15 | 86 | 0.0 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ total | Δ net | Δ sat | Δ repGain |
|---|---|---|---|---|
| mid · tidy 90 | +93.5 ± 159.5 | +59.6 ± 131.8 | **+4.2 ± 3.2** | **+6.0 ± 5.8** |
| mid · tidy 60 | +1.0 ± 1.9 | +1.0 ± 1.9 | -0.1 ± 0.2 | +0.2 ± 0.3 |
| mid · tidy 45 | **-179.8 ± 120.5** | **-176.3 ± 103.0** | **-6.9 ± 2.6** | **-10.0 ± 6.4** |
| mid · tidy 25 | **-272.2 ± 96.7** | **-264.9 ± 91.8** | **-15.0 ± 3.6** | **-18.8 ± 5.6** |
| mid · free | -6.5 ± 47.5 | +12.5 ± 49.8 | -0.8 ± 1.0 | +1.2 ± 4.4 |
| late · tidy 90 | **+191.0 ± 119.0** | **+183.7 ± 103.8** | **+3.8 ± 2.0** | **+4.5 ± 3.5** |
| late · tidy 60 | +114.1 ± 143.9 | +106.2 ± 143.0 | +0.7 ± 1.2 | +0.8 ± 1.9 |
| late · tidy 45 | -141.0 ± 200.2 | -155.4 ± 194.2 | **-2.7 ± 1.9** | **-3.2 ± 3.2** |
| late · tidy 25 | **-466.7 ± 161.0** | **-467.3 ± 145.4** | **-10.5 ± 2.2** | **-25.0 ± 4.9** |
| late · free | -59.3 ± 150.4 | -70.3 ± 146.7 | -0.8 ± 1.1 | -2.1 ± 2.5 |

---

### promoter-value



scenario **early** · 16 seeds from 1 · 12s · 2026-11-20T20:54

| variant | n | total | net | promo | served | turned | repGain |
|---|---|---|---|---|---|---|---|
| lantern · base | 16 | 283 | 283 | 0.3 | 7.2 | 2.2 | -8.0 |
| lantern · +promoter | 16 | 411 | 411 | 5.7 | 9.3 | 3.7 | -5.6 |
| hollow · base | 16 | 193 | 193 | 0.2 | 3.0 | 0.6 | 7.5 |
| hollow · +promoter | 16 | 520 | 520 | 7.5 | 8.1 | 1.6 | 6.2 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ total | Δ net | Δ repGain |
|---|---|---|---|
| lantern · +promoter | **+128.4 ± 57.7** | **+128.4 ± 57.7** | +2.4 ± 3.4 |
| hollow · +promoter | **+327.2 ± 74.3** | **+327.2 ± 74.3** | -1.3 ± 5.2 |

---

### security-value



scenario **mid** · 16 seeds from 1 · 19s · 2026-11-20T20:54

| variant | n | total | net | pushy | unhandled | incidents | incHandled | damage | trouble | lost | sat | repGain |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| mid · base | 16 | 560 | 476 | 0.6 | 0.2 | 0.6 | 0.0 | 10 | 0.8 | 0.2 | 66 | 9.0 |
| mid · +security | 16 | 523 | 450 | 0.7 | 0.2 | 0.2 | 0.4 | 6.6 | 0.4 | 0.2 | 63 | 6.9 |
| late · base | 16 | 1,575 | 1,468 | 2.3 | 0.0 | 1.0 | 0.0 | 21 | 1.0 | 0.0 | 64 | 18 |
| late · +security | 16 | 1,731 | 1,665 | 2.3 | 0.0 | 0.1 | 0.8 | 2.5 | 0.1 | 0.0 | 65 | 20 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ total | Δ trouble | Δ damage | Δ sat |
|---|---|---|---|---|
| mid · +security | -36.5 ± 132.5 | **-0.4 ± 0.1** | -3.8 ± 5.3 | -2.4 ± 2.7 |
| late · +security | **+155.9 ± 125.1** | **-0.9 ± 0.2** | **-18.8 ± 5.1** | +1.1 ± 1.4 |

---

### races-mixed

Rare races in a mixed house: two generic ladies in the home house become this race (everyone else stays as rolled, later hires are random) and the bot assigns jobs as usual. Spirits and androids take no bed, so the bot may fit more staff (watch the staff column). This is the realistic case: rare races turn up one or two at a time.

scenario **mid** · 16 seeds from 1 · 68s · 2026-11-20T20:55

| variant | n | total | net | perLady | staff | served | sat | repGain | left |
|---|---|---|---|---|---|---|---|---|---|
| mid · base | 16 | 647 | 563 | 58 | 9.4 | 15 | 62 | 9.2 | 0.0 |
| mid · human | 16 | 685 | 605 | 46 | 9.5 | 15 | 62 | 9.4 | 0.0 |
| mid · demon | 16 | 714 | 588 | 76 | 8.1 | 14 | 63 | 12 | 0.0 |
| mid · spirit | 16 | 675 | 596 | 55 | 10 | 18 | 59 | 12 | 0.1 |
| mid · android | 16 | 750 | 617 | 64 | 11 | 19 | 60 | 14 | 0.0 |
| mid · angel | 16 | 617 | 558 | 46 | 9.5 | 15 | 61 | 9.1 | 0.0 |
| mid · dwarf | 16 | 671 | 579 | 42 | 9.3 | 15 | 61 | 11 | 0.0 |
| late · base | 16 | 1,555 | 1,439 | 111 | 11 | 26 | 63 | 15 | 0.0 |
| late · human | 16 | 1,655 | 1,535 | 105 | 11 | 27 | 64 | 18 | 0.0 |
| late · demon | 16 | 1,546 | 1,439 | 152 | 11 | 26 | 62 | 16 | 0.1 |
| late · spirit | 16 | 1,673 | 1,555 | 114 | 13 | 30 | 63 | 18 | 0.0 |
| late · android | 16 | 1,890 | 1,756 | 100 | 13 | 29 | 67 | 22 | 0.1 |
| late · angel | 16 | 1,753 | 1,651 | 110 | 11 | 26 | 65 | 21 | 0.0 |
| late · dwarf | 16 | 1,721 | 1,605 | 112 | 11 | 27 | 64 | 19 | 0.0 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ total | Δ net | Δ sat |
|---|---|---|---|
| mid · human | +38.5 ± 83.4 | +42.1 ± 82.4 | +0.5 ± 1.0 |
| mid · demon | +67.4 ± 170.3 | +25.4 ± 153.7 | +1.7 ± 2.9 |
| mid · spirit | +28.6 ± 133.8 | +33.4 ± 135.2 | -2.8 ± 3.3 |
| mid · android | +103.5 ± 173.5 | +54.6 ± 178.0 | -1.2 ± 4.5 |
| mid · angel | -30.0 ± 98.0 | -4.3 ± 104.8 | -0.7 ± 2.8 |
| mid · dwarf | +24.6 ± 132.7 | +16.5 ± 119.5 | -0.6 ± 3.2 |
| late · human | +99.8 ± 149.2 | +95.8 ± 149.8 | +0.9 ± 2.2 |
| late · demon | -9.6 ± 228.1 | +0.1 ± 220.9 | -1.4 ± 2.6 |
| late · spirit | +117.7 ± 142.1 | +116.0 ± 137.6 | -0.4 ± 1.9 |
| late · android | **+335.0 ± 201.4** | **+316.4 ± 185.7** | **+3.5 ± 3.4** |
| late · angel | **+197.8 ± 128.9** | **+211.8 ± 123.9** | +2.3 ± 2.4 |
| late · dwarf | **+165.9 ± 158.7** | **+166.2 ± 147.6** | +1.1 ± 2.2 |

Per race (generic ladies) (mid · base; per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| race | lady-weeks | rest% | earned | wage | rech | net | served |
|---|---|---|---|---|---|---|---|
| demon | 38 | 24 | 271 | 34 | 0 | 237 | 3.1 |
| beastkin/fox | 51 | 2 | 173 | 27 | 0 | 146 | 3.5 |
| beastkin/wolf | 67 | 6 | 172 | 29 | 0 | 142 | 3.8 |
| angel | 31 | 3 | 128 | 36 | 0 | 92 | 2.0 |
| dwarf | 50 | 0 | 76 | 31 | 0 | 45 | 2.0 |
| human | 545 | 7 | 68 | 32 | 0 | 35 | 1.4 |
| beastkin/rabbit | 48 | 4 | 57 | 28 | 0 | 29 | 1.4 |
| beastkin/cat | 20 | 5 | 45 | 29 | 0 | 16 | 0.3 |
| elf | 65 | 11 | 41 | 34 | 0 | 7 | 0.7 |

---

### race-jobs

Race x job: every generic lady (and every hire during the measured weeks) is this race; two of them are forced into the job. Δ is against the same race's default assignment, so it shows where each race belongs. Compare a job across races with the means. Needed amenities (race or job) are granted free.

scenario **mid** · 12 seeds from 1 · 256s · 2026-11-20T20:59

| variant | n | total | net | perLady | repGain | sat | served | left |
|---|---|---|---|---|---|---|---|---|
| human · base | 12 | 631 | 539 | 50 | 6.9 | 58 | 15 | 0.0 |
| human · courtesan | 12 | 498 | 390 | 87 | 6.2 | 52 | 17 | 0.0 |
| human · promoter | 12 | 570 | 495 | 24 | 7.6 | 63 | 14 | 0.0 |
| human · bartender | 12 | 576 | 393 | 40 | 7.0 | 61 | 12 | 0.0 |
| human · security | 12 | 464 | 388 | 1.8 | 9.4 | 66 | 9.0 | 0.1 |
| human · dancer | 12 | 521 | 459 | 40 | 3.1 | 64 | 11 | 0.0 |
| human · host | 12 | 608 | 529 | 25 | 18 | 67 | 12 | 0.1 |
| human · attendant | 12 | 505 | 360 | 27 | 6.2 | 60 | 12 | 0.0 |
| human · maid | 12 | 456 | 398 | 21 | 8.5 | 65 | 11 | 0.0 |
| elf · base | 12 | 658 | 509 | 65 | 9.3 | 59 | 15 | 0.0 |
| elf · courtesan | 12 | 510 | 368 | 89 | 8.3 | 55 | 16 | 0.0 |
| elf · promoter | 12 | 610 | 497 | 25 | 10 | 63 | 12 | 0.2 |
| elf · bartender | 12 | 580 | 387 | 38 | 4.5 | 66 | 11 | 0.0 |
| elf · security | 12 | 484 | 405 | 12 | 8.6 | 66 | 9.0 | 0.1 |
| elf · dancer | 12 | 496 | 413 | 40 | 5.1 | 63 | 11 | 0.0 |
| elf · host | 12 | 613 | 473 | 37 | 20 | 68 | 12 | 0.1 |
| elf · attendant | 12 | 438 | 337 | 25 | 1.1 | 60 | 11 | 0.0 |
| elf · maid | 12 | 508 | 377 | 21 | 5.8 | 68 | 10 | 0.1 |
| beastkin/fox · base | 12 | 677 | 562 | 72 | 9.4 | 57 | 18 | 0.0 |
| beastkin/fox · courtesan | 12 | 487 | 354 | 105 | 0.9 | 52 | 16 | 0.0 |
| beastkin/fox · promoter | 12 | 506 | 444 | 23 | 0.0 | 62 | 12 | 0.0 |
| beastkin/fox · bartender | 12 | 617 | 453 | 50 | 5.9 | 62 | 12 | 0.1 |
| beastkin/fox · security | 12 | 523 | 424 | 14 | 4.4 | 63 | 9.9 | 0.0 |
| beastkin/fox · dancer | 12 | 562 | 463 | 43 | 1.3 | 64 | 10 | 0.0 |
| beastkin/fox · host | 12 | 601 | 519 | 29 | 17 | 69 | 11 | 0.0 |
| beastkin/fox · attendant | 12 | 475 | 379 | 31 | 5.5 | 58 | 12 | 0.0 |
| beastkin/fox · maid | 12 | 550 | 464 | 30 | 10 | 63 | 13 | 0.0 |
| beastkin/wolf · base | 12 | 718 | 582 | 68 | 12 | 58 | 17 | 0.0 |
| beastkin/wolf · courtesan | 12 | 585 | 406 | 105 | 3.1 | 52 | 18 | 0.1 |
| beastkin/wolf · promoter | 12 | 612 | 509 | 47 | 6.1 | 61 | 14 | 0.0 |
| beastkin/wolf · bartender | 12 | 760 | 563 | 41 | 11 | 66 | 14 | 0.0 |
| beastkin/wolf · security | 12 | 594 | 497 | 8.4 | 8.9 | 65 | 11 | 0.1 |
| beastkin/wolf · dancer | 12 | 570 | 462 | 57 | 1.5 | 62 | 10 | 0.0 |
| beastkin/wolf · host | 12 | 642 | 549 | 33 | 22 | 68 | 11 | 0.2 |
| beastkin/wolf · attendant | 12 | 603 | 458 | 42 | 10 | 60 | 13 | 0.0 |
| beastkin/wolf · maid | 12 | 518 | 394 | 31 | 6.2 | 62 | 12 | 0.0 |
| demon · base | 12 | 764 | 659 | 141 | 5.2 | 61 | 15 | 0.0 |
| demon · courtesan | 12 | 668 | 501 | 165 | 0.8 | 56 | 15 | 0.0 |
| demon · promoter | 12 | 532 | 421 | 40 | -2.9 | 63 | 11 | 0.0 |
| demon · bartender | 12 | 587 | 413 | 55 | 2.4 | 66 | 10 | 0.0 |
| demon · security | 12 | 475 | 370 | 8.9 | -1.5 | 67 | 8.5 | 0.0 |
| demon · dancer | 12 | 480 | 372 | 48 | -6.5 | 67 | 8.9 | 0.0 |
| demon · host | 12 | 517 | 414 | 28 | -1.0 | 68 | 8.0 | 0.0 |
| demon · attendant | 12 | 499 | 397 | 63 | 0.1 | 60 | 11 | 0.0 |
| demon · maid | 12 | 500 | 408 | 32 | 2.0 | 67 | 10 | 0.0 |
| dwarf · base | 12 | 714 | 580 | 77 | 12 | 56 | 17 | 0.0 |
| dwarf · courtesan | 12 | 473 | 357 | 103 | 1.0 | 49 | 17 | 0.0 |
| dwarf · promoter | 12 | 505 | 437 | 38 | 2.9 | 59 | 13 | 0.0 |
| dwarf · bartender | 12 | 544 | 385 | 43 | 6.6 | 63 | 11 | 0.0 |
| dwarf · security | 12 | 549 | 404 | 6.1 | 9.6 | 64 | 9.5 | 0.0 |
| dwarf · dancer | 12 | 473 | 372 | 42 | -3.8 | 62 | 9.4 | 0.0 |
| dwarf · host | 12 | 583 | 471 | 24 | 21 | 69 | 9.5 | 0.0 |
| dwarf · attendant | 12 | 470 | 372 | 14 | 8.0 | 62 | 11 | 0.1 |
| dwarf · maid | 12 | 529 | 424 | 33 | 10 | 64 | 12 | 0.0 |
| spirit · base | 12 | 1,084 | 890 | 49 | 25 | 66 | 23 | 0.0 |
| spirit · courtesan | 12 | 802 | 668 | 63 | 17 | 62 | 21 | 0.0 |
| spirit · promoter | 12 | 707 | 630 | 30 | 15 | 63 | 19 | 0.0 |
| spirit · bartender | 12 | 756 | 590 | 44 | 19 | 64 | 18 | 0.1 |
| spirit · security | 12 | 898 | 715 | 32 | 21 | 66 | 17 | 0.1 |
| spirit · dancer | 12 | 775 | 706 | 38 | 15 | 63 | 19 | 0.0 |
| spirit · host | 12 | 847 | 757 | 46 | 20 | 68 | 19 | 0.2 |
| spirit · attendant | 12 | 816 | 701 | 33 | 18 | 64 | 19 | 0.1 |
| spirit · maid | 12 | 759 | 655 | 30 | 21 | 65 | 18 | 0.1 |
| angel · base | 12 | 666 | 579 | 52 | 14 | 60 | 16 | 0.0 |
| angel · courtesan | 12 | 513 | 374 | 94 | 8.3 | 55 | 16 | 0.0 |
| angel · promoter | 12 | 523 | 433 | 16 | 7.7 | 64 | 12 | 0.0 |
| angel · bartender | 12 | 627 | 433 | 30 | 10 | 67 | 12 | 0.0 |
| angel · security | 12 | 427 | 339 | -6.2 | 4.3 | 65 | 8.6 | 0.0 |
| angel · dancer | 12 | 515 | 435 | 42 | 1.4 | 63 | 10 | 0.0 |
| angel · host | 12 | 728 | 630 | 25 | 24 | 71 | 12 | 0.0 |
| angel · attendant | 12 | 487 | 356 | 14 | 4.0 | 61 | 11 | 0.0 |
| angel · maid | 12 | 584 | 465 | 16 | 13 | 67 | 12 | 0.1 |
| android · base | 12 | 742 | 583 | 33 | 21 | 66 | 21 | 0.0 |
| android · courtesan | 12 | 697 | 485 | 64 | 20 | 64 | 21 | 0.0 |
| android · promoter | 12 | 422 | 336 | 5.3 | 13 | 63 | 19 | 0.0 |
| android · bartender | 12 | 590 | 399 | 24 | 23 | 67 | 18 | 0.0 |
| android · security | 12 | 521 | 379 | 1.7 | 21 | 67 | 15 | 0.0 |
| android · dancer | 12 | 584 | 467 | 16 | 14 | 67 | 18 | 0.0 |
| android · host | 12 | 736 | 595 | 16 | 32 | 76 | 16 | 0.0 |
| android · attendant | 12 | 473 | 350 | 4.0 | 18 | 63 | 17 | 0.0 |
| android · maid | 12 | 596 | 471 | 10 | 23 | 70 | 17 | 0.0 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ total | Δ net | Δ sat | Δ left |
|---|---|---|---|---|
| human · courtesan | **-133.2 ± 130.0** | **-149.3 ± 123.7** | **-5.7 ± 3.0** | +0.0 ± 0.0 |
| human · promoter | -60.7 ± 137.4 | -44.3 ± 101.5 | **+5.3 ± 3.3** | +0.0 ± 0.0 |
| human · bartender | -55.0 ± 183.2 | -145.9 ± 166.3 | +3.4 ± 4.4 | +0.0 ± 0.0 |
| human · security | **-166.4 ± 140.1** | **-151.0 ± 106.3** | **+8.0 ± 4.4** | +0.1 ± 0.2 |
| human · dancer | **-110.3 ± 90.9** | **-80.3 ± 75.7** | **+6.1 ± 3.7** | +0.0 ± 0.0 |
| human · host | -22.6 ± 223.5 | -10.4 ± 181.5 | **+9.3 ± 4.0** | +0.1 ± 0.2 |
| human · attendant | -125.8 ± 132.2 | **-178.5 ± 133.3** | +1.9 ± 3.9 | +0.0 ± 0.0 |
| human · maid | **-175.4 ± 128.4** | **-141.1 ± 117.3** | **+7.7 ± 4.4** | +0.0 ± 0.0 |
| elf · courtesan | **-147.7 ± 134.1** | **-141.4 ± 106.6** | **-4.6 ± 4.2** | +0.0 ± 0.0 |
| elf · promoter | -47.6 ± 234.1 | -12.3 ± 186.1 | +3.4 ± 3.7 | +0.2 ± 0.2 |
| elf · bartender | -78.2 ± 146.5 | -121.6 ± 148.8 | **+6.2 ± 3.7** | +0.0 ± 0.0 |
| elf · security | **-173.4 ± 126.6** | -103.8 ± 108.3 | **+6.5 ± 5.3** | +0.1 ± 0.2 |
| elf · dancer | **-161.5 ± 143.7** | -96.0 ± 119.4 | +3.5 ± 4.6 | +0.0 ± 0.0 |
| elf · host | -44.7 ± 235.3 | -35.9 ± 213.6 | **+8.7 ± 5.6** | +0.1 ± 0.2 |
| elf · attendant | **-220.1 ± 182.6** | **-172.2 ± 170.8** | +0.5 ± 2.8 | +0.0 ± 0.0 |
| elf · maid | **-149.9 ± 139.2** | -131.7 ± 148.2 | **+8.3 ± 4.7** | +0.1 ± 0.2 |
| beastkin/fox · courtesan | **-190.0 ± 106.5** | **-208.1 ± 111.3** | **-5.4 ± 3.0** | +0.0 ± 0.0 |
| beastkin/fox · promoter | **-170.9 ± 152.9** | -118.0 ± 149.7 | **+5.2 ± 4.7** | +0.0 ± 0.0 |
| beastkin/fox · bartender | -60.4 ± 143.2 | -109.3 ± 164.6 | **+5.2 ± 3.5** | +0.1 ± 0.2 |
| beastkin/fox · security | **-154.3 ± 132.5** | **-138.1 ± 113.3** | **+6.0 ± 3.8** | +0.0 ± 0.0 |
| beastkin/fox · dancer | -115.8 ± 151.3 | -99.3 ± 151.0 | **+7.1 ± 4.6** | +0.0 ± 0.0 |
| beastkin/fox · host | -76.2 ± 169.1 | -42.7 ± 173.4 | **+12.2 ± 3.2** | +0.0 ± 0.0 |
| beastkin/fox · attendant | **-202.3 ± 187.4** | -183.1 ± 183.6 | +1.3 ± 4.6 | +0.0 ± 0.0 |
| beastkin/fox · maid | -127.8 ± 144.2 | -98.1 ± 139.3 | **+6.1 ± 4.1** | +0.0 ± 0.0 |
| beastkin/wolf · courtesan | **-133.8 ± 127.3** | **-175.3 ± 103.0** | **-6.1 ± 4.3** | +0.1 ± 0.2 |
| beastkin/wolf · promoter | -106.2 ± 207.6 | -72.7 ± 135.4 | +3.1 ± 3.1 | +0.0 ± 0.0 |
| beastkin/wolf · bartender | +41.4 ± 122.0 | -18.9 ± 113.2 | **+7.7 ± 3.3** | +0.0 ± 0.0 |
| beastkin/wolf · security | -124.7 ± 154.7 | -84.6 ± 134.5 | **+7.2 ± 3.6** | +0.1 ± 0.2 |
| beastkin/wolf · dancer | -148.8 ± 171.4 | -119.6 ± 125.4 | +4.1 ± 5.7 | +0.0 ± 0.0 |
| beastkin/wolf · host | -76.4 ± 233.2 | -32.4 ± 205.8 | **+10.1 ± 5.2** | +0.2 ± 0.2 |
| beastkin/wolf · attendant | -115.3 ± 216.0 | -123.5 ± 145.7 | +1.5 ± 2.4 | +0.0 ± 0.0 |
| beastkin/wolf · maid | **-200.5 ± 144.1** | **-187.9 ± 110.4** | +3.9 ± 3.9 | +0.0 ± 0.0 |
| demon · courtesan | -96.3 ± 117.0 | **-158.1 ± 85.0** | **-5.1 ± 3.9** | +0.0 ± 0.0 |
| demon · promoter | **-232.1 ± 214.2** | **-238.2 ± 205.6** | +1.3 ± 4.2 | +0.0 ± 0.0 |
| demon · bartender | -176.9 ± 225.6 | **-246.3 ± 199.6** | **+4.6 ± 2.9** | +0.0 ± 0.0 |
| demon · security | **-289.5 ± 175.3** | **-289.9 ± 159.3** | +5.4 ± 5.5 | +0.0 ± 0.0 |
| demon · dancer | **-284.3 ± 152.5** | **-287.5 ± 152.4** | **+5.2 ± 4.2** | +0.0 ± 0.0 |
| demon · host | **-247.3 ± 200.9** | **-245.7 ± 200.9** | **+6.9 ± 4.8** | +0.0 ± 0.0 |
| demon · attendant | **-264.9 ± 198.0** | **-262.4 ± 171.8** | -1.0 ± 3.9 | +0.0 ± 0.0 |
| demon · maid | **-263.8 ± 156.6** | **-251.0 ± 151.0** | **+5.6 ± 3.6** | +0.0 ± 0.0 |
| dwarf · courtesan | **-240.6 ± 124.5** | **-222.6 ± 103.3** | **-7.2 ± 3.6** | +0.0 ± 0.0 |
| dwarf · promoter | **-208.5 ± 192.3** | -143.0 ± 181.9 | +2.7 ± 3.9 | +0.0 ± 0.0 |
| dwarf · bartender | **-170.0 ± 162.8** | **-194.3 ± 136.3** | **+6.6 ± 5.1** | +0.0 ± 0.0 |
| dwarf · security | -165.1 ± 192.9 | **-175.5 ± 121.6** | **+7.4 ± 4.7** | +0.0 ± 0.0 |
| dwarf · dancer | **-240.4 ± 158.1** | **-207.4 ± 122.9** | **+5.8 ± 4.6** | +0.0 ± 0.0 |
| dwarf · host | -131.0 ± 267.3 | -109.2 ± 220.4 | **+12.7 ± 5.3** | +0.0 ± 0.0 |
| dwarf · attendant | **-244.2 ± 157.1** | **-207.5 ± 146.4** | **+5.3 ± 5.1** | +0.1 ± 0.2 |
| dwarf · maid | **-184.7 ± 94.2** | **-155.2 ± 107.2** | **+8.1 ± 4.5** | +0.0 ± 0.0 |
| spirit · courtesan | **-282.3 ± 222.9** | **-222.2 ± 188.2** | **-4.2 ± 3.7** | +0.0 ± 0.0 |
| spirit · promoter | **-376.6 ± 250.8** | **-259.3 ± 212.9** | **-3.1 ± 2.8** | +0.0 ± 0.0 |
| spirit · bartender | **-327.7 ± 262.3** | **-300.1 ± 256.6** | -1.9 ± 2.7 | +0.1 ± 0.2 |
| spirit · security | -186.2 ± 228.5 | -175.1 ± 197.0 | -0.3 ± 3.4 | +0.1 ± 0.2 |
| spirit · dancer | **-308.5 ± 204.2** | **-184.2 ± 162.9** | -3.3 ± 3.7 | +0.0 ± 0.0 |
| spirit · host | -237.4 ± 278.5 | -133.1 ± 231.8 | +1.8 ± 4.0 | +0.2 ± 0.2 |
| spirit · attendant | **-267.7 ± 261.6** | -189.1 ± 215.3 | -2.4 ± 3.8 | +0.1 ± 0.2 |
| spirit · maid | **-325.3 ± 169.9** | **-234.3 ± 140.5** | -1.2 ± 2.7 | +0.1 ± 0.2 |
| angel · courtesan | -153.2 ± 172.7 | **-204.4 ± 161.4** | **-5.3 ± 4.0** | +0.0 ± 0.0 |
| angel · promoter | -142.6 ± 179.6 | -146.0 ± 167.4 | +3.4 ± 3.8 | +0.0 ± 0.0 |
| angel · bartender | -39.2 ± 165.2 | -145.1 ± 165.6 | **+6.1 ± 3.4** | +0.0 ± 0.0 |
| angel · security | **-239.3 ± 157.9** | **-239.7 ± 167.5** | **+4.8 ± 3.6** | +0.0 ± 0.0 |
| angel · dancer | **-151.5 ± 132.4** | **-143.1 ± 109.7** | +2.3 ± 2.6 | +0.0 ± 0.0 |
| angel · host | +61.5 ± 198.5 | +51.1 ± 217.7 | **+10.8 ± 3.0** | +0.0 ± 0.0 |
| angel · attendant | **-179.0 ± 147.0** | **-222.8 ± 150.5** | +0.9 ± 3.2 | +0.0 ± 0.0 |
| angel · maid | -82.0 ± 191.8 | -113.4 ± 181.8 | **+6.5 ± 3.7** | +0.1 ± 0.2 |
| android · courtesan | -45.1 ± 237.6 | -97.8 ± 205.2 | -2.7 ± 4.6 | +0.0 ± 0.0 |
| android · promoter | **-319.6 ± 230.2** | **-246.5 ± 191.6** | **-3.4 ± 3.1** | +0.0 ± 0.0 |
| android · bartender | -152.2 ± 218.4 | **-183.6 ± 159.5** | +0.8 ± 3.7 | +0.0 ± 0.0 |
| android · security | -220.3 ± 257.7 | -203.3 ± 236.0 | +0.5 ± 3.2 | +0.0 ± 0.0 |
| android · dancer | -157.7 ± 189.2 | -116.0 ± 180.8 | +0.2 ± 2.8 | +0.0 ± 0.0 |
| android · host | -5.3 ± 388.0 | +11.9 ± 370.1 | **+9.2 ± 6.2** | +0.0 ± 0.0 |
| android · attendant | **-268.5 ± 220.2** | **-232.6 ± 176.6** | **-3.2 ± 2.8** | +0.0 ± 0.0 |
| android · maid | **-145.7 ± 143.1** | -111.5 ± 117.5 | +3.2 ± 3.6 | +0.0 ± 0.0 |

Per race · job (generic ladies) (all variants pooled; per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| racejob | lady-weeks | rest% | earned | wage | rech | net | served |
|---|---|---|---|---|---|---|---|
| demon · bath | 10 | 0 | 536 | 33 | 0 | 503 | 0.0 |
| demon · courtesan | 800 | 0 | 482 | 32 | 0 | 449 | 8.4 |
| angel/lantern · courtesan | 15 | 0 | 391 | 36 | 0 | 354 | 6.7 |
| android · courtesan | 2155 | 0 | 363 | 34 | 75 | 254 | 5.6 |
| beastkin/wolf · courtesan | 1043 | 0 | 277 | 28 | 0 | 249 | 7.5 |
| dwarf · courtesan | 977 | 0 | 269 | 33 | 0 | 237 | 7.6 |
| elf · courtesan | 1021 | 0 | 263 | 33 | 0 | 230 | 6.6 |
| beastkin/fox · courtesan | 1015 | 0 | 253 | 28 | 0 | 225 | 7.3 |
| angel · courtesan | 896 | 0 | 256 | 33 | 0 | 224 | 6.7 |
| human · courtesan | 991 | 0 | 231 | 32 | 0 | 199 | 6.7 |
| spirit · courtesan | 2619 | 0 | 219 | 33 | 0 | 186 | 4.9 |
| beastkin/wolf · bath | 2 | 0 | 177 | 30 | 0 | 148 | 0.0 |
| dwarf · guild | 341 | 0 | 148 | 33 | 0 | 115 | 0.0 |
| beastkin/wolf · guild | 348 | 0 | 137 | 28 | 0 | 109 | 0.0 |
| beastkin/fox · guild | 304 | 0 | 135 | 28 | 0 | 106 | 0.0 |
| angel/lantern · attendant | 2 | 0 | 133 | 37 | 0 | 96 | 3.5 |
| human · guild | 353 | 0 | 127 | 32 | 0 | 95 | 0.0 |
| android · guild | 971 | 0 | 174 | 33 | 50 | 91 | 0.0 |
| elf · guild | 284 | 0 | 122 | 32 | 0 | 90 | 0.0 |
| angel · guild | 271 | 0 | 120 | 33 | 0 | 87 | 0.0 |
| spirit · guild | 1047 | 0 | 115 | 33 | 0 | 83 | 0.0 |
| demon · attendant | 247 | 0 | 113 | 32 | 0 | 81 | 2.1 |
| angel/lantern · dancer | 4 | 0 | 110 | 36 | 0 | 75 | 0.0 |
| demon · guild | 233 | 0 | 105 | 32 | 0 | 73 | 0.0 |
| demon · dancer | 279 | 0 | 101 | 33 | 0 | 68 | 0.0 |
| beastkin/fox · dancer | 344 | 0 | 82 | 29 | 0 | 53 | 0.0 |
| human · attendant | 525 | 0 | 86 | 33 | 0 | 53 | 2.5 |
| beastkin/wolf · dancer | 384 | 0 | 80 | 29 | 0 | 51 | 0.0 |
| angel · attendant | 509 | 0 | 83 | 33 | 0 | 50 | 2.5 |
| beastkin/fox · attendant | 475 | 0 | 77 | 28 | 0 | 49 | 2.5 |
| spirit · bartender | 972 | 0 | 81 | 32 | 0 | 48 | 0.0 |
| beastkin/wolf · attendant | 565 | 0 | 74 | 28 | 0 | 46 | 2.2 |
| demon · bartender | 430 | 0 | 79 | 33 | 0 | 46 | 0.0 |
| beastkin/wolf · bartender | 641 | 0 | 74 | 28 | 0 | 46 | 0.0 |
| elf · attendant | 432 | 0 | 79 | 33 | 0 | 46 | 2.4 |
| elf · dancer | 372 | 0 | 77 | 33 | 0 | 43 | 0.0 |
| angel · dancer | 353 | 0 | 76 | 33 | 0 | 43 | 0.0 |
| beastkin/fox · bartender | 635 | 0 | 70 | 27 | 0 | 42 | 0.0 |
| human · dancer | 335 | 0 | 75 | 33 | 0 | 42 | 0.0 |
| dwarf · dancer | 379 | 0 | 76 | 34 | 0 | 42 | 0.0 |
| spirit · dancer | 429 | 0 | 75 | 33 | 0 | 42 | 0.0 |
| dwarf · bartender | 658 | 0 | 74 | 33 | 0 | 41 | 0.0 |
| human · bartender | 628 | 0 | 72 | 32 | 0 | 39 | 0.0 |
| elf · bartender | 530 | 0 | 70 | 32 | 0 | 38 | 0.0 |
| dwarf · attendant | 400 | 0 | 64 | 33 | 0 | 31 | 2.2 |
| angel · bartender | 635 | 0 | 63 | 32 | 0 | 31 | 0.0 |
| spirit · attendant | 2078 | 0 | 59 | 33 | 0 | 25 | 1.1 |
| demon · host | 144 | 0 | 37 | 32 | 0 | 6 | 0.0 |
| beastkin/fox · host | 215 | 0 | 28 | 28 | 0 | 1 | 0.0 |
| beastkin/wolf · host | 211 | 0 | 28 | 28 | 0 | -0 | 0.0 |
| android · bartender | 1026 | 0 | 82 | 33 | 50 | -1 | 0.0 |
| dwarf · host | 242 | 0 | 25 | 32 | 0 | -8 | 0.0 |
| human · host | 203 | 0 | 24 | 32 | 0 | -8 | 0.0 |
| angel · host | 196 | 0 | 24 | 32 | 0 | -8 | 0.0 |
| elf · host | 201 | 0 | 24 | 32 | 0 | -8 | 0.0 |
| spirit · host | 190 | 0 | 23 | 32 | 0 | -9 | 0.0 |
| spirit · rest | 1025 | 100 | 22 | 33 | 0 | -11 | 0.0 |
| android · dancer | 395 | 0 | 87 | 34 | 64 | -12 | 0.0 |
| demon · security | 192 | 0 | 18 | 32 | 0 | -14 | 0.0 |
| demon · promoter | 498 | 0 | 15 | 32 | 0 | -18 | 0.0 |
| demon · maid | 658 | 0 | 14 | 32 | 0 | -18 | 0.0 |
| beastkin/fox · security | 361 | 0 | 6 | 28 | 0 | -21 | 0.0 |
| beastkin/fox · promoter | 1046 | 0 | 7 | 28 | 0 | -21 | 0.0 |
| android · attendant | 1679 | 0 | 62 | 34 | 51 | -22 | 1.1 |
| beastkin/wolf · security | 357 | 0 | 6 | 28 | 0 | -22 | 0.0 |
| beastkin/fox · rest | 378 | 100 | 5 | 28 | 0 | -23 | 0.0 |
| beastkin/wolf · promoter | 1079 | 0 | 5 | 28 | 0 | -23 | 0.0 |
| beastkin/fox · maid | 972 | 0 | 5 | 28 | 0 | -23 | 0.0 |
| beastkin/wolf · maid | 1014 | 0 | 4 | 28 | 0 | -24 | 0.0 |
| elf · rest | 426 | 100 | 8 | 33 | 0 | -25 | 0.0 |
| beastkin/wolf · rest | 367 | 100 | 4 | 28 | 0 | -25 | 0.0 |
| angel · rest | 448 | 100 | 7 | 33 | 0 | -26 | 0.0 |
| human · rest | 494 | 100 | 6 | 32 | 0 | -26 | 0.0 |
| human · security | 374 | 0 | 6 | 32 | 0 | -26 | 0.0 |
| human · promoter | 999 | 0 | 6 | 33 | 0 | -27 | 0.0 |
| elf · security | 378 | 0 | 5 | 32 | 0 | -27 | 0.0 |
| elf · promoter | 944 | 0 | 6 | 33 | 0 | -27 | 0.0 |
| spirit · security | 645 | 0 | 5 | 32 | 0 | -28 | 0.0 |
| spirit · promoter | 2032 | 0 | 5 | 33 | 0 | -28 | 0.0 |
| human · maid | 1016 | 0 | 4 | 32 | 0 | -29 | 0.0 |
| demon · rest | 1754 | 100 | 3 | 32 | 0 | -29 | 0.0 |
| dwarf · security | 358 | 0 | 3 | 33 | 0 | -29 | 0.0 |
| dwarf · promoter | 1034 | 0 | 3 | 33 | 0 | -30 | 0.0 |
| elf · maid | 1048 | 0 | 3 | 32 | 0 | -30 | 0.0 |
| dwarf · maid | 920 | 0 | 2 | 33 | 0 | -30 | 0.0 |
| spirit · maid | 1737 | 0 | 2 | 33 | 0 | -31 | 0.0 |
| angel/lantern · rest | 3 | 100 | 0 | 31 | 0 | -31 | 0.0 |
| dwarf · rest | 262 | 100 | 1 | 32 | 0 | -31 | 0.0 |
| angel · security | 412 | 0 | 0 | 32 | 0 | -32 | 0.0 |
| angel · maid | 985 | 0 | 0 | 33 | 0 | -33 | 0.0 |
| angel · promoter | 1024 | 0 | 0 | 33 | 0 | -33 | 0.0 |
| android · rest | 234 | 100 | 0 | 34 | 4 | -38 | 0.0 |
| android · promoter | 1668 | 0 | 5 | 34 | 48 | -77 | 0.0 |
| android · security | 609 | 0 | 4 | 33 | 50 | -79 | 0.0 |
| android · maid | 1465 | 0 | 2 | 33 | 48 | -80 | 0.0 |
| android · host | 288 | 0 | 35 | 33 | 101 | -99 | 0.0 |

---

### sam-actions-campaign

Sam's spare rest-day action over a whole first cycle (Lantern): week the debt is cleared and income per phase. Group nights and demonstrations are flavor and left out.

scenario **campaign** · 16 seeds from 1 · 99s · 2026-11-20T21:01

| variant | n | weeksToWin | netEarly | netMid | netLate | worth20 | rep | trust | sat | left |
|---|---|---|---|---|---|---|---|---|---|---|
| base | 16 | 30 | 609 | 861 | 2,207 | -12,889 | 58 | 62 | 67 | 0.1 |
| scout | 16 | 32 | 591 | 715 | 2,115 | -15,384 | 53 | 61 | 66 | 0.1 |
| rounds | 16 | 31 | 588 | 837 | 2,021 | -11,855 | 52 | 69 | 66 | 0.1 |
| date | 16 | 30 | 657 | 758 | 2,061 | -13,365 | 51 | 67 | 66 | 0.1 |
| walk | 16 | 31 | 608 | 742 | 2,083 | -12,746 | 54 | 63 | 66 | 0.1 |
| rest | 16 | 30 | 609 | 861 | 2,207 | -12,889 | 58 | 62 | 67 | 0.1 |
| trainStat | 16 | 29 | 584 | 852 | 2,287 | -11,028 | 56 | 60 | 69 | 0.3 |
| trainSkill | 16 | 32 | 611 | 855 | 2,103 | -13,972 | 52 | 61 | 68 | 0.1 |
| trainService | 16 | 35 | 609 | 794 | 1,960 | -15,337 | 53 | 61 | 67 | 0.1 |

Paired Δ vs **base** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| scout | +1.9 ± 3.5 | -146.3 ± 201.8 | -92.0 ± 349.2 | -2,495 ± 5,628 | +0.0 ± 0.0 |
| rounds | +0.7 ± 2.9 | -23.9 ± 149.6 | -186.3 ± 296.5 | +1,034 ± 4,272 | +0.0 ± 0.0 |
| date | +0.1 ± 2.9 | -103.7 ± 208.0 | -145.6 ± 271.4 | -476.7 ± 4,445 | +0.0 ± 0.0 |
| walk | +1.1 ± 4.4 | -119.5 ± 246.4 | -124.0 ± 433.3 | +142.9 ± 6,583 | +0.0 ± 0.0 |
| rest | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| trainStat | -0.4 ± 4.4 | -9.2 ± 284.4 | +80.1 ± 456.3 | +1,861 ± 6,948 | +0.0 ± 0.0 |
| trainSkill | +1.6 ± 3.5 | -6.0 ± 325.7 | -104.2 ± 330.9 | -1,084 ± 6,478 | +0.0 ± 0.0 |
| trainService | +5.5 ± 10.1 | -67.0 ± 128.7 | -247.1 ± 425.3 | -2,448 ± 4,199 | +0.1 ± 0.1 |

---

### ngplus-carry

NG+ with different numbers of carried lovers (Devoted, partner first then by trust) and old friends (generics at max trust). Wayfarer as new house, Seasoned Owner. winWeek = length of cycle 2.

scenario **ngplus** · 24 seeds from 1 · 252s · 2026-11-20T21:09

| variant | n | c1won | c2lovers | ngDebt | ngStaff | ngWeeks | net | missed | staff | sat | left | over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | 24 | 33 | 1.6 | 81,005 | 3.9 | 39 | 2,850 | 0.3 | 21 | 69 | 0.2 | 0.1 |
| 0 | 24 | 33 | 0.7 | 79,255 | 3.0 | 43 | 2,487 | 0.5 | 22 | 65 | 0.2 | 0.1 |
| 1 | 24 | 33 | 1.7 | 81,255 | 4.0 | 36 | 3,048 | 0.1 | 22 | 71 | 0.3 | 0.0 |
| 2 | 24 | 33 | 2.7 | 83,255 | 4.0 | 42 | 2,655 | 0.3 | 22 | 71 | 0.2 | 0.1 |
| 3 | 24 | 33 | 3.6 | 85,255 | 5.0 | 35 | 3,166 | 0.1 | 23 | 75 | 0.2 | 0.0 |
| 5 | 24 | 33 | 5.5 | 89,255 | 7.0 | 33 | 3,335 | 0.0 | 22 | 75 | 0.3 | 0.0 |

Paired Δ vs **base** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ ngWeeks | Δ net | Δ over |
|---|---|---|---|
| 0 | +3.3 ± 8.9 | -363.5 ± 399.4 | +0.0 ± 0.1 |
| 1 | -3.8 ± 6.5 | +197.9 ± 309.1 | -0.0 ± 0.1 |
| 2 | +2.9 ± 11.3 | -195.4 ± 414.5 | +0.0 ± 0.2 |
| 3 | -3.8 ± 5.7 | **+315.9 ± 223.1** | -0.0 ± 0.1 |
| 5 | -6.0 ± 8.0 | **+484.6 ± 341.8** | -0.1 ± 0.1 |

---

### ngplus-cycles

NG+ over several cycles (cycles 2-5): new house = the best one offered (LAB.HOUSE_RANK), Seasoned Owner first then the next untaken boon, no new past; bot's natural lovers. keep: all kept houses (default) vs only the home house. cN* = cycle N: length in weeks, debt, starting staff, game over.

scenario **ngplus** · 12 seeds from 1 · 225s · 2026-11-20T21:12

| variant | n | c1won | c2weeks | c3weeks | c4weeks | c5weeks | c2debt | c3debt | c4debt | c5debt | c2staff | c3staff | c4staff | c5staff | c2over | c3over | c4over | c5over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | 12 | 32 | 45 | 40ⁿ10 | 48ⁿ9 | 53ⁿ7 | 88,049 | 142,083ⁿ10 | 216,846ⁿ9 | 282,340ⁿ7 | 3.8 | 6.1ⁿ10 | 8.1ⁿ9 | 10ⁿ7 | 0.2 | 0.1ⁿ10 | 0.2ⁿ9 | 0.3ⁿ7 |
| all | 12 | 32 | 45 | 40ⁿ10 | 41ⁿ9 | 52ⁿ8 | 88,049 | 142,083ⁿ10 | 215,939ⁿ9 | 288,321ⁿ8 | 3.8 | 6.1ⁿ10 | 8.1ⁿ9 | 10ⁿ8 | 0.2 | 0.1ⁿ10 | 0.1ⁿ9 | 0.3ⁿ8 |
| home | 12 | 32 | 45 | 31ⁿ10 | 40ⁿ10 | 43ⁿ9 | 88,049 | 109,525ⁿ10 | 145,760ⁿ10 | 166,954ⁿ9 | 3.8 | 4.5ⁿ10 | 5.3ⁿ10 | 6.1ⁿ9 | 0.2 | 0.0ⁿ10 | 0.1ⁿ10 | 0.1ⁿ9 |

Paired Δ vs **base** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ c2weeks | Δ c3weeks | Δ c4weeks | Δ c5weeks | Δ c4over |
|---|---|---|---|---|---|
| all | +0.0 ± 0.0 | +0.0 ± 0.0 | -7.0 ± 13.7 | +0.6 ± 1.1 | -0.1 ± 0.2 |
| home | +0.0 ± 0.0 | -9.0 ± 14.3 | -7.9 ± 28.0 | -21.0 ± 28.1 | -0.1 ± 0.4 |

---

### ngpp

NG++ Lantern Shrine soft reset: 2 NG++ cycles (Seliora bound going into cycle 2) vs standard NG+.

scenario **ngplus** · 24 seeds from 1 · 181s · 2026-11-20T21:15

| variant | n | c1won | c2weeks | c3weeks | c2debt | c3debt | c2staff | c3staff | c2over | c3over |
|---|---|---|---|---|---|---|---|---|---|---|
| ng++ (shrine) | 24 | 33 | 78 | 65ⁿ10 | 50,000 | 115,420ⁿ10 | 1.0 | 1.0ⁿ10 | 0.6 | 0.4ⁿ10 |
| ng+ (wayfarer) | 24 | 33 | 40 | 36ⁿ22 | 81,005 | 151,151ⁿ22 | 3.9 | 5.8ⁿ22 | 0.1 | 0.0ⁿ22 |
| ng++ (shrine), no guild | 24 | 30 | 104 | – | 50,000 | – | 1.0 | – | 1.0 | – |
| ng+ (wayfarer), no guild | 24 | 30 | 60 | 44ⁿ15 | 80,414 | 153,522ⁿ15 | 3.8 | 5.7ⁿ15 | 0.4 | 0.1ⁿ15 |

Paired Δ vs **ng++ (shrine)** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ c2weeks | Δ c3weeks |
|---|---|---|
| ng+ (wayfarer) | **-38.7 ± 12.7** | -25.3 ± 29.7 |
| ng++ (shrine), no guild | **+25.8 ± 12.6** | – |
| ng+ (wayfarer), no guild | -18.2 ± 19.3 | -27.0 ± 42.2 |

---

### houses-all

Benchmark: all 10 Cycle-1 houses (5 starters + 5 premium houses) played from week 1 (Kaede, salaryman, default policy).

scenario **campaign** · 12 seeds from 1 · 90s · 2026-11-20T21:03

| variant | n | weeksToWin | winRate | netEarly | netMid | netLate | worth20 | guild | partners | over |
|---|---|---|---|---|---|---|---|---|---|---|
| lantern | 12 | 29 | 1.0 | 629 | 829 | 2,208 | -11,996 | 151 | 2.5 | 0.0 |
| onsen | 12 | 33 | 1.0 | 819 | 866 | 1,879 | -19,887 | 175 | 2.9 | 0.0 |
| hollow | 12 | 37 | 0.9 | 436 | 1,519 | 4,298ⁿ11 | -29,600ⁿ11 | 245 | 2.7 | 0.1 |
| tankard | 12 | 34 | 1.0 | 455 | 785 | 1,202 | -11,324 | 146 | 2.7 | 0.0 |
| wayfarer | 12 | 34 | 1.0 | 744 | 1,018 | 2,366 | -19,889 | 205 | 2.4 | 0.0 |
| castle | 12 | 33 | 1.0 | 821 | 3,415 | 9,005 | -78,697 | 300 | 2.8 | 0.0 |
| pavilion | 12 | 39 | 0.9 | 1,043 | 1,594 | 4,447 | -46,592 | 175 | 2.4 | 0.1 |
| veil | 12 | 25 | 1.0 | 1,688 | 3,150 | 6,770 | -8,187 | 260 | 2.3 | 0.0 |
| sanctuary | 12 | 38 | 0.9 | 812 | 1,378 | 3,802 | -36,721 | 203 | 2.4 | 0.1 |
| atelier | 12 | 35 | 1.0 | 1,445 | 2,790 | 5,851 | -54,782 | 335 | 2.7 | 0.0 |

Paired Δ vs **lantern** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| onsen | +3.6 ± 4.5 | +36.6 ± 257.7 | -329.7 ± 415.1 | **-7,891 ± 5,087** | +0.0 ± 0.0 |
| hollow | +7.8 ± 12.3 | **+689.9 ± 348.7** | **+2,110 ± 392.7** | **-17,596 ± 5,511** | +0.1 ± 0.2 |
| tankard | +4.4 ± 5.1 | -44.8 ± 352.5 | **-1,006 ± 325.6** | +672.1 ± 4,959 | +0.0 ± 0.0 |
| wayfarer | +4.3 ± 5.2 | +189.0 ± 248.5 | +158.1 ± 620.9 | **-7,893 ± 7,438** | +0.0 ± 0.0 |
| castle | **+3.3 ± 3.3** | **+2,586 ± 339.3** | **+6,797 ± 979.4** | **-66,701 ± 7,323** | +0.0 ± 0.0 |
| pavilion | +10.0 ± 11.8 | **+764.6 ± 258.8** | **+2,239 ± 766.4** | **-34,596 ± 11,034** | +0.1 ± 0.2 |
| veil | -4.6 ± 5.7 | **+2,320 ± 706.8** | **+4,561 ± 1,232** | +3,809 ± 20,354 | +0.0 ± 0.0 |
| sanctuary | +8.6 ± 12.7 | **+548.7 ± 343.1** | **+1,594 ± 907.1** | **-24,725 ± 11,365** | +0.1 ± 0.2 |
| atelier | +5.5 ± 6.6 | **+1,961 ± 415.0** | **+3,642 ± 1,585** | **-42,786 ± 19,755** | +0.0 ± 0.0 |

---

### houses-plateau

What each Cycle-1 house earns once it's built up: cycle 1 played to the win, then 26 post-debt weeks (the bot now buys decor and drinks). Pair with houses-all (weeks to pay off): cheaper houses should pay off faster but earn less here.

scenario **plateau** · 12 seeds from 1 · 109s · 2026-11-20T21:04

| variant | n | total | net | income | upkeep | perLady | served | sat | staff | repGain |
|---|---|---|---|---|---|---|---|---|---|---|
| lantern | 12 | 4,416 | 4,370 | 6,764 | 470 | 262 | 28 | 81 | 12 | 6.7 |
| onsen | 10 (+2 unreached) | 4,041 | 4,041 | 5,979 | 463 | 241 | 27 | 82 | 9.4 | 12 |
| hollow | 12 | 5,843 | 5,843 | 9,267 | 610 | 361 | 33 | 75 | 16 | 8.9 |
| tankard | 12 | 3,511 | 3,511 | 4,871 | 360 | 178 | 33 | 72 | 10 | 10 |
| wayfarer | 12 | 4,185 | 4,185 | 6,265 | 494 | 344 | 33 | 80 | 10 | 10 |
| castle | 11 (+1 unreached) | 14,627 | 14,627 | 20,004 | 932 | 324 | 31 | 81 | 19 | 9.7 |
| pavilion | 11 (+1 unreached) | 10,191 | 9,933 | 15,024 | 612 | 367 | 27 | 87 | 12 | 4.1 |
| veil | 12 | 9,787 | 9,787 | 12,555 | 380 | 123 | 32 | 83 | 17 | 13 |
| sanctuary | 12 | 7,368 | 7,368 | 11,317 | 582 | 463 | 28 | 88 | 10 | 5.2 |
| atelier | 11 (+1 unreached) | 9,106 | 9,106 | 12,031 | 679 | 313 | 29 | 82 | 16 | 8.7 |
