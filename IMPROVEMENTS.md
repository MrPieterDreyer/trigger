# Trigger Framework — Improvement Plan

**Date:** 2026-04-10
**Source:** Post-execution audit of Phase 0 (Foundation) in the eRoC.Frontend milestone
**Purpose:** Actionable instructions for an agent to fix each issue in the Trigger Framework codebase

---

## How to Use This File

Each section describes a problem, its root cause, the files to modify, and the exact changes needed. Work through them in priority order (Critical → High → Medium → Low). After each fix, run `npm run build` in `scripts/trigger-cli/` to verify TypeScript compilation, then run any existing tests.

**Key paths (relative to the Trigger plugin root):**

| Path | Contains |
|------|----------|
| `scripts/trigger-cli/src/lib/state-machine.ts` | Task state machine (transitions) |
| `scripts/trigger-cli/src/commands/task.ts` | Task create/advance/status commands |
| `scripts/trigger-cli/src/commands/validate.ts` | Project validation |
| `scripts/trigger-cli/src/commands/summary.ts` | Compact dashboard |
| `scripts/trigger-cli/src/schemas/task.ts` | Task schema (Zod) |
| `scripts/trigger-cli/src/schemas/state.ts` | State schema (Zod) |
| `scripts/trigger-cli/src/schemas/phase.ts` | Phase schema (Zod) |
| `scripts/trigger-cli/src/schemas/trigger-config.ts` | Config schema (Zod) |
| `scripts/trigger-cli/src/schemas/review-summary.ts` | Review summary schema (Zod) |
| `skills/execute-task/SKILL.md` | Single task build-review pipeline |
| `skills/execute-phase/SKILL.md` | Phase-level orchestration |
| `skills/plan-phase/SKILL.md` | Phase planning |
| `skills/init-project/SKILL.md` | Project initialization |
| `skills/help/SKILL.md` | Help text |
| `rules/trigger-model-tiering.mdc` | Model selection and reviewer activation logic |
| `rules/trigger-quality-gates.mdc` | Gate definitions |
| `rules/trigger-state-discipline.mdc` | State update rules |
| `agents/builder.md` | Builder agent definition |
| `agents/qa-verifier.md` | QA Verifier agent definition |
| `agents/code-reviewer.md` | Code Reviewer agent definition |

---

## Critical Priority

### C1. execute-task skill skips `qa_passed` state — causes invalid transition

**Problem:** The state machine enforces `review_passed → qa_passed → signoff`. But `execute-task/SKILL.md` Step 4 (Post-review) never tells the agent to run `trigger task advance <m> <p> <t> qa_passed`. Step 5 then says `trigger task advance <m> <p> <t> signoff`. The CLI rejects the `review_passed → signoff` transition because it's not valid. Agents work around this by editing `task.json` directly or skipping QA entirely.

**Root cause:** The skill was written without referencing the state machine. QA is described as a soft step, not a hard gate with a CLI transition.

**Files to modify:** `skills/execute-task/SKILL.md`

**Changes:**

1. In **Step 4 — Post-review**, add explicit CLI calls and make it a hard gate:

Replace the current Step 4 with:

```markdown
## Step 4 — Post-review (QA gate)

1. Documentation Writer if activated: `Task()` with `model: "fast"`.
2. QA Verifier: spawn `Task(subagent_type="qa-expert")` per tiering config. Prompt must include: full acceptance criteria from `task.json`, list of changed files, and instruction to verify each criterion by reading code (not trusting reports). QA writes `reviews/qa-verification.md`.
3. **Artifact gate:** Verify `reviews/qa-verification.md` exists. If missing, do not proceed.
4. QA passes → `trigger task advance <m> <p> <t> qa_passed`.
5. QA fails → consolidate findings → `changes_requested` → Builder fixes → re-run verification commands → restart from Step 3.

**Trust `supervised`:** Show QA report, wait for OK before advancing.
**Trust `balanced`:** Show QA summary, auto-proceed if PASS.
**Trust `autonomous`:** Auto-proceed if PASS.
```

