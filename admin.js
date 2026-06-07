const STORAGE_KEYS = ["gayaCMSData", "gayaCMS", "gayaData", "gaya_cms_v1"];
let activeRubrique = "all";
let gayaCMSDirty = false;

const defaultData = {
  ticker: "",
  liveTitle: "",
  liveEmbed: "",
  live: { title: "", embedUrl: "" },
  slides: [],
  articles: [],
  featuredArticleId: "",
  actualitesFeaturedArticleId: "",
  emissions: {
    societe: { episodes: [], programmes: [], featuredEpisodeId: "" },
    economie: { episodes: [], programmes: [], featuredEpisodeId: "" },
    religion: { episodes: [], programmes: [], featuredEpisodeId: "" },
    sport: { episodes: [], programmes: [], featuredEpisodeId: "" },
    faitsdivers: { episodes: [], programmes: [], featuredEpisodeId: "" }
  },
  multimedia: { videos: [], podcasts: [], photos: [] },
  editors: [],
  blogs: []
};

let data = loadData();

const els = {
  ticker: document.getElementById("ticker"),
  liveTitle: document.getElementById("liveTitle"),
  liveEmbed: document.getElementById("liveEmbed"),
  slidesList: document.getElementById("slidesList"),
  articlesList: document.getElementById("articlesList"),
  slideTemplate: document.getElementById("slideTemplate"),
  articleTemplate: document.getElementById("articleTemplate"),
  addSlideBtn: document.getElementById("addSlideBtn"),
  addArticleBtn: document.getElementById("addArticleBtn"),
  saveBtn: document.getElementById("saveBtn"),
  resetBtn: document.getElementById("resetBtn"),
  exportBtn: document.getElementById("exportBtn"),
  status: document.getElementById("status"),
  featuredArticle: document.getElementById("featuredArticle"),
  homeArticleSingle: document.getElementById("homeArticleSingle"),
  addOneArticleToSliderBtn: document.getElementById("addOneArticleToSliderBtn"),
  selectedSliderArticles: document.getElementById("selectedSliderArticles")
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadData() {
  try {
    if (window.gayaCMSRead) {
      const remoteOrCache = window.gayaCMSRead();
      if (remoteOrCache && Object.keys(remoteOrCache).length) return normalizeData(remoteOrCache);
    }
  } catch(e) {}
  for (const key of STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return normalizeData(JSON.parse(raw));
    } catch (e) {}
  }
  return normalizeData(defaultData);
}

function normalizeData(input) {
  const out = { ...defaultData, ...(input || {}) };
  out.slides = Array.isArray(out.slides) ? out.slides : [];
  out.articles = Array.isArray(out.articles) ? out.articles : [];
  out.editors = Array.isArray(out.editors) ? out.editors : [];
  out.liveTitle = out.liveTitle || out.live?.title || defaultData.liveTitle;
  out.liveEmbed = out.liveEmbed || out.live?.embedUrl || "";
  out.featuredArticleId = out.featuredArticleId || out.actualitesFeaturedArticleId || "";
  out.articles = out.articles.map(a => ({ ...a, id: a.id || uid(), createdAt: a.createdAt || new Date().toISOString() }));
  out.blogs = Array.isArray(out.blogs) ? out.blogs.map(b => ({ ...b, id: b.id || uid(), createdAt: b.createdAt || new Date().toISOString() })) : [];
  return out;
}

function setStatus(msg) {
  if (els.status) {
    els.status.textContent = msg;
    els.status.style.display = "inline-flex";
  }
  showSaveToast(msg || "Enregistré ✅");
}

