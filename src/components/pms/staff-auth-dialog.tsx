"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { StaffRole } from "@/lib/types";

type Props = {
  open: boolean;
  targetRole: Exclude<StaffRole, "guest">;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<boolean>;
};

export function StaffAuthDialog({ open, targetRole, onClose, onSubmit }: Props) {
  const titleId = useId();
  const descId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const supabase = isSupabaseConfigured();

  useEffect(() => {
    if (!open) return;
    setPin("");
    setError(null);
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open, targetRole]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const ok = await onSubmit(pin);
      if (!ok) {
        setError(
          supabase
            ? "Con Supabase activo debe usar Auth de personal (email). El PIN demo está deshabilitado."
            : "PIN incorrecto. En modo muestra use demo-admin / demo-hk."
        );
        inputRef.current?.select();
      } else {
        onClose();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-none"
      >
        <h2 id={titleId} className="font-display text-xl font-semibold">
          {targetRole === "admin" ? "Panel Administración PMS" : "Módulo de Limpieza"}
        </h2>
        <p id={descId} className="mt-1 text-sm text-[var(--text-muted)]">
          Acceso reservado al personal de Hospedaje Shadai. Los PINs nunca se muestran en pantalla.
        </p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="staff-pin" className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
              PIN o clave de seguridad
            </label>
            <Input
              id="staff-pin"
              ref={inputRef}
              type="password"
              autoComplete="current-password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "staff-pin-error" : undefined}
            />
            {error ? (
              <p id="staff-pin-error" role="alert" className="mt-1.5 text-xs font-semibold text-[var(--danger)]">
                {error}
              </p>
            ) : null}
          </div>
          {!supabase ? (
            <p className="rounded-xl bg-[var(--surface-2)] px-3 py-2 text-[11px] text-[var(--text-muted)]">
              Modo muestra (sin Supabase): admin <code>demo-admin</code> · limpieza <code>demo-hk</code>
            </p>
          ) : null}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={busy || pin.trim().length < 3} aria-busy={busy}>
              {busy ? "Verificando…" : "Ingresar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
