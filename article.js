/* Article dynamique + commentaires v2 — Supabase */
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
        day: "2-digit", month: "short", year: "numeric"
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

function timeAgo(dateISO) {
  const diff = Math.max(1, Math.floor((Date.now() - new Date(dateISO).getTime()) / 60000));
  if (diff < 60) return `il y a ${diff} minute${diff > 1 ? "s" : ""}`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `il y a ${h} heure${h > 1 ? "s" : ""}`;
  const d = Math.floor(h / 24);
  return `il y a ${d} jour${d > 1 ? "s" : ""}`;
}

/* ============================================================
   VUES — table gaya_views
   ============================================================ */
async function incrementAndDisplayViews(articleId) {
  const el = document.getElementById("article-views-count");
  let currentViews = 0;
  try {
    if (window.gayaSupabase) {
      const { data } = await gayaSupabase
        .from("gaya_views")
        .select("views")
        .eq("article_id", String(articleId))
        .maybeSingle();
      if (data) currentViews = Number(data.views || 0);
    }
  } catch(e) {}

  const newViews = currentViews + 1;
  if (el) el.textContent = `${newViews} Lectures`;

  try {
    if (window.gayaSupabase) {
      await gayaSupabase.from("gaya_views").upsert({
        article_id: String(articleId),
        views: newViews,
        updated_at: new Date().toISOString()
      });
    }
  } catch(e) {
    console.warn("[GAYA] Vues non enregistrées", e);
  }
}

/* ============================================================
   COMMENTAIRES — table gaya_comments_v2 (une ligne par commentaire)
   ============================================================ */
async function loadComments(articleId) {
  if (!window.gayaSupabase) return [];
  try {
    const { data, error } = await gayaSupabase
      .from("gaya_comments_v2")
      .select("*")
      .eq("article_id", String(articleId))
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  } catch(e) {
    console.warn("[GAYA] Chargement commentaires échoué", e);
    return [];
  }
}

async function postComment(articleId, name, email, text, parentId = null) {
  if (!window.gayaSupabase) return null;
  const { data, error } = await gayaSupabase
    .from("gaya_comments_v2")
    .insert({
      article_id: String(articleId),
      name: name || "Anonyme",
      email: email || null,
      text: text,
      parent_id: parentId || null
    })
    .select()
    .single();
  if (error) {
    console.warn("[GAYA] Commentaire non enregistré", error);
    return null;
  }
  return data;
}

function buildCommentHTML(comment, replies) {
  const replyList = replies.length ? `
    <div style="margin-top:18px;padding-left:24px;border-left:3px solid #e5e7eb;display:flex;flex-direction:column;gap:14px;">
      ${replies.map(r => `
        <div style="background:#fff;padding:12px;border-radius:6px;">
          <div style="font-weight:900;color:#03082f;font-size:13px;margin-bottom:4px;">${esc(r.name || "Anonyme")}</div>
          <div style="color:#7b8198;font-size:12px;margin-bottom:8px;">${timeAgo(r.created_at)}</div>
          <div style="font-size:15px;line-height:1.6;color:#03082f;">${esc(r.text)}</div>
        </div>
      `).join("")}
    </div>
  ` : "";

  return `
    <div class="comment-item" data-comment-id="${esc(comment.id)}">
      <div class="comment-head">
        <div class="comment-avatar">${esc((comment.name || "A").charAt(0).toUpperCase())}</div>
        <div>
          <div class="comment-name">${esc(comment.name || "Anonyme")}</div>
          <div class="comment-time">${timeAgo(comment.created_at)}</div>
        </div>
      </div>
      <div class="comment-text">${esc(comment.text)}</div>
      <div style="margin-top:12px;">
        <button type="button" class="reply-btn" data-parent-id="${esc(comment.id)}"
          style="background:#111827;color:#fff;border:none;padding:7px 12px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">
          Répondre
        </button>
      </div>
      ${replyList}
      <div class="reply-form" data-reply-form="${esc(comment.id)}" style="display:none;margin-top:14px;padding-left:24px;">
        <input type="text" class="reply-name" placeholder="Votre nom"
          style="width:100%;padding:9px 10px;border:1px solid #d1d5db;border-radius:6px;margin-bottom:8px;">
        <textarea class="reply-text" placeholder="Votre réponse..." required
          style="width:100%;min-height:90px;padding:10px;border:1px solid #d1d5db;border-radius:6px;"></textarea>
        <button type="button" class="reply-submit" data-parent-id="${esc(comment.id)}"
          style="margin-top:8px;background:#c8102e;color:#fff;border:none;padding:9px 14px;border-radius:6px;font-weight:700;cursor:pointer;">
          Envoyer la réponse
        </button>
      </div>
    </div>
  `;
}

