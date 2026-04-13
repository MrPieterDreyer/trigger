import { TriggerPaths } from "../lib/paths.js";
import { FileManager } from "../lib/file-manager.js";
import { TriggerConfigSchema } from "../schemas/trigger-config.js";
import { TaskSchema } from "../schemas/task.js";
import { minimatch } from "minimatch";
const fm = new FileManager();
const REVIEWER_MAP = {
    code_reviewer: { subagent_type: "code-reviewer", domain_keywords: [] },
    security_reviewer: { subagent_type: "security-reviewer", domain_keywords: ["security", "auth", "authentication"] },
    performance_reviewer: { subagent_type: "performance-reviewer", domain_keywords: ["performance", "optimization"] },
    accessibility_reviewer: { subagent_type: "accessibility-tester", domain_keywords: ["accessibility", "a11y", "wcag"] },
    database_reviewer: { subagent_type: "data-migrations-reviewer", domain_keywords: ["database", "migration", "schema"] },
    devops_reviewer: { subagent_type: "devops-engineer", domain_keywords: ["devops", "cicd", "deployment", "infrastructure"] },
};
export async function listReviewers(projectRoot, milestoneId, phaseId, taskId, changedFiles = []) {
    const paths = new TriggerPaths(projectRoot);
    const config = await fm.readJson(paths.configPath, TriggerConfigSchema);
    const task = await fm.readJson(paths.taskPath(milestoneId, phaseId, taskId), TaskSchema);
    const filesToCheck = changedFiles.length > 0 ? changedFiles : task.changed_files;
    const activated = [];
    for (const [role, meta] of Object.entries(REVIEWER_MAP)) {
        const teamConfig = config.team[role];
        if (!teamConfig)
            continue;
        if (teamConfig.enabled === false)
            continue;
        // Always-on: enabled is true, or always flag is set
        if (teamConfig.enabled === true || teamConfig.always) {
            activated.push({
                role,
                reason: "always",
                subagent_type: meta.subagent_type,
                model: teamConfig.model,
            });
            continue;
        }
        if (teamConfig.enabled === "auto") {
            // Check task domains
            const domainMatch = task.domains.find((d) => meta.domain_keywords.some((k) => d.toLowerCase().includes(k)));
            if (domainMatch) {
                activated.push({
                    role,
                    reason: `domain:${domainMatch}`,
                    subagent_type: meta.subagent_type,
                    model: teamConfig.model,
                });
                continue;
            }
            // Check file globs from activation_rules
            const rules = config.activation_rules[role];
            if (rules && filesToCheck.length > 0) {
                for (const glob of rules.globs) {
                    const matched = filesToCheck.find((f) => minimatch(f, glob));
                    if (matched) {
                        activated.push({
                            role,
                            reason: `glob:${glob} (matched ${matched})`,
                            subagent_type: meta.subagent_type,
                            model: teamConfig.model,
                        });
                        break;
                    }
                }
            }
        }
    }
    return activated;
}
//# sourceMappingURL=reviewers.js.map