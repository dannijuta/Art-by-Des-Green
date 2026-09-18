-- Adds 13 new original paintings supplied directly by Des (titles, sizes,
-- prices and descriptions all provided by the artist — none invented here).
--
-- "Where the Light Leads" was renamed to "Where the Light Breaks" to avoid
-- confusion with the existing sailboat triptych (ranks 29-31) of the same
-- name — confirmed with Danni this is a different, unrelated painting.
--
-- All published + available immediately, matching the existing batch-import
-- precedent (0010, 0011).
--
-- Safe to re-run: inserts are guarded by rank.

with c(
  rank, slug, public_title, category_name, width_cm, height_cm, price_cents,
  public_description, image_path, image_width, image_height, alt_text
) as (
  values
  (178, 'little-braveheart', 'Little Braveheart', 'Wildlife & Animals', 15.0, 19.0, 35000,
   'A tiny mouse with a surprisingly big presence, captured in soft earthy tones and delicate detail.',
   '/images/artworks/originals/little-braveheart-des-green.jpg', 1466, 1920,
   'Oil painting of a mouse titled Little Braveheart by South African artist Des Green.'),

  (179, 'out-on-a-limb', 'Out on a Limb', 'Wildlife & Animals', 15.0, 19.0, 35000,
   'A curious little mouse balances on a branch, full of character and quiet charm.',
   '/images/artworks/originals/out-on-a-limb-des-green.jpg', 1479, 1920,
   'Oil painting of a mouse titled Out on a Limb by South African artist Des Green.'),

  (180, 'just-a-peek', 'Just a Peek', 'Wildlife & Animals', 15.0, 19.0, 35000,
   'A cautious little visitor peers around the corner in this playful, character-filled miniature.',
   '/images/artworks/originals/just-a-peek-des-green.jpg', 1486, 1920,
   'Oil painting of a mouse titled Just a Peek by South African artist Des Green.'),

  (181, 'caught-looking', 'Caught Looking', 'Wildlife & Animals', 15.0, 19.0, 35000,
   'A cheeky mouse peeks into view, bringing a touch of humour and personality to a small canvas.',
   '/images/artworks/originals/caught-looking-des-green.jpg', 1477, 1920,
   'Oil painting of a mouse titled Caught Looking by South African artist Des Green.'),

  (182, 'golden-gaze', 'Golden Gaze', 'Wildlife & Animals', 15.0, 19.0, 35000,
   'An intense golden eye steals the spotlight in this striking, beautifully textured owl portrait.',
   '/images/artworks/originals/golden-gaze-des-green.jpg', 1198, 1600,
   'Oil painting of an owl titled Golden Gaze by South African artist Des Green.'),

  (183, 'quiet-sentinel', 'Quiet Sentinel', 'Wildlife & Animals', 15.0, 19.0, 35000,
   'A watchful owl emerges from soft, muted tones with an almost regal stillness.',
   '/images/artworks/originals/quiet-sentinel-des-green.jpg', 1205, 1593,
   'Oil painting of an owl titled Quiet Sentinel by South African artist Des Green.'),

  (184, 'the-night-watch', 'The Night Watch', 'Wildlife & Animals', 15.0, 19.0, 35000,
   'Moody, magnificent, and full of attitude, this owl portrait brings unmistakable character to a small space.',
   '/images/artworks/originals/the-night-watch-des-green.jpg', 1218, 1599,
   'Oil painting of an owl titled The Night Watch by South African artist Des Green.'),

  (185, 'red-umbrella-day', 'Red Umbrella Day', 'Cityscapes', 20.0, 20.0, 45000,
   'A splash of red cuts through a rainy city afternoon, with glowing reflections bringing the street to life.',
   '/images/artworks/originals/red-umbrella-day-des-green.jpg', 1309, 1315,
   'Oil painting of a rainy city street titled Red Umbrella Day by South African artist Des Green.'),

  (186, 'between-the-raindrops', 'Between the Raindrops', 'Cityscapes', 20.0, 20.0, 45000,
   'Colour, movement, and reflections meet in a lively city scene painted beneath a canopy of umbrellas.',
   '/images/artworks/originals/between-the-raindrops-des-green.jpg', 1356, 1385,
   'Oil painting of a rainy city street titled Between the Raindrops by South African artist Des Green.'),

  (187, 'after-hours', 'After Hours', 'Cityscapes', 50.0, 75.0, 450000,
   'Warm window light spills into an old city passage, creating a rich and atmospheric evening scene.',
   '/images/artworks/originals/after-hours-des-green.jpg', 1268, 1920,
   'Oil painting of an old city passage titled After Hours by South African artist Des Green.'),

  (188, 'fuchsia-whispers', 'Fuchsia Whispers', 'Still Life', 40.0, 40.0, 190000,
   'Soft fuchsia blooms spill from a timeworn pot, set against a richly textured neutral background with a beautifully aged, painterly feel.',
   '/images/artworks/originals/fuchsia-whispers-des-green.jpg', 1600, 1600,
   'Oil painting of potted fuchsia flowers by South African artist Des Green.'),

  (189, 'garden-gathering', 'Garden Gathering', 'Still Life', 40.0, 40.0, 190000,
   'A cheerful trio of potted blooms in dusky rose, white, and warm peach, painted with soft texture and an inviting vintage garden feel.',
   '/images/artworks/originals/garden-gathering-des-green.jpg', 1564, 1600,
   'Oil painting of three potted flowers by South African artist Des Green.'),

  (190, 'where-the-light-breaks', 'Where the Light Breaks', 'Coastal & Seascapes', 60.0, 90.0, 640000,
   'A dramatic ocean beneath a vast, shifting sky, where a break in the clouds draws the eye toward the distant light.',
   '/images/artworks/originals/where-the-light-breaks-des-green.jpg', 1600, 1070,
   'Oil painting of a stormy ocean titled Where the Light Breaks by South African artist Des Green.')
)
insert into artworks (
  rank, slug, public_title, category_id, width_cm, height_cm, medium, surface, framed, price_cents,
  public_description, primary_image_path, primary_image_width, primary_image_height, alt_text,
  availability_status, publishing_status, title_needs_artist_approval
)
select
  c.rank, c.slug, c.public_title,
  (select id from categories where name = c.category_name),
  c.width_cm, c.height_cm, 'Oil', 'Canvas', false, c.price_cents,
  c.public_description, c.image_path, c.image_width, c.image_height, c.alt_text,
  'available', 'published', false
from c
where not exists (select 1 from artworks where artworks.rank = c.rank);
