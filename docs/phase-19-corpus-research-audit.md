# Phase 19 — Corpus-Level Research Audit

## Purpose and method

Phase 19 audits the current production corpus through a deterministic, read-only utility in `src/data/corpusResearchAudit.ts`. It joins the existing source, artwork, observation, Phase 18 documentary assessment, Phase 16 review-guide, grammar-rule, and rule-promotion structures. It does not add or revise research records.

The audit reports **formal documentary evidence assessments** separately from **review-dossier context**. The Phase 16 guide selects material to show a future reviewer, but those references are not Phase 18 support/limit/challenge/context/unresolved relationships. With no production assessments, all formal relationship counts are zero; dossier context remains separately visible.

The generated audit result below is rendered from the current production records by `renderCorpusAuditReport`. A test compares the documentation section with that renderer, so counts and per-rule results must be regenerated from the model when the corpus changes.

## Distinct layers and counting rules

- **Source record:** one item in the corpus source registry. A source count is not a publication-independence count.
- **Publication record:** where an observation is linked, the source ID is used as a publication/resource proxy. The source schema does not define a general canonical-publication or work-family ID. The audit therefore reports the three distinct source records attached to observations and makes no independence claim from that count.
- **Artwork:** one catalogued or source-described artwork record. Direct artwork-source links are distinct from attribution-source links.
- **Observation:** a motif or grammar observation attached to an artwork. Measurements are counted separately. Provenance is resolved first from the observation’s `sourceReferenceId`, then from the artwork’s `source` link; the audit separately counts direct source-specific links and inherited artwork provenance.
- **Formal grammar evidence:** the raw research corpus `grammarEvidence` records and their source/observation links. These remain separate from Phase 18 evidence assessments.
- **Documentary evidence assessment:** a Phase 18 assessment with claim-specific relation, scope, rationale, and provenance. It may support, limit, challenge, contextualize, or preserve unresolved evidence.
- **Expert validation:** Phase 15/16 response capture is session-local unless explicitly exported. No expert response is stored in the production corpus; current persistent count is zero.

## Publication independence and repeated records

Repeated artwork observations from the same source ID are source reuse, not additional sources. The current D’SOURCE publication is represented once in the registry although both its page and PDF are cited; it has observations on three artworks. CCRT, Rao, and D’SOURCE are the three source records linked to artwork-specific observations. These are distinct publication records for this audit, but that alone does not establish independent corroboration. The research documentation specifically notes that Rao and D’SOURCE have overlapping authorship and should not be counted as independent corroboration for every overlapping claim. Phase 18 source comparisons are the structured place to record a claim-specific publication relationship and its basis; there are currently no such production records.

The historical research documentation describes broad cross-source recurrence for some general visual vocabulary and subject matter. This audit does not turn that broad recurrence into rule-specific support. The rule-promotion review and Phase 16 guide remain explicit that exact rule claims need narrower evidence and that some claims overlap through authorship.

## Rule audit interpretation

For each rule, the audit displays:

- the software claim and implementation locations;
- formal assessment link counts by relationship, including separate formal source/publication/artwork counts;
- Phase 16 dossier context counts, clearly labeled as context;
- the strongest documented support described by the existing rule-promotion materials;
- limitations, unresolved questions, next evidence, readiness labels, and gap classifications.

No numerical evidence or readiness score is calculated. The list follows configured rule order; it is not a ranking. A `limited documentary evidence` status describes the presence of source-reported examples in context and does not mean the software rule has been validated or promoted.

## Gap classifications

- **DOCUMENTATION GAP:** more attributable published/documentary material is needed to support the claim or its boundaries.
- **CORPUS COVERAGE GAP:** the number or variety of artwork examples is not sufficient to inspect the claim’s scope or exceptions.
- **CROSS-SOURCE GAP:** claim-relevant material needs comparison across publications; repeated records from one publication do not add independence.
- **SCOPE GAP:** the software claim is broader than the artwork/context scope established by current descriptions.
- **MEASUREMENT GAP:** quantitative evidence is needed for a claim but is absent.
- **VALIDATION GAP:** an appropriately scoped question should be presented to a qualified artisan/domain expert; expert input supplements documentary research and does not replace it.
- **CONFLICT GAP:** evidence relationships disagree and require preservation and investigation.

The current audit identifies documentation, corpus coverage, cross-source, scope, and validation gaps. It does not assign a measurement gap because the four rules are categorical software-schema claims and do not depend on numerical measurements. It does not assign a conflict gap because no conflicting assessment records exist; this does not establish that no variation or conflict exists in the broader material.

## What this audit can and cannot establish

