# Stat expansion: Charisma, Wits, and body stats in services

Status: **build steps 1-4 done** (engine, formulas, clients, content). Only the balance pass (TODO at the bottom) remains. Save version 26 → 27.

Step 4 deviations from the spec: earn conditions take a single condition, so Sharp Mind = 20 classroom lessons as a learner (new count key `lessons`, `classroomTeach`) and Magnetic / Light on Her Feet = `{job, weeks}` (promoter 25, dancer 30; the 'or' alternatives were dropped). Champion and Unbeaten also got +5 Agility, Storm-Rider +5 Agility. Dancer's silks already existed, so the new wardrobe items are Reading spectacles, Stage costume and Cozy knit dress; the silks, scholar's robes, statement gown, bunny suit, barmaid dirndl, vestments and livery had points moved (totals unchanged). The Pilgrim-at-the-Chapel event was not built.

## 1. The eight stats

`STAT_KEYS = ['beauty','charm','charisma','refinement','wits','stamina','strength','agility']`

| Stat | Short | Means | Main uses |
|---|---|---|---|
| Beauty | BEAU | Looks | appeal, service quality, bath |
| **Charm** | CHRM | One-on-one warmth: makes the person in front of her feel special, reads him, puts him at ease | courtesan/service quality, attendant, host, chapel, regulars, madame mood shielding, lonely/shy/romantic/troubled clients, bonds |
| **Charisma** (new) | CHAR | Working a room: presence, drawing a crowd, being noticed | appeal, promoter, dancer tips, bartender, street fair, madame authority, popularity spread |
| Refinement | REFI | Poise, manners, class | noble/official clients, patron & noble-companion events |
| **Wits** (new) | WITS | Brains: learning, reasoning, quick thinking | learning & teaching (classroom, lessons), madame matching, talking down pushy clients, scholar/curious clients, not being cheated |
| Stamina | STAM | Endurance | max energy, fatigue, long services |
| Strength | STR | Physical power | security (intimidation), arena, firm massage |
| Agility | AGIL | Speed, grace, flexibility | dancer, security (stepping in fast), arena, maid speed, bartender flair, athletic services |

Short labels: a `STAT_SHORT` map in `js/data/characters.js` replaces `k.slice(0,4)` (candidate card, ui/core.js:142), since charm/charisma would both give "CHAR".

Sam's own stats (charm/business/strength/technique) are separate and **unchanged**.

## 2. Formula changes

All reads go through `statOf()` / `s100()` as now. Weights below are starting points; balance numbers go into `balance.json` where a key already exists.

| Where | Now | After |
|---|---|---|
| `appeal` (character.js:17) | beauty .4 + charm .3 + pop .5 | beauty .4 + charisma .2 + charm .1 + pop .5 |
| Service quality, no act (week.js:18) | service .5 + beauty .25 + charm .25 | unchanged |
| Service quality, act (week.js:19) | actSkill .5 + beauty .3 + charm .2 | actSkill .45 + beauty .25 + charm .15 + **service stat .15** (see §3; no stat → charm gets the .15) |
| Madame (`madF`, week.js:229) | manage + charm | manage + (wits .4 + charm .35 + charisma .25) |
| Security (`secPow` week.js:231, `secOf` houses.js:10) | combat + strength .5 | combat + strength .3 + agility .25 |
| Attendant (`attQ`, week.js:237) | service, charm, refinement | service, charm, **wits** (balance key `attendantRefW` → `attendantWitsW`) |
| Promoter (week.js:316) | charm + service | **charisma** + service |
| Noble client fee (week.js:432) | hard-coded refinement | removed; Noble class `stats` preference (§4) covers it |
| Bartender (week.js:466) | bar + charm | bar + **charisma**; agility adds up to +10% visitors served (`jobs.barAgil`) |
| Dancer (week.js:467-468) | income: dance; tips: charm | income: dance x (0.8 + **agility**/250) (×1.0 at agility 50); tips: **charisma**; popularity gain +1 at agility ≥ 60 |
| Bath (week.js:472) | service + beauty | unchanged |
| Chapel (week.js:486) | charm | unchanged (comfort is Charm) |
| Host warm-up / waiting clients | — | `host.sat` x (0.6 + charm/125) |
| Maid tidiness | maidBase + skill | + agility (`tidy.maidPerAgil`) |
| Teacher (`teachPower`, week.js:199) | manage + refinement | manage + **wits** (`classroom.refW` → `witsW`) |
| Learner (`learnPower`, week.js:200) | refinement | **wits** (`classroom.learnRef` → `learnWits`) |
| Regulars (`maybeNewRegular`) | — | chance x (0.8 + charm/250) |
| Pushy clients (`pushyCheck`, week.js:146) | security → Sam → nobody | **new first step: she talks him down** with chance (wits .6 + charm .4)/100 x `props.talkDown` (≈0.35), mood cost only; then security, Sam, nobody |
| Cheapskate clients | fee 0.8, tips 0.5 | fee penalty shrinks with wits (0.8 → 0.9 at wits 100) |
| `wageFor` (character.js:169) | sum / 6 | sum / `STAT_KEYS.length` |
| Street fair event (random.js:55, 59) | charm (+beauty) | **charisma** (+beauty) |
| Guild companion event (random.js:130) | charm | **charisma** |
| Patron / noble events (random.js:41-48, 122-124) | refinement | unchanged |
| Arena (random.js:43, 70) | combat, strength, agility | unchanged |

