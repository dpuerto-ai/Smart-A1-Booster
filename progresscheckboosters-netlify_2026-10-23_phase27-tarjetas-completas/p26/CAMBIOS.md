# Cambios – Fases 1, 2 y 3 (2026-10-22)

Base: `progresscheckboosters-netlify_2026-10-19_phase19`. No se tocó el dominio, el diseño ni los contenidos pedagógicos.

## Fase 1 – Fallos que afectaban al estudiante
- **Audio y copiado con apóstrofo o comillas** (`js/a1.js … c1.js`, `js/engine.js`): el texto ya no se inserta dentro de `onclick="speakText('…')"`; se guarda en `data-say` escapado (`escAttr`). Antes fallaban 8 botones únicos en B1 (consignas con comillas dobles y "doctor's appointment") y 1 en C1 ("Buyer's remorse"). Ahora 0 en los cinco niveles.
- **Reglas de hora en A1** (`js/a1.js`): `am` y `pm` se reconocen solo como palabra completa (`7 am`, `7am`, `7 a.m.`). Antes aceptaba `name`, `same`, `exam`.
- **Mensaje de "Verificar respuestas"** (los 5 niveles): ya no dice "validado/verified"; dice que los espacios están completos y que se revisen.
- **Temporizadores** (`js/engine.js`): el temporizador docente y el de turnos usan el reloj (hora de fin) en lugar de restar 1 por tick. Con la pestaña dormida 30 s, el original descontaba 1 s; ahora descuenta 30 s.
- **Copiar al portapapeles**: usa `navigator.clipboard` con respaldo; se definió `copyTip` (antes quedaba vacío).

## Fase 2 – Metadatos y nombres
- `og:url`, `og:image` y nuevo `rel="canonical"` apuntan a `https://smartquizboosters.netlify.app` (antes `progresscheckboosters.netlify.app`). Se añadieron las dimensiones de la imagen (1200×630).
- **Nombre por material**: Interchange (A1, A2, B1) = *Progress Check Boosters*; Passages (B2, C1) = *Quiz Boosters* (`<title>`, `og:title`, encabezado de C1). La descripción de la portada menciona ambos.

## Fase 3 – Accesibilidad, móvil y proyector
- **Foco y teclado** (`js/engine.js`): panel de vocabulario, panel de expresiones y ventanas de aviso/confirmación mueven el foco al abrirse, mantienen Tab dentro, vuelven el foco al botón que las abrió y dejan el resto de la página `inert` mientras están abiertas. Escape cierra todas. Los paneles cerrados ya no se pueden alcanzar con Tab ni con lector de pantalla (`css/a11y.css`).
- **Ventanas**: `aria-modal`, `aria-label` y `aria-describedby` en aviso y confirmación (los 5 HTML). El buscador y el botón de limpiar de los paneles tienen nombre accesible.
- **Controles nativos**: cada palabra/frase de los paneles es ahora un `<button>` (antes un `<div onclick>` con un botón dentro); las tarjetas de rol declaran `role="button"` y `aria-pressed` en el código, no por el parche posterior.
- **Iconos**: 🔊 y 🔇 pasan a SVG con `aria-label` ("Escuchar: palabra" / "Listen: word"); las imágenes de las tarjetas junto al título son decorativas (`alt=""`).
- **Móvil/tablet**: el botón de sonido pasa del flotante (tapaba las pestañas en teléfono) a la cabecera; objetivos táctiles de 40 px en los botones de audio; los puntos del carrusel tienen área de 24 px y en pantallas estrechas se reemplazan por un contador "3 / 13".
- **Contraste** (axe-core, WCAG 2.2 AA): naranja y morado de textos pequeños, colores propios de A2, B1 y C1, y tarjetas atenuadas (carrusel y compañero de rol) ahora se desaturan en lugar de bajar la opacidad. Resultado: 0 infracciones en los 5 niveles y 7 estados (antes: contraste y tamaño de objetivos).
- **Modo proyector**: al activarlo, el panel docente se minimiza al botón con el tiempo, para no tapar la actividad.

## Pendiente (no incluido)
- Reglas de verificación por sufijo (`ed`, `er`, `est`, `ing`) y campos sin regla: se revisarán con el contenido pedagógico.
- Fases 4 a 7 del plan (datos en JSON y código unificado, recursos locales y funcionamiento sin conexión, seguridad, pruebas y despliegue).
- Se observó para la revisión pedagógica: las tarjetas de unidad muestran el texto de guía docente ("Ensure students accurately structure…") y la portada de B2 mezcla español e inglés.

