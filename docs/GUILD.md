# Adventurers' Guild

Code: `js/logic/guild.js`. Data: `data/guild/` (`base` numbers, `text` contract lines, `scenes` party scenes, `ranks` rank-up beats).

## How it plays

- **Joining.** The first guild visit (rest-day errand) registers Sam at Copper rank with Hanna at the desk. After that the guild is
  its own tab and the visit button is gone.
- **The board.** Every week the board offers a few contracts (`board.size + perRank x rank`) of the types Sam's rank allows. Taking
  one moves it to the active list (at most `board.active + activePerRank x rank` at once). Offers not taken disappear at week's end.
- **Parties.** Each contract has `slots` (Sam counts as one). Ladies join through the Guild tab (or the job picker: job `guild`):
  that is their job for the week, at any house. Sam joins through his **Guild** weekly focus (`S.samFocus = {kind:'guild', topic:uid}`).
  He is away: no office, floor, watch or classes at home that week, and no late-night visits.
- **Progress.** Every week each member adds power (weighted stats, see `base.json → power`), the total fills the contract's `work`.
  A contract that isn't done by its deadline fails (merit, fame and a little trust lost). Contracts can take several weeks.
- **Risk.** Each week each member may be injured (`risk`, cut by party power and by Sam's presence): Health loss. Under 30 Health she
  rests until she heals (the existing Health rules). Former Adventurer / Brawler / Shield-Sister ladies get an edge (`fx guild`, `guildSafe`).
- **Rewards.** Gold, merit (rank), fame (more adventurer and mercenary clients at every house), popularity, stat practice and trust
  for the ladies, Sam XP, and the first time a contract type is finished, one of Sam's tools (`balance.json → samUps`, `guild: <contract>`).
- **Ranks.** Copper, Iron, Bronze, Silver, Gold, Mithril. Each rank-up is a story beat at the desk (`ranks.json`): Iron points
  Rhoswen to Sam, Bronze brings Hanna, Silver brings Vesna (rescued from the Barrow), Gold brings Brunhild (impressed in the pit).
- **Sam's perks.** Doing contracts himself earns Sam guild perks (`base.json → perks`), kept for good across cycles.
- **NG+.** Rank, merit, fame and the board reset each cycle (the guild doesn't know the reborn Sam); perks stay, and tools with `carry` stay.

## Party scenes (`scenes.json`)

At most `scenes.maxPerWeek` per week, rolled per contract with a party (`scenes.chance`). Picked by the contract's `tags`
(`camp`, `road`, `delve`, `fight`, `ball`, `bloom`) and who went:

- **duo**: Sam and one lady (trust ≥ `duoTrust`). Two choices: `tender` (no sex: trust, mood) and `close` (private time with Sam
  via `privateCore`, only offered if she'd do one of `acts` with him).
- **trio**: Sam and two ladies who'd both do something with him (trust ≥ `trioTrust`, bond ≥ `trioBond`).
- **pair**: two ladies without Sam, no sex: bond.
- **yuri**: two ladies without Sam on a `bloom` contract (the Fenwood lustbloom), both lewd ≥ `yuriLewd` and bond ≥ `yuriBond`.
  The pollen makes them both worked up; the scene must make clear they want each other and choose it (the `decline` choice is
  always there and is a fine outcome).

## Content schemas

All text follows `docs/WRITING.md`: second-person narration ("you" = Sam) when Sam is present, direct explicit language in sex
scenes, adults only, enthusiastic consent. `image` objects describe Sam in the third person.

### `text.json`

```json
{"text": {"<contract id>": {
  "week":   ["report line (system text, third person), {party} = names"],
  "done":   ["paragraph: the ladies come home and tell you how it went (Sam stayed home). {party}"],
  "doneSam":["paragraph: you were there; how it ended. {party}"],
  "fail":   ["paragraph, Sam present or not (keep it neutral, 'the party'). {party}"],
  "hurt":   ["one line, {name} got hurt (third person, report line)"]
}},
 "generic": {"week": [], "hurt": []},
 "items": {"<samUps key>": "one or two sentences: how Sam ends up with the tool at the end of that contract (second person)"}}
```

### `scenes.json`

```json
{"scenes": {
  "duo":  [{"id":"", "tags":["camp"], "title":"", "text":"{N} = her name, {C} = contract label",
            "tender":{"label":"", "res":""}, "close":{"label":"", "lead":"lead-in, must not name a specific act", "acts":["kiss","manual_give","oral_give","missionary","cowgirl","doggy"]},
            "image":{"comp":"", "setting":"", "sam":true}}],
  "trio": [{"id":"", "tags":[], "title":"", "text":"{a}, {b}, {C}", "tender":{"label":"", "res":""},
            "close":{"label":"", "lead":"", "lead2":"second lady joins in, no specific act", "acts":[]}, "image":{}}],
  "pair": [{"id":"", "tags":[], "title":"", "text":"{a}, {b}", "choices":[{"label":"", "res":"", "bond":4, "mood":3}, {"label":"", "res":"", "bond":2, "mood":2}]}],
  "yuri": [{"id":"", "tags":["bloom"], "title":"", "text":"{a}, {b}", "close":{"label":"", "res":"explicit, both women", "acts":["kiss","manual_give","oral_give","breast_give"]},
            "decline":{"label":"", "res":""}, "image":{"comp":"", "setting":""}}]
}}
```

`pair`/`yuri` scenes have Sam absent: narration is third person about the two of them (Sam hears about it later or not at all).

### `ranks.json`

```json
{"ranks": {"beats": [{"rank":0, "title":"", "pages":["text", "text"], "end":"final text", "btn":"Continue"}]}}
```
Rank 0 is registration. Ranks 1-5 are the promotions (the merit per rank is `base.json → levels`) (Iron: Rhoswen, Bronze: Hanna, Silver: Vesna, Gold: Brunhild, Mithril: capstone).