2. In **Step 5 — Sign-off**, update the first line to reference the correct prior state:

```markdown
## Step 5 — Sign-off

1. `trigger task advance <m> <p> <t> signoff`
```

This is now valid because the prior state is `qa_passed` (not `review_passed`).

3. In the **Status gate** (Step 1, item 4), add handling for `qa_passed`:

```markdown
4. **Status gate:** `planned` → proceed. `build_failed`/`changes_requested` → re-enter Builder. `built` → reviews. `reviewing` → continue reviews. `review_passed` → post-review (QA). `qa_passed` → sign-off. Otherwise stop.
```

---

### C2. `pipeline_stage` in `state.json` is never updated

**Problem:** `state.json` has a `pipeline_stage` field (idle, planning, building, reviewing, qa_verification, signoff, done) but no skill ever updates it. It stays stale.

**Root cause:** The schema defines it, but the skills predate it.

**Option A — Auto-sync in CLI (recommended):**

**Files to modify:** `scripts/trigger-cli/src/commands/task.ts`

In the `advanceTask` function, after successfully writing the updated task, also update `state.json`'s `pipeline_stage`:

```typescript
// After writing task.json, sync pipeline_stage in state.json
const stateMapping: Record<string, string> = {
  building: 'building',
  built: 'reviewing',       // next step is reviews
  build_failed: 'build_failed',
  reviewing: 'reviewing',
  review_passed: 'qa_verification',
  changes_requested: 'changes_requested',
  qa_passed: 'signoff',
  signoff: 'signoff',
  done: 'done',
};
const newPipelineStage = stateMapping[result.to] || 'idle';

const state = await fm.readJson(paths.statePath, StateSchema);
state.pipeline_stage = newPipelineStage;
state.last_updated = new Date().toISOString();
await fm.writeJson(paths.statePath, state);
```

Import `StateSchema` from the schemas if not already imported.

**Option B — Manual sync in skills:**

Add `trigger state set pipeline_stage <stage>` calls after each `trigger task advance` call in `execute-task/SKILL.md`. This is more verbose and error-prone than Option A.

---

## High Priority

### H1. No CLI command to compute activated reviewers

**Problem:** The agent must manually read `trigger.json`, parse activation_rules globs, match them against changed files, and check `team.*.enabled` — all in prose logic. Agents get this wrong because glob matching is hard to do mentally.

**Files to create:** `scripts/trigger-cli/src/commands/reviewers.ts`
**Files to modify:** `scripts/trigger-cli/src/bin/trigger.ts` (add the new command to the CLI router)

**New command:** `trigger reviewers list <milestone> <phase> <task> [--files file1.ts file2.tsx ...]`

**Implementation:**

