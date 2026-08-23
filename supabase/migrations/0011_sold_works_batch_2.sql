-- Batch 2 of sold works (97 pieces). 2 of the 99 supplied images were
-- confirmed exact duplicates of existing catalogue pieces by direct visual
-- comparison and are excluded here (not re-imported):
--   - helmeted guineafowl portrait (already rank 73)
--   - mussels and lemons (already rank 58)
--
-- No title, dimensions, price, or description was supplied for any piece
-- here -- none of that is invented. public_title is a plain, literal
-- description derived from the client-provided filenames (required: the
-- column is NOT NULL), and title_needs_artist_approval is set so the admin
-- dashboard visibly flags every one as unconfirmed.
--
-- Safe to re-run: the insert is guarded by rank.

with c(rank, slug, public_title, category_name, image_path, image_width, image_height, alt_text) as (
  values
  (81, 'pearlescent-shells', 'Pearlescent Shells', 'Still Life', '/images/artworks/originals/81-pearlescent-shells.jpg', 1080, 832, 'Oil painting depicting pearlescent shells by South African artist Des Green.'),
  (82, 'smiling-woman-in-a-colourful-headwrap', 'Smiling Woman in a Colourful Headwrap', 'Figurative & Portraits', '/images/artworks/originals/82-smiling-woman-in-a-colourful-headwrap.jpg', 1600, 1577, 'Oil painting depicting smiling woman in a colourful headwrap by South African artist Des Green.'),
  (83, 'smiling-woman-in-headwrap-and-jacket', 'Smiling Woman in Headwrap and Jacket', 'Figurative & Portraits', '/images/artworks/originals/83-smiling-woman-in-headwrap-and-jacket.jpg', 1192, 1512, 'Oil painting depicting smiling woman in headwrap and jacket by South African artist Des Green.'),
  (84, 'buffalo-portrait', 'Buffalo Portrait', 'Wildlife & Animals', '/images/artworks/originals/84-buffalo-portrait.jpg', 1600, 1069, 'Oil painting depicting buffalo portrait by South African artist Des Green.'),
  (85, 'dung-beetle', 'Dung Beetle', 'Wildlife & Animals', '/images/artworks/originals/85-dung-beetle.jpg', 1600, 1170, 'Oil painting depicting dung beetle by South African artist Des Green.'),
  (86, 'elephant-close-up', 'Elephant Close-Up', 'Wildlife & Animals', '/images/artworks/originals/86-elephant-close-up.jpg', 1051, 1600, 'Oil painting depicting elephant close-up by South African artist Des Green.'),
  (87, 'elephant-front-portrait', 'Elephant Front Portrait', 'Wildlife & Animals', '/images/artworks/originals/87-elephant-front-portrait.jpg', 876, 1275, 'Oil painting depicting elephant front portrait by South African artist Des Green.'),
  (88, 'leopard-resting-portrait', 'Leopard Resting Portrait', 'Wildlife & Animals', '/images/artworks/originals/88-leopard-resting-portrait.jpg', 1089, 1599, 'Oil painting depicting leopard resting portrait by South African artist Des Green.'),
  (89, 'leopard-through-the-leaves', 'Leopard Through the Leaves', 'Wildlife & Animals', '/images/artworks/originals/89-leopard-through-the-leaves.jpg', 931, 1420, 'Oil painting depicting leopard through the leaves by South African artist Des Green.'),
  (90, 'lion-in-profile', 'Lion in Profile', 'Wildlife & Animals', '/images/artworks/originals/90-lion-in-profile.jpg', 1201, 1600, 'Oil painting depicting lion in profile by South African artist Des Green.'),
  (91, 'lion-portrait', 'Lion Portrait', 'Wildlife & Animals', '/images/artworks/originals/91-lion-portrait.jpg', 1200, 1600, 'Oil painting depicting lion portrait by South African artist Des Green.'),
  (92, 'rhino-portrait', 'Rhino Portrait', 'Wildlife & Animals', '/images/artworks/originals/92-rhino-portrait.jpg', 1140, 1600, 'Oil painting depicting rhino portrait by South African artist Des Green.'),
  (93, 'wild-dog-pack', 'Wild Dog Pack', 'Wildlife & Animals', '/images/artworks/originals/93-wild-dog-pack.jpg', 1600, 1061, 'Oil painting depicting wild dog pack by South African artist Des Green.'),
  (94, 'donkey-portrait', 'Donkey Portrait', 'Wildlife & Animals', '/images/artworks/originals/94-donkey-portrait.jpg', 1193, 1593, 'Oil painting depicting donkey portrait by South African artist Des Green.'),
  (95, 'golden-koi', 'Golden Koi', 'Wildlife & Animals', '/images/artworks/originals/95-golden-koi.jpg', 1224, 1600, 'Oil painting depicting golden koi by South African artist Des Green.'),
  (96, 'golden-retriever', 'Golden Retriever', 'Wildlife & Animals', '/images/artworks/originals/96-golden-retriever.jpg', 1155, 1479, 'Oil painting depicting golden retriever by South African artist Des Green.'),
  (97, 'grey-crowned-crane', 'Grey Crowned Crane', 'Wildlife & Animals', '/images/artworks/originals/97-grey-crowned-crane.jpg', 1200, 1600, 'Oil painting depicting grey crowned crane by South African artist Des Green.'),
  (98, 'kingfisher-on-a-no-fishing-sign', 'Kingfisher on a "No Fishing" Sign', 'Wildlife & Animals', '/images/artworks/originals/98-kingfisher-on-a-no-fishing-sign.jpg', 1080, 786, 'Oil painting depicting kingfisher on a "no fishing" sign by South African artist Des Green.'),
  (99, 'owl-eyes', 'Owl Eyes', 'Wildlife & Animals', '/images/artworks/originals/99-owl-eyes.jpg', 1401, 1169, 'Oil painting depicting owl eyes by South African artist Des Green.'),
  (100, 'friends-outside-a-paris-cafe', 'Friends Outside a Paris Café', 'Cityscapes', '/images/artworks/originals/100-friends-outside-a-paris-cafe.jpg', 1600, 1596, 'Oil painting depicting friends outside a paris café by South African artist Des Green.'),
  (101, 'woman-overlooking-the-old-city', 'Woman Overlooking the Old City', 'Cityscapes', '/images/artworks/originals/101-woman-overlooking-the-old-city.jpg', 827, 1251, 'Oil painting depicting woman overlooking the old city by South African artist Des Green.'),
  (102, 'seagulls-in-flight', 'Seagulls in Flight', 'Coastal & Seascapes', '/images/artworks/originals/102-seagulls-in-flight.jpg', 1045, 1600, 'Oil painting depicting seagulls in flight by South African artist Des Green.'),
  (103, 'seagulls-on-the-rocks', 'Seagulls on the Rocks', 'Coastal & Seascapes', '/images/artworks/originals/103-seagulls-on-the-rocks.jpg', 1049, 1600, 'Oil painting depicting seagulls on the rocks by South African artist Des Green.'),
  (104, 'colourful-boat-with-a-bird', 'Colourful Boat with a Bird', 'Coastal & Seascapes', '/images/artworks/originals/104-colourful-boat-with-a-bird.jpg', 1197, 1600, 'Oil painting depicting colourful boat with a bird by South African artist Des Green.'),
  (105, 'moored-boat-reflection', 'Moored Boat Reflection', 'Coastal & Seascapes', '/images/artworks/originals/105-moored-boat-reflection.jpg', 1196, 1600, 'Oil painting depicting moored boat reflection by South African artist Des Green.'),
  (106, 'red-boat-reflection', 'Red Boat Reflection', 'Coastal & Seascapes', '/images/artworks/originals/106-red-boat-reflection.jpg', 1184, 1600, 'Oil painting depicting red boat reflection by South African artist Des Green.'),
  (107, 'trawler-at-sunset', 'Trawler at Sunset', 'Coastal & Seascapes', '/images/artworks/originals/107-trawler-at-sunset.jpg', 1600, 967, 'Oil painting depicting trawler at sunset by South African artist Des Green.'),
  (108, 'working-fishing-boat', 'Working Fishing Boat', 'Coastal & Seascapes', '/images/artworks/originals/108-working-fishing-boat.jpg', 1406, 948, 'Oil painting depicting working fishing boat by South African artist Des Green.'),
  (109, 'marina-at-sunset', 'Marina at Sunset', 'Coastal & Seascapes', '/images/artworks/originals/109-marina-at-sunset.jpg', 1600, 1157, 'Oil painting depicting marina at sunset by South African artist Des Green.'),
  (110, 'stormy-pier', 'Stormy Pier', 'Coastal & Seascapes', '/images/artworks/originals/110-stormy-pier.jpg', 826, 1600, 'Oil painting depicting stormy pier by South African artist Des Green.'),
  (111, 'fishermen-at-sunset', 'Fishermen at Sunset', 'Coastal & Seascapes', '/images/artworks/originals/111-fishermen-at-sunset.jpg', 1545, 1007, 'Oil painting depicting fishermen at sunset by South African artist Des Green.'),
  (112, 'fishermen-casting-nets-at-dusk', 'Fishermen Casting Nets at Dusk', 'Coastal & Seascapes', '/images/artworks/originals/112-fishermen-casting-nets-at-dusk.jpg', 1600, 1200, 'Oil painting depicting fishermen casting nets at dusk by South African artist Des Green.'),
  (113, 'fishermen-launching-a-boat', 'Fishermen Launching a Boat', 'Coastal & Seascapes', '/images/artworks/originals/113-fishermen-launching-a-boat.jpg', 1600, 1049, 'Oil painting depicting fishermen launching a boat by South African artist Des Green.'),
  (114, 'fishermen-pulling-a-boat-ashore', 'Fishermen Pulling a Boat Ashore', 'Coastal & Seascapes', '/images/artworks/originals/114-fishermen-pulling-a-boat-ashore.jpg', 1080, 806, 'Oil painting depicting fishermen pulling a boat ashore by South African artist Des Green.'),
  (115, 'fresh-fish-and-lemons', 'Fresh Fish and Lemons', 'Still Life', '/images/artworks/originals/115-fresh-fish-and-lemons.jpg', 1584, 1600, 'Oil painting depicting fresh fish and lemons by South African artist Des Green.'),
  (116, 'abstract-female-faces', 'Abstract Female Faces', 'Figurative & Portraits', '/images/artworks/originals/116-abstract-female-faces.jpg', 1600, 1600, 'Oil painting depicting abstract female faces by South African artist Des Green.'),
  (117, 'ballerinas', 'Ballerinas', 'Figurative & Portraits', '/images/artworks/originals/117-ballerinas.jpg', 1600, 1600, 'Oil painting depicting ballerinas by South African artist Des Green.'),
  (118, 'european-street-scene', 'European Street Scene', 'Cityscapes', '/images/artworks/originals/118-european-street-scene.jpg', 1066, 1600, 'Oil painting depicting european street scene by South African artist Des Green.'),
  (119, 'european-windows-and-doorways', 'European Windows and Doorways', 'Cityscapes', '/images/artworks/originals/119-european-windows-and-doorways.jpg', 1333, 1013, 'Oil painting depicting european windows and doorways by South African artist Des Green.'),
  (120, 'fashion-illustration', 'Fashion Illustration', 'Figurative & Portraits', '/images/artworks/originals/120-fashion-illustration.jpg', 1600, 1116, 'Oil painting depicting fashion illustration by South African artist Des Green.'),
  (121, 'vintage-cutlery', 'Vintage Cutlery', 'Still Life', '/images/artworks/originals/121-vintage-cutlery.jpg', 1066, 1600, 'Oil painting depicting vintage cutlery by South African artist Des Green.'),
  (122, 'intimate-embrace', 'Intimate Embrace', 'Figurative & Portraits', '/images/artworks/originals/122-intimate-embrace.jpg', 567, 1080, 'Oil painting depicting intimate embrace by South African artist Des Green.'),
  (123, 'passionate-embrace', 'Passionate Embrace', 'Figurative & Portraits', '/images/artworks/originals/123-passionate-embrace.jpg', 722, 960, 'Oil painting depicting passionate embrace by South African artist Des Green.'),
  (124, 'dramatic-dip', 'Dramatic Dip', 'Figurative & Portraits', '/images/artworks/originals/124-dramatic-dip.jpg', 1080, 1454, 'Oil painting depicting dramatic dip by South African artist Des Green.'),
  (125, 'resting-ballerina', 'Resting Ballerina', 'Figurative & Portraits', '/images/artworks/originals/125-resting-ballerina.jpg', 1189, 1481, 'Oil painting depicting resting ballerina by South African artist Des Green.'),
  (126, 'carriage-driver-in-the-arena', 'Carriage Driver in the Arena', 'Figurative & Portraits', '/images/artworks/originals/126-carriage-driver-in-the-arena.jpg', 1484, 1275, 'Oil painting depicting carriage driver in the arena by South African artist Des Green.'),
  (127, 'archangel-with-sword', 'Archangel with Sword', 'Figurative & Portraits', '/images/artworks/originals/127-archangel-with-sword.jpg', 835, 1265, 'Oil painting depicting archangel with sword by South African artist Des Green.'),
  (128, 'dragon-eye', 'Dragon Eye', NULL, '/images/artworks/originals/128-dragon-eye.jpg', 1168, 1600, 'Oil painting depicting dragon eye by South African artist Des Green.'),
  (129, 'three-sheep', 'Three Sheep', 'Wildlife & Animals', '/images/artworks/originals/129-three-sheep.jpg', 1190, 1600, 'Oil painting depicting three sheep by South African artist Des Green.'),
  (130, 'reclining-woman', 'Reclining Woman', 'Figurative & Portraits', '/images/artworks/originals/130-reclining-woman.jpg', 1600, 680, 'Oil painting depicting reclining woman by South African artist Des Green.'),
  (131, 'woman-at-the-balcony-overlooking-the-sea', 'Woman at the Balcony Overlooking the Sea', 'Figurative & Portraits', '/images/artworks/originals/131-woman-at-the-balcony-overlooking-the-sea.jpg', 1031, 1548, 'Oil painting depicting woman at the balcony overlooking the sea by South African artist Des Green.'),
  (132, 'woman-hidden-behind-flowers', 'Woman Hidden Behind Flowers', 'Figurative & Portraits', '/images/artworks/originals/132-woman-hidden-behind-flowers.jpg', 1068, 1280, 'Oil painting depicting woman hidden behind flowers by South African artist Des Green.'),
  (133, 'woman-in-white-on-a-rock', 'Woman in White on a Rock', 'Figurative & Portraits', '/images/artworks/originals/133-woman-in-white-on-a-rock.jpg', 736, 1600, 'Oil painting depicting woman in white on a rock by South African artist Des Green.'),
  (134, 'woman-in-white-with-a-cup', 'Woman in White with a Cup', 'Figurative & Portraits', '/images/artworks/originals/134-woman-in-white-with-a-cup.jpg', 1053, 1491, 'Oil painting depicting woman in white with a cup by South African artist Des Green.'),
  (135, 'colourful-bouquet-in-a-blue-vase', 'Colourful Bouquet in a Blue Vase', 'Still Life', '/images/artworks/originals/135-colourful-bouquet-in-a-blue-vase.jpg', 1084, 1600, 'Oil painting depicting colourful bouquet in a blue vase by South African artist Des Green.'),
  (136, 'pink-roses-in-a-blue-vase', 'Pink Roses in a Blue Vase', 'Still Life', '/images/artworks/originals/136-pink-roses-in-a-blue-vase.jpg', 1144, 1600, 'Oil painting depicting pink roses in a blue vase by South African artist Des Green.'),
  (137, 'lantern-and-vines', 'Lantern and Vines', 'Still Life', '/images/artworks/originals/137-lantern-and-vines.jpg', 1600, 1600, 'Oil painting depicting lantern and vines by South African artist Des Green.'),
  (138, 'portrait-with-pink-necklace', 'Portrait with Pink Necklace', 'Figurative & Portraits', '/images/artworks/originals/138-portrait-with-pink-necklace.jpg', 1136, 1600, 'Oil painting depicting portrait with pink necklace by South African artist Des Green.'),
  (139, 'portrait-in-a-blue-feathered-coat', 'Portrait in a Blue Feathered Coat', 'Figurative & Portraits', '/images/artworks/originals/139-portrait-in-a-blue-feathered-coat.jpg', 806, 1206, 'Oil painting depicting portrait in a blue feathered coat by South African artist Des Green.'),
  (140, 'portrait-in-a-blue-floral-coat', 'Portrait in a Blue Floral Coat', 'Figurative & Portraits', '/images/artworks/originals/140-portrait-in-a-blue-floral-coat.jpg', 1006, 1600, 'Oil painting depicting portrait in a blue floral coat by South African artist Des Green.'),
  (141, 'portrait-in-a-green-and-pink-feathered-coat', 'Portrait in a Green and Pink Feathered Coat', 'Figurative & Portraits', '/images/artworks/originals/141-portrait-in-a-green-and-pink-feathered-coat.jpg', 1137, 1600, 'Oil painting depicting portrait in a green and pink feathered coat by South African artist Des Green.'),
  (142, 'hands-clasped', 'Hands Clasped', 'Figurative & Portraits', '/images/artworks/originals/142-hands-clasped.jpg', 826, 1256, 'Oil painting depicting hands clasped by South African artist Des Green.'),
  (143, 'portrait-in-orange-and-turquoise-jewellery', 'Portrait in Orange and Turquoise Jewellery', 'Figurative & Portraits', '/images/artworks/originals/143-portrait-in-orange-and-turquoise-jewellery.jpg', 814, 1228, 'Oil painting depicting portrait in orange and turquoise jewellery by South African artist Des Green.'),
  (144, 'portrait-in-a-red-coat-with-a-wine-glass', 'Portrait in a Red Coat with a Wine Glass', 'Figurative & Portraits', '/images/artworks/originals/144-portrait-in-a-red-coat-with-a-wine-glass.jpg', 1037, 1600, 'Oil painting depicting portrait in a red coat with a wine glass by South African artist Des Green.'),
  (145, 'portrait-in-a-red-feathered-coat-with-wine', 'Portrait in a Red Feathered Coat with Wine', 'Figurative & Portraits', '/images/artworks/originals/145-portrait-in-a-red-feathered-coat-with-wine.jpg', 1030, 1600, 'Oil painting depicting portrait in a red feathered coat with wine by South African artist Des Green.'),
  (146, 'portrait-in-turquoise-glasses-with-orange-florals', 'Portrait in Turquoise Glasses with Orange Florals', 'Figurative & Portraits', '/images/artworks/originals/146-portrait-in-turquoise-glasses-with-orange-florals.jpg', 812, 1235, 'Oil painting depicting portrait in turquoise glasses with orange florals by South African artist Des Green.'),
  (147, 'birch-trees-by-the-water', 'Birch Trees by the Water', 'Landscapes & Rivers', '/images/artworks/originals/147-birch-trees-by-the-water.jpg', 1080, 691, 'Oil painting depicting birch trees by the water by South African artist Des Green.'),
  (148, 'flowering-tree', 'Flowering Tree', 'Landscapes & Rivers', '/images/artworks/originals/148-flowering-tree.jpg', 1211, 1600, 'Oil painting depicting flowering tree by South African artist Des Green.'),
  (149, 'billy-idol-live', 'Billy Idol Live', 'Figurative & Portraits', '/images/artworks/originals/149-billy-idol-live.jpg', 873, 1357, 'Oil painting depicting billy idol live by South African artist Des Green.'),
  (150, 'bob-marley-portrait', 'Bob Marley Portrait', 'Figurative & Portraits', '/images/artworks/originals/150-bob-marley-portrait.jpg', 1098, 1520, 'Oil painting depicting bob marley portrait by South African artist Des Green.'),
  (151, 'bruce-springsteen-with-guitar', 'Bruce Springsteen with Guitar', 'Figurative & Portraits', '/images/artworks/originals/151-bruce-springsteen-with-guitar.jpg', 1062, 1600, 'Oil painting depicting bruce springsteen with guitar by South African artist Des Green.'),
  (152, 'bruce-springsteen-live', 'Bruce Springsteen Live', 'Figurative & Portraits', '/images/artworks/originals/152-bruce-springsteen-live.jpg', 924, 1432, 'Oil painting depicting bruce springsteen live by South African artist Des Green.'),
  (153, 'david-bowie-live', 'David Bowie Live', 'Figurative & Portraits', '/images/artworks/originals/153-david-bowie-live.jpg', 1033, 1600, 'Oil painting depicting david bowie live by South African artist Des Green.'),
  (154, 'freddie-mercury-live', 'Freddie Mercury Live', 'Figurative & Portraits', '/images/artworks/originals/154-freddie-mercury-live.jpg', 1013, 1551, 'Oil painting depicting freddie mercury live by South African artist Des Green.'),
  (155, 'jimi-hendrix-with-guitar', 'Jimi Hendrix with Guitar', 'Figurative & Portraits', '/images/artworks/originals/155-jimi-hendrix-with-guitar.jpg', 786, 1600, 'Oil painting depicting jimi hendrix with guitar by South African artist Des Green.'),
  (156, 'jon-bon-jovi-with-guitar', 'Jon Bon Jovi with Guitar', 'Figurative & Portraits', '/images/artworks/originals/156-jon-bon-jovi-with-guitar.jpg', 1173, 1600, 'Oil painting depicting jon bon jovi with guitar by South African artist Des Green.'),
  (157, 'jon-bon-jovi-live', 'Jon Bon Jovi Live', 'Figurative & Portraits', '/images/artworks/originals/157-jon-bon-jovi-live.jpg', 888, 1349, 'Oil painting depicting jon bon jovi live by South African artist Des Green.'),
  (158, 'keith-richards-with-guitar', 'Keith Richards with Guitar', 'Figurative & Portraits', '/images/artworks/originals/158-keith-richards-with-guitar.jpg', 1080, 1599, 'Oil painting depicting keith richards with guitar by South African artist Des Green.'),
  (159, 'slash-live', 'Slash Live', 'Figurative & Portraits', '/images/artworks/originals/159-slash-live.jpg', 1029, 1600, 'Oil painting depicting slash live by South African artist Des Green.'),
  (160, 'white-haired-guitarist-live', 'White-Haired Guitarist Live', 'Figurative & Portraits', '/images/artworks/originals/160-white-haired-guitarist-live.jpg', 1004, 1553, 'Oil painting depicting white-haired guitarist live by South African artist Des Green.'),
  (161, 'autumn-park-skyline', 'Autumn Park Skyline', 'Cityscapes', '/images/artworks/originals/161-autumn-park-skyline.jpg', 1079, 1599, 'Oil painting depicting autumn park skyline by South African artist Des Green.'),
  (162, 'blue-city-rain', 'Blue City Rain', 'Cityscapes', '/images/artworks/originals/162-blue-city-rain.jpg', 1005, 1600, 'Oil painting depicting blue city rain by South African artist Des Green.'),
  (163, 'brooklyn-bridge-at-dusk', 'Brooklyn Bridge at Dusk', 'Cityscapes', '/images/artworks/originals/163-brooklyn-bridge-at-dusk.jpg', 1420, 921, 'Oil painting depicting brooklyn bridge at dusk by South African artist Des Green.'),
  (164, 'manhattan-skyline', 'Manhattan Skyline', 'Cityscapes', '/images/artworks/originals/164-manhattan-skyline.jpg', 1368, 589, 'Oil painting depicting manhattan skyline by South African artist Des Green.'),
  (165, 'night-street-in-the-rain', 'Night Street in the Rain', 'Cityscapes', '/images/artworks/originals/165-night-street-in-the-rain.jpg', 1393, 1106, 'Oil painting depicting night street in the rain by South African artist Des Green.'),
  (166, 'blue-eyed-man-in-a-pakol-hat', 'Blue-Eyed Man in a Pakol Hat', 'Figurative & Portraits', '/images/artworks/originals/166-blue-eyed-man-in-a-pakol-hat.jpg', 1163, 1549, 'Oil painting depicting blue-eyed man in a pakol hat by South African artist Des Green.'),
  (167, 'brown-leather-boots', 'Brown Leather Boots', 'Still Life', '/images/artworks/originals/167-brown-leather-boots.jpg', 908, 1164, 'Oil painting depicting brown leather boots by South African artist Des Green.'),
  (168, 'breakdancer-headstand', 'Breakdancer Headstand', 'Figurative & Portraits', '/images/artworks/originals/168-breakdancer-headstand.jpg', 1126, 1599, 'Oil painting depicting breakdancer headstand by South African artist Des Green.'),
  (169, 'skateboarder-airborne', 'Skateboarder Airborne', 'Figurative & Portraits', '/images/artworks/originals/169-skateboarder-airborne.jpg', 1111, 1581, 'Oil painting depicting skateboarder airborne by South African artist Des Green.'),
  (170, 'skateboarder-jump', 'Skateboarder Jump', 'Figurative & Portraits', '/images/artworks/originals/170-skateboarder-jump.jpg', 1114, 1600, 'Oil painting depicting skateboarder jump by South African artist Des Green.'),
  (171, 'woman-carrying-a-skateboard-at-sunset', 'Woman Carrying a Skateboard at Sunset', 'Figurative & Portraits', '/images/artworks/originals/171-woman-carrying-a-skateboard-at-sunset.jpg', 1029, 1600, 'Oil painting depicting woman carrying a skateboard at sunset by South African artist Des Green.'),
  (172, 'rainbow-rider-on-a-tricycle', 'Rainbow Rider on a Tricycle', 'Figurative & Portraits', '/images/artworks/originals/172-rainbow-rider-on-a-tricycle.jpg', 715, 981, 'Oil painting depicting rainbow rider on a tricycle by South African artist Des Green.'),
  (173, 'girl-and-yellow-vw-beetle', 'Girl and Yellow VW Beetle', 'Figurative & Portraits', '/images/artworks/originals/173-girl-and-yellow-vw-beetle.jpg', 1448, 1463, 'Oil painting depicting girl and yellow vw beetle by South African artist Des Green.'),
  (174, 'gnomes-and-vw-bus', 'Gnomes and VW Bus', 'Figurative & Portraits', '/images/artworks/originals/174-gnomes-and-vw-bus.jpg', 1396, 1428, 'Oil painting depicting gnomes and vw bus by South African artist Des Green.'),
  (175, 'bound-woman-with-rope', 'Bound Woman with Rope', 'Figurative & Portraits', '/images/artworks/originals/175-bound-woman-with-rope.jpg', 840, 1391, 'Oil painting depicting bound woman with rope by South African artist Des Green.'),
  (176, 'reaching-for-freedom', 'Reaching for Freedom', 'Figurative & Portraits', '/images/artworks/originals/176-reaching-for-freedom.jpg', 1007, 1283, 'Oil painting depicting reaching for freedom by South African artist Des Green.'),
  (177, 'woman-behind-bars-and-rope', 'Woman Behind Bars and Rope', 'Figurative & Portraits', '/images/artworks/originals/177-woman-behind-bars-and-rope.jpg', 1075, 1599, 'Oil painting depicting woman behind bars and rope by South African artist Des Green.')
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
