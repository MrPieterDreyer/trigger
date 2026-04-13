import fs from "node:fs/promises";
import { TriggerPaths } from "../lib/paths.js";
import { FileManager } from "../lib/file-manager.js";
import { TriggerConfigSchema } from "../schemas/trigger-config.js";
const fm = new FileManager();
export async function getConfig(projectRoot) {
    const paths = new TriggerPaths(projectRoot);
    return fm.readJson(paths.configPath, TriggerConfigSchema);
}
export async function upgradeConfig(projectRoot) {
    const paths = new TriggerPaths(projectRoot);
    const raw = JSON.parse(await fs.readFile(paths.configPath, "utf-8"));
    const validated = TriggerConfigSchema.parse(raw);
    const added = [];
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
export async function updateConfig(projectRoot, updates) {
    const paths = new TriggerPaths(projectRoot);
    const current = await fm.readJson(paths.configPath, TriggerConfigSchema);
    const merged = deepMerge(current, updates);
    const validated = TriggerConfigSchema.parse(merged);
    await fm.writeJson(paths.configPath, validated);
    return validated;
}
function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        const sourceVal = source[key];
        const targetVal = target[key];
        if (isPlainObject(sourceVal) &&
            isPlainObject(targetVal)) {
            result[key] = deepMerge(targetVal, sourceVal);
        }
        else {
            result[key] = sourceVal;
        }
    }
    return result;
}
function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
//# sourceMappingURL=config.js.map