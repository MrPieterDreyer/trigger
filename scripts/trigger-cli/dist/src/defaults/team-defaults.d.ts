export declare const DEFAULT_TEAM: {
    researcher: {
        model: "expensive";
        enabled: boolean;
    };
    planner: {
        model: "expensive";
        enabled: boolean;
    };
    plan_reviewer: {
        model: "expensive";
        enabled: boolean;
    };
    builder: {
        model: "fast";
        enabled: boolean;
    };
    code_reviewer: {
        model: "expensive";
        enabled: boolean;
    };
    security_reviewer: {
        model: "expensive";
        enabled: "auto";
    };
    performance_reviewer: {
        model: "expensive";
        enabled: "auto";
    };
    accessibility_reviewer: {
        model: "expensive";
        enabled: "auto";
    };
    database_reviewer: {
        model: "expensive";
        enabled: "auto";
    };
    devops_reviewer: {
        model: "expensive";
        enabled: "auto";
    };
    documentation_writer: {
        model: "fast";
        enabled: "auto";
    };
    qa_verifier: {
        model: "fast";
        enabled: boolean;
    };
};
export declare const DEFAULT_ACTIVATION_RULES: {
    security_reviewer: {
        globs: string[];
    };
    performance_reviewer: {
        globs: string[];
    };
    accessibility_reviewer: {
        globs: string[];
    };
    database_reviewer: {
        globs: string[];
    };
    devops_reviewer: {
        globs: string[];
    };
    documentation_writer: {
        globs: string[];
    };
};
export declare const DEFAULT_ESCALATION: {
    max_builder_retries: number;
    max_review_cycles: number;
    escalate_to_expensive: boolean;
};
//# sourceMappingURL=team-defaults.d.ts.map