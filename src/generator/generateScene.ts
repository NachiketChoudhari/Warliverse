import { humanPartPrimitives } from '../data/grammar'
import { motifs } from '../data/motifs'
import { primitives } from '../data/primitives'
import type { MotifId, PrimitiveId } from '../grammar/types'
import { createSeededRandom, randomInteger } from './random'
import { demoThemes } from './themes'
import { generateHumanMetadata } from './generateHuman'
import type { GeneratedElement, SceneGenerationResult } from './types'

const canvasWidth = 800
const canvasHeight = 420

/** Primitive dependencies of the existing SVG renderers, configured for software composition. */
export const rendererPrimitiveUsage = {
  human: Object.values(humanPartPrimitives),
  tree: ['line', 'triangle', 'circle'],
  hut: ['triangle', 'line', 'line', 'line', 'line', 'line'],
  animal: ['line', 'circle', 'line', 'line', 'line', 'line'],
  sun: ['circle', 'line', 'line', 'line', 'line', 'line', 'line', 'line', 'line'],
} as const satisfies Record<MotifId, readonly PrimitiveId[]>

const configuredMotifIds = new Set<string>(motifs.map(({ id }) => id))
const configuredPrimitiveIds = new Set<string>(primitives.map(({ id }) => id))

/** Generates a scene using only the selected, explicit prototype/demo allow-list. */
export function generateScene(seed: number, themeId: string): SceneGenerationResult {
  const theme = demoThemes.find(({ id }) => id === themeId)
  if (!theme) {
    return {
      status: 'unsupported-theme',
      themeId,
      message: 'This theme is not configured. Choose one of the available prototype/demo configurations.',
    }
  }

  const allowedMotifs = theme.allowedMotifs.filter((motif) => {
    const hasMotif = configuredMotifIds.has(motif)
    const rendererPrimitivesAreConfigured = rendererPrimitiveUsage[motif].every((primitive) => configuredPrimitiveIds.has(primitive))
    return hasMotif && rendererPrimitivesAreConfigured
  })

  if (allowedMotifs.length === 0) {
    return {
      status: 'unsupported-theme',
      themeId,
      message: 'This theme has no motifs supported by the configured primitive and motif vocabularies.',
    }
  }

  const random = createSeededRandom(seed)
  const elementCount = Math.max(allowedMotifs.length, randomInteger(random, theme.minElements, theme.maxElements))
  const selectedMotifs = [...allowedMotifs]

  while (selectedMotifs.length < elementCount) {
    selectedMotifs.push(allowedMotifs[randomInteger(random, 0, allowedMotifs.length - 1)])
  }

  for (let index = selectedMotifs.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(random, 0, index)
    ;[selectedMotifs[index], selectedMotifs[swapIndex]] = [selectedMotifs[swapIndex], selectedMotifs[index]]
  }

  const elements: GeneratedElement[] = selectedMotifs.map((motif, index) => {
    const x = randomInteger(random, 14, Math.max(14, canvasWidth - 114))
    const y = randomInteger(random, 14, Math.max(14, canvasHeight - 114))
    // These scale and rotation ranges are renderer presentation settings, not documented measurements.
    const scale = Math.round((0.72 + random() * 0.35) * 100) / 100
    const rotation = Math.round((random() * 16 - 8) * 10) / 10
    return {
      id: `element-${index + 1}`,
      motif,
      x,
      y,
      scale,
      rotation,
      metadata: motif === 'human'
        ? generateHumanMetadata()
        : { primitiveIds: rendererPrimitiveUsage[motif] },
    }
  })

  return { status: 'generated', theme, elements }
}

export const GENERATOR_CANVAS_SIZE = { width: canvasWidth, height: canvasHeight } as const