Stat growth (`statXP`, week.js:492-496 and job blocks):

| Job | Grows |
|---|---|
| Madame | wits 1, refinement .5, charisma .5 (was refinement 1.5) |
| Promoter | charisma 1.5 (was charm) |
| Host role (courtesan/dancer/bath hosting) | charm 1.5 |
| Attendant | charm 1, wits 1 (was charm + refinement) |
| Teacher | wits 1.5 |
| Classroom learner | wits .3 per lesson |
| Dancer | agility 1, charisma .5 |
| Security | agility .5, strength .5 |
| Maid | agility .3 |
| Chapel | charm 1 |
| Bartender | charisma 1.5, agility .3 (was charm 1.5) |

## 3. Service stats

New optional field in `services.json`: `"stats": {"agility": 0.6, "stamina": 0.4}` (weights summing to 1). Quality uses the weighted average of those stats as the ".15 service stat" term in §2. **Receiving services (`kind: receive`) have none**: she isn't the one doing the work. Services without `stats` (including custom ones from Settings) fall back to charm. Suggested defaults, yours to change:

| Service | Stats |
|---|---|
| massage_give | strength .5, agility .5 |
| kiss | charm 1 |
| manual_give | agility 1 |
| oral_give | stamina 1 |
| breast_give | stamina 1 |
| missionary | stamina 1 |
| cowgirl | agility .5, stamina .5 |
| doggy | stamina .5, strength .5 |
| all `_get` / receive | — |

Optional second effect (balance flag, default on): energy cost x (1.1 − stamina/500) on services listing stamina.

## 4. Client stat preferences

New optional `stats` field on client traits (`balance.json → clients.traits`) and classes (`economy.json → classes`), e.g. `"stats": {"wits": 1, "refinement": 0.5}`.

Score = Σ weight x clamp((s100(statOf(w,k)) − 50) / 50, −0.5, 1), divided by the sum of weights. Applied in `clientDraw` (draw x (1 + `statPref.draw` x score)) and to satisfaction (+ `statPref.sat` x score). New keys `clients.statPref {draw: 0.4, sat: 8}`. Never used in AI text or image prompts (like the other client helpers).

Existing traits:

| Trait | stats |
|---|---|
| connoisseur | refinement .5, wits .5 |
| chatty | wits 1 |
| lonely | charm 1 |
| shy | charm 1 |
| romantic | charm .7, beauty .3 |
| rowdy | strength .5, charisma .5 |
| dancerFan | agility .5, charisma .5 |
| vanilla | beauty 1 |
| firstTimer | charm 1 |

Existing classes:

