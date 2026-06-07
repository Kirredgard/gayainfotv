/* ================================================
   GAYA INFO TV — Émissions (styles partagés)
   ================================================ */

/* ---- PAGE HERO ÉMISSIONS ---- */
.emissions-hero {
  padding: 20px 0 20px;
  position: relative;
  overflow: hidden;
}

.emissions-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: inherit;
  z-index: 0;
}

.emissions-hero .hero-watermark {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-display);
  font-size: 110px;
  font-weight: 900;
  color: rgba(255,255,255,0.04);
  white-space: nowrap;
  pointer-events: none;
  letter-spacing: -0.02em;
}

.emissions-hero .hero-inner {
  position: relative;
  z-index: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: rgba(255,255,255,0.35);
  margin-bottom: 18px;
}
.breadcrumb a { transition: opacity 0.2s; }
.breadcrumb a:hover { opacity: 0.8; }
.breadcrumb i { font-size: 9px; opacity: 0.5; }
.breadcrumb .current { color: rgba(255,255,255,0.7); }

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 14px;
  border: 1.5px solid currentColor;
}

.emissions-hero h1 {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 900;
  color: #fff;
  line-height: 1.05;
  margin-bottom: 12px;
}
.emissions-hero h1 em { font-style: normal; }

.emissions-hero .hero-desc {
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  max-width: 520px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.hero-schedule-strip {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.schedule-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--radius);
  padding: 8px 14px;
  font-size: 12.5px;
  color: rgba(255,255,255,0.75);
}
.schedule-pill strong { color: #fff; font-weight: 700; }
.schedule-pill i { font-size: 12px; opacity: 0.6; }

/* ---- EMISSION NAV (sous-menu des 5 rubriques) ---- */
.emissions-subnav {
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: var(--total-top);
  z-index: 100;
}

.emissions-subnav-inner {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.emissions-subnav-inner::-webkit-scrollbar { display: none; }

.subnav-link {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 14px 18px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-muted);
  white-space: nowrap;
  border-bottom: 2.5px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  margin-bottom: -1px;
}
.subnav-link i { font-size: 12px; }
.subnav-link:hover { color: var(--color-text); }
.subnav-link.active { border-bottom-color: var(--accent); color: var(--accent); }

/* ---- MAIN LAYOUT ---- */
.emissions-page { padding: 32px 0 80px; }
.emissions-layout {
  display: grid;
  grid-template-columns: 1fr 310px;
  gap: 32px;
  align-items: start;
}

/* ---- SECTION TITLE ---- */
.section-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
}
.section-title-bar h2 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 10px;
}
.section-title-bar h2 i {
  font-size: 16px;
  color: var(--accent);
}
.section-link {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 5px;
  transition: gap 0.2s;
}
.section-link:hover { gap: 8px; }

/* ---- FEATURED EMISSION ---- */
.emission-featured {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 28px;
  position: relative;
}

.emission-featured-media {
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, var(--color-dark-3), var(--color-dark));
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.emission-featured-media img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.emission-featured-media:hover img { transform: scale(1.03); }

.emission-featured-media .placeholder-bg {
  width: 100%; height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.emission-featured-media .placeholder-bg i {
  font-size: 54px;
  color: rgba(255,255,255,0.07);
}

.featured-play-btn {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.play-circle {
  width: 68px; height: 68px;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 24px rgba(0,0,0,0.3);
  transition: transform 0.2s, background 0.2s;
}
.play-circle:hover { transform: scale(1.1); background: #fff; }
.play-circle i {
  font-size: 22px;
  color: var(--accent);
  margin-left: 4px;
}

.featured-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 4px 10px;
  border-radius: 3px;
}

.emission-featured-body {
  padding: 22px 24px;
}

.emission-ep-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.emission-featured-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.25;
  margin-bottom: 10px;
}

.emission-featured-desc {
  font-size: 14px;
  color: var(--color-text-2);
  line-height: 1.65;
  margin-bottom: 16px;
}

.emission-meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: var(--color-text-muted);
  flex-wrap: wrap;
}
.emission-meta-row span {
  display: flex;
  align-items: center;
  gap: 5px;
}
.emission-meta-row i { font-size: 10px; }

/* ---- EPISODE GRID ---- */
.episodes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 28px;
}

.episode-card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}
.episode-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

.episode-thumb {
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, var(--color-dark-3), var(--color-dark));
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.episode-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.episode-card:hover .episode-thumb img { transform: scale(1.06); }
.episode-thumb .ep-icon { font-size: 26px; color: rgba(255,255,255,0.1); }

