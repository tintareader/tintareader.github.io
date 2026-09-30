"""Outline the wordmark: "tinta" in Charter Regular (Type 1), "reader" in
Source Sans 3 Regular (TrueType). Writes wordmark-paths.json with one SVG
path per word at 1000 units per em, y down, baseline at y=0, start at x=0."""
import json, sys
from fontTools.t1Lib import T1Font
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

def word_path(glyphset, word, upm, kern=None):
    scale = 1000.0 / upm
    x = 0.0
    parts, bounds = [], [None]
    prev = None
    for ch in word:
        if prev and kern: x += kern.get((prev, ch), 0) * scale
        g = glyphset[ch]
        pen = SVGPathPen(glyphset, ntos=lambda v: f"{v:.1f}")
        bp = BoundsPen(glyphset)
        t = (scale, 0, 0, -scale, x, 0)
        g.draw(TransformPen(pen, t)); g.draw(TransformPen(bp, t))
        parts.append(pen.getCommands())
        if bp.bounds:
            b = bp.bounds
            bounds[0] = b if bounds[0] is None else (min(bounds[0][0], b[0]), min(bounds[0][1], b[1]), max(bounds[0][2], b[2]), max(bounds[0][3], b[3]))
        x += g.width * scale
        prev = ch
    return {"d": "".join(parts), "advance": round(x, 1), "bbox": [round(v, 1) for v in bounds[0]]}

out = {}
t1 = T1Font("/usr/share/fonts/X11/Type1/c0648bt_.pfb"); t1.parse()
gs = t1.getGlyphSet()
upm = round(1 / t1.font["FontMatrix"][0])
out["tinta"] = word_path(gs, "tinta", upm)
out["tinta"]["font"] = "Bitstream Charter Regular"

tt = TTFont("fonts/SourceSans3.ttf")
gs2 = tt.getGlyphSet()
kern = {}
if "kern" in tt:
    for st in tt["kern"].kernTables:
        for (l, r), v in st.kernTable.items(): kern[(l, r)] = v
# TrueType glyph names for plain ASCII letters are the letters themselves in this font
out["reader"] = word_path(gs2, "reader", tt["head"].unitsPerEm, kern)
out["reader"]["font"] = "Source Sans 3 Regular"
out["reader"]["xHeight"] = tt["OS/2"].sxHeight; out["reader"]["capHeight"] = tt["OS/2"].sCapHeight
json.dump(out, open("wordmark-paths.json", "w"))
for k, v in out.items(): print(k, v["font"], "advance", v["advance"], "bbox", v["bbox"], "d length", len(v["d"]))
