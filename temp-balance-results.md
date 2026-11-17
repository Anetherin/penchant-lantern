# Balance Test Results (`feat/guild-contracts`)

Run on 2026-11-17 at commit `9587280` (after fixing the global `const GB` collision between `js/logic/guild.js` and `js/logic/goddess.js` by renaming `GB` → `GDB` in `js/logic/guild.js`).

## 1. Build & Smoke Checks

- `node tools/build.mjs`: built `dist/hollowmere-nights.html` (46 scripts + 27 data files, 3133 KB).
- `node tools/smoke.mjs 30`:
  - `index.html`: reached week 31, 3 workers, 94972g, no errors.
  - `dist/hollowmere-nights.html`: reached week 31, 3 workers, 81443g, no errors.
- `node tools/story-check.mjs`: ok (15 partner intros, 15 house stories, 19 arcs, 19 after-stories).
- `node tools/goddess-smoke.mjs`:
  - `index.html`: reached week 186, 1 workers, 3414g, no errors.
  - `dist/hollowmere-nights.html`: reached week 186, 1 workers, 3289g, no errors.

## 2. Balance Intent Checks (`node tools/lab/check.mjs`)

**4 PASS · 8 FAIL · 2 WARN**

- **PASS**: `tidiness-neutral-70`, `tidiness-penalty-below-30`, `cheap-houses-pay-off-faster`, `premium-houses-earn-more-later`.
- **FAIL**:
  - `cycle1-winnable` (`c1-baseline`): `winRate` `0.94` (< 0.95), `weeksToWin` `46.1` (> 45), `missed` `0.31` (> 0.2).
  - `promoter-pays` (`promoter-value`): adding a promoter loses money in early/mid Lantern and Hollow (`-74.7 ± 48.5` early Lantern, `-41.2 ± 62.0` mid Lantern, `-123 ± 123` early Hollow, `-132 ± 241` mid Hollow) and drops `repGain` (`-6.2` to `-22.1`).
  - `security-stops-incidents` (`security-value`): cuts mid unhandled incidents slightly (`-0.10 ± 0.08`), `0.00 ± 0.00` late, while costing `-159 ± 81.8` total/wk mid.
  - `demons-top-courtesans` (`races-courtesan`): demons rank #1 mid (`37.9` perLady) but #2 late (`76.4` vs android `77.4`).
  - `demons-poor-off-service` (`race-jobs`): demon bartender outperformed human bartender (`+14.1` Δtotal).
  - `sam-actions-balanced` (`sam-actions-campaign`): `walk` clears debt `-13.0 ± 8.3` weeks faster than base and `rounds` `-6.63 ± 8.39`, while `orgy` (`+9.25 ± 9.60`) and `demo` (`+7.19 ± 11.5`) are much slower.
  - `ngplus-a-bit-harder` (`ngplus-carry`): NG+ ratio `1.72` (target `[1, 1.5]`), base `winRate` `0.50` (target `≥ 0.9`).
  - `ngplus-lovers-neutral` (`ngplus-carry`): carrying 3 or 5 lovers adds `+11.4` / `+20.9` weeks vs 1 lover (target `|x| ≤ 4`).
- **WARN**: `ngplus-slow-climb` (`c5weeks` 34.4 / 35.2), `ngpp-harder-still` (`+16.9` weeks vs NG+).

## 3. Guild (`tools/lab/exp/guild.json`, 10 seeds)

| variant | weeksToWin | winRate | netEarly | netMid | netLate | worth20 | Δ netMid vs no guild | Δ netLate vs no guild |
|---|---|---|---|---|---|---|---|---|
| no guild | 43 | 0.9 | 506 | 639 | 1,417 | -16,878 | – | – |
| guild (default) | 48 | 0.9 | 435 | 421 | 1,057 | -19,214 | **-218.1 ± 64.1** | **-360.6 ± 360.4** |
| Sam always goes | 37 | 1.0 | 456 | 540 | 1,202 | -16,941 | **-99.6 ± 91.4** | -215.4 ± 482.8 |
| fighters | 40 | 1.0 | 435 | 451 | 1,160 | -19,236 | **-187.9 ± 57.5** | -257.0 ± 412.5 |
| busy guild | 48 | 0.9 | 435 | 423 | 969 | -19,173 | **-216.3 ± 79.9** | **-447.9 ± 380.4** |

- Sending ladies on contracts currently hurts mid/late cashflow significantly (and `guild` job shows `0` earned / `-37` net per lady-week in `c1-baseline` because contract payouts are not credited to individual lady ledgers).

## 4. Backgrounds / Pasts (`tools/lab/exp/pasts.json`, 12 seeds)

