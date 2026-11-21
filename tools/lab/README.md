# Balance lab

Headless, seeded balance testing. One command runs an experiment spec and prints a markdown report. No subagents and no manual play needed.

```
node tools/lab/lab.mjs races            # tools/lab/exp/races.json
node tools/lab/lab.mjs jobs --runs 24 --conc 2
node tools/lab/lab.mjs races --only elf,demon
node tools/lab/lab.mjs --inline '{"scenario":"late","each":{"patch.balance.rooms.perRoom":[6,10]}}'
node tools/lab/check.mjs                # every design intent in checks.json, PASS/FAIL table (exit 1 on FAIL)
node tools/lab/check.mjs --quick        # 6 seeds per experiment, for a fast smoke check
node tools/lab/check.mjs --only promoter-pays --reuse   # reuse out/<exp>.json from an earlier run
```

Files: `run.mjs` (engine: `runSpec`), `lab.mjs` (CLI), `bot.js` (the in-page player), `report.mjs` (metrics + tables),
`check.mjs` + `checks.json` (intent checks), `exp/` (specs).

Reports go to stdout and `tools/lab/out/<name>.md` (plus the raw `.json`; `out/` is git-ignored).
A run is ~2 s per simulated year on this machine, so most specs take 1–5 minutes.

## How it works

- `lab.mjs` serves the repo, opens the game in headless Chrome (Playwright), swaps `Math.random` for a seeded
  generator **before** the game loads, then injects `bot.js` and calls `LAB.run(job)` once per (variant, seed).
- **Paired runs.** Every variant uses seeds 1..N. At the start of the measured phase the RNG is reseeded the same way
  for every variant, so variants of one seed share the same ladies, clients and events up to the point their changes
  make things diverge. The report's Δ columns are per-seed differences against the base (mean ± 95% CI), and
  **bold** means the CI excludes zero. That is why 12–16 seeds are usually enough.
- **Shared warm-ups.** For `mid`/`late`/`ngplus`/`plateau`, the warm-up (playing up to the phase) is identical for every variant
  of a seed, so it runs once and later variants start from a snapshot (checked: snapshot == full replay).
- Runs are deterministic: same spec + seeds = same numbers. Change the game, rerun, compare.

## Scenarios

| scenario | start | measured |
|---|---|---|
| `campaign` | new game | until the debt is paid (or `weeks`, default 104). Reports phase entry weeks and net per phase. |
| `early` | new game; policy capped at 4 ladies, no upgrades, no extra rooms | `weeks` (default 12) |
| `mid` | first week the home house has `phases.midStaff` (5) ladies | `weeks` (default 12) |
| `late` | first week the home house is out of space (rooms full) | `weeks` (default 12) |
| `plateau` | cycle 1 played to the win (shared warm-up) | `weeks` (default 26) post-debt weeks: what a built-up house earns |
| `ngplus` | cycle 1 played to the win, then NG+ (or NG++ when `bindGoddess` / bound) with `ng` choices | cycle 2+ until won (max 104 per cycle) |

A run that never reaches its phase is counted as "unreached" (warm-up cap `maxWarm`, default 104 / 160 for NG+).

## Spec fields

```jsonc
{
  "desc": "...", "scenario": "mid", "weeks": 12, "runs": 16,
  "start":  { "house": "lantern", "partner": "kaede", "past": "salaryman" },
  "policy": { ... },                 // overrides LAB.POLICY in bot.js (see below), from week 1
  "phasePolicy": { ... },            // policy overrides from the phase start only (warm-up stays shared)
  "phases": { "midStaff": 5 },
  "patch":  { "balance": {...}, "economy": {...}, "races": {...}, "traits": {...}, "characters": {...}, "houses": {...} },
  "patchAt": "phase",                // or "start" (whole game; disables the shared warm-up)
  "mutate": { ... },                 // applied at phase start, see below
  "ng":     { "boon": "ap" | [per cycle], "partner": "auto", "past": "none", "house": "wayfarer" | [per cycle] | "none" | "auto" (first offer) | "best" (LAB.HOUSE_RANK),
              "keep": "all" | "home", "lovers": n, "friends": n, "perk": "...", "romance": "keep" | "reset",
              "challenge": "none" | "...", "vesselForm": "...", "bindGoddess": true, "divinity": 5, "love": 70 },
  "cycles": 4,                       // ngplus: number of NG+ cycles to play (cN* columns per cycle)
  "variants": [ { "name": "base" }, { "name": "x", "patch": {...} } ],
  "each":   { "mutate.race": ["elf", "demon"] },     // one variant per value (cartesian over several keys); adds "base"
  "by":     { "scenario": ["mid", "late"] },         // repeat everything per value; deltas vs that group's base
  "columns": [...], "delta": [...],                  // report columns (defaults per scenario kind)
  "breakdown": ["race", "job", "named"], "breakdownFor": ["base"]
}
```

