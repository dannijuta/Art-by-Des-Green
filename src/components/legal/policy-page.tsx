export function PolicyPage({ title, content, lastUpdated }: { title: string; content: string; lastUpdated: string }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <h1 className="font-serif text-3xl text-charcoal sm:text-4xl">{title}</h1>
      {lastUpdated && <p className="mt-3 text-xs tracking-wide text-charcoal-soft">Last updated: {lastUpdated}</p>}
      <div className="prose-content mt-8 space-y-4 whitespace-pre-wrap text-base leading-relaxed text-charcoal-soft">
        {content}
      </div>
    </div>
  );
}
