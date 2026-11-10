"use client";

import { useMemo, useState } from "react";
import { OpsShell } from "@/components/ops/ops-shell";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
    title: "Firmware check + batería",
    priority: "media",
    status: "abierta",
    due: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
  },
  {
    id: "WO-IOT-03",
    asset: "Sensores energía",
    title: "Calibrar umbral kWh nocturno",
    priority: "baja",
    status: "abierta",
    due: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
  },
];

export default function MaintenancePage() {
  const [orders, setOrders] = useState(SEED);
  const [title, setTitle] = useState("");
  const [asset, setAsset] = useState("");

  const openCount = useMemo(
    () => orders.filter((o) => o.status !== "cerrada").length,
    [orders]
  );

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
      title="Mantenimiento preventivo"
      subtitle="Órdenes automatizadas para agua caliente, energía IoT y acceso BLE. Domótica/cerraduras se conectan vía bridge cuando configure el proveedor."
    >
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        Órdenes abiertas/programadas: <strong>{openCount}</strong>
      </p>
      <Card className="mb-4">
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">Nueva orden</h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-2 sm:flex-row">
          <Input placeholder="Activo (ej. Hab 204 calefactor)" value={asset} onChange={(e) => setAsset(e.target.value)} />
          <Input placeholder="Trabajo" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button type="button" onClick={addOrder}>
            Crear
          </Button>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="p-0">
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
                    <td>{o.priority}</td>
                    <td>{o.status}</td>
                    <td>{o.due}</td>
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
