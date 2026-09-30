import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ValidationWorkspacePage } from './ValidationWorkspacePage'
import { validationReviewGuides } from '../data/validationReviewGuide'
import { referenceCollection } from '../data/referenceCollection'

describe('local validation review workspace', () => {
  it('presents each configured rule, review question, and current research limitations', () => {
    const html = renderToStaticMarkup(createElement(ValidationWorkspacePage))
    expect(validationReviewGuides).toHaveLength(4)
    expect(html).toContain('Validation Review Workspace')
    expect(html).toContain('Does the configured five-item motif vocabulary represent an appropriate software vocabulary for this prototype')
    expect(validationReviewGuides.find(({ ruleId }) => ruleId === 'theme.allowed-motifs')?.limits)
      .toContain('The generator’s demo allow-lists are prototype settings, not research evidence.')
    expect(html).toContain('Nothing is saved automatically.')
    expect(html).toContain('Validate capture record')
    expect(html).not.toContain('Promote rule')
  })

  it('uses only resolvable source and observation references in the rule review guides', () => {
    const sources = new Set(referenceCollection.sources.map(({ id }) => id))
    const observations = new Set(referenceCollection.artworks.flatMap((artwork) => [
      ...(artwork.motifs ?? []).map(({ id }) => id),
      ...(artwork.observations ?? []).map(({ id }) => id),
    ]))
    for (const guide of validationReviewGuides) {
      for (const item of guide.evidence) {
        expect(sources.has(item.sourceId)).toBe(true)
        if (item.kind === 'observation') expect(observations.has(item.id)).toBe(true)
      }
    }
  })
})
