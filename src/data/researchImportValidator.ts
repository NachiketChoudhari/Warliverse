import type { GrammarRule } from '../grammar/types';
import { motifs } from './motifs';
import { primitives } from './primitives';
import { validateReferenceCollection } from './referenceValidator';
import type { ReferenceResearchExport, ReferenceStatus } from './references';
import type { ResearchImportIssue } from './researchImport';

export const RESEARCH_IMPORT_SCHEMA_VERSION = 1 as const;
const flatObservationFields = ['motifObservations', 'grammarObservations', 'measurements'] as const;

const statuses = new Set<ReferenceStatus>(['documented', 'partially-documented', 'not-documented', 'pending-review']);
const sourceTypes = new Set(['museum', 'government', 'academic', 'field_documentation', 'artist_provided', 'other']);
const observationKinds = new Set(['primitive-usage', 'figure-structure', 'composition', 'relative-positioning', 'repetition', 'angles', 'proportions', 'motif-relationships']);
const motifIds = new Set<string>(motifs.map(({ id }) => id));
const primitiveIds = new Set<string>(primitives.map(({ id }) => id));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSafeForArchiveValidation(sources: unknown[], artworks: unknown[]): boolean {
  const safeText = (value: unknown) => value === undefined || typeof value === 'string';
  const safeObservationArray = (value: unknown) => value === undefined || (Array.isArray(value) && value.every(isRecord));
  return sources.every((source) => isRecord(source)
      && ['id', 'title', 'sourceType', 'documentationStatus'].every((field) => safeText(source[field])))
    && artworks.every((artwork) => isRecord(artwork)
      && ['id', 'title', 'documentationStatus', 'source'].every((field) => safeText(artwork[field]))
      && (artwork.attribution === undefined || isRecord(artwork.attribution))
      && safeObservationArray(artwork.motifs)
      && safeObservationArray(artwork.observations)
      && safeObservationArray(artwork.measurements)
      && [artwork.motifs, artwork.observations, artwork.measurements].filter(Array.isArray).flat().every((item) => isRecord(item)
        && ['id', 'sourceReferenceId', 'kind', 'motifId', 'primitiveId', 'ruleId', 'documentationStatus'].every((field) => safeText(item[field]))));
}

function validateFallbackIntegrity(sources: unknown[], artworks: unknown[], errors: ResearchImportIssue[]) {
  const ids = new Set<string>();
  const sourceIds = new Set(sources.filter(isRecord).map((source) => source.id).filter((id): id is string => typeof id === 'string'));
  const register = (value: unknown, path: string) => {
    if (typeof value !== 'string' || !value.trim()) return;
    if (ids.has(value)) add(errors, 'duplicate-id', path, `ID “${value}” is used more than once in this import.`);
    else ids.add(value);
  };
  const checkSource = (value: unknown, path: string) => {
    if (typeof value === 'string' && value.trim() && !sourceIds.has(value)) add(errors, 'broken-source-reference', path, `Source ID “${value}” does not resolve in this import.`);
  };
  sources.forEach((source, index) => { if (isRecord(source)) register(source.id, `$.sources[${index}].id`); });
  artworks.forEach((artwork, index) => {
    if (!isRecord(artwork)) return;
    register(artwork.id, `$.artworks[${index}].id`);
    checkSource(artwork.source, `$.artworks[${index}].source`);
    if (isRecord(artwork.attribution)) checkSource(artwork.attribution.sourceReferenceId, `$.artworks[${index}].attribution.sourceReferenceId`);
    for (const [field, array] of [['motifs', artwork.motifs], ['observations', artwork.observations], ['measurements', artwork.measurements]] as const) {
      if (!Array.isArray(array)) continue;
      array.forEach((item, itemIndex) => {
        if (!isRecord(item)) return;
        register(item.id, `$.artworks[${index}].${field}[${itemIndex}].id`);
        checkSource(item.sourceReferenceId, `$.artworks[${index}].${field}[${itemIndex}].sourceReferenceId`);
      });
    }
  });
}

