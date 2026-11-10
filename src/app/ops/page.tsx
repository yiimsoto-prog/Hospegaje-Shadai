"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OpsShell } from "@/components/ops/ops-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { Sparkline } from "@/components/ui/sparkline";
import { formatMoney } from "@/lib/utils";

type Overview = {
  mode: string;
  stats?: { rooms: number; occupied: number; cleaning: number; maintenance: number };
  rooms?: number;
  occupied?: number;
  liquidation?: { totals: { nights: number; total: number; subtotal: number } };
  inventory?: { valuation: number; alerts: unknown[] };
  demand?: { occupancyPct: number; suggestedPriceConfort: number; nights: number }[];
  demandPreview?: { occupancyPct: number }[];
};

export default function OpsHomePage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ops/overview", { cache: "no-store" })
      .then(async (r) => {
        const j = (await r.json()) as Overview & { error?: string };
        if (!r.ok && j.error) throw new Error(j.error);
        setData(j);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, []);

  const occupied = data?.stats?.occupied ?? data?.occupied ?? 0;
  const rooms = data?.stats?.rooms ?? data?.rooms ?? 0;
  const occPct = rooms ? Math.round((occupied / rooms) * 100) : 0;
  const demandSeries = (data?.demand || []).map((d) => d.occupancyPct);
  const tomorrow = data?.demand?.[0] || data?.demandPreview?.[0];

  return (
    <OpsShell
      title="Dashboard ejecutivo"
      subtitle="KPIs de ocupación, liquidación B2B minera e inventario para operación Las Bambas / Challhuahuacho."
    >
      {error ? (
        <p className="mb-4 border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
          {error} — algunas métricas requieren sesión admin.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Ocupación actual" value={`${occPct}%`} hint={`${occupied} de ${rooms} habitaciones`} tone="brass" />
        <KpiCard
          label="Noches B2B"
          value={String(data?.liquidation?.totals.nights ?? "—")}
          hint="Pernoctas validadas"
          tone="ok"
        />
        <KpiCard
          label="Ingresos + IGV"
          value={data?.liquidation ? formatMoney(data.liquidation.totals.total) : "—"}
          hint="Liquidación acumulada"
        />
        <KpiCard
          label="Inventario"
          value={data?.inventory ? formatMoney(data.inventory.valuation) : "—"}
          hint={`${data?.inventory?.alerts.length ?? 0} alertas de stock`}
          tone={data?.inventory?.alerts.length ? "warn" : "default"}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">IA · próximos 14 días</p>
              <h2 className="font-display mt-2 text-2xl">Proyección de ocupación</h2>
            </div>
            {demandSeries.length ? <Sparkline values={demandSeries} className="h-12 w-40" /> : null}
          </div>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            {tomorrow
              ? `Mañana ≈ ${tomorrow.occupancyPct}% ocupación${
                  "suggestedPriceConfort" in tomorrow
                    ? ` · tarifa confort sugerida S/ ${(tomorrow as { suggestedPriceConfort: number }).suggestedPriceConfort}`
                    : ""
                }`
              : "Cargando proyección…"}
          </p>
          <Link href="/ops/ai" className="mt-4 inline-block text-sm font-bold text-[var(--brass)]">
            Abrir panel IA →
          </Link>
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="eyebrow">Accesos rápidos</p>
          <div className="mt-4 grid gap-2">
            {[
              ["/ops/erp", "ERP · inventarios y liquidación por contrata"],
              ["/ops/admin", "Backoffice · roles y auditoría"],
              ["/guest/checkin", "Check-in digital con firma"],
              ["/concierge", "Conserje virtual 24/7"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="flex h-11 items-center justify-between border border-[var(--border)] px-3 text-sm font-semibold transition hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
              >
                <span>{label}</span>
                <span aria-hidden>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </OpsShell>
  );
}
