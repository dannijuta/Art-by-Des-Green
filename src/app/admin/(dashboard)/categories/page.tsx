import { listAllCategoriesAdmin } from '@/lib/data/categories';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { slugify } from '@/lib/slug';
import { revalidatePath } from 'next/cache';

export const metadata = { title: 'Admin — Categories' };

async function renameCategory(formData: FormData) {
  'use server';
  await requireAdmin();
  const id = Number(formData.get('id'));
  const name = String(formData.get('name') || '').trim();
  const sortOrder = Number(formData.get('sortOrder') || 0);
  if (!id || !name) return;
  await query('update categories set name = $1, sort_order = $2 where id = $3', [name, sortOrder, id]);
  revalidatePath('/admin/categories');
}

async function addCategory(formData: FormData) {
  'use server';
  await requireAdmin();
  const name = String(formData.get('name') || '').trim();
  if (!name) return;
  await query('insert into categories (name, slug) values ($1, $2) on conflict (name) do nothing', [name, slugify(name)]);
  revalidatePath('/admin/categories');
}

export default async function AdminCategoriesPage() {
  const categories = await listAllCategoriesAdmin();

  return (
    <div>
      <h1 className="font-serif text-2xl text-charcoal">Categories</h1>
      <p className="mt-2 max-w-xl text-sm text-charcoal-soft">
        Categories drive the Gallery filters. Rename them here, or set a display order (lower numbers show first).
      </p>

      <div className="mt-6 max-w-2xl border border-border-soft bg-cream divide-y divide-border-soft">
        {categories.map((cat) => (
          <form key={cat.id} action={renameCategory} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <input type="hidden" name="id" value={cat.id} />
            <input
              type="text"
              name="name"
              defaultValue={cat.name}
              className="flex-1 border border-border bg-ivory px-3 py-1.5 text-sm"
            />
            <input
              type="number"
              name="sortOrder"
              defaultValue={cat.sortOrder}
              className="w-20 border border-border bg-ivory px-3 py-1.5 text-sm"
            />
            <button type="submit" className="border border-charcoal px-3 py-1.5 text-xs text-charcoal hover:bg-charcoal hover:text-cream">
              Save
            </button>
          </form>
        ))}
      </div>

      <form action={addCategory} className="mt-6 flex max-w-md gap-3">
        <input
          type="text"
          name="name"
          placeholder="New category name"
          required
          className="flex-1 border border-border bg-cream px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-clay px-4 py-2 text-sm text-cream hover:bg-clay-dark">
          Add
        </button>
      </form>
    </div>
  );
}
