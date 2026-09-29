import { motifs } from '../../data/motifs'
import { demoThemes } from '../../generator'
import type { PersonalizedDesign } from '../../personalization/types'
import type { ProductConfiguration } from '../../products/types'

export function PersonalizationSummary({ product, variation }: { product: ProductConfiguration; variation: PersonalizedDesign }) {
  const theme = demoThemes.find(({ id }) => id === variation.themeId)
  const motifSummary = motifs.flatMap(({ id, label }) => {
    const count = variation.composition.elements.filter(({ motif }) => motif === id).length
    return count > 0 ? [`${label} × ${count}`] : []
  })
  return <section className="border border-line bg-white/25 p-5" aria-labelledby="personalization-summary-title">
    <p className="text-xs uppercase tracking-[0.16em] text-muted">Selected design</p><h2 id="personalization-summary-title" className="mt-2 font-serif text-2xl">Personalization Summary</h2>
    <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
      <div className="flex justify-between gap-4 py-2.5"><dt className="text-muted">Product</dt><dd>{product.name}</dd></div>
      <div className="flex justify-between gap-4 py-2.5"><dt className="text-muted">Layout</dt><dd className="text-right">{variation.themeLabel} · {product.layoutType}</dd></div>
      <div className="flex justify-between gap-4 py-2.5"><dt className="text-muted">Variation</dt><dd>{variation.id}</dd></div>
      <div className="flex justify-between gap-4 py-2.5"><dt className="text-muted">Seed</dt><dd>{variation.seed}</dd></div>
      <div className="flex justify-between gap-4 py-2.5"><dt className="text-muted">Motifs</dt><dd className="text-right">{motifSummary.join(', ') || 'None'}</dd></div>
      <div className="flex justify-between gap-4 py-2.5"><dt className="text-muted">Source-backed rules</dt><dd>{variation.grammarTrace.sourceBackedRules.length}</dd></div>
      <div className="flex justify-between gap-4 py-2.5"><dt className="text-muted">Rules pending documentation</dt><dd>{variation.grammarTrace.rulesPendingDocumentation.length}</dd></div>
      <div className="flex justify-between gap-4 py-2.5"><dt className="text-muted">Documentation status</dt><dd className="text-right">{theme?.configurationStatus === 'prototype-demo' ? 'Procedural demo; pending source documentation' : 'Configured'}</dd></div>
    </dl>
  </section>
}
