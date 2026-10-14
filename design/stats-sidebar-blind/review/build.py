"""Assemble the review page: fill design blocks and ratings, inline images as data URIs.
In:  review/page.src.html, review/img/*.webp
Out: review/tinta-stats-panel.html (self-contained)"""
import base64, html, pathlib, re

R = pathlib.Path('/home/user/tinta-blind-work/review')
src = (R / 'page.src.html').read_text(encoding='utf-8')

DESIGNS = {
    'tufte': dict(
        who='Edward Tufte', title='The panel as a paragraph',
        approach='Numbers live inside sentences set in the app’s reading face, and every graphic is word-sized: a thin bar of known, learning and new words with only the thresholds that matter ticked (60 for A2, then 95 and 98); five small multiples, one per paragraph, with a tick per running word and tall pink ticks for new words; sparklines for this text over eight weeks and for words known; a dot strip placing this text among the reader’s seven.',
        q=['The first sentence: 86% known, readable with lookups for an A2 reader; one word in 8 is new, 33 lookups in 262 words.',
           'A sentence naming the seven returning words and the payoff, 92%. No button.',
           'Outcome first: this text 77% → 86%; then words known, +118 this week.'],
        pros='The most information per pixel without clutter; it looks like the reader it sits beside; the paragraph rows show at once that paragraphs 2 and 4 hold most of the new words.',
        cons='It has to be read rather than glanced at; numbers in prose are hard to compare; the dot strip repeats what the text chooser already shows.'),
    'few': dict(
        who='Stephen Few', title='A monitor read in two seconds',
        approach='A bullet graph carries the main measure: a dark bar for the share known, against grey ranges for the reader’s level (under 60 hard, 60–95 readable with lookups, 95–98 comfortable, 98 and up easy) and a target mark at 95. Below it a compact table, a bar chart of the new words that return with “Add 7 to Learning”, and the week in three rows: words added against the reader’s weekly average, days read, and words known with a sparkline. Greys everywhere except the status colour.',
        q=['The bullet graph and a verdict chip, both readable without the legend.',
           'The returning words as bars, the 92% payoff and a button.',
           'Proxy first: words added this week against the average (118 against 142), days read, the total.'],
        pros='The quickest answer to every question; every number has a reference; nothing decorative; the cheapest to build.',
        cons='It feels like a business dashboard; bullet graphs need one look at the legend; at this width the 95–98 and 98–100 ranges are slivers; a week below average reads as a reproach.'),
    'felton': dict(
        who='Nicholas Felton', title='A reading report for one text',
        approach='A report masthead (date, title, author, length), one very large number, then the text as 262 dots in reading order coloured by status. Three stat cells (33 new-word uses, 24 different new words, a 1:8 rate), a ranked list of the seven returning words with a dot per use and their glosses, the projected 92% as a second big number, and the week as three numbers over a column chart of eight weeks of daily gains; the day-one Top 500 import is outlined and marked off scale.',
        q=['The big 86% with the verdict beside it, and the dot matrix as a picture of the text.',
           'The ranked list and the projection. No button.',
           'Proxy first: +118 words this week, 5 of 7 days, 1,751 words; the column chart shows rhythm, not reading.'],
        pros='The most desirable to look at; a clear hierarchy; the dot matrix doubles as a picture of the text; the report frame makes a session feel like an achievement.',
        cons='The tallest panel, so with the word card open it scrolls; big numbers invite comparisons between texts of different lengths; the date line is decoration.'),
    'lupi': dict(
        who='Giorgia Lupi', title='The story, word by word',
        approach='Every running word is drawn as a dash as long as the word, in paragraphs and reading order: grey for known, underlined amber for learning (as in the text), pink for new. A ring marks new words that come back; a thread joins the four uses of monte, the word for the bush where the story goes. Italic notes say what the picture shows, such as the paragraph thickest with new words. Progress is 42 stems, one for each day the reader marked words, with day one and the week away annotated.',
        q=['A sentence: “86 of every 100 words here are already yours. The rest are one tap away.”',
           'The thread and the rings, then a sentence naming the seven words and the 92%.',
           'Outcome first: this story was 77% yours on 18 August and is 86% now; then the stems.'],
        pros='The most human; it shows what an average hides (where the difficulty sits, which words return) and makes the reader’s own history something to look at.',
        cons='It needs its legend and is slower to read. Some notes need writing per text: the densest paragraph can be computed, but “the bush where the story goes” cannot, unless it comes from an AI summary when AI is switched on.'),
    'isotype': dict(
        who='Gerd Arntz, Otto and Marie Neurath · Isotype', title='Count the words',
        approach='A headline in words and symbols: “About 1 word in 8 is new to you” over eight word symbols, one pink. Then the text as rows of symbols, each standing for 10 running words (22.7 known, 0.2 learning, 3.3 new; fractions are cut, not rounded), the returning new words with one symbol per appearance, and the reader’s vocabulary every two weeks with one book per 100 known words (613 on 18 Aug to 1,751 today). Set in Jost, a Futura-like face, as Isotype charts were set in Futura.',
        q=['The natural frequency with eight symbols, then 86% and the verdict.',
           'One symbol per appearance and the 92% line. No button.',
           'Proxy: words known, as rows of books.'],
        pros='The easiest to understand without numbers; it follows the icon-array research; the counting is honest.',
        cons='Symbols take space; fractions of a symbol (0.2 learning) are hard to read; “each symbol = 10 words” is a second unit to learn; there is no text-level outcome.'),
}

