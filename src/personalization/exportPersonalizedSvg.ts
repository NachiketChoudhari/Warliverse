import { getProduct } from '../products'
import type { PersonalizedDesign } from './types'

function formatSvg(markup: string): string {
  const tokens = markup.match(/<[^>]+>|[^<]+/g) ?? [markup]
  let depth = 0
  const lines: string[] = []
  tokens.forEach((token) => {
    const isClosing = /^<\//.test(token)
    const isDeclaration = /^<\?|^<!/.test(token)
    const isSelfClosing = /\/>$/.test(token)
    if (isClosing) depth = Math.max(0, depth - 1)
    lines.push(`${'  '.repeat(depth)}${token}`)
    if (!isClosing && !isDeclaration && /^<[^/!?]/.test(token) && !isSelfClosing && !/<[^>]+>[^<]*<\//.test(token)) depth += 1
  })
  return `<?xml version="1.0" encoding="UTF-8"?>\n${lines.join('\n')}\n`
}

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')
}

export function exportPersonalizedSvg(design: PersonalizedDesign, renderedSvgMarkup: string): string {
  const product = getProduct(design.productId)
  if (!product) throw new Error('Composition requires review before export.')
  if (!design.validation.valid) throw new Error('Composition requires review before export.')
  if (!/^\s*<svg\b/.test(renderedSvgMarkup)) throw new Error('The selected product SVG is unavailable for export.')
  const metadata = `<metadata>${escapeXml(JSON.stringify({ productId: product.id, layoutId: design.themeId, variationId: design.id, seed: design.seed }))}</metadata>`
  const withoutExistingMetadata = renderedSvgMarkup.replace(/<metadata\b[^>]*>[\s\S]*?<\/metadata>/i, '')
  const withMetadata = withoutExistingMetadata.replace(/(<svg\b[^>]*>)/, `$1${metadata}`)
  return formatSvg(withMetadata)
}

export function downloadPersonalizedSvg(design: PersonalizedDesign, renderedSvgMarkup: string): void {
  const blob = new Blob([exportPersonalizedSvg(design, renderedSvgMarkup)], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `warliverse-${design.productId}-seed-${design.seed}.svg`
  link.click()
  URL.revokeObjectURL(url)
}
