"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StaffRole } from "@/lib/types";

type Props = {
  open: boolean;
  targetRole: Exclude<StaffRole, "guest">;
  canBootstrap: boolean;
  message?: string | null;
  onClose: () => void;
  onBootstrap: (creds: { email: string; password: string; fullName: string }) => Promise<void>;
  onLogin: (creds: { email: string; password: string }) => Promise<void>;
  onRetry: () => Promise<void>;
};

export function StaffAuthDialog({
  open,
  targetRole,
  canBootstrap,
  message,
  onClose,
  onBootstrap,
  onLogin,
  onRetry,
}: Props) {
  const titleId = useId();
  const descId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("Administrador");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!open) return null;

  async function submit() {
    setBusy(true);
    setLocalError(null);
    try {
      if (canBootstrap) {
        await onBootstrap({ email, password, fullName });
      } else {
        await onLogin({ email, password });
      }
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Error de acceso");
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
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
      >
        <h2 id={titleId} className="font-display text-xl font-semibold">
          {targetRole === "admin" ? "Acceso Administración" : "Acceso Limpieza"}
        </h2>
        <p id={descId} className="mt-2 text-sm text-[var(--text-muted)]">
          {canBootstrap
            ? "Crea el primer administrador con email y contraseña (mín. 8 caracteres). La sesión queda en cookie HttpOnly."
            : "Ingresa con el email y contraseña del personal. También funciona con app Cursor privada/equipo."}
        </p>
        {message ? (
          <p role="alert" className="mt-3 text-xs font-semibold text-[var(--danger)]">
            {message}
          </p>
        ) : null}
        {localError ? (
          <p role="alert" className="mt-2 text-xs font-semibold text-[var(--danger)]">
            {localError}
          </p>
        ) : null}

        <div className="mt-4 grid gap-2">
          {canBootstrap ? (
            <label className="text-sm">
              Nombre
              <Input className="mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </label>
          ) : null}
          <label className="text-sm">
            Email
            <Input
              className="mt-1"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hospedajeshadai.com"
            />
          </label>
          <label className="text-sm">
            Contraseña
            <Input
              className="mt-1"
              type="password"
              autoComplete={canBootstrap ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mínimo 8 caracteres"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button type="button" disabled={busy} onClick={() => void submit()}>
            {busy ? "Procesando…" : canBootstrap ? "Crear administrador" : "Iniciar sesión"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => onRetry()}>
            Reintentar sesión Cursor
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
