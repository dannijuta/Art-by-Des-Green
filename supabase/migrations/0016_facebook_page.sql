-- Facebook page changed from facebook.com/artbydesj to facebook.com/artbydesg.
-- The public site also rewrites facebookUrl when it reads settings, so the
-- live pages update even if this migration has not been applied yet.

update settings
set value = replace(value::text, 'facebook.com/artbydesj', 'facebook.com/artbydesg')::jsonb,
    updated_at = now()
where value::text like '%facebook.com/artbydesj%';
