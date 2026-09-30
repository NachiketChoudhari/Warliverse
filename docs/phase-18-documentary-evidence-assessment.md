# Phase 18 — Documentary Evidence Assessment

## Research problem

The v1 corpus preserves sources, artwork records, observations, and empty `grammarEvidence` records. The existing rule evidence shape contains only `ruleId`, a description, source IDs, and observation IDs. It does not record how a specific item relates to a claim, the scope of that relationship, why an interpretation was made, or whether distinct source records are the same or independent publications. It cannot explicitly preserve evidence that limits or challenges a software interpretation, or a conclusion that remains unresolved.

The observation `confidence` field is a source/recording metadata value. It is not expert validation, a rule-support rating, or a measure of cultural certainty. A repeated observation from one publication also cannot be counted as independent corroboration.

## Phase 18 model

`src/data/ruleEvidenceAssessment.ts` adds a separate, documentary-only assessment layer. Each `RuleEvidenceAssessment` records:

- a stable assessment ID and one of the configured rule IDs;
- state `assessed` or `unresolved`;
- a clearly labeled interpretation of the software claim;
- one or more evidence links to an existing source, motif observation, grammar observation, or measurement;
- for every link, a relationship (`supports`, `limits`, `challenges`, `contextualizes`, or `unresolved`), claim scope, and rationale;
- optional source-pair comparisons with an explicit relationship (`same-publication`, `independent-publications`, `related-publications`, or `independence-unassessed`) and a written basis.

Evidence source IDs are resolved from the linked source or observation provenance. Multiple records resolving to the same source ID are deduplicated in the source trace. Different source IDs are not automatically treated as independent. Any publication relationship must be recorded explicitly with a rationale; publisher or author names are never used as an automatic independence test.

## Current records and provenance

The production assessment collection in `src/data/research/ruleEvidenceAssessments.ts` is empty. No existing source, artwork, observation, measurement, attribution, documentation status, grammar evidence, or production rule was migrated or changed. The assessment validator is a pure local operation over an explicitly provided collection; it neither persists new data nor modifies the corpus.

The provenance chain remains:

```text
DOCUMENTARY SOURCE
  → ARTWORK-SPECIFIC OBSERVATION
  → DOCUMENTARY EVIDENCE ASSESSMENT / INTERPRETATION
  → SOFTWARE RULE REVIEW
  → POTENTIAL PROMOTION DECISION
```

Phase 15/16 external validation remains a separate attributed statement layer. Expert feedback must not be written as a documentary evidence assessment or replace its source chain. Promotion remains a separate human decision and is not part of this schema or validator.

## Contradiction and uncertainty

Supporting and challenging links may coexist. When the same source or observation is assigned both relationships within an assessment, the validator requires the assessment state to be `unresolved` and returns a warning that preserves both interpretations. An unresolved assessment can also record an evidence gap without a linked record. A relationship marked `unresolved` cannot be labeled as an assessed conclusion.

Missing source provenance, invalid source/observation IDs, unsupported rules, malformed relationships, missing scope/rationale, and unsupported fields are reported as structured validation errors. The validator does not infer which source interpretation is correct.

## Effect on the four rules

The model supports later documentary review of:

- `motif.allowed`: scope examples to particular artworks and record evidence for, limits to, or challenges against the configured vocabulary claim;
- `human.parts.required`: distinguish evidence of parts in a particular figure from evidence about required presence or counterexamples;
- `human.part.primitive`: attach exact construction observations and retain alternatives or scope limits;
- `theme.allowed-motifs`: record positive examples, exclusions, and unresolved context-specific relationships separately.

No assessment is currently populated for any rule. The model does not make existing claims better supported, does not establish a cultural rule, and does not promote any rule.

## What this does not establish

This schema cannot verify the truth or accuracy of a source, the completeness of an observation, the correctness of an interpretation, or whether a declared publication relationship is accurate. The written basis remains a human-authored provenance note requiring review. It does not score confidence, consensus, authenticity, or readiness. Existing v1 `grammarEvidence` remains unchanged and separate.

## Future expert validation

Real artisan/domain-expert feedback continues to be captured through the Phase 15 validation schema and Phase 16 workspace, with attribution and consent. Validation records retain validator identity or an anonymized ID, statement, scope, date, evidence supplied, and disagreement. They should be considered alongside—not merged into or substituted for—documentary assessments. Disagreement must preserve both provenance chains, and one response must not be treated as universal consensus. Any proposed software-rule promotion requires a separate review of documented evidence, exceptions, source relationships, validation statements where available, and the proposed rule's scope.
