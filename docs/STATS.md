# Stat expansion: Charisma, Wits, and body stats in services

Reference for the 8-stat system (`STAT_KEYS`, implemented in save v27).

## 1. The eight stats

`STAT_KEYS = ['beauty','charm','charisma','refinement','wits','stamina','strength','agility']`

| Stat | Short | Means | Main uses |
|---|---|---|---|
| Beauty | BEAU | Looks | `appeal`, service quality, bathhouse income/statXP, client preferences |
| Charm | CHRM | One-on-one warmth | `appeal`, service quality (fallback for stat-less services), attendant, host warm-up/satisfaction, chapel, regulars, madame `madameScore`, pushy talk-down, client preferences, bonds |
| Charisma | CHAR | Working a room | `appeal`, promoter draw, dancer tips/statXP, bartender income/tips/statXP, security door grace/statXP, street fair, guild companion, madame `madameScore`/statXP, prestige leader bonus |
| Refinement | REFI | Poise, manners, class | Scales with House Class (`refMul`, `balance.json → refine`): courtesan/step-in fees and client satisfaction, madame strength, host soothing, attendant quality, chapel donations. Also noble/official/cleric/neatFreak/devotedGuest client preferences, patron & noble-companion events |
| Wits | WITS | Brains, reasoning | Learning & teaching (`classroomTeach`, `learnPower`, `teachPower`), madame `madameScore`, attendant `attQFor`, security client screening, pushy talk-down, Cheapskate fee recovery (`cheat`), scholar/curious/connoisseur client preferences |
| Stamina | STAM | Endurance | Max energy (`maxEnergy` = 50 + Stamina, `balance.json → rest`), stamina-tagged service quality, courtesan/bath/maid/security statXP, sailor/laborer/adventurer/mercenary client preferences |
| Strength | STR | Physical power | Energy recovery (`restMult`: x 0.8–1.2), security power (`secPow`) & statXP, arena events, firm massage (`massage_give`, `doggy`), mercenary/brawnFan/watchman client preferences |
| Agility | AGIL | Speed, grace, flexibility | Dancer income & pop bonus, security power (`secPow`), arena events, maid tidiness (`tidy.maidPerAgil`), bartender visitor bonus (`jobs.barAgil`), athletic services (`massage_give`, `manual_give`, `cowgirl`), thrillSeeker/graceSeeker/adventurer client preferences |

Short labels live in `STAT_SHORT` (`js/data/characters.js`).

**Sam's stats** (`SAM_STATS`, 5 stats, `0-100` up to `samCap()`): `charm`, `business`, `strength`, `wits`, `technique` (`js/logic/sam.js`).

## 2. Key formulas

All reads of lady stats go through `statOf(w, k)` and `s100(v)` (`js/logic/fx.js`, `js/core/util.js`).

- **`appeal(w)`** (`character.js`): `beauty*0.4 + charisma*0.2 + charm*0.1 + popularity*0.5 + fxAdd('appeal') + incenseAdd('appeal')`.
- **Service quality (`qualityOf(w, act)`, `services.js`)**:
  - Without act (company): `(service*0.5 + beauty*0.25 + charm*0.25)/100`
  - With act: `(actSkill*0.45 + beauty*0.25 + charm*0.15 + svcStat*0.15)/100 * fxSub('actQuality', act)`
