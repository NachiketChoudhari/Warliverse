import { demoThemes } from '../generator'
import { getProduct } from '../products'
import type { PersonalizedDesign } from './types'

export const PERSONALIZATION_GENERATOR_VERSION = 'seeded-procedural-v1' as const

function assertExportable(design: PersonalizedDesign): void {
  if (!design.validation.valid) throw new Error('Composition requires review before export.')
}

export function createPersonalizationExport(design: PersonalizedDesign) {
  assertExportable(design)
  const product = getProduct(design.productId)
  const theme = demoThemes.find(({ id }) => id === design.themeId)
  return {
    schemaVersion: 1 as const,
    product: product ? { id: product.id, name: product.name, description: product.description, canvas: product.canvas, shape: product.shape } : { id: design.productId },
    layout: {
      id: design.themeId,
      label: design.themeLabel,
      type: product?.layoutType ?? 'unsupported',
      configurationStatus: theme?.configurationStatus ?? design.composition.configurationStatus,
    },
    variation: { id: design.id, seed: design.seed },
    composition: design.composition,
    grammarTrace: {
      primitiveUsage: design.grammarTrace.primitiveUsage,
      figureStructure: design.grammarTrace.figureStructure,
      compositionConstraints: design.grammarTrace.compositionConstraints,
      rulesUsed: design.grammarTrace.rulesUsed.map(({ id, description }) => ({ id, description })),
      sourceBackedRules: design.grammarTrace.sourceBackedRules,
      rulesPendingDocumentation: design.grammarTrace.rulesPendingDocumentation,
      sourceReferenceIds: design.grammarTrace.sourceReferenceIds,
    },
    sourceBackedRuleCount: design.grammarTrace.sourceBackedRules.length,
    documentationStatus: design.grammarTrace.sourceBackedRules.length === 0 ? 'pending-source-documentation' : 'source-references-configured',
    generatorVersion: PERSONALIZATION_GENERATOR_VERSION,
  }
}

export function stringifyPersonalizationExport(design: PersonalizedDesign): string {
  return `${JSON.stringify(createPersonalizationExport(design), null, 2)}\n`
}

export function downloadPersonalizationJson(design: PersonalizedDesign): void {
  assertExportable(design)
  const blob = new Blob([stringifyPersonalizationExport(design)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `warliverse-${design.productId}-seed-${design.seed}.json`
  link.click()
  URL.revokeObjectURL(url)
}
