# Tinta logo concepts

Logo directions for the Tinta mark, all in the app's own palette: ink for a
known word, pink for an unknown one. Open `index.html` for the full sheet,
which proves each concept on the light and dark palettes, as a lockup with
the wordmark, as the app icon at 64, 32 and 16 px, and in one colour.

## Round two

Two variations each on the shortlisted Drop (1) and Tinta, reader (4), then
four new directions.

| # | File | Idea |
|---|------|------|
| 1a | `01a-drop-two-words.svg` | The drop holding the "tinta reader" line: pink word, known word cut out of the ink. |
| 1b | `01b-drop-on-a-line.svg` | The drop about to land on a line of text; the word under it is already pink. |
| 4a | `04a-card.svg` | The word card: unknown word above, its meaning beneath. Lockup stacks pink "tinta" over "reader". |
| 4b | `04b-tap.svg` | The tapped word: a pink word inside the app's selection ring. Lockup rings "tinta". |
| 7 | `07-blot.svg` | A splash of ink with the text showing through, one word pink. |
| 8 | `08-dripping-t.svg` | A solid T with a drop of ink falling from its crossbar. |
| 9 | `09-ring.svg` | A sentence wrapped into a ring: six words, one unknown. |
| 10 | `10-glasses.svg` | Reading glasses with one lens tinted pink. |

## Round one

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
