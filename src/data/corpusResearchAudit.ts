import { grammarRules } from './grammar'
import { referenceCollection } from './referenceCollection'
import { validationReviewGuides } from './validationReviewGuide'
import { ruleEvidenceAssessments } from './research/ruleEvidenceAssessments'
import { validateRuleEvidenceAssessments, type EvidenceRelationship, type RuleEvidenceAssessment } from './ruleEvidenceAssessment'
import { getGrammarEvidenceCounts } from './grammarEvidence'
import { researchCorpusV1 } from './research/researchCorpus'
import type { GrammarRule } from '../grammar/types'
import type { GrammarEvidenceRecord, ReferenceArtwork, ReferenceCollection, ReferenceSource } from './references'
import type { ValidationReviewGuide } from './validationReviewGuide'

export type ResearchGapCategory =
  | 'DOCUMENTATION GAP'
  | 'CORPUS COVERAGE GAP'
  | 'CROSS-SOURCE GAP'
  | 'SCOPE GAP'
  | 'MEASUREMENT GAP'
  | 'VALIDATION GAP'
  | 'CONFLICT GAP'

export type RuleReadinessStatus =
  | 'no documentary evidence'
  | 'limited documentary evidence'
  | 'partially supported'
  | 'cross-source support needed'
  | 'expert validation needed'
  | 'conflicting evidence'
  | 'insufficient evidence'
  | 'ready for formal promotion review'

const gapCategoryOrder: ResearchGapCategory[] = [
  'DOCUMENTATION GAP', 'CORPUS COVERAGE GAP', 'CROSS-SOURCE GAP', 'SCOPE GAP', 'MEASUREMENT GAP', 'VALIDATION GAP', 'CONFLICT GAP',
]

export interface CorpusAuditGap {
  category: ResearchGapCategory
  description: string
  futureWork: 'documentary-research' | 'artwork-sampling' | 'source-comparison' | 'expert-validation' | 'measurement' | 'conflict-review'
}

export interface CorpusAuditSource {
  id: string
  title: string
  sourceType: ReferenceSource['sourceType']
  documentationStatus: ReferenceSource['documentationStatus']
  publicationClass: 'observation-bearing publication record' | 'catalogue/portal or candidate record'
  artworkLinks: Array<{ artworkId: string; relation: 'artwork-source' | 'attribution-source' }>
  motifObservationIds: string[]
  grammarObservationIds: string[]
  measurementIds: string[]
}

export interface CorpusAuditArtwork {
  id: string
  title: string
  sourceId?: string
  motifObservationIds: string[]
  grammarObservationIds: string[]
  measurementIds: string[]
  observationsWithProvenance: number
  observationsWithoutProvenance: string[]
}

export interface RuleResearchAudit {
  ruleId: string
  currentSoftwareClaim: string
  implementationLocations: string[]
  assessmentEvidenceCounts: Record<EvidenceRelationship, number>
  documentaryAssessmentCount: number
  /** Documentary records cited by the current review dossier, not formal rule links. */
  sourceCount: number
  distinctPublicationCount: number
  publicationCountIsExact: boolean
  artworkCount: number
  assessmentSourceCount: number
  assessmentDistinctPublicationCount: number
  assessmentPublicationCountIsExact: boolean
  assessmentArtworkCount: number
  expertValidationCount: number
  contextualDossierRecordCount: number
  contextualDossierSourceCount: number
  contextualDossierPublicationCount: number
  contextualDossierArtworkCount: number
  hasOnlyContextualDossierMaterial: boolean
  hasNoFormalEvidenceAssessment: boolean
  strongestDocumentedSupport: string
  currentLimitations: string[]
  unresolvedQuestions: string[]
  requiredNextEvidence: string[]
  readinessStatus: RuleReadinessStatus[]
  gaps: CorpusAuditGap[]
  promotionStatus: 'not promoted'
}

export interface CorpusResearchAudit {
  counts: {
    sourceRecordCount: number
    artworkCount: number
    motifObservationCount: number
    grammarObservationCount: number
    measurementCount: number
    formalGrammarEvidenceRecordCount: number
    formalGrammarEvidenceLinkCount: number
    documentaryEvidenceAssessmentCount: number
    documentaryEvidenceLinkCount: number
    expertValidationRecordCount: number
    sourceRecordsLinkedToObservations: number
    observationBearingPublicationCount: number
    sourceComparisonCount: number
    declaredIndependentPublicationPairCount: number
    observationsWithProvenance: number
    observationsWithoutProvenance: number
    sourceSpecificObservationCount: number
    artworkInheritedProvenanceCount: number
    sourceBackedRuleCount: number
    pendingRuleCount: number
  }
  sources: CorpusAuditSource[]
  artworks: CorpusAuditArtwork[]
  rules: RuleResearchAudit[]
  gapCategoriesFound: ResearchGapCategory[]
  auditWarnings: string[]
  assessmentValidation: ReturnType<typeof validateRuleEvidenceAssessments>
}

