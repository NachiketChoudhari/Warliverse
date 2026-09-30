import { describe, expect, it } from 'vitest';
import { grammarRules } from './grammar';
import { importResearchData } from './importResearchData';
import { createReferenceExport } from './referenceExport';
import { referenceCollection } from './referenceCollection';
import { researchCorpusV1 } from './research/researchCorpus';
import type { ReferenceCollection } from './references';
import type { ResearchImport } from './researchImport';
import type { GrammarRule } from '../grammar/types';

const fixtureCollection: ReferenceCollection = {
  sources: [{ id: 'test-source', title: 'Test fixture source', sourceType: 'other', citation: 'Test-only fixture', documentationStatus: 'pending-review' }],
  artworks: [{
    id: 'test-artwork', title: 'Test fixture artwork', source: 'test-source', documentationStatus: 'pending-review',
    attribution: { statement: 'Test-only fixture attribution', sourceReferenceId: 'test-source' },
    motifs: [{ id: 'test-motif-observation', kind: 'primitive-usage', motifId: 'human', sourceReferenceId: 'test-source', confidence: 0.5 }],
    observations: [{ id: 'test-grammar-observation', kind: 'figure-structure', ruleId: 'motif.allowed', sourceReferenceId: 'test-source', confidence: 0.5 }],
    measurements: [{ id: 'test-measurement', subject: 'Test-only measurement fixture', value: 2, unit: 'test units', sourceReferenceId: 'test-source' }],
  }],
};

const fixtureRules: readonly GrammarRule[] = grammarRules.map((rule, index) => index === 0 ? { ...rule, sourceReferenceIds: ['test-source'] } : rule);
const fixtureExport = createReferenceExport(fixtureCollection, fixtureRules);
const configuredRules: readonly GrammarRule[] = grammarRules;

function flatEnvelopeFromExport(): ResearchImport {
  return {
    schemaVersion: 1,
    sources: fixtureExport.sources,
    artworks: fixtureExport.artworks.map(({ motifs: _motifs, observations: _observations, measurements: _measurements, ...artwork }) => artwork),
    motifObservations: fixtureExport.artworks.flatMap((artwork) => (artwork.motifs ?? []).map((observation) => ({ ...observation, artworkId: artwork.id }))),
    grammarObservations: fixtureExport.artworks.flatMap((artwork) => (artwork.observations ?? []).map((observation) => ({ ...observation, artworkId: artwork.id }))),
    measurements: fixtureExport.artworks.flatMap((artwork) => (artwork.measurements ?? []).map((measurement) => ({ ...measurement, artworkId: artwork.id }))),
    grammarEvidence: fixtureExport.grammarEvidence,
  };
}

