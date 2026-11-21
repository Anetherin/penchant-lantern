# Adding characters and houses

A checklist for each kind of new content: every file to touch, what goes there, and how long it should be.
Most of the game is data, so a new partner, guest or story lady needs no code. A new house needs a little JS for its story.

**Before you start**

- Copy an existing entry of the same kind and rewrite it. That is the fastest way to get every field right. Good
  templates: Nerys or Lirael (partners), Vesper or Maris (house residents), The Pearl Grotto (New Game+ house),
  Ines (story lady), Vesna (guild lady), the Shantae pack (a small guest pack).
- Field-by-field docs live in each file's `_readme` (for a folder, in its `base.json`). This page tells you *which* files;
  the `_readme` tells you *what each field means*.
- Keys are lowercase with no spaces (`nerys`, `pearl`) and must be unique across `data/characters/` and `data/guests/`.
- All scene text follows `docs/WRITING.md`: second person ("you" = Sam), plain explicit words, and nothing more intimate
  than the game plays at that point. Every character is an adult, and minors should be aged up as appropriate.
- Stats, skills, lewdness and trust in data files are on the `0-100` scale (the game converts stats to `0-1000`). Fill in
  all 8 stats (`beauty, charm, charisma, refinement, wits, stamina, strength, agility`); nothing seeds missing ones.
- `image` objects (`comp`, `setting`, `sam`...) describe pose, action and place only. Her hair, eyes, horns, outfit and
  build are added by the code from her `design`, so don't repeat them there (`story-check` flags hair/eye colours).
- After editing data by script, run `node tools/fmt-json.mjs`.

## Length targets

Word counts are prose only (no `image`, `design` or `outfits` text), measured from the current cast. Aim for the middle.

| Piece | Where | Typical length |
|---|---|---|
| Partner character entry (backstory, partner story, blurb, 4 vignettes, goddess comment) | `characters/partners.json` | 550–700 |
| Partner backstory alone | same | 65–120 |
| Partner intro (partner select / new partner at rebirth) | `goddess/partner-intros.json` | 620–690 |
| Partner walk meeting | `walks/partners.json → partnerIntros` | 200–250 |
| Partner NG++ return lines / hire | `walks/partners.json → partnerMemoryLines` / `partnerMemoryHire` | 190–230 / 70–115 |
| Romance arc (6 beats, with intimacy variants) | `arcs/<key>.json` | 2,000–3,100 (partners), ~3,000–3,900 (guild ladies) |
| Firsts with Sam | `firsts/<group>.json` | 210–390 (partners, house ladies), 350–550 (story ladies, guests) |
| House resident entry / backstory | `characters/house.json` | 70–100 / 35–65 |
| House after-story (resident, 2–3 beats) | `afterstories/residents_*.json` | 780–850 |
| Story-lady entry / after-story | `characters/story.json`, `afterstories/joiners.json` | 80–220 / 1,000–1,150 |
| House story (all chapters) | `housestories/<part>.json` | 1,000–1,450 (5 chapters starter, 4 NG+) |
| House intro | `goddess/intros.json → houseIntros` | 430–520 |
| House economy entry (desc, perk, goddess remark) | `economy.json → houses` | 60–130 |
| Guest entry (backstory etc.) | `guests/<pack>.json` | 65–150 |

Repeatable content (dates, encounters, bond events) can be shorter than story beats.

## Every named lady

Whatever her role, a named lady needs:

1. **Her character entry**: role-specific file below. Core fields: `name` (no honorific), optional `title`, `race` (+ `sub`),
   `age`, `personality` (a key in `personalities.json`), `traits`, `style`, `favColor`, `fav` / `dislike` / `lovers`
   (service ids), `backstory`, `design` (appearance for image prompts), `under`, `stats`, `tech`,
   `actSkill`, `popularity`, `lewd`, `trust`, `outfits` (`sig_<key>` start outfit, optional `sp_<key>` special), `jobs`
   (`likes` / `dislikes`), `body` (`bust`, `height`, `figure`), `unique` (`{name, desc, fx}`, effect keys from
   `traits/base.json`). Optional: `bonds`, `keepOn`.
2. **Her firsts with Sam**: `data/firsts/<group>.json → characters.<key>`: `pace`, `path`, `init`, and an event per
   stage in her path (`1` kissing, `2` hands and mouth, `3` everything; optional `pent` and `jump`). Without an entry she
   falls back to the shared templates, which works but feels generic.
3. **Optional, any role:**
   - A title (`data/titles.json`). Arc and house titles are granted on completion (`arc: '<key>'` / `house: '<id>'`).
     Prefer making it an upgrade of a matching tier-1 title with `from` (see `titles.json → _readme`), so she
     doesn't pile up titles. A seeded title (`title` in her entry) must be a title label or id to carry a perk.
   - Bonds: `bonds` in her entry (starting relationships) and pair events in `data/bonds.json` (`pair: [a, b]`).
   - Guild fit: add her title or traits to a contract's `fits` in `data/guild/base.json`.

## A partner

Partners are the starting-partner choice and later turn up on Sam's walks. There are 15; each needs all of this
(`story-check` fails on a missing intro, walk meeting or arc).

