import fs from "node:fs/promises";
import { TriggerPaths } from "../lib/paths.js";
import { FileManager } from "../lib/file-manager.js";
import { PhaseSchema, type Phase } from "../schemas/phase.js";
import { MilestoneSchema } from "../schemas/milestone.js";
import { getState, updateState } from "./state.js";

const fm = new FileManager();

export async function createPhase(
  projectRoot: string,
  milestoneId: string,
  options: {
    id: string;
    name: string;
    description?: string;
    domains?: string[];
    team_overrides?: Record<string, unknown>;
    batch_signoff?: boolean;
  },
): Promise<Phase> {
  const paths = new TriggerPaths(projectRoot);
  const now = new Date().toISOString();

  const data = PhaseSchema.parse({
    id: options.id,
    name: options.name,
    description: options.description,
    status: "planned",
    domains: options.domains ?? [],
    tasks: [],
    created_at: now,
    updated_at: now,
    team_overrides: options.team_overrides,
    batch_signoff: options.batch_signoff,
  });

  const phaseDir = paths.phaseDir(milestoneId, options.id);
  await fm.ensureDir(phaseDir);
  await fm.ensureDir(paths.tasksDir(milestoneId, options.id));
  await fm.ensureDir(paths.researchDir(milestoneId, options.id));
  await fm.writeJson(paths.phasePath(milestoneId, options.id), data);

  const milestone = await fm.readJson(
    paths.milestonePath(milestoneId),
    MilestoneSchema,
  );
  milestone.phases.push(options.id);
  milestone.updated_at = now;
  await fm.writeJson(paths.milestonePath(milestoneId), milestone);

  const state = await getState(projectRoot);
  if (state.active_phase === null) {
    await updateState(projectRoot, { active_phase: options.id });
  }

  return data;
}

export async function listPhases(
  projectRoot: string,
  milestoneId: string,
): Promise<Phase[]> {
  const paths = new TriggerPaths(projectRoot);
  const phasesDir = paths.phasesDir(milestoneId);

  if (!(await fm.exists(phasesDir))) {
    return [];
  }

  const entries = await fs.readdir(phasesDir, { withFileTypes: true });
  const phases: Phase[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pPath = paths.phasePath(milestoneId, entry.name);
    if (await fm.exists(pPath)) {
      phases.push(await fm.readJson(pPath, PhaseSchema));
    }
  }

  return phases;
}

export async function getPhaseStatus(
  projectRoot: string,
  milestoneId: string,
  phaseId: string,
): Promise<Phase> {
  const paths = new TriggerPaths(projectRoot);
  return fm.readJson(paths.phasePath(milestoneId, phaseId), PhaseSchema);
}

export async function advancePhase(
  projectRoot: string,
  milestoneId: string,
  phaseId: string,
  newStatus: "planned" | "in_progress" | "done",
): Promise<Phase> {
  const paths = new TriggerPaths(projectRoot);
  const phase = await fm.readJson(
    paths.phasePath(milestoneId, phaseId),
    PhaseSchema,
  );

  const validTransitions: Record<string, string[]> = {
    planned: ["in_progress"],
    in_progress: ["done"],
    done: [],
  };

  if (!validTransitions[phase.status]?.includes(newStatus)) {
    throw new Error(
      `Invalid phase transition: ${phase.status} → ${newStatus}. ` +
      `Valid transitions from "${phase.status}": ${validTransitions[phase.status]?.join(", ") || "none"}`,
    );
  }

  phase.status = newStatus;
  phase.updated_at = new Date().toISOString();
  await fm.writeJson(paths.phasePath(milestoneId, phaseId), phase);
  return phase;
}
