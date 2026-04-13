import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createTask, advanceTask, getTaskStatus } from "../../src/commands/task.js";
import { createPhase, getPhaseStatus } from "../../src/commands/phase.js";
import { createMilestone } from "../../src/commands/milestone.js";
import { initProject } from "../../src/commands/init.js";
import { TaskSchema } from "../../src/schemas/task.js";

describe("task commands", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "trigger-task-"));
    await initProject(tmpDir, { name: "test-project" });
    await createMilestone(tmpDir, { id: "v1", name: "Version 1.0" });
    await createPhase(tmpDir, "v1", { id: "p1", name: "Foundation" });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe("createTask", () => {
    it("creates task directory and task.json", async () => {
      const task = await createTask(tmpDir, "v1", "p1", {
        id: "t1",
        name: "Setup project",
      });

      expect(task.id).toBe("t1");
      expect(task.name).toBe("Setup project");
      expect(task.status).toBe("planned");
      expect(task.history).toEqual([]);

      const taskDir = path.join(
        tmpDir, ".trigger", "milestones", "v1", "phases", "p1", "tasks", "t1",
      );
      const stat = await fs.stat(taskDir);
      expect(stat.isDirectory()).toBe(true);

      const reviewsDir = path.join(taskDir, "reviews");
      expect((await fs.stat(reviewsDir)).isDirectory()).toBe(true);

      const raw = await fs.readFile(path.join(taskDir, "task.json"), "utf-8");
      const parsed = TaskSchema.parse(JSON.parse(raw));
      expect(parsed.id).toBe("t1");
    });

    it("adds task ID to parent phase's tasks array", async () => {
      await createTask(tmpDir, "v1", "p1", { id: "t1", name: "Task 1" });
      await createTask(tmpDir, "v1", "p1", { id: "t2", name: "Task 2" });

      const phase = await getPhaseStatus(tmpDir, "v1", "p1");
      expect(phase.tasks).toContain("t1");
      expect(phase.tasks).toContain("t2");
    });

    it("stores acceptance criteria and domains", async () => {
      const task = await createTask(tmpDir, "v1", "p1", {
        id: "t1",
        name: "Task 1",
        acceptance_criteria: ["Must pass tests", "Must compile"],
        domains: ["backend"],
        test_requirements: ["unit tests"],
      });

      expect(task.acceptance_criteria).toEqual(["Must pass tests", "Must compile"]);
      expect(task.domains).toEqual(["backend"]);
      expect(task.test_requirements).toEqual(["unit tests"]);
    });

    it("stores parallel_group when provided", async () => {
      const task = await createTask(tmpDir, "v1", "p1", {
        id: "t1",
        name: "Task 1",
        parallel_group: "group-a",
      });

      expect(task.parallel_group).toBe("group-a");
    });

    it("omits parallel_group when not provided", async () => {
      const task = await createTask(tmpDir, "v1", "p1", {
        id: "t1",
        name: "Task 1",
      });

      expect(task.parallel_group).toBeUndefined();
    });
  });

  describe("advanceTask", () => {
    it("succeeds with valid transition and records history", async () => {
      await createTask(tmpDir, "v1", "p1", { id: "t1", name: "Task 1" });

      const task = await advanceTask(tmpDir, "v1", "p1", "t1", "building");

      expect(task.status).toBe("building");
      expect(task.history).toHaveLength(1);
      expect(task.history[0].from).toBe("planned");
      expect(task.history[0].to).toBe("building");
    });

    it("throws on invalid transition", async () => {
      await createTask(tmpDir, "v1", "p1", { id: "t1", name: "Task 1" });

      await expect(
        advanceTask(tmpDir, "v1", "p1", "t1", "done"),
      ).rejects.toThrow(/invalid transition/i);
    });

    it("records multiple transitions in history", async () => {
      await createTask(tmpDir, "v1", "p1", { id: "t1", name: "Task 1" });

      await advanceTask(tmpDir, "v1", "p1", "t1", "building");
      await advanceTask(tmpDir, "v1", "p1", "t1", "built");
      const task = await advanceTask(tmpDir, "v1", "p1", "t1", "reviewing");

      expect(task.history).toHaveLength(3);
      expect(task.history[0].from).toBe("planned");
      expect(task.history[0].to).toBe("building");
      expect(task.history[1].from).toBe("building");
      expect(task.history[1].to).toBe("built");
      expect(task.history[2].from).toBe("built");
      expect(task.history[2].to).toBe("reviewing");
    });

    it("history entries include timestamps", async () => {
      await createTask(tmpDir, "v1", "p1", { id: "t1", name: "Task 1" });

      const task = await advanceTask(tmpDir, "v1", "p1", "t1", "building");

      expect(task.history[0].at).toBeDefined();
      expect(new Date(task.history[0].at).getTime()).not.toBeNaN();
    });
  });

  describe("getTaskStatus", () => {
    it("reads and returns a single task", async () => {
      await createTask(tmpDir, "v1", "p1", {
        id: "t1",
        name: "Task 1",
        description: "Do something",
      });

      const task = await getTaskStatus(tmpDir, "v1", "p1", "t1");
      expect(task.id).toBe("t1");
      expect(task.name).toBe("Task 1");
      expect(task.description).toBe("Do something");
    });

    it("throws for non-existent task", async () => {
      await expect(
        getTaskStatus(tmpDir, "v1", "p1", "nonexistent"),
      ).rejects.toThrow();
    });
  });
});
