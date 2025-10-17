(function () {
  const root = document.getElementById('peg-project');
  if (!root) return;

  function applyAssets() {
    const cs = getComputedStyle(root);
    root.querySelectorAll('img[data-var]').forEach((img) => {
      const v = img.getAttribute('data-var');
      if (!v) return;
      let raw = cs.getPropertyValue(v).trim();
      if (!raw) return;
      raw = raw.replace(/^url\((.*)\)$/, '$1').trim().replace(/^['"]|['"]$/g, '');
      if (raw && img.src !== raw) img.src = raw;
    });
  }

  function renderCurve() {
    const svg = root.querySelector('.notecurve');
    if (!svg) return;

    const cs = getComputedStyle(root);
    const wCss = parseFloat(getComputedStyle(svg).width) || 240;
    const W = Math.max(Math.round(wCss), 120);

    // ler variáveis
    const fsVar = parseFloat(cs.getPropertyValue('--label-size')) || 24;
    const deg = parseFloat(cs.getPropertyValue('--curve-deg')) || 28;
    const raiseMul = parseFloat(cs.getPropertyValue('--curve-raise')) || 1.6;
    const baseYpct = parseFloat(cs.getPropertyValue('--curve-baseY')) || 70;
    const gapMul = parseFloat(cs.getPropertyValue('--curve-gap-mul')) || 1.15;

    // altura do viewBox
    const H = Math.max(fsVar * 4, W * 0.4);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    const cx = W / 2, half = W / 2;
    const ang = (deg * Math.PI) / 180;
    const off = Math.tan(ang / 4) * half;
    const baseY = (baseYpct / 100) * H;
    const vGap = fsVar * gapMul;

    function setD(sel, y) {
      const p = svg.querySelector(sel);
      if (!p) return;
      const x1 = cx - half, x2 = cx + half, qx = cx + off, qy = y - fsVar * raiseMul;
      p.setAttribute('d', `M ${x1} ${y} Q ${qx} ${qy} ${x2} ${y}`);
    }

    setD('#peg-line-1', baseY);
    setD('#peg-line-2', baseY + vGap);

    fitTextToPath(svg, fsVar);
  }

  // Encolhe ligeiramente a fonte se o texto for maior do que o caminho
  function fitTextToPath(svg, baseFs) {
    const p1 = svg.querySelector('#peg-line-1');
    const p2 = svg.querySelector('#peg-line-2');
    const t1 = svg.querySelector('.line1');
    const t2 = svg.querySelector('.line2');
    if (!(p1 && p2 && t1 && t2)) return;

    // usar a variável local --label-size no próprio SVG, para ter prioridade
    svg.style.setProperty('--label-size', `${baseFs}px`);

    // medir e ajustar no máx. 3 iterações
    for (let i = 0; i < 3; i++) {
      const L = Math.min(p1.getTotalLength(), p2.getTotalLength());       // comprimento disponível
      const TL = Math.max(t1.getComputedTextLength(), t2.getComputedTextLength()); // comprimento do texto

      // margem de segurança de 10–12%
      const ratio = TL / (L * 0.88);
      if (ratio <= 1) break;

      const newFs = Math.max(10, Math.round((baseFs / ratio) * 10) / 10);
      svg.style.setProperty('--label-size', `${newFs}px`);
      // volta a medir com o novo tamanho
    }
  }

  // paint inicial + resize
  applyAssets();
  renderCurve();

  let to = null;
  window.addEventListener('resize', () => {
    clearTimeout(to);
    to = setTimeout(() => {
      applyAssets();
      renderCurve();
    }, 120);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(renderCurve).catch(() => {});
  }
})();
