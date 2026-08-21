import 'server-only';
import { query } from '@/lib/db';
import type { Category } from '@/types/domain';

export async function listAllCategoriesAdmin(): Promise<Category[]> {
  const { rows } = await query<{ id: number; name: string; slug: string; sort_order: number }>(
    'select id, name, slug, sort_order from categories order by sort_order asc, name asc'
  );
  return rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, sortOrder: r.sort_order }));
}

export async function renameCategoryAdmin(id: number, name: string, sortOrder: number): Promise<void> {
  await query('update categories set name = $1, sort_order = $2 where id = $3', [name, sortOrder, id]);
}

export async function createCategoryAdmin(name: string, slug: string): Promise<void> {
  await query('insert into categories (name, slug) values ($1, $2) on conflict (name) do nothing', [name, slug]);
}
