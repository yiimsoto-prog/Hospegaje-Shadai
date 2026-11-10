"use client";

import { useEffect, useState } from "react";
import { OpsShell } from "@/components/ops/ops-shell";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { INVENTORY_SEED, inventoryAlerts, inventoryValuation } from "@/lib/erp/inventory";
import type { LiquidationReport } from "@/lib/erp/liquidation";
import { formatMoney } from "@/lib/utils";

export default function ErpPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
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
    const res = await fetch(`/api/ops/liquidation?${q}`, { cache: "no-store" });
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

  return (
    <OpsShell
      title="ERP · Inventario y liquidación B2B"
      subtitle="Control de stock operativo y reportes parametrizados de ingresos/ocupación/facturación por contrata minera."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">Inventario</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-sm text-[var(--text-muted)]">
              Valoración: <strong>{formatMoney(inventoryValuation(inventory))}</strong> · Alertas bajo mínimo:{" "}
              <strong>{alerts.length}</strong>
            </p>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Ítem</th>
                    <th>Stock</th>
                    <th>Mín</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((i) => (
                    <tr key={i.id} className={i.stock <= i.minStock ? "bg-amber-50 dark:bg-amber-950/30" : ""}>
                      <td>{i.sku}</td>
                      <td>{i.name}</td>
                      <td>
                        {i.stock} {i.unit}
                      </td>
                      <td>{i.minStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">Liquidación por cliente</h2>
          </CardHeader>
          <CardBody className="space-y-3">
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
            <Button type="button" onClick={() => void load()} disabled={loading}>
              {loading ? "Generando…" : "Generar reporte"}
            </Button>
            {error ? <p className="text-sm text-amber-700 dark:text-amber-300">{error}</p> : null}
            {report ? (
              <>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs uppercase text-[var(--text-faint)]">Noches</p>
                    <p className="font-display text-2xl font-semibold">{report.totals.nights}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-[var(--text-faint)]">Subtotal</p>
                    <p className="font-display text-2xl font-semibold">{formatMoney(report.totals.subtotal)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-[var(--text-faint)]">Total + IGV</p>
                    <p className="font-display text-2xl font-semibold">{formatMoney(report.totals.total)}</p>
                  </div>
                </div>
                <div className="table-wrap">
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
                      {report.rows.map((r) => (
                        <tr key={r.contrataName}>
                          <td>{r.contrataName}</td>
                          <td>{r.ruc}</td>
                          <td>{r.nights}</td>
                          <td>{r.occupancySharePct}%</td>
                          <td>{formatMoney(r.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </OpsShell>
  );
}
