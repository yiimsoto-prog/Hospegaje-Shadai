# Cloudflare Workers Builds — configuración correcta

Tu build falla porque **Comando de compilación = Ninguno** y solo corre `npx wrangler deploy` sin generar `.open-next/worker.js`.

## En el dashboard (Worker `hospedaje-shadai`)

1. **Configuración → Compilaciones** (Builds) → editar configuración.
2. Pon exactamente:

| Campo | Valor |
|---|---|
| Comando de compilación | `npm ci && npx @opennextjs/cloudflare build` |
| Implementar comando | `npx wrangler deploy` |
| Directorio raíz | `/` |
| Versión de Node (si pide) | `20` |

3. Guarda.
4. **Vinculaciones** debe tener: `DB` → D1 `hospedaje-shadai` (ya lo tienes).
5. **Reintentar compilación**.

## No uses

- Comando de compilación vacío / “Ninguno”
- Solo `npx wrangler deploy` sin el build de OpenNext
