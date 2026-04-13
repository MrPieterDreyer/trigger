import path from "node:path";

export class TriggerPaths {
  readonly projectRoot: string;
  readonly planningRoot: string;
  readonly configPath: string;
  readonly statePath: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.planningRoot = path.join(projectRoot, ".planning");
    this.configPath = path.join(this.planningRoot, "trigger.json");
    this.statePath = path.join(this.planningRoot, "state.json");
  }

  milestonesDir(): string {
    return path.join(this.planningRoot, "milestones");
  }

  milestoneDir(milestoneId: string): string {
    return path.join(this.milestonesDir(), milestoneId);
  }

  milestonePath(milestoneId: string): string {
    return path.join(this.milestoneDir(milestoneId), "milestone.json");
  }

  roadmapPath(milestoneId: string): string {
    return path.join(this.milestoneDir(milestoneId), "ROADMAP.md");
  }

  phasesDir(milestoneId: string): string {
    return path.join(this.milestoneDir(milestoneId), "phases");
  }

  phaseDir(milestoneId: string, phaseId: string): string {
    return path.join(this.phasesDir(milestoneId), phaseId);
  }

  phasePath(milestoneId: string, phaseId: string): string {
    return path.join(this.phaseDir(milestoneId, phaseId), "phase.json");
  }

  researchDir(milestoneId: string, phaseId: string): string {
    return path.join(this.phaseDir(milestoneId, phaseId), "research");
  }

  phaseSummaryPath(milestoneId: string, phaseId: string): string {
    return path.join(this.phaseDir(milestoneId, phaseId), "phase-summary.json");
  }

  tasksDir(milestoneId: string, phaseId: string): string {
    return path.join(this.phaseDir(milestoneId, phaseId), "tasks");
  }

  taskDir(milestoneId: string, phaseId: string, taskId: string): string {
    return path.join(this.tasksDir(milestoneId, phaseId), taskId);
  }

  taskPath(milestoneId: string, phaseId: string, taskId: string): string {
    return path.join(this.taskDir(milestoneId, phaseId, taskId), "task.json");
  }

  planPath(milestoneId: string, phaseId: string, taskId: string): string {
    return path.join(this.taskDir(milestoneId, phaseId, taskId), "PLAN.md");
  }

  builderReportPath(milestoneId: string, phaseId: string, taskId: string): string {
    return path.join(this.taskDir(milestoneId, phaseId, taskId), "BUILDER-REPORT.md");
  }

  signoffPath(milestoneId: string, phaseId: string, taskId: string): string {
    return path.join(this.taskDir(milestoneId, phaseId, taskId), "SIGNOFF.md");
  }

  reviewsDir(milestoneId: string, phaseId: string, taskId: string): string {
    return path.join(this.taskDir(milestoneId, phaseId, taskId), "reviews");
  }

  reviewSummaryPath(milestoneId: string, phaseId: string, taskId: string): string {
    return path.join(this.reviewsDir(milestoneId, phaseId, taskId), "review-summary.json");
  }
}
