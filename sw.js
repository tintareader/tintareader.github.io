/**
 * The service worker: what lets tintareader.com open with no network.
 *
 * Not a module of the app. `vite.config.ts` reads this file after a build,
 * replaces `__BUILD__` with the build's version and file list, and writes it
 * to `dist/sw.js`; `offline.ts` registers it, and only in a browser, only in a
 * production build, only over https or on localhost. Nothing imports it.
 *
 * **Online, it stays out of the way.** The rule it is built around is that a
 * reader who has a network sees exactly what they would see without it:
 * the page and the packs' manifests come from the server, and the worker only
 * keeps a copy. Its value is the other case — a train, a plane, a phone on the
 * Home Screen opened in a lift — where it serves the copy instead.
 *
 * Four kinds of request, four policies:
 *
 * - **The page** (`/`, `/index.html`) is network-first, and waits on the
 *   network for `NAV_TIMEOUT_MS` at most before it falls back. It is fetched
 *   `no-cache`, past the browser's HTTP cache: GitHub Pages says `max-age=600`,
 *   and a page kept from before a deploy names assets the server no longer
 *   has, so a fresh open within ten minutes of a deploy booted into 404s. A
 *   page is stored as the offline copy only when every asset it names is in
 *   this build's shell, so the stored page can always boot from the store.
 *   Other pages the site serves (privacy, support) are left to the browser:
 *   offline, the app's page is not an answer to them.
 * - **`/assets/`** is cache-first. Vite names every file there by the hash of
 *   its contents, so a stored copy cannot be stale, only unused.
 * - **A pack's manifest** (`/packs/<id>/pack.json`) is network-first, but
 *   waits `PACK_TIMEOUT_MS` at most before it falls back — and **a pack's data
 *   files are cache-first, keyed by the sha256 the manifest gives them**.
 * - **Everything else** — the manifest, the icons — is network-first with the
 *   stored copy as the fallback.
 *
 * **Why packs are keyed by digest.** A pack is the one thing here that changes
 * under an unchanged URL: `/packs/es/lex.txt` in one build and the next are
 * different files. The first version of this worker answered that by going to
 * the network for every pack file, every time — correct, and on a phone that
 * had evicted its HTTP cache it re-downloaded 590 KB of Spanish that was
 * sitting in the store, 38 seconds on a poor link. The manifest already names
 * every file's digest, so the worker reads the manifest the page is given and
 * serves each data file stored under that digest. A new build's manifest names
 * new digests, which miss, which fetch: new code never gets an old dictionary
 * while there is a network, and an unchanged file is never fetched twice. A
 * file is stored only if its content hashes to the digest the manifest names,
 * so a deploy landing between the manifest and a file cannot store a mix.
 * Storing a new copy of a file deletes every other copy of it.
 *
 * **When the manifest is served from the store**, because the network was too
 * slow, a late network answer is thrown away rather than stored: storing it
 * would make the worker key the page's next file requests by a manifest the
 * page never saw.
 *
 * **A page served from the store is served from the store throughout.** When
 * the network is merely slow and the page times out onto the stored copy,
 * waiting on the same network for each manifest would stall the boot the
 * fallback was meant to rescue, and could load packs from a newer build under
 * an older page. So the client a stored page opens in is remembered, and every
 * request it makes is cache-first. That memory is the worker's own and goes if
 * the browser stops the worker; what that costs now is at most
 * `PACK_TIMEOUT_MS` per manifest, since data files are cache-first anyway.
 *
 * **Two stores.** The shell lives in a store named for the build and is
 * deleted with it, since hashed assets from an old build are dead weight. The
 * packs live in one store that outlives builds, because a reader who studies
 * Spanish should still have Spanish offline the day after a deploy, before
 * they have opened it online again. A language is stored when it is first
 * loaded online; the worker does not fetch six languages nobody asked for.
 * On the very first visit the language loads before the worker exists, so
 * `offline.ts` sends the pack files the page already fetched, and they are
 * stored then (`message` below).
 *
 * **Cross-origin requests pass through untouched**: the pack update check
 * (`packs.tintareader.com`) and the AI providers answer to their own caching
 * and fail as they already do offline.
 */

