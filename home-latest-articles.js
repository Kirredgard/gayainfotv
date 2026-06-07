/* GAYA HOME — force 6 derniers articles seulement */
(function(){
  function readCMS() {
  if (window.gayaCMSRead) { const d = gayaCMSRead(); if (d) return d; }
  const keys = ["gayaCMSData", "gayaCMS", "gayaData", "gaya_cms_v1"];
  for (const key of keys) { try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch(e) {} }
  return null;
}

  
function gayaCommentsCount(articleId) {
  return window.gayaGetCommentCount ? window.gayaGetCommentCount(articleId) : 0;
}

function gayaViewsCount(article) {
  if (window.gayaGetViewCount) return window.gayaGetViewCount(article && article.id, Number((article && (article.reads || article.views)) || 0));
  return Number((article && (article.reads || article.views)) || 0);
}

function gayaFormatDate(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    try {
      return new Date(value + "T00:00:00").toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch(e) {}
  }
  return value;
}

function esc(v) {
    return String(v || "").replace(/[&<>'"]/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
    }[c]));
  }

  function mediaHTML(src) {
    if (!src) return '<i class="fa-regular fa-newspaper placeholder-icon"></i>';
    if (String(src).startsWith("data:video") || /\.(mp4|webm|ogg)$/i.test(src)) {
      return `<video src="${src}" muted playsinline style="width:100%;height:100%;object-fit:cover;"></video>`;
    }
    return `<img src="${esc(src)}" alt="">`;
  }

  function applyLatest() {
    const data = readCMS();
    if (!data || !Array.isArray(data.articles)) return;

    const grid = document.getElementById("articles-grid");
    if (!grid) return;

    const articles = [...data.articles]
      .sort((a,b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
      .slice(0, 6);

    grid.innerHTML = articles.map(article => {
      const link = article.id ? `/article/?id=${article.id}` : "#";
      return `
        <a class="article-card" href="${esc(link)}">
          <div class="article-card-img">${mediaHTML(article.media || article.image || "")}</div>
          <div class="article-card-body">
            <span class="article-category">${esc(article.category || "Actualités")}</span>
            <h3 class="article-title">${esc(article.title || "Sans titre")}</h3>
            <p class="article-excerpt">${esc(article.excerpt || "")}</p>
            <div class="article-meta">
              <span><i class="fa-regular fa-calendar"></i> ${esc(gayaFormatDate(article.date || ""))}</span>
              <span><i class="fa-regular fa-eye"></i> <span data-view-count-id="${esc(article.id || '')}">${gayaViewsCount(article)}</span> vues</span>
              <span><i class="fa-regular fa-comment-dots"></i> <span data-comment-count-id="${esc(article.id || '')}">${gayaCommentsCount(article.id)}</span> commentaires</span>
            </div>
          </div>
        </a>
      `;
    }).join("");
    const ids = articles.map(a => a.id).filter(Boolean);
    if (window.gayaRefreshCommentCounts) window.gayaRefreshCommentCounts(ids);
    if (window.gayaRefreshViewCounts) window.gayaRefreshViewCounts(ids);
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyLatest();
    setTimeout(applyLatest, 300);
    setTimeout(applyLatest, 1000);
  });
  window.addEventListener("pageshow", applyLatest);
  window.addEventListener("storage", applyLatest);
  window.addEventListener("gaya-supabase-ready", applyLatest);
})();
