# Rule Promotion Review — Research Corpus v1

Review scope: the four existing configured rules. This review does not edit their definitions or attach `sourceReferenceIds`.

## `motif.allowed` — Configured motif vocabulary

- **Current definition:** “A motif must exist in the configured motif vocabulary.”
- **Current software effect:** The validator rejects a motif ID outside the application's configured vocabulary. This is an application schema constraint.
- **Potential supporting references:** CCRT describes human/animal and nature subject matter in its Warli chapter. The D’SOURCE/IDC documentation identifies tree, human, animal, and sun motifs in described paintings. These are source-specific examples, not an exhaustive vocabulary.
- **Supporting observations:** `dsource-tree-of-life-motif-tree-01`, `dsource-tree-of-life-motif-human-01`, `dsource-tree-of-life-motif-animal-01`, `dsource-tree-of-life-motif-sun-01`, `dsource-rice-tarpa-motif-human-01`, `dsource-rice-tarpa-motif-animal-01`, `dsource-harvest-motif-human-01`, and `dsource-harvest-motif-animal-01`.
- **Conflicting observations:** None recorded; none of the catalogue records were visually classified.
- **Evidence strength:** PARTIALLY SUPPORTED for some vocabulary entries; insufficient for the complete configured vocabulary.
- **Decision:** Remain pending.

## `human.parts.required` — Required configured human parts

- **Current definition:** “A configured human structure includes each defined body part.”
- **Current software effect:** The validator requires the configured head, body, arms, and legs on a structured human. It validates software data shape.
- **Potential supporting references:** CCRT's description accompanying Figure 4.3 states that the Palaghat figure includes two triangles, small legs, raised hands, and a head. D’SOURCE describes broad graphic vocabulary and human figures in specific scenes.
- **Supporting observations:** `ccrt-fig4-3-grammar-palaghata-structure-01` (specific to one Palaghat figure; not all human figures).
- **Conflicting observations:** None recorded; no reference-by-reference completeness review has been performed.
- **Evidence strength:** PARTIALLY SUPPORTED for the presence of some parts in one source-described figure; insufficient for a universal completeness requirement.
- **Decision:** Needs more evidence.

## `human.part.primitive` — Configured primitive mapping

- **Current definition:** “Each human part uses its configured primitive.”
- **Current software effect:** The validator checks the application's mapping of head/body/limbs to circle/triangle/line. The mapping is a renderer/configuration choice, not a measured cultural standard.
- **Potential supporting references:** CCRT's Figure 4.3 description specifies a two-triangle construction and vertical lines, but does not give the software's complete head/body/limb mapping. D’SOURCE independently describes circles, triangles, squares, and lines as graphic vocabulary, without mapping them to each body part. Rao discusses geometric figure construction generally, not specifically for an analyzed artwork.
- **Supporting observations:** `ccrt-fig4-3-grammar-palaghata-structure-01` (artwork-specific but narrow).
- **Conflicting observations:** None recorded; the images were not evaluated for exceptions or variation.
- **Evidence strength:** PARTIALLY SUPPORTED for geometric construction in one figure; insufficient for the exact configured mapping.
- **Decision:** Candidate for review, not source-backed.

## `theme.allowed-motifs` — Motifs enabled by a configured layout

- **Current definition:** “A composition uses only motifs enabled by its selected theme configuration.”
- **Current software effect:** The validator prevents a generated composition from including motif IDs that the selected software layout did not enable. It constrains software output.
- **Potential supporting references:** CCRT documents marriage and harvest contexts; D’SOURCE provides artwork descriptions for Tarpa Nritya, Tree of Life, and paddy harvest scenes. Rao's Figure 2 also concerns Tarpa Dance. These examples document presence in particular scenes, not exclusive allow-lists.
- **Supporting observations:** `dsource-rice-tarpa-motif-human-01`, `dsource-rice-tarpa-grammar-composition-01`, `dsource-tree-of-life-grammar-relationships-01`, `dsource-harvest-motif-human-01`, `dsource-harvest-motif-animal-01`, and the single-source `rao-2022-fig2-motif-human-01` / `rao-2022-fig2-grammar-spiral-composition-01`.
- **Conflicting observations:** None recorded.
- **Evidence strength:** PARTIALLY SUPPORTED for selected positive motif/context examples; insufficient for any exhaustive allow-list or exclusion.
- **Decision:** Remain pending.

## Promotion Gate

All four rules still have empty `sourceReferenceIds`. The source-reported observations now recorded are not converted into rule evidence because they do not support a configured rule with sufficient specificity. No rule is promoted in this corpus version.

## Phase 11B Evidence Record (Historical Checkpoint)

The observation corpus now includes one source-reported human motif and one source-reported composition observation for `rao-2022-figure-2-tarpa-dance`, both linked to `source-rao-warli-aesthetics-2022`. The article (Rao 2022, p. 209) identifies the figure as a Tarpa Dance and discusses dancers, a tarpa player, and spiral/concentric arrangement. These are single-source secondary descriptions, not independently classified image features. No grammar evidence record is created because neither observation supports a configured rule with sufficient specificity. The Phase 10 export still emits its four derived rule entries, but each has an empty source list; they are not source-backed evidence records.

### Evidence available by configured rule

