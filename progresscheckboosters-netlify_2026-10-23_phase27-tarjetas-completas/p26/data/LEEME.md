# Cómo editar el contenido (carpeta `data/`)

Cada nivel tiene su archivo: `a1.json`, `a2.json`, `b1.json`, `b2.json`, `c1.json`.
Aquí está **todo el texto** de las unidades. El código de la página (`js/`) no hace falta tocarlo para cambiar contenido.

## Flujo de trabajo
1. Abre el archivo del nivel con un editor de texto (VS Code, o cualquiera que no use formato enriquecido; **no uses Word**).
2. Cambia solo el texto entre comillas. No borres comillas, comas, llaves `{ }` ni corchetes `[ ]`.
3. Guarda y ejecuta el validador: `python3 tools/validate-data.py`
   - **ERROR**: corregir antes de publicar (la página podría fallar).
   - **AVISO**: conviene revisar, pero no impide publicar.
4. Prueba en local o en un *deploy preview* de Netlify y publica.

> La página lee los archivos con `fetch`, por lo que **no funciona abriendo `index.html` con doble clic** (`file://`). Usa Netlify o un servidor local (`python3 -m http.server`).

## Revisar en una tabla (Excel o Google Sheets)
1. `python3 tools/review-export.py a1` crea `review/a1.csv` con todos los textos del nivel (columnas: unidad, campo, texto_actual, **texto_nuevo**, ruta).
2. Ábrelo en Excel o Sheets y escribe tus correcciones solo en `texto_nuevo` (vacío = sin cambio). No toques `ruta` ni `texto_actual`.
3. Guarda como CSV (UTF-8) y ejecuta `python3 tools/review-import.py review/a1.csv --probar` para ver qué cambiaría; sin `--probar` lo aplica (deja una copia en `data/respaldo/`).
4. Ejecuta `python3 tools/validate-data.py`.

## Estructura de cada archivo
```
{ "level": "a1", "boosters": [ ...unidades... ], "speakingCards": { "1": [ ... ] } }
```
`speakingCards` usa como clave el `id` de la unidad.

## Campos de cada unidad (`boosters`)
| Campo | Qué es |
|---|---|
| `id` | Número único de la unidad (1, 2, 3…). No repetir. |
| `units` | Etiqueta visible, p. ej. `"1-2"`. |
| `title`, `badgeEmoji`, `imageUrl` | Título, emoji y foto de la unidad. |
| `teacher` | Guía del docente: `objetivo` (en C1 se llama `objective`), `focus`, y en A1–B2 también `speakingTasks`, `interaccion`. |
| `student.handoutTitle`, `step1Goal`, `step1Text` | Títulos e instrucciones del Paso 1. |
| `student.freeWriteMin` / `freeWriteMax` | Rango de palabras del contador (mínimo < máximo). Debe coincidir con lo que dice `step1Goal`. |
| `student.step1Template` | Plantilla con espacios para completar: `[Nombre]`. Los `**texto**` van en negrita. |
| `student.correctAnswers` | Respuestas aceptadas por espacio: la clave debe ser igual al nombre dentro de `[ ]`. |
| `student.roles`, `scenarios`, `diagOptions`, `vocabWords` | Roles, situaciones, opciones de diagnóstico y vocabulario clave. |
| `student.step2Opener`, `step2Questions` | Paso 2 (speaking). Dejar dos espacios entre `( ) YES` y `( ) NO` es intencional. |
| `student.commonErrors` | Errores frecuentes. |
| `vocabBank` | Lista de `{ "category": "...", "words": [...] }`. |
| `expressions` | Opcional: `{ "category": "...", "phrases": [...] }`. |

## Formato del texto
- Dentro de los textos solo se permite HTML mínimo: `<br>` (salto de línea), `<em>cursiva</em>` y `<strong>negrita</strong>`, sin atributos.
- Cualquier otra etiqueta (`<script>`, `<img>`, `<a>`…) se muestra como texto y el validador la marca como ERROR.

## Reglas de oro
- **No cambies los nombres de los campos** (lo que está a la izquierda de los `:`), solo los valores.
- Un texto con comillas dentro se escribe `\"así\"`.
- Un salto de línea dentro de un texto se escribe `\n`.
- Si el validador indica "línea X, columna Y", casi siempre hay una coma de más/menos cerca de esa línea.
- Inconsistencia conocida: el objetivo docente es `objetivo` en A1–B2 y `objective` en C1. El validador lo comprueba por ti.
