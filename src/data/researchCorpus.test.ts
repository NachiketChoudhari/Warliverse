import { describe, expect, it } from 'vitest'
import { grammarRules } from './grammar'
import { importResearchData } from './importResearchData'
import { createReferenceExport, stringifyReferenceExport } from './referenceExport'
import { referenceCollection } from './referenceCollection'
import { researchCorpusV1 } from './research/researchCorpus'
import { getGrammarEvidenceCounts } from './grammarEvidence'
import { validateReferenceCollection } from './referenceValidator'
import type { GrammarRule } from '../grammar/types'
import type { ResearchImport } from './researchImport'

function grammarEvidenceFixture(): ResearchImport {
  return {
    schemaVersion: 1,
    sources: [{
      id: 'fixture-source',
      title: 'Fixture source',
      sourceType: 'academic',
      documentationStatus: 'documented',
    }],
    artworks: [{
      id: 'fixture-artwork',
      title: 'Fixture artwork',
      source: 'fixture-source',
      documentationStatus: 'documented',
    }],
    motifObservations: [],
    grammarObservations: [{
      id: 'fixture-grammar-observation',
      artworkId: 'fixture-artwork',
      sourceReferenceId: 'fixture-source',
      kind: 'composition',
      description: 'Fixture observation used only to exercise evidence reference validation.',
      confidence: 0.8,
      documentationStatus: 'documented',
    }],
    measurements: [],
    grammarEvidence: [{
      ruleId: 'human.part.primitive',
      description: 'Fixture evidence chain for validator coverage only.',
      sourceReferenceIds: ['fixture-source'],
      observationIds: ['fixture-grammar-observation'],
    }],
  }
}

describe('research corpus v1', () => {
  it('passes the Phase 10 import validator with the expected source and artwork counts', () => {
    const result = importResearchData(researchCorpusV1)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.counts).toEqual({
      sources: 6,
      artworks: 8,
      motifObservations: 1,
      grammarObservations: 1,
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
    expect(referenceCollection.artworks.find(({ id }) => id === 'rao-2022-figure-2-tarpa-dance')?.motifs?.[0]?.motifId).toBe('human')
    expect(referenceCollection.artworks.filter(({ id }) => id !== 'rao-2022-figure-2-tarpa-dance').every(({ motifs }) => !motifs?.length)).toBe(true)
  })

  it('keeps observations separate from rules and leaves all four rules pending', () => {
    const configuredRules: readonly GrammarRule[] = grammarRules
    expect(referenceCollection.artworks.every(({ measurements }) => !measurements?.length)).toBe(true)
    expect(researchCorpusV1.grammarEvidence).toEqual([])
    expect(configuredRules.every(({ sourceReferenceIds }) => !sourceReferenceIds?.length)).toBe(true)
    expect(getGrammarEvidenceCounts(grammarRules, referenceCollection.sources)).toMatchObject({ sourceBackedCount: 0, pendingCount: 4 })
    expect(referenceCollection.artworks.flatMap(({ observations }) => observations ?? []).every(({ ruleId }) => !ruleId)).toBe(true)
  })

  it('requires unique observation IDs, valid artwork/source provenance, and documented status', () => {
    const sourceIds = new Set(referenceCollection.sources.map(({ id }) => id))
    const artworks = new Map(referenceCollection.artworks.map((artwork) => [artwork.id, artwork]))
    const ids: string[] = []
    for (const observation of [...researchCorpusV1.motifObservations, ...researchCorpusV1.grammarObservations]) {
      ids.push(observation.id)
      const artwork = artworks.get(observation.artworkId)
      expect(artwork).toBeDefined()
      expect(sourceIds.has(observation.sourceReferenceId ?? '')).toBe(true)
      expect(artwork?.source).toBe(observation.sourceReferenceId)
      expect(observation.documentationStatus).toBeTruthy()
      expect(observation.description).toBeTruthy()
    }
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('rejects unsupported records with unresolved source or artwork provenance', () => {
    const badSource = structuredClone(researchCorpusV1)
    badSource.motifObservations[0].sourceReferenceId = 'source-not-in-corpus'
    expect(importResearchData(badSource).valid).toBe(false)
    const badArtwork = structuredClone(researchCorpusV1)
    badArtwork.grammarObservations[0].artworkId = 'artwork-not-in-corpus'
    expect(importResearchData(badArtwork).valid).toBe(false)
  })

  it('accepts a complete source-to-artwork-to-observation-to-evidence chain', () => {
    const fixture = grammarEvidenceFixture()
    const result = importResearchData(fixture)
    expect(result.valid, JSON.stringify(result.errors)).toBe(true)
    expect(result.errors).toEqual([])

    const normalized = result.normalizedData
    expect(normalized?.sources.map(({ id }) => id)).toContain('fixture-source')
    const artwork = normalized?.artworks.find(({ id }) => id === 'fixture-artwork')
    expect(artwork?.source).toBe('fixture-source')
    expect(artwork?.observations?.[0]).toMatchObject({
      id: 'fixture-grammar-observation',
      sourceReferenceId: 'fixture-source',
    })
    expect(normalized?.grammarEvidence[0]).toMatchObject({
      ruleId: 'human.part.primitive',
      sourceReferenceIds: ['fixture-source'],
      observationIds: ['fixture-grammar-observation'],
    })
  })

  it('rejects a grammar evidence chain with an unresolved observation ID', () => {
    const fixture = grammarEvidenceFixture()
    fixture.grammarEvidence[0].observationIds = ['missing-observation']
    const result = importResearchData(fixture)
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(expect.objectContaining({ code: 'unresolved-observation' }))
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