```typescript
import { TriggerPaths } from "../lib/paths.js";
import { FileManager } from "../lib/file-manager.js";
import { TriggerConfigSchema } from "../schemas/trigger-config.js";
import { TaskSchema } from "../schemas/task.js";
import { minimatch } from "minimatch";

const fm = new FileManager();

export interface ActivatedReviewer {
  role: string;
  reason: string; // "always" | "domain:security" | "glob:**/lib/auth/**"
  subagent_type: string;
  model: "fast" | "expensive";
}

export async function listReviewers(
  projectRoot: string,
  milestoneId: string,
  phaseId: string,
  taskId: string,
  changedFiles: string[] = [],
): Promise<ActivatedReviewer[]> {
  const paths = new TriggerPaths(projectRoot);
  const config = await fm.readJson(paths.configPath, TriggerConfigSchema);
  const task = await fm.readJson(
    paths.taskPath(milestoneId, phaseId, taskId),
    TaskSchema,
  );

  const reviewerMap: Record<string, { subagent_type: string }> = {
    code_reviewer: { subagent_type: "code-reviewer" },
    security_reviewer: { subagent_type: "security-reviewer" },
    performance_reviewer: { subagent_type: "performance-reviewer" },
    accessibility_reviewer: { subagent_type: "accessibility-tester" },
    database_reviewer: { subagent_type: "data-migrations-reviewer" },
    devops_reviewer: { subagent_type: "devops-engineer" },
  };

  const activated: ActivatedReviewer[] = [];

  for (const [role, meta] of Object.entries(reviewerMap)) {
    const teamConfig = config.team[role as keyof typeof config.team];
    if (!teamConfig) continue;

    // Skip if disabled
    if (teamConfig.enabled === false) continue;

    // Always-on roles
    if (teamConfig.enabled === true || teamConfig.always) {
      activated.push({
        role,
        reason: "always",
        subagent_type: meta.subagent_type,
        model: teamConfig.model as "fast" | "expensive",
      });
      continue;
    }

    // Auto-activation: check domains and globs
    if (teamConfig.enabled === "auto") {
      // Check task domains
      const domainKeywords: Record<string, string[]> = {
        security_reviewer: ["security", "auth", "authentication"],
        performance_reviewer: ["performance", "optimization"],
        accessibility_reviewer: ["accessibility", "a11y", "wcag"],
        database_reviewer: ["database", "migration", "schema"],
        devops_reviewer: ["devops", "cicd", "deployment", "infrastructure"],
      };

      const keywords = domainKeywords[role] || [];
      const domainMatch = task.domains.some((d: string) =>
        keywords.some((k) => d.toLowerCase().includes(k)),
      );

      if (domainMatch) {
        const matchedDomain = task.domains.find((d: string) =>
          keywords.some((k) => d.toLowerCase().includes(k)),
        );
        activated.push({
          role,
          reason: `domain:${matchedDomain}`,
          subagent_type: meta.subagent_type,
          model: teamConfig.model as "fast" | "expensive",
        });
        continue;
      }

      // Check file globs
      const rules = config.activation_rules[role];
      if (rules && changedFiles.length > 0) {
        for (const glob of rules.globs) {
          const matched = changedFiles.find((f) => minimatch(f, glob));
          if (matched) {
            activated.push({
              role,
              reason: `glob:${glob} (matched ${matched})`,
              subagent_type: meta.subagent_type,
              model: teamConfig.model as "fast" | "expensive",
            });
            break;
          }
        }
      }
    }
  }

  return activated;
}
```

**Also add `minimatch` as a dependency** to `scripts/trigger-cli/package.json`.

**Update `execute-task/SKILL.md` Step 3** to say:

```markdown
2. Determine activated reviewers:
   ```bash
   trigger reviewers list <m> <p> <t> --files <space-separated changed files>
   ```
   The CLI returns which reviewers to spawn and why. Spawn ALL listed reviewers.
```

---

### H2. No changed files tracking per task

**Problem:** Activation rules match globs against changed files, but there's no record of which files a task changed. The reviewers list command (H1) needs this data.

**Files to modify:** `scripts/trigger-cli/src/schemas/task.ts`

Add to the TaskSchema:

```typescript
changed_files: z.array(z.string()).default([]),
```

**Files to modify:** `skills/execute-task/SKILL.md`

In Step 2 (Builder), after the builder finishes and before advancing to `built`, add:

```markdown
3b. Record changed files: run `git diff --name-only HEAD~1` (or capture the diff from before/after the Builder). Update `task.json` → `changed_files` array with the list. This is used by `trigger reviewers list` to activate the correct reviewers.
```

**Note:** Since task.json should only be modified via CLI, you may also need a new CLI command: `trigger task set-files <m> <p> <t> file1 file2 ...` or allow `task advance` to accept a `--files` flag.

---

### H3. `validate` command doesn't check for required artifacts

**Problem:** `validate` only checks JSON schema validity and path existence. A task can be `done` with zero review files and no builder report — validate still says "valid."

**Files to modify:** `scripts/trigger-cli/src/commands/validate.ts`

Inside the task validation loop (after parsing `task.json`), add artifact checks:

```typescript
import path from "node:path";

// Inside the task loop, after successfully parsing task.json:
const taskData = TaskSchema.parse(JSON.parse(raw));
const taskDirPath = paths.taskDir(msEntry.name, phaseEntry.name, taskEntry.name);
const reviewsDirPath = paths.reviewsDir(msEntry.name, phaseEntry.name, taskEntry.name);

// Check artifacts based on status
const statusOrder = ['planned','building','built','build_failed','reviewing',
  'changes_requested','review_passed','qa_passed','signoff','done'];
const statusIdx = statusOrder.indexOf(taskData.status);

if (statusIdx >= statusOrder.indexOf('built')) {
  const reportPath = path.join(taskDirPath, 'BUILDER-REPORT.md');
  if (!(await fm.exists(reportPath))) {
    warnings.push(`Task "${taskEntry.name}": status is "${taskData.status}" but BUILDER-REPORT.md is missing`);
  }
}

if (statusIdx >= statusOrder.indexOf('review_passed')) {
  const summaryPath = path.join(reviewsDirPath, 'review-summary.json');
  if (!(await fm.exists(summaryPath))) {
    warnings.push(`Task "${taskEntry.name}": status is "${taskData.status}" but reviews/review-summary.json is missing`);
  }

  // Check that at least code-reviewer-review.md exists
  const codeReviewPath = path.join(reviewsDirPath, 'code-reviewer-review.md');
  if (!(await fm.exists(codeReviewPath))) {
    warnings.push(`Task "${taskEntry.name}": status is "${taskData.status}" but reviews/code-reviewer-review.md is missing`);
  }
}

if (statusIdx >= statusOrder.indexOf('qa_passed')) {
  const qaPath = path.join(reviewsDirPath, 'qa-verification.md');
  if (!(await fm.exists(qaPath))) {
    warnings.push(`Task "${taskEntry.name}": status is "${taskData.status}" but reviews/qa-verification.md is missing`);
  }
}
```

---

### H4. Skills don't gate transitions on artifact existence

**Problem:** Even with validate improvements (H3), the agent can still advance without creating artifacts. The skill instructions must make artifact existence a pre-condition for each `trigger task advance` call.

**Files to modify:** `skills/execute-task/SKILL.md`

Add artifact checks before each advance call:

**Step 2 (Builder) — before `trigger task advance ... built`:**
```markdown
4. **Artifact check:** Verify `BUILDER-REPORT.md` exists in the task directory. If it doesn't, write it now with: implementation summary, verification results table (command → pass/fail), test files and coverage, known limitations. Do NOT advance to `built` without this file.
5. Success: `trigger task advance <m> <p> <t> built`.
```

**Step 3 (Reviews) — before `trigger task advance ... review_passed`:**
```markdown
4. After all reviewers complete — orchestrator merges:
   a. **Artifact check:** Verify `reviews/<reviewer>-review.md` exists for EVERY activated reviewer. If any are missing, write them now with the verdict and findings. Whether the review was performed by a subagent or in-session, the file MUST exist.
   b. Write `reviews/review-summary.json` matching the ReviewSummary schema (task_id, overall_verdict, reviewers_activated, findings, review_cycle, completed_at).
   c. Append `model_usage` + `review_verdicts` to `task.json`.
5. All approve → verify `reviews/review-summary.json` exists → `trigger task advance <m> <p> <t> review_passed`.
```

**Step 4 (QA) — before `trigger task advance ... qa_passed`:**
```markdown
3. **Artifact check:** Verify `reviews/qa-verification.md` exists. If missing, do not proceed.
4. QA passes → `trigger task advance <m> <p> <t> qa_passed`.
```

---

### H5. In-session execution bypasses artifact creation

**Problem:** When the agent acts as Builder/Reviewer/QA in-session (instead of spawning subagents), it tends to perform the work mentally and skip writing the output files. This is because the skills say "Spawn Task()" — implying a subagent writes the file — but in Cursor, the agent works in-session.

**Files to modify:** `skills/execute-task/SKILL.md`

Add a universal rule at the top of the skill:

