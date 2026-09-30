# Tinta logo concepts

Six directions for the Tinta mark, all in the app's own palette: ink for a
known word, pink for an unknown one. Open `index.html` for the full sheet,
which proves each concept on the light and dark palettes, as a lockup with
the wordmark, as the app icon at 64, 32 and 16 px, and in one colour.

| # | File | Idea |
|---|------|------|
| 1 | `01-drop.svg` | A drop of ink with a text inside it; one word is unknown. |
| 2 | `02-tbar.svg` | The initial T built from a line of three words, the unknown one in pink, the stem hanging from it like the word card. |
| 3 | `03-bookmark.svg` | A bookmark dipped in ink; the pink meniscus is the ink line. |
| 4 | `04-line.svg` | Wordmark first: pink "tinta", ink "reader", the name read as a text in the app. The mark is that line as two blocks. |
| 5 | `05-stroke.svg` | A lowercase t in one pen stroke, ending in a pink blot. |
| 6 | `06-nib.svg` | A nib pointing down, breather hole in pink, the slit cut through to the tip. |

Each SVG is on a 64 px grid and follows the viewer's colour scheme through
`prefers-color-scheme`. `build.mjs` regenerates the SVGs and `index.html`
from one set of definitions:

    node brand/logo-concepts/build.mjs brand/logo-concepts

This site repository is regenerated in full on every publish, so a chosen
concept belongs in `docs/brand` of the app repository, next to `og-card.html`
and `build-icons.sh`.
