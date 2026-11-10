import type { Pernocta, Room } from "@/lib/types";

export type DemandPoint = {
  date: string;
  nights: number;
  occupancyPct: number;
  suggestedPriceConfort: number;
  suggestedPriceEstandar: number;
  season: "baja" | "media" | "alta";
};

function seasonForMonth(month: number): DemandPoint["season"] {
  // Mining camp seasonality heuristic for Cotabambas corridor.
  if ([5, 6, 7, 8].includes(month)) return "alta";
  if ([3, 4, 9, 10].includes(month)) return "media";
  return "baja";
}

function seasonMultiplier(season: DemandPoint["season"]) {
  if (season === "alta") return 1.22;
  if (season === "media") return 1.08;
  return 0.94;
}

/**
 * Predictive occupancy + dynamic pricing from recent pernoctas and rack size.
 * Deterministic forecast suitable for ops planning (no external ML dependency).
 */
export function forecastDemand(input: {
  rooms: Room[];
  pernoctas: Pernocta[];
  days?: number;
  baseConfort?: number;
  baseEstandar?: number;
}): DemandPoint[] {
  const days = input.days ?? 14;
  const capacity = Math.max(input.rooms.length, 1);
  const baseC = input.baseConfort ?? 40;
  const baseE = input.baseEstandar ?? 35;

  const byDay = new Map<string, number>();
  for (const p of input.pernoctas) {
    const d = String(p.night_date).slice(0, 10);
    byDay.set(d, (byDay.get(d) || 0) + 1);
  }

  const recent = [...byDay.values()].slice(-21);
  const avg = recent.length
    ? recent.reduce((a, b) => a + b, 0) / recent.length
    : capacity * 0.45;
  const trend =
    recent.length >= 4
      ? (recent.slice(-3).reduce((a, b) => a + b, 0) / 3 - recent.slice(0, 3).reduce((a, b) => a + b, 0) / 3) /
        capacity
      : 0;

  const occupiedNow = input.rooms.filter((r) => r.status === "ocupada").length;
  const nowOcc = occupiedNow / capacity;

  const out: DemandPoint[] = [];
  const start = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const season = seasonForMonth(d.getUTCMonth() + 1);
    const weekday = d.getUTCDay();
    const weekendBoost = weekday === 5 || weekday === 6 ? 0.06 : 0;
    // Heurística de parada de planta / mantto minero: dips mid-month in baja season
    const day = d.getUTCDate();
    const plantStoppage = season === "baja" && day >= 12 && day <= 16 ? 0.78 : 1;
    const projectedNights = Math.max(
      0,
      Math.min(
        capacity,
        Math.round(
          avg *
            (1 + trend * (i / days)) *
            seasonMultiplier(season) *
            (1 + weekendBoost) *
            (0.85 + nowOcc * 0.3) *
            plantStoppage
        )
      )
    );
    const occupancyPct = Math.round((projectedNights / capacity) * 1000) / 10;
    const demandLift = 0.9 + occupancyPct / 100;
    const mult = seasonMultiplier(season) * demandLift;
    out.push({
      date: iso,
      nights: projectedNights,
      occupancyPct,
      suggestedPriceConfort: Math.round(baseC * mult),
      suggestedPriceEstandar: Math.round(baseE * mult),
      season,
    });
  }
  return out;
}
