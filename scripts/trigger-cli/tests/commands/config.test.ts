import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { getConfig, updateConfig } from "../../src/commands/config.js";
import { TriggerConfigSchema } from "../../src/schemas/trigger-config.js";
import { FileManager } from "../../src/lib/file-manager.js";

describe("config commands", () => {
  let tmpDir: string;
  const fm = new FileManager();

  function writeConfig(config: unknown): Promise<void> {
    return fm.writeJson(
      path.join(tmpDir, ".trigger", "trigger.json"),
      config,
    );
  }

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "trigger-config-"));
    await fs.mkdir(path.join(tmpDir, ".trigger"), { recursive: true });
    await writeConfig({
      project: { name: "test-app", type: "node" },
    });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe("getConfig", () => {
    it("reads current config", async () => {
      const config = await getConfig(tmpDir);

      expect(config.project.name).toBe("test-app");
      expect(config.project.type).toBe("node");
      expect(config.project.trust_level).toBe("balanced");
    });

    it("validates config through schema", async () => {
      await fm.writeJson(path.join(tmpDir, ".trigger", "trigger.json"), {
        project: { name: 123 },
      });

      await expect(getConfig(tmpDir)).rejects.toThrow();
    });
  });

  describe("updateConfig", () => {
    it("updates trust level", async () => {
      const updated = await updateConfig(tmpDir, {
        project: { trust_level: "autonomous" },
      });

      expect(updated.project.trust_level).toBe("autonomous");
      expect(updated.project.name).toBe("test-app");
    });

    it("deep merges nested objects", async () => {
      const updated = await updateConfig(tmpDir, {
        escalation: { max_builder_retries: 5 },
      });

      expect(updated.escalation.max_builder_retries).toBe(5);
      expect(updated.escalation.max_review_cycles).toBe(3);
      expect(updated.escalation.escalate_to_expensive).toBe(true);
    });

    it("rejects invalid config updates", async () => {
      await expect(
        updateConfig(tmpDir, {
          project: { trust_level: "yolo" },
        }),
      ).rejects.toThrow();
    });

    it("persists updates to disk", async () => {
      await updateConfig(tmpDir, {
        project: { description: "Updated desc" },
      });

      const fromDisk = await getConfig(tmpDir);
      expect(fromDisk.project.description).toBe("Updated desc");
    });

    it("overwrites arrays instead of merging", async () => {
      const cmds = [{ name: "test", command: "jest", required: true }];
      const updated = await updateConfig(tmpDir, {
        verification: { commands: cmds },
      });

      expect(updated.verification.commands).toEqual(cmds);
    });
  });
});
