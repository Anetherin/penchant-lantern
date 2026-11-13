/* Hollowmere Nights loader.
   Injects the stylesheet and the page markup, then loads the game scripts in order.
   Used by the Perchance shim (perchance/panel.html) and by index.html.
   Scripts are classic (non-module) scripts that share globals, so ORDER MATTERS. */
(function(){
  'use strict';
  var me = document.currentScript;
  var BASE = me ? me.src.replace(/loader\.js(\?.*)?$/, '') : './';
  var V = (me && (me.src.match(/[?&]v=([^&]+)/)||[])[1]) || String(Date.now());

  var FILES = [
    'js/core/config.js',
    'js/core/util.js',
    'js/data/characters.js',
    'js/data/economy.js',
    'js/data/wardrobe.js',
    'js/data/scenes.js',
    'js/data/named.js',
    'js/logic/character.js',
    'js/logic/fx.js',
    'js/logic/titles.js',
    'js/logic/prompts.js',
    'js/logic/ai.js',
    'js/logic/imagegen.js',
    'js/logic/state.js',
    'js/logic/commands.js',
    'js/ui/wardrobe.js',
    'js/logic/sam.js',
    'js/logic/spending.js',
    'js/logic/home.js',
    'js/logic/week.js',
    'js/events/core.js',
    'js/stories/houses.js',
    'js/stories/partners.js',
    'js/stories/house-extras.js',
    'js/stories/ngplus-houses.js',
    'js/events/regulars.js',
    'js/events/bonds.js',
    'js/events/firsts.js',
    'js/events/encounters.js',
    'js/events/random.js',
    'js/setup.js',
    'js/logic/ngplus.js',
    'js/logic/goddess.js',
    'js/ui/core.js',
    'js/ui/sheet.js',
    'js/ui/settings.js',
    'js/main.js'
  ];
  window.HOLLOWMERE_FILES = FILES;
  // Editable data, loaded before any script runs. Each becomes window.PL_DATA['<name>'].
  var DATA_FILES = ['balance', 'economy', 'services', 'personalities', 'people', 'races', 'traits', 'titles', 'body', 'wardrobe', 'characters', 'guests', 'arcs', 'regulars', 'bonds', 'scenes', 'dates', 'events', 'snippets', 'ai-prompts', 'flavor', 'firsts', 'goddess'];
  // Data sets kept as a folder of parts (data/<name>/index.json + parts) instead of one file.
  var DATA_DIRS = ['characters', 'guests', 'arcs', 'flavor', 'firsts', 'goddess'];
  window.HOLLOWMERE_DATA = DATA_FILES;
  window.HOLLOWMERE_DATA_DIRS = DATA_DIRS;

  var MARKUP = [
    '<header id="hdr"></header>',
    '<div id="app"><nav id="tabs"></nav><main id="view"><p style="padding:20px;color:#a898b3">Loading Hollowmere Nights…</p></main></div>',
    '<footer><button class="primary" id="endBtn" onclick="endWeek()">End Week ▶</button></footer>',
    '<div id="modal" class="modal hidden" onclick="if(event.target===this&&!MODAL_LOCK)closeModal()"><div id="modalBox" class="modal-box"></div></div>',
    '<div id="toast"></div>',
    '<input type="file" id="upFile" accept="image/*" style="display:none">',
    '<input type="file" id="upJson" accept=".json,application/json" style="display:none">'
  ].join('\n');

  var link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = BASE + 'css/style.css?v=' + V;
  document.head.appendChild(link);

  if(!document.getElementById('app')) document.body.insertAdjacentHTML('beforeend', MARKUP);

  var failed = false;
  function fail(msg){
    if(failed) return; failed = true;
    var v = document.getElementById('view');
    if(v) v.innerHTML = '<p style="padding:20px;color:#e86b84">' + msg + '</p>';
  }
  window.PL_DATA = window.PL_DATA || {};
  // A data set is either data/<name>.json or a folder data/<name>/ whose index.json lists its parts
  // (data/<name>/<part>.json), deep-merged in order: objects merge key by key, arrays are concatenated,
  // other values defined twice: the later part wins. Same rules as tools/data.mjs.
  function getJSON(rel){
    return fetch(BASE + 'data/' + rel + '?v=' + V).then(function(r){
      if(!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(null, function(e){
      throw new Error('<code>data/' + rel + '</code>: ' + (e instanceof SyntaxError ? 'not valid JSON (' + e.message + '). Check for a missing comma or quote.' : e.message));
    });
  }
  function isObj(o){ return o && typeof o === 'object' && !Array.isArray(o); }
  function mergeInto(dst, src, at){
    Object.keys(src).forEach(function(k){
      var d = dst[k], v = src[k];
      if(!(k in dst)) dst[k] = v;
      else if(Array.isArray(d) && Array.isArray(v)) dst[k] = d.concat(v);
      else if(isObj(d) && isObj(v)) mergeInto(d, v, at + k + '.');
      else { console.warn('[data] ' + at + k + ' is defined in more than one part; the later one wins'); dst[k] = v; }
    });
    return dst;
  }
  function loadSet(n){
    if(DATA_DIRS.indexOf(n) < 0) return getJSON(n + '.json');
    return getJSON(n + '/index.json').then(function(parts){
      return Promise.all(parts.map(function(p){ return getJSON(n + '/' + p + '.json'); }));
    }).then(function(list){
      var out = {};
      list.forEach(function(d){ mergeInto(out, d, n + ': '); });
      return out;
    });
  }
  Promise.all(DATA_FILES.map(function(n){
    if(window.PL_DATA[n]) return null;   // already inlined (single-file build)
    return loadSet(n).then(function(d){ window.PL_DATA[n] = d; });
  })).then(loadScripts, function(e){ fail('Couldn\'t load ' + e.message); });

  function loadScripts(){ FILES.forEach(function(f){
    var s = document.createElement('script');
    s.src = BASE + f + '?v=' + V;
    s.async = false;            // keep execution order
    s.onerror = function(){ fail('Couldn\'t load <code>' + f + '</code> from ' + BASE + '. Is GitHub Pages enabled for the repo?'); };
    document.body.appendChild(s);
  }); }
})();
