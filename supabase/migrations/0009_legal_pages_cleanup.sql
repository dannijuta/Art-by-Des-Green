-- Removes the visible "starter content, not reviewed by a lawyer" banner and
-- bracketed editor notes from the public legal pages, replacing them with
-- clean, honest copy that states only what's actually known (South Africa,
-- Des's own contact for data requests) and omits what isn't (a business
-- registration/VAT number, a specific returns window) rather than inventing
-- it. `needsCompletion` now only drives an admin-side reminder, never a
-- public banner. Update the *values* here at any time from Admin → Settings
-- → Legal Policy Pages — this migration only sets the initial cleaned text.

update settings set value = jsonb_build_object(
  'needsCompletion', true,
  'lastUpdated', '2026-08-22',
  'privacyPolicy', 'Art by Des Green collects the personal information you provide through this website''s contact, commission and checkout forms — including your name, email, phone number, and, for orders, a delivery address — solely to respond to enquiries, process orders and arrange shipping or collection.

We do not sell your information. Payment card details are handled entirely by PayFast and are never stored on this website.

Information you submit is kept only for as long as needed to respond to your enquiry or fulfil your order, and is not shared with any third party beyond the services needed to run this website (currently: Supabase for secure hosting and database storage, PayFast for payment processing, and Resend for email delivery).

You may request access to, correction of, or deletion of your information at any time by emailing djuta68@gmail.com. For any data protection query under South Africa''s Protection of Personal Information Act (POPIA), Des Green is the contact for this business and can be reached at the same address.',
  'terms', 'All artworks sold through this website are original, one-of-a-kind paintings unless otherwise stated. Prices are shown in South African Rand (ZAR).

An order is only confirmed once payment has been verified. Until PayFast is fully live, "Request to Purchase" reserves a painting and payment is arranged directly with Des rather than through an automated checkout — this is made clear at the time of your request.

These terms are governed by the law of South Africa.',
  'shippingCollection', 'Shipping and collection arrangements vary by artwork and are shown at checkout. Where a shipping quote is required, you will be contacted with a cost before any payment beyond the artwork price is requested.

Local collection is available in East London, South Africa by arrangement.',
  'returnsRefunds', 'Because each painting is a unique, one-of-a-kind original rather than a mass-produced item, we generally do not offer refunds once a piece has been purchased. If you have any questions about a work — its condition, size, colour or anything else — please get in touch before buying, so you can be confident in your choice.

If a painting arrives damaged in transit, contact djuta68@gmail.com as soon as possible with photos of the damage so it can be resolved.',
  'copyright', '© Art by Des Green. All artwork and images remain the property of the artist. All rights reserved.'
)
where key = 'public.policies';
