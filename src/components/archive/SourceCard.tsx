import type { ReferenceSource } from '../../data/references'

const sourceTypeLabels: Record<ReferenceSource['sourceType'], string> = {
  museum: 'Museum',
  government: 'Government',
  academic: 'Academic',
  field_documentation: 'Field documentation',
  artist_provided: 'Artist provided',
  other: 'Other',
}

export function SourceCard({ source }: { source: ReferenceSource }) {
  return <article className="border border-line bg-white/25 p-4">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <p className="font-medium">{source.title}</p>
        <code className="mt-1 block text-xs text-muted">{source.id}</code>
      </div>
      <span className="border border-line px-2 py-1 text-xs text-muted">{sourceTypeLabels[source.sourceType]}</span>
    </div>
    <dl className="mt-3 space-y-1 text-sm">
      {source.publisher && <div><dt className="inline text-muted">Publisher: </dt><dd className="inline">{source.publisher}</dd></div>}
      {source.creator && <div><dt className="inline text-muted">Creator: </dt><dd className="inline">{source.creator}</dd></div>}
      {source.citation && <div><dt className="inline text-muted">Citation: </dt><dd className="inline">{source.citation}</dd></div>}
      {source.url && <div><dt className="inline text-muted">URL: </dt><dd className="inline"><a className="underline decoration-terracotta/50 underline-offset-2" href={source.url} target="_blank" rel="noreferrer">{source.url}</a></dd></div>}
      {source.accessedAt && <div><dt className="inline text-muted">Accessed: </dt><dd className="inline">{source.accessedAt}</dd></div>}
      {source.notes && <div><dt className="inline text-muted">Notes: </dt><dd className="inline">{source.notes}</dd></div>}
    </dl>
    <p className="mt-3 text-xs text-muted">Documentation status: {source.documentationStatus}</p>
  </article>
}
