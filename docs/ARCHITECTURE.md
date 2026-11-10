# Arquitectura — Hospedaje Shadai (ecosistema ops)

## Capas

| Capa | Tecnología |
|---|---|
| Edge / TLS / DDoS | Cloudflare Workers + WAF |
| App | Next.js App Router (OpenNext) |
| Datos | D1 **o** Supabase PostgREST (service role) |
| Auth staff | Cursor App Identity + `staff_profiles` roles |
| ERP / IA | Módulos `src/lib/erp/*`, `src/lib/ai/*` |

## Módulos entregados

- **PMS** `/pms` — rack, HK, caja, asistencia, B2B básico
- **Ops hub** `/ops` — resumen ejecutivo
- **ERP** `/ops/erp` — inventario + liquidación parametrizada por contrata
- **IA demanda** `/ops/ai` — forecast 14d + precios dinámicos
- **Check-in digital** `/guest/checkin` — DNI + firma
- **Check-out móvil** `/checkout` — validación DNI
- **Conserje IA** `/concierge` — FAQ operativo 24/7
- **Mantenimiento** `/ops/maintenance` — órdenes preventivas (IoT/BLE adapters)
- **Seguridad** `/ops/security` — estado de controles e integraciones

## Integraciones por secreto (no hardcode)

- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
- `PAYMENTS_PROVIDER` + keys PSP (Culqi/MP)
- `IOT_BRIDGE_URL`, `BLE_LOCK_PROVIDER`
- `NEXT_PUBLIC_SITE_URL` para sitemap canónico

## Seguridad

- HTTPS en Cloudflare
- Middleware: CSP, nosniff, frame deny, no-store en `/api`
- Validación de DNI/RUC/montos en `src/lib/security/validate.ts`
- Consultas parametrizadas / PostgREST (sin concatenar SQL de usuario)
