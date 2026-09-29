import { humanPartPrimitives } from '../data/grammar'
import type { MotifInstance } from '../grammar/types'
import type { GeneratedElementMetadata } from './types'

/** Returns the configured structural data consumed by the existing HumanFigure SVG renderer. */
export function generateHuman(): MotifInstance & { motif: 'human'; structure: typeof humanPartPrimitives } {
  return { motif: 'human', structure: { ...humanPartPrimitives } }
}

export function generateHumanMetadata(): GeneratedElementMetadata {
  return {
    primitiveIds: Object.values(humanPartPrimitives),
    humanStructure: { kind: 'human', parts: { ...humanPartPrimitives } },
  }
}
