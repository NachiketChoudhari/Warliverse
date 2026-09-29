import { describe, expect, it } from 'vitest'
import { humanPartPrimitives } from '../data/grammar'
import { primitives } from '../data/primitives'
import { measureCompositionDensity, measureMotifCount, measurePrimitiveCount } from './metrics'
import { validateGrammar } from './validator'

describe('configured grammar', () => {
  it('exposes the configured primitive vocabulary', () => {
    expect(primitives.map(({ id }) => id)).toEqual(['circle', 'triangle', 'line'])
    expect(primitives.every(({ representationStatus }) => representationStatus === 'configured')).toBe(true)
  })

  it('represents a human as named parts linked to primitives', () => {
    expect(humanPartPrimitives).toEqual({
      head: 'circle',
      body: 'triangle',
      leftArm: 'line',
      rightArm: 'line',
      leftLeg: 'line',
      rightLeg: 'line',
    })
  })

  it('accepts a complete configured human structure', () => {
    expect(validateGrammar({ motifs: [{ motif: 'human', structure: humanPartPrimitives }] })).toEqual({ valid: true, violations: [] })
  })

  it('reports a missing part and unknown motif', () => {
    const result = validateGrammar({ motifs: [{ motif: 'human', structure: { head: 'circle' } }, { motif: 'unknown-motif' }] })
    expect(result.valid).toBe(false)
    expect(result.violations.map(({ code }) => code)).toContain('missing-part')
    expect(result.violations.map(({ code }) => code)).toContain('unknown-motif')
  })

  it('reports a human part mapped to the wrong configured primitive', () => {
    const result = validateGrammar({ motifs: [{ motif: 'human', structure: { ...humanPartPrimitives, body: 'circle' } }] })
    expect(result.valid).toBe(false)
    expect(result.violations).toContainEqual(expect.objectContaining({ code: 'invalid-primitive', part: 'body' }))
  })

  it('counts represented items and marks unsupported measurements not configured', () => {
    const subject = { motifs: [{ motif: 'human', structure: humanPartPrimitives }] }
    expect(measureMotifCount(subject)).toMatchObject({ status: 'configured', value: 1, unit: 'motifs' })
    expect(measurePrimitiveCount(subject)).toMatchObject({ status: 'configured', value: 6, unit: 'primitives' })
    expect(measureCompositionDensity()).toMatchObject({ status: 'not-configured', key: 'composition-density' })
  })
})
