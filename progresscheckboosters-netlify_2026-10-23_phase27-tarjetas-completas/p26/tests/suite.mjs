// Pruebas automáticas del sitio (navegador real). Ver tests/README.md.
//   cd tests && npm install && npx playwright install chromium   (solo la primera vez)
//   npm test
// Opciones:  node suite.mjs --nivel=a1   (un solo nivel)   |   BASE_URL=https://... node suite.mjs  (probar un sitio ya publicado)
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)); const root = path.resolve(here, '..');
const only = (process.argv.find(a => a.startsWith('--nivel=')) || '').split('=')[1];
const LEVELS = only ? [only] : ['a1', 'a2', 'b1', 'b2', 'c1'];
const axeSource = fs.readFileSync(path.join(here, 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');

// ---- servidor local que imita a Netlify: URLs sin .html y encabezados de _headers ----
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const headerBlock = (fs.existsSync(path.join(root, '_headers')) ? fs.readFileSync(path.join(root, '_headers'), 'utf8') : '').split(/\n\s*\n/)[0];
const globalHeaders = Object.fromEntries(headerBlock.split('\n').slice(1).map(l => l.trim()).filter(Boolean).map(l => [l.slice(0, l.indexOf(':')), l.slice(l.indexOf(':') + 1).trim()]));
let server;
const startServer = () => new Promise(res => {
  server = http.createServer((req, rsp) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p === '/') p = '/index.html';
    let f = path.join(root, p); if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rsp.writeHead(404, { 'Content-Type': 'text/plain' }); return rsp.end('404'); }
    rsp.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache', ...globalHeaders }); fs.createReadStream(f).pipe(rsp);
  }).listen(0, () => res(server.address().port));
});
const stopServer = () => new Promise(r => { server.closeAllConnections?.(); server.close(r); });

// ---- infraestructura mínima de pruebas ----
let pass = 0, fail = 0; const failures = [];
const ok = (cond, name, detail = '') => { if (cond) pass++; else { fail++; failures.push(name + (detail ? ' → ' + detail : '')); console.log('  ✗ ' + name + (detail ? ' → ' + detail : '')); } };
const section = t => console.log('\n' + t);

const port = process.env.BASE_URL ? null : await startServer();
const base = process.env.BASE_URL || `http://localhost:${port}`;
const browser = await chromium.launch();
const newCtx = (extra = {}) => browser.newContext({ viewport: { width: 1280, height: 900 }, ...extra });
const watch = (p, bag) => { p.on('pageerror', e => bag.push('error: ' + e.message)); p.on('console', m => { if (/Content Security Policy|Refused to/.test(m.text())) bag.push('CSP: ' + m.text().slice(0, 100)); }); };
const openLevel = async (ctx, lv) => { const p = await ctx.newPage(); const bag = []; watch(p, bag); await p.goto(`${base}/${lv}`); await p.waitForSelector('#app button', { timeout: 10000 }); await p.waitForTimeout(300); return [p, bag]; };

