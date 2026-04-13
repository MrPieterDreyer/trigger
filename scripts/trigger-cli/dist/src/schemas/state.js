import { z } from "zod";
const PipelineStage = z.enum([
    "idle",
    "planning",
    "plan_review",
    "building",
    "build_failed",
    "reviewing",
    "changes_requested",
    "review_passed",
    "qa_verification",
    "signoff",
    "done",
]);
const SessionInfo = z.object({
    started_at: z.string(),
    trust_level: z.enum(["supervised", "balanced", "autonomous"]).optional(),
    notes: z.string().optional(),
});
export const StateSchema = z.object({
    active_milestone: z.string().nullable().default(null),
    active_phase: z.string().nullable().default(null),
    active_task: z.string().nullable().default(null),
    pipeline_stage: PipelineStage.default("idle"),
    last_updated: z.string(),
    paused_at: z.string().nullable().optional(),
    session: SessionInfo.optional(),
});
export { PipelineStage };
//# sourceMappingURL=state.js.map