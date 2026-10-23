#!/usr/bin/env python3
"""Exporta el contenido de data/<nivel>.json a una tabla (CSV) para revisarla en Excel o Google Sheets.

Uso (desde la carpeta del sitio):
    python3 tools/review-export.py            # todos los niveles -> review/a1.csv ... review/c1.csv
    python3 tools/review-export.py a1 b2      # solo algunos niveles

Columnas:  unidad | campo | texto_actual | texto_nuevo | ruta
  - Escriba su corrección en «texto_nuevo». Déjela vacía si no hay cambio.
  - No modifique «ruta» (indica a qué parte del JSON corresponde cada fila) ni «texto_actual».
  - Conserve las etiquetas permitidas <br>, <em>, <strong> si el texto las trae.
Luego aplique los cambios con:  python3 tools/review-import.py review/a1.csv
"""
import csv, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKIP_KEYS = {'imageUrl', 'badgeEmoji', 'id', 'level', '_leeme'}

def leaves(o, path=()):
    if isinstance(o, str):
        yield path, o
    elif isinstance(o, list):
        for i, x in enumerate(o): yield from leaves(x, path + (i,))
    elif isinstance(o, dict):
        for k, x in o.items():
            if k in SKIP_KEYS and len(path) <= 2: continue
            yield from leaves(x, path + (k,))

def main():
    levels = sys.argv[1:] or ['a1', 'a2', 'b1', 'b2', 'c1']
    (ROOT / 'review').mkdir(exist_ok=True)
    for lv in levels:
        d = json.loads((ROOT / 'data' / f'{lv}.json').read_text(encoding='utf8'))
        units = {b['id']: f"{b['units']} · {b['title']}" for b in d['boosters']}
        out = ROOT / 'review' / f'{lv}.csv'
        n = 0
        with out.open('w', encoding='utf-8-sig', newline='') as f:   # utf-8-sig: Excel reconoce las tildes
            w = csv.writer(f); w.writerow(['unidad', 'campo', 'texto_actual', 'texto_nuevo', 'ruta'])
            for path, text in leaves({'boosters': d['boosters'], 'speakingCards': d.get('speakingCards', {})}):
                if path[0] == 'boosters': uid = d['boosters'][path[1]]['id']; field = '.'.join(map(str, path[2:]))
                else: uid = int(path[1]); field = 'speakingCards.' + '.'.join(map(str, path[2:]))
                w.writerow([units.get(uid, uid), field, text, '', json.dumps(list(path), ensure_ascii=False)]); n += 1
        print(f'{out.relative_to(ROOT)}: {n} textos')

if __name__ == '__main__':
    main()
