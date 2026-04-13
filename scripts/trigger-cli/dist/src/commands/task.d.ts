import { type Task } from "../schemas/task.js";
export declare function createTask(projectRoot: string, milestoneId: string, phaseId: string, options: {
    id: string;
    name: string;
    description?: string;
    acceptance_criteria?: string[];
    domains?: string[];
    test_requirements?: string[];
    parallel_group?: string;
}): Promise<Task>;
export declare function advanceTask(projectRoot: string, milestoneId: string, phaseId: string, taskId: string, newStatus: string): Promise<Task>;
export declare function getTaskStatus(projectRoot: string, milestoneId: string, phaseId: string, taskId: string): Promise<Task>;
//# sourceMappingURL=task.d.ts.map