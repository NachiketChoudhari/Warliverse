# Phase 15 — Validation Capture

## Purpose

Phase 15 adds a deterministic, local runtime schema for capturing real future artisan, cultural researcher, or other qualified domain-expert feedback on the four configured WARLIVERSE rules. It is a non-persistent validation mechanism: there is no database, UI, API, or initial production validation dataset. The empty state is intentional. No external validation has occurred at this stage.

## Relationship to Phase 14

Phase 14 prepared the expert questions, evidence thresholds, attribution guidance, and blank review form in `docs/phase-14-validation-plan.md` and `docs/phase-14-validation-form.md`. Phase 15 provides TypeScript types and a runtime validator for records created only after a real review and suitable permission. The capture schema does not populate the form, contact experts, assert agreement, or change a software rule.

## Concepts Kept Separate

Each record keeps four stages distinct:

1. **Published/documentary evidence:** `documentaryEvidence` references an existing project source or a source-linked research observation. The validator resolves these IDs against the current research corpus. It never edits their records.
2. **Expert/artisan statement:** `expertResponse` holds the response, position, scope, suggested correction, and citations supplied by the participant. Participant-supplied citations remain separate from the project source registry until separately reviewed and entered.
3. **Software interpretation:** `softwareInterpretation.claim` records the exact configured claim presented for comment. It is not evidence that the claim is culturally established.
4. **Future rule promotion:** Promotion is deliberately not represented as a validation-record field or validator action. It requires a separate, explicit rule-promotion review after the documentary and expert provenance chains have been assessed.

## Record Shape

`src/data/validationTypes.ts` defines:

- A stable `validation-<slug>` ID and one of the four configured `ruleId` values.
- An optional participant object or `null` for a not-yet-reviewed item. A real participant has a stable project-local validator ID, named or anonymized identity mode, role, and optional expertise/affiliation. An anonymized participant cannot carry a personal name.
- The date of a completed validation, the question presented, and the software claim shown to the participant.
- Separate references to project documentary sources/observations and participant-supplied citations.
- A structured response with statement, agreement position, optional scope/correction, and optional supporting or challenging citations.
- Attribution choice, permission/documentation method, lifecycle status, and optional follow-up/provenance notes.

`validateValidationRecord` checks a single unknown runtime value. `validateValidationRecords` checks a non-persistent list and detects duplicate IDs. Both return structured `valid`, `errors`, and `warnings` results. Strict field checking rejects unsupported keys. The validator is read-only and does not write records or mutate rules.

## Rules Under Review

| Rule ID | Configured claim represented in software |
| --- | --- |
| `motif.allowed` | Motif IDs are limited to the configured vocabulary: `human`, `tree`, `hut`, `animal`, and `sun`. |
| `human.parts.required` | A structured human contains head, body, left/right arms, and left/right legs. |
| `human.part.primitive` | Head → circle; body → triangle; arms → line; legs → line. |
| `theme.allowed-motifs` | A composition uses only the motifs enabled by its selected theme configuration. |

These are current software representations under review, not claims established by the capture schema.

## Status Lifecycle

Supported statuses are `not-reviewed`, `review-requested`, `response-recorded`, `requires-follow-up`, `supported-after-review`, `challenged`, and `conflicting-evidence`.

Pre-response statuses cannot contain an expert answer. A captured response requires a valid date, participant, response structure, attribution choice, and granted or conditional permission to document it. Follow-up status requires follow-up notes; supported-after-review requires agreement or partial agreement; challenged requires disagreement; conflicting-evidence requires a project source or observation explicitly linked as `conflicts-with`. These status checks classify the record only. They do not promote a rule or encode an authenticity score.

## Capturing Real Feedback

1. Present the relevant Phase 14 question, current software claim, and clearly labeled documentary evidence. Explain that source descriptions and software interpretation are distinct.
2. Ask the open question before suggesting an answer. Record the participant's own scope/context, examples, uncertainty, corrections, and any evidence they supply.
3. Use a stable project-local validator ID. A participant may be represented anonymously; a personal name is required only when the record explicitly chooses named identity/attribution.
4. Capture a response only when permission covers the documentation method used. Record conditional limits in consent and attribution fields. Do not record audio or retain notes against the participant's stated permission.
5. Use a separate validation record per rule and preserve the wording or clearly marked paraphrase. Link documentary IDs and participant-supplied citations in their distinct fields.
6. Validate the proposed record before any later approved research-data integration. A valid shape confirms structural integrity only; it does not certify the content or expert qualification.

## Attribution and Consent

The schema supports named, anonymous, withheld, or pending attribution and granted, conditional, declined, or pending consent. Anonymous IDs do not require personal identifying information. Named attribution requires a display name; anonymous or withheld attribution cannot accidentally include a display name. A captured response must have permission to document it and an allowed method. Conditional consent requires its conditions to be recorded.

Record preferred wording and permitted use where supplied. Preserve restrictions on quotation, attribution, storage, or reuse. Consent to record a statement is not permission to present it as institutional or community consensus.

## Disagreement and Conflicting Evidence

An expert may disagree with the interpretation represented by a rule. Store that response in `expertResponse` with its own attribution and evidence; retain the original `documentaryEvidence` references unchanged. A `challenged` record preserves a disagreement. A `conflicting-evidence` record additionally links a project source or observation as conflicting. Neither status deletes, edits, or resolves the documentary record. A later review should compare both provenance chains, their scope, and any further evidence.

One participant's statement is not universal cultural truth or consensus. Agreement is evidence about that participant's attributed assessment within the recorded scope.

## Evidence and Rule Promotion

Expert/artisan statements are not published documentary evidence unless they are separately published and reviewed as sources. The schema keeps participant-supplied citations apart from project-registered sources. A later research step may add a real source record or expert validation record with its original attribution; it must not overwrite an existing observation or source.

Before considering promotion, a separate rule review must establish a traceable evidence chain for the exact claim and scope, assess whether the expert statement and documentary material support that claim, examine counterexamples and disagreement, preserve attribution/consent limits, and document what remains uncertain. Positive examples alone do not establish exhaustive vocabularies, required parts, universal primitive mappings, or exclusive theme allow-lists. Promotion is never automatic from status `supported-after-review`.

## Initial State and Integrity

There are no production validation records, expert responses, names, dates, credentials, or validation claims in this phase. Test fixtures in `src/data/validationValidator.test.ts` are visibly marked synthetic and remain test-only. The validator imports existing configured rule IDs and project reference data for reference resolution; it does not add `sourceReferenceIds`, grammar evidence, measurements, or changes to generator behavior.
