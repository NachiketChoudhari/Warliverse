import type {
  GrammarEvidenceRecord, GrammarObservation, MeasurementObservation, MotifObservation,
  ReferenceArtwork, ReferenceResearchExport, ReferenceSource,
} from './references';

/** Flat import records reuse existing observations and carry only their artwork relationship. */
export type ImportedMotifObservation = MotifObservation & { artworkId: string };
export type ImportedGrammarObservation = GrammarObservation & { artworkId: string };
export type ImportedMeasurement = MeasurementObservation & { artworkId: string };

/** Version 1 import envelope; artwork attribution remains in the existing artwork object. */
export interface ResearchImport {
  schemaVersion: 1;
  sources: ReferenceSource[];
  artworks: ReferenceArtwork[];
  motifObservations: ImportedMotifObservation[];
  grammarObservations: ImportedGrammarObservation[];
  measurements: ImportedMeasurement[];
  grammarEvidence: GrammarEvidenceRecord[];
}

export interface ResearchImportCounts {
  sources: number;
  artworks: number;
  motifObservations: number;
  grammarObservations: number;
  measurements: number;
  grammarEvidence: number;
}

export type ResearchImportSeverity = 'error' | 'warning';

export interface ResearchImportIssue {
  code: string;
  path: string;
  message: string;
  severity: ResearchImportSeverity;
}

export interface ResearchImportResult {
  valid: boolean;
  errors: ResearchImportIssue[];
  warnings: ResearchImportIssue[];
  counts: ResearchImportCounts;
  /** Null on error so callers cannot accidentally apply a failed payload. */
  normalizedData: ReferenceResearchExport | null;
}
