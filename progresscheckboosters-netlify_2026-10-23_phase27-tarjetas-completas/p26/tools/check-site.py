#!/usr/bin/env python3
"""Revisión previa a publicar. Un solo comando, sin instalar nada:

    python3 tools/check-site.py

Revisa:
  1. Los textos de data/*.json (usa tools/validate-data.py).
  2. Que todos los archivos que las páginas usan (scripts, estilos, fuentes, imágenes) existan.
  3. Que la lista de sw.js (modo sin conexión) incluya los archivos de la página y que no apunte a archivos inexistentes.
  4. Que no queden onclick/oninput/onerror ni scripts escritos dentro del HTML (la política de seguridad los bloquea).
  5. Que _headers conserve las protecciones de seguridad.
Código de salida 0 = todo bien; 1 = hay al menos un ERROR.
"""
import re, sys, json, pathlib, subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
errors, warns = [], []
def err(m): errors.append('  ERROR  ' + m)
def warn(m): warns.append('  AVISO  ' + m)

PAGES = ['index', 'a1', 'a2', 'b1', 'b2', 'c1', '404']
LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1']

# 1. contenido
r = subprocess.run([sys.executable, '-I', str(ROOT / 'tools' / 'validate-data.py')], capture_output=True, text=True)
if r.returncode != 0: err('hay errores en data/*.json (ejecute: python3 tools/validate-data.py)')
content_summary = [l for l in r.stdout.splitlines() if l.startswith('Resumen')]

# 2. referencias locales de cada página
def local(ref):
    ref = ref.split('#')[0].split('?')[0]
    if not ref or re.match(r'^(https?:|data:|mailto:|tel:|//)', ref): return None
    return ref.lstrip('/')
used = set()
for p in PAGES:
    f = ROOT / f'{p}.html'
    if not f.exists(): err(f'falta {p}.html'); continue
    t = f.read_text(encoding='utf8')
    for m in re.finditer(r'''(?:src|href)\s*=\s*["']([^"']+)["']''', t):
        ref = local(m.group(1))
        if not ref or ref in ('', '/'): continue
        if re.fullmatch(r'(index|a1|a2|b1|b2|c1)', ref): continue            # enlaces a páginas sin .html
        if not (ROOT / ref).exists():
            if ref.startswith('images/units/'): warn(f'{p}.html usa la foto local «{ref}» que aún no existe (se usa la de Unsplash). Ejecute tools/download-images.py')
            else: err(f'{p}.html usa «{ref}» y ese archivo no existe')
        else: used.add(ref)
    # 4. nada inline
    if re.search(r'\son(click|input|change|error|load|keydown|submit)\s*=', t): err(f'{p}.html tiene handlers inline (onclick, onerror…)')
    for m in re.finditer(r'<script(?![^>]*\bsrc=)[^>]*>', t):
        if 'application/ld+json' not in m.group(0): err(f'{p}.html tiene un <script> escrito dentro del HTML; muévalo a js/')
for js in (ROOT / 'js').glob('*.js'):
    t = js.read_text(encoding='utf8')
    t = re.sub(r'/\*.*?\*/', '', t, flags=re.S); t = re.sub(r'(?m)^\s*//.*$', '', t)   # sin comentarios
    if re.search(r'''\son(click|input|change|error)\s*=\s*["']''', t): err(f'js/{js.name} genera HTML con handlers inline; use data-act (ver build/README.md)')
for lv in LEVELS:
    if not (ROOT / 'data' / f'{lv}.json').exists(): err(f'falta data/{lv}.json')
    if not (ROOT / 'js' / f'{lv}.js').exists(): err(f'falta js/{lv}.js')

# fuentes referenciadas desde css/fonts.css
fonts = ROOT / 'css' / 'fonts.css'
if fonts.exists():
    for m in re.finditer(r'url\(\.\./(fonts/[^)]+)\)', fonts.read_text(encoding='utf8')):
        if not (ROOT / m.group(1)).exists(): err(f'css/fonts.css usa «{m.group(1)}» y no existe')

# 3. service worker
sw = (ROOT / 'sw.js').read_text(encoding='utf8')
pre = re.search(r'const PRECACHE = \[(.*?)\];', sw, re.S)
listed = set(re.findall(r"'/([^']*)'", pre.group(1))) if pre else set()
if not pre: err('sw.js: no se encontró la lista PRECACHE')
for item in sorted(listed):
    if item and not (ROOT / item).exists(): err(f'sw.js lista «/{item}» y ese archivo no existe')
for u in sorted(used):
    if u.endswith(('.js', '.css', '.woff2')) and u not in listed: warn(f'«{u}» lo usa una página pero no está en PRECACHE de sw.js (no estaría disponible sin conexión)')
for need in [f'data/{lv}.json' for lv in LEVELS] + [f'{p}.html' for p in PAGES if p != '404']:
    if need not in listed: warn(f'sw.js no lista «{need}»')
if 'boosters-v' not in sw: warn('sw.js: no se encontró VERSION')

# 5. encabezados
h = (ROOT / '_headers').read_text(encoding='utf8') if (ROOT / '_headers').exists() else ''
csp = re.search(r'Content-Security-Policy:\s*(.*)', h)
if not csp: err('_headers no define Content-Security-Policy')
else:
    c = csp.group(1)
    sm = re.search(r'script-src([^;]*)', c)
    if sm and 'unsafe-inline' in sm.group(1): err("la política permite scripts inline ('unsafe-inline' en script-src)")
    if 'unsafe-eval' in c: err("la política permite 'unsafe-eval'")
    if "frame-ancestors" not in c: warn('la política no incluye frame-ancestors')
for hd in ['X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy']:
    if hd not in h: warn(f'_headers no define {hd}')

print('Revisión del sitio')
for l in content_summary: print('  ' + l)
for l in errors + warns: print(l)
print(f'\n{len(errors)} errores, {len(warns)} avisos.')
print('Se puede publicar.' if not errors else 'NO publicar hasta corregir los errores.')
sys.exit(1 if errors else 0)
