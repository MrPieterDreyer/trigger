import fs from "node:fs/promises";
import { TriggerPaths } from "../lib/paths.js";
import { FileManager } from "../lib/file-manager.js";
import { TriggerConfigSchema } from "../schemas/trigger-config.js";
import { StateSchema } from "../schemas/state.js";
import { MilestoneSchema } from "../schemas/milestone.js";
import { PhaseSchema } from "../schemas/phase.js";
import { TaskSchema } from "../schemas/task.js";
const fm = new FileManager();
export async function validateProject(projectRoot) {
    const paths = new TriggerPaths(projectRoot);
    const errors = [];
    const warnings = [];
    if (!(await fm.exists(paths.planningRoot))) {
        return { valid: false, errors: [".trigger directory not found"], warnings };
    }
    let hasConfig = false;
    if (await fm.exists(paths.configPath)) {
        try {
            const raw = await fs.readFile(paths.configPath, "utf-8");
            TriggerConfigSchema.parse(JSON.parse(raw));
            hasConfig = true;
        }
        catch (err) {
            errors.push(`trigger.json validation failed: ${err.message}`);
        }
    }
    else {
        errors.push("trigger.json not found");
    }
    let state = null;
    if (await fm.exists(paths.statePath)) {
        try {
            const raw = await fs.readFile(paths.statePath, "utf-8");
            state = StateSchema.parse(JSON.parse(raw));
        }
        catch (err) {
            errors.push(`state.json validation failed: ${err.message}`);
        }
    }
    else {
        errors.push("state.json not found");
    }
    if (state) {
        if (state.active_milestone !== null) {
            if (!(await fm.exists(paths.milestonePath(state.active_milestone)))) {
                errors.push(`Active milestone "${state.active_milestone}" does not exist`);
            }
        }
        if (state.active_milestone !== null && state.active_phase !== null) {
            if (!(await fm.exists(paths.phasePath(state.active_milestone, state.active_phase)))) {
                errors.push(`Active phase "${state.active_phase}" does not exist under milestone "${state.active_milestone}"`);
            }
        }
        if (state.active_milestone !== null &&
            state.active_phase !== null &&
            state.active_task !== null) {
            if (!(await fm.exists(paths.taskPath(state.active_milestone, state.active_phase, state.active_task)))) {
                errors.push(`Active task "${state.active_task}" does not exist under phase "${state.active_phase}"`);
            }
        }
    }
    if (await fm.exists(paths.milestonesDir())) {
        const msDirs = await fs.readdir(paths.milestonesDir(), {
            withFileTypes: true,
        });
        for (const msEntry of msDirs) {
            if (!msEntry.isDirectory())
                continue;
            const msJsonPath = paths.milestonePath(msEntry.name);
            if (await fm.exists(msJsonPath)) {
                try {
                    const raw = await fs.readFile(msJsonPath, "utf-8");
                    MilestoneSchema.parse(JSON.parse(raw));
                }
                catch (err) {
                    errors.push(`Milestone "${msEntry.name}" milestone.json invalid: ${err.message}`);
                }
            }
            const pDir = paths.phasesDir(msEntry.name);
            if (!(await fm.exists(pDir)))
                continue;
            const phaseDirs = await fs.readdir(pDir, { withFileTypes: true });
            for (const phaseEntry of phaseDirs) {
                if (!phaseEntry.isDirectory())
                    continue;
                const phaseJsonPath = paths.phasePath(msEntry.name, phaseEntry.name);
                if (await fm.exists(phaseJsonPath)) {
                    try {
                        const raw = await fs.readFile(phaseJsonPath, "utf-8");
                        PhaseSchema.parse(JSON.parse(raw));
                    }
                    catch (err) {
                        errors.push(`Phase "${phaseEntry.name}" phase.json invalid: ${err.message}`);
                    }
                }
                const tDir = paths.tasksDir(msEntry.name, phaseEntry.name);
                if (!(await fm.exists(tDir)))
                    continue;
                const taskDirs = await fs.readdir(tDir, { withFileTypes: true });
                for (const taskEntry of taskDirs) {
                    if (!taskEntry.isDirectory())
                        continue;
                    const taskJsonPath = paths.taskPath(msEntry.name, phaseEntry.name, taskEntry.name);
                    if (await fm.exists(taskJsonPath)) {
                        try {
                            const raw = await fs.readFile(taskJsonPath, "utf-8");
                            TaskSchema.parse(JSON.parse(raw));
                        }
                        catch (err) {
                            errors.push(`Task "${taskEntry.name}" task.json invalid: ${err.message}`);
                        }
                    }
                }
            }
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
//# sourceMappingURL=validate.js.map