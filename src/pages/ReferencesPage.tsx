import { useMemo, useState } from 'react'
import { grammarRules } from '../data/grammar'
import { referenceCollection } from '../data/referenceCollection'
import { downloadReferenceExport } from '../data/referenceExport'
import { filterReferenceArtworks, getReferenceFilterOptions } from '../data/referenceFilters'
import type { ReferenceArtworkFilters } from '../data/referenceFilters'
import type { ReferenceSourceType, ReferenceStatus } from '../data/references'
import type { ReferenceCollection } from '../data/references'
import { GrammarEvidencePanel } from '../components/archive/GrammarEvidencePanel'
import { getGrammarEvidenceCounts } from '../data/grammarEvidence'
import { GrammarObservationCard } from '../components/archive/GrammarObservationCard'
import { MeasurementCard } from '../components/archive/MeasurementCard'
import { MotifObservationCard } from '../components/archive/MotifObservationCard'
import { ReferenceDetail } from '../components/archive/ReferenceDetail'
import { SourceCard } from '../components/archive/SourceCard'

const statusLabels: Record<ReferenceStatus, string> = {
  documented: 'Documented',
  'partially-documented': 'Partially documented',
  'pending-review': 'Pending review',
  'not-documented': 'Not documented',
}

const sourceTypeLabels: Record<ReferenceSourceType, string> = {
  museum: 'Museum', government: 'Government', academic: 'Academic',
  field_documentation: 'Field documentation', artist_provided: 'Artist provided', other: 'Other',
}

const documentationDescriptions: Record<ReferenceStatus, string> = {
  documented: 'Project records include reviewed supporting source details.',
  'partially-documented': 'Some source or observation details are recorded; others remain incomplete.',
  'pending-review': 'Recorded material is awaiting project review.',
  'not-documented': 'Supporting documentation is not recorded in this project.',
}

