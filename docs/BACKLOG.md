# Prioritized upgrade backlog

The 1.1.0 changes in `CHANGELOG.md` are implemented. Items below remain future work; they are not working features disguised as lessons or controls.

| Priority | Work | Completion evidence needed |
| --- | --- | --- |
| Before public enrollment | Educator/native-speaker review of examples, kanji contexts, distractors and lesson progression | Recorded corrections, reviewer identity/permission and versioned sign-off |
| Before public enrollment | Live PostgreSQL/Compose migration, concurrent sessions, backup/restore, TLS/proxy staging | Executed CI/staging reports, restore drill, preserved old learner records |
| Before public enrollment | Verified email and secure account recovery; audience-specific privacy/retention policy | End-to-end provider tests, expiring tokens and documented retention/deletion |
| Before public enrollment | Human accessibility and real-device QA | NVDA/VoiceOver, touch/stylus, soft keyboards, zoom, landscape and multiple engines |
| Next | Larger graduated kana/kanji/vocabulary course with spaced prerequisite assessments | Reviewed finite content milestones; honest available/planned labels |
| Next | Better long-session analysis and history pagination | Bounded query/load measurements with large real-shaped datasets; full export preserved |
| Next | Mapping typed-lesson due concepts to richer cross-skill daily sessions | No mixed recognition/recall mastery credit; controlled-clock scheduling tests |
| Next | Expanded kana modifiers/combined-shape stroke support and model comparison | Licensed reliable paths plus visual verification; no unsupported scoring claims |
| Later | Native-speaker recordings and contextual pitch-accent examples | Permissions/licences, transcripts and device fallback checks |
| Later | Optional installable/offline course and conflict-safe synchronization | Explicit offline storage policy, encryption/expiry and reconnect/conflict tests |
| Later | Reviewed pronunciation, handwriting and grammar assessment | Validated rubrics and error behavior; clear uncertainty, consent and privacy |
| Before multi-instance scale | Shared rate limits, operational telemetry, least-privilege roles and load tests | Live enforcement/alerting, no sensitive learner data in logs |

No AI tutor, paid API, external publishing, or remote learner data upload was added by this upgrade.
