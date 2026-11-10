import roomsSeed from "@/lib/data/rooms-seed.json";

type SqlRow = Record<string, unknown>;

type DbDriver = {
  kind: "d1" | "postgres" | "pglite" | "memory";
  sql: <T extends SqlRow = SqlRow>(text: string, params?: unknown[]) => Promise<T[]>;
};

let driverPromise: Promise<DbDriver> | undefined;

function convertPostgresPlaceholders(text: string): string {
  // Minimal PG → SQLite translation for our API queries.
  return text
    .replace(/\bnow\(\)/gi, "datetime('now')")
    .replace(/::[a-zA-Z0-9_]+/g, "")
    .replace(/\$(\d+)/g, "?");
}

function parseJsonFields<T extends SqlRow>(row: T): T {
  const out: SqlRow = { ...row };
  for (const key of ["phones", "amenities", "assignment", "charges", "payments"]) {
    const val = out[key];
    if (typeof val === "string") {
      try {
        out[key] = JSON.parse(val);
      } catch {
        /* keep string */
      }
    }
  }
  return out as T;
}

async function getCloudflareD1(): Promise<D1Database | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as { DB?: D1Database }).DB;
    return db ?? null;
  } catch {
    return null;
  }
}

async function createD1Driver(d1: D1Database): Promise<DbDriver> {
  await ensureD1Schema(d1);
  return {
    kind: "d1",
    async sql<T extends SqlRow = SqlRow>(text: string, params: unknown[] = []) {
      const q = convertPostgresPlaceholders(text);
      const stmt = d1.prepare(q);
      const bound = params.length ? stmt.bind(...params.map(normalizeParam)) : stmt;
      if (/^\s*(insert|update|delete|create|drop|alter)/i.test(q)) {
        await bound.run();
        return [] as T[];
      }
      const res = await bound.all<T>();
      return (res.results || []).map((r: T) => parseJsonFields(r));
    },
  };
}

function normalizeParam(v: unknown): string | number | null {
  if (v === undefined) return null;
  if (v === null) return null;
  if (typeof v === "object") return JSON.stringify(v);
  if (typeof v === "boolean") return v ? 1 : 0;
  return v as string | number;
}

