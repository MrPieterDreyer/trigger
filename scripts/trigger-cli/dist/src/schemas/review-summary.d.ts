import { z } from "zod";
export declare const ReviewSummarySchema: z.ZodObject<{
    task_id: z.ZodString;
    overall_verdict: z.ZodEnum<{
        approve: "approve";
        approve_with_changes: "approve_with_changes";
        request_changes: "request_changes";
    }>;
    reviewers_activated: z.ZodArray<z.ZodString>;
    findings: z.ZodDefault<z.ZodArray<z.ZodObject<{
        severity: z.ZodEnum<{
            P0: "P0";
            P1: "P1";
            P2: "P2";
            P3: "P3";
        }>;
        area: z.ZodString;
        finding: z.ZodString;
        recommendation: z.ZodString;
        reviewer: z.ZodString;
    }, z.core.$strip>>>;
    improvements: z.ZodDefault<z.ZodArray<z.ZodString>>;
    review_cycle: z.ZodDefault<z.ZodNumber>;
    completed_at: z.ZodString;
}, z.core.$strip>;
export type ReviewSummary = z.infer<typeof ReviewSummarySchema>;
//# sourceMappingURL=review-summary.d.ts.map