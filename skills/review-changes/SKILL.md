---
name: review-changes
description: Manually trigger a review of current changes outside the normal task pipeline.
---

# Review changes

Ad-hoc review only. **Do not** call `trigger task advance` — pipeline state stays unchanged.

**CLI:** Resolve per `trigger-core.mdc` — bundled at `<plugin-root>/scripts/trigger-cli/`. **Subagents:** `Task(subagent_type=…)`; if unavailable, perform that reviewer role in-session per `trigger-model-tiering.mdc`.

1. Run `trigger state get`.
2. **Active task:** Run **execute-task** Step 3 (sequential review pipeline) **without** any `trigger task advance` lines. Same reviewer order, `domains`, paths, `activation_rules`, and `team.*.enabled` as that step. Prompts: diff or summary, `PLAN.md`, `BUILDER-REPORT.md`. **Always** include **code-reviewer**; omit `model` for expensive default on reviewers.
3. **No active task:** `git diff` plus `git diff --staged`. **Always** spawn **code-reviewer** via `Task()` (expensive — omit `model`). Add specialist reviewers whose `activation_rules` globs match changed paths vs `.planning/trigger.json`.
4. Present a concise rollup of findings to the user.
