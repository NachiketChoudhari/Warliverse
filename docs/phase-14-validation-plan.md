# Phase 14 — External Validation Preparation

## A. Purpose

This plan prepares WARLIVERSE's four configured grammar rules for review by artisans, cultural researchers, or other qualified domain experts. Phase 14 prepares questions, evidence summaries, and a recording procedure; it does not report that external review has occurred. No rule is promoted or changed by this document.

An expert's response is an attributed validation statement. It is not automatically a software rule, a universal community position, or a substitute for the original source evidence.

## B. Current Evidence Baseline

The Phase 13 research corpus contains 7 sources, 12 artwork references, 9 motif observations, 5 grammar observations, 0 measurements, and 0 grammar evidence records. All four production rules remain without `sourceReferenceIds`; source-backed rules: 0; rules pending: 4.

The motif and grammar observations are source-reported descriptions attached to four described artworks. They are not independent visual annotations. The D'SOURCE page and PDF are one publication. The corpus establishes examples and partial claims, not an exhaustive vocabulary or universal construction. No external validation has yet been recorded.

The configured software vocabulary is `human`, `tree`, `hut`, `animal`, and `sun`. The configured human structure has six named parts: `head`, `body`, `leftArm`, `rightArm`, `leftLeg`, and `rightLeg`; the mapping is head → circle, body → triangle, arms → line, legs → line. These values describe the prototype configuration. Existing software checks enforce its data model and layout constraints; they do not establish cultural requirements.

### Provenance chain

Keep each stage distinct:

**Source evidence → Research observation → External validation → Software rule**

An expert may agree with, qualify, or disagree with a research interpretation. Record the expert's statement with its own attribution and provenance. Preserve the source and observation records unchanged; link the two accounts for comparison rather than replacing one with the other. One expert's response is not consensus.

## C. Four-Rule Validation Matrix

