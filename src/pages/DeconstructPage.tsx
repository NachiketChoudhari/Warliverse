import { useState } from 'react'
import { grammarRules, humanPartPrimitives } from '../data/grammar'
import { motifs } from '../data/motifs'
import { primitives } from '../data/primitives'
import { referenceCollection } from '../data/referenceCollection'
import { WarliCanvas } from '../components/warli'
import { deconstructComposition, reconstructComposition } from '../deconstruct'
import type { ReconstructionResult } from '../deconstruct'
import { generateComposition } from '../generator/generateComposition'
import type { GeneratedComposition } from '../generator/types'

const demoResult = generateComposition(31415, 'demo-all-motifs')
const demonstration: GeneratedComposition | null = demoResult.status === 'generated' ? demoResult.composition : null
const initialDeconstruction = demonstration ? deconstructComposition(demonstration) : null
const primitiveLabels = Object.fromEntries(primitives.map(({ id, label }) => [id, label]))
const humanPartLabels = {
  head: 'Head',
  body: 'Body',
  leftArm: 'Left arm',
  rightArm: 'Right arm',
  leftLeg: 'Left leg',
  rightLeg: 'Right leg',
} as const

function toCanvasElements(composition: GeneratedComposition) {
  return composition.elements.map((element) => ({
    id: element.id,
    kind: element.motif,
    position: { x: element.x, y: element.y },
    scale: element.scale,
    rotation: element.rotation,
  }))
}

function countMotifs(composition: GeneratedComposition) {
  return motifs.map(({ id, label }) => ({
    id,
    label,
    count: composition.elements.filter(({ motif }) => motif === id).length,
  })).filter(({ count }) => count > 0)
}

function preservationChecks(original: GeneratedComposition, reconstructed: GeneratedComposition) {
  const originalHuman = original.elements.filter(({ motif }) => motif === 'human').map(({ metadata }) => metadata?.humanStructure)
  const reconstructedHuman = reconstructed.elements.filter(({ motif }) => motif === 'human').map(({ metadata }) => metadata?.humanStructure)
  const originalPrimitiveCounts = deconstructComposition(original).primitiveUsage
  const reconstructedPrimitiveCounts = deconstructComposition(reconstructed).primitiveUsage
  return [
    { label: 'Motifs', preserved: original.elements.map(({ motif }) => motif).join('|') === reconstructed.elements.map(({ motif }) => motif).join('|') },
    { label: 'Primitive vocabulary', preserved: JSON.stringify(originalPrimitiveCounts) === JSON.stringify(reconstructedPrimitiveCounts) },
    { label: 'Human structure', preserved: JSON.stringify(originalHuman) === JSON.stringify(reconstructedHuman) },
    { label: 'Configured rules', preserved: original.grammarRulesUsed.join('|') === reconstructed.grammarRulesUsed.join('|') },
  ]
}

function MotifList({ composition }: { composition: GeneratedComposition }) {
  return <ul className="mt-3 space-y-2">
    {countMotifs(composition).map(({ id, label, count }) => <li key={id} className="flex justify-between border-b border-line py-1.5 text-sm">
      <span>{label}</span><span className="text-muted">× {count}</span>
    </li>)}
  </ul>
}

