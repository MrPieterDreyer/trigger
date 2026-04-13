---
name: resume
description: Resume work on a Trigger project — restore context, show where you left off, and continue.
---

# Resume

When the user says **trigger resume**, **continue work**, or **pick up where I left off**:

1. Read `.trigger/state.json` — active milestone, phase, task.
2. Read the active task’s `task.json` — `status`, acceptance criteria, artifact paths.
3. Read `.trigger/trigger.json` — trust level, verification commands, team defaults.
4. Summarize: what was in progress, current status, and the immediate next step.
5. By `status`: **planned** → offer to start building (follow execute-task skill). **building** / **build_failed** → offer to resume build. **reviewing** / **changes_requested** → summarize review outputs; offer to continue. **signoff** → present work for user review (G5). **done** → offer next task or next phase (plan/execute).
6. Ask: *Continue where you left off, or do something else?*

Resolve the active task directory from `state.json` under `.trigger/milestones/…/phases/…/tasks/…` (or the layout your project uses).