interface RuleAuditNarrative {
  implementationLocations: string[]
  strongestDocumentedSupport: string
  currentLimitations: string[]
  unresolvedQuestions: string[]
  requiredNextEvidence: string[]
  readinessStatus: RuleReadinessStatus[]
  gaps: CorpusAuditGap[]
}

const ruleNarratives: Record<string, RuleAuditNarrative> = {
  'motif.allowed': {
    implementationLocations: ['src/data/motifs.ts', 'src/data/grammar.ts', 'src/grammar/validator.ts'],
    strongestDocumentedSupport: 'The corpus records source-described human, tree, animal, and sun examples across the Rao Tarpa Dance figure and three D’SOURCE artworks. The D’SOURCE examples are one publication repeated across three artworks; they do not establish an exhaustive vocabulary.',
    currentLimitations: ['No motif observation records hut; houses in source prose were not normalized to hut.', 'The five configured motif IDs are software vocabulary entries, not a complete source-derived taxonomy.'],
    unresolvedQuestions: ['Are additional or different motif categories needed for this prototype?', 'Which source-described elements should remain outside the application’s motif IDs?'],
    requiredNextEvidence: ['Documented examples and non-examples across additional artworks and publications.', 'Artisan/domain-expert feedback on whether this vocabulary is useful within the explicitly stated prototype scope.'],
    readinessStatus: ['limited documentary evidence', 'cross-source support needed', 'expert validation needed', 'insufficient evidence'],
    gaps: [
      { category: 'DOCUMENTATION GAP', description: 'The sources do not define an exhaustive motif vocabulary or fully map source terms to the five software IDs.', futureWork: 'documentary-research' },
      { category: 'CORPUS COVERAGE GAP', description: 'The current observations cover four described artworks and omit systematic negative examples.', futureWork: 'artwork-sampling' },
      { category: 'CROSS-SOURCE GAP', description: 'D’SOURCE contributes repeated examples from one publication; Rao is a separate publication but overlaps in topic and is not independent corroboration for every claim.', futureWork: 'source-comparison' },
      { category: 'SCOPE GAP', description: 'Positive examples do not establish completeness, exclusivity, or applicability across contexts.', futureWork: 'documentary-research' },
      { category: 'VALIDATION GAP', description: 'Whether the configured categories are appropriate for this prototype is a question for qualified artisans/domain experts.', futureWork: 'expert-validation' },
    ],
  },
  'human.parts.required': {
    implementationLocations: ['src/data/grammar.ts', 'src/grammar/validator.ts', 'src/generator/generateHuman.ts'],
    strongestDocumentedSupport: 'CCRT describes selected parts in one Palaghat figure, including a head, raised hands, and small legs. This is one source-described figure and does not state that all six configured software parts are required in every relevant representation.',
    currentLimitations: ['D’SOURCE describes people in scenes but does not record part-by-part completeness.', 'No systematic assessment of absent, merged, obscured, or stylized parts exists.'],
    unresolvedQuestions: ['Are all six configured parts needed in the relevant representation scope?', 'Are left/right distinctions source-supported or renderer conveniences?'],
    requiredNextEvidence: ['Artwork-specific descriptions or carefully documented analyses that include omissions and variations.', 'Expert review of the configured six-part structure and its intended scope.'],
    readinessStatus: ['limited documentary evidence', 'cross-source support needed', 'expert validation needed', 'insufficient evidence'],
    gaps: [
      { category: 'DOCUMENTATION GAP', description: 'The source does not specify whether every figure must contain all six software-defined parts.', futureWork: 'documentary-research' },
      { category: 'CORPUS COVERAGE GAP', description: 'One figure has a part description; other recorded figures have not been checked part by part.', futureWork: 'artwork-sampling' },
      { category: 'CROSS-SOURCE GAP', description: 'Only the CCRT record describes figure construction at this level; other sources do not corroborate required completeness.', futureWork: 'source-comparison' },
      { category: 'SCOPE GAP', description: 'A description of one Palaghat figure cannot establish a required-part rule for every figure or context.', futureWork: 'documentary-research' },
      { category: 'VALIDATION GAP', description: 'The appropriate scope and treatment of omitted or stylized parts need qualified domain review.', futureWork: 'expert-validation' },
    ],
  },
  'human.part.primitive': {
    implementationLocations: ['src/data/grammar.ts', 'src/grammar/validator.ts'],
    strongestDocumentedSupport: 'CCRT describes two triangles and lines in one Palaghat figure; D’SOURCE describes broad geometric vocabulary. Neither source maps every configured human part to the exact software primitive.',
    currentLimitations: ['The complete head/circle, body/triangle, arms/line, legs/line mapping is not documented.', 'General geometric vocabulary is not a part-to-primitive mapping.'],
    unresolvedQuestions: ['Does each configured part-to-primitive mapping match a documented construction?', 'Under which artwork, maker, or representation scope would such a mapping apply?'],
    requiredNextEvidence: ['Artwork-specific source descriptions that identify both the part and its construction, including variations.', 'Expert review of the mapping and its scope.'],
    readinessStatus: ['limited documentary evidence', 'cross-source support needed', 'expert validation needed', 'insufficient evidence'],
    gaps: [
      { category: 'DOCUMENTATION GAP', description: 'No source explicitly maps all six software parts to the configured primitives.', futureWork: 'documentary-research' },
      { category: 'CORPUS COVERAGE GAP', description: 'The exact construction has not been documented across multiple figures or artworks.', futureWork: 'artwork-sampling' },
      { category: 'CROSS-SOURCE GAP', description: 'The detailed figure construction is CCRT-only; D’SOURCE’s broad shape list does not corroborate the exact mapping.', futureWork: 'source-comparison' },
      { category: 'SCOPE GAP', description: 'The software mapping has no established scope across figures, makers, contexts, or periods.', futureWork: 'documentary-research' },
      { category: 'VALIDATION GAP', description: 'A qualified artisan/domain expert should review whether the abstraction is appropriate and within what scope.', futureWork: 'expert-validation' },
    ],
  },
  'theme.allowed-motifs': {
    implementationLocations: ['src/data/grammar.ts', 'src/generator/themes.ts', 'src/generator/generateComposition.ts'],
    strongestDocumentedSupport: 'D’SOURCE describes selected co-occurring motifs in Tree of Life, Tarpa Nritya, and harvest artworks; Rao describes one Tarpa Dance figure; CCRT covers narrative/ritual contexts. These are positive examples, not exhaustive allow-lists or exclusions.',
    currentLimitations: ['No evidence assessment records any inclusion or exclusion relationship.', 'Prototype/demo theme configurations are software settings, not documentary observations.'],
    unresolvedQuestions: ['Is an explicit allow-list a suitable representation of source-documented contexts?', 'What evidence supports inclusion or exclusion of particular motifs in a stated context?'],
    requiredNextEvidence: ['Documented examples and counterexamples across contexts, with explicit scope and source independence review.', 'Expert review of whether allow-lists are an appropriate software representation.'],
    readinessStatus: ['limited documentary evidence', 'cross-source support needed', 'expert validation needed', 'insufficient evidence'],
    gaps: [
      { category: 'DOCUMENTATION GAP', description: 'The sources describe examples but do not provide complete theme-specific motif allow-lists or exclusion rules.', futureWork: 'documentary-research' },
      { category: 'CORPUS COVERAGE GAP', description: 'Only three D’SOURCE artworks and one Rao figure have linked artwork-specific descriptions relevant to the dossier.', futureWork: 'artwork-sampling' },
      { category: 'CROSS-SOURCE GAP', description: 'Repeated examples from D’SOURCE are one publication; Rao is related by overlapping authorship for some claims, while no formal source comparison assessment exists.', futureWork: 'source-comparison' },
      { category: 'SCOPE GAP', description: 'Selected co-occurrence does not establish an exhaustive allow-list or a rule that other motifs are disallowed.', futureWork: 'documentary-research' },
      { category: 'VALIDATION GAP', description: 'Whether theme allow-lists are a useful software abstraction requires qualified artisan/domain-expert review.', futureWork: 'expert-validation' },
    ],
  },
}

