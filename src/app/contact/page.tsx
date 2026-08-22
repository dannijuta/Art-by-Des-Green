import type { Metadata } from 'next';
import Link from 'next/link';
import { getContactSettings, getArtistProfile } from '@/lib/data/settings';
import { ContactForm } from '@/components/forms/contact-form';
import { SectionHeading } from '@/components/ui/section-heading';
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon } from '@/components/icons/social';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with South African artist Des Green for artwork enquiries, availability, or commissions.',
  alternates: { canonical: '/contact' },
  openGraph: { url: '/contact' },
};

export default async function ContactPage(props: PageProps<'/contact'>) {
  const searchParams = await props.searchParams;
  const artworkId = typeof searchParams.artworkId === 'string' ? searchParams.artworkId : undefined;
  const artworkTitle = typeof searchParams.artworkTitle === 'string' ? searchParams.artworkTitle : undefined;

  const [contact, artist] = await Promise.all([getContactSettings(), getArtistProfile()]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
      <SectionHeading as="h1" eyebrow="Get in Touch" title="Get in Touch" />
      <p className="mt-4 max-w-2xl text-base text-charcoal-soft">
        For artwork enquiries, commissions, availability or collection questions, you are welcome to contact Des
        directly.
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-xl text-charcoal">Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-charcoal-soft">Based in</dt>
                <dd className="text-charcoal">{contact.location}</dd>
              </div>
              <div>
                <dt className="text-charcoal-soft">Telephone</dt>
                <dd>
                  <a href={contact.phoneLink} className="inline-flex items-center gap-2 text-charcoal hover:text-clay-dark">
                    <PhoneIcon className="h-4 w-4" /> {contact.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-charcoal-soft">Email</dt>
                <dd>
                  <a href={contact.emailLink} className="inline-flex items-center gap-2 text-charcoal hover:text-clay-dark">
                    <MailIcon className="h-4 w-4" /> {contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-charcoal-soft">Facebook</dt>
                <dd>
                  <a
                    href={contact.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={contact.facebookLabel}
                    className="inline-flex items-center gap-2 text-charcoal hover:text-clay-dark"
                  >
                    <FacebookIcon className="h-4 w-4" /> Art by Des Green
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-charcoal-soft">Instagram</dt>
                <dd>
                  <a
                    href={contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={contact.instagramLabel}
                    className="inline-flex items-center gap-2 text-charcoal hover:text-clay-dark"
                  >
                    <InstagramIcon className="h-4 w-4" /> {contact.instagramHandle}
                  </a>
                </dd>
              </div>
              {artist.commissionsOpen && (
                <div>
                  <dt className="text-charcoal-soft">Commission status</dt>
                  <dd className="text-clay-dark">Commissions open</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="border border-border-soft bg-parchment p-6">
            <h2 className="font-serif text-lg text-charcoal">Looking to commission a piece?</h2>
            <p className="mt-2 text-sm text-charcoal-soft">
              Use the dedicated commission form so Des has everything she needs to begin the conversation.
            </p>
            <Link
              href="/commissions"
              className="mt-4 inline-flex items-center border border-clay px-4 py-2 text-sm text-clay-dark transition-colors hover:bg-clay hover:text-cream"
            >
              Commission an Artwork
            </Link>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal">Enquire About an Artwork</h2>
          <div className="mt-4">
            <ContactForm artworkId={artworkId} artworkTitle={artworkTitle} defaultReason={artworkId ? 'purchase' : 'general'} />
          </div>
        </div>
      </div>
    </div>
  );
}
