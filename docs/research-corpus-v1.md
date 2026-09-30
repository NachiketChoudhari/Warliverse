# WARLIVERSE Research Corpus v1

## Corpus Summary

- Sources: 7 (the original 6 retained; one D’SOURCE/IDC record added)
- Artwork references: 12 (the original 8 retained; four source-described artworks added)
- Motif observations: 9
- Grammar observations: 5
- Measurements: 0
- Grammar evidence records: 0
- Source-backed rules: 0
- Rules pending documentation: 4

The corpus combines catalogue metadata with source-reported observations attached to four described artworks. These records transcribe institutional/academic text and are not independent visual annotations. The Ministry of Tribal Affairs PDF remains a candidate source pending reliable content review. No source images were copied into the repository.

## Source Table

| ID | Institution/Author | Source Type | Reference | Status |
| -- | ------------------ | ----------- | --------- | ------ |
| `source-museums-of-india-national-museum` | Museums of India / National Museum, New Delhi | Museum | [Portal listing](https://museumsofindia.gov.in/repository/) | Partially documented |
| `source-british-museum-varli-term` | The British Museum | Museum | [Varli collection term](https://www.britishmuseum.org/collection/term/x91069) | Partially documented; direct object detail pages were unavailable in this review |
| `source-british-museum-jivya-mashe` | The British Museum | Museum | [Jivya Soma Mashe person record](https://www.britishmuseum.org/collection/term/BIOG230792) | Documented |
| `source-mota-tribal-faces` | Ministry of Tribal Affairs, Government of India | Government | [Tribal Faces in India PDF](https://tribal.nic.in/DivisionsFiles/tribalFaces.pdf) | Pending review; candidate only |
| `source-ccrt-living-traditions` | Centre for Cultural Resources and Training | Government | [Living Traditions PDF](https://ccrtindia.gov.in/wp-content/uploads/2021/05/Living-of-Tradition-Tribal-Painting.pdf) | Partially documented; Warli chapter extracts pp. 29–32 reviewed; direct PDF fetch timed out |
| `source-rao-warli-aesthetics-2022` | K. Mrutyunjaya Rao, ShodhKosh: Journal of Visual and Performing Arts | Academic | [Article](https://www.granthaalayahpublication.org/Arts-Journal/ShodhKosh/article/view/156) · DOI: 10.29121/shodhkosh.v3.i2.2022.156 | Documented bibliographic record; secondary source |
| `source-dsource-idc-warli-documentation` | Sagar Yende and Ravi Poovaiah, D’SOURCE / IDC, IIT Bombay | Academic/institutional documentation | [Warli paintings page](https://www.dsource.in/resource/documentation-warli-art/warli-paintings) · [PDF](https://www.dsource.in/sites/default/files/resource/documentation-warli-art/downloads/file/documentation-warli-art.pdf) | Documented; page and PDF are the same publication |

The British Museum term page exposes six related paintings numbered `1988,0209,0.1` through `.6`, dated `1985–1988`, made in Maharashtra, and found/acquired in India. Its index identifies Jivya Soma Mashe as maker for `.3` and lists `Varli` as maker for the other five. `Varli` remains in notes as the museum's maker field rather than being reinterpreted as an individual artist or as an artwork community field. The Museum of India listing provides the title “Warli Painting” and the associated institution name National Museum, New Delhi; further object details were not entered.

The article by Rao is retained as a **Secondary Source**. The paper reports that parts of its discussion draw on the author's observations, field visits, workshops, and interactions. Its statements are not treated as universal or independently established grammar rules. The paper states a CC BY 4.0 license; no artwork images were copied.

## Observation Coverage (Phase 13)

The original six British Museum artworks (`british-museum-1988-0209-0-1` through `-0-6`) remain catalogue-only. The British Museum index identifies six paintings and their catalogue metadata, including the maker attribution for `.3`, but no visual analysis was added. The existing Museums of India record remains title-level metadata only. No motifs are inferred for these seven catalogue entries.

The eighth original artwork, `rao-2022-figure-2-tarpa-dance`, retains its two single-source observations from Rao (2022), p. 209. The article describes people dancing around a tarpa player and associates Tarpa dance with spiral/concentric arrangements. The description is limited to that figure and is not an independent image classification.

Three artwork records were added from source-described illustrations:

- `ccrt-2017-figure-4-3-palaghat-caukat`: CCRT Figure 4.3 captioned “Palaghat goddess, Caukat, Warli painting, Maharashtra” (p. 29), with its accompanying description on pp. 29–32. The one grammar observation records the text’s two inverted isosceles triangles, slanted vertical lines, small legs, raised hands, and head. This is a source description of this figure, not a rule for every human figure.
- `dsource-2016-tree-of-life-painting`: D’SOURCE describes a central Tree of Life with the Sun above and birds, monkeys, and humans celebrating it (printed p. 11). Four motif observations record only the named vocabulary classes; one grammar observation records the reported central relationship.
- `dsource-2016-rice-fields-tarpa-nritya-painting`: D’SOURCE describes a central Tarpa Nritya formation, paddy below, women’s activities around houses, and named animals in the mountain/forest above (printed p. 11). Two motif observations and one composition observation preserve those statements. “Houses” was not normalized to the software’s `hut` ID.
- `dsource-2016-paddy-harvest-painting`: D’SOURCE describes men and women working farms and names fish, lobsters, crabs, monkeys, peacocks, birds, deer, dogs, and goats within a waterbody/mountain scene (printed p. 15). Two motif observations and one composition observation record those details. Waterbody, mountain, and field remain source-documented elements outside the current motif vocabulary.

The D’SOURCE web page and PDF are one publication, not two independent sources. CCRT is an institutional government publication; D’SOURCE is an IDC/IIT Bombay design documentation resource; Rao is a separate academic article with reported field observation and secondary references. No direct copied passage linking CCRT to D’SOURCE was identified in the reviewed material. Broad claims about geometric vocabularies and social/nature scenes recur across CCRT and D’SOURCE, so those general claims are classified as **independent repeated evidence** at the source level. Exact figure construction remains **single-source** where only CCRT Figure 4.3 describes that construction. Rao’s spiral description remains **single-source**; D’SOURCE separately describes a central Tarpa formation but does not specify a spiral in that artwork. No conflicting artwork-level observation was found; conflicts have not been comprehensively assessed.

The new records support examples and partial claims only. They do not establish exhaustive motif vocabularies, universal figure construction, or exclusive theme allow-lists. No measurements were made because no image was reliably measured with a reproducible method. Measurements remain empty. No production grammar evidence records were added.

## Provenance and Rights

Artwork records link to an institutional source ID. The Jivya Soma Mashe maker attribution also points to the Museum person record. The system stores metadata and official links only. Rights information is recorded only where the source explicitly states it (the Rao article's CC BY 4.0 notice); museum image rights are not inferred from access to catalogue pages.

Corpus import passes through the Phase 10 validate-only pipeline before normalized source, artwork, and observation records are used. Importing these records does not change grammar rules or attach source IDs to them. The research `grammarEvidence` array remains empty: the observations inform a review matrix but are not attached to production rules. No artwork images were copied.