function showSaveToast(msg) {
  let toast = document.getElementById("cmsSaveToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cmsSaveToast";
    toast.className = "cms-save-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg || "Enregistré ✅";
  toast.classList.add("show");
  clearTimeout(showSaveToast._timer);
  showSaveToast._timer = setTimeout(() => toast.classList.remove("show"), 2600);
}
window.showSaveToast = showSaveToast;

function confirmCMSDelete(message, onConfirm) {
  let overlay = document.getElementById("cmsDeleteModal");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "cmsDeleteModal";
    overlay.className = "cms-delete-modal";
    overlay.innerHTML = `
      <div class="cms-delete-card" role="dialog" aria-modal="true">
        <div class="cms-delete-icon">!</div>
        <h3>Confirmer la suppression</h3>
        <p id="cmsDeleteMessage">Cette action est définitive.</p>
        <div class="cms-delete-actions">
          <button type="button" class="cms-delete-cancel">Annuler</button>
          <button type="button" class="cms-delete-confirm">Supprimer</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }
  overlay.querySelector("#cmsDeleteMessage").textContent = message || "Supprimer cet élément ?";
  overlay.classList.add("open");
  const cancel = overlay.querySelector(".cms-delete-cancel");
  const confirm = overlay.querySelector(".cms-delete-confirm");
  const close = () => overlay.classList.remove("open");
  cancel.onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };
  confirm.onclick = () => {
    close();
    if (typeof onConfirm === "function") onConfirm();
  };
}
window.confirmCMSDelete = confirmCMSDelete;


function markDirty() {
  gayaCMSDirty = true;
  setStatus("Modifications non enregistrées");
}

function collectGeneral() {
  data.ticker = els.ticker?.value.trim() || "";
  data.liveTitle = els.liveTitle?.value.trim() || "";
  data.liveEmbed = els.liveEmbed?.value.trim() || "";
  data.live = { title: data.liveTitle, embedUrl: data.liveEmbed };
  if (els.featuredArticle) {
    data.featuredArticleId = els.featuredArticle.value;
    data.actualitesFeaturedArticleId = els.featuredArticle.value;
  }
}

function collectSlidesFromDOM() {
  if (!els.slidesList) return;
  data.slides = [...els.slidesList.querySelectorAll(".slide-card")].map(card => {
    const obj = {};
    card.querySelectorAll("[data-field]").forEach(input => {
      obj[input.dataset.field] = input.value.trim();
    });
    if (obj.articleId) obj.link = `article.html?id=${obj.articleId}`;
    if (!obj.link) obj.link = "#";
    return obj;
  });
}

function collectArticlesFromDOM() {
  if (!els.articlesList) return;
  if (window.__skipArticleCollectOnce) {
    window.__skipArticleCollectOnce = false;
    return;
  }
  const cards = [...els.articlesList.querySelectorAll(".article-card-admin")];
  const rendered = cards.map(card => {
    const obj = {};
    card.querySelectorAll("[data-field]").forEach(input => {
      obj[input.dataset.field] = input.value.trim();
    });
    if (!obj.id) obj.id = uid();
    const old = data.articles.find(a => String(a.id) === String(obj.id));
    obj.createdAt = old?.createdAt || obj.createdAt || new Date().toISOString();
    return obj;
  });
  if (!cards.length) {
    // Quand la rubrique affichée est vide, elle doit rester vide dans Firebase aussi.
    if (activeRubrique === "all") data.articles = [];
    else data.articles = data.articles.filter(a => a.category !== activeRubrique);
    return;
  }
  const renderedIds = new Set(rendered.map(a => String(a.id)));
  data.articles = data.articles.filter(a => !renderedIds.has(String(a.id))).concat(rendered);
}

function saveData(msg = "Tout est enregistré ✅") {
  collectGeneral();
  collectSlidesFromDOM();
  collectArticlesFromDOM();
  if (!window.__skipBlogCollectOnce) {
    try { collectBlogsFromDOM(); } catch(e) { console.warn("Collect blogs échoué", e); }
  } else { window.__skipBlogCollectOnce = false; }
  if (window.__skipEmissionCollectOnce) window.__skipEmissionCollectOnce = false;
  else if (typeof window.collectCurrentEmissionCMS === "function") {
    try { window.collectCurrentEmissionCMS(); } catch(e) { console.warn("Collect émissions échoué", e); }
  }
  if (window.__skipSocieteCollectOnce) window.__skipSocieteCollectOnce = false;
  else if (typeof window.collectCurrentSocieteCMS === "function") {
    try { window.collectCurrentSocieteCMS(); } catch(e) { console.warn("Collect société échoué", e); }
  }

  const newest = getArticlesNewestFirst()[0];
  if (!data.featuredArticleId && newest) {
    data.actualitesFeaturedArticleId = newest.id;
  }

  data.__cmsUpdatedAt = Date.now();
  data.__forceReplace = true;
  try {
    window.gayaCMSWrite ? gayaCMSWrite(data) : (()=>{
      const payload = JSON.stringify(data);
      STORAGE_KEYS.forEach(key => localStorage.setItem(key, payload));
      window.dispatchEvent(new Event("gaya-cms-updated"));
    })();
    gayaCMSDirty = false;
    setStatus(msg);
  } catch (e) {
    console.error("Sauvegarde échouée", e);
    setStatus("Erreur : sauvegarde non effectuée ❌");
    return;
  }
  refreshFeaturedArticleSelect();
  window.refreshHomeArticlesMulti();
}

window.saveAllCMS = saveData;
window.saveData = saveData;

function getArticlesNewestFirst() {
  return [...data.articles].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

function getFilteredArticles() {
  const sorted = getArticlesNewestFirst();
  return activeRubrique === "all" ? sorted : sorted.filter(a => a.category === activeRubrique);
}

function refreshFeaturedArticleSelect() {
  if (!els.featuredArticle) return;
  const current = data.featuredArticleId || "";
  els.featuredArticle.innerHTML = '<option value="">Automatique : dernier article ajouté</option>';
  getArticlesNewestFirst().forEach((a, i) => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.title || `Actualité ${i + 1}`;
    if (String(current) === String(a.id)) opt.selected = true;
    els.featuredArticle.appendChild(opt);
  });
}

function fillArticleSelect(select, selected) {
  select.innerHTML = '<option value="">Aucun article lié</option>';
  getArticlesNewestFirst().forEach((a, i) => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.title || `Article ${i + 1}`;
    if (String(selected) === String(a.id)) opt.selected = true;
    select.appendChild(opt);
  });
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function updatePreview(card, src) {
  const p = card.querySelector(".media-preview");
  if (!p) return;
  if (!src) {
    p.innerHTML = "";
    return;
  }
  if (String(src).startsWith("data:video") || /\.(mp4|webm|ogg)$/i.test(src)) {
    p.innerHTML = `<video src="${src}" controls></video><span>Vidéo sélectionnée</span>`;
  } else {
    p.innerHTML = `<img src="${src}" alt=""><span>Image sélectionnée</span>`;
  }
}

function renderSlides() {
  if (!els.slidesList || !els.slideTemplate) return;
  els.slidesList.innerHTML = "";
  data.slides.forEach((slide, index) => {
    const node = els.slideTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector("strong").textContent = slide.title || `Slide accueil ${index + 1}`;

    node.querySelectorAll("[data-field]").forEach(input => {
      const field = input.dataset.field;
      if (field === "articleId") fillArticleSelect(input, slide.articleId || "");
      else input.value = slide[field] || "";

      input.addEventListener("input", () => {
        slide[field] = input.value;
        if (field === "title") node.querySelector("strong").textContent = input.value || `Slide accueil ${index + 1}`;
        if (field === "articleId" && input.value) {
          slide.link = `article.html?id=${input.value}`;
          const linkInput = node.querySelector('[data-field="link"]');
          if (linkInput) linkInput.value = slide.link;
        }
        if (field === "image") updatePreview(node, input.value);
        markDirty();
      });

      input.addEventListener("change", () => {
        slide[field] = input.value;
        if (field === "articleId" && input.value) {
          slide.link = `article.html?id=${input.value}`;
          const linkInput = node.querySelector('[data-field="link"]');
          if (linkInput) linkInput.value = slide.link;
        }
        markDirty();
      });
    });

    const toggle = node.querySelector(".toggle-slide");
    if (toggle) {
      toggle.onclick = () => {
        node.classList.toggle("collapsed");
        toggle.textContent = node.classList.contains("collapsed") ? "Modifier" : "Réduire";
      };
    }

    const view = node.querySelector(".view-slide");
    if (view) {
      view.onclick = () => {
        collectSlidesFromDOM();
        saveData("Slide enregistré ✅");
        window.open("index.html", "_blank");
      };
    }

    const save = node.querySelector(".save-slide");
    if (save) {
      save.onclick = () => {
        collectSlidesFromDOM();
        saveData("Slide enregistré ✅");
        node.classList.add("collapsed");
        if (toggle) toggle.textContent = "Modifier";
      };
    }

    const remove = node.querySelector(".remove");
    if (remove) {
      remove.onclick = () => confirmCMSDelete("Supprimer ce slide ?", () => {
        data.slides.splice(index, 1);
        saveData("Slide supprimé ✅");
        renderSlides();
      });
    }

    const upload = node.querySelector(".media-upload");
    if (upload) {
      upload.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await fileToDataURL(file);
        slide.image = url;
        const imgInput = node.querySelector('[data-field="image"]');
        if (imgInput) imgInput.value = url;
        updatePreview(node, url);
        markDirty();
      };
    }

    updatePreview(node, slide.image);
    node.classList.add("collapsed");
    if (toggle) toggle.textContent = "Modifier";
    els.slidesList.appendChild(node);
  });
}

function renderArticles() {
  if (!els.articlesList || !els.articleTemplate) return;
  els.articlesList.innerHTML = "";
  const articles = getFilteredArticles();

  if (!articles.length) {
    els.articlesList.innerHTML = '<div class="editor-card">Aucune actualité dans cette rubrique.</div>';
    return;
  }

  articles.forEach((article, visibleIndex) => {
    if (!article.id) article.id = uid();
    const node = els.articleTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector("strong").textContent = article.title || `Actualité ${visibleIndex + 1}`;

    node.querySelectorAll("[data-field]").forEach(input => {
      const field = input.dataset.field;
      input.value = article[field] || "";

      input.addEventListener("input", () => {
        article[field] = input.value;
        if (field === "title") node.querySelector("strong").textContent = input.value || `Actualité ${visibleIndex + 1}`;
        if (field === "media") updatePreview(node, input.value);
        markDirty();
      });

      input.addEventListener("change", () => {
        article[field] = input.value;
        markDirty();
      });
    });

    const toggle = node.querySelector(".toggle-article");
    if (toggle) {
      toggle.onclick = () => {
        node.classList.toggle("collapsed");
        toggle.textContent = node.classList.contains("collapsed") ? "Modifier" : "Réduire";
      };
    }

    const view = node.querySelector(".view-article");
    if (view) {
      view.onclick = () => {
        collectArticlesFromDOM();
        saveData("Actualité enregistrée ✅");
        const id = node.querySelector('[data-field="id"]')?.value || article.id;
        window.open(`article.html?id=${encodeURIComponent(id)}`, "_blank");
      };
    }

    const save = node.querySelector(".save-article");
    if (save) {
      save.onclick = () => {
        collectArticlesFromDOM();
        saveData("Actualité enregistrée ✅");
        node.classList.add("collapsed");
        if (toggle) toggle.textContent = "Modifier";
        renderSlides();
      };
    }

    const remove = node.querySelector(".remove");
    if (remove) {
      remove.onclick = () => confirmCMSDelete("Supprimer cette actualité ?", () => {
        data.articles = data.articles.filter(a => String(a.id) !== String(article.id));
        data.slides = data.slides.map(s => String(s.articleId) === String(article.id) ? { ...s, articleId: "", link: "#" } : s);
        if (String(data.featuredArticleId) === String(article.id)) data.featuredArticleId = "";
        renderArticles();
        renderSlides();
        window.__skipArticleCollectOnce = true;
        saveData("Actualité supprimée ✅");
      });
    }

    const upload = node.querySelector(".media-upload");
    if (upload) {
      upload.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await fileToDataURL(file);
        article.media = url;
        const mediaInput = node.querySelector('[data-field="media"]');
        if (mediaInput) mediaInput.value = url;
        updatePreview(node, url);
        markDirty();
      };
    }

    updatePreview(node, article.media);
    node.classList.add("collapsed");
    if (toggle) toggle.textContent = "Modifier";
    els.articlesList.appendChild(node);
  });
}

function addSlide() {
  collectSlidesFromDOM();
  data.slides.push({ category: "", title: "", excerpt: "", image: "", link: "#", articleId: "" });
  renderSlides();
  markDirty();
}

function addArticle() {
  collectArticlesFromDOM();
  const cat = activeRubrique === "all" ? "Politique" : activeRubrique;
  data.articles.unshift({
    id: uid(),
    createdAt: new Date().toISOString(),
    category: cat,
    date: new Date().toISOString().slice(0,10),
    author: (function(){ try { var s = JSON.parse(localStorage.getItem('gayaCMSSession')||'{}'); var p = JSON.parse(localStorage.getItem('gayaCMSProfile')||'{}'); if(p.firstName||p.lastName) return ((p.firstName||'') + ' ' + (p.lastName||'')).trim(); return s.username || 'Rédaction'; } catch(e){ return 'Rédaction'; } })(),
    title: "",
    excerpt: "",
    content: "",
    media: ""
  });
  renderArticles();
  refreshFeaturedArticleSelect();
  window.refreshHomeArticlesMulti();
  markDirty();
}

function exportJSON() {
  collectGeneral();
  collectSlidesFromDOM();
  collectArticlesFromDOM();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gaya-cms-data.json";
  a.click();
  URL.revokeObjectURL(url);
}

function resetData() {
  confirmCMSDelete("Vider tout le contenu du CMS et du site ?", () => {
    data = normalizeData(defaultData);
    window.__skipArticleCollectOnce = true;
    window.__skipSocieteCollectOnce = true;
    window.__skipEmissionCollectOnce = true;
    saveData("CMS vidé ✅");
    fillForm();
    initSocieteCMS();
    if (typeof initEmissionsCMS === "function") initEmissionsCMS();
  });
}


function articleToSlide(article) {
  return {
    category: article.category || "Actualité",
    title: article.title || "Sans titre",
    excerpt: article.excerpt || "",
    image: article.media || "",
    link: article.id ? `article.html?id=${article.id}` : "#",
    articleId: article.id || ""
  };
}

function refreshHomeArticlesMulti() {
  if (!els.homeArticlesMulti) return;
  const selected = new Set([...els.homeArticlesMulti.selectedOptions].map(o => String(o.value)));
  els.homeArticlesMulti.innerHTML = "";
  getArticlesNewestFirst().forEach((article, i) => {
    const opt = document.createElement("option");
    opt.value = article.id;
    opt.textContent = article.title || `Actualité ${i + 1}`;
    if (selected.has(String(article.id))) opt.selected = true;
    els.homeArticlesMulti.appendChild(opt);
  });
}

function getSelectedHomeArticles() {
  if (!els.homeArticlesMulti) return [];
  const ids = [...els.homeArticlesMulti.selectedOptions].map(o => String(o.value));
  return ids.map(id => data.articles.find(a => String(a.id) === id)).filter(Boolean);
}

function addSelectedArticlesToSlider() {
  collectArticlesFromDOM();
  const articles = getSelectedHomeArticles();
  if (!articles.length) {
    alert("Sélectionne au moins un article.");
    return;
  }
  data.slides.push(...articles.map(articleToSlide));
  renderSlides();
  saveData("Articles ajoutés au slider accueil ✅");
}

function replaceSliderWithSelectedArticles() {
  collectArticlesFromDOM();
  const articles = getSelectedHomeArticles();
  if (!articles.length) {
    alert("Sélectionne au moins un article.");
    return;
  }
  data.slides = articles.map(articleToSlide);
  renderSlides();
  saveData("Slider accueil remplacé ✅");
}





/* === CMS Émissions > Société — sélection à la une + vidéo upload === */
function ensureSocieteData() {
  data.emissions = data.emissions || {};
  data.emissions.societe = data.emissions.societe || {
    featuredEpisodeId: "",
    episodes: [
    ]
  };

  data.emissions.societe.episodes = Array.isArray(data.emissions.societe.episodes) ? data.emissions.societe.episodes : [];
  data.emissions.societe.featuredEpisodeId = data.emissions.societe.featuredEpisodeId || "";
}

function societeEls() {
  return {
    featuredSelect: document.getElementById("societeFeaturedEpisodeSelect"),
    list: document.getElementById("societeEpisodesList"),
    template: document.getElementById("societeEpisodeTemplate"),
    addBtn: document.getElementById("addSocieteEpisodeBtn")
  };
}

function getSocieteEpisodesNewestFirst() {
  ensureSocieteData();
  return [...data.emissions.societe.episodes].sort((a,b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

function refreshSocieteFeaturedSelect() {
  ensureSocieteData();
  const s = societeEls();
  if (!s.featuredSelect) return;

  const selected = data.emissions.societe.featuredEpisodeId || "";
  s.featuredSelect.innerHTML = '<option value="">Automatique : dernière émission ajoutée</option>';

  getSocieteEpisodesNewestFirst().forEach((ep, i) => {
    const opt = document.createElement("option");
    opt.value = ep.id;
    opt.textContent = ep.title || `Épisode Société ${i + 1}`;
    if (String(selected) === String(ep.id)) opt.selected = true;
    s.featuredSelect.appendChild(opt);
  });
}

function updateSocietePreview(container, image, videoFile) {
  if (!container) return;
  let html = "";
  if (image) html += `<img src="${image}" alt=""><span>Miniature sélectionnée</span>`;
  if (videoFile) html += `<span class="societe-video-badge">Vidéo chargée</span>`;
  container.innerHTML = html;
}

function collectSocieteFeatured() {
  ensureSocieteData();
  const s = societeEls();
  if (s.featuredSelect) {
    data.emissions.societe.featuredEpisodeId = s.featuredSelect.value;
  }
}

function collectSocieteEpisodesFromDOM() {
  ensureSocieteData();
  const s = societeEls();
  if (!s.list) return;

  const rendered = [...s.list.querySelectorAll(".societe-episode-card")].map(card => {
    const obj = {};
    card.querySelectorAll("[data-field]").forEach(input => {
      obj[input.dataset.field] = input.value.trim();
    });
    obj.id = card.dataset.id || uid();
    const old = data.emissions.societe.episodes.find(e => String(e.id) === String(obj.id));
    obj.createdAt = old?.createdAt || new Date().toISOString();
    return obj;
  });

  data.emissions.societe.episodes = rendered;
}

function renderSocieteEpisodes() {
  ensureSocieteData();
  const s = societeEls();
  if (!s.list || !s.template) return;

  s.list.innerHTML = "";

  getSocieteEpisodesNewestFirst().forEach((episode, index) => {
    const node = s.template.content.firstElementChild.cloneNode(true);
    node.dataset.id = episode.id || uid();
    node.querySelector("strong").textContent = episode.title || `Épisode Société ${index + 1}`;

    node.querySelectorAll("[data-field]").forEach(input => {
      const field = input.dataset.field;
      input.value = episode[field] || "";

      input.addEventListener("input", () => {
        episode[field] = input.value;
        if (field === "title") node.querySelector("strong").textContent = input.value || `Épisode Société ${index + 1}`;
        if (field === "image" || field === "videoFile") {
          updateSocietePreview(node.querySelector(".media-preview"), episode.image, episode.videoFile);
        }
        markDirty();
      });
    });

    const toggle = node.querySelector(".toggle-societe-episode");
    toggle.onclick = () => {
      node.classList.toggle("collapsed");
      toggle.textContent = node.classList.contains("collapsed") ? "Modifier" : "Réduire";
    };

    node.querySelector(".view-societe-episode").onclick = () => {
      collectSocieteFeatured();
      collectSocieteEpisodesFromDOM();
      saveData("Épisode Société enregistré ✅");
      window.open("societe.html", "_blank");
    };

    node.querySelector(".save-societe-episode").onclick = () => {
      collectSocieteFeatured();
      collectSocieteEpisodesFromDOM();
      saveData("Épisode Société enregistré ✅");
      node.classList.add("collapsed");
      toggle.textContent = "Modifier";
      refreshSocieteFeaturedSelect();
    };

    node.querySelector(".remove").onclick = () => confirmCMSDelete("Supprimer cet épisode Société ?", () => {
      data.emissions.societe.episodes = data.emissions.societe.episodes.filter(e => String(e.id) !== String(node.dataset.id));
      if (String(data.emissions.societe.featuredEpisodeId) === String(node.dataset.id)) {
        data.emissions.societe.featuredEpisodeId = "";
      }
      window.__skipSocieteCollectOnce = true;
      saveData("Épisode Société supprimé ✅");
      renderSocieteEpisodes();
      refreshSocieteFeaturedSelect();
    });

    const imageUpload = node.querySelector(".societe-upload");
    if (imageUpload) {
      imageUpload.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await fileToDataURL(file);
        episode.image = url;
        const input = node.querySelector('[data-field="image"]');
        if (input) input.value = url;
        updateSocietePreview(node.querySelector(".media-preview"), episode.image, episode.videoFile);
        markDirty();
      };
    }

    const videoUpload = node.querySelector(".societe-video-upload");
    if (videoUpload) {
      videoUpload.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await fileToDataURL(file);
        episode.videoFile = url;
        const input = node.querySelector('[data-field="videoFile"]');
        if (input) input.value = url;
        updateSocietePreview(node.querySelector(".media-preview"), episode.image, episode.videoFile);
        markDirty();
      };
    }

    updateSocietePreview(node.querySelector(".media-preview"), episode.image, episode.videoFile);
    node.classList.add("collapsed");
    toggle.textContent = "Modifier";
    s.list.appendChild(node);
  });
}

function addSocieteEpisode() {
  ensureSocieteData();
  collectSocieteFeatured();
  collectSocieteEpisodesFromDOM();

  data.emissions.societe.episodes.unshift({
    id: uid(),
    ep: `Ép. ${String(data.emissions.societe.episodes.length + 1).padStart(2, "0")}`,
    title: "",
    desc: "",
    date: new Date().toISOString().slice(0,10),
    duration: "",
    views: "",
    videoId: "dQw4w9WgXcQ",
    videoFile: "",
    image: "",
    createdAt: new Date().toISOString()
  });

  renderSocieteEpisodes();
  refreshSocieteFeaturedSelect();
  markDirty();
}

function initSocieteCMS() {
  ensureSocieteData();
  const s = societeEls();
  if (!s.list) return;

  s.featuredSelect?.addEventListener("change", () => {
    data.emissions.societe.featuredEpisodeId = s.featuredSelect.value;
    markDirty();
  });

  s.addBtn?.addEventListener("click", addSocieteEpisode);
  refreshSocieteFeaturedSelect();
  renderSocieteEpisodes();
}

function fillForm() {
  if (els.ticker) els.ticker.value = data.ticker || "";
  if (els.liveTitle) els.liveTitle.value = data.liveTitle || "";
  if (els.liveEmbed) els.liveEmbed.value = data.liveEmbed || "";
  refreshFeaturedArticleSelect();
  window.refreshHomeArticlesMulti();
  renderSlides();
  renderArticles();
}


function refreshCMSFromRemote(remoteData) {
  if (!remoteData || gayaCMSDirty) return;
  data = normalizeData(remoteData);
  if (typeof window.ensureAllEmissionsData === "function") window.ensureAllEmissionsData();
  if (typeof fillForm === "function") fillForm();
  if (typeof window.renderEmissionCMS === "function") window.renderEmissionCMS();
  if (typeof renderSocieteEpisodes === "function") renderSocieteEpisodes();
  if (typeof renderSocieteProgrammes === "function") renderSocieteProgrammes();
  if (typeof window.initMultimediaCMS === "function") window.initMultimediaCMS();
  setStatus("Synchronisé avec Firebase ✅");
}

function bindFirebaseRealtimeAdmin() {
  if (window.__gayaAdminRealtimeBound) return;
  window.__gayaAdminRealtimeBound = true;
  if (window.gayaCMSOnUpdate) {
    window.gayaCMSOnUpdate(refreshCMSFromRemote);
  }
  window.addEventListener("gaya-cms-updated", () => {
    if (!gayaCMSDirty && window.gayaCMSRead) refreshCMSFromRemote(window.gayaCMSRead());
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindFirebaseRealtimeAdmin);
} else {
  bindFirebaseRealtimeAdmin();
}

document.querySelectorAll(".admin-nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".admin-nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".admin-view").forEach(v => v.classList.remove("active"));
    document.getElementById(btn.dataset.view)?.classList.add("active");
    const title = document.getElementById("pageTitle");
    const subtitle = document.getElementById("pageSubtitle");
    const viewTitles = {
      dashboardView: ["Tableau de bord", "Vue d’ensemble de votre espace Back Office GAYA INFO TV."],
      homeView: ["Accueil", "Contrôle des informations générales et des slides de la page d’accueil."],
      newsView: ["Actualités", "Créez et gérez les articles classés par rubrique."],
      emissionsAllView: ["Émissions", "Gestion des épisodes par émission."],
      multimediaView: ["Multimédia", "Vidéos, podcasts et albums photos."],
      contactView: ["Contact", "Informations de contact affichées sur le site."]
    };
    const info = viewTitles[btn.dataset.view] || [btn.textContent.trim(), ""];
    if (title) title.textContent = info[0];
    if (subtitle) subtitle.textContent = info[1];
    if (btn.dataset.view === "dashboardView") updateDashboardStats();
  });
});

document.querySelectorAll(".rubrique-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    collectArticlesFromDOM();
    document.querySelectorAll(".rubrique-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    activeRubrique = tab.dataset.rubrique;
    renderArticles();
  });
});

[els.ticker, els.liveTitle, els.liveEmbed].forEach(el => el?.addEventListener("input", markDirty));
els.featuredArticle?.addEventListener("change", () => {
  data.featuredArticleId = els.featuredArticle.value;
  data.actualitesFeaturedArticleId = els.featuredArticle.value;
  markDirty();
});
els.addSlideBtn?.addEventListener("click", addSlide);
els.addArticleBtn?.addEventListener("click", addArticle);
els.saveBtn?.addEventListener("click", () => saveData("Tout est enregistré ✅"));

function saveCurrentAdminPage() {
  const activeView = document.querySelector(".admin-view.active")?.id || "";
  if (activeView === "emissionsAllView" && typeof window.saveCurrentEmissionCMS === "function") {
    window.saveCurrentEmissionCMS("Page émission enregistrée ✅");
    return;
  }
  if (activeView === "contactView" && typeof window.saveContactCMS === "function") {
    try { window.saveContactCMS(); return; } catch(e) {}
  }
  if (activeView === "multimediaView" && typeof window.saveMultimediaCMS === "function") {
    try { window.saveMultimediaCMS(); return; } catch(e) {}
  }
  saveData("Page enregistrée ✅");
}

document.getElementById("saveCurrentPageBtn")?.addEventListener("click", saveCurrentAdminPage);
window.saveCurrentAdminPage = saveCurrentAdminPage;
els.exportBtn?.addEventListener("click", exportJSON);
els.resetBtn?.addEventListener("click", resetData);





fillForm();
setStatus("Prêt");


/* === Slider animé accueil : gestion article par article === */
function refreshHomeArticleSingle() {
  if (!els.homeArticleSingle) return;
  const current = els.homeArticleSingle.value;
  els.homeArticleSingle.innerHTML = '<option value="">Sélectionner un article</option>';
  getArticlesNewestFirst().forEach((article, i) => {
    const opt = document.createElement("option");
    opt.value = article.id;
    opt.textContent = article.title || `Actualité ${i + 1}`;
    if (String(current) === String(article.id)) opt.selected = true;
    els.homeArticleSingle.appendChild(opt);
  });
}

function renderSelectedSliderArticles() {
  if (!els.selectedSliderArticles) return;
  if (!Array.isArray(data.slides) || !data.slides.length) {
    els.selectedSliderArticles.innerHTML = '<div class="selected-slider-item"><span>Aucun article dans le slider.</span></div>';
    return;
  }

  els.selectedSliderArticles.innerHTML = data.slides.map((slide, index) => `
    <div class="selected-slider-item">
      <span>${slide.title || "Slide sans titre"}</span>
      <button type="button" data-remove-slide="${index}">Supprimer</button>
    </div>
  `).join("");

  els.selectedSliderArticles.querySelectorAll("[data-remove-slide]").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.removeSlide);
      data.slides.splice(index, 1);
      renderSlides();
      renderSelectedSliderArticles();
      saveData("Article retiré du slider ✅");
    });
  });
}

function addOneArticleToSlider() {
  collectArticlesFromDOM();
  const id = els.homeArticleSingle?.value;
  if (!id) {
    alert("Choisis un article à ajouter.");
    return;
  }

  const article = data.articles.find(a => String(a.id) === String(id));
  if (!article) return;

  data.slides.push(articleToSlide(article));
  renderSlides();
  renderSelectedSliderArticles();
  saveData("Article ajouté au slider ✅");
}

const oldRefreshHomeArticlesMulti = window.refreshHomeArticlesMulti;
window.refreshHomeArticlesMulti = function() {
  refreshHomeArticleSingle();
  renderSelectedSliderArticles();
};

els.addOneArticleToSliderBtn?.addEventListener("click", addOneArticleToSlider);

// Forcer la mise à jour après chargement/rendu
setTimeout(() => {
  refreshHomeArticleSingle();
  renderSelectedSliderArticles();
}, 200);


/* === FIX ROBUSTE : bouton Ajouter Émission Société === */
(function(){
  function ensureBaseSocieteData() {
    if (typeof data === "undefined") return null;
    data.emissions = data.emissions || {};
    data.emissions.societe = data.emissions.societe || {};
    data.emissions.societe.episodes = Array.isArray(data.emissions.societe.episodes) ? data.emissions.societe.episodes : [];
    data.emissions.societe.featuredEpisodeId = data.emissions.societe.featuredEpisodeId || "";
    return data.emissions.societe;
  }

  window.forceAddSocieteEpisode = function() {
    const societe = ensureBaseSocieteData();
    if (!societe) return;

    if (typeof collectSocieteFeatured === "function") collectSocieteFeatured();
    if (typeof collectSocieteEpisodesFromDOM === "function") collectSocieteEpisodesFromDOM();

    societe.episodes.unshift({
      id: (typeof uid === "function") ? uid() : Date.now().toString(36),
      ep: `Ép. ${String(societe.episodes.length + 1).padStart(2, "0")}`,
      title: "",
      desc: "",
      date: new Date().toISOString().slice(0,10),
      duration: "",
      views: "",
      videoId: "dQw4w9WgXcQ",
      videoFile: "",
      image: "",
      createdAt: new Date().toISOString()
    });

    if (typeof renderSocieteEpisodes === "function") renderSocieteEpisodes();
    if (typeof refreshSocieteFeaturedSelect === "function") refreshSocieteFeaturedSelect();
    if (typeof markDirty === "function") markDirty();

    const list = document.getElementById("societeEpisodesList");
    const firstCard = list?.querySelector(".societe-episode-card");
    if (firstCard) {
      firstCard.classList.remove("collapsed");
      const toggle = firstCard.querySelector(".toggle-societe-episode");
      if (toggle) toggle.textContent = "Réduire";
      firstCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  function bindSocieteAddButton() {
    const btn = document.getElementById("addSocieteEpisodeBtn");
    if (!btn || btn.dataset.forceBound === "1") return;
    btn.dataset.forceBound = "1";
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.forceAddSocieteEpisode();
    }, true);
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindSocieteAddButton();
    setTimeout(bindSocieteAddButton, 300);
    setTimeout(bindSocieteAddButton, 900);
  });

  window.addEventListener("load", bindSocieteAddButton);

  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "addSocieteEpisodeBtn") {
      e.preventDefault();
      e.stopPropagation();
      window.forceAddSocieteEpisode();
    }
  }, true);
})();


/* === FIX PERSISTANCE SOCIÉTÉ + PROGRAMMES === */
(function(){
  const SOCIETE_KEYS = ["gayaCMSData", "gayaCMS", "gayaData", "gaya_cms_v1"];

  function ensureSocieteBase() {
    if (typeof data === "undefined") return null;
    data.emissions = data.emissions || {};
    data.emissions.societe = data.emissions.societe || {};
    data.emissions.societe.episodes = Array.isArray(data.emissions.societe.episodes) ? data.emissions.societe.episodes : [];
    data.emissions.societe.programmes = Array.isArray(data.emissions.societe.programmes) ? data.emissions.societe.programmes : [];
    data.emissions.societe.featuredEpisodeId = data.emissions.societe.featuredEpisodeId || "";
    return data.emissions.societe;
  }

  function societeUid() {
    return (typeof uid === "function") ? uid() : Date.now().toString(36) + Math.random().toString(36).slice(2,7);
  }

  function nextWeekdayDate(targetDay) {
    const now = new Date();
    const d = new Date(now);
    const diff = (targetDay + 7 - d.getDay()) % 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0,10);
  }

  function persistSocieteNow(message) {
    ensureSocieteBase();
    if (typeof collectGeneral === "function") collectGeneral();
    if (typeof collectSlidesFromDOM === "function") collectSlidesFromDOM();
    if (typeof collectArticlesFromDOM === "function") collectArticlesFromDOM();
    if (typeof collectSocieteFeatured === "function") collectSocieteFeatured();
    if (window.__skipSocieteCollectOnce) {
      window.__skipSocieteCollectOnce = false;
    } else {
      if (typeof collectSocieteEpisodesFromDOM === "function") collectSocieteEpisodesFromDOM();
    }
    collectSocieteProgrammesFromDOM();

    if (data.liveTitle || data.liveEmbed) {
      data.live = { title: data.liveTitle || "GAYA INFO TV — Direct", embedUrl: data.liveEmbed || "" };
    }

    data.__forceReplace = true;
    window.gayaCMSWrite ? gayaCMSWrite(data) : (()=>{
      const payload = JSON.stringify(data);
      SOCIETE_KEYS.forEach(k => localStorage.setItem(k, payload));
      window.dispatchEvent(new Event("gaya-cms-updated"));
    })();
    if (typeof setStatus === "function") setStatus(message || "Enregistré ✅");
  }

  // Override saveData so Société is never lost on refresh
  window.saveData = persistSocieteNow;
  if (typeof saveData !== "undefined") {
    try { saveData = persistSocieteNow; } catch(e) {}
  }

  function programmeEls() {
    return {
      list: document.getElementById("societeProgrammesList"),
      template: document.getElementById("societeProgrammeTemplate"),
      addBtn: document.getElementById("addSocieteProgrammeBtn")
    };
  }

  window.collectSocieteProgrammesFromDOM = function() {
    const societe = ensureSocieteBase();
    const els = programmeEls();
    if (!societe || !els.list) return;

    const rendered = [...els.list.querySelectorAll(".societe-programme-card")].map(card => {
      const obj = {};
      card.querySelectorAll("[data-field]").forEach(input => obj[input.dataset.field] = input.value.trim());
      obj.id = card.dataset.id || societeUid();
      const old = societe.programmes.find(p => String(p.id) === String(obj.id));
      obj.createdAt = old?.createdAt || new Date().toISOString();
      return obj;
    });

    if (rendered.length || els.list.querySelector(".societe-programme-card")) {
      societe.programmes = rendered;
    }
  }

  window.renderSocieteProgrammes = function() {
    const societe = ensureSocieteBase();
    const els = programmeEls();
    if (!societe || !els.list || !els.template) return;

    els.list.innerHTML = "";
    const sorted = [...societe.programmes].sort((a,b) => String(a.date + a.startTime).localeCompare(String(b.date + b.startTime)));

    sorted.forEach((programme, index) => {
      const node = els.template.content.firstElementChild.cloneNode(true);
      node.dataset.id = programme.id || societeUid();
      node.querySelector("strong").textContent = programme.title || `Programme ${index + 1}`;

      node.querySelectorAll("[data-field]").forEach(input => {
        const field = input.dataset.field;
        input.value = programme[field] || "";
        input.addEventListener("input", () => {
          programme[field] = input.value;
          if (field === "title") node.querySelector("strong").textContent = input.value || `Programme ${index + 1}`;
          if (typeof markDirty === "function") markDirty();
        });
      });

      const toggle = node.querySelector(".toggle-societe-programme");
      toggle.onclick = () => {
        node.classList.toggle("collapsed");
        toggle.textContent = node.classList.contains("collapsed") ? "Modifier" : "Réduire";
      };

      node.querySelector(".save-societe-programme").onclick = () => {
        collectSocieteProgrammesFromDOM();
        persistSocieteNow("Programme enregistré ✅");
        node.classList.add("collapsed");
        toggle.textContent = "Modifier";
      };

      node.querySelector(".remove").onclick = () => confirmCMSDelete("Supprimer ce programme ?", () => {
        societe.programmes = societe.programmes.filter(p => String(p.id) !== String(node.dataset.id));
        window.__skipSocieteCollectOnce = true;
        persistSocieteNow("Programme supprimé ✅");
        renderSocieteProgrammes();
      });

      node.classList.add("collapsed");
      toggle.textContent = "Modifier";
      els.list.appendChild(node);
    });
  }

  window.forceAddSocieteEpisode = function() {
    const societe = ensureSocieteBase();
    if (!societe) return;

    if (typeof collectSocieteFeatured === "function") collectSocieteFeatured();
    if (typeof collectSocieteEpisodesFromDOM === "function") collectSocieteEpisodesFromDOM();

    societe.episodes.unshift({
      id: societeUid(),
      ep: `Ép. ${String(societe.episodes.length + 1).padStart(2, "0")}`,
      title: "",
      desc: "",
      date: new Date().toISOString().slice(0,10),
      duration: "",
      views: "",
      videoId: "dQw4w9WgXcQ",
      videoFile: "",
      image: "",
      createdAt: new Date().toISOString()
    });

    if (typeof renderSocieteEpisodes === "function") renderSocieteEpisodes();
    if (typeof refreshSocieteFeaturedSelect === "function") refreshSocieteFeaturedSelect();
    persistSocieteNow("Épisode ajouté ✅");

    const list = document.getElementById("societeEpisodesList");
    const firstCard = list?.querySelector(".societe-episode-card");
    if (firstCard) {
      firstCard.classList.remove("collapsed");
      const toggle = firstCard.querySelector(".toggle-societe-episode");
      if (toggle) toggle.textContent = "Réduire";
      firstCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  function addSocieteProgramme() {
    const societe = ensureSocieteBase();
    if (!societe) return;
    collectSocieteProgrammesFromDOM();
    societe.programmes.unshift({
      id: societeUid(),
      date: new Date().toISOString().slice(0,10),
      startTime: "20:00",
      endTime: "21:00",
      title: "",
      createdAt: new Date().toISOString()
    });
    renderSocieteProgrammes();
    persistSocieteNow("Programme ajouté ✅");

    const first = document.querySelector("#societeProgrammesList .societe-programme-card");
    if (first) {
      first.classList.remove("collapsed");
      const toggle = first.querySelector(".toggle-societe-programme");
      if (toggle) toggle.textContent = "Réduire";
    }
  }

  function bindSocieteButtons() {
    const epBtn = document.getElementById("addSocieteEpisodeBtn");
    if (epBtn && epBtn.dataset.forceBound !== "1") {
      epBtn.dataset.forceBound = "1";
      epBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        window.forceAddSocieteEpisode();
      }, true);
    }

    const progBtn = document.getElementById("addSocieteProgrammeBtn");
    if (progBtn && progBtn.dataset.forceBound !== "1") {
      progBtn.dataset.forceBound = "1";
      progBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        addSocieteProgramme();
      }, true);
    }
  }

  function initSocietePersistenceAndProgrammes() {
    ensureSocieteBase();
    bindSocieteButtons();
    if (typeof refreshSocieteFeaturedSelect === "function") refreshSocieteFeaturedSelect();
    if (typeof renderSocieteEpisodes === "function") renderSocieteEpisodes();
    renderSocieteProgrammes();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initSocietePersistenceAndProgrammes();
    setTimeout(initSocietePersistenceAndProgrammes, 300);
    setTimeout(initSocietePersistenceAndProgrammes, 900);
  });
  window.addEventListener("load", initSocietePersistenceAndProgrammes);
})();


/* === CMS : modal flottante Programmes Société === */
(function(){
  function bindCmsProgrammesModal() {
    const btn = document.getElementById("cms-programmes-float-btn");
    const overlay = document.getElementById("cms-programmes-modal-overlay");
    const close = document.getElementById("cms-programmes-modal-close");
    if (!btn || !overlay || !close || btn.dataset.bound === "1") return;

    btn.dataset.bound = "1";
    btn.addEventListener("click", () => overlay.classList.add("open"));
    close.addEventListener("click", () => overlay.classList.remove("open"));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindCmsProgrammesModal();
    setTimeout(bindCmsProgrammesModal, 500);
  });
  window.addEventListener("load", bindCmsProgrammesModal);
})();


/* === CMS ÉMISSIONS : 5 RUBRIQUES === */
(function(){
  const EMISSION_LABELS = {
    societe: "Société",
    economie: "Économie",
    religion: "Religion",
    sport: "Sport",
    faitsdivers: "Faits divers"
  };
  const EMISSION_FILES = {
    societe: "societe.html",
    economie: "economie.html",
    religion: "religion.html",
    sport: "sport.html",
    faitsdivers: "faitsdivers.html"
  };
  const EMISSION_KEYS = ["societe","economie","religion","sport","faitsdivers"];
  let currentEmission = "societe";

  function uidEmission() {
    return (typeof uid === "function") ? uid() : Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  }

  function ensureAllEmissionsData() {
    if (typeof data === "undefined") return;
    data.emissions = data.emissions || {};
    EMISSION_KEYS.forEach(key => {
      data.emissions[key] = data.emissions[key] || {
        featuredEpisodeId: "",
        episodes: [],
        programmes: []
      };
      data.emissions[key].featuredEpisodeId = data.emissions[key].featuredEpisodeId || "";
      data.emissions[key].episodes = Array.isArray(data.emissions[key].episodes) ? data.emissions[key].episodes : [];
      data.emissions[key].programmes = Array.isArray(data.emissions[key].programmes) ? data.emissions[key].programmes : [];
      
    });
  }

  function saveEmissionsData(msg="Émissions enregistrées ✅") {
    ensureAllEmissionsData();
    if (window.__skipEmissionCollectOnce) {
      window.__skipEmissionCollectOnce = false;
    } else {
      collectEmissionEpisodesFromDOM();
      collectEmissionProgrammesFromDOM();
    }
    const fs = document.getElementById("emissionFeaturedSelect");
    if (fs) data.emissions[currentEmission].featuredEpisodeId = fs.value;

    // Écriture directe avec forceReplace — évite que les collect calls d'autres sections
    // (société, articles) re-lisent le DOM et écrasent la suppression
    data.__forceReplace = true;
    data.__cmsUpdatedAt = Date.now();
    try {
      if (window.gayaCMSWrite) {
        window.gayaCMSWrite(data);
      } else {
        const payload = JSON.stringify(data);
        ["gayaCMSData","gayaCMS","gayaData","gaya_cms_v1"].forEach(k => localStorage.setItem(k, payload));
        window.dispatchEvent(new Event("gaya-cms-updated"));
      }
      if (typeof setStatus === "function") setStatus(msg);
      if (typeof gayaCMSDirty !== "undefined") window.gayaCMSDirty = false;
    } catch(e) {
      console.error("saveEmissionsData échoué", e);
      if (typeof setStatus === "function") setStatus("Erreur sauvegarde ❌");
    }
  }

  function getCurrentEmission() {
    ensureAllEmissionsData();
    return data.emissions[currentEmission];
  }

  function sortedEpisodes() {
    return [...getCurrentEmission().episodes].sort((a,b) => String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
  }

  function sortedProgrammes() {
    return [...getCurrentEmission().programmes].sort((a,b) => String(a.date+a.startTime).localeCompare(String(b.date+b.startTime)));
  }

  function fileToDataURLSafe(file) {
    if (typeof fileToDataURL === "function") return fileToDataURL(file);
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function updateMediaPreview(card, image, videoFile) {
    const p = card.querySelector(".media-preview");
    if (!p) return;
    let html = "";
    if (image) html += `<img src="${image}" alt=""><span>Miniature</span>`;
    if (videoFile) html += `<span class="societe-video-badge">Vidéo chargée</span>`;
    p.innerHTML = html;
  }

  function refreshEmissionUIHeader() {
    const title = document.getElementById("emissionCmsTitle");
    const view = document.getElementById("viewCurrentEmissionPage");
    const progTitle = document.getElementById("emissionProgrammesTitle");
    if (title) title.textContent = `Émissions — ${EMISSION_LABELS[currentEmission]}`;
    if (view) view.href = EMISSION_FILES[currentEmission];
    if (progTitle) progTitle.textContent = `Programme — ${EMISSION_LABELS[currentEmission]}`;
    document.querySelectorAll(".emission-admin-tab").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.emission === currentEmission);
    });
  }

  function refreshFeaturedSelect() {
    const select = document.getElementById("emissionFeaturedSelect");
    if (!select) return;
    const selected = getCurrentEmission().featuredEpisodeId || "";
    select.innerHTML = '<option value="">Automatique : dernier épisode ajouté</option>';
    sortedEpisodes().forEach((ep, i) => {
      const opt = document.createElement("option");
      opt.value = ep.id;
      opt.textContent = ep.title || `Épisode ${i + 1}`;
      if (String(selected) === String(ep.id)) opt.selected = true;
      select.appendChild(opt);
    });
  }

  function collectEmissionEpisodesFromDOM() {
    const list = document.getElementById("emissionEpisodesList");
    if (!list || !document.getElementById("emissionsAllView")?.classList.contains("active")) return;
    const cards = [...list.querySelectorAll(".emission-episode-card")];
    const rendered = cards.map(card => {
      const obj = {};
      card.querySelectorAll("[data-field]").forEach(input => obj[input.dataset.field] = input.value.trim());
      obj.id = card.dataset.id || uidEmission();
      const old = getCurrentEmission().episodes.find(e => String(e.id) === String(obj.id));
      obj.createdAt = old?.createdAt || new Date().toISOString();
      return obj;
    });
    getCurrentEmission().episodes = rendered;
  }

  function renderEmissionEpisodes() {
    const list = document.getElementById("emissionEpisodesList");
    const tpl = document.getElementById("emissionEpisodeTemplate");
    if (!list || !tpl) return;
    list.innerHTML = "";

    sortedEpisodes().forEach((episode, index) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = episode.id || uidEmission();
      node.querySelector("strong").textContent = episode.title || `${EMISSION_LABELS[currentEmission]} — épisode ${index+1}`;

      node.querySelectorAll("[data-field]").forEach(input => {
        const field = input.dataset.field;
        input.value = episode[field] || "";
        input.addEventListener("input", () => {
          episode[field] = input.value;
          if (field === "title") node.querySelector("strong").textContent = input.value || `${EMISSION_LABELS[currentEmission]} — épisode ${index+1}`;
          if (field === "image" || field === "videoFile") updateMediaPreview(node, episode.image, episode.videoFile);
          if (typeof markDirty === "function") markDirty();
        });
      });

      const toggle = node.querySelector(".toggle-emission-episode");
      toggle.onclick = () => {
        node.classList.toggle("collapsed");
        toggle.textContent = node.classList.contains("collapsed") ? "Modifier" : "Réduire";
      };

      node.querySelector(".view-emission-episode").onclick = () => {
        saveEmissionsData("Épisode enregistré ✅");
        window.open(EMISSION_FILES[currentEmission], "_blank");
      };

      node.querySelector(".save-emission-episode").onclick = () => {
        saveEmissionsData("Épisode enregistré ✅");
        node.classList.add("collapsed");
        toggle.textContent = "Modifier";
        refreshFeaturedSelect();
      };

      node.querySelector(".remove").onclick = () => confirmCMSDelete("Supprimer cet épisode ?", () => {
        getCurrentEmission().episodes = getCurrentEmission().episodes.filter(e => String(e.id) !== String(node.dataset.id));
        if (String(getCurrentEmission().featuredEpisodeId) === String(node.dataset.id)) getCurrentEmission().featuredEpisodeId = "";
        window.__skipEmissionCollectOnce = true;
        saveEmissionsData("Épisode supprimé ✅");
        renderEmissionEpisodes();
        refreshFeaturedSelect();
      });

      node.querySelector(".emission-image-upload").onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await fileToDataURLSafe(file);
        episode.image = url;
        node.querySelector('[data-field="image"]').value = url;
        updateMediaPreview(node, episode.image, episode.videoFile);
        if (typeof markDirty === "function") markDirty();
      };

      node.querySelector(".emission-video-upload").onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await fileToDataURLSafe(file);
        episode.videoFile = url;
        node.querySelector('[data-field="videoFile"]').value = url;
        updateMediaPreview(node, episode.image, episode.videoFile);
        if (typeof markDirty === "function") markDirty();
      };

      updateMediaPreview(node, episode.image, episode.videoFile);
      node.classList.add("collapsed");
      toggle.textContent = "Modifier";
      list.appendChild(node);
    });
  }

  function addEmissionEpisode() {
    collectEmissionEpisodesFromDOM();
    getCurrentEmission().episodes.unshift({
      id: uidEmission(),
      ep: `Ép. ${String(getCurrentEmission().episodes.length + 1).padStart(2, "0")}`,
      title: "",
      desc: "",
      date: new Date().toISOString().slice(0,10),
      duration: "",
      views: "",
      videoId: "dQw4w9WgXcQ",
      videoFile: "",
      image: "",
      createdAt: new Date().toISOString()
    });
    renderEmissionEpisodes();
    refreshFeaturedSelect();
    if (typeof markDirty === "function") markDirty();
    const first = document.querySelector("#emissionEpisodesList .emission-episode-card");
    if (first) {
      first.classList.remove("collapsed");
      const toggle = first.querySelector(".toggle-emission-episode");
      if (toggle) toggle.textContent = "Réduire";
    }
  }

  function collectEmissionProgrammesFromDOM() {
    const list = document.getElementById("emissionProgrammesList");
    if (!list) return;
    const rendered = [...list.querySelectorAll(".emission-programme-card")].map(card => {
      const obj = {};
      card.querySelectorAll("[data-field]").forEach(input => obj[input.dataset.field] = input.value.trim());
      obj.id = card.dataset.id || uidEmission();
      const old = getCurrentEmission().programmes.find(p => String(p.id) === String(obj.id));
      obj.createdAt = old?.createdAt || new Date().toISOString();
      return obj;
    });
    getCurrentEmission().programmes = rendered;
  }

  function renderEmissionProgrammes() {
    const list = document.getElementById("emissionProgrammesList");
    const tpl = document.getElementById("emissionProgrammeTemplate");
    if (!list || !tpl) return;
    list.innerHTML = "";

    sortedProgrammes().forEach((programme, index) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = programme.id || uidEmission();
      node.querySelector("strong").textContent = programme.title || `Programme ${index+1}`;

      node.querySelectorAll("[data-field]").forEach(input => {
        const field = input.dataset.field;
        input.value = programme[field] || "";
        input.addEventListener("input", () => {
          programme[field] = input.value;
          if (field === "title") node.querySelector("strong").textContent = input.value || `Programme ${index+1}`;
          if (typeof markDirty === "function") markDirty();
        });
      });

      const toggle = node.querySelector(".toggle-emission-programme");
      toggle.onclick = () => {
        node.classList.toggle("collapsed");
        toggle.textContent = node.classList.contains("collapsed") ? "Modifier" : "Réduire";
      };

      node.querySelector(".save-emission-programme").onclick = () => {
        saveEmissionsData("Programme enregistré ✅");
        node.classList.add("collapsed");
        toggle.textContent = "Modifier";
      };

      node.querySelector(".remove").onclick = () => confirmCMSDelete("Supprimer ce programme ?", () => {
        getCurrentEmission().programmes = getCurrentEmission().programmes.filter(p => String(p.id) !== String(node.dataset.id));
        window.__skipEmissionCollectOnce = true;
        saveEmissionsData("Programme supprimé ✅");
        renderEmissionProgrammes();
      });

      node.classList.add("collapsed");
      toggle.textContent = "Modifier";
      list.appendChild(node);
    });
  }

  function addEmissionProgramme() {
    collectEmissionProgrammesFromDOM();
    getCurrentEmission().programmes.unshift({
      id: uidEmission(),
      date: new Date().toISOString().slice(0,10),
      startTime: "20:00",
      endTime: "21:00",
      title: "",
      createdAt: new Date().toISOString()
    });
    renderEmissionProgrammes();
    if (typeof markDirty === "function") markDirty();
    const first = document.querySelector("#emissionProgrammesList .emission-programme-card");
    if (first) {
      first.classList.remove("collapsed");
      const toggle = first.querySelector(".toggle-emission-programme");
      if (toggle) toggle.textContent = "Réduire";
    }
  }

  function renderEmissionCMS() {
    ensureAllEmissionsData();
    refreshEmissionUIHeader();
    refreshFeaturedSelect();
    renderEmissionEpisodes();
    renderEmissionProgrammes();
  }

  function bindEmissionCMS() {
    ensureAllEmissionsData();

    document.querySelectorAll(".emission-admin-tab").forEach(btn => {
      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        collectEmissionEpisodesFromDOM();
        collectEmissionProgrammesFromDOM();
        const select = document.getElementById("emissionFeaturedSelect");
        if (select) getCurrentEmission().featuredEpisodeId = select.value;
        currentEmission = btn.dataset.emission || "societe";
        document.querySelectorAll(".admin-nav-btn").forEach(b => b.classList.remove("active"));
        const nav = document.querySelector('[data-view="emissionsAllView"]');
        if (nav) nav.classList.add("active");
        document.querySelectorAll(".admin-view").forEach(v => v.classList.remove("active"));
        document.getElementById("emissionsAllView")?.classList.add("active");
        const pageTitle = document.getElementById("pageTitle");
        const pageSubtitle = document.getElementById("pageSubtitle");
        if (pageTitle) pageTitle.textContent = "Émissions";
        if (pageSubtitle) pageSubtitle.textContent = `Gestion : ${EMISSION_LABELS[currentEmission]}`;
        renderEmissionCMS();
      });
    });

    const nav = document.querySelector('[data-view="emissionsAllView"]');
    if (nav && nav.dataset.bound !== "1") {
      nav.dataset.bound = "1";
      nav.addEventListener("click", () => {
        document.querySelector(".emission-admin-tab.active")?.click();
      });
    }

    const addEpBtn = document.getElementById("addEmissionEpisodeBtn");
    if (addEpBtn && addEpBtn.dataset.bound !== "1") {
      addEpBtn.dataset.bound = "1";
      addEpBtn.addEventListener("click", addEmissionEpisode);
    }
    const addProgBtn = document.getElementById("addEmissionProgrammeBtn");
    if (addProgBtn && addProgBtn.dataset.bound !== "1") {
      addProgBtn.dataset.bound = "1";
      addProgBtn.addEventListener("click", addEmissionProgramme);
    }

    document.getElementById("emissionFeaturedSelect")?.addEventListener("change", () => {
      getCurrentEmission().featuredEpisodeId = document.getElementById("emissionFeaturedSelect").value;
      if (typeof markDirty === "function") markDirty();
    });

    const floatBtn = document.getElementById("cms-emission-programmes-float-btn");
    const overlay = document.getElementById("cms-emission-programmes-modal-overlay");
    const close = document.getElementById("cms-emission-programmes-modal-close");
    if (floatBtn && overlay && close && floatBtn.dataset.bound !== "1") {
      floatBtn.dataset.bound = "1";
      floatBtn.addEventListener("click", () => overlay.classList.add("open"));
      close.addEventListener("click", () => overlay.classList.remove("open"));
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("open");
      });
    }

    renderEmissionCMS();
  }

  window.ensureAllEmissionsData = ensureAllEmissionsData;
  window.renderEmissionCMS = renderEmissionCMS;
  window.collectCurrentEmissionCMS = function(){
    ensureAllEmissionsData();
    collectEmissionEpisodesFromDOM();
    collectEmissionProgrammesFromDOM();
    const fs = document.getElementById("emissionFeaturedSelect");
    if (fs && data.emissions[currentEmission]) data.emissions[currentEmission].featuredEpisodeId = fs.value;
  };
  window.saveCurrentEmissionCMS = function(msg){ saveEmissionsData(msg || "Émission enregistrée ✅"); };

  document.addEventListener("DOMContentLoaded", () => {
    bindEmissionCMS();
    setTimeout(bindEmissionCMS, 500);
  });
  window.addEventListener("load", bindEmissionCMS);
})();


/* === CMS : ouvrir/fermer sous-catégories Émissions === */
(function(){
  function bindEmissionsDropdownCMS(){
    const group = document.querySelector(".emissions-nav-group");
    const btn = group?.querySelector('[data-view="emissionsAllView"]');
    if (!group || !btn || btn.dataset.dropdownBound === "1") return;

    btn.dataset.dropdownBound = "1";
    btn.addEventListener("click", () => {
      group.classList.toggle("open");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindEmissionsDropdownCMS();
    setTimeout(bindEmissionsDropdownCMS, 400);
  });
  window.addEventListener("load", bindEmissionsDropdownCMS);
})();


/* === Appliquer couleur thème dans le CMS Émissions === */
(function(){
  const CMS_EMISSION_COLORS = {
    societe: "#3B82F6",
    economie: "#1E3A5F",
    religion: "#0F6B4B",
    sport: "#E63946",
    faitsdivers: "#C1121F"
  };

  function applyCmsEmissionTheme(slug) {
    const view = document.getElementById("emissionsAllView");
    if (!view) return;
    const color = CMS_EMISSION_COLORS[slug] || CMS_EMISSION_COLORS.societe;
    view.style.setProperty("--cms-emission-color", color);

    const floatBtn = document.getElementById("cms-emission-programmes-float-btn");
    if (floatBtn) floatBtn.style.background = color;
  }

  document.addEventListener("click", (e) => {
    const tab = e.target.closest(".emission-admin-tab");
    if (tab && tab.dataset.emission) {
      setTimeout(() => applyCmsEmissionTheme(tab.dataset.emission), 20);
    }

    const nav = e.target.closest('[data-view="emissionsAllView"]');
    if (nav) {
      const active = document.querySelector(".emission-admin-tab.active")?.dataset.emission || "societe";
      setTimeout(() => applyCmsEmissionTheme(active), 20);
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const active = document.querySelector(".emission-admin-tab.active")?.dataset.emission || "societe";
    applyCmsEmissionTheme(active);
    setTimeout(() => applyCmsEmissionTheme(active), 500);
  });
})();


/* === CMS MULTIMÉDIA === */
(function(){
  let currentMediaTab = "videos";

  function mediaUid() {
    return (typeof uid === "function") ? uid() : Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  }

  function ensureMultimediaData() {
    if (typeof data === "undefined") return;
    data.multimedia = data.multimedia || {};
    data.multimedia.videos = Array.isArray(data.multimedia.videos) ? data.multimedia.videos : [];
    data.multimedia.podcasts = Array.isArray(data.multimedia.podcasts) ? data.multimedia.podcasts : [];
    data.multimedia.albums = Array.isArray(data.multimedia.albums) ? data.multimedia.albums : [];

    
    
    
  }

  function fileToDataURLSafe(file) {
    if (typeof fileToDataURL === "function") return fileToDataURL(file);
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function saveMultimedia(msg="Multimédia enregistré ✅") {
    ensureMultimediaData();
    if (window.__skipMultimediaCollectOnce) {
      window.__skipMultimediaCollectOnce = false;
    } else {
      collectMediaVideos();
      collectMediaPodcasts();
      collectMediaAlbums();
    }

    // Écriture directe avec forceReplace
    data.__forceReplace = true;
    data.__cmsUpdatedAt = Date.now();
    try {
      if (window.gayaCMSWrite) {
        window.gayaCMSWrite(data);
      } else {
        const payload = JSON.stringify(data);
        ["gayaCMSData","gayaCMS","gayaData","gaya_cms_v1"].forEach(k => localStorage.setItem(k, payload));
        window.dispatchEvent(new Event("gaya-cms-updated"));
      }
      if (typeof setStatus === "function") setStatus(msg);
      if (typeof gayaCMSDirty !== "undefined") window.gayaCMSDirty = false;
    } catch(e) {
      console.error("saveMultimedia échoué", e);
      if (typeof setStatus === "function") setStatus("Erreur sauvegarde ❌");
    }
  }

  function mediaPreview(card, src, label="Média") {
    const p = card.querySelector(".media-preview");
    if (!p) return;
    if (!src) { p.innerHTML = ""; return; }
    if (String(src).startsWith("data:video")) p.innerHTML = `<span class="societe-video-badge">Vidéo chargée</span>`;
    else if (String(src).startsWith("data:audio")) p.innerHTML = `<span class="societe-video-badge">Audio chargé</span>`;
    else p.innerHTML = `<img src="${src}" alt=""><span>${label}</span>`;
  }

  function bindCardBasics(node, collection, item, renderFn) {
    const toggle = node.querySelector(".toggle-media");
    toggle.onclick = () => {
      node.classList.toggle("collapsed");
      toggle.textContent = node.classList.contains("collapsed") ? "Modifier" : "Réduire";
    };
    node.querySelector(".save-media").onclick = () => {
      saveMultimedia("Multimédia enregistré ✅");
      node.classList.add("collapsed");
      toggle.textContent = "Modifier";
    };
    node.querySelector(".remove").onclick = () => confirmCMSDelete("Supprimer cet élément ?", () => {
      const arr = data.multimedia[collection];
      data.multimedia[collection] = arr.filter(x => String(x.id) !== String(node.dataset.id));
      window.__skipMultimediaCollectOnce = true;
      renderFn();
      saveMultimedia("Élément supprimé ✅");
    });
  }

  function collectMediaVideos() {
    const list = document.getElementById("mediaVideosList");
    if (!list) return;
    const rendered = [...list.querySelectorAll(".media-admin-card")].map(card => {
      const obj = {};
      card.querySelectorAll("[data-field]").forEach(input => obj[input.dataset.field] = input.value.trim());
      obj.id = card.dataset.id || mediaUid();
      const old = data.multimedia.videos.find(x => String(x.id) === String(obj.id));
      obj.createdAt = old?.createdAt || new Date().toISOString();
      return obj;
    });
    if (rendered.length || list.querySelectorAll(".media-admin-card").length === 0) data.multimedia.videos = rendered;
  }

  function renderMediaVideosCMS() {
    ensureMultimediaData();
    const list = document.getElementById("mediaVideosList");
    const tpl = document.getElementById("mediaVideoTemplate");
    if (!list || !tpl) return;
    list.innerHTML = "";
    [...data.multimedia.videos].sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||""))).forEach((item, i) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = item.id || mediaUid();
      node.querySelector("strong").textContent = item.title || `Vidéo ${i+1}`;
      node.querySelectorAll("[data-field]").forEach(input => {
        const field = input.dataset.field;
        input.value = item[field] || "";
        input.addEventListener("input", () => {
          item[field] = input.value;
          if (field === "title") node.querySelector("strong").textContent = input.value || `Vidéo ${i+1}`;
          if (field === "thumb") mediaPreview(node, input.value, "Miniature");
          if (typeof markDirty === "function") markDirty();
        });
      });
      node.querySelector(".media-thumb-upload").onchange = async e => {
        const file = e.target.files?.[0]; if (!file) return;
        const url = await fileToDataURLSafe(file);
        item.thumb = url;
        node.querySelector('[data-field="thumb"]').value = url;
        mediaPreview(node, url, "Miniature");
      };
      node.querySelector(".media-video-upload").onchange = async e => {
        const file = e.target.files?.[0]; if (!file) return;
        const url = await fileToDataURLSafe(file);
        item.videoFile = url;
        node.querySelector('[data-field="videoFile"]').value = url;
        mediaPreview(node, url, "Vidéo");
      };
      bindCardBasics(node, "videos", item, renderMediaVideosCMS);
      mediaPreview(node, item.thumb, "Miniature");
      node.classList.add("collapsed");
      node.querySelector(".toggle-media").textContent = "Modifier";
      list.appendChild(node);
    });
  }

  function collectMediaPodcasts() {
    const list = document.getElementById("mediaPodcastsList");
    if (!list) return;
    const rendered = [...list.querySelectorAll(".media-admin-card")].map(card => {
      const obj = {};
      card.querySelectorAll("[data-field]").forEach(input => obj[input.dataset.field] = input.value.trim());
      obj.id = card.dataset.id || mediaUid();
      const old = data.multimedia.podcasts.find(x => String(x.id) === String(obj.id));
      obj.createdAt = old?.createdAt || new Date().toISOString();
      return obj;
    });
    if (rendered.length || list.querySelectorAll(".media-admin-card").length === 0) data.multimedia.podcasts = rendered;
  }

  function renderMediaPodcastsCMS() {
    ensureMultimediaData();
    const list = document.getElementById("mediaPodcastsList");
    const tpl = document.getElementById("mediaPodcastTemplate");
    if (!list || !tpl) return;
    list.innerHTML = "";
    [...data.multimedia.podcasts].sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||""))).forEach((item, i) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = item.id || mediaUid();
      node.querySelector("strong").textContent = item.title || `Podcast ${i+1}`;
      node.querySelectorAll("[data-field]").forEach(input => {
        const field = input.dataset.field;
        input.value = item[field] || "";
        input.addEventListener("input", () => {
          item[field] = input.value;
          if (field === "title") node.querySelector("strong").textContent = input.value || `Podcast ${i+1}`;
          if (field === "cover") mediaPreview(node, input.value, "Couverture");
          if (typeof markDirty === "function") markDirty();
        });
      });
      node.querySelector(".media-cover-upload").onchange = async e => {
        const file = e.target.files?.[0]; if (!file) return;
        const url = await fileToDataURLSafe(file);
        item.cover = url;
        node.querySelector('[data-field="cover"]').value = url;
        mediaPreview(node, url, "Couverture");
      };
      node.querySelector(".media-audio-upload").onchange = async e => {
        const file = e.target.files?.[0]; if (!file) return;
        const url = await fileToDataURLSafe(file);
        item.audioFile = url;
        node.querySelector('[data-field="audioFile"]').value = url;
        mediaPreview(node, url, "Audio");
      };
      bindCardBasics(node, "podcasts", item, renderMediaPodcastsCMS);
      mediaPreview(node, item.cover, "Couverture");
      node.classList.add("collapsed");
      node.querySelector(".toggle-media").textContent = "Modifier";
      list.appendChild(node);
    });
  }

  function collectMediaAlbums() {
    const list = document.getElementById("mediaAlbumsList");
    if (!list) return;
    const rendered = [...list.querySelectorAll(".media-admin-card")].map(card => {
      const obj = {};
      card.querySelectorAll("[data-field]").forEach(input => obj[input.dataset.field] = input.value.trim());
      obj.id = card.dataset.id || mediaUid();
      obj.images = (obj.imagesText || "").split(/\n+/).map(x => x.trim()).filter(Boolean);
      delete obj.imagesText;
      const old = data.multimedia.albums.find(x => String(x.id) === String(obj.id));
      obj.createdAt = old?.createdAt || new Date().toISOString();
      return obj;
    });
    if (rendered.length || list.querySelectorAll(".media-admin-card").length === 0) data.multimedia.albums = rendered;
  }

  function renderMediaAlbumsCMS() {
    ensureMultimediaData();
    const list = document.getElementById("mediaAlbumsList");
    const tpl = document.getElementById("mediaAlbumTemplate");
    if (!list || !tpl) return;
    list.innerHTML = "";
    [...data.multimedia.albums].sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||""))).forEach((item, i) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = item.id || mediaUid();
      node.querySelector("strong").textContent = item.title || `Album ${i+1}`;
      node.querySelectorAll("[data-field]").forEach(input => {
        const field = input.dataset.field;
        if (field === "imagesText") input.value = Array.isArray(item.images) ? item.images.join("\n") : "";
        else input.value = item[field] || "";
        input.addEventListener("input", () => {
          if (field === "imagesText") item.images = input.value.split(/\n+/).map(x=>x.trim()).filter(Boolean);
          else item[field] = input.value;
          if (field === "title") node.querySelector("strong").textContent = input.value || `Album ${i+1}`;
          if (field === "cover") mediaPreview(node, input.value, "Couverture");
          if (typeof markDirty === "function") markDirty();
        });
      });
      node.querySelector(".media-album-cover-upload").onchange = async e => {
        const file = e.target.files?.[0]; if (!file) return;
        const url = await fileToDataURLSafe(file);
        item.cover = url;
        node.querySelector('[data-field="cover"]').value = url;
        mediaPreview(node, url, "Couverture");
      };
      node.querySelector(".media-album-images-upload").onchange = async e => {
        const files = [...(e.target.files || [])];
        if (!files.length) return;
        const urls = [];
        for (const file of files) urls.push(await fileToDataURLSafe(file));
        item.images = [...(item.images || []), ...urls];
        node.querySelector('[data-field="imagesText"]').value = item.images.join("\n");
        mediaPreview(node, item.cover || item.images[0], "Photos ajoutées");
      };
      bindCardBasics(node, "albums", item, renderMediaAlbumsCMS);
      mediaPreview(node, item.cover || item.images?.[0], "Couverture");
      node.classList.add("collapsed");
      node.querySelector(".toggle-media").textContent = "Modifier";
      list.appendChild(node);
    });
  }

  function addMediaVideo() {
    collectMediaVideos();
    data.multimedia.videos.unshift({id:mediaUid(),title:"",desc:"",cat:"",date:new Date().toISOString().slice(0,10),views:"0",duration:"",videoId:"dQw4w9WgXcQ",videoFile:"",thumb:"",createdAt:new Date().toISOString()});
    renderMediaVideosCMS();
  }
  function addMediaPodcast() {
    collectMediaPodcasts();
    data.multimedia.podcasts.unshift({id:mediaUid(),ep:"",title:"",desc:"",date:new Date().toISOString().slice(0,10),duration:"",cover:"",audioFile:"",createdAt:new Date().toISOString()});
    renderMediaPodcastsCMS();
  }
  function addMediaAlbum() {
    collectMediaAlbums();
    data.multimedia.albums.unshift({id:mediaUid(),title:"",desc:"",date:new Date().toISOString().slice(0,10),location:"",cover:"",images:[],createdAt:new Date().toISOString()});
    renderMediaAlbumsCMS();
  }

  function switchMediaCmsTab(tab) {
    currentMediaTab = tab;
    document.querySelectorAll(".media-cms-tab").forEach(b => b.classList.toggle("active", b.dataset.mediaTab === tab));
    document.querySelectorAll(".media-cms-panel").forEach(p => p.classList.remove("active"));
    const id = tab === "videos" ? "mediaCmsVideos" : tab === "podcasts" ? "mediaCmsPodcasts" : "mediaCmsAlbums";
    document.getElementById(id)?.classList.add("active");
  }

  function initMultimediaCMS() {
    ensureMultimediaData();
    document.querySelectorAll(".media-cms-tab").forEach(btn => {
      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => switchMediaCmsTab(btn.dataset.mediaTab));
    });
    const videoBtn = document.getElementById("addMediaVideoBtn");
    if (videoBtn && videoBtn.dataset.bound !== "1") { videoBtn.dataset.bound = "1"; videoBtn.addEventListener("click", addMediaVideo); }
    const podcastBtn = document.getElementById("addMediaPodcastBtn");
    if (podcastBtn && podcastBtn.dataset.bound !== "1") { podcastBtn.dataset.bound = "1"; podcastBtn.addEventListener("click", addMediaPodcast); }
    const albumBtn = document.getElementById("addMediaAlbumBtn");
    if (albumBtn && albumBtn.dataset.bound !== "1") { albumBtn.dataset.bound = "1"; albumBtn.addEventListener("click", addMediaAlbum); }
    renderMediaVideosCMS();
    renderMediaPodcastsCMS();
    renderMediaAlbumsCMS();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMultimediaCMS();
    setTimeout(initMultimediaCMS, 500);
  });
  window.addEventListener("load", initMultimediaCMS);
})();


/* === CMS CONTACT === */
(function(){
  const DEFAULTS = {
    heroTitle:"Contactez-nous", heroText:"Notre équipe est à votre disposition pour toute question, partenariat ou signalement.",
    addressTitle:"Adresse", address:"Gaé, Dagana\n23002 Saint-Louis, Sénégal",
    phoneTitle:"Téléphone", phone1:"77 935 17 86", phone2:"77 605 95 76", phoneNote:"Service commercial",
    emailTitle:"E-mail", email:"gayainfopdg@gmail.com",
    hoursTitle:"Horaires", hours:"Lun–Ven : 08h00 – 18h00\nSam : 09h00 – 14h00",
    facebook:"https://www.facebook.com/gayainfotv", facebookLabel:"GAYA INFO TV",
    youtube:"https://www.youtube.com/@gayainfotv", youtubeLabel:"@gayainfotv",
    instagram:"#", instagramLabel:"@gayainfotv",
    formTitle:"Envoyez-nous un message", formText:"Nous vous répondrons dans les meilleurs délais.", formNote:"Réponse sous 24–48h ouvrables"
  };
  const map = {
    heroTitle:"contactHeroTitle", heroText:"contactHeroText", addressTitle:"contactAddressTitle", address:"contactAddress",
    phoneTitle:"contactPhoneTitle", phone1:"contactPhone1", phone2:"contactPhone2", phoneNote:"contactPhoneNote",
    email:"contactEmail", hoursTitle:"contactHoursTitle", hours:"contactHours",
    facebook:"contactFacebook", facebookLabel:"contactFacebookLabel", youtube:"contactYoutube", youtubeLabel:"contactYoutubeLabel",
    instagram:"contactInstagram", instagramLabel:"contactInstagramLabel", formTitle:"contactFormTitle", formText:"contactFormText", formNote:"contactFormNote"
  };
  function ensure(){ if(typeof data==="undefined") return; data.contact = {...DEFAULTS, ...(data.contact||{})}; }
  function fill(){ ensure(); if(typeof data==="undefined") return; Object.entries(map).forEach(([k,id])=>{ const el=document.getElementById(id); if(el) el.value=data.contact[k]||""; }); }
  function collect(){ ensure(); if(typeof data==="undefined") return; Object.entries(map).forEach(([k,id])=>{ const el=document.getElementById(id); if(el) data.contact[k]=el.value; }); }
  function save(){ collect(); if(typeof saveData==="function"){ try{ saveData("Contact enregistré ✅"); return; }catch(e){} } const payload=JSON.stringify(data); ["gayaCMSData","gayaCMS","gayaData","gaya_cms_v1"].forEach(k=>localStorage.setItem(k,payload)); if(typeof setStatus==="function") setStatus("Contact enregistré ✅"); }
  function init(){
    if(!document.getElementById("contactHeroTitle")) return;
    ensure(); fill();
    Object.values(map).forEach(id=>{ const el=document.getElementById(id); if(el && el.dataset.contactBound!=="1"){ el.dataset.contactBound="1"; el.addEventListener("input",()=>{ collect(); if(typeof markDirty==="function") markDirty(); }); }});
    const btn=document.getElementById("saveContactBtn");
    if(btn && btn.dataset.bound!=="1"){ btn.dataset.bound="1"; btn.addEventListener("click",save); }
  }
  document.addEventListener("DOMContentLoaded",()=>{ init(); setTimeout(init,500); });
  window.addEventListener("load",init);
})();

/* ===== LOGIN SUPABASE ===== */
(function() {
  const SESSION_KEY = 'gayaCMSSession';

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch(e) { return null; }
  }
  function setSession(username, role, email) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username, role, email: email || username, provider: 'supabase' }));
    localStorage.setItem('gayaCMSUsername', username);
  }
  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('gayaCMSUsername');
  }

  function applyUser(username, role) {
    username = username || 'Administrateur';
    role = role || 'Administrateur';
    const initial = username.charAt(0).toUpperCase();
    ['topbarAvatar','topbarDdAvatar','dashAvatarLarge'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = initial; });
    ['topbarUsername','topbarDdName','dashUsername'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = username; });
    ['topbarRole','topbarDdRole'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = role; });
  }

  function showAdmin(username, role) {
    const screen = document.getElementById('loginScreen');
    if (screen) { screen.classList.add('hidden'); setTimeout(() => screen.style.display = 'none', 300); }
    applyUser(username, role);
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
  }

  function showLogin() {
    const screen = document.getElementById('loginScreen');
    if (screen) { screen.style.display = 'flex'; requestAnimationFrame(() => screen.classList.remove('hidden')); }
  }

  function initLogin() {
    const session = getSession();
    if (session && session.username && session.provider === 'supabase') showAdmin(session.username, session.role || 'Administrateur');
    else showLogin();

    const loginBtn = document.getElementById('loginBtn');
    const loginInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const errorEl = document.getElementById('loginError');
    const errorText = document.getElementById('loginErrorText');

    async function tryLogin(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); }
      const email = (loginInput ? loginInput.value.trim() : '');
      const password = passwordInput ? passwordInput.value : '';
      if (!email || !password) {
        if (errorText) errorText.textContent = 'Saisis ton e-mail Supabase et ton mot de passe.';
        if (errorEl) errorEl.style.display = 'flex';
        return false;
      }
      if (loginBtn) loginBtn.disabled = true;
      const res = window.gayaCMSLogin ? await window.gayaCMSLogin(email, password) : { ok:false, message:"Supabase n'est pas chargé." };
      if (loginBtn) loginBtn.disabled = false;
      if (res && res.ok) {
        if (errorEl) errorEl.style.display = 'none';
        setSession(res.displayName || email, res.role || 'Administrateur', email);
        showAdmin(res.displayName || email, res.role || 'Administrateur');
        return true;
      }
      if (errorText) errorText.textContent = (res && res.message) || 'Identifiant ou mot de passe incorrect.';
      if (errorEl) errorEl.style.display = 'flex';
      if (passwordInput) { passwordInput.value = ''; passwordInput.focus(); }
      return false;
    }

    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn && passwordInput) {
      togglePasswordBtn.addEventListener('click', function() {
        const isPass = passwordInput.type === 'password';
        passwordInput.type = isPass ? 'text' : 'password';
        const openEye = togglePasswordBtn.querySelector('.eye-open');
        const closedEye = togglePasswordBtn.querySelector('.eye-closed');
        if (openEye) openEye.style.display = isPass ? 'none' : '';
        if (closedEye) closedEye.style.display = isPass ? '' : 'none';
      });
    }
    if (loginBtn) loginBtn.addEventListener('click', tryLogin, true);
    if (passwordInput) passwordInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(e); }, true);
    if (loginInput) loginInput.addEventListener('keydown', e => { if (e.key === 'Enter') passwordInput && passwordInput.focus(); });

    const userBtn = document.getElementById('topbarUserBtn');
    const dropdown = document.getElementById('topbarDropdown');
    if (userBtn && dropdown) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        dropdown.classList.toggle('open', !isOpen);
        userBtn.classList.toggle('open', !isOpen);
      });
      document.addEventListener('click', () => { dropdown.classList.remove('open'); userBtn.classList.remove('open'); });
      dropdown.addEventListener('click', e => e.stopPropagation());
    }

    const ddProfileBtn = document.getElementById('ddProfileBtn');
    if (ddProfileBtn) {
      ddProfileBtn.addEventListener('click', () => {
        dropdown && dropdown.classList.remove('open');
        userBtn && userBtn.classList.remove('open');
        showProfileModal();
      });
    }

    const ddLogoutBtn = document.getElementById('ddLogoutBtn');
    if (ddLogoutBtn) {
      ddLogoutBtn.addEventListener('click', async () => {
        clearSession();
        if (window.gayaCMSLogout) await window.gayaCMSLogout();
        location.reload();
      });
    }
  }

  /* Modale profil simple */
  function showProfileModal() {
    const session = getSession() || {};
    let modal = document.getElementById('profileModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'profileModal';
      modal.innerHTML = `
        <div class="profile-modal-overlay" id="profileModalOverlay">
          <div class="profile-modal-card">
            <div class="profile-modal-head">
              <h3>Mon profil</h3>
              <button id="profileModalClose" class="profile-close-btn">✕</button>
            </div>
            <div class="profile-avatar-big" id="profileAvatarBig">${(session.username||'A').charAt(0).toUpperCase()}</div>
            <div class="profile-form">
              <label class="profile-label">Nom d’utilisateur
                <input type="text" id="profileUsernameInput" class="profile-input" value="${session.username||''}">
              </label>
              <label class="profile-label">Prénom
                <input type="text" id="profileFirstName" class="profile-input" value="${(() => { try { return (JSON.parse(localStorage.getItem('gayaCMSProfile') || '{}').firstName) || ''; } catch(e) { return ''; } })()}">
              </label>
              <label class="profile-label">Nom
                <input type="text" id="profileLastName" class="profile-input" value="${(() => { try { return (JSON.parse(localStorage.getItem('gayaCMSProfile') || '{}').lastName) || ''; } catch(e) { return ''; } })()}">
              </label>
              <label class="profile-label">Nouveau mot de passe
                <input type="password" id="profileNewPassword" class="profile-input" placeholder="À changer dans Supabase Auth" disabled>
              </label>
              <label class="profile-label">Confirmer le mot de passe
                <input type="password" id="profileConfirmPassword" class="profile-input" placeholder="À changer dans Supabase Auth" disabled>
              </label>
              <p class="profile-error" id="profileError"></p>
              <button class="profile-save-btn" id="profileSaveBtn">Enregistrer</button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(modal);
      document.getElementById('profileModalClose').addEventListener('click', () => modal.remove());
      document.getElementById('profileModalOverlay').addEventListener('click', (e) => { if (e.target === document.getElementById('profileModalOverlay')) modal.remove(); });
      document.getElementById('profileSaveBtn').addEventListener('click', () => {
        const newName = document.getElementById('profileUsernameInput').value.trim();
        const firstName = (document.getElementById('profileFirstName')?.value || '').trim();
        const lastName = (document.getElementById('profileLastName')?.value || '').trim();
        const newPwd = '';
        const confirmPwd = '';
        const errEl = document.getElementById('profileError');
        if (!newName) { (function(){var _e=document.getElementById('loginError'),_t=document.getElementById('loginErrorText');if(_t)_t.textContent='Le nom ne peut pas être vide.';if(_e)_e.style.display='flex';})(); return; }
        if (newPwd && newPwd !== confirmPwd) { (function(){var _e=document.getElementById('loginError'),_t=document.getElementById('loginErrorText');if(_t)_t.textContent='Les mots de passe ne correspondent pas.';if(_e)_e.style.display='flex';})(); return; }
        // Changement de mot de passe : à faire dans Supabase Auth, pas dans le navigateur.
        // Save full name profile
        localStorage.setItem('gayaCMSProfile', JSON.stringify({ firstName, lastName }));
        setSession(newName, 'Administrateur');
        applyUser(newName, 'Administrateur');
        // Update avatar with initials
        const initials = ((firstName.charAt(0)||'') + (lastName.charAt(0)||'')).toUpperCase() || newName.charAt(0).toUpperCase();
        ['topbarAvatar','topbarDdAvatar','dashAvatarLarge'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = initials; });
        errEl.style.color = '#34d399'; (function(){var _e=document.getElementById('loginError'),_t=document.getElementById('loginErrorText');if(_t)_t.textContent='Profil mis à jour ✅';if(_e)_e.style.display='flex';})();
        setTimeout(() => modal.remove(), 1200);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLogin);
  else initLogin();
})();

