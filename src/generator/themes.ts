import { motifs } from '../data/motifs'
import type { DemoThemeConfiguration } from './types'

const configuredMotifIds = motifs.map(({ id }) => id)
const humanAndTree = configuredMotifIds.filter((id) => id === 'human' || id === 'tree')

/** Explicit UI/demo layouts. These are not reference-derived cultural themes or rules. */
export const demoThemes: readonly DemoThemeConfiguration[] = [
  {
    id: 'demo-all-motifs',
    label: 'Demo — all configured motifs',
    description: 'A prototype arrangement using the currently configured motif vocabulary.',
    configurationStatus: 'prototype-demo',
    allowedMotifs: configuredMotifIds,
    minElements: 7,
    maxElements: 12,
  },
  {
    id: 'demo-humans-trees',
    label: 'Demo — humans and trees',
    description: 'A prototype arrangement limited to the human and tree motif renderers.',
    configurationStatus: 'prototype-demo',
    allowedMotifs: humanAndTree,
    minElements: 5,
    maxElements: 9,
  },
]
