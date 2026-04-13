import type { DetectionResult } from "../lib/detector.js";
import { type TriggerConfig } from "../schemas/trigger-config.js";
export interface InitOptions {
    name: string;
    trust_level?: "supervised" | "balanced" | "autonomous";
    description?: string;
}
export declare function initProject(projectRoot: string, options: InitOptions): Promise<{
    config: TriggerConfig;
    detection: DetectionResult;
}>;
//# sourceMappingURL=init.d.ts.map