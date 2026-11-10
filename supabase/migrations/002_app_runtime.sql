-- Schema compatible with the Hospedaje Shadai Cloudflare Worker APIs.
-- Run in Supabase → SQL Editor (after or instead of 001 if tables conflict).

create extension if not exists "pgcrypto";

create table if not exists public.staff_profiles (
  viewer_sub text primary key,
  email text not null default '',
  full_name text not null default '',
  role text not null check (role in ('admin', 'housekeeping')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.hotel_settings (
  id int primary key check (id = 1),
  name text not null,
  tagline text not null,
  city text not null,
  address text not null,
  email text not null,
  phones jsonb not null default '[]'::jsonb,
  wifi_network text not null,
  checkout_hour text not null default '11:00',
  currency text not null default 'S/'
);

create table if not exists public.rooms (
  id text primary key,
  number text not null unique,
  name text not null,
  room_type text not null check (room_type in ('confort', 'estandar')),
  floor int not null,
  capacity int not null default 1,
  bed text not null default '',
  price_per_night numeric(10,2) not null,
  status text not null check (status in ('disponible','ocupada','limpieza','mantenimiento')) default 'disponible',
  amenities jsonb not null default '[]'::jsonb,
  cleaning_notes text not null default '',
  cleaning_state text not null default 'limpio',
  assignment jsonb,
  current_booking_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.contratas (
  id text primary key,
  ruc text not null,
  razon_social text not null,
  contacto text not null default '',
  telefono text not null default ''
);

create table if not exists public.bookings (
  id text primary key,
  code text not null unique,
  room_number text not null,
  guest_name text not null,
  guest_doc text not null,
  check_in date not null,
  check_out date,
  status text not null check (status in ('activa','cerrada','cancelada')) default 'activa',
  base_price numeric(10,2) not null,
  charges jsonb not null default '[]'::jsonb,
  payments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.pernoctas (
  id text primary key,
  ticket text not null unique,
  room_number text not null,
  dni text not null,
  worker_name text not null,
  contrata_name text not null default '',
  night_date date not null,
  checkout_at timestamptz not null,
  tariff numeric(10,2) not null,
  validated boolean not null default true
);

create table if not exists public.petty_cash (
  id text primary key,
  entry_type text not null check (entry_type in ('ingreso','egreso')),
  category text not null,
  description text not null,
  amount numeric(10,2) not null check (amount >= 0),
  sede text not null default 'Challhuahuacho',
  created_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id text primary key,
  staff_name text not null,
  staff_role text not null,
  mark_type text not null check (mark_type in ('entrada','salida')),
  note text not null default '',
  sede text not null default 'Challhuahuacho',
  recorded_at timestamptz not null default now()
);

create table if not exists public.housekeeping_tasks (
  id text primary key,
  room_number text not null,
  status text not null check (status in ('pendiente','completa')) default 'pendiente',
  notes text not null default '',
  created_at timestamptz not null default now()
);

insert into public.hotel_settings (id, name, tagline, city, address, email, phones, wifi_network, checkout_hour, currency)
values (
  1,
  'Hospedaje Shadai',
  'Bajo la cobertura del Altísimo',
  'Challhuahuacho, Cotabambas — Apurímac',
  'Av. 18 de Noviembre s/n — Barrio Los Álamos, Challhuahuacho',
  'hospedajeshadai@gmail.com',
  '[{"number":"949 268 775","label":"Atención / Reservas","whatsapp":"51949268775"},{"number":"992 125 903","label":"Recepción","whatsapp":"51992125903"}]'::jsonb,
  'HOSPEDAJE SHADAI',
  '11:00',
  'S/'
)
on conflict (id) do nothing;

insert into public.contratas (id, ruc, razon_social, contacto, telefono) values
  ('CON-01', '20100000001', 'Contrata Demo Andina S.A.', 'Operaciones Demo', '900000001'),
  ('CON-02', '20100000002', 'Servicios Mineros Ejemplo S.A.C.', 'Logística Demo', '900000002'),
  ('CON-03', '20100000003', 'Ingeniería Alto Andino S.A.', 'RRHH Demo', '900000003')
on conflict (id) do nothing;

-- Public read for guest portal; writes go through the Worker with the service role.
alter table public.hotel_settings enable row level security;
alter table public.rooms enable row level security;
alter table public.contratas enable row level security;
alter table public.pernoctas enable row level security;
alter table public.petty_cash enable row level security;
alter table public.attendance enable row level security;
alter table public.housekeeping_tasks enable row level security;
alter table public.staff_profiles enable row level security;

drop policy if exists hotel_public_read on public.hotel_settings;
create policy hotel_public_read on public.hotel_settings for select using (true);

drop policy if exists rooms_public_read on public.rooms;
create policy rooms_public_read on public.rooms for select using (true);

drop policy if exists contratas_public_read on public.contratas;
create policy contratas_public_read on public.contratas for select using (true);
