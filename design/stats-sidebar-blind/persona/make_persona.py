"""Build a simulated eight-week Spanish reading history for one learner.

The learner ("Sam") starts on 18 Aug 2026 by using the app's own
"Mark as known > Top 500", then reads on most days and marks words as they
meet them. Words met are sampled from the app's own Spanish lexicon, weighted
towards frequent words (weight = rank ** -1.3), which is how a reader of
everyday texts meets vocabulary. Learning words graduate to known after a
while. The output is one CSV per active day in the app's own import format
(header `word,status`), plus a plan.json that the browser driver replays day by
day under a fake clock, so the app itself records its daily history.

Everything here is a simulation: it is the persona, not a real user.
"""
import csv, json, random, datetime, pathlib

random.seed(20261013)
PACK = pathlib.Path('/home/user/tinta-blind/packs/es')
OUT = pathlib.Path('/home/user/tinta-blind-work/persona')

ranks = {}
for line in open(PACK / 'ranks.txt', encoding='utf-8'):
    if line.startswith('#') or not line.strip():
        continue
    for item in line.strip().split('|'):
        if ':' in item:
            w, r = item.rsplit(':', 1)
            ranks[w] = int(r)

lex = []
for line in open(PACK / 'lex.txt', encoding='utf-8'):
    if line.startswith('#') or not line.strip():
        continue
    word, band, frm, pos = line.rstrip('\n').split('|')
    lex.append((word, band, frm, pos))

# Headwords only (no inflected forms that point at a lemma), with a rank.
pool = [(w, ranks[w]) for (w, b, f, p) in lex if not f and w in ranks and ranks[w] > 500]
unranked = [w for (w, b, f, p) in lex if not f and w not in ranks]
loanwords = ['ok', 'okay', 'wow', 'hey', 'email', 'blog', 'chat', 'software']

def sample(n, exclude, exponent):
    cands = [(w, r) for (w, r) in pool if w not in exclude]
    weights = [r ** -exponent for (w, r) in cands]
    picked = set()
    while len(picked) < n and cands:
        w = random.choices(cands, weights=weights, k=1)[0][0]
        picked.add(w)
    return sorted(picked)

start = datetime.date(2026, 8, 18)
end = datetime.date(2026, 10, 13)
days = [start + datetime.timedelta(d) for d in range((end - start).days + 1)]

# Which days the learner opens the app: most days, a five-day break in
# September, and fewer weekend sessions.
active = []
for d in days:
    if d in (start, end):
        active.append(d)
        continue
    if datetime.date(2026, 9, 14) <= d <= datetime.date(2026, 9, 18):
        continue  # a week away
    p = 0.62 if d.weekday() >= 5 else 0.86
    if random.random() < p:
        active.append(d)

known, learning, ignored = set(), [], set()
plan = []
for i, d in enumerate(active):
    entry = {'date': d.isoformat(), 'topN': 500 if i == 0 else None}
    rows = []
    if i == 0:
        new_learning = sample(14, set(), 1.1)
        learning.extend(new_learning)
        rows += [(w, 'learning') for w in new_learning]
    else:
        # A longer session now and then; the last day is today's (light) session.
        k = max(6, int(random.gauss(24, 10)))
        if random.random() < 0.15:
            k += 30
        if d == end:
            k = 9
        new_known = sample(k, known | set(learning), 1.6)
        # Graduate some learning words that have been around a while.
        g = min(len(learning), max(0, int(random.gauss(4, 2))))
        graduates = learning[:g]
        learning = learning[g:]
        n_learn = max(1, int(random.gauss(6, 2.5))) if d != end else 3
        new_learning = sample(n_learn, known | set(learning) | set(new_known), 1.3)
        learning.extend(new_learning)
        known |= set(new_known) | set(graduates)
        rows += [(w, 'known') for w in new_known + graduates]
        rows += [(w, 'learning') for w in new_learning]
        if loanwords and random.random() < 0.18:
            w = loanwords.pop(0)
            ignored.add(w)
            rows.append((w, 'ignored'))
    path = OUT / f'day-{d.isoformat()}.csv'
    with open(path, 'w', encoding='utf-8', newline='') as fh:
        wr = csv.writer(fh)
        wr.writerow(['word', 'status'])
        wr.writerows(rows)
    entry['csv'] = str(path) if rows else None
    entry['rows'] = len(rows)
    plan.append(entry)

json.dump(plan, open(OUT / 'plan.json', 'w'), indent=1)
print('active days', len(active), 'of', len(days))
print('known beyond Top 500:', len(known), 'learning:', len(learning), 'ignored:', len(ignored))
by_band = {'501-1500': 0, '1501-4000': 0, '4000+': 0}
for w in known:
    r = ranks[w]
    by_band['501-1500' if r <= 1500 else '1501-4000' if r <= 4000 else '4000+'] += 1
print(by_band)
