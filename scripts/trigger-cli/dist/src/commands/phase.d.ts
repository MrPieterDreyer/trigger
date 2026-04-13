import { type Phase } from "../schemas/phase.js";
export declare function createPhase(projectRoot: string, milestoneId: string, options: {
    id: string;
    name: string;
    description?: string;
    domains?: string[];
    team_overrides?: Record<string, unknown>;
    batch_signoff?: boolean;
}): Promise<Phase>;
export declare function listPhases(projectRoot: string, milestoneId: string): Promise<Phase[]>;
export declare function getPhaseStatus(projectRoot: string, milestoneId: string, phaseId: string): Promise<Phase>;
export declare function advancePhase(projectRoot: string, milestoneId: string, phaseId: string, newStatus: "planned" | "in_progress" | "done"): Promise<Phase>;
//# sourceMappingURL=phase.d.ts.map