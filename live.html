/* GAYA CMS — Toutes les pages Émissions */
const GAYA_EMISSION_KEYS = ["gayaCMSData", "gayaCMS", "gayaData", "gaya_cms_v1"];

const GAYA_EMISSION_CONFIG = {
  societe: { label: "Société", icon: "fa-users", accent: "#2d5be3" },
  economie: { label: "Économie", icon: "fa-chart-line", accent: "#1a7c4f" },
  religion: { label: "Religion", icon: "fa-mosque", accent: "#b8571a" },
  sport: { label: "Sport", icon: "fa-futbol", accent: "#c8102e" },
  faitsdivers: { label: "Faits divers", icon: "fa-newspaper", accent: "#996600" }
};

function gayaReadCMS() {
  if (window.gayaCMSRead) { const d = gayaCMSRead(); if (d) return d; }
  const keys = ["gayaCMSData", "gayaCMS", "gayaData", "gaya_cms_v1"];
  for (const key of keys) { try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch(e) {} }
  return {};
}

function gayaEsc(v) {
  return String(v || "").replace(/[&<>'"]/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
  }[c]));
}

function gayaFormatDate(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    try {
      return new Date(value + "T00:00:00").toLocaleDateString("fr-FR", {
        day: "2-digit", month: "short", year: "numeric"
      });
    } catch(e) {}
  }
  return value;
}

function getEmissionSlug() {
  const file = location.pathname.split("/").pop().replace(".html", "");
  return file === "" ? "societe" : file;
}

function gayaThumb(image, icon = "fa-users") {
  if (image) return `<img src="${gayaEsc(image)}" alt="">`;
  return `<span class="ep-icon"><i class="fa-solid ${icon}"></i></span>`;
}

function openGayaEmissionMedia(episode) {
  const lb = document.getElementById("video-lightbox");
  const iframe = document.getElementById("lightbox-iframe");
  const titleEl = document.getElementById("lightbox-video-title");
  if (!lb || !iframe) return;

  if (episode.videoFile) {
    iframe.outerHTML = `<video id="lightbox-iframe" src="${episode.videoFile}" controls autoplay style="width:100%;aspect-ratio:16/9;border-radius:var(--radius-lg);background:#000;display:block;"></video>`;
  } else {
    const videoId = episode.videoId || episode.id || "dQw4w9WgXcQ";
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }

  const title = document.getElementById("lightbox-video-title");
  if (title) title.textContent = episode.title || "";
  lb.classList.add("open");
  document.body.style.overflow = "hidden";
}

function resetGayaLightbox() {
  const closeBtn = document.querySelector(".lightbox-close");
  if (!closeBtn || closeBtn.dataset.gayaBound === "1") return;
  closeBtn.dataset.gayaBound = "1";
  closeBtn.onclick = () => {
    const lb = document.getElementById("video-lightbox");
    const media = document.getElementById("lightbox-iframe");
    if (lb) lb.classList.remove("open");
    if (media) {
      if (media.tagName === "VIDEO") {
        media.pause();
        media.outerHTML = `<iframe id="lightbox-iframe" allowfullscreen></iframe>`;
      } else {
        media.src = "";
      }
    }
    document.body.style.overflow = "";
  };
}

function gayaDayLabel(dateStr) {
  if (!dateStr) return "";
  const days = ["DIM","LUN","MAR","MER","JEU","VEN","SAM"];
  try { return days[new Date(dateStr + "T00:00:00").getDay()]; } catch(e) { return ""; }
}

function applyEmissionProgrammes(data, slug) {
  const list = document.querySelector(".schedule-list");
  const programmes = data.emissions?.[slug]?.programmes || [];
  if (!list) return;

  const today = new Date();
  today.setHours(0,0,0,0);

  const visible = programmes
    .filter(p => {
      if (!p.date) return true;
      const d = new Date(p.date + "T00:00:00");
      return d >= today;
    })
    .sort((a,b) => String(a.date + a.startTime).localeCompare(String(b.date + b.startTime)))
    .slice(0, 6);

  if (!visible.length) return;

  list.innerHTML = visible.map(p => `
    <div class="schedule-item">
      <span class="schedule-day">${gayaDayLabel(p.date)}</span>
      <div>
        <div class="schedule-show">${gayaEsc(p.title || "Émission")}</div>
        <div class="schedule-time">${gayaEsc(p.startTime || "")}${p.endTime ? " – " + gayaEsc(p.endTime) : ""}</div>
      </div>
    </div>
  `).join("");
}

