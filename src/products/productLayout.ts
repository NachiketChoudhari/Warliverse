import { products } from '../data/products'
import type { GeneratedComposition } from '../generator/types'
import type { ProductConfiguration, ProductId, ProductLayoutComposition, ProductLayoutResult } from './types'

export function isProductId(value: string): value is ProductId {
  return products.some(({ id }) => id === value)
}

export function getProduct(productId: string): ProductConfiguration | null {
  return products.find(({ id }) => id === productId) ?? null
}

/** Uniformly maps an existing composition into a product safe area. Textile layouts tile the same mapped arrangement. */
export function mapCompositionToProductLayout(productId: string, composition: GeneratedComposition): ProductLayoutResult {
  const product = getProduct(productId)
  if (!product) {
    return { status: 'unsupported-layout', productId, message: 'No product layout is configured for this selection.' }
  }

  const safe = product.safeArea
  const repeatCount = product.preview.repeatCount ?? 1
  const isTallCover = product.shape === 'rounded-rectangle'
  const scaleX = isTallCover ? safe.width / composition.width : safe.width / (composition.width * repeatCount)
  const scaleY = safe.height / composition.height
  const scale = Math.min(scaleX, scaleY)
  const fittedWidth = composition.width * scale
  const fittedHeight = composition.height * scale
  const anchorBounds = isTallCover && composition.elements.length > 0 ? {
    minX: Math.min(...composition.elements.map(({ x }) => x)),
    maxX: Math.max(...composition.elements.map(({ x }) => x)),
    minY: Math.min(...composition.elements.map(({ y }) => y)),
    maxY: Math.max(...composition.elements.map(({ y }) => y)),
  } : null
  const offsetX = anchorBounds
    ? safe.x + (safe.width - ((anchorBounds.maxX - anchorBounds.minX) * scaleX + 100 * scale)) / 2 - anchorBounds.minX * scaleX
    : safe.x + (safe.width - fittedWidth * repeatCount) / 2
  const offsetY = anchorBounds
    ? safe.y + (safe.height - ((anchorBounds.maxY - anchorBounds.minY) * scaleY + 100 * scale)) / 2 - anchorBounds.minY * scaleY
    : safe.y + (safe.height - fittedHeight) / 2
  const elements = Array.from({ length: repeatCount }, (_, repeatIndex) => composition.elements.map((element) => ({
    id: repeatCount > 1 ? `${element.id}-repeat-${repeatIndex + 1}` : element.id,
    motif: element.motif,
    x: offsetX + repeatIndex * composition.width * scaleX + element.x * (isTallCover ? scaleX : scale),
    y: offsetY + element.y * (isTallCover ? scaleY : scale),
    scale: element.scale * scale,
    rotation: element.rotation,
  }))).flat()

  const layout: ProductLayoutComposition = {
    productId: product.id,
    layoutType: product.layoutType,
    width: product.canvas.width,
    height: product.canvas.height,
    elements,
    clipShape: product.preview.clipShape,
    clipId: `clip-${product.id}-${composition.id}`,
    repeatCount,
  }
  return { status: 'mapped', layout }
}
