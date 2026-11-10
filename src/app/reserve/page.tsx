"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store/app-store";
import { formatMoney } from "@/lib/utils";

function ReserveForm() {
  const params = useSearchParams();
  const roomNumber = params.get("room") || "";
  const { state, ready } = useAppStore();
  const room = useMemo(
    () => state.rooms.find((r) => r.number === roomNumber),
    [state.rooms, roomNumber]
  );

  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [nights, setNights] = useState(1);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const total = (room?.price_per_night || 0) * Math.max(1, nights);

  useEffect(() => {
    if (ready && roomNumber && !room) setStatus("Habitación no encontrada");
  }, [ready, room, roomNumber]);

  async function pay() {
    if (!room) return;
    if (name.trim().length < 3 || !/^\d{8}$/.test(dni)) {
      setStatus("Ingrese nombre completo y DNI de 8 dígitos");
      return;
    }
    setBusy(true);
    setStatus(null);
    // Adapter: real Culqi/MP goes through PAYMENTS_PROVIDER secrets.
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    setStatus(
      `Reserva registrada (simulación) · Hab. ${room.number} · ${nights} noche(s) · ${formatMoney(total)}. Complete check-in digital en recepción o /guest/checkin.`
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <p className="eyebrow">Reserva pública</p>
      <h1 className="font-display mt-2 text-4xl">Reservar y pagar</h1>
      {!ready ? (
        <p className="mt-4 text-sm text-[var(--text-muted)]">Cargando…</p>
      ) : !room ? (
        <p className="mt-4 text-sm text-[var(--danger)]">{status || "Seleccione una habitación disponible."}</p>
      ) : (
        <div className="mt-6 space-y-4 border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          {room.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={room.photo_url} alt={room.name} className="aspect-[16/10] w-full rounded-xl object-cover" />
          ) : null}
          <div>
            <h2 className="font-display text-2xl">
              Hab. {room.number} · {room.name}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              {room.bed} · {formatMoney(room.price_per_night)} / noche
            </p>
            {room.status !== "disponible" || room.assignment ? (
              <p className="mt-2 text-sm font-semibold text-[var(--danger)]">Esta habitación ya no está disponible.</p>
            ) : null}
          </div>
          <label className="block text-sm">
            Nombre completo
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block text-sm">
            DNI
            <Input className="mt-1" value={dni} onChange={(e) => setDni(e.target.value)} placeholder="71234567" />
          </label>
          <label className="block text-sm">
            WhatsApp / celular
            <Input className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="block text-sm">
            Noches
            <Input
              className="mt-1"
              type="number"
              min={1}
              max={30}
              value={nights}
              onChange={(e) => setNights(Number(e.target.value) || 1)}
            />
          </label>
          <p className="text-lg font-semibold">Total a pagar: {formatMoney(total)}</p>
          <p className="text-xs text-[var(--text-muted)]">
            Pago simulado en este entorno. En producción se conecta Culqi/Mercado Pago vía secretos del Worker.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={busy || room.status !== "disponible" || Boolean(room.assignment)}
              onClick={() => void pay()}
            >
              {busy ? "Procesando…" : "Pagar ahora"}
            </Button>
            <Link
              href={`/guest/checkin`}
              className="inline-flex h-11 items-center border border-[var(--border)] px-4 text-sm font-semibold"
            >
              Ir a check-in
            </Link>
          </div>
          {status ? <p className="text-sm font-medium text-[var(--text)]">{status}</p> : null}
        </div>
      )}
    </div>
  );
}

export default function ReservePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SiteHeader />
      <Suspense fallback={<div className="p-10 text-sm text-[var(--text-muted)]">Cargando reserva…</div>}>
        <ReserveForm />
      </Suspense>
    </div>
  );
}
