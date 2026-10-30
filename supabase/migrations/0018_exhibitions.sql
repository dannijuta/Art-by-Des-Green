-- Exhibitions shown on /exhibitions and managed from the admin dashboard.
-- Upcoming vs past is derived from end_date at read time.
create table if not exists exhibitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  venue text not null,
  town text not null,
  start_date date not null,
  end_date date not null,
  description text,
  image_path text,
  link_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exhibitions_dates_check check (end_date >= start_date)
);

create index if not exists idx_exhibitions_end_date on exhibitions(end_date);

-- Same lockdown as every other table (see 0002_rls.sql): the app reads over
-- its server-side connection; nothing is exposed through Supabase's API.
alter table exhibitions enable row level security;
