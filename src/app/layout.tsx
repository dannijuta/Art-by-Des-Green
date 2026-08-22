import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { getSeoSettings, getArtistProfile, getContactSettings } from '@/lib/data/settings';
import { hasSoldWorks } from '@/lib/data/artworks';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

// This is a data-driven site (live availability, admin edits, sold status)
// rather than a static brochure, and the root layout itself reads settings
// from the database — so every route renders per-request rather than being
// frozen at build time. This also means `next build` never needs a live
// database connection to succeed.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seo.defaultTitle,
      template: `%s | ${seo.siteName}`,
    },
    description: seo.defaultDescription,
    openGraph: {
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      siteName: seo.siteName,
      type: 'website',
      locale: 'en_ZA',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.defaultTitle,
      description: seo.defaultDescription,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const [artist, contact, showSoldWork] = await Promise.all([
    getArtistProfile(),
    getContactSettings(),
    hasSoldWorks(),
  ]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: artist.name,
    jobTitle: 'Artist / Oil Painter',
    description: artist.professionalDescription,
    address: {
      '@type': 'PostalAddress',
      addressLocality: artist.basedIn,
    },
    email: contact.email,
    telephone: contact.phoneDisplay,
    url: siteUrl,
    sameAs: [contact.facebookUrl, contact.instagramUrl],
  };

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-ivory text-charcoal antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <SiteHeader artist={artist} showSoldWork={showSoldWork} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter artist={artist} contact={contact} showSoldWork={showSoldWork} />
      </body>
    </html>
  );
}