| Class | stats |
|---|---|
| laborer | beauty .5, stamina .5 |
| farmhand | charm .5, stamina .5 |
| sailor | stamina .5, charisma .5 |
| adventurer | agility .5, strength .5 |
| mercenary | strength .7, stamina .3 |
| merchant | charisma .5, wits .5 |
| artisan | wits .5, beauty .5 |
| scholar | wits 1 |
| noble | refinement 1 (stronger weight 1.5 to replace the old hard-coded bonus) |
| official | refinement .5, wits .5 |

New client traits:

| Trait | Visible | Effect | stats |
|---|---|---|---|
| Curious | yes | compFee 1.15, patience +0.1, likes Bookish/Studious/Shrewd | wits 1 |
| Troubled | hidden | −8 sat unless her charm ≥ 55, then +6; regular x1.5 | charm 1 |
| Thrill-seeker | yes | open +0.2, want x1.3 on services with agility/stamina | agility .5, stamina .5 |

New classes (shares split from their tier):

| Class | Tier | Character | stats | Trait weights |
|---|---|---|---|---|
| Bard | merchant | loves a show, tips well, gossips | charisma .6, wits .4 | dancerFan 2, chatty 2, gossip 2, generous 1.5 |
| Pilgrim | commoner | travel-worn, lonely, gentle | charm 1 | lonely 2, shy 1.5, troubled 1.5, prude 1.5 |
| Cleric | merchant | discreet, a little guilty, pays for privacy | charm .5, refinement .5 | discreet 3, troubled 2, prude 1.5, romantic 1.2 |
| Watchman (optional) | commoner | off-duty guard, rowdy-ish, respects strength | strength .5, agility .5 | rowdy 1.5, drinker 1.5, loyal 1.5 |

Pilgrims and Clerics also nudge Chapel visitors and donations up (`chapel.visitorClass`).

## 5. Creation and data

**Generic ladies** (`genWorker`, character.js:262): charisma and wits roll `base()` like the others, then personality leans and race mods apply.

**Race mods** (races.json, 0-100 scale, live bonus):

| Race | Now | After |
|---|---|---|
| human | charm 5 | charm 5 |
| elf | refinement 10, beauty 5, stamina −5 | + wits 5 |
| beastkin | stamina 10, agility 5, refinement −5 | + wits −5 |
| fox | charm 10, beauty 5 | wits 5, charisma 5, beauty 5 |
| cat | agility 10, charm 5 | agility 10, charisma 5 |
| wolf | stamina 10, strength 5 | + charm 5 |
| rabbit | agility 5, charm 5, beauty 5 | unchanged |
| dragon | strength 5, stamina 10, charm 5, agility −5 | charm → charisma |
| demon | charm 5, lewd 15 | charisma 10, wits 5, charm −5, lewd 15 |
| dwarf | strength 10, stamina 5, beauty −5 | + wits 5 |
| spirit | charm 5, refinement 5, strength −10 | charm 10, refinement 5, strength −10 |
| angel | refinement 10, beauty 5, strength −5 | + charm 5 |
| android | stamina 5, refinement 5 | + wits 10, charm −5 |

**Personality leans**: a new `stats` field in personalities.json, added at creation for generic ladies and used by the seed script for named ones:

| Personality | Lean |
|---|---|
| Cheerful and teasing | charisma +8, charm +4 |
| Calm and elegant | refinement +5, charm +5 |
| Shy but earnest | charm +8, charisma −8 |
| Proud and sharp-tongued | wits +8, charisma +4, charm −5 |
| Laid-back and lazy | charm +4, wits −3 |
| Bold and flirtatious | charisma +10, charm −2 |
| Bookish and curious | wits +12, charisma −6 |
| Warm and motherly | charm +12 |
| Mysterious and aloof | charisma +6, wits +4, charm −6 |
| Hot-blooded and competitive | charisma +6, agility +4, charm −4 |
| Gloomy but devoted | charm +6, charisma −8 |
| Scheming and charming | wits +8, charisma +6, charm −4 |
| Earnest and dutiful | charm +4, wits +4 |
| Free-spirited wanderer | charisma +6, agility +4 |
| Cold and professional | wits +6, refinement +4, charm −8 |
| Playful trickster | wits +6, charisma +4, agility +3 |
| Gentle and dreamy | charm +8, wits +2 |
| Stoic and blunt | strength +4, wits +2, charm −6 |

