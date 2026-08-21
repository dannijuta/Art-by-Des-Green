-- Trigram indexes so the Gallery search box stays fast as the catalogue grows.
create extension if not exists pg_trgm;

create index if not exists idx_artworks_title_trgm on artworks using gin (public_title gin_trgm_ops);
create index if not exists idx_artworks_description_trgm on artworks using gin (coalesce(working_description, '') gin_trgm_ops);
