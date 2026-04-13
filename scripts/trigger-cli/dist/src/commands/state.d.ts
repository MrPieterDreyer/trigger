import { type State } from "../schemas/state.js";
export declare function getState(projectRoot: string): Promise<State>;
export declare function updateState(projectRoot: string, updates: Partial<State>): Promise<State>;
//# sourceMappingURL=state.d.ts.map