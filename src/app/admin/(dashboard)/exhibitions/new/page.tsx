import { createExhibitionAction } from '@/lib/actions/admin-exhibitions';
import { ExhibitionForm } from '@/components/admin/exhibition-form';

export const metadata = { title: 'Admin — Add Exhibition' };

export default function NewExhibitionPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-charcoal">Add Exhibition</h1>
      <div className="mt-6">
        <ExhibitionForm action={createExhibitionAction} />
      </div>
    </div>
  );
}
