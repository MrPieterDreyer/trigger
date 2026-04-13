import { z } from "zod";
export declare const MilestoneSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        done: "done";
        planned: "planned";
        in_progress: "in_progress";
    }>>;
    phases: z.ZodDefault<z.ZodArray<z.ZodString>>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    git_branching: z.ZodOptional<z.ZodEnum<{
        none: "none";
        per_phase: "per_phase";
        per_task: "per_task";
    }>>;
}, z.core.$strip>;
export type Milestone = z.infer<typeof MilestoneSchema>;
//# sourceMappingURL=milestone.d.ts.map