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
export declare function listTasks(projectRoot: string, milestoneId: string, phaseId: string): Promise<Array<{
    id: string;
    name: string;
    status: string;
    parallel_group?: string;
}>>;
export declare function setTaskFiles(projectRoot: string, milestoneId: string, phaseId: string, taskId: string, files: string[]): Promise<Task>;
//# sourceMappingURL=task.d.ts.map