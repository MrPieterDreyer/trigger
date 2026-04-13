---
name: execute-task
description: Full build-review pipeline for one task. Read trigger-model-tiering.mdc and trigger-quality-gates.mdc before executing.
---

# Execute task

Pipeline: load context → Builder → parallel reviews → QA verification → sign-off.

Resolve CLI path per `trigger-core.mdc`. Read `trigger-model-tiering.mdc` for model/subagent assignments. Read `trigger-quality-gates.mdc` for gate requirements.

## Resolve task

- `trigger summary` — read active `m`, `p`, `t`.
- If user named a task, confirm it exists. Otherwise pick first non-`done` task in phase order.

## Step 1 — Load context

1. Read `task.json`: acceptance criteria, `domains`, `status`.
2. Read `PLAN.md` in task dir. Missing → stop, ask.
3. Read `trigger.json`: verification commands, team config, trust, activation rules, escalation.
4. **Status gate:** `planned` → proceed. `build_failed`/`changes_requested` → re-enter Builder at Step 2. `built` → reviews at Step 3. `reviewing` → continue Step 3. `review_passed` → QA at Step 4. `qa_passed` → sign-off at Step 5. Otherwise stop.

## Step 2 — Builder

1. `trigger task advance <m> <p> <t> building`
2. Spawn Builder `Task()` — model/subagent per tiering rule. Prompt must include **full** `PLAN.md` text, acceptance criteria, all verification commands, TDD instruction.
3. After Builder: append `model_usage` entry to `task.json` (`"fast"` or `"expensive"`).
4. **Artifact gate:** Verify `BUILDER-REPORT.md` exists in the task directory. If it does not — whether the build was done by a subagent or in-session — create it now with: files changed, verification command results (pass/fail for each), risks, and any deviations from the plan.
5. Record changed files: capture the list of files created or modified by the Builder (via `git diff --name-only` or equivalent). Update `task.json` → `changed_files` array. This is used by reviewer activation logic.
6. Success: `trigger task advance <m> <p> <t> built`.
7. Failure after retries: escalate model if configured, else `build_failed` → stop with problem report.

See **Trust behavior matrix** below for gate behavior.

## Step 3 — Reviews (parallel)

### 3a. Determine activated reviewers

You MUST systematically determine which reviewers to activate. Do NOT rely on intuition.

1. Run the CLI command to compute activated reviewers:
   ```bash
   trigger reviewers list <m> <p> <t> --files <space-separated changed files>
   ```
   The CLI evaluates `team` config, `activation_rules` globs, and task `domains` automatically. It returns which reviewers to spawn and why.
2. If the `--files` flag is omitted, the CLI uses the `changed_files` array from `task.json` (recorded in Step 2).
3. **Log the activation decision.** Before proceeding, write out the full list returned by the CLI:
   ```
   Activated reviewers for task <t>:
   - code_reviewer: ACTIVE (always)
   - security_reviewer: ACTIVE (glob:**/auth/** matched src/lib/auth/session.ts)
   - performance_reviewer: SKIP (not activated)
   - ...
   ```
   This list must appear in the task output before any reviews begin.

### 3b. Run reviews

1. `trigger task advance <m> <p> <t> reviewing`
2. If `parallelism.reviews` is `true` (default): spawn ALL activated reviewers in one `Task()` batch. Cap at `parallelism.max_concurrent_reviews`.
3. **Artifact gate (per reviewer):** After each review completes, verify that `reviews/<role>-review.md` exists. Whether the review was done by a subagent or in-session, you MUST write this file before recording any verdict. The file must contain: verdict, findings table (severity, area, finding, recommendation), and non-blocking improvements.
4. Only after the review file exists, append the verdict to `review_verdicts` in `task.json`.

### 3c. Merge verdicts

