# Notes for Claude

- Game is plain JS split into classic scripts (shared globals, inline `onclick` handlers). No bundler, no modules.
  Script order is defined in `loader.js` (FILES); `tools/build.mjs` reads the same list. Add new files there.
- Every top-level name is global across files; avoid name clashes (grep before adding).
- Editable text/numbers live in `data/*.json`; `loader.js` (DATA_FILES) fetches them into `window.PL_DATA` before any
  script runs, and `tools/build.mjs` inlines them. New data file → add it to DATA_FILES. Keep `_readme` keys current.
  Logic-heavy content (house stories, encounter choices) stays in JS. Random events keep their logic in
  `js/events/random.js` but take all wording from `data/events.json` via `ET(...)`.
  Partner arcs (`data/arcs.json`) use a small declarative effect schema, resolved by `resolveEff()` in `js/stories/partners.js`.
  Bond events and shared scenes (`data/bonds.json`) are resolved by `applyBondChoice()` in `js/events/bonds.js`.
  Crossover/visiting ladies live in `data/guests.json` (packs, merged into NAMED as role 'drifter' by `charData()` in
  `js/core/config.js`); keys must stay unique across characters.json and guests.json.
  Run `node tools/fmt-json.mjs` after editing data files programmatically.
- Image prompts are always built programmatically (`js/logic/prompts.js`). The user writes any explicit wording Claude is uncomfortable with
  themselves in `data/snippets.json` / `data/ai-prompts.json`; All characters are adults;
- Firsts with Sam: `js/events/firsts.js` + `data/firsts.json`. `canSam` = comfort (`samStance`) AND crossed (`actTier(id) <= w.intim`).
  Every path that leads to private time (dates, encounters, arcs, bonds) goes through `canSam`/`bestSamAct`, so keep it that way.
  Story moments can carry their own image `{comp, setting, sam}` → `dynScene(key, img)` (js/data/scenes.js).
- Job preferences are per lady (`w.jobLikes`/`w.jobDislikes`; named ones from `jobs` in characters/guests.json, others rolled by `rollJobPrefs`).
- New Game+ lives in `js/logic/ngplus.js` (tuning: `balance.json → ngplus`). Sam keeps ONLY his home house (with its upgrades; `h.spent` tracks improvement
  spending, new debt = home debt share + `spent` x `improveShare`); other houses are sold. Only Devoted lovers carry over (wages again, stats reset, popularity 0,
  each picks one `ngPerk` trait stored in `w.ngPerks`); everyone else leaves and named ladies return to their pools. Houses with `ngplus: true` in economy.json
  and partners with `ngplus: true` in characters.json only appear from cycle 2 (`houseOffered` / `partnerOffered`); house stories are in `js/stories/ngplus-houses.js`.
  Debt payments count from `S.debt.start` (`debtWeek()`); `payOffDebt()` pays it all at once (same win flow via `checkEnd`).
- House ladies (role `house`) are gated by their house story: `houseGate(w)` / `capTrust(w)` cap trust at 35 + 15 x beat (`balance.json → houseGate`), enforced in
  `gainTrust`, endWeek and `save()`. Clothes: outfits Sam buys go to the shared `S.houseWardrobe` (underwear: `S.houseUnder`); use `ownsOutfit/ownsUnder`, never `w.owned` alone;
  `giftHouseItem()` gives a piece to a lady (counts as a gift); prices go through `outfitCost()` (`balance.json → wardrobe`).
- Stats, `tech` and service skills run 0-1000 (`SKL`, `s100(v)` back to the old 0-100 scale, `clampK`); data files stay 0-100 and
  are converted at creation (`genWorker`, `makeNamed`). Anything that reads a stat/skill in a formula goes through `s100()`.
- Effects engine: `js/logic/fx.js` (`fxMul/fxAdd/fxHas/fxSub/fxArr`) merges effects from traits (`data/traits.json`), race + beastkin
  sub (`data/races.json`), body (`data/body.json`), `w.unique` and `w.ngPerks`. Vocabulary is in the `_readme` of traits.json.
  Developable traits (`earn`) are checked weekly from `w.counts` (`countUp(w,key)`); old service ids are aliases (`ACT_ALIAS` in config.js: caress→kiss, manual→manual_give, oral→oral_give,
  paizuri→breast_give); two-way services are `_give`/`_get` pairs. Lewdness (and `th`, `dress.fullAt`, `lewdMin`) stays 0-100.
- Jobs (docs/OVERHAUL.md §5-6): `companion`/`reception` are gone (migrated to courtesan/promoter). Courtesan, dancer and bath are `must` (economy.json jobs): they serve
  propositions from their menu; every other role accepts by `propDecide()` (week.js: lust, `w.offDuty` on/ask/off) and loses 8% output per accepted proposition (`outputMult`).
  Tunables are in balance.json (`jobs`, `rooms`, `tidy`, `rep`, `props`). Rooms: `h.rooms x 8` sessions/week (`X.roomOK/useRoom` in `simHouse`); `h.tidy` is kept by maids.
- All services (escorts, propositions, reckless self-propositions) go through `runService()` -> `serveAct()`; refusals may trigger `pushyCheck()` (security, then Sam, then nobody).
  Reputation gains use `repAdd(h, n)` (scaled by `repGain`); `w.samples` (promoter) and `w.madameFocus` ('training'|'management') are set from the sheet.
- Trust stays 0-100 internally and in data, but the UI shows it x10 (out of 1000): use `tShow(v)` / `tDelta(n)` (util.js) for any trust number shown to the player.
  `minorTrust(w)` (balance.json → trust.minor) is the floor every activity with Sam builds. Madame focus: training | management | care (care = trust per day, trust.madameCare).
- NG+ extras: each cycle Sam takes a new house (`NGS.house`, debt x newHouseShare) and may add a past life (`S.pasts`; use `hasPast(k)` / `samPasts()` / `pastPick(map)`, never `S.past`).
  Carried ladies gain `w.reborn` stacks (Reincarnated, `rebornFx` in fx.js, balance.json → ngplus.reborn).
- Pushy clients security can't handle become `samcall` and one `pushyEvent` decision after the report (step in / town watch / let her handle it).
- Bars (`bar()`) fill to HER max (`trustBar`, `lustBar`). Bath scenes (`bath:true`) use the house bathhouse if built; only `bath:true` outfits stay on. `undress` on a scene sets invitation dress level.
  AI text `{outcome}` comes from `aiOutcome()` + ai-prompts.json → outcomes (finish / satisfied / frustrated / demon feed & drain).
- Save format migrations live in `migrate()` (`js/logic/state.js`); bump `S.v` when changing save shape.
- After changes: `node tools/build.mjs && node tools/smoke.mjs 30` (Playwright; `CHROME=` for a custom browser).
