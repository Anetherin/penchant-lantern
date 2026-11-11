# The goddess (Seliora, the Lamplighter)

The overarching story. Code: `js/logic/goddess.js`. Story wording, her look and forms: `data/goddess.json`. Her remarks about houses and past lives: `economy.json → houses[id].goddess`, `pasts[k].goddess`; about partners: `characters.json → <key>.goddess`. Her lines with ladies: `services.json → pair.fem/futa` (generic two-women lines); with Sam: the usual `flavor.json → private_act`. Numbers: `data/balance.json → goddess`.
Test: `node tools/goddess-smoke.mjs [weeks per cycle]` (plays to the binding, every focus, nights until her ending).

## Arc
- **Cycle 1:** she brings Sam over. Her intro plays before Marguerite's welcome and comments on his past life, his house and his partner (including how she had a hand in meeting her). No events in cycle 1.
- **Every rebirth (NG+):** a scene before the Vane contract. It reacts to how fast he paid, which lovers he brought, a new past life, the new house and the new partner, plus a jealousy line.
- **Cycles 2-5:** weekly chance of an event (`events.perCycle` x (cycle-1), max `events.max`). Her tease scenes run in order (`teases`, gated by `minCycle`): a kiss in cycle 2, escalating, with Sam inside her by cycles 4-5, but she always stops him before he finishes. Jealous remarks fill the gaps. Love comes from your answers. Jealousy grows with new hires, private time with others, roster size and lovers carried.
- **The binding:** at the first rebirth after any lady has lived a fully reincarnated life (`w.reborn > fullReborn`, default 4, so the start of cycle 6 at the earliest). She lets him finish, loses her divinity (`divinity.bindTo`) and is bound to him.
- **After the binding:** she gets her own tab.
  - You set a focus (Indulge / Business / Watch / Tutelage / Whim) and a form (herself / something more / as she pleases). She takes 1 action per week, plus 1 per 25 divinity.
  - When jealous she sometimes "claims" Sam or a new lady instead. When unhappy she ignores your guidance.
  - Her power scales with divinity and with fully reincarnated ladies (and their extra lives).
  - With the ladies (Indulge) she takes over a service herself: her female form does tier 1-2 services, her futa form any. Each has its own line (`services.json → pair.fem/futa`), and the lady practices that service.
  - Nights with Sam: pick a service; she does it as herself (the usual private-time lines with her name, image `samact:<act>` with her as the woman).
    - Finishing inside her (a finishing tier-3 service) restores Sam's energy and raises divinity, love and mood, and cuts jealousy.
    - Finishing outside her gives half the energy and a little love, but she sulks.
    - No finish costs mood and love.
  - Neglect: from `neglect.after` (3) weeks without a night she loses love and mood every week. A jealous claim on a lady that Sam doesn't answer with a night within `neglect.claimWeeks` (2) costs extra.
- **Ending:** at full divinity she stays if her love is at least `love.stay` (70) and keeps her full power. Otherwise she leaves for good. A player who keeps coming to her ends well; one who only uses her for divinity and ignores her doesn't.
- **Backstory:** she claims she picked Sam on a whim. In truth she had watched him for years in his old world (the stray cat). It slips out in the later teases and comes out at the binding.

## State
`S.goddess` {met, bound, boundCycle, love, jealousy, mood, divinity, focus, form, teases[], evWk, roster, ending, left, nights, finishes, last[]}. Save v30. It carries through NG+ untouched.
Hooks: `goddessPlan()` at the start of `endWeek`, `goddessAfter(R)` after the houses run, `goddessGuard(h)` in `pushyCheck`, `goddessRebirth()` at the end of `ngBegin`, `goddessIntro()` in `setupBegin`, and `goddessHouseNote()` on house purchase.

## Forms
She has one form per race (`goddess.json → forms`: build, body, skin, features; beastkin needs `sub`). `look` holds what never changes: hair, eyes, a signature feature (a lantern-flame at her shoulder, gold markings) and her outfit, so she's recognizable in every form. Each form is its own NPC (`npc_goddess_<race>`, so images are saved per form). Story scenes before the binding use `trueForm`. After it you pick a form on her tab or let her change each week (`S.goddess.shape`, 'auto' rolls `autoShape` in `goddessPlan`).
