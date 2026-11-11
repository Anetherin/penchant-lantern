// Seeds `charisma` and `wits` into the stats block of every named lady (characters.json + guests.json packs).
// Usage: node tools/seed-stats.mjs   (then: node tools/fmt-json.mjs)
// Marker: tools/seeded-stats.json lists the ladies this script has seeded (safe to recompute); anyone who already has
// both stats and is not listed is treated as hand-edited and left alone. Only charisma/wits are ever written.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rd = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const chars = rd('data/characters.json'), guests = rd('data/guests.json'), pers = rd('data/personalities.json');
const markerFile = path.join(root, 'tools/seeded-stats.json');
const seededSet = new Set(fs.existsSync(markerFile) ? JSON.parse(fs.readFileSync(markerFile, 'utf8')) : []);

// docs/STATS.md §5 (charisma/wits parts only); used when personalities.json has no `stats` lean for the entry
const PERS = {
  'Cheerful and teasing': { charisma: 8 }, 'Calm and elegant': {}, 'Shy but earnest': { charisma: -8 },
  'Proud and sharp-tongued': { wits: 8, charisma: 4 }, 'Laid-back and lazy': { wits: -3 },
  'Bold and flirtatious': { charisma: 10 }, 'Bookish and curious': { wits: 12, charisma: -6 }, 'Warm and motherly': {},
  'Mysterious and aloof': { charisma: 6, wits: 4 }, 'Hot-blooded and competitive': { charisma: 6 },
  'Gloomy but devoted': { charisma: -8 }, 'Scheming and charming': { wits: 8, charisma: 6 },
  'Earnest and dutiful': { wits: 4 }, 'Free-spirited wanderer': { charisma: 6 }, 'Cold and professional': { wits: 6 },
  'Playful trickster': { wits: 6, charisma: 4 }, 'Gentle and dreamy': { wits: 2 }, 'Stoic and blunt': { wits: 2 },
};
const TRAIT = {
  Studious: { wits: 8 }, Shrewd: { wits: 8 }, 'Quick Learner': { wits: 5 }, 'Trade-Wise': { wits: 5 }, Organised: { wits: 5 },
  'Level-Headed': { wits: 5 }, 'Natural Performer': { charisma: 8 }, 'Crowd Favorite': { charisma: 8 }, Showy: { charisma: 5 },
  'Bold Laugh': { charisma: 5 }, 'Town Crier': { charisma: 8 }, Headliner: { charisma: 5 }, 'Silver-Tongued': { charisma: 5 },
};
const JOB = { madame: { wits: 5 }, dancer: { charisma: 5 }, promoter: { charisma: 5 }, teacher: { wits: 8 }, attendant: { wits: 3 } };
const KW_W = /scholar|mage|clerk|inventor|alchemist|librarian|scribe|tactician|strategist|engineer/i;
const KW_C = /singer|performer|idol|captain|commander|actress|bard|dancer|queen|leader/i;
const clamp = v => Math.max(5, Math.min(95, Math.round(v)));

function persLean(p) {
  const e = pers[p];
  if (e && e.stats && typeof e.stats === 'object') return e.stats;
  return PERS[p] || {};
}
function compute(d) {
  let c = d.stats.charm, w = d.stats.refinement;
  const pl = persLean(d.personality);
  c += pl.charisma || 0; w += pl.wits || 0;
  for (const t of d.traits || []) { const l = TRAIT[t]; if (l) { c += (l.charisma || 0) / 2; w += (l.wits || 0) / 2; } }
  const jl = JOB[d.job]; if (jl) { c += jl.charisma || 0; w += jl.wits || 0; }
  const bs = d.backstory || '';
  if (KW_W.test(bs)) w += 5;
  if (KW_C.test(bs)) c += 5;
  return { charisma: clamp(c), wits: clamp(w) };
}
function insert(stats, vals) {   // keep existing order; new keys land after charm / refinement
  const out = {};
  for (const [k, v] of Object.entries(stats)) {
    if (k === 'charisma' || k === 'wits') { out[k] = vals[k]; continue; }
    out[k] = v;
    if (k === 'charm' && !('charisma' in stats)) out.charisma = vals.charisma;
    if (k === 'refinement' && !('wits' in stats)) out.wits = vals.wits;
  }
  return out;
}
const rows = []; let seeded = 0, skipped = 0;
function visit(file, key, d, label) {
  const id = `${file}:${label}`;
  const has = 'charisma' in d.stats && 'wits' in d.stats;
  if (has && !seededSet.has(id)) { skipped++; return null; }
  const vals = compute(d);
  const stats = insert(d.stats, vals);
  seededSet.add(id); seeded++;
  rows.push([file, key, d.name, d.personality, (d.traits || []).join(';'), d.job || '', d.stats.charm, d.stats.refinement, vals.charisma, vals.wits]);
  return stats;
}
for (const [k, d] of Object.entries(chars)) {
  if (k.startsWith('_') || !d || !d.stats) continue;
  const s = visit('characters.json', k, d, k); if (s) d.stats = s;
}
(function walk(o, p) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return;
  if (o.stats && typeof o.stats === 'object' && 'charm' in o.stats) {
    const s = visit('guests.json', p[p.length - 1], o, p.join('/')); if (s) o.stats = s;
    return;
  }
  for (const k of Object.keys(o)) walk(o[k], [...p, k]);
})(guests.packs, []);

fs.writeFileSync(path.join(root, 'data/characters.json'), JSON.stringify(chars, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'data/guests.json'), JSON.stringify(guests, null, 2) + '\n');
fs.writeFileSync(markerFile, JSON.stringify([...seededSet].sort(), null, 1) + '\n');
const q = s => `"${String(s ?? '').replace(/"/g, '""')}"`;
const head = 'file,key,name,personality,traits,job,charm,refinement,charisma,wits';
fs.writeFileSync(path.join(root, 'tools/stat-review.csv'), head + '\n' + rows.map(r => r.map((x, i) => i < 6 ? q(x) : x).join(',')).join('\n') + '\n');
console.log(`seeded ${seeded}, skipped ${skipped} (hand-edited)`);
