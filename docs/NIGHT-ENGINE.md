# Night Engine (design draft)

Status: **design only, nothing implemented.** A per-client, time-stepped replacement for the aggregate night
resolution in `simHouse` (`js/logic/week.js`). One engine, two views: it runs headless for every house and the
report is written from its event log; for one house per week the player can **watch** the same nights play out
(tower-defense style). Numbers below are placeholders; tune them in the balance lab.

## Goals
- Clients are individuals who move around the house until they leave, instead of weekly counts split over nights.
- Staff jobs act like towers / modifiers on that flow (security gates, hosts stall, promoters raise the wave,
  attendants are equipped onto courtesans, the madame routes).
- **No player input during a night.** All decisions happen beforehand (jobs, rooms, attendants, focus, amenities).
  Watching never changes the outcome: same seed, same result whether watched, skipped or headless.
- Scales to 5+ houses: only one house is watched per week, the rest resolve headless with the same code.
- Keep the existing balance meaning: energy, Health wear, incidents, pushy clients, walkouts, reputation, prestige,
  demand and client classes keep their current data and roles.

## Structure of a week
- Week = rest day + **six work nights = six waves.** (Waves could vary later, e.g. festival nights or town events
  adding a seventh or a double wave; not in v1.)
- **Bed is recovery between waves**: after each wave everyone who worked sleeps (`nightRest` as today: bed x
  Strength recovery x tidiness x `rest.night`, Health wear by energy spent). Demons feed, androids charge, spirits
  take no bed.
- The rest day and Sam's actions are unchanged.

## Watched house
- One house per week can be watched: by default **the cycle's starting house** (where Sam and the partner are).
- Optional: the Teleport Circle (`samVisitReach()`) lets the player pick which house to watch.
- Playback controls only: play, 1x / 4x speed, skip to report. No interventions.

## Time model
- A night is `ticks` long (e.g. 120 ticks; 1 tick ≈ 3 minutes in fiction). Clients arrive in a spawn curve over
  the first part of the night (busy middle, thin tail); the night ends when the clock runs out and remaining
  clients are wrapped up (served ones leave happy, waiting ones leave unhappy at a reduced penalty, "closing time").
- **No nightly client caps.** `nightCapOf` / `balance.json → nights.perStamina` go away. What limits a lady is
  **time** (how long each client occupies her) and **energy** (service costs, unchanged). Stamina keeps feeding
  max energy.

### Service duration
Each service takes `dur` ticks:

```
dur = service.dur                       // new field in services.json, by tier (light ≈ 4, tier 2 ≈ 8, tier 3 ≈ 12)
    x client.durMul                     // class + traits (below)
    x lady speed                        // skill / technique: a skilled lady finishes faster
    x host / attendant effects          // warm-up shortens, attendant adds polish but not time
```

Client traits that change duration (existing `balance.json → clients.traits`):
- `firstTimer` – slower (nerves, talking), cheaper to satisfy.
- `connoisseur` – slower, wants high quality; pays more when he gets it.
- `staminaTester` – long and energy-hungry; may go again.
- `chatty`, `lonely`, `romantic` – extra non-service time (company), which hosts can absorb instead of a courtesan.
- `impatient` – short, low patience; `patient` – the reverse.
- Lady's skill in the service (`acts[id].skill`), Technique-like stats, and fx (e.g. beastkin go-again) modify it.

## The client as an agent
Built by `makeClient` as today (class, tier, sex, 1-3 traits), plus run-time values:

| value | meaning | source |
|---|---|---|
| `money` | what he can spend tonight | class `mult` x tier purse, `bigSpender`/`cheapskate`/`generous` |
| `stamina` | how many full services he can take | class `stamina`, traits (`staminaTester`) |
| `desire` | what he still wants (service kinds + amount) | class `wants`, trait `wants` |
| `sat` | satisfaction so far | quality of what he got, matches (`statPrefScore`, likes) |
| `patience` | drops while idle, refilled by being entertained | `clients.wait`, trait `patience`, amenities |

### Places (the map)
`door` → `lounge` (with `bar`, `stage` if built) → `rooms` (one per courtesan room) → `exit`.
Side places, if built: `bath`, `chapel`. Exhibitionists can serve **in the lounge / on stage** and need no room.

