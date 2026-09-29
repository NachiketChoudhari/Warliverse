import type { MeasurementObservation, ReferenceSource } from '../../data/references'

export function MeasurementCard({ measurement, sources }: { measurement: MeasurementObservation; sources: readonly ReferenceSource[] }) {
  const source = sources.find(({ id }) => id === measurement.sourceReferenceId)
  const hasSource = Boolean(measurement.sourceReferenceId && source)
  return <article className="border border-line p-4">
    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Measurement observation</p>
    <h4 className="mt-1 font-medium">{measurement.subject}</h4>
    {measurement.description && <p className="mt-2 text-sm leading-6">{measurement.description}</p>}
    {measurement.value !== undefined && <p className="mt-2 font-mono text-sm">{measurement.value}{measurement.unit ? ` ${measurement.unit}` : ''}</p>}
    {measurement.sourceReferenceId && <p className="mt-2 text-xs text-muted">Source: {source?.title ?? measurement.sourceReferenceId}</p>}
    <p className={`mt-3 text-xs ${hasSource ? 'text-muted' : 'text-terracotta'}`}>{hasSource ? 'Source-backed' : 'Not source-backed'}</p>
    {measurement.notes && <p className="mt-2 text-sm text-muted">{measurement.notes}</p>}
  </article>
}
