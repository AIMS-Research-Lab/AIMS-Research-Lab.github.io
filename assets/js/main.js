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
    { key: "off-the-grid", label: "Off the Grid", href: "off-the-grid.html" },
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
    // Camera (photo placeholder)
    camera:
      `<svg viewBox="0 0 100 100" ${S}><path d="M14 32h16l6-9h28l6 9h16v45H14Z"/>` +
      `<circle cx="50" cy="54" r="15"/><circle cx="50" cy="54" r="6" stroke-opacity=".5"/><path d="M76 40h4"/></svg>`,
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

  /* ---------- Profile link icons (People page) ----------
     Links are written as plain text ("Email", "LinkedIn", ...) in the HTML;
     here they become icon buttons, keeping the text as the accessible name. */
  const svg = (body) =>
    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const SOCIAL_ICONS = {
    email: svg('<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 6.5 9 6.5 9-6.5"/>'),
    linkedin: svg('<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>'),
    github: svg('<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>'),
    scholar: svg('<path d="M22 9.5 12 4.5 2 9.5l10 5 10-5z"/><path d="M6 11.5v5c3.5 2.5 8.5 2.5 12 0v-5"/><path d="M22 9.5v5"/>'),
    cv: svg('<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14 2.5V8h5.5M15.5 13h-7M15.5 17h-7"/>'),
    institution: svg('<path d="M3 9.5 12 4l9 5.5"/><path d="M4 21h16M5 18h14"/><path d="M6.5 10.5V18M10 10.5V18M14 10.5V18M17.5 10.5V18"/><path d="M4 9.5h16"/>'),
    website: svg('<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.8 3.9 6 3.9 9.5s-1.3 6.7-3.9 9.5c-2.6-2.8-3.9-6-3.9-9.5S9.4 5.3 12 2.5z"/>'),
  };
  /* ---------- Generative card art (People page) ----------
     Every member card gets its own abstract "science" drawing behind the text.
     The style rotates through the set below and the details are seeded from the
     person's name, so each card is unique but stays the same on every visit. */
  function seeded(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 3432918353), (h = (h << 13) | (h >>> 19));
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  }
  const f1 = (n) => n.toFixed(1);
  const ART = {
    // Re-entrant (auxetic) honeycomb
    lattice(r) {
      const w = 52 + r() * 12, h = w * 0.9, d = w * (0.18 + r() * 0.12);
      let p = "";
      for (let y = -h; y < 340; y += h)
        for (let x = -w; x < 340; x += w)
          p += `M${f1(x)} ${f1(y)}h${f1(w)}l${f1(-d)} ${f1(h / 2)}l${f1(d)} ${f1(h / 2)}h${f1(-w)}l${f1(d)} ${f1(-h / 2)}z`;
      return `<g class="mv-breathe"><g transform="rotate(${f1(r() * 30 - 15)} 150 150)"><path class="a" d="${p}"/></g></g>`;
    },
    // Iso-contours of a smooth field
    contours(r) {
      const cx = 90 + r() * 120, cy = 140 + r() * 80, k1 = 2 + Math.floor(r() * 3), k2 = 3 + Math.floor(r() * 3), ph = r() * 6;
      let s = "";
      for (let i = 2; i <= 16; i += 2) {
        let d = "";
        for (let j = 0; j <= 72; j++) {
          const t = (j / 72) * Math.PI * 2;
          const rad = i * 13 * (1 + 0.12 * Math.sin(k1 * t + ph + i * 0.2) + 0.06 * Math.cos(k2 * t - ph));
          d += (j ? "L" : "M") + f1(cx + rad * Math.cos(t)) + " " + f1(cy + rad * Math.sin(t));
        }
        s += `<path class="${i % 4 ? "a" : "b"}" d="${d}z"/>`;
      }
      return `<g class="mv-spin" style="transform-origin:${f1(cx)}px ${f1(cy)}px">${s}</g>`;
    },
    // Graph / neural network
    network(r) {
      const n = Array.from({ length: 9 }, () => [r() * 300, 140 + r() * 160]);
      let s = "";
      n.forEach((a, i) => {
        n.map((b, j) => [j, (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2]).sort((p, q) => p[1] - q[1]).slice(1, 2)
          .forEach(([j]) => (s += `<path class="a mv-signal" style="animation-delay:-${f1(r() * 4)}s" d="M${f1(a[0])} ${f1(a[1])}L${f1(n[j][0])} ${f1(n[j][1])}"/>`));
      });
      n.forEach((a, i) => (s += `<circle class="${i % 3 ? "f" : "fb"} mv-pulse" style="animation-delay:-${f1(r() * 3)}s" cx="${f1(a[0])}" cy="${f1(a[1])}" r="${f1(2 + r() * 3)}"/>`));
      return s;
    },
    // Interfering waves
    waves(r) {
      const k1 = 0.02 + r() * 0.02, k2 = 0.035 + r() * 0.03, ph = r() * 6;
      let s = "";
      for (let i = 0; i < 7; i++) {
        let d = "";
        const y0 = 150 + i * 22, amp = 4 + 10 * Math.sin((i / 6) * Math.PI);
        for (let x = -40; x <= 340; x += 6)
          d += (x > -40 ? "L" : "M") + x + " " + f1(y0 + amp * (Math.sin(x * k1 + ph + i * 0.35) + 0.6 * Math.sin(x * k2 - i * 0.5)));
        s += `<path class="${i % 5 ? "a" : "b"}" d="${d}"/>`;
      }
      return `<g class="mv-drift">${s}</g>`;
    },
    // Activation field on a grid of dots
    dots(r) {
      const peaks = Array.from({ length: 3 }, () => [r() * 300, 80 + r() * 220, 40 + r() * 50]);
      let s = "";
      for (let y = 14; y < 300; y += 26)
        for (let x = 14; x < 300; x += 26) {
          const v = peaks.reduce((acc, [px, py, w]) => acc + Math.exp(-((x - px) ** 2 + (y - py) ** 2) / (2 * w * w)), 0);
          s += `<circle class="${v > 0.6 ? "fb" : "f"} mv-dot" style="animation-delay:-${f1(((x + y) / 600) * 4)}s" cx="${x}" cy="${y}" r="${f1(0.7 + Math.min(v, 1) * 3.4)}"/>`;
        }
      return s;
    },
    // Tilted orbits; each body travels its ellipse, inner ones faster (Kepler)
    orbits(r) {
      const cx = 150 + r() * 60 - 30, cy = 190 + r() * 40;
      let s = "";
      for (let i = 0; i < 4; i++) {
        const rx = 50 + i * 34, ry = rx * (0.3 + r() * 0.3), rot = r() * 180;
        const ring = `M${f1(cx - rx)} ${f1(cy)}a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(2 * rx)} 0a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-2 * rx)} 0`;
        const period = f1(10 * Math.pow(rx / 50, 1.5));
        s += `<g transform="rotate(${f1(rot)} ${f1(cx)} ${f1(cy)})"><path class="${i % 3 ? "a" : "b"}" d="${ring}"/>` +
          `<circle class="fb" r="3.5"><animateMotion dur="${period}s" begin="-${f1(r() * 10)}s" repeatCount="indefinite" path="${ring}"/></circle></g>`;
      }
      return s + `<circle class="fb mv-pulse" cx="${f1(cx)}" cy="${f1(cy)}" r="6"/>`;
    },
    // Streamlines of a vortex flow
    flow(r) {
      const a = 0.012 + r() * 0.01, b = 0.015 + r() * 0.01, ph = r() * 6;
      let s = "";
      for (let i = 0; i < 12; i++) {
        let x = r() * 300, y = 40 + r() * 260, d = `M${f1(x)} ${f1(y)}`;
        for (let k = 0; k < 40; k++) {
          const ang = Math.sin(x * a + ph) * 2.2 + Math.cos(y * b - ph) * 2.2;
          x += Math.cos(ang) * 6; y += Math.sin(ang) * 6;
          d += `L${f1(x)} ${f1(y)}`;
        }
        s += `<path class="${i % 6 ? "a" : "b"} mv-flow" style="animation-delay:-${f1(r() * 3)}s" d="${d}"/>`;
      }
      return s;
    },
    // Finite-element style triangle mesh with a "stress" hotspot
    mesh(r) {
      const step = 46, pts = [], cols = 9, hx = r() * 300, hy = 120 + r() * 160;
      for (let j = 0; j < 9; j++) {
        pts.push([]);
        for (let i = 0; i < cols; i++) pts[j].push([i * step - 15 + (j % 2) * 15 + (r() - 0.5) * 12, j * step - 10 + (r() - 0.5) * 12]);
      }
      let s = "";
      for (let j = 0; j < 8; j++)
        for (let i = 0; i < cols - 1; i++) {
          const A = pts[j][i], B = pts[j][i + 1], C = pts[j + 1][i], D = pts[j + 1][i + 1];
          for (const [p, q, u] of [[A, B, C], [B, D, C]]) {
            const mx = (p[0] + q[0] + u[0]) / 3, my = (p[1] + q[1] + u[1]) / 3;
            const v = Math.exp(-((mx - hx) ** 2 + (my - hy) ** 2) / 5000);
            s += `<path class="${v > 0.35 ? "m mv-hot" : "a"}" style="--v:${f1(v * 0.55)}" d="M${f1(p[0])} ${f1(p[1])}L${f1(q[0])} ${f1(q[1])}L${f1(u[0])} ${f1(u[1])}z"/>`;
          }
        }
      return s;
    },
    // Spectrum bars with an envelope
    spectrum(r) {
      const peaks = Array.from({ length: 3 }, () => [r() * 300, 20 + r() * 40, 0.5 + r() * 0.5]);
      const val = (x) => peaks.reduce((acc, [px, w, h]) => acc + h * Math.exp(-((x - px) ** 2) / (2 * w * w)), 0.08);
      let s = "";
      for (let x = 6; x < 300; x += 16) {
        const v = Math.min(val(x), 1.3), top = 300 - v * 120;
        s += `<path class="${v > 0.7 ? "b" : "a"} mv-bar" style="animation-delay:-${f1(r() * 3)}s" d="M${x} 300V${f1(top)}"/>`;
      }
      return s;
    },
  };
  const ART_ORDER = ["lattice", "waves", "network", "contours", "mesh", "orbits", "flow", "dots", "spectrum"];
  document.querySelectorAll(".person").forEach((card, i) => {
    const name = (card.querySelector("h3") || {}).textContent || String(i);
    const style = card.dataset.art || ART_ORDER[i % ART_ORDER.length];
    if (!ART[style]) return;
    const art = document.createElement("div");
    art.className = "person-art";
    art.setAttribute("aria-hidden", "true");
    art.innerHTML = `<svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMax slice">${ART[style](seeded(name))}</svg>`;
    card.prepend(art);
  });
  const artSvgs = document.querySelectorAll(".person-art svg");
  const stillArt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  artSvgs.forEach((svg) => {
    if (stillArt && svg.pauseAnimations) { svg.pauseAnimations(); svg.setCurrentTime(2); }
  });
  if (!stillArt && "IntersectionObserver" in window) {
    // Only animate cards that are on screen
    const artIO = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
      target.parentElement.classList.toggle("is-paused", !isIntersecting);
      if (target.pauseAnimations) isIntersecting ? target.unpauseAnimations() : target.pauseAnimations();
    }));
    artSvgs.forEach((svg) => artIO.observe(svg));
  }

  /* ---------- PI panel art ----------
     A re-entrant (auxetic) honeycomb blended into the panel background. Its rib
     angle slowly cycles, so the lattice widens and grows taller at the same
     time: the negative Poisson's ratio behind much of the PI's work. */
  const piPanel = document.querySelector("[data-pi-art]");
  if (piPanel) {
    const bg = document.createElement("div");
    bg.className = "pi-bg";
    bg.setAttribute("aria-hidden", "true");
    bg.innerHTML = `<svg viewBox="0 0 1200 800" preserveAspectRatio="xMaxYMax slice"><path class="pl-rib"/><path class="pl-node"/></svg>`;
    piPanel.prepend(bg);
    const rib = bg.querySelector(".pl-rib"), node = bg.querySelector(".pl-node");
    const L = 46, Hr = 54, AX = 1200, AY = 800; // rib lengths; lattice is anchored at the bottom-right corner
    const draw = (theta) => {
      const c = Math.cos(theta), s = Math.sin(theta), W = 2 * L * c, H = 2 * (Hr + L * s);
      let d = "", n = "";
      for (let j = 0; j < Math.ceil(AY / H) + 1; j++)
        for (let i = 0; i < Math.ceil(AX / W) + 2; i++) {
          const x = AX - i * W, y = AY - j * H; // build upward and leftward from the corner
          const y1 = y - Hr, y2 = y1 - L * s, y3 = y2 - Hr, y4 = y3 - L * s;
          d += `M${f1(x)} ${f1(y)}V${f1(y1)}L${f1(x - W / 2)} ${f1(y2)}V${f1(y3)}L${f1(x)} ${f1(y4)}` +
               `M${f1(x)} ${f1(y1)}L${f1(x + W / 2)} ${f1(y2)}M${f1(x - W / 2)} ${f1(y3)}L${f1(x - W)} ${f1(y4)}`;
          n += `M${f1(x)} ${f1(y1)}h0M${f1(x - W / 2)} ${f1(y3)}h0`;
        }
      rib.setAttribute("d", d);
      node.setAttribute("d", n);
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const A0 = (-24 * Math.PI) / 180, A1 = (-8 * Math.PI) / 180;
    let running = false, raf = 0, t0 = performance.now();
    const tick = (now) => {
      const k = 0.5 - 0.5 * Math.cos(((now - t0) / 9000) * Math.PI * 2); // 9 s breathing cycle
      draw(A0 + (A1 - A0) * k);
      raf = running ? requestAnimationFrame(tick) : 0;
    };
    draw(A0);
    if (!reduced && "IntersectionObserver" in window)
      new IntersectionObserver(([e]) => {
        running = e.isIntersecting;
        if (running && !raf) raf = requestAnimationFrame(tick);
      }).observe(piPanel);
  }

  document.querySelectorAll(".person .socials a, .pi .socials a").forEach((a) => {
    const label = a.textContent.trim();
    const icon = SOCIAL_ICONS[a.dataset.social || label.toLowerCase()];
    if (!icon) return;
    const tip = a.href.startsWith("mailto:") ? a.href.slice(7) : label;
    a.setAttribute("aria-label", label === "Email" ? "Email " + tip : label);
    a.title = tip;
    a.classList.add("icon-link");
    a.innerHTML = icon;
  });

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

  /* ---------- Filters (publications, Off the Grid) ---------- */
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

  /* ---------- Off the Grid: photo viewer ---------- */
  const gallery = document.querySelector("[data-gallery]");
  if (gallery && window.HTMLDialogElement) {
    const box = document.createElement("dialog");
    box.className = "lightbox";
    box.setAttribute("aria-label", "Photo viewer");
    box.innerHTML = `
      <div class="lightbox-media"></div>
      <div class="lightbox-bar">
        <div><p class="lightbox-title"></p><p class="lightbox-meta"></p></div>
        <div class="lightbox-nav">
          <span class="lightbox-count"></span>
          <button type="button" data-step="-1" aria-label="Previous photo">←</button>
          <button type="button" data-step="1" aria-label="Next photo">→</button>
          <button type="button" data-close aria-label="Close viewer">✕</button>
        </div>
      </div>`;
    document.body.appendChild(box);
    const media = box.querySelector(".lightbox-media");
    let list = [], idx = 0;

    function show(i) {
      idx = (i + list.length) % list.length;
      const fig = list[idx];
      const src = fig.querySelector(".moment-media");
      media.innerHTML = src.innerHTML;
      media.classList.toggle("is-placeholder", !src.querySelector("img"));
      box.querySelector(".lightbox-title").textContent = fig.querySelector(".moment-title").textContent;
      box.querySelector(".lightbox-meta").textContent = fig.querySelector(".moment-meta").textContent;
      box.querySelector(".lightbox-count").textContent = `${idx + 1} / ${list.length}`;
    }
    gallery.addEventListener("click", (e) => {
      const btn = e.target.closest(".moment-media");
      if (!btn) return;
      list = [...gallery.querySelectorAll(".moment:not([hidden])")];
      show(list.indexOf(btn.closest(".moment")));
      box.showModal();
    });
    box.addEventListener("click", (e) => {
      if (e.target === box || e.target.closest("[data-close]")) box.close();
      const step = e.target.closest("[data-step]");
      if (step) show(idx + Number(step.dataset.step));
    });
    box.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
  }
})();
