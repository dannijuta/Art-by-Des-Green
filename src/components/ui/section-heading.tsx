export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-xs tracking-[0.25em] text-clay-dark">{eyebrow.toUpperCase()}</p>}
        <h2 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