export function ReferencesPage(props: { collection?: ReferenceCollection } = {}) {
  const { collection = referenceCollection } = props
  const [filters, setFilters] = useState<ReferenceArtworkFilters>({})
  const filterOptions = useMemo(() => getReferenceFilterOptions(collection), [collection])
  const visibleArtworks = useMemo(() => filterReferenceArtworks(collection, filters), [collection, filters])
  const evidenceCounts = getGrammarEvidenceCounts(grammarRules, collection.sources)
  const motifObservations = collection.artworks.flatMap((artwork) => artwork.motifs?.map((observation) => ({ artwork, observation })) ?? [])
  const grammarObservations = collection.artworks.flatMap((artwork) => artwork.observations?.map((observation) => ({ artwork, observation })) ?? [])
  const measurements = collection.artworks.flatMap((artwork) => artwork.measurements?.map((measurement) => ({ artwork, measurement })) ?? [])
  const hasRecords = collection.sources.length > 0 || collection.artworks.length > 0

  function changeFilter<K extends keyof ReferenceArtworkFilters>(key: K, value: NonNullable<ReferenceArtworkFilters[K]>) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  return <div className="space-y-12">
    <header className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">Research documentation</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Reference Archive</h1>
      <p className="mt-5 text-base leading-7 text-muted">
        A structured research notebook for source metadata, artwork records, observations, measurements, and grammar evidence. Documentation status describes project records only; it is not an authenticity or quality judgment.
      </p>
      <button type="button" onClick={() => downloadReferenceExport(collection, grammarRules)} className="mt-5 border border-ink px-4 py-2.5 text-sm hover:bg-sand">Export Research JSON</button>
    </header>

    <section aria-labelledby="collection-heading" className="border border-line bg-white/35 p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">01 / Catalogue</p>
          <h2 id="collection-heading" className="mt-2 font-serif text-2xl">Reference Artworks</h2>
        </div>
        <span className="text-sm text-muted">{collection.artworks.length} artwork records · {collection.sources.length} sources</span>
      </div>
      <p className="mt-3 text-sm text-muted">Source-backed grammar rules: {evidenceCounts.sourceBackedCount}</p>
      {!hasRecords ? <div className="mt-6 space-y-6">
        <p className="border-l-2 border-terracotta/60 py-2 pl-4 text-sm text-ink">No reference records have been added yet.</p>
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Reference data pipeline</p>
            <ol className="mt-3 flex flex-wrap items-center gap-2 text-xs">{['Source', 'Artwork', 'Observation', 'Grammar Evidence', 'Configured Rule'].map((step, index) => <li key={step} className="flex items-center gap-2"><span className="border border-line px-2.5 py-2">{step}</span>{index < 4 && <span className="text-terracotta" aria-hidden="true">↓</span>}</li>)}</ol>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted">Add source material after review and attribution.</p>
        </div>
      </div> : <>
        {(filterOptions.statuses.length + filterOptions.sourceTypes.length + filterOptions.motifIds.length > 0) && <div className="mt-5 flex flex-wrap gap-3">
          {filterOptions.statuses.length > 0 && <label className="text-xs text-muted">Documentation status<select aria-label="Filter by documentation status" value={filters.status ?? ''} onChange={(event) => changeFilter('status', event.target.value as ReferenceStatus | '')} className="ml-2 border border-line bg-paper px-2 py-1.5 text-sm text-ink"><option value="">All statuses</option>{filterOptions.statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>}
          {filterOptions.sourceTypes.length > 0 && <label className="text-xs text-muted">Source type<select aria-label="Filter by source type" value={filters.sourceType ?? ''} onChange={(event) => changeFilter('sourceType', event.target.value as ReferenceSourceType | '')} className="ml-2 border border-line bg-paper px-2 py-1.5 text-sm text-ink"><option value="">All source types</option>{filterOptions.sourceTypes.map((sourceType) => <option key={sourceType} value={sourceType}>{sourceTypeLabels[sourceType]}</option>)}</select></label>}
          {filterOptions.motifIds.length > 0 && <label className="text-xs text-muted">Motif<select aria-label="Filter by motif" value={filters.motif ?? ''} onChange={(event) => changeFilter('motif', event.target.value)} className="ml-2 border border-line bg-paper px-2 py-1.5 text-sm text-ink"><option value="">All motifs</option>{filterOptions.motifIds.map((motif) => <option key={motif} value={motif}>{motif}</option>)}</select></label>}
        </div>}
        {visibleArtworks.length ? <div className="mt-5 space-y-4">{visibleArtworks.map((artwork) => <ReferenceDetail key={artwork.id} artwork={artwork} sources={collection.sources} rules={grammarRules} />)}</div> : <p className="mt-5 text-sm text-muted">No artworks match the current filters.</p>}
      </>}
    </section>

    <section aria-labelledby="status-heading">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">02 / Record state</p>
      <h2 id="status-heading" className="mt-2 font-serif text-2xl">Documentation Status</h2>
      <p className="mt-2 text-sm leading-6 text-muted">These labels describe the state of project documentation. They do not rank artwork or determine authenticity.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {(Object.keys(statusLabels) as ReferenceStatus[]).map((status) => <div key={status} className="border border-line p-4">
          <h3 className="text-sm font-medium">{statusLabels[status]}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">{documentationDescriptions[status]}</p>
        </div>)}
      </div>
    </section>

    <section aria-labelledby="sources-heading" className="border-t border-line pt-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">03 / Provenance</p>
        <h2 id="sources-heading" className="mt-2 font-serif text-2xl">Sources</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Source categories are organizational labels in this software model.</p>
        {collection.sources.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{collection.sources.map((source) => <SourceCard key={source.id} source={source} />)}</div> : <p className="mt-4 text-sm text-muted">No source records have been added yet.</p>}
      </div>
    </section>

    <section aria-labelledby="motif-observations-heading" className="border-t border-line pt-8">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">04 / Annotated visual vocabulary</p><h2 id="motif-observations-heading" className="mt-2 font-serif text-2xl">Motif Observations</h2>
      {motifObservations.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{motifObservations.map(({ artwork, observation }) => <div key={observation.id}><p className="mb-2 text-xs text-muted">Artwork: {artwork.title}</p><MotifObservationCard observation={observation} sources={collection.sources} /></div>)}</div> : <p className="mt-3 text-sm text-muted">No motif observations have been recorded.</p>}
    </section>

    <section aria-labelledby="grammar-observations-heading" className="border-t border-line pt-8">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">05 / Research notes</p><h2 id="grammar-observations-heading" className="mt-2 font-serif text-2xl">Grammar Observations</h2>
      <p className="mt-2 text-sm leading-6 text-muted">Observations describe recorded material. They remain distinct from configured software rules.</p>
      {grammarObservations.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{grammarObservations.map(({ artwork, observation }) => <div key={observation.id}><p className="mb-2 text-xs text-muted">Artwork: {artwork.title}</p><GrammarObservationCard observation={observation} rules={grammarRules} sources={collection.sources} /></div>)}</div> : <p className="mt-3 text-sm text-muted">No grammar observations have been recorded.</p>}
    </section>

    <section aria-labelledby="measurements-heading" className="border-t border-line pt-8">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">06 / Quantitative notes</p><h2 id="measurements-heading" className="mt-2 font-serif text-2xl">Measurements</h2>
      <p className="mt-2 text-sm leading-6 text-muted">Numerical observations require a source reference before they are treated as source-backed.</p>
      {measurements.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{measurements.map(({ artwork, measurement }) => <div key={measurement.id}><p className="mb-2 text-xs text-muted">Artwork: {artwork.title}</p><MeasurementCard measurement={measurement} sources={collection.sources} /></div>)}</div> : <p className="mt-3 text-sm text-muted">No measurements have been recorded.</p>}
    </section>

    <GrammarEvidencePanel rules={grammarRules} sources={collection.sources} observations={collection.artworks.flatMap(({ observations }) => observations ?? [])} />
  </div>
}
