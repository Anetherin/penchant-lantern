# Hollowmere Nights — the big overhaul (design spec)

Source of truth for the November 2026 overhaul. Save compatibility is NOT required: bump `S.v`, and `migrate()` may simply
refuse very old saves (offer a fresh start). Keep `CLAUDE.md` rules: classic scripts, globals, data in `data/*.json`,
no explicit wording authored by Claude (leave `TODO:` template strings for the user), all characters adults,
`cleanText`/`YOUTH_RE` untouched.

Template rule: anywhere new image/prompt wording for sexual content is needed (new services' `image.*`, expressions
during acts, body-part wording), put a short neutral placeholder like `"TODO: your wording"` (or an empty string where
the code tolerates it) and make sure the code works with it. Neutral descriptors (clothing, faces, settings) are fine.

---------------------------------------------------------------------------------------------------------------------
## 1. Numbers: stats & skills out of 1000

* `stats.*`, `tech.*` and `acts[id].skill` run 0–1000. Lust, energy, mood, health, lewdness, trust, popularity and
  reputation stay 0–100.
* Add in `js/core/util.js`: `const SKL = 10; const s100 = v => (v||0)/SKL; const clampK = v => Math.max(0, Math.min(1000, v));`
  Every formula that reads a stat/tech/act skill uses `s100(...)` so balance is unchanged.
* Data files (characters.json, guests.json, creator input) stay in the familiar 0–100 scale. Convert at creation
  (`genWorker`, `makeNamed`, creator save): `v*10 + ri(0,9)`.
* Growth: `grow()`/`growAct()` work in 1000-units (old `n` × 10, diminishing curve `1 - v/1300`) so small XP shows.
  New small natural stat XP: `statXP(w, key, n)` (×`fxMul(w,'statGain')` × madame training bonus). Hook it into work:
  courtesan→stamina, dancer→agility+beauty, security→strength, bartender/promoter→charm, madame→refinement,
  maid→stamina, bath→stamina+charm, attendant→charm+refinement, private time / training with Sam → the trained thing.
* UI shows these as `/1000` (sheet, creator, candidate cards).

## 2. Effects engine (`js/logic/fx.js`, new, load right after `js/logic/character.js`)

One merged effect map per lady from: her traits (`data/traits.json`), race + beastkin sub (`data/races.json`), body
(`data/body.json`), her personal unique trait (`w.unique`, copied from characters/guests data), NG+ perks
(`w.ngPerks`, ids in traits.json).

```
fxList(w)         -> array of fx objects (cache per week via w._fxv)
fxMul(w, key)     -> product of numeric values (default 1)
fxAdd(w, key)     -> sum (default 0)
fxHas(w, key)     -> any truthy
fxSub(w, key, id) -> for keyed maps, e.g. fxSub(w,'actQuality','paizuri') -> product
```

Vocabulary (only these keys; content authors use only these):

| key | kind | meaning |
|---|---|---|
| maxEnergy | add | max energy |
| energyRec | mul | sleep/rest recovery |
| actEnergy | mul | energy cost of every service |
| actEnergyBy | map mul | per service id |
| actQuality | map mul | quality of a service id (fee, satisfaction, her lust drop) |
| actBan | list | service ids she physically can't do (hidden from menu) |
| lustBuild / lustDrop | mul | weekly build / how much services spend |
| lustMax / lustFloor | add | ceiling / floor |
| recklessAt | add | shifts her reckless threshold (negative = reckless sooner) |
| noReckless | flag | never reckless |
| moodDrift / moodDelta | mul | drift to resting point / size of every mood change from events & work |
| moodRest | add | resting point |
| trustGain / skillGain / statGain / lewdGain | mul | growth |
| jobBonus | map mul | output of a job id |
| clientFee | mul | all service fees |
| classBonus | map mul | fee+sat with a client class id |
| appeal | add | how often she's picked / propositioned |
| propRate | mul | how often she's propositioned |
| security | add | security power |
| energyBank | add | up to N energy saved above max (spent first) |
| wardrobe | add | clothing comfort (clothLimit) |
| willing | add | inclination for client services |
| rep | mul | her effect on house reputation |
| promote | mul | promoter draw |
| tidy | mul | cleaning power |
| encore | add | chance to ask for another round when reckless |

Migrate the hard-coded `TRAITS` object and the race/trait special cases in character.js/week.js into these data files.
Behaviours that are not a simple number (Modest, Devoted, Oblivious, Shy/Eager exclusivity, Exhibitionist room-free
services) stay in code but read `has(w,...)`.

