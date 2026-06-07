const STORAGE_KEYS = ["gayaCMSData", "gayaCMS", "gayaData"];

function getCMSData() {
  if (window.gayaCMSRead) { const d = gayaCMSRead(); if (d) return d; }
  const keys = ["gayaCMSData", "gayaCMS", "gayaData", "gaya_cms_v1"];
  for (const key of keys) { try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch(e) {} }
  return { articles: [] };
}

function saveCMSData(data) {
  if (window.gayaCMSWrite) { gayaCMSWrite(data); return; }
  ["gayaCMSData","gayaCMS","gayaData","gaya_cms_v1"].forEach(k => localStorage.setItem(k, JSON.stringify(data)));
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function mediaHTML(src) {
  if (!src) return `<div class="public-card-media"></div>`;
  const clean = escapeHTML(src);
  if (String(src).startsWith("data:video") || /\.(mp4|webm|ogg)$/i.test(src)) {
    return `<div class="public-card-media"><video src="${clean}" muted></video></div>`;
  }
  return `<div class="public-card-media"><img src="${clean}" alt=""></div>`;
}

function isAdminMode() {
  return new URLSearchParams(window.location.search).get("admin") === "1";
}

function renderArticles() {
  const data = getCMSData();
  const root = document.getElementById("articlesPublicList");
  const articles = data.articles || [];
  const admin = isAdminMode();

  document.body.classList.toggle("admin-mode", admin);

  if (!articles.length) {
    root.outerHTML = `<div class="empty-box">Aucun article publié pour le moment. Crée un article dans le CMS.</div>`;
    return;
  }

  root.innerHTML = articles.map(article => `
    <div class="public-card" data-id="${escapeHTML(article.id)}">
      <a href="/article/?id=${encodeURIComponent(article.id)}">
        ${mediaHTML(article.media)}
        <div class="public-card-body">
          <div class="public-card-cat">${escapeHTML(article.category || "Actualité")}</div>
          <h2 class="public-card-title">${escapeHTML(article.title || "Sans titre")}</h2>
          <div class="public-card-meta">
            ${escapeHTML(article.date || "")}${article.author ? " • Par " + escapeHTML(article.author) : ""}
          </div>
          <p class="public-card-excerpt">${escapeHTML(article.excerpt || "")}</p>
        </div>
      </a>

      <div class="articles-admin-tools">
        <a class="edit-article-btn" href="/admin/?editArticle=${encodeURIComponent(article.id)}">Modifier</a>
        <button class="delete-article-btn" type="button" data-delete-id="${escapeHTML(article.id)}">Supprimer</button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll("[data-delete-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.deleteId;
      const article = articles.find(a => String(a.id) === String(id));
      const title = article?.title || "cet article";
      if (!confirm(`Supprimer "${title}" ?`)) return;

      const latest = getCMSData();
      latest.articles = (latest.articles || []).filter(a => String(a.id) !== String(id));

      // Supprime aussi le lien des slides qui pointaient vers cet article
      latest.slides = (latest.slides || []).map(slide => {
        if (String(slide.articleId) === String(id)) {
          return { ...slide, articleId: "", link: "#" };
        }
        return slide;
      });

      saveCMSData(latest);
      renderArticles();
    });
  });
}

renderArticles();

window.addEventListener('gaya-cms-updated', renderArticles);
window.addEventListener('storage', renderArticles);
if (window.gayaCMSOnUpdate) window.gayaCMSOnUpdate(renderArticles);