function collectArtworkRecords(artwork: ReferenceArtwork, knownSourceIds: ReadonlySet<string>) {
  const motifObservationIds = (artwork.motifs ?? []).map(({ id }) => id)
  const grammarObservationIds = (artwork.observations ?? []).map(({ id }) => id)
  const measurementIds = (artwork.measurements ?? []).map(({ id }) => id)
  const observations = [
    ...(artwork.motifs ?? []).map((record) => ({ id: record.id, sourceId: record.sourceReferenceId ?? artwork.source })),
    ...(artwork.observations ?? []).map((record) => ({ id: record.id, sourceId: record.sourceReferenceId ?? artwork.source })),
    ...(artwork.measurements ?? []).map((record) => ({ id: record.id, sourceId: record.sourceReferenceId ?? artwork.source })),
  ]
  return {
    motifObservationIds,
    grammarObservationIds,
    measurementIds,
    observationsWithProvenance: observations.filter(({ sourceId }) => Boolean(sourceId && knownSourceIds.has(sourceId))).length,
    observationsWithoutProvenance: observations.filter(({ sourceId }) => !sourceId || !knownSourceIds.has(sourceId)).map(({ id }) => id),
  }
}

function sourceForReference(reference: RuleEvidenceAssessment['evidence'][number]['reference'], collection: ReferenceCollection): { sourceId?: string; artworkId?: string } {
  if (reference.kind === 'source') return { sourceId: collection.sources.some(({ id }) => id === reference.id) ? reference.id : undefined }
  for (const artwork of collection.artworks) {
    const group = reference.kind === 'motif-observation' ? artwork.motifs
      : reference.kind === 'grammar-observation' ? artwork.observations
        : artwork.measurements
    const observation = group?.find(({ id }) => id === reference.id)
    if (observation) return { sourceId: observation.sourceReferenceId ?? artwork.source, artworkId: artwork.id }
  }
  return {}
}

