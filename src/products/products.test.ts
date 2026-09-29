import { describe, expect, it } from 'vitest'
import { generateComposition } from '../generator'
import { getProduct, isProductId, mapCompositionToProductLayout } from './productLayout'
import { products } from '../data/products'

function demoComposition(seed = 171): NonNullable<ReturnType<typeof compositionValue>> {
  return compositionValue(seed)
}

function compositionValue(seed: number) {
  const result = generateComposition(seed, 'demo-all-motifs')
  if (result.status !== 'generated') throw new Error(result.message)
  return result.composition
}

describe('personalization product layouts', () => {
  it('defines four deterministic product configurations with safe areas', () => {
    expect(products.map(({ id }) => id)).toEqual(['wall-art', 'hotel-plate', 'phone-cover', 'textile-border'])
    products.forEach(({ canvas, safeArea }) => {
      expect(safeArea.x).toBeGreaterThanOrEqual(0)
      expect(safeArea.y).toBeGreaterThanOrEqual(0)
      expect(safeArea.x + safeArea.width).toBeLessThanOrEqual(canvas.width)
      expect(safeArea.y + safeArea.height).toBeLessThanOrEqual(canvas.height)
    })
  })

  it('validates product IDs and resolves product selection', () => {
    expect(isProductId('wall-art')).toBe(true)
    expect(isProductId('unknown')).toBe(false)
    expect(getProduct('phone-cover')?.name).toBe('Phone Cover')
    expect(getProduct('unknown')).toBeNull()
  })

  it('uniformly maps a composition into the wall art safe area', () => {
    const source = demoComposition()
    const result = mapCompositionToProductLayout('wall-art', source)
    expect(result.status).toBe('mapped')
    if (result.status !== 'mapped') return
    const product = getProduct('wall-art')
    expect(result.layout.width).toBe(product?.canvas.width)
    expect(result.layout.height).toBe(product?.canvas.height)
    expect(result.layout.elements[0].scale).toBeLessThan(source.elements[0].scale)
    expect(result.layout.repeatCount).toBe(1)
  })

  it('maps hotel plate output through a circular clip', () => {
    const result = mapCompositionToProductLayout('hotel-plate', demoComposition())
    expect(result.status).toBe('mapped')
    if (result.status === 'mapped') expect(result.layout.clipShape).toBe('circle')
  })

  it('uses a tall portrait canvas and centered safe area for a phone cover', () => {
    const source = demoComposition()
    const result = mapCompositionToProductLayout('phone-cover', source)
    const product = getProduct('phone-cover')
    expect(product && product.canvas.height / product.canvas.width).toBeGreaterThan(2)
    expect(result.status).toBe('mapped')
    if (result.status === 'mapped') {
      expect(result.layout.clipShape).toBe('rounded-rectangle')
      expect(result.layout.repeatCount).toBe(1)
      const sourceY = source.elements.map(({ y }) => y)
      const outputY = result.layout.elements.map(({ y }) => y)
      const sourceSpan = Math.max(...sourceY) - Math.min(...sourceY)
      const outputSpan = Math.max(...outputY) - Math.min(...outputY)
      expect(outputSpan).toBeGreaterThan(sourceSpan)
      const safeCenterY = (product?.safeArea.y ?? 0) + (product?.safeArea.height ?? 0) / 2
      const localMotifExtent = 100 * result.layout.elements[0].scale / source.elements[0].scale
      expect((Math.min(...outputY) + Math.max(...outputY) + localMotifExtent) / 2).toBeCloseTo(safeCenterY, 0)
      expect(Math.min(...outputY)).toBeGreaterThanOrEqual(product?.safeArea.y ?? 0)
      expect(Math.max(...outputY) + localMotifExtent).toBeLessThanOrEqual((product?.safeArea.y ?? 0) + (product?.safeArea.height ?? 0))
    }
  })

  it('maps textile border to a wide repeated horizontal layout', () => {
    const result = mapCompositionToProductLayout('textile-border', demoComposition())
    expect(result.status).toBe('mapped')
    if (result.status === 'mapped') {
      expect(result.layout.layoutType).toBe('horizontal')
      expect(result.layout.repeatCount).toBeGreaterThan(1)
      expect(result.layout.elements.length).toBeGreaterThan(demoComposition().elements.length)
    }
  })

  it('safely rejects an unsupported product layout', () => {
    expect(mapCompositionToProductLayout('not-configured', demoComposition())).toMatchObject({ status: 'unsupported-layout' })
  })
})
