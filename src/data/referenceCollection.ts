import type { ReferenceCollection } from './references'
import { importResearchData } from './importResearchData'
import { researchCorpusV1 } from './research/researchCorpus'

/**
 * The reviewed v1 metadata corpus is applied only after the Phase 10 import
 * validator accepts it. Importing the corpus never changes grammar rules.
 */
const importResult = importResearchData(researchCorpusV1)

if (!importResult.valid || !importResult.normalizedData) {
  throw new Error(`Research corpus validation failed: ${importResult.errors.map(({ path, message }) => `${path}: ${message}`).join('; ')}`)
}

export const referenceCollection: ReferenceCollection = {
  sources: importResult.normalizedData.sources,
  artworks: importResult.normalizedData.artworks,
}
