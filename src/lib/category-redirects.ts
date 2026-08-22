/**
 * The 25 original granular categories were consolidated into 8 curated public
 * categories. Any link built against an old category slug (e.g. from a
 * bookmark, a shared link, or a search engine that indexed the old gallery
 * URLs) is redirected to its new curated equivalent rather than silently
 * showing an empty/unfiltered gallery.
 */
export const OLD_CATEGORY_SLUG_REDIRECTS: Record<string, string> = {
  wildlife: 'wildlife-animals',
  'south-african-cityscape': 'south-african-scenes',
  'african-figurative': 'figurative-portraits',
  portrait: 'figurative-portraits',
  'south-african-coastal': 'south-african-scenes',
  animals: 'wildlife-animals',
  'coastal-lighthouse': 'coastal-seascapes',
  cityscape: 'cityscapes',
  'character-chimp-series': 'character-series',
  'coastal-boats': 'coastal-seascapes',
  figurative: 'figurative-portraits',
  'cafe-city': 'cityscapes',
  'floral-water': 'landscapes-rivers',
  'coastal-birds': 'coastal-seascapes',
  coastal: 'coastal-seascapes',
  'coastal-sailboats': 'coastal-seascapes',
  'coastal-waves': 'coastal-seascapes',
  'landscape-river': 'landscapes-rivers',
  'nature-stones': 'landscapes-rivers',
  'animals-african': 'wildlife-animals',
  'city-coastal': 'cityscapes',
  'contemporary-boats': 'coastal-seascapes',
  'food-still-life': 'still-life',
  'statement-figurative': 'figurative-portraits',
  'celebrity-music': 'figurative-portraits',
};
