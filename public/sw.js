// Service worker mínimo para que /estudiantes sea instalable como PWA.
// A propósito no cachea nada: los leads, universidades y videos vienen
// en vivo de Supabase y no deben servirse desde caché.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
