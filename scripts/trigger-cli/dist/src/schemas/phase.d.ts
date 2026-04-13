import { z } from "zod";
export declare const PhaseSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        done: "done";
        planned: "planned";
        in_progress: "in_progress";
    }>>;
    domains: z.ZodDefault<z.ZodArray<z.ZodString>>;
    tasks: z.ZodDefault<z.ZodArray<z.ZodString>>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    team_overrides: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        model: z.ZodOptional<z.ZodEnum<{
            fast: "fast";
            expensive: "expensive";
        }>>;
        enabled: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"auto">]>>;
        always: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>>;
    batch_signoff: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type Phase = z.infer<typeof PhaseSchema>;
//# sourceMappingURL=phase.d.ts.map