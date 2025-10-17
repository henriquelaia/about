/**
 * env-switcher.js (v5 - path rewrite + variable setters)
 * Toggle LOCAL by adding (in the HTML):
 *   <script>window.STOCKTOK_BASE = ".";</script>
 *   <script src="./env-switcher.js"></script>
 * Keep these commented on WordPress.
 */
(function(){
  try{
    var BASE = (typeof window !== 'undefined' && window.STOCKTOK_BASE) || null;
    if(!BASE || /^\//.test(BASE)){ return; } // WordPress or bad config
    if(BASE.endsWith('/')) BASE = BASE.slice(0,-1);
    var WP_PREFIX = "/wp-content/themes/lucrar-hello-child/stock_tokenization";
    var JS_NAME = "/stock-tokenization.js";
    var CSS_NAME = "/stock-tokenization.css";

    function toLocal(url){
      if(!url) return url;
      // srcset multi-values
      if(url.indexOf(',')>-1 && url.indexOf(' ')>-1){
        return url.split(',').map(function(item){
          var parts = item.trim().split(/\s+/);
          parts[0] = toLocal(parts[0]);
          return parts.join(' ');
        }).join(', ');
      }
      if(url.indexOf(WP_PREFIX) === 0){
        return BASE + url.slice(WP_PREFIX.length);
      }
      return url;
    }

    // Define rewriter-backed globals so later assignments are fixed automatically
    ["EVENTS_GALLERY_FOLDER","GAME_DESKTOP_URL","GAME_TESLA_URL","METAMASK_IMG"].forEach(function(key){
      var _val;
      try { delete window[key]; } catch(e) {}
      Object.defineProperty(window, key, {
        configurable: true,
        enumerable: true,
        get: function(){ return _val; },
        set: function(v){
          if(typeof v === 'string'){ _val = toLocal(v); }
          else { _val = v; }
        }
      });
    });

    function rewriteNode(node){
      if(node.nodeType !== 1) return;
      if(node.matches('img[src],source[srcset],link[href],script[src]')){
        var attr = node.hasAttribute('src') ? 'src' : (node.hasAttribute('href') ? 'href' : (node.hasAttribute('srcset') ? 'srcset' : null));
        if(attr){
          var v=node.getAttribute(attr), nv=toLocal(v);
          if(nv!==v) node.setAttribute(attr, nv);
        }
      }
    }

    // Ensure CSS early
    if(document.head && !document.querySelector('link[rel="stylesheet"][href$="'+CSS_NAME+'"]')){
      var lk=document.createElement('link'); lk.rel='stylesheet'; lk.href= BASE + CSS_NAME; document.head.appendChild(lk);
    }

    // Fix inline @import and existing assets
    (function initialSweep(){
      document.querySelectorAll('style').forEach(function(st){
        var txt = st.textContent || "";
        if(txt.indexOf(WP_PREFIX + CSS_NAME) !== -1){
          st.textContent = txt.replace(/@import\s+url\(["']?\/wp-content\/themes\/lucrar-hello-child\/stock_tokenization\/stock-tokenization\.css["']?\)\s*;?/g,
            '@import url(\"' + BASE + CSS_NAME + '\");');
        }
      });
      document.querySelectorAll('img[src],source[srcset],link[href],script[src]').forEach(rewriteNode);
    })();

    // Inject main JS if not present
    (function ensureMainJS(){
      var has = !!document.querySelector('script[src$="'+JS_NAME+'"]');
      if(!has && document.head){
        var s=document.createElement('script');
        s.src = BASE + JS_NAME;
        s.defer = true;
        document.head.appendChild(s);
      }
    })();

    // Watch for future nodes/attrs
    var mo = new MutationObserver(function(list){
      list.forEach(function(m){
        if(m.type === 'childList'){
          m.addedNodes && m.addedNodes.forEach(function(n){
            rewriteNode(n);
            if(n.querySelectorAll){
              n.querySelectorAll('img[src],source[srcset],link[href],script[src]').forEach(rewriteNode);
            }
          });
        } else if(m.type === 'attributes'){
          rewriteNode(m.target);
        }
      });
    });
    mo.observe(document.documentElement, {subtree:true, childList:true, attributes:true, attributeFilter:['src','srcset','href']});

    // Set default local values (will be kept even if later code tries to set WP paths)
    window.EVENTS_GALLERY_FOLDER = BASE + "/assets/slider_evento_ver_em_2023/";
    window.GAME_DESKTOP_URL = BASE + "/game/index.html";
    window.GAME_TESLA_URL   = BASE + "/Tesla-Jump-Game-WebGL-1.0/index.html";
    window.METAMASK_IMG     = BASE + "/assets/metamask/MetaMask_Fox.svg.png";
  }catch(err){
    console.error('env-switcher error:', err);
  }
})();