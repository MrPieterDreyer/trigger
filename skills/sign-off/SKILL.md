---
name: sign-off
description: User sign-off on the current task — approve to mark done, or request changes to send back to the Builder.
---

# Sign-off

Use when the user is ready to **approve** or **request changes** after build, reviews, and QA (see **execute-task** Step 5).

**CLI:** Resolve per `trigger-core.mdc` — bundled at `<plugin-root>/scripts/trigger-cli/`.

1. Read **`.planning/state.json`** (and confirm `m` / `p` / `t` with `trigger state get` if needed) for the active task and its `status`.
2. If status is not **`signoff`**, stop: explain the current status and what must happen first (e.g. complete Builder, Step 3 reviews, or Step 4 QA via **execute-task**).
3. Present a short summary: what was built (**`BUILDER-REPORT.md`** in the task dir), review verdicts (**`reviews/`**, including **`review-summary.json`** if present), QA (**`reviews/qa-verification.md`**), and known risks or limits called out in those files.
4. Ask the user to choose:
   - **Approve:** `trigger task advance <m> <p> <t> done` — task complete.
   - **Request changes:** `trigger task advance <m> <p> <t> changes_requested` — capture what to fix, then resume **execute-task** from **Step 2** (Builder).
5. After **done**, check whether more tasks remain in the phase; suggest **progress**, **execute-task** for the next task, or **execute-phase** as appropriate.
