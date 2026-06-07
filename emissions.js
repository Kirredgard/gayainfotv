/* ================================================
   GAYA INFO TV — Émissions JS partagé
   ================================================ */

// ---- LIGHTBOX ----
function openVideo(youtubeId, title) {
  const lb = document.getElementById('video-lightbox');
  const iframe = document.getElementById('lightbox-iframe');
  const titleEl = document.getElementById('lightbox-video-title');

  iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
  if (titleEl) titleEl.textContent = title || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('video-lightbox');
  const iframe = document.getElementById('lightbox-iframe');
  lb.classList.remove('open');
  iframe.src = '';
  document.body.style.overflow = '';
}

// Close on backdrop click
document.addEventListener('DOMContentLoaded', () => {
  const lb = document.getElementById('video-lightbox');
  if (lb) {
    lb.addEventListener('click', (e) => {
      if (e.target === lb) closeLightbox();
    });
  }
});

// Close on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ---- FULLSCREEN ----
function goFullscreen() {
  const iframe = document.querySelector('.live-player-wrap iframe');
  if (iframe?.requestFullscreen) iframe.requestFullscreen();
  else if (iframe?.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
}

// ---- HEADER SCROLL ----
const header = document.getElementById('site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });
}

// ---- DATE ----
const dateEl = document.getElementById('current-date');
if (dateEl) {
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('fr-SN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ---- HAMBURGER ----
// Géré par mobile-nav-fix.js — on ne touche pas au hamburger ici pour éviter le double toggle
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('main-nav');
if (hamburger && mainNav) {
  hamburger.addEventListener('click', () => {
    if (window._mobileNavFixLoaded) return; // mobile-nav-fix.js gère ça
    mainNav.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (window._mobileNavFixLoaded) return;
    if (mainNav.classList.contains('open') && !mainNav.contains(e.target) && !hamburger.contains(e.target)) {
      mainNav.classList.remove('open');
    }
  });
}

// Mobile dropdown — géré par mobile-nav-fix.js
document.querySelectorAll('.nav-dropdown .dropdown-trigger').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    if (window._mobileNavFixLoaded) return;
    if (window.innerWidth <= 900) {
      e.preventDefault();
      trigger.closest('.nav-dropdown').classList.toggle('open');
    }
  });
});

// ---- SEARCH ----
const searchToggle = document.getElementById('search-toggle');
const searchBar = document.getElementById('search-bar');
const searchClose = document.getElementById('search-close');

if (searchToggle && searchBar) {
  searchToggle.addEventListener('click', () => {
    searchBar.classList.toggle('open');
    if (searchBar.classList.contains('open')) searchBar.querySelector('input')?.focus();
  });
}
if (searchClose && searchBar) {
  searchClose.addEventListener('click', () => searchBar.classList.remove('open'));
}

// ---- NEWSLETTER ----
function subscribeNewsletter(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = '✓ Inscrit !';
  btn.style.background = '#1a7c4f';
  e.target.reset();
}
