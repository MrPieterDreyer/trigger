import { z } from "zod";
declare const TaskStatus: z.ZodEnum<{
    building: "building";
    build_failed: "build_failed";
    reviewing: "reviewing";
    changes_requested: "changes_requested";
    review_passed: "review_passed";
    signoff: "signoff";
    done: "done";
    planned: "planned";
    built: "built";
    qa_passed: "qa_passed";
}>;
export declare const TaskSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        building: "building";
        build_failed: "build_failed";
        reviewing: "reviewing";
        changes_requested: "changes_requested";
        review_passed: "review_passed";
        signoff: "signoff";
        done: "done";
        planned: "planned";
        built: "built";
        qa_passed: "qa_passed";
    }>>;
    acceptance_criteria: z.ZodDefault<z.ZodArray<z.ZodString>>;
    test_requirements: z.ZodOptional<z.ZodArray<z.ZodString>>;
    domains: z.ZodDefault<z.ZodArray<z.ZodString>>;
    changed_files: z.ZodDefault<z.ZodArray<z.ZodString>>;
    parallel_group: z.ZodOptional<z.ZodString>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    history: z.ZodDefault<z.ZodArray<z.ZodObject<{
        from: z.ZodString;
        to: z.ZodString;
        at: z.ZodString;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    model_usage: z.ZodDefault<z.ZodArray<z.ZodObject<{
        role: z.ZodString;
        model: z.ZodEnum<{
            fast: "fast";
            expensive: "expensive";
        }>;
        at: z.ZodString;
    }, z.core.$strip>>>;
    review_verdicts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        reviewer: z.ZodString;
        verdict: z.ZodEnum<{
            approve: "approve";
            approve_with_changes: "approve_with_changes";
            request_changes: "request_changes";
        }>;
        at: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type Task = z.infer<typeof TaskSchema>;
export { TaskStatus };
//# sourceMappingURL=task.d.ts.map