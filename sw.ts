
// @ts-nocheck
/* eslint-disable no-restricted-globals */

// Nome della cache per questa versione
const CACHE_NAME = 'zonerun-cache-v1';

// Risorse base da salvare per il funzionamento offline
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installazione: scarica gli asset nella cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch: serve i file dalla cache se presenti, altrimenti usa la rete
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});