module.exports = Object.assign({
        theme: {
          extend: {
            colors: {
              brand: {
                teal: '#0F7C86',       /* Teal Principal (Primario) */
                red: '#D9201C',        /* Passages Red (Secundario / CTAs) */
                redDark: '#C62828',    /* Passages Red Dark (Gradient end) */
                lime: '#8DD23F',       /* Lima Energía (Acento / Éxitos) */
                mint: '#6FD4C1',       /* Mint Fresco (Interactivo / Hover) */
                aqua: '#B6E6E1',       /* Aqua Suave (Fondo secundario / Tarjetas) */
                warmwhite: '#FAFAF7',  /* Blanco Cálido (Fondo principal) */
                darkteal: '#0D4E56',   /* Teal Oscuro (Navegación / Texto principal) */
                graphite: '#4A4A4A'    /* Gris Grafito (Texto secundario / Descripciones) */
              }
            }
          }
        }
      }, { content: ['../c1.html', '../js/c1.js', '../js/engine.js'] });