/* global self, caches, fetch, Request, Response, URL, TextEncoder, crypto */

/** Replaced at build time: `{ version: string, precache: string[] }`. */
const BUILD = {"version":"d1e92376c59b","precache":["/assets/index-BMT-MemX.js","/assets/index-BWfu3haE.css","/favicon.ico","/icon.svg","/icons/apple-touch-icon.png","/icons/icon-192.png","/index.html","/manifest.webmanifest"]};

const PREFIX = "tinta-";
const SHELL = `${PREFIX}shell-${BUILD.version}`;
const DATA = `${PREFIX}data`;
const PAGE = "/index.html";
const NAV_TIMEOUT_MS = 4000;
const PACK_TIMEOUT_MS = 3000;
const PRECACHED = new Set(BUILD.precache);

/**
 * `ignoreVary`, because a stored copy is keyed by the request that stored it.
 * The shell is stored by `install` with plain requests; the page asks for its
 * module script with an `Origin` header, and a server that says
 * `Vary: Origin` (vite preview does) turns every one of those into a miss —
 * found by the offline smoke, as an app that would not boot without a network.
 * Nothing here is stored per origin, so the header never matters.
 */
const MATCH = { ignoreVary: true };

/** Clients whose page came from the store: they are offline, or near enough. */
const offlineClients = new Set();

/** Each pack's file digests, `path -> sha256`, from the manifest last stored. */
const manifests = new Map();

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      // `reload` skips the HTTP cache, so a shell stored now is the one the
      // server has now, not one the browser kept from an earlier build. Only
      // for names without a hash: a hashed asset in the HTTP cache cannot be
      // stale, and it is usually there — the page just loaded it — so asking
      // the network again doubled the first visit's download.
      await cache.addAll(
        BUILD.precache.map((p) => new Request(p, p.startsWith("/assets/") ? {} : { cache: "reload" })),
      );
      // A waiting worker would keep the old build's shell as the offline page
      // until every tab closed, which on a phone is roughly never.
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith(PREFIX) && key !== SHELL && key !== DATA) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

/**
 * `{ keep: [url, …] }` from `offline.ts`: pack files the page fetched before
 * this worker controlled it. Anything else in the list is ignored, and a file
 * that cannot be fetched is skipped rather than failing the rest. Manifests
 * first, since a data file is stored under the digest its manifest names.
 */
