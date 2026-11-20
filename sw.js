
const CACHE = "tanit-v19";
const ASSETS = [
  "index.html",
  "menu-data.js?v=19", "translations.js?v=19", "supabase-config.js?v=19", "script.js?v=19",
  "styles.css?v=19",
  "manifest.json", "icon.svg", "favicon.svg", "logo-tanit.jpg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const isMenuPage = url.pathname === "/" || url.pathname === "/index.html";
  const isAsset = ASSETS.includes(url.pathname.slice(1) + url.search);
  if (!isMenuPage && !isAsset) return;

  const key = isMenuPage ? new Request(new URL("index.html", self.registration.scope)) : req;
  e.respondWith(
    caches.match(key).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(key, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