### data/traits.json
```
{ "_readme": [...],
  "traits": { "Tough": {"desc":"...", "fx":{"maxEnergy":20}, "gen":true, "hidden":false,
                        "earn":null, "ngOnly":false, "ngPerk":false, "excl":["Lazy"]}, ... },
  "earnChance": 0.35 }
```
* `gen`: can be rolled for generic ladies. `hidden`: not shown until known. `story`/`personal` as before.
* `earn`: developable. `{"count":"massage","at":40}` (w.counts.*), `{"stat":"popularity","at":70}`,
  `{"trust":90}`, `{"lewd":80}`, `{"weeks":30}`, `{"job":"dancer","weeks":12}` (weeks in that job). Checked weekly;
  once eligible, earnChance per week; logs a line and shows a toast in the report.
  Counters to keep in `w.counts`: svc, svcByAct.<id>, massage, dance, bar, promo, rowdy (pushy clients she faced),
  rescued, encore, weeksWorked, jobWeeks.<job>, privateSam, gifts.
* `ngOnly`: generic trait only rolled from cycle 2. `ngPerk`: offered to carried-over ladies in NG+ (see §9).

### data/races.json (replaces people.json → races; keep a fallback read from PEOPLE.races)
Each: `label, age, look, mods (0–100 scale, applied ×10), common, weight (generic roll), names?, needs (upgrade id
required in her house to recruit/assign her), fx, client: {like, dislike}` (chance per client to be an enthusiast /
put off; enthusiast: fee ×1.2, sat +12; put off: sat −15, and 50% he asks for someone else if anyone is free).

| race | common | key rules |
|---|---|---|
| human | yes | client like .06; trustGain 1.15, skillGain 1.15 |
| dwarf | yes | maxEnergy +25, energyRec 1.25, lustBuild 0.75 |
| elf | yes | moodDrift 0.5, moodDelta 0.6 |
| beastkin | yes | recklessAt −10; **refusal**: if she's reckless/restless and asks Sam (any "lovers come looking" / restless request) and Sam says no, mood −15 (×2 vs others). Subs: fox (charm, appeal +3), cat (agility, energyRec 1.1), wolf (stamina, trustGain 1.1), rabbit (lustBuild 1.25, encore +.1), **dragon** (former dragonkin: strength/stamina, maxEnergy +15, client like .2 dislike .1) |
| demon | no | lustMax +20 (ceiling 120), lustBuild 1.3; **does not recover energy from sleep**; gains energy from services where the client finishes (`act.finish`): +4 each (not reckless) or +9 (reckless, and house rep −0.4 per drain "he left pale and shaky"). With Sam: she gains +15 but Sam loses 50% more energy for it. Receiving-type acts give her nothing (and drain nobody). client like .25 dislike .25 |
| angel (new) | no | lustMax −30, noReckless, moodRest +5; client like .25 dislike .1 (nobles .3 like) |
| spirit | no | needs `tether`; no bed; maxEnergy −20; moodDrift 1.6, moodDelta 1.3; client like .2 dislike .2 |
| android (new) | no | needs `charger`; when resting, energy goes to max; every week she rests or sleeps the house pays a recharge fee (15g + 0.4g × energy restored), shown in the ledger as "Recharging"; lustBuild 0.8; client like .2 dislike .15 |

Generic names: human, dwarf and elf generics ALWAYS have first + last names. Add name lists for angel and android
(content task) — android names may be model designations plus a chosen name.

Race-specific house upgrades (economy.json → upgrades, with `race` field; show them in the house panel):
`tether` Tethering Stone (spirits can live/work here; spirit mood +3), `charger` Charging Alcove (androids; recharge
fee −40%), `chapel` Quiet Chapel (angels mood +4, house rep +0.2/wk if an angel works here), `sigil` Binding Sigil
(demon reckless drain costs no rep), `grove` Moon Garden (elf mood +3), `hearth` Forge Hearth (dwarf energyRec ×1.1),
`den` Grooming Den (beastkin mood +3, beastkin refusal penalty halved). Normal cost/upkeep like other upgrades
(400–900g, 8–20 upkeep) and amenity size 1.

## 3. Bodies (`data/body.json`, `w.body`)

`w.body = {bust, height, figure}` rolled for generics (weighted, race can skew: dwarf short, elf slim/tall,
android any); named ladies get it from data (`body` field; default medium/average/slim if missing).
Each option: `label, img (neutral prompt words; bust words may be "TODO"), weight, fx`.

