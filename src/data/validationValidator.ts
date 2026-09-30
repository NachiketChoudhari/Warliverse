import { grammarRules } from './grammar'
import { referenceCollection } from './referenceCollection'
import { VALIDATION_STATUSES, type ValidationIssue, type ValidationResult } from './validationTypes'

const validationRuleIds = new Set<string>(grammarRules.map(({ id }) => id))
const validationStatuses = new Set<string>(VALIDATION_STATUSES)
const positions = new Set(['agrees', 'disagrees', 'partially-agrees', 'unable-to-assess'])
const evidenceRelationships = new Set(['supports', 'challenges', 'contextualizes', 'conflicts-with'])
const participantIdPattern = /^validator-[a-z0-9]+(?:-[a-z0-9]+)*$/
const validationIdPattern = /^validation-[a-z0-9]+(?:-[a-z0-9]+)*$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function add(issues: ValidationIssue[], code: string, path: string, message: string, severity: ValidationIssue['severity'] = 'error') {
  issues.push({ code, path, message, severity })
}

function checkFields(value: Record<string, unknown>, allowed: readonly string[], path: string, errors: ValidationIssue[]) {
  for (const field of Object.keys(value)) {
    if (!allowed.includes(field)) add(errors, 'unsupported-field', `${path}.${field}`, `Field “${field}” is not supported by the validation capture schema.`)
  }
}

function requiredString(value: unknown, path: string, errors: ValidationIssue[]) {
  if (typeof value !== 'string' || value.trim() === '') {
    add(errors, 'required-string', path, 'A non-empty string is required.')
    return false
  }
  return true
}

function optionalStrings(value: Record<string, unknown>, fields: readonly string[], path: string, errors: ValidationIssue[]) {
  for (const field of fields) {
    if (value[field] !== undefined && (typeof value[field] !== 'string' || value[field].trim() === '')) {
      add(errors, 'invalid-string', `${path}.${field}`, 'Expected a non-empty string when this field is supplied.')
    }
  }
}

function validCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function validHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function makeResult(errors: ValidationIssue[], warnings: ValidationIssue[]): ValidationResult {
  return { valid: errors.length === 0, errors, warnings }
}

function validateParticipant(value: unknown, path: string, errors: ValidationIssue[]) {
  if (!isRecord(value)) {
    add(errors, 'invalid-participant', path, 'Expected a participant object or null when no participant has been identified.')
    return
  }
  checkFields(value, ['id', 'identityMode', 'name', 'role', 'expertise', 'affiliation'], path, errors)
  if (requiredString(value.id, `${path}.id`, errors) && typeof value.id === 'string' && !participantIdPattern.test(value.id)) {
    add(errors, 'invalid-participant-id', `${path}.id`, 'Participant ID must use validator-<lowercase-slug> format.')
  }
  if (value.identityMode !== 'named' && value.identityMode !== 'anonymized') {
    add(errors, 'invalid-identity-mode', `${path}.identityMode`, 'Identity mode must be named or anonymized.')
  }
  if (value.identityMode === 'named') requiredString(value.name, `${path}.name`, errors)
  if (value.identityMode === 'anonymized' && value.name !== undefined) {
    add(errors, 'unexpected-personal-identity', `${path}.name`, 'An anonymized participant must not include a personal name.')
  }
  requiredString(value.role, `${path}.role`, errors)
  optionalStrings(value, ['expertise', 'affiliation'], path, errors)
}

function validateAttribution(value: unknown, path: string, errors: ValidationIssue[], hasResponse: boolean) {
  if (!isRecord(value)) {
    add(errors, 'invalid-attribution', path, 'Attribution information is required as an object.')
    return
  }
  checkFields(value, ['mode', 'displayName', 'preferredWording', 'permittedUse'], path, errors)
  const modes = new Set(['named', 'anonymous', 'withheld', 'pending'])
  if (!modes.has(String(value.mode))) add(errors, 'invalid-attribution-mode', `${path}.mode`, 'Attribution mode must be named, anonymous, withheld, or pending.')
  if (value.mode === 'named') requiredString(value.displayName, `${path}.displayName`, errors)
  else if (value.displayName !== undefined) add(errors, 'unexpected-attribution-name', `${path}.displayName`, 'A display name is only allowed for named attribution.')
  if (hasResponse && value.mode === 'pending') add(errors, 'unresolved-attribution', `${path}.mode`, 'A recorded response requires an attribution choice, including anonymous or withheld attribution.')
  optionalStrings(value, ['preferredWording', 'permittedUse'], path, errors)
}

