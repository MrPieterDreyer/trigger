import { describe, it, expect } from "vitest";
import { PhaseSchema } from "../../src/schemas/phase.js";

describe("PhaseSchema", () => {
  it("validates a complete phase", () => {
    const phase = {
      id: "p01-api-layer",
      name: "API Layer",
      description: "Build the REST API",
      status: "planned",
      domains: ["api", "database"],
      tasks: ["t01-user-auth", "t02-user-profile"],
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
    };

    const result = PhaseSchema.safeParse(phase);
    expect(result.success).toBe(true);
  });

  it("allows team overrides at phase level", () => {
    const phase = {
      id: "p02-infra",
      name: "Infrastructure",
      status: "planned",
      domains: ["devops"],
      tasks: [],
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
      team_overrides: {
        devops_reviewer: { enabled: true, always: true },
        accessibility_reviewer: { enabled: false },
      },
    };

    const result = PhaseSchema.safeParse(phase);
    expect(result.success).toBe(true);
  });

  it("defaults status to planned", () => {
    const phase = {
      id: "p01-api",
      name: "API",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
    };

    const result = PhaseSchema.safeParse(phase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("planned");
    }
  });

  it("defaults domains and tasks to empty arrays", () => {
    const phase = {
      id: "p01-api",
      name: "API",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
    };

    const result = PhaseSchema.safeParse(phase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.domains).toEqual([]);
      expect(result.data.tasks).toEqual([]);
    }
  });

  it("rejects phase without id", () => {
    const phase = {
      name: "API",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
    };
    const result = PhaseSchema.safeParse(phase);
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const phase = {
      id: "p01",
      name: "API",
      status: "vibing",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
    };
    const result = PhaseSchema.safeParse(phase);
    expect(result.success).toBe(false);
  });

  it("allows team_overrides with model tier override", () => {
    const phase = {
      id: "p01-api",
      name: "API",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
      team_overrides: {
        builder: { model: "expensive" },
      },
    };

    const result = PhaseSchema.safeParse(phase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.team_overrides?.builder?.model).toBe("expensive");
    }
  });
});