`each`/`by` take any dot path into a variant (`start.house`, `policy.hireRace`, `patch.balance.jobs.barProps`, `ng.boon`...).

### Mutations (`mutate`)

- `race: "elf" | "beastkin/fox"`, `raceWho: "all" | n`: generic ladies in the home house become that race (same lady:
  live race mods/fx apply, lewdness shifts by the race difference, `raceFit`, wage recomputed).
- `job: "dancer"`, `jobWho: n | "generics" | "everyone"`, `force`: lock ladies into a job (needed amenity granted free).
  Without `force` she only takes it once `canDo` allows; with `force` she's put there regardless.
- `gold`, `rep`, `prestige`, `trust` (added to everyone), `minTrust`, `sam: {charm: 10}`, `upgrades: ["bath"]`, `incense: "calm"`.
- `bindGoddess: true`, `divinity`, `love`: binds Seliora at phase start.
- `statAll: 5`, `stat: {beauty: 5}`, `skillAll: 5`: add to every lady (0-100 scale), for pricing a stat point (`stat-value.json`).
- `race` also grants the race's needed amenity (Tethering Stone, Charger) free; `raceNew: true` makes later hires in the measured weeks that race too.
- `holdTidy: 70`: every house's tidiness is reset to this before each measured week (tests the tidiness bands in isolation).
- `jobWho: "generics"` locks every generic lady (used to slice to none).
- NG+ only (`ng`): `lovers: n` = exactly n Devoted going in (partner first, then by trust; set to max trust, but their training is only what they really got); `friends: n` = n generics at max trust.
- NG+ / NG++ past lives (`ng`): `guestAlumni: {count, stacks}` (or a list of batches) = reborn guests waiting in `S.alumni` (old friends, from the same returner roll);
  `guestLives` (NG+ `ng` or `ngppPrep`) = guests remembered in `S.lives`: they turn up reborn through the weekly returner roll (`ngplus.friends.chance`, shared with old friends) and on walks at `visits.reborn` odds;
  `ngppPrep.partnerLives` = partners remembered as past lovers (`count: "all"` takes every one). A list of batches models earlier cycles, e.g. `[{count:3,stacks:5},{count:3,stacks:4},...]`.
  See `exp/ngpp-guests.json`.
- `patch.guestVisits` patches `data/guests → visits` (`chance` per candidate slot, `reborn`, `stayWeeks`, ...).

## The policy (the bot "player")

