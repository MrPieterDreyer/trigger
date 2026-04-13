import { type TriggerConfig } from "../schemas/trigger-config.js";
export declare function getConfig(projectRoot: string): Promise<TriggerConfig>;
export declare function updateConfig(projectRoot: string, updates: Record<string, unknown>): Promise<TriggerConfig>;
//# sourceMappingURL=config.d.ts.map