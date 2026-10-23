#!/usr/bin/env python3
"""Revisa los archivos de contenido data/*.json antes de publicar.

Uso (desde la carpeta del sitio, la que contiene index.html):
    python3 tools/validate-data.py              # revisa todos los niveles
    python3 tools/validate-data.py data/a1.json # revisa uno solo

Resultado:
  ERROR  = algo que haría fallar la página. Hay que corregirlo antes de publicar.
  AVISO  = algo que conviene revisar (no impide publicar).
Código de salida: 0 si no hay errores, 1 si hay al menos uno.
Solo usa la biblioteca estándar de Python 3.8 o superior.
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
# Cada nivel guarda el objetivo docente con un nombre de campo distinto (lo lee así el código de cada página).
OBJECTIVE_KEY = {'a1': 'objetivo', 'a2': 'objetivo', 'b1': 'objetivo', 'b2': 'objetivo', 'c1': 'objective'}
REQ_TOP = ['id', 'units', 'title', 'badgeEmoji', 'imageUrl', 'teacher', 'student', 'vocabBank']
REQ_STUDENT = ['handoutTitle', 'diagOptions', 'vocabWords', 'step1Goal', 'step1Text', 'freeWriteMin', 'freeWriteMax',
               'freeWritePrompt', 'step1Template', 'roles', 'scenarios', 'correctAnswers', 'step2Opener',
               'step2Questions', 'commonErrors']

class Report:
    def __init__(self): self.errors, self.warnings = [], []
    def err(self, where, msg): self.errors.append(f'  ERROR  {where}: {msg}')
    def warn(self, where, msg): self.warnings.append(f'  AVISO  {where}: {msg}')

def nonempty_str(v): return isinstance(v, str) and v.strip() != ''
def str_list(v): return isinstance(v, list) and all(isinstance(x, str) for x in v)

ALLOWED_TAGS = {'br', 'em', 'strong'}
TAG_RE = re.compile(r'<\s*/?\s*([A-Za-z][A-Za-z0-9]*)([^<>]*)>')

def check_markup(rep, where, obj):
    """ERROR si un texto trae HTML distinto de <br>, <em> y <strong>, o direcciones javascript:.
    La página no lo ejecutaría (se mostraría como texto), pero casi seguro es un error de edición."""
    if isinstance(obj, str):
        for m in TAG_RE.finditer(obj):
            if m.group(1).lower() not in ALLOWED_TAGS or m.group(2).strip().strip('/').strip():
                rep.err(where, f'etiqueta HTML no permitida «{m.group(0)[:50]}». Solo se permiten <br>, <em> y <strong> sin atributos')
        if re.search(r'javascript\s*:', obj, re.I): rep.err(where, 'contiene «javascript:», no permitido')
    elif isinstance(obj, list):
        for i, x in enumerate(obj): check_markup(rep, f'{where}[{i}]', x)
    elif isinstance(obj, dict):
        for k, x in obj.items(): check_markup(rep, f'{where}.{k}', x)

def check_strings(rep, where, obj):
    """Avisos de limpieza en cualquier texto: espacios dobles o sobrantes."""
    if isinstance(obj, str):
        if obj != obj.strip(): rep.warn(where, f'espacio al inicio o al final: {obj[:40]!r}')
        if '  ' in obj and '<' not in obj and '( )' not in obj: rep.warn(where, f'espacio doble: {obj[:50]!r}')
    elif isinstance(obj, list):
        for i, x in enumerate(obj): check_strings(rep, f'{where}[{i}]', x)
    elif isinstance(obj, dict):
        for k, x in obj.items(): check_strings(rep, f'{where}.{k}', x)

def validate_file(path, rep):
    try:
        text = path.read_text(encoding='utf8')
        data = json.loads(text)
    except json.JSONDecodeError as e:
        rep.err(path.name, f'el archivo no es JSON válido: {e.msg} (línea {e.lineno}, columna {e.colno}). '
                           'Suele ser una coma de más o de menos, o unas comillas sin cerrar, cerca de esa línea.')
        return
    except Exception as e:
        rep.err(path.name, f'no se pudo leer: {e}'); return
    lv = path.stem
    check_markup(rep, path.name, {k: v for k, v in data.items() if k != '_leeme'})
    if data.get('level') != lv: rep.err(path.name, f'el campo "level" debe ser "{lv}"')
    bs = data.get('boosters')
    if not isinstance(bs, list) or not bs: rep.err(path.name, '"boosters" debe ser una lista con al menos una unidad'); return
    cards = data.get('speakingCards', {})
    ids, units_seen, imgs = [], {}, {}
    for idx, b in enumerate(bs):
        tag = f'{lv.upper()} · unidad {b.get("units", "?")} «{b.get("title", "?")}»' if isinstance(b, dict) else f'{lv.upper()} · elemento {idx + 1}'
        if not isinstance(b, dict): rep.err(tag, 'debe ser un objeto { ... }'); continue
        for k in REQ_TOP:
            if k not in b: rep.err(tag, f'falta el campo "{k}"')
        if not isinstance(b.get('id'), int): rep.err(tag, '"id" debe ser un número entero')
        else: ids.append(b['id'])
        for k in ('units', 'title', 'badgeEmoji'):
            if k in b and not nonempty_str(b[k]): rep.err(tag, f'"{k}" no puede estar vacío')
        u = b.get('units')
        if u in units_seen: rep.err(tag, f'la unidad "{u}" está repetida')
        units_seen[u] = True
        url = b.get('imageUrl', '')
        if not (isinstance(url, str) and re.match(r'^https?://', url)): rep.err(tag, '"imageUrl" debe empezar por http:// o https://')
        else: imgs.setdefault(url, []).append(b.get('title'))
        # ---- docente ----
        t = b.get('teacher')
        if isinstance(t, dict):
            ok = OBJECTIVE_KEY.get(lv, 'objetivo'); bad = 'objective' if ok == 'objetivo' else 'objetivo'
            if ok not in t: rep.err(tag + ' (docente)', f'falta "{ok}" (en este nivel la página lee ese nombre; con "{bad}" mostraría «undefined»)')
            elif not nonempty_str(t[ok]): rep.err(tag + ' (docente)', f'"{ok}" está vacío')
            if 'focus' not in t or not nonempty_str(t.get('focus')): rep.err(tag + ' (docente)', 'falta "focus" o está vacío')
        # ---- estudiante ----
        s = b.get('student')
        if isinstance(s, dict):
            for k in REQ_STUDENT:
                if k not in s: rep.err(tag, f'falta student."{k}"')
            for k in ('diagOptions', 'scenarios', 'step2Questions', 'commonErrors', 'vocabWords'):
                if k in s and (not str_list(s[k]) or not s[k] or any(not x.strip() for x in s[k])): rep.err(tag, f'student."{k}" debe ser una lista de textos no vacíos')
            mn, mx = s.get('freeWriteMin'), s.get('freeWriteMax')
            if not (isinstance(mn, int) and isinstance(mx, int) and 0 < mn < mx): rep.err(tag, 'freeWriteMin y freeWriteMax deben ser números enteros con 0 < mínimo < máximo')
            else:
                m = re.search(r'(\d+)\s*[-–]\s*(\d+)', str(s.get('step1Goal', '')))
                if m and (int(m.group(1)), int(m.group(2))) != (mn, mx): rep.warn(tag, f'step1Goal dice «{s["step1Goal"]}» pero el contador usa {mn}-{mx} palabras')
            roles = s.get('roles')
            if not (isinstance(roles, list) and len(roles) >= 2 and all(isinstance(r, dict) and nonempty_str(r.get('name')) and nonempty_str(r.get('title')) for r in roles)):
                rep.err(tag, 'student.roles debe tener al menos 2 roles con "title" y "name"')
            tpl = s.get('step1Template', '')
            if isinstance(tpl, str):
                if tpl.count('[') != tpl.count(']'): rep.err(tag, 'step1Template: los corchetes [ ] no están balanceados')
                if tpl.count('**') % 2: rep.err(tag, 'step1Template: hay un ** sin pareja (negrita sin cerrar)')
                fields = re.findall(r'\[\[(.*?)\]\]|\[(.*?)\]', tpl)
                names = {a or b for a, b in fields}
                if not names: rep.warn(tag, 'step1Template no tiene espacios para completar [ ]')
                ca = s.get('correctAnswers', {})
                if isinstance(ca, dict):
                    for k, v in ca.items():
                        if k not in names: rep.warn(tag, f'correctAnswers tiene la regla "{k}" pero la plantilla no tiene un espacio [{k}]; esa regla nunca se aplica')
                        if not str_list(v) or not v: rep.err(tag, f'correctAnswers."{k}" debe ser una lista de textos')
                for m in re.finditer(r'\b(a|an) \[([^\]]*)\]', tpl):
                    rep.warn(tag, f'«{m.group(1)} [{m.group(2)}]»: el artículo puede no concordar con la palabra que escriba el estudiante (a/an)')
            check_strings(rep, tag, s)
        # ---- vocabulario / expresiones ----
        vb = b.get('vocabBank')
        if isinstance(vb, list):
            cats = {}
            for c in vb:
                if not (isinstance(c, dict) and nonempty_str(c.get('category')) and str_list(c.get('words')) and c['words']): rep.err(tag, f'vocabBank: cada categoría necesita "category" y una lista "words" con palabras: {str(c)[:60]}'); continue
                cats[c['category']] = cats.get(c['category'], 0) + 1
                dup = {w for w in c['words'] if c['words'].count(w) > 1}
                if dup: rep.warn(tag, f'vocabBank «{c["category"]}»: palabras repetidas {sorted(dup)}')
            for name, n in cats.items():
                if n > 1: rep.warn(tag, f'vocabBank: la categoría «{name}» aparece {n} veces')
        ex = b.get('expressions')
        if ex is not None:
            if not isinstance(ex, list): rep.err(tag, '"expressions" debe ser una lista')
            else:
                for g in ex:
                    if not (isinstance(g, dict) and nonempty_str(g.get('category')) and str_list(g.get('phrases')) and g['phrases']): rep.err(tag, f'expressions: cada grupo necesita "category" y "phrases": {str(g)[:60]}')
        # ---- tarjetas de speaking ----
        cd = cards.get(str(b.get('id'))) if isinstance(cards, dict) else None
        if cd is None: rep.warn(tag, 'no tiene tarjeta en speakingCards')
        elif not (isinstance(cd, list) and cd and all(isinstance(x, dict) and str_list(x.get('chips')) and nonempty_str(x.get('t1')) and nonempty_str(x.get('t2')) for x in cd)):
            rep.err(tag, 'speakingCards: cada tarjeta necesita "chips" (lista), "t1" y "t2"')
    if len(ids) != len(set(ids)): rep.err(path.name, 'hay "id" repetidos')
    if ids and sorted(ids) != list(range(1, len(ids) + 1)): rep.warn(path.name, f'los id no son consecutivos desde 1: {ids}')
    if isinstance(cards, dict):
        for k in cards:
            if not k.isdigit() or int(k) not in ids: rep.warn(path.name, f'speakingCards tiene la clave "{k}" que no corresponde a ninguna unidad')
    for url, titles in imgs.items():
        if len(titles) > 1: rep.warn(path.name, f'la misma foto se usa en varias unidades: {titles}')

def main():
    args = [pathlib.Path(a) for a in sys.argv[1:]]
    files = args or sorted((ROOT / 'data').glob('*.json'))
    if not files: print('No se encontraron archivos en data/'); return 1
    total_e = total_w = 0
    for f in files:
        rep = Report(); validate_file(f, rep)
        status = 'OK' if not rep.errors else 'CON ERRORES'
        print(f'\n== {f.name}: {status} ({len(rep.errors)} errores, {len(rep.warnings)} avisos)')
        for line in rep.errors + rep.warnings: print(line)
        total_e += len(rep.errors); total_w += len(rep.warnings)
    print(f'\nResumen: {total_e} errores, {total_w} avisos en {len(files)} archivos.')
    print('Se puede publicar.' if not total_e else 'NO publicar hasta corregir los errores.')
    return 1 if total_e else 0

if __name__ == '__main__':
    sys.exit(main())
