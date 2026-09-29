import type { MotifId, PrimitiveId } from '../grammar/types'

/** Software classifications for describing where a reference comes from. */
export type ReferenceSourceType =
  | 'museum'
  | 'government'
  | 'academic'
  | 'field_documentation'
  | 'artist_provided'
  | 'other'

/** Project documentation state only; it is not an authenticity judgment. */
export type ReferenceStatus =
  | 'documented'
  | 'partially-documented'
  | 'not-documented'
  | 'pending-review'

export interface ReferenceSource {
  id: string
  title: string
  sourceType: ReferenceSourceType
  publisher?: string
  creator?: string
  url?: string
  citation?: string
  accessedAt?: string
  license?: string
  notes?: string
  documentationStatus: ReferenceStatus
}

export interface ObservationMetadata {
  sourceReferenceId?: string
  confidence?: number
  notes?: string
}

export type ObservationKind =
  | 'primitive-usage'
  | 'figure-structure'
  | 'composition'
  | 'relative-positioning'
  | 'repetition'
  | 'angles'
  | 'proportions'
  | 'motif-relationships'

export interface MotifObservation extends ObservationMetadata {
  id: string
  kind: ObservationKind
  motifId?: MotifId | string
  primitiveId?: PrimitiveId | string
  description?: string
}

export interface GrammarObservation extends ObservationMetadata {
  id: string
  kind: ObservationKind
  ruleId?: string
  description?: string
}

export interface MeasurementObservation extends ObservationMetadata {
  id: string
  subject: string
  value?: number
  unit?: string
  description?: string
}

export interface Attribution {
  creator?: string
  community?: string
  rightsHolder?: string
  statement?: string
  sourceReferenceId?: string
}

export interface ReferenceArtwork {
  id: string
  title: string
  /** ID of a ReferenceSource record in the same collection. */
  source?: string
  sourceType?: ReferenceSourceType
  artist?: string
  community?: string
  location?: string
  theme?: string
  motifs?: MotifObservation[]
  observations?: GrammarObservation[]
  measurements?: MeasurementObservation[]
  attribution?: Attribution
  license?: string
  notes?: string
  documentationStatus: ReferenceStatus
}

export interface ReferenceCollection {
  sources: ReferenceSource[]
  artworks: ReferenceArtwork[]
}

/** Portable research record bundle. Version 1 is prepared for future safe imports. */
export interface ReferenceResearchExport {
  schemaVersion: 1
  sources: ReferenceSource[]
  artworks: ReferenceArtwork[]
  grammarEvidence: GrammarEvidenceRecord[]
}

export interface GrammarEvidenceRecord {
  ruleId: string
  description: string
  sourceReferenceIds: string[]
  observationIds: string[]
}

export interface ReferenceValidationIssue {
  code:
    | 'missing-required-field'
    | 'duplicate-id'
    | 'broken-source-reference'
    | 'measurement-without-source'
    | 'invalid-motif'
    | 'invalid-primitive'
    | 'invalid-observation-kind'
  recordType: 'source' | 'artwork' | 'motif-observation' | 'grammar-observation' | 'grammar-rule' | 'measurement'
  recordId?: string
  field: string
  message: string
}

export interface ReferenceValidationResult {
  valid: boolean
  issues: ReferenceValidationIssue[]
}