The utility can count and trace current structured records, identify missing provenance, deduplicate repeated observation references by source ID, aggregate explicit Phase 18 relationship links, and surface the current documentary and validation gaps. It cannot verify that a source is accurate, that an observation fully represents an artwork, that two publications are independent, or that an interpretation is culturally authoritative. Source documentation status and observation `confidence` are not validation scores.

The audit does not infer cultural rules from generator configuration or output. It does not promote rules, modify rule definitions, attach `sourceReferenceIds`, or treat Phase 16 dossier references as validated evidence. No generated artwork is described as authentic Warli.

## Future research and relationship to validation/promotion

Documentary research should seek further source descriptions and artwork coverage for motif categories, part completeness, exact part-to-primitive constructions, and motif/context inclusions and exclusions. Source comparisons should record publication relationships with a written basis and at claim-specific scope. Additional artwork records should include observed exceptions rather than only positive examples.

Phase 14’s expert questions and evidence criteria remain the preparation guide. Real future feedback belongs in Phase 15’s attributed validation schema and Phase 16’s local review workspace. It must remain distinct from documentary assessments and preserve disagreement. A separate human rule-promotion review must consider documentary provenance, claim scope, gaps, counterexamples, source relationships, and expert statements where available. The Phase 19 audit itself makes no promotion decision.

## Actual audit results

<!-- BEGIN GENERATED CORPUS AUDIT -->
### Corpus totals

| Measure | Current result |
| --- | ---: |
| Source records | 7 |
| Observation-bearing publication records | 3 |
| Artwork records | 12 |
| Motif observations | 9 |
| Grammar observations | 5 |
| Measurements | 0 |
| Formal grammar evidence records / links | 0 / 0 |
| Documentary assessments / links | 0 / 0 |
| Expert validation records | 0 |
| Observation records with provenance | 14 / 14 |
| Source-specific observation provenance | 14 |
| Artwork-inherited provenance | 0 |
| Observation-bearing source records | 3 |
| Source comparison records / independent pairs | 0 / 0 |
| Source-backed / pending rules | 0 / 4 |

Publication note: the source schema has no general publication-family registry. “Observation-bearing publication records” counts distinct source IDs attached to motif/grammar observations (a record-level proxy); it is not a count of independent corroboration. The D’SOURCE web page and PDF are represented by one source record. Phase 18 source-comparison assessments provide explicit relationship declarations; there are currently none.

### Source relationships and reuse

| Source ID | Record class | Status | Artwork links (direct / attribution) | Motif obs. | Grammar obs. | Measurements |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| source-british-museum-jivya-mashe | catalogue/portal or candidate record | documented | 0 / 1 | 0 | 0 | 0 |
| source-british-museum-varli-term | catalogue/portal or candidate record | partially-documented | 6 / 0 | 0 | 0 | 0 |
| source-ccrt-living-traditions | observation-bearing publication record | partially-documented | 1 / 0 | 0 | 1 | 0 |
| source-dsource-idc-warli-documentation | observation-bearing publication record | documented | 3 / 0 | 8 | 3 | 0 |
| source-mota-tribal-faces | catalogue/portal or candidate record | pending-review | 0 / 0 | 0 | 0 | 0 |
| source-museums-of-india-national-museum | catalogue/portal or candidate record | partially-documented | 1 / 0 | 0 | 0 | 0 |
| source-rao-warli-aesthetics-2022 | observation-bearing publication record | documented | 1 / 1 | 1 | 1 | 0 |

The three observation-bearing publication records are CCRT, Rao, and D’SOURCE. D’SOURCE supplies 11 observation records across three artwork records but remains one publication. Rao and D’SOURCE are distinct publications, but the rule-promotion review cautions that overlapping authorship means they are not independent corroboration for every overlapping claim. The corpus currently contains no explicit Phase 18 publication-comparison assessment.

### Artwork observation coverage

