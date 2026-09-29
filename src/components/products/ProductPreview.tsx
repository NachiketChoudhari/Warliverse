import { WarliCanvas } from '../warli/WarliCanvas'
import { mapCompositionToProductLayout } from '../../products/productLayout'
import type { ProductConfiguration } from '../../products/types'
import type { GeneratedComposition } from '../../generator/types'
import type { PersonalizedDesign, PersonalizationGrammarTrace } from '../../personalization/types'

export function ProductPreview({ product, composition, variation, grammarTrace, instanceKey = 'preview' }: {
  product: ProductConfiguration
  composition: GeneratedComposition
  variation: PersonalizedDesign
  grammarTrace: PersonalizationGrammarTrace
  instanceKey?: string
}) {
  const mapped = mapCompositionToProductLayout(product.id, composition)
  if (mapped.status !== 'mapped') return <p role="alert" className="border border-line p-4 text-sm text-terracotta">{mapped.message}</p>
  const { layout } = mapped
  const { width, height } = product.canvas
  const elements = layout.elements.map((element) => ({
    id: element.id,
    kind: element.motif,
    position: { x: element.x, y: element.y },
    scale: element.scale,
    rotation: element.rotation,
  }))
  const frame = product.preview.frameInset
  const clipId = `${layout.clipId}-${instanceKey}`
  const clipUrl = `url(#${clipId})`

  return <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} color="#29251f" role="img" aria-label={`${product.name} procedural design, seed ${variation.seed}`} className="block h-auto w-full">
    <title>{`${product.name} · ${variation.themeLabel} · seed ${variation.seed}`}</title>
    <desc>Procedural composition preview. {grammarTrace.sourceBackedRules.length} source-backed rules. Layout type: {layout.layoutType}.</desc>
    <metadata>{JSON.stringify({ productId: product.id, layoutType: layout.layoutType, variationId: variation.id, seed: variation.seed })}</metadata>
    <defs>
      <clipPath id={clipId}>
        {layout.clipShape === 'circle'
          ? <circle cx={width / 2} cy={height / 2} r={width / 2 - frame} />
          : layout.clipShape === 'rounded-rectangle'
            ? <rect x={frame} y={frame} width={width - frame * 2} height={height - frame * 2} rx={product.preview.frameRadius ?? 24} />
            : <rect x={frame} y={frame} width={width - frame * 2} height={height - frame * 2} />}
      </clipPath>
    </defs>
    <rect width={width} height={height} fill={product.preview.background} />
    {product.shape === 'circle' && <circle cx={width / 2} cy={height / 2} r={width / 2 - 8} fill="#f0ece3" stroke="#554b3e" strokeWidth="3" />}
    {product.shape === 'rounded-rectangle' && <rect x="3" y="3" width={width - 6} height={height - 6} rx={product.preview.frameRadius ?? 24} fill="#36322d" stroke="#171613" strokeWidth="5" />}
    <WarliCanvas elements={elements} width={width} height={height} clipPath={clipUrl} className="block h-full w-full" label={`${product.name} composition`} />
    {product.shape === 'framed-rectangle' && <>
      <rect x="3" y="3" width={width - 6} height={height - 6} fill="none" stroke="#4b4034" strokeWidth="6" />
      <rect x={frame - 3} y={frame - 3} width={width - (frame - 3) * 2} height={height - (frame - 3) * 2} fill="none" stroke="#b19b78" strokeWidth="2" />
    </>}
    {product.shape === 'circle' && <>
      <circle cx={width / 2} cy={height / 2} r={width / 2 - 8} fill="none" stroke="#554b3e" strokeWidth="3" />
      <circle cx={width / 2} cy={height / 2} r={width / 2 - frame + 3} fill="none" stroke="#b19b78" strokeWidth="2" />
    </>}
    {product.shape === 'rounded-rectangle' && <>
      <rect x="3" y="3" width={width - 6} height={height - 6} rx={product.preview.frameRadius ?? 24} fill="none" stroke="#171613" strokeWidth="5" />
      <rect x={width / 2 - 36} y="20" width="72" height="10" rx="5" fill="#171613" />
    </>}
    {product.shape === 'textile-strip' && <>
      <rect x="3" y="3" width={width - 6} height={height - 6} fill="none" stroke="#554b3e" strokeWidth="5" />
      <path d={`M 0 18 H ${width} M 0 ${height - 18} H ${width}`} fill="none" stroke="#b19b78" strokeWidth="2" />
    </>}
  </svg>
}
