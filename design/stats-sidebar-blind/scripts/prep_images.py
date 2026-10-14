"""Convert screenshots to WebP for the review page.
Full-app shots: 2400 px wide. Panel crops: trimmed below the last content row
(same height for the light and dark pair), kept at 2x."""
import pathlib
from PIL import Image, ImageChops

SRC = pathlib.Path('/home/user/tinta-blind-work/shots')
OUT = pathlib.Path('/home/user/tinta-blind-work/review/img')
OUT.mkdir(parents=True, exist_ok=True)

def last_content_row(im):
    rgb = im.convert('RGB')
    w, h = rgb.size
    bg = rgb.getpixel((w // 2, h - 4))
    diff = ImageChops.difference(rgb, Image.new('RGB', rgb.size, bg)).convert('L').point(lambda v: 255 if v > 18 else 0)
    # ignore the 3px left border of the panel
    box = diff.crop((8, 0, w, h)).getbbox()
    return box[3] if box else h

pairs = {}
for p in sorted(SRC.glob('*-panel.png')):
    stem = p.stem[:-len('-panel')]
    base = stem.rsplit('-', 1)[0]  # strip theme
    pairs.setdefault(base, []).append(p)

for base, files in pairs.items():
    ims = [Image.open(f) for f in files]
    h = min(ims[0].size[1], max(last_content_row(i) for i in ims) + 48)
    for f, im in zip(files, ims):
        im.crop((0, 0, im.size[0], h)).convert('RGB').save(OUT / (f.stem + '.webp'), 'WEBP', quality=86, method=6)

for p in sorted(SRC.glob('*.png')):
    if p.stem.endswith('-panel') or p.stem.startswith('baseline-text-'):
        continue
    im = Image.open(p).convert('RGB')
    im = im.resize((2400, round(im.size[1] * 2400 / im.size[0])), Image.LANCZOS)
    im.save(OUT / (p.stem + '.webp'), 'WEBP', quality=80, method=6)

total = sum(f.stat().st_size for f in OUT.glob('*.webp'))
print(len(list(OUT.glob('*.webp'))), 'images', round(total / 1e6, 2), 'MB')
for f in sorted(OUT.glob('*-panel.webp')):
    print(f.name, Image.open(f).size)
