import { grammarRules } from './grammar';
import { normalizeResearchImportEnvelope, validateResearchImport } from './researchImportValidator';
import type { ResearchImportCounts, ResearchImportIssue, ResearchImportResult } from './researchImport';
import type { ReferenceResearchExport } from './references';

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function countInput(value: unknown): ResearchImportCounts {
  const zero = { sources: 0, artworks: 0, motifObservations: 0, grammarObservations: 0, measurements: 0, grammarEvidence: 0 };
  if (!record(value)) return zero;
  const array = (key: string) => Array.isArray(value[key]) ? value[key] as unknown[] : [];
  const artworks = array('artworks').filter(record);
  return {
    sources: array('sources').length,
    artworks: array('artworks').length,
    motifObservations: array('motifObservations').length + artworks.reduce((n, item) => n + (Array.isArray(item.motifs) ? item.motifs.length : 0), 0),
    grammarObservations: array('grammarObservations').length + artworks.reduce((n, item) => n + (Array.isArray(item.observations) ? item.observations.length : 0), 0),
    measurements: array('measurements').length + artworks.reduce((n, item) => n + (Array.isArray(item.measurements) ? item.measurements.length : 0), 0),
    grammarEvidence: array('grammarEvidence').length,
  };
}

const identifierFields = new Set(['id', 'artworkId', 'source', 'sourceType', 'documentationStatus', 'sourceReferenceId', 'sourceReferenceIds', 'observationIds', 'kind', 'motifId', 'primitiveId', 'ruleId']);

function stableObject(value: unknown, field?: string): unknown {
  if (Array.isArray(value)) return value.map((item) => stableObject(item, field));
  if (typeof value === 'string' && identifierFields.has(field ?? '')) return value.trim();
  if (!record(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().flatMap((key) => {
    const field = value[key];
    if (field === undefined || (typeof field === 'string' && field.trim() === '')) return [];
    return [[key, stableObject(field, key)]];
  }));
}

function sortById<T extends { id: string }>(items: readonly T[]) {
  return [...items].sort((a, b) => a.id.localeCompare(b.id));
}

function normalize(data: ReferenceResearchExport): ReferenceResearchExport {
  const artworks = sortById(data.artworks).map((artwork) => ({
    ...artwork,
    ...(artwork.motifs ? { motifs: sortById(artwork.motifs) } : {}),
    ...(artwork.observations ? { observations: sortById(artwork.observations) } : {}),
    ...(artwork.measurements ? { measurements: sortById(artwork.measurements) } : {}),
  }));
  const result: ReferenceResearchExport = {
    schemaVersion: 1,
    sources: sortById(data.sources),
    artworks,
    grammarEvidence: [...data.grammarEvidence].map((evidence) => ({
      ...evidence,
      sourceReferenceIds: [...evidence.sourceReferenceIds].sort(),
      observationIds: [...evidence.observationIds].sort(),
    })).sort((a, b) => a.ruleId.localeCompare(b.ruleId)),
  };
  return stableObject(result) as ReferenceResearchExport;
}

function fail(errors: ResearchImportIssue[], counts: ResearchImportCounts, warnings: ResearchImportIssue[] = []): ResearchImportResult {
  return { valid: false, errors, warnings, counts, normalizedData: null };
}

/** Pure local import preparation. It never persists data or changes grammar rules. */
export function importResearchData(input: unknown): ResearchImportResult {
  const errors: ResearchImportIssue[] = [];
  let parsed = input;
  if (typeof input === 'string') {
    try { parsed = JSON.parse(input) as unknown; }
    catch (error) {
      const detail = error instanceof Error ? error.message : 'Invalid JSON.';
      errors.push({ code: 'invalid-json', path: '$', message: detail, severity: 'error' });
      return fail(errors, countInput(null));
    }
  }
  const counts = countInput(parsed);
  const candidate = stableObject(parsed);
  const envelope = normalizeResearchImportEnvelope(candidate);
  const validation = validateResearchImport(envelope.data, grammarRules);
  const allErrors = [...envelope.errors, ...validation.errors];
  if (allErrors.length) return fail(allErrors, counts, validation.warnings);
  const normalizedData = normalize(envelope.data as ReferenceResearchExport);
  return { valid: true, errors, warnings: validation.warnings, counts, normalizedData };
}