### Each tick, a client:
1. If **satisfied** (`desire` met): may **linger** (drinks, stage, a host's company) while he has money and
   patience, spending a little; otherwise leaves happy.
2. If **broke** (`money` ≈ 0): leaves. Some won't (the existing `linger` incident type): security has to get them
   out; unhandled = the incident's penalties.
3. If **out of patience**: walks out (existing `leaveSat` / `leaveRep` / `leaveIncident`).
4. Otherwise seeks his next want: the **madame routes him** to the best free option (or takes him herself if she
   fits and is free); without a madame he picks the nearest free option, worse matches.
5. While waiting, patience drops (`clients.wait`), slowed by host / bar / stage / decor / garden as today.

### Side places
- **Bath** and **chapel** hold clients away from the lounge (they don't count toward crowding while there).
- Their services are partial / non-penetrative (chapel rules as today; Lantern Angel chapels can give full services).
  They meet some desire and spend some client stamina.
- A client who still has stamina and money afterwards **may walk back into the house** for a full service
  (chance by remaining desire). So baths and chapels both relieve pressure and feed the rooms.

## Staff as towers
| job | role in the flow |
|---|---|
| security | **Gate.** Screens arrivals by Wits (pushy / rowdy / tiers, as today), holds the door when full (Charm/Charisma), throws out lingering broke clients, handles incidents. Limited actions per wave. |
| promoter | **Wave size.** Raises how many and how rich clients arrive (harder night, more profit). Reads last week's walkouts as today. |
| madame | **Router.** Matches each client to the best lady; can take clients herself; shields mood as today. |
| attendant | **Equipped onto a courtesan.** Raises quality and sat, cuts the courtesan's energy cost, covers refused services. Spare ones stand in as courtesans (`syncAttendants` unchanged). |
| host | **Staller.** Keeps waiting clients patient, absorbs company time (`chatty`/`lonely`), warm-ups shorten the next service, can finish a client herself if a room is free. |
| bartender | **Queue income.** Drinks money from waiting clients, slows patience loss, raises propositions/rowdiness as today. |
| dancer | **Area buff.** Slows patience loss for everyone in the lounge, raises spend; `dancerFan` clients may stay just for her. |
| courtesan | **Destination.** Serves in her room; throughput = night length / service time, while energy lasts. |
| exhibitionist (trait) | Serves in the lounge/stage without a room; raises nearby clients' desire (and staff lewdness as today). |
| maid | **Repairs between waves**: tidiness drops with traffic during the wave, maids restore it after. |
| bath / chapel keepers | Run the side places above. |
| teacher | Unaffected (daytime). |

Sam's weekly focus applies as today: Office ≈ a second router (madame-style matching), Watch ≈ extra security power,
Floor ≈ lounge buff / bar income. The goddess's guard against pushy clients stays.

## Outcomes and the report
- Money, sat, reputation, prestige, incidents, energy, Health wear, lust, lewdness, trust, bonds come out of the
  per-client events exactly as the aggregate sim produces them today (same functions where possible:
  `runService`, `serveAct`, `pushyCheck`, `nightIncidents`, `repAdd`, `updatePrestige`).
- Every event goes into a per-house log; `showReport` builds the same report groups from it. Highlights
  (`hl`, images, text) are picked from the log as now.

## Data changes (proposed)
- `services.json`: add `dur` per service.
- `balance.json → night` (new): `ticks`, spawn curve, linger/return chances, money/stamina per class,
  closing-time penalty, watch speed. `nights.perStamina` / caps removed after cut-over.
- `economy.json → classes`: purse and stamina per class if not derivable from `mult` / `stamina`.
- Optional: per-house layout hints (which places exist come from amenities already).

## Migration plan
1. **Prototype** `js/logic/night.js` beside `simHouse` (no UI), driven by the same data, behind a setting.
2. **Parity in the lab**: run both engines over the same seeds and houses (early / mid / late / NG+), compare
   weekly income, walkouts, incidents, energy and Health. Tune `night` numbers until totals land within tolerance.
3. **Watch view**: a simple house map (door, lounge, rooms, side places) with client tokens, playback only.
4. **Cut-over**: make it the night engine, remove the aggregate client flow from `simHouse`, keep the bot and
   `tools/lab/checks.json` green. Bump `S.v` only if save shape changes (probably not: it's per-week transient).

## Open questions
- Exact night length and arrival curve; whether night length differs by house (e.g. Manor slow, Hollow busy).
- Does a client ever visit two ladies in one night (desire left after the first)? Proposed: yes if money/stamina remain.
- Women clients: same agent; they go to the ladies only (Sam takes no clients).
- Waves beyond six (festivals, town events) – later.
- How much of `crowdCap` survives: probably replaced by actual lounge capacity.
