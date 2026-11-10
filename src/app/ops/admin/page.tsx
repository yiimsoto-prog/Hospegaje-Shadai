"use client";

import { useEffect, useState } from "react";
import { OpsShell } from "@/components/ops/ops-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Me = {
  role?: string | null;
  name?: string;
  email?: string;
  canBootstrap?: boolean;
  error?: string;
  message?: string;
};

const ROLES = [
  { id: "admin", label: "Administrador", desc: "ERP, liquidación, inventario, backoffice completo", tone: "brass" as const },
  { id: "receptionist", label: "Recepción", desc: "Check-in/out, rack y asignación de habitaciones", tone: "info" as const },
  { id: "supervisor", label: "Supervisor", desc: "Ocupación, reportes B2B y seguimiento de contratas", tone: "success" as const },
  { id: "housekeeping", label: "Housekeeping", desc: "Limpieza, liberación y tareas de aseo", tone: "warning" as const },
  { id: "security", label: "Seguridad", desc: "Auditoría de accesos y estado de alertas", tone: "danger" as const },
];

export default function AdminBackofficePage() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" })
      .then(async (r) => {
        const j = (await r.json()) as Me;
        setMe(j);
      })
      .catch(() => setMe({ error: "offline" }));
  }, []);

  const authed = Boolean(me?.role);

  return (
    <OpsShell
      title="Backoffice · roles y control"
      subtitle="Panel protegido para gestión de roles operativos (Administrador, Recepción, Supervisor, Seguridad). Autenticación staff + cookie HttpOnly; 2FA vía SSO Cursor o TOTP opcional."
    >
      <div className="mb-6 border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Sesión actual</p>
            <p className="font-display mt-1 text-2xl">
              {authed ? me?.name || me?.email || "Personal" : "Sin sesión staff"}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              {authed ? (
                <>
                  Rol activo: <Badge tone="brass">{me?.role}</Badge>
                </>
              ) : (
                me?.message || "Inicia sesión desde PMS → Admin"
              )}
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => (window.location.href = "/pms")}>
            Ir a PMS / login
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ROLES.map((r) => (
          <article key={r.id} className="border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-2xl">{r.label}</h2>
              <Badge tone={r.tone}>{r.id}</Badge>
            </div>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{r.desc}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[var(--text-faint)]">
              {r.id === "admin" || r.id === "housekeeping"
                ? "Persistido en staff_profiles"
                : "Mapa operativo UI → permisos admin/housekeeping en API"}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 border border-[var(--border)] bg-[var(--surface)] p-5">
        <h3 className="font-display text-xl">Controles de seguridad activos</h3>
        <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
          <li>· TLS/SSL y mitigación DDoS en Cloudflare</li>
          <li>· Sesión staff JWT HttpOnly (sin PINs en el navegador)</li>
          <li>· Validación de entradas y consultas parametrizadas / PostgREST</li>
          <li>· CSP + headers de seguridad en middleware</li>
          <li>· APIs con cache-control: private, no-store</li>
        </ul>
      </div>
    </OpsShell>
  );
}