async function renderComments(articleId) {
  const list = document.getElementById("comments-list");
  const title = document.getElementById("comments-title");
  if (!list || !title) return;

  list.innerHTML = `<div class="comment-item"><div class="comment-text" style="color:#999;">Chargement des commentaires…</div></div>`;

  const all = await loadComments(articleId);

  // Séparer parents et réponses
  const parents = all.filter(c => !c.parent_id);
  const repliesMap = {};
  all.filter(c => c.parent_id).forEach(r => {
    if (!repliesMap[r.parent_id]) repliesMap[r.parent_id] = [];
    repliesMap[r.parent_id].push(r);
  });

  title.textContent = `COMMENTAIRES (${parents.length})`;
  const metaCount = document.getElementById("article-comments-count");
  if (metaCount) metaCount.textContent = String(parents.length);

  if (!parents.length) {
    list.innerHTML = `<div class="comment-item"><div class="comment-text">Aucun commentaire pour le moment.</div></div>`;
    return;
  }

  list.innerHTML = parents.map(c => buildCommentHTML(c, repliesMap[c.id] || [])).join("");

  // Boutons "Répondre"
  list.querySelectorAll(".reply-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const form = list.querySelector(`[data-reply-form="${btn.dataset.parentId}"]`);
      if (!form) return;
      form.style.display = form.style.display === "none" ? "block" : "none";
    });
  });

  // Soumission des réponses
  list.querySelectorAll(".reply-submit").forEach(btn => {
    btn.addEventListener("click", async () => {
      const parentId = btn.dataset.parentId;
      const form = list.querySelector(`[data-reply-form="${parentId}"]`);
      const name = form.querySelector(".reply-name").value.trim() || "Anonyme";
      const text = form.querySelector(".reply-text").value.trim();
      if (!text) return;

      btn.disabled = true;
      btn.textContent = "Envoi…";
      const result = await postComment(articleId, name, "", text, parentId);
      if (result) {
        form.style.display = "none";
        form.querySelector(".reply-name").value = "";
        form.querySelector(".reply-text").value = "";
        await renderComments(articleId);
      } else {
        btn.disabled = false;
        btn.textContent = "Envoyer la réponse";
        alert("Erreur lors de l'envoi. Réessaie.");
      }
    });
  });
}

