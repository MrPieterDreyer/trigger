import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { initProject } from "../../src/commands/init.js";
import { TriggerConfigSchema } from "../../src/schemas/trigger-config.js";
import { StateSchema } from "../../src/schemas/state.js";

describe("initProject", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "trigger-init-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("creates .trigger directory structure", async () => {
    await initProject(tmpDir, { name: "my-app" });

    const stat = await fs.stat(path.join(tmpDir, ".trigger"));
    expect(stat.isDirectory()).toBe(true);
  });

  it("generates trigger.json with detected project type", async () => {
    await fs.writeFile(path.join(tmpDir, "package.json"), "{}");

    const { config } = await initProject(tmpDir, { name: "node-app" });
    const parsed = TriggerConfigSchema.parse(config);

    expect(parsed.project.name).toBe("node-app");
    expect(parsed.project.type).toBe("node");
    expect(parsed.project.trust_level).toBe("balanced");
  });

  it("generates state.json in idle state", async () => {
    const result = await initProject(tmpDir, { name: "test-app" });

    const raw = await fs.readFile(
      path.join(tmpDir, ".trigger", "state.json"),
      "utf-8",
    );
    const state = StateSchema.parse(JSON.parse(raw));

    expect(state.pipeline_stage).toBe("idle");
    expect(state.active_milestone).toBeNull();
    expect(state.active_phase).toBeNull();
    expect(state.active_task).toBeNull();
    expect(result.detection).toBeDefined();
  });

  it("refuses to init if .trigger already exists", async () => {
    await fs.mkdir(path.join(tmpDir, ".trigger"));

    await expect(
      initProject(tmpDir, { name: "dupe" }),
    ).rejects.toThrow("Project already initialized");
  });

  it("uses provided trust_level", async () => {
    const { config } = await initProject(tmpDir, {
      name: "secure-app",
      trust_level: "supervised",
    });
    const parsed = TriggerConfigSchema.parse(config);

    expect(parsed.project.trust_level).toBe("supervised");
  });

  it("includes description when provided", async () => {
    const { config } = await initProject(tmpDir, {
      name: "desc-app",
      description: "A test project",
    });
    const parsed = TriggerConfigSchema.parse(config);

    expect(parsed.project.description).toBe("A test project");
  });

  it("persists trigger.json to disk", async () => {
    await initProject(tmpDir, { name: "disk-app" });

    const raw = await fs.readFile(
      path.join(tmpDir, ".trigger", "trigger.json"),
      "utf-8",
    );
    const parsed = TriggerConfigSchema.parse(JSON.parse(raw));

    expect(parsed.project.name).toBe("disk-app");
  });
});
