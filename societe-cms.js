/* GAYA CMS — Page Émissions Société */
const GAYA_STORAGE_KEYS = ["gayaCMSData", "gayaCMS", "gayaData", "gaya_cms_v1"];

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

function gayaThumb(image, icon = "fa-users") {
  if (image) return `<img src="${gayaEsc(image)}" alt="">`;
  return `<span class="ep-icon"><i class="fa-solid ${icon}"></i></span>`;
}

function openSocieteMedia(episode) {
  const lb = document.getElementById("video-lightbox");
  const iframe = document.getElementById("lightbox-iframe");
  const titleEl = document.getElementById("lightbox-video-title");
  if (!lb || !iframe) return;

  if (episode.videoFile) {
    iframe.outerHTML = `<video id="lightbox-iframe" src="${episode.videoFile}" controls autoplay style="width:100%;aspect-ratio:16/9;border-radius:var(--radius-lg);background:#000;display:block;"></video>`;
  } else {
    const videoId = episode.videoId || "dQw4w9WgXcQ";
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }

  const newTitle = document.getElementById("lightbox-video-title");
  if (newTitle) newTitle.textContent = episode.title || "";
  lb.classList.add("open");
  document.body.style.overflow = "hidden";
}

function resetLightboxCloseForVideo() {
  const closeBtn = document.querySelector(".lightbox-close");
  if (!closeBtn) return;
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

function applySocieteCMS() {
  const data = gayaReadCMS();
  const societe = data.emissions?.societe;
  applySocieteProgrammesCMS(data);
  if (!societe) return;

  resetLightboxCloseForVideo();

  const ticker = document.querySelector(".ticker-content span");
  if (ticker && data.ticker) ticker.textContent = " " + data.ticker + " ";

  const liveTitle = document.getElementById("live-title");
  if (liveTitle) liveTitle.textContent = data.liveTitle || data.live?.title || "GAYA INFO TV — Direct";

  const liveContent = document.getElementById("live-content");
  const embed = data.liveEmbed || data.live?.embedUrl || "";
  if (liveContent && embed) {
    liveContent.innerHTML = `<iframe src="${gayaEsc(embed)}" allowfullscreen></iframe>`;
  }

  const episodes = [...(societe.episodes || [])]
    .sort((a,b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  const featured = episodes.find(e => String(e.id) === String(societe.featuredEpisodeId)) || episodes[0];

  const featuredBox = document.querySelector(".emission-featured");
  if (featuredBox && featured) {
    const media = featuredBox.querySelector(".emission-featured-media");
    if (media) {
      media.onclick = () => openSocieteMedia(featured);
      media.innerHTML = `
        <div class="placeholder-bg">${gayaThumb(featured.image, "fa-users")}</div>
        <div class="featured-play-btn"><div class="play-circle"><i class="fa-solid fa-play"></i></div></div>
        <span class="featured-badge">À la une</span>
      `;
    }

    const label = featuredBox.querySelector(".emission-ep-label");
    if (label) label.textContent = "Émission phare • Société";

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

  const mainEpisodes = episodes.slice(0, 6);
  const moreEpisodes = episodes.slice(6);

  if (grid) {
    grid.innerHTML = mainEpisodes.map((e, index) => `
      <div class="episode-card" data-societe-episode="${index}">
        <div class="episode-thumb">
          ${gayaThumb(e.image, "fa-users")}
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

    grid.querySelectorAll("[data-societe-episode]").forEach(card => {
      card.addEventListener("click", () => {
        openSocieteMedia(mainEpisodes[Number(card.dataset.societeEpisode)]);
      });
    });
  }

  if (list) {
    if (!moreEpisodes.length) {
      list.innerHTML = "";
    } else {
      list.innerHTML = moreEpisodes.map((e, i) => `
        <div class="episode-list-item" data-societe-list-episode="${i}">
          <div class="episode-list-thumb">${gayaThumb(e.image, "fa-users")}</div>
          <div class="episode-list-info">
            <div class="episode-list-ep">${gayaEsc(e.ep || "")}</div>
            <div class="episode-list-title">${gayaEsc(e.title || "")}</div>
            <div class="episode-list-meta">${gayaFormatDate(e.date)} · ${gayaEsc(e.duration || "")}</div>
          </div>
        </div>
      `).join("");

      list.querySelectorAll("[data-societe-list-episode]").forEach(item => {
        item.addEventListener("click", () => {
          openSocieteMedia(moreEpisodes[Number(item.dataset.societeListEpisode)]);
        });
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applySocieteCMS();
  setTimeout(applySocieteCMS, 250);
  setTimeout(applySocieteCMS, 900);
});
window.addEventListener("pageshow", applySocieteCMS);
window.addEventListener("storage", applySocieteCMS);


/* === Programme de la semaine depuis le CMS === */
function gayaDayLabel(dateStr) {
  if (!dateStr) return "";
  const days = ["DIM","LUN","MAR","MER","JEU","VEN","SAM"];
  try { return days[new Date(dateStr + "T00:00:00").getDay()]; } catch(e) { return ""; }
}

function applySocieteProgrammesCMS(data) {
  const list = document.querySelector(".schedule-list");
  const programmes = data.emissions?.societe?.programmes || [];
  if (!list || !programmes.length) return;

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

  list.innerHTML = (visible.length ? visible : []).map(p => `
    <div class="schedule-item">
      <span class="schedule-day">${gayaDayLabel(p.date)}</span>
      <div>
        <div class="schedule-show">${gayaEsc(p.title || "Émission")}</div>
        <div class="schedule-time">${gayaEsc(p.startTime || "")}${p.endTime ? " – " + gayaEsc(p.endTime) : ""}</div>
      </div>
    </div>
  `).join("") || `
    <div class="schedule-item">
      <span class="schedule-day">—</span>
      <div>
        <div class="schedule-show">Aucun programme à venir</div>
        <div class="schedule-time">Ajoute un programme depuis le CMS</div>
      </div>
    </div>
  `;
}


/* Synchronisation Firebase temps réel */
(function(){
  function rerender(){ try { if (typeof applySocieteCMS === "function") applySocieteCMS(); } catch(e) { console.warn("Sync CMS échouée", e); } }
  window.addEventListener("gaya-cms-updated", rerender);
  window.addEventListener("storage", rerender);
  if (window.gayaCMSOnUpdate) window.gayaCMSOnUpdate(rerender);
})();