```markdown
## In-session execution rule

When `Task()` subagents are unavailable (e.g., in Cursor), perform that role in-session. **All artifact requirements still apply.** Whether you spawn a subagent or perform the work yourself:
- Builder MUST produce `BUILDER-REPORT.md`
- Each reviewer MUST produce `reviews/<role>-review.md`
- QA Verifier MUST produce `reviews/qa-verification.md`
- The orchestrator MUST produce `reviews/review-summary.json`

Do NOT advance task status until the corresponding artifact file exists on disk.
```

---

## Medium Priority

### M1. Trust level behavior matrix — resolve contradictions

**Problem:** Different documents give different trust level behavior for each gate. The agent doesn't know when to wait and when to auto-proceed.

**Files to modify:** `skills/execute-task/SKILL.md`, `rules/trigger-quality-gates.mdc`

Add this matrix to BOTH files:

```markdown
## Trust behavior matrix

| Gate | supervised | balanced | autonomous |
|------|-----------|----------|------------|
| G2 Builder report | Show report, wait for OK | Show report, auto-proceed | Auto-proceed |
| G3 Review rollup | Show each review, wait | Show combined rollup, auto-proceed | Auto-proceed |
| G4 QA verification | Show QA report, wait | Show QA summary, auto-proceed if PASS | Auto-proceed if PASS |
| G5 User sign-off | **Always wait** | **Always wait** | **Always wait** |

G5 (sign-off) always requires explicit user approval, regardless of trust level.

Exception: If the phase has `batch_signoff: true`, individual task sign-off (G5) is deferred. Tasks stop at `qa_passed`. The execute-phase orchestrator presents a single phase-level sign-off after all tasks reach that state.
```

Remove the contradictory inline trust notes from each step in `execute-task/SKILL.md` and replace with: *"See Trust behavior matrix above."*

---

### M2. No `trigger phase advance` CLI command

**Problem:** The execute-phase skill says "Set phase status done" but there's no CLI command for it. The agent edits `phase.json` directly.

**Files to create:** Add a `phaseAdvance` function to `scripts/trigger-cli/src/commands/phase.ts` (or create the file if it only has `createPhase` and `listPhases`).

**Implementation:**

```typescript
export async function advancePhase(
  projectRoot: string,
  milestoneId: string,
  phaseId: string,
  newStatus: "planned" | "in_progress" | "done",
): Promise<Phase> {
  const paths = new TriggerPaths(projectRoot);
  const phase = await fm.readJson(
    paths.phasePath(milestoneId, phaseId),
    PhaseSchema,
  );

  const validTransitions: Record<string, string[]> = {
    planned: ["in_progress"],
    in_progress: ["done"],
    done: [],
  };

  if (!validTransitions[phase.status]?.includes(newStatus)) {
    throw new Error(
      `Invalid phase transition: ${phase.status} → ${newStatus}. ` +
      `Valid transitions from "${phase.status}": ${validTransitions[phase.status]?.join(", ") || "none"}`
    );
  }

  phase.status = newStatus;
  phase.updated_at = new Date().toISOString();
  await fm.writeJson(paths.phasePath(milestoneId, phaseId), phase);
  return phase;
}
```

Register in the CLI router as `trigger phase advance <milestone> <phase> <status>`.

Update `skills/execute-phase/SKILL.md` Step 3:

```markdown
1. `trigger phase advance <m> <p> done`
```

---

### M3. Batch sign-off interaction with execute-task is unclear

**Problem:** `execute-phase` supports `batch_signoff: true` where tasks stop at `review_passed` and get one combined sign-off. But `execute-task` Step 5 says sign-off always waits. There's no instruction for execute-task to skip its own sign-off when batch mode is active.

**Files to modify:** `skills/execute-task/SKILL.md`

Add at the start of Step 5:

```markdown
## Step 5 — Sign-off

0. **Batch sign-off check:** Read the phase's `phase.json`. If `batch_signoff` is `true`, SKIP this step entirely. The task remains at `qa_passed`. The execute-phase orchestrator handles phase-level sign-off after all tasks reach `qa_passed`.

1. (Only if batch_signoff is false or absent) `trigger task advance <m> <p> <t> signoff`
...
```

