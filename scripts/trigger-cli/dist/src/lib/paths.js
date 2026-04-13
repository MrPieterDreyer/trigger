import path from "node:path";
export class TriggerPaths {
    projectRoot;
    planningRoot;
    configPath;
    statePath;
    projectPath;
    requirementsPath;
    humanStatePath;
    backlogPath;
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.planningRoot = path.join(projectRoot, ".trigger");
        this.configPath = path.join(this.planningRoot, "trigger.json");
        this.statePath = path.join(this.planningRoot, "state.json");
        this.projectPath = path.join(this.planningRoot, "PROJECT.md");
        this.requirementsPath = path.join(this.planningRoot, "REQUIREMENTS.md");
        this.humanStatePath = path.join(this.planningRoot, "STATE.md");
        this.backlogPath = path.join(this.planningRoot, "IMPROVEMENT-BACKLOG.md");
    }
    milestonesDir() {
        return path.join(this.planningRoot, "milestones");
    }
    milestoneDir(milestoneId) {
        return path.join(this.milestonesDir(), milestoneId);
    }
    milestonePath(milestoneId) {
        return path.join(this.milestoneDir(milestoneId), "milestone.json");
    }
    roadmapPath(milestoneId) {
        return path.join(this.milestoneDir(milestoneId), "ROADMAP.md");
    }
    phasesDir(milestoneId) {
        return path.join(this.milestoneDir(milestoneId), "phases");
    }
    phaseDir(milestoneId, phaseId) {
        return path.join(this.phasesDir(milestoneId), phaseId);
    }
    phasePath(milestoneId, phaseId) {
        return path.join(this.phaseDir(milestoneId, phaseId), "phase.json");
    }
    researchDir(milestoneId, phaseId) {
        return path.join(this.phaseDir(milestoneId, phaseId), "research");
    }
    phaseSummaryPath(milestoneId, phaseId) {
        return path.join(this.phaseDir(milestoneId, phaseId), "phase-summary.json");
    }
    tasksDir(milestoneId, phaseId) {
        return path.join(this.phaseDir(milestoneId, phaseId), "tasks");
    }
    taskDir(milestoneId, phaseId, taskId) {
        return path.join(this.tasksDir(milestoneId, phaseId), taskId);
    }
    taskPath(milestoneId, phaseId, taskId) {
        return path.join(this.taskDir(milestoneId, phaseId, taskId), "task.json");
    }
    planPath(milestoneId, phaseId, taskId) {
        return path.join(this.taskDir(milestoneId, phaseId, taskId), "PLAN.md");
    }
    builderReportPath(milestoneId, phaseId, taskId) {
        return path.join(this.taskDir(milestoneId, phaseId, taskId), "BUILDER-REPORT.md");
    }
    signoffPath(milestoneId, phaseId, taskId) {
        return path.join(this.taskDir(milestoneId, phaseId, taskId), "SIGNOFF.md");
    }
    reviewsDir(milestoneId, phaseId, taskId) {
        return path.join(this.taskDir(milestoneId, phaseId, taskId), "reviews");
    }
    reviewSummaryPath(milestoneId, phaseId, taskId) {
        return path.join(this.reviewsDir(milestoneId, phaseId, taskId), "review-summary.json");
    }
}
//# sourceMappingURL=paths.js.map