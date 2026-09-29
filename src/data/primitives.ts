import type { PrimitiveDefinition } from '../grammar/types'

// Shape names are the current software vocabulary; project reference sources have not been added yet.
export const primitives = [
  { id: 'circle', label: 'Circle', shape: 'circle', representationStatus: 'configured', referenceStatus: 'not-documented-in-project' },
  { id: 'triangle', label: 'Triangle', shape: 'triangle', representationStatus: 'configured', referenceStatus: 'not-documented-in-project' },
  { id: 'line', label: 'Line', shape: 'line', representationStatus: 'configured', referenceStatus: 'not-documented-in-project' },
] as const satisfies readonly PrimitiveDefinition[]
