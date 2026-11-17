# Testing & balance runs

How to run the game's automated tests and balance experiments on your own machine, by hand or through an AI agent (Gemini, Claude...).
Everything here is headless: a script plays the game in a hidden Chrome window with a fixed "player" (`tools/lab/bot.js`), so nobody has to click through anything.

- **Quick sanity check after any change:** `npm run build && npm run smoke`
- **Do the numbers still match the design?** `npm run check:quick` (about 20–40 min), then `npm run check` (full size, 1–3 h)
- **One question, one experiment:** `npm run lab -- <experiment>`, e.g. `npm run lab -- races-courtesan`

## 1. One-time setup

1. Install **Node.js 20 or newer** (https://nodejs.org). Check with `node -v`.
2. In the repo folder:
   ```
   npm install
   npx playwright install chromium
   ```
   That fetches Playwright and its own Chromium; nothing else is needed. (To use your own Chrome instead, set `CHROME` to its path, e.g. `CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"`.)
3. Smoke test the setup (takes under a minute):
   ```
   npm run build
   npm run lab -- phases --runs 2
   ```
   You should see a markdown table with `early`, `mid` and `late` rows. If so, everything works.

`node_modules/` and `tools/lab/out/` are git-ignored, so none of this ends up in commits.

## 2. The intent checks (main balance test)

`tools/lab/checks.json` lists the design intents (for example "tidiness is neutral around 70", "demons are the strongest courtesans", "carrying more lovers makes NG+ faster") as automated checks.
`tools/lab/check.mjs` runs the experiments they need and grades each one:

| result | meaning |
|---|---|
| PASS | the intent holds |
| FAIL | it doesn't: a balance problem (or a bad threshold) |
| WARN | a "soft" intent (an aim, not a rule) doesn't hold |
| UNSURE | the average points the right way but the run is too noisy to be sure: rerun at full size or with more seeds |
| NO DATA | the experiment didn't produce that number (usually every run ended early): look at the experiment's report |

```
npm run check:quick                         # 6 seeds per experiment: a fast read, CIs are wide
npm run check                               # full size (12-16 seeds): the one to trust
npm run check -- --only promoter-pays,demons-top-courtesans
npm run check -- --reuse                    # reuse results already in tools/lab/out/ (same spec + enough seeds), rerun only what's missing
npm run check -- --conc 6                   # run 6 games at once (default: CPU cores - 1)
```

**Speed:** set `--conc` to about the number of CPU cores (leave one free if you want to use the machine). On a 2-core cloud box the quick suite took about 25 minutes, so a full run on 2 cores is 1–3 hours; an 8-core desktop with `--conc 7` should be several times faster.
**Warm-up cache:** mid / late / plateau / NG+ experiments first play the game up to their starting point (the warm-up), then branch into variants. That starting state is saved per seed in `tools/lab/out/cache/<code hash>/` and reused by every other experiment and every rerun with the same start, policy and phases, until any file in `js/`, `data/`, `index.html`, `loader.js` or `tools/lab/bot.js` changes (a new hash starts a fresh cache; delete old hash folders whenever). The run prints `(N warm-ups from the cache)`. `--no-cache` turns it off. Campaign and early experiments start at week 1, so they have nothing to cache.
**Load:** `--conc` now defaults to (CPU cores − 1). Each game is a Chrome page; going above the core count doesn't make runs faster and can freeze or crash the machine.

The full report is written to `tools/lab/out/checks.md`; each experiment's own report is `tools/lab/out/<experiment>.md`.

The exit code is 1 when anything FAILs, so a script can tell.

## 3. Single experiments

Specs live in `tools/lab/exp/` (one JSON file per question). Run any of them:
```
npm run lab -- <name> [--runs N] [--conc N] [--only a,b]
```
The most useful ones:

| experiment | question | scenario |
|---|---|---|
| `phases` | what early / mid / late look like at the Lantern | 12-week phases |
| `houses-all` | weeks to pay off the debt from each Cycle-1 house | full cycle 1 |
| `houses-plateau` | what each house earns once built up (after the debt) | 26 weeks post-debt |
| `partners`, `pasts` | starting partner / Sam's background over cycle 1 | full cycle 1 |
| `interactions` | house x partner x past together (does one choice only shine with another?) | full cycle 1 |
| `races`, `races-courtesan`, `races-hire` | race balance: swapped in place, as all-courtesan houses, hiring only that race | mid / late / cycle 1 |
| `race-jobs` | every race in every job (where does each race belong?) | mid |
| `jobs-all`, `roles-comp`, `support`, `support-diag` | job and support-staff value | mid / late |
| `tidiness`, `maids` | tidiness bands, maid count | mid / late / cycle 1 |
| `amenities`, `demon-sigil`, `sanctuary-chapel`, `teacher` | amenity value | mid / late |
| `pricing-campaign`, `pricing-cuts` | price tiers, profit cuts, tutors | cycle 1 / mid / late |
| `sam-actions`, `sam-actions-campaign` | what Sam's spare action is worth | phases / cycle 1 |
| `stat-value` | what +5 to one stat is worth | mid |
| `ngplus-carry`, `ngplus-friends` | lovers / old friends carried into NG+ | cycle 2 |
| `ngplus-boons`, `ngplus-houses`, `ngplus-partners`, `ngplus-pasts`, `ngplus-vars` | NG+ choices | cycle 2 |
| `ngplus-cycles`, `ngplus-loan`, `ngplus-tune` | several NG+ cycles in a row | cycles 2-5 |
| `ngpp` | NG++ (Lantern Shrine) vs standard NG+ | cycles 2-3 |

`tools/lab/README.md` has the full reference: spec fields, scenarios, mutations, policy knobs, every metric.

## 4. Reading the numbers

- **Paired runs.** Every variant of an experiment plays the same seeds (same ladies, clients, events) until its own change makes them diverge. The **Δ** tables are per-seed differences against the base, with a 95% confidence interval: **bold** means the difference is real, plain means it could be noise.
- **Noise floor.** Even a tiny change lets runs drift apart: expect about ±75 gold/week on 12-week totals and about ±3 weeks on campaign length from chance alone. Don't act on non-bold differences.
- **Deterministic.** The same spec and seeds give the same numbers every time. If results change, the game (or the bot) changed.
- **It's one player's view.** The bot is a sensible, not optimal, player (hires to fill every bed, keeps a maid and promoter, adds security when incidents pile up, upgrades beds, buys decor and drinks after the debt). A choice it never makes won't show its value unless a spec turns it on.
- Key metrics: `total`/`net` = gold per week (with / without Sam's own earnings); `weeksToWin` = weeks to clear the debt (a run that never does counts as 104); `winRate`; `perLady` = what one working generic lady earns over her wage; `ngWeeks`/`ngRatio` = NG+ cycle length and its ratio to cycle 1.

## 5. Changing balance numbers safely

1. Try the change as a **patch** first, without editing data files, so it runs side by side with the current numbers:
   ```
   npm run lab -- --inline "{\"name\":\"try-lover-debt\",\"scenario\":\"ngplus\",\"runs\":12,\"ng\":{\"house\":\"wayfarer\",\"past\":\"none\",\"boon\":\"ap\",\"lovers\":3},\"variants\":[{\"name\":\"base\"},{\"name\":\"cheaper lovers\",\"patch\":{\"balance\":{\"ngplus\":{\"perLover\":0.03}}}}]}"
   ```
   (`patch.balance` merges into `data/balance.json`, `patch.economy` into `economy.json`, also `races`, `traits`, `characters`, `houses`.)
   A spec file in `tools/lab/exp/` is easier than inline JSON for anything longer.
2. When a patch looks right, put the numbers into `data/`, run `node tools/fmt-json.mjs`, `npm run build`, `npm run smoke`.
3. Rerun the affected checks (`npm run check -- --only <ids>`) and, before merging, the full suite.
4. Write what changed and the before/after numbers into `docs/BALANCE.md`.

## 6. Instructions for an AI agent running this

- Work on a branch, never on `main`.
- Don't edit `tools/lab/bot.js` or the thresholds in `tools/lab/checks.json` to make a check pass. A FAIL is a finding to report. Change the bot only if it is clearly misplaying (for example, it never hires in some mode), and say so separately.
- After running, report back:
  - the summary line and every non-PASS row from `tools/lab/out/checks.md`
  - for each FAIL, the relevant table from `tools/lab/out/<experiment>.md`
  - anything in an **Errors** block at the top of a report: that's a crash, not balance
- **Report format** (write it to `temp-balance-results.md` at the repo root, replacing the old one, and commit it to the branch):
  1. Header: branch, commit hash, date, machine cores / `--conc`, total run time.
  2. Build & smoke: one line each (`build`, `smoke 30`, `goddess-smoke`), plus any page errors verbatim.
  3. Intent checks: the summary line, then **every** row (PASS too) with its numbers and ± CIs, grouped PASS / FAIL / WARN / UNSURE / NO DATA. Mark rows whose result changed since the last report (**now passing** / **now failing**).
  4. For every experiment run (the checks' own and the extra ones asked for), paste its **full** variant table and paired-Δ table from `tools/lab/out/<experiment>.md`, not just the deltas. Include the `named` / `race` / `job` breakdown tables when the spec has them.
  5. Anything odd: identical variants (Δ 0 ± 0 usually means the setup didn't take effect), `unreached` runs, game overs, runs stopped at the week cap. Say which runs and seeds.
  6. No proposals unless asked: if something looks off, say what and where in one or two lines. If you do test a patch, keep it in a separate section with before/after rows, and don't commit data changes.
- When proposing a tuning change, test it as a patch variant first (section 5) and show the before/after rows. Then rerun the affected checks.
- If the game's code changes in ways the bot uses (hiring, jobs, upgrades, Sam's actions, NG+), keep `tools/lab/bot.js` in sync and rerun `npm run lab -- phases --runs 2` to confirm it still plays.
- Other test scripts: `node tools/goddess-smoke.mjs` (goddess / NG+ flow) and `node tools/story-check.mjs` (all story text), after story or goddess edits.

## 7. Troubleshooting

| problem | fix |
|---|---|
| `Cannot find module playwright` | run `npm install` in the repo folder (or set `PLAYWRIGHT_PATH` to an existing install) |
| `Executable doesn't exist` / browser won't start | `npx playwright install chromium`, or point `CHROME` at an installed Chrome |
| every run says `unreached` | the bot never got to that phase (e.g. a mutation broke hiring): open that experiment's `.md` and the run's `pageErrors` |
| `pageErrors:` in the progress line | a game script threw during play: that's a bug in the game or the bot, worth reporting with the message |
| very slow | lower `--runs` while exploring, raise `--conc` toward your core count; `--reuse` skips experiments already run |

## 8. Current run list (round 4c, 2026-11-17)

On `feat/balance-tuning`, after `npm run build && npm run smoke` and `node tools/goddess-smoke.mjs`:
1. `npm run lab -- nerys` (Nerys after her nerf vs Kaede and her old numbers; `named` breakdown).
2. `npm run check` (full size).
3. Extra experiments, full tables: `npm run lab -- guild`, `sam-focus`, `houses-all`, `ngpp`, `partners`, `walk-partners`, `promoter-value` is covered by the check.
Use `--conc` at most (cores − 1); the default already is. If the machine struggles, `--conc 1` and `--runs 8` still give a usable read.
Expected shifts from round 4, so don't read them as regressions: the bot now walks once a week for partners (cycle 1 and NG+ get faster), the guild bot keeps top earners and sole support staff home, `perLady` now subtracts android charging and counts rest weeks, the promoter check now actually moves a lady; cycle-1 debt is x1.2 (aim: ~28-32 weeks with walk partners).
