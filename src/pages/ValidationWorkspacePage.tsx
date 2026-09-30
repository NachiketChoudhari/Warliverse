import { useRef, useState, type FormEvent } from 'react'
import { grammarRules } from '../data/grammar'
import { referenceCollection } from '../data/referenceCollection'
import { getValidationReviewGuide, validationReviewGuides } from '../data/validationReviewGuide'
import { validateValidationRecord } from '../data/validationValidator'
import { VALIDATION_STATUSES } from '../data/validationTypes'
import type { EvidenceRelationship, ValidationRecord, ValidationRuleId, ValidationStatus } from '../data/validationTypes'

const statusLabels: Record<ValidationStatus, string> = {
  'not-reviewed': 'Not reviewed',
  'review-requested': 'Review requested',
  'response-recorded': 'Response recorded',
  'requires-follow-up': 'Requires follow-up',
  'supported-after-review': 'Supported after review (validation statement only)',
  challenged: 'Challenged',
  'conflicting-evidence': 'Conflicting evidence',
}

const relationships: readonly EvidenceRelationship[] = ['supports', 'challenges', 'contextualizes', 'conflicts-with']
const responseStatuses = new Set<ValidationStatus>([
  'response-recorded', 'requires-follow-up', 'supported-after-review', 'challenged', 'conflicting-evidence',
])

