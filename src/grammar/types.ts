export type PrimitiveId = 'circle' | 'triangle' | 'line'

export type MotifId = 'human' | 'tree' | 'hut' | 'animal' | 'sun'

export type HumanPart =
  | 'head'
  | 'body'
  | 'leftArm'
  | 'rightArm'
  | 'leftLeg'
  | 'rightLeg'

export interface PrimitiveDefinition {
  id: PrimitiveId
  label: string
  shape: 'circle' | 'triangle' | 'line'
  representationStatus: 'configured'
  referenceStatus: 'not-documented-in-project'
}

export interface MotifDefinition {
  id: MotifId
  label: string
  representationStatus: 'configured'
  referenceStatus: 'not-documented-in-project'
}

export interface HumanStructure {
  kind: 'human'
  parts: Record<HumanPart, PrimitiveId>
}

/** SVG geometry values are renderer coordinates, not cultural measurements. */
export interface Point2D {
  x: number
  y: number
}

export interface LineSegment {
  start: Point2D
  end: Point2D
}

export interface HumanFigureGeometry {
  head?: { center: Point2D; radius: number }
  body?: readonly [Point2D, Point2D, Point2D]
  leftArm?: readonly LineSegment[]
  rightArm?: readonly LineSegment[]
  leftLeg?: readonly LineSegment[]
  rightLeg?: readonly LineSegment[]
}

export interface MotifInstance {
  motif: MotifId | string
  structure?: Partial<Record<HumanPart, PrimitiveId | string>>
}

export interface GrammarSubject {
  motifs: readonly MotifInstance[]
}

export interface GrammarRule {
  id: string
  description: string
  source: 'project-configuration'
  check: 'allowed-motif' | 'required-human-parts' | 'human-part-primitive' | 'theme-allowed-motifs'
  sourceReferenceIds?: readonly string[]
}

export interface GrammarViolation {
  ruleId: string
  code: 'unknown-motif' | 'missing-human-structure' | 'missing-part' | 'invalid-primitive'
  message: string
  motifIndex: number
  part?: HumanPart
}

export interface ValidationResult {
  valid: boolean
  violations: GrammarViolation[]
}

export type MetricKey =
  | 'head-body-ratio'
  | 'limb-angle'
  | 'primitive-count'
  | 'motif-count'
  | 'composition-density'

export type MetricResult =
  | { status: 'configured'; key: MetricKey; value: number; unit: string }
  | { status: 'not-configured'; key: MetricKey; reason: string }

export interface Position {
  x: number
  y: number
}

export interface TransformProps {
  position?: Position
  scale?: number
  rotation?: number
  strokeWidth?: number
  opacity?: number
  className?: string
}

export type CanvasElement = TransformProps & {
  id: string
  kind: MotifId
}
