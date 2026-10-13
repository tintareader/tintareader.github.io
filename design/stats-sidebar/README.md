# Sidebar Stats: design study

A design study for the Stats tab in the reader's right-hand column. It is not
part of the generated site, so keep it off `main`.

Five designers known for statistics each restyle the same panel: Stephen Few,
Edward Tufte, Nicholas Felton, Isotype (Otto and Marie Neurath, Gerd Arntz) and
Stefanie Posavec. Julie Zhuo's published principles on data set the brief.
Every mockup is the published app from this repository with the panel
injected, in light and dark, with the word card closed and open.

- `review/index.html` is the write-up: research, brief, all mockups, and the
  recommendation. Open it from a local server, since it loads `img/`.
- `harness/` holds the scripts that seed the reader, read the numbers out of
  the running app and photograph each design.

## The brief

The sidebar answers three questions while you read: can I read this, what is
in my way, and is it getting easier? Everything about you rather than this
text moves to a larger stats page.

| Keep in the sidebar | Move to the stats page | Drop |
| --- | --- | --- |
| Share of this text known, with a band (Hard < 90, Stretch 90–95, Comfortable 95–98, Easy 98+) | Running vs unique counts by status | Share of the dictionary known |
| Change since the text was opened | The text's frequency bands | |
| New words left, named, tap to jump | Ignored counts | |
| One line of words being learned | Words known, coverage by band, progress over time | |
| A door to the stats page | The frequency list's source note | |

## Recommendation

Build **Julie Zhuo's cut** (`zhuo` in `harness/designs.mjs`). It has a verdict,
the change since opening, "Learn six words to make it Comfortable (95%)" with
the words as chips, "Next: rieron · Go to it", a quiet learning line and a door
to the stats page. It fits under an open word card.

If you want more, two pieces can be borrowed: Few's bullet graph in place of
the ladder, and Tufte's word strip, which is 34 px tall.

To build it:

1. Count Ignored words as readable in the headline. Names stop counting
   against the reader, and *La ofrenda* goes from 91% to 93%.
2. Keep each text's coverage at the moment it is opened. App commit d927aec2
   already computed this for "Up from X% when you opened it".
3. Find the next New word after the cursor.
4. Add the four band names to all eight interface languages.
5. Remove the This text / Overall switch, since Overall becomes the stats page.

## Regenerating the screenshots

With the site served from the repository root on port 4173
(`npx serve -l 4173 -s .`), work in `harness/`. Set `PW` to Playwright's
`index.mjs` if the package is not installed there.

```sh
node seed1.mjs        # the app's own Top 500 and Top 1,500 known sets -> base-*.json
node buildstate.mjs   # a seven-week Spanish learner -> state-seeded.json
node read1.mjs        # open La ofrenda (89%), mark ten words (91%) -> state-reading.json
node extract.mjs      # every number the panels show, read from the app -> data.json
mkdir -p out
node shoot.mjs        # each design x light/dark x card closed/open -> out/
node before2.mjs      # the current panel, for comparison -> out/
```

`state-reading.json` and `data.json` are committed, so `shoot.mjs` runs on its
own. The history in `state-reading.json` was scaled by 1320/1310 after
`read1.mjs`, so the seeded days count words the way the app's own history does.
