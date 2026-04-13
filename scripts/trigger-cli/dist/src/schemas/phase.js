import { z } from "zod";
const PhaseStatus = z.enum(["planned", "in_progress", "done"]);
const PhaseTeamOverride = z.object({
    model: z.enum(["fast", "expensive"]).optional(),
    enabled: z.union([z.boolean(), z.literal("auto")]).optional(),
    always: z.boolean().optional(),
});
export const PhaseSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    status: PhaseStatus.default("planned"),
    domains: z.array(z.string()).default([]),
    tasks: z.array(z.string()).default([]),
    created_at: z.string(),
    updated_at: z.string(),
    team_overrides: z.record(z.string(), PhaseTeamOverride).optional(),
    batch_signoff: z.boolean().optional(),
});
//# sourceMappingURL=phase.js.map