import { constraints } from './constraints'
import type { GrammarSubject, MetricKey, MetricResult } from './types'

/** Counts motifs in a supplied composition; this is a software count, not a cultural measure. */
export function measureMotifCount(subject: GrammarSubject): MetricResult {
  return { status: 'configured', key: 'motif-count', value: subject.motifs.length, unit: 'motifs' }
}

/** Counts explicitly represented human parts; other motif structures are not configured yet. */
export function measurePrimitiveCount(subject: GrammarSubject): MetricResult {
  const hasUnconfiguredMotif = subject.motifs.some((motif) => motif.motif !== 'human')
  if (hasUnconfiguredMotif) return notConfigured('primitive-count')

  const value = subject.motifs.reduce((count, motif) => {
    return count + Object.keys(motif.structure ?? {}).length
  }, 0)
  return { status: 'configured', key: 'primitive-count', value, unit: 'primitives' }
}

export function notConfigured(key: MetricKey): MetricResult {
  const constraint = constraints[key]
  return { status: constraint.status, key, reason: constraint.reason }
}

export function measureHeadBodyRatio(): MetricResult {
  return notConfigured('head-body-ratio')
}

export function measureLimbAngle(): MetricResult {
  return notConfigured('limb-angle')
}

export function measureCompositionDensity(): MetricResult {
  return notConfigured('composition-density')
}
