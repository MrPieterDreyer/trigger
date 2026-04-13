# Trigger

**Stop coding alone with AI. Start shipping with a team.**

Trigger turns Cursor into a 12-person AI product team that plans, builds, reviews, and verifies your code — while you stay in control. The fast model does the heavy lifting. Expensive models only show up when it matters: planning, reviewing, and catching what the fast model missed.

The result? Better code, fewer tokens burned, and a review process that actually works.

---

## What happens when you install Trigger

You say "build it." Behind the scenes:

1. A **Researcher** investigates your stack, reads docs, surfaces risks
2. A **Planner** breaks the work into tasks with acceptance criteria
3. A **Plan Reviewer** challenges the plan before a line of code is written
4. You approve. Then the **Builder** implements — running your tests, linter, and type checker after every change
5. A **Code Reviewer** tears the implementation apart. If your task touches auth, a **Security Reviewer** joins. Database migrations? **Database Reviewer**. Dockerfiles? **DevOps Reviewer**. They run in parallel
6. A **QA Verifier** checks every acceptance criterion against what was actually built
7. You see the results. You sign off. The task advances

No step is skipped. No review is faked. You approve at every gate.

---

## Guardian Mode

Most of your time in Cursor isn't structured project work — it's "fix this bug", "refactor that", "add a test." Guardian watches all of it:

**Auto-Review** — After any turn where you edit 3+ files or 50+ lines, a code reviewer automatically spawns to check your work. You don't ask for it. It just happens. P0/P1 issues get fixed before you see them. Powered by a [Cursor hook](https://docs.cursor.com/features/hooks) that fires on every agent stop.

**Smart Escalation** — When the fast model hits something hard (architectural decisions, repeated failures, security-sensitive code), it recognizes it's struggling and delegates that specific sub-problem to an expensive model. It doesn't guess. It asks for help, gets an answer, and keeps going.

Both features are configurable per project. Turn them off, raise the thresholds, or add skip patterns — it's all in your `trigger.json`.

---

## The economics

| Scenario | Without Trigger | With Trigger |
|---|---|---|
| Simple edit (1-2 files) | Sonnet: ~5K tokens | Fast model: ~3K tokens, no review |
| Medium change (3-5 files) | Sonnet: ~15K tokens | Fast: ~10K + review: ~5K = same cost, better quality |
| Large refactor (10+ files) | Sonnet: ~40K tokens | Fast: ~25K + review: ~8K = cheaper AND reviewed |
| Hard problem | Sonnet struggles: ~30K wasted | Fast: ~5K + escalate: ~8K + finish: ~15K = less waste |

The fast model handles volume. Expensive models handle judgment. You stop paying Opus prices for `console.log` fixes.

---

## Install

### Option A: Cursor Marketplace

Search for **Trigger** in the Cursor Marketplace and install.

Then install CLI dependencies:

```bash
cd ~/.cursor/plugins/cache/<trigger-path>/scripts/trigger-cli
npm install --production
```

### Option B: Clone it

```bash
git clone https://github.com/MrPieterDreyer/trigger.git ~/.cursor/plugins/local/trigger
cd ~/.cursor/plugins/local/trigger/scripts/trigger-cli
npm install --production
```

Restart Cursor. Done.

**Requires:** Node.js >= 20, Cursor with plugin support.

---

## Get started in 60 seconds

```
You:     "trigger new project"
Trigger: Detects your stack, creates .trigger/ config, asks about your project

You:     "trigger plan phase 1"
Trigger: Researcher → Planner → Plan Reviewer → you approve

You:     "trigger build phase 1"
Trigger: Builder → parallel reviewers → QA → you sign off

You:     "trigger status"
Trigger: Shows milestone progress, active phase, current task
```

That's it. Natural language, no commands to memorize. Say "where am I", "build it", "pause work", "review this" — Trigger understands.

---

## Your AI team