1. `data/characters/partners.json → <key>`: `role: "partner"` plus the core fields, and `partnerTrust`, `partnerBlurb`
   (one line for the picker), `partnerStory`, `vignettes` (4 short `{title, text, trust}` moments), `goddess.comment`.
   Optional: `ngplus: true` (only offered from cycle 2), `cutFloor`, `partnerDebtCut`, `startGuild` / `startGuildRank`.
2. `data/goddess/partner-intros.json → partnerIntros.<key>`: `image`, `pages` (2+ lead-in pages: how you met her, how she
   ends up at your door), `greet` (her voice), `choices` (2+, each gaining trust), `goddess` (Seliora's aside: how she
   arranged the meeting). No house-specific details (use `{house}`).
3. `data/walks/partners.json`: `partnerIntros.<key>` (the same meeting, told for a walk), `partnerMemoryLines.<key>`
   (NG++ variants when she's been recruited in an earlier life) and `partnerMemoryHire.<key>`.
4. `data/arcs/<key>.json`, and add `<key>` to `data/arcs/index.json`: 6 beats; the last makes her Devoted. Use `byIntim`
   variants so each beat matches how far she and Sam have gone (schema in `arcs/base.json`).
5. `data/firsts/partners.json → characters.<key>`.
6. `data/titles.json`: her arc title.
7. Cycle-1 partners: add her to `tools/lab/exp/partners.json` so partner balance runs include her.

## A house

Starter houses have 5 story chapters; New Game+ houses (`ngplus: true`) have 4. Each house comes with a resident lady.

1. `data/economy.json → houses.<id>`: copy a house of the same tier and adjust size, rooms, beds, upkeep, debt, cost,
   clientele (`cls`), `perk`, `desc`, `setting` (image backdrop), `npc` (the resident's key), `goddess` (her remark).
   `starter: true` = offered as a starting house; `ngplus: true` = only from cycle 2.
2. `data/characters/house.json → <npc>`: the resident (`role: "house"`).
3. `data/housestories/<starters1|starters2|ngplus>.json → <id>` (one entry per chapter: `pages`, `hint`, `text`,
   `choices`) and `titles.<id>` (the story's title) at the top of the same file.
4. The story logic, one function per chapter: `STORIES.<id>` in `js/stories/houses.js` (starters) or
   `js/stories/ngplus-houses.js`. Copy a house with similar checks; read text with `HT(h, chapter, 'path')`, gate with
   `check(...)` / `pay(...)`, advance with `storyAdvance(h)` / `storyRetry(h)`, and end the last chapter with
   `freeResident(h)`. A one-off visitor goes in `NPCS` at the top of the file. Optional mid-story extras:
   `js/stories/house-extras.js`. If the sheet's progress list needs it, keep `reqLine` checks in `js/ui/sheet.js` in sync.
5. `data/goddess/intros.json → houseIntros.<id>`: `image`, `arrival`, `greet`, `ngpp`, `choices`.
6. `data/afterstories/residents_c1.json` (cycle-1 houses) or `residents_ngp.json` → `<npc>`: 2–3 beats after the story.
7. `data/firsts/house.json → characters.<npc>`.
8. `data/titles.json`: the house title (`house: '<id>'`), usually an upgrade (`from`) of the resident's line.
9. Lab: add the id to `LAB.HOUSE_RANK` in `tools/lab/bot.js` and to the house lists in `tools/lab/exp/houses*.json` (cycle-1 houses) or `ngplus-houses.json` (NG+ houses).

## A story lady (joins through a house story)

1. `data/characters/story.json → <key>` (`role: "story"`).
2. `STORY_JOINS` in `js/stories/houses.js`: `<house id>: ['<key>', free]` (`free` = she joins without a signing fee),
   and the house's last chapter calls `joinNamed`. Write her into that house's story text.
3. `data/afterstories/joiners.json → <key>`: 2–3 beats.
4. `data/firsts/story.json → characters.<key>`.

## A guild lady (joins at a guild rank)

1. `data/characters/guild.json → <key>` (`role: "guild"`).
2. `GUILD_UNLOCKS` in `js/logic/guild.js`: the rank she comes with (rank 5, Mithril, is free), and her part in that
   rank's beat in `data/guild/ranks.json`.
3. `data/arcs/<key>.json` + `arcs/index.json` (guild ladies get a full arc, like partners).
4. `data/firsts/guild.json → characters.<key>`.
5. Optional: party scenes that name her in `data/guild/scenes.json`, bonds with the other guild ladies.

## A guest (crossover visitor)

1. `data/guests/<pack>.json → packs.<pack>`: `label` and `characters.<key>` (the core fields, no `role`). A new pack is a new
   file listed in `data/guests/index.json`; it shows up under Settings → Visiting characters.
2. `data/firsts/<pack>.json → characters.<key>` (a new pack gets a new file in `data/firsts/index.json`).
3. Guests have no arc or after-story. Keep them adults (aged-up or endgame versions).

## Check your work

```
node tools/check-data.mjs          # JSON valid, no key defined in two part files
node tools/story-check.mjs         # plays every intro, walk, house story, arc and after-story; flags missing pieces
node tools/smoke.mjs 30            # plays 30 weeks headlessly
node tools/story-check.mjs --words # word counts, to compare with the targets above
```
