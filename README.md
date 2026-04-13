# Trigger — AI Product Team Framework

Trigger turns Cursor into a small, disciplined product team. It routes work through specialized AI roles — Builder, reviewers, QA — inside a build-review pipeline so implementation is verified and challenged before you sign off.

## Why Trigger?

- **Model tiering** — Capable models plan and review. Fast models build. Each role has an explicit model assignment so you spend tokens where they matter.
- **Quality gates** — Verification commands must pass. Reviews produce verdicts. Acceptance criteria are checked. You still approve at the end.
- **Structured pipeline** — Plan, build, review, verify, sign-off. State lives in `.trigger/` and advances through the CLI.
- **Configurable team** — Enable or skip specialist reviewers. Activation rules tie them to file paths and task metadata.
- **Stack-agnostic** — Same workflow for Next.js, .NET, Python, Go, Rust, Ruby, or anything else. You define the verification commands.

## Installation

### From the Cursor Marketplace

1. Install **Trigger** from the [Cursor Marketplace](https://cursor.com/marketplace)
2. Open a terminal and run `npm install --production` inside the plugin's `scripts/trigger-cli/` directory:
   ```bash
   cd ~/.cursor/plugins/cache/<trigger-cache-path>/scripts/trigger-cli
   npm install --production
   ```

### Manual install

1. Clone this repository into your Cursor plugins directory:
   ```bash
   git clone https://github.com/MrPieterDreyer/trigger.git ~/.cursor/plugins/local/trigger
   ```
2. Install CLI dependencies:
   ```bash
   cd ~/.cursor/plugins/local/trigger/scripts/trigger-cli
   npm install --production
   ```
3. Restart Cursor — the plugin loads automatically.

### Prerequisites

- **Node.js** >= 20
- **Cursor** with plugin support

## Quick start

1. Say **trigger new project** in Cursor chat and follow the prompts
2. Adjust `.trigger/trigger.json` if you want different reviewers, trust level, or verification commands
3. Say **trigger plan phase 1** to research, plan, and review before building
4. Say **trigger execute phase 1** to run each task through the full pipeline

## Commands

| Command | What it does |
|---|---|
| `trigger-new-project` | Initialize a Trigger project with auto-detected config |
| `trigger-plan-phase` | Plan phase N — research, task breakdown, review, user approval |
| `trigger-execute-phase` | Execute every task in phase N through the pipeline |
| `trigger-build-task` | Build and review a single task |
| `trigger-status` | Show milestone, phase, task progress and recent verdicts |
| `trigger-pause` | Save state and create resumption context |
| `trigger-resume` | Restore context and continue |
| `trigger-help` | List all available commands |

Natural language works too: "trigger help", "trigger status", "where am I", "build it" — see `rules/trigger-core.mdc` for the full phrase map.

## Team roles

| Role | Purpose | Default model |
|---|---|---|
| Researcher | Tech choices, docs, risks before planning | expensive |
| Planner | Tasks, dependencies, acceptance criteria | expensive |
| Plan Reviewer | Plan completeness and feasibility | expensive |
| Builder | Code, tests, runs all verification commands | fast |
| Code Reviewer | Design, patterns, tests vs plan (always on) | expensive |
| Security Reviewer | Auth, input, secrets, exposure | expensive |
| Performance Reviewer | Hot paths, queries, UI cost | expensive |
| Accessibility Reviewer | WCAG, keyboard, semantics | expensive |
| Database Reviewer | Migrations, schema, data safety | expensive |
| DevOps Reviewer | Docker, CI, env and deploy shape | expensive |
| Documentation Writer | README, API notes, changelog | fast |
| QA Verifier | Each acceptance criterion vs the implementation | fast |

Specialist reviewers activate based on task domains, changed file paths, and `activation_rules` in config. Code Reviewer always runs.

## Configuration

`.trigger/trigger.json` is the project contract:

- **`verification.commands`** — ordered shell commands the Builder must run (test, lint, typecheck, etc.)
- **`team.<role>.enabled`** — `true`, `false`, or `"auto"` per role; `team.<role>.model` overrides tiering
- **`project.trust_level`** — `supervised` | `balanced` | `autonomous`
- **`activation_rules`** — globs deciding which specialist reviewers join a task
- **`escalation`** — caps on builder retries and review cycles; optional expensive-model escalation

## Pipeline

End-to-end flow for a task:

1. **Plan** — Research, written plan, plan review, your approval before build starts
2. **Build** — Builder implements, runs every verification command, writes a builder report
3. **Review** — Sequential reviewers (code first, then activated specialists); REQUEST CHANGES loops back through build + verify
4. **Verify** — Optional documentation pass; QA Verifier checks each acceptance criterion
5. **Sign-off** — Summary to you; task advances to done only after you approve (never skipped)

## License

MIT — see [LICENSE](./LICENSE).
