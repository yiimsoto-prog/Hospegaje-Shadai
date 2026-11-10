import { forecastDemand } from "@/lib/ai/demand";
import { ensureSeeded, sql } from "@/lib/db";
import { json } from "@/lib/server/authz";
import { mapPernocta, mapRoom } from "@/lib/server/mappers";

export async function GET() {
  await ensureSeeded();
  const [rooms, pernoctas] = await Promise.all([
    sql(`select * from rooms order by number`).then((r) => r.map(mapRoom)),
    sql(`select * from pernoctas order by checkout_at desc limit 200`).then((r) =>
      r.map(mapPernocta)
    ),
  ]);
  return json({
    generatedAt: new Date().toISOString(),
    capacity: rooms.length,
    forecast: forecastDemand({ rooms, pernoctas, days: 14 }),
  });
}
