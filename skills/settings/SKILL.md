---
name: settings
description: Interactively view and update Trigger project settings using structured UI prompts.
---

# Settings

Use when the user says **trigger settings**, **change settings**, **update config**, or **configure trigger**.

**CLI:** Resolve per `trigger-core.mdc` — bundled at `<plugin-root>/scripts/trigger-cli/`. All examples below use `<TRIGGER_CLI>` as the resolved path.

## Process

1. **Load current config** — Run:

   ```bash
   node <TRIGGER_CLI>/dist/bin/trigger.js config get
   ```

   Parse the JSON output to understand current values.

2. **Ask what to change** — Use `AskQuestion` to present the settings categories:

   ```
   AskQuestion(questions=[
     {
       id: "setting_category",
       prompt: "Which settings would you like to change?",
       options: [
         { id: "trust", label: "Trust level (currently: <current value>)" },
         { id: "guardian", label: "Guardian mode — auto-review & smart escalation" },
         { id: "team", label: "Team roles — enable/disable reviewers" },
         { id: "parallelism", label: "Parallelism — concurrent tasks & reviews" },
         { id: "verification", label: "Verification commands — test, lint, build" },
         { id: "view_all", label: "Just show me the current config" }
       ],
       allow_multiple: true
     }
   ])
   ```

   Replace `<current value>` with the actual trust level from config.

3. **Present category-specific questions** — Based on selection, use `AskQuestion` for each:

   ### Trust level
   ```
   AskQuestion(questions=[
     {
       id: "trust_level",
       prompt: "What trust level should Trigger use? (currently: <current>)",
       options: [
         { id: "supervised", label: "Supervised — pause at every quality gate for your approval" },
         { id: "balanced", label: "Balanced — require approval at plan review and final sign-off" },
         { id: "autonomous", label: "Autonomous — only pause at final sign-off" }
       ]
     }
   ])
   ```

   ### Guardian mode
   ```
   AskQuestion(questions=[
     {
       id: "auto_review",
       prompt: "Enable automatic code review after substantial changes? (currently: <current>)",
       options: [
         { id: "true", label: "Yes — auto-review when 3+ files or 50+ lines change" },
         { id: "false", label: "No — only review when I ask" }
       ]
     },
     {
       id: "smart_escalation",
       prompt: "Enable smart escalation to expensive models? (currently: <current>)",
       options: [
         { id: "true", label: "Yes — escalate hard problems to expensive model" },
         { id: "false", label: "No — handle everything with the current model" }
       ]
     }
   ])
   ```

   If auto_review is enabled, also ask:
   ```
   AskQuestion(questions=[
     {
       id: "review_threshold",
       prompt: "When should auto-review trigger? (currently: <files> files / <lines> lines)",
       options: [
         { id: "low", label: "Low bar — 2 files or 30 lines (review more often)" },
         { id: "default", label: "Default — 3 files or 50 lines" },
         { id: "high", label: "High bar — 5 files or 100 lines (review less often)" },
         { id: "custom", label: "Custom — I'll specify the numbers" }
       ]
     }
   ])
   ```

   If custom, ask for file and line thresholds in conversation.

   ### Team roles
   For each specialist reviewer (security, performance, accessibility, database, devops), present:
   ```
   AskQuestion(questions=[
     {
       id: "team_roles",
       prompt: "Which specialist reviewers should be active?",
       options: [
         { id: "security", label: "Security Reviewer (currently: <current>)" },
         { id: "performance", label: "Performance Reviewer (currently: <current>)" },
         { id: "accessibility", label: "Accessibility Reviewer (currently: <current>)" },
         { id: "database", label: "Database Reviewer (currently: <current>)" },
         { id: "devops", label: "DevOps Reviewer (currently: <current>)" }
       ],
       allow_multiple: true
     }
   ])
   ```

   Selected roles get `enabled: true`, unselected get `enabled: false`. Ask if any should be `"auto"` (activate based on file patterns).

   ### Parallelism
   ```
   AskQuestion(questions=[
     {
       id: "parallel_reviews",
       prompt: "Run reviewers in parallel? (currently: <current>)",
       options: [
         { id: "true", label: "Yes — all reviewers run at once (faster)" },
         { id: "false", label: "No — reviewers run one at a time (sequential)" }
       ]
     },
     {
       id: "parallel_tasks",
       prompt: "Run independent tasks in parallel? (currently: <current>)",
       options: [
         { id: "true", label: "Yes — independent tasks run concurrently" },
         { id: "false", label: "No — tasks run one at a time" }
       ]
     }
   ])
   ```

   ### Verification commands
   Show the current list and ask in conversation what to add, remove, or change. No AskQuestion needed — this is free-form.

4. **Apply changes** — Build the update object from user selections and run:

   ```bash
   node <TRIGGER_CLI>/dist/bin/trigger.js config set <key> <value>
   ```

   Or for complex updates, read trigger.json, apply changes, validate through the schema, and write back.

5. **Confirm** — Show a summary of what changed and the new values. Run `trigger validate` to ensure the config is still valid.

## Important notes

- **Always show current values** in the AskQuestion prompts so the user knows what they're changing from.
- **Never change settings without asking.** Even if the user says "turn off reviews," confirm with AskQuestion before applying.
- **view_all** — If selected, just print the current config formatted nicely and stop. Don't change anything.
