---
name: plan-phase
description: Plan a phase — research, task breakdown with parallel grouping, review, docs update, user approval. Read trigger-model-tiering.mdc for agent config.
---

# Plan phase

## Step 1 — Context

1. `trigger summary` — active milestone, phase.
2. Read `milestone.json` for phase list. Phase N missing → stop.
3. Read `trigger.json` for team/trust/parallelism.
4. Read `PROJECT.md` and `REQUIREMENTS.md` for project context.
5. Read any existing phase-level context (requirements, notes).

## Step 2 — Research (optional)

If unfamiliar tech or architectural choices needed, ask user. If yes: `Task(subagent_type=repo-research-analyst)` → writes `RESEARCH.md` in phase dir.

## Step 3 — Planning

Spawn Planner `Task(subagent_type=architecture-strategist)`. Produces:
- `phase.json` with ordered task list.
- Per task: `task.json` (criteria, domains) + `PLAN.md` (concrete steps for a fast-model Builder).

**Task ID convention:** Task IDs should be descriptive kebab-case slugs (e.g., `auth-foundation`, `api-client`, `cicd-pipeline`). Keep them short but meaningful — the task name provides the full description.

**Parallel groups:** Planner assigns `parallel_group` per task. Same group = no shared file writes, no data dependency. When in doubt, keep sequential.

**Batch sign-off:** If 3+ parallel tasks, recommend `batch_signoff: true` on the phase.

## Step 4 — Plan review (Gate G1)

`Task(subagent_type=correctness-reviewer)` — checks completeness, feasibility, parallel group correctness.
- Request changes → revise → re-review (max 2 cycles).
- Approve → phase status `planned`.

## Step 5 — Update documents

- **ROADMAP.md** — Add phase entry with tasks, parallel groups, status `planned`.
- **REQUIREMENTS.md** — Append phase requirements from acceptance criteria.
- **STATE.md** — Set active phase, list planned tasks, update timestamp.

## Step 6 — User approval

Present: summary, tasks, domains, parallel groups, complexity. Wait for user. After approval: set `active_phase` → suggest `trigger execute phase N`.

## Notes

- If `Task()` unavailable, read agent def and assume that role.
- Missing milestone → stop and report.
- Stuck after 2 review rounds → surface issues, ask user.
