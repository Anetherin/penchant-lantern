# Writing guide

House rules for all scene text in `data/` and the story strings in `js/stories` / `js/events`.
Every character is an adult and everything is consensual.

## Voice

- **Narration is second person.** The player is Sam, so narration says "you": "You bury him in questions about invoices",
  "She drops the ledger on your desk".
- **"Sam" stays where someone says it.** That covers dialogue ("Stay in my bed tonight, Sam.") and system text: logs, weekly
  report lines, notifications, sheet/UI labels, stat names ("Sam's Charm"), parenthetical notes.
- **AI and image text is never second person.** Any `image` object (`comp`/`setting`/`sam`), `situation`, `ai`, `prompt` and
  service `desc` field describes Sam in the third person, so the models know who is in the scene. These are built by code
  (`js/logic/prompts.js`); don't rewrite them for voice.
- **Choice labels are imperatives**: "Kiss her", "Throw him out".

## Language

- **Say what happens.** Use plain, direct words for bodies and acts (cock, pussy, tits, ass, cum, fuck, suck, ride...) instead
  of euphemisms ("bury yourself inside her", "his length", "her core", "release", "make love", "until dawn" as a fade-out).
- **Keep her voice.** The wording should sound like the character: a shy lady can still be explicit in her own way.
- **Don't add sex to lines that aren't about it**: plot, business, refusals (`wait`/`waitRes`), banter.

## Match what the game plays

The text has to agree with the service the game actually runs next.

- **Firsts** (`data/firsts/`): stage `1` is kissing and touching only, `2` is hands and mouth (no intercourse), `3` is
  anything. `jump` / `pent_jump` can lead into stage 2 *or* 3, so their `goRes` must not describe intercourse. After `goRes`
  the service's own line plays, so `goRes` is the lead-in.
- **Generic notes** that can follow any service (the `enc_*` visit notes in `flavor/encounters.json`, shared-scene `res`
  lines with `{act}` / `acts: true` in `bonds.json`, spicy date leads that open private time) must not name a specific act.
  Being explicit about bodies, arousal, enjoyment or distaste is fine.
- **Service-keyed lines** (`act_turn.<service>`, `private_act.<service>`, `services.json → report`) describe that service only.
- **Story beats** stay at the level of intimacy the lady has reached by then.
- **The goddess** never lets Sam finish before she's bound (`docs/GODDESS.md`).

## Characters kept tame

These ladies are canonically young or of unclear age: Misty, May, Leaf, Hilda, Flannery (Pokémon), Yukiko, Kasumi, Ann
(Persona), Buling (Wuthering Waves), Shantae and Rottytops. Claude doesn't make their scenes more explicit. If you want
something different for them, write it yourself.

## Mechanics

- **Placeholders.** Keep every `{placeholder}` a line uses (`{name}`, `{N}`, `{a}`, `{b}`, `{house}`, `{act}`, `{goddess}`,
  `{alias}`...) and only add ones the section's `_readme` lists. Losing `{name}` is harmless, but an unknown one shows up raw.
- **Structure.** Don't change keys, list lengths or non-text fields (`pers`, `traits`, `lewdMin`, effects, `image`). The
  `pers` / `traits` tags decide which lady a template variant fits.
- **Pasting edits from another model.** Run `node tools/build.mjs`: it fails if a key is defined in two part files (for
  example a character pasted into the wrong pack). Then run `node tools/smoke.mjs 30`.
