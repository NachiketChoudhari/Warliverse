import { describe, expect, it } from 'vitest';
import { referenceCollection } from './referenceCollection';
import { grammarRules } from './grammar';
import { getGrammarEvidenceCounts } from './grammarEvidence';
import type { GrammarRule } from '../grammar/types';

describe('current grammar evidence state', () => {
  it('keeps all configured rules pending while the research collection is empty', () => {
    const evidence = getGrammarEvidenceCounts(grammarRules, referenceCollection.sources);
    const rules: readonly GrammarRule[] = grammarRules;
    expect(referenceCollection).toEqual({ sources: [], artworks: [] });
    expect(grammarRules.map(({ id }) => id)).toEqual([
      'motif.allowed',
      'human.parts.required',
      'human.part.primitive',
      'theme.allowed-motifs',
    ]);
    expect(rules.every(({ sourceReferenceIds }) => (sourceReferenceIds ?? []).length === 0)).toBe(true);
    expect(evidence.sourceBackedCount).toBe(0);
    expect(evidence.pendingCount).toBe(4);
  });
});
