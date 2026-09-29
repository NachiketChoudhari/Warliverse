# WARLIVERSE Research Readiness Audit

This is an implementation audit of the current repository. It does not add research data or determine whether a software configuration is culturally authoritative.

## Current Documentation State

Reference records: 0

Source-backed grammar rules: 0

Rules pending documentation: 4

The four rules are defined in `src/data/grammar.ts`. Their objects have no `name` property; the readable names below are audit labels based on their IDs and descriptions. All have `source: project-configuration`; none has `sourceReferenceIds` attached (the effective list is empty).

The project separates these concepts:

```text
SOURCE
   ↓
OBSERVATION — something recorded from a real source
   ↓
INTERPRETATION — a research interpretation of one or more observations
   ↓
EVIDENCE — reviewed links among observations, interpretations, and sources
   ↓
SOFTWARE RULE — a computational constraint implemented by the application
```

An observation does not automatically become a software rule. A software rule in the current code is a configured application behavior; its presence alone does not establish a cultural finding.

## Rule Audit

### Rule 1 — Configured motif vocabulary

#### Rule

ID: `motif.allowed`  
Name: Configured motif vocabulary (audit label; no `name` field exists)

#### Current Software Interpretation

Description: “A motif must exist in the configured motif vocabulary.” The vocabulary is the five IDs in `src/data/motifs.ts`: `human`, `tree`, `hut`, `animal`, and `sun`. `validateGrammar` checks a motif ID against that list and reports `unknown-motif` under this rule ID when it is absent. The generator selects from the configured theme allow-list, itself filtered to known motifs with configured renderer primitives. `generateComposition` records this rule in the generated composition trace.

Primitive(s) involved: No primitive is directly named by the rule. The generator additionally checks that a motif renderer's configured primitive dependencies exist in the primitive vocabulary.

Current constraint: A represented motif must be one of the configured motif IDs. No cultural or historical assertion is encoded.

Where consumed / effects:

- Generation: Yes, indirectly through the configured motif vocabulary and theme allow-list; the rule object itself is not executed as a generation callback.
- Validation: Yes; unknown motif IDs are rejected.
- Deconstruction/reconstruction: Deconstruction carries the rule ID in the trace. Reconstruction reuses `validateGrammar`, so unsupported motif IDs fail validation; deconstruction itself does not infer motifs.
- Pose Mirror: No direct rule check. Pose Mirror maps landmarks to its human SVG structure.
- Personalization: Yes, through the existing generator and grammar validation; the rule appears in the generated grammar trace where used.

#### Evidence Required

Reviewed, attributable reference material documenting specific motifs, the context in which they appear, and enough scope information to avoid treating the software's current vocabulary as exhaustive.

#### Existing Evidence

No source evidence currently attached.

#### Research Questions

- Which motif categories are explicitly identified by each source, and under what terminology?
- Does the source describe a bounded vocabulary, or only examples?
- How do motif categories vary by artwork, maker, place, context, or period?
- Which categories do not fit the current software vocabulary?

#### Validation Requirements

Compare independently documented examples and source descriptions. Record disagreements, alternate categories, and scope limits. Confirm that the vocabulary is not inferred from a small or context-specific selection before considering a source-backed software constraint.

#### Risk of Overgeneralization

Treating the current five software IDs as a complete or universal Warli vocabulary could omit locally or contextually meaningful forms and imply a fixed taxonomy unsupported by the material.

#### Status

Pending documentation.

### Rule 2 — Required human structure

#### Rule

ID: `human.parts.required`  
Name: Required configured human parts (audit label; no `name` field exists)

#### Current Software Interpretation

Description: “A configured human structure includes each defined body part.” The configured keys are `head`, `body`, `leftArm`, `rightArm`, `leftLeg`, and `rightLeg` in `humanPartPrimitives`. The validator reports `missing-human-structure` when a human has no structure and `missing-part` for each absent configured key.

Primitive(s) involved: The required part keys use circle, triangle, and line mappings, but this rule checks presence of the six keys. The separate `human.part.primitive` rule checks their mappings.

Current constraint: A `human` subject passed to the grammar validator must provide all six configured part keys. This is a software schema requirement; Pose Mirror can render partial geometry and does not apply this validator rule.

