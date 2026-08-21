# Launch Me First

A plain-English guide to putting the Art by Des Green website online. No coding knowledge needed — just follow
the steps in order. Where a step says "click X," it means an actual button or link with that name.

**[Screenshot placeholder — insert a screenshot here]** markers show you where a picture would help; take your
own screenshots as you go through each website's dashboard, since these change their exact look over time.

---

## 1. What has already been completed

- The full website: every page (Home, Gallery, Available Works, Sold Work, Meet the Artist, Contact,
  Commissions, legal pages) and the online checkout.
- All 68 paintings imported from your spreadsheet, matched to their correct images, with prices and sizes
  filled in wherever the spreadsheet had them.
- The private Admin Dashboard, where you (or whoever helps you) can add paintings, change prices, mark
  paintings sold, and read messages from customers.
- Secure payment processing through PayFast (currently set to **test mode** — see step 9).
- Des's real contact details, biography, and studio photo are already on the site.

**What is NOT done yet**, because it needs your action or information:

- A live web address (domain name) — the site isn't reachable on the internet yet.
- Real Supabase and PayFast accounts (the site currently only runs on a test database on the developer's
  computer).
- An administrator login for you to sign in with.
- Reviewing and completing the legal pages (Privacy Policy, Terms, Returns) — see step 18.

---

## 2. What accounts you must create

You'll need free (or pay-as-you-go) accounts with these companies. Create each one using an email address you
check regularly.

| Service | What it's for | Cost |
|---|---|---|
| **Supabase** (supabase.com) | Your website's database — stores every painting, order, and message | Free tier is enough to start |
| **Vercel** (vercel.com) | Hosts the website so it's reachable on the internet | Free tier is enough to start |
| **PayFast** (payfast.co.za) | Takes secure payments from customers | Free to sign up; PayFast takes a small % per sale |
| **Resend** (resend.com) — optional | Sends you an email when someone submits a form | Free tier is enough to start |
| A domain name registrar (e.g. **Domains.co.za**, or wherever you prefer) | Your own web address, e.g. artbydesgreen.co.za | Usually R100–R300/year |

## 3. Which account should belong to Des

**All of the above should be created using Des's own email address and payment details** — especially
Supabase, Vercel, PayFast, and the domain registrar. Whoever creates the PayFast account in particular must be
the person legally receiving the money, so that should be Des (or her registered business). If someone else
(a developer, a family member) sets these up on her behalf, ownership/billing should be transferred to Des as
soon as possible.

---

## 4. How to create the database (Supabase)

1. Go to **supabase.com** and click **Start your project**. Sign up.
2. Click **New project**. Give it a name like `art-by-des-green`, choose a strong database password (save it
   somewhere safe — a password manager, not a sticky note), and pick a region close to South Africa (e.g.
   `eu-west` or the closest available).
   **[Screenshot placeholder]**
3. Wait a minute or two while Supabase sets things up.
4. In the left sidebar, click the **SQL Editor** icon.
5. Open this project's `supabase/migrations/` folder on your computer. You'll see files named
   `0001_schema.sql`, `0002_rls.sql`, `0003_seed_settings.sql`, `0004_search.sql`, `0005_image_dimensions.sql`.
6. For **each file, in order** (0001 first, then 0002, and so on): open it in a text editor, copy the whole
   contents, paste into the Supabase SQL Editor, and click **Run**. Wait for it to say success before moving
   to the next file.
   **[Screenshot placeholder]**
7. In the left sidebar, click **Project Settings** → **Database**. Under **Connection string**, copy the
   **URI** — this is your `DATABASE_URL`. Keep this page open, you'll need it in step 6.
8. Click **Project Settings** → **API**. Copy the **Project URL** (this is `SUPABASE_URL`) and the
   **service_role** key (this is `SUPABASE_SERVICE_ROLE_KEY` — treat it like a password, never share it or
   put it anywhere public).
9. In the left sidebar, click **Storage**. Create two buckets: one named `artwork-images` and one named
   `commission-references`. For each, set it to **Public** when creating it (so images can be displayed on the
   website).

## 5. How to create the administrator login

This is the account you'll use to sign into the private dashboard at `yourdomain.com/admin`.

