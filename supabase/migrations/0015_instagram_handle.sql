-- Instagram handle changed from @artbydesj to @artbydesg.
-- Only the Instagram URL and @handle are rewritten here. The Facebook page
-- move (facebook.com/artbydesj to facebook.com/artbydesg) is in
-- 0016_facebook_page.sql.
-- The public site also rewrites these fields when it reads settings, so
-- the live pages update even if this migration has not been applied yet.

update settings
set value = replace(
      replace(value::text, 'https://www.instagram.com/artbydesj', 'https://www.instagram.com/artbydesg'),
      '@artbydesj',
      '@artbydesg'
    )::jsonb,
    updated_at = now()
where value::text like '%instagram.com/artbydesj%'
   or value::text like '%@artbydesj%';
