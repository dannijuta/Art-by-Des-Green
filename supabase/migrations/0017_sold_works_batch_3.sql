-- Mark 11 more works as sold (by catalogue rank / painting number):
-- 22, 24, 47, 58, 59, 60, 61, 66, 188, 189, 190.
-- Already applied to the live database on 2026-10-30; kept for the record.
-- Safe to re-run.
update artworks set availability_status = 'sold', updated_at = now()
where rank in (22, 24, 47, 58, 59, 60, 61, 66, 188, 189, 190);

