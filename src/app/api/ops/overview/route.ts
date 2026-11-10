import { forecastDemand } from "@/lib/ai/demand";
import { INVENTORY_SEED, inventoryAlerts, inventoryValuation } from "@/lib/erp/inventory";
import { buildLiquidationReport } from "@/lib/erp/liquidation";
import { ensureSeeded, sql } from "@/lib/db";
import { json, requireStaff } from "@/lib/server/authz";
import { mapContrata, mapPernocta, mapRoom } from "@/lib/server/mappers";

export async function GET(request: Request) {
  const staff = await requireStaff(request, ["admin"]);
  if (staff instanceof Response) {
    // Soft public ops snapshot without ledgers
    await ensureSeeded();
    const rooms = (await sql(`select * from rooms order by number`)).map(mapRoom);
    const demand = forecastDemand({ rooms, pernoctas: [] });
    return json({
      mode: "public",
      rooms: rooms.length,
      occupied: rooms.filter((r) => r.status === "ocupada").length,
      demandPreview: demand.slice(0, 3),
      inventoryAlerts: inventoryAlerts(INVENTORY_SEED).length,
    });
  }

  await ensureSeeded();
  const [roomRows, contrataRows, pernoctaRows] = await Promise.all([
    sql(`select * from rooms order by number`),
    sql(`select * from contratas order by razon_social`),
    sql(`select * from pernoctas order by checkout_at desc limit 200`),
  ]);
  const rooms = roomRows.map(mapRoom);
  const contratas = contrataRows.map(mapContrata);
  const pernoctas = pernoctaRows.map(mapPernocta);
  const liquidation = buildLiquidationReport({ rooms, contratas, pernoctas });
  const demand = forecastDemand({ rooms, pernoctas });
  const inventory = INVENTORY_SEED;

  return json({
    mode: "admin",
    stats: {
      rooms: rooms.length,
      occupied: rooms.filter((r) => r.status === "ocupada").length,
      cleaning: rooms.filter((r) => r.status === "limpieza").length,
      maintenance: rooms.filter((r) => r.status === "mantenimiento").length,
    },
    liquidation,
    demand,
    inventory: {
      items: inventory,
      alerts: inventoryAlerts(inventory),
      valuation: inventoryValuation(inventory),
    },
    integrations: {
      tls: "cloudflare",
      ddos: "cloudflare_waf",
      supabase: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
      payments: Boolean(process.env.PAYMENTS_PROVIDER),
      iot: Boolean(process.env.IOT_BRIDGE_URL),
      bluetoothLocks: Boolean(process.env.BLE_LOCK_PROVIDER),
      totp2fa: true,
    },
  });
}
