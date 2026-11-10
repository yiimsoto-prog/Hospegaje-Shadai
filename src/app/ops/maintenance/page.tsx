"use client";

import { useMemo, useState } from "react";
import { OpsShell } from "@/components/ops/ops-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";

type WorkOrder = {
  id: string;
  asset: string;
  title: string;
  priority: "alta" | "media" | "baja";
  status: "abierta" | "programada" | "cerrada";
  due: string;
};

const SEED: WorkOrder[] = [
  {
    id: "WO-CAL-01",
    asset: "Calentadores piso 1",
    title: "Flush preventivo filtros",
    priority: "alta",
    status: "programada",
    due: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
  },
  {
    id: "WO-BLE-02",
    asset: "Cerraduras BLE (piloto)",
    title: "Firmware + batería habitaciones 101-110",
    priority: "media",
    status: "abierta",
    due: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
  },
  {
    id: "WO-IOT-03",
    asset: "Sensores energía",
    title: "Umbral kWh nocturno / domótica",
    priority: "baja",
    status: "abierta",
    due: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
  },
];

const priorityTone = {
  alta: "danger" as const,
  media: "warning" as const,
  baja: "info" as const,
};

export default function MaintenancePage() {
  const [orders, setOrders] = useState(SEED);
  const [title, setTitle] = useState("");
  const [asset, setAsset] = useState("");

  const openCount = useMemo(() => orders.filter((o) => o.status !== "cerrada").length, [orders]);
  const high = useMemo(() => orders.filter((o) => o.priority === "alta" && o.status !== "cerrada").length, [orders]);

  function addOrder() {
    if (!title.trim() || !asset.trim()) return;
    setOrders((prev) => [
      {
        id: `WO-${Date.now().toString(36).toUpperCase()}`,
        asset: asset.trim(),
        title: title.trim(),
        priority: "media",
        status: "abierta",
        due: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setTitle("");
    setAsset("");
  }

  return (
    <OpsShell
      title="Mantenimiento & IoT"
      subtitle="Órdenes preventivas con prioridad visual. Domótica/BLE se conectan vía IOT_BRIDGE_URL y BLE_LOCK_PROVIDER."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Órdenes abiertas" value={String(openCount)} />
        <KpiCard label="Prioridad alta" value={String(high)} tone={high ? "danger" : "ok"} />
        <KpiCard label="Bridges" value="Adapter" hint="IoT / BLE pendientes de secreto" tone="warn" />
      </div>

      <div className="mb-4 flex flex-col gap-2 border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row">
        <Input placeholder="Activo (ej. Hab 204 calefactor)" value={asset} onChange={(e) => setAsset(e.target.value)} />
        <Input placeholder="Trabajo" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button type="button" onClick={addOrder}>
          Crear orden
        </Button>
      </div>

      <div className="overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <div className="table-wrap border-0 rounded-none">
          <table className="data">
            <thead>
              <tr>
                <th>ID</th>
                <th>Activo</th>
                <th>Trabajo</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Vence</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.asset}</td>
                  <td>{o.title}</td>
                  <td>
                    <Badge tone={priorityTone[o.priority]}>{o.priority}</Badge>
                  </td>
                  <td>{o.status}</td>
                  <td>{o.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </OpsShell>
  );
}
