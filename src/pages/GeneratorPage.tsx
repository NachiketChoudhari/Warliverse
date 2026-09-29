import { useRef, useState } from 'react'
import { grammarRules } from '../data/grammar'
import { motifs } from '../data/motifs'
import { primitives } from '../data/primitives'
import { referenceCollection } from '../data/referenceCollection'
import { validateGrammar } from '../grammar/validator'
import type { GrammarRule } from '../grammar/types'
import {
  compositionToGrammarSubject,
  deriveVariationSeeds,
  generateComposition,
  demoThemes,
  type GeneratedComposition,
} from '../generator'
import { WarliCanvas } from '../components/warli'

const initialSeed = 12345
const initialTheme = demoThemes[0].id
const seedLimit = 0xffff_ffff

function toCanvasElements(composition: GeneratedComposition) {
  return composition.elements.map((element) => ({
    id: element.id,
    kind: element.motif,
    position: { x: element.x, y: element.y },
    scale: element.scale,
    rotation: element.rotation,
  }))
}

function parseSeed(value: string): number | null {
  const seed = Number(value)
  return Number.isSafeInteger(seed) && seed >= 0 && seed <= seedLimit ? seed : null
}

function GrammarTrace({ composition }: { composition: GeneratedComposition }) {
  const usedRules: readonly GrammarRule[] = grammarRules.filter(({ id }) => composition.grammarRulesUsed.includes(id))
  const usedMotifs = [...new Set(composition.elements.map(({ motif }) => motif))]
  const usedPrimitives = [...new Set(composition.elements.flatMap(({ metadata }) => metadata?.primitiveIds ?? []))]
  const linkedSources = new Set([
    ...composition.sourceReferenceIds,
    ...usedRules.flatMap(({ sourceReferenceIds }) => sourceReferenceIds ?? []),
  ])

  return <section className="border border-line bg-white/25 p-5 sm:p-6" aria-labelledby="trace-heading">
    <p className="text-xs uppercase tracking-[0.18em] text-muted">Traceability</p>
    <h2 id="trace-heading" className="mt-2 font-serif text-2xl">Grammar Trace</h2>
    <ol className="mt-5 flex flex-wrap items-center gap-2 text-sm">
      {['Composition', 'Theme configuration', 'Allowed motifs', 'Motif placement', 'SVG rendering'].map((step, index) => <li key={step} className="flex items-center gap-2">
        <span className="border border-line px-3 py-2">{step}</span>
        {index < 4 && <span className="text-terracotta" aria-hidden="true">↓</span>}
      </li>)}
    </ol>
    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      <div>
        <h3 className="text-sm font-semibold">Motifs used</h3>
        <p className="mt-1 text-sm text-muted">{usedMotifs.map((motif) => motifs.find(({ id }) => id === motif)?.label ?? motif).join(', ')}</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold">Primitive types used</h3>
        <p className="mt-1 text-sm text-muted">{usedPrimitives.map((primitive) => primitives.find(({ id }) => id === primitive)?.label ?? primitive).join(', ')}</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold">Rules used</h3>
        <p className="mt-1 text-sm text-muted">{usedRules.map(({ id }) => id).join(', ')}</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold">Source references</h3>
        <p className="mt-1 text-sm text-muted">
          {linkedSources.size > 0
            ? [...linkedSources].map((id) => referenceCollection.sources.find((source) => source.id === id)?.title ?? id).join(', ')
            : 'No source-backed rules are attached to this composition yet.'}
        </p>
      </div>
    </div>
  </section>
}