/* ===== DASHBOARD ===== */
function updateDashboardStats() {
  const d = loadData();
  const statArticles = document.getElementById('statArticles');
  const statEmissions = document.getElementById('statEmissions');
  const statSlides = document.getElementById('statSlides');
  const statContact = document.getElementById('statContact');
  if (statArticles) statArticles.textContent = (d.articles || []).length;
  if (statSlides) statSlides.textContent = (d.slides || []).length;
  if (statContact) statContact.textContent = d.contactHeroTitle ? '✓' : '—';
  const emissionKeys = ['societe', 'economie', 'religion', 'sport', 'faitsdivers'];
  let totalEpisodes = 0;
  emissionKeys.forEach(k => {
    const episodes = d.emissions?.[k]?.episodes || d[k + 'Episodes'] || d['emissions_' + k] || [];
    totalEpisodes += Array.isArray(episodes) ? episodes.length : 0;
  });
  if (statEmissions) statEmissions.textContent = totalEpisodes;
}

function initDashboard() {
  // Live clock
  function updateClock() {
    const el = document.getElementById('dashDatetime');
    if (!el) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    el.innerHTML = `<span class="dash-time">${timeStr}</span><span class="dash-date">${dateStr}</span>`;
  }
  updateClock();
  setInterval(updateClock, 30000);
  updateDashboardStats();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initDashboard);
