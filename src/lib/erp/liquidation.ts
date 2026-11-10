import type { Contrata, Pernocta, Room } from "@/lib/types";

export type LiquidationRow = {
  contrataId: string | null;
  contrataName: string;
  ruc: string;
  nights: number;
  roomsUsed: number;
  occupancySharePct: number;
  subtotal: number;
  igv: number;
  total: number;
  tickets: string[];
};

export type LiquidationReport = {
  from: string | null;
  to: string | null;
  generatedAt: string;
  rows: LiquidationRow[];
  totals: { nights: number; subtotal: number; igv: number; total: number };
};

export function buildLiquidationReport(input: {
  pernoctas: Pernocta[];
  contratas: Contrata[];
  rooms: Room[];
  from?: string;
  to?: string;
  contrataId?: string;
}): LiquidationReport {
  const byName = new Map(input.contratas.map((c) => [c.razon_social, c]));
  let items = input.pernoctas.filter((p) => p.validated);
  if (input.from) items = items.filter((p) => p.night_date >= input.from!);
  if (input.to) items = items.filter((p) => p.night_date <= input.to!);
  if (input.contrataId) {
    const c = input.contratas.find((x) => x.id === input.contrataId);
    if (c) items = items.filter((p) => p.contrata_name === c.razon_social);
  }

  const map = new Map<string, LiquidationRow>();
  for (const p of items) {
    const name = p.contrata_name || "Particular / sin contrata";
    const c = byName.get(name);
    const key = c?.id || name;
    const row =
      map.get(key) ||
      ({
        contrataId: c?.id ?? null,
        contrataName: name,
        ruc: c?.ruc ?? "—",
        nights: 0,
        roomsUsed: 0,
        occupancySharePct: 0,
        subtotal: 0,
        igv: 0,
        total: 0,
        tickets: [],
      } satisfies LiquidationRow);
    row.nights += 1;
    row.subtotal += Number(p.tariff) || 0;
    row.tickets.push(p.ticket);
    map.set(key, row);
  }

  const roomsUsedByContrata = new Map<string, Set<string>>();
  for (const p of items) {
    const name = p.contrata_name || "Particular / sin contrata";
    const c = byName.get(name);
    const key = c?.id || name;
    if (!roomsUsedByContrata.has(key)) roomsUsedByContrata.set(key, new Set());
    roomsUsedByContrata.get(key)!.add(p.room_number);
  }

  const capacity = Math.max(input.rooms.length, 1);
  const rows = [...map.values()].map((row) => {
    const key = row.contrataId || row.contrataName;
    const used = roomsUsedByContrata.get(key)?.size || 0;
    row.roomsUsed = used;
    row.occupancySharePct = Math.round((used / capacity) * 1000) / 10;
    row.igv = Math.round(row.subtotal * 0.18 * 100) / 100;
    row.total = Math.round((row.subtotal + row.igv) * 100) / 100;
    row.subtotal = Math.round(row.subtotal * 100) / 100;
    return row;
  });

  rows.sort((a, b) => b.total - a.total);
  const totals = rows.reduce(
    (acc, r) => ({
      nights: acc.nights + r.nights,
      subtotal: acc.subtotal + r.subtotal,
      igv: acc.igv + r.igv,
      total: acc.total + r.total,
    }),
    { nights: 0, subtotal: 0, igv: 0, total: 0 }
  );

  return {
    from: input.from ?? null,
    to: input.to ?? null,
    generatedAt: new Date().toISOString(),
    rows,
    totals: {
      nights: totals.nights,
      subtotal: Math.round(totals.subtotal * 100) / 100,
      igv: Math.round(totals.igv * 100) / 100,
      total: Math.round(totals.total * 100) / 100,
    },
  };
}
