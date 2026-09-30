import { describe, expect, it } from 'vitest'
import { grammarRules } from './grammar'
import { referenceCollection } from './referenceCollection'
import type { ReferenceCollection } from './references'
import {
  getEvidenceSourceTrace,
  validateRuleEvidenceAssessments,
  type RuleEvidenceAssessment,
} from './ruleEvidenceAssessment'
import { ruleEvidenceAssessments } from './research/ruleEvidenceAssessments'
import { researchCorpusV1 } from './research/researchCorpus'

// Synthetic fixtures are isolated to these validator tests and are not project research data.
function syntheticCollection(): ReferenceCollection {
  return {
    sources: [
      { id: 'test-source-one', title: 'Synthetic source one', sourceType: 'academic', documentationStatus: 'documented' },
      { id: 'test-source-two', title: 'Synthetic source two', sourceType: 'academic', documentationStatus: 'documented' },
    ],
    artworks: [
      {
        id: 'test-artwork-one', title: 'Synthetic artwork one', source: 'test-source-one', documentationStatus: 'documented',
        motifs: [{ id: 'test-motif-one', kind: 'motif-relationships', motifId: 'human', sourceReferenceId: 'test-source-one', description: 'Synthetic source-described motif.' }],
      },
      {
        id: 'test-artwork-two', title: 'Synthetic artwork two', source: 'test-source-two', documentationStatus: 'documented',
        observations: [{ id: 'test-grammar-observation', kind: 'figure-structure', sourceReferenceId: 'test-source-two', description: 'Synthetic source-described construction.' }],
      },
    ],
  }
}

function assessment(overrides: Partial<RuleEvidenceAssessment> = {}): RuleEvidenceAssessment {
  return {
    id: 'evidence-assessment-test-one',
    ruleId: 'motif.allowed',
    state: 'assessed',
    interpretation: 'A source-reported example is relevant to this claim in the stated scope.',
    evidence: [{
      reference: { kind: 'motif-observation', id: 'test-motif-one' },
      relationship: 'supports',
      scope: 'One source-described artwork only.',
      rationale: 'The linked source describes a human motif in this artwork.',
    }],
    ...overrides,
  }
}

