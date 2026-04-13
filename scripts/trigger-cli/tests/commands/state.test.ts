import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { getState, updateState } from "../../src/commands/state.js";
import { StateSchema } from "../../src/schemas/state.js";
import { FileManager } from "../../src/lib/file-manager.js";

describe("state commands", () => {
  let tmpDir: string;
  const fm = new FileManager();

  function writeState(state: unknown): Promise<void> {
    return fm.writeJson(path.join(tmpDir, ".trigger", "state.json"), state);
  }

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "trigger-state-"));
    await fs.mkdir(path.join(tmpDir, ".trigger"), { recursive: true });
    await writeState({
      active_milestone: null,
      active_phase: null,
      active_task: null,
      pipeline_stage: "idle",
      last_updated: "2025-01-01T00:00:00.000Z",
    });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe("getState", () => {
    it("reads current state", async () => {
      const state = await getState(tmpDir);

      expect(state.pipeline_stage).toBe("idle");
      expect(state.active_milestone).toBeNull();
      expect(state.active_phase).toBeNull();
      expect(state.active_task).toBeNull();
    });

    it("validates state through schema", async () => {
      await writeState({ pipeline_stage: "invalid_stage" });

      await expect(getState(tmpDir)).rejects.toThrow();
    });
  });

  describe("updateState", () => {
    it("updates active milestone", async () => {
      const updated = await updateState(tmpDir, {
        active_milestone: "v1.0",
      });

      expect(updated.active_milestone).toBe("v1.0");
      expect(updated.pipeline_stage).toBe("idle");
    });

    it("updates last_updated timestamp on every change", async () => {
      const before = await getState(tmpDir);
      const beforeTime = new Date(before.last_updated).getTime();

      await new Promise((r) => setTimeout(r, 10));

      const after = await updateState(tmpDir, { active_phase: "phase-1" });
      const afterTime = new Date(after.last_updated).getTime();

      expect(afterTime).toBeGreaterThan(beforeTime);
    });

    it("persists updates to disk", async () => {
      await updateState(tmpDir, { active_task: "task-1" });

      const fromDisk = await getState(tmpDir);
      expect(fromDisk.active_task).toBe("task-1");
    });

    it("preserves fields not included in updates", async () => {
      await updateState(tmpDir, { active_milestone: "v2.0" });
      const state = await updateState(tmpDir, { active_phase: "phase-2" });

      expect(state.active_milestone).toBe("v2.0");
      expect(state.active_phase).toBe("phase-2");
    });
  });
});