| variant | weeksToWin | winRate | netEarly | netMid | netLate | worth20 | Δ weeksToWin | Δ netMid |
|---|---|---|---|---|---|---|---|---|
| base / salaryman | 47 | 0.9 | 432 | 432 | 1,082 | -19,154 | – | – |
| courier | 37 | 1.0 | 471 | 504 | 1,299 | -17,989 | -9.5 ± 10.6 | **+71.7 ± 45.3** |
| planner | 40 | 1.0 | 460 | 467 | 1,120 | -19,049 | -6.2 ± 9.4 | +34.6 ± 38.4 |
| massage | 41 | 1.0 | 444 | 462 | 1,211 | -19,107 | -5.4 ± 10.7 | +29.7 ± 44.3 |
| concierge | 42 | 1.0 | 447 | 457 | 1,301 | -19,298 | -4.8 ± 8.8 | +24.6 ± 40.0 |
| tutor | 42 | 1.0 | 446 | 478 | 1,080 | -19,177 | -4.9 ± 8.7 | **+46.3 ± 32.9** |
| support | 43 | 1.0 | 453 | 484 | 1,140 | -19,559 | -3.7 ± 8.9 | **+51.6 ± 36.1** |
| gym | 51 | 0.8 | 496 | 436 | 1,194 | -19,563 | +4.6 ± 11.5 | +3.8 ± 59.1 |
| bartender | 53 | 0.8 | 467 | 461 | 1,021 | -19,515 | +6.0 ± 16.2 | +29.2 ± 50.4 |

- `courier` is the strongest past overall (also **+217.1 ± 210.6** `netLate` and **+1,166 ± 1,098** `worth20` vs base).

## 5. Sam's Weekly Focus & Rest-Day Actions

- **Weekly Focus (`sam-focus`, 16 seeds)**:
  - `classes`: `37` wks (**`-8.9 ± 7.3`**), **Δ netMid `+57.8 ± 40.7`**, **Δ netLate `+448.9 ± 233.8`**.
  - `floor`: `40` wks (`-5.8 ± 8.1`), but cuts house net (**`-113.3 ± 66.0`** mid, **`-418.3 ± 191.5`** late) and raises staff departures (`0.8` left).
  - `auto` / `base`: `46` wks. `office`: `49` wks.
  - `rest`: `67` wks (**`+20.7 ± 13.7`**, **+0.3 over**). `watch`: `70` wks (**`+23.8 ± 14.7`**, **+0.4 over**).
- **Rest-Day Actions (`sam-actions-campaign` & `sam-actions`, 16 seeds)**:
  - `walk`: `33` wks (**`-13.0 ± 8.3`**), **Δ netMid `+106.5 ± 79.6`**, **Δ netLate `+765.4 ± 582.6`**; in mid-phase isolation **+322.0 ± 237.5** total/wk.
  - `rounds`: `40` wks (`-6.6 ± 8.4`), **+56.9 netMid**, **+253.0 netLate**, +trust.
  - `scout`: `43` wks, **+57.3 netMid**.
  - `date` (`44`), `trainSkill` (`44`), `trainStat` (`45`), `base`/`rest` (`46`).
  - `trainService` (`48` wks, **-41.8 early**, **-150.5 late**), `demo` (`53` wks), `orgy` (`55` wks, **-164.9 late**).

## 6. Jobs, Races, and Houses

- **Jobs (`jobs-all`, 16 seeds)**:
  - Mid-game Δtotal vs base: `host` (**+131.7 ± 112.7**), `madame` (**+111.3 ± 109.2**, though `-32.0` net after Sam's cut), `promoter` (`+56.9`), `courtesan` (`+39.8`), `maid` (`+36.8`), `bartender` (`+32.6`), `dancer` (`+27.8`), `attendant` (`+18.6`), `bath` (`+7.1`), `chapel` (`-58.9`), `security` (`-71.2`), `teacher` (**-87.4 ± 85.1**).
  - Late-game Δtotal vs base: `madame` (**+226.5 ± 186.4**, **-140.6 net**), `host` (`+20.8`), `bath` (`+1.3`, **+14.0 perLady**), `maid` (`-2.5`), `attendant` (`-14.8`), `courtesan` (`-59.5`), `bartender` (`-69.2`), `dancer` (`-70.1`), `promoter` (`-93.7`), `security` (**-130.3**), `chapel` (**-148.0**), `teacher` (**-215.7**).
- **Races (`races` & `races-courtesan`, 16 / 12 seeds)**:
  - `android` (**+473.9 ± 236.4** total late, **+58.3 ± 29.0** perLady) and `spirit` (**+392.4 ± 173.0** total late, **+13.7 sat** in courtesan test) lead late-game by a wide margin.
  - Beastkin (`fox` **+126.3**, `rabbit` **+119.8**, `cat` **+95.7** late) and `dwarf` (`+90.6` late) sit in the middle tier.
  - `demon` leads non-android `perLady` (`+18.3` mid, `+40.8` late) but loses mid total (**-111.7 ± 64.9**) and has higher `left` (`+0.4` late).
- **Houses (`houses-all` & `houses-plateau`, 12 seeds)**:
  - Campaign `weeksToWin` (winRate): `sanctuary` `41` (0.9), `pavilion` `46` (0.9), `veil` `46` (0.8), `lantern` `47` (0.9), `tankard` `47` (0.9), `wayfarer` `52` (0.8), `hollow` `57` (0.8), `atelier` `61` (0.7), `onsen` `67` (0.6), `castle` `82` (0.3).
  - Plateau net (26 post-debt weeks): `castle` `13,151`, `atelier` `10,121`, `veil` `7,818`, `hollow` `7,514`, `pavilion` `5,583`, `sanctuary` `4,689`, `onsen` `2,971`, `wayfarer` `2,892`, `lantern` `2,354`, `tankard` `1,934`.