function validateConsent(value: unknown, path: string, errors: ValidationIssue[], hasResponse: boolean) {
  if (!isRecord(value)) {
    add(errors, 'invalid-consent', path, 'Consent and documentation status are required as an object.')
    return
  }
  checkFields(value, ['status', 'documentationMethod', 'conditions'], path, errors)
  const statuses = new Set(['granted', 'conditional', 'declined', 'pending'])
  const methods = new Set(['notes', 'audio', 'written', 'none'])
  if (!statuses.has(String(value.status))) add(errors, 'invalid-consent-status', `${path}.status`, 'Consent status must be granted, conditional, declined, or pending.')
  if (!methods.has(String(value.documentationMethod))) add(errors, 'invalid-documentation-method', `${path}.documentationMethod`, 'Documentation method must be notes, audio, written, or none.')
  if ((value.status === 'granted' || value.status === 'conditional') && value.documentationMethod === 'none') {
    add(errors, 'missing-documentation-method', `${path}.documentationMethod`, 'Granted or conditional consent requires a documentation method.')
  }
  if (value.status === 'declined' && value.documentationMethod !== 'none') {
    add(errors, 'consent-method-conflict', `${path}.documentationMethod`, 'Declined consent requires documentation method none.')
  }
  if (value.status === 'conditional') requiredString(value.conditions, `${path}.conditions`, errors)
  if (hasResponse && value.status !== 'granted' && value.status !== 'conditional') {
    add(errors, 'response-without-consent', `${path}.status`, 'A response can only be recorded with granted or conditional documentation consent.')
  }
  if (!hasResponse && value.status === 'declined' && value.documentationMethod !== 'none') {
    add(errors, 'consent-method-conflict', `${path}.documentationMethod`, 'Declined consent cannot specify a recording method.')
  }
  optionalStrings(value, ['conditions'], path, errors)
}

function sourceAndObservationIds() {
  const sourceIds = new Set(referenceCollection.sources.map(({ id }) => id))
  const observations = new Map<string, string | undefined>()
  for (const artwork of referenceCollection.artworks) {
    for (const observation of [...(artwork.motifs ?? []), ...(artwork.observations ?? [])]) {
      observations.set(observation.id, observation.sourceReferenceId)
    }
  }
  return { sourceIds, observations }
}

const knownReferences = sourceAndObservationIds()

function validateDocumentaryEvidence(value: unknown, path: string, errors: ValidationIssue[]) {
  if (!isRecord(value)) {
    add(errors, 'invalid-documentary-evidence', path, 'Expected a documentary evidence reference object.')
    return
  }
  checkFields(value, ['kind', 'sourceId', 'observationId', 'relationship'], path, errors)
  if (!evidenceRelationships.has(String(value.relationship))) add(errors, 'invalid-evidence-relationship', `${path}.relationship`, 'Evidence relationship is not supported.')
  if (value.kind === 'source') {
    requiredString(value.sourceId, `${path}.sourceId`, errors)
    if (typeof value.sourceId === 'string' && !knownReferences.sourceIds.has(value.sourceId)) {
      add(errors, 'unresolved-source-reference', `${path}.sourceId`, `Source “${value.sourceId}” does not resolve in the current research corpus.`)
    }
    if (value.observationId !== undefined) add(errors, 'invalid-evidence-shape', `${path}.observationId`, 'Source references cannot include observationId.')
  } else if (value.kind === 'observation') {
    requiredString(value.observationId, `${path}.observationId`, errors)
    const sourceId = typeof value.observationId === 'string' ? knownReferences.observations.get(value.observationId) : undefined
    if (typeof value.observationId === 'string' && !knownReferences.observations.has(value.observationId)) {
      add(errors, 'unresolved-observation-reference', `${path}.observationId`, `Observation “${value.observationId}” does not resolve in the current research corpus.`)
    }
    if (value.sourceId !== undefined) {
      requiredString(value.sourceId, `${path}.sourceId`, errors)
      if (typeof value.sourceId === 'string' && !knownReferences.sourceIds.has(value.sourceId)) {
        add(errors, 'unresolved-source-reference', `${path}.sourceId`, `Source “${value.sourceId}” does not resolve in the current research corpus.`)
      } else if (typeof value.sourceId === 'string' && sourceId && value.sourceId !== sourceId) {
        add(errors, 'evidence-source-mismatch', `${path}.sourceId`, 'The supplied source does not match the observation’s recorded source.')
      }
    }
    if (value.sourceId === undefined && value.kind === 'observation' && value.relationship === 'conflicts-with') {
      add(errors, 'missing-conflict-source', `${path}.sourceId`, 'A conflicting observation reference must retain its source ID.')
    }
    if (value.sourceId === undefined && value.kind === 'observation' && sourceId === undefined) {
      add(errors, 'unattributed-observation', `${path}.observationId`, 'This observation has no source link; include its provenance separately before using it as documentary evidence.')
    }
    if (value.sourceId !== undefined && value.sourceId !== sourceId) {
      // A supplied source must agree with the observation's existing provenance.
      // A source-less observation is not accepted as a documentary reference.
      if (sourceId === undefined) add(errors, 'evidence-source-mismatch', `${path}.sourceId`, 'This observation has no recorded source to match the supplied source.')
    }
  } else {
    add(errors, 'invalid-evidence-kind', `${path}.kind`, 'Evidence kind must be source or observation.')
  }
}

