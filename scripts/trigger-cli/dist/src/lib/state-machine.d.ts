export type TaskStatus = "planned" | "building" | "built" | "build_failed" | "reviewing" | "changes_requested" | "review_passed" | "qa_passed" | "signoff" | "done";
export type TransitionResult = {
    success: true;
    from: TaskStatus;
    to: TaskStatus;
    at: string;
} | {
    success: false;
    error: string;
};
export declare class StateMachine {
    canTransition(from: TaskStatus, to: TaskStatus): boolean;
    validTransitions(from: TaskStatus): TaskStatus[];
    transition(from: TaskStatus, to: TaskStatus): TransitionResult;
}
//# sourceMappingURL=state-machine.d.ts.map