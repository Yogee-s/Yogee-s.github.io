# Robotics Portfolio (GitHub Pages)

Static portfolio website for Muthukumaran Yogeeswaran.

## Files
- `index.html` - full portfolio page content
- `styles.css` - visual design and responsive layout
- `script.js` - reveal animation, poster lightbox, and footer date
- `assets/` - project media, reports, resume

## Run locally
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

## Deploy on GitHub Pages
1. Push this folder to a GitHub repository.
2. In repository settings, open `Pages`.
3. Set source to `Deploy from a branch`.
4. Choose branch `main` (or your default branch) and folder `/ (root)`.
5. Save and wait for the Pages URL.

## Update content
- Replace project text in `index.html`.
- Add new media under `assets/` and reference the path in `index.html`.
- For projects still in progress, keep the `Work in Progress` badge and update links when reports are ready.
