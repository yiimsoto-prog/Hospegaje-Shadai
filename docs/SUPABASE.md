# Supabase — Hospedaje Shadai

Proyecto: `https://ipcakthexcmvazebppym.supabase.co`

## 1) Crear tablas

En Supabase → **SQL Editor** → New query → pega y ejecuta:

`supabase/migrations/002_app_runtime.sql`

## 2) Secretos (no los pegues en el chat)

En **Cloudflare** → Worker `hospegaje-shadai` → **Settings → Variables and Secrets**:

| Nombre | Tipo | Valor |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Project Settings → API → `service_role` |
| `SUPABASE_ANON_KEY` | Secret (opcional) | Project Settings → API → `anon` `public` |

La URL ya está en `wrangler.toml` como `SUPABASE_URL`.

## 3) Redeploy

Reintenta la compilación de Workers Builds (o espera el push automático).
