# Sidebar Stats: ten designers

A third design study for the Stats tab in the reader's right-hand column. Like
`../stats-sidebar/` and `../stats-sidebar-blind/`, it is not part of the
generated site, so keep it off `main`.

The product owner liked the information in the three-question panel
recommended by `../stats-sidebar-blind/` but not how it was displayed. Ten
designers each show exactly the same facts in their own way:

| Designer | Piece | File |
| --- | --- | --- |
| Charles Joseph Minard | Figurative map of a text | `designs/minard.mjs` |
| W.E.B. Du Bois | One reader and one text, in three plates | `designs/dubois.mjs` |
| Harry Beck | Line diagram | `designs/beck.mjs` |
| Dieter Rams | Instrument | `designs/rams.mjs` |
| Massimo Vignelli | One grid, three bands | `designs/vignelli.mjs` |
| Susan Kare | Three windows, one bit | `designs/kare.mjs` |
| Paula Scher | Type at its true size | `designs/scher.mjs` |
| Amanda Cox | You are here | `designs/cox.mjs` |
| Federica Fragapane | Seeds, petals and sprouts | `designs/fragapane.mjs` |
| Mona Chalabi | Circled in pencil | `designs/chalabi.mjs` |

Each panel applies what the designer's published work does to this panel.
None of them made or endorsed it.

- `BRIEF.md` is the brief every designer worked from: the fixed facts, the
  399 × 817 px frame, the colour rules and the file format.
- `designs/reference.mjs` is the recommended panel, ported unchanged. It
  sets the content and is the "before".
- `review/index.html` is the write-up, with every panel in light and dark,
  with and without the word card, and notes for choosing. It loads `img/`,
  so open it from a local server. The published copy is the private Artifact
  "The Stats Panel, Ten Ways".
- `harness/` holds the data, the screenshot driver and the image script.
- `fonts/` holds the Google Fonts the designs use (all OFL), inlined at
  shoot time because the app's Content Security Policy blocks remote fonts.

## The numbers

Every figure comes from `harness/data.mjs`, which reads the simulated reader
of `../stats-sidebar-blind/data/`: an A2 Spanish learner seven weeks in,
reading the opening of Quiroga's "La tortuga gigante". No design types a
number in. The A2 level, the 60% and 95% marks, the button and the link are
that round's proposals, not features of the app.

## Regenerating

With the site served from the repository root on port 4273
(`npx serve -l 4273 -s .`), from this folder:

```sh
CARD=1 node harness/shoot.mjs reference minard dubois beck rams vignelli kare scher cox fragapane chalabi
python3 harness/prep.py      # out/*.png -> review/img/*.webp
node review/build.mjs        # review/index.html
```

`shoot.mjs` starts a fresh browser, writes `state-sam.json` into the app's
IndexedDB, opens the text, puts the design in place of the Stats tab's
content and photographs the window and the sidebar in both themes. It
reports each design's height and anything that runs past the 399 px edge.
Set `PW` to Playwright's `index.mjs` if it is not at
`/opt/node22/lib/node_modules/playwright/`. `node harness/getfont.mjs
"Family:wght@400..700"` adds a Google Font to `fonts/`.
