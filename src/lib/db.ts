import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import roomsSeed from "@/lib/data/rooms-seed.json";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
let pool: pg.Pool | undefined;
let local: Promise<PGlite> | undefined;

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  if (databaseUrl !== "") {
    pool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    return (await pool.query(text, params)).rows as T[];
  }
  local ??= startLocal().catch((error: unknown) => {
    local = undefined;
    throw error;
  });
  return (await (await local).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  const db = new PGlite();
  const dir = path.join(process.cwd(), "migrations");
  const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    await db.exec(await readFile(path.join(dir, file), "utf8"));
  }
  await seedRoomsIfEmpty(db);
  return db;
}

async function seedRoomsIfEmpty(db: PGlite) {
  const existing = await db.query<{ c: number }>("select count(*)::int as c from rooms");
  if ((existing.rows[0]?.c ?? 0) > 0) return;
  for (const r of roomsSeed) {
    await db.query(
      `insert into rooms (
        id, number, name, room_type, floor, capacity, bed, price_per_night,
        status, amenities, cleaning_notes, cleaning_state, assignment, current_booking_id
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13::jsonb,$14)
      on conflict (id) do nothing`,
      [
        r.id,
        r.number,
        r.name,
        r.type,
        r.floor,
        r.capacity,
        r.bed,
        r.price_per_night,
        r.status,
        JSON.stringify(r.amenities ?? []),
        r.cleaning_notes ?? "",
        r.cleaning_state ?? "limpio",
        r.assignment ? JSON.stringify(r.assignment) : null,
        r.current_booking_id,
      ]
    );
  }
  await db.query(
    `insert into petty_cash (id, entry_type, category, description, amount, sede, created_by)
     values ($1,'ingreso','Fondo inicial','Apertura de caja chica — muestra',200,'Challhuahuacho','Sistema')
     on conflict (id) do nothing`,
    ["pc-seed-1"]
  );
}

/** Ensure room seed also runs against managed Postgres on first boot. */
export async function ensureSeeded() {
  if (databaseUrl === "") {
    await sql("select 1");
    return;
  }
  const rows = await sql<{ c: string }>("select count(*)::text as c from rooms");
  if (Number(rows[0]?.c ?? 0) > 0) return;
  for (const r of roomsSeed) {
    await sql(
      `insert into rooms (
        id, number, name, room_type, floor, capacity, bed, price_per_night,
        status, amenities, cleaning_notes, cleaning_state, assignment, current_booking_id
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13::jsonb,$14)
      on conflict (id) do nothing`,
      [
        r.id,
        r.number,
        r.name,
        r.type,
        r.floor,
        r.capacity,
        r.bed,
        r.price_per_night,
        r.status,
        JSON.stringify(r.amenities ?? []),
        r.cleaning_notes ?? "",
        r.cleaning_state ?? "limpio",
        null,
        null,
      ]
    );
  }
}
