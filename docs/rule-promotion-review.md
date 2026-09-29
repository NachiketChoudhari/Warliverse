# Rule Promotion Review — Research Corpus v1

Review scope: the four existing configured rules. This review does not edit their definitions or attach `sourceReferenceIds`.

## `motif.allowed` — Configured motif vocabulary

- **Current definition:** “A motif must exist in the configured motif vocabulary.”
- **Current software effect:** The validator rejects a motif ID outside the application's configured vocabulary. This is an application schema constraint.
- **Potential supporting references:** British Museum object catalogue references and the Museums of India catalogue entry identify the referenced objects as paintings, but do not establish the application's five-motif vocabulary. Rao is a secondary source and discusses motifs in general; no artwork-specific observation has been recorded.
- **Supporting observations:** None recorded.
- **Conflicting observations:** None recorded; none of the catalogue records were visually classified.
- **Evidence strength:** Insufficient for a source-backed cultural interpretation.
- **Decision:** Remain pending.

## `human.parts.required` — Required configured human parts

- **Current definition:** “A configured human structure includes each defined body part.”
- **Current software effect:** The validator requires the configured head, body, arms, and legs on a structured human. It validates software data shape.
- **Potential supporting references:** Rao's article discusses human figure depiction as a secondary interpretation. The British Museum records identify paintings but are not attached to reviewed visual observations.
- **Supporting observations:** None recorded.
- **Conflicting observations:** None recorded; no reference-by-reference completeness review has been performed.
- **Evidence strength:** Insufficient. A statement about common depiction would not establish that every human figure must contain every software part.
- **Decision:** Needs more evidence.

## `human.part.primitive` — Configured primitive mapping

- **Current definition:** “Each human part uses its configured primitive.”
- **Current software effect:** The validator checks the application's mapping of head/body/limbs to circle/triangle/line. The mapping is a renderer/configuration choice, not a measured cultural standard.
- **Potential supporting references:** Rao's secondary article discusses geometric human figures. No visual annotation of a particular source artwork, no independent corroboration, and no cross-source comparison are recorded. The British Museum records do not provide a reviewed analysis of the image geometry.
- **Supporting observations:** None recorded.
- **Conflicting observations:** None recorded; the images were not evaluated for exceptions or variation.
- **Evidence strength:** Insufficient for promotion; potentially suitable for a later, narrowly scoped review after artwork-specific annotations and independent comparisons.
- **Decision:** Candidate for review, not source-backed.

## `theme.allowed-motifs` — Motifs enabled by a configured layout

- **Current definition:** “A composition uses only motifs enabled by its selected theme configuration.”
- **Current software effect:** The validator prevents a generated composition from including motif IDs that the selected software layout did not enable. It constrains software output.
- **Potential supporting references:** None currently support these demo layout configuration choices. The corpus contains catalogue references, not reviewed thematic observations.
- **Supporting observations:** None recorded.
- **Conflicting observations:** None recorded.
- **Evidence strength:** No cultural evidence attached; the rule only describes a software configuration boundary.
- **Decision:** Remain pending.

## Promotion Gate

All four rules still have empty `sourceReferenceIds`. Source records, catalogue descriptions, and secondary interpretation have not been converted into artwork-specific observations or reviewed grammar evidence. No rule is promoted in this corpus version.
