import { describe, expect, it } from 'vitest'
import { grammarRules } from './grammar'
import { importResearchData } from './importResearchData'
import { createReferenceExport, stringifyReferenceExport } from './referenceExport'
import { referenceCollection } from './referenceCollection'
import { researchCorpusV1 } from './research/researchCorpus'
import { getGrammarEvidenceCounts } from './grammarEvidence'
import { validateReferenceCollection } from './referenceValidator'
import type { GrammarRule } from '../grammar/types'

describe('research corpus v1', () => {
  it('passes the Phase 10 import validator with the expected source and artwork counts', () => {
    const result = importResearchData(researchCorpusV1)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.counts).toEqual({
      sources: 6,
      artworks: 7,
      motifObservations: 0,
      grammarObservations: 0,
      measurements: 0,
      grammarEvidence: 0,
    })
    expect(result.normalizedData?.sources).toEqual(referenceCollection.sources)
    expect(result.normalizedData?.artworks).toEqual(referenceCollection.artworks)
  })

  it('has unique source and artwork IDs with resolved artwork and attribution provenance', () => {
    const sourceIds = referenceCollection.sources.map(({ id }) => id)
    const artworkIds = referenceCollection.artworks.map(({ id }) => id)
    expect(new Set(sourceIds).size).toBe(sourceIds.length)
    expect(new Set(artworkIds).size).toBe(artworkIds.length)
    const knownSources = new Set(sourceIds)
    for (const artwork of referenceCollection.artworks) {
      expect(knownSources.has(artwork.source ?? '')).toBe(true)
      if (artwork.attribution?.sourceReferenceId) expect(knownSources.has(artwork.attribution.sourceReferenceId)).toBe(true)
    }
    expect(validateReferenceCollection(referenceCollection, grammarRules)).toEqual({ valid: true, issues: [] })
  })

  it('contains only explicit museum maker metadata and does not infer motif observations', () => {
    const jivyaRecord = referenceCollection.artworks.find(({ id }) => id.endsWith('0-3'))
    const groupMakerRecord = referenceCollection.artworks.find(({ id }) => id.endsWith('0-1'))
    expect(jivyaRecord?.artist).toBe('Jivya Soma Mashe')
    expect(groupMakerRecord?.artist).toBeUndefined()
    expect(groupMakerRecord?.notes).toContain('maker Varli')
    expect(referenceCollection.artworks.every(({ motifs }) => !motifs?.length)).toBe(true)
  })

  it('does not create observations, measurements, grammar evidence, or promote rules from catalogue records', () => {
    const configuredRules: readonly GrammarRule[] = grammarRules
    expect(referenceCollection.artworks.every(({ observations, measurements }) => !observations?.length && !measurements?.length)).toBe(true)
    expect(researchCorpusV1.grammarEvidence).toEqual([])
    expect(configuredRules.every(({ sourceReferenceIds }) => !sourceReferenceIds?.length)).toBe(true)
    expect(getGrammarEvidenceCounts(grammarRules, referenceCollection.sources)).toMatchObject({ sourceBackedCount: 0, pendingCount: 4 })
  })

  it('keeps exports deterministic and retains source links without adding image assets', () => {
    const first = stringifyReferenceExport(referenceCollection, grammarRules)
    const second = stringifyReferenceExport(referenceCollection, grammarRules)
    expect(second).toBe(first)
    const exported = createReferenceExport(referenceCollection, grammarRules)
    expect(exported.sources.map(({ id }) => id)).toEqual([...exported.sources.map(({ id }) => id)].sort())
    expect(exported.artworks.every(({ source }) => exported.sources.some((item) => item.id === source))).toBe(true)
    expect(exported.grammarEvidence.every(({ sourceReferenceIds }) => sourceReferenceIds.length === 0)).toBe(true)
  })

  it('keeps candidate institutional PDFs explicitly pending review', () => {
    expect(referenceCollection.sources.find(({ id }) => id === 'source-mota-tribal-faces')?.documentationStatus).toBe('pending-review')
    expect(referenceCollection.sources.find(({ id }) => id === 'source-ccrt-living-traditions')?.documentationStatus).toBe('pending-review')
    expect(referenceCollection.sources.find(({ id }) => id === 'source-mota-tribal-faces')?.notes).toContain('Candidate source only')
    expect(referenceCollection.sources.find(({ id }) => id === 'source-ccrt-living-traditions')?.notes).toContain('Candidate source only')
  })
})