else { if (document.getElementById('dashDatetime')) initDashboard(); else document.addEventListener('DOMContentLoaded', initDashboard); }

/* ===== GESTION DES ÉDITEURS ===== */
(function() {
  const EDITORS_KEY = 'gayaCMSEditors';
  const PERM_LABELS = {
    homeView: 'Accueil',
    newsView: 'Actualités',
    emissionsAllView: 'Émissions',
    multimediaView: 'Multimédia',
    contactView: 'Contact'
  };

  function getEditors() {
    try {
      const remote = (typeof window.gayaCMSRead === 'function') ? window.gayaCMSRead() : null;
      if (remote && Array.isArray(remote.editors)) {
        localStorage.setItem(EDITORS_KEY, JSON.stringify(remote.editors));
        return remote.editors;
      }
    } catch(e) {}
    try { return JSON.parse(localStorage.getItem(EDITORS_KEY) || '[]'); } catch(e) { return []; }
  }
  function saveEditors(list) {
    const clean = Array.isArray(list) ? list : [];
    localStorage.setItem(EDITORS_KEY, JSON.stringify(clean));
    try {
      data.editors = clean;
      if (typeof window.gayaCMSWrite === 'function') window.gayaCMSWrite(data);
      else if (typeof saveData === 'function') saveData('Utilisateurs enregistrés ✅');
    } catch(e) {
      try {
        const current = (typeof window.gayaCMSRead === 'function' ? window.gayaCMSRead() : {}) || {};
        current.editors = clean;
        if (typeof window.gayaCMSWrite === 'function') window.gayaCMSWrite(current);
      } catch(_e) {}
    }
  }

  function renderEditorsList() {
    const list = document.getElementById('editorsList');
    const emptyMsg = document.getElementById('editorsEmptyMsg');
    if (!list) return;
    const editors = getEditors();
    // Remove old cards
    list.querySelectorAll('.editor-card-item').forEach(el => el.remove());
    if (!editors.length) {
      if (emptyMsg) emptyMsg.style.display = '';
      return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';
    editors.forEach((editor, idx) => {
      const permLabels = (editor.permissions || []).map(p => PERM_LABELS[p] || p).join(', ') || 'Aucun accès';
      const fullName = ((editor.firstName||'') + ' ' + (editor.lastName||'')).trim() || editor.username;
      const initials = ((editor.firstName||'').charAt(0) + (editor.lastName||'').charAt(0)).toUpperCase() || editor.username.charAt(0).toUpperCase();
      const card = document.createElement('div');
      card.className = 'editor-card-item';
      card.innerHTML = `
        <div class="editor-card-info">
          <div class="editor-avatar">${initials}</div>
          <div>
            <div class="editor-name">${fullName} <span style="color:#6b7280;font-weight:400;font-size:12px">(${editor.username})</span></div>
            <div class="editor-perms">Accès : ${permLabels}</div>
          </div>
        </div>
        <div class="editor-actions">
          <button class="btn-edit" data-idx="${idx}">✏️ Modifier</button>
          <button class="btn-delete" data-idx="${idx}">🗑️ Supprimer</button>
        </div>`;
      list.appendChild(card);
    });
  }

  function openEditorForm(existingIdx = null) {
    const panel = document.getElementById('editorFormPanel');
    const title = document.getElementById('editorFormTitle');
    const usernameInput = document.getElementById('editorUsername');
    const passwordInput = document.getElementById('editorPassword');
    const errorEl = document.getElementById('editorFormError');
    const checkboxes = document.querySelectorAll('input[name="perm"]');
    if (!panel) return;

    (function(){var t=document.getElementById('loginErrorText');if(t)t.textContent='';if(errorEl)errorEl.style.display='';})() ;
    checkboxes.forEach(cb => cb.checked = false);

    if (existingIdx !== null) {
      const editors = getEditors();
      const editor = editors[existingIdx];
      usernameInput.value = editor.username;
      passwordInput.value = ''; if (passwordInput) passwordInput.placeholder = 'Géré par Supabase Auth';
      const fnInput = document.getElementById('editorFirstName');
      const lnInput = document.getElementById('editorLastName');
      if (fnInput) fnInput.value = editor.firstName || '';
      if (lnInput) lnInput.value = editor.lastName || '';
      (editor.permissions || []).forEach(p => {
        const cb = document.querySelector(`input[name="perm"][value="${p}"]`);
        if (cb) cb.checked = true;
      });
      title.textContent = 'Modifier l\'éditeur';
      panel.dataset.editingIdx = existingIdx;
    } else {
      usernameInput.value = '';
      passwordInput.value = '';
      const fnIn = document.getElementById('editorFirstName');
      const lnIn = document.getElementById('editorLastName');
      if (fnIn) fnIn.value = '';
      if (lnIn) lnIn.value = '';
      title.textContent = 'Nouvel éditeur';
      delete panel.dataset.editingIdx;
    }
    panel.style.display = '';
    usernameInput.focus();
  }

  function closeEditorForm() {
    const panel = document.getElementById('editorFormPanel');
    if (panel) panel.style.display = 'none';
  }

  function handleSaveEditor() {
    const panel = document.getElementById('editorFormPanel');
    const usernameInput = document.getElementById('editorUsername');
    const passwordInput = document.getElementById('editorPassword');
    const errorEl = document.getElementById('editorFormError');
    const checkboxes = document.querySelectorAll('input[name="perm"]:checked');

    const username = usernameInput.value.trim();
    const password = ''; // mots de passe éditeurs locaux désactivés
    const firstName = (document.getElementById('editorFirstName')?.value || '').trim();
    const lastName = (document.getElementById('editorLastName')?.value || '').trim();
    const permissions = [...checkboxes].map(cb => cb.value);

    if (!firstName) { (function(){var t=document.getElementById('loginErrorText');if(t)t.textContent='Le prénom est requis.';if(errorEl)errorEl.style.display='flex';})() ; return; }
    if (!lastName) { (function(){var t=document.getElementById('loginErrorText');if(t)t.textContent='Le nom est requis.';if(errorEl)errorEl.style.display='flex';})() ; return; }
    if (!username) { (function(){var t=document.getElementById('loginErrorText');if(t)t.textContent="Le nom d'utilisateur est requis.";if(errorEl)errorEl.style.display='flex';})(); return; }

    const editors = getEditors();
    const editingIdx = panel.dataset.editingIdx !== undefined ? parseInt(panel.dataset.editingIdx) : null;

    // Check for duplicate username
    const duplicate = editors.findIndex((e, i) => e.username.toLowerCase() === username.toLowerCase() && i !== editingIdx);
    if (duplicate !== -1) { (function(){var t=document.getElementById('loginErrorText');if(t)t.textContent="Ce nom d'utilisateur est déjà utilisé.";if(errorEl)errorEl.style.display='flex';})(); return; }

    if (editingIdx !== null) {
      editors[editingIdx] = { username, firstName, lastName, permissions };
    } else {
      editors.push({ username, firstName, lastName, permissions });
    }

    saveEditors(editors);
    renderEditorsList();
    closeEditorForm();
  }

  function initEditorsView() {
    const addBtn = document.getElementById('addEditorBtn');
    const saveBtn = document.getElementById('saveEditorBtn');
    const cancelBtn = document.getElementById('cancelEditorBtn');
    const list = document.getElementById('editorsList');

    if (addBtn) addBtn.addEventListener('click', () => openEditorForm());
    if (saveBtn) saveBtn.addEventListener('click', handleSaveEditor);
    if (cancelBtn) cancelBtn.addEventListener('click', closeEditorForm);

    if (list) {
      list.addEventListener('click', e => {
        const editBtn = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');
        if (editBtn) {
          openEditorForm(parseInt(editBtn.dataset.idx));
        } else if (deleteBtn) {
          const idx = parseInt(deleteBtn.dataset.idx);
          const editors = getEditors();
          const name = editors[idx]?.username;
          if (confirm(`Supprimer l'éditeur "${name}" ?`)) {
            editors.splice(idx, 1);
            saveEditors(editors);
            renderEditorsList();
          }
        }
      });
    }

    renderEditorsList();
  }

  // Connexion des éditeurs créés dans le CMS
  function applyEditorSession(match) {
    const fullName = ((match.firstName || '') + ' ' + (match.lastName || '')).trim() || match.username;
    try {
      const session = { username: match.username, role: 'Éditeur', permissions: match.permissions || [] };
      localStorage.setItem('gayaCMSSession', JSON.stringify(session));
      localStorage.setItem('gayaCMSUsername', match.username);
      localStorage.setItem('gayaCMSProfile', JSON.stringify({ firstName: match.firstName || '', lastName: match.lastName || '' }));
    } catch(e) {}
    const screen = document.getElementById('loginScreen');
    if (screen) { screen.classList.add('hidden'); setTimeout(() => screen.style.display = 'none', 300); }
    const initials = ((match.firstName || '').charAt(0) + (match.lastName || '').charAt(0)).toUpperCase() || match.username.charAt(0).toUpperCase();
    ['topbarAvatar','topbarDdAvatar','dashAvatarLarge'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = initials; });
    ['topbarUsername','topbarDdName','dashUsername'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = fullName; });
    ['topbarRole','topbarDdRole'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = 'Éditeur'; });
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      const view = btn.dataset.view;
      if (view && !(match.permissions || []).includes(view) && view !== 'dashboardView') btn.style.display = 'none';
    });
    const editorsNavBtn = document.querySelector('[data-view="editorsView"]');
    if (editorsNavBtn) editorsNavBtn.style.display = 'none';
    return true;
  }

  function tryEditorLoginNow() {
    const loginInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const errorEl = document.getElementById('loginError');
    const username = loginInput ? loginInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    if (!username || !password) return false;
    const editors = getEditors();
    const match = editors.find(e => String(e.username || '').toLowerCase() === username.toLowerCase() && String(e.password || '') === password);
    if (!match) return false;
    if (errorEl) errorEl.style.display = 'none';
    return applyEditorSession(match);
  }

  function patchLogin() {
    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('loginPassword');
    if (loginBtn) {
      loginBtn.addEventListener('click', function(e) {
        if (tryEditorLoginNow()) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
        }
      }, true);
    }
    if (passwordInput) {
      passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && tryEditorLoginNow()) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
        }
      }, true);
    }
    if (typeof window.gayaCMSOnUpdate === 'function') {
      window.gayaCMSOnUpdate(function(remote) {
        if (remote && Array.isArray(remote.editors)) localStorage.setItem(EDITORS_KEY, JSON.stringify(remote.editors));
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initEditorsView();
    patchLogin();
  });
})();

