import { grammarRules } from '../data/grammar'
import type { GrammarRule, GrammarSubject } from '../grammar/types'
import { generateScene, GENERATOR_CANVAS_SIZE } from './generateScene'
import type { CompositionGenerationResult, GeneratedComposition } from './types'

/** Builds the serializable composition record and its rule/source trace. */
export function generateComposition(seed: number, themeId: string): CompositionGenerationResult {
  const scene = generateScene(seed, themeId)
  if (scene.status !== 'generated') return scene

  const hasHumans = scene.elements.some(({ motif }) => motif === 'human')
  const usedRuleIds = [
    'motif.allowed',
    'theme.allowed-motifs',
    ...(hasHumans ? ['human.parts.required', 'human.part.primitive'] : []),
  ]
  const usedRules: readonly GrammarRule[] = grammarRules.filter(({ id }) => usedRuleIds.includes(id))
  const sourceReferenceIds = [...new Set(usedRules.flatMap(({ sourceReferenceIds: ids }) => ids ?? []))]

  const composition: GeneratedComposition = {
    id: `composition-${themeId}-${seed >>> 0}`,
    seed: seed >>> 0,
    width: GENERATOR_CANVAS_SIZE.width,
    height: GENERATOR_CANVAS_SIZE.height,
    theme: scene.theme.id,
    themeLabel: scene.theme.label,
    configurationStatus: 'prototype-demo',
    elements: scene.elements,
    grammarRulesUsed: usedRules.map(({ id }) => id),
    sourceReferenceIds,
  }
  return { status: 'generated', composition }
}

export function compositionToGrammarSubject(composition: GeneratedComposition): GrammarSubject {
  return {
    motifs: composition.elements.map((element) => ({
      motif: element.motif,
      ...(element.motif === 'human' && element.metadata?.humanStructure
        ? { structure: element.metadata.humanStructure.parts }
        : {}),
    })),
  }
}
