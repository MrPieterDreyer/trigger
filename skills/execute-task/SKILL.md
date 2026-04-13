---
name: execute-task
description: Execute the full build-review pipeline for a single task — Builder implements, verification runs, sequential reviews, QA verification, and user sign-off.
---

# Execute task

Use when the user says **trigger build task N**, **build task N**, or **build the next task**.

**Goal:** Run the full pipeline for one task: load context → Builder (implement + verify) → sequential reviews → optional docs → QA → user sign-off.

**CLI:** Resolve per `trigger-core.mdc` — bundled at `<plugin-root>/scripts/trigger-cli/`. All examples below use `<TRIGGER_CLI>` for `node <TRIGGER_CLI>/dist/bin/trigger.js <command>`.

**Sub-agents:** Spawn via `Task()` with the parameters below. In Cursor, if `Task()` is unavailable, perform that step in-session in the matching role (see `trigger-model-tiering.mdc`).

---

## Resolve which task

- Run `trigger state get`. Read active milestone `m`, phase `p`, and task index `t`.
- If the user named a task number, use that `t` after confirming it exists for `m`/`p`.
- **Next task:** pick the first task in the phase whose status is not `done`, in phase order; if ambiguous, ask.

---

## Step 1 — Load context

1. `trigger state get` — confirm `m`, `p`, `t`, paths.
2. Read the task directory's **`task.json`**: acceptance criteria, `domains`, `status`, paths to artifacts.
3. Read **`PLAN.md`** in that task directory. If missing, stop and ask what to build; do not invent a plan.
4. Read **`.trigger/trigger.json`**: `verification_commands`, `team`, `trust_level`, `activation_rules`, `escalation` (`max_review_cycles`, `escalate_to_expensive`).
5. **Status gate:** If status is not `planned`, only continue if resumable (e.g. `build_failed` → re-enter Builder; `changes_requested` → Builder; `built` → reviews; `reviewing` → continue reviews; `review_passed` → post-review/sign-off). If terminal or unknown, stop and report.

---

## Step 2 — Builder

1. `trigger task advance <m> <p> <t> building`
2. **Spawn Builder** via `Task()`:
   - `subagent_type`: from `trigger.json` team config for builder, default `fullstack-developer`
   - `model`: `"fast"`, or override from `trigger.json` team.builder.model (`"fast"` vs omit for expensive)
   - **Prompt must include (inline, full text):** entire `PLAN.md`, acceptance criteria from `task.json`, full list of verification commands to run, instruction to write tests with the change (TDD), instruction to run **all** verification commands and fix failures until clean or blocked
3. Builder implements and runs verification; orchestrator runs the same commands after Builder if needed to confirm.
4. **After Builder completes:** append `{ "role": "builder", "model": "<used>", "at": "<iso8601>" }` to `task.json` → `model_usage` (array). Create `model_usage` if absent. Do not change status fields except via CLI. The `model` value must be `"fast"` or `"expensive"` (matching the Zod schema enum). When `model: "fast"` was passed to `Task()`, record `"fast"`. When `model` was omitted (session default), record `"expensive"`.
5. **If DONE:** `trigger task advance <m> <p> <t> built` → write **`BUILDER-REPORT.md`** in the task dir (what changed, commands run, results, risks).
6. **If BLOCKED or still failing after reasonable retries:** If `escalation.escalate_to_expensive` is true, re-spawn Builder **without** `model: "fast"`. If still failing: `trigger task advance <m> <p> <t> build_failed` → stop and give the user a concise problem report with logs and repro steps.

**Trust `supervised`:** After Step 2, show `BUILDER-REPORT.md` and wait for user OK before Step 3.

---

## Step 3 — Review pipeline (sequential)

1. `trigger task advance <m> <p> <t> reviewing`
2. **Activate reviewers:** Code reviewer **always**. Others: match task `domains` + changed file paths to `activation_rules` globs; respect `team.*.enabled` (`false` skip, `"auto"` use rules, `true` force).
3. **Order:** code → security → performance → accessibility → database → devops (skip inactives). Same order as `trigger-model-tiering.mdc`.
4. For **each** activated reviewer, in order:
   - `Task()` with `subagent_type` from tiering (e.g. `code-reviewer`, `security-reviewer`). **Omit** `model` (expensive default).
   - Prompt: git diff (or summary + key paths if diff huge), full `PLAN.md`, full `BUILDER-REPORT.md`, and the reviewer's focus.
   - Append to `task.json` → `model_usage` for this reviewer. Record `"expensive"` as the model value (since `model` is omitted for reviewers). Use `"fast"` only if the reviewer was explicitly given `model: "fast"`.
   - Write verdict to **`reviews/<role>-review.md`** (e.g. `code-reviewer-review.md`, `security-reviewer-review.md`).
   - **REQUEST CHANGES:** `trigger task advance <m> <p> <t> changes_requested` → spawn Builder (`model: "fast"` unless config says otherwise) with findings → re-run **all** verification commands → `building` → `built` → `reviewing`, then **restart Step 3 from the first reviewer**. Cap cycles at `escalation.max_review_cycles`; then escalate to the user with summaries.
5. When all active reviewers return **APPROVE** or **APPROVE WITH CHANGES** (and no blocking follow-ups): write **`reviews/review-summary.json`** (roles, verdicts, dates) → `trigger task advance <m> <p> <t> review_passed`. When writing `review_verdicts` entries in `task.json`, use the Zod-schema enum values: `"approve"`, `"approve_with_changes"`, or `"request_changes"` (lowercase with underscores). The field name is `reviewer` (not `role`). Markdown review files may use uppercase for human readability.

**Trust `supervised`:** After each review file, show it and wait for confirmation before the next reviewer.
**Trust `balanced`:** Do not pause per review; pause once after Step 3 with a short rollup.
**Trust `autonomous`:** No pause until Step 5.

---

## Step 4 — Post-review

1. If **Documentation Writer** is activated (rules + team): `Task()` `api-documenter` with `model: "fast"`; commit doc updates under the task/phase as per project convention; append `model_usage`.
2. **QA Verifier:** `Task()` `qa-expert` (omit `model` per tiering unless `trigger.json` overrides). Prompt: full acceptance criteria; require explicit per-criterion pass/fail. Write **`reviews/qa-verification.md`**. If any fail: send findings to Builder (fast), re-verify, re-run verification commands; repeat until QA passes or user escalates.

**Trust `supervised`:** Show QA artifact and wait before Step 5.

---

## Step 5 — Sign-off

1. `trigger task advance <m> <p> <t> signoff`
2. Present to the user: build summary (from `BUILDER-REPORT.md`), review highlights + `review-summary.json`, QA outcome, open risks.
3. **Wait for user.** Approve → `trigger task advance <m> <p> <t> done`. Changes requested → `trigger task advance <m> <p> <t> changes_requested` → return to Step 2 (Builder).

Sign-off **always** waits for the user, every trust level.

---

## Finish

Run **`trigger validate`**. Report pass/fail; if fail, list issues and fix or hand off.

---

## Rules

- **State transitions:** only via `trigger task advance …` — never hand-edit status in JSON.
- **Plans:** Builder prompt must contain the **full** `PLAN.md` text; do not rely on sub-agents to open `PLAN.md` themselves.
- **Integrity:** `model_usage` is append-only metadata in `task.json`; status remains CLI-owned.
- **File edit ordering:** Always read `task.json` immediately before writing metadata (`model_usage`, `review_verdicts`). The CLI updates the file on each `task advance` call, so stale reads can revert status and history. Run `task advance` first, then read, then append metadata, then run the next `task advance`.
