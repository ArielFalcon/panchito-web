# AGENTS.md — panchito-web

Landing page for **panchito** (autonomous E2E QA agent). Astro 5 static site, zero backend, deploys to Vercel. Single page: the designer kit's HTML/CSS/JS hosted by Astro. No framework runtime in the bundle.

## Commands

```bash
npm install
npm run dev        # astro dev → http://localhost:4321
npm run build      # static output → dist/ + .vercel/output/ (Vercel adapter)
npm run preview    # preview the built output
npm run check      # astro check (type-checks src/ only — NOT public/)
```

Node 22 (`.nvmrc`).

## Architecture

```
src/
  pages/index.astro    ← the only page. All markup lives here.
  styles/
    ds-tokens.css       ← design-system entry (imports tokens/*)
    tokens/             ← fonts, colors, typography, spacing, base
    landing.css         ← kit styles verbatim (imports ds-tokens.css)

public/
  landing/
    i18n.js             ← EN/ES dict + language toggle (window.PanchitoI18n, window.t)
    player.js            ← shared timeline player + renderer factories
    scenarios.js         ← 4 demo scripts + scenario engine + comparison data
    app.js               ← boot: wires nav, players, engine, waitlist, language
  assets/                ← SVG logo marks (reconstructed from kit thumbnail)
```

**CSS chain**: `ds-tokens.css` → `landing.css` → imported by `index.astro` frontmatter.

**Scripts** are loaded `is:inline` in `index.astro` — they are **NOT bundled or processed** by Astro.

**Vercel**: `@astrojs/vercel` adapter generates `.vercel/output/` for native Vercel deployment. `astro.config.mjs` has `output: 'static'` with `adapter: vercel()`.

## Rules an agent WILL miss

### Don't touch these
- **`.astro/`** — auto-generated types. Never edit.
- **`src/styles/ds-tokens.css` + `tokens/`** — reconstructed design system. The original kit's token file wasn't included in the export. If the real `styles.css` + assets arrive, drop them in and delete the reconstruction. Until then, this is the source of truth.
- **`public/assets/` SVGs** — also reconstructed from the kit thumbnail.

### Don't modernize the landing scripts
Scripts in `public/landing/` are **vanilla JS IIFEs** — no modules, no imports/exports, no bundler. Waitlist stores in localStorage. Resist the urge to add a framework or bundler. This is intentional.

### i18n works through attributes or window.t()
Static text → `data-i18n="key"` on the element. Dynamic text in JS → `window.t(key)`. The dictionary lives in `public/landing/i18n.js` as `DICT.en` / `DICT.es`. Brand name "panchito" stays in both languages.

### Lucide icons
Loaded from unpkg CDN. Use `<i data-lucide="icon-name"></i>` in markup. In JS, call `lucide.createIcons()` after DOM changes to render new icons.

### TypeScript scope
`tsconfig.json` extends `astro/tsconfigs/strict` and **excludes `public/`**. The landing scripts are not type-checked. `npm run check` only covers `src/`. Path alias: `@/*` → `src/*`.

### Style conventions
Layout uses band/pattern classes: `.band` (section background), `.wrap` (max-width container), `.demo` / `.demo--flip` (demo sections), `.kicker` / `.section-title` / `.lede` (typography hierarchy). Colors: `var(--ink)` for dark bg, `var(--paper)` for editorial bg, `var(--fg)` for text on dark, `var(--fg-ink)` for text on paper.

### Forward-looking hooks
- `window.PANCHITO_DEMO_API` → future demo-mode endpoint for the scenario engine
- `window.LandingState.d2ending` → controls demo2 ending (pass/fail)

### CDN deps (provisional)
- Fonts: Google Fonts (Archivo + JetBrains Mono)
- Icons: unpkg Lucide v0.460.0
- GitHub link: `https://github.com/ArielFalcon/ai-pipeline`

All reasonable to self-host later; nothing blocks on it now.

### No CI / no tests
This is a static landing page with no CI workflows, no test framework, no linter, no formatter. That's by design — nothing to configure here.
