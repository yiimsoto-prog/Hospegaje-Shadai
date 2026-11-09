# Auditoría (versión redactada)

El informe forense original de las apps Netlify legacy fue **purgado de credenciales** antes de publicar.

Hallazgos vigentes (sin secretos):

- Las versiones antiguas exponían credenciales de personal y Wi‑Fi en el HTML público.
- La autenticación era solo en el cliente y no constituye un control de seguridad.
- Había tres orígenes Netlify sin backend compartido.

La remediación aplicada en el código maestro actual:

- Autorización de personal en rutas `/api/*` con identidad Cursor verificada en servidor.
- Persistencia en Postgres (`migrations/` + `DATABASE_URL`).
- Sin PINs ni contraseñas Wi‑Fi en el frontend ni en este directorio.
