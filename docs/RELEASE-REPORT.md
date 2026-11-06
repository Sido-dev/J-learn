# Release report — Sumi 1.1.1

Original handover: 30 October 2026 · content 2026.10.2 · schema 2. CI evidence reconciled on 6 November 2026; hosted release status is tracked separately from local/CI verification. Source and compiled output are included; dependencies, secrets, demo users/databases, raw dictionaries and temporary artifacts are excluded.

## Delivered

Quiz & Tests offers Hiragana/Katakana/Kanji, category/row/difficulty/length selection, Practice, Test, optional Continuous Practice and separate Focus on mistakes. Sessions show one question and exactly four independently shuffled options. The server shuffles the eligible pool without replacement. After exhaustion, continuous practice shuffles mistakes first, prevents an immediate repeat and explains the revisit. Refresh restores frozen questions/options, checked responses, score, current question and cycle. Finish saves a summary and progress once. Active tests conceal keys and scores until finish. See `PRACTICE-SESSIONS.md` for edge cases and credit semantics.

Lessons follow explanation → worked example → guided exercises → independent quiz → targeted corrections → scheduled review. Guided pools/hints/skips remain separate from independent credit. The rebuilt reference includes charts, search, filters, detailed kana/kanji, contextual words, grammar and connected bookmark/quiz/stroke actions. Daily MCQ sessions use introduced material, weak concepts, due MCQ IDs and study time; next lessons respect prerequisites.

| Available content | Count |
| --- | ---: |
| Versioned lessons | 39 |
| Independent lesson assessments | 124 |
| Separate guided exercises | 131 |
| Targeted corrections | 96 |
| Four-choice MCQs | 547 |
| Kana reference entries per script | 104 |
| Complete starter kanji | 32 |
| Deduplicated study vocabulary | 278 |
| Reliable ordered stroke models | 124 |
| Formative typing prompts | 124 |
| Original passages / beginner-plan days | 3 / 30 |

Exact scope: `curriculum-inventory.json`, `CONTENT.md`. Intermediate/advanced content remains usable samples; complete JLPT coverage and educator review are not claimed.

## Executed evidence

- **59 automated tests passed, zero failed/skipped.** TypeScript, ESLint and production build passed. Output: `quality-check.log`.
- Compiled production smoke passed on fresh disposable file-backed SQLite: migration/seed, built assets, readiness, API 404, public keys omitted, QA fixtures excluded, favicon SVG/PNG/ICO/apple image MIME types. Report: `production-smoke.json`.
- `npm audit`: **zero known vulnerabilities**, including development dependencies; report in `dependency-audit.json`. This is not a security certification.
- **252 successful screen/width/theme checks**: six widths 320–1920, both themes; core 96, lessons 72, upgrade 48, saved-session/reference 36. Zero horizontal overflow, automated tagged WCAG violations or accidental quiz utility submits. The normal rate limiter stopped core after 90; the remaining 6 checks passed later. Error frames were never counted. See `browser-verification.json` and `TEST-CHECKLIST.md`.
- Browser journeys verified continuous exhaustion/mistake priority, changed answer positions, draft and checked-answer refresh, Finish/skips/summary, focused retry, contextual kanji search/bookmark/quiz, keyboard answers, concealed katakana test feedback until finish, progressive guided hints, deliberate skips, katakana typing beyond あ and mobile token/clear controls.
- All 32 listed kanji reading sets and stroke counts matched official KANJIDIC2 fields. Provenance records 124 source stroke hashes. This does not certify sentences or pedagogy.

## Subsequent GitHub Actions evidence — verified 6 November 2026

[Run 41233623757](https://github.com/Sido-dev/J-learn/actions/runs/41233623757), run number 2, completed **successfully** at `2026-10-31T19:21:21Z` for `main` commit `00dc38844516dd468df07f0c33906975e7382620`. API job-step metadata confirms:

| Check | Recorded result |
|---|---|
| `npm run check` | Success |
| `npm run smoke` | Success |
| PostgreSQL integration suite on the disposable CI service | Success |
| `npm audit --omit=dev --audit-level=moderate` | Success |
| Container build | Success |

The audit step checks production dependencies at the configured threshold; its success is not a new all-dependency vulnerability count. The 59-test count and browser measurements above remain historical handover evidence, not newly inferred output from the Actions metadata. The workflow file is retained. Machine-readable evidence: `CI-EVIDENCE.json`.

CI builds/integration tests do not verify a public HTTPS service, a managed-database migration/restore, rollback, real user acceptance or current live infrastructure. Those require the operations register below and must not be marked complete solely from CI success.

## Measurements

Frontend: 337.22 kB JavaScript (104.49 kB gzip), 49.43 kB CSS (10.39 kB gzip). No external image/font request is needed; development QA is excluded. See `build-assets.json`.

Limited loopback measurement: 50 sequential requests/route, Node 24, fresh in-memory SQLite. Health median 1.77 ms / p95 13.79 ms; state median 1.86 ms / p95 4.14 ms. `performance.json` records parameters. This excludes realistic history/load, browser rendering, internet and TLS; no production throughput or Lighthouse claim is made.

## Safety and upgrade

Migration 002 adds durable completion, guided/session/item/activity tables and backfills old completions without removing accounts/history. Tests prove old-schema upgrade, file restart, completion beyond 500 recent attempts, export/cascades, immutable snapshots and suspended SQLite transaction isolation. Run migration/seed on every release, including content-only changes. Old attempts and frozen sessions remain traceable; lesson drafts are version-scoped.

Existing scoped authorization, CSRF/exact-origin protection, parameterized queries, validated bounded bodies, secure cookies/headers, rate limits, private export and deletion remain. Continuous summaries use bounded detail; full export retains all occurrences. The subsequent CI run passed the PostgreSQL integration suite for the cited commit. Row/migration-lock behavior is credited only to the checks actually covered by that suite; independent live-host migration/restore checks remain pending.

Live PostgreSQL/Compose/TLS staging, email recovery, educator/native review and human accessibility/device checks remain before public enrollment. The original local handover could not run Docker/PostgreSQL. The later cited CI run did execute PostgreSQL integration and the container build successfully. Live hosting/TLS, backup/restore and rollback were not verified by this documentation patch. Native audio, automated pronunciation/handwriting/grammar assessment, offline sync and full JLPT sequences remain future work. Guest access depends on its browser cookie. See `OPERATIONS.md` and the prioritized `BACKLOG.md`. This handover is not a production or WCAG certification.

The 1.1.1 independent recheck, reproduced/fixed topic-distractor issue, three new tests and repeated browser evidence are documented in `IMPLEMENTATION-RECHECK.md`.