describe('research import pipeline', () => {
  it('accepts the current versioned export and reports the reviewed corpus counts', () => {
    const input = createReferenceExport(referenceCollection, grammarRules);
    const result = importResearchData(input);
    expect(result).toMatchObject({ valid: true, errors: [], counts: { sources: 7, artworks: 12, motifObservations: 9, grammarObservations: 5, measurements: 0, grammarEvidence: 4 } });
    expect(importResearchData(researchCorpusV1).counts.grammarEvidence).toBe(0);
    expect(result.normalizedData).toEqual(input);
  });

  it('accepts JSON text and preserves the meaning and structure of export data', () => {
    const result = importResearchData(JSON.stringify(fixtureExport));
    expect(result.valid).toBe(true);
    expect(result.normalizedData).toEqual(fixtureExport);
    expect(result.normalizedData?.grammarEvidence.find(({ ruleId }) => ruleId === 'motif.allowed')?.sourceReferenceIds).toEqual(['test-source']);
    expect(result.counts).toEqual({ sources: 1, artworks: 1, motifObservations: 1, grammarObservations: 1, measurements: 1, grammarEvidence: 4 });
  });

  it('accepts the flat import envelope and normalizes records into the existing artwork schema', () => {
    const input = flatEnvelopeFromExport();
    const result = importResearchData(input);
    expect(result.valid).toBe(true);
    expect(result.normalizedData).toEqual(fixtureExport);
    expect(result.counts).toEqual({ sources: 1, artworks: 1, motifObservations: 1, grammarObservations: 1, measurements: 1, grammarEvidence: 4 });
  });

  it('rejects a flat observation whose artwork relationship cannot be resolved', () => {
    const input = flatEnvelopeFromExport();
    input.motifObservations[0].artworkId = 'missing-artwork';
    const result = importResearchData(input);
    expect(result.valid).toBe(false);
    expect(result.normalizedData).toBeNull();
    expect(result.errors).toContainEqual(expect.objectContaining({ code: 'broken-artwork-reference', path: '$.motifObservations[0].artworkId' }));
  });

  it('normalizes record and evidence array order deterministically without rewriting facts', () => {
    const input = structuredClone(fixtureExport) as ResearchImport;
    input.sources[0].id = ' test-source ';
    input.artworks[0].source = ' test-source ';
    const ruleEvidenceIndex = input.grammarEvidence.findIndex(({ ruleId }) => ruleId === 'motif.allowed');
    input.grammarEvidence[ruleEvidenceIndex].sourceReferenceIds = [' test-source '];
    input.grammarEvidence[0] = { ...input.grammarEvidence[0], sourceReferenceIds: ['test-source', 'test-source'], observationIds: ['test-grammar-observation'] };
    input.artworks[0].notes = '  Preserve this text exactly.  ';
    const result = importResearchData(input);
    expect(result.valid).toBe(true);
    expect(result.normalizedData?.sources[0].id).toBe('test-source');
    expect(result.normalizedData?.artworks[0].source).toBe('test-source');
    expect(result.normalizedData?.artworks[0].notes).toBe('  Preserve this text exactly.  ');
    const second = importResearchData(JSON.stringify(result.normalizedData));
    expect(second.normalizedData).toEqual(result.normalizedData);
  });

  it('rejects invalid JSON and unsupported schema versions without normalized data', () => {
    expect(importResearchData('{')).toMatchObject({ valid: false, normalizedData: null, errors: [{ code: 'invalid-json', path: '$', severity: 'error' }] });
    const result = importResearchData({ ...fixtureExport, schemaVersion: 99 });
    expect(result.valid).toBe(false);
    expect(result.normalizedData).toBeNull();
    expect(result.errors).toContainEqual(expect.objectContaining({ code: 'unsupported-schema-version', path: '$.schemaVersion' }));
  });

  it('rejects malformed arrays, missing required fields, duplicate IDs and invalid documentation status', () => {
    const result = importResearchData({
      schemaVersion: 1,
      sources: [{ id: 'duplicate', title: '', sourceType: 'unsupported', documentationStatus: 'approved' }],
      artworks: [{ id: 'duplicate', title: 'Fixture', documentationStatus: 'pending-review' }],
      grammarEvidence: 'not-an-array',
    });
    expect(result.valid).toBe(false);
    expect(result.normalizedData).toBeNull();
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'invalid-array', path: '$.grammarEvidence' }),
      expect.objectContaining({ code: 'required-string', path: '$.sources[0].title' }),
      expect.objectContaining({ code: 'invalid-source-type', path: '$.sources[0].sourceType' }),
      expect.objectContaining({ code: 'invalid-documentation-status', path: '$.sources[0].documentationStatus' }),
      expect.objectContaining({ code: 'duplicate-id' }),
    ]));
  });

  it('rejects unknown motifs, observation kinds and invalid confidence values', () => {
    const input = structuredClone(fixtureExport) as ResearchImport;
    input.artworks[0].motifs![0].motifId = 'unconfigured-motif';
    input.artworks[0].motifs![0].confidence = 1.1;
    input.artworks[0].observations![0].kind = 'unconfigured-kind' as 'figure-structure';
    const result = importResearchData(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'invalid-motif', path: '$.artworks[0].motifs[0].motifId' }),
      expect.objectContaining({ code: 'invalid-confidence', path: '$.artworks[0].motifs[0].confidence' }),
      expect.objectContaining({ code: 'invalid-observation-kind', path: '$.artworks[0].observations[0].kind' }),
    ]));
  });

  it('requires a subject, finite value, unit and source for numerical measurements', () => {
    const input = structuredClone(fixtureExport) as ResearchImport;
    input.artworks[0].measurements![0] = { id: 'bad-measurement', subject: ' ', value: Number.NaN };
    const result = importResearchData(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'required-string', path: '$.artworks[0].measurements[0].subject' }),
      expect.objectContaining({ code: 'invalid-measurement-value', path: '$.artworks[0].measurements[0].value' }),
      expect.objectContaining({ code: 'measurement-unit-required', path: '$.artworks[0].measurements[0].unit' }),
      expect.objectContaining({ code: 'measurement-source-required', path: '$.artworks[0].measurements[0].sourceReferenceId' }),
    ]));
  });

  it('rejects broken source, artwork-observation, grammar-observation and rule links', () => {
    const input = structuredClone(fixtureExport) as ResearchImport;
    input.artworks[0].source = 'missing-source';
    input.artworks[0].observations![0].sourceReferenceId = 'missing-source';
    input.artworks[0].measurements![0].sourceReferenceId = 'missing-source';
    input.grammarEvidence[0] = { ...input.grammarEvidence[0], ruleId: 'missing-rule', sourceReferenceIds: ['missing-source'], observationIds: ['missing-observation'] };
    const result = importResearchData(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'broken-source-reference' }),
      expect.objectContaining({ code: 'unresolved-rule', path: '$.grammarEvidence[0].ruleId' }),
      expect.objectContaining({ code: 'unresolved-observation', path: '$.grammarEvidence[0].observationIds[0]' }),
    ]));
  });

  it('keeps observations and imported grammar evidence separate from configured rule provenance', () => {
    const before = configuredRules.map(({ id, sourceReferenceIds }) => [id, sourceReferenceIds]);
    const result = importResearchData(fixtureExport);
    expect(result.valid).toBe(true);
    expect(result.normalizedData?.artworks[0].observations?.[0].ruleId).toBe('motif.allowed');
    expect(configuredRules.map(({ id, sourceReferenceIds }) => [id, sourceReferenceIds])).toEqual(before);
    expect(configuredRules.every(({ sourceReferenceIds }) => (sourceReferenceIds ?? []).length === 0)).toBe(true);
  });

  it('returns review warnings without promoting a valid but incomplete observation', () => {
    const input: ResearchImport = {
      schemaVersion: 1,
      sources: [{ id: 'test-source', title: 'Test fixture source', sourceType: 'other', documentationStatus: 'pending-review' }],
      artworks: [{ id: 'test-artwork', title: 'Test fixture artwork', source: 'test-source', documentationStatus: 'pending-review' }],
      motifObservations: [],
      grammarObservations: [{ artworkId: 'test-artwork', id: 'test-observation', kind: 'composition' }],
      measurements: [],
      grammarEvidence: [],
    };
    const result = importResearchData(input);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings.map(({ code }) => code)).toContain('observation-source-review');
    expect(result.warnings.map(({ code }) => code)).toContain('no-grammar-evidence');
    expect(configuredRules.every(({ sourceReferenceIds }) => (sourceReferenceIds ?? []).length === 0)).toBe(true);
  });
});