Where consumed / effects:

- Generation: Yes, as a configured human data shape: generated human metadata is built from all six configured mappings, and the rule ID is traced for generated compositions containing humans. The rule object itself does not generate geometry.
- Validation: Yes; the validator checks for the structure object and each required key.
- Deconstruction/reconstruction: Deconstruction preserves the human structure and rule trace. Reconstruction validates the reconstructed human structure and returns an invalid-structure result if required parts are missing.
- Pose Mirror: No direct enforcement. Pose mapping emits available geometry and can render when landmarks are incomplete; it does not require all six parts through `validateGrammar`.
- Personalization: Yes, through generated human metadata and the existing composition validation/grammar trace.

#### Evidence Required

Source material that explicitly describes human-figure components or a structural relationship, with the represented artwork/material and attribution recorded. The source must support the particular parts and the intended scope of any required-part claim.

#### Existing Evidence

No source evidence currently attached.

#### Research Questions

- Which parts are explicitly identified in the documented material?
- Are all listed parts present in each relevant figure, or are omissions/abstractions documented?
- Are the software's left/right distinctions supported by the source, or are they renderer conveniences?
- Does the source describe a figure convention, a single artwork, or a broader practice?

#### Validation Requirements

Compare multiple attributed figures and relevant source explanations. Preserve examples with absent, obscured, stylized, or differently described parts. Confirm the rule's scope and exceptions before making required presence a source-backed constraint.

#### Risk of Overgeneralization

Making every figure conform to the six current keys could erase variation or turn a convenient software schema into a claim that every relevant figure must contain those parts.

#### Status

Pending documentation.

### Rule 3 — Configured primitive per human part

#### Rule

ID: `human.part.primitive`  
Name: Configured primitive mapping for human parts (audit label; no `name` field exists)

#### Current Software Interpretation

Description: “Each human part uses its configured primitive.” `src/data/grammar.ts` maps `head → circle`, `body → triangle`, and both arms and both legs to `line`. The validator first rejects primitive IDs outside `circle`, `triangle`, and `line`, then rejects a recognized primitive when it differs from the configured mapping, using `invalid-primitive`.

Primitive(s) involved: circle, triangle, line.

Current constraint: A human structure's primitive IDs must match the current software map. SVG renderer dimensions and geometry are implementation parameters, not measurements from references.

Where consumed / effects:

- Generation: Yes, the generated human metadata uses `humanPartPrimitives`; the rule ID is included in a composition trace when a human is present.
- Validation: Yes; each represented human part is compared to the current mapping.
- Deconstruction/reconstruction: Deconstruction carries named part-to-primitive relationships. Reconstruction retains this structure and validates it using the same grammar validator.
- Pose Mirror: Not as a direct rule validation. Pose mapping creates head/body/limb geometry for the shared HumanFigure renderer, but does not call this rule or the grammar validator; it can render partial landmarks.
- Personalization: Yes, via the existing generator and validation pipeline; the rule can appear in the composition trace when applicable.

#### Evidence Required

Attributed source material that identifies or clearly documents how the relevant figure parts are represented. Any proposed mapping must be tied to specific recorded observations and must distinguish source description from the application's primitive approximation.

#### Existing Evidence

No source evidence currently attached.

#### Research Questions

- Does a source identify a head, body, arm, or leg as a shape or construction element?
- Is the shape mapping consistent across separate works, makers, and contexts?
- Is a triangle/circle/line a source's own description or only a software abstraction of visible geometry?
- What alternative constructions or exceptions occur?

#### Validation Requirements

Compare source descriptions and annotated examples across relevant references. Record uncertain boundaries and alternative constructions. Establish whether a mapping is repeatable within a defined scope before validating the application's mapping against it.

#### Risk of Overgeneralization

The fixed map could make a simplified SVG representation appear to be a universal construction rule, obscuring other depictions and conflating a renderer choice with documented practice.

#### Status

Pending documentation.

### Rule 4 — Theme-enabled motif allow-list

#### Rule

ID: `theme.allowed-motifs`  
Name: Theme-enabled motif allow-list (audit label; no `name` field exists)

#### Current Software Interpretation

