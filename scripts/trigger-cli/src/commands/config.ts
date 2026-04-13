import fs from "node:fs/promises";
import { TriggerPaths } from "../lib/paths.js";
import { FileManager } from "../lib/file-manager.js";
import { TriggerConfigSchema, type TriggerConfig } from "../schemas/trigger-config.js";

const fm = new FileManager();

export async function getConfig(projectRoot: string): Promise<TriggerConfig> {
  const paths = new TriggerPaths(projectRoot);
  return fm.readJson(paths.configPath, TriggerConfigSchema);
}

export interface UpgradeResult {
  config: TriggerConfig;
  added_sections: string[];
}

export async function upgradeConfig(
  projectRoot: string,
): Promise<UpgradeResult> {
  const paths = new TriggerPaths(projectRoot);
  const raw = JSON.parse(await fs.readFile(paths.configPath, "utf-8"));
  const validated = TriggerConfigSchema.parse(raw);

  const added: string[] = [];
  const topLevelDefaults = [
    "verification", "team", "activation_rules", "escalation",
    "parallelism", "reports", "guardian",
  ];
  for (const key of topLevelDefaults) {
    if (!(key in raw)) {
      added.push(key);
    }
  }

  await fm.writeJson(paths.configPath, validated);
  return { config: validated, added_sections: added };
}

export async function updateConfig(
  projectRoot: string,
  updates: Record<string, unknown>,
): Promise<TriggerConfig> {
  const paths = new TriggerPaths(projectRoot);
  const current = await fm.readJson(paths.configPath, TriggerConfigSchema);

  const merged = deepMerge(current as Record<string, unknown>, updates);
  const validated = TriggerConfigSchema.parse(merged);
  await fm.writeJson(paths.configPath, validated);

  return validated;
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = target[key];

    if (
      isPlainObject(sourceVal) &&
      isPlainObject(targetVal)
    ) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>,
      );
    } else {
      result[key] = sourceVal;
    }
  }

  return result;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
