import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { listReviewers } from "../../src/commands/reviewers.js";
import { initProject } from "../../src/commands/init.js";
import { createMilestone } from "../../src/commands/milestone.js";
import { createPhase } from "../../src/commands/phase.js";
import { createTask } from "../../src/commands/task.js";
import { updateConfig } from "../../src/commands/config.js";

describe("listReviewers", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "trigger-reviewers-"));
    await initProject(tmpDir, { name: "test-project" });
    await createMilestone(tmpDir, { id: "v1", name: "MVP" });
    await createPhase(tmpDir, "v1", { id: "p1", name: "Foundation" });
    await createTask(tmpDir, "v1", "p1", {
      id: "t1",
      name: "Setup",
      domains: ["backend"],
    });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("always activates code_reviewer (enabled: true by default)", async () => {
    const reviewers = await listReviewers(tmpDir, "v1", "p1", "t1");

    const codeReviewer = reviewers.find((r) => r.role === "code_reviewer");
    expect(codeReviewer).toBeDefined();
    expect(codeReviewer!.reason).toBe("always");
  });

  it("skips disabled reviewers", async () => {
    await updateConfig(tmpDir, {
      team: { security_reviewer: { enabled: false } },
    });

    const reviewers = await listReviewers(tmpDir, "v1", "p1", "t1");

    const security = reviewers.find((r) => r.role === "security_reviewer");
    expect(security).toBeUndefined();
  });

  it("activates auto reviewers by domain match", async () => {
    await createTask(tmpDir, "v1", "p1", {
      id: "t2",
      name: "Auth",
      domains: ["security", "backend"],
    });

    const reviewers = await listReviewers(tmpDir, "v1", "p1", "t2");

    const security = reviewers.find((r) => r.role === "security_reviewer");
    expect(security).toBeDefined();
    expect(security!.reason).toContain("domain:");
  });

  it("activates auto reviewers by glob match", async () => {
    await updateConfig(tmpDir, {
      activation_rules: {
        security_reviewer: { globs: ["**/auth/**", "**/api/**"] },
      },
    });

    const reviewers = await listReviewers(
      tmpDir, "v1", "p1", "t1",
      ["src/auth/login.ts", "src/utils/helpers.ts"],
    );

    const security = reviewers.find((r) => r.role === "security_reviewer");
    expect(security).toBeDefined();
    expect(security!.reason).toContain("glob:");
  });

  it("does not activate auto reviewer when no match", async () => {
    const reviewers = await listReviewers(
      tmpDir, "v1", "p1", "t1",
      ["src/utils/helpers.ts"],
    );

    const database = reviewers.find((r) => r.role === "database_reviewer");
    expect(database).toBeUndefined();
  });

  it("uses task changed_files when no files argument given", async () => {
    const { setTaskFiles } = await import("../../src/commands/task.js");
    await setTaskFiles(tmpDir, "v1", "p1", "t1", ["src/auth/session.ts"]);

    await updateConfig(tmpDir, {
      activation_rules: {
        security_reviewer: { globs: ["**/auth/**"] },
      },
    });

    const reviewers = await listReviewers(tmpDir, "v1", "p1", "t1");

    const security = reviewers.find((r) => r.role === "security_reviewer");
    expect(security).toBeDefined();
  });

  it("returns correct subagent_type for each role", async () => {
    const reviewers = await listReviewers(tmpDir, "v1", "p1", "t1");

    const codeReviewer = reviewers.find((r) => r.role === "code_reviewer");
    expect(codeReviewer!.subagent_type).toBe("code-reviewer");
  });
});
