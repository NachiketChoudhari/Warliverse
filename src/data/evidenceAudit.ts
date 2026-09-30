import { grammarRules } from './grammar'
import { getGrammarEvidenceCounts } from './grammarEvidence'
import { referenceCollection } from './referenceCollection'
import { createReferenceExport } from './referenceExport'
import { validationReviewGuides } from './validationReviewGuide'
import { ruleEvidenceAssessments } from './research/ruleEvidenceAssessments'
import type { GrammarObservation, MotifObservation, ReferenceSource } from './references'

type AuditObservation = {
  artworkId: string
  artworkTitle: string
  sourceId: string | undefined
  record: MotifObservation | GrammarObservation
  kind: 'motif' | 'grammar'
}

const sourceById = new Map(referenceCollection.sources.map((source) => [source.id, source]))
const allObservations: AuditObservation[] = referenceCollection.artworks.flatMap((artwork) => [
  ...(artwork.motifs ?? []).map((record) => ({ artworkId: artwork.id, artworkTitle: artwork.title, sourceId: record.sourceReferenceId ?? artwork.source, record, kind: 'motif' as const })),
  ...(artwork.observations ?? []).map((record) => ({ artworkId: artwork.id, artworkTitle: artwork.title, sourceId: record.sourceReferenceId ?? artwork.source, record, kind: 'grammar' as const })),
])

const exportedResearch = createReferenceExport(referenceCollection, grammarRules)
const exportedEvidenceByRule = new Map(exportedResearch.grammarEvidence.map((record) => [record.ruleId, record]))

export interface EvidenceAuditRule {
  id: string
  claim: string
  promotionDecision: 'NOT PROMOTED'
  formalSourceIds: string[]
  formalObservationIds: string[]
  reviewContext: AuditReviewContext[]
  reviewContextSourceCount: number
  limits: string[]
}

export interface AuditReviewContext {
  id: string
  kind: 'source' | 'motif' | 'grammar'
  artworkId: string
  artworkTitle: string
  sourceId: string
  sourceTitle: string
  sourceType: ReferenceSource['sourceType']
  documentationStatus: ReferenceSource['documentationStatus']
  description: string
  recordStatus: string
}

export interface AuditSourceCoverage {
  id: string
  title: string
  sourceType: ReferenceSource['sourceType']
  documentationStatus: ReferenceSource['documentationStatus']
  artworkIds: string[]
  motifObservationIds: string[]
  grammarObservationIds: string[]
  measurementIds: string[]
}

const ruleLimits: Record<string, string[]> = {
  'motif.allowed': [
    'Selected positive examples do not establish a complete or exclusive motif vocabulary.',
    'The review dossier records no hut motif observation; described fields, water, and mountains are outside the current motif IDs.',
  ],
  'human.parts.required': [
    'One source describes selected parts of one Palaghat figure; it does not establish all six parts as required.',
    'Other recorded people are not documented part by part, and no systematic omission review is recorded.',
  ],
  'human.part.primitive': [
    'Broad geometric vocabulary and a partial description of one figure do not establish the configured six-part mapping.',
    'The corpus does not establish the mapping’s scope across figures or contexts.',
  ],
  'theme.allowed-motifs': [
    'Artwork descriptions provide selected positive examples, not exhaustive theme allow-lists or exclusions.',
    'Prototype generator theme settings are software configuration, not documentary evidence.',
  ],
}

const guideByRule = new Map(validationReviewGuides.map((guide) => [guide.ruleId, guide]))

function getRecordStatus(record: AuditObservation['record']): string {
  return record.documentationStatus ?? 'not recorded'
}

function buildRuleAudit(rule: (typeof grammarRules)[number]): EvidenceAuditRule {
  const formal = exportedEvidenceByRule.get(rule.id)
  const guide = guideByRule.get(rule.id)
  const context: AuditReviewContext[] = []
  ;(guide?.evidence ?? []).forEach((reference) => {
    if (reference.kind === 'source') {
      const source = sourceById.get(reference.sourceId)
      if (!source) return
      context.push({
        id: reference.id,
        kind: 'source' as const,
        artworkId: '',
        artworkTitle: 'Source context (not artwork-specific)',
        sourceId: source.id,
        sourceTitle: source.title,
        sourceType: source.sourceType,
        documentationStatus: source.documentationStatus,
        description: reference.summary,
        recordStatus: source.documentationStatus,
      })
      return
    }
    const observation = allObservations.find(({ record }) => record.id === reference.id)
    const source = observation?.sourceId ? sourceById.get(observation.sourceId) : undefined
    if (!observation || !source) return
    context.push({
      id: observation.record.id,
      kind: observation.kind,
      artworkId: observation.artworkId,
      artworkTitle: observation.artworkTitle,
      sourceId: source.id,
      sourceTitle: source.title,
      sourceType: source.sourceType,
      documentationStatus: source.documentationStatus,
      description: observation.record.description ?? observation.record.notes ?? 'No description recorded.',
      recordStatus: getRecordStatus(observation.record),
    })
  })
  const sourceIds = new Set(context.map(({ sourceId }) => sourceId))
  return {
    id: rule.id,
    claim: rule.description,
    promotionDecision: 'NOT PROMOTED',
    formalSourceIds: formal?.sourceReferenceIds ?? [],
    formalObservationIds: formal?.observationIds ?? [],
    reviewContext: context,
    reviewContextSourceCount: sourceIds.size,
    limits: ruleLimits[rule.id] ?? ['No rule-specific evidence gap summary is recorded.'],
  }
}

const { sourceBackedCount, pendingCount } = getGrammarEvidenceCounts(grammarRules, referenceCollection.sources)

/** Read-only summary derived from current corpus, exported rule evidence, and Phase 16 review dossier references. */
export const evidenceAudit = {
  counts: {
    sources: referenceCollection.sources.length,
    artworks: referenceCollection.artworks.length,
    motifObservations: allObservations.filter(({ kind }) => kind === 'motif').length,
    grammarObservations: allObservations.filter(({ kind }) => kind === 'grammar').length,
    measurements: referenceCollection.artworks.reduce((count, artwork) => count + (artwork.measurements?.length ?? 0), 0),
    grammarEvidence: exportedResearch.grammarEvidence.reduce((count, record) => count + record.sourceReferenceIds.length + record.observationIds.length, 0),
    documentaryRuleAssessments: ruleEvidenceAssessments.length,
    sourceBackedRules: sourceBackedCount,
    pendingRules: pendingCount,
    externalValidationRecords: 0,
  },
  rules: grammarRules.map(buildRuleAudit),
  sources: referenceCollection.sources.map((source): AuditSourceCoverage => ({
    id: source.id,
    title: source.title,
    sourceType: source.sourceType,
    documentationStatus: source.documentationStatus,
    artworkIds: referenceCollection.artworks.filter(({ source: artworkSource }) => artworkSource === source.id).map(({ id }) => id),
    motifObservationIds: allObservations.filter(({ kind, sourceId }) => kind === 'motif' && sourceId === source.id).map(({ record }) => record.id),
    grammarObservationIds: allObservations.filter(({ kind, sourceId }) => kind === 'grammar' && sourceId === source.id).map(({ record }) => record.id),
    measurementIds: referenceCollection.artworks.flatMap((artwork) => artwork.measurements?.filter(({ sourceReferenceId }) => sourceReferenceId === source.id).map(({ id }) => id) ?? []),
  })),
}

export function getAuditSource(sourceId: string): ReferenceSource | undefined {
  return sourceById.get(sourceId)
}
