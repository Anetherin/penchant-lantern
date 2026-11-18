// Checks the sources the loader uses: every script in loader.js (FILES) exists, and every data set (DATA_FILES) loads
// with no key defined in two part files (the later one would silently win in the game).
// Usage: node tools/check-data.mjs   (npm run check:data)
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { loadData } from './data.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const loader = fs.readFileSync(path.join(root, 'loader.js'), 'utf8');
const files = [...loader.matchAll(/^\s*'(js\/[^']+\.js)',?$/gm)].map(m => m[1]);
const dataNames = [...loader.match(/var DATA_FILES = \[([^\]]*)\]/)[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
const problems = files.filter(f => !fs.existsSync(path.join(root, f))).map(f => `missing script ${f}`);
for (const n of dataNames) {
  try { problems.push(...loadData(n).conflicts.map(c => `defined in more than one part: ${c}`)); }
  catch (e) { problems.push(`data/${n}: ${e.message}`); }
}
if (problems.length) { console.error('Problems:\n  ' + problems.join('\n  ')); process.exit(1); }
console.log(`OK: ${files.length} scripts, ${dataNames.length} data sets`);
