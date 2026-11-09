-- Hospedaje Shadai — schema maestro + RLS
-- Aplicar en el SQL Editor de Supabase o: supabase db push

create extension if not exists "pgcrypto";

-- Perfiles de personal (vinculados a auth.users)
create table if not exists public.staff_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'housekeeping')),
  sede text not null default 'Challhuahuacho',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.hotel_settings (
  id int primary key default 1 check (id = 1),
  name text not null,
  tagline text,
  city text,
  address text,
  email text,
  phones jsonb not null default '[]'::jsonb,
  wifi_network text,
  wifi_password text, -- solo legible por staff autenticado (RLS)
  checkout_hour text default '11:00',
  currency text default 'S/',
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id text primary key,
  number text not null unique,
  name text not null,
  type text not null check (type in ('confort', 'estandar')),
  floor int not null,
  capacity int not null default 1,
  bed text,
  price_per_night numeric(10,2) not null,
  status text not null check (status in ('disponible','ocupada','limpieza','mantenimiento')) default 'disponible',
  amenities jsonb not null default '[]'::jsonb,
  cleaning_notes text default '',
  housekeeper text,
  cleaning_state text not null default 'limpio',
  assignment jsonb,
  current_booking_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.contratas (
  id text primary key,
  ruc text not null,
  razon_social text not null,
  contacto text,
  telefono text,
  active boolean not null default true
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  room_number text not null references public.rooms(number),
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
  id uuid primary key default gen_random_uuid(),
  ticket text not null unique,
  room_number text not null,
  dni text not null,
  worker_name text not null,
  contrata_name text not null default '',
  night_date date not null,
  checkout_at timestamptz not null,
  tariff numeric(10,2) not null,
  validated boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.petty_cash (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('ingreso','egreso')),
  category text not null,
  description text not null,
  amount numeric(10,2) not null check (amount >= 0),
  sede text not null default 'Challhuahuacho',
  created_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  staff_name text not null,
  role text not null,
  type text not null check (type in ('entrada','salida')),
  note text default '',
  sede text not null default 'Challhuahuacho',
  recorded_at timestamptz not null default now()
);

create table if not exists public.housekeeping_tasks (
  id uuid primary key default gen_random_uuid(),
  room_number text not null,
  status text not null check (status in ('pendiente','completa')) default 'pendiente',
  notes text default '',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Helpers
create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.staff_profiles where id = auth.uid() and active = true
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff_profiles
    where id = auth.uid() and active = true
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff_profiles
    where id = auth.uid() and active = true and role = 'admin'
  )
$$;

-- RLS
alter table public.staff_profiles enable row level security;
alter table public.hotel_settings enable row level security;
alter table public.rooms enable row level security;
alter table public.contratas enable row level security;
alter table public.bookings enable row level security;
alter table public.pernoctas enable row level security;
alter table public.petty_cash enable row level security;
alter table public.attendance enable row level security;
alter table public.housekeeping_tasks enable row level security;

-- staff_profiles
create policy staff_read_own on public.staff_profiles
  for select using (auth.uid() = id or public.is_admin());
create policy staff_admin_write on public.staff_profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- hotel_settings: público ve datos no secretos vía vista; tabla completa solo staff
create policy hotel_settings_staff on public.hotel_settings
  for select using (public.is_staff());
create policy hotel_settings_admin_write on public.hotel_settings
  for update using (public.is_admin()) with check (public.is_admin());

create or replace view public.hotel_public as
  select id, name, tagline, city, address, email, phones, wifi_network, checkout_hour, currency
  from public.hotel_settings;

grant select on public.hotel_public to anon, authenticated;

-- rooms: lectura pública (rack huésped); escritura staff
create policy rooms_public_read on public.rooms for select using (true);
create policy rooms_staff_write on public.rooms
  for all using (public.is_staff()) with check (public.is_staff());

-- contratas / bookings / pernoctas / caja / asistencia: solo staff
create policy contratas_staff on public.contratas
  for all using (public.is_staff()) with check (public.is_staff());
create policy bookings_staff on public.bookings
  for all using (public.is_staff()) with check (public.is_staff());
create policy pernoctas_staff on public.pernoctas
  for all using (public.is_staff()) with check (public.is_staff());
create policy petty_admin on public.petty_cash
  for all using (public.is_admin()) with check (public.is_admin());
create policy attendance_staff on public.attendance
  for all using (public.is_staff()) with check (public.is_staff());
create policy hk_staff on public.housekeeping_tasks
  for all using (public.is_staff()) with check (public.is_staff());

-- Checkout móvil: RPC segura (valida DNI sin exponer padrón completo a anon)
create or replace function public.mobile_validate_checkout(p_room text, p_dni text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.rooms%rowtype;
  asig jsonb;
begin
  select * into r from public.rooms where number = p_room;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Habitación no encontrada');
  end if;
  asig := r.assignment;
  if asig is null then
    return jsonb_build_object('ok', false, 'error', 'Habitación sin guardia asignada');
  end if;
  if (asig->>'dni') is distinct from p_dni then
    return jsonb_build_object('ok', false, 'error', 'DNI no corresponde a la habitación');
  end if;
  if coalesce((asig->>'checkedOutToday')::boolean, false) then
    return jsonb_build_object('ok', false, 'error', 'Salida ya registrada hoy', 'already', true);
  end if;
  return jsonb_build_object(
    'ok', true,
    'workerName', asig->>'workerName',
    'contrataName', asig->>'contrataName',
    'roomNumber', r.number
  );
end;
$$;

create or replace function public.mobile_confirm_checkout(p_room text, p_dni text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  validation jsonb;
  r public.rooms%rowtype;
  asig jsonb;
  new_ticket text;
  tariff numeric(10,2);
begin
  validation := public.mobile_validate_checkout(p_room, p_dni);
  if coalesce((validation->>'ok')::boolean, false) is not true then
    return validation;
  end if;

  select * into r from public.rooms where number = p_room for update;
  asig := r.assignment;
  tariff := r.price_per_night;
  new_ticket := 'TK-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 6));

  asig := jsonb_set(asig, '{checkedOutToday}', 'true'::jsonb, true);
  asig := jsonb_set(asig, '{lastCheckoutAt}', to_jsonb(now()::text), true);

  update public.rooms
    set status = 'limpieza',
        cleaning_state = 'sucio',
        assignment = asig,
        updated_at = now()
    where number = p_room;

  insert into public.housekeeping_tasks (room_number, status, notes)
    values (p_room, 'pendiente', 'Check-out móvil — aseo diario');

  insert into public.pernoctas (ticket, room_number, dni, worker_name, contrata_name, night_date, checkout_at, tariff)
    values (
      new_ticket,
      p_room,
      p_dni,
      validation->>'workerName',
      coalesce(validation->>'contrataName', ''),
      (now() - interval '1 day')::date,
      now(),
      tariff
    );

  return jsonb_build_object('ok', true, 'ticket', new_ticket, 'checkoutAt', now());
end;
$$;

revoke all on function public.mobile_validate_checkout(text, text) from public;
revoke all on function public.mobile_confirm_checkout(text, text) from public;
grant execute on function public.mobile_validate_checkout(text, text) to anon, authenticated;
grant execute on function public.mobile_confirm_checkout(text, text) to anon, authenticated;
