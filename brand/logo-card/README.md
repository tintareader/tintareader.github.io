# Tinta logo: the card

The card identity, from concept 4a: the wordmark is the name set as the
word card the app opens on a tap ("tinta" over "reader"), and the mark is
that card reduced to two bars. `guide.html` is the usage guide:
construction, lockups, colour, sizes, clear space, the app icon, what not
to do, the files, and the rollout. The drop identity from concept 1a is in
`../logo`, with the same structure, for comparison.

Regenerate everything from one definition:

    node brand/logo-card/build.mjs brand/logo-card    # the SVGs and guide.html
    node brand/logo-card/render.cjs brand/logo-card   # the PNG icons and favicon.ico (needs Playwright)

`wordmark-paths.json` holds the two words as outlines, made once by
`../logo/outline.py` from Bitstream Charter and Source Sans 3.

This site repository is regenerated in full on every publish, so the logo
belongs in `docs/brand` of the app repository, next to `og-card.html` and
`build-icons.sh`; the guide's Rollout section says what to point where.
