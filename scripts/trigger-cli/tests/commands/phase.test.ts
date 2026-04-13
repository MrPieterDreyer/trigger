import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createPhase, listPhases, getPhaseStatus } from "../../src/commands/phase.js";
import { createMilestone, getMilestoneStatus } from "../../src/commands/milestone.js";
import { initProject } from "../../src/commands/init.js";
import { getState } from "../../src/commands/state.js";
import { PhaseSchema } from "../../src/schemas/phase.js";

describe("phase commands", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "trigger-phase-"));
    await initProject(tmpDir, { name: "test-project" });
    await createMilestone(tmpDir, { id: "v1", name: "Version 1.0" });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe("createPhase", () => {
    it("creates phase directory and phase.json", async () => {
      const phase = await createPhase(tmpDir, "v1", {
        id: "p1",
        name: "Foundation",
      });

      expect(phase.id).toBe("p1");
      expect(phase.name).toBe("Foundation");
      expect(phase.status).toBe("planned");
      expect(phase.tasks).toEqual([]);

      const phaseDir = path.join(
        tmpDir, ".planning", "milestones", "v1", "phases", "p1",
      );
      const stat = await fs.stat(phaseDir);
      expect(stat.isDirectory()).toBe(true);

      const tasksDir = path.join(phaseDir, "tasks");
      expect((await fs.stat(tasksDir)).isDirectory()).toBe(true);

      const researchDir = path.join(phaseDir, "research");
      expect((await fs.stat(researchDir)).isDirectory()).toBe(true);

      const raw = await fs.readFile(path.join(phaseDir, "phase.json"), "utf-8");
      const parsed = PhaseSchema.parse(JSON.parse(raw));
      expect(parsed.id).toBe("p1");
    });

    it("adds phase ID to parent milestone's phases array", async () => {
      await createPhase(tmpDir, "v1", { id: "p1", name: "Foundation" });
      await createPhase(tmpDir, "v1", { id: "p2", name: "Features" });

      const milestone = await getMilestoneStatus(tmpDir, "v1");
      expect(milestone.phases).toContain("p1");
      expect(milestone.phases).toContain("p2");
    });

    it("updates state if no active phase", async () => {
      await createPhase(tmpDir, "v1", { id: "p1", name: "Foundation" });

      const state = await getState(tmpDir);
      expect(state.active_phase).toBe("p1");
    });

    it("does not overwrite active phase if one is already set", async () => {
      await createPhase(tmpDir, "v1", { id: "p1", name: "Foundation" });
      await createPhase(tmpDir, "v1", { id: "p2", name: "Features" });

      const state = await getState(tmpDir);
      expect(state.active_phase).toBe("p1");
    });

    it("stores domains correctly", async () => {
      const phase = await createPhase(tmpDir, "v1", {
        id: "p1",
        name: "Foundation",
        domains: ["backend", "database"],
      });

      expect(phase.domains).toEqual(["backend", "database"]);
    });

    it("stores team overrides correctly", async () => {
      const phase = await createPhase(tmpDir, "v1", {
        id: "p1",
        name: "Foundation",
        team_overrides: {
          builder: { model: "expensive" },
        },
      });

      expect(phase.team_overrides).toEqual({
        builder: { model: "expensive" },
      });
    });
  });

  describe("listPhases", () => {
    it("lists phases under a milestone", async () => {
      await createPhase(tmpDir, "v1", { id: "p1", name: "Foundation" });
      await createPhase(tmpDir, "v1", { id: "p2", name: "Features" });

      const phases = await listPhases(tmpDir, "v1");
      expect(phases).toHaveLength(2);

      const ids = phases.map((p) => p.id).sort();
      expect(ids).toEqual(["p1", "p2"]);
    });

    it("returns empty array when no phases exist", async () => {
      const phases = await listPhases(tmpDir, "v1");
      expect(phases).toEqual([]);
    });
  });

  describe("getPhaseStatus", () => {
    it("reads and returns a single phase", async () => {
      await createPhase(tmpDir, "v1", {
        id: "p1",
        name: "Foundation",
        description: "Core setup",
      });

      const phase = await getPhaseStatus(tmpDir, "v1", "p1");
      expect(phase.id).toBe("p1");
      expect(phase.name).toBe("Foundation");
      expect(phase.description).toBe("Core setup");
    });

    it("throws for non-existent phase", async () => {
      await expect(
        getPhaseStatus(tmpDir, "v1", "nonexistent"),
      ).rejects.toThrow();
    });
  });
});