function applyEmissionCMS() {
  const slug = getEmissionSlug();
  const cfg = GAYA_EMISSION_CONFIG[slug] || GAYA_EMISSION_CONFIG.societe;
  const data = gayaReadCMS() || {};
  data.emissions = data.emissions || {};
  if (!data.emissions[slug]) {
    const legacyEpisodes = data[slug + "Episodes"] || data["emissions_" + slug] || data[slug]?.episodes || [];
    const legacyProgrammes = data[slug + "Programmes"] || data[slug]?.programmes || [];
    if (Array.isArray(legacyEpisodes) || Array.isArray(legacyProgrammes)) {
      data.emissions[slug] = {
        featuredEpisodeId: data[slug + "FeaturedEpisodeId"] || data[slug]?.featuredEpisodeId || "",
        episodes: Array.isArray(legacyEpisodes) ? legacyEpisodes : [],
        programmes: Array.isArray(legacyProgrammes) ? legacyProgrammes : []
      };
    }
  }
  const emission = data.emissions?.[slug];

  resetGayaLightbox();

  const ticker = document.querySelector(".ticker-content span");
  if (ticker && data.ticker) ticker.textContent = " " + data.ticker + " ";

  const liveTitle = document.getElementById("live-title");
  if (liveTitle) liveTitle.textContent = data.liveTitle || data.live?.title || "GAYA INFO TV — Direct";

  const liveContent = document.getElementById("live-content");
  const embed = data.liveEmbed || data.live?.embedUrl || "";
  if (liveContent && embed) {
    liveContent.innerHTML = `<iframe src="${gayaEsc(embed)}" allowfullscreen></iframe>`;
  }

  applyEmissionProgrammes(data, slug);

  if (!emission) return;

  const episodes = [...(emission.episodes || [])]
    .sort((a,b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  const featured = episodes.find(e => String(e.id) === String(emission.featuredEpisodeId)) || episodes[0];

  const featuredBox = document.querySelector(".emission-featured");
  if (featuredBox && featured) {
    const media = featuredBox.querySelector(".emission-featured-media");
    if (media) {
      media.style.display = "";
      media.hidden = false;
      media.onclick = () => openGayaEmissionMedia(featured);
      media.innerHTML = `
        <div class="placeholder-bg">${gayaThumb(featured.image, cfg.icon)}</div>
        <div class="featured-play-btn"><div class="play-circle"><i class="fa-solid fa-play"></i></div></div>
        <span class="featured-badge">À la une</span>
      `;
    }

    const label = featuredBox.querySelector(".emission-ep-label");
    if (label) label.textContent = `Émission phare • ${cfg.label}`;

    const title = featuredBox.querySelector(".emission-featured-title");
    if (title) title.textContent = featured.title || "";

    const desc = featuredBox.querySelector(".emission-featured-desc");
    if (desc) desc.textContent = featured.desc || "";

    const meta = featuredBox.querySelector(".emission-meta-row");
    if (meta) {
      meta.innerHTML = `
        <span><i class="fa-regular fa-calendar"></i> ${gayaFormatDate(featured.date)}</span>
        <span><i class="fa-regular fa-clock"></i> ${gayaEsc(featured.duration || "")}</span>
        <span><i class="fa-regular fa-eye"></i> ${gayaEsc(featured.views || "0")} vues</span>
      `;
    }
  }

  const grid = document.getElementById("episodes-grid");
  const list = document.getElementById("episodes-list");

  const mainEpisodes = episodes.slice(0, 8);
  const moreEpisodes = episodes.slice(8);

  if (grid) {
    grid.innerHTML = mainEpisodes.map((e, index) => `
      <div class="episode-card" data-emission-episode="${index}">
        <div class="episode-thumb">
          ${gayaThumb(e.image, cfg.icon)}
          <div class="ep-play-overlay"><div class="ep-play-sm"><i class="fa-solid fa-play"></i></div></div>
          <span class="ep-duration">${gayaEsc(e.duration || "")}</span>
          <span class="ep-num-badge">${gayaEsc(e.ep || "")}</span>
        </div>
        <div class="episode-info">
          <h3 class="episode-title">${gayaEsc(e.title || "")}</h3>
          <div class="episode-meta">
            <span><i class="fa-regular fa-calendar"></i>${gayaFormatDate(e.date)}</span>
            <span><i class="fa-regular fa-eye"></i>${gayaEsc(e.views || "0")}</span>
          </div>
        </div>
      </div>
    `).join("");

    grid.querySelectorAll("[data-emission-episode]").forEach(card => {
      card.addEventListener("click", () => {
        openGayaEmissionMedia(mainEpisodes[Number(card.dataset.emissionEpisode)]);
      });
    });
  }

  if (list) {
    list.innerHTML = moreEpisodes.length ? moreEpisodes.map((e, i) => `
      <div class="episode-list-item" data-emission-list-episode="${i}">
        <div class="episode-list-thumb">${gayaThumb(e.image, cfg.icon)}</div>
        <div class="episode-list-info">
          <div class="episode-list-ep">${gayaEsc(e.ep || "")}</div>
          <div class="episode-list-title">${gayaEsc(e.title || "")}</div>
          <div class="episode-list-meta">${gayaFormatDate(e.date)} · ${gayaEsc(e.duration || "")}</div>
        </div>
      </div>
    `).join("") : "";

    list.querySelectorAll("[data-emission-list-episode]").forEach(item => {
      item.addEventListener("click", () => {
        openGayaEmissionMedia(moreEpisodes[Number(item.dataset.emissionListEpisode)]);
      });
    });
  }
}

let gayaEmissionSupabaseBound = false;
function applyEmissionCMSFromSupabaseOnce() {
  try {
    if (window.gayaCMSRead) {
      const d = window.gayaCMSRead();
      if (d && Object.keys(d).length) applyEmissionCMS();
    }
    if (!gayaEmissionSupabaseBound && window.gayaCMSOnUpdate) {
      gayaEmissionSupabaseBound = true;
      window.gayaCMSOnUpdate(applyEmissionCMS);
    }
  } catch(e) {}
}

document.addEventListener("DOMContentLoaded", () => {
  applyEmissionCMS();
  applyEmissionCMSFromSupabaseOnce();
  setTimeout(applyEmissionCMS, 250);
  setTimeout(applyEmissionCMSFromSupabaseOnce, 700);
  setTimeout(applyEmissionCMS, 1200);
});
window.addEventListener("pageshow", applyEmissionCMS);
window.addEventListener("storage", applyEmissionCMS);
window.addEventListener("gaya-cms-updated", applyEmissionCMS);
if (window.gayaCMSOnUpdate) window.gayaCMSOnUpdate(applyEmissionCMS);

/* === FIX FINAL SOCIÉTÉ : lecture fiable + compatibilité anciennes sauvegardes === */
(function(){
  const SOCIETE_ALIASES = ["societe", "société", "Société", "emissionSociete", "emissionsSociete"];

  function asArray(v){ return Array.isArray(v) ? v : []; }
  function isSocietePage(){ return (location.pathname.split('/').pop() || '/societe/').replace('.html','') === 'societe'; }
  function esc(v){ return String(v || '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }
  function fmtDate(v){ if(!v) return ''; try { return new Date(v + 'T00:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}); } catch(e){ return v || ''; } }
  function normalizeEpisode(ep){
    return Object.assign({ id: Date.now().toString(36), title: '', desc: '', image: '', videoId: '', videoFile: '', duration: '', views: '0', date: '', createdAt: '' }, ep || {});
  }
  function getSocieteFromAnyShape(data){
    data = data || {};
    const candidates = [];
    if (data.emissions && data.emissions.societe) candidates.push(data.emissions.societe);
    SOCIETE_ALIASES.forEach(k => { if (data[k]) candidates.push(data[k]); });
    if (data.societeEpisodes || data.societeProgrammes) candidates.push({
      episodes: data.societeEpisodes,
      programmes: data.societeProgrammes,
      featuredEpisodeId: data.societeFeaturedEpisodeId
    });
    if (data.emissions_societe) candidates.push(data.emissions_societe);

    let best = { episodes: [], programmes: [], featuredEpisodeId: '' };
    candidates.forEach(c => {
      if (!c || typeof c !== 'object') return;
      const eps = asArray(c.episodes).map(normalizeEpisode);
      const progs = asArray(c.programmes);
      if (eps.length >= best.episodes.length) {
        best = {
          episodes: eps,
          programmes: progs.length ? progs : best.programmes,
          featuredEpisodeId: c.featuredEpisodeId || c.featured || best.featuredEpisodeId || ''
        };
      }
    });
    return best;
  }

  function readData(){
    try { if (window.gayaCMSRead) return window.gayaCMSRead() || {}; } catch(e) {}
    for (const k of ["gayaCMSData", "gayaCMS", "gayaData", "gaya_cms_v1"]) {
      try { const raw = localStorage.getItem(k); if (raw) return JSON.parse(raw); } catch(e) {}
    }
    return {};
  }

  function openMedia(ep){
    if (typeof openGayaEmissionMedia === 'function') return openGayaEmissionMedia(ep);
  }

  window.applySocieteDirectCMS = function(){
    if (!isSocietePage()) return;
    const data = readData();
    const societe = getSocieteFromAnyShape(data);
    const episodes = asArray(societe.episodes).sort((a,b) => String(b.createdAt || b.date || '').localeCompare(String(a.createdAt || a.date || '')));
    const featured = episodes.find(e => String(e.id) === String(societe.featuredEpisodeId)) || episodes[0];
    const title = document.querySelector('.emission-featured-title');
    const desc = document.querySelector('.emission-featured-desc');
    const media = document.querySelector('.emission-featured-media');
    const meta = document.querySelector('.emission-meta-row');
    const grid = document.getElementById('episodes-grid');
    const list = document.getElementById('episodes-list');

    if (!featured) {
      if (title) title.textContent = 'Aucun épisode publié';
      if (desc) desc.textContent = 'Ajoute un épisode Société dans le CMS puis clique sur Enregistrer cette page.';
      if (grid) grid.innerHTML = '';
      return;
    }

    if (media) {
      media.onclick = () => openMedia(featured);
      media.innerHTML = `<div class="placeholder-bg">${featured.image ? `<img src="${esc(featured.image)}" alt="">` : `<i class="fa-solid fa-users"></i>`}</div><div class="featured-play-btn"><div class="play-circle"><i class="fa-solid fa-play"></i></div></div><span class="featured-badge">À la une</span>`;
    }
    if (title) title.textContent = featured.title || 'Épisode Société';
    if (desc) desc.textContent = featured.desc || '';
    if (meta) meta.innerHTML = `<span><i class="fa-regular fa-calendar"></i> ${fmtDate(featured.date) || '—'}</span><span><i class="fa-regular fa-clock"></i> ${esc(featured.duration) || '—'}</span><span><i class="fa-regular fa-eye"></i> ${esc(featured.views || '0')} vues</span>`;

    const first = episodes.slice(0,8);
    const more = episodes.slice(8);
    if (grid) {
      grid.innerHTML = first.map((e,i) => `<div class="episode-card" data-societe-fixed="${i}"><div class="episode-thumb">${e.image ? `<img src="${esc(e.image)}" alt="">` : `<span class="ep-icon"><i class="fa-solid fa-users"></i></span>`}<div class="ep-play-overlay"><div class="ep-play-sm"><i class="fa-solid fa-play"></i></div></div><span class="ep-duration">${esc(e.duration)}</span><span class="ep-num-badge">${esc(e.ep)}</span></div><div class="episode-info"><h3 class="episode-title">${esc(e.title)}</h3><div class="episode-meta"><span><i class="fa-regular fa-calendar"></i>${fmtDate(e.date)}</span><span><i class="fa-regular fa-eye"></i>${esc(e.views || '0')}</span></div></div></div>`).join('');
      grid.querySelectorAll('[data-societe-fixed]').forEach(card => card.onclick = () => openMedia(first[Number(card.dataset.societeFixed)]));
    }
    if (list) {
      list.innerHTML = more.length ? more.map((e,i) => `<div class="episode-list-item" data-societe-more="${i}"><div class="episode-list-thumb">${e.image ? `<img src="${esc(e.image)}" alt="">` : `<span class="lt-icon"><i class="fa-solid fa-users"></i></span>`}</div><div class="episode-list-info"><div class="episode-list-ep">${esc(e.ep)}</div><div class="episode-list-title">${esc(e.title)}</div><div class="episode-list-meta">${fmtDate(e.date)} · ${esc(e.duration)}</div></div></div>`).join('') : '';
      list.querySelectorAll('[data-societe-more]').forEach(item => item.onclick = () => openMedia(more[Number(item.dataset.societeMore)]));
    }
  };

  function bindSupabase(){
    try { if (window.gayaCMSOnUpdate) window.gayaCMSOnUpdate(window.applySocieteDirectCMS); } catch(e) {}
  }


  document.addEventListener('DOMContentLoaded', () => {
    window.applySocieteDirectCMS();
    bindSupabase();
    setTimeout(window.applySocieteDirectCMS, 500);
    setTimeout(window.applySocieteDirectCMS, 1500);
  });
  window.addEventListener('gaya-cms-updated', window.applySocieteDirectCMS);
  window.addEventListener('storage', window.applySocieteDirectCMS);
})();
