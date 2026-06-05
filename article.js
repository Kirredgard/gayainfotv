/* Article dynamique + commentaires */
const STORAGE_KEYS = ["gayaCMSData", "gayaCMS", "gayaData", "gaya_cms_v1"];

function getCMSData() {
  if (window.gayaCMSRead) {
    const d = gayaCMSRead();
    if (d) return d;
  }
  for (const key of STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
  }
  return { articles: [] };
}

function saveCMSData(data) {
  if (window.gayaCMSWrite) { gayaCMSWrite(data); return; }
  const payload = JSON.stringify(data);
  STORAGE_KEYS.forEach(key => localStorage.setItem(key, payload));
}

function esc(v) {
  return String(v || "").replace(/[&<>'"]/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
  }[c]));
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
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

function mediaHTML(src) {
  if (!src) return "";
  if (String(src).startsWith("data:video") || /\.(mp4|webm|ogg)$/i.test(src)) {
    return `<div class="article-media-full"><video src="${src}" controls></video></div>`;
  }
  return `<div class="article-media-full"><img src="${esc(src)}" alt=""></div>`;
}

function formatContent(content) {
  const text = String(content || "").trim();
  if (!text) return "";
  return text.split(/\n{2,}/).map(p => `<p>${esc(p)}</p>`).join("");
}

function commentsKey(id) {
  return `gaya_article_comments_${id}`;
}

function getComments(id) {
  try {
    return JSON.parse(localStorage.getItem(commentsKey(id)) || "[]");
  } catch(e) {
    return [];
  }
}

function saveComments(id, comments) {
  if (window.gayaCMSWriteComments) { gayaCMSWriteComments(id, comments); return; }
  localStorage.setItem(commentsKey(id), JSON.stringify(comments));
}

function timeAgo(dateISO) {
  const diff = Math.max(1, Math.floor((Date.now() - new Date(dateISO).getTime()) / 60000));
  if (diff < 60) return `il y a ${diff} minute${diff > 1 ? "s" : ""}`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `il y a ${h} heure${h > 1 ? "s" : ""}`;
  const d = Math.floor(h / 24);
  return `il y a ${d} jour${d > 1 ? "s" : ""}`;
}

function renderComments(articleId) {
  if (window.gayaCMSReadComments) {
    gayaCMSReadComments(articleId, (comments) => _renderCommentsList(articleId, comments));
    return;
  }
  const comments = getComments(articleId);
  _renderCommentsList(articleId, comments);
}

function _renderCommentsList(articleId, comments) {
  const list = document.getElementById("comments-list");
  const title = document.getElementById("comments-title");
  if (!list || !title) return;

  title.textContent = `COMMENTAIRES (${comments.length})`;

  if (!comments.length) {
    list.innerHTML = `<div class="comment-item"><div class="comment-text">Aucun commentaire pour le moment.</div></div>`;
    return;
  }

  
  list.innerHTML = comments.map((comment, index) => `
    <div class="comment-item">
      <div class="comment-head">
        <div class="comment-avatar">${esc((comment.name || "A").charAt(0).toUpperCase())}</div>
        <div>
          <div class="comment-name">${esc(comment.name || "Anonyme")}</div>
          <div class="comment-time">${timeAgo(comment.createdAt)}</div>
        </div>
      </div>

      <div class="comment-text">${esc(comment.text)}</div>

      <div style="margin-top:12px;">
        <button 
          type="button"
          class="reply-btn"
          data-reply="${index}"
          style="background:#111827;color:#fff;border:none;padding:7px 12px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;"
        >
          Répondre
        </button>
      </div>

      ${(comment.replies && comment.replies.length) ? `
        <div style="margin-top:18px;padding-left:24px;border-left:3px solid #e5e7eb;display:flex;flex-direction:column;gap:14px;">
          ${comment.replies.map(reply => `
            <div style="background:#fff;padding:12px;border-radius:6px;">
              <div style="font-weight:900;color:#03082f;font-size:13px;margin-bottom:4px;">
                ${esc(reply.name || "Anonyme")}
              </div>
              <div style="color:#7b8198;font-size:12px;margin-bottom:8px;">
                ${timeAgo(reply.createdAt)}
              </div>
              <div style="font-size:15px;line-height:1.6;color:#03082f;">
                ${esc(reply.text)}
              </div>
            </div>
          `).join("")}
        </div>
      ` : ""}

      <form 
        class="reply-form" 
        data-reply-form="${index}" 
        style="display:none;margin-top:14px;padding-left:24px;"
      >
        <input 
          type="text" 
          placeholder="Votre nom"
          class="reply-name"
          style="width:100%;padding:9px 10px;border:1px solid #d1d5db;border-radius:6px;margin-bottom:8px;"
        >

        <textarea 
          class="reply-text"
          placeholder="Votre réponse..."
          required
          style="width:100%;min-height:90px;padding:10px;border:1px solid #d1d5db;border-radius:6px;"
        ></textarea>

        <button 
          type="submit"
          style="margin-top:8px;background:#c8102e;color:#fff;border:none;padding:9px 14px;border-radius:6px;font-weight:700;cursor:pointer;"
        >
          Envoyer la réponse
        </button>
      </form>
    </div>
  `).join("");

  list.querySelectorAll("[data-reply]").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.reply;
      const form = list.querySelector(`[data-reply-form="${index}"]`);
      if (!form) return;

      form.style.display = form.style.display === "none" ? "block" : "none";
    });
  });

  list.querySelectorAll(".reply-form").forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const index = Number(form.dataset.replyForm);
      const comments = getComments(articleId);

      const name = form.querySelector(".reply-name").value.trim() || "Anonyme";
      const text = form.querySelector(".reply-text").value.trim();

      if (!text) return;

      comments[index].replies = comments[index].replies || [];
      comments[index].replies.unshift({
        name,
        text,
        createdAt: new Date().toISOString()
      });

      saveComments(articleId, comments);
      renderComments(articleId);
    });
  });

}

