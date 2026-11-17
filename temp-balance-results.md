# Balance Test Results (Round 4b)

- **Branch:** `feat/balance-tuning`
- **Commit:** `9b9700a`
- **Date:** 2026-11-17
- **Machine:** 12 cores (`--conc 10`)
- **Total lab run time:** 45m 02s (2702s)

## 1. Build & Smoke

- **build:** `Built dist/hollowmere-nights.html from 46 scripts + 27 data files (3158 KB)` (0 errors)
- **smoke 30:** `index.html: reached week 31, 3 workers, 91675g. no errors` · `dist/hollowmere-nights.html: reached week 31, 3 workers, 90562g. no errors`
- **goddess-smoke:** `index.html: reached week 186, 1 workers, 3369g. no errors` · `dist/hollowmere-nights.html: reached week 186, 1 workers, 3400g. no errors`

## 2. Intent Checks (`tools/lab/out/checks.md`)

`2026-11-17T16:04 · full` — **PASS** 9 · **WARN** 3 · **FAIL** 2 (vs **PASS** 7 · **FAIL** 5 · **WARN** 2 on `main` `1b2f37b`)

### PASS
- `cycle1-winnable` (`c1-baseline`): `winRate: base >= 0.95` = `1.00`; `weeksToWin: base in [20,45]` = `26.8`; `missed: base <= 0.2` = `0.00`
- `tidiness-neutral-70` (`tidiness`): `Δ total: mid · tidy 60 vs mid · base |Δ| <= 5%` = `-30.3 ± 31.1 (-4.28% of 708)`; `Δ total: late · tidy 60 vs late · base |Δ| <= 5%` = `24.3 ± 70.2 (1.07% of 2,265)`
- `tidiness-penalty-below-30` (`tidiness`): `Δ total: mid · tidy 25 vs mid · base < -10%` = `-310 ± 156`; `Δ total: late · tidy 25 vs late · base < -10%` = `-639 ± 270`; `Δtotal: [mid · tidy 25] - Δ[mid · tidy 45] < 0` = `-191`
- `security-stops-incidents` (`security-value`): `Δ trouble: mid · +security vs mid · base < 0` = `-0.41 ± 0.18`; `Δ trouble: late · +security vs late · base < 0` = `-0.83 ± 0.17`; `Δ total: mid · +security vs mid · base > 40` = `246 ± 166`; `Δ total: late · +security vs late · base > 40` = `393 ± 173`
- `demons-top-courtesans` (`races-courtesan`, **now passing**): `perLady: mid · demon in top 1 of 12` = `#1 (128; #1 mid · demon 128)`; `perLady: late · demon in top 1 of 12` = `#1 (95.0; #1 late · demon 95.0)`
- `sam-actions-balanced` (`sam-actions-campaign`, **now passing**): `scout` = `0.50 ± 3.61`; `rounds` = `1.88 ± 2.60`; `date` = `2.63 ± 2.87`; `walk` = `1.25 ± 2.15`; `rest` = `0.00 ± 0.00`; `trainStat` = `-1.38 ± 2.52`; `trainSkill` = `0.25 ± 2.55`; `trainService` = `1.75 ± 2.34` (all `|x| <= 3`)
- `ngplus-a-bit-harder` (`ngplus-carry`, **now passing**): `ngRatio: base in [1,1.5]` = `1.18`; `winRate: base >= 0.9` = `1.00`; `0` = `0.92`; `1` = `1.00`; `2` = `1.00`; `3` = `1.00`; `5` = `1.00`
- `ngplus-lovers-neutral` (`ngplus-carry`): `ngWeeks: [3] - [1] |x| <= 4` = `-0.83`; `ngWeeks: [5] - [1] |x| <= 4` = `-0.58`
- `premium-houses-earn-more-later` (`houses-plateau`): `net: [premiums] - [starters] > 0` = `7,006`

### FAIL
- `demons-poor-off-service` (`race-jobs`, **now failing**): `Δtotal: [demon · promoter] - Δ[human · promoter] < 0` = `280` (FAIL); `Δtotal: [demon · bartender] - Δ[human · bartender] < 0` = `116` (FAIL); `Δtotal: [demon · host] - Δ[human · host] < 0` = `116` (FAIL); `Δtotal: [demon · security] - Δ[human · security] < 0` = `-74.1` (PASS)
- `cheap-houses-pay-off-faster` (`houses-all`): `weeksToWin: [starters] - [premiums] < 0` = `1.73` (FAIL)

### WARN / UNSURE
- `promoter-pays` (`promoter-value`, **now warning** from FAIL): `Δ total: lantern · +promoter vs lantern · base > 40` = `56.4 ± 44.4` (**UNSURE**); `Δ total: hollow · +promoter vs hollow · base > 40` = `249 ± 74.0` (PASS); `Δ repGain: lantern · +promoter vs lantern · base > 0` = `-5.77 ± 3.63` (WARN); `Δ repGain: hollow · +promoter vs hollow · base > 0` = `-15.2 ± 6.33` (WARN)
- `ngplus-slow-climb` (`ngplus-cycles`): `c5weeks: all >= @c2weeks` = `29.8` (PASS); `c5weeks: home >= @c2weeks` = `27.9` (WARN); `c5over: all <= 0.1` = `0.00` (PASS); `c5over: home <= 0.1` = `0.00` (PASS)
- `ngpp-harder-still` (`ngpp`): `c2weeks: [ng++ (shrine)] - [ng+ (wayfarer)] > 0` = `46.3` (PASS); `c2weeks: [ng++ (shrine)] - [ng+ (wayfarer)] < 15` = `46.3` (WARN)

## 3. Notes & Oddities

- **No errors:** 0 `Errors:` blocks and 0 `pageErrors` across all 17 experiments.
- **`ngpp` unreached / week-cap runs:** `ng++ (shrine), no guild` and `ng+ (wayfarer), no guild` each had `9 (+1 unreached)` runs (one seed never reached NG+); `ng++ (shrine), no guild` hit the 104-week cap on all 9 reached runs (`c2weeks: 104`, `c2over: 1.0`), and `ng++ (shrine)` averaged `c2weeks: 83` with `c2over: 0.7`.
- **`demons-poor-off-service` flip:** In `race-jobs`, moving a human into promoter/bartender/host dropped house total vs `human · base`, whereas moving a demon into those roles raised total vs `demon · base` (because `demon · base` starts lower at `578` total vs `human · base` `732`).
- **`promoter-pays` repGain:** Promoting in Lantern/Hollow now adds total gold (`+56.4` / `+249`), but reduces `repGain` (`-5.77` / `-15.2`).
- **Identical-to-base control variants (expected):** `sam-actions-campaign` (`rest`), `sam-focus` (`auto`), and `partners` (`kaede`) show `+0.0 ± 0.0` vs `base` because they match the base configuration.

## 4. Full Experiment Reports

---

### nerys

Nerys as the starting partner (Lantern, full cycle 1). Round 4 changed her to lewd 65, no starting Exhibitionist and cutFloor 0.3 (she keeps baseline + 30% of her earnings until Devoted). Before, she earned 3-5k/week from week 1 and cleared the debt in ~12-15 weeks. Intent: still the easy-mode partner (a few weeks faster than Kaede), not a debt-clearing machine.

scenario **campaign** · 12 seeds from 1 · 21s · 2026-11-17T16:04

| variant | n | weeksToWin | winRate | netEarly | netMid | netLate | worth13 | worth20 | mood | left |
|---|---|---|---|---|---|---|---|---|---|---|
| kaede (ref) | 12 | 26 | 1.0 | 716 | 866 | 1,983 | -18,088 | -6,477 | 85 | 0.1 |
| nerys (new) | 12 | 21 | 1.0 | 1,031 | 1,554 | 2,485 | -11,742 | 2,457 | 83 | 0.1 |
| nerys, no cut floor | 12 | 14 | 1.0 | 1,968 | 3,109 | 4,371 | 6,471 | 9,417 | 82 | 0.0 |
| nerys (old: lewd 82, Exhibitionist) | 12 | 14 | 1.0 | 1,819 | 3,384 | 5,074 | 11,165 | 13,088 | 85 | 0.0 |

Paired Δ vs **kaede (ref)** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| nerys (new) | **-5.1 ± 4.5** | **+687.6 ± 350.6** | +502.4 ± 711.3 | **+8,933 ± 7,113** | +0.0 ± 0.0 |
| nerys, no cut floor | **-11.8 ± 3.8** | **+2,243 ± 489.7** | **+2,388 ± 1,106** | **+15,894 ± 4,913** | +0.0 ± 0.0 |
| nerys (old: lewd 82, Exhibitionist) | **-12.0 ± 3.8** | **+2,518 ± 593.5** | **+3,091 ± 963.1** | **+19,565 ± 4,895** | +0.0 ± 0.0 |

