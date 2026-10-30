# Sumi — a little Japanese, every day

A working Japanese learning journal, built with React 19, TypeScript, Vite, Express 5, Zod, and PostgreSQL support. A file-backed SQLite database makes the local demo self-contained. There are no API keys, paid integrations, or trackers. Reliable stroke models are attributed to KanjiVG; reference sources and licences are bundled.

**Release status:** functional, tested application with deployment preparation. **Not certified production-ready.** Read `docs/RELEASE-REPORT.md` for evidence and release blockers. Full N5–N1 content coverage, expert linguistic review, live PostgreSQL/container validation, and native audio are not claimed.

## Run locally

Install Node.js 24 LTS, open a terminal in this folder, and run:

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. Choose **Begin my journal**. Progress persists in `.data/sumi.sqlite`. Use **Settings & privacy → Keep my guest progress in an account** to attach email/password sign-in to the same records. There is no pre-created user or default password. Never serve development mode on the public internet.

The app accepts `PORT` or a `--port` argument. Standard browser Japanese speech voices are optional. Microphone recording requires a secure origin (HTTPS or localhost), permission, and MediaRecorder support; text practice remains available without it.

## Verify

```sh
npm run check
npm audit
```

`check` runs type checking, ESLint, 59 unit/integration tests, and a production build. Tests use disposable in-memory and file-backed SQLite databases and controlled clocks. To repeat the integration tests against an **empty disposable PostgreSQL test database**, set both `TEST_DATABASE_URL` and `DATABASE_URL`, then run `npm test`. Never point test credentials at a production database. A PostgreSQL CI service is configured, but that CI workflow has not run in this workspace.

Run `npm run smoke` after building to verify the compiled production server against a disposable SQLite file, or `npm run benchmark` for explicitly limited loopback measurements.

For development-only browser verification, open `/qa.html` and select **Run responsive and accessibility checks**. Its selectable suites check core screens, guided/independent lessons, quiz setup, reference details, active sessions, and summaries at 320, 375, 768, 1024, 1440, and 1920 CSS pixels in both themes. Saved-session checks use IDs from your disposable demo journal. It disables motion during scans to measure stable colors and checks that an actual application screen loaded. This harness is excluded from production output. See `docs/TEST-CHECKLIST.md` for manual checks and boundaries.

## Included

- A personal dashboard; six-stage curriculum path; all 46 basic hiragana and katakana; focused modifiers, timing, and particle lessons; introductory kanji and grammar; intermediate and advanced samples.
- Every lesson uses explanation → worked example → guided exercises → independent quiz → targeted corrections → scheduled review. Guided, assessed, and correction pools are separate; hints and deliberate skips never award mastery.
- Multiple choice, typed readings, matching, fill-in, ordering, synthetic-audio recall, and unscored handwriting practice.
- **Quiz & Tests:** Hiragana, Katakana, or Kanji; categories/rows/difficulty; finite Practice, hidden-feedback Test, Continuous Practice, and separate Focus on mistakes. All four choices shuffle independently. Server-owned sessions survive refresh exactly. Continuous practice exhausts the pool before repeating, prioritizes mistakes in later rounds, explains the revisit, and avoids an immediate repeat. Finish Practice saves a summary and progress once.
- A searchable reference with 104 kana entries per script, 32 complete starter kanji, 278 vocabulary entries, grammar/rules, bookmarks, and contextual quiz links.
- Private accounts/guest sessions, deterministic spaced repetition, mistake notebook, vocabulary/story bookmarks, separate skill progress, optional study streaks, and a 30-day beginner plan.
- Three original passages with vocabulary help and separate decoding/comprehension checks; a writing studio with 124 sourced ordered stroke models, pointer drawing, 124 formative typing prompts, and private journals; audio dialogue/dictation and microphone playback.
- Account export/deletion, opt-in microphone, browser-only recordings, light/dark themes, semantic controls, keyboard focus, and reduced-motion support.
- A single backend with explicit transactions, immutable content snapshots, server-side grading, idempotency keys, scoped queries, validation, CSRF defenses, secure production cookies/headers, and rate limits.

## Structure

| Folder | Responsibility |
| --- | --- |
| `src/` | React UI and development-only QA harness |
| `shared/` | Versioned curriculum, guided exercises, kanji/kana reference, search and learning types |
| `server/practice/` | Eligible pools, secure randomization, durable sessions, answer grading and routes |
| `src/practice/` | Setup, single-question player, guided practice, review and typing |
| `shared/learning.ts` | Pure normalization, grading, mastery, scheduling, and time-zone functions |
| `server/app.ts` | Validated API, authentication, authorization, and learning transactions |
| `server/db.ts` | Parameterized SQLite/PostgreSQL adapter, transactions, and safe content seed |
| `migrations/` | Additive relational schema |
| `tests/` | Deterministic unit/API integration tests |
| `docs/` | Audit, evidence, curriculum workflow, demo, and operational handover |

## Production build

```sh
npm run build
```

Produces `dist/client/`, `dist/server.js`, and `dist/migrate.js`. Configure a real `DATABASE_URL` and exact HTTPS `APP_ORIGIN`, run `node dist/migrate.js`, then start with `NODE_ENV=production node dist/server.js`. Run the migration/seed on **every release**, including content-only changes. Migration 002 adds sessions/guided records/durable completions and backfills existing progress without deleting history. Content is immutable by ID/version. Migrations are not automatically run in production unless explicitly enabled. See `.env.example`, `Dockerfile`, `compose.yaml`, and `docs/OPERATIONS.md`.

Source code and build output are included in the handover archive. Dependencies and local test-user data are excluded. The application has not been published externally.

Release 1.1.1 / content 2026.10.2. See `CHANGELOG.md`, `docs/PRACTICE-SESSIONS.md`, `docs/CONTENT-SOURCES.md`, and `docs/BACKLOG.md`. Use `npm run inventory` to regenerate the checked content inventory.

The saved package was independently rechecked and patched to 1.1.1. See `docs/IMPLEMENTATION-RECHECK.md` for the issue found, correction and executed evidence.
