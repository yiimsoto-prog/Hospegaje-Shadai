import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { json, requireStaff } from "@/lib/server/authz";

export async function POST(request: Request) {
  const staff = await requireStaff(request, ["admin", "housekeeping"]);
  if (staff instanceof Response) return staff;
  const body = (await request.json()) as { roomNumber?: string };
  const roomNumber = String(body.roomNumber || "").trim();
  if (!roomNumber) return json({ error: "invalid_input" }, 400);

  await sql(
    `update rooms
     set status = 'limpieza', cleaning_state = 'sucio', assignment = null,
         current_booking_id = null, updated_at = now()
     where number = $1`,
    [roomNumber]
  );
  await sql(
    `insert into housekeeping_tasks (id, room_number, status, notes)
     values ($1, $2, 'pendiente', 'Liberación de guardia — limpieza profunda')`,
    [randomUUID(), roomNumber]
  );
  return json({ ok: true });
}
