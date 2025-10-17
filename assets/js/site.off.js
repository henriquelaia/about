
const LCR_TOKEN_ADDRESS = '0x949292e7eb14ed1f86a33e3d38eb3aceade66ba9';
const DEXSCREENER_URL = `https://dexscreener.com/bsc/0x949292e7eb14ed1f86a33e3d38eb3aceade66ba9`;
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

async function updateLcrPrice(){
  const nodes = $$('.js-lcr-price');
  if(!nodes.length) return;
  try{
    const r = await fetch(DEXSCREENER_URL, {cache:'no-store'});
    const j = await r.json();
    const price = j?.pairs?.[0]?.priceUsd;
    if(price){
      const num = Number(price);
      const euro = isFinite(num) ? (num*0.92) : null; // ajuste fino no back-end se necessário
      nodes.forEach(n => n.textContent = euro ? euro.toFixed(4).replace('.', ',') + ' €' : '—');
    }
  }catch(e){ console.warn('Falha a obter preço LCR', e); }
}
document.addEventListener('DOMContentLoaded', updateLcrPrice);

// Helpers de interseção
function onIntersectOnce(el, cb, opts={rootMargin:'-10% 0px -10% 0px'}){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ cb(el); io.unobserve(el);} });
  }, opts);
  io.observe(el);
}
function onIntersect(el, cb, opts={rootMargin:'-5% 0px -5% 0px'}){
  const io = new IntersectionObserver((entries)=> entries.forEach(en=> cb(en.target, en)), opts);
  io.observe(el);
}

// Efeitos: pulse
$$('.js-pulse').forEach(el => {
  onIntersect(el, (node) => {
    node.style.setProperty('--pulse', 1.12);
    setTimeout(()=> node.style.removeProperty('--pulse'), 700);
  });
});

// Mover ícone edifício até título
(function(){
  const mover = document.querySelector('.js-move-building');
  const target = document.querySelector('#affordable-rents');
  if(!mover || !target) return;
  let startY = 0, done=false;
  onIntersectOnce(mover, () => { startY = mover.getBoundingClientRect().top + window.scrollY; });
  window.addEventListener('scroll', ()=>{
    if(done) return;
    const endY = target.getBoundingClientRect().top + window.scrollY - 60;
    const y = Math.min(endY, Math.max(startY, window.scrollY + 40));
    mover.style.transform = `translate3d(0, ${Math.max(0, y-startY)}px, 0)`;
    if((window.scrollY + window.innerHeight) > endY){ done = true; }
  }, {passive:true});
})();

// Reveal geral
$$('[data-reveal]').forEach(el => {
  el.style.opacity = 0; el.style.transform = 'translateY(24px)';
  onIntersect(el, (node, en)=>{
    if(en.isIntersecting){
      node.style.transition = 'opacity .5s ease, transform .5s ease';
      node.style.opacity = 1; node.style.transform = 'none';
    }
  });
});

// Linha progressiva
$$('.line-grow').forEach(el => {
  onIntersect(el, (node, en)=>{
    const rect = node.getBoundingClientRect();
    const vh = window.innerHeight;
    let vis = 1 - Math.max(0, Math.min(1, (rect.top + rect.height*0.2) / (vh*0.8)));
    node.style.setProperty('--progress', vis.toFixed(3));
  }, {rootMargin:'-5% 0% -5% 0%'});
});

// Modal simples
function openModal(src){
  const m = document.querySelector('#lucrar-modal');
  if(!m) return;
  m.classList.add('is-open');
  const iframe = m.querySelector('iframe');
  if(iframe && src){ iframe.src = src; }
}
function closeModal(){
  const m = document.querySelector('#lucrar-modal');
  if(!m) return;
  const iframe = m.querySelector('iframe');
  if(iframe){ iframe.src='about:blank'; }
  m.classList.remove('is-open');
}
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.js-open-modal');
  if(btn){ e.preventDefault(); openModal(btn.getAttribute('data-src')); }
  if(e.target.matches('.modal, .modal__close')){ closeModal(); }
});

// Hide header on scroll down, show on scroll up
(function(){
  const header = document.querySelector('.elementor-location-header');
  if(!header) return;
  let lastY = window.scrollY, ticking = false;

  function onScroll(){
    const y = window.scrollY;
    const goingDown = y > lastY && y > 120; // começa a esconder depois de 120px
    header.classList.toggle('header--hide', goingDown);
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking){ requestAnimationFrame(onScroll); ticking = true; }
  }, {passive:true});
})();

