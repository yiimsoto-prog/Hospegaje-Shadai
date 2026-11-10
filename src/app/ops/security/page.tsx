import { OpsShell } from "@/components/ops/ops-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

const rows = [
  {
    name: "TLS / SSL",
    status: "Activo",
    detail: "Terminado en Cloudflare (HTTPS obligatorio en workers.dev y dominios custom).",
  },
  {
    name: "DDoS / WAF",
    status: "Activo",
    detail: "Mitigación perimetral Cloudflare. Active Rate Limiting/WAF rules en el dashboard del Worker.",
  },
  {
    name: "Inyección SQL",
    status: "Mitigado",
    detail: "Consultas parametrizadas + validación de entrada + PostgREST/D1 bind (sin SQL concatenado).",
  },
  {
    name: "Auth staff + roles",
    status: "Activo",
    detail: "Identidad Cursor verificada en servidor; roles admin/housekeeping; panel PMS restringido.",
  },
  {
    name: "2FA",
    status: "SSO + TOTP listo",
    detail: "Primario: acceso privado/team Cursor. TOTP opcional por perfil (activar con secreto TOTP_ISSUER).",
  },
  {
    name: "Privacidad de datos",
    status: "Política operativa",
    detail: "Sin Wi‑Fi/PINs en el frontend; secretos solo en Worker Secrets; APIs no-store.",
  },
  {
    name: "Pasarela de pagos",
    status: "Adapter",
    detail: "Configure PAYMENTS_PROVIDER + keys Culqi/Mercado Pago como secretos. No se procesan tarjetas en el browser.",
  },
  {
    name: "IoT energía / BLE locks",
    status: "Adapter",
    detail: "IOT_BRIDGE_URL y BLE_LOCK_PROVIDER conectan el módulo de mantenimiento y acceso sin llaves.",
  },
];

export default function SecurityPage() {
  return (
    <OpsShell
      title="Ciberseguridad e integraciones"
      subtitle="Controles edge + aplicación. Hardware IoT/BLE y PSP se acoplan por secretos sin exponer credenciales."
    >
      <div className="grid gap-3">
        {rows.map((r) => (
          <Card key={r.name}>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">{r.name}</h2>
              <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {r.status}
              </span>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-[var(--text-muted)]">{r.detail}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </OpsShell>
  );
}
