import Link from 'next/link';
import Image from 'next/image';
import { listAllArtworksAdmin } from '@/lib/data/artworks';
import { formatZAR } from '@/lib/money';
import { artworkThumbPath } from '@/lib/image-paths';

export const metadata = { title: 'Admin — Artworks' };

export default async function AdminArtworksPage(props: PageProps<'/admin/artworks'>) {
  const searchParams = await props.searchParams;
  const availabilityFilter = typeof searchParams.availability === 'string' ? searchParams.availability : undefined;

  const artworks = await listAllArtworksAdmin();
  const filtered = availabilityFilter ? artworks.filter((a) => a.availabilityStatus === availabilityFilter) : artworks;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-charcoal">Artworks ({filtered.length})</h1>
        <Link href="/admin/artworks/new" className="bg-clay px-4 py-2 text-sm text-cream hover:bg-clay-dark">
          + Add Artwork
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto border border-border-soft bg-cream">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-border-soft text-xs text-charcoal-soft">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3">Publishing</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((artwork) => (
              <tr key={artwork.id} className="border-b border-border-soft last:border-0">
                <td className="px-4 py-3 text-charcoal-soft">{artwork.rank}</td>
                <td className="px-4 py-3">
                  {artwork.primaryImagePath && (
                    <div className="relative h-12 w-12 overflow-hidden bg-parchment">
                      <Image
                        src={artworkThumbPath(artwork.primaryImagePath)}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-charcoal">{artwork.publicTitle}</td>
                <td className="px-4 py-3 text-charcoal-soft">{artwork.category?.name ?? '—'}</td>
                <td className="px-4 py-3 text-charcoal-soft">
                  {artwork.priceCents !== null ? formatZAR(artwork.priceCents) : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs">{artwork.availabilityStatus}</span>
                </td>
                <td className="px-4 py-3 text-xs text-charcoal-soft">{artwork.publishingStatus}</td>
                <td className="px-4 py-3 text-xs">{artwork.isFeatured ? 'Yes' : ''}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/artworks/${artwork.id}/edit`} className="text-clay-dark underline underline-offset-4">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
