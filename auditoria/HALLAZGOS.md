# Auditoría Forense Integral — Hospedaje Shadai (PWA / PMS)

**Alcance auditado (live):**
- `https://apphospedajeshadai.netlify.app/` — PMS + Portal Huésped + Housekeeping (monolito)
- `https://check-out-hospedaje-shadai.netlify.app/` — Check-out móvil minero
- `https://hospedaje-shadai1.netlify.app/` — Landing marketing

**Fecha de captura:** 2026-11-09 (America/Lima)  
**Método:** descarga HTML/assets, headers HTTP, sondeo HEAD de `/api/*`, análisis estático línea a línea, inventario de paneles/modales/tabs.

> **Aclaración de alcance:** el briefing menciona un “estudio de abogados” (casos, caja chica, geolocalización). Las tres URLs entregadas corresponden a un **PMS de hospedaje minero (Shadai / Challhuahuacho)**. Esta auditoría cubre exactamente lo desplegado en esas URLs. Si existe otra app de estudio legal, debe entregarse su código o URL para un segundo ciclo.

---

## Veredicto ejecutivo

| Dimensión | Estado | Nota |
|---|---|---|
| Seguridad | **CRÍTICO / NO APTO PRODUCCIÓN** | Auth solo cliente; PINs y Wi‑Fi en claro; sin backend |
| Arquitectura multi-sede | **FALLA OPERATIVA** | 3 orígenes Netlify sin API compartida; datos no se sincronizan |
| UI / Accesibilidad | **ALTO RIESGO** | 0 atributos `aria-*`; sin modo oscuro; contraste débil en tablas |
| Limpieza / rendimiento | **ALTO** | Monolito 2.4 MB + landing 4.7 MB con base64 embebido |
| Funcionalidad B2B / checkout | **ROTA entre sitios** | Check-out y PMS no comparten `localStorage` cross-origin |

**Conclusión:** la aplicación es un prototipo frontend-only con apariencia de PMS empresarial. No existe capa de confianza (API + RBAC servidor). Cualquier visitante puede elevar privilegios y manipular ocupación, folios, liquidación B2B y padrón.

---

## Inventario de superficie

### App PMS (`apphospedajeshadai`)
- **Stack real:** HTML monolítico (~2.4 MB / 8278 líneas), Tailwind CDN, Lucide `@latest` (unpkg), Plus Jakarta Sans, `localStorage`, Service Worker `sw.js`
- **Backend declarado:** `fetch('/api/...')` — **todas las rutas responden 404** en producción
- **Persistencia real:** `localStorage['hospedaje_shadai_db']` por navegador
- **Roles UI:** `guest` | `admin` | `housekeeping`
- **Vistas:** `#viewGuest`, `#viewAdmin`, `#viewHousekeeping`
- **Tabs Admin:** Rack, B2B Las Bambas, Folios, Pedidos, Libro de Huéspedes
- **Modales:** Staff Auth, Check-in Exprés, Bulk Upload, Edit Booking/Contrata/Folio/Order/Auditoría, QR puerta, Room notes/status, Folio, Install PWA
- **Funciones JS globales:** 113
- **Sinks XSS:** 46 asignaciones `.innerHTML`, 132 `onclick=` inline
- **ARIA:** **0**

### Check-out móvil
- HTML ~38 KB, mismo patrón Tailwind CDN + Lucide latest
- Lee/escribe las mismas claves `localStorage` **pero en otro origen** → no ve datos del PMS
- `user-scalable=no` / `maximum-scale=1.0` (bloqueo de zoom — fallo a11y WCAG)

### Landing marketing
- ~4.75 MB (≈4.7 MB en base64 de imágenes)
- Formulario de consulta estático; sin backend visible
- No es PWA operativa

### Headers de seguridad (los 3)
- Presente: `Strict-Transport-Security`
- Ausente: `Content-Security-Policy`, `X-Frame-Options` / `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`

---

## Pilar 4 — Ciberseguridad (hallazgos)

