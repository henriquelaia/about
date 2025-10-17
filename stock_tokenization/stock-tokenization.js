(function(){
  const ROOT = '#stock-tokenization-pt';
  const onReady = (fn) =>
    document.readyState !== 'loading'
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn);

  // === CONFIG (caminhos vindos do HTML ou fallbacks) ===
  const SLIDER_DIR = (typeof window !== 'undefined' && window.EVENTS_GALLERY_FOLDER) || './assets/slider_evento_ver_em_2023/';
  const SLIDER_FALLBACK = [
    "333474899_697323278839036_4063126394647596729_n(1).jpg",
    "333639353_753782802781633_2093337060534255533_n(1).jpg",
    "333730729_894409598501473_7317957485369113594_n(1).jpg",
    "333862124_720665566425567_7691626572652514176_n(1).jpg",
    "333917185_229590579469196_4478464698466250222_n(1).jpg",
    "334222876_2062663927275549_6324348832859277649_n(1).jpg"
  ];

  const GAME_DESKTOP_URL = window.GAME_DESKTOP_URL || './game/index.html';
  const GAME_TESLA_URL   = window.GAME_TESLA_URL   || './Tesla-Jump-Game-WebGL-1.0/index.html';
  const METAMASK_IMG     = window.METAMASK_IMG     || './assets/metamask/MetaMask_Fox.svg.png';

  onReady(() => {
    const scope = document.querySelector(ROOT);
    if (!scope) return;

    /* ===========================
       LABELS CURVOS (PT + EN)
       =========================== */
    (function curvedNotes(){
      const svg = scope.querySelector('#st-note-pt'); if (!svg) return;

      const ns  = 'http://www.w3.org/2000/svg';
      const xns = 'http://www.w3.org/1999/xlink';
      const lines = (svg.getAttribute('data-text') || '')
        .split('|')
        .filter(Boolean);

      const actionsMap = {
        'jogar agora': 'game',
        'play now': 'game',
        'ver acima': 'scroll',
        'see above': 'scroll',
        'ver em 2023': 'events',
        'see 2023': 'events',
        'see in 2023': 'events'
      };
      const TRIGGERS = Object.keys(actionsMap);
      const gv = (p) => parseFloat(getComputedStyle(scope).getPropertyValue(p)) || 0;
      const getV = (i, k, fb) => {
        const v = gv(`--t${i}-${k}`);
        return Number.isFinite(v) && v !== 0 ? v : fb;
      };

      function drawOnce(){
        svg.innerHTML = '';
        lines.forEach((text, i0) => {
          const i=i0+1;
          const cx=getV(i,'x',500), cy=getV(i,'y',320), len=getV(i,'len',480),
                arc=getV(i,'arc',120), fs=getV(i,'size',22), dx=getV(i,'dx',0),
                dy=getV(i,'dy',0), rot=getV(i,'rot',0);

          const G = document.createElementNS(ns,'g');
          G.setAttribute('transform',`rotate(${rot},${cx+dx},${cy+dy})`);
          svg.appendChild(G);

          const parts = text.split(/<br\s*\/?>|\n/gi).filter(Boolean);
          const vGap = 22;

          parts.forEach((txt,j)=>{
            const half=len/2, x1=cx-half+dx, x2=cx+half+dx, y=cy+dy+j*vGap,
                  qx=cx+dx, qy=y-arc;

            const path=document.createElementNS(ns,'path');
            const id=`st-pt-${i}-${j}`;
            path.setAttribute('id',id);
            path.setAttribute('d',`M ${x1} ${y} Q ${qx} ${qy} ${x2} ${y}`);
            G.appendChild(path);

            const T=document.createElementNS(ns,'text');
            T.setAttribute('style',`font-size:${fs}px`);
            const TP=document.createElementNS(ns,'textPath');
            TP.setAttributeNS(xns,'href',`#${id}`);
            TP.setAttribute('startOffset','50%');

            const splitRegex = new RegExp('(' + TRIGGERS.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|') + ')','ig');

            txt.split(splitRegex).forEach(p=>{
              if(!p) return;
              const key = TRIGGERS.find(k=>k.toLowerCase()===p.toLowerCase());
              if(key){
                const A=document.createElementNS(ns,'a');
                A.setAttribute('class','st-link');
                A.setAttribute('data-action',actionsMap[key]);
                A.setAttributeNS(xns,'href','#');
                const S=document.createElementNS(ns,'tspan'); S.textContent=p;
                A.appendChild(S); TP.appendChild(A);
              }else{
                TP.appendChild(document.createTextNode(p));
              }
            });

            T.appendChild(TP); G.appendChild(T);
          });
        });
      }

      // 1ª render + reajustes
      drawOnce();
      const debounce=(fn,ms=120)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}};
      const rebuild=debounce(drawOnce,120);
      window.addEventListener('resize',rebuild,{passive:true});
      window.addEventListener('orientationchange',drawOnce);
      if(document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);

      // cliques
      svg.addEventListener('click',(e)=>{
        const link=e.target.closest('a.st-link'); if(!link) return;
        e.preventDefault();
        const a=link.getAttribute('data-action');
        if(a==='game')   window.dispatchEvent(new CustomEvent('st:open',{detail:{href:'game'}}));
        if(a==='events') window.dispatchEvent(new CustomEvent('st:open',{detail:{href:'events'}}));
        if(a==='scroll'){
          const el=document.getElementById('real-estate-3d');
          if(el){
            const admin=document.getElementById('wpadminbar');
            const o=admin?(admin.offsetHeight||0):0;
            const top=el.getBoundingClientRect().top + window.scrollY - o - 12;
            window.scrollTo({top,behavior:'smooth'});
          }
        }
      });
    })();

    /* ==============
       MODAL
       ============== */
    const modal   = document.getElementById('stModal-pt');
    const closeBtn= modal?.querySelector('.st-close');

    function openModal(extraClass){
      if(extraClass) modal.querySelector('.st-dialog')?.classList.add(extraClass);
      modal.removeAttribute('hidden');
      modal.style.display = '';
      modal.setAttribute('aria-hidden','false');
      document.documentElement.classList.add('st-modal-open');
    }
    function closeModal(){
      modal.setAttribute('aria-hidden','true');
      modal.setAttribute('hidden','');
      modal.style.display='none';
      document.documentElement.classList.remove('st-modal-open');

      // limpar variantes e listeners da galeria
      const dialog = modal.querySelector('.st-dialog');
      dialog.classList.remove('st-dialog--game');
      modal.dispatchEvent(new CustomEvent('st:gallery:dispose'));

      // reset do corpo
      const body = modal.querySelector('.st-body');
      body.innerHTML =
        '<iframe id="stIframe-pt" class="st-iframe" src="about:blank" title="Conteúdo do popup" loading="lazy"></iframe>';
    }

    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e)=>{ if (e.target.matches('[data-close], .st-backdrop')) closeModal(); });
    window.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeModal(); });

    /* ==============
       JOGO (sem timeouts)
       ============== */
    function openGame(){
      const isTabletOrSmaller = window.matchMedia('(max-width:1024px)').matches;
      const body = modal.querySelector('.st-body');
      const dialog = modal.querySelector('.st-dialog');

      dialog.classList.add('st-dialog--game');

      if (isTabletOrSmaller){
        // Gate MetaMask -> Tesla
        body.innerHTML = `
          <div class="st-gate" style="display:grid;place-items:center;min-height:var(--modal-content-h);padding:32px">
            <div style="text-align:center;max-width:640px">
              <img src="${METAMASK_IMG}" alt="MetaMask" style="width:110px;height:auto;display:block;margin:0 auto 16px;filter:drop-shadow(0 8px 20px rgba(0,0,0,.35))">
              <h3 style="font:900 24px/1.15 Akrobat,system-ui,sans-serif;margin:10px 0 6px;color:#E9EDF1">MetaMask desbloqueada?</h3>
              <p style="opacity:.9;margin:0 0 16px">Para jogar tem de ter a extensão <b>MetaMask</b> aberta/desbloqueada no navegador.</p>
              <div style="display:flex;gap:12px;justify-content:center;margin-top:8px">
                <button id="gate-cancel" class="st-btn ghost" type="button">Cancelar</button>
                <button id="gate-continue" class="st-btn primary" type="button">Já abri, continuar</button>
              </div>
            </div>
          </div>
        `;
        body.querySelector('#gate-cancel').onclick   = closeModal;
        body.querySelector('#gate-continue').onclick = () => {
          body.innerHTML = `<iframe class="st-iframe" src="${GAME_TESLA_URL}" title="Jogo Tesla" loading="eager" allow="fullscreen; autoplay"></iframe>`;
        };
      } else {
        // Desktop → jogo “desktop”
        body.innerHTML = `<iframe class="st-iframe" src="${GAME_DESKTOP_URL}" title="Jogo" loading="eager" allow="fullscreen; autoplay"></iframe>`;
      }
      openModal('st-dialog--game');
    }

    /* =========================
       GALERIA (evento 2023)
       ========================= */
    async function openGalleryFromManifest(dir){
      let files = [];
      try{
        const r = await fetch(dir + 'manifest.json', { cache: 'no-store' });
        if (r.ok){
          const j = await r.json();
          if (Array.isArray(j)){
            files = j.filter(x => typeof x === 'string' && /\.(png|jpe?g|webp|gif)$/i.test(x));
          }
        }
      }catch(_){ /* ignore */ }
      if (!files.length) files = SLIDER_FALLBACK.slice();
      buildGallery(dir, files);
    }

    function buildGallery(dir, files){
      const body = modal.querySelector('.st-body');

      if (!files.length){
        body.innerHTML =
          `<div class="st-gallery" style="display:grid;place-items:center;min-height:50vh;">
             <p style="color:#fff;opacity:.85">Sem imagens no manifest e fallback vazio.</p>
           </div>`;
        openModal(); return;
      }

      body.innerHTML = `
        <div class="st-gallery" role="dialog" aria-label="Evento 2023">
          <button class="st-g-nav st-g-prev" type="button" aria-label="Anterior">‹</button>
          <div class="st-g-wrap">
            <img class="st-g-img" alt="Evento 2023" />
          </div>
          <button class="st-g-nav st-g-next" type="button" aria-label="Seguinte">›</button>
          <div class="st-g-dots" aria-hidden="false"></div>
        </div>
      `;

      const img  = body.querySelector('.st-g-img');
      const prev = body.querySelector('.st-g-prev');
      const next = body.querySelector('.st-g-next');
      const dots = body.querySelector('.st-g-dots');

      // garante que a imagem não bloqueia cliques das setas (fallback JS ao patch de CSS)
      img.style.pointerEvents = 'none';

      let idx = 0;

      const clampIdx = (i) => ((i % files.length) + files.length) % files.length;

      const renderDots = () => {
        dots.innerHTML = files
          .map((_,i)=>`<button class="st-g-dot" type="button" data-i="${i}" ${i===idx?'aria-current="true"':''} aria-label="Ir para ${i+1}"></button>`)
          .join('');
      };
      const updateDots = () => {
        [...dots.children].forEach((d,k)=>d.setAttribute('aria-current', k===idx ? 'true' : 'false'));
      };

      // token para invalidar loads antigos (evita remover imagens por abortos)
      let loadToken = 0;

      const loadCurrent = () => {
        if (!files.length){
          body.querySelector('.st-gallery').innerHTML =
            `<p style="color:#fff;opacity:.85">Não há imagens válidas para mostrar.</p>`;
          return;
        }

        idx = clampIdx(idx);
        const src = dir + files[idx];
        img.classList.add('is-changing');
        updateDots();

        const token = ++loadToken;
        const loader = new Image();

        loader.onload = () => {
          if (token !== loadToken) return;            // pedido ultrapassado
          img.src = src;                               // só agora troca a visível
          img.dataset.src = src;
          img.classList.remove('is-changing');

          // prefetch próxima
          const pre = new Image();
          pre.src = dir + files[clampIdx(idx + 1)];
        };

        loader.onerror = () => {
          if (token !== loadToken) return;            // erro de pedido antigo → ignora
          // imagem realmente quebrada → remove e tenta a próxima
          files.splice(idx, 1);
          if (!files.length){
            body.querySelector('.st-gallery').innerHTML =
              `<p style="color:#fff;opacity:.85">Todas as imagens falharam.</p>`;
            return;
          }
          if (idx >= files.length) idx = files.length - 1;
          renderDots(); updateDots(); loadCurrent();
        };

        loader.src = src;
      };

      const go = (delta) => { idx = clampIdx(idx + delta); loadCurrent(); };

      // setas
      prev.addEventListener('click', (e)=>{ e.stopPropagation(); go(-1); });
      next.addEventListener('click', (e)=>{ e.stopPropagation(); go(+1); });

      // dots
      dots.addEventListener('click', (e)=>{
        const btn = e.target.closest('.st-g-dot'); if (!btn) return;
        idx = Number(btn.dataset.i) || 0;
        loadCurrent();
      });

      // teclado
      function onKey(e){
        if (modal.getAttribute('aria-hidden') === 'false'){
          if (e.key === 'ArrowLeft')  go(-1);
          if (e.key === 'ArrowRight') go(+1);
        }
      }
      document.addEventListener('keydown', onKey);
      const dispose = () => document.removeEventListener('keydown', onKey);
      modal.addEventListener('st:gallery:dispose', dispose, { once:true });

      // swipe
      (function swipe(container){
        let x0 = null, locked = false;
        container.addEventListener('pointerdown', e => { x0 = e.clientX; locked = true; container.setPointerCapture(e.pointerId); });
        container.addEventListener('pointermove', e => {
          if (!locked || x0==null) return;
          const dx = e.clientX - x0;
          if (Math.abs(dx) > 28){ go(dx<0?+1:-1); x0 = e.clientX; }
        });
        ['pointerup','pointercancel','mouseleave'].forEach(ev => container.addEventListener(ev,()=>{ locked=false; x0=null; }));
      })(body.querySelector('.st-g-wrap'));

      renderDots();
      loadCurrent();
      openModal();
    }

    // Eventos de abertura vindos dos labels curvos
    window.addEventListener('st:open', (ev)=>{
      const href = (ev && ev.detail && ev.detail.href) || '';
      if (/^game$/i.test(href)){ ev.stopPropagation?.(); openGame(); return; }
      if (/events/i.test(href)){ ev.stopPropagation?.(); openGalleryFromManifest(SLIDER_DIR); return; }
    });

    /* =========================
       Slider de artigos (fallback)
       ========================= */
    (async function initSlider(){
      const block = scope.querySelector('#st-articles-pt');
      if (!block) return;

      const track = block.querySelector('.ta-track');
      const prev  = block.querySelector('.ta-prev');
      const next  = block.querySelector('.ta-next');

      const items = [
        {title:'Artigo 1', link:'#', image: SLIDER_DIR + "333474899_697323278839036_4063126394647596729_n(1).jpg"},
        {title:'Artigo 2', link:'#', image: SLIDER_DIR + "333639353_753782802781633_2093337060534255533_n(1).jpg"},
        {title:'Artigo 3', link:'#', image: SLIDER_DIR + "333730729_894409598501473_7317957485369113594_n(1).jpg"},
        {title:'Artigo 4', link:'#', image: SLIDER_DIR + "333862124_720665566425567_7691626572652514176_n(1).jpg"}
      ];

      track.innerHTML = items.map(p =>
        `<a class="ta-card" href="${p.link}">
           <img class="ta-thumb" src="${p.image}" alt="${(p.title||'Artigo').replace(/"/g,'&quot;')}" loading="lazy">
         </a>`
      ).join('');

      function updateBtns(){
        const max = track.scrollWidth - track.clientWidth - 2;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max;
      }
      function stepSize(){
        const cs = getComputedStyle(track);
        const gap = parseFloat(cs.columnGap || cs.gap || 16);
        const cardW = track.firstElementChild?.getBoundingClientRect().width || track.clientWidth/3;
        return cardW + gap;
      }
      function go(dir){
        const s = stepSize();
        const target = Math.round((track.scrollLeft + dir*s) / s) * s;
        track.scrollTo({ left: target, behavior: 'smooth' });
      }

      prev.addEventListener('click', ()=>go(-1));
      next.addEventListener('click', ()=>go(+1));
      track.addEventListener('scroll', updateBtns, { passive: true });
      window.addEventListener('resize', updateBtns, { passive: true });

      // drag to scroll
      (function drag(el){
        let down=false, sx=0, sl=0;
        el.addEventListener('pointerdown',(e)=>{
          down=true; sx=e.clientX; sl=el.scrollLeft; el.setPointerCapture(e.pointerId);
        });
        el.addEventListener('pointermove',(e)=>{ if(!down) return; el.scrollLeft = sl - (e.clientX - sx); });
        ['pointerup','pointercancel','mouseleave'].forEach(ev=>el.addEventListener(ev,()=>down=false));
      })(track);

      track.addEventListener('keydown',(e)=>{
        if (e.key==='ArrowLeft'){ go(-1); e.preventDefault(); }
        if (e.key==='ArrowRight'){ go(+1); e.preventDefault(); }
      });

      updateBtns();
    })();

  });

  /* ====== "o uses" → abre o modal #lcr-swap-modal ====== */
  (function connectUsesLink(){
    const usesLink  = document.getElementById('open-lcr-modal');
    const swapModal = document.getElementById('lcr-swap-modal');
    if (!usesLink || !swapModal) return;

    function openSwap(){
      swapModal.setAttribute('aria-hidden','false');
      swapModal.style.display   = 'flex';
      swapModal.style.visibility= 'visible';
      swapModal.style.background= 'rgba(0,0,0,0.3)';
      document.documentElement.classList.add('st-modal-open');
    }
    function closeSwap(){
      swapModal.setAttribute('aria-hidden','true');
      swapModal.style.display   = 'none';
      swapModal.style.visibility= 'hidden';
      document.documentElement.classList.remove('st-modal-open');
    }

    usesLink.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation(); openSwap();
    });
    swapModal.addEventListener('click', (e) => { if (e.target === swapModal) closeSwap(); });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && swapModal.getAttribute('aria-hidden') !== 'true') closeSwap();
    });
  })();

})();

