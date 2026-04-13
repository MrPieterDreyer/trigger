import { TriggerPaths } from "../lib/paths.js";
import { FileManager } from "../lib/file-manager.js";
import { StateSchema } from "../schemas/state.js";
import { TriggerConfigSchema } from "../schemas/trigger-config.js";
import { MilestoneSchema } from "../schemas/milestone.js";
import { PhaseSchema } from "../schemas/phase.js";
import { TaskSchema } from "../schemas/task.js";

const fm = new FileManager();

export interface SummaryResult {
  project: string;
  trust: string;
  parallelism: { reviews: boolean; tasks: boolean; max_tasks: number };
  guardian: {
    auto_review: boolean;
    smart_escalation: boolean;
    review_threshold_files: number;
    review_threshold_lines: number;
    skip_patterns: string[];
  };
  milestone: { id: string; name: string; phases_total: number; phases_done: number } | null;
  phase: { id: string; name: string; status: string; tasks_total: number; tasks_done: number } | null;
  task: { id: string; name: string; status: string } | null;
  pipeline: string;
  verification_commands: number;
  recent_verdicts: Array<{ reviewer: string; verdict: string }>;
  artifacts: { builder_report: boolean; review_summary: boolean; qa_verification: boolean };
}

export async function getSummary(projectRoot: string): Promise<SummaryResult> {
  const paths = new TriggerPaths(projectRoot);

  const state = await fm.readJson(paths.statePath, StateSchema);
  const config = await fm.readJson(paths.configPath, TriggerConfigSchema);

  const result: SummaryResult = {
    project: config.project.name,
    trust: config.project.trust_level,
    parallelism: {
      reviews: config.parallelism.reviews,
      tasks: config.parallelism.tasks,
      max_tasks: config.parallelism.max_concurrent_tasks,
    },
    guardian: {
      auto_review: config.guardian.auto_review,
      smart_escalation: config.guardian.smart_escalation,
      review_threshold_files: config.guardian.review_threshold_files,
      review_threshold_lines: config.guardian.review_threshold_lines,
      skip_patterns: config.guardian.skip_patterns,
    },
    milestone: null,
    phase: null,
    task: null,
    pipeline: state.pipeline_stage,
    verification_commands: config.verification.commands.length,
    recent_verdicts: [],
    artifacts: { builder_report: false, review_summary: false, qa_verification: false },
  };

  if (state.active_milestone) {
    try {
      const ms = await fm.readJson(
        paths.milestonePath(state.active_milestone),
        MilestoneSchema,
      );
      let phasesDone = 0;
      for (const pid of ms.phases) {
        try {
          const p = await fm.readJson(
            paths.phasePath(state.active_milestone, pid),
            PhaseSchema,
          );
          if (p.status === "done") phasesDone++;
        } catch { /* skip unreadable */ }
      }
      result.milestone = {
        id: state.active_milestone,
        name: ms.name,
        phases_total: ms.phases.length,
        phases_done: phasesDone,
      };
    } catch { /* milestone unreadable */ }
  }

  if (state.active_milestone && state.active_phase) {
    try {
      const ph = await fm.readJson(
        paths.phasePath(state.active_milestone, state.active_phase),
        PhaseSchema,
      );
      let tasksDone = 0;
      for (const tid of ph.tasks) {
        try {
          const t = await fm.readJson(
            paths.taskPath(state.active_milestone, state.active_phase, tid),
            TaskSchema,
          );
          if (t.status === "done") tasksDone++;
        } catch { /* skip */ }
      }
      result.phase = {
        id: state.active_phase,
        name: ph.name,
        status: ph.status,
        tasks_total: ph.tasks.length,
        tasks_done: tasksDone,
      };
    } catch { /* phase unreadable */ }
  }

  if (state.active_milestone && state.active_phase && state.active_task) {
    try {
      const t = await fm.readJson(
        paths.taskPath(state.active_milestone, state.active_phase, state.active_task),
        TaskSchema,
      );
      result.task = {
        id: state.active_task,
        name: t.name,
        status: t.status,
      };

      result.recent_verdicts = t.review_verdicts.map((v) => ({
        reviewer: v.reviewer,
        verdict: v.verdict,
      }));

      result.artifacts.builder_report = await fm.exists(
        paths.builderReportPath(state.active_milestone, state.active_phase, state.active_task),
      );
      result.artifacts.review_summary = await fm.exists(
        paths.reviewSummaryPath(state.active_milestone, state.active_phase, state.active_task),
      );

      const qaPath = paths.reviewsDir(state.active_milestone, state.active_phase, state.active_task) + "/qa-verification.md";
      result.artifacts.qa_verification = await fm.exists(qaPath);
    } catch { /* task unreadable */ }
  }

  return result;
}
