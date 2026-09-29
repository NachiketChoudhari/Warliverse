import type { HumanPart, HumanStructure, MotifId, PrimitiveId, ValidationResult } from '../grammar/types'
import type { GeneratedComposition } from '../generator/types'

export type { HumanPart, HumanStructure, MotifId, PrimitiveId }

export interface CompositionMetadata {
  id: string
  seed: number
  width: number
  height: number
  theme: string
  themeLabel: string
  configurationStatus: GeneratedComposition['configurationStatus']
  provenance: 'procedural-demonstration'
}

export interface MotifSpatialInformation {
  x: number
  y: number
  scale: number
  rotation: number
}

export interface PrimitiveCount {
  primitive: PrimitiveId
  count: number
}

export interface DeconstructedMotif {
  id: string
  motif: MotifId
  position: { x: number; y: number }
  scale: number
  rotation: number
  primitiveUsage: PrimitiveCount[]
  structure?: HumanStructure
}

export interface StructuralRelationship {
  motifInstanceId: string
  relation: 'composed-of'
  primitive: PrimitiveId
  occurrence: number
  part?: HumanPart
}

export interface DeconstructionResult {
  id: string
  metadata: CompositionMetadata
  motifs: DeconstructedMotif[]
  primitiveUsage: PrimitiveCount[]
  spatialInformation: Record<string, MotifSpatialInformation>
  structuralRelationships: StructuralRelationship[]
  grammarRulesInvolved: string[]
  sourceReferenceIds: string[]
}

export type ReconstructionResult =
  | { status: 'reconstructed'; composition: GeneratedComposition; validation: ValidationResult }
  | { status: 'invalid-structure'; validation: ValidationResult }
