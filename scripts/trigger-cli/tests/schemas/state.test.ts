import { describe, it, expect } from "vitest";
import { StateSchema } from "../../src/schemas/state.js";

describe("StateSchema", () => {
  it("validates a complete state", () => {
    const state = {
      active_milestone: "m1-mvp",
      active_phase: "p01-api-layer",
      active_task: "t01-user-auth",
      pipeline_stage: "building",
      last_updated: "2026-04-10T12:00:00Z",
      session: {
        started_at: "2026-04-10T11:00:00Z",
        trust_level: "balanced",
      },
    };

    const result = StateSchema.safeParse(state);
    expect(result.success).toBe(true);
  });

  it("allows null active fields when no work in progress", () => {
    const state = {
      active_milestone: null,
      active_phase: null,
      active_task: null,
      pipeline_stage: "idle",
      last_updated: "2026-04-10T12:00:00Z",
    };

    const result = StateSchema.safeParse(state);
    expect(result.success).toBe(true);
  });

  it("rejects invalid pipeline_stage", () => {
    const state = {
      active_milestone: "m1",
      pipeline_stage: "vibing",
      last_updated: "2026-04-10T12:00:00Z",
    };

    const result = StateSchema.safeParse(state);
    expect(result.success).toBe(false);
  });

  it("defaults pipeline_stage to idle", () => {
    const state = {
      last_updated: "2026-04-10T12:00:00Z",
    };

    const result = StateSchema.safeParse(state);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pipeline_stage).toBe("idle");
    }
  });

  it("defaults active fields to null", () => {
    const state = {
      last_updated: "2026-04-10T12:00:00Z",
    };

    const result = StateSchema.safeParse(state);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.active_milestone).toBeNull();
      expect(result.data.active_phase).toBeNull();
      expect(result.data.active_task).toBeNull();
    }
  });

  it("requires last_updated", () => {
    const state = {
      pipeline_stage: "idle",
    };

    const result = StateSchema.safeParse(state);
    expect(result.success).toBe(false);
  });

  it("validates all pipeline stages", () => {
    const stages = [
      "idle", "planning", "plan_review", "building", "build_failed",
      "reviewing", "changes_requested", "review_passed", "qa_verification",
      "signoff", "done",
    ];

    for (const stage of stages) {
      const result = StateSchema.safeParse({
        pipeline_stage: stage,
        last_updated: "2026-04-10T12:00:00Z",
      });
      expect(result.success, `stage "${stage}" should be valid`).toBe(true);
    }
  });

  it("accepts session with optional notes", () => {
    const state = {
      last_updated: "2026-04-10T12:00:00Z",
      session: {
        started_at: "2026-04-10T11:00:00Z",
        notes: "Working on auth module",
      },
    };

    const result = StateSchema.safeParse(state);
    expect(result.success).toBe(true);
  });
});
