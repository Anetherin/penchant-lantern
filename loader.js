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
    'js/logic/prompts.js',
    'js/logic/ai.js',
    'js/logic/imagegen.js',
    'js/logic/state.js',
    'js/logic/commands.js',
    'js/ui/wardrobe.js',
    'js/logic/sam.js',
    'js/logic/week.js',
    'js/events/core.js',
    'js/stories/houses.js',
    'js/stories/partners.js',
    'js/stories/house-extras.js',
    'js/events/encounters.js',
    'js/events/random.js',
    'js/setup.js',
    'js/ui/core.js',
    'js/ui/sheet.js',
    'js/ui/creator.js',
    'js/ui/settings.js',
    'js/main.js'
  ];
  window.HOLLOWMERE_FILES = FILES;

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
  FILES.forEach(function(f){
    var s = document.createElement('script');
    s.src = BASE + f + '?v=' + V;
    s.async = false;            // keep execution order
    s.onerror = function(){
      if(failed) return; failed = true;
      var v = document.getElementById('view');
      if(v) v.innerHTML = '<p style="padding:20px;color:#e86b84">Couldn\'t load <code>' + f + '</code> from ' + BASE + '. Is GitHub Pages enabled for the repo?</p>';
    };
    document.body.appendChild(s);
  });
})();
