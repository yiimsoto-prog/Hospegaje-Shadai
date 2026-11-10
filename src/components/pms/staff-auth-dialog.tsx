"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StaffRole } from "@/lib/types";

const BOOT_KEY = "shadai_staff_bootstrapped";

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
  const [mode, setMode] = useState<"bootstrap" | "login">(canBootstrap ? "bootstrap" : "login");

  useEffect(() => {
    if (!open) return;
    const flagged = typeof window !== "undefined" && localStorage.getItem(BOOT_KEY) === "1";
    setMode(canBootstrap && !flagged ? "bootstrap" : "login");
  }, [open, canBootstrap]);

  if (!open) return null;

  async function submit() {
    setBusy(true);
    setLocalError(null);
    try {
      if (mode === "bootstrap") {
        await onBootstrap({ email, password, fullName });
        try {
          localStorage.setItem(BOOT_KEY, "1");
          localStorage.setItem("shadai_staff_email", email.toLowerCase());
        } catch {
          /* ignore */
        }
      } else {
        await onLogin({ email, password });
        try {
          localStorage.setItem(BOOT_KEY, "1");
        } catch {
          /* ignore */
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error de acceso";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("existe")) {
        setMode("login");
        setLocalError("El administrador ya existe. Inicia sesión con tu email y contraseña.");
        try {
          localStorage.setItem(BOOT_KEY, "1");
        } catch {
          /* ignore */
        }
      } else {
        setLocalError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
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
          {mode === "bootstrap"
            ? "Crea el primer administrador (mín. 8 caracteres). Luego solo inicia sesión; no hace falta crearlo otra vez."
            : "Ingresa con el email y contraseña del personal ya registrado."}
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
          {mode === "bootstrap" ? (
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
              autoComplete={mode === "bootstrap" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mínimo 8 caracteres"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button type="button" disabled={busy} onClick={() => void submit()}>
            {busy ? "Procesando…" : mode === "bootstrap" ? "Crear administrador" : "Iniciar sesión"}
          </Button>
          {mode === "bootstrap" ? (
            <Button type="button" variant="secondary" onClick={() => setMode("login")}>
              Ya tengo cuenta — Iniciar sesión
            </Button>
          ) : canBootstrap ? (
            <Button type="button" variant="secondary" onClick={() => setMode("bootstrap")}>
              Crear primer administrador
            </Button>
          ) : null}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
