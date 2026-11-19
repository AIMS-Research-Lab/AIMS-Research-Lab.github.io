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
├── join.html             Open positions and FAQ
├── contact.html          Contact details
├── 404.html              Not-found page
└── assets/
    ├── css/style.css     All styles (tokens at the top)
    ├── js/theme.js       Applies light/dark theme before first paint
    ├── js/main.js        Shared header/footer, theme toggle, menu, animations, filters
    ├── js/scene.js       3D hero (Three.js, loaded from CDN)
    └── img/              Favicon, photos (add assets/img/people/ for portraits)
```

## Editing

- **Lab email, address, social links and nav:** the `SITE` and `NAV` objects at the top of `assets/js/main.js`. The header and footer on every page come from there.
- **Content:** edit the HTML pages directly. Placeholders are written in `[square brackets]`, and each page has a `HOW TO EDIT` comment.
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
