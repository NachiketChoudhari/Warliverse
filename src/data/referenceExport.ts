import type { GrammarRule } from '../grammar/types'
import type { ReferenceCollection, ReferenceResearchExport } from './references'

/** Creates a stable, readable and versioned export; it does not mutate the source collection. */
export function createReferenceExport(collection: ReferenceCollection, rules: readonly GrammarRule[]): ReferenceResearchExport {
  const sources = [...collection.sources]
    .sort((a, b) => a.id.localeCompare(b.id))
  const artworks = [...collection.artworks]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((artwork) => ({
      ...artwork,
      motifs: artwork.motifs ? [...artwork.motifs].sort((a, b) => a.id.localeCompare(b.id)) : undefined,
      observations: artwork.observations ? [...artwork.observations].sort((a, b) => a.id.localeCompare(b.id)) : undefined,
      measurements: artwork.measurements ? [...artwork.measurements].sort((a, b) => a.id.localeCompare(b.id)) : undefined,
    }))
  const observationIdsByRule = new Map<string, string[]>()
  collection.artworks.forEach((artwork) => artwork.observations?.forEach((observation) => {
    if (observation.ruleId) observationIdsByRule.set(observation.ruleId, [...(observationIdsByRule.get(observation.ruleId) ?? []), observation.id])
  }))
  const grammarEvidence = [...rules]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((rule) => ({
      ruleId: rule.id,
      description: rule.description,
      sourceReferenceIds: [...(rule.sourceReferenceIds ?? [])].sort(),
      observationIds: [...(observationIdsByRule.get(rule.id) ?? [])].sort(),
    }))

  return { schemaVersion: 1, sources, artworks, grammarEvidence }
}

export function stringifyReferenceExport(collection: ReferenceCollection, rules: readonly GrammarRule[]): string {
  return `${JSON.stringify(createReferenceExport(collection, rules), null, 2)}\n`
}

export function downloadReferenceExport(collection: ReferenceCollection, rules: readonly GrammarRule[]): void {
  const blob = new Blob([stringifyReferenceExport(collection, rules)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'warliverse-research-v1.json'
  link.click()
  URL.revokeObjectURL(url)
}
