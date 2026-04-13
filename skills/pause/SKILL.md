---
name: pause
description: Save current progress and create a resumption context so the next session can pick up seamlessly.
---

# Pause

When the user says **trigger pause**, **save progress**, or **stopping for now**:

1. Read `.trigger/state.json` for active milestone, phase, and task.
2. Run `trigger state set paused_at <ISO-8601-timestamp>` (UTC).
3. In the **active task directory**, write `PAUSE-CONTEXT.md`: what was being worked on; current status; what was completed; what remains; pending decisions or blockers.
4. Confirm: *Progress saved. Say `trigger resume` in your next session to pick up.*

Do not clear active milestone/phase/task pointers unless the user explicitly wants to abandon the current unit of work.
