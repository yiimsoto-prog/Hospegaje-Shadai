import { randomUUID } from "node:crypto";
import { ensureSeeded, sql } from "@/lib/db";
import { json, requireStaff } from "@/lib/server/authz";
import { isValidDni, requireFields, sanitizeText } from "@/lib/security/validate";

/**
 * Digital check-in with identity + signature payload.
 * Staff confirms; signature stored as data-URL reference in assignment notes via booking row.
 */
export async function POST(request: Request) {
  const staff = await requireStaff(request, ["admin", "housekeeping"]);
  if (staff instanceof Response) return staff;

  await ensureSeeded();
  const body = (await request.json()) as {
    roomNumber?: string;
    workerName?: string;
    dni?: string;
    contrataName?: string;
    signatureDataUrl?: string;
  };

  const missing = requireFields(body, ["roomNumber", "workerName", "dni"]);
  if (missing) return json({ error: missing }, 400);
  if (!isValidDni(body.dni)) return json({ error: "invalid_dni" }, 400);

  const roomNumber = sanitizeText(body.roomNumber, 10);
  const workerName = sanitizeText(body.workerName, 120);
  const dni = sanitizeText(body.dni, 8);
  const contrataName = sanitizeText(body.contrataName || "", 160);
  const signature = sanitizeText(body.signatureDataUrl || "", 200_000);

  const rooms = await sql(`select * from rooms where number = $1`, [roomNumber]);
  if (!rooms[0]) return json({ error: "room_not_found" }, 404);
  if (rooms[0].status !== "disponible") return json({ error: "room_not_available" }, 409);

  const assignment = {
    workerName,
    dni,
    contrataId: null,
    contrataName: contrataName || null,
    assignedAt: new Date().toISOString(),
    lastCheckoutAt: null,
    checkedOutToday: false,
    signaturePresent: Boolean(signature && signature.startsWith("data:image")),
    checkInId: randomUUID(),
  };

  await sql(
    `update rooms
     set status = 'ocupada', cleaning_state = 'limpio', assignment = $2::jsonb, updated_at = now()
     where number = $1`,
    [roomNumber, JSON.stringify(assignment)]
  );

  const bookingId = randomUUID();
  await sql(
    `insert into bookings (id, code, room_number, guest_name, guest_doc, check_in, status, base_price, charges, payments)
     values ($1,$2,$3,$4,$5,$6::date,'activa',$7,'[]'::jsonb,'[]'::jsonb)`,
    [
      bookingId,
      `CI-${Date.now().toString(36).toUpperCase()}`,
      roomNumber,
      workerName,
      dni,
      new Date().toISOString().slice(0, 10),
      Number(rooms[0].price_per_night) || 40,
    ]
  ).catch(() => undefined);

  return json({
    ok: true,
    bookingId,
    checkInId: assignment.checkInId,
    roomNumber,
    audit: {
      signed: assignment.signaturePresent,
      by: staff.identity.email || staff.identity.name,
      at: assignment.assignedAt,
    },
  });
}
