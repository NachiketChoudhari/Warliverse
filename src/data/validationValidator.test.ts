import { describe, expect, it } from 'vitest'
import { grammarRules } from './grammar'
import { validateValidationRecord, validateValidationRecords } from './validationValidator'
import { VALIDATION_STATUSES } from './validationTypes'
import type { ValidationRecord, ValidationStatus } from './validationTypes'

// Synthetic fixtures only. These are never placed in production research data.
const TEST_ONLY_MINIMAL: ValidationRecord = {
  id: 'validation-test-minimal',
  ruleId: 'motif.allowed',
  validator: null,
  questionPresented: 'TEST ONLY: synthetic question for validator coverage.',
  softwareInterpretation: { claim: 'TEST ONLY: configured motif vocabulary.' },
  attribution: { mode: 'pending' },
  consent: { status: 'pending', documentationMethod: 'none' },
  status: 'not-reviewed',
}

const TEST_ONLY_COMPLETE: ValidationRecord = {
  id: 'validation-test-complete',
  ruleId: 'human.part.primitive',
  validator: {
    id: 'validator-test-anon-01',
    identityMode: 'anonymized',
    role: 'TEST ONLY: synthetic domain expert role',
    expertise: 'TEST ONLY: synthetic expertise',
  },
  validationDate: '2026-01-15',
  questionPresented: 'TEST ONLY: Does the mapping describe this synthetic example?',
  softwareInterpretation: { claim: 'TEST ONLY: head → circle; body → triangle; limbs → line.' },
  documentaryEvidence: [
    { kind: 'source', sourceId: 'source-ccrt-living-traditions', relationship: 'contextualizes' },
    { kind: 'observation', observationId: 'ccrt-fig4-3-grammar-palaghata-structure-01', sourceId: 'source-ccrt-living-traditions', relationship: 'challenges' },
  ],
  expertResponse: {
    statement: 'TEST ONLY: synthetic disagreement retained alongside the documentary record.',
    position: 'disagrees',
    scope: 'TEST ONLY: synthetic scope statement.',
    suggestedCorrection: 'TEST ONLY: synthetic correction suggestion.',
    evidenceSupplied: [{ citation: 'TEST ONLY: synthetic citation', url: 'https://example.test/validation', relationship: 'challenges' }],
  },
  attribution: { mode: 'anonymous', preferredWording: 'TEST ONLY: anonymous reviewer' },
  consent: { status: 'granted', documentationMethod: 'written' },
  status: 'challenged',
  provenanceNotes: 'TEST ONLY: synthetic fixture; not a real statement or evidence.',
}

function recordForStatus(status: ValidationStatus): ValidationRecord {
  const preResponse = status === 'not-reviewed' || status === 'review-requested'
  const position = status === 'supported-after-review'
    ? 'partially-agrees'
    : status === 'challenged' || status === 'conflicting-evidence'
      ? 'disagrees'
      : 'unable-to-assess'
  return {
    ...TEST_ONLY_MINIMAL,
    id: `validation-test-${status}`,
    validator: status === 'not-reviewed' ? null : { id: 'validator-test-anon-status', identityMode: 'anonymized', role: 'TEST ONLY: synthetic role' },
    validationDate: preResponse ? undefined : '2026-02-01',
    expertResponse: preResponse ? undefined : {
      statement: 'TEST ONLY: synthetic status coverage response.',
      position,
      evidenceSupplied: [],
    },
    documentaryEvidence: status === 'conflicting-evidence'
      ? [{ kind: 'source', sourceId: 'source-ccrt-living-traditions', relationship: 'conflicts-with' }]
      : status === 'challenged'
        ? [{ kind: 'source', sourceId: 'source-ccrt-living-traditions', relationship: 'challenges' }]
        : undefined,
    attribution: preResponse ? { mode: 'pending' } : { mode: 'anonymous' },
    consent: preResponse ? { status: 'pending', documentationMethod: 'none' } : { status: 'granted', documentationMethod: 'notes' },
    followUpNotes: status === 'requires-follow-up' ? 'TEST ONLY: synthetic follow-up note.' : undefined,
    status,
  }
}

