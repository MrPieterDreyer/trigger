import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { getConfig, updateConfig, upgradeConfig } from "../../src/commands/config.js";
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

  describe("upgradeConfig", () => {
    it("adds missing guardian section with defaults", async () => {
      const result = await upgradeConfig(tmpDir);

      expect(result.added_sections).toContain("guardian");
      expect(result.config.guardian.auto_review).toBe(true);
      expect(result.config.guardian.smart_escalation).toBe(true);
      expect(result.config.guardian.review_threshold_files).toBe(3);
      expect(result.config.guardian.review_threshold_lines).toBe(50);
      expect(result.config.guardian.skip_patterns).toEqual(["*.md", "*.json", ".trigger/**"]);
    });

    it("adds missing parallelism section with defaults", async () => {
      const result = await upgradeConfig(tmpDir);

      expect(result.added_sections).toContain("parallelism");
      expect(result.config.parallelism.reviews).toBe(true);
      expect(result.config.parallelism.tasks).toBe(true);
      expect(result.config.parallelism.max_concurrent_tasks).toBe(3);
    });

    it("reports all missing sections", async () => {
      const result = await upgradeConfig(tmpDir);

      expect(result.added_sections).toContain("guardian");
      expect(result.added_sections).toContain("parallelism");
      expect(result.added_sections).toContain("reports");
    });

    it("preserves existing values when adding new sections", async () => {
      await writeConfig({
        project: { name: "my-app", type: "python", trust_level: "autonomous", description: "My app" },
        verification: { commands: [{ name: "test", command: "pytest", required: true }] },
      });

      const result = await upgradeConfig(tmpDir);

      expect(result.config.project.name).toBe("my-app");
      expect(result.config.project.type).toBe("python");
      expect(result.config.project.trust_level).toBe("autonomous");
      expect(result.config.project.description).toBe("My app");
      expect(result.config.verification.commands).toHaveLength(1);
      expect(result.config.verification.commands[0].command).toBe("pytest");
    });

    it("is idempotent — second run reports no changes", async () => {
      await upgradeConfig(tmpDir);
      const second = await upgradeConfig(tmpDir);

      expect(second.added_sections).toEqual([]);
    });

    it("persists upgraded config to disk", async () => {
      await upgradeConfig(tmpDir);

      const raw = JSON.parse(
        await fs.readFile(path.join(tmpDir, ".trigger", "trigger.json"), "utf-8"),
      );
      expect(raw.guardian).toBeDefined();
      expect(raw.guardian.auto_review).toBe(true);
      expect(raw.parallelism).toBeDefined();
      expect(raw.reports).toBeDefined();
    });

    it("does not add sections that already exist", async () => {
      await writeConfig({
        project: { name: "test-app", type: "node" },
        guardian: { auto_review: false, smart_escalation: false, review_threshold_files: 10, review_threshold_lines: 200, skip_patterns: ["*.test.ts"] },
      });

      const result = await upgradeConfig(tmpDir);

      expect(result.added_sections).not.toContain("guardian");
      expect(result.config.guardian.auto_review).toBe(false);
      expect(result.config.guardian.review_threshold_files).toBe(10);
      expect(result.config.guardian.skip_patterns).toEqual(["*.test.ts"]);
    });
  });
});
