-- Staff password login for Cloudflare public Worker (no Cursor session).
alter table public.staff_profiles
  add column if not exists password_hash text not null default '';

create index if not exists staff_profiles_email_idx on public.staff_profiles (lower(email));
