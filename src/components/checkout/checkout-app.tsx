"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store/app-store";
import { StatusPill } from "@/components/pms/status-pill";

type Step = "dni" | "confirm" | "success" | "already";

export function CheckoutApp() {
  const search = useSearchParams();
  const { state, ready, validateCheckout, confirmCheckout } = useAppStore();
  const { theme, toggleTheme } = useTheme();

  const initialRoom = search.get("hab") || "101";
  const [roomNumber, setRoomNumber] = useState(initialRoom);
  const [dni, setDni] = useState("");
  const [step, setStep] = useState<Step>("dni");
  const [workerName, setWorkerName] = useState("");
  const [ticket, setTicket] = useState("");
  const [checkoutAt, setCheckoutAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setRoomNumber(initialRoom);
  }, [initialRoom]);

  const room = useMemo(
    () => state.rooms.find((r) => r.number === roomNumber),
    [state.rooms, roomNumber]
  );

  async function onValidate() {
    setBusy(true);
    setError(null);
    const res = await validateCheckout(roomNumber, dni);
    setBusy(false);
    if (res.already) {
      setWorkerName(res.workerName || "");
      setStep("already");
      return;
    }
    if (!res.ok) {
      setError(res.error || "No se pudo validar");
      return;
    }
    setWorkerName(res.workerName || "");
    setStep("confirm");
  }

  async function onConfirm() {
    setBusy(true);
    setError(null);
    const res = await confirmCheckout(roomNumber, dni);
    setBusy(false);
    if (!res.ok) {
      setError(res.error || "No se pudo registrar la salida");
      return;
    }
    setTicket(res.ticket || "");
    setCheckoutAt(res.checkoutAt || "");
    setStep("success");
  }

  if (!ready) {
    return <div className="grid min-h-screen place-items-center text-sm text-[var(--text-muted)]">Cargando…</div>;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)]">Check-out móvil</p>
          <h1 className="font-display text-xl font-semibold">Hospedaje Shadai</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Link href="/pms" className="text-xs font-semibold text-[var(--brand)]">
            PMS
          </Link>
        </div>
      </header>

      <section className="slide-up rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[var(--text-faint)]">Habitación</p>
            <label className="sr-only" htmlFor="room-select">
              Seleccionar habitación
            </label>
            <select
              id="room-select"
              className="mt-1 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 text-sm font-semibold"
              value={roomNumber}
              onChange={(e) => {
                setRoomNumber(e.target.value);
                setStep("dni");
                setError(null);
              }}
            >
              {state.rooms.map((r) => (
                <option key={r.id} value={r.number}>
                  {r.number} · {r.name}
                </option>
              ))}
            </select>
          </div>
          {room ? <StatusPill status={room.status} /> : null}
        </div>
        {room?.assignment ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Guardia activa. Digita tu DNI para marcar salida a mina.
          </p>
        ) : (
          <div className="empty-state mt-3 py-4 text-xs">
            Habitación libre. El check-out aplica solo con guardia asignada desde recepción.
          </div>
        )}
      </section>

      {step === "dni" ? (
        <section className="mt-4 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <label htmlFor="dni" className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Número de DNI
          </label>
          <Input
            id="dni"
            inputMode="numeric"
            maxLength={8}
            placeholder="Ej. 71234567"
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
            aria-invalid={Boolean(error)}
          />
          {error ? (
            <p role="alert" className="text-xs font-semibold text-[var(--danger)]">
              {error}
            </p>
          ) : (
            <p className="text-[11px] text-[var(--text-faint)]">Debe coincidir con el DNI registrado en recepción.</p>
          )}
          <Button
            className="w-full"
            disabled={busy || dni.length !== 8 || !room?.assignment}
            aria-busy={busy}
            onClick={onValidate}
          >
            Verificar mi salida
          </Button>
        </section>
      ) : null}

      {step === "confirm" ? (
        <section className="mt-4 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <Badge tone="info">Paso 2 · Confirmación</Badge>
          <h2 className="font-display text-2xl font-semibold">{workerName}</h2>
          <p className="text-sm text-[var(--text-muted)]">
            ¿Deseas marcar tu salida a mina hoy? Tu habitación pasará a aseo y quedará reservada a tu nombre.
          </p>
          {error ? (
            <p role="alert" className="text-xs font-semibold text-[var(--danger)]">
              {error}
            </p>
          ) : null}
          <Button className="w-full" variant="gold" disabled={busy} aria-busy={busy} onClick={onConfirm}>
            Confirmar salida a turno
          </Button>
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => {
              setStep("dni");
              setError(null);
            }}
          >
            Corregir DNI
          </Button>
        </section>
      ) : null}

      {step === "success" ? (
        <section className="mt-4 space-y-3 rounded-2xl border border-emerald-500/30 bg-[var(--surface)] p-4">
          <Badge tone="success">Salida registrada</Badge>
          <h2 className="font-display text-2xl font-semibold">Buen turno de guardia</h2>
          <p className="text-sm text-[var(--text-muted)]">Ticket de auditoría: <strong>{ticket}</strong></p>
          <p className="text-sm text-[var(--text-muted)]">
            Hora: {checkoutAt ? new Date(checkoutAt).toLocaleString("es-PE") : "—"}
          </p>
          <p className="text-sm text-[var(--text-muted)]">Estado de habitación: en limpieza (housekeeping).</p>
        </section>
      ) : null}

      {step === "already" ? (
        <section className="mt-4 space-y-3 rounded-2xl border border-amber-500/30 bg-[var(--surface)] p-4">
          <Badge tone="warning">Ya registraste salida hoy</Badge>
          <p className="text-sm text-[var(--text-muted)]">
            {workerName || "Trabajador"}, tu salida del turno de hoy ya fue validada.
          </p>
          <Button className="w-full" variant="secondary" onClick={() => setStep("dni")}>
            Volver
          </Button>
        </section>
      ) : null}

      <footer className="mt-auto pt-8 text-center text-[11px] text-[var(--text-faint)]">
        Hospedaje Shadai · Challhuahuacho · Mismo código base que el PMS
      </footer>
    </div>
  );
}