Description: “A composition uses only motifs enabled by its selected theme configuration.” Current themes in `src/data/themes.ts` are explicitly labeled `prototype-demo`, not research-derived themes. `generateScene` selects a configured demo theme and chooses generated motifs only from its `allowedMotifs` list. `generateComposition` records this rule in the composition trace. `validateGrammar` does not receive a theme and does not enforce this allow-list. Demo theme `minElements` and `maxElements` values are procedural generation settings; they are not source-backed constraints and are not part of this rule's validator behavior.

Primitive(s) involved: No fixed primitive. A selected motif's renderer primitive dependencies are checked against the configured primitive vocabulary by the generator.

Current constraint: Generated elements are sampled from the chosen prototype/demo theme's configured motif allow-list. This is a software layout setting only.

Where consumed / effects:

- Generation: Yes; the generator applies the demo theme's motif allow-list.
- Validation: No; `validateGrammar` does not check composition theme membership. The rule appears in `grammarRulesUsed` as trace metadata.
- Deconstruction/reconstruction: Deconstruction preserves the theme and trace. Reconstruction revalidates motif IDs and human structure only; it does not re-check motifs against the theme allow-list.
- Pose Mirror: No.
- Personalization: Yes, by selecting an existing generator demo theme and invoking the same generator. Personalization validation does not independently validate theme membership.

#### Evidence Required

Source material connecting a documented theme/context to particular motifs, plus an explicit and reviewable definition of what inclusion or exclusion means for that source and scope. A software demo theme is not such evidence.

#### Existing Evidence

No source evidence currently attached.

#### Research Questions

- Is a theme or context named by the source itself, or assigned later by a cataloguer?
- Which motifs are explicitly associated with it, and which are simply present in an individual example?
- Are exclusions supported, or does the evidence only show examples of inclusion?
- How do theme labels and motif associations vary among sources and contexts?

#### Validation Requirements

Compare multiple source-linked examples for the same clearly defined theme/context, retain counterexamples and ambiguous classifications, and confirm that an allow-list is supported rather than inferred from a small sample. Keep source terminology and application labels distinct.

#### Risk of Overgeneralization

Turning a prototype allow-list into a cultural theme taxonomy could imply that motifs are universal to, or forbidden from, a theme when the available sources only document particular examples.

#### Status

Pending documentation.

## Rule Traceability Matrix

| Rule ID | Rule | Software Effect | Source IDs | Evidence Status | Research Needed |
| ------- | ---- | --------------- | ---------- | --------------- | --------------- |
| `motif.allowed` | Configured motif vocabulary | Generator motif vocabulary; validator rejects unknown IDs; trace metadata |  | Pending documentation | Source descriptions, scope, variation, and omitted categories |
| `human.parts.required` | Required configured human parts | Generated structure and validator checks all six configured keys |  | Pending documentation | Attributed figure descriptions, presence/omission, and scope |
| `human.part.primitive` | Configured primitive mapping for human parts | Generator mapping and validator enforces configured part-to-primitive correspondence |  | Pending documentation | Source-described construction, alternatives, and repeatability |
| `theme.allowed-motifs` | Theme-enabled motif allow-list | Procedural demo theme restricts generator selection; not enforced by grammar validator |  | Pending documentation | Source-defined theme/context, motif associations, counterexamples, and scope |

All source ID fields are empty. No grammar rule was edited for this audit.

## Existing Research Data Schema

The current schema lives in `src/data/references.ts`; this audit documents it without introducing a competing model.

### Source

- **Purpose:** Provenance record used as the target of source references.
- **Required fields:** `id`, `title`, `sourceType`, `documentationStatus` in the TypeScript interface and validator.
- **Optional fields:** `publisher`, `creator`, `url`, `citation`, `accessedAt`, `license`, `notes`.
- **Relationships:** Artworks, attributions, observations, measurements, and grammar rules may refer to its `id`.
- **Validation:** IDs are required and unique across collection records; title, source type, and status must be non-empty. References to IDs not in `sources` are reported. Runtime validation does not currently check that source type/status strings belong to their TypeScript unions.

### Artwork / Reference

