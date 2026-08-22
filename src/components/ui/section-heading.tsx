export function SectionHeading({
  eyebrow,
  title,
  action,
  as = 'h2',
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  /** Use "h1" when this is the page's primary heading (one per page, for SEO/accessibility). */
  as?: 'h1' | 'h2';
}) {
  const Heading = as;
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-xs tracking-[0.25em] text-clay-dark">{eyebrow.toUpperCase()}</p>}
        <Heading className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">{title}</Heading>
      </div>
      {action}
    </div>
  );
}
