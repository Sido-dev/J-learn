# Content sources, licensing and review

Content release 2026.10.2, assembled and checked 29 October 2026. This collection has not received native-speaker or educator review. Useful readings are a subset, not an exhaustive dictionary. All kanji reading assessments give a taught word/meaning; the word determines the reading. Components are visual observations, not historical etymology or invented radical classifications.

## Starter kanji reference

The 32 editorial entries, examples and sentences in `shared/kanji.ts` were written for Sumi. Their listed on/kun readings and stroke counts were checked programmatically against the official KANJIDIC2 download: all 32 counts and listed readings matched after the dictionary's notation was normalized. This checks those fields only; it does not certify example quality or educational suitability.

KANJIDIC2 is a dictionary file from the KANJIDIC Project, copyright James William Breen and the Electronic Dictionary Research and Development Group (EDRDG). Sumi acknowledges and thanks those authors and contributors. The project uses its data under the EDRDG general dictionary licence, Creative Commons Attribution-ShareAlike 4.0. Starter kanji reference entries are distributed under CC BY-SA 4.0; editorial explanations, selected common fields, example words and sentences are adaptations/selection for this learning interface. No SKIP codes or proprietary dictionary-index fields are used. No endorsement is implied.

- Project and documentation: https://www.edrdg.org/wiki/index.php/KANJIDIC_Project
- Official download: https://www.edrdg.org/kanjidic/kanjidic2.xml.gz
- EDRDG statement: https://www.edrdg.org/edrdg/licence.html
- Licence terms: https://creativecommons.org/licenses/by-sa/4.0/legalcode
- Bundled statement: `public/licenses/edrdg-licence.txt`; licence reference: `public/licenses/CC-BY-SA-4.0.txt`.

The raw dictionary is not redistributed. Kana examples, grammar explanations, lessons, reading passages and the favicon are original editorial work; device speech is synthetic, not a native recording. Some katakana examples deliberately transcribe native words or sounds and are labelled as such. The vocabulary shelf is a deduplicated study-example collection, not a curated frequency dictionary.

## Ordered stroke paths

`shared/stroke-data.json` contains 124 ordered path sets extracted from KanjiVG: 46 hiragana, 46 katakana, and the 32 starter kanji. Copyright © 2009–2026 Ulrich Apel and contributors. Licence: Creative Commons Attribution-ShareAlike 3.0. The extraction retains ordered `d` attributes and upstream 109×109 coordinates; the UI scales them into its drawing canvas and adds stroke numbers. Data adaptations remain CC BY-SA 3.0. No handwriting scoring or upstream endorsement is implied.

- Project: https://kanjivg.tagaini.net/
- Source: https://github.com/KanjiVG/kanjivg
- Licence terms: https://creativecommons.org/licenses/by-sa/3.0/legalcode
- Exact original filenames, SHA-256 hashes and stroke counts: `docs/stroke-provenance.json`.
- Attribution/changes: `public/licenses/kanjivg.txt`; licence reference: `public/licenses/CC-BY-SA-3.0.txt`.

The licence reference files point to the official legal terms; they do not claim to reproduce the full Creative Commons legal code. Upstream per-file hashes identify the imported release snapshot. The initial import used the upstream master branch on the recorded retrieval date; future refreshes must select an explicit reviewed commit/tag using `python3 scripts/import-strokes.py --revision COMMIT_OR_TAG`.

## Refresh procedure

1. Check official project/licence documentation and download current data to a temporary directory outside the source package. Review upstream changes and preserve attribution/ShareAlike terms.
2. Validate all listed kanji counts/readings against KANJIDIC2; have an educator check selected meanings, contextual words, sentence readings, register and pedagogy. Do not simply copy a larger unreviewed inventory.
3. Import an explicitly reviewed KanjiVG revision with the provided script. Inspect the path and provenance diff, stroke counts and models visually. Keep the source hashes; do not ship temporary raw dictionaries.
4. Bump affected lesson/bank versions for changed seeded questions. Never overwrite an existing version. Run integrity/privacy/grading tests, `npm run check`, `npm run smoke`, `npm run inventory` and browser QA. The seed deliberately refuses silent changes at an existing ID/version.
5. Back up the existing database, migrate/seed in staging and confirm old attempts and active session snapshots still work before release. Publish only within the separately authorized deployment scope.