* bust: flat (actEnergy .92, actBan [paizuri, breast_get? no — breast_get stays], appeal −2), small (actQuality paizuri .8),
  medium (—), large (actQuality paizuri 1.2, appeal +3, actEnergy 1.06), huge (actQuality paizuri 1.35, appeal +5,
  actEnergy 1.12, jobBonus dancer .9).
* height: petite/short (jobBonus security .9, agility), average, tall (jobBonus dancer 1.08, security 1.08,
  classBonus noble 1.05).
* figure: slim (jobBonus dancer 1.05), athletic (security +10, maxEnergy +5), curvy (appeal +3, classBonus merchant 1.05),
  soft/plump (actQuality massage_give 1.15, maxEnergy +5, jobBonus bath 1.08).
* Image prompts (`js/logic/prompts.js`) add the body `img` words; editable in the creator and on the sheet.
* Note: `YOUTH_RE` strips "flat chest" wording, so the `flat` bust `img` is left empty for the user to word.

## 4. Services (`data/services.json`)

All services live in ONE list, sorted by tier then `th` (no separate "extra"/custom section at the end — custom ones
merge into the list by their tier). New fields per service:

* `lust` – base change to HER lust (negative = drop). `finish` – client finishes (demon feeding). `want` – how often
  clients ask for it (relative). `kind`: `give` | `receive` | `massage` | `kiss`.
* `dress` – `{"min":"dressed|partial|under|nude", "fullAt": lewd needed before images show her fully undressed}`.
  Replaces `minCloth` (keep reading old minCloth as `dress.min`).

List (labels can be tweaked by the user):

| id | label | tier | th | price | energy | lust | finish | want | notes |
|---|---|---|---|---|---|---|---|---|---|
| kiss | Kissing | 1 | 20 | 18 | 4 | −2 | no | .8 | (the old *caress*, now kissing only; keep id `caress` as alias in migrate) dress min dressed, fullAt 95 |
| massage_give | Massage (giving) | 1 | 10 | 22 | 7 | 0 | no | .9 | no happy end: no lust drop; bath attendants always offer it; dress min dressed, fullAt 85 |
| massage_get | Massage (receiving) | 1 | 22 | 16 | 2 | +3 | no | .25 | client rubs her down; she regains 4 energy; mood +2 |
| manual | Manual | 2 | 32 | 32 | 7 | −4 | yes | 1 | dress min partial |
| manual_get | Manual (receiving) | 2 | 30 | 24 | 3 | −10 | no | .3 | client pleasures her; great for her lust |
| oral | Oral | 2 | 42 | 44 | 9 | −4 | yes | 1 | |
| oral_get | Oral (receiving) | 2 | 40 | 34 | 3 | −14 | no | .3 | |
| paizuri | Paizuri | 2 | 45 | 46 | 9 | −3 | yes | .8 | actBan for flat |
| breast_get | Breast play (receiving) | 2 | 34 | 26 | 3 | −8 | no | .3 | |
| missionary/cowgirl/doggy | as now | 3 | as now | | | −8/−9/−9 | yes | 1 | |

* `image.client/sam/duo` for new services: `["TODO: your wording"]`; `report` lines: short, tasteful, non-explicit.
* With Sam, receiving services mean Sam does the work: low Sam energy, big drop in her lust, no demon drain.
  They count for `canSam` tiers like the rest (tier 2).

### Lust per act (replaces the flat `drop.client`)
`herDrop = -act.lust × technique × (fav ? 1.5 : 1) × (dislike ? .6 : 1) × fxSub(actQuality) × lustProfile.drop`.
Technique: each client rolls 0.3–1.4 (class mean: commoner .8, adventurer .9, merchant .85, noble 1.0; regulars keep
one). If technique × her lust/60 < 0.55 on a `finish` act she doesn't finish: her lust goes UP by 3, mood −1, note
`frustrated`. Favourites are more effective (×1.5 above) and cost 25% less energy (already).

### Expressions
For each encounter compute `expr`: `bored` (lust < low, or reluctant), `professional` (content, not fav),
`into it` (eager or fav), `lost in it` (reckless). Personality shifts it (data/personalities.json → `expr`
map, e.g. Shy: "into it" → "flustered", Proud: "smug"). Wording for the image prompt comes from
`data/snippets.json → expressions` (neutral face words like "bored expression", "blushing, flustered" are fine;
leave the act-specific ones TODO). Store on the encounter so 🎨 uses it; show it in the report line.

