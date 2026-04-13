---
name: init-project
description: Initialize a new Trigger-managed project with auto-detected configuration, team defaults, planning documents, and .trigger directory structure.
---

# Init project

Use when the user says **trigger new project**, **start a new project**, or **initialize project**.

**CLI:** Resolve per `trigger-core.mdc` — bundled at `<plugin-root>/scripts/trigger-cli/`. All examples below use `<TRIGGER_CLI>` as the resolved path.

## Process

1. **Check for existing project** — Run `trigger validate`. If `.trigger/` already exists or validation shows this repo is already Trigger-managed, tell the user and stop.

2. **Detect project type** — Do not infer by hand. The CLI detects from files such as `package.json`, `tsconfig.json`, `*.csproj`, `requirements.txt`, `go.mod`, `Cargo.toml`, and `Gemfile`. `trigger init <name>` performs this.

3. **Ask the user** — Never assume defaults. Use the `AskQuestion` tool to collect structured answers before running `init`:

   First, ask for the project name and description in conversation (free text).

   Then use `AskQuestion` for structured choices:

   ```
   AskQuestion(questions=[
     {
       id: "trust_level",
       prompt: "What trust level should Trigger use for quality gates?",
       options: [
         { id: "supervised", label: "Supervised — pause at every quality gate for your approval" },
         { id: "balanced", label: "Balanced — require approval at plan review and final sign-off" },
         { id: "autonomous", label: "Autonomous — only pause at final sign-off" }
       ]
     }
   ])
   ```

   Also ask in conversation: What is this project? Goals, target users, key capabilities (used for PROJECT.md).

   **Do NOT skip the AskQuestion step.** Every project must have an explicit user choice for trust level.

   *Note: Git branching integration is planned for a future version.*

4. **Initialize** — Run:

   ```bash
   node <TRIGGER_CLI>/dist/bin/trigger.js init <name> --trust <level> --description "<desc>"
   ```

   Omit `--description` if the user skipped it. If `trigger init` supports a branching flag, pass the user's choice; otherwise set branching in `trigger.json` after init.

5. **Generate planning documents** — Write the following markdown files into `.trigger/`:

   ### PROJECT.md
   Write `.trigger/PROJECT.md` with:
   - **Project name** and description
   - **Goals** — what the project aims to achieve (from user's answers)
   - **Tech stack** — detected project type, languages, frameworks
   - **Team configuration** — trust level, active reviewers, model tiering summary
   - **Key decisions** — any architectural choices discussed during init

   ### REQUIREMENTS.md
   Write `.trigger/REQUIREMENTS.md` with:
   - **Overview** — high-level requirements from the user's description
   - **Functional requirements** — leave as placeholder sections for the user to fill or for plan-phase to populate
   - **Non-functional requirements** — performance, security, accessibility expectations if discussed
   - **Constraints** — known limitations, dependencies, deadlines if mentioned

   ### STATE.md
   Write `.trigger/STATE.md` with:
   - **Current status:** Initialized — no milestones planned yet
   - **Active milestone:** None
   - **Active phase:** None
   - **Active task:** None
   - **Last updated:** timestamp

   ### IMPROVEMENT-BACKLOG.md
   Write `.trigger/IMPROVEMENT-BACKLOG.md` with:
   - Header explaining this is a living document for improvement ideas, tech debt, and future considerations
   - Empty sections: **Ideas**, **Tech Debt**, **Future Phases**

6. **Present generated config** — Summarize detected project type, verification commands, team configuration, and the planning documents created. Ask whether they want changes.

7. **Create first milestone** — Ask for a milestone name (e.g. MVP, v1.0) and optional description. Choose a stable `<id>` (slug from the name unless the user specifies). Run:

   ```bash
   node <TRIGGER_CLI>/dist/bin/trigger.js milestone create <id> "<name>" --description "<desc>"
   ```

   Omit `--description` if none was given.

8. **Generate ROADMAP.md** — Write `.trigger/milestones/<id>/ROADMAP.md` with:
   - **Milestone name** and description
   - **Phases** — empty for now; will be populated as phases are planned
   - **Status** — "Milestone created, no phases planned yet"

   The `roadmapPath()` helper in the CLI paths module returns the correct location.

9. **Suggest next step** — Tell the user: **Project initialized. Say 'trigger plan phase 1' to start planning your first phase.**

## Important notes

- **No guessing:** If any answer is missing, ask before running `init`.
- **Unknown type:** If detection yields `unknown`, ask for build, test, and lint commands and update `trigger.json` accordingly.
- **Health check:** After initialization, run `trigger validate` and report the result.
- **Document quality:** PROJECT.md and REQUIREMENTS.md should reflect what the user actually said, not generic boilerplate. If the user gave minimal info, keep the documents short and honest rather than padding with assumptions.
