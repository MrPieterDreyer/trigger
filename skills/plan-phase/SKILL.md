---
name: plan-phase
description: Create a detailed implementation plan for a phase — research, task breakdown, plan review, and user approval before building begins.
---

# Plan phase

Use when the user says **trigger plan phase N**, **plan the next phase**, or equivalent.

## Step 1 — Context

1. Read `.trigger/` `state.json` for the active milestone.
2. Read `milestone.json` for the phase list. If phase **N** is missing, stop: tell the user to add the phase first.
3. Read `trigger.json` for team / trust config.
4. In the phase directory, read any existing context (requirements, user stories, notes).

## Step 2 — Research (optional)

1. If the phase needs unfamiliar tech or major architectural choices, **ask**: research pass first, or skip to planning?
2. If research: `Task(subagent_type=repo-research-analyst, model=expensive)` — investigator writes `RESEARCH.md` in that phase directory.

## Step 3 — Planning

1. `Task(subagent_type=architecture-strategist, model=expensive)` — **Planner** produces:
   - `phase.json` with an **ordered** task list.
   - Per task: `task.json` (acceptance criteria, domains, touched files) and `PLAN.md` (step-by-step implementation instructions).
2. Plans must be concrete enough for a **fast-model Builder** to execute without guessing.

## Step 4 — Plan review (Gate G1)

1. `Task(subagent_type=correctness-reviewer, model=expensive)` — checks completeness, feasibility, testability, and task ordering.
2. **REQUEST CHANGES** → Planner revises → re-review (**max 2** revision cycles).
3. **APPROVE** → set phase status to **`planned`** in `phase.json` (or the project’s canonical status field).

## Step 5 — User approval

1. Present: phase summary, task list with short descriptions, domains, and estimated complexity.
2. **Wait** for the user: approve, request edits, or reorder tasks; apply changes before final approval.
3. After approval: update `state.json` **`active_phase`** to **N**; suggest **trigger execute phase N**.

## Cursor / no-`Task()` note

If the host cannot spawn `Task()`, read the matching agent definition and **assume that role** to produce the same artifacts and gates.

## Error handling

- Missing milestone or unreadable paths: stop and say what is missing.
- Stuck after two review rounds: surface open issues and ask the user how to proceed.
