"use client";

import { useEffect, useMemo, useState } from "react";
import { OpsShell } from "@/components/ops/ops-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { INVENTORY_SEED, inventoryAlerts, inventoryValuation } from "@/lib/erp/inventory";
import type { LiquidationReport } from "@/lib/erp/liquidation";
import { formatMoney } from "@/lib/utils";

export default function ErpPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");
  const [report, setReport] = useState<LiquidationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inventory = INVENTORY_SEED;
  const alerts = inventoryAlerts(inventory);

  async function load() {
    setLoading(true);
    setError(null);
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    const res = await fetch(`/api/ops/liquidation?${q}`, { cache: "no-store", credentials: "same-origin" });
    const data = (await res.json()) as LiquidationReport & { message?: string; error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.message || data.error || "Requiere sesión admin");
      setReport(null);
      return;
    }
    setReport(data);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    if (!report) return [];
    const q = query.trim().toLowerCase();
    if (!q) return report.rows;
    return report.rows.filter(
      (r) => r.contrataName.toLowerCase().includes(q) || r.ruc.toLowerCase().includes(q)
    );
  }, [report, query]);

  function exportCsv() {
    if (!report) return;
    const lines = [
      ["Contrata", "RUC", "Noches", "Ocup%", "Subtotal", "IGV", "Total"].join(","),
      ...filteredRows.map((r) =>
        [r.contrataName, r.ruc, r.nights, r.occupancySharePct, r.subtotal, r.igv, r.total]
          .map((v) => `"${String(v).replaceAll('"', '""')}"`)
          .join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liquidacion-shadai-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <OpsShell
      title="ERP · inventarios y cuentas mineras"
      subtitle="Segmentación por contrata asociada a Las Bambas, liquidación con IGV, alertas de stock y exportación rápida."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Valor inventario" value={formatMoney(inventoryValuation(inventory))} />
        <KpiCard label="Alertas stock" value={String(alerts.length)} tone={alerts.length ? "warn" : "ok"} />
        <KpiCard
          label="Total liquidado"
          value={report ? formatMoney(report.totals.total) : "—"}
          hint={report ? `${report.totals.nights} noches` : undefined}
          tone="brass"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h2 className="font-display text-2xl">Inventario operativo</h2>
          </div>
          <div className="table-wrap border-0 rounded-none">
            <table className="data">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Ítem</th>
                  <th>Stock</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((i) => (
                  <tr key={i.id}>
                    <td>{i.sku}</td>
                    <td>
                      {i.name}
                      <div className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--text-faint)]">
                        {i.category}
                      </div>
                    </td>
                    <td>
                      {i.stock} {i.unit}
                    </td>
                    <td>
                      {i.stock <= i.minStock ? <Badge tone="warning">Bajo mínimo</Badge> : <Badge tone="success">OK</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h2 className="font-display text-2xl">Liquidación B2B por contrata</h2>
          </div>
          <div className="space-y-3 p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-sm">
                Desde
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
              </label>
              <label className="text-sm">
                Hasta
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
              </label>
            </div>
            <Input
              placeholder="Filtrar por contrata o RUC…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void load()} disabled={loading}>
                {loading ? "Generando…" : "Actualizar reporte"}
              </Button>
              <Button type="button" variant="secondary" onClick={exportCsv} disabled={!report}>
                Exportar CSV
              </Button>
            </div>
            {error ? <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p> : null}
          </div>
          <div className="table-wrap border-0 rounded-none border-t border-[var(--border)]">
            <table className="data">
              <thead>
                <tr>
                  <th>Contrata</th>
                  <th>RUC</th>
                  <th>Noches</th>
                  <th>Ocup.%</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.contrataName}>
                    <td>{r.contrataName}</td>
                    <td>{r.ruc}</td>
                    <td>{r.nights}</td>
                    <td>{r.occupancySharePct}%</td>
                    <td className="font-semibold">{formatMoney(r.total)}</td>
                  </tr>
                ))}
                {!filteredRows.length ? (
                  <tr>
                    <td colSpan={5} className="text-center text-[var(--text-muted)]">
                      Sin filas para el filtro actual
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </OpsShell>
  );
}
