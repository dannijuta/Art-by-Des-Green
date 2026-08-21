import { notFound } from 'next/navigation';
import { getArtworkByIdAdmin } from '@/lib/data/artworks';
import { listAllCategoriesAdmin } from '@/lib/data/categories';
import { updateArtworkAction, archiveArtworkAction, deleteArtworkAction } from '@/lib/actions/admin-artworks';
import { ArtworkForm } from '@/components/admin/artwork-form';

export const metadata = { title: 'Admin — Edit Artwork' };

export default async function EditArtworkPage(props: PageProps<'/admin/artworks/[id]/edit'>) {
  const { id } = await props.params;
  const [artwork, categories] = await Promise.all([getArtworkByIdAdmin(id), listAllCategoriesAdmin()]);
  if (!artwork) notFound();

  const boundUpdate = updateArtworkAction.bind(null, id);
  const boundArchive = archiveArtworkAction.bind(null, id);
  const boundDelete = deleteArtworkAction.bind(null, id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-charcoal">
          Edit Artwork <span className="text-charcoal-soft">— Rank {artwork.rank}</span>
        </h1>
        <div className="flex gap-3">
          <form action={boundArchive}>
            <button type="submit" className="border border-charcoal px-3 py-2 text-xs text-charcoal hover:bg-charcoal hover:text-cream">
              Archive
            </button>
          </form>
          <form
            action={boundDelete}
          >
            <button type="submit" className="border border-burgundy px-3 py-2 text-xs text-burgundy hover:bg-burgundy hover:text-cream">
              Delete permanently
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6">
        <ArtworkForm artwork={artwork} categories={categories} action={boundUpdate} />
      </div>
    </div>
  );
}
