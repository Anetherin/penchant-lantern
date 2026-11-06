// Re-formats the data/*.json files: 2-space indent, short arrays and small objects kept on one line.
// Usage: node tools/fmt-json.mjs
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
function fmt(v, ind=''){
  const one = JSON.stringify(v);
  if(v===null || typeof v!=='object' || (one.length <= 140 && !(Array.isArray(v) && v.some(x=>typeof x==='string' && x.length>60)))) return one;
  const n = ind + '  ';
  if(Array.isArray(v)) return '[\n' + v.map(x=>n+fmt(x,n)).join(',\n') + '\n' + ind + ']';
  return '{\n' + Object.entries(v).map(([k,x])=>n+JSON.stringify(k)+': '+fmt(x,n)).join(',\n') + '\n' + ind + '}';
}
for(const f of fs.readdirSync(path.join(root,'data')).filter(f=>f.endsWith('.json'))){
  const p = path.join(root,'data',f);
  fs.writeFileSync(p, fmt(JSON.parse(fs.readFileSync(p,'utf8'))) + '\n');
}
console.log('formatted data/*.json');
