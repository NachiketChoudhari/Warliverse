import { getDocumentationStatus } from './documentationCounts';

export function DocumentationStatus() {
  const status = getDocumentationStatus();
  return (
    <section aria-labelledby="documentation-status-title" className="rounded-xl border border-stone-300 bg-[#fbf8ef] p-5">
      <h3 id="documentation-status-title" className="font-serif text-xl text-stone-900">Documentation status</h3>
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <div><dt className="text-sm text-stone-600">Reference records</dt><dd className="mt-1 text-3xl font-medium">{status.referenceRecords}</dd></div>
        <div><dt className="text-sm text-stone-600">Source-backed rules</dt><dd className="mt-1 text-3xl font-medium">{status.sourceBackedRules}</dd></div>
        <div><dt className="text-sm text-stone-600">Rules pending documentation</dt><dd className="mt-1 text-3xl font-medium">{status.rulesPendingDocumentation}</dd></div>
      </dl>
    </section>
  );
}
