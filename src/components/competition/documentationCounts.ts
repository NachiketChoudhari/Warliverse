import { referenceCollection } from '../../data/referenceCollection';
import { grammarRules } from '../../data/grammar';
import { getGrammarEvidenceCounts } from '../../data/grammarEvidence';

/** Current counts derived from the real project collection and configured grammar. */
export function getDocumentationStatus() {
  const evidence = getGrammarEvidenceCounts(grammarRules, referenceCollection.sources);
  return {
    referenceRecords: referenceCollection.artworks.length,
    sourceBackedRules: evidence.sourceBackedCount,
    rulesPendingDocumentation: evidence.pendingCount,
  };
}
