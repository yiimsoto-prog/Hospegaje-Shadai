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

## Cloudflare Workers (OpenNext)

Esta app usa Route Handlers → se despliega en **Cloudflare Workers** con `@opennextjs/cloudflare` (no Pages estático).

### 1) Credenciales (obligatorio en este agente)

`wrangler login` redirige a `localhost` del agente y **no** puede completarse desde tu PC. Usa API Token:

1. https://dash.cloudflare.com/profile/api-tokens → Create Token → plantilla **Edit Cloudflare Workers**
2. Copia el token y el **Account ID** (sidebar del dashboard)
3. Expórtalos en el entorno del agente / secretos Cursor:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. Responde **token listo** en el chat

### 2) Comandos de deploy

```bash
npm run cf:d1:create          # crea D1; pega el database_id en wrangler.toml
npm run cf:d1:migrate         # aplica migrations/d1
npm run cf:deploy             # build OpenNext + wrangler deploy
```

Archivos: `open-next.config.ts`, `wrangler.toml`, `migrations/d1/`.

## Supabase

1. Crear proyecto.
2. Ejecutar `supabase/migrations/001_hospedaje_shadai.sql`.
3. Configurar URL/anon key en el host (nunca en git).
4. Crear usuarios staff en Auth + filas `staff_profiles`.
