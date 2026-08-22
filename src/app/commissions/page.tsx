import type { Metadata } from 'next';
import { CommissionForm } from '@/components/forms/commission-form';
import { SectionHeading } from '@/components/ui/section-heading';
import { getArtistProfile } from '@/lib/data/settings';

export const metadata: Metadata = {
  title: 'Commission an Artwork',
  description: 'Commission an original oil painting from South African artist Des Green.',
  alternates: { canonical: '/commissions' },
  openGraph: { url: '/commissions' },
};

export default async function CommissionsPage() {
  const artist = await getArtistProfile();

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
      <SectionHeading
        as="h1"
        eyebrow={artist.commissionsOpen ? 'Commissions Open' : 'Commissions'}
        title="Commissions Are Open"
      />
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-charcoal-soft">
        Have a subject, memory or idea you would love to see brought to life? Des is currently accepting a limited
        number of painting commissions. Get in touch to begin the conversation.
      </p>

      {!artist.commissionsOpen && (
        <p className="mt-4 border border-border-soft bg-parchment px-4 py-3 text-sm text-charcoal-soft">
          Des isn&apos;t currently accepting new commissions, but you&apos;re welcome to send an enquiry to be
          considered when a slot opens.
        </p>
      )}

      <div className="mt-10">
        <CommissionForm />
      </div>
    </div>
  );
}
