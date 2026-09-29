import { validateGrammar } from '../grammar/validator'
import { compositionToGrammarSubject } from '../generator/generateComposition'
import { createSeededRandom, randomInteger } from '../generator/random'
import type { GeneratedComposition, GeneratedElement } from '../generator/types'
import type { DeconstructionResult, ReconstructionResult } from './types'

function expandPrimitiveUsage(deconstruction: DeconstructionResult['motifs'][number]['primitiveUsage']) {
  return deconstruction.flatMap(({ primitive, count }) => Array.from({ length: count }, () => primitive))
}

/** Rebuilds an SVG-ready composition from the serializable structural representation. */
export function reconstructComposition(deconstruction: DeconstructionResult, seed: number): ReconstructionResult {
  const candidateElements: GeneratedElement[] = deconstruction.motifs.map((motif) => ({
    id: motif.id,
    motif: motif.motif,
    x: motif.position.x,
    y: motif.position.y,
    scale: motif.scale,
    rotation: motif.rotation,
    metadata: {
      primitiveIds: expandPrimitiveUsage(motif.primitiveUsage),
      ...(motif.structure ? { humanStructure: { kind: 'human', parts: { ...motif.structure.parts } } } : {}),
    },
  }))

  const candidate: GeneratedComposition = {
    id: `reconstruction-${deconstruction.metadata.id}-${seed >>> 0}`,
    seed: seed >>> 0,
    width: deconstruction.metadata.width,
    height: deconstruction.metadata.height,
    theme: deconstruction.metadata.theme,
    themeLabel: deconstruction.metadata.themeLabel,
    configurationStatus: deconstruction.metadata.configurationStatus,
    elements: candidateElements,
    grammarRulesUsed: [...deconstruction.grammarRulesInvolved],
    sourceReferenceIds: [...deconstruction.sourceReferenceIds],
  }

  const initialValidation = validateGrammar(compositionToGrammarSubject(candidate))
  if (!initialValidation.valid) return { status: 'invalid-structure', validation: initialValidation }

  const random = createSeededRandom(seed)
  const elements = candidate.elements.map((element) => ({
    ...element,
    // Placement is a new seeded software arrangement; motif structures and renderer parameters are retained.
    x: randomInteger(random, 14, Math.max(14, candidate.width - 114)),
    y: randomInteger(random, 14, Math.max(14, candidate.height - 114)),
  }))
  const composition: GeneratedComposition = { ...candidate, elements }
  const validation = validateGrammar(compositionToGrammarSubject(composition))
  if (!validation.valid) return { status: 'invalid-structure', validation }

  return { status: 'reconstructed', composition, validation }
}
