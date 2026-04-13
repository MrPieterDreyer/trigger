---
name: progress
description: Show project progress and regenerate STATE.md. Uses trigger summary for compact context loading.
---

# Progress

When the user says **trigger status**, **trigger progress**, **where am I**, or **what's next**:

1. Run `trigger summary` — returns a compact JSON dashboard with active milestone/phase/task, statuses, parallelism settings, and trust level. This replaces reading multiple JSON files individually.
2. If more detail is needed (e.g. recent reviews), read the active task's `reviews/*.md` for the last 2-3 verdicts and key findings.
3. **Dashboard:** Milestone (X/Y phases). Phase (X/Y tasks). Task (name + status). Pipeline stage. Recent reviews if any.
4. Suggest next action based on state.
5. **Regenerate STATE.md** — Overwrite `.trigger/STATE.md` with a full snapshot:
   - Current status, active milestone/phase/task
   - Phase summary table (all phases with status)
   - Recent activity and next step
   - Last updated timestamp
