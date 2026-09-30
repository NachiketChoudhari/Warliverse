import { grammarRules } from './grammar'
import { referenceCollection } from './referenceCollection'
import type { ValidationRuleId } from './validationTypes'

export interface ReviewEvidenceItem {
  kind: 'source' | 'observation'
  id: string
  sourceId: string
  label: string
  summary: string
}

export interface ValidationReviewGuide {
  ruleId: ValidationRuleId
  title: string
  softwareClaim: string
  question: string
  evidence: ReviewEvidenceItem[]
  limits: string[]
}

const observations = referenceCollection.artworks.flatMap((artwork) => [
  ...(artwork.motifs ?? []).map((observation) => ({ artwork, observation })),
  ...(artwork.observations ?? []).map((observation) => ({ artwork, observation })),
])

function observationEvidence(id: string): ReviewEvidenceItem {
  const match = observations.find(({ observation }) => observation.id === id)
  if (!match?.observation.sourceReferenceId) throw new Error(`Review guide observation “${id}” is not source-linked.`)
  return {
    kind: 'observation',
    id,
    sourceId: match.observation.sourceReferenceId,
    label: `${match.artwork.title} — ${id}`,
    summary: match.observation.description ?? match.observation.notes ?? 'Source-linked observation; no summary is recorded.',
  }
}

function sourceEvidence(id: string, summary: string): ReviewEvidenceItem {
  const source = referenceCollection.sources.find((item) => item.id === id)
  if (!source) throw new Error(`Review guide source “${id}” is not in the current research corpus.`)
  return { kind: 'source', id, sourceId: id, label: source.title, summary }
}

const descriptions = Object.fromEntries(grammarRules.map(({ id, description }) => [id, description])) as Record<ValidationRuleId, string>

/** Source and observation references used to prepare a review, not validation records. */
export const validationReviewGuides: readonly ValidationReviewGuide[] = [
  {
    ruleId: 'motif.allowed',
    title: 'Configured motif vocabulary',
    softwareClaim: `${descriptions['motif.allowed']} Configured IDs: human, tree, hut, animal, sun.`,
    question: 'Does the configured five-item motif vocabulary represent an appropriate software vocabulary for this prototype, or does the documented material require additional/different motif categories?',
    evidence: [
      observationEvidence('rao-2022-fig2-motif-human-01'),
      observationEvidence('dsource-tree-of-life-motif-tree-01'),
      observationEvidence('dsource-tree-of-life-motif-human-01'),
      observationEvidence('dsource-tree-of-life-motif-animal-01'),
      observationEvidence('dsource-tree-of-life-motif-sun-01'),
      observationEvidence('dsource-rice-tarpa-motif-human-01'),
      observationEvidence('dsource-rice-tarpa-motif-animal-01'),
      observationEvidence('dsource-harvest-motif-human-01'),
      observationEvidence('dsource-harvest-motif-animal-01'),
    ],
    limits: [
      'The records document selected positive examples; they do not establish an exhaustive vocabulary.',
      'No motif observation is recorded for hut. D’SOURCE describes houses and also names fields, water, and mountains, which are not current motif IDs.',
      'The eight D’SOURCE motif records come from three descriptions in one publication; the Rao example is secondary and single-source.',
    ],
  },
  {
    ruleId: 'human.parts.required',
    title: 'Required human parts',
    softwareClaim: `${descriptions['human.parts.required']} Configured parts: head, body, left arm, right arm, left leg, right leg.`,
    question: 'Does the configured six-part human structure appropriately represent the human figure construction being documented, and are all six parts required in the relevant representations?',
    evidence: [
      observationEvidence('ccrt-fig4-3-grammar-palaghata-structure-01'),
      observationEvidence('dsource-tree-of-life-motif-human-01'),
      observationEvidence('dsource-rice-tarpa-motif-human-01'),
      observationEvidence('dsource-harvest-motif-human-01'),
    ],
    limits: [
      'CCRT describes some parts in one Palaghat figure; it does not enumerate all six configured parts or say every human must contain them.',
      'D’SOURCE identifies people in scenes but does not document part-by-part completeness.',
      'No systematic search for omitted, merged, obscured, or stylized parts has been recorded.',
    ],
  },
  {
    ruleId: 'human.part.primitive',
    title: 'Primitive mapping for human parts',
    softwareClaim: `${descriptions['human.part.primitive']} Configured mapping: head → circle; body → triangle; each arm and leg → line.`,
    question: 'Does the configured mapping (head → circle, body → triangle, arms → line, legs → line) accurately represent the documented construction, and under what scope/context?',
    evidence: [
      observationEvidence('ccrt-fig4-3-grammar-palaghata-structure-01'),
      sourceEvidence('source-dsource-idc-warli-documentation', 'The publication describes circles, triangles, squares, and lines as broad graphic vocabulary, without mapping each form to a human body part.'),
    ],
    limits: [
      'The CCRT figure description supports two triangles and some lines in one figure, not a complete part-to-primitive map.',
      'No cited record identifies the head as a circle or maps each arm and leg to a line.',
      'General geometric vocabulary does not establish that the software abstraction is a cultural convention.',
    ],
  },
  {
    ruleId: 'theme.allowed-motifs',
    title: 'Theme-enabled motif allow-lists',
    softwareClaim: `${descriptions['theme.allowed-motifs']} Generator themes are prototype/demo configurations; the grammar validator does not enforce theme membership.`,
    question: 'Is it appropriate to represent documented themes/contexts using explicit motif allow-lists, and if so, what evidence supports inclusion/exclusion of particular motifs?',
    evidence: [
      observationEvidence('dsource-tree-of-life-grammar-relationships-01'),
      observationEvidence('dsource-rice-tarpa-grammar-composition-01'),
      observationEvidence('dsource-harvest-grammar-composition-01'),
      observationEvidence('rao-2022-fig2-motif-human-01'),
      observationEvidence('rao-2022-fig2-grammar-spiral-composition-01'),
      sourceEvidence('source-ccrt-living-traditions', 'The reviewed chapter discusses Warli narrative and ritual contexts; current corpus records do not encode an exhaustive theme-to-motif allow-list from it.'),
    ],
    limits: [
      'The observations establish selected positive examples only; none defines an exhaustive allow-list or exclusion.',
      'A source-described theme or artwork caption is not by itself a software theme taxonomy.',
      'The generator’s demo allow-lists are prototype settings, not research evidence.',
    ],
  },
]

export function getValidationReviewGuide(ruleId: ValidationRuleId) {
  return validationReviewGuides.find((guide) => guide.ruleId === ruleId)!
}