/* ==== SLIDER "VER EM 2023" — NOVO ==== */
(function(){
  // Pasta (local ou WP) – o env-switcher já ajusta em local
  var FOLDER = (window.EVENTS_GALLERY_FOLDER || "./assets/slider_evento_ver_em_2023/");
  if(!/\/$/.test(FOLDER)) FOLDER += "/";

  // Lista real no teu projeto (6 imagens)
  var IMAGES_2023 = [
    "333474899_697323278839036_4063126394647596729_n(1).jpg",
    "333639353_753782802781633_2093337060534255533_n(1).jpg",
    "333730729_894409598501473_7317957485369113594_n(1).jpg",
    "333862124_720665566425567_7691626572652514176_n(1).jpg",
    "333917185_229590579469196_4478464698466250222_n(1).jpg",
    "334222876_2062663927275549_6324348832859277649_n(1).jpg"
  ];

  function mount(modalId){
    var modal = document.getElementById(modalId);
    if(!modal) return;
    var root = modal.querySelector('.st-gallery[data-gallery="2023"]');
    if(!root){
      // fallback: cria container no início do conteúdo da modal
      var content = modal.querySelector('.st-modal-content, .content, .modal-content') || modal;
      root = document.createElement('div');
      root.className = 'st-gallery';
      root.dataset.gallery = '2023';
      content.prepend(root);
    }

    // estrutura mínima
    root.innerHTML =
      '<div class="st-g-wrap"><img class="st-g-img" alt="Gallery 2023"></div>'+
      '<button class="st-g-nav st-g-prev" aria-label="Anterior">‹</button>'+
      '<button class="st-g-nav st-g-next" aria-label="Seguinte">›</button>'+
      '<div class="st-g-dots"></div>';

    var img   = root.querySelector('.st-g-img');
    var dotsC = root.querySelector('.st-g-dots');
    dotsC.innerHTML = IMAGES_2023.map(function(_,i){
      return '<button class="st-g-dot" data-i="'+i+'" aria-label="Slide '+(i+1)+'"></button>';
    }).join('');

    // pré-carregar
    IMAGES_2023.forEach(function(n){ var p=new Image(); p.src=FOLDER+n; });

    var i = 0;
    function show(idx){
      i = (idx + IMAGES_2023.length) % IMAGES_2023.length;
      img.src = FOLDER + IMAGES_2023[i];
      var all = dotsC.querySelectorAll('.st-g-dot');
      for(var k=0;k<all.length;k++) all[k].classList.toggle('is-active', k===i);
      // Garantia: ocupar 100% do wrap sem cortar
      img.style.width='100%'; img.style.height='100%'; img.style.objectFit='contain';
    }

    root.querySelector('.st-g-prev').onclick = function(){ show(i-1); };
    root.querySelector('.st-g-next').onclick = function(){ show(i+1); };
    dotsC.addEventListener('click', function(e){
      var b = e.target.closest('.st-g-dot'); if(b){ show(parseInt(b.dataset.i,10)); }
    });

    // swipe
    var sx=null, sid=null;
    root.addEventListener('pointerdown', function(e){ sx=e.clientX; sid=e.pointerId; root.setPointerCapture(sid); });
    root.addEventListener('pointerup', function(e){
      if(sx!=null){ var dx=e.clientX-sx; if(Math.abs(dx)>30){ (dx<0?show(i+1):show(i-1)); } sx=null; sid=null; }
    });

    // teclado quando a modal está visível
    document.addEventListener('keydown', function(e){
      if(modal.getAttribute('aria-hidden')==='true') return;
      if(e.key==='ArrowLeft') show(i-1);
      if(e.key==='ArrowRight') show(i+1);
    });

    // fit automático quando a modal abrir/redimensionar
    function fit(){
      if(modal.getAttribute('aria-hidden')==='true') return;
      var dotsH = dotsC.getBoundingClientRect().height || 0;
      var cs = getComputedStyle(root);
      var padT = parseFloat(cs.paddingTop)||0, padB = parseFloat(cs.paddingBottom)||0;
      var h = root.clientHeight - padT - padB - dotsH;
      var wrap = root.querySelector('.st-g-wrap');
      wrap.style.height = Math.max(0,h) + 'px';
    }
    var ro = new ResizeObserver(fit); ro.observe(root);
    var mo = new MutationObserver(fit); mo.observe(modal, {attributes:true, attributeFilter:['style','class','aria-hidden','hidden']});
    window.addEventListener('resize', fit, {passive:true});
    window.addEventListener('orientationchange', fit, {passive:true});

    // primeira imagem
    show(0);
    // pequeno delay para garantir medidas quando a modal abre
    setTimeout(fit, 0);
  }

  ['stModal-pt','stModal-en'].forEach(mount);
})();