### SEC-01 · CRÍTICA — Credenciales publicadas en el HTML y en pantalla
**Ubicación:** `index.html` L1181–1186 (UI), L4875–4877 (`AUTH_CONFIG`), L549 / L924 / L2654–2656 / L3699–3702 (Wi‑Fi)

```js
const AUTH_CONFIG = {
  adminKeys: ['shadai2026', '1234', 'sangre2022dejesus', 'admin123', 'admin2026'],
  housekeepingKeys: ['limpieza2026', '2026', 'limpieza123', 'limpieza']
};
```

La tarjeta “Seguridad & Claves” imprime en el DOM: `PIN Admin: 1234 / shadai2026` y `PIN Limpieza: 2026 / limpieza2026`.  
La clave Wi‑Fi `sangre2022dejesus` está hardcodeada **y además es una clave de admin válida**.

**Diagnóstico:** bypass total de autenticación; cualquiera en internet obtiene rol admin.  
**Remediación:** ver `remediacion/01-auth-server.md`. Eliminar PINs del cliente; autenticación server-side (JWT/sesión httpOnly); rotar Wi‑Fi y nunca reutilizarla como secreto de app.

### SEC-02 · CRÍTICA — RBAC solo en cliente (bypass por DevTools)
**Ubicación:** L4883–5008

```js
sessionStorage.setItem('shadai_auth_role', grantedRole);
localStorage.setItem('shadai_auth_role', grantedRole); // si “recordar”
```

Cualquier usuario puede ejecutar:
`localStorage.setItem('shadai_auth_role','admin'); location.reload()`.

Los “candados” UI (`lockIconAdmin`) solo ocultan botones; las funciones mutadoras (`handleGuestCheckIn`, CRUD B2B, reset demo, etc.) no tienen autoridad de servidor.

**Remediación:** cada mutación debe ir a API autenticada; el front solo refleja permisos, nunca los impone.

### SEC-03 · CRÍTICA — Ausencia total de API en producción
**Evidencia:** `HEAD/GET` a `/api`, `/api/rooms`, `/api/bookings`, `/api/housekeeping`, `/api/auth`, `/api/health` → **404**.  
El cliente hace `checkBackend()` con timeout 1.5 s y cae a `localStorage`.

**Impacto operativo multi-sede:** recepción, limpieza y check-out móvil **no comparten estado**. Cada dispositivo tiene su propia “verdad”. Liquidación B2B y padrón de pernoctas no son auditables ni recuperables.

### SEC-04 · ALTA — XSS almacenado/DOM vía `innerHTML`
**Ubicación (ejemplos):** L6471 (`${asig.trabajador}`), L6663, L6779, L7793 (`toast.innerHTML = \`<span>${message}</span>\``)

Nombres de mineros / contratas / mensajes se interpolan en HTML. Un payload en “nombre trabajador” o en toast rompe el contexto del personal.

**Remediación:** `textContent` / `sanitize()`; prohibir `innerHTML` con datos de usuario.

### SEC-05 · ALTA — PII de demostración embebida públicamente
**Ubicación:** seed `EMBEDDED_DB` ~L3390+ (DNI, teléfonos, RUC, cargos, empresas reales).

Aunque sean “demo”, si coinciden con personas reales es exposición de datos personales (Ley 29733 Perú). Deben ser 100 % sintéticos o eliminados del bundle público.

### SEC-06 · ALTA — Cadena de suministro frontend
- `https://cdn.tailwindcss.com` (runtime CDN, no build) — no apto producción
- `https://unpkg.com/lucide@latest` — **tag flotante**; un commit malicioso en unpkg afecta la app
- Service Worker cachea respuestas 200 de red (incluye HTML) → superficie de cache poisoning si hay XSS

### SEC-07 · MEDIA — Clickjacking / falta de CSP
Sin `frame-ancestors`/`X-Frame-Options` ni CSP. La UI de auth y PINs visibles pueden embeberse en iframe malicioso.

