# Requirement-to-test checklist

Executed 30 October 2026 for 1.1.1. `npm run check`:59 tests passed, 0 failed/skipped; typecheck/lint/build passed. Actual output: `quality-check.log`. Tests use disposable databases.

| Requirement | Executed evidence |
| --- | --- |
| Four choices, one correct, no equivalent distractor | Entire 547-item bank integrity; deterministic position/shuffle tests |
| Script/category/rows/difficulty/learned/weak/bookmarks | Bank/filter and API tests |
| Contextual readings and complete references | Prompt tests;32 complete kanji, 104 kana examples/script, 124 stroke-model checks |
| Distinct guided/assessed/correction pools | Content tests; assisted, skipped and placement work never award mastery |
| Precise corrections and meaningful spelling distinctions | Existing sound-confusion, vowel/consonant and normalization tests; search-only aliases separated from grading |
| Unique first pass, exhausted continuous cycle, mistake priority | Controlled random tests, no immediate repeat, finite shortening/one-item continuous rejection |
| Refresh and database restart | Exact question/options/answer/score comparison; close/reopen real file database |
| Idempotency and multitab behavior | Start/answer/Next/Finish retries; conflicting payload/stale revision rejected |
| Hidden tests and honest finish | Active GET/list/state/export redaction; early finish/skips/not-reached; once-only first-pass recognition credit |
| Private sessions and export | Cross-user GET/answer/finish/export access denied; full occurrence export and account cascades |
| Durable completion and retired content |501 newer attempts; archived review API and immutable snapshots |
| SQLite isolation and old-schema upgrade | Unrelated reads wait behind suspended transaction; schema 1 migration preserves account/history and backfills completion |
| Learn/bookmark/typing | Introduced-only reference action, bookmark pool, spelling beyond あ |
| Existing authentication/security | Original tests retained for accounts/sessions/passwords/CSRF/scope/validation/limits/cookies/headers |
| Runtime and favicon | Compiled smoke: actual assets/file seed/readiness/404/privacy/QA exclusion; SVG/PNG/ICO/apple MIME checks |
| Quality and dependencies | TypeScript, ESLint, tests/build and audit passed; zero known advisories |

## Browser journeys

- Hiragana Y-row Continuous:3 distinct first-pass questions; independently changing answer positions; incorrect/correct feedback and Next. The new round prioritized a mistake, explained revisiting and avoided the previous last character. Refresh retained draft choice, option order, checked responses, score and round. Finish saved a summary and one unsubmitted current item as skipped.
- Separate Focus on mistakes: shortened one-question pool, shuffled options, correct response and 100% saved summary.
- Kanji: search “mountain” →山 detail/on/kun/strokes/words/sentence/sources →Learn-introduced/bookmark →contextual reading quiz. Keyboard Space/Enter submitted やま; summary survived reload.
- Katakana/Dakuten/Test: saved wrong response showed neutral Answer saved and hidden score across refresh. Next showed a distinct character. Finish after two answers revealed1 correct / 2 answered / 3 not reached with exact answer details.
- Guided hiragana: example/navigation, reverse-recognition exercise, two progressively useful hints, wrong-answer teaching and recorded deliberate skips into a separate independent typed pool.
- Katakana spelling: so prompt accepted ソ with formative feedback. Mobile sentence token and Clear sentence, activated by keyboard, left the quiz unsubmitted.

## Responsive/accessibility evidence

Development `/qa.html` runs axe WCAG 2 A/AA, 2.1 AA, 2.2 AA tags on actual app frames, disables motion for stable colors and rejects error/non-app screens. Saved-session suites use IDs from disposable browser journals.

| Suite | Views | Widths ×themes | Completed |
| --- | ---: | ---: | ---: |
| Core |8|6×2|96|
| Guided/independent lessons |6|6×2|72|
| Quiz setup/kanji/grammar |4|6×2|48|
| Active session/summary/vocabulary |3|6×2|36|
| Total |21||252|

Widths 320, 375, 768, 1024, 1440, 1920; height 900 CSS pixels. Zero horizontal overflow, tagged automated violations or accidental quiz utility-submit buttons. Core reached the real API limit after 90; reference/progress/settings at 1920 were successfully rerun in both themes (6 checks). No security setting was weakened; no error page counted. Summary: `browser-verification.json`.

Unexecuted human checks: NVDA/VoiceOver, real phone soft keyboards/touch/stylus, native 200–400% zoom, landscape heights, successful physical microphone capture over HTTPS, OS reduced-motion and other engines. Automated findings are not a WCAG certification. Live PostgreSQL, Docker/Compose, external CI and deployment/restore remain unexecuted here.

The 1.1.1 independent recheck, reproduced/fixed topic-distractor issue, three new tests and repeated browser evidence are documented in `IMPLEMENTATION-RECHECK.md`.
