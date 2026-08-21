import {
  getArtistProfile,
  getContactSettings,
  getShippingSettings,
  getHomepageCopy,
  getPolicies,
} from '@/lib/data/settings';
import {
  updateArtistProfile,
  updateContactSettings,
  updateShippingSettings,
  updateHomepageCopy,
  updatePolicies,
} from '@/lib/actions/admin-settings';
import { centsToRandString } from '@/lib/money';

export const metadata = { title: 'Admin — Settings' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border-soft bg-cream p-6">
      <h2 className="font-serif text-xl text-charcoal">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-charcoal">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass = 'w-full border border-border bg-ivory px-3 py-2 text-sm';

export default async function AdminSettingsPage() {
  const [artist, contact, shipping, homepage, policies] = await Promise.all([
    getArtistProfile(),
    getContactSettings(),
    getShippingSettings(),
    getHomepageCopy(),
    getPolicies(),
  ]);

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="font-serif text-2xl text-charcoal">Settings</h1>

      <Section title="Artist Profile">
        <form action={updateArtistProfile} encType="multipart/form-data" className="space-y-4">
          <Field label="Name">
            <input name="name" defaultValue={artist.name} className={inputClass} />
          </Field>
          <Field label="Professional description">
            <input name="professionalDescription" defaultValue={artist.professionalDescription} className={inputClass} />
          </Field>
          <Field label="Based in">
            <input name="basedIn" defaultValue={artist.basedIn} className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-charcoal">
            <input type="checkbox" name="commissionsOpen" defaultChecked={artist.commissionsOpen} className="h-4 w-4 accent-clay" />
            Commissions open
          </label>
          <Field label="Studio intro line">
            <input name="introLine" defaultValue={artist.introLine} className={inputClass} />
          </Field>
          <Field label="Biography (separate paragraphs with a blank line)">
            <textarea
              name="bioParagraphs"
              rows={8}
              defaultValue={artist.bioParagraphs.join('\n\n')}
              className={inputClass}
            />
          </Field>
          <Field label="Signature name">
            <input name="signatureName" defaultValue={artist.signatureName} className={inputClass} />
          </Field>
          <Field label="Studio image alt text">
            <input name="studioImageAlt" defaultValue={artist.studioImageAlt ?? ''} className={inputClass} />
          </Field>
          <input type="hidden" name="existingStudioImagePath" value={artist.studioImagePath ?? ''} />
          <Field label="Replace studio photograph">
            <input type="file" name="studioImage" accept="image/jpeg,image/png,image/webp" className="text-sm" />
          </Field>
          <button type="submit" className="bg-clay px-4 py-2 text-sm text-cream hover:bg-clay-dark">
            Save Artist Profile
          </button>
        </form>
      </Section>

      <Section title="Contact Details">
        <form action={updateContactSettings} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone (display)">
              <input name="phoneDisplay" defaultValue={contact.phoneDisplay} className={inputClass} />
            </Field>
            <Field label="Phone (tel: link)">
              <input name="phoneLink" defaultValue={contact.phoneLink} className={inputClass} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email">
              <input name="email" defaultValue={contact.email} className={inputClass} />
            </Field>
            <Field label="Email (mailto: link)">
              <input name="emailLink" defaultValue={contact.emailLink} className={inputClass} />
            </Field>
          </div>
          <Field label="Facebook URL">
            <input name="facebookUrl" defaultValue={contact.facebookUrl} className={inputClass} />
          </Field>
          <Field label="Instagram URL">
            <input name="instagramUrl" defaultValue={contact.instagramUrl} className={inputClass} />
          </Field>
          <Field label="Instagram handle (display)">
            <input name="instagramHandle" defaultValue={contact.instagramHandle} className={inputClass} />
          </Field>
          <Field label="Location (public, no street address)">
            <input name="location" defaultValue={contact.location} className={inputClass} />
          </Field>
          <button type="submit" className="bg-clay px-4 py-2 text-sm text-cream hover:bg-clay-dark">
            Save Contact Details
          </button>
        </form>
      </Section>

      <Section title="Homepage Copy">
        <form action={updateHomepageCopy} className="space-y-4">
          <Field label="Eyebrow">
            <input name="eyebrow" defaultValue={homepage.eyebrow} className={inputClass} />
          </Field>
          <Field label="Headline">
            <input name="headline" defaultValue={homepage.headline} className={inputClass} />
          </Field>
          <Field label="Supporting copy">
            <textarea name="supportingCopy" rows={3} defaultValue={homepage.supportingCopy} className={inputClass} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary button label">
              <input name="primaryCtaLabel" defaultValue={homepage.primaryCtaLabel} className={inputClass} />
            </Field>
            <Field label="Primary button link">
              <input name="primaryCtaHref" defaultValue={homepage.primaryCtaHref} className={inputClass} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Secondary button label">
              <input name="secondaryCtaLabel" defaultValue={homepage.secondaryCtaLabel} className={inputClass} />
            </Field>
            <Field label="Secondary button link">
              <input name="secondaryCtaHref" defaultValue={homepage.secondaryCtaHref} className={inputClass} />
            </Field>
          </div>
          <button type="submit" className="bg-clay px-4 py-2 text-sm text-cream hover:bg-clay-dark">
            Save Homepage Copy
          </button>
        </form>
      </Section>

      <Section title="Shipping Settings">
        <form action={updateShippingSettings} className="space-y-4">
          <Field label="Default shipping method">
            <select name="defaultMethod" defaultValue={shipping.defaultMethod} className={inputClass}>
              <option value="quote_required">Shipping quote required</option>
              <option value="included">Shipping included</option>
              <option value="flat_rate">Flat-rate shipping</option>
              <option value="collection">Collection only</option>
            </select>
          </Field>
          <Field label="Flat rate (R) — used when default/override is flat-rate">
            <input
              name="flatRateRand"
              type="number"
              step="0.01"
              min="0"
              defaultValue={shipping.flatRateCents !== null ? centsToRandString(shipping.flatRateCents) : ''}
              className={inputClass}
            />
          </Field>
          <Field label="Collection note">
            <input name="collectionNote" defaultValue={shipping.collectionNote ?? ''} className={inputClass} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Reservation length (minutes) — standard checkout">
              <input
                name="reservationMinutes"
                type="number"
                min="1"
                defaultValue={shipping.reservationMinutes}
                className={inputClass}
              />
            </Field>
            <Field label="Reservation length (minutes) — while awaiting/after a shipping quote">
              <input
                name="quoteApprovedReservationMinutes"
                type="number"
                min="1"
                defaultValue={shipping.quoteApprovedReservationMinutes}
                className={inputClass}
              />
            </Field>
          </div>
          <button type="submit" className="bg-clay px-4 py-2 text-sm text-cream hover:bg-clay-dark">
            Save Shipping Settings
          </button>
        </form>
      </Section>

      <Section title="Legal Policy Pages">
        <form action={updatePolicies} className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-charcoal">
            <input type="checkbox" name="needsCompletion" defaultChecked={policies.needsCompletion} className="h-4 w-4 accent-clay" />
            Show &quot;starter content — needs review&quot; notice on legal pages
          </label>
          <Field label="Privacy Policy">
            <textarea name="privacyPolicy" rows={6} defaultValue={policies.privacyPolicy} className={inputClass} />
          </Field>
          <Field label="Terms & Conditions">
            <textarea name="terms" rows={6} defaultValue={policies.terms} className={inputClass} />
          </Field>
          <Field label="Shipping & Collection">
            <textarea name="shippingCollection" rows={4} defaultValue={policies.shippingCollection} className={inputClass} />
          </Field>
          <Field label="Returns & Refunds">
            <textarea name="returnsRefunds" rows={4} defaultValue={policies.returnsRefunds} className={inputClass} />
          </Field>
          <Field label="Copyright notice">
            <input name="copyright" defaultValue={policies.copyright} className={inputClass} />
          </Field>
          <button type="submit" className="bg-clay px-4 py-2 text-sm text-cream hover:bg-clay-dark">
            Save Legal Pages
          </button>
        </form>
      </Section>
    </div>
  );
}
