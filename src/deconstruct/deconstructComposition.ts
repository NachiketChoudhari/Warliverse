import { rendererPrimitiveUsage } from '../generator/generateScene'
import type { GeneratedComposition, GeneratedElement } from '../generator/types'
import type { DeconstructedMotif, DeconstructionResult, PrimitiveCount, StructuralRelationship } from './types'
import type { HumanPart, PrimitiveId } from '../grammar/types'

function countPrimitives(primitives: readonly PrimitiveId[]): PrimitiveCount[] {
  const counts = new Map<PrimitiveId, number>()
  primitives.forEach((primitive) => counts.set(primitive, (counts.get(primitive) ?? 0) + 1))
  return [...counts].map(([primitive, count]) => ({ primitive, count }))
}

function motifPrimitiveIds(element: GeneratedElement): readonly PrimitiveId[] {
  if (element.motif === 'human' && element.metadata?.humanStructure) {
    return Object.values(element.metadata.humanStructure.parts)
  }
  return element.metadata?.primitiveIds ?? rendererPrimitiveUsage[element.motif]
}

function motifRelationships(element: GeneratedElement, primitives: readonly PrimitiveId[]): StructuralRelationship[] {
  if (element.motif === 'human' && element.metadata?.humanStructure) {
    return (Object.entries(element.metadata.humanStructure.parts) as [HumanPart, PrimitiveId][]).map(([part, primitive], index) => ({
      motifInstanceId: element.id,
      relation: 'composed-of',
      primitive,
      occurrence: index + 1,
      part,
    }))
  }

  return primitives.map((primitive, index) => ({
    motifInstanceId: element.id,
    relation: 'composed-of',
    primitive,
    occurrence: index + 1,
  }))
}

/** Represents a structured procedural composition; no image analysis or inference is performed. */
export function deconstructComposition(composition: GeneratedComposition): DeconstructionResult {
  const motifs: DeconstructedMotif[] = composition.elements.map((element) => {
    const primitiveIds = motifPrimitiveIds(element)
    return {
      id: element.id,
      motif: element.motif,
      position: { x: element.x, y: element.y },
      scale: element.scale,
      rotation: element.rotation,
      primitiveUsage: countPrimitives(primitiveIds),
      ...(element.motif === 'human' && element.metadata?.humanStructure
        ? { structure: { kind: 'human' as const, parts: { ...element.metadata.humanStructure.parts } } }
        : {}),
    }
  })

  const allPrimitiveIds = motifs.flatMap((motif) => motif.primitiveUsage.flatMap(({ primitive, count }) => Array.from({ length: count }, () => primitive)))
  const spatialInformation = Object.fromEntries(motifs.map((motif) => [motif.id, {
    x: motif.position.x,
    y: motif.position.y,
    scale: motif.scale,
    rotation: motif.rotation,
  }]))

  return {
    id: `deconstruction-${composition.id}`,
    metadata: {
      id: composition.id,
      seed: composition.seed,
      width: composition.width,
      height: composition.height,
      theme: composition.theme,
      themeLabel: composition.themeLabel,
      configurationStatus: composition.configurationStatus,
      provenance: 'procedural-demonstration',
    },
    motifs,
    primitiveUsage: countPrimitives(allPrimitiveIds),
    spatialInformation,
    structuralRelationships: composition.elements.flatMap((element) => motifRelationships(element, motifPrimitiveIds(element))),
    grammarRulesInvolved: [...composition.grammarRulesUsed],
    sourceReferenceIds: [...composition.sourceReferenceIds],
  }
}
