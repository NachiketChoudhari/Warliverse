import { grammarRules, humanPartPrimitives } from '../data/grammar'
import { motifs } from '../data/motifs'
import { primitives } from '../data/primitives'

/** One place to inspect the configured software vocabulary and rule definitions. */
export const configuredGrammar = {
  provenance: {
    referenceMaterial: 'not-yet-added',
    softwareRepresentation: 'configured',
    generatedArtwork: 'not-implemented',
  },
  primitives,
  motifs,
  humanPartPrimitives,
  rules: grammarRules,
} as const