1. Decide on an email address and a strong password for yourself.
2. You need to turn that password into a scrambled "hash" before it goes in the database (this is normal —
   real passwords are never stored in plain text). If you have a developer helping you, ask them to run this
   one command and give you the result:
   ```
   node -e "require('bcryptjs').hash(process.argv[1], 12).then(console.log)" "YourChosenPassword123!"
   ```
   It will print something starting with `$2a$12$...` — that's your password hash.
3. In Supabase, go to **SQL Editor** again and run (replacing the email and hash with your own):
   ```sql
   insert into admin_users (email, password_hash, name, role)
   values ('you@example.com', '$2a$12$paste-the-hash-here', 'Des Green', 'owner');
   ```
4. That's it — once the site is live, go to `yourdomain.com/admin/login` and sign in with that email and your
   chosen password (not the hash).

---

## 6. How to put the website online (Vercel)

1. Go to **vercel.com** and sign up.
2. You'll need the website's code in a place Vercel can access — the simplest way is a **GitHub** account
   (free, at github.com) with the project uploaded there. If you're not comfortable with this step, ask a
   developer to do just this one part for you: it's a one-time "push this folder to GitHub" task.
3. In Vercel, click **Add New** → **Project**, and choose the GitHub repository you just created.
4. Before clicking Deploy, click **Environment Variables** and add each of these (values from steps 4 and 9):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | from Supabase step 4.7 |
   | `SUPABASE_URL` | from Supabase step 4.8 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Supabase step 4.8 |
   | `ADMIN_SESSION_SECRET` | any random long string — e.g. mash your keyboard for 40 characters |
   | `NEXT_PUBLIC_SITE_URL` | leave as `https://your-project-name.vercel.app` for now, update after step 8 |
   | `PAYFAST_MERCHANT_ID` | from step 9 |
   | `PAYFAST_MERCHANT_KEY` | from step 9 |
   | `PAYFAST_PASSPHRASE` | from step 9 |
   | `PAYFAST_SANDBOX` | `true` (keep this until step 11) |
   | `RESEND_API_KEY` | from Resend, optional |
   | `RESEND_FROM_EMAIL` | e.g. `Art by Des Green <hello@yourdomain.co.za>` |
   | `CONTACT_NOTIFICATION_EMAIL` | `djuta68@gmail.com` (or wherever you want enquiries sent) |

   **[Screenshot placeholder]**
5. Click **Deploy**. Wait a few minutes.
6. When it finishes, Vercel gives you a working web address like `art-by-des-green.vercel.app`. Click it —
   your site is live!

## 7. How to test the preview website

Before telling anyone about the site, click through it yourself:

- Does the homepage load with real paintings?
- Click **Gallery** — do all the paintings show up? Try the filters and search.
- Click into a painting — does the price, size and "Acquire This Artwork" button look right?
- Go to `/admin/login` and sign in with the login you made in step 5. Do you see the dashboard?
- Submit the Contact form to yourself as a test.

If anything looks broken, see step 17.

## 8. How to connect a domain

1. Buy a domain (e.g. `artbydesgreen.co.za`) from any registrar.
2. In Vercel, go to your project → **Settings** → **Domains**, and type in your domain. Click **Add**.
3. Vercel will show you one or two DNS records to add (usually an "A" record and/or a "CNAME"). Log into your
   domain registrar's site, find **DNS Settings**, and add exactly what Vercel showed you.
   **[Screenshot placeholder]**
4. This can take a few minutes to a few hours to take effect. Vercel's Domains page will show a green
   checkmark once it's working.
5. Go back to your Environment Variables in Vercel and update `NEXT_PUBLIC_SITE_URL` to your real domain
   (e.g. `https://artbydesgreen.co.za`), then redeploy (Vercel → Deployments → click the three dots on the
   latest one → **Redeploy**).

---

## 9. How to create and verify PayFast

1. Go to **payfast.co.za** and click **Sign Up**. Choose a **Business** account.
2. You'll need to verify your identity (South African ID or passport) and bank account details — this is
   required by law for anyone accepting online payments, and can take a day or two to be approved.
