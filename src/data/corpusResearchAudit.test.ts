import { describe, expect, it } from 'vitest'
import { referenceCollection } from './referenceCollection'
import { grammarRules } from './grammar'
import { validationReviewGuides } from './validationReviewGuide'
import { researchCorpusV1 } from './research/researchCorpus'
import { ruleEvidenceAssessments } from './research/ruleEvidenceAssessments'
import phase19Documentation from '../../docs/phase-19-corpus-research-audit.md?raw'
import type { ReferenceCollection } from './references'
import type { RuleEvidenceAssessment } from './ruleEvidenceAssessment'
import { buildCorpusResearchAudit, corpusResearchAudit, renderCorpusAuditReport } from './corpusResearchAudit'

// Synthetic records in this file exist only to exercise audit aggregation.
function syntheticCollection(): ReferenceCollection {
  return {
    sources: [
      { id: 'synthetic-source-a', title: 'Synthetic publication A', sourceType: 'academic', documentationStatus: 'documented' },
      { id: 'synthetic-source-b', title: 'Synthetic publication B', sourceType: 'academic', documentationStatus: 'documented' },
    ],
    artworks: [
      {
        id: 'synthetic-artwork-a', title: 'Synthetic artwork A', source: 'synthetic-source-a', documentationStatus: 'documented',
        motifs: [{ id: 'synthetic-motif-a', kind: 'motif-relationships', motifId: 'human', sourceReferenceId: 'synthetic-source-a', description: 'Synthetic observation.' }],
        observations: [{ id: 'synthetic-grammar-a', kind: 'figure-structure', sourceReferenceId: 'synthetic-source-a', description: 'Synthetic grammar observation.' }],
      },
      {
        id: 'synthetic-artwork-b', title: 'Synthetic artwork B', source: 'synthetic-source-b', documentationStatus: 'documented',
        motifs: [{ id: 'synthetic-motif-b', kind: 'motif-relationships', motifId: 'animal', sourceReferenceId: 'synthetic-source-b', description: 'Synthetic observation.' }],
      },
    ],
  }
}

function assessment(
  id: string,
  ruleId: string,
  links: RuleEvidenceAssessment['evidence'],
  sourceComparisons?: RuleEvidenceAssessment['sourceComparisons'],
): RuleEvidenceAssessment {
  return {
    id,
    ruleId,
    state: 'assessed',
    interpretation: 'Synthetic test-only interpretation; not a research conclusion.',
    evidence: links,
    ...(sourceComparisons ? { sourceComparisons } : {}),
  }
}

const link = (kind: 'source' | 'motif-observation' | 'grammar-observation', id: string, relationship: RuleEvidenceAssessment['evidence'][number]['relationship']): RuleEvidenceAssessment['evidence'][number] => ({
  reference: { kind, id } as RuleEvidenceAssessment['evidence'][number]['reference'],
  relationship,
  scope: 'Synthetic test scope only.',
  rationale: 'Synthetic fixture rationale only.',
})

