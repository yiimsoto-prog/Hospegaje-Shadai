"use client";

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

const PHOTOS = [MEDIA.roomBed, MEDIA.roomTv, MEDIA.roomDouble, MEDIA.roomWarm, MEDIA.bathroom, MEDIA.reception];

export function RoomRack({ rooms, canManage, onAssign, onLiberar, onClean }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rooms.map((room, idx) => {
        const photo = PHOTOS[idx % PHOTOS.length];
        return (
          <article
            key={room.id}
            className="group overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={`Habitación ${room.number}`}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute left-3 top-3">
                <StatusPill status={room.status} />
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/75">
                  Hab. {room.number} · Piso {room.floor}
                </p>
                <h3 className="font-display text-2xl leading-tight">{room.name}</h3>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-[var(--text-muted)]">{room.bed}</span>
                <span className="font-semibold">{formatMoney(room.price_per_night)}/noche</span>
              </div>
              {room.assignment ? (
                <div className="border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm">
                  <p className="font-semibold">{room.assignment.workerName}</p>
                  <p className="text-[var(--text-muted)]">DNI {room.assignment.dni}</p>
                  {room.assignment.contrataName ? (
                    <p className="text-xs text-[var(--text-faint)]">{room.assignment.contrataName}</p>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-faint)]">Sin asignación</p>
              )}
              {canManage ? (
                <div className="flex flex-wrap gap-2">
                  {room.status === "disponible" ? (
                    <Button size="sm" onClick={() => onAssign(room.number)}>
                      Check-in
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
