import { describe, expect, it } from 'vitest'
import { generateComposition, compositionToGrammarSubject } from '../generator/generateComposition'
import { validateGrammar } from '../grammar/validator'
import type { DeconstructionResult } from './types'
import { deconstructComposition } from './deconstructComposition'
import { reconstructComposition } from './reconstructComposition'

function generatedComposition() {
  const result = generateComposition(24680, 'demo-all-motifs')
  if (result.status !== 'generated') throw new Error(result.message)
  return result.composition
}

function deconstructedComposition(): DeconstructionResult {
  return deconstructComposition(generatedComposition())
}

function primitiveCounts(result: DeconstructionResult) {
  return Object.fromEntries(result.primitiveUsage.map(({ primitive, count }) => [primitive, count]))
}

describe('deconstruct and reconstruct pipeline', () => {
  it('deconstructs an existing generated composition without treating it as a reference artwork', () => {
    const result = deconstructedComposition()
    expect(result.metadata.provenance).toBe('procedural-demonstration')
    expect(result.metadata.id).toBe(generatedComposition().id)
  })

  it('preserves motif IDs and spatial information during deconstruction', () => {
    const source = generatedComposition()
    const result = deconstructComposition(source)
    expect(result.motifs.map(({ motif }) => motif)).toEqual(source.elements.map(({ motif }) => motif))
    expect(result.motifs.map(({ id, position }) => [id, position.x, position.y])).toEqual(source.elements.map(({ id, x, y }) => [id, x, y]))
  })

  it('preserves primitive usage from renderer metadata', () => {
    const source = generatedComposition()
    const result = deconstructComposition(source)
    const expected: Record<string, number> = {}
    source.elements.forEach((element) => element.metadata?.primitiveIds.forEach((primitive) => {
      expected[primitive] = (expected[primitive] ?? 0) + 1
    }))
    expect(primitiveCounts(result)).toEqual(expected)
  })

  it('preserves configured human structure and named primitive relationships', () => {
    const source = generatedComposition()
    const result = deconstructComposition(source)
    const originalHuman = source.elements.find(({ motif }) => motif === 'human')
    const representedHuman = result.motifs.find(({ motif }) => motif === 'human')
    expect(representedHuman?.structure).toEqual(originalHuman?.metadata?.humanStructure)
    expect(result.structuralRelationships.filter(({ motifInstanceId }) => motifInstanceId === representedHuman?.id)).toHaveLength(6)
    expect(result.structuralRelationships.some(({ part, primitive }) => part === 'head' && primitive === 'circle')).toBe(true)
  })

  it('reconstructs a valid composition with the same motif types and human structures', () => {
    const structure = deconstructedComposition()
    const result = reconstructComposition(structure, 98765)
    expect(result.status).toBe('reconstructed')
    if (result.status !== 'reconstructed') return
    expect(result.composition.elements.map(({ motif }) => motif)).toEqual(structure.motifs.map(({ motif }) => motif))
    expect(result.composition.elements.find(({ motif }) => motif === 'human')?.metadata?.humanStructure)
      .toEqual(structure.motifs.find(({ motif }) => motif === 'human')?.structure)
    expect(primitiveCounts(deconstructComposition(result.composition))).toEqual(primitiveCounts(structure))
  })

  it('keeps the deconstruction and reconstruction JSON serializable', () => {
    const result = reconstructComposition(deconstructedComposition(), 54321)
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it('passes reconstructed structures through the existing grammar validator', () => {
    const result = reconstructComposition(deconstructedComposition(), 112233)
    expect(result.status).toBe('reconstructed')
    if (result.status !== 'reconstructed') return
    expect(validateGrammar(compositionToGrammarSubject(result.composition))).toEqual({ valid: true, violations: [] })
    expect(result.validation.valid).toBe(true)
  })

  it('detects invalid configured human mappings during reconstruction', () => {
    const structure = deconstructedComposition()
    const invalid: DeconstructionResult = {
      ...structure,
      motifs: structure.motifs.map((motif) => motif.motif === 'human' && motif.structure
        ? { ...motif, structure: { ...motif.structure, parts: { ...motif.structure.parts, body: 'circle' } } }
        : motif),
    }
    const result = reconstructComposition(invalid, 112233)
    expect(result.status).toBe('invalid-structure')
    if (result.status === 'invalid-structure') {
      expect(result.validation.violations).toContainEqual(expect.objectContaining({ code: 'invalid-primitive', part: 'body' }))
    }
  })
})
