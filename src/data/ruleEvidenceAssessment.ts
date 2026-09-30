import { grammarRules } from './grammar'
import type { GrammarRule } from '../grammar/types'
import type { ReferenceCollection } from './references'

export const EVIDENCE_RELATIONSHIPS = ['supports', 'limits', 'challenges', 'contextualizes', 'unresolved'] as const
export type EvidenceRelationship = (typeof EVIDENCE_RELATIONSHIPS)[number]

export const ASSESSMENT_STATES = ['assessed', 'unresolved'] as const
export type AssessmentState = (typeof ASSESSMENT_STATES)[number]

export const SOURCE_RELATIONSHIPS = [
  'same-publication',
  'independent-publications',
  'related-publications',
  'independence-unassessed',
] as const
export type SourceRelationship = (typeof SOURCE_RELATIONSHIPS)[number]

export type EvidenceReference =
  | { kind: 'source'; id: string }
  | { kind: 'motif-observation'; id: string }
  | { kind: 'grammar-observation'; id: string }
  | { kind: 'measurement'; id: string }

/** Documentary assessment only. Expert statements use the Phase 15 validation schema. */
export interface RuleEvidenceLink {
  reference: EvidenceReference
  relationship: EvidenceRelationship
  scope: string
  rationale: string
}

/** Explicit publication relationship; never inferred from publisher or author strings. */
export interface EvidenceSourceComparison {
  sourceIds: [string, string]
  relationship: SourceRelationship
  basis: string
}

/**
 * An inspectable interpretation of documentary records relative to a software
 * claim. This is not an expert validation, a production rule, or a promotion.
 */
export interface RuleEvidenceAssessment {
  id: string
  ruleId: string
  state: AssessmentState
  interpretation: string
  evidence: RuleEvidenceLink[]
  sourceComparisons?: EvidenceSourceComparison[]
  notes?: string
}

export interface EvidenceAssessmentIssue {
  code: string
  path: string
  message: string
  severity: 'error' | 'warning'
}

export interface EvidenceAssessmentResult {
  valid: boolean
  errors: EvidenceAssessmentIssue[]
  warnings: EvidenceAssessmentIssue[]
}

