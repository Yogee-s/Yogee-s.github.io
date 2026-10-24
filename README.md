# Robotics Portfolio (yogee-s.github.io)

Personal portfolio of Muthukumaran Yogeeswaran: robotics software and embodied AI.
Built with [Astro](https://astro.build) + three.js and deployed to GitHub Pages via GitHub Actions.

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

Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and deploys automatically.

## Structure

- `src/data/projects.ts`: every project (featured flag, summary, highlight, tags, preview, links). The homepage rows, the "More projects" drawer, the case-study pages and the point-cloud scenes all read from here.
- `src/data/experience.ts`: roles (with start/end months for the timeline bars), education, leadership.
- `src/components/`: page sections (`Hero`, `Work`, `ProjectCard`, `Experience`, `About`, `Contact`), the case-study wrapper (`CaseStudy`) and one file per case study in `case-studies/`.
- `src/pages/index.astro`: homepage. Case studies open in an overlay and update the URL to `/work/<slug>/`.
- `src/pages/work/[slug].astro`: standalone, shareable case-study pages (same content as the overlay).
- `src/scripts/scan.js`: the point-cloud renderer (hero scan + one scene per project).
- `src/scripts/home.js`, `src/scripts/case-study.js`: homepage and case-study behaviour.
- `src/styles/`: `tokens.css` (colours, type), `base.css`, `chrome.css` (nav/footer), `home.css`, `case-study.css`.
- `public/assets/`: project media, reports and resume, served at stable `/assets/...` URLs.
- `tools/make-previews.sh`: rebuilds the short preview loops in `public/assets/previews/` with ffmpeg.

## Update content

- Projects: edit `src/data/projects.ts` (set `featured: true` to show a project as a main row).
- Case-study text: edit the matching file in `src/components/case-studies/`.
- Videos: keep them muted loops with a `poster`; they only play while on screen.