function countPublications(sourceIds: readonly string[], assessments: readonly RuleEvidenceAssessment[]): { count: number; exact: boolean } {
  const unique = [...new Set(sourceIds)].sort()
  if (unique.length <= 1) return { count: unique.length, exact: true }
  const relationships = assessments.flatMap(({ sourceComparisons = [] }) => sourceComparisons)
  const pairRelationship = new Map<string, string>()
  for (const comparison of relationships) {
    const pair = [...comparison.sourceIds].sort().join('\u0000')
    const existing = pairRelationship.get(pair)
    if (existing && existing !== comparison.relationship) return { count: unique.length, exact: false }
    pairRelationship.set(pair, comparison.relationship)
  }
  let unknown = false
  const parent = new Map(unique.map((sourceId) => [sourceId, sourceId]))
  const root = (sourceId: string): string => {
    const current = parent.get(sourceId) ?? sourceId
    if (current === sourceId) return sourceId
    const result = root(current)
    parent.set(sourceId, result)
    return result
  }
  for (let i = 0; i < unique.length; i += 1) {
    for (let j = i + 1; j < unique.length; j += 1) {
      const pair = [unique[i], unique[j]].sort().join('\u0000')
      const relationship = pairRelationship.get(pair)
      if (!relationship || relationship === 'independence-unassessed') unknown = true
      if (relationship === 'same-publication') parent.set(root(unique[j]), root(unique[i]))
    }
  }
  const count = new Set(unique.map(root)).size
  return { count, exact: !unknown }
}

