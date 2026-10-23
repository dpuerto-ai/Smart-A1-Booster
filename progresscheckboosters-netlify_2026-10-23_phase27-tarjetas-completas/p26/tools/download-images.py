#!/usr/bin/env python3
"""Download the Unsplash photos used by the site into images/units/.

Run once from the site's root folder (the one containing index.html):
    python3 tools/download-images.py
Then deploy. The pages already use images/units/ first and fall back to
Unsplash if a file is missing, so it is safe to run again at any time.
"""
import re, sys, pathlib, urllib.request

root = pathlib.Path(__file__).resolve().parent.parent
out = root / "images" / "units"
out.mkdir(parents=True, exist_ok=True)

ids = set()
sources = [root / f"{p}.html" for p in ["index", "a1", "a2", "b1", "b2", "c1"]] + sorted((root / "data").glob("*.json"))
for src in sources:
    ids |= set(re.findall(r"images\.unsplash\.com/(photo-[\w-]+)", src.read_text(encoding="utf8")))

banner = "photo-1517842645767-c639042777db"
ok = failed = 0
for pid in sorted(ids):
    dest = out / f"{pid}.jpg"
    if dest.exists() and dest.stat().st_size > 5000:
        ok += 1
        continue
    width, quality = (1200, 70) if pid == banner else (640, 75)
    url = f"https://images.unsplash.com/{pid}?auto=format&fit=crop&w={width}&q={quality}&fm=jpg"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            dest.write_bytes(r.read())
        ok += 1
        print("ok    ", pid)
    except Exception as e:
        failed += 1
        print("FAILED", pid, e)
print(f"\n{ok} images ready, {failed} failed (failed ones keep loading from Unsplash).")
sys.exit(1 if failed else 0)
