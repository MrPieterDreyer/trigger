import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { ProjectDetector } from "../../src/lib/detector.js";
import { PROJECT_TYPES } from "../../src/defaults/project-types.js";

describe("ProjectDetector", () => {
  let tmpDir: string;
  let detector: ProjectDetector;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "trigger-detect-"));
    detector = new ProjectDetector();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("returns unknown for an empty directory", async () => {
    const result = await detector.detect(tmpDir);

    expect(result.type).toBe("unknown");
    expect(result.commands).toEqual([]);
    expect(result.confidence).toBe("low");
    expect(result.markers_found).toEqual([]);
  });

  it("detects Node.js project from package.json", async () => {
    await fs.writeFile(path.join(tmpDir, "package.json"), "{}");

    const result = await detector.detect(tmpDir);

    expect(result.type).toBe("node");
    expect(result.confidence).toBe("medium");
    expect(result.markers_found).toEqual(["package.json"]);
  });

  it("detects TypeScript over Node when both markers present", async () => {
    await fs.writeFile(path.join(tmpDir, "package.json"), "{}");
    await fs.writeFile(path.join(tmpDir, "tsconfig.json"), "{}");

    const result = await detector.detect(tmpDir);

    expect(result.type).toBe("typescript");
    expect(result.confidence).toBe("medium");
    expect(result.markers_found).toEqual(["tsconfig.json"]);
  });

  it("detects .NET project from wildcard .csproj match", async () => {
    await fs.writeFile(path.join(tmpDir, "MyApp.csproj"), "<Project />");

    const result = await detector.detect(tmpDir);

    expect(result.type).toBe("dotnet");
    expect(result.confidence).toBe("medium");
    expect(result.markers_found).toEqual(["MyApp.csproj"]);
  });

  it("detects .NET with high confidence when both .csproj and .sln exist", async () => {
    await fs.writeFile(path.join(tmpDir, "MyApp.csproj"), "<Project />");
    await fs.writeFile(path.join(tmpDir, "MyApp.sln"), "");

    const result = await detector.detect(tmpDir);

    expect(result.type).toBe("dotnet");
    expect(result.confidence).toBe("high");
    expect(result.markers_found).toContain("MyApp.csproj");
    expect(result.markers_found).toContain("MyApp.sln");
  });

  it("detects Python project from requirements.txt", async () => {
    await fs.writeFile(path.join(tmpDir, "requirements.txt"), "flask\n");

    const result = await detector.detect(tmpDir);

    expect(result.type).toBe("python");
    expect(result.confidence).toBe("medium");
    expect(result.markers_found).toEqual(["requirements.txt"]);
  });

  it("detects Python with high confidence from multiple markers", async () => {
    await fs.writeFile(path.join(tmpDir, "requirements.txt"), "");
    await fs.writeFile(path.join(tmpDir, "pyproject.toml"), "");

    const result = await detector.detect(tmpDir);

    expect(result.type).toBe("python");
    expect(result.confidence).toBe("high");
    expect(result.markers_found).toContain("requirements.txt");
    expect(result.markers_found).toContain("pyproject.toml");
  });

  it("detects Go project from go.mod", async () => {
    await fs.writeFile(path.join(tmpDir, "go.mod"), "module example");

    const result = await detector.detect(tmpDir);

    expect(result.type).toBe("golang");
    expect(result.markers_found).toEqual(["go.mod"]);
  });

  it("detects Rust project from Cargo.toml", async () => {
    await fs.writeFile(path.join(tmpDir, "Cargo.toml"), "[package]");

    const result = await detector.detect(tmpDir);

    expect(result.type).toBe("rust");
    expect(result.markers_found).toEqual(["Cargo.toml"]);
  });

  it("detects Ruby project from Gemfile", async () => {
    await fs.writeFile(path.join(tmpDir, "Gemfile"), 'source "https://rubygems.org"');

    const result = await detector.detect(tmpDir);

    expect(result.type).toBe("ruby");
    expect(result.markers_found).toEqual(["Gemfile"]);
  });

  it("populates commands correctly for detected type", async () => {
    await fs.writeFile(path.join(tmpDir, "package.json"), "{}");

    const result = await detector.detect(tmpDir);
    const nodeType = PROJECT_TYPES.find((t) => t.type === "node")!;

    expect(result.commands).toEqual(nodeType.commands);
  });

  it("includes typecheck command for TypeScript detection", async () => {
    await fs.writeFile(path.join(tmpDir, "tsconfig.json"), "{}");

    const result = await detector.detect(tmpDir);

    const typecheckCmd = result.commands.find((c) => c.name === "typecheck");
    expect(typecheckCmd).toBeDefined();
    expect(typecheckCmd!.command).toBe("npm run typecheck");
    expect(typecheckCmd!.required).toBe(true);
  });
});
