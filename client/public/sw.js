// Minimal service worker — required for PWA installability.
// No offline caching: the deck is useless without the USB tunnel anyway.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