describe('corpus-level research audit', () => {
  it('reports the exact current production corpus, empty assessment layer, and non-persistent validation state', () => {
    expect(corpusResearchAudit.counts).toMatchObject({
      sourceRecordCount: 7,
      artworkCount: 12,
      motifObservationCount: 9,
      grammarObservationCount: 5,
      measurementCount: 0,
      formalGrammarEvidenceRecordCount: 0,
      formalGrammarEvidenceLinkCount: 0,
      documentaryEvidenceAssessmentCount: 0,
      documentaryEvidenceLinkCount: 0,
      expertValidationRecordCount: 0,
      sourceRecordsLinkedToObservations: 3,
      observationBearingPublicationCount: 3,
      sourceComparisonCount: 0,
      declaredIndependentPublicationPairCount: 0,
      observationsWithProvenance: 14,
      observationsWithoutProvenance: 0,
      sourceSpecificObservationCount: 14,
      artworkInheritedProvenanceCount: 0,
      sourceBackedRuleCount: 0,
      pendingRuleCount: 4,
    })
    expect(ruleEvidenceAssessments).toEqual([])
    expect(corpusResearchAudit.assessmentValidation).toMatchObject({ valid: true, errors: [], warnings: [] })
  })

  it('traces source-to-artwork, attribution, and observation relationships', () => {
    expect(corpusResearchAudit.sources).toHaveLength(7)
    expect(corpusResearchAudit.sources.find(({ id }) => id === 'source-british-museum-varli-term')?.artworkLinks).toHaveLength(6)
    expect(corpusResearchAudit.sources.find(({ id }) => id === 'source-british-museum-jivya-mashe')?.artworkLinks).toContainEqual({
      artworkId: 'british-museum-1988-0209-0-3', relation: 'attribution-source',
    })
    expect(corpusResearchAudit.sources.find(({ id }) => id === 'source-mota-tribal-faces')?.artworkLinks).toEqual([])
    expect(corpusResearchAudit.sources.find(({ id }) => id === 'source-dsource-idc-warli-documentation')?.motifObservationIds).toHaveLength(8)
    expect(corpusResearchAudit.sources.find(({ id }) => id === 'source-dsource-idc-warli-documentation')?.grammarObservationIds).toHaveLength(3)
    expect(corpusResearchAudit.artworks.find(({ id }) => id === 'dsource-2016-tree-of-life-painting')).toMatchObject({
      motifObservationIds: expect.arrayContaining(['dsource-tree-of-life-motif-tree-01', 'dsource-tree-of-life-motif-sun-01']),
      grammarObservationIds: ['dsource-tree-of-life-grammar-relationships-01'],
      observationsWithProvenance: 5,
      observationsWithoutProvenance: [],
    })
  })

  it('does not count repeat observations within a publication as additional sources or publications', () => {
    const dsource = corpusResearchAudit.sources.find(({ id }) => id === 'source-dsource-idc-warli-documentation')!
    expect(dsource.motifObservationIds.length + dsource.grammarObservationIds.length).toBe(11)
    expect(dsource.artworkLinks.map(({ artworkId }) => artworkId)).toEqual(expect.arrayContaining([
      'dsource-2016-tree-of-life-painting',
      'dsource-2016-rice-fields-tarpa-nritya-painting',
      'dsource-2016-paddy-harvest-painting',
    ]))
    expect(corpusResearchAudit.counts.observationBearingPublicationCount).toBe(3)
    expect(corpusResearchAudit.counts.declaredIndependentPublicationPairCount).toBe(0)
  })

  it('reports zero formal rule evidence while keeping Phase 16 review material in its own contextual count', () => {
    expect(corpusResearchAudit.rules.map(({ ruleId }) => ruleId)).toEqual(grammarRules.map(({ id }) => id))
    for (const rule of corpusResearchAudit.rules) {
      expect(rule.assessmentEvidenceCounts).toEqual({ supports: 0, limits: 0, challenges: 0, contextualizes: 0, unresolved: 0 })
      expect(rule.documentaryAssessmentCount).toBe(0)
      expect(rule.hasNoFormalEvidenceAssessment).toBe(true)
      expect(rule.hasOnlyContextualDossierMaterial).toBe(true)
      expect(rule.expertValidationCount).toBe(0)
      expect(rule.promotionStatus).toBe('not promoted')
      expect(rule.contextualDossierRecordCount).toBeGreaterThan(0)
    }
    expect(corpusResearchAudit.rules.find(({ ruleId }) => ruleId === 'motif.allowed')).toMatchObject({
      contextualDossierRecordCount: 9,
      contextualDossierSourceCount: 2,
      contextualDossierPublicationCount: 2,
      contextualDossierArtworkCount: 4,
    })
    expect(corpusResearchAudit.rules.find(({ ruleId }) => ruleId === 'human.parts.required')?.contextualDossierArtworkCount).toBe(4)
    expect(corpusResearchAudit.rules.find(({ ruleId }) => ruleId === 'human.part.primitive')?.contextualDossierArtworkCount).toBe(1)
    expect(corpusResearchAudit.rules.find(({ ruleId }) => ruleId === 'theme.allowed-motifs')?.contextualDossierArtworkCount).toBe(4)
  })

  it('aggregates every documentary relationship type by rule without treating links as promotion', () => {
    const collection = syntheticCollection()
    const assessments = [assessment('evidence-assessment-supports', 'motif.allowed', [link('motif-observation', 'synthetic-motif-a', 'supports')]),
      assessment('evidence-assessment-limits', 'motif.allowed', [link('source', 'synthetic-source-b', 'limits')]),
      assessment('evidence-assessment-challenges', 'motif.allowed', [link('motif-observation', 'synthetic-motif-b', 'challenges')]),
      assessment('evidence-assessment-context', 'motif.allowed', [link('grammar-observation', 'synthetic-grammar-a', 'contextualizes')]),
      { ...assessment('evidence-assessment-unresolved', 'motif.allowed', [link('source', 'synthetic-source-a', 'unresolved')]), state: 'unresolved' as const }]
    const audit = buildCorpusResearchAudit({ collection, assessments, guides: [] })
    const rule = audit.rules.find(({ ruleId }) => ruleId === 'motif.allowed')!
    expect(rule.assessmentEvidenceCounts).toEqual({ supports: 1, limits: 1, challenges: 1, contextualizes: 1, unresolved: 1 })
    expect(rule.documentaryAssessmentCount).toBe(5)
    expect(rule.assessmentSourceCount).toBe(2)
    expect(rule.assessmentArtworkCount).toBe(2)
    expect(rule.assessmentPublicationCountIsExact).toBe(false)
    expect(rule.promotionStatus).toBe('not promoted')
    expect(audit.counts.sourceBackedRuleCount).toBe(0)
  })

  it('uses explicit source comparisons for publication counts and reports unknown relationships honestly', () => {
    const collection = syntheticCollection()
    const twoSourceLinks = [link('source', 'synthetic-source-a', 'supports'), link('source', 'synthetic-source-b', 'contextualizes')]
    const assessmentWith = (relationship: 'same-publication' | 'independent-publications' | 'independence-unassessed') => assessment(
      `evidence-assessment-${relationship}`, 'motif.allowed', twoSourceLinks,
      [{ sourceIds: ['synthetic-source-a', 'synthetic-source-b'], relationship, basis: 'Synthetic test-only comparison.' }],
    )
    const same = buildCorpusResearchAudit({ collection, assessments: [assessmentWith('same-publication')] }).rules[0]
    expect(same.assessmentDistinctPublicationCount).toBe(1)
    expect(same.assessmentPublicationCountIsExact).toBe(true)
    const independent = buildCorpusResearchAudit({ collection, assessments: [assessmentWith('independent-publications')] })
    expect(independent.rules[0].assessmentDistinctPublicationCount).toBe(2)
    expect(independent.counts.declaredIndependentPublicationPairCount).toBe(1)
    const unknown = buildCorpusResearchAudit({ collection, assessments: [assessmentWith('independence-unassessed')] })
    expect(unknown.rules[0].assessmentPublicationCountIsExact).toBe(false)
    expect(unknown.auditWarnings).toContainEqual(expect.stringContaining('explicitly marked independence-unassessed'))
  })

  it('identifies missing and artwork-inherited observation provenance distinctly', () => {
    const collection = syntheticCollection()
    collection.artworks[0].motifs![0].sourceReferenceId = undefined
    collection.artworks[0].observations![0].sourceReferenceId = undefined
    collection.artworks.push({
      id: 'synthetic-artwork-no-source', title: 'Synthetic artwork without source', documentationStatus: 'pending-review',
      motifs: [{ id: 'synthetic-motif-no-source', kind: 'motif-relationships', motifId: 'tree', description: 'Synthetic missing-provenance fixture.' }],
    })
    const audit = buildCorpusResearchAudit({ collection })
    expect(audit.counts.observationsWithoutProvenance).toBe(1)
    expect(audit.counts.observationsWithProvenance).toBe(3)
    expect(audit.counts.sourceSpecificObservationCount).toBe(1)
    expect(audit.counts.artworkInheritedProvenanceCount).toBe(2)
    expect(audit.artworks.find(({ id }) => id === 'synthetic-artwork-no-source')?.observationsWithoutProvenance).toEqual(['synthetic-motif-no-source'])
  })

  it('derives scope, cross-source, documentation, corpus, and validation gaps without inventing conflict or measurement gaps', () => {
    const expected = ['DOCUMENTATION GAP', 'CORPUS COVERAGE GAP', 'CROSS-SOURCE GAP', 'SCOPE GAP', 'VALIDATION GAP']
    expect(corpusResearchAudit.gapCategoriesFound).toEqual(expected)
    expect(corpusResearchAudit.gapCategoriesFound).not.toContain('MEASUREMENT GAP')
    expect(corpusResearchAudit.gapCategoriesFound).not.toContain('CONFLICT GAP')
    for (const rule of corpusResearchAudit.rules) {
      expect(rule.gaps.some(({ category }) => category === 'SCOPE GAP')).toBe(true)
      expect(rule.gaps.some(({ category }) => category === 'VALIDATION GAP')).toBe(true)
      expect(rule.requiredNextEvidence.length).toBeGreaterThan(0)
      expect(rule.unresolvedQuestions.length).toBeGreaterThan(0)
    }
    expect(corpusResearchAudit.rules.find(({ ruleId }) => ruleId === 'human.part.primitive')?.readinessStatus).toContain('cross-source support needed')
    expect(corpusResearchAudit.rules.find(({ ruleId }) => ruleId === 'theme.allowed-motifs')?.readinessStatus).toContain('expert validation needed')
  })

  it('does not mutate any published source, artwork, observation, measurement, or assessment record', () => {
    const beforeCorpus = structuredClone(researchCorpusV1)
    const beforeCollection = structuredClone(referenceCollection)
    const beforeAssessments = structuredClone(ruleEvidenceAssessments)
    buildCorpusResearchAudit()
    expect(researchCorpusV1).toEqual(beforeCorpus)
    expect(referenceCollection).toEqual(beforeCollection)
    expect(ruleEvidenceAssessments).toEqual(beforeAssessments)
  })

  it('produces deterministic audit output from the same corpus structures', () => {
    const first = buildCorpusResearchAudit()
    const second = buildCorpusResearchAudit()
    expect(second).toEqual(first)
  })

  it('keeps the documented actual-results section generated from the audit model', () => {
    const start = '<!-- BEGIN GENERATED CORPUS AUDIT -->'
    const end = '<!-- END GENERATED CORPUS AUDIT -->'
    const generatedSection = phase19Documentation.split(start)[1]?.split(end)[0]?.trim()
    expect(generatedSection).toBe(renderCorpusAuditReport().trim())
  })

  it('uses the actual production review guides rather than creating new evidence records', () => {
    expect(corpusResearchAudit.rules.map(({ ruleId, contextualDossierRecordCount }) => [ruleId, contextualDossierRecordCount])).toEqual(
      validationReviewGuides.map(({ ruleId, evidence }) => [ruleId, evidence.length]),
    )
  })
})
