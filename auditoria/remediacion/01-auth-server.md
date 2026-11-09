# SEC-01 / SEC-02 — Autenticación y RBAC reales

## Qué eliminar YA del cliente (cirugía)

1. Borrar del HTML el bloque “PIN Admin / PIN Limpieza” (aprox. L1173–1189).
2. Eliminar `AUTH_CONFIG` con claves en claro (L4875–4877).
3. Dejar de persistir `shadai_auth_role` en `localStorage` como fuente de verdad.
4. Rotar clave Wi‑Fi `sangre2022dejesus` en el router (está quemada en internet).

## Modelo objetivo

```
Browser ──HTTPS──► API (Netlify Functions / Fly / Railway)
                      │  cookie httpOnly Secure SameSite=Strict
                      │  o Authorization: Bearer <JWT>
                      ▼
                   Postgres + RLS / políticas por rol
                   roles: admin | housekeeping | guest(readonly)
```

## Parche cliente: verificación solo vía API

```js
// js/auth.js  (módulo nuevo — NO hardcodear secretos)
export async function loginStaff({ pin, role }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin, role }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Credenciales inválidas');
  }
  return res.json(); // { role, displayName, expiresAt }
}

export async function logoutStaff() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}

export async function getSession() {
  const res = await fetch('/api/auth/session', { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('No se pudo validar sesión');
  return res.json();
}

// UI: nunca confiar en localStorage para autorización
export function applyRoleFromSession(session) {
  const role = session?.role || 'guest';
  document.getElementById('viewGuest')?.classList.toggle('hidden', role !== 'guest');
  document.getElementById('viewAdmin')?.classList.toggle('hidden', role !== 'admin');
  document.getElementById('viewHousekeeping')?.classList.toggle('hidden', role !== 'housekeeping');
}
```

## Parche servidor (Netlify Function ejemplo)

```js
// netlify/functions/auth-login.js
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { getStore } from '@netlify/blobs'; // o Postgres

const encoder = new TextEncoder();

export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { pin, role } = JSON.parse(event.body || '{}');
  if (!pin || !['admin', 'housekeeping'].includes(role)) {
    return json(400, { message: 'Solicitud inválida' });
  }

  // hashes en variables de entorno — NUNCA en el repo
  const hash = role === 'admin'
    ? process.env.ADMIN_PIN_HASH
    : process.env.HK_PIN_HASH;

  const ok = hash && await bcrypt.compare(String(pin), hash);
  // rate-limit por IP aquí (Upstash / Netlify Blobs counter)
  if (!ok) return json(401, { message: 'PIN incorrecto' });

  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(encoder.encode(process.env.JWT_SECRET));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': [
        `shadai_session=${token}`,
        'HttpOnly',
        'Secure',
        'SameSite=Strict',
        'Path=/',
        'Max-Age=28800',
      ].join('; '),
    },
    body: JSON.stringify({ role, expiresAt: Date.now() + 8 * 3600 * 1000 }),
  };
}

function json(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}
```

## Middleware de mutaciones

```js
// Cada POST /api/bookings, /api/guardias/*, /api/reset-demo, etc.
export function requireRole(event, allowed) {
  const cookie = parseCookie(event.headers.cookie || '');
  const payload = verifyJwt(cookie.shadai_session, process.env.JWT_SECRET);
  if (!payload || !allowed.includes(payload.role)) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }
  return payload;
}
```

## Generar hashes (una sola vez, en máquina segura)

```bash
node -e "require('bcryptjs').hash('TU_PIN_FUERTE', 12).then(console.log)"
# export ADMIN_PIN_HASH=...
# export HK_PIN_HASH=...
# export JWT_SECRET=$(openssl rand -hex 32)
```
