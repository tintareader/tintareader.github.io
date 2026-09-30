# Tinta logo

The chosen identity: the mark (a drop of ink holding a line of two words,
concept 1a) and the wordmark (the name set as the word card, concept 4a).
`guide.html` is the usage guide: construction, lockups, colour, sizes,
clear space, the app icon, what not to do, the files, and the rollout.

Regenerate everything from one definition:

    python3 brand/logo/outline.py           # once: the two words as paths (needs fontTools,
                                            # Bitstream Charter and Source Sans 3)
    node brand/logo/build.mjs brand/logo    # the SVGs and guide.html
    node brand/logo/render.cjs brand/logo   # the PNG icons and favicon.ico (needs Playwright)

This site repository is regenerated in full on every publish, so the logo
belongs in `docs/brand` of the app repository, next to `og-card.html` and
`build-icons.sh`; the guide's Rollout section says what to point where.
