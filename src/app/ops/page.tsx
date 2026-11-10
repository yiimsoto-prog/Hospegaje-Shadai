"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OpsShell } from "@/components/ops/ops-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";

type Overview = {
  mode: string;
  stats?: { rooms: number; occupied: number; cleaning: number; maintenance: number };
  rooms?: number;
  occupied?: number;
  liquidation?: { totals: { nights: number; total: number } };
  inventory?: { valuation: number; alerts: unknown[] };
  demand?: { occupancyPct: number; suggestedPriceConfort: number }[];
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
  const demand = data?.demand?.[0] || data?.demandPreview?.[0];

  return (
    <OpsShell
      title="Centro de operaciones"
      subtitle="ERP, liquidación minera, IA de demanda, mantenimiento y seguridad en un solo panel."
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Habitaciones", String(rooms)],
          ["Ocupadas", String(occupied)],
          ["Noches B2B", String(data?.liquidation?.totals.nights ?? "—")],
          ["Inventario", data?.inventory ? formatMoney(data.inventory.valuation) : "—"],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardBody>
              <p className="text-xs font-semibold uppercase text-[var(--text-faint)]">{label}</p>
              <p className="font-display text-3xl font-semibold">{value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">Próxima demanda (IA)</h2>
          </CardHeader>
          <CardBody>
            {demand ? (
              <p className="text-sm text-[var(--text-muted)]">
                Ocupación proyectada mañana: <strong>{demand.occupancyPct}%</strong>
                {"suggestedPriceConfort" in demand ? (
                  <>
                    {" "}
                    · tarifa confort sugerida S/ {(demand as { suggestedPriceConfort: number }).suggestedPriceConfort}
                  </>
                ) : null}
              </p>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">Cargando proyección…</p>
            )}
            <Link href="/ops/ai" className="mt-3 inline-block text-sm font-bold text-[var(--brand)]">
              Ver 14 días →
            </Link>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">Módulos del ecosistema</h2>
          </CardHeader>
          <CardBody className="grid gap-2 text-sm">
            <Link href="/ops/erp" className="font-semibold text-[var(--brand)]">
              ERP · inventarios y liquidación por contrata
            </Link>
            <Link href="/guest/checkin" className="font-semibold text-[var(--brand)]">
              Check-in digital con firma
            </Link>
            <Link href="/concierge" className="font-semibold text-[var(--brand)]">
              Conserje virtual 24/7
            </Link>
            <Link href="/ops/security" className="font-semibold text-[var(--brand)]">
              Ciberseguridad e integraciones (pagos / IoT / BLE)
            </Link>
          </CardBody>
        </Card>
      </div>
    </OpsShell>
  );
}
