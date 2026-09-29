import type { GrammarRule } from '../../grammar/types'
import type { GrammarObservation, ReferenceSource } from '../../data/references'

export function GrammarObservationCard({ observation, rules, sources }: {
  observation: GrammarObservation
  rules: readonly GrammarRule[]
  sources: readonly ReferenceSource[]
}) {
  const source = sources.find(({ id }) => id === observation.sourceReferenceId)
  const rule = rules.find(({ id }) => id === observation.ruleId)
  return <article className="border border-line p-4">
    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terracotta">Observation</p>
    <p className="mt-1 text-xs uppercase tracking-wide text-muted">{observation.kind.replaceAll('-', ' ')}</p>
    {observation.description && <p className="mt-2 text-sm leading-6">{observation.description}</p>}
    {observation.confidence !== undefined && <p className="mt-2 text-xs text-muted">Recorded confidence: {observation.confidence}</p>}
    {observation.sourceReferenceId && <p className="mt-2 text-xs text-muted">Source: {source?.title ?? observation.sourceReferenceId}</p>}
    {observation.notes && <p className="mt-2 text-sm text-muted">{observation.notes}</p>}
    <div className="mt-4 border-t border-line pt-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Software rule</p>
      {rule ? <><code className="mt-1 block text-xs text-terracotta">{rule.id}</code><p className="mt-1 text-sm text-muted">{rule.description}</p></> : <p className="mt-1 text-sm text-muted">No software rule is linked. An observation does not automatically become a rule.</p>}
    </div>
  </article>
}
