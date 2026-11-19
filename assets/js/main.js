/* =========================================================
   AIMS Research Lab — site script
   - Injects the shared header and footer (edit them once, here)
   - Mobile menu, scroll state, reveal-on-scroll
   - Hero word rotator, publication filters, line icons
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Site config: edit these ---------- */
  const SITE = {
    name: "AIMS Research Lab",
    email: "aims.lab@university.edu",          // TODO: replace with the lab email
    address: ["[Department Name]", "[University Name]", "[City, Country]"],
    links: [
      { label: "Google Scholar", href: "#" },  // TODO: add real profile URLs
      { label: "GitHub", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  };

  const NAV = [
    { key: "research", label: "Research", href: "research.html" },
    { key: "people", label: "People", href: "people.html" },
    { key: "publications", label: "Publications", href: "publications.html" },
    { key: "news", label: "News", href: "news.html" },
    { key: "join", label: "Join Us", href: "join.html" },
    { key: "contact", label: "Contact", href: "contact.html" },
  ];

  /* ---------- Icons ---------- */
  const LOGO =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M3.5 4 12 8.2 20.5 4v16L12 15.8 3.5 20Z"/><circle cx="12" cy="8.2" r="1.3" fill="currentColor"/><circle cx="12" cy="15.8" r="1.3" fill="currentColor"/></svg>';

  const ARROW_UR =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';

  const SUN =
    '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
  const MOON =
    '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>';

  const S = 'fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"';
  const ICONS = {
    // Equations meet data: a field curve with sampled points
    physics:
      `<svg viewBox="0 0 100 100" ${S}><path d="M6 70C22 70 24 22 40 22s20 56 36 56 14-28 18-34"/>` +
      [12, 26, 40, 54, 68, 82].map((x, i) => `<circle cx="${x}" cy="${[64, 34, 22, 50, 76, 60][i]}" r="2.6" fill="currentColor"/>`).join("") +
      `<path d="M6 90h88M6 90V8" stroke-opacity=".35"/></svg>`,
    // Map from one function space to another
    operator:
      `<svg viewBox="0 0 100 100" ${S}><rect x="6" y="26" width="34" height="48" rx="4"/><rect x="60" y="26" width="34" height="48" rx="4"/>` +
      `<path d="M10 58c6-14 12 6 18-8s8 4 8 4"/><path d="M64 44c8 0 8 22 16 22s8-14 10-14"/><path d="M42 50h16M53 45l5 5-5 5"/>` +
      `<path d="M6 38h34M6 62h34M60 38h34M60 62h34" stroke-opacity=".25"/></svg>`,
    // Re-entrant (bow-tie) honeycomb lattice
    lattice: (function () {
      let p = "";
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++) {
          const x = 10 + c * 28, y = 10 + r * 28;
          p += `<path d="M${x} ${y} L${x + 14} ${y + 7} L${x + 28} ${y} L${x + 28} ${y + 28} L${x + 14} ${y + 21} L${x} ${y + 28}Z"/>`;
        }
      return `<svg viewBox="0 0 100 100" ${S}>${p}</svg>`;
    })(),
    // Closed design loop
    loop:
      `<svg viewBox="0 0 100 100" ${S}><circle cx="50" cy="50" r="32" stroke-dasharray="3 5"/>` +
      `<circle cx="50" cy="18" r="8" fill="var(--bg)"/><circle cx="78" cy="66" r="8" fill="var(--bg)"/><circle cx="22" cy="66" r="8" fill="var(--bg)"/>` +
      `<path d="M50 14v8M46 18h8"/><rect x="74.5" y="62.5" width="7" height="7"/><path d="M18 66h8"/>` +
      `<path d="M83 34l-4 5-5-3"/></svg>`,
  };

  /* ---------- Header / footer ---------- */
  const page = document.body.dataset.page || "";

  function headerHTML() {
    const links = NAV.map(
      (n) => `<a href="${n.href}"${n.key === page ? ' aria-current="page"' : ""}>${n.label}</a>`
    ).join("");
    const mobile = NAV.map(
      (n, i) => `<li><a href="${n.href}"${n.key === page ? ' aria-current="page"' : ""}>${n.label}<span>0${i + 1}</span></a></li>`
    ).join("");
    return `
      <a class="skip-link" href="#main">Skip to content</a>
      <header class="site-header">
        <a class="brand" href="index.html" aria-label="${SITE.name}, home">
          <span class="brand-mark">${LOGO}</span><span class="brand-name">AIMS</span><span>Research Lab</span>
        </a>
        <div class="header-actions">
          <nav class="nav" aria-label="Primary">${links}</nav>
          <button class="theme-toggle" type="button" aria-label="Toggle dark mode">${SUN}${MOON}</button>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav">
            <span class="bars" aria-hidden="true"><i></i><i></i></span><span class="menu-label">Menu</span>
          </button>
        </div>
      </header>
      <div class="mobile-nav" id="mobile-nav">
        <ul>${mobile}</ul>
        <p class="meta">${SITE.address.join(" · ")}</p>
      </div>`;
  }

  function footerHTML() {
    const nav = NAV.map((n) => `<li><a href="${n.href}">${n.label}</a></li>`).join("");
    const ext = SITE.links.map((l) => `<li><a href="${l.href}" target="_blank" rel="noopener">${l.label}</a></li>`).join("");
    return `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-top">
            <div class="footer-word">AIMS<br>Research Lab</div>
            <div class="footer-col"><h4>Explore</h4><ul>${nav}</ul></div>
            <div class="footer-col"><h4>Visit</h4><ul>${SITE.address.map((a) => `<li>${a}</li>`).join("")}</ul></div>
            <div class="footer-col"><h4>Connect</h4><ul><li><a href="mailto:${SITE.email}">${SITE.email}</a></li>${ext}</ul></div>
          </div>
          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} ${SITE.name}</span>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </footer>`;
  }

  document.querySelectorAll('[data-include="header"]').forEach((el) => (el.outerHTML = headerHTML()));
  document.querySelectorAll('[data-include="footer"]').forEach((el) => (el.outerHTML = footerHTML()));
  document.querySelectorAll("[data-icon]").forEach((el) => (el.innerHTML = ICONS[el.dataset.icon] || ""));
  document.querySelectorAll("[data-arrow]").forEach((el) => (el.innerHTML = ARROW_UR));
  document.querySelectorAll("[data-email]").forEach((el) => {
    el.href = "mailto:" + SITE.email;
    if (!el.textContent.trim()) el.textContent = SITE.email;
  });
  document.body.id = document.body.id || "top";

  /* ---------- Header scroll state ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const THEME_KEY = "aims-theme";
  const themeBtn = document.querySelector(".theme-toggle");
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", String(t === "dark"));
      themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
      themeBtn.title = themeBtn.getAttribute("aria-label");
    }
  }
  applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }
  // Follow OS changes until the visitor picks a theme themselves
  const mqDark = window.matchMedia("(prefers-color-scheme: dark)");
  mqDark.addEventListener("change", (e) => {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (err) {}
    if (!saved) applyTheme(e.matches ? "dark" : "light");
  });

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".menu-toggle");
  const panel = document.getElementById("mobile-nav");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  }
  if (toggle && panel) {
    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    panel.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
    document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
    window.matchMedia("(min-width: 1081px)").addEventListener("change", (e) => e.matches && setMenu(false));
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            io.unobserve(en.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Hero word rotator ---------- */
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-rotate]").forEach((el) => {
    let words;
    try { words = JSON.parse(el.dataset.rotate); } catch (e) { return; }
    const span = el.querySelector("span") || el.appendChild(document.createElement("span"));
    let i = 0;
    span.textContent = words[0];
    if (reduced || words.length < 2) return;
    setInterval(() => {
      span.classList.add("is-out");
      setTimeout(() => {
        i = (i + 1) % words.length;
        span.textContent = words[i];
        span.classList.remove("is-out");
      }, 450);
    }, 2800);
  });

  /* ---------- Publication filters ---------- */
  const filterBar = document.querySelector("[data-filters]");
  if (filterBar) {
    const items = document.querySelectorAll("[data-type]");
    const years = document.querySelectorAll(".pub-year");
    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      const f = btn.dataset.filter;
      filterBar.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      items.forEach((it) => (it.hidden = f !== "all" && it.dataset.type !== f));
      // hide year headings with no visible entries
      years.forEach((y) => {
        const list = y.nextElementSibling;
        y.hidden = list && !list.querySelector("[data-type]:not([hidden])");
        if (list) list.hidden = y.hidden;
      });
    });
  }
})();
