import { type Milestone } from "../schemas/milestone.js";
export declare function createMilestone(projectRoot: string, options: {
    id: string;
    name: string;
    description?: string;
    git_branching?: "none" | "per_phase" | "per_task";
}): Promise<Milestone>;
export declare function listMilestones(projectRoot: string): Promise<Milestone[]>;
export declare function getMilestoneStatus(projectRoot: string, milestoneId: string): Promise<Milestone>;
//# sourceMappingURL=milestone.d.ts.map