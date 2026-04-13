import { describe, it, expect } from "vitest";
import { TriggerConfigSchema } from "../../src/schemas/trigger-config.js";

describe("TriggerConfigSchema", () => {
  it("validates a complete config", () => {
    const config = {
      project: {
        name: "my-app",
        type: "fullstack",
        trust_level: "balanced",
        description: "Test project",
      },
      verification: {
        commands: [
          { name: "build", command: "npm run build", required: true },
          { name: "test", command: "npm run test", required: true },
        ],
      },
      team: {
        builder: { model: "fast", enabled: true },
        code_reviewer: { model: "expensive", enabled: true },
      },
      activation_rules: {
        security_reviewer: {
          globs: ["**/auth/**", "**/api/**"],
        },
      },
      escalation: {
        max_builder_retries: 3,
        max_review_cycles: 3,
        escalate_to_expensive: true,
      },
      reports: {
        format: "markdown",
        include_timestamps: true,
        include_model_used: true,
      },
    };

    const result = TriggerConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it("rejects invalid trust_level", () => {
    const config = {
      project: {
        name: "my-app",
        type: "fullstack",
        trust_level: "yolo",
      },
    };

    const result = TriggerConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it("applies defaults for optional fields", () => {
    const minimal = {
      project: {
        name: "my-app",
        type: "node",
      },
    };

    const result = TriggerConfigSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.project.trust_level).toBe("balanced");
      expect(result.data.escalation.max_builder_retries).toBe(3);
    }
  });

  it("applies team role defaults when team is omitted", () => {
    const minimal = {
      project: { name: "my-app", type: "node" },
    };

    const result = TriggerConfigSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.team.builder.model).toBe("fast");
      expect(result.data.team.builder.enabled).toBe(true);
      expect(result.data.team.code_reviewer.model).toBe("expensive");
      expect(result.data.team.security_reviewer.enabled).toBe("auto");
    }
  });

  it("applies verification defaults when omitted", () => {
    const minimal = {
      project: { name: "my-app", type: "node" },
    };

    const result = TriggerConfigSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.verification.commands).toEqual([]);
    }
  });

  it("applies report defaults when omitted", () => {
    const minimal = {
      project: { name: "my-app", type: "node" },
    };

    const result = TriggerConfigSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reports.format).toBe("markdown");
      expect(result.data.reports.include_timestamps).toBe(true);
      expect(result.data.reports.include_model_used).toBe(true);
    }
  });

  it("rejects missing project name", () => {
    const config = {
      project: { type: "node" },
    };
    const result = TriggerConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it("rejects missing project type", () => {
    const config = {
      project: { name: "my-app" },
    };
    const result = TriggerConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it("allows partial team overrides", () => {
    const config = {
      project: { name: "my-app", type: "node" },
      team: {
        builder: { model: "expensive" },
      },
    };

    const result = TriggerConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.team.builder.model).toBe("expensive");
    }
  });

  it("defaults VerificationCommand.required to true", () => {
    const config = {
      project: { name: "my-app", type: "node" },
      verification: {
        commands: [{ name: "lint", command: "npm run lint" }],
      },
    };

    const result = TriggerConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.verification.commands[0].required).toBe(true);
    }
  });
});
