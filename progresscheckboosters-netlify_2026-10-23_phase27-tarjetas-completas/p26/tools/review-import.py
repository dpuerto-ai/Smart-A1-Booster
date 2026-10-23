#!/usr/bin/env python3
"""Aplica a data/<nivel>.json las correcciones escritas en la columna «texto_nuevo» de un CSV de revisión.

Uso (desde la carpeta del sitio):
    python3 tools/review-import.py review/a1.csv            # aplica los cambios
    python3 tools/review-import.py review/a1.csv --probar   # solo muestra qué cambiaría

Antes de escribir guarda una copia en data/respaldo/<nivel>-<fecha>.json.
Después ejecute:  python3 tools/validate-data.py
"""
import csv, json, pathlib, sys, shutil, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
PRIM = (str, int, float, bool, type(None))

def j(v): return json.dumps(v, ensure_ascii=False)
def pack(items, pad, width=96):
    lines, cur = [], ''
    for x in items:
        piece = j(x)
        if cur and len(pad) + len(cur) + len(piece) + 2 > width: lines.append(cur); cur = piece
        else: cur = (cur + ', ' + piece) if cur else piece
    if cur: lines.append(cur)
    return lines
def dump(v, ind=0):
    pad = '  ' * ind
    if isinstance(v, dict):
        if not v: return '{}'
        return '{\n' + ',\n'.join(f'{pad}  {j(k)}: {dump(x, ind + 1)}' for k, x in v.items()) + f'\n{pad}}}'
    if isinstance(v, list):
        if not v: return '[]'
        if all(isinstance(x, PRIM) for x in v):
            one = '[' + ', '.join(j(x) for x in v) + ']'
            if len(pad) + len(one) <= 96: return one
            return '[\n' + ',\n'.join(f'{pad}  {l}' for l in pack(v, pad + '  ')) + f'\n{pad}]'
        return '[\n' + ',\n'.join(f'{pad}  {dump(x, ind + 1)}' for x in v) + f'\n{pad}]'
    return j(v)

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry = '--probar' in sys.argv
    if len(args) != 1: print(__doc__); return 1
    csv_path = pathlib.Path(args[0]); lv = csv_path.stem
    data_path = ROOT / 'data' / f'{lv}.json'
    d = json.loads(data_path.read_text(encoding='utf8'))
    root = {'boosters': d['boosters'], 'speakingCards': d.get('speakingCards', {})}
    changed = skipped = 0
    with csv_path.open(encoding='utf-8-sig', newline='') as f:
        for n, row in enumerate(csv.DictReader(f), start=2):
            new = (row.get('texto_nuevo') or '')
            if new.strip() == '': continue
            try: path = json.loads(row['ruta']); node = root
            except Exception: print(f'  fila {n}: columna «ruta» dañada, se omite'); skipped += 1; continue
            try:
                for p in path[:-1]: node = node[p]
                old = node[path[-1]]
            except Exception: print(f'  fila {n}: la ruta ya no existe en el JSON, se omite'); skipped += 1; continue
            if old != row['texto_actual']: print(f'  fila {n}: el texto del JSON cambió desde la exportación; se omite (vuelva a exportar)'); skipped += 1; continue
            if new == old: continue
            print(f"  fila {n} · {row['unidad']} · {row['campo']}\n      antes:  {old[:90]}\n      ahora:  {new[:90]}")
            node[path[-1]] = new; changed += 1
    print(f'\n{changed} cambios' + (f', {skipped} omitidos' if skipped else '') + (' (modo prueba: no se escribió nada)' if dry else ''))
    if changed and not dry:
        bk = ROOT / 'data' / 'respaldo'; bk.mkdir(exist_ok=True)
        shutil.copy(data_path, bk / f"{lv}-{datetime.datetime.now():%Y%m%d-%H%M%S}.json")
        d['boosters'] = root['boosters']; d['speakingCards'] = root['speakingCards']
        text = dump(d) + '\n'; json.loads(text)
        data_path.write_text(text, encoding='utf8')
        print(f'Guardado data/{lv}.json. Ahora ejecute: python3 tools/validate-data.py')
    return 0

if __name__ == '__main__':
    sys.exit(main())
