/* GAYA HOME CMS BRIDGE — slider accueil avec autoplay forcé */
(function () {
  let current = 0;
  let timer = null;

  function readCMS() {
  if (window.gayaCMSRead) { const d = gayaCMSRead(); if (d) return d; }
  const keys = ["gayaCMSData", "gayaCMS", "gayaData", "gaya_cms_v1"];
  for (const key of keys) { try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch(e) {} }
  return null;
}

  function esc(v) {
    return String(v || "").replace(/[&<>'"]/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
    }[c]));
  }

  function getSlides() {
    return [...document.querySelectorAll("#slider .slide")];
  }

  function getDots() {
    return [...document.querySelectorAll("#slider-dots .dot")];
  }

  function activate(index) {
    const slides = getSlides();
    const dots = getDots();
    if (!slides.length) return;

    current = ((index % slides.length) + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === current);
      slide.style.opacity = i === current ? "1" : "0";
      slide.style.pointerEvents = i === current ? "auto" : "none";
    });

    dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
  }

  function startAutoplay() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      const slides = getSlides();
      if (slides.length > 1) activate(current + 1);
    }, 4000);
  }

  function bindControls() {
    const slider = document.getElementById("slider");
    if (!slider) return;

    const prev = slider.querySelector(".slider-prev");
    const next = slider.querySelector(".slider-next");

    window.goToSlide = function(index) {
      activate(index);
      startAutoplay();
    };

    window.changeSlide = function(direction) {
      activate(current + direction);
      startAutoplay();
    };

    if (prev) prev.onclick = () => window.changeSlide(-1);
    if (next) next.onclick = () => window.changeSlide(1);

    getDots().forEach((dot, i) => {
      dot.onclick = () => window.goToSlide(i);
    });
  }

  function buildFromCMS(data) {
    const slider = document.getElementById("slider");
    const dots = document.getElementById("slider-dots");
    const slidesData = Array.isArray(data?.slides) ? data.slides : [];

    if (!slider || !dots || !slidesData.length) return false;

    const prev = slider.querySelector(".slider-prev");
    const fallbacks = [
      "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      "linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%)",
      "linear-gradient(135deg, #1b1b2f 0%, #2c2c54 100%)"
    ];

    slider.querySelectorAll(".slide").forEach(s => s.remove());
    dots.innerHTML = "";

    slidesData.forEach((slide, i) => {
      const link = slide.link || (slide.articleId ? `article.html?id=${slide.articleId}` : "#");
      const el = document.createElement("div");
      el.className = `slide ${i === 0 ? "active" : ""}`;
      el.style.background = slide.image
        ? `linear-gradient(to bottom, rgba(0,0,0,.08), rgba(0,0,0,.74)), url('${slide.image}') center/cover`
        : fallbacks[i % fallbacks.length];

      el.innerHTML = `
        <div class="slide-image-overlay"></div>
        <div class="slide-content">
          <span class="slide-category">${esc(slide.category)}</span>
          <h2 class="slide-title">${esc(slide.title)}</h2>
          <p class="slide-excerpt">${esc(slide.excerpt)}</p>
          <a href="${esc(link)}" class="slide-btn">Lire l'article <i class="fa-solid fa-arrow-right"></i></a>
        </div>`;

      slider.insertBefore(el, prev || dots);

      const dot = document.createElement("span");
      dot.className = `dot ${i === 0 ? "active" : ""}`;
      dots.appendChild(dot);
    });

    return true;
  }

  function applyHomeCMS() {
    const data = readCMS();

    if (data) {
      const ticker = document.querySelector(".ticker-content span");
      if (ticker && data.ticker) ticker.textContent = " " + data.ticker + " ";

      const liveTitle = document.getElementById("live-title");
      if (liveTitle) liveTitle.textContent = data.liveTitle || data.live?.title || "GAYA INFO TV — Direct";

      buildFromCMS(data);
    }

    bindControls();
    activate(0);
    startAutoplay();
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyHomeCMS();
    setTimeout(applyHomeCMS, 300);
    setTimeout(applyHomeCMS, 1000);
  });

  window.addEventListener("pageshow", applyHomeCMS);
  window.addEventListener("focus", applyHomeCMS);
  window.addEventListener("storage", applyHomeCMS);
  window.addEventListener("gaya-cms-updated", applyHomeCMS);
})();


/* Synchronisation Firebase temps réel */
(function(){
  function rerender(){ try { if (typeof applyHomeCMS === "function") applyHomeCMS(); } catch(e) { console.warn("Sync CMS échouée", e); } }
  window.addEventListener("gaya-cms-updated", rerender);
  window.addEventListener("storage", rerender);
  if (window.gayaCMSOnUpdate) window.gayaCMSOnUpdate(rerender);
})();