---

## Fase 4a — El contenido pasa a archivos JSON (`data/`)

**Qué cambió**
- Todo el texto de las unidades (boosters y tarjetas de speaking) salió de `js/a1.js … c1.js` y vive ahora en `data/a1.json … c1.json`. Los nombres de los campos son los mismos que antes.
- `js/engine.js` carga el JSON al abrir la página (`loadLevelData`) y muestra "Cargando contenido…". Si falla, muestra un mensaje claro con botón "Reintentar" (y un aviso específico si se abre con doble clic, `file://`).
- Cada `js/<nivel>.js` bajó a ~76 KB.
- Nuevo `tools/validate-data.py`: revisa los JSON antes de publicar (sintaxis, campos obligatorios, ids, corchetes, rangos de palabras, reglas de respuesta sin espacio correspondiente).
- Nuevo `data/LEEME.md`: guía para editar el contenido.
- `_headers`: `/data/*` se revalida siempre, para que los cambios se vean al publicar.

**Corrección incluida:** C1 unidad 1 tenía el campo del objetivo docente con otro nombre y el panel mostraba «undefined»; ahora se muestra bien.

**Verificación:** el contenido renderizado de los 5 niveles es idéntico al de la Fase 3 (salvo la corrección de C1); axe, teclado, buscador de vocabulario, audio, temporizadores y portapapeles sin regresiones; rutas de error probadas.

**Ahora, para editar contenido:** modifica `data/<nivel>.json`, ejecuta `python3 tools/validate-data.py` y publica. Ya no se toca `js/`.

---

## Fase 5 — Recursos propios y modo sin conexión

- **Fuentes locales** (`fonts/`, `css/fonts.css`): Inter, Plus Jakarta Sans, JetBrains Mono, Montserrat, Poppins y Lato se sirven desde el propio sitio (subconjunto latino, ~250 KB en total; cada página descarga solo las suyas). Se eliminó Google Fonts de todas las páginas y de la política de seguridad (`_headers`). Ya no se envía información a terceros por las fuentes y el sitio se ve igual con red lenta o bloqueada.
- **Modo sin conexión** (`sw.js`, `js/sw-register.js`): tras la primera visita, el sitio completo (portada, 5 niveles, contenido, fuentes) queda guardado en el dispositivo y abre sin internet. Con internet siempre se usa lo más reciente (si la red tarda más de 4 s se usa la copia guardada), así que los cambios en `data/*.json` se ven en cuanto se publican, sin pasos extra.
- **Fotos de unidades:** `tools/download-images.py` ahora también lee `data/*.json`. Las fotos siguen cargando desde Unsplash (con respaldo local en `images/units/` si ejecutas la herramienta); las que se hayan visto una vez también quedan guardadas para uso sin conexión.
- `_headers`: `sw.js` sin caché; `fonts/` con caché de un año.

**Si agregas o renombras archivos** (un nivel nuevo, otra fuente): actualiza la lista `PRECACHE` de `sw.js`.

---

## Fase 4b — Lógica común en un solo lugar

- Pasaron a `js/engine.js` (una sola copia para los 5 niveles): carrusel de la portada, panel de vocabulario, progreso y verificación de respuestas, burbujas de diálogo, sonidos, confeti y las variables de estado. Cada `js/<nivel>.js` bajó de ~1140 a ~760 líneas.
- Lo propio de cada nivel quedó al inicio de su archivo, en `LEVEL.theme` (colores, sonidos, confeti), `LEVEL.ui` (textos de interfaz) y `LEVEL.regexAnswers` (solo A1 acepta reglas de respuesta como expresiones regulares, igual que antes).
- Siguen separadas por nivel las tres pantallas grandes (portada, vista del estudiante, panel docente): difieren de verdad entre niveles y unificarlas habría puesto en riesgo el aspecto de cada uno.
- Verificación: el HTML que genera cada nivel (portada en carrusel y cuadrícula, cada unidad en pasos 1 y 2, con rol, panel docente, vocabulario con y sin resultados, mensajes de verificación, frecuencias de sonido y colores del confeti) es idéntico al de la versión anterior en 572 puntos de comparación.

## Fase 4c — Eventos y seguridad

