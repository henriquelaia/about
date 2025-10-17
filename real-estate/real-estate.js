(() => {
  const root = document.getElementById('real-estate-3d');
  if (!root) return;

  // anima a entrada do card quando entra no viewport
  const card = root.querySelector('.status-card');
  const show = () => card && card.classList.add('is-visible');

  if (card) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { show(); io.disconnect(); break; }
        }
      }, { threshold: 0.15 });
      io.observe(card);
    } else {
      show();
    }
    setTimeout(show, 700); // fallback
  }
})();
