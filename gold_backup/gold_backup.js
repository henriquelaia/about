/* ====== TEXTO CURVO (SVG) ====== */
(function(){
  const root = document.querySelector('#gold-backup'); if(!root) return;
  const stage = root.querySelector('.stage');
  const svg   = root.querySelector('#gb-note');
  const defs  = svg.querySelector('#gb-note-defs') || svg.querySelector('defs');
  const svgns = "http://www.w3.org/2000/svg";

  const getVar = (n,f) => { const v = getComputedStyle(root).getPropertyValue(n).trim(); return v||f }
  const num = (v,f) => { const n = parseFloat(String(v).replace('deg','').replace('%','')); return isNaN(n)?f:n }

  function ensurePath(i){
    let p = svg.querySelector('#gb-note-path-'+i);
    if(!p){ p=document.createElementNS(svgns,'path'); p.setAttribute('id','gb-note-path-'+i); defs.appendChild(p) }
    return p;
  }
  function ensureText(i){
    let t = svg.querySelector('text[data-line="'+i+'"]');
    if(!t){ t=document.createElementNS(svgns,'text'); t.setAttribute('data-line',i); svg.appendChild(t) }
    let tp=t.querySelector('textPath');
    if(!tp){ tp=document.createElementNS(svgns,'textPath'); t.appendChild(tp) }
    return {t,tp};
  }
  function cleanup(used){
    [...svg.querySelectorAll('path[id^="gb-note-path-"]')].forEach(p=>{
      const i=parseInt(p.id.replace('gb-note-path-','')); if(i>=used)p.remove();
    });
    [...svg.querySelectorAll('text[data-line]')].forEach(t=>{
      const i=parseInt(t.getAttribute('data-line')); if(i>=used)t.remove();
    });
  }
  function measure(text, px){
    const t=document.createElementNS(svgns,'text');
    t.setAttribute('style',`font:${px}px "SegoePrint",cursive;visibility:hidden`);
    t.textContent=text; svg.appendChild(t);
    let len=0; try{len=t.getComputedTextLength()}catch(e){len=text.length*px*.6}
    t.remove(); return len;
  }
  function render(){
    const rect=stage.getBoundingClientRect(), W=rect.width, H=rect.height;
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
    svg.style.overflow = 'visible';

    const raw=(svg.dataset.text||"1 ozt in vault at the moment").replace(/\\n/g,"\n");
    const lines=raw.split(/\n|\|/).map(s=>s.trim()).filter(Boolean);

    const ax=num(getVar('--note-ax','74%'),74)/100*W;
    const ay=num(getVar('--note-ay','88%'),88)/100*H;
    const rot=num(getVar('--note-rot','0deg'),0)*Math.PI/180;
    const curve=num(getVar('--note-curve','60'),60);
    const fontBase=num(getVar('--note-font','18'),18);
    const align=(getVar('--note-align','center')||'center').replace(/["']/g,'').trim().toLowerCase();
    const side=(getVar('--note-side','down')||'down').replace(/["']/g,'').trim().toLowerCase();

    const tx=Math.cos(rot), ty=Math.sin(rot), nx=-ty, ny=tx;
    const fontPx=fontBase*(W/600);
    const gap=fontPx*1.2;
    const L=Math.max(...lines.map(s=>measure(s,fontPx))) + 60;
    const half=L/2, off=Math.tan((curve*Math.PI/180)/4)*half, sgn=(side==='up'?-1:1);

    let usedIndex = 0;
    for(let i=0;i<lines.length;i++){
      const delta=(i-(lines.length-1)/2)*gap*sgn;
      const dx=nx*delta, dy=ny*delta;
      const x1=ax-tx*half+dx, y1=ay-ty*half+dy;
      const x2=ax+tx*half+dx, y2=ay+ty*half+dy;
      const cx=ax+sgn*nx*off+dx, cy=ay+sgn*ny*off+dy;

      const path=ensurePath(i);
      path.setAttribute('d',`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);

      const {t,tp}=ensureText(i);
      t.setAttribute('style',`font-size:${fontPx}px`);
      tp.setAttribute('href','#gb-note-path-'+i);
      tp.setAttribute('startOffset', align==='left'?'0%':(align==='right'?'100%':'50%'));
      tp.textContent=lines[i];
      usedIndex = i+1;
    }
    cleanup(usedIndex);
  }
  new ResizeObserver(render).observe(stage);
  addEventListener('resize',render,{passive:true});
  addEventListener('orientationchange',render,{passive:true});
  render();
})();

/* ====== MODAIS (PDF / CALENDLY) — robusto ====== */
(function(){
  if (window.__GB_MODAL_BOUND__) return;   // evita binds duplicados
  window.__GB_MODAL_BOUND__ = true;

  const ROOT = '#gold-backup';

  function qs(sel, ctx=document){ return ctx.querySelector(sel) }
  function qa(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)) }

  function openModal(modal){
    if(!modal) return;
    modal.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
  }
  function closeModal(modal){
    if(!modal) return;
    modal.setAttribute('aria-hidden','true');
    document.documentElement.style.overflow = '';
    document.body.classList.remove('modal-open');
    const ifr = modal.querySelector('iframe');
    if (ifr && modal.id === 'gbModalPdf') { try{ ifr.src = 'about:blank'; }catch(_){} }
  }

  function ensureCalendly(cb){
    if(!qs('link[href*="assets.calendly.com/assets/external/widget.css"]')){
      const l=document.createElement('link'); l.rel='stylesheet';
      l.href='https://assets.calendly.com/assets/external/widget.css';
      document.head.appendChild(l);
    }
    if(window.Calendly && typeof window.Calendly.initInlineWidget==='function'){ cb(); }
    else{
      const s=document.createElement('script');
      s.src='https://assets.calendly.com/assets/external/widget.js';
      s.async=true; s.onload=cb; document.head.appendChild(s);
    }
  }

  /* --- Reescreve links PDF para nunca navegarem fora --- */
  function rewritePdfAnchors(){
    const root = qs(ROOT); if(!root) return;
    const anchors = qa('.links a.js-open-pdf, .links a[href$=".pdf"]', root);
    anchors.forEach(a=>{
      // já tratado?
      if (a.dataset.href) return;
      a.dataset.href = a.href;         // guarda URL real
      a.href = '#';                     // impede navegação normal
      a.removeAttribute('download');
      a.target = '_self';
      a.rel = (a.rel||'').replace(/\bnoopener|noreferrer\b/g,'').trim();
    });
  }

  /* --- Click handler em CAPTURA (vence Elementor) --- */
  function onClick(e){
    const a = e.target.closest('a'); if(!a) return;
    const root = a.closest(ROOT); if(!root) return;

    // Só clique primário sem modificadores
    if(e.button!==0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const hrefAttr = a.getAttribute('href') || '';
    const stored   = a.dataset.href || '';
    const realHref = stored || a.href || hrefAttr;
    const isPdf    = a.classList.contains('js-open-pdf') || /\.pdf(?:$|[?#])/i.test(realHref);
    const isCal    = a.classList.contains('gb-open-cal');

    if (isPdf){
      e.preventDefault(); e.stopPropagation();
      const modal = qs('#gbModalPdf', root);
      const frame = qs('#gbModalPdf iframe', root);
      if (frame){
        frame.src = realHref;
        frame.title = a.dataset.title || a.textContent.trim() || 'Documento';
      }
      openModal(modal);
      return;
    }

    if (isCal){
      e.preventDefault(); e.stopPropagation();
      const modal = qs('#gbModalCal', root);
      const wrap  = qs('#gbModalCal .calwrap', root);
      const url   = a.dataset.cal || realHref;
      if (wrap) wrap.innerHTML = '';
      ensureCalendly(()=> window.Calendly.initInlineWidget({ url, parentElement: wrap }));
      openModal(modal);
    }
  }

  /* --- Fechar modal (backdrop/btn/ESC) --- */
  function bindClose(){
    document.addEventListener('click', (e)=>{
      const closeEl = e.target.closest('[data-close], .gb-backdrop');
      if(!closeEl) return;
      const modal = closeEl.closest('.gb-modal');
      if(modal && modal.closest(ROOT)) closeModal(modal);
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key !== 'Escape') return;
      const root = qs(ROOT); if(!root) return;
      qa('.gb-modal[aria-hidden="false"]', root).forEach(closeModal);
    });
  }

  function init(){
    rewritePdfAnchors();
    // click em CAPTURA para passar à frente do Elementor
    document.addEventListener('click', onClick, true);
    bindClose();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Reaplica se o Elementor re-renderizar
  new MutationObserver(()=> rewritePdfAnchors())
    .observe(document.documentElement, {childList:true, subtree:true});
})();

/* ====== FIX: 1vw relativo à largura do conteúdo ====== */
(function(){
  const root=document.querySelector('#gold-backup');
  const wrap=root?.querySelector('.wrap'); if(!wrap) return;
  function recalc(){ const W=wrap.getBoundingClientRect().width; root.style.setProperty('--vwpx',(W/100)+'px') }
  new ResizeObserver(recalc).observe(wrap);
  addEventListener('resize',recalc,{passive:true});
  recalc();
})();
