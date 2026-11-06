# Notes for Claude

- Game is plain JS split into classic scripts (shared globals, inline `onclick` handlers). No bundler, no modules.
  Script order is defined in `loader.js` (FILES); `tools/build.mjs` reads the same list. Add new files there.
- Every top-level name is global across files; avoid name clashes (grep before adding).
- Editable text/numbers live in `data/*.json`; `loader.js` (DATA_FILES) fetches them into `window.PL_DATA` before any
  script runs, and `tools/build.mjs` inlines them. New data file → add it to DATA_FILES. Keep `_readme` keys current.
  Logic-heavy content (random events, house stories, encounter choices) stays in JS; their effects are code.
  Partner arcs (`data/arcs.json`) use a small declarative effect schema, resolved by `resolveEff()` in `js/stories/partners.js`.
  Run `node tools/fmt-json.mjs` after editing data files programmatically.
- Image prompts are always built programmatically (`js/logic/prompts.js`). The user writes any explicit wording
  themselves in `data/snippets.json` / `data/ai-prompts.json`; Claude doesn't author it. All characters are adults;
  `cleanText` / `YOUTH_RE` guard prompts and AI output, so keep those checks in place.
- Save format migrations live in `migrate()` (`js/logic/state.js`); bump `S.v` when changing save shape.
- After changes: `node tools/build.mjs && node tools/smoke.mjs 30` (Playwright; `CHROME=` for a custom browser).
