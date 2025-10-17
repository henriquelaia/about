// /about/about.js — PT/EN, auto-inject modal if missing
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // 1) Ano no rodapé
    const y = document.getElementById('about-year');
    if (y) y.textContent = new Date().getFullYear();

    // 2) Escopo (a secção). Se não existir, usa o documento inteiro
    const scope = document.getElementById('about-section') || document.querySelector('.lucrar-about-section') || document;

    // 3) Garante que o modal existe (cria se faltar)
    function ensureModal() {
      let m = document.getElementById('about-modal');
      if (!m) {
        m = document.createElement('div');
        m.className = 'st-modal';
        m.id = 'about-modal';
        m.setAttribute('aria-hidden', 'true');
        m.setAttribute('role', 'dialog');
        m.setAttribute('aria-label', 'Open content');
        m.innerHTML = `
          <div class="st-backdrop" data-close></div>
          <div class="st-dialog" role="document">
            <button class="st-close" type="button" aria-label="Close" data-close></button>
            <div class="st-body">
              <iframe class="st-iframe" id="about-iframe" src="" loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                allow="accelerometer; clipboard-write; encrypted-media; fullscreen; geolocation; gyroscope; picture-in-picture; web-share"></iframe>
            </div>
          </div>`;
        document.body.appendChild(m);
      }
      return m;
    }
    const modal = ensureModal();
    const iframe = modal.querySelector('#about-iframe');
    const backdrop = modal.querySelector('[data-close]');
    const closeBtn = modal.querySelector('.st-close');
    const bodyBox  = modal.querySelector('.st-body');

    // 4) Overlay de fallback (se for bloqueado por X-Frame-Options/CSP)
    const fb = document.createElement('div');
    fb.style.cssText = `
      position:absolute; inset:0; display:none; align-items:center; justify-content:center;
      background:transparent; z-index:3; padding:18px; text-align:center;
    `;
    fb.innerHTML = `
      <div style="background:rgba(0,0,0,.55); border:1px solid rgba(255,255,255,.14); border-radius:12px; padding:16px 18px;">
        <div style="color:#fff; font-weight:700; margin-bottom:10px;">Não foi possível carregar o conteúdo.</div>
        <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
          <a id="fb-open" href="#" target="_blank" rel="noopener" style="display:inline-block; padding:8px 14px; border-radius:8px; border:2px solid #36fba1; color:#36fba1; text-decoration:none; font-weight:700;">Abrir numa nova aba</a>
          <button id="fb-copy" type="button" style="display:inline-block; padding:8px 14px; border-radius:8px; border:2px solid #36fba1; background:transparent; color:#36fba1; font-weight:700; cursor:pointer;">Copiar link</button>
        </div>
      </div>
    `;
    bodyBox.appendChild(fb);
    const fbOpen = fb.querySelector('#fb-open');
    const fbCopy = fb.querySelector('#fb-copy');
    function showFallback(url) {
      fbOpen.href = url || '#';
      fb.style.display = 'flex';
      fbCopy.onclick = function () {
        if (url && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url);
        }
      };
    }
    function hideFallback() { fb.style.display = 'none'; }

    // 5) Helpers
    const isImg   = (u) => /\.(png|jpe?g|webp|gif|svg|avif)(\?|#|$)/i.test(u || "");
    const isPdf   = (u) => /\.pdf(\?|#|$)/i.test(u || "");
    const isCalendly = (u) => {
      try { return /(^|\.)calendly\.com$/i.test(new URL(u, location.href).hostname); }
      catch { return false; }
    };
    // externos que NÃO queremos em modal
    const isHardExternal = (u) => /racius\.com/i.test(u || "") || /livroreclamacoes\.pt/i.test(u || "");

    function srcdocImage(url) {
      const u = encodeURI(url);
      return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{height:100%;margin:0;background:#0e1116}
  .wrap{height:100%;display:grid;place-items:center}
  img{display:block;max-width:min(96vw,1200px);max-height:84vh;width:auto;height:auto;object-fit:contain;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.45)}
</style></head>
<body><div class="wrap"><img src="${u}" alt=""></div></body></html>`;
    }
    function srcdocPdf(url) {
      const u = encodeURI(url);
      return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{height:100%;margin:0;background:#0e1116}
  .box{position:fixed;inset:0}
  embed,object{width:100%;height:100%;border:0;display:block;background:#0e1116}
</style></head>
<body><div class="box"><embed src="${u}" type="application/pdf" /></div></body></html>`;
    }
    function srcdocCalendly(url) {
      let u;
      try {
        u = new URL(url, location.href);
        if (!u.searchParams.has('primary_color')) u.searchParams.set('primary_color','00b36b');
        if (!u.searchParams.has('hide_gdpr_banner')) u.searchParams.set('hide_gdpr_banner','1');
      } catch { u = { toString: () => url }; }
      const safe = (u && u.toString) ? u.toString() : url;
      return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{height:100%;margin:0;background:#0e1116}
  .calendly-inline-widget{min-width:320px;height:100%}
</style></head>
<body>
  <div class="calendly-inline-widget" data-url="${safe}"></div>
  <script src="https://assets.calendly.com/assets/external/widget.js" async></script>
</body></html>`;
    }

    let fbTimer = null;
    function armFallbackTimer(url) { clearTimeout(fbTimer); hideFallback(); fbTimer = setTimeout(() => showFallback(url), 6000); }
    function disarmFallback() { clearTimeout(fbTimer); hideFallback(); }

    function openShell() {
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('st-modal-open');
      document.body.classList.add('st-modal-open');
    }
    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('st-modal-open');
      document.body.classList.remove('st-modal-open');
      iframe.src = 'about:blank';
      iframe.srcdoc = '';
      disarmFallback();
    }
    function openFrame(url) {
      iframe.removeAttribute('srcdoc');
      iframe.src = url;
      iframe.onload = disarmFallback;
      openShell();
    }
    function openImage(url) {
      iframe.src = 'about:blank';
      iframe.srcdoc = srcdocImage(url);
      openShell();
    }
    function openPDF(url) {
      iframe.src = 'about:blank';
      iframe.srcdoc = srcdocPdf(url);
      armFallbackTimer(url);
      openShell();
    }
    function openCalendly(url) {
      iframe.src = 'about:blank';
      iframe.srcdoc = srcdocCalendly(url);
      armFallbackTimer(url);
      openShell();
    }

    backdrop.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // 6) Normalizar imagens/PDFs para modal (se estiverem dentro do scope)
    scope.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (!href) return;
      if (isHardExternal(href)) return; // deixa abrir fora
      if (isImg(href) || isPdf(href) || isCalendly(href)) {
        a.removeAttribute('target'); // evita abrir nova aba
        a.setAttribute('data-modal', '1');
        a.setAttribute('data-src', href);
        a.setAttribute('href', '#');
      }
    });

    // 7) Delegação de cliques (dentro do scope)
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || !scope.contains(a)) return;

      const hrefAttr = a.getAttribute('href') || '';
      const dataSrc  = a.getAttribute('data-src') || '';
      const url = dataSrc || hrefAttr;

      if (!url) return;
      if (isHardExternal(url)) return; // Rácius/Livro → fora da modal

      // sempre que marcámos data-modal, intercepta
      if (a.hasAttribute('data-modal') || isImg(url) || isPdf(url) || isCalendly(url)) {
        e.preventDefault();
        if (isCalendly(url))      return openCalendly(url);
        if (isImg(url))           return openImage(url);
        if (isPdf(url))           return openPDF(url);
        return openFrame(url);
      }
    }, true);

    // 8) Esconde o modal no editor do Elementor
    if (document.body.classList.contains('elementor-editor-active')) {
      modal.style.display = 'none';
    }

    // flag para debug rápido
    window.LCR_ABOUT_READY = true;
  });
})();
