# Architecture and second audit

## Decisions and assumptions

This 1.1 upgrade retains the supplied Sumi application architecture, accounts and progress. It remains a local development deliverable with a server-backed journal. External publishing was explicitly held for later authorization. English-speaking adult learners are the design baseline; no claims of child-specific compliance are made.

React/Vite separates the interface from an Express JSON API. A monolith keeps authentication, content, and learning transactions in one service. PostgreSQL is the deployment target; Node 24 SQLite provides a reproducible local demonstration without an external database. SQL is parameterized and shared where portable. PostgreSQL uses a bounded pool and same-user row locks; SQLite serializes transactions. No microservices, AI provider, cloud audio storage, or unnecessary upload endpoint is included.

Content, questions, evaluations, and schedules have explicit types. Public lesson serialization removes answer arrays, sound-unit solutions, and feedback keys. Guided feedback is returned after its attempt; independent answers appear only after submission. Historical attempts retain their grading result and refer to immutable lesson/exercise snapshots. Content changes must bump versions.

## Initial risks addressed

| Risk | Implemented control |
| --- | --- |
| Client-controlled grading or exposing answer arrays | Server-only content/answer evaluation; public serializer tested |
| Repeated requests awarding duplicate progress | UUID + per-user unique key; payload hash conflicts reject; atomic attempt/progress/review transaction |
| Concurrent PostgreSQL submissions | Same-user row lock inside transaction; unique database constraint as a final boundary |
| Cross-user access to learning data | User is resolved from a hashed opaque session; every private query is scoped by server-derived user ID |
| Guessable sessions or passwords at rest | Random 256-bit session token; only SHA-256 digest in DB; salted scrypt N=131072/r=8/p=1; constant-time comparison; at most two concurrent hashes |
| CSRF and login CSRF | Same-site JSON/header boundary, exact Origin check, per-session CSRF token, SameSite=Strict cookie |
| XSS, injection, file abuse | React text rendering, parameterized queries, strict schemas, body/field/stroke limits, no raw HTML or audio upload support |
| Expensive/burst traffic | API and auth rate limits, password-hash concurrency cap, SQL and HTTP timeouts |
| Accidental insecure production settings | Exact HTTPS APP_ORIGIN required; Secure/HttpOnly cookies; CSP/HSTS/Helmet; PostgreSQL required unless SQLite explicitly approved in configuration |
| Session expiration and offline loss | Expired-session sign-in prompt; per-user tab drafts; safe idempotent retries; no background retry loops |
| Treating recognition as mastery | Distinct introduced/practised/mastered states; separate skills; multiple days and accuracy threshold |
| Overclaiming audio, writing, curriculum | Synthetic-device label, voice-unavailable fallback, unscored self-practice, planned expansion explicitly listed |
| Microphone privacy | Explicit record button; max 60 seconds; no upload; memory URL revoked and tracks stopped; complete cleanup on leaving screen |
| Account-data retention | Export, cascade delete, logout, per-user drafts cleared on logout/deletion; operational backup-retention requirement documented |

## Second audit findings fixed

Browser testing exposed `crypto.randomUUID` missing on the HTTP preview origin. The client now uses cryptographic `getRandomValues` UUID v4 fallback, with a regression test. A pointer-event closure could retain a null completed stroke; completed points are now captured before the state update. Recorder cleanup now prevents an after-unmount object URL. Writing drafts are scoped to the user, and expired sessions open sign-in. Dark/light contrast findings were corrected. QA now checks that it loaded the actual app, avoiding false success on rate-limit/error screens. Startup requests are deduplicated under React development StrictMode. Sound timing lessons were split into smaller teaching units; furigana is grouped per word to wrap on narrow screens.

## Remaining security/operations boundaries

The in-process limiter fits a **single application instance**. Multiple instances require a shared limiter or upstream equivalent before scaling. Trusted proxy hop count must match the deployment; never blindly trust forwarded headers. PostgreSQL TLS policy and database roles are deployment concerns; do not disable certificate verification. Use encrypted disks/backups and platform log access controls. No email verification or recovery provider is configured. Password reset and account recovery need an authenticated, expiring-token design before public enrollment. No live penetration test or public deployment has occurred. npm audit is a known-advisory check, not proof of absence of vulnerabilities.

Structured error events contain a request ID, level, and event name; they omit passwords, email addresses, answers, recordings, and database error text. A hosting log collector can consume these events. No third-party error-tracking credential is required. Health and readiness are separate. Non-production Vite websocket warnings in the remote preview do not affect the production build.

## Upgrade audit — 1.1

The new practice backend separates bank filtering, cryptographic shuffle, frozen SQL sessions and validated routes. UI modules separate reference, guided exercises, independent lessons, MCQ player, review and typing. Native radio/button semantics support keyboard operation; all quiz utility buttons explicitly use type=button. Generic matching renders content-owned label/options.

SQLite now serializes every read/write through the same exclusive queue, including transactions with raw internal connections, so unrelated reads cannot enter an open transaction. PostgreSQL retains per-user row locks and adds a migration advisory lock. Immutable seeded snapshots reject silent edits without a version bump.

Durable completions no longer depend on the 500-row recent history; migration backfills from all attempts. Archived reviews produce an explicit safe state. Sessions freeze pool/question versions and every option order; answer/Next revisions prevent duplicate advance. Finish commits first-occurrence recognition once, distinct from typed recall; continuous repeats are reinforcement. Active tests redact keys/correctness/score from every public session/state/export route. Summary detail is bounded at 100; full export preserves occurrences.

Reference Learn is introduction only; guided hints/skips, spelling and demonstrations cannot award independent mastery. Lesson/bank versions3/2 retain historical records. Additive schema 2, old-schema preservation, cross-user privacy, transaction isolation and session restart are tested. See PRACTICE-SESSIONS.md and TEST-CHECKLIST.md for precise assumptions and evidence.