| Role | What they do | Model |
|---|---|---|
| Researcher | Tech choices, docs, risk assessment | Expensive |
| Planner | Task breakdown, dependencies, acceptance criteria | Expensive |
| Plan Reviewer | Challenges the plan before code is written | Expensive |
| Builder | Implements code, runs all verification commands | Fast |
| Code Reviewer | Logic, patterns, test coverage (always on) | Expensive |
| Security Reviewer | Auth, injection, secrets, input validation | Expensive |
| Performance Reviewer | N+1 queries, rendering cost, hot paths | Expensive |
| Accessibility Reviewer | WCAG, keyboard nav, screen readers | Expensive |
| Database Reviewer | Migrations, schema safety, data integrity | Expensive |
| DevOps Reviewer | Dockerfiles, CI/CD, infrastructure config | Expensive |
| Documentation Writer | README, API docs, changelog entries | Fast |
| QA Verifier | Acceptance criteria vs actual implementation | Fast |

Specialist reviewers activate automatically based on which files you touch. Security reviewer wakes up when you edit `auth/` or `middleware/`. Database reviewer activates for `migrations/` or `*.sql`. You configure the activation rules — or use the smart defaults.

---

## Configuration

Everything lives in `.trigger/trigger.json`:

```jsonc
{
  "project": {
    "name": "my-app",
    "type": "nextjs",           // auto-detected
    "trust_level": "balanced"   // supervised | balanced | autonomous
  },
  "verification": {
    "commands": [               // Builder runs these after every change
      { "name": "typecheck", "command": "npx tsc --noEmit", "required": true },
      { "name": "lint", "command": "npm run lint", "required": true },
      { "name": "test", "command": "npm test", "required": true }
    ]
  },
  "guardian": {
    "auto_review": true,        // hook-driven review after substantial changes
    "smart_escalation": true,   // fast model delegates hard problems
    "review_threshold_files": 3,
    "review_threshold_lines": 50,
    "skip_patterns": ["*.md", "*.json", ".trigger/**"]
  },
  "parallelism": {
    "reviews": true,            // run reviewers in parallel
    "tasks": true,              // run independent tasks in parallel
    "max_concurrent_tasks": 3,
    "max_concurrent_reviews": 6
  },
  "team": {
    "security_reviewer": { "model": "expensive", "enabled": "auto" },
    "performance_reviewer": { "model": "expensive", "enabled": false }
    // ... configure any role
  }
}
```

---

## The pipeline

```
Plan ──→ Build ──→ Review ──→ Verify ──→ Sign-off
 │         │         │          │           │
 │         │         │          │           └─ You approve (never skipped)
 │         │         │          └─ QA checks acceptance criteria
 │         │         └─ Parallel reviewers, loops back on REQUEST CHANGES
 │         └─ Builder implements + runs verification commands
 └─ Research → plan → plan review → your approval
```

Five quality gates. Every gate must pass. The pipeline enforces this — you can't skip review, you can't skip verification, you can't auto-approve your own work.

---

## All commands

| Say this | Trigger does this |
|---|---|
| "trigger new project" | Initialize project, detect stack, create config |
| "trigger plan phase 1" | Research, plan, review, approve |
| "trigger build phase 1" | Execute all tasks through the pipeline |
| "trigger build task 3" | Build and review a single task |
| "trigger status" | Milestone progress, phase status, what's next |
| "trigger review this" | Manual code review of recent changes |
| "trigger pause" | Save progress with resumption context |
| "trigger resume" | Pick up where you left off |
| "trigger config" | Show current settings |
| "trigger quick fix" | One-off task outside the pipeline |
| "trigger help" | List everything |

---

## How Trigger is built

- **7 rules** — Routing, quality gates, model tiering, state discipline, Guardian escalation, auto-review protocol, full reference
- **12 skills** — Each workflow is a self-contained skill with clear steps
- **12 agents** — Specialized AI roles with defined protocols and model assignments
- **CLI toolkit** — TypeScript CLI with Zod schemas, state machine, project detection, validation
- **Hooks** — Cursor stop-event hook for automatic post-change review
- **172 tests** — Full coverage of CLI commands, schemas, and state transitions

Always-apply rules cost ~150 tokens. Everything else loads on demand. The framework pays for itself.

---

## Stack-agnostic

Trigger doesn't care what you're building. Next.js, .NET, Python, Go, Rust, Ruby, Elixir, mobile — if you can define verification commands, Trigger works. The project detector auto-configures for common stacks, but you can override everything.

---

## License

MIT — see [LICENSE](./LICENSE).

---

Built by [TriGGeR](https://github.com/MrPieterDreyer). If Trigger saves you tokens and catches bugs, star the repo.
