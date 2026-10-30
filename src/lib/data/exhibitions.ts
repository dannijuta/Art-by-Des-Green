import 'server-only';
import { query } from '@/lib/db';

export interface Exhibition {
  id: string;
  title: string;
  venue: string;
  town: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  description: string | null;
  imagePath: string | null;
  linkUrl: string | null;
  isPublished: boolean;
}

interface Row {
  id: string;
  title: string;
  venue: string;
  town: string;
  start_date: string;
  end_date: string;
  description: string | null;
  image_path: string | null;
  link_url: string | null;
  is_published: boolean;
}

const SELECT = `select id, title, venue, town, to_char(start_date, 'YYYY-MM-DD') as start_date,
  to_char(end_date, 'YYYY-MM-DD') as end_date, description, image_path, link_url, is_published from exhibitions`;

function map(r: Row): Exhibition {
  return {
    id: r.id,
    title: r.title,
    venue: r.venue,
    town: r.town,
    startDate: r.start_date,
    endDate: r.end_date,
    description: r.description,
    imagePath: r.image_path,
    linkUrl: r.link_url,
    isPublished: r.is_published,
  };
}

// "Today" in South Africa, so an exhibition stays upcoming through its last day.
const TODAY = `(now() at time zone 'Africa/Johannesburg')::date`;

export async function listPublicExhibitions(): Promise<{ upcoming: Exhibition[]; past: Exhibition[] }> {
  try {
    const [up, past] = await Promise.all([
      query<Row>(`${SELECT} where is_published and end_date >= ${TODAY} order by start_date asc, title asc`),
      query<Row>(`${SELECT} where is_published and end_date < ${TODAY} order by start_date desc, title asc`),
    ]);
    return { upcoming: up.rows.map(map), past: past.rows.map(map) };
  } catch {
    // Table not created yet — show the empty states rather than an error page.
    return { upcoming: [], past: [] };
  }
}

export async function listAllExhibitionsAdmin(): Promise<Exhibition[]> {
  const { rows } = await query<Row>(`${SELECT} order by start_date desc, title asc`);
  return rows.map(map);
}

export async function getExhibitionAdmin(id: string): Promise<Exhibition | null> {
  const { rows } = await query<Row>(`${SELECT} where id = $1`, [id]);
  return rows[0] ? map(rows[0]) : null;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "12 – 14 Mar 2027", "28 Feb – 3 Mar 2027", "12 Mar 2027". */
export function formatExhibitionDates(start: string, end: string): string {
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const e = `${ed} ${MONTHS[em - 1]} ${ey}`;
  if (start === end) return e;
  if (sy === ey && sm === em) return `${sd} – ${e}`;
  if (sy === ey) return `${sd} ${MONTHS[sm - 1]} – ${e}`;
  return `${sd} ${MONTHS[sm - 1]} ${sy} – ${e}`;
}
