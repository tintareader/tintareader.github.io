"""Turn the harness's PNG screenshots (out/) into the review page's WebP images
(review/img/). Panel crops are trimmed to the design plus a margin, so the
contact sheet compares designs rather than empty sidebar; the window shots are
scaled to 1600 px wide.

    python3 harness/prep.py reference beck ...   (no ids: every PNG in out/)
"""
import re, sys, pathlib
from PIL import Image, ImageChops

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT, IMG = ROOT / 'out', ROOT / 'review' / 'img'
IMG.mkdir(parents=True, exist_ok=True)
ids = sys.argv[1:]

def trim_bottom(im, margin=40):
    # The sidebar's own background, sampled at the bottom, ignoring its left border.
    rgb = im.convert('RGB').crop((6, 0, im.width, im.height))
    bg = Image.new('RGB', rgb.size, rgb.getpixel((rgb.width // 2, rgb.height - 4)))
    box = ImageChops.difference(rgb, bg).convert('L').point(lambda v: 255 if v > 18 else 0).getbbox()
    if not box:
        return im
    return im.crop((0, 0, im.width, min(im.height, box[3] + margin)))

for png in sorted(OUT.glob('*.png')):
    stem = png.stem
    if ids and not any(stem == i or stem.startswith(i + '-') for i in ids):
        continue
    # The page shows the word card as a sidebar crop only, and the reference only as a crop.
    if re.search(r'-card-(light|dark)$', stem) or re.match(r'reference-(light|dark)$', stem):
        continue
    im = Image.open(png)
    if stem.endswith('-panel'):
        im = trim_bottom(im)
    else:
        im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
    dst = IMG / f'{stem}.webp'
    im.convert('RGB').save(dst, 'WEBP', quality=84, method=6)
    print(f'{dst.name}: {im.width}x{im.height}, {dst.stat().st_size // 1024} KB')
