export interface ActivatedReviewer {
    role: string;
    reason: string;
    subagent_type: string;
    model: "fast" | "expensive";
}
export declare function listReviewers(projectRoot: string, milestoneId: string, phaseId: string, taskId: string, changedFiles?: string[]): Promise<ActivatedReviewer[]>;
//# sourceMappingURL=reviewers.d.ts.map