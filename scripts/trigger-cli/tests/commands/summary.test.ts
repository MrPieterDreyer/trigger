import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { getSummary } from "../../src/commands/summary.js";
import { initProject } from "../../src/commands/init.js";
import { createMilestone } from "../../src/commands/milestone.js";
import { createPhase } from "../../src/commands/phase.js";
import { createTask, advanceTask } from "../../src/commands/task.js";
import { updateState } from "../../src/commands/state.js";
import { FileManager } from "../../src/lib/file-manager.js";
import { TriggerPaths } from "../../src/lib/paths.js";

describe("getSummary", () => {
  let tmpDir: string;
  const fm = new FileManager();

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "trigger-summary-"));
    await initProject(tmpDir, { name: "test-project" });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("returns basic project info with no milestone", async () => {
    const summary = await getSummary(tmpDir);

    expect(summary.project).toBe("test-project");
    expect(summary.trust).toBe("balanced");
    expect(summary.pipeline).toBe("idle");
    expect(summary.milestone).toBeNull();
    expect(summary.phase).toBeNull();
    expect(summary.task).toBeNull();
    expect(summary.recent_verdicts).toEqual([]);
    expect(summary.artifacts).toEqual({
      builder_report: false,
      review_summary: false,
      qa_verification: false,
    });
  });

  it("includes milestone info when active", async () => {
    await createMilestone(tmpDir, { id: "v1", name: "MVP" });
    await updateState(tmpDir, { active_milestone: "v1" });

    const summary = await getSummary(tmpDir);

    expect(summary.milestone).not.toBeNull();
    expect(summary.milestone!.id).toBe("v1");
    expect(summary.milestone!.name).toBe("MVP");
    expect(summary.milestone!.phases_total).toBe(0);
  });

  it("includes phase info when active", async () => {
    await createMilestone(tmpDir, { id: "v1", name: "MVP" });
    await createPhase(tmpDir, "v1", { id: "p1", name: "Foundation" });
    await updateState(tmpDir, { active_milestone: "v1", active_phase: "p1" });

    const summary = await getSummary(tmpDir);

    expect(summary.phase).not.toBeNull();
    expect(summary.phase!.id).toBe("p1");
    expect(summary.phase!.name).toBe("Foundation");
    expect(summary.phase!.tasks_total).toBe(0);
  });

  it("includes task info and artifact status when active", async () => {
    await createMilestone(tmpDir, { id: "v1", name: "MVP" });
    await createPhase(tmpDir, "v1", { id: "p1", name: "Foundation" });
    await createTask(tmpDir, "v1", "p1", { id: "t1", name: "Setup" });
    await updateState(tmpDir, {
      active_milestone: "v1",
      active_phase: "p1",
      active_task: "t1",
    });

    const summary = await getSummary(tmpDir);

    expect(summary.task).not.toBeNull();
    expect(summary.task!.id).toBe("t1");
    expect(summary.task!.status).toBe("planned");
    expect(summary.artifacts.builder_report).toBe(false);
  });

  it("detects builder report artifact", async () => {
    await createMilestone(tmpDir, { id: "v1", name: "MVP" });
    await createPhase(tmpDir, "v1", { id: "p1", name: "Foundation" });
    await createTask(tmpDir, "v1", "p1", { id: "t1", name: "Setup" });
    await updateState(tmpDir, {
      active_milestone: "v1",
      active_phase: "p1",
      active_task: "t1",
    });

    const paths = new TriggerPaths(tmpDir);
    await fm.writeMarkdown(
      paths.builderReportPath("v1", "p1", "t1"),
      "# Builder Report\nDone.",
    );

    const summary = await getSummary(tmpDir);
    expect(summary.artifacts.builder_report).toBe(true);
  });

  it("returns parallelism and guardian config", async () => {
    const summary = await getSummary(tmpDir);

    expect(summary.parallelism.reviews).toBe(true);
    expect(summary.parallelism.tasks).toBe(true);
    expect(summary.guardian.auto_review).toBe(true);
    expect(summary.guardian.smart_escalation).toBe(true);
  });
});
