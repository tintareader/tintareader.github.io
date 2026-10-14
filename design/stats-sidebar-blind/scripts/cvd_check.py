"""Colour-vision check of the app's status colours (my own script: OKLab
distance x100 after simulating protan/deutan/tritan vision with the Machado et
al. 2009 matrices at full severity). Output: data/cvd.json and a printout."""
import json, itertools

M = {
    'normal': [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    'protan': [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    'deutan': [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
    'tritan': [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
}

def lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def hex2lin(h):
    h = h.lstrip('#')
    return [lin(int(h[i:i + 2], 16)) for i in (0, 2, 4)]

def oklab(rgb):
    r, g, b = [min(1, max(0, x)) for x in rgb]
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = [x ** (1 / 3) for x in (l, m, s)]
    return (0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
            1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
            0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_)

def sim(h, kind):
    v = hex2lin(h)
    m = M[kind]
    return [sum(m[i][j] * v[j] for j in range(3)) for i in range(3)]

def dE(a, b, kind):
    A, B = oklab(sim(a, kind)), oklab(sim(b, kind))
    return 100 * sum((x - y) ** 2 for x, y in zip(A, B)) ** 0.5

themes = {
    'dark': {'known': '#c5ccd4', 'learning': '#e6b94f', 'new': '#ff5277', 'ignored': '#8a939e', 'surface': '#161a20'},
    'light': {'known': '#2b3138', 'learning': '#b8812a', 'new': '#b03a64', 'ignored': '#858993', 'surface': '#eceee9'},
}
out = {}
for theme, cols in themes.items():
    out[theme] = {}
    for a, b in [('new', 'learning'), ('new', 'known'), ('learning', 'known'), ('known', 'ignored'), ('new', 'ignored')]:
        out[theme][f'{a}/{b}'] = {k: round(dE(cols[a], cols[b], k), 1) for k in M}
    print(theme)
    for pair, v in out[theme].items():
        print(f'  {pair:18s}', '  '.join(f'{k} {x:5.1f}' for k, x in v.items()))
json.dump(out, open('/home/user/tinta-blind-work/data/cvd.json', 'w'), indent=1)
