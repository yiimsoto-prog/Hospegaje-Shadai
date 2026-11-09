# Auditoría Forense — Hospedaje Shadai

Este repositorio contiene el **informe forense y el kit de remediación** de las aplicaciones web desplegadas en Netlify para Hospedaje Shadai (Challhuahuacho), no el código fuente original (el producto vive hoy como HTML monolítico publicado en CDN).

## Sitios auditados

| URL | Rol |
|---|---|
| https://apphospedajeshadai.netlify.app/ | PMS + Portal huésped + Housekeeping (PWA) |
| https://check-out-hospedaje-shadai.netlify.app/ | Check-out móvil |
| https://hospedaje-shadai1.netlify.app/ | Landing marketing |

## Veredicto (una línea)

**No apto para producción multi-sede:** autenticación solo en el cliente, PINs y Wi‑Fi publicados en el HTML, sin API real (todas las rutas `/api/*` → 404) y tres orígenes que no comparten datos.

## Contenido

```
auditoria/
  HALLAZGOS.md                 # Informe completo (5 pilares)
  evidencia/                   # Extractos de código y métricas
  remediacion/
    01-auth-server.md          # Auth/RBAC server-side
    02-xss-dom.md              # Parches anti-XSS
    03-arquitectura-api.md     # Unificación orígenes + API
    04-ui-a11y-contraste.md    # Contraste, ARIA, temas
    05-limpieza-sw-bloat.md    # SW, base64, CDN, dead code
```

## Cómo usar este material

1. Leer `auditoria/HALLAZGOS.md`.
2. Aplicar en orden: **01 → 03 → 02 → 05 → 04** (seguridad y datos primero).
3. Rotar de inmediato la clave Wi‑Fi y todos los PINs expuestos.
4. Publicar un único origen con backend y base de datos antes de operar recepción real.

## Nota de alcance

El briefing mencionaba un estudio de abogados. Las URLs entregadas corresponden a un **PMS de hospedaje minero**. Si existe otra aplicación legal, debe auditarse por separado.
