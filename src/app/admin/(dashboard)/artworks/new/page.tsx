import { listAllCategoriesAdmin } from '@/lib/data/categories';
import { createArtworkAction } from '@/lib/actions/admin-artworks';
import { ArtworkForm } from '@/components/admin/artwork-form';

export const metadata = { title: 'Admin — Add Artwork' };

export default async function NewArtworkPage() {
  const categories = await listAllCategoriesAdmin();

  return (
    <div>
      <h1 className="font-serif text-2xl text-charcoal">Add Artwork</h1>
      <div className="mt-6">
        <ArtworkForm categories={categories} action={createArtworkAction} />
      </div>
    </div>
  );
}
