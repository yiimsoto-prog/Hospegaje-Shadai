import { sql } from "@/lib/db";
import { json, requireStaff } from "@/lib/server/authz";

export async function POST(request: Request) {
  const staff = await requireStaff(request, ["admin", "housekeeping"]);
  if (staff instanceof Response) return staff;
  const body = (await request.json()) as { roomNumber?: string };
  const roomNumber = String(body.roomNumber || "").trim();
  if (!roomNumber) return json({ error: "invalid_input" }, 400);

  const rooms = await sql<{ assignment: unknown }>(`select assignment from rooms where number = $1`, [
    roomNumber,
  ]);
  if (!rooms[0]) return json({ error: "room_not_found" }, 404);
  const nextStatus = rooms[0].assignment ? "ocupada" : "disponible";

  await sql(
    `update rooms set status = $2, cleaning_state = 'limpio', updated_at = now() where number = $1`,
    [roomNumber, nextStatus]
  );
  await sql(
    `update housekeeping_tasks set status = 'completa' where room_number = $1 and status = 'pendiente'`,
    [roomNumber]
  );
  return json({ ok: true, status: nextStatus });
}