---

### M4. Anti-AI-slop pass is mentioned but not wired

**Problem:** `trigger-model-tiering.mdc` says "After the Builder completes, run a lightweight deslop/humanizer pass." But no skill or agent actually performs this step.

**Decision point:** Is this worth implementing now, or should it be deferred?

**If implementing:** Add to `skills/execute-task/SKILL.md` between Builder completion and review:

```markdown
### 2c. Anti-slop pass (automatic)

After the Builder finishes and before advancing to `built`, scan all changed files for AI-generated patterns:
- Remove comments that merely restate what the code does (e.g., "// Import the module", "// Return the result")
- Remove unnecessary abstractions or wrappers that add no value
- Ensure naming matches existing codebase patterns

This is part of the Builder's work, not a separate role. The Builder agent definition (`agents/builder.md`) already instructs anti-slop behavior — this step verifies compliance.
```

**If deferring:** Remove the Anti-AI-Slop section from `rules/trigger-model-tiering.mdc` to avoid confusion. Add it to `IMPROVEMENT-BACKLOG.md` instead.

---

### M5. No `trigger task list` command

**Problem:** To see all tasks in a phase, the agent must read `phase.json` and then read each `task.json` individually.

**Files to create/modify:** Add to `scripts/trigger-cli/src/commands/task.ts`:

```typescript
export async function listTasks(
  projectRoot: string,
  milestoneId: string,
  phaseId: string,
): Promise<Array<{ id: string; name: string; status: string }>> {
  const paths = new TriggerPaths(projectRoot);
  const phase = await fm.readJson(
    paths.phasePath(milestoneId, phaseId),
    PhaseSchema,
  );

  const tasks = [];
  for (const taskId of phase.tasks) {
    try {
      const task = await fm.readJson(
        paths.taskPath(milestoneId, phaseId, taskId),
        TaskSchema,
      );
      tasks.push({ id: task.id, name: task.name, status: task.status });
    } catch {
      tasks.push({ id: taskId, name: "(unreadable)", status: "unknown" });
    }
  }
  return tasks;
}
```

Register as `trigger task list <milestone> <phase>`.

---

## Low Priority

### L1. Help skill is incomplete

**Problem:** The help skill only lists 6 commands. The routing table in `trigger-core.mdc` has 16.

**Files to modify:** `skills/help/SKILL.md`

Replace the body with a complete listing that mirrors the routing table:

```markdown
When the user says **trigger help** or **what can trigger do**:

**Getting started:**
- *trigger new project* — initialize a Trigger project with config, team, and planning docs
- *trigger status* / *trigger progress* — current position and next step

**Planning:**
- *trigger plan phase N* — research, task breakdown, review, and approval for phase N

**Building:**
- *trigger execute phase N* / *trigger build phase N* — full build-review pipeline for all tasks in a phase
- *trigger build task N* / *trigger execute task N* — single task pipeline
- *trigger quick fix* / *trigger quick task* — informal fix outside the pipeline

**Reviews:**
- *trigger review* / *trigger review this* — ad-hoc review of current changes
- *trigger sign off* / *approve this* — approve or request changes on the current task

**Session:**
- *trigger pause* / *save progress* — save state for later resumption
- *trigger resume* / *continue work* — restore context and pick up where you left off

**Configuration:**
- *trigger settings* — interactive config editor (trust, team, parallelism, verification)
- *trigger config* — view current config JSON

**Tooling:**
- *trigger research skills* — discover and recommend Agent Skills for this project
```

---

### L2. Task ID convention (`p{N}-t{M}`) is unenforceable and impractical

**Problem:** `plan-phase/SKILL.md` says task IDs must follow `p{N}-t{M}` but:
- The CLI accepts any string ID
- Descriptive IDs (e.g., `auth-foundation`, `api-client`) are clearer for both humans and agents
- Nobody follows the convention in practice

**Recommendation:** Drop the convention. Descriptive kebab-case slugs are better.

