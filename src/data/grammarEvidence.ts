import type { GrammarRule } from '../grammar/types'
import type { ReferenceSource } from './references'

export function getGrammarEvidenceCounts(rules: readonly GrammarRule[], sources: readonly ReferenceSource[]) {
  const sourceIds = new Set(sources.map(({ id }) => id))
  const backedRules = rules.filter((rule) => (rule.sourceReferenceIds ?? []).some((id) => sourceIds.has(id)))
  return { backedRules, sourceBackedCount: backedRules.length, pendingCount: rules.length - backedRules.length }
}
