"use client";

import { useMemo } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import type { Pernocta } from "@/lib/types";

export function B2BPanel({ pernoctas }: { pernoctas: Pernocta[] }) {
  const byContrata = useMemo(() => {
    const map = new Map<string, { noches: number; subtotal: number }>();
    for (const p of pernoctas) {
      const key = p.contrata_name || "Particular / sin contrata";
      const cur = map.get(key) || { noches: 0, subtotal: 0 };
      cur.noches += 1;
      cur.subtotal += p.tariff;
      map.set(key, cur);
    }
    return [...map.entries()].map(([name, v]) => ({
      name,
      ...v,
      igv: v.subtotal * 0.18,
      total: v.subtotal * 1.18,
    }));
  }, [pernoctas]);

  const totals = byContrata.reduce(
    (acc, row) => ({
      noches: acc.noches + row.noches,
      subtotal: acc.subtotal + row.subtotal,
      total: acc.total + row.total,
    }),
    { noches: 0, subtotal: 0, total: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase text-[var(--text-faint)]">Noches validadas</p>
            <p className="font-display text-3xl font-semibold">{totals.noches}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase text-[var(--text-faint)]">Subtotal</p>
            <p className="font-display text-3xl font-semibold">{formatMoney(totals.subtotal)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase text-[var(--text-faint)]">Total c/ IGV</p>
            <p className="font-display text-3xl font-semibold">{formatMoney(totals.total)}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-display text-lg font-semibold">Resumen por contrata</h3>
        </CardHeader>
        <CardBody className="p-0">
          {byContrata.length === 0 ? (
            <div className="empty-state m-4">Sin pernoctas validadas aún. Use Check-out móvil tras un check-in.</div>
          ) : (
            <div className="table-wrap border-0 rounded-none">
              <table className="data">
                <thead>
                  <tr>
                    <th>Contrata</th>
                    <th>Noches</th>
                    <th>Subtotal</th>
                    <th>IGV 18%</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {byContrata.map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>{row.noches}</td>
                      <td>{formatMoney(row.subtotal)}</td>
                      <td>{formatMoney(row.igv)}</td>
                      <td>{formatMoney(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-display text-lg font-semibold">Padrón de auditoría noche a noche</h3>
        </CardHeader>
        <CardBody className="p-0">
          {pernoctas.length === 0 ? (
            <div className="empty-state m-4">Sin tickets de auditoría</div>
          ) : (
            <div className="table-wrap border-0 rounded-none">
              <table className="data">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Hab.</th>
                    <th>DNI</th>
                    <th>Trabajador</th>
                    <th>Contrata</th>
                    <th>Salida</th>
                    <th>Tarifa</th>
                  </tr>
                </thead>
                <tbody>
                  {pernoctas.map((p) => (
                    <tr key={p.id}>
                      <td>{p.ticket}</td>
                      <td>{p.room_number}</td>
                      <td>{p.dni}</td>
                      <td>{p.worker_name}</td>
                      <td>{p.contrata_name || "—"}</td>
                      <td>{new Date(p.checkout_at).toLocaleString("es-PE")}</td>
                      <td>{formatMoney(p.tariff)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
