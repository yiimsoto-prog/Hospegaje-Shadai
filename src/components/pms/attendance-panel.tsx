"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AttendanceRecord } from "@/lib/types";

type Props = {
  records: AttendanceRecord[];
  onAdd: (entry: Omit<AttendanceRecord, "id" | "recorded_at">) => Promise<void>;
};

export function AttendancePanel({ records, onAdd }: Props) {
  const [staffName, setStaffName] = useState("");
  const [role, setRole] = useState("Recepción");
  const [type, setType] = useState<"entrada" | "salida">("entrada");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!staffName.trim()) return;
    setBusy(true);
    await onAdd({
      staff_name: staffName.trim(),
      role,
      type,
      note: note.trim(),
      sede: "Challhuahuacho",
    });
    setNote("");
    setBusy(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <h3 className="font-display text-lg font-semibold">Marcar asistencia</h3>
          <p className="text-xs text-[var(--text-muted)]">Control de personal por sede</p>
        </CardHeader>
        <CardBody>
          <form className="space-y-3" onSubmit={submit}>
            <Input value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Nombre del personal" required />
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Rol / área" required />
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={type === "entrada" ? "primary" : "secondary"} onClick={() => setType("entrada")}>
                Entrada
              </Button>
              <Button type="button" variant={type === "salida" ? "primary" : "secondary"} onClick={() => setType("salida")}>
                Salida
              </Button>
            </div>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota (opcional)" />
            <Button type="submit" className="w-full" disabled={busy} aria-busy={busy}>
              Registrar marca
            </Button>
          </form>
        </CardBody>
      </Card>
      <div className="table-wrap">
        {records.length === 0 ? (
          <div className="empty-state">Aún no hay marcas de asistencia</div>
        ) : (
          <table className="data">
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>Personal</th>
                <th>Rol</th>
                <th>Tipo</th>
                <th>Nota</th>
                <th>Sede</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.recorded_at).toLocaleString("es-PE")}</td>
                  <td>{r.staff_name}</td>
                  <td>{r.role}</td>
                  <td>{r.type}</td>
                  <td>{r.note || "—"}</td>
                  <td>{r.sede}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
