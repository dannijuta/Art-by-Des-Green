-- Art by Des Green — core schema
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / OR REPLACE).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id serial primary key,
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Artworks
-- ---------------------------------------------------------------------------
create table if not exists artworks (
  id uuid primary key default gen_random_uuid(),
  rank int not null unique,
  slug text not null unique,

  public_title text not null,
  working_description text,
  public_description text,

  category_id int references categories(id) on delete set null,

  width_cm numeric(6,1),
  height_cm numeric(6,1),
  medium text,
  surface text,
  framed boolean,

  price_cents integer,

  availability_status text not null default 'draft'
    check (availability_status in ('draft','gallery_only','available','reserved','sold')),
  publishing_status text not null default 'draft'
    check (publishing_status in ('draft','published','archived')),

  is_featured boolean not null default false,
  is_hero boolean not null default false,
  display_order int,

  primary_image_path text,
  alt_text text,

  shipping_method_override text
    check (shipping_method_override in ('included','flat_rate','collection','quote_required')),

  -- true once an admin has hand-edited this row; the importer will then skip it
  -- on re-import unless explicitly forced.
  admin_edited boolean not null default false,

  -- Internal, business-only fields. Never selected by any public-facing query.
  internal_launch_priority text,
  internal_sellability_tier text,
  internal_selling_note text,
  internal_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint price_must_be_positive check (price_cents is null or price_cents > 0),
  constraint dimensions_both_or_neither check (
    (width_cm is null and height_cm is null) or (width_cm is not null and height_cm is not null)
  )
);

create index if not exists idx_artworks_availability on artworks(availability_status);
create index if not exists idx_artworks_publishing on artworks(publishing_status);
create index if not exists idx_artworks_category on artworks(category_id);

create table if not exists artwork_images (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references artworks(id) on delete cascade,
  image_path text not null,
  alt_text text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_artwork_images_artwork on artwork_images(artwork_id);

-- ---------------------------------------------------------------------------
-- Site settings (key/value; each key is validated by application code)
-- ---------------------------------------------------------------------------
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Admin users (custom credential store; not Supabase Auth — see README)
-- ---------------------------------------------------------------------------
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text,
  role text not null default 'admin' check (role in ('admin','owner')),
  session_version int not null default 1,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Orders / inventory / payments
-- ---------------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status text not null default 'draft'
    check (status in ('draft','pending','quote_required','reserved','awaiting_payment','paid','sold','cancelled','expired','refunded')),

  customer_name text not null,
  customer_email text not null,
  customer_phone text,

  shipping_method text not null check (shipping_method in ('included','flat_rate','collection','quote_required')),
  shipping_address jsonb,

  artwork_price_cents integer not null,
  shipping_cents integer,
  total_cents integer,

  payfast_payment_id text unique,
  payfast_pf_payment_id text,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz
);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_email on orders(customer_email);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  artwork_id uuid not null references artworks(id),
  unit_price_cents integer not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_order_items_artwork on order_items(artwork_id);

-- One-of-one inventory protection: only one ACTIVE reservation may exist per
-- artwork at any time. A second concurrent checkout attempt fails this unique
-- index at the database level, not just in application logic.
create table if not exists inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references artworks(id),
  order_id uuid not null references orders(id) on delete cascade,
  status text not null default 'active' check (status in ('active','released','completed')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create unique index if not exists one_active_reservation_per_artwork
  on inventory_reservations(artwork_id) where status = 'active';
create index if not exists idx_reservations_order on inventory_reservations(order_id);
create index if not exists idx_reservations_expires on inventory_reservations(expires_at) where status = 'active';

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null default 'payfast',
  amount_cents integer not null,
  status text not null default 'pending' check (status in ('pending','completed','failed','cancelled')),
  provider_payment_id text,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_order on payments(order_id);

-- Every inbound payment notification is logged, valid or not, so duplicate or
-- forged notifications are always auditable and never processed twice.
create table if not exists payment_notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  provider text not null default 'payfast',
  signature_valid boolean not null,
  source_ip_valid boolean,
  amount_valid boolean,
  raw_body text not null,
  pf_payment_id text,
  payment_status text,
  processed boolean not null default false,
  received_at timestamptz not null default now()
);
create index if not exists idx_payment_notifications_order on payment_notifications(order_id);
create index if not exists idx_payment_notifications_pf_id on payment_notifications(pf_payment_id);

create table if not exists shipping_quote_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  address jsonb not null,
  status text not null default 'pending' check (status in ('pending','quoted','approved','expired','cancelled')),
  quoted_shipping_cents integer,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_shipping_quotes_order on shipping_quote_requests(order_id);

-- ---------------------------------------------------------------------------
-- Enquiries
-- ---------------------------------------------------------------------------
create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  reason text not null check (reason in ('availability','purchase','commission','shipping','general')),
  name text not null,
  email text not null,
  phone text,
  artwork_id uuid references artworks(id),
  message text not null,
  consent boolean not null default false,
  status text not null default 'new' check (status in ('new','read','replied','archived')),
  created_at timestamptz not null default now()
);
create index if not exists idx_enquiries_status on enquiries(status);

create table if not exists commission_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  preferred_contact_method text,
  subject text not null,
  preferred_dimensions text,
  budget_range text,
  desired_completion_date text,
  reference_image_path text,
  additional_info text,
  consent boolean not null default false,
  status text not null default 'new' check (status in ('new','read','replied','archived')),
  created_at timestamptz not null default now()
);
create index if not exists idx_commission_enquiries_status on commission_enquiries(status);

-- ---------------------------------------------------------------------------
-- Spam / rate limiting (simple sliding-window counter, persisted so it works
-- across serverless function instances)
-- ---------------------------------------------------------------------------
create table if not exists form_submission_log (
  id bigserial primary key,
  ip_hash text not null,
  form text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_form_submission_log_lookup on form_submission_log(ip_hash, form, created_at);

-- ---------------------------------------------------------------------------
-- Admin audit log
-- ---------------------------------------------------------------------------
create table if not exists audit_log (
  id bigserial primary key,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_artworks_updated_at on artworks;
create trigger trg_artworks_updated_at before update on artworks
  for each row execute function set_updated_at();

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at before update on orders
  for each row execute function set_updated_at();

drop trigger if exists trg_shipping_quotes_updated_at on shipping_quote_requests;
create trigger trg_shipping_quotes_updated_at before update on shipping_quote_requests
  for each row execute function set_updated_at();
