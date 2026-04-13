import { TriggerPaths } from "../lib/paths.js";
import { FileManager } from "../lib/file-manager.js";
import { StateMachine } from "../lib/state-machine.js";
import { TaskSchema } from "../schemas/task.js";
import { PhaseSchema } from "../schemas/phase.js";
import { StateSchema } from "../schemas/state.js";
const fm = new FileManager();
const sm = new StateMachine();
export async function createTask(projectRoot, milestoneId, phaseId, options) {
    const paths = new TriggerPaths(projectRoot);
    const now = new Date().toISOString();
    const data = TaskSchema.parse({
        id: options.id,
        name: options.name,
        description: options.description,
        status: "planned",
        acceptance_criteria: options.acceptance_criteria ?? [],
        test_requirements: options.test_requirements,
        domains: options.domains ?? [],
        parallel_group: options.parallel_group,
        created_at: now,
        updated_at: now,
        history: [],
        model_usage: [],
        review_verdicts: [],
    });
    const taskJsonPath = paths.taskPath(milestoneId, phaseId, options.id);
    if (await fm.exists(taskJsonPath)) {
        throw new Error(`Task "${options.id}" already exists under phase "${phaseId}". Use a different ID.`);
    }
    const taskDir = paths.taskDir(milestoneId, phaseId, options.id);
    await fm.ensureDir(taskDir);
    await fm.ensureDir(paths.reviewsDir(milestoneId, phaseId, options.id));
    await fm.writeJson(taskJsonPath, data);
    const phase = await fm.readJson(paths.phasePath(milestoneId, phaseId), PhaseSchema);
    phase.tasks.push(options.id);
    phase.updated_at = now;
    await fm.writeJson(paths.phasePath(milestoneId, phaseId), phase);
    return data;
}
export async function advanceTask(projectRoot, milestoneId, phaseId, taskId, newStatus) {
    const paths = new TriggerPaths(projectRoot);
    const task = await fm.readJson(paths.taskPath(milestoneId, phaseId, taskId), TaskSchema);
    const result = sm.transition(task.status, newStatus);
    if (!result.success) {
        throw new Error(result.error);
    }
    task.history.push({
        from: result.from,
        to: result.to,
        at: result.at,
    });
    task.status = result.to;
    task.updated_at = new Date().toISOString();
    await fm.writeJson(paths.taskPath(milestoneId, phaseId, taskId), task);
    const pipelineMapping = {
        planned: "idle",
        building: "building",
        built: "reviewing",
        build_failed: "build_failed",
        reviewing: "reviewing",
        changes_requested: "changes_requested",
        review_passed: "qa_verification",
        qa_passed: "signoff",
        signoff: "signoff",
        done: "done",
    };
    const newPipelineStage = pipelineMapping[result.to] || "idle";
    try {
        const state = await fm.readJson(paths.statePath, StateSchema);
        state.pipeline_stage = newPipelineStage;
        state.last_updated = new Date().toISOString();
        await fm.writeJson(paths.statePath, state);
    }
    catch {
        // state.json may not exist in test scenarios; don't block task advance
    }
    return task;
}
export async function getTaskStatus(projectRoot, milestoneId, phaseId, taskId) {
    const paths = new TriggerPaths(projectRoot);
    return fm.readJson(paths.taskPath(milestoneId, phaseId, taskId), TaskSchema);
}
export async function listTasks(projectRoot, milestoneId, phaseId) {
    const paths = new TriggerPaths(projectRoot);
    const phase = await fm.readJson(paths.phasePath(milestoneId, phaseId), PhaseSchema);
    const tasks = [];
    for (const taskId of phase.tasks) {
        try {
            const task = await fm.readJson(paths.taskPath(milestoneId, phaseId, taskId), TaskSchema);
            tasks.push({
                id: task.id,
                name: task.name,
                status: task.status,
                parallel_group: task.parallel_group,
            });
        }
        catch {
            tasks.push({ id: taskId, name: "(unreadable)", status: "unknown" });
        }
    }
    return tasks;
}
export async function setTaskFiles(projectRoot, milestoneId, phaseId, taskId, files) {
    const paths = new TriggerPaths(projectRoot);
    const task = await fm.readJson(paths.taskPath(milestoneId, phaseId, taskId), TaskSchema);
    task.changed_files = files;
    task.updated_at = new Date().toISOString();
    await fm.writeJson(paths.taskPath(milestoneId, phaseId, taskId), task);
    return task;
}
//# sourceMappingURL=task.js.map