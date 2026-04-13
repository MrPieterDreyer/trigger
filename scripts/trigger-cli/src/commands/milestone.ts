import fs from "node:fs/promises";
import { TriggerPaths } from "../lib/paths.js";
import { FileManager } from "../lib/file-manager.js";
import { MilestoneSchema, type Milestone } from "../schemas/milestone.js";
import { updateState, getState } from "./state.js";

const fm = new FileManager();

export async function createMilestone(
  projectRoot: string,
  options: {
    id: string;
    name: string;
    description?: string;
    git_branching?: "none" | "per_phase" | "per_task";
  },
): Promise<Milestone> {
  const paths = new TriggerPaths(projectRoot);

  if (await fm.exists(paths.milestoneDir(options.id))) {
    throw new Error(`Milestone "${options.id}" already exists`);
  }

  const now = new Date().toISOString();
  const data = MilestoneSchema.parse({
    id: options.id,
    name: options.name,
    description: options.description,
    status: "planned",
    phases: [],
    created_at: now,
    updated_at: now,
    git_branching: options.git_branching,
  });

  await fm.ensureDir(paths.milestoneDir(options.id));
  await fm.ensureDir(paths.phasesDir(options.id));
  await fm.writeJson(paths.milestonePath(options.id), data);

  const state = await getState(projectRoot);
  if (state.active_milestone === null) {
    await updateState(projectRoot, { active_milestone: options.id });
  }

  return data;
}

export async function listMilestones(projectRoot: string): Promise<Milestone[]> {
  const paths = new TriggerPaths(projectRoot);
  const msDir = paths.milestonesDir();

  if (!(await fm.exists(msDir))) {
    return [];
  }

  const entries = await fs.readdir(msDir, { withFileTypes: true });
  const milestones: Milestone[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const msPath = paths.milestonePath(entry.name);
    if (await fm.exists(msPath)) {
      milestones.push(await fm.readJson(msPath, MilestoneSchema));
    }
  }

  return milestones;
}

export async function getMilestoneStatus(
  projectRoot: string,
  milestoneId: string,
): Promise<Milestone> {
  const paths = new TriggerPaths(projectRoot);
  return fm.readJson(paths.milestonePath(milestoneId), MilestoneSchema);
}
