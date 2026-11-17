# Balance Test Results (Round 4d)

- **Branch:** `feat/balance-tuning`
- **Commit:** `e4a2693`
- **Date:** 2026-11-17
- **Machine:** 12 cores (`--conc 10` for `partners`, `nerys`, `guild`, `sam-focus`, `walk-partners`, and first 8 `check` experiments; `--conc 4` for `ngpp`, `houses-all`, `houses-plateau`, `ngplus-cycles` after `ngplus-cycles` hit a Playwright `TimeoutError` at `--conc 10`)
- **Total lab run time:** 25m 34s (1534s = 1015s + 519s, excluding the aborted `ngplus-cycles` `--conc 10` attempt)

## 1. Build & Smoke

- **build:** `Built dist/hollowmere-nights.html from 46 scripts + 27 data files (3162 KB)` (0 errors)
- **smoke 30:** `index.html: reached week 31, 3 workers, 84116g. no errors` · `dist/hollowmere-nights.html: reached week 31, 3 workers, 91681g. no errors`
- **goddess-smoke:** `index.html: reached week 186, 1 workers, 3743g. no errors` · `dist/hollowmere-nights.html: reached week 186, 1 workers, 4003g. no errors`

## 2. Intent Checks (`tools/lab/out/checks.md`)

`2026-11-17T17:40 · full` — **PASS** 6 · **WARN** 4 · **FAIL** 4 (vs **PASS** 9 · **WARN** 3 · **FAIL** 2 in Round 4b `9b9700a`)

### PASS
- `cycle1-winnable` (`c1-baseline`): `winRate: base >= 0.95` = `1.00`; `weeksToWin: base in [20,45]` = `31.0`; `missed: base <= 0.2` = `0.00`
- `tidiness-neutral-70` (`tidiness`): `Δ total: mid · tidy 60 vs mid · base |Δ| <= 5%` = `-22.1 ± 46.0 (-3.65% of 605)`; `Δ total: late · tidy 60 vs late · base |Δ| <= 5%` = `12.3 ± 95.0 (0.64% of 1,906)`
- `tidiness-penalty-below-30` (`tidiness`): `Δ total: mid · tidy 25 vs mid · base < -10%` = `-266 ± 113`; `Δ total: late · tidy 25 vs late · base < -10%` = `-676 ± 125`; `Δtotal: [mid · tidy 25] - Δ[mid · tidy 45] < 0` = `-181`
- `sam-actions-balanced` (`sam-actions-campaign`): `scout` = `0.38 ± 3.21`; `rounds` = `-0.44 ± 2.55`; `date` = `0.94 ± 3.13`; `walk` = `0.31 ± 3.80`; `rest` = `0.00 ± 0.00`; `trainStat` = `-0.19 ± 2.53`; `trainSkill` = `0.00 ± 3.05`; `trainService` = `0.19 ± 3.59` (all `|x| <= 3`)
- `ngplus-lovers-neutral` (`ngplus-carry`): `ngWeeks: [3] - [1] |x| <= 4` = `0.33`; `ngWeeks: [5] - [1] |x| <= 4` = `-2.00`
- `premium-houses-earn-more-later` (`houses-plateau`): `net: [premiums] - [starters] > 0` = `6,837`

### FAIL
- `demons-top-courtesans` (`races-courtesan`, **now failing**): `perLady: mid · demon in top 1 of 12` = `#1 (82.7; #1 mid · demon 82.7)` (PASS); `perLady: late · demon in top 1 of 12` = `#2 (123; #1 late · beastkin/rabbit 125)` (FAIL)
- `demons-poor-off-service` (`race-jobs`): `Δtotal: [demon · promoter] - Δ[human · promoter] < 0` = `27.3` (FAIL); `Δtotal: [demon · bartender] - Δ[human · bartender] < 0` = `-290` (PASS); `Δtotal: [demon · host] - Δ[human · host] < 0` = `-153` (PASS); `Δtotal: [demon · security] - Δ[human · security] < 0` = `81.9` (FAIL)
- `ngplus-a-bit-harder` (`ngplus-carry`, **now failing**): `ngRatio: base in [1,1.5]` = `1.35` (PASS); `winRate: base >= 0.9` = `0.92` (PASS); `0` = `0.75` (**FAIL**); `1` = `1.00` (PASS); `2` = `0.92` (PASS); `3` = `1.00` (PASS); `5` = `1.00` (PASS)
- `cheap-houses-pay-off-faster` (`houses-all`): `weeksToWin: [starters] - [premiums] < 0` = `4.12` (FAIL)

### WARN / UNSURE
- `promoter-pays` (`promoter-value`): `Δ total: lantern · +promoter vs lantern · base > 40` = `46.4 ± 47.3` (**UNSURE**); `Δ total: hollow · +promoter vs hollow · base > 40` = `223 ± 63.8` (PASS); `Δ repGain: lantern · +promoter vs lantern · base > 0` = `-2.24 ± 3.15` (WARN); `Δ repGain: hollow · +promoter vs hollow · base > 0` = `-12.6 ± 4.04` (WARN)
- `security-stops-incidents` (`security-value`, **now warning** from PASS): `Δ trouble: mid · +security vs mid · base < 0` = `-0.45 ± 0.19` (PASS); `Δ trouble: late · +security vs late · base < 0` = `-0.81 ± 0.19` (PASS); `Δ total: mid · +security vs mid · base > 40` = `30.3 ± 159` (**WARN**); `Δ total: late · +security vs late · base > 40` = `151 ± 267` (PASS)
- `ngplus-slow-climb` (`ngplus-cycles`): `c5weeks: all >= @c2weeks` = `54.5` (PASS); `c5weeks: home >= @c2weeks` = `34.8` (WARN); `c5over: all <= 0.1` = `0.33` (WARN); `c5over: home <= 0.1` = `0.00` (PASS)
- `ngpp-harder-still` (`ngpp`): `c2weeks: [ng++ (shrine)] - [ng+ (wayfarer)] > 0` = `42.6` (PASS); `c2weeks: [ng++ (shrine)] - [ng+ (wayfarer)] < 15` = `42.6` (WARN)

## 3. Notes & Oddities

- **No script errors:** 0 `Errors:` blocks and 0 `pageErrors` across all 17 completed experiments (note: `ngplus-cycles` hit a Playwright `TimeoutError` at `--conc 10` and ran cleanly at `--conc 4`).
- **`houses-plateau` unreached:** `pavilion` had `11 (+1 unreached)`.
- **`ngpp` week-cap / game overs:** `ng++ (shrine), no guild` hit the 104-week cap on all 10 seeds (`c2weeks: 104`, `c2over: 1.0`); `ng++ (shrine)` averaged `c2weeks: 78` with `c2over: 0.6` and `c3over: 0.5`.
- **`partners`:** `adelheid` averaged `53` weeks (`0.8` winRate, `0.3` over) even after her Round 4d buff, while `marisol` (`33` wks, `1.0` winRate) and `lirael` (`35` wks, `1.0` winRate) are now close to `kaede` (`32` wks) and `elowen` (`31` wks).
- **Identical-to-base control variants (expected):** `partners` (`kaede`), `sam-actions-campaign` (`rest`), and `sam-focus` (`auto`) show `+0.0 ± 0.0` vs `base`.

## 4. Full Experiment Reports

---

### partners

Starting partner: a full first cycle at the Lantern with each cycle-1 partner.

scenario **campaign** · 12 seeds from 1 · 60s · 2026-11-17T17:15

| variant | n | weeksToWin | winRate | midAt | lateAt | netEarly | netMid | netLate | worth13 | worth20 | missed | rep | staff | sat | left | over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | 12 | 32 | 1.0 | 4.2 | 13 | 749 | 780 | 2,100 | -24,537 | -12,251 | 0.0 | 54 | 12 | 65 | 0.1 | 0.0 |
| kaede | 12 | 32 | 1.0 | 4.2 | 13 | 749 | 780 | 2,100 | -24,537 | -12,251 | 0.0 | 54 | 12 | 65 | 0.1 | 0.0 |
| nerys | 12 | 28 | 1.0 | 4.3 | 9.5 | 1,020 | 1,161 | 2,339 | -19,455 | -6,309 | 0.0 | 50 | 10 | 68 | 0.3 | 0.0 |
| elowen | 12 | 31 | 1.0 | 4.4 | 15 | 570 | 823 | 2,033 | -24,626 | -13,674 | 0.0 | 54 | 12 | 65 | 0.1 | 0.0 |
| adelheid | 12 | 53 | 0.8 | 9.3 | 24ⁿ9 | 167 | 680 | 2,381ⁿ9 | -27,065 | -21,347 | 0.8 | 46 | 10 | 60 | 0.0 | 0.3 |
| marisol | 12 | 33 | 1.0 | 4.8 | 19 | 349 | 691 | 1,874 | -21,512 | -14,681 | 0.0 | 53 | 11 | 61 | 0.2 | 0.0 |
| lirael | 12 | 35 | 1.0 | 5.0 | 18 | 487 | 719 | 1,896 | -25,790 | -17,848 | 0.1 | 55 | 11 | 64 | 0.2 | 0.0 |
| anael | 12 | 35 | 0.9 | 4.1 | 12ⁿ11 | 650 | 967 | 2,345ⁿ11 | -23,822 | -11,380 | 0.3 | 57 | 11 | 66 | 0.0 | 0.1 |