/* Feedback visible pour tous les boutons Enregistrer du CMS */
document.addEventListener("click", function(e) {
  const btn = e.target.closest("button");
  if (!btn) return;
  const label = (btn.textContent || "").toLowerCase();
  if (label.includes("enregistrer")) {
    setTimeout(() => {
      if (typeof window.showSaveToast === "function") window.showSaveToast("Enregistré ✅");
      if (typeof setStatus === "function") {
        const st = document.getElementById("status");
        if (st && !/erreur/i.test(st.textContent || "")) setStatus(st.textContent || "Enregistré ✅");
      }
    }, 120);
  }
}, true);


/* === Feedback visible sur tous les boutons Enregistrer === */
(function(){
  function isSaveButton(btn){
    if (!btn || btn.tagName !== "BUTTON") return false;
    const txt = (btn.textContent || "").toLowerCase();
    return txt.includes("enregistrer") || btn.id === "saveCurrentPageBtn" || btn.id === "saveContactBtn" || btn.id === "saveEditorBtn" || btn.className.includes("save-");
  }
  function flashButton(btn, msg){
    if (!btn || btn.dataset.savingFlash === "1") return;
    const original = btn.dataset.originalText || btn.textContent;
    btn.dataset.originalText = original;
    btn.dataset.savingFlash = "1";
    btn.classList.add("cms-save-success");
    btn.textContent = msg || "Enregistré ✅";
    clearTimeout(btn._cmsSaveTimer);
    btn._cmsSaveTimer = setTimeout(() => {
      btn.textContent = btn.dataset.originalText || original;
      btn.classList.remove("cms-save-success");
      btn.dataset.savingFlash = "0";
    }, 2200);
  }
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!isSaveButton(btn)) return;
    setTimeout(() => {
      flashButton(btn, "Enregistré ✅");
      if (typeof window.showSaveToast === "function") window.showSaveToast("Enregistré ✅");
    }, 250);
  }, true);
  window.cmsFlashSaveButton = flashButton;
})();