1. After ALL activated reviewers complete, create `reviews/review-summary.json` using this schema:
   ```json
   {
     "task_id": "<task-id>",
     "overall_verdict": "approve | approve_with_changes | request_changes",
     "reviewers_activated": ["code_reviewer", "security_reviewer", ...],
     "findings": [
       { "severity": "P0-P3", "area": "...", "finding": "...", "recommendation": "...", "reviewer": "..." }
     ],
     "improvements": ["non-blocking suggestion 1", ...],
     "review_cycle": 1,
     "completed_at": "<ISO timestamp>"
   }
   ```
2. **Do NOT advance past `reviewing` until `reviews/review-summary.json` exists.**
3. All approve → `trigger task advance <m> <p> <t> review_passed`.
4. Any `request_changes` → consolidate ALL findings from ALL reviewers → `changes_requested` → Builder fixes → reverify → restart Step 3. Cap at `max_review_cycles`.

See **Trust behavior matrix** below for gate behavior.

## Step 4 — QA Verification

**This step is mandatory. You MUST NOT skip it. You MUST NOT advance to sign-off until QA passes.**

1. QA Verifier: `Task()` per tiering (or in-session). Prompt must include the full `acceptance_criteria` from `task.json`. Verify each criterion individually with pass/fail.
2. **Artifact gate:** Write `reviews/qa-verification.md` with per-criterion results. Do NOT advance until this file exists.
3. If any criterion fails → `changes_requested` → Builder fixes → re-run verification commands → restart from Step 3 (reviews) or Step 4 (QA only) as appropriate.
4. All criteria pass → `trigger task advance <m> <p> <t> qa_passed`.

See **Trust behavior matrix** below for gate behavior.

## Trust behavior matrix

| Gate | supervised | balanced | autonomous |
|------|-----------|----------|------------|
| G2 Builder report | Show report, wait for OK | Show report, auto-proceed | Auto-proceed |
| G3 Review rollup | Show each review, wait | Show combined rollup, auto-proceed | Auto-proceed |
| G4 QA verification | Show QA report, wait | Show QA summary, auto-proceed if PASS | Auto-proceed if PASS |
| G5 User sign-off | **Always wait** | **Always wait** | **Always wait** |

G5 (sign-off) always requires explicit user approval, regardless of trust level.

Exception: If the phase has `batch_signoff: true`, individual task sign-off (G5) is deferred. Tasks stop at `qa_passed`. The execute-phase orchestrator presents a single phase-level sign-off after all tasks reach that state.

## Step 5 — Sign-off

0. **Batch sign-off check:** Read the phase's `phase.json`. If `batch_signoff` is `true`, SKIP this step entirely. The task remains at `qa_passed`. The execute-phase orchestrator handles phase-level sign-off after all tasks reach `qa_passed`.

1. `trigger task advance <m> <p> <t> signoff`
2. Present to the user:
   - Build summary from `BUILDER-REPORT.md`
   - Review highlights from `reviews/review-summary.json`
   - QA outcome from `reviews/qa-verification.md`
   - Risks and known limitations
3. **Wait for user approval.** Sign-off ALWAYS requires explicit user input, regardless of trust level. The user must choose:
   - **Approve** → `trigger task advance <m> <p> <t> done`
   - **Request changes** → `trigger task advance <m> <p> <t> changes_requested` → restart at Step 2

## Finish

1. `trigger validate` — report pass/fail.
2. Update `.trigger/STATE.md` with task completion and review summary.

## Rules

- State transitions only via CLI.
- Builder prompt must contain full `PLAN.md` text inline.
- `model_usage` is append-only; read `task.json` immediately before writing metadata.
- Run `task advance` first, then read, then append, then next advance.
- **Artifact-before-verdict:** Never record a verdict or advance state without the corresponding artifact file existing on disk. This applies to `BUILDER-REPORT.md`, `reviews/<role>-review.md`, `reviews/review-summary.json`, and `reviews/qa-verification.md`.
- **In-session parity:** When performing any role in-session (rather than via subagent), you must produce the exact same artifact files that a subagent would produce. No exceptions.
