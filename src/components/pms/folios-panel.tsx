"use client";

import { formatMoney } from "@/lib/utils";
import type { Room } from "@/lib/types";

export function FoliosPanel({ rooms }: { rooms: Room[] }) {
  const occupied = rooms.filter((r) => r.assignment);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-3xl">Cuentas y folios de huéspedes</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Seguimiento de consumos, pagos y saldo pendiente por habitación ocupada.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <div className="table-wrap border-0 rounded-none">
          <table className="data">
            <thead>
              <tr>
                <th>Habitación</th>
                <th>Huésped titular</th>
                <th>Estadía</th>
                <th>Total cargos</th>
                <th>Pagado</th>
                <th>Saldo pendiente</th>
              </tr>
            </thead>
            <tbody>
              {occupied.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-[var(--text-muted)]">
                    No hay huéspedes en curso
                  </td>
                </tr>
              ) : (
                occupied.map((r) => {
                  const nights = 1;
                  const charges = r.price_per_night * nights;
                  return (
                    <tr key={r.id}>
                      <td>{r.number}</td>
                      <td>
                        <div className="font-semibold">{r.assignment?.workerName}</div>
                        <div className="text-xs text-[var(--text-muted)]">DNI {r.assignment?.dni}</div>
                      </td>
                      <td>
                        Desde {r.assignment?.assignedAt ? new Date(r.assignment.assignedAt).toLocaleDateString("es-PE") : "—"}
                      </td>
                      <td>{formatMoney(charges)}</td>
                      <td>{formatMoney(0)}</td>
                      <td className="font-semibold text-rose-700 dark:text-rose-300">{formatMoney(charges)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function GuestBookPanel({ rooms }: { rooms: Room[] }) {
  const rows = rooms
    .filter((r) => r.assignment)
    .map((r) => ({
      room: r.number,
      name: r.assignment!.workerName,
      dni: r.assignment!.dni,
      contrata: r.assignment!.contrataName || "Particular",
      in: r.assignment!.assignedAt,
    }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-3xl">Libro de huéspedes</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Registro activo de trabajadores alojados.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <div className="table-wrap border-0 rounded-none">
          <table className="data">
            <thead>
              <tr>
                <th>Hab.</th>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Contrata</th>
                <th>Ingreso</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-[var(--text-muted)]">
                    Libro vacío
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={`${r.room}-${r.dni}`}>
                    <td>{r.room}</td>
                    <td>{r.name}</td>
                    <td>{r.dni}</td>
                    <td>{r.contrata}</td>
                    <td>{new Date(r.in).toLocaleString("es-PE")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
