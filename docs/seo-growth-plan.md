# Tinta Reader: SEO and growth plan

Status: proposal, 16 October 2026. For James, and for the coding agents that implement it.
Based on the built site in `tintareader/tintareader.github.io` (commit `c5df9c1`, built from app commit `d9b7e48b`), plus web research done the same day.

---

## Start here: the ten things that matter most

1. **Put real content in the homepage HTML.** Today a crawler that doesn't run JavaScript sees only "the application bundle failed to load". (T0.1)
2. **Send one clear URL signal.** Internal links go to `/pricing.html`, which redirects with a temporary 307. Fix the links and canonicals, and make the redirects permanent. (T0.2)
3. **Finish the basics.** Descriptions and social tags on every page; `noindex` on the thank-you pages and raw data; fix the visible Markdown bug. (T0.3–T0.6)
4. **Tell search engines who Tinta Reader is.** Add structured data and use "Tinta Reader" everywhere: in the index we checked, a search for "Tinta Reader" doesn't find the site. (T0.7, T0.11)
5. **Connect Search Console, Bing Webmaster Tools and IndexNow.** About 30 minutes for James, and nothing goes on the site. (T0.9)
6. **Publish the stories that already exist.** 8 starters with sentence-by-sentence translations and 24 culture stories, under 7 language hubs. (C1.2, C1.3)
7. **Ship a free text difficulty checker.** It's the clearest gap found: nothing learner-facing ranks for it in these languages, and it's what Tinta already does. (C1.4)
8. **Write honest comparisons with LingQ, Readlang, LWT and Lute.** (C1.6)
9. **Publish word lists**, Indonesian, French, Portuguese and Arabic first. (C1.5)
10. **Localize for people learning English**, Indonesian and Brazilian Portuguese first. **Build "Read this page in Tinta"**, the growth channel with the strongest evidence. (L2.1, G1)

Then announce it where readers gather: AlternativeTo, Refold's tool library, r/languagelearning's resource thread and Show HN (section 8).

---

## How to use this document

**Agents, read this first.**

- `tintareader.github.io` is generated output ("generated in full on every publish; do not hand-edit"). Make every change in the private app repo. The places you'll touch most:
  - `index.html` (the app shell) and the Vite build (`vite.config.ts`)
  - `tools/publish/site.ts`, `tools/publish/lib/pages.ts` (standalone pages), `tools/publish/lib/pro-page.ts` (Pro pages)
  - the service worker source and `platform/offline.ts`
  - the Cloudflare Worker config (wrangler config, `_headers`, any `_redirects`)
  - pack sources under `app/public/packs/<lang>/` and the starter stories (`starters/<lang>.txt`, `starters/<lang>.<meta>.txt`). Read these to generate pages; don't change their formats.
- Work phase by phase, in task order. One task per PR. Every task has acceptance checks: automate them in the build's tests wherever you can (T0.12).
- Tasks marked **[James]** need a decision, an account, money or copy approval. Don't guess. Leave a clear TODO and move on.
- Follow the ground rules in section 3 on every task.
- After each deploy, run the live checks in Appendix A against production and paste the output into the PR.

---

## 1. Where things stand

### 1.1 The site today

| URL | What it is | Title | Description | Canonical | Notes |
|---|---|---|---|---|---|
| `/` | The app (React SPA) | ✓ | ✓ | ✓ | No content in the HTML (see 1.3) |
| `/pro`, `/es/pro` … `/id/pro` (8) | Pro sales page | ✓ | ✓ | ✓ | Correct, reciprocal hreflang; 4 `<h1>`, one per page state |
| `/pricing`, `/support`, `/privacy`, `/terms`, `/refunds` | Information pages | ✓ | ✗ | ✗ | Linked everywhere as `/x.html` |
| `/licenses` | Credits | ✓ | ✗ | ✗ | Not in the sitemap (fine) |
| `/thanks`, `/thanks-guest` | After checkout | ✓ | ✗ | ✗ | Indexable; should be `noindex` |
| `/404` | Not found | ✓ | n/a | n/a | `noindex` ✓ |

The sitemap has 14 URLs. Only one of them, the homepage, is about learning a language, and its HTML is empty.

### 1.2 What's already right (keep it)

- **robots.txt** blocks crawlers that gather text to train models (GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended and others). It lets in everything else, including the fetchers that search and answer for a person: OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User and PerplexityBot. Blocking Google-Extended doesn't affect Google Search.
- **The homepage head** has a good title, description, canonical and Open Graph card, written for someone who has never heard of Tinta.
- **The Pro pages** are in 8 languages, with correct hreflang in the pages and in the sitemap.
- **The static pages** are small, server-rendered and script-free, and their fonts use `font-display: swap`.
- **The service worker** only intercepts `/` and `/index.html`, so it won't swallow new static pages.
- **The positioning**: free with no account, no tracking, works offline, carefully made dictionaries. That's a story people repeat.

### 1.3 What's holding it back (most important first)

1. **Search engines barely know the site.** In an October 2026 check (a non-Google index, so treat it as a sign, not a measurement), searches for "Tinta Reader", "tintareader" and "tintareader.com" returned e-ink readers, a text-to-speech site and other apps named Tinta: a colouring app, a dictation app, and a Markdown viewer that already holds `alternativeto.net/software/tinta`. The homepage appeared only for long descriptive queries. Its snippet listed six languages, so that index hadn't re-read the page since German and Arabic were added.
2. **Nothing to rank.** No page answers anything a learner types into a search box: no stories, word lists, tools, comparisons or guides. The packs and starters already hold original material for most of these (section 2.3).
3. **The homepage HTML has no content.** Without JavaScript, the body reads *"Starting… If this message stays on screen, the application bundle failed to load."* That's what most AI crawlers and assistants see when they fetch the page, because they don't run JavaScript. So do link-preview bots and other crawlers that don't render. Google does render JavaScript, but then finds only the first-run picker, about 30 words. Google itself recommends server-side or static rendering, because not every crawler runs JavaScript.
4. **Mixed URL signals.** Every internal link points to `/pricing.html`, `/privacy.html` and so on. With Cloudflare's default static-asset handling, those answer with a **307 (temporary)** redirect to `/pricing`. The sitemap lists `/pricing`, and these pages have no canonical tag.
5. **Thin metadata.** Six page types have no meta description, canonical or Open Graph tags. The thank-you pages are indexable. There's no structured data anywhere. That matters more than usual here: "tinta" is an everyday word (it means ink in Spanish, Portuguese, Indonesian and Italian), so search engines need help to see "Tinta Reader" as a product.
6. **The Mac app can't be found.** The site mentions it more than ten times and never links to it. There's no Mac page, and no App Store listing turned up in searches. The only public trace found is the direct-download releases repo (`github.com/speedballjamm/textanalyser-releases`, still named after Text Analyser).
7. **Raw data is indexable.** `/packs/**/*.txt`, `licenses.json` and `NOTICE` can be crawled and indexed as if they were pages.
8. **A visible bug.** Unrendered Markdown links show on `/pricing` (`[Tinta's Pro page](https://…)`) and on both thank-you pages (`[Open Tinta](…)`).
9. **No measurement.** Nothing shows what people search for or which pages work. Search Console and Bing Webmaster Tools need no scripts on the site (section 9).

---

## 2. Strategy

### 2.1 The bet

The homepage won't rank for "learn Spanish": Duolingo, Babbel and the big publishers own that. Tinta can win the long tail, where its own material is better than what ranks now:

- **free tools**: a text difficulty checker and a vocabulary size test, which no one offers well for these languages
- **graded short stories**, with translations and culture notes. Here the results are mostly Amazon listings, book shops and spam.
- **honest comparisons** for people looking for an alternative to LingQ, Readlang or LWT. The pages that rank now are other small vendors praising themselves.
- **frequency word lists** with real coverage numbers. Competition is weakest for Indonesian and French.
- **pronunciation guides and expressions**, written for a speaker of a particular language. These complete each hub, though Spanish, French and German are crowded.

Each page is useful on its own and ends with one click into the reader, with that text loaded and its words coloured. The content is the shop window; the reader is the product.

Answers to simple questions ("what does saudade mean") increasingly come from AI Overviews, and people click through far less often when one appears. Tools and stories hold up much better than definitions, which is why they come first.

Next, localize the strongest pages for people learning English in big, less contested markets. Indonesia comes first (Tinta already prices in rupiah), then Brazil, then the Spanish-speaking countries. The English pack already has glosses, notes and translations in all three languages, and the searches checked in Indonesian and Portuguese return weak results.

Search is slow: expect months, not weeks. So the growth plan (section 8) also works through communities, directories, creators, teachers, the App Store and the product itself.

### 2.2 Who we're writing for

| Audience | Typical searches | Pages that bring them | What converts them |
|---|---|---|---|
| Independent learners (roughly A2 to B2) who learn by reading | "LingQ alternative", "learn Spanish by reading", "graded readers" | Comparisons, hubs, stories, the checker | A free reader with no account |
| Beginners | "easy Spanish stories", "most common French words", "Arabic alphabet" | Stories, word lists, pronunciation | The starter story, in the reader |
| Learners who want to check texts or their level | "Spanish text difficulty", "how many words do I know" | The checker, the vocabulary test | "Open this text in Tinta" |
| Learners of English in Indonesia, Brazil and Latin America | "cerita bahasa Inggris untuk pemula dan artinya", "textos em inglês para iniciantes com tradução" | Localized hubs and stories | A free reader in their own language |
| Teachers | "text difficulty checker", "readability for ESL" | The checker, a teachers page | No student accounts and no tracking |
| Mac users | "language learning app for Mac" | The Mac page, the App Store | The App Store listing |

