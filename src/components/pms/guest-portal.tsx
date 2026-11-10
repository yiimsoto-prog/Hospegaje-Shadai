"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Copy, KeyRound, MapPin, Phone, Wifi } from "lucide-react";
import { RoomRack } from "@/components/pms/room-rack";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import type { HotelInfo, Room } from "@/lib/types";

type Props = {
  hotel: HotelInfo;
  rooms: Room[];
  available: number;
  occupancy: number;
  onToast: (msg: string) => void;
};

export function GuestPortal({ hotel, rooms, available, occupancy, onToast }: Props) {
  const [tab, setTab] = useState<"home" | "wifi" | "rooms" | "checkout">("home");
  const wifiPayload = useMemo(() => {
    const pass = hotel.wifiPassword || "";
    return `WIFI:T:WPA;S:${hotel.wifiNetwork};P:${pass};;`;
  }, [hotel.wifiNetwork, hotel.wifiPassword]);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(wifiPayload)}`;

  async function copyWifi() {
    const text = hotel.wifiPassword || hotel.wifiPasswordHint;
    try {
      await navigator.clipboard.writeText(text);
      onToast("Contraseña copiada");
    } catch {
      onToast(text);
    }
  }

  return (
    <section className="fade-in space-y-5">
      <div
        className="overflow-hidden rounded-3xl text-white shadow-[var(--shadow-soft)]"
        style={{
          background: `linear-gradient(135deg, rgba(0,0,0,.72), rgba(45,49,55,.55)), url(${hotel.heroPhoto}) center/cover`,
        }}
      >
        <div className="border-b border-white/20 bg-white px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-[#2d3137]">
          Llave física entregada en recepción
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/85">{hotel.name}</p>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white">
                Challhuahuacho
              </span>
            </div>
            <h1 className="mt-3 font-display text-3xl leading-tight md:text-5xl">
              Habitaciones disponibles · Pisos 1, 2 y 3 (101 al 306)
            </h1>
            <p className="mt-2 text-base italic text-white/85">{hotel.tagline}</p>
            <p className="mt-3 flex items-center gap-2 text-sm text-white">
              <CheckCircle2 className="h-4 w-4" />
              {available} de {rooms.length} habitaciones libres para asignar · ocupación {occupancy}%
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  ["home", "Mi estadía"],
                  ["wifi", "Guía & Wi‑Fi"],
                  ["rooms", "Reservar 101–306"],
                  ["checkout", "Check-out móvil"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`h-10 rounded-full px-4 text-sm font-semibold transition ${
                    tab === id ? "bg-white text-slate-900" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-amber-200">
              Atención telefónica y WhatsApp 24h
            </p>
            <div className="mt-3 grid gap-2">
              {hotel.phones.map((p) => (
                <div key={p.number} className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${p.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-emerald-600 text-xs font-bold text-white"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`tel:+${p.whatsapp}`}
                    className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-sky-600 text-xs font-bold text-white"
                  >
                    <Phone className="h-3.5 w-3.5" /> {p.number}
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-100 sm:grid-cols-2">
              <div className="rounded-xl bg-black/25 p-3">
                <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-amber-200">
                  <KeyRound className="h-3.5 w-3.5" /> Modalidad
                </p>
                <p className="mt-1 font-semibold">Llave física en recepción</p>
              </div>
              <div className="rounded-xl bg-black/25 p-3">
                <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-amber-200">
                  <MapPin className="h-3.5 w-3.5" /> Ubicación
                </p>
                <p className="mt-1 font-semibold">{hotel.city}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {tab === "home" || tab === "wifi" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--navy-deep)] p-5 text-white shadow-[var(--shadow-soft)] lg:col-span-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-amber-300">
              <Wifi className="h-3.5 w-3.5" /> Conexión fibra óptica
            </p>
            <h2 className="mt-3 font-display text-3xl">Wi‑Fi exclusivo {hotel.name}</h2>
            <p className="mt-2 text-sm text-slate-200">
              Nombre de red: <strong>{hotel.wifiNetwork}</strong>
            </p>
            <p className="mt-1 text-sm">
              Contraseña:{" "}
              <span className="font-bold text-amber-300">
                {hotel.wifiPassword || hotel.wifiPasswordHint}
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" className="bg-amber-500 text-slate-900 hover:bg-amber-400" onClick={() => void copyWifi()}>
                <Copy className="h-4 w-4" /> Copiar contraseña
              </Button>
              <Button type="button" variant="secondary" className="border-white/20 bg-white/10 text-white" onClick={() => setTab("wifi")}>
                Ver QR
              </Button>
            </div>
          </article>
          <article className="grid place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR Wi-Fi" className="h-44 w-44 rounded-xl bg-white p-2" />
            <p className="mt-2 text-center text-xs font-semibold text-[var(--text-muted)]">
              Escanea con tu celular · conexión automática
            </p>
          </article>
        </div>
      ) : null}

      {tab === "home" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">Saldo pendiente</p>
            <p className="mt-2 font-display text-3xl">{formatMoney(0)}</p>
            <Button type="button" variant="secondary" className="mt-3" onClick={() => onToast("Sin cargos pendientes")}>
              Ver desglose
            </Button>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">Check-out</p>
            <p className="mt-2 font-display text-3xl">{hotel.checkoutHour} hrs</p>
            <Link
              href="/checkout"
              className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-[var(--navy)] px-4 text-sm font-semibold text-white"
            >
              Salida sin recepción
            </Link>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">Contacto</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{hotel.address}</p>
            <p className="mt-1 text-sm font-semibold">{hotel.email}</p>
            <a
              href={`https://wa.me/${hotel.phones[0]?.whatsapp || ""}`}
              className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white"
            >
              WhatsApp recepción
            </a>
          </div>
        </div>
      ) : null}

      {tab === "rooms" || tab === "home" ? (
        <div>
          <h2 className="font-display mb-3 text-3xl">Galería de habitaciones</h2>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(hotel.galleryPhotos || []).slice(0, 4).map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="Galería hotel" className="aspect-[4/3] w-full rounded-2xl object-cover" />
            ))}
          </div>
          <RoomRack
            rooms={rooms}
            canManage={false}
            onAssign={() => undefined}
            onLiberar={() => undefined}
            onClean={() => undefined}
          />
        </div>
      ) : null}

      {tab === "checkout" ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-3xl">Check-out móvil</h2>
          <p className="mt-2 text-[var(--text-muted)]">
            Valida tu DNI y libera la habitación sin pasar por recepción. Hora límite {hotel.checkoutHour}.
          </p>
          <Link
            href="/checkout"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white"
          >
            Abrir check-out
          </Link>
        </div>
      ) : null}
    </section>
  );
}
