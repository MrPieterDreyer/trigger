import { z } from "zod";

const Severity = z.enum(["P0", "P1", "P2", "P3"]);

const Finding = z.object({
  severity: Severity,
  area: z.string(),
  finding: z.string(),
  recommendation: z.string(),
  reviewer: z.string(),
});

export const ReviewSummarySchema = z.object({
  task_id: z.string(),
  overall_verdict: z.enum(["approve", "approve_with_changes", "request_changes"]),
  reviewers_activated: z.array(z.string()),
  findings: z.array(Finding).default([]),
  improvements: z.array(z.string()).default([]),
  review_cycle: z.number().int().min(1).default(1),
  completed_at: z.string(),
});

export type ReviewSummary = z.infer<typeof ReviewSummarySchema>;