- **Madame (`madF`, `madameScore`, `week.js` / `economy.js`)**: `manage` + weighted `wits` (0.4), `charm` (0.35), `charisma` (0.25).
- **Security (`week.js`)**: `secPow` uses `combat + strength*0.3 + agility*0.25`; door tier/trait screening (`secScreen`) uses `wits*0.65 + charisma*0.2 + combat*0.15`; door crowd grace (`secGrace`) uses `charm*0.5 + charisma*0.5`.
- **Attendant (`attQFor`, `week.js`)**: `service*attendantSkillW + charm*attendantCharmW + wits*attendantWitsW`.
- **Promoter (`week.js`)**: draw `promoterBase + (charisma + service)/promoterDiv`.
- **Bartender (`week.js`)**: income uses `bar + charisma`, visitor capacity scales with `1 + barAgil * agility/100`, tips scale with `charisma`.
- **Dancer (`week.js`)**: income uses `dance * (0.8 + agility/250)`, tips scale with `charisma`, popularity gets `+1` at `agility >= 60`.
- **Host (`week.js`)**: waiting satisfaction scales with `0.6 + charm/125`.
- **Maid (`week.js`)**: tidiness adds `maidBase + service*maidPerSkill + agility*maidPerAgil` (times `(100 - tidy)/maidEase`).
- **Classroom (`week.js`)**: `teachPower` uses `manage` + `wits` (`witsW`); `learnPower` uses `wits` (`learnWits`).
- **Regulars (`regulars.js`)**: new-regular chance scales with `0.8 + charm/250`.
- **Pushy clients (`pushyCheck`, `services.js`)**: first tries talk-down `(wits*0.6 + charm*0.4)/100 * props.talkDown` (mood −2), before goddess guard / security / Sam / unhandled.
- **Cheapskate clients (`cMul`, `fx.js`)**: `cheat` cancels up to 50% of the fee penalty linearly as `wits` approaches 100.
- **`wageFor(w)` (`character.js`)**: averages all 8 `STAT_KEYS`.
- **Weekly `statXP` (`week.js`)**: madame → `wits 1, refinement 0.5, charisma 0.5`; host/attendant → `refinement 0.5 x refK`; chapel → `refinement 0.5 + 0.5 x refK`; courtesan → `refinement` up to `1 x refK`; promoter → `charisma 1.5`; host → `charm 1.5`; attendant → `charm 1, wits 1`; teacher → `wits 1.5`; classroom learner → `wits 0.3`; dancer → `agility 1, charisma 0.5, beauty 1`; security → `agility 0.5, strength 0.5, wits 0.5, charisma 0.3`; maid → `agility 0.3, stamina 0.3`; chapel → `charm 1`; bartender → `charisma 1.5, agility 0.3`; bath → `stamina 1, charm 1`; courtesan → `stamina` (up to `3`).

## 3. Service stats (`data/services.json`)

Each giving/solo service defines `"stats": {...}` for the `svcStat` quality term (receiving `_get` services have none and fall back to `charm`). When `svc.staminaEnergy` is true in `balance.json`, services listing `stamina` also multiply energy cost by `1.1 - stamina/500`.

| Service | Stats |
|---|---|
| `massage_give` | `strength` 0.5, `agility` 0.5 |
| `kiss` | `charm` 1 |
| `manual_give` | `agility` 1 |
| `oral_give` | `stamina` 1 |
| `breast_give` | `stamina` 1 |
| `missionary` | `charm` 0.5, `stamina` 0.5 |
| `cowgirl` | `agility` 0.5, `stamina` 0.5 |
| `doggy` | `stamina` 0.5, `strength` 0.5 |
| all `*_get` | — (no `stats`; falls back to `charm`) |

### Tier 3: who leads

| Service | Role | Fields |
|---|---|---|
| `missionary` | Face to face, the one clients come back for: cheapest on her energy of the three, and a satisfied client is 1.5x as likely to become her regular | `regular: 1.5` |
| `cowgirl` | She leads: dearest and most tiring, but her own skill sets a floor on how good it is for her (`actTech`), so she reliably spends lust and is rarely left frustrated | `selfLed: true` |
| `doggy` | He leads: easiest on her energy, and his technique counts 1.6x in both directions, so it is the best release with a skilled client and the most frustrating with a clumsy one | `techLed: 1.6` |

### Refinement and House Class (`balance.json → refine`)