Per named (kaede (ref); per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| named | lady-weeks | rest% | earned | wage | net | served |
|---|---|---|---|---|---|---|
| nerys | 86 | 9 | 2,515 | 65 | 2,450 | 8.6 |
| hinata | 26 | 8 | 718 | 61 | 657 | 8.2 |
| anael | 99 | 11 | 609 | 66 | 542 | 4.9 |
| elowen | 79 | 10 | 536 | 57 | 479 | 5.1 |
| kaede | 315 | 17 | 459 | 0 | 459 | 3.9 |
| marisol | 66 | 35 | 392 | 65 | 327 | 3.8 |
| mira | 315 | 7 | 229 | 33 | 197 | 1.6 |
| adelheid | 153 | 8 | 141 | 65 | 76 | 1.0 |
| lirael | 33 | 3 | 1 | 47 | -47 | 0.0 |

---

### c1-baseline



scenario **campaign** · 16 seeds from 1 · 9s · 2026-11-17T16:04

| variant | n | weeksToWin | winRate | midAt | lateAt | netEarly | netMid | netLate | worth13 | worth20 | missed | rep | staff | sat | left | over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | 16 | 27 | 1.0 | 4.1 | 12 | 675 | 856 | 1,950 | -18,419 | -6,474 | 0.0 | 53 | 11 | 65 | 0.1 | 0.0 |

Per job (base; per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| job | lady-weeks | rest% | earned | wage | net | served |
|---|---|---|---|---|---|---|
| courtesan | 1070 | 0 | 724 | 35 | 689 | 7.7 |
| dancer | 242 | 0 | 294 | 44 | 250 | 0.0 |
| madame | 284 | 0 | 185 | 42 | 143 | 1.5 |
| guild | 271 | 0 | 169 | 39 | 131 | 0.0 |
| bartender | 360 | 0 | 144 | 37 | 107 | 0.0 |
| attendant | 259 | 0 | 110 | 34 | 76 | 2.3 |
| security | 217 | 0 | 66 | 20 | 46 | 0.0 |
| maid | 427 | 0 | 8 | 31 | -24 | 0.0 |
| promoter | 402 | 0 | 5 | 34 | -29 | 0.0 |

Per race (generic ladies) (base; per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| race | lady-weeks | rest% | earned | wage | net | served |
|---|---|---|---|---|---|---|
| angel/lantern | 13 | 0 | 472 | 51 | 420 | 6.8 |
| angel | 36 | 3 | 296 | 37 | 260 | 8.7 |
| beastkin/fox | 132 | 5 | 167 | 27 | 140 | 3.3 |
| beastkin/dragon | 61 | 8 | 129 | 39 | 90 | 2.2 |
| beastkin/wolf | 275 | 2 | 114 | 30 | 84 | 1.3 |
| beastkin/rabbit | 196 | 0 | 104 | 29 | 75 | 1.4 |
| beastkin/cat | 220 | 4 | 99 | 29 | 70 | 1.3 |
| human | 939 | 5 | 103 | 34 | 69 | 1.9 |
| dwarf | 157 | 1 | 70 | 32 | 39 | 0.3 |
| elf | 147 | 3 | 72 | 35 | 37 | 0.6 |
| demon | 37 | 35 | 70 | 34 | 36 | 0.0 |

---

### tidiness

Tidiness held at a fixed level for every measured week (base = 70, meant to be neutral). Intent: 60-90 close to neutral, a noticeable penalty below 30. 'free' lets it drift as normal.

scenario **mid** · 16 seeds from 1 · 54s · 2026-11-17T16:05

| variant | n | total | net | tidy | served | sat | repGain | mood | left |
|---|---|---|---|---|---|---|---|---|---|
| mid · base | 16 | 708 | 625 | 73 | 16 | 58 | 11 | 83 | 0.0 |
| mid · tidy 90 | 16 | 873 | 759 | 85 | 18 | 63 | 23 | 86 | 0.0 |
| mid · tidy 60 | 16 | 678 | 597 | 66 | 16 | 58 | 11 | 83 | 0.0 |
| mid · tidy 45 | 16 | 588 | 505 | 59 | 14 | 54 | 4.5 | 78 | 0.0 |
| mid · tidy 25 | 16 | 398 | 329 | 41 | 11 | 45 | -7.4 | 70 | 0.1 |
| mid · free | 16 | 720 | 621 | 73 | 16 | 59 | 12 | 84 | 0.0 |
| late · base | 16 | 2,265 | 2,159 | 63 | 32 | 65 | 19 | 89 | 0.1 |
| late · tidy 90 | 16 | 2,342 | 2,263 | 75 | 32 | 67 | 21 | 91 | 0.1 |
| late · tidy 60 | 16 | 2,289 | 2,169 | 58 | 32 | 66 | 19 | 88 | 0.1 |
| late · tidy 45 | 16 | 1,953 | 1,833 | 52 | 30 | 62 | 13 | 86 | 0.0 |
| late · tidy 25 | 16 | 1,626 | 1,536 | 36 | 25 | 56 | -2.7 | 76 | 0.1 |
| late · free | 16 | 2,110 | 2,014 | 51 | 31 | 64 | 15 | 86 | 0.1 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ total | Δ net | Δ sat | Δ repGain |
|---|---|---|---|---|
| mid · tidy 90 | **+165.5 ± 110.5** | **+133.8 ± 99.1** | **+4.9 ± 2.0** | **+12.3 ± 4.4** |
| mid · tidy 60 | -30.3 ± 31.1 | **-28.1 ± 27.7** | **-0.2 ± 0.2** | -0.5 ± 1.3 |
| mid · tidy 45 | -119.6 ± 149.0 | -119.8 ± 155.7 | **-3.4 ± 2.8** | **-6.6 ± 5.9** |
| mid · tidy 25 | **-310.4 ± 155.9** | **-295.4 ± 154.0** | **-13.0 ± 3.4** | **-18.5 ± 4.8** |
| mid · free | +11.9 ± 84.3 | -3.9 ± 70.4 | +1.2 ± 1.7 | +0.9 ± 4.2 |
| late · tidy 90 | +77.4 ± 229.2 | +103.9 ± 215.9 | +1.8 ± 1.9 | +2.2 ± 2.5 |
| late · tidy 60 | +24.3 ± 70.2 | +10.2 ± 64.7 | +0.3 ± 0.7 | +0.1 ± 2.3 |
| late · tidy 45 | **-312.0 ± 226.9** | **-325.7 ± 212.7** | **-3.5 ± 2.2** | **-5.8 ± 3.3** |
| late · tidy 25 | **-639.0 ± 270.5** | **-623.2 ± 262.2** | **-9.2 ± 2.6** | **-21.8 ± 5.8** |
| late · free | **-154.7 ± 132.4** | **-145.4 ± 133.6** | -1.9 ± 2.0 | -3.7 ± 4.4 |

---

### promoter-value



scenario **early** · 16 seeds from 1 · 11s · 2026-11-17T16:05

| variant | n | total | net | promo | served | turned | repGain |
|---|---|---|---|---|---|---|---|
| lantern · base | 16 | 344 | 344 | 0.7 | 8.1 | 2.1 | -2.6 |
| lantern · +promoter | 16 | 401 | 401 | 8.6 | 9.9 | 4.9 | -8.4 |
| hollow · base | 16 | 250 | 250 | 0.2 | 3.6 | 0.5 | 16 |
| hollow · +promoter | 16 | 499 | 499 | 9.4 | 8.5 | 2.5 | 0.9 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ total | Δ net | Δ repGain |
|---|---|---|---|
| lantern · +promoter | **+56.4 ± 44.4** | **+56.4 ± 44.4** | **-5.8 ± 3.6** |
| hollow · +promoter | **+248.8 ± 74.0** | **+248.8 ± 74.0** | **-15.2 ± 6.3** |

---

### security-value



scenario **mid** · 16 seeds from 1 · 20s · 2026-11-17T16:06

| variant | n | total | net | pushy | unhandled | incidents | incHandled | damage | trouble | lost | sat | repGain |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| mid · base | 16 | 489 | 398 | 0.7 | 0.2 | 0.7 | 0.0 | 13 | 0.8 | 0.2 | 60 | 4.8 |
| mid · +security | 16 | 735 | 617 | 1.0 | 0.2 | 0.3 | 0.4 | 6.0 | 0.4 | 0.2 | 64 | 13 |
| late · base | 16 | 1,843 | 1,749 | 2.1 | 0.0 | 0.9 | 0.0 | 21 | 1.0 | 0.0 | 64 | 14 |
| late · +security | 16 | 2,236 | 2,131 | 2.2 | 0.0 | 0.1 | 0.9 | 4.3 | 0.1 | 0.0 | 66 | 17 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ total | Δ trouble | Δ damage | Δ sat |
|---|---|---|---|---|
| mid · +security | **+246.2 ± 166.0** | **-0.4 ± 0.2** | -7.1 ± 7.7 | **+4.1 ± 3.9** |
| late · +security | **+393.1 ± 172.7** | **-0.8 ± 0.2** | **-16.4 ± 8.2** | **+2.5 ± 1.8** |

---

### races-courtesan

Race as courtesans: every generic lady (and every hire in the measured weeks) is this race and works as a courtesan. perLady is what one of them earns over her wage; the intent is that demons lead here.

scenario **mid** · 12 seeds from 1 · 92s · 2026-11-17T16:07

| variant | n | total | net | perLady | served | sat | repGain | left |
|---|---|---|---|---|---|---|---|---|
| mid · base | 12 | 411 | 268 | 59 | 14 | 49 | 0.4 | 0.0 |
| mid · human | 12 | 376 | 271 | 45 | 14 | 46 | -1.9 | 0.0 |
| mid · elf | 12 | 367 | 280 | 43 | 14 | 49 | -2.4 | 0.0 |
| mid · beastkin/fox | 12 | 409 | 270 | 60 | 14 | 45 | -1.8 | 0.0 |
| mid · beastkin/cat | 12 | 402 | 260 | 54 | 15 | 45 | -6.1 | 0.0 |
| mid · beastkin/wolf | 12 | 465 | 284 | 64 | 15 | 46 | 0.6 | 0.0 |
| mid · beastkin/rabbit | 12 | 463 | 292 | 62 | 14 | 48 | 0.1 | 0.0 |
| mid · beastkin/dragon | 12 | 315 | 242 | 37 | 14 | 45 | -2.5 | 0.0 |
| mid · demon | 12 | 550 | 377 | 128 | 14 | 49 | -0.4 | 0.0 |
| mid · dwarf | 12 | 368 | 221 | 50 | 14 | 46 | -0.9 | 0.0 |
| mid · spirit | 12 | 725 | 629 | 41 | 21 | 57 | 15 | 0.0 |
| mid · angel | 12 | 430 | 297 | 52 | 14 | 50 | 1.1 | 0.0 |
| mid · android | 12 | 519 | 431 | 33 | 19 | 58 | 17 | 0.0 |
| late · base | 12 | 1,080 | 1,033 | 67 | 27 | 50 | 1.2 | 0.1 |
| late · human | 12 | 1,187 | 1,098 | 65 | 26 | 51 | -1.5 | 0.2 |
| late · elf | 12 | 1,296 | 1,210 | 64 | 25 | 56 | 4.2 | 0.1 |
| late · beastkin/fox | 12 | 1,216 | 1,156 | 66 | 26 | 52 | 0.7 | 0.0 |
| late · beastkin/cat | 12 | 1,248 | 1,194 | 73 | 28 | 53 | 2.4 | 0.1 |
| late · beastkin/wolf | 12 | 1,304 | 1,223 | 74 | 25 | 53 | -0.5 | 0.0 |
| late · beastkin/rabbit | 12 | 1,424 | 1,353 | 77 | 27 | 54 | 1.4 | 0.0 |
| late · beastkin/dragon | 12 | 1,207 | 1,165 | 58 | 26 | 52 | -0.0 | 0.0 |
| late · demon | 12 | 1,267 | 1,222 | 95 | 25 | 53 | -0.9 | 0.0 |
| late · dwarf | 12 | 1,285 | 1,216 | 59 | 26 | 53 | -0.2 | 0.0 |
| late · spirit | 12 | 2,098 | 1,830 | 39 | 35 | 67 | 18 | 0.0 |
| late · angel | 12 | 1,409 | 1,329 | 73 | 28 | 55 | 4.3 | 0.0 |
| late · android | 12 | 1,456 | 1,193 | 21 | 33 | 68 | 16 | 0.1 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ total | Δ perLady | Δ sat |
|---|---|---|---|
| mid · human | -35.0 ± 119.0 | -14.0 ± 19.6 | -2.9 ± 3.6 |
| mid · elf | -44.6 ± 126.7 | -15.5 ± 21.1 | +0.4 ± 3.3 |
| mid · beastkin/fox | -2.4 ± 71.5 | +1.6 ± 20.8 | **-3.9 ± 2.3** |
| mid · beastkin/cat | -9.0 ± 90.3 | -4.3 ± 22.2 | **-4.2 ± 2.6** |
| mid · beastkin/wolf | +53.4 ± 94.9 | +5.3 ± 24.8 | -2.4 ± 4.0 |
| mid · beastkin/rabbit | +51.3 ± 85.6 | +3.1 ± 19.1 | -0.9 ± 2.3 |
| mid · beastkin/dragon | -96.2 ± 97.9 | **-21.5 ± 17.2** | **-3.8 ± 2.4** |
| mid · demon | +138.3 ± 154.8 | **+69.6 ± 68.8** | +0.3 ± 2.8 |
| mid · dwarf | -43.5 ± 73.2 | -8.8 ± 20.8 | **-3.4 ± 2.5** |
| mid · spirit | **+314.2 ± 162.2** | -17.1 ± 23.8 | **+8.3 ± 3.3** |
| mid · angel | +19.3 ± 159.9 | -6.6 ± 23.1 | +1.2 ± 3.6 |
| mid · android | +107.8 ± 132.7 | -25.7 ± 32.2 | **+9.4 ± 3.1** |
| late · human | +107.1 ± 224.2 | -1.5 ± 8.5 | +1.2 ± 3.4 |
| late · elf | +215.8 ± 319.1 | -2.2 ± 17.5 | **+5.9 ± 4.6** |
| late · beastkin/fox | +136.2 ± 412.1 | -0.4 ± 9.7 | +1.9 ± 5.0 |
| late · beastkin/cat | +167.6 ± 282.4 | +6.8 ± 22.1 | +2.9 ± 4.8 |
| late · beastkin/wolf | +224.0 ± 340.9 | +7.7 ± 14.6 | +3.3 ± 5.2 |
| late · beastkin/rabbit | **+343.9 ± 331.1** | **+10.4 ± 9.7** | +4.2 ± 4.3 |
| late · beastkin/dragon | +126.9 ± 314.1 | -8.3 ± 16.4 | +1.7 ± 5.0 |
| late · demon | +186.4 ± 280.9 | +28.4 ± 36.2 | +3.0 ± 4.3 |
| late · dwarf | +204.6 ± 352.7 | -8.0 ± 14.0 | +3.0 ± 5.5 |
| late · spirit | **+1,018 ± 369.1** | **-27.9 ± 19.5** | **+17.3 ± 4.5** |
| late · angel | +328.5 ± 375.9 | +6.7 ± 17.5 | **+5.3 ± 4.2** |
| late · android | +375.6 ± 419.5 | **-46.0 ± 19.3** | **+17.4 ± 5.4** |

---

### race-jobs

Race x job: every generic lady (and every hire during the measured weeks) is this race; two of them are forced into the job. Δ is against the same race's default assignment, so it shows where each race belongs. Compare a job across races with the means. Needed amenities (race or job) are granted free.

scenario **mid** · 12 seeds from 1 · 260s · 2026-11-17T16:12

| variant | n | total | net | perLady | repGain | sat | served | left |
|---|---|---|---|---|---|---|---|---|
| human · base | 12 | 746 | 692 | 53 | 11 | 57 | 18 | 0.0 |
| human · courtesan | 12 | 502 | 421 | 52 | 3.4 | 49 | 17 | 0.0 |
| human · promoter | 12 | 670 | 582 | 21 | 5.8 | 61 | 15 | 0.0 |
| human · bartender | 12 | 718 | 602 | 40 | 18 | 67 | 14 | 0.0 |
| human · security | 12 | 716 | 617 | 1.5 | 13 | 69 | 10 | 0.0 |
| human · dancer | 12 | 548 | 490 | 33 | 3.4 | 61 | 11 | 0.0 |
| human · host | 12 | 791 | 690 | 19 | 25 | 69 | 13 | 0.0 |
| human · attendant | 12 | 525 | 461 | 24 | 8.0 | 57 | 13 | 0.0 |
| human · maid | 12 | 590 | 483 | 32 | 17 | 64 | 13 | 0.0 |
| elf · base | 12 | 724 | 627 | 60 | 16 | 59 | 17 | 0.0 |
| elf · courtesan | 12 | 461 | 366 | 46 | 0.0 | 50 | 16 | 0.0 |
| elf · promoter | 12 | 714 | 635 | 33 | 12 | 64 | 15 | 0.0 |
| elf · bartender | 12 | 661 | 551 | 33 | 13 | 66 | 13 | 0.0 |
| elf · security | 12 | 612 | 538 | 16 | 12 | 67 | 11 | 0.0 |
| elf · dancer | 12 | 560 | 487 | 27 | 7.0 | 66 | 10 | 0.0 |
| elf · host | 12 | 727 | 645 | 20 | 22 | 69 | 12 | 0.0 |
| elf · attendant | 12 | 594 | 528 | 41 | 12 | 58 | 15 | 0.0 |
| elf · maid | 12 | 628 | 558 | 37 | 15 | 65 | 14 | 0.1 |
| beastkin/fox · base | 12 | 851 | 744 | 54 | 13 | 58 | 19 | 0.0 |
| beastkin/fox · courtesan | 12 | 560 | 420 | 73 | 4.0 | 48 | 17 | 0.0 |
| beastkin/fox · promoter | 12 | 692 | 626 | 41 | 11 | 62 | 16 | 0.0 |
| beastkin/fox · bartender | 12 | 950 | 844 | 47 | 18 | 66 | 16 | 0.0 |
| beastkin/fox · security | 12 | 840 | 775 | 19 | 15 | 68 | 13 | 0.0 |
| beastkin/fox · dancer | 12 | 713 | 640 | 48 | 11 | 65 | 12 | 0.0 |
| beastkin/fox · host | 12 | 759 | 683 | 35 | 18 | 68 | 12 | 0.0 |
| beastkin/fox · attendant | 12 | 688 | 601 | 45 | 13 | 59 | 15 | 0.0 |
| beastkin/fox · maid | 12 | 740 | 622 | 34 | 15 | 66 | 14 | 0.0 |
| beastkin/wolf · base | 12 | 811 | 692 | 78 | 15 | 57 | 19 | 0.0 |
| beastkin/wolf · courtesan | 12 | 539 | 347 | 74 | 3.0 | 49 | 16 | 0.0 |
| beastkin/wolf · promoter | 12 | 765 | 686 | 30 | 12 | 63 | 16 | 0.0 |
| beastkin/wolf · bartender | 12 | 805 | 685 | 55 | 12 | 65 | 15 | 0.0 |
| beastkin/wolf · security | 12 | 583 | 502 | 8.4 | 8.0 | 65 | 11 | 0.0 |
| beastkin/wolf · dancer | 12 | 790 | 710 | 50 | 8.7 | 67 | 13 | 0.0 |
| beastkin/wolf · host | 12 | 893 | 805 | 44 | 25 | 69 | 14 | 0.0 |
| beastkin/wolf · attendant | 12 | 713 | 585 | 57 | 14 | 58 | 16 | 0.0 |
| beastkin/wolf · maid | 12 | 810 | 678 | 37 | 20 | 66 | 15 | 0.0 |
| demon · base | 12 | 603 | 518 | 81 | 2.9 | 55 | 14 | 0.0 |
| demon · courtesan | 12 | 647 | 486 | 144 | 4.3 | 52 | 16 | 0.0 |
| demon · promoter | 12 | 807 | 665 | 96 | 5.6 | 62 | 15 | 0.0 |
| demon · bartender | 12 | 690 | 499 | 53 | 12 | 69 | 13 | 0.0 |
| demon · security | 12 | 499 | 395 | 14 | 3.4 | 66 | 9.4 | 0.0 |
| demon · dancer | 12 | 617 | 509 | 54 | 3.1 | 65 | 11 | 0.0 |
| demon · host | 12 | 764 | 619 | 51 | 9.1 | 70 | 11 | 0.0 |
| demon · attendant | 12 | 623 | 470 | 57 | 6.7 | 59 | 13 | 0.0 |
| demon · maid | 12 | 643 | 521 | 30 | 7.3 | 67 | 11 | 0.1 |
| dwarf · base | 12 | 717 | 635 | 59 | 13 | 55 | 19 | 0.0 |
| dwarf · courtesan | 12 | 476 | 308 | 52 | 2.2 | 47 | 15 | 0.0 |
| dwarf · promoter | 12 | 801 | 730 | 23 | 15 | 63 | 16 | 0.0 |
| dwarf · bartender | 12 | 801 | 638 | 40 | 15 | 63 | 15 | 0.0 |
| dwarf · security | 12 | 781 | 695 | 11 | 14 | 66 | 13 | 0.0 |
| dwarf · dancer | 12 | 620 | 550 | 40 | 1.6 | 64 | 11 | 0.0 |
| dwarf · host | 12 | 824 | 696 | 39 | 21 | 68 | 13 | 0.2 |
| dwarf · attendant | 12 | 537 | 447 | 37 | 8.3 | 56 | 13 | 0.0 |
| dwarf · maid | 12 | 818 | 694 | 45 | 21 | 63 | 17 | 0.0 |
| spirit · base | 12 | 908 | 816 | 47 | 20 | 62 | 23 | 0.0 |
| spirit · courtesan | 12 | 774 | 670 | 45 | 16 | 57 | 22 | 0.0 |
| spirit · promoter | 12 | 1,144 | 1,025 | 40 | 24 | 63 | 25 | 0.1 |
| spirit · bartender | 12 | 1,056 | 899 | 41 | 22 | 67 | 20 | 0.0 |
| spirit · security | 12 | 1,057 | 923 | 43 | 25 | 65 | 21 | 0.1 |
| spirit · dancer | 12 | 1,102 | 1,014 | 37 | 21 | 67 | 22 | 0.1 |
| spirit · host | 12 | 1,212 | 1,107 | 26 | 28 | 70 | 21 | 0.2 |
| spirit · attendant | 12 | 816 | 723 | 37 | 22 | 62 | 20 | 0.0 |
| spirit · maid | 12 | 1,092 | 973 | 37 | 28 | 66 | 22 | 0.0 |
| angel · base | 12 | 682 | 581 | 55 | 10 | 56 | 17 | 0.0 |
| angel · courtesan | 12 | 498 | 364 | 58 | 4.0 | 51 | 16 | 0.0 |
| angel · promoter | 12 | 591 | 538 | 19 | 8.8 | 61 | 15 | 0.0 |
| angel · bartender | 12 | 743 | 597 | 34 | 15 | 68 | 13 | 0.0 |
| angel · security | 12 | 674 | 583 | 16 | 14 | 67 | 11 | 0.1 |
| angel · dancer | 12 | 620 | 556 | 29 | 5.6 | 65 | 11 | 0.0 |
| angel · host | 12 | 721 | 653 | 18 | 21 | 67 | 13 | 0.1 |
| angel · attendant | 12 | 570 | 439 | 27 | 9.4 | 58 | 14 | 0.0 |
| angel · maid | 12 | 713 | 652 | 18 | 15 | 67 | 14 | 0.0 |
| android · base | 12 | 805 | 605 | 39 | 26 | 66 | 22 | 0.0 |
| android · courtesan | 12 | 572 | 426 | 48 | 16 | 59 | 20 | 0.0 |
| android · promoter | 12 | 737 | 577 | 25 | 22 | 66 | 21 | 0.0 |
| android · bartender | 12 | 1,005 | 807 | 21 | 27 | 71 | 21 | 0.0 |
| android · security | 12 | 968 | 765 | 35 | 24 | 70 | 19 | 0.1 |
| android · dancer | 12 | 709 | 610 | 24 | 19 | 64 | 21 | 0.0 |
| android · host | 12 | 1,102 | 951 | 24 | 34 | 75 | 19 | 0.0 |
| android · attendant | 12 | 662 | 495 | 35 | 22 | 64 | 20 | 0.1 |
| android · maid | 12 | 675 | 560 | 24 | 27 | 68 | 19 | 0.0 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ total | Δ net | Δ sat | Δ left |
|---|---|---|---|---|
| human · courtesan | **-244.0 ± 102.3** | **-270.5 ± 86.3** | **-8.4 ± 4.2** | +0.0 ± 0.0 |
| human · promoter | -75.7 ± 165.6 | -110.2 ± 153.8 | +3.4 ± 4.1 | +0.0 ± 0.0 |
| human · bartender | -27.8 ± 135.4 | -90.4 ± 107.1 | **+10.1 ± 4.0** | +0.0 ± 0.0 |
| human · security | -29.5 ± 152.0 | -74.9 ± 128.3 | **+12.0 ± 3.8** | +0.0 ± 0.0 |
| human · dancer | **-197.8 ± 146.0** | **-201.7 ± 135.9** | +3.9 ± 4.0 | +0.0 ± 0.0 |
| human · host | +45.0 ± 193.6 | -1.8 ± 198.7 | **+11.9 ± 2.7** | +0.0 ± 0.0 |
| human · attendant | **-221.1 ± 110.2** | **-231.1 ± 118.5** | -0.7 ± 4.1 | +0.0 ± 0.0 |
| human · maid | **-156.0 ± 106.0** | **-208.9 ± 83.9** | **+6.9 ± 3.9** | +0.0 ± 0.0 |
| elf · courtesan | **-263.3 ± 115.5** | **-261.7 ± 112.3** | **-9.8 ± 4.7** | +0.0 ± 0.0 |
| elf · promoter | -10.4 ± 161.4 | +7.3 ± 171.2 | +4.2 ± 4.5 | +0.0 ± 0.0 |
| elf · bartender | -63.8 ± 159.8 | -76.1 ± 142.6 | **+6.9 ± 3.2** | +0.0 ± 0.0 |
| elf · security | -112.1 ± 152.4 | -89.1 ± 155.1 | **+7.4 ± 3.4** | +0.0 ± 0.0 |
| elf · dancer | **-164.0 ± 104.9** | **-140.3 ± 99.8** | **+7.0 ± 4.5** | +0.0 ± 0.0 |
| elf · host | +2.6 ± 287.8 | +17.9 ± 278.1 | **+10.0 ± 4.1** | +0.0 ± 0.0 |
| elf · attendant | **-130.0 ± 123.0** | -99.1 ± 118.9 | -1.4 ± 2.8 | +0.0 ± 0.0 |
| elf · maid | -96.6 ± 109.6 | -69.9 ± 122.8 | **+5.4 ± 3.6** | +0.1 ± 0.2 |
| beastkin/fox · courtesan | **-290.8 ± 108.2** | **-324.5 ± 121.3** | **-10.2 ± 3.3** | +0.0 ± 0.0 |
| beastkin/fox · promoter | -158.7 ± 196.1 | -117.9 ± 176.3 | +3.8 ± 4.3 | +0.0 ± 0.0 |
| beastkin/fox · bartender | +98.6 ± 157.0 | +100.0 ± 160.3 | **+8.4 ± 3.7** | +0.0 ± 0.0 |
| beastkin/fox · security | -11.2 ± 163.1 | +31.0 ± 155.7 | **+10.3 ± 4.3** | +0.0 ± 0.0 |
| beastkin/fox · dancer | -138.2 ± 155.5 | -104.1 ± 132.2 | **+6.7 ± 3.6** | +0.0 ± 0.0 |
| beastkin/fox · host | -92.3 ± 168.3 | -61.2 ± 179.4 | **+10.1 ± 2.1** | +0.0 ± 0.0 |
| beastkin/fox · attendant | -162.6 ± 180.4 | -143.1 ± 179.8 | +0.7 ± 3.3 | +0.0 ± 0.0 |
| beastkin/fox · maid | -110.8 ± 111.4 | **-122.6 ± 113.6** | **+8.0 ± 3.9** | +0.0 ± 0.0 |
| beastkin/wolf · courtesan | **-272.8 ± 101.8** | **-345.5 ± 100.6** | **-7.7 ± 4.3** | +0.0 ± 0.0 |
| beastkin/wolf · promoter | -46.2 ± 140.9 | -6.6 ± 156.6 | **+6.0 ± 4.1** | +0.0 ± 0.0 |
| beastkin/wolf · bartender | -6.6 ± 142.0 | -7.6 ± 128.4 | **+7.8 ± 4.4** | +0.0 ± 0.0 |
| beastkin/wolf · security | **-228.1 ± 109.2** | **-190.4 ± 86.8** | **+7.9 ± 4.7** | +0.0 ± 0.0 |
| beastkin/wolf · dancer | -21.6 ± 147.3 | +17.2 ± 141.6 | **+9.6 ± 3.3** | +0.0 ± 0.0 |
| beastkin/wolf · host | +81.1 ± 238.7 | +112.8 ± 209.4 | **+12.1 ± 3.0** | +0.0 ± 0.0 |
| beastkin/wolf · attendant | **-98.6 ± 95.5** | **-107.3 ± 94.3** | +0.7 ± 2.5 | +0.0 ± 0.0 |
| beastkin/wolf · maid | -1.6 ± 104.3 | -14.2 ± 98.3 | **+9.3 ± 2.4** | +0.0 ± 0.0 |
| demon · courtesan | +44.1 ± 251.1 | -32.1 ± 207.6 | -3.3 ± 4.4 | +0.0 ± 0.0 |
| demon · promoter | +204.5 ± 212.4 | +146.7 ± 179.8 | **+6.9 ± 4.0** | +0.0 ± 0.0 |
| demon · bartender | +87.9 ± 182.5 | -19.3 ± 163.2 | **+13.4 ± 5.2** | +0.0 ± 0.0 |
| demon · security | -103.5 ± 165.9 | -122.8 ± 142.9 | **+10.8 ± 3.8** | +0.0 ± 0.0 |
| demon · dancer | +14.9 ± 162.4 | -8.7 ± 169.8 | **+10.1 ± 4.8** | +0.0 ± 0.0 |
| demon · host | +161.4 ± 170.9 | +100.8 ± 165.1 | **+15.3 ± 4.5** | +0.0 ± 0.0 |
| demon · attendant | +20.3 ± 152.5 | -47.7 ± 150.5 | **+4.2 ± 2.0** | +0.0 ± 0.0 |
| demon · maid | +40.1 ± 179.1 | +3.3 ± 175.8 | **+12.2 ± 3.8** | +0.1 ± 0.2 |
| dwarf · courtesan | **-240.7 ± 128.6** | **-326.3 ± 158.9** | **-8.3 ± 4.6** | +0.0 ± 0.0 |
| dwarf · promoter | +84.6 ± 126.2 | +95.6 ± 125.9 | **+8.5 ± 5.1** | +0.0 ± 0.0 |
| dwarf · bartender | +84.6 ± 142.5 | +3.0 ± 175.6 | **+8.7 ± 4.5** | +0.0 ± 0.0 |
| dwarf · security | +64.0 ± 185.0 | +60.2 ± 210.3 | **+11.0 ± 3.9** | +0.0 ± 0.0 |
| dwarf · dancer | -96.6 ± 135.4 | -84.9 ± 134.5 | **+9.6 ± 4.2** | +0.0 ± 0.0 |
| dwarf · host | +107.8 ± 185.4 | +60.8 ± 182.2 | **+13.3 ± 3.3** | +0.2 ± 0.2 |
| dwarf · attendant | **-179.1 ± 125.1** | **-187.7 ± 127.2** | +1.0 ± 3.6 | +0.0 ± 0.0 |
| dwarf · maid | +101.4 ± 178.6 | +59.7 ± 182.0 | **+7.8 ± 2.8** | +0.0 ± 0.0 |
| spirit · courtesan | **-133.6 ± 112.6** | **-146.1 ± 65.5** | **-4.5 ± 2.8** | +0.0 ± 0.0 |
| spirit · promoter | **+236.5 ± 181.3** | **+209.0 ± 176.4** | +1.7 ± 1.7 | +0.1 ± 0.2 |
| spirit · bartender | +148.4 ± 172.3 | +82.2 ± 165.6 | **+5.6 ± 2.8** | +0.0 ± 0.0 |
| spirit · security | **+149.4 ± 148.8** | +107.0 ± 129.1 | **+3.6 ± 3.0** | +0.1 ± 0.2 |
| spirit · dancer | +193.6 ± 240.7 | +197.9 ± 199.0 | **+5.5 ± 3.1** | +0.1 ± 0.2 |
| spirit · host | **+304.3 ± 296.9** | **+290.3 ± 253.5** | **+8.5 ± 2.7** | +0.2 ± 0.2 |
| spirit · attendant | -92.3 ± 215.0 | -93.0 ± 196.0 | +0.5 ± 3.1 | +0.0 ± 0.0 |
| spirit · maid | +184.4 ± 206.9 | +157.1 ± 182.7 | **+4.6 ± 2.7** | +0.0 ± 0.0 |
| angel · courtesan | -184.2 ± 210.5 | **-217.1 ± 185.5** | **-5.1 ± 4.7** | +0.0 ± 0.0 |
| angel · promoter | -90.6 ± 172.6 | -43.3 ± 129.5 | +4.5 ± 5.0 | +0.0 ± 0.0 |
| angel · bartender | +61.0 ± 231.5 | +15.9 ± 219.6 | **+11.6 ± 4.5** | +0.0 ± 0.0 |
| angel · security | -8.1 ± 215.1 | +2.0 ± 183.1 | **+10.6 ± 5.0** | +0.1 ± 0.2 |
| angel · dancer | -62.0 ± 161.9 | -25.0 ± 187.0 | **+9.3 ± 4.3** | +0.0 ± 0.0 |
| angel · host | +39.1 ± 226.8 | +71.9 ± 192.8 | **+11.2 ± 3.6** | +0.1 ± 0.2 |
| angel · attendant | -112.3 ± 136.6 | **-141.9 ± 130.5** | +1.9 ± 3.0 | +0.0 ± 0.0 |
| angel · maid | +31.1 ± 219.1 | +71.4 ± 198.1 | **+10.4 ± 3.3** | +0.0 ± 0.0 |
| android · courtesan | **-233.1 ± 181.5** | **-179.1 ± 151.1** | **-7.3 ± 3.8** | +0.0 ± 0.0 |
| android · promoter | -68.1 ± 202.0 | -28.6 ± 160.2 | +0.1 ± 3.4 | +0.0 ± 0.0 |
| android · bartender | +200.1 ± 347.3 | +202.1 ± 287.5 | **+5.4 ± 3.2** | +0.0 ± 0.0 |
| android · security | +163.3 ± 217.9 | +159.4 ± 179.4 | **+3.8 ± 3.3** | +0.1 ± 0.2 |
| android · dancer | -96.1 ± 183.9 | +4.4 ± 153.0 | -1.5 ± 2.6 | +0.0 ± 0.0 |
| android · host | +296.6 ± 366.7 | **+345.6 ± 320.7** | **+9.0 ± 4.0** | +0.0 ± 0.0 |
| android · attendant | -142.7 ± 167.6 | -110.1 ± 118.6 | -1.9 ± 2.5 | +0.1 ± 0.2 |
| android · maid | -130.0 ± 174.3 | -44.9 ± 129.8 | +1.7 ± 2.7 | +0.0 ± 0.0 |

Per race · job (generic ladies) (all variants pooled; per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| racejob | lady-weeks | rest% | earned | wage | net | served |
|---|---|---|---|---|---|---|
| demon · bath | 3 | 0 | 493 | 31 | 462 | 0.0 |
| demon · courtesan | 911 | 0 | 442 | 33 | 409 | 8.3 |
| android · courtesan | 2924 | 0 | 321 | 34 | 287 | 4.8 |
| beastkin/wolf · bath | 4 | 0 | 300 | 31 | 270 | 0.0 |
| elf · bath | 2 | 0 | 297 | 38 | 259 | 0.0 |
| angel · bath | 2 | 0 | 271 | 31 | 240 | 0.0 |
| beastkin/wolf · courtesan | 1164 | 0 | 242 | 28 | 213 | 7.0 |
| dwarf · courtesan | 1107 | 0 | 226 | 32 | 193 | 6.6 |
| elf · courtesan | 1050 | 0 | 222 | 33 | 189 | 6.2 |
| beastkin/fox · courtesan | 1124 | 0 | 215 | 28 | 187 | 6.4 |
| human · bath | 2 | 0 | 214 | 31 | 183 | 0.0 |
| spirit · courtesan | 3106 | 0 | 209 | 33 | 176 | 4.6 |
| angel · courtesan | 1043 | 0 | 207 | 32 | 174 | 6.0 |
| human · courtesan | 1010 | 0 | 198 | 32 | 166 | 6.3 |
| angel/lantern · courtesan | 7 | 0 | 193 | 35 | 158 | 6.0 |
| android · guild | 1261 | 0 | 183 | 34 | 149 | 0.0 |
| beastkin/wolf · guild | 439 | 0 | 146 | 28 | 117 | 0.0 |
| dwarf · guild | 415 | 0 | 146 | 33 | 113 | 0.0 |
| beastkin/fox · guild | 515 | 0 | 136 | 28 | 108 | 0.0 |
| angel · guild | 412 | 0 | 132 | 33 | 100 | 0.0 |
| spirit · guild | 1292 | 0 | 126 | 33 | 93 | 0.0 |
| elf · guild | 406 | 0 | 122 | 32 | 90 | 0.0 |
| human · guild | 406 | 0 | 118 | 32 | 86 | 0.0 |
| demon · attendant | 404 | 0 | 109 | 32 | 77 | 2.5 |
| beastkin/wolf · attendant | 663 | 0 | 93 | 28 | 65 | 2.5 |
| demon · guild | 211 | 0 | 94 | 33 | 61 | 0.0 |
| elf · attendant | 740 | 0 | 92 | 32 | 60 | 2.7 |
| android · bartender | 863 | 0 | 93 | 33 | 60 | 0.0 |
| demon · dancer | 259 | 0 | 91 | 32 | 59 | 0.0 |
| spirit · bartender | 842 | 0 | 89 | 33 | 56 | 0.0 |
| beastkin/fox · attendant | 815 | 0 | 83 | 28 | 55 | 2.5 |
| angel · attendant | 682 | 0 | 83 | 32 | 50 | 2.7 |
| beastkin/fox · dancer | 432 | 0 | 78 | 28 | 50 | 0.0 |
| beastkin/wolf · bartender | 821 | 0 | 77 | 29 | 49 | 0.0 |
| demon · bartender | 492 | 0 | 80 | 32 | 48 | 0.0 |
| beastkin/fox · bartender | 816 | 0 | 76 | 28 | 48 | 0.0 |
| android · dancer | 487 | 0 | 81 | 33 | 48 | 0.0 |
| beastkin/wolf · dancer | 444 | 0 | 76 | 28 | 48 | 0.0 |
| dwarf · bartender | 842 | 0 | 80 | 33 | 48 | 0.0 |
| human · attendant | 634 | 0 | 80 | 33 | 47 | 2.6 |
| human · bartender | 737 | 0 | 75 | 32 | 43 | 0.0 |
| spirit · dancer | 500 | 0 | 76 | 33 | 43 | 0.0 |
| elf · bartender | 638 | 0 | 74 | 33 | 41 | 0.0 |
| human · dancer | 332 | 0 | 72 | 33 | 39 | 0.0 |
| elf · dancer | 353 | 0 | 71 | 33 | 38 | 0.0 |
| angel · dancer | 386 | 0 | 71 | 33 | 37 | 0.0 |
| dwarf · attendant | 762 | 0 | 69 | 32 | 37 | 2.4 |
| angel · bartender | 608 | 0 | 68 | 32 | 37 | 0.0 |
| dwarf · dancer | 439 | 0 | 67 | 33 | 35 | 0.0 |
| spirit · attendant | 2727 | 0 | 56 | 33 | 23 | 1.0 |
| android · attendant | 2465 | 0 | 55 | 34 | 21 | 0.9 |
| demon · host | 138 | 0 | 36 | 31 | 4 | 0.0 |
| android · host | 282 | 0 | 27 | 32 | -4 | 0.0 |
| spirit · rest | 820 | 100 | 26 | 32 | -6 | 0.0 |
| beastkin/wolf · host | 228 | 0 | 20 | 27 | -7 | 0.0 |
| beastkin/fox · host | 226 | 0 | 20 | 27 | -8 | 0.0 |
| elf · rest | 336 | 100 | 20 | 31 | -11 | 0.0 |
| dwarf · host | 246 | 0 | 20 | 32 | -12 | 0.0 |
| human · rest | 331 | 100 | 19 | 32 | -12 | 0.0 |
| demon · promoter | 478 | 0 | 20 | 32 | -13 | 0.0 |
| human · host | 211 | 0 | 18 | 31 | -13 | 0.0 |
| elf · host | 214 | 0 | 18 | 32 | -14 | 0.0 |
| beastkin/fox · rest | 245 | 100 | 12 | 27 | -15 | 0.0 |
| angel · host | 205 | 0 | 17 | 32 | -15 | 0.0 |
| spirit · host | 204 | 0 | 16 | 31 | -16 | 0.0 |
| demon · security | 227 | 0 | 14 | 32 | -18 | 0.0 |
| angel · rest | 297 | 100 | 13 | 32 | -19 | 0.0 |
| demon · maid | 741 | 0 | 13 | 32 | -19 | 0.0 |
| beastkin/wolf · rest | 240 | 100 | 6 | 28 | -22 | 0.0 |
| beastkin/fox · promoter | 961 | 0 | 5 | 28 | -23 | 0.0 |
| beastkin/fox · maid | 1241 | 0 | 4 | 28 | -23 | 0.0 |
| beastkin/wolf · promoter | 968 | 0 | 5 | 28 | -23 | 0.0 |
| beastkin/wolf · security | 441 | 0 | 4 | 28 | -24 | 0.0 |
| beastkin/fox · security | 433 | 0 | 4 | 28 | -24 | 0.0 |
| beastkin/wolf · maid | 1246 | 0 | 4 | 28 | -24 | 0.0 |
| human · promoter | 987 | 0 | 6 | 33 | -27 | 0.0 |
| demon · rest | 1838 | 100 | 5 | 32 | -27 | 0.0 |
| elf · promoter | 1021 | 0 | 4 | 32 | -28 | 0.0 |
| spirit · security | 717 | 0 | 4 | 33 | -28 | 0.0 |
| human · security | 398 | 0 | 3 | 31 | -28 | 0.0 |
| human · maid | 1148 | 0 | 4 | 32 | -28 | 0.0 |
| elf · security | 396 | 0 | 3 | 31 | -28 | 0.0 |
| elf · maid | 1147 | 0 | 4 | 32 | -29 | 0.0 |
| dwarf · rest | 98 | 100 | 3 | 32 | -29 | 0.0 |
| dwarf · security | 419 | 0 | 3 | 32 | -29 | 0.0 |
| dwarf · promoter | 904 | 0 | 3 | 33 | -29 | 0.0 |
| android · security | 598 | 0 | 3 | 33 | -30 | 0.0 |
| dwarf · maid | 1258 | 0 | 2 | 32 | -30 | 0.0 |
| spirit · maid | 2665 | 0 | 2 | 33 | -30 | 0.0 |
| spirit · promoter | 2350 | 0 | 3 | 33 | -30 | 0.0 |
| android · promoter | 1834 | 0 | 2 | 33 | -31 | 0.0 |
| angel · security | 422 | 0 | 0 | 32 | -31 | 0.0 |
| android · maid | 2069 | 0 | 2 | 33 | -31 | 0.0 |
| angel · maid | 1230 | 0 | 0 | 32 | -32 | 0.0 |
| angel · promoter | 977 | 0 | 0 | 33 | -32 | 0.0 |
| angel/lantern · rest | 1 | 100 | 0 | 34 | -34 | 0.0 |
| android · rest | 92 | 100 | 0 | 34 | -34 | 0.0 |

---

### sam-actions-campaign

Sam's spare rest-day action over a whole first cycle (Lantern): week the debt is cleared and income per phase. Group nights and demonstrations are flavor and left out.

scenario **campaign** · 16 seeds from 1 · 84s · 2026-11-17T16:13

| variant | n | weeksToWin | netEarly | netMid | netLate | worth20 | rep | trust | sat | left |
|---|---|---|---|---|---|---|---|---|---|---|
| base | 16 | 27 | 675 | 856 | 1,950 | -6,474 | 53 | 59 | 65 | 0.1 |
| scout | 16 | 27 | 670 | 807 | 2,309 | -7,375 | 53 | 55 | 66 | 0.0 |
| rounds | 16 | 29 | 666 | 812 | 1,990 | -9,032 | 50 | 63 | 64 | 0.1 |
| date | 16 | 29 | 586 | 753 | 1,874 | -9,478 | 50 | 64 | 62 | 0.0 |
| walk | 16 | 28 | 557 | 845 | 1,837 | -9,024 | 51 | 59 | 65 | 0.0 |
| rest | 16 | 27 | 675 | 856 | 1,950 | -6,474 | 53 | 59 | 65 | 0.1 |
| trainStat | 16 | 25 | 666 | 951 | 2,298 | -4,697 | 54 | 57 | 68 | 0.1 |
| trainSkill | 16 | 27 | 738 | 838 | 2,178 | -6,376 | 52 | 57 | 67 | 0.2 |
| trainService | 16 | 29 | 672 | 832 | 1,949 | -10,097 | 48 | 58 | 65 | 0.1 |

Paired Δ vs **base** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| scout | +0.5 ± 3.6 | -48.7 ± 215.1 | +359.1 ± 377.5 | -901.1 ± 4,787 | +0.0 ± 0.0 |
| rounds | +1.9 ± 2.6 | -43.8 ± 253.3 | +39.7 ± 368.5 | -2,558 ± 4,163 | +0.0 ± 0.0 |
| date | +2.6 ± 2.9 | -102.9 ± 136.3 | -76.5 ± 354.5 | -3,004 ± 4,336 | +0.0 ± 0.0 |
| walk | +1.3 ± 2.2 | -10.8 ± 147.1 | -113.1 ± 304.7 | **-2,550 ± 2,333** | +0.0 ± 0.0 |
| rest | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| trainStat | -1.4 ± 2.5 | +95.3 ± 222.7 | +348.4 ± 382.5 | +1,777 ± 3,926 | +0.0 ± 0.0 |
| trainSkill | +0.3 ± 2.5 | -18.0 ± 153.0 | +227.5 ± 445.1 | +98.2 ± 3,893 | +0.0 ± 0.0 |
| trainService | +1.8 ± 2.3 | -23.4 ± 100.3 | -1.5 ± 349.6 | **-3,623 ± 3,211** | +0.0 ± 0.0 |

---

### ngplus-carry

NG+ with different numbers of carried lovers (Devoted, partner first then by trust) and old friends (generics at max trust). Wayfarer as new house, Seasoned Owner. winWeek = length of cycle 2.

scenario **ngplus** · 12 seeds from 1 · 102s · 2026-11-17T16:15

| variant | n | c1won | c2lovers | ngDebt | ngStaff | ngWeeks | net | missed | staff | sat | left | over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | 12 | 26 | 1.4 | 70,858 | 3.9 | 29 | 3,068 | 0.0 | 23 | 65 | 0.1 | 0.0 |
| 0 | 12 | – | 0.8 | 69,292 | 3.0 | 39 | 2,444 | 0.3 | 22 | 63 | 0.2 | 0.1 |
| 1 | 12 | – | 1.6 | 70,999 | 4.0 | 28 | 3,169 | 0.0 | 23 | 67 | 0.2 | 0.0 |
| 2 | 12 | – | 2.5 | 72,706 | 4.3 | 31 | 2,851 | 0.0 | 23 | 68 | 0.2 | 0.0 |
| 3 | 12 | – | 3.5 | 74,413 | 5.0 | 28 | 3,506 | 0.0 | 23 | 72 | 0.3 | 0.0 |
| 5 | 12 | – | 5.7 | 77,828 | 7.0 | 28 | 3,763 | 0.0 | 22 | 69 | 0.0 | 0.0 |

Paired Δ vs **base** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ ngWeeks | Δ net | Δ over |
|---|---|---|---|
| 0 | +9.7 ± 9.9 | **-623.9 ± 377.8** | +0.1 ± 0.2 |
| 1 | -0.9 ± 1.0 | +100.5 ± 126.2 | +0.0 ± 0.0 |
| 2 | +1.3 ± 2.8 | -216.9 ± 386.7 | +0.0 ± 0.0 |
| 3 | -1.8 ± 4.2 | +438.2 ± 650.0 | +0.0 ± 0.0 |
| 5 | -1.5 ± 5.4 | +694.9 ± 987.4 | +0.0 ± 0.0 |

---

### ngplus-cycles

NG+ over several cycles (cycles 2-5): new house = the best one offered (LAB.HOUSE_RANK), Seasoned Owner first then the next untaken boon, no new past; bot's natural lovers. keep: all kept houses (default) vs only the home house. cN* = cycle N: length in weeks, debt, starting staff, game over.

scenario **ngplus** · 12 seeds from 1 · 1573s · 2026-11-17T16:41

| variant | n | c1won | c2weeks | c3weeks | c4weeks | c5weeks | c2debt | c3debt | c4debt | c5debt | c2staff | c3staff | c4staff | c5staff | c2over | c3over | c4over | c5over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | 12 | 26 | 37 | 28ⁿ11 | 27ⁿ11 | 30ⁿ11 | 77,147 | 121,239ⁿ11 | 181,099ⁿ11 | 241,143ⁿ11 | 3.9 | 6.5ⁿ11 | 8.1ⁿ11 | 10ⁿ11 | 0.1 | 0.0ⁿ11 | 0.0ⁿ11 | 0.0ⁿ11 |
| all | 12 | – | 37 | 27ⁿ11 | 27ⁿ11 | 30ⁿ11 | 77,147 | 119,530ⁿ11 | 174,746ⁿ11 | 243,099ⁿ11 | 3.9 | 6.5ⁿ11 | 8.0ⁿ11 | 9.9ⁿ11 | 0.1 | 0.0ⁿ11 | 0.0ⁿ11 | 0.0ⁿ11 |
| home | 12 | – | 37 | 26ⁿ11 | 26ⁿ11 | 28ⁿ11 | 77,147 | 89,200ⁿ11 | 124,076ⁿ11 | 140,030ⁿ11 | 3.9 | 4.8ⁿ11 | 5.6ⁿ11 | 6.5ⁿ11 | 0.1 | 0.0ⁿ11 | 0.0ⁿ11 | 0.0ⁿ11 |

Paired Δ vs **base** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ c2weeks | Δ c3weeks | Δ c4weeks | Δ c5weeks | Δ c4over |
|---|---|---|---|---|---|
| all | -0.6 ± 1.0 | -1.3 ± 2.5 | -0.6 ± 0.8 | -0.3 ± 0.5 | +0.0 ± 0.0 |
| home | -0.6 ± 1.0 | -2.5 ± 2.6 | -1.2 ± 2.6 | -2.2 ± 3.1 | +0.0 ± 0.0 |

---

### ngpp

NG++ Lantern Shrine soft reset: 2 NG++ cycles (Seliora bound going into cycle 2) vs standard NG+.

scenario **ngplus** · 10 seeds from 1 · 77s · 2026-11-17T16:42

| variant | n | c1won | c2weeks | c3weeks | c2debt | c3debt | c2staff | c3staff | c2over | c3over |
|---|---|---|---|---|---|---|---|---|---|---|
| ng++ (shrine) | 10 | 26 | 78 | 72ⁿ4 | 50,000 | 116,284ⁿ4 | 1.0 | 1.0ⁿ4 | 0.6 | 0.5ⁿ4 |
| ng+ (wayfarer) | 10 | – | 32 | 27 | 70,455 | 130,150 | 3.9 | 5.7 | 0.0 | 0.0 |
| ng++ (shrine), no guild | 9 (+1 unreached) | 28 | 104 | – | 50,000 | – | 1.0 | – | 1.0 | – |
| ng+ (wayfarer), no guild | 9 (+1 unreached) | – | 50 | 35ⁿ7 | 68,355 | 132,377ⁿ7 | 4.0 | 5.7ⁿ7 | 0.2 | 0.0ⁿ7 |

Paired Δ vs **ng++ (shrine)** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ c2weeks | Δ c3weeks |
|---|---|---|
| ng+ (wayfarer) | **-46.3 ± 21.2** | **-45.5 ± 34.6** |
| ng++ (shrine), no guild | **+29.0 ± 22.6** | – |
| ng+ (wayfarer), no guild | **-25.1 ± 23.3** | -35.5 ± 40.4 |

---

### houses-all

Benchmark: all 10 Cycle-1 houses (5 starters + 5 premium houses) played from week 1 (Kaede, salaryman, default policy).

scenario **campaign** · 12 seeds from 1 · 74s · 2026-11-17T16:43

| variant | n | weeksToWin | winRate | netEarly | netMid | netLate | worth20 | guild | partners | over |
|---|---|---|---|---|---|---|---|---|---|---|
| lantern | 12 | 26 | 1.0 | 716 | 866 | 1,983 | -6,477 | 220 | 2.4 | 0.0 |
| onsen | 12 | 31 | 1.0 | 714 | 772 | 1,748 | -15,339 | 243 | 2.6 | 0.0 |
| hollow | 12 | 28 | 1.0 | 484 | 1,921 | 4,596 | -19,056 | 238 | 2.8 | 0.0 |
| tankard | 12 | 27 | 1.0 | 449 | 795 | 1,509 | -3,755 | 204 | 2.4 | 0.0 |
| wayfarer | 12 | 30 | 1.0 | 804 | 980 | 2,069 | -13,975 | 243 | 2.1 | 0.0 |
| castle | 12 | 30 | 1.0 | 781 | 3,335 | 9,582 | -56,437 | 272 | 2.4 | 0.0 |
| pavilion | 12 | 30 | 1.0 | 1,006 | 1,869 | 4,324 | -24,023 | 191 | 2.2 | 0.0 |
| veil | 12 | 20 | 1.0 | 1,650 | 2,842 | 4,713 | 6,534 | 227 | 2.4 | 0.0 |
| sanctuary | 12 | 26 | 1.0 | 895 | 1,509 | 3,585 | -7,751 | 186 | 2.3 | 0.0 |
| atelier | 12 | 28 | 1.0 | 1,108 | 2,546 | 5,767 | -18,134 | 290 | 2.3 | 0.0 |

Paired Δ vs **lantern** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| onsen | +4.5 ± 5.1 | -93.5 ± 291.2 | -235.2 ± 474.0 | **-8,863 ± 5,990** | +0.0 ± 0.0 |
| hollow | +1.4 ± 3.6 | **+1,055 ± 476.5** | **+2,613 ± 916.2** | **-12,580 ± 7,283** | +0.0 ± 0.0 |
| tankard | +0.4 ± 2.9 | -70.7 ± 215.0 | **-473.9 ± 393.9** | +2,722 ± 2,817 | +0.0 ± 0.0 |
| wayfarer | **+4.0 ± 3.0** | +114.4 ± 183.1 | +85.5 ± 366.4 | **-7,498 ± 4,333** | +0.0 ± 0.0 |
| castle | **+3.6 ± 3.0** | **+2,469 ± 400.2** | **+7,599 ± 1,503** | **-49,960 ± 8,364** | +0.0 ± 0.0 |
| pavilion | +3.8 ± 6.5 | **+1,003 ± 561.4** | **+2,341 ± 912.8** | **-17,547 ± 13,214** | +0.0 ± 0.0 |
| veil | **-6.6 ± 5.2** | **+1,976 ± 673.5** | **+2,730 ± 948.8** | **+13,010 ± 9,747** | +0.0 ± 0.0 |
| sanctuary | -0.8 ± 3.9 | **+643.0 ± 505.5** | **+1,602 ± 928.5** | -1,274 ± 9,073 | +0.0 ± 0.0 |
| atelier | +1.6 ± 5.8 | **+1,680 ± 686.5** | **+3,784 ± 1,574** | -11,657 ± 17,147 | +0.0 ± 0.0 |

---

### houses-plateau

What each Cycle-1 house earns once it's built up: cycle 1 played to the win, then 26 post-debt weeks (the bot now buys decor and drinks). Pair with houses-all (weeks to pay off): cheaper houses should pay off faster but earn less here.

scenario **plateau** · 12 seeds from 1 · 160s · 2026-11-17T16:46

| variant | n | total | net | income | upkeep | perLady | served | sat | staff | repGain |
|---|---|---|---|---|---|---|---|---|---|---|
| lantern | 12 | 6,160 | 5,977 | 10,078 | 518 | 302 | 33 | 80 | 12 | 9.4 |
| onsen | 12 | 4,217 | 4,217 | 6,130 | 440 | 277 | 27 | 79 | 11 | 14 |
| hollow | 12 | 8,298 | 8,298 | 11,991 | 623 | 348 | 37 | 79 | 16 | 14 |
| tankard | 12 | 3,315 | 3,315 | 4,713 | 351 | 176 | 28 | 75 | 9.8 | 20 |
| wayfarer | 12 | 4,407 | 4,407 | 6,940 | 501 | 383 | 34 | 79 | 11 | 11 |
| castle | 12 | 17,906 | 17,906 | 23,538 | 863 | 356 | 40 | 81 | 21 | 13 |
| pavilion | 12 | 12,774 | 12,450 | 18,233 | 630 | 535 | 35 | 86 | 13 | 16 |
| veil | 12 | 8,394 | 8,394 | 10,478 | 359 | 134 | 32 | 78 | 15 | 15 |
| sanctuary | 12 | 7,478 | 7,478 | 10,991 | 564 | 621 | 33 | 80 | 11 | 1.6 |
| atelier | 12 | 15,015 | 15,015 | 18,242 | 594 | 475 | 37 | 83 | 15 | 9.1 |

---

### guild

Adventurers' Guild: a full first cycle at the Lantern without the guild, with the default guild player, with Sam always going, with fighters picked by power, and with up to 2 contracts and 3 ladies away. First pass: contract gold/work/risk in data/guild/base.json are untuned.

scenario **campaign** · 10 seeds from 1 · 26s · 2026-11-17T16:47

| variant | n | weeksToWin | winRate | midAt | lateAt | netEarly | netMid | netLate | worth13 | worth20 | missed | rep | staff | sat | left | over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| no guild | 10 | 28 | 1.0 | 4.0 | 15 | 728 | 805 | 2,144 | -19,423 | -8,212 | 0.0 | 53 | 12 | 65 | 0.3 | 0.0 |
| guild (default) | 10 | 26 | 1.0 | 4.2 | 12 | 745 | 926 | 1,925 | -17,613 | -6,203 | 0.0 | 53 | 11 | 66 | 0.1 | 0.0 |
| Sam always goes | 10 | 25 | 1.0 | 4.2 | 12 | 740 | 987 | 2,213 | -16,230 | -3,272 | 0.0 | 54 | 11 | 67 | 0.1 | 0.0 |
| fighters | 10 | 26 | 1.0 | 4.2 | 12 | 745 | 926 | 1,959 | -17,512 | -5,874 | 0.0 | 54 | 11 | 66 | 0.1 | 0.0 |
| busy guild | 10 | 26 | 1.0 | 4.2 | 12 | 745 | 926 | 1,966 | -17,613 | -6,203 | 0.0 | 54 | 11 | 66 | 0.2 | 0.0 |

Paired Δ vs **no guild** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| guild (default) | -1.9 ± 4.4 | +120.7 ± 312.2 | -219.0 ± 413.1 | +2,009 ± 5,666 | +0.0 ± 0.0 |
| Sam always goes | -2.8 ± 4.6 | +181.6 ± 323.5 | +69.1 ± 620.8 | +4,940 ± 5,996 | +0.0 ± 0.0 |
| fighters | -2.0 ± 4.4 | +120.7 ± 312.2 | -184.7 ± 427.1 | +2,339 ± 5,684 | +0.0 ± 0.0 |
| busy guild | -2.1 ± 4.3 | +120.7 ± 312.2 | -177.5 ± 387.8 | +2,009 ± 5,666 | +0.0 ± 0.0 |

Per job (no guild; per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| job | lady-weeks | rest% | earned | wage | net | served |
|---|---|---|---|---|---|---|
| courtesan | 886 | 0 | 610 | 37 | 573 | 7.1 |
| dancer | 128 | 0 | 377 | 40 | 337 | 0.0 |
| bartender | 240 | 0 | 195 | 31 | 164 | 0.0 |
| madame | 183 | 0 | 139 | 40 | 99 | 1.1 |
| attendant | 296 | 0 | 79 | 37 | 42 | 1.7 |
| security | 90 | 0 | 59 | 23 | 36 | 0.0 |
| maid | 334 | 0 | 8 | 35 | -27 | 0.0 |
| promoter | 282 | 0 | 5 | 35 | -30 | 0.0 |

---

### sam-focus

Sam's weekly focus over a whole first cycle (Lantern): week the debt is cleared and income per phase. Spare actions stay on rest.

scenario **campaign** · 16 seeds from 1 · 64s · 2026-11-17T16:48

| variant | n | weeksToWin | netEarly | netMid | netLate | worth20 | rep | trust | sat | left | unhandled |
|---|---|---|---|---|---|---|---|---|---|---|---|
| base | 16 | 27 | 675 | 856 | 1,950 | -6,474 | 53 | 59 | 65 | 0.1 | 0.1 |
| auto | 16 | 27 | 675 | 856 | 1,950 | -6,474 | 53 | 59 | 65 | 0.1 | 0.1 |
| office | 16 | 28 | 675 | 821 | 1,969 | -8,571 | 51 | 57 | 63 | 0.1 | 0.2 |
| floor | 16 | 28 | 502 | 715 | 1,923 | -8,337 | 54 | 59 | 65 | 0.2 | 0.1 |
| watch | 16 | 27 | 616 | 953 | 2,184 | -6,318 | 54 | 62 | 65 | 0.0 | 0.0 |
| classes | 16 | 28 | 582 | 858 | 2,108 | -9,709 | 55 | 61 | 66 | 0.1 | 0.1 |
| rest | 16 | 30 | 562 | 835 | 2,070 | -10,181 | 52 | 59 | 65 | 0.1 | 0.1 |

Paired Δ vs **base** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| auto | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| office | +1.6 ± 2.0 | -34.3 ± 91.4 | +19.1 ± 355.9 | -2,097 ± 3,112 | +0.0 ± 0.0 |
| floor | +1.2 ± 2.8 | -140.1 ± 234.5 | -27.1 ± 379.5 | -1,863 ± 3,529 | +0.0 ± 0.0 |
| watch | +0.4 ± 3.6 | +97.9 ± 236.2 | +234.2 ± 392.2 | +155.4 ± 4,835 | +0.0 ± 0.0 |
| classes | +1.0 ± 3.5 | +2.7 ± 159.1 | +158.2 ± 410.1 | -3,235 ± 3,970 | +0.0 ± 0.0 |
| rest | **+3.1 ± 2.6** | -20.2 ± 144.6 | +119.8 ± 428.3 | -3,708 ± 4,411 | +0.0 ± 0.0 |

---

### partners

Starting partner: a full first cycle at the Lantern with each cycle-1 partner.

scenario **campaign** · 12 seeds from 1 · 54s · 2026-11-17T16:49

| variant | n | weeksToWin | winRate | midAt | lateAt | netEarly | netMid | netLate | worth13 | worth20 | missed | rep | staff | sat | left | over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | 12 | 26 | 1.0 | 4.1 | 12 | 716 | 866 | 1,983 | -18,088 | -6,477 | 0.0 | 53 | 11 | 65 | 0.1 | 0.0 |
| kaede | 12 | 26 | 1.0 | 4.1 | 12 | 716 | 866 | 1,983 | -18,088 | -6,477 | 0.0 | 53 | 11 | 65 | 0.1 | 0.0 |
| nerys | 12 | 21 | 1.0 | 4.3 | 8.5 | 1,031 | 1,554 | 2,485 | -11,742 | 2,457 | 0.0 | 54 | 11 | 73 | 0.1 | 0.0 |
| elowen | 12 | 27 | 1.0 | 4.4 | 14 | 556 | 847 | 2,061 | -19,525 | -9,279 | 0.0 | 55 | 11 | 65 | 0.0 | 0.0 |
| adelheid | 12 | 34 | 1.0 | 7.9 | 21 | 179 | 750 | 1,859 | -22,057 | -17,121 | 0.0 | 51 | 10 | 61 | 0.3 | 0.0 |
| marisol | 12 | 32 | 1.0 | 4.8 | 18 | 342 | 612 | 1,943 | -21,665 | -15,742 | 0.0 | 55 | 11 | 61 | 0.1 | 0.0 |
| lirael | 12 | 32 | 1.0 | 5.4 | 17 | 320 | 723 | 1,897 | -21,643 | -14,255 | 0.0 | 52 | 11 | 62 | 0.1 | 0.0 |
| anael | 12 | 28 | 1.0 | 3.9 | 13 | 646 | 973 | 2,034 | -18,012 | -5,821 | 0.1 | 52 | 11 | 67 | 0.1 | 0.0 |

Paired Δ vs **base** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| kaede | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| nerys | **-5.1 ± 4.5** | **+687.6 ± 350.6** | +502.4 ± 711.3 | **+8,933 ± 7,113** | +0.0 ± 0.0 |
| elowen | +1.1 ± 3.2 | -18.6 ± 251.6 | +77.6 ± 372.8 | -2,802 ± 4,460 | +0.0 ± 0.0 |
| adelheid | **+7.9 ± 3.4** | -116.5 ± 357.5 | -123.6 ± 287.4 | **-10,644 ± 4,038** | +0.0 ± 0.0 |
| marisol | **+5.8 ± 3.3** | **-254.1 ± 253.0** | -40.5 ± 382.7 | **-9,265 ± 3,263** | +0.0 ± 0.0 |
| lirael | **+5.4 ± 3.9** | -143.3 ± 294.1 | -86.2 ± 414.2 | **-7,778 ± 4,219** | +0.0 ± 0.0 |
| anael | +1.7 ± 5.3 | +107.1 ± 378.1 | +51.4 ± 563.3 | +655.5 ± 6,909 | +0.0 ± 0.0 |

Per named (base; per lady-week, pooled; earned = her own ledger, not what she draws in for others):

| named | lady-weeks | rest% | earned | wage | net | served |
|---|---|---|---|---|---|---|
| nerys | 86 | 9 | 2,515 | 65 | 2,450 | 8.6 |
| hinata | 26 | 8 | 718 | 61 | 657 | 8.2 |
| anael | 99 | 11 | 609 | 66 | 542 | 4.9 |
| elowen | 79 | 10 | 536 | 57 | 479 | 5.1 |
| kaede | 315 | 17 | 459 | 0 | 459 | 3.9 |
| marisol | 66 | 35 | 392 | 65 | 327 | 3.8 |
| mira | 315 | 7 | 229 | 33 | 197 | 1.6 |
| adelheid | 153 | 8 | 141 | 65 | 76 | 1.0 |
| lirael | 33 | 3 | 1 | 47 | -47 | 0.0 |

---

### walk-partners

Walk pacing: a first cycle at the Lantern with walks as Sam's spare action. 'partners' = partners found on walks this cycle (30% / 10% / 5% a walk, cap 3). Expect the first in a few walks and all 3 in most runs by the end of the cycle.

scenario **campaign** · 12 seeds from 1 · 15s · 2026-11-17T16:49

| variant | n | weeksToWin | partners | netMid | worth20 |
|---|---|---|---|---|---|
| walks | 12 | 28 | 2.8 | 885 | -9,096 |
| walks, stop at 30 | 12 | 27 | 2.8 | 885 | -9,096 |

Paired Δ vs **walks** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| walks, stop at 30 | **-1.2 ± 1.1** | +0.0 ± 0.0 | **-59.1 ± 54.2** | +0.0 ± 0.0 | +0.0 ± 0.0 |
