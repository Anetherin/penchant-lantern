'use strict';
/* =====================================================================
   SAFETY FILTER — strips youth-coded terms from every image prompt and
   character text field. All characters are adults.
   ===================================================================== */
const YOUTH_RE = /\b(child(ren|like|ish)?|kids?|loli(ta|con)?|shota(con)?|toddlers?|infants?|bab(y|ies)|pre-?teens?|underage|minors?|school ?girls?|middle ?school|high ?school|elementary|little girls?|young girls?|girlish|tiny body|(1[0-7]|[1-9]) ?(yo|y\/o|years? old))\b/gi;
function cleanText(s){
  return String(s ?? '').replace(YOUTH_RE,'').replace(/\s+,/g,',').replace(/,(\s*,)+/g,',')
    .replace(/\s{2,}/g,' ').replace(/^[,\s]+|[,\s]+$/g,'').trim();
}

/* =====================================================================
   UTIL + STORAGE
   ===================================================================== */
const $ = s => document.querySelector(s);
const rnd = (a,b) => a + Math.random()*(b-a);
const ri = (a,b) => Math.floor(rnd(a, b+1));
const pick = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => { const b=a.slice(); for(let i=b.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } return b; };
const clamp = (v,a=0,b=100) => Math.max(a, Math.min(b, v));
// Stats, skills and service skills run 0-1000 (SKL per 100-point step). Every formula that reads one goes through s100().
// Trust is kept 0-100 internally (data files and thresholds use that scale) but shown to the player out of 1000.
// Lewdness is 0-100 internally like trust, and shown x10 (out of 1000) like the other stats.
const lShow = v => Math.round((v||0)*10);
const TRUST_SHOW = 10; const tShow = v => Math.round((v||0)*TRUST_SHOW); const tDelta = v => { const n = (v||0)*TRUST_SHOW; return (n>=0?'+':'') + (Math.abs(n)<10 ? n.toFixed(1).replace(/\.0$/,'') : Math.round(n)); };
const SKL = 10; const s100 = v => (v||0)/SKL; const clampK = v => Math.max(0, Math.min(1000, v));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => Math.round(n).toLocaleString() + 'g';
const uid = () => 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const clone = o => JSON.parse(JSON.stringify(o));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function weighted(arr, f){ const ws = arr.map(f); let t = ws.reduce((a,b)=>a+b,0)*Math.random(); for(let i=0;i<arr.length;i++){ t -= ws[i]; if(t<=0) return arr[i]; } return arr[arr.length-1]; }
// small seeded random (mulberry32): same seed, same sequence
function seededRng(seed){ let a = (seed>>>0) || 1; return ()=>{ a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a>>>15, 1 | a); t = t + Math.imul(t ^ t>>>7, 61 | t) ^ t; return ((t ^ t>>>14)>>>0) / 4294967296; }; }
function hashStr(s){ let h=0; for(const c of String(s)) h=(h*31+c.charCodeAt(0))|0; return Math.abs(h); }

const store = {
  get(k){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} }
};
// Random line from data/flavor.json: her personality's list if it has one, else _default. {name}/{house} filled in.
function flavor(sec, w, extra={}){
  const F = FLAVOR[sec] || {}, list = (w && Array.isArray(F[w.personality]) && F[w.personality].length) ? F[w.personality] : (F._default||[]);
  if(!list.length) return '';
  const c = Object.assign({name: w ? w.name : '', house: (w && typeof S!=='undefined' && S && typeof houseOf==='function' && houseOf(w)) ? houseOf(w).name : 'the house'}, extra);
  return pick(list).replace(/\{(\w+)\}/g, (m,k)=> c[k]!==undefined ? String(c[k]) : m);
}
const KEY_SAVE='gilded_lantern_save_v1', KEY_SET='gilded_lantern_settings_v1', KEY_LIB='gilded_lantern_library_v1';
const _ss = store.get(KEY_SET) || {};
let SET = Object.assign({}, DEFAULT_SETTINGS, _ss);
SET.snippets = Object.assign({}, _ss.snippets||{}); SET.clothText = Object.assign({}, _ss.clothText||{}); SET.customActs = (_ss.customActs||[]).slice();
SET.ai = Object.assign({}, DEFAULT_SETTINGS.ai, _ss.ai||{}); SET.ai.tpl = Object.assign({}, (_ss.ai&&_ss.ai.tpl)||{});
let LIB = store.get(KEY_LIB) || [];
let S = null;
let TAB='house', SHEET=null, MODAL_LOCK=false, CDRAFT=null, EDIT=null, EVQ=[], CUR_EV=null, ROSTER_FILTER='cur', SETUP=null;

/* ---------- Image storage (IndexedDB) ---------- */
let DB = null, THUMBS = {};
function idbOpen(){ return new Promise(res=>{ try{ const r = indexedDB.open('gilded_lantern_imgs',1);
  r.onupgradeneeded = ()=>{ const d=r.result; if(!d.objectStoreNames.contains('imgs')) d.createObjectStore('imgs'); if(!d.objectStoreNames.contains('thumbs')) d.createObjectStore('thumbs'); };
  r.onsuccess = ()=>{ DB=r.result; res(DB); }; r.onerror = ()=>res(null); }catch(e){ res(null); } }); }
function idbReq(st, mode, fn){ return new Promise(res=>{ if(!DB) return res(null); try{ const tx=DB.transaction(st,mode); const q=fn(tx.objectStore(st)); tx.oncomplete=()=>res(q?q.result:null); tx.onerror=()=>res(null); tx.onabort=()=>res(null); }catch(e){ res(null); } }); }
const imgGet = k => idbReq('imgs','readonly',s=>s.get(k));
let IMGKEYS = new Set();
const imgPut = (k,v) => { IMGKEYS.add(k); return idbReq('imgs','readwrite',s=>s.put(v,k)); };
const imgDel = k => { IMGKEYS.delete(k); return idbReq('imgs','readwrite',s=>s.delete(k)); };
const imgKeysAll = () => idbReq('imgs','readonly',s=>s.getAllKeys());
function idbAll(st){ return new Promise(res=>{ const out={}; if(!DB) return res(out); try{ const c=DB.transaction(st,'readonly').objectStore(st).openCursor(); c.onsuccess=()=>{ const cur=c.result; if(cur){ out[cur.key]=cur.value; cur.continue(); } else res(out); }; c.onerror=()=>res(out); }catch(e){ res(out); } }); }
function shrink(src, max, q){ return new Promise(res=>{ const im=new Image(); im.crossOrigin='anonymous';
  im.onload=()=>{ const s=Math.min(1, max/Math.max(im.width,im.height)); const c=document.createElement('canvas'); c.width=Math.round(im.width*s); c.height=Math.round(im.height*s); c.getContext('2d').drawImage(im,0,0,c.width,c.height); try{ res(c.toDataURL('image/jpeg',q)); }catch(e){ res(src.startsWith('data:')?src:null); } };
  im.onerror=()=>res(null); im.src=src; }); }
async function setThumb(id, dataUrl){ const t = await shrink(dataUrl, 160, 0.82); if(!t) return; THUMBS[id]=t; await idbReq('thumbs','readwrite',s=>s.put(t,id)); if(S) render(); }
