"use client";

import { useMemo, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import type { Pernocta } from "@/lib/types";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function B2BPanel({ pernoctas }: { pernoctas: Pernocta[] }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const filtered = useMemo(
    () =>
      pernoctas.filter((p) => {
        const d = new Date(p.checkout_at);
        return d.getMonth() === month && d.getFullYear() === year;
      }),
    [pernoctas, month, year]
  );

  const byContrata = useMemo(() => {
    const map = new Map<string, { noches: number; subtotal: number }>();
    for (const p of filtered) {
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
  }, [filtered]);

  const totals = byContrata.reduce(
    (acc, row) => ({
      noches: acc.noches + row.noches,
      subtotal: acc.subtotal + row.subtotal,
      total: acc.total + row.total,
      empresas: acc.empresas + 1,
    }),
    { noches: 0, subtotal: 0, total: 0, empresas: 0 }
  );

  function exportExcel() {
    const lines = [
      ["Contrata", "Noches", "Subtotal", "IGV", "Total"].join("\t"),
      ...byContrata.map((r) => [r.name, r.noches, r.subtotal, r.igv, r.total].join("\t")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liquidacion-bambas-${year}-${month + 1}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1f3a] to-[#16375f] p-5 text-white shadow-[var(--shadow-soft)] md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-amber-300">
              Módulo B2B & auditoría contratas
            </p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Cierre de mes y liquidación Las Bambas</h2>
            <p className="mt-2 max-w-2xl text-sm text-sky-100">
              Control de pernoctas validadas con check-out móvil para facturación a contratas.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="h-10 rounded-xl border border-white/20 bg-white/10 px-3 text-sm"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i} className="text-slate-900">
                  {m}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-xl border border-white/20 bg-white/10 px-3 text-sm"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y} className="text-slate-900">
                  {y}
                </option>
              ))}
            </select>
            <Button type="button" className="bg-emerald-600 hover:bg-emerald-500" onClick={exportExcel}>
              <Download className="h-4 w-4" /> Descargar Excel (.xls)
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="border-white/20 bg-white/10 text-white"
              onClick={() => alert("Importe una nómina CSV desde su ERP de contratas (próximo).")}
            >
              <Upload className="h-4 w-4" /> Importar nómina
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Noches validadas", String(totals.noches), "✓ Vía check-out QR", "text-emerald-300"],
            ["Subtotal (sin IGV)", formatMoney(totals.subtotal), "Base imponible", "text-slate-300"],
            ["Total facturable (c/ IGV)", formatMoney(totals.total), "Para cobro a contratas", "text-amber-300"],
            ["Empresas contratas", String(totals.empresas), "Operando en Las Bambas", "text-slate-300"],
          ].map(([label, value, hint, hintClass]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-300">{label}</p>
              <p className="mt-2 font-display text-3xl">{value}</p>
              <p className={`mt-1 text-xs ${hintClass}`}>{hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h3 className="font-display text-xl">Resumen por contrata</h3>
        </div>
        {byContrata.length === 0 ? (
          <div className="empty-state m-4">Sin pernoctas validadas en el periodo. Use check-out móvil tras un check-in.</div>
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
                    <td className="font-semibold">{formatMoney(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h3 className="font-display text-xl">Padrón de auditoría noche a noche</h3>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state m-4">Sin tickets de auditoría en {MONTHS[month]} {year}</div>
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
                {filtered.map((p) => (
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
      </div>
    </div>
  );
}
