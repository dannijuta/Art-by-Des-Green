import { notFound } from 'next/navigation';
import { getExhibitionAdmin } from '@/lib/data/exhibitions';
import { updateExhibitionAction, deleteExhibitionAction } from '@/lib/actions/admin-exhibitions';
import { ExhibitionForm } from '@/components/admin/exhibition-form';

export const metadata = { title: 'Admin — Edit Exhibition' };

export default async function EditExhibitionPage(props: PageProps<'/admin/exhibitions/[id]/edit'>) {
  const { id } = await props.params;
  const exhibition = await getExhibitionAdmin(id);
  if (!exhibition) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-charcoal">Edit Exhibition</h1>
        <form action={deleteExhibitionAction.bind(null, id)}>
          <button type="submit" className="border border-burgundy px-3 py-2 text-xs text-burgundy hover:bg-burgundy hover:text-cream">
            Delete exhibition
          </button>
        </form>
      </div>
      <div className="mt-6">
        <ExhibitionForm exhibition={exhibition} action={updateExhibitionAction.bind(null, id)} />
      </div>
    </div>
  );
}
