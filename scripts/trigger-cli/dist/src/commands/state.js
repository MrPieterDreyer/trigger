import { TriggerPaths } from "../lib/paths.js";
import { FileManager } from "../lib/file-manager.js";
import { StateSchema } from "../schemas/state.js";
const fm = new FileManager();
export async function getState(projectRoot) {
    const paths = new TriggerPaths(projectRoot);
    return fm.readJson(paths.statePath, StateSchema);
}
export async function updateState(projectRoot, updates) {
    const paths = new TriggerPaths(projectRoot);
    const current = await fm.readJson(paths.statePath, StateSchema);
    const merged = {
        ...current,
        ...updates,
        last_updated: new Date().toISOString(),
    };
    const validated = StateSchema.parse(merged);
    await fm.writeJson(paths.statePath, validated);
    return validated;
}
//# sourceMappingURL=state.js.map