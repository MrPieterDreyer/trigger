export interface SummaryResult {
    project: string;
    trust: string;
    parallelism: {
        reviews: boolean;
        tasks: boolean;
        max_tasks: number;
    };
    guardian: {
        auto_review: boolean;
        smart_escalation: boolean;
        review_threshold_files: number;
        review_threshold_lines: number;
        skip_patterns: string[];
    };
    milestone: {
        id: string;
        name: string;
        phases_total: number;
        phases_done: number;
    } | null;
    phase: {
        id: string;
        name: string;
        status: string;
        tasks_total: number;
        tasks_done: number;
    } | null;
    task: {
        id: string;
        name: string;
        status: string;
    } | null;
    pipeline: string;
    verification_commands: number;
    recent_verdicts: Array<{
        reviewer: string;
        verdict: string;
    }>;
    artifacts: {
        builder_report: boolean;
        review_summary: boolean;
        qa_verification: boolean;
    };
}
export declare function getSummary(projectRoot: string): Promise<SummaryResult>;
//# sourceMappingURL=summary.d.ts.map