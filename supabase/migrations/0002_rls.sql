-- Row Level Security.
--
-- The Next.js app talks to Postgres over a direct server-side connection
-- (DATABASE_URL) and never from the browser, so RLS is defense-in-depth here —
-- but Supabase also auto-exposes every table over its PostgREST API to the
-- `anon` and `authenticated` roles unless RLS blocks it, so this matters if
-- that API is ever reachable. Everything is locked down by default; only a
-- narrow, deliberate set of public reads is allowed.

alter table categories enable row level security;
alter table artworks enable row level security;
alter table artwork_images enable row level security;
alter table settings enable row level security;
alter table admin_users enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table inventory_reservations enable row level security;
alter table payments enable row level security;
alter table payment_notifications enable row level security;
alter table shipping_quote_requests enable row level security;
alter table enquiries enable row level security;
alter table commission_enquiries enable row level security;
alter table form_submission_log enable row level security;
alter table audit_log enable row level security;

-- Public (anon) read access: only published, non-draft catalogue data.
drop policy if exists categories_public_read on categories;
create policy categories_public_read on categories for select to anon, authenticated using (true);

drop policy if exists artworks_public_read on artworks;
create policy artworks_public_read on artworks for select to anon, authenticated
  using (publishing_status = 'published');

drop policy if exists artwork_images_public_read on artwork_images;
create policy artwork_images_public_read on artwork_images for select to anon, authenticated
  using (
    exists (
      select 1 from artworks a
      where a.id = artwork_images.artwork_id and a.publishing_status = 'published'
    )
  );

drop policy if exists settings_public_read on settings;
create policy settings_public_read on settings for select to anon, authenticated
  using (key like 'public.%');

-- Everything else (orders, payments, enquiries, admin users, audit log, etc.)
-- has RLS enabled with no policies at all for anon/authenticated, which means
-- default-deny: nothing is readable or writable through the public API.
-- The application's server-side connection uses the Postgres owner role and
-- bypasses RLS by design, which is safe because that connection string is
-- only ever held on the server (see .env.example).
