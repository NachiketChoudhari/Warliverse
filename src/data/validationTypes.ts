import { grammarRules } from './grammar'

/** IDs are derived from the configured rule set so capture cannot name an unknown rule. */
export const VALIDATION_RULE_IDS = grammarRules.map(({ id }) => id) as readonly (typeof grammarRules)[number]['id'][]
export type ValidationRuleId = (typeof grammarRules)[number]['id']

export const VALIDATION_STATUSES = [
  'not-reviewed',
  'review-requested',
  'response-recorded',
  'requires-follow-up',
  'supported-after-review',
  'challenged',
  'conflicting-evidence',
] as const
export type ValidationStatus = (typeof VALIDATION_STATUSES)[number]

export type ValidationPosition = 'agrees' | 'disagrees' | 'partially-agrees' | 'unable-to-assess'
export type EvidenceRelationship = 'supports' | 'challenges' | 'contextualizes' | 'conflicts-with'

/** A stable project-local alias avoids requiring a personal name in the data model. */
export interface ValidationParticipant {
  id: string
  identityMode: 'named' | 'anonymized'
  name?: string
  role: string
  expertise?: string
  affiliation?: string
}

/** References existing published/documentary material; does not copy or alter it. */
export type DocumentaryEvidenceReference =
  | { kind: 'source'; sourceId: string; relationship: EvidenceRelationship }
  | { kind: 'observation'; observationId: string; sourceId?: string; relationship: EvidenceRelationship }

/** A citation supplied by the participant remains distinct from the project corpus. */
export interface ParticipantEvidenceReference {
  citation: string
  url?: string
  relationship: EvidenceRelationship
  notes?: string
}

/** The captured expert statement is not the software interpretation or a rule decision. */
export interface ExpertValidationResponse {
  statement: string
  position: ValidationPosition
  scope?: string
  suggestedCorrection?: string
  evidenceSupplied?: ParticipantEvidenceReference[]
}

export interface ValidationAttribution {
  mode: 'named' | 'anonymous' | 'withheld' | 'pending'
  displayName?: string
  preferredWording?: string
  permittedUse?: string
}

export interface ValidationConsent {
  status: 'granted' | 'conditional' | 'declined' | 'pending'
  documentationMethod: 'notes' | 'audio' | 'written' | 'none'
  conditions?: string
}

/**
 * Non-persistent capture shape. Documentary evidence, participant statements,
 * and the software claim shown for review are separate fields. Promotion decisions
 * are deliberately outside this record and require a separate evidence review.
 */
export interface ValidationRecord {
  id: string
  ruleId: ValidationRuleId
  validator: ValidationParticipant | null
  validationDate?: string
  questionPresented: string
  softwareInterpretation: { claim: string }
  documentaryEvidence?: DocumentaryEvidenceReference[]
  expertResponse?: ExpertValidationResponse
  attribution: ValidationAttribution
  consent: ValidationConsent
  status: ValidationStatus
  followUpNotes?: string
  provenanceNotes?: string
}

export interface ValidationIssue {
  code: string
  path: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}