export function GeneratorPage() {
  const [themeId, setThemeId] = useState(initialTheme)
  const [seedDraft, setSeedDraft] = useState(String(initialSeed))
  const initialResult = generateComposition(initialSeed, initialTheme)
  const [composition, setComposition] = useState<GeneratedComposition | null>(
    initialResult.status === 'generated' ? initialResult.composition : null,
  )
  const [variations, setVariations] = useState<GeneratedComposition[]>([])
  const [error, setError] = useState('')
  const canvasContainer = useRef<HTMLDivElement>(null)

  const selectedTheme = demoThemes.find(({ id }) => id === themeId)
  const validation = composition ? validateGrammar(compositionToGrammarSubject(composition)) : null

  function generateAt(seed: number, selectedThemeId = themeId) {
    const result = generateComposition(seed, selectedThemeId)
    setVariations([])
    if (result.status === 'generated') {
      setComposition(result.composition)
      setSeedDraft(String(result.composition.seed))
      setError('')
    } else {
      setComposition(null)
      setError(result.message)
    }
  }

  function handleGenerate() {
    const seed = parseSeed(seedDraft)
    if (seed === null) {
      setError(`Enter a whole number seed from 0 to ${seedLimit}.`)
      return
    }
    generateAt(seed)
  }

  function handleThemeChange(nextThemeId: string) {
    setThemeId(nextThemeId)
    const seed = parseSeed(seedDraft)
    if (seed !== null) generateAt(seed, nextThemeId)
  }

  function handleRandomSeed() {
    const nextSeed = Math.floor(Math.random() * (seedLimit + 1))
    setSeedDraft(String(nextSeed))
    setError('')
  }

  function handleReset() {
    setThemeId(initialTheme)
    setSeedDraft(String(initialSeed))
    generateAt(initialSeed, initialTheme)
  }

  function handleVariations() {
    const seed = parseSeed(seedDraft)
    if (seed === null) {
      setError(`Enter a whole number seed from 0 to ${seedLimit}.`)
      return
    }
    const generated = deriveVariationSeeds(seed).flatMap((variationSeed) => {
      const result = generateComposition(variationSeed, themeId)
      return result.status === 'generated' ? [result.composition] : []
    })
    setVariations(generated)
    if (generated[0]) {
      setComposition(generated[0])
      setSeedDraft(String(generated[0].seed))
      setError('')
    }
  }

  function handleExport() {
    const sourceSvg = canvasContainer.current?.querySelector('svg')
    if (!sourceSvg || !composition) return
    const exportedSvg = sourceSvg.cloneNode(true) as SVGSVGElement
    exportedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    exportedSvg.setAttribute('width', String(composition.width))
    exportedSvg.setAttribute('height', String(composition.height))
    exportedSvg.setAttribute('color', '#29251f')
    const svgText = new XMLSerializer().serializeToString(exportedSvg)
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `warli-procedural-${composition.seed}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  const motifCounts = composition
    ? motifs.map(({ id, label }) => ({ label, count: composition.elements.filter(({ motif }) => motif === id).length })).filter(({ count }) => count > 0)
    : []

  return <div className="space-y-10">
    <header className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">Configured Visual Grammar</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Procedural Generator</h1>
      <p className="mt-5 text-base leading-7 text-muted">
        Create a repeatable SVG composition using the project's configured motif vocabulary and structured representation. This is rule-based procedural software, not a trained AI model.
      </p>
    </header>

    <section className="border border-line bg-white/25 p-5 sm:p-6" aria-label="Generator controls">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium" htmlFor="generator-theme">Theme / demo configuration
          <select id="generator-theme" value={themeId} onChange={(event) => handleThemeChange(event.target.value)} className="mt-2 block w-full border border-line bg-paper px-3 py-2.5 font-normal outline-none focus:border-terracotta">
            {demoThemes.map((theme) => <option key={theme.id} value={theme.id}>{theme.label}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium" htmlFor="generator-seed">Seed
          <input id="generator-seed" type="number" min="0" max={seedLimit} step="1" value={seedDraft} onChange={(event) => setSeedDraft(event.target.value)} className="mt-2 block w-full border border-line bg-paper px-3 py-2.5 font-normal outline-none focus:border-terracotta" />
        </label>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted">No source-backed themes are configured. The options above are prototype/demo composition configurations, not documented cultural themes.</p>
      {selectedTheme && <p className="mt-2 text-xs leading-5 text-muted">{selectedTheme.description}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-terracotta">{error}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={handleGenerate} className="bg-ink px-4 py-2.5 text-sm text-paper hover:bg-terracotta">Generate</button>
        <button type="button" onClick={handleRandomSeed} className="border border-line px-4 py-2.5 text-sm hover:bg-sand">Random Seed</button>
        <button type="button" onClick={handleReset} className="border border-line px-4 py-2.5 text-sm hover:bg-sand">Reset</button>
        <button type="button" onClick={handleVariations} className="border border-terracotta/50 px-4 py-2.5 text-sm text-terracotta hover:bg-sand">Generate 4 Variations</button>
      </div>
    </section>

    {composition ? <>
      <section aria-labelledby="artwork-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Generated artwork · prototype/demo</p>
            <h2 id="artwork-heading" className="mt-2 font-serif text-2xl">Procedural Composition</h2>
          </div>
          <button type="button" onClick={handleExport} className="border border-line px-4 py-2 text-sm hover:bg-sand">Export SVG</button>
        </div>
        <div ref={canvasContainer} className="border border-line bg-paper">
          <WarliCanvas elements={toCanvasElements(composition)} width={composition.width} height={composition.height} className="block h-auto w-full text-ink" label={`Procedural composition, seed ${composition.seed}`} />
        </div>
      </section>

      {variations.length > 0 && <section aria-labelledby="variations-heading">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Four distinct deterministic seeds</p>
        <h2 id="variations-heading" className="mt-2 font-serif text-2xl">Variations</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {variations.map((variation) => <button key={variation.id} type="button" onClick={() => { setComposition(variation); setSeedDraft(String(variation.seed)) }} className={`border p-2 text-left ${variation.id === composition.id ? 'border-terracotta' : 'border-line hover:border-terracotta/60'}`} aria-pressed={variation.id === composition.id}>
            <WarliCanvas elements={toCanvasElements(variation)} width={variation.width} height={variation.height} className="block h-auto w-full text-ink" label={`Variation preview, seed ${variation.seed}`} />
            <span className="mt-2 block px-1 pb-1 text-xs text-muted">Seed {variation.seed} · {variation.elements.length} elements</span>
          </button>)}
        </div>
      </section>}

      <section aria-labelledby="information-heading" className="grid gap-6 border-t border-line pt-7 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Composition record</p>
          <h2 id="information-heading" className="mt-2 font-serif text-2xl">Composition Information</h2>
          <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
            <div className="flex justify-between gap-3 py-2.5"><dt className="text-muted">Seed</dt><dd>{composition.seed}</dd></div>
            <div className="flex justify-between gap-3 py-2.5"><dt className="text-muted">Theme configuration</dt><dd className="text-right">{composition.themeLabel}</dd></div>
            {motifCounts.map(({ label, count }) => <div key={label} className="flex justify-between gap-3 py-2.5"><dt className="text-muted">{label}</dt><dd>× {count}</dd></div>)}
          </dl>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Configured rules</p>
          <h2 className="mt-2 font-serif text-2xl">Grammar Rules Used</h2>
          <ul className="mt-4 space-y-3">
            {grammarRules.filter(({ id }) => composition.grammarRulesUsed.includes(id)).map((rule) => <li key={rule.id} className="border-l border-terracotta/60 pl-3">
              <code className="text-xs text-terracotta">{rule.id}</code>
              <p className="mt-1 text-sm leading-5 text-muted">{rule.description}</p>
            </li>)}
          </ul>
          <div className="mt-5 border border-line p-4 text-sm">
            <h3 className="font-medium">Documentation Status</h3>
            <p className="mt-2 text-muted">Configured visual grammar: active</p>
            <p className="mt-1 text-muted">Source-backed rules: {composition.sourceReferenceIds.length > 0 ? composition.sourceReferenceIds.length : 'none'}</p>
            <p className="mt-1 text-muted">Reference collection: {referenceCollection.sources.length === 0 ? 'pending documentation' : 'contains source records'}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="validation-heading" className="border border-line p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Configured schema check</p>
        <h2 id="validation-heading" className="mt-2 font-serif text-2xl">Grammar Validation</h2>
        {validation?.valid
          ? <p className="mt-4 text-sm text-ink"><span className="mr-2 text-terracotta" aria-hidden="true">✓</span>Configured structure valid</p>
          : <div className="mt-4 text-sm">
            <p className="text-terracotta">⚠ Validation issues detected</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">{validation?.violations.map((violation, index) => <li key={`${violation.ruleId}-${index}`}>{violation.message}</li>)}</ul>
          </div>}
      </section>

      <GrammarTrace composition={composition} />
    </> : <p role="status" className="border border-line p-5 text-sm text-muted">{error || 'No composition is currently available.'}</p>}
  </div>
}
