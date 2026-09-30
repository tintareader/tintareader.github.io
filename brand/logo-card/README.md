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

## Rolled out to this site

The card identity is live in this repository's generated output as of the
commit that added this section, so the site shows it as soon as `main`
carries the commit:

| Site file | What changed |
|-----------|--------------|
| `icon.svg` | The favicon: the bare mark in a 32 px box, following the browser's scheme |
| `favicon.ico` | 16 and 32 px renderings of the same |
| `icons/icon-192.png`, `icons/icon-512.png` | The mark on the light ground in the superellipse, as before |
| `icons/maskable-512.png` | Full-bleed ground, the mark inside the safe circle |
| `icons/apple-touch-icon.png` | Full-bleed ground, 180 px |
| `og.png` | The link preview, `og-card.html` here rendered by `render-og.cjs`, with the wordmark in place of the old bars and "Tinta"; copy and layout unchanged |
| `404.html` | Its picture is now `/icons/icon-192.png`, since a bare scheme-following mark disappears on that page's fixed dark ground |

The service worker serves icons network-first, so no version bump was
needed; an installed app's Home Screen icon updates when the OS refreshes
it or the app is reinstalled.

**The next publish from the app repository overwrites all of this** unless
the source is updated there too. When a machine is to hand, in the app
repository's `docs/brand`: replace the favicon and icon sources with
`icon.svg`, `app-icon.svg`, `app-icon-maskable.svg` and
`apple-touch-icon.svg` from this folder and point `build-icons.sh` at them;
replace `og-card.html` with the one here (or lift its left column into the
existing one); and change the 404 template's `<img>` to
`/icons/icon-192.png`. Then publish as usual.
