"""Collect the numbers the mockups use into one file, and derive a few more.

Real (shown by the app for the simulated reader): token and unique counts by
status, the headline share, frequency bands, vocabulary totals, frequency
coverage, daily history, per-word counts in the text, the chooser's % known.

Derived here from those real numbers (the app does not show them today):
"1 new word in N", the payoff of learning the repeated new words, gains over
the last 7 and 28 days, active days.
"""
import json, datetime, pathlib

D = pathlib.Path('/home/user/tinta-blind-work/data')
TODAY = datetime.date(2026, 10, 13)

def load(name):
    return json.load(open(D / name, encoding='utf-8'))

def words(slug):
    w = load(f'words-{slug}.json')
    out = {}
    for st, rows in w.items():
        out[st] = []
        for r in rows:
            nums = {n['title'].split(' —')[0] if 'Top' in (n['title'] or '') or n['title'] in ('Unlisted', '4,000+') else n['title']: n for n in r['nums']}
            count = int(next(n['text'] for n in r['nums'] if n['title'] == 'Times in this text'))
            first = int(next(n['text'] for n in r['nums'] if n['title'] == 'Where it first appears, counted in words'))
            band = next(n['title'] for n in r['nums'] if 'wband' in n['cls'])
            out[st].append({'word': r['word'], 'gloss': r['gloss'], 'count': count, 'first': first, 'band': band})
    return out

texts = {}
app = load('app-numbers.json')
meta = {
    'tortuga': ('La tortuga gigante', 'Horacio Quiroga, Cuentos de la selva (1918), opening'),
    'quijote': ('Don Quijote, capítulo 1', 'Miguel de Cervantes (1605), first two paragraphs'),
    'cena': ('La cena a las diez', "Tinta's built-in story 1 (level 500)"),
    'ofrenda': ('La ofrenda', "Tinta's built-in story 2 (level 1500)"),
    'mate': ('Un mate en la oficina', "Tinta's built-in story 3 (level 4000)"),
}
for slug, (title, source) in meta.items():
    toks = load(f'tokens-{slug}.json')
    counts = {s: sum(1 for t in toks if t['s'] == s) for s in ('k', 'l', 'u', 'i')}
    total = len(toks)
    w = words(slug)
    new = sorted(w['New'], key=lambda r: (-r['count'], r['first']))
    repeated = [r for r in new if r['count'] >= 2]
    gain = sum(r['count'] for r in repeated)
    stats_text = app[title]['textStats']
    headline = int(stats_text.split('WORD STATISTICS')[1].split('%')[0].strip().split('\n')[-1])
    texts[slug] = {
        'title': title, 'source': source, 'total': total, 'counts': counts,
        'unique': {'total': len(set(t['t'].lower() for t in toks))},
        'headline': headline,
        'new_unique': len(new), 'learning_words': w['Learning'], 'new_words': new,
        'repeated_new': repeated, 'repeated_tokens': gain,
        'after_repeated_pct': int((counts['k'] + gain) / total * 100),
        'one_in': round(total / counts['u']) if counts['u'] else None,
        'paragraphs': max(t['p'] for t in toks) + 1,
        'tokens': toks,
    }

# Unique counts as the app reports them (roots, not surface forms)
def unique_from_app(title):
    s = app[title]['textStats']
    part = s.split('Unique')[1]
    nums = [int(x.replace(',', '')) for x in part.split('\n') if x.strip().replace(',', '').isdigit()]
    return {'total': nums[0], 'k': nums[1], 'l': nums[2], 'u': nums[3], 'i': nums[4]}

def bands_from_app(title):
    s = app[title]['textStats'].split('FREQUENCY BANDS')[1].split('Bands from')[0]
    lines = [x for x in s.split('\n') if x.strip()]
    return [{'label': lines[i], 'pct': float(lines[i + 1].rstrip('%'))} for i in range(0, len(lines), 2)]

for slug, (title, _) in meta.items():
    texts[slug]['unique'] = unique_from_app(title)
    texts[slug]['bands'] = bands_from_app(title)

hist = load('history.json')
def known_on(day):
    v = None
    for p in hist:
        if datetime.date.fromisoformat(p['d']) <= day:
            v = p
    return v

wk = known_on(TODAY - datetime.timedelta(7))
prev_wk = known_on(TODAY - datetime.timedelta(14))
m4 = known_on(TODAY - datetime.timedelta(28))
last = hist[-1]
active_7 = sum(1 for p in hist if TODAY - datetime.timedelta(7) < datetime.date.fromisoformat(p['d']) <= TODAY)
active_28 = sum(1 for p in hist if TODAY - datetime.timedelta(28) < datetime.date.fromisoformat(p['d']) <= TODAY)
persona = {
    'name': 'Sam (simulated reader)', 'level': 'A2', 'language': 'Spanish (Latin America)',
    'known': 1751, 'learning': 105, 'ignored': 7, 'dictionary': 16213,
    'coverage': [
        {'label': 'Top 100', 'k': 100, 'total': 100},
        {'label': 'Top 500', 'k': 498, 'total': 500},
        {'label': 'Top 1,500', 'k': 1105, 'total': 1500},
        {'label': 'Top 4,000', 'k': 1528, 'total': 4000},
    ],
    'history': hist,
    'start': hist[0], 'last': last,
    'gain_7': last['k'] - wk['k'], 'gain_prev_7': wk['k'] - prev_wk['k'], 'gain_28': last['k'] - m4['k'],
    'gain_all': last['k'] - hist[0]['k'],
    'active_7': active_7, 'active_28': active_28, 'active_all': len(hist),
    'days_all': (TODAY - datetime.date.fromisoformat(hist[0]['d'])).days + 1,
    'today_gain': last['k'] - hist[-2]['k'],
}
library = [
    {'title': 'La cena a las diez', 'pct': 99}, {'title': 'Dos cafés', 'pct': 97},
    {'title': 'Un café, por favor', 'pct': 96}, {'title': 'Un mate en la oficina', 'pct': 90},
    {'title': 'La ofrenda', 'pct': 89}, {'title': 'La tortuga gigante', 'pct': 86},
    {'title': 'Don Quijote, capítulo 1', 'pct': 73},
]
out = {'texts': texts, 'persona': persona, 'library': library}
json.dump(out, open(D / 'mock-data.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
t = texts['tortuga']
print('tortuga', t['total'], t['counts'], t['unique'], t['headline'], 'one in', t['one_in'], 'repeated', [(r['word'], r['count']) for r in t['repeated_new']], 'after', t['after_repeated_pct'])
print('quijote', texts['quijote']['total'], texts['quijote']['counts'], texts['quijote']['headline'], 'one in', texts['quijote']['one_in'], 'repeated', [(r['word'], r['count']) for r in texts['quijote']['repeated_new']], 'after', texts['quijote']['after_repeated_pct'])
print('cena', texts['cena']['headline'], texts['cena']['counts'])
print({k: v for k, v in persona.items() if k not in ('history', 'coverage')})
