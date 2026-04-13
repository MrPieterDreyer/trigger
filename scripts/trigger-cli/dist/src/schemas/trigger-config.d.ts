import { z } from "zod";
declare const TrustLevel: z.ZodEnum<{
    supervised: "supervised";
    balanced: "balanced";
    autonomous: "autonomous";
}>;
declare const ModelTier: z.ZodEnum<{
    fast: "fast";
    expensive: "expensive";
}>;
declare const EnabledState: z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"auto">]>;
declare const TeamRoleConfig: z.ZodObject<{
    model: z.ZodDefault<z.ZodEnum<{
        fast: "fast";
        expensive: "expensive";
    }>>;
    enabled: z.ZodDefault<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"auto">]>>;
    always: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const TriggerConfigSchema: z.ZodObject<{
    project: z.ZodObject<{
        name: z.ZodString;
        type: z.ZodString;
        trust_level: z.ZodDefault<z.ZodEnum<{
            supervised: "supervised";
            balanced: "balanced";
            autonomous: "autonomous";
        }>>;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    verification: z.ZodDefault<z.ZodObject<{
        commands: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            command: z.ZodString;
            required: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    team: z.ZodDefault<z.ZodObject<{
        researcher: z.ZodDefault<z.ZodObject<{
            model: z.ZodDefault<z.ZodEnum<{
                fast: "fast";
                expensive: "expensive";
            }>>;
            enabled: z.ZodDefault<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"auto">]>>;
            always: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        planner: z.ZodDefault<z.ZodObject<{
            model: z.ZodDefault<z.ZodEnum<{
                fast: "fast";
                expensive: "expensive";
            }>>;
            enabled: z.ZodDefault<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"auto">]>>;
            always: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        plan_reviewer: z.ZodDefault<z.ZodObject<{
            model: z.ZodDefault<z.ZodEnum<{
                fast: "fast";
                expensive: "expensive";
            }>>;
            enabled: z.ZodDefault<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"auto">]>>;
            always: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        builder: z.ZodDefault<z.ZodObject<{
            model: z.ZodDefault<z.ZodEnum<{
                fast: "fast";
                expensive: "expensive";
            }>>;
            enabled: z.ZodDefault<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"auto">]>>;
            always: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        code_reviewer: z.ZodDefault<z.ZodObject<{
            model: z.ZodDefault<z.ZodEnum<{
                fast: "fast";
                expensive: "expensive";
            }>>;
            enabled: z.ZodDefault<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"auto">]>>;
            always: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        security_reviewer: z.ZodDefault<z.ZodObject<{
            model: z.ZodDefault<z.ZodEnum<{
                fast: "fast";
                expensive: "expensive";
            }>>;
            enabled: z.ZodDefault<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"auto">]>>;
            always: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        performance_reviewer: z.ZodDefault<z.ZodObject<{
            model: z.ZodDefault<z.ZodEnum<{
                fast: "fast";
                expensive: "expensive";
            }>>;
            enabled: z.ZodDefault<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"auto">]>>;
            always: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        accessibility_reviewer: z.ZodDefault<z.ZodObject<{
            model: z.ZodDefault<z.ZodEnum<{
                fast: "fast";
                expensive: "expensive";
            }>>;
            enabled: z.ZodDefault<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"auto">]>>;
            always: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        database_reviewer: z.ZodDefault<z.ZodObject<{
            model: z.ZodDefault<z.ZodEnum<{
                fast: "fast";
                expensive: "expensive";
            }>>;
            enabled: z.ZodDefault<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"auto">]>>;
            always: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        devops_reviewer: z.ZodDefault<z.ZodObject<{
            model: z.ZodDefault<z.ZodEnum<{
                fast: "fast";
                expensive: "expensive";
            }>>;
            enabled: z.ZodDefault<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"auto">]>>;
            always: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        documentation_writer: z.ZodDefault<z.ZodObject<{
            model: z.ZodDefault<z.ZodEnum<{
                fast: "fast";
                expensive: "expensive";
            }>>;
            enabled: z.ZodDefault<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"auto">]>>;
            always: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        qa_verifier: z.ZodDefault<z.ZodObject<{
            model: z.ZodDefault<z.ZodEnum<{
                fast: "fast";
                expensive: "expensive";
            }>>;
            enabled: z.ZodDefault<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"auto">]>>;
            always: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    activation_rules: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        globs: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>>;
    escalation: z.ZodDefault<z.ZodObject<{
        max_builder_retries: z.ZodDefault<z.ZodNumber>;
        max_review_cycles: z.ZodDefault<z.ZodNumber>;
        escalate_to_expensive: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    parallelism: z.ZodDefault<z.ZodObject<{
        reviews: z.ZodDefault<z.ZodBoolean>;
        tasks: z.ZodDefault<z.ZodBoolean>;
        max_concurrent_tasks: z.ZodDefault<z.ZodNumber>;
        max_concurrent_reviews: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
    reports: z.ZodDefault<z.ZodObject<{
        format: z.ZodDefault<z.ZodEnum<{
            markdown: "markdown";
        }>>;
        include_timestamps: z.ZodDefault<z.ZodBoolean>;
        include_model_used: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    guardian: z.ZodDefault<z.ZodObject<{
        auto_review: z.ZodDefault<z.ZodBoolean>;
        smart_escalation: z.ZodDefault<z.ZodBoolean>;
        review_threshold_files: z.ZodDefault<z.ZodNumber>;
        review_threshold_lines: z.ZodDefault<z.ZodNumber>;
        skip_patterns: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type TriggerConfig = z.infer<typeof TriggerConfigSchema>;
export { TrustLevel, ModelTier, EnabledState, TeamRoleConfig };
//# sourceMappingURL=trigger-config.d.ts.map