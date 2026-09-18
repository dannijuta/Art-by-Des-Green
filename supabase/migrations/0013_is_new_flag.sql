-- The "NEW" badge was previously inferred from created_at, on the
-- assumption that recent rows meant recently-added paintings. That's wrong
-- for this catalogue: the whole thing (177 existing works) was bulk-imported
-- within the last month, so every single piece showed as "new" at once.
--
-- Replace it with an explicit flag, same pattern as is_featured/is_hero —
-- admin-controlled, not time-inferred. Only the 13 paintings actually added
-- in this batch (ranks 178-190) start out flagged.

alter table artworks add column if not exists is_new boolean not null default false;

update artworks set is_new = true where rank between 178 and 190;