function add(issues: ResearchImportIssue[], code: string, path: string, message: string, severity: 'error' | 'warning' = 'error') {
  issues.push({ code, path, message, severity });
}

/** Converts flat v1 import records to the existing artwork-nested export model. */
export function normalizeResearchImportEnvelope(input: unknown): { data: unknown; errors: ResearchImportIssue[] } {
  const errors: ResearchImportIssue[] = [];
  if (!isRecord(input)) return { data: input, errors };
  const hasFlatRecords = flatObservationFields.some((field) => Object.hasOwn(input, field));
  if (!hasFlatRecords) return { data: input, errors }; // Existing ReferenceResearchExport v1 input.
  for (const field of flatObservationFields) {
    if (!Array.isArray(input[field])) add(errors, 'invalid-array', `$.${field}`, 'Expected an array in the flat research import envelope.');
  }
  if (Object.hasOwn(input, 'attribution')) add(errors, 'invalid-attribution-shape', '$.attribution', 'Attribution belongs to its ReferenceArtwork object in the existing schema.');
  if (errors.length) return { data: input, errors };
  if (!Array.isArray(input.artworks)) return { data: input, errors };

  const artworks = input.artworks.map((artwork) => isRecord(artwork) ? { ...artwork } : artwork);
  const links: Array<{ envelopeField: typeof flatObservationFields[number]; artworkField: 'motifs' | 'observations' | 'measurements' }> = [
    { envelopeField: 'motifObservations', artworkField: 'motifs' },
    { envelopeField: 'grammarObservations', artworkField: 'observations' },
    { envelopeField: 'measurements', artworkField: 'measurements' },
  ];
  for (const { envelopeField, artworkField } of links) {
    const records = input[envelopeField] as unknown[];
    const grouped = new Map<number, Record<string, unknown>[]>();
    records.forEach((item, index) => {
      const path = `$.${envelopeField}[${index}]`;
      if (!isRecord(item)) { add(errors, 'invalid-record', path, 'Expected an observation or measurement object.'); return; }
      requiredString(item.artworkId, `${path}.artworkId`, errors);
      if (typeof item.artworkId !== 'string') return;
      const artworkIndex = artworks.findIndex((artwork) => isRecord(artwork) && artwork.id === item.artworkId);
      if (artworkIndex < 0) { add(errors, 'broken-artwork-reference', `${path}.artworkId`, 'Artwork ID does not resolve to an artwork in this import.'); return; }
      const { artworkId: _artworkId, ...observation } = item;
      grouped.set(artworkIndex, [...(grouped.get(artworkIndex) ?? []), observation]);
    });
    grouped.forEach((observations, artworkIndex) => {
      const artwork = artworks[artworkIndex];
      if (!isRecord(artwork)) return;
      const existing = Array.isArray(artwork[artworkField]) ? artwork[artworkField] as unknown[] : [];
      if (existing.length > 0) {
        add(errors, 'duplicate-observation-representation', `$.${envelopeField}`, 'Do not supply records both nested on an artwork and in the flat import array.');
        return;
      }
      artworks[artworkIndex] = { ...artwork, [artworkField]: observations };
    });
  }
  return {
    data: {
      schemaVersion: input.schemaVersion,
      sources: input.sources,
      artworks,
      grammarEvidence: input.grammarEvidence,
    },
    errors,
  };
}

function requiredString(value: unknown, path: string, issues: ResearchImportIssue[]) {
  if (typeof value !== 'string' || value.trim() === '') add(issues, 'required-string', path, 'A non-empty string is required.');
}

function optionalStrings(record: Record<string, unknown>, keys: readonly string[], path: string, issues: ResearchImportIssue[]) {
  for (const key of keys) {
    if (record[key] !== undefined && typeof record[key] !== 'string') add(issues, 'invalid-field-type', `${path}.${key}`, 'Expected a string when this optional field is supplied.');
  }
}

