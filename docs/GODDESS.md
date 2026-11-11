# The goddess (Seliora, the Lamplighter)

The overarching story. Code: `js/logic/goddess.js`. Wording and her look: `data/goddess.json`. Numbers: `data/balance.json → goddess`.
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
  - Sam's actions with her: a night (restores his energy, +divinity) and a talk (+love). Nights barely move her love.
- **Ending:** at full divinity she stays if her love is at least `love.stay` (70) and keeps her full power. Otherwise she leaves for good.

## State
`S.goddess` {met, bound, boundCycle, love, jealousy, mood, divinity, focus, form, teases[], evWk, roster, ending, left, nights, finishes, last[]}. Save v30. It carries through NG+ untouched.
Hooks: `goddessPlan()` at the start of `endWeek`, `goddessAfter(R)` after the houses run, `goddessGuard(h)` in `pushyCheck`, `goddessRebirth()` at the end of `ngBegin`, `goddessIntro()` in `setupBegin`, and `goddessHouseNote()` on house purchase.