.ep-play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s;
}
.episode-card:hover .ep-play-overlay { opacity: 1; }
.ep-play-sm {
  width: 42px; height: 42px;
  background: rgba(255,255,255,0.92);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.ep-play-sm i { font-size: 15px; color: var(--accent); margin-left: 3px; }

.ep-duration {
  position: absolute;
  bottom: 7px; right: 7px;
  background: rgba(0,0,0,0.72);
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
}

.ep-num-badge {
  position: absolute;
  top: 7px; left: 7px;
  background: var(--accent);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 8px;
  border-radius: 3px;
}

.episode-info {
  padding: 13px 15px 15px;
}

.episode-title {
  font-family: var(--font-display);
  font-size: 14.5px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
  margin-bottom: 7px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
}
.episode-card:hover .episode-title { color: var(--accent); }

.episode-meta {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: var(--color-text-muted);
}
.episode-meta span { display: flex; align-items: center; gap: 4px; }
.episode-meta i { font-size: 9px; }

/* ---- EPISODE LIST (petit format) ---- */
.episodes-list { display: flex; flex-direction: column; gap: 0; }
.episode-list-item {
  display: flex;
  gap: 13px;
  padding: 13px 0;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.15s;
}
.episode-list-item:last-child { border-bottom: none; }
.episode-list-item:hover { padding-left: 4px; }

.episode-list-thumb {
  width: 90px;
  height: 60px;
  flex-shrink: 0;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--color-dark-3), var(--color-dark));
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.episode-list-thumb img { width: 100%; height: 100%; object-fit: cover; }
.episode-list-thumb .lt-icon { font-size: 18px; color: rgba(255,255,255,0.12); }

.episode-list-info { flex: 1; }
.episode-list-ep { font-size: 10px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 3px; }
.episode-list-title {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
  margin-bottom: 5px;
  transition: color 0.2s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.episode-list-item:hover .episode-list-title { color: var(--accent); }
.episode-list-meta { font-size: 11px; color: var(--color-text-muted); }

/* ---- SIDEBAR WIDGETS ---- */
.sidebar-widget {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 20px;
}
.widget-header { padding: 14px 18px; border-bottom: 1px solid var(--color-border); }
.widget-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--color-text); }

/* LIVE */
.widget-live .widget-header { background: var(--color-dark); border: none; }
.live-indicator { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.06em; }
.live-dot { width: 7px; height: 7px; background: #ff4444; border-radius: 50%; display: inline-block; animation: blink 1.2s ease-in-out infinite; flex-shrink: 0; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.live-player-wrap { position: relative; background: #000; }
.live-player-wrap iframe { width: 100%; height: 175px; display: block; border: none; }
.fullscreen-btn { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.65); color: #fff; padding: 5px 10px; border-radius: var(--radius); font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; border: none; font-family: var(--font-body); transition: background 0.2s; }
.fullscreen-btn:hover { background: rgba(0,0,0,0.9); }
.live-now { padding: 12px 16px; background: var(--color-dark-2); }
.live-now-badge { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; color: var(--color-red); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 5px; }
.live-now p { font-size: 13px; color: #c0c0d8; line-height: 1.4; }

/* SCHEDULE WIDGET */
.schedule-list { padding: 6px 0; }
.schedule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--color-border);
}
.schedule-item:last-child { border-bottom: none; }
.schedule-day {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  min-width: 42px;
  flex-shrink: 0;
}
.schedule-show { font-size: 13px; font-weight: 600; color: var(--color-text); }
.schedule-time { font-size: 11px; color: var(--color-text-muted); }

/* OTHER EMISSIONS */
.other-emissions { padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }
.other-emission-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-2);
  transition: background 0.15s, color 0.15s;
}
.other-emission-link:hover { background: var(--color-bg); color: var(--color-text); }
.other-emission-link.current { background: var(--color-bg); color: var(--accent); font-weight: 700; }
.other-emission-link i { font-size: 14px; width: 20px; text-align: center; }

/* ---- LIGHTBOX ---- */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.92);
  z-index: 9999;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.lightbox-overlay.open { display: flex; animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.lightbox-box {
  position: relative;
  max-width: 900px;
  width: 100%;
  animation: zoomIn 0.22s ease;
}
@keyframes zoomIn { from { transform: scale(0.88); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.lightbox-box iframe {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: var(--radius-lg);
  border: none;
  display: block;
}
.lightbox-close {
  position: absolute;
  top: -14px; right: -14px;
  width: 36px; height: 36px;
  background: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 15px;
  color: var(--color-text);
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-md);
  transition: transform 0.2s;
}
.lightbox-close:hover { transform: scale(1.1); }
.lightbox-title { color: rgba(255,255,255,0.65); font-size: 13px; text-align: center; margin-top: 12px; }

/* ---- RESPONSIVE ---- */
@media (max-width: 900px) {
  .emissions-layout { grid-template-columns: 1fr; }
  .emissions-page .sidebar { position: static; }
  .emissions-hero h1 { font-size: 32px; }
  .episodes-grid { grid-template-columns: 1fr; }
  .hero-schedule-strip { gap: 12px; }
}
@media (max-width: 600px) {
  .episodes-grid { grid-template-columns: 1fr; }
  .emission-featured-title { font-size: 18px; }
  .subnav-link { padding: 12px 13px; font-size: 12px; }
}
