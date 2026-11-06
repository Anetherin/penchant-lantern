// Builds a single self-contained HTML file (dist/hollowmere-nights.html) from the split sources.
// Usage: node tools/build.mjs
// Useful as a fallback: paste the result straight into Perchance's HTML panel (no GitHub Pages needed).
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const loader = fs.readFileSync(path.join(root, 'loader.js'), 'utf8');
const files = [...loader.matchAll(/^\s*'(js\/[^']+\.js)',?$/gm)].map(m => m[1]);
const markup = [...loader.match(/var MARKUP = \[([\s\S]*?)\]\.join/)[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(m => m[1].replace(/\\'/g, "'")).join('\n');
const css = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
const js = files.map(f => `/* ---- ${f} ---- */\n` + fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hollowmere Nights</title>
<!-- Built from github.com/Topofira/penchant-lantern by tools/build.mjs. Lists panel: t2i = {import:text-to-image-plugin} / ai = {import:ai-text-plugin} -->
<style>
${css}</style>
</head>
<body>
${markup}
<script>
window.PL_PLUGINS = { t2i: (typeof t2i!=='undefined')?t2i:null, ai: (typeof ai!=='undefined')?ai:null };
</script>
<script>
${js}
</script>
</body>
</html>
`;
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/hollowmere-nights.html'), html);
console.log(`Built dist/hollowmere-nights.html from ${files.length} scripts (${(html.length/1024).toFixed(0)} KB)`);
