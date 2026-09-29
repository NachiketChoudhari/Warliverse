import type { GeneratedComposition } from '../generator/types'

export type ProductId = 'wall-art' | 'hotel-plate' | 'phone-cover' | 'textile-border'
export type LayoutType = 'portrait' | 'square' | 'circular' | 'horizontal'
export type ProductShape = 'framed-rectangle' | 'circle' | 'rounded-rectangle' | 'textile-strip'

export interface ProductSafeArea {
  x: number
  y: number
  width: number
  height: number
}

export interface ProductPreviewConfiguration {
  clipShape: 'rect' | 'circle' | 'rounded-rectangle'
  frameInset: number
  frameRadius?: number
  background: string
  repeatCount?: number
}

export interface ProductConfiguration {
  id: ProductId
  name: string
  description: string
  aspectRatio: string
  /** Preview-renderer units only; these are not physical product measurements. */
  canvas: { width: number; height: number }
  /** Configured interface margins in renderer units, not research measurements. */
  safeArea: ProductSafeArea
  shape: ProductShape
  layoutType: LayoutType
  preview: ProductPreviewConfiguration
}

export interface ProductLayoutElement {
  id: string
  motif: GeneratedComposition['elements'][number]['motif']
  x: number
  y: number
  scale: number
  rotation: number
}

export interface ProductLayoutComposition {
  productId: ProductId
  layoutType: LayoutType
  width: number
  height: number
  elements: ProductLayoutElement[]
  clipShape: ProductPreviewConfiguration['clipShape']
  clipId: string
  repeatCount: number
}

export type ProductLayoutResult =
  | { status: 'mapped'; layout: ProductLayoutComposition }
  | { status: 'unsupported-layout'; productId: string; message: string }
