# Handoff: make the card logo the source of truth in the app repository

For an agent working in the (private) app repository, the one that builds
this site with `tools/publish/site.ts`.

## State of play

- The card identity (concept 4a) is **already live on tintareader.com**:
  commit `d591d76` on `main` of `tintareader/tintareader.github.io` replaced
  the favicon, the four app icons, `og.png` and the 404 page's picture by hand.
- Those are generated files. **The next publish overwrites them** unless the
  sources in the app repository's `docs/brand` change first. That is this job.
- Everything needed is in this folder, `brand/logo-card/`, on the site's `main`.
  `guide.html` is the usage guide; `README.md` lists every file.

## What to change in the app repository

1. **Sources into `docs/brand/`.** Copy from `brand/logo-card/`:
   `mark.svg`, `mark-light.svg`, `mark-dark.svg`, `mark-mono.svg`,
   `icon.svg`, `app-icon.svg`, `app-icon-dark.svg`, `app-icon-maskable.svg`,
   `apple-touch-icon.svg`, `wordmark.svg` (+ `-light`, `-dark`),
   `lockup.svg` (+ `-light`, `-dark`), and `wordmark-paths.json`.
   Retire whatever the old icon source was (the squircle with the coloured bars).

2. **`build-icons.sh`.** Point it at the new sources so it still emits the same
   output paths:

   | Output | From | Notes |
   |--------|------|-------|
   | `/icon.svg` | `icon.svg` | The bare mark; viewBox `8 7.5 48 48`, follows the browser's scheme |
   | `/favicon.ico` | `icon.svg` at 16 and 32 px | PNG-in-ICO is fine |
   | `/icons/icon-192.png`, `/icons/icon-512.png` | `app-icon.svg` | Light ground, superellipse with margin, mark at 75 % |
   | `/icons/maskable-512.png` | `app-icon-maskable.svg` | Full bleed, mark at 66 % |
   | `/icons/apple-touch-icon.png` | `apple-touch-icon.svg` at 180 px | Full bleed, mark at 75 % |
   | `/og.png` | `og-card.html` | See 3 |

   If the script's SVG-to-PNG step is awkward, the PNGs and the ICO in this
   folder are byte-for-byte what is live; copying them is acceptable. The
   site's `render.cjs` (Playwright) and `render-og.cjs` show one way to render.

3. **`og-card.html`.** Replace the old mark + "Tinta" header with the lockup.
   `brand/logo-card/og-card.html` is a complete drop-in with the same copy and
   layout as the current preview (it inlines `lockup-dark.svg` at 84 px tall);
   or lift only its `.left` header into the existing file. Then render `og.png`
   as the script does today (`sh docs/brand/build-icons.sh og`).

4. **The 404 template** (wherever `404.html` comes from): change
   `<img src="/icon.svg" alt="" />` to `<img src="/icons/icon-192.png" alt="" />`.
   The page has a fixed dark ground, and a bare scheme-following mark disappears
   on it; the framed icon does not.

5. **In-app uses of the old icon**, if any (an About or settings screen, an
   empty state): swap per the guide. The lockup where the name is first met
   (About, first run); the mark alone under 40 px. The toolbar title stays as
   text. Nothing in the app needs the wordmark set live; if it ever does, use
   the app's own font tokens (`--font-face-charter` for "tinta", `--font-ui`
   for "reader"), 2 : 1 in size, left-aligned.

6. **Keep the brand folders.** The publish "generates in full", so decide
   where `brand/logo-concepts`, `brand/logo` and `brand/logo-card` live from
   now on: either move them into the app repository (`docs/brand/…` is the
   natural home, next to `og-card.html`) and let the site drop them, or have
   `site.ts` preserve `brand/`. Moving them is the tidier option.

## Verify before publishing

After a dry publish, diff the generated `icon.svg`, `favicon.ico`,
`icons/*.png`, `og.png` and `404.html` against `main` of the site repository at
`d591d76`. They should match, or differ only by re-rendering. The "In use"
section of `guide.html` shows what each should look like. Then publish as
usual; the service worker serves icons network-first, so no version bump is
needed on its account.
