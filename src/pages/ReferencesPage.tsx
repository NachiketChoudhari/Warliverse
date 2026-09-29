import { referenceCollection } from '../data/referenceCollection'
import type { ReferenceStatus, ReferenceSourceType } from '../data/references'

const statuses: { id: ReferenceStatus; label: string; description: string }[] = [
  { id: 'documented', label: 'Documented', description: 'Project records contain supporting source details.' },
  { id: 'partially-documented', label: 'Partially documented', description: 'Some source or observation details still need recording.' },
  { id: 'not-documented', label: 'Not documented', description: 'No supporting documentation is recorded in this project.' },
  { id: 'pending-review', label: 'Pending review', description: 'Recorded material still needs project review.' },
]

const sourceTypes: { id: ReferenceSourceType; label: string }[] = [
  { id: 'museum', label: 'Museum' },
  { id: 'government', label: 'Government' },
  { id: 'academic', label: 'Academic' },
  { id: 'field_documentation', label: 'Field documentation' },
  { id: 'artist_provided', label: 'Artist provided' },
  { id: 'other', label: 'Other' },
]

export function ReferencesPage() {
  return <div className="space-y-12">
    <header className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">Research documentation</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">References</h1>
      <p className="mt-5 text-base leading-7 text-muted">
        This area is structured to keep source records, artwork metadata, observations, and software rules traceable to one another. Documentation statuses describe project record state only; they are not authenticity judgments.
      </p>
    </header>

    <section aria-labelledby="collection-heading" className="border border-line bg-white/35 p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">01 / Records</p>
          <h2 id="collection-heading" className="mt-2 font-serif text-2xl">Reference Collection</h2>
        </div>
        <span className="text-sm text-muted">{referenceCollection.artworks.length} artwork records · {referenceCollection.sources.length} sources</span>
      </div>
      {referenceCollection.artworks.length === 0 && referenceCollection.sources.length === 0 ? (
        <p className="mt-6 border-l-2 border-terracotta/60 pl-4 py-2 text-sm text-ink">No reference records have been added yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line">
          {referenceCollection.artworks.map((artwork) => <li key={artwork.id} className="py-3 text-sm">
            <span className="font-medium">{artwork.title}</span>
            <span className="ml-3 text-muted">{artwork.documentationStatus}</span>
          </li>)}
        </ul>
      )}
    </section>

    <section aria-labelledby="status-heading">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">02 / Record state</p>
      <h2 id="status-heading" className="mt-2 font-serif text-2xl">Documentation Status</h2>
      <p className="mt-2 text-sm leading-6 text-muted">Statuses describe what has been recorded or reviewed by this project.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {statuses.map((status) => <div key={status.id} className="border border-line p-4">
          <h3 className="text-sm font-medium">{status.label}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">{status.description}</p>
        </div>)}
      </div>
    </section>

    <section aria-labelledby="sources-heading" className="grid gap-8 border-t border-line pt-8 lg:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">03 / Provenance</p>
        <h2 id="sources-heading" className="mt-2 font-serif text-2xl">Sources</h2>
        <p className="mt-3 text-sm leading-6 text-muted">A source record can store a title, source category, creator or publisher, citation, URL, access date, license, notes, and documentation status. Categories are software classifications; no source has been added yet.</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {sourceTypes.map((sourceType) => <li key={sourceType.id} className="border border-line px-2.5 py-1 text-xs text-muted">{sourceType.label}</li>)}
        </ul>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">04 / Research notes</p>
        <h2 id="observations-heading" className="mt-2 font-serif text-2xl">Observations</h2>
        <p className="mt-3 text-sm leading-6 text-muted">Future artwork records can link observations to source records and store optional confidence and notes. Numerical measurements require a supporting source link in the validator.</p>
        <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted">
          <li>Primitive usage</li>
          <li>Figure structure</li>
          <li>Composition</li>
          <li>Relative positioning</li>
          <li>Repetition</li>
          <li>Angles and proportions</li>
          <li>Motif relationships</li>
        </ul>
      </div>
    </section>
  </div>
}
