# Hollowmere Nights (penchant-lantern)

An isekai pleasure-house management sim that runs in the browser and plugs into
[Perchance](https://perchance.org) for image generation (`text-to-image-plugin`) and
optional text generation (`ai-text-plugin`).

## How it's put together

- `loader.js`: injects the stylesheet and page markup, then loads every script in `js/` **in order**.
  The scripts are classic (non-module) scripts that share globals, so order matters; the list lives in `loader.js`.
- `css/style.css`: all styles.
- `js/core`: config (your scene snippets, service categories, defaults) and utilities/storage.
- `js/data`: characters, races, jobs, houses, wardrobe, scenes, named characters.
- `js/logic`: character rules, image prompts, image/text generation, game state, player commands, Sam, weekly simulation.
- `js/events`, `js/stories`: random events, encounters, house storylines, partner romance arcs.
- `js/ui`: everything that draws the screens.
- `perchance/panel.html`: the small shim you paste into Perchance's HTML panel.
- `dist/hollowmere-nights.html`: a single-file build (`node tools/build.mjs`), handy as a fallback paste.

## Perchance setup

1. Lists panel:
   ```
   t2i = {import:text-to-image-plugin}
   ai = {import:ai-text-plugin}
   ```
2. HTML panel: paste the contents of `perchance/panel.html`.
3. GitHub Pages must be on: repo **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
   (Pages on a *private* repo needs a paid GitHub plan; on the free plan, make the repo public.)
   After that, every push to `main` goes live within a minute or two, and the shim picks it up on the next page load.

Saves, settings, scene snippets and generated images live in the browser's storage on the
Perchance page, not in this repo.

## Development

- Open `index.html` locally (generation is disabled outside Perchance).
- `node tools/build.mjs` to rebuild the single-file version.
- `node tools/smoke.mjs [weeks]` plays the game headlessly and fails on any page error (needs Playwright).