function validateParticipantEvidence(value: unknown, path: string, errors: ValidationIssue[]) {
  if (!isRecord(value)) {
    add(errors, 'invalid-participant-evidence', path, 'Expected a participant-supplied citation object.')
    return
  }
  checkFields(value, ['citation', 'url', 'relationship', 'notes'], path, errors)
  requiredString(value.citation, `${path}.citation`, errors)
  if (value.url !== undefined) {
    if (typeof value.url !== 'string' || !validHttpUrl(value.url)) add(errors, 'invalid-evidence-url', `${path}.url`, 'Evidence URL must be a valid HTTP or HTTPS URL.')
  }
  if (!evidenceRelationships.has(String(value.relationship))) add(errors, 'invalid-evidence-relationship', `${path}.relationship`, 'Evidence relationship is not supported.')
  optionalStrings(value, ['notes'], path, errors)
}

function validateResponse(value: unknown, path: string, errors: ValidationIssue[]) {
  if (!isRecord(value)) {
    add(errors, 'invalid-response', path, 'Expected an expert response object.')
    return
  }
  checkFields(value, ['statement', 'position', 'scope', 'suggestedCorrection', 'evidenceSupplied'], path, errors)
  requiredString(value.statement, `${path}.statement`, errors)
  if (!positions.has(String(value.position))) add(errors, 'invalid-response-position', `${path}.position`, 'Response position must be agrees, disagrees, partially-agrees, or unable-to-assess.')
  optionalStrings(value, ['scope', 'suggestedCorrection'], path, errors)
  if (value.evidenceSupplied !== undefined) {
    if (!Array.isArray(value.evidenceSupplied)) add(errors, 'invalid-evidence-array', `${path}.evidenceSupplied`, 'Expected an array of participant-supplied evidence references.')
    else value.evidenceSupplied.forEach((item, index) => validateParticipantEvidence(item, `${path}.evidenceSupplied[${index}]`, errors))
  }
}

