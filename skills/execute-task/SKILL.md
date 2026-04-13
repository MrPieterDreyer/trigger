---
name: execute-task
description: Full build-review pipeline for one task. Read trigger-model-tiering.mdc and trigger-quality-gates.mdc before executing.
---

# Execute task

Pipeline: load context → Builder → parallel reviews → docs/QA → sign-off.

Resolve CLI path per `trigger-core.mdc`. Read `trigger-model-tiering.mdc` for model/subagent assignments. Read `trigger-quality-gates.mdc` for gate requirements.

## Resolve task

- `trigger summary` — read active `m`, `p`, `t`.
- If user named a task, confirm it exists. Otherwise pick first non-`done` task in phase order.

## Step 1 — Load context

1. Read `task.json`: acceptance criteria, `domains`, `status`.
2. Read `PLAN.md` in task dir. Missing → stop, ask.
3. Read `trigger.json`: verification commands, team config, trust, activation rules, escalation.
4. **Status gate:** `planned` → proceed. `build_failed`/`changes_requested` → re-enter Builder. `built` → reviews. `reviewing` → continue. `review_passed` → post-review. Otherwise stop.

## Step 2 — Builder

1. `trigger task advance <m> <p> <t> building`
2. Spawn Builder `Task()` — model/subagent per tiering rule. Prompt must include **full** `PLAN.md` text, acceptance criteria, all verification commands, TDD instruction.
3. After Builder: append `model_usage` entry to `task.json` (`"fast"` or `"expensive"`).
4. Success: `trigger task advance <m> <p> <t> built` → write `BUILDER-REPORT.md`.
5. Failure after retries: escalate model if configured, else `build_failed` → stop with problem report.

**Trust `supervised`:** Show report, wait for OK.

## Step 3 — Reviews (parallel)

1. `trigger task advance <m> <p> <t> reviewing`
2. Activate reviewers: code always; others by `domains` + `activation_rules` globs + `team.*.enabled`.
3. If `parallelism.reviews` is `true` (default): spawn ALL activated reviewers in one `Task()` batch. Each writes to `reviews/<role>-review.md`. Cap at `parallelism.max_concurrent_reviews`.
4. After all complete — orchestrator merges:
   - Append `model_usage` + `review_verdicts` to `task.json`. Verdicts: `"approve"`, `"approve_with_changes"`, `"request_changes"`. Field: `reviewer` (not `role`).
   - Write `reviews/review-summary.json`.
5. All approve → `trigger task advance <m> <p> <t> review_passed`.
6. Any `request_changes` → consolidate ALL findings → `changes_requested` → Builder fixes → reverify → restart Step 3. Cap at `max_review_cycles`.

**Trust `supervised`:** Show each review, wait. **`balanced`:** Single rollup. **`autonomous`:** No pause.

## Step 4 — Post-review

1. Documentation Writer if activated: `Task()` with `model: "fast"`.
2. QA Verifier: `Task()` per tiering. Prompt: full acceptance criteria, per-criterion pass/fail. Write `reviews/qa-verification.md`. Failures → Builder fixes → re-verify.

**Trust `supervised`:** Show QA, wait.

## Step 5 — Sign-off

1. `trigger task advance <m> <p> <t> signoff`
2. Present: build summary, review highlights, QA outcome, risks.
3. User approves → `done`. Changes → `changes_requested` → Step 2.

Sign-off **always** waits, every trust level.

## Finish

1. `trigger validate` — report pass/fail.
2. Update `.trigger/STATE.md` with task completion and review summary.

## Rules

- State transitions only via CLI.
- Builder prompt must contain full `PLAN.md` text inline.
- `model_usage` is append-only; read `task.json` immediately before writing metadata.
- Run `task advance` first, then read, then append, then next advance.
