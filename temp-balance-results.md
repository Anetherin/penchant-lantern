# Balance Test Results (`feat/guild-contracts` · Round 2)

Run on 2026-11-17 at commit `62e92f4` (*Balance round 2: guild day rates and bonuses, more lady income and upkeep, night incidents, promoter fills spare rooms*).

## 1. Build & Smoke Checks

- `node tools/build.mjs`: built `dist/hollowmere-nights.html` (46 scripts + 27 data files, 3146 KB).
- `node tools/smoke.mjs 30`:
  - `index.html`: reached week 31, 3 workers, 91987g, no errors.
  - `dist/hollowmere-nights.html`: reached week 31, 3 workers, 85869g, no errors.

## 2. Balance Intent Checks (`node tools/lab/check.mjs`)

**5 PASS · 8 FAIL · 1 WARN** (vs 4 PASS · 8 FAIL · 2 WARN in round 1)

- **PASS**:
  - `cycle1-winnable` (`c1-baseline`, **now passing**): `winRate` `1.00` (≥ 0.95), `weeksToWin` `36.9` (in `[20, 45]`), `missed` `0.13` (≤ 0.2).
  - `tidiness-penalty-below-30` (`tidiness`): `-229` mid, `-513` late.
  - `ngpp-harder-still` (`ngpp`, **now passing**): `+7.30` weeks vs NG+.
  - `cheap-houses-pay-off-faster` (`houses-all`): `-5.30` weeks.
  - `premium-houses-earn-more-later` (`houses-plateau`): `+5,592` net.
- **FAIL**:
  - `tidiness-neutral-70` (`tidiness`): mid tidy 60 Δtotal `-37.1 ± 37.5` (`-7.60%` of 488, exceeds `≤ 5%`); late passes (`-1.22%`).
  - `promoter-pays` (`promoter-value`): adding a promoter still loses money (`-139 ± 64.0` early Lantern, `-210 ± 108` mid Lantern, `-108 ± 129` early Hollow, `-167 ± 196` mid Hollow).
  - `security-stops-incidents` (`security-value`): cuts mid unhandled incidents (`-0.09 ± 0.05`), `0.00 ± 0.00` late; mid Δtotal `-253 ± 118` (WARN), late Δtotal `+90.8 ± 148` (PASS).
  - `demons-top-courtesans` (`races-courtesan`): demons rank #3 mid (`39.8` vs android `55.7`) and #4 late (`68.5` vs android `81.3`).
  - `demons-poor-off-service` (`race-jobs`): demon promoter (`+6.43`), bartender (`+63.2`), and security (`+22.6`) outperformed human; only host (`-179`) passed.
  - `sam-actions-balanced` (`sam-actions-campaign`): `scout`, `rounds`, `date`, `rest`, `trainStat`, `trainSkill`, and `trainService` all pass (`|x| ≤ 3`); only `walk` (`-6.69 ± 2.39`) fails.
  - `ngplus-a-bit-harder` (`ngplus-carry`): `ngRatio` passes (`1.47`), 3 and 5 lovers pass (`0.92` winRate), but base (`0.75`), 0 (`0.17`), 1 (`0.67`), and 2 (`0.42`) lovers fail `winRate ≥ 0.9`.
  - `ngplus-lovers-neutral` (`ngplus-carry`): carrying 3 or 5 lovers clears `-17.8` / `-18.4` weeks faster than 1 lover (target `|x| ≤ 4`).
- **WARN**:
  - `ngplus-slow-climb` (`ngplus-cycles`): `c5weeks` all `46.8` / home `30.2`, `c5over` all `0.20` (home `0.00` PASS).

## 3. Guild (`tools/lab/exp/guild.json`, 10 seeds)

| variant | weeksToWin | winRate | netEarly | netMid | netLate | worth20 | Δ weeksToWin | Δ netMid | Δ netLate |
|---|---|---|---|---|---|---|---|---|---|
| no guild | 37 | 1.0 | 522 | 585 | 1,590 | -17,101 | – | – | – |
| guild (default) | 37 | 1.0 | 479 | 531 | 1,006 | -15,412 | +0.8 ± 4.2 | -54.1 ± 171.9 | **-583.5 ± 256.8** |
| Sam always goes | 34 | 1.0 | 472 | 475 | 1,051 | -15,599 | -2.4 ± 4.3 | -110.6 ± 169.9 | **-538.7 ± 238.1** |
| fighters | 38 | 1.0 | 468 | 454 | 1,061 | -16,642 | +1.4 ± 4.8 | -131.1 ± 134.4 | **-529.0 ± 217.3** |
| busy guild | 36 | 1.0 | 479 | 549 | 1,065 | -15,799 | -0.1 ± 4.8 | -36.9 ± 167.2 | **-525.0 ± 336.4** |

- Huge improvement over round 1: `guild (default)` now matches `no guild` on `weeksToWin` (`37`, 1.0 winRate) and beats it on `worth20` (`+1,690`), with `Sam always goes` clearing in `34` weeks.
- In `c1-baseline`, the `guild` job now credits `144` earned / `109` net per lady-week (`902` lady-weeks), sitting right between `dancer` (`156` net) and `bartender` (`88` net).

## 4. Sam's Weekly Focus (`tools/lab/exp/sam-focus.json`, 16 seeds)

| variant | weeksToWin | netEarly | netMid | netLate | worth20 | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 |
|---|---|---|---|---|---|---|---|---|---|
| base / auto | 37 | 498 | 511 | 1,054 | -16,023 | – | – | – | – |
| office | 37 | 498 | 516 | 1,016 | -16,771 | +0.4 ± 1.1 | +4.1 ± 25.5 | -38.4 ± 77.1 | -747.5 ± 855.9 |
| floor | 33 | 427 | 422 | 929 | -15,068 | **-4.0 ± 2.7** | **-89.4 ± 88.5** | -124.8 ± 249.1 | +955.8 ± 2,486 |
| watch | 43 | 429 | 468 | 1,011 | -18,541 | +6.1 ± 8.0 | -43.2 ± 54.2 | -43.1 ± 171.3 | **-2,517 ± 2,019** |
| classes | 42 | 405 | 413 | 1,272 | -18,167 | +4.9 ± 8.3 | **-98.5 ± 77.7** | +217.8 ± 232.7 | **-2,143 ± 1,306** |
| rest | 53 | 417 | 386 | 958 | -19,243 | **+16.2 ± 12.2** | **-125.7 ± 83.2** | -79.0 ± 159.4 | **-3,220 ± 1,731** |

- `floor` is now the fastest focus (`33` wks, **-4.0 ± 2.7**), `office` / `auto` tie at `37` wks, while `classes` (`42` wks, **-98.5 netMid**, **-2,143 worth20**) and `watch` (`43` wks, **-2,517 worth20**) lag behind `office` in cycle-1 speed.
