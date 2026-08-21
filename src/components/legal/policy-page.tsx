export function PolicyPage({ title, content, needsCompletion }: { title: string; content: string; needsCompletion: boolean }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <h1 className="font-serif text-3xl text-charcoal sm:text-4xl">{title}</h1>
      {needsCompletion && (
        <p className="mt-4 border border-clay/40 bg-parchment px-4 py-3 text-sm text-charcoal-soft">
          This is starter content and has not been reviewed by a lawyer. It should be completed and reviewed before
          relying on it for a live business.
        </p>
      )}
      <div className="prose-content mt-8 space-y-4 whitespace-pre-wrap text-base leading-relaxed text-charcoal-soft">
        {content}
      </div>
    </div>
  );
}