3. While waiting for approval, you can start with the **Sandbox** (test) environment: go to
   **sandbox.payfast.co.za** and create a free sandbox account — no verification needed, this is just for
   testing.
4. In your PayFast (or Sandbox) dashboard, go to **Settings** → find your **Merchant ID** and **Merchant
   Key** — these go into `PAYFAST_MERCHANT_ID` and `PAYFAST_MERCHANT_KEY`.
5. Still in Settings, find **Salt Passphrase**, set one, and put it in `PAYFAST_PASSPHRASE`.

## 10. How to test PayFast safely

While `PAYFAST_SANDBOX=true`, all payments go through PayFast's test system — **no real money moves**.

1. Go to your live/preview site and click **Acquire This Artwork** on any priced painting.
2. Fill in the checkout form and continue to payment.
3. You'll land on a PayFast sandbox page. Log in with the sandbox test buyer details PayFast provides (visible
   on the sandbox dashboard), and complete a test payment using their fake wallet.
4. You should be redirected back to a "Payment Confirmed" page, and in the admin dashboard, that painting
   should now show as **Sold**.
5. Try it again but click **Cancel** instead — the painting should become available again (not stuck as
   "reserved").

Do this a few times until you're confident it works before moving to real payments.

## 11. How to switch PayFast from test to live

Only do this once your real PayFast Business account is approved.

1. In Vercel's Environment Variables, replace `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, and
   `PAYFAST_PASSPHRASE` with the values from your **real** (not sandbox) PayFast dashboard.
2. Change `PAYFAST_SANDBOX` to `false`.
3. Redeploy the site (Vercel → Deployments → Redeploy).
4. Make one small real test purchase yourself if possible, to confirm everything works end to end with real
   money before announcing the site publicly.

---

## 12. How to add or edit a painting

1. Sign in at `yourdomain.com/admin/login`.
2. Click **Artworks** in the sidebar.
3. Click **+ Add Artwork** (or click **Edit** next to an existing one).
4. Fill in the title, description, dimensions, medium, and upload a photo.
5. Choose an **Availability** (see step 13) and set **Publishing** to **Published** when you're ready for it
   to appear on the site.
6. Click **Save Artwork**.

## 13. How to add a price

On the same Add/Edit Artwork page, enter the amount in the **Price (ZAR)** field (just the number, e.g.
`6900` — no "R" symbol needed). Leave it blank if you don't have a price yet; the painting will still show in
the Gallery, just without a price or a Buy button, until you add one.

## 14. How to mark a painting sold

