"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";
import { Sparkline } from "@/components/ui/sparkline";
import { INVENTORY_SEED, inventoryAlerts, inventoryValuation } from "@/lib/erp/inventory";
import type { LiquidationReport } from "@/lib/erp/liquidation";
import type { DemandPoint } from "@/lib/ai/demand";
import { formatMoney } from "@/lib/utils";

type OpsTab = "resumen" | "erp" | "ai" | "mantenimiento" | "seguridad";

const TABS: { id: OpsTab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "erp", label: "ERP / B2B" },
  { id: "ai", label: "IA demanda" },
  { id: "mantenimiento", label: "Mantenimiento" },
  { id: "seguridad", label: "Seguridad" },
];

export function OpsHub() {
  const [tab, setTab] = useState<OpsTab>("resumen");
  const [overview, setOverview] = useState<{
    stats?: { rooms: number; occupied: number };
    liquidation?: { totals: { nights: number; total: number } };
    inventory?: { valuation: number; alerts: unknown[] };
    demand?: { occupancyPct: number; suggestedPriceConfort: number }[];
  } | null>(null);
  const [forecast, setForecast] = useState<DemandPoint[]>([]);
  const [report, setReport] = useState<LiquidationReport | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ops/overview", { cache: "no-store", credentials: "same-origin" })
      .then(async (r) => {
        const j = (await r.json()) as {
          message?: string;
          stats?: { rooms: number; occupied: number };
          liquidation?: { totals: { nights: number; total: number } };
          inventory?: { valuation: number; alerts: unknown[] };
          demand?: { occupancyPct: number; suggestedPriceConfort: number }[];
        };
        if (!r.ok) setError(j.message || "Algunas métricas requieren admin");
        setOverview(j);
      })
      .catch(() => setError("No se pudo cargar operaciones"));
    fetch("/api/ops/demand", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setForecast(((d as { forecast?: DemandPoint[] }).forecast) || []));
  }, []);

  async function loadLiquidation() {
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    const res = await fetch(`/api/ops/liquidation?${q}`, { cache: "no-store", credentials: "same-origin" });
    const data = (await res.json()) as LiquidationReport & { message?: string };
    if (!res.ok) {
      setError(data.message || "Requiere sesión admin");
      return;
    }
    setReport(data);
  }

  useEffect(() => {
    if (tab === "erp") void loadLiquidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const rooms = overview?.stats?.rooms ?? 0;
  const occupied = overview?.stats?.occupied ?? 0;
  const occPct = rooms ? Math.round((occupied / rooms) * 100) : 0;
  const demandSeries = (overview?.demand || forecast).map((d) => d.occupancyPct);
  const inventory = INVENTORY_SEED;
  const alerts = inventoryAlerts(inventory);
  const filteredRows = useMemo(() => {
    if (!report) return [];
    const q = query.trim().toLowerCase();
    if (!q) return report.rows;
    return report.rows.filter(
      (r) => r.contrataName.toLowerCase().includes(q) || r.ruc.toLowerCase().includes(q)
    );
  }, [report, query]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <p className="eyebrow">Operaciones · dentro del panel admin</p>
        <h2 className="font-display mt-2 text-3xl md:text-4xl">Centro operativo Las Bambas</h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--text-muted)]">
          ERP, IA, mantenimiento y seguridad viven aquí (app de personal), no en el sitio público del hotel.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Button
              key={t.id}
              size="sm"
              variant={tab === t.id ? "primary" : "secondary"}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-muted)]">
          {error}
        </p>
      ) : null}

      {tab === "resumen" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Ocupación" value={`${occPct}%`} hint={`${occupied}/${rooms}`} />
            <KpiCard label="Noches B2B" value={String(overview?.liquidation?.totals.nights ?? "—")} />
            <KpiCard
              label="Ingresos + IGV"
              value={overview?.liquidation ? formatMoney(overview.liquidation.totals.total) : "—"}
            />
            <KpiCard
              label="Inventario"
              value={overview?.inventory ? formatMoney(overview.inventory.valuation) : formatMoney(inventoryValuation(inventory))}
              hint={`${overview?.inventory?.alerts.length ?? alerts.length} alertas`}
              tone="warn"
            />
          </div>
          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">IA · 14 días</p>
                <h3 className="font-display mt-2 text-2xl">Proyección de ocupación</h3>
              </div>
              {demandSeries.length ? <Sparkline values={demandSeries} className="h-12 w-40" /> : null}
            </div>
          </div>
        </div>
      ) : null}

      {tab === "erp" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard label="Valor inventario" value={formatMoney(inventoryValuation(inventory))} />
            <KpiCard label="Alertas stock" value={String(alerts.length)} tone={alerts.length ? "warn" : "ok"} />
            <KpiCard label="Total liquidado" value={report ? formatMoney(report.totals.total) : "—"} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="max-w-[11rem]" />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="max-w-[11rem]" />
            <Input placeholder="Filtrar contrata/RUC" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button type="button" onClick={() => void loadLiquidation()}>
              Actualizar
            </Button>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Contrata</th>
                  <th>RUC</th>
                  <th>Noches</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.contrataName}>
                    <td>{r.contrataName}</td>
                    <td>{r.ruc}</td>
                    <td>{r.nights}</td>
                    <td>{formatMoney(r.total)}</td>
                  </tr>
                ))}
                {!filteredRows.length ? (
                  <tr>
                    <td colSpan={4} className="text-center text-[var(--text-muted)]">
                      Sin filas
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === "ai" ? (
        <div className="space-y-4">
          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <Sparkline values={forecast.map((d) => d.occupancyPct)} className="h-14 w-full" />
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Temporada</th>
                  <th>Ocupación</th>
                  <th>Confort</th>
                  <th>Estándar</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map((d) => (
                  <tr key={d.date}>
                    <td>{d.date}</td>
                    <td className="capitalize">{d.season}</td>
                    <td>{d.occupancyPct}%</td>
                    <td>{d.suggestedPriceConfort}</td>
                    <td>{d.suggestedPriceEstandar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === "mantenimiento" ? (
        <div className="space-y-3">
          {[
            ["WO-CAL-01", "Calentadores piso 1", "alta"],
            ["WO-BLE-02", "Cerraduras BLE piloto", "media"],
            ["WO-IOT-03", "Sensores energía", "baja"],
          ].map(([id, title, prio]) => (
            <div key={id} className="flex flex-wrap items-center justify-between gap-3 border border-[var(--border)] bg-[var(--surface)] p-4">
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-xs text-[var(--text-faint)]">{id}</p>
              </div>
              <Badge tone={prio === "alta" ? "danger" : prio === "media" ? "warning" : "info"}>{prio}</Badge>
            </div>
          ))}
          <p className="text-xs text-[var(--text-muted)]">
            IoT/BLE se conectan con secretos IOT_BRIDGE_URL y BLE_LOCK_PROVIDER.
          </p>
        </div>
      ) : null}

      {tab === "seguridad" ? (
        <div className="grid gap-3">
          {[
            ["TLS / SSL", "Activo"],
            ["DDoS / WAF Cloudflare", "Activo"],
            ["Auth staff JWT / Cursor", "Activo"],
            ["CSP + no-store APIs", "Activo"],
            ["Pagos / IoT adapters", "Pendiente de secretos"],
          ].map(([name, status]) => (
            <div key={name} className="flex items-center justify-between border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="font-semibold">{name}</p>
              <Badge tone={status.startsWith("Activo") ? "success" : "warning"}>{status}</Badge>
            </div>
          ))}
          <Link href="/guest/checkin" className="text-sm font-semibold underline">
            Check-in digital (también en portal)
          </Link>
        </div>
      ) : null}
    </div>
  );
}
