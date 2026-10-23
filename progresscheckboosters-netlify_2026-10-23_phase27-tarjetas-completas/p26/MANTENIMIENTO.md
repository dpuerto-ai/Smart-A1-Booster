# Guía de mantenimiento — Boosters (Progress Check Boosters / Quiz Boosters)

Para la persona docente a cargo. Pensada para quien no programa a diario. Cada tarea indica el comando exacto.

## 1. Qué hay en la carpeta
| Carpeta / archivo | Para qué sirve | ¿Lo editas? |
|---|---|---|
| `data/a1.json … c1.json` | **Todo el contenido** de las unidades | **Sí, aquí trabajas** |
| `data/LEEME.md` | Cómo editar el contenido | Léelo |
| `index.html`, `a1.html … c1.html` | Esqueleto de las páginas | Rara vez |
| `js/engine.js` | Lógica común a los 5 niveles | Solo un desarrollador |
| `js/a1.js … c1.js` | Colores/textos de interfaz y pantallas de cada nivel | Solo un desarrollador |
| `css/` , `fonts/` , `images/` | Estilos, tipografías, logos y fotos | Rara vez |
| `sw.js` | Modo sin conexión | Rara vez (ver §5) |
| `_headers`, `netlify.toml` | Seguridad y configuración de Netlify | No |
| `tools/` | Herramientas de revisión | Las ejecutas |
| `tests/` | Pruebas automáticas | Las ejecutas |
| `CAMBIOS.md` | Historial de cambios técnicos | Léelo |

## 2. Cambiar el contenido (lo habitual)
1. Edita `data/<nivel>.json` con un editor de texto simple (no Word). Detalles en `data/LEEME.md`.
   - O revisa en tabla: `python3 tools/review-export.py a1` → edita `review/a1.csv` en Excel/Sheets (columna `texto_nuevo`) → `python3 tools/review-import.py review/a1.csv`.
2. Revisa: `python3 tools/check-site.py` (incluye la revisión de los textos). Debe terminar en «Se puede publicar».
3. Publica en Netlify (arrastrando la carpeta o con tu flujo habitual) y abre **un nivel en el teléfono** para comprobarlo.
   - Los estudiantes ven el cambio al recargar; el modo sin conexión siempre pide primero lo más nuevo.

## 3. Antes de publicar cambios grandes
- `python3 tools/check-site.py` — revisión rápida, sin instalar nada.
- `cd tests && npm test` — prueba en un navegador real los 5 niveles (ver `tests/README.md`; requiere Node.js la primera vez).

## 4. Fotos de las unidades
Las fotos cargan desde Unsplash. Para tenerlas dentro del sitio (más rápido y disponibles sin conexión), una vez, desde tu computador:
`python3 tools/download-images.py` y publica de nuevo.

## 5. Cuando se agrega o renombra un archivo
Si agregas un nivel, una fuente o un archivo de `js/`, `css/` o `data/`, añádelo a la lista `PRECACHE` de `sw.js`
(`check-site.py` te avisa) y, si cambias la lógica de `sw.js`, sube el número de `VERSION`.
Si agregas una clase de Tailwind nueva, hay que recompilar los estilos (ver `build/README.md`).

## 6. Si algo falla en producción
| Síntoma | Qué mirar |
|---|---|
| Un nivel muestra «No se pudo cargar el contenido» | Un `data/<nivel>.json` mal escrito (coma de más/menos). Ejecuta `python3 tools/validate-data.py`; indica línea y columna. |
| Un texto aparece con `<…>` visibles | Se usó una etiqueta HTML no permitida. Solo `<br>`, `<em>` y `<strong>`. |
| Un botón nuevo no responde | Falta su acción en `ACTIONS` (`js/engine.js`); `check-site.py` y `npm test` lo detectan. |
| Los estudiantes ven el contenido viejo | Publicar de nuevo y recargar; si persiste, subir `VERSION` en `sw.js`. |
| Hay que volver atrás | En Netlify → Deploys → elige un despliegue anterior → «Publish deploy». |

## 7. Decisiones tomadas (para no volver a discutirlas)
- El dominio **no cambia**. «Progress Check Boosters» (Interchange: A1, A2, B1) y «Quiz Boosters» (Passages: B2, C1) se mantienen como nombres distintos.
- El **panel docente** es parte de la misma página (sin PIN ni página aparte) porque estudiantes y docentes usan el mismo sitio.
- Las **encuestas** de experiencia están en Google Forms; el sitio solo enlaza.
- El sitio ya no se incrusta en otras páginas (se migró de Google Sites a Netlify); por eso `_headers` bloquea los marcos.
