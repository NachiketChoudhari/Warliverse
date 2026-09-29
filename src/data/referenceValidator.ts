import type { GrammarRule } from '../grammar/types'
import type {
  ReferenceCollection,
  ReferenceValidationIssue,
  ReferenceValidationResult,
} from './references'

/** Checks data integrity and provenance links; it makes no authenticity judgments. */
export function validateReferenceCollection(
  collection: ReferenceCollection,
  grammarRules: readonly GrammarRule[] = [],
): ReferenceValidationResult {
  const issues: ReferenceValidationIssue[] = []
  const ids = new Set<string>()
  const sourceIds = new Set(collection.sources.map(({ id }) => id).filter(Boolean))

  const registerId = (id: string | undefined, recordType: ReferenceValidationIssue['recordType'], field = 'id') => {
    if (!id?.trim()) {
      issues.push({ code: 'missing-required-field', recordType, field, message: `${recordType} requires a non-empty ${field}.` })
      return
    }
    if (ids.has(id)) {
      issues.push({ code: 'duplicate-id', recordType, recordId: id, field, message: `ID “${id}” is used more than once in the collection.` })
    } else {
      ids.add(id)
    }
  }

  const requireField = (
    value: string | undefined,
    recordType: ReferenceValidationIssue['recordType'],
    recordId: string | undefined,
    field: string,
  ) => {
    if (!value?.trim()) {
      issues.push({ code: 'missing-required-field', recordType, recordId, field, message: `${recordType} “${recordId ?? '(without id)'}” requires a non-empty ${field}.` })
    }
  }

  const checkSourceReference = (
    sourceReferenceId: string | undefined,
    recordType: ReferenceValidationIssue['recordType'],
    recordId: string | undefined,
    field: string,
  ) => {
    if (sourceReferenceId && !sourceIds.has(sourceReferenceId)) {
      issues.push({ code: 'broken-source-reference', recordType, recordId, field, message: `${field} points to source “${sourceReferenceId}”, which is not in the collection.` })
    }
  }

  collection.sources.forEach((source) => {
    registerId(source.id, 'source')
    requireField(source.title, 'source', source.id, 'title')
    requireField(source.sourceType, 'source', source.id, 'sourceType')
    requireField(source.documentationStatus, 'source', source.id, 'documentationStatus')
  })

  collection.artworks.forEach((artwork) => {
    registerId(artwork.id, 'artwork')
    requireField(artwork.title, 'artwork', artwork.id, 'title')
    requireField(artwork.documentationStatus, 'artwork', artwork.id, 'documentationStatus')
    checkSourceReference(artwork.source, 'artwork', artwork.id, 'source')
    checkSourceReference(artwork.attribution?.sourceReferenceId, 'artwork', artwork.id, 'attribution.sourceReferenceId')

    artwork.motifs?.forEach((observation) => {
      registerId(observation.id, 'motif-observation')
      checkSourceReference(observation.sourceReferenceId, 'motif-observation', observation.id, 'sourceReferenceId')
    })
    artwork.observations?.forEach((observation) => {
      registerId(observation.id, 'grammar-observation')
      checkSourceReference(observation.sourceReferenceId, 'grammar-observation', observation.id, 'sourceReferenceId')
    })
    artwork.measurements?.forEach((measurement) => {
      registerId(measurement.id, 'measurement')
      checkSourceReference(measurement.sourceReferenceId, 'measurement', measurement.id, 'sourceReferenceId')
      if (measurement.value !== undefined && !measurement.sourceReferenceId) {
        issues.push({ code: 'measurement-without-source', recordType: 'measurement', recordId: measurement.id, field: 'sourceReferenceId', message: 'A numerical measurement must link to supporting source material.' })
      }
    })
  })

  grammarRules.forEach((rule) => {
    rule.sourceReferenceIds?.forEach((sourceReferenceId) => {
      checkSourceReference(sourceReferenceId, 'grammar-rule', rule.id, 'sourceReferenceIds')
    })
  })

  return { valid: issues.length === 0, issues }
}
