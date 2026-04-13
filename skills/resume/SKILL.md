---
name: resume
description: Resume work — restore context from STATE.md and trigger summary, show where you left off, continue.
---

# Resume

When the user says **trigger resume**, **continue work**, or **pick up where I left off**:

1. Read `.trigger/STATE.md` — human-readable snapshot for quick orientation.
2. Run `trigger summary` — machine state with active milestone/phase/task/status.
3. Read active task's `task.json` for acceptance criteria and status.
4. Read `PROJECT.md` for project context (goals, tech stack).
5. If `PAUSE-CONTEXT.md` exists in active task dir, read it for session context.
6. Summarize: what was in progress, current status, next step.
7. By status: `planned` → build. `building`/`build_failed` → resume build. `reviewing`/`changes_requested` → continue reviews. `signoff` → present for G5. `done` → next task/phase.
8. Update `STATE.md` — clear paused status, set active, update timestamp.
9. Ask: *Continue where you left off, or do something else?*
