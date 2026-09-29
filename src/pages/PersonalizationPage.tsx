import { useMemo, useRef, useState } from 'react'
import { demoThemes } from '../generator'
import { grammarRules } from '../data/grammar'
import { primitives } from '../data/primitives'
import { referenceCollection } from '../data/referenceCollection'
import { getGrammarEvidenceCounts } from '../data/grammarEvidence'
import { products } from '../data/products'
import { ProductPreview, ProductSelector } from '../components/products'
import { PersonalizationSummary, VariationGrid } from '../components/personalization'
import { downloadPersonalizationJson, downloadPersonalizedSvg, generatePersonalizedVariations, selectPersonalizedVariation } from '../personalization'
import type { PersonalizedDesign, PersonalizationSession } from '../personalization/types'
import type { ProductId } from '../products'

const defaultThemeId = demoThemes[0]?.id ?? ''
const generatorVersion = 'seeded-procedural-v1' as const

export function PersonalizationPage() {
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [productId, setProductId] = useState<ProductId | null>(null)
  const [themeId, setThemeId] = useState(defaultThemeId)
  const [seedInput, setSeedInput] = useState('12345')
  const [variations, setVariations] = useState<PersonalizedDesign[]>([])
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null)
  const [message, setMessage] = useState('Select a product and a procedural demo layout to begin.')
  const [validationMessages, setValidationMessages] = useState<string[]>([])

  const product = products.find(({ id }) => id === productId) ?? null
  const selectedVariation = useMemo(
    () => selectPersonalizedVariation(variations, selectedVariationId ?? ''),
    [variations, selectedVariationId],
  )
  const session: PersonalizationSession = {
    productId,
    selectedThemeId: themeId || null,
    variationSeeds: variations.map(({ seed }) => seed),
    generatedVariations: variations,
    selectedVariationId,
    grammarTrace: selectedVariation?.grammarTrace ?? null,
    exportMetadata: { schemaVersion: 1, generatorVersion },
  }
  const evidenceCounts = getGrammarEvidenceCounts(grammarRules, referenceCollection.sources)

  function chooseProduct(nextProductId: ProductId) {
    setProductId(nextProductId)
    setVariations([])
    setSelectedVariationId(null)
    setValidationMessages([])
    setMessage('Product selected. Generate four variations to compare product previews.')
  }

  function generate() {
    if (!productId) {
      setMessage('Select a product to continue.')
      return
    }
    if (!demoThemes.some(({ id }) => id === themeId)) {
      setMessage('No configured layouts are currently available.')
      return
    }
    const seed = Number(seedInput)
    if (!seedInput.trim() || !Number.isSafeInteger(seed) || seed < 0 || seed > 0xffff_ffff) {
      setMessage('Enter a whole-number seed from 0 to 4294967295.')
      return
    }
    const result = generatePersonalizedVariations(productId, themeId, seed)
    if (result.status === 'generation-failed') {
      setMessage(`Unable to generate this composition with the current grammar configuration. ${result.message}`)
      setVariations([])
      setSelectedVariationId(null)
      return
    }
    if (result.status === 'invalid-composition') {
      setVariations([result.design])
      setSelectedVariationId(result.design.id)
      setValidationMessages(result.validation.violations.map(({ message: issue }) => issue))
      setMessage('Composition requires review before export.')
      return
    }
    setVariations(result.variations)
    setSelectedVariationId(result.variations[0]?.id ?? null)
    setValidationMessages([])
    setMessage('Four deterministic variations generated with the existing configured grammar.')
  }

  function selectVariation(variationId: string) {
    if (!selectPersonalizedVariation(variations, variationId)) return
    setSelectedVariationId(variationId)
    setMessage('Variation selected. Product preview and exports use this design.')
  }

  function exportSvg() {
    if (!selectedVariation?.validation.valid) {
      setMessage('Composition requires review before export.')
      return
    }
    try {
      const svg = previewContainerRef.current?.querySelector('svg')
      if (!svg) throw new Error('The selected product SVG is unavailable for export.')
      downloadPersonalizedSvg(selectedVariation, new XMLSerializer().serializeToString(svg))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Composition requires review before export.')
    }
  }

  function exportJson() {
    if (!selectedVariation?.validation.valid) {
      setMessage('Composition requires review before export.')
      return
    }
    downloadPersonalizationJson(selectedVariation)
  }

  return <div className="space-y-12">
    <header className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">Apply · Phase 7</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Personalization Studio</h1>
      <p className="mt-5 text-base leading-7 text-muted">Place a deterministic procedural composition into a selected product format. Personalization uses the configured visual grammar; it does not establish cultural documentation.</p>
    </header>

    <section aria-labelledby="product-step">
      <StepHeading number="01" id="product-step" title="Select Product" />
      <div className="mt-4"><ProductSelector selectedProductId={productId} onSelect={chooseProduct} /></div>
    </section>

    <section aria-labelledby="layout-step" className="border-t border-line pt-8">
      <StepHeading number="02" id="layout-step" title="Select Configured Layout" />
      {demoThemes.length > 0 ? <>
        <label htmlFor="personalization-layout" className="mt-4 block max-w-xl text-sm font-medium">Procedural demo layout
          <select id="personalization-layout" value={themeId} onChange={(event) => { setThemeId(event.target.value); setVariations([]); setSelectedVariationId(null) }} className="mt-2 block w-full border border-line bg-paper px-3 py-2.5 font-normal">
            {demoThemes.map((theme) => <option key={theme.id} value={theme.id}>{theme.label} · Procedural Demo Layout</option>)}
          </select>
        </label>
        <p className="mt-3 max-w-2xl text-xs leading-5 text-muted">Layouts are procedural demonstrations unless supported by documented source material. The reference collection currently has no source-backed grammar rules.</p>
      </> : <p className="mt-4 text-sm text-muted">No configured layouts are currently available.</p>}
    </section>

    <section aria-labelledby="generate-step" className="border-t border-line pt-8">
      <StepHeading number="03" id="generate-step" title="Generate" />
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="text-sm font-medium" htmlFor="personalization-seed">Base seed
          <input id="personalization-seed" type="number" min="0" max="4294967295" step="1" value={seedInput} onChange={(event) => setSeedInput(event.target.value)} className="mt-2 block w-48 border border-line bg-paper px-3 py-2.5 font-normal" />
        </label>
        <button type="button" onClick={generate} className="bg-ink px-5 py-2.5 text-sm text-paper hover:bg-terracotta">Generate 4 Variations</button>
      </div>
      <p role="status" className="mt-4 text-sm text-muted">{message}</p>
      {validationMessages.length > 0 && <div role="alert" className="mt-3 border border-terracotta/50 p-4 text-sm"><p>Composition requires review before export.</p><ul className="mt-2 list-disc pl-5">{validationMessages.map((issue, index) => <li key={`${index}-${issue}`}>{issue}</li>)}</ul></div>}
    </section>

    {variations.length === 4 && productId && <section aria-labelledby="compare-step" className="border-t border-line pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><StepHeading number="04" id="compare-step" title="Compare Variations" /><p className="mt-2 text-sm text-muted">Each card shows the same composition mapped to the selected product’s safe area.</p></div><span className="text-xs text-muted">{session.variationSeeds.join(' · ')}</span></div>
      <div className="mt-5"><VariationGrid variations={variations} productId={productId} selectedVariationId={selectedVariationId} onSelect={selectVariation} /></div>
    </section>}

    <section aria-labelledby="select-step" className="border-t border-line pt-8">
      <StepHeading number="05" id="select-step" title="Selected Variation" />
      {!product ? <p className="mt-4 text-sm text-muted">Select a product to continue.</p> : !selectedVariation ? <p className="mt-4 text-sm text-muted">Generate four variations, then select one to preview it.</p> : <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div>
          <StepHeading number="06" id="product-preview-heading" title="Product Preview" />
          <div ref={previewContainerRef} className="mx-auto mt-4 max-w-xl border border-line bg-[#e8dfcf] p-4 sm:p-6"><ProductPreview product={product} composition={selectedVariation.composition} variation={selectedVariation} grammarTrace={selectedVariation.grammarTrace} instanceKey="selected-preview" /></div>
        </div>
        <div className="space-y-5"><PersonalizationSummary product={product} variation={selectedVariation} />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportSvg} disabled={!selectedVariation.validation.valid} className="border border-ink px-4 py-2 text-sm hover:bg-sand disabled:cursor-not-allowed disabled:opacity-50">Export SVG</button>
            <button type="button" onClick={exportJson} disabled={!selectedVariation.validation.valid} className="border border-line px-4 py-2 text-sm hover:bg-sand disabled:cursor-not-allowed disabled:opacity-50">Export JSON</button>
          </div>
        </div>
      </div>}
    </section>

    {selectedVariation && <section aria-labelledby="trace-step" className="border-t border-line pt-8">
      <StepHeading number="07" id="trace-step" title="Grammar Trace" />
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">The design reuses the generator’s configured vocabulary, structure, constraints, and validation. Product mapping changes placement and scale uniformly; the motif renderer and grammar rules remain the same.</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="border border-line p-5"><h3 className="font-serif text-xl">Primitive Usage</h3>
          {selectedVariation.grammarTrace.primitiveUsage.length ? <ul className="mt-3 space-y-2 text-sm">{selectedVariation.grammarTrace.primitiveUsage.map(({ primitive, count }) => <li key={primitive} className="flex justify-between"><span>{primitives.find(({ id }) => id === primitive)?.label ?? primitive}</span><span>× {count}</span></li>)}</ul> : <p className="mt-3 text-sm text-muted">No primitive usage metadata is available.</p>}
        </div>
        <div className="border border-line p-5"><h3 className="font-serif text-xl">Figure Structure</h3>
          {selectedVariation.grammarTrace.figureStructure ? <ul className="mt-3 space-y-1 text-sm text-muted">{Object.entries(selectedVariation.grammarTrace.figureStructure.parts).map(([part, primitive]) => <li key={part}>{part} → {primitive}</li>)}</ul> : <p className="mt-3 text-sm text-muted">This configured layout does not include a human structure.</p>}
        </div>
        <div className="border border-line p-5"><h3 className="font-serif text-xl">Composition Constraints</h3>
          <p className="mt-3 text-sm text-muted">Allowed motifs: {selectedVariation.grammarTrace.compositionConstraints.allowedMotifs.join(', ')}</p>
          <p className="mt-1 text-sm text-muted">Elements: {selectedVariation.grammarTrace.compositionConstraints.elementCount} · configured range {selectedVariation.grammarTrace.compositionConstraints.configuredElementRange.minimum}–{selectedVariation.grammarTrace.compositionConstraints.configuredElementRange.maximum}</p>
        </div>
        <div className="border border-line p-5"><h3 className="font-serif text-xl">Source-backed Rules</h3>
          <p className="mt-3 text-sm">Source-backed rules: {selectedVariation.grammarTrace.sourceBackedRules.length}</p>
          <p className="mt-1 text-sm">Rules pending documentation: {selectedVariation.grammarTrace.rulesPendingDocumentation.length}</p>
          {selectedVariation.grammarTrace.sourceBackedRules.length === 0 && <p className="mt-3 text-sm text-muted">No source-backed grammar rules are currently configured.</p>}
          <ul className="mt-3 space-y-2">{selectedVariation.grammarTrace.rulesUsed.map((rule) => <li key={rule.id} className="border-l border-terracotta/50 pl-3"><code className="text-xs text-terracotta">{rule.id}</code><p className="mt-1 text-xs leading-5 text-muted">{rule.description}</p></li>)}</ul>
          <p className="mt-4 text-xs text-muted">Reference collection linked records: {evidenceCounts.sourceBackedCount} source-backed rules across configured grammar.</p>
        </div>
      </div>
      <div className="mt-5 border border-line p-4 text-sm"><span className="font-medium">Grammar Validation: </span>{selectedVariation.validation.valid ? 'Configured structure valid.' : 'Composition requires review before export.'}</div>
    </section>}
  </div>
}

function StepHeading({ number, id, title }: { number: string; id: string; title: string }) {
  return <div className="flex items-baseline gap-3"><span className="font-mono text-xs text-terracotta">{number}</span><h2 id={id} className="font-serif text-2xl">{title}</h2></div>
}