function observationMetadata(record: Record<string, unknown>, path: string, issues: ResearchImportIssue[]) {
  optionalStrings(record, ['sourceReferenceId', 'notes', 'documentationStatus'], path, issues);
  if (typeof record.documentationStatus === 'string' && !statuses.has(record.documentationStatus as ReferenceStatus)) add(issues, 'invalid-documentation-status', `${path}.documentationStatus`, 'Documentation status is not part of the configured schema.');
  if (record.confidence !== undefined && (typeof record.confidence !== 'number' || !Number.isFinite(record.confidence) || record.confidence < 0 || record.confidence > 1)) {
    add(issues, 'invalid-confidence', `${path}.confidence`, 'Confidence must be a finite number from 0 through 1.');
  }
  if (typeof record.confidence !== 'number' && record.sourceReferenceId) {
    add(issues, 'review-recommended', `${path}.confidence`, 'Review the observation confidence as part of human review.', 'warning');
  }
}

function checkObservation(value: unknown, kind: 'motif' | 'grammar', path: string, issues: ResearchImportIssue[]) {
  if (!isRecord(value)) {
    add(issues, 'invalid-record', path, 'Expected an observation object.');
    return;
  }
  requiredString(value.id, `${path}.id`, issues);
  requiredString(value.kind, `${path}.kind`, issues);
  observationMetadata(value, path, issues);
  if (typeof value.kind === 'string' && !observationKinds.has(value.kind)) add(issues, 'invalid-observation-kind', `${path}.kind`, 'Observation kind is not part of the configured schema.');
  if (kind === 'motif') {
    optionalStrings(value, ['motifId', 'primitiveId', 'description'], path, issues);
    if (value.motifId === undefined) add(issues, 'motif-needs-review', `${path}.motifId`, 'No motif ID is supplied; review whether this record is a motif observation.', 'warning');
    else if (typeof value.motifId === 'string' && !motifIds.has(value.motifId)) add(issues, 'invalid-motif', `${path}.motifId`, 'Motif ID is not in the configured vocabulary.');
    if (typeof value.primitiveId === 'string' && !primitiveIds.has(value.primitiveId)) add(issues, 'invalid-primitive', `${path}.primitiveId`, 'Primitive ID is not in the configured vocabulary.');
  } else {
    optionalStrings(value, ['ruleId', 'description'], path, issues);
  }
}

