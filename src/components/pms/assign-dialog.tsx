"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Contrata } from "@/lib/types";

type Props = {
  open: boolean;
  roomNumber: string | null;
  contratas: Contrata[];
  onClose: () => void;
  onSubmit: (data: {
    workerName: string;
    dni: string;
    contrataId?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
};

export function AssignDialog({ open, roomNumber, contratas, onClose, onSubmit }: Props) {
  const [workerName, setWorkerName] = useState("");
  const [dni, setDni] = useState("");
  const [contrataId, setContrataId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setWorkerName("");
    setDni("");
    setContrataId("");
    setError(null);
  }, [open, roomNumber]);

  if (!open || !roomNumber) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await onSubmit({
      workerName,
      dni,
      contrataId: contrataId || undefined,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error || "No se pudo asignar");
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-title"
        className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
      >
        <h2 id="assign-title" className="font-display text-xl font-semibold">
          Check-in exprés · Hab. {roomNumber}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Asigna guardia minera. El trabajador podrá marcar salida diaria desde Check-out móvil.
        </p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-semibold" htmlFor="worker-name">
              Nombre del trabajador
            </label>
            <Input id="worker-name" value={workerName} onChange={(e) => setWorkerName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold" htmlFor="worker-dni">
              DNI (8 dígitos)
            </label>
            <Input
              id="worker-dni"
              inputMode="numeric"
              pattern="\d{8}"
              maxLength={8}
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold" htmlFor="contrata">
              Empresa contrata
            </label>
            <select
              id="contrata"
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
              value={contrataId}
              onChange={(e) => setContrataId(e.target.value)}
            >
              <option value="">Sin contrata / particular</option>
              {contratas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.razon_social}
                </option>
              ))}
            </select>
          </div>
          {error ? (
            <p role="alert" className="text-xs font-semibold text-[var(--danger)]">
              {error}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={busy} aria-busy={busy}>
              Asignar habitación
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
