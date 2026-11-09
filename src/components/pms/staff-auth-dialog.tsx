"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import type { StaffRole } from "@/lib/types";

type Props = {
  open: boolean;
  targetRole: Exclude<StaffRole, "guest">;
  canBootstrap: boolean;
  message?: string | null;
  onClose: () => void;
  onBootstrap: () => Promise<void>;
  onRetry: () => Promise<void>;
};

export function StaffAuthDialog({
  open,
  targetRole,
  canBootstrap,
  message,
  onClose,
  onBootstrap,
  onRetry,
}: Props) {
  const titleId = useId();
  const descId = useId();
  if (!open) return null;

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
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
      >
        <h2 id={titleId} className="font-display text-xl font-semibold">
          {targetRole === "admin" ? "Acceso Administración" : "Acceso Limpieza"}
        </h2>
        <p id={descId} className="mt-2 text-sm text-[var(--text-muted)]">
          El personal se autoriza en el servidor con tu sesión de Cursor (app privada/equipo). No hay
          PINs en el navegador.
        </p>
        {message ? (
          <p role="alert" className="mt-3 text-xs font-semibold text-[var(--danger)]">
            {message}
          </p>
        ) : null}
        <div className="mt-4 flex flex-col gap-2">
          {canBootstrap ? (
            <Button
              type="button"
              onClick={async () => {
                await onBootstrap();
              }}
            >
              Registrar primer administrador
            </Button>
          ) : null}
          <Button type="button" variant="secondary" onClick={() => onRetry()}>
            Reintentar sesión
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
