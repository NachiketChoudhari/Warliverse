import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { EvidenceAuditPage } from './EvidenceAuditPage'
import { evidenceAudit } from '../data/evidenceAudit'
import { grammarRules } from '../data/grammar'

describe('evidence audit', () => {
  it('exposes counts derived from the current corpus and formal evidence export', () => {
    expect(evidenceAudit.counts).toMatchObject({
      sources: 7,
      artworks: 12,
      motifObservations: 9,
      grammarObservations: 5,
      measurements: 0,
      grammarEvidence: 0,
      documentaryRuleAssessments: 0,
      sourceBackedRules: 0,
      pendingRules: 4,
      externalValidationRecords: 0,
    })
  })

  it('keeps formal links empty and includes every configured rule without promotion', () => {
    expect(evidenceAudit.rules.map(({ id }) => id)).toEqual(grammarRules.map(({ id }) => id))
    expect(evidenceAudit.rules.every(({ formalSourceIds, formalObservationIds, promotionDecision }) => formalSourceIds.length === 0 && formalObservationIds.length === 0 && promotionDecision === 'NOT PROMOTED')).toBe(true)
  })

  it('traces recorded artwork and observation IDs by documentary source', () => {
    expect(evidenceAudit.sources).toHaveLength(7)
    expect(evidenceAudit.sources.reduce((count, source) => count + source.motifObservationIds.length, 0)).toBe(9)
    expect(evidenceAudit.sources.reduce((count, source) => count + source.grammarObservationIds.length, 0)).toBe(5)
    expect(evidenceAudit.sources.find(({ id }) => id === 'source-mota-tribal-faces')?.artworkIds).toEqual([])
  })

  it('renders documentary dossier context as distinct from formal rule evidence and expert validation', () => {
    const html = renderToStaticMarkup(createElement(EvidenceAuditPage))
    expect(html).toContain('Review dossier context')
    expect(html).toContain('not converted into formal rule links')
    expect(html).toContain('no expert validation records')
    expect(html).toContain('NOT PROMOTED')
    expect(html).toContain('Source-to-record coverage')
    expect(html).toContain('ccrt-fig4-3-grammar-palaghata-structure-01')
  })

  it('renders Phase 19 rule statuses and gap classes from the production corpus audit', () => {
    const html = renderToStaticMarkup(createElement(EvidenceAuditPage))
    expect(html).toContain('Rule evidence and research gaps')
    expect(html).toContain('14/14')
    expect(html).toContain('DOCUMENTATION GAP')
    expect(html).toContain('CROSS-SOURCE GAP')
    expect(html).toContain('VALIDATION GAP')
    expect(html).toContain('human.parts.required')
    expect(html).toContain('Formal assessments: 0')
    expect(html).toContain('distinct publications: 0')
    expect(html).toContain('No formal evidence assessment exists for this rule.')
  })
})
