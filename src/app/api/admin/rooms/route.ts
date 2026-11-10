import { ensureSeeded, sql } from "@/lib/db";
import { json, requireStaff } from "@/lib/server/authz";
import { getCachedRoom, getCachedRooms, setCachedRoom } from "@/lib/server/content-store";
import { sanitizeText } from "@/lib/security/validate";
import type { Room, RoomType } from "@/lib/types";

export async function GET(request: Request) {
  const auth = await requireStaff(request, ["admin"]);
  if (auth instanceof Response) return auth;
  return json({ rooms: getCachedRooms() });
}

export async function PUT(request: Request) {
  const auth = await requireStaff(request, ["admin"]);
  if (auth instanceof Response) return auth;

  try {
    await ensureSeeded();
    const body = (await request.json()) as Partial<Room> & { number?: string };
    const number = sanitizeText(body.number, 8);
    if (!number) return json({ error: "room_required" }, 400);

    const current = getCachedRoom(number);
    if (!current) return json({ error: "room_not_found" }, 404);

    const type = (body.type === "confort" || body.type === "estandar" ? body.type : current.type) as RoomType;
    const amenities = Array.isArray(body.amenities)
      ? body.amenities.map((a) => sanitizeText(a, 80)).filter(Boolean).slice(0, 20)
      : current.amenities;

    const next: Room = {
      ...current,
      name: sanitizeText(body.name ?? current.name, 80) || current.name,
      type,
      floor: Number.isFinite(Number(body.floor)) ? Number(body.floor) : current.floor,
      capacity: Number.isFinite(Number(body.capacity)) ? Number(body.capacity) : current.capacity,
      bed: sanitizeText(body.bed ?? current.bed, 120),
      price_per_night: Number.isFinite(Number(body.price_per_night))
        ? Math.max(0, Number(body.price_per_night))
        : current.price_per_night,
      amenities,
      cleaning_notes: sanitizeText(body.cleaning_notes ?? current.cleaning_notes, 240),
      photo_url: sanitizeText(body.photo_url ?? current.photo_url, 500),
    };

    setCachedRoom(next);

    try {
      await sql(
        `update rooms set
          name = $1, room_type = $2, floor = $3, capacity = $4, bed = $5,
          price_per_night = $6, amenities = $7, cleaning_notes = $8
         where number = $9`,
        [
          next.name,
          next.type,
          next.floor,
          next.capacity,
          next.bed,
          next.price_per_night,
          JSON.stringify(next.amenities),
          next.cleaning_notes,
          next.number,
        ]
      );
    } catch {
      /* memory driver */
    }

    try {
      await sql(`update rooms set photo_url = $1 where number = $2`, [next.photo_url, next.number]);
    } catch {
      /* optional column */
    }

    return json({ ok: true, room: next });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "save_failed" }, 500);
  }
}
