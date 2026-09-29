import { referenceCollection } from '../data/referenceCollection'
import { grammarRules } from '../data/grammar'
import { getGrammarEvidenceCounts } from '../data/grammarEvidence'
import { humanPartPrimitives } from '../data/grammar'
import { demoThemes, deriveVariationSeeds, generateComposition, compositionToGrammarSubject } from '../generator'
import { validateGrammar } from '../grammar/validator'
import { isProductId, type ProductId } from '../products'
import type { GeneratedComposition } from '../generator/types'
import type { PersonalizationGrammarTrace, PersonalizedDesign, PersonalizedVariationsResult } from './types'

const usedPrimitivesOrder = ['circle', 'triangle', 'line'] as const

export function createPersonalizationGrammarTrace(composition: GeneratedComposition, themeId: string): PersonalizationGrammarTrace {
  const theme = demoThemes.find(({ id }) => id === themeId)
  const rulesUsed = grammarRules.filter(({ id }) => composition.grammarRulesUsed.includes(id))
  const evidence = getGrammarEvidenceCounts(rulesUsed, referenceCollection.sources)
  const primitiveCounts = new Map<string, number>()
  composition.elements.forEach((element) => element.metadata?.primitiveIds.forEach((primitive) => {
    primitiveCounts.set(primitive, (primitiveCounts.get(primitive) ?? 0) + 1)
  }))
  const firstHuman = composition.elements.find(({ motif }) => motif === 'human')
  const sourceReferenceIds = [...new Set(evidence.backedRules.flatMap(({ sourceReferenceIds: ids }) => ids ?? []))].sort()

  return {
    primitiveUsage: usedPrimitivesOrder.flatMap((primitive) => {
      const count = primitiveCounts.get(primitive) ?? 0
      return count > 0 ? [{ primitive, count }] : []
    }),
    figureStructure: firstHuman?.metadata?.humanStructure ?? (theme?.allowedMotifs.includes('human') ? { kind: 'human', parts: { ...humanPartPrimitives } } : null),
    compositionConstraints: {
      allowedMotifs: theme?.allowedMotifs ?? [],
      elementCount: composition.elements.length,
      configuredElementRange: { minimum: theme?.minElements ?? 0, maximum: theme?.maxElements ?? 0 },
    },
    rulesUsed,
    sourceBackedRules: evidence.backedRules.map(({ id }) => id),
    rulesPendingDocumentation: rulesUsed.filter(({ id }) => !evidence.backedRules.some((rule) => rule.id === id)).map(({ id }) => id),
    sourceReferenceIds,
  }
}

export function generatePersonalizedVariations(productId: string, themeId: string, baseSeed: number): PersonalizedVariationsResult {
  if (!isProductId(productId)) return { status: 'generation-failed', message: 'Select a configured product to continue.' }
  if (!demoThemes.some(({ id }) => id === themeId)) return { status: 'generation-failed', message: 'No configured layouts are currently available for this selection.' }
  if (!Number.isSafeInteger(baseSeed) || baseSeed < 0 || baseSeed > 0xffff_ffff) {
    return { status: 'generation-failed', message: 'Enter a whole-number seed from 0 to 4294967295.' }
  }

  const seeds = deriveVariationSeeds(baseSeed, 4)
  const variations: PersonalizedDesign[] = []
  for (const [index, seed] of seeds.entries()) {
    const generated = generateComposition(seed, themeId)
    if (generated.status !== 'generated') return { status: 'generation-failed', message: generated.message }
    const composition = generated.composition
    const validation = validateGrammar(compositionToGrammarSubject(composition))
    const design: PersonalizedDesign = {
      id: `design-${productId}-${themeId}-${seed}`,
      seed,
      composition,
      productId: productId as ProductId,
      themeId,
      themeLabel: demoThemes.find(({ id }) => id === themeId)?.label ?? themeId,
      grammarTrace: createPersonalizationGrammarTrace(composition, themeId),
      validation,
    }
    if (!validation.valid) return { status: 'invalid-composition', variationNumber: index + 1, design, validation }
    variations.push(design)
  }
  return { status: 'generated', variations }
}

export function selectPersonalizedVariation(variations: readonly PersonalizedDesign[], selectedId: string): PersonalizedDesign | null {
  return variations.find(({ id }) => id === selectedId) ?? null
}