| Rule | Supporting observations | Source/artwork IDs | Conflicting evidence | Evidence status | Why pending |
| ---- | ----------------------- | ------------------ | ------------------- | --------------- | ----------- |
| `motif.allowed` | `rao-2022-fig2-motif-human-01` documents a source-reported human motif in one figure. | `source-rao-warli-aesthetics-2022` → `rao-2022-figure-2-tarpa-dance` | None assessed. The seven original catalogue records were not visually analyzable. | Single-source, limited relevance; insufficient for an exhaustive application vocabulary. | One reported motif cannot establish that the configured five IDs are complete, exclusive, or appropriate across artworks and contexts. |
| `human.parts.required` | None that establishes required presence of every configured part. The Figure 2 observations do not describe part completeness. | No supporting artwork-specific observation. | None assessed. | Insufficient. | No evidence establishes that every represented human must contain each software-defined part. |
| `human.part.primitive` | None linked to the exact Figure 2 construction. Rao's general discussion on pp. 211–212 is not attached to this artwork because its specificity to Figure 2 is unverified. | No supporting artwork-specific observation. | None assessed. | General secondary discussion only; insufficient and not linked as evidence. | The exact six-part mapping and its scope are not established. A source description of geometric figures would not by itself validate the software abstraction. |
| `theme.allowed-motifs` | None. Figure 2's “Tarpa Dance” caption and adjacent discussion do not provide an exhaustive theme allow-list. | No supporting evidence chain. | None assessed. | No supporting evidence. | A single named scene cannot justify motif exclusions or the application's prototype theme configuration. |

For all four rules, `sourceReferenceIds` remain absent and documentation status remains pending. Observations remain separate records and have no `ruleId`. No promotion decision has been made; this material is prepared for the later Phase 12 review.

## Phase 13 Evidence Matrix — Production Rules Not Promoted

| Rule | Required claim | Supporting observations | Independent sources | Counterexamples | Evidence status | Remaining gap | Promotion decision |
| ---- | ------------- | ----------------------- | ------------------ | --------------- | --------------- | -------------- | ------------------ |
| `motif.allowed` | The complete configured vocabulary (`human`, `tree`, `hut`, `animal`, `sun`) is sufficient and appropriate for represented works. | Eight D’SOURCE motif records cover `human`, `tree`, `animal`, and `sun` in three described artworks. | CCRT’s Warli chapter and D’SOURCE independently document broad nature, human, animal, and social-scene subject matter. Rao supplies a separate single-source human example. | No direct contradiction recorded. CCRT/D’SOURCE also mention landscapes, fields, water, mountains, squares, and other source elements not represented as motif IDs; these expose taxonomy gaps but are not counterexamples to individual IDs. | **PARTIALLY SUPPORTED** | No documented `hut` motif observation; no source establishes that the five IDs exhaust or constrain the source vocabulary. | NOT PROMOTED |
| `human.parts.required` | Every represented human must contain all six configured parts. | `ccrt-fig4-3-grammar-palaghata-structure-01` describes a head, raised hands, and small legs in one Palaghat figure. | The specific part description is CCRT-only. Other sources describe people in scenes but do not establish part completeness. | No observed omission/counterexample assessed; the other artworks have not been systematically checked for missing parts. | **PARTIALLY SUPPORTED** | One special figure cannot establish that all figures require every left/right part; no cross-artwork completeness review exists. | NOT PROMOTED |
| `human.part.primitive` | Head maps to circle, body to triangle, and each arm/leg to line. | CCRT’s `ccrt-fig4-3-grammar-palaghata-structure-01` supports two triangles in one depicted figure and vertical lines, but does not assign every primitive to each body part. | CCRT and D’SOURCE repeat broad geometric vocabulary (circles, triangles, squares, lines). Exact anatomy-to-primitive mapping is single-source and incomplete. | No exact mapping counterexample recorded; alternatives were not systematically examined. CCRT’s description does not identify a circular head or specify arm/leg strokes as lines. | **PARTIALLY SUPPORTED** | No source supports the complete six-part mapping or establishes it as universal. | NOT PROMOTED |
| `theme.allowed-motifs` | Each theme has an exclusive configured allow-list and motifs outside it are disallowed. | D’SOURCE observations describe human/fauna in Tarpa Nritya, Tree of Life, and paddy harvest works; Rao records people in one Tarpa Dance figure. CCRT documents marriage/harvest contexts. | CCRT and D’SOURCE independently document context-specific examples; Rao is a separate publication, but it cites work by Poovaiah, who co-authored the D’SOURCE documentation, so it is not counted as independent corroboration for overlapping claims. | No source-based exclusion/counterexample list is available. | **PARTIALLY SUPPORTED** | Positive examples do not establish complete allow-lists, exclusions, or the software’s demo theme configurations. | NOT PROMOTED |

### Cross-source classification

- **Independent repeated evidence:** Broad geometric vocabulary and broad human/nature/animal/social-scene subject matter recur in CCRT and D’SOURCE. This applies to those broad descriptive claims only, not to every detailed observation.
- **Single-source:** CCRT’s Figure 4.3 anatomy/construction description; Rao’s specific Tarpa spiral/concentric description; each D’SOURCE artwork description as an individual image record.
- **Conflicting:** None recorded. This means no conflict was established in the reviewed material; variation has not been comprehensively audited.
- **Insufficient:** Exhaustive motif membership, universal human-part completeness, the exact six-part primitive mapping, and theme exclusions/allow-lists.

All four production rules retain their existing definitions, have no `sourceReferenceIds`, and remain pending. Corpus observations do not carry `ruleId`; the production corpus `grammarEvidence` array remains empty.
