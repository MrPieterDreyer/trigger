---
name: execute-phase
description: Execute all tasks in a phase via execute-task, with parallel groups and batch sign-off.
---

# Execute phase

Runs the full build-review pipeline for every task in a phase.

## Step 1 — Load context

1. `trigger summary` — active milestone, phase. If user gave a phase number, use it.
2. Read `phase.json`: task list, `batch_signoff`.
3. Read `trigger.json`: trust, `parallelism` config.
4. No tasks → stop, suggest `trigger plan phase N`.

## Step 2 — Group and execute

### 2a. Build groups

Group tasks by `parallel_group`:
- Same value → concurrent group.
- No value → sequential group of one.
- Order: groups run in the order of their first task in the phase list.

### 2b. Execute groups

Check `parallelism.tasks` in config. If `true`: run tasks within a group concurrently. If `false`: all sequential.

Per group:
1. Skip `done` tasks.
2. **Parallel (2+ tasks):** Spawn one `Task()` per task in a single message. Each runs execute-task. Cap at `max_concurrent_tasks`. Wait for all before next group.
3. **Sequential (1 task):** `trigger state set active_task <id>` → follow execute-task skill.

### 2c. Batch sign-off

If `batch_signoff: true`: defer Gate 5. Tasks stop at `qa_passed` (after reviews AND QA verification pass). After all reach `qa_passed`, present one phase-level rollup. User approves → advance all through `signoff` → `done`. Changes → rework specific tasks only.

## Step 3 — Phase completion

1. `trigger phase advance <m> <p> done`. `trigger state set active_task null`.
2. Update `ROADMAP.md` (mark phase done) and `STATE.md` (phase complete, next phase).
3. Report: N/N tasks, review rollup, parallel groups used.
4. Suggest next: `trigger plan phase N+1` or `trigger status`.

## Error handling

- Stuck task: ask skip/retry/stop. Never skip silently.
- Parallel failure: let others finish, then report. Ask retry or proceed.
- Pause mid-phase: persist state, wait for in-flight tasks to stabilize.
