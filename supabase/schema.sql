-- =====================================================================
-- ELVIS FLORES — Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar en: Supabase Dashboard → SQL Editor (una sola vez).
-- Es idempotente: puede re-ejecutarse sin perder datos.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Administradores: solo los usuarios listados aquí pueden escribir.
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Trigger genérico para updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Perfil (fila única id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.profile (
  id smallint primary key default 1 check (id = 1),
  full_name text not null default 'Elvis Flores' check (char_length(full_name) between 1 and 120),
  brand_name text not null default 'ELVIS FLORES' check (char_length(brand_name) between 1 and 60),
  role text not null default '' check (char_length(role) <= 160),
  hero_tagline text not null default '' check (char_length(hero_tagline) <= 160),
  hero_subtitle text not null default '' check (char_length(hero_subtitle) <= 400),
  bio text check (char_length(bio) <= 4000),
  photo_url text,
  cv_url text,
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  location text check (char_length(location) <= 120),
  education_summary text check (char_length(education_summary) <= 2000),
  interests text[] not null default '{}',
  goals text check (char_length(goals) <= 2000),
  availability text check (char_length(availability) <= 160),
  whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{8,15}$'),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Redes sociales
-- ---------------------------------------------------------------------
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (char_length(platform) between 1 and 40),
  label text not null check (char_length(label) between 1 and 60),
  url text not null check (url ~* '^https?://'),
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Tecnologías
-- ---------------------------------------------------------------------
create table if not exists public.technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 60),
  category text not null check (category in ('frontend','backend','database','tools','design')),
  level smallint check (level between 1 and 5),
  description text check (char_length(description) <= 600),
  usage text check (char_length(usage) <= 1200),
  icon_url text,
  color text check (color is null or color ~* '^#[0-9a-f]{6}$'),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Proyectos
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 120),
  summary text not null default '' check (char_length(summary) <= 400),
  description text check (char_length(description) <= 6000),
  category text not null default 'other' check (category in ('frontend','backend','fullstack','mobile','other')),
  cover_url text,
  gallery text[] not null default '{}',
  technologies text[] not null default '{}',
  problem text check (char_length(problem) <= 3000),
  solution text check (char_length(solution) <= 3000),
  features text[] not null default '{}',
  role text check (char_length(role) <= 2000),
  repo_url text check (repo_url is null or repo_url ~* '^https?://'),
  demo_url text check (demo_url is null or demo_url ~* '^https?://'),
  year text check (char_length(year) <= 20),
  is_featured boolean not null default false,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Certificados
-- ---------------------------------------------------------------------
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  issuer text not null check (char_length(issuer) between 1 and 160),
  issued_at date,
  expires_at date,
  category text not null default 'General' check (char_length(category) between 1 and 60),
  file_url text,
  file_type text check (file_type in ('pdf','image')),
  preview_url text,
  description text check (char_length(description) <= 2000),
  credential_id text check (char_length(credential_id) <= 200),
  verify_url text check (verify_url is null or verify_url ~* '^https?://'),
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint certificates_dates check (expires_at is null or issued_at is null or expires_at >= issued_at)
);

-- ---------------------------------------------------------------------
-- Línea de tiempo (formación, experiencia, prácticas, cursos)
-- ---------------------------------------------------------------------
create table if not exists public.timeline_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('education','experience','internship','project','course')),
  title text not null check (char_length(title) between 1 and 160),
  organization text check (char_length(organization) <= 160),
  location text check (char_length(location) <= 120),
  start_date date,
  end_date date,
  is_current boolean not null default false,
  description text check (char_length(description) <= 3000),
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Textos y visibilidad de secciones
-- ---------------------------------------------------------------------
create table if not exists public.sections (
  key text primary key check (key in ('about','stack','projects','certifications','journey','playground','contact')),
  eyebrow text not null default '' check (char_length(eyebrow) <= 60),
  title text not null check (char_length(title) between 1 and 120),
  subtitle text check (char_length(subtitle) <= 400),
  is_visible boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Mensajes de contacto (solo inserción vía RPC; lectura solo admin)
-- ---------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200),
  subject text not null check (char_length(subject) between 2 and 150),
  message text not null check (char_length(message) between 10 and 5000),
  ip_hash text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_ip_idx on public.contact_messages (ip_hash, created_at desc);

-- ---------------------------------------------------------------------
-- WhatsApp de contacto (proyectos creados con una versión anterior del esquema)
alter table public.profile add column if not exists whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{8,15}$');

-- Traducciones: el contenido base está en inglés; i18n = {"es": {"campo": "valor"}}
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['profile','technologies','projects','certificates','timeline_entries','sections'] loop
    execute format('alter table public.%I add column if not exists i18n jsonb not null default %L::jsonb', t, '{}');
    execute format('alter table public.%I drop constraint if exists %I', t, t || '_i18n_object');
    execute format('alter table public.%I add constraint %I check (jsonb_typeof(i18n) = %L and pg_column_size(i18n) < 65536)', t, t || '_i18n_object', 'object');
  end loop;
end $$;

