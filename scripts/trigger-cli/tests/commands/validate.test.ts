import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { validateProject, type ValidationResult } from "../../src/commands/validate.js";
import { initProject } from "../../src/commands/init.js";
import { createMilestone } from "../../src/commands/milestone.js";
import { createPhase } from "../../src/commands/phase.js";
import { createTask } from "../../src/commands/task.js";
import { updateState } from "../../src/commands/state.js";

describe("validateProject", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "trigger-validate-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("valid project returns { valid: true, errors: [] }", async () => {
    await initProject(tmpDir, { name: "good-project" });
    await createMilestone(tmpDir, { id: "v1", name: "Version 1.0" });
    await createPhase(tmpDir, "v1", { id: "p1", name: "Foundation" });
    await createTask(tmpDir, "v1", "p1", { id: "t1", name: "Task 1" });

    const result = await validateProject(tmpDir);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("missing .trigger returns error", async () => {
    const result = await validateProject(tmpDir);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => /\.trigger/i.test(e))).toBe(true);
  });

  it("invalid trigger.json returns schema errors", async () => {
    await fs.mkdir(path.join(tmpDir, ".trigger"), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, ".trigger", "trigger.json"),
      JSON.stringify({ invalid: true }),
    );
    await fs.writeFile(
      path.join(tmpDir, ".trigger", "state.json"),
      JSON.stringify({
        active_milestone: null,
        active_phase: null,
        active_task: null,
        pipeline_stage: "idle",
        last_updated: new Date().toISOString(),
      }),
    );

    const result = await validateProject(tmpDir);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /trigger\.json/i.test(e))).toBe(true);
  });

  it("orphaned state references (milestone doesn't exist) returns error", async () => {
    await initProject(tmpDir, { name: "orphan-project" });
    await updateState(tmpDir, { active_milestone: "nonexistent" });

    const result = await validateProject(tmpDir);

    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => /nonexistent/i.test(e) && /milestone/i.test(e)),
    ).toBe(true);
  });

  it("orphaned phase reference returns error", async () => {
    await initProject(tmpDir, { name: "orphan-phase" });
    await createMilestone(tmpDir, { id: "v1", name: "Version 1.0" });
    await updateState(tmpDir, {
      active_milestone: "v1",
      active_phase: "nonexistent",
    });

    const result = await validateProject(tmpDir);

    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => /nonexistent/i.test(e) && /phase/i.test(e)),
    ).toBe(true);
  });

  it("orphaned task reference returns error", async () => {
    await initProject(tmpDir, { name: "orphan-task" });
    await createMilestone(tmpDir, { id: "v1", name: "Version 1.0" });
    await createPhase(tmpDir, "v1", { id: "p1", name: "Foundation" });
    await updateState(tmpDir, {
      active_milestone: "v1",
      active_phase: "p1",
      active_task: "nonexistent",
    });

    const result = await validateProject(tmpDir);

    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => /nonexistent/i.test(e) && /task/i.test(e)),
    ).toBe(true);
  });
});
