import { z } from "zod";

const TrustLevel = z.enum(["supervised", "balanced", "autonomous"]);

const ModelTier = z.enum(["fast", "expensive"]);

const EnabledState = z.union([z.boolean(), z.literal("auto")]);

const VerificationCommand = z.object({
  name: z.string(),
  command: z.string(),
  required: z.boolean().default(true),
});

const TeamRoleConfig = z.object({
  model: ModelTier.default("expensive"),
  enabled: EnabledState.default("auto"),
  always: z.boolean().optional(),
});

const ActivationRule = z.object({
  globs: z.array(z.string()),
});

export const TriggerConfigSchema = z.object({
  project: z.object({
    name: z.string(),
    type: z.string(),
    trust_level: TrustLevel.default("balanced"),
    description: z.string().optional(),
  }),
  verification: z
    .object({
      commands: z.array(VerificationCommand).default([]),
    })
    .default({ commands: [] }),
  team: z
    .object({
      researcher: TeamRoleConfig.default({ model: "expensive", enabled: true }),
      planner: TeamRoleConfig.default({ model: "expensive", enabled: true }),
      plan_reviewer: TeamRoleConfig.default({ model: "expensive", enabled: true }),
      builder: TeamRoleConfig.default({ model: "fast", enabled: true }),
      code_reviewer: TeamRoleConfig.default({ model: "expensive", enabled: true }),
      security_reviewer: TeamRoleConfig.default({ model: "expensive", enabled: "auto" }),
      performance_reviewer: TeamRoleConfig.default({ model: "expensive", enabled: "auto" }),
      accessibility_reviewer: TeamRoleConfig.default({ model: "expensive", enabled: "auto" }),
      database_reviewer: TeamRoleConfig.default({ model: "expensive", enabled: "auto" }),
      devops_reviewer: TeamRoleConfig.default({ model: "expensive", enabled: "auto" }),
      documentation_writer: TeamRoleConfig.default({ model: "fast", enabled: "auto" }),
      qa_verifier: TeamRoleConfig.default({ model: "fast", enabled: true }),
    })
    .default({
      researcher: { model: "expensive", enabled: true },
      planner: { model: "expensive", enabled: true },
      plan_reviewer: { model: "expensive", enabled: true },
      builder: { model: "fast", enabled: true },
      code_reviewer: { model: "expensive", enabled: true },
      security_reviewer: { model: "expensive", enabled: "auto" },
      performance_reviewer: { model: "expensive", enabled: "auto" },
      accessibility_reviewer: { model: "expensive", enabled: "auto" },
      database_reviewer: { model: "expensive", enabled: "auto" },
      devops_reviewer: { model: "expensive", enabled: "auto" },
      documentation_writer: { model: "fast", enabled: "auto" },
      qa_verifier: { model: "fast", enabled: true },
    }),
  activation_rules: z.record(z.string(), ActivationRule).default({}),
  escalation: z
    .object({
      max_builder_retries: z.number().int().min(1).default(3),
      max_review_cycles: z.number().int().min(1).default(3),
      escalate_to_expensive: z.boolean().default(true),
    })
    .default({
      max_builder_retries: 3,
      max_review_cycles: 3,
      escalate_to_expensive: true,
    }),
  reports: z
    .object({
      format: z.enum(["markdown"]).default("markdown"),
      include_timestamps: z.boolean().default(true),
      include_model_used: z.boolean().default(true),
    })
    .default({
      format: "markdown",
      include_timestamps: true,
      include_model_used: true,
    }),
});

export type TriggerConfig = z.infer<typeof TriggerConfigSchema>;
export { TrustLevel, ModelTier, EnabledState, TeamRoleConfig };