### SEC-08 · MEDIA — Cambio de claves vía `prompt()` a `localStorage`
**Ubicación:** `handleChangeSecurityPassPrompt` L5121–5135.  
Las “nuevas claves” solo viven en ese navegador; no invalidan las maestras hardcodeadas (`adminKeys` sigue aceptándolas).

### SEC-09 · MEDIA — Endpoint de reset y localhost muertos
- `POST /api/reset-demo` (si algún día existiera sin auth sería destructivo)
- `fetch('http://localhost:3000/api/server-info')` y `window.open('http://localhost:3000/checkout.html...')` L6948 / L6974 — código muerto de entorno local en producción

---

## Pilar 2 — Arquitectura y funcionalidad por panel

### Arquitectura real vs pretendida

```
[Portal Huésped]─┐
[Admin PMS]──────┼─► index.html monolito ──► localStorage (por origen)
[Housekeeping]───┘         │
                           ├─ fetch /api/* ──► 404 (fallback local)
[Check-out Netlify B] ─────► su propio localStorage (NO sincroniza)
[Landing Netlify C] ───────► estático marketing
```

### Panel a panel

| Panel / flujo | ¿Funciona en un solo browser? | ¿Multi-sede / multi-dispositivo? | Notas |
|---|---|---|---|
| Portal Huésped / catálogo 101–306 | Parcial (seed local) | No | Estado demo “18 libres” |
| Check-out móvil (dentro del PMS) | Sí si hay asignación local | No cross-device | Valida DNI vs `asignacion` local |
| Check-out sitio dedicado | Solo si alguien pobló ese origen | **Roto vs PMS** | Orígenes distintos |
| Check-in Exprés / Quick Assign | UI + localStorage | No | Gate UI por PIN cliente |
| Carga masiva nómina | Parser TSV en cliente | No | Sin validación servidor |
| Rack habitaciones | Sí local | No | Colores estado OK conceptualmente |
| Folios / cargos / pagos | Sí local | No | Totales en cliente |
| Pedidos / room service | Feature flag `localStorage` | Módulo “en preparación” | |
| Libro de huéspedes | Tabla local | No | |
| Liquidación B2B Las Bambas | Cálculo cliente + export Excel | **No auditable** | Sin inmutabilidad real |
| Housekeeping checklist | Sí local | No | |
| PWA install | Manifest OK; SW referencia assets inexistentes | Cache incompleto | Ver LIM-02 |
| Reset demo | Admin UI | Destructivo local | |

### Deuda técnica
1. **God-file:** 113 funciones + markup + CSS + DB seed + 2 MB imágenes en un solo `index.html`.
2. **API ficticia:** capa `HospedajeData.*` duplica contratos REST que no existen.
3. **Duplicación:** lógica de validar DNI / checkout repetida en PMS y en sitio check-out.
4. **Estado global mutable `State` + DOM directo:** re-renders manuales (`renderHousekeepingView`, `renderCurrentRoleView`) frágiles; sin virtual DOM ni suscripción.
5. **Tres deploys** en vez de un dominio con rutas `/`, `/checkout`, `/marketing`.

### Rendimiento
- First download PMS ≈ **2.4 MB** HTML (≈2.0 MB base64). Bloquea parseo.
- Landing ≈ **4.7 MB**.
- Tailwind CDN compila en runtime en el dispositivo del usuario (CPU móvil Challhuahuacho / redes mineras = latencia alta).
- Sin code-splitting, sin lazy de paneles admin, sin virtualización de tablas B2B.

---

## Pilar 1 — UI / UX / Accesibilidad / Temas

### Modo claro / oscuro
**No existe toggle ni `prefers-color-scheme` ni clase `dark`.**  
- Shell/nav: oscuro fijo (`slate-900`)  
- Paneles internos guest/admin: cards claras (`bg-white`, `slate-50`)  
Auditoría “modo oscuro” = **N/A como feature**; hay un híbrido forzado que genera contraste inconsistente.

