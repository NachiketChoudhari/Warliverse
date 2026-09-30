# Phase 17 — Evidence-to-Rule Audit

## Purpose

Phase 17 makes the current research-to-software trail inspectable. It adds a read-only audit view that displays current corpus coverage, the four rules under review, formal evidence links from the research export, and contextual records cited in the Phase 16 review dossier.

The audit does not create research data, validation records, or rule decisions. Documentary evidence, expert statements, software interpretations, and promotion review remain separate stages.

## Architecture

`src/data/evidenceAudit.ts` derives source, artwork, observation, measurement, and formal grammar-evidence counts from the current research corpus and export model. For each rule it displays formal `sourceReferenceIds` and `observationIds` exactly as exported. It separately resolves the records cited in the Phase 16 validation review guide and labels them **review dossier context**. These references are editorial review context, not newly created source-to-rule links.

The `/evidence-audit` page is a read-only dashboard. It includes source-to-record coverage so users can inspect artwork, motif observation, grammar observation, and measurement IDs grouped by their recorded source IDs. It does not include the Phase 16 response form, save/export expert responses, or offer a promotion action. The Phase 16 workspace remains the designated future expert-review capture workflow.

## Current evidence path

1. **Documented source:** source metadata and project documentation status.
2. **Artwork-specific observation:** source-linked records scoped to a particular artwork where the corpus provides that relationship.
3. **Cross-source pattern:** a cautious comparison that must retain source independence and scope; repeated descriptions alone do not demonstrate consensus.
4. **Expert validation:** a future attributed statement captured through Phase 15/16; none is present in the corpus.
5. **Software rule:** a configurable implementation claim, kept distinct from observations and expert statements.
6. **Promotion review:** a separate human decision. The audit has no mechanism to promote a rule.

The present corpus has 7 sources, 12 artwork records, 9 motif observations, 5 grammar observations, 0 measurements, and 0 formal grammar evidence records. The four software rules have no formal source references and remain pending. The Phase 16 dossier provides selected documentary material to discuss with reviewers; it does not change this formal evidence state.

## Rule traceability and limits

For each rule, the page shows its current software claim, formal source and observation links, the number of contextual dossier references, and the evidence gaps recorded in `docs/rule-promotion-review.md`. Detail rows show the original record ID, artwork ID when applicable, source ID, source type, and documentation status. The source coverage view lists source-linked artwork and observation IDs; a zero means no linked record is present in this corpus, not that the source contains no such material.

The dossier references do not assert that every cited record supports a rule. They are material selected for review; their limitations remain visible. In particular, positive examples do not establish exhaustive vocabularies or exclusions, one described figure does not establish universal part requirements or mappings, and co-occurring motifs do not establish theme allow-lists.

The dashboard does not calculate a readiness score, consensus score, or authenticity score. It preserves the existing `NOT PROMOTED` decision and reports gaps rather than inferring readiness. Source record counts identify recorded linkages only; they do not estimate independence or corroboration.

## Integrity and future use

- Counts and links are derived from the current corpus/export and existing Phase 16 dossier; the page adds no source, observation, measurement, expert statement, or `sourceReferenceId`.
- No expert validation has occurred in this project state. No external response is represented in the dashboard.
- Expert feedback, if later captured, remains an attributed validation statement. It must not overwrite source evidence or automatically become a software rule.
- Disagreement and conflicting evidence must coexist with the original provenance chains and be reviewed separately before any rule-promotion decision.
- A promotion review must assess source quality and independence, artwork-specific observation scope, counterexamples and disagreements, appropriate expert input where available, the software claim’s scope, and the rule’s effect. The audit itself cannot make that decision.

## Verification

The page tests assert that displayed totals match the current corpus, every configured rule has empty formal evidence links and remains unpromoted, and contextual dossier material is clearly distinguished from formal evidence and expert validation.
