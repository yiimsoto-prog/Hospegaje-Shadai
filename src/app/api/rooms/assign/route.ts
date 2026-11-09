import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { json, requireStaff } from "@/lib/server/authz";

export async function POST(request: Request) {
  const staff = await requireStaff(request, ["admin", "housekeeping"]);
  if (staff instanceof Response) return staff;

  const body = (await request.json()) as {
    roomNumber?: string;
    workerName?: string;
    dni?: string;
    contrataId?: string;
  };

  const roomNumber = String(body.roomNumber || "").trim();
  const workerName = String(body.workerName || "").trim();
  const dni = String(body.dni || "").trim();
  if (!roomNumber || workerName.length < 3 || !/^\d{8}$/.test(dni)) {
    return json({ error: "invalid_input" }, 400);
  }

  const rooms = await sql(`select * from rooms where number = $1`, [roomNumber]);
  if (!rooms[0]) return json({ error: "room_not_found" }, 404);
  if (rooms[0].status !== "disponible") return json({ error: "room_not_available" }, 409);

  let contrataName: string | null = null;
  let contrataId: string | null = null;
  if (body.contrataId) {
    const c = await sql(`select * from contratas where id = $1`, [body.contrataId]);
    if (c[0]) {
      contrataId = String(c[0].id);
      contrataName = String(c[0].razon_social);
    }
  }

  const assignment = {
    workerName,
    dni,
    contrataId,
    contrataName,
    assignedAt: new Date().toISOString(),
    lastCheckoutAt: null,
    checkedOutToday: false,
  };

  await sql(
    `update rooms
     set status = 'ocupada', cleaning_state = 'limpio', assignment = $2::jsonb, updated_at = now()
     where number = $1`,
    [roomNumber, JSON.stringify(assignment)]
  );

  return json({ ok: true, audit: randomUUID() });
}
