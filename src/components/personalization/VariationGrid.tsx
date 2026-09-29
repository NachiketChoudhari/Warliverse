import { motifs } from '../../data/motifs'
import { products } from '../../data/products'
import { ProductPreview } from '../products/ProductPreview'
import type { PersonalizedDesign } from '../../personalization/types'

export function VariationGrid({ variations, productId, selectedVariationId, onSelect }: {
  variations: readonly PersonalizedDesign[]
  productId: PersonalizedDesign['productId']
  selectedVariationId: string | null
  onSelect: (variationId: string) => void
}) {
  const product = products.find(({ id }) => id === productId)
  if (!product) return null
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {variations.map((variation, index) => {
      const selected = variation.id === selectedVariationId
      const motifSummary = motifs.flatMap(({ id, label }) => {
        const count = variation.composition.elements.filter(({ motif }) => motif === id).length
        return count > 0 ? [`${label} × ${count}`] : []
      })
      return <article key={variation.id} className={`border bg-white/25 p-3 ${selected ? 'border-2 border-terracotta' : 'border-line'}`}>
        <ProductPreview product={product} composition={variation.composition} variation={variation} grammarTrace={variation.grammarTrace} instanceKey="variation-card" />
        <div className="mt-3 flex items-baseline justify-between gap-2"><h3 className="font-serif text-lg">Variation {index + 1}</h3><span className="text-xs text-muted">Seed {variation.seed}</span></div>
        <p className="mt-1 min-h-10 text-xs leading-5 text-muted">{motifSummary.join(' · ')}</p>
        <p className="mt-1 text-[11px] text-muted">{variation.grammarTrace.primitiveUsage.length} primitive types · {variation.grammarTrace.rulesUsed.length} configured rules</p>
        <button type="button" onClick={() => onSelect(variation.id)} aria-pressed={selected} className={`mt-3 w-full px-3 py-2 text-sm ${selected ? 'bg-ink text-paper' : 'border border-line hover:bg-sand'}`}>{selected ? 'Selected' : 'Select variation'}</button>
      </article>
    })}
  </div>
}