If a painting sells outside the website (in person, at a market, etc.), open it in **Artworks** → **Edit**,
change **Availability** to **Sold**, and click **Save**. It will move from Available Works to the Sold Work
page automatically, and the Buy button will disappear. (If it sells *through* the website, this happens
automatically — you don't need to do anything.)

## 15. How to read an enquiry

Click **Enquiries** in the admin sidebar. Every message from the Contact form appears here, newest first,
along with which painting (if any) it was about. Use the dropdown next to each one to mark it **Read**,
**Replied**, or **Archived** once you've dealt with it.

## 16. How to manage a commission enquiry

Click **Commissions** in the admin sidebar. You'll see the customer's subject/idea, budget, preferred size,
and timeline. Reply to them directly using the email address shown, then update its status the same way as
enquiries.

If a customer requested a shipping quote as part of a purchase (rather than a commission), that appears
separately under **Shipping Quotes** — enter the shipping cost there and the system will email the customer a
secure payment link automatically.

---

## 17. What to do if something breaks

- **The site shows an error page:** Try reloading. If it keeps happening, check Vercel → your project →
  **Deployments** → the latest one → **Logs**, for a red error message. Screenshot it and send it to whoever
  is helping you maintain the site.
- **A payment didn't go through but the painting shows reserved:** Reservations release themselves
  automatically after a set time (30 minutes by default). If you need it released immediately, edit the
  artwork in the admin dashboard and set Availability back to **Available**.
- **You're locked out of the admin dashboard:** Go back to Supabase's SQL Editor and run the password-hash
  steps from step 5 again with a new password for your account.
- **Something looks visually wrong:** Take a screenshot and note which page, which browser, and which device
  (phone/desktop) — this makes it much faster for a developer to fix.

## 18. Tasks that must be completed before launch

- [ ] Create real Supabase, Vercel, and PayFast accounts (steps 4, 6, 9), ideally under Des's name.
- [ ] Run all 5 database migration files (step 4.6).
- [ ] Create your admin login (step 5) and confirm you can sign in.
- [ ] Add your real environment variables in Vercel (step 6.4).
- [ ] Test the full purchase flow in PayFast **sandbox** mode (step 10).
- [ ] Review and finish the **legal pages** — go to Admin → **Settings** → **Legal Policy Pages**. The
      current Privacy Policy, Terms, and Returns & Refunds text are starter drafts and say so on the page —
      they name the gaps to fill in (business registration details, POPIA information officer, your actual
      returns policy). These have **not** been reviewed by a lawyer; consider having a lawyer check them
      before accepting real payments.
- [ ] Decide on your real shipping approach in Admin → Settings → **Shipping Settings** (currently defaults to
      "quote required" for anything without a price/shipping override, which is a safe default but means
      you'll be quoting shipping by hand until you set flat rates).
- [ ] Get your real PayFast account verified and switch from sandbox to live (step 11) **only when you're
      ready to accept real payments**.
- [ ] Go through **every one of the 68 paintings** in Admin → Artworks and confirm the price, availability,
      and publishing status are what you want — they were imported as drafts/gallery-only by default and need
      your review before customers can buy them.
- [ ] Connect your real domain (step 8).

### Business information still needed (not invented — left as editable placeholders)

These specific details weren't provided, so the legal pages currently say so plainly rather than making
something up. Fill them in via Admin → Settings → Legal Policy Pages once you have them:

- Registered business name and/or company registration number (if trading as a registered entity, rather than
  as an individual)
- VAT number, if VAT-registered
- Information Officer name/contact for POPIA compliance (required for South African businesses handling
  personal information — this can be Des herself)
- Your actual returns/refund window and condition requirements for a returned painting
- Governing law / jurisdiction for the Terms & Conditions (South Africa is assumed but not stated as a legal
  fact anywhere)
- A street address is deliberately **not** shown anywhere on the public site (only "East London, South
  Africa") — if you want a full business address on file for legal documents, that's separate from what's
  public

## 19. Tasks that can safely wait until later

- Setting up Resend for email notifications (forms still save to the database without it — you just won't get
  an email alert).
- Fine-tuning homepage copy, featured paintings, and the homepage hero image (Admin → Settings, and the
  Featured/Hero checkboxes on each artwork).
- Adding flat shipping rates instead of "quote required" for particular paintings.
- Adding more artwork images beyond the primary photo (the admin currently supports replacing the primary
  image; multiple photos per artwork is a schema-ready feature for a future update).
- Print/reproduction sales (not part of this build — the spreadsheet's "Print Candidates" sheet was noted but
  not implemented).

---

## What you'll need to have ready (accounts & credentials checklist)

- [ ] Supabase account (Des's email)
- [ ] Vercel account (Des's email)
- [ ] GitHub account (to hold the code for Vercel to deploy — can be anyone's, ideally Des's)
- [ ] PayFast Business account, ID-verified (Des's details, since this is who gets paid)
- [ ] A domain name
- [ ] Resend account (optional)
- [ ] A password manager or safe place to store: the Supabase database password, `ADMIN_SESSION_SECRET`,
      PayFast credentials, and your own admin login password

---

## Backups

Supabase automatically takes daily backups of your database on paid plans; on the free plan, consider
periodically exporting your data yourself: Supabase dashboard → **Database** → **Backups**, or by running
`pg_dump` against your `DATABASE_URL` if you're comfortable with the command line. Your original artwork
images and the source spreadsheet are preserved in the project's `public/images/artworks/originals/` and
`data/source/` folders — keep a copy of the whole project folder somewhere safe (e.g. cloud storage) in
addition to GitHub.

## Questions this guide can't answer

If you get stuck on a specific error message, the fastest way to get help is to take a screenshot of exactly
what you see (the error message, which page, which step of this guide) and share it with whoever is
maintaining the site for you.
