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
 * the page and the packs come from the server, and the worker only keeps a
 * copy. Its value is the other case — a train, a plane, a phone on the Home
 * Screen opened in a lift — where it serves the copy instead.
 *
 * Three kinds of request, three policies:
 *
 * - **The page** (`/`, `/index.html`) is network-first, and waits on the
 *   network for `NAV_TIMEOUT_MS` at most before it falls back. The latest page
 *   fetched replaces the stored one, so the page served offline is the one
 *   last seen online. Other pages the site serves (privacy, support) are left
 *   to the browser: offline, the app's page is not an answer to them.
 * - **`/assets/`** is cache-first. Vite names every file there by the hash of
 *   its contents, so a stored copy cannot be stale, only unused.
 * - **Everything else** — the packs, the manifest, the icons — is
 *   network-first with the stored copy as the fallback.
 *
 * **Why packs are not cache-first**, though that would boot faster: a pack is
 * the one thing here that changes under an unchanged URL. `/packs/es/pack.json`
 * in one build and the next are different files, and a cache-first worker
 * would hand the page that loaded from the network a floor from the build
 * before — new code on an old dictionary, for as long as the old worker ran.
 * Network-first cannot mix them while there is a network. The floor also
 * carries no digests (`loadBundledPack`: "never hashed"), so nothing
 * downstream would notice the mix.
 *
 * **A page served from the store is served from the store throughout.** When
 * the network is merely slow and the page times out onto the stored copy,
 * waiting on the same network for each pack would stall the boot the fallback
 * was meant to rescue, and could load packs from a newer build under an older
 * page. So the client a stored page opens in is remembered, and every request
 * it makes is cache-first.
 *
 * **Two stores.** The shell lives in a store named for the build and is
 * deleted with it, since hashed assets from an old build are dead weight. The
 * packs live in one store that outlives builds, because a reader who studies
 * Spanish should still have Spanish offline the day after a deploy, before
 * they have opened it online again. A language is stored when it is first
 * loaded online; the worker does not fetch six languages nobody asked for.
 * On the very first visit the language loads before the worker exists, so
 * `offline.ts` sends the pack files the page already fetched, and they are
 * stored then (`keep` below).
 *
 * **Cross-origin requests pass through untouched**: the pack update check
 * (`packs.tintareader.com`) and the AI providers answer to their own caching
 * and fail as they already do offline.
 */

/* global self, caches, fetch, Request, URL */

/** Replaced at build time: `{ version: string, precache: string[] }`. */
const BUILD = {"version":"d92d7c662116","precache":["/assets/index-CpjL5Ztw.js","/assets/index-c9Ow_fvp.css","/assets/webview-CAYf3ZKV.js","/assets/window-CGcHDSdg.js","/icon.svg","/icons/apple-touch-icon.png","/icons/icon-192.png","/icons/icon-512.png","/icons/maskable-512.png","/index.html","/manifest.webmanifest"]};

const PREFIX = "tinta-";
const SHELL = `${PREFIX}shell-${BUILD.version}`;
const DATA = `${PREFIX}data`;
const PAGE = "/index.html";
const NAV_TIMEOUT_MS = 4000;

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

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      // `reload` skips the HTTP cache, so a shell stored now is the one the
      // server has now, not one the browser kept from an earlier build.
      await cache.addAll(BUILD.precache.map((p) => new Request(p, { cache: "reload" })));
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
 * that cannot be fetched is skipped rather than failing the rest.
 */
self.addEventListener("message", (event) => {
  const urls = event.data && Array.isArray(event.data.keep) ? event.data.keep : [];
  const packs = urls.filter((u) => {
    try {
      const url = new URL(u);
      return url.origin === self.location.origin && url.pathname.startsWith("/packs/");
    } catch {
      return false;
    }
  });
  if (!packs.length) return;
  event.waitUntil(
    caches.open(DATA).then((c) => Promise.all(packs.map((u) => c.add(u).catch(() => {})))),
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
    event.respondWith(page(event));
    return;
  }
  const store = url.pathname.startsWith("/packs/") ? DATA : SHELL;
  if (url.pathname.startsWith("/assets/") || offlineClients.has(event.clientId)) {
    event.respondWith(cacheFirst(event, store));
  } else {
    event.respondWith(networkFirst(event, store));
  }
});

/** The app's page: the network's if it answers in time, else the stored one. */
async function page(event) {
  const cache = await caches.open(SHELL);
  const network = fetch(event.request).then((res) => {
    if (res.ok) event.waitUntil(cache.put(PAGE, res.clone()));
    return res;
  });
  const late = new Promise((resolve) => setTimeout(() => resolve(null), NAV_TIMEOUT_MS));
  const first = await Promise.race([network.catch(() => null), late]);
  if (first) return first;

  const stored = await cache.match(PAGE, MATCH);
  if (stored) {
    if (event.resultingClientId) offlineClients.add(event.resultingClientId);
    return stored;
  }
  // Nothing stored: the first visit, before install finished. Wait it out.
  return network;
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