/* === FIX FINAL CMS : sauvegarde Société complète + message sur tous les boutons === */
(function(){
  function toast(msg){
    msg = msg || 'Enregistré ✅';
    if (typeof window.showSaveToast === 'function') window.showSaveToast(msg);
    const st = document.getElementById('status');
    if (st) { st.textContent = msg; st.style.display = 'inline-flex'; }
  }
  function uidLocal(){ return (typeof uid === 'function') ? uid() : Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
  function ensure(){
    window.data = window.data || (typeof data !== 'undefined' ? data : {});
    if (typeof data === 'undefined') return null;
    data.emissions = data.emissions || {};
    data.emissions.societe = data.emissions.societe || { episodes: [], programmes: [], featuredEpisodeId: '' };
    data.emissions.societe.episodes = Array.isArray(data.emissions.societe.episodes) ? data.emissions.societe.episodes : [];
    data.emissions.societe.programmes = Array.isArray(data.emissions.societe.programmes) ? data.emissions.societe.programmes : [];
    return data.emissions.societe;
  }
  function collectCards(listSelector, cardSelector){
    const list = document.querySelector(listSelector);
    if (!list) return null;
    const cards = [...list.querySelectorAll(cardSelector)];
    if (!cards.length) return [];
    return cards.map(card => {
      const obj = { id: card.dataset.id || uidLocal() };
      card.querySelectorAll('[data-field]').forEach(input => obj[input.dataset.field] = (input.value || '').trim());
      obj.createdAt = obj.createdAt || new Date().toISOString();
      return obj;
    });
  }
  window.collectSocieteEverywhere = function(){
    const soc = ensure();
    if (!soc) return;
    const specificEpisodes = collectCards('#societeEpisodesList', '.societe-episode-card');
    const genericEpisodes = collectCards('#emissionEpisodesList', '.emission-episode-card');
    const specificProgrammes = collectCards('#societeProgrammesList', '.societe-programme-card');
    const genericProgrammes = collectCards('#emissionProgrammesList', '.emission-programme-card');
    const activeTab = document.querySelector('.emission-admin-tab.active')?.dataset.emission || 'societe';

    if (activeTab === 'societe') {
      if (genericEpisodes && genericEpisodes.length) soc.episodes = genericEpisodes;
      if (specificEpisodes && specificEpisodes.length) soc.episodes = specificEpisodes;
      if (genericProgrammes && genericProgrammes.length) soc.programmes = genericProgrammes;
      if (specificProgrammes && specificProgrammes.length) soc.programmes = specificProgrammes;
    }

    const fs = document.getElementById('emissionFeaturedSelect') || document.getElementById('societeFeaturedEpisodeSelect');
    if (fs && activeTab === 'societe') soc.featuredEpisodeId = fs.value || soc.featuredEpisodeId || '';

    // Compatibilité : on écrit aussi les anciennes clés pour éviter que la page lise une branche vide.
    data.societeEpisodes = soc.episodes;
    data.societeProgrammes = soc.programmes;
    data.societeFeaturedEpisodeId = soc.featuredEpisodeId || '';
  };
  window.saveSocieteEverywhere = function(message){
    try {
      if (typeof collectGeneral === 'function') collectGeneral();
      if (typeof collectSlidesFromDOM === 'function') collectSlidesFromDOM();
      if (typeof collectArticlesFromDOM === 'function') collectArticlesFromDOM();
      if (typeof window.collectCurrentEmissionCMS === 'function') window.collectCurrentEmissionCMS();
      window.collectSocieteEverywhere();
      data.__cmsUpdatedAt = Date.now();
  data.__forceReplace = true;
      if (window.gayaCMSWrite) window.gayaCMSWrite(data);
      else {
        const payload = JSON.stringify(data);
        ["gayaCMSData", "gayaCMS", "gayaData", "gaya_cms_v1"].forEach(k => localStorage.setItem(k, payload));
        window.dispatchEvent(new Event('gaya-cms-updated'));
      }
      toast(message || 'Page enregistrée ✅');
    } catch(e) {
      console.error('Sauvegarde Société échouée', e);
      toast('Erreur : non enregistré ❌');
    }
  };

  document.addEventListener('click', function(e){
    const saveBtn = e.target.closest('#saveCurrentPageBtn, #saveBtn, #saveEditorBtn, .save-emission-episode, .save-emission-programme, .save-societe-episode, .save-societe-programme, .save-slide, .save-article, .save-media, #saveContactBtn');
    if (!saveBtn) return;
    const activeEmission = document.querySelector('.emission-admin-tab.active')?.dataset.emission;
    if (activeEmission === 'societe' || document.getElementById('emissionsAllView')?.classList.contains('active')) {
      setTimeout(() => window.saveSocieteEverywhere('Enregistré ✅'), 30);
    } else {
      setTimeout(() => toast('Enregistré ✅'), 80);
    }
  }, true);
})();


/* === FIX v16 : journal éditeurs uniquement + permissions CMS propres === */
(function(){
  const EDITORS_KEY = 'gayaCMSEditors';
  const LOG_KEY = 'gayaCMSActivityLog';
  const ADMIN_USERS = []; // anciens comptes admin en dur supprimés
  const MAX_LOGS = 250;

  function parse(v, fallback){ try { return JSON.parse(v); } catch(e) { return fallback; } }
  function readCMS(){ try { return (typeof window.gayaCMSRead === 'function' ? window.gayaCMSRead() : {}) || {}; } catch(e) { return {}; } }
  function writeCMS(d){ try { if (typeof window.gayaCMSWrite === 'function') { d.__forceReplace = true; window.gayaCMSWrite(d); return true; } } catch(e) {} return false; }

  function isAdminSession(){
    const s = parse(localStorage.getItem('gayaCMSSession') || '{}', {});
    const u = String(s.username || localStorage.getItem('gayaCMSUsername') || '').toLowerCase();
    const r = String(s.role || '').toLowerCase();
    return r.includes('admin') || r.includes('administrateur') || ADMIN_USERS.includes(u);
  }
  function session(){ return parse(localStorage.getItem('gayaCMSSession') || '{}', {}); }

  function readEditors(){
    const cms = readCMS();
    let list = Array.isArray(cms.editors) ? cms.editors : parse(localStorage.getItem(EDITORS_KEY) || '[]', []);
    list = Array.isArray(list) ? list : [];
    try { localStorage.setItem(EDITORS_KEY, JSON.stringify(list)); } catch(e) {}
    return list;
  }
  function saveEditors(list){
    list = Array.isArray(list) ? list : [];
    try { localStorage.setItem(EDITORS_KEY, JSON.stringify(list)); } catch(e) {}
    const cms = readCMS();
    cms.editors = list;
    writeCMS(cms);
    return list;
  }
  function fullEditorName(editor){
    return (((editor && editor.firstName) || '') + ' ' + ((editor && editor.lastName) || '')).trim() || (editor && editor.username) || 'Utilisateur';
  }
  function currentEditorName(){
    const s = session();
    const p = parse(localStorage.getItem('gayaCMSProfile') || '{}', {});
    const full = ((p.firstName || '') + ' ' + (p.lastName || '')).trim();
    return full || s.displayName || s.username || 'Utilisateur';
  }

  function readLogs(){
    const cms = readCMS();
    let logs = Array.isArray(cms.activityLog) ? cms.activityLog : parse(localStorage.getItem(LOG_KEY) || '[]', []);
    logs = Array.isArray(logs) ? logs : [];
    // Journal demandé : on garde seulement les activités des éditeurs/utilisateurs, pas celles de l'admin.
    return logs.filter(l => {
      const role = String(l.role || '').toLowerCase();
      const user = String(l.username || '').toLowerCase();
      return !(role.includes('admin') || role.includes('administrateur') || ADMIN_USERS.includes(user) || user === 'administrateur');
    });
  }
  function saveLogs(logs){
    logs = (Array.isArray(logs) ? logs : []).slice(0, MAX_LOGS);
    try { localStorage.setItem(LOG_KEY, JSON.stringify(logs)); } catch(e) {}
    const cms = readCMS();
    cms.activityLog = logs;
    writeCMS(cms);
  }
  function compactDate(iso){
    try { return new Date(iso).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }); } catch(e) { return ''; }
  }
  function sectionName(){
    const active = document.querySelector('.admin-view.active');
    const map = { dashboardView:'Dashboard', homeView:'Accueil', newsView:'Actualités', emissionsAllView:'Émissions', multimediaView:'Multimédia', contactView:'Contact', editorsView:'Utilisateurs' };
    return active ? (map[active.id] || 'CMS') : 'CMS';
  }
  function addLog(type, description, section, actor, forcedRole){
    if (isAdminSession() && !forcedRole) return; // ne pas enregistrer les actions de l'administrateur
    const s = session();
    const role = forcedRole || s.role || 'Éditeur';
    if (String(role).toLowerCase().includes('admin')) return;
    const username = actor || currentEditorName();
    const now = Date.now();
    const key = [type, username, description, section].join('|');
    if (window.__gayaV16LastLogKey === key && now - (window.__gayaV16LastLogAt || 0) < 1800) return;
    window.__gayaV16LastLogKey = key;
    window.__gayaV16LastLogAt = now;
    const logs = readLogs();
    logs.unshift({ id: now + Math.random(), type: type || 'modification', username, role, description: description || '', section: section || sectionName(), timestamp: new Date().toISOString() });
    saveLogs(logs);
    setTimeout(renderActivity, 60);
  }
  window.gayaLogActivity = function(type, username, description, section){ addLog(type, description, section, username); };

  function populateUsers(){
    const select = document.getElementById('activityFilterUser');
    if (!select) return;
    const keep = select.value;
    while (select.options.length > 1) select.remove(1);
    const fromEditors = readEditors().map(fullEditorName);
    const fromLogs = readLogs().map(l => l.username).filter(Boolean);
    [...new Set(fromEditors.concat(fromLogs))].filter(Boolean).sort().forEach(name => {
      const opt = document.createElement('option'); opt.value = name; opt.textContent = name; select.appendChild(opt);
    });
    if ([...select.options].some(o => o.value === keep)) select.value = keep;
  }
  function renderActivity(){
    const container = document.getElementById('activityLog');
    if (!container) return;
    populateUsers();
    const empty = document.getElementById('activityEmptyMsg');
    const filterUser = document.getElementById('activityFilterUser')?.value || '';
    const filterType = document.getElementById('activityFilterType')?.value || '';
    let logs = readLogs();
    if (filterUser) logs = logs.filter(x => String(x.username || '').toLowerCase() === filterUser.toLowerCase());
    if (filterType) logs = logs.filter(x => x.type === filterType);
    container.querySelectorAll('.activity-entry').forEach(x => x.remove());
    if (!logs.length) { if (empty) empty.style.display = ''; return; }
    if (empty) empty.style.display = 'none';
    const labels = { ajout:'Ajout', modification:'Modif.', suppression:'Suppr.', connexion:'Connexion', deconnexion:'Sortie' };
    logs.forEach(entry => {
      const item = document.createElement('div');
      item.className = 'activity-entry activity-entry-compact';
      item.innerHTML = '<div class="activity-mainline"><strong class="activity-user">'+(entry.username||'Utilisateur')+'</strong>'+
        '<span class="activity-badge '+(entry.type||'')+'">'+(labels[entry.type]||'Activité')+'</span>'+
        '<span class="activity-desc">'+(entry.description||'')+'</span></div>'+
        '<div class="activity-meta"><span>'+(entry.section||'CMS')+'</span><span>'+compactDate(entry.timestamp)+'</span></div>';
      container.appendChild(item);
    });
  }

  function applyEditorPermissions(editor){
    const permissions = Array.isArray(editor.permissions) ? editor.permissions : [];
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      const view = btn.dataset.view;
      if (!view) return;
      const allowed = view === 'dashboardView' || permissions.includes(view);
      btn.style.display = allowed ? '' : 'none';
      btn.disabled = !allowed;
    });
    const editorsBtn = document.querySelector('[data-view="editorsView"]');
    if (editorsBtn) { editorsBtn.style.display = 'none'; editorsBtn.disabled = true; }
    const current = document.querySelector('.admin-view.active')?.id;
    const firstAllowed = permissions[0] || 'dashboardView';
    if (current && current !== 'dashboardView' && !permissions.includes(current)) {
      const btn = document.querySelector('.admin-nav-btn[data-view="'+firstAllowed+'"]') || document.querySelector('.admin-nav-btn[data-view="dashboardView"]');
      if (btn) btn.click();
    }
  }

  function applyEditorSession(editor){
    const full = fullEditorName(editor);
    const sessionObj = { username: editor.username, role: 'Éditeur', permissions: editor.permissions || [] };
    localStorage.setItem('gayaCMSSession', JSON.stringify(sessionObj));
    localStorage.setItem('gayaCMSUsername', editor.username);
    localStorage.setItem('gayaCMSProfile', JSON.stringify({ firstName: editor.firstName || '', lastName: editor.lastName || '' }));
    const login = document.getElementById('loginScreen');
    if (login) { login.classList.add('hidden'); login.style.display = 'none'; }
    const initials = ((editor.firstName || '').charAt(0) + (editor.lastName || '').charAt(0)).toUpperCase() || String(editor.username || 'U').charAt(0).toUpperCase();
    ['topbarAvatar','topbarDdAvatar','dashAvatarLarge'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = initials; });
    ['topbarUsername','topbarDdName','dashUsername'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = full; });
    ['topbarRole','topbarDdRole'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = 'Éditeur'; });
    applyEditorPermissions(editor);
    addLog('connexion', 'Connexion au CMS', 'Authentification', full, 'Éditeur');
  }

  function editorMatch(username, password){
    username = String(username || '').trim().toLowerCase();
    password = String(password || '');
    return undefined; // Connexion éditeur locale désactivée : utiliser Supabase Auth
  }
  function patchEditorLogin(){
    const loginBtn = document.getElementById('loginBtn');
    const loginInput = document.getElementById('loginUsername');
    const passInput = document.getElementById('loginPassword');
    const error = document.getElementById('loginError');
    function handle(e){
      const username = (loginInput?.value || '').trim();
      const password = passInput?.value || '';
      if (!username || !password || ADMIN_USERS.includes(username.toLowerCase())) return;
      const match = editorMatch(username, password);
      if (!match) return;
      e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      if (error) error.style.display = 'none';
      applyEditorSession(match);
    }
    if (loginBtn && loginBtn.dataset.v16EditorLogin !== '1') { loginBtn.dataset.v16EditorLogin = '1'; loginBtn.addEventListener('click', handle, true); }
    if (passInput && passInput.dataset.v16EditorLogin !== '1') { passInput.dataset.v16EditorLogin = '1'; passInput.addEventListener('keydown', e => { if (e.key === 'Enter') handle(e); }, true); }
  }

  function patchSaveDelete(){
    const saveBtn = document.getElementById('saveEditorBtn');
    if (saveBtn && saveBtn.dataset.v16SaveEditor !== '1') {
      saveBtn.dataset.v16SaveEditor = '1';
      saveBtn.addEventListener('click', () => setTimeout(() => saveEditors(readEditors()), 350), false);
    }
    const list = document.getElementById('editorsList');
    if (list && list.dataset.v16DeleteEditor !== '1') {
      list.dataset.v16DeleteEditor = '1';
      list.addEventListener('click', () => setTimeout(() => saveEditors(readEditors()), 500), false);
    }
  }
  function patchContentSaveLog(){
    if (Storage.prototype.__gayaV16Patched) return;
    const previous = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value){
      previous.apply(this, arguments);
      try {
        if (['gayaCMSData','gayaCMS','gayaData','gaya_cms_v1'].includes(key)) {
          const s = session();
          if (s && s.role === 'Éditeur') {
            const debounceKey = 'gayaCMSContentSaveLogV16_' + s.username;
            const last = parseInt(sessionStorage.getItem(debounceKey) || '0', 10);
            const now = Date.now();
            if (now - last > 2500) { sessionStorage.setItem(debounceKey, String(now)); addLog('modification', 'A enregistré des modifications', sectionName(), currentEditorName(), 'Éditeur'); }
          }
        }
      } catch(e) {}
    };
    Storage.prototype.__gayaV16Patched = true;
  }
  /* === FIX v16-patch : commutation onglets + vider le journal === */
  function switchEditorsTab(targetId){
    document.querySelectorAll('.editors-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === targetId));
    document.querySelectorAll('.editors-tab-panel').forEach(p => p.classList.toggle('active', p.id === targetId));
  }
  function patchActivityUI(){
    document.querySelectorAll('.editors-tab').forEach(btn => {
      if (btn.dataset.v16Tab !== '1') {
        btn.dataset.v16Tab = '1';
        btn.addEventListener('click', function(){
          const target = this.dataset.tab;
          switchEditorsTab(target);
          if (target === 'editorsActivity') setTimeout(renderActivity, 60);
        });
      }
    });
    ['activityFilterUser','activityFilterType'].forEach(id => {
      const el = document.getElementById(id); if (el && el.dataset.v16Activity !== '1') { el.dataset.v16Activity = '1'; el.addEventListener('change', renderActivity); }
    });
    const clear = document.getElementById('clearActivityBtn');
    if (clear && clear.dataset.v16Clear !== '1') {
      clear.dataset.v16Clear = '1';
      clear.addEventListener('click', () => {
        if (!confirm('Vider tout le journal d\'activité ?')) return;
        setTimeout(() => {
          // Vider vraiment : on sauvegarde un tableau vide (sans filtrage)
          try { localStorage.removeItem(LOG_KEY); } catch(e) {}
          const cms = readCMS();
          cms.activityLog = [];
          writeCMS(cms);
          renderActivity();
        }, 80);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    patchEditorLogin(); patchSaveDelete(); patchContentSaveLog(); patchActivityUI();
    setTimeout(function(){ patchEditorLogin(); patchSaveDelete(); patchActivityUI(); renderActivity(); }, 700);
  });
})();

// =============================================
// BLOGS CMS — Gestion des articles de blog
// =============================================

let activeBlogCat = "all";

function getFilteredBlogs() {
  const blogs = Array.isArray(data.blogs) ? data.blogs : [];
  if (activeBlogCat === "all") return blogs;
  return blogs.filter(b => b.category === activeBlogCat);
}

function renderBlogs() {
  const list = document.getElementById("blogsList");
  const template = document.getElementById("blogTemplate");
  if (!list || !template) return;
  list.innerHTML = "";
  const blogs = getFilteredBlogs();
  if (!blogs.length) {
    list.innerHTML = '<div class="editor-card">Aucun article dans cette catégorie. Cliquez sur "+ Créer un blog" pour commencer.</div>';
    return;
  }
  blogs.forEach((blog, idx) => {
    if (!blog.id) blog.id = uid();
    const node = template.content.cloneNode(true).querySelector("article");
    node.querySelector("strong").textContent = blog.title || `Blog ${idx + 1}`;
    node.querySelectorAll("[data-field]").forEach(input => {
      if (input.tagName === "SELECT") {
        input.value = blog[input.dataset.field] || input.options[0]?.value || "";
      } else {
        input.value = blog[input.dataset.field] || "";
      }
      input.addEventListener("input", () => {
        blog[input.dataset.field] = input.value;
        if (input.dataset.field === "title") node.querySelector("strong").textContent = input.value || `Blog ${idx + 1}`;
        markDirty();
      });
      input.addEventListener("change", () => { blog[input.dataset.field] = input.value; markDirty(); });
    });
    const toggle = node.querySelector(".toggle-blog");
    const fields = node.querySelector(".blog-fields");
    if (toggle && fields) {
      toggle.addEventListener("click", () => {
        const open = fields.style.display !== "none";
        fields.style.display = open ? "none" : "block";
        toggle.textContent = open ? "Modifier" : "Fermer";
      });
    }
    const view = node.querySelector(".view-blog");
    if (view) view.addEventListener("click", () => {
      collectBlogsFromDOM();
      window.__skipBlogCollectOnce = true;
      saveData("Blog enregistré ✅");
      window.open(`https://gayainfotv.com/blog-article.html?id=${encodeURIComponent(blog.id)}`, "_blank");
    });
    const save = node.querySelector(".save-blog");
    if (save) save.addEventListener("click", () => {
      collectBlogsFromDOM();
      window.__skipBlogCollectOnce = true;
      saveData("Blog enregistré ✅");
    });
    const remove = node.querySelector(".remove");
    if (remove) remove.onclick = () => confirmCMSDelete("Supprimer ce blog ?", () => {
      data.blogs = data.blogs.filter(b => String(b.id) !== String(blog.id));
      renderBlogs();
      window.__skipBlogCollectOnce = true;
      saveData("Blog supprimé ✅");
    });
    // Image upload
    const mediaUpload = node.querySelector(".media-upload");
    if (mediaUpload) mediaUpload.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const url = ev.target.result;
        node.querySelector("[data-field='media']").value = url;
        blog.media = url;
        updatePreview(node, url);
        markDirty();
      };
      reader.readAsDataURL(file);
    });
    const authorPhotoUpload = node.querySelector(".author-photo-upload");
    if (authorPhotoUpload) authorPhotoUpload.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        node.querySelector("[data-field='authorPhoto']").value = ev.target.result;
        blog.authorPhoto = ev.target.result;
        markDirty();
      };
      reader.readAsDataURL(file);
    });
    updatePreview(node, blog.media);
    list.appendChild(node);
  });
}

