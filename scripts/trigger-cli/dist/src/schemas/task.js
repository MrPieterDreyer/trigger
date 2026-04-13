import { z } from "zod";
const TaskStatus = z.enum([
    "planned",
    "building",
    "built",
    "build_failed",
    "reviewing",
    "changes_requested",
    "review_passed",
    "signoff",
    "done",
]);
const StateTransition = z.object({
    from: z.string(),
    to: z.string(),
    at: z.string(),
    reason: z.string().optional(),
});
const ModelUsageEntry = z.object({
    role: z.string(),
    model: z.enum(["fast", "expensive"]),
    at: z.string(),
});
export const TaskSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    status: TaskStatus.default("planned"),
    acceptance_criteria: z.array(z.string()).default([]),
    test_requirements: z.array(z.string()).optional(),
    domains: z.array(z.string()).default([]),
    created_at: z.string(),
    updated_at: z.string(),
    history: z.array(StateTransition).default([]),
    model_usage: z.array(ModelUsageEntry).default([]),
    review_verdicts: z
        .array(z.object({
        reviewer: z.string(),
        verdict: z.enum(["approve", "approve_with_changes", "request_changes"]),
        at: z.string(),
    }))
        .default([]),
});
export { TaskStatus };
//# sourceMappingURL=task.js.map