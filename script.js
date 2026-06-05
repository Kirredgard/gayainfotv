
function gayaCommentsCount(articleId) {
  return window.gayaGetCommentCount ? window.gayaGetCommentCount(articleId) : 0;
}

function gayaViewsCount(article) {
  if (window.gayaGetViewCount && article && article.id) {
    const remote = window.gayaGetViewCount(article.id);
    if (remote) return remote;
  }
  return Number(article.reads || article.views || 0);
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


function getGayaCMSData() {
  const keys = ["gayaCMSData", "gayaCMS", "gayaData"];
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
  }
  return {};
}

/* GAYA INFO TV — affichage dynamique + interactions */
(function () {
  const STORAGE_KEY = 'gaya_cms_v1';

  const defaultData = {
    ticker: '',
    live: { title: '', embedUrl: '' },
    slides: [],
    articles: []
  };
  function getData() {
    try {
      if (window.gayaCMSRead) {
        const cms = window.gayaCMSRead();
        if (cms && Object.keys(cms).length) {
          const merged = { ...defaultData, ...cms };
          if (!merged.live || typeof merged.live !== 'object') merged.live = { ...defaultData.live };
          if (cms.liveTitle) merged.live.title = cms.liveTitle;
          if (cms.liveEmbed) merged.live.embedUrl = cms.liveEmbed;
          merged.slides = Array.isArray(cms.slides) ? cms.slides : defaultData.slides;
          merged.articles = Array.isArray(cms.articles) ? cms.articles : defaultData.articles;
          return merged;
        }
      }
    } catch(e) {}
    const keys = ['gayaCMSData', 'gayaCMS', 'gayaData', STORAGE_KEY];

    for (const key of keys) {
      try {
        const saved = localStorage.getItem(key);
        if (!saved) continue;

        const parsed = JSON.parse(saved);
        const merged = { ...defaultData, ...parsed };

        // Compatibilité nouveau CMS pro
        if (!merged.live || typeof merged.live !== 'object') {
          merged.live = { ...defaultData.live };
        }
        if (parsed.liveTitle) merged.live.title = parsed.liveTitle;
        if (parsed.liveEmbed) merged.live.embedUrl = parsed.liveEmbed;

        merged.slides = Array.isArray(parsed.slides) ? parsed.slides : defaultData.slides;
        merged.articles = Array.isArray(parsed.articles) ? parsed.articles : defaultData.articles;

        return merged;
      } catch (error) {
        console.warn('CMS data error:', error);
      }
    }

    return defaultData;
  }

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
    }[char]));
  }

  function applyBackground(el, image, fallback) {
    if (image) {
      el.style.background = `linear-gradient(to bottom, rgba(0,0,0,.1), rgba(0,0,0,.72)), url('${image}') center/cover`;
    } else {
      el.style.background = fallback;
    }
  }

  function renderTicker(data) {
    const ticker = document.querySelector('.ticker-content span');
    if (ticker) ticker.textContent = ` ${data.ticker} `;
  }

  function renderSlides(data) {
    const slider = document.getElementById('slider');
    const dots = document.getElementById('slider-dots');
    if (!slider || !dots) return;

    const controls = slider.querySelectorAll('.slider-prev, .slider-next');
    slider.querySelectorAll('.slide').forEach((slide) => slide.remove());
    dots.innerHTML = '';

    const fallbacks = [
      'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      'linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%)',
      'linear-gradient(135deg, #1b1b2f 0%, #2c2c54 100%)'
    ];

    (data.slides || []).forEach((slide, index) => {
      const slideEl = document.createElement('div');
      slideEl.className = `slide ${index === 0 ? 'active' : ''}`;
      applyBackground(slideEl, slide.image, fallbacks[index % fallbacks.length]);
      slideEl.innerHTML = `
        <div class="slide-image-overlay"></div>
        <div class="slide-content">
          <span class="slide-category">${escapeHTML(slide.category)}</span>
          <h2 class="slide-title">${escapeHTML(slide.title)}</h2>
          <p class="slide-excerpt">${escapeHTML(slide.excerpt)}</p>
          <a href="${escapeHTML(slide.link || '#')}" class="slide-btn">Lire l'article <i class="fa-solid fa-arrow-right"></i></a>
        </div>`;
      slider.insertBefore(slideEl, controls[0] || dots);

      const dot = document.createElement('span');
      dot.className = `dot ${index === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => window.goToSlide(index));
      dots.appendChild(dot);
    });
  }

  function articleImageHTML(image, small = false) {
    if (image) return `<img src="${escapeHTML(image)}" alt="">`;
    return small ? '<i class="fa-regular fa-newspaper ph"></i>' : '<i class="fa-regular fa-newspaper placeholder-icon"></i>';
  }

  function renderArticles(data) {
    const grid = document.getElementById('articles-grid');
    if (!grid) return;

    const cmsData = getGayaCMSData ? getGayaCMSData() : {};
    let articles = Array.isArray(cmsData.articles) && cmsData.articles.length
      ? cmsData.articles.map(a => ({
          id: a.id || '',
          category: a.category || 'Actualités',
          title: a.title || 'Sans titre',
          excerpt: a.excerpt || '',
          date: a.date || '',
          image: a.media || a.image || '',
          link: a.id ? `article.html?id=${a.id}` : (a.link || '#'),
          createdAt: a.createdAt || ''
        }))
      : (data.articles || []);

    articles = articles
      .slice()
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
      .slice(0, 6);

    grid.innerHTML = articles.map((article) => `
      <a class="article-card" href="${escapeHTML(article.link || '#')}">
        <div class="article-card-img">
          ${articleImageHTML(article.image)}
        </div>
        <div class="article-card-body">
          <span class="article-category">${escapeHTML(article.category)}</span>
          <h3 class="article-title">${escapeHTML(article.title)}</h3>
          <p class="article-excerpt">${escapeHTML(article.excerpt)}</p>
          <div class="article-meta">
            <span><i class="fa-regular fa-calendar"></i> ${escapeHTML(gayaFormatDate(article.date || ''))}</span>
            <span><i class="fa-regular fa-eye"></i> <span data-view-count-id="${escapeHTML(article.id || "")}">${gayaViewsCount(article)}</span> vues</span>
            <span><i class="fa-regular fa-comment-dots"></i> <span data-comment-count-id="${escapeHTML(article.id || "")}">${gayaCommentsCount(article.id)}</span> commentaires</span>
          </div>
        </div>
      </a>
    `).join('');
    const ids = articles.map(a => a.id).filter(Boolean);
    function doRefreshHome() {
      if (window.gayaRefreshCommentCounts) window.gayaRefreshCommentCounts(ids);
      if (window.gayaRefreshViewCounts) window.gayaRefreshViewCounts(ids);
    }
    if (window.gayaSupabase) {
      doRefreshHome();
    } else {
      window.addEventListener("gaya-cms-updated", doRefreshHome, { once: true });
      setTimeout(doRefreshHome, 5000);
    }
  }

  function renderLive(data) {
    const wrap = document.getElementById('live-content');
    const title = document.getElementById('live-title');
    if (title) title.textContent = data.liveTitle || data.live?.title || 'GAYA INFO TV — Direct';
    if (!wrap) return;

    const embedUrl = normalizeLiveEmbedUrl(data.liveEmbed || data.live?.embedUrl || '');
    if (!embedUrl) {
      wrap.innerHTML = '<p style="text-align:center; padding:1rem; color:#aaa;">Live non configuré.</p>';
      return;
    }
    wrap.innerHTML = `<iframe src="${escapeHTML(embedUrl)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }


  function normalizeLiveEmbedUrl(url) {
    url = (url || '').trim();
    if (!url) return '';
    try {
      const u = new URL(url, window.location.href);
      if (u.hostname.includes('youtube.com') && u.pathname === '/watch') {
        const v = u.searchParams.get('v');
        if (v) return 'https://www.youtube.com/embed/' + encodeURIComponent(v);
      }
      if (u.hostname === 'youtu.be') {
        const v = u.pathname.replace(/^\//, '');
        if (v) return 'https://www.youtube.com/embed/' + encodeURIComponent(v);
      }
      return u.href;
    } catch(e) { return url; }
  }

  function getLiveInfo(data) {
    const title = data.liveTitle || data.live?.title || 'GAYA INFO TV — Direct';
    const embed = normalizeLiveEmbedUrl(data.liveEmbed || data.live?.embedUrl || '');
    return { title, embed };
  }

  function ensureLiveModal() {
    var modal = document.getElementById('gayaLiveModal');

    if (!document.getElementById('glmStyle')) {
      var s = document.createElement('style');
      s.id = 'glmStyle';
      s.textContent =
        '#gayaLiveModal{position:fixed !important;inset:0 !important;top:0 !important;left:0 !important;right:0 !important;bottom:0 !important;width:100vw !important;height:100vh !important;height:100dvh !important;z-index:2147483647 !important;display:none !important;align-items:center !important;justify-content:center !important;background:rgba(3,6,14,0.88) !important;padding:14px !important;box-sizing:border-box !important;margin:0 !important;overflow:hidden !important;}' +
        '#gayaLiveModal.open{display:flex !important;position:fixed !important;}' +
        '#gayaLiveModal *{box-sizing:border-box;}' +
        '#gayaLiveModal .glm-card{width:min(720px,94vw) !important;max-width:720px !important;background:#0b1828 !important;border:1px solid rgba(255,255,255,.18) !important;border-radius:18px !important;overflow:hidden !important;color:#fff !important;box-shadow:0 20px 60px rgba(0,0,0,.85) !important;max-height:88vh !important;max-height:88dvh !important;display:flex !important;flex-direction:column !important;position:relative !important;}' +
        '#gayaLiveModal .glm-head{display:flex !important;align-items:center !important;justify-content:space-between !important;padding:13px 15px !important;border-bottom:1px solid rgba(255,255,255,.12) !important;flex-shrink:0 !important;}' +
        '#gayaLiveModal .glm-kicker{font-size:11px !important;font-weight:900 !important;text-transform:uppercase !important;letter-spacing:.1em !important;color:#fca5a5 !important;display:flex !important;align-items:center !important;gap:6px !important;}' +
        '#gayaLiveModal .glm-dot{width:7px !important;height:7px !important;background:#f87171 !important;border-radius:50% !important;display:inline-block !important;animation:glmPulse 1.2s infinite !important;}' +
        '#gayaLiveModal .glm-title{margin:4px 0 0 !important;font-size:18px !important;font-weight:900 !important;color:#fff !important;line-height:1.2 !important;}' +
        '#gayaLiveModal .glm-close{width:36px !important;height:36px !important;min-width:36px !important;border:0 !important;border-radius:50% !important;background:rgba(255,255,255,.14) !important;color:#fff !important;font-size:20px !important;cursor:pointer !important;display:flex !important;align-items:center !important;justify-content:center !important;}' +
        '#gayaLiveModal .glm-body{padding:12px !important;flex:1 !important;overflow:auto !important;}' +
        '#gayaLiveModal .glm-player{border-radius:12px !important;overflow:hidden !important;background:#000 !important;}' +
        '#gayaLiveModal .glm-player iframe{width:100% !important;aspect-ratio:16/9 !important;border:0 !important;display:block !important;min-height:180px !important;background:#000 !important;}' +
        '#gayaLiveModal .glm-empty{padding:36px 20px !important;text-align:center !important;color:#fff !important;}' +
        '#gayaLiveModal .glm-empty h3{margin:0 0 8px !important;font-size:20px !important;color:#fff !important;}' +
        '#gayaLiveModal .glm-empty p{margin:0 !important;color:rgba(255,255,255,.7) !important;line-height:1.5 !important;}' +
        '#gayaLiveModal .glm-foot{padding:9px 15px !important;font-size:11px !important;color:rgba(255,255,255,.45) !important;display:flex !important;justify-content:space-between !important;flex-shrink:0 !important;}' +
        '@media(max-width:640px){#gayaLiveModal{padding:10px !important;align-items:center !important;}#gayaLiveModal .glm-card{width:94vw !important;max-height:86dvh !important;border-radius:16px !important;}#gayaLiveModal .glm-player iframe{min-height:175px !important;}#gayaLiveModal .glm-foot{display:block !important;}}' +
        '@keyframes glmPulse{0%,100%{opacity:1}50%{opacity:.35}}';
      document.head.appendChild(s);
    }

    if (modal) {
      if (modal.parentNode !== document.body) document.body.appendChild(modal);
      return modal;
    }

    modal = document.createElement('div');
    modal.id = 'gayaLiveModal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML =
      '<div class="glm-card" role="dialog" aria-modal="true" aria-labelledby="glmTitle">' +
        '<div class="glm-head">' +
          '<div>' +
            '<div class="glm-kicker"><span class="glm-dot"></span> Direct</div>' +
            '<h2 class="glm-title" id="glmTitle">GAYA INFO TV \u2014 Direct</h2>' +
          '</div>' +
          '<button type="button" class="glm-close" id="glmClose" aria-label="Fermer">\u2715</button>' +
        '</div>' +
        '<div class="glm-body"><div class="glm-player" id="glmPlayer"></div></div>' +
        '<div class="glm-foot"><span>GAYA INFO TV</span><span>Toucher en dehors pour fermer</span></div>' +
      '</div>';

    document.body.appendChild(modal);

    var closeFn = function() { closeLiveModal(); };
    var closeBtn = document.getElementById('glmClose');
    closeBtn.addEventListener('click', closeFn);
    closeBtn.addEventListener('touchend', function(e){ e.preventDefault(); closeFn(); }, {passive:false});
    modal.addEventListener('click', function(e){ if(e.target===modal) closeFn(); });
    modal.addEventListener('touchend', function(e){ if(e.target===modal){e.preventDefault();closeFn();} }, {passive:false});
    return modal;
  }
  function openLiveModal() {
    const data = getData();
    const live = getLiveInfo(data);
    const modal = ensureLiveModal();
    const title = modal.querySelector('#glmTitle');
    const body = modal.querySelector('#glmPlayer');
    if (title) title.textContent = live.title;
    if (body) {
      if (live.embed) {
        body.innerHTML = '<iframe src="' + escapeHTML(live.embed) + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      } else {
        body.innerHTML = '<div class="glm-empty"><div style="font-size:40px;margin-bottom:12px">📡</div><h3>Pas de live pour le moment</h3><p>Aucune diffusion en direct n\'est configurée. Revenez bientôt !</p></div>';
      }
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('gaya-modal-open');
  }

  function closeLiveModal() {
    const modal = document.getElementById('gayaLiveModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    const body = modal.querySelector('#glmPlayer');
    if (body) body.innerHTML = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.classList.remove('gaya-modal-open');
  }

  function initInteractions() {
    const header = document.getElementById('site-header');
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('main-nav');
    const searchToggle = document.getElementById('search-toggle');
    const searchBar = document.getElementById('search-bar');
    const searchClose = document.getElementById('search-close');
    const dateEl = document.getElementById('current-date');

    if (dateEl) {
      dateEl.textContent = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
    }

    window.addEventListener('scroll', () => {
      if (header) header.classList.toggle('scrolled', window.scrollY > 10);
    });

    searchToggle?.addEventListener('click', () => searchBar?.classList.add('open'));
    searchClose?.addEventListener('click', () => searchBar?.classList.remove('open'));

    // --- MENU MOBILE (version robuste, prioritaire sur emissions.js) ---
    window._mobileNavFixLoaded = true;
    if (hamburger && nav) {
      hamburger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
        nav.classList.toggle('open');
        hamburger.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
      });
    }

    // Fermer uniquement quand on clique en dehors du menu.
    document.addEventListener('click', function(e) {
      if (!nav || !hamburger) return;
      if (nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
        nav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    // Sur mobile, seul le bouton "Émissions" ouvre le sous-menu.
    // Les vrais liens gardent leur comportement normal : aucun preventDefault.
    document.querySelectorAll('.nav-dropdown .dropdown-trigger').forEach(function(trigger) {
      trigger.addEventListener('click', function(e) {
        if (window.innerWidth <= 900) {
          e.preventDefault();
          e.stopPropagation();
          const dropdown = trigger.closest('.nav-dropdown');
          if (dropdown) dropdown.classList.toggle('open');
        }
      });
    });



    function showRadioSoonToast() {
      let toast = document.getElementById('toast-soon');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-soon';
        toast.className = 'toast-soon';
        toast.innerHTML = `
          <div class="toast-soon-icon"><i class="fa-solid fa-radio"></i></div>
          <div class="toast-soon-text">
            <div class="toast-soon-title"></div>
            <div class="toast-soon-sub"></div>
          </div>
          <button class="toast-soon-close" type="button" aria-label="Fermer">×</button>`;
        document.body.appendChild(toast);
        toast.querySelector('.toast-soon-close')?.addEventListener('click', () => toast.classList.remove('show'));
      }
      const title = toast.querySelector('.toast-soon-title');
      const sub = toast.querySelector('.toast-soon-sub');
      if (title) title.textContent = 'Radio Gaya FM';
      if (sub) sub.textContent = 'Radio Gaya FM bientôt disponible ✨';
      toast.classList.add('show');
      clearTimeout(window.__gayaRadioToastTimer);
      window.__gayaRadioToastTimer = setTimeout(() => toast.classList.remove('show'), 3800);
    }

    document.addEventListener('click', function(e) {
      const radioBtn = e.target.closest('.btn-radio, a[href="#radio"], a[href="#radio-gaya"]');
      const radioTextLink = e.target.closest('a');
      const isRadioText = radioTextLink && /radio\s*gaya|radio/i.test((radioTextLink.textContent || '').trim()) && (radioTextLink.getAttribute('href') || '#') === '#';
      const btn = radioBtn || (isRadioText ? radioTextLink : null);
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const nav = document.getElementById('main-nav');
      const hamburger = document.getElementById('hamburger');
      nav?.classList.remove('open');
      hamburger?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
      showRadioSoonToast();
    }, true);
    function handleLiveTrigger(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      const nav = document.getElementById('main-nav');
      const hamburger = document.getElementById('hamburger');
      nav?.classList.remove('open');
      hamburger?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
      openLiveModal();
    }

    // Attacher directement sur tous les boutons .btn-live du DOM
    function bindLiveButtons() {
      document.querySelectorAll('.btn-live').forEach(function(btn) {
        if (btn.dataset.livebound === '1') return;
        btn.dataset.livebound = '1';
        btn.addEventListener('click', handleLiveTrigger, true);
        btn.addEventListener('touchend', function(e) {
          e.preventDefault();
          handleLiveTrigger(e);
        }, { passive: false });
        btn.addEventListener('pointerup', handleLiveTrigger, true);
      });
    }
    bindLiveButtons();
    // Fallback delegation pour les boutons chargés dynamiquement
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn-live');
      if (!btn) return;
      handleLiveTrigger(e);
    }, true);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { closeLiveModal(); }
      if (e.key === 'Escape' && nav && hamburger) {
        nav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  let currentSlide = 0;
  window.goToSlide = function (index) {
    const slides = [...document.querySelectorAll('.slide')];
    const dots = [...document.querySelectorAll('.dot')];
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === currentSlide));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
  };
  window.changeSlide = function (direction) {
    window.goToSlide(currentSlide + direction);
  };
  window.subscribeNewsletter = function (event) {
    event.preventDefault();
    const msg = document.getElementById('newsletter-msg');
    if (msg) {
      msg.style.display = 'block';
      msg.textContent = 'Merci pour votre inscription.';
    }
    event.target.reset();
  };
  window.hideToast = function () {
    document.getElementById('toast-soon')?.classList.remove('show');
  };

  function applyGayaPublicCMS() {
    const data = getData();
    renderTicker(data);
    renderSlides(data);
    renderArticles(data);
    renderLive(data);
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyGayaPublicCMS();
    initInteractions();
    setInterval(() => window.changeSlide(1), 6500);
  });
  window.addEventListener('gaya-cms-updated', applyGayaPublicCMS);
  window.addEventListener('storage', applyGayaPublicCMS);
  if (window.gayaCMSOnUpdate) window.gayaCMSOnUpdate(applyGayaPublicCMS);
})();

