import { evidenceAudit } from '../data/evidenceAudit'
import { corpusResearchAudit } from '../data/corpusResearchAudit'

const stages = [
  { title: 'Documented source', detail: 'Source metadata and its project documentation status.' },
  { title: 'Artwork-specific observation', detail: 'A record describing a particular artwork; source-reported and scoped.' },
  { title: 'Cross-source pattern', detail: 'A cautious comparison across distinct sources, not a universal claim.' },
  { title: 'Expert validation', detail: 'A future attributed statement; none is stored in the published corpus.' },
  { title: 'Software rule', detail: 'A configurable implementation claim, shown separately from evidence.' },
  { title: 'Promotion review', detail: 'A separate decision; this audit cannot promote a rule.' },
]

export function EvidenceAuditPage() {
  return <div className="space-y-10">
    <header className="max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">Phase 17 / Evidence-to-rule audit</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Research Evidence Audit</h1>
      <p className="mt-5 text-base leading-7 text-muted">Inspect what the current research corpus connects to software rules, what is only review context, and where evidence is still missing.</p>
      <p className="mt-4 border-l-2 border-terracotta/60 py-2 pl-4 text-sm leading-6">This page is a read-only audit view. It does not add research records, validate a rule, or change a production rule.</p>
    </header>

    <section aria-label="Evidence workflow" className="border border-line bg-white/35 p-5 sm:p-7">
      <h2 className="font-serif text-2xl">Evidence path and decision boundaries</h2>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{stages.map((stage, index) => <li key={stage.title} className="border border-line p-4">
        <p className="text-xs uppercase tracking-wide text-terracotta">0{index + 1}</p><h3 className="mt-2 font-medium">{stage.title}</h3><p className="mt-2 text-sm leading-6 text-muted">{stage.detail}</p>
      </li>)}</ol>
    </section>

    <section aria-labelledby="audit-counts" className="space-y-4">
      <div><p className="text-xs uppercase tracking-[0.18em] text-muted">01 / Current corpus</p><h2 id="audit-counts" className="mt-2 font-serif text-2xl">Evidence coverage</h2></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-5">{[
        ['Sources', evidenceAudit.counts.sources], ['Artwork records', evidenceAudit.counts.artworks], ['Motif observations', evidenceAudit.counts.motifObservations], ['Grammar observations', evidenceAudit.counts.grammarObservations], ['Measurements', evidenceAudit.counts.measurements], ['Formal grammar evidence links', evidenceAudit.counts.grammarEvidence], ['Documentary rule assessments', evidenceAudit.counts.documentaryRuleAssessments], ['Source-backed rules', evidenceAudit.counts.sourceBackedRules], ['Pending rules', evidenceAudit.counts.pendingRules], ['External validation records', evidenceAudit.counts.externalValidationRecords],
      ].map(([label, count]) => <div key={label} className="border border-line bg-white/35 p-4"><p className="text-xs leading-5 text-muted">{label}</p><p className="mt-2 font-serif text-3xl">{count}</p></div>)}</div>
      <p className="text-sm leading-6 text-muted">Formal grammar evidence links are counted from the existing research export. Documentary rule assessments are a separate, scope-aware layer; the current collection is empty. The Phase 16 review dossier cites documentary context separately; those references are not converted into formal rule links here.</p>
    </section>

    <section aria-labelledby="rule-matrix-heading" className="space-y-5">
      <div><p className="text-xs uppercase tracking-[0.18em] text-muted">02 / Rule traceability</p><h2 id="rule-matrix-heading" className="mt-2 font-serif text-2xl">Rule evidence matrix</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Each rule’s formal evidence links are shown separately from related records selected for the Phase 16 review dossier. Dossier context is useful for inspection, but is not a source-to-rule relationship recorded in the corpus.</p></div>
      <div className="space-y-5">{evidenceAudit.rules.map((rule) => <article key={rule.id} className="border border-line bg-white/35 p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><code className="text-xs text-terracotta">{rule.id}</code><h3 className="mt-2 font-serif text-xl">{rule.claim}</h3></div><span className="border border-line px-3 py-1.5 text-xs font-semibold tracking-wide">{rule.promotionDecision}</span></div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-3"><div className="border border-line p-3"><dt className="text-xs text-muted">Formal sourceReferenceIds</dt><dd className="mt-1 text-sm">{rule.formalSourceIds.length ? rule.formalSourceIds.join(', ') : 'None'}</dd></div><div className="border border-line p-3"><dt className="text-xs text-muted">Formal observationIds</dt><dd className="mt-1 text-sm">{rule.formalObservationIds.length ? rule.formalObservationIds.join(', ') : 'None'}</dd></div><div className="border border-line p-3"><dt className="text-xs text-muted">Review dossier context</dt><dd className="mt-1 text-sm">{rule.reviewContext.length} records across {rule.reviewContextSourceCount} source(s)</dd></div></dl>
        <div className="mt-5"><h4 className="text-sm font-semibold">Evidence gaps recorded in the rule-promotion review</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">{rule.limits.map((limit) => <li key={limit}>{limit}</li>)}</ul></div>
        <details className="mt-5 border-t border-line pt-4"><summary className="cursor-pointer text-sm font-medium">Inspect review dossier records ({rule.reviewContext.length})</summary>
          {rule.reviewContext.length ? <ul className="mt-4 space-y-3">{rule.reviewContext.map((record) => <li key={`${record.kind}:${record.id}`} className="border border-line p-4">
            <div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-medium">{record.artworkTitle}</p><span className="text-xs text-muted">{record.kind === 'source' ? 'Source context' : `${record.kind} observation`} · {record.recordStatus}</span></div>
            <p className="mt-2 text-sm leading-6">{record.description}</p><p className="mt-2 text-xs leading-5 text-muted">Record ID: {record.id}{record.artworkId ? ` · Artwork ID: ${record.artworkId}` : ''}</p>
            <p className="mt-1 text-xs leading-5 text-muted">Source: {record.sourceTitle} · {record.sourceType} · {record.documentationStatus} · {record.sourceId}</p>
          </li>)}</ul> : <p className="mt-3 text-sm text-muted">No review dossier references are recorded for this rule.</p>}
        </details>
      </article>)}</div>
    </section>

    <section aria-labelledby="source-coverage-heading" className="space-y-5">
      <div><p className="text-xs uppercase tracking-[0.18em] text-muted">03 / Source traceability</p><h2 id="source-coverage-heading" className="mt-2 font-serif text-2xl">Source-to-record coverage</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Counts below follow the source IDs explicitly recorded on artworks and observations. A zero means no linked record is present in this corpus view; it does not mean the source contains no such material.</p></div>
      <div className="space-y-3">{evidenceAudit.sources.map((source) => <details key={source.id} className="border border-line bg-white/35 p-4">
        <summary className="cursor-pointer"><span className="font-medium">{source.title}</span><span className="ml-2 text-xs text-muted">{source.sourceType} · {source.documentationStatus} · {source.id}</span></summary>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4"><div><dt className="text-xs text-muted">Artwork links</dt><dd>{source.artworkIds.length}</dd></div><div><dt className="text-xs text-muted">Motif observations</dt><dd>{source.motifObservationIds.length}</dd></div><div><dt className="text-xs text-muted">Grammar observations</dt><dd>{source.grammarObservationIds.length}</dd></div><div><dt className="text-xs text-muted">Measurements</dt><dd>{source.measurementIds.length}</dd></div></dl>
        <div className="mt-3 grid gap-3 text-xs leading-5 text-muted sm:grid-cols-2"><p>Artwork IDs: {source.artworkIds.length ? source.artworkIds.join(', ') : 'None linked'}</p><p>Motif observation IDs: {source.motifObservationIds.length ? source.motifObservationIds.join(', ') : 'None linked'}</p><p>Grammar observation IDs: {source.grammarObservationIds.length ? source.grammarObservationIds.join(', ') : 'None linked'}</p><p>Measurement IDs: {source.measurementIds.length ? source.measurementIds.join(', ') : 'None linked'}</p></div>
      </details>)}</div>
    </section>

    <section aria-labelledby="corpus-audit-heading" className="space-y-5 border-t border-line pt-8">
      <div><p className="text-xs uppercase tracking-[0.18em] text-muted">Phase 19 / Corpus-level audit</p><h2 id="corpus-audit-heading" className="mt-2 font-serif text-2xl">Rule evidence and research gaps</h2><p className="mt-2 max-w-4xl text-sm leading-6 text-muted">The counts below distinguish formal documentary assessments from Phase 16 dossier context. Context references prepare a review; they are not evidence relationships, expert validation, or promotion decisions.</p></div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-6">{[
        ['Source records', corpusResearchAudit.counts.sourceRecordCount], ['Observation-bearing publications', corpusResearchAudit.counts.observationBearingPublicationCount], ['Artworks', corpusResearchAudit.counts.artworkCount], ['Observations with provenance', `${corpusResearchAudit.counts.observationsWithProvenance}/${corpusResearchAudit.counts.motifObservationCount + corpusResearchAudit.counts.grammarObservationCount}`], ['Evidence assessments', corpusResearchAudit.counts.documentaryEvidenceAssessmentCount], ['Expert validation records', corpusResearchAudit.counts.expertValidationRecordCount],
      ].map(([label, value]) => <div key={label} className="border border-line p-3"><dt className="text-xs leading-5 text-muted">{label}</dt><dd className="mt-1 font-serif text-2xl">{value}</dd></div>)}</dl>
      <p className="text-xs leading-5 text-muted">“Observation-bearing publications” counts distinct source records linked to observations ({corpusResearchAudit.counts.observationBearingPublicationCount}). It does not count independent corroboration. The corpus records D’SOURCE’s web page and PDF as one publication; source comparison assessments currently number {corpusResearchAudit.counts.sourceComparisonCount}.</p>
      <div className="space-y-4">{corpusResearchAudit.rules.map((rule) => <details key={rule.ruleId} className="border border-line bg-white/35 p-5">
        <summary className="cursor-pointer"><code className="text-xs text-terracotta">{rule.ruleId}</code><span className="ml-3 font-medium">{rule.readinessStatus.join(' · ')}</span><span className="ml-3 border border-line px-2 py-1 text-[10px] uppercase tracking-wide">{rule.promotionStatus}</span></summary>
        <div className="mt-5 space-y-5">
          <div><h3 className="text-sm font-semibold">Current software claim</h3><p className="mt-1 text-sm leading-6">{rule.currentSoftwareClaim}</p><p className="mt-2 text-xs text-muted">Implementation: {rule.implementationLocations.join(', ')}</p></div>
          <div><h3 className="text-sm font-semibold">Documentary assessment relationships</h3><dl className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">{Object.entries(rule.assessmentEvidenceCounts).map(([relationship, count]) => <div key={relationship} className="border border-line p-2"><dt className="text-muted">{relationship}</dt><dd className="mt-1 font-semibold">{count}</dd></div>)}</dl><p className="mt-2 text-xs leading-5 text-muted">Formal assessments: {rule.documentaryAssessmentCount} · linked sources: {rule.assessmentSourceCount} · distinct publications: {rule.assessmentDistinctPublicationCount}{rule.assessmentPublicationCountIsExact ? '' : ' (incomplete comparison)'} · artworks: {rule.assessmentArtworkCount} · expert validations: {rule.expertValidationCount}</p><p className="mt-1 text-xs leading-5 text-muted">Review-dossier context only: {rule.contextualDossierRecordCount} records · {rule.sourceCount} source records / {rule.distinctPublicationCount} publication records · {rule.artworkCount} artworks. These are not formal rule evidence assessments. {rule.hasNoFormalEvidenceAssessment ? 'No formal evidence assessment exists for this rule.' : ''}</p></div>
          <div><h3 className="text-sm font-semibold">Strongest documented support described in the current corpus</h3><p className="mt-1 text-sm leading-6 text-muted">{rule.strongestDocumentedSupport}</p></div>
          <div><h3 className="text-sm font-semibold">Current limitations and unresolved questions</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">{[...rule.currentLimitations, ...rule.unresolvedQuestions].map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><h3 className="text-sm font-semibold">Gap classification and required next evidence</h3><ul className="mt-2 space-y-2">{rule.gaps.map((gap) => <li key={`${gap.category}:${gap.description}`} className="border-l-2 border-terracotta/50 pl-3"><span className="text-xs font-semibold">{gap.category}</span><p className="text-sm leading-6 text-muted">{gap.description} <span className="text-ink">Next: {gap.futureWork.replaceAll('-', ' ')}.</span></p></li>)}</ul><ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">{rule.requiredNextEvidence.map((item) => <li key={item}>{item}</li>)}</ul></div>
        </div>
      </details>)}</div>
      <ul className="border-l-2 border-terracotta/50 pl-4 text-xs leading-5 text-muted">{corpusResearchAudit.auditWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
    </section>

    <section className="border-t border-line pt-7" aria-labelledby="audit-limits">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">05 / Interpretation limits</p><h2 id="audit-limits" className="mt-2 font-serif text-2xl">What this audit does not establish</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
        <li>Source summaries and artwork-specific observations retain their stated scope; they are not independent image annotations unless recorded as such.</li>
        <li>Repeated descriptions across sources are not a consensus measure. The corpus documents no expert validation records.</li>
        <li>There are no formal grammar evidence records or source-backed production rules in the current corpus.</li>
        <li>The four configured rules remain software claims under review. Promotion requires a separate human evidence review and does not happen from this page.</li>
      </ul>
      <p className="mt-5 text-sm leading-6">For an actual future review, use the <a className="underline decoration-terracotta underline-offset-4" href="/validation-review">Phase 16 Validation Review Workspace</a>. Its records remain local until explicitly exported.</p>
    </section>
  </div>
}
