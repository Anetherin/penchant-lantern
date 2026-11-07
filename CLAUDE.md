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
- Image prompts are always built programmatically (`js/logic/prompts.js`). The user writes any explicit wording
  themselves in `data/snippets.json` / `data/ai-prompts.json`; Claude doesn't author it. All characters are adults;
  `cleanText` / `YOUTH_RE` guard prompts and AI output, so keep those checks in place.
- Firsts with Sam: `js/events/firsts.js` + `data/firsts.json`. `canSam` = comfort (`samStance`) AND crossed (`actTier(id) <= w.intim`).
  Every path that leads to private time (dates, encounters, arcs, bonds) goes through `canSam`/`bestSamAct`, so keep it that way.
  Story moments can carry their own image `{comp, setting, sam}` → `dynScene(key, img)` (js/data/scenes.js).
- Job preferences are per lady (`w.jobLikes`/`w.jobDislikes`; named ones from `jobs` in characters/guests.json, others rolled by `rollJobPrefs`).
- New Game+ lives in `js/logic/ngplus.js` (tuning: `balance.json → ngplus`). Houses with `ngplus: true` in economy.json only appear
  from cycle 2; their stories are in `js/stories/ngplus-houses.js`. Debt payments count from `S.debt.start` (`debtWeek()`).
- Save format migrations live in `migrate()` (`js/logic/state.js`); bump `S.v` when changing save shape.
- After changes: `node tools/build.mjs && node tools/smoke.mjs 30` (Playwright; `CHROME=` for a custom browser).
