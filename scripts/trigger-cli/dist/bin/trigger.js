#!/usr/bin/env node
import { Command } from "commander";
import { initProject } from "../src/commands/init.js";
import { getState, updateState } from "../src/commands/state.js";
import { getConfig, upgradeConfig, updateConfig } from "../src/commands/config.js";
import { createMilestone, listMilestones, getMilestoneStatus } from "../src/commands/milestone.js";
import { createPhase, listPhases, advancePhase } from "../src/commands/phase.js";
import { createTask, advanceTask, getTaskStatus, listTasks, setTaskFiles } from "../src/commands/task.js";
import { validateProject } from "../src/commands/validate.js";
import { getSummary } from "../src/commands/summary.js";
import { listReviewers } from "../src/commands/reviewers.js";
const program = new Command();
program
    .name("trigger")
    .description("Trigger — AI Product Team Framework CLI")
    .version("0.1.0");
program
    .command("init")
    .argument("<name>", "Project name")
    .option("--trust <level>", "Trust level: supervised, balanced, autonomous", "balanced")
    .option("--description <desc>", "Project description")
    .action(async (name, opts) => {
    try {
        const { config, detection } = await initProject(process.cwd(), {
            name,
            trust_level: opts.trust,
            description: opts.description,
        });
        console.log(JSON.stringify({ config, detection }, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
const stateCmd = program.command("state").description("Manage project state");
stateCmd
    .command("get")
    .description("Print current state as JSON")
    .action(async () => {
    try {
        const state = await getState(process.cwd());
        console.log(JSON.stringify(state, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
stateCmd
    .command("set")
    .argument("<key>", "Top-level state key")
    .argument("<value>", "Value to set")
    .description("Update a top-level state key")
    .action(async (key, value) => {
    try {
        let parsed = value;
        if (value === "null")
            parsed = null;
        else if (value === "true")
            parsed = true;
        else if (value === "false")
            parsed = false;
        else {
            try {
                parsed = JSON.parse(value);
            }
            catch {
                parsed = value;
            }
        }
        const state = await updateState(process.cwd(), { [key]: parsed });
        console.log(JSON.stringify(state, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
const configCmd = program.command("config").description("Manage project config");
configCmd
    .command("get")
    .description("Print current config as JSON")
    .action(async () => {
    try {
        const config = await getConfig(process.cwd());
        console.log(JSON.stringify(config, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
configCmd
    .command("set")
    .argument("<key>", "Dotted config key (e.g. project.trust_level, team.security_reviewer.enabled)")
    .argument("<value>", "Value to set (JSON-parsed: strings, numbers, booleans, objects)")
    .description("Update a config value using dotted key path")
    .action(async (key, value) => {
    try {
        let parsed = value;
        if (value === "null")
            parsed = null;
        else if (value === "true")
            parsed = true;
        else if (value === "false")
            parsed = false;
        else {
            try {
                parsed = JSON.parse(value);
            }
            catch {
                parsed = value;
            }
        }
        const updates = buildNestedObject(key, parsed);
        const config = await updateConfig(process.cwd(), updates);
        console.log(JSON.stringify(config, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
configCmd
    .command("upgrade")
    .description("Add missing config sections with defaults (safe for existing projects)")
    .action(async () => {
    try {
        const result = await upgradeConfig(process.cwd());
        if (result.added_sections.length === 0) {
            console.log(JSON.stringify({ status: "up_to_date", message: "Config already has all sections" }));
        }
        else {
            console.log(JSON.stringify({
                status: "upgraded",
                added_sections: result.added_sections,
                config: result.config,
            }, null, 2));
        }
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
// --- Milestone commands ---
const milestoneCmd = program.command("milestone").description("Manage milestones");
milestoneCmd
    .command("create")
    .argument("<id>", "Milestone ID")
    .argument("<name>", "Milestone name")
    .option("--description <desc>", "Milestone description")
    .option("--branching <strategy>", "Git branching strategy: none, per_phase, per_task")
    .action(async (id, name, opts) => {
    try {
        const milestone = await createMilestone(process.cwd(), {
            id,
            name,
            description: opts.description,
            git_branching: opts.branching,
        });
        console.log(JSON.stringify(milestone, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
milestoneCmd
    .command("list")
    .description("List all milestones")
    .action(async () => {
    try {
        const milestones = await listMilestones(process.cwd());
        console.log(JSON.stringify(milestones, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
milestoneCmd
    .command("status")
    .argument("<id>", "Milestone ID")
    .description("Get milestone status")
    .action(async (id) => {
    try {
        const milestone = await getMilestoneStatus(process.cwd(), id);
        console.log(JSON.stringify(milestone, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
// --- Phase commands ---
const phaseCmd = program.command("phase").description("Manage phases");
phaseCmd
    .command("create")
    .argument("<milestoneId>", "Parent milestone ID")
    .argument("<id>", "Phase ID")
    .argument("<name>", "Phase name")
    .option("--domains <domains>", "Comma-separated domains", (v) => v.split(","))
    .action(async (milestoneId, id, name, opts) => {
    try {
        const phase = await createPhase(process.cwd(), milestoneId, {
            id,
            name,
            domains: opts.domains,
        });
        console.log(JSON.stringify(phase, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
phaseCmd
    .command("list")
    .argument("<milestoneId>", "Parent milestone ID")
    .description("List phases under a milestone")
    .action(async (milestoneId) => {
    try {
        const phases = await listPhases(process.cwd(), milestoneId);
        console.log(JSON.stringify(phases, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
phaseCmd
    .command("advance")
    .argument("<milestoneId>", "Parent milestone ID")
    .argument("<phaseId>", "Phase ID")
    .argument("<newStatus>", "New phase status: planned, in_progress, done")
    .description("Advance a phase to a new status")
    .action(async (milestoneId, phaseId, newStatus) => {
    try {
        const phase = await advancePhase(process.cwd(), milestoneId, phaseId, newStatus);
        console.log(JSON.stringify(phase, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
// --- Task commands ---
const taskCmd = program.command("task").description("Manage tasks");
taskCmd
    .command("create")
    .argument("<milestoneId>", "Parent milestone ID")
    .argument("<phaseId>", "Parent phase ID")
    .argument("<id>", "Task ID")
    .argument("<name>", "Task name")
    .option("--criteria <criteria>", "Comma-separated acceptance criteria", (v) => v.split(","))
    .option("--domains <domains>", "Comma-separated domains", (v) => v.split(","))
    .option("--parallel-group <group>", "Parallel execution group (tasks in the same group run concurrently)")
    .action(async (milestoneId, phaseId, id, name, opts) => {
    try {
        const task = await createTask(process.cwd(), milestoneId, phaseId, {
            id,
            name,
            acceptance_criteria: opts.criteria,
            domains: opts.domains,
            parallel_group: opts.parallelGroup,
        });
        console.log(JSON.stringify(task, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
taskCmd
    .command("advance")
    .argument("<milestoneId>", "Parent milestone ID")
    .argument("<phaseId>", "Parent phase ID")
    .argument("<taskId>", "Task ID")
    .argument("<newStatus>", "New task status")
    .description("Advance a task to a new status")
    .action(async (milestoneId, phaseId, taskId, newStatus) => {
    try {
        const task = await advanceTask(process.cwd(), milestoneId, phaseId, taskId, newStatus);
        console.log(JSON.stringify(task, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
taskCmd
    .command("status")
    .argument("<milestoneId>", "Parent milestone ID")
    .argument("<phaseId>", "Parent phase ID")
    .argument("<taskId>", "Task ID")
    .description("Get task status")
    .action(async (milestoneId, phaseId, taskId) => {
    try {
        const task = await getTaskStatus(process.cwd(), milestoneId, phaseId, taskId);
        console.log(JSON.stringify(task, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
taskCmd
    .command("list")
    .argument("<milestoneId>", "Parent milestone ID")
    .argument("<phaseId>", "Parent phase ID")
    .description("List all tasks in a phase")
    .action(async (milestoneId, phaseId) => {
    try {
        const tasks = await listTasks(process.cwd(), milestoneId, phaseId);
        console.log(JSON.stringify(tasks, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
taskCmd
    .command("set-files")
    .argument("<milestoneId>", "Parent milestone ID")
    .argument("<phaseId>", "Parent phase ID")
    .argument("<taskId>", "Task ID")
    .argument("<files...>", "Changed file paths")
    .description("Record which files were changed by a task")
    .action(async (milestoneId, phaseId, taskId, files) => {
    try {
        const task = await setTaskFiles(process.cwd(), milestoneId, phaseId, taskId, files);
        console.log(JSON.stringify({ id: task.id, changed_files: task.changed_files }, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
// --- Reviewers command ---
const reviewersCmd = program.command("reviewers").description("Reviewer activation");
reviewersCmd
    .command("list")
    .argument("<milestoneId>", "Parent milestone ID")
    .argument("<phaseId>", "Parent phase ID")
    .argument("<taskId>", "Task ID")
    .option("--files <files...>", "Changed file paths to check against activation rules")
    .description("List activated reviewers for a task based on config, domains, and file globs")
    .action(async (milestoneId, phaseId, taskId, opts) => {
    try {
        const reviewers = await listReviewers(process.cwd(), milestoneId, phaseId, taskId, opts.files);
        console.log(JSON.stringify(reviewers, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
// --- Summary command ---
program
    .command("summary")
    .description("Compact dashboard of active milestone, phase, task, and settings")
    .action(async () => {
    try {
        const summary = await getSummary(process.cwd());
        console.log(JSON.stringify(summary, null, 2));
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
// --- Validate command ---
program
    .command("validate")
    .description("Validate project structure and configuration")
    .action(async () => {
    try {
        const result = await validateProject(process.cwd());
        console.log(JSON.stringify(result, null, 2));
        if (!result.valid) {
            process.exit(1);
        }
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
});
function buildNestedObject(dottedKey, value) {
    const keys = dottedKey.split(".");
    const result = {};
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    return result;
}
program.parse();
//# sourceMappingURL=trigger.js.map