describe('documentary rule evidence assessment', () => {
  it('accepts a valid scoped observation relationship', () => {
    expect(validateRuleEvidenceAssessments([assessment()], syntheticCollection())).toMatchObject({ valid: true, errors: [] })
  })

  it('accepts each supported evidence relationship without turning it into an expert response', () => {
    const relationships = ['supports', 'limits', 'challenges', 'contextualizes'] as const
    for (const relationship of relationships) {
      const result = validateRuleEvidenceAssessments([assessment({ evidence: [{
        ...assessment().evidence[0], relationship,
      }] })], syntheticCollection())
      expect(result.valid, relationship).toBe(true)
    }
    const unresolved = validateRuleEvidenceAssessments([assessment({
      state: 'unresolved', evidence: [{ ...assessment().evidence[0], relationship: 'unresolved' }],
    })], syntheticCollection())
    expect(unresolved.valid).toBe(true)
  })

  it('accepts all four configured rule IDs', () => {
    for (const rule of grammarRules) {
      const result = validateRuleEvidenceAssessments([assessment({ ruleId: rule.id })], syntheticCollection())
      expect(result.valid, rule.id).toBe(true)
    }
  })

  it('rejects unsupported rule IDs and invalid source or observation references', () => {
    expect(validateRuleEvidenceAssessments([assessment({ ruleId: 'unlisted.rule' })], syntheticCollection()).errors).toContainEqual(expect.objectContaining({ code: 'unsupported-rule' }))
    const missingSource = assessment({ evidence: [{ ...assessment().evidence[0], reference: { kind: 'source', id: 'missing-source' } }] })
    expect(validateRuleEvidenceAssessments([missingSource], syntheticCollection()).errors).toContainEqual(expect.objectContaining({ code: 'unresolved-source' }))
    const missingObservation = assessment({ evidence: [{ ...assessment().evidence[0], reference: { kind: 'grammar-observation', id: 'missing-observation' } }] })
    expect(validateRuleEvidenceAssessments([missingObservation], syntheticCollection()).errors).toContainEqual(expect.objectContaining({ code: 'unresolved-observation' }))
  })

  it('rejects missing scope, rationale, malformed assessment IDs, and unsupported fields', () => {
    const invalid = { ...assessment(), id: 'invalid ID', invented: true, evidence: [{ ...assessment().evidence[0], scope: ' ', rationale: '' }] }
    const result = validateRuleEvidenceAssessments([invalid], syntheticCollection())
    expect(result.errors.map(({ code }) => code)).toEqual(expect.arrayContaining(['invalid-assessment-id', 'unsupported-field', 'required-text']))
  })

  it('requires source provenance for artwork observations', () => {
    const noProvenance = syntheticCollection()
    delete noProvenance.artworks[0].source
    noProvenance.artworks[0].motifs![0].sourceReferenceId = undefined
    const result = validateRuleEvidenceAssessments([assessment()], noProvenance)
    expect(result.errors).toContainEqual(expect.objectContaining({ code: 'missing-observation-provenance' }))
  })

  it('preserves contradictory links only in an unresolved assessment', () => {
    const base = assessment()
    const conflict = { ...base.evidence[0], relationship: 'challenges' as const, rationale: 'A conflicting synthetic reading is retained.' }
    const assessedResult = validateRuleEvidenceAssessments([assessment({ evidence: [...base.evidence, conflict] })], syntheticCollection())
    expect(assessedResult.errors).toContainEqual(expect.objectContaining({ code: 'contradiction-must-remain-unresolved' }))
    const unresolved = validateRuleEvidenceAssessments([assessment({ state: 'unresolved', evidence: [...base.evidence, conflict] })], syntheticCollection())
    expect(unresolved.valid).toBe(true)
    expect(unresolved.warnings).toContainEqual(expect.objectContaining({ code: 'contradictory-interpretation-preserved' }))
  })

  it('allows a rule assessment to remain unresolved without converting it into support', () => {
    const result = validateRuleEvidenceAssessments([assessment({ state: 'unresolved', evidence: [] })], syntheticCollection())
    expect(result.valid).toBe(true)
    expect(result.warnings).toContainEqual(expect.objectContaining({ code: 'assessment-unresolved' }))
  })

  it('deduplicates repeated observations from one source and does not infer independence', () => {
    const sameSource = syntheticCollection()
    sameSource.artworks[0].motifs!.push({ id: 'test-motif-two', kind: 'motif-relationships', motifId: 'animal', sourceReferenceId: 'test-source-one', description: 'Another synthetic record from the same source.' })
    const twoObservations = assessment({ evidence: [
      assessment().evidence[0],
      { reference: { kind: 'motif-observation', id: 'test-motif-two' }, relationship: 'contextualizes', scope: 'A second record in the same publication.', rationale: 'Synthetic context only.' },
    ] })
    expect(getEvidenceSourceTrace(twoObservations, sameSource).sourceIds).toEqual(['test-source-one'])
    expect(validateRuleEvidenceAssessments([twoObservations], sameSource).warnings.some(({ code }) => code === 'source-independence-unassessed')).toBe(false)
  })

  it('requires an explicit basis for publication relationships across source records', () => {
    const compared = assessment({
      evidence: [assessment().evidence[0], {
        reference: { kind: 'grammar-observation', id: 'test-grammar-observation' },
        relationship: 'challenges', scope: 'A separate synthetic artwork.', rationale: 'A counterexample fixture.',
      }],
      sourceComparisons: [{ sourceIds: ['test-source-one', 'test-source-two'], relationship: 'independence-unassessed', basis: 'Synthetic test fixture; publication relationship not assessed.' }],
    })
    const result = validateRuleEvidenceAssessments([compared], syntheticCollection())
    expect(result.valid).toBe(true)
    expect(getEvidenceSourceTrace(compared, syntheticCollection()).comparisons[0].relationship).toBe('independence-unassessed')
    expect(validateRuleEvidenceAssessments([assessment({
      ...compared,
      sourceComparisons: [{ sourceIds: ['test-source-one', 'missing-source'], relationship: 'same-publication', basis: 'Synthetic invalid reference.' }],
    })], syntheticCollection()).errors).toContainEqual(expect.objectContaining({ code: 'unresolved-comparison-source' }))
  })

  it('retains a declared same-publication relationship instead of treating two source IDs as independent', () => {
    const samePublication = assessment({
      evidence: [assessment().evidence[0], {
        reference: { kind: 'grammar-observation', id: 'test-grammar-observation' },
        relationship: 'contextualizes', scope: 'Synthetic paired publication excerpt.', rationale: 'Used only to test source relationship capture.',
      }],
      sourceComparisons: [{ sourceIds: ['test-source-one', 'test-source-two'], relationship: 'same-publication', basis: 'Synthetic test-only publication grouping.' }],
    })
    const result = validateRuleEvidenceAssessments([samePublication], syntheticCollection())
    expect(result.valid).toBe(true)
    expect(getEvidenceSourceTrace(samePublication, syntheticCollection()).comparisons).toEqual([{
      sourceIds: ['test-source-one', 'test-source-two'], relationship: 'same-publication', basis: 'Synthetic test-only publication grouping.',
    }])
  })

  it('reports cross-source independence as unassessed when comparisons are omitted', () => {
    const record = assessment({ evidence: [assessment().evidence[0], {
      reference: { kind: 'grammar-observation', id: 'test-grammar-observation' },
      relationship: 'contextualizes', scope: 'Another synthetic artwork.', rationale: 'No independence claim is made.',
    }] })
    expect(validateRuleEvidenceAssessments([record], syntheticCollection()).warnings).toContainEqual(expect.objectContaining({ code: 'source-independence-unassessed' }))
  })

  it('does not mutate the published research records and starts with no assessments', () => {
    const before = structuredClone(researchCorpusV1)
    const referenceBefore = structuredClone(referenceCollection)
    expect(ruleEvidenceAssessments).toEqual([])
    validateRuleEvidenceAssessments(ruleEvidenceAssessments, referenceCollection)
    expect(researchCorpusV1).toEqual(before)
    expect(referenceCollection).toEqual(referenceBefore)
  })

  it('returns deterministic validation output', () => {
    const input = [assessment({ state: 'unresolved', evidence: [] })]
    const first = validateRuleEvidenceAssessments(input, syntheticCollection())
    const second = validateRuleEvidenceAssessments(input, syntheticCollection())
    expect(second).toEqual(first)
  })
})
