# Guía de despliegue — Hospedaje Shadai (código maestro unificado)

## 1. Control de versiones (GitHub y GitLab)

### Preparar el remoto

```bash
git init   # si parte de cero
git add .
git commit -m "feat: unified Hospedaje Shadai PWA"
```

### GitHub

```bash
# Crear repo vacío en github.com, luego:
git remote add origin git@github.com:ORG/hospedaje-shadai.git
git branch -M main
git push -u origin main
```

### GitLab

```bash
git remote add gitlab git@gitlab.com:ORG/hospedaje-shadai.git
git push -u gitlab main
```

Sincronizar ambos:

```bash
git remote set-url --add --push origin git@github.com:ORG/hospedaje-shadai.git
git remote set-url --add --push origin git@gitlab.com:ORG/hospedaje-shadai.git
git push origin main
```

## 2. Supabase (antes o en paralelo)

1. Crear proyecto en [supabase.com](https://supabase.com).
2. SQL Editor → pegar y ejecutar `supabase/migrations/001_hospedaje_shadai.sql`.
3. Authentication → crear usuarios de personal y filas en `staff_profiles` (`admin` / `housekeeping`).
4. Project Settings → API → copiar **Project URL** y **anon public** key.
5. Local:

```bash
cp .env.example .env.local
# editar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Sin estas variables la app corre en **modo muestra** (localStorage), claramente etiquetado.

## 3. Cloudflare Pages (CI/CD)

### Opción A — Dashboard

1. Workers & Pages → Create → Pages → Connect to Git (GitHub o GitLab).
2. Build settings:

| Campo | Valor |
|---|---|
| Framework preset | Next.js (Static HTML Export) o None |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node version | `20` (Environment variable `NODE_VERSION=20`) |

3. Environment variables (Production + Preview):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Save and Deploy.

Archivos incluidos en el repo:

- `wrangler.toml` → `pages_build_output_dir = "out"`
- `public/_headers` → CSP, nosniff, frame denial
- `public/_redirects` → placeholder documentado
- `next.config.ts` → `output: "export"`

### Opción B — Wrangler CLI

```bash
npm run build
npx wrangler pages deploy out --project-name=hospedaje-shadai
```

## 4. Verificación post-deploy

- `/` landing
- `/pms/` portal + admin + housekeeping
- `/checkout/?hab=101` check-out móvil (mismo origen → mismo estado)
- Instalar PWA desde el navegador (manifest en `/manifest.webmanifest`)
- Headers de seguridad visibles en DevTools → Network

## 5. Rotación de secretos heredados

Las versiones Netlify anteriores publicaban PINs y Wi‑Fi en claro. Tras unificar:

1. Cambiar clave Wi‑Fi del router.
2. Invalidar cualquier PIN demo en producción.
3. Despublicar o redirigir los tres sitios Netlify antiguos al dominio único de Cloudflare Pages.
