import { describe, it, expect } from "vitest";
import { TaskSchema } from "../../src/schemas/task.js";

describe("TaskSchema", () => {
  it("validates a complete task", () => {
    const task = {
      id: "t01-user-auth",
      name: "User Authentication",
      description: "Build user registration and login endpoints",
      status: "planned",
      acceptance_criteria: [
        "Users can register with email/password",
        "Users can login and receive a JWT",
        "Invalid credentials return 401",
      ],
      domains: ["api", "database", "security"],
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(true);
  });

  it("tracks state transition history", () => {
    const task = {
      id: "t01-user-auth",
      name: "User Auth",
      status: "reviewing",
      acceptance_criteria: [],
      domains: [],
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T14:00:00Z",
      history: [
        { from: "planned", to: "building", at: "2026-04-10T12:30:00Z" },
        { from: "building", to: "built", at: "2026-04-10T13:00:00Z" },
        { from: "built", to: "reviewing", at: "2026-04-10T13:05:00Z" },
      ],
      model_usage: [
        { role: "builder", model: "fast", at: "2026-04-10T12:30:00Z" },
        { role: "code_reviewer", model: "expensive", at: "2026-04-10T13:05:00Z" },
      ],
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const task = {
      id: "t01",
      name: "Test",
      status: "vibing",
      acceptance_criteria: [],
      domains: [],
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(false);
  });

  it("defaults arrays to empty", () => {
    const task = {
      id: "t01",
      name: "Test",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.acceptance_criteria).toEqual([]);
      expect(result.data.domains).toEqual([]);
      expect(result.data.history).toEqual([]);
      expect(result.data.model_usage).toEqual([]);
      expect(result.data.review_verdicts).toEqual([]);
    }
  });

  it("defaults status to planned", () => {
    const task = {
      id: "t01",
      name: "Test",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("planned");
    }
  });

  it("validates review verdicts", () => {
    const task = {
      id: "t01",
      name: "Test",
      status: "review_passed",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
      review_verdicts: [
        { reviewer: "code_reviewer", verdict: "approve", at: "2026-04-10T13:00:00Z" },
        { reviewer: "security_reviewer", verdict: "approve_with_changes", at: "2026-04-10T13:05:00Z" },
      ],
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(true);
  });

  it("rejects invalid review verdict", () => {
    const task = {
      id: "t01",
      name: "Test",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
      review_verdicts: [
        { reviewer: "code_reviewer", verdict: "lgtm", at: "2026-04-10T13:00:00Z" },
      ],
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(false);
  });

  it("accepts optional test_requirements", () => {
    const task = {
      id: "t01",
      name: "Test",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
      test_requirements: ["unit tests for auth", "integration test for login flow"],
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.test_requirements).toEqual([
        "unit tests for auth",
        "integration test for login flow",
      ]);
    }
  });

  it("accepts history entry with reason", () => {
    const task = {
      id: "t01",
      name: "Test",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
      history: [
        {
          from: "reviewing",
          to: "changes_requested",
          at: "2026-04-10T13:00:00Z",
          reason: "Security vulnerability found",
        },
      ],
    };

    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(true);
  });

  it("validates all task statuses", () => {
    const statuses = [
      "planned", "building", "built", "build_failed",
      "reviewing", "changes_requested", "review_passed", "signoff", "done",
    ];

    for (const status of statuses) {
      const result = TaskSchema.safeParse({
        id: "t01",
        name: "Test",
        status,
        created_at: "2026-04-10T12:00:00Z",
        updated_at: "2026-04-10T12:00:00Z",
      });
      expect(result.success, `status "${status}" should be valid`).toBe(true);
    }
  });
});
