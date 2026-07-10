# Robotics Portfolio (yogee-s.github.io)

Personal portfolio of Muthukumaran Yogeeswaran — robotics software & embodied AI.
Built with [Astro](https://astro.build) and deployed to GitHub Pages via GitHub Actions.

## Develop locally

```bash
npm install
npm run dev        # http://localhost:4321
```

## Build & preview the production site

```bash
npm run build
npm run preview
```

## Deploy

Push to `main` — the workflow in `.github/workflows/deploy.yml` builds and deploys automatically.

One-time setup: repository **Settings → Pages → Source = "GitHub Actions"**.
(Rollback path: switch Source back to "Deploy from a branch".)

## Structure

- `src/pages/index.astro` — homepage
- `src/layouts/Base.astro` — shared `<head>`, meta/OG/JSON-LD
- `src/styles/global.css` — design system and responsive layout
- `src/scripts/legacy.js` — interactions (scroll reveals, humanoid project map, lightbox, guide robot)
- `public/assets/` — project media, reports, resume (served at stable `/assets/...` URLs)

## Update content

- Edit text in `src/pages/index.astro`.
- Add media under `public/assets/` and reference it as `/assets/...`.
- Videos: keep `preload="none"` + a `poster` image so nothing auto-downloads.
