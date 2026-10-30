"""Refresh the reviewed KanjiVG subset. Run from any directory; Python 3 stdlib only.

Review upstream/license changes before running, then diff the paths/provenance,
bump affected content versions, and run the full application checks.
"""
import argparse
import concurrent.futures
import datetime
import hashlib
import json
import pathlib
import urllib.request
import xml.etree.ElementTree as ET

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--revision", required=True, help="Reviewed KanjiVG git commit or release tag")
args = parser.parse_args()
if not args.revision or any(c not in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-" for c in args.revision):
    parser.error("Use a git commit or tag, without path separators")
base = pathlib.Path(__file__).resolve().parents[1]
kanji = "一二三四五六七八九十山川木林森日月火水土金人口目耳手足大小中上下"
hiragana = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん"
chars = kanji + hiragana + "".join(chr(ord(c) + 0x60) for c in hiragana)

def one(char):
    name = f"{ord(char):05x}.svg"
    url = f"https://raw.githubusercontent.com/KanjiVG/kanjivg/{args.revision}/kanji/{name}"
    with urllib.request.urlopen(url, timeout=20) as response:
        raw = response.read(100_001)
    if len(raw) > 100_000:
        raise ValueError("Unexpected SVG size: " + name)
    root = ET.fromstring(raw)
    paths = [p.attrib["d"] for p in root.iter("{http://www.w3.org/2000/svg}path") if "-s" in p.attrib.get("id", "")]
    if not paths:
        raise ValueError("No ordered paths: " + name)
    return char, paths, hashlib.sha256(raw).hexdigest()

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    items = list(pool.map(one, chars))
# Write only after all downloads have succeeded.
(base / "shared/stroke-data.json").write_text(json.dumps({c: paths for c, paths, digest in items}, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
provenance = {
    "source": "https://github.com/KanjiVG/kanjivg", "revision": args.revision,
    "retrieved": datetime.date.today().isoformat(), "copyright": "2009–2026 Ulrich Apel and contributors",
    "license": "CC BY-SA 3.0", "transformation": "Only ordered stroke path d attributes extracted; coordinates remain 109x109.",
    "files": [{"char": c, "file": f"{ord(c):05x}.svg", "sha256": digest, "strokes": len(paths)} for c, paths, digest in items],
}
(base / "docs/stroke-provenance.json").write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Imported", len(items), "ordered stroke models. Review the diff before seeding.")