| Rule | Current software claim | Existing supporting observations | Supporting source IDs | Current evidence classification | What the evidence establishes | What remains unverified | Proposed expert question | Evidence that would support the rule | Evidence that would challenge or refute the rule | Current status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `motif.allowed` | A motif must use one of the configured IDs: `human`, `tree`, `hut`, `animal`, or `sun`. This is a software vocabulary constraint. | Eight D'SOURCE motif observations: `dsource-tree-of-life-motif-tree-01`, `dsource-tree-of-life-motif-human-01`, `dsource-tree-of-life-motif-animal-01`, `dsource-tree-of-life-motif-sun-01`, `dsource-rice-tarpa-motif-human-01`, `dsource-rice-tarpa-motif-animal-01`, `dsource-harvest-motif-human-01`, `dsource-harvest-motif-animal-01`; plus Rao's `rao-2022-fig2-motif-human-01`. | `source-dsource-idc-warli-documentation`; `source-rao-warli-aesthetics-2022`. CCRT provides broader chapter context under `source-ccrt-living-traditions`, but no additional normalized motif observation for this rule. | Partially supported for positive examples; insufficient for the complete configured vocabulary. | The sources describe human, tree, animal, and sun elements in selected works or scenes. D'SOURCE also describes houses, fields, water, mountains, and other scene elements; “houses” was not normalized to `hut`. | Whether the five categories suit this prototype's scope; whether categories are missing, too broad, or should be represented differently; whether terms vary by work, maker, or context. | An attributed expert explains the vocabulary's fit for a defined prototype scope, reviews representative examples, identifies inclusion boundaries, and addresses categories absent from the current list. Specific examples and contextual limits are recorded. | Concrete documented examples that do not fit the five categories; distinctions that the broad categories erase; or expert explanation that the list misrepresents the relevant works or scope. | Partially supported |
| `human.parts.required` | Each structured human must include all six configured parts: head, body, left/right arms, and left/right legs. The validator checks software structure. | `ccrt-fig4-3-grammar-palaghata-structure-01` describes a head, raised hands, small legs, and a two-triangle construction in one Palaghat figure. D'SOURCE describes people in scenes but does not establish part completeness. | `source-ccrt-living-traditions`; `source-dsource-idc-warli-documentation`. | Partially supported for some parts in one source-described figure; insufficient for a universal six-part requirement. | One specific description mentions a head, hands, and legs. It does not enumerate all six software parts or state that every human representation must include them. | Whether the six named parts and left/right distinctions fit the documented representations; whether each part is required; how variation, abstraction, pose, or partial depiction should be handled. | An attributed expert reviews relevant examples and explains whether all six are expected within a clearly stated scope, including how omissions, occlusion, stylization, and variants should be interpreted. | Examples within the stated scope where a figure intentionally omits, merges, or differently represents a part; or expert explanation that the six-part schema imposes an unsuitable assumption. | Partially supported |
| `human.part.primitive` | Head → circle; body → triangle; each arm and leg → line. The validator enforces the configured part-to-primitive mapping. | `ccrt-fig4-3-grammar-palaghata-structure-01` reports two isosceles triangles and vertical lines for one figure, but does not map each primitive to all six parts. D'SOURCE's general geometry discussion names circles, triangles, squares, and lines without an anatomy-to-primitive mapping. | `source-ccrt-living-traditions`; `source-dsource-idc-warli-documentation`. Rao's general geometric discussion is not specific evidence for this mapping. | Partially supported for geometric construction in one figure; insufficient for the exact six-part mapping. | Geometric forms and lines are described, and one figure is described with two triangles and lines. The evidence does not establish a circular head, a triangle as the universal body form, or line primitives for each arm and leg. | Whether the mapping accurately represents the documented construction; whether mappings vary by depiction, maker, context, pose, or abstraction; and the appropriate scope of any such mapping. | Attributed, example-specific expert review identifies which shapes correspond to which parts in relevant representations and supports the proposed mapping within a stated scope, while documenting variation. | Relevant examples show other part-shape relationships or the expert explains that the mapping is misleading, incomplete, or not a suitable cultural description. | Partially supported |
| `theme.allowed-motifs` | A composition may use only motifs enabled by its selected theme configuration. This is a software layout constraint. | D'SOURCE observations describe motifs and relationships in Tree of Life, Tarpa Nritya, and harvest scenes; Rao records people in a Tarpa Dance figure. CCRT describes cultural contexts, but the corpus has no exhaustive theme-level inclusion/exclusion observations. | `source-dsource-idc-warli-documentation`; `source-rao-warli-aesthetics-2022`; `source-ccrt-living-traditions`. | Positive examples are partially documented; insufficient evidence for exclusive allow-lists or exclusions. | Selected descriptions associate certain motifs with particular works and contexts. They do not establish that unlisted motifs are inappropriate or prohibited in a theme. | Whether themes should be encoded as exclusive motif sets at all; what “theme” means for the prototype; evidence for both inclusion and exclusion, variation, overlap, and context. | Whether explicit motif allow-lists are appropriate for documented themes/contexts, and what evidence supports inclusion or exclusion of particular motifs. | An attributed expert explains the intended theme scope and supports specific inclusions and exclusions with examples and contextual reasoning; the limits and exceptions are recorded. | A documented example places a supposedly excluded motif in that theme/context; expert explanation identifies overlap, fluidity, or context-specific variation that invalidates exclusivity. | Insufficient evidence |

## D. Proposed Expert Questions

Use the rule-specific question in the matrix as the primary prompt. Ask the expert to explain the scope of their response and whether it refers to personal practice, particular works or makers, a regional/contextual tradition, research, or another basis. Invite examples, variation, uncertainty, and disagreement. Do not ask the expert to certify the prototype as “authentic” or to speak for a whole community.

The complete prompts are repeated in the review form so they can be presented without requiring this plan during a session.

## E. Evidence Required for Each Rule

For every rule, a useful validation record needs:

1. A specific claim under review and the exact software representation shown to the expert.
2. The observation IDs, source IDs, and limited source summaries presented to the expert, clearly labeled as source-reported rather than independent annotations.
3. The expert's own attributed words or a clearly marked faithful summary, with the basis and scope of the statement.
4. Concrete examples, counterexamples, qualifications, or disagreements the expert identifies, including enough provenance to revisit them where permission allows.
5. An explicit record of whether the expert agrees, disagrees, partially agrees, or cannot assess the claim, and what modification they recommend, if any.

