# LIM — Código muerto, SW, bloat base64, CDN

## 1. Extraer imágenes base64 del HTML

```bash
# En build, las imágenes viven en /img y se referencian por URL
# Eliminar window.SHADAI_LOGO / ROOM_*_FALLBACK / QR_WIFI_FALLBACK del index.html
```

```html
<img src="/img/logo-shadai.jpg" width="40" height="40" alt="Hospedaje Shadai"
     loading="lazy" decoding="async" />
```

Landing: mismo tratamiento — hoy ~4.7 MB de base64.

## 2. Service Worker alineado al monolito actual (parche rápido)

```js
// sw.js — ANTES cachea css/styles.css y js/app.js inexistentes
const CACHE_NAME = 'shadai-pwa-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/icon-maskable-192.png',
  './img/icon-maskable-512.png',
  './img/logo-shadai.jpg',
  './img/qr-wifi-shadai.png',
];

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return; // network-only APIs

  // HTML: network-first para no servir PMS obsoleto
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // estáticos: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((res) => {
        if (res.ok) caches.open(CACHE_NAME).then((c) => c.put(event.request, res.clone()));
        return res;
      });
      return cached || fetched;
    })
  );
});
```

## 3. Purgar dead code de localhost (PMS ~L6941–6974)

Eliminar por completo:
- `fetch('http://localhost:3000/api/server-info')`
- `window.open('http://localhost:3000/checkout.html...')`
- ramas `file://`

Reemplazar generación de QR por:

```js
function buildCheckoutUrl(roomNumber) {
  return `${window.location.origin}/checkout.html?hab=${encodeURIComponent(roomNumber)}`;
}
```

## 4. Dejar de usar Tailwind CDN + Lucide `@latest`

```bash
npm create vite@latest shadai-app -- --template vanilla
npm i -D tailwindcss @tailwindcss/vite
npm i lucide  # versión fija en package-lock
```

Importar solo iconos usados:

```js
import { Key, LogOut, BedDouble } from 'lucide';
```

## 5. Modularizar el god-file

Objetivo de estructura (tras estabilizar API):

```
/src
  /app.js
  /auth/session.js
  /data/api.js
  /views/guest.js
  /views/admin/{rack,b2b,folios,orders,bookings}.js
  /views/housekeeping.js
  /views/checkout.js
  /ui/{modal,toast,table}.js
/index.html   # solo shell
```

## 6. Unificar claves localStorage (mientras exista demo mode)

```js
const DB_KEY = 'hospedaje_shadai_db';
// Eliminar lecturas/escrituras de 'hospedaje_db'
// Migración única:
const legacy = localStorage.getItem('hospedaje_db');
if (legacy && !localStorage.getItem(DB_KEY)) {
  localStorage.setItem(DB_KEY, legacy);
}
localStorage.removeItem('hospedaje_db');
```