| Artwork ID | Source ID | Motif observation IDs | Grammar observation IDs | Measurements | Provenance |
| --- | --- | --- | --- | --- | --- |
| british-museum-1988-0209-0-1 | source-british-museum-varli-term |  |  |  | 0/0 linked |
| british-museum-1988-0209-0-2 | source-british-museum-varli-term |  |  |  | 0/0 linked |
| british-museum-1988-0209-0-3 | source-british-museum-varli-term |  |  |  | 0/0 linked |
| british-museum-1988-0209-0-4 | source-british-museum-varli-term |  |  |  | 0/0 linked |
| british-museum-1988-0209-0-5 | source-british-museum-varli-term |  |  |  | 0/0 linked |
| british-museum-1988-0209-0-6 | source-british-museum-varli-term |  |  |  | 0/0 linked |
| ccrt-2017-figure-4-3-palaghat-caukat | source-ccrt-living-traditions |  | ccrt-fig4-3-grammar-palaghata-structure-01 |  | 1/1 linked |
| dsource-2016-paddy-harvest-painting | source-dsource-idc-warli-documentation | dsource-harvest-motif-animal-01, dsource-harvest-motif-human-01 | dsource-harvest-grammar-composition-01 |  | 3/3 linked |
| dsource-2016-rice-fields-tarpa-nritya-painting | source-dsource-idc-warli-documentation | dsource-rice-tarpa-motif-animal-01, dsource-rice-tarpa-motif-human-01 | dsource-rice-tarpa-grammar-composition-01 |  | 3/3 linked |
| dsource-2016-tree-of-life-painting | source-dsource-idc-warli-documentation | dsource-tree-of-life-motif-animal-01, dsource-tree-of-life-motif-human-01, dsource-tree-of-life-motif-sun-01, dsource-tree-of-life-motif-tree-01 | dsource-tree-of-life-grammar-relationships-01 |  | 5/5 linked |
| museums-of-india-national-museum-warli-painting | source-museums-of-india-national-museum |  |  |  | 0/0 linked |
| rao-2022-figure-2-tarpa-dance | source-rao-warli-aesthetics-2022 | rao-2022-fig2-motif-human-01 | rao-2022-fig2-grammar-spiral-composition-01 |  | 2/2 linked |

### Rule-by-rule audit

#### motif.allowed

- **Current software claim:** A motif must exist in the configured motif vocabulary. Configured IDs: human, tree, hut, animal, sun.
- **Implementation:** src/data/motifs.ts, src/data/grammar.ts, src/grammar/validator.ts
- **Formal documentary assessment links:** supports: 0; limits: 0; challenges: 0; contextualizes: 0; unresolved: 0. Assessment records: 0.
- **Review-dossier sources / publication records / artworks:** 2 / 2 / 4. These count selected documentary context, not support or independence.
- **Formal assessment sources / distinct publications / artworks:** 0 / 0 / 0.
- **Expert validation records:** 0. **Review-dossier context only:** 9 records, 2 source records, 4 artworks. These are not formal rule evidence assessments.
- **Readiness:** limited documentary evidence; cross-source support needed; expert validation needed; insufficient evidence. **Promotion:** not promoted.
- **Strongest documented support currently described:** The corpus records source-described human, tree, animal, and sun examples across the Rao Tarpa Dance figure and three D’SOURCE artworks. The D’SOURCE examples are one publication repeated across three artworks; they do not establish an exhaustive vocabulary.
- **Current limitations:** No motif observation records hut; houses in source prose were not normalized to hut. The five configured motif IDs are software vocabulary entries, not a complete source-derived taxonomy.
- **Unresolved questions:** Are additional or different motif categories needed for this prototype? Which source-described elements should remain outside the application’s motif IDs?
- **Required next evidence:** Documented examples and non-examples across additional artworks and publications. Artisan/domain-expert feedback on whether this vocabulary is useful within the explicitly stated prototype scope.
- **Gap classes:** DOCUMENTATION GAP; CORPUS COVERAGE GAP; CROSS-SOURCE GAP; SCOPE GAP; VALIDATION GAP.

#### human.parts.required

- **Current software claim:** A configured human structure includes each defined body part. Configured parts: head, body, left arm, right arm, left leg, right leg.
- **Implementation:** src/data/grammar.ts, src/grammar/validator.ts, src/generator/generateHuman.ts
- **Formal documentary assessment links:** supports: 0; limits: 0; challenges: 0; contextualizes: 0; unresolved: 0. Assessment records: 0.
- **Review-dossier sources / publication records / artworks:** 2 / 2 / 4. These count selected documentary context, not support or independence.
- **Formal assessment sources / distinct publications / artworks:** 0 / 0 / 0.
- **Expert validation records:** 0. **Review-dossier context only:** 4 records, 2 source records, 4 artworks. These are not formal rule evidence assessments.
- **Readiness:** limited documentary evidence; cross-source support needed; expert validation needed; insufficient evidence. **Promotion:** not promoted.
- **Strongest documented support currently described:** CCRT describes selected parts in one Palaghat figure, including a head, raised hands, and small legs. This is one source-described figure and does not state that all six configured software parts are required in every relevant representation.
- **Current limitations:** D’SOURCE describes people in scenes but does not record part-by-part completeness. No systematic assessment of absent, merged, obscured, or stylized parts exists.
- **Unresolved questions:** Are all six configured parts needed in the relevant representation scope? Are left/right distinctions source-supported or renderer conveniences?
- **Required next evidence:** Artwork-specific descriptions or carefully documented analyses that include omissions and variations. Expert review of the configured six-part structure and its intended scope.
- **Gap classes:** DOCUMENTATION GAP; CORPUS COVERAGE GAP; CROSS-SOURCE GAP; SCOPE GAP; VALIDATION GAP.

