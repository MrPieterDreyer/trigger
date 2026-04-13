import { z } from "zod";
const MilestoneStatus = z.enum(["planned", "in_progress", "done"]);
export const MilestoneSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    status: MilestoneStatus.default("planned"),
    phases: z.array(z.string()).default([]),
    created_at: z.string(),
    updated_at: z.string(),
    git_branching: z.enum(["none", "per_phase", "per_task"]).optional(),
});
//# sourceMappingURL=milestone.js.map