describe('validation capture schema', () => {
  it('accepts a valid minimal not-reviewed record without personal identity or a date', () => {
    expect(validateValidationRecord(TEST_ONLY_MINIMAL)).toMatchObject({ valid: true, errors: [] })
  })

  it('accepts a complete synthetic response with separate documentary and participant evidence', () => {
    expect(validateValidationRecord(TEST_ONLY_COMPLETE)).toMatchObject({ valid: true, errors: [] })
  })

  it('allows exactly the four currently configured rule IDs', () => {
    expect(grammarRules.map(({ id }) => id)).toEqual([
      'motif.allowed', 'human.parts.required', 'human.part.primitive', 'theme.allowed-motifs',
    ])
    for (const rule of grammarRules) {
      expect(validateValidationRecord({ ...TEST_ONLY_MINIMAL, id: `validation-test-${rule.id.replaceAll('.', '-')}`, ruleId: rule.id }).valid).toBe(true)
    }
  })

  it('accepts each supported lifecycle status with its required shape', () => {
    expect(VALIDATION_STATUSES).toHaveLength(7)
    for (const status of VALIDATION_STATUSES) {
      expect(validateValidationRecord(recordForStatus(status))).toMatchObject({ valid: true, errors: [] })
    }
  })

  it('reports missing required structural fields', () => {
    const result = validateValidationRecord({})
    expect(result.valid).toBe(false)
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'required-string', path: '$.id' }),
      expect.objectContaining({ code: 'invalid-rule-id', path: '$.ruleId' }),
      expect.objectContaining({ code: 'required-string', path: '$.questionPresented' }),
      expect.objectContaining({ code: 'invalid-software-interpretation', path: '$.softwareInterpretation' }),
      expect.objectContaining({ code: 'invalid-attribution', path: '$.attribution' }),
      expect.objectContaining({ code: 'invalid-consent', path: '$.consent' }),
      expect.objectContaining({ code: 'invalid-validation-status', path: '$.status' }),
    ]))
  })

  it('rejects invalid rule IDs and statuses', () => {
    const rule = validateValidationRecord({ ...TEST_ONLY_MINIMAL, ruleId: 'unconfigured.rule' })
    const status = validateValidationRecord({ ...TEST_ONLY_MINIMAL, status: 'approved' })
    expect(rule.errors).toContainEqual(expect.objectContaining({ code: 'invalid-rule-id' }))
    expect(status.errors).toContainEqual(expect.objectContaining({ code: 'invalid-validation-status' }))
  })

  it('rejects malformed validation and participant IDs', () => {
    const malformedRecord = validateValidationRecord({ ...TEST_ONLY_MINIMAL, id: 'Validation One' })
    const malformedValidator = validateValidationRecord({
      ...TEST_ONLY_COMPLETE,
      validator: { ...TEST_ONLY_COMPLETE.validator!, id: 'bad id' },
    })
    expect(malformedRecord.errors).toContainEqual(expect.objectContaining({ code: 'invalid-validation-id' }))
    expect(malformedValidator.errors).toContainEqual(expect.objectContaining({ code: 'invalid-participant-id' }))
  })

  it('rejects malformed and impossible calendar dates', () => {
    for (const validationDate of ['2026/01/15', '2026-02-30', '2026-1-5']) {
      expect(validateValidationRecord({ ...TEST_ONLY_COMPLETE, validationDate }).errors)
        .toContainEqual(expect.objectContaining({ code: 'invalid-date' }))
    }
  })

  it('rejects malformed responses and invalid response positions', () => {
    const malformed = validateValidationRecord({ ...TEST_ONLY_COMPLETE, expertResponse: 'text only' })
    const invalidPosition = validateValidationRecord({
      ...TEST_ONLY_COMPLETE,
      expertResponse: { ...TEST_ONLY_COMPLETE.expertResponse, position: 'endorsed' },
    })
    expect(malformed.errors).toContainEqual(expect.objectContaining({ code: 'invalid-response' }))
    expect(invalidPosition.errors).toContainEqual(expect.objectContaining({ code: 'invalid-response-position' }))
  })

  it('rejects invalid attribution and consent structures', () => {
    const attribution = validateValidationRecord({ ...TEST_ONLY_COMPLETE, attribution: { mode: 'named' } })
    const consent = validateValidationRecord({ ...TEST_ONLY_COMPLETE, consent: { status: 'granted', documentationMethod: 'none' } })
    expect(attribution.errors).toContainEqual(expect.objectContaining({ code: 'required-string', path: '$.attribution.displayName' }))
    expect(consent.errors).toContainEqual(expect.objectContaining({ code: 'missing-documentation-method' }))
  })

  it('rejects unresolved documentary source and observation references', () => {
    const result = validateValidationRecord({
      ...TEST_ONLY_MINIMAL,
      documentaryEvidence: [
        { kind: 'source', sourceId: 'source-not-in-corpus', relationship: 'supports' },
        { kind: 'observation', observationId: 'observation-not-in-corpus', relationship: 'challenges' },
      ],
    })
    expect(result.errors).toContainEqual(expect.objectContaining({ code: 'unresolved-source-reference' }))
    expect(result.errors).toContainEqual(expect.objectContaining({ code: 'unresolved-observation-reference' }))
  })

  it('rejects mismatched observation provenance and malformed participant-supplied citations', () => {
    const result = validateValidationRecord({
      ...TEST_ONLY_COMPLETE,
      documentaryEvidence: [{ kind: 'observation', observationId: 'ccrt-fig4-3-grammar-palaghata-structure-01', sourceId: 'source-rao-warli-aesthetics-2022', relationship: 'supports' }],
      expertResponse: { ...TEST_ONLY_COMPLETE.expertResponse, evidenceSupplied: [{ citation: '  ', url: 'javascript:alert(1)', relationship: 'supports' }] },
    })
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'evidence-source-mismatch' }),
      expect.objectContaining({ code: 'required-string', path: '$.expertResponse.evidenceSupplied[0].citation' }),
      expect.objectContaining({ code: 'invalid-evidence-url' }),
    ]))
  })

  it('rejects unsupported fields at every modeled level', () => {
    const result = validateValidationRecord({
      ...TEST_ONLY_MINIMAL,
      madeUp: true,
      softwareInterpretation: { claim: 'TEST ONLY: configured vocabulary.', authenticityScore: 1 },
    })
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'unsupported-field', path: '$.madeUp' }),
      expect.objectContaining({ code: 'unsupported-field', path: '$.softwareInterpretation.authenticityScore' }),
    ]))
  })

  it('preserves disagreement, challenge, and conflicting-evidence records without replacing documentary evidence', () => {
    for (const status of ['challenged', 'conflicting-evidence'] as const) {
      const record = recordForStatus(status)
      const result = validateValidationRecord(record)
      expect(result.valid).toBe(true)
      expect(record.expertResponse?.position).toBe('disagrees')
      expect(record.documentaryEvidence?.[0]).toMatchObject({
        kind: 'source',
        relationship: status === 'conflicting-evidence' ? 'conflicts-with' : 'challenges',
      })
      expect(record.documentaryEvidence?.[0]).not.toEqual(record.expertResponse)
    }
  })

  it('requires response, date, follow-up, and conflict links according to status', () => {
    const followUp = validateValidationRecord({ ...recordForStatus('requires-follow-up'), followUpNotes: '  ' })
    const supported = validateValidationRecord({ ...recordForStatus('supported-after-review'), expertResponse: { ...recordForStatus('supported-after-review').expertResponse!, position: 'disagrees' } })
    const conflict = validateValidationRecord({ ...recordForStatus('conflicting-evidence'), documentaryEvidence: [] })
    expect(followUp.errors).toContainEqual(expect.objectContaining({ code: 'required-string', path: '$.followUpNotes' }))
    expect(supported.errors).toContainEqual(expect.objectContaining({ code: 'status-response-conflict' }))
    expect(conflict.errors).toContainEqual(expect.objectContaining({ code: 'missing-conflicting-evidence' }))
  })

  it('rejects responses without permission to document them', () => {
    const result = validateValidationRecord({
      ...TEST_ONLY_COMPLETE,
      consent: { status: 'declined', documentationMethod: 'none' },
    })
    expect(result.errors).toContainEqual(expect.objectContaining({ code: 'response-without-consent' }))
  })

  it('validates record arrays and duplicate stable IDs without storing records', () => {
    expect(validateValidationRecords([])).toEqual({ valid: true, errors: [], warnings: [] })
    const result = validateValidationRecords([TEST_ONLY_MINIMAL, TEST_ONLY_MINIMAL])
    expect(result.errors).toContainEqual(expect.objectContaining({ code: 'duplicate-validation-id' }))
  })
})
