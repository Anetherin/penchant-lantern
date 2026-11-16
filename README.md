# Hollowmere Nights (penchant-lantern)

An isekai pleasure-house management sim that runs in the browser and plugs into
[Perchance](https://perchance.org) for image generation (`text-to-image-plugin`) and
optional text generation (`ai-text-plugin`).

## How it's put together

- `loader.js`: injects the stylesheet and page markup, loads `data/` sets into `window.PL_DATA`, and loads every script in `js/` **in order**.
  The scripts are classic (non-module) scripts that share globals, so order matters; the list lives in `loader.js`.
- `data/`: **the files you edit by hand.** Each starts with a `_readme` explaining its fields (for a folder, in its `base.json`).
  The big sets are folders of smaller files: `data/<name>/index.json` lists the parts, which are merged in that order
  (objects key by key, lists joined end to end). To add a part (say a new guest pack), create the file and add its name
  to `index.json`; a scalar defined in two parts is an error in `node tools/build.mjs`.
  | File / Folder | What's in it |
  |---|---|
  | `services.json` | Services: thresholds, prices, stat weights, AI description, image poses per context (client / Sam / two ladies), report lines |
  | `snippets.json` | Your own image wording for POV, bath, mishap, solo and duo scenes, and how each clothing state is described |
  | `ai-prompts.json` | The prompts sent to the AI text plugin, plus style guidance and outcome cues |
  | `characters/` | Named ladies, their outfits and starting bonds (`house`, `partners`, `story` = story + guild ladies) |
  | `guests/` | Visiting/crossover ladies, one file per pack |
  | `firsts/` | Firsts with Sam: shared rules + templates in `base`, then each lady's own scenes by group (`house`, `partners`, `story`, one file per guest pack) |
  | `arcs/` | Partner romance arcs, one file per partner |
  | `afterstories/` | Post-house-story epilogues & house-joiner arcs (`joiners`, `residents_c1`, `residents_ngp`) |
  | `bonds.json` | Bonds between ladies, their events, shared scenes, dynamics, and double dates |
  | `regulars.json` | Regular clients: names, quirks, event text |
  | `personalities.json` | Personalities, stat leans, preferences, and expression shifts |
  | `races.json` | Races, beastkin/angel subs, stat mods, fx, client like/dislike, appearance rules |
  | `traits/` | Traits (`general`, `earnable`, `ngperks`) and `fx` schema in `base.json` |
  | `titles.json` | Honorifics/ranks, perks, and earnable/story titles |
  | `body.json` | Bust, height, figure options, prompt wording, and effects |
  | `people.json` | Generic names, appearance pools, accessories, expressions, hooks, gifts, client descriptions |
  | `wardrobe.json` | Outfits, undergarments, colors |
  | `scenes.json` / `dates.json` | Image scenes and backdrops; date types with their text, stats, and images |
  | `walks.json` | Sam's walk encounters: goddess disguises/strolls, casual encounters, partner/guest openers, town events |
  | `economy.json` | Jobs, job slots, houses (class/prestige, perks, repairs), upgrades, decor/drinks, prices, client classes, Sam's past lives |
  | `events.json` | Random events, chats and gifts |
  | `flavor/` | Random lines per personality: `sam` (private time, lovers, nights, gifts), `jobs`, `encounters` (clients, pushy clients), `training` |
  | `goddess/` | The goddess (`base`), her disguise teases (`teases`), and dedicated house/partner/shrine/vessel intros (`intros`) |
  | `balance.json` | Tuning numbers across all systems (lust, training, jobs, prestige, amenities, clients, walks, NG+/NG++, goddess, debt) |

  If the page says a file isn't valid JSON, look for a missing comma or quote. `node tools/fmt-json.mjs` tidies them.
  Style rules for scene text (voice, wording, which lines may name an act) are in `docs/WRITING.md`.
- `css/style.css`: all styles.
- `js/core`: config (scene snippets, service categories, defaults) and utilities/storage.
- `js/data`: characters, races, jobs, houses, wardrobe, scenes, named characters.
- `js/logic`: character rules, effects (`fx`), titles, image prompts, AI/image generation, state, player commands, Sam, dates/demos/orgies, spending (tutors/gifts/cuts), Sam's home/feasts, services & propositions, weekly simulation, New Game+, goddess.
- `js/events`, `js/stories`: random events, regulars, bonds, firsts, encounters, walks; house stories, partner arcs, after-stories, intros, NG+ house stories.
- `js/ui`: main screens (`core`), lady sheet (`sheet`), weekly report (`report`), wardrobe modal (`wardrobe`), settings (`settings`).
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

Saves, settings and generated images live in the browser's storage on the Perchance page, not in this repo.
Scene snippets, AI prompts and flavor text live in `data/`, so anyone who can see the repo can read them.

## Development

- Serve the folder and open `index.html` (e.g. `python3 -m http.server`, then http://localhost:8000). Opening it
  as a file won't work, because the browser blocks loading `data/*.json` from disk. Generation is disabled outside Perchance.
- `node tools/build.mjs` to rebuild the single-file version (`dist/hollowmere-nights.html`).
- `node tools/smoke.mjs [weeks]` plays the game headlessly and fails on any page error (needs Playwright).
- `node tools/goddess-smoke.mjs [weeks per cycle]` runs the goddess arc through binding and ending headlessly.
- `node tools/lab/lab.mjs <spec>` runs seeded, paired balance experiments (see `tools/lab/README.md`).
