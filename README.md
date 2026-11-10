# Hospedaje Shadai — código maestro unificado

Repositorio GitHub: [https://github.com/yiimsoto-prog/Hospegaje-Shadai](https://github.com/yiimsoto-prog/Hospegaje-Shadai)

PWA/sistema de gestión para **Hospedaje Shadai** (Challhuahuacho). Unifica landing, PMS, housekeeping, check-out móvil, caja chica, asistencia y liquidación B2B.

## Seguridad (producción)

- Personal autorizado en el **servidor** (`/api/*`) con identidad Cursor verificada.
- Datos en **Postgres** (`migrations/` + `DATABASE_URL` en el host publicado).
- **Sin PINs** ni claves Wi‑Fi en el frontend.
- Publicar como app **privada** o **team** en Cursor (no pública) para el gate de identidad.

## Rutas

| Ruta | Módulo |
|---|---|
| `/` | Landing |
| `/pms` | Portal huésped + Admin + Limpieza |
| `/checkout?hab=101` | Check-out móvil |

## Desarrollo

```bash
npm install
npm run dev
# http://127.0.0.1:43123
```

En local, la identidad simulada (`cursor/identity.dev.ts`) permite registrar el **primer administrador** (bootstrap) y operar el PMS contra PGlite.

## Supabase (opcional / Cloudflare)

El esquema de referencia RLS está en `supabase/migrations/001_hospedaje_shadai.sql` para un proyecto Supabase propio. El runtime publicado en Cursor usa Postgres de la plataforma (`cursor-app.json`).

Variables solo si conectas Supabase por tu cuenta (configúralas en el panel del host; no van en el repo):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Cloudflare Pages / GitHub / GitLab

Ver `docs/DEPLOY.md`. El build con rutas API requiere un host Node (Cursor Apps, o adaptador OpenNext en Cloudflare). El export estático anterior se eliminó a propósito: no hay frontera de seguridad sin servidor.

## Auditoría legacy

Resumen redactado (sin secretos): `auditoria/README.md`.
