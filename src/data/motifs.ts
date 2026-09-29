import type { MotifDefinition } from '../grammar/types'

// These entries define what the prototype can represent, not a claim about historical usage.
export const motifs = [
  { id: 'human', label: 'Human', representationStatus: 'configured', referenceStatus: 'not-documented-in-project' },
  { id: 'tree', label: 'Tree', representationStatus: 'configured', referenceStatus: 'not-documented-in-project' },
  { id: 'hut', label: 'Hut', representationStatus: 'configured', referenceStatus: 'not-documented-in-project' },
  { id: 'animal', label: 'Animal', representationStatus: 'configured', referenceStatus: 'not-documented-in-project' },
  { id: 'sun', label: 'Sun', representationStatus: 'configured', referenceStatus: 'not-documented-in-project' },
] as const satisfies readonly MotifDefinition[]
