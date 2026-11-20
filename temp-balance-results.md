# Balance Audit Results (`2026-11-20`)

- **Branch:** `test/balance-audit-2026-11-20`
- **Base commit:** `9136aaa28a76adab36970053db66553f893186e6` (*Feat/isolde intensity and goddess scenes (#75)*, latest `origin/main`)
- **Date:** `2026-11-20`
- **Environment & runner:** `12` logical cores (`nproc`), Node `v24.12.0`; Batches 1–3 (12 specs) ran with `--conc 10`; Batch 4 (4 multi-cycle NG+/NG++ specs) initially hit a 30s Playwright `page.waitForFunction` startup timeout under `--conc 10` during `ngplus-lovers-stacking 96/240`, so Batch 4 ran cleanly split across two `--conc 3` parallel chains (`task-255` and `task-256`).
- **Total experiment runtime:** `6,041s` (~100.7 min cumulative across all 16 specs)
- **Workspace scope:** Zero changes to `data/`, `js/`, or `tools/lab/checks.json`. Opt-in experiment controls and telemetry were added to `tools/lab/bot.js` and `tools/lab/report.mjs` (default bot behavior unchanged), plus 15 new spec files under `tools/lab/exp/`.

---

## Data Check & Smoke

- `npm run check:data`: `OK: 50 scripts, 28 data sets`
- `npm run smoke`: `index.html: reached week 31, 3 workers, 81175g. no errors`
- `node tools/goddess-smoke.mjs`: `index.html: reached week 189, 1 workers, 3824g. no errors`

---

## Intent Checks

The older single-house `npm run check` suite was not re-run; this audit focused on the 16 multi-house, incense, race/role, low-vs-high house class, cashflow, NG+, and NG++ experiments below. All 16 completed reports finished with zero `Errors` and zero `pageErrors`.

---

## Executive Summary of Findings

### 1. Incense Balancing (`incense-phases`, `incense-campaign`, `incense-niches`)

- **`calm`** has clear, distinct wins on high-trouble and low-comfort houses:
  - Cuts `trouble` significantly across phases and halves incident damage in `veil-nosec` (`42 -> 21`, `Δ trouble -1.0 ± 0.3`).
  - Speeds full `veil` Cycle-1 campaign (`28 -> 22` wks, `Δ -6.3 ± 6.0` wks; `cfHE +513.3 ± 397.8`; `worth20` swings from `-16,765` to `+3,393`).
  - Wins `tankard-straw` cleanly (`houseNet +100.0 ± 92.6`, `Δ trouble -0.3 ± 0.2`) and trims `restPct` on `spirit-courtesans` (`-2.6 ± 1.5%`) and `classroom-24w` (`-2.3 ± 1.9%`).
- **`focus`** excels at training and skill-sensitive houses:
  - Delivers the largest training boost in `classroom-24w` (`skillGain +4.0 ± 3.6`, `statGain +1.5 ± 1.3`), plus significant `skillGain` gains in `veil-nosec` (`+1.5 ± 1.0`), `spirit-courtesans` (`+0.8 ± 0.4`), and full `lantern` campaign `skillEnd` (`+2.7 ± 1.6`).
  - Produces significant `houseNet` wins in `early4 · conservatory` (`+139.2 ± 112.1`) and `late · lantern` (`+159.4 ± 136.9`, `statGain +0.4 ± 0.2`).
- **`velvet`** reliably boosts client satisfaction (`sat`) and props:
  - Significant `sat` increases in `classroom-24w` (`+3.9 ± 2.2`), `spirit-courtesans` (`+3.3 ± 1.6`), `tankard-straw` (`+3.2 ± 2.2`), and multiple phase cells (`+2.1` to `+5.9`), plus a significant `cfHL` win in the full `lantern` campaign (`+511.1 ± 500.7`).
- **`aphro`** raises proposition rate (`props`) modestly in several spots (`mid` Tankard, `early4` Veil, `mid` Conservatory), but does **not** record a statistically significant `houseNet` win in any phase, campaign, or niche scenario (even with `syncMenu: true` enabled). Instead, it increases `restPct` (`spirit-courtesans +3.3 ± 3.3%`, `early4 · veil +2.4 ± 2.0%`), hurts `mid · tankard` `sat` (`-5.3 ± 5.1`), and reduces `skillGain` in `late · veil` (`-0.5 ± 0.4`) and `veil` campaign `skillEnd` (`-1.4 ± 1.3`).
- **`amber`** reliably lowers `restPct` (`-0.8%` to `-4.7%` in significant phase cells, `-4.3 ± 1.7%` on `spirit-courtesans`, `-2.9 ± 1.1%` on `classroom-24w`), **but the `-15%` client fee penalty outweighs the extra shifts** in rich, high-fee, or amplified houses:
  - Significant `houseNet` losses appear on `early4 · veil` (`-504.3 ± 175.0`), `early4 · conservatory` (`-242.9 ± 132.3`), `mid · veil` (`-986.7 ± 535.4`), `mid · castle` (`-1,079 ± 863.0`), `mid · conservatory` (`-871.4 ± 708.5`), `late · veil` (`-1,047 ± 413.5`), `late · conservatory` (`-803.8 ± 293.5`), `veil-nosec` (`-1,109 ± 545.0`), and `beastkin-160` (`-178.6 ± 108.0`, where Beastkin `1.6×` amplification magnifies the fee cut).
  - In `incense-campaign`, `castle · amber` slows payoff by `+19.6 ± 19.3` weeks (`winRate 0.8`, `over 0.3`).
  - Even in its target stamina-starved straw-cot niches (`spirit-courtesans` and `tankard-straw`), `amber` fails to beat `none` on `houseNet` (`-22.6 ± 74.7` and `-73.7 ± 92.1`).

---

### 2. Race Balancing Across Early / Mid / Late & Roles

#### Courtesans (`race-courtesan-phases`)
- **Demons** dominate `testedNet` per lady in every phase and house class tested (`early4 · tankard` `63ⁿ11` vs `base` `19ⁿ11`; `mid · lantern` `378` vs `base` `158`; `late · lantern` `660` vs `base` `232`; `late · castle` `844` vs `base` `365`).
- **Androids** lose money vs humans in early/low-fee houses (`early4 · tankard` `testedNet 7.8ⁿ11` vs `19ⁿ11`; `late · tankard` `-23.4 ± 20.9`) because `30 + 1.5/energy` charging exceeds commoner act payouts without a Charger. At higher tiers (`mid · lantern` `279`, `Δ +121.5 ± 97.1`; `late · lantern` `430`, `Δ +197.9 ± 94.4`; `late · castle` `615`, `Δ +249.9 ± 134.3`), Androids sit clearly in second place behind Demons.
- In `late · castle`, all tested mutations reduced house-wide `houseNet` relative to `base` (`demon -1,117 ± 895.4`, `android -923.9 ± 715.5`, `elf/spirit/angel -597 to -1,089`) despite strong `testedNet` gains (`+100.5` to `+479.1`) — indicating mid-campaign prestige/arousal/roster sensitivity when swapping two established courtesans directly in late Castle.

#### Bedless Capacity vs Fixed Staff (`race-bedless-compare`)
- **With `fixedStaff: true` (no extra bedless headcount):**
  - **Spirits** (`70` max energy) stay near baseline `angel`/`angel/lantern`/`human` on `testedNet` (`late · lantern`: Spirit `245`, Angel `240`, Lantern Angel `256`, Human `232`) and trail Demons (`660`) and Androids (`430`). In `mid · atelier`, Spirit got a noisy house-level lift (`+1,091 ± 1,091`), while `testedNet` was flat (`+0.7 ± 27.7`).
  - **Androids** trail Demons at Lantern (`mid`: `992` vs `1,090` `houseNet`, `323` vs `571` `testedNet`, `testedRech 114`) and Hollow (`late`: `2,679` vs `3,012` `houseNet`, `367` vs `527` `testedNet`, `testedRech 94`), **but lead `atelier · late`** (`6,189` `houseNet`, `Δ +681.0 ± 578.0` vs Demon `5,571` `houseNet`, `+62.5 ± 562.8`) because Atelier's `-40%` charging discount halves Android `testedRech` (`50` vs `127` at Lantern).
- **With `fixedStaff: false` (bedless bonus allows +1.5 to +2.0 extra workers in `late`):**
  - At `lantern · late`, both **Spirit** (`houseNet 1,485`, `Δ +209.0 ± 193.5`, `staff +2.0 ± 0.0`) and **Android** (`houseNet 1,610`, `Δ +334.8 ± 194.9`, `staff +2.0 ± 0.0`, `recharge +255.5 ± 47.7`) overtake humans and Angels cleanly, while still trailing **Demon** (`1,788`, `Δ +512.1 ± 268.6`).
  - At `atelier · late`, `android` (`6,060`) and `spirit` (`5,897`) both top `demon` (`5,616`) on `houseNet`, though with wider CI (`+476.3 ± 481.7` / `+313.3 ± 616.7`).

#### Support Roles & Lantern vs Non-Lantern Angels (`race-roles-phases`, `race-roles-houses`)
- **Demons** suffer severe hunger-induced rest rates across non-act support jobs (`maid` 38–41%, `promoter` 38–43%, `security` 39–44%, `bartender` 39–43%, `madame` 32–44%, `chapel` 28–37%, `teacher` 40%, `host` 44–57%, `dancer` 34%, `bath` 29%), causing significant `houseNet` or `testedNet` penalties (`promoter · early4` `-103.7 ± 72.6`, `bartender · early4` `-133.9 ± 108.3`, `tankard-mid · bartender` `-140.8 ± 128.8`, `castle-mid · madame` `-701.5 ± 613.4`, `sanctuary-mid · chapel` `testedNet -19.3 ± 9.3`).
- **Androids** run `-31` to `-97` `testedNet` in almost all support roles due to `45–130g/wk` charging without client fee income (significant `houseNet` losses in `bartender · early4` `-107.2 ± 33.9`, `tankard-mid · bartender` `-154.3 ± 154.3`, `lantern-mid · teacher` `-62.8 ± 55.6`, `attendant · late` `-195.2 ± 86.0`). One exception: `host · early4` at Lantern gained `houseNet +162.0 ± 131.2` (`sat +7.3 ± 2.4`), and Lantern `host` raised `sat` in `mid` (`+2.6 ± 2.3`) and `late` (`+5.4 ± 3.2`) via zero tiredness rest.
- **Non-Lantern `angel` vs `angel/lantern` vs humans/beastkin/dwarves:**
  - Non-Lantern `angel` beats humans in isolated early/niche support cells: Lantern `chapel · early4` (`houseNet +70.0 ± 59.3`, `repGain +3.5 ± 3.3`), `security · early4` (`+64.4 ± 50.1`, `sat +2.1 ± 2.1`), `host · early4` (`+113.3 ± 88.7`, `sat +3.2 ± 2.3`, `repGain +4.1 ± 3.6`), and `chapel · late` `testedNet` (`Lantern +19.7 ± 5.5`; `Sanctuary +45.0 ± 18.6`).
  - However, non-Lantern `angel` does **not** beat humans/beastkin/dwarves consistently across `maid`, `promoter`, `bartender`, `attendant`, `madame`, `teacher` (`skillGain -2.1 ± 1.2` at Lantern), Castle `host`/`madame`, or Sanctuary `chapel` (`houseNet -202.5 ± 369.9` mid, `+15.0 ± 1,021` late).
  - Meanwhile **`angel/lantern`** beats or matches non-Lantern `angel` on `chapel` `testedNet` in both Sanctuary (`mid`: `+40.4 ± 17.4` vs `+18.1 ± 13.7`; `late`: `+57.6 ± 14.2` vs `+45.0 ± 18.6`) and Lantern (`early4`: `houseNet +116.5 ± 47.9`; `late`: `testedNet +35.1 ± 6.7` vs `+19.7 ± 5.5`), and has fewer prop penalties in `maid`/`promoter` because non-Lantern modesty reduces acts/props (`early4` props `0.1–0.5` vs `0.6–1.1` for Lantern Angel).

---

### 3. Low-Class vs High-Class House Competition (`houses-all-cf`, `houses-plateau-cf`, `house-class-compete`, `house-class-plateau`, `interactions`)

- **Full-campaign & plateau spread (`houses-all-cf`, `houses-plateau-cf`):**
  - Upper/specialized houses (`veil` 27 wks / `houseNet` 4,034, `atelier` 29 wks / 5,133, `castle` 30 wks / 5,105) pay off slightly faster and generate 3–7× the Cycle-1 `houseNet` of starters (`lantern` 31 wks / 1,264, `wayfarer` 32 wks / 1,578, `tankard` 33 wks / 729). `onsen` (`45` wks, `winRate 0.8`, `over 0.2`) and `hollow` (`38` wks, `winRate 0.9`, `over 0.1`) lag in Cycle 1.
  - At post-debt plateau (`houses-plateau-cf`, 26 wks): `castle` reaches `houseNet 14,083` (`prestige 99`), `atelier` `12,015` (`90`), `pavilion` `11,500` (`93`), `sanctuary` `9,063` (`97`), `veil` `8,957` (`44`), `hollow` `7,286` (`72`), while starters trail steeply: `lantern` `4,268`, `wayfarer` `4,099`, `onsen` `3,398`, `tankard` `2,815` (`prestige 35`).
- **Can volume + propositions + exhibitionism make low-class houses compete? (`house-class-compete`, `house-class-plateau`):**
  - `cheap-volume` (`price: 0`, `samples: true`, drinks2) **loses money across every house and phase** (`tankard` plateau `-669.4 ± 173.6`; `lantern` `-1,836 ± 481.5`; `veil` `-5,113 ± 663.1`; `castle` `-5,398 ± 1,643`), driving up turned clients (`41` at Tankard plateau vs `24`).
  - `exhib-2` / `exhib-volume` deliver genuine plateau gains (`tankard` `3,138 -> 3,937 / 3,977`, `Δ +839.2 ± 370.1`; `veil` `12,439 -> 19,537 / 19,232`, `Δ +7,098 ± 1,851`, beating `castle · base` `15,356`), **while dropping prestige (`-9.4` to `-29.3`)**.
  - However, **low-class Tankard still trails Castle by ~4–8× at plateau (`3,977` vs `15,356` base / `31,127` upscale)**, AND **`upscale` beats `exhib-volume` inside every house tested** (`tankard` `6,085` vs `3,977`; `veil` `28,384` vs `19,232`; `lantern` `9,750` vs `4,537`; `castle` `31,127` vs `16,350`). Even in Tankard, pivoting upscale (`prestige 54`) pays `+2,108g/wk` more than exhibitionist volume (`prestige 31`).
- **Choice interactions (`interactions`):** `nerys` clears 6–10 weeks faster than `kaede`/`adelheid` in Lantern (`22–23` vs `31–33`), Tankard (`23–25` vs `32–34`), and Castle (`25–26` vs `29–32`), whereas `hollow · nerys · gym` shows a sharp house/past reversal (`41` wks, `winRate 0.8`, `over 0.2`, `missed 0.9` vs `hollow · nerys · salaryman` `26` wks, `1.0` winRate).

---

### 4. Cashflow Early / Mid / Late & NG+ / NG++ Scaling

- **Early / Mid / Late Cashflow Trajectory:**
  - In Cycle 1 (`houses-all-cf`), `cfHE -> cfHM -> cfHL` scales steeply from `461 -> 534 -> 1,208` (`tankard`) and `547 -> 1,098 -> 2,146` (`lantern`) to `892 -> 3,996 -> 10,244` (`castle`) and `1,945 -> 4,576 -> 6,790` (`veil`).
  - In standard NG+ with expanding houses (`1x`/`2x` kept + new), early house cashflow (`cfHE`) is positive in C2–C3 (`280–659` Tankard, `389–1,802` Lantern, `2,085–4,722` Castle), then often compresses in C4 as multi-house upkeep + high-stacked lover cuts grow relative to C4 debt (`castle 2x` `c4cfHE` falls to `713ⁿ8`, `lantern 2x` `c4cfHE 343ⁿ10`).
  - In NG++ (`ngpp-cycles`), early Shrine house cashflow (`r1cfHE`, `r2cfHE`, `r3cfHE`) is **negative** across cold/mid/high stacks (`-10` to `-189`, except `r2cfHE +49` high-stack and `+471` `high-stack (hireFriends)`), so NG++ depends heavily on Guild contract payouts (`814–2,732g/wk`).
- **Kept Houses Scaling up to 2× Prior Cycles (`ngplus-houses-scaling`):**
  - Bringing **`home only (no new)`** makes every cycle **far easier** than `base` (`home + new`) across all three houses: `20–28` weeks across C2–C4, **`0.0` failure rate everywhere** (`Δ c2weeks -9.7` Tankard / `-22.5` Lantern / `-19.5` Castle; `Δ c3weeks -12.5` / `-8.8` / `-19.4`), because debt stays small (`32,923 -> 66,063` Tankard; `44,919 -> 83,522` Lantern).
  - Keeping **fixed 2 houses (`base`)** stays nearly flat across cycles (`tankard 35 -> 35 -> 37` wks, `0.0` over; `lantern 48 -> 33ⁿ13 -> 40ⁿ13`; `castle 40 -> 41ⁿ12 -> 37ⁿ10`) — once survivors clear C2, C3–C4 do **not** get harder on fixed houses.
  - Scaling kept houses by **`1x` (2/3/4 houses)** and **`2x` (3/5/7 houses)** drives strong C3–C4 difficulty escalation: `1x` hits `c4weeks` `73–80` (`Δ +36.1` to `+46.7` wks sig, `c4over 0.5–0.7`); `2x` hits `c4weeks` `92–104` (`c4over 0.8–1.0`, `tankard · 2x` C4 fails 9/9 survivors, `castle · 2x` reaches `497,481` debt and collapses `c4hNet -8,807 ± 1,876`). However, **`2x` briefly boosts C2 house net** on Tankard (`+691.7 ± 475.3`, `c2cfHE +170.9 ± 166.3`) and Lantern (`+952.3 ± 761.4`), and **`1x` boosts Castle C3 house net** (`+2,379 ± 2,196`) before C4 debt overwhelms it.
- **Carried Lovers `(0` vs `1x–4x)` Prior Cycles & Reincarnation Stacking (`ngplus-lovers-stacking`):**
  - Effect flips sharply across house classes:
    - **Tankard (low-fee):** More lovers becomes punishing because carried lovers trigger rising `warden/wardrobe.cut.perLover` cuts (`c4cuts` climbs `2,941` at `0 lovers` to `6,865` at `4x`). At `4x`, Tankard loses `+12.1 ± 10.6` wks in C2 (`hNet -493.9 ± 392.3`) and `+52.1 ± 22.9` wks in C4 (`83ⁿ9` wks, `c4over 0.7`, `Δ c4hNet -3,589 ± 1,831`).
    - **Lantern (mid-tier):** `0 lovers` lags early (`c2cfHE -667.0 ± 330.3`, `c2over 0.3`, `c3over 0.6`), while `3x–4x` smooths C2–C3 (`4x` `c3weeks 34ⁿ15`, `Δ -21.3 ± 20.3`, `c3over 0.0`) with `4x` C4 stabilizing around `62ⁿ15` wks / `c4over 0.3`.
    - **Castle (high-fee):** `0 lovers` near-collapses (`99` wks in C2, `c2over 0.9`, `Δ +62.9 ± 16.5` wks, `Δ c2hNet -6,975 ± 1,935`, only 1/15 seeds reaches C3), whereas **`2x–4x` strongly dominate C3** (`c3weeks 34 / 40 / 30` vs `base 81`, `Δ -49.4 / -36.9 / -52.5` wks, `c3hNet +7,284 / +4,927 / +6,940`), and `4x` clears C4 in `48ⁿ12` wks with `c4over 0.2`.
- **Guest Reincarnation Alumni (`ngplus-guest-reborn`):**
  - Returning guest alumni materially accelerate NG+ when re-hired early (`hireFriends: true`): `2g x1` cuts `c3weeks` by **`-26.0 ± 19.8`** (`c3over 0.0`), and `4g x2` cuts both `c2weeks` (**`-12.1 ± 11.0`**) and `c3weeks` (**`-26.4 ± 19.8`**) while raising `c2hNet` (`+615.0 ± 426.5`), `c3hNet` (`+2,345 ± 1,377`), and `c3rebornAvg` (`16`). With default hiring (`4g x2 (default hire)`), only ~`2.5` average rebirths appear in C2 vs `6.9` (`c2weeks -9.0 ± 11.3`, non-sig C3 gains).
  - **`4g x4`** accelerated C2 (`36` wks, `Δ -11.6 ± 10.9`, `c2hNet +754.3 ± 380.7`) and then **triggered NG++ automatically in C3 on all 15/15 surviving seeds** (because `stacks = 4 >= fullAt()` satisfies `isNGPPNext()`), explaining why its C3 metrics reflect the 1-staff Shrine (`c3cfHE -110ⁿ15`, `c3hNet 610ⁿ15`, `c3rebornAvg 6.0ⁿ15`).
- **NG++ Difficulty & Cycle Progression (`ngpp-cycles`):**
  - **`ng++ cold`** struggles and stalls (`r1`: `69` wks, `over 0.4`, `hNet 451`, `r1hNet Δ -1,813 ± 677.2`; `r2`: `82ⁿ9` wks, `over 0.7`; `r3`: `82ⁿ3` wks, `over 0.7`, only 3/16 reach `NG++3`).
  - **`ng++ mid-stack`** escalates monotonically across cycles (`35 -> 49 -> 65ⁿ13` wks; `over 0.0 -> 0.2 -> 0.4`; debt `50,000 -> 116,696 -> 177,467`) with negative early house cashflow (`r1cfHE -162 -> -78 -> -178`), **but depends 100% on Guild contract income** (`814 -> 1,124 -> 1,601g/wk`; `ng++ mid-stack (no guild)` fails 16/16 at `104` wks, `r1hNet 136`).
  - **`ng++ high-stack`** and **`ng++ high-stack (hireFriends)`** clear significantly faster than standard NG+ `base` (`28 -> 26 -> 32` wks with `0.0` failure rate vs `base` `48 -> 54 -> 80` wks and `r3over 0.7`), driven by `1,051 -> 1,851 -> 2,732g/wk` Guild earnings rather than Shrine cashflow (`r1hNet 636`, `r1cfHE -103`).

---

## Anomalies, `unreached` Runs & Code Observations

- **Runtime errors:** `0` `Errors` and `0` `pageErrors` across all 16 reports.
- **`unreached` Cycle-1 / debt-cutoff counts:**
  - `houses-plateau-cf`: `onsen` `2` (`n=10`), `atelier` `2` (`n=10`), `castle` `1` (`n=11`), `sanctuary` `1` (`n=11`).
  - `house-class-compete` (`late`), `house-class-plateau`, `incense-phases` (`late · castle`), `race-courtesan-phases` (`late · castle`): `castle` `1/12` (`n=11`).
  - `race-roles-houses`: `castle-late · host` `1/10` (`n=9`).
  - `ngplus-lovers-stacking`: `tankard` `1/16` (`n=15`) and `castle` `1/16` (`n=15`) failed Cycle 1; subsequent cycles report `ⁿK` where prior cycle hit `over: true` / failed to win inside 104 wks (`castle · 0 lovers` drops to `ⁿ1` in C3/C4; `castle · base` drops to `ⁿ13` in C3, `ⁿ4` in C4; `lantern · 0 lovers` drops to `ⁿ12` C3, `ⁿ5` C4).
  - `ngplus-houses-scaling`: `tankard` `1/16` and `castle` `1/16` unreached Cycle 1; C2 rows of `1x kept + new` intentionally match `base` (`2` houses in C2, `Δ 0.0 ± 0.0`) before diverging in C3 (`3` vs `2` houses) and C4 (`4` vs `2`).
- **Walk-partner slot fill in `race-courtesan-phases`:** In `early4 · tankard` (`testedNet` `ⁿ11`) and `early4 · castle` (`testedNet` `ⁿ10`), walk-in story partners filled the initial roster before generic hires on 1–2 seeds, leaving zero generic courtesans to mutate for `testedNet` while house-level metrics still used all `12` seeds.
- **Observed Code Behaviors (unchanged in `js/`):**
  1. **`js/logic/ngplus.js:18-23` (`isNGPPNext()`):** Unlocks/forces NG++ whenever *any* entry across `[...carriedLovers(), ...ngFriends(), ...(S.alumni||[]), ...Object.values(S.lives||{})]` has `(w.reborn || 0) >= fullAt()` (`4`). In `ngplus-guest-reborn`, `4g x4` (`stacks = 4`) unintentionally forced all 15 surviving C2 runs into NG++ in C3 even with `bindGoddess: false`.
  2. **`js/logic/ngplus.js:401-408` (NG++ alumni retention):** Generic workers re-hired during an NG++ cycle who are neither `Devoted` (`carriedLovers()`) nor `favorite` (`ngFriends()`) nor Stage 3+ vessels are omitted when building `S.alumni` for the next NG++ cycle (`ng++ high-stack (hireFriends)` `r1rebornAvg` drops `15 -> 12 -> 11` from NG++1 to NG++3).
  3. **`js/logic/week.js:444` (`menuOf`):** Courtesans check `x.menu` directly (not `offeredMenu(x)`), so passive comfort-lewd bonuses such as `aphro` (`+5`) only add newly unlocked acts if the player/UI updates `w.menu` (`syncMenu: true` was enabled in `incense-*` specs).
  4. **`js/logic/state.js:182` (drifter spawn):** Passing drifter guests spawn via `makeNamed(k)` without calling `rebirthNamed(...)` (unlike `js/events/walks.js:138`).

---

## Full Experiment Reports (Verbatim Tables)

### houses-all-cf

All 10 Cycle-1 houses played from week 1 with early/mid/late fixed-window cashflow (wk 1-8, 9-20, 21+), propositions, and prestige.

scenario **campaign** · 12 seeds from 1 · 87s · 2026-11-20T17:19

| variant | n | weeksToWin | winRate | cfE | cfM | cfL | cfHE | cfHM | cfHL | houseNet | guild | worth13 | worth20 | prestige | served | props | sat | over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| lantern | 12 | 31 | 1.0 | 590 | 1,298 | 2,454 | 547 | 1,098 | 2,146 | 1,264 | 192 | -24,026 | -12,651 | 46 | 23 | 2.8 | 65 | 0.0 |
| onsen | 12 | 45 | 0.8 | 736 | 1,027 | 2,088 | 699 | 864 | 1,825 | 1,163 | 159 | -30,438 | -22,009 | 44 | 15 | 3.0 | 69 | 0.2 |
| hollow | 12 | 38 | 0.9 | 559 | 1,956 | 4,436ⁿ11 | 513 | 1,686 | 3,997ⁿ11 | 2,014 | 252 | -43,026ⁿ11 | -27,702ⁿ11 | 56 | 20 | 3.2 | 74 | 0.1 |
| tankard | 12 | 33 | 1.0 | 484 | 723 | 1,480 | 461 | 534 | 1,208 | 729 | 179 | -16,996 | -11,232 | 13 | 20 | 2.4 | 65 | 0.0 |
| wayfarer | 12 | 32 | 1.0 | 811 | 1,517 | 2,962 | 757 | 1,319 | 2,604 | 1,578 | 216 | -29,226 | -18,910 | 45 | 23 | 2.5 | 72 | 0.0 |
| castle | 12 | 30 | 1.0 | 947 | 4,241 | 10,715 | 892 | 3,996 | 10,244 | 5,105 | 271 | -99,683 | -71,169 | 94 | 22 | 3.2 | 74 | 0.0 |
| pavilion | 12 | 36 | 0.9 | 1,186 | 2,910 | 6,519ⁿ11 | 1,170 | 2,765 | 6,316ⁿ11 | 3,170 | 120 | -64,063 | -39,112 | 76 | 20 | 4.4 | 70 | 0.1 |
| veil | 12 | 27 | 1.0 | 2,043 | 4,859 | 7,552 | 1,945 | 4,576 | 6,790 | 4,034 | 275 | -56,749 | -17,627 | 24 | 24 | 3.9 | 79 | 0.0 |
| sanctuary | 12 | 32 | 1.0 | 924 | 1,856 | 4,481ⁿ11 | 882 | 1,726 | 4,247ⁿ11 | 2,495 | 141 | -51,990 | -38,052 | 83 | 21 | 2.4 | 72 | 0.0 |
| atelier | 12 | 29 | 1.0 | 2,213 | 5,691 | 9,513 | 2,145 | 5,347 | 8,958 | 5,133 | 312 | -86,013 | -40,793 | 73 | 24 | 3.8 | 81 | 0.0 |

Paired Δ vs **lantern** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ netMid | Δ netLate | Δ worth20 | Δ over |
|---|---|---|---|---|---|
| onsen | +14.3 ± 15.7 | +13.0 ± 187.0 | -613.4 ± 628.6 | **-9,357 ± 4,530** | +0.2 ± 0.2 |
| hollow | +7.2 ± 13.1 | **+825.9 ± 337.2** | **+2,129 ± 892.4** | **-15,024 ± 7,548** | +0.1 ± 0.2 |
| tankard | +2.3 ± 4.2 | -95.9 ± 230.3 | **-895.2 ± 489.5** | +1,419 ± 3,624 | +0.0 ± 0.0 |
| wayfarer | +1.1 ± 4.8 | **+296.9 ± 292.7** | +295.4 ± 599.5 | **-6,258 ± 5,877** | +0.0 ± 0.0 |
| castle | -0.2 ± 3.1 | **+3,115 ± 464.9** | **+8,873 ± 2,010** | **-58,518 ± 10,050** | +0.0 ± 0.0 |
| pavilion | +5.0 ± 12.9 | **+1,193 ± 473.4** | **+3,490 ± 615.9** | **-26,461 ± 13,160** | +0.1 ± 0.2 |
| veil | -3.5 ± 6.4 | **+1,801 ± 509.9** | **+3,441 ± 1,359** | -4,976 ± 14,203 | +0.0 ± 0.0 |
| sanctuary | +1.4 ± 4.1 | **+764.0 ± 393.4** | **+2,461 ± 666.2** | **-25,401 ± 10,969** | +0.0 ± 0.0 |
| atelier | -1.6 ± 4.8 | **+2,592 ± 420.8** | **+4,982 ± 1,444** | **-28,141 ± 20,852** | +0.0 ± 0.0 |

---

### houses-plateau-cf

Post-debt plateau (26 weeks) across all 10 Cycle-1 houses: revenue, upkeep, cuts, propositions, and class.

scenario **plateau** · 12 seeds from 1 · 173s · 2026-11-20T17:22

| variant | n | houseNet | total | net | houseInc | guild | wages | upkeep | cuts | perLady | served | turned | props | sat | prestige | staff |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| lantern | 12 | 4,268 | 4,806 | 4,694 | 7,057 | 426 | 617 | 517 | 1,655 | 357 | 34 | 18 | 7.2 | 78 | 68 | 12 |
| onsen | 10 (+2 unreached) | 3,398 | 3,701 | 3,701 | 5,008 | 303 | 464 | 434 | 712 | 284 | 27 | 13 | 5.9 | 76 | 65 | 9.1 |
| hollow | 12 | 7,286 | 7,855 | 7,855 | 10,497 | 569 | 768 | 628 | 1,815 | 357 | 35 | 15 | 9.1 | 79 | 72 | 15 |
| tankard | 12 | 2,815 | 3,142 | 3,142 | 4,409 | 326 | 520 | 348 | 726 | 125 | 30 | 22 | 5.4 | 74 | 35 | 11 |
| wayfarer | 12 | 4,099 | 4,611 | 4,611 | 6,615 | 512 | 597 | 472 | 1,448 | 301 | 32 | 13 | 5.2 | 83 | 64 | 12 |
| castle | 11 (+1 unreached) | 14,083 | 14,857 | 14,857 | 19,350 | 775 | 992 | 963 | 3,313 | 331 | 35 | 7.2 | 8.7 | 78 | 99 | 21 |
| pavilion | 12 | 11,500 | 12,281 | 11,908 | 18,146 | 408 | 720 | 667 | 5,259 | 376 | 32 | 15 | 6.2 | 89 | 93 | 14 |
| veil | 12 | 8,957 | 9,627 | 9,627 | 11,066 | 670 | 675 | 405 | 1,030 | 134 | 34 | 12 | 5.9 | 79 | 44 | 15 |
| sanctuary | 11 (+1 unreached) | 9,063 | 9,387 | 9,387 | 12,394 | 324 | 543 | 616 | 2,172 | 574 | 37 | 6.7 | 4.9 | 87 | 97 | 10 |
| atelier | 10 (+2 unreached) | 12,015 | 12,752 | 12,752 | 15,667 | 737 | 840 | 695 | 2,020 | 323 | 36 | 12 | 5.3 | 81 | 90 | 17 |

---

### interactions

Choices varied together over a full first cycle: house x partner x Sam's past. Look for a choice whose effect flips or grows with another (e.g. a partner who only shines in one house).

scenario **campaign** · 12 seeds from 1 · 203s · 2026-11-20T17:26

| variant | n | weeksToWin | winRate | netMid | netLate | worth20 | missed | sat | left | over |
|---|---|---|---|---|---|---|---|---|---|---|
| lantern kaede salaryman | 12 | 31 | 1.0 | 764 | 2,145 | -12,651 | 0.0 | 65 | 0.2 | 0.0 |
| lantern kaede gym | 12 | 31 | 1.0 | 843 | 1,854 | -12,837 | 0.0 | 65 | 0.3 | 0.0 |
| lantern nerys salaryman | 12 | 23 | 1.0 | 1,170 | 2,967 | 238 | 0.0 | 74 | 0.1 | 0.0 |
| lantern nerys gym | 12 | 22 | 1.0 | 1,334 | 3,167 | 1,258 | 0.0 | 76 | 0.0 | 0.0 |
| lantern adelheid salaryman | 12 | 31 | 1.0 | 753 | 2,405 | -12,469 | 0.1 | 66 | 0.2 | 0.0 |
| lantern adelheid gym | 12 | 33 | 1.0 | 680 | 2,035 | -15,138 | 0.0 | 63 | 0.1 | 0.0 |
| hollow kaede salaryman | 12 | 38 | 0.9 | 1,590 | 4,216ⁿ11 | -27,702ⁿ11 | 0.6 | 74 | 0.0 | 0.1 |
| hollow kaede gym | 12 | 35 | 1.0 | 1,573 | 3,164 | -30,819 | 0.4 | 69 | 0.1 | 0.0 |
| hollow nerys salaryman | 12 | 26 | 1.0 | 2,218 | 6,470 | -16,214 | 0.6 | 80 | 0.2 | 0.0 |
| hollow nerys gym | 12 | 41 | 0.8 | 1,673 | 6,847ⁿ10 | -22,385ⁿ11 | 0.9 | 76 | 0.2 | 0.2 |
| hollow adelheid salaryman | 12 | 33 | 1.0 | 1,366 | 3,098 | -26,672 | 0.0 | 69 | 0.1 | 0.0 |
| hollow adelheid gym | 12 | 28 | 1.0 | 1,384 | 3,943 | -19,824 | 0.0 | 73 | 0.0 | 0.0 |
| tankard kaede salaryman | 12 | 33 | 1.0 | 668 | 1,250 | -11,232 | 0.0 | 65 | 0.2 | 0.0 |
| tankard kaede gym | 12 | 33 | 1.0 | 717ⁿ11 | 1,408 | -10,257 | 0.0 | 65 | 0.3 | 0.0 |
| tankard nerys salaryman | 12 | 23 | 1.0 | 1,199 | 2,050 | 1,605 | 0.0 | 76 | 0.2 | 0.0 |
| tankard nerys gym | 12 | 25 | 1.0 | 986ⁿ9 | 2,008 | 479 | 0.0 | 72 | 0.1 | 0.0 |
| tankard adelheid salaryman | 12 | 32 | 1.0 | 449ⁿ10 | 1,166 | -10,213 | 0.0 | 63 | 0.1 | 0.0 |
| tankard adelheid gym | 12 | 34 | 1.0 | 447ⁿ10 | 1,133 | -11,622 | 0.1 | 59 | 0.0 | 0.0 |
| castle kaede salaryman | 12 | 30 | 1.0 | 3,879 | 11,018 | -71,169 | 0.0 | 74 | 0.2 | 0.0 |
| castle kaede gym | 12 | 32 | 1.0 | 3,561 | 10,516 | -75,436 | 0.2 | 75 | 0.1 | 0.0 |
| castle nerys salaryman | 12 | 26 | 1.0 | 4,197 | 13,212 | -39,059 | 0.0 | 80 | 0.0 | 0.0 |
| castle nerys gym | 12 | 25 | 1.0 | 4,372 | 14,927 | -37,206 | 0.1 | 81 | 0.0 | 0.0 |
| castle adelheid salaryman | 12 | 29 | 1.0 | 3,567 | 8,812 | -51,646 | 0.0 | 71 | 0.1 | 0.0 |
| castle adelheid gym | 12 | 29 | 1.0 | 3,726 | 8,634 | -45,097 | 0.1 | 74 | 0.2 | 0.0 |

---

### house-class-compete

Low-class vs high-class houses in mid and late game: default vs cheap volume, 2 exhibitionists, exhibitionism + volume, and upscale luxury.

scenario **mid** · 12 seeds from 1 · 228s · 2026-11-20T17:29

| variant | n | houseNet | total | net | houseInc | upkeep | perLady | served | turned | props | exhibActs | crowdOver | sat | prestige | repGain | trouble |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| tankard · mid · base | 12 | 804 | 808 | 808 | 1,534 | 120 | 14 | 16 | 1.9 | 1.7 | 0.8 | 0.2 | 66 | 17 | 8.6 | 1.2 |
| tankard · mid · cheap-volume | 12 | 618 | 622 | 622 | 1,264 | 123 | 2.1 | 18 | 3.4 | 1.3 | 1.6 | 0.4 | 69 | 18 | 9.3 | 1.0 |
| tankard · mid · exhib-2 | 12 | 848 | 849 | 849 | 1,623 | 119 | 20 | 17 | 2.6 | 2.2 | 9.3 | 0.5 | 65 | 7.1 | 8.2 | 1.0 |
| tankard · mid · exhib-volume | 12 | 961 | 962 | 962 | 1,794 | 132 | 24 | 18 | 1.7 | 2.0 | 8.8 | 0.1 | 65 | 16 | 13 | 1.0 |
| tankard · mid · upscale | 12 | 1,035 | 1,039 | 1,039 | 1,833 | 162 | 32 | 14 | 0.6 | 2.1 | 0.9 | 0.0 | 67 | 38 | 15 | 0.9 |
| tankard · late · base | 12 | 1,271 | 1,278 | 1,278 | 2,335 | 140 | 36 | 23 | 5.4 | 3.7 | 2.8 | 0.4 | 66 | 14 | 15 | 0.4 |
| tankard · late · cheap-volume | 12 | 1,154 | 1,160 | 1,160 | 2,059 | 151 | 14 | 24 | 12 | 4.1 | 2.3 | 1.4 | 70 | 19 | 18 | 0.5 |
| tankard · late · exhib-2 | 12 | 1,461 | 1,468 | 1,468 | 2,531 | 145 | 48 | 26 | 3.6 | 4.6 | 15 | 0.5 | 65 | 5.2 | 14 | 0.5 |
| tankard · late · exhib-volume | 12 | 1,815 | 1,823 | 1,823 | 3,003 | 164 | 40 | 26 | 4.2 | 4.9 | 14 | 0.8 | 67 | 15 | 20 | 0.4 |
| tankard · late · upscale | 12 | 1,916 | 1,924 | 1,924 | 3,105 | 177 | 55 | 20 | 2.1 | 3.6 | 2.0 | 0.2 | 68 | 36 | 21 | 0.6 |
| veil · mid · base | 12 | 3,620 | 3,626 | 3,626 | 5,168 | 217 | 8.0 | 23 | 2.6 | 4.4 | 1.9 | 0.0 | 75 | 25 | 9.2 | 1.4 |
| veil · mid · cheap-volume | 12 | 2,168 | 2,174 | 2,174 | 3,359 | 223 | 5.0 | 23 | 4.3 | 4.5 | 1.0 | 0.1 | 74 | 27 | 10.0 | 1.5 |
| veil · mid · exhib-2 | 12 | 5,624 | 5,630 | 5,630 | 7,696 | 234 | 7.3 | 30 | 1.2 | 3.7 | 22 | 0.0 | 84 | 18 | 24 | 1.3 |
| veil · mid · exhib-volume | 12 | 4,491 | 4,497 | 4,497 | 6,291 | 254 | 24 | 27 | 1.6 | 6.3 | 19 | 0.0 | 74 | 23 | 14 | 1.4 |
| veil · mid · upscale | 12 | 4,537 | 4,543 | 4,543 | 6,271 | 263 | 16 | 16 | 1.2 | 5.0 | 1.9 | 0.0 | 75 | 45 | 12 | 1.5 |
| veil · late · base | 12 | 6,212 | 6,235 | 6,235 | 8,145 | 243 | 9.5 | 27 | 4.5 | 4.8 | 1.7 | 0.0 | 82 | 29 | 20 | 0.7 |
| veil · late · cheap-volume | 12 | 4,026 | 4,049 | 4,049 | 5,483 | 241 | 16 | 30 | 7.9 | 4.4 | 2.3 | 0.3 | 82 | 32 | 24 | 0.9 |
| veil · late · exhib-2 | 12 | 7,665 | 7,688 | 7,688 | 9,956 | 257 | 23 | 35 | 1.2 | 5.4 | 24 | 0.1 | 82 | 21 | 24 | 0.8 |
| veil · late · exhib-volume | 12 | 7,690 | 7,714 | 7,714 | 9,918 | 272 | 44 | 36 | 1.3 | 6.4 | 24 | 0.1 | 80 | 28 | 23 | 1.0 |
| veil · late · upscale | 12 | 8,719 | 8,743 | 8,743 | 11,198 | 283 | 18 | 24 | 1.9 | 4.6 | 1.0 | 0.0 | 84 | 50 | 20 | 0.9 |
| lantern · mid · base | 12 | 597 | 777 | 597 | 1,203 | 196 | 53 | 17 | 1.4 | 2.2 | 0.8 | 0.0 | 60 | 50 | 11 | 0.9 |
| lantern · mid · cheap-volume | 12 | 323 | 537 | 323 | 890 | 205 | 41 | 17 | 3.3 | 2.3 | 2.4 | 0.3 | 65 | 45 | 15 | 0.9 |
| lantern · mid · exhib-2 | 12 | 624 | 822 | 624 | 1,249 | 194 | 67 | 17 | 1.3 | 2.7 | 7.3 | 0.0 | 62 | 42 | 14 | 0.8 |
| lantern · mid · exhib-volume | 12 | 619 | 844 | 619 | 1,294 | 240 | 91 | 16 | 1.8 | 3.4 | 6.9 | 0.0 | 60 | 46 | 13 | 1.0 |
| lantern · mid · upscale | 12 | 1,082 | 1,376 | 1,082 | 1,977 | 298 | 125 | 17 | 0.9 | 3.1 | 1.0 | 0.0 | 63 | 73 | 17 | 0.8 |
| lantern · late · base | 12 | 1,610 | 1,819 | 1,616 | 2,828 | 268 | 126 | 29 | 4.4 | 4.4 | 3.6 | 0.6 | 62 | 46 | 15 | 0.3 |
| lantern · late · cheap-volume | 12 | 980 | 1,250 | 985 | 2,058 | 300 | 94 | 30 | 9.8 | 4.7 | 4.2 | 2.0 | 65 | 43 | 9.7 | 0.4 |
| lantern · late · exhib-2 | 12 | 1,857 | 2,147 | 1,863 | 3,160 | 298 | 152 | 32 | 2.8 | 4.4 | 12 | 0.6 | 64 | 39 | 18 | 0.4 |
| lantern · late · exhib-volume | 12 | 1,858 | 2,092 | 1,863 | 3,137 | 294 | 162 | 30 | 4.1 | 5.8 | 12 | 0.7 | 62 | 41 | 17 | 0.4 |
| lantern · late · upscale | 12 | 2,988 | 3,210 | 2,994 | 4,538 | 318 | 219 | 28 | 2.6 | 4.5 | 2.9 | 0.2 | 63 | 65 | 18 | 0.3 |
| pavilion · mid · base | 12 | 2,438 | 2,488 | 2,439 | 4,339 | 234 | 39 | 19 | 2.8 | 3.7 | 0.5 | 0.1 | 66 | 82 | 14 | 0.8 |
| pavilion · mid · cheap-volume | 12 | 1,692 | 1,736 | 1,692 | 3,185 | 234 | 23 | 17 | 4.8 | 3.8 | 0.4 | 0.2 | 68 | 78 | 12 | 0.8 |
| pavilion · mid · exhib-2 | 12 | 2,834 | 2,884 | 2,834 | 5,099 | 240 | 61 | 20 | 2.0 | 4.1 | 13 | 0.1 | 65 | 73 | 15 | 0.9 |
| pavilion · mid · exhib-volume | 12 | 2,562 | 2,614 | 2,563 | 4,640 | 247 | 54 | 17 | 2.0 | 6.1 | 13 | 0.0 | 61 | 70 | 12 | 0.8 |
| pavilion · mid · upscale | 12 | 3,320 | 3,348 | 3,320 | 5,523 | 260 | 86 | 15 | 2.2 | 5.2 | 0.9 | 0.0 | 64 | 95 | 13 | 0.9 |
| pavilion · late · base | 12 | 5,392 | 5,710 | 5,409 | 9,382 | 398 | 84 | 29 | 6.5 | 4.9 | 1.8 | 0.8 | 79 | 83 | 22 | 0.5 |
| pavilion · late · cheap-volume | 12 | 3,458 | 3,807 | 3,476 | 6,295 | 409 | 97 | 29 | 14 | 5.3 | 2.2 | 4.1 | 78 | 72 | 12 | 0.5 |
| pavilion · late · exhib-2 | 12 | 6,556 | 6,870 | 6,575 | 11,391 | 394 | 106 | 36 | 4.2 | 6.4 | 21 | 0.9 | 76 | 72 | 28 | 0.4 |
| pavilion · late · exhib-volume | 12 | 6,558 | 6,886 | 6,578 | 11,374 | 421 | 138 | 38 | 3.0 | 7.3 | 21 | 1.5 | 75 | 71 | 25 | 0.5 |
| pavilion · late · upscale | 12 | 7,942 | 8,232 | 7,962 | 12,965 | 421 | 132 | 28 | 5.1 | 5.2 | 1.7 | 0.2 | 82 | 97 | 27 | 0.5 |
| sanctuary · mid · base | 12 | 2,214 | 2,214 | 2,214 | 3,636 | 203 | 45 | 18 | 1.7 | 3.0 | 0.9 | 0.0 | 71 | 87 | 22 | 0.5 |
| sanctuary · mid · cheap-volume | 12 | 1,469 | 1,470 | 1,470 | 2,534 | 205 | 37 | 17 | 3.4 | 2.3 | 0.1 | 0.0 | 72 | 79 | 16 | 0.6 |
| sanctuary · mid · exhib-2 | 12 | 2,134 | 2,134 | 2,134 | 3,493 | 208 | 50 | 18 | 2.1 | 3.1 | 10 | 0.0 | 72 | 80 | 22 | 0.6 |
| sanctuary · mid · exhib-volume | 12 | 1,861 | 1,861 | 1,861 | 2,959 | 226 | 64 | 16 | 2.3 | 3.9 | 9.7 | 0.0 | 69 | 77 | 23 | 0.7 |
| sanctuary · mid · upscale | 12 | 2,696 | 2,696 | 2,696 | 4,151 | 256 | 71 | 14 | 1.2 | 3.9 | 0.4 | 0.0 | 69 | 98 | 17 | 0.5 |
| sanctuary · late · base | 12 | 4,416 | 4,424 | 4,424 | 6,402 | 263 | 161 | 29 | 2.3 | 4.0 | 1.6 | 0.0 | 74 | 87 | 14 | 0.3 |
| sanctuary · late · cheap-volume | 12 | 3,288 | 3,295 | 3,295 | 4,918 | 278 | 138 | 31 | 5.8 | 4.7 | 2.0 | 0.8 | 77 | 80 | 12 | 0.4 |
| sanctuary · late · exhib-2 | 12 | 4,384 | 4,391 | 4,391 | 6,350 | 265 | 175 | 30 | 2.3 | 3.6 | 16 | 0.0 | 73 | 76 | 15 | 0.3 |
| sanctuary · late · exhib-volume | 12 | 4,448 | 4,456 | 4,456 | 6,490 | 279 | 193 | 29 | 4.4 | 4.9 | 14 | 0.1 | 73 | 75 | 17 | 0.3 |
| sanctuary · late · upscale | 12 | 6,620 | 6,629 | 6,629 | 9,310 | 294 | 225 | 29 | 1.4 | 4.1 | 1.4 | 0.0 | 78 | 97 | 16 | 0.3 |
| castle · mid · base | 12 | 4,772 | 4,786 | 4,786 | 6,545 | 288 | 49 | 21 | 0.9 | 2.5 | 0.5 | 0.0 | 75 | 96 | 24 | 0.3 |
| castle · mid · cheap-volume | 12 | 2,497 | 2,521 | 2,521 | 3,637 | 264 | 42 | 20 | 1.3 | 2.0 | 0.6 | 0.0 | 71 | 86 | 17 | 0.6 |
| castle · mid · exhib-2 | 12 | 4,943 | 4,968 | 4,968 | 7,202 | 311 | 62 | 23 | 0.5 | 3.1 | 10 | 0.0 | 73 | 86 | 26 | 0.3 |
| castle · mid · exhib-volume | 12 | 4,009 | 4,022 | 4,022 | 5,617 | 314 | 78 | 22 | 0.6 | 3.8 | 8.4 | 0.0 | 67 | 76 | 22 | 0.5 |
| castle · mid · upscale | 12 | 5,991 | 6,004 | 6,004 | 8,126 | 357 | 88 | 18 | 1.0 | 3.1 | 0.7 | 0.0 | 73 | 99 | 22 | 0.4 |
| castle · late · base | 11 (+1 unreached) | 9,848 | 9,866 | 9,866 | 13,395 | 445 | 112 | 33 | 2.3 | 7.0 | 2.0 | 0.0 | 70 | 97 | 8.0 | 0.1 |
| castle · late · cheap-volume | 11 (+1 unreached) | 6,834 | 6,849 | 6,849 | 9,740 | 466 | 93 | 37 | 5.0 | 8.0 | 2.5 | 0.0 | 70 | 82 | 10 | 0.2 |
| castle · late · exhib-2 | 11 (+1 unreached) | 9,815 | 9,832 | 9,832 | 13,623 | 448 | 143 | 36 | 0.9 | 8.8 | 12 | 0.0 | 66 | 88 | 9.9 | 0.2 |
| castle · late · exhib-volume | 11 (+1 unreached) | 9,342 | 9,359 | 9,359 | 12,754 | 462 | 156 | 39 | 1.3 | 9.9 | 13 | 0.0 | 64 | 73 | 7.2 | 0.2 |
| castle · late · upscale | 11 (+1 unreached) | 13,449 | 13,469 | 13,469 | 17,696 | 474 | 164 | 31 | 1.9 | 7.6 | 1.9 | 0.0 | 72 | 98 | 8.4 | 0.2 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ net | Δ served | Δ props | Δ exhibActs | Δ prestige | Δ sat |
|---|---|---|---|---|---|---|---|
| tankard · mid · cheap-volume | **-186.1 ± 151.7** | **-186.1 ± 151.7** | +1.6 ± 1.7 | -0.4 ± 0.6 | +0.8 ± 1.1 | +1.0 ± 4.5 | **+3.6 ± 2.7** |
| tankard · mid · exhib-2 | +43.4 ± 186.2 | +40.9 ± 187.2 | +0.7 ± 2.6 | +0.5 ± 0.5 | **+8.5 ± 3.7** | **-9.9 ± 3.0** | -0.9 ± 1.8 |
| tankard · mid · exhib-volume | **+156.6 ± 155.0** | +154.1 ± 155.7 | +1.5 ± 2.6 | +0.3 ± 0.6 | **+8.0 ± 2.9** | -1.5 ± 3.9 | -0.4 ± 1.9 |
| tankard · mid · upscale | **+230.8 ± 154.5** | **+230.8 ± 154.5** | **-2.6 ± 2.6** | +0.4 ± 0.8 | +0.1 ± 0.5 | **+21.4 ± 2.7** | +1.3 ± 4.1 |
| tankard · late · cheap-volume | -116.9 ± 122.0 | -117.7 ± 122.8 | +0.8 ± 1.9 | +0.4 ± 0.7 | -0.5 ± 0.9 | **+5.4 ± 3.5** | **+4.3 ± 1.9** |
| tankard · late · exhib-2 | **+190.3 ± 181.0** | **+189.9 ± 180.5** | **+2.9 ± 2.4** | **+0.9 ± 0.5** | **+11.8 ± 4.4** | **-8.6 ± 4.5** | -1.0 ± 3.8 |
| tankard · late · exhib-volume | **+544.4 ± 214.5** | **+544.9 ± 214.5** | **+2.9 ± 2.7** | **+1.2 ± 0.7** | **+11.4 ± 3.9** | +0.9 ± 4.9 | +1.3 ± 1.9 |
| tankard · late · upscale | **+645.9 ± 155.5** | **+646.1 ± 155.5** | **-3.0 ± 1.7** | -0.1 ± 0.5 | **-0.9 ± 0.7** | **+22.0 ± 2.2** | **+2.1 ± 1.8** |
| veil · mid · cheap-volume | **-1,452 ± 1,225** | **-1,452 ± 1,225** | +0.2 ± 3.9 | +0.0 ± 1.3 | -0.8 ± 0.9 | +1.4 ± 4.6 | -0.9 ± 8.3 |
| veil · mid · exhib-2 | **+2,004 ± 1,097** | **+2,004 ± 1,097** | **+7.3 ± 3.8** | -0.7 ± 1.5 | **+20.4 ± 1.3** | **-7.5 ± 4.0** | **+9.6 ± 7.6** |
| veil · mid · exhib-volume | +870.8 ± 1,691 | +870.8 ± 1,691 | +4.6 ± 5.5 | **+1.9 ± 1.5** | **+17.5 ± 3.7** | -1.8 ± 5.1 | -0.4 ± 10.6 |
| veil · mid · upscale | +917.2 ± 1,631 | +917.2 ± 1,631 | **-6.5 ± 2.8** | +0.5 ± 1.5 | +0.0 ± 1.1 | **+19.6 ± 4.4** | +0.4 ± 9.4 |
| veil · late · cheap-volume | **-2,186 ± 565.0** | **-2,186 ± 565.0** | **+3.0 ± 1.3** | -0.3 ± 0.5 | +0.5 ± 0.9 | +3.5 ± 3.9 | +0.4 ± 2.0 |
| veil · late · exhib-2 | **+1,453 ± 714.2** | **+1,453 ± 714.2** | **+7.9 ± 2.9** | +0.7 ± 0.9 | **+21.9 ± 3.8** | **-8.0 ± 3.5** | +0.2 ± 1.9 |
| veil · late · exhib-volume | **+1,478 ± 1,015** | **+1,479 ± 1,015** | **+8.7 ± 4.6** | **+1.6 ± 0.7** | **+22.6 ± 4.0** | -0.9 ± 5.0 | -2.3 ± 4.0 |
| veil · late · upscale | **+2,507 ± 839.4** | **+2,508 ± 839.5** | **-3.2 ± 2.4** | -0.2 ± 0.7 | -0.7 ± 0.8 | **+21.5 ± 3.3** | +2.2 ± 3.6 |
| lantern · mid · cheap-volume | **-274.4 ± 103.8** | **-274.4 ± 103.8** | +1.0 ± 3.0 | +0.1 ± 0.7 | +1.6 ± 2.5 | -4.6 ± 5.8 | **+5.3 ± 3.7** |
| lantern · mid · exhib-2 | +27.0 ± 141.1 | +27.0 ± 141.1 | +0.6 ± 1.9 | **+0.5 ± 0.4** | **+6.5 ± 1.9** | **-7.8 ± 3.9** | +1.5 ± 2.4 |
| lantern · mid · exhib-volume | +21.8 ± 142.9 | +21.8 ± 142.9 | -0.2 ± 1.9 | **+1.2 ± 0.5** | **+6.1 ± 1.5** | **-4.3 ± 3.3** | +0.4 ± 3.7 |
| lantern · mid · upscale | **+484.8 ± 212.2** | **+484.8 ± 212.2** | +0.4 ± 1.8 | **+0.9 ± 0.7** | +0.1 ± 0.8 | **+22.6 ± 3.9** | +3.4 ± 4.3 |
| lantern · late · cheap-volume | **-630.0 ± 212.9** | **-630.6 ± 213.8** | +1.1 ± 1.7 | +0.3 ± 0.6 | +0.6 ± 1.6 | -2.9 ± 5.8 | +2.5 ± 3.0 |
| lantern · late · exhib-2 | **+247.0 ± 183.3** | **+247.0 ± 183.3** | **+3.4 ± 1.4** | -0.0 ± 0.5 | **+8.2 ± 2.6** | **-6.5 ± 4.5** | +1.4 ± 1.7 |
| lantern · late · exhib-volume | **+247.4 ± 208.0** | **+247.1 ± 207.9** | +2.0 ± 2.7 | **+1.4 ± 0.6** | **+8.5 ± 2.6** | **-4.8 ± 4.7** | +0.1 ± 2.1 |
| lantern · late · upscale | **+1,378 ± 267.0** | **+1,378 ± 267.1** | -0.0 ± 1.9 | +0.0 ± 0.5 | -0.7 ± 1.6 | **+19.5 ± 4.9** | +0.4 ± 1.9 |
| pavilion · mid · cheap-volume | **-746.5 ± 336.2** | **-746.5 ± 336.2** | -1.6 ± 3.1 | +0.0 ± 0.9 | -0.1 ± 0.2 | -3.5 ± 4.9 | +1.4 ± 6.4 |
| pavilion · mid · exhib-2 | +395.5 ± 537.1 | +395.5 ± 537.1 | +1.4 ± 3.7 | +0.4 ± 0.9 | **+12.4 ± 5.1** | **-9.2 ± 5.0** | -1.6 ± 6.5 |
| pavilion · mid · exhib-volume | +124.0 ± 591.8 | +124.0 ± 591.8 | -1.8 ± 3.8 | **+2.4 ± 0.6** | **+12.1 ± 4.8** | **-12.1 ± 3.9** | **-5.5 ± 3.5** |
| pavilion · mid · upscale | **+881.1 ± 799.3** | **+881.1 ± 799.3** | -3.7 ± 4.0 | **+1.5 ± 1.1** | +0.3 ± 0.5 | **+13.2 ± 4.9** | -2.6 ± 8.1 |
| pavilion · late · cheap-volume | **-1,933 ± 337.0** | **-1,933 ± 337.0** | +0.5 ± 2.1 | +0.3 ± 0.6 | +0.4 ± 0.4 | **-11.2 ± 2.1** | -0.4 ± 3.7 |
| pavilion · late · exhib-2 | **+1,164 ± 1,032** | **+1,166 ± 1,033** | **+7.0 ± 4.4** | **+1.5 ± 0.9** | **+19.0 ± 4.1** | **-10.3 ± 4.2** | **-2.6 ± 2.0** |
| pavilion · late · exhib-volume | **+1,167 ± 869.3** | **+1,169 ± 870.1** | **+8.6 ± 4.6** | **+2.3 ± 0.6** | **+19.3 ± 5.3** | **-12.0 ± 3.7** | **-3.5 ± 3.5** |
| pavilion · late · upscale | **+2,550 ± 454.9** | **+2,553 ± 454.5** | **-1.4 ± 1.3** | +0.3 ± 0.9 | -0.1 ± 0.4 | **+14.3 ± 2.5** | **+3.0 ± 2.1** |
| sanctuary · mid · cheap-volume | **-744.3 ± 349.2** | **-744.3 ± 349.2** | -0.9 ± 1.9 | -0.7 ± 0.8 | -0.9 ± 1.2 | **-8.7 ± 4.8** | +1.4 ± 3.9 |
| sanctuary · mid · exhib-2 | -79.8 ± 293.7 | -79.8 ± 293.7 | -0.3 ± 2.5 | +0.1 ± 0.5 | **+9.1 ± 3.3** | **-7.7 ± 3.4** | +0.9 ± 5.3 |
| sanctuary · mid · exhib-volume | -352.5 ± 531.9 | -352.5 ± 531.9 | -2.0 ± 2.7 | +0.9 ± 1.4 | **+8.8 ± 2.3** | **-10.3 ± 4.6** | -2.0 ± 8.4 |
| sanctuary · mid · upscale | +482.0 ± 899.2 | +482.0 ± 899.2 | **-3.9 ± 3.8** | +0.9 ± 1.3 | -0.5 ± 1.2 | **+11.0 ± 3.2** | -1.7 ± 8.1 |
| sanctuary · late · cheap-volume | **-1,127 ± 267.6** | **-1,129 ± 268.4** | **+2.3 ± 1.9** | +0.6 ± 0.7 | +0.4 ± 0.7 | **-7.0 ± 3.2** | +2.5 ± 2.9 |
| sanctuary · late · exhib-2 | -31.9 ± 340.2 | -32.8 ± 340.2 | +0.6 ± 2.2 | -0.4 ± 0.5 | **+14.0 ± 2.3** | **-11.4 ± 3.4** | -0.8 ± 1.6 |
| sanctuary · late · exhib-volume | +32.6 ± 637.1 | +32.1 ± 637.1 | +0.3 ± 2.7 | +0.9 ± 0.9 | **+12.9 ± 2.9** | **-11.6 ± 4.6** | -1.1 ± 2.0 |
| sanctuary · late · upscale | **+2,204 ± 441.0** | **+2,205 ± 442.3** | +0.0 ± 0.9 | +0.0 ± 0.7 | -0.2 ± 0.3 | **+10.3 ± 1.5** | **+3.2 ± 1.1** |
| castle · mid · cheap-volume | **-2,276 ± 810.4** | **-2,264 ± 792.9** | -0.4 ± 2.4 | -0.5 ± 0.8 | +0.1 ± 0.6 | **-10.1 ± 5.5** | -3.7 ± 5.2 |
| castle · mid · exhib-2 | +170.8 ± 1,252 | +181.9 ± 1,236 | +2.1 ± 2.9 | +0.5 ± 0.6 | **+9.6 ± 2.0** | **-10.3 ± 3.4** | -1.6 ± 4.5 |
| castle · mid · exhib-volume | **-763.5 ± 704.1** | **-763.5 ± 704.1** | +1.3 ± 2.0 | **+1.3 ± 0.9** | **+7.9 ± 1.8** | **-20.6 ± 6.1** | **-7.8 ± 5.8** |
| castle · mid · upscale | +1,218 ± 1,258 | +1,218 ± 1,258 | **-2.7 ± 2.0** | +0.6 ± 0.9 | +0.2 ± 0.8 | **+2.9 ± 2.6** | -2.0 ± 5.8 |
| castle · late · cheap-volume | **-3,014 ± 1,245** | **-3,017 ± 1,245** | **+4.2 ± 2.0** | **+1.0 ± 0.7** | **+0.5 ± 0.4** | **-15.3 ± 2.4** | -0.1 ± 2.0 |
| castle · late · exhib-2 | -33.1 ± 1,059 | -34.2 ± 1,059 | **+3.8 ± 2.4** | **+1.8 ± 0.9** | **+10.3 ± 1.4** | **-9.5 ± 3.6** | **-3.7 ± 2.4** |
| castle · late · exhib-volume | -506.1 ± 536.1 | -507.2 ± 536.9 | **+5.8 ± 1.6** | **+2.9 ± 1.1** | **+10.6 ± 1.6** | **-24.5 ± 3.5** | **-6.2 ± 3.2** |
| castle · late · upscale | **+3,601 ± 823.9** | **+3,604 ± 824.7** | -1.4 ± 1.7 | +0.6 ± 1.0 | -0.1 ± 0.3 | +1.4 ± 2.3 | **+1.8 ± 1.5** |

---

### house-class-plateau

Post-debt plateau (20 weeks): can built-up low-class houses compete with high-class houses via volume, propositions, and exhibitionism?

scenario **plateau** · 12 seeds from 1 · 160s · 2026-11-20T17:32

| variant | n | houseNet | total | net | houseInc | upkeep | perLady | served | turned | props | exhibActs | crowdOver | sat | prestige | repGain | trouble |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| tankard · base | 12 | 3,138 | 3,138 | 3,138 | 4,674 | 173 | 75 | 25 | 24 | 5.0 | 3.4 | 2.1 | 77 | 41 | 14 | 0.1 |
| tankard · cheap-volume | 12 | 2,468 | 2,469 | 2,469 | 3,755 | 173 | 35 | 24 | 41 | 5.8 | 3.4 | 3.2 | 81 | 37 | 8.3 | 0.1 |
| tankard · exhib-2 | 12 | 3,937 | 3,938 | 3,938 | 5,706 | 187 | 105 | 32 | 21 | 6.7 | 17 | 2.1 | 76 | 29 | 15 | 0.1 |
| tankard · exhib-volume | 12 | 3,977 | 3,978 | 3,978 | 5,775 | 195 | 114 | 31 | 23 | 7.7 | 17 | 2.2 | 76 | 31 | 13 | 0.1 |
| tankard · upscale | 12 | 6,085 | 6,086 | 6,086 | 8,612 | 211 | 158 | 22 | 6.3 | 4.6 | 2.3 | 0.4 | 74 | 54 | 21 | 0.3 |
| veil · base | 12 | 12,439 | 12,446 | 12,446 | 14,116 | 229 | 85 | 30 | 17 | 5.9 | 2.2 | 1.7 | 87 | 57 | 17 | 0.2 |
| veil · cheap-volume | 12 | 7,326 | 7,333 | 7,333 | 8,818 | 223 | 66 | 30 | 30 | 6.6 | 2.4 | 4.1 | 88 | 50 | 11 | 0.2 |
| veil · exhib-2 | 12 | 19,537 | 19,545 | 19,545 | 21,823 | 241 | 142 | 49 | 4.8 | 8.5 | 31 | 2.6 | 86 | 40 | 20 | 0.4 |
| veil · exhib-volume | 12 | 19,232 | 19,240 | 19,240 | 21,430 | 246 | 165 | 49 | 5.8 | 10 | 31 | 2.9 | 85 | 41 | 19 | 0.3 |
| veil · upscale | 12 | 28,384 | 28,392 | 28,392 | 30,880 | 253 | 104 | 26 | 5.7 | 6.3 | 1.5 | 0.0 | 89 | 68 | 25 | 0.3 |
| lantern · base | 12 | 4,024 | 4,318 | 4,031 | 6,408 | 331 | 243 | 28 | 22 | 6.8 | 2.9 | 3.3 | 77 | 69 | 5.8 | 0.3 |
| lantern · cheap-volume | 12 | 2,188 | 2,423 | 2,195 | 3,946 | 296 | 143 | 28 | 35 | 7.2 | 2.9 | 5.8 | 79 | 59 | -0.9 | 0.3 |
| lantern · exhib-2 | 12 | 4,687 | 4,977 | 4,694 | 7,297 | 332 | 298 | 34 | 18 | 8.2 | 13 | 2.9 | 75 | 58 | 9.2 | 0.2 |
| lantern · exhib-volume | 12 | 4,537 | 4,778 | 4,544 | 7,064 | 334 | 293 | 34 | 20 | 8.8 | 13 | 2.8 | 74 | 53 | 11 | 0.2 |
| lantern · upscale | 12 | 9,750 | 10,044 | 9,758 | 14,120 | 380 | 498 | 27 | 6.1 | 6.4 | 2.7 | 0.3 | 75 | 83 | 19 | 0.3 |
| castle · base | 11 (+1 unreached) | 15,356 | 15,388 | 15,388 | 19,844 | 520 | 243 | 30 | 11 | 9.3 | 2.3 | 0.0 | 80 | 100 | 11 | 0.0 |
| castle · cheap-volume | 11 (+1 unreached) | 9,958 | 9,990 | 9,990 | 13,434 | 519 | 174 | 32 | 21 | 9.2 | 2.2 | 0.1 | 80 | 85 | 9.1 | 0.1 |
| castle · exhib-2 | 11 (+1 unreached) | 18,911 | 18,942 | 18,942 | 24,543 | 528 | 337 | 42 | 3.0 | 11 | 17 | 0.0 | 76 | 88 | 14 | 0.0 |
| castle · exhib-volume | 11 (+1 unreached) | 16,350 | 16,381 | 16,381 | 21,674 | 537 | 321 | 41 | 4.7 | 13 | 18 | 0.0 | 74 | 70 | 12 | 0.0 |
| castle · upscale | 11 (+1 unreached) | 31,127 | 31,158 | 31,158 | 39,021 | 548 | 386 | 27 | 4.0 | 9.4 | 1.5 | 0.0 | 84 | 100 | 15 | 0.0 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ net | Δ served | Δ props | Δ exhibActs | Δ prestige | Δ sat |
|---|---|---|---|---|---|---|---|
| tankard · cheap-volume | **-669.4 ± 173.6** | **-669.4 ± 173.6** | **-1.0 ± 0.9** | **+0.8 ± 0.5** | -0.1 ± 0.6 | **-3.5 ± 2.5** | **+4.4 ± 1.4** |
| tankard · exhib-2 | **+799.5 ± 358.9** | **+799.5 ± 358.9** | **+6.5 ± 2.8** | **+1.7 ± 0.6** | **+14.0 ± 4.7** | **-12.2 ± 4.8** | -0.6 ± 1.4 |
| tankard · exhib-volume | **+839.2 ± 370.1** | **+839.2 ± 370.1** | **+5.9 ± 2.6** | **+2.8 ± 0.6** | **+13.9 ± 4.2** | **-9.4 ± 5.1** | -0.6 ± 1.7 |
| tankard · upscale | **+2,947 ± 564.2** | **+2,947 ± 564.2** | **-3.2 ± 1.5** | -0.3 ± 0.8 | **-1.2 ± 0.9** | **+13.0 ± 2.4** | **-2.4 ± 2.1** |
| veil · cheap-volume | **-5,113 ± 663.1** | **-5,113 ± 663.1** | +0.5 ± 1.7 | **+0.7 ± 0.7** | +0.2 ± 0.9 | **-7.1 ± 3.3** | +1.4 ± 1.6 |
| veil · exhib-2 | **+7,098 ± 1,851** | **+7,098 ± 1,851** | **+19.1 ± 3.6** | **+2.7 ± 1.1** | **+28.6 ± 2.4** | **-16.2 ± 4.5** | -1.0 ± 1.9 |
| veil · exhib-volume | **+6,794 ± 1,565** | **+6,794 ± 1,565** | **+19.3 ± 3.1** | **+4.4 ± 1.3** | **+28.5 ± 2.6** | **-15.8 ± 4.2** | **-1.8 ± 1.8** |
| veil · upscale | **+15,945 ± 2,339** | **+15,945 ± 2,339** | **-3.9 ± 1.3** | +0.4 ± 0.7 | **-0.7 ± 0.7** | **+11.7 ± 2.9** | **+2.5 ± 1.6** |
| lantern · cheap-volume | **-1,836 ± 481.5** | **-1,836 ± 481.5** | -0.7 ± 1.2 | +0.4 ± 0.9 | -0.0 ± 0.3 | **-10.1 ± 4.8** | **+2.4 ± 2.3** |
| lantern · exhib-2 | **+663.1 ± 619.1** | **+663.1 ± 619.1** | **+6.2 ± 4.3** | **+1.4 ± 1.2** | **+10.2 ± 2.7** | **-11.3 ± 4.6** | -1.5 ± 1.5 |
| lantern · exhib-volume | **+512.6 ± 511.4** | **+512.6 ± 511.4** | **+5.9 ± 2.9** | **+2.1 ± 0.9** | **+10.3 ± 2.7** | **-16.0 ± 6.1** | -2.6 ± 2.6 |
| lantern · upscale | **+5,726 ± 1,001** | **+5,726 ± 1,001** | -1.3 ± 2.2 | -0.4 ± 1.2 | -0.2 ± 0.2 | **+14.4 ± 2.6** | -1.6 ± 2.4 |
| castle · cheap-volume | **-5,398 ± 1,643** | **-5,398 ± 1,643** | **+1.6 ± 1.0** | -0.1 ± 0.7 | -0.0 ± 0.3 | **-14.3 ± 2.0** | +0.4 ± 2.7 |
| castle · exhib-2 | **+3,555 ± 1,847** | **+3,555 ± 1,847** | **+11.7 ± 2.2** | **+2.0 ± 0.6** | **+14.9 ± 2.4** | **-11.8 ± 2.2** | **-4.3 ± 2.7** |
| castle · exhib-volume | +993.6 ± 2,510 | +993.5 ± 2,511 | **+11.3 ± 2.8** | **+3.6 ± 1.0** | **+16.0 ± 2.9** | **-29.3 ± 2.5** | **-6.3 ± 3.7** |
| castle · upscale | **+15,770 ± 4,190** | **+15,770 ± 4,190** | **-3.6 ± 1.6** | +0.1 ± 0.8 | **-0.8 ± 0.7** | +0.3 ± 0.6 | **+4.1 ± 1.9** |

---

### incense-phases

All 5 incense blends across early4/mid/late and 5 contrasting houses (Tankard, Veil, Lantern, Castle, Conservatory 1.5x).

scenario **mid** · 12 seeds from 1 · 278s · 2026-11-20T17:37

| variant | n | houseNet | total | net | perLady | served | props | sat | mood | trust | repGain | trouble | damage | restPct | statGain | skillGain |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| early4 · tankard · base | 12 | 470 | 470 | 470 | -3.5ⁿ11 | 8.5 | 0.6 | 64 | 82 | 54 | -2.3 | 1.0 | 20 | 12 | 1.3 | 1.8 |
| early4 · tankard · calm | 12 | 495 | 495 | 495 | 1.3ⁿ11 | 8.8 | 0.5 | 65 | 83 | 52 | 1.1 | 0.5 | 7.5 | 9.9 | 1.3 | 1.8 |
| early4 · tankard · aphro | 12 | 447 | 447 | 447 | 6.1ⁿ11 | 8.3 | 1.2 | 64 | 82 | 53 | -0.6 | 1.0 | 19 | 12 | 1.3 | 1.7 |
| early4 · tankard · focus | 12 | 465 | 465 | 465 | -4.1ⁿ11 | 8.4 | 0.6 | 66 | 81 | 53 | -1.4 | 0.9 | 24 | 11 | 1.3 | 2.0 |
| early4 · tankard · velvet | 12 | 504 | 504 | 504 | 6.6ⁿ11 | 9.4 | 0.6 | 67 | 82 | 55 | 3.2 | 1.0 | 19 | 11 | 1.3 | 1.7 |
| early4 · tankard · amber | 12 | 470 | 470 | 470 | -2.7ⁿ11 | 10 | 0.8 | 67 | 84 | 53 | 1.8 | 1.0 | 19 | 7.4 | 1.4 | 1.8 |
| early4 · veil · base | 12 | 3,011 | 3,011 | 3,011 | -26 | 14 | 1.0 | 79 | 73 | 51 | 4.8 | 1.5 | 26 | 1.7 | 2.2 | 1.9 |
| early4 · veil · calm | 12 | 3,198 | 3,198 | 3,198 | -26 | 14 | 0.7 | 80 | 76 | 52 | 6.6 | 0.9 | 21 | 0.7 | 2.5 | 2.3 |
| early4 · veil · aphro | 12 | 3,117 | 3,117 | 3,117 | -22 | 14 | 1.6 | 79 | 75 | 52 | 5.1 | 1.5 | 35 | 4.1 | 2.6 | 2.4 |
| early4 · veil · focus | 12 | 2,986 | 2,986 | 2,986 | -27 | 14 | 0.8 | 80 | 73 | 51 | 6.1 | 1.5 | 37 | 1.7 | 2.2 | 2.0 |
| early4 · veil · velvet | 12 | 3,155 | 3,155 | 3,155 | -25 | 14 | 1.1 | 83 | 73 | 53 | 6.3 | 1.5 | 28 | 2.6 | 2.0 | 1.5 |
| early4 · veil · amber | 12 | 2,507 | 2,507 | 2,507 | -27 | 14 | 1.1 | 80 | 76 | 51 | 5.7 | 1.3 | 28 | 0.5 | 2.0 | 1.6 |
| early4 · lantern · base | 12 | 538 | 538 | 538 | 32 | 9.9 | 0.5 | 55 | 82 | 55 | -8.5 | 0.8 | 14 | 13 | 1.2 | 2.3 |
| early4 · lantern · calm | 12 | 595 | 595 | 595 | 31 | 10 | 0.3 | 56 | 84 | 56 | -9.5 | 0.4 | 9.2 | 13 | 1.3 | 2.2 |
| early4 · lantern · aphro | 12 | 567 | 567 | 567 | 31 | 9.8 | 0.9 | 56 | 81 | 56 | -5.4 | 0.7 | 7.7 | 13 | 1.0 | 1.9 |
| early4 · lantern · focus | 12 | 568 | 568 | 568 | 25 | 9.8 | 0.6 | 57 | 79 | 56 | -7.3 | 0.6 | 11 | 14 | 1.1 | 2.4 |
| early4 · lantern · velvet | 12 | 571 | 571 | 571 | 45 | 10 | 0.6 | 58 | 83 | 57 | -5.7 | 0.6 | 12 | 13 | 1.1 | 2.2 |
| early4 · lantern · amber | 12 | 517 | 517 | 517 | 24 | 11 | 0.6 | 57 | 86 | 56 | -4.6 | 0.7 | 15 | 9.3 | 1.2 | 2.3 |
| early4 · castle · base | 12 | 1,901 | 1,901 | 1,901 | -12ⁿ11 | 10 | 0.5 | 74 | 68 | 59 | 12 | 0.3 | 6.9 | 3.5 | 2.1 | 2.1 |
| early4 · castle · calm | 12 | 1,925 | 1,925 | 1,925 | -22ⁿ10 | 10 | 0.3 | 74 | 71 | 59 | 11 | 0.2 | 2.9 | 3.7 | 2.4 | 2.2 |
| early4 · castle · aphro | 12 | 1,929 | 1,929 | 1,929 | -7.1ⁿ10 | 9.7 | 0.9 | 74 | 68 | 58 | 12 | 0.3 | 6.3 | 3.3 | 2.8 | 2.2 |
| early4 · castle · focus | 12 | 2,031 | 2,031 | 2,031 | -12ⁿ10 | 10 | 0.6 | 75 | 67 | 57 | 15 | 0.3 | 9.2 | 3.1 | 2.7 | 2.8 |
| early4 · castle · velvet | 12 | 1,914 | 1,914 | 1,914 | -4.0ⁿ10 | 10 | 0.5 | 77 | 68 | 59 | 13 | 0.4 | 10 | 3.6 | 2.3 | 2.0 |
| early4 · castle · amber | 12 | 1,595 | 1,595 | 1,595 | -19ⁿ11 | 10 | 0.5 | 75 | 70 | 59 | 14 | 0.3 | 6.1 | 2.0 | 2.7 | 2.4 |
| early4 · conservatory · base | 12 | 1,560 | 1,560 | 1,560 | 28 | 13 | 1.0 | 74 | 75 | 49 | 1.0 | 0.6 | 11 | 12 | 2.3 | 2.7 |
| early4 · conservatory · calm | 12 | 1,643 | 1,643 | 1,643 | 54 | 14 | 0.7 | 74 | 80 | 49 | 6.5 | 0.2 | 3.3 | 12 | 1.7 | 2.3 |
| early4 · conservatory · aphro | 12 | 1,615 | 1,615 | 1,615 | 88 | 14 | 1.2 | 74 | 77 | 48 | 6.2 | 0.6 | 9.1 | 12 | 1.6 | 1.9 |
| early4 · conservatory · focus | 12 | 1,699 | 1,699 | 1,699 | 54 | 14 | 0.9 | 76 | 75 | 48 | 11 | 0.4 | 9.9 | 10.0 | 1.8 | 3.0 |
| early4 · conservatory · velvet | 12 | 1,626 | 1,626 | 1,626 | 77 | 14 | 1.3 | 78 | 78 | 52 | 9.9 | 0.4 | 12 | 12 | 2.0 | 2.7 |
| early4 · conservatory · amber | 12 | 1,317 | 1,317 | 1,317 | 35 | 15 | 1.3 | 79 | 79 | 50 | 16 | 0.5 | 9.4 | 8.1 | 2.2 | 2.2 |
| mid · tankard · base | 12 | 804 | 808 | 808 | 14 | 16 | 1.7 | 66 | 81 | 42 | 8.6 | 1.2 | 22 | 7.2 | -0.7 | -0.2 |
| mid · tankard · calm | 12 | 876 | 880 | 880 | 14 | 18 | 1.1 | 67 | 84 | 41 | 14 | 0.8 | 15 | 7.9 | -0.9 | -0.6 |
| mid · tankard · aphro | 12 | 583 | 587 | 587 | 26 | 15 | 2.8 | 60 | 83 | 43 | 4.1 | 1.1 | 20 | 7.4 | -0.5 | 0.0 |
| mid · tankard · focus | 12 | 747 | 750 | 750 | 17 | 15 | 2.1 | 64 | 82 | 43 | 5.7 | 1.0 | 23 | 9.4 | -0.3 | 0.9 |
| mid · tankard · velvet | 12 | 701 | 705 | 705 | 18 | 15 | 1.8 | 67 | 82 | 45 | 9.9 | 1.0 | 14 | 7.7 | -0.3 | 0.4 |
| mid · tankard · amber | 12 | 753 | 757 | 757 | 6.1 | 18 | 1.5 | 67 | 83 | 42 | 8.8 | 1.4 | 24 | 5.1 | -0.7 | -0.5 |
| mid · veil · base | 12 | 3,830 | 3,836 | 3,836 | 2.4 | 24 | 4.2 | 76 | 75 | 36 | 10 | 1.5 | 24 | 6.2 | -1.6 | -0.7 |
| mid · veil · calm | 12 | 4,388 | 4,394 | 4,394 | 0.7 | 25 | 3.0 | 79 | 79 | 36 | 17 | 0.8 | 10 | 6.1 | -1.5 | -0.5 |
| mid · veil · aphro | 12 | 4,263 | 4,269 | 4,269 | -2.6 | 23 | 3.7 | 82 | 77 | 37 | 16 | 1.5 | 19 | 6.3 | -1.1 | -0.2 |
| mid · veil · focus | 12 | 4,903 | 4,909 | 4,909 | -1.8 | 24 | 3.3 | 82 | 74 | 36 | 20 | 1.3 | 24 | 5.6 | -0.9 | 0.6 |
| mid · veil · velvet | 12 | 3,847 | 3,853 | 3,853 | 2.9 | 25 | 4.0 | 80 | 75 | 37 | 15 | 1.8 | 28 | 6.3 | -0.9 | -0.7 |
| mid · veil · amber | 12 | 2,843 | 2,849 | 2,849 | 0.1 | 22 | 4.5 | 74 | 78 | 38 | 7.4 | 1.7 | 31 | 6.5 | -1.6 | -0.6 |
| mid · lantern · base | 12 | 594 | 774 | 594 | 53 | 16 | 2.2 | 60 | 82 | 42 | 11 | 0.9 | 15 | 8.0 | -1.9 | -1.2 |
| mid · lantern · calm | 12 | 622 | 776 | 622 | 50 | 16 | 1.5 | 61 | 84 | 41 | 11 | 0.6 | 8.7 | 9.2 | -1.3 | -0.4 |
| mid · lantern · aphro | 12 | 681 | 919 | 681 | 61 | 18 | 2.4 | 61 | 84 | 39 | 17 | 0.7 | 9.5 | 8.7 | -2.4 | -2.0 |
| mid · lantern · focus | 12 | 654 | 881 | 654 | 55 | 17 | 2.0 | 63 | 83 | 42 | 16 | 0.8 | 14 | 8.2 | -1.7 | -0.6 |
| mid · lantern · velvet | 12 | 684 | 899 | 684 | 60 | 17 | 2.1 | 65 | 83 | 43 | 15 | 0.7 | 15 | 8.0 | -1.3 | -1.3 |
| mid · lantern · amber | 12 | 575 | 805 | 575 | 53 | 18 | 2.2 | 63 | 85 | 43 | 16 | 0.8 | 12 | 5.3 | -0.7 | -1.0 |
| mid · castle · base | 12 | 4,537 | 4,550 | 4,550 | 63 | 22 | 2.5 | 73 | 73 | 32 | 24 | 0.4 | 5.3 | 5.5 | -1.8 | -5.7 |
| mid · castle · calm | 12 | 4,455 | 4,469 | 4,469 | 55 | 22 | 1.7 | 73 | 74 | 34 | 25 | 0.3 | 6.8 | 5.8 | -1.1 | -4.7 |
| mid · castle · aphro | 12 | 4,782 | 4,796 | 4,796 | 51 | 20 | 2.9 | 77 | 73 | 32 | 26 | 0.4 | 8.6 | 5.8 | -1.0 | -5.3 |
| mid · castle · focus | 12 | 4,193 | 4,217 | 4,217 | 37 | 20 | 2.1 | 74 | 71 | 33 | 23 | 0.4 | 2.8 | 6.0 | -1.2 | -4.5 |
| mid · castle · velvet | 12 | 4,886 | 4,900 | 4,900 | 42 | 21 | 2.8 | 79 | 73 | 34 | 27 | 0.4 | 6.1 | 4.6 | -1.1 | -5.4 |
| mid · castle · amber | 12 | 3,458 | 3,482 | 3,482 | 27 | 19 | 2.1 | 78 | 73 | 33 | 25 | 0.4 | 8.1 | 3.9 | -0.8 | -4.9 |
| mid · conservatory · base | 12 | 2,399 | 2,399 | 2,399 | 97 | 23 | 4.0 | 74 | 77 | 32 | 20 | 0.7 | 5.8 | 7.1 | -1.7 | -2.1 |
| mid · conservatory · calm | 12 | 2,424 | 2,424 | 2,424 | 96 | 24 | 2.9 | 74 | 79 | 31 | 19 | 0.3 | 3.8 | 7.1 | -2.5 | -2.2 |
| mid · conservatory · aphro | 12 | 2,060 | 2,060 | 2,060 | 112 | 21 | 5.8 | 73 | 78 | 32 | 15 | 0.7 | 10 | 7.1 | -2.2 | -2.3 |
| mid · conservatory · focus | 12 | 2,203 | 2,203 | 2,203 | 80 | 22 | 3.5 | 73 | 75 | 31 | 16 | 0.7 | 11 | 7.1 | -2.1 | -1.6 |
| mid · conservatory · velvet | 12 | 2,328 | 2,328 | 2,328 | 94 | 23 | 3.9 | 77 | 77 | 35 | 20 | 0.5 | 6.5 | 7.8 | -1.9 | -2.2 |
| mid · conservatory · amber | 12 | 1,527 | 1,527 | 1,527 | 59 | 20 | 4.2 | 74 | 80 | 34 | 16 | 0.6 | 7.6 | 6.4 | -1.0 | -0.9 |
| late · tankard · base | 12 | 1,271 | 1,278 | 1,278 | 36 | 23 | 3.7 | 66 | 86 | 54 | 15 | 0.4 | 7.3 | 8.8 | 1.4 | 1.9 |
| late · tankard · calm | 12 | 1,390 | 1,397 | 1,397 | 35 | 24 | 3.5 | 65 | 88 | 53 | 11 | 0.4 | 7.4 | 9.2 | 1.1 | 1.9 |
| late · tankard · aphro | 12 | 1,188 | 1,194 | 1,194 | 37 | 23 | 4.4 | 64 | 87 | 55 | 12 | 0.6 | 12 | 10 | 1.3 | 1.7 |
| late · tankard · focus | 12 | 1,250 | 1,256 | 1,256 | 39 | 25 | 3.3 | 64 | 86 | 54 | 11 | 0.5 | 12 | 9.7 | 1.3 | 2.2 |
| late · tankard · velvet | 12 | 1,291 | 1,298 | 1,298 | 38 | 23 | 4.0 | 69 | 87 | 56 | 15 | 0.5 | 11 | 8.4 | 1.4 | 1.9 |
| late · tankard · amber | 12 | 1,207 | 1,214 | 1,214 | 27 | 24 | 4.5 | 67 | 88 | 55 | 16 | 0.5 | 13 | 5.8 | 1.5 | 1.8 |
| late · veil · base | 12 | 6,082 | 6,105 | 6,105 | 11 | 27 | 4.7 | 82 | 78 | 42 | 20 | 0.7 | 14 | 5.1 | 2.2 | 3.7 |
| late · veil · calm | 12 | 6,634 | 6,658 | 6,658 | 7.1 | 27 | 4.1 | 84 | 81 | 42 | 22 | 0.6 | 12 | 5.5 | 2.3 | 3.7 |
| late · veil · aphro | 12 | 5,983 | 6,006 | 6,006 | 12 | 26 | 5.2 | 83 | 79 | 42 | 17 | 0.8 | 16 | 6.5 | 1.7 | 3.2 |
| late · veil · focus | 12 | 6,427 | 6,450 | 6,450 | 12 | 27 | 4.1 | 82 | 77 | 42 | 20 | 0.8 | 9.3 | 5.7 | 2.1 | 4.1 |
| late · veil · velvet | 12 | 6,135 | 6,159 | 6,159 | 8.3 | 27 | 4.4 | 85 | 78 | 43 | 19 | 0.8 | 16 | 4.8 | 1.9 | 3.3 |
| late · veil · amber | 12 | 5,035 | 5,058 | 5,058 | 4.8 | 26 | 4.9 | 82 | 81 | 42 | 18 | 1.0 | 20 | 4.3 | 1.9 | 3.2 |
| late · lantern · base | 12 | 1,610 | 1,819 | 1,616 | 126 | 29 | 4.4 | 62 | 85 | 57 | 15 | 0.3 | 2.9 | 7.5 | 1.3 | 1.7 |
| late · lantern · calm | 12 | 1,679 | 1,963 | 1,684 | 135 | 30 | 3.9 | 64 | 88 | 56 | 16 | 0.3 | 9.2 | 7.0 | 1.5 | 1.7 |
| late · lantern · aphro | 12 | 1,627 | 1,906 | 1,632 | 154 | 29 | 4.9 | 62 | 86 | 58 | 14 | 0.3 | 7.3 | 7.8 | 1.1 | 1.6 |
| late · lantern · focus | 12 | 1,769 | 2,034 | 1,776 | 161 | 30 | 4.0 | 62 | 85 | 57 | 15 | 0.3 | 5.7 | 7.7 | 1.1 | 2.1 |
| late · lantern · velvet | 12 | 1,638 | 1,849 | 1,644 | 128 | 29 | 4.5 | 64 | 84 | 58 | 16 | 0.3 | 7.9 | 6.6 | 1.2 | 1.6 |
| late · lantern · amber | 12 | 1,456 | 1,766 | 1,462 | 116 | 29 | 4.7 | 63 | 87 | 58 | 13 | 0.5 | 9.3 | 4.5 | 1.6 | 1.7 |
| late · castle · base | 11 (+1 unreached) | 9,860 | 9,877 | 9,877 | 125 | 33 | 7.5 | 69 | 86 | 45 | 9.4 | 0.1 | 2.7 | 7.4 | 1.2 | 2.3 |
| late · castle · calm | 11 (+1 unreached) | 9,657 | 9,674 | 9,674 | 118 | 33 | 6.9 | 69 | 88 | 45 | 7.9 | 0.1 | 1.4 | 7.4 | 1.2 | 2.2 |
| late · castle · aphro | 11 (+1 unreached) | 9,347 | 9,365 | 9,365 | 127 | 32 | 8.8 | 69 | 87 | 46 | 8.2 | 0.1 | 1.7 | 7.3 | 1.2 | 2.2 |
| late · castle · focus | 11 (+1 unreached) | 9,577 | 9,594 | 9,594 | 119 | 33 | 7.2 | 69 | 86 | 46 | 6.8 | 0.1 | 3.0 | 7.2 | 1.3 | 2.6 |
| late · castle · velvet | 11 (+1 unreached) | 9,636 | 9,654 | 9,654 | 119 | 32 | 8.2 | 73 | 87 | 46 | 10 | 0.2 | 5.0 | 6.8 | 1.2 | 2.2 |
| late · castle · amber | 11 (+1 unreached) | 9,233 | 9,250 | 9,250 | 89 | 31 | 7.6 | 74 | 88 | 46 | 9.4 | 0.1 | 4.2 | 6.6 | 1.2 | 2.4 |
| late · conservatory · base | 12 | 3,757 | 3,772 | 3,772 | 151 | 28 | 5.4 | 76 | 85 | 45 | 21 | 0.5 | 8.4 | 8.8 | 1.5 | 2.1 |
| late · conservatory · calm | 12 | 3,845 | 3,860 | 3,860 | 168 | 29 | 4.6 | 76 | 87 | 44 | 20 | 0.2 | 5.8 | 9.0 | 1.5 | 1.8 |
| late · conservatory · aphro | 12 | 3,651 | 3,666 | 3,666 | 174 | 27 | 7.6 | 76 | 85 | 45 | 19 | 0.5 | 7.4 | 8.9 | 1.5 | 2.0 |
| late · conservatory · focus | 12 | 3,654 | 3,669 | 3,669 | 161 | 28 | 5.4 | 76 | 84 | 45 | 20 | 0.5 | 5.6 | 8.9 | 1.5 | 2.7 |
| late · conservatory · velvet | 12 | 3,728 | 3,743 | 3,743 | 156 | 29 | 5.8 | 80 | 85 | 47 | 20 | 0.6 | 13 | 8.6 | 1.6 | 2.2 |
| late · conservatory · amber | 12 | 2,953 | 2,968 | 2,968 | 115 | 28 | 5.9 | 79 | 88 | 45 | 21 | 0.5 | 7.4 | 7.0 | 1.6 | 2.0 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ net | Δ sat | Δ trouble | Δ restPct | Δ statGain | Δ skillGain |
|---|---|---|---|---|---|---|---|
| early4 · tankard · calm | +24.6 ± 62.3 | +24.6 ± 62.3 | +0.8 ± 1.9 | **-0.5 ± 0.1** | **-2.2 ± 1.3** | +0.0 ± 0.2 | -0.0 ± 0.2 |
| early4 · tankard · aphro | -23.4 ± 68.1 | -23.4 ± 68.1 | -0.3 ± 1.9 | +0.0 ± 0.2 | -0.0 ± 1.4 | -0.0 ± 0.2 | -0.1 ± 0.2 |
| early4 · tankard · focus | -5.1 ± 53.4 | -5.1 ± 53.4 | **+1.9 ± 1.2** | -0.0 ± 0.2 | -0.9 ± 1.5 | +0.0 ± 0.1 | **+0.2 ± 0.1** |
| early4 · tankard · velvet | +33.5 ± 37.5 | +33.5 ± 37.5 | **+2.6 ± 1.9** | +0.0 ± 0.2 | -0.6 ± 2.0 | +0.0 ± 0.2 | -0.1 ± 0.2 |
| early4 · tankard · amber | -0.5 ± 63.5 | -0.5 ± 63.5 | **+3.0 ± 2.0** | +0.1 ± 0.3 | **-4.7 ± 1.7** | +0.1 ± 0.1 | +0.0 ± 0.2 |
| early4 · veil · calm | +186.8 ± 284.9 | +186.8 ± 284.9 | **+1.1 ± 1.0** | **-0.7 ± 0.2** | **-1.1 ± 0.9** | +0.3 ± 0.8 | +0.3 ± 1.0 |
| early4 · veil · aphro | +105.9 ± 361.3 | +105.9 ± 361.3 | -0.0 ± 1.3 | -0.1 ± 0.2 | **+2.4 ± 2.0** | +0.4 ± 0.7 | +0.5 ± 0.8 |
| early4 · veil · focus | -25.0 ± 277.1 | -25.0 ± 277.1 | +0.2 ± 1.1 | -0.0 ± 0.2 | -0.0 ± 1.4 | -0.0 ± 0.1 | +0.1 ± 0.2 |
| early4 · veil · velvet | +144.0 ± 148.9 | +144.0 ± 148.9 | **+3.6 ± 1.1** | -0.0 ± 0.3 | +0.8 ± 1.2 | -0.3 ± 0.5 | -0.4 ± 0.7 |
| early4 · veil · amber | **-504.3 ± 175.0** | **-504.3 ± 175.0** | +0.2 ± 0.7 | **-0.3 ± 0.1** | -1.2 ± 1.3 | -0.2 ± 0.5 | -0.3 ± 0.6 |
| early4 · lantern · calm | **+56.8 ± 46.0** | **+56.8 ± 46.0** | +0.3 ± 1.5 | **-0.4 ± 0.1** | -0.6 ± 1.9 | +0.1 ± 0.1 | -0.1 ± 0.2 |
| early4 · lantern · aphro | +29.1 ± 58.5 | +29.1 ± 58.5 | +1.2 ± 2.1 | -0.1 ± 0.2 | +0.1 ± 2.2 | **-0.2 ± 0.1** | **-0.3 ± 0.3** |
| early4 · lantern · focus | +30.4 ± 53.8 | +30.4 ± 53.8 | **+1.9 ± 1.7** | -0.1 ± 0.2 | +0.2 ± 2.9 | -0.1 ± 0.2 | +0.1 ± 0.2 |
| early4 · lantern · velvet | +33.1 ± 70.4 | +33.1 ± 70.4 | **+2.5 ± 1.8** | -0.1 ± 0.2 | -0.3 ± 1.9 | -0.0 ± 0.1 | -0.1 ± 0.2 |
| early4 · lantern · amber | -20.3 ± 63.1 | -20.3 ± 63.1 | **+1.9 ± 1.5** | -0.0 ± 0.2 | **-4.0 ± 1.9** | +0.0 ± 0.2 | +0.0 ± 0.3 |
| early4 · castle · calm | +23.7 ± 210.4 | +23.7 ± 210.4 | +0.6 ± 2.3 | **-0.1 ± 0.1** | +0.2 ± 1.0 | +0.3 ± 1.9 | +0.2 ± 1.6 |
| early4 · castle · aphro | +28.1 ± 257.4 | +28.1 ± 257.4 | +0.6 ± 2.5 | -0.0 ± 0.1 | -0.2 ± 1.1 | +0.6 ± 1.8 | +0.2 ± 1.4 |
| early4 · castle · focus | +129.6 ± 226.6 | +129.6 ± 226.6 | +1.7 ± 2.2 | +0.0 ± 0.1 | -0.5 ± 1.0 | +0.6 ± 1.7 | +0.7 ± 1.2 |
| early4 · castle · velvet | +12.6 ± 232.7 | +12.6 ± 232.7 | **+3.7 ± 2.3** | **+0.1 ± 0.1** | +0.0 ± 0.8 | +0.2 ± 1.6 | -0.0 ± 1.2 |
| early4 · castle · amber | **-305.7 ± 102.1** | **-305.7 ± 102.1** | +1.2 ± 2.1 | -0.1 ± 0.1 | **-1.5 ± 1.2** | +0.6 ± 1.3 | +0.3 ± 0.9 |
| early4 · conservatory · calm | +82.3 ± 102.1 | +82.3 ± 102.1 | -0.3 ± 1.1 | **-0.4 ± 0.1** | -0.0 ± 2.9 | -0.6 ± 1.0 | -0.4 ± 0.8 |
| early4 · conservatory · aphro | +54.6 ± 168.9 | +54.6 ± 168.9 | -0.4 ± 1.7 | +0.0 ± 0.1 | +0.5 ± 3.1 | -0.7 ± 1.0 | -0.8 ± 0.9 |
| early4 · conservatory · focus | **+139.2 ± 112.1** | **+139.2 ± 112.1** | +1.4 ± 1.4 | -0.1 ± 0.2 | -1.9 ± 2.6 | -0.5 ± 1.0 | +0.3 ± 0.9 |
| early4 · conservatory · velvet | +66.0 ± 125.1 | +66.0 ± 125.1 | **+3.6 ± 1.5** | -0.1 ± 0.1 | -0.2 ± 2.6 | -0.3 ± 1.1 | -0.0 ± 1.1 |
| early4 · conservatory · amber | **-242.9 ± 132.3** | **-242.9 ± 132.3** | **+4.5 ± 1.7** | -0.1 ± 0.2 | **-3.9 ± 3.1** | -0.1 ± 1.2 | -0.5 ± 0.8 |
| mid · tankard · calm | +71.8 ± 100.4 | +71.8 ± 100.4 | +0.9 ± 1.3 | **-0.4 ± 0.3** | +0.7 ± 1.3 | -0.3 ± 0.7 | -0.5 ± 0.7 |
| mid · tankard · aphro | -220.8 ± 244.3 | -220.8 ± 244.3 | **-5.3 ± 5.1** | -0.1 ± 0.3 | +0.2 ± 1.4 | +0.2 ± 0.9 | +0.2 ± 1.3 |
| mid · tankard · focus | -57.7 ± 184.3 | -57.7 ± 184.3 | -1.9 ± 3.6 | **-0.2 ± 0.2** | **+2.2 ± 1.4** | +0.4 ± 0.9 | +1.0 ± 1.4 |
| mid · tankard · velvet | -103.3 ± 185.1 | -103.3 ± 185.1 | +1.5 ± 2.9 | -0.2 ± 0.3 | +0.5 ± 1.7 | +0.4 ± 0.9 | +0.6 ± 1.2 |
| mid · tankard · amber | -51.2 ± 158.5 | -51.2 ± 158.5 | +1.6 ± 3.2 | +0.1 ± 0.2 | **-2.0 ± 1.5** | -0.1 ± 0.7 | -0.3 ± 1.0 |
| mid · veil · calm | +557.9 ± 1,045 | +557.9 ± 1,045 | +3.3 ± 8.1 | **-0.7 ± 0.2** | -0.1 ± 1.7 | +0.1 ± 1.1 | +0.2 ± 1.1 |
| mid · veil · aphro | +432.9 ± 1,197 | +432.9 ± 1,197 | +6.8 ± 9.8 | -0.1 ± 0.3 | +0.2 ± 2.4 | +0.4 ± 1.0 | +0.5 ± 1.4 |
| mid · veil · focus | +1,073 ± 1,220 | +1,073 ± 1,220 | +6.9 ± 9.2 | -0.3 ± 0.3 | -0.6 ± 2.0 | +0.7 ± 0.8 | **+1.3 ± 1.2** |
| mid · veil · velvet | +17.2 ± 985.4 | +17.2 ± 985.4 | +4.7 ± 8.3 | +0.3 ± 0.4 | +0.1 ± 1.8 | **+0.7 ± 0.7** | -0.1 ± 1.0 |
| mid · veil · amber | **-986.7 ± 535.4** | **-986.7 ± 535.4** | -1.1 ± 6.6 | +0.1 ± 0.4 | +0.3 ± 1.4 | -0.0 ± 0.9 | +0.1 ± 0.8 |
| mid · lantern · calm | +27.8 ± 180.5 | +27.8 ± 180.5 | +1.4 ± 2.7 | **-0.3 ± 0.2** | +1.2 ± 1.7 | +0.6 ± 0.9 | +0.7 ± 0.9 |
| mid · lantern · aphro | +86.5 ± 118.2 | +86.5 ± 118.2 | +1.1 ± 2.3 | **-0.2 ± 0.2** | +0.7 ± 2.1 | -0.4 ± 0.9 | -0.8 ± 1.0 |
| mid · lantern · focus | +59.9 ± 181.4 | +59.9 ± 181.4 | +2.7 ± 3.6 | -0.1 ± 0.2 | +0.1 ± 1.1 | +0.2 ± 0.7 | +0.5 ± 1.3 |
| mid · lantern · velvet | +90.0 ± 120.1 | +90.0 ± 120.1 | **+4.9 ± 4.2** | -0.2 ± 0.2 | -0.0 ± 1.0 | +0.6 ± 0.8 | -0.2 ± 0.9 |
| mid · lantern · amber | -19.0 ± 111.2 | -19.0 ± 111.2 | +2.5 ± 2.7 | -0.0 ± 0.2 | **-2.7 ± 1.7** | **+1.2 ± 0.7** | +0.2 ± 1.1 |
| mid · castle · calm | -81.7 ± 894.8 | -81.7 ± 894.8 | +0.8 ± 4.3 | -0.1 ± 0.1 | +0.3 ± 1.2 | +0.7 ± 0.7 | +1.0 ± 1.4 |
| mid · castle · aphro | +245.3 ± 694.4 | +245.3 ± 694.4 | +3.8 ± 4.3 | +0.0 ± 0.1 | +0.3 ± 1.4 | +0.8 ± 1.1 | +0.3 ± 1.2 |
| mid · castle · focus | -344.4 ± 1,186 | -333.3 ± 1,172 | +1.6 ± 5.0 | +0.0 ± 0.1 | +0.5 ± 1.8 | +0.6 ± 0.6 | +1.2 ± 1.3 |
| mid · castle · velvet | +349.5 ± 560.2 | +349.5 ± 560.2 | **+5.9 ± 2.8** | +0.0 ± 0.1 | -0.9 ± 1.5 | +0.6 ± 0.9 | +0.2 ± 0.9 |
| mid · castle · amber | **-1,079 ± 863.0** | **-1,068 ± 845.3** | **+5.4 ± 3.3** | +0.1 ± 0.2 | **-1.6 ± 1.5** | **+0.9 ± 0.6** | +0.8 ± 1.4 |
| mid · conservatory · calm | +24.9 ± 233.9 | +24.9 ± 233.9 | +0.0 ± 3.0 | **-0.3 ± 0.1** | +0.0 ± 1.4 | -0.7 ± 0.9 | -0.1 ± 0.8 |
| mid · conservatory · aphro | -338.3 ± 510.5 | -338.3 ± 510.5 | -1.3 ± 4.2 | +0.1 ± 0.3 | -0.0 ± 1.7 | -0.4 ± 0.8 | -0.2 ± 0.9 |
| mid · conservatory · focus | -195.4 ± 278.5 | -195.4 ± 278.5 | -1.0 ± 2.1 | +0.1 ± 0.2 | -0.0 ± 1.3 | -0.4 ± 0.7 | +0.5 ± 0.7 |
| mid · conservatory · velvet | -70.4 ± 306.8 | -70.4 ± 306.8 | **+3.1 ± 2.2** | -0.1 ± 0.2 | +0.7 ± 1.2 | -0.2 ± 0.7 | -0.0 ± 0.9 |
| mid · conservatory · amber | **-871.4 ± 708.5** | **-871.4 ± 708.5** | -0.1 ± 5.4 | -0.0 ± 0.1 | -0.7 ± 2.1 | +0.7 ± 0.8 | **+1.2 ± 1.1** |
| late · tankard · calm | **+119.8 ± 99.9** | **+119.8 ± 99.9** | -0.6 ± 1.2 | -0.0 ± 0.3 | +0.4 ± 1.5 | **-0.2 ± 0.2** | +0.0 ± 0.2 |
| late · tankard · aphro | -82.5 ± 161.7 | -83.3 ± 162.9 | -1.9 ± 4.6 | **+0.2 ± 0.2** | +1.4 ± 1.6 | -0.0 ± 0.2 | -0.1 ± 0.2 |
| late · tankard · focus | -20.8 ± 151.2 | -21.6 ± 152.3 | -2.1 ± 3.6 | +0.1 ± 0.2 | +0.9 ± 1.2 | -0.1 ± 0.3 | **+0.3 ± 0.2** |
| late · tankard · velvet | +20.9 ± 65.7 | +20.0 ± 65.8 | **+2.9 ± 1.4** | +0.1 ± 0.2 | -0.4 ± 1.6 | +0.0 ± 0.3 | +0.1 ± 0.2 |
| late · tankard · amber | -63.5 ± 174.2 | -64.2 ± 174.4 | +1.0 ± 2.0 | +0.1 ± 0.2 | **-3.0 ± 1.6** | +0.2 ± 0.3 | -0.0 ± 0.1 |
| late · veil · calm | +552.5 ± 591.5 | +552.5 ± 591.5 | **+2.5 ± 1.7** | -0.1 ± 0.3 | +0.4 ± 0.7 | +0.1 ± 0.5 | +0.0 ± 0.5 |
| late · veil · aphro | -99.1 ± 478.6 | -99.1 ± 478.6 | +0.6 ± 1.7 | +0.2 ± 0.2 | **+1.4 ± 1.0** | -0.5 ± 0.5 | **-0.5 ± 0.4** |
| late · veil · focus | +345.0 ± 383.1 | +345.0 ± 383.1 | +0.5 ± 1.4 | +0.1 ± 0.2 | +0.6 ± 0.7 | -0.0 ± 0.5 | +0.4 ± 0.6 |
| late · veil · velvet | +53.4 ± 288.2 | +53.4 ± 288.2 | **+2.9 ± 2.1** | +0.1 ± 0.2 | -0.3 ± 0.9 | -0.3 ± 0.3 | -0.4 ± 0.4 |
| late · veil · amber | **-1,047 ± 413.5** | **-1,047 ± 413.5** | +0.6 ± 1.4 | +0.3 ± 0.3 | -0.8 ± 0.9 | -0.2 ± 0.5 | -0.4 ± 0.7 |
| late · lantern · calm | +68.7 ± 136.1 | +68.4 ± 136.3 | **+1.4 ± 1.3** | -0.0 ± 0.2 | -0.5 ± 1.4 | +0.2 ± 0.4 | -0.0 ± 0.2 |
| late · lantern · aphro | +16.8 ± 209.3 | +16.3 ± 210.1 | +0.1 ± 1.7 | -0.0 ± 0.3 | +0.3 ± 1.5 | -0.3 ± 0.4 | -0.1 ± 0.2 |
| late · lantern · focus | **+159.4 ± 136.9** | **+159.7 ± 137.0** | -0.0 ± 1.4 | -0.0 ± 0.1 | +0.3 ± 1.2 | -0.2 ± 0.3 | **+0.4 ± 0.2** |
| late · lantern · velvet | +28.4 ± 198.3 | +27.9 ± 198.7 | **+2.1 ± 1.9** | +0.0 ± 0.2 | -0.9 ± 1.2 | -0.1 ± 0.4 | -0.1 ± 0.2 |
| late · lantern · amber | -153.6 ± 257.2 | -154.1 ± 257.7 | +0.8 ± 2.7 | +0.2 ± 0.3 | **-3.0 ± 1.9** | +0.3 ± 0.5 | +0.0 ± 0.4 |
| late · castle · calm | -203.7 ± 787.8 | -203.2 ± 787.7 | -0.7 ± 2.0 | -0.0 ± 0.1 | +0.0 ± 1.1 | +0.0 ± 0.1 | -0.0 ± 0.1 |
| late · castle · aphro | -513.5 ± 893.1 | -512.3 ± 893.5 | -0.0 ± 2.2 | **+0.0 ± 0.0** | -0.1 ± 0.7 | +0.0 ± 0.1 | -0.1 ± 0.2 |
| late · castle · focus | -283.3 ± 846.8 | -282.8 ± 846.9 | -0.0 ± 1.7 | +0.0 ± 0.1 | -0.1 ± 0.7 | **+0.1 ± 0.1** | **+0.3 ± 0.2** |
| late · castle · velvet | -224.0 ± 845.0 | -222.9 ± 845.5 | +3.8 ± 3.9 | +0.1 ± 0.1 | -0.5 ± 0.6 | +0.0 ± 0.1 | -0.1 ± 0.2 |
| late · castle · amber | -627.7 ± 836.9 | -627.2 ± 837.3 | **+4.7 ± 4.4** | +0.0 ± 0.2 | **-0.8 ± 0.7** | +0.0 ± 0.1 | +0.1 ± 0.1 |
| late · conservatory · calm | +88.0 ± 254.6 | +88.0 ± 254.6 | -0.7 ± 1.9 | **-0.2 ± 0.2** | +0.3 ± 1.0 | +0.0 ± 0.2 | **-0.2 ± 0.2** |
| late · conservatory · aphro | -106.5 ± 337.5 | -106.5 ± 337.5 | -0.7 ± 2.2 | +0.0 ± 0.2 | +0.2 ± 1.1 | -0.0 ± 0.2 | -0.1 ± 0.3 |
| late · conservatory · focus | -102.9 ± 247.5 | -102.9 ± 247.5 | -0.5 ± 2.0 | -0.0 ± 0.1 | +0.1 ± 0.7 | +0.0 ± 0.1 | **+0.6 ± 0.3** |
| late · conservatory · velvet | -28.8 ± 250.9 | -28.8 ± 250.9 | **+3.6 ± 2.0** | +0.1 ± 0.3 | -0.2 ± 1.0 | +0.1 ± 0.2 | +0.2 ± 0.4 |
| late · conservatory · amber | **-803.8 ± 293.5** | **-803.8 ± 293.5** | **+2.9 ± 2.0** | **+0.0 ± 0.0** | **-1.8 ± 1.1** | **+0.1 ± 0.1** | -0.0 ± 0.2 |

---

### incense-campaign

All 5 incense blends over a full Cycle-1 campaign across 4 houses (Tankard, Veil, Lantern, Castle).

scenario **campaign** · 12 seeds from 1 · 208s · 2026-11-20T17:40

| variant | n | weeksToWin | winRate | cfHE | cfHM | cfHL | houseNet | guild | worth20 | rep | sat | trouble | restPct | statEnd | skillEnd | over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| tankard · base | 12 | 39 | 0.9 | 479 | 670 | 1,122 | 757 | 151 | -10,010 | 34 | 65 | 0.7 | 11 | 51 | 28 | 0.1 |
| tankard · calm | 12 | 32 | 1.0 | 495 | 813 | 1,221ⁿ11 | 860 | 166 | -8,582 | 35 | 66 | 0.6 | 10.0 | 51 | 27 | 0.0 |
| tankard · aphro | 12 | 32 | 1.0 | 482 | 778 | 1,276 | 849 | 159 | -9,828 | 36 | 66 | 0.9 | 11 | 51 | 27 | 0.0 |
| tankard · focus | 12 | 33 | 1.0 | 486 | 812 | 1,229ⁿ11 | 843 | 159 | -8,923 | 36 | 67 | 0.8 | 11 | 51 | 28 | 0.0 |
| tankard · velvet | 12 | 33 | 1.0 | 482 | 718 | 1,109ⁿ10 | 815 | 177 | -8,960 | 40 | 69 | 0.8 | 10 | 52 | 28 | 0.0 |
| tankard · amber | 12 | 30 | 1.0 | 401 | 712 | 1,361ⁿ11 | 829 | 209 | -9,860 | 34 | 68 | 1.0 | 6.5 | 52 | 28 | 0.0 |
| veil · base | 12 | 28 | 1.0 | 1,951 | 4,734 | 6,989ⁿ11 | 4,126 | 257 | -16,765 | 50 | 78 | 0.8 | 8.3 | 49 | 25 | 0.0 |
| veil · calm | 12 | 22 | 1.0 | 2,465 | 6,235 | 8,319ⁿ10 | 5,024 | 259 | 3,393 | 49 | 83 | 0.9 | 5.6 | 49 | 24 | 0.0 |
| veil · aphro | 12 | 25 | 1.0 | 2,100 | 4,936 | 7,337 | 4,394 | 231 | -16,925 | 49 | 82 | 1.1 | 9.5 | 48 | 24 | 0.0 |
| veil · focus | 12 | 32 | 0.9 | 2,162 | 4,494 | 6,304ⁿ11 | 3,949 | 281 | -18,270 | 45 | 78 | 1.2 | 9.5 | 49 | 26 | 0.1 |
| veil · velvet | 12 | 31 | 0.9 | 2,049 | 4,773 | 7,202ⁿ10 | 4,096 | 245 | -15,117 | 49 | 81 | 1.2 | 8.0 | 49 | 25 | 0.1 |
| veil · amber | 12 | 24 | 1.0 | 1,850 | 4,989 | 7,684 | 4,369 | 259 | -15,998 | 53 | 82 | 1.1 | 6.3 | 49 | 24 | 0.0 |
| lantern · base | 12 | 32 | 1.0 | 530 | 1,126 | 1,680ⁿ11 | 1,183 | 187 | -13,199 | 53 | 64 | 0.5 | 9.0 | 50 | 25 | 0.0 |
| lantern · calm | 12 | 28 | 1.0 | 662 | 1,410 | 2,211ⁿ11 | 1,389 | 166 | -8,742 | 53 | 67 | 0.5 | 7.5 | 50 | 26 | 0.0 |
| lantern · aphro | 12 | 29 | 1.0 | 730 | 1,534 | 1,913ⁿ10 | 1,404 | 181 | -7,487 | 54 | 68 | 0.6 | 8.5 | 49 | 24 | 0.0 |
| lantern · focus | 12 | 32 | 1.0 | 496 | 990 | 1,794ⁿ11 | 1,180 | 215 | -13,616 | 55 | 67 | 0.5 | 8.1 | 50 | 28 | 0.0 |
| lantern · velvet | 12 | 30 | 1.0 | 641 | 1,408 | 2,061ⁿ10 | 1,349 | 154 | -9,659 | 54 | 70 | 0.6 | 9.7 | 51 | 27 | 0.0 |
| lantern · amber | 12 | 30 | 1.0 | 577 | 1,283 | 1,947ⁿ11 | 1,342 | 150 | -10,961 | 55 | 66 | 0.7 | 5.3 | 51 | 26 | 0.0 |
| castle · base | 12 | 32 | 1.0 | 1,080 | 4,174 | 8,430 | 4,703 | 317 | -70,117 | 70 | 71 | 0.3 | 6.0 | 53 | 24 | 0.0 |
| castle · calm | 12 | 31 | 1.0 | 972 | 4,083 | 8,922 | 4,740 | 325 | -69,036 | 70 | 74 | 0.2 | 5.9 | 52 | 23 | 0.0 |
| castle · aphro | 12 | 31 | 1.0 | 1,157 | 4,829 | 8,984 | 5,010 | 271 | -61,666 | 70 | 73 | 0.3 | 6.6 | 52 | 24 | 0.0 |
| castle · focus | 12 | 30 | 1.0 | 1,034 | 4,797 | 9,373 | 5,076 | 315 | -62,529 | 73 | 72 | 0.2 | 6.2 | 52 | 24 | 0.0 |
| castle · velvet | 12 | 30 | 1.0 | 968 | 4,414 | 9,198 | 4,907 | 275 | -68,457 | 69 | 74 | 0.3 | 5.6 | 52 | 23 | 0.0 |
| castle · amber | 12 | 51 | 0.8 | 674 | 2,579 | 8,378ⁿ9 | 3,508 | 239 | -83,810ⁿ10 | 64 | 75 | 0.3 | 5.3 | 53 | 25 | 0.3 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ weeksToWin | Δ cfHE | Δ cfHM | Δ cfHL | Δ houseNet | Δ statEnd | Δ skillEnd | Δ trouble |
|---|---|---|---|---|---|---|---|---|
| tankard · calm | -6.8 ± 14.2 | +16.0 ± 112.9 | +143.5 ± 506.6 | +67.8 ± 708.0 | +102.7 ± 356.9 | -0.1 ± 1.5 | -1.0 ± 1.5 | **-0.1 ± 0.1** |
| tankard · aphro | -6.4 ± 12.9 | +2.7 ± 68.4 | +108.3 ± 390.5 | +154.2 ± 507.7 | +92.2 ± 260.6 | +0.1 ± 1.9 | -1.1 ± 1.9 | +0.1 ± 0.2 |
| tankard · focus | -5.9 ± 11.1 | +6.5 ± 86.4 | +142.9 ± 397.1 | +55.7 ± 583.4 | +86.4 ± 264.4 | -0.1 ± 2.0 | -0.4 ± 2.2 | +0.0 ± 0.3 |
| tankard · velvet | -5.9 ± 10.2 | +2.8 ± 76.7 | +48.4 ± 463.3 | -104.4 ± 568.9 | +57.5 ± 317.5 | +0.6 ± 2.3 | +0.1 ± 2.0 | +0.1 ± 0.2 |
| tankard · amber | -8.6 ± 11.9 | -78.1 ± 89.1 | +42.3 ± 379.0 | +187.6 ± 585.7 | +72.2 ± 256.2 | +1.0 ± 2.0 | -0.2 ± 2.4 | +0.2 ± 0.4 |
| veil · calm | **-6.3 ± 6.0** | **+513.3 ± 397.8** | +1,500 ± 1,520 | +2,024 ± 2,939 | +898.0 ± 917.8 | +0.0 ± 1.4 | -1.4 ± 1.5 | +0.1 ± 0.2 |
| veil · aphro | -3.6 ± 5.7 | +148.9 ± 398.2 | +201.0 ± 1,254 | +331.6 ± 2,271 | +268.6 ± 773.9 | -0.9 ± 1.0 | **-1.4 ± 1.3** | +0.3 ± 0.3 |
| veil · focus | +4.0 ± 14.7 | +210.1 ± 230.6 | -240.9 ± 1,680 | -65.9 ± 2,714 | -176.5 ± 1,013 | +0.1 ± 1.5 | +0.8 ± 1.1 | **+0.3 ± 0.3** |
| veil · velvet | +3.1 ± 16.2 | +97.8 ± 559.2 | +38.5 ± 2,272 | +125.8 ± 2,778 | -29.3 ± 1,378 | +0.5 ± 1.5 | -0.3 ± 1.0 | **+0.3 ± 0.3** |
| veil · amber | -3.9 ± 6.2 | -101.4 ± 292.5 | +254.8 ± 1,546 | +890.4 ± 2,849 | +242.8 ± 976.7 | +0.4 ± 1.3 | -0.7 ± 1.1 | +0.3 ± 0.3 |
| lantern · calm | -3.7 ± 4.4 | +131.8 ± 170.7 | +284.6 ± 380.3 | +530.9 ± 762.8 | +206.0 ± 250.8 | +0.1 ± 1.3 | +0.3 ± 2.4 | -0.0 ± 0.1 |
| lantern · aphro | -2.9 ± 5.1 | +199.9 ± 226.7 | +408.8 ± 666.5 | +168.3 ± 545.1 | +220.3 ± 422.5 | -1.2 ± 1.5 | -0.8 ± 1.8 | +0.1 ± 0.2 |
| lantern · focus | -0.3 ± 3.5 | -33.8 ± 106.5 | -135.3 ± 521.5 | +273.1 ± 493.8 | -3.1 ± 296.3 | +0.5 ± 0.9 | **+2.7 ± 1.6** | +0.0 ± 0.1 |
| lantern · velvet | -2.3 ± 6.0 | +110.6 ± 141.3 | +282.2 ± 761.1 | **+511.1 ± 500.7** | +165.4 ± 389.8 | +1.0 ± 1.0 | +1.9 ± 1.9 | +0.0 ± 0.2 |
| lantern · amber | -1.9 ± 5.8 | +47.4 ± 204.5 | +156.9 ± 725.8 | +272.6 ± 634.0 | +158.8 ± 435.5 | +1.2 ± 1.4 | +1.0 ± 2.4 | +0.1 ± 0.2 |
| castle · calm | -1.3 ± 4.0 | -108.6 ± 159.3 | -91.0 ± 1,505 | +491.8 ± 2,493 | +37.0 ± 768.9 | -0.8 ± 1.4 | **-1.0 ± 0.9** | -0.0 ± 0.1 |
| castle · aphro | -0.9 ± 3.4 | +77.3 ± 185.1 | +655.4 ± 1,087 | +554.0 ± 2,316 | +306.7 ± 647.2 | -0.9 ± 1.3 | -0.6 ± 1.4 | +0.0 ± 0.1 |
| castle · focus | -2.3 ± 3.1 | -45.9 ± 130.6 | +623.4 ± 1,298 | +942.3 ± 1,832 | +373.3 ± 529.8 | **-0.8 ± 0.8** | -0.3 ± 1.1 | -0.0 ± 0.1 |
| castle · velvet | -1.6 ± 3.2 | -111.9 ± 203.5 | +240.1 ± 1,111 | +767.9 ± 2,239 | +204.3 ± 605.7 | -0.1 ± 1.1 | -1.0 ± 1.1 | -0.0 ± 0.1 |
| castle · amber | **+19.6 ± 19.3** | **-406.3 ± 157.7** | **-1,595 ± 1,304** | +515.5 ± 3,431 | -1,195 ± 1,258 | +0.9 ± 1.1 | +0.6 ± 1.0 | +0.0 ± 0.1 |

---

### incense-niches

Targeted niche scenarios for every incense blend: rowdy Veil without security, Tankard on straw cots, Spirits on straw cots, Classroom training, and All-Beastkin (1.6x amplification).

scenario **mid** · 12 seeds from 1 · 120s · 2026-11-20T17:42

| variant | n | houseNet | total | net | perLady | served | props | sat | mood | trust | repGain | trouble | damage | restPct | statGain | skillGain |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| veil-nosec · base | 12 | 4,515 | 4,520 | 4,520 | 7.3 | 26 | 4.3 | 78 | 76 | 41 | 13 | 2.4 | 42 | 6.5 | -1.0 | -0.2 |
| veil-nosec · calm | 12 | 4,804 | 4,808 | 4,808 | 5.9 | 27 | 3.4 | 79 | 80 | 41 | 18 | 1.4 | 21 | 5.2 | -0.8 | 0.3 |
| veil-nosec · aphro | 12 | 4,506 | 4,510 | 4,510 | 3.1 | 25 | 4.4 | 83 | 78 | 43 | 15 | 2.1 | 36 | 4.9 | -0.6 | 0.4 |
| veil-nosec · focus | 12 | 5,424 | 5,429 | 5,429 | 0.4 | 26 | 3.4 | 83 | 75 | 41 | 21 | 2.2 | 44 | 5.2 | -0.7 | 1.3 |
| veil-nosec · velvet | 12 | 4,456 | 4,460 | 4,460 | 9.4 | 27 | 4.3 | 81 | 76 | 43 | 16 | 2.4 | 45 | 6.0 | -0.2 | 0.1 |
| veil-nosec · amber | 12 | 3,406 | 3,410 | 3,410 | 7.1 | 25 | 4.5 | 77 | 79 | 43 | 10 | 2.2 | 38 | 6.2 | -0.8 | 0.3 |
| tankard-straw · base | 12 | 678 | 679 | 679 | 16 | 15 | 1.4 | 62 | 83 | 47 | 6.1 | 1.0 | 22 | 16 | -0.8 | 0.3 |
| tankard-straw · calm | 12 | 778 | 779 | 779 | 13 | 15 | 1.5 | 62 | 85 | 46 | 8.4 | 0.7 | 16 | 15 | -0.3 | 0.5 |
| tankard-straw · aphro | 12 | 664 | 665 | 665 | 14 | 14 | 2.0 | 62 | 83 | 46 | 5.3 | 1.0 | 14 | 17 | -0.6 | 0.2 |
| tankard-straw · focus | 12 | 577 | 578 | 578 | 11 | 13 | 1.9 | 61 | 83 | 45 | 5.2 | 0.8 | 15 | 15 | -0.4 | 0.7 |
| tankard-straw · velvet | 12 | 680 | 681 | 681 | 11 | 14 | 1.6 | 65 | 84 | 49 | 7.2 | 1.0 | 19 | 13 | -0.5 | 0.3 |
| tankard-straw · amber | 12 | 604 | 605 | 605 | 4.5 | 15 | 1.6 | 64 | 85 | 48 | 6.4 | 0.8 | 11 | 13 | -0.2 | 1.1 |
| spirit-courtesans · base | 12 | 282 | 453 | 282 | 162 | 13 | 1.7 | 55 | 80 | 68 | -0.3 | 0.9 | 17 | 14 | 0.9 | 2.7 |
| spirit-courtesans · calm | 12 | 279 | 426 | 279 | 169 | 14 | 1.4 | 55 | 84 | 69 | 0.4 | 0.6 | 12 | 12 | 0.9 | 3.0 |
| spirit-courtesans · aphro | 12 | 261 | 351 | 261 | 151 | 13 | 2.0 | 54 | 80 | 67 | -1.2 | 0.9 | 15 | 18 | 0.9 | 2.5 |
| spirit-courtesans · focus | 12 | 301 | 426 | 301 | 168 | 13 | 1.8 | 55 | 80 | 68 | -2.5 | 0.9 | 13 | 13 | 1.3 | 3.4 |
| spirit-courtesans · velvet | 12 | 306 | 430 | 306 | 166 | 13 | 1.9 | 58 | 81 | 69 | 3.9 | 0.9 | 11 | 16 | 1.1 | 2.6 |
| spirit-courtesans · amber | 12 | 260 | 379 | 260 | 156 | 14 | 1.7 | 56 | 84 | 70 | 4.9 | 0.8 | 11 | 9.8 | 1.2 | 2.8 |
| classroom-24w · base | 12 | 713 | 713 | 713 | 86 | 16 | 2.1 | 65 | 79 | 66 | 23 | 0.8 | 12 | 9.7 | 4.8 | 21 |
| classroom-24w · calm | 12 | 724 | 724 | 724 | 100 | 17 | 2.1 | 66 | 82 | 67 | 28 | 0.5 | 11 | 7.4 | 4.5 | 21 |
| classroom-24w · aphro | 12 | 656 | 656 | 656 | 82 | 16 | 2.3 | 65 | 77 | 67 | 25 | 0.9 | 14 | 11 | 5.4 | 22 |
| classroom-24w · focus | 12 | 696 | 696 | 696 | 89 | 17 | 2.3 | 67 | 78 | 67 | 27 | 0.7 | 13 | 8.5 | 6.3 | 25 |
| classroom-24w · velvet | 12 | 772 | 772 | 772 | 79 | 17 | 2.5 | 69 | 78 | 68 | 28 | 0.8 | 14 | 9.0 | 5.0 | 21 |
| classroom-24w · amber | 12 | 738 | 738 | 738 | 66 | 18 | 2.4 | 67 | 81 | 65 | 26 | 0.7 | 13 | 6.8 | 5.8 | 21 |
| beastkin-160 · base | 12 | 843 | 1,101 | 843 | 77 | 20 | 2.8 | 62 | 83 | 45 | 24 | 0.5 | 9.9 | 6.8 | -1.1 | -0.6 |
| beastkin-160 · calm | 12 | 916 | 1,183 | 916 | 67 | 21 | 2.2 | 64 | 87 | 43 | 25 | 0.5 | 10 | 6.1 | -2.0 | -0.7 |
| beastkin-160 · aphro | 12 | 834 | 1,047 | 834 | 77 | 20 | 3.2 | 61 | 83 | 44 | 22 | 0.6 | 14 | 7.1 | -1.4 | -1.1 |
| beastkin-160 · focus | 12 | 835 | 1,020 | 835 | 81 | 21 | 2.7 | 60 | 83 | 43 | 21 | 0.8 | 15 | 7.3 | -1.4 | -0.3 |
| beastkin-160 · velvet | 12 | 870 | 1,005 | 870 | 58 | 19 | 2.5 | 64 | 81 | 46 | 22 | 0.8 | 10 | 7.3 | -1.6 | -0.8 |
| beastkin-160 · amber | 12 | 664 | 941 | 664 | 57 | 20 | 2.8 | 63 | 88 | 47 | 25 | 0.8 | 20 | 4.4 | -0.5 | -0.3 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ net | Δ sat | Δ trouble | Δ restPct | Δ statGain | Δ skillGain |
|---|---|---|---|---|---|---|---|
| veil-nosec · calm | +288.5 ± 907.9 | +288.5 ± 907.9 | +1.3 ± 6.4 | **-1.0 ± 0.3** | -1.3 ± 2.4 | +0.3 ± 1.1 | +0.5 ± 1.3 |
| veil-nosec · aphro | -9.7 ± 1,365 | -9.7 ± 1,365 | +5.4 ± 8.6 | -0.2 ± 0.3 | -1.6 ± 2.1 | +0.4 ± 1.2 | +0.5 ± 1.3 |
| veil-nosec · focus | +909.1 ± 1,301 | +909.2 ± 1,301 | +5.7 ± 8.1 | -0.1 ± 0.4 | -1.3 ± 2.2 | +0.3 ± 0.6 | **+1.5 ± 1.0** |
| veil-nosec · velvet | -59.7 ± 1,047 | -59.7 ± 1,047 | +3.6 ± 7.6 | +0.0 ± 0.3 | -0.5 ± 2.3 | +0.8 ± 0.8 | +0.3 ± 1.0 |
| veil-nosec · amber | **-1,109 ± 545.0** | **-1,109 ± 545.0** | -0.8 ± 4.2 | -0.2 ± 0.3 | -0.3 ± 1.9 | +0.2 ± 0.9 | +0.5 ± 0.7 |
| tankard-straw · calm | **+100.0 ± 92.6** | **+100.0 ± 92.6** | +0.7 ± 2.8 | **-0.3 ± 0.2** | -1.0 ± 1.6 | +0.5 ± 1.1 | +0.1 ± 1.2 |
| tankard-straw · aphro | -13.5 ± 71.1 | -13.5 ± 71.1 | +0.8 ± 1.9 | +0.0 ± 0.2 | +0.7 ± 2.6 | +0.2 ± 1.2 | -0.2 ± 1.3 |
| tankard-straw · focus | -101.2 ± 272.1 | -101.2 ± 272.2 | -0.1 ± 4.8 | -0.2 ± 0.2 | -1.1 ± 2.2 | +0.5 ± 1.1 | +0.3 ± 1.2 |
| tankard-straw · velvet | +2.3 ± 71.1 | +2.3 ± 71.1 | **+3.2 ± 2.2** | -0.0 ± 0.2 | **-2.4 ± 1.9** | +0.3 ± 1.0 | -0.0 ± 1.0 |
| tankard-straw · amber | -73.7 ± 92.1 | -73.7 ± 92.1 | +2.3 ± 2.8 | **-0.1 ± 0.1** | -3.3 ± 3.8 | +0.6 ± 1.4 | +0.7 ± 1.6 |
| spirit-courtesans · calm | -3.2 ± 47.9 | -3.2 ± 47.9 | +0.3 ± 1.6 | **-0.3 ± 0.1** | **-2.6 ± 1.5** | +0.0 ± 0.1 | **+0.3 ± 0.2** |
| spirit-courtesans · aphro | -21.5 ± 61.2 | -21.5 ± 61.2 | -1.2 ± 2.6 | -0.1 ± 0.2 | **+3.3 ± 3.3** | -0.0 ± 0.4 | -0.1 ± 0.4 |
| spirit-courtesans · focus | +18.6 ± 43.7 | +18.6 ± 43.7 | -0.3 ± 1.3 | -0.0 ± 0.2 | -0.7 ± 2.0 | +0.4 ± 0.4 | **+0.8 ± 0.4** |
| spirit-courtesans · velvet | +24.0 ± 43.1 | +24.0 ± 43.1 | **+3.3 ± 1.6** | -0.0 ± 0.1 | +2.2 ± 3.2 | +0.2 ± 0.2 | -0.0 ± 0.2 |
| spirit-courtesans · amber | -22.6 ± 74.7 | -22.6 ± 74.7 | +1.0 ± 1.5 | -0.1 ± 0.2 | **-4.3 ± 1.7** | **+0.3 ± 0.3** | +0.1 ± 0.3 |
| classroom-24w · calm | +11.9 ± 222.9 | +11.9 ± 222.9 | +0.2 ± 4.5 | **-0.3 ± 0.1** | **-2.3 ± 1.9** | -0.3 ± 1.3 | +0.6 ± 1.8 |
| classroom-24w · aphro | -56.8 ± 241.4 | -56.8 ± 241.4 | -0.7 ± 2.2 | +0.1 ± 0.1 | +1.1 ± 2.0 | +0.6 ± 1.4 | +1.2 ± 2.2 |
| classroom-24w · focus | -16.7 ± 194.4 | -16.7 ± 194.4 | +1.2 ± 2.8 | -0.0 ± 0.1 | -1.2 ± 1.4 | **+1.5 ± 1.3** | **+4.0 ± 3.6** |
| classroom-24w · velvet | +59.2 ± 278.9 | +59.2 ± 278.9 | **+3.9 ± 2.2** | +0.0 ± 0.1 | -0.7 ± 1.3 | +0.1 ± 1.2 | +0.7 ± 2.4 |
| classroom-24w · amber | +25.5 ± 185.4 | +25.5 ± 185.4 | +1.8 ± 2.3 | -0.0 ± 0.2 | **-2.9 ± 1.1** | +1.0 ± 1.2 | +0.2 ± 2.4 |
| beastkin-160 · calm | +73.1 ± 79.7 | +73.1 ± 79.7 | +1.6 ± 2.1 | -0.0 ± 0.1 | -0.8 ± 1.6 | -0.9 ± 0.9 | -0.2 ± 0.8 |
| beastkin-160 · aphro | -8.2 ± 170.4 | -8.2 ± 170.4 | -0.8 ± 3.3 | +0.1 ± 0.2 | +0.2 ± 1.8 | -0.3 ± 1.1 | -0.5 ± 1.4 |
| beastkin-160 · focus | -7.5 ± 97.2 | -7.5 ± 97.2 | -1.8 ± 2.6 | **+0.2 ± 0.2** | +0.5 ± 1.4 | -0.3 ± 0.6 | +0.3 ± 1.0 |
| beastkin-160 · velvet | +27.1 ± 254.9 | +27.1 ± 254.9 | +2.6 ± 4.9 | **+0.3 ± 0.2** | +0.4 ± 1.9 | -0.5 ± 0.8 | -0.2 ± 0.9 |
| beastkin-160 · amber | **-178.6 ± 108.0** | **-178.6 ± 108.0** | +1.2 ± 1.8 | **+0.3 ± 0.2** | **-2.5 ± 1.5** | +0.5 ± 0.8 | +0.3 ± 0.7 |

---

### race-courtesan-phases

Courtesan role by race across early4/mid/late and Tankard/Lantern/Castle (2 tested ladies, rest humans, fixed staff count).

scenario **mid** · 12 seeds from 1 · 320s · 2026-11-20T17:48

| variant | n | houseNet | total | net | testedNet | testedServed | testedRest | testedRech | sat | repGain | prestige | staff |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| early4 · tankard · base | 12 | 424 | 424 | 424 | 19ⁿ11 | 2.1ⁿ11 | 1.9ⁿ11 | 0.0ⁿ11 | 59 | -4.4 | 0.7 | 4.1 |
| early4 · tankard · elf | 12 | 454 | 454 | 454 | 19ⁿ11 | 2.0ⁿ11 | 2.3ⁿ11 | 0.0ⁿ11 | 59 | -2.3 | 0.9 | 4.1 |
| early4 · tankard · beastkin/fox | 12 | 476 | 476 | 476 | 34ⁿ11 | 2.3ⁿ11 | 2.7ⁿ11 | 0.0ⁿ11 | 59 | -2.9 | 1.1 | 4.1 |
| early4 · tankard · beastkin/cat | 12 | 466 | 466 | 466 | 38ⁿ11 | 2.6ⁿ11 | 2.3ⁿ11 | 0.0ⁿ11 | 58 | -2.9 | 0.8 | 4.1 |
| early4 · tankard · beastkin/wolf | 12 | 469 | 469 | 469 | 44ⁿ11 | 2.5ⁿ11 | 3.8ⁿ11 | 0.0ⁿ11 | 59 | -3.4 | 0.8 | 4.1 |
| early4 · tankard · beastkin/rabbit | 12 | 452 | 452 | 452 | 45ⁿ11 | 2.5ⁿ11 | 3.4ⁿ11 | 0.0ⁿ11 | 60 | -2.2 | 0.9 | 4.1 |
| early4 · tankard · beastkin/dragon | 12 | 437 | 437 | 437 | 30ⁿ11 | 2.5ⁿ11 | 4.2ⁿ11 | 0.0ⁿ11 | 58 | -2.7 | 0.9 | 4.1 |
| early4 · tankard · demon | 12 | 480 | 480 | 480 | 63ⁿ11 | 2.7ⁿ11 | 1.1ⁿ11 | 0.0ⁿ11 | 60 | -1.9 | 1.0 | 4.1 |
| early4 · tankard · dwarf | 12 | 417 | 417 | 417 | 26ⁿ11 | 2.3ⁿ11 | 1.1ⁿ11 | 0.0ⁿ11 | 59 | -3.6 | 0.8 | 4.1 |
| early4 · tankard · spirit | 12 | 445 | 445 | 445 | 39ⁿ11 | 2.3ⁿ11 | 4.9ⁿ11 | 0.0ⁿ11 | 61 | -2.2 | 0.9 | 4.1 |
| early4 · tankard · angel | 12 | 453 | 453 | 453 | 32ⁿ11 | 2.5ⁿ11 | 3.4ⁿ11 | 0.0ⁿ11 | 60 | -3.1 | 0.6 | 4.1 |
| early4 · tankard · angel/lantern | 12 | 434 | 434 | 434 | 31ⁿ11 | 2.3ⁿ11 | 4.2ⁿ11 | 0.0ⁿ11 | 59 | -3.2 | 0.9 | 4.1 |
| early4 · tankard · android | 12 | 412 | 412 | 412 | 7.8ⁿ11 | 2.8ⁿ11 | 0.0ⁿ11 | 53ⁿ11 | 60 | -0.6 | 1.0 | 4.1 |
| early4 · lantern · base | 12 | 519 | 519 | 519 | 54 | 2.0 | 4.5 | 0.0 | 52 | -7.1 | 33 | 4.1 |
| early4 · lantern · elf | 12 | 517 | 517 | 517 | 67 | 2.1 | 2.4 | 0.0 | 53 | -8.8 | 33 | 4.1 |
| early4 · lantern · beastkin/fox | 12 | 599 | 599 | 599 | 78 | 2.1 | 2.4 | 0.0 | 53 | -7.0 | 34 | 4.1 |
| early4 · lantern · beastkin/cat | 12 | 571 | 571 | 571 | 80 | 2.3 | 2.1 | 0.0 | 52 | -8.9 | 33 | 4.1 |
| early4 · lantern · beastkin/wolf | 12 | 556 | 556 | 556 | 85 | 2.2 | 3.8 | 0.0 | 53 | -8.6 | 34 | 4.1 |
| early4 · lantern · beastkin/rabbit | 12 | 569 | 569 | 569 | 77 | 2.0 | 2.1 | 0.0 | 53 | -9.3 | 33 | 4.1 |
| early4 · lantern · beastkin/dragon | 12 | 517 | 517 | 517 | 62 | 2.2 | 4.5 | 0.0 | 52 | -8.5 | 33 | 4.1 |
| early4 · lantern · demon | 12 | 579 | 579 | 579 | 145 | 2.8 | 0.7 | 0.0 | 53 | -7.8 | 31 | 4.1 |
| early4 · lantern · dwarf | 12 | 567 | 567 | 567 | 65 | 2.2 | 0.7 | 0.0 | 52 | -8.0 | 33 | 4.1 |
| early4 · lantern · spirit | 12 | 550 | 550 | 550 | 74 | 2.2 | 2.8 | 0.0 | 55 | -6.1 | 33 | 4.1 |
| early4 · lantern · angel | 12 | 531 | 531 | 531 | 70 | 2.4 | 4.9 | 0.0 | 52 | -9.1 | 32 | 4.1 |
| early4 · lantern · angel/lantern | 12 | 587 | 587 | 587 | 75 | 2.2 | 3.8 | 0.0 | 53 | -6.0 | 32 | 4.1 |
| early4 · lantern · android | 12 | 524 | 524 | 524 | 85 | 2.7 | 0.3 | 52 | 55 | -6.3 | 33 | 4.1 |
| early4 · castle · base | 12 | 1,796 | 1,796 | 1,796 | 18ⁿ10 | 0.8ⁿ10 | 1.7ⁿ10 | 0.0ⁿ10 | 71 | 8.8 | 72 | 4.7 |
| early4 · castle · elf | 12 | 1,897 | 1,897 | 1,897 | 34ⁿ10 | 0.6ⁿ10 | 1.7ⁿ10 | 0.0ⁿ10 | 72 | 13 | 73 | 4.8 |
| early4 · castle · beastkin/fox | 12 | 1,913 | 1,913 | 1,913 | 18ⁿ10 | 0.5ⁿ10 | 0.0ⁿ10 | 0.0ⁿ10 | 72 | 11 | 72 | 4.8 |
| early4 · castle · beastkin/cat | 12 | 1,827 | 1,827 | 1,827 | 7.1ⁿ10 | 0.3ⁿ10 | 0.0ⁿ10 | 0.0ⁿ10 | 72 | 8.7 | 72 | 4.7 |
| early4 · castle · beastkin/wolf | 12 | 1,875 | 1,875 | 1,875 | 20ⁿ10 | 0.6ⁿ10 | 0.0ⁿ10 | 0.0ⁿ10 | 71 | 9.9 | 72 | 4.9 |
| early4 · castle · beastkin/rabbit | 12 | 1,837 | 1,837 | 1,837 | 37ⁿ10 | 0.8ⁿ10 | 1.7ⁿ10 | 0.0ⁿ10 | 71 | 6.9 | 72 | 4.8 |
| early4 · castle · beastkin/dragon | 12 | 1,833 | 1,833 | 1,833 | 10ⁿ10 | 0.5ⁿ10 | 1.7ⁿ10 | 0.0ⁿ10 | 72 | 10.0 | 73 | 4.8 |
| early4 · castle · demon | 12 | 1,788 | 1,788 | 1,788 | 71ⁿ10 | 0.9ⁿ10 | 3.8ⁿ10 | 0.0ⁿ10 | 70 | 6.9 | 72 | 4.8 |
| early4 · castle · dwarf | 12 | 1,841 | 1,841 | 1,841 | 6.1ⁿ10 | 0.6ⁿ10 | 0.4ⁿ10 | 0.0ⁿ10 | 71 | 9.9 | 72 | 4.9 |
| early4 · castle · spirit | 12 | 1,693 | 1,693 | 1,693 | 18ⁿ10 | 0.7ⁿ10 | 0.0ⁿ10 | 0.0ⁿ10 | 71 | 9.4 | 74 | 5.0 |
| early4 · castle · angel | 12 | 1,765 | 1,765 | 1,765 | 21ⁿ10 | 0.8ⁿ10 | 0.8ⁿ10 | 0.0ⁿ10 | 71 | 11 | 72 | 4.9 |
| early4 · castle · angel/lantern | 12 | 1,740 | 1,740 | 1,740 | 18ⁿ10 | 0.6ⁿ10 | 0.0ⁿ10 | 0.0ⁿ10 | 71 | 8.0 | 73 | 4.7 |
| early4 · castle · android | 12 | 1,846 | 1,846 | 1,846 | -1.4ⁿ10 | 0.6ⁿ10 | 0.0ⁿ10 | 23ⁿ10 | 72 | 9.8 | 73 | 4.8 |
| mid · tankard · base | 12 | 573 | 577 | 577 | 59 | 4.0 | 4.2 | 0.0 | 56 | 0.8 | 7.6 | 5.8 |
| mid · tankard · elf | 12 | 461 | 464 | 464 | 53 | 3.6 | 3.8 | 0.0 | 56 | 0.3 | 6.2 | 5.8 |
| mid · tankard · beastkin/fox | 12 | 501 | 502 | 502 | 69 | 3.9 | 3.5 | 0.0 | 56 | 0.1 | 5.9 | 5.8 |
| mid · tankard · beastkin/cat | 12 | 459 | 463 | 463 | 82 | 4.5 | 1.7 | 0.0 | 54 | -3.1 | 5.4 | 5.8 |
| mid · tankard · beastkin/wolf | 12 | 563 | 567 | 567 | 76 | 4.0 | 4.2 | 0.0 | 57 | -1.2 | 6.3 | 5.8 |
| mid · tankard · beastkin/rabbit | 12 | 546 | 549 | 549 | 71 | 3.7 | 2.1 | 0.0 | 57 | 2.3 | 6.4 | 5.8 |
| mid · tankard · beastkin/dragon | 12 | 482 | 486 | 486 | 61 | 3.8 | 5.9 | 0.0 | 57 | -0.3 | 6.7 | 5.8 |
| mid · tankard · demon | 12 | 641 | 644 | 644 | 149 | 4.9 | 0.7 | 0.0 | 59 | 3.0 | 5.7 | 5.8 |
| mid · tankard · dwarf | 12 | 426 | 430 | 430 | 70 | 4.2 | 2.1 | 0.0 | 53 | -2.2 | 5.9 | 5.8 |
| mid · tankard · spirit | 12 | 536 | 540 | 540 | 60 | 3.3 | 3.5 | 0.0 | 61 | 7.0 | 9.1 | 5.8 |
| mid · tankard · angel | 12 | 480 | 483 | 483 | 53 | 3.6 | 4.5 | 0.0 | 58 | 0.5 | 7.0 | 5.8 |
| mid · tankard · angel/lantern | 12 | 497 | 501 | 501 | 62 | 3.6 | 5.9 | 0.0 | 57 | 0.3 | 6.2 | 5.8 |
| mid · tankard · android | 12 | 447 | 451 | 451 | 46 | 4.5 | 0.0 | 82 | 62 | 6.3 | 8.1 | 5.8 |
| mid · lantern · base | 12 | 271 | 465 | 271 | 158 | 5.1 | 6.3 | 0.0 | 50 | -1.8 | 41 | 5.3 |
| mid · lantern · elf | 12 | 377 | 538 | 377 | 182 | 5.3 | 5.8 | 0.0 | 51 | -3.6 | 38 | 5.3 |
| mid · lantern · beastkin/fox | 12 | 373 | 483 | 373 | 176 | 5.4 | 4.9 | 0.0 | 50 | -4.4 | 38 | 5.3 |
| mid · lantern · beastkin/cat | 12 | 311 | 509 | 311 | 178 | 5.4 | 3.1 | 0.0 | 49 | -2.4 | 39 | 5.3 |
| mid · lantern · beastkin/wolf | 12 | 317 | 481 | 317 | 166 | 4.9 | 9.4 | 0.0 | 53 | -3.0 | 40 | 5.3 |
| mid · lantern · beastkin/rabbit | 12 | 373 | 503 | 373 | 182 | 5.4 | 5.6 | 0.0 | 51 | -4.0 | 37 | 5.3 |
| mid · lantern · beastkin/dragon | 12 | 338 | 533 | 338 | 162 | 5.1 | 8.0 | 0.0 | 51 | -2.2 | 39 | 5.3 |
| mid · lantern · demon | 12 | 628 | 826 | 628 | 378 | 6.5 | 0.7 | 0.0 | 56 | 3.8 | 39 | 5.3 |
| mid · lantern · dwarf | 12 | 336 | 517 | 336 | 166 | 5.1 | 2.8 | 0.0 | 49 | -2.8 | 38 | 5.3 |
| mid · lantern · spirit | 12 | 417 | 551 | 417 | 161 | 4.9 | 3.5 | 0.0 | 55 | 1.5 | 38 | 5.3 |
| mid · lantern · angel | 12 | 298 | 479 | 298 | 160 | 5.1 | 9.0 | 0.0 | 52 | -2.0 | 38 | 5.3 |
| mid · lantern · angel/lantern | 12 | 364 | 478 | 364 | 175 | 5.3 | 5.6 | 0.0 | 51 | -5.2 | 37 | 5.3 |
| mid · lantern · android | 12 | 387 | 613 | 387 | 279 | 6.4 | 0.0 | 102 | 59 | 6.1 | 41 | 5.3 |
| mid · castle · base | 12 | 2,171 | 2,193 | 2,193 | 141 | 2.6 | 3.8 | 0.0 | 62 | 1.5 | 79 | 6.1 |
| mid · castle · elf | 12 | 2,649 | 2,659 | 2,659 | 173 | 2.7 | 4.2 | 0.0 | 66 | 10 | 81 | 6.3 |
| mid · castle · beastkin/fox | 12 | 2,612 | 2,623 | 2,623 | 155 | 2.8 | 3.8 | 0.0 | 64 | 9.7 | 82 | 6.2 |
| mid · castle · beastkin/cat | 12 | 2,377 | 2,399 | 2,399 | 159 | 2.9 | 2.4 | 0.0 | 61 | 3.4 | 81 | 6.3 |
| mid · castle · beastkin/wolf | 12 | 2,360 | 2,382 | 2,382 | 168 | 2.8 | 5.9 | 0.0 | 62 | 4.3 | 80 | 6.3 |
| mid · castle · beastkin/rabbit | 12 | 2,254 | 2,264 | 2,264 | 168 | 2.9 | 2.8 | 0.0 | 62 | 7.1 | 80 | 6.2 |
| mid · castle · beastkin/dragon | 12 | 2,436 | 2,446 | 2,446 | 150 | 2.9 | 5.2 | 0.0 | 60 | 5.2 | 80 | 6.1 |
| mid · castle · demon | 12 | 2,152 | 2,174 | 2,174 | 259 | 3.2 | 0.0 | 0.0 | 62 | 4.7 | 80 | 6.2 |
| mid · castle · dwarf | 12 | 2,796 | 2,806 | 2,806 | 161 | 3.0 | 3.1 | 0.0 | 64 | 12 | 81 | 6.3 |
| mid · castle · spirit | 12 | 2,177 | 2,187 | 2,187 | 164 | 3.1 | 1.7 | 0.0 | 60 | 7.7 | 80 | 6.2 |
| mid · castle · angel | 12 | 2,263 | 2,274 | 2,274 | 165 | 3.0 | 3.5 | 0.0 | 61 | 8.9 | 80 | 6.2 |
| mid · castle · angel/lantern | 12 | 2,422 | 2,444 | 2,444 | 178 | 2.6 | 1.7 | 0.0 | 64 | 9.5 | 81 | 6.3 |
| mid · castle · android | 12 | 2,477 | 2,487 | 2,487 | 258 | 3.8 | 0.0 | 66 | 64 | 13 | 81 | 6.3 |
| late · tankard · base | 12 | 934 | 936 | 936 | 99 | 4.9 | 4.5 | 0.0 | 55 | 1.7 | 7.6 | 9.1 |
| late · tankard · elf | 12 | 949 | 951 | 951 | 98 | 5.1 | 2.4 | 0.0 | 56 | 1.5 | 7.6 | 9.1 |
| late · tankard · beastkin/fox | 12 | 977 | 978 | 978 | 121 | 5.3 | 2.8 | 0.0 | 57 | 0.7 | 9.3 | 9.1 |
| late · tankard · beastkin/cat | 12 | 1,026 | 1,027 | 1,027 | 116 | 5.4 | 0.7 | 0.0 | 56 | -0.4 | 7.1 | 9.1 |
| late · tankard · beastkin/wolf | 12 | 982 | 984 | 984 | 134 | 5.4 | 3.1 | 0.0 | 56 | 0.6 | 7.6 | 9.1 |
| late · tankard · beastkin/rabbit | 12 | 1,018 | 1,020 | 1,020 | 121 | 5.1 | 2.8 | 0.0 | 57 | 1.9 | 9.3 | 9.1 |
| late · tankard · beastkin/dragon | 12 | 1,022 | 1,024 | 1,024 | 110 | 5.3 | 8.7 | 0.0 | 57 | 1.7 | 9.2 | 9.1 |
| late · tankard · demon | 12 | 1,135 | 1,136 | 1,136 | 181 | 5.2 | 1.4 | 0.0 | 62 | -1.8 | 5.6 | 9.1 |
| late · tankard · dwarf | 12 | 852 | 854 | 854 | 134 | 6.1 | 1.7 | 0.0 | 53 | -0.4 | 7.2 | 9.1 |
| late · tankard · spirit | 12 | 1,026 | 1,027 | 1,027 | 113 | 4.7 | 2.4 | 0.0 | 61 | 6.8 | 8.8 | 9.1 |
| late · tankard · angel | 12 | 858 | 859 | 859 | 101 | 5.0 | 4.5 | 0.0 | 56 | 2.8 | 7.3 | 9.1 |
| late · tankard · angel/lantern | 12 | 1,037 | 1,038 | 1,038 | 114 | 5.0 | 4.9 | 0.0 | 58 | 3.4 | 8.1 | 9.1 |
| late · tankard · android | 12 | 899 | 901 | 901 | 76 | 5.3 | 0.7 | 100 | 62 | 5.2 | 6.8 | 9.1 |
| late · lantern · base | 12 | 1,300 | 1,555 | 1,303 | 232 | 5.8 | 5.2 | 0.0 | 57 | 4.2 | 39 | 9.2 |
| late · lantern · elf | 12 | 1,338 | 1,583 | 1,341 | 266 | 5.9 | 4.9 | 0.0 | 58 | 8.7 | 40 | 9.2 |
| late · lantern · beastkin/fox | 12 | 1,348 | 1,546 | 1,351 | 258 | 6.4 | 3.8 | 0.0 | 58 | 7.3 | 42 | 9.2 |
| late · lantern · beastkin/cat | 12 | 1,285 | 1,505 | 1,288 | 257 | 6.6 | 1.7 | 0.0 | 57 | 4.9 | 37 | 9.2 |
| late · lantern · beastkin/wolf | 12 | 1,313 | 1,564 | 1,316 | 285 | 6.6 | 3.5 | 0.0 | 58 | 8.1 | 41 | 9.2 |
| late · lantern · beastkin/rabbit | 12 | 1,341 | 1,548 | 1,344 | 260 | 6.1 | 3.8 | 0.0 | 59 | 11 | 40 | 9.2 |
| late · lantern · beastkin/dragon | 12 | 1,235 | 1,419 | 1,238 | 241 | 6.0 | 11 | 0.0 | 57 | 7.9 | 40 | 9.2 |
| late · lantern · demon | 12 | 1,682 | 1,955 | 1,685 | 660 | 8.7 | 0.3 | 0.0 | 62 | 6.5 | 37 | 9.1 |
| late · lantern · dwarf | 12 | 1,285 | 1,482 | 1,288 | 271 | 6.9 | 1.4 | 0.0 | 56 | 6.3 | 39 | 9.1 |
| late · lantern · spirit | 12 | 1,274 | 1,508 | 1,278 | 245 | 5.5 | 4.2 | 0.0 | 61 | 10 | 41 | 9.2 |
| late · lantern · angel | 12 | 1,338 | 1,570 | 1,341 | 240 | 5.6 | 8.3 | 0.0 | 58 | 6.9 | 40 | 9.1 |
| late · lantern · angel/lantern | 12 | 1,358 | 1,565 | 1,361 | 256 | 5.8 | 8.0 | 0.0 | 59 | 10 | 41 | 9.2 |
| late · lantern · android | 12 | 1,432 | 1,679 | 1,435 | 430 | 7.6 | 0.3 | 127 | 63 | 9.1 | 36 | 9.2 |
| late · castle · base | 11 (+1 unreached) | 9,800 | 9,820 | 9,820 | 365 | 4.5 | 0.8 | 0.0 | 67 | 7.6 | 96 | 19 |
| late · castle · elf | 11 (+1 unreached) | 9,203 | 9,219 | 9,219 | 556 | 4.8 | 0.6 | 0.0 | 70 | 11 | 97 | 19 |
| late · castle · beastkin/fox | 11 (+1 unreached) | 9,077 | 9,095 | 9,095 | 415 | 4.9 | 0.6 | 0.0 | 66 | 7.1 | 97 | 19 |
| late · castle · beastkin/cat | 11 (+1 unreached) | 9,083 | 9,099 | 9,099 | 430 | 4.8 | 0.5 | 0.0 | 66 | 5.7 | 95 | 19 |
| late · castle · beastkin/wolf | 11 (+1 unreached) | 9,124 | 9,141 | 9,141 | 411 | 4.8 | 0.6 | 0.0 | 66 | 6.3 | 97 | 19 |
| late · castle · beastkin/rabbit | 11 (+1 unreached) | 9,109 | 9,125 | 9,125 | 428 | 4.6 | 0.5 | 0.0 | 67 | 7.7 | 95 | 19 |
| late · castle · beastkin/dragon | 11 (+1 unreached) | 9,206 | 9,223 | 9,223 | 419 | 4.9 | 0.6 | 0.0 | 65 | 5.3 | 96 | 19 |
| late · castle · demon | 11 (+1 unreached) | 8,683 | 8,700 | 8,700 | 844 | 6.0 | 0.9 | 0.0 | 68 | 5.5 | 96 | 19 |
| late · castle · dwarf | 11 (+1 unreached) | 9,072 | 9,088 | 9,088 | 442 | 4.7 | 0.5 | 0.0 | 65 | 7.6 | 94 | 19 |
| late · castle · spirit | 11 (+1 unreached) | 8,905 | 8,922 | 8,922 | 394 | 4.4 | 0.6 | 0.0 | 66 | 5.7 | 95 | 19 |
| late · castle · angel | 11 (+1 unreached) | 8,711 | 8,727 | 8,727 | 477 | 4.9 | 0.5 | 0.0 | 66 | 7.3 | 97 | 19 |
| late · castle · angel/lantern | 11 (+1 unreached) | 9,080 | 9,097 | 9,097 | 466 | 4.6 | 0.8 | 0.0 | 68 | 6.3 | 96 | 19 |
| late · castle · android | 11 (+1 unreached) | 8,876 | 8,893 | 8,893 | 615 | 5.3 | 0.8 | 97 | 72 | 8.2 | 97 | 19 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ testedNet | Δ testedServed | Δ testedRest | Δ sat |
|---|---|---|---|---|---|
| early4 · tankard · elf | +30.0 ± 34.2 | +0.4 ± 4.5 | -0.1 ± 0.2 | +0.4 ± 3.2 | +0.1 ± 1.5 |
| early4 · tankard · beastkin/fox | +51.5 ± 64.5 | **+15.1 ± 6.1** | +0.2 ± 0.3 | +0.8 ± 1.5 | +0.4 ± 1.7 |
| early4 · tankard · beastkin/cat | +41.6 ± 62.4 | **+19.3 ± 8.9** | **+0.4 ± 0.3** | +0.4 ± 2.0 | -0.6 ± 1.3 |
| early4 · tankard · beastkin/wolf | +44.0 ± 50.5 | **+24.6 ± 14.0** | +0.4 ± 0.5 | +1.9 ± 2.3 | -0.1 ± 1.4 |
| early4 · tankard · beastkin/rabbit | +27.5 ± 54.5 | **+25.5 ± 13.2** | **+0.4 ± 0.3** | +1.5 ± 2.3 | **+1.2 ± 0.9** |
| early4 · tankard · beastkin/dragon | +12.9 ± 41.7 | **+10.9 ± 10.5** | +0.3 ± 0.5 | +2.3 ± 3.0 | -0.6 ± 1.8 |
| early4 · tankard · demon | +55.4 ± 63.2 | **+43.6 ± 22.4** | **+0.5 ± 0.4** | -0.8 ± 2.4 | +1.0 ± 1.7 |
| early4 · tankard · dwarf | -7.8 ± 48.2 | +7.0 ± 11.1 | +0.1 ± 0.4 | -0.8 ± 1.5 | -0.4 ± 2.0 |
| early4 · tankard · spirit | +20.4 ± 46.6 | **+20.2 ± 16.4** | +0.1 ± 0.3 | +3.0 ± 3.5 | **+1.9 ± 1.5** |
| early4 · tankard · angel | +28.8 ± 47.8 | **+13.2 ± 11.2** | **+0.3 ± 0.3** | +1.5 ± 1.7 | +0.5 ± 1.9 |
| early4 · tankard · angel/lantern | +9.8 ± 36.2 | +11.8 ± 12.6 | +0.1 ± 0.3 | +2.3 ± 2.3 | +0.5 ± 1.4 |
| early4 · tankard · android | -12.3 ± 40.1 | -11.2 ± 13.8 | **+0.7 ± 0.3** | **-1.9 ± 1.7** | +1.5 ± 1.8 |
| early4 · lantern · elf | -1.8 ± 69.2 | +12.9 ± 17.8 | +0.0 ± 0.3 | -2.1 ± 2.4 | +0.4 ± 2.0 |
| early4 · lantern · beastkin/fox | **+79.6 ± 67.1** | **+23.6 ± 11.4** | +0.1 ± 0.2 | -2.1 ± 2.9 | +1.2 ± 1.7 |
| early4 · lantern · beastkin/cat | **+51.7 ± 47.7** | **+25.3 ± 14.8** | **+0.3 ± 0.3** | **-2.4 ± 2.1** | -0.3 ± 1.4 |
| early4 · lantern · beastkin/wolf | +36.4 ± 65.2 | **+30.3 ± 18.1** | +0.2 ± 0.3 | -0.7 ± 2.4 | +0.9 ± 1.5 |
| early4 · lantern · beastkin/rabbit | **+49.9 ± 42.2** | **+22.3 ± 15.2** | -0.0 ± 0.3 | -2.4 ± 4.3 | +0.6 ± 1.4 |
| early4 · lantern · beastkin/dragon | -2.5 ± 50.9 | +8.0 ± 11.6 | +0.2 ± 0.3 | -0.0 ± 3.8 | -0.1 ± 1.7 |
| early4 · lantern · demon | +59.4 ± 84.3 | **+91.0 ± 63.9** | **+0.8 ± 0.7** | **-3.8 ± 3.7** | +0.4 ± 1.7 |
| early4 · lantern · dwarf | +48.0 ± 58.2 | +10.6 ± 19.5 | +0.1 ± 0.3 | **-3.8 ± 3.4** | -0.2 ± 1.6 |
| early4 · lantern · spirit | +31.3 ± 68.5 | **+19.4 ± 8.7** | +0.2 ± 0.3 | -1.7 ± 2.3 | **+2.4 ± 1.8** |
| early4 · lantern · angel | +12.0 ± 46.8 | **+15.2 ± 14.2** | **+0.4 ± 0.3** | +0.3 ± 2.7 | +0.3 ± 1.6 |
| early4 · lantern · angel/lantern | **+67.3 ± 63.8** | **+20.3 ± 16.4** | +0.2 ± 0.3 | -0.7 ± 3.0 | +1.2 ± 1.4 |
| early4 · lantern · android | +4.5 ± 64.8 | +31.0 ± 36.9 | **+0.7 ± 0.4** | **-4.2 ± 3.5** | **+2.6 ± 1.9** |
| early4 · castle · elf | +101.3 ± 228.7 | +16.2 ± 26.8 | -0.1 ± 0.2 | +0.0 ± 0.0 | **+1.7 ± 1.5** |
| early4 · castle · beastkin/fox | +117.0 ± 212.5 | -0.0 ± 16.3 | -0.3 ± 0.4 | -1.7 ± 2.2 | +1.2 ± 2.0 |
| early4 · castle · beastkin/cat | +31.7 ± 192.9 | -10.5 ± 16.1 | **-0.4 ± 0.4** | -1.7 ± 2.2 | +1.2 ± 2.2 |
| early4 · castle · beastkin/wolf | +79.4 ± 175.5 | +2.7 ± 18.9 | -0.1 ± 0.4 | -1.7 ± 2.2 | -0.0 ± 2.5 |
| early4 · castle · beastkin/rabbit | +41.3 ± 168.6 | **+19.3 ± 13.5** | +0.1 ± 0.2 | +0.0 ± 4.2 | +0.1 ± 1.0 |
| early4 · castle · beastkin/dragon | +37.5 ± 159.4 | -7.1 ± 17.0 | -0.2 ± 0.3 | +0.0 ± 2.4 | +1.0 ± 2.6 |
| early4 · castle · demon | -7.5 ± 215.9 | **+53.4 ± 31.2** | +0.2 ± 0.4 | +2.1 ± 5.9 | -0.8 ± 2.7 |
| early4 · castle · dwarf | +45.2 ± 191.2 | -11.5 ± 28.1 | -0.1 ± 0.4 | -1.3 ± 1.7 | +0.8 ± 2.2 |
| early4 · castle · spirit | -102.9 ± 201.8 | +0.3 ± 18.8 | -0.1 ± 0.3 | -1.7 ± 2.2 | +0.5 ± 1.8 |
| early4 · castle · angel | -31.2 ± 170.8 | +3.7 ± 25.1 | +0.0 ± 0.3 | -0.8 ± 1.6 | +0.1 ± 1.5 |
| early4 · castle · angel/lantern | -55.3 ± 200.9 | +0.7 ± 10.1 | -0.2 ± 0.2 | -1.7 ± 2.2 | +0.5 ± 1.7 |
| early4 · castle · android | +50.0 ± 222.6 | **-19.0 ± 16.3** | -0.2 ± 0.4 | -1.7 ± 2.2 | +1.6 ± 2.4 |
| mid · tankard · elf | **-112.6 ± 52.6** | -5.3 ± 12.7 | -0.4 ± 0.8 | -0.3 ± 2.3 | -0.6 ± 3.0 |
| mid · tankard · beastkin/fox | -72.3 ± 108.0 | +10.6 ± 14.3 | -0.1 ± 0.9 | -0.7 ± 1.4 | +0.2 ± 4.0 |
| mid · tankard · beastkin/cat | -114.2 ± 188.4 | +23.1 ± 29.3 | +0.5 ± 1.1 | **-2.4 ± 2.1** | -2.7 ± 3.8 |
| mid · tankard · beastkin/wolf | -10.1 ± 87.1 | **+17.0 ± 14.1** | +0.1 ± 0.7 | -0.0 ± 1.7 | +0.6 ± 3.6 |
| mid · tankard · beastkin/rabbit | -27.4 ± 45.6 | **+12.6 ± 12.1** | -0.3 ± 0.6 | -2.1 ± 2.1 | +1.2 ± 3.2 |
| mid · tankard · beastkin/dragon | **-90.9 ± 80.8** | +1.9 ± 15.1 | -0.1 ± 0.8 | +1.7 ± 3.7 | +0.5 ± 3.8 |
| mid · tankard · demon | +67.7 ± 137.3 | **+90.3 ± 46.9** | +1.0 ± 1.1 | **-3.5 ± 2.4** | +3.1 ± 3.9 |
| mid · tankard · dwarf | -146.7 ± 195.6 | +11.8 ± 26.3 | +0.2 ± 1.2 | -2.1 ± 2.4 | -2.8 ± 4.4 |
| mid · tankard · spirit | -37.2 ± 128.8 | +1.2 ± 9.7 | **-0.7 ± 0.4** | -0.7 ± 2.2 | **+4.9 ± 3.0** |
| mid · tankard · angel | **-93.4 ± 87.9** | -6.0 ± 12.4 | -0.4 ± 0.7 | +0.3 ± 2.1 | +1.4 ± 2.9 |
| mid · tankard · angel/lantern | -75.8 ± 104.4 | +3.0 ± 11.2 | -0.4 ± 0.7 | +1.7 ± 3.3 | +0.7 ± 3.8 |
| mid · tankard · android | **-126.2 ± 101.3** | -12.9 ± 25.1 | +0.6 ± 0.6 | **-4.2 ± 2.7** | **+6.0 ± 3.7** |
| mid · lantern · elf | **+105.4 ± 55.2** | **+23.9 ± 18.4** | +0.1 ± 0.4 | -0.5 ± 2.5 | +1.0 ± 1.6 |
| mid · lantern · beastkin/fox | **+101.3 ± 91.9** | +18.1 ± 20.3 | +0.2 ± 0.6 | -1.4 ± 2.9 | -0.0 ± 1.6 |
| mid · lantern · beastkin/cat | +39.5 ± 70.8 | +20.6 ± 22.5 | +0.3 ± 0.6 | **-3.1 ± 2.7** | -1.1 ± 1.6 |
| mid · lantern · beastkin/wolf | +45.5 ± 55.6 | +8.5 ± 19.2 | -0.3 ± 0.5 | +3.1 ± 4.4 | **+2.2 ± 1.7** |
| mid · lantern · beastkin/rabbit | **+101.6 ± 71.7** | **+24.3 ± 16.4** | +0.2 ± 0.5 | -0.7 ± 2.0 | +0.6 ± 1.9 |
| mid · lantern · beastkin/dragon | +66.0 ± 75.3 | +3.8 ± 19.7 | -0.0 ± 0.5 | +1.7 ± 3.3 | +0.7 ± 1.7 |
| mid · lantern · demon | **+356.6 ± 148.2** | **+220.1 ± 107.2** | **+1.3 ± 1.3** | **-5.6 ± 2.5** | **+5.7 ± 1.9** |
| mid · lantern · dwarf | +64.7 ± 87.0 | +8.4 ± 24.1 | -0.0 ± 0.6 | **-3.5 ± 2.8** | -1.0 ± 1.7 |
| mid · lantern · spirit | **+145.1 ± 110.9** | +3.5 ± 17.4 | -0.2 ± 0.4 | -2.8 ± 2.9 | **+5.0 ± 2.0** |
| mid · lantern · angel | +26.2 ± 72.9 | +2.5 ± 16.4 | +0.0 ± 0.5 | +2.8 ± 4.6 | +1.4 ± 1.6 |
| mid · lantern · angel/lantern | **+93.0 ± 68.0** | +17.7 ± 24.1 | +0.2 ± 0.7 | -0.7 ± 3.3 | +0.8 ± 2.1 |
| mid · lantern · android | +115.7 ± 131.5 | **+121.5 ± 97.1** | **+1.2 ± 1.0** | **-6.3 ± 2.4** | **+8.2 ± 2.6** |
| mid · castle · elf | +477.5 ± 771.7 | +31.2 ± 37.1 | +0.1 ± 0.7 | +0.3 ± 1.9 | +4.6 ± 5.2 |
| mid · castle · beastkin/fox | **+441.2 ± 424.9** | +13.9 ± 37.4 | +0.2 ± 0.6 | +0.0 ± 3.6 | +2.3 ± 5.8 |
| mid · castle · beastkin/cat | +206.0 ± 428.0 | +17.2 ± 43.0 | +0.3 ± 0.8 | -1.4 ± 2.9 | -0.6 ± 6.7 |
| mid · castle · beastkin/wolf | +188.8 ± 440.0 | +26.8 ± 45.1 | +0.2 ± 0.7 | +2.1 ± 6.0 | +0.2 ± 6.5 |
| mid · castle · beastkin/rabbit | +82.6 ± 567.2 | +26.8 ± 29.8 | +0.3 ± 0.7 | -1.0 ± 5.1 | +0.5 ± 6.5 |
| mid · castle · beastkin/dragon | +264.4 ± 731.2 | +8.4 ± 49.3 | +0.3 ± 0.8 | +1.4 ± 5.0 | -1.2 ± 6.9 |
| mid · castle · demon | -19.2 ± 339.1 | **+117.4 ± 46.7** | +0.6 ± 0.6 | **-3.8 ± 2.6** | -0.2 ± 4.3 |
| mid · castle · dwarf | **+624.4 ± 487.3** | +19.2 ± 41.5 | +0.4 ± 0.8 | -0.7 ± 2.6 | +2.3 ± 6.9 |
| mid · castle · spirit | +5.3 ± 485.8 | +22.8 ± 30.4 | +0.5 ± 0.6 | -2.1 ± 3.3 | -2.2 ± 5.4 |
| mid · castle · angel | +92.2 ± 433.5 | +23.7 ± 40.4 | +0.4 ± 0.8 | -0.3 ± 2.1 | -0.7 ± 5.3 |
| mid · castle · angel/lantern | +251.1 ± 547.9 | **+36.3 ± 18.5** | +0.1 ± 0.4 | **-2.1 ± 1.9** | +1.8 ± 4.1 |
| mid · castle · android | +305.6 ± 578.1 | **+116.3 ± 88.2** | **+1.2 ± 1.0** | **-3.8 ± 2.6** | +2.6 ± 7.9 |
| late · tankard · elf | +15.1 ± 223.9 | -1.3 ± 5.5 | +0.2 ± 0.3 | -2.1 ± 2.6 | +0.8 ± 3.7 |
| late · tankard · beastkin/fox | +42.2 ± 303.7 | +21.9 ± 25.2 | +0.4 ± 0.9 | -1.7 ± 2.9 | +2.3 ± 5.4 |
| late · tankard · beastkin/cat | +91.2 ± 246.2 | +16.6 ± 23.1 | +0.5 ± 0.8 | **-3.8 ± 2.3** | +1.5 ± 4.8 |
| late · tankard · beastkin/wolf | +47.6 ± 221.3 | **+35.0 ± 21.6** | +0.5 ± 0.6 | -1.4 ± 3.4 | +1.5 ± 4.1 |
| late · tankard · beastkin/rabbit | +83.6 ± 288.0 | +22.2 ± 31.9 | +0.2 ± 1.0 | -1.7 ± 2.7 | +2.3 ± 6.1 |
| late · tankard · beastkin/dragon | +87.8 ± 198.1 | +10.6 ± 10.8 | +0.4 ± 0.5 | +4.2 ± 4.9 | +1.9 ± 3.8 |
| late · tankard · demon | +200.3 ± 224.0 | **+81.4 ± 41.7** | +0.3 ± 0.8 | **-3.1 ± 3.0** | **+7.2 ± 3.5** |
| late · tankard · dwarf | -82.0 ± 166.8 | **+34.4 ± 17.4** | **+1.2 ± 0.6** | -2.8 ± 3.1 | -1.5 ± 2.3 |
| late · tankard · spirit | +91.3 ± 192.2 | +13.8 ± 15.6 | -0.2 ± 0.6 | -2.1 ± 2.8 | **+5.8 ± 3.3** |
| late · tankard · angel | -76.8 ± 90.9 | +2.2 ± 17.3 | +0.1 ± 0.6 | +0.0 ± 2.0 | +1.2 ± 1.6 |
| late · tankard · angel/lantern | +102.3 ± 192.7 | **+15.2 ± 10.0** | +0.1 ± 0.4 | +0.3 ± 3.1 | +3.5 ± 3.8 |
| late · tankard · android | -35.1 ± 228.6 | **-23.4 ± 20.9** | +0.4 ± 0.6 | **-3.8 ± 2.3** | **+7.4 ± 3.8** |
| late · lantern · elf | +38.2 ± 126.2 | **+33.2 ± 24.1** | +0.1 ± 0.5 | -0.3 ± 2.6 | +1.6 ± 2.1 |
| late · lantern · beastkin/fox | +47.8 ± 183.8 | **+26.0 ± 18.9** | **+0.6 ± 0.4** | -1.4 ± 2.3 | +1.1 ± 2.1 |
| late · lantern · beastkin/cat | -14.9 ± 145.2 | +24.6 ± 26.7 | **+0.8 ± 0.4** | **-3.5 ± 2.4** | -0.4 ± 1.7 |
| late · lantern · beastkin/wolf | +12.9 ± 106.1 | **+52.2 ± 21.4** | **+0.8 ± 0.2** | -1.7 ± 1.9 | +1.1 ± 2.2 |
| late · lantern · beastkin/rabbit | +41.4 ± 87.5 | **+27.9 ± 24.2** | +0.3 ± 0.4 | -1.4 ± 2.5 | +2.1 ± 2.3 |
| late · lantern · beastkin/dragon | -65.4 ± 84.5 | +8.6 ± 26.7 | +0.2 ± 0.4 | **+5.9 ± 4.0** | +0.6 ± 2.2 |
| late · lantern · demon | **+381.7 ± 264.3** | **+427.3 ± 139.8** | **+2.9 ± 1.0** | **-4.9 ± 3.0** | **+5.2 ± 2.6** |
| late · lantern · dwarf | -14.5 ± 145.1 | **+38.9 ± 14.3** | **+1.1 ± 0.3** | **-3.8 ± 2.3** | -0.4 ± 1.8 |
| late · lantern · spirit | -25.6 ± 133.3 | +13.0 ± 31.4 | -0.3 ± 0.7 | -1.0 ± 2.3 | **+4.1 ± 2.3** |
| late · lantern · angel | +37.8 ± 67.6 | +8.0 ± 22.2 | -0.2 ± 0.5 | +3.1 ± 4.0 | +1.5 ± 2.2 |
| late · lantern · angel/lantern | +58.5 ± 100.4 | **+23.3 ± 22.0** | -0.0 ± 0.4 | +2.8 ± 3.4 | +2.2 ± 2.3 |
| late · lantern · android | +131.5 ± 141.8 | **+197.9 ± 94.4** | **+1.8 ± 0.8** | **-4.9 ± 3.0** | **+6.2 ± 2.3** |
| late · castle · elf | -597.4 ± 818.0 | **+190.6 ± 81.6** | +0.3 ± 0.6 | -0.1 ± 0.2 | +3.2 ± 3.8 |
| late · castle · beastkin/fox | **-723.3 ± 675.0** | **+49.5 ± 33.3** | **+0.4 ± 0.3** | -0.1 ± 0.2 | -0.8 ± 2.1 |
| late · castle · beastkin/cat | -717.3 ± 1,128 | +64.7 ± 68.1 | +0.3 ± 0.8 | -0.3 ± 0.5 | -1.0 ± 4.0 |
| late · castle · beastkin/wolf | **-676.6 ± 675.2** | **+45.4 ± 41.1** | +0.3 ± 0.5 | -0.1 ± 0.2 | -1.0 ± 2.9 |
| late · castle · beastkin/rabbit | -691.5 ± 1,272 | **+62.7 ± 58.4** | +0.1 ± 0.4 | -0.3 ± 0.6 | +0.2 ± 3.0 |
| late · castle · beastkin/dragon | -593.6 ± 1,007 | **+53.4 ± 43.7** | +0.5 ± 0.7 | -0.1 ± 0.2 | -1.9 ± 4.3 |
| late · castle · demon | **-1,117 ± 895.4** | **+479.1 ± 310.9** | **+1.5 ± 0.9** | +0.1 ± 0.9 | +0.9 ± 2.1 |
| late · castle · dwarf | -728.2 ± 1,042 | +76.6 ± 89.6 | +0.3 ± 0.6 | -0.3 ± 0.5 | -1.8 ± 2.9 |
| late · castle · spirit | -894.9 ± 966.2 | +28.6 ± 45.9 | -0.1 ± 0.6 | -0.2 ± 0.4 | -1.1 ± 4.0 |
| late · castle · angel | -1,089 ± 1,217 | **+112.1 ± 73.3** | **+0.4 ± 0.4** | -0.3 ± 0.6 | -1.3 ± 2.9 |
| late · castle · angel/lantern | -720.4 ± 835.5 | **+100.5 ± 31.1** | +0.1 ± 0.5 | +0.0 ± 0.0 | +0.5 ± 3.5 |
| late · castle · android | **-923.9 ± 715.5** | **+249.9 ± 134.3** | **+0.9 ± 0.6** | +0.0 ± 0.0 | **+4.4 ± 3.6** |

---

### race-bedless-compare

Bedless & rare races (Spirit, Android, Demon, Angel, Lantern Angel vs Human) with and without the bedless capacity bonus (fixedStaff true vs false) across Lantern, Atelier (-40% android charge), and Hollow (built-in Tether).

scenario **mid** · 12 seeds from 1 · 270s · 2026-11-20T17:52

| variant | n | houseNet | total | net | testedNet | testedServed | testedRest | testedRech | recharge | staff | served | sat |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| true · mid · lantern · base | 12 | 573 | 788 | 574 | 171 | 5.4 | 7.6 | 0.0 | 0.0 | 7.2 | 19 | 54 |
| true · mid · lantern · demon | 12 | 1,090 | 1,365 | 1,090 | 571 | 8.8 | 0.7 | 0.0 | 0.0 | 7.2 | 23 | 59 |
| true · mid · lantern · angel | 12 | 652 | 859 | 653 | 201 | 5.6 | 8.0 | 0.0 | 0.0 | 7.2 | 19 | 56 |
| true · mid · lantern · angel/lantern | 12 | 760 | 984 | 761 | 210 | 5.4 | 6.3 | 0.0 | 0.0 | 7.2 | 19 | 59 |
| true · mid · lantern · spirit | 12 | 767 | 995 | 768 | 192 | 5.2 | 4.9 | 0.0 | 0.0 | 7.2 | 20 | 61 |
| true · mid · lantern · android | 12 | 992 | 1,192 | 993 | 323 | 7.2 | 0.0 | 114 | 228 | 7.2 | 23 | 63 |
| true · mid · atelier · base | 12 | 1,925 | 1,941 | 1,941 | 133 | 4.8 | 4.5 | 0.0 | 71 | 7.8 | 20 | 51 |
| true · mid · atelier · demon | 12 | 3,370 | 3,386 | 3,386 | 395 | 6.3 | 0.3 | 0.0 | 79 | 7.7 | 24 | 63 |
| true · mid · atelier · angel | 12 | 1,876 | 1,892 | 1,892 | 149 | 4.8 | 7.3 | 0.0 | 73 | 7.8 | 20 | 52 |
| true · mid · atelier · angel/lantern | 12 | 2,312 | 2,328 | 2,328 | 165 | 4.7 | 6.6 | 0.0 | 72 | 7.8 | 20 | 55 |
| true · mid · atelier · spirit | 12 | 3,016 | 3,032 | 3,032 | 134 | 4.1 | 3.8 | 0.0 | 77 | 7.8 | 23 | 62 |
| true · mid · atelier · android | 12 | 2,478 | 2,494 | 2,494 | 350 | 6.2 | 0.0 | 61 | 196 | 7.8 | 22 | 62 |
| true · mid · hollow · base | 12 | 1,633 | 1,639 | 1,639 | 124 | 3.6 | 4.9 | 0.0 | 0.0 | 8.2 | 18 | 66 |
| true · mid · hollow · demon | 12 | 1,666 | 1,673 | 1,673 | 342 | 4.8 | 2.1 | 0.0 | 0.0 | 8.1 | 19 | 67 |
| true · mid · hollow · angel | 12 | 1,475 | 1,482 | 1,482 | 127 | 3.4 | 5.9 | 0.0 | 0.0 | 8.2 | 17 | 67 |
| true · mid · hollow · angel/lantern | 12 | 1,726 | 1,733 | 1,733 | 176 | 4.0 | 3.8 | 0.0 | 0.0 | 8.2 | 19 | 68 |
| true · mid · hollow · spirit | 12 | 1,559 | 1,566 | 1,566 | 131 | 3.3 | 2.1 | 0.0 | 0.0 | 8.2 | 17 | 68 |
| true · mid · hollow · android | 12 | 1,762 | 1,768 | 1,768 | 223 | 4.8 | 0.0 | 78 | 156 | 8.1 | 20 | 69 |
| true · late · lantern · base | 12 | 1,300 | 1,555 | 1,303 | 232 | 5.8 | 5.2 | 0.0 | 0.0 | 9.2 | 26 | 57 |
| true · late · lantern · demon | 12 | 1,682 | 1,955 | 1,685 | 660 | 8.7 | 0.3 | 0.0 | 0.0 | 9.1 | 27 | 62 |
| true · late · lantern · angel | 12 | 1,338 | 1,570 | 1,341 | 240 | 5.6 | 8.3 | 0.0 | 0.0 | 9.1 | 27 | 58 |
| true · late · lantern · angel/lantern | 12 | 1,358 | 1,565 | 1,361 | 256 | 5.8 | 8.0 | 0.0 | 0.0 | 9.2 | 26 | 59 |
| true · late · lantern · spirit | 12 | 1,274 | 1,508 | 1,278 | 245 | 5.5 | 4.2 | 0.0 | 0.0 | 9.2 | 26 | 61 |
| true · late · lantern · android | 12 | 1,432 | 1,679 | 1,435 | 430 | 7.6 | 0.3 | 127 | 254 | 9.2 | 28 | 63 |
| true · late · atelier · base | 12 | 5,509 | 5,526 | 5,526 | 166 | 4.1 | 3.3 | 0.0 | 96 | 14 | 30 | 66 |
| true · late · atelier · demon | 12 | 5,571 | 5,589 | 5,589 | 444 | 5.9 | 0.3 | 0.0 | 93 | 14 | 28 | 69 |
| true · late · atelier · angel | 12 | 5,639 | 5,657 | 5,657 | 171 | 4.0 | 1.4 | 0.0 | 96 | 14 | 30 | 68 |
| true · late · atelier · angel/lantern | 12 | 5,615 | 5,633 | 5,633 | 197 | 4.1 | 2.8 | 0.0 | 94 | 14 | 29 | 68 |
| true · late · atelier · spirit | 12 | 5,548 | 5,566 | 5,566 | 194 | 4.1 | 1.0 | 0.0 | 95 | 14 | 31 | 69 |
| true · late · atelier · android | 12 | 6,189 | 6,207 | 6,207 | 342 | 4.9 | 0.0 | 50 | 195 | 14 | 30 | 74 |
| true · late · hollow · base | 12 | 2,673 | 2,677 | 2,677 | 236 | 4.9 | 3.1 | 0.0 | 0.0 | 14 | 29 | 61 |
| true · late · hollow · demon | 12 | 3,012 | 3,016 | 3,016 | 527 | 5.6 | 1.4 | 0.0 | 0.0 | 14 | 24 | 66 |
| true · late · hollow · angel | 12 | 2,884 | 2,888 | 2,888 | 248 | 4.6 | 3.1 | 0.0 | 0.0 | 14 | 28 | 63 |
| true · late · hollow · angel/lantern | 12 | 3,040 | 3,044 | 3,044 | 273 | 4.6 | 3.8 | 0.0 | 0.0 | 14 | 28 | 65 |
| true · late · hollow · spirit | 12 | 2,712 | 2,716 | 2,716 | 260 | 4.8 | 3.5 | 0.0 | 0.0 | 14 | 29 | 64 |
| true · late · hollow · android | 12 | 2,679 | 2,683 | 2,683 | 367 | 5.6 | 0.7 | 94 | 188 | 14 | 26 | 67 |
| false · mid · lantern · base | 12 | 776 | 992 | 777 | 192 | 5.5 | 8.0 | 0.0 | 0.0 | 11 | 24 | 56 |
| false · mid · lantern · demon | 12 | 1,274 | 1,555 | 1,274 | 509 | 7.7 | 0.3 | 0.0 | 0.0 | 9.0 | 24 | 63 |
| false · mid · lantern · angel | 12 | 779 | 978 | 779 | 196 | 5.4 | 7.3 | 0.0 | 0.0 | 10 | 24 | 58 |
| false · mid · lantern · angel/lantern | 12 | 1,010 | 1,249 | 1,011 | 207 | 5.1 | 6.3 | 0.0 | 0.0 | 11 | 25 | 61 |
| false · mid · lantern · spirit | 12 | 891 | 1,144 | 891 | 195 | 4.7 | 4.9 | 0.0 | 0.0 | 12 | 26 | 61 |
| false · mid · lantern · android | 12 | 986 | 1,252 | 987 | 341 | 6.7 | 0.0 | 108 | 216 | 11 | 26 | 65 |
| false · mid · atelier · base | 12 | 4,180 | 4,196 | 4,196 | 110 | 3.5 | 0.0 | 0.0 | 88 | 15 | 27 | 68 |
| false · mid · atelier · demon | 12 | 5,283 | 5,299 | 5,299 | 258 | 4.4 | 0.3 | 0.0 | 99 | 14 | 26 | 75 |
| false · mid · atelier · angel | 12 | 3,651 | 3,667 | 3,667 | 151 | 4.1 | 2.1 | 0.0 | 82 | 14 | 27 | 66 |
| false · mid · atelier · angel/lantern | 12 | 5,036 | 5,052 | 5,052 | 122 | 3.2 | 2.4 | 0.0 | 100 | 14 | 27 | 73 |
| false · mid · atelier · spirit | 12 | 4,688 | 4,704 | 4,704 | 109 | 3.3 | 1.7 | 0.0 | 94 | 13 | 27 | 73 |
| false · mid · atelier · android | 12 | 4,414 | 4,430 | 4,430 | 286 | 4.6 | 0.0 | 48 | 185 | 16 | 27 | 75 |
| false · mid · hollow · base | 12 | 2,002 | 2,008 | 2,008 | 124 | 3.1 | 1.4 | 0.0 | 0.0 | 14 | 21 | 69 |
| false · mid · hollow · demon | 12 | 2,428 | 2,435 | 2,435 | 365 | 4.6 | 1.4 | 0.0 | 0.0 | 14 | 22 | 72 |
| false · mid · hollow · angel | 12 | 1,974 | 1,981 | 1,981 | 131 | 3.2 | 1.7 | 0.0 | 0.0 | 14 | 22 | 70 |
| false · mid · hollow · angel/lantern | 12 | 2,056 | 2,063 | 2,063 | 165 | 3.6 | 3.1 | 0.0 | 0.0 | 13 | 22 | 68 |
| false · mid · hollow · spirit | 12 | 2,145 | 2,152 | 2,152 | 137 | 3.1 | 2.1 | 0.0 | 0.0 | 14 | 23 | 70 |
| false · mid · hollow · android | 12 | 2,042 | 2,049 | 2,049 | 224 | 4.3 | 0.0 | 75 | 151 | 16 | 23 | 73 |
| false · late · lantern · base | 12 | 1,276 | 1,538 | 1,279 | 228 | 5.7 | 6.3 | 0.0 | 0.0 | 11 | 29 | 56 |
| false · late · lantern · demon | 12 | 1,788 | 2,099 | 1,791 | 671 | 8.8 | 0.3 | 0.0 | 0.0 | 11 | 28 | 65 |
| false · late · lantern · angel | 12 | 1,312 | 1,553 | 1,315 | 244 | 5.7 | 5.9 | 0.0 | 0.0 | 11 | 29 | 58 |
| false · late · lantern · angel/lantern | 12 | 1,410 | 1,706 | 1,413 | 266 | 5.7 | 9.7 | 0.0 | 0.0 | 11 | 29 | 59 |
| false · late · lantern · spirit | 12 | 1,485 | 1,791 | 1,488 | 248 | 5.3 | 4.5 | 0.0 | 0.0 | 13 | 31 | 60 |
| false · late · lantern · android | 12 | 1,610 | 1,860 | 1,613 | 476 | 7.7 | 0.3 | 128 | 256 | 13 | 31 | 66 |
| false · late · atelier · base | 12 | 5,584 | 5,601 | 5,601 | 166 | 4.1 | 2.7 | 0.0 | 96 | 15 | 31 | 65 |
| false · late · atelier · demon | 12 | 5,616 | 5,634 | 5,634 | 440 | 5.6 | 1.0 | 0.0 | 91 | 15 | 28 | 71 |
| false · late · atelier · angel | 12 | 5,717 | 5,735 | 5,735 | 176 | 3.9 | 2.7 | 0.0 | 94 | 15 | 30 | 69 |
| false · late · atelier · angel/lantern | 12 | 5,748 | 5,766 | 5,766 | 205 | 4.2 | 2.5 | 0.0 | 94 | 15 | 30 | 69 |
| false · late · atelier · spirit | 12 | 5,897 | 5,915 | 5,915 | 186 | 3.8 | 0.9 | 0.0 | 93 | 17 | 31 | 69 |
| false · late · atelier · android | 12 | 6,060 | 6,078 | 6,078 | 387 | 5.0 | 0.0 | 53 | 197 | 17 | 29 | 74 |
| false · late · hollow · base | 12 | 2,741 | 2,745 | 2,745 | 233 | 4.9 | 4.9 | 0.0 | 0.0 | 14 | 29 | 62 |
| false · late · hollow · demon | 12 | 2,849 | 2,853 | 2,853 | 514 | 5.5 | 1.4 | 0.0 | 0.0 | 14 | 24 | 67 |
| false · late · hollow · angel | 12 | 3,192 | 3,196 | 3,196 | 278 | 4.7 | 3.5 | 0.0 | 0.0 | 14 | 28 | 65 |
| false · late · hollow · angel/lantern | 12 | 3,010 | 3,014 | 3,014 | 288 | 4.8 | 2.4 | 0.0 | 0.0 | 14 | 29 | 65 |
| false · late · hollow · spirit | 12 | 3,039 | 3,043 | 3,043 | 251 | 4.4 | 2.1 | 0.0 | 0.0 | 16 | 29 | 67 |
| false · late · hollow · android | 12 | 2,833 | 2,837 | 2,837 | 375 | 5.4 | 0.7 | 89 | 178 | 16 | 26 | 68 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ net | Δ testedNet | Δ staff | Δ recharge |
|---|---|---|---|---|---|
| true · mid · lantern · demon | **+516.2 ± 176.3** | **+516.2 ± 176.3** | **+400.8 ± 129.0** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · mid · lantern · angel | +79.0 ± 87.7 | +79.0 ± 87.7 | **+30.6 ± 16.0** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · mid · lantern · angel/lantern | **+186.9 ± 50.2** | **+186.9 ± 50.2** | **+39.5 ± 19.2** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · mid · lantern · spirit | +193.8 ± 265.1 | +193.8 ± 265.1 | +21.6 ± 28.6 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · mid · lantern · android | **+418.9 ± 243.9** | **+418.9 ± 243.9** | **+152.7 ± 100.1** | +0.0 ± 0.0 | **+227.9 ± 50.2** |
| true · mid · atelier · demon | **+1,445 ± 1,162** | **+1,445 ± 1,162** | **+262.4 ± 139.1** | -0.1 ± 0.2 | +8.6 ± 16.3 |
| true · mid · atelier · angel | -49.1 ± 352.6 | -49.1 ± 352.6 | +15.8 ± 20.9 | +0.0 ± 0.0 | +2.6 ± 5.7 |
| true · mid · atelier · angel/lantern | +387.3 ± 928.2 | +387.2 ± 928.2 | **+32.1 ± 29.6** | +0.0 ± 0.0 | +1.1 ± 13.4 |
| true · mid · atelier · spirit | **+1,091 ± 1,091** | **+1,091 ± 1,091** | +0.7 ± 27.7 | +0.0 ± 0.0 | +6.5 ± 11.7 |
| true · mid · atelier · android | **+553.1 ± 406.4** | **+553.1 ± 406.4** | **+216.6 ± 118.6** | +0.0 ± 0.0 | **+125.6 ± 28.4** |
| true · mid · hollow · demon | +33.6 ± 371.0 | +33.6 ± 371.0 | **+218.0 ± 53.2** | -0.1 ± 0.2 | +0.0 ± 0.0 |
| true · mid · hollow · angel | -157.7 ± 222.0 | -157.7 ± 222.0 | +2.8 ± 27.4 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · mid · hollow · angel/lantern | +93.7 ± 312.8 | +93.7 ± 312.8 | **+52.2 ± 21.8** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · mid · hollow · spirit | -73.5 ± 277.3 | -73.5 ± 277.3 | +7.3 ± 29.5 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · mid · hollow · android | +129.0 ± 295.9 | +129.0 ± 295.9 | **+98.5 ± 73.7** | -0.1 ± 0.2 | **+156.0 ± 31.2** |
| true · late · lantern · demon | **+381.7 ± 264.3** | **+381.7 ± 264.3** | **+427.3 ± 139.8** | -0.1 ± 0.2 | +0.0 ± 0.0 |
| true · late · lantern · angel | +37.8 ± 67.6 | +37.8 ± 67.6 | +8.0 ± 22.2 | -0.1 ± 0.2 | +0.0 ± 0.0 |
| true · late · lantern · angel/lantern | +58.5 ± 100.4 | +58.5 ± 100.4 | **+23.3 ± 22.0** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · late · lantern · spirit | -25.6 ± 133.3 | -25.3 ± 133.6 | +13.0 ± 31.4 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · late · lantern · android | +131.5 ± 141.8 | +131.5 ± 141.8 | **+197.9 ± 94.4** | +0.0 ± 0.0 | **+254.3 ± 48.8** |
| true · late · atelier · demon | +62.5 ± 562.8 | +62.7 ± 562.8 | **+278.1 ± 113.1** | +0.0 ± 0.0 | -3.0 ± 6.7 |
| true · late · atelier · angel | +130.7 ± 525.8 | +130.9 ± 525.7 | +5.0 ± 31.8 | +0.0 ± 0.0 | +0.7 ± 6.2 |
| true · late · atelier · angel/lantern | +106.9 ± 536.7 | +107.2 ± 536.7 | +30.1 ± 30.3 | +0.0 ± 0.0 | -1.1 ± 5.0 |
| true · late · atelier · spirit | +39.5 ± 429.8 | +39.7 ± 429.7 | +27.4 ± 37.5 | +0.0 ± 0.0 | -0.2 ± 6.1 |
| true · late · atelier · android | **+681.0 ± 578.0** | **+681.1 ± 578.0** | **+175.3 ± 139.3** | +0.0 ± 0.0 | **+99.7 ± 34.8** |
| true · late · hollow · demon | +338.4 ± 400.0 | +338.4 ± 400.0 | **+290.4 ± 115.6** | -0.1 ± 0.2 | +0.0 ± 0.0 |
| true · late · hollow · angel | +210.9 ± 414.7 | +210.9 ± 414.7 | +11.6 ± 34.3 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · late · hollow · angel/lantern | +366.2 ± 430.2 | +366.2 ± 430.2 | +37.1 ± 42.7 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · late · hollow · spirit | +38.2 ± 303.0 | +38.2 ± 303.0 | +23.8 ± 29.3 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| true · late · hollow · android | +5.7 ± 371.0 | +5.7 ± 371.0 | **+130.9 ± 92.9** | +0.0 ± 0.0 | **+188.1 ± 48.0** |
| false · mid · lantern · demon | **+497.4 ± 312.4** | **+497.4 ± 312.4** | **+316.6 ± 143.2** | **-2.1 ± 1.1** | +0.0 ± 0.0 |
| false · mid · lantern · angel | +2.4 ± 123.0 | +2.4 ± 123.0 | +3.6 ± 26.8 | **-0.8 ± 0.7** | +0.0 ± 0.0 |
| false · mid · lantern · angel/lantern | **+233.8 ± 210.3** | **+233.8 ± 210.3** | +15.1 ± 31.6 | +0.2 ± 0.6 | +0.0 ± 0.0 |
| false · mid · lantern · spirit | +114.4 ± 231.0 | +114.4 ± 231.0 | +2.9 ± 41.8 | +0.6 ± 1.2 | +0.0 ± 0.0 |
| false · mid · lantern · android | +210.1 ± 242.5 | +210.1 ± 242.5 | **+148.8 ± 104.7** | +0.2 ± 1.1 | **+215.6 ± 49.2** |
| false · mid · atelier · demon | +1,103 ± 1,526 | +1,103 ± 1,526 | **+147.9 ± 103.4** | **-1.0 ± 0.9** | +11.3 ± 22.0 |
| false · mid · atelier · angel | -528.7 ± 905.8 | -528.5 ± 905.8 | **+40.6 ± 22.0** | -1.0 ± 1.7 | -6.3 ± 10.3 |
| false · mid · atelier · angel/lantern | +856.1 ± 1,297 | +856.2 ± 1,297 | +11.3 ± 33.6 | -0.8 ± 1.4 | +11.7 ± 19.7 |
| false · mid · atelier · spirit | +508.3 ± 1,069 | +508.4 ± 1,069 | -1.4 ± 25.8 | **-1.8 ± 1.3** | +6.0 ± 15.7 |
| false · mid · atelier · android | +233.9 ± 1,393 | +234.0 ± 1,393 | **+175.9 ± 95.8** | +0.5 ± 1.1 | **+97.0 ± 25.3** |
| false · mid · hollow · demon | **+426.3 ± 391.3** | **+426.3 ± 391.3** | **+241.1 ± 121.1** | +0.5 ± 1.8 | +0.0 ± 0.0 |
| false · mid · hollow · angel | -27.1 ± 464.7 | -27.1 ± 464.7 | +6.9 ± 39.1 | +0.5 ± 1.6 | +0.0 ± 0.0 |
| false · mid · hollow · angel/lantern | +54.0 ± 488.1 | +54.0 ± 488.1 | **+40.8 ± 27.1** | -0.4 ± 2.0 | +0.0 ± 0.0 |
| false · mid · hollow · spirit | +143.5 ± 544.7 | +143.5 ± 544.7 | +12.5 ± 36.8 | +0.7 ± 1.6 | +0.0 ± 0.0 |
| false · mid · hollow · android | +40.7 ± 307.0 | +40.7 ± 307.0 | **+99.7 ± 70.1** | **+2.0 ± 1.9** | **+150.6 ± 36.2** |
| false · late · lantern · demon | **+512.1 ± 268.6** | **+512.1 ± 268.6** | **+443.8 ± 136.3** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| false · late · lantern · angel | +36.6 ± 45.8 | +36.6 ± 45.8 | +16.9 ± 21.4 | +0.0 ± 0.0 | +0.0 ± 0.0 |
| false · late · lantern · angel/lantern | **+134.6 ± 110.4** | **+134.6 ± 110.4** | **+38.1 ± 25.4** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| false · late · lantern · spirit | **+209.0 ± 193.5** | **+209.0 ± 193.5** | +20.2 ± 22.7 | **+2.0 ± 0.0** | +0.0 ± 0.0 |
| false · late · lantern · android | **+334.8 ± 194.9** | **+334.8 ± 194.9** | **+248.0 ± 82.2** | **+2.0 ± 0.0** | **+255.5 ± 47.7** |
| false · late · atelier · demon | +32.4 ± 570.8 | +32.6 ± 570.8 | **+273.6 ± 115.1** | +0.0 ± 0.0 | -4.5 ± 6.0 |
| false · late · atelier · angel | +133.4 ± 518.1 | +133.7 ± 518.0 | +9.3 ± 29.6 | +0.0 ± 0.0 | -1.4 ± 6.2 |
| false · late · atelier · angel/lantern | +164.6 ± 294.1 | +164.8 ± 294.0 | **+38.6 ± 21.2** | +0.0 ± 0.0 | -1.4 ± 3.0 |
| false · late · atelier · spirit | +313.3 ± 616.7 | +313.6 ± 616.7 | +20.3 ± 36.6 | **+1.5 ± 0.4** | -2.4 ± 5.5 |
| false · late · atelier · android | +476.3 ± 481.7 | +476.5 ± 481.7 | **+220.6 ± 136.2** | **+1.7 ± 0.3** | **+101.7 ± 34.0** |
| false · late · hollow · demon | +107.8 ± 212.0 | +107.8 ± 212.0 | **+280.6 ± 106.2** | -0.1 ± 0.2 | +0.0 ± 0.0 |
| false · late · hollow · angel | +451.1 ± 468.4 | +451.1 ± 468.4 | **+45.0 ± 38.0** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| false · late · hollow · angel/lantern | +269.5 ± 375.2 | +269.5 ± 375.2 | **+54.5 ± 29.3** | +0.0 ± 0.0 | +0.0 ± 0.0 |
| false · late · hollow · spirit | +298.3 ± 357.1 | +298.3 ± 357.1 | +18.1 ± 44.7 | **+1.7 ± 0.3** | +0.0 ± 0.0 |
| false · late · hollow · android | +91.7 ± 281.3 | +91.7 ± 281.3 | **+141.4 ± 91.1** | **+1.7 ± 0.3** | **+178.2 ± 38.1** |

---

### race-roles-phases

Every support role by race across early4/mid/late at the Lantern (1 tested lady in role, others humans, fixed staff count).

scenario **mid** · 10 seeds from 1 · 538s · 2026-11-20T18:01

| variant | n | houseNet | total | net | testedNet | testedRest | testedRech | sat | repGain | prestige | tidy | trouble | props |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| maid · early4 · base | 10 | 687 | 687 | 687 | -26 | 1.7 | 0.0 | 61 | 4.0 | 48 | 71 | 0.8 | 0.4 |
| maid · early4 · elf | 10 | 721 | 721 | 721 | -27 | 1.7 | 0.0 | 62 | 2.7 | 47 | 70 | 0.8 | 0.5 |
| maid · early4 · beastkin/fox | 10 | 707 | 707 | 707 | -19 | 1.7 | 0.0 | 61 | 1.2 | 47 | 70 | 0.6 | 0.5 |
| maid · early4 · beastkin/wolf | 10 | 721 | 721 | 721 | -17 | 2.5 | 0.0 | 61 | 3.9 | 47 | 70 | 0.7 | 0.5 |
| maid · early4 · demon | 10 | 690 | 690 | 690 | -19 | 41 | 0.0 | 61 | -1.5 | 44 | 57 | 0.7 | 0.7 |
| maid · early4 · dwarf | 10 | 691 | 691 | 691 | -27 | 0.8 | 0.0 | 61 | 0.9 | 49 | 71 | 0.7 | 0.4 |
| maid · early4 · spirit | 10 | 720 | 720 | 720 | -25 | 5.8 | 0.0 | 60 | 6.4 | 47 | 69 | 0.7 | 0.4 |
| maid · early4 · angel | 10 | 695 | 695 | 695 | -32 | 0.0 | 0.0 | 61 | 5.3 | 49 | 72 | 0.7 | 0.1 |
| maid · early4 · angel/lantern | 10 | 726 | 726 | 726 | -22 | 2.5 | 0.0 | 61 | 4.3 | 47 | 70 | 0.6 | 0.7 |
| maid · early4 · android | 10 | 670 | 670 | 670 | -78 | 0.8 | 53 | 60 | 3.6 | 48 | 70 | 0.7 | 0.5 |
| maid · mid · base | 10 | 405 | 519 | 405 | -27 | 0.8 | 0.0 | 58 | -3.5 | 44 | 71 | 0.9 | 1.9 |
| maid · mid · elf | 10 | 414 | 572 | 414 | -24 | 2.5 | 0.0 | 58 | 1.1 | 46 | 71 | 1.0 | 2.1 |
| maid · mid · beastkin/fox | 10 | 397 | 564 | 397 | -13 | 1.7 | 0.0 | 58 | 1.9 | 46 | 71 | 0.8 | 2.5 |
| maid · mid · beastkin/wolf | 10 | 378 | 550 | 378 | -16 | 0.8 | 0.0 | 59 | -1.9 | 46 | 72 | 0.8 | 2.3 |
| maid · mid · demon | 10 | 472 | 558 | 472 | -14 | 38 | 0.0 | 58 | -2.3 | 41 | 58 | 0.9 | 1.9 |
| maid · mid · dwarf | 10 | 433 | 542 | 433 | -26 | 0.0 | 0.0 | 57 | -2.2 | 44 | 71 | 0.9 | 1.9 |
| maid · mid · spirit | 10 | 427 | 523 | 427 | -21 | 7.5 | 0.0 | 57 | -5.5 | 43 | 68 | 1.0 | 1.6 |
| maid · mid · angel | 10 | 406 | 495 | 406 | -31 | 0.0 | 0.0 | 57 | -4.3 | 45 | 71 | 0.8 | 1.9 |
| maid · mid · angel/lantern | 10 | 397 | 511 | 397 | -21 | 3.3 | 0.0 | 56 | -1.6 | 44 | 71 | 0.8 | 1.9 |
| maid · mid · android | 10 | 308 | 502 | 308 | -75 | 0.0 | 52 | 58 | -0.3 | 46 | 72 | 0.9 | 1.7 |
| maid · late · base | 10 | 1,393 | 1,618 | 1,393 | -21 | 0.0 | 0.0 | 62 | 8.3 | 45 | 63 | 0.5 | 4.5 |
| maid · late · elf | 10 | 1,454 | 1,676 | 1,454 | -23 | 0.0 | 0.0 | 63 | 11 | 44 | 63 | 0.5 | 4.5 |
| maid · late · beastkin/fox | 10 | 1,415 | 1,637 | 1,415 | -15 | 0.0 | 0.0 | 62 | 11 | 45 | 62 | 0.4 | 4.7 |
| maid · late · beastkin/wolf | 10 | 1,461 | 1,680 | 1,461 | -15 | 0.8 | 0.0 | 62 | 9.9 | 44 | 61 | 0.5 | 5.0 |
| maid · late · demon | 10 | 1,176 | 1,329 | 1,176 | -12 | 38 | 0.0 | 58 | 5.3 | 38 | 49 | 0.4 | 4.8 |
| maid · late · dwarf | 10 | 1,361 | 1,573 | 1,361 | -26 | 0.0 | 0.0 | 61 | 11 | 45 | 63 | 0.4 | 4.5 |
| maid · late · spirit | 10 | 1,425 | 1,655 | 1,425 | -24 | 5.0 | 0.0 | 62 | 11 | 43 | 59 | 0.6 | 4.6 |
| maid · late · angel | 10 | 1,444 | 1,632 | 1,445 | -32 | 0.0 | 0.0 | 62 | 12 | 44 | 63 | 0.3 | 4.4 |
| maid · late · angel/lantern | 10 | 1,487 | 1,697 | 1,488 | -19 | 3.3 | 0.0 | 63 | 7.5 | 44 | 60 | 0.5 | 4.8 |
| maid · late · android | 10 | 1,322 | 1,581 | 1,323 | -75 | 0.0 | 55 | 62 | 10 | 45 | 63 | 0.5 | 4.5 |
| promoter · early4 · base | 10 | 716 | 716 | 716 | -23 | 5.0 | 0.0 | 53 | -13 | 30 | 21 | 0.8 | 0.7 |
| promoter · early4 · elf | 10 | 701 | 701 | 701 | -25 | 4.2 | 0.0 | 53 | -12 | 29 | 20 | 0.7 | 0.7 |
| promoter · early4 · beastkin/fox | 10 | 726 | 726 | 726 | -19 | 2.5 | 0.0 | 54 | -11 | 28 | 19 | 0.9 | 0.6 |
| promoter · early4 · beastkin/wolf | 10 | 715 | 715 | 715 | -21 | 1.7 | 0.0 | 52 | -11 | 28 | 20 | 0.8 | 0.6 |
| promoter · early4 · demon | 10 | 612 | 612 | 612 | -21 | 43 | 0.0 | 53 | -9.6 | 31 | 20 | 0.7 | 0.6 |
| promoter · early4 · dwarf | 10 | 676 | 676 | 676 | -28 | 0.8 | 0.0 | 53 | -12 | 30 | 21 | 0.9 | 0.4 |
| promoter · early4 · spirit | 10 | 707 | 707 | 707 | -23 | 8.3 | 0.0 | 53 | -9.6 | 30 | 19 | 0.8 | 0.5 |
| promoter · early4 · angel | 10 | 709 | 709 | 709 | -32 | 0.0 | 0.0 | 54 | -11 | 30 | 21 | 0.8 | 0.2 |
| promoter · early4 · angel/lantern | 10 | 724 | 724 | 724 | -21 | 5.8 | 0.0 | 54 | -12 | 29 | 20 | 0.8 | 0.7 |
| promoter · early4 · android | 10 | 678 | 678 | 678 | -77 | 0.8 | 50 | 53 | -13 | 29 | 19 | 0.9 | 0.5 |
| promoter · mid · base | 10 | 474 | 584 | 474 | -20 | 2.5 | 0.0 | 59 | -3.8 | 40 | 61 | 1.0 | 2.0 |
| promoter · mid · elf | 10 | 471 | 667 | 471 | -20 | 2.5 | 0.0 | 60 | -2.9 | 40 | 53 | 0.9 | 1.7 |
| promoter · mid · beastkin/fox | 10 | 456 | 568 | 456 | -22 | 0.0 | 0.0 | 58 | -6.7 | 40 | 59 | 1.0 | 1.6 |
| promoter · mid · beastkin/wolf | 10 | 440 | 577 | 440 | -18 | 0.0 | 0.0 | 57 | -3.0 | 39 | 57 | 1.0 | 1.6 |
| promoter · mid · demon | 10 | 450 | 532 | 450 | -12 | 39 | 0.0 | 57 | -7.7 | 38 | 58 | 1.0 | 1.6 |
| promoter · mid · dwarf | 10 | 475 | 636 | 475 | -22 | 0.0 | 0.0 | 60 | -3.5 | 41 | 58 | 0.9 | 1.7 |
| promoter · mid · spirit | 10 | 422 | 616 | 422 | -19 | 7.5 | 0.0 | 60 | -2.7 | 42 | 58 | 1.0 | 1.7 |
| promoter · mid · angel | 10 | 444 | 574 | 444 | -31 | 0.0 | 0.0 | 60 | -1.2 | 41 | 62 | 0.9 | 1.5 |
| promoter · mid · angel/lantern | 10 | 473 | 564 | 473 | -21 | 2.5 | 0.0 | 57 | -2.9 | 40 | 59 | 0.9 | 1.9 |
| promoter · mid · android | 10 | 473 | 590 | 473 | -75 | 0.0 | 51 | 61 | 4.4 | 43 | 64 | 0.9 | 1.9 |
| promoter · late · base | 10 | 1,282 | 1,504 | 1,282 | -23 | 0.8 | 0.0 | 58 | 5.9 | 40 | 50 | 0.4 | 4.5 |
| promoter · late · elf | 10 | 1,225 | 1,447 | 1,226 | -22 | 1.7 | 0.0 | 57 | 1.4 | 38 | 44 | 0.5 | 4.2 |
| promoter · late · beastkin/fox | 10 | 1,203 | 1,430 | 1,204 | -14 | 0.0 | 0.0 | 58 | 6.7 | 40 | 50 | 0.6 | 4.7 |
| promoter · late · beastkin/wolf | 10 | 1,190 | 1,396 | 1,191 | -14 | 0.0 | 0.0 | 57 | 6.9 | 40 | 49 | 0.6 | 4.9 |
| promoter · late · demon | 10 | 1,193 | 1,436 | 1,194 | -15 | 38 | 0.0 | 59 | 5.8 | 39 | 44 | 0.6 | 4.5 |
| promoter · late · dwarf | 10 | 1,214 | 1,456 | 1,215 | -26 | 0.0 | 0.0 | 57 | 5.3 | 39 | 48 | 0.4 | 4.3 |
| promoter · late · spirit | 10 | 1,154 | 1,371 | 1,154 | -25 | 3.3 | 0.0 | 57 | 2.0 | 38 | 49 | 0.7 | 4.3 |
| promoter · late · angel | 10 | 1,233 | 1,437 | 1,233 | -32 | 0.0 | 0.0 | 60 | 8.1 | 40 | 51 | 0.4 | 4.1 |
| promoter · late · angel/lantern | 10 | 1,307 | 1,533 | 1,308 | -13 | 0.0 | 0.0 | 59 | 3.8 | 41 | 52 | 0.5 | 4.5 |
| promoter · late · android | 10 | 1,192 | 1,397 | 1,192 | -77 | 0.0 | 53 | 59 | 7.5 | 39 | 47 | 0.5 | 4.4 |
| security · early4 · base | 10 | 585 | 585 | 585 | -23 | 5.0 | 0.0 | 54 | -6.1 | 34 | 26 | 0.3 | 0.6 |
| security · early4 · elf | 10 | 603 | 603 | 603 | -26 | 3.3 | 0.0 | 55 | -5.4 | 34 | 25 | 0.3 | 0.6 |
| security · early4 · beastkin/fox | 10 | 648 | 648 | 648 | -16 | 2.5 | 0.0 | 55 | -5.4 | 34 | 24 | 0.3 | 0.7 |
| security · early4 · beastkin/wolf | 10 | 645 | 645 | 645 | -19 | 3.3 | 0.0 | 55 | -6.7 | 35 | 24 | 0.3 | 0.6 |
| security · early4 · demon | 10 | 581 | 581 | 581 | -24 | 44 | 0.0 | 56 | -8.0 | 34 | 24 | 0.5 | 0.6 |
| security · early4 · dwarf | 10 | 603 | 603 | 603 | -27 | 0.8 | 0.0 | 55 | -7.2 | 34 | 25 | 0.3 | 0.5 |
| security · early4 · spirit | 10 | 646 | 646 | 646 | -27 | 10 | 0.0 | 56 | -4.9 | 34 | 25 | 0.3 | 0.6 |
| security · early4 · angel | 10 | 650 | 650 | 650 | -32 | 0.0 | 0.0 | 56 | -4.8 | 35 | 25 | 0.3 | 0.4 |
| security · early4 · angel/lantern | 10 | 620 | 620 | 620 | -24 | 5.0 | 0.0 | 55 | -6.9 | 34 | 24 | 0.3 | 0.7 |
| security · early4 · android | 10 | 582 | 582 | 582 | -77 | 0.8 | 53 | 56 | -5.2 | 34 | 24 | 0.3 | 0.5 |
| security · mid · base | 10 | 342 | 455 | 342 | -22 | 2.5 | 0.0 | 62 | -0.3 | 46 | 69 | 0.3 | 2.2 |
| security · mid · elf | 10 | 363 | 444 | 363 | -18 | 2.5 | 0.0 | 61 | 1.1 | 47 | 72 | 0.3 | 1.8 |
| security · mid · beastkin/fox | 10 | 323 | 404 | 323 | -12 | 0.0 | 0.0 | 57 | -5.2 | 45 | 68 | 0.3 | 1.9 |
| security · mid · beastkin/wolf | 10 | 301 | 416 | 301 | -17 | 0.0 | 0.0 | 60 | -2.5 | 45 | 67 | 0.3 | 1.9 |
| security · mid · demon | 10 | 358 | 441 | 358 | -13 | 39 | 0.0 | 61 | -3.5 | 44 | 70 | 0.5 | 2.0 |
| security · mid · dwarf | 10 | 357 | 466 | 357 | -23 | 0.0 | 0.0 | 60 | -2.2 | 46 | 69 | 0.4 | 1.7 |
| security · mid · spirit | 10 | 334 | 453 | 334 | -19 | 7.5 | 0.0 | 59 | -0.5 | 46 | 70 | 0.3 | 2.0 |
| security · mid · angel | 10 | 330 | 445 | 330 | -31 | 0.8 | 0.0 | 60 | 1.2 | 47 | 71 | 0.3 | 1.4 |
| security · mid · angel/lantern | 10 | 353 | 483 | 353 | -16 | 5.0 | 0.0 | 62 | -3.5 | 46 | 70 | 0.5 | 2.1 |
| security · mid · android | 10 | 358 | 439 | 358 | -70 | 0.0 | 53 | 60 | 0.2 | 46 | 73 | 0.3 | 2.0 |
| security · late · base | 10 | 1,217 | 1,467 | 1,217 | -19 | 1.7 | 0.0 | 58 | 6.4 | 41 | 48 | 0.1 | 4.6 |
| security · late · elf | 10 | 1,239 | 1,503 | 1,239 | -21 | 2.5 | 0.0 | 61 | 9.3 | 45 | 53 | 0.1 | 4.2 |
| security · late · beastkin/fox | 10 | 1,341 | 1,597 | 1,341 | -13 | 1.7 | 0.0 | 61 | 12 | 44 | 54 | 0.1 | 4.5 |
| security · late · beastkin/wolf | 10 | 1,198 | 1,510 | 1,199 | -21 | 0.0 | 0.0 | 61 | 9.8 | 45 | 52 | 0.1 | 4.4 |
| security · late · demon | 10 | 1,149 | 1,345 | 1,150 | -18 | 41 | 0.0 | 60 | 11 | 43 | 56 | 0.3 | 4.7 |
| security · late · dwarf | 10 | 1,108 | 1,288 | 1,109 | -28 | 0.0 | 0.0 | 58 | 6.0 | 44 | 56 | 0.1 | 4.5 |
| security · late · spirit | 10 | 1,188 | 1,459 | 1,188 | -25 | 5.0 | 0.0 | 59 | 8.3 | 40 | 50 | 0.3 | 4.4 |
| security · late · angel | 10 | 1,219 | 1,472 | 1,219 | -33 | 0.0 | 0.0 | 60 | 10.0 | 42 | 52 | 0.1 | 4.2 |
| security · late · angel/lantern | 10 | 1,258 | 1,443 | 1,259 | -9.9 | 7.5 | 0.0 | 60 | 7.3 | 43 | 55 | 0.1 | 5.1 |
| security · late · android | 10 | 1,210 | 1,469 | 1,211 | -79 | 0.0 | 54 | 61 | 14 | 43 | 54 | 0.2 | 4.6 |
| bartender · early4 · base | 10 | 547 | 765 | 547 | 13 | 3.3 | 0.0 | 58 | -4.6 | 31 | 21 | 0.9 | 0.5 |
| bartender · early4 · elf | 10 | 460 | 758 | 460 | 17 | 5.0 | 0.0 | 59 | -9.4 | 32 | 22 | 1.0 | 0.6 |
| bartender · early4 · beastkin/fox | 10 | 570 | 843 | 570 | 29 | 4.2 | 0.0 | 60 | -1.9 | 32 | 22 | 0.8 | 0.9 |
| bartender · early4 · beastkin/wolf | 10 | 573 | 832 | 573 | 26 | 3.3 | 0.0 | 60 | -0.3 | 32 | 22 | 0.9 | 0.8 |
| bartender · early4 · demon | 10 | 413 | 592 | 413 | 6.0 | 41 | 0.0 | 56 | -9.4 | 29 | 22 | 0.7 | 1.1 |
| bartender · early4 · dwarf | 10 | 491 | 761 | 491 | 20 | 0.8 | 0.0 | 58 | -3.4 | 32 | 22 | 0.8 | 0.6 |
| bartender · early4 · spirit | 10 | 497 | 775 | 497 | 14 | 9.2 | 0.0 | 58 | -5.9 | 31 | 22 | 0.7 | 0.7 |
| bartender · early4 · angel | 10 | 470 | 712 | 470 | 11 | 0.8 | 0.0 | 59 | -5.7 | 31 | 22 | 0.8 | 0.5 |
| bartender · early4 · angel/lantern | 10 | 558 | 802 | 558 | 18 | 4.2 | 0.0 | 59 | -1.5 | 31 | 22 | 0.8 | 0.7 |
| bartender · early4 · android | 10 | 440 | 684 | 440 | -37 | 0.8 | 52 | 58 | -3.8 | 31 | 22 | 0.8 | 0.5 |
| bartender · mid · base | 10 | 383 | 572 | 383 | 49 | 0.8 | 0.0 | 64 | -4.0 | 45 | 71 | 0.8 | 1.9 |
| bartender · mid · elf | 10 | 418 | 612 | 418 | 47 | 1.7 | 0.0 | 63 | -2.6 | 45 | 68 | 0.9 | 2.2 |
| bartender · mid · beastkin/fox | 10 | 378 | 642 | 378 | 72 | 0.0 | 0.0 | 64 | 0.3 | 48 | 72 | 0.9 | 2.5 |
| bartender · mid · beastkin/wolf | 10 | 429 | 636 | 429 | 68 | 0.0 | 0.0 | 63 | 1.6 | 47 | 70 | 0.8 | 2.2 |
| bartender · mid · demon | 10 | 358 | 531 | 358 | 19 | 39 | 0.0 | 64 | -4.6 | 47 | 73 | 0.7 | 2.0 |
| bartender · mid · dwarf | 10 | 407 | 671 | 407 | 63 | 0.0 | 0.0 | 64 | 0.3 | 47 | 70 | 0.9 | 1.9 |
| bartender · mid · spirit | 10 | 370 | 596 | 370 | 48 | 5.0 | 0.0 | 65 | 1.3 | 49 | 74 | 0.7 | 1.8 |
| bartender · mid · angel | 10 | 405 | 657 | 405 | 49 | 0.0 | 0.0 | 65 | -0.5 | 46 | 69 | 0.7 | 1.8 |
| bartender · mid · angel/lantern | 10 | 390 | 595 | 390 | 62 | 2.5 | 0.0 | 62 | -4.0 | 46 | 72 | 0.7 | 2.3 |
| bartender · mid · android | 10 | 361 | 585 | 361 | 6.1 | 0.0 | 54 | 64 | 2.7 | 48 | 74 | 0.8 | 1.9 |
| bartender · late · base | 10 | 1,266 | 1,457 | 1,266 | 85 | 5.0 | 0.0 | 61 | 9.2 | 45 | 60 | 0.3 | 4.6 |
| bartender · late · elf | 10 | 1,261 | 1,452 | 1,261 | 84 | 3.3 | 0.0 | 60 | 7.1 | 44 | 57 | 0.3 | 4.9 |
| bartender · late · beastkin/fox | 10 | 1,237 | 1,414 | 1,237 | 101 | 0.8 | 0.0 | 60 | 7.4 | 43 | 56 | 0.4 | 4.5 |
| bartender · late · beastkin/wolf | 10 | 1,244 | 1,445 | 1,245 | 98 | 0.0 | 0.0 | 60 | 9.2 | 44 | 57 | 0.4 | 4.6 |
| bartender · late · demon | 10 | 1,225 | 1,361 | 1,226 | 50 | 40 | 0.0 | 59 | 5.9 | 39 | 51 | 0.5 | 4.6 |
| bartender · late · dwarf | 10 | 1,299 | 1,508 | 1,300 | 107 | 0.0 | 0.0 | 61 | 9.0 | 44 | 57 | 0.3 | 4.5 |
| bartender · late · spirit | 10 | 1,222 | 1,350 | 1,223 | 87 | 4.2 | 0.0 | 58 | 5.2 | 41 | 55 | 0.4 | 4.7 |
| bartender · late · angel | 10 | 1,277 | 1,497 | 1,277 | 81 | 0.0 | 0.0 | 62 | 12 | 46 | 58 | 0.3 | 4.2 |
| bartender · late · angel/lantern | 10 | 1,281 | 1,480 | 1,281 | 93 | 2.5 | 0.0 | 61 | 7.3 | 43 | 58 | 0.4 | 4.7 |
| bartender · late · android | 10 | 1,264 | 1,426 | 1,265 | 42 | 0.0 | 56 | 61 | 7.5 | 42 | 56 | 0.4 | 4.8 |
| host · early4 · base | 10 | 808 | 808 | 808 | -15 | 33 | 0.0 | 59 | -3.2 | 31 | 19 | 0.8 | 0.6 |
| host · early4 · elf | 10 | 831 | 831 | 831 | -17 | 35 | 0.0 | 61 | -3.6 | 32 | 20 | 0.6 | 0.6 |
| host · early4 · beastkin/fox | 10 | 867 | 867 | 867 | -7.3 | 29 | 0.0 | 61 | -0.3 | 31 | 18 | 0.8 | 0.8 |
| host · early4 · beastkin/wolf | 10 | 850 | 850 | 850 | -6.9 | 31 | 0.0 | 62 | -1.1 | 32 | 19 | 0.7 | 0.8 |
| host · early4 · demon | 10 | 875 | 875 | 875 | -7.1 | 57 | 0.0 | 60 | -6.2 | 32 | 19 | 0.7 | 0.8 |
| host · early4 · dwarf | 10 | 890 | 890 | 890 | -13 | 24 | 0.0 | 63 | 0.7 | 30 | 18 | 0.7 | 0.6 |
| host · early4 · spirit | 10 | 861 | 861 | 861 | -16 | 40 | 0.0 | 61 | -2.8 | 32 | 19 | 0.7 | 0.7 |
| host · early4 · angel | 10 | 922 | 922 | 922 | -19 | 35 | 0.0 | 62 | 0.9 | 31 | 19 | 0.7 | 0.5 |
| host · early4 · angel/lantern | 10 | 852 | 852 | 852 | -16 | 33 | 0.0 | 60 | -3.0 | 32 | 19 | 0.6 | 0.6 |
| host · early4 · android | 10 | 970 | 970 | 970 | -96 | 0.8 | 107 | 67 | 3.4 | 30 | 16 | 0.7 | 1.0 |
| host · mid · base | 10 | 393 | 555 | 393 | -11 | 36 | 0.0 | 66 | 0.3 | 43 | 62 | 0.9 | 2.3 |
| host · mid · elf | 10 | 396 | 544 | 396 | -10 | 39 | 0.0 | 65 | -3.7 | 42 | 60 | 0.9 | 2.3 |
| host · mid · beastkin/fox | 10 | 352 | 487 | 352 | -0.3 | 31 | 0.0 | 65 | -2.3 | 43 | 62 | 0.9 | 2.6 |
| host · mid · beastkin/wolf | 10 | 385 | 457 | 385 | -1.9 | 28 | 0.0 | 63 | -1.3 | 40 | 60 | 0.9 | 2.6 |
| host · mid · demon | 10 | 389 | 557 | 389 | -3.7 | 52 | 0.0 | 67 | -2.5 | 45 | 68 | 0.8 | 2.4 |
| host · mid · dwarf | 10 | 468 | 594 | 468 | -5.7 | 21 | 0.0 | 65 | 3.5 | 40 | 54 | 0.8 | 2.7 |
| host · mid · spirit | 10 | 329 | 491 | 329 | -11 | 41 | 0.0 | 65 | -3.3 | 45 | 65 | 0.9 | 1.9 |
| host · mid · angel | 10 | 447 | 587 | 447 | -14 | 38 | 0.0 | 67 | -3.5 | 44 | 63 | 0.9 | 2.3 |
| host · mid · angel/lantern | 10 | 401 | 530 | 401 | -5.1 | 43 | 0.0 | 65 | -5.0 | 40 | 59 | 0.9 | 2.7 |
| host · mid · android | 10 | 424 | 498 | 424 | -95 | 0.0 | 120 | 69 | 11 | 40 | 55 | 0.9 | 3.2 |
| host · late · base | 10 | 1,256 | 1,435 | 1,256 | -8.4 | 39 | 0.0 | 61 | 12 | 40 | 48 | 0.5 | 4.8 |
| host · late · elf | 10 | 1,267 | 1,459 | 1,268 | -11 | 39 | 0.0 | 62 | 10 | 39 | 48 | 0.4 | 4.5 |
| host · late · beastkin/fox | 10 | 1,223 | 1,467 | 1,223 | 0.3 | 33 | 0.0 | 61 | 7.6 | 40 | 50 | 0.6 | 4.7 |
| host · late · beastkin/wolf | 10 | 1,247 | 1,496 | 1,248 | 0.0 | 33 | 0.0 | 61 | 11 | 42 | 52 | 0.4 | 5.0 |
| host · late · demon | 10 | 1,149 | 1,335 | 1,149 | -3.1 | 54 | 0.0 | 61 | 5.5 | 39 | 46 | 0.5 | 4.6 |
| host · late · dwarf | 10 | 1,207 | 1,428 | 1,207 | 0.3 | 22 | 0.0 | 61 | 11 | 40 | 50 | 0.6 | 5.1 |
| host · late · spirit | 10 | 1,160 | 1,371 | 1,160 | -12 | 35 | 0.0 | 59 | 7.7 | 37 | 43 | 0.5 | 4.5 |
| host · late · angel | 10 | 1,257 | 1,467 | 1,257 | -10 | 38 | 0.0 | 62 | 12 | 40 | 47 | 0.5 | 4.3 |
| host · late · angel/lantern | 10 | 1,272 | 1,443 | 1,272 | -2.4 | 40 | 0.0 | 62 | 9.5 | 40 | 50 | 0.4 | 5.0 |
| host · late · android | 10 | 1,237 | 1,451 | 1,237 | -97 | 0.0 | 130 | 66 | 5.1 | 35 | 45 | 0.6 | 5.8 |
| attendant · early4 · base | 10 | 514 | 514 | 514 | -2.5 | 7.5 | 0.0 | 55 | -9.4 | 38 | 23 | 0.7 | 0.5 |
| attendant · early4 · elf | 10 | 605 | 605 | 605 | 17 | 8.3 | 0.0 | 53 | -5.0 | 38 | 22 | 0.6 | 0.6 |
| attendant · early4 · beastkin/fox | 10 | 588 | 588 | 588 | 14 | 6.7 | 0.0 | 54 | -9.1 | 39 | 22 | 0.7 | 0.8 |
| attendant · early4 · beastkin/wolf | 10 | 562 | 562 | 562 | 24 | 5.8 | 0.0 | 54 | -7.5 | 38 | 22 | 0.7 | 0.7 |
| attendant · early4 · demon | 10 | 549 | 549 | 549 | 27 | 30 | 0.0 | 53 | -6.8 | 36 | 22 | 0.8 | 0.7 |
| attendant · early4 · dwarf | 10 | 523 | 523 | 523 | 8.4 | 3.3 | 0.0 | 53 | -10 | 38 | 22 | 0.7 | 0.6 |
| attendant · early4 · spirit | 10 | 560 | 560 | 560 | 8.6 | 10.0 | 0.0 | 54 | -7.2 | 38 | 22 | 0.8 | 0.7 |
| attendant · early4 · angel | 10 | 568 | 568 | 568 | 3.4 | 5.0 | 0.0 | 54 | -5.1 | 39 | 22 | 0.6 | 0.5 |
| attendant · early4 · angel/lantern | 10 | 591 | 591 | 591 | 14 | 5.8 | 0.0 | 54 | -5.7 | 38 | 22 | 0.8 | 0.8 |
| attendant · early4 · android | 10 | 503 | 503 | 503 | -39 | 1.7 | 54 | 55 | -5.6 | 38 | 22 | 0.6 | 0.6 |
| attendant · mid · base | 10 | 265 | 420 | 265 | 27 | 36 | 0.0 | 58 | -6.9 | 49 | 67 | 0.8 | 1.8 |
| attendant · mid · elf | 10 | 317 | 418 | 317 | 44 | 27 | 0.0 | 56 | -5.0 | 46 | 60 | 0.9 | 1.9 |
| attendant · mid · beastkin/fox | 10 | 334 | 526 | 334 | 53 | 25 | 0.0 | 59 | 3.3 | 51 | 62 | 0.8 | 2.0 |
| attendant · mid · beastkin/wolf | 10 | 337 | 492 | 337 | 66 | 23 | 0.0 | 57 | 0.5 | 50 | 66 | 0.7 | 1.9 |
| attendant · mid · demon | 10 | 328 | 419 | 328 | 65 | 37 | 0.0 | 56 | -5.9 | 47 | 64 | 0.7 | 1.7 |
| attendant · mid · dwarf | 10 | 309 | 447 | 309 | 51 | 23 | 0.0 | 57 | -5.6 | 49 | 65 | 0.9 | 1.9 |
| attendant · mid · spirit | 10 | 340 | 478 | 340 | 41 | 29 | 0.0 | 58 | -1.7 | 49 | 65 | 0.8 | 1.9 |
| attendant · mid · angel | 10 | 326 | 480 | 326 | 38 | 27 | 0.0 | 59 | -4.1 | 50 | 68 | 0.8 | 1.6 |
| attendant · mid · angel/lantern | 10 | 382 | 521 | 382 | 52 | 26 | 0.0 | 59 | 1.8 | 51 | 67 | 0.8 | 1.6 |
| attendant · mid · android | 10 | 246 | 399 | 246 | 24 | 20 | 58 | 58 | -5.3 | 51 | 69 | 1.0 | 2.1 |
| attendant · late · base | 10 | 1,272 | 1,445 | 1,272 | 58 | 16 | 0.0 | 59 | 7.5 | 43 | 49 | 0.5 | 4.3 |
| attendant · late · elf | 10 | 1,232 | 1,371 | 1,232 | 73 | 9.2 | 0.0 | 60 | 7.1 | 46 | 53 | 0.4 | 4.5 |
| attendant · late · beastkin/fox | 10 | 1,144 | 1,333 | 1,145 | 80 | 13 | 0.0 | 57 | 3.8 | 40 | 46 | 0.5 | 4.9 |
| attendant · late · beastkin/wolf | 10 | 1,168 | 1,323 | 1,168 | 77 | 9.2 | 0.0 | 58 | 2.4 | 43 | 52 | 0.5 | 4.5 |
| attendant · late · demon | 10 | 1,168 | 1,418 | 1,168 | 94 | 23 | 0.0 | 59 | 4.3 | 42 | 47 | 0.5 | 4.8 |
| attendant · late · dwarf | 10 | 1,149 | 1,364 | 1,150 | 75 | 5.0 | 0.0 | 59 | 8.6 | 44 | 51 | 0.5 | 4.3 |
| attendant · late · spirit | 10 | 1,188 | 1,402 | 1,188 | 67 | 16 | 0.0 | 58 | 7.6 | 41 | 47 | 0.6 | 4.3 |
| attendant · late · angel | 10 | 1,210 | 1,411 | 1,210 | 78 | 12 | 0.0 | 59 | 7.5 | 44 | 48 | 0.4 | 4.7 |
| attendant · late · angel/lantern | 10 | 1,202 | 1,381 | 1,203 | 65 | 15 | 0.0 | 58 | 3.3 | 42 | 49 | 0.5 | 4.5 |
| attendant · late · android | 10 | 1,076 | 1,273 | 1,077 | 57 | 4.2 | 74 | 57 | 2.7 | 40 | 49 | 0.6 | 4.5 |
| madame · early4 · base | 10 | 735 | 735 | 735 | -12 | 5.0 | 0.0 | 58 | -2.2 | 30 | 21 | 0.8 | 0.5 |
| madame · early4 · elf | 10 | 761 | 761 | 761 | -14 | 2.5 | 0.0 | 59 | -3.7 | 29 | 20 | 0.8 | 0.4 |
| madame · early4 · beastkin/fox | 10 | 723 | 723 | 723 | -9.1 | 1.7 | 0.0 | 58 | -2.7 | 29 | 21 | 0.8 | 0.4 |
| madame · early4 · beastkin/wolf | 10 | 721 | 721 | 721 | -8.0 | 2.5 | 0.0 | 58 | -3.9 | 29 | 20 | 0.7 | 0.5 |
| madame · early4 · demon | 10 | 714 | 714 | 714 | -14 | 41 | 0.0 | 60 | -4.8 | 29 | 21 | 0.8 | 0.6 |
| madame · early4 · dwarf | 10 | 729 | 729 | 729 | -16 | 0.8 | 0.0 | 58 | -4.7 | 28 | 21 | 0.7 | 0.4 |
| madame · early4 · spirit | 10 | 742 | 742 | 742 | -19 | 9.2 | 0.0 | 59 | -5.0 | 29 | 21 | 0.7 | 0.6 |
| madame · early4 · angel | 10 | 736 | 736 | 736 | -19 | 0.0 | 0.0 | 58 | -4.5 | 29 | 21 | 0.7 | 0.1 |
| madame · early4 · angel/lantern | 10 | 740 | 740 | 740 | -12 | 4.2 | 0.0 | 59 | -4.7 | 30 | 21 | 0.7 | 0.5 |
| madame · early4 · android | 10 | 754 | 754 | 754 | -64 | 0.8 | 53 | 59 | -0.2 | 29 | 20 | 0.7 | 0.5 |
| madame · mid · base | 10 | 409 | 694 | 409 | 18 | 10 | 0.0 | 60 | -2.2 | 39 | 58 | 0.9 | 2.0 |
| madame · mid · elf | 10 | 404 | 695 | 404 | 20 | 8.3 | 0.0 | 61 | 1.9 | 41 | 62 | 0.9 | 2.2 |
| madame · mid · beastkin/fox | 10 | 282 | 587 | 282 | 31 | 8.3 | 0.0 | 56 | -6.3 | 39 | 67 | 0.9 | 2.5 |
| madame · mid · beastkin/wolf | 10 | 283 | 598 | 283 | 35 | 5.8 | 0.0 | 55 | -4.6 | 40 | 66 | 1.0 | 2.4 |
| madame · mid · demon | 10 | 461 | 649 | 461 | 12 | 37 | 0.0 | 63 | -5.2 | 43 | 65 | 0.9 | 1.7 |
| madame · mid · dwarf | 10 | 354 | 657 | 354 | 25 | 0.0 | 0.0 | 54 | -4.9 | 39 | 64 | 0.9 | 2.7 |
| madame · mid · spirit | 10 | 413 | 665 | 413 | 24 | 16 | 0.0 | 62 | -3.6 | 41 | 60 | 1.0 | 2.1 |
| madame · mid · angel | 10 | 384 | 680 | 384 | 21 | 5.8 | 0.0 | 59 | -0.9 | 41 | 64 | 0.8 | 2.2 |
| madame · mid · angel/lantern | 10 | 370 | 659 | 370 | 29 | 9.2 | 0.0 | 59 | -3.6 | 41 | 64 | 0.8 | 2.4 |
| madame · mid · android | 10 | 439 | 746 | 439 | -29 | 0.0 | 66 | 63 | 4.5 | 41 | 55 | 1.0 | 2.3 |
| madame · late · base | 10 | 1,014 | 1,516 | 1,014 | 39 | 8.3 | 0.0 | 60 | 9.3 | 37 | 51 | 0.6 | 4.6 |
| madame · late · elf | 10 | 938 | 1,453 | 939 | 42 | 6.7 | 0.0 | 60 | 9.3 | 38 | 52 | 0.5 | 4.8 |
| madame · late · beastkin/fox | 10 | 937 | 1,461 | 937 | 45 | 4.2 | 0.0 | 58 | 7.5 | 38 | 49 | 0.5 | 5.0 |
| madame · late · beastkin/wolf | 10 | 908 | 1,427 | 908 | 46 | 4.2 | 0.0 | 58 | 6.4 | 38 | 48 | 0.4 | 4.6 |
| madame · late · demon | 10 | 1,085 | 1,377 | 1,086 | 11 | 44 | 0.0 | 57 | 2.6 | 35 | 42 | 0.5 | 4.6 |
| madame · late · dwarf | 10 | 1,001 | 1,552 | 1,002 | 36 | 0.0 | 0.0 | 60 | 7.3 | 37 | 47 | 0.4 | 4.6 |
| madame · late · spirit | 10 | 987 | 1,434 | 988 | 37 | 12 | 0.0 | 59 | 8.5 | 38 | 51 | 0.4 | 4.8 |
| madame · late · angel | 10 | 963 | 1,474 | 963 | 40 | 5.8 | 0.0 | 60 | 10 | 41 | 53 | 0.3 | 4.6 |
| madame · late · angel/lantern | 10 | 954 | 1,426 | 955 | 41 | 13 | 0.0 | 59 | 6.8 | 40 | 49 | 0.4 | 4.5 |
| madame · late · android | 10 | 910 | 1,456 | 911 | -18 | 0.0 | 66 | 59 | 5.9 | 35 | 44 | 0.5 | 4.4 |
| chapel · early4 · base | 10 | 464 | 464 | 464 | -18 | 0.8 | 0.0 | 55 | -12 | 33 | 24 | 0.7 | 0.9 |
| chapel · early4 · elf | 10 | 504 | 504 | 504 | -18 | 0.0 | 0.0 | 55 | -9.5 | 34 | 24 | 0.7 | 0.9 |
| chapel · early4 · beastkin/fox | 10 | 495 | 495 | 495 | -8.3 | 1.7 | 0.0 | 55 | -10 | 33 | 24 | 0.7 | 0.8 |
| chapel · early4 · beastkin/wolf | 10 | 496 | 496 | 496 | -14 | 1.7 | 0.0 | 55 | -11 | 33 | 23 | 0.7 | 0.6 |
| chapel · early4 · demon | 10 | 423 | 423 | 423 | -20 | 37 | 0.0 | 57 | -9.9 | 35 | 24 | 0.8 | 0.9 |
| chapel · early4 · dwarf | 10 | 502 | 502 | 502 | -23 | 0.8 | 0.0 | 55 | -8.4 | 33 | 24 | 0.7 | 0.5 |
| chapel · early4 · spirit | 10 | 517 | 517 | 517 | -18 | 3.3 | 0.0 | 55 | -8.0 | 33 | 24 | 0.7 | 0.7 |
| chapel · early4 · angel | 10 | 534 | 534 | 534 | -17 | 0.0 | 0.0 | 54 | -8.5 | 36 | 25 | 0.6 | 0.5 |
| chapel · early4 · angel/lantern | 10 | 581 | 581 | 581 | -7.0 | 4.2 | 0.0 | 54 | -8.1 | 35 | 23 | 0.7 | 1.1 |
| chapel · early4 · android | 10 | 441 | 441 | 441 | -63 | 0.8 | 45 | 55 | -9.2 | 32 | 23 | 0.8 | 0.7 |
| chapel · mid · base | 10 | 317 | 417 | 317 | -9.5 | 0.0 | 0.0 | 60 | -6.4 | 43 | 68 | 0.9 | 1.9 |
| chapel · mid · elf | 10 | 281 | 392 | 281 | -11 | 0.0 | 0.0 | 61 | -7.0 | 45 | 72 | 0.9 | 1.7 |
| chapel · mid · beastkin/fox | 10 | 250 | 399 | 250 | -13 | 0.0 | 0.0 | 61 | -6.6 | 44 | 68 | 0.9 | 1.8 |
| chapel · mid · beastkin/wolf | 10 | 271 | 381 | 271 | -9.0 | 0.0 | 0.0 | 59 | -11 | 41 | 66 | 0.9 | 2.1 |
| chapel · mid · demon | 10 | 266 | 402 | 266 | -14 | 29 | 0.0 | 63 | -11 | 42 | 70 | 0.6 | 1.8 |
| chapel · mid · dwarf | 10 | 263 | 389 | 263 | -12 | 0.0 | 0.0 | 60 | -5.7 | 42 | 64 | 0.8 | 2.0 |
| chapel · mid · spirit | 10 | 241 | 380 | 241 | -13 | 0.0 | 0.0 | 60 | -9.0 | 43 | 69 | 0.9 | 1.8 |
| chapel · mid · angel | 10 | 249 | 416 | 249 | -14 | 0.0 | 0.0 | 59 | -3.0 | 48 | 70 | 0.9 | 1.6 |
| chapel · mid · angel/lantern | 10 | 275 | 400 | 275 | 1.3 | 0.8 | 0.0 | 59 | -6.7 | 46 | 65 | 0.9 | 2.6 |
| chapel · mid · android | 10 | 271 | 345 | 271 | -57 | 0.0 | 46 | 61 | -5.9 | 42 | 68 | 0.9 | 1.9 |
| chapel · late · base | 10 | 1,058 | 1,270 | 1,059 | -1.3 | 1.7 | 0.0 | 57 | -0.3 | 39 | 47 | 0.4 | 4.9 |
| chapel · late · elf | 10 | 1,095 | 1,312 | 1,096 | -4.5 | 1.7 | 0.0 | 61 | 2.5 | 41 | 52 | 0.4 | 4.5 |
| chapel · late · beastkin/fox | 10 | 1,041 | 1,267 | 1,041 | 5.3 | 0.0 | 0.0 | 58 | 3.0 | 40 | 47 | 0.5 | 5.1 |
| chapel · late · beastkin/wolf | 10 | 1,160 | 1,398 | 1,160 | 7.7 | 1.7 | 0.0 | 60 | 1.3 | 40 | 47 | 0.4 | 4.9 |
| chapel · late · demon | 10 | 1,127 | 1,340 | 1,128 | -15 | 33 | 0.0 | 61 | 6.4 | 40 | 55 | 0.6 | 4.8 |
| chapel · late · dwarf | 10 | 1,080 | 1,235 | 1,080 | 0.5 | 0.0 | 0.0 | 58 | 3.4 | 39 | 49 | 0.5 | 4.7 |
| chapel · late · spirit | 10 | 1,065 | 1,237 | 1,065 | -0.9 | 1.7 | 0.0 | 58 | 1.2 | 40 | 51 | 0.4 | 4.8 |
| chapel · late · angel | 10 | 1,112 | 1,270 | 1,112 | 18 | 1.7 | 0.0 | 58 | 4.7 | 40 | 46 | 0.5 | 4.5 |
| chapel · late · angel/lantern | 10 | 1,110 | 1,317 | 1,110 | 34 | 2.5 | 0.0 | 56 | -0.2 | 40 | 42 | 0.5 | 5.3 |
| chapel · late · android | 10 | 1,001 | 1,139 | 1,001 | -50 | 0.0 | 48 | 58 | 3.2 | 40 | 52 | 0.4 | 5.5 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ net | Δ testedNet | Δ sat | Δ repGain | Δ trouble |
|---|---|---|---|---|---|---|
| maid · early4 · elf | +34.8 ± 37.9 | +34.8 ± 37.9 | -1.3 ± 2.1 | +0.7 ± 1.1 | -1.3 ± 2.1 | +0.1 ± 0.1 |
| maid · early4 · beastkin/fox | +20.3 ± 55.7 | +20.3 ± 55.7 | **+6.9 ± 5.3** | -0.5 ± 2.3 | -2.7 ± 2.9 | -0.1 ± 0.2 |
| maid · early4 · beastkin/wolf | +34.9 ± 39.0 | +34.9 ± 39.0 | **+8.4 ± 7.3** | -0.4 ± 2.2 | -0.1 ± 3.1 | -0.1 ± 0.2 |
| maid · early4 · demon | +4.0 ± 85.6 | +4.0 ± 85.6 | +6.1 ± 9.5 | -0.2 ± 2.8 | -5.5 ± 6.2 | -0.0 ± 0.2 |
| maid · early4 · dwarf | +4.0 ± 61.8 | +4.0 ± 61.8 | -1.2 ± 5.0 | -0.8 ± 1.8 | -3.1 ± 4.4 | -0.1 ± 0.2 |
| maid · early4 · spirit | +33.2 ± 44.0 | +33.2 ± 44.0 | +0.1 ± 4.8 | -1.0 ± 2.2 | +2.4 ± 2.5 | -0.0 ± 0.2 |
| maid · early4 · angel | +8.6 ± 68.5 | +8.6 ± 68.5 | **-6.8 ± 6.1** | -0.2 ± 2.3 | +1.3 ± 4.7 | -0.1 ± 0.1 |
| maid · early4 · angel/lantern | +39.1 ± 66.9 | +39.1 ± 66.9 | +3.1 ± 5.6 | -0.7 ± 1.9 | +0.3 ± 3.1 | -0.1 ± 0.2 |
| maid · early4 · android | -17.0 ± 86.3 | -17.0 ± 86.3 | **-52.1 ± 5.6** | -1.0 ± 2.3 | -0.4 ± 1.8 | -0.0 ± 0.2 |
| maid · mid · elf | +9.4 ± 36.4 | +9.4 ± 36.4 | **+3.3 ± 3.1** | +0.6 ± 1.9 | +4.5 ± 4.6 | +0.1 ± 0.2 |
| maid · mid · beastkin/fox | -7.7 ± 104.2 | -7.7 ± 104.2 | **+13.8 ± 6.5** | +0.8 ± 3.4 | +5.4 ± 5.5 | -0.1 ± 0.2 |
| maid · mid · beastkin/wolf | -27.0 ± 98.2 | -27.0 ± 98.2 | **+10.4 ± 5.8** | +1.1 ± 3.4 | +1.6 ± 4.3 | -0.1 ± 0.2 |
| maid · mid · demon | +66.8 ± 101.0 | +66.8 ± 101.0 | **+12.4 ± 8.3** | +0.2 ± 3.2 | +1.2 ± 5.1 | -0.0 ± 0.2 |
| maid · mid · dwarf | +28.3 ± 109.0 | +28.3 ± 109.0 | +0.6 ± 3.5 | -0.4 ± 2.6 | +1.2 ± 8.7 | -0.0 ± 0.2 |
| maid · mid · spirit | +22.1 ± 78.0 | +22.1 ± 78.0 | **+5.9 ± 5.8** | -0.4 ± 2.2 | -2.0 ± 7.1 | +0.1 ± 0.2 |
| maid · mid · angel | +0.9 ± 101.9 | +0.9 ± 101.9 | **-4.2 ± 2.9** | -0.7 ± 2.1 | -0.8 ± 5.9 | -0.1 ± 0.2 |
| maid · mid · angel/lantern | -7.9 ± 85.8 | -7.9 ± 85.8 | +5.6 ± 6.3 | -1.2 ± 1.5 | +1.9 ± 5.3 | -0.1 ± 0.1 |
| maid · mid · android | -96.5 ± 129.7 | -96.5 ± 129.7 | **-48.6 ± 2.9** | +0.2 ± 2.7 | +3.1 ± 5.7 | -0.0 ± 0.2 |
| maid · late · elf | +60.8 ± 71.3 | +60.8 ± 71.3 | **-2.7 ± 1.9** | +0.9 ± 1.7 | +2.5 ± 5.4 | -0.0 ± 0.2 |
| maid · late · beastkin/fox | +22.0 ± 117.1 | +22.0 ± 117.1 | **+6.0 ± 3.5** | +0.0 ± 2.0 | +2.8 ± 7.5 | -0.1 ± 0.3 |
| maid · late · beastkin/wolf | +67.9 ± 185.3 | +67.9 ± 185.3 | **+5.2 ± 3.3** | +0.3 ± 3.1 | +1.7 ± 4.9 | -0.0 ± 0.3 |
| maid · late · demon | -217.2 ± 228.3 | -217.2 ± 228.3 | **+9.0 ± 7.1** | **-4.0 ± 3.0** | -3.0 ± 10.1 | -0.1 ± 0.2 |
| maid · late · dwarf | -32.1 ± 52.6 | -32.1 ± 52.6 | -5.0 ± 5.2 | -0.5 ± 1.7 | +3.1 ± 6.6 | -0.1 ± 0.2 |
| maid · late · spirit | +32.2 ± 147.5 | +32.2 ± 147.5 | -3.4 ± 3.7 | +0.2 ± 2.5 | +2.9 ± 7.7 | +0.0 ± 0.2 |
| maid · late · angel | +51.4 ± 90.7 | +51.4 ± 90.7 | **-11.9 ± 7.3** | +0.6 ± 1.7 | +3.9 ± 6.9 | **-0.2 ± 0.2** |
| maid · late · angel/lantern | +94.4 ± 104.5 | +94.4 ± 104.5 | +1.2 ± 7.0 | +0.9 ± 2.3 | -0.8 ± 12.2 | -0.1 ± 0.2 |
| maid · late · android | -70.4 ± 165.6 | -70.4 ± 165.6 | **-54.7 ± 4.5** | -0.1 ± 2.0 | +1.7 ± 7.3 | +0.0 ± 0.2 |
| promoter · early4 · elf | -15.3 ± 55.8 | -15.3 ± 55.8 | -2.3 ± 4.7 | -0.1 ± 2.5 | +0.8 ± 3.1 | -0.1 ± 0.2 |
| promoter · early4 · beastkin/fox | +10.4 ± 62.9 | +10.4 ± 62.9 | **+3.7 ± 2.3** | +0.3 ± 2.6 | +1.8 ± 2.9 | +0.1 ± 0.2 |
| promoter · early4 · beastkin/wolf | -1.2 ± 31.4 | -1.2 ± 31.4 | +1.9 ± 2.5 | -1.1 ± 2.8 | +1.8 ± 4.2 | +0.1 ± 0.2 |
| promoter · early4 · demon | **-103.7 ± 72.6** | **-103.7 ± 72.6** | +1.4 ± 6.5 | -0.2 ± 3.4 | +3.1 ± 3.1 | -0.1 ± 0.2 |
| promoter · early4 · dwarf | -40.1 ± 66.0 | -40.1 ± 66.0 | **-4.9 ± 4.7** | -0.1 ± 2.4 | +0.7 ± 3.1 | +0.1 ± 0.2 |
| promoter · early4 · spirit | -9.3 ± 81.9 | -9.3 ± 81.9 | -0.1 ± 3.9 | +0.0 ± 2.5 | +3.1 ± 4.5 | -0.0 ± 0.1 |
| promoter · early4 · angel | -7.1 ± 79.2 | -7.1 ± 79.2 | **-9.7 ± 5.7** | +0.4 ± 2.9 | +1.7 ± 3.0 | -0.0 ± 0.1 |
| promoter · early4 · angel/lantern | +7.8 ± 47.2 | +7.8 ± 47.2 | +1.8 ± 5.6 | +0.2 ± 2.7 | +0.3 ± 3.4 | -0.0 ± 0.2 |
| promoter · early4 · android | -37.7 ± 57.4 | -37.7 ± 57.4 | **-54.5 ± 5.0** | -0.4 ± 1.4 | -0.4 ± 4.6 | +0.1 ± 0.3 |
| promoter · mid · elf | -3.4 ± 83.6 | -3.4 ± 83.6 | -0.5 ± 4.4 | +1.6 ± 3.9 | +1.0 ± 8.1 | -0.0 ± 0.2 |
| promoter · mid · beastkin/fox | -17.9 ± 89.9 | -17.9 ± 89.9 | -1.8 ± 6.9 | -1.0 ± 3.3 | -2.8 ± 4.3 | -0.0 ± 0.2 |
| promoter · mid · beastkin/wolf | -33.9 ± 61.2 | -33.9 ± 61.2 | +1.5 ± 6.6 | **-1.9 ± 1.9** | +0.8 ± 4.4 | -0.0 ± 0.3 |
| promoter · mid · demon | -23.9 ± 67.7 | -23.9 ± 67.7 | +7.5 ± 8.2 | -1.7 ± 1.8 | -3.8 ± 4.3 | -0.0 ± 0.2 |
| promoter · mid · dwarf | +0.4 ± 62.8 | +0.4 ± 62.8 | -1.7 ± 2.0 | +1.3 ± 3.9 | +0.3 ± 8.1 | -0.1 ± 0.2 |
| promoter · mid · spirit | -52.0 ± 82.5 | -52.0 ± 82.5 | +0.6 ± 6.1 | +1.0 ± 3.4 | +1.2 ± 10.8 | +0.0 ± 0.3 |
| promoter · mid · angel | -30.1 ± 120.0 | -30.1 ± 120.0 | **-11.3 ± 8.7** | +1.0 ± 3.9 | +2.6 ± 5.6 | -0.1 ± 0.3 |
| promoter · mid · angel/lantern | -1.3 ± 81.5 | -1.3 ± 81.5 | -1.4 ± 4.1 | -1.1 ± 2.0 | +1.0 ± 3.9 | -0.1 ± 0.2 |
| promoter · mid · android | -1.5 ± 71.6 | -1.5 ± 71.6 | **-54.6 ± 6.0** | +2.7 ± 4.0 | **+8.3 ± 7.8** | -0.1 ± 0.2 |
| promoter · late · elf | -56.7 ± 150.0 | -56.7 ± 150.0 | +0.2 ± 5.8 | -1.0 ± 2.7 | -4.5 ± 5.8 | +0.1 ± 0.2 |
| promoter · late · beastkin/fox | -78.5 ± 123.1 | -78.5 ± 123.1 | **+8.0 ± 4.0** | -0.5 ± 2.3 | +0.8 ± 6.6 | **+0.2 ± 0.2** |
| promoter · late · beastkin/wolf | -91.6 ± 128.9 | -91.6 ± 128.9 | **+8.5 ± 4.6** | -1.2 ± 2.2 | +1.0 ± 6.5 | +0.2 ± 0.2 |
| promoter · late · demon | -88.6 ± 145.7 | -88.6 ± 145.7 | **+7.9 ± 6.4** | +0.3 ± 1.6 | -0.1 ± 5.2 | **+0.2 ± 0.2** |
| promoter · late · dwarf | -67.5 ± 115.9 | -67.5 ± 115.9 | -3.9 ± 5.6 | -1.0 ± 1.7 | -0.6 ± 6.1 | +0.1 ± 0.2 |
| promoter · late · spirit | -128.3 ± 196.6 | -128.3 ± 196.6 | -2.8 ± 6.1 | -1.4 ± 2.8 | -3.9 ± 9.3 | **+0.3 ± 0.3** |
| promoter · late · angel | -49.1 ± 181.2 | -49.1 ± 181.2 | **-9.0 ± 6.1** | +1.3 ± 1.7 | +2.2 ± 5.6 | +0.1 ± 0.2 |
| promoter · late · angel/lantern | +25.5 ± 86.0 | +25.5 ± 86.0 | +9.1 ± 10.5 | +0.7 ± 2.0 | -2.1 ± 7.5 | **+0.1 ± 0.1** |
| promoter · late · android | -89.9 ± 105.7 | -89.9 ± 105.7 | **-54.8 ± 6.9** | +0.8 ± 2.2 | +1.6 ± 5.1 | +0.2 ± 0.2 |
| security · early4 · elf | +18.0 ± 76.1 | +18.0 ± 76.1 | **-2.4 ± 2.1** | +0.4 ± 1.5 | +0.7 ± 3.3 | +0.0 ± 0.1 |
| security · early4 · beastkin/fox | +62.6 ± 67.1 | +62.6 ± 67.1 | **+6.9 ± 5.2** | +0.3 ± 1.9 | +0.7 ± 2.6 | +0.1 ± 0.1 |
| security · early4 · beastkin/wolf | +59.5 ± 60.0 | +59.5 ± 60.0 | **+4.5 ± 4.3** | +0.3 ± 1.4 | -0.6 ± 2.5 | +0.0 ± 0.1 |
| security · early4 · demon | -4.3 ± 67.6 | -4.3 ± 67.6 | -0.4 ± 2.9 | +1.2 ± 1.9 | -1.9 ± 5.2 | **+0.2 ± 0.1** |
| security · early4 · dwarf | +17.4 ± 51.4 | +17.4 ± 51.4 | **-3.4 ± 3.0** | +0.9 ± 2.0 | -1.1 ± 3.2 | +0.0 ± 0.0 |
| security · early4 · spirit | +60.6 ± 88.6 | +60.6 ± 88.6 | **-3.2 ± 1.8** | +1.3 ± 1.6 | +1.2 ± 2.9 | +0.1 ± 0.1 |
| security · early4 · angel | **+64.4 ± 50.1** | **+64.4 ± 50.1** | **-8.8 ± 4.8** | **+2.1 ± 2.1** | +1.3 ± 3.4 | +0.0 ± 0.1 |
| security · early4 · angel/lantern | +34.9 ± 49.1 | +34.9 ± 49.1 | -0.3 ± 3.6 | +0.8 ± 2.1 | -0.8 ± 3.4 | +0.0 ± 0.1 |
| security · early4 · android | -3.5 ± 84.6 | -3.5 ± 84.6 | **-53.3 ± 3.8** | +1.4 ± 1.6 | +0.9 ± 2.7 | +0.1 ± 0.2 |
| security · mid · elf | +20.8 ± 53.3 | +20.8 ± 53.3 | +3.9 ± 8.0 | -0.7 ± 3.0 | +1.4 ± 5.6 | +0.0 ± 0.1 |
| security · mid · beastkin/fox | -19.7 ± 75.4 | -19.7 ± 75.4 | **+10.4 ± 6.0** | **-4.1 ± 4.0** | -4.9 ± 6.8 | +0.0 ± 0.2 |
| security · mid · beastkin/wolf | -41.0 ± 81.0 | -41.0 ± 81.0 | **+5.9 ± 4.1** | -1.7 ± 4.7 | -2.1 ± 11.4 | +0.0 ± 0.2 |
| security · mid · demon | +15.4 ± 99.3 | +15.4 ± 99.3 | **+9.4 ± 5.9** | -0.2 ± 5.0 | -3.1 ± 11.2 | **+0.2 ± 0.1** |
| security · mid · dwarf | +15.1 ± 49.2 | +15.1 ± 49.2 | -0.3 ± 5.0 | -1.8 ± 4.1 | -1.9 ± 7.4 | +0.1 ± 0.1 |
| security · mid · spirit | -8.1 ± 103.3 | -8.1 ± 103.3 | +3.5 ± 5.6 | -2.2 ± 4.2 | -0.1 ± 7.4 | -0.0 ± 0.1 |
| security · mid · angel | -12.7 ± 78.2 | -12.7 ± 78.2 | **-8.5 ± 8.4** | -1.5 ± 4.5 | +1.6 ± 6.4 | +0.0 ± 0.1 |
| security · mid · angel/lantern | +10.8 ± 75.3 | +10.8 ± 75.3 | **+6.5 ± 4.8** | +0.3 ± 4.4 | -3.2 ± 6.2 | +0.1 ± 0.2 |
| security · mid · android | +15.5 ± 89.7 | +15.5 ± 89.7 | **-47.5 ± 7.1** | -1.7 ± 3.7 | +0.5 ± 5.4 | +0.0 ± 0.2 |
| security · late · elf | +22.3 ± 145.0 | +22.3 ± 145.0 | -2.5 ± 9.1 | +2.3 ± 2.6 | +2.9 ± 4.9 | +0.0 ± 0.1 |
| security · late · beastkin/fox | +124.3 ± 181.8 | +124.3 ± 181.8 | +6.0 ± 9.0 | **+2.6 ± 2.4** | **+5.7 ± 5.2** | +0.0 ± 0.1 |
| security · late · beastkin/wolf | -18.2 ± 174.8 | -18.2 ± 174.8 | -1.6 ± 6.5 | **+2.4 ± 2.3** | +3.4 ± 4.1 | -0.0 ± 0.1 |
| security · late · demon | -67.5 ± 147.4 | -67.5 ± 147.4 | +0.8 ± 9.1 | +1.3 ± 2.6 | +4.5 ± 5.2 | **+0.3 ± 0.2** |
| security · late · dwarf | -108.5 ± 129.7 | -108.5 ± 129.7 | **-9.2 ± 8.6** | -0.2 ± 4.3 | -0.4 ± 4.0 | -0.0 ± 0.1 |
| security · late · spirit | -29.1 ± 128.0 | -29.1 ± 128.0 | **-6.0 ± 4.7** | +0.7 ± 2.3 | +1.9 ± 4.3 | **+0.2 ± 0.1** |
| security · late · angel | +2.1 ± 120.8 | +2.1 ± 120.8 | **-13.9 ± 9.8** | +1.1 ± 1.9 | +3.6 ± 5.6 | +0.0 ± 0.1 |
| security · late · angel/lantern | +41.7 ± 177.4 | +41.7 ± 177.4 | +9.0 ± 12.9 | +1.2 ± 1.6 | +0.9 ± 3.7 | +0.0 ± 0.1 |
| security · late · android | -6.5 ± 172.1 | -6.5 ± 172.1 | **-59.7 ± 8.2** | +2.4 ± 2.5 | **+7.6 ± 4.5** | **+0.1 ± 0.1** |
| bartender · early4 · elf | -87.8 ± 129.6 | -87.8 ± 129.6 | +4.2 ± 4.3 | +0.9 ± 1.1 | **-4.8 ± 4.3** | +0.1 ± 0.1 |
| bartender · early4 · beastkin/fox | +22.2 ± 64.6 | +22.2 ± 64.6 | **+16.4 ± 6.1** | +1.7 ± 1.7 | +2.8 ± 3.4 | -0.1 ± 0.2 |
| bartender · early4 · beastkin/wolf | +25.9 ± 63.7 | +25.9 ± 63.7 | **+13.4 ± 6.4** | +1.7 ± 1.8 | **+4.3 ± 2.6** | -0.0 ± 0.2 |
| bartender · early4 · demon | **-133.9 ± 108.3** | **-133.9 ± 108.3** | -7.0 ± 9.2 | -1.9 ± 2.5 | -4.8 ± 7.2 | **-0.2 ± 0.1** |
| bartender · early4 · dwarf | -56.8 ± 90.5 | -56.8 ± 90.5 | **+7.1 ± 4.2** | +0.6 ± 1.0 | +1.3 ± 3.7 | -0.1 ± 0.2 |
| bartender · early4 · spirit | -50.4 ± 81.2 | -50.4 ± 81.2 | +0.8 ± 5.5 | +0.0 ± 1.7 | -1.3 ± 5.1 | -0.2 ± 0.2 |
| bartender · early4 · angel | -77.2 ± 89.9 | -77.2 ± 89.9 | -1.5 ± 5.0 | +0.9 ± 2.6 | -1.0 ± 6.0 | -0.0 ± 0.2 |
| bartender · early4 · angel/lantern | +10.5 ± 83.7 | +10.5 ± 83.7 | **+5.4 ± 4.1** | +1.2 ± 1.7 | **+3.1 ± 2.8** | -0.0 ± 0.2 |
| bartender · early4 · android | **-107.2 ± 33.9** | **-107.2 ± 33.9** | **-49.8 ± 4.8** | +0.3 ± 2.0 | +0.8 ± 3.0 | -0.1 ± 0.3 |
| bartender · mid · elf | +35.7 ± 79.9 | +35.7 ± 79.9 | -2.7 ± 6.6 | -0.9 ± 1.6 | +1.3 ± 4.8 | +0.1 ± 0.2 |
| bartender · mid · beastkin/fox | -4.9 ± 85.9 | -4.9 ± 85.9 | **+22.2 ± 12.8** | +0.4 ± 2.3 | +4.2 ± 9.1 | +0.1 ± 0.1 |
| bartender · mid · beastkin/wolf | +46.3 ± 68.6 | +46.3 ± 68.6 | **+18.1 ± 11.0** | -0.4 ± 1.4 | +5.6 ± 7.9 | -0.0 ± 0.2 |
| bartender · mid · demon | -24.3 ± 83.6 | -24.3 ± 83.6 | **-30.4 ± 14.1** | +0.8 ± 2.7 | -0.6 ± 8.2 | -0.1 ± 0.1 |
| bartender · mid · dwarf | +23.8 ± 82.1 | +23.8 ± 82.1 | **+13.2 ± 11.1** | +0.0 ± 1.2 | +4.3 ± 7.1 | +0.1 ± 0.1 |
| bartender · mid · spirit | -12.6 ± 82.7 | -12.6 ± 82.7 | -1.6 ± 13.3 | +1.4 ± 3.2 | +5.3 ± 8.2 | -0.1 ± 0.2 |
| bartender · mid · angel | +22.5 ± 87.0 | +22.5 ± 87.0 | -0.4 ± 8.1 | +1.2 ± 2.8 | +3.5 ± 8.9 | -0.1 ± 0.1 |
| bartender · mid · angel/lantern | +6.9 ± 72.5 | +6.9 ± 72.5 | **+12.4 ± 11.0** | -1.2 ± 2.6 | -0.0 ± 5.5 | -0.1 ± 0.1 |
| bartender · mid · android | -21.8 ± 84.9 | -21.8 ± 84.9 | **-43.4 ± 13.4** | +0.3 ± 2.9 | +6.6 ± 8.1 | -0.0 ± 0.2 |
| bartender · late · elf | -5.3 ± 87.9 | -5.3 ± 87.9 | -1.8 ± 12.4 | -0.8 ± 1.5 | -2.0 ± 4.3 | -0.0 ± 0.1 |
| bartender · late · beastkin/fox | -29.3 ± 93.6 | -29.3 ± 93.6 | **+15.2 ± 13.6** | -0.7 ± 2.4 | -1.8 ± 6.0 | +0.0 ± 0.1 |
| bartender · late · beastkin/wolf | -21.7 ± 67.2 | -21.7 ± 67.2 | +12.4 ± 13.9 | -0.1 ± 1.8 | +0.0 ± 6.7 | +0.1 ± 0.1 |
| bartender · late · demon | -40.5 ± 59.2 | -40.5 ± 59.2 | **-34.8 ± 16.9** | -1.4 ± 1.8 | -3.3 ± 7.1 | +0.1 ± 0.1 |
| bartender · late · dwarf | +33.5 ± 112.8 | +33.5 ± 112.8 | **+21.3 ± 12.3** | -0.1 ± 2.1 | -0.1 ± 3.6 | -0.0 ± 0.1 |
| bartender · late · spirit | -43.5 ± 108.2 | -43.5 ± 108.2 | +1.8 ± 11.0 | **-2.2 ± 1.7** | -4.0 ± 5.5 | +0.1 ± 0.2 |
| bartender · late · angel | +10.6 ± 119.6 | +10.6 ± 119.6 | -4.2 ± 16.1 | +1.2 ± 1.4 | +2.5 ± 5.2 | -0.1 ± 0.1 |
| bartender · late · angel/lantern | +14.8 ± 131.1 | +14.8 ± 131.1 | +8.0 ± 18.4 | +0.3 ± 2.0 | -1.9 ± 7.9 | +0.1 ± 0.2 |
| bartender · late · android | -1.6 ± 109.4 | -1.6 ± 109.4 | **-43.6 ± 10.7** | +0.4 ± 2.0 | -1.7 ± 6.3 | +0.1 ± 0.1 |
| host · early4 · elf | +23.0 ± 106.7 | +23.0 ± 106.7 | -2.5 ± 4.0 | +1.6 ± 2.3 | -0.4 ± 6.5 | -0.2 ± 0.2 |
| host · early4 · beastkin/fox | +58.8 ± 107.4 | +58.8 ± 107.4 | **+7.7 ± 4.4** | **+2.0 ± 1.8** | +2.9 ± 6.7 | -0.0 ± 0.2 |
| host · early4 · beastkin/wolf | +42.1 ± 128.4 | +42.1 ± 128.4 | **+8.1 ± 7.5** | **+2.4 ± 1.8** | +2.1 ± 7.7 | -0.1 ± 0.3 |
| host · early4 · demon | +66.4 ± 101.1 | +66.4 ± 101.1 | +7.9 ± 8.0 | +0.8 ± 2.1 | -3.0 ± 6.5 | -0.1 ± 0.2 |
| host · early4 · dwarf | +81.9 ± 146.9 | +81.9 ± 146.9 | **+2.4 ± 2.1** | **+3.6 ± 2.5** | +3.9 ± 7.5 | -0.1 ± 0.2 |
| host · early4 · spirit | +53.0 ± 167.5 | +53.0 ± 167.5 | -1.3 ± 4.8 | +1.9 ± 2.8 | +0.4 ± 5.5 | -0.1 ± 0.2 |
| host · early4 · angel | **+113.3 ± 88.7** | **+113.3 ± 88.7** | **-3.8 ± 2.8** | **+3.2 ± 2.3** | **+4.1 ± 3.6** | -0.1 ± 0.2 |
| host · early4 · angel/lantern | +43.2 ± 116.9 | +43.2 ± 116.9 | -1.2 ± 4.6 | +1.1 ± 1.6 | +0.2 ± 5.2 | **-0.2 ± 0.2** |
| host · early4 · android | **+162.0 ± 131.2** | **+162.0 ± 131.2** | **-80.8 ± 6.3** | **+7.3 ± 2.4** | +6.6 ± 6.9 | -0.1 ± 0.2 |
| host · mid · elf | +2.4 ± 93.8 | +2.4 ± 93.8 | +1.2 ± 5.8 | -1.0 ± 3.0 | -4.0 ± 5.2 | -0.1 ± 0.2 |
| host · mid · beastkin/fox | -40.9 ± 98.2 | -40.9 ± 98.2 | **+11.0 ± 4.5** | -0.6 ± 2.6 | -2.6 ± 7.8 | +0.0 ± 0.2 |
| host · mid · beastkin/wolf | -8.8 ± 135.9 | -8.8 ± 135.9 | **+9.4 ± 5.9** | -2.6 ± 3.2 | -1.6 ± 9.9 | +0.0 ± 0.2 |
| host · mid · demon | -4.3 ± 119.0 | -4.3 ± 119.0 | **+7.6 ± 6.4** | +0.5 ± 2.8 | -2.8 ± 6.9 | -0.1 ± 0.3 |
| host · mid · dwarf | +74.2 ± 121.8 | +74.2 ± 121.8 | **+5.6 ± 5.2** | -0.7 ± 3.6 | +3.1 ± 9.7 | -0.1 ± 0.2 |
| host · mid · spirit | -64.1 ± 118.6 | -64.1 ± 118.6 | -0.2 ± 5.3 | -1.2 ± 2.8 | -3.6 ± 7.3 | -0.0 ± 0.2 |
| host · mid · angel | +53.5 ± 97.5 | +53.5 ± 97.5 | -2.7 ± 5.0 | +1.1 ± 2.8 | -3.8 ± 9.6 | +0.0 ± 0.2 |
| host · mid · angel/lantern | +7.5 ± 141.0 | +7.5 ± 141.0 | **+6.2 ± 5.2** | -0.6 ± 3.8 | -5.3 ± 6.5 | -0.1 ± 0.2 |
| host · mid · android | +30.5 ± 183.1 | +30.5 ± 183.1 | **-84.0 ± 7.7** | **+2.6 ± 2.3** | **+10.9 ± 7.6** | +0.0 ± 0.2 |
| host · late · elf | +11.3 ± 163.1 | +11.3 ± 163.1 | -2.1 ± 6.5 | +1.2 ± 3.3 | -1.7 ± 6.6 | -0.1 ± 0.2 |
| host · late · beastkin/fox | -33.0 ± 142.2 | -33.0 ± 142.2 | **+8.7 ± 6.2** | -0.5 ± 1.6 | **-4.2 ± 3.5** | **+0.1 ± 0.1** |
| host · late · beastkin/wolf | -8.8 ± 123.3 | -8.8 ± 123.3 | **+8.4 ± 6.6** | +0.1 ± 1.3 | -1.3 ± 5.9 | -0.1 ± 0.2 |
| host · late · demon | -107.4 ± 136.9 | -107.4 ± 136.9 | +5.3 ± 12.3 | +0.3 ± 1.6 | -6.3 ± 6.8 | -0.0 ± 0.2 |
| host · late · dwarf | -49.1 ± 110.5 | -49.1 ± 110.5 | **+8.7 ± 6.6** | +0.2 ± 2.4 | -1.2 ± 5.6 | +0.1 ± 0.2 |
| host · late · spirit | **-96.3 ± 94.0** | **-96.3 ± 94.0** | -3.9 ± 7.6 | **-1.6 ± 1.5** | **-4.2 ± 4.0** | -0.0 ± 0.1 |
| host · late · angel | +0.9 ± 79.4 | +0.9 ± 79.4 | -1.7 ± 5.7 | +0.8 ± 2.2 | -0.1 ± 6.1 | +0.0 ± 0.3 |
| host · late · angel/lantern | +15.9 ± 169.9 | +15.9 ± 169.9 | **+6.0 ± 5.1** | +0.7 ± 3.6 | -2.3 ± 4.9 | -0.1 ± 0.1 |
| host · late · android | -19.4 ± 211.6 | -19.4 ± 211.6 | **-88.5 ± 9.0** | **+5.4 ± 3.2** | -6.8 ± 10.6 | +0.1 ± 0.2 |
| attendant · early4 · elf | +90.1 ± 97.5 | +90.1 ± 97.5 | **+19.4 ± 15.3** | -1.9 ± 2.1 | +4.4 ± 5.8 | -0.2 ± 0.2 |
| attendant · early4 · beastkin/fox | **+73.3 ± 60.9** | **+73.3 ± 60.9** | **+16.1 ± 7.9** | -1.4 ± 1.7 | +0.3 ± 3.0 | -0.0 ± 0.1 |
| attendant · early4 · beastkin/wolf | +47.5 ± 55.2 | +47.5 ± 55.2 | **+26.0 ± 12.9** | -1.2 ± 1.9 | +1.9 ± 3.8 | -0.1 ± 0.2 |
| attendant · early4 · demon | +34.9 ± 123.2 | +34.9 ± 123.2 | **+29.1 ± 21.6** | -1.7 ± 2.2 | +2.6 ± 6.3 | +0.0 ± 0.2 |
| attendant · early4 · dwarf | +8.8 ± 47.3 | +8.8 ± 47.3 | +10.8 ± 14.5 | **-2.2 ± 2.0** | -0.7 ± 3.6 | -0.0 ± 0.1 |
| attendant · early4 · spirit | +45.2 ± 54.9 | +45.2 ± 54.9 | **+11.1 ± 6.1** | -1.3 ± 1.4 | +2.2 ± 3.6 | +0.0 ± 0.3 |
| attendant · early4 · angel | +53.5 ± 54.5 | +53.5 ± 54.5 | +5.9 ± 6.6 | -1.6 ± 1.7 | +4.3 ± 4.8 | -0.2 ± 0.2 |
| attendant · early4 · angel/lantern | +76.8 ± 96.3 | +76.8 ± 96.3 | **+16.6 ± 11.6** | -1.1 ± 1.8 | +3.7 ± 5.5 | +0.0 ± 0.3 |
| attendant · early4 · android | -11.2 ± 68.0 | -11.2 ± 68.0 | **-36.6 ± 8.5** | -0.1 ± 1.7 | +3.8 ± 6.3 | -0.1 ± 0.1 |
| attendant · mid · elf | **+51.8 ± 49.8** | **+51.8 ± 49.8** | +16.5 ± 19.2 | -2.3 ± 4.1 | +1.9 ± 5.9 | +0.1 ± 0.2 |
| attendant · mid · beastkin/fox | +68.7 ± 82.9 | +68.7 ± 82.9 | **+26.0 ± 21.7** | +0.8 ± 4.3 | **+10.2 ± 6.3** | -0.1 ± 0.1 |
| attendant · mid · beastkin/wolf | +71.9 ± 89.7 | +71.9 ± 89.7 | **+38.3 ± 25.0** | -1.0 ± 3.8 | +7.4 ± 8.0 | **-0.1 ± 0.1** |
| attendant · mid · demon | **+63.3 ± 52.8** | **+63.3 ± 52.8** | +38.0 ± 50.6 | -2.4 ± 2.9 | +1.0 ± 2.8 | -0.2 ± 0.3 |
| attendant · mid · dwarf | +44.3 ± 63.2 | +44.3 ± 63.2 | +24.0 ± 32.0 | -1.5 ± 4.4 | +1.3 ± 8.0 | +0.0 ± 0.1 |
| attendant · mid · spirit | +75.3 ± 88.3 | +75.3 ± 88.3 | +14.1 ± 19.5 | -0.0 ± 4.8 | **+5.2 ± 4.2** | -0.0 ± 0.1 |
| attendant · mid · angel | +60.9 ± 72.9 | +60.9 ± 72.9 | +10.1 ± 16.9 | +0.5 ± 4.4 | +2.8 ± 4.2 | -0.0 ± 0.2 |
| attendant · mid · angel/lantern | **+117.2 ± 86.1** | **+117.2 ± 86.1** | **+24.5 ± 18.4** | +1.2 ± 2.9 | **+8.7 ± 5.7** | -0.1 ± 0.2 |
| attendant · mid · android | -18.9 ± 63.7 | -18.9 ± 63.7 | -3.5 ± 49.2 | -0.4 ± 2.0 | +1.6 ± 7.7 | +0.1 ± 0.2 |
| attendant · late · elf | -39.7 ± 100.4 | -39.7 ± 100.4 | +15.1 ± 17.6 | +1.2 ± 1.2 | -0.4 ± 6.5 | -0.1 ± 0.1 |
| attendant · late · beastkin/fox | **-127.3 ± 104.2** | **-127.3 ± 104.2** | **+22.2 ± 12.4** | -2.1 ± 2.3 | -3.7 ± 4.7 | +0.0 ± 0.3 |
| attendant · late · beastkin/wolf | **-104.0 ± 94.3** | **-104.0 ± 94.3** | **+19.6 ± 16.1** | -0.6 ± 1.4 | -5.2 ± 7.4 | -0.1 ± 0.3 |
| attendant · late · demon | **-103.6 ± 100.2** | **-103.6 ± 100.2** | +35.6 ± 38.0 | -0.2 ± 2.4 | -3.2 ± 8.5 | -0.0 ± 0.3 |
| attendant · late · dwarf | **-122.2 ± 71.0** | **-122.2 ± 71.0** | **+17.0 ± 16.3** | -0.3 ± 1.8 | +1.1 ± 5.4 | -0.0 ± 0.3 |
| attendant · late · spirit | -83.7 ± 117.8 | -83.7 ± 117.8 | +9.0 ± 9.3 | -0.9 ± 1.9 | +0.1 ± 4.5 | +0.1 ± 0.1 |
| attendant · late · angel | -61.9 ± 150.7 | -61.9 ± 150.7 | **+20.4 ± 19.3** | +0.0 ± 1.9 | +0.0 ± 3.0 | -0.1 ± 0.3 |
| attendant · late · angel/lantern | **-69.2 ± 65.5** | **-69.2 ± 65.5** | +7.4 ± 12.5 | -0.9 ± 0.9 | -4.2 ± 6.1 | -0.0 ± 0.2 |
| attendant · late · android | **-195.2 ± 86.0** | **-195.2 ± 86.0** | -0.5 ± 35.2 | -1.3 ± 2.2 | -4.9 ± 10.6 | +0.1 ± 0.3 |
| madame · early4 · elf | +25.9 ± 140.9 | +25.9 ± 140.9 | -2.7 ± 4.4 | +0.9 ± 2.0 | -1.5 ± 6.0 | +0.0 ± 0.2 |
| madame · early4 · beastkin/fox | -11.6 ± 76.8 | -11.6 ± 76.8 | +2.6 ± 6.4 | -0.3 ± 1.2 | -0.5 ± 3.5 | +0.1 ± 0.1 |
| madame · early4 · beastkin/wolf | -14.3 ± 67.3 | -14.3 ± 67.3 | +3.7 ± 5.5 | +0.3 ± 1.4 | -1.7 ± 3.7 | -0.1 ± 0.1 |
| madame · early4 · demon | -21.1 ± 120.2 | -21.1 ± 120.2 | -2.2 ± 9.4 | +1.6 ± 2.3 | -2.6 ± 4.1 | +0.0 ± 0.1 |
| madame · early4 · dwarf | -6.1 ± 72.5 | -6.1 ± 72.5 | -3.8 ± 5.9 | +0.1 ± 1.4 | **-2.5 ± 1.9** | -0.0 ± 0.1 |
| madame · early4 · spirit | +6.6 ± 124.8 | +6.6 ± 124.8 | **-6.9 ± 6.0** | +0.6 ± 1.2 | -2.8 ± 3.6 | -0.0 ± 0.2 |
| madame · early4 · angel | +0.8 ± 86.9 | +0.8 ± 86.9 | **-7.3 ± 5.4** | -0.2 ± 1.0 | -2.3 ± 2.9 | -0.1 ± 0.2 |
| madame · early4 · angel/lantern | +4.7 ± 111.7 | +4.7 ± 111.7 | -0.1 ± 5.6 | +1.0 ± 1.9 | -2.5 ± 2.7 | -0.1 ± 0.2 |
| madame · early4 · android | +18.7 ± 85.1 | +18.7 ± 85.1 | **-52.5 ± 6.8** | +0.9 ± 1.3 | +2.0 ± 3.5 | -0.1 ± 0.1 |
| madame · mid · elf | -5.2 ± 62.3 | -5.2 ± 62.3 | +2.6 ± 5.3 | +0.5 ± 3.7 | +4.1 ± 10.1 | -0.1 ± 0.2 |
| madame · mid · beastkin/fox | **-127.2 ± 95.4** | **-127.2 ± 95.4** | **+13.3 ± 7.0** | **-4.4 ± 4.0** | -4.1 ± 6.9 | -0.1 ± 0.2 |
| madame · mid · beastkin/wolf | **-125.9 ± 100.0** | **-125.9 ± 100.0** | **+17.1 ± 6.9** | **-5.1 ± 3.6** | -2.4 ± 5.4 | +0.0 ± 0.2 |
| madame · mid · demon | +52.4 ± 98.9 | +52.4 ± 98.9 | -6.2 ± 11.4 | +2.7 ± 3.3 | -3.0 ± 11.0 | -0.1 ± 0.2 |
| madame · mid · dwarf | -55.4 ± 73.7 | -55.4 ± 73.7 | +6.8 ± 9.2 | **-6.6 ± 4.1** | -2.7 ± 7.6 | +0.0 ± 0.2 |
| madame · mid · spirit | +4.0 ± 89.5 | +4.0 ± 89.5 | **+6.2 ± 5.9** | +1.4 ± 2.2 | -1.4 ± 5.9 | +0.0 ± 0.2 |
| madame · mid · angel | -24.7 ± 73.8 | -24.7 ± 73.8 | +2.8 ± 4.1 | -1.5 ± 3.4 | +1.3 ± 7.7 | -0.1 ± 0.2 |
| madame · mid · angel/lantern | -38.5 ± 97.5 | -38.5 ± 97.5 | **+10.8 ± 8.5** | -1.0 ± 2.1 | -1.4 ± 7.8 | **-0.1 ± 0.1** |
| madame · mid · android | +30.4 ± 131.9 | +30.4 ± 131.9 | **-46.4 ± 7.9** | +2.9 ± 3.0 | +6.7 ± 9.7 | +0.0 ± 0.2 |
| madame · late · elf | -75.5 ± 131.0 | -75.5 ± 131.0 | +2.9 ± 10.6 | -0.3 ± 1.6 | +0.1 ± 5.4 | -0.1 ± 0.2 |
| madame · late · beastkin/fox | -76.9 ± 128.1 | -76.9 ± 128.1 | +5.7 ± 7.4 | -1.6 ± 2.6 | -1.7 ± 7.4 | -0.1 ± 0.3 |
| madame · late · beastkin/wolf | -106.1 ± 149.8 | -106.1 ± 149.8 | +6.9 ± 9.8 | -1.6 ± 3.4 | -2.8 ± 7.5 | **-0.2 ± 0.2** |
| madame · late · demon | +71.5 ± 90.9 | +71.5 ± 90.9 | **-28.6 ± 15.9** | **-3.2 ± 1.8** | **-6.7 ± 5.4** | -0.1 ± 0.2 |
| madame · late · dwarf | -12.8 ± 49.8 | -12.8 ± 49.8 | -3.0 ± 7.2 | +0.1 ± 2.4 | -1.9 ± 6.1 | -0.2 ± 0.2 |
| madame · late · spirit | -26.4 ± 91.2 | -26.4 ± 91.2 | -2.6 ± 14.2 | -0.9 ± 1.2 | -0.8 ± 5.2 | -0.2 ± 0.2 |
| madame · late · angel | -51.3 ± 121.9 | -51.3 ± 121.9 | +0.5 ± 12.9 | -0.2 ± 2.2 | +1.0 ± 5.2 | **-0.3 ± 0.2** |
| madame · late · angel/lantern | -59.5 ± 126.3 | -59.5 ± 126.3 | +1.8 ± 9.5 | -0.6 ± 1.9 | -2.5 ± 5.2 | **-0.2 ± 0.2** |
| madame · late · android | **-103.7 ± 99.7** | **-103.7 ± 99.7** | **-56.8 ± 7.7** | -0.8 ± 2.3 | -3.4 ± 7.0 | -0.1 ± 0.2 |
| chapel · early4 · elf | +40.1 ± 63.6 | +40.1 ± 63.6 | +0.6 ± 2.4 | +0.4 ± 0.6 | +2.5 ± 3.6 | +0.0 ± 0.1 |
| chapel · early4 · beastkin/fox | +31.1 ± 60.0 | +31.1 ± 60.0 | **+9.9 ± 6.5** | -0.1 ± 2.4 | +2.0 ± 2.4 | -0.0 ± 0.1 |
| chapel · early4 · beastkin/wolf | +32.3 ± 64.6 | +32.3 ± 64.6 | **+4.3 ± 3.9** | +0.3 ± 1.9 | +1.0 ± 2.5 | -0.1 ± 0.2 |
| chapel · early4 · demon | -41.2 ± 67.3 | -41.2 ± 67.3 | -1.6 ± 2.8 | **+2.0 ± 1.6** | +2.1 ± 2.9 | +0.1 ± 0.1 |
| chapel · early4 · dwarf | +37.9 ± 45.5 | +37.9 ± 45.5 | -4.3 ± 5.6 | +0.0 ± 1.7 | **+3.6 ± 2.7** | +0.0 ± 0.1 |
| chapel · early4 · spirit | +53.2 ± 63.3 | +53.2 ± 63.3 | -0.2 ± 3.0 | +0.3 ± 1.8 | **+4.0 ± 3.5** | +0.0 ± 0.1 |
| chapel · early4 · angel | **+70.0 ± 59.3** | **+70.0 ± 59.3** | +1.2 ± 6.6 | -0.9 ± 1.7 | **+3.5 ± 3.3** | **-0.1 ± 0.1** |
| chapel · early4 · angel/lantern | **+116.5 ± 47.9** | **+116.5 ± 47.9** | **+11.3 ± 3.7** | -0.5 ± 2.6 | **+3.9 ± 3.2** | -0.0 ± 0.2 |
| chapel · early4 · android | -22.9 ± 56.1 | -22.9 ± 56.1 | **-44.9 ± 4.2** | +0.3 ± 2.0 | **+2.8 ± 2.8** | +0.1 ± 0.2 |
| chapel · mid · elf | -36.3 ± 72.6 | -36.3 ± 72.6 | -1.2 ± 5.4 | +0.8 ± 1.9 | -0.6 ± 6.0 | +0.0 ± 0.2 |
| chapel · mid · beastkin/fox | -67.4 ± 90.4 | -67.4 ± 90.4 | -3.8 ± 7.0 | +1.2 ± 3.4 | -0.2 ± 4.3 | +0.0 ± 0.1 |
| chapel · mid · beastkin/wolf | -46.0 ± 82.8 | -46.0 ± 82.8 | +0.5 ± 5.7 | -0.7 ± 3.0 | **-4.6 ± 4.2** | +0.0 ± 0.2 |
| chapel · mid · demon | -51.0 ± 114.3 | -51.0 ± 114.3 | -4.5 ± 7.2 | +2.7 ± 4.3 | -4.2 ± 4.6 | **-0.2 ± 0.2** |
| chapel · mid · dwarf | **-54.1 ± 51.2** | **-54.1 ± 51.2** | -2.0 ± 6.1 | -0.1 ± 1.9 | +0.7 ± 4.0 | -0.1 ± 0.2 |
| chapel · mid · spirit | **-76.2 ± 43.3** | **-76.2 ± 43.3** | -3.3 ± 5.3 | +0.4 ± 2.0 | -2.6 ± 6.1 | +0.0 ± 0.2 |
| chapel · mid · angel | -68.2 ± 94.7 | -68.2 ± 94.7 | -4.2 ± 8.7 | -1.0 ± 3.8 | +3.4 ± 5.5 | +0.1 ± 0.2 |
| chapel · mid · angel/lantern | -42.1 ± 83.1 | -42.1 ± 83.1 | **+10.8 ± 4.0** | -0.8 ± 4.9 | -0.3 ± 4.1 | +0.0 ± 0.2 |
| chapel · mid · android | -45.7 ± 83.5 | -45.7 ± 83.5 | **-47.8 ± 5.1** | +1.2 ± 3.7 | +0.5 ± 4.1 | +0.0 ± 0.2 |
| chapel · late · elf | +37.2 ± 234.3 | +37.2 ± 234.3 | **-3.2 ± 2.8** | +3.4 ± 5.0 | +2.8 ± 8.0 | -0.0 ± 0.3 |
| chapel · late · beastkin/fox | -17.5 ± 183.9 | -17.5 ± 183.9 | **+6.7 ± 4.9** | +1.0 ± 4.6 | +3.2 ± 5.9 | +0.0 ± 0.2 |
| chapel · late · beastkin/wolf | +101.6 ± 255.7 | +101.6 ± 255.7 | **+9.0 ± 5.9** | +2.5 ± 5.0 | +1.5 ± 4.3 | +0.0 ± 0.1 |
| chapel · late · demon | +68.9 ± 207.5 | +68.9 ± 207.5 | **-13.8 ± 10.3** | +4.0 ± 5.3 | +6.7 ± 8.0 | +0.1 ± 0.3 |
| chapel · late · dwarf | +21.6 ± 119.6 | +21.6 ± 119.6 | +1.8 ± 8.1 | +1.3 ± 3.4 | +3.7 ± 5.1 | +0.1 ± 0.2 |
| chapel · late · spirit | +6.6 ± 90.9 | +6.6 ± 90.9 | +0.4 ± 1.9 | +0.7 ± 1.3 | +1.4 ± 4.4 | -0.1 ± 0.1 |
| chapel · late · angel | +53.8 ± 188.3 | +53.8 ± 188.3 | **+19.7 ± 5.5** | +0.7 ± 4.1 | +5.0 ± 5.2 | +0.1 ± 0.2 |
| chapel · late · angel/lantern | +51.8 ± 105.2 | +51.8 ± 105.2 | **+35.1 ± 6.7** | -1.2 ± 2.5 | +0.0 ± 4.3 | +0.1 ± 0.2 |
| chapel · late · android | -57.3 ± 149.1 | -57.3 ± 149.1 | **-48.8 ± 10.5** | +0.8 ± 2.8 | +3.4 ± 5.4 | -0.0 ± 0.2 |

---

### race-roles-houses

Specialized house-role synergies by race (Tankard bartender/dancer, Onsen bath, Castle host/attendant/madame, Sanctuary chapel, Lantern classroom teacher).

scenario **mid** · 10 seeds from 1 · 282s · 2026-11-20T18:06

| variant | n | houseNet | total | net | testedNet | testedRest | sat | repGain | prestige | skillGain | statGain |
|---|---|---|---|---|---|---|---|---|---|---|---|
| tankard-mid · bartender · base | 10 | 597 | 601 | 601 | 27 | 1.7 | 60 | -3.9 | 11 | 2.7 | 1.3 |
| tankard-mid · bartender · elf | 10 | 487 | 491 | 491 | 24 | 1.7 | 59 | -5.7 | 10 | 2.5 | 1.2 |
| tankard-mid · bartender · beastkin/fox | 10 | 603 | 608 | 608 | 34 | 0.8 | 59 | -3.2 | 9.3 | 2.5 | 1.1 |
| tankard-mid · bartender · beastkin/cat | 10 | 559 | 563 | 563 | 32 | 0.0 | 60 | -1.7 | 11 | 2.4 | 1.2 |
| tankard-mid · bartender · beastkin/rabbit | 10 | 434 | 439 | 439 | 25 | 0.8 | 58 | -4.0 | 11 | 2.5 | 1.1 |
| tankard-mid · bartender · beastkin/dragon | 10 | 350 | 355 | 355 | 16 | 0.0 | 54 | -6.4 | 10 | 2.5 | 1.2 |
| tankard-mid · bartender · demon | 10 | 456 | 461 | 461 | 2.6 | 43 | 59 | -3.3 | 10 | 2.1 | 1.1 |
| tankard-mid · bartender · dwarf | 10 | 578 | 582 | 582 | 31 | 0.0 | 62 | 0.4 | 11 | 2.5 | 1.2 |
| tankard-mid · bartender · spirit | 10 | 515 | 520 | 520 | 22 | 7.5 | 59 | -1.5 | 11 | 2.4 | 1.1 |
| tankard-mid · bartender · angel | 10 | 621 | 625 | 625 | 25 | 0.8 | 61 | 2.3 | 11 | 2.6 | 1.3 |
| tankard-mid · bartender · angel/lantern | 10 | 506 | 510 | 510 | 24 | 2.5 | 58 | -1.5 | 9.8 | 2.5 | 1.1 |
| tankard-mid · bartender · android | 10 | 443 | 447 | 447 | -31 | 0.0 | 58 | -2.5 | 11 | 2.6 | 1.2 |
| tankard-mid · dancer · base | 10 | 619 | 620 | 620 | 33 | 12 | 60 | 2.3 | 12 | 2.6 | 1.4 |
| tankard-mid · dancer · elf | 10 | 597 | 598 | 598 | 34 | 11 | 58 | 0.9 | 11 | 2.5 | 1.3 |
| tankard-mid · dancer · beastkin/fox | 10 | 665 | 666 | 666 | 44 | 4.2 | 61 | -0.8 | 13 | 2.4 | 1.5 |
| tankard-mid · dancer · beastkin/cat | 10 | 664 | 665 | 665 | 45 | 5.0 | 61 | -1.3 | 13 | 2.4 | 1.3 |
| tankard-mid · dancer · beastkin/rabbit | 10 | 575 | 576 | 576 | 44 | 5.0 | 58 | -3.1 | 12 | 2.5 | 1.3 |
| tankard-mid · dancer · beastkin/dragon | 10 | 627 | 628 | 628 | 33 | 5.8 | 58 | -2.1 | 11 | 2.4 | 1.5 |
| tankard-mid · dancer · demon | 10 | 505 | 506 | 506 | 20 | 34 | 55 | -1.9 | 10 | 2.4 | 1.2 |
| tankard-mid · dancer · dwarf | 10 | 587 | 588 | 588 | 35 | 0.8 | 59 | -0.3 | 13 | 2.5 | 1.5 |
| tankard-mid · dancer · spirit | 10 | 518 | 522 | 522 | 30 | 14 | 58 | -3.5 | 13 | 2.5 | 1.3 |
| tankard-mid · dancer · angel | 10 | 619 | 623 | 623 | 30 | 9.2 | 60 | 1.2 | 13 | 2.5 | 1.4 |
| tankard-mid · dancer · angel/lantern | 10 | 655 | 659 | 659 | 35 | 12 | 60 | -1.9 | 12 | 2.3 | 1.4 |
| tankard-mid · dancer · android | 10 | 526 | 530 | 530 | -25 | 0.0 | 59 | -0.9 | 12 | 2.5 | 1.6 |
| onsen-mid · bath · base | 10 | 448 | 451 | 451 | 62 | 23 | 59 | -5.1 | 38 | 2.6 | 1.1 |
| onsen-mid · bath · elf | 10 | 513 | 516 | 516 | 58 | 26 | 62 | -5.4 | 39 | 2.5 | 1.1 |
| onsen-mid · bath · beastkin/fox | 10 | 478 | 481 | 481 | 79 | 21 | 60 | -4.1 | 39 | 2.5 | 1.1 |
| onsen-mid · bath · beastkin/cat | 10 | 547 | 550 | 550 | 85 | 18 | 62 | 2.1 | 39 | 2.5 | 1.3 |
| onsen-mid · bath · beastkin/rabbit | 10 | 485 | 488 | 488 | 80 | 23 | 59 | -3.5 | 38 | 2.5 | 1.1 |
| onsen-mid · bath · beastkin/dragon | 10 | 551 | 554 | 554 | 80 | 17 | 61 | -0.2 | 38 | 2.6 | 1.2 |
| onsen-mid · bath · demon | 10 | 386 | 389 | 389 | 85 | 29 | 57 | -3.4 | 38 | 2.5 | 1.0 |
| onsen-mid · bath · dwarf | 10 | 458 | 461 | 461 | 73 | 10 | 59 | -3.8 | 39 | 2.7 | 1.1 |
| onsen-mid · bath · spirit | 10 | 453 | 457 | 457 | 39 | 34 | 60 | -1.7 | 40 | 2.5 | 1.1 |
| onsen-mid · bath · angel | 10 | 489 | 492 | 492 | 61 | 25 | 62 | -1.3 | 39 | 2.5 | 1.2 |
| onsen-mid · bath · angel/lantern | 10 | 483 | 486 | 486 | 65 | 22 | 60 | -0.4 | 37 | 2.6 | 1.1 |
| onsen-mid · bath · android | 10 | 402 | 406 | 406 | 42 | 0.0 | 62 | -0.1 | 39 | 2.8 | 1.2 |
| castle-mid · host · base | 10 | 4,257 | 4,269 | 4,269 | 8.2 | 29 | 82 | 15 | 86 | 3.9 | 3.0 |
| castle-mid · host · elf | 10 | 3,472 | 3,484 | 3,484 | -0.3 | 26 | 78 | 14 | 83 | 3.9 | 2.6 |
| castle-mid · host · beastkin/fox | 10 | 3,393 | 3,419 | 3,419 | 9.5 | 18 | 79 | 18 | 86 | 3.6 | 2.5 |
| castle-mid · host · beastkin/cat | 10 | 3,729 | 3,755 | 3,755 | 13 | 17 | 83 | 22 | 85 | 3.7 | 2.8 |
| castle-mid · host · beastkin/rabbit | 10 | 3,842 | 3,867 | 3,867 | 20 | 18 | 81 | 20 | 84 | 3.6 | 2.8 |
| castle-mid · host · beastkin/dragon | 10 | 3,342 | 3,367 | 3,367 | 2.3 | 19 | 80 | 20 | 86 | 3.7 | 2.6 |
| castle-mid · host · demon | 10 | 4,297 | 4,309 | 4,309 | 6.9 | 47 | 80 | 18 | 84 | 3.9 | 2.7 |
| castle-mid · host · dwarf | 10 | 4,546 | 4,558 | 4,558 | 23 | 11 | 84 | 23 | 85 | 4.1 | 3.2 |
| castle-mid · host · spirit | 10 | 3,058 | 3,070 | 3,070 | -1.7 | 23 | 77 | 15 | 86 | 4.0 | 3.1 |
| castle-mid · host · angel | 10 | 3,130 | 3,155 | 3,155 | -6.2 | 28 | 77 | 12 | 82 | 3.6 | 2.6 |
| castle-mid · host · angel/lantern | 10 | 3,674 | 3,686 | 3,686 | 6.4 | 26 | 83 | 16 | 86 | 3.6 | 2.7 |
| castle-mid · host · android | 10 | 4,656 | 4,668 | 4,668 | -75 | 0.0 | 84 | 26 | 85 | 4.0 | 2.9 |
| castle-late · host · base | 9 (+1 unreached) | 10,076 | 10,092 | 10,092 | 1.7 | 21 | 70 | 8.9 | 97 | 2.4 | 1.3 |
| castle-late · host · elf | 9 (+1 unreached) | 10,032 | 10,048 | 10,048 | 1.7 | 23 | 70 | 8.5 | 96 | 2.4 | 1.2 |
| castle-late · host · beastkin/fox | 9 (+1 unreached) | 10,026 | 10,044 | 10,044 | 26 | 17 | 70 | 9.1 | 97 | 2.4 | 1.3 |
| castle-late · host · beastkin/cat | 9 (+1 unreached) | 9,805 | 9,823 | 9,823 | 25 | 9.7 | 70 | 10 | 97 | 2.4 | 1.3 |
| castle-late · host · beastkin/rabbit | 9 (+1 unreached) | 10,383 | 10,400 | 10,400 | 25 | 18 | 70 | 8.3 | 97 | 2.4 | 1.2 |
| castle-late · host · beastkin/dragon | 9 (+1 unreached) | 10,495 | 10,511 | 10,511 | -1.1 | 16 | 70 | 9.5 | 97 | 2.5 | 1.2 |
| castle-late · host · demon | 9 (+1 unreached) | 10,088 | 10,104 | 10,104 | 3.6 | 44 | 71 | 9.3 | 97 | 2.4 | 1.2 |
| castle-late · host · dwarf | 9 (+1 unreached) | 10,426 | 10,443 | 10,443 | 16 | 3.8 | 72 | 9.9 | 98 | 2.3 | 1.2 |
| castle-late · host · spirit | 9 (+1 unreached) | 9,770 | 9,786 | 9,786 | 1.6 | 22 | 67 | 8.4 | 96 | 2.5 | 1.3 |
| castle-late · host · angel | 9 (+1 unreached) | 10,473 | 10,490 | 10,490 | -3.2 | 25 | 69 | 7.4 | 95 | 2.4 | 1.2 |
| castle-late · host · angel/lantern | 9 (+1 unreached) | 10,340 | 10,358 | 10,358 | 6.8 | 22 | 69 | 6.4 | 96 | 2.4 | 1.2 |
| castle-late · host · android | 9 (+1 unreached) | 10,446 | 10,462 | 10,462 | -78 | 0.0 | 74 | 8.7 | 97 | 2.4 | 1.2 |
| castle-mid · attendant · base | 10 | 2,974 | 2,999 | 2,999 | 50 | 9.2 | 73 | 4.6 | 90 | 4.1 | 2.9 |
| castle-mid · attendant · elf | 10 | 3,561 | 3,587 | 3,587 | 66 | 6.7 | 76 | 13 | 88 | 3.8 | 3.0 |
| castle-mid · attendant · beastkin/fox | 10 | 2,715 | 2,741 | 2,741 | 81 | 15 | 70 | 0.3 | 87 | 3.2 | 2.3 |
| castle-mid · attendant · beastkin/cat | 10 | 2,838 | 2,863 | 2,863 | 53 | 12 | 72 | -0.5 | 87 | 2.9 | 2.3 |
| castle-mid · attendant · beastkin/rabbit | 10 | 3,105 | 3,130 | 3,130 | 81 | 5.8 | 74 | 8.9 | 89 | 3.6 | 2.5 |
| castle-mid · attendant · beastkin/dragon | 10 | 2,696 | 2,721 | 2,721 | 64 | 3.3 | 70 | 9.7 | 86 | 3.5 | 2.6 |
| castle-mid · attendant · demon | 10 | 3,259 | 3,284 | 3,284 | 112 | 24 | 74 | 15 | 89 | 3.8 | 3.1 |
| castle-mid · attendant · dwarf | 10 | 3,086 | 3,111 | 3,111 | 64 | 4.2 | 73 | 13 | 88 | 3.9 | 2.9 |
| castle-mid · attendant · spirit | 10 | 3,400 | 3,412 | 3,412 | 73 | 7.5 | 71 | 13 | 90 | 4.2 | 3.1 |
| castle-mid · attendant · angel | 10 | 3,240 | 3,252 | 3,252 | 89 | 7.5 | 72 | 11 | 89 | 3.9 | 2.9 |
| castle-mid · attendant · angel/lantern | 10 | 2,575 | 2,601 | 2,601 | 88 | 17 | 72 | 2.1 | 86 | 3.6 | 2.7 |
| castle-mid · attendant · android | 10 | 3,046 | 3,071 | 3,071 | 34 | 8.3 | 71 | 7.7 | 87 | 3.9 | 2.7 |
| castle-mid · madame · base | 10 | 3,222 | 3,506 | 3,248 | 12 | 2.5 | 77 | 18 | 85 | 4.5 | 3.3 |
| castle-mid · madame · elf | 10 | 2,995 | 3,290 | 3,020 | 28 | 3.3 | 76 | 18 | 85 | 4.0 | 2.6 |
| castle-mid · madame · beastkin/fox | 10 | 2,996 | 3,333 | 3,022 | 22 | 0.8 | 76 | 23 | 85 | 4.2 | 2.9 |
| castle-mid · madame · beastkin/cat | 10 | 2,627 | 2,959 | 2,653 | 29 | 1.7 | 73 | 17 | 83 | 4.2 | 2.8 |
| castle-mid · madame · beastkin/rabbit | 10 | 2,427 | 2,762 | 2,452 | 56 | 0.0 | 70 | 14 | 83 | 3.8 | 2.3 |
| castle-mid · madame · beastkin/dragon | 10 | 2,280 | 2,577 | 2,306 | -4.3 | 1.7 | 70 | 17 | 84 | 4.0 | 2.8 |
| castle-mid · madame · demon | 10 | 2,521 | 2,737 | 2,546 | 21 | 32 | 73 | 14 | 85 | 4.0 | 2.9 |
| castle-mid · madame · dwarf | 10 | 2,669 | 2,994 | 2,694 | 15 | 0.0 | 73 | 18 | 85 | 4.4 | 3.2 |
| castle-mid · madame · spirit | 10 | 2,353 | 2,659 | 2,378 | 36 | 2.5 | 71 | 13 | 85 | 4.0 | 2.6 |
| castle-mid · madame · angel | 10 | 2,588 | 2,906 | 2,600 | 38 | 2.5 | 70 | 15 | 86 | 4.3 | 2.7 |
| castle-mid · madame · angel/lantern | 10 | 2,493 | 2,801 | 2,518 | 44 | 2.5 | 73 | 17 | 84 | 4.2 | 2.9 |
| castle-mid · madame · android | 10 | 2,939 | 3,262 | 2,965 | -6.4 | 0.0 | 73 | 19 | 85 | 4.7 | 3.2 |
| sanctuary-mid · chapel · base | 10 | 2,787 | 2,787 | 2,787 | 4.4 | 0.0 | 81 | 16 | 79 | 2.6 | 1.5 |
| sanctuary-mid · chapel · elf | 10 | 2,659 | 2,659 | 2,659 | 1.4 | 0.0 | 81 | 12 | 79 | 2.5 | 1.5 |
| sanctuary-mid · chapel · beastkin/fox | 10 | 2,458 | 2,458 | 2,458 | 2.6 | 0.0 | 78 | 6.0 | 81 | 2.6 | 1.4 |
| sanctuary-mid · chapel · beastkin/cat | 10 | 2,420 | 2,421 | 2,421 | 2.4 | 0.0 | 79 | 7.4 | 81 | 2.7 | 1.3 |
| sanctuary-mid · chapel · beastkin/rabbit | 10 | 2,421 | 2,421 | 2,421 | 4.4 | 0.0 | 78 | 8.2 | 82 | 2.5 | 1.4 |
| sanctuary-mid · chapel · beastkin/dragon | 10 | 2,448 | 2,448 | 2,448 | -5.1 | 0.0 | 79 | 6.4 | 80 | 2.6 | 1.4 |
| sanctuary-mid · chapel · demon | 10 | 2,266 | 2,266 | 2,266 | -15 | 28 | 77 | 3.2 | 79 | 2.2 | 1.3 |
| sanctuary-mid · chapel · dwarf | 10 | 2,303 | 2,304 | 2,304 | -6.0 | 0.0 | 76 | -0.5 | 80 | 2.4 | 1.3 |
| sanctuary-mid · chapel · spirit | 10 | 2,858 | 2,858 | 2,858 | 0.3 | 0.0 | 82 | 18 | 79 | 2.4 | 1.7 |
| sanctuary-mid · chapel · angel | 10 | 2,585 | 2,585 | 2,585 | 23 | 0.0 | 78 | 13 | 85 | 2.5 | 1.4 |
| sanctuary-mid · chapel · angel/lantern | 10 | 2,838 | 2,839 | 2,839 | 45 | 0.0 | 80 | 15 | 83 | 2.5 | 1.4 |
| sanctuary-mid · chapel · android | 10 | 2,691 | 2,691 | 2,691 | -48 | 0.0 | 80 | 15 | 79 | 2.3 | 1.5 |
| sanctuary-late · chapel · base | 10 | 4,648 | 4,654 | 4,654 | 9.6 | 0.0 | 75 | 8.3 | 80 | 2.1 | 1.7 |
| sanctuary-late · chapel · elf | 10 | 4,503 | 4,510 | 4,510 | 16 | 0.0 | 75 | 9.3 | 81 | 2.1 | 1.6 |
| sanctuary-late · chapel · beastkin/fox | 10 | 4,463 | 4,468 | 4,468 | 19 | 0.0 | 75 | 8.5 | 82 | 2.1 | 1.7 |
| sanctuary-late · chapel · beastkin/cat | 10 | 4,380 | 4,385 | 4,385 | 15 | 0.0 | 75 | 8.5 | 80 | 2.2 | 1.6 |
| sanctuary-late · chapel · beastkin/rabbit | 10 | 4,509 | 4,515 | 4,515 | 25 | 0.0 | 76 | 9.2 | 81 | 2.1 | 1.6 |
| sanctuary-late · chapel · beastkin/dragon | 10 | 4,503 | 4,508 | 4,508 | 7.3 | 0.0 | 76 | 9.5 | 81 | 2.2 | 1.6 |
| sanctuary-late · chapel · demon | 10 | 4,442 | 4,448 | 4,448 | -17 | 28 | 75 | 11 | 82 | 1.9 | 1.5 |
| sanctuary-late · chapel · dwarf | 10 | 4,815 | 4,822 | 4,822 | 4.9 | 0.0 | 75 | 10 | 80 | 2.0 | 1.5 |
| sanctuary-late · chapel · spirit | 10 | 4,927 | 4,933 | 4,933 | 20 | 0.0 | 76 | 11 | 80 | 2.1 | 1.6 |
| sanctuary-late · chapel · angel | 10 | 4,663 | 4,669 | 4,669 | 55 | 0.0 | 73 | 10 | 84 | 1.8 | 1.2 |
| sanctuary-late · chapel · angel/lantern | 10 | 4,506 | 4,512 | 4,512 | 67 | 0.0 | 74 | 12 | 85 | 2.3 | 1.6 |
| sanctuary-late · chapel · android | 10 | 4,397 | 4,402 | 4,402 | -36 | 0.0 | 75 | 7.0 | 80 | 2.2 | 1.8 |
| lantern-mid · teacher · base | 10 | 258 | 258 | 258 | -24 | 1.3 | 65 | 2.3 | 50 | 19 | 5.6 |
| lantern-mid · teacher · elf | 10 | 281 | 281 | 281 | -22 | 1.9 | 67 | -1.0 | 53 | 17 | 5.3 |
| lantern-mid · teacher · beastkin/fox | 10 | 277 | 277 | 277 | -17 | 0.0 | 67 | 0.9 | 52 | 17 | 5.3 |
| lantern-mid · teacher · beastkin/cat | 10 | 279 | 279 | 279 | -18 | 0.0 | 67 | 2.1 | 52 | 17 | 5.3 |
| lantern-mid · teacher · beastkin/rabbit | 10 | 278 | 278 | 278 | -15 | 0.8 | 66 | 2.2 | 49 | 17 | 5.2 |
| lantern-mid · teacher · beastkin/dragon | 10 | 257 | 257 | 257 | -24 | 0.6 | 66 | -0.3 | 50 | 17 | 5.2 |
| lantern-mid · teacher · demon | 10 | 264 | 264 | 264 | -15 | 40 | 66 | -2.1 | 49 | 13 | 4.0 |
| lantern-mid · teacher · dwarf | 10 | 212 | 212 | 212 | -27 | 0.0 | 66 | -5.4 | 51 | 17 | 5.0 |
| lantern-mid · teacher · spirit | 10 | 251 | 251 | 251 | -25 | 5.3 | 66 | -3.1 | 51 | 16 | 5.2 |
| lantern-mid · teacher · angel | 10 | 227 | 227 | 227 | -34 | 0.0 | 66 | -4.2 | 49 | 17 | 5.1 |
| lantern-mid · teacher · angel/lantern | 10 | 259 | 259 | 259 | -19 | 3.8 | 67 | 2.5 | 49 | 16 | 4.9 |
| lantern-mid · teacher · android | 10 | 195 | 195 | 195 | -77 | 0.0 | 67 | 4.0 | 52 | 19 | 5.1 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ houseNet | Δ net | Δ testedNet | Δ sat | Δ repGain | Δ skillGain |
|---|---|---|---|---|---|---|
| tankard-mid · bartender · elf | -110.1 ± 226.9 | -110.1 ± 226.9 | -2.6 ± 7.6 | -1.8 ± 5.6 | -1.8 ± 7.3 | -0.2 ± 0.2 |
| tankard-mid · bartender · beastkin/fox | +6.2 ± 82.2 | +6.2 ± 82.2 | **+7.3 ± 4.2** | -1.4 ± 2.7 | +0.7 ± 2.4 | -0.2 ± 0.2 |
| tankard-mid · bartender · beastkin/cat | -37.9 ± 79.4 | -37.9 ± 79.4 | **+5.7 ± 4.3** | -0.4 ± 3.3 | +2.2 ± 2.6 | **-0.2 ± 0.2** |
| tankard-mid · bartender · beastkin/rabbit | -162.8 ± 238.0 | -162.8 ± 238.0 | -1.3 ± 10.1 | -2.9 ± 6.2 | -0.1 ± 7.6 | -0.2 ± 0.2 |
| tankard-mid · bartender · beastkin/dragon | -246.8 ± 256.9 | -246.8 ± 256.9 | **-10.9 ± 10.3** | -5.9 ± 6.3 | -2.5 ± 8.3 | **-0.2 ± 0.2** |
| tankard-mid · bartender · demon | **-140.8 ± 128.8** | **-140.8 ± 128.8** | **-24.2 ± 6.8** | -1.6 ± 6.4 | +0.6 ± 5.5 | **-0.6 ± 0.2** |
| tankard-mid · bartender · dwarf | -19.4 ± 93.8 | -19.4 ± 93.8 | **+4.6 ± 2.9** | +1.4 ± 2.8 | **+4.3 ± 2.4** | **-0.2 ± 0.2** |
| tankard-mid · bartender · spirit | -81.9 ± 111.8 | -81.9 ± 111.8 | **-5.0 ± 4.0** | -0.9 ± 4.2 | +2.4 ± 4.3 | **-0.3 ± 0.2** |
| tankard-mid · bartender · angel | +23.5 ± 61.3 | +23.5 ± 61.3 | -1.4 ± 3.5 | +1.1 ± 2.5 | **+6.2 ± 2.8** | -0.1 ± 0.2 |
| tankard-mid · bartender · angel/lantern | -91.6 ± 149.9 | -91.6 ± 149.9 | -2.4 ± 4.2 | -2.7 ± 5.8 | +2.5 ± 6.4 | **-0.2 ± 0.2** |
| tankard-mid · bartender · android | **-154.3 ± 154.3** | **-154.3 ± 154.3** | **-57.5 ± 5.6** | -1.9 ± 4.1 | +1.4 ± 4.9 | -0.1 ± 0.2 |
| tankard-mid · dancer · elf | -21.5 ± 99.6 | -21.5 ± 99.6 | +0.2 ± 5.8 | -2.3 ± 3.3 | -1.4 ± 5.8 | -0.1 ± 0.2 |
| tankard-mid · dancer · beastkin/fox | +46.5 ± 101.4 | +46.5 ± 101.4 | **+11.1 ± 5.8** | +0.9 ± 3.5 | -3.1 ± 4.2 | **-0.2 ± 0.2** |
| tankard-mid · dancer · beastkin/cat | +44.9 ± 106.1 | +44.9 ± 106.1 | **+12.1 ± 6.9** | +0.5 ± 3.3 | -3.6 ± 4.5 | **-0.2 ± 0.1** |
| tankard-mid · dancer · beastkin/rabbit | -43.4 ± 91.2 | -43.4 ± 91.2 | **+10.6 ± 5.7** | -1.6 ± 2.7 | **-5.5 ± 4.3** | -0.1 ± 0.2 |
| tankard-mid · dancer · beastkin/dragon | +7.9 ± 131.9 | +7.9 ± 131.9 | -0.4 ± 7.4 | -1.5 ± 4.9 | **-4.5 ± 3.0** | -0.2 ± 0.2 |
| tankard-mid · dancer · demon | **-113.8 ± 110.4** | **-113.8 ± 110.4** | **-13.5 ± 12.9** | **-4.6 ± 4.4** | -4.3 ± 5.9 | **-0.2 ± 0.2** |
| tankard-mid · dancer · dwarf | -31.7 ± 71.7 | -31.7 ± 71.7 | +1.9 ± 11.2 | -0.9 ± 1.9 | -2.6 ± 3.1 | -0.0 ± 0.1 |
| tankard-mid · dancer · spirit | -100.9 ± 111.3 | -97.8 ± 112.5 | -3.6 ± 5.9 | -2.2 ± 4.0 | **-5.8 ± 3.8** | -0.0 ± 0.2 |
| tankard-mid · dancer · angel | +0.5 ± 104.0 | +3.6 ± 102.4 | -3.5 ± 6.4 | +0.3 ± 4.6 | -1.1 ± 5.3 | -0.0 ± 0.2 |
| tankard-mid · dancer · angel/lantern | +36.5 ± 137.0 | +39.5 ± 136.0 | +1.2 ± 9.9 | +0.4 ± 4.8 | -4.2 ± 5.1 | **-0.3 ± 0.1** |
| tankard-mid · dancer · android | -93.0 ± 118.4 | -89.9 ± 120.9 | **-58.6 ± 5.1** | -1.0 ± 4.4 | -3.2 ± 4.5 | -0.0 ± 0.2 |
| onsen-mid · bath · elf | +65.2 ± 141.0 | +65.2 ± 141.0 | -4.1 ± 9.8 | +3.0 ± 5.1 | -0.3 ± 4.6 | -0.1 ± 0.2 |
| onsen-mid · bath · beastkin/fox | +29.9 ± 165.5 | +29.9 ± 165.5 | **+17.5 ± 15.4** | +0.6 ± 4.3 | +0.9 ± 4.5 | -0.1 ± 0.2 |
| onsen-mid · bath · beastkin/cat | +99.0 ± 150.0 | +99.0 ± 150.0 | **+23.0 ± 13.7** | **+2.9 ± 2.8** | **+7.1 ± 6.8** | -0.1 ± 0.1 |
| onsen-mid · bath · beastkin/rabbit | +37.4 ± 171.0 | +37.4 ± 171.0 | **+18.1 ± 9.6** | +0.3 ± 4.5 | +1.6 ± 5.2 | -0.1 ± 0.2 |
| onsen-mid · bath · beastkin/dragon | +102.9 ± 121.3 | +102.9 ± 121.3 | **+18.4 ± 16.0** | +1.7 ± 4.0 | +4.9 ± 7.7 | -0.1 ± 0.2 |
| onsen-mid · bath · demon | -62.0 ± 148.8 | -62.0 ± 148.8 | +23.0 ± 39.3 | -2.2 ± 2.9 | +1.6 ± 3.3 | -0.1 ± 0.2 |
| onsen-mid · bath · dwarf | +10.3 ± 101.1 | +10.3 ± 101.1 | +10.6 ± 13.4 | +0.5 ± 1.9 | +1.2 ± 4.8 | +0.0 ± 0.2 |
| onsen-mid · bath · spirit | +5.6 ± 201.9 | +5.6 ± 201.9 | **-22.4 ± 14.7** | +1.2 ± 4.7 | +3.4 ± 4.5 | -0.1 ± 0.2 |
| onsen-mid · bath · angel | +41.0 ± 169.4 | +41.0 ± 169.4 | -0.7 ± 13.6 | +3.0 ± 5.3 | +3.7 ± 5.8 | -0.1 ± 0.2 |
| onsen-mid · bath · angel/lantern | +35.3 ± 139.9 | +35.3 ± 139.9 | +3.1 ± 8.4 | +0.6 ± 4.8 | +4.6 ± 7.0 | -0.0 ± 0.2 |
| onsen-mid · bath · android | -45.4 ± 152.0 | -45.4 ± 152.0 | -19.8 ± 42.3 | **+3.0 ± 2.1** | **+5.0 ± 4.9** | +0.2 ± 0.2 |
| castle-mid · host · elf | **-785.1 ± 578.0** | **-785.1 ± 578.0** | **-8.4 ± 5.9** | -4.7 ± 4.9 | -0.6 ± 10.3 | +0.0 ± 1.0 |
| castle-mid · host · beastkin/fox | -863.8 ± 1,045 | -850.5 ± 1,021 | +1.3 ± 8.4 | -3.3 ± 3.9 | +3.0 ± 11.3 | -0.3 ± 0.6 |
| castle-mid · host · beastkin/cat | -527.9 ± 1,363 | -514.6 ± 1,343 | +4.8 ± 6.7 | +0.6 ± 5.2 | +7.0 ± 10.5 | -0.2 ± 0.6 |
| castle-mid · host · beastkin/rabbit | -415.6 ± 1,277 | -402.5 ± 1,256 | +12.1 ± 12.5 | -1.7 ± 4.9 | +5.1 ± 12.3 | -0.2 ± 1.2 |
| castle-mid · host · beastkin/dragon | -915.7 ± 1,267 | -902.4 ± 1,247 | -5.9 ± 7.3 | -2.6 ± 5.5 | +5.1 ± 17.4 | -0.1 ± 0.9 |
| castle-mid · host · demon | +39.5 ± 558.9 | +39.5 ± 558.9 | -1.3 ± 13.8 | -2.6 ± 4.8 | +3.1 ± 5.2 | -0.0 ± 0.4 |
| castle-mid · host · dwarf | +288.5 ± 771.3 | +288.5 ± 771.3 | **+14.6 ± 7.2** | +1.4 ± 3.5 | +8.6 ± 10.8 | +0.3 ± 0.6 |
| castle-mid · host · spirit | **-1,199 ± 1,102** | **-1,199 ± 1,102** | **-9.8 ± 7.8** | **-5.0 ± 3.5** | +0.3 ± 13.4 | +0.2 ± 0.4 |
| castle-mid · host · angel | **-1,127 ± 993.0** | **-1,114 ± 969.5** | **-14.4 ± 7.6** | -5.2 ± 5.5 | -2.6 ± 14.0 | -0.3 ± 0.4 |
| castle-mid · host · angel/lantern | -583.0 ± 846.8 | -583.0 ± 846.8 | -1.7 ± 5.1 | +0.2 ± 4.0 | +1.5 ± 13.7 | -0.3 ± 0.8 |
| castle-mid · host · android | +398.5 ± 860.3 | +398.5 ± 860.3 | **-82.7 ± 13.2** | +1.7 ± 6.1 | **+11.1 ± 9.7** | +0.2 ± 0.7 |
| castle-late · host · elf | -43.7 ± 1,145 | -43.7 ± 1,145 | +0.0 ± 11.0 | +0.2 ± 1.7 | -0.4 ± 2.2 | +0.0 ± 0.1 |
| castle-late · host · beastkin/fox | -49.7 ± 942.3 | -48.2 ± 942.9 | **+24.2 ± 9.0** | +0.9 ± 1.6 | +0.3 ± 2.9 | -0.0 ± 0.2 |
| castle-late · host · beastkin/cat | -270.3 ± 1,159 | -268.8 ± 1,161 | **+23.3 ± 9.9** | +0.7 ± 1.9 | +1.6 ± 2.7 | +0.0 ± 0.1 |
| castle-late · host · beastkin/rabbit | +307.8 ± 1,004 | +307.8 ± 1,004 | **+22.8 ± 9.3** | +0.6 ± 2.0 | -0.5 ± 4.4 | -0.0 ± 0.1 |
| castle-late · host · beastkin/dragon | +419.2 ± 887.2 | +419.2 ± 887.2 | -2.8 ± 6.8 | +0.8 ± 1.1 | +0.7 ± 3.4 | +0.0 ± 0.2 |
| castle-late · host · demon | +12.4 ± 1,740 | +12.4 ± 1,740 | +1.9 ± 11.5 | +1.4 ± 4.7 | +0.4 ± 4.0 | +0.0 ± 0.2 |
| castle-late · host · dwarf | +350.8 ± 968.8 | +350.8 ± 968.8 | +14.6 ± 15.4 | **+2.4 ± 1.5** | +1.1 ± 3.9 | -0.1 ± 0.2 |
| castle-late · host · spirit | -305.5 ± 1,381 | -305.5 ± 1,381 | -0.1 ± 5.5 | **-2.6 ± 2.0** | -0.5 ± 3.8 | +0.1 ± 0.2 |
| castle-late · host · angel | +397.2 ± 1,318 | +398.7 ± 1,319 | -4.9 ± 6.6 | -0.4 ± 2.0 | -1.5 ± 2.1 | -0.0 ± 0.3 |
| castle-late · host · angel/lantern | +264.6 ± 962.8 | +266.1 ± 963.5 | +5.1 ± 9.4 | -0.2 ± 1.3 | -2.5 ± 2.7 | -0.0 ± 0.2 |
| castle-late · host · android | +370.4 ± 738.6 | +370.4 ± 738.6 | **-79.5 ± 13.9** | **+4.4 ± 2.2** | -0.2 ± 2.7 | -0.0 ± 0.1 |
| castle-mid · attendant · elf | +587.1 ± 821.1 | +587.1 ± 821.1 | +16.0 ± 37.7 | +3.2 ± 4.8 | +8.6 ± 16.8 | -0.3 ± 1.0 |
| castle-mid · attendant · beastkin/fox | -258.9 ± 1,001 | -258.9 ± 1,001 | **+31.8 ± 24.8** | -2.6 ± 6.6 | -4.3 ± 18.5 | -0.9 ± 1.2 |
| castle-mid · attendant · beastkin/cat | -135.9 ± 592.3 | -135.9 ± 592.3 | +3.9 ± 23.4 | -0.6 ± 3.5 | -5.1 ± 15.5 | -1.2 ± 1.3 |
| castle-mid · attendant · beastkin/rabbit | +130.8 ± 995.3 | +130.8 ± 995.3 | +31.4 ± 38.1 | +0.7 ± 5.9 | +4.3 ± 20.1 | -0.5 ± 0.9 |
| castle-mid · attendant · beastkin/dragon | -278.3 ± 855.0 | -278.3 ± 855.0 | +14.2 ± 28.5 | -2.9 ± 4.8 | +5.1 ± 15.9 | -0.6 ± 1.0 |
| castle-mid · attendant · demon | +284.9 ± 724.5 | +284.9 ± 724.5 | **+62.3 ± 59.1** | +1.4 ± 5.4 | +10.5 ± 15.8 | -0.3 ± 1.1 |
| castle-mid · attendant · dwarf | +111.6 ± 902.3 | +111.6 ± 902.3 | +14.5 ± 25.9 | +0.0 ± 6.1 | +7.9 ± 15.9 | -0.2 ± 1.0 |
| castle-mid · attendant · spirit | +425.8 ± 1,159 | +412.5 ± 1,143 | +23.9 ± 31.6 | -1.5 ± 6.1 | +8.3 ± 19.6 | +0.0 ± 1.5 |
| castle-mid · attendant · angel | +265.7 ± 1,340 | +252.4 ± 1,325 | **+39.0 ± 32.3** | -1.2 ± 6.5 | +6.6 ± 18.1 | -0.3 ± 1.2 |
| castle-mid · attendant · angel/lantern | -398.7 ± 718.9 | -398.7 ± 718.9 | +38.3 ± 41.7 | -1.3 ± 5.2 | -2.5 ± 16.6 | -0.5 ± 1.2 |
| castle-mid · attendant · android | +72.0 ± 1,151 | +71.9 ± 1,151 | -15.3 ± 32.2 | -1.3 ± 7.2 | +3.1 ± 20.1 | -0.2 ± 1.3 |
| castle-mid · madame · elf | -227.8 ± 473.8 | -227.7 ± 473.8 | +16.5 ± 28.1 | -1.5 ± 3.5 | -0.4 ± 6.5 | -0.5 ± 1.0 |
| castle-mid · madame · beastkin/fox | -226.1 ± 329.9 | -225.9 ± 329.9 | +10.3 ± 19.7 | -1.0 ± 4.3 | +4.6 ± 5.9 | -0.3 ± 0.9 |
| castle-mid · madame · beastkin/cat | **-595.0 ± 379.7** | **-594.9 ± 379.6** | +17.4 ± 31.8 | -4.0 ± 6.0 | -1.9 ± 11.5 | -0.3 ± 0.9 |
| castle-mid · madame · beastkin/rabbit | **-795.8 ± 708.8** | **-795.7 ± 708.8** | **+43.9 ± 27.7** | **-7.0 ± 6.2** | -4.5 ± 10.7 | -0.7 ± 0.9 |
| castle-mid · madame · beastkin/dragon | **-941.9 ± 455.3** | **-941.8 ± 455.2** | **-16.1 ± 14.4** | **-6.7 ± 5.9** | -1.9 ± 6.3 | -0.5 ± 0.7 |
| castle-mid · madame · demon | **-701.5 ± 613.4** | **-701.3 ± 613.3** | +8.9 ± 13.4 | -3.8 ± 5.5 | -4.4 ± 13.3 | -0.5 ± 0.9 |
| castle-mid · madame · dwarf | -553.4 ± 630.8 | -553.3 ± 630.8 | +3.6 ± 25.9 | -4.2 ± 5.7 | -0.3 ± 9.3 | -0.1 ± 0.7 |
| castle-mid · madame · spirit | **-869.4 ± 785.3** | **-869.3 ± 785.2** | +24.3 ± 32.7 | -6.4 ± 7.4 | -5.5 ± 8.8 | -0.5 ± 0.8 |
| castle-mid · madame · angel | -634.0 ± 1,112 | -647.2 ± 1,097 | **+26.0 ± 25.3** | -7.1 ± 8.4 | -3.3 ± 12.0 | -0.2 ± 1.1 |
| castle-mid · madame · angel/lantern | -729.5 ± 773.1 | -729.4 ± 773.0 | **+31.9 ± 23.4** | -4.0 ± 5.9 | -1.6 ± 7.3 | -0.4 ± 0.8 |
| castle-mid · madame · android | -283.1 ± 814.6 | -283.0 ± 814.5 | -18.2 ± 19.9 | -4.5 ± 6.1 | +0.3 ± 9.7 | +0.1 ± 0.8 |
| sanctuary-mid · chapel · elf | -128.6 ± 232.2 | -128.6 ± 232.2 | -2.9 ± 3.4 | -0.1 ± 1.3 | -4.3 ± 9.4 | **-0.1 ± 0.1** |
| sanctuary-mid · chapel · beastkin/fox | -328.9 ± 505.4 | -328.9 ± 505.4 | -1.7 ± 9.2 | -3.3 ± 3.9 | -10.3 ± 11.7 | +0.0 ± 0.1 |
| sanctuary-mid · chapel · beastkin/cat | -366.9 ± 481.0 | -366.9 ± 481.0 | -2.0 ± 8.7 | -2.8 ± 4.2 | -8.9 ± 13.9 | +0.1 ± 0.1 |
| sanctuary-mid · chapel · beastkin/rabbit | -366.7 ± 451.1 | -366.7 ± 451.1 | +0.1 ± 8.2 | -2.9 ± 4.9 | -8.1 ± 12.5 | -0.0 ± 0.2 |
| sanctuary-mid · chapel · beastkin/dragon | -339.0 ± 414.4 | -339.0 ± 414.4 | **-9.5 ± 7.9** | -2.6 ± 3.6 | -9.9 ± 13.1 | +0.0 ± 0.2 |
| sanctuary-mid · chapel · demon | -521.1 ± 653.0 | -521.1 ± 653.0 | **-19.3 ± 9.3** | -4.6 ± 5.4 | **-13.1 ± 12.5** | **-0.3 ± 0.3** |
| sanctuary-mid · chapel · dwarf | -483.9 ± 721.6 | -483.9 ± 721.6 | -10.4 ± 11.6 | -5.7 ± 6.2 | -16.8 ± 17.3 | -0.1 ± 0.3 |
| sanctuary-mid · chapel · spirit | +70.3 ± 407.0 | +70.3 ± 407.0 | -4.1 ± 8.9 | +1.2 ± 3.7 | +1.3 ± 10.7 | **-0.2 ± 0.2** |
| sanctuary-mid · chapel · angel | -202.5 ± 369.9 | -202.5 ± 369.9 | **+18.1 ± 13.7** | -3.3 ± 4.2 | -3.1 ± 13.8 | -0.0 ± 0.2 |
| sanctuary-mid · chapel · angel/lantern | +51.1 ± 450.7 | +51.1 ± 450.7 | **+40.4 ± 17.4** | -1.3 ± 2.8 | -1.5 ± 9.4 | -0.0 ± 0.2 |
| sanctuary-mid · chapel · android | -96.7 ± 446.4 | -96.7 ± 446.4 | **-52.5 ± 13.1** | -1.7 ± 3.7 | -1.3 ± 6.8 | **-0.3 ± 0.2** |
| sanctuary-late · chapel · elf | -144.7 ± 252.8 | -144.7 ± 252.8 | +6.4 ± 14.1 | **+0.8 ± 0.8** | +1.0 ± 2.3 | -0.0 ± 0.1 |
| sanctuary-late · chapel · beastkin/fox | -184.9 ± 522.5 | -185.9 ± 522.4 | +9.0 ± 9.0 | +0.4 ± 2.7 | +0.2 ± 3.1 | +0.0 ± 0.3 |
| sanctuary-late · chapel · beastkin/cat | -267.7 ± 609.8 | -268.8 ± 609.7 | +5.2 ± 7.7 | +0.0 ± 3.0 | +0.2 ± 3.3 | +0.0 ± 0.3 |
| sanctuary-late · chapel · beastkin/rabbit | -138.9 ± 808.4 | -139.4 ± 808.7 | **+15.5 ± 12.8** | +1.2 ± 3.4 | +0.9 ± 2.6 | -0.1 ± 0.3 |
| sanctuary-late · chapel · beastkin/dragon | -145.1 ± 333.5 | -146.2 ± 333.4 | -2.3 ± 15.7 | +1.4 ± 2.9 | +1.1 ± 3.0 | +0.0 ± 0.2 |
| sanctuary-late · chapel · demon | -205.2 ± 699.4 | -206.3 ± 699.4 | **-26.8 ± 8.5** | +0.7 ± 2.8 | +2.4 ± 3.3 | **-0.2 ± 0.2** |
| sanctuary-late · chapel · dwarf | +167.8 ± 563.9 | +167.8 ± 563.9 | **-4.7 ± 3.6** | +0.7 ± 0.9 | +1.7 ± 2.1 | -0.2 ± 0.2 |
| sanctuary-late · chapel · spirit | +279.5 ± 573.7 | +279.0 ± 573.9 | +10.6 ± 14.0 | +1.5 ± 1.6 | +2.3 ± 2.7 | +0.0 ± 0.3 |
| sanctuary-late · chapel · angel | +15.0 ± 1,021 | +15.1 ± 1,021 | **+45.0 ± 18.6** | -1.8 ± 5.0 | +2.0 ± 5.2 | -0.3 ± 0.6 |
| sanctuary-late · chapel · angel/lantern | -141.8 ± 445.7 | -142.4 ± 445.7 | **+57.6 ± 14.2** | -0.2 ± 2.1 | **+3.2 ± 2.8** | +0.1 ± 0.2 |
| sanctuary-late · chapel · android | -250.8 ± 433.7 | -251.9 ± 433.9 | **-45.3 ± 3.3** | +0.4 ± 1.6 | -1.4 ± 3.0 | +0.1 ± 0.2 |
| lantern-mid · teacher · elf | +22.4 ± 43.6 | +22.4 ± 43.6 | +2.3 ± 3.9 | +2.0 ± 2.5 | -3.2 ± 5.3 | **-2.0 ± 0.8** |
| lantern-mid · teacher · beastkin/fox | +18.8 ± 85.3 | +18.8 ± 85.3 | **+6.8 ± 3.2** | +1.7 ± 4.6 | -1.3 ± 7.5 | **-2.0 ± 0.9** |
| lantern-mid · teacher · beastkin/cat | +20.6 ± 83.7 | +20.6 ± 83.7 | **+6.3 ± 3.0** | +1.9 ± 4.3 | -0.2 ± 6.6 | **-2.0 ± 0.9** |
| lantern-mid · teacher · beastkin/rabbit | +20.0 ± 85.7 | +20.0 ± 85.7 | **+9.0 ± 6.7** | +1.1 ± 3.6 | -0.0 ± 5.1 | **-2.2 ± 1.3** |
| lantern-mid · teacher · beastkin/dragon | -1.6 ± 80.1 | -1.6 ± 80.1 | -0.6 ± 6.5 | +1.0 ± 2.4 | -2.6 ± 5.3 | **-2.3 ± 1.4** |
| lantern-mid · teacher · demon | +5.6 ± 54.3 | +5.6 ± 54.3 | **+9.2 ± 6.7** | +1.1 ± 5.0 | -4.4 ± 7.6 | **-5.6 ± 1.8** |
| lantern-mid · teacher · dwarf | -46.1 ± 72.7 | -46.1 ± 72.7 | -3.0 ± 3.7 | +0.5 ± 3.5 | -7.7 ± 8.8 | **-2.1 ± 0.9** |
| lantern-mid · teacher · spirit | -7.0 ± 66.4 | -7.0 ± 66.4 | -0.8 ± 3.4 | +0.7 ± 4.5 | -5.4 ± 6.1 | **-3.0 ± 1.5** |
| lantern-mid · teacher · angel | -31.5 ± 65.7 | -31.5 ± 65.7 | **-9.9 ± 6.1** | +0.8 ± 3.2 | -6.5 ± 7.1 | **-2.1 ± 1.2** |
| lantern-mid · teacher · angel/lantern | +1.0 ± 51.7 | +1.0 ± 51.7 | +4.7 ± 5.6 | +1.5 ± 4.2 | +0.2 ± 7.3 | **-2.9 ± 1.1** |
| lantern-mid · teacher · android | **-62.8 ± 55.6** | **-62.8 ± 55.6** | **-53.6 ± 3.9** | +1.8 ± 3.6 | +1.7 ± 3.5 | +0.5 ± 1.2 |

---

### ngplus-lovers-stacking

NG+ lover scaling across Cycles 2-4: 0 vs (1-4)x prior cycles carried lovers with reincarnation stacking, across Tankard, Lantern, and Castle.

scenario **ngplus** · 16 seeds from 1 · 1261s · 2026-11-20T18:43

| variant | n | c1won | c2weeks | c3weeks | c4weeks | c2over | c3over | c4over | c2debt | c3debt | c4debt | c2loversIn | c3loversIn | c4loversIn | c2lovers | c3lovers | c4lovers | c2reborn | c3reborn | c4reborn | c2cfHE | c2cfHM | c2cfHL | c3cfHE | c3cfHM | c3cfHL | c4cfHE | c4cfHM | c4cfHL | c2hNet | c3hNet | c4hNet | c2guild | c3guild | c4guild | c2cuts | c3cuts | c4cuts |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| tankard · 0 lovers | 15 (+1 unreached) | 34 | 37 | 49 | 45ⁿ12 | 0.0 | 0.2 | 0.2ⁿ12 | 72,323 | 130,254 | 185,389ⁿ12 | 0.0 | 0.0 | 0.0ⁿ12 | 0.9 | 0.7 | 0.3ⁿ12 | 1.0 | 3.5 | 8.1ⁿ12 | 282 | 1,388 | 3,326 | 434 | 2,237 | 6,171ⁿ12 | 922ⁿ12 | 3,515ⁿ12 | 8,534ⁿ10 | 1,969 | 2,890 | 4,285ⁿ12 | 569 | 860 | 1,248ⁿ12 | 923 | 1,471 | 2,941ⁿ12 |
| tankard · base | 15 (+1 unreached) | 34 | 33 | 48 | 52ⁿ12 | 0.0 | 0.2 | 0.3ⁿ12 | 74,323 | 127,611 | 193,394ⁿ12 | 1.0 | 2.0 | 3.0ⁿ12 | 1.9 | 2.9 | 3.2ⁿ12 | 2.0 | 5.8 | 13ⁿ12 | 659 | 2,194 | 3,837 | 655 | 2,491 | 5,877ⁿ12 | 1,025ⁿ12 | 2,844ⁿ12 | 8,183ⁿ9 | 2,427 | 2,898 | 3,761ⁿ12 | 565 | 921 | 1,219ⁿ12 | 1,192 | 2,332 | 4,190ⁿ12 |
| tankard · 2x lovers | 15 (+1 unreached) | 34 | 36 | 44 | 72ⁿ13 | 0.0 | 0.1 | 0.5ⁿ13 | 76,323 | 131,817 | 199,659ⁿ13 | 2.0 | 4.0 | 6.0ⁿ13 | 2.5 | 4.7 | 6.8ⁿ13 | 2.4 | 8.0 | 18ⁿ13 | 280 | 1,680 | 3,518 | 657 | 2,513 | 6,056ⁿ13 | 814ⁿ13 | 1,988ⁿ13 | 7,818ⁿ6 | 2,142 | 3,183 | 2,496ⁿ13 | 589 | 936 | 1,047ⁿ13 | 1,458 | 3,186 | 4,294ⁿ13 |
| tankard · 3x lovers | 15 (+1 unreached) | 34 | 39 | 41 | 66ⁿ14 | 0.0 | 0.1 | 0.4ⁿ14 | 78,323 | 136,678 | 205,799ⁿ14 | 3.0 | 6.0 | 9.0ⁿ14 | 3.8 | 6.9 | 9.6ⁿ14 | 3.1 | 11 | 23ⁿ14 | 292 | 1,203 | 3,175 | 507 | 2,493 | 5,270ⁿ14 | 479ⁿ14 | 1,878ⁿ14 | 5,726ⁿ9 | 1,936 | 3,104 | 2,483ⁿ14 | 557 | 981 | 1,290ⁿ14 | 1,394 | 3,601 | 6,116ⁿ14 |
| tankard · 4x lovers | 15 (+1 unreached) | 34 | 45 | 58ⁿ13 | 83ⁿ9 | 0.1 | 0.3ⁿ13 | 0.7ⁿ9 | 80,323 | 143,269ⁿ13 | 230,042ⁿ9 | 4.0 | 8.0ⁿ13 | 12ⁿ9 | 4.3 | 8.7ⁿ13 | 13ⁿ9 | 4.1 | 13ⁿ13 | 27ⁿ9 | 403 | 1,586 | 3,522ⁿ13 | 726ⁿ13 | 2,021ⁿ13 | 5,339ⁿ9 | 185ⁿ9 | 1,421ⁿ9 | 5,129ⁿ4 | 1,933 | 2,481ⁿ13 | 1,555ⁿ9 | 530 | 856ⁿ13 | 1,365ⁿ9 | 1,470 | 3,738ⁿ13 | 6,865ⁿ9 |
| lantern · 0 lovers | 16 | 33 | 54 | 75ⁿ12 | 61ⁿ5 | 0.3 | 0.6ⁿ12 | 0.4ⁿ5 | 84,644 | 130,408ⁿ12 | 179,669ⁿ5 | 0.0 | 0.0ⁿ12 | 0.0ⁿ5 | 0.7 | 0.4ⁿ12 | 0.0ⁿ5 | 1.0 | 3.7ⁿ12 | 7.8ⁿ5 | 51 | 1,301 | 4,312ⁿ12 | 295ⁿ12 | 1,475ⁿ12 | 5,867ⁿ6 | 989ⁿ5 | 3,068ⁿ5 | 8,211ⁿ3 | 1,865 | 1,750ⁿ12 | 3,390ⁿ5 | 489 | 636ⁿ12 | 1,125ⁿ5 | 1,124 | 1,298ⁿ12 | 3,068ⁿ5 |
| lantern · base | 16 | 33 | 46 | 54ⁿ13 | 81ⁿ9 | 0.2 | 0.3ⁿ13 | 0.7ⁿ9 | 86,644 | 141,365ⁿ13 | 209,458ⁿ9 | 1.0 | 2.0ⁿ13 | 3.0ⁿ9 | 1.6 | 2.8ⁿ13 | 3.1ⁿ9 | 2.0 | 5.7ⁿ13 | 12ⁿ9 | 718 | 2,210 | 4,935ⁿ13 | 878ⁿ13 | 2,871ⁿ13 | 6,433ⁿ10 | 322ⁿ9 | 1,804ⁿ9 | 7,651ⁿ3 | 2,507 | 3,115ⁿ13 | 1,903ⁿ9 | 516 | 841ⁿ13 | 1,058ⁿ9 | 1,090 | 2,755ⁿ13 | 2,458ⁿ9 |
| lantern · 2x lovers | 16 | 33 | 48 | 54ⁿ13 | 80ⁿ9 | 0.2 | 0.3ⁿ13 | 0.7ⁿ9 | 88,644 | 157,244ⁿ13 | 223,000ⁿ9 | 2.0 | 4.0ⁿ13 | 6.0ⁿ9 | 2.7 | 4.7ⁿ13 | 6.2ⁿ9 | 2.0 | 8.2ⁿ13 | 17ⁿ9 | 389 | 1,773 | 4,370ⁿ14 | 1,217ⁿ13 | 3,377ⁿ13 | 7,439ⁿ10 | 869ⁿ9 | 2,886ⁿ9 | 10,209ⁿ3 | 2,311 | 3,518ⁿ13 | 2,591ⁿ9 | 537 | 895ⁿ13 | 988ⁿ9 | 1,758 | 3,330ⁿ13 | 4,361ⁿ9 |
| lantern · 3x lovers | 16 | 33 | 43 | 43ⁿ14 | 61ⁿ12 | 0.1 | 0.1ⁿ14 | 0.3ⁿ12 | 90,644 | 149,201ⁿ14 | 227,172ⁿ12 | 3.0 | 6.0ⁿ14 | 9.0ⁿ12 | 3.8 | 6.8ⁿ14 | 9.8ⁿ12 | 3.0 | 10ⁿ14 | 23ⁿ12 | 658 | 2,118 | 4,841ⁿ15 | 1,326ⁿ14 | 3,272ⁿ14 | 6,204ⁿ12 | 744ⁿ12 | 2,261ⁿ12 | 6,822ⁿ9 | 2,688 | 3,578ⁿ14 | 3,278ⁿ12 | 569 | 1,022ⁿ14 | 1,283ⁿ12 | 1,730 | 4,120ⁿ14 | 7,219ⁿ12 |
| lantern · 4x lovers | 16 | 33 | 38 | 34ⁿ15 | 62ⁿ15 | 0.1 | 0.0ⁿ15 | 0.3ⁿ15 | 92,644 | 159,845ⁿ15 | 232,701ⁿ15 | 4.0 | 8.0ⁿ15 | 12ⁿ15 | 4.6 | 8.8ⁿ15 | 13ⁿ15 | 4.0 | 13ⁿ15 | 28ⁿ15 | 640 | 2,435 | 4,602 | 1,604ⁿ15 | 3,566ⁿ15 | 6,188ⁿ15 | 737ⁿ15 | 2,325ⁿ15 | 5,560ⁿ11 | 2,777 | 4,221ⁿ15 | 2,919ⁿ15 | 650 | 1,097ⁿ15 | 1,458ⁿ15 | 2,279 | 5,503ⁿ15 | 9,388ⁿ15 |
| castle · 0 lovers | 15 (+1 unreached) | 31 | 99 | 33ⁿ1 | 104ⁿ1 | 0.9 | 0.0ⁿ1 | 1.0ⁿ1 | 176,933 | 261,325ⁿ1 | 341,048ⁿ1 | 0.0 | 0.0ⁿ1 | 0.0ⁿ1 | 0.1 | 1.0ⁿ1 | 0.0ⁿ1 | 2.0 | 5.0ⁿ1 | 11ⁿ1 | 34 | 962 | 13,057ⁿ1 | 2,147ⁿ1 | 7,148ⁿ1 | 12,511ⁿ1 | -570ⁿ1 | 60ⁿ1 | – | 550 | 8,048ⁿ1 | -360ⁿ1 | 408 | 1,014ⁿ1 | 538ⁿ1 | 520 | 3,149ⁿ1 | 690ⁿ1 |
| castle · base | 15 (+1 unreached) | 31 | 36 | 81ⁿ13 | 69ⁿ4 | 0.1 | 0.7ⁿ13 | 0.5ⁿ4 | 178,933 | 262,223ⁿ13 | 356,016ⁿ4 | 1.0 | 2.0ⁿ13 | 3.0ⁿ4 | 1.3 | 2.2ⁿ13 | 3.8ⁿ4 | 3.0 | 7.2ⁿ13 | 14ⁿ4 | 3,374 | 8,913 | 12,324ⁿ11 | 846ⁿ13 | 3,527ⁿ13 | 12,907ⁿ5 | 1,987ⁿ4 | 6,673ⁿ4 | 19,903ⁿ2 | 7,525 | 3,156ⁿ13 | 6,873ⁿ4 | 659 | 639ⁿ13 | 999ⁿ4 | 2,735 | 2,348ⁿ13 | 6,314ⁿ4 |
| castle · 2x lovers | 15 (+1 unreached) | 31 | 40 | 34ⁿ12 | 79ⁿ11 | 0.2 | 0.1ⁿ12 | 0.6ⁿ11 | 180,933 | 268,334ⁿ12 | 371,432ⁿ11 | 2.0 | 4.0ⁿ12 | 6.0ⁿ11 | 2.6 | 4.8ⁿ12 | 6.1ⁿ11 | 3.1 | 9.5ⁿ12 | 20ⁿ11 | 3,312 | 9,553 | 15,036ⁿ10 | 4,374ⁿ12 | 10,324ⁿ12 | 16,179ⁿ11 | 1,923ⁿ11 | 4,402ⁿ11 | 14,946ⁿ4 | 7,857 | 9,712ⁿ12 | 4,381ⁿ11 | 595 | 1,031ⁿ12 | 1,068ⁿ11 | 2,988 | 8,095ⁿ12 | 6,292ⁿ11 |
| castle · 3x lovers | 15 (+1 unreached) | 31 | 37 | 40ⁿ13 | 66ⁿ11 | 0.1 | 0.2ⁿ13 | 0.5ⁿ11 | 182,933 | 267,673ⁿ13 | 383,641ⁿ11 | 3.0 | 6.0ⁿ13 | 9.0ⁿ11 | 3.5 | 6.6ⁿ13 | 9.7ⁿ11 | 3.5 | 12ⁿ13 | 26ⁿ11 | 3,359 | 8,836 | 11,258ⁿ10 | 3,767ⁿ13 | 9,823ⁿ13 | 15,239ⁿ11 | 3,788ⁿ11 | 7,568ⁿ11 | 17,810ⁿ6 | 7,538 | 8,807ⁿ13 | 7,697ⁿ11 | 682 | 1,028ⁿ13 | 1,257ⁿ11 | 3,776 | 7,874ⁿ13 | 12,410ⁿ11 |
| castle · 4x lovers | 15 (+1 unreached) | 31 | 43 | 30ⁿ12 | 48ⁿ12 | 0.2 | 0.0ⁿ12 | 0.2ⁿ12 | 184,933 | 281,065ⁿ12 | 387,747ⁿ12 | 4.0 | 8.0ⁿ12 | 12ⁿ12 | 4.5 | 8.6ⁿ12 | 13ⁿ12 | 4.0 | 14ⁿ12 | 30ⁿ12 | 2,332 | 7,365 | 13,424ⁿ12 | 4,722ⁿ12 | 10,104ⁿ12 | 15,079ⁿ12 | 3,410ⁿ12 | 8,296ⁿ12 | 14,884ⁿ10 | 6,734 | 10,155ⁿ12 | 9,254ⁿ12 | 570 | 1,164ⁿ12 | 1,388ⁿ12 | 4,329 | 11,660ⁿ12 | 18,855ⁿ12 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ c2weeks | Δ c3weeks | Δ c4weeks | Δ c2cfHE | Δ c3cfHE | Δ c4cfHE | Δ c2hNet | Δ c3hNet | Δ c4hNet | Δ c4over |
|---|---|---|---|---|---|---|---|---|---|---|
| tankard · 0 lovers | **+4.0 ± 2.5** | +1.0 ± 12.9 | -0.3 ± 26.2 | **-377.3 ± 210.3** | -220.4 ± 380.0 | -204.4 ± 769.2 | **-457.9 ± 298.1** | -7.6 ± 690.7 | +264.2 ± 1,665 | +0.0 ± 0.4 |
| tankard · 2x lovers | +2.7 ± 3.7 | -3.8 ± 15.8 | +19.1 ± 32.3 | **-378.7 ± 200.7** | +2.2 ± 548.2 | -74.5 ± 858.0 | -285.7 ± 360.5 | +284.8 ± 838.5 | -1,163 ± 2,295 | +0.3 ± 0.5 |
| tankard · 3x lovers | **+5.7 ± 3.0** | -6.5 ± 12.7 | +13.8 ± 22.1 | **-366.6 ± 220.2** | -147.5 ± 810.6 | -484.7 ± 735.6 | **-491.5 ± 289.5** | +206.4 ± 1,006 | -1,156 ± 1,389 | +0.2 ± 0.3 |
| tankard · 4x lovers | **+12.1 ± 10.6** | +7.9 ± 23.3 | **+52.1 ± 22.9** | -255.8 ± 396.6 | -47.3 ± 677.2 | **-1,233 ± 1,149** | **-493.9 ± 392.3** | -351.1 ± 1,135 | **-3,589 ± 1,831** | **+0.7 ± 0.4** |
| lantern · 0 lovers | +8.0 ± 19.3 | +15.2 ± 28.1 | -36.8 ± 37.3 | **-667.0 ± 330.3** | -534.5 ± 585.1 | **+763.5 ± 391.4** | -642.0 ± 685.2 | -1,155 ± 1,593 | **+1,932 ± 1,697** | -0.5 ± 0.6 |
| lantern · 2x lovers | +2.3 ± 18.4 | +7.2 ± 22.7 | +11.5 ± 21.8 | **-329.6 ± 244.7** | -134.3 ± 737.6 | +69.6 ± 573.7 | -195.4 ± 749.2 | -297.4 ± 1,364 | -596.9 ± 1,780 | +0.2 ± 0.3 |
| lantern · 3x lovers | -3.2 ± 15.7 | -11.6 ± 23.7 | -17.1 ± 24.3 | -60.4 ± 320.3 | +480.1 ± 645.8 | +182.2 ± 468.5 | +180.8 ± 571.9 | +455.8 ± 1,371 | +783.9 ± 1,808 | -0.3 ± 0.4 |
| lantern · 4x lovers | -7.9 ± 16.4 | **-21.3 ± 20.3** | -21.6 ± 41.5 | -78.7 ± 294.6 | +497.1 ± 624.4 | +572.7 ± 885.9 | +270.3 ± 511.5 | +1,136 ± 1,225 | +1,296 ± 2,229 | -0.4 ± 0.6 |
| castle · 0 lovers | **+62.9 ± 16.5** | +4.0 ± – | +67.0 ± – | **-3,341 ± 1,373** | -1,506 ± – | -2,805 ± – | **-6,975 ± 1,935** | -1,780 ± – | -10,468 ± – | +1.0 ± – |
| castle · 2x lovers | +4.0 ± 18.4 | **-49.4 ± 23.5** | +1.3 ± 82.6 | -62.1 ± 1,035 | **+3,909 ± 1,753** | -285.0 ± 4,110 | +332.5 ± 2,188 | **+7,284 ± 3,640** | -1,975 ± 12,306 | +0.0 ± 1.1 |
| castle · 3x lovers | +1.0 ± 14.9 | **-36.9 ± 34.3** | +2.0 ± 3.9 | -15.0 ± 1,028 | **+2,648 ± 2,271** | **+387.7 ± 349.7** | +13.5 ± 2,028 | **+4,927 ± 4,804** | -178.7 ± 1,212 | +0.0 ± 0.0 |
| castle · 4x lovers | +7.2 ± 16.8 | **-52.5 ± 22.7** | -21.0 ± 41.2 | **-1,042 ± 1,033** | **+3,757 ± 1,788** | **+1,084 ± 1,031** | -790.7 ± 1,630 | **+6,940 ± 3,625** | +1,926 ± 5,154 | -0.3 ± 0.7 |

---

### ngplus-houses-scaling

NG+ kept houses scaling across Cycles 2-4: home only (no new), home+new (2 houses), 1x prior+new (2/3/4), and 2x prior+new (3/5/7) across Tankard, Lantern, and Castle.

scenario **ngplus** · 16 seeds from 1 · 1108s · 2026-11-20T18:40

| variant | n | c1won | c2houses | c3houses | c4houses | c2weeks | c3weeks | c4weeks | c2over | c3over | c4over | c2debt | c3debt | c4debt | c2cfHE | c2cfHM | c2cfHL | c3cfHE | c3cfHM | c3cfHL | c4cfHE | c4cfHM | c4cfHL | c2hNet | c3hNet | c4hNet | c2guild | c3guild | c4guild |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| tankard · base | 15 (+1 unreached) | 34 | 2.0 | 2.0 | 2.0 | 35 | 35 | 37 | 0.0 | 0.0 | 0.0 | 76,323 | 101,869 | 139,623 | 244 | 1,759 | 3,686 | 1,108 | 2,118 | 3,755 | 933 | 1,964 | 3,712 | 2,214 | 2,548 | 2,519 | 606 | 802 | 1,336 |
| tankard · home only (no new) | 15 (+1 unreached) | 34 | 1.0 | 1.0 | 1.0 | 25 | 22 | 28 | 0.0 | 0.0 | 0.0 | 32,923 | 49,069 | 66,063 | 324 | 1,005 | 1,563ⁿ12 | 776 | 1,185 | 1,419ⁿ12 | 506 | 1,051 | 1,413ⁿ14 | 908 | 1,124 | 992 | 395 | 753 | 911 |
| tankard · 1x kept + new | 15 (+1 unreached) | 34 | 2.0 | 3.0 | 4.0ⁿ13 | 36 | 44 | 73ⁿ13 | 0.0 | 0.1 | 0.5ⁿ13 | 76,323 | 131,817 | 199,659ⁿ13 | 280 | 1,680 | 3,518 | 657 | 2,513 | 6,091ⁿ13 | 745ⁿ13 | 1,921ⁿ13 | 7,616ⁿ6 | 2,142 | 3,187 | 2,437ⁿ13 | 589 | 938 | 1,046ⁿ13 |
| tankard · 2x kept + new | 15 (+1 unreached) | 34 | 3.0 | 5.0 | 7.0ⁿ9 | 37 | 64 | 104ⁿ9 | 0.0 | 0.4 | 1.0ⁿ9 | 89,054 | 184,262 | 333,343ⁿ9 | 415 | 1,800 | 4,932 | 521 | 2,020 | 8,730ⁿ9 | 491ⁿ9 | 1,705ⁿ9 | – | 2,906 | 3,180 | 896ⁿ9 | 668 | 1,008 | 813ⁿ9 |
| lantern · base | 16 | 33 | 2.0 | 2.0ⁿ13 | 2.0ⁿ13 | 48 | 33ⁿ13 | 40ⁿ13 | 0.2 | 0.0ⁿ13 | 0.1ⁿ13 | 88,644 | 123,718ⁿ13 | 156,305ⁿ13 | 389 | 1,773 | 4,370ⁿ14 | 1,358ⁿ13 | 2,759ⁿ13 | 5,224ⁿ13 | 1,645ⁿ13 | 3,049ⁿ13 | 5,109ⁿ13 | 2,311 | 3,364ⁿ13 | 3,561ⁿ13 | 537 | 938ⁿ13 | 1,215ⁿ13 |
| lantern · home only (no new) | 16 | 33 | 1.0 | 1.0 | 1.0 | 26 | 24 | 27 | 0.0 | 0.0 | 0.0 | 44,919 | 63,300 | 83,522 | 488 | 1,589 | 2,165ⁿ14 | 1,080 | 1,835 | 2,211ⁿ14 | 1,089 | 1,912 | 2,636ⁿ14 | 1,359 | 1,676 | 1,869 | 451 | 731 | 955 |
| lantern · 1x kept + new | 16 | 33 | 2.0 | 3.0ⁿ13 | 4.0ⁿ9 | 48 | 54ⁿ13 | 80ⁿ9 | 0.2 | 0.3ⁿ13 | 0.7ⁿ9 | 88,644 | 157,244ⁿ13 | 223,000ⁿ9 | 389 | 1,773 | 4,370ⁿ14 | 1,217ⁿ13 | 3,377ⁿ13 | 7,439ⁿ10 | 869ⁿ9 | 2,886ⁿ9 | 10,209ⁿ3 | 2,311 | 3,518ⁿ13 | 2,591ⁿ9 | 537 | 895ⁿ13 | 988ⁿ9 |
| lantern · 2x kept + new | 16 | 33 | 3.0 | 5.0ⁿ15 | 7.0ⁿ10 | 42 | 58ⁿ15 | 92ⁿ10 | 0.1 | 0.3ⁿ15 | 0.8ⁿ10 | 103,853 | 196,334ⁿ15 | 344,091ⁿ10 | 556 | 1,975 | 5,743ⁿ15 | 1,802ⁿ15 | 3,479ⁿ15 | 8,574ⁿ12 | 343ⁿ10 | 1,534ⁿ10 | 9,092ⁿ2 | 3,264 | 4,471ⁿ15 | 1,487ⁿ10 | 559 | 885ⁿ15 | 1,076ⁿ10 |
| castle · base | 15 (+1 unreached) | 31 | 2.0 | 2.0ⁿ12 | 2.0ⁿ10 | 40 | 41ⁿ12 | 37ⁿ10 | 0.2 | 0.2ⁿ12 | 0.1ⁿ10 | 180,933 | 232,249ⁿ12 | 285,402ⁿ10 | 3,312 | 9,553 | 15,036ⁿ10 | 3,359ⁿ12 | 8,540ⁿ12 | 12,356ⁿ10 | 4,578ⁿ10 | 8,419ⁿ10 | 15,357ⁿ9 | 7,857 | 7,333ⁿ12 | 8,952ⁿ10 | 595 | 1,043ⁿ12 | 1,458ⁿ10 |
| castle · home only (no new) | 15 (+1 unreached) | 31 | 1.0 | 1.0 | 1.0 | 20 | 22 | 24 | 0.0 | 0.0 | 0.0 | 137,853 | 184,596 | 234,096 | 4,191 | 10,402 | 8,824ⁿ7 | 6,063 | 9,850 | 8,674ⁿ9 | 5,166 | 9,462 | 11,852ⁿ13 | 7,789 | 8,549 | 8,502 | 568 | 1,089 | 1,542 |
| castle · 1x kept + new | 15 (+1 unreached) | 31 | 2.0 | 3.0ⁿ12 | 4.0ⁿ11 | 40 | 34ⁿ12 | 79ⁿ11 | 0.2 | 0.1ⁿ12 | 0.6ⁿ11 | 180,933 | 268,334ⁿ12 | 371,432ⁿ11 | 3,312 | 9,553 | 15,036ⁿ10 | 4,374ⁿ12 | 10,324ⁿ12 | 16,179ⁿ11 | 1,923ⁿ11 | 4,402ⁿ11 | 15,132ⁿ4 | 7,857 | 9,712ⁿ12 | 4,412ⁿ11 | 595 | 1,031ⁿ12 | 1,064ⁿ11 |
| castle · 2x kept + new | 15 (+1 unreached) | 31 | 3.0 | 5.0ⁿ12 | 7.0ⁿ8 | 41 | 59ⁿ12 | 96ⁿ8 | 0.2 | 0.3ⁿ12 | 0.9ⁿ8 | 194,950 | 325,260ⁿ12 | 497,481ⁿ8 | 2,979 | 9,250 | 15,937ⁿ10 | 2,085ⁿ12 | 5,362ⁿ12 | 17,288ⁿ8 | 713ⁿ8 | 2,460ⁿ8 | 20,392ⁿ1 | 8,201 | 7,045ⁿ12 | 2,103ⁿ8 | 619 | 1,023ⁿ12 | 1,084ⁿ8 |

Paired Δ vs each group's base (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ c2weeks | Δ c3weeks | Δ c4weeks | Δ c2cfHE | Δ c3cfHE | Δ c4cfHE | Δ c2hNet | Δ c3hNet | Δ c4hNet | Δ c4over |
|---|---|---|---|---|---|---|---|---|---|---|
| tankard · home only (no new) | **-9.7 ± 3.1** | **-12.5 ± 2.9** | **-9.1 ± 3.8** | +79.5 ± 236.1 | -332.3 ± 372.9 | **-426.9 ± 388.1** | **-1,306 ± 402.0** | **-1,423 ± 309.2** | **-1,527 ± 521.9** | +0.0 ± 0.0 |
| tankard · 1x kept + new | +0.7 ± 1.5 | +9.1 ± 12.0 | **+36.1 ± 19.0** | +35.8 ± 47.8 | -450.8 ± 525.4 | -298.5 ± 419.5 | -72.5 ± 164.9 | +639.9 ± 783.3 | -154.4 ± 1,203 | **+0.5 ± 0.3** |
| tankard · 2x kept + new | +1.7 ± 1.8 | **+29.7 ± 17.3** | **+66.1 ± 3.0** | **+170.9 ± 166.3** | -586.7 ± 606.8 | -378.1 ± 385.1 | **+691.7 ± 475.3** | +632.5 ± 1,461 | **-1,685 ± 692.5** | **+1.0 ± 0.0** |
| lantern · home only (no new) | **-22.5 ± 13.1** | **-8.8 ± 3.0** | **-13.5 ± 10.6** | +98.8 ± 276.9 | -363.5 ± 786.3 | -443.1 ± 747.1 | **-952.5 ± 564.2** | **-1,689 ± 586.4** | **-1,599 ± 752.3** | -0.1 ± 0.2 |
| lantern · 1x kept + new | +0.0 ± 0.0 | **+20.6 ± 18.2** | **+46.7 ± 20.4** | +0.0 ± 0.0 | -141.0 ± 656.2 | **-1,054 ± 425.6** | +0.0 ± 0.0 | +153.8 ± 1,303 | -1,145 ± 1,400 | **+0.7 ± 0.3** |
| lantern · 2x kept + new | -5.6 ± 17.3 | **+30.1 ± 19.5** | **+43.6 ± 24.1** | +167.2 ± 238.1 | +397.5 ± 674.3 | **-1,492 ± 850.0** | **+952.3 ± 761.4** | +789.2 ± 1,287 | -1,595 ± 2,516 | **+0.6 ± 0.4** |
| castle · home only (no new) | **-19.5 ± 15.3** | **-19.4 ± 17.0** | -12.8 ± 14.2 | +879.0 ± 1,396 | **+3,094 ± 2,476** | +726.8 ± 1,225 | -68.6 ± 1,594 | +1,581 ± 2,754 | -481.5 ± 2,331 | -0.1 ± 0.2 |
| castle · 1x kept + new | +0.0 ± 0.0 | -6.5 ± 13.2 | **+46.3 ± 21.6** | +0.0 ± 0.0 | **+1,015 ± 972.1** | **-3,281 ± 2,300** | +0.0 ± 0.0 | **+2,379 ± 2,196** | **-5,293 ± 3,369** | **+0.6 ± 0.3** |
| castle · 2x kept + new | +1.7 ± 15.4 | +13.4 ± 30.8 | **+74.0 ± 3.1** | -333.1 ± 1,034 | -1,081 ± 1,969 | **-4,133 ± 1,292** | +343.2 ± 2,145 | +286.4 ± 4,429 | **-8,807 ± 1,876** | **+1.0 ± 0.0** |

---

### ngplus-guest-reborn

NG+ Cycles 2-3 with varying numbers and reincarnation stacks of returning guest alumni (with priority friend hiring vs default hiring).

scenario **ngplus** · 16 seeds from 1 · 429s · 2026-11-20T18:22

| variant | n | c1won | c2weeks | c3weeks | c2over | c3over | c2cfHE | c2cfHM | c2cfHL | c3cfHE | c3cfHM | c3cfHL | c2rebornAvg | c3rebornAvg | c2hNet | c3hNet | c2net | c3net | c2guild | c3guild |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | 16 | 33 | 48 | 54ⁿ13 | 0.2 | 0.3ⁿ13 | 389 | 1,773 | 4,370ⁿ14 | 1,217ⁿ13 | 3,377ⁿ13 | 7,439ⁿ10 | 2.4 | 9.8ⁿ13 | 2,311 | 3,518ⁿ13 | 2,849 | 4,413ⁿ13 | 537 | 895ⁿ13 |
| 2g x1 | 16 | 33 | 43 | 30ⁿ14 | 0.1 | 0.0ⁿ14 | 531 | 2,050 | 4,674ⁿ15 | 1,732ⁿ14 | 4,333ⁿ14 | 6,926ⁿ14 | 3.6 | 11ⁿ14 | 2,594 | 4,478ⁿ14 | 3,137 | 5,610ⁿ14 | 543 | 1,132ⁿ14 |
| 4g x1 | 16 | 33 | 40 | 42ⁿ14 | 0.1 | 0.1ⁿ14 | 451 | 2,631 | 5,478ⁿ14 | 1,460ⁿ14 | 3,849ⁿ14 | 7,101ⁿ12 | 4.6 | 12ⁿ14 | 2,812 | 4,147ⁿ14 | 3,413 | 5,048ⁿ14 | 601 | 900ⁿ14 |
| 4g x2 | 16 | 33 | 36 | 28ⁿ15 | 0.1 | 0.0ⁿ15 | 422 | 2,423 | 5,792ⁿ15 | 2,039ⁿ15 | 6,048ⁿ15 | 9,018ⁿ15 | 6.9 | 16ⁿ15 | 2,926 | 5,646ⁿ15 | 3,552 | 6,747ⁿ15 | 625 | 1,101ⁿ15 |
| 4g x4 | 16 | 33 | 36 | 37ⁿ15 | 0.1 | 0.0ⁿ15 | 369 | 2,424 | 6,216ⁿ15 | -110ⁿ15 | 340ⁿ15 | 1,270ⁿ15 | 9.6 | 6.0ⁿ15 | 3,066 | 610ⁿ15 | 3,639 | 1,355ⁿ15 | 573 | 745ⁿ15 |
| 6g x3 | 16 | 33 | 41 | 44ⁿ14 | 0.1 | 0.2ⁿ14 | 456 | 2,522 | 5,345ⁿ15 | 1,859ⁿ14 | 4,600ⁿ14 | 7,861ⁿ10 | 9.1 | 21ⁿ14 | 2,829 | 4,291ⁿ14 | 3,455 | 5,255ⁿ14 | 626 | 964ⁿ14 |
| 4g x2 (default hire) | 16 | 33 | 39 | 38ⁿ15 | 0.1 | 0.1ⁿ15 | 346 | 1,938 | 4,527ⁿ15 | 1,210ⁿ15 | 3,758ⁿ15 | 7,478ⁿ14 | 2.5 | 12ⁿ15 | 2,514 | 4,380ⁿ15 | 3,092 | 5,405ⁿ15 | 578 | 1,025ⁿ15 |

Paired Δ vs **base** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ c2weeks | Δ c3weeks | Δ c2cfHE | Δ c2hNet | Δ c3hNet | Δ c2net | Δ c3net |
|---|---|---|---|---|---|---|---|
| 2g x1 | -5.4 ± 13.9 | **-26.0 ± 19.8** | **+142.2 ± 107.1** | +282.2 ± 496.7 | +1,147 ± 1,306 | +288.0 ± 496.3 | +1,342 ± 1,411 |
| 4g x1 | -8.1 ± 14.5 | -11.8 ± 22.7 | +62.3 ± 228.9 | +500.6 ± 583.7 | +706.7 ± 1,478 | +564.5 ± 571.1 | +729.3 ± 1,631 |
| 4g x2 | **-12.1 ± 11.0** | **-26.4 ± 19.8** | +33.1 ± 224.1 | **+615.0 ± 426.5** | **+2,345 ± 1,377** | **+702.9 ± 442.2** | **+2,546 ± 1,475** |
| 4g x4 | **-11.6 ± 10.9** | -17.1 ± 20.1 | -19.8 ± 240.4 | **+754.3 ± 380.7** | **-2,900 ± 1,410** | **+789.8 ± 393.0** | **-3,018 ± 1,512** |
| 6g x3 | -7.4 ± 14.5 | -14.2 ± 16.7 | +67.0 ± 283.9 | +517.8 ± 632.9 | +723.2 ± 1,450 | +606.3 ± 646.6 | +828.9 ± 1,592 |
| 4g x2 (default hire) | -9.0 ± 11.3 | -15.2 ± 24.2 | -43.4 ± 197.8 | +203.0 ± 441.5 | +934.3 ± 1,759 | +243.5 ± 439.0 | +1,057 ± 1,879 |

---

### ngpp-cycles

3 consecutive NG++ cycles (NG++1-3) across cold entry vs realistic mid-stack and high-stack pre-NG++ progression, vs standard NG+ C2-C4.

scenario **ngplus** · 16 seeds from 1 · 376s · 2026-11-20T18:22

| variant | n | c1won | r1weeks | r2weeks | r3weeks | r1over | r2over | r3over | r1debt | r2debt | r3debt | r1staff | r2staff | r3staff | r1rebornAvg | r2rebornAvg | r3rebornAvg | r1cfHE | r1cfHM | r1cfHL | r2cfHE | r2cfHM | r2cfHL | r3cfHE | r3cfHM | r3cfHL | r1hNet | r2hNet | r3hNet | r1guild | r2guild | r3guild |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | 16 | 33 | 48 | 54ⁿ13 | 80ⁿ9 | 0.2 | 0.3ⁿ13 | 0.7ⁿ9 | 88,644 | 156,876ⁿ13 | 229,423ⁿ9 | 4.0 | 7.5ⁿ13 | 10ⁿ9 | 2.4 | 9.8ⁿ13 | 20ⁿ9 | 389 | 1,699 | 4,260ⁿ14 | 1,070ⁿ13 | 3,373ⁿ13 | 7,148ⁿ10 | 1,258ⁿ9 | 3,222ⁿ9 | 12,361ⁿ3 | 2,264 | 3,437ⁿ13 | 2,942ⁿ9 | 543 | 901ⁿ13 | 1,073ⁿ9 |
| ng++ cold | 16 | 33 | 69 | 82ⁿ9 | 82ⁿ3 | 0.4 | 0.7ⁿ9 | 0.7ⁿ3 | 50,000 | 113,606ⁿ9 | 180,211ⁿ3 | 1.0 | 1.0ⁿ9 | 1.0ⁿ3 | 1.2 | 2.2ⁿ9 | 5.9ⁿ3 | -10 | 201 | 965ⁿ14 | -108ⁿ9 | 655ⁿ9 | 3,084ⁿ3 | -189ⁿ3 | 1,229ⁿ3 | 4,289ⁿ1 | 451 | 655ⁿ9 | 967ⁿ3 | 452 | 711ⁿ9 | 1,027ⁿ3 |
| ng++ mid-stack | 16 | 33 | 35 | 49 | 65ⁿ13 | 0.0 | 0.2 | 0.4ⁿ13 | 50,000 | 116,696 | 177,467ⁿ13 | 1.0 | 1.0 | 1.0ⁿ13 | 4.6 | 4.3 | 7.2ⁿ13 | -162 | 274 | 1,469 | -78 | 998 | 2,659ⁿ13 | -178ⁿ13 | 700ⁿ13 | 3,029ⁿ8 | 637 | 1,275 | 1,070ⁿ13 | 814 | 1,124 | 1,601ⁿ13 |
| ng++ high-stack | 16 | 33 | 29 | 33 | 36ⁿ15 | 0.0 | 0.1 | 0.1ⁿ15 | 45,000 | 106,726 | 161,661ⁿ15 | 1.0 | 1.0 | 1.0ⁿ15 | 13 | 9.3 | 14ⁿ15 | -110 | 323 | 1,157 | 49 | 1,326 | 2,625ⁿ15 | -15ⁿ15 | 1,085ⁿ15 | 2,961ⁿ14 | 407 | 1,192 | 1,342ⁿ15 | 1,132 | 1,840 | 2,619ⁿ15 |
| ng++ high-stack (hireFriends) | 16 | 33 | 28 | 26 | 32 | 0.0 | 0.0 | 0.0 | 45,000 | 106,017 | 160,340 | 1.0 | 1.0 | 1.0 | 15 | 12 | 11 | -103 | 612 | 1,414ⁿ15 | 471 | 2,665 | 2,919ⁿ14 | -7.4 | 1,113 | 2,823 | 636 | 2,009 | 1,372 | 1,051 | 1,851 | 2,732 |
| ng++ mid-stack (no guild) | 16 | 33 | 104 | – | – | 1.0 | – | – | 50,000 | – | – | 1.0 | – | – | 3.9 | – | – | 64 | 281 | – | – | – | – | – | – | – | 136 | – | – | 0.0 | – | – |

Paired Δ vs **base** (mean ± 95% CI over seeds where both ran; **bold** = CI excludes 0):

| variant | Δ r1weeks | Δ r2weeks | Δ r3weeks | Δ r1cfHE | Δ r2cfHE | Δ r3cfHE | Δ r1hNet | Δ r2hNet | Δ r3hNet | Δ r1over | Δ r2over | Δ r3over |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ng++ cold | +20.4 ± 25.1 | +13.7 ± 52.5 | – | **-399.0 ± 210.3** | -336.3 ± 417.7 | – | **-1,813 ± 677.2** | -1,670 ± 2,134 | – | +0.3 ± 0.4 | +0.2 ± 0.8 | – |
| ng++ mid-stack | -12.8 ± 13.0 | -6.9 ± 20.9 | -4.9 ± 30.0 | **-551.3 ± 192.6** | **-1,180 ± 718.1** | **-1,632 ± 1,611** | **-1,627 ± 502.5** | **-2,100 ± 1,119** | -2,460 ± 2,887 | -0.2 ± 0.2 | -0.2 ± 0.3 | -0.1 ± 0.4 |
| ng++ high-stack | **-19.1 ± 13.7** | **-26.2 ± 18.9** | **-49.6 ± 24.5** | **-499.0 ± 211.8** | **-961.4 ± 625.0** | -1,270 ± 1,432 | **-1,857 ± 557.4** | **-1,987 ± 1,158** | -1,485 ± 2,857 | -0.2 ± 0.2 | **-0.3 ± 0.3** | **-0.7 ± 0.3** |
| ng++ high-stack (hireFriends) | **-20.2 ± 13.7** | **-28.3 ± 18.1** | **-48.2 ± 22.5** | **-491.4 ± 203.8** | **-614.8 ± 591.9** | **-1,284 ± 1,256** | **-1,627 ± 580.6** | **-1,180 ± 1,150** | -1,504 ± 2,335 | -0.2 ± 0.2 | **-0.3 ± 0.3** | **-0.7 ± 0.3** |
| ng++ mid-stack (no guild) | **+55.8 ± 13.7** | – | – | **-324.8 ± 207.8** | – | – | **-2,127 ± 541.2** | – | – | **+0.8 ± 0.2** | – | – |
