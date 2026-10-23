# Pruebas automáticas

Abren el sitio en un navegador real (Chromium) y comprueban, en los 5 niveles: que cada unidad cargue, que los botones
funcionen con la política de seguridad activa, accesibilidad (axe, WCAG 2.2 AA), teclado, vocabulario, verificación de
respuestas, mensajes de error, contenido malicioso y uso sin conexión.

Primera vez (necesita Node.js 18 o superior):

    cd tests
    npm install
    npx playwright install chromium

Cada vez que quiera revisar el sitio antes de publicar:

    cd tests
    npm test                 # los 5 niveles (unos 2-3 minutos)
    node suite.mjs --nivel=a1   # solo un nivel

Para probar el sitio ya publicado (sin la prueba de «sin conexión»):

    BASE_URL=https://smartquizboosters.netlify.app node suite.mjs

Si algo falla, el mensaje dice qué nivel y qué comprobación. No hace falta tocar nada más: esta carpeta
no se publica (netlify.toml la oculta).

Antes de estas pruebas, ejecute también (no necesita instalar nada): `python3 tools/check-site.py`
