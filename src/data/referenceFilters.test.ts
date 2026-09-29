import { describe, expect, it } from 'vitest'
import { filterReferenceArtworks, getReferenceFilterOptions } from './referenceFilters'
import type { ReferenceCollection } from './references'

const fixtures: ReferenceCollection = {
  sources: [{ id: 'source-test', title: 'Test fixture source', sourceType: 'academic', documentationStatus: 'pending-review' }],
  artworks: [
    { id: 'art-one', title: 'Test fixture one', source: 'source-test', documentationStatus: 'documented', motifs: [{ id: 'motif-one', kind: 'composition', motifId: 'human' }] },
    { id: 'art-two', title: 'Test fixture two', sourceType: 'museum', documentationStatus: 'pending-review', motifs: [{ id: 'motif-two', kind: 'composition', motifId: 'sun' }] },
  ],
}

describe('reference archive filtering', () => {
  it('has no filter options in the empty archive', () => {
    expect(getReferenceFilterOptions({ sources: [], artworks: [] })).toEqual({ statuses: [], sourceTypes: [], motifIds: [] })
  })

  it('filters by documentation status', () => {
    expect(filterReferenceArtworks(fixtures, { status: 'pending-review' }).map(({ id }) => id)).toEqual(['art-two'])
  })

  it('filters by motif using the configured motif vocabulary', () => {
    expect(filterReferenceArtworks(fixtures, { motif: 'human' }).map(({ id }) => id)).toEqual(['art-one'])
    expect(getReferenceFilterOptions(fixtures).motifIds).toEqual(['human', 'sun'])
  })

  it('filters by linked source type as well as an artwork-level source type', () => {
    expect(filterReferenceArtworks(fixtures, { sourceType: 'academic' }).map(({ id }) => id)).toEqual(['art-one'])
    expect(filterReferenceArtworks(fixtures, { sourceType: 'museum' }).map(({ id }) => id)).toEqual(['art-two'])
  })
})
