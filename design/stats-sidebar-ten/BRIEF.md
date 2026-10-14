# Brief: the three-question panel, ten ways

The product owner likes the information in the recommended Stats panel from
`../stats-sidebar-blind` (the three-question panel), but not how it is
displayed. Ten designers each display **the same information** in a way that
is unique to them.

`designs/reference.mjs` is that panel, ported to this harness unchanged.
`out/reference-light-panel.png` and `out/reference-dark-panel.png` show it.

## The information (fixed)

Every design shows all of this, and nothing else. The numbers are the app's
own, for a simulated A2 Spanish reader partway through *La tortuga gigante*
(Horacio Quiroga). They arrive in `D` from `harness/data.mjs`. Read them from
`D`, never type them in.

**1. Can I read this?**

| Fact | In `D` |
| --- | --- |
| About 1 word in 8 is new to you | `D.oneIn` = 8 |
| Verdict for the reader's level: Readable with lookups, at A2 | `D.verdict.label`, `D.level` |
| 86% of the running words known | `D.pct` |
| 33 lookups in 262 words | `D.lookups`, `D.total` |
| The text's words by status: 227 known, 2 learning, 33 new | `D.counts.k`, `.l`, `.u` |
| Two marks on the scale: 60% workable at A2, 95% comfortable | `D.thresholds.workable`, `.comfortable` |

**2. What will help most?**

| Fact | In `D` |
| --- | --- |
| The new words that come back in this text, with how often each appears and its gloss: monte 4× (mountain, hill), aire 2× (air), enfermar 2× (to fall ill), escopeta 2× (shotgun), cazar 2× (to hunt), bicho 2× (bug, creature), cuero 2× (leather) | `D.repeated` = [{ word, count, gloss }] |
| One action, a button: Add 7 to Learning | `D.action` |
| Knowing them: 92% of this text | `D.after` |

(The seven words account for 16 of the 33 lookups: `D.repeatedTokens`. That
is the same fact as the counts above, so a design may show it.)

**3. Am I getting better?**

| Fact | In `D` |
| --- | --- |
| This text: 77% → 86% since 18 Aug, with its daily series | `D.firstPct`, `D.pct`, `D.since`, `D.series` = [{ d, v }] |
| Words known: 1,751, with its daily history | `D.known`, `D.history` = [{ d, k, l }] |
| +118 this week | `D.gain7` |

**Footer:** a link, "All your statistics →" (`D.more`).

A design may draw any of these at a finer grain, as long as it is the same
fact: for example the 262 words as 262 marks, in reading order, from
`D.tokens` = [{ t, s }] with `s` = `k` known, `l` learning, `u` new. It may not
add a new statistic (no frequency bands, no paragraph scores, no streaks, no
other texts) or drop one.

The three questions stay, in this order. A designer may word the headings in
their own voice, and may lay each question out however they like.

## The frame (fixed)

- The panel replaces the Stats tab's content in the reader's right-hand
  column, under the app's Words / Stats / Letters tabs, at a 1440 × 900
  window. It has **399 × 817 px** (the column is 400 px with its border). It must fit without scrolling. A design cannot widen the column: anything wider is clipped. The harness
  reports `(SCROLLS)` or anything that runs past the right edge.
- When the reader taps a word, the word card opens above the panel and takes
  roughly the top half (`CARD=1` shoots this too). The first question should
  be readable at a glance.
- It must work in the app's **light and dark** themes. Light is
  `:root[data-theme="light"]`; dark is the default (`:root` without it). Use
  the app's tokens, or define your own palette on `.mp-<id>` with a light
  override under `:root[data-theme="light"] .mp-<id>`.
- **New words are pink** in the text (`var(--c-unknown)`), learning words
  amber (`var(--c-learning)`, `var(--band-l)` for fills), known words plain
  ink (`var(--ink)`, `var(--band-k)` for fills). Wherever a design marks a new
  word, it uses `var(--c-unknown)`, so the panel and the text agree. Every
  other colour is the designer's.
- Status is never shown by colour alone: a label, a count or a shape goes
  with it. Text is at least 10.5 px. SVG charts carry an `aria-label`.
- The button must look pressable. The link must look like a link.

App tokens, both themes: `--bg --panel --panel2 --hairline --ink --ui --dim
--faint --c-unknown --c-learning --band-k --band-l --band-track --accent
--card-line --control-line --ok --ok-fill --ok-line --warn --font-ui
--font-read --fs-small --fs-label`. The app's `.btn` and `.sech` classes are
available.

## How to make one

```sh
# from design/stats-sidebar-ten, with the site served from the repo root:
#   (cd ../.. && npx serve -l 4273 -s .)
node harness/getfont.mjs "Family Name:wght@400..700"   # optional: Google Fonts -> fonts/
node harness/shoot.mjs <id>                           # -> out/<id>-light.png, -light-panel.png, -dark...
CARD=1 node harness/shoot.mjs <id>                    # also with the word card open
```

A design is one file, `designs/<id>.mjs`, exporting:

```js
export const meta = {
  id: 'beck',
  designer: 'Harry Beck',
  title: 'A short name for the piece',
  known: 'One line: what the designer is known for.',
  idea: 'Two or three sentences: the designer\'s way of seeing, and how it shapes this panel.',
  how: ['Can I read this? ...', 'What will help most? ...', 'Am I getting better? ...'],
  type: 'Fonts used, and where they come from.',
};
export const fonts = [{ family: 'Jost', style: 'normal', weight: '400 700', file: 'Jost-normal-400_700.woff2' }];
export const css = `.mp-beck { ... }`;           // every rule scoped under .mp-<id>
export function html(D) { return `<div class="mp mp-beck">...</div>`; }
```

The app's Content Security Policy allows fonts only from its own origin or
`data:` URIs; `shoot.mjs` inlines the files listed in `fonts`.
