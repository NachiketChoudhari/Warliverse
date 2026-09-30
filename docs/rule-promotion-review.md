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

All four rules still have empty `sourceReferenceIds`. The source-reported observations now recorded are not converted into rule evidence because they do not support a configured rule with sufficient specificity. No rule is promoted in this corpus version.

## Phase 11B Evidence Update

The observation corpus now includes one source-reported human motif and one source-reported composition observation for `rao-2022-figure-2-tarpa-dance`, both linked to `source-rao-warli-aesthetics-2022`. The article (Rao 2022, p. 209) identifies the figure as a Tarpa Dance and discusses dancers, a tarpa player, and spiral/concentric arrangement. These are single-source secondary descriptions, not independently classified image features. No grammar evidence record is created because neither observation supports a configured rule with sufficient specificity. The Phase 10 export still emits its four derived rule entries, but each has an empty source list; they are not source-backed evidence records.

### Evidence available by configured rule

| Rule | Supporting observations | Source/artwork IDs | Conflicting evidence | Evidence status | Why pending |
| ---- | ----------------------- | ------------------ | ------------------- | --------------- | ----------- |
| `motif.allowed` | `rao-2022-fig2-motif-human-01` documents a source-reported human motif in one figure. | `source-rao-warli-aesthetics-2022` → `rao-2022-figure-2-tarpa-dance` | None assessed. The seven original catalogue records were not visually analyzable. | Single-source, limited relevance; insufficient for an exhaustive application vocabulary. | One reported motif cannot establish that the configured five IDs are complete, exclusive, or appropriate across artworks and contexts. |
| `human.parts.required` | None that establishes required presence of every configured part. The Figure 2 observations do not describe part completeness. | No supporting artwork-specific observation. | None assessed. | Insufficient. | No evidence establishes that every represented human must contain each software-defined part. |
| `human.part.primitive` | None linked to the exact Figure 2 construction. Rao's general discussion on pp. 211–212 is not attached to this artwork because its specificity to Figure 2 is unverified. | No supporting artwork-specific observation. | None assessed. | General secondary discussion only; insufficient and not linked as evidence. | The exact six-part mapping and its scope are not established. A source description of geometric figures would not by itself validate the software abstraction. |
| `theme.allowed-motifs` | None. Figure 2's “Tarpa Dance” caption and adjacent discussion do not provide an exhaustive theme allow-list. | No supporting evidence chain. | None assessed. | No supporting evidence. | A single named scene cannot justify motif exclusions or the application's prototype theme configuration. |

For all four rules, `sourceReferenceIds` remain absent and documentation status remains pending. Observations remain separate records and have no `ruleId`. No promotion decision has been made; this material is prepared for the later Phase 12 review.
