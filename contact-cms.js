/* GAYA CMS — Contact */
const GAYA_CONTACT_KEYS = ["gayaCMSData", "gayaCMS", "gayaData", "gaya_cms_v1"];

function contactReadCMS() {
  for (const key of GAYA_CONTACT_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
  }
  return {};
}
function contactEsc(v) {
  return String(v || "").replace(/[&<>'"]/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
  }[c]));
}
function nl2br(v) { return contactEsc(v).replace(/\n/g, "<br>"); }

function applyContactCMS() {
  const data = contactReadCMS();
  const c = data.contact || {};
  if (!Object.keys(c).length) return;

  const ticker = document.querySelector(".ticker-content span");
  if (ticker && data.ticker) ticker.textContent = " " + data.ticker + " ";

  const heroTitle = document.querySelector(".page-hero h1");
  if (heroTitle && c.heroTitle) {
    const t = contactEsc(c.heroTitle);
    heroTitle.innerHTML = t.includes("nous") ? t.replace("nous", "<em>nous</em>") : t;
  }
  const heroText = document.querySelector(".page-hero p");
  if (heroText && c.heroText) heroText.textContent = c.heroText;

  const cards = document.querySelectorAll(".contact-info-card");
  if (cards[0]) {
    const h = cards[0].querySelector("h4");
    const p = cards[0].querySelector("p");
    if (h) h.textContent = c.addressTitle || "Adresse";
    if (p) p.innerHTML = nl2br(c.address || "");
  }
  if (cards[1]) {
    const box = cards[1].querySelector(".contact-info-text");
    if (box) {
      const phones = [c.phone1, c.phone2].filter(Boolean);
      box.innerHTML = `
        <h4>${contactEsc(c.phoneTitle || "Téléphone")}</h4>
        ${phones.map(p => `<a href="tel:+221${String(p).replace(/\D/g,"")}">${contactEsc(p)}</a>`).join("<br>")}
        <p style="font-size:12px; color: var(--color-text-muted); margin-top: 4px;">${contactEsc(c.phoneNote || "Service commercial")}</p>
      `;
    }
  }
  if (cards[2]) {
    const h = cards[2].querySelector("h4");
    const a = cards[2].querySelector("a");
    if (h) h.textContent = c.emailTitle || "E-mail";
    if (a && c.email) { a.textContent = c.email; a.href = `mailto:${c.email}`; }
  }
  if (cards[3]) {
    const h = cards[3].querySelector("h4");
    const p = cards[3].querySelector("p");
    if (h) h.textContent = c.hoursTitle || "Horaires";
    if (p) p.innerHTML = nl2br(c.hours || "");
  }

  const socialLinks = document.querySelectorAll(".contact-social-link");
  if (socialLinks[0] && c.facebook) socialLinks[0].href = c.facebook;
  if (socialLinks[1] && c.youtube) socialLinks[1].href = c.youtube;
  if (socialLinks[2] && c.instagram) socialLinks[2].href = c.instagram;
  if (socialLinks[0] && c.facebookLabel) socialLinks[0].childNodes[socialLinks[0].childNodes.length - 1].textContent = " " + c.facebookLabel;
  if (socialLinks[1] && c.youtubeLabel) socialLinks[1].childNodes[socialLinks[1].childNodes.length - 1].textContent = " " + c.youtubeLabel;
  if (socialLinks[2] && c.instagramLabel) socialLinks[2].childNodes[socialLinks[2].childNodes.length - 1].textContent = " " + c.instagramLabel;

  const formTitle = document.querySelector(".form-header h2");
  const formText = document.querySelector(".form-header p");
  const formNote = document.querySelector(".form-note");
  if (formTitle && c.formTitle) formTitle.textContent = c.formTitle;
  if (formText && c.formText) formText.textContent = c.formText;
  if (formNote && c.formNote) formNote.textContent = c.formNote;
}
document.addEventListener("DOMContentLoaded", () => { applyContactCMS(); setTimeout(applyContactCMS, 250); setTimeout(applyContactCMS, 900); });
window.addEventListener("pageshow", applyContactCMS);
window.addEventListener("storage", applyContactCMS);
