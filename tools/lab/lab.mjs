// Balance lab runner. Usage:
//   node tools/lab/lab.mjs <spec.json | name in tools/lab/exp> [--runs N] [--conc N] [--weeks N] [--seed N] [--only a,b] [--quiet]
//   node tools/lab/lab.mjs --inline '{"scenario":"campaign","variants":[{"name":"base"}]}'
// Every variant is run on the same seeds 1..N, and from the start of the measured phase all variants share one random
// stream, so differences between variants are paired (same ladies, same clients, same events) and need far fewer runs.
// Output: a markdown report on stdout and tools/lab/out/<name>.json / .md. See tools/lab/README.md.
import { runSpec } from './run.mjs';
const argv = process.argv.slice(2), opt = {}, pos = [];
for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) { const k = argv[i].slice(2); opt[k] = (argv[i + 1] && !argv[i + 1].startsWith('--')) ? argv[++i] : true; } else pos.push(argv[i]); }
if (!opt.inline && !pos[0]) { console.error('usage: node tools/lab/lab.mjs <spec.json|name> [--runs N] [--conc N]'); process.exit(1); }
const { md } = await runSpec(opt.inline ? JSON.parse(opt.inline) : pos[0], opt);
console.log(md);
