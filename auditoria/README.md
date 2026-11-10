# Auditoría (versión redactada)

Las tres aplicaciones legacy fragmentadas fueron **retiradas**. Sus informes con
credenciales fueron **purgados** de este repositorio.

Hallazgos vigentes (sin secretos ni URLs antiguas):

- Las versiones antiguas exponían credenciales de personal y Wi‑Fi en el HTML público.
- La autenticación era solo en el cliente y no constituye un control de seguridad.
- Había tres frontends sin backend compartido ni base de datos única.

Remediación en el código maestro actual:

- Autorización de personal en rutas `/api/*` con identidad verificada en servidor.
- Persistencia en D1 / Postgres (`migrations/`, binding `DB` o `DATABASE_URL`).
- Sin PINs ni contraseñas Wi‑Fi en el frontend ni en este directorio.
- Un solo despliegue: Cloudflare Workers (OpenNext) + GitHub `yiimsoto-prog/Hospegaje-Shadai`.