**Named ladies** (31 in characters.json, 59 in guests.json): `tools/seed-stats.mjs` writes `charisma` and `wits` into each `stats` block:
- charisma = charm, wits = refinement, as the starting point
- + personality lean, + trait leans (below), + job lean (madame wits +5, dancer charisma +5, promoter charisma +5, teacher wits +8, attendant wits +3), + backstory keywords (scholar/mage/clerk/inventor → wits; singer/performer/idol/captain → charisma)
- clamped 5-95, and existing stats are **not** touched

It also writes a review table (name, personality, traits, job, old charm/refinement, new charisma/wits) for you to adjust; the script never overwrites values you've already edited (`_seeded` marker).

**Lady traits** (traits.json `fx.stats`; mostly re-pointing existing traits rather than adding new ones):
- Wits: Studious +8, Shrewd +8, Quick Learner +5, Trade-Wise +5, Organised +5, Level-Headed +5
- Charm: Good Listener +8, Warm-Hearted +8, Confidante +8, Attentive +5, Soothing Voice +5
- Charisma: Natural Performer +8, Crowd Favorite +8, Showy +5, Bold Laugh +5, Town Crier +8, Headliner +5, Silver-Tongued +5
- Agility: Graceful +8, Good Rhythm +5, Nimble Fingers +3
- Charming stays charm.
- New earnable traits: **Sharp Mind** (wits +10, earn: 20 classroom lessons or 30 weeks as madame/teacher), **Magnetic** (charisma +10, earn: 25 weeks promoting/dancing), **Light on Her Feet** (agility +10, earn: 30 weeks dancing or security)

**Titles**: Professor / Doctor / Magistrate / Treasurer → wits; Festival Queen / Prima / Herald / Belle → charisma; Champion / Unbeaten / Stormrider → agility; Sister / Healer / Mama / Hostess → charm. Each title is checked against its current fx; a stat is only added where it fits.

**Wardrobe**: a few existing outfits re-pointed (stage costumes → charisma/agility, scholar/librarian-type → wits, soft/homely → charm), plus 2-3 new items (spectacles accessory → wits; dancer silks → agility).

**Dates** (dates.json `stats`): library/reading/theater-type dates → wits, festival/performance → charisma, walks/caring → charm, sport/dance → agility. The `_readme` lists the new keys.

**Events** (data/events.json + random.js):
- Riddle Night (wits)
- A housemate in tears (charm; builds a bond)
- A Bard's Challenge (charisma; stage or bar)
- Optionally: a Pilgrim seeking comfort at the Chapel

## 6. UI, save, NG+

- Sheet: 8 stat cells. Candidate card: `STAT_SHORT`. Creator: automatic from `STAT_KEYS`; defaults 30.
- `migrate()` v27 is small: any lady missing charisma/wits gets them (named: data value; generic: charm / refinement + personality lean, ×`SKL`, clamped), alumni included. Balance-key renames read `?? old key`.
- Save support window: about 5 versions back. Migration blocks older than that (v < 22) can be dropped; older saves start a new game.
- NG+: `ngCarry` loops `STAT_KEYS`, so nothing is needed beyond the migration.
- AI text (optional): `{temperament}` from very high/low charm, charisma and wits ("quick-witted", "warm", "commanding"). Off by default.

## 7. Build order

1. **Engine**:
   - Keys, labels, short labels, creation roll, race mods, personality leans, `wageFor`
   - Migration v27, sheet/creator
   - Seed script, plus the review table
2. **Formulas**: everything in §2, the service stats hook (§3), talk-down and the agility uses.
3. **Clients**: `stats` preferences, the 3 new traits, Bard/Pilgrim/Cleric (+Watchman).
4. **Content**: lady traits, titles, wardrobe, dates, events.

Each step ends with `node tools/build.mjs && node tools/smoke.mjs 30` (run by a Sonnet/Haiku agent, results checked).

## TODO (later, separate session)

- **Balance pass**: a sim harness comparing weekly income per job and per lady before and after (same seeds); tune until no job swings more than ~±15% for an average lady. Kept out of the build steps because it eats a lot of context.
