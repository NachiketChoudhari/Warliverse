import type { MotifObservation, ReferenceSource } from '../../data/references'

const motifLabels: Record<string, string> = { human: 'Human', tree: 'Tree', hut: 'Hut', animal: 'Animal', sun: 'Sun' }

export function MotifObservationCard({ observation, sources }: { observation: MotifObservation; sources: readonly ReferenceSource[] }) {
  const source = sources.find(({ id }) => id === observation.sourceReferenceId)
  return <article className="border-l-2 border-terracotta/50 bg-white/25 p-4">
    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terracotta">Motif observation</p>
    <h4 className="mt-1 font-medium">{observation.motifId ? motifLabels[observation.motifId] ?? observation.motifId : 'Motif not specified'}</h4>
    <p className="mt-1 text-xs text-muted">{observation.kind.replaceAll('-', ' ')}</p>
    {observation.description && <p className="mt-2 text-sm leading-6">{observation.description}</p>}
    {observation.confidence !== undefined && <p className="mt-2 text-xs text-muted">Recorded confidence: {observation.confidence}</p>}
    {observation.primitiveId && <p className="mt-2 text-xs text-muted">Primitive: {observation.primitiveId}</p>}
    {observation.sourceReferenceId && <p className="mt-2 text-xs text-muted">Source: {source?.title ?? observation.sourceReferenceId}</p>}
    {observation.notes && <p className="mt-2 text-sm text-muted">{observation.notes}</p>}
  </article>
}