### Encore
When she's reckless and the client finished and her lust is still ≥ eager: chance `0.35 + fxAdd(encore)` she asks to
keep going: second service (same or another on her menu), fee ×0.6, its energy cost, another lust drop, counts.encore++.
Report: "…and she wasn't done with him yet."

### Dress levels by context
`actCloth` also takes a context: night proposition / reckless → at least `partial`; bath → towel/nude rules as now;
kissing & massages stay dressed unless lewd ≥ `dress.fullAt`. Per lady (sheet → wardrobe): **service outfit**
(any owned/house outfit, or "same as work") and **service dress level** (Auto / Dressed / Partly / Underwear / Nude,
capped by what she's comfortable with). Visual only.

## 5. Jobs

Removed: `companion`, `reception` (migrate: companion→courtesan, reception→promoter).

| job | cat | slots | notes |
|---|---|---|---|
| courtesan | escort | 2 + rooms | must offer; lowest thresholds (−15 on th for clients); highest proposition rate; can work when not in the mood (others turn heavier services down below lust.low) |
| madame | staff | 1 | `w.madameFocus`: `training` (house ladies' skill/stat gain ×(1.25 + s100(manage)/200)) or `management` (house mood losses ×0.7, better client matching: +6 sat, picks the lady whose menu fits). Steps in for overwhelmed courtesans (takes leftover clients if she has the energy) and can be propositioned herself |
| promoter | staff | ∞ | replaces reception. Draw: +(2 + s100(charm+service)/25) clients. Toggle `w.samples` (free samples, no room needed): draw ×1.6, costs energy, her lust drops a little, rep change ±(q−0.5)×0.6 (good promoters raise it, poor ones cheapen the house); Modest ladies won't |
| maid | staff | ∞ | cleans `h.tidy`; default outfit: maid uniform (house outfit `b_maid`, auto-used while job is maid unless she has a job outfit set) |
| bartender | staff | as now | income as now; with a Bar, each bartender adds +6% house-wide proposition rate and +5% rowdy chance and makes clients a bit more reckless (lower their refusal tolerance) |
| attendant | staff | 1 per 2 rooms (min 1) | helps courtesans: their energy cost ×0.92, +4 sat; steps in for overwhelmed ladies (takes turned-away clients for company or light services on her menu); doesn't expect propositions, but some clients expect her to offer |
| dancer | staff | needs stage | tips + popularity + small house rep; must offer (expects propositions) |
| bath | staff | needs bath | always offers massage_give to bathers (income); must offer; can go further with propositions |
| security | staff | as now | power handles rowdy/pushy clients (see §6) |

Rooms: every room-based service uses a room. Capacity per week = `h.rooms × 8` sessions; Exhibitionist ladies don't
use a room. Over capacity → turned away (and "short on rooms" note). Lounge-only company still happens (company income
for courtesans with no service, as the old companion branch did).

Tidiness `h.tidy` (0–100, starts 70): −0.5 per room service, −0.1 per visitor; maids add
`(12 + s100(service)/4) × ob × fxMul(tidy)` per week (capped 100). Effects: ≥75 rep +0.3/wk, mood +2, energyRec ×1.05;
<45 rep −0.4, mood −2, energyRec ×.95; <20 rep −1, mood −5, energyRec ×.9. Shown on the house panel and report.

Reputation: gains are scaled by `max(0.2, 1.5 − rep/60)` (easy when low, slow when high). Losses unchanged.

## 6. Propositions & rough clients

* Client classes (economy.json → classes) get `prop` (chance to proposition), `rowdy`, `reckless`, `pushy`
  (chance to try to force it after a no) and `tech` (technique mean).
* `PROP_RATE` per job stays as the base; bar effect and the lady's `propRate`/appeal multiply it.
* **Must-offer roles**: courtesan, bath, dancer — they serve propositions from their menu (or a counter-offer).
  **Other roles** choose: accept chance = 0.15 + (lust−40)/100 + fxAdd(willing)/100, more when eager, much more
  when reckless. She may counter-offer something lighter she's comfortable with ("alt"). Each accepted proposition
  lowers her main job's output by 8% (max −50%) that week. `w.offDuty` toggle becomes "Open to propositions"
  (on/off/ask-me — off still lets reckless ladies slip).
* **Reckless ladies proposition clients themselves** (1–3 extra encounters a week when reckless).
* **Expectation**: courtesan/dancer/bath expect it (no mood hit). Attendant/maid/bartender/security/promoter/madame
  don't: a proposition she turns down is fine; one she accepts reluctantly costs mood. Some clients expect attendants
  to offer: if she declines, that client's sat −6.
* **Rowdy / pushy**: when a lady says no, a pushy client may try to force the issue. Resolve:
  security power (house) vs `rnd(30,110)`; success → "security walked him out", her mood +3 (felt safe).
  Else if Sam is around (Sam energy ≥ 15): Sam check `S.sam.strength + S.sam.charm/2 + rnd(0,40) ≥ 60` →
  success: her mood +4, trust +1, Sam energy −8; failure: Sam energy −20, house rep −1.5, her mood −4.
  Neither: her mood −10, rep −1, note. All wording non-graphic. counts.rowdy++ (and rescued++ when protected).
  Plain rowdy (no proposition) clients: incident chance as now, scaled by bar.

## 7. House & economy

* **Pay off the house**: in the debt panel, "Pay off in full (X g)" when gold ≥ remaining; same win flow as the last
  regular payment.
* **House-gated progress for house ladies** (role `house`): trust can't rise above `35 + 15 × h.story.beat`
  (no cap once her house story is complete) and their arc beats wait for the house story; the sheet shows
  "grows with <house> story".

## 8. Clothing

* House wardrobe: outfits Sam buys go into `S.houseWardrobe` (shared): any lady in that house can wear them if she's
  comfortable. Personal outfits still exist (signatures, gifts).
* **Gift** an owned outfit/underwear to a lady (sheet → wardrobe, uses the gift action; Greedy/likes-gift bonus).
* Random events (data/events.json + random.js): "found a dress at the market", "a regular sent her something",
  "a friend lent her an outfit", "she made her own" — gives her a random outfit from the catalogue fitting her style.
* Per-lady **service outfit** and **service dress level** (see §4).

## 9. New Game+

* Keep **only the home house** (with its rooms, tier, upgrades, beds). Other houses are sold toward the new debt.
  New debt = `(home debt × debtShare × (1 + perCycle×(cycle−2))) + improvementsValue × improveShare`
  (`improvementsValue` = what was spent on room tiers, rooms, upgrades, quarters, annex on that house;
  `improveShare` 0.6 in balance.json). No second house pick; NG+ houses become buyable during the cycle.
* Carry over **only lovers** (Devoted). They stop being free partners: `isPartner=false`, they draw wages.
  Their stats/tech/act skills reset to their starting values (named: from data; generic: 50% of current),
  popularity → 0, but relationship stays (trust, Devoted, intim/firsts, arc done, bonds between carried ladies).
  Each carried lady picks one **NG+ perk** (traits.json `ngPerk:true`; per lady, stacking across cycles; each once).
* Everyone else leaves; named ones go back to their pools (meetable again, fresh). Keep image library / portraits
  (`seed`, `imgVar`, library entries).
* Pick a new partner from partners not carried over, including `ngplus:true` partners (only offered from cycle 2).
* Generics rolled from cycle 2 can get `ngOnly` traits (one at 35%).
* Sam keeps level/stats as before; boons as before.

## 10. Characters (content)

* Partner `mio` → renamed (clash with guest Mio Tanabe), rewritten as Kenta's younger sister with a long crush.
  Generally rewrite partner stories to be more specific to each character + add `vignettes`: 3–5 short scenes each
  (`{"title","text","trust":N}`), unlocked by trust, readable from her sheet ("Moments").
* New partners: **Lara Patel** (orphanage friend, emotionally dependent, gothic, Indian, ponytail),
  **Emily Shadowkin** (pale wolf beastkin brunette, Sam's pen-pal when they were lonely teens — letters crossed worlds),
  **Ella Dott** (blonde, blue eyes, Sam's academic rival), an **android** from the future interested in Sam,
  an **angel**.
* NG+-only partners (`ngplus:true`): the ones from Sam's old world arrive later: Yui, Natsuki, Kanako, the renamed
  Mio, Lara, Ella, plus the android. Cycle 1 partners: Kaede, Nerys, Elowen, Adelheid, Marisol, Emily, the angel.
* Every named lady gets a `unique` trait (`{"name","desc","fx"}` using the §2 vocabulary) and a `body`.
* Guest race changes: Temari → human, Konan → angel, Saki (naruto-after) → android.
* New guest entries: see the content task list (adult characters only).
