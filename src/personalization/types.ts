import type { GrammarRule, HumanStructure, PrimitiveId, ValidationResult } from '../grammar/types'
import type { GeneratedComposition } from '../generator/types'
import type { ProductId } from '../products/types'

export interface PrimitiveUsageCount {
  primitive: PrimitiveId
  count: number
}

export interface PersonalizationGrammarTrace {
  primitiveUsage: PrimitiveUsageCount[]
  figureStructure: HumanStructure | null
  compositionConstraints: {
    allowedMotifs: readonly string[]
    elementCount: number
    configuredElementRange: { minimum: number; maximum: number }
  }
  rulesUsed: readonly GrammarRule[]
  sourceBackedRules: readonly string[]
  rulesPendingDocumentation: readonly string[]
  sourceReferenceIds: readonly string[]
}

export interface PersonalizedDesign {
  id: string
  seed: number
  composition: GeneratedComposition
  productId: ProductId
  themeId: string
  themeLabel: string
  grammarTrace: PersonalizationGrammarTrace
  validation: ValidationResult
}

export interface PersonalizationExportMetadata {
  schemaVersion: 1
  generatorVersion: 'seeded-procedural-v1'
}

export interface PersonalizationSession {
  productId: ProductId | null
  selectedThemeId: string | null
  variationSeeds: readonly number[]
  generatedVariations: readonly PersonalizedDesign[]
  selectedVariationId: string | null
  grammarTrace: PersonalizationGrammarTrace | null
  exportMetadata: PersonalizationExportMetadata
}

export type PersonalizedVariationsResult =
  | { status: 'generated'; variations: PersonalizedDesign[] }
  | { status: 'generation-failed'; message: string }
  | { status: 'invalid-composition'; variationNumber: number; design: PersonalizedDesign; validation: ValidationResult }