/* === FIX v15 : Radio Gaya FM bientôt disponible — robuste === */
(function(){
  function ensureRadioToast(){
    var toast = document.getElementById('toast-soon');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-soon';
      toast.className = 'toast-soon';
      toast.innerHTML = '<div class="toast-soon-icon"><i class="fa-solid fa-radio"></i></div><div class="toast-soon-text"><div class="toast-soon-title">Radio Gaya FM</div><div class="toast-soon-sub">Radio Gaya FM bientôt disponible ✨</div></div><button class="toast-soon-close" type="button" aria-label="Fermer">×</button>';
      document.body.appendChild(toast);
    }
    var title = toast.querySelector('.toast-soon-title');
    var sub = toast.querySelector('.toast-soon-sub');
    if (title) title.textContent = 'Radio Gaya FM';
    if (sub) sub.textContent = 'Radio Gaya FM bientôt disponible ✨';
    var close = toast.querySelector('.toast-soon-close');
    if (close && close.dataset.radioBound !== '1') {
      close.dataset.radioBound = '1';
      close.addEventListener('click', function(e){ e.preventDefault(); toast.classList.remove('show'); });
    }
    return toast;
  }
  function showRadioToast(){
    var toast = ensureRadioToast();
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(window.__gayaRadioToastV15);
    window.__gayaRadioToastV15 = setTimeout(function(){ toast.classList.remove('show'); }, 4200);
  }
  function isRadioButton(el){
    var a = el && el.closest ? el.closest('a,button') : null;
    if (!a) return null;
    var href = (a.getAttribute('href') || '').trim().toLowerCase();
    var txt = (a.textContent || '').trim().toLowerCase();
    if (a.classList.contains('btn-radio')) return a;
    if ((href === '#' || href === '#radio' || href === '#radio-gaya') && txt.indexOf('radio') !== -1) return a;
    return null;
  }
  function handler(e){
    var btn = isRadioButton(e.target);
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    document.getElementById('main-nav')?.classList.remove('open');
    document.getElementById('hamburger')?.classList.remove('open');
    showRadioToast();
  }
  ['pointerdown','touchend','click'].forEach(function(type){
    document.addEventListener(type, handler, true);
  });
  window.hideToast = function(){ document.getElementById('toast-soon')?.classList.remove('show'); };
})();
