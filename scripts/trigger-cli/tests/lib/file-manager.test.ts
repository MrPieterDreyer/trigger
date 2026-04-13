import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { z } from "zod";
import { FileManager } from "../../src/lib/file-manager.js";
import { TriggerConfigSchema } from "../../src/schemas/trigger-config.js";

describe("FileManager", () => {
  let tmpDir: string;
  let fm: FileManager;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "trigger-fm-"));
    fm = new FileManager();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe("writeJson / readJson", () => {
    it("writes and reads validated JSON", async () => {
      const filePath = path.join(tmpDir, "config.json");
      const data = {
        project: { name: "test-app", type: "node" },
      };

      await fm.writeJson(filePath, data);
      const result = await fm.readJson(filePath, TriggerConfigSchema);

      expect(result.project.name).toBe("test-app");
      expect(result.project.type).toBe("node");
      expect(result.project.trust_level).toBe("balanced");
    });

    it("creates parent directories automatically", async () => {
      const filePath = path.join(tmpDir, "deep", "nested", "dir", "data.json");
      const schema = z.object({ value: z.number() });

      await fm.writeJson(filePath, { value: 42 });
      const result = await fm.readJson(filePath, schema);

      expect(result.value).toBe(42);
    });

    it("throws on invalid JSON against schema", async () => {
      const filePath = path.join(tmpDir, "bad.json");
      const schema = z.object({ required_field: z.string() });

      await fm.writeJson(filePath, { wrong_field: 123 });

      await expect(fm.readJson(filePath, schema)).rejects.toThrow();
    });

    it("writes JSON with 2-space indentation and trailing newline", async () => {
      const filePath = path.join(tmpDir, "formatted.json");
      await fm.writeJson(filePath, { a: 1 });

      const raw = await fs.readFile(filePath, "utf-8");
      expect(raw).toBe('{\n  "a": 1\n}\n');
    });

    it("throws when reading a non-existent file", async () => {
      const schema = z.object({ x: z.string() });
      await expect(
        fm.readJson(path.join(tmpDir, "missing.json"), schema),
      ).rejects.toThrow();
    });
  });

  describe("writeMarkdown / readMarkdown", () => {
    it("writes and reads markdown content", async () => {
      const filePath = path.join(tmpDir, "doc.md");
      const content = "# Hello\n\nSome content here.\n";

      await fm.writeMarkdown(filePath, content);
      const result = await fm.readMarkdown(filePath);

      expect(result).toBe(content);
    });

    it("creates parent directories for markdown files", async () => {
      const filePath = path.join(tmpDir, "a", "b", "README.md");
      await fm.writeMarkdown(filePath, "# Title\n");
      const result = await fm.readMarkdown(filePath);
      expect(result).toBe("# Title\n");
    });

    it("throws when reading a non-existent markdown file", async () => {
      await expect(
        fm.readMarkdown(path.join(tmpDir, "nope.md")),
      ).rejects.toThrow();
    });
  });

  describe("exists", () => {
    it("returns true for an existing file", async () => {
      const filePath = path.join(tmpDir, "exists.txt");
      await fs.writeFile(filePath, "hi");
      expect(await fm.exists(filePath)).toBe(true);
    });

    it("returns false for a non-existent file", async () => {
      expect(await fm.exists(path.join(tmpDir, "ghost.txt"))).toBe(false);
    });
  });

  describe("ensureDir", () => {
    it("creates a directory that does not exist", async () => {
      const dirPath = path.join(tmpDir, "new-dir", "sub-dir");
      await fm.ensureDir(dirPath);

      const stat = await fs.stat(dirPath);
      expect(stat.isDirectory()).toBe(true);
    });

    it("does not throw if directory already exists", async () => {
      const dirPath = path.join(tmpDir, "already");
      await fs.mkdir(dirPath);

      await expect(fm.ensureDir(dirPath)).resolves.toBeUndefined();
    });
  });
});
