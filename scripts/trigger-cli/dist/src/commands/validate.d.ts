export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare function validateProject(projectRoot: string): Promise<ValidationResult>;
//# sourceMappingURL=validate.d.ts.map