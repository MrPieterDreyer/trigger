import { describe, it, expect } from "vitest";
import path from "node:path";
import { TriggerPaths } from "../../src/lib/paths.js";

describe("TriggerPaths", () => {
  const root = "/project";
  const paths = new TriggerPaths(root);

  describe("root paths", () => {
    it("resolves planningRoot", () => {
      expect(paths.planningRoot).toBe(path.join(root, ".planning"));
    });

    it("resolves configPath", () => {
      expect(paths.configPath).toBe(
        path.join(root, ".planning", "trigger.json"),
      );
    });

    it("resolves statePath", () => {
      expect(paths.statePath).toBe(
        path.join(root, ".planning", "state.json"),
      );
    });
  });

  describe("milestone paths", () => {
    const milestoneId = "m1-mvp";

    it("resolves milestonesDir", () => {
      expect(paths.milestonesDir()).toBe(
        path.join(root, ".planning", "milestones"),
      );
    });

    it("resolves milestoneDir", () => {
      expect(paths.milestoneDir(milestoneId)).toBe(
        path.join(root, ".planning", "milestones", milestoneId),
      );
    });

    it("resolves milestonePath", () => {
      expect(paths.milestonePath(milestoneId)).toBe(
        path.join(root, ".planning", "milestones", milestoneId, "milestone.json"),
      );
    });

    it("resolves roadmapPath", () => {
      expect(paths.roadmapPath(milestoneId)).toBe(
        path.join(root, ".planning", "milestones", milestoneId, "ROADMAP.md"),
      );
    });
  });

  describe("phase paths", () => {
    const milestoneId = "m1-mvp";
    const phaseId = "p01-api";

    it("resolves phasesDir", () => {
      expect(paths.phasesDir(milestoneId)).toBe(
        path.join(root, ".planning", "milestones", milestoneId, "phases"),
      );
    });

    it("resolves phaseDir", () => {
      expect(paths.phaseDir(milestoneId, phaseId)).toBe(
        path.join(root, ".planning", "milestones", milestoneId, "phases", phaseId),
      );
    });

    it("resolves phasePath", () => {
      expect(paths.phasePath(milestoneId, phaseId)).toBe(
        path.join(
          root, ".planning", "milestones", milestoneId,
          "phases", phaseId, "phase.json",
        ),
      );
    });

    it("resolves researchDir", () => {
      expect(paths.researchDir(milestoneId, phaseId)).toBe(
        path.join(
          root, ".planning", "milestones", milestoneId,
          "phases", phaseId, "research",
        ),
      );
    });

    it("resolves phaseSummaryPath", () => {
      expect(paths.phaseSummaryPath(milestoneId, phaseId)).toBe(
        path.join(
          root, ".planning", "milestones", milestoneId,
          "phases", phaseId, "phase-summary.json",
        ),
      );
    });
  });

  describe("task paths", () => {
    const milestoneId = "m1-mvp";
    const phaseId = "p01-api";
    const taskId = "t01-auth";

    it("resolves tasksDir", () => {
      expect(paths.tasksDir(milestoneId, phaseId)).toBe(
        path.join(
          root, ".planning", "milestones", milestoneId,
          "phases", phaseId, "tasks",
        ),
      );
    });

    it("resolves taskDir", () => {
      expect(paths.taskDir(milestoneId, phaseId, taskId)).toBe(
        path.join(
          root, ".planning", "milestones", milestoneId,
          "phases", phaseId, "tasks", taskId,
        ),
      );
    });

    it("resolves taskPath", () => {
      expect(paths.taskPath(milestoneId, phaseId, taskId)).toBe(
        path.join(
          root, ".planning", "milestones", milestoneId,
          "phases", phaseId, "tasks", taskId, "task.json",
        ),
      );
    });

    it("resolves planPath", () => {
      expect(paths.planPath(milestoneId, phaseId, taskId)).toBe(
        path.join(
          root, ".planning", "milestones", milestoneId,
          "phases", phaseId, "tasks", taskId, "PLAN.md",
        ),
      );
    });

    it("resolves builderReportPath", () => {
      expect(paths.builderReportPath(milestoneId, phaseId, taskId)).toBe(
        path.join(
          root, ".planning", "milestones", milestoneId,
          "phases", phaseId, "tasks", taskId, "BUILDER-REPORT.md",
        ),
      );
    });

    it("resolves signoffPath", () => {
      expect(paths.signoffPath(milestoneId, phaseId, taskId)).toBe(
        path.join(
          root, ".planning", "milestones", milestoneId,
          "phases", phaseId, "tasks", taskId, "SIGNOFF.md",
        ),
      );
    });
  });

  describe("review paths", () => {
    const milestoneId = "m1-mvp";
    const phaseId = "p01-api";
    const taskId = "t01-auth";

    it("resolves reviewsDir", () => {
      expect(paths.reviewsDir(milestoneId, phaseId, taskId)).toBe(
        path.join(
          root, ".planning", "milestones", milestoneId,
          "phases", phaseId, "tasks", taskId, "reviews",
        ),
      );
    });

    it("resolves reviewSummaryPath", () => {
      expect(paths.reviewSummaryPath(milestoneId, phaseId, taskId)).toBe(
        path.join(
          root, ".planning", "milestones", milestoneId,
          "phases", phaseId, "tasks", taskId, "reviews", "review-summary.json",
        ),
      );
    });
  });

  describe("stores projectRoot as-is", () => {
    it("preserves the original project root", () => {
      expect(paths.projectRoot).toBe(root);
    });
  });
});
