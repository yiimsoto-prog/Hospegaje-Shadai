import { randomUUID } from "node:crypto";
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
    return json({ ok: false, already: true, error: "Salida ya registrada hoy" }, 409);
  }

  const checkoutAt = new Date().toISOString();
  const ticket = `TK-${checkoutAt.slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const nextAssignment = {
    ...assignment,
    checkedOutToday: true,
    lastCheckoutAt: checkoutAt,
  };

  await sql(
    `update rooms
     set status = 'limpieza', cleaning_state = 'sucio', assignment = $2::jsonb, updated_at = now()
     where number = $1`,
    [roomNumber, JSON.stringify(nextAssignment)]
  );
  await sql(
    `insert into housekeeping_tasks (id, room_number, status, notes)
     values ($1, $2, 'pendiente', 'Check-out móvil — aseo diario')`,
    [randomUUID(), roomNumber]
  );
  await sql(
    `insert into pernoctas (
      id, ticket, room_number, dni, worker_name, contrata_name, night_date, checkout_at, tariff, validated
    ) values ($1,$2,$3,$4,$5,$6,$7::date,$8::timestamptz,$9,true)`,
    [
      randomUUID(),
      ticket,
      roomNumber,
      dni,
      assignment.workerName,
      assignment.contrataName || "",
      checkoutAt.slice(0, 10),
      checkoutAt,
      Number(room.price_per_night),
    ]
  );

  return json({ ok: true, ticket, checkoutAt });
}