- Se eliminaron todos los `onclick`/`oninput`/`onerror` escritos en el HTML y en las plantillas: los botones declaran `data-act="accion"` y `engine.js` los ejecuta con la tabla `ACTIONS` (ver `build/README.md`). Los textos que antes viajaban dentro de código (por ejemplo la categoría de vocabulario) ahora van como atributos escapados.
- Los dos scripts escritos dentro de `index.html` pasaron a `js/index-menu.js` y `js/index-stage.js`; el respaldo de imágenes a `js/img-fallback.js`.
- `_headers`: la política de seguridad ya **no permite scripts dentro del HTML** (`script-src 'self'`). Es la defensa principal contra inyección de código.
- Contenido: el cargador solo deja pasar `<br>`, `<em>` y `<strong>` en los textos de `data/*.json`; cualquier otra etiqueta se muestra como texto. El validador la marca como ERROR.
- Nuevo: revisión en tabla. `tools/review-export.py` genera un CSV por nivel (para Excel/Sheets) y `tools/review-import.py` aplica las correcciones al JSON con copia de respaldo. Guía en `data/LEEME.md`.
- `sw.js` (v2): incluye los archivos nuevos en la copia para uso sin conexión.
- Verificación: 3.600 clics reales sobre 32 tipos de acción en los 5 niveles con la política de seguridad activa: 0 errores y 0 bloqueos; accesibilidad (axe), teclado, buscador, audio, temporizadores, portapapeles, sin conexión y mensajes de error sin cambios; prueba con contenido malicioso: no se ejecuta nada.

---

## Fases 6 y 7 — Endurecimiento, pruebas y mantenimiento

**Seguridad (Fase 6, acotada).** Se mantiene el panel docente dentro de la misma página, sin PIN ni página aparte (decisión de la academia), y las encuestas siguen en Google Forms. Como el sitio ya no se incrusta en Google Sites, `_headers` ahora impide que otras webs lo muestren dentro de un marco (`frame-ancestors 'none'`, `X-Frame-Options: DENY`) y aísla la ventana (`Cross-Origin-Opener-Policy`).

**Despliegue.** `netlify.toml`: publica la carpeta tal cual y oculta las carpetas internas (`tools/`, `build/`, `tests/`, `review/`, `data/respaldo/`) del sitio publicado.

**Revisión previa a publicar.** `python3 tools/check-site.py` (sin instalar nada): contenido de `data/*.json`, archivos que las páginas usan, lista del modo sin conexión (`sw.js`), ausencia de scripts/handlers dentro del HTML y protecciones de `_headers`.

**Pruebas automáticas.** `tests/` (`npm test`): en un navegador real y con la política de seguridad activa, para los 5 niveles: carga de cada unidad, botones, verificación de respuestas, carrusel, vocabulario con teclado, accesibilidad (axe, WCAG 2.2 AA), contenido malicioso, errores de carga y uso sin conexión. Resultado actual: 76 comprobaciones correctas, 0 fallidas. Se comprobó que detectan una avería provocada a propósito.

**Guía.** `MANTENIMIENTO.md`: mapa de archivos, tareas habituales con su comando, qué hacer si algo falla y decisiones tomadas.


## Revisión pedagógica (comparación con diapositivas oficiales)
- Tarjetas de speaking alineadas con las diapositivas: A1 U5-6, 7-8, 9-10, 13-14, 15-16; A2 U5-6, 9-10, 11-12, 15-16.
- A2 U5-6, 9-10, 11-12, 15-16: plantilla, roles, escenarios, preguntas, errores comunes ajustados a la nueva tarjeta. Títulos nuevos: «Country Quiz & Alibis» (11-12) y «Lost Opportunities & Hypotheticals» (15-16).
- A1: se actualizaron las preguntas de la Fase 2 de las unidades afectadas.
- Cada unidad ahora puede mostrar varias tarjetas de speaking, rotuladas (1/2), (2/2) (cambio en js/a1..c1.js).
- Segunda tarjeta por par de unidades en A1, A2 y B1 (y FINAL); A1 y A2 con ambas tarjetas completas según las diapositivas.
- C1: segunda tarjeta con las tareas del «Second attempt» en las unidades 1-12; el examen final ahora usa los temas de las diapositivas de C1 (tecnología en la escuela, animales, modelos a seguir, arte) en lugar del texto de Suecia, que era de B2.
