---
name: execute-phase
description: Execute all tasks in a phase sequentially through the full build-review pipeline. Orchestrates the execute-task skill for each task.
---

# Execute phase

Use when the user says **trigger execute phase N**, **run phase**, **build phase**, or wants every task in a phase run through the full pipeline.

## Step 1 — Load phase context

1. Read `state.json` (under the project’s Trigger `.planning/` tree). Resolve active milestone and phase; if the user gave a phase number, use it.
2. Open that phase’s `phase.json` and read the ordered task list.
3. Read `trigger.json` for trust level and execution constraints.
4. If there are no tasks, stop: tell the user to run **trigger plan phase N** first.

## Step 2 — Execute tasks sequentially

For each task in list order:

1. Read the task’s `task.json` for status:
   - `done` — skip.
   - `planned` — run the pipeline via the execute-task skill.
   - Any other status — interrupted; resume from current state (still follow execute-task).
2. Set `trigger state set active_task <task_id>`.
3. Follow the **execute-task** skill for the full build-review pipeline until that task is `done`.
4. Proceed to the next task.

## Step 3 — Phase completion

When all tasks are `done`:

1. Set phase status to `done` in `phase.json`.
2. Run `trigger state set active_task null`.
3. Report: tasks completed N/N; review rollup (P0/P1/… totals across tasks); duration if timestamps exist in artifacts.
4. Suggest: **Phase N complete. Say 'trigger plan phase N+1' to plan the next phase, or 'trigger status' for overall progress.**

## Error handling

- Task stuck (max review cycles, Builder keeps failing): pause; ask **skip**, **retry**, or **stop the phase**. Never skip without telling the user.
- **trigger pause** mid-phase: persist position in `state.json` and stop.
- Do not silently skip or drop tasks.