self.addEventListener("message", (event) => {
  const urls = event.data && Array.isArray(event.data.keep) ? event.data.keep : [];
  const packs = urls
    .map((u) => {
      try {
        return new URL(u);
      } catch {
        return null;
      }
    })
    .filter((u) => u && u.origin === self.location.origin && packPath(u.pathname));
  if (!packs.length) return;
  const manifestsFirst = packs.filter((u) => packPath(u.pathname).file === "pack.json");
  const files = packs.filter((u) => packPath(u.pathname).file !== "pack.json");
  event.waitUntil(
    (async () => {
      const cache = await caches.open(DATA);
      await Promise.all(
        manifestsFirst.map(async (u) => {
          try {
            const res = await fetch(u.href);
            if (!res.ok) return;
            const text = await res.text();
            if (remember(packPath(u.pathname).id, text)) await cache.put(u.href, textResponse(text, res));
          } catch {
            // Skipped: the next online load stores it.
          }
        }),
      );
      await Promise.all(
        files.map(async (u) => {
          const { id, file } = packPath(u.pathname);
          const sha = (await manifestFor(cache, id))?.get(file);
          if (!sha) return;
          try {
            const res = await fetch(u.href);
            if (res.ok) await storeFile(cache, u, sha, res);
          } catch {
            // As above.
          }
        }),
      );
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js") return;

  if (req.mode === "navigate") {
    if (url.pathname !== "/" && url.pathname !== PAGE) return;
    event.respondWith(page(event, url));
    return;
  }
  const pack = packPath(url.pathname);
  if (pack) {
    event.respondWith(pack.file === "pack.json" ? packManifest(event, pack.id) : packFile(event, url, pack));
    return;
  }
  if (url.pathname.startsWith("/assets/") || offlineClients.has(event.clientId)) {
    event.respondWith(cacheFirst(event, SHELL));
  } else {
    event.respondWith(networkFirst(event, SHELL));
  }
});

/** The app's page: the network's if it answers in time, else the stored one. */
async function page(event, url) {
  const cache = await caches.open(SHELL);
  const network = fetch(url.href, { cache: "no-cache", credentials: "same-origin" }).then((res) => {
    if (res.ok) event.waitUntil(storePage(cache, res.clone()));
    return unredirect(res);
  });
  const first = await Promise.race([network.catch(() => null), timeout(NAV_TIMEOUT_MS)]);
  if (first) return first;

  const stored = await cache.match(PAGE, MATCH);
  if (stored) {
    if (event.resultingClientId) offlineClients.add(event.resultingClientId);
    return stored;
  }
  // Nothing stored: the first visit, before install finished. Wait it out.
  return network;
}

/**
 * Keep a page as the offline copy only if this build's shell holds every asset
 * it names. A page from a newer deploy than this worker would boot offline
 * into missing scripts; the newer worker, installing, stores its own page.
 */
async function storePage(cache, res) {
  const html = await res.text();
  const assets = html.match(/\/assets\/[^"'\s)?#]+/g) ?? [];
  if (!assets.length || !assets.every((a) => PRECACHED.has(a))) return;
  await cache.put(PAGE, textResponse(html, res));
}

/**
 * A navigation may not be answered with a response that was redirected: the
 * browser treats it as a network error. `/` and `/index.html` do not redirect
 * on any host this runs on, but a copy costs nothing next to a blank page.
 */
function unredirect(res) {
  if (!res.redirected) return res;
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

/**
 * A pack's manifest: the network's if it answers within `PACK_TIMEOUT_MS`,
 * else the stored one. `no-cache` for the reason the page is: a manifest the
 * HTTP cache kept from before a deploy is an old dictionary under new code.
 */
async function packManifest(event, id) {
  const cache = await caches.open(DATA);
  const url = manifestUrl(id);
  const stored = async () => {
    const hit = await cache.match(url, MATCH);
    if (hit) remember(id, await hit.clone().text());
    return hit;
  };
  if (offlineClients.has(event.clientId)) {
    const hit = await stored();
    if (hit) return hit;
  }
  let late = false;
  const network = fetch(url, { cache: "no-cache" }).then(async (res) => {
    if (!res.ok) return res;
    const text = await res.text();
    // Served the stored copy already: this answer would describe files the
    // page is not going to ask for. The next open fetches it again.
    if (late) return textResponse(text, res);
    if (remember(id, text)) await cache.put(url, textResponse(text, res));
    return textResponse(text, res);
  });
  event.waitUntil(network.catch(() => {}));
  const first = await Promise.race([network.catch(() => null), timeout(PACK_TIMEOUT_MS)]);
  if (first) return first;
  late = true;
  const hit = await stored();
  if (hit) return hit;
  late = false;
  return network;
}

/** A pack data file: the copy stored under the manifest's digest, else the network's. */
async function packFile(event, url, { id, file }) {
  const cache = await caches.open(DATA);
  const sha = (await manifestFor(cache, id))?.get(file);
  // A file the manifest does not name (or no manifest stored at all): the
  // old policy, network-first, stored under its own URL.
  if (!sha) {
    return offlineClients.has(event.clientId) ? cacheFirst(event, DATA) : networkFirst(event, DATA);
  }
  const key = fileKey(url, sha);
  const hit = await cache.match(key);
  if (hit) return hit;

  // Stored by the first version of this worker, under the bare URL. Kept if
  // it is the file the manifest names, which it usually is: that is what
  // saves the first open after this worker ships a download of every pack.
  const legacy = await cache.match(url.href, MATCH);
  if (legacy && (await sha256(await legacy.clone().text())) === sha) {
    event.waitUntil(storeFile(cache, url, sha, legacy.clone()));
    return legacy;
  }

  // `no-cache`: a miss is a file that changed, and the HTTP cache may still
  // hold the version before it. Misses are rare now, so the revalidation is.
  let res;
  try {
    res = await fetch(url.href, { cache: "no-cache" });
  } catch (err) {
    // Offline with the manifest newer than the stored file: any copy of the
    // file beats no language at all, which is what the previous worker served.
    const any = await anyCopy(cache, url.pathname);
    if (any) return any;
    throw err;
  }
  if (res.ok) event.waitUntil(storeFile(cache, url, sha, res.clone()));
  return res;
}

/** Store a pack file under its digest, if it has that digest; drop other copies. */
async function storeFile(cache, url, sha, res) {
  const text = await res.text();
  if ((await sha256(text)) !== sha) return;
  const key = fileKey(url, sha);
  await cache.put(key, textResponse(text, res));
  for (const req of await cache.keys()) {
    if (req.url !== key && new URL(req.url).pathname === url.pathname) await cache.delete(req);
  }
}

async function anyCopy(cache, pathname) {
  for (const req of await cache.keys()) {
    if (new URL(req.url).pathname === pathname) return cache.match(req);
  }
  return undefined;
}

/** The digests of a pack, from memory or from the stored manifest. */
async function manifestFor(cache, id) {
  if (manifests.has(id)) return manifests.get(id);
  const hit = await cache.match(manifestUrl(id), MATCH);
  if (!hit) return null;
  remember(id, await hit.text());
  return manifests.get(id) ?? null;
}

/** Read a manifest's digests into memory. False if it does not parse. */
function remember(id, text) {
  try {
    const files = JSON.parse(text).files;
    const map = new Map();
    for (const f of Object.values(files)) if (f && f.path && f.sha256) map.set(f.path, f.sha256);
    manifests.set(id, map);
    return true;
  } catch {
    return false;
  }
}

/** `/packs/<id>/<file>` → `{ id, file }`, or null. */
function packPath(pathname) {
  const m = /^\/packs\/([^/]+)\/(.+)$/.exec(pathname);
  return m ? { id: m[1], file: m[2] } : null;
}

const manifestUrl = (id) => new URL(`/packs/${id}/pack.json`, self.location.origin).href;
const fileKey = (url, sha) => `${url.origin}${url.pathname}?sha256=${sha}`;

/**
 * The pack loader hashes `res.text()` re-encoded as UTF-8 (`packs/verify.ts`),
 * so this does the same, not the raw bytes: the two differ on a BOM.
 */
async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * A stored or re-served text body, with only its content type. The server's
 * other headers describe the bytes it sent — `content-encoding: gzip`, a
 * `content-length` — and not this already-decoded string.
 */
function textResponse(text, res) {
  const type = res.headers.get("content-type") || "text/plain; charset=utf-8";
  return new Response(text, { status: 200, headers: { "content-type": type } });
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(null), ms));
}

async function cacheFirst(event, store) {
  const hit = await caches.match(event.request, MATCH);
  if (hit) return hit;
  return keep(event, store, await fetch(event.request));
}

async function networkFirst(event, store) {
  let res;
  try {
    res = await fetch(event.request);
  } catch (err) {
    const hit = await caches.match(event.request, MATCH);
    if (hit) return hit;
    throw err;
  }
  return keep(event, store, res);
}

/**
 * Store a copy of a good response without holding the page up for it: the
 * page reads one stream while the store reads the other.
 */
function keep(event, store, res) {
  if (!res.ok) return res;
  // Cloned now, not inside the `then`: by then the page is reading the body
  // and a clone throws. That was the first version, and it stored nothing.
  const copy = res.clone();
  event.waitUntil(caches.open(store).then((c) => c.put(event.request, copy)));
  return res;
}
