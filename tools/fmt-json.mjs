// Re-formats the data/**/*.json files (split data folders included): 2-space indent, short arrays and small objects kept on one line.
// Usage: node tools/fmt-json.mjs
import fs from 'node:fs';
import { allDataFiles } from './data.mjs';
function fmt(v, ind=''){
  const one = JSON.stringify(v);
  if(v===null || typeof v!=='object' || (one.length <= 140 && !(Array.isArray(v) && v.some(x=>typeof x==='string' && x.length>60)))) return one;
  const n = ind + '  ';
  if(Array.isArray(v)) return '[\n' + v.map(x=>n+fmt(x,n)).join(',\n') + '\n' + ind + ']';
  return '{\n' + Object.entries(v).map(([k,x])=>n+JSON.stringify(k)+': '+fmt(x,n)).join(',\n') + '\n' + ind + '}';
}
for(const p of allDataFiles()){
  fs.writeFileSync(p, fmt(JSON.parse(fs.readFileSync(p,'utf8'))) + '\n');
}
console.log('formatted data/**/*.json');
