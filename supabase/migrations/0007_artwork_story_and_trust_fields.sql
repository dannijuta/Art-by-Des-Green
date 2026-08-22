-- Richer artwork pages: story copy, trust facts (signed/varnished/certificate),
-- SEO title override, and a preserved record of the original (pre-consolidation)
-- category as an internal tag. Also widens availability_status with
-- 'private_collection' and adds an approval-workflow pair of flags so future
-- catalogue additions can be staged before going live, matching how this batch
-- of corrections was reviewed.

alter table artworks add column if not exists short_card_copy text;
alter table artworks add column if not exists seo_title text;

alter table artworks add column if not exists signed boolean;
alter table artworks add column if not exists varnished boolean;
alter table artworks add column if not exists certificate_of_authenticity boolean;

-- The detailed pre-consolidation category name (e.g. "Coastal / Waves"), kept
-- for internal reference once category_id points at a curated public category
-- (e.g. "Coastal & Seascapes"). Not shown publicly.
alter table artworks add column if not exists internal_category_tag text;

alter table artworks add column if not exists title_needs_artist_approval boolean not null default false;
alter table artworks add column if not exists copy_needs_artist_approval boolean not null default false;

-- Widen availability_status to include 'private_collection' (sold/placed but
-- not through this site, e.g. gifted or previously sold elsewhere).
alter table artworks drop constraint if exists artworks_availability_status_check;
alter table artworks add constraint artworks_availability_status_check
  check (availability_status in ('draft','gallery_only','available','reserved','sold','private_collection'));

-- Image role labels for the existing artwork_images table, so a detail/
-- signature/side-angle photo or a labelled illustrative room mock-up can be
-- distinguished from the primary photograph. Defaults to 'detail' for any
-- future additional images; never used to relabel the primary image, which
-- stays on artworks.primary_image_path.
alter table artwork_images add column if not exists image_role text not null default 'detail'
  check (image_role in ('detail','signature','side_angle','lifestyle_illustrative'));
