export const DEFAULT_TEAM = {
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
};
export const DEFAULT_ACTIVATION_RULES = {
    security_reviewer: { globs: ["**/auth/**", "**/api/**", "**/*.env*", "**/middleware/**"] },
    performance_reviewer: { globs: ["**/db/**", "**/queries/**", "**/components/**", "**/hooks/**"] },
    accessibility_reviewer: { globs: ["**/*.tsx", "**/*.jsx", "**/*.html", "**/*.css", "**/*.vue"] },
    database_reviewer: { globs: ["**/migrations/**", "**/models/**", "**/schema/**", "**/*.sql"] },
    devops_reviewer: { globs: ["**/Dockerfile*", "**/.github/**", "**/terraform/**", "**/docker-compose*"] },
    documentation_writer: { globs: ["**/routes/**", "**/api/**", "**/public/**"] },
};
export const DEFAULT_ESCALATION = {
    max_builder_retries: 3,
    max_review_cycles: 3,
    escalate_to_expensive: true,
};
export const DEFAULT_GUARDIAN = {
    auto_review: true,
    smart_escalation: true,
    review_threshold_files: 3,
    review_threshold_lines: 50,
    skip_patterns: ["*.md", "*.json", ".trigger/**"],
};
//# sourceMappingURL=team-defaults.js.map