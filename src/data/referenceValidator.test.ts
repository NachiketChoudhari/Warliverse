import { describe, expect, it } from 'vitest'
import { validateReferenceCollection } from './referenceValidator'
import type { ReferenceCollection } from './references'

const emptyCollection: ReferenceCollection = { sources: [], artworks: [] }

describe('reference collection validation', () => {
  it('accepts an empty collection while research data is not yet available', () => {
    expect(validateReferenceCollection(emptyCollection)).toEqual({ valid: true, issues: [] })
  })

  it('requires source and artwork identifiers and titles', () => {
    const result = validateReferenceCollection({
      sources: [{ id: '', title: '', sourceType: 'other', documentationStatus: 'pending-review' }],
      artworks: [{ id: 'art-1', title: ' ', documentationStatus: 'not-documented' }],
    })

    expect(result.valid).toBe(false)
    expect(result.issues).toContainEqual(expect.objectContaining({ code: 'missing-required-field', recordType: 'source', field: 'id' }))
    expect(result.issues).toContainEqual(expect.objectContaining({ code: 'missing-required-field', recordType: 'source', field: 'title' }))
    expect(result.issues).toContainEqual(expect.objectContaining({ code: 'missing-required-field', recordType: 'artwork', field: 'title' }))
  })

  it('detects duplicate IDs across collection records', () => {
    const result = validateReferenceCollection({
      sources: [{ id: 'same-id', title: 'Source title', sourceType: 'academic', documentationStatus: 'documented' }],
      artworks: [{ id: 'same-id', title: 'Artwork title', documentationStatus: 'pending-review' }],
    })

    expect(result.issues).toContainEqual(expect.objectContaining({ code: 'duplicate-id', recordId: 'same-id' }))
  })

  it('detects broken links from artworks, observations, measurements, and grammar rules', () => {
    const result = validateReferenceCollection({
      sources: [],
      artworks: [{
        id: 'art-1',
        title: 'Recorded artwork',
        source: 'missing-source',
        documentationStatus: 'partially-documented',
        motifs: [{ id: 'motif-observation-1', kind: 'primitive-usage', sourceReferenceId: 'missing-source' }],
        observations: [{ id: 'grammar-observation-1', kind: 'composition', sourceReferenceId: 'missing-source' }],
        measurements: [{ id: 'measurement-1', subject: 'relative measure', value: 12, unit: 'unit', sourceReferenceId: 'missing-source' }],
      }],
    }, [{ id: 'rule-1', description: 'Configured rule', source: 'project-configuration', check: 'allowed-motif', sourceReferenceIds: ['missing-source'] }])

    expect(result.valid).toBe(false)
    expect(result.issues.filter(({ code }) => code === 'broken-source-reference')).toHaveLength(5)
    expect(result.issues).toContainEqual(expect.objectContaining({ code: 'broken-source-reference', recordType: 'artwork', field: 'source' }))
    expect(result.issues).toContainEqual(expect.objectContaining({ code: 'broken-source-reference', recordType: 'grammar-rule', field: 'sourceReferenceIds' }))
  })

  it('requires a source when a measurement has a numerical value', () => {
    const result = validateReferenceCollection({
      sources: [],
      artworks: [{
        id: 'art-1',
        title: 'Recorded artwork',
        documentationStatus: 'pending-review',
        measurements: [{ id: 'measurement-1', subject: 'relative measure', value: 12 }],
      }],
    })

    expect(result.issues).toContainEqual(expect.objectContaining({ code: 'measurement-without-source', recordId: 'measurement-1' }))
  })

  it('accepts a measurement linked to a recorded source', () => {
    const result = validateReferenceCollection({
      sources: [{ id: 'source-1', title: 'Recorded source', sourceType: 'other', documentationStatus: 'documented' }],
      artworks: [{
        id: 'art-1',
        title: 'Recorded artwork',
        source: 'source-1',
        documentationStatus: 'documented',
        measurements: [{ id: 'measurement-1', subject: 'relative measure', value: 12, unit: 'unit', sourceReferenceId: 'source-1' }],
      }],
    })

    expect(result).toEqual({ valid: true, issues: [] })
  })

  it('validates motif observations against the configured motif and primitive vocabulary', () => {
    const valid = validateReferenceCollection({
      sources: [],
      artworks: [{ id: 'art-test', title: 'Test fixture', documentationStatus: 'pending-review', motifs: [{ id: 'motif-test', kind: 'primitive-usage', motifId: 'human', primitiveId: 'circle' }] }],
    })
    expect(valid).toEqual({ valid: true, issues: [] })

    const invalid = validateReferenceCollection({
      sources: [],
      artworks: [{ id: 'art-test', title: 'Test fixture', documentationStatus: 'pending-review', motifs: [{ id: 'motif-test', kind: 'primitive-usage', motifId: 'dragon', primitiveId: 'square' }] }],
    })
    expect(invalid.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'invalid-motif', recordType: 'motif-observation' }),
      expect.objectContaining({ code: 'invalid-primitive', recordType: 'motif-observation' }),
    ]))
  })

  it('validates grammar observation kinds and keeps observation separate from a software rule', () => {
    const valid = validateReferenceCollection({
      sources: [],
      artworks: [{ id: 'art-test', title: 'Test fixture', documentationStatus: 'pending-review', observations: [{ id: 'obs-test', kind: 'composition', description: 'Test-only observation.' }] }],
    })
    expect(valid).toEqual({ valid: true, issues: [] })

    const invalid = validateReferenceCollection({
      sources: [],
      artworks: [{ id: 'art-test', title: 'Test fixture', documentationStatus: 'pending-review', observations: [{ id: 'obs-test', kind: 'invented-kind' as 'composition' }] }],
    })
    expect(invalid.issues).toContainEqual(expect.objectContaining({ code: 'invalid-observation-kind', recordType: 'grammar-observation' }))
  })

  it('accepts a grammar rule linked to a source record', () => {
    const result = validateReferenceCollection({
      sources: [{ id: 'source-test', title: 'Test fixture source', sourceType: 'academic', documentationStatus: 'pending-review' }],
      artworks: [],
    }, [{ id: 'rule-test', description: 'Test rule', source: 'project-configuration', check: 'allowed-motif', sourceReferenceIds: ['source-test'] }])
    expect(result).toEqual({ valid: true, issues: [] })
  })
})
