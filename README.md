# Art by Des Green

A production Next.js website for South African artist Des Green — portfolio, full gallery, and a working
ecommerce checkout for original paintings, with a secure admin dashboard.

If you're not a developer, read **[LAUNCH_ME_FIRST.md](./LAUNCH_ME_FIRST.md)** instead — it's a plain-English,
step-by-step guide to getting this site online. This README is the technical reference.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** for styling
- **PostgreSQL** via `pg` — targets **Supabase Postgres** in production, using a direct connection string
  (works identically against any Postgres, including Supabase's)
- **Supabase Storage** for admin-uploaded images (artwork replacements, commission reference images, studio photo)
- **PayFast** for payments, implemented against a `PaymentProvider` interface (see
  `src/lib/payments/provider.ts`) so a second provider could be added later without touching checkout code
- **Resend** for transactional email (optional — forms still save to the database without it)
- Custom admin authentication (bcrypt + signed session cookie), not Supabase Auth — see "Why not Supabase
  Auth?" below

## Project structure

```
src/app/                    Routes (App Router)
  admin/(dashboard)/        Authenticated admin dashboard (artworks, orders, settings, ...)
  admin/login/              Admin login (outside the authenticated layout)
  api/payfast/itn/          PayFast webhook — the ONLY place an order is marked paid
  artwork/[slug]/           Public artwork detail page
  checkout/                 Checkout flow (start -> pay -> success/cancelled/quote-requested)
  gallery/, available-works/, sold-work/, meet-the-artist/, contact/, commissions/, legal/
src/components/             UI components, grouped by area (ui, layout, artwork, gallery, forms, admin)
src/lib/
  data/                     Database read functions (one file per domain area)
  actions/                  Server Actions (mutations) — forms, checkout, admin CRUD
  payments/                 PayFast provider + the pure signature logic (payfast-signature.ts, unit tested)
  auth.ts                   Admin session creation/verification
  db.ts                     Postgres connection pool
  validation.ts             Zod schemas for every form
src/types/domain.ts         Shared TypeScript types for the whole app
supabase/migrations/        SQL migrations, run in order (0001, 0002, ...)
scripts/import-artworks.mjs The spreadsheet + image catalogue importer (see below)
scripts/dev/                Optional local-only tooling, not part of the deployed app — an embedded
                             Postgres (no Docker/install needed) for testing without a live Supabase
                             project: `node scripts/dev/local-db.mjs` starts it, `node scripts/dev/
                             seed-direct.mjs` applies migrations + seeds it from the imported catalogue.
                             It's genuinely useful for quick local testing, but the socket bridge it uses
                             is not rock solid under sustained load — if it drops connections, just
                             restart it. This was how the app was built and tested; it is not required
                             for production, which always talks to Supabase's real Postgres instead.
tests/                      Unit tests (node --test) for pure logic: PayFast signatures, money, slugs
```

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables** — copy `.env.example` to `.env.local` and fill in your own Supabase and
   PayFast sandbox credentials (see LAUNCH_ME_FIRST.md for where to get each one).

3. **Run the database migrations** against your Supabase project. Easiest path: open the Supabase dashboard's
   SQL Editor and paste in each file from `supabase/migrations/` in order (0001, 0002, 0003, 0004, 0005). Or
   use the Supabase CLI (`supabase db push`) if you have it installed.

4. **Import the catalogue** (see [Re-running the spreadsheet import](#re-running-the-spreadsheet-import)
   below) — this seeds all 68 artworks from the spreadsheet.

5. **Create your first admin user** — see [Creating an admin user](#creating-an-admin-user) below.

6. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit http://localhost:3000.

## Re-running the spreadsheet import

The source spreadsheet lives at `data/source/Art_by_Des_Green_VISUAL_MASTER.xlsm`. To update the catalogue
(new prices, a corrected title, etc.), replace that file with an updated export and re-run:

```bash
npm run import:catalogue          # dry run: validates everything, writes a report, does NOT touch the database
npm run import:catalogue:apply    # writes to the database (needs DATABASE_URL set)
```

The importer:

- Matches each spreadsheet row to its image by the two-digit rank prefix in the filename (`01 - ...jpg` = Rank 1)
- Validates that ranks 1–68 are all present exactly once, with no missing or duplicate images
- Never guesses a blank price or blank dimension — those fields stay empty rather than becoming `0`
- Writes a full report to `scripts/output/import-report.json` (rows imported, skipped, invalid prices/dimensions,
  missing/duplicate images) and the clean seed data to `scripts/output/artworks.seed.json`
- **Skips any artwork the admin has already hand-edited** in the dashboard (tracked via an `admin_edited` flag),
  so re-importing never silently overwrites a manual correction. Pass `--force all` (or `--force <rank>,<rank>`)
  to override that protection deliberately.

New artworks import as `draft` / not-for-sale — review each one in the admin dashboard and set its price and
availability before it goes live.

## Creating an admin user

There's no public sign-up — admin accounts are created directly in the database. Run this SQL in the Supabase
SQL Editor (replace the email and the bcrypt hash):

```sql
insert into admin_users (email, password_hash, name, role)
values ('you@example.com', '$2a$12$REPLACE_WITH_A_REAL_BCRYPT_HASH', 'Des Green', 'owner');
```

To generate a bcrypt hash for your chosen password, run this locally (needs `npm install` done first):

```bash
node -e "require('bcryptjs').hash(process.argv[1], 12).then(console.log)" "YourChosenPassword123!"
```

Copy the output into the SQL above, run it, then sign in at `/admin/login`.

## Testing

```bash
npm run lint        # ESLint
npx tsc --noEmit     # TypeScript
npm test             # Unit tests (PayFast signature logic, money/slug utilities)
npm run build        # Production build
```

The unit tests cover the parts of the system that are safe to test without a live database or PayFast account:
PayFast's signature algorithm (verified against PHP `urlencode()` behaviour and PayFast's own documented
examples), money formatting, and slug generation. Checkout, inventory reservation, and the admin dashboard were
verified against a real (locally-run) Postgres database during development — see the "What was and wasn't
tested live" note in LAUNCH_ME_FIRST.md for what still needs verifying against your real Supabase and PayFast
sandbox accounts before launch.

## Deployment

Deploy to Vercel (recommended) or any Node.js host that supports Next.js. See LAUNCH_ME_FIRST.md for the
full walkthrough, including environment variables and going from PayFast sandbox to live.

## Why not Supabase Auth?

The admin dashboard uses a small custom credential system (a `admin_users` table, bcrypt password hashing, a
signed httpOnly session cookie) instead of Supabase Auth. For a single admin (or a small handful of trusted
staff), this is simpler to reason about, has no extra moving parts to configure, and was fully testable during
development against a local database. Supabase is still used for everything else — Postgres and Storage.
Swapping in Supabase Auth later would only touch `src/lib/auth.ts` and `src/lib/actions/admin-auth.ts`.

## Payment provider abstraction

Checkout code never calls PayFast directly — it goes through `src/lib/payments/provider.ts`'s
`PaymentProvider` interface. `src/lib/payments/payfast.ts` is the only PayFast-specific file. Adding Yoco or
another provider later means writing one new file implementing the same interface and swapping which one
`src/lib/payments/payfast.ts`'s consumers import — the checkout pages, order model, and admin dashboard don't
change.
