import { describe, it, expect } from "vitest";
import { MilestoneSchema } from "../../src/schemas/milestone.js";

describe("MilestoneSchema", () => {
  it("validates a complete milestone", () => {
    const milestone = {
      id: "m1-mvp",
      name: "MVP",
      description: "Minimum viable product",
      status: "in_progress",
      phases: ["p01-api-layer", "p02-frontend"],
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
    };

    const result = MilestoneSchema.safeParse(milestone);
    expect(result.success).toBe(true);
  });

  it("rejects milestone without id", () => {
    const milestone = {
      name: "MVP",
      status: "planned",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
    };
    const result = MilestoneSchema.safeParse(milestone);
    expect(result.success).toBe(false);
  });

  it("defaults status to planned", () => {
    const milestone = {
      id: "m1-mvp",
      name: "MVP",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
    };

    const result = MilestoneSchema.safeParse(milestone);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("planned");
    }
  });

  it("defaults phases to empty array", () => {
    const milestone = {
      id: "m1-mvp",
      name: "MVP",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
    };

    const result = MilestoneSchema.safeParse(milestone);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phases).toEqual([]);
    }
  });

  it("accepts git_branching option", () => {
    const milestone = {
      id: "m1-mvp",
      name: "MVP",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
      git_branching: "per_phase",
    };

    const result = MilestoneSchema.safeParse(milestone);
    expect(result.success).toBe(true);
  });

  it("rejects invalid git_branching value", () => {
    const milestone = {
      id: "m1-mvp",
      name: "MVP",
      created_at: "2026-04-10T12:00:00Z",
      updated_at: "2026-04-10T12:00:00Z",
      git_branching: "yolo",
    };

    const result = MilestoneSchema.safeParse(milestone);
    expect(result.success).toBe(false);
  });

  it("requires created_at and updated_at", () => {
    const milestone = {
      id: "m1-mvp",
      name: "MVP",
    };
    const result = MilestoneSchema.safeParse(milestone);
    expect(result.success).toBe(false);
  });
});
