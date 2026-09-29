import { describe, expect, it } from 'vitest'
import { grammarRules } from '../data/grammar'
import { getGrammarEvidenceCounts } from '../data/grammarEvidence'
import { generateComposition } from '../generator'
import { validateGrammar } from '../grammar/validator'
import { generatePersonalizedVariations, selectPersonalizedVariation } from './generateVariations'
import { createPersonalizationExport, stringifyPersonalizationExport } from './exportPersonalization'
import { exportPersonalizedSvg } from './exportPersonalizedSvg'
import type { PersonalizedDesign } from './types'

function generatedVariations(productId = 'wall-art', themeId = 'demo-all-motifs', seed = 50) {
  const result = generatePersonalizedVariations(productId, themeId, seed)
  if (result.status !== 'generated') throw new Error(result.status === 'invalid-composition' ? result.validation.violations[0]?.message : result.message)
  return result.variations
}

describe('personalization generation and exports', () => {
  it('generates exactly four variations through the existing seeded generator', () => {
    const variations = generatedVariations()
    expect(variations).toHaveLength(4)
    expect(variations.map(({ seed }) => seed)).toEqual([51, 52, 53, 54])
    expect(variations.every(({ composition }) => composition.configurationStatus === 'prototype-demo')).toBe(true)
  })

  it('generates the same designs for the same product, layout, and base seed', () => {
    expect(generatedVariations('wall-art', 'demo-all-motifs', 700)).toEqual(generatedVariations('wall-art', 'demo-all-motifs', 700))
  })

  it('changes deterministic compositions when the base seed changes', () => {
    expect(generatedVariations('wall-art', 'demo-all-motifs', 700)[0].composition)
      .not.toEqual(generatedVariations('wall-art', 'demo-all-motifs', 701)[0].composition)
  })

  it('returns safe errors for unsupported product or layout selections', () => {
    expect(generatePersonalizedVariations('bad-product', 'demo-all-motifs', 5)).toMatchObject({ status: 'generation-failed' })
    expect(generatePersonalizedVariations('wall-art', 'not-a-layout', 5)).toMatchObject({ status: 'generation-failed' })
  })

  it('supports product selection and selected variation lookup', () => {
    const variations = generatedVariations('hotel-plate')
    expect(variations.every(({ productId }) => productId === 'hotel-plate')).toBe(true)
    expect(selectPersonalizedVariation(variations, variations[2].id)).toEqual(variations[2])
    expect(selectPersonalizedVariation(variations, 'missing')).toBeNull()
  })

  it('propagates composition grammar trace and validates each composition', () => {
    const variations = generatedVariations()
    const selected = variations[0]
    expect(selected.grammarTrace.rulesUsed.map(({ id }) => id)).toEqual(selected.composition.grammarRulesUsed)
    expect(selected.grammarTrace.primitiveUsage.length).toBeGreaterThan(0)
    expect(selected.grammarTrace.figureStructure).not.toBeNull()
    expect(selected.validation).toEqual(validateGrammar({ motifs: selected.composition.elements.map((element) => ({
      motif: element.motif,
      ...(element.motif === 'human' && element.metadata?.humanStructure ? { structure: element.metadata.humanStructure.parts } : {}),
    })) }))
    expect(selected.validation.valid).toBe(true)
  })

  it('reports source-backed rules only when configured source references resolve', () => {
    const trace = generatedVariations()[0].grammarTrace
    expect(trace.sourceBackedRules).toEqual([])
    expect(trace.rulesPendingDocumentation).toHaveLength(trace.rulesUsed.length)
    const linked = getGrammarEvidenceCounts([
      { ...grammarRules[0], sourceReferenceIds: ['source-test'] },
      grammarRules[1],
    ], [{ id: 'source-test', title: 'Test fixture only', sourceType: 'other', documentationStatus: 'pending-review' }])
    expect(linked.sourceBackedCount).toBe(1)
    expect(linked.pendingCount).toBe(1)
  })

  it('exports a deterministic versioned JSON payload without timestamps or session IDs', () => {
    const design = generatedVariations('phone-cover', 'demo-humans-trees', 900)[1]
    const first = stringifyPersonalizationExport(design)
    expect(first).toBe(stringifyPersonalizationExport(design))
    const parsed = JSON.parse(first) as Record<string, unknown>
    expect(parsed.schemaVersion).toBe(1)
    expect(parsed.sourceBackedRuleCount).toBe(0)
    expect(parsed.generatorVersion).toBe('seeded-procedural-v1')
    expect(first).not.toMatch(/generatedAt|timestamp|sessionId|userId/i)
    expect(createPersonalizationExport(design).variation).toEqual({ id: design.id, seed: design.seed })
  })

  it('exports readable vector SVG with product, layout, seed, and clipping metadata', () => {
    const design = generatedVariations('hotel-plate', 'demo-all-motifs', 333)[0]
    const svg = exportPersonalizedSvg(design, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 560"><defs><clipPath id="plate"><circle cx="280" cy="280" r="250" /></clipPath></defs><g clip-path="url(#plate)"><circle cx="280" cy="280" r="8" /></g></svg>')
    expect(svg).toContain('<?xml version="1.0"')
    expect(svg).toContain('<clipPath')
    expect(svg).toContain('hotel-plate')
    expect(svg).toContain('demo-all-motifs')
    expect(svg).toContain(`&quot;seed&quot;:${design.seed}`)
    expect(svg).toContain('<circle')
    expect(svg).not.toContain('<image')
  })

  it('blocks SVG export when a composition is invalid', () => {
    const design = generatedVariations()[0]
    const invalidDesign: PersonalizedDesign = { ...design, validation: { valid: false, violations: [{ ruleId: 'motif.allowed', code: 'unknown-motif', message: 'Test invalid structure.', motifIndex: 0 }] } }
    expect(() => exportPersonalizedSvg(invalidDesign, '<svg></svg>')).toThrow('Composition requires review before export.')
    expect(() => createPersonalizationExport(invalidDesign)).toThrow('Composition requires review before export.')
  })

  it('keeps all personalized compositions compatible with the existing generator and motif vocabulary', () => {
    const variations = generatedVariations('textile-border', 'demo-humans-trees', 22)
    const direct = generateComposition(23, 'demo-humans-trees')
    expect(direct.status).toBe('generated')
    if (direct.status === 'generated') expect(variations[0].composition).toEqual(direct.composition)
    expect(variations.flatMap(({ composition }) => composition.elements).every(({ motif }) => ['human', 'tree'].includes(motif))).toBe(true)
  })
})
