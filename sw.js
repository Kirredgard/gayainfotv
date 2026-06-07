/* GAYA CMS — Page Multimédia */
const GAYA_MEDIA_KEYS = ["gayaCMSData", "gayaCMS", "gayaData", "gaya_cms_v1"];

function mediaReadCMS() {
  try { if (window.gayaCMSRead) { const d = window.gayaCMSRead(); if (d && Object.keys(d).length) return d; } } catch(e) {}
  for (const key of GAYA_MEDIA_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
  }
  return {};
}

function mediaEsc(v) {
  return String(v || "").replace(/[&<>'"]/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
  }[c]));
}

function mediaFormatDate(v) {
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    try {
      return new Date(v + "T00:00:00").toLocaleDateString("fr-FR", {
        day: "2-digit", month: "short", year: "numeric"
      });
    } catch(e) {}
  }
  return v;
}

function ensureMediaData(data) {
  data.multimedia = data.multimedia || {};
  data.multimedia.videos = Array.isArray(data.multimedia.videos) ? data.multimedia.videos : [];
  data.multimedia.podcasts = Array.isArray(data.multimedia.podcasts) ? data.multimedia.podcasts : [];
  data.multimedia.albums = Array.isArray(data.multimedia.albums) ? data.multimedia.albums : [];
  return data.multimedia;
}

function mediaThumb(src, icon = "fa-image") {
  if (src) return `<img src="${mediaEsc(src)}" alt="">`;
  return `<div class="video-thumb-placeholder"><i class="fa-solid ${icon}"></i></div>`;
}

function openMediaVideo(item) {
  const lb = document.getElementById("lightbox");
  const body = document.getElementById("lightbox-body");
  const cap = document.getElementById("lightbox-caption");
  if (!lb || !body) return;

  if (item.videoFile) {
    body.innerHTML = `<video src="${item.videoFile}" controls autoplay style="width:100%;aspect-ratio:16/9;border-radius:12px;background:#000;"></video>`;
  } else if (item.videoId) {
    body.innerHTML = `<iframe src="https://www.youtube.com/embed/${mediaEsc(item.videoId)}?autoplay=1&rel=0" allowfullscreen style="aspect-ratio:16/9;border-radius:12px;"></iframe>`;
  } else {
    body.innerHTML = `<div style="aspect-ratio:16/9;border-radius:12px;background:#111;display:flex;align-items:center;justify-content:center;color:#fff;">Vidéo indisponible</div>`;
  }

  if (cap) cap.textContent = item.title || "";
  lb.classList.add("open");
  document.body.style.overflow = "hidden";
}

function openMediaAlbum(album) {
  const lb = document.getElementById("lightbox");
  const body = document.getElementById("lightbox-body");
  const cap = document.getElementById("lightbox-caption");
  if (!lb || !body) return;

  const images = Array.isArray(album.images) ? album.images.filter(Boolean) : [];
  body.innerHTML = images.length ? `
    <div class="album-lightbox-grid">
      ${images.map(img => `<img src="${mediaEsc(img)}" alt="">`).join("")}
    </div>
  ` : `<div style="aspect-ratio:4/3;background:#111;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;">Aucune photo</div>`;

  if (cap) cap.textContent = album.title || "";
  lb.classList.add("open");
  document.body.style.overflow = "hidden";
}