`LAB.POLICY` in `bot.js`. A sensible, not optimal player: hires the cheapest candidates until every bed is taken and no room is left for more staff quarters (`maxStaff: null`; set a number to cap it), repairs damaged rooms and buys
bedrooms when clients are turned away, buys beds/quarters to fit hires, buys amenities in order (`bar`, `garden`, `stage`, `bath`, `guard`, plus `sigil` when a demon is in the house)
once a house has 5 ladies; keeps 1 maid + 1 promoter, one lady per amenity job, everyone else courtesan-first and
re-sorted weekly; rests ladies under 30% energy;
**adapts to the weekly report**: keeps 1 security lady once a house averages `secWhen` (1) incidents a week, a second maid while tidiness averages under `tidyFloor` (55),
and once the debt is cleared buys drinks tiers when flush (`classUpkeep: 'afterDebt'`; during the debt it cost ~3.4 weeks of payoff for +300/wk late net);
fills support roles with the best-suited, lowest-earning lady (partners last);
upgrades staff bed quality when flush (`bedTier: 'auto'`: up to Feather beds during the debt, Luxury after); in NG++ walks for staff until a house has `ngppWalkUntil` (10) ladies;
leaves demons' Feeding only / auto-stud off unless `demonFeedOnly` / `demonAutoStud` are set; keeps a reserve for costs and the next payment; pays the debt off
early when it can. Optional policy knobs cover `drinks`, `incense`, `price`, `cut`, `tutor`/`tutorTier`, `teachSkill`, and hiring priority: `hireFriends` (old friends first), `hireReborn` (anyone with Reincarnated stacks, most first), `hireGuests` (guests over generics; on by default). Rows carry `guests` / `guestsReborn` (guests on staff, and those with stacks; per cycle `rNguests`).
Sam handles goddess nights when needed, makes the rounds when anyone is under 35 trust, dates his partner once a week, walks in NG++ when short on staff, and
does `samDefault` otherwise (`bartend | security | books | scout | rounds | lesson | statclass | trainStat | trainSkill | trainService | demo | walk | orgy | date | rest`), scouting
instead while a house has under `scoutWhenShort` ladies and few affordable candidates.
**Guild** (`guild: 'auto'`): registers once the home house has `guildAt` (4) ladies, takes the best gold-per-week offer the free ladies can finish in time (x `guildSafety`), keeps up to `guildContracts` (1) running with at most `guildLadies` (2) away (`guildPick`: `support` sends non-courtesans and low earners first, `fighters` the strongest), and sends Sam (`guildSam: 'auto'`) only when the ladies alone wouldn't finish. Rows add `guild` (contract gold), `grank` and `gaway`. `"policy": {"preset": "noGuild"}` turns it off. Contract numbers are a first pass: see `tools/lab/exp/guild.json`. Houses are managed emptiest first. Event choices are random (seeded), except Contract Renewal (renew) and affordable walk recruits.

`"policy": {"preset": "legacy"}` restores the fixed pre-2026-11-16 player (10 ladies per house, no security, no second maid, no bed or class upkeep, no guild) for comparing with old notes.

Because every variant uses the same player, results are comparisons, not absolute truths: a choice the bot never makes
(feasts, cuts, tutoring, dates with others) won't show its value unless a spec turns it on.
If the bot does something silly, fix the policy and rerun everything; `policy` overrides make it easy to test
"what if the player did X".

## Reading the numbers

- **Noise floor.** Measured with A/A runs (2026-11-16, 16 seeds): a no-op variant gives exactly 0, but any real change, even +1 gold, lets runs diverge.
  Expect about ±75 g/week on 12-week `total`/`net` and about ±3 weeks on `weeksToWin` from chaos alone. Read only **bold** deltas; the CI shrinks with √runs, so halving it takes 4x the seeds.
- `weeksToWin` = week the debt was cleared, counting a run that never cleared it (game over or out of weeks) as the cap (104), so a change that causes game overs can't look faster. `winRate` = share of runs that won.
  The old `winWeek` (winners only) is still available as a column. NG+: `ngWeeks` (same, for the first NG+ cycle), `cNweeks` per cycle, `ngRatio` = NG+ cycle length / cycle-1 length.
- `worth13` / `worth20` = gold minus remaining debt at week 13 / 20: every run has these (unlike `gold26`, which only counted runs still going).

- `net` = income − wages − upkeep − recharging − cuts − tutors per week; `perLady` = what a generic lady earns on her own ledger minus wage and (androids) charging fees, per lady-week; her rest weeks count too.
  Promoters, maids, security, hosts and attendants mostly help others, so judge jobs by **Δ net** in `jobs.json` / `jobs-all.json`, not `perLady`.
- `midAt`/`lateAt` = week the phase started; `winWeek` = week the debt was cleared; `missed` = missed payments;
  `left` = ladies who quit; `over` = share of game overs.
- Race tables cover generic ladies only (named ladies have hand-made stats). `breakdown: ["racejob"]` splits by race and job; `breakdownFor: "*"` pools every variant.

## Intent checks (`check.mjs`, `checks.json`)

Each check states a design intent in words and what should hold, against one experiment (a spec name or an inline spec).
Several checks can share an experiment; it runs once. Expectation types: paired `delta` vs base, `mean`, `compare` (group means),
`compareDelta` (whose Δ is bigger), `rank` (top N). Bounds can be numbers, `"-10%"` of the base mean, or `"@metric"`.
`sig: true` demands the 95% CI clear the bound (PASS) and reports UNSURE when the mean is right but the CI isn't; `soft: true` turns FAIL into WARN for aims rather than rules.
Thresholds in `checks.json` are first guesses: tune them as the design settles, and add a check whenever you decide how something should feel.
