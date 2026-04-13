---
name: sign-off
description: User sign-off on the current task — approve to mark done, or request changes to send back to the Builder.
---

# Sign-off

Use when the user is ready to **approve** or **request changes** after build, reviews, and QA (see **execute-task** Step 5).

**CLI:** Resolve per `trigger-core.mdc` — bundled at `<plugin-root>/scripts/trigger-cli/`.

## Pre-conditions

1. Read **`.trigger/state.json`** (and confirm `m` / `p` / `t` with `trigger state get` if needed) for the active task and its `status`.
2. If status is not **`signoff`**, stop and explain. Valid pipeline path: `planned` → `building` → `built` → `reviewing` → `review_passed` → `qa_passed` → `signoff`. The task must have passed through QA (`qa_passed`) before reaching sign-off.
3. Verify these artifacts exist before presenting the summary:
   - `BUILDER-REPORT.md` in the task directory
   - `reviews/review-summary.json`
   - `reviews/qa-verification.md`
   If any are missing, stop and explain which artifact is missing and how to create it (re-run the appropriate execute-task step).

## Sign-off procedure

4. Present a summary to the user:
   - What was built (from `BUILDER-REPORT.md`)
   - Review verdicts and key findings (from `reviews/review-summary.json`)
   - QA verification results (from `reviews/qa-verification.md`)
   - Known risks or limitations
5. **Always wait for explicit user input.** This applies to ALL trust levels (`supervised`, `balanced`, `autonomous`). Sign-off is never auto-approved.
6. User chooses:
   - **Approve:** `trigger task advance <m> <p> <t> done` — task complete.
   - **Request changes:** `trigger task advance <m> <p> <t> changes_requested` — capture what to fix, then resume **execute-task** from **Step 2** (Builder).
7. After **done**, check whether more tasks remain in the phase; suggest **progress**, **execute-task** for the next task, or **execute-phase** as appropriate.