### 2.3 What we already have

Counted from the packs and starters in this build:

| Asset | Source files | Per language | Reader languages | Notes |
|---|---|---|---|---|
| **Starter, "The parrot"** (2 parts) | `starters/<lang>.txt`, `starters/<lang>.<meta>.txt` | 1 story; part one is 17–20 sentences | 5–7 | Sentence-by-sentence translations, a culture note, and a "why" note on the hardest sentence |
| **Culture stories** | `packs/<lang>/stories.txt`, `stories.<meta>.txt` | 3, at the 500, 1,500 and 4,000 word levels; 100–570 words each | 6–7 | Hand-written. Each turns on a custom (sobremesa, la bise, duzen, saudade, mudik and so on), with a note written for each reader, not translated. |
| **Expressions** | `phrases.txt`, `phrases.<meta>.txt` | es 565, fr 563, de 664, pt 566, id 394, zh 292, ar 370, en 557 | 5–7 | Hand-glossed, and only where word-for-word misleads; grouped by `# ----` category comments |
| **Pronunciation tables** | `letters.txt`, `letters.<meta>.txt` | 30–214 units | 5–8 | IPA, an example word, and notes by position in the word, compared with the reader's own language |
| **Dictionary** | `lex.txt`, `gloss.<meta>.txt` | 14,400–17,200 headwords | 5–8 | The glosses are Tinta's own (generated with an LLM; all rights reserved) |
| **Frequency ranks** | `ranks.txt`, `learner.txt` | The full list, plus 230–730 learner "basics" | n/a | CC BY-SA 4.0 (OpenSubtitles via hermitdave/FrequencyWords) |
| **Material few sites have** | `roots.txt`, `rootmeans.txt` (ar); `radicals.txt`, `parts.txt` (zh); `derive.txt` (de, pt); the Indonesian affix card | | | For Phase 3 |

Reader languages:
- Spanish, French, German, Portuguese, Indonesian, Mandarin and Arabic each have material for readers of English, Spanish, French, Indonesian, Portuguese and Mandarin, minus the language itself.
- English has material for readers of all seven other languages. Arabic readers have no expression glosses or story notes yet.

The 24 culture stories, and the idea each one turns on:

| Lang | Level 500 | Level 1,500 | Level 4,000 |
|---|---|---|---|
| es | *La cena a las diez* (Spain): sobremesa | *La ofrenda* (Mexico): ofrenda, Day of the Dead | *Un mate en la oficina* (Argentina): mate |
| fr | *Deux ou trois ?* (France): la bise | *La galette des rois* (France): la fève | *Le troisième verre* (Senegal): ataya |
| de | *Am Sonntag* (Germany): Ruhe, the quiet Sunday | *Im Kaffeehaus* (Austria): Kaffeehaus | *Du oder Sie?* (Germany): duzen and siezen |
| pt | *Um cafezinho* (Brazil): cafezinho | *Uma noite de fado* (Portugal): saudade | *Sete ondas* (Brazil): Iemanjá |
| id | *Belum makan* (Indonesia): "sudah makan?" | *Lebaran di Jakarta*: mudik | *Sehari tanpa suara* (Bali): Nyepi |
| zh | *吃饭了吗？* (mainland): the greeting | *红包* (mainland): red envelopes | *中秋节的烟* (Taiwan): Mid-Autumn barbecue |
| ar | *فنجان آخر* (UAE): Arabic coffee | *صوت في الليل* (Egypt): the mesaharati | *مسمار جحا* (Jordan): Juha's nail |
| en | *At the bus stop* (UK): sorry | *How are you?* (US): "Fine, thanks" | *Bring a plate* (Australia) |

### 2.4 Keyword themes, and where Tinta can win

No paid keyword tool was used. "Who ranks" comes from a non-Google index, checked from the US in October 2026. Treat it as a sign of how crowded each search is, and let Search Console re-rank this table after a month. Rows are in build order.

| # | Theme | Example searches | Who ranks now | Opening | Tinta page |
|---|---|---|---|---|---|
| 1 | Text difficulty and known-word coverage | "Spanish text difficulty checker", "Spanish text analyzer", "check text difficulty French" | Research papers, English-only CEFR checkers (Text Inspector, Cathoven, Twee), spam | **Best.** No learner-facing tool for these languages | Text difficulty checker (C1.4) |
| 2 | Short stories with translation | "easy Spanish stories for beginners", "French short stories with English translation", "cerita bahasa Inggris untuk pemula dan artinya" | Amazon, Audible and Goodreads; a few free story libraries (Inklingo ranks in the top 10 with plain HTML stories); listicles; spam | **High.** Weakest for Indonesian, Arabic and Portuguese | Story pages (C1.2, L2.1) |
| 3 | Alternatives and comparisons | "LingQ alternative", "free LingQ alternative", "Readlang alternative", "LWT alternative" | Small vendors' own comparison pages (Lingo Champion, WordByWord, NeonLingo, LingoBlend), AlternativeTo, forum threads | **High.** An honest page that includes the free tools stands out | Comparisons (C1.6) |
| 4 | Learning English, in Indonesian and Portuguese | "belajar bahasa Inggris dengan membaca", "textos em inglês para iniciantes com tradução", "aprender inglés leyendo" | Journals, shop pages and listicles (id, pt); INESEM, FluentU and British Council (es) | **High** in Indonesian and Portuguese, **medium** in Spanish | Localized pages (L2.1) |
| 5 | Most common words | "Indonesian word frequency list", "1000 most common French words", "most common Arabic words", "most common Spanish words" | id: Wiktionary and PDFs (very weak); fr: weak; ar: moderate; es: Sprachcaffe, MosaLingua, LanguaTalk, FluentU, Inklingo (competitive); zh: HSK sites (hard) | **High** for id, fr, pt and ar; **medium** for es and de; **low** for zh | Word lists (C1.5) |
| 6 | Vocabulary size | "Spanish vocabulary size test", "how many French words do I know" | Academic tests (LexTALE-Esp), old forum threads | **High**, but it needs a real tool | Vocabulary test (L2.2) |
| 7 | Learning by reading | "learn Spanish by reading", "read to learn French" | FluentU, Readle, StoryLearning, Readlang's per-language pages | **Medium to hard.** Needed as hubs anyway | Hubs (C1.3) |
| 8 | Pinyin and Arabic vowels | "Chinese text with pinyin", "Arabic text with harakat" | Small converters and browser extensions | **Medium**, for what Tinta really does | Tool pages (L2.4) |
| 9 | Pronunciation and idioms | "Spanish pronunciation guide", "Spanish idioms", "tener expressions", "Arabic alphabet for beginners" | FluentU, Lawless Spanish, Tell Me In Spanish, Clozemaster, universities | **Low** for es, fr and de; **medium** for ar and id | Pronunciation and expressions (C1.8, C1.9) |
| 10 | The ideas behind the stories | "saudade meaning", "what is mudik", "duzen oder siezen" | Dictionaries, encyclopedias, AI Overviews | **A bonus only**: AI answers take most of the clicks | The "About this story" section of each story page |
| 11 | The brand | "Tinta Reader", "tinta reader app" | E-ink readers, other apps called Tinta | **Must win.** T0.7, T0.11 and the listings in section 8 | Homepage, `/about`, `/mac` |

Leave out "comprehensible input" and other broad questions: AI Overviews answer them, and the sites that rank are research papers and big blogs.

What competitors' search traffic suggests:
- **Readlang** has one landing page per language (`/learn-spanish-by-reading`), each with starter stories. That's the model for the hubs. It charges about the same as Tinta Pro ($6 a month, or $48 a year).
- **Inklingo** shows that a small site can rank with plain HTML story libraries and a most-common-words page.
- **Dreaming Spanish** has a "by level" site that grades videos by how many of the most frequent words you need for 95% coverage. That's the idea behind Tinta's checker, which can apply it to any text.
- **Clozemaster** publishes thousands of thin, generated word pages. Don't copy that (see section 7).

---

## 3. Ground rules (every task)

1. **The privacy promise stays true.** No analytics scripts, cookies, pixels, embeds or third-party scripts on any page. The privacy policy says "no analytics, no tracking, no ads and no cookies", and this plan is built to keep that true. Any counting on the server needs James's yes and a line in the privacy policy (D4).
2. **Crawlers get the same HTML as people.** Never serve crawlers something a first-time visitor wouldn't get. No hidden text and no keyword blocks.
3. **Every indexable page has:**
   - a unique `<title>` and meta description
   - one visible `<h1>`
   - a self-referencing canonical
   - `lang` on `<html>`, plus `dir="rtl"` for Arabic
   - `lang` (and `dir`) on any passage in another language
   - an entry in the sitemap, and at least one link from another page
   - content you can read without JavaScript
4. **URLs** are lowercase ASCII with hyphens, with no trailing slash and no `.html`. A file at `x/y.html` is served at `/x/y`. A URL never changes once published; if it must, add a 301.
5. **Licences.**
   - `ranks.txt` and `learner.txt` are CC BY-SA 4.0. Any page or file that shows frequency ranks, or orders words by frequency, credits hermitdave/FrequencyWords and OpenSubtitles and says that content is CC BY-SA 4.0. The Mandarin and Arabic readings are CC BY-SA 4.0 too.
   - `lemmas.txt` is ODbL. Never publish it or anything derived from it, and never put ODbL and CC BY-SA data in the same published file.
   - The glosses, notes, stories and expressions are Tinta's own.
