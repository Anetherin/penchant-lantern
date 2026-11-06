# Notes for Claude

- Game is plain JS split into classic scripts (shared globals, inline `onclick` handlers). No bundler, no modules.
  Script order is defined in `loader.js` (FILES); `tools/build.mjs` reads the same list. Add new files there.
- Every top-level name is global across files; avoid name clashes (grep before adding).
- Image prompts are always built programmatically (`js/logic/prompts.js`); explicit text belongs only in the
  user's snippet slots / AI templates stored in their browser, never in repo code. All characters are adults;
  `cleanText` / `YOUTH_RE` guard prompts and AI output, so keep those checks in place.
- Save format migrations live in `migrate()` (`js/logic/state.js`); bump `S.v` when changing save shape.
- After changes: `node tools/build.mjs && node tools/smoke.mjs 30` (Playwright; `CHROME=` for a custom browser).
