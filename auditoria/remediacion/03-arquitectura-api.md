# ARCH — Unificar orígenes + API + persistencia multi-sede

## Fallo operativo actual
| Sitio | Origen | Persistencia |
|---|---|---|
| PMS | `apphospedajeshadai.netlify.app` | `localStorage` A |
| Check-out | `check-out-hospedaje-shadai.netlify.app` | `localStorage` B (aislado) |
| Landing | `hospedaje-shadai1.netlify.app` | ninguna |

Check-out móvil **nunca** ve asignaciones hechas en recepción. Liquidación B2B no es la misma en dos PCs de recepción.

## Arquitectura objetivo (mínima viable empresarial)

```
app.hospedajeshadai.pe
  /                 Portal + PMS + HK (SPA o MPA)
  /checkout         Check-out móvil (misma app, deep link ?hab=101)
  /                 Landing puede ser sitio aparte o /marketing

API:  /api/*  (Functions) → Postgres
Auth: cookie sesión (ver 01-auth-server.md)
Realtime (opcional): Supabase Realtime / SSE para rack de habitaciones
```

## Contrato API mínimo (reemplaza el fake `HospedajeData`)

```http
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/session

GET    /api/rooms
PATCH  /api/rooms/:number/status          # admin|hk

POST   /api/guardias/asignar              # admin|hk (check-in exprés)
POST   /api/guardias/liberar
GET    /api/mobile/validar?habitacion&dni
POST   /api/mobile/checkout-diario

GET    /api/bookings
POST   /api/bookings/:id/charges
POST   /api/bookings/:id/payments

GET    /api/b2b/liquidacion?anio&mes
GET    /api/b2b/auditoria

POST   /api/housekeeping/:id/complete     # hk|admin
```

## Parche: dejar de fingir backend en el cliente

```js
// ANTES (actual)
async checkBackend() {
  try {
    const res = await fetch('/api/stats', { signal: AbortSignal.timeout(1500) });
    this.isBackendAvailable = res.ok;
  } catch {
    this.isBackendAvailable = false; // ← producción Netlify siempre false
  }
  return this.isBackendAvailable;
}

// DESPUÉS — fallar cerrado en ops reales
async requireBackend() {
  const res = await fetch('/api/health', { credentials: 'include' });
  if (!res.ok) throw new Error('Sistema offline: no se puede operar sin servidor');
  return true;
}
```

En producción empresarial: **prohibido** mutar ocupación solo en `localStorage`. El modo local queda como `DEMO_MODE=true` explícito en staging, nunca en el dominio de recepción.

## Unificar check-out
Eliminar el segundo sitio Netlify. En el PMS:

```js
// QR de habitación debe apuntar al MISMO origen
const checkoutUrl = `${location.origin}/checkout.html?hab=${roomNumber}`;
// o ruta SPA: `${location.origin}/#/checkout/${roomNumber}`
```

## Headers Netlify (`netlify.toml`)

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy = "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'"
    X-Frame-Options = "DENY"
```
