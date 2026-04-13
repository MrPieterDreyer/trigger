---
name: quick-task
description: Handle a small, one-off task without the full pipeline — for bug fixes, typos, config changes, and other quick wins.
---

# Quick task

Informal work only — **not** recorded in **`state.json`** or the task pipeline.

1. Ask what needs doing; judge scope with the user.
2. **Genuinely quick** (e.g. single-file fix, typo, small config tweak): implement directly; run **`verification_commands`** from **`.planning/trigger.json`**; show the change for user approval. No formal review pipeline.
3. **Larger than a quick fix:** Say it should use the full pipeline. Suggest: *“Want this added as a task on the current phase, or a new phase?”*
4. Do not use **`trigger task advance`** or create task artifacts unless the user explicitly wants something tracked.