/** Validate an unknown JSON payload without mutating data or grammar rules. */
export function validateResearchImport(input: unknown, configuredRules: readonly GrammarRule[]): { errors: ResearchImportIssue[]; warnings: ResearchImportIssue[] } {
  const errors: ResearchImportIssue[] = [];
  const warnings: ResearchImportIssue[] = [];
  const issues = { errors, warnings };
  const normalizedEnvelope = normalizeResearchImportEnvelope(input);
  errors.push(...normalizedEnvelope.errors);
  input = normalizedEnvelope.data;
  if (!isRecord(input)) {
    add(errors, 'invalid-envelope', '$', 'Import must be a JSON object.');
    return issues;
  }
  if (input.schemaVersion === undefined) add(errors, 'missing-schema-version', '$.schemaVersion', 'schemaVersion is required.');
  else if (input.schemaVersion !== RESEARCH_IMPORT_SCHEMA_VERSION) add(errors, 'unsupported-schema-version', '$.schemaVersion', `Only schemaVersion ${RESEARCH_IMPORT_SCHEMA_VERSION} is supported.`);

  for (const key of ['sources', 'artworks', 'grammarEvidence']) {
    if (!Array.isArray(input[key])) add(errors, 'invalid-array', `$.${key}`, 'Expected an array.');
  }
  const sourceRecords = Array.isArray(input.sources) ? input.sources : [];
  const artworkRecords = Array.isArray(input.artworks) ? input.artworks : [];
  const evidenceRecords = Array.isArray(input.grammarEvidence) ? input.grammarEvidence : [];

  sourceRecords.forEach((source, index) => {
    const path = `$.sources[${index}]`;
    if (!isRecord(source)) { add(errors, 'invalid-record', path, 'Expected a source object.'); return; }
    for (const field of ['id', 'title', 'sourceType', 'documentationStatus']) requiredString(source[field], `${path}.${field}`, errors);
    optionalStrings(source, ['publisher', 'creator', 'url', 'citation', 'accessedAt', 'license', 'notes'], path, errors);
    if (typeof source.sourceType === 'string' && !sourceTypes.has(source.sourceType)) add(errors, 'invalid-source-type', `${path}.sourceType`, 'Source type is not part of the configured schema.');
    if (typeof source.documentationStatus === 'string' && !statuses.has(source.documentationStatus as ReferenceStatus)) add(errors, 'invalid-documentation-status', `${path}.documentationStatus`, 'Documentation status is not part of the configured schema.');
    if (!source.url && !source.citation) add(warnings, 'source-locator-review', path, 'Review how this source can be independently located.', 'warning');
  });

  artworkRecords.forEach((artwork, index) => {
    const path = `$.artworks[${index}]`;
    if (!isRecord(artwork)) { add(errors, 'invalid-record', path, 'Expected an artwork object.'); return; }
    for (const field of ['id', 'title', 'documentationStatus']) requiredString(artwork[field], `${path}.${field}`, errors);
    optionalStrings(artwork, ['source', 'sourceType', 'artist', 'community', 'location', 'theme', 'license', 'notes'], path, errors);
    if (typeof artwork.documentationStatus === 'string' && !statuses.has(artwork.documentationStatus as ReferenceStatus)) add(errors, 'invalid-documentation-status', `${path}.documentationStatus`, 'Documentation status is not part of the configured schema.');
    if (!artwork.source) add(warnings, 'artwork-source-review', `${path}.source`, 'No source is linked to this artwork record; review its provenance.', 'warning');
    if (!artwork.attribution) add(warnings, 'attribution-review', `${path}.attribution`, 'No attribution object is recorded; review attribution and usage information.', 'warning');
    if (artwork.sourceType !== undefined && typeof artwork.sourceType === 'string' && !sourceTypes.has(artwork.sourceType)) add(errors, 'invalid-source-type', `${path}.sourceType`, 'Source type is not part of the configured schema.');
    for (const key of ['motifs', 'observations', 'measurements']) {
      if (artwork[key] !== undefined && !Array.isArray(artwork[key])) add(errors, 'invalid-array', `${path}.${key}`, 'Expected an array when this optional collection is supplied.');
    }
    if (artwork.attribution !== undefined) {
      if (!isRecord(artwork.attribution)) add(errors, 'invalid-attribution', `${path}.attribution`, 'Attribution must use the existing artwork attribution object.');
      else optionalStrings(artwork.attribution, ['creator', 'community', 'rightsHolder', 'statement', 'sourceReferenceId'], `${path}.attribution`, errors);
    }
    if (Array.isArray(artwork.motifs)) artwork.motifs.forEach((observation, i) => {
      checkObservation(observation, 'motif', `${path}.motifs[${i}]`, issues.errors);
      if (isRecord(observation) && !observation.sourceReferenceId) add(warnings, 'observation-source-review', `${path}.motifs[${i}].sourceReferenceId`, 'Review source support before treating this observation as documented.', 'warning');
    });
    if (Array.isArray(artwork.observations)) artwork.observations.forEach((observation, i) => {
      checkObservation(observation, 'grammar', `${path}.observations[${i}]`, issues.errors);
      if (isRecord(observation) && !observation.sourceReferenceId) add(warnings, 'observation-source-review', `${path}.observations[${i}].sourceReferenceId`, 'Review source support before treating this observation as documented.', 'warning');
      if (isRecord(observation) && typeof observation.ruleId === 'string' && observation.ruleId && !configuredRules.some(({ id }) => id === observation.ruleId)) add(errors, 'unresolved-rule', `${path}.observations[${i}].ruleId`, 'Rule ID does not resolve to a configured software rule.');
    });
    if (Array.isArray(artwork.measurements)) artwork.measurements.forEach((measurement, i) => {
      const measurementPath = `${path}.measurements[${i}]`;
      if (!isRecord(measurement)) { add(errors, 'invalid-record', measurementPath, 'Expected a measurement object.'); return; }
      requiredString(measurement.id, `${measurementPath}.id`, errors);
      requiredString(measurement.subject, `${measurementPath}.subject`, errors);
      optionalStrings(measurement, ['sourceReferenceId', 'unit', 'description', 'notes'], measurementPath, errors);
      if (measurement.value !== undefined && (typeof measurement.value !== 'number' || !Number.isFinite(measurement.value))) add(errors, 'invalid-measurement-value', `${measurementPath}.value`, 'Measurement value must be a finite number.');
      if (measurement.value !== undefined && (typeof measurement.unit !== 'string' || measurement.unit.trim() === '')) add(errors, 'measurement-unit-required', `${measurementPath}.unit`, 'A unit is required when a numerical value is supplied.');
      if (measurement.value !== undefined && (typeof measurement.sourceReferenceId !== 'string' || !measurement.sourceReferenceId.trim())) add(errors, 'measurement-source-required', `${measurementPath}.sourceReferenceId`, 'A numerical measurement requires a source reference.');
      if (measurement.value === undefined && !measurement.sourceReferenceId) add(warnings, 'measurement-source-review', `${measurementPath}.sourceReferenceId`, 'This measurement has no source reference and cannot be treated as source-backed.', 'warning');
    });
  });

  evidenceRecords.forEach((evidence, index) => {
    const path = `$.grammarEvidence[${index}]`;
    if (!isRecord(evidence)) { add(errors, 'invalid-record', path, 'Expected a grammar evidence object.'); return; }
    for (const field of ['ruleId', 'description']) requiredString(evidence[field], `${path}.${field}`, errors);
    for (const field of ['sourceReferenceIds', 'observationIds']) {
      if (!Array.isArray(evidence[field])) add(errors, 'invalid-array', `${path}.${field}`, 'Expected an array.');
      else evidence[field].forEach((id, i) => requiredString(id, `${path}.${field}[${i}]`, errors));
    }
  });

  // Reuse archive validation for duplicate IDs and broken source links after shape checks.
  if (isSafeForArchiveValidation(sourceRecords, artworkRecords)) {
    const collection = { sources: sourceRecords, artworks: artworkRecords } as unknown as ReferenceResearchExport;
    const archive = validateReferenceCollection(collection, configuredRules);
    for (const issue of archive.issues) add(errors, issue.code, `$.${issue.recordType}${issue.recordId ? `.${issue.recordId}` : ''}.${issue.field}`, issue.message);
  } else validateFallbackIntegrity(sourceRecords, artworkRecords, errors);

  const sourceIds = new Set(sourceRecords.filter(isRecord).map((source) => source.id).filter((id): id is string => typeof id === 'string'));
  const grammarObservations = artworkRecords.filter(isRecord).flatMap((artwork) => Array.isArray(artwork.observations) ? artwork.observations.filter(isRecord) : []);
  const observationIds = new Set(grammarObservations.map(({ id }) => id).filter((id): id is string => typeof id === 'string'));
  const ruleIds = new Set(configuredRules.map(({ id }) => id));
  evidenceRecords.forEach((evidence, index) => {
    if (!isRecord(evidence)) return;
    const path = `$.grammarEvidence[${index}]`;
    if (typeof evidence.ruleId === 'string' && !ruleIds.has(evidence.ruleId)) add(errors, 'unresolved-rule', `${path}.ruleId`, 'Rule ID does not resolve to a configured software rule.');
    if (Array.isArray(evidence.observationIds)) evidence.observationIds.forEach((id, i) => {
      if (typeof id === 'string' && !observationIds.has(id)) add(errors, 'unresolved-observation', `${path}.observationIds[${i}]`, 'Observation ID does not resolve to a grammar observation in this import.');
    });
    if (Array.isArray(evidence.sourceReferenceIds)) evidence.sourceReferenceIds.forEach((id, i) => {
      if (typeof id === 'string' && !sourceIds.has(id)) add(errors, 'broken-source-reference', `${path}.sourceReferenceIds[${i}]`, 'Source ID does not resolve to a source in this import.');
    });
  });
  if (evidenceRecords.length === 0) add(warnings, 'no-grammar-evidence', '$.grammarEvidence', 'No grammar evidence records are included; no rules will be source-backed.', 'warning');
  return issues;
}
