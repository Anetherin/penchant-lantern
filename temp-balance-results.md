# Balance Test Results (`main` · `1b2f37b`)

Run on 2026-11-17 on branch `feat/balance-tuning` (branched from `main` at `1b2f37b`).

## 1. Build & Smoke Checks

- `node tools/build.mjs`: built `dist/hollowmere-nights.html` (46 scripts + 27 data files, 3155 KB).
- `node tools/smoke.mjs 30`:
  - `index.html`: reached week 31, 3 workers, 82838g, no errors.
  - `dist/hollowmere-nights.html`: reached week 31, 3 workers, 91638g, no errors.
- `node tools/goddess-smoke.mjs`:
  - `index.html`: reached week 186, 1 workers, 3214g, no errors.
  - `dist/hollowmere-nights.html`: reached week 186, 1 workers, 3206g, no errors.

## 2. Balance Intent Checks (`node tools/lab/check.mjs`)

**7 PASS · 5 FAIL · 2 WARN**

- **PASS**:
  - `cycle1-winnable` (`c1-baseline`): `winRate` `1.00` (≥ 0.95), `weeksToWin` `36.6` (in `[20, 45]`), `missed` `0.00` (≤ 0.2).
  - `tidiness-neutral-70` (`tidiness`, **now passing**): mid `-2.93%`, late `-2.24%`.
  - `tidiness-penalty-below-30` (`tidiness`): `-221` mid, `-566` late.
  - `security-stops-incidents` (`security-value`, **now passing**): cuts trouble `-0.41 ± 0.13` mid / `-0.80 ± 0.13` late; `+95.1 ± 105` total mid, `+154 ± 82.8` total late.
  - `demons-poor-off-service` (`race-jobs`, **now passing**): demon promoter (`-5.56`), bartender (`-53.8`), host (`-318`), security (`-101`) all cost more than human.
  - `ngplus-lovers-neutral` (`ngplus-carry`, **now passing**): `ngWeeks` `[3]-[1]` `0.58`, `[5]-[1]` `1.58` (within `|x| ≤ 4`).
  - `premium-houses-earn-more-later` (`houses-plateau`): `+6,558` net.
- **FAIL**:
  - `promoter-pays` (`promoter-value`): `0.00 ± 0.00` on both `Δ total` and `Δ repGain` for Lantern and Hollow (the experiment/setup produced identical runs between `+promoter` and `base`).
  - `demons-top-courtesans` (`races-courtesan`): demons rank #2 mid (`46.0` vs `beastkin/rabbit` `47.2`) and #2 late (`79.1` vs `android` `96.8`).
  - `sam-actions-balanced` (`sam-actions-campaign`): `rounds` (`+4.13 ± 8.05`) and `walk` (`-6.63 ± 2.87`) fall outside `|x| ≤ 3`; `scout`, `date`, `rest`, `trainStat`, `trainSkill`, `trainService` pass.
  - `ngplus-a-bit-harder` (`ngplus-carry`): all `winRate`s now pass (`0.92`–`1.00`), but `ngRatio` is `0.93` (below `[1, 1.5]`).
  - `cheap-houses-pay-off-faster` (`houses-all`): `+7.48` weeks (starters took longer than premiums).
- **WARN**:
  - `ngplus-slow-climb` (`ngplus-cycles`): `c5weeks` all `35.5` (PASS), home `28.8` (WARN), `c5over` `0.09` / `0.00` (PASS).
  - `ngpp-harder-still` (`ngpp`): `+35.2` weeks vs NG+ (exceeds `< 15` cap).

## 3. Guild (`tools/lab/exp/guild.json`, 10 seeds)

| variant | weeksToWin | winRate | netEarly | netMid | netLate | worth20 | Δ weeksToWin | Δ netMid | Δ netLate |
|---|---|---|---|---|---|---|---|---|---|
| no guild | 35 | 1.0 | 522 | 662 | 1,810 | -16,171 | – | – | – |
| guild (default) | 38 | 1.0 | 477 | 479 | 1,136 | -16,770 | +2.9 ± 5.1 | **-182.5 ± 119.7** | **-674.4 ± 321.0** |
| Sam always goes | 33 | 1.0 | 469 | 450 | 1,273 | -15,613 | -1.9 ± 4.5 | **-212.4 ± 121.9** | **-537.5 ± 278.8** |
| fighters | 37 | 1.0 | 467 | 458 | 1,264 | -17,405 | +2.2 ± 4.5 | **-203.6 ± 101.7** | **-546.1 ± 327.4** |
| busy guild | 38 | 1.0 | 477 | 493 | 1,086 | -17,148 | +2.5 ± 4.6 | **-168.5 ± 117.6** | **-723.9 ± 260.8** |

- In `c1-baseline`, the `guild` job averages `140` earned / `106` net per lady-week (`780` lady-weeks).

## 4. Sam's Weekly Focus (`tools/lab/exp/sam-focus.json`, 16 seeds)

| variant | weeksToWin | netEarly | netMid | netLate | worth20 | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 |
|---|---|---|---|---|---|---|---|---|---|
| base / auto | 37 | 493 | 484 | 1,244 | -16,407 | – | – | – | – |
| office | 39 | 493 | 475 | 1,122 | -17,118 | +1.9 ± 2.6 | -8.1 ± 47.5 | -122.7 ± 182.7 | -711.1 ± 1,303 |
| floor | 33 | 459 | 429 | 946 | -16,156 | **-3.3 ± 3.0** | -54.2 ± 93.5 | **-298.2 ± 193.3** | +251.5 ± 2,145 |
| watch | 42 | 433 | 487 | 1,202 | -18,276 | +4.9 ± 9.3 | +3.1 ± 107.7 | -45.0 ± 246.0 | **-1,869 ± 1,864** |
| classes | 35 | 413 | 545 | 1,410 | -16,627 | -1.4 ± 3.8 | +61.5 ± 91.4 | +165.2 ± 272.4 | -220.1 ± 2,372 |
| rest | 43 | 448 | 493 | 1,073 | -17,419 | +6.5 ± 7.6 | +9.9 ± 82.0 | -171.1 ± 227.8 | -1,011 ± 2,218 |

- `floor` (`33` wks, **-3.3 ± 3.0**), `classes` (`35` wks, `-1.4 ± 3.8`), `base`/`auto` (`37` wks), and `office` (`39` wks) are much closer together now, with `classes` leading `netMid` (`545`) and `netLate` (`1,410`).

## 5. Walk Pacing (`tools/lab/exp/walk-partners.json`, 12 seeds)

| variant | n | weeksToWin | partners | netMid | worth20 | Δ weeksToWin | Δ netLate |
|---|---|---|---|---|---|---|---|
| walks | 12 | 30 | 2.6 | 624 | -11,175 | – | – |
| walks, stop at 30 | 12 | 28 | 2.5 | 624 | -11,175 | **-2.3 ± 1.9** | **-74.2 ± 65.7** |

- Finding partners on walks averages `2.5–2.6` partners per cycle (out of cap 3) and clears the debt in `28–30` weeks.
