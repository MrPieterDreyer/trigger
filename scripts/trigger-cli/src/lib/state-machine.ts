export type TaskStatus =
  | "planned"
  | "building"
  | "built"
  | "build_failed"
  | "reviewing"
  | "changes_requested"
  | "review_passed"
  | "qa_passed"
  | "signoff"
  | "done";

const TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  planned: ["building"],
  building: ["built", "build_failed"],
  built: ["reviewing"],
  build_failed: ["building"],
  reviewing: ["review_passed", "changes_requested"],
  changes_requested: ["building"],
  review_passed: ["qa_passed"],
  qa_passed: ["signoff"],
  signoff: ["done", "changes_requested"],
  done: ["changes_requested"],
} as const;

export type TransitionResult =
  | { success: true; from: TaskStatus; to: TaskStatus; at: string }
  | { success: false; error: string };

export class StateMachine {
  canTransition(from: TaskStatus, to: TaskStatus): boolean {
    return TRANSITIONS[from].includes(to);
  }

  validTransitions(from: TaskStatus): TaskStatus[] {
    return [...TRANSITIONS[from]];
  }

  transition(from: TaskStatus, to: TaskStatus): TransitionResult {
    if (!this.canTransition(from, to)) {
      const valid = TRANSITIONS[from];
      const detail =
        valid.length === 0
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
