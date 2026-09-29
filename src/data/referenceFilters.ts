import { motifs } from './motifs'
import type { ReferenceCollection, ReferenceSourceType, ReferenceStatus } from './references'

export interface ReferenceArtworkFilters {
  status?: ReferenceStatus | ''
  sourceType?: ReferenceSourceType | ''
  motif?: string
}

export function getReferenceFilterOptions(collection: ReferenceCollection) {
  const sourceById = new Map(collection.sources.map((source) => [source.id, source]))
  const statuses = [...new Set(collection.artworks.map(({ documentationStatus }) => documentationStatus))].sort()
  const sourceTypes = [...new Set(collection.artworks.flatMap((artwork) => {
    const sourceType = artwork.sourceType ?? (artwork.source ? sourceById.get(artwork.source)?.sourceType : undefined)
    return sourceType ? [sourceType] : []
  }))].sort()
  const knownMotifs = new Set<string>(motifs.map(({ id }) => id))
  const motifIds = [...new Set(collection.artworks.flatMap((artwork) => artwork.motifs?.flatMap(({ motifId }) => motifId && knownMotifs.has(motifId) ? [motifId] : []) ?? []))].sort()
  return { statuses, sourceTypes, motifIds }
}

export function filterReferenceArtworks(collection: ReferenceCollection, filters: ReferenceArtworkFilters) {
  const sourceById = new Map(collection.sources.map((source) => [source.id, source]))
  return collection.artworks.filter((artwork) => {
    const sourceType = artwork.sourceType ?? (artwork.source ? sourceById.get(artwork.source)?.sourceType : undefined)
    const hasMotif = !filters.motif || artwork.motifs?.some(({ motifId }) => motifId === filters.motif)
    return (!filters.status || artwork.documentationStatus === filters.status)
      && (!filters.sourceType || sourceType === filters.sourceType)
      && hasMotif
  })
}