try {
  for (const lv of LEVELS) {
    section(`Nivel ${lv.toUpperCase()}`);
    const ctx = await newCtx({ serviceWorkers: 'block' });
    const [p, bag] = await openLevel(ctx, lv);
    const ids = await p.evaluate(() => boosters.map(b => b.id));
    ok(ids.length >= 9, `${lv}: carga ${ids.length} unidades`);
    ok(await p.evaluate(() => !document.querySelector('[onclick],[oninput],[onerror],[onchange]')), `${lv}: sin handlers inline en la portada`);

    // 1) cada unidad se abre y sus paneles (con el panel docente activado) se dibujan sin errores
    await p.evaluate(() => activateTeacherMode());
    for (const id of ids) {
      await p.evaluate(i => { selectBooster(i); setActiveStep(1); }, id); await p.waitForTimeout(60);
      await p.evaluate(() => setActiveStep(2));
      await p.evaluate(i => { openVocabDrawer(i); }, id); await p.waitForTimeout(80); await p.evaluate(() => closeVocabDrawer());
      const bad = await p.evaluate(() => { const m = []; document.querySelectorAll('[data-act]').forEach(e => { if (typeof ACTIONS[e.dataset.act] !== 'function') m.push(e.dataset.act); }); document.querySelectorAll('[data-in]').forEach(e => { if (typeof INPUT_ACTIONS[e.dataset.in] !== 'function') m.push(e.dataset.in); }); return m; });
      if (bad.length) ok(false, `${lv} unidad ${id}: botones sin acción`, bad.join(','));
    }
    ok(true, `${lv}: las ${ids.length} unidades abren sin botones rotos`);
    await p.evaluate(() => { logout(); setView('landing'); });

    // 2) verificación de respuestas y progreso
    await p.evaluate(i => { selectBooster(i); setActiveStep(1); }, ids[1]); await p.waitForTimeout(150);
    const v = await p.evaluate(() => { document.querySelector('[data-act="verifyAnswers"]').click(); const m = document.getElementById('validation-msg'); return { visible: !m.classList.contains('hidden'), texto: m.innerText.slice(0, 60) }; });
    ok(v.visible && /\d/.test(v.texto), `${lv}: «Verificar» con espacios vacíos avisa cuántos faltan`, v.texto);
    const prog = await p.evaluate(() => { const i = document.querySelector('#step1-template-container .fill-in-blank'); i.value = 'hello'; i.dispatchEvent(new Event('input', { bubbles: true })); return document.getElementById('template-progress-label').textContent; });
    ok(/^1 /.test(prog), `${lv}: escribir en un espacio actualiza el progreso`, prog);
    await p.evaluate(() => setView('landing'));

    // 3) carrusel y vocabulario con clics reales
    await p.evaluate(() => setLandingLayoutMode('carousel')); await p.waitForTimeout(200);
    const idx = await p.evaluate(() => { carouselCurrentIndex = 0; document.querySelector('[data-act="navigateCarousel"][data-a0="next"]').click(); return carouselCurrentIndex; });
    ok(idx === 1, `${lv}: el botón «siguiente» del carrusel avanza`);
    await p.evaluate(i => { selectBooster(i); setActiveStep(1); }, ids[0]); await p.waitForTimeout(300);
    await p.locator('[data-act="openVocabModal"]:visible').first().click({ timeout: 5000 }); await p.waitForTimeout(300);
    ok(await p.evaluate(() => document.getElementById('vocab-drawer').classList.contains('drawer-open')), `${lv}: el panel de vocabulario abre`);
    ok(await p.evaluate(() => document.getElementById('vocab-drawer').contains(document.activeElement)), `${lv}: el foco entra al panel (teclado)`);
    await p.keyboard.press('Escape'); await p.waitForTimeout(450);
    ok(await p.evaluate(() => document.getElementById('vocab-drawer').classList.contains('drawer-closed')), `${lv}: Escape cierra el panel`);

    // 4) accesibilidad (axe, WCAG 2.2 AA): portada, unidad (pasos 1 y 2) y vocabulario
    const axeRun = async label => {
      if (!(await p.evaluate(() => typeof axe !== 'undefined'))) await p.evaluate(axeSource);   // por CDP: la política de seguridad no permite scripts inline
      
      const r = await p.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }).then(x => x.violations.map(v => v.id + ' ×' + v.nodes.length)));
      ok(r.length === 0, `${lv}: accesibilidad (${label})`, r.join('; '));
    };
    await p.evaluate(() => setView('landing')); await p.waitForTimeout(300); await axeRun('portada');
    await p.evaluate(i => { selectBooster(i); setActiveStep(1); }, ids[1]); await p.waitForTimeout(300); await axeRun('unidad, paso 1');
    await p.evaluate(() => setActiveStep(2)); await p.waitForTimeout(300); await axeRun('unidad, paso 2');
    await p.evaluate(i => openVocabDrawer(i), ids[1]); await p.waitForTimeout(500); await axeRun('vocabulario');

    ok(bag.length === 0, `${lv}: sin errores de página ni bloqueos de seguridad`, bag.slice(0, 3).join(' | '));
    await ctx.close();
  }

  section('Seguridad del contenido');
  {
    const ctx = await newCtx({ serviceWorkers: 'block' }); const p = await ctx.newPage(); const bag = []; watch(p, bag);
    const d = JSON.parse(fs.readFileSync(path.join(root, 'data', 'a1.json'), 'utf8'));
    d.boosters[0].title = 'Hola <img src=x onerror="window.__pwned=1"> <script>window.__pwned=2</script> <strong>ok</strong>';
    await p.route('**/data/a1.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(d) }));
    await p.goto(`${base}/a1`); await p.waitForSelector('#app button'); await p.evaluate(() => selectBooster(boosters[0].id)); await p.waitForTimeout(300);
    ok(await p.evaluate(() => !window.__pwned), 'HTML malicioso dentro de data/*.json no se ejecuta');
    ok(await p.evaluate(() => !!document.querySelector('#app strong')), 'las etiquetas permitidas (<strong>) siguen funcionando');
    await ctx.close();
  }

  section('Errores de carga');
  {
    const ctx = await newCtx({ serviceWorkers: 'block' }); const p = await ctx.newPage();
    await p.route('**/data/b1.json', r => r.fulfill({ status: 404, body: 'no' }));
    await p.goto(`${base}/b1`); await p.waitForTimeout(1200);
    ok(await p.locator('[role=alert]').count() > 0 && await p.getByRole('button', { name: /Retry|Reintentar/ }).count() === 1, 'si falla la carga del contenido se muestra un aviso con botón «Reintentar»');
    await p.unroute('**/data/b1.json'); await p.getByRole('button', { name: /Retry|Reintentar/ }).click(); await p.waitForTimeout(1200);
    ok(await p.locator('#app [data-act]').count() > 5, '«Reintentar» recupera la página');
    await ctx.close();
  }

  if (!process.env.BASE_URL) {
    section('Uso sin conexión');
    const ctx = await newCtx(); const p = await ctx.newPage(); const bag = []; watch(p, bag);
    await p.goto(`${base}/a1`); await p.waitForSelector('#app button');
    ok(await p.evaluate(async () => !!(await navigator.serviceWorker.ready).active), 'el modo sin conexión se activa');
    for (const lv of ['a1', 'c1']) { const q = await ctx.newPage(); await q.goto(`${base}/${lv}`); await q.waitForSelector('#app button'); await q.close(); }
    await p.waitForTimeout(1200);
    await stopServer(); server = null;                                   // se "apaga internet"
    const q = await ctx.newPage(); await q.goto(`${base}/c1`).catch(() => {}); await q.waitForSelector('#app button', { timeout: 8000 }).catch(() => {});
    ok(await q.locator('#app button').count() > 5, 'con el servidor apagado, C1 abre desde la copia guardada');
    await ctx.close();
  }
} finally {
  await browser.close(); if (server) await stopServer();
}
console.log(`\n${pass} pruebas correctas, ${fail} fallidas.`);
if (fail) { console.log('\nFallidas:\n - ' + failures.join('\n - ')); process.exit(1); }
