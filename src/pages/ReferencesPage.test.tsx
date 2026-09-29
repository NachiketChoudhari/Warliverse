import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ReferencesPage } from './ReferencesPage'
import type { ReferenceCollection } from '../data/references'
import type { ComponentType } from 'react'

const ReferencesPageWithCollection = ReferencesPage as ComponentType<{ collection?: ReferenceCollection }>

describe('empty reference archive page', () => {
  it('renders an intentional empty state and source-backed rule count', () => {
    const emptyCollection: ReferenceCollection = { sources: [], artworks: [] }
    const html = renderToStaticMarkup(createElement(ReferencesPageWithCollection, { collection: emptyCollection }))
    expect(html).toContain('Reference Archive')
    expect(html).toContain('No reference records have been added yet.')
    expect(html).toContain('Source-backed grammar rules: 0')
    expect(html).toContain('Add source material after review and attribution.')
    expect(html).toContain('No source-backed grammar rule has been established.')
  })

  it('renders the reviewed corpus records without implying source-backed rules', () => {
    const html = renderToStaticMarkup(createElement(ReferencesPage))
    expect(html).toContain('7 artwork records · 6 sources')
    expect(html).toContain('Source-backed grammar rules: 0')
    expect(html).not.toContain('No reference records have been added yet.')
  })
})
