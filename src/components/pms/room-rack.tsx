"use client";

import { StatusPill } from "@/components/pms/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import type { Room } from "@/lib/types";

type Props = {
  rooms: Room[];
  canManage: boolean;
  onAssign: (roomNumber: string) => void;
  onLiberar: (roomNumber: string) => void;
  onClean: (roomNumber: string) => void;
};

export function RoomRack({ rooms, canManage, onAssign, onLiberar, onClean }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <Card key={room.id} className="overflow-hidden">
          <CardHeader className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
                Hab. {room.number} · Piso {room.floor}
              </p>
              <h3 className="font-display text-lg font-semibold leading-tight">{room.name}</h3>
            </div>
            <StatusPill status={room.status} />
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-sm text-[var(--text-muted)]">
              {room.bed} · {formatMoney(room.price_per_night)} / noche
            </p>
            {room.assignment ? (
              <div className="rounded-xl bg-[var(--surface-2)] px-3 py-2 text-sm">
                <p className="font-semibold">{room.assignment.workerName}</p>
                <p className="text-[var(--text-muted)]">DNI {room.assignment.dni}</p>
                {room.assignment.contrataName ? (
                  <p className="text-xs text-[var(--text-faint)]">{room.assignment.contrataName}</p>
                ) : null}
              </div>
            ) : (
              <div className="empty-state py-4 text-xs">Sin asignación activa</div>
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
                    Liberar guardia
                  </Button>
                ) : null}
              </div>
            ) : null}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
