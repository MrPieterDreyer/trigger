import { z } from "zod";
declare const PipelineStage: z.ZodEnum<{
    idle: "idle";
    planning: "planning";
    plan_review: "plan_review";
    building: "building";
    build_failed: "build_failed";
    reviewing: "reviewing";
    changes_requested: "changes_requested";
    review_passed: "review_passed";
    qa_verification: "qa_verification";
    signoff: "signoff";
    done: "done";
}>;
export declare const StateSchema: z.ZodObject<{
    active_milestone: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    active_phase: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    active_task: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    pipeline_stage: z.ZodDefault<z.ZodEnum<{
        idle: "idle";
        planning: "planning";
        plan_review: "plan_review";
        building: "building";
        build_failed: "build_failed";
        reviewing: "reviewing";
        changes_requested: "changes_requested";
        review_passed: "review_passed";
        qa_verification: "qa_verification";
        signoff: "signoff";
        done: "done";
    }>>;
    last_updated: z.ZodString;
    session: z.ZodOptional<z.ZodObject<{
        started_at: z.ZodString;
        trust_level: z.ZodOptional<z.ZodEnum<{
            supervised: "supervised";
            balanced: "balanced";
            autonomous: "autonomous";
        }>>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type State = z.infer<typeof StateSchema>;
export { PipelineStage };
//# sourceMappingURL=state.d.ts.map