function buildRuleAudit(
  rule: GrammarRule,
  collection: ReferenceCollection,
  assessments: readonly RuleEvidenceAssessment[],
  guide: ValidationReviewGuide | undefined,
  expertValidationCount: number,
): RuleResearchAudit {
  const ruleAssessments = assessments.filter(({ ruleId }) => ruleId === rule.id)
  const evidenceCounts: Record<EvidenceRelationship, number> = {
    supports: 0, limits: 0, challenges: 0, contextualizes: 0, unresolved: 0,
  }
  const sources = new Set<string>()
  const artworks = new Set<string>()
  for (const assessment of ruleAssessments) {
    for (const link of assessment.evidence) {
      evidenceCounts[link.relationship] += 1
      const location = sourceForReference(link.reference, collection)
      if (location.sourceId && collection.sources.some(({ id }) => id === location.sourceId)) sources.add(location.sourceId)
      if (location.artworkId) artworks.add(location.artworkId)
    }
  }
  const guideRecords = guide?.evidence ?? []
  const guideSources = new Set<string>()
  const guideArtworks = new Set<string>()
  for (const item of guideRecords) {
    if (item.kind === 'source') guideSources.add(item.sourceId)
    else {
      guideSources.add(item.sourceId)
      const artwork = collection.artworks.find(({ motifs = [], observations = [] }) =>
        motifs.some(({ id }) => id === item.id) || observations.some(({ id }) => id === item.id))
      if (artwork) guideArtworks.add(artwork.id)
    }
  }
  const narrative = ruleNarratives[rule.id]
  const assessmentPublication = countPublications([...sources], ruleAssessments)
  const hasFormalEvidence = Object.values(evidenceCounts).some((count) => count > 0)
  return {
    ruleId: rule.id,
    currentSoftwareClaim: guide?.softwareClaim ?? rule.description,
    implementationLocations: narrative?.implementationLocations ?? ['src/data/grammar.ts'],
    assessmentEvidenceCounts: evidenceCounts,
    documentaryAssessmentCount: ruleAssessments.length,
    sourceCount: guideSources.size,
    distinctPublicationCount: guideSources.size,
    publicationCountIsExact: true,
    artworkCount: guideArtworks.size,
    assessmentSourceCount: sources.size,
    assessmentDistinctPublicationCount: assessmentPublication.count,
    assessmentPublicationCountIsExact: assessmentPublication.exact,
    assessmentArtworkCount: artworks.size,
    expertValidationCount,
    contextualDossierRecordCount: guideRecords.length,
    contextualDossierSourceCount: guideSources.size,
    // The current dossier links one corpus source record per cited publication item.
    // This is a publication-record count, not a count of independent corroboration.
    contextualDossierPublicationCount: guideSources.size,
    contextualDossierArtworkCount: guideArtworks.size,
    hasOnlyContextualDossierMaterial: guideRecords.length > 0 && !hasFormalEvidence,
    hasNoFormalEvidenceAssessment: ruleAssessments.length === 0,
    strongestDocumentedSupport: narrative?.strongestDocumentedSupport ?? 'No rule-specific documented support summary is available.',
    currentLimitations: narrative?.currentLimitations ?? [],
    unresolvedQuestions: narrative?.unresolvedQuestions ?? [],
    requiredNextEvidence: narrative?.requiredNextEvidence ?? [],
    readinessStatus: narrative?.readinessStatus ?? (hasFormalEvidence
      ? ['insufficient evidence']
      : guideRecords.length ? ['limited documentary evidence', 'insufficient evidence'] : ['no documentary evidence', 'insufficient evidence']),
    gaps: narrative?.gaps ?? [],
    promotionStatus: 'not promoted',
  }
}

export interface BuildCorpusAuditOptions {
  collection?: ReferenceCollection
  rules?: readonly GrammarRule[]
  grammarEvidenceRecords?: readonly GrammarEvidenceRecord[]
  assessments?: readonly RuleEvidenceAssessment[]
  guides?: readonly ValidationReviewGuide[]
  /** Phase 15/16 captures are ephemeral; current production persistent count is zero. */
  expertValidationRecordCount?: number
}

