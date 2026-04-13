import { describe, it, expect } from "vitest";
import { StateMachine } from "../../src/lib/state-machine.js";
import type { TaskStatus } from "../../src/lib/state-machine.js";

describe("StateMachine", () => {
  const sm = new StateMachine();

  describe("canTransition", () => {
    it("allows planned → building", () => {
      expect(sm.canTransition("planned", "building")).toBe(true);
    });

    it("allows building → built", () => {
      expect(sm.canTransition("building", "built")).toBe(true);
    });

    it("allows building → build_failed", () => {
      expect(sm.canTransition("building", "build_failed")).toBe(true);
    });

    it("allows built → reviewing", () => {
      expect(sm.canTransition("built", "reviewing")).toBe(true);
    });

    it("allows build_failed → building (retry)", () => {
      expect(sm.canTransition("build_failed", "building")).toBe(true);
    });

    it("allows reviewing → review_passed", () => {
      expect(sm.canTransition("reviewing", "review_passed")).toBe(true);
    });

    it("allows reviewing → changes_requested", () => {
      expect(sm.canTransition("reviewing", "changes_requested")).toBe(true);
    });

    it("allows changes_requested → building", () => {
      expect(sm.canTransition("changes_requested", "building")).toBe(true);
    });

    it("allows review_passed → signoff", () => {
      expect(sm.canTransition("review_passed", "signoff")).toBe(true);
    });

    it("allows signoff → done", () => {
      expect(sm.canTransition("signoff", "done")).toBe(true);
    });

    it("allows signoff → changes_requested", () => {
      expect(sm.canTransition("signoff", "changes_requested")).toBe(true);
    });

    it("rejects planned → reviewing (skip)", () => {
      expect(sm.canTransition("planned", "reviewing")).toBe(false);
    });

    it("rejects done → building (terminal state)", () => {
      expect(sm.canTransition("done", "building")).toBe(false);
    });

    it("rejects done → planned (terminal state)", () => {
      expect(sm.canTransition("done", "planned")).toBe(false);
    });

    it("rejects building → reviewing (must go through built)", () => {
      expect(sm.canTransition("building", "reviewing")).toBe(false);
    });

    it("rejects self-transitions", () => {
      expect(sm.canTransition("building", "building")).toBe(false);
    });
  });

  describe("validTransitions", () => {
    it("returns ['building'] for planned", () => {
      expect(sm.validTransitions("planned")).toEqual(["building"]);
    });

    it("returns ['built', 'build_failed'] for building", () => {
      expect(sm.validTransitions("building")).toEqual(["built", "build_failed"]);
    });

    it("returns ['reviewing'] for built", () => {
      const valid = sm.validTransitions("built");
      expect(valid).toContain("reviewing");
      expect(valid).not.toContain("planned");
    });

    it("returns empty array for done (terminal)", () => {
      expect(sm.validTransitions("done")).toEqual([]);
    });

    it("returns ['done', 'changes_requested'] for signoff", () => {
      expect(sm.validTransitions("signoff")).toEqual(["done", "changes_requested"]);
    });
  });

  describe("transition", () => {
    it("returns success with timestamp for valid transition", () => {
      const result = sm.transition("planned", "building");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.from).toBe("planned");
        expect(result.to).toBe("building");
        expect(result.at).toBeTruthy();
        expect(() => new Date(result.at)).not.toThrow();
      }
    });

    it("returns ISO 8601 timestamp", () => {
      const result = sm.transition("building", "built");
      if (result.success) {
        expect(result.at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      }
    });

    it("returns error message for invalid transition", () => {
      const result = sm.transition("planned", "reviewing");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid transition");
        expect(result.error).toContain("planned");
        expect(result.error).toContain("reviewing");
        expect(result.error).toContain("building");
      }
    });

    it("includes valid targets in error message", () => {
      const result = sm.transition("reviewing", "done");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("review_passed");
        expect(result.error).toContain("changes_requested");
      }
    });

    it("returns error for transitions from done", () => {
      const result = sm.transition("done", "building");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("done");
        expect(result.error).toContain("terminal");
      }
    });
  });

  describe("re-review loop", () => {
    it("supports changes_requested → building → built → reviewing", () => {
      const steps: [TaskStatus, TaskStatus][] = [
        ["changes_requested", "building"],
        ["building", "built"],
        ["built", "reviewing"],
      ];

      for (const [from, to] of steps) {
        const result = sm.transition(from, to);
        expect(result.success, `${from} → ${to} should succeed`).toBe(true);
      }
    });

    it("supports full lifecycle from planned to done", () => {
      const lifecycle: TaskStatus[] = [
        "planned", "building", "built", "reviewing",
        "review_passed", "signoff", "done",
      ];

      for (let i = 0; i < lifecycle.length - 1; i++) {
        expect(
          sm.canTransition(lifecycle[i], lifecycle[i + 1]),
          `${lifecycle[i]} → ${lifecycle[i + 1]}`,
        ).toBe(true);
      }
    });
  });
});