function initCommentForm(articleId) {
  const form = document.getElementById("comment-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("comment-name").value.trim() || "Anonyme";
    const email = document.getElementById("comment-email").value.trim();
    const text = document.getElementById("comment-text").value.trim();
    if (!text) return;

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Envoi…";

    const result = await postComment(articleId, name, email, text, null);
    if (result) {
      form.reset();
      await renderComments(articleId);
    } else {
      alert("Erreur lors de l'envoi. Réessaie.");
    }
    btn.disabled = false;
    btn.textContent = "Publier le commentaire";
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
      <a href="/article/?id=${encodeURIComponent(a.id)}">${esc(a.title || "Sans titre")}</a>
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
  window.__gayaArticleLastRender = Date.now();
  const data = getCMSData();
  const id = getParam("id");
  const article = (data.articles || []).find(a => String(a.id) === String(id));
  const root = document.getElementById("article-content-root");

  applyLive(data);
  renderTrending(data, id);

  if (!article) {
    root.innerHTML = `
      <div class="article-breadcrumb">
        <a href="/">Accueil</a><i class="fa-solid fa-chevron-right"></i>
        <a href="/actualites/">Actualités</a><i class="fa-solid fa-chevron-right"></i>
        <span>Article introuvable</span>
      </div>
      <h1 class="article-title-full">Article introuvable</h1>
      <p class="article-content-full">L’article demandé n’a pas encore été trouvé dans les données CMS chargées sur cette page. Réessaie depuis la page Actualités ou vide le cache si l’article vient d’être publié.</p>
    `;
    return;
  }

  document.title = `${article.title || "Article"} — GAYA INFO TV`;
  const author = article.author || "Rédaction";
  const published = gayaFormatDate(article.date || "Aujourd'hui");
  const content = article.content || article.excerpt || "";

  root.innerHTML = `
    <div class="article-breadcrumb">
      <a href="/">Accueil</a><span>•</span>
      <a href="/actualites/">News</a><span>•</span>
      <span>${esc(article.category || "Actualité")}</span><span>•</span>
      <span>Post</span>
    </div>

    <span class="article-category-badge">${esc(article.category || "Actualité")}</span>
    <h1 class="article-title-full">${esc(article.title || "Sans titre")}</h1>
    <div class="article-author-line"><strong>Auteur:</strong> ${esc(author)}</div>

    <div class="article-meta-full">
      <span><i class="fa-regular fa-clock"></i> ${esc(published)}</span>
      <span class="reads" id="article-views-count">… Lectures</span>
      <span><i class="fa-regular fa-comment-dots"></i> <span id="article-comments-count">…</span> Commentaires</span>
    </div>

    ${mediaHTML(article.media || article.image || "")}
    <div class="article-caption">${esc(article.title || "")}</div>
    <div class="article-content-full">${formatContent(content)}</div>

    <div class="article-end-meta">
      <div><strong>Auteur:</strong> ${esc(author)}</div>
      <div><strong>Publié le:</strong> ${esc(published)}</div>
    </div>

    <section class="comments-section">
      <h2 class="comments-title" id="comments-title">COMMENTAIRES</h2>
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

  // Vues
  if (window.gayaSupabase) {
    incrementAndDisplayViews(article.id);
  } else {
    window.addEventListener("gaya-cms-updated", () => {
      if (window.gayaSupabase) incrementAndDisplayViews(article.id);
    }, { once: true });
    setTimeout(() => {
      const el = document.getElementById("article-views-count");
      if (el && el.textContent === "… Lectures") el.textContent = `${Number(article.reads || 0)} Lectures`;
    }, 3000);
  }

  // Commentaires
  renderComments(article.id);
  initCommentForm(article.id);

  // Realtime — mise à jour automatique quand un nouveau commentaire est posté
  if (window.gayaSupabase) {
    gayaSupabase
      .channel("comments_" + article.id)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "gaya_comments_v2",
        filter: `article_id=eq.${article.id}`
      }, () => {
        renderComments(article.id);
      })
      .subscribe();
  } else {
    window.addEventListener("gaya-cms-updated", () => {
      if (window.gayaSupabase) {
        gayaSupabase
          .channel("comments_" + article.id)
          .on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "gaya_comments_v2",
            filter: `article_id=eq.${article.id}`
          }, () => {
            renderComments(article.id);
          })
          .subscribe();
      }
    }, { once: true });
  }
}


(function(){
  let lastId = null;
  function rerenderArticleFromCMS(){
    const id = getParam("id");
    if (!id) return;
    lastId = id;
    try { renderArticle(); } catch(e) { console.warn("[GAYA] Rechargement article échoué", e); }
  }
  document.addEventListener("DOMContentLoaded", function(){
    rerenderArticleFromCMS();
    if (window.gayaCMSReadyPromise) window.gayaCMSReadyPromise.then(rerenderArticleFromCMS);
  });
  window.addEventListener("gaya-cms-updated", rerenderArticleFromCMS);
  window.addEventListener("storage", rerenderArticleFromCMS);
  window.addEventListener("pageshow", rerenderArticleFromCMS);
  if (window.gayaCMSOnUpdate) window.gayaCMSOnUpdate(rerenderArticleFromCMS);
})();
