/* ============================================================
   GAYA INFO TV — Bannière d'installation PWA
   ============================================================ */

(function () {
  'use strict';

  /* ---- Styles injectés dynamiquement ---- */
  const CSS = `
    #gaya-pwa-banner {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 99999;
      background: linear-gradient(135deg, #1a0608 0%, #2a0c10 60%, #1a0608 100%);
      border-top: 2px solid #c8102e;
      box-shadow: 0 -4px 32px rgba(200,16,46,0.25);
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      transform: translateY(110%);
      transition: transform 0.45s cubic-bezier(0.22,1,0.36,1);
      font-family: 'Source Sans 3', -apple-system, sans-serif;
    }
    #gaya-pwa-banner.visible {
      transform: translateY(0);
    }
    #gaya-pwa-banner .pwa-icon {
      flex-shrink: 0;
      width: 48px; height: 48px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(200,16,46,0.4);
    }
    #gaya-pwa-banner .pwa-icon img {
      width: 100%; height: 100%; object-fit: cover;
    }
    #gaya-pwa-banner .pwa-text {
      flex: 1;
      min-width: 0;
    }
    #gaya-pwa-banner .pwa-title {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #gaya-pwa-banner .pwa-subtitle {
      font-size: 12px;
      color: rgba(255,255,255,0.55);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #gaya-pwa-banner .pwa-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    #gaya-pwa-btn-install {
      background: #c8102e;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 9px 18px;
      font-size: 13px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      letter-spacing: 0.03em;
      white-space: nowrap;
      transition: background 0.18s, transform 0.12s;
      box-shadow: 0 2px 10px rgba(200,16,46,0.45);
    }
    #gaya-pwa-btn-install:hover {
      background: #e5142e;
      transform: scale(1.04);
    }
    #gaya-pwa-btn-install:active { transform: scale(0.97); }
    #gaya-pwa-btn-dismiss {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.18);
      color: rgba(255,255,255,0.5);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.18s;
      white-space: nowrap;
    }
    #gaya-pwa-btn-dismiss:hover {
      border-color: rgba(255,255,255,0.4);
      color: rgba(255,255,255,0.8);
    }

    /* ---- Bannière iOS spécifique ---- */
    #gaya-pwa-ios {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 99999;
      background: linear-gradient(135deg, #1a0608 0%, #2a0c10 60%, #1a0608 100%);
      border-top: 2px solid #c8102e;
      box-shadow: 0 -4px 32px rgba(200,16,46,0.25);
      padding: 16px 20px 24px;
      font-family: 'Source Sans 3', -apple-system, sans-serif;
      color: #fff;
      transform: translateY(110%);
      transition: transform 0.45s cubic-bezier(0.22,1,0.36,1);
    }
    #gaya-pwa-ios.visible { transform: translateY(0); }
    #gaya-pwa-ios .ios-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    #gaya-pwa-ios .ios-header img {
      width: 44px; height: 44px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(200,16,46,0.4);
    }
    #gaya-pwa-ios .ios-header-text .ios-title {
      font-size: 14px; font-weight: 700;
    }
    #gaya-pwa-ios .ios-header-text .ios-sub {
      font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 2px;
    }
    #gaya-pwa-ios .ios-close {
      margin-left: auto;
      background: transparent; border: none;
      color: rgba(255,255,255,0.45);
      font-size: 20px; line-height: 1;
      cursor: pointer; padding: 4px 8px;
    }
    #gaya-pwa-ios .ios-steps {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    #gaya-pwa-ios .ios-step {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: rgba(255,255,255,0.85);
    }
    #gaya-pwa-ios .ios-step-num {
      width: 22px; height: 22px;
      background: #c8102e;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    #gaya-pwa-ios .ios-arrow {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      width: 0; height: 0;
      /* pas de flèche, on reste discret */
    }
    /* Flèche bas pointant vers Safari share */
    #gaya-pwa-ios::after {
      content: '';
      display: block;
      width: 22px; height: 11px;
      background: #c8102e;
      clip-path: polygon(50% 100%, 0 0, 100% 0);
      position: absolute;
      bottom: -11px; left: 50%;
      transform: translateX(-50%);
    }

    @media (max-width: 480px) {
      #gaya-pwa-banner { padding: 12px 14px; gap: 10px; }
      #gaya-pwa-btn-install { padding: 8px 14px; font-size: 12px; }
      #gaya-pwa-btn-dismiss { padding: 7px 10px; font-size: 11px; }
    }
  `;

  /* ---- Inject CSS ---- */
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ---- Helpers ---- */
  const DISMISSED_KEY = 'gaya_pwa_dismissed';
  const INSTALLED_KEY = 'gaya_pwa_installed';
  const isDismissed = () => localStorage.getItem(DISMISSED_KEY) === '1';
  const isInstalled = () => localStorage.getItem(INSTALLED_KEY) === '1' ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  function dismiss(days) {
    // Masquer pendant N jours (ou définitivement si days=0)
    const expires = days ? Date.now() + days * 86400000 : 0;
    localStorage.setItem(DISMISSED_KEY, expires || '1');
  }
  function shouldShow() {
    if (isInstalled()) return false;
    const v = localStorage.getItem(DISMISSED_KEY);
    if (!v) return true;
    if (v === '1') return false;
    return Date.now() > parseInt(v, 10);
  }

  /* ---- Détection iOS ---- */
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari = /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios/i.test(navigator.userAgent);

  /* ---- Bannière Android / Chrome (beforeinstallprompt) ---- */
  let deferredPrompt = null;
  let androidBanner = null;

  function showAndroidBanner() {
    if (!shouldShow()) return;
    androidBanner = document.createElement('div');
    androidBanner.id = 'gaya-pwa-banner';
    androidBanner.innerHTML = `
      <div class="pwa-icon">
        <img src="/favicon-192x192.png" alt="GAYA INFO TV">
      </div>
      <div class="pwa-text">
        <div class="pwa-title">Installer GAYA INFO TV</div>
        <div class="pwa-subtitle">Accès rapide · Lecture hors-ligne</div>
      </div>
      <div class="pwa-actions">
        <button id="gaya-pwa-btn-dismiss">Plus tard</button>
        <button id="gaya-pwa-btn-install">Installer</button>
      </div>
    `;
    document.body.appendChild(androidBanner);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => androidBanner.classList.add('visible'));
    });

    androidBanner.querySelector('#gaya-pwa-btn-install').addEventListener('click', async () => {
      if (!deferredPrompt) return;
      androidBanner.classList.remove('visible');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem(INSTALLED_KEY, '1');
      } else {
        dismiss(7); // Réafficher dans 7 jours
      }
      deferredPrompt = null;
      setTimeout(() => androidBanner?.remove(), 500);
    });

    androidBanner.querySelector('#gaya-pwa-btn-dismiss').addEventListener('click', () => {
      androidBanner.classList.remove('visible');
      dismiss(3); // Réafficher dans 3 jours
      setTimeout(() => androidBanner?.remove(), 500);
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(showAndroidBanner, 3000); // Délai 3s pour ne pas agresser l'utilisateur
  });

  /* ---- Bannière iOS Safari ---- */
  function showIosBanner() {
    if (!shouldShow()) return;
    if (!isIos || !isSafari) return;
    const banner = document.createElement('div');
    banner.id = 'gaya-pwa-ios';
    banner.innerHTML = `
      <div class="ios-header">
        <img src="/favicon-192x192.png" alt="GAYA INFO TV">
        <div class="ios-header-text">
          <div class="ios-title">Installer GAYA INFO TV</div>
          <div class="ios-sub">Ajouter à votre écran d'accueil</div>
        </div>
        <button class="ios-close" id="gaya-pwa-ios-close">✕</button>
      </div>
      <div class="ios-steps">
        <div class="ios-step">
          <span class="ios-step-num">1</span>
          <span>Appuyez sur le bouton <strong>Partager</strong> <span style="font-size:16px">⎙</span> en bas de Safari</span>
        </div>
        <div class="ios-step">
          <span class="ios-step-num">2</span>
          <span>Sélectionnez <strong>« Sur l'écran d'accueil »</strong></span>
        </div>
        <div class="ios-step">
          <span class="ios-step-num">3</span>
          <span>Appuyez sur <strong>Ajouter</strong> — c'est prêt !</span>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => banner.classList.add('visible'));
    });
    banner.querySelector('#gaya-pwa-ios-close').addEventListener('click', () => {
      banner.classList.remove('visible');
      dismiss(7);
      setTimeout(() => banner.remove(), 500);
    });
  }

  /* ---- Déclenchement ---- */
  window.addEventListener('load', () => {
    if (isIos && isSafari) {
      setTimeout(showIosBanner, 4000);
    }
    // Android est géré par beforeinstallprompt
  });

  /* ---- Marquer comme installé quand on passe en standalone ---- */
  window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
    if (e.matches) localStorage.setItem(INSTALLED_KEY, '1');
  });

})();
