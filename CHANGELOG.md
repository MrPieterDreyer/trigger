# Changelog

## 0.1.0 — 2026-04-10

Initial release.

### Added

- **CLI toolkit** (`trigger-cli`) — state management, config, validation, schemas (Zod), project type detection, state machine with enforced transitions.
- **4 rules** — `trigger-core` (routing), `trigger-quality-gates` (5-gate pipeline), `trigger-state-discipline` (CLI-only state), `trigger-model-tiering` (cost-optimized model selection).
- **9 skills** — `init-project`, `plan-phase`, `execute-phase`, `execute-task`, `review-changes`, `sign-off`, `quick-task`, `progress`, `resume`, `pause`, `help`.
- **12 agents** — Researcher, Planner, Plan Reviewer, Builder, Code Reviewer, Security Reviewer, Performance Reviewer, Accessibility Reviewer, Database Reviewer, DevOps Reviewer, Documentation Writer, QA Verifier.
- **8 commands** — `trigger-new-project`, `trigger-plan-phase`, `trigger-execute-phase`, `trigger-build-task`, `trigger-status`, `trigger-pause`, `trigger-resume`, `trigger-help`.
