import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('scripts/output/copy-master.json', 'utf8'));

function sqlStr(v) {
  if (v === null || v === undefined || v === '') return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}
function slugify(input) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[''']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// The 8 curated public categories, in the order they should appear as filters.
const CURATED_CATEGORIES = [
  'Wildlife & Animals',
  'Coastal & Seascapes',
  'Landscapes & Rivers',
  'Cityscapes',
  'Figurative & Portraits',
  'Still Life',
  'Character Series',
  'South African Scenes',
];

let sql = `-- Art by Des Green: catalogue copy refresh (titles, categories, stories, alt text)\n`;
sql += `-- Generated from Art_by_Des_Green_Website_Copy_Master.xlsx, approved by Des.\n`;
sql += `-- Safe to re-run: every artwork update is keyed by rank.\n\n`;

// 1. Create the curated public categories (idempotent), with sort order matching the list above.
sql += `insert into categories (name, slug, sort_order) values\n`;
sql += CURATED_CATEGORIES.map(
  (c, i) => `  (${sqlStr(c)}, ${sqlStr(slugify(c))}, ${i + 1})`
).join(',\n');
sql += `\non conflict (name) do update set sort_order = excluded.sort_order;\n\n`;

// 2. Update each artwork: title, category (pointing at the curated category),
//    internal_category_tag (the original granular category), story, short
//    card copy, alt text, seo title, and the approval-workflow flags.
sql += `update artworks set\n`;
sql += `  public_title = c.public_title,\n`;
sql += `  category_id = (select id from categories where name = c.public_category),\n`;
sql += `  internal_category_tag = c.internal_category_tag,\n`;
sql += `  public_description = c.public_description,\n`;
sql += `  short_card_copy = c.short_card_copy,\n`;
sql += `  alt_text = c.alt_text,\n`;
sql += `  seo_title = c.seo_title,\n`;
sql += `  title_needs_artist_approval = c.title_needs_artist_approval,\n`;
sql += `  copy_needs_artist_approval = false\n`;
sql += `from (values\n`;

sql += data.artworkCopy
  .map((r) => {
    const rank = r['Rank'];
    const title = r['Recommended Title'] || r['Current Title'];
    const category = r['Recommended Public Category'];
    const internalTag = r['Current Category'];
    const story = r['Draft Artwork Story'];
    const shortCopy = r['Short Card Copy'];
    const altText = r['Draft Alt Text'];
    const seoTitle = r['Suggested SEO Title'];
    // Des has approved this whole batch (confirmed by the site owner), so every
    // row is applied and marked resolved now — this flag stays available for
    // flagging *future* catalogue additions that haven't been through review yet.
    return `  (${rank}, ${sqlStr(title)}, ${sqlStr(category)}, ${sqlStr(internalTag)}, ${sqlStr(story)}, ${sqlStr(shortCopy)}, ${sqlStr(altText)}, ${sqlStr(seoTitle)}, false)`;
  })
  .join(',\n');

sql += `\n) as c(rank, public_title, public_category, internal_category_tag, public_description, short_card_copy, alt_text, seo_title, title_needs_artist_approval)\n`;
sql += `where artworks.rank = c.rank;\n\n`;

// 3. Remove the old granular categories that are no longer referenced by any
//    artwork, now that everything points at a curated category.
sql += `delete from categories\n`;
sql += `where not exists (select 1 from artworks where artworks.category_id = categories.id)\n`;
sql += `  and name not in (\n`;
sql += CURATED_CATEGORIES.map((c) => `    ${sqlStr(c)}`).join(',\n');
sql += `\n  );\n`;

fs.writeFileSync('scripts/output/0008_copy_and_category_update.sql', sql);
console.log('wrote SQL, bytes:', Buffer.byteLength(sql), 'artworks:', data.artworkCopy.length);

// Sanity: report which titles need approval (should be none, per confirmation this was approved).
const needsApproval = data.artworkCopy.filter((r) => String(r['Title Approval Needed']).toLowerCase() === 'yes');
console.log('Rows flagged Title Approval Needed = Yes:', needsApproval.length);
