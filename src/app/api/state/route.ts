import { ensureSeeded, sql } from "@/lib/db";
import { json, loadStaffSession } from "@/lib/server/authz";
import {
  mapAttendance,
  mapContrata,
  mapHk,
  mapHotel,
  mapPernocta,
  mapPetty,
  mapRoom,
} from "@/lib/server/mappers";

export async function GET(request: Request) {
  try {
    await ensureSeeded();

    const hotelRows = await sql(`select * from hotel_settings where id = 1`);
    const roomRows = await sql(`select * from rooms order by number`);
    const contrataRows = await sql(`select * from contratas order by razon_social`);
    const { getCachedHotel, getCachedRooms } = await import("@/lib/server/content-store");

    // Public snapshot (guest-safe). Sensitive staff ledgers only if authenticated staff.
    const hotel = hotelRows[0] ? mapHotel(hotelRows[0]) : getCachedHotel();
    const rooms = roomRows.length ? roomRows.map((r) => mapRoom(r)) : getCachedRooms();
    const base = {
      hotel,
      rooms,
      contratas: contrataRows.map((r) => mapContrata(r)),
      bookings: [] as unknown[],
      pernoctas: [] as ReturnType<typeof mapPernocta>[],
      pettyCash: [] as ReturnType<typeof mapPetty>[],
      attendance: [] as ReturnType<typeof mapAttendance>[],
      housekeepingTasks: [] as ReturnType<typeof mapHk>[],
      dataMode: process.env.DATABASE_URL ? "postgres" : "local",
    };

    const session = await loadStaffSession(request);
    if (session instanceof Response) {
      // Not signed in: guest payload only
      return json(base);
    }

    if (!session.role && session.identity.appVisibility !== "team") {
      return json({ ...base, me: { role: null, canBootstrap: session.canBootstrap } });
    }

    const isStaff =
      Boolean(session.role) ||
      (session.identity.appVisibility === "team" && session.identity.teamRole === "admin");

    if (!isStaff) {
      return json({ ...base, me: { role: session.role, canBootstrap: session.canBootstrap } });
    }

    const [pernoctas, petty, attendance, hk] = await Promise.all([
      sql(`select * from pernoctas order by checkout_at desc limit 200`),
      sql(`select * from petty_cash order by created_at desc limit 200`),
      sql(`select * from attendance order by recorded_at desc limit 200`),
      sql(`select * from housekeeping_tasks where status = 'pendiente' order by created_at desc`),
    ]);

    return json({
      ...base,
      pernoctas: pernoctas.map((r) => mapPernocta(r)),
      pettyCash: petty.map((r) => mapPetty(r)),
      attendance: attendance.map((r) => mapAttendance(r)),
      housekeepingTasks: hk.map((r) => mapHk(r)),
      me: {
        role: session.role ?? (session.identity.appVisibility === "team" ? "admin" : null),
        canBootstrap: session.canBootstrap,
        name: session.identity.name || session.identity.email,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    return json({ error: message }, 500);
  }
}