/** Validate one future validation capture record without mutating research or rules. */
export function validateValidationRecord(input: unknown): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []
  if (!isRecord(input)) {
    add(errors, 'invalid-record', '$', 'Validation record must be an object.')
    return makeResult(errors, warnings)
  }

  checkFields(input, [
    'id', 'ruleId', 'validator', 'validationDate', 'questionPresented', 'softwareInterpretation',
    'documentaryEvidence', 'expertResponse', 'attribution', 'consent', 'status', 'followUpNotes', 'provenanceNotes',
  ], '$', errors)

  if (requiredString(input.id, '$.id', errors) && typeof input.id === 'string' && !validationIdPattern.test(input.id)) {
    add(errors, 'invalid-validation-id', '$.id', 'Validation ID must use validation-<lowercase-slug> format.')
  }
  if (!validationRuleIds.has(String(input.ruleId))) add(errors, 'invalid-rule-id', '$.ruleId', 'Rule ID does not resolve to one of the four configured rules under review.')

  if (input.validator === null) {
    if (input.status !== 'not-reviewed') add(errors, 'missing-participant', '$.validator', 'A participant identity or anonymized identifier is required once review is requested.')
  } else {
    validateParticipant(input.validator, '$.validator', errors)
  }

  if (input.validationDate !== undefined) {
    if (typeof input.validationDate !== 'string' || !validCalendarDate(input.validationDate)) {
      add(errors, 'invalid-date', '$.validationDate', 'Date must be a valid calendar date in YYYY-MM-DD format.')
    }
  }
  requiredString(input.questionPresented, '$.questionPresented', errors)
  if (!isRecord(input.softwareInterpretation)) {
    add(errors, 'invalid-software-interpretation', '$.softwareInterpretation', 'Software interpretation must be an object containing the claim shown for review.')
  } else {
    checkFields(input.softwareInterpretation, ['claim'], '$.softwareInterpretation', errors)
    requiredString(input.softwareInterpretation.claim, '$.softwareInterpretation.claim', errors)
  }

  if (input.documentaryEvidence !== undefined) {
    if (!Array.isArray(input.documentaryEvidence)) add(errors, 'invalid-documentary-evidence-array', '$.documentaryEvidence', 'Expected an array of project source or observation references.')
    else input.documentaryEvidence.forEach((item, index) => validateDocumentaryEvidence(item, `$.documentaryEvidence[${index}]`, errors))
  }

  const responsePresent = input.expertResponse !== undefined
  if (responsePresent) validateResponse(input.expertResponse, '$.expertResponse', errors)
  validateAttribution(input.attribution, '$.attribution', errors, responsePresent)
  validateConsent(input.consent, '$.consent', errors, responsePresent)
  optionalStrings(input, ['followUpNotes', 'provenanceNotes'], '$', errors)

  if (!validationStatuses.has(String(input.status))) {
    add(errors, 'invalid-validation-status', '$.status', 'Validation status is not part of the supported status set.')
  } else {
    const status = String(input.status)
    const responseRequired = !['not-reviewed', 'review-requested'].includes(status)
    if (responseRequired && !responsePresent) add(errors, 'missing-response', '$.expertResponse', `Status “${status}” requires an expert response.`)
    if (!responseRequired && responsePresent) add(errors, 'response-status-conflict', '$.expertResponse', `Status “${status}” cannot contain a response.`)
    if (responseRequired && input.validationDate === undefined) add(errors, 'missing-validation-date', '$.validationDate', 'A recorded response requires its validation date.')
    if (status === 'requires-follow-up') requiredString(input.followUpNotes, '$.followUpNotes', errors)

    if (isRecord(input.expertResponse)) {
      const position = input.expertResponse.position
      if (status === 'supported-after-review' && position !== 'agrees' && position !== 'partially-agrees') {
        add(errors, 'status-response-conflict', '$.expertResponse.position', 'Supported-after-review requires agreement or partial agreement.')
      }
      if (status === 'challenged' && position !== 'disagrees') {
        add(errors, 'status-response-conflict', '$.expertResponse.position', 'Challenged status requires a disagreement response.')
      }
    }
    if (status === 'conflicting-evidence') {
      const hasConflictLink = Array.isArray(input.documentaryEvidence) && input.documentaryEvidence.some((item) =>
        isRecord(item) && (item.kind === 'source' || item.kind === 'observation') && item.relationship === 'conflicts-with')
      if (!hasConflictLink) add(errors, 'missing-conflicting-evidence', '$.documentaryEvidence', 'Conflicting-evidence status requires a linked project source or observation marked conflicts-with.')
    }
  }

  if (input.status === 'not-reviewed' && input.validator !== null) {
    add(warnings, 'participant-before-review', '$.validator', 'A participant is assigned, but status is not-reviewed.')
  }
  if (input.status === 'supported-after-review' && input.expertResponse) {
    add(warnings, 'not-rule-promotion', '$.status', 'This status records a validation response only; it does not promote or change the software rule.')
  }

  return makeResult(errors, warnings)
}

/** Validate a non-persistent collection and catch duplicate stable validation IDs. */
export function validateValidationRecords(input: unknown): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []
  if (!Array.isArray(input)) {
    add(errors, 'invalid-record-array', '$', 'Validation records must be supplied as an array.')
    return makeResult(errors, warnings)
  }
  const ids = new Set<string>()
  input.forEach((record, index) => {
    const result = validateValidationRecord(record)
    for (const issue of result.errors) {
      errors.push({ ...issue, path: issue.path === '$' ? `$[${index}]` : `$[${index}]${issue.path.slice(1)}` })
    }
    for (const issue of result.warnings) {
      warnings.push({ ...issue, path: issue.path === '$' ? `$[${index}]` : `$[${index}]${issue.path.slice(1)}` })
    }
    if (isRecord(record) && typeof record.id === 'string' && validationIdPattern.test(record.id)) {
      if (ids.has(record.id)) add(errors, 'duplicate-validation-id', `$[${index}].id`, `Validation ID “${record.id}” is used more than once.`)
      else ids.add(record.id)
    }
  })
  return makeResult(errors, warnings)
}