#### human.part.primitive

- **Current software claim:** Each human part uses its configured primitive. Configured mapping: head → circle; body → triangle; each arm and leg → line.
- **Implementation:** src/data/grammar.ts, src/grammar/validator.ts
- **Formal documentary assessment links:** supports: 0; limits: 0; challenges: 0; contextualizes: 0; unresolved: 0. Assessment records: 0.
- **Review-dossier sources / publication records / artworks:** 2 / 2 / 1. These count selected documentary context, not support or independence.
- **Formal assessment sources / distinct publications / artworks:** 0 / 0 / 0.
- **Expert validation records:** 0. **Review-dossier context only:** 2 records, 2 source records, 1 artworks. These are not formal rule evidence assessments.
- **Readiness:** limited documentary evidence; cross-source support needed; expert validation needed; insufficient evidence. **Promotion:** not promoted.
- **Strongest documented support currently described:** CCRT describes two triangles and lines in one Palaghat figure; D’SOURCE describes broad geometric vocabulary. Neither source maps every configured human part to the exact software primitive.
- **Current limitations:** The complete head/circle, body/triangle, arms/line, legs/line mapping is not documented. General geometric vocabulary is not a part-to-primitive mapping.
- **Unresolved questions:** Does each configured part-to-primitive mapping match a documented construction? Under which artwork, maker, or representation scope would such a mapping apply?
- **Required next evidence:** Artwork-specific source descriptions that identify both the part and its construction, including variations. Expert review of the mapping and its scope.
- **Gap classes:** DOCUMENTATION GAP; CORPUS COVERAGE GAP; CROSS-SOURCE GAP; SCOPE GAP; VALIDATION GAP.

#### theme.allowed-motifs

- **Current software claim:** A composition uses only motifs enabled by its selected theme configuration. Generator themes are prototype/demo configurations; the grammar validator does not enforce theme membership.
- **Implementation:** src/data/grammar.ts, src/generator/themes.ts, src/generator/generateComposition.ts
- **Formal documentary assessment links:** supports: 0; limits: 0; challenges: 0; contextualizes: 0; unresolved: 0. Assessment records: 0.
- **Review-dossier sources / publication records / artworks:** 3 / 3 / 4. These count selected documentary context, not support or independence.
- **Formal assessment sources / distinct publications / artworks:** 0 / 0 / 0.
- **Expert validation records:** 0. **Review-dossier context only:** 6 records, 3 source records, 4 artworks. These are not formal rule evidence assessments.
- **Readiness:** limited documentary evidence; cross-source support needed; expert validation needed; insufficient evidence. **Promotion:** not promoted.
- **Strongest documented support currently described:** D’SOURCE describes selected co-occurring motifs in Tree of Life, Tarpa Nritya, and harvest artworks; Rao describes one Tarpa Dance figure; CCRT covers narrative/ritual contexts. These are positive examples, not exhaustive allow-lists or exclusions.
- **Current limitations:** No evidence assessment records any inclusion or exclusion relationship. Prototype/demo theme configurations are software settings, not documentary observations.
- **Unresolved questions:** Is an explicit allow-list a suitable representation of source-documented contexts? What evidence supports inclusion or exclusion of particular motifs in a stated context?
- **Required next evidence:** Documented examples and counterexamples across contexts, with explicit scope and source independence review. Expert review of whether allow-lists are an appropriate software representation.
- **Gap classes:** DOCUMENTATION GAP; CORPUS COVERAGE GAP; CROSS-SOURCE GAP; SCOPE GAP; VALIDATION GAP.

### Gap classes found

- DOCUMENTATION GAP
- CORPUS COVERAGE GAP
- CROSS-SOURCE GAP
- SCOPE GAP
- VALIDATION GAP

No measurement gap was assigned because the four current claims are categorical/software-schema claims and do not require a numeric measurement to assess. No conflict gap was assigned because no conflicting assessment records exist; this is not evidence that the material contains no variation or conflict.

### Audit cautions

- No documentary rule evidence assessments are recorded; per-relationship counts are zero.
- No persistent expert validation records exist; Phase 16 capture remains session-local unless explicitly exported.
- No Phase 18 source/publication comparison records exist; publication independence is not established by the assessment layer.
- Review-dossier references are contextual preparation material and are not counted as documentary evidence assessments.
<!-- END GENERATED CORPUS AUDIT -->