def design_block(key):
    d = DESIGNS[key]
    qs = ''.join(f'<tr><td>{q}</td><td>{html.escape(a, quote=False)}</td></tr>' for q, a in zip(['Can I read this?', 'What will help most?', 'Am I getting better?'], d['q']))
    return f'''
    <article class="design" id="d-{key}">
      <div>
        <div class="who">{html.escape(d['who'], quote=False)}</div>
        <h3>{html.escape(d['title'], quote=False)}</h3>
        <div class="meta">
          <p>{html.escape(d['approach'], quote=False)}</p>
          <div class="tablewrap" style="margin:6px 0 12px"><table class="zq"><thead><tr><th colspan="2">Julie Zhuo’s three questions</th></tr></thead><tbody>{qs}</tbody></table></div>
          <p><b>Strengths.</b> {html.escape(d['pros'], quote=False)}</p>
          <p><b>Risks.</b> {html.escape(d['cons'], quote=False)}</p>
        </div>
      </div>
      <div>
        <div class="pair">
          <figure><img class="shot" data-zoom tabindex="0" alt="{d['who']} design, Stats panel, light theme" src="{{{{img:{key}-light-panel}}}}"><figcaption>Light</figcaption></figure>
          <figure><img class="shot" data-zoom tabindex="0" alt="{d['who']} design, Stats panel, dark theme" src="{{{{img:{key}-dark-panel}}}}"><figcaption>Dark</figcaption></figure>
        </div>
        <div class="apps">
          <figure><img class="shot" data-zoom tabindex="0" alt="{d['who']} design in the running app, light theme" src="{{{{img:{key}-light}}}}"><figcaption>In the app, light</figcaption></figure>
          <figure><img class="shot" data-zoom tabindex="0" alt="{d['who']} design in the running app, dark theme" src="{{{{img:{key}-dark}}}}"><figcaption>In the app, dark</figcaption></figure>
        </div>
      </div>
    </article>'''

def rating(n):
    n = int(n)
    return f'<span class="rating" role="img" aria-label="{n} of 5">{"●" * n}<span class="o">{"●" * (5 - n)}</span></span>'

out = re.sub(r'\{\{design:(\w+)\}\}', lambda m: design_block(m.group(1)), src)
out = re.sub(r'\{\{r:(\d)\}\}', lambda m: rating(m.group(1)), out)
used = set()
def img(m):
    name = m.group(1)
    used.add(name)
    data = (R / 'img' / f'{name}.webp').read_bytes()
    return 'data:image/webp;base64,' + base64.b64encode(data).decode()
out = re.sub(r'\{\{img:([\w-]+)\}\}', img, out)
assert '{{' not in out, re.findall(r'\{\{[^}]*\}\}', out)[:5]
(R / 'tinta-stats-panel.html').write_text(out, encoding='utf-8')
# A light version that links the image files, for local viewing next to img/.
light = re.sub(r'\{\{img:([\w-]+)\}\}', lambda m: f'img/{m.group(1)}.webp', re.sub(r'\{\{r:(\d)\}\}', lambda m: rating(m.group(1)), re.sub(r'\{\{design:(\w+)\}\}', lambda m: design_block(m.group(1)), src)))
(R / 'tinta-stats-panel.linked.html').write_text(light, encoding='utf-8')
print('images used:', len(used), '| page size:', round(len(out.encode()) / 1e6, 2), 'MB')
