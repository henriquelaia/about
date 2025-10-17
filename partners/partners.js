/* ====== LOGO CAROUSEL (Lucrar Partners) ====== */
document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("lcrPartnersTrack");
  if (!track) return;

  const strip = track.closest(".lcr-partners-strip");
  const root  = track.closest(".lcr-partners");

  // guarda o HTML “semente” (um set de logos)
  const seedHTML = track.innerHTML;

  function build() {
    // recomeça com a semente
    track.innerHTML = seedHTML;

    // garante que a 1ª metade é pelo menos tão larga como a janela visível
    const target = strip.clientWidth;
    while (track.scrollWidth < target) {
      track.insertAdjacentHTML("beforeend", seedHTML);
    }

    // duplica a 1ª metade para loop perfeito (2 metades iguais)
    const firstHalfCount = track.children.length;
    track.insertAdjacentHTML("beforeend", track.innerHTML);

    // marca a 2ª metade como aria-hidden
    Array.from(track.children).forEach((li, i) => {
      if (i >= firstHalfCount) li.setAttribute("aria-hidden", "true");
    });

    // calcula duração com base na largura de UM ciclo e --pxps
    const styles = getComputedStyle(root);
    const pxps = parseFloat(styles.getPropertyValue("--pxps")) || 100;
    const runW = track.scrollWidth / 2; // largura de um ciclo
    track.style.setProperty("--runW", runW + "px");
    track.style.setProperty("--duration", (runW / pxps) + "s");
  }

  build();
  window.addEventListener("resize", build);
});