function initCommentForm(articleId) {
  const form = document.getElementById("comment-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("comment-name").value.trim() || "Anonyme";
    const email = document.getElementById("comment-email").value.trim();
    const text = document.getElementById("comment-text").value.trim();

    if (!text) return;

    const comments = getComments(articleId);
    comments.unshift({
      name,
      email,
      text,
      createdAt: new Date().toISOString()
    });
    saveComments(articleId, comments);
    form.reset();
    renderComments(articleId);
  });
}

function renderTrending(data, currentId) {
  const root = document.getElementById("article-trending-list");
  if (!root) return;

  const top = [...(data.articles || [])]
    .filter(a => String(a.id) !== String(currentId))
    .sort((a,b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, 5);

  root.innerHTML = top.map((a, i) => `
    <div class="trending-item">
      <span class="trending-num">${i + 1}</span>
      <a href="article.html?id=${encodeURIComponent(a.id)}">${esc(a.title || "Sans titre")}</a>
    </div>
  `).join("");
}

function applyLive(data) {
  const liveTitle = document.getElementById("live-title");
  if (liveTitle) liveTitle.textContent = data.liveTitle || data.live?.title || "GAYA INFO TV — Direct";

  const liveContent = document.getElementById("live-content");
  const embed = data.liveEmbed || data.live?.embedUrl || "";
  if (liveContent && embed) {
    liveContent.innerHTML = `<iframe src="${esc(embed)}" allowfullscreen></iframe>`;
  }

  const ticker = document.querySelector(".ticker-content span");
  if (ticker && data.ticker) ticker.textContent = " " + data.ticker + " ";
}

function renderArticle() {
  const data = getCMSData();
  const id = getParam("id");
  const article = (data.articles || []).find(a => String(a.id) === String(id));
  const root = document.getElementById("article-content-root");

  applyLive(data);
  renderTrending(data, id);

  if (!article) {
    root.innerHTML = `
      <div class="article-breadcrumb">
        <a href="index.html">Accueil</a><i class="fa-solid fa-chevron-right"></i>
        <a href="actualites.html">Actualités</a><i class="fa-solid fa-chevron-right"></i>
        <span>Article introuvable</span>
      </div>
      <h1 class="article-title-full">Article introuvable</h1>
      <p class="article-content-full">Retourne dans le CMS, crée un article et ouvre-le depuis la page Actualités.</p>
    `;
    return;
  }

  document.title = `${article.title || "Article"} — GAYA INFO TV`;

  const reads = Number(article.reads || 0) + 1;
  article.reads = reads;
  saveCMSData(data);

  const commentsCount = getComments(article.id).length;
  const author = article.author || "Rédaction";
  const published = gayaFormatDate(article.date || "Aujourd’hui");
  const content = article.content || article.excerpt || "";

  root.innerHTML = `
    <div class="article-breadcrumb">
      <a href="index.html">Accueil</a><span>•</span>
      <a href="actualites.html">News</a><span>•</span>
      <span>${esc(article.category || "Actualité")}</span><span>•</span>
      <span>Post</span>
    </div>

    <span class="article-category-badge">${esc(article.category || "Actualité")}</span>

    <h1 class="article-title-full">${esc(article.title || "Sans titre")}</h1>

    <div class="article-author-line">
      <strong>Auteur:</strong> ${esc(author)}
    </div>

    <div class="article-meta-full">
      <span><i class="fa-regular fa-clock"></i> ${esc(published)}</span>
      <span class="reads">${reads} Lectures</span>
      <span><i class="fa-regular fa-comment-dots"></i> ${commentsCount} Commentaires</span>    </div>

    ${mediaHTML(article.media || article.image || "")}

    <div class="article-caption">${esc(article.title || "")}</div>

    <div class="article-content-full">${formatContent(content)}</div>

    <div class="article-end-meta">
      <div><strong>Auteur:</strong> ${esc(author)}</div>
      <div><strong>Publié le:</strong> ${esc(published)}</div>
    </div>

    <section class="comments-section">
      <h2 class="comments-title" id="comments-title">COMMENTAIRES (0)</h2>

      <form class="comment-form" id="comment-form">
        <div class="grid2">
          <input id="comment-name" type="text" placeholder="Votre nom">
          <input id="comment-email" type="email" placeholder="Votre e-mail">
        </div>
        <textarea id="comment-text" placeholder="Votre commentaire..." required></textarea>
        <button type="submit">Publier le commentaire</button>
      </form>

      <div class="comments-list" id="comments-list"></div>
    </section>
  `;

  renderComments(article.id);
  initCommentForm(article.id);
}

document.addEventListener("DOMContentLoaded", renderArticle);
