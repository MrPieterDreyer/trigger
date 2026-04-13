import { TriggerPaths } from "../lib/paths.js";
import { FileManager } from "../lib/file-manager.js";
import { StateMachine } from "../lib/state-machine.js";
import { TaskSchema } from "../schemas/task.js";
import { PhaseSchema } from "../schemas/phase.js";
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
    const taskDir = paths.taskDir(milestoneId, phaseId, options.id);
    await fm.ensureDir(taskDir);
    await fm.ensureDir(paths.reviewsDir(milestoneId, phaseId, options.id));
    await fm.writeJson(paths.taskPath(milestoneId, phaseId, options.id), data);
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
    return task;
}
export async function getTaskStatus(projectRoot, milestoneId, phaseId, taskId) {
    const paths = new TriggerPaths(projectRoot);
    return fm.readJson(paths.taskPath(milestoneId, phaseId, taskId), TaskSchema);
}
//# sourceMappingURL=task.js.map