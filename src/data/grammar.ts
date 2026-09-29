import type { GrammarRule, HumanPart, PrimitiveId } from '../grammar/types'

/** Current configurable schema used by the software representation and its validator. */
export const humanPartPrimitives = {
  head: 'circle',
  body: 'triangle',
  leftArm: 'line',
  rightArm: 'line',
  leftLeg: 'line',
  rightLeg: 'line',
} as const satisfies Record<HumanPart, PrimitiveId>

export const grammarRules = [
  { id: 'motif.allowed', description: 'A motif must exist in the configured motif vocabulary.', source: 'project-configuration', check: 'allowed-motif' },
  { id: 'human.parts.required', description: 'A configured human structure includes each defined body part.', source: 'project-configuration', check: 'required-human-parts' },
  { id: 'human.part.primitive', description: 'Each human part uses its configured primitive.', source: 'project-configuration', check: 'human-part-primitive' },
  { id: 'theme.allowed-motifs', description: 'A composition uses only motifs enabled by its selected theme configuration.', source: 'project-configuration', check: 'theme-allowed-motifs' },
] as const satisfies readonly GrammarRule[]
