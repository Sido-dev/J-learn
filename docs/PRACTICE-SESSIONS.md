# Practice sessions

Choose Quiz & Tests, a script, a category and Start session. The optional controls select rows, difficulty, length and mode. A question is the stable bank ID, rather than a particular arrangement of its choices.

| Mode | Feedback | End condition |
| --- | --- | --- |
| Practice | After each checked answer | Selected length, shortened to the eligible pool |
| Test | Answers and score hidden until Finish Test | Selected length, or finish early |
| Continuous Practice | After each checked answer | Learner selects Finish Practice |
| Focus on mistakes | Immediate; separate filtered practice | Selected length, shortened to eligible mistakes |

The server filters by script/category/rows/difficulty and, when requested, learned material, bookmarks or mistakes. It uses cryptographic Fisher–Yates shuffling for question selection and each four-option list independently. Accepted alternate spellings never become distractors. Comparison choices prefer the eligible material and the same task family (meaning, contextual reading, vocabulary, or kana recognition). For a tiny selected category, safe fallback choices may use other material in the selected script; the eligible question pool stays restricted. Previously saved option lists stay unchanged. Continuous mode requires at least two eligible questions, since a one-question pool cannot avoid an immediate repeat.

Each pool item appears once before exhaustion. On the next continuous round, current-session mistakes (including deliberate skips) are shuffled first, followed by the rest. Every eligible question still appears once in that round. The first item cannot equal the previous round's last item when at least two items exist. A visible notice explains that previously seen material is being revisited. This rule applies within a saved session; starting a separate session creates a fresh shuffled pool.

The session stores a frozen eligible pool and version, complete planned first-round order, each occurrence's option order/opaque option IDs, immutable checked responses, cursor, cycle, revision and summary. Reload uses these records, never regenerates the current session, and does not regrade against a changed bank. An unsubmitted radio selection is also restored in the same tab when session storage is available. Guest access requires its existing browser cookie; signed-in accounts can resume their own saved sessions on other devices. This is server persistence, not offline sync.

Duplicate start IDs, identical answer retries, Next retries and Finish retries are idempotent. Conflicting answers and stale revisions reject. A response cannot change after checking. Access is always scoped to the authenticated user; client-supplied scores are never accepted. Active test endpoints, the session list, state and exports omit correctness/answer keys. Full export preserves every occurrence, including long continuous sessions, while the on-screen summary shows at most the first 100 result details.

Finish Practice commits progress exactly once. Only the first occurrence of each question in a session earns independent recognition credit; repeated rounds reinforce learning without multiplying that credit. Recognition and typed recall have separate progress keys. Daily spacing uses the finish timestamp. The finish summary counts a displayed unanswered item as skipped, and leaves unseen future questions out of mistakes. Accuracy includes skipped items in its denominator. Leaving the page pauses; it does not finish or discard a session.

Guided exercises, hints, revealed study examples, reference Learn actions, typing checks, drawing, and navigation do not award independent mastery. Learn marks a concept introduced. A checked independent assessment marks it practised; repeated successful independent work on separate days is required for mastery. A new mistake reopens review. Daily MCQ sessions use the chosen script's introduced pool, requested study minutes, due MCQ IDs and weak concepts. They complement the separate due-review queue and prerequisite-aware next-lesson recommendation.

All active sessions stay in the database; the Resume list shows the latest 40 records, and at most eight can be active concurrently. A saved session URL can still open an older owned record. There is no expiration/deletion of learning sessions in this release apart from account deletion.
