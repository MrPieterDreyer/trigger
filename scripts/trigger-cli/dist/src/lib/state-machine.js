const TRANSITIONS = {
    planned: ["building"],
    building: ["built", "build_failed"],
    built: ["reviewing"],
    build_failed: ["building"],
    reviewing: ["review_passed", "changes_requested"],
    changes_requested: ["building"],
    review_passed: ["signoff"],
    signoff: ["done", "changes_requested"],
    done: [],
};
export class StateMachine {
    canTransition(from, to) {
        return TRANSITIONS[from].includes(to);
    }
    validTransitions(from) {
        return [...TRANSITIONS[from]];
    }
    transition(from, to) {
        if (!this.canTransition(from, to)) {
            const valid = TRANSITIONS[from];
            const detail = valid.length === 0
                ? `"${from}" is a terminal state with no valid transitions`
                : `Valid transitions from "${from}": ${valid.join(", ")}`;
            return {
                success: false,
                error: `Invalid transition: ${from} \u2192 ${to}. ${detail}`,
            };
        }
        return {
            success: true,
            from,
            to,
            at: new Date().toISOString(),
        };
    }
}
//# sourceMappingURL=state-machine.js.map