`refK(h) = clamp((class - from)/(100 - from), 0, 1)` (from 35), `refScore(w) = clamp((Refinement - 50)/50, -0.5, 1)`, `refMul(w, h, k) = 1 + refine[k] x refScore x refK`.
Applied to: every courtesan / step-in fee in the house (`fee` 0.25), client satisfaction (`sat` 6, flat), the madame's strength `madF` (`madame` 0.2), host soothing (`host` 0.3), attendant quality `attQFor` (`attendant` 0.3), chapel donations (`chapel` 0.3).
A Rowdy or Casual house ignores Refinement; a Prestigious one pays up to +25% for polish and docks up to 12.5% for the lack of it. Courtesans, hosts, attendants and chapel keepers gain a little Refinement each week, more in an upscale house.

## 4. Client stat preferences

Client classes (`data/economy.json → classes`) and client traits (`data/balance.json → clients.traits`) can define `"stats": {stat: weight}`.
`statPrefScore` (`js/logic/fx.js`) computes the weighted average of `clamp((s100(statOf(w, k)) - 50) / 50, -0.5, 1)`.
`balance.json → clients.statPref` (`draw: 0.4, sat: 8, fee: 0.4`) applies it to pick weight, satisfaction, and main service fee. Never exposed to AI text or image prompts.

- **Classes (14):** `commoner` (beauty/stamina), `farmhand` (charm/stamina), `sailor` (stamina/charisma), `adventurer` (agility/strength), `mercenary` (strength .7/stamina .3), `merchant` (charisma/wits), `artisan` (wits/beauty), `scholar` (wits), `noble` (refinement 1.5), `official` (refinement/wits), `bard` (charisma .6/wits .4), `pilgrim` (charm), `cleric` (charm/refinement), `watchman` (strength/agility).
- **Notable stat-focused traits:** `connoisseur`, `chatty`, `lonely`, `shy`, `romantic`, `rowdy`, `dancerFan`, `vanilla`, `firstTimer`, `pleaser`, `older`, `curious` (`wits`), `troubled` (`charm`, charmGate), `thrillSeeker` (`agility/stamina`), `brawnFan` (`strength .7/stamina .3`), `graceSeeker` (`agility .7/beauty .3`), `devotedGuest` (`charm/refinement`), `tavernRegular` (`charisma .6/stamina .4`), `neatFreak` (`refinement .6/wits .4`), `staminaTester` (`stamina .7/strength .3`).

## 5. Creation, race mods & data seeding

- **Generic creation (`genWorker`, `character.js`):** rolls all 8 stats from `base()`, applies `persLean` (`data/personalities.json → stats`), and keeps race/sub `mods` (`data/races.json`), trait/title/body `fx.stats`, and outfit `stats` as a live bonus layer (`statBonus`).
- **Race mods (`data/races.json`, `0-100` live bonus scale):**
  - `human`: charm +5
  - `elf`: refinement +10, beauty +5, wits +5, stamina −5
  - `beastkin`: stamina +10, agility +5, refinement −5, wits −5 (subs: `fox` wits +5/charisma +5/beauty +5, `cat` agility +10/charisma +5, `wolf` stamina +10/strength +5/charm +5, `rabbit` agility +5/charm +5/beauty +5, `dragon` strength +5/stamina +10/charisma +5/agility −5)
  - `demon`: charisma +10, wits +5, charm −5, lewd +15
  - `dwarf`: strength +10, stamina +5, wits +5, beauty −5
  - `spirit`: charm +10, refinement +5, strength −10
  - `angel`: refinement +10, beauty +5, charm +5, strength −5 (sub `lantern`: charm +5, charisma +5)
  - `android`: stamina +5, refinement +5, wits +10, charm −5
- **Named ladies (36 in `data/characters/`, 110 in `data/guests/`):** `tools/seed-stats.mjs` fills missing `charisma`/`wits` using `tools/seeded-stats.json` (never overwriting hand-edited entries) and writes `tools/stat-review.csv`.
- **Earnable stat traits (`data/traits/earnable.json`):** `Sharp Mind` (wits +10, 20 `lessons`), `Magnetic` (charisma +10, 25 weeks promoting), `Light on Her Feet` (agility +10, 30 weeks dancing), alongside `dates.json`, `titles.json`, and `wardrobe.json` stat bonuses.
