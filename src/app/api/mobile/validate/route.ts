import { ensureSeeded, sql } from "@/lib/db";
import { json } from "@/lib/server/authz";
import type { RoomAssignment } from "@/lib/types";

export async function POST(request: Request) {
  await ensureSeeded();
  const body = (await request.json()) as { roomNumber?: string; dni?: string };
  const roomNumber = String(body.roomNumber || "").trim();
  const dni = String(body.dni || "").trim();
  if (!roomNumber || !/^\d{8}$/.test(dni)) return json({ ok: false, error: "Datos inválidos" }, 400);

  const rooms = await sql(`select * from rooms where number = $1`, [roomNumber]);
  const room = rooms[0];
  if (!room) return json({ ok: false, error: "Habitación no encontrada" }, 404);
  const assignment = room.assignment as RoomAssignment | null;
  if (!assignment) return json({ ok: false, error: "Habitación sin guardia asignada" }, 409);
  if (assignment.dni !== dni) {
    return json({ ok: false, error: "El DNI no corresponde al trabajador de esta habitación" }, 403);
  }
  if (assignment.checkedOutToday) {
    return json({
      ok: false,
      already: true,
      error: "Salida ya registrada hoy",
      workerName: assignment.workerName,
    });
  }
  return json({
    ok: true,
    workerName: assignment.workerName,
    contrataName: assignment.contrataName,
  });
}
