import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ReferencesPage } from './ReferencesPage'

describe('empty reference archive page', () => {
  it('renders an intentional empty state and source-backed rule count', () => {
    const html = renderToStaticMarkup(createElement(ReferencesPage))
    expect(html).toContain('Reference Archive')
    expect(html).toContain('No reference records have been added yet.')
    expect(html).toContain('Source-backed grammar rules: 0')
    expect(html).toContain('Add source material after review and attribution.')
    expect(html).toContain('No source-backed grammar rule has been established.')
  })
})
