export declare class TriggerPaths {
    readonly projectRoot: string;
    readonly planningRoot: string;
    readonly configPath: string;
    readonly statePath: string;
    constructor(projectRoot: string);
    milestonesDir(): string;
    milestoneDir(milestoneId: string): string;
    milestonePath(milestoneId: string): string;
    roadmapPath(milestoneId: string): string;
    phasesDir(milestoneId: string): string;
    phaseDir(milestoneId: string, phaseId: string): string;
    phasePath(milestoneId: string, phaseId: string): string;
    researchDir(milestoneId: string, phaseId: string): string;
    phaseSummaryPath(milestoneId: string, phaseId: string): string;
    tasksDir(milestoneId: string, phaseId: string): string;
    taskDir(milestoneId: string, phaseId: string, taskId: string): string;
    taskPath(milestoneId: string, phaseId: string, taskId: string): string;
    planPath(milestoneId: string, phaseId: string, taskId: string): string;
    builderReportPath(milestoneId: string, phaseId: string, taskId: string): string;
    signoffPath(milestoneId: string, phaseId: string, taskId: string): string;
    reviewsDir(milestoneId: string, phaseId: string, taskId: string): string;
    reviewSummaryPath(milestoneId: string, phaseId: string, taskId: string): string;
}
//# sourceMappingURL=paths.d.ts.map