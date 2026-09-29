# Research Import Schema

## Version

The import envelope uses `schemaVersion: 1`. Only version 1 is currently supported. The research import template uses flat observation and measurement arrays linked to artworks by `artworkId`. For compatibility, the importer also accepts the existing version 1 `ReferenceResearchExport` shape, where those records are nested under each artwork. The importer accepts either a parsed JSON value or JSON text and validates it before producing normalized data.

## Existing record structure

Version 1 deliberately reuses the existing application schema in `src/data/references.ts`:

- `sources`: `ReferenceSource[]` at the envelope level.
- `artworks`: `ReferenceArtwork[]` at the envelope level. Each record carries its optional `attribution` object and existing artwork metadata.
- `motifObservations`: `MotifObservation` records with an additional required `artworkId` relationship.
- `grammarObservations`: `GrammarObservation` records with an additional required `artworkId` relationship.
- `measurements`: `MeasurementObservation` records with an additional required `artworkId` relationship.
- `grammarEvidence`: `GrammarEvidenceRecord[]` at the envelope level. Its `ruleId`, `sourceReferenceIds`, and `observationIds` are checked against this import and the configured software rules.

After validation, flat observation and measurement records are attached to their referenced artworks using the existing `ReferenceArtwork` fields (`motifs`, `observations`, and `measurements`). The normalized result uses the current `ReferenceResearchExport` shape. Existing exports with nested records are also accepted as v1 input.

Attribution is an optional object on a reference artwork, not an array in the current schema. This import format keeps that shape. The importer does not introduce a competing source, artwork, observation, measurement, or attribution model.

### Sources

Required fields are `id`, `title`, `sourceType`, and `documentationStatus`. Optional fields are `publisher`, `creator`, `url`, `citation`, `accessedAt`, `license`, and `notes`. Source IDs must be unique. Supplied references must resolve to a source in the same import.

### Artworks

Required fields are `id`, `title`, and `documentationStatus`. Optional fields follow `ReferenceArtwork`: `source`, `sourceType`, `artist`, `community`, `location`, `theme`, `motifs`, `observations`, `measurements`, `attribution`, `license`, and `notes`. IDs must be unique and supplied source references must resolve. Documentation status must be one of the existing `ReferenceStatus` values.

### Motif observations

Imported in top-level `motifObservations` with an `artworkId`; the record itself reuses `MotifObservation`. Required fields are `id`, `kind`, and `artworkId`; optional fields include `sourceReferenceId`, `confidence`, `notes`, `motifId`, `primitiveId`, and `description`. Supplied motif and primitive IDs must be in the configured vocabularies; confidence, when supplied, must be finite and between 0 and 1. Missing source links or motif IDs produce review warnings where appropriate. Normalized archive data stores the record under its artwork's `motifs` field.

### Grammar observations

Imported in top-level `grammarObservations` with an `artworkId`; the record itself reuses `GrammarObservation`. Required fields are `id`, `kind`, and `artworkId`; optional fields include `sourceReferenceId`, `confidence`, `notes`, `ruleId`, and `description`. Source links and supplied rule IDs must resolve. A grammar observation remains an observation; its optional `ruleId` does not change a rule's source references. Normalized archive data stores the record under its artwork's `observations` field.

### Measurements

Imported in top-level `measurements` with an `artworkId`; the record itself reuses `MeasurementObservation`. The current type requires `id` and `subject`; `value`, `unit`, `sourceReferenceId`, `confidence`, `description`, and `notes` are optional in the interface. Imported subject must be non-empty. A supplied value must be finite and requires both a unit and a resolving source reference. A descriptive measurement with no source is allowed only with a review warning and is not considered source-backed. Normalized archive data stores it under its artwork's `measurements` field.

### Attribution

Stored as the existing optional `Attribution` object on each artwork. Its optional fields are `creator`, `community`, `rightsHolder`, `statement`, and `sourceReferenceId`. A supplied source reference must resolve. Missing attribution produces a review warning; the importer does not infer or fill attribution.

### Grammar evidence

Uses existing `GrammarEvidenceRecord`: required `ruleId`, `description`, `sourceReferenceIds`, and `observationIds`. Rule IDs must resolve to an existing configured software rule; observation IDs must resolve to grammar observations in the import; source IDs must resolve to imported sources. Evidence is included as research data for review only. It never writes to `GrammarRule.sourceReferenceIds` or changes documentation status.

## Validation result

Each issue contains `code`, `path`, `message`, and `severity`. Invalid shape, unsupported versions, missing required values, duplicate IDs, invalid vocabulary/status/confidence, and unresolved references are errors. The flat `motifObservations`, `grammarObservations`, and `measurements` arrays are required in the template format; the older nested export format is accepted when those three fields are all absent. Incomplete provenance or review fields can produce warnings. Warnings do not claim that material is verified. On any error, `valid` is false and `normalizedData` is `null`; callers must not apply that payload. On success, normalized data is only a validated preview. `importResearchData` does not persist anything.

## Normalization and round-trip

The importer trims structural IDs/reference IDs and coded values, sorts records and nested observation arrays by ID, sorts grammar evidence by rule ID and evidence ID arrays, orders object keys, and removes empty optional strings. It preserves non-empty source titles, citations, and descriptions without rewriting their factual text. No timestamps, random IDs, user IDs, or machine-specific fields are inserted. `import(export(data))` returns the current artwork-nested export shape with the same research meaning and structure.

## Blank structural example

This contains no source or research records:

```json
{
  "schemaVersion": 1,
  "sources": [],
  "artworks": [],
  "motifObservations": [],
  "grammarObservations": [],
  "measurements": [],
  "grammarEvidence": []
}
```

## Review boundary

Importing sources, observations, and grammar evidence does not automatically promote a rule. Human review remains separate. The reference archive is not changed by this import utility; a future interface must show validation output and require explicit confirmation before applying valid records.
