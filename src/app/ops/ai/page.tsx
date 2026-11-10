"use client";

import { useEffect, useState } from "react";
import { OpsShell } from "@/components/ops/ops-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
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

  return (
    <OpsShell
      title="IA predictiva · demanda y precios"
      subtitle="Proyección de ocupación 14 días y tarifas dinámicas según temporada minera y tendencia reciente."
    >
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">Forecast operativo</h2>
        </CardHeader>
        <CardBody className="p-0">
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
                    <td>{d.occupancyPct}%</td>
                    <td>{d.suggestedPriceConfort}</td>
                    <td>{d.suggestedPriceEstandar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </OpsShell>
  );
}
