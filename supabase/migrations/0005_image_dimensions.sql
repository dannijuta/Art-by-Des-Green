-- Source image pixel dimensions, captured at import time, used to size gallery
-- grid items correctly up front (preserves each painting's aspect ratio and
-- avoids layout shift while the image itself is still loading).
alter table artworks add column if not exists primary_image_width int;
alter table artworks add column if not exists primary_image_height int;

alter table artwork_images add column if not exists width int;
alter table artwork_images add column if not exists height int;
