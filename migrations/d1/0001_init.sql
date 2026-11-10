-- D1 / SQLite schema for Cloudflare Workers

CREATE TABLE IF NOT EXISTS staff_profiles (
  viewer_sub TEXT PRIMARY KEY,
  email TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('admin', 'housekeeping')),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hotel_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT NOT NULL,
  phones TEXT NOT NULL DEFAULT '[]',
  wifi_network TEXT NOT NULL,
  checkout_hour TEXT NOT NULL DEFAULT '11:00',
  currency TEXT NOT NULL DEFAULT 'S/'
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('confort', 'estandar')),
  floor INTEGER NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  bed TEXT NOT NULL DEFAULT '',
  price_per_night REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible','ocupada','limpieza','mantenimiento')),
  amenities TEXT NOT NULL DEFAULT '[]',
  cleaning_notes TEXT NOT NULL DEFAULT '',
  cleaning_state TEXT NOT NULL DEFAULT 'limpio',
  assignment TEXT,
  current_booking_id TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contratas (
  id TEXT PRIMARY KEY,
  ruc TEXT NOT NULL,
  razon_social TEXT NOT NULL,
  contacto TEXT NOT NULL DEFAULT '',
  telefono TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  room_number TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_doc TEXT NOT NULL,
  check_in TEXT NOT NULL,
  check_out TEXT,
  status TEXT NOT NULL DEFAULT 'activa' CHECK (status IN ('activa','cerrada','cancelada')),
  base_price REAL NOT NULL,
  charges TEXT NOT NULL DEFAULT '[]',
  payments TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pernoctas (
  id TEXT PRIMARY KEY,
  ticket TEXT NOT NULL UNIQUE,
  room_number TEXT NOT NULL,
  dni TEXT NOT NULL,
  worker_name TEXT NOT NULL,
  contrata_name TEXT NOT NULL DEFAULT '',
  night_date TEXT NOT NULL,
  checkout_at TEXT NOT NULL,
  tariff REAL NOT NULL,
  validated INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS petty_cash (
  id TEXT PRIMARY KEY,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('ingreso','egreso')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount >= 0),
  sede TEXT NOT NULL DEFAULT 'Challhuahuacho',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  staff_name TEXT NOT NULL,
  staff_role TEXT NOT NULL,
  mark_type TEXT NOT NULL CHECK (mark_type IN ('entrada','salida')),
  note TEXT NOT NULL DEFAULT '',
  sede TEXT NOT NULL DEFAULT 'Challhuahuacho',
  recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','completa')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO hotel_settings (id, name, tagline, city, address, email, phones, wifi_network, checkout_hour, currency)
VALUES (
  1,
  'Hospedaje Shadai',
  'Bajo la cobertura del Altísimo',
  'Challhuahuacho, Cotabambas — Apurímac',
  'Av. 18 de Noviembre s/n — Barrio Los Álamos, Challhuahuacho',
  'hospedajeshadai@gmail.com',
  '[{"number":"949 268 775","label":"Atención / Reservas","whatsapp":"51949268775"},{"number":"992 125 903","label":"Recepción","whatsapp":"51992125903"}]',
  'HOSPEDAJE SHADAI',
  '11:00',
  'S/'
);

INSERT OR IGNORE INTO contratas (id, ruc, razon_social, contacto, telefono) VALUES
  ('CON-01', '20100000001', 'Contrata Demo Andina S.A.', 'Operaciones Demo', '900000001'),
  ('CON-02', '20100000002', 'Servicios Mineros Ejemplo S.A.C.', 'Logística Demo', '900000002'),
  ('CON-03', '20100000003', 'Ingeniería Alto Andino S.A.', 'RRHH Demo', '900000003');
