import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createMilestone, listMilestones, getMilestoneStatus } from "../../src/commands/milestone.js";
import { initProject } from "../../src/commands/init.js";
import { getState } from "../../src/commands/state.js";
import { MilestoneSchema } from "../../src/schemas/milestone.js";

describe("milestone commands", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "trigger-milestone-"));
    await initProject(tmpDir, { name: "test-project" });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe("createMilestone", () => {
    it("creates milestone directory and milestone.json", async () => {
      const milestone = await createMilestone(tmpDir, {
        id: "v1",
        name: "Version 1.0",
      });

      expect(milestone.id).toBe("v1");
      expect(milestone.name).toBe("Version 1.0");
      expect(milestone.status).toBe("planned");
      expect(milestone.phases).toEqual([]);

      const msDir = path.join(tmpDir, ".trigger", "milestones", "v1");
      const stat = await fs.stat(msDir);
      expect(stat.isDirectory()).toBe(true);

      const phasesDir = path.join(msDir, "phases");
      const phasesStat = await fs.stat(phasesDir);
      expect(phasesStat.isDirectory()).toBe(true);

      const raw = await fs.readFile(path.join(msDir, "milestone.json"), "utf-8");
      const parsed = MilestoneSchema.parse(JSON.parse(raw));
      expect(parsed.id).toBe("v1");
    });

    it("sets active milestone in state if none active", async () => {
      await createMilestone(tmpDir, { id: "v1", name: "Version 1.0" });

      const state = await getState(tmpDir);
      expect(state.active_milestone).toBe("v1");
    });

    it("does not overwrite active milestone if one is already active", async () => {
      await createMilestone(tmpDir, { id: "v1", name: "Version 1.0" });
      await createMilestone(tmpDir, { id: "v2", name: "Version 2.0" });

      const state = await getState(tmpDir);
      expect(state.active_milestone).toBe("v1");
    });

    it("rejects duplicate milestone IDs", async () => {
      await createMilestone(tmpDir, { id: "v1", name: "Version 1.0" });

      await expect(
        createMilestone(tmpDir, { id: "v1", name: "Duplicate" }),
      ).rejects.toThrow(/already exists/i);
    });

    it("stores optional fields", async () => {
      const milestone = await createMilestone(tmpDir, {
        id: "v1",
        name: "Version 1.0",
        description: "First release",
        git_branching: "per_phase",
      });

      expect(milestone.description).toBe("First release");
      expect(milestone.git_branching).toBe("per_phase");
    });
  });

  describe("listMilestones", () => {
    it("lists multiple milestones", async () => {
      await createMilestone(tmpDir, { id: "v1", name: "Version 1.0" });
      await createMilestone(tmpDir, { id: "v2", name: "Version 2.0" });

      const milestones = await listMilestones(tmpDir);
      expect(milestones).toHaveLength(2);

      const ids = milestones.map((m) => m.id).sort();
      expect(ids).toEqual(["v1", "v2"]);
    });

    it("returns empty array when no milestones exist", async () => {
      const milestones = await listMilestones(tmpDir);
      expect(milestones).toEqual([]);
    });
  });

  describe("getMilestoneStatus", () => {
    it("reads and returns a single milestone", async () => {
      await createMilestone(tmpDir, {
        id: "v1",
        name: "Version 1.0",
        description: "Test",
      });

      const milestone = await getMilestoneStatus(tmpDir, "v1");
      expect(milestone.id).toBe("v1");
      expect(milestone.name).toBe("Version 1.0");
      expect(milestone.description).toBe("Test");
    });

    it("throws for non-existent milestone", async () => {
      await expect(
        getMilestoneStatus(tmpDir, "nonexistent"),
      ).rejects.toThrow();
    });
  });
});
