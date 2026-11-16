# Balance lab notes

Made with `tools/lab` (see `tools/lab/README.md`); rerun any spec with `node tools/lab/lab.mjs <spec>` (available specs live in `tools/lab/exp/`).
Results below use the lab's fixed policy player (`tools/lab/bot.js`) and 12–16 paired seeds unless noted. Δ figures are paired means; "±" is the 95% CI.

> [!NOTE]
> Pass 1 (2026-11-10) and Pass 2 (2026-11-11) were measured **before** the later queue/security/crowding overhaul, house class/prestige system, and Cycle-1 / NG+ debt rebalance in `balance.json` and `economy.json`. Re-run the specs in `tools/lab/exp/` (`houses-all`, `jobs-all`, `ngplus-houses`, `ngpp`, `pricing-campaign`, `amenities`, `sam-actions-campaign`, `races`) for current numbers.

## Current tuning highlights (`balance.json` / `economy.json`)
- **Queue, security & crowding (`clients.wait`, `clients.crowd`, `clients.host`):** overflow clients wait instead of vanishing immediately (`waitBuf` from door, hosts, bar, stage); Wits-based security screens client value/traits (`screenMerchant`, `screenNoble`, `screenTrimLow`, `screenSafe`) and Charm/Charisma caps excess overflow cleanly; `crowd.perSpace` (5) caps comfortable capacity before satisfaction/bail/rep penalties.
- **House class & popularity (`prestige`):** house `rep` is **House Popularity**; `h.prestige` (`0–100`) tracks **House Class** toward a structural target (tier, beds, decor, drinks, price, amenities, tidiness, attendants, leadership) plus operational shifts. Low prestige favors demand and propositions; high prestige attracts merchants/nobles and raises quality/amenity expectations.
- **NG+ & Cycle-1 debt (`debt`, `ngplus`):** Cycle 1 uses `13` payments every `4` weeks (`ramp: 8`); NG+ trims up to 1 payment / 0.75 ramp per cycle (`minPayments: 11`, `minRamp: 4`) and adds `debtShare: 0.9`, `perCycle: 0.35`, `keptHouseShare: 0.25`, `perLover: 0.08`, `loverDebt: 1500` (`perKeptHouse: 0`).
- **Tidiness & Promoters (`tidy`, `jobs`):** `tidy.high: 80`, `low: 50`, `bad: 30`, `maidEase: 35`, `maidMax: 1.5`; promoters draw `2 + (Charisma + Hospitality)/15` (`promoterLowRep: 0.4`, `promoterStack: 0.6`, `promoterRep: 0.03`), and free samples shift `h.prestige` vs the promoter's polish.

## Historical baseline: Pass 2 (2026-11-11, pre-queue/prestige/debt overhaul)

Snapshot comparison from `tools/lab` on the 2026-11-11 tuning (security `endNight` + on-the-spot Sam rescue, diminishing maid tidiness, promoter low-rep boost, `8 + Technique×0.08` skill training, `debt.ngplus.fewer/flatter: 0`):

| | before | after |
|---|---|---|
| Manor (Hollowmere) cycle 1 | 33 wks, mid 1,220/wk | 29 wks, mid 1,560/wk |
| first promoter vs none (mid / late) | ≈ −30 / −100 | +110 / +275 per week |
| no maid (mid tidiness / rep gain over 12 wks) | 54 / 3 | 28 / 2, demand −20% once <30 |
| unhandled incidents per week | 1.3 (after-report event) | 0.3–0.4, each ends a night |
| one-on-one skill training over a campaign | +8.3 wks vs bartending, worse than napping | +3.4 wks, like rounds/demos |
| NG+ cycle 2 with 0 / 1 / 3 / 5 lovers | 60% game over / 34 / 33 / 29 wks | 42 / 36 / 35 / 32 wks, no game overs |
| NG+ cycles 2-5, every house kept | 34, 26, then 70% game over at cycle 4 | 35, 29, 36, 33 wks; ≤10% game over |
| NG+ cycles 2-5, home house only | 34, 32, 34, 34 | 35, 38, 39, 40 wks |
| NG+ boons spread | −7.6 (Deep Pockets) … +1.6 wks | −0.8 … +4.2 wks |

Sam's spare action over cycle 1 (`sam-actions-campaign`, Δ weeks vs bartending at 33): stat class +0.5, skill class +0.7, books +1, scouting/napping +1.8, dates +2, stat coaching +2.5, rounds +3, skill training +3.4, service practice +4.2, demonstrations +4.4.
What a stat point was worth (`stat-value`): +5 to every stat on every lady ≈ +220/wk mid; Beauty and Stamina ≈ 2.5g/wk per point, Charm ~1.2.

### Open questions to re-check after recent changes
1. **Support jobs vs courtesan slot:** stacking multiple support ladies beyond the first maid/promoter/host/attendant still trades away courtesan slot revenue (`jobs-all`, `roles-comp`).
2. **House and NG+ balance:** re-benchmark all 15 standard/NG+ houses (`houses-all`, `ngplus-houses`, `ngpp`) after the Cycle-1 / NG+ debt and `prestige` changes.
3. **Race & amenity balance:** re-check `races`, `amenities`, `sanctuary-chapel`, and `demon-sigil` under the current queue/prestige rules.
