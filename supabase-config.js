/* ============================================================
   GAYA INFO TV — Supabase Config & Storage Layer
   1) Remplace les valeurs ci-dessous par celles de ton projet Supabase.
   2) Exécute le fichier supabase-schema.sql dans Supabase SQL Editor.
   ============================================================ */

const GAYA_SUPABASE_URL = "https://wwxzmcylckgdnowntdzw.supabase.co";
const GAYA_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3eHptY3lsY2tnZG5vd250ZHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NzI5NTgsImV4cCI6MjA5NjI0ODk1OH0.amoJR1l2ZttBIHG4Tr5TRMovFniDGHjZp9uyHJQ7GSw";

(function () {
  const CMS_TABLE = "gaya_cms";
  const CMS_ID = "main";
  const COMMENTS_TABLE = "gaya_comments_v2";
  const VIEWS_TABLE = "gaya_views";
  const LOCAL_KEYS = ["gayaCMSData", "gayaCMS", "gayaData", "gaya_cms_v1"];

  let _client = null;
  let _ready = false;
  let _remoteData = null;
  let _pendingData = null;
  let _listeners = [];
  let _pendingCommentCountIds = new Set();
  let _pendingViewCountIds = new Set();

  function safeParse(v) {
    if (!v) return null;
    if (typeof v === "object") return v;
    try { return JSON.parse(v); } catch(e) { return null; }
  }

  function clone(v) { return safeParse(JSON.stringify(v || {})) || {}; }

  function readLocal() {
    for (const key of LOCAL_KEYS) {
      try { const parsed = safeParse(localStorage.getItem(key)); if (parsed) return parsed; } catch(e) {}
    }
    return null;
  }

  function writeLocal(data) {
    const payload = JSON.stringify(data || {});
    LOCAL_KEYS.forEach(k => { try { localStorage.setItem(k, payload); } catch(e) {} });
  }

  function emit(data) {
    _listeners.forEach(fn => { try { fn(data); } catch(e) {} });
    window.dispatchEvent(new CustomEvent("gaya-cms-updated", { detail: data }));
  }

  function applyRemote(payload) {
    const incoming = safeParse(payload);
    if (!incoming) return;
    _remoteData = incoming;
    writeLocal(incoming);
    emit(incoming);
  }

  async function fetchCMS() {
    if (!_client) return;
    const { data, error } = await _client.from(CMS_TABLE).select("content").eq("id", CMS_ID).maybeSingle();
    if (error) { console.warn("[GAYA CMS] Lecture Supabase échouée", error); return; }
    if (data && data.content) applyRemote(data.content);
  }

  async function writeCMS(data) {
    const payload = clone(data || {});
    delete payload.__forceReplace;
    payload.__cmsUpdatedAt = Date.now();
    _remoteData = payload;
    writeLocal(payload);
    emit(payload);

    if (!_ready || !_client) { _pendingData = payload; return; }
    const { error } = await _client.from(CMS_TABLE).upsert({ id: CMS_ID, content: payload, updated_at: new Date().toISOString() });
    if (error) console.error("[GAYA CMS] Écriture Supabase refusée/échouée", error);
  }

  async function initSupabase() {
    try {
      if (!GAYA_SUPABASE_URL || GAYA_SUPABASE_URL.includes("TON-PROJET") || !GAYA_SUPABASE_ANON_KEY || GAYA_SUPABASE_ANON_KEY.includes("REMPLACE")) {
        console.warn("[GAYA CMS] Supabase non configuré : remplis GAYA_SUPABASE_URL et GAYA_SUPABASE_ANON_KEY dans supabase-config.js");
        return;
      }
      if (!window.supabase || !window.supabase.createClient) {
        console.warn("[GAYA CMS] SDK Supabase non disponible");
        return;
      }
      _client = window.supabase.createClient(GAYA_SUPABASE_URL, GAYA_SUPABASE_ANON_KEY);
      window.gayaSupabase = _client;
      _ready = true;
      await fetchCMS();

      _client.channel("gaya_cms_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: CMS_TABLE, filter: `id=eq.${CMS_ID}` }, payload => {
          if (payload.new && payload.new.content) applyRemote(payload.new.content);
        })
        .subscribe();

      if (_pendingData) { const p = _pendingData; _pendingData = null; await writeCMS(p); }
      if (_pendingCommentCountIds.size) {
        const ids = Array.from(_pendingCommentCountIds);
        _pendingCommentCountIds.clear();
        window.gayaRefreshCommentCounts(ids);
      }
      if (_pendingViewCountIds.size) {
        const ids = Array.from(_pendingViewCountIds);
        _pendingViewCountIds.clear();
        window.gayaRefreshViewCounts(ids);
      }
      console.log("[GAYA CMS] Supabase connecté ✅");
    } catch(e) {
      console.warn("[GAYA CMS] Init Supabase échouée, fallback localStorage", e);
    }
  }

  window.gayaCMSRead = function () { return clone(_remoteData || readLocal() || {}); };
  window.gayaCMSWrite = function (data) { writeCMS(data); };
  window.gayaCMSOnUpdate = function (callback) { if (typeof callback === "function") _listeners.push(callback); if (_remoteData) callback(_remoteData); };

  window.gayaCMSLogin = async function (email, password) {
    if (!_client) await initSupabase();
    if (!_client) return { ok: false, message: "Supabase n'est pas encore configuré." };
    const { data, error } = await _client.auth.signInWithPassword({ email: String(email || "").trim(), password: String(password || "") });
    if (error) return { ok: false, message: "Identifiant ou mot de passe incorrect." };
    const user = data.user || {};
    const name = user.user_metadata?.full_name || user.email || "Administrateur";
    return { ok: true, user, displayName: name, role: "Administrateur" };
  };

  window.gayaCMSLogout = async function () { try { if (_client) await _client.auth.signOut(); } catch(e) {} };

  window.gayaCommentCounts = window.gayaCommentCounts || {};
  window.gayaViewCounts = window.gayaViewCounts || {};

  window.gayaGetCommentCount = function (articleId) {
    return Number(window.gayaCommentCounts[String(articleId)] || 0);
  };

  window.gayaGetViewCount = function (articleId) {
    return Number(window.gayaViewCounts[String(articleId)] || 0);
  };

  function normalizeIds(articleIds) {
    return [...new Set((articleIds || []).filter(Boolean).map(String))];
  }

  window.gayaRefreshCommentCounts = async function (articleIds) {
    const ids = normalizeIds(articleIds);
    if (!ids.length) return;
    if (!_client) {
      ids.forEach(id => _pendingCommentCountIds.add(id));
      return;
    }

    const { data, error } = await _client
      .from(COMMENTS_TABLE)
      .select("article_id,parent_id")
      .in("article_id", ids);

    if (error) {
      console.warn("[GAYA CMS] Comptage commentaires échoué", error);
      return;
    }

    const counts = {};
    ids.forEach(id => counts[id] = 0);
    (data || []).forEach(row => {
      const id = String(row.article_id || "");
      if (id && !row.parent_id) counts[id] = (counts[id] || 0) + 1;
    });
    Object.assign(window.gayaCommentCounts, counts);

    document.querySelectorAll("[data-comment-count-id]").forEach(el => {
      const id = el.getAttribute("data-comment-count-id");
      el.textContent = String(window.gayaGetCommentCount(id));
    });
  };

  window.gayaRefreshViewCounts = async function (articleIds) {
    const ids = normalizeIds(articleIds);
    if (!ids.length) return;
    if (!_client) {
      ids.forEach(id => _pendingViewCountIds.add(id));
      return;
    }

    const { data, error } = await _client
      .from(VIEWS_TABLE)
      .select("article_id,views")
      .in("article_id", ids);

    if (error) {
      console.warn("[GAYA CMS] Comptage vues échoué", error);
      return;
    }

    const counts = {};
    ids.forEach(id => counts[id] = 0);
    (data || []).forEach(row => {
      const id = String(row.article_id || "");
      if (id) counts[id] = Number(row.views || 0);
    });
    Object.assign(window.gayaViewCounts, counts);

    document.querySelectorAll("[data-view-count-id]").forEach(el => {
      const id = el.getAttribute("data-view-count-id");
      el.textContent = String(window.gayaGetViewCount(id));
    });
  };

  window.gayaCMSReadComments = async function (articleId, callback) {
    if (typeof callback === "function") callback([]);
    if (!_client) return;
    const { data, error } = await _client
      .from(COMMENTS_TABLE)
      .select("*")
      .eq("article_id", String(articleId))
      .order("created_at", { ascending: true });
    if (!error && Array.isArray(data) && typeof callback === "function") callback(data);
    if (error) console.warn("[GAYA CMS] Lecture commentaires échouée", error);
  };

  window.gayaCMSWriteComments = async function (articleId, comments) {
    console.warn("[GAYA CMS] gayaCMSWriteComments est conservé pour compatibilité. Les nouveaux commentaires doivent utiliser article.js/postComment.");
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initSupabase);
  else initSupabase();
})();
