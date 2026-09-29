import { humanPartPrimitives } from '../data/grammar'
import { motifs } from '../data/motifs'
import type { GrammarSubject, GrammarViolation, HumanPart, ValidationResult } from './types'

const knownMotifs = new Set<string>(motifs.map(({ id }) => id))
const primitiveIds = new Set<string>(['circle', 'triangle', 'line'])
const humanParts = Object.keys(humanPartPrimitives) as HumanPart[]

/** Checks configured schema rules only. It does not judge cultural authenticity. */
export function validateGrammar(subject: GrammarSubject): ValidationResult {
  const violations: GrammarViolation[] = []

  subject.motifs.forEach((instance, motifIndex) => {
    if (!knownMotifs.has(instance.motif)) {
      violations.push({
        ruleId: 'motif.allowed',
        code: 'unknown-motif',
        message: `Motif “${instance.motif}” is not in the configured vocabulary.`,
        motifIndex,
      })
      return
    }

    if (instance.motif !== 'human') return

    if (!instance.structure) {
      violations.push({
        ruleId: 'human.parts.required',
        code: 'missing-human-structure',
        message: 'A human motif needs a configured structural representation.',
        motifIndex,
      })
      return
    }

    humanParts.forEach((part) => {
      const primitive = instance.structure?.[part]
      if (primitive === undefined) {
        violations.push({
          ruleId: 'human.parts.required',
          code: 'missing-part',
          message: `The human structure is missing “${part}”.`,
          motifIndex,
          part,
        })
      } else if (!primitiveIds.has(primitive)) {
        violations.push({
          ruleId: 'human.part.primitive',
          code: 'invalid-primitive',
          message: `The configured primitive for “${part}” is not recognized.`,
          motifIndex,
          part,
        })
      } else if (primitive !== humanPartPrimitives[part]) {
        violations.push({
          ruleId: 'human.part.primitive',
          code: 'invalid-primitive',
          message: `“${part}” uses “${primitive}”; the configured representation uses “${humanPartPrimitives[part]}”.`,
          motifIndex,
          part,
        })
      }
    })
  })

  return { valid: violations.length === 0, violations }
}
