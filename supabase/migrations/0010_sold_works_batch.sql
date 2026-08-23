-- Adds the 15-painting "SOLD_Renamed" batch as sold works.
--
-- 3 of the 15 images are exact duplicates of paintings already in the
-- catalogue (the "Where the Light Leads" sailboat series, ranks 29-31) — for
-- those, the existing row is simply flipped to sold rather than creating a
-- duplicate artwork.
--
-- The other 12 are genuinely new pieces with no title, dimensions, price, or
-- description supplied — none of that is invented here. public_title is a
-- plain, literal description derived from the client-provided filename
-- (required: the column is NOT NULL), and title_needs_artist_approval is set
-- so the admin dashboard visibly flags it as unconfirmed rather than
-- presenting it as an official title.
--
-- Safe to re-run: inserts are guarded by rank, updates are idempotent.

-- Already-catalogued duplicates: mark sold, no new rows.
update artworks set availability_status = 'sold'
where rank in (29, 30, 31) and availability_status <> 'sold';

-- New sold-only pieces.
with c(rank, slug, public_title, category_name, image_path, image_width, image_height, alt_text) as (
  values
  (69, 'chimpanzee-playing-pool', 'Chimpanzee Playing Pool', 'Character Series',
   '/images/artworks/originals/69-chimpanzee-playing-pool.jpg', 1109, 1412,
   'Oil painting depicting a chimpanzee playing pool by South African artist Des Green.'),
  (70, 'chimpanzee-with-beer-and-cigarette', 'Chimpanzee with Beer and Cigarette', 'Character Series',
   '/images/artworks/originals/70-chimpanzee-with-beer-and-cigarette.jpg', 875, 1109,
   'Oil painting depicting a chimpanzee holding a beer and cigarette by South African artist Des Green.'),
  (71, 'chimpanzee-at-the-bar', 'Chimpanzee at the Bar', 'Character Series',
   '/images/artworks/originals/71-chimpanzee-at-the-bar.jpg', 1048, 1406,
   'Oil painting depicting a chimpanzee at the bar by South African artist Des Green.'),
  (72, 'chimpanzee-poker-player', 'Chimpanzee Poker Player', 'Character Series',
   '/images/artworks/originals/72-chimpanzee-poker-player.jpg', 1139, 1460,
   'Oil painting depicting a chimpanzee playing poker by South African artist Des Green.'),
  (73, 'helmeted-guineafowl-portrait', 'Helmeted Guineafowl Portrait', 'Wildlife & Animals',
   '/images/artworks/originals/73-helmeted-guineafowl-portrait.jpg', 1230, 1600,
   'Oil painting depicting a helmeted guineafowl portrait by South African artist Des Green.'),
  (74, 'african-wild-dog-portrait', 'African Wild Dog Portrait', 'Wildlife & Animals',
   '/images/artworks/originals/74-african-wild-dog-portrait.jpg', 856, 1187,
   'Oil painting depicting an African wild dog portrait by South African artist Des Green.'),
  (75, 'pair-of-seagulls-by-the-sea', 'Pair of Seagulls by the Sea', 'Coastal & Seascapes',
   '/images/artworks/originals/75-pair-of-seagulls-by-the-sea.jpg', 1332, 1600,
   'Oil painting depicting a pair of seagulls by the sea by South African artist Des Green.'),
  (76, 'seagull-diving-for-fish', 'Seagull Diving for Fish', 'Coastal & Seascapes',
   '/images/artworks/originals/76-seagull-diving-for-fish.jpg', 1137, 1600,
   'Oil painting depicting a seagull diving for fish by South African artist Des Green.'),
  (77, 'hands-pinky-promise', 'Hands: Pinky Promise', 'Figurative & Portraits',
   '/images/artworks/originals/77-hands-pinky-promise.jpg', 1337, 1600,
   'Oil painting depicting two hands making a pinky promise by South African artist Des Green.'),
  (78, 'woman-with-wolf-portrait', 'Woman with Wolf Portrait', 'Figurative & Portraits',
   '/images/artworks/originals/78-woman-with-wolf-portrait.jpg', 1035, 1600,
   'Oil painting depicting a woman with a wolf portrait by South African artist Des Green.'),
  (79, 'woman-walking-into-water', 'Woman Walking into Water', 'Figurative & Portraits',
   '/images/artworks/originals/79-woman-walking-into-water.jpg', 1136, 814,
   'Oil painting depicting a woman walking into water by South African artist Des Green.'),
  (80, 'colourful-glass-palace-interior', 'Colourful Glass Palace Interior', 'Cityscapes',
   '/images/artworks/originals/80-colourful-glass-palace-interior.jpg', 799, 1218,
   'Oil painting depicting a colourful glass palace interior by South African artist Des Green.')
)
insert into artworks (
  rank, slug, public_title, category_id,
  primary_image_path, primary_image_width, primary_image_height, alt_text,
  availability_status, publishing_status, title_needs_artist_approval
)
select
  c.rank, c.slug, c.public_title,
  (select id from categories where name = c.category_name),
  c.image_path, c.image_width, c.image_height, c.alt_text,
  'sold', 'published', true
from c
where not exists (select 1 from artworks where artworks.rank = c.rank);
