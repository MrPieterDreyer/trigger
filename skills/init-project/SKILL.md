---
name: init-project
description: Initialize a new Trigger-managed project with auto-detected configuration, team defaults, and .trigger directory structure.
---

# Init project

Use when the user says **trigger new project**, **start a new project**, or **initialize project**.

**CLI:** Resolve per `trigger-core.mdc` — bundled at `<plugin-root>/scripts/trigger-cli/`. All examples below use `<TRIGGER_CLI>` as the resolved path.

## Process

1. **Check for existing project** — Run `trigger validate`. If `.trigger/` already exists or validation shows this repo is already Trigger-managed, tell the user and stop.

2. **Detect project type** — Do not infer by hand. The CLI detects from files such as `package.json`, `tsconfig.json`, `*.csproj`, `requirements.txt`, `go.mod`, `Cargo.toml`, and `Gemfile`. `trigger init <name>` performs this.

3. **Ask the user** (required fields first; never assume answers):
   - Project name (required)
   - Brief description (optional)
   - Trust level: `supervised` (pause at every gate), `balanced` (plan approval + sign-off), `autonomous` (sign-off only). Default: `balanced`.
   - Git branching: `none`, `per_phase`, or `per_task`. Default: `none`.

4. **Initialize** — Run:

   ```bash
   node <TRIGGER_CLI>/dist/bin/trigger.js init <name> --trust <level> --description "<desc>"
   ```

   Omit `--description` if the user skipped it. If `trigger init` supports a branching flag, pass the user's choice; otherwise set branching in `trigger.json` after init.

5. **Present generated config** — Summarize detected project type, verification commands, and team configuration from the created files. Ask whether they want changes.

6. **Create first milestone** — Ask for a milestone name (e.g. MVP, v1.0) and optional description. Choose a stable `<id>` (slug from the name unless the user specifies). Run:

   ```bash
   node <TRIGGER_CLI>/dist/bin/trigger.js milestone create <id> "<name>" --description "<desc>"
   ```

   Omit `--description` if none was given.

7. **Suggest next step** — Tell the user: **Project initialized. Say 'trigger plan phase 1' to start planning your first phase.**

## Important notes

- **No guessing:** If any answer is missing, ask before running `init`.
- **Unknown type:** If detection yields `unknown`, ask for build, test, and lint commands and update `trigger.json` accordingly.
- **Health check:** After initialization, run `trigger validate` and report the result.
