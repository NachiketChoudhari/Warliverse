# Phase 16 — Local Validation Review Workspace

## Purpose

Phase 16 makes the Phase 14 preparation and Phase 15 capture schema usable through a local review workspace. A reviewer can select one of the four configured rules, read its current software claim, inspect the linked Phase 13 documentary observations and their limits, present the corresponding expert question, and validate a future response with the Phase 15 schema.

No validation is preloaded or implied. The workspace does not persist records in the application. It holds one validated record in page memory and offers an explicit local JSON download. Reloading or navigating away clears the in-memory record unless the reviewer has downloaded it.

## Architecture Decision

The existing project is a React Router application with dedicated pages and a local JSON export pattern, but no database, API, or application state persistence layer. A dedicated UI workspace is the smallest fit: it adds a page and route and reuses the existing rule definitions, normalized reference archive, Phase 15 record schema, and validator. The record remains exportable as JSON for later deliberate review and storage.

This phase does not add a server, database, import endpoint, browser storage, account system, UI framework, or dependency. It does not change generation, grammar validation, the reference corpus, or rule evidence.

## Review Flow

1. Select a rule from the current four-rule configuration.
2. Inspect its displayed software claim, Phase 14 question, source-linked observation summaries, and explicit evidence limits. Select the documentary items actually shown to a participant.
3. After a real review, enter the participant's response, position, scope, corrections, citations, attribution choice, consent, and provenance notes. Anonymous identity is supported.
4. Validate the record with `validateValidationRecord`. The workspace reports structural issues and does not accept an invalid record for download.
5. Review the resulting JSON and explicitly download it. The downloaded record remains a validation statement, not an automatic research import or rule-promotion instruction.

## Research Integrity

The workspace displays documentary evidence, the expert response, and the software claim in separate areas and fields. Source and observation references resolve to the current corpus; participant-supplied citations stay within the response. A disagreement or conflict can be recorded alongside the documentary references without replacing them.

The `supported-after-review` status only describes a participant's recorded position and scope. It does not assert consensus, universal cultural truth, or rule promotion. The page has no promote-rule action. Any later promotion requires a separate review of provenance, scope, corroboration, variation, and counterevidence.

No external validation has occurred in Phase 16. No expert identities or responses are included. Test fixtures, if added later, must remain clearly synthetic and test-only.