export function DeconstructPage() {
  const [seedDraft, setSeedDraft] = useState('98765')
  const [result, setResult] = useState<ReconstructionResult | null>(null)
  const [error, setError] = useState('')
  const sourceStructure = initialDeconstruction

  if (!demonstration || !sourceStructure) {
    return <p role="alert" className="border border-line p-5 text-sm text-muted">The configured procedural demonstration could not be prepared.</p>
  }

  const reconstructed = result?.status === 'reconstructed' ? result.composition : null
  const involvedRules = grammarRules.filter(({ id }) => initialDeconstruction.grammarRulesInvolved.includes(id))

  function handleReconstruct() {
    if (!sourceStructure) return
    const seed = Number(seedDraft)
    if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffff_ffff) {
      setError('Enter a whole-number seed from 0 to 4294967295.')
      return
    }
    const nextResult = reconstructComposition(sourceStructure, seed)
    setResult(nextResult)
    setError(nextResult.status === 'invalid-structure' ? 'The structural representation contains grammar validation issues.' : '')
  }

  const preserved = reconstructed ? preservationChecks(demonstration, reconstructed) : []

  return <div className="space-y-10">
    <header className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">Structured composition study</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Deconstruct → Reconstruct</h1>
      <p className="mt-5 text-base leading-7 text-muted">Inspect how an existing procedural composition is represented as motifs, primitives, positions, and configured structural relationships, then rebuild it with a new seeded arrangement.</p>
      <p className="mt-4 inline-block border border-line px-3 py-2 text-xs text-muted">System Demonstration · Procedural demonstration — not a reference artwork.</p>
    </header>

    <section aria-labelledby="original-heading">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">01 / Input</p>
        <h2 id="original-heading" className="mt-2 font-serif text-2xl">Original Composition</h2>
        <p className="mt-1 text-sm text-muted">Seed {demonstration.seed} · {demonstration.themeLabel}</p>
      </div>
      <WarliCanvas elements={toCanvasElements(demonstration)} width={demonstration.width} height={demonstration.height} className="block h-auto w-full border border-line text-ink" label="Original procedural demonstration composition" />
    </section>

    <div className="flex items-center justify-center gap-3 py-1 text-sm text-muted" aria-hidden="true">
      <span className="h-px flex-1 bg-line" />
      <span>↓</span>
      <span className="h-px flex-1 bg-line" />
    </div>

    <section aria-labelledby="structure-heading" className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">02 / Representation</p>
        <h2 id="structure-heading" className="mt-2 font-serif text-2xl">Structural Representation</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold">Motifs</h3>
            <MotifList composition={demonstration} />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Primitive usage</h3>
            <ul className="mt-3 space-y-2">{initialDeconstruction.primitiveUsage.map(({ primitive, count }) => <li key={primitive} className="flex justify-between border-b border-line py-1.5 text-sm"><span>{primitiveLabels[primitive]}</span><span className="text-muted">× {count}</span></li>)}</ul>
          </div>
        </div>
        <div className="mt-6 border-t border-line pt-5">
          <h3 className="text-sm font-semibold">Human grammar structure</h3>
          <ul className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-sm">
            {Object.entries(humanPartPrimitives).map(([part, primitive]) => <li key={part} className="flex justify-between gap-2"><span className="text-muted">{humanPartLabels[part as keyof typeof humanPartLabels]}</span><span>{primitiveLabels[primitive]}</span></li>)}
          </ul>
        </div>
        <p className="mt-5 text-xs leading-5 text-muted">Positions, scale, and rotation are software rendering parameters. This structured representation comes directly from the procedural composition; no image segmentation or artwork analysis was performed.</p>
      </div>
      <div className="border border-line bg-[#f1ebdd]">
        <div className="border-b border-line px-4 py-3">
          <h3 className="text-sm font-medium">Serializable structure</h3>
          <p className="mt-1 text-xs text-muted">Composition metadata, motif instances, primitive counts, spatial information, relationships, and grammar rules.</p>
        </div>
        <pre className="max-h-[34rem] overflow-auto p-4 text-xs leading-5 text-ink"><code>{JSON.stringify(initialDeconstruction, null, 2)}</code></pre>
      </div>
    </section>

    <section className="border border-line bg-white/25 p-5 sm:p-6" aria-labelledby="reconstruct-heading">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">03 / Procedural reconstruction</p>
          <h2 id="reconstruct-heading" className="mt-2 font-serif text-2xl">Reconstruct from Structure</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">The reconstruction retains motif types, primitive usage, human-part mappings, and configured rules. A new seed changes motif positions.</p>
        </div>
        <label className="text-sm font-medium" htmlFor="reconstruction-seed">Reconstruction seed
          <input id="reconstruction-seed" type="number" min="0" max="4294967295" step="1" value={seedDraft} onChange={(event) => setSeedDraft(event.target.value)} className="mt-2 block w-full border border-line bg-paper px-3 py-2 font-normal outline-none focus:border-terracotta" />
        </label>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-terracotta">{error}</p>}
      <button type="button" onClick={handleReconstruct} className="mt-5 bg-ink px-4 py-2.5 text-sm text-paper hover:bg-terracotta">Reconstruct</button>
    </section>

    {result && <section aria-labelledby="reconstruction-validation" className="border border-line p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Configured schema check</p>
      <h2 id="reconstruction-validation" className="mt-2 font-serif text-2xl">Reconstruction Validation</h2>
      {result.status === 'reconstructed' && result.validation.valid
        ? <p className="mt-4 text-sm"><span className="mr-2 text-terracotta" aria-hidden="true">✓</span>Valid configured structure</p>
        : <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-terracotta">{result.validation.violations.map((violation, index) => <li key={`${violation.ruleId}-${index}`}>{violation.message}</li>)}</ul>}
    </section>}

    {reconstructed && <>
      <section aria-labelledby="comparison-heading">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">04 / Side-by-side comparison</p>
          <h2 id="comparison-heading" className="mt-2 font-serif text-2xl">Original and Reconstructed</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="border border-line p-3 sm:p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em]">Original · seed {demonstration.seed}</h3>
            <WarliCanvas elements={toCanvasElements(demonstration)} width={demonstration.width} height={demonstration.height} className="block h-auto w-full text-ink" label="Original procedural composition" />
          </div>
          <div className="border border-line p-3 sm:p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em]">Reconstructed · seed {reconstructed.seed}</h3>
            <WarliCanvas elements={toCanvasElements(reconstructed)} width={reconstructed.width} height={reconstructed.height} className="block h-auto w-full text-ink" label="Reconstructed procedural composition" />
          </div>
        </div>
        <div className="mt-5 border border-line p-4">
          <h3 className="text-sm font-semibold">Structural elements preserved</h3>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {preserved.map(({ label, preserved: isPreserved }) => <li key={label} className="flex items-center gap-2"><span className={isPreserved ? 'text-terracotta' : 'text-muted'} aria-hidden="true">{isPreserved ? '✓' : '•'}</span>{label}{!isPreserved && <span className="text-muted">— not preserved</span>}</li>)}
          </ul>
        </div>
      </section>

    </>}

    <section aria-labelledby="trace-heading" className="border-t border-line pt-7">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">05 / Process</p>
      <h2 id="trace-heading" className="mt-2 font-serif text-2xl">Grammar Trace</h2>
      <ol className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        {['Composition', 'Motifs', 'Primitives', 'Structural relationships', 'Reconstruction', 'SVG'].map((step, index) => <li key={step} className="flex items-center gap-2"><span className="border border-line px-3 py-2">{step}</span>{index < 5 && <span className="text-terracotta" aria-hidden="true">↓</span>}</li>)}
      </ol>
      <p className="mt-5 max-w-3xl text-sm leading-6 text-muted">The system converts a structured composition into a representation of its visual components and uses that representation to reconstruct a procedural SVG composition.</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Grammar rules involved</h3>
          <ul className="mt-2 space-y-1 text-sm">{involvedRules.map((rule) => <li key={rule.id}><code className="text-xs text-terracotta">{rule.id}</code><span className="ml-2 text-muted">{rule.description}</span></li>)}</ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Source references</h3>
          <p className="mt-1 text-sm text-muted">{referenceCollection.sources.length === 0 || initialDeconstruction.sourceReferenceIds.length === 0
            ? 'No source-backed rules are attached to this composition yet.'
            : initialDeconstruction.sourceReferenceIds.join(', ')}</p>
        </div>
      </div>
    </section>
  </div>
}
