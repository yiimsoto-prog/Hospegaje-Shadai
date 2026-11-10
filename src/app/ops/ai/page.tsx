"use client";

import { useEffect, useMemo, useState } from "react";
import { OpsShell } from "@/components/ops/ops-shell";
import { KpiCard } from "@/components/ui/kpi-card";
import { Sparkline } from "@/components/ui/sparkline";
import type { DemandPoint } from "@/lib/ai/demand";

export default function AiDemandPage() {
  const [forecast, setForecast] = useState<DemandPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ops/demand", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setForecast(((d as { forecast?: DemandPoint[] }).forecast) || []))
      .catch(() => setError("No se pudo cargar la proyección"));
  }, []);

  const avgOcc = useMemo(() => {
    if (!forecast.length) return 0;
    return Math.round(forecast.reduce((a, b) => a + b.occupancyPct, 0) / forecast.length);
  }, [forecast]);

  const peak = useMemo(
    () => forecast.reduce((m, d) => (d.occupancyPct > m.occupancyPct ? d : m), forecast[0] || { occupancyPct: 0, date: "—" }),
    [forecast]
  );

  return (
    <OpsShell
      title="IA predictiva · demanda minera"
      subtitle="Proyección 14 días según temporada, tendencia de pernoctas y flujos típicos de operación Las Bambas / paradas de planta."
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Ocupación media 14d" value={`${avgOcc}%`} tone="brass" />
        <KpiCard label="Pico proyectado" value={`${peak?.occupancyPct ?? 0}%`} hint={peak?.date} tone="ok" />
        <div className="border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
            Serie ocupación
          </p>
          <Sparkline values={forecast.map((d) => d.occupancyPct)} className="mt-3 h-14 w-full" />
        </div>
      </div>

      <div className="overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h2 className="font-display text-2xl">Tarifas dinámicas sugeridas</h2>
        </div>
        <div className="table-wrap border-0 rounded-none">
          <table className="data">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Temporada</th>
                <th>Noches</th>
                <th>Ocupación</th>
                <th>Confort S/</th>
                <th>Estándar S/</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td className="capitalize">{d.season}</td>
                  <td>{d.nights}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-16 overflow-hidden bg-[var(--surface-2)]">
                        <span
                          className="block h-full bg-[var(--brass)]"
                          style={{ width: `${Math.min(d.occupancyPct, 100)}%` }}
                        />
                      </span>
                      {d.occupancyPct}%
                    </div>
                  </td>
                  <td>{d.suggestedPriceConfort}</td>
                  <td>{d.suggestedPriceEstandar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </OpsShell>
  );
}
