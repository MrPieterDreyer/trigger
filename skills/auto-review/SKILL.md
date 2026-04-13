# Auto-Review

Manually trigger a code review of recent changes. Use when you want an explicit quality check outside the automatic stop-hook flow.

## Trigger phrases

"trigger review this", "review what I just did", "review my changes", "auto-review"

## Steps

1. Run `git diff HEAD` (or `git diff --cached` if changes are staged) to capture what changed.
2. Read rule `trigger-auto-review.mdc` for review criteria and presentation format.
3. Spawn `Task(subagent_type="code-reviewer")` with the diff and project context.
4. Present findings inline per the rule's format: fix P0/P1, mention P2/P3, or confirm clean.
