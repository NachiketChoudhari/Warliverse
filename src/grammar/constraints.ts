import type { MetricKey } from './types'

export interface NumericConstraint {
  key: MetricKey
  status: 'not-configured'
  value: null
  unit: null
  reason: string
}

const notConfigured = (key: MetricKey): NumericConstraint => ({
  key,
  status: 'not-configured',
  value: null,
  unit: null,
  reason: 'No supporting measurement or threshold is configured from project reference material.',
})

export const constraints: Record<MetricKey, NumericConstraint> = {
  'head-body-ratio': notConfigured('head-body-ratio'),
  'limb-angle': notConfigured('limb-angle'),
  'primitive-count': notConfigured('primitive-count'),
  'motif-count': notConfigured('motif-count'),
  'composition-density': notConfigured('composition-density'),
}