async function ensureD1Schema(d1: D1Database) {
  // Idempotent bootstrap for Workers where migrations may not have run yet.
  const statements = [
    `CREATE TABLE IF NOT EXISTS staff_profiles (
      viewer_sub TEXT PRIMARY KEY, email TEXT NOT NULL DEFAULT '', full_name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS hotel_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1), name TEXT NOT NULL, tagline TEXT NOT NULL, city TEXT NOT NULL,
      address TEXT NOT NULL, email TEXT NOT NULL, phones TEXT NOT NULL DEFAULT '[]', wifi_network TEXT NOT NULL,
      checkout_hour TEXT NOT NULL DEFAULT '11:00', currency TEXT NOT NULL DEFAULT 'S/')`,
    `CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY, number TEXT NOT NULL UNIQUE, name TEXT NOT NULL, room_type TEXT NOT NULL,
      floor INTEGER NOT NULL, capacity INTEGER NOT NULL DEFAULT 1, bed TEXT NOT NULL DEFAULT '',
      price_per_night REAL NOT NULL, status TEXT NOT NULL DEFAULT 'disponible', amenities TEXT NOT NULL DEFAULT '[]',
      cleaning_notes TEXT NOT NULL DEFAULT '', cleaning_state TEXT NOT NULL DEFAULT 'limpio',
      assignment TEXT, current_booking_id TEXT, updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS contratas (
      id TEXT PRIMARY KEY, ruc TEXT NOT NULL, razon_social TEXT NOT NULL, contacto TEXT NOT NULL DEFAULT '',
      telefono TEXT NOT NULL DEFAULT '')`,
    `CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, room_number TEXT NOT NULL, guest_name TEXT NOT NULL,
      guest_doc TEXT NOT NULL, check_in TEXT NOT NULL, check_out TEXT, status TEXT NOT NULL DEFAULT 'activa',
      base_price REAL NOT NULL, charges TEXT NOT NULL DEFAULT '[]', payments TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS pernoctas (
      id TEXT PRIMARY KEY, ticket TEXT NOT NULL UNIQUE, room_number TEXT NOT NULL, dni TEXT NOT NULL,
      worker_name TEXT NOT NULL, contrata_name TEXT NOT NULL DEFAULT '', night_date TEXT NOT NULL,
      checkout_at TEXT NOT NULL, tariff REAL NOT NULL, validated INTEGER NOT NULL DEFAULT 1)`,
    `CREATE TABLE IF NOT EXISTS petty_cash (
      id TEXT PRIMARY KEY, entry_type TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL,
      amount REAL NOT NULL, sede TEXT NOT NULL DEFAULT 'Challhuahuacho', created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY, staff_name TEXT NOT NULL, staff_role TEXT NOT NULL, mark_type TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '', sede TEXT NOT NULL DEFAULT 'Challhuahuacho',
      recorded_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS housekeeping_tasks (
      id TEXT PRIMARY KEY, room_number TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pendiente',
      notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  ];
  for (const s of statements) {
    await d1.prepare(s).run();
  }
  await d1
    .prepare(
      `INSERT OR IGNORE INTO hotel_settings (id, name, tagline, city, address, email, phones, wifi_network, checkout_hour, currency)
       VALUES (1,'Hospedaje Shadai','Bajo la cobertura del Altísimo','Challhuahuacho, Cotabambas — Apurímac',
       'Av. 18 de Noviembre s/n — Barrio Los Álamos, Challhuahuacho','hospedajeshadai@gmail.com',
       ?, 'HOSPEDAJE SHADAI','11:00','S/')`
    )
    .bind(
      JSON.stringify([
        { number: "949 268 775", label: "Atención / Reservas", whatsapp: "51949268775" },
        { number: "992 125 903", label: "Recepción", whatsapp: "51992125903" },
      ])
    )
    .run();
  await d1
    .prepare(
      `INSERT OR IGNORE INTO contratas (id, ruc, razon_social, contacto, telefono) VALUES
       ('CON-01','20100000001','Contrata Demo Andina S.A.','Operaciones Demo','900000001'),
       ('CON-02','20100000002','Servicios Mineros Ejemplo S.A.C.','Logística Demo','900000002'),
       ('CON-03','20100000003','Ingeniería Alto Andino S.A.','RRHH Demo','900000003')`
    )
    .run();

  const count = await d1.prepare("select count(*) as c from rooms").first<{ c: number }>();
  if ((count?.c ?? 0) === 0) {
    for (const r of roomsSeed) {
      await d1
        .prepare(
          `INSERT OR IGNORE INTO rooms (
            id, number, name, room_type, floor, capacity, bed, price_per_night,
            status, amenities, cleaning_notes, cleaning_state, assignment, current_booking_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
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
          null
        )
        .run();
    }
  }
}

async function createPostgresOrPgliteDriver(): Promise<DbDriver> {
  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
  if (databaseUrl) {
    const pg = await import("pg");
    const pool = new pg.default.Pool({ connectionString: databaseUrl, max: 5 });
    return {
      kind: "postgres",
      async sql<T extends SqlRow = SqlRow>(text: string, params: unknown[] = []) {
        return (await pool.query(text, params)).rows as T[];
      },
    };
  }

  // Local Node only — never on Cloudflare Workers
  const { readdir, readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite();
  const dir = path.join(process.cwd(), "migrations");
  const files = (await readdir(dir).catch(() => []))
    .filter((f) => f.endsWith(".sql") && !f.includes("d1"))
    .sort();
  for (const file of files) {
    await db.exec(await readFile(path.join(dir, file), "utf8"));
  }
  const existing = await db.query<{ c: number }>("select count(*)::int as c from rooms");
  if ((existing.rows[0]?.c ?? 0) === 0) {
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
          null,
          null,
        ]
      );
    }
  }
  return {
    kind: "pglite",
    async sql<T extends SqlRow = SqlRow>(text: string, params: unknown[] = []) {
      return (await db.query<T>(text, params)).rows;
    },
  };
}

async function getDriver(): Promise<DbDriver> {
  if (!driverPromise) {
    driverPromise = (async () => {
      const d1 = await getCloudflareD1();
      if (d1) return createD1Driver(d1);
      return createPostgresOrPgliteDriver();
    })().catch((err) => {
      driverPromise = undefined;
      throw err;
    });
  }
  return driverPromise;
}

export async function sql<T extends SqlRow = SqlRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const driver = await getDriver();
  return driver.sql<T>(text, params);
}

export async function ensureSeeded() {
  await sql("select 1 as ok");
}