Paired Δ vs **base** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| kaede | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| nerys | -4.0 ± 5.9 | **+380.6 ± 330.4** | +239.0 ± 866.4 | +5,941 ± 9,004 | +0.0 ± 0.0 |
| elowen | -0.3 ± 5.1 | +42.1 ± 284.5 | -67.0 ± 411.3 | -1,423 ± 6,129 | +0.0 ± 0.0 |
| adelheid | **+21.1 ± 15.3** | -100.4 ± 288.4 | +10.6 ± 714.4 | **-9,097 ± 8,273** | +0.3 ± 0.3 |
| marisol | +1.7 ± 6.3 | -89.5 ± 261.1 | -226.4 ± 641.4 | -2,431 ± 7,708 | +0.0 ± 0.0 |
| lirael | +3.4 ± 5.1 | -61.2 ± 270.2 | -204.0 ± 605.9 | -5,597 ± 7,668 | +0.0 ± 0.0 |
| anael | +3.7 ± 12.2 | +186.6 ± 236.8 | +190.5 ± 706.7 | +870.6 ± 7,216 | +0.1 ± 0.2 |

Per named (base; per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| named | lady-weeks | rest% | earned | wage | net | served |
|---|---|---|---|---|---|---|
| nerys | 113 | 9 | 2,732 | 70 | 2,662 | 10.2 |
| hinata | 29 | 10 | 687 | 68 | 619 | 7.5 |
| kaede | 379 | 18 | 374 | 0 | 374 | 3.0 |
| marisol | 97 | 28 | 413 | 72 | 341 | 4.6 |
| anael | 91 | 12 | 404 | 69 | 334 | 3.2 |
| mira | 379 | 12 | 307 | 28 | 279 | 2.2 |
| rhoswen | 20 | 0 | 231 | 56 | 175 | 1.4 |
| lirael | 103 | 23 | 131 | 49 | 82 | 1.3 |
| elowen | 159 | 18 | 115 | 55 | 60 | 1.0 |
| adelheid | 98 | 3 | 49 | 62 | -14 | 0.0 |

---

### nerys

Nerys as the starting partner (Lantern, full cycle 1). Round 4 changed her to lewd 65, no starting Exhibitionist and cutFloor 0.3 (she keeps baseline + 30% of her earnings until Devoted). Before, she earned 3-5k/week from week 1 and cleared the debt in ~12-15 weeks. Intent: still the easy-mode partner (a few weeks faster than Kaede), not a debt-clearing machine.

scenario **campaign** · 12 seeds from 1 · 25s · 2026-11-17T17:16

| variant | n | weeksToWin | winRate | netEarly | netMid | netLate | worth13 | worth20 | mood | left |
|---|---|---|---|---|---|---|---|---|---|---|
| kaede (ref) | 12 | 32 | 1.0 | 749 | 780 | 2,100 | -24,537 | -12,251 | 84 | 0.1 |
| nerys (new) | 12 | 28 | 1.0 | 1,020 | 1,161 | 2,339 | -19,455 | -6,309 | 83 | 0.3 |
| nerys, no cut floor | 12 | 16 | 1.0 | 2,083 | 3,212 | 4,675 | 5,401 | 8,132 | 83 | 0.0 |
| nerys (old: lewd 82, Exhibitionist) | 12 | 14 | 1.0 | 1,972 | 3,454 | 5,595 | 10,420 | 12,021 | 85 | 0.0 |

Paired Δ vs **kaede (ref)** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| nerys (new) | -4.0 ± 5.9 | **+380.6 ± 330.4** | +239.0 ± 866.4 | +5,941 ± 9,004 | +0.0 ± 0.0 |
| nerys, no cut floor | **-15.9 ± 5.8** | **+2,432 ± 491.9** | **+2,575 ± 1,289** | **+20,383 ± 7,258** | +0.0 ± 0.0 |
| nerys (old: lewd 82, Exhibitionist) | **-17.4 ± 5.9** | **+2,674 ± 785.8** | **+3,495 ± 848.3** | **+24,272 ± 8,170** | +0.0 ± 0.0 |

Per named (kaede (ref); per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| named | lady-weeks | rest% | earned | wage | net | served |
|---|---|---|---|---|---|---|
| nerys | 113 | 9 | 2,732 | 70 | 2,662 | 10.2 |
| hinata | 29 | 10 | 687 | 68 | 619 | 7.5 |
| kaede | 379 | 18 | 374 | 0 | 374 | 3.0 |
| marisol | 97 | 28 | 413 | 72 | 341 | 4.6 |
| anael | 91 | 12 | 404 | 69 | 334 | 3.2 |
| mira | 379 | 12 | 307 | 28 | 279 | 2.2 |
| rhoswen | 20 | 0 | 231 | 56 | 175 | 1.4 |
| lirael | 103 | 23 | 131 | 49 | 82 | 1.3 |
| elowen | 159 | 18 | 115 | 55 | 60 | 1.0 |
| adelheid | 98 | 3 | 49 | 62 | -14 | 0.0 |

---

### c1-baseline



scenario **campaign** · 16 seeds from 1 · 11s · 2026-11-17T17:16

| variant | n | weeksToWin | winRate | midAt | lateAt | netEarly | netMid | netLate | worth13 | worth20 | missed | rep | staff | sat | left | over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | 16 | 31 | 1.0 | 4.2 | 13 | 688 | 780 | 2,123 | -24,940 | -12,549 | 0.0 | 55 | 12 | 66 | 0.2 | 0.0 |

Per job (base; per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| job | lady-weeks | rest% | earned | wage | net | served |
|---|---|---|---|---|---|---|
| courtesan | 1370 | 0 | 710 | 37 | 673 | 7.4 |
| dancer | 273 | 0 | 283 | 35 | 248 | 0.0 |
| madame | 241 | 0 | 187 | 42 | 145 | 1.6 |
| guild | 366 | 0 | 157 | 39 | 118 | 0.0 |
| bartender | 423 | 0 | 150 | 37 | 113 | 0.0 |
| attendant | 397 | 0 | 139 | 37 | 102 | 2.2 |
| security | 211 | 0 | 51 | 19 | 33 | 0.0 |
| maid | 547 | 0 | 12 | 32 | -20 | 0.0 |
| promoter | 465 | 0 | 5 | 40 | -35 | 0.0 |

Per race (generic ladies) (base; per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| race | lady-weeks | rest% | earned | wage | net | served |
|---|---|---|---|---|---|---|
| demon | 166 | 17 | 361 | 39 | 323 | 4.0 |
| dwarf | 106 | 3 | 205 | 39 | 166 | 4.5 |
| elf | 219 | 8 | 194 | 39 | 155 | 2.7 |
| beastkin/cat | 210 | 2 | 176 | 31 | 144 | 1.9 |
| beastkin/wolf | 179 | 2 | 129 | 32 | 98 | 1.3 |
| angel | 27 | 0 | 130 | 37 | 93 | 3.6 |
| human | 1503 | 4 | 107 | 35 | 71 | 1.9 |
| beastkin/fox | 192 | 1 | 97 | 29 | 68 | 1.1 |
| beastkin/rabbit | 143 | 1 | 58 | 28 | 29 | 0.1 |
| beastkin/dragon | 32 | 6 | 64 | 38 | 27 | 0.1 |

---

### tidiness

Tidiness held at a fixed level for every measured week (base = 70, meant to be neutral). Intent: 60-90 close to neutral, a noticeable penalty below 30. 'free' lets it drift as normal.

scenario **mid** · 16 seeds from 1 · 55s · 2026-11-17T17:17

| variant | n | total | net | tidy | served | sat | repGain | mood | left |
|---|---|---|---|---|---|---|---|---|---|
| mid · base | 16 | 605 | 544 | 72 | 15 | 58 | 8.0 | 83 | 0.0 |
| mid · tidy 90 | 16 | 734 | 658 | 85 | 17 | 63 | 16 | 86 | 0.0 |
| mid · tidy 60 | 16 | 582 | 518 | 65 | 15 | 58 | 8.0 | 83 | 0.0 |
| mid · tidy 45 | 16 | 520 | 442 | 56 | 14 | 52 | 3.0 | 80 | 0.0 |
| mid · tidy 25 | 16 | 339 | 270 | 42 | 10 | 44 | -9.0 | 69 | 0.0 |
| mid · free | 16 | 621 | 550 | 71 | 15 | 59 | 11 | 84 | 0.0 |
| late · base | 16 | 1,906 | 1,862 | 65 | 30 | 64 | 19 | 86 | 0.1 |
| late · tidy 90 | 16 | 1,979 | 1,948 | 77 | 32 | 66 | 21 | 90 | 0.0 |
| late · tidy 60 | 16 | 1,918 | 1,873 | 60 | 30 | 65 | 20 | 86 | 0.0 |
| late · tidy 45 | 16 | 1,494 | 1,441 | 53 | 28 | 58 | 12 | 82 | 0.3 |
| late · tidy 25 | 16 | 1,230 | 1,198 | 38 | 24 | 53 | -6.1 | 71 | 0.1 |
| late · free | 16 | 1,779 | 1,745 | 59 | 29 | 63 | 18 | 84 | 0.0 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ total | Δ net | Δ sat | Δ repGain |
|---|---|---|---|---|
| mid · tidy 90 | **+129.7 ± 73.1** | **+113.9 ± 70.1** | **+4.5 ± 2.6** | **+8.2 ± 4.5** |
| mid · tidy 60 | -22.1 ± 46.0 | -25.5 ± 42.1 | -0.0 ± 0.2 | -0.0 ± 0.5 |
| mid · tidy 45 | **-84.3 ± 64.4** | **-102.1 ± 45.4** | **-6.1 ± 1.9** | **-4.9 ± 3.5** |
| mid · tidy 25 | **-265.6 ± 112.9** | **-273.7 ± 107.9** | **-13.9 ± 3.1** | **-17.0 ± 4.7** |
| mid · free | +16.1 ± 73.9 | +5.7 ± 59.6 | +0.9 ± 1.7 | **+3.3 ± 2.5** |
| late · tidy 90 | +73.3 ± 154.0 | +86.3 ± 151.9 | +1.8 ± 1.8 | +1.9 ± 2.6 |
| late · tidy 60 | +12.3 ± 95.0 | +11.3 ± 97.3 | **+0.7 ± 0.7** | +0.8 ± 1.3 |
| late · tidy 45 | **-411.5 ± 327.6** | **-421.0 ± 307.4** | **-6.2 ± 2.5** | **-6.5 ± 3.7** |
| late · tidy 25 | **-676.1 ± 125.3** | **-663.3 ± 147.6** | **-11.3 ± 2.2** | **-24.9 ± 5.2** |
| late · free | -127.2 ± 226.1 | -116.3 ± 204.6 | -0.6 ± 1.6 | -1.1 ± 2.3 |

---

### promoter-value



scenario **early** · 16 seeds from 1 · 11s · 2026-11-17T17:17

| variant | n | total | net | promo | served | turned | repGain |
|---|---|---|---|---|---|---|---|
| lantern · base | 16 | 334 | 334 | 0.5 | 8.1 | 1.9 | -3.8 |
| lantern · +promoter | 16 | 380 | 380 | 5.1 | 9.5 | 3.6 | -6.1 |
| hollow · base | 16 | 235 | 235 | 0.1 | 3.6 | 0.5 | 16 |
| hollow · +promoter | 16 | 458 | 458 | 7.4 | 7.9 | 1.8 | 3.8 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ total | Δ net | Δ repGain |
|---|---|---|---|
| lantern · +promoter | +46.4 ± 47.3 | +46.4 ± 47.3 | -2.2 ± 3.2 |
| hollow · +promoter | **+222.9 ± 63.8** | **+222.9 ± 63.8** | **-12.6 ± 4.0** |

---

### security-value



scenario **mid** · 16 seeds from 1 · 18s · 2026-11-17T17:17

| variant | n | total | net | pushy | unhandled | incidents | incHandled | damage | trouble | lost | sat | repGain |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| mid · base | 16 | 480 | 403 | 0.6 | 0.2 | 0.7 | 0.0 | 11 | 0.8 | 0.2 | 63 | 6.9 |
| mid · +security | 16 | 510 | 453 | 0.7 | 0.2 | 0.2 | 0.4 | 3.8 | 0.4 | 0.2 | 62 | 9.8 |
| late · base | 16 | 1,646 | 1,622 | 2.6 | 0.0 | 0.8 | 0.1 | 19 | 0.9 | 0.0 | 65 | 14 |
| late · +security | 16 | 1,796 | 1,757 | 2.7 | 0.0 | 0.1 | 0.9 | 1.8 | 0.1 | 0.0 | 65 | 19 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ total | Δ trouble | Δ damage | Δ sat |
|---|---|---|---|---|
| mid · +security | +30.3 ± 159.1 | **-0.5 ± 0.2** | **-7.0 ± 4.9** | -1.6 ± 2.6 |
| late · +security | +150.9 ± 267.1 | **-0.8 ± 0.2** | **-17.3 ± 5.7** | +0.6 ± 2.8 |

---

### races-courtesan

Race as courtesans: every generic lady (and every hire in the measured weeks) is this race and works as a courtesan. perLady is what one of them earns over her wage; the intent is that demons lead here.

scenario **mid** · 12 seeds from 1 · 84s · 2026-11-17T17:19

| variant | n | total | net | perLady | served | sat | repGain | left |
|---|---|---|---|---|---|---|---|---|
| mid · base | 12 | 296 | 219 | 63 | 13 | 44 | -3.1 | 0.0 |
| mid · human | 12 | 255 | 173 | 53 | 12 | 45 | -3.4 | 0.0 |
| mid · elf | 12 | 354 | 262 | 53 | 13 | 47 | -3.3 | 0.1 |
| mid · beastkin/fox | 12 | 320 | 255 | 65 | 14 | 45 | -1.9 | 0.0 |
| mid · beastkin/cat | 12 | 385 | 277 | 53 | 14 | 45 | -1.9 | 0.0 |
| mid · beastkin/wolf | 12 | 334 | 217 | 77 | 15 | 44 | -2.2 | 0.0 |
| mid · beastkin/rabbit | 12 | 392 | 295 | 61 | 14 | 47 | -1.8 | 0.0 |
| mid · beastkin/dragon | 12 | 281 | 197 | 61 | 14 | 44 | -3.7 | 0.0 |
| mid · demon | 12 | 427 | 324 | 83 | 14 | 49 | -2.3 | 0.0 |
| mid · dwarf | 12 | 336 | 255 | 40 | 13 | 46 | 0.1 | 0.1 |
| mid · spirit | 12 | 575 | 477 | 55 | 19 | 56 | 13 | 0.0 |
| mid · angel | 12 | 364 | 256 | 44 | 13 | 50 | 1.5 | 0.0 |
| mid · android | 12 | 358 | 272 | 38 | 18 | 55 | 13 | 0.0 |
| late · base | 12 | 1,247 | 1,217 | 106 | 30 | 54 | 8.8 | 0.0 |
| late · human | 12 | 1,231 | 1,211 | 99 | 31 | 54 | 5.5 | 0.1 |
| late · elf | 12 | 1,314 | 1,283 | 116 | 30 | 54 | 4.9 | 0.2 |
| late · beastkin/fox | 12 | 1,341 | 1,305 | 115 | 31 | 55 | 9.1 | 0.0 |
| late · beastkin/cat | 12 | 1,334 | 1,301 | 115 | 32 | 54 | 7.2 | 0.0 |
| late · beastkin/wolf | 12 | 1,370 | 1,336 | 122 | 31 | 55 | 10.0 | 0.1 |
| late · beastkin/rabbit | 12 | 1,472 | 1,443 | 125 | 32 | 55 | 11 | 0.1 |
| late · beastkin/dragon | 12 | 1,285 | 1,251 | 106 | 32 | 51 | 3.5 | 0.0 |
| late · demon | 12 | 1,332 | 1,304 | 123 | 26 | 56 | 2.3 | 0.1 |
| late · dwarf | 12 | 1,325 | 1,299 | 110 | 32 | 52 | 4.2 | 0.0 |
| late · spirit | 12 | 2,153 | 1,922 | 45 | 36 | 66 | 21 | 0.0 |
| late · angel | 12 | 1,307 | 1,280 | 103 | 32 | 55 | 8.3 | 0.1 |
| late · android | 12 | 1,329 | 1,145 | 23 | 35 | 68 | 19 | 0.1 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ total | Δ perLady | Δ sat |
|---|---|---|---|
| mid · human | -41.0 ± 92.6 | -9.8 ± 28.5 | +0.2 ± 3.6 |
| mid · elf | +57.7 ± 142.5 | -10.6 ± 21.0 | +2.8 ± 3.9 |
| mid · beastkin/fox | +24.4 ± 137.5 | +2.2 ± 33.2 | +0.6 ± 4.0 |
| mid · beastkin/cat | +89.1 ± 121.9 | -10.0 ± 23.9 | +1.0 ± 4.0 |
| mid · beastkin/wolf | +37.7 ± 165.3 | +13.8 ± 29.4 | -0.2 ± 3.0 |
| mid · beastkin/rabbit | +96.1 ± 118.7 | -1.9 ± 20.8 | +2.5 ± 2.6 |
| mid · beastkin/dragon | -15.1 ± 67.1 | -2.4 ± 32.8 | -0.3 ± 1.4 |
| mid · demon | +131.2 ± 153.9 | +19.4 ± 26.3 | **+4.2 ± 4.0** |
| mid · dwarf | +40.1 ± 130.1 | -23.1 ± 26.6 | +2.0 ± 4.0 |
| mid · spirit | **+279.0 ± 224.5** | -8.5 ± 23.1 | **+11.2 ± 3.4** |
| mid · angel | +67.7 ± 119.6 | -19.0 ± 31.3 | **+5.1 ± 3.9** |
| mid · android | +61.8 ± 136.6 | -25.3 ± 28.5 | **+10.1 ± 3.3** |
| late · human | -15.7 ± 198.3 | -7.0 ± 11.5 | +0.0 ± 2.7 |
| late · elf | +67.4 ± 316.6 | +9.9 ± 18.2 | +0.0 ± 4.6 |
| late · beastkin/fox | +93.7 ± 180.2 | +9.3 ± 11.8 | +1.2 ± 3.0 |
| late · beastkin/cat | +86.8 ± 210.0 | **+9.4 ± 9.1** | -0.1 ± 2.4 |
| late · beastkin/wolf | +122.7 ± 163.4 | **+16.2 ± 12.2** | +1.0 ± 2.6 |
| late · beastkin/rabbit | **+224.8 ± 222.7** | **+19.0 ± 10.3** | +1.7 ± 2.2 |
| late · beastkin/dragon | +37.8 ± 307.6 | +0.2 ± 13.8 | -2.6 ± 3.5 |
| late · demon | +84.5 ± 210.4 | +16.9 ± 21.7 | +2.5 ± 3.4 |
| late · dwarf | +78.4 ± 244.8 | +4.0 ± 12.1 | -1.6 ± 3.5 |
| late · spirit | **+906.3 ± 325.7** | **-60.8 ± 26.7** | **+12.6 ± 3.0** |
| late · angel | +60.3 ± 266.0 | -3.2 ± 12.2 | +1.5 ± 3.0 |
| late · android | +82.2 ± 168.2 | **-82.8 ± 28.9** | **+14.0 ± 3.0** |

---

### race-jobs

Race x job: every generic lady (and every hire during the measured weeks) is this race; two of them are forced into the job. Δ is against the same race's default assignment, so it shows where each race belongs. Compare a job across races with the means. Needed amenities (race or job) are granted free.

scenario **mid** · 12 seeds from 1 · 239s · 2026-11-17T17:23

| variant | n | total | net | perLady | repGain | sat | served | left |
|---|---|---|---|---|---|---|---|---|
| human · base | 12 | 550 | 493 | 48 | 9.3 | 59 | 15 | 0.0 |
| human · courtesan | 12 | 311 | 200 | 65 | -3.0 | 44 | 13 | 0.0 |
| human · promoter | 12 | 555 | 507 | 18 | 7.4 | 60 | 13 | 0.0 |
| human · bartender | 12 | 832 | 690 | 33 | 17 | 67 | 14 | 0.0 |
| human · security | 12 | 458 | 383 | 7.9 | 5.2 | 63 | 9.4 | 0.0 |
| human · dancer | 12 | 569 | 523 | 35 | 4.4 | 65 | 10 | 0.0 |
| human · host | 12 | 724 | 653 | 21 | 19 | 70 | 12 | 0.0 |
| human · attendant | 12 | 459 | 398 | 33 | 4.0 | 55 | 13 | 0.0 |
| human · maid | 12 | 518 | 442 | 16 | 11 | 63 | 12 | 0.0 |
| elf · base | 12 | 606 | 546 | 57 | 11 | 61 | 14 | 0.0 |
| elf · courtesan | 12 | 440 | 331 | 69 | 0.8 | 49 | 15 | 0.0 |
| elf · promoter | 12 | 498 | 438 | 3.6 | 4.9 | 63 | 12 | 0.0 |
| elf · bartender | 12 | 738 | 593 | 32 | 18 | 68 | 13 | 0.1 |
| elf · security | 12 | 640 | 560 | -6.0 | 13 | 67 | 10 | 0.0 |
| elf · dancer | 12 | 571 | 535 | 31 | 7.2 | 65 | 11 | 0.0 |
| elf · host | 12 | 597 | 531 | 11 | 20 | 68 | 10 | 0.0 |
| elf · attendant | 12 | 573 | 466 | 34 | 12 | 60 | 13 | 0.0 |
| elf · maid | 12 | 544 | 454 | 18 | 15 | 66 | 12 | 0.0 |
| beastkin/fox · base | 12 | 652 | 545 | 66 | 11 | 57 | 16 | 0.0 |
| beastkin/fox · courtesan | 12 | 479 | 369 | 80 | 3.9 | 48 | 16 | 0.0 |
| beastkin/fox · promoter | 12 | 589 | 509 | 20 | 5.9 | 63 | 12 | 0.0 |
| beastkin/fox · bartender | 12 | 639 | 500 | 49 | 6.4 | 65 | 12 | 0.0 |
| beastkin/fox · security | 12 | 548 | 472 | 15 | 5.7 | 64 | 9.8 | 0.0 |
| beastkin/fox · dancer | 12 | 519 | 472 | 43 | 2.6 | 62 | 10 | 0.0 |
| beastkin/fox · host | 12 | 686 | 608 | 32 | 17 | 70 | 10 | 0.0 |
| beastkin/fox · attendant | 12 | 599 | 509 | 50 | 14 | 59 | 14 | 0.0 |
| beastkin/fox · maid | 12 | 569 | 491 | 25 | 9.2 | 66 | 12 | 0.0 |
| beastkin/wolf · base | 12 | 671 | 594 | 76 | 13 | 58 | 18 | 0.0 |
| beastkin/wolf · courtesan | 12 | 420 | 287 | 88 | -1.7 | 46 | 16 | 0.0 |
| beastkin/wolf · promoter | 12 | 555 | 477 | 13 | 7.7 | 64 | 12 | 0.0 |
| beastkin/wolf · bartender | 12 | 787 | 600 | 48 | 16 | 67 | 14 | 0.0 |
| beastkin/wolf · security | 12 | 524 | 476 | 11 | 6.8 | 64 | 9.7 | 0.0 |
| beastkin/wolf · dancer | 12 | 677 | 594 | 43 | 4.5 | 67 | 11 | 0.0 |
| beastkin/wolf · host | 12 | 706 | 635 | 20 | 14 | 68 | 11 | 0.0 |
| beastkin/wolf · attendant | 12 | 544 | 442 | 44 | 11 | 56 | 14 | 0.0 |
| beastkin/wolf · maid | 12 | 699 | 593 | 27 | 14 | 65 | 13 | 0.0 |
| demon · base | 12 | 576 | 494 | 93 | 6.8 | 60 | 14 | 0.0 |
| demon · courtesan | 12 | 497 | 366 | 86 | 0.7 | 50 | 15 | 0.0 |
| demon · promoter | 12 | 608 | 484 | 45 | 1.7 | 63 | 12 | 0.0 |
| demon · bartender | 12 | 568 | 419 | 45 | 2.2 | 67 | 11 | 0.0 |
| demon · security | 12 | 566 | 456 | 33 | 1.0 | 64 | 11 | 0.1 |
| demon · dancer | 12 | 491 | 399 | 41 | -2.3 | 64 | 9.1 | 0.0 |
| demon · host | 12 | 597 | 498 | 27 | 4.4 | 70 | 9.4 | 0.1 |
| demon · attendant | 12 | 495 | 420 | 43 | 3.6 | 56 | 11 | 0.0 |
| demon · maid | 12 | 605 | 493 | 33 | 8.0 | 67 | 11 | 0.0 |
| dwarf · base | 12 | 657 | 551 | 57 | 13 | 55 | 18 | 0.0 |
| dwarf · courtesan | 12 | 473 | 378 | 58 | 2.4 | 48 | 16 | 0.1 |
| dwarf · promoter | 12 | 701 | 599 | 23 | 8.4 | 63 | 14 | 0.0 |
| dwarf · bartender | 12 | 665 | 518 | 32 | 11 | 66 | 11 | 0.1 |
| dwarf · security | 12 | 606 | 522 | 0.6 | 9.3 | 65 | 9.9 | 0.0 |
| dwarf · dancer | 12 | 634 | 573 | 41 | 3.2 | 64 | 12 | 0.0 |
| dwarf · host | 12 | 562 | 487 | 17 | 18 | 67 | 8.8 | 0.1 |
| dwarf · attendant | 12 | 578 | 479 | 36 | 11 | 57 | 14 | 0.0 |
| dwarf · maid | 12 | 624 | 537 | 19 | 14 | 64 | 13 | 0.0 |
| spirit · base | 12 | 756 | 669 | 37 | 21 | 62 | 20 | 0.1 |
| spirit · courtesan | 12 | 669 | 583 | 46 | 14 | 57 | 20 | 0.0 |
| spirit · promoter | 12 | 747 | 641 | 27 | 13 | 62 | 20 | 0.0 |
| spirit · bartender | 12 | 1,027 | 891 | 34 | 23 | 68 | 20 | 0.0 |
| spirit · security | 12 | 785 | 654 | 18 | 17 | 66 | 16 | 0.0 |
| spirit · dancer | 12 | 784 | 731 | 35 | 16 | 64 | 17 | 0.1 |
| spirit · host | 12 | 1,113 | 1,015 | 31 | 28 | 71 | 20 | 0.1 |
| spirit · attendant | 12 | 800 | 682 | 40 | 17 | 62 | 18 | 0.0 |
| spirit · maid | 12 | 849 | 776 | 28 | 27 | 67 | 18 | 0.1 |
| angel · base | 12 | 626 | 546 | 54 | 13 | 60 | 16 | 0.0 |
| angel · courtesan | 12 | 466 | 361 | 61 | 4.1 | 51 | 16 | 0.0 |
| angel · promoter | 12 | 561 | 525 | 9.2 | 7.0 | 61 | 14 | 0.0 |
| angel · bartender | 12 | 707 | 547 | 41 | 17 | 68 | 14 | 0.0 |
| angel · security | 12 | 562 | 504 | 7.3 | 12 | 65 | 11 | 0.0 |
| angel · dancer | 12 | 525 | 494 | 30 | 2.4 | 64 | 10.0 | 0.0 |
| angel · host | 12 | 606 | 558 | 17 | 19 | 68 | 11 | 0.0 |
| angel · attendant | 12 | 507 | 432 | 38 | 13 | 58 | 13 | 0.0 |
| angel · maid | 12 | 530 | 469 | 11 | 15 | 65 | 13 | 0.0 |
| android · base | 12 | 667 | 532 | 34 | 24 | 65 | 21 | 0.0 |
| android · courtesan | 12 | 494 | 376 | 55 | 16 | 58 | 19 | 0.0 |
| android · promoter | 12 | 635 | 516 | -7.6 | 18 | 65 | 18 | 0.0 |
| android · bartender | 12 | 535 | 376 | 1.1 | 16 | 68 | 16 | 0.0 |
| android · security | 12 | 617 | 489 | 2.5 | 18 | 67 | 15 | 0.0 |
| android · dancer | 12 | 477 | 416 | -4.7 | 11 | 66 | 15 | 0.0 |
| android · host | 12 | 737 | 620 | 7.0 | 32 | 73 | 17 | 0.1 |
| android · attendant | 12 | 464 | 360 | -1.1 | 19 | 62 | 17 | 0.0 |
| android · maid | 12 | 521 | 428 | 6.8 | 21 | 67 | 17 | 0.0 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ total | Δ net | Δ sat | Δ left |
|---|---|---|---|---|
| human · courtesan | **-239.4 ± 113.7** | **-293.0 ± 123.7** | **-14.2 ± 3.3** | +0.0 ± 0.0 |
| human · promoter | +5.0 ± 133.9 | +13.7 ± 138.5 | +1.8 ± 5.5 | +0.0 ± 0.0 |
| human · bartender | **+282.0 ± 234.4** | **+196.8 ± 194.8** | **+8.4 ± 5.2** | +0.0 ± 0.0 |
| human · security | -91.6 ± 150.3 | -110.3 ± 129.7 | +4.1 ± 4.8 | +0.0 ± 0.0 |
| human · dancer | +18.8 ± 102.2 | +30.3 ± 95.1 | **+6.5 ± 4.8** | +0.0 ± 0.0 |
| human · host | **+173.6 ± 144.9** | **+160.3 ± 123.2** | **+11.3 ± 3.8** | +0.0 ± 0.0 |
| human · attendant | -90.7 ± 196.2 | -95.3 ± 191.4 | -3.8 ± 4.3 | +0.0 ± 0.0 |
| human · maid | -32.1 ± 120.9 | -51.3 ± 129.9 | +4.7 ± 5.9 | +0.0 ± 0.0 |
| elf · courtesan | **-165.8 ± 120.4** | **-215.7 ± 135.1** | **-11.6 ± 4.5** | +0.0 ± 0.0 |
| elf · promoter | -108.0 ± 164.6 | -108.7 ± 154.5 | +1.9 ± 5.4 | +0.0 ± 0.0 |
| elf · bartender | +131.8 ± 178.8 | +46.8 ± 168.8 | **+6.9 ± 4.9** | +0.1 ± 0.2 |
| elf · security | +33.7 ± 212.2 | +13.9 ± 200.2 | **+5.8 ± 5.8** | +0.0 ± 0.0 |
| elf · dancer | -35.3 ± 125.1 | -11.3 ± 121.1 | +4.3 ± 5.1 | +0.0 ± 0.0 |
| elf · host | -8.9 ± 221.7 | -15.1 ± 207.0 | **+6.7 ± 4.4** | +0.0 ± 0.0 |
| elf · attendant | -33.0 ± 189.6 | -80.4 ± 165.5 | -0.7 ± 3.2 | +0.0 ± 0.0 |
| elf · maid | -62.0 ± 123.7 | -92.5 ± 141.4 | **+5.2 ± 4.9** | +0.0 ± 0.0 |
| beastkin/fox · courtesan | **-173.8 ± 47.9** | **-176.6 ± 100.5** | **-8.7 ± 4.2** | +0.0 ± 0.0 |
| beastkin/fox · promoter | -63.0 ± 152.7 | -36.3 ± 155.9 | **+6.2 ± 5.2** | +0.0 ± 0.0 |
| beastkin/fox · bartender | -13.9 ± 120.3 | -45.7 ± 105.0 | **+8.6 ± 4.5** | +0.0 ± 0.0 |
| beastkin/fox · security | -104.5 ± 218.8 | -73.5 ± 237.8 | **+7.8 ± 3.5** | +0.0 ± 0.0 |
| beastkin/fox · dancer | **-133.7 ± 114.7** | -73.6 ± 121.2 | **+5.2 ± 4.4** | +0.0 ± 0.0 |
| beastkin/fox · host | +33.8 ± 226.9 | +63.1 ± 230.2 | **+13.0 ± 4.8** | +0.0 ± 0.0 |
| beastkin/fox · attendant | -53.9 ± 145.8 | -36.3 ± 131.6 | +2.3 ± 2.8 | +0.0 ± 0.0 |
| beastkin/fox · maid | -83.6 ± 155.5 | -54.6 ± 163.4 | **+9.7 ± 4.4** | +0.0 ± 0.0 |
| beastkin/wolf · courtesan | **-250.2 ± 121.2** | **-306.4 ± 118.1** | **-11.6 ± 2.1** | +0.0 ± 0.0 |
| beastkin/wolf · promoter | **-115.1 ± 84.8** | **-116.6 ± 80.7** | **+6.0 ± 2.4** | +0.0 ± 0.0 |
| beastkin/wolf · bartender | +116.3 ± 120.6 | +6.3 ± 124.4 | **+9.4 ± 4.0** | +0.0 ± 0.0 |
| beastkin/wolf · security | -147.0 ± 178.9 | -117.3 ± 160.2 | **+6.5 ± 3.7** | +0.0 ± 0.0 |
| beastkin/wolf · dancer | +6.7 ± 113.2 | +0.7 ± 119.6 | **+9.8 ± 2.5** | +0.0 ± 0.0 |
| beastkin/wolf · host | +35.9 ± 197.5 | +41.5 ± 196.8 | **+10.0 ± 3.9** | +0.0 ± 0.0 |
| beastkin/wolf · attendant | -126.4 ± 134.0 | **-151.4 ± 112.3** | -1.3 ± 3.0 | +0.0 ± 0.0 |
| beastkin/wolf · maid | +28.0 ± 173.2 | -0.5 ± 155.1 | **+7.8 ± 4.0** | +0.0 ± 0.0 |
| demon · courtesan | -79.2 ± 112.8 | **-128.6 ± 112.6** | **-9.5 ± 4.7** | +0.0 ± 0.0 |
| demon · promoter | +32.3 ± 167.8 | -10.1 ± 151.7 | +3.8 ± 5.1 | +0.0 ± 0.0 |
| demon · bartender | -7.6 ± 147.2 | -75.5 ± 129.6 | **+6.9 ± 4.4** | +0.0 ± 0.0 |
| demon · security | -9.7 ± 125.3 | -38.0 ± 100.0 | **+4.3 ± 3.8** | +0.1 ± 0.2 |
| demon · dancer | -84.8 ± 121.7 | -94.8 ± 125.3 | **+4.1 ± 3.7** | +0.0 ± 0.0 |
| demon · host | +21.0 ± 142.6 | +3.6 ± 128.2 | **+10.2 ± 3.3** | +0.1 ± 0.2 |
| demon · attendant | -80.9 ± 126.6 | -73.8 ± 127.0 | **-3.4 ± 2.9** | +0.0 ± 0.0 |
| demon · maid | +29.6 ± 170.2 | -1.4 ± 148.5 | **+6.9 ± 5.4** | +0.0 ± 0.0 |
| dwarf · courtesan | **-183.5 ± 113.0** | **-173.0 ± 116.3** | **-6.9 ± 3.7** | +0.1 ± 0.2 |
| dwarf · promoter | +44.7 ± 159.4 | +47.9 ± 134.4 | **+7.6 ± 5.9** | +0.0 ± 0.0 |
| dwarf · bartender | +8.5 ± 151.3 | -32.5 ± 170.4 | **+11.4 ± 5.5** | +0.1 ± 0.2 |
| dwarf · security | -50.9 ± 152.0 | -28.9 ± 154.9 | **+9.7 ± 4.1** | +0.0 ± 0.0 |
| dwarf · dancer | -23.1 ± 107.6 | +21.7 ± 104.6 | **+9.1 ± 3.2** | +0.0 ± 0.0 |
| dwarf · host | -94.6 ± 195.5 | -64.2 ± 225.3 | **+12.3 ± 5.6** | +0.1 ± 0.2 |
| dwarf · attendant | -78.3 ± 168.8 | -71.8 ± 182.0 | +1.8 ± 3.5 | +0.0 ± 0.0 |
| dwarf · maid | -33.0 ± 183.0 | -13.7 ± 177.4 | **+9.3 ± 5.0** | +0.0 ± 0.0 |
| spirit · courtesan | -86.7 ± 136.2 | -85.7 ± 125.6 | **-5.0 ± 3.6** | -0.1 ± 0.2 |
| spirit · promoter | -9.4 ± 163.2 | -28.4 ± 128.5 | -0.3 ± 2.9 | -0.1 ± 0.2 |
| spirit · bartender | +271.3 ± 339.5 | +221.4 ± 320.4 | **+5.4 ± 4.3** | -0.1 ± 0.2 |
| spirit · security | +29.2 ± 180.4 | -15.3 ± 160.5 | +3.9 ± 4.3 | -0.1 ± 0.2 |
| spirit · dancer | +28.1 ± 163.4 | +62.3 ± 144.9 | +1.9 ± 3.4 | +0.0 ± 0.2 |
| spirit · host | **+356.6 ± 272.0** | **+345.4 ± 243.1** | **+8.4 ± 3.1** | +0.0 ± 0.2 |
| spirit · attendant | +44.0 ± 163.2 | +12.5 ± 146.4 | -0.8 ± 4.3 | -0.1 ± 0.2 |
| spirit · maid | +93.3 ± 150.9 | +107.2 ± 138.4 | **+4.4 ± 3.1** | +0.0 ± 0.2 |
| angel · courtesan | -159.4 ± 193.8 | **-185.2 ± 178.3** | **-8.9 ± 5.7** | +0.0 ± 0.0 |
| angel · promoter | -65.2 ± 165.3 | -21.1 ± 163.7 | +1.9 ± 4.7 | +0.0 ± 0.0 |
| angel · bartender | +81.7 ± 148.4 | +0.7 ± 159.1 | **+8.4 ± 5.0** | +0.0 ± 0.0 |
| angel · security | -64.1 ± 225.4 | -41.8 ± 247.8 | +5.5 ± 6.6 | +0.0 ± 0.0 |
| angel · dancer | -100.5 ± 175.6 | -52.4 ± 154.4 | +4.3 ± 5.1 | +0.0 ± 0.0 |
| angel · host | -19.8 ± 238.1 | +12.2 ± 235.5 | **+8.7 ± 5.5** | +0.0 ± 0.0 |
| angel · attendant | -118.6 ± 166.0 | -114.3 ± 154.1 | -1.5 ± 4.5 | +0.0 ± 0.0 |
| angel · maid | -95.6 ± 140.6 | -76.7 ± 158.6 | **+5.5 ± 3.4** | +0.0 ± 0.0 |
| android · courtesan | **-172.4 ± 140.4** | -155.5 ± 161.3 | **-6.8 ± 4.3** | +0.0 ± 0.0 |
| android · promoter | -31.4 ± 223.9 | -15.3 ± 231.8 | +0.9 ± 3.9 | +0.0 ± 0.0 |
| android · bartender | -131.7 ± 207.7 | -155.5 ± 172.0 | +3.1 ± 4.1 | +0.0 ± 0.0 |
| android · security | -50.0 ± 254.2 | -42.7 ± 246.1 | +2.7 ± 4.3 | +0.0 ± 0.0 |
| android · dancer | -189.3 ± 220.0 | -116.1 ± 217.0 | +1.8 ± 3.4 | +0.0 ± 0.0 |
| android · host | +70.3 ± 242.4 | +88.3 ± 243.3 | **+8.8 ± 4.0** | +0.1 ± 0.2 |
| android · attendant | **-202.4 ± 168.5** | -171.9 ± 181.3 | -2.9 ± 3.3 | +0.0 ± 0.0 |
| android · maid | **-145.6 ± 138.6** | -103.3 ± 114.6 | +2.9 ± 3.2 | +0.0 ± 0.0 |

Per race · job (generic ladies) (all variants pooled; per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| racejob | lady-weeks | rest% | earned | wage | net | served |
|---|---|---|---|---|---|---|
| demon · courtesan | 822 | 0 | 369 | 33 | 337 | 7.9 |
| android · courtesan | 1915 | 0 | 323 | 33 | 290 | 5.4 |
| beastkin/wolf · courtesan | 952 | 0 | 227 | 28 | 199 | 6.8 |
| beastkin/fox · courtesan | 994 | 0 | 223 | 28 | 196 | 6.6 |
| elf · courtesan | 790 | 0 | 211 | 32 | 178 | 6.1 |
| angel · courtesan | 936 | 0 | 210 | 32 | 177 | 6.2 |
| spirit · courtesan | 2288 | 0 | 197 | 33 | 164 | 4.6 |
| human · courtesan | 950 | 0 | 195 | 32 | 163 | 5.9 |
| dwarf · courtesan | 918 | 0 | 193 | 32 | 161 | 6.3 |
| angel/lantern · courtesan | 23 | 0 | 185 | 34 | 151 | 5.7 |
| android · guild | 948 | 0 | 176 | 33 | 142 | 0.0 |
| angel/lantern · attendant | 8 | 0 | 162 | 36 | 126 | 3.5 |
| angel/lantern · dancer | 4 | 0 | 161 | 37 | 124 | 0.0 |
| dwarf · guild | 378 | 0 | 154 | 33 | 120 | 0.0 |
| beastkin/fox · guild | 374 | 0 | 144 | 28 | 116 | 0.0 |
| beastkin/wolf · guild | 371 | 0 | 142 | 28 | 113 | 0.0 |
| beastkin/wolf · bath | 4 | 0 | 141 | 36 | 105 | 0.0 |
| human · guild | 406 | 0 | 130 | 32 | 97 | 0.0 |
| elf · guild | 349 | 0 | 129 | 33 | 97 | 0.0 |
| angel · guild | 347 | 0 | 129 | 33 | 96 | 0.0 |
| spirit · guild | 978 | 0 | 126 | 33 | 94 | 0.0 |
| demon · guild | 198 | 0 | 105 | 33 | 72 | 0.0 |
| demon · dancer | 241 | 0 | 102 | 33 | 68 | 0.0 |
| demon · attendant | 322 | 0 | 100 | 32 | 68 | 2.5 |
| beastkin/fox · attendant | 546 | 0 | 90 | 28 | 62 | 2.6 |
| elf · attendant | 589 | 0 | 93 | 33 | 60 | 2.8 |
| beastkin/wolf · attendant | 655 | 0 | 85 | 28 | 57 | 2.6 |
| angel · attendant | 631 | 0 | 89 | 33 | 56 | 2.8 |
| dwarf · attendant | 651 | 0 | 86 | 33 | 53 | 2.7 |
| android · bartender | 732 | 0 | 85 | 33 | 53 | 0.0 |
| spirit · bartender | 779 | 0 | 84 | 32 | 52 | 0.0 |
| beastkin/wolf · dancer | 324 | 0 | 79 | 29 | 51 | 0.0 |
| android · dancer | 375 | 0 | 84 | 34 | 50 | 0.0 |
| angel/lantern · bartender | 3 | 0 | 85 | 35 | 50 | 0.0 |
| demon · bartender | 432 | 0 | 83 | 33 | 50 | 0.0 |
| beastkin/fox · dancer | 350 | 0 | 78 | 29 | 50 | 0.0 |
| beastkin/wolf · bartender | 631 | 0 | 75 | 28 | 47 | 0.0 |
| beastkin/fox · bartender | 680 | 0 | 74 | 28 | 46 | 0.0 |
| dwarf · bartender | 658 | 0 | 75 | 33 | 43 | 0.0 |
| human · dancer | 341 | 0 | 74 | 33 | 41 | 0.0 |
| angel · dancer | 332 | 0 | 73 | 33 | 40 | 0.0 |
| human · bartender | 557 | 0 | 72 | 32 | 40 | 0.0 |
| human · attendant | 592 | 0 | 72 | 33 | 40 | 2.6 |
| dwarf · dancer | 408 | 0 | 73 | 33 | 40 | 0.0 |
| elf · dancer | 349 | 0 | 73 | 33 | 40 | 0.0 |
| spirit · dancer | 384 | 0 | 73 | 33 | 39 | 0.0 |
| elf · bartender | 543 | 0 | 71 | 32 | 39 | 0.0 |
| angel · bartender | 501 | 0 | 65 | 33 | 32 | 0.0 |
| android · attendant | 1628 | 0 | 63 | 33 | 30 | 1.3 |
| spirit · attendant | 1971 | 0 | 59 | 33 | 27 | 1.2 |
| demon · host | 141 | 0 | 40 | 32 | 8 | 0.0 |
| android · host | 288 | 0 | 35 | 32 | 3 | 0.0 |
| beastkin/fox · host | 220 | 0 | 22 | 27 | -6 | 0.0 |
| beastkin/wolf · host | 228 | 0 | 22 | 28 | -6 | 0.0 |
| human · host | 204 | 0 | 23 | 32 | -9 | 0.0 |
| spirit · rest | 734 | 100 | 22 | 32 | -10 | 0.0 |
| demon · security | 206 | 0 | 20 | 32 | -11 | 0.0 |
| spirit · host | 199 | 0 | 19 | 32 | -13 | 0.0 |
| dwarf · host | 256 | 0 | 19 | 32 | -13 | 0.0 |
| angel · host | 198 | 0 | 18 | 32 | -14 | 0.0 |
| elf · host | 203 | 0 | 18 | 32 | -14 | 0.0 |
| demon · promoter | 478 | 0 | 18 | 33 | -14 | 0.0 |
| elf · rest | 284 | 100 | 18 | 32 | -14 | 0.0 |
| angel · rest | 277 | 100 | 16 | 32 | -16 | 0.0 |
| demon · maid | 645 | 0 | 15 | 32 | -17 | 0.0 |
| human · rest | 323 | 100 | 13 | 32 | -19 | 0.0 |
| beastkin/wolf · rest | 206 | 100 | 7 | 28 | -20 | 0.0 |
| beastkin/fox · security | 399 | 0 | 6 | 28 | -22 | 0.0 |
| beastkin/fox · maid | 1066 | 0 | 6 | 27 | -22 | 0.0 |
| beastkin/fox · rest | 205 | 100 | 5 | 27 | -22 | 0.0 |
| beastkin/wolf · promoter | 911 | 0 | 6 | 28 | -22 | 0.0 |
| beastkin/wolf · security | 447 | 0 | 5 | 28 | -23 | 0.0 |
| beastkin/fox · promoter | 844 | 0 | 5 | 28 | -23 | 0.0 |
| beastkin/wolf · maid | 1059 | 0 | 4 | 28 | -24 | 0.0 |
| human · security | 381 | 0 | 5 | 32 | -26 | 0.0 |
| dwarf · rest | 77 | 100 | 5 | 31 | -26 | 0.0 |
| elf · security | 382 | 0 | 5 | 32 | -27 | 0.0 |
| human · maid | 1025 | 0 | 4 | 32 | -28 | 0.0 |
| elf · promoter | 891 | 0 | 5 | 33 | -28 | 0.0 |
| demon · rest | 1693 | 100 | 4 | 32 | -28 | 0.0 |
| dwarf · security | 373 | 0 | 4 | 32 | -28 | 0.0 |
| human · promoter | 815 | 0 | 4 | 32 | -28 | 0.0 |
| spirit · security | 617 | 0 | 3 | 32 | -29 | 0.0 |
| elf · maid | 1181 | 0 | 4 | 33 | -29 | 0.0 |
| spirit · maid | 2135 | 0 | 3 | 33 | -30 | 0.0 |
| android · maid | 1712 | 0 | 3 | 33 | -30 | 0.0 |
| dwarf · promoter | 829 | 0 | 2 | 33 | -30 | 0.0 |
| dwarf · maid | 1094 | 0 | 2 | 33 | -30 | 0.0 |
| android · promoter | 1354 | 0 | 3 | 33 | -31 | 0.0 |
| spirit · promoter | 1898 | 0 | 2 | 33 | -31 | 0.0 |
| android · security | 525 | 0 | 2 | 33 | -31 | 0.0 |
| angel · security | 378 | 0 | 0 | 32 | -32 | 0.0 |
| angel · promoter | 857 | 0 | 0 | 33 | -32 | 0.0 |
| angel · maid | 1150 | 0 | 0 | 33 | -33 | 0.0 |
| android · rest | 91 | 100 | 0 | 34 | -34 | 0.0 |
| angel/lantern · rest | 9 | 100 | 0 | 36 | -36 | 0.0 |

---

### sam-actions-campaign

Sam's spare rest-day action over a whole first cycle (Lantern): week the debt is cleared and income per phase. Group nights and demonstrations are flavor and left out.

scenario **campaign** · 16 seeds from 1 · 95s · 2026-11-17T17:24

| variant | n | weeksToWin | netEarly | netMid | netLate | worth20 | rep | trust | sat | left |
|---|---|---|---|---|---|---|---|---|---|---|
| base | 16 | 31 | 688 | 780 | 2,123 | -12,549 | 55 | 62 | 66 | 0.2 |
| scout | 16 | 31 | 660 | 793 | 2,177 | -14,428 | 55 | 63 | 65 | 0.1 |
| rounds | 16 | 31 | 678 | 880 | 2,184 | -12,917 | 57 | 67 | 66 | 0.1 |
| date | 16 | 32 | 603 | 758 | 2,067 | -14,497 | 54 | 68 | 64 | 0.1 |
| walk | 16 | 31 | 605 | 821 | 2,164 | -13,606 | 57 | 61 | 65 | 0.1 |
| rest | 16 | 31 | 688 | 780 | 2,123 | -12,549 | 55 | 62 | 66 | 0.2 |
| trainStat | 16 | 31 | 666 | 789 | 2,104 | -14,442 | 56 | 61 | 66 | 0.1 |
| trainSkill | 16 | 31 | 666 | 794 | 2,353 | -13,353 | 56 | 61 | 68 | 0.1 |
| trainService | 16 | 31 | 675 | 827 | 2,169 | -13,612 | 56 | 61 | 68 | 0.1 |

Paired Δ vs **base** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| scout | +0.4 ± 3.2 | +12.8 ± 230.0 | +53.4 ± 367.8 | -1,879 ± 4,813 | +0.0 ± 0.0 |
| rounds | -0.4 ± 2.5 | +99.6 ± 231.0 | +61.0 ± 276.3 | -367.7 ± 2,570 | +0.0 ± 0.0 |
| date | +0.9 ± 3.1 | -21.8 ± 206.1 | -56.2 ± 359.8 | -1,948 ± 3,249 | +0.0 ± 0.0 |
| walk | +0.3 ± 3.8 | +41.3 ± 252.0 | +40.9 ± 447.3 | -1,057 ± 5,476 | +0.0 ± 0.0 |
| rest | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| trainStat | -0.2 ± 2.5 | +9.3 ± 153.1 | -19.2 ± 460.9 | -1,893 ± 3,208 | +0.0 ± 0.0 |
| trainSkill | +0.0 ± 3.1 | +13.5 ± 194.7 | +229.9 ± 334.1 | -804.0 ± 3,670 | +0.0 ± 0.0 |
| trainService | +0.2 ± 3.6 | +46.8 ± 195.1 | +45.6 ± 375.8 | -1,063 ± 3,411 | +0.0 ± 0.0 |

---

### ngplus-carry

NG+ with different numbers of carried lovers (Devoted, partner first then by trust) and old friends (generics at max trust). Wayfarer as new house, Seasoned Owner. winWeek = length of cycle 2.

scenario **ngplus** · 12 seeds from 1 · 113s · 2026-11-17T17:26

| variant | n | c1won | c2lovers | ngDebt | ngStaff | ngWeeks | net | missed | staff | sat | left | over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | 12 | 32 | 1.3 | 81,623 | 3.8 | 40 | 2,807 | 0.3 | 22 | 67 | 0.2 | 0.1 |
| 0 | 12 | 32 | 0.8 | 80,199 | 3.0 | 55 | 2,030 | 0.8 | 20 | 62 | 0.3 | 0.3 |
| 1 | 12 | 32 | 1.7 | 81,906 | 4.0 | 33 | 3,062 | 0.0 | 23 | 68 | 0.3 | 0.0 |
| 2 | 12 | 32 | 2.8 | 83,613 | 4.0 | 42 | 2,638 | 0.3 | 22 | 66 | 0.3 | 0.1 |
| 3 | 12 | 32 | 3.8 | 85,320 | 5.0 | 34 | 3,218 | 0.1 | 22 | 73 | 0.3 | 0.0 |
| 5 | 12 | 32 | 5.9 | 88,734 | 7.0 | 31 | 3,679 | 0.0 | 24 | 71 | 0.3 | 0.0 |

Paired Δ vs **base** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ ngWeeks | Δ net | Δ over |
|---|---|---|---|
| 0 | +14.9 ± 22.8 | **-777.4 ± 709.1** | +0.2 ± 0.3 |
| 1 | -6.4 ± 12.6 | +255.1 ± 505.3 | -0.1 ± 0.2 |
| 2 | +1.8 ± 16.5 | -169.1 ± 492.0 | +0.0 ± 0.2 |
| 3 | -6.1 ± 13.4 | +410.7 ± 612.0 | -0.1 ± 0.2 |
| 5 | -8.4 ± 12.5 | **+871.5 ± 538.0** | -0.1 ± 0.2 |

---

### ngplus-cycles

NG+ over several cycles (cycles 2-5): new house = the best one offered (LAB.HOUSE_RANK), Seasoned Owner first then the next untaken boon, no new past; bot's natural lovers. keep: all kept houses (default) vs only the home house. cN* = cycle N: length in weeks, debt, starting staff, game over.

scenario **ngplus** · 12 seeds from 1 · 200s · 2026-11-17T17:40

| variant | n | c1won | c2weeks | c3weeks | c4weeks | c5weeks | c2debt | c3debt | c4debt | c5debt | c2staff | c3staff | c4staff | c5staff | c2over | c3over | c4over | c5over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | 12 | 32 | 40 | 59ⁿ11 | 40ⁿ7 | 53ⁿ6 | 89,170 | 153,625ⁿ11 | 218,413ⁿ7 | 273,455ⁿ6 | 3.8 | 6.3ⁿ11 | 8.6ⁿ7 | 10ⁿ6 | 0.1 | 0.4ⁿ11 | 0.1ⁿ7 | 0.3ⁿ6 |
| all | 12 | 32 | 40 | 59ⁿ11 | 40ⁿ7 | 55ⁿ6 | 89,170 | 153,625ⁿ11 | 218,413ⁿ7 | 260,981ⁿ6 | 3.8 | 6.3ⁿ11 | 8.6ⁿ7 | 10ⁿ6 | 0.1 | 0.4ⁿ11 | 0.1ⁿ7 | 0.3ⁿ6 |
| home | 12 | 32 | 40 | 33ⁿ11 | 34ⁿ11 | 35ⁿ11 | 89,170 | 119,723ⁿ11 | 146,488ⁿ11 | 176,700ⁿ11 | 3.8 | 4.6ⁿ11 | 5.5ⁿ11 | 6.3ⁿ11 | 0.1 | 0.0ⁿ11 | 0.0ⁿ11 | 0.0ⁿ11 |

Paired Δ vs **base** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ c2weeks | Δ c3weeks | Δ c4weeks | Δ c5weeks | Δ c4over |
|---|---|---|---|---|---|
| all | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 | +1.2 ± 2.7 | +0.0 ± 0.0 |
| home | +0.0 ± 0.0 | **-25.4 ± 21.2** | -5.3 ± 20.9 | -17.5 ± 31.2 | -0.1 ± 0.3 |

---

### ngpp

NG++ Lantern Shrine soft reset: 2 NG++ cycles (Seliora bound going into cycle 2) vs standard NG+.

scenario **ngplus** · 10 seeds from 1 · 78s · 2026-11-17T17:33

| variant | n | c1won | c2weeks | c3weeks | c2debt | c3debt | c2staff | c3staff | c2over | c3over |
|---|---|---|---|---|---|---|---|---|---|---|
| ng++ (shrine) | 10 | 32 | 78 | 72ⁿ4 | 50,000 | 114,498ⁿ4 | 1.0 | 1.0ⁿ4 | 0.6 | 0.5ⁿ4 |
| ng+ (wayfarer) | 10 | 32 | 35 | 41 | 81,097 | 147,116 | 3.8 | 5.5 | 0.0 | 0.1 |
| ng++ (shrine), no guild | 10 | 35 | 104 | – | 50,000 | – | 1.0 | – | 1.0 | – |
| ng+ (wayfarer), no guild | 10 | 35 | 49 | 33ⁿ8 | 80,598 | 147,418ⁿ8 | 4.0 | 5.9ⁿ8 | 0.2 | 0.0ⁿ8 |

Paired Δ vs **ng++ (shrine)** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ c2weeks | Δ c3weeks |
|---|---|---|
| ng+ (wayfarer) | **-42.6 ± 21.5** | **-38.5 ± 35.1** |
| ng++ (shrine), no guild | **+26.1 ± 21.1** | – |
| ng+ (wayfarer), no guild | -28.7 ± 36.7 | -39.5 ± 61.7 |

---

### houses-all

Benchmark: all 10 Cycle-1 houses (5 starters + 5 premium houses) played from week 1 (Kaede, salaryman, default policy).

scenario **campaign** · 12 seeds from 1 · 75s · 2026-11-17T17:34

| variant | n | weeksToWin | winRate | netEarly | netMid | netLate | worth20 | guild | partners | over |
|---|---|---|---|---|---|---|---|---|---|---|
| lantern | 12 | 32 | 1.0 | 749 | 780 | 2,100 | -12,251 | 190 | 2.4 | 0.0 |
| onsen | 12 | 33 | 1.0 | 705 | 833 | 1,898 | -21,643 | 188 | 2.7 | 0.0 |
| hollow | 12 | 32 | 1.0 | 515 | 1,916 | 4,848 | -28,532 | 226 | 2.6 | 0.0 |
| tankard | 12 | 29 | 1.0 | 454 | 698 | 1,764 | -8,773 | 171 | 2.8 | 0.0 |
| wayfarer | 12 | 36 | 1.0 | 807 | 933 | 2,070 | -23,380 | 187 | 2.3 | 0.0 |
| castle | 12 | 36 | 0.9 | 787 | 3,588 | 11,998ⁿ11 | -73,648 | 244 | 2.5 | 0.1 |
| pavilion | 12 | 28 | 1.0 | 1,138 | 2,276 | 5,039 | -23,603 | 180 | 2.4 | 0.0 |
| veil | 12 | 22 | 1.0 | 1,574 | 2,946 | 5,871 | 4,161 | 238 | 2.2 | 0.0 |
| sanctuary | 12 | 28 | 1.0 | 901 | 1,594 | 3,415 | -15,114 | 148 | 2.3 | 0.0 |
| atelier | 12 | 26 | 1.0 | 1,185 | 2,583 | 6,749 | -16,530 | 296 | 2.2 | 0.0 |

Paired Δ vs **lantern** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| onsen | +1.5 ± 3.3 | +52.9 ± 234.3 | -202.5 ± 262.6 | **-9,393 ± 3,232** | +0.0 ± 0.0 |
| hollow | -0.1 ± 5.6 | **+1,135 ± 434.2** | **+2,747 ± 1,320** | **-16,282 ± 7,241** | +0.0 ± 0.0 |
| tankard | -3.0 ± 3.5 | -82.0 ± 201.5 | -336.1 ± 486.3 | +3,477 ± 4,345 | +0.0 ± 0.0 |
| wayfarer | +4.6 ± 5.8 | +152.3 ± 187.2 | -30.8 ± 525.3 | **-11,130 ± 5,227** | +0.0 ± 0.0 |
| castle | +4.6 ± 10.9 | **+2,808 ± 668.2** | **+9,843 ± 1,634** | **-61,397 ± 9,795** | +0.1 ± 0.2 |
| pavilion | -3.3 ± 5.4 | **+1,496 ± 616.4** | **+2,938 ± 748.5** | -11,353 ± 12,668 | +0.0 ± 0.0 |
| veil | **-9.3 ± 3.7** | **+2,165 ± 452.3** | **+3,771 ± 909.2** | **+16,412 ± 12,210** | +0.0 ± 0.0 |
| sanctuary | -3.7 ± 5.2 | **+813.7 ± 504.2** | **+1,314 ± 728.2** | -2,863 ± 11,130 | +0.0 ± 0.0 |
| atelier | **-5.8 ± 5.2** | **+1,802 ± 502.0** | **+4,649 ± 1,336** | -4,279 ± 20,425 | +0.0 ± 0.0 |

---

### houses-plateau

What each Cycle-1 house earns once it's built up: cycle 1 played to the win, then 26 post-debt weeks (the bot now buys decor and drinks). Pair with houses-all (weeks to pay off): cheaper houses should pay off faster but earn less here.

scenario **plateau** · 12 seeds from 1 · 153s · 2026-11-17T17:37

| variant | n | total | net | income | upkeep | perLady | served | sat | staff | repGain |
|---|---|---|---|---|---|---|---|---|---|---|
| lantern | 12 | 4,493 | 4,493 | 7,160 | 508 | 332 | 33 | 76 | 11 | 9.2 |
| onsen | 12 | 4,169 | 4,169 | 5,926 | 458 | 336 | 30 | 80 | 9.6 | 12 |
| hollow | 12 | 9,296 | 9,296 | 13,706 | 638 | 266 | 36 | 81 | 16 | 12 |
| tankard | 12 | 3,423 | 3,423 | 4,976 | 365 | 188 | 33 | 75 | 9.3 | 14 |
| wayfarer | 12 | 5,160 | 5,160 | 7,751 | 508 | 268 | 34 | 82 | 11 | 7.8 |
| castle | 12 | 17,435 | 17,435 | 22,827 | 918 | 342 | 36 | 81 | 22 | 11 |
| pavilion | 11 (+1 unreached) | 12,055 | 11,813 | 17,696 | 636 | 781 | 33 | 86 | 13 | 13 |
| veil | 12 | 8,558 | 8,558 | 10,635 | 368 | 113 | 28 | 81 | 16 | 14 |
| sanctuary | 12 | 8,359 | 8,359 | 11,730 | 569 | 507 | 34 | 80 | 10 | 8.8 |
| atelier | 12 | 14,560 | 14,560 | 17,946 | 640 | 322 | 38 | 83 | 15 | 7.9 |

---

### guild

Adventurers' Guild: a full first cycle at the Lantern without the guild, with the default guild player, with Sam always going, with fighters picked by power, and with up to 2 contracts and 3 ladies away. First pass: contract gold/work/risk in data/guild/base.json are untuned.

scenario **campaign** · 10 seeds from 1 · 31s · 2026-11-17T17:30

| variant | n | weeksToWin | winRate | midAt | lateAt | netEarly | netMid | netLate | worth13 | worth20 | missed | rep | staff | sat | left | over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| no guild | 10 | 29 | 1.0 | 3.9 | 12 | 721 | 957 | 2,333 | -23,859 | -11,420 | 0.0 | 57 | 11 | 68 | 0.1 | 0.0 |
| guild (default) | 10 | 31 | 1.0 | 4.2 | 13 | 765 | 839 | 2,207 | -24,150 | -10,204 | 0.0 | 53 | 12 | 65 | 0.1 | 0.0 |
| Sam always goes | 10 | 29 | 1.0 | 4.2 | 12 | 760 | 863 | 2,298 | -23,305 | -9,558 | 0.0 | 56 | 11 | 66 | 0.0 | 0.0 |
| fighters | 10 | 31 | 1.0 | 4.2 | 13 | 765 | 839 | 2,197 | -24,150 | -10,125 | 0.0 | 53 | 12 | 65 | 0.1 | 0.0 |
| busy guild | 10 | 30 | 1.0 | 4.2 | 13 | 765 | 839 | 2,184 | -24,150 | -10,204 | 0.0 | 53 | 12 | 65 | 0.1 | 0.0 |

Paired Δ vs **no guild** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| guild (default) | +1.8 ± 2.8 | -117.7 ± 155.5 | -125.7 ± 338.8 | +1,216 ± 4,431 | +0.0 ± 0.0 |
| Sam always goes | +0.1 ± 3.1 | -93.9 ± 178.6 | -34.5 ± 551.3 | +1,862 ± 7,946 | +0.0 ± 0.0 |
| fighters | +1.8 ± 2.7 | -117.7 ± 155.5 | -136.1 ± 356.4 | +1,295 ± 4,328 | +0.0 ± 0.0 |
| busy guild | +1.5 ± 2.8 | -117.7 ± 155.5 | -149.0 ± 345.3 | +1,216 ± 4,431 | +0.0 ± 0.0 |

Per job (no guild; per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| job | lady-weeks | rest% | earned | wage | net | served |
|---|---|---|---|---|---|---|
| courtesan | 885 | 0 | 744 | 40 | 705 | 7.2 |
| dancer | 140 | 0 | 368 | 37 | 331 | 0.0 |
| bartender | 243 | 0 | 186 | 32 | 154 | 0.0 |
| madame | 184 | 0 | 179 | 37 | 142 | 1.5 |
| attendant | 175 | 0 | 140 | 39 | 100 | 2.1 |
| security | 123 | 0 | 40 | 46 | -7 | 0.0 |
| maid | 345 | 0 | 6 | 34 | -27 | 0.0 |
| promoter | 304 | 0 | 6 | 34 | -28 | 0.0 |

---

### sam-focus

Sam's weekly focus over a whole first cycle (Lantern): week the debt is cleared and income per phase. Spare actions stay on rest.

scenario **campaign** · 16 seeds from 1 · 73s · 2026-11-17T17:31

| variant | n | weeksToWin | netEarly | netMid | netLate | worth20 | rep | trust | sat | left | unhandled |
|---|---|---|---|---|---|---|---|---|---|---|---|
| base | 16 | 31 | 688 | 780 | 2,123 | -12,549 | 55 | 62 | 66 | 0.2 | 0.1 |
| auto | 16 | 31 | 688 | 780 | 2,123 | -12,549 | 55 | 62 | 66 | 0.2 | 0.1 |
| office | 16 | 33 | 688 | 908 | 2,462ⁿ15 | -12,272 | 56 | 56 | 66 | 0.0 | 0.1 |
| floor | 16 | 34 | 487 | 771 | 1,673 | -16,522 | 54 | 67 | 63 | 0.3 | 0.1 |
| watch | 16 | 36 | 589 | 896 | 2,207ⁿ15 | -13,888 | 54 | 67 | 65 | 0.0 | 0.0 |
| classes | 16 | 31 | 553 | 911 | 2,270 | -16,417 | 61 | 63 | 69 | 0.3 | 0.1 |
| rest | 16 | 39 | 540 | 767 | 1,986ⁿ15 | -18,332 | 52 | 62 | 64 | 0.1 | 0.1 |

Paired Δ vs **base** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| auto | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| office | +2.3 ± 8.5 | **+127.9 ± 74.8** | +296.6 ± 588.2 | +276.9 ± 3,430 | +0.1 ± 0.1 |
| floor | +2.7 ± 3.4 | -9.4 ± 262.9 | -450.0 ± 463.3 | -3,973 ± 4,086 | +0.0 ± 0.0 |
| watch | +4.8 ± 9.4 | +115.8 ± 252.9 | +47.1 ± 426.3 | -1,339 ± 5,466 | +0.1 ± 0.1 |
| classes | +0.0 ± 3.6 | +131.3 ± 166.5 | +146.8 ± 552.1 | -3,868 ± 4,510 | +0.0 ± 0.0 |
| rest | +7.7 ± 9.4 | -13.1 ± 255.4 | -133.9 ± 348.9 | **-5,783 ± 4,251** | +0.1 ± 0.1 |

---

### walk-partners

Walk pacing: a first cycle at the Lantern with walks as Sam's spare action. 'partners' = partners found on walks this cycle (30% / 10% / 5% a walk, cap 3). Expect the first in a few walks and all 3 in most runs by the end of the cycle.

scenario **campaign** · 12 seeds from 1 · 16s · 2026-11-17T17:31

| variant | n | weeksToWin | partners | netMid | worth20 |
|---|---|---|---|---|---|
| walks | 12 | 32 | 2.8 | 826 | -13,249 |
| walks, stop at 30 | 12 | 28 | 2.8 | 826 | -13,249 |

Paired Δ vs **walks** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| walks, stop at 30 | **-4.3 ± 2.7** | +0.0 ± 0.0 | **-206.7 ± 156.8** | +0.0 ± 0.0 | +0.0 ± 0.0 |
