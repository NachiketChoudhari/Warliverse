import type { GrammarRule } from '../../grammar/types'
import type { GrammarObservation, ReferenceSource } from '../../data/references'
import { getGrammarEvidenceCounts } from '../../data/grammarEvidence'

export function GrammarEvidencePanel({ rules, sources, observations = [] }: {
  rules: readonly GrammarRule[]
  sources: readonly ReferenceSource[]
  observations?: readonly GrammarObservation[]
}) {
  const { backedRules, sourceBackedCount, pendingCount } = getGrammarEvidenceCounts(rules, sources)
  return <section className="border border-line bg-white/25 p-5 sm:p-6" aria-labelledby="grammar-evidence-title">
    <p className="text-xs uppercase tracking-[0.18em] text-muted">Research-to-software trace</p>
    <h2 id="grammar-evidence-title" className="mt-2 font-serif text-2xl">Grammar Evidence</h2>
    <ol className="mt-4 grid gap-2 text-xs sm:grid-cols-4">{['Reference', 'Observation', 'Grammar interpretation', 'Software rule'].map((step, index) => <li key={step} className="border border-line p-3"><span className="mr-2 text-terracotta">0{index + 1}</span>{step}</li>)}</ol>
    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <p>Source-backed rules: <strong>{sourceBackedCount}</strong></p>
      <p>Rules pending documentation: <strong>{pendingCount}</strong></p>
      <p>Grammar observations: <strong>{observations.length}</strong></p>
    </div>
    {backedRules.length === 0
      ? <p className="mt-4 border-l-2 border-terracotta/50 pl-3 py-1 text-sm text-muted">No source-backed grammar rule has been established.</p>
      : <ul className="mt-4 space-y-3">{backedRules.map((rule) => <li key={rule.id} className="border-t border-line pt-3"><code className="text-xs text-terracotta">{rule.id}</code><p className="mt-1 text-sm">{rule.description}</p><p className="mt-1 text-xs text-muted">Linked reference IDs: {rule.sourceReferenceIds?.join(', ')}</p></li>)}</ul>}
    <p className="mt-4 text-xs leading-5 text-muted">Observations are recorded separately; they do not automatically become software rules. Documentation status describes project records, not authenticity or quality.</p>
  </section>
}