-- Triggers updated_at
do $$
declare t text;
begin
  foreach t in array array['profile','social_links','technologies','projects','certificates','timeline_entries','sections'] loop
    execute format('drop trigger if exists trg_touch_%1$s on public.%1$s', t);
    execute format('create trigger trg_touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- RLS: lectura pública solo de lo publicado; escritura solo administradores.
-- ---------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.profile enable row level security;
alter table public.social_links enable row level security;
alter table public.technologies enable row level security;
alter table public.projects enable row level security;
alter table public.certificates enable row level security;
alter table public.timeline_entries enable row level security;
alter table public.sections enable row level security;
alter table public.contact_messages enable row level security;

-- ---------------------------------------------------------------------
-- Permisos de la API (Data API). Los proyectos nuevos de Supabase ya no
-- conceden acceso automático a las tablas: sin estos GRANT aparece
-- "permission denied for table ...". RLS sigue decidiendo qué filas se ven.
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.profile, public.social_links, public.technologies, public.projects,
  public.certificates, public.timeline_entries, public.sections to anon, authenticated;
grant insert, update, delete on public.social_links, public.technologies, public.projects,
  public.certificates, public.timeline_entries, public.sections to authenticated;
grant update on public.profile to authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant select on public.admins to authenticated;

-- admins: cada usuario puede ver si él mismo es admin; nadie escribe desde la API.
drop policy if exists admins_self_read on public.admins;
create policy admins_self_read on public.admins for select to authenticated using (user_id = auth.uid());

-- profile
drop policy if exists profile_public_read on public.profile;
create policy profile_public_read on public.profile for select using (true);
drop policy if exists profile_admin_write on public.profile;
create policy profile_admin_write on public.profile for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Tablas con bandera de visibilidad → política pública filtrada + escritura admin
do $$
declare
  rec record;
begin
  for rec in
    select * from (values
      ('social_links', 'is_visible'),
      ('technologies', 'is_active'),
      ('projects', 'is_published'),
      ('certificates', 'is_published'),
      ('timeline_entries', 'is_published'),
      ('sections', 'true')
    ) as v(tbl, flag)
  loop
    execute format('drop policy if exists %1$s_public_read on public.%1$s', rec.tbl);
    execute format('create policy %1$s_public_read on public.%1$s for select using (%2$s or public.is_admin())', rec.tbl, rec.flag);
    execute format('drop policy if exists %1$s_admin_insert on public.%1$s', rec.tbl);
    execute format('create policy %1$s_admin_insert on public.%1$s for insert to authenticated with check (public.is_admin())', rec.tbl);
    execute format('drop policy if exists %1$s_admin_update on public.%1$s', rec.tbl);
    execute format('create policy %1$s_admin_update on public.%1$s for update to authenticated using (public.is_admin()) with check (public.is_admin())', rec.tbl);
    execute format('drop policy if exists %1$s_admin_delete on public.%1$s', rec.tbl);
    execute format('create policy %1$s_admin_delete on public.%1$s for delete to authenticated using (public.is_admin())', rec.tbl);
  end loop;
end $$;

-- contact_messages: sin inserción directa; solo admin lee/actualiza/borra.
drop policy if exists contact_admin_read on public.contact_messages;
create policy contact_admin_read on public.contact_messages for select to authenticated using (public.is_admin());
drop policy if exists contact_admin_update on public.contact_messages;
create policy contact_admin_update on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists contact_admin_delete on public.contact_messages;
create policy contact_admin_delete on public.contact_messages for delete to authenticated using (public.is_admin());

-- RPC de contacto con validación y límite de frecuencia (anti-spam).
create or replace function public.submit_contact(
  p_name text, p_email text, p_subject text, p_message text, p_ip_hash text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  recent int;
  new_id uuid;
begin
  select count(*) into recent from public.contact_messages
   where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';
  if p_ip_hash is not null and recent >= 3 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  select count(*) into recent from public.contact_messages where created_at > now() - interval '1 hour';
  if recent >= 60 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.contact_messages (name, email, subject, message, ip_hash)
  values (btrim(p_name), lower(btrim(p_email)), btrim(p_subject), btrim(p_message), p_ip_hash)
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.submit_contact(text, text, text, text, text) from public;
grant execute on function public.submit_contact(text, text, text, text, text) to anon, authenticated;

-- Estadísticas para el dashboard (solo admin).
create or replace function public.admin_stats()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return json_build_object(
    'projects', (select count(*) from projects),
    'projects_published', (select count(*) from projects where is_published),
    'certificates', (select count(*) from certificates),
    'certificates_published', (select count(*) from certificates where is_published),
    'technologies', (select count(*) from technologies),
    'technologies_active', (select count(*) from technologies where is_active),
    'categories', (
      select count(*) from (
        select 'tech:' || category from technologies
        union select 'project:' || category from projects
        union select 'cert:' || category from certificates
      ) c),
    'timeline', (select count(*) from timeline_entries),
    'messages', (select count(*) from contact_messages),
    'messages_unread', (select count(*) from contact_messages where not is_read)
  );
end;
$$;
revoke all on function public.admin_stats() from public;
grant execute on function public.admin_stats() to authenticated;

-- ---------------------------------------------------------------------
-- STORAGE: buckets públicos de lectura con límites de tamaño y tipo.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml','image/gif']),
  ('documents', 'documents', true, 10485760, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio public read" on storage.objects;
create policy "portfolio public read" on storage.objects for select
  using (bucket_id in ('media', 'documents'));

drop policy if exists "portfolio admin insert" on storage.objects;
create policy "portfolio admin insert" on storage.objects for insert to authenticated
  with check (bucket_id in ('media', 'documents') and public.is_admin());

drop policy if exists "portfolio admin update" on storage.objects;
create policy "portfolio admin update" on storage.objects for update to authenticated
  using (bucket_id in ('media', 'documents') and public.is_admin())
  with check (bucket_id in ('media', 'documents') and public.is_admin());

drop policy if exists "portfolio admin delete" on storage.objects;
create policy "portfolio admin delete" on storage.objects for delete to authenticated
  using (bucket_id in ('media', 'documents') and public.is_admin());
