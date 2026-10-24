-- Bring the editable settings in line with the public local-SEO copy.
-- The homepage title, footer, artist and contact pages, and JSON-LD are also
-- set in application code, so the live site does not depend on this migration
-- having been run. Applying it keeps the admin dashboard showing the same
-- location, phone format, title, and description.

update settings
set value = jsonb_set(
      jsonb_set(
        value,
        '{defaultTitle}',
        to_jsonb('Art by Des Green | Original Oil Paintings, East London, Eastern Cape'::text)
      ),
      '{defaultDescription}',
      to_jsonb('Original oil paintings by South African artist Des Green, based in East London (Gonubie), Eastern Cape. Browse the collection, view available works and enquire about commissions.'::text)
    ),
    updated_at = now()
where key = 'public.seo';

update settings
set value = jsonb_set(
      value,
      '{basedIn}',
      to_jsonb('East London (Gonubie), Eastern Cape'::text)
    ),
    updated_at = now()
where key = 'public.artist_profile';

update settings
set value = value || jsonb_build_object(
      'phoneDisplay', '+27 83 524 4713',
      'location', 'East London (Gonubie), Eastern Cape'
    ),
    updated_at = now()
where key = 'public.contact';
