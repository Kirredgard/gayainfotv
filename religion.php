<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>GAYA INFO TV — Émissions Sport</title>
<meta name="description" content="GAYA INFO TV - Émissions Sport et vidéos en direct.">

<!-- ICONES MODERNES -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

<style>
:root{
  --red:#e63939;
  --dark:#020617;
  --max:1200px;
  --gray:#ddd;
  --light:#fafafa;
}

/* RESET & BASE */
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,Segoe UI,Roboto,Arial;background:#f5f5f5;color:#111;}
a{text-decoration:none;color:inherit}

/* ================= HEADER ================= */
.main-header{background:#fff;position:fixed;top:0;left:0;width:100%;z-index:1000;}
body{padding-top:120px;} /* hauteur du header */

.header-top-inner{max-width:var(--max);margin:auto;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;}
.logo-title{display:flex;align-items:center;gap:8px;}
.logo-title img{height:40px;max-height:50px;width:auto;}
@media(max-width:768px){ .logo-title img{height:35px;} }
@media(max-width:480px){ .logo-title img{height:30px;} }
@media(min-width:1400px){ .logo-title img{height:50px;} }
.logo-title span{font-size:22px;font-weight:900;color:var(--red);}
.header-actions{display:flex;gap:8px;}
.btn-outline{border:1.5px solid var(--red);color:var(--red);padding:4px 12px;border-radius:999px;font-weight:800;font-size:13px;}
.btn-live{background:var(--red);color:#fff;padding:4px 14px;border-radius:999px;font-weight:900;font-size:13px;}
.header-actions i{margin-right:5px}

/* NAV BAR */
.nav-bar{background:var(--dark);}
.nav-inner{max-width:var(--max);margin:auto;padding:8px 16px;display:flex;justify-content:space-between;align-items:center;position:relative; z-index: 10;}
.menu{display:flex;align-items:center;gap:18px;}
.menu a{color:#e5e7eb;font-weight:700;font-size:14px;margin-right: 30px;}
.menu a:hover{color:#fff;}
.dropdown {position: relative;}
.dropdown-content {display: none;position: absolute;background-color: var(--dark);min-width: 140px;box-shadow: 0px 8px 16px rgba(0,0,0,0.2);border-radius: 6px;z-index: 100;top: 100%;}
.dropdown-content a {color: #e5e7eb;padding: 10px 12px;display: block;font-size: 13px;}
.dropdown-content a:hover {background-color: var(--red); color: #fff;}
.dropdown.show .dropdown-content {display: block;}
.dropbtn i {margin-left: 6px;transition: transform 0.3s;}
.dropdown.show .dropbtn i {transform: rotate(180deg);}
.nav-right{display:flex;align-items:center;gap:12px;}
.search-mini{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.12);padding:4px 10px;border-radius:999px;}
.search-mini input{background:transparent;border:none;outline:none;color:#fff;width:100px;font-size:12px;}
.search-mini input::placeholder{color:#cbd5f5}
.search-mini i{color:#fff;font-size:13px}
.socials a{color:#cbd5f5;font-size:15px;transition:.3s;}
.socials a:hover{color:#fff;transform:scale(1.15);}
.hamburger {display: none;font-size: 20px;color: #e5e7eb;cursor: pointer;position: relative;z-index: 10;}
@media (max-width: 900px) {.hamburger {display: block;}}
@media (max-width: 900px) {.menu {flex-direction: column;align-items: flex-start;position: absolute;top: 100%;left: 0;right: 0;background: var(--dark);display: none;}}
.menu.show {display: flex;}
@media(max-width:900px){.menu a{width: 100%;text-align: left;padding: 12px 16px;margin-right: 0;gap: 0;}}

/* ================= CONTENU ================= */
.container{max-width:var(--max);margin:auto;padding:20px;}

/* TITRE MODERNE AVEC ICONE */
h1.media-title{
  color: #111;
  font-size: 28px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Segoe UI', Roboto, sans-serif;
  margin-bottom: 20px;
  border-left: 6px solid var(--red);
  padding-left: 12px;
  transition: transform 0.3s, color 0.3s;
  cursor: default;
}

h1.media-title i{
  color: #111;
  font-size: 32px;
  transition: transform 0.3s, color 0.3s;
}

/* EFFET HOVER */
h1.media-title:hover{
  transform: translateX(6px);
  color: var(--red);
}
h1.media-title:hover i{
  transform: rotate(15deg) scale(1.2);
  color: var(--red);
}

/* LAYOUT MEDIA */
.media-layout{
  display: flex;
  gap: 20px;
  margin-top: 20px;
}
.media-grid{
  flex: 2;
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
  gap:20px;
}
.media-info{
  flex: 1;
  background:#fff;
  padding:16px 20px;
  border-radius:12px;
  box-shadow:0 2px 8px rgba(0,0,0,0.1);
  height: fit-content;
}

/* TITRES ET LISTE */
.media-info h2{
  font-size:20px;
  color:var(--red);
  margin-bottom:12px;
}
.media-info ul{
  list-style:none;
  padding-left:0;
}
.media-info ul li{
  margin-bottom:10px;
  font-size:14px;
  color:#111;
}

/* MEDIA CARD (Vidéos + Audios) */
.media-card{
  background:#fff;
  border-radius:12px;
  overflow:hidden;
  cursor:pointer;
  box-shadow:0 2px 8px rgba(0,0,0,0.1);
  transition:transform 0.3s, box-shadow 0.3s;
  position: relative;
}
.media-card:hover{
  transform:translateY(-6px);
  box-shadow:0 10px 20px rgba(0,0,0,0.15);
}
.media-card img{width:100%; display:block; border-bottom:1px solid #eee;}
.media-card .info{
  padding:12px;
}
.media-card .info h3{
  font-size:18px;
  font-weight:700;
  color:#111;
  margin-bottom:6px;
  font-family:'Segoe UI', Roboto, sans-serif;
}
.media-card .info p{
  font-size:14px;
  line-height:1.5;
  color:#333;
  font-family:'Roboto', sans-serif;
}
.media-card audio{
  width:100%;
  margin-top:10px;
}

/* BADGE NOM D'EMISSION */
.media-badge {
  position: absolute;
  top:10px;
  left:10px;
  background: var(--red);
  color: #fff;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 6px;
  z-index: 10;
  text-transform: uppercase;
}

/* LIGHTBOX */
#video-lightbox{
  position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);
  display:none;align-items:center;justify-content:center;z-index:2000;
}
#video-lightbox iframe{
  width:80%;max-width:900px;height:500px;border:none;border-radius:12px;
}
#video-lightbox .close-btn{
  position:absolute;top:20px; right:30px;font-size:28px;color:#fff;cursor:pointer;font-weight:900;
}
@media(max-width:768px){#video-lightbox iframe{width:95%; height:300px;}}

/* RESPONSIVE : MOBILE */
@media(max-width:900px){
  .media-layout{
    flex-direction: column;
  }
  .media-info{
    margin-top:20px;
  }
}
/* FOOTER */
.footer{
  background:var(--dark);
  color:#fff;
  margin-top:40px;
}
.footer-inner{
  max-width:var(--max);
  margin:auto;
  padding:28px;
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:20px;
}
.footer h4{color:var(--red)}
.footer-bottom{
  background:#000;
  text-align:center;
  padding:12px;
  font-size:12px;
}
.footer-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:30px;
}

.footer-col h4{
  font-size:20px;
  font-weight:800;
  margin-bottom:14px;
  border-bottom:1px solid #777;
  padding-bottom:6px;
}

.footer-list,
.footer-links{
  list-style:none;
  font-size:14px;
  line-height:2;
}

.footer-list i{
  margin-right:8px;
}

.footer-links li{
  cursor:pointer;
  transition:.3s;
}
.footer-links li:hover{
  color:var(--red);
  transform:translateX(4px);
}

.footer-socials{
  margin-top:14px;
  display:flex;
  gap:10px;
}
.footer-socials a{
  background:#fff;
  color:#000;
  width:36px;
  height:36px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:6px;
  transition:.3s;
}
.footer-socials a:hover{
  background:var(--red);
  color:#fff;
}

.footer-news{
  font-size:14px;
  line-height:1.7;
  margin-bottom:14px;
}

.footer-form{
  display:flex;
  gap:8px;
}
.footer-form input{
  flex:1;
  padding:8px;
  border-radius:6px;
  border:none;
}
.footer-form button{
  background:#000;
  color:#fff;
  border:none;
  padding:8px 14px;
  border-radius:6px;
  cursor:pointer;
}

/* Responsive footer */
@media(max-width:900px){
  .footer-grid{
    grid-template-columns:1fr;
  }
}
hr{
    border:none;
    border-top:2px solid var(--gray);
    margin:30px 0;
}
/* ================= RESPONSIVE GLOBAL ================= */

/* Empêcher débordement horizontal */
html, body {
  max-width: 100%;
  overflow-x: hidden;
}

/* TABLETTES (≤ 1024px) */
@media (max-width: 1024px) {

  .container {
    grid-template-columns: 2fr 1fr;
    gap: 16px;
  }

  .slider {
    height: 320px;
  }

  .caption h2 {
    font-size: 15px;
  }

  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* MOBILE & PETITS ÉCRANS (≤ 768px) */
@media (max-width: 768px) {

  /* HEADER */
  .header-top-inner {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .header-actions {
    justify-content: center;
  }

  /* ARTICLES */
  .grid {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 12px;
  }

  /* LIVE */
  .sidebar .box.live iframe {
    height: 220px;
  }

  #live-chat input {
    width: 100%;
    padding: 8px;
    margin-top: 6px;
  }

  /* FOOTER */
  .footer-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-socials {
    justify-content: center;
  }

  .footer-form {
    flex-direction: column;
  }

  .footer-form button {
    width: 100%;
  }
}

/* TRÈS PETITS TÉLÉPHONES (≤ 480px) */
@media (max-width: 480px) {

  .logo-title span {
    font-size: 18px;
  }

  .btn-outline,
  .btn-live {
    font-size: 12px;
    padding: 4px 10px;
  }

  .slider {
    height: 220px;
  }

  .caption h2 {
    font-size: 13px;
  }

  .hero p {
    font-size: 12px;
  }

  .sidebar .box.live iframe {
    height: 200px;
  }
}
/* ================= GRAND ÉCRAN / TV / 2K / 4K ================= */
@media (min-width: 1400px) {

  :root {
    --max: 1400px; /* contenu un peu plus large */
  }

  body {
    font-size: 17px;
  }

  /* HEADER */
  .logo-title span {
    font-size: 26px;
  }

  .menu a {
    font-size: 15px;
  }

  /* HERO */
  .hero p {
    font-size: 15px;
  }

  /* CONTAINER */
  .container {
    gap: 30px;
    padding: 30px 20px;
  }

  /* SLIDER */
  .slider {
    height: 460px;
  }

  /* ARTICLES */
  .grid {
    gap: 24px;
  }

  .card {
    padding: 18px;
  }

  .card h3 {
    font-size: 20px;
  }

  /* LIVE */
  .sidebar .box.live iframe {
    height: 260px;
  }

  /* FOOTER */
  .footer-grid {
    gap: 40px;
  }

  .footer-col h4 {
    font-size: 22px;
  }
}

/* ULTRA GRAND ÉCRAN (4K) */
@media (min-width: 1800px) {

  :root {
    --max: 1600px;
  }

  body {
    font-size: 18px;
  }

  .slider {
    height: 520px;
  }

  .caption h2 {
    font-size: 22px;
  }

  .sidebar .box.live iframe {
    height: 300px;
  }
}
.main-header{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}
body{
  padding-top: 120px; /* hauteur du header */
}


</style>
</head>
<body>

<!-- HEADER -->
<header class="main-header">
  <div class="header-top">
    <div class="header-top-inner">
      <div class="logo-title">
        <img src="gaya.jpg" alt="GAYA INFO TV">
        <span>GAYA INFO TV</span>
      </div>
      <div class="header-actions">
        <span class="btn-outline"><i class="fa-solid fa-radio"></i> Radio</span>
        <span class="btn-live"><i class="fa-solid fa-circle-play"></i> Direct</span>
      </div>
    </div>
  </div>

  <div class="nav-bar">
    <div class="nav-inner">

      <div class="hamburger"><i class="fa-solid fa-bars"></i></div>

      <nav class="menu">
        <a href="index.html">ACCUEIL</a>
        <a href="actualites.html">ACTUALITES</a>
        <div class="dropdown">
          <a href="#" class="dropbtn">EMISSIONS <i class="fa-solid fa-chevron-down"></i></a>
          <div class="dropdown-content">
            <a href="societe.html">Société</a>
            <a href="economie.html">Economie</a>
            <a href="religion.html">Religion</a>
            <a href="sport.html">Sport</a>
            <a href="faitsdivers.html">Faits-Divers</a>
          </div>
        </div>
        <a href="multimedia.html">MULTIMEDIA</a>
        <a href="apropos.html">À PROPOS</a>
        <a href="contact.html">CONTACT</a>
      </nav>

      <div class="nav-right">
        <div class="search-mini">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input placeholder="Rechercher">
        </div>

        <div class="socials">
          <a href="#"><i class="fa-brands fa-x-twitter"></i></a>
          <a href="https://www.facebook.com/gayainfotv" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="#"><i class="fa-brands fa-instagram"></i></a>
          <a href="https://www.youtube.com/@gayainfotv" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-youtube"></i></a>
        </div>
      </div>

    </div>
  </div>
</header>

<!-- CONTENU -->
<div class="container">
  <h1 class="media-title"><i class="fa-solid fa-futbol"></i> Émissions Sport</h1>

  <div class="media-layout">
    <div class="media-grid" id="mediaGrid"></div>

    <aside class="media-info">
      <h2>Émissions en vedette</h2>
      <ul>
        <li>Le Foot du Jour</li>
        <li>Basket en direct</li>
        <li>Analyse Sportive</li>
        <li>Interview des Champions</li>
      </ul>
    </aside>
  </div>
</div>

<!-- LIGHTBOX VIDEO -->
<div id="video-lightbox">
  <span class="close-btn">&times;</span>
  <iframe src="" frameborder="0" allowfullscreen></iframe>
</div>

<!-- FOOTER -->
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-grid">

      <div class="footer-col">
        <h4>Contact</h4>
        <ul class="footer-list">
          <li><i class="fa-solid fa-phone"></i> +243 812 345 678</li>
          <li><i class="fa-solid fa-envelope"></i> info@gayainfotv.com</li>
          <li><i class="fa-solid fa-location-dot"></i> Kinshasa, RDC</li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Émissions</h4>
        <ul class="footer-links">
          <li>Le Foot du Jour</li>
          <li>Basket en direct</li>
          <li>Analyse Sportive</li>
          <li>Interview des Champions</li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Suivez-nous</h4>
        <div class="footer-socials">
          <a href="#"><i class="fa-brands fa-x-twitter"></i></a>
          <a href="#"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="#"><i class="fa-brands fa-instagram"></i></a>
          <a href="#"><i class="fa-brands fa-youtube"></i></a>
        </div>
      </div>

      <div class="footer-col">
        <h4>Newsletter</h4>
        <p class="footer-news">Inscrivez-vous pour recevoir nos dernières émissions.</p>
        <form class="footer-form">
          <input type="email" placeholder="Votre email">
          <button type="submit">S'abonner</button>
        </form>
      </div>

    </div>
  </div>
  <div class="footer-bottom">
    &copy; 2025 GAYA INFO TV. Tous droits réservés.
  </div>
</footer>

<script>
// Dropdown
document.querySelectorAll('.dropbtn').forEach(btn=>{
  btn.addEventListener('click', e=>{
    e.preventDefault();
    let parent = btn.parentElement;
    parent.classList.toggle('show');
  });
});

// Hamburger menu
document.querySelector('.hamburger').addEventListener('click', ()=>{
  document.querySelector('.menu').classList.toggle('show');
});

// Lightbox video
const lightbox = document.getElementById('video-lightbox');
const iframe = lightbox.querySelector('iframe');
document.getElementById('mediaGrid').addEventListener('click', e=>{
  if(e.target.closest('.media-card')){
    const videoURL = e.target.closest('.media-card').dataset.video;
    if(videoURL){
      iframe.src = videoURL;
      lightbox.style.display = 'flex';
    }
  }
});
lightbox.querySelector('.close-btn').addEventListener('click', ()=>{
  iframe.src = '';
  lightbox.style.display = 'none';
});

// Exemple de médias
const medias = [
  {title:'Le Match de la Semaine', description:'Résumé et analyse', type:'video', video:'https://www.youtube.com/embed/dQw4w9WgXcQ', image:'thumb1.jpg', badge:'Foot'},
  {title:'Basket Live', description:'Direct et scores', type:'video', video:'https://www.youtube.com/embed/dQw4w9WgXcQ', image:'thumb2.jpg', badge:'Basket'},
  {title:'Interview Champion', description:'Rencontre exclusive', type:'audio', audio:'audio1.mp3', image:'thumb3.jpg', badge:'Interview'}
];

const grid = document.getElementById('mediaGrid');
medias.forEach(m=>{
  const div = document.createElement('div');
  div.className = 'media-card';
  div.dataset.video = m.video || '';
  div.innerHTML=`
    <img src="${m.image}" alt="${m.title}">
    <span class="media-badge">${m.badge}</span>
    <div class="info">
      <h3>${m.title}</h3>
      <p>${m.description}</p>
      ${m.type==='audio'?`<audio controls src="${m.audio}"></audio>`:''}
    </div>
  `;
  grid.appendChild(div);
});
</script>

</body>
</html>
