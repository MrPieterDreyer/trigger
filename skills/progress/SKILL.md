---
name: progress
description: Show project progress — milestone status, phase completion, current task, review verdicts, and what's next.
---

# Progress

When the user says **trigger status**, **trigger progress**, **where am I**, or **what's next**:

1. Read `.trigger/state.json` (use `trigger state get`) — active milestone, phase, task, pipeline stage if recorded.
2. Read the active milestone’s `milestone.json` under `.trigger/milestones/<id>/` for overall milestone progress.
3. Read each relevant phase’s `phase.json`; rollup each task’s `task.json` `status` for X/Y complete.
4. **Dashboard:** Milestone — name (X/Y phases complete). Current phase — name (X/Y tasks complete). Current task — name and status (e.g. reviewing, building). Pipeline — current stage. **Recent reviews:** last 2–3 from the active task’s `reviews/*.md` (verdict + key finding).
5. Suggest next action from that state (e.g. run build, address reviews, plan or execute the next phase).
