# panchito-web

Landing page for **panchito** — an autonomous E2E QA agent. The designer kit
(vanilla HTML/CSS/JS) hosted by **Astro** as a static site. Zero backend, deploys
to **Vercel**.

The page is a *scenario engine wrapped in a scroll narrative*: four auto-playing
demos (blast-radius graph, generate→review→coverage→run→record, multi-channel
chat, self-fix loop) carry the story, plus an interactive **Scenario Engine** and
a comparison table. One shared timeline player drives every demo.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview    # preview the build
npm run check      # astro type check (src only)
```

## Structure

```
public/
  assets/panchito-mark*.svg   logo marks (recreated from the kit thumbnail)
  favicon.svg
  landing/
    i18n.js        bilingual EN/ES dict + persisted toggle (window.t)
    player.js      shared timeline player + renderer factories (Graph, Terminal,
                   CodeDiff, Verdict, GHCard, ChatPanel, Rail, Plan)
    scenarios.js   the 4 demo scripts + engine + hero loop + comparison data
    app.js         boot: wires nav, players, engine, waitlist, language
src/
  styles/
    ds-tokens.css  RECONSTRUCTED design system (see note below)
    landing.css    the designer kit's styles, verbatim (imports ds-tokens)
  pages/index.astro  the kit's markup + <head>; loads the scripts (is:inline)
```

## Provenance & the design-system note

This is the integration of a designer-generated kit (`ui_kits/landing`). Per the
integration rules: **styles always come from the kit**; functionality is the kit's
(it's the more complete implementation) with one fix — `player.js`'s syntax
highlighter was reordered to stash string literals first, so the keyword pass no
longer breaks the injected class attributes.

The kit referenced a design-system token file (`styles.css`) and logo assets that
were **not** included in the export. `src/styles/ds-tokens.css` rebuilds those
tokens (critical hues were pinned by the kit itself; the rest fill each scale
coherently — warm "engineering paper × ember"), and the marks were recreated from
the kit's own thumbnail. If you have the real `styles.css` + assets, drop them in
and delete the reconstruction — it's a clean, swappable token layer.

## Notes

- **Fonts** load from Google Fonts (Bricolage Grotesque / Hanken Grotesk /
  JetBrains Mono) and **lucide** icons from a CDN — both provisional, easy to
  self-host later.
- The **waitlist** stores the email in `localStorage` (no backend). Wire a form
  service (Formspree/Firebase) before launch — see `app.js` `#waitlist`.
- Forward-looking hook: the Scenario Engine can later stream a real bounded run
  from the product's demo-mode endpoint (`window.PANCHITO_DEMO_API`).
- A separate `console/` kit (React/JSX dashboard) ships alongside the landing —
  that's the future ops console, not part of this landing.