### Contraste y legibilidad
| Elemento | Problema | Severidad |
|---|---|---|
| Thead tablas `bg-slate-50 text-slate-400` (L1271, 1310, 1620, 1645) | Texto gris claro sobre gris claro; ratio estimado &lt; 3:1 | Alta |
| Placeholders / helps `text-slate-400` sobre blanco | Placeholders suelen fallar WCAG AA | Media |
| PIN/Wi‑Fi en `text-amber-300` sobre navy | Legible pero **no debería mostrarse** | Crítica (sec) |
| KPIs admin en blanco sobre navy | OK | — |
| Badge “En cola de aseo” amber sobre claro | OK | — |
| Nav inactivo `text-slate-300` sobre `slate-900` | Borderline AA | Media |

### Estados interactivos
- `focus:ring` presente en muchos inputs (~79) — positivo
- `outline-none` en 43 sitios: riesgo si no hay reemplazo visible consistente
- `disabled:` casi ausente (1 coincidencia): botones en carga usan `innerHTML` spinner pero no siempre `disabled` + `aria-busy`
- Hover en tabs admin: OK visualmente
- Error auth: borde rose + mensaje — OK, pero sin `aria-invalid` / `aria-live`

### Accesibilidad estructural
- **0 `aria-*`, 0 `role=`** en el PMS
- Modales sin focus trap / `aria-modal` / retorno de foco
- Iconos Lucide sin texto alternativo cuando el botón solo tiene icono
- Check-out: `user-scalable=no` viola WCAG 1.4.4 Resize Text

### Coherencia cromática
Paleta brand blue + gold amber relativamente coherente. Problemas:
- Mezcla de “dashboard cards” con muchos bordes/rounded en guest (ruido)
- Módulo alimentos “oculto/en preparación” sigue ocupando espacio mental en admin
- Tres productos visuales distintos (landing / PMS / checkout) sin design tokens compartidos

---

## Pilar 3 — Limpieza y código muerto

### LIM-01 · Monolito + base64 (eliminar del HTML)
Embebidos `window.SHADAI_LOGO`, `ROOM_*_FALLBACK`, `QR_WIFI_FALLBACK` (~2 MB). Deben ser archivos en `/img` con cache HTTP.

### LIM-02 · Service Worker desalineado
`sw.js` cachea `./css/styles.css`, `./js/app.js`, `./js/data-mock.js` — **no existen** en el deploy (monolito). Cache incompleto; comentarios mienten sobre arquitectura modular.

### LIM-03 · Código localhost / file:// en prod
L6941–6974: detección `file://` y llamadas a `localhost:3000`. Purgar.

### LIM-04 · Duplicación de claves storage
Check-out escribe `hospedaje_shadai_db` **y** `hospedaje_db`. PMS usa principalmente la primera. Residuos de migraciones (`shadai_v6_clean_disponibles`).

### LIM-05 · CDN Tailwind + Lucide latest
Reemplazar por build PostCSS/Vite + versión pinneada de iconos.

### LIM-06 · Landing 4.7 MB
Extraer imágenes; WebP/AVIF; lazy-loading.

### LIM-07 · UI que publica secretos
Bloque HTML L1173–1189 (“PIN Admin / PIN Limpieza”) — **borrar del producto**, no solo ocultar.

---

## Matriz de remediación priorizada

| ID | Severidad | Esfuerzo | Acción inmediata |
|---|---|---|---|
| SEC-01/02/03 | Crítica | Alto (backend) | Sacar de internet PINs; apagar paneles admin públicos o poner auth real |
| SEC-04 | Alta | Medio | Escapar DOM |
| ARCH-sync | Crítica ops | Alto | Un solo origen + API + DB |
| LIM-01/06 | Alta perf | Medio | Sacar base64 |
| A11Y-01 | Alta | Medio | ARIA + contraste thead + quitar no-zoom |
| SEC-06/07 | Media | Bajo | Headers Netlify + pin deps |

Parches listos en `/auditoria/remediacion/`.