function downloadRecord(record: ValidationRecord) {
  const blob = new Blob([`${JSON.stringify(record, null, 2)}\n`], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${record.id}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function ValidationWorkspacePage() {
  const [ruleId, setRuleId] = useState<ValidationRuleId>('motif.allowed')
  const [resultRecord, setResultRecord] = useState<ValidationRecord | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const guide = getValidationReviewGuide(ruleId)
  const selectedRule = grammarRules.find(({ id }) => id === ruleId)!
  const sources = referenceCollection.sources
  const needsResponse = (status: ValidationStatus) => responseStatuses.has(status)

  function updateRule(value: string) {
    if (validationReviewGuides.some((item) => item.ruleId === value)) setRuleId(value as ValidationRuleId)
    formRef.current?.reset()
    setResultRecord(null)
    setErrors([])
  }

  function clearResult() {
    setResultRecord(null)
    setErrors([])
  }

  function recordReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const get = (key: string) => String(form.get(key) ?? '')
    const status = get('status') as ValidationStatus
    const identityMode = get('identityMode')
    const participant = status === 'not-reviewed' ? null : {
      id: get('validatorId'),
      identityMode,
      ...(identityMode === 'named' ? { name: get('validatorName') } : {}),
      role: get('validatorRole'),
      ...(get('validatorExpertise') ? { expertise: get('validatorExpertise') } : {}),
      ...(get('validatorAffiliation') ? { affiliation: get('validatorAffiliation') } : {}),
    }
    const selectedReferences = form.getAll('documentaryEvidence').map(String)
    const documentaryEvidence = selectedReferences.map((reference) => {
      const item = guide.evidence.find((entry) => `${entry.kind}:${entry.id}` === reference)
      if (!item) return null
      const relationship = get(`relationship:${reference}`) as EvidenceRelationship
      return item.kind === 'source'
        ? { kind: 'source' as const, sourceId: item.sourceId, relationship }
        : { kind: 'observation' as const, observationId: item.id, sourceId: item.sourceId, relationship }
    }).filter((item): item is NonNullable<typeof item> => item !== null)

    const expertStatement = get('expertStatement')
    const participantCitation = get('participantCitation')
    const response = needsResponse(status) || expertStatement || participantCitation || get('participantEvidenceUrl')
      ? {
        statement: expertStatement,
        position: get('position'),
        ...(get('responseScope') ? { scope: get('responseScope') } : {}),
        ...(get('suggestedCorrection') ? { suggestedCorrection: get('suggestedCorrection') } : {}),
        ...(participantCitation || get('participantEvidenceUrl') ? {
          evidenceSupplied: [{
            citation: participantCitation,
            ...(get('participantEvidenceUrl') ? { url: get('participantEvidenceUrl') } : {}),
            relationship: get('participantEvidenceRelationship'),
            ...(get('participantEvidenceNotes') ? { notes: get('participantEvidenceNotes') } : {}),
          }],
        } : {}),
      }
      : undefined

    const attributionMode = get('attributionMode')
    const consentStatus = get('consentStatus')
    const record = {
      id: get('validationId'),
      ruleId,
      validator: participant,
      ...(get('validationDate') ? { validationDate: get('validationDate') } : {}),
      questionPresented: guide.question,
      softwareInterpretation: { claim: guide.softwareClaim },
      ...(documentaryEvidence.length ? { documentaryEvidence } : {}),
      ...(response ? { expertResponse: response } : {}),
      attribution: {
        mode: attributionMode,
        ...(attributionMode === 'named' ? { displayName: get('attributionName') } : {}),
        ...(get('preferredWording') ? { preferredWording: get('preferredWording') } : {}),
        ...(get('permittedUse') ? { permittedUse: get('permittedUse') } : {}),
      },
      consent: {
        status: consentStatus,
        documentationMethod: get('documentationMethod'),
        ...(get('consentConditions') ? { conditions: get('consentConditions') } : {}),
      },
      status,
      ...(get('followUpNotes') ? { followUpNotes: get('followUpNotes') } : {}),
      ...(get('provenanceNotes') ? { provenanceNotes: get('provenanceNotes') } : {}),
    }
    const validation = validateValidationRecord(record)
    if (!validation.valid) {
      setResultRecord(null)
      setErrors(validation.errors.map(({ path, message }) => `${path}: ${message}`))
      return
    }
    setErrors([])
    setResultRecord(record as ValidationRecord)
  }

  const observations = guide.evidence.filter(({ kind }) => kind === 'observation')
  const documentarySources = guide.evidence.filter(({ kind }) => kind === 'source')

  return <div className="space-y-10">
    <header className="max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">Phase 16 / Local review workspace</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Validation Review Workspace</h1>
      <p className="mt-5 text-base leading-7 text-muted">Prepare a rule for a real artisan or domain expert, review the current evidence, and validate a future response using the Phase 15 capture schema.</p>
      <p className="mt-4 border-l-2 border-terracotta/60 py-2 pl-4 text-sm leading-6">Nothing is saved automatically. A completed, valid record remains in this page session until you leave or reload; use the explicit JSON download to keep it locally.</p>
    </header>

    <section className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-6">
        <section aria-labelledby="review-rule-heading" className="border border-line bg-white/35 p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">01 / Select rule</p>
          <h2 id="review-rule-heading" className="mt-2 font-serif text-2xl">Choose a rule to review</h2>
          <label className="mt-5 block text-sm font-medium" htmlFor="review-rule">Rule under review</label>
          <select id="review-rule" value={ruleId} onChange={(event) => updateRule(event.target.value)} className="mt-2 w-full border border-line bg-paper px-3 py-2.5 text-sm">
            {validationReviewGuides.map((item) => <option key={item.ruleId} value={item.ruleId}>{item.ruleId} — {item.title}</option>)}
          </select>
          <div className="mt-6 border-l-2 border-terracotta/60 pl-4">
            <p className="text-xs uppercase tracking-wide text-muted">Current software claim</p>
            <p className="mt-2 text-sm leading-6">{guide.softwareClaim}</p>
            <code className="mt-3 block text-xs text-terracotta">{selectedRule.id}: {selectedRule.description}</code>
          </div>
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-xs uppercase tracking-wide text-muted">Question to present</p>
            <p className="mt-2 text-sm leading-6">{guide.question}</p>
          </div>
        </section>

        <section aria-labelledby="evidence-heading" className="border border-line bg-white/35 p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">02 / Documentary evidence</p>
          <h2 id="evidence-heading" className="mt-2 font-serif text-2xl">Evidence on record</h2>
          <p className="mt-2 text-sm leading-6 text-muted">These are existing source-reported records, not independent annotations or expert statements. Select any material actually shown during the review.</p>
          {observations.length > 0 && <div className="mt-5 space-y-3">
            <h3 className="text-sm font-semibold">Research observations</h3>
            {observations.map((item) => <label key={item.id} className="flex gap-3 border border-line p-3 text-sm">
              <input className="mt-1 accent-terracotta" type="checkbox" name="documentaryEvidence" form="validation-capture-form" value={`${item.kind}:${item.id}`} onChange={clearResult} />
              <span className="min-w-0 flex-1"><span className="block font-medium">{item.label}</span><span className="mt-1 block leading-6 text-muted">{item.summary}</span><span className="mt-1 block text-xs text-terracotta">Source ID: {item.sourceId}</span><select aria-label={`Relationship for ${item.label}`} name={`relationship:${item.kind}:${item.id}`} form="validation-capture-form" defaultValue="contextualizes" onChange={clearResult} className="mt-2 border border-line bg-paper px-2 py-1.5 text-xs">{relationships.map((relation) => <option key={relation} value={relation}>{relation}</option>)}</select></span>
            </label>)}
          </div>}
          {documentarySources.length > 0 && <div className="mt-5 space-y-3">
            <h3 className="text-sm font-semibold">Source context</h3>
            {documentarySources.map((item) => <label key={item.id} className="flex gap-3 border border-line p-3 text-sm">
              <input className="mt-1 accent-terracotta" type="checkbox" name="documentaryEvidence" form="validation-capture-form" value={`${item.kind}:${item.id}`} onChange={clearResult} />
              <span className="min-w-0 flex-1"><span className="block font-medium">{item.label}</span><span className="mt-1 block leading-6 text-muted">{item.summary}</span><span className="mt-1 block text-xs text-terracotta">Source ID: {item.sourceId}</span><select aria-label={`Relationship for ${item.label}`} name={`relationship:${item.kind}:${item.id}`} form="validation-capture-form" defaultValue="contextualizes" onChange={clearResult} className="mt-2 border border-line bg-paper px-2 py-1.5 text-xs">{relationships.map((relation) => <option key={relation} value={relation}>{relation}</option>)}</select></span>
            </label>)}
          </div>}
          <div className="mt-6 border-t border-line pt-5">
            <h3 className="text-sm font-semibold">What remains unverified</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">{guide.limits.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <p className="mt-5 text-xs text-muted">Available sources: {sources.map(({ id }) => id).join(', ')}</p>
        </section>
      </div>

      <section aria-labelledby="capture-heading" className="border border-line bg-white/35 p-5 sm:p-7">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">03 / Capture with permission</p>
        <h2 id="capture-heading" className="mt-2 font-serif text-2xl">Validation record</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Complete this after an actual review. Use a stable anonymous ID when requested; a personal name is required only when named identity or attribution is selected.</p>
        <form ref={formRef} id="validation-capture-form" className="mt-6 space-y-6" onSubmit={recordReview} onChange={clearResult}>
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 text-sm font-semibold">Record and review status</legend>
            <label className="text-sm">Validation ID<input required name="validationId" placeholder="validation-session-01" className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
            <label className="text-sm">Status<select name="status" defaultValue="not-reviewed" className="mt-1 block w-full border border-line bg-paper px-3 py-2">{VALIDATION_STATUSES.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
            <label className="text-sm">Validation date (YYYY-MM-DD)<input name="validationDate" type="date" className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
            <label className="text-sm">Question presented<textarea readOnly value={guide.question} rows={3} className="mt-1 block w-full border border-line bg-sand px-3 py-2 text-muted sm:col-span-2" /></label>
          </fieldset>

          <fieldset className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
            <legend className="px-0 text-sm font-semibold">Participant identity (optional before review)</legend>
            <label className="text-sm">Identity mode<select name="identityMode" defaultValue="anonymized" className="mt-1 block w-full border border-line bg-paper px-3 py-2"><option value="anonymized">Anonymized</option><option value="named">Named</option></select></label>
            <label className="text-sm">Stable participant ID<input name="validatorId" placeholder="validator-reviewer-01" className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
            <label className="text-sm">Participant name (named identity only)<input name="validatorName" className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
            <label className="text-sm">Role<input name="validatorRole" placeholder="Artisan, researcher, domain expert…" className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
            <label className="text-sm">Expertise (if supplied)<input name="validatorExpertise" className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
            <label className="text-sm">Affiliation (if supplied)<input name="validatorAffiliation" className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
          </fieldset>

          <fieldset className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
            <legend className="px-0 text-sm font-semibold">Attribution and consent</legend>
            <label className="text-sm">Attribution choice<select name="attributionMode" defaultValue="pending" className="mt-1 block w-full border border-line bg-paper px-3 py-2"><option value="pending">Pending</option><option value="named">Named</option><option value="anonymous">Anonymous</option><option value="withheld">Withheld</option></select></label>
            <label className="text-sm">Display name (named attribution only)<input name="attributionName" className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
            <label className="text-sm">Preferred wording<input name="preferredWording" className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
            <label className="text-sm">Permitted use or quotation scope<input name="permittedUse" className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
            <label className="text-sm">Permission to document<select name="consentStatus" defaultValue="pending" className="mt-1 block w-full border border-line bg-paper px-3 py-2"><option value="pending">Pending</option><option value="granted">Granted</option><option value="conditional">Conditional</option><option value="declined">Declined</option></select></label>
            <label className="text-sm">Documentation method<select name="documentationMethod" defaultValue="none" className="mt-1 block w-full border border-line bg-paper px-3 py-2"><option value="none">None</option><option value="notes">Notes</option><option value="audio">Audio</option><option value="written">Written response</option></select></label>
            <label className="text-sm sm:col-span-2">Consent conditions or limits<textarea name="consentConditions" rows={2} className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
          </fieldset>

          <fieldset className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
            <legend className="px-0 text-sm font-semibold">Expert response (only after a real review)</legend>
            <label className="text-sm sm:col-span-2">Response statement<textarea name="expertStatement" rows={4} className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
            <label className="text-sm">Agreement or disagreement<select name="position" defaultValue="unable-to-assess" className="mt-1 block w-full border border-line bg-paper px-3 py-2"><option value="unable-to-assess">Unable to assess</option><option value="agrees">Agrees</option><option value="partially-agrees">Partially agrees</option><option value="disagrees">Disagrees</option></select></label>
            <label className="text-sm">Response scope/context<input name="responseScope" className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
            <label className="text-sm sm:col-span-2">Suggested correction or addition<textarea name="suggestedCorrection" rows={2} className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
            <label className="text-sm">Participant-supplied evidence citation<input name="participantCitation" className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
            <label className="text-sm">Citation URL (optional)<input name="participantEvidenceUrl" type="url" className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
            <label className="text-sm">Participant evidence relationship<select name="participantEvidenceRelationship" defaultValue="contextualizes" className="mt-1 block w-full border border-line bg-paper px-3 py-2">{relationships.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label className="text-sm">Evidence notes<input name="participantEvidenceNotes" className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
          </fieldset>

          <fieldset className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
            <legend className="px-0 text-sm font-semibold">Follow-up and provenance</legend>
            <label className="text-sm">Follow-up notes<textarea name="followUpNotes" rows={2} className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
            <label className="text-sm">Provenance/recording notes<textarea name="provenanceNotes" rows={2} className="mt-1 block w-full border border-line bg-paper px-3 py-2" /></label>
          </fieldset>

          <div className="border-t border-line pt-5">
            <p className="text-sm leading-6 text-muted">This workspace does not store a response automatically. “Supported after review” records a participant response only; it cannot promote or change a production rule.</p>
            <button type="submit" className="mt-4 border border-ink px-4 py-2.5 text-sm hover:bg-sand">Validate capture record</button>
          </div>
        </form>

        {errors.length > 0 && <section aria-labelledby="capture-errors-heading" className="mt-6 border border-red-700/50 bg-red-50/60 p-4">
          <h3 id="capture-errors-heading" className="font-semibold">Record needs correction</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </section>}
        {resultRecord && <section aria-labelledby="validated-record-heading" className="mt-6 border border-line bg-paper p-4">
          <h3 id="validated-record-heading" className="font-serif text-xl">Capture record passes structural validation</h3>
          <p className="mt-2 text-sm leading-6 text-muted">Structural validation does not verify the response’s truth, credentials, scope, or cultural interpretation.</p>
          <button type="button" onClick={() => downloadRecord(resultRecord)} className="mt-4 border border-ink px-4 py-2.5 text-sm hover:bg-sand">Download validation JSON</button>
          <pre className="mt-4 max-h-96 overflow-auto border border-line bg-white p-3 text-xs leading-5">{JSON.stringify(resultRecord, null, 2)}</pre>
        </section>}
      </section>
    </section>
  </div>
}
