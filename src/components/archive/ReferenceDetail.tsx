import type { GrammarRule } from '../../grammar/types'
import type { ReferenceArtwork, ReferenceSource } from '../../data/references'
import { GrammarObservationCard } from './GrammarObservationCard'
import { MeasurementCard } from './MeasurementCard'
import { MotifObservationCard } from './MotifObservationCard'

export function ReferenceDetail({ artwork, sources, rules }: {
  artwork: ReferenceArtwork
  sources: readonly ReferenceSource[]
  rules: readonly GrammarRule[]
}) {
  const source = sources.find(({ id }) => id === artwork.source)
  return <article className="border border-line bg-white/25 p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs uppercase tracking-[0.16em] text-muted">Reference artwork · {artwork.id}</p><h3 className="mt-2 font-serif text-2xl">{artwork.title}</h3></div>
      <span className="border border-line px-2.5 py-1 text-xs text-muted">{artwork.documentationStatus}</span>
    </div>
    <dl className="mt-5 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
      {source && <div><dt className="text-xs text-muted">Source</dt><dd>{source.title} · {source.sourceType}</dd></div>}
      {artwork.source && !source && <div><dt className="text-xs text-muted">Source ID</dt><dd>{artwork.source}</dd></div>}
      {!source && artwork.sourceType && <div><dt className="text-xs text-muted">Source type</dt><dd>{artwork.sourceType}</dd></div>}
      {artwork.artist && <div><dt className="text-xs text-muted">Artist</dt><dd>{artwork.artist}</dd></div>}
      {artwork.community && <div><dt className="text-xs text-muted">Community</dt><dd>{artwork.community}</dd></div>}
      {artwork.location && <div><dt className="text-xs text-muted">Location</dt><dd>{artwork.location}</dd></div>}
      {artwork.theme && <div><dt className="text-xs text-muted">Theme</dt><dd>{artwork.theme}</dd></div>}
      {artwork.license && <div><dt className="text-xs text-muted">License</dt><dd>{artwork.license}</dd></div>}
      {artwork.attribution?.creator && <div><dt className="text-xs text-muted">Attribution creator</dt><dd>{artwork.attribution.creator}</dd></div>}
      {artwork.attribution?.community && <div><dt className="text-xs text-muted">Attribution community</dt><dd>{artwork.attribution.community}</dd></div>}
      {artwork.attribution?.rightsHolder && <div><dt className="text-xs text-muted">Rights holder</dt><dd>{artwork.attribution.rightsHolder}</dd></div>}
      {artwork.attribution?.statement && <div><dt className="text-xs text-muted">Attribution statement</dt><dd>{artwork.attribution.statement}</dd></div>}
      {artwork.attribution?.sourceReferenceId && <div><dt className="text-xs text-muted">Attribution source reference</dt><dd>{artwork.attribution.sourceReferenceId}</dd></div>}
    </dl>
    {artwork.notes && <p className="mt-4 text-sm leading-6 text-muted">{artwork.notes}</p>}
    {source && <div className="mt-5 rounded-sm bg-paper p-4"><p className="mb-2 text-xs uppercase tracking-wide text-muted">Source record</p><p className="font-medium">{source.title}</p>{source.citation && <p className="mt-1 text-sm text-muted">{source.citation}</p>}</div>}
    {(artwork.motifs?.length ?? 0) > 0 && <section className="mt-6"><h4 className="font-serif text-xl">Motif observations</h4><div className="mt-3 grid gap-3 md:grid-cols-2">{artwork.motifs?.map((observation) => <MotifObservationCard key={observation.id} observation={observation} sources={sources} />)}</div></section>}
    {(artwork.observations?.length ?? 0) > 0 && <section className="mt-6"><h4 className="font-serif text-xl">Grammar observations</h4><div className="mt-3 grid gap-3 md:grid-cols-2">{artwork.observations?.map((observation) => <GrammarObservationCard key={observation.id} observation={observation} rules={rules} sources={sources} />)}</div></section>}
    {(artwork.measurements?.length ?? 0) > 0 && <section className="mt-6"><h4 className="font-serif text-xl">Measurements</h4><p className="mt-1 text-xs text-muted">Measurements without a recorded source are not treated as source-backed.</p><div className="mt-3 grid gap-3 md:grid-cols-2">{artwork.measurements?.map((measurement) => <MeasurementCard key={measurement.id} measurement={measurement} sources={sources} />)}</div></section>}
  </article>
}
