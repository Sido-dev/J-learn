# Implementation recheck — Sumi 1.1.1

Checked 30 October 2026 (India time). This review began from the saved 1.1.0 ZIP, not just the development folder. The archive SHA-256 was `444d496fb7dc8bbd8cf1efecdd579fe76f3802bd3bfc42e5aa66cf5ba2b1380a`; all 110 manifest entries matched their contents, and the extracted files matched the workspace. The original 56 tests, typecheck, lint and build passed from the extraction.

## Issue found and fixed

Kanji topic questions could use distractors from outside the chosen topic even when that topic had at least four suitable choices. A new regression test reproduced a Nature fire question with “one / two / three” distractors. That test failed before the fix.

New sessions now select comparison options from the eligible material, keeping meaning, contextual reading, vocabulary and kana tasks distinct. Small pools retain safe comparison fallbacks. Accepted equivalent answers are excluded, four distinct choices remain, and the options are still independently shuffled. Previously saved sessions retain their original question/option snapshots. No schema or seeded content version changed.

The regression test passed after the fix. Additional tests check scoped choices across the full 547-question bank and tiny pools, and two complete continuous rounds for each of Hiragana, Katakana and Kanji. Those rounds verify no duplicate in a cycle, no immediate repeat at the boundary, exact saved state, response recovery, and once-only first-pass progress.

## Requirement results

| Requirement | Result and evidence |
| --- | --- |
| One MCQ, four distinct options | Pass: full-bank/scoped-choice tests and live browser |
| Random question order and independent option shuffle | Pass: randomization tests; changed answer positions in browser |
| No repeat before pool exhaustion | Pass: two rounds across all three scripts; live Hiragana pool |
| Mistakes prioritized after exhaustion with explanation | Pass: first browser cycle was や → よ → ゆ; missed や appeared first in round two with the revisit notice |
| No immediate cycle-boundary repeat | Pass: live ゆ → や; controlled/randomized and three-script tests |
| Feedback, Next Question, Finish Practice | Pass: live incorrect/correct feedback, Next, and Finish summary |
| Separate Focus on mistakes | Pass: separate one-question retry, shortened-pool notice, correct response and saved 100% summary |
| Refresh exact question/option/selection/answer/score state | Pass: live kanji draft/option equality, continuous round-two checked-state equality, and session/database-restart tests |
| Finish saves progress and summary once | Pass: idempotency tests; live 75% summary (3 correct / 4 answered) restored after reload |
| Old paused session survives the patch | Pass: original ろ session resumed with A ra / B ri / C ro / D ru, C selected and 1 correct / 1 checked |
| Test answers and score remain hidden until finish | Pass: Katakana Handakuten live test retained neutral feedback and hidden score across refresh; Finish revealed the expected ポ = po |
| Selected topic distractors | Pass after correction: live Nature 森 question used fire / mountain / forest / river |
| Privacy, stale actions, retries and safe migrations | Pass in retained API/database tests |

## Executed checks and limits

- Final `npm run check`: **59 passed, 0 failed, 0 skipped**; typecheck, ESLint and production build passed. Actual output: `quality-check.log`.
- Final compiled production smoke passed, including migration/seed, readiness, assets, favicon MIME types, hidden answer keys and excluded development QA. Output: `production-smoke.json`.
- Repeated saved-session/accessibility suite: **36 passing checks**, active session, summary and vocabulary at 320, 375, 768, 1024, 1440 and 1920 pixels, both themes. Zero non-app/error passes, overflow, tagged axe violations or accidental utility submits. These are a repeat of the saved-session portion of the earlier 252-check report; no claim that all 252 were rerun for this patch.
- No dependency changed; the earlier zero-advisory audit remains included. Client JS/CSS asset hashes are unchanged by this server-only correction.

The app is still unpublished. Live PostgreSQL/Compose/TLS deployment, educator/native-speaker review, real-device accessibility and successful physical microphone recording remain unverified as previously documented. This review establishes the requested practice behavior under the tested local SQLite/browser setup; it is not a production or WCAG certification.