function addBlog() {
  collectBlogsFromDOM();
  const cat = activeBlogCat === "all" ? "opinions" : activeBlogCat;
  if (!Array.isArray(data.blogs)) data.blogs = [];
  data.blogs.unshift({
    id: uid(),
    category: cat,
    title: "",
    excerpt: "",
    content: "",
    author: "",
    authorPhoto: "",
    media: "",
    date: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString()
  });
  renderBlogs();
  saveData("Nouveau blog créé ✅");
}

function collectBlogsFromDOM() {
  if (window.__skipBlogCollectOnce) { window.__skipBlogCollectOnce = false; return; }
  const list = document.getElementById("blogsList");
  if (!list) return;
  const nodes = list.querySelectorAll(".blog-card-admin");
  const displayed = getFilteredBlogs();
  nodes.forEach((node, i) => {
    const blog = displayed[i];
    if (!blog) return;
    const target = Array.isArray(data.blogs)
      ? data.blogs.find(b => String(b.id) === String(blog.id)) || blog
      : blog;
    node.querySelectorAll("[data-field]").forEach(input => {
      target[input.dataset.field] = input.value;
    });
  });
}

function initBlogCatTabs() {
  const tabs = document.querySelectorAll("[data-blogcat]");
  tabs.forEach(tab => {
    tab.onclick = () => {
      collectBlogsFromDOM();
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeBlogCat = tab.dataset.blogcat;
      renderBlogs();
    };
  });
}

