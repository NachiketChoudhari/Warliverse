import type { HumanStructure, MotifId, PrimitiveId } from '../grammar/types'

export interface GeneratedElementMetadata {
  /** Renderer-level software configuration; this is not a source-derived observation. */
  primitiveIds: readonly PrimitiveId[]
  humanStructure?: HumanStructure
}

export interface GeneratedElement {
  id: string
  motif: MotifId
  x: number
  y: number
  scale: number
  rotation: number
  metadata?: GeneratedElementMetadata
}

export interface GeneratedComposition {
  id: string
  seed: number
  width: number
  height: number
  theme: string
  themeLabel: string
  configurationStatus: 'prototype-demo'
  elements: GeneratedElement[]
  grammarRulesUsed: string[]
  sourceReferenceIds: string[]
}

export interface DemoThemeConfiguration {
  id: string
  label: string
  description: string
  configurationStatus: 'prototype-demo'
  allowedMotifs: readonly MotifId[]
  minElements: number
  maxElements: number
}

export type SceneGenerationResult =
  | { status: 'generated'; theme: DemoThemeConfiguration; elements: GeneratedElement[] }
  | { status: 'unsupported-theme'; themeId: string; message: string }

export type CompositionGenerationResult =
  | { status: 'generated'; composition: GeneratedComposition }
  | { status: 'unsupported-theme'; themeId: string; message: string }
