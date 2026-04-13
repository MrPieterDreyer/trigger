---
name: pause
description: Save current progress, update STATE.md, and create a resumption context so the next session can pick up seamlessly.
---

# Pause

When the user says **trigger pause**, **save progress**, or **stopping for now**:

1. Read `.trigger/state.json` for active milestone, phase, and task.
2. Run `trigger state set paused_at <ISO-8601-timestamp>` (UTC).
3. In the **active task directory**, write `PAUSE-CONTEXT.md`: what was being worked on; current status; what was completed; what remains; pending decisions or blockers.
4. **Update STATE.md** — Update `.trigger/STATE.md` with:
   - **Current status:** Paused
   - **Paused at:** timestamp
   - **In progress:** what task/phase was active and its status
   - **Completed so far:** summary of done tasks/phases
   - **Remaining:** what's left to do
   - **Blockers/decisions:** any open items noted in PAUSE-CONTEXT.md
   - **Resume instructions:** "Say `trigger resume` to continue"
5. Confirm: *Progress saved. Say `trigger resume` in your next session to pick up.*

Do not clear active milestone/phase/task pointers unless the user explicitly wants to abandon the current unit of work.
