# Curriculum inventory and expansion

Release: `2026.10.2`. Lesson explanations/examples are original; reference and stroke sources are attributed in `CONTENT-SOURCES.md`. The course uses the JLPT as a reference, not an official syllabus or a certification claim. Official JLPT information: https://www.jlpt.jp/e/about/points.html and https://www.jlpt.jp/e/guideline/testsections.html. Speaking and writing are additional tracks, not JLPT-tested sections. A Japanese-language educator has not yet reviewed this release.

## Available

- Foundations: sound/script orientation, steady vowels, study rhythm, three polite greetings.
- Hiragana: ten groups cover all 46 basic characters, each introducing three to five characters; focused lessons for dakuten/handakuten, small combinations, small っ, long vowels, particle readings, and synthetic vowel listening.
- Katakana: ten basic groups covering 46 characters, voiced/p sounds, long-vowel marks, common combinations and four loanwords in context.
- Beginner: identity/question sentences, object particles and requests, polite past, and 一二三 introductory kanji.
- Intermediate samples: giving reasons with ので and experience with た-form + ことがある.
- Advanced samples: polite/humble register and qualifications with 必ずしも〜とは限らない, including word-level reading help.
- Three graded original passages: vowel-only word reading, a beginner tea micro-story, and an intermediate rainy-day passage. Each explains unfamiliar vocabulary before separate decoding and comprehension checks.
- A 30-day plan for kana and simple reading. Its pace can be repeated/adjusted; it does not promise fluency.
- Searchable 104-entry reference per kana script: 46 basic, 20 dakuten, 5 handakuten, and 33 combinations. Each has examples; katakana sound transcriptions are labelled when they are not common loanwords.
- 32 complete starter kanji, each with core meanings, on/kun readings, real contextual words, a complete supported sentence, stroke count, visual components, and connected quizzes/bookmarks/stroke practice.
- 547 four-choice MCQs (214 hiragana, 206 katakana, 127 kanji), including vocabulary. Every session freezes its eligible pool and versions; see `PRACTICE-SESSIONS.md`.
- 39 lessons retain 124 independent assessments, with 131 separate guided items and 96 targeted corrections.
- 278 deduplicated vocabulary entries (starter examples, not a frequency dictionary); three passages.
- 124 reliable KanjiVG ordered stroke models: all 92 basic kana and all 32 starter kanji. Modifier/combined shapes use individual models or freehand. No automated handwriting judgement.
- 124 formative typing prompts across both basic kana scripts and contextual kanji-word readings; typing notes remain separate from independent mastery.

Machine-readable counts and stage coverage: `curriculum-inventory.json`.

## Planned and intentionally incomplete

Full N5/N4/N3/N2/N1 sequences, comprehensive vocabulary/kanji inventories, native-speaker audio, additional stroke coverage, licensed authentic media, contextual pitch-accent instruction, essay feedback, and pronunciation assessment. Advanced samples are available, but a complete beginner-to-advanced curriculum is not claimed. Planned material is shown as expansion text, not as empty playable lessons.

## Content contract

1. Add a `Lesson` object in `shared/content.ts`, with a stable ID, integer version, stage, prerequisite IDs, objectives, explanation, examples, and explicit exercise IDs.
2. Introduce only three to five new characters or one focused concept. Explain every unfamiliar word before asking about it. Check furigana, register, meaning, mora length, and accepted spellings with an educator.
3. Keep evaluation answer arrays and corrective explanations in server-owned structured content. Do not import content at runtime into client components. Type-only imports are safe.
4. Add romanization variants explicitly, e.g. shi/si. Normalization accepts case, harmless spacing, and supported macrons; it does not collapse ou to o or doubled consonants to single consonants. Semantic answer variants need explicit author review.
5. New lesson: version 1. Editing an already released lesson or its exercises: increment the lesson version and update associated exercise versions together. Never overwrite a shipped snapshot. Retain old question IDs/versioned records for historical attempts. Lessons in this release are version 3; MCQ banks are version 2. The seed rejects a changed snapshot at the same version.
6. Run curriculum integrity, grading, and progression tests. Include a counterexample for every newly accepted spelling. Check public serialization. Run the migration/seed to insert new snapshots without altering user records.
7. Add/update graded reading, audio transcripts, source/license notes, and any planned-to-available labels. Do not list a resource as available until it works.
8. Review narrow-screen furigana and audio-unavailable behavior. Publish only after technical and language review.

## Audio, fonts, and assets

Japanese/English system fonts require no redistributed font files. Illustrations and the favicon were authored for this application. Ordered stroke paths are extracted from KanjiVG, CC BY-SA 3.0; source filenames and hashes are in `stroke-provenance.json`. Starter kanji readings and counts were checked against KANJIDIC2. See `CONTENT-SOURCES.md` for attribution, licence scope, and refresh steps. Audio is generated by the user's device speech engine and explicitly labelled synthetic; no third-party recordings are redistributed. Device availability, quality, and license/terms depend on the installed engine. No external speech provider, remote tutor, licensed media corpus, or unverified public audio URL is wired in.
