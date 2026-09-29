import { describe, expect, it } from 'vitest'
import { humanPartPrimitives } from '../data/grammar'
import { motifs } from '../data/motifs'
import { primitives } from '../data/primitives'
import { validateGrammar } from '../grammar/validator'
import { compositionToGrammarSubject, generateComposition } from './generateComposition'
import { generateHuman, generateHumanMetadata } from './generateHuman'
import { deriveVariationSeeds } from './random'
import type { GeneratedComposition } from './types'

function composition(seed: number, theme = 'demo-all-motifs'): GeneratedComposition {
  const result = generateComposition(seed, theme)
  if (result.status !== 'generated') throw new Error(result.message)
  return result.composition
}

describe('procedural composition generator', () => {
  it('produces the same composition for the same seed and theme', () => {
    expect(composition(12345)).toEqual(composition(12345))
  })

  it('produces different compositions for different seeds', () => {
    expect(composition(12345)).not.toEqual(composition(12346))
  })

  it('uses only motif IDs from the configured vocabulary and selected allow-list', () => {
    const generated = composition(12345, 'demo-humans-trees')
    const configuredIds = new Set(motifs.map(({ id }) => id))
    expect(generated.elements.length).toBeGreaterThan(0)
    expect(generated.elements.every(({ motif }) => configuredIds.has(motif))).toBe(true)
    expect(generated.elements.every(({ motif }) => motif === 'human' || motif === 'tree')).toBe(true)
  })

  it('builds human structure from the configured primitive mapping', () => {
    const human = generateHuman()
    const metadata = generateHumanMetadata()
    const configuredPrimitiveIds = new Set(primitives.map(({ id }) => id))
    expect(human.structure).toEqual(humanPartPrimitives)
    expect(metadata.humanStructure?.parts).toEqual(humanPartPrimitives)
    expect(metadata.primitiveIds.every((primitive) => configuredPrimitiveIds.has(primitive))).toBe(true)
  })

  it('serializes compositions to JSON', () => {
    const generated = composition(12345)
    const serialized = JSON.stringify(generated)
    expect(JSON.parse(serialized)).toEqual(generated)
  })

  it('passes generated structured motifs through the existing grammar validator', () => {
    expect(validateGrammar(compositionToGrammarSubject(composition(12345)))).toEqual({ valid: true, violations: [] })
  })

  it('returns a safe unsupported-theme result for an unconfigured theme', () => {
    expect(generateComposition(12345, 'unconfigured-theme')).toMatchObject({
      status: 'unsupported-theme',
      themeId: 'unconfigured-theme',
    })
  })

  it('derives four distinct variation seeds deterministically', () => {
    expect(deriveVariationSeeds(12345)).toEqual([12346, 12347, 12348, 12349])
  })
})
