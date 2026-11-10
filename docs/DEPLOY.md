# Despliegue — Hospedaje Shadai

## Cursor Apps (recomendado para esta base)

1. Publicar con el diálogo **Publish** del agente (app **privada** o **team**).
2. La plataforma crea Postgres (`cursor-app.json`) y aplica `migrations/*.sql`.
3. El primer usuario autenticado puede usar **Registrar primer administrador**.

## GitHub / GitLab

Remoto canónico del producto:

- https://github.com/yiimsoto-prog/Hospegaje-Shadai

En este workspace el remoto se llama `github`:

```bash
git remote add github https://github.com/yiimsoto-prog/Hospegaje-Shadai.git
git push -u github main
```


```bash
git remote add github git@github.com:ORG/hospedaje-shadai.git   # si aplica
git push -u github main
# o GitLab:
git remote add gitlab git@gitlab.com:ORG/hospedaje-shadai.git
git push -u gitlab main
```

Este workspace ya sincroniza con el remoto Origin de Cursor (`git push origin main`).

## Cloudflare

Esta app usa Route Handlers de Next.js (no es export estático). Opciones:

1. **Cursor Apps** (ya soporta API + Postgres), o
2. Cloudflare con adaptador **OpenNext** (`@opennextjs/cloudflare`) + binding D1/Hyperdrive, o
3. Frontend estático + **Supabase** como backend (aplicar `supabase/migrations/001_hospedaje_shadai.sql` y cablear el cliente; sin PINs en el browser).

Sin credenciales de Cloudflare (`wrangler login`) no se puede desplegar Pages desde este entorno.

## Supabase

1. Crear proyecto.
2. Ejecutar `supabase/migrations/001_hospedaje_shadai.sql`.
3. Configurar URL/anon key en el host (nunca en git).
4. Crear usuarios staff en Auth + filas `staff_profiles`.