function renderMediaVideos(videos) {
  const grid = document.getElementById("videos-grid");
  if (!grid) return;

  grid.innerHTML = videos.map((v, index) => `
    <div class="video-card" data-media-video="${index}">
      <div class="video-thumb">
        ${mediaThumb(v.thumb || v.image, "fa-film")}
        <div class="play-overlay">
          <div class="play-btn-circle"><i class="fa-solid fa-play"></i></div>
        </div>
        <span class="video-duration">${mediaEsc(v.duration || "")}</span>
        <span class="video-cat-badge">${mediaEsc(v.cat || "Vidéo")}</span>
      </div>
      <div class="video-info">
        <h3 class="video-title">${mediaEsc(v.title || "Sans titre")}</h3>
        ${v.desc ? `<p class="video-desc">${mediaEsc(v.desc)}</p>` : ""}
        <div class="video-meta">
          <span><i class="fa-regular fa-calendar"></i> ${mediaFormatDate(v.date)}</span>
          <span><i class="fa-regular fa-eye"></i> ${mediaEsc(v.views || "0")}</span>
        </div>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll("[data-media-video]").forEach(card => {
    card.addEventListener("click", () => openMediaVideo(videos[Number(card.dataset.mediaVideo)]));
  });
}

function renderMediaPodcasts(podcasts) {
  const list = document.getElementById("podcasts-list");
  if (!list) return;

  list.innerHTML = podcasts.map(p => `
    <div class="podcast-card">
      <div class="podcast-cover">
        ${p.cover ? `<img src="${mediaEsc(p.cover)}" alt="">` : `<i class="fa-solid fa-microphone"></i>`}
      </div>
      <div class="podcast-info">
        <div class="podcast-ep">${mediaEsc(p.ep || "")}</div>
        <h3 class="podcast-title">${mediaEsc(p.title || "Sans titre")}</h3>
        <p class="podcast-desc">${mediaEsc(p.desc || "")}</p>
        <div class="podcast-player">
          <audio controls ${p.audioFile ? `src="${p.audioFile}"` : ""}></audio>
          <span class="podcast-duration"><i class="fa-regular fa-clock"></i> ${mediaEsc(p.duration || "")}</span>
        </div>
      </div>
    </div>
  `).join("");
}

function renderMediaAlbums(albums) {
  const grid = document.getElementById("photos-grid");
  if (!grid) return;

  grid.innerHTML = albums.map((album, index) => {
    const images = Array.isArray(album.images) ? album.images.filter(Boolean) : [];
    const cover = album.cover || images[0] || "";
    return `
      <article class="album-card" data-media-album="${index}">
        <div class="album-cover">
          ${cover ? `<img src="${mediaEsc(cover)}" alt="">` : `<div class="video-thumb-placeholder"><i class="fa-solid fa-images"></i></div>`}
          <span class="album-count"><i class="fa-solid fa-images"></i> ${images.length || 0}</span>
        </div>
        <div class="album-body">
          <h3>${mediaEsc(album.title || "Album sans titre")}</h3>
          <p>${mediaEsc(album.desc || "")}</p>
          <div class="album-meta">
            <span><i class="fa-regular fa-calendar"></i> ${mediaFormatDate(album.date)}</span>
            <span>${mediaEsc(album.location || "")}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll("[data-media-album]").forEach(card => {
    card.addEventListener("click", () => openMediaAlbum(albums[Number(card.dataset.mediaAlbum)]));
  });
}

function applyMultimediaCMS() {
  const data = mediaReadCMS();
  const media = ensureMediaData(data);

  const ticker = document.querySelector(".ticker-content span");
  if (ticker && data.ticker) ticker.textContent = " " + data.ticker + " ";

  renderMediaVideos(media.videos);
  renderMediaPodcasts(media.podcasts);
  renderMediaAlbums(media.albums);

  const counts = {
    videos: media.videos.length,
    photos: media.albums.length,
    podcasts: media.podcasts.length
  };

  document.querySelector('[data-tab="videos"] .tab-count')?.replaceChildren(document.createTextNode(counts.videos));
  document.querySelector('[data-tab="photos"] .tab-count')?.replaceChildren(document.createTextNode(counts.photos));
  document.querySelector('[data-tab="podcasts"] .tab-count')?.replaceChildren(document.createTextNode(counts.podcasts));

  const videoCount = document.querySelector("#section-videos .media-count");
  if (videoCount) videoCount.textContent = `${counts.videos} vidéos disponibles`;
  const photoCount = document.querySelector("#section-photos .media-count");
  if (photoCount) photoCount.textContent = `${counts.photos} albums photo`;
  const podcastCount = document.querySelector("#section-podcasts .media-count");
  if (podcastCount) podcastCount.textContent = `${counts.podcasts} épisodes`;
}

document.addEventListener("DOMContentLoaded", () => {
  applyMultimediaCMS();
  setTimeout(applyMultimediaCMS, 250);
  setTimeout(applyMultimediaCMS, 900);
});
window.addEventListener("pageshow", applyMultimediaCMS);
window.addEventListener("storage", applyMultimediaCMS);


/* Synchronisation Firebase temps réel */
(function(){
  function rerender(){ try { if (typeof applyMultimediaCMS === "function") applyMultimediaCMS(); } catch(e) { console.warn("Sync CMS échouée", e); } }
  window.addEventListener("gaya-cms-updated", rerender);
  window.addEventListener("storage", rerender);
  if (window.gayaCMSOnUpdate) window.gayaCMSOnUpdate(rerender);
})();

window.addEventListener("gaya-cms-updated", applyMultimediaCMS);
if (window.gayaCMSOnUpdate) window.gayaCMSOnUpdate(applyMultimediaCMS);
