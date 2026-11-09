import { Badge } from "@/components/ui/badge";
import type { RoomStatus } from "@/lib/types";

export function StatusPill({ status }: { status: RoomStatus }) {
  const map = {
    disponible: { tone: "success" as const, label: "Disponible" },
    ocupada: { tone: "danger" as const, label: "Ocupada" },
    limpieza: { tone: "warning" as const, label: "En limpieza" },
    mantenimiento: { tone: "info" as const, label: "Mantenimiento" },
  };
  const m = map[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
