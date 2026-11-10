# Cloudflare Workers Builds

## Configuración recomendada en el dashboard

| Campo | Valor |
|---|---|
| Comando de compilación | `npx opennextjs-cloudflare build` *(o déjalo vacío)* |
| Implementar comando | `npx wrangler deploy` |
| Directorio raíz | `/` |
| Node | `20` |

## Si el comando de compilación queda en «Ninguno»

Tras `npm clean-install`, `postinstall` enlaza `scripts/wrangler.cjs`.
Ese shim hace que `npx wrangler deploy` compile OpenNext y luego suba el worker.
Verás en el log: `[hospedaje-shadai] Building OpenNext before wrangler deploy…`

## Vinculaciones

- `DB` → D1 `hospedaje-shadai` (obligatorio)

## Origen único

El código canónico vive en GitHub (`yiimsoto-prog/Hospegaje-Shadai`) y se publica
solo en Cloudflare Workers. No hay configuración de otros hosts estáticos en este repo.
