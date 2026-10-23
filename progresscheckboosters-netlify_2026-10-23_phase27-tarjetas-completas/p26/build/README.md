# Maintenance guide

## File map
- `index.html` – landing page (choose a level). Has its own styles and script.
- `a1.html` … `c1.html` – one page per level; they only contain the page frame and load:
  - `js/engine.js` – logic shared by all levels (self-check, saving answers, survey link, sounds, accessibility, toasts…).
  - `js/<level>.js` – that level's settings (`LEVEL`), screens. Units, vocabulary and speaking cards live in `data/<level>.json`.
- `css/<level>.css` – compiled Tailwind styles (one per page, because each level has its own brand colours).
- `css/a11y.css` – accessibility layer shared by the level pages (focus ring, reduced motion, minimum text size).
- `images/` – logos and book covers; `images/units/` – unit photos (see `tools/download-images.py`).
- `fonts/` + `css/fonts.css` – fuentes alojadas en el sitio. `sw.js` – modo sin conexión (lista `PRECACHE`).
- `_headers` – Netlify security/caching headers. `404.html` – not-found page.

## Common edits
- **Change a unit's text, vocabulary or word targets:** edit `data/<level>.json` (see `data/LEEME.md`) and run `python3 tools/validate-data.py`.
- **Change something every level does (self-check, saving, sounds, survey link):** edit `js/engine.js` once.
- **Change survey links or the storage prefix of one level:** edit the `LEVEL` block at the top of `js/<level>.js`.
- **Pre-fill level/unit in the student survey:** fill `SURVEY_PREFILL` at the top of `js/engine.js` with the form's entry IDs.

## Botones y eventos (sin onclick en el HTML)
La política de seguridad ya no permite scripts escritos dentro del HTML. Los botones no usan `onclick="..."`: declaran
`data-act="accion"` (y `data-a0`, `data-a1`… como argumentos) y `js/engine.js` los ejecuta con la tabla `ACTIONS`
(campos de texto: `data-in` y `INPUT_ACTIONS`). Para un botón nuevo: agrega la acción a `ACTIONS` y usa `data-act` en el HTML.
Respaldo de imágenes: `data-fallback`, `data-onerr` (ver `js/img-fallback.js`).
Pantallas comunes a los 5 niveles (carrusel, panel de vocabulario, verificación, burbujas de diálogo, sonidos): `engine.js`;
colores y textos propios de cada nivel: `LEVEL.theme` y `LEVEL.ui` al inicio de `js/<nivel>.js`.

## Important: rebuild the CSS after adding Tailwind classes
The site no longer loads Tailwind from the internet. If you add a *new* Tailwind class
(for example `bg-emerald-500`) to any page or script, it will not be styled until you run:

    cd build
    npm install        # first time only
    ./build-css.sh

Do not upload `build/node_modules` to Netlify.
