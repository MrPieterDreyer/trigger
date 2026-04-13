import { TriggerPaths } from "../lib/paths.js";
import { FileManager } from "../lib/file-manager.js";
import { ProjectDetector } from "../lib/detector.js";
import type { DetectionResult } from "../lib/detector.js";
import { TriggerConfigSchema, type TriggerConfig } from "../schemas/trigger-config.js";
import { StateSchema, type State } from "../schemas/state.js";
import { DEFAULT_TEAM, DEFAULT_ACTIVATION_RULES, DEFAULT_ESCALATION, DEFAULT_GUARDIAN } from "../defaults/team-defaults.js";

export interface InitOptions {
  name: string;
  trust_level?: "supervised" | "balanced" | "autonomous";
  description?: string;
}

export async function initProject(
  projectRoot: string,
  options: InitOptions,
): Promise<{ config: TriggerConfig; detection: DetectionResult }> {
  const paths = new TriggerPaths(projectRoot);
  const fm = new FileManager();

  if (await fm.exists(paths.planningRoot)) {
    throw new Error("Project already initialized");
  }

  const detector = new ProjectDetector();
  const detection = await detector.detect(projectRoot);

  const configData = TriggerConfigSchema.parse({
    project: {
      name: options.name,
      type: detection.type,
      trust_level: options.trust_level ?? "balanced",
      description: options.description,
    },
    verification: {
      commands: detection.commands,
    },
    team: DEFAULT_TEAM,
    activation_rules: DEFAULT_ACTIVATION_RULES,
    escalation: DEFAULT_ESCALATION,
    guardian: DEFAULT_GUARDIAN,
  });

  const stateData = StateSchema.parse({
    active_milestone: null,
    active_phase: null,
    active_task: null,
    pipeline_stage: "idle",
    last_updated: new Date().toISOString(),
  });

  await fm.ensureDir(paths.planningRoot);
  await fm.writeJson(paths.configPath, configData);
  await fm.writeJson(paths.statePath, stateData);

  return { config: configData, detection };
}