- **Purpose:** A record for a reference artwork/material.
- **Required fields:** `id`, `title`, `documentationStatus`.
- **Optional fields:** `source`, `sourceType`, `artist`, `community`, `location`, `theme`, `motifs`, `observations`, `measurements`, `attribution`, `license`, `notes`.
- **Schema note:** The blank entry template includes a `Date` field as requested for future research notes, but `ReferenceArtwork` has no date property today. Do not treat that template field as a currently implemented artwork field; a schema change would need separate review.
- **Relationships:** `source` and `attribution.sourceReferenceId` link to a source record; nested observations and measurements can independently link to one.
- **Validation:** IDs are unique; title and status must be non-empty; supplied source links must resolve. Status values are not currently checked against the union at runtime.

### Motif Observation

- **Purpose:** A source-aware record of a motif/primitive-related observation attached to an artwork.
- **Required fields:** `id`, `kind`.
- **Optional fields:** `sourceReferenceId`, `confidence`, `notes`, `motifId`, `primitiveId`, `description`.
- **Relationships:** Nested under an artwork; optional source ID points to a collection source.
- **Validation:** ID is unique; a supplied source ID must resolve; supplied motif/primitive IDs must be in the configured vocabularies; observation kind must be recognized. Confidence range and non-empty description are not runtime-validated.

### Grammar Observation

- **Purpose:** A structured observation kept distinct from the software rule it may later inform.
- **Required fields:** `id`, `kind`.
- **Optional fields:** `sourceReferenceId`, `confidence`, `notes`, `ruleId`, `description`.
- **Relationships:** Nested under an artwork; optional source ID links to a source and optional `ruleId` associates the observation with a rule for export evidence.
- **Validation:** ID is unique; a supplied source link must resolve; kind must be configured. The validator does not require a rule link or description and does not turn an observation into a rule.

### Measurement

- **Purpose:** A numerical or descriptive measurement observation attached to an artwork.
- **Required fields:** `id`, `subject` in the TypeScript interface.
- **Optional fields:** `sourceReferenceId`, `confidence`, `notes`, `value`, `unit`, `description`.
- **Relationships:** Nested under an artwork; optional source ID links to a source.
- **Validation:** ID must be unique; supplied source ID must resolve; a supplied numerical `value` without a source ID raises `measurement-without-source`. Although `subject` is required by the type, the current runtime validator does not check it. A measurement without a value is not treated as a numerical measurement.

### Grammar Evidence

- **Purpose:** Export representation tying a configured rule to supporting source IDs and related grammar-observation IDs.
- **Required fields:** `ruleId`, `description`, `sourceReferenceIds`, `observationIds` in `GrammarEvidenceRecord`.
- **Optional fields:** None in this export record.
- **Relationships:** Computed by `createReferenceExport` from current grammar rules plus artwork grammar observations whose `ruleId` matches. Source IDs come from the rule's `sourceReferenceIds`.
- **Validation:** Rule source IDs are checked for broken links by `validateReferenceCollection`. The export record itself is derived, not an independently stored collection. The validator does not require an observation for a rule or assert that linked material supports an interpretation.

### Attribution

- **Purpose:** Preserve creator, community, rights-holder, attribution statement, and source provenance where recorded.
- **Required fields:** None; all fields are optional.
- **Optional fields:** `creator`, `community`, `rightsHolder`, `statement`, `sourceReferenceId`.
- **Relationships:** Attached to artwork; optional source ID must resolve.
- **Validation:** Only a supplied source reference is checked; the validator does not require attribution or check rights/licensing adequacy.

### Documentation Status

- **Purpose:** Indicate project documentation state: `documented`, `partially-documented`, `not-documented`, or `pending-review`.
- **Required fields:** Required on `ReferenceSource` and `ReferenceArtwork`.
- **Optional fields:** It is not a field on individual observation interfaces; observation progress is represented by the records and their notes/links.
- **Relationships:** Stored on sources and artworks; it is not a score or authenticity judgment.
- **Validation:** Required as a non-empty string. Runtime enum membership is not checked.

## Research Entry Pipeline

1. Identify a real source.
2. Record source metadata.
3. Record the reference artwork/material.
4. Add attribution.
5. Annotate visible or source-documented motifs.
6. Record observations separately.
7. Add measurements only when supported by a source.
8. Link observations to source references.
9. Record grammar evidence.
10. Review the interpretation.
11. Only then consider linking a software rule.

An observation does not automatically become a software rule.
