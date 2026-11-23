'use strict';
/* ---------- Silly mode ----------
   Settings → Silly mode (SET.silly). Rewrites the words you READ on screen with daft made-up ones from
   data/silly.json, keeping the meaning (cock → dinglehopper, fucking → smurfing). It works on the page's
   text nodes only (a MutationObserver on <body>), so image prompts, AI requests, saves and anything typed
   into a box never change. Skipped: <textarea>, <input>, <select>, <script>, <style>, <code>, <pre> and
   anything inside [data-nosilly]. Turning it off re-renders the view. */
const SILLY_SKIP = new Set(['TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'SCRIPT', 'STYLE', 'CODE', 'PRE']);
let SILLY_RX = null, SILLY_MAP = null, SILLY_OBS = null;

// English inflection, applied to the last word of a (possibly hyphenated / multi-word) phrase.
function sillyLast(p){ const m = p.match(/^(.*?)([A-Za-z]+)$/); return m ? [m[1], m[2]] : [p, '']; }
function sillyCVC(w){ return /[^aeiou][aeiou][^aeiouwxy]$/i.test(w) && (w.match(/[aeiouy]+/gi)||[]).length === 1; }
function sillyInflect(p, form){
  if(!form) return p;
  const [pre, w] = sillyLast(p);
  if(!w) return p;
  let o;
  if(form === 's') o = /(s|x|z|ch|sh)$/i.test(w) ? w + 'es' : /[^aeiou]y$/i.test(w) ? w.slice(0, -1) + 'ies' : w + 's';
  else if(form === 'ed') o = /e$/i.test(w) ? w + 'd' : /[^aeiou]y$/i.test(w) ? w.slice(0, -1) + 'ied' : sillyCVC(w) ? w + w.slice(-1) + 'ed' : w + 'ed';
  else if(form === 'ing') o = /ie$/i.test(w) ? w.slice(0, -2) + 'ying' : /[^e]e$/i.test(w) ? w.slice(0, -1) + 'ing' : sillyCVC(w) ? w + w.slice(-1) + 'ing' : w + 'ing';
  else o = w;
  return pre + o;
}

// Builds the lookup (every matched form → {opts, form}) and one regex for all of them.
function sillyBuild(){
  const D = (typeof DATA !== 'undefined' && DATA.silly) || {};
  const map = new Map();
  const add = (form, opts, f) => { const k = form.toLowerCase(); if(!map.has(k)) map.set(k, {opts, form: f, base: k}); };
  const clean = o => (Array.isArray(o) ? o : [o]).filter(x => typeof x === 'string' && x);
  for(const [k, v] of Object.entries(D.words || {})) if(k[0] !== '_') add(k, clean(v), '');
  for(const [k, v] of Object.entries(D.verbs || {})) if(k[0] !== '_'){ const o = clean(v);
    add(k, o, ''); add(sillyInflect(k, 's'), o, 's'); add(sillyInflect(k, 'ed'), o, 'ed'); add(sillyInflect(k, 'ing'), o, 'ing'); }
  for(const [k, v] of Object.entries(D.nouns || {})) if(k[0] !== '_'){ const o = clean(v); add(k, o, ''); add(sillyInflect(k, 's'), o, 's'); }
  for(const [k, v] of [...map]) if(!v.opts.length) map.delete(k);
  SILLY_MAP = map;
  const keys = [...map.keys()].sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+'));
  SILLY_RX = keys.length ? new RegExp(`\\b(?:${keys.join('|')})\\b`, 'gi') : null;
}
function sillyHash(s){ let h = 2166136261; for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function sillyCase(orig, out){
  if(orig.length > 1 && orig === orig.toUpperCase() && orig !== orig.toLowerCase()) return out.toUpperCase();
  if(orig[0] !== orig[0].toLowerCase()) return out[0].toUpperCase() + out.slice(1);
  return out;
}
// The same word gets the same pick throughout one passage, so a scene doesn't flip between words.
function sillyText(t){
  if(!SILLY_RX) sillyBuild();
  if(!SILLY_RX || !t || !/[A-Za-z]/.test(t)) return t;
  const seed = sillyHash(t);
  return t.replace(SILLY_RX, m => {
    const e = SILLY_MAP.get(m.toLowerCase().replace(/\s+/g, ' '));
    if(!e) return m;
    const pick = e.opts[sillyHash(e.opts[0] + seed) % e.opts.length];
    return sillyCase(m, sillyInflect(pick, e.form));
  });
}
function sillySkip(node){
  for(let el = node.parentElement; el; el = el.parentElement){
    if(SILLY_SKIP.has(el.tagName) || el.isContentEditable || (el.dataset && 'nosilly' in el.dataset)) return true;
  }
  return false;
}
function sillyNode(n){
  if(n.nodeType !== 3 || sillySkip(n)) return;
  const v = n.nodeValue, o = sillyText(v);
  if(o !== v) n.nodeValue = o;
}
function sillyTree(root){
  if(!root) return;
  if(root.nodeType === 3) return sillyNode(root);
  if(root.nodeType !== 1 || SILLY_SKIP.has(root.tagName)) return;
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const list = []; while(tw.nextNode()) list.push(tw.currentNode);
  list.forEach(sillyNode);
}
function sillyOn(){ return !!SET.silly; }
function sillyStart(){
  if(SILLY_OBS || typeof MutationObserver === 'undefined' || !document.body) return;
  sillyBuild();
  SILLY_OBS = new MutationObserver(recs => {
    for(const r of recs){
      if(r.type === 'characterData') sillyNode(r.target);
      else r.addedNodes.forEach(sillyTree);
    }
    SILLY_OBS.takeRecords();   // our own edits don't need another pass
  });
  SILLY_OBS.observe(document.body, {childList: true, subtree: true, characterData: true});
  sillyTree(document.body);
}
function sillyStop(){ if(SILLY_OBS){ SILLY_OBS.disconnect(); SILLY_OBS = null; } }
function sillySync(){ if(sillyOn()) sillyStart(); else sillyStop(); }
function setSilly(on){
  SET.silly = !!on; saveSettings(); sillySync();
  if(!on && typeof render === 'function') render();   // put the real words back
  toast(on ? 'Silly mode on. Everything is thingamabobs now.' : 'Silly mode off.');
}
function sillyCard(){
  return `<section class="card"><h2>Silly mode</h2><p class="muted">Swaps words in the text you read for made-up ones (dinglehoppers, smooching, bandersnatches…) so scenes mean the same thing in a completely different tone. Image prompts, AI requests and your saves are left alone. The word list is <code>data/silly.json</code>.</p>
    <div class="row"><label class="chk"><input type="checkbox" ${SET.silly?'checked':''} onchange="setSilly(this.checked)"> Silly mode</label></div></section>`;
}
sillySync();
