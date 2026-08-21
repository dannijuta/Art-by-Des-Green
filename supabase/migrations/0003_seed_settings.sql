-- Starter site settings, seeded once. Uses ON CONFLICT DO NOTHING so re-running
-- this migration never clobbers content the admin has since edited in the
-- dashboard (all editing happens through the `settings` table afterwards).

insert into settings (key, value) values
('public.artist_profile', '{
  "name": "Des Green",
  "professionalDescription": "South African oil painter",
  "basedIn": "East London, South Africa",
  "commissionsOpen": true,
  "introLine": "My studio is where ideas become paintings, memories find colour, and inspiration is free to wander. I hope you enjoy the journey.",
  "bioParagraphs": [
    "I''m Des Green, a South African oil painter.",
    "People often ask me why I paint, and the answer is simple: because I love it.",
    "Every painting begins with something that captures my imagination. Sometimes it''s the movement of the sea, the character in an animal''s eyes, the quiet beauty of a river, or a memory that refuses to let go.",
    "I sell my work because every painting that finds a new home allows me to begin another. But I''ve never believed in painting something simply because it''s fashionable or because I think it will sell. If I don''t connect with the subject, I simply won''t paint it.",
    "My work changes as my inspiration changes. One season it might be wildlife, another rivers or coastlines. I don''t believe an artist has to stand still, and every collection reflects whatever has captured my heart at that moment.",
    "If one of my paintings finds its way into your home and makes you pause, smile, remember, or simply brings you a little peace, then it has found exactly where it belongs.",
    "Thank you for stopping by and for supporting original South African art."
  ],
  "signatureName": "Des Green",
  "studioImagePath": "/images/studio/des-green-studio.png",
  "studioImageAlt": "Des Green working on a painting in her studio."
}'::jsonb)
on conflict (key) do nothing;

insert into settings (key, value) values
('public.contact', '{
  "phoneDisplay": "083 524 4713",
  "phoneLink": "tel:+27835244713",
  "email": "djuta68@gmail.com",
  "emailLink": "mailto:djuta68@gmail.com",
  "facebookUrl": "https://www.facebook.com/artbydesj",
  "facebookLabel": "Art by Des Green on Facebook",
  "instagramUrl": "https://www.instagram.com/artbydesj/",
  "instagramHandle": "@artbydesj",
  "instagramLabel": "Art by Des Green on Instagram",
  "location": "East London, South Africa"
}'::jsonb)
on conflict (key) do nothing;

insert into settings (key, value) values
('public.homepage_copy', '{
  "eyebrow": "Original art by South African artist Des Green",
  "headline": "Paintings with presence, story and soul.",
  "supportingCopy": "Explore a collection shaped by colour, character, atmosphere and observation — from African wildlife and portraiture to coastal scenes, cityscapes and still life.",
  "primaryCtaLabel": "Explore the Collection",
  "primaryCtaHref": "/gallery",
  "secondaryCtaLabel": "View Available Works",
  "secondaryCtaHref": "/available-works",
  "commissionsCtaLabel": "Commission an Artwork",
  "commissionsCtaHref": "/commissions"
}'::jsonb)
on conflict (key) do nothing;

insert into settings (key, value) values
('public.shipping_settings', '{
  "defaultMethod": "quote_required",
  "flatRateCents": null,
  "collectionNote": "Collection can be arranged in East London, South Africa by appointment.",
  "reservationMinutes": 30,
  "quoteApprovedReservationMinutes": 4320
}'::jsonb)
on conflict (key) do nothing;

insert into settings (key, value) values
('public.policies', '{
  "needsCompletion": true,
  "privacyPolicy": "This starter Privacy Policy is a placeholder and has not been reviewed by a lawyer. Before launch, replace the bracketed details below and have it reviewed for compliance with South Africa''s Protection of Personal Information Act (POPIA).\n\n[Business name / registered entity] collects the personal information you provide through this website''s contact, commission and checkout forms — including name, email, phone number, and, for orders, a delivery address — solely to respond to enquiries, process orders and arrange shipping or collection. We do not sell your information. Payment card details are handled entirely by PayFast and are never stored on this website. You may request access to, correction of, or deletion of your information at any time by emailing djuta68@gmail.com. [Add: information officer name/contact if required under POPIA; data retention period; third-party processors used (e.g. Resend for email, PayFast for payment, Supabase for hosting).]",
  "terms": "This starter Terms & Conditions page is a placeholder and has not been reviewed by a lawyer.\n\nAll artworks sold through this website are original, one-of-a-kind paintings unless otherwise stated. Prices are shown in South African Rand (ZAR) and are inclusive of applicable taxes unless stated otherwise. An order is only confirmed once payment has been verified by PayFast. [Add: registered business details, VAT number if applicable, governing law / jurisdiction.]",
  "shippingCollection": "Shipping and collection arrangements vary by artwork and are shown at checkout. Where a shipping quote is required, we will contact you with a cost before any payment beyond the artwork price is requested. Collection, where offered, is by appointment in East London, South Africa.",
  "returnsRefunds": "This starter Returns & Refunds page is a placeholder and has not been reviewed by a lawyer. Because each painting is a unique, one-of-a-kind original, please contact us before purchasing if you have questions about a piece. [Add: your actual returns window and condition requirements, and how damaged-in-transit claims are handled.]",
  "copyright": "© Art by Des Green. All artwork and images remain the property of the artist. All rights reserved."
}'::jsonb)
on conflict (key) do nothing;

insert into settings (key, value) values
('public.seo', '{
  "siteName": "Art by Des Green",
  "defaultTitle": "Art by Des Green | Original South African Oil Paintings",
  "defaultDescription": "Original oil paintings by South African artist Des Green, based in East London. Browse the collection, view available works and enquire about commissions."
}'::jsonb)
on conflict (key) do nothing;
