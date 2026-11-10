import { OpsShell } from "@/components/ops/ops-shell";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";

const rows = [
  {
    name: "TLS / SSL",
    status: "Activo",
    tone: "success" as const,
    detail: "HTTPS terminado en Cloudflare (workers.dev y dominio custom).",
  },
  {
    name: "DDoS / WAF",
    status: "Activo",
    tone: "success" as const,
    detail: "Mitigación perimetral Cloudflare. Active Rate Limiting en el dashboard del Worker.",
  },
  {
    name: "Inyección SQL",
    status: "Mitigado",
    tone: "success" as const,
    detail: "Consultas parametrizadas + validación + PostgREST/D1 bind.",
  },
  {
    name: "Auth staff + roles",
    status: "Activo",
    tone: "brass" as const,
    detail: "JWT HttpOnly o identidad Cursor; roles admin/housekeeping en API.",
  },
  {
    name: "2FA",
    status: "SSO + TOTP listo",
    tone: "info" as const,
    detail: "Primario: Cursor privada/team. TOTP opcional con STAFF_SESSION_SECRET.",
  },
  {
    name: "Privacidad",
    status: "Operativo",
    tone: "success" as const,
    detail: "Sin secretos en frontend; APIs no-store; CSP en middleware.",
  },
  {
    name: "Pasarela de pagos",
    status: "Adapter",
    tone: "warning" as const,
    detail: "PAYMENTS_PROVIDER + keys Culqi/MP como secretos del Worker.",
  },
  {
    name: "IoT / BLE locks",
    status: "Adapter",
    tone: "warning" as const,
    detail: "IOT_BRIDGE_URL y BLE_LOCK_PROVIDER para energía y acceso sin llaves.",
  },
];

export default function SecurityPage() {
  const active = rows.filter((r) => r.tone === "success").length;
  return (
    <OpsShell
      title="Seguridad & cumplimiento"
      subtitle="Controles edge + aplicación. Hardware IoT/BLE y PSP se acoplan por secretos sin exponer credenciales."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Controles verdes" value={`${active}/${rows.length}`} tone="ok" />
        <KpiCard label="Adapters pendientes" value="2" hint="Pagos · IoT/BLE" tone="warn" />
        <KpiCard label="CSP / Headers" value="ON" tone="brass" />
      </div>
      <div className="grid gap-3">
        {rows.map((r) => (
          <article key={r.name} className="border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl md:text-2xl">{r.name}</h2>
              <Badge tone={r.tone}>{r.status}</Badge>
            </div>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{r.detail}</p>
          </article>
        ))}
      </div>
    </OpsShell>
  );
}
