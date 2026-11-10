"use client";

import Link from "next/link";
import { StatusPill } from "@/components/pms/status-pill";
import { Button } from "@/components/ui/button";
import { MEDIA } from "@/lib/data/media";
import { formatMoney } from "@/lib/utils";
import type { Room } from "@/lib/types";

type Props = {
  rooms: Room[];
  canManage: boolean;
  onAssign: (roomNumber: string) => void;
  onLiberar: (roomNumber: string) => void;
  onClean: (roomNumber: string) => void;
};

const FALLBACK = [MEDIA.roomBed, MEDIA.roomTv, MEDIA.roomDouble, MEDIA.roomWarm, MEDIA.bathroom, MEDIA.reception];

export function RoomRack({ rooms, canManage, onAssign, onLiberar, onClean }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rooms.map((room, idx) => {
        const photo = room.photo_url || FALLBACK[idx % FALLBACK.length];
        const free = !room.assignment && room.status === "disponible";
        return (
          <article
            key={room.id}
            className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={`${room.name} · habitación ${room.number}`}
                className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute left-3 top-3">
                <StatusPill status={room.status} />
              </div>
              <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/90">
                  Hab. {room.number} · Piso {room.floor}
                </p>
                <h3 className="font-display text-2xl leading-tight drop-shadow-sm">{room.name}</h3>
              </div>
            </div>

            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3 text-sm">
                <span className="leading-snug text-[var(--text-muted)]">{room.bed}</span>
                <span className="shrink-0 font-semibold text-[var(--text)]">
                  {formatMoney(room.price_per_night)}
                  <span className="font-normal text-[var(--text-muted)]"> / noche</span>
                </span>
              </div>

              {room.assignment ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm">
                  <p className="font-semibold text-[var(--text)]">{room.assignment.workerName}</p>
                  <p className="text-[var(--text-muted)]">DNI {room.assignment.dni}</p>
                  {room.assignment.contrataName ? (
                    <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                      {room.assignment.contrataName}
                    </p>
                  ) : null}
                </div>
              ) : free ? (
                <Link
                  href={`/reserve?room=${encodeURIComponent(room.number)}`}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-[var(--text)] text-sm font-bold uppercase tracking-[0.12em] text-[var(--bg)] transition hover:opacity-90"
                >
                  Reservar y pagar
                </Link>
              ) : (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3 text-center text-sm font-medium text-[var(--text-muted)]">
                  {room.status === "limpieza"
                    ? "En limpieza — no disponible"
                    : room.status === "mantenimiento"
                      ? "En mantenimiento"
                      : "No disponible para reserva"}
                </div>
              )}

              {canManage ? (
                <div className="flex flex-wrap gap-2">
                  {room.status === "disponible" ? (
                    <Button size="sm" onClick={() => onAssign(room.number)}>
                      Check-in exprés
                    </Button>
                  ) : null}
                  {room.status === "limpieza" ? (
                    <Button size="sm" variant="gold" onClick={() => onClean(room.number)}>
                      Marcar limpia
                    </Button>
                  ) : null}
                  {room.assignment ? (
                    <Button size="sm" variant="secondary" onClick={() => onLiberar(room.number)}>
                      Liberar
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
