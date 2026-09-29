import { describe, expect, it } from 'vitest'
import { createReferenceExport, stringifyReferenceExport } from './referenceExport'
import type { ReferenceCollection } from './references'

const fixtureCollection: ReferenceCollection = {
  sources: [{ id: 'source-test', title: 'Test fixture source', sourceType: 'academic', citation: 'Test-only fixture', documentationStatus: 'pending-review' }],
  artworks: [{
    id: 'art-test', title: 'Test fixture artwork', source: 'source-test', documentationStatus: 'pending-review',
    attribution: { creator: 'Test fixture attribution', sourceReferenceId: 'source-test' },
    motifs: [{ id: 'motif-test', kind: 'primitive-usage', motifId: 'human', sourceReferenceId: 'source-test' }],
    observations: [{ id: 'observation-test', kind: 'figure-structure', ruleId: 'rule-test', sourceReferenceId: 'source-test' }],
    measurements: [{ id: 'measurement-test', subject: 'test-only quantity', value: 2, unit: 'test units', sourceReferenceId: 'source-test' }],
  }],
}

const fixtureRules = [{ id: 'rule-test', description: 'Test-only software rule', source: 'project-configuration', check: 'allowed-motif', sourceReferenceIds: ['source-test'] }] as const

describe('reference research export', () => {
  it('exports an empty, valid, versioned archive with configured grammar evidence', () => {
    expect(createReferenceExport({ sources: [], artworks: [] }, [])).toEqual({ schemaVersion: 1, sources: [], artworks: [], grammarEvidence: [] })
    expect(JSON.parse(stringifyReferenceExport({ sources: [], artworks: [] }, fixtureRules))).toEqual({
      schemaVersion: 1,
      sources: [],
      artworks: [],
      grammarEvidence: [{ ruleId: 'rule-test', description: 'Test-only software rule', sourceReferenceIds: ['source-test'], observationIds: [] }],
    })
  })

  it('includes source, artwork, observations, measurements, attribution, and rule links', () => {
    const result = createReferenceExport(fixtureCollection, fixtureRules)
    expect(result.sources).toHaveLength(1)
    expect(result.artworks[0].attribution?.creator).toBe('Test fixture attribution')
    expect(result.artworks[0].motifs?.[0].motifId).toBe('human')
    expect(result.artworks[0].observations?.[0].ruleId).toBe('rule-test')
    expect(result.artworks[0].measurements?.[0].sourceReferenceId).toBe('source-test')
    expect(result.grammarEvidence[0].observationIds).toEqual(['observation-test'])
  })

  it('produces deterministic readable JSON without mutating input order', () => {
    const collection = { sources: [...fixtureCollection.sources], artworks: [...fixtureCollection.artworks] }
    const first = stringifyReferenceExport(collection, fixtureRules)
    const second = stringifyReferenceExport(collection, fixtureRules)
    expect(first).toBe(second)
    expect(first.endsWith('\n')).toBe(true)
    expect(JSON.parse(first).schemaVersion).toBe(1)
    expect(collection.artworks).toEqual(fixtureCollection.artworks)
  })
})
