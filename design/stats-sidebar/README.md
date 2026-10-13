# Sidebar Stats: design study

A design study for the Stats tab in the reader's right-hand column. It is not
part of the generated site, so keep it off `main`.

Five designers known for statistics each restyle the same panel: Stephen Few,
Edward Tufte, Nicholas Felton, Isotype (Otto and Marie Neurath, Gerd Arntz) and
Stefanie Posavec. Julie Zhuo's published principles on data set the brief.
Every mockup is the published app from this repository with the panel
injected, in light and dark, with the word card closed and open.

- `review/index.html` is the write-up: research, brief, all mockups and the
  recommendation, with a switch between the two rounds. Open it from a local
  server, since it loads `img/`.
- `harness/` holds the scripts that seed the reader, read the numbers out of
  the running app and photograph each design.

## Two rounds

**Round 1** judged a text by the coverage bands from reading research: 95%
known as the minimum, 98% as comfortable. Those were measured for reading
without help, and Tinta glosses every word, so round 2 replaces them.

**Round 2** measures a text by its taps: New words, counted every time they
appear. Taps grow with the text's length, which is what wears a reader out.
The verdict compares a text with the reader's own past texts, using two
limits: the densest text they have finished (new words per 100), and the most
taps they have finished in one text. The reading log behind those limits is
illustrative in these mockups, because Tinta does not keep one yet.

## The brief (round 2)

| Keep in the sidebar | Move to the stats page | Drop |
| --- | --- | --- |
| Taps in this text, and taps left | Share of running words known | Coverage bands at 95% and 98% (explainer only) |
| New words per 100 against the reader's own limit | Running vs unique counts by status | Share of the dictionary known |
| The fix that saves most taps: names to set aside, a repeated word to learn | The text's frequency bands | |
| Next new word, with Go to it | Words known overall, progress over time | |
| One line each: words read past without a tap, words being learned | The limits chart, per-text history | |

## Recommendation

Build **Julie Zhuo's cut** (`zhuo`, `zhuo-first` and `zhuo-dense` in
`harness/designs2.mjs`). It has three states:

- **Before a reader has a log:** the cost leads (8 new words, one every 27),
  with a word strip showing where the taps fall. A quiet line says the
  comparison starts after ten texts.
- **Once it knows the reader:** "Lighter than most texts you finish", a rug
  of their past texts, the taps left and a button to the next new word.
- **On a text above the limit:** "Denser than any text you've finished",
  with the fix pushed. For *Un mate en la oficina*, setting aside Martín and
  Sofía and learning *mate* saves 13 of 37 taps.

To build it:

1. Count taps: each time a word card opens, count it against the text, both
   in total and by distinct word.
2. Keep a reading log on the device, per text. When it opens: its length, New
   occurrences and distinct New words, and words known overall. While
   reading: taps, words marked, the furthest sentence reached. At the end:
   finished, stopped, or reopened later.
3. Learn the two limits from recent texts (say the last thirty), and start
   comparing after ten.
4. Offer the fixes that save most taps. An unlisted word written with a
   capital is almost always a name, so offer to set it aside; then suggest the
   New word that repeats most.
5. Nudge on New words read past without a tap, so Known stays honest.
6. Keep the log on the device. The privacy policy promises no analytics; if
   the log syncs for Pro, the policy's list of what Pro stores needs a line.
7. Remove the This text / Overall switch, since Overall becomes the stats page.

## Regenerating the screenshots

With the site served from the repository root on port 4173
(`npx serve -l 4173 -s .`), work in `harness/`. Set `PW` to Playwright's
`index.mjs` if the package is not installed there.

```sh
node seed1.mjs        # the app's own Top 500 and Top 1,500 known sets -> base-*.json
node buildstate.mjs   # a seven-week Spanish learner -> state-seeded.json
node read1.mjs        # open La ofrenda (22 New), mark ten words (8 New) -> state-reading.json
node extract.mjs state-reading.json data.json 89      # La ofrenda, mid-read
node extract.mjs state-mate.json data-mate.json       # Un mate en la oficina, just opened
mkdir -p out
node shoot.mjs        # round 1 -> out/
node shoot2.mjs       # round 2 -> out2/
node before2.mjs      # the current panel, for comparison -> out/
node buildpage.mjs    # review/index.html, with the limits chart drawn from the data
```

`state-mate.json` is `state-reading.json` with *Un mate en la oficina* active.
The state and data files are committed, so `shoot.mjs`, `shoot2.mjs` and
`buildpage.mjs` run on their own. The history in `state-reading.json` was
scaled by 1320/1310 after `read1.mjs`, so the seeded days count words the way
the app's own history does. The reading log is in `derive2.mjs` as `LOG`.