6. **Quality bar.** Every page must be worth reading even if search engines didn't exist.
   - Don't generate a page without real content behind it.
   - Don't make near-duplicates that only swap a language name.
   - AI may help draft. A fluent person reviews every language before it ships.
7. **Voice.** Follow the site's plain-language rules: what you get first, one idea a sentence, conditions last. Be concrete and calm, with no hype ("revolutionary", "unlock", "supercharge"). Spell as the site does today ("colour", "licence").
8. **Accessibility.** Headings in order. Real `<a href>` links for navigation, not buttons. Alt text on images, visible focus, AA contrast. Use `<details>` for show-and-hide, so it works without scripts.

---

## 4. Phase 0: technical foundations (weeks 1–2)

### T0.1 Put real content in the homepage HTML

**Problem:** item 3 in 1.3. **Goal:** a first-time visitor, Googlebot, Bingbot and an AI assistant fetching the page all get the same meaningful first screen, in the HTML.

1. Under the picker on the first-run screen ("What language are you learning?"), add a short block that every new visitor sees:
   - an `<h1>`, for example "Read in the language you're learning"
   - two or three sentences on what Tinta does ("Paste any text: an article, a story, a song. Every word is coloured by whether you know it. Tap one for its meaning.")
   - the eight languages: plain text now, links to the hubs once they exist (C1.3)
   - "Free, with no account. No ads, no tracking." and the Mac app
   - a footer: Tinta Pro, Pricing, Mac app, Support, Privacy, and later Stories, Tools and Guides

   [James] approves the copy. The language picker stays the main action, above the fold.
2. At build time, render that first-run screen, as a new English-speaking visitor would see it, to static HTML. Put it inside `<div id="root">` in `dist/index.html`.
   - A Vite plugin that calls `renderToString` from `react-dom/server` on the first-run component works.
   - If the component can't render outside the app, keep a static twin of it, with a test that fails when the two drift.
   - React replaces the markup on mount, so make it look identical to the first paint of the first-run screen. Otherwise the page jumps.
3. Don't flash it at the wrong people. Add a tiny, same-origin, synchronous `/boot.js` in `<head>`. The CSP allows `script-src 'self'`; add the file to the service worker's precache. It hides the static block and shows the "Starting…" line in two cases:
   - the app has set a `localStorage` flag (it sets one once a library exists), so this is a returning reader
   - `navigator.language` isn't English, so the app is about to draw the first run in another language

   A new English-speaking visitor, and Googlebot, get exactly the HTML in the file, so this isn't cloaking. The localized homes in Phase 2 (L2.1) give the other languages their own crawlable pages.
4. Move the "the application bundle failed to load" text out of the HTML. `/boot.js` shows it only if the app hasn't mounted after about 10 seconds.
5. Optional: test the title `Tinta Reader: learn a language by reading real texts` (52 characters). Keep the current description.

Acceptance:
- `curl -s https://tintareader.com/ | sed 's/<[^>]*>/ /g'` shows the `<h1>`, at least 120 words of description, the language names and the footer links, and not "failed to load".
- Search Console's URL Inspection ("View crawled page") shows the same content. After it ships, request indexing for `/`.
- A returning reader never sees the first-run block flash. Test in Chromium and WebKit, cold and warm, online and offline, with an English and a non-English browser.
- The first screen draws no slower than today's 1.3 s on a throttled phone.

**Alternative (D1):** move the reader to `/read` and make `/` a static landing page. It's cleaner for search, but it changes the installed app's `start_url`, breaks habits, and puts a click before reading. Not recommended now.

### T0.2 One URL per page

1. In `pages.ts`, `pro-page.ts` and the app, write every internal link in its final form: `https://tintareader.com/pricing`, not `/pricing.html`. Search the app source for `.html` links too, in Settings, Help and sign-in.
2. Add a self-referencing `<link rel="canonical">` to every indexable page.
3. Make `/x.html` → `/x` a **301 or 308**, not the default 307. Either add a `_redirects` entry for each page, or check in the Worker before `env.ASSETS.fetch`. Test it with `wrangler dev` first: it must not loop with `html_handling`.
4. Check each of these, and fix any that fail:
   - `http://` → `https://` (301)
   - `www.tintareader.com` → `tintareader.com` (301; add the DNS record and a redirect rule if missing)
   - `/pro/` → `/pro`
   - `/index.html` → `/`
5. `tintareader.github.io` must 301 to `https://tintareader.com/`, keeping the path. Keep the `CNAME` file and the custom domain in the GitHub Pages settings so that it does. Never remove the custom domain while Pages still publishes: the github.io copy would become a duplicate site.

Acceptance: the checks in Appendix A pass. A build test fails on any `href` to tintareader.com that ends in `.html`.

### T0.3 Complete the `<head>` of every static page

In `pages.ts`, give each page a `description`, and emit:
- the title, with the suffix `· Tinta Reader` instead of `· Tinta`
- a meta description, at most 155 characters
- a canonical
- `og:type`, `og:site_name` ("Tinta Reader"), `og:title`, `og:description`, `og:url`, `og:locale`
- `og:image`, with its width, height and alt text
- `twitter:card` (`summary_large_image`)

Suggested descriptions ([James] approves):

| Page | Description |
|---|---|
| Pricing | Reading with Tinta is free in every language, with no account. Tinta Pro, US$5.99 a month or US$47.99 a year, adds sync and much more Tinta AI. |
| Support | How to start reading, keep your words safe, use Tinta offline, install it as an app, and get help. For the web and the Mac app. |
| Privacy | Tinta has no analytics, no tracking, no ads and no cookies. What stays on your device, what a free account holds, and what Pro syncs. |
| Terms | The terms for using Tinta Reader, Tinta accounts, Tinta AI and Tinta Pro, in plain language. |
| Refunds | Cancel Tinta Pro any time. Any payment can be refunded in full within 14 days. Here's how. |
| Credits | The open data and open-source software Tinta Reader is built on, with their licences. |

On the Pro pages, add `twitter:card`, `og:site_name`, `og:image:width`, `og:image:height` and `og:image:alt`. Add `og:locale`, with `og:locale:alternate` for the other seven languages.

Acceptance: a build test checks that every indexable page has exactly one title, description and canonical, and fails on any duplicate title or description.

### T0.4 Keep the thank-you pages out of search

Add `<meta name="robots" content="noindex">` to `thanks.html` and `thanks-guest.html`. Keep them out of the sitemap.

### T0.5 Fix the visible Markdown links

The publish tool's Markdown converter turns URLs into links before it parses `[text](url)`, so the brackets survive. This shows in this build at:
- `pricing.html`, line 121
- `thanks.html`, line 107
- `thanks-guest.html`, line 108

Parse the links first, then link bare URLs. Add a test that fails if `](` appears in any generated HTML.

### T0.6 Keep raw data out of the index

In `_headers`, send `X-Robots-Tag: noindex` for:
- `/packs/*`
- `/licenses.json`, `/NOTICE` and `/NOTICE.txt`
- `/sw.js` and `/manifest.webmanifest`

Do the same on packs.tintareader.com for its `.txt` and `.json` files.

Don't `Disallow` these in robots.txt. A crawler can't see a `noindex` on a URL it isn't allowed to fetch, and rendering the app may need them.

### T0.7 Say who we are: structured data

Add JSON-LD to the homepage (templates in Appendix C):
- **`WebSite`**: `name` "Tinta Reader", `alternateName` ["Tinta"], `url`. Google uses this for the site name it shows in results.
- **`Organization`**: name, url, logo (`/icons/icon-512.png`), email, `founder` (James Moult). Add `sameAs` with the App Store listing, the GitHub profile and any social profiles.
- **`SoftwareApplication`**: `applicationCategory` "EducationalApplication", `operatingSystem` "Web browser, macOS", offers for Free and for Pro (monthly and yearly), `featureList`, `screenshot`.

Content pages get `Article` and `BreadcrumbList` (section 5). This markup helps search engines understand the site. Google has been retiring its education-specific rich results (Course Info and Learning Video went in June 2025), so don't build anything around them.

Never add `aggregateRating` or `review` unless real users rated the app on tintareader.com. Don't copy App Store ratings. JSON-LD is data, not a script, so the app's CSP doesn't block it.

Acceptance: Google's Rich Results Test and the schema.org validator both pass with no errors.

### T0.8 Build the sitemap from one page registry

1. Keep one registry of pages in the publish tool: `{ path, lang, title, description, alternates, lastmod, indexable, section }`. Generate the HTML, the sitemap and the hreflang from it, so they can't drift apart.
2. `lastmod` is the date the page's content last changed (hash its inputs), not the build date.
3. Once content pages exist, split the sitemap by section (`sitemap-pages.xml`, `sitemap-stories.xml`, `sitemap-words.xml`, `sitemap-tools.xml` …) under a sitemap index. Search Console then reports indexing for each section.

Acceptance: every sitemap URL returns 200 and has a matching canonical. Every indexable page is in exactly one sitemap. hreflang is reciprocal.

### T0.9 Search Console, Bing and IndexNow [James]

About 30 minutes, with no code:
1. **Google Search Console.** Add a domain property for `tintareader.com`, verified by a DNS TXT record in Cloudflare (no HTML tag needed), and submit the sitemap. Add `packs.tintareader.com` too, to catch indexed `.txt` files.
2. **Bing Webmaster Tools.** Import the setup from Search Console and submit the sitemap. Bing's index also powers DuckDuckGo and Yahoo, and is one of the sources behind ChatGPT search.
3. **Cloudflare.** Turn on Crawler Hints. It tells IndexNow search engines when pages change.
4. **The baseline.** Before Phase 0 ships, write down indexed pages, impressions, clicks and top queries (section 9).

