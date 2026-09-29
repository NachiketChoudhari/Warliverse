import { grammarRules, humanPartPrimitives } from '../data/grammar'
import { motifs } from '../data/motifs'
import { primitives } from '../data/primitives'
import type { MotifId, PrimitiveId } from '../grammar/types'
import { AnimalMotif, HumanFigure, HutMotif, PrimitiveCircle, PrimitiveLine, PrimitiveTriangle, SunMotif, TreeMotif, WarliCanvas } from '../components/warli'

const primitiveLabels: Record<PrimitiveId, string> = { circle: 'Circle', triangle: 'Triangle', line: 'Line' }
const motifRenderers = { human: HumanFigure, tree: TreeMotif, hut: HutMotif, animal: AnimalMotif, sun: SunMotif }
const humanParts = [
  ['head', 'Head'],
  ['body', 'Body'],
  ['leftArm', 'Left arm'],
  ['rightArm', 'Right arm'],
  ['leftLeg', 'Left leg'],
  ['rightLeg', 'Right leg'],
] as const

function PrimitiveCard({ kind, label }: { kind: PrimitiveId; label: string }) {
  return <div className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-sm border border-line bg-white/35 p-4">
    <svg viewBox="0 0 100 70" className="h-16 w-full max-w-28 text-ink" aria-hidden="true">
      {kind === 'circle' && <PrimitiveCircle center={{ x: 50, y: 35 }} radius={18} />}
      {kind === 'triangle' && <PrimitiveTriangle points={['50,14', '28,55', '72,55']} />}
      {kind === 'line' && <PrimitiveLine start={{ x: 26, y: 52 }} end={{ x: 74, y: 18 }} />}
    </svg>
    <span className="text-sm font-medium">{label}</span>
  </div>
}

function MotifCard({ id, label }: { id: MotifId; label: string }) {
  const Renderer = motifRenderers[id]
  return <div className="rounded-sm border border-line bg-white/35 p-4">
    <svg viewBox="0 0 100 100" className="mx-auto h-24 w-24 text-ink" role="img" aria-label={`${label} configured motif sketch`}>
      <Renderer />
    </svg>
    <h3 className="mt-2 text-center text-sm font-medium">{label}</h3>
  </div>
}

export function GrammarLabPage() {
  const structuredRepresentation = {
    human: Object.fromEntries(humanParts.map(([part]) => [part, primitiveLabels[humanPartPrimitives[part]]])),
    rules: grammarRules.map(({ id, description }) => ({ id, description })),
    provenance: 'software configuration; project reference sources not yet added',
  }

  return <div className="space-y-12">
    <header className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">Documented / Configured Grammar</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Grammar Lab</h1>
      <p className="mt-5 text-base leading-7 text-muted">
        Explore the current structured representation used by this prototype. Its vocabulary and connections are software configuration; reference material has not yet been added to the project.
      </p>
      <p className="mt-4 inline-flex items-center gap-2 border border-line px-3 py-2 text-xs text-muted">
        <span className="size-2 rounded-full bg-terracotta" aria-hidden="true" />
        Reference status: not yet documented in project data
      </p>
    </header>

    <section aria-labelledby="primitive-heading">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">01 / Vocabulary</p>
          <h2 id="primitive-heading" className="mt-2 font-serif text-2xl">Primitive Vocabulary</h2>
        </div>
        <span className="text-xs text-muted">Configured software shapes</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {primitives.map((primitive) => <PrimitiveCard key={primitive.id} kind={primitive.id} label={primitive.label} />)}
      </div>
    </section>

    <section aria-labelledby="human-heading" className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">02 / Structural example</p>
        <h2 id="human-heading" className="mt-2 font-serif text-2xl">Human Figure Structure</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
          A compositional example assembled from the configured circle, triangle, and line primitives. The drawing coordinates are presentation values for this interface, not sourced measurements.
        </p>
        <dl className="mt-5 divide-y divide-line border-y border-line">
          {humanParts.map(([part, label]) => <div key={part} className="flex justify-between gap-4 py-2.5 text-sm">
            <dt className="text-muted">{label}</dt>
            <dd className="font-medium">{primitiveLabels[humanPartPrimitives[part]]}</dd>
          </div>)}
        </dl>
      </div>
      <WarliCanvas
        elements={[{ id: 'grammar-human-example', kind: 'human', position: { x: 190, y: 54 }, scale: 2.1, strokeWidth: 2.3 }]}
        width={400}
        height={240}
        className="h-full min-h-60 w-full border border-line"
        label="Configured human figure made from a circle head, triangle body, and line limbs"
      />
    </section>

    <section aria-labelledby="motif-heading">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">03 / Configured set</p>
        <h2 id="motif-heading" className="mt-2 font-serif text-2xl">Motif Vocabulary</h2>
        <p className="mt-2 text-sm text-muted">Renderer sketches are software representations; they are not source documentation.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {motifs.map((motif) => <MotifCard key={motif.id} id={motif.id} label={motif.label} />)}
      </div>
    </section>

    <section aria-labelledby="representation-heading" className="grid gap-6 lg:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">04 / Schema</p>
        <h2 id="representation-heading" className="mt-2 font-serif text-2xl">Structured Representation</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          These configured rules verify that known motifs and required human components use the primitives defined by the project model. They do not assess authenticity or make unsupported cultural judgments.
        </p>
        <ul className="mt-5 space-y-3">
          {grammarRules.map((rule) => <li key={rule.id} className="border-l border-terracotta/60 pl-3">
            <code className="text-xs text-terracotta">{rule.id}</code>
            <p className="mt-1 text-sm text-muted">{rule.description}</p>
          </li>)}
        </ul>
      </div>
      <pre className="overflow-x-auto border border-line bg-[#f1ebdd] p-5 text-xs leading-6 text-ink"><code>{JSON.stringify(structuredRepresentation, null, 2)}</code></pre>
    </section>
  </div>
}