const assessmentIdPattern = /^evidence-assessment-[a-z0-9]+(?:-[a-z0-9]+)*$/
const allowedEvidenceFields = new Set(['kind', 'id'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function add(issues: EvidenceAssessmentIssue[], code: string, path: string, message: string, severity: EvidenceAssessmentIssue['severity'] = 'error') {
  issues.push({ code, path, message, severity })
}

function requiredText(value: unknown, path: string, errors: EvidenceAssessmentIssue[]) {
  if (typeof value !== 'string' || value.trim() === '') add(errors, 'required-text', path, 'A non-empty string is required.')
}

type ObservationLocation = {
  sourceId?: string
  artworkId: string
}

function collectObservationLocations(collection: ReferenceCollection) {
  const locations = new Map<string, ObservationLocation>()
  for (const artwork of collection.artworks) {
    for (const record of artwork.motifs ?? []) locations.set(`motif-observation:${record.id}`, { sourceId: record.sourceReferenceId ?? artwork.source, artworkId: artwork.id })
    for (const record of artwork.observations ?? []) locations.set(`grammar-observation:${record.id}`, { sourceId: record.sourceReferenceId ?? artwork.source, artworkId: artwork.id })
    for (const record of artwork.measurements ?? []) locations.set(`measurement:${record.id}`, { sourceId: record.sourceReferenceId ?? artwork.source, artworkId: artwork.id })
  }
  return locations
}

function referenceKey(reference: EvidenceReference) {
  return `${reference.kind}:${reference.id}`
}

function referenceSourceId(reference: EvidenceReference, collection: ReferenceCollection, locations: Map<string, ObservationLocation>): string | undefined {
  if (reference.kind === 'source') return collection.sources.find(({ id }) => id === reference.id)?.id
  return locations.get(referenceKey(reference))?.sourceId
}

/** Returns resolved source IDs once each; multiple observations from one source are not multiple sources. */
export function getEvidenceSourceTrace(assessment: RuleEvidenceAssessment, collection: ReferenceCollection) {
  const locations = collectObservationLocations(collection)
  const sourceIds = [...new Set(assessment.evidence
    .map(({ reference }) => referenceSourceId(reference, collection, locations))
    .filter((id): id is string => Boolean(id)))].sort()
  return {
    sourceIds,
    comparisons: [...(assessment.sourceComparisons ?? [])]
      .map((comparison) => ({ ...comparison, sourceIds: [...comparison.sourceIds].sort() as [string, string] }))
      .sort((a, b) => `${a.sourceIds[0]}:${a.sourceIds[1]}`.localeCompare(`${b.sourceIds[0]}:${b.sourceIds[1]}`)),
  }
}

/** Validate documentary assessments without mutating or normalizing corpus records. */
export function validateRuleEvidenceAssessments(
  input: unknown,
  collection: ReferenceCollection,
  rules: readonly GrammarRule[] = grammarRules,
): EvidenceAssessmentResult {
  const errors: EvidenceAssessmentIssue[] = []
  const warnings: EvidenceAssessmentIssue[] = []
  if (!Array.isArray(input)) {
    add(errors, 'invalid-assessment-array', '$', 'Evidence assessments must be supplied as an array.')
    return { valid: false, errors, warnings }
  }

  const ruleIds = new Set(rules.map(({ id }) => id))
  const sourceIds = new Set(collection.sources.map(({ id }) => id))
  const observationLocations = collectObservationLocations(collection)
  const assessmentIds = new Set<string>()

  input.forEach((candidate, index) => {
    const path = `$[${index}]`
    if (!isRecord(candidate)) {
      add(errors, 'invalid-assessment', path, 'Expected an evidence assessment object.')
      return
    }
    const allowedFields = new Set(['id', 'ruleId', 'state', 'interpretation', 'evidence', 'sourceComparisons', 'notes'])
    for (const field of Object.keys(candidate)) {
      if (!allowedFields.has(field)) add(errors, 'unsupported-field', `${path}.${field}`, `Field “${field}” is not supported by the documentary assessment schema.`)
    }

    requiredText(candidate.id, `${path}.id`, errors)
    if (typeof candidate.id === 'string') {
      if (!assessmentIdPattern.test(candidate.id)) add(errors, 'invalid-assessment-id', `${path}.id`, 'ID must use evidence-assessment- followed by lowercase letters, digits, and hyphens.')
      if (assessmentIds.has(candidate.id)) add(errors, 'duplicate-assessment-id', `${path}.id`, `Assessment ID “${candidate.id}” is used more than once.`)
      assessmentIds.add(candidate.id)
    }
    requiredText(candidate.ruleId, `${path}.ruleId`, errors)
    if (typeof candidate.ruleId === 'string' && candidate.ruleId && !ruleIds.has(candidate.ruleId)) add(errors, 'unsupported-rule', `${path}.ruleId`, `Rule ID “${candidate.ruleId}” is not configured.`)
    requiredText(candidate.interpretation, `${path}.interpretation`, errors)
    if (!ASSESSMENT_STATES.includes(candidate.state as AssessmentState)) add(errors, 'invalid-assessment-state', `${path}.state`, 'State must be assessed or unresolved.')
    if (candidate.notes !== undefined && (typeof candidate.notes !== 'string' || !candidate.notes.trim())) add(errors, 'invalid-notes', `${path}.notes`, 'Notes must be non-empty text when supplied.')

    if (!Array.isArray(candidate.evidence)) {
      add(errors, 'invalid-evidence-array', `${path}.evidence`, 'Evidence must be supplied as an array.')
    } else {
      if (candidate.state === 'assessed' && candidate.evidence.length === 0) add(errors, 'assessed-needs-evidence', `${path}.evidence`, 'An assessed interpretation requires at least one source or observation reference.')
      const linksByReference = new Map<string, Set<string>>()
      candidate.evidence.forEach((item, evidenceIndex) => {
        const evidencePath = `${path}.evidence[${evidenceIndex}]`
        if (!isRecord(item)) {
          add(errors, 'invalid-evidence-link', evidencePath, 'Expected an evidence relationship object.')
          return
        }
        for (const field of Object.keys(item)) {
          if (!['reference', 'relationship', 'scope', 'rationale'].includes(field)) add(errors, 'unsupported-field', `${evidencePath}.${field}`, `Field “${field}” is not supported on an evidence relationship.`)
        }
        requiredText(item.scope, `${evidencePath}.scope`, errors)
        requiredText(item.rationale, `${evidencePath}.rationale`, errors)
        if (!EVIDENCE_RELATIONSHIPS.includes(item.relationship as EvidenceRelationship)) add(errors, 'invalid-evidence-relationship', `${evidencePath}.relationship`, 'Relationship is not part of the supported evidence vocabulary.')
        if (item.relationship === 'unresolved' && candidate.state !== 'unresolved') add(errors, 'unresolved-state-required', `${evidencePath}.relationship`, 'An unresolved evidence link requires the assessment state to remain unresolved.')
        if (!isRecord(item.reference)) {
          add(errors, 'invalid-evidence-reference', `${evidencePath}.reference`, 'Expected a source or observation reference.')
          return
        }
        for (const field of Object.keys(item.reference)) {
          if (!allowedEvidenceFields.has(field)) add(errors, 'unsupported-field', `${evidencePath}.reference.${field}`, `Field “${field}” is not supported on an evidence reference.`)
        }
        requiredText(item.reference.kind, `${evidencePath}.reference.kind`, errors)
        requiredText(item.reference.id, `${evidencePath}.reference.id`, errors)
        const kind = item.reference.kind
        const id = item.reference.id
        const allowedKinds = ['source', 'motif-observation', 'grammar-observation', 'measurement']
        if (typeof kind !== 'string' || !allowedKinds.includes(kind)) {
          add(errors, 'invalid-evidence-reference-kind', `${evidencePath}.reference.kind`, 'Reference kind must identify a source, motif observation, grammar observation, or measurement.')
          return
        }
        if (typeof id !== 'string' || !id.trim()) return
        let sourceId: string | undefined
        if (kind === 'source') {
          if (!sourceIds.has(id)) add(errors, 'unresolved-source', `${evidencePath}.reference.id`, `Source ID “${id}” does not resolve in the research collection.`)
          else sourceId = id
        } else {
          const location = observationLocations.get(`${kind}:${id}`)
          if (!location) add(errors, 'unresolved-observation', `${evidencePath}.reference.id`, `${kind} ID “${id}” does not resolve in the research collection.`)
          else if (!location.sourceId) add(errors, 'missing-observation-provenance', `${evidencePath}.reference.id`, 'The referenced observation has no sourceReferenceId or artwork source link.')
          else if (!sourceIds.has(location.sourceId)) add(errors, 'unresolved-observation-source', `${evidencePath}.reference.id`, `Observation source ID “${location.sourceId}” does not resolve in the research collection.`)
          else sourceId = location.sourceId
        }
        if (sourceId && typeof item.relationship === 'string') {
          const key = `${kind}:${id}`
          const relationships = linksByReference.get(key) ?? new Set<string>()
          relationships.add(item.relationship)
          linksByReference.set(key, relationships)
        }
      })

      for (const [reference, relationships] of linksByReference) {
        if (relationships.has('supports') && relationships.has('challenges')) {
          if (candidate.state !== 'unresolved') add(errors, 'contradiction-must-remain-unresolved', `${path}.evidence`, `The same reference is marked as both supporting and challenging (${reference}); retain the assessment as unresolved.`)
          else add(warnings, 'contradictory-interpretation-preserved', `${path}.evidence`, `The same reference has both supporting and challenging interpretations (${reference}); both are retained for review.`, 'warning')
        }
      }
      if (candidate.state === 'unresolved') add(warnings, 'assessment-unresolved', `${path}.state`, 'This assessment preserves uncertainty and does not establish support for a software rule.', 'warning')
    }

    const resolvedSources = new Set<string>()
    if (Array.isArray(candidate.evidence)) candidate.evidence.forEach((item) => {
      if (!isRecord(item) || !isRecord(item.reference) || typeof item.reference.kind !== 'string' || typeof item.reference.id !== 'string') return
      if (item.reference.kind === 'source' && sourceIds.has(item.reference.id)) resolvedSources.add(item.reference.id)
      else {
        const location = observationLocations.get(`${item.reference.kind}:${item.reference.id}`)
        if (location?.sourceId && sourceIds.has(location.sourceId)) resolvedSources.add(location.sourceId)
      }
    })
    if (candidate.sourceComparisons !== undefined) {
      if (!Array.isArray(candidate.sourceComparisons)) add(errors, 'invalid-source-comparison-array', `${path}.sourceComparisons`, 'Source comparisons must be an array when supplied.')
      else {
        const comparedPairs = new Set<string>()
        candidate.sourceComparisons.forEach((comparison, comparisonIndex) => {
          const comparisonPath = `${path}.sourceComparisons[${comparisonIndex}]`
          if (!isRecord(comparison)) {
            add(errors, 'invalid-source-comparison', comparisonPath, 'Expected a source comparison object.')
            return
          }
          for (const field of Object.keys(comparison)) {
            if (!['sourceIds', 'relationship', 'basis'].includes(field)) add(errors, 'unsupported-field', `${comparisonPath}.${field}`, `Field “${field}” is not supported on a source comparison.`)
          }
          requiredText(comparison.basis, `${comparisonPath}.basis`, errors)
          if (!SOURCE_RELATIONSHIPS.includes(comparison.relationship as SourceRelationship)) add(errors, 'invalid-source-relationship', `${comparisonPath}.relationship`, 'Source relationship is not part of the supported vocabulary.')
          if (!Array.isArray(comparison.sourceIds) || comparison.sourceIds.length !== 2 || comparison.sourceIds.some((id) => typeof id !== 'string' || !id.trim())) {
            add(errors, 'invalid-source-pair', `${comparisonPath}.sourceIds`, 'A source comparison requires exactly two non-empty source IDs.')
            return
          }
          const [first, second] = comparison.sourceIds as string[]
          if (first === second) add(errors, 'repeated-source-pair', `${comparisonPath}.sourceIds`, 'A source comparison must name two distinct source records.')
          for (const [pairIndex, id] of [first, second].entries()) {
            if (!sourceIds.has(id)) add(errors, 'unresolved-comparison-source', `${comparisonPath}.sourceIds[${pairIndex}]`, `Source ID “${id}” does not resolve in the research collection.`)
            if (!resolvedSources.has(id)) add(errors, 'unlinked-comparison-source', `${comparisonPath}.sourceIds[${pairIndex}]`, `Source ID “${id}” is not linked by this assessment's evidence records.`)
          }
          const pairKey = [first, second].sort().join(':')
          if (comparedPairs.has(pairKey)) add(errors, 'duplicate-source-comparison', comparisonPath, 'The same source pair is compared more than once in one assessment.')
          comparedPairs.add(pairKey)
        })
      }
    } else if (resolvedSources.size > 1) {
      add(warnings, 'source-independence-unassessed', `${path}.sourceComparisons`, 'Multiple source records are referenced, but their publication relationship is not assessed. Do not count them as independent corroboration.', 'warning')
    }
  })

  return { valid: errors.length === 0, errors, warnings }
}