Rule-specific evidence thresholds:

- **`motif.allowed`:** Discussion of the five IDs and their boundaries, plus examples of categories that fit, do not fit, or need splitting/combining for the defined prototype scope. A few positive examples do not establish an exhaustive vocabulary.
- **`human.parts.required`:** Review of all six named parts across relevant figure examples, including intentionally absent, merged, occluded, or stylized parts. Presence in one figure does not establish a universal requirement.
- **`human.part.primitive`:** Explicit part-by-part assessment of head/circle, body/triangle, both arms/line, and both legs/line, including variation and scope. General evidence that geometric shapes occur is not enough.
- **`theme.allowed-motifs`:** Evidence must address inclusion and exclusion, not only motifs present in an example. Record overlap, variation, and cases where the theme does not determine a closed motif set.

## F. Validation Recording Procedure

1. Before the session, select the rule and prepare the relevant corpus observation summaries and source references. Do not edit the source or observation records to match an anticipated answer.
2. Explain that the displayed rule is a prototype software constraint under review, not an established cultural rule. State that no expert validation is recorded yet.
3. Ask the open-ended rule-specific question first. Show the configured claim and relevant evidence, then invite corrections, examples, counterexamples, scope limits, and uncertainty.
4. Take notes or record audio only after obtaining permission. If recording is declined, use notes only if the expert permits note-taking. Record permission conditions and any limits on quotation, attribution, storage, or reuse.
5. Complete a separate form for each rule discussed. Keep direct quotations distinct from the recorder's paraphrase; offer the expert a chance to review the written statement where feasible.
6. Preserve the original source → observation chain. Add the expert statement as a separate attributed record in a later approved research step; do not overwrite or silently relabel source evidence.
7. Record the outcome as agreement, disagreement, partial agreement, or unable to assess, with scope and reasons. Do not convert the response directly into a code or rule change.

## G. Attribution Requirements

Record only information the expert permits the project to retain. Ask for the expert's preferred name or attribution, role/affiliation as they wish it stated, date, and permission conditions. Distinguish an expert's own practice or assessment from an institutional position or a claim to represent others. Do not imply community-wide endorsement from an individual response.

For any later public use, preserve the expert's preferred attribution and the agreed quotation or summary scope. If anonymity or limited-use permission is requested, honor that scope. Keep the source citations and observation IDs alongside the validation record so readers can inspect both provenance chains.

## H. Limitations

- Phase 13 contains source-reported descriptions, not systematic independent visual annotations.
- The corpus includes only four artwork-level records with observations; the seven catalogue-only works do not provide motif or grammar analysis.
- CCRT's described construction concerns one Palaghat figure. D'SOURCE's documentation provides examples but is one publication, even though it has a page and PDF. Rao is a secondary source.
- No measurements or grammar evidence records exist. No counterexample survey has been completed.
- Expert review can be scoped, situated, and internally varied. One response is not consensus and does not settle differences among makers, contexts, or interpretive traditions.
- The form does not assert that any expert has participated. All expert fields remain blank until a real review occurs with permission.
- A validation statement can support, qualify, or challenge an interpretation; it does not by itself establish an exhaustive software vocabulary or universal rule.

## I. Rule-Promotion Decision Process

Keep each production rule unchanged and pending during Phase 14 preparation. After actual attributed validation is recorded:

1. Compare the validation statement with the original source evidence and research observations without merging their provenance.
2. Assess scope, specificity, examples, counterexamples, disagreement, and limitations. Treat the expert response as one evidence chain, not automatic confirmation.
3. If the software claim is not supported at the proposed scope, retain pending status or revise the research question in a later reviewed phase. Do not infer a rule from a positive example alone.
4. If there is disagreement or meaningful variation, preserve both chains and document the conflict. Do not label it resolved without further evidence.
5. Only a separate, explicit rule-promotion review may propose a production-rule change or add `sourceReferenceIds`. That review must establish a traceable evidence chain and state the rule's scope, known variation, and counterevidence. Expert input alone does not trigger promotion.

At the end of this preparation phase, all four rules remain unpromoted; source-backed rules remain 0 and pending rules remain 4.