/** Deterministic, read-only audit over supplied production structures. */
export function buildCorpusResearchAudit(options: BuildCorpusAuditOptions = {}): CorpusResearchAudit {
  const collection = options.collection ?? referenceCollection
  const rules = options.rules ?? grammarRules
  const grammarEvidenceRecords = options.grammarEvidenceRecords ?? researchCorpusV1.grammarEvidence
  const assessments = options.assessments ?? ruleEvidenceAssessments
  const guides = options.guides ?? validationReviewGuides
  const expertValidationRecordCount = options.expertValidationRecordCount ?? 0
  const knownSourceIds = new Set(collection.sources.map(({ id }) => id))
  const observationRecords = collection.artworks.flatMap((artwork) => {
    return [
      ...(artwork.motifs ?? []).map((record) => ({ id: record.id, sourceId: record.sourceReferenceId ?? artwork.source, sourceSpecific: Boolean(record.sourceReferenceId && knownSourceIds.has(record.sourceReferenceId)) })),
      ...(artwork.observations ?? []).map((record) => ({ id: record.id, sourceId: record.sourceReferenceId ?? artwork.source, sourceSpecific: Boolean(record.sourceReferenceId && knownSourceIds.has(record.sourceReferenceId)) })),
    ]
  })
  const sources = collection.sources.map((source): CorpusAuditSource => {
    const artworkLinks = collection.artworks.flatMap((artwork) => [
      ...(artwork.source === source.id ? [{ artworkId: artwork.id, relation: 'artwork-source' as const }] : []),
      ...(artwork.attribution?.sourceReferenceId === source.id ? [{ artworkId: artwork.id, relation: 'attribution-source' as const }] : []),
    ])
    return {
      id: source.id,
      title: source.title,
      sourceType: source.sourceType,
      documentationStatus: source.documentationStatus,
      publicationClass: observationRecords.some(({ sourceId }) => sourceId === source.id) ? 'observation-bearing publication record' : 'catalogue/portal or candidate record',
      artworkLinks,
      motifObservationIds: collection.artworks.flatMap((artwork) => artwork.motifs?.filter(({ sourceReferenceId }) => (sourceReferenceId ?? artwork.source) === source.id).map(({ id }) => id) ?? []),
      grammarObservationIds: collection.artworks.flatMap((artwork) => artwork.observations?.filter(({ sourceReferenceId }) => (sourceReferenceId ?? artwork.source) === source.id).map(({ id }) => id) ?? []),
      measurementIds: collection.artworks.flatMap((artwork) => artwork.measurements?.filter(({ sourceReferenceId }) => (sourceReferenceId ?? artwork.source) === source.id).map(({ id }) => id) ?? []),
    }
  })
  const artworks = collection.artworks.map((artwork): CorpusAuditArtwork => {
    const data = collectArtworkRecords(artwork, knownSourceIds)
    return { id: artwork.id, title: artwork.title, sourceId: artwork.source, ...data }
  })
  const assessmentValidation = validateRuleEvidenceAssessments(assessments, collection, rules)
  const ruleAudits = rules.map((rule) => buildRuleAudit(rule, collection, assessments, guides.find(({ ruleId }) => ruleId === rule.id), expertValidationRecordCount))
  const sourceComparisonCount = assessments.reduce((count, assessment) => count + (assessment.sourceComparisons?.length ?? 0), 0)
  const declaredIndependentPublicationPairCount = assessments.reduce((count, assessment) => count + (assessment.sourceComparisons?.filter(({ relationship }) => relationship === 'independent-publications').length ?? 0), 0)
  const independenceUnassessedPairCount = assessments.reduce((count, assessment) => count + (assessment.sourceComparisons?.filter(({ relationship }) => relationship === 'independence-unassessed').length ?? 0), 0)
  const formalGrammarEvidenceLinkCount = assessments.reduce((count, assessment) => count + assessment.evidence.length, 0)
  const { sourceBackedCount, pendingCount } = getGrammarEvidenceCounts(rules, collection.sources)
  const foundGapCategories = new Set(ruleAudits.flatMap((rule) => rule.gaps.map(({ category }) => category)))
  const gaps = gapCategoryOrder.filter((category) => foundGapCategories.has(category))
  const warnings = [
    ...(assessments.length === 0 ? ['No documentary rule evidence assessments are recorded; per-relationship counts are zero.'] : []),
    ...(expertValidationRecordCount === 0 ? ['No persistent expert validation records exist; Phase 16 capture remains session-local unless explicitly exported.'] : []),
    ...(sourceComparisonCount === 0 ? ['No Phase 18 source/publication comparison records exist; publication independence is not established by the assessment layer.'] : []),
    ...(independenceUnassessedPairCount > 0 ? [`${independenceUnassessedPairCount} source pair(s) are explicitly marked independence-unassessed; do not count them as independent corroboration.`] : []),
    'Review-dossier references are contextual preparation material and are not counted as documentary evidence assessments.',
  ]
  return {
    counts: {
      sourceRecordCount: collection.sources.length,
      artworkCount: collection.artworks.length,
      motifObservationCount: collection.artworks.reduce((count, artwork) => count + (artwork.motifs?.length ?? 0), 0),
      grammarObservationCount: collection.artworks.reduce((count, artwork) => count + (artwork.observations?.length ?? 0), 0),
      measurementCount: collection.artworks.reduce((count, artwork) => count + (artwork.measurements?.length ?? 0), 0),
      formalGrammarEvidenceRecordCount: grammarEvidenceRecords.length,
      formalGrammarEvidenceLinkCount: grammarEvidenceRecords.reduce((count, record) => count + record.sourceReferenceIds.length + record.observationIds.length, 0),
      documentaryEvidenceAssessmentCount: assessments.length,
      documentaryEvidenceLinkCount: formalGrammarEvidenceLinkCount,
      expertValidationRecordCount: expertValidationRecordCount,
      sourceRecordsLinkedToObservations: new Set(observationRecords.map(({ sourceId }) => sourceId).filter((id): id is string => Boolean(id && knownSourceIds.has(id)))).size,
      observationBearingPublicationCount: new Set(observationRecords.map(({ sourceId }) => sourceId).filter((id): id is string => Boolean(id && knownSourceIds.has(id)))).size,
      sourceComparisonCount,
      declaredIndependentPublicationPairCount,
      observationsWithProvenance: observationRecords.filter(({ sourceId }) => Boolean(sourceId && collection.sources.some(({ id }) => id === sourceId))).length,
      observationsWithoutProvenance: observationRecords.filter(({ sourceId }) => !sourceId || !collection.sources.some(({ id }) => id === sourceId)).length,
      sourceSpecificObservationCount: observationRecords.filter(({ sourceSpecific }) => sourceSpecific).length,
      artworkInheritedProvenanceCount: observationRecords.filter(({ sourceId, sourceSpecific }) => Boolean(sourceId && collection.sources.some(({ id }) => id === sourceId)) && !sourceSpecific).length,
      sourceBackedRuleCount: sourceBackedCount,
      pendingRuleCount: pendingCount,
    },
    sources,
    artworks,
    rules: ruleAudits,
    gapCategoriesFound: gaps,
    auditWarnings: [...warnings, ...assessmentValidation.warnings.map(({ message }) => message), ...assessmentValidation.errors.map(({ message }) => `Invalid production evidence assessment: ${message}`)],
    assessmentValidation,
  }
}

