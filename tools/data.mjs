// Shared data loading for the node tools. Mirrors loader.js:
//   data/<name>.json            a single file, or
//   data/<name>/index.json      a list of part names; data/<name>/<part>.json are deep-merged in that order.
// Merge rules (same as loadParts in loader.js): objects merge key by key, arrays are concatenated,
// any other value defined twice is a conflict (the later part wins; the tools report it).
import fs from 'node:fs';
import path from 'node:path';

export const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const loaderSrc = () => fs.readFileSync(path.join(root, 'loader.js'), 'utf8');
const listVar = (src, name) => [...src.match(new RegExp(`var ${name} = \\[([^\\]]*)\\]`))[1].matchAll(/'([^']+)'/g)].map(m => m[1]);

export const dataNames = () => listVar(loaderSrc(), 'DATA_FILES');
export const isSplit = name => fs.existsSync(path.join(root, 'data', name, 'index.json'));
export const readJSON = p => JSON.parse(fs.readFileSync(p, 'utf8'));

// [{part, file}] for a split data set, in merge order.
export function partFiles(name) {
  const dir = path.join(root, 'data', name);
  return readJSON(path.join(dir, 'index.json')).map(part => ({ part, file: path.join(dir, part + '.json') }));
}

export function mergeInto(dst, src, at = '', conflicts = []) {
  for (const [k, v] of Object.entries(src)) {
    const p = at ? at + '.' + k : k;
    if (!(k in dst)) { dst[k] = v; continue; }
    const d = dst[k];
    if (Array.isArray(d) && Array.isArray(v)) dst[k] = d.concat(v);
    else if (d && v && typeof d === 'object' && typeof v === 'object' && !Array.isArray(d) && !Array.isArray(v)) mergeInto(d, v, p, conflicts);
    else { conflicts.push(p); dst[k] = v; }
  }
  return conflicts;
}

// Returns {data, conflicts}. conflicts lists "part: key.path" for values defined in more than one part.
export function loadData(name) {
  if (!isSplit(name)) return { data: readJSON(path.join(root, 'data', name + '.json')), conflicts: [] };
  const data = {}, conflicts = [];
  for (const { part, file } of partFiles(name)) {
    const c = mergeInto(data, readJSON(file));
    conflicts.push(...c.map(k => `data/${name}/${part}.json: ${k}`));
  }
  return { data, conflicts };
}

// Every .json file under data/ (index.json files included).
export function allDataFiles(dir = path.join(root, 'data')) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? allDataFiles(path.join(dir, e.name)) : e.name.endsWith('.json') ? [path.join(dir, e.name)] : []);
}
