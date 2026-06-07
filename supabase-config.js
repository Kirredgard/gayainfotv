/* ============================================================
   GAYA INFO TV — Supabase Config & Storage Layer
   Stratégie : stale-while-revalidate
   → affichage immédiat depuis localStorage (cache)
   → mise à jour silencieuse depuis Supabase en arrière-plan
   ============================================================ */

const GAYA_SUPABASE_URL = "https://wwxzmcylckgdnowntdzw.supabase.co";
const GAYA_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3eHptY3lsY2tnZG5vd250ZHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NzI5NTgsImV4cCI6MjA5NjI0ODk1OH0.amoJR1l2ZttBIHG4Tr5TRMovFniDGHjZp9uyHJQ7GSw";

(function () {
  const CMS_TABLE = "gaya_cms";
  const CMS_ID = "main";
  const COMMENTS_TABLE = "gaya_comments_v2";
  const VIEWS_TABLE = "gaya_views";
  const LOCAL_KEYS = ["gayaCMSData", "gayaCMS", "gayaData", "gaya_cms_v1"];
  const CACHE_KEY = "gayaCMSData"; // clé principale pour le cache stale
  const CACHE_TS_KEY = "__gayaCacheTS"; // timestamp du dernier fetch Supabase réussi
  const MAX_CACHE_AGE_MS = 5 * 60 * 1000; // 5 minutes : au-delà, on attend Supabase avant d'afficher

  let _client = null;
  let _ready = false;
  let _remoteData = null;
  let _pendingData = null;
  let _listeners = [];
  let _readyResolve = null;
  window.__gayaCMSRemoteLoaded = false;
  window.gayaCMSReadyPromise = new Promise(resolve => { _readyResolve = resolve; });

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
    try { localStorage.setItem(CACHE_TS_KEY, String(Date.now())); } catch(e) {}
  }

  function cacheAge() {
    try { return Date.now() - parseInt(localStorage.getItem(CACHE_TS_KEY) || "0", 10); } catch(e) { return Infinity; }
  }

  function emit(data) {
    _listeners.forEach(fn => { try { fn(data); } catch(e) {} });
    window.dispatchEvent(new CustomEvent("gaya-cms-updated", { detail: data }));
  }

  function resolveReady(data) {
    if (_readyResolve) { _readyResolve(data); _readyResolve = null; }
  }

  function applyRemote(payload) {
    const incoming = safeParse(payload);
    if (!incoming) return;
    _remoteData = incoming;
    writeLocal(incoming);
    emit(incoming);
    resolveReady(incoming);
  }

  async function fetchCMS() {
    if (!_client) return;
    const { data, error } = await _client.from(CMS_TABLE).select("content").eq("id", CMS_ID).maybeSingle();
    window.__gayaCMSRemoteLoaded = true;
    if (error) { console.warn("[GAYA CMS] Lecture Supabase échouée", error); resolveReady(_remoteData || {}); return; }
    if (data && data.content) applyRemote(data.content);
    else resolveReady(_remoteData || {});
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
    if (error) { console.error("[GAYA CMS] Écriture Supabase refusée/échouée", error); throw error; }
  }

  async function initSupabase() {
    // ── Stale-while-revalidate ────────────────────────────────────────────────
    // 1. Affiche immédiatement le cache localStorage si disponible et récent
    const stale = readLocal();
    const age = cacheAge();
    if (stale && age < MAX_CACHE_AGE_MS) {
      _remoteData = stale;
      emit(stale);
      resolveReady(stale); // débloque les pages immédiatement
      console.log("[GAYA CMS] Affiché depuis cache (" + Math.round(age/1000) + "s) — Supabase en arrière-plan");
    }
    // ─────────────────────────────────────────────────────────────────────────

    try {
      if (!GAYA_SUPABASE_URL || GAYA_SUPABASE_URL.includes("TON-PROJET") || !GAYA_SUPABASE_ANON_KEY || GAYA_SUPABASE_ANON_KEY.includes("REMPLACE")) {
        console.warn("[GAYA CMS] Supabase non configuré");
        if (!stale) resolveReady({});
        return;
      }
      if (!window.supabase || !window.supabase.createClient) {
        console.warn("[GAYA CMS] SDK Supabase non disponible");
        if (!stale) resolveReady({});
        return;
      }
      _client = window.supabase.createClient(GAYA_SUPABASE_URL, GAYA_SUPABASE_ANON_KEY);
      window.gayaSupabase = _client;
      _ready = true;

      // 2. Fetch Supabase en arrière-plan (ou bloquant si cache absent/périmé)
      await fetchCMS();

      _client.channel("gaya_cms_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: CMS_TABLE, filter: `id=eq.${CMS_ID}` }, payload => {
          if (payload.new && payload.new.content) applyRemote(payload.new.content);
        })
        .subscribe();

      if (_pendingData) { const p = _pendingData; _pendingData = null; await writeCMS(p); }
      window.dispatchEvent(new CustomEvent("gaya-supabase-ready"));
      resolveReady(_remoteData || {});
      console.log("[GAYA CMS] Supabase connecté ✅");
    } catch(e) {
      window.__gayaCMSRemoteLoaded = true;
      if (!stale) resolveReady({});
      console.warn("[GAYA CMS] Init Supabase échouée", e);
    }
  }

  window.gayaCMSRead = function () { return clone(_remoteData || {}); };
  window.gayaCMSWrite = function (data) { return writeCMS(data); };
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

  window.gayaGetCommentCount = function (articleId) { return Number(window.gayaCommentCounts[String(articleId)] || 0); };

  window.gayaGetViewCount = function (articleId, fallback) {
    const id = String(articleId || "");
    if (Object.prototype.hasOwnProperty.call(window.gayaViewCounts, id)) return Number(window.gayaViewCounts[id] || 0);
    return Number(fallback || 0);
  };

  window.gayaRefreshCommentCounts = async function (articleIds) {
    if (!_client || !Array.isArray(articleIds) || !articleIds.length) return;
    const ids = [...new Set(articleIds.filter(Boolean).map(String))];
    if (!ids.length) return;
    const { data, error } = await _client.from(COMMENTS_TABLE).select("article_id").in("article_id", ids);
    if (error) { console.warn("[GAYA CMS] Comptage commentaires échoué", error); return; }
    const counts = {};
    ids.forEach(id => counts[id] = 0);
    (data || []).forEach(row => { const id = String(row.article_id || ""); if (id) counts[id] = (counts[id] || 0) + 1; });
    Object.assign(window.gayaCommentCounts, counts);
    document.querySelectorAll("[data-comment-count-id]").forEach(el => {
      el.textContent = String(window.gayaGetCommentCount(el.getAttribute("data-comment-count-id")));
    });
  };

  window.gayaRefreshViewCounts = async function (articleIds) {
    if (!_client || !Array.isArray(articleIds) || !articleIds.length) return;
    const ids = [...new Set(articleIds.filter(Boolean).map(String))];
    if (!ids.length) return;
    const { data, error } = await _client.from(VIEWS_TABLE).select("article_id, views").in("article_id", ids);
    if (error) { console.warn("[GAYA CMS] Comptage vues échoué", error); return; }
    const counts = {};
    ids.forEach(id => counts[id] = 0);
    (data || []).forEach(row => { const id = String(row.article_id || ""); if (id) counts[id] = Number(row.views || 0); });
    Object.assign(window.gayaViewCounts, counts);
    document.querySelectorAll("[data-view-count-id]").forEach(el => {
      el.textContent = String(window.gayaGetViewCount(el.getAttribute("data-view-count-id"), 0));
    });
  };

  window.gayaCMSReadComments = async function (articleId, callback) {
    if (typeof callback === "function") callback([]);
    if (!_client) return;
    const { data, error } = await _client.from(COMMENTS_TABLE).select("*").eq("article_id", String(articleId)).order("created_at", { ascending: true });
    if (!error && Array.isArray(data) && typeof callback === "function") callback(data);
    if (error) console.warn("[GAYA CMS] Lecture commentaires échouée", error);
  };

  window.gayaCMSWriteComments = async function () {
    console.warn("[GAYA CMS] gayaCMSWriteComments est conservé pour compatibilité.");
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initSupabase);
  else initSupabase();
})();
