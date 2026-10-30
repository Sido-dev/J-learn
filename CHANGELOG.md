# Changelog

## 1.1.1 — 30 October 2026

- Rechecked the exact saved ZIP and verified every source checksum. The original 56 tests passed from a fresh extraction.
- Fixed kanji topic distractors escaping the selected topic when enough eligible comparisons exist. All new sessions now prefer eligible choices within the same meaning/reading/vocabulary task, with safe fallbacks for small pools. Previously saved sessions keep their frozen choices.
- Added regression coverage for topic distractors, four-choice validity across the bank and tiny pools, and two full continuous rounds across all three scripts.

## 1.1.0 — 29 October 2026 · content 2026.10.2

- Added Quiz & Tests with Hiragana/Katakana/Kanji categories, row filters, difficulty, session lengths, finite Practice/Test and optional Continuous Practice.
- Added separate Focus on mistakes, bookmark and introduced-material quizzes, study-first links, due/weak daily sessions, and prerequisite-aware lesson recommendations.
- Randomized questions and all four options on the server. Exhausted continuous pools revisit mistakes first, explain repetition, and avoid immediately repeating the previous question.
- Persisted exact order, options, checked answers, cursor, score and cycle across refresh. Finish saves a summary and recognition progress once; repeated rounds do not duplicate first-pass credit. Active tests conceal keys and scores until finish.
- Reworked lesson stages with 131 separate guided exercises, progressive hints, recorded skips, 124 independent assessments and 96 fresh targeted corrections. Removed navigation-as-learning credit.
- Rebuilt the reference shelf with charts, row/topic filters, Japanese/romaji/English search, character details, 278 study words, grammar/rules, bookmarks and connected quiz/stroke actions.
- Added 32 complete sourced starter kanji and 124 reliable KanjiVG stroke models; expanded formative typing to both basic kana scripts and contextual kanji words.
- Added the original SVG/PNG/ICO/apple favicon and attribution/provenance/update instructions.
- Fixed accidental utility-button submissions, durable completion beyond 500 recent attempts, retired-question review handling, hardcoded matching content and SQLite query/transaction isolation.
- Added additive migration 002 and immutable snapshot guards; retained existing accounts, attempts and old content versions. Split practice/reference/lesson/typing UI into focused modules.
- Expanded automated coverage from 30 to 56 tests. Updated setup, operational instructions, inventory, release evidence and prioritized backlog.

## 1.0.0 — 29 October 2026

Initial local development handover: curriculum, personal journal, graded reading, review, drawing/typing, synthetic audio, accounts and deployment preparation.
