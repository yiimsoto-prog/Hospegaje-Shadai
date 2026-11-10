import { buildLiquidationReport } from "@/lib/erp/liquidation";
import { ensureSeeded, sql } from "@/lib/db";
import { json, requireStaff } from "@/lib/server/authz";
import { mapContrata, mapPernocta, mapRoom } from "@/lib/server/mappers";
import { sanitizeText } from "@/lib/security/validate";

export async function GET(request: Request) {
  const staff = await requireStaff(request, ["admin"]);
  if (staff instanceof Response) return staff;

  await ensureSeeded();
  const url = new URL(request.url);
  const from = sanitizeText(url.searchParams.get("from") || "", 32) || undefined;
  const to = sanitizeText(url.searchParams.get("to") || "", 32) || undefined;
  const contrataId = sanitizeText(url.searchParams.get("contrataId") || "", 64) || undefined;

  const [rooms, contratas, pernoctas] = await Promise.all([
    sql(`select * from rooms order by number`).then((r) => r.map(mapRoom)),
    sql(`select * from contratas order by razon_social`).then((r) => r.map(mapContrata)),
    sql(`select * from pernoctas order by checkout_at desc limit 500`).then((r) => r.map(mapPernocta)),
  ]);

  return json(
    buildLiquidationReport({
      rooms,
      contratas,
      pernoctas,
      from: from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? from : undefined,
      to: to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? to : undefined,
      contrataId,
    })
  );
}