// Attach addBlogBtn listener (both immediate and on DOMContentLoaded for safety)
(function attachAddBlogBtn() {
  const btn = document.getElementById("addBlogBtn");
  if (btn && !btn.dataset.blogListenerAttached) {
    btn.dataset.blogListenerAttached = "1";
    btn.addEventListener("click", addBlog);
  }
})();
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById("addBlogBtn");
    if (btn && !btn.dataset.blogListenerAttached) {
      btn.dataset.blogListenerAttached = "1";
      btn.addEventListener("click", addBlog);
    }
  });
}

// Initialiser les blogs quand la vue est activée
(function() {
  const origNormalize = normalizeData;
  // Patch normalizeData to include blogs[]
  const _orig = window.normalizeData;
})();

// Intégrer blogs dans normalizeData et saveData
const _origNormalizeData = normalizeData;
// Patch: ensure blogs[] is always preserved in data
window.addEventListener('gaya-cms-updated', function(e) {
  if (e.detail && Array.isArray(e.detail.blogs)) {
    data.blogs = e.detail.blogs.map(b => ({ ...b, id: b.id || uid() }));
    renderBlogs();
  }
});

// Patch collectGeneral to also collect blogs before save
const _origCollectGeneral = window.collectGeneral;
const _origSaveData = window.saveData;

// Ensure blogs are collected when saving
const blogSaveIntercept = function() {
  if (!window.__skipBlogCollectOnce) {
    try { collectBlogsFromDOM(); } catch(e) {}
  }
};
document.addEventListener('DOMContentLoaded', function() {
  // Ensure blogs loaded into data from CMS
  if (!Array.isArray(data.blogs)) data.blogs = [];
  initBlogCatTabs();
  // Re-render blogs when blogsView is activated
  document.querySelectorAll('[data-view="blogsView"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!Array.isArray(data.blogs)) data.blogs = [];
      renderBlogs();
    });
  });
});
