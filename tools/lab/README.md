# Balance lab

Headless, seeded balance testing. One command runs an experiment spec and prints a markdown report. No subagents and no manual play needed.

```
node tools/lab/lab.mjs races            # tools/lab/exp/races.json
node tools/lab/lab.mjs jobs --runs 24 --conc 2
node tools/lab/lab.mjs races --only elf,demon
node tools/lab/lab.mjs --inline '{"scenario":"late","each":{"patch.balance.rooms.perRoom":[6,10]}}'
```

Reports go to stdout and `tools/lab/out/<name>.md` (plus the raw `.json`; `out/` is git-ignored).
A run is ~2 s per simulated year on this machine, so most specs take 1–5 minutes.

## How it works

- `lab.mjs` serves the repo, opens the game in headless Chrome (Playwright), swaps `Math.random` for a seeded
  generator **before** the game loads, then injects `bot.js` and calls `LAB.run(job)` once per (variant, seed).
- **Paired runs.** Every variant uses seeds 1..N. At the start of the measured phase the RNG is reseeded the same way
  for every variant, so variants of one seed share the same ladies, clients and events up to the point their changes
  make things diverge. The report's Δ columns are per-seed differences against the base (mean ± 95% CI), and
  **bold** means the CI excludes zero. That is why 12–16 seeds are usually enough.
- **Shared warm-ups.** For `mid`/`late`/`ngplus`, the warm-up (playing up to the phase) is identical for every variant
  of a seed, so it runs once and later variants start from a snapshot (checked: snapshot == full replay).
- Runs are deterministic: same spec + seeds = same numbers. Change the game, rerun, compare.

## Scenarios

| scenario | start | measured |
|---|---|---|
| `campaign` | new game | until the debt is paid (or `weeks`, default 104). Reports phase entry weeks and net per phase. |
| `early` | new game; policy capped at 4 ladies, no upgrades, no extra rooms | `weeks` (default 12) |
| `mid` | first week the home house has `phases.midStaff` (5) ladies | `weeks` (12) |
| `late` | first week the home house is out of space (rooms full) | `weeks` (12) |
| `ngplus` | cycle 1 played to the win, then NG+ with `ng` choices | cycle 2 until won (max 104) |

A run that never reaches its phase is counted as "unreached" (warm-up cap `maxWarm`, default 104 / 160 for NG+).

## Spec fields

```jsonc
{
  "desc": "...", "scenario": "mid", "weeks": 12, "runs": 16,
  "start":  { "house": "lantern", "partner": "kaede", "past": "salaryman" },
  "policy": { ... },                 // overrides LAB.POLICY in bot.js (see below)
  "phases": { "midStaff": 5 },
  "patch":  { "balance": {...}, "economy": {...}, "races": {...}, "traits": {...}, "characters": {...} },
  "patchAt": "phase",                // or "start" (whole game; disables the shared warm-up)
  "mutate": { ... },                 // applied at phase start, see below
  "ng":     { "boon": "ap", "partner": "auto", "past": "none", "house": "wayfarer" | "none" | "auto", "keep": "all" | "home", "perk": "...", "romance": "keep" | "reset" },
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
- `gold`, `rep`, `trust` (added to everyone), `sam: {charm: 10}`, `upgrades: ["bath"]`.

## The policy (the bot "player")

`LAB.POLICY` in `bot.js`. A sensible, not optimal player: hires the cheapest candidates up to 10 per house, buys
bedrooms when clients are turned away, beds/quarters to fit hires, amenities in order (bar, garden, stage, bath, guard)
once a house has 5 ladies; keeps 1 maid + 1 promoter, one lady per amenity job, everyone else courtesan-first and
re-sorted weekly; rests ladies under 30% energy; keeps a reserve for costs and the next payment; pays the debt off
early when it can. Sam makes the rounds when anyone is under 35 trust, walks with his partner once a week, and
tends bar otherwise. Event choices are random (seeded), except Contract Renewal (renew).

Because every variant uses the same player, results are comparisons, not absolute truths: a choice the bot never makes
(feasts, training, dates with others, decor) won't show its value unless a spec turns it on.
If the bot does something silly, fix the policy and rerun everything; `policy` overrides make it easy to test
"what if the player did X".

## Reading the numbers

- `net` = income − wages − upkeep per week; `perLady` = what a working generic lady earns on her own ledger minus wage.
  Promoters, maids, security and attendants mostly help others, so judge jobs by **Δ net** in `jobs.json`, not `perLady`.
- `midAt`/`lateAt` = week the phase started; `winWeek` = week the debt was cleared; `missed` = missed payments;
  `left` = ladies who quit; `over` = share of game overs.
- Race tables cover generic ladies only (named ladies have hand-made stats).
