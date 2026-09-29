const pipeline = ['Source', 'Observation', 'Grammar', 'Digital representation', 'Generation', 'Interaction', 'Application', 'Documentation'];

export function PreservationSummary() {
  return (
    <section aria-labelledby="preservation-summary-title" className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">A source-aware workflow</p>
        <h2 id="preservation-summary-title" className="mt-3 font-serif text-4xl text-stone-900">Preservation through careful representation</h2>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Preservation workflow">
        {pipeline.map((item, index) => <li key={item} className="flex min-h-20 items-center gap-3 border border-stone-300 bg-[#fbf8ef] p-4"><span className="text-sm text-stone-500">{String(index + 1).padStart(2, '0')}</span><span className="font-medium">{item}</span></li>)}
      </ol>
      <div className="grid gap-5 md:grid-cols-3">
        <div><h3 className="font-serif text-xl">Source-aware</h3><p className="mt-2 text-stone-700">Reference material and software configuration remain distinguishable.</p></div>
        <div><h3 className="font-serif text-xl">Rule-based</h3><p className="mt-2 text-stone-700">Procedural output follows explicit, inspectable software rules.</p></div>
        <div><h3 className="font-serif text-xl">Artist and community supportive</h3><p className="mt-2 text-stone-700">The project is intended to support documentation and experimentation with appropriate attribution.</p></div>
      </div>
      <div className="border-l-2 border-stone-700 pl-4 text-stone-700">
        <p>The current archive contains no source records yet.</p>
        <p className="mt-2">Cultural validation is not complete. Source-backed interpretation depends on reviewed and attributed material.</p>
      </div>
    </section>
  );
}

