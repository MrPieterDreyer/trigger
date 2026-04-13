export { TriggerConfigSchema } from "./schemas/trigger-config.js";
export type { TriggerConfig } from "./schemas/trigger-config.js";
export { TrustLevel, ModelTier, EnabledState, TeamRoleConfig } from "./schemas/trigger-config.js";

export { StateSchema } from "./schemas/state.js";
export type { State } from "./schemas/state.js";
export { PipelineStage } from "./schemas/state.js";

export { MilestoneSchema } from "./schemas/milestone.js";
export type { Milestone } from "./schemas/milestone.js";

export { PhaseSchema } from "./schemas/phase.js";
export type { Phase } from "./schemas/phase.js";

export { TaskSchema } from "./schemas/task.js";
export type { Task } from "./schemas/task.js";
export { TaskStatus } from "./schemas/task.js";

export { ReviewSummarySchema } from "./schemas/review-summary.js";
export type { ReviewSummary } from "./schemas/review-summary.js";

export { TriggerPaths } from "./lib/paths.js";
export { FileManager } from "./lib/file-manager.js";
export { StateMachine } from "./lib/state-machine.js";
export type { TaskStatus as TaskStatusLiteral, TransitionResult } from "./lib/state-machine.js";

export { PROJECT_TYPES } from "./defaults/project-types.js";
export type { ProjectTypeDefinition } from "./defaults/project-types.js";
export { DEFAULT_TEAM, DEFAULT_ACTIVATION_RULES, DEFAULT_ESCALATION } from "./defaults/team-defaults.js";
export { ProjectDetector } from "./lib/detector.js";
export type { DetectionResult } from "./lib/detector.js";

export { listReviewers } from "./commands/reviewers.js";
export type { ActivatedReviewer } from "./commands/reviewers.js";