### T0.10 Navigation that links the site together

- **Static pages:**
  - Add a small header nav: Languages, Stories, Tools, Pro, and "Open the reader".
  - Widen the footer: Tinta Pro, Mac app, Languages, Stories, Tools, Guides, About, Pricing, Support, Privacy, Terms, Refunds, Credits, Dictionaries.
  - Add each link only once its page exists.
- **The app:** link out to the content with real `<a href>` links, from Help and from the end-of-story "What next".
- **404:** link to the hubs, the stories and the tools, not just the reader.

### T0.11 One name: "Tinta Reader"

The name "Tinta" alone is taken many times over: other apps, a Mac dictation app, a Markdown viewer that owns the AlternativeTo slug. Use "Tinta Reader" in titles, `og:site_name`, JSON-LD, the App Store name, every directory listing and the PWA `name` (already right). Keep "Tinta" for the short name and the `alternateName`. [James] checks the App Store name. Rename the releases repo's README title to "Tinta Reader", and link it to tintareader.com and `/mac` (renaming the repo itself could break the updater: check first).

### T0.12 SEO checks in the build

Add a test that runs on the built site. It fails on:
- a missing or duplicate title, description or canonical
- no visible `<h1>`, or more than one
- a missing `lang`
- an internal `href` ending in `.html`
- a stray `](`
- a sitemap URL with no file behind it
- hreflang that isn't reciprocal
- JSON-LD that doesn't parse
- an indexable page no other page links to
- a page with more than 150 KB of HTML

Run Lighthouse (SEO and performance) in CI on `/`, `/pro`, and one page of each new type.

---

## 5. Phase 1: content that matches searches (weeks 2–8, in English)

### C1.0 A content generator

- Add `tools/publish/lib/content/` and call it from `site.ts`. Move the header, footer and CSS out of `pages.ts` into a shared layout. Content pages are static HTML that reads fine without JavaScript. Any script is a small enhancement on top.
- Read the data with the app's own parsers where they exist. For coverage and levels, reuse the code `stories.test.ts` uses. The formats:
  - `stories.txt`: `## n|level|place|key[|form]`, then the title, then the text. The notes are in `stories.<meta>.txt`: `## n`, then paragraphs, with `⟦…⟧` around the key word.
  - Starters: `@anchor`, `@known` or `@learn`, `@phrase`, `@translate` and `@form`, then a `## title` and the text of each part. The translations are in `<lang>.<meta>.txt`: `@note`, `@literal`, `@why`, then `sentence<TAB>translation` lines.
  - Expressions: `phrases.txt` (patterns, grouped by `# ----` comments), joined to `phrases.<meta>.txt` (`pattern|gloss`).
  - Pronunciation: `letters.txt` (`key|group|name|name_plain|rom|rom_plain|ipa|example|flags|sounds`), joined to `letters.<meta>.txt` (`key|context|note`).
  - `ranks.txt` (`word:rank|…`), `gloss.<meta>.txt` (`word|gloss|feats`), `learner.txt`.
- Page layout, top to bottom:
  - header nav, breadcrumb, `<h1>`, intro, body
  - a **"Read it in Tinta"** box (C1.1)
  - related links, the footer, and JSON-LD (`Article` plus `BreadcrumbList`)
- Mark the language of every passage: `<article lang="es">` around Spanish, and `lang="ar" dir="rtl"` around Arabic. Use `<ruby>` for pinyin wherever it's shown.
- Respect `prefers-color-scheme`: long reading wants a light option.

**URL scheme (English):**

```
/spanish                              hub
/spanish/stories                      story index
/spanish/stories/el-loro              starter
/spanish/stories/la-cena-a-las-diez   culture story
/spanish/most-common-words
/spanish/pronunciation
/spanish/expressions
/tools/text-difficulty
/compare/lingq-alternative
```

The same goes for `french`, `german`, `portuguese`, `indonesian`, `chinese` (for Mandarin) and `arabic`.
- Story slugs come from the title in its own language, folded to ASCII.
- Mandarin and Arabic stories get English slugs, from a hand-kept table in `tools/publish/lib/content/slugs.ts` (for example `/chinese/stories/the-parrot`, `/arabic/stories/another-cup`).
- Localized URLs are in Appendix D.

### C1.1 App deep links (every "Read it in Tinta" button needs these)

The app already reads `?pro=` and `?from=`, then removes them with `history.replaceState`. Add these, handled the same way:

| Parameter | What it does |
|---|---|
| `learn=<code>` | First run: preselect that language. A returning reader: switch to it if they read it, or offer to add it. |
| `story=starter`, `story=starter.2`, `story=<n>` | Open that story, in that language |
| `know=<N>` | Offer to mark the N most common words as Known (the app's "Know top N") |
| `from=<page-id>` | Where the visit came from. Remove it; count it only if D4 says yes |

The canonical of `/` stays `/`, so these URLs don't become duplicates.

To hand over a text (from the checker, the bookmarklet or a teacher), put it in the URL fragment: `/#t=<compressed text>`. Browsers never send the fragment to a server, so this keeps the privacy promise. The app reads it, opens the text, and clears the fragment. Cap its length (about 4,000 characters) and say so when a text is longer.

Test every combination: on first run, for a returning reader, offline, and in the Mac app, which should ignore them.

### C1.2 Story pages (32 English pages: 8 starters and 24 culture stories)

**Starters ("The parrot", part one).** This is the format people search for most: *a short story with an English translation*.
- The story, paragraph by paragraph. After each paragraph, `<details><summary>English</summary>…</details>` holds its sentence translations. A two-column parallel layout is fine on wide screens; stack it on phones.
- The "why" box on the hardest sentence (from `@literal` and `@why`), and the culture note (`@note`).
- **Mandarin:** pinyin over each word, as `<ruby>`, with a toggle. The readings are CC BY-SA 4.0, so credit them.
- **Arabic:** the voweled text from `readings.txt`, with a romanisation toggle.
- **"Read part two in Tinta".** Part two isn't on the page; it opens in the reader. That's the natural next step.
- Title pattern: `El loro: easy Spanish story with English translation | Tinta Reader`.

**Culture stories (3 per language).**
- The text, the place, and a level badge with a plain explanation: "Written for readers who know the 500 most common Spanish words. They'll know at least 9 in every 10 words of it."
- "Words you may not know": the story's words ranked beyond its level, with English glosses.
- An `<h2>`, "About this story: the sobremesa", followed by the note.
- Links to the previous and next stories, the hub, and "Read it in Tinta".
- Title pattern: `La cena a las diez: a beginner Spanish short story set in Spain | Tinta Reader`.
- These stories have no translation yet. Adding one is D3.

**The story index** (`/spanish/stories`) lists every story with its level, place and idea, then "More stories in the reader": Tinta AI writes stories at your level.

Acceptance:
- 32 story pages and 7 indexes.
- Every story has the right `lang`.
- A check confirms each page's text matches its source file exactly.
- James or a fluent reviewer signs off each language.
- Ship Spanish first, to settle the template. Then ship Indonesian, Portuguese and Arabic, where competition is weakest, and then the rest.

### C1.3 Language hubs (7 pages)

`/spanish`, `/french`, `/german`, `/portuguese`, `/indonesian`, `/chinese`, `/arabic`. The model is Readlang's per-language pages, made better with Tinta's stories and tools.

1. An `<h1>`, "Learn Spanish by reading", and two sentences on how Tinta helps.
2. The main button: **"Start reading Spanish: free, no sign-up"**, linking to `/?learn=es&from=hub-es`.
3. The first story (the starter), then the stories by level, as three cards.
4. Free resources: the difficulty checker, the most common words, pronunciation, expressions.
5. **"What Tinta does with Spanish".** These are the specifics for this language; check each one against the app before writing it. Examples:
   - Every verb form links to its infinitive: *tengo*, *tenía*, *tendremos* → *tener*.
   - 565 expressions are underlined where word-for-word misleads.
   - Mandarin is split into words, with pinyin over the new ones only.
   - Arabic words get their vowels, a romanisation and their root.
   - Indonesian words show how they're built from their affixes.
6. A short "How many words do you need?", linking to the guide (C1.10).
7. Three to five questions people actually ask. They're there for people, not rich results: Google only shows FAQ results for a few authoritative sites now.
8. Links to the other languages.

500 to 900 words each. Title pattern: `Learn Spanish by reading: a free Spanish reader | Tinta Reader`.

### C1.4 Text difficulty checker (the clearest gap found)

`/tools/text-difficulty`: paste a text, and see how hard it is for a learner.
- **The level of the text.** "To know 95% of the running words, you need the 2,400 most common Spanish words; for 98%, 4,100." This is Dreaming Spanish's "by level" idea, for any text in any of Tinta's languages. It's simple to compute: sort the ranks of the text's words and read off the 95% and 98% points.
- **Your fit.** Choose "I know the most common N words", or, if Tinta is already in use in this browser, use the reader's own Known words. The page is on the same origin, so it can read them locally, and nothing leaves the device. The result is the share of running words covered, with a plain verdict: comfortable (98% or more), a stretch (95–98%), or hard (below 95%).
- **The words to learn**: the unfamiliar words, with their glosses.
- **"Open this text in Tinta"**, through the `#t=` hand-over (C1.1).
- It runs in the browser with the app's own analyser, and loads only the language pack it needs. Say plainly: "Your text isn't uploaded anywhere."
- The static HTML explains coverage, the 95% and 98% research, and how learners and teachers use it, with an FAQ. The tool loads as a script on top.
- Add a page per language (`/tools/text-difficulty/spanish`) only if it has its own substance, such as a worked example on a real text or that language's coverage curve. Otherwise keep one page with a language picker.

Title: `Text difficulty checker for language learners | Tinta Reader`.

### C1.5 Most common words (7 pages to start)

`/spanish/most-common-words`: the 1,000 most frequent words, in rank order, with English glosses, in ten sections of 100 with anchor links. Build Indonesian, French, Portuguese and Arabic first.
- Above the table, briefly:
  - where the list comes from: film and TV subtitles, so it's spoken, everyday language
  - what it covers
  - how to use it: don't memorise lists; read, and mark the words as you meet them
- Give coverage figures ("the top 1,000 words make up about X% of everyday speech") only if they're computed with the app's own analyser over the frequency data. Never estimate them. Show the method in a footnote.
- The button: "Know some of these already? Start Tinta at your level" (`/?learn=es&know=1000&from=words-es`).
- Use the dictionary's headwords as they are. Some inflected forms have a rank of their own. Don't regroup them with `lemmas.txt`, which is ODbL.
- A licence note: ranks from hermitdave/FrequencyWords (OpenSubtitles), CC BY-SA 4.0; this list is CC BY-SA 4.0; the glosses are Tinta's.
- Later: words 1,001–2,000 and 2,001–5,000, and a CSV or Anki download (D2).
- For Mandarin, these are words, not characters. Don't claim HSK levels: we have no HSK data.

Title pattern: `The 1,000 most common Spanish words, with English meanings | Tinta Reader`.

### C1.6 Comparison pages [James approves each]

Build them in this order:
1. `/compare/lingq-alternative`
2. `/compare/readlang-alternative`
3. `/compare/lwt-and-lute`
4. `/compare/language-reactor`: it does subtitles and Tinta does texts, so they work together
5. a roundup, `/compare/reading-tools-for-language-learners`

Rules:
- Check every fact about another product on its own site within 30 days of publishing. Link the source, and show "Checked on <date>". Re-check every quarter.
- Say where the other tool is better. LingQ has many more languages and a big library; Readlang has a browser extension; Lute and LWT are free, open source and self-hosted. Include the free tools: the pages ranking now leave them out, and fair pages get linked from forums.
- The comparison table covers: free tier and price, languages, whether it works without an account, offline use, tracking, import formats, AI, Anki export, platforms.
- Don't use other products' names in Tinta's ads, app listing or keyword fields.

### C1.7 Product pages

- **`/mac`** [James: is the App Store listing live? Send its URL, screenshots and the minimum macOS]. It covers:
  - what the Mac app adds: its own window, keys in the Keychain, macOS voices, offline reading
  - that backups move between the web and the Mac
  - the App Store badge and link, plus the direct download until the App Store version is live
  - moving from the direct download to the App Store version
  - `SoftwareApplication` JSON-LD

  Link to it from every footer and wherever a page mentions the Mac app.
- **`/about`**: who makes Tinta (James Moult, in Tasmania) and why; the principles (reading first, no tracking, no streaks); how it's paid for (Pro); how to get in touch. Add `Person` and `Organization` JSON-LD. Assistants and journalists look for this page.
- **`/how-it-works`**:
  - how the colouring works, and how a level is measured
  - where the dictionaries come from: subtitle frequencies, lemma lists, Tinta's own glosses, hand-written expressions and stories
  - what the AI does and doesn't do
  - the licences

  Teachers and linguists link to pages like this.
- **`/changelog`** [James approves]: a monthly "What's new", in plain language. It keeps the site fresh, and feeds social posts and email.

### C1.8 Pronunciation guides (7 pages)

`/spanish/pronunciation`, built from `letters.txt` and `letters.en.txt`: the vowels, consonants and letter pairs. Each entry has its IPA, an example word with its gloss, and how it sounds to an English speaker, with notes by position ("between vowels", "at the end").
- Mandarin covers the pinyin initials, finals and tones, grouped as the table groups them.
- Arabic covers each letter, with its name and romanisation.

Publish only what the data holds; don't invent letter forms or rules. Search competition is heavy for Spanish, French and German, so these pages mainly complete the hubs. Arabic, Indonesian and Mandarin have more room.

Optional: a "Hear it" button using the browser's `speechSynthesis`, noting that the voice is the device's own. Title pattern: `Spanish pronunciation guide for English speakers | Tinta Reader`.

### C1.9 Expressions (7 pages)

`/spanish/expressions` lists every expression with its English meaning, grouped by the categories in `phrases.txt` (for example, "tener + noun: Spanish states where English uses *to be*"). Open by saying why these matter: the words alone mislead, and Tinta underlines them as you read.

Title pattern: `Spanish idioms and expressions: 565 phrases explained | Tinta Reader`. Give a category its own page only if Search Console shows demand for it.

### C1.10 Guides (written by people)

Start with five, each with a named author (James), a date and its sources:
1. **How to learn a language by reading.** The pillar page, linking to everything else.
2. **How many words do you need to read Spanish?** One per language. Use the coverage numbers from C1.5 and the research: Hu & Nation 2000; Nation 2006; Laufer & Ravenhorst-Kalovski 2010.
3. **Where to find free Spanish texts at your level.** Curated lists of sources. Pages like this get linked.
4. **Graded readers or real texts? When to switch.**
5. **Export your words to Anki.** A how-to that also helps support.

### C1.11 Release order

| Weeks | Ship |
|---|---|
| 2–3 | C1.0, C1.1. Spanish and Indonesian story pages and hubs: review them together before scaling |
| 3–5 | Stories and hubs for the other five languages; the difficulty checker (C1.4) |
| 5–6 | Word lists (id, fr, pt, ar, then es, de, zh); LingQ and Readlang comparisons; `/mac`; `/about` |
| 6–8 | Pronunciation; expressions; `/how-it-works`; the LWT and Lute comparison and the roundup; the first two guides |

Submit each sitemap section as it ships, and request indexing for each hub.

---

## 6. Phase 2: localize, and add tools (weeks 8–16)

### L2.1 Learners of English, in their own language

Order: **Indonesian, Portuguese (Brazil), Spanish**, then Mandarin, Arabic, French and German. For each language:

| Page | Indonesian example |
|---|---|
| Home in that language | `/id` |
| English hub | `/id/bahasa-inggris` |
| Starter, with the translation in that language | `/id/bahasa-inggris/cerita/the-parrot` |
| The 3 culture stories, with notes written for that reader | `/id/bahasa-inggris/cerita/at-the-bus-stop` and two more |
| Most common English words, glossed in that language | `/id/bahasa-inggris/kata-paling-umum` |
| English pronunciation for speakers of that language | `/id/bahasa-inggris/pengucapan` |
| English expressions, explained in that language | `/id/bahasa-inggris/ungkapan` |
| The difficulty checker | `/id/alat/tingkat-kesulitan-teks` |

- Arabic readers have English glosses, pronunciation notes and translations, but no expression glosses or story notes yet. Publish only what exists.
- hreflang joins only true equivalents:
  - the English hubs in each language (`/id/bahasa-inggris` ↔ `/pt/ingles` ↔ `/es/ingles` …)
  - the same story in each reader language
  - the homes (`/` ↔ `/id` ↔ `/pt` …)

  "Learn Spanish" in English and "learn English" in Spanish are different pages. Never join them.
- A fluent reviewer checks every localized page before it ships ([James]: budget, D5). The notes and translations already exist and were written for each reader. The frame around them (headings, intros, buttons) is new copy.
- Then the other pairs the data supports, such as Portuguese speakers learning Spanish or Indonesians learning Mandarin, in the order Search Console impressions suggest.

### L2.2 Vocabulary size test

`/tools/vocabulary-test/spanish`, and the same for each language: a yes/no checklist of about 60 to 100 words sampled across the frequency bands, plus a few made-up words to correct for guessing.
- The result: "You know about 3,200 Spanish words".
- A share card: an image made in the browser, with nothing uploaded (G3).
- "Start Tinta at this level", through the `know=` deep link.

The only results for this search today are academic tests and old forum threads. Size: medium to large.

### L2.3 Teachers page and class links

`/teachers` has:
- the difficulty checker, and how to use Tinta in class
- why it suits schools: students need no account, nothing is collected, and it works on Chromebooks and offline
- a one-page privacy sheet for school IT
- **"Open this text for the whole class"**, a `#t=` link (C1.1) a teacher can share
- a printable glossary for a story
- a contact for buying Pro for a class or school (D9)

Many school districts approve tools without paperwork when there are no student logins and no personal data, and Tinta's free tier has neither. Readlang's teacher deals reportedly stalled on exactly that approval step.

### L2.4 Tool pages for Mandarin and Arabic

`/tools/chinese-pinyin` ("read Chinese with pinyin over the words you don't know yet") and `/tools/arabic-vowels` (Arabic with its vowels and a romanisation): the same analyser, framed for what people search for. Only claim what the app actually does.

### L2.5 A story pipeline

Three stories per language is thin next to the sites that rank.
- Aim for 2 to 4 new stories per language each month, in the same style: a custom that surprises a visitor, three levels, and a note for each reader.
- AI may draft them, but a fluent person edits every one. The existing coverage test (`stories.test.ts`: at least 90% of running words at the stated level) must pass.
- New stories go into the pack, so the reader has them, and onto the site on the same day.

---

## 7. Phase 3: depth and authority (months 4–6 and on)

- **Language-specific guides**, from data few sites have:
  - Indonesian affixes (meN-, ber-, ter-, -kan, -i, ke-…-an), with real examples
  - Arabic roots, and the words built on them
  - Mandarin radicals and components
  - German separable verbs and compounds
  - Portuguese diminutives
- **More languages.** Choose them from the first-run "Ask for it" requests. Each new language adds a hub, stories, lists and guides. Italian is probably the cheapest high-demand addition: it's in a Latin script, and it's in the same open sources as the current packs.
- **Dictionary pages**, only under three conditions:
  - Phase 1 pages are getting impressions
  - they cover only the 1,000 to 2,000 most common words in each language
  - each page carries more than a gloss: the word's forms, its expressions, a sentence from a Tinta story, its frequency

  Never publish 130,000 thin pages. Google treats that as scaled content abuse, however the pages are made. Leave the long tail unpublished, or `noindex` it.
- **A dictionaries page on the main domain** (`/dictionaries`), linked from the packs.tintareader.com index, so its links count for tintareader.com.
- **Open data.** Publish the CC BY-SA frequency and learner lists as a public dataset, with a README that links to tintareader.com, and mark it up with `Dataset` JSON-LD. Lists of language-learning tools favour open projects, and researchers cite datasets (G7).
- **An Open Graph image per page**, generated at build time from `docs/brand/og-card.html` with the page's title.

---

## 8. Growth plan: users, beyond search

### 8.1 What we say

One line: **"Read anything in the language you're learning. Every word is coloured by whether you know it. Free, with no account and no tracking."**

The proof, in this order:
1. It works on any text you paste.
2. Tap a word for its meaning; misleading expressions are underlined.
3. Your level shows as you read: "27 of these 29 words you know."
4. It's free with no account, and nothing leaves your device.
5. It works offline, on the web and on the Mac.
6. Tinta AI writes stories at your level: one a month with a free account, every day with Pro.

Say what Tinta isn't, as the Pro page does: no speaking practice, no grammar lessons, no streaks. To people who learn by reading, that's part of the appeal.

**Win the learn-by-reading crowd first:** users of LingQ, Readlang, Lute and LWT, and followers of Dreaming Spanish and Refold. They already believe in the method. They only need to hear that a free, private, polished tool exists.

### 8.2 The first 90 days

| Weeks | Product and content | Distribution |
|---|---|---|
| 1–2 | Phase 0 | Set up GSC and Bing. List "Tinta Reader" on AlternativeTo and suggest it as an alternative to LingQ, Readlang, LWT, Lute and LinguaCafe. List it on SaaSHub. Fix the releases README. Confirm the App Store listing. Prepare a 60–90 s screen recording, 6 screenshots, and short and long descriptions |
| 3–5 | Stories and hubs; the difficulty checker | Post in r/languagelearning's "Share Your Resources" thread. Ask Refold to add Tinta to its tool library |
| 5–7 | Word lists, comparisons, `/mac`, `/about` | Show HN, with the checker as the hook. One useful post each in language subreddits (rules in 8.3). Email reviewers (8.5) |
| 7–10 | The "Read this page in Tinta" bookmarklet, then the extension (G1); the teachers page and class links | Chrome Web Store, Firefox Add-ons and Edge Add-ons listings. Teacher outreach (8.6) |
| 10–13 | Indonesian and Brazilian pages; share cards; a referral test | Indonesian and Brazilian creators; short demo videos; a price test in Brazil (D7) |

### 8.3 Communities

For every post:
- Post from James's own account, with a real comment history.
- Say "I made this" first, and link straight into the reader.
- Post only when something meaningful has changed.
- Answer every comment.
- Never ask for upvotes. Never use second accounts or "I found this great app" posts.

| Where | Size (approximate) | Rules | What to share |
|---|---|---|---|
| r/languagelearning | about 3.3M | Self-promotion only in the stickied "Share Your Resources" thread (every other Wednesday as of May 2025). Say it's yours. No reposts unless it's changed a lot. Comments used as ads are watched for | The reader, with the free, no-account, offline, no-tracking line |
| r/Spanish, r/learnspanish, r/French, r/German, r/Portuguese, r/ChineseLanguage, r/learn_arabic | about 80k to 490k each | Each sub differs; r/Spanish needs moderator approval first | A free resource for that language (a story, a word list, the checker), not an app pitch |
| r/indonesian | about 15k | Deletes AI-generated posts | The Indonesian affix explanations and stories, written by James |
| r/dreamingspanish | about 37k | Progress reports are the main post type | The checker: "what level is this text?" |
| r/Anki | about 198k | | Exporting your Known and Learning words to Anki |
| Refold Discord servers | Refold Central about 37k; per-language servers 7k to 18k | Tool channels; ask the moderators | The reader and the checker |
| Chinese-Forums | | Useful posts usually allowed | Reading Mandarin with pinyin over new words only |
| Hacker News, "Show HN" | | Must be usable without signing up, your own work, and you must be there to reply. New accounts may be restricted | The engineering: eight hand-built dictionaries, expression detection, offline web app, Tauri Mac app, no tracking |
| Product Hunt | | | Low effort only: the median launch gets a handful of upvotes |

Reddit hid member counts in September 2025; the sizes above are earlier snapshots.

### 8.4 Directories and listings

- **AlternativeTo: do it.**
  - List the app as "Tinta Reader"; the slug "tinta" belongs to an unrelated Markdown viewer.
  - Use "Suggest alternatives" on the LingQ, Readlang, LWT, Lute and LinguaCafe pages.
  - Like counts there are small (Readlang about 33, LingQ about 14), so a few genuine likes from real users move it up.
- **Refold's tool library:** ask to be added. It rates tools by price and difficulty, and "free, easy" is a strong place to be.
- **awesome-language-learning on GitHub** (Vuizur, about 220 stars): it has a "Learning With Texts (LingQ-like)" section. It favours open source, so open the pull request after the open-data release (G7).
- **SaaSHub:** free, and a verified listing gives a link.
- **All Language Resources:** an independent review site. Email them for a review.
- **The releases repo:** the README links to tintareader.com, `/mac` and the App Store.
- **Microsoft Store:** now free for individual developers, and it accepts web apps. Package the web app (with PWABuilder, for example).
- **Google Play** (as a web app wrapper, or through D8): new personal accounts must first run a 14-day closed test with 12 testers. Start that early.
- **Skip:** There's An AI For That (paid, and the wrong audience), Setapp (it bans in-app purchases, which doesn't fit AI with per-use costs), paid directories and link schemes.

### 8.5 Creators and reviewers

**The offer:** a free year of Pro and a request for an honest review, with no script. For creators who want more, a discount code that pays a commission. Use codes, not tracking links or cookies, to keep the privacy promise ([James]: check what Dodo Payments supports, D12). LingQ pays affiliates 20% for as long as the customer stays, so expect creators to ask.

**Who:**
- **Reviewers of reading tools:** Mezzofanti Guild (Donovan Nagel), All Language Resources, Refold (blog and YouTube), the makers of Lute's tutorial videos, Languages with Tom, Tara Cull (ArchiEnglish), Bem Poliglota (in Portuguese).
- **Mandarin:** Hacking Chinese (Olle Linge).
- **Brazil:** English in Brazil (Carina Fragozo, about 2M subscribers); Mairo Vergara, who teaches an input-first method.
- **Indonesia:** @englishfess_ on X (about 900k followers in 2024); creators under #samasamabelajar on TikTok.

**How:** a personal email from James, five lines long, linking to a page relevant to their audience. One reminder at most.

### 8.6 Teachers

- **Why Tinta fits:** many schools approve tools freely when there are no student logins and no personal data, and Tinta's free tier has neither.
- **What they need:** the teachers page (L2.3), with the privacy sheet, class links, the difficulty checker and printable glossaries.
- **Where to reach them:**
  - FLTMag, a magazine for language teachers, which has reviewed Readlang
  - comprehensible-input teacher communities, such as iFLT and its Facebook groups
- **The offer:** free Pro for teachers, in return for feedback and a link from the class or school site (D9).

### 8.7 Product loops (growth engineering)

- **G1. "Read this page in Tinta".** Start with a bookmarklet, then a browser extension for Chrome, Firefox and Edge, and Safari later.
  - It pulls the article text out in the browser, Readability-style, and opens it in Tinta through `#t=`. No server is involved.
  - This channel has the strongest evidence: Language Reactor's extension has about 2M Chrome users, and Readlang's about 100k.
  - The store listings are search surfaces in their own right.
- **G2. Share a text.** The same `#t=` links, offered from the reader: send a text to a friend or a class.
- **G3. Share cards.** "I know 2,340 Spanish words", as an image made on the device from the reader's own counts. The reader shares it themselves, and it carries tintareader.com. Progress posts are the most common post type in r/dreamingspanish.
- **G4. Referrals.** "Give a month, get a month" of Pro, through codes ([James]: Dodo support).
- **G5. Ratings on the Mac.** Apple's rating prompt, after a success such as finishing a text. Apple allows it at most three times a year. Reply to every low-star review.
- **G6. An opt-in newsletter.** A box at sign-in, unticked by default: "Send me new stories once a month." Then a monthly email with the new stories and what's new. Update the privacy policy, and write only to people who opted in.
- **G7. Open data.** Release the CC BY-SA frequency and learner lists, and possibly the Indonesian affix data, in a public repo that links to tintareader.com ([James]: which data).
- **Skip:** embeddable widgets, since the site sends `X-Frame-Options: DENY` and there's no evidence they work, and student discounts, since there's no way to verify students and everyone is a learner.

### 8.8 App stores

**Mac App Store** ([James]: confirm the listing is live). Apple's limits: name and subtitle 30 characters each; keywords 100 characters, separated by commas with no spaces; promotional text 170 characters (it doesn't affect search).
- **Name:** "Tinta Reader".
- **Subtitle:** something like "Learn languages by reading".
- **Keywords:** don't repeat words that are already in the name or subtitle, don't add plurals, and never use competitors' names, which risks rejection.
- **Localize** the name, subtitle, keywords and description into all 8 interface languages.
- **Screenshots** (up to 10, 16:10, from 1280×800 to 2880×1800): the first one shows a coloured text with the word card open.
- **Ratings:** the prompt after a success (G5).
- **Featuring:** nominate the app in App Store Connect (macOS is an option) for a meaningful release, such as a new language, with at least 2–3 weeks' notice.
- **China:** Apple has removed AI-generation apps without a Chinese licence from the China storefront. Either leave that storefront out or turn Tinta AI off there (D11).

**iOS, iPadOS and Android (D8).** Tauri 2 can build them from the same code as the Mac app. App stores are where people look for a "language reading app", so this is a big discovery channel. Remember Google Play's closed-test requirement (8.4).

### 8.9 Markets

- **Indonesia first.**
  - Tinta already prices in rupiah.
  - Indonesia ranks 80th on EF's English Proficiency Index (2025, "low" band), so the demand for English is big.
  - TikTok is the most-used social platform there. Learners gather around #samasamabelajar and accounts like @englishfess_.
  - Search competition for Indonesian learner pages is weak.
- **Brazil.**
  - EF EPI rank 75.
  - In a 2014 British Council survey, only about 5% of people aged 16 and over said they knew some English.
  - Portuguese-language English-teaching channels on YouTube are huge.
  - Test a price in reais when the Portuguese pages ship (D7).
- **Spanish-speaking countries:** large, with moderate competition.
- **China:** an estimated 200 to 400 million learners of English. But Google and most Western platforms are blocked on the mainland, and reaching people on Xiaohongshu and Bilibili is a project of its own. Leave it for later, apart from the zh pages, which serve Taiwan, Hong Kong, Singapore, Malaysia and Chinese speakers abroad.
- **Arabic:** market data is thin, and search competition for Arabic-language English learning is weak. Reader material for Arabic speakers is partial (no expression glosses or story notes yet).

### 8.10 What not to do

- Buy links, reviews or upvotes; use second accounts; or post the same link across many subreddits in one day.
- Publish thousands of thin pages, however they're made.
- Add affiliate cookies, pixels or tracking links. Use codes instead.
- Put competitors' names in App Store keywords or in ads.
- Overclaim: every number on a page (levels, coverage, counts) is computed, not guessed.

---

## 9. Measurement

### 9.1 Tools that need no scripts on the site

| Tool | What it tells us |
|---|---|
| Google Search Console | Queries, impressions, clicks and position for each page; indexing per sitemap section; Core Web Vitals. The new generative-AI reports, where available, count impressions in AI features |
| Bing Webmaster Tools | The same for Bing and the engines it powers; backlinks |
| Cloudflare (server side) | Requests per path, and referrers, seen at the edge, with no client script |
| Supabase | Accounts created per day, and AI use (already counted for the allowances) |
| Dodo Payments | Pro checkouts, by plan and country |
| App Store Connect | Product page views, downloads, conversion, and the source (search, browse, web referrer) |

**D4: count arrivals from content pages.** A content page's "Read it in Tinta" link carries `from=<page-id>`. The Worker could add one to a counter for that page id in Workers Analytics Engine. It would keep no IP address, no user agent and no identifier, and store nothing in the browser. That's the only way to know which pages bring readers. It is still counting, so it needs James's yes and a sentence in the privacy policy. Without it, fall back on Search Console clicks per page, plus total accounts.

### 9.2 What to watch

| Stage | Metric | Source | Checkpoint |
|---|---|---|---|
| Health | Indexed ÷ submitted pages, per sitemap section | GSC | Over 90% for Phase 0 pages within 4 weeks |
| Brand | "Tinta Reader" searches find tintareader.com first, with the right site name | GSC and manual checks | Within 6 weeks of T0.7 and T0.11 |
| Visibility | Non-brand impressions per week | GSC | Rising week on week from week 4 |
| Visibility | Share of content pages with at least one click a month | GSC | At least half by month 4 |
| Traffic | Non-brand clicks per week, by section | GSC | Set targets once the baseline exists |
| Authority | Referring domains | Bing WMT, GSC Links | 10 or more new each month from the section 8 work |
| Product | First runs from content (D4); accounts created per week | Worker, Supabase | Compare with clicks |
| Revenue | Pro checkouts per week, by country | Dodo | |
| Mac | App Store product page views, then downloads | App Store Connect | |

Write the baseline down before T0.1 ships, so that every later number has something to compare with.

### 9.3 Rhythm

- **Weekly, for the first 8 weeks** (15 minutes): indexing errors in GSC, new queries, pages losing ground.
- **Monthly**:
  - What's working, by page type? Make more of the types that get impressions.
  - Rewrite the titles and descriptions of pages that get impressions but few clicks.
  - Improve or merge pages that have had no impressions for 3 months.
- **Quarterly**: re-check the comparison facts; refresh the "where to find texts" links; review the order of languages and markets.

---

## 10. Decisions for James

| # | Decision | Recommendation |
|---|---|---|
| D1 | Homepage: put the first-run screen in the HTML (T0.1), or move the reader to `/read` and make `/` a landing page? | T0.1. Keep `/` as the reader |
| D2 | Publish the top 1,000 to 2,000 glosses per language on word-list pages? Offer CSV or Anki downloads? | Yes to the pages: the packs are already public. Downloads later, with the glosses' licence stated |
| D3 | Add translations of the 24 culture stories? (Only the starters have them.) | Yes, collapsed under each paragraph. "With English translation" is the biggest modifier in story searches |
| D4 | Count `from=` arrivals on the server, anonymously, with a line in the privacy policy? | Yes. It's the only way to know which content brings readers |
| D5 | Budget for fluent reviewers of localized pages and new stories? | Yes, Indonesian and Brazilian Portuguese first |
| D6 | Which markets first for learners of English? | Indonesia, Brazil, then Spanish-speaking countries |
| D7 | Regional prices beyond Indonesia, starting with Brazil? | Test it when the Portuguese pages ship |
| D8 | iOS and Android apps, which Tauri 2 can build from the Mac app's code, for app-store discovery? | Yes, after Phase 1 |
| D9 | Free Pro for teachers and their classes? | Yes, in exchange for feedback and a link from the school's site |
| D10 | Approve the copy: homepage block, descriptions, comparisons, About | — |
| D11 | The Mac App Store's China storefront | Leave it out, or turn Tinta AI off there |
| D12 | Creator commissions through discount codes (no tracking links)? | Yes, if Dodo supports it |
| D13 | Open data: release the frequency and learner lists, and possibly the Indonesian affix data? | Yes for the CC BY-SA lists, which are already open-licensed |

---

## Appendix A. Live checks (after each deploy)

```sh
# Each line: URL, status, and where it redirects.
for u in \
  https://tintareader.com/ \
  https://tintareader.com/index.html \
  https://tintareader.com/pricing \
  https://tintareader.com/pricing.html \
  https://tintareader.com/pro \
  https://tintareader.com/pro/ \
  https://tintareader.com/es/pro \
  https://www.tintareader.com/ \
  http://tintareader.com/ \
  https://tintareader.github.io/ \
  https://tintareader.github.io/pricing.html \
  https://tintareader.com/thanks \
  https://tintareader.com/no-such-page \
  https://tintareader.com/packs/es/gloss.en.txt ; do
  printf '%-48s ' "$u"
  curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "$u"
done
```

What to expect:

| URL | Expected |
|---|---|
| `/` | 200 |
| `/index.html` | 301 or 308 → `/` |
| `/pricing` | 200 |
| `/pricing.html` | 301 or 308 → `/pricing` |
| `/pro` | 200 |
| `/pro/` | 301 or 308 → `/pro` |
| `/es/pro` | 200 |
| `www.tintareader.com` | 301 → the apex |
| `http://` | 301 → `https://` |
| `tintareader.github.io` | 301 → tintareader.com, keeping the path |
| `/thanks` | 200, carrying a `noindex` |
| `/no-such-page` | **404**. A 200 here would be a soft 404 |
| the pack file | 200, with `X-Robots-Tag: noindex` |

```sh
# Headers that matter
curl -sI https://tintareader.com/packs/es/gloss.en.txt | grep -i x-robots-tag   # noindex
curl -s https://tintareader.com/thanks | grep -i 'name="robots"'                 # noindex
# What a crawler that doesn't run JavaScript sees on the homepage
curl -s https://tintareader.com/ | sed 's/<[^>]*>/ /g' | tr -s ' \n' | head -c 1500
# Every page in the sitemap answers 200
curl -s https://tintareader.com/sitemap.xml | grep -o '<loc>[^<]*' | cut -c6- | \
  while read u; do printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$u")" "$u"; done
```

## Appendix B. Titles and descriptions

**Titles:**
- Put the words people search for first.
- Keep them to about 60 characters before ` | Tinta Reader` (results may cut the suffix off).
- Make every title unique.

**Descriptions:** 120 to 155 characters. Say what the page gives, in the site's voice.

| Page type | Title | Description |
|---|---|---|
| Hub | Learn {Language} by reading: a free {Language} reader | Read real {Language} texts with every word coloured by whether you know it. Tap a word for its meaning. Free stories, word lists and tools. |
| Starter | {Title}: easy {Language} story with English translation | A first {Language} story, sentence by sentence, with an English translation under each paragraph and a note on the hardest line. |
| Culture story | {Title}: a {level} {Language} short story set in {Place} | A short {Language} story for {level} readers. Then find out what {idea} means, and why it surprises visitors. |
| Story index | Easy {Language} short stories for beginners and intermediate readers | Short {Language} stories at three levels, each set where {Language} is spoken, with notes on the customs they turn on. |
| Words | The 1,000 most common {Language} words, with English meanings | The {Language} words you'll meet most, in order, with their meanings. From film and TV subtitles, so it's the language people speak. |
| Checker | {Language} text difficulty checker: how much will you know? | Paste a {Language} text and see what level it is, how much of it you'll know, and which words to learn first. Nothing is uploaded. |
| Pronunciation | {Language} pronunciation guide for English speakers | How each {Language} letter and letter pair sounds, compared with English words, with the exceptions that catch learners out. |
| Expressions | {Language} idioms and expressions: {N} phrases explained | {Language} expressions where the words alone mislead, with what they really mean. Grouped so the patterns are easy to see. |
| Comparison | A free {Product} alternative: Tinta Reader compared | How Tinta Reader and {Product} differ on price, languages, privacy and offline use, and who each one suits. Checked {Month Year}. |

## Appendix C. JSON-LD templates

**Homepage.** One `<script type="application/ld+json">` holds all three:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://tintareader.com/#website",
      "name": "Tinta Reader",
      "alternateName": ["Tinta"],
      "url": "https://tintareader.com/",
      "inLanguage": "en",
      "publisher": { "@id": "https://tintareader.com/#org" }
    },
    {
      "@type": "Organization",
      "@id": "https://tintareader.com/#org",
      "name": "Tinta Reader",
      "url": "https://tintareader.com/",
      "logo": "https://tintareader.com/icons/icon-512.png",
      "email": "hello@tintareader.com",
      "founder": { "@type": "Person", "name": "James Moult" },
      "sameAs": ["<App Store URL>", "<GitHub URL>", "<social profile URLs>"]
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://tintareader.com/#app",
      "name": "Tinta Reader",
      "url": "https://tintareader.com/",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web browser, macOS",
      "description": "Paste a text in the language you're learning and see which words you know. Tap any word for its meaning.",
      "image": "https://tintareader.com/og.png",
      "publisher": { "@id": "https://tintareader.com/#org" },
      "offers": [
        { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "USD" },
        { "@type": "Offer", "name": "Tinta Pro, monthly",
          "priceSpecification": { "@type": "UnitPriceSpecification", "price": "5.99", "priceCurrency": "USD",
            "referenceQuantity": { "@type": "QuantitativeValue", "value": 1, "unitCode": "MON" } } },
        { "@type": "Offer", "name": "Tinta Pro, yearly",
          "priceSpecification": { "@type": "UnitPriceSpecification", "price": "47.99", "priceCurrency": "USD",
            "referenceQuantity": { "@type": "QuantitativeValue", "value": 1, "unitCode": "ANN" } } }
      ]
    }
  ]
}
```

**Story page:**

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "La cena a las diez",
      "inLanguage": "es",
      "about": "Sobremesa",
      "educationalLevel": "Beginner: the 500 most common Spanish words",
      "isAccessibleForFree": true,
      "author": { "@type": "Person", "name": "James Moult" },
      "publisher": { "@id": "https://tintareader.com/#org" },
      "datePublished": "<YYYY-MM-DD>",
      "dateModified": "<YYYY-MM-DD>",
      "mainEntityOfPage": "https://tintareader.com/spanish/stories/la-cena-a-las-diez"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Spanish", "item": "https://tintareader.com/spanish" },
        { "@type": "ListItem", "position": 2, "name": "Stories", "item": "https://tintareader.com/spanish/stories" },
        { "@type": "ListItem", "position": 3, "name": "La cena a las diez" }
      ]
    }
  ]
}
```

Set `author` to whoever wrote the story.

## Appendix D. Slugs for localized pages

Language names are ASCII, with no accents. Pages in Mandarin and Arabic use English slugs.

| Interface ↓ \ Learning → | English | Spanish | French | German | Portuguese | Indonesian | Mandarin | Arabic |
|---|---|---|---|---|---|---|---|---|
| en (root) | — | spanish | french | german | portuguese | indonesian | chinese | arabic |
| es `/es/` | ingles | — | frances | aleman | portugues | indonesio | chino | arabe |
| pt `/pt/` | ingles | espanhol | frances | alemao | — | indonesio | chines | arabe |
| fr `/fr/` | anglais | espagnol | — | allemand | portugais | indonesien | chinois | arabe |
| de `/de/` | englisch | — | — | — | — | — | — | — |
| id `/id/` | bahasa-inggris | bahasa-spanyol | bahasa-prancis | bahasa-jerman | bahasa-portugis | — | bahasa-mandarin | bahasa-arab |
| zh `/zh/` | english | spanish | french | german | portuguese | indonesian | — | arabic |
| ar `/ar/` | english | — | — | — | — | — | — | — |

A dash means the packs have no reader material for that pair today. German and Arabic readers have material only for English.

Section names:

| Interface | Stories | Most common words | Pronunciation | Expressions | Tools |
|---|---|---|---|---|---|
| en | stories | most-common-words | pronunciation | expressions | tools |
| es | historias | palabras-mas-comunes | pronunciacion | expresiones | herramientas |
| pt | historias | palavras-mais-comuns | pronuncia | expressoes | ferramentas |
| fr | histoires | mots-les-plus-courants | prononciation | expressions | outils |
| de | geschichten | haeufigste-woerter | aussprache | redewendungen | werkzeuge |
| id | cerita | kata-paling-umum | pengucapan | ungkapan | alat |
| zh, ar | stories | most-common-words | pronunciation | expressions | tools |

## Appendix E. Before publishing any content page

- [ ] It answers a real question better than what ranks for it now (look at the results first).
- [ ] Its facts are checked against the app and the data, and nothing is invented (levels, coverage numbers, HSK, CEFR).
- [ ] Someone fluent in the page's language has read it.
- [ ] Its title, description, `<h1>`, canonical, `lang` and `dir`, breadcrumb and JSON-LD are present and unique.
- [ ] It links to its hub and to two or three related pages, and its hub links back.
- [ ] "Read it in Tinta" opens the right language and story.
- [ ] Licence credits show wherever ranks or readings appear.
- [ ] It reads well on a phone, without JavaScript, in light and dark.
- [ ] It's in the right sitemap section, with a true `lastmod`.

## Sources

Checked 16 October 2026. Sources marked † are secondary: treat their figures as approximate.

**Search engines and hosting**
- Cloudflare, static assets HTML handling (default `auto-trailing-slash`: `/file.html` answers 307 to `/file`): https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/
- Google, JavaScript SEO basics (static or server rendering preferred; dynamic rendering is a workaround): https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Google, AI features and your website: https://developers.google.com/search/docs/appearance/ai-features
- Google, spam policies (scaled content abuse): https://developers.google.com/search/docs/essentials/spam-policies
- Google, localized versions (hreflang): https://developers.google.com/search/docs/specialty/international/localized-versions
- Google, simplifying search results (Course Info and Learning Video dropped, June 2025): https://developers.google.com/search/blog/2025/06/simplifying-search-results
- Google, generative-AI performance reports in Search Console: https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports
- Pew Research Center, clicks when an AI summary appears (July 2025): https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/
- Vercel, AI crawlers don't run JavaScript: https://vercel.com/blog/the-rise-of-the-ai-crawler

**Apple**
- Product page limits: https://developer.apple.com/app-store/product-page/
- Search: https://developer.apple.com/app-store/search/
- Ratings and reviews: https://developer.apple.com/app-store/ratings-and-reviews/
- Featuring nominations: https://developer.apple.com/help/app-store-connect/manage-featuring-nominations/nominate-your-app-for-featuring/
- Generative AI apps pulled from the China App Store (2023)†: https://techcrunch.com/2023/08/01/generative-ai-services-pulled-from-apple-app-store-in-china-ahead-of-new-regulations

**Communities and directories**
- r/languagelearning, rules for promotion†: https://www.reddit.com/r/languagelearning/wiki/rules_for_promotion/
- Show HN guidelines: https://news.ycombinator.com/showhn.html
- AlternativeTo FAQ: https://alternativeto.net/faq
- Refold tool library†: https://prod.refold.la/learning-libraries/tool-library
- awesome-language-learning: https://github.com/Vuizur/awesome-language-learning
- Google Play testing requirement for new personal accounts: https://support.google.com/googleplay/android-developer/answer/14151465

**Competitors and teachers**
- Readlang per-language pages, for example: https://readlang.com/learn-spanish-by-reading
- Dreaming Spanish, by level: https://bylevel.dreamingspanish.com
- Readlang forum, on its teacher deals†: https://forum.readlang.com/t/how-to-encourage-my-english-students-to-use-readlang-every-day/4591
- School approval without logins, example†: https://www.centralislip.k12.ny.us/fs/pages/3327

**Markets**
- EF English Proficiency Index 2025: https://www.ef.com/wwen/epi/
- British Council, learning English in Brazil: https://www.britishcouncil.org.br/sites/default/files/learning_english_in_brazil.pdf
