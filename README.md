# AIMS Research Lab website

The static website for AIMS Research Lab, hosted on GitHub Pages. It has no build step and no dependencies to install.

## Structure

```
.
├── index.html            Home
├── research.html         Research themes
├── people.html           Team, PI, alumni
├── publications.html     Papers, filterable by type
├── news.html             Lab news
├── off-the-grid.html     Photo wall of lab moments (with viewer)
├── join.html             Open positions and FAQ
├── contact.html          Contact details
├── 404.html              Not-found page
└── assets/
    ├── css/style.css     All styles (tokens at the top)
    ├── js/theme.js       Applies light/dark theme before first paint
    ├── js/main.js        Shared header/footer, theme toggle, menu, animations, filters
    ├── js/scene.js       Per-page 3D background animations (Three.js, from CDN)
    └── img/              Favicon; moments/ for Off the Grid photos (add people/ for portraits)
```

## Editing

- **Lab email, address, social links and nav:** the `SITE` and `NAV` objects at the top of `assets/js/main.js`. The header and footer on every page come from there.
- **Off the Grid photos:** add images to `assets/img/moments/` and follow the `HOW TO ADD A PHOTO` comment in `off-the-grid.html`.
- **Content:** edit the HTML pages directly. Placeholders are written in `[square brackets]`, and each page has a `HOW TO EDIT` comment.
- **Background animations:** each page picks one with `data-anim` on its `<canvas>`:
  `auxetic` (Home), `waves` (Research), `orbits` (People), `layers` (Publications),
  `stream` (News), `flock` (Off the Grid), `modes` (Join Us), `ripple` (Contact).
  Swap the names to reassign, or add a new builder to `BUILDERS` in `assets/js/scene.js`.
- **Colours and fonts:** the CSS variables in `:root` (light) and `:root[data-theme="dark"]` (dark) at the top of `assets/css/style.css`.
- **Dark mode:** follows the visitor's OS setting by default. The sun/moon button in the header switches themes, and the choice is saved in the browser.

## Run locally

The 3D scene is an ES module, so it needs a local server. Opening the file directly won't load it.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Push to `main`, then in **Settings → Pages** set the source to `main` / root.

## Cache-busting

Every page loads the shared CSS/JS with a version tag, e.g. `assets/js/main.js?v=2026111901`.
After changing any file in `assets/`, bump the number on all pages so visitors get the new version straight away:

```bash
sed -i '' -E 's/\?v=[0-9]+/?v=NEW_NUMBER/g' *.html   # macOS
```