export const corpusResearchAudit = buildCorpusResearchAudit()

function markdownCell(value: string | number | readonly string[]) {
  const text = Array.isArray(value) ? value.join(', ') : String(value)
  return text.replaceAll('|', '\\|').replaceAll('\n', ' ')
}

/** Stable generated result section for the Phase 19 report and its drift test. */
export function renderCorpusAuditReport(audit: CorpusResearchAudit = corpusResearchAudit): string {
  const countRows = [
    ['Source records', audit.counts.sourceRecordCount],
    ['Observation-bearing publication records', audit.counts.observationBearingPublicationCount],
    ['Artwork records', audit.counts.artworkCount],
    ['Motif observations', audit.counts.motifObservationCount],
    ['Grammar observations', audit.counts.grammarObservationCount],
    ['Measurements', audit.counts.measurementCount],
    ['Formal grammar evidence records / links', `${audit.counts.formalGrammarEvidenceRecordCount} / ${audit.counts.formalGrammarEvidenceLinkCount}`],
    ['Documentary assessments / links', `${audit.counts.documentaryEvidenceAssessmentCount} / ${audit.counts.documentaryEvidenceLinkCount}`],
    ['Expert validation records', audit.counts.expertValidationRecordCount],
    ['Observation records with provenance', `${audit.counts.observationsWithProvenance} / ${audit.counts.motifObservationCount + audit.counts.grammarObservationCount}`],
    ['Source-specific observation provenance', audit.counts.sourceSpecificObservationCount],
    ['Artwork-inherited provenance', audit.counts.artworkInheritedProvenanceCount],
    ['Observation-bearing source records', audit.counts.sourceRecordsLinkedToObservations],
    ['Source comparison records / independent pairs', `${audit.counts.sourceComparisonCount} / ${audit.counts.declaredIndependentPublicationPairCount}`],
    ['Source-backed / pending rules', `${audit.counts.sourceBackedRuleCount} / ${audit.counts.pendingRuleCount}`],
  ]
  const lines = [
    '### Corpus totals',
    '',
    '| Measure | Current result |',
    '| --- | ---: |',
    ...countRows.map(([label, value]) => `| ${markdownCell(String(label))} | ${markdownCell(value as string | number)} |`),
    '',
    'Publication note: the source schema has no general publication-family registry. “Observation-bearing publication records” counts distinct source IDs attached to motif/grammar observations (a record-level proxy); it is not a count of independent corroboration. The D’SOURCE web page and PDF are represented by one source record. Phase 18 source-comparison assessments provide explicit relationship declarations; there are currently none.',
    '',
    '### Source relationships and reuse',
    '',
    '| Source ID | Record class | Status | Artwork links (direct / attribution) | Motif obs. | Grammar obs. | Measurements |',
    '| --- | --- | --- | ---: | ---: | ---: | ---: |',
    ...audit.sources.map((source) => {
      const direct = source.artworkLinks.filter(({ relation }) => relation === 'artwork-source').length
      const attribution = source.artworkLinks.filter(({ relation }) => relation === 'attribution-source').length
      return `| ${markdownCell(source.id)} | ${markdownCell(source.publicationClass)} | ${markdownCell(source.documentationStatus)} | ${direct} / ${attribution} | ${source.motifObservationIds.length} | ${source.grammarObservationIds.length} | ${source.measurementIds.length} |`
    }),
    '',
    'The three observation-bearing publication records are CCRT, Rao, and D’SOURCE. D’SOURCE supplies 11 observation records across three artwork records but remains one publication. Rao and D’SOURCE are distinct publications, but the rule-promotion review cautions that overlapping authorship means they are not independent corroboration for every overlapping claim. The corpus currently contains no explicit Phase 18 publication-comparison assessment.',
    '',
    '### Artwork observation coverage',
    '',
    '| Artwork ID | Source ID | Motif observation IDs | Grammar observation IDs | Measurements | Provenance |',
    '| --- | --- | --- | --- | --- | --- |',
    ...audit.artworks.map((artwork) => {
      const recordCount = artwork.motifObservationIds.length + artwork.grammarObservationIds.length + artwork.measurementIds.length
      return `| ${markdownCell(artwork.id)} | ${markdownCell(artwork.sourceId ?? '(no artwork source)')} | ${markdownCell(artwork.motifObservationIds)} | ${markdownCell(artwork.grammarObservationIds)} | ${markdownCell(artwork.measurementIds)} | ${artwork.observationsWithProvenance}/${recordCount} linked${artwork.observationsWithoutProvenance.length ? `; missing: ${markdownCell(artwork.observationsWithoutProvenance)}` : ''} |`
    }),
    '',
    '### Rule-by-rule audit',
    '',
  ]
  for (const rule of audit.rules) {
    const relations = Object.entries(rule.assessmentEvidenceCounts).map(([name, count]) => `${name}: ${count}`).join('; ')
    lines.push(
      `#### ${rule.ruleId}`,
      '',
      `- **Current software claim:** ${rule.currentSoftwareClaim}`,
      `- **Implementation:** ${rule.implementationLocations.join(', ')}`,
      `- **Formal documentary assessment links:** ${relations}. Assessment records: ${rule.documentaryAssessmentCount}.`,
      `- **Review-dossier sources / publication records / artworks:** ${rule.sourceCount} / ${rule.distinctPublicationCount} / ${rule.artworkCount}. These count selected documentary context, not support or independence.`,
      `- **Formal assessment sources / distinct publications / artworks:** ${rule.assessmentSourceCount} / ${rule.assessmentDistinctPublicationCount}${rule.assessmentPublicationCountIsExact ? '' : ' (not exact; source relationship incomplete)'} / ${rule.assessmentArtworkCount}.`,
      `- **Expert validation records:** ${rule.expertValidationCount}. **Review-dossier context only:** ${rule.contextualDossierRecordCount} records, ${rule.contextualDossierSourceCount} source records, ${rule.contextualDossierArtworkCount} artworks. These are not formal rule evidence assessments.`,
      `- **Readiness:** ${rule.readinessStatus.join('; ')}. **Promotion:** ${rule.promotionStatus}.`,
      `- **Strongest documented support currently described:** ${rule.strongestDocumentedSupport}`,
      `- **Current limitations:** ${rule.currentLimitations.join(' ')}`,
      `- **Unresolved questions:** ${rule.unresolvedQuestions.join(' ')}`,
      `- **Required next evidence:** ${rule.requiredNextEvidence.join(' ')}`,
      `- **Gap classes:** ${rule.gaps.map(({ category }) => category).join('; ')}.`,
      '',
    )
  }
  lines.push(
    '### Gap classes found',
    '',
    ...audit.gapCategoriesFound.map((category) => `- ${category}`),
    '',
    'No measurement gap was assigned because the four current claims are categorical/software-schema claims and do not require a numeric measurement to assess. No conflict gap was assigned because no conflicting assessment records exist; this is not evidence that the material contains no variation or conflict.',
    '',
    '### Audit cautions',
    '',
    ...audit.auditWarnings.map((warning) => `- ${warning}`),
  )
  return lines.join('\n')
}
