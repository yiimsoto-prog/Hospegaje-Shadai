# Hospedaje Shadai — código maestro unificado

PWA de gestión hotelera para **Hospedaje Shadai** (Challhuahuacho, Apurímac). Consolida en un solo origen las tres versiones Netlify previas (PMS, check-out móvil y landing).

## Qué incluye

| Ruta | Módulo |
|---|---|
| `/` | Landing corporativa |
| `/pms/` | Portal huésped + Admin PMS + Housekeeping |
| `/checkout/?hab=101` | Check-out móvil (mismo codebase y storage) |

**Admin:** pizarra de habitaciones, check-in exprés, liquidación B2B, caja chica, asistencia de personal, housekeeping.  
**Seguridad:** sin PINs en la UI; modo muestra con credenciales demo no publicadas en pantalla de producción; esquema Supabase + RLS en `supabase/migrations/`.  
**Tema:** claro / oscuro con tokens de contraste AA.

## Desarrollo local

```bash
npm install
npm run dev
# http://127.0.0.1:43123
```

Sin `.env.local` corre con **datos de muestra** (localStorage).  
PINs demo (solo mock): `demo-admin` / `demo-hk`.

Conectar Supabase:

```bash
cp .env.example .env.local
# completar URL y anon key
# ejecutar SQL: supabase/migrations/001_hospedaje_shadai.sql
```

## Build estático (Cloudflare Pages)

```bash
npm run build   # genera ./out
npm run preview # sirve out en :43123
```

Guía completa GitHub / GitLab / Cloudflare: [`docs/DEPLOY.md`](docs/DEPLOY.md).

## Auditoría previa

El informe forense de las versiones fragmentadas está en [`auditoria/HALLAZGOS.md`](auditoria/HALLAZGOS.md).

## Stack

Next.js (static export) · TypeScript · Tailwind CSS 4 · Supabase JS · Lucide · PWA manifest
