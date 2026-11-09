"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils";
import type { PettyCashEntry } from "@/lib/types";

type Props = {
  entries: PettyCashEntry[];
  balance: number;
  staffName: string;
  onAdd: (entry: Omit<PettyCashEntry, "id" | "created_at">) => Promise<void>;
};

export function PettyCashPanel({ entries, balance, staffName, onAdd }: Props) {
  const [type, setType] = useState<"ingreso" | "egreso">("egreso");
  const [category, setCategory] = useState("Insumos");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!description.trim() || !(value > 0)) return;
    setBusy(true);
    await onAdd({
      type,
      category,
      description: description.trim(),
      amount: value,
      created_by: staffName,
      sede: "Challhuahuacho",
    });
    setDescription("");
    setAmount("");
    setBusy(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <h3 className="font-display text-lg font-semibold">Nuevo movimiento</h3>
          <p className="text-xs text-[var(--text-muted)]">Caja chica · sede Challhuahuacho</p>
        </CardHeader>
        <CardBody>
          <form className="space-y-3" onSubmit={submit}>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={type === "ingreso" ? "primary" : "secondary"} onClick={() => setType("ingreso")}>
                Ingreso
              </Button>
              <Button type="button" variant={type === "egreso" ? "primary" : "secondary"} onClick={() => setType("egreso")}>
                Egreso
              </Button>
            </div>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categoría" required />
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" required />
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Monto"
              required
            />
            <Button type="submit" className="w-full" disabled={busy} aria-busy={busy}>
              Registrar
            </Button>
          </form>
          <p className="mt-4 text-sm font-semibold">
            Saldo actual: <span className="text-[var(--brand)]">{formatMoney(balance)}</span>
          </p>
        </CardBody>
      </Card>
      <div className="table-wrap">
        {entries.length === 0 ? (
          <div className="empty-state">Sin movimientos de caja chica</div>
        ) : (
          <table className="data">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td>{new Date(e.created_at).toLocaleString("es-PE")}</td>
                  <td>{e.type}</td>
                  <td>{e.category}</td>
                  <td>{e.description}</td>
                  <td>{formatMoney(e.amount)}</td>
                  <td>{e.created_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
