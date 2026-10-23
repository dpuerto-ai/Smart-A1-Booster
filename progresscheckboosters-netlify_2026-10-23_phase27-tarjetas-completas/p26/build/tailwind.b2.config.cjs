module.exports = Object.assign({
        theme: {
          extend: {
            colors: {
              brand: {
                red: '#D42D20',          /* Passages Red (Primary) */
                burgundy: '#8E231E',     /* Editorial Burgundy (Secondary) */
                green: '#8CD63F',        /* Learning Green (Accent) */
                mint: '#6FD4C1',         /* Fresh Mint (Interactive) */
                aqua: '#B8EFE5',         /* Soft Aqua (Soft backgrounds) */
                warmwhite: '#FAFAF7',    /* Warm White (Main background) */
                graphite: '#473632',     /* Graphite Brown (Main text) */
                lightgray: '#ECECEC'     /* Light Gray (Support / borders) */
              }
            }
          }
        }
      }, { content: ['../b2.html', '../js/b2.js', '../js/engine.js'] });