**Files to modify:** `skills/plan-phase/SKILL.md`

Replace:
```
**Task ID convention:** Task IDs must follow `p{N}-t{M}` — e.g. tasks for phase `p1` are `p1-t1`, `p1-t2`, `p1-t3`. This mirrors the phase naming convention and makes each task's parent phase self-evident.
```

With:
```
**Task ID convention:** Task IDs should be descriptive kebab-case slugs (e.g., `auth-foundation`, `api-client`, `cicd-pipeline`). Keep them short but meaningful — the task name provides the full description.
```

---

### L3. Git branching is asked about but not implemented

**Problem:** `init-project/SKILL.md` asks the user to choose a branching strategy (none, per_phase, per_task) but:
- There's no `branching` field in the config schema
- No skill creates or manages branches
- The CLI `init` command doesn't accept a `--branching` flag

**Option A — Remove the question (recommended for now):**

**Files to modify:** `skills/init-project/SKILL.md`

Remove the `git_branching` question from the AskQuestion block. Add a note: "Git branching integration is planned for a future version."

**Option B — Implement branching:**

This is a larger effort. Add `branching: { strategy: "none" | "per_phase" | "per_task" }` to the config schema, then add branch creation/merge logic to `execute-phase` and `execute-task`. Defer this to a separate improvement cycle.

---

### L4. Summary command could include review context

**Problem:** `trigger summary` returns milestone/phase/task status but not recent review verdicts, time since last activity, or artifact status. The resume skill would benefit from richer context.

**Files to modify:** `scripts/trigger-cli/src/commands/summary.ts`

Add to the `SummaryResult` interface and computation:

```typescript
// Add to SummaryResult:
recent_verdicts: Array<{ reviewer: string; verdict: string }>;
artifacts: { builder_report: boolean; review_summary: boolean; qa_verification: boolean };

// Populate from the active task's task.json and file existence checks
```

---

### L5. No rollback/reopen for completed tasks

**Problem:** The state machine has `done: []` — no valid transitions from done. If a task is incorrectly marked done or needs post-deployment fixes, there's no way to reopen it.

**Files to modify:** `scripts/trigger-cli/src/lib/state-machine.ts`

Change:
```typescript
done: [],
```

To:
```typescript
done: ["changes_requested"],
```

This allows `trigger task advance <m> <p> <t> changes_requested` on a done task, sending it back to the Builder. The history array preserves the full audit trail.

---

### L6. Reviewer scope boundaries not enforced

**Problem:** The code-reviewer agent says "Do not review: security, performance, accessibility, database, DevOps — other reviewers own these." But if those other reviewers aren't activated, nobody covers those areas. The code reviewer should note when it sees issues in those domains and flag that the specialist reviewer wasn't activated.

**Files to modify:** `agents/code-reviewer.md`

Add:

```markdown
## Cross-domain awareness

If you notice issues in security, performance, accessibility, database, or DevOps areas, note them in a separate section:

### Out-of-scope observations
| Area | Observation | Specialist reviewer needed |
|------|------------|---------------------------|

These are informational only — you do not provide verdicts on these areas. The orchestrator should verify that the corresponding specialist reviewer was activated for this task.
```

---

## Implementation Order

1. **C1** (qa_passed in skill) — pure docs fix, immediate impact
2. **H4 + H5** (artifact gates + in-session rule) — pure docs fix, prevents all missing-file issues
3. **M1** (trust matrix) — pure docs fix, resolves contradiction
4. **C2** (pipeline_stage sync) — small code change in task.ts
5. **H3** (validate artifacts) — code change in validate.ts
6. **H1 + H2** (reviewers list command + changed files) — new CLI command + schema change
7. **M2** (phase advance) — new CLI command
8. **M3** (batch sign-off) — docs fix
9. **M5** (task list) — new CLI command
10. **L1–L6** — polish items, do in any order

After all changes, rebuild the CLI (`npm run build` in `scripts/trigger-cli/`) and run `trigger validate` on an existing project to confirm nothing breaks.
