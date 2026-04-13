---
name: review-changes
description: Manually trigger a review of current changes outside the normal task pipeline.
---

# Review changes

Ad-hoc review only. **Do not** call `trigger task advance` — pipeline state stays unchanged.

**CLI:** Resolve per `trigger-core.mdc` — bundled at `<plugin-root>/scripts/trigger-cli/`.

## In-session execution rule

When `Task()` subagents are unavailable (e.g., in Cursor), perform that reviewer role in-session per `trigger-model-tiering.mdc`. **All artifact requirements still apply.** Each reviewer MUST produce `reviews/<role>-review.md` whether run as a subagent or in-session.

## Process

1. Run `trigger state get`.
2. **Active task:** Run **execute-task** Step 3 (review pipeline) **without** any `trigger task advance` lines. Use `trigger reviewers list <m> <p> <t>` to determine which reviewers to activate. Same activation logic as execute-task: `domains`, `activation_rules`, `team.*.enabled`. Prompts: diff or summary, `PLAN.md`, `BUILDER-REPORT.md`. **Always** include **code-reviewer**.
3. **No active task:** `git diff` plus `git diff --staged`. **Always** run **code-reviewer**. Add specialist reviewers whose `activation_rules` globs match changed paths vs `.trigger/trigger.json`.
4. Each reviewer writes `reviews/<role>-review.md` with verdict, findings table, and improvements.
5. Present a concise rollup of findings